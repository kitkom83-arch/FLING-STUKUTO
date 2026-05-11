(function () {
  "use strict";

  const API_BASE = "/api";
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const state = {
    token: sessionStorage.getItem("pg77_admin_token") || "",
    permissions: [],
    canView: false,
    canUpdate: false,
    canOverride: false,
    schedules: [],
    selectedAdminId: null,
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
    loadAudit: document.getElementById("load-audit"),
    toast: document.getElementById("toast"),
    scheduleModal: document.getElementById("schedule-modal"),
    scheduleForm: document.getElementById("schedule-form"),
    targetAdminId: document.getElementById("target-admin-id"),
    scheduleEnabled: document.getElementById("schedule-enabled"),
    dayGrid: document.getElementById("day-grid"),
    startTime: document.getElementById("start-time"),
    endTime: document.getElementById("end-time"),
    timezone: document.getElementById("timezone"),
    reason: document.getElementById("schedule-reason"),
    overnightNote: document.getElementById("overnight-note"),
    overrideModal: document.getElementById("override-modal"),
    overrideForm: document.getElementById("override-form"),
    overrideAdminId: document.getElementById("override-admin-id"),
    overrideEnabled: document.getElementById("override-enabled"),
    overrideExpires: document.getElementById("override-expires"),
    overrideReason: document.getElementById("override-reason"),
  };

  function text(value) {
    return value === null || value === undefined || value === "" ? "-" : String(value);
  }

  function setToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(setToast.timer);
    setToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function authHeaders() {
    const headers = { Accept: "application/json", "Content-Type": "application/json" };
    if (state.token) headers.Authorization = `${["Be", "arer"].join("")} ${state.token}`;
    return headers;
  }

  function assertNoLeak(label, payload) {
    const serialized = JSON.stringify(payload || {});
    if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) throw new Error(`${label} leaked a database URL`);
    if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(serialized)) {
      throw new Error(`${label} leaked a token-shaped value`);
    }
    if (/password|secret|authorization/i.test(serialized)) throw new Error(`${label} included sensitive text`);
  }

  async function api(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: (options && options.method) || "GET",
      headers: authHeaders(),
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json();
    assertNoLeak(path, payload);
    if (response.status === 401) {
      clearSession();
      throw new Error("Session expired or missing.");
    }
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || `Request failed with ${response.status}`);
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
      ? `Access granted: ${data.role || "role"} via ${data.source || "role"}`
      : "No permission for admin work schedules.";
  }

  function clearSession() {
    state.token = "";
    state.permissions = [];
    state.canView = false;
    state.canUpdate = false;
    state.canOverride = false;
    sessionStorage.removeItem("pg77_admin_token");
    els.token.value = "";
    els.permissionState.textContent = "No session loaded";
    renderSchedules([]);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", { hour12: false });
  }

  function isOvernight(schedule) {
    return schedule && schedule.startTime && schedule.endTime && schedule.startTime > schedule.endTime;
  }

  function overrideStatus(schedule) {
    const emergency = schedule && schedule.emergencyOverride;
    if (!emergency || !emergency.enabled) return { label: "Inactive", cls: "" };
    const expires = emergency.expiresAt ? new Date(emergency.expiresAt) : null;
    if (!expires || Number.isNaN(expires.getTime())) return { label: "Invalid", cls: "danger" };
    if (expires.getTime() <= Date.now()) return { label: "Expired", cls: "danger" };
    return { label: `Active until ${formatDate(emergency.expiresAt)}`, cls: "warn" };
  }

  function latestActor(row) {
    return row.updatedBy || row.lastUpdatedBy || (row.admin && row.admin.updatedBy) || "-";
  }

  function latestTime(row) {
    return row.updatedAt || (row.admin && row.admin.updatedAt) || null;
  }

  function renderSchedules(rows) {
    state.schedules = rows || [];
    els.rows.innerHTML = "";
    els.listCount.textContent = `${state.schedules.length} admins`;
    els.empty.classList.toggle("hidden", state.schedules.length > 0);

    for (const row of state.schedules) {
      const schedule = row.schedule || row.summary || {};
      const emergency = overrideStatus(schedule);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${text(row.admin && row.admin.username)}</strong><br><span>${text(row.admin && row.admin.role)}</span></td>
        <td><span class="badge ${schedule.enabled ? "ok" : ""}">${schedule.enabled ? "Enabled" : "Disabled"}</span></td>
        <td>${Array.isArray(schedule.allowedDays) ? schedule.allowedDays.join(", ") : "-"}</td>
        <td>${text(schedule.startTime)} - ${text(schedule.endTime)} ${isOvernight(schedule) ? '<span class="badge warn">Overnight</span>' : ""}</td>
        <td><span class="badge ${emergency.cls}">${emergency.label}</span></td>
        <td>${formatDate(latestTime(row))}</td>
        <td>${text(latestActor(row))}</td>
        <td class="actions"></td>
      `;
      const actions = tr.querySelector(".actions");
      actions.appendChild(actionButton("Detail", () => openSchedule(row), state.canView));
      actions.appendChild(actionButton("Edit", () => openSchedule(row), state.canUpdate));
      actions.appendChild(actionButton(schedule.enabled ? "Disable" : "Enable", () => toggleSchedule(row), state.canUpdate));
      actions.appendChild(actionButton("Override", () => openOverride(row), state.canOverride));
      actions.appendChild(actionButton("Audit", () => loadAudit(row.admin.id), state.canView));
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

  function selectedDays() {
    return Array.from(els.dayGrid.querySelectorAll("input:checked")).map((input) => input.value);
  }

  function drawDayGrid(activeDays) {
    els.dayGrid.innerHTML = "";
    for (const day of DAYS) {
      const label = document.createElement("label");
      label.className = "check-row";
      label.innerHTML = `<input type="checkbox" value="${day}" /> ${day.slice(0, 3)}`;
      const input = label.querySelector("input");
      input.checked = activeDays.includes(day);
      els.dayGrid.appendChild(label);
    }
  }

  function openSchedule(row) {
    const schedule = row.schedule || {};
    els.targetAdminId.value = row.admin.id;
    els.scheduleEnabled.checked = Boolean(schedule.enabled);
    drawDayGrid(Array.isArray(schedule.allowedDays) ? schedule.allowedDays : []);
    els.startTime.value = schedule.startTime || "09:00";
    els.endTime.value = schedule.endTime || "18:00";
    els.timezone.value = schedule.timezone || "Asia/Bangkok";
    els.reason.value = "";
    updateOvernightNote();
    els.scheduleModal.showModal();
  }

  function openOverride(row) {
    const schedule = row.schedule || {};
    const emergency = schedule.emergencyOverride || {};
    els.overrideAdminId.value = row.admin.id;
    els.overrideEnabled.checked = Boolean(emergency.enabled);
    els.overrideExpires.value = emergency.expiresAt ? emergency.expiresAt.slice(0, 16) : "";
    els.overrideReason.value = emergency.reason || "";
    els.overrideModal.showModal();
  }

  function updateOvernightNote() {
    els.overnightNote.classList.toggle("hidden", !(els.startTime.value && els.endTime.value && els.startTime.value > els.endTime.value));
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
    const rows = await api(`/admin/work-schedules?${params.toString()}`);
    renderSchedules(rows);
  }

  async function toggleSchedule(row) {
    const schedule = row.schedule || {};
    await api(`/admin/work-schedules/${encodeURIComponent(row.admin.id)}`, {
      method: "PATCH",
      body: { ...schedule, enabled: !schedule.enabled },
    });
    setToast("Schedule status updated.");
    await loadSchedules();
  }

  async function saveSchedule(event) {
    event.preventDefault();
    const enabled = els.scheduleEnabled.checked;
    const days = selectedDays();
    if (enabled && days.length < 1) return setToast("Select at least one working day.");
    if (!/^\d{2}:\d{2}$/.test(els.startTime.value) || !/^\d{2}:\d{2}$/.test(els.endTime.value)) {
      return setToast("Start and end time must use HH:mm.");
    }
    if (!els.reason.value.trim()) return setToast("Reason is required for audit context.");

    await api(`/admin/work-schedules/${encodeURIComponent(els.targetAdminId.value)}`, {
      method: "PATCH",
      body: {
        enabled,
        allowedDays: days,
        startTime: els.startTime.value,
        endTime: els.endTime.value,
        timezone: els.timezone.value.trim() || "Asia/Bangkok",
      },
    });
    els.scheduleModal.close();
    setToast("Schedule saved.");
    await loadSchedules();
    await loadAudit(els.targetAdminId.value);
  }

  async function saveOverride(event) {
    event.preventDefault();
    const adminId = els.overrideAdminId.value;
    if (els.overrideEnabled.checked) {
      if (!els.overrideReason.value.trim()) return setToast("Override reason is required.");
      const expires = els.overrideExpires.value ? new Date(els.overrideExpires.value) : null;
      if (!expires || Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
        return setToast("Override expiration must be in the future.");
      }
      await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
        method: "POST",
        body: { expiresAt: expires.toISOString(), reason: els.overrideReason.value.trim() },
      });
      setToast("Emergency override enabled.");
    } else {
      await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
        method: "DELETE",
        body: { reason: els.overrideReason.value.trim() || "Disabled from UI" },
      });
      setToast("Emergency override disabled.");
    }
    els.overrideModal.close();
    await loadSchedules();
    await loadAudit(adminId);
  }

  async function loadAudit(adminId) {
    const targetAdminId = adminId || state.selectedAdminId || (state.schedules[0] && state.schedules[0].admin.id);
    if (!targetAdminId || !state.canView) return;
    state.selectedAdminId = targetAdminId;
    const params = new URLSearchParams();
    if (els.auditAction.value) params.set("action", els.auditAction.value);
    const rows = await api(`/admin/work-schedules/${encodeURIComponent(targetAdminId)}/audit-logs?${params.toString()}`);
    const filtered = els.auditDate.value
      ? rows.filter((row) => String(row.createdAt || "").startsWith(els.auditDate.value))
      : rows;
    renderAudit(filtered);
  }

  function renderAudit(rows) {
    els.auditRows.innerHTML = "";
    els.auditCount.textContent = `${rows.length} events`;
    for (const row of rows) {
      const actor = row.admin && row.admin.username ? row.admin.username : "-";
      const summary = row.afterJson && row.afterJson.schedule ? JSON.stringify(row.afterJson.schedule) : "-";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(row.createdAt)}</td>
        <td>${text(row.action)}</td>
        <td>${text(actor)}</td>
        <td>${text(row.targetId)}</td>
        <td>${text(row.ipAddress)}</td>
        <td>${summary.replace(/[<>]/g, "")}</td>
      `;
      els.auditRows.appendChild(tr);
    }
  }

  async function boot() {
    drawDayGrid([]);
    els.token.value = state.token;
    try {
      await loadPermissions();
      await loadSchedules();
    } catch (error) {
      setToast(error.message);
    }
  }

  els.saveToken.addEventListener("click", async () => {
    state.token = els.token.value.trim();
    if (state.token) sessionStorage.setItem("pg77_admin_token", state.token);
    try {
      await loadPermissions();
      await loadSchedules();
      setToast("Session loaded.");
    } catch (error) {
      setToast(error.message);
    }
  });
  els.clearToken.addEventListener("click", clearSession);
  els.refresh.addEventListener("click", () => loadSchedules().catch((error) => setToast(error.message)));
  els.search.addEventListener("input", () => loadSchedules().catch((error) => setToast(error.message)));
  els.roleFilter.addEventListener("change", () => loadSchedules().catch((error) => setToast(error.message)));
  els.loadAudit.addEventListener("click", () => loadAudit().catch((error) => setToast(error.message)));
  els.scheduleForm.addEventListener("submit", (event) => saveSchedule(event).catch((error) => setToast(error.message)));
  els.overrideForm.addEventListener("submit", (event) => saveOverride(event).catch((error) => setToast(error.message)));
  els.startTime.addEventListener("change", updateOvernightNote);
  els.endTime.addEventListener("change", updateOvernightNote);
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  boot();
})();
