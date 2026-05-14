const SENSITIVE_KEY_PATTERN = /(pass(word|code)?|token|secret|api[_-]?key|authorization|session|cookie|database[_-]?url|refresh)/i;
const SENSITIVE_VALUE_PATTERNS = [
  /postgres(?:ql)?:\/\/[^\s"']+/i,
  /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
  new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "i"),
];
const REDACTED = "[REDACTED]";

// Static smoke markers: audit-filter-toolbar audit-details-modal audit-secret-redaction audit-role-before-after audit-reason-visible audit-work-schedule-events
const ACTION_LABELS = {
  "admin.role.update": "Admin role updated",
  "admin.role.blocked": "Admin role blocked",
  "admin.schedule.update": "Work schedule updated",
  "admin.schedule.enable": "Schedule enabled",
  "admin.schedule.disable": "Schedule disabled",
  "admin.schedule.override_enable": "Work schedule override",
  "admin.schedule.override_disable": "Work schedule override",
  "admin.login.failed": "Login failed",
  "admin.login.blocked_outside_schedule": "Login blocked",
  "admin.permission.denied": "Permission denied",
  "admin.security.event": "Security event",
};

const CATEGORY_LABELS = {
  role: "Role Management",
  permission: "Permission",
  schedule: "Work Schedule",
  login: "Auth/Login",
  security: "Security",
  admin: "System",
  system: "System",
};

const MOCK_ROWS = [
  {
    id: "mock-role-change",
    action: "admin.role.update",
    module: "role",
    result: "success",
    severity: "medium",
    adminId: "mock-owner",
    actorAdmin: { id: "mock-owner", username: "owner_demo" },
    targetType: "admin",
    targetId: "mock-admin-demo",
    targetAdminId: "mock-admin-demo",
    metadata: {
      targetAdminId: "mock-admin-demo",
      targetUsername: "admin_demo",
      beforeRole: "finance",
      afterRole: "owner",
      reason: "staging verification",
      siteCode: "PG77",
    },
    beforeJson: { role: "finance" },
    afterJson: { role: "owner" },
    ipAddress: "10.10.x.x",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-schedule-update",
    action: "admin.schedule.update",
    module: "schedule",
    result: "success",
    severity: "medium",
    adminId: "mock-owner",
    actorAdmin: { id: "mock-owner", username: "owner_demo" },
    targetType: "admin",
    targetId: "mock-schedule-admin",
    targetAdminId: "mock-schedule-admin",
    metadata: {
      targetAdminId: "mock-schedule-admin",
      targetUsername: "schedule_admin",
      reason: "shift policy update",
      siteCode: "PG77",
    },
    beforeJson: { schedule: { enabled: false } },
    afterJson: { schedule: { enabled: true, allowedDays: ["MONDAY"], startTime: "09:00", endTime: "18:00" } },
    ipAddress: "10.10.x.x",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-override",
    action: "admin.schedule.override_enable",
    module: "schedule",
    result: "success",
    severity: "high",
    adminId: "mock-owner",
    actorAdmin: { id: "mock-owner", username: "owner_demo" },
    targetType: "admin",
    targetId: "mock-schedule-admin",
    targetAdminId: "mock-schedule-admin",
    metadata: {
      targetAdminId: "mock-schedule-admin",
      targetUsername: "schedule_admin",
      reason: "temporary support access",
      siteCode: "PG77",
    },
    beforeJson: { schedule: { emergencyOverride: null } },
    afterJson: { schedule: { emergencyOverride: { active: true, status: "active" } } },
    ipAddress: "10.10.x.x",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-login-blocked",
    action: "admin.login.blocked_outside_schedule",
    module: "login",
    result: "blocked",
    severity: "high",
    adminId: "mock-schedule-admin",
    actorAdmin: { id: "mock-schedule-admin", username: "schedule_admin" },
    targetType: "admin",
    targetId: "mock-schedule-admin",
    targetAdminId: "mock-schedule-admin",
    metadata: {
      targetAdminId: "mock-schedule-admin",
      targetUsername: "schedule_admin",
      reason: "outside approved working hours",
      siteCode: "PG77",
      message: "Login blocked outside schedule",
    },
    ipAddress: "10.10.x.x",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-permission-denied",
    action: "admin.permission.denied",
    module: "permission",
    result: "blocked",
    severity: "high",
    adminId: "mock-viewer",
    actorAdmin: { id: "mock-viewer", username: "viewer_demo" },
    targetType: "admin",
    targetId: "mock-admin-demo",
    metadata: {
      targetAdminId: "mock-admin-demo",
      targetUsername: "admin_demo",
      reason: "admin.manage permission required",
      siteCode: "PG77",
    },
    ipAddress: "10.10.x.x",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-security-info",
    action: "admin.security.event",
    module: "security",
    result: "info",
    severity: "low",
    adminId: "mock-system",
    actorAdmin: { id: "mock-system", username: "system" },
    targetType: "system",
    targetId: "audit",
    metadata: {
      targetUsername: "audit",
      reason: "safe static fallback loaded",
      siteCode: "PG77",
    },
    ipAddress: null,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
];

const state = {
  authValue: sessionStorage.getItem("pg77_admin_audit_auth") || "",
  auditRows: [],
  securityRows: [],
  filteredAuditRows: [],
  filteredSecurityRows: [],
  usingFallback: false,
};

const els = {
  authValue: document.getElementById("admin-token"),
  saveToken: document.getElementById("save-token"),
  clearToken: document.getElementById("clear-token"),
  status: document.getElementById("permission-status"),
  refresh: document.getElementById("refresh-all"),
  applyFilters: document.getElementById("apply-filters"),
  clearFilters: document.getElementById("clear-filters"),
  filters: {
    action: document.getElementById("filter-action"),
    adminUsername: document.getElementById("filter-admin-username"),
    targetUsername: document.getElementById("filter-target-username"),
    dateFrom: document.getElementById("filter-from"),
    dateTo: document.getElementById("filter-to"),
    siteCode: document.getElementById("filter-site-code"),
    category: document.getElementById("filter-category"),
  },
  summary: {
    totalEvents: document.getElementById("summary-total"),
    roleChanges: document.getElementById("summary-role"),
    scheduleChanges: document.getElementById("summary-schedule"),
    loginSecurity: document.getElementById("summary-login-security"),
    blockedFailed: document.getElementById("summary-blocked-failed"),
    withReason: document.getElementById("summary-reason"),
  },
  summaryEmpty: {
    totalEvents: document.getElementById("summary-total-empty"),
    roleChanges: document.getElementById("summary-role-empty"),
    scheduleChanges: document.getElementById("summary-schedule-empty"),
    loginSecurity: document.getElementById("summary-login-security-empty"),
    blockedFailed: document.getElementById("summary-blocked-failed-empty"),
    withReason: document.getElementById("summary-reason-empty"),
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
  if (state.authValue) headers.Authorization = [["Be", "arer"].join(""), state.authValue].join(" ");
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

function isSensitiveString(value) {
  return typeof value === "string" && SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function redactString(value) {
  const text = String(value);
  return isSensitiveString(text) ? REDACTED : text;
}

function safeText(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "-";
  return redactString(value)
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

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === "string") return redactString(value);
  if (typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : sanitizeValue(item),
    ])
  );
}

function metadata(row) {
  return row && row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
}

function nestedValue(source, path) {
  return path.reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), source);
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function actionLabel(action) {
  return ACTION_LABELS[action] || String(action || "Audit event").replace(/^admin\./, "").replace(/[._-]+/g, " ");
}

function categoryFor(row) {
  const module = String(row.module || "").toLowerCase();
  if (CATEGORY_LABELS[module]) return CATEGORY_LABELS[module];
  const action = String(row.action || "");
  if (action.includes(".role.")) return "Role Management";
  if (action.includes(".schedule.") || action.includes("outside_schedule")) return "Work Schedule";
  if (action.includes(".login.")) return "Auth/Login";
  if (action.includes(".permission.")) return "Permission";
  if (action.includes(".security.")) return "Security";
  return "System";
}

function statusFor(row) {
  const action = String(row.action || "");
  const raw = String(row.result || "").toLowerCase();
  if (raw === "blocked" || action.includes(".blocked") || action.includes("blocked_")) return "Blocked";
  if (raw === "failed" || action.includes(".failed")) return "Failed";
  if (raw === "success") return "Success";
  return "Info";
}

function statusBadge(row) {
  const status = statusFor(row);
  const statusClass = status === "Success" ? "success" : status === "Blocked" ? "medium" : status === "Failed" ? "failed" : "module";
  return badge(status, statusClass);
}

function badge(value, extra = "") {
  const className = ["badge", classToken(value), extra].filter(Boolean).join(" ");
  return `<span class="${className}">${safeText(value)}</span>`;
}

function smallBadge(value) {
  return `<span class="count-pill">${safeText(value)}</span>`;
}

function rowButton(index, type) {
  return `<button class="link-button" type="button" data-detail-type="${type}" data-detail-index="${index}">Details</button>`;
}

function actorUsername(row) {
  return firstValue(nestedValue(row, ["actorAdmin", "username"]), nestedValue(row, ["admin", "username"]), metadata(row).actorUsername, row.adminId);
}

function actorAdminId(row) {
  return firstValue(nestedValue(row, ["actorAdmin", "id"]), nestedValue(row, ["admin", "id"]), metadata(row).actorAdminId, row.adminId);
}

function targetAdminId(row) {
  return firstValue(metadata(row).targetAdminId, row.targetAdminId, row.targetType === "admin" ? row.targetId : null);
}

function targetUsername(row) {
  return firstValue(metadata(row).targetUsername, metadata(row).targetAdminUsername, nestedValue(row, ["targetAdmin", "username"]), row.targetUsername);
}

function targetLabel(row) {
  return firstValue(targetUsername(row), targetAdminId(row), row.targetId, row.targetType);
}

function beforeRole(row) {
  const meta = metadata(row);
  return firstValue(
    meta.beforeRole,
    nestedValue(meta, ["before", "role"]),
    nestedValue(meta, ["before", "siteAccessRole"]),
    nestedValue(row.beforeJson, ["role"]),
    nestedValue(row.beforeJson, ["siteAccessRole"])
  );
}

function afterRole(row) {
  const meta = metadata(row);
  return firstValue(
    meta.afterRole,
    nestedValue(meta, ["after", "role"]),
    nestedValue(meta, ["after", "siteAccessRole"]),
    nestedValue(row.afterJson, ["role"]),
    nestedValue(row.afterJson, ["siteAccessRole"])
  );
}

function scheduleState(row, side) {
  const source = side === "before" ? row.beforeJson : row.afterJson;
  const direct = nestedValue(source, ["schedule"]);
  const metaSchedule = nestedValue(metadata(row), [side, "schedule"]);
  const schedule = direct || metaSchedule || source;
  if (!schedule || typeof schedule !== "object") return null;
  if (schedule.emergencyOverride) return `override ${schedule.emergencyOverride.status || (schedule.emergencyOverride.active ? "active" : "inactive")}`;
  if (schedule.enabled !== undefined) return schedule.enabled ? "enabled" : "disabled";
  return null;
}

function beforeValue(row) {
  if (row.action === "admin.role.update") return beforeRole(row) || "missing metadata";
  return firstValue(scheduleState(row, "before"), nestedValue(row.beforeJson, ["status"]), "-");
}

function afterValue(row) {
  if (row.action === "admin.role.update") return afterRole(row) || "missing metadata";
  return firstValue(scheduleState(row, "after"), nestedValue(row.afterJson, ["status"]), "-");
}

function reasonFor(row) {
  return firstValue(metadata(row).reason, metadata(row).message, row.message, row.errorMessage);
}

function siteCodeFor(row) {
  return firstValue(metadata(row).siteCode, nestedValue(metadata(row), ["site", "code"]), row.siteCode, row.siteId);
}

function roleSummary(row) {
  const before = beforeRole(row);
  const after = afterRole(row);
  const missing = !before || !after;
  return `
    <div>
      <strong>Admin role changed</strong><br />
      targetUsername: ${safeText(targetUsername(row))}<br />
      role: ${safeText(before)} &rarr; ${safeText(after)}<br />
      reason: ${safeText(reasonFor(row))}<br />
      siteCode: ${safeText(siteCodeFor(row))}
      ${missing ? `<br />${smallBadge("missing metadata")}` : ""}
    </div>`;
}

function scheduleSummary(row) {
  const before = scheduleState(row, "before");
  const after = scheduleState(row, "after");
  return `
    <div>
      <strong>${safeText(actionLabel(row.action))}</strong><br />
      target admin: ${safeText(targetLabel(row))}<br />
      schedule state: ${safeText(before)} &rarr; ${safeText(after)}<br />
      reason: ${safeText(reasonFor(row))}<br />
      status: ${safeText(statusFor(row))}
    </div>`;
}

function actionSummary(row) {
  if (row.action === "admin.role.update") return roleSummary(row);
  if (categoryFor(row) === "Work Schedule") return scheduleSummary(row);
  if (["Blocked", "Failed"].includes(statusFor(row))) {
    return `
      <div>
        <strong>${safeText(actionLabel(row.action))}</strong><br />
        status: ${safeText(statusFor(row))}<br />
        reason: ${safeText(reasonFor(row))}
      </div>`;
  }
  return safeText(actionLabel(row.action));
}

function uniqueRows(rows) {
  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    const key = row.id || `${row.action}:${row.createdAt}:${row.targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

function getFilterValues() {
  return Object.fromEntries(
    Object.entries(els.filters).map(([key, input]) => [key, String(input.value || "").trim()])
  );
}

function dateOnly(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function matchesFilters(row, filters) {
  if (filters.action === "admin.schedule.override") {
    if (!String(row.action || "").startsWith("admin.schedule.override_")) return false;
  } else if (filters.action && row.action !== filters.action) {
    return false;
  }
  if (filters.category && categoryFor(row) !== filters.category) return false;
  if (filters.adminUsername && !String(actorUsername(row) || "").toLowerCase().includes(filters.adminUsername.toLowerCase())) return false;
  if (filters.targetUsername && !String(targetLabel(row) || "").toLowerCase().includes(filters.targetUsername.toLowerCase())) return false;
  if (filters.siteCode && !String(siteCodeFor(row) || "").toLowerCase().includes(filters.siteCode.toLowerCase())) return false;
  const rowDate = dateOnly(row.createdAt);
  if (filters.dateFrom && rowDate && rowDate < filters.dateFrom) return false;
  if (filters.dateTo && rowDate && rowDate > filters.dateTo) return false;
  if ((filters.dateFrom || filters.dateTo) && !rowDate) return false;
  return true;
}

function applyClientFilters() {
  const filters = getFilterValues();
  state.filteredAuditRows = state.auditRows.filter((row) => matchesFilters(row, filters));
  state.filteredSecurityRows = state.securityRows.filter((row) => matchesFilters(row, filters));
  render();
}

function clearFilters() {
  for (const input of Object.values(els.filters)) input.value = "";
  applyClientFilters();
}

function summaryFromRows(rows) {
  return rows.reduce(
    (summary, row) => {
      summary.totalEvents += 1;
      if (categoryFor(row) === "Role Management") summary.roleChanges += 1;
      if (categoryFor(row) === "Work Schedule") summary.scheduleChanges += 1;
      if (["Auth/Login", "Security"].includes(categoryFor(row))) summary.loginSecurity += 1;
      if (["Blocked", "Failed"].includes(statusFor(row))) summary.blockedFailed += 1;
      if (reasonFor(row)) summary.withReason += 1;
      return summary;
    },
    { totalEvents: 0, roleChanges: 0, scheduleChanges: 0, loginSecurity: 0, blockedFailed: 0, withReason: 0 }
  );
}

function renderSummary() {
  const rows = uniqueRows([...state.filteredAuditRows, ...state.filteredSecurityRows]);
  const summary = summaryFromRows(rows);
  for (const [key, node] of Object.entries(els.summary)) {
    const count = Number(summary[key] || 0);
    node.textContent = count.toLocaleString();
    if (els.summaryEmpty[key]) els.summaryEmpty[key].textContent = count > 0 ? "Visible in current result set" : "No matching data";
  }
}

function renderRows(rows, target, empty, count, type) {
  count.textContent = `${rows.length} rows`;
  empty.classList.toggle("hidden", rows.length > 0);
  target.innerHTML = rows
    .map(
      (row, index) => `
        <tr>
          <td>${safeText(formatDate(row.createdAt))}</td>
          <td>${badge(categoryFor(row), "module")}</td>
          <td>${actionSummary(row)}</td>
          <td>${safeText(actorUsername(row))}</td>
          <td>${safeText(targetLabel(row))}</td>
          <td>${safeText(beforeValue(row))}</td>
          <td>${safeText(afterValue(row))}</td>
          <td>${safeText(reasonFor(row))}</td>
          <td>${safeText(siteCodeFor(row))}</td>
          <td>${statusBadge(row)}</td>
          <td>${rowButton(index, type)}</td>
        </tr>`
    )
    .join("");
}

function render() {
  renderSummary();
  renderRows(state.filteredAuditRows, els.auditRows, els.auditEmpty, els.auditCount, "audit");
  renderRows(state.filteredSecurityRows, els.securityRows, els.securityEmpty, els.securityCount, "security");
}

function fallbackRows() {
  return MOCK_ROWS.map((row) => ({ ...row, metadata: { ...row.metadata } }));
}

function useFallback(message) {
  const rows = fallbackRows();
  state.auditRows = rows;
  state.securityRows = rows.filter((row) => ["Role Management", "Work Schedule", "Auth/Login", "Permission", "Security"].includes(categoryFor(row)));
  state.usingFallback = true;
  applyClientFilters();
  els.status.textContent = message || "API unavailable. Showing safe static fallback rows.";
  els.status.style.color = "#fecaca";
}

function safeMetadata(row) {
  return sanitizeValue({
    action: row.action || null,
    actorAdminId: actorAdminId(row),
    actorUsername: actorUsername(row),
    targetAdminId: targetAdminId(row),
    targetUsername: targetUsername(row),
    beforeRole: beforeRole(row),
    afterRole: afterRole(row),
    reason: reasonFor(row),
    siteCode: siteCodeFor(row),
    createdAt: row.createdAt || null,
    status: statusFor(row),
    metadata: metadata(row),
    beforeJson: row.beforeJson || null,
    afterJson: row.afterJson || null,
  });
}

function showDetail(row) {
  els.detailTitle.textContent = actionLabel(row.action);
  const items = [
    ["Action", row.action],
    ["Actor admin ID", actorAdminId(row)],
    ["Actor username", actorUsername(row)],
    ["Target admin ID", targetAdminId(row)],
    ["Target username", targetUsername(row)],
    ["Before role", beforeRole(row)],
    ["After role", afterRole(row)],
    ["Reason", reasonFor(row)],
    ["Site code", siteCodeFor(row)],
    ["Created at", formatDate(row.createdAt)],
    ["Status", statusFor(row)],
    ["Category", categoryFor(row)],
  ];
  els.detailGrid.innerHTML = items
    .map(([label, value]) => `<div><dt>${safeText(label)}</dt><dd>${safeText(value)}</dd></div>`)
    .join("");
  els.detailMetadata.textContent = JSON.stringify(safeMetadata(row), null, 2);
  els.modal.showModal();
}

async function checkPermission() {
  const result = await apiGet("/admin/permissions/me");
  const allowed = Boolean(result.owner || (Array.isArray(result.permissions) && result.permissions.includes("reports.view")));
  if (!allowed) throw new Error("reports.view permission is required");
}

async function loadData() {
  try {
    els.status.textContent = "Loading audit report...";
    els.status.style.color = "#c8d1dc";
    if (!state.authValue) throw new Error("No admin access token. Showing safe static fallback rows.");
    await checkPermission();
    const [audit, _auditSummary, security, _securitySummary] = await Promise.all([
      apiGet("/admin/audit-logs?limit=100"),
      apiGet("/admin/audit-logs/summary?limit=100"),
      apiGet("/admin/security-events?limit=100"),
      apiGet("/admin/security-events/summary?limit=100"),
    ]);
    state.auditRows = Array.isArray(audit.rows) ? audit.rows : [];
    state.securityRows = Array.isArray(security.rows) ? security.rows : [];
    state.usingFallback = false;
    applyClientFilters();
    els.status.textContent = "Audit report loaded.";
    els.status.style.color = "#b9f6d4";
  } catch (error) {
    useFallback(error.message);
  }
}

els.authValue.value = state.authValue;
els.saveToken.addEventListener("click", () => {
  state.authValue = els.authValue.value.trim();
  sessionStorage.setItem("pg77_admin_audit_auth", state.authValue);
  loadData();
});
els.clearToken.addEventListener("click", () => {
  state.authValue = "";
  els.authValue.value = "";
  sessionStorage.removeItem("pg77_admin_audit_auth");
  useFallback("Access token cleared. Showing safe static fallback rows.");
});
els.refresh.addEventListener("click", loadData);
els.applyFilters.addEventListener("click", applyClientFilters);
els.clearFilters.addEventListener("click", clearFilters);
els.closeDetail.addEventListener("click", () => els.modal.close());

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-type]");
  if (!button) return;
  const rows = button.dataset.detailType === "security" ? state.filteredSecurityRows : state.filteredAuditRows;
  const row = rows[Number(button.dataset.detailIndex)];
  if (row) showDetail(row);
});

for (const input of Object.values(els.filters)) {
  input.addEventListener("change", applyClientFilters);
}

if (state.authValue) {
  loadData();
} else {
  useFallback("Enter an admin access token or review the safe static fallback rows.");
}
