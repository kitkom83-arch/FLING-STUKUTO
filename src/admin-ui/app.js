(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const SENSITIVE_WORDS = /\b(password|secret|authorization)\b/i;
  const TOKEN_SHAPED_VALUE = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;

  const state = {
    token: "",
    permissions: [],
    canView: false,
    canUpdate: false,
    canOverride: false,
    schedules: [],
    selectedAdminId: null,
    selectedAdminLabel: "",
    editingRow: null,
    togglingRow: null,
  };

  const els = {
    token: document.getElementById("admin-token"),
    saveToken: document.getElementById("save-token"),
    clearToken: document.getElementById("clear-token"),
    permissionState: document.getElementById("permission-state"),
    search: document.getElementById("search"),
    roleFilter: document.getElementById("role-filter"),
    refresh: document.getElementById("refresh"),
    rows: document.getElementById("schedule-rows"),
    empty: document.getElementById("schedule-empty"),
    listCount: document.getElementById("list-count"),
    auditRows: document.getElementById("audit-rows"),
    auditCount: document.getElementById("audit-count"),
    auditAction: document.getElementById("audit-action"),
    auditDate: document.getElementById("audit-date"),
    auditTarget: document.getElementById("audit-target"),
    auditEmpty: document.getElementById("audit-empty"),
    loadAudit: document.getElementById("load-audit"),
    toast: document.getElementById("toast"),
    detailModal: document.getElementById("detail-modal"),
    detailGrid: document.getElementById("detail-grid"),
    scheduleModal: document.getElementById("schedule-modal"),
    scheduleForm: document.getElementById("schedule-form"),
    saveSchedule: document.getElementById("save-schedule"),
    targetAdminId: document.getElementById("target-admin-id"),
    scheduleEnabled: document.getElementById("schedule-enabled"),
    dayGrid: document.getElementById("day-grid"),
    startTime: document.getElementById("start-time"),
    endTime: document.getElementById("end-time"),
    timezone: document.getElementById("timezone"),
    reason: document.getElementById("schedule-reason"),
    overnightNote: document.getElementById("overnight-note"),
    toggleModal: document.getElementById("toggle-modal"),
    toggleForm: document.getElementById("toggle-form"),
    toggleTitle: document.getElementById("toggle-title"),
    toggleCopy: document.getElementById("toggle-copy"),
    toggleAdminId: document.getElementById("toggle-admin-id"),
    toggleNextEnabled: document.getElementById("toggle-next-enabled"),
    toggleReason: document.getElementById("toggle-reason"),
    confirmToggle: document.getElementById("confirm-toggle"),
    overrideModal: document.getElementById("override-modal"),
    overrideForm: document.getElementById("override-form"),
    saveOverride: document.getElementById("save-override"),
    overrideAdminId: document.getElementById("override-admin-id"),
    overrideEnabled: document.getElementById("override-enabled"),
    overrideExpires: document.getElementById("override-expires"),
    overrideReason: document.getElementById("override-reason"),
    confirmModal: document.getElementById("confirm-modal"),
    confirmForm: document.getElementById("confirm-form"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmCancel: document.getElementById("confirm-cancel"),
    confirmOk: document.getElementById("confirm-ok"),
  };

  function text(value) {
    return value === null || value === undefined || value === "" ? "-" : String(value);
  }

  function sanitizeToken(value) {
    return String(value || "")
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .trim();
  }

  function sanitizeErrorMessage(value) {
    const message = String(value || "Request failed.");
    if (SENSITIVE_WORDS.test(message) || TOKEN_SHAPED_VALUE.test(message) || /postgres(?:ql)?:\/\//i.test(message)) {
      return "Request failed safely.";
    }
    return message.slice(0, 180);
  }

  function safeDisplay(value) {
    const display = text(value).replace(/[<>]/g, "");
    if (SENSITIVE_WORDS.test(display) || TOKEN_SHAPED_VALUE.test(display) || /postgres(?:ql)?:\/\//i.test(display)) {
      return "[REDACTED]";
    }
    return display;
  }

  function setToast(message) {
    els.toast.textContent = sanitizeErrorMessage(message);
    els.toast.classList.add("show");
    window.clearTimeout(setToast.timer);
    setToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function authHeaders() {
    const headers = { Accept: "application/json", "Content-Type": "application/json", "x-site-code": SITE_CODE };
    if (state.token) headers.Authorization = `${["Be", "arer"].join("")} ${state.token}`;
    return headers;
  }

  function assertNoLeak(label, payload) {
    const serialized = JSON.stringify(payload || {});
    if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) throw new Error(`${label} leaked a database URL`);
    if (TOKEN_SHAPED_VALUE.test(serialized)) throw new Error(`${label} leaked a credential-shaped value`);
    if (SENSITIVE_WORDS.test(serialized)) throw new Error(`${label} included sensitive text`);
  }

  async function api(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: (options && options.method) || "GET",
      headers: authHeaders(),
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({ success: false, message: "Request returned an invalid response." }));
    assertNoLeak(path, payload);
    if (response.status === 401) {
      clearSession();
      throw new Error("Session expired or missing.");
    }
    if (!response.ok || !payload.success) {
      throw new Error(sanitizeErrorMessage(payload.message || `Request failed with ${response.status}`));
    }
    return payload.data;
  }

  function hasPermission(permission) {
    return state.permissions.includes(permission) || state.permissions.includes("admin.manage");
  }

  function setPermissions(data) {
    state.permissions = Array.isArray(data.permissions) ? data.permissions : [];
    state.canView = hasPermission("admin.schedule.view");
    state.canUpdate = hasPermission("admin.schedule.update");
    state.canOverride = hasPermission("admin.schedule.override");
    els.permissionState.textContent = state.canView
      ? `Access granted: ${safeDisplay(data.role || "role")} via ${safeDisplay(data.source || "role")}`
      : "No permission for admin work schedules.";
  }

  function clearSession() {
    state.token = "";
    state.permissions = [];
    state.canView = false;
    state.canUpdate = false;
    state.canOverride = false;
    state.selectedAdminId = null;
    state.selectedAdminLabel = "";
    sessionStorage.removeItem("pg77_admin_token");
    els.token.value = "";
    els.auditTarget.value = "";
    els.permissionState.textContent = "No session loaded";
    renderSchedules([]);
    renderAudit([]);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", { hour12: false });
  }

  function scheduleFrom(row) {
    return row && (row.schedule || row.summary) ? row.schedule || row.summary : {};
  }

  function isOvernight(schedule) {
    return schedule && schedule.startTime && schedule.endTime && schedule.startTime > schedule.endTime;
  }

  function overrideStatus(schedule) {
    const emergency = schedule && schedule.emergencyOverride;
    if (!emergency || !emergency.enabled) return { label: "Inactive", cls: "" };
    const expires = emergency.expiresAt ? new Date(emergency.expiresAt) : null;
    if (!expires || Number.isNaN(expires.getTime())) return { label: "Invalid expiration", cls: "danger" };
    if (expires.getTime() <= Date.now()) return { label: "Expired", cls: "danger" };
    return { label: `Active until ${formatDate(emergency.expiresAt)}`, cls: "warn" };
  }

  function latestActor(row) {
    return row.updatedBy || row.lastUpdatedBy || (row.admin && row.admin.updatedBy) || "-";
  }

  function latestTime(row) {
    return row.updatedAt || (row.admin && row.admin.updatedAt) || null;
  }

  function createCell(value) {
    const td = document.createElement("td");
    td.textContent = safeDisplay(value);
    return td;
  }

  function createBadge(label, cls) {
    const badge = document.createElement("span");
    badge.className = `badge ${cls || ""}`.trim();
    badge.textContent = label;
    return badge;
  }

  function createAdminCell(row) {
    const td = document.createElement("td");
    const name = document.createElement("strong");
    const role = document.createElement("span");
    name.textContent = safeDisplay(row.admin && row.admin.username);
    role.textContent = safeDisplay(row.admin && row.admin.role);
    td.appendChild(name);
    td.appendChild(document.createElement("br"));
    td.appendChild(role);
    return td;
  }

  function renderSchedules(rows) {
    state.schedules = rows || [];
    els.rows.innerHTML = "";
    els.listCount.textContent = `${state.schedules.length} admins`;
    els.empty.classList.toggle("hidden", state.schedules.length > 0);

    for (const row of state.schedules) {
      const schedule = scheduleFrom(row);
      const emergency = overrideStatus(schedule);
      const tr = document.createElement("tr");
      tr.appendChild(createAdminCell(row));

      const statusCell = document.createElement("td");
      statusCell.appendChild(createBadge(schedule.enabled ? "Enabled" : "Disabled", schedule.enabled ? "ok" : ""));
      tr.appendChild(statusCell);
      tr.appendChild(createCell(Array.isArray(schedule.allowedDays) ? schedule.allowedDays.join(", ") : "-"));

      const timeCell = document.createElement("td");
      timeCell.textContent = `${safeDisplay(schedule.startTime)} - ${safeDisplay(schedule.endTime)}`;
      if (isOvernight(schedule)) {
        timeCell.appendChild(document.createTextNode(" "));
        timeCell.appendChild(createBadge("Overnight", "warn"));
      }
      tr.appendChild(timeCell);

      const overrideCell = document.createElement("td");
      overrideCell.appendChild(createBadge(emergency.label, emergency.cls));
      tr.appendChild(overrideCell);
      tr.appendChild(createCell(formatDate(latestTime(row))));
      tr.appendChild(createCell(latestActor(row)));

      const actions = document.createElement("td");
      actions.className = "actions";
      actions.appendChild(actionButton("Detail", () => openDetail(row), state.canView));
      actions.appendChild(actionButton("Edit", () => openSchedule(row), state.canUpdate));
      actions.appendChild(actionButton(schedule.enabled ? "Disable" : "Enable", () => openToggle(row), state.canUpdate));
      actions.appendChild(actionButton("Override", () => openOverride(row), state.canOverride));
      actions.appendChild(actionButton("Audit", () => openAuditForAdmin(row), state.canView));
      tr.appendChild(actions);
      els.rows.appendChild(tr);
    }
  }

  function actionButton(label, handler, enabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = !enabled;
    button.title = enabled ? label : "No permission";
    button.addEventListener("click", handler);
    return button;
  }

  async function withLoading(button, task) {
    const original = button.disabled;
    button.disabled = true;
    button.classList.add("is-loading");
    try {
      return await task();
    } finally {
      button.classList.remove("is-loading");
      button.disabled = original;
    }
  }

  function selectedDays() {
    return Array.from(els.dayGrid.querySelectorAll("input:checked")).map((input) => input.value);
  }

  function drawDayGrid(activeDays) {
    const selected = Array.isArray(activeDays) ? activeDays : [];
    els.dayGrid.innerHTML = "";
    for (const day of DAYS) {
      const label = document.createElement("label");
      label.className = "check-row";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = day;
      input.checked = selected.includes(day);
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${day}`));
      els.dayGrid.appendChild(label);
    }
  }

  function addDetail(label, value) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = safeDisplay(value);
    els.detailGrid.appendChild(dt);
    els.detailGrid.appendChild(dd);
  }

  function openDetail(row) {
    const schedule = scheduleFrom(row);
    const emergency = overrideStatus(schedule);
    els.detailGrid.innerHTML = "";
    addDetail("Admin username", row.admin && row.admin.username);
    addDetail("Role", (row.admin && (row.admin.role || row.siteAccessRole)) || row.siteAccessRole);
    addDetail("Schedule status", schedule.enabled ? "Enabled" : "Disabled");
    addDetail("Working days", Array.isArray(schedule.allowedDays) && schedule.allowedDays.length ? schedule.allowedDays.join(", ") : "-");
    addDetail("Start/end time", `${text(schedule.startTime)} - ${text(schedule.endTime)}`);
    addDetail("Emergency override status", emergency.label);
    addDetail("Last updated", formatDate(latestTime(row)));
    addDetail("Updated by", latestActor(row));
    els.detailModal.showModal();
  }

  function openSchedule(row) {
    const schedule = scheduleFrom(row);
    state.editingRow = row;
    els.targetAdminId.value = row.admin.id;
    els.scheduleEnabled.checked = Boolean(schedule.enabled);
    drawDayGrid(Array.isArray(schedule.allowedDays) ? schedule.allowedDays : DAYS.slice(0, 5));
    els.startTime.value = schedule.startTime || "09:00";
    els.endTime.value = schedule.endTime || "18:00";
    els.timezone.value = schedule.timezone || "Asia/Bangkok";
    els.reason.value = "";
    updateOvernightNote();
    els.scheduleModal.showModal();
  }

  function openToggle(row) {
    const schedule = scheduleFrom(row);
    const nextEnabled = !schedule.enabled;
    state.togglingRow = row;
    els.toggleAdminId.value = row.admin.id;
    els.toggleNextEnabled.value = nextEnabled ? "true" : "false";
    els.toggleReason.value = "";
    els.toggleTitle.textContent = nextEnabled ? "Confirm schedule enable" : "Confirm schedule disable";
    els.toggleCopy.textContent = nextEnabled ? "Enable this admin work schedule." : "Disable this admin work schedule.";
    els.confirmToggle.textContent = nextEnabled ? "Enable" : "Disable";
    els.toggleModal.showModal();
  }

  function openOverride(row) {
    const schedule = scheduleFrom(row);
    const emergency = schedule.emergencyOverride || {};
    els.overrideAdminId.value = row.admin.id;
    els.overrideEnabled.checked = Boolean(emergency.enabled);
    els.overrideExpires.value = emergency.expiresAt ? emergency.expiresAt.slice(0, 16) : "";
    els.overrideReason.value = "";
    els.overrideModal.showModal();
  }

  function updateOvernightNote() {
    els.overnightNote.classList.toggle("hidden", !(els.startTime.value && els.endTime.value && els.startTime.value > els.endTime.value));
  }

  function confirmAction(title, message) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        els.confirmForm.removeEventListener("submit", onSubmit);
        els.confirmCancel.removeEventListener("click", onCancel);
        els.confirmModal.removeEventListener("close", onClose);
        resolve(value);
      };
      const onSubmit = (event) => {
        event.preventDefault();
        finish(true);
        els.confirmModal.close();
      };
      const onCancel = () => {
        finish(false);
        els.confirmModal.close();
      };
      const onClose = () => finish(false);
      els.confirmForm.addEventListener("submit", onSubmit);
      els.confirmCancel.addEventListener("click", onCancel);
      els.confirmModal.addEventListener("close", onClose);
      els.confirmModal.showModal();
    });
  }

  async function loadPermissions() {
    if (!state.token) {
      clearSession();
      return;
    }
    const data = await api("/admin/permissions/me");
    setPermissions(data);
  }

  async function loadSchedules() {
    if (!state.canView) {
      renderSchedules([]);
      return;
    }
    const params = new URLSearchParams();
    if (els.search.value.trim()) params.set("search", els.search.value.trim());
    if (els.roleFilter.value) params.set("role", els.roleFilter.value);
    const query = params.toString();
    const rows = await api(`/admin/work-schedules${query ? `?${query}` : ""}`);
    renderSchedules(rows);
  }

  function schedulePatchBody(schedule, enabled, days) {
    const existingDays = Array.isArray(schedule.allowedDays) && schedule.allowedDays.length ? schedule.allowedDays : DAYS.slice(0, 5);
    return {
      enabled,
      allowedDays: days && days.length ? days : existingDays,
      startTime: schedule.startTime || "09:00",
      endTime: schedule.endTime || "18:00",
      timezone: schedule.timezone || "Asia/Bangkok",
      forceLogoutWhenScheduleEnds: schedule.forceLogoutWhenScheduleEnds !== false,
      idleTimeoutMinutes: Number.isFinite(Number(schedule.idleTimeoutMinutes)) ? Number(schedule.idleTimeoutMinutes) : 60,
    };
  }

  async function saveSchedule(event) {
    event.preventDefault();
    const enabled = els.scheduleEnabled.checked;
    const days = selectedDays();
    if (enabled && days.length < 1) return setToast("Select at least one working day.");
    if (enabled && (!els.startTime.value || !els.endTime.value)) return setToast("Start and end time are required.");
    if (enabled && (!/^\d{2}:\d{2}$/.test(els.startTime.value) || !/^\d{2}:\d{2}$/.test(els.endTime.value))) {
      return setToast("Start and end time must use HH:mm.");
    }
    if (!els.reason.value.trim()) return setToast("Reason is required.");
    const confirmed = await confirmAction("Confirm schedule update", "Confirm schedule update");
    if (!confirmed) return;

    await withLoading(els.saveSchedule, async () => {
      const schedule = scheduleFrom(state.editingRow);
      await api(`/admin/work-schedules/${encodeURIComponent(els.targetAdminId.value)}`, {
        method: "PATCH",
        body: {
          ...schedulePatchBody(schedule, enabled, days),
          startTime: els.startTime.value || schedule.startTime || "09:00",
          endTime: els.endTime.value || schedule.endTime || "18:00",
          timezone: els.timezone.value.trim() || schedule.timezone || "Asia/Bangkok",
          reason: els.reason.value.trim(),
        },
      });
      els.scheduleModal.close();
      setToast("Schedule updated");
      await loadSchedules();
      await loadAudit(els.targetAdminId.value);
    });
  }

  async function toggleSchedule(event) {
    event.preventDefault();
    const row = state.togglingRow;
    if (!row || !row.admin || !row.admin.id) return setToast("Select an admin row.");
    if (!els.toggleReason.value.trim()) return setToast("Reason is required.");
    const nextEnabled = els.toggleNextEnabled.value === "true";
    const schedule = scheduleFrom(row);

    await withLoading(els.confirmToggle, async () => {
      await api(`/admin/work-schedules/${encodeURIComponent(row.admin.id)}`, {
        method: "PATCH",
        body: {
          ...schedulePatchBody(schedule, nextEnabled, schedule.allowedDays),
          reason: els.toggleReason.value.trim(),
        },
      });
      els.toggleModal.close();
      setToast(nextEnabled ? "Schedule enabled" : "Schedule disabled");
      await loadSchedules();
      await loadAudit(row.admin.id);
    });
  }

  async function saveOverride(event) {
    event.preventDefault();
    const adminId = els.overrideAdminId.value;
    const enabled = els.overrideEnabled.checked;
    if (!els.overrideReason.value.trim()) return setToast("Reason is required.");
    if (enabled && !els.overrideExpires.value) return setToast("Override expiration is required.");
    const expires = enabled ? new Date(els.overrideExpires.value) : null;
    if (enabled && (!expires || Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now())) {
      return setToast("Override expiration must be in the future.");
    }
    const confirmed = await confirmAction("Confirm emergency override", "Confirm emergency override update");
    if (!confirmed) return;

    await withLoading(els.saveOverride, async () => {
      if (enabled) {
        await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
          method: "POST",
          body: { expiresAt: expires.toISOString(), reason: els.overrideReason.value.trim() },
        });
      } else {
        await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
          method: "DELETE",
          body: { reason: els.overrideReason.value.trim() },
        });
      }
      els.overrideModal.close();
      setToast("Emergency override updated");
      await loadSchedules();
      await loadAudit(adminId);
    });
  }

  function openAuditForAdmin(row) {
    state.selectedAdminId = row.admin && row.admin.id ? row.admin.id : null;
    state.selectedAdminLabel = row.admin && row.admin.username ? row.admin.username : state.selectedAdminId || "";
    els.auditTarget.value = state.selectedAdminLabel;
    document.getElementById("audit").scrollIntoView({ behavior: "smooth", block: "start" });
    withLoading(els.loadAudit, () => loadAudit(state.selectedAdminId)).catch((error) => setToast(error.message));
  }

  async function loadAudit(adminId) {
    const targetAdminId = adminId || state.selectedAdminId || (state.schedules[0] && state.schedules[0].admin && state.schedules[0].admin.id);
    if (!targetAdminId || !state.canView) {
      renderAudit([]);
      return;
    }
    state.selectedAdminId = targetAdminId;
    const selected = state.schedules.find((row) => row.admin && row.admin.id === targetAdminId);
    state.selectedAdminLabel = selected && selected.admin ? selected.admin.username : state.selectedAdminLabel;
    els.auditTarget.value = state.selectedAdminLabel || targetAdminId;
    const params = new URLSearchParams();
    if (els.auditAction.value) params.set("action", els.auditAction.value);
    params.set("limit", "50");
    const rows = await api(`/admin/work-schedules/${encodeURIComponent(targetAdminId)}/audit-logs?${params.toString()}`);
    const filtered = els.auditDate.value
      ? rows.filter((row) => String(row.createdAt || "").startsWith(els.auditDate.value))
      : rows;
    renderAudit(filtered);
  }

  function auditSummary(row) {
    const afterSchedule = row.afterJson && row.afterJson.schedule ? row.afterJson.schedule : null;
    if (!afterSchedule) return "-";
    const status = afterSchedule.enabled ? "enabled" : "disabled";
    const days = Array.isArray(afterSchedule.allowedDays) ? afterSchedule.allowedDays.join(",") : "-";
    const emergency = overrideStatus(afterSchedule).label;
    return safeDisplay(`${status}; ${days}; ${text(afterSchedule.startTime)}-${text(afterSchedule.endTime)}; override ${emergency}`);
  }

  function auditReason(row) {
    return row.metadata && row.metadata.reason ? row.metadata.reason : "-";
  }

  function renderAudit(rows) {
    const safeRows = Array.isArray(rows) ? rows : [];
    els.auditRows.innerHTML = "";
    els.auditCount.textContent = `${safeRows.length} events`;
    els.auditEmpty.classList.toggle("hidden", safeRows.length > 0);
    for (const row of safeRows) {
      const actor = row.admin && row.admin.username ? row.admin.username : "-";
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row.createdAt)));
      tr.appendChild(createCell(row.action));
      tr.appendChild(createCell(actor));
      tr.appendChild(createCell(row.targetId));
      tr.appendChild(createCell(auditReason(row)));
      tr.appendChild(createCell(row.ipAddress));
      tr.appendChild(createCell(auditSummary(row)));
      els.auditRows.appendChild(tr);
    }
  }

  async function boot() {
    sessionStorage.removeItem("pg77_admin_token");
    drawDayGrid([]);
    renderAudit([]);
  }

  els.saveToken.addEventListener("click", () =>
    withLoading(els.saveToken, async () => {
      const sanitized = sanitizeToken(els.token.value);
      els.token.value = sanitized;
      if (!sanitized) {
        clearSession();
        setToast("Enter an admin credential.");
        return;
      }
      state.token = sanitized;
      await loadPermissions();
      await loadSchedules();
      setToast("Session loaded.");
    }).catch((error) => setToast(error.message))
  );
  els.clearToken.addEventListener("click", clearSession);
  els.refresh.addEventListener("click", () => withLoading(els.refresh, loadSchedules).catch((error) => setToast(error.message)));
  els.search.addEventListener("input", () => loadSchedules().catch((error) => setToast(error.message)));
  els.roleFilter.addEventListener("change", () => loadSchedules().catch((error) => setToast(error.message)));
  els.loadAudit.addEventListener("click", () => withLoading(els.loadAudit, () => loadAudit()).catch((error) => setToast(error.message)));
  els.scheduleForm.addEventListener("submit", (event) => saveSchedule(event).catch((error) => setToast(error.message)));
  els.toggleForm.addEventListener("submit", (event) => toggleSchedule(event).catch((error) => setToast(error.message)));
  els.overrideForm.addEventListener("submit", (event) => saveOverride(event).catch((error) => setToast(error.message)));
  els.startTime.addEventListener("change", updateOvernightNote);
  els.endTime.addEventListener("change", updateOvernightNote);
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  boot();
})();
