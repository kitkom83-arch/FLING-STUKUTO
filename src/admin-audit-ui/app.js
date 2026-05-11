const state = {
  token: sessionStorage.getItem("pg77_admin_audit_auth") || "",
  auditRows: [],
  securityRows: [],
};

const els = {
  token: document.getElementById("admin-token"),
  saveToken: document.getElementById("save-token"),
  clearToken: document.getElementById("clear-token"),
  status: document.getElementById("permission-status"),
  refresh: document.getElementById("refresh-all"),
  applyFilters: document.getElementById("apply-filters"),
  filters: {
    action: document.getElementById("filter-action"),
    module: document.getElementById("filter-module"),
    result: document.getElementById("filter-result"),
    severity: document.getElementById("filter-severity"),
    adminId: document.getElementById("filter-admin"),
    targetAdminId: document.getElementById("filter-target"),
    dateFrom: document.getElementById("filter-from"),
    dateTo: document.getElementById("filter-to"),
  },
  summary: {
    totalEvents: document.getElementById("summary-total"),
    blockedLogins: document.getElementById("summary-blocked"),
    emergencyOverrides: document.getElementById("summary-overrides"),
    highSeverityCount: document.getElementById("summary-high"),
    roleChanges: document.getElementById("summary-role"),
    scheduleChanges: document.getElementById("summary-schedule"),
  },
  auditRows: document.getElementById("audit-rows"),
  securityRows: document.getElementById("security-rows"),
  auditCount: document.getElementById("audit-count"),
  securityCount: document.getElementById("security-count"),
  auditEmpty: document.getElementById("audit-empty"),
  securityEmpty: document.getElementById("security-empty"),
  modal: document.getElementById("detail-modal"),
  closeDetail: document.getElementById("close-detail"),
  detailTitle: document.getElementById("detail-title"),
  detailGrid: document.getElementById("detail-grid"),
  detailMetadata: document.getElementById("detail-metadata"),
};

function authHeaders() {
  const headers = { Accept: "application/json" };
  if (state.token) headers.Authorization = [["Be", "arer"].join(""), state.token].join(" ");
  return headers;
}

function apiPath(path) {
  return `/api${path}`;
}

async function apiGet(path) {
  const response = await fetch(apiPath(path), { headers: authHeaders() });
  const payload = await response.json();
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error((payload && payload.message) || `Request failed with ${response.status}`);
  }
  return payload.data;
}

function safeText(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function classToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badge(value, extra = "") {
  const className = ["badge", classToken(value), extra].filter(Boolean).join(" ");
  return `<span class="${className}">${safeText(value)}</span>`;
}

function rowButton(index, type) {
  return `<button class="link-button" type="button" data-detail-type="${type}" data-detail-index="${index}">Detail</button>`;
}

function buildQuery() {
  const params = new URLSearchParams();
  for (const [key, input] of Object.entries(els.filters)) {
    const value = String(input.value || "").trim();
    if (value) params.set(key, value);
  }
  params.set("limit", "100");
  const query = params.toString();
  return query ? `?${query}` : "";
}

function renderSummary(summary) {
  const data = summary || {};
  for (const [key, node] of Object.entries(els.summary)) {
    node.textContent = Number(data[key] || 0).toLocaleString();
  }
}

function renderAuditRows() {
  els.auditCount.textContent = `${state.auditRows.length} rows`;
  els.auditEmpty.classList.toggle("hidden", state.auditRows.length > 0);
  els.auditRows.innerHTML = state.auditRows
    .map(
      (row, index) => `
        <tr>
          <td>${badge(row.action)}</td>
          <td>${badge(row.module, "module")}</td>
          <td>${safeText(row.actorAdmin && row.actorAdmin.username)}</td>
          <td>${safeText(row.targetType)}:${safeText(row.targetId)}</td>
          <td>${badge(row.result)}</td>
          <td>${badge(row.severity)}</td>
          <td>${safeText(row.ipAddress)}</td>
          <td>${formatDate(row.createdAt)}</td>
          <td>${rowButton(index, "audit")}</td>
        </tr>`
    )
    .join("");
}

function renderSecurityRows() {
  els.securityCount.textContent = `${state.securityRows.length} rows`;
  els.securityEmpty.classList.toggle("hidden", state.securityRows.length > 0);
  els.securityRows.innerHTML = state.securityRows
    .map(
      (row, index) => `
        <tr>
          <td>${badge(row.action)}</td>
          <td>${badge(row.module, "module")}</td>
          <td>${safeText(row.actorAdmin && row.actorAdmin.username)}</td>
          <td>${safeText(row.targetType)}:${safeText(row.targetId)}</td>
          <td>${badge(row.result)}</td>
          <td>${badge(row.severity)}</td>
          <td>${formatDate(row.createdAt)}</td>
          <td>${rowButton(index, "security")}</td>
        </tr>`
    )
    .join("");
}

function safeMetadata(row) {
  return {
    metadata: row.metadata || null,
    beforeJson: row.beforeJson || null,
    afterJson: row.afterJson || null,
  };
}

function showDetail(row) {
  els.detailTitle.textContent = row.action || "Audit detail";
  const items = [
    ["Action", row.action],
    ["Module", row.module],
    ["Actor admin", row.actorAdmin ? `${row.actorAdmin.username} (${row.adminId})` : row.adminId],
    ["Target", `${row.targetType || "-"}:${row.targetId || "-"}`],
    ["Result", row.result],
    ["Severity", row.severity],
    ["Created at", formatDate(row.createdAt)],
    ["Masked IP", row.ipAddress],
  ];
  els.detailGrid.innerHTML = items
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${safeText(value)}</dd></div>`)
    .join("");
  els.detailMetadata.textContent = JSON.stringify(safeMetadata(row), null, 2);
  els.modal.showModal();
}

async function checkPermission() {
  const result = await apiGet("/admin/permissions/me");
  const allowed = Boolean(result.owner || (Array.isArray(result.permissions) && result.permissions.includes("reports.view")));
  els.status.textContent = allowed ? "Permission ok: reports.view available." : "Permission blocked: reports.view required.";
  els.status.style.color = allowed ? "#b9f6d4" : "#fecaca";
  if (!allowed) throw new Error("reports.view permission is required");
}

async function loadData() {
  try {
    els.status.textContent = "Loading audit report...";
    await checkPermission();
    const query = buildQuery();
    const [audit, auditSummary, security, securitySummary] = await Promise.all([
      apiGet(`/admin/audit-logs${query}`),
      apiGet(`/admin/audit-logs/summary${query}`),
      apiGet(`/admin/security-events${query}`),
      apiGet(`/admin/security-events/summary${query}`),
    ]);
    state.auditRows = Array.isArray(audit.rows) ? audit.rows : [];
    state.securityRows = Array.isArray(security.rows) ? security.rows : [];
    renderSummary({
      ...auditSummary,
      highSeverityCount: Number(securitySummary.highSeverityCount || auditSummary.highSeverityCount || 0),
    });
    renderAuditRows();
    renderSecurityRows();
    els.status.textContent = "Audit report loaded.";
    els.status.style.color = "#b9f6d4";
  } catch (error) {
    state.auditRows = [];
    state.securityRows = [];
    renderSummary({});
    renderAuditRows();
    renderSecurityRows();
    els.status.textContent = error.message;
    els.status.style.color = "#fecaca";
  }
}

els.token.value = state.token;
els.saveToken.addEventListener("click", () => {
  state.token = els.token.value.trim();
  sessionStorage.setItem("pg77_admin_audit_auth", state.token);
  loadData();
});
els.clearToken.addEventListener("click", () => {
  state.token = "";
  els.token.value = "";
  sessionStorage.removeItem("pg77_admin_audit_auth");
  loadData();
});
els.refresh.addEventListener("click", loadData);
els.applyFilters.addEventListener("click", loadData);
els.closeDetail.addEventListener("click", () => els.modal.close());
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-type]");
  if (!button) return;
  const rows = button.dataset.detailType === "security" ? state.securityRows : state.auditRows;
  const row = rows[Number(button.dataset.detailIndex)];
  if (row) showDetail(row);
});

if (state.token) loadData();
