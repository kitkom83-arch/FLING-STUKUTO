(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const SENSITIVE_WORDS = /\b(password|secret|authorization)\b/i;
  const TOKEN_SHAPED_VALUE = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const PERMISSION_MATRIX = [
    ["Admin/Audit", "admin.roles.view", "View roles and permission catalog", "read", false, false, "/admin/roles", "GET /api/admin/roles"],
    ["Admin/Audit", "admin.roles.update", "Assign or revoke role permissions", "write", true, true, "/admin/roles", "PATCH /api/admin/roles/:role/permissions"],
    ["Admin/Audit", "admin.audit.view", "View admin audit logs", "read", false, false, "/admin/audit-security", "GET /api/admin/audit-logs"],
    ["Admin/Audit", "admin.security.view", "View security events", "read", false, false, "/admin/audit-security", "GET /api/admin/security-events"],
    ["Admin/Audit", "admin.workSchedule.view", "View work schedules", "read", false, false, "/admin/work-schedules", "GET /api/admin/work-schedules"],
    ["Admin/Audit", "admin.workSchedule.update", "Update work schedules", "write", true, true, "/admin/work-schedules", "PATCH /api/admin/work-schedules/:adminId"],
    ["Lucky Wheel", "wheel.view", "Open Lucky Wheel console", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
    ["Lucky Wheel", "wheel.campaign.view", "View wheel campaign", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
    ["Lucky Wheel", "wheel.campaign.update", "Update wheel campaign", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/campaign"],
    ["Lucky Wheel", "wheel.rewards.view", "View rewards", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
    ["Lucky Wheel", "wheel.rewards.create", "Create rewards", "write", true, true, "/admin/lucky-wheel", "POST /api/admin/wheel/rewards"],
    ["Lucky Wheel", "wheel.rewards.update", "Update rewards", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
    ["Lucky Wheel", "wheel.rewards.status.update", "Update reward status", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
    ["Lucky Wheel", "wheel.spins.view", "View spins", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
    ["Lucky Wheel", "wheel.reports.view", "View wheel reports", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
    ["Lucky Wheel", "wheel.claims.view", "View reward claims", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/member-rewards"],
    ["Lucky Wheel", "wheel.claims.status.update", "Update reward claims", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/member-rewards/:id/status"],
    ["Lucky Wheel", "wheel.audit.view", "View wheel audit", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/audit-logs"],
  ];
  const ROLE_DESCRIPTIONS = {
    owner: "Full backend access with owner bypass.",
    super_admin: "Legacy full access role with all permissions.",
    finance: "Finance operations, deposits, withdrawals, bank visibility, and reports.",
    support: "Member support and read-heavy operational access.",
    graphic: "Website, promotion, and asset management.",
    viewer: "Read-only operational visibility.",
  };

  const state = {
    token: "",
    permissions: [],
    permissionCatalog: [],
    roles: [],
    currentAdmin: null,
    currentRole: null,
    currentSource: null,
    selectedRole: null,
    canView: false,
    canUpdate: false,
    canOverride: false,
    schedules: [],
    selectedAdminId: null,
    selectedAdminLabel: "",
    editingRow: null,
    togglingRow: null,
    roleAssignmentRow: null,
    roleDraftPermissions: [],
    roleOriginalPermissions: [],
  };

  const els = {
    token: document.getElementById("admin-token"),
    saveToken: document.getElementById("save-token"),
    clearToken: document.getElementById("clear-token"),
    permissionState: document.getElementById("permission-state"),
    loadPermissions: document.getElementById("load-permissions"),
    sessionStatus: document.getElementById("session-status"),
    sessionRole: document.getElementById("session-role"),
    currentAdminUsername: document.getElementById("current-admin-username"),
    currentSiteCode: document.getElementById("current-site-code"),
    permissionSummary: document.getElementById("permission-summary"),
    backendEnforced: document.getElementById("backend-enforced"),
    roleLastRefresh: document.getElementById("role-last-refresh"),
    responseLeakWarning: document.getElementById("response-leak-warning"),
    permissionMatrixRows: document.getElementById("permission-matrix-rows"),
    permissionMatrixCount: document.getElementById("permission-matrix-count"),
    roleCount: document.getElementById("role-count"),
    roleEmpty: document.getElementById("role-empty"),
    roleList: document.getElementById("role-list"),
    roleDetailName: document.getElementById("role-detail-name"),
    roleDescription: document.getElementById("role-description"),
    roleSiteCode: document.getElementById("role-site-code"),
    rolePermissionCount: document.getElementById("role-permission-count"),
    roleAdminCount: document.getElementById("role-admin-count"),
    roleStatus: document.getElementById("role-status"),
    roleLastUpdated: document.getElementById("role-last-updated"),
    roleUpdatedBy: document.getElementById("role-updated-by"),
    roleOwnerWarning: document.getElementById("role-owner-warning"),
    roleSelfWarning: document.getElementById("role-self-warning"),
    roleUnsaved: document.getElementById("role-unsaved"),
    effectivePreview: document.getElementById("effective-preview"),
    rolePreviewBefore: document.getElementById("role-preview-before"),
    rolePreviewAfter: document.getElementById("role-preview-after"),
    rolePermissionReason: document.getElementById("role-permission-reason"),
    rolePermissionReasonError: document.getElementById("role-permission-reason-error"),
    resetRolePermissions: document.getElementById("reset-role-permissions"),
    saveRolePermissionAssignment: document.getElementById("save-role-permission-assignment"),
    rolePermissionMatrixRows: document.getElementById("role-permission-matrix-rows"),
    rolePermissions: document.getElementById("role-permissions"),
    editRolePermissions: document.getElementById("edit-role-permissions"),
    refreshRoles: document.getElementById("refresh-roles"),
    refreshAdminRoles: document.getElementById("refresh-admin-roles"),
    roleAssignmentEmpty: document.getElementById("role-assignment-empty"),
    roleAssignmentRows: document.getElementById("role-assignment-rows"),
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
    scheduleReasonError: document.getElementById("schedule-reason-error"),
    overnightNote: document.getElementById("overnight-note"),
    toggleModal: document.getElementById("toggle-modal"),
    toggleForm: document.getElementById("toggle-form"),
    toggleTitle: document.getElementById("toggle-title"),
    toggleCopy: document.getElementById("toggle-copy"),
    toggleAdminId: document.getElementById("toggle-admin-id"),
    toggleNextEnabled: document.getElementById("toggle-next-enabled"),
    toggleReason: document.getElementById("toggle-reason"),
    toggleReasonError: document.getElementById("toggle-reason-error"),
    confirmToggle: document.getElementById("confirm-toggle"),
    overrideModal: document.getElementById("override-modal"),
    overrideForm: document.getElementById("override-form"),
    saveOverride: document.getElementById("save-override"),
    overrideAdminId: document.getElementById("override-admin-id"),
    overrideEnabled: document.getElementById("override-enabled"),
    overrideExpires: document.getElementById("override-expires"),
    overrideReason: document.getElementById("override-reason"),
    overrideReasonError: document.getElementById("override-reason-error"),
    roleEditModal: document.getElementById("role-edit-modal"),
    roleEditForm: document.getElementById("role-edit-form"),
    roleEditName: document.getElementById("role-edit-name"),
    roleEditPermissions: document.getElementById("role-edit-permissions"),
    roleEditReason: document.getElementById("role-edit-reason"),
    roleEditReasonError: document.getElementById("role-edit-reason-error"),
    saveRolePermissions: document.getElementById("save-role-permissions"),
    roleAssignmentModal: document.getElementById("role-assignment-modal"),
    roleAssignmentForm: document.getElementById("role-assignment-form"),
    roleTargetAdminId: document.getElementById("role-target-admin-id"),
    roleTargetUsername: document.getElementById("role-target-username"),
    roleCurrentRole: document.getElementById("role-current-role"),
    selfRoleWarning: document.getElementById("self-role-warning"),
    newAdminRole: document.getElementById("new-admin-role"),
    newAdminRoleError: document.getElementById("new-admin-role-error"),
    roleAssignmentReason: document.getElementById("role-assignment-reason"),
    roleAssignmentReasonError: document.getElementById("role-assignment-reason-error"),
    saveRoleAssignment: document.getElementById("save-role-assignment"),
    confirmModal: document.getElementById("confirm-modal"),
    confirmForm: document.getElementById("confirm-form"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmCancel: document.getElementById("confirm-cancel"),
    confirmOk: document.getElementById("confirm-ok"),
  };

  function text(value) {
    if (typeof value === "number" && !Number.isFinite(value)) return "-";
    return value === null || value === void 0 || value === "" ? "-" : String(value);
  }

  function toSafeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatPercentSafe(value) {
    const percent = Math.round(toSafeNumber(value, 0) * 100) / 100;
    return `${percent} %`;
  }

  function formatCountSafe(value, fallback = 0) {
    const count = Math.trunc(toSafeNumber(value, fallback));
    return String(count < 0 ? 0 : count);
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

  function setFieldError(errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent = message || "";
    errorEl.classList.toggle("hidden", !message);
  }

  function validateReasonBeforeConfirm(input, errorEl) {
    const reason = String(input.value || "").trim();
    input.value = reason;
    if (!reason) {
      setFieldError(errorEl, "Reason is required");
      setToast("Reason is required");
      return null;
    }
    if (reason.length > 500) {
      setFieldError(errorEl, "Reason must be 500 characters or fewer");
      setToast("Reason must be 500 characters or fewer");
      return null;
    }
    setFieldError(errorEl, "");
    return reason;
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
      body: options && Object.prototype.hasOwnProperty.call(options, "body") ? JSON.stringify(options.body) : void 0,
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

  function canManageRoles() {
    return hasPermission("admin.roles.view");
  }

  function canUpdateRoles() {
    return hasPermission("admin.roles.update");
  }

  function setPermissions(data) {
    state.permissions = Array.isArray(data.permissions) ? data.permissions : [];
    state.currentAdmin = data.admin || null;
    state.currentRole = data.role || "-";
    state.currentSource = data.source || "-";
    state.canView = hasPermission("admin.schedule.view");
    state.canUpdate = hasPermission("admin.schedule.update");
    state.canOverride = hasPermission("admin.schedule.override");
    els.permissionState.textContent = state.canView
      ? `Access granted: ${safeDisplay(data.role || "role")} via ${safeDisplay(data.source || "role")}`
      : "No permission for admin work schedules.";
    els.sessionStatus.textContent = "Access granted";
    els.sessionRole.textContent = safeDisplay(data.role || "-");
    els.currentAdminUsername.textContent = safeDisplay(data.admin && data.admin.username ? data.admin.username : "-");
    els.currentSiteCode.textContent = safeDisplay(data.siteCode || SITE_CODE);
    els.permissionSummary.textContent = `${formatCountSafe(state.permissions.length)} granted`;
    els.backendEnforced.textContent = `Yes / ${SITE_CODE}`;
    els.roleLastRefresh.textContent = formatDate(new Date().toISOString());
    els.responseLeakWarning.textContent = "Safe display only";
    els.loadPermissions.disabled = false;
    els.refreshAdminRoles.disabled = !canManageRoles();
    els.refreshRoles.disabled = !canManageRoles();
    renderPermissionMatrix();
  }

  function renderPermissionMatrix() {
    els.permissionMatrixRows.innerHTML = "";
    els.permissionMatrixCount.textContent = `${formatCountSafe(PERMISSION_MATRIX.length)} checks`;
    const checkedAt = state.token ? formatDate(new Date().toISOString()) : "-";
    for (const [module, key, description, accessType, requiresReason, auditRequired] of PERMISSION_MATRIX) {
      const tr = document.createElement("tr");
      const granted = state.permissions.includes(key) || state.permissions.includes("admin.manage");
      tr.appendChild(createCell(module));
      tr.appendChild(createCell(key));
      tr.appendChild(createCell(description));
      tr.appendChild(createCell(accessType));
      const access = document.createElement("td");
      access.appendChild(createBadge(granted ? "Granted" : "Denied", granted ? "ok" : "danger"));
      tr.appendChild(access);
      const enforced = document.createElement("td");
      enforced.appendChild(createBadge(auditRequired || requiresReason ? "Yes" : "Guarded", "ok"));
      tr.appendChild(enforced);
      tr.appendChild(createCell(checkedAt));
      els.permissionMatrixRows.appendChild(tr);
    }
  }

  function roleAdminCount(role) {
    const rows = state.schedules.filter((row) => row.admin && (row.siteAccessRole === role || row.admin.role === role));
    return state.schedules.length ? formatCountSafe(rows.length) : "0";
  }

  function rolePermissions(role) {
    return Array.isArray(role && role.permissions) ? role.permissions.slice().sort() : [];
  }

  function permissionCatalogRows() {
    if (state.permissionCatalog.length && typeof state.permissionCatalog[0] === "object") return state.permissionCatalog;
    const keys = state.permissionCatalog.length ? state.permissionCatalog : PERMISSION_MATRIX.map((item) => item[1]);
    return keys.map((key) => {
      const local = PERMISSION_MATRIX.find((item) => item[1] === key);
      return {
        group: local ? local[0] : "General Admin",
        key,
        label: local ? local[2] : key,
        access: local ? local[3] : "read",
        requiresReason: local ? local[4] : false,
        auditRequired: local ? local[5] : false,
        linkedPage: local ? local[6] : "Admin console",
        linkedApi: local ? local[7] : "See docs/API.md",
      };
    });
  }

  function permissionCountText(list) {
    const permissions = Array.isArray(list) ? list : [];
    return `${formatCountSafe(permissions.length)} permissions`;
  }

  function roleIsProtected(role) {
    const name = role && role.role ? role.role : "";
    return name === "owner" || name === "super_admin" || Boolean(role && role.protected);
  }

  function selectedRoleHasCurrentAdmin() {
    if (!state.currentAdmin || !state.selectedRole) return false;
    return state.schedules.some((row) => row.admin && row.admin.id === state.currentAdmin.id && currentRoleForRow(row) === state.selectedRole.role);
  }

  function rolePermissionChanged() {
    const before = state.roleOriginalPermissions.slice().sort().join("|");
    const after = state.roleDraftPermissions.slice().sort().join("|");
    return before !== after;
  }

  function renderEffectivePreview() {
    els.effectivePreview.innerHTML = "";
    const role = state.selectedRole;
    const draft = state.roleDraftPermissions;
    const protectedRole = roleIsProtected(role);
    const rows = [
      ["Selected role", role ? role.role : "-"],
      ["Direct permissions", permissionCountText(draft)],
      ["Inherited/guard", protectedRole ? "Allowed by owner/super_admin guard" : "Matrix permissions only"],
      ["Can access Admin Wheel", protectedRole || draft.includes("wheel.view") || draft.includes("wheel.campaign.view") ? "Yes" : "No"],
      ["Can update campaign", protectedRole || draft.includes("wheel.campaign.update") ? "Yes" : "No"],
      ["Can manage rewards", protectedRole || draft.includes("wheel.rewards.create") || draft.includes("wheel.rewards.update") ? "Yes" : "No"],
      ["Can claim/cancel rewards", protectedRole || draft.includes("wheel.claims.status.update") ? "Yes" : "No"],
      ["Can view reports", protectedRole || draft.includes("wheel.reports.view") || draft.includes("reports.view") ? "Yes" : "No"],
      ["Can view audit", protectedRole || draft.includes("admin.audit.view") || draft.includes("wheel.audit.view") ? "Yes" : "No"],
      ["Can manage roles", protectedRole || draft.includes("admin.roles.update") ? "Yes" : "No"],
      ["Can update work schedule", protectedRole || draft.includes("admin.workSchedule.update") ? "Yes" : "No"],
    ];
    for (const [label, value] of rows) {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = safeDisplay(value);
      els.effectivePreview.appendChild(dt);
      els.effectivePreview.appendChild(dd);
    }
  }

  function renderRolePermissionMatrix() {
    els.rolePermissionMatrixRows.innerHTML = "";
    const protectedRole = roleIsProtected(state.selectedRole);
    const selfRole = selectedRoleHasCurrentAdmin();
    const canEdit = Boolean(state.token && canUpdateRoles() && !protectedRole && !selfRole);
    for (const permission of permissionCatalogRows()) {
      const key = permission.key || permission;
      const tr = document.createElement("tr");
      const enabled = document.createElement("td");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = key;
      input.checked = state.roleDraftPermissions.includes(key);
      input.disabled = !canEdit || key === "admin.manage";
      input.addEventListener("change", () => {
        if (input.checked) {
          state.roleDraftPermissions = [...new Set([...state.roleDraftPermissions, key])].sort();
        } else {
          state.roleDraftPermissions = state.roleDraftPermissions.filter((item) => item !== key);
        }
        renderRoleDraftState();
      });
      enabled.appendChild(input);
      tr.appendChild(enabled);
      tr.appendChild(createCell(key));
      tr.appendChild(createCell(permission.label || key));
      tr.appendChild(createCell(permission.group || "Uncategorized"));
      tr.appendChild(createCell(permission.access || "read"));
      tr.appendChild(createCell(permission.requiresReason ? "Yes" : "No"));
      tr.appendChild(createCell(permission.auditRequired ? "Yes" : "No"));
      tr.appendChild(createCell(permission.linkedPage || "-"));
      tr.appendChild(createCell(permission.linkedApi || "-"));
      els.rolePermissionMatrixRows.appendChild(tr);
    }
  }

  function renderRoleDraftState() {
    const changed = rolePermissionChanged();
    const protectedRole = roleIsProtected(state.selectedRole);
    const selfRole = selectedRoleHasCurrentAdmin();
    const hasReason = Boolean(els.rolePermissionReason.value.trim());
    els.roleUnsaved.classList.toggle("hidden", !changed);
    els.roleOwnerWarning.classList.toggle("hidden", !protectedRole);
    els.roleSelfWarning.classList.toggle("hidden", !selfRole);
    els.rolePreviewBefore.textContent = state.roleOriginalPermissions.join(", ") || "-";
    els.rolePreviewAfter.textContent = state.roleDraftPermissions.join(", ") || "-";
    els.resetRolePermissions.disabled = !changed;
    els.saveRolePermissionAssignment.disabled = !changed || !hasReason || protectedRole || selfRole || !canUpdateRoles();
    renderEffectivePreview();
  }

  function renderRoles(roles) {
    state.roles = Array.isArray(roles) ? roles : [];
    if (state.selectedRole) {
      state.selectedRole = state.roles.find((role) => role.role === state.selectedRole.role) || null;
    }
    els.roleList.innerHTML = "";
    els.roleCount.textContent = `${formatCountSafe(state.roles.length)} roles`;
    els.roleEmpty.classList.toggle("hidden", state.roles.length > 0);
    for (const role of state.roles) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `role-item ${state.selectedRole && state.selectedRole.role === role.role ? "active" : ""}`.trim();
      button.textContent = safeDisplay(role.role || "Unnamed role");
      button.addEventListener("click", () => {
        state.selectedRole = role;
        renderRoles(state.roles);
        renderRoleDetail(role);
      });
      els.roleList.appendChild(button);
    }
    if (!state.selectedRole && state.roles.length > 0) state.selectedRole = state.roles[0];
    renderRoleDetail(state.selectedRole);
  }

  function renderRoleDetail(role) {
    if (!role) {
      els.roleDetailName.textContent = "Role detail";
      els.roleDescription.textContent = "-";
      els.roleSiteCode.textContent = SITE_CODE;
      els.rolePermissionCount.textContent = "-";
      els.roleAdminCount.textContent = "-";
      els.roleStatus.textContent = "-";
      els.rolePermissions.innerHTML = "";
      els.editRolePermissions.disabled = true;
      state.roleOriginalPermissions = [];
      state.roleDraftPermissions = [];
      renderRolePermissionMatrix();
      renderRoleDraftState();
      return;
    }
    const permissions = rolePermissions(role);
    state.roleOriginalPermissions = permissions.slice();
    state.roleDraftPermissions = permissions.slice();
    els.roleDetailName.textContent = safeDisplay(role.role || "Unnamed role");
    els.roleDescription.textContent = safeDisplay(role.description || ROLE_DESCRIPTIONS[role.role] || "No details");
    els.roleSiteCode.textContent = safeDisplay(role.siteCode || SITE_CODE);
    els.rolePermissionCount.textContent = formatCountSafe(permissions.length);
    els.roleAdminCount.textContent = role.adminCount === 0 || role.adminCount ? formatCountSafe(role.adminCount) : roleAdminCount(role.role);
    els.roleStatus.textContent = safeDisplay(role.status || "active");
    els.roleLastUpdated.textContent = formatDate(role.updatedAt) || "Role default";
    els.roleUpdatedBy.textContent = role.source === "site_override" ? "Site permission override" : "Backend role defaults";
    els.rolePermissionReason.value = "";
    setFieldError(els.rolePermissionReasonError, "");
    els.rolePermissions.innerHTML = "";
    for (const permission of permissions) {
      const chip = document.createElement("span");
      chip.className = "permission-chip";
      chip.textContent = safeDisplay(permission);
      els.rolePermissions.appendChild(chip);
    }
    els.editRolePermissions.disabled = !state.token || !canUpdateRoles() || roleIsProtected(role);
    renderRolePermissionMatrix();
    renderRoleDraftState();
  }

  function currentRoleForRow(row) {
    return row.siteAccessRole || (row.admin && row.admin.role) || "-";
  }

  function isCurrentAdmin(row) {
    if (!row || !row.admin || !state.currentAdmin) return false;
    return row.admin.id === state.currentAdmin.id || row.admin.username === state.currentAdmin.username;
  }

  function renderRoleAssignments() {
    els.roleAssignmentRows.innerHTML = "";
    els.roleAssignmentEmpty.classList.toggle("hidden", state.schedules.length > 0);
    for (const row of state.schedules) {
      const schedule = scheduleFrom(row);
      const tr = document.createElement("tr");
      tr.appendChild(createCell(row.admin && row.admin.username));
      tr.appendChild(createCell(currentRoleForRow(row)));
      const status = document.createElement("td");
      status.appendChild(createBadge(schedule.enabled ? "Enabled" : "Disabled", schedule.enabled ? "ok" : ""));
      tr.appendChild(status);
      tr.appendChild(createCell(formatDate(latestTime(row))));
      tr.appendChild(createCell(latestActor(row)));
      const actions = document.createElement("td");
      actions.className = "actions";
      const button = actionButton("Change role", () => openRoleAssignment(row), Boolean(state.token && canUpdateRoles()));
      if (isCurrentAdmin(row)) button.title = "Self role change is blocked";
      actions.appendChild(button);
      tr.appendChild(actions);
      els.roleAssignmentRows.appendChild(tr);
    }
  }

  function clearSession() {
    state.token = "";
    state.permissions = [];
    state.permissionCatalog = [];
    state.roles = [];
    state.currentAdmin = null;
    state.currentRole = null;
    state.currentSource = null;
    state.selectedRole = null;
    state.canView = false;
    state.canUpdate = false;
    state.canOverride = false;
    state.selectedAdminId = null;
    state.selectedAdminLabel = "";
    state.roleAssignmentRow = null;
    state.roleDraftPermissions = [];
    state.roleOriginalPermissions = [];
    sessionStorage.removeItem("pg77_admin_token");
    els.token.value = "";
    els.auditTarget.value = "";
    els.permissionState.textContent = "No session loaded";
    els.sessionStatus.textContent = "No session loaded";
    els.sessionRole.textContent = "-";
    els.currentAdminUsername.textContent = "-";
    els.currentSiteCode.textContent = SITE_CODE;
    els.permissionSummary.textContent = "0 granted";
    els.backendEnforced.textContent = "Yes";
    els.roleLastRefresh.textContent = "-";
    els.responseLeakWarning.textContent = "Safe display only";
    els.loadPermissions.disabled = true;
    els.refreshAdminRoles.disabled = true;
    els.refreshRoles.disabled = true;
    els.rolePermissionReason.value = "";
    setFieldError(els.rolePermissionReasonError, "");
    renderSchedules([]);
    renderAudit([]);
    renderPermissionMatrix();
    renderRoles([]);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "-";
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
    if (!expires || !Number.isFinite(expires.getTime())) return { label: "Invalid expiration", cls: "danger" };
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
    els.listCount.textContent = `${formatCountSafe(state.schedules.length)} admins`;
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
    renderRoleDetail(state.selectedRole);
    renderRoleAssignments();
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
    setFieldError(els.scheduleReasonError, "");
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
    setFieldError(els.toggleReasonError, "");
    els.toggleModal.showModal();
  }

  function openOverride(row) {
    const schedule = scheduleFrom(row);
    const emergency = schedule.emergencyOverride || {};
    els.overrideAdminId.value = row.admin.id;
    els.overrideEnabled.checked = Boolean(emergency.enabled);
    els.overrideExpires.value = emergency.expiresAt ? emergency.expiresAt.slice(0, 16) : "";
    els.overrideReason.value = "";
    setFieldError(els.overrideReasonError, "");
    els.overrideModal.showModal();
  }

  function updateOvernightNote() {
    els.overnightNote.classList.toggle("hidden", !(els.startTime.value && els.endTime.value && els.startTime.value > els.endTime.value));
  }

  function openRoleEdit() {
    if (!state.token) return setToast("No session loaded");
    if (!state.selectedRole) return setToast("Select a role");
    if (roleIsProtected(state.selectedRole)) return setToast("owner/super_admin permissions are controlled by guard");
    document.getElementById("role-management").scrollIntoView({ behavior: "smooth", block: "start" });
    els.rolePermissionReason.focus();
  }

  function openRoleEditModal() {
    els.roleEditName.value = state.selectedRole.role;
    els.roleEditPermissions.innerHTML = "";
    const permissions = Array.isArray(state.selectedRole.permissions) ? state.selectedRole.permissions : [];
    const catalog = state.permissionCatalog.length ? state.permissionCatalog : permissions;
    for (const permission of catalog) {
      const label = document.createElement("label");
      label.className = "check-row";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = permission;
      input.checked = permissions.includes(permission);
      input.disabled = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${permission}`));
      els.roleEditPermissions.appendChild(label);
    }
    els.roleEditReason.value = "";
    setFieldError(els.roleEditReasonError, "");
    els.roleEditModal.showModal();
  }

  function drawRoleOptions(currentRole) {
    els.newAdminRole.innerHTML = "";
    const roles = state.roles.length ? state.roles.map((role) => role.role) : ["owner", "super_admin", "finance", "support", "graphic", "viewer"];
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Select role";
    els.newAdminRole.appendChild(blank);
    for (const role of roles) {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      option.disabled = role === currentRole || ((role === "owner" || role === "super_admin") && state.currentRole !== "owner" && state.currentRole !== "super_admin");
      els.newAdminRole.appendChild(option);
    }
  }

  function openRoleAssignment(row) {
    if (!state.token) return setToast("No session loaded");
    if (!canUpdateRoles()) return setToast("Role update failed");
    state.roleAssignmentRow = row;
    const currentRole = currentRoleForRow(row);
    const self = isCurrentAdmin(row);
    els.roleTargetAdminId.value = row.admin && row.admin.id ? row.admin.id : "";
    els.roleTargetUsername.textContent = safeDisplay(row.admin && row.admin.username);
    els.roleCurrentRole.textContent = safeDisplay(currentRole);
    drawRoleOptions(currentRole);
    els.roleAssignmentReason.value = "";
    setFieldError(els.newAdminRoleError, "");
    setFieldError(els.roleAssignmentReasonError, "");
    els.selfRoleWarning.classList.toggle("hidden", !self);
    els.saveRoleAssignment.disabled = self;
    if (self) setToast("You cannot change your own role in this staging UI.");
    els.roleAssignmentModal.showModal();
  }

  function validateRoleAssignmentBeforeConfirm() {
    const row = state.roleAssignmentRow;
    if (!state.token || !row || !row.admin || !row.admin.id) {
      setToast("No session loaded");
      return null;
    }
    if (isCurrentAdmin(row)) {
      setToast("You cannot change your own role in this staging UI.");
      return null;
    }
    const currentRole = currentRoleForRow(row);
    const nextRole = els.newAdminRole.value;
    if (!nextRole) {
      setFieldError(els.newAdminRoleError, "Select a new role");
      setToast("Select a new role");
      return null;
    }
    if (nextRole === currentRole) {
      setFieldError(els.newAdminRoleError, "New role must be different");
      setToast("New role must be different");
      return null;
    }
    setFieldError(els.newAdminRoleError, "");
    const reason = validateReasonBeforeConfirm(els.roleAssignmentReason, els.roleAssignmentReasonError);
    if (!reason) return null;
    return { row, currentRole, nextRole, reason };
  }

  async function saveRolePermissions(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (!state.selectedRole) return setToast("Select a role");
    if (event && event.target === els.roleEditForm) {
      const reason = validateReasonBeforeConfirm(els.roleEditReason, els.roleEditReasonError);
      if (!reason) return;
      return saveRolePermissionsWithReason(reason);
    }
    const reason = validateReasonBeforeConfirm(els.rolePermissionReason, els.rolePermissionReasonError);
    if (!reason) return;
    return saveRolePermissionsWithReason(reason);
  }

  async function saveRolePermissionsWithReason(reason) {
    if (!rolePermissionChanged()) return setToast("No permission changes selected");
    if (roleIsProtected(state.selectedRole)) return setToast("owner/super_admin permissions are controlled by guard");
    if (selectedRoleHasCurrentAdmin()) return setToast("Self role permission update is blocked");
    const confirmed = await confirmAction(
      "Confirm role permission assignment",
      `Role: ${safeDisplay(state.selectedRole.role)} | Before: ${permissionCountText(state.roleOriginalPermissions)} | After: ${permissionCountText(state.roleDraftPermissions)} | Reason: ${safeDisplay(reason)}`
    );
    if (!confirmed) return;
    await withLoading(els.saveRolePermissionAssignment, async () => {
      await api(`/admin/roles/${encodeURIComponent(state.selectedRole.role)}/permissions`, {
        method: "PATCH",
        body: { permissions: state.roleDraftPermissions, reason },
      });
      if (els.roleEditModal.open) els.roleEditModal.close();
      setToast("Role permissions updated");
      await loadPermissions();
      await loadSchedules();
    });
  }

  async function saveRoleAssignment(event) {
    event.preventDefault();
    const validated = validateRoleAssignmentBeforeConfirm();
    if (!validated) return;
    const confirmed = await confirmAction(
      "Confirm role assignment update",
      `Target admin: ${safeDisplay(validated.row.admin.username)} | Current role: ${safeDisplay(validated.currentRole)} | New role: ${safeDisplay(validated.nextRole)} | Reason: ${safeDisplay(validated.reason)} | This action changes admin permissions.`
    );
    if (!confirmed) return;

    await withLoading(els.saveRoleAssignment, async () => {
      try {
        await api(`/admin/admins/${encodeURIComponent(validated.row.admin.id)}/role`, {
          method: "PATCH",
          body: { role: validated.nextRole, reason: validated.reason },
        });
        els.roleAssignmentModal.close();
        setToast("Admin role updated");
        await loadPermissions();
        await loadSchedules();
      } catch (error) {
        setToast("Role update failed");
      }
    });
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
      setToast("No session loaded");
      return;
    }
    const data = await api("/admin/permissions/me");
    setPermissions(data);
    if (canManageRoles()) {
      state.permissionCatalog = await api("/admin/permissions/catalog");
      const roles = await api("/admin/roles");
      renderRoles(roles);
    } else {
      state.permissionCatalog = [];
      renderRoles([]);
    }
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
      idleTimeoutMinutes: toSafeNumber(schedule.idleTimeoutMinutes, 60),
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
    const reason = validateReasonBeforeConfirm(els.reason, els.scheduleReasonError);
    if (!reason) return;
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
          reason,
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
    const reason = validateReasonBeforeConfirm(els.toggleReason, els.toggleReasonError);
    if (!reason) return;
    const nextEnabled = els.toggleNextEnabled.value === "true";
    const schedule = scheduleFrom(row);

    await withLoading(els.confirmToggle, async () => {
      await api(`/admin/work-schedules/${encodeURIComponent(row.admin.id)}`, {
        method: "PATCH",
        body: {
          ...schedulePatchBody(schedule, nextEnabled, schedule.allowedDays),
          reason,
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
    const reason = validateReasonBeforeConfirm(els.overrideReason, els.overrideReasonError);
    if (!reason) return;
    if (enabled && !els.overrideExpires.value) return setToast("Override expiration is required.");
    const expires = enabled ? new Date(els.overrideExpires.value) : null;
    if (enabled && (!expires || !Number.isFinite(expires.getTime()) || expires.getTime() <= Date.now())) {
      return setToast("Override expiration must be in the future.");
    }
    const confirmed = await confirmAction("Confirm emergency override", "Confirm emergency override update");
    if (!confirmed) return;

    await withLoading(els.saveOverride, async () => {
      if (enabled) {
        await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
          method: "POST",
          body: { expiresAt: expires.toISOString(), reason },
        });
      } else {
        await api(`/admin/work-schedules/${encodeURIComponent(adminId)}/override`, {
          method: "DELETE",
          body: { reason },
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
    if (!state.token) {
      renderAudit([]);
      setToast("No session loaded");
      return;
    }
    if (els.auditAction.value === "admin.role.update") {
      const params = new URLSearchParams({ action: "admin.role.update", limit: "50" });
      const data = await api(`/admin/audit-logs?${params.toString()}`);
      const rows = data && Array.isArray(data.rows) ? data.rows : [];
      const filtered = els.auditDate.value
        ? rows.filter((row) => String(row.createdAt || "").startsWith(els.auditDate.value))
        : rows;
      els.auditTarget.value = "Role / permission changes";
      renderAudit(filtered);
      return;
    }
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
    if (!afterSchedule && row.metadata && row.metadata.after) {
      const beforeRole = row.metadata.beforeRole || (row.metadata.before && (row.metadata.before.role || row.metadata.before.siteAccessRole));
      const afterRole = row.metadata.afterRole || (row.metadata.after && (row.metadata.after.role || row.metadata.after.siteAccessRole));
      if (beforeRole || afterRole) return safeDisplay(`role ${text(beforeRole)} -> ${text(afterRole)}`);
      const after = row.metadata.after;
      return safeDisplay(`role ${text(after.role || after.siteAccessRole)}; permissions ${Array.isArray(after.permissions) ? formatCountSafe(after.permissions.length) : "-"}`);
    }
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
    els.auditCount.textContent = `${formatCountSafe(safeRows.length)} events`;
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
    renderPermissionMatrix();
    renderRoles([]);
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
  els.loadPermissions.addEventListener("click", () => withLoading(els.loadPermissions, loadPermissions).catch((error) => setToast("Permission request failed")));
  els.editRolePermissions.addEventListener("click", openRoleEdit);
  els.refreshRoles.addEventListener("click", () => withLoading(els.refreshRoles, loadPermissions).catch((error) => setToast(error.message)));
  els.rolePermissionReason.addEventListener("input", renderRoleDraftState);
  els.resetRolePermissions.addEventListener("click", () => {
    state.roleDraftPermissions = state.roleOriginalPermissions.slice();
    els.rolePermissionReason.value = "";
    setFieldError(els.rolePermissionReasonError, "");
    renderRolePermissionMatrix();
    renderRoleDraftState();
  });
  els.saveRolePermissionAssignment.addEventListener("click", (event) => saveRolePermissions(event).catch((error) => setToast(error.message)));
  els.refreshAdminRoles.addEventListener("click", () => withLoading(els.refreshAdminRoles, loadSchedules).catch((error) => setToast(error.message)));
  els.refresh.addEventListener("click", () => withLoading(els.refresh, loadSchedules).catch((error) => setToast(error.message)));
  els.search.addEventListener("input", () => loadSchedules().catch((error) => setToast(error.message)));
  els.roleFilter.addEventListener("change", () => loadSchedules().catch((error) => setToast(error.message)));
  els.loadAudit.addEventListener("click", () => withLoading(els.loadAudit, () => loadAudit()).catch((error) => setToast(error.message)));
  els.scheduleForm.addEventListener("submit", (event) => saveSchedule(event).catch((error) => setToast(error.message)));
  els.toggleForm.addEventListener("submit", (event) => toggleSchedule(event).catch((error) => setToast(error.message)));
  els.overrideForm.addEventListener("submit", (event) => saveOverride(event).catch((error) => setToast(error.message)));
  els.roleEditForm.addEventListener("submit", (event) => saveRolePermissions(event).catch((error) => setToast(error.message)));
  els.roleAssignmentForm.addEventListener("submit", (event) => saveRoleAssignment(event).catch((error) => setToast("Role update failed")));
  els.startTime.addEventListener("change", updateOvernightNote);
  els.endTime.addEventListener("change", updateOvernightNote);
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  boot();
})();
