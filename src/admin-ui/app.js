(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const DASHBOARD_REPORTS_CONNECTED_NOTE =
    "Backend-connected read-only local-safe dashboard/report surface uses GET /api/admin/reports/summary, GET /api/admin/reports/deposits, GET /api/admin/reports/withdrawals, GET /api/admin/reports/wallet-ledger, GET /api/admin/logs, and GET /api/admin/members.";
  const MEMBER_CODE_REWARD_CONNECTED_NOTE =
    "Member reward wallet and code center stay backend-connected/local-safe through POST /api/code-center/redeem, GET /api/code-center/redeem-logs, GET /api/member/rewards, GET /api/member/rewards/summary, and GET /api/member/rewards/history. Lucky Wheel rewards remain backend-selected via GET /api/admin/wheel/member-rewards and GET /api/member/wheel/my-rewards.";
  const PROMOTION_BONUS_CONNECTED_NOTE =
    "Promotion/bonus visibility stays backend-connected/read-only/local-safe through GET /api/promotions, GET /api/admin/reports/summary, GET /api/admin/reports/wallet-ledger, and existing member history promotion claim/turnover rows; POST /api/promotions/:id/claim is not surfaced in backoffice because it can create promotion_bonus ledger and turnover requirement rows.";
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
    ["General Admin", "dashboard.view", "View dashboard cards", "read", false, false, "#dashboard", "GET /api/admin/reports/summary"],
    ["General Admin", "reports.view", "View dashboard summary and reports", "read", false, false, "#dashboard", "GET /api/admin/reports/summary"],
    ["General Admin", "members.view", "View member list/detail", "read", false, false, "#members", "GET /api/admin/members, GET /api/admin/members/:id"],
    ["General Admin", "members.bank.view", "View pending member bank accounts", "read", false, false, "#member-pending-bank", "GET /api/admin/bank-accounts/pending"],
    ["General Admin", "members.bank.approve", "Approve/reject pending member bank accounts", "write", true, true, "#member-pending-bank", "POST /api/admin/bank-accounts/:id/approve, POST /api/admin/bank-accounts/:id/reject"],
    ["General Admin", "wallet.view", "View wallet ledger", "read", false, false, "#wallet-ledger-readonly", "GET /api/admin/reports/wallet-ledger"],
    ["General Admin", "bank.view", "View mock bank statements", "read", false, false, "#bank-summary-readonly", "GET /api/admin/bank/mock/statements/deposits, GET /api/admin/bank/mock/statements/withdrawals"],
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
    canViewReports: false,
    canViewMembers: false,
    canViewWallet: false,
    canViewBank: false,
    canViewBankStatements: false,
    canApproveBank: false,
    canViewAudit: false,
    dashboardSummary: null,
    memberRows: [],
    blockedMemberRows: [],
    pendingBankRows: [],
    ledgerRows: [],
    bankStatementRows: [],
    bankReviewAuditRows: [],
    memberDetail: null,
    memberHistory: {},
    memberAuditRows: [],
    selectedMemberId: null,
    schedules: [],
    selectedAdminId: null,
    selectedAdminLabel: "",
    editingRow: null,
    togglingRow: null,
    roleAssignmentRow: null,
    bankReviewRow: null,
    bankReviewAction: null,
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
    dashboardState: document.getElementById("dashboard-state"),
    refreshDashboard: document.getElementById("refresh-dashboard"),
    dashboardMemberCount: document.getElementById("dashboard-member-count"),
    dashboardTotalDeposit: document.getElementById("dashboard-total-deposit"),
    dashboardTotalWithdraw: document.getElementById("dashboard-total-withdraw"),
    dashboardTotalBonus: document.getElementById("dashboard-total-bonus"),
    dashboardTotalProfitMock: document.getElementById("dashboard-total-profit-mock"),
    dashboardPendingTotal: document.getElementById("dashboard-pending-total"),
    dashboardEmpty: document.getElementById("dashboard-empty"),
    memberListState: document.getElementById("member-list-state"),
    refreshMembers: document.getElementById("refresh-members"),
    memberSearch: document.getElementById("member-search"),
    memberStatusFilter: document.getElementById("member-status-filter"),
    memberCount: document.getElementById("member-count"),
    memberEmpty: document.getElementById("member-empty"),
    memberRows: document.getElementById("member-rows"),
    memberBlockedCount: document.getElementById("member-blocked-count"),
    memberBlockedEmpty: document.getElementById("member-blocked-empty"),
    memberBlockedRows: document.getElementById("member-blocked-rows"),
    memberPendingBankCount: document.getElementById("member-pending-bank-count"),
    memberPendingBankEmpty: document.getElementById("member-pending-bank-empty"),
    memberPendingBankRows: document.getElementById("member-pending-bank-rows"),
    bankReviewModal: document.getElementById("bank-review-modal"),
    bankReviewForm: document.getElementById("bank-review-form"),
    bankReviewTitle: document.getElementById("bank-review-title"),
    bankReviewUsername: document.getElementById("bank-review-username"),
    bankReviewAccount: document.getElementById("bank-review-account"),
    bankReviewReason: document.getElementById("bank-review-reason"),
    bankReviewReasonError: document.getElementById("bank-review-reason-error"),
    bankReviewCancel: document.getElementById("bank-review-cancel"),
    bankReviewConfirm: document.getElementById("bank-review-confirm"),
    bankReviewAuditAction: document.getElementById("bank-review-audit-action"),
    bankReviewAuditUsername: document.getElementById("bank-review-audit-username"),
    bankReviewAuditTarget: document.getElementById("bank-review-audit-target"),
    bankReviewAuditDateFrom: document.getElementById("bank-review-audit-date-from"),
    bankReviewAuditDateTo: document.getElementById("bank-review-audit-date-to"),
    loadBankReviewAudit: document.getElementById("load-bank-review-audit"),
    bankReviewAuditCount: document.getElementById("bank-review-audit-count"),
    bankReviewAuditState: document.getElementById("bank-review-audit-state"),
    bankReviewAuditEmpty: document.getElementById("bank-review-audit-empty"),
    bankReviewAuditRows: document.getElementById("bank-review-audit-rows"),
    bankReviewSummaryPending: document.getElementById("bank-review-summary-pending"),
    bankReviewSummaryApproved: document.getElementById("bank-review-summary-approved"),
    bankReviewSummaryRejected: document.getElementById("bank-review-summary-rejected"),
    bankReviewSummaryDuplicate: document.getElementById("bank-review-summary-duplicate"),
    ledgerCount: document.getElementById("ledger-count"),
    ledgerState: document.getElementById("ledger-state"),
    ledgerEmpty: document.getElementById("ledger-empty"),
    ledgerRows: document.getElementById("ledger-rows"),
    bankStatementCount: document.getElementById("bank-statement-count"),
    bankStatementState: document.getElementById("bank-statement-state"),
    bankStatementEmpty: document.getElementById("bank-statement-empty"),
    bankStatementRows: document.getElementById("bank-statement-rows"),
    memberDetail: document.getElementById("member-detail"),
    memberDetailState: document.getElementById("member-detail-state"),
    memberDetailEmpty: document.getElementById("member-detail-empty"),
    memberDetailRows: document.getElementById("member-detail-rows"),
    backToMembers: document.getElementById("back-to-members"),
    memberBankCount: document.getElementById("member-bank-count"),
    memberBankEmpty: document.getElementById("member-bank-empty"),
    memberBankRows: document.getElementById("member-bank-rows"),
    memberDepositCount: document.getElementById("member-deposit-count"),
    memberDepositEmpty: document.getElementById("member-deposit-empty"),
    memberDepositRows: document.getElementById("member-deposit-rows"),
    memberWithdrawCount: document.getElementById("member-withdraw-count"),
    memberWithdrawEmpty: document.getElementById("member-withdraw-empty"),
    memberWithdrawRows: document.getElementById("member-withdraw-rows"),
    memberAuditCount: document.getElementById("member-audit-count"),
    memberAuditEmpty: document.getElementById("member-audit-empty"),
    memberAuditRows: document.getElementById("member-audit-rows"),
    memberHistoryState: document.getElementById("member-history-state"),
    memberHistoryTabs: document.getElementById("member-history-tabs"),
    historyDepositCount: document.getElementById("history-deposit-count"),
    historyDepositEmpty: document.getElementById("history-deposit-empty"),
    historyDepositRows: document.getElementById("history-deposit-rows"),
    historyWithdrawCount: document.getElementById("history-withdraw-count"),
    historyWithdrawEmpty: document.getElementById("history-withdraw-empty"),
    historyWithdrawRows: document.getElementById("history-withdraw-rows"),
    historyLedgerCount: document.getElementById("history-ledger-count"),
    historyLedgerEmpty: document.getElementById("history-ledger-empty"),
    historyLedgerRows: document.getElementById("history-ledger-rows"),
    historySpinCount: document.getElementById("history-spin-count"),
    historySpinEmpty: document.getElementById("history-spin-empty"),
    historySpinRows: document.getElementById("history-spin-rows"),
    historyRewardCount: document.getElementById("history-reward-count"),
    historyRewardEmpty: document.getElementById("history-reward-empty"),
    historyRewardRows: document.getElementById("history-reward-rows"),
    historyPlayCount: document.getElementById("history-play-count"),
    historyPlayEmpty: document.getElementById("history-play-empty"),
    historyPlayRows: document.getElementById("history-play-rows"),
    historyPrePromotionCount: document.getElementById("history-pre-promotion-count"),
    historyPrePromotionEmpty: document.getElementById("history-pre-promotion-empty"),
    historyPrePromotionRows: document.getElementById("history-pre-promotion-rows"),
    historyReferralCount: document.getElementById("history-referral-count"),
    historyReferralEmpty: document.getElementById("history-referral-empty"),
    historyReferralSource: document.getElementById("history-referral-source"),
    historyUsageCount: document.getElementById("history-usage-count"),
    historyUsageEmpty: document.getElementById("history-usage-empty"),
    historyUsageRows: document.getElementById("history-usage-rows"),
    historyDebtCount: document.getElementById("history-debt-count"),
    historyDebtEmpty: document.getElementById("history-debt-empty"),
    historyDebtRows: document.getElementById("history-debt-rows"),
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
    if (value && typeof value === "object") return "-";
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

  function formatMoneySafe(value) {
    return toSafeNumber(value, 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatMoneyOrFallback(value) {
    return value === null || value === void 0 || value === "" || (value && typeof value === "object") ? "-" : formatMoneySafe(value);
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

  async function adminFetchReadOnly(endpoint, options) {
    const config = options || {};
    const method = String(config.method || "GET").toUpperCase();
    if (method !== "GET") throw new Error("Read-only request blocked.");
    if (!/^\/admin\//.test(endpoint)) throw new Error("Read-only admin endpoint required.");
    const forbiddenPath = /\/(?:approve|reject|credit|debit|spin|payout|transfer)(?:\/|$|-)/i;
    if (forbiddenPath.test(endpoint)) throw new Error("Read-only request blocked.");
    return api(endpoint, { method: "GET" });
  }

  function hasPermission(permission) {
    return state.permissions.includes(permission) || state.permissions.includes("admin.manage");
  }

  function canViewWheelSpins() {
    return hasPermission("wheel.spin.view") || hasPermission("wheel.spins.view");
  }

  function canViewWheelRewards() {
    return hasPermission("wheel.claims.view");
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
    state.canViewReports = hasPermission("reports.view") || hasPermission("dashboard.view");
    state.canViewMembers = hasPermission("members.view");
    state.canViewWallet = hasPermission("wallet.view") || hasPermission("reports.view");
    state.canViewBank = hasPermission("members.bank.view");
    state.canViewBankStatements = hasPermission("bank.view");
    state.canApproveBank = hasPermission("members.bank.approve");
    state.canViewAudit = hasPermission("admin.audit.view");
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
    els.refreshDashboard.disabled = !state.canViewReports;
    updateMemberListControls();
    if (!state.canViewReports) {
      renderDashboardSummary(null, "reports.view permission is required for dashboard summary.");
    }
    if (!state.canViewMembers) {
      renderMemberList([], {
        message: "members.view permission is required for member list.",
        emptyMessage: "ต้องมี permission members.view",
      });
      renderBlockedMembers([], {
        emptyMessage: "ต้องมี permission members.view",
      });
      renderMemberDetail(null, { hide: true });
    }
    if (!state.canViewBank) {
      renderPendingBankAccounts([], {
        emptyMessage: "ต้องมี permission members.bank.view",
      });
    }
    if (!state.canViewBankStatements) {
      renderBankStatements([], {
        stateMessage: "ต้องมี permission bank.view",
        emptyMessage: "ต้องมี permission bank.view",
      });
    }
    if (!state.canViewWallet) {
      renderLedgerRows([], {
        stateMessage: "ต้องมี permission wallet.view",
        emptyMessage: "ต้องมี permission wallet.view",
      });
    }
    if (!state.canViewAudit) {
      renderMemberAudit([], {
        emptyMessage: "ต้องมี permission admin.audit.view",
      });
      renderBankReviewAudit([], {
        stateMessage: "ต้องมี permission admin.audit.view",
        emptyMessage: "ต้องมี permission admin.audit.view",
      });
    }
    updateBankReviewAuditControls();
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
    state.canViewReports = false;
    state.canViewMembers = false;
    state.canViewBank = false;
    state.canViewBankStatements = false;
    state.canApproveBank = false;
    state.canViewAudit = false;
    state.dashboardSummary = null;
    state.memberRows = [];
    state.blockedMemberRows = [];
    state.pendingBankRows = [];
    state.bankReviewAuditRows = [];
    state.memberDetail = null;
    state.memberHistory = {};
    state.memberAuditRows = [];
    state.selectedMemberId = null;
    state.selectedAdminId = null;
    state.selectedAdminLabel = "";
    state.roleAssignmentRow = null;
    state.bankReviewRow = null;
    state.bankReviewAction = null;
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
    els.refreshDashboard.disabled = true;
    updateMemberListControls();
    updateBankReviewAuditControls();
    els.rolePermissionReason.value = "";
    setFieldError(els.rolePermissionReasonError, "");
    renderDashboardSummary(null, "Load an admin credential to read the summary.");
    renderMemberList([], {
      message: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderBlockedMembers([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderPendingBankAccounts([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderBankReviewAudit([], {
      stateMessage: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderLedgerRows([], {
      stateMessage: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ไม่พบข้อมูล",
    });
    renderBankStatements([], {
      stateMessage: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ไม่พบข้อมูล",
    });
    renderMemberAudit([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderMemberDetail(null, { hide: true });
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

  function setDashboardCards(summary) {
    const safeSummary = summary && typeof summary === "object" ? summary : {};
    const pendingDepositCount = toSafeNumber(safeSummary.pending_deposit_count, 0);
    const pendingWithdrawCount = toSafeNumber(safeSummary.pending_withdraw_count, 0);
    els.dashboardMemberCount.textContent = formatCountSafe(safeSummary.new_member_count || safeSummary.member_count);
    els.dashboardTotalDeposit.textContent = formatMoneySafe(safeSummary.total_deposit);
    els.dashboardTotalWithdraw.textContent = formatMoneySafe(safeSummary.total_withdraw);
    els.dashboardTotalBonus.textContent = formatMoneySafe(safeSummary.total_bonus);
    els.dashboardTotalProfitMock.textContent = formatMoneySafe(safeSummary.total_profit || safeSummary.total_profit_mock);
    els.dashboardPendingTotal.textContent = formatCountSafe(safeSummary.online_member_count || pendingDepositCount + pendingWithdrawCount);
  }

  function resetDashboardCards() {
    for (const el of [
      els.dashboardMemberCount,
      els.dashboardTotalDeposit,
      els.dashboardTotalWithdraw,
      els.dashboardTotalBonus,
      els.dashboardTotalProfitMock,
      els.dashboardPendingTotal,
    ]) {
      el.textContent = el === els.dashboardTotalDeposit || el === els.dashboardTotalWithdraw || el === els.dashboardTotalBonus || el === els.dashboardTotalProfitMock ? "0.00" : "0";
    }
  }

  function renderDashboardSummary(summary, message) {
    const safeSummary = summary && typeof summary === "object" ? summary : null;
    state.dashboardSummary = safeSummary;
    els.dashboardState.textContent = safeDisplay(
      message || (safeSummary ? `Dashboard summary loaded. ${DASHBOARD_REPORTS_CONNECTED_NOTE}` : "No dashboard summary loaded.")
    );
    if (!safeSummary) {
      resetDashboardCards();
      els.dashboardEmpty.classList.add("hidden");
      return;
    }

    setDashboardCards(safeSummary);
    const activityTotal = [
      safeSummary.member_count,
      safeSummary.total_deposit,
      safeSummary.total_withdraw,
      safeSummary.total_bonus,
      safeSummary.total_profit_mock,
      safeSummary.pending_deposit_count,
      safeSummary.pending_withdraw_count,
    ].reduce((total, value) => total + toSafeNumber(value, 0), 0);
    els.dashboardEmpty.classList.toggle("hidden", activityTotal > 0);
  }

  function updateMemberListControls() {
    const enabled = Boolean(state.token && state.canViewMembers);
    els.refreshMembers.disabled = !enabled;
    els.memberSearch.disabled = !enabled;
    els.memberStatusFilter.disabled = !enabled;
  }

  function updateBankReviewAuditControls() {
    const enabled = Boolean(state.token && state.canViewAudit);
    for (const input of [
      els.bankReviewAuditAction,
      els.bankReviewAuditUsername,
      els.bankReviewAuditTarget,
      els.bankReviewAuditDateFrom,
      els.bankReviewAuditDateTo,
      els.loadBankReviewAudit,
    ]) {
      input.disabled = !enabled;
    }
  }

  function objectValue(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }

  function arrayValue(value) {
    return Array.isArray(value) ? value : [];
  }

  function memberQueryParams() {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    const search = els.memberSearch.value.trim();
    if (search) params.set("search", search);
    if (els.memberStatusFilter.value) params.set("status", els.memberStatusFilter.value);
    return params;
  }

  function memberWallet(member) {
    return objectValue(member && member.walletAccount) || {};
  }

  function memberBankSummary(member) {
    const accounts = arrayValue(member && member.bankAccounts);
    if (!accounts.length) return "-";
    const counts = new Map();
    for (const account of accounts) {
      const status = text(account && account.status);
      counts.set(status, (counts.get(status) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count]) => `${safeDisplay(status)} ${formatCountSafe(count)}`)
      .join(", ");
  }

  function memberStatusBadge(member) {
    const status = text(member && member.status);
    const normalized = status.toLowerCase();
    const cls = normalized === "active" ? "ok" : normalized === "blocked" ? "danger" : normalized === "-" ? "" : "warn";
    return createBadge(safeDisplay(status), cls);
  }

  function recordStatusBadge(value) {
    const status = text(value);
    const normalized = status.toLowerCase();
    const okStatuses = new Set(["active", "approved", "completed", "paid"]);
    const dangerStatuses = new Set(["blocked", "cancelled", "canceled", "failed", "rejected"]);
    const cls = okStatuses.has(normalized) ? "ok" : dangerStatuses.has(normalized) ? "danger" : normalized === "-" ? "" : "warn";
    return createBadge(safeDisplay(status), cls);
  }

  function createStatusCell(value) {
    const td = document.createElement("td");
    td.appendChild(recordStatusBadge(value));
    return td;
  }

  function booleanText(value) {
    return typeof value === "boolean" ? (value ? "Yes" : "No") : text(value);
  }

  function relationCount(member, key, label) {
    return Array.isArray(member && member[key]) ? `${formatCountSafe(member[key].length)} ${label}` : "-";
  }

  function moneyWithCurrency(value, currency) {
    const amount = formatMoneyOrFallback(value);
    if (amount === "-") return "-";
    return `${amount} ${safeDisplay(currency || "THB")}`;
  }

  function createMemberIdentityCell(member) {
    const td = document.createElement("td");
    const name = document.createElement("strong");
    const id = document.createElement("span");
    name.textContent = safeDisplay((member && member.username) || "-");
    id.textContent = safeDisplay(member && member.id);
    td.appendChild(name);
    td.appendChild(document.createElement("br"));
    td.appendChild(id);
    return td;
  }

  function createMemberDetailButton(member) {
    const memberId = member && member.id ? String(member.id) : "";
    const button = actionButton("Detail / Read-only", () => openMemberDetail(memberId, button), Boolean(state.token && state.canViewMembers && memberId));
    button.dataset.memberDetailTrigger = "true";
    button.setAttribute("aria-label", "Open member detail read-only");
    button.title = "Open member detail read-only";
    if (!memberId) button.title = "Member id is missing";
    return button;
  }

  function payloadRows(payload) {
    if (Array.isArray(payload)) return payload;
    const object = objectValue(payload);
    if (!object) return [];
    return arrayValue(object.rows).concat(arrayValue(object.data)).slice(0, 100);
  }

  function primaryBankAccount(member) {
    const accounts = arrayValue(member && member.bankAccounts);
    return objectValue(accounts[0]) || {};
  }

  function memberBankValue(account, keys) {
    for (const key of keys) {
      if (account && account[key] !== null && account[key] !== void 0 && account[key] !== "") return account[key];
    }
    return "-";
  }

  function maskedAccountValue(row) {
    const value = memberBankValue(row, ["accountNumberMasked", "maskedAccountNumber", "accountMask", "accountNumber", "accountNo", "number"]);
    const digits = String(value || "").replace(/\s+/g, "");
    if (!digits || value === "-") return "-";
    if (String(value).includes("*")) return value;
    if (digits.length <= 4) return "****";
    return `${"*".repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
  }

  function nestedUser(row) {
    return objectValue(row && row.user) || objectValue(row && row.member) || {};
  }

  function renderBlockedMembers(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.blockedMemberRows = safeRows;
    els.memberBlockedRows.innerHTML = "";
    els.memberBlockedCount.textContent = `${formatCountSafe(safeRows.length)} members`;
    els.memberBlockedEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.memberBlockedEmpty.classList.toggle("hidden", safeRows.length > 0);

    for (const member of safeRows) {
      const account = primaryBankAccount(member);
      const tr = document.createElement("tr");
      tr.appendChild(createCell(member && member.username));
      tr.appendChild(createCell(memberBankValue(account, ["bankName", "bankCode", "bank"])));
      tr.appendChild(createCell(memberBankValue(account, ["accountName", "name"])));
      tr.appendChild(createCell(memberBankValue(account, ["accountNumber", "accountNo", "number"])));
      tr.appendChild(createCell(member && member.phone));
      tr.appendChild(createStatusCell(member && member.status));
      tr.appendChild(createCell(formatDate((member && member.blockedAt) || (member && member.statusUpdatedAt))));
      tr.appendChild(createCell((member && member.blockedReason) || (member && member.blockReason) || "-"));
      tr.appendChild(createCell((member && member.blockedBy) || (member && member.blockedByAdmin) || "-"));
      els.memberBlockedRows.appendChild(tr);
    }
  }

  function renderPendingBankAccounts(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.pendingBankRows = safeRows;
    els.memberPendingBankRows.innerHTML = "";
    els.memberPendingBankCount.textContent = `${formatCountSafe(safeRows.length)} accounts`;
    els.bankReviewSummaryPending.textContent = formatCountSafe(safeRows.length);
    els.memberPendingBankEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.memberPendingBankEmpty.classList.toggle("hidden", safeRows.length > 0);

    for (const row of safeRows) {
      const user = nestedUser(row);
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate((user && user.createdAt) || (row && row.userCreatedAt) || (row && row.createdAt))));
      tr.appendChild(createCell((user && user.username) || (row && row.username)));
      tr.appendChild(createCell(memberBankValue(row, ["bankName", "bankCode", "bank"])));
      tr.appendChild(createCell(memberBankValue(row, ["accountName", "name"])));
      tr.appendChild(createCell(maskedAccountValue(row)));
      tr.appendChild(createStatusCell(row && row.status));
      tr.appendChild(createCell((row && row.note) || (row && row.remark) || (row && row.reviewNote) || "-"));
      const actions = document.createElement("td");
      actions.className = "actions";
      const canReview = Boolean(state.token && state.canApproveBank && row && row.id);
      actions.appendChild(actionButton("Approve", () => openBankReview("approve", row), canReview));
      actions.appendChild(actionButton("Reject", () => openBankReview("reject", row), canReview));
      tr.appendChild(actions);
      els.memberPendingBankRows.appendChild(tr);
    }
  }

  function bankReviewCopy(row) {
    const user = nestedUser(row);
    return {
      username: (user && user.username) || (row && row.username) || "-",
      account: maskedAccountValue(row),
    };
  }

  function openBankReview(action, row) {
    if (!state.token) return setToast("No session loaded");
    if (!state.canApproveBank) return setToast("members.bank.approve permission is required");
    if (!row || !row.id) return setToast("Bank account id is missing");
    state.bankReviewAction = action === "reject" ? "reject" : "approve";
    state.bankReviewRow = row;
    const copy = bankReviewCopy(row);
    els.bankReviewTitle.textContent = state.bankReviewAction === "approve" ? "Approve bank account" : "Reject bank account";
    els.bankReviewUsername.textContent = safeDisplay(copy.username);
    els.bankReviewAccount.textContent = safeDisplay(copy.account);
    els.bankReviewReason.value = "";
    setFieldError(els.bankReviewReasonError, "");
    els.bankReviewModal.showModal();
  }

  async function submitBankReview(event) {
    event.preventDefault();
    const row = state.bankReviewRow;
    const action = state.bankReviewAction;
    if (!state.token || !row || !row.id || !action) {
      setToast("Select a pending bank account");
      return;
    }
    if (!state.canApproveBank) {
      setToast("members.bank.approve permission is required");
      return;
    }
    const reason = validateReasonBeforeConfirm(els.bankReviewReason, els.bankReviewReasonError);
    if (!reason) return;
    await withLoading(
      els.bankReviewConfirm,
      async () => {
        await api(`/admin/bank-accounts/${encodeURIComponent(row.id)}/${action}`, {
          method: "POST",
          body: { reason },
        });
        els.bankReviewModal.close();
        setToast(action === "approve" ? "Bank account approved" : "Bank account rejected");
        state.bankReviewRow = null;
        state.bankReviewAction = null;
        await refreshPendingBankAccounts();
        await refreshBankReviewAudit();
      },
      "Saving..."
    );
  }

  function reviewAuditMetadata(row) {
    return objectValue(row && row.metadata) || {};
  }

  function reviewAuditBefore(row) {
    return objectValue(row && row.beforeJson) || objectValue(reviewAuditMetadata(row).before) || {};
  }

  function reviewAuditAfter(row) {
    return objectValue(row && row.afterJson) || objectValue(reviewAuditMetadata(row).after) || {};
  }

  function reviewAuditTargetId(row) {
    const metadata = reviewAuditMetadata(row);
    return text(metadata.targetId || (row && row.targetId));
  }

  function reviewAuditActionLabel(action) {
    if (action === "member.bank.approve") return "approve";
    if (action === "member.bank.reject") return "reject";
    return text(action);
  }

  function reviewAuditUsername(row) {
    const metadata = reviewAuditMetadata(row);
    const before = reviewAuditBefore(row);
    const after = reviewAuditAfter(row);
    const beforeUser = objectValue(before.user) || {};
    const afterUser = objectValue(after.user) || {};
    return text(
      metadata.username ||
        metadata.memberUsername ||
        before.username ||
        after.username ||
        beforeUser.username ||
        afterUser.username ||
        before.userId ||
        after.userId ||
        metadata.userId
    );
  }

  function reviewAuditAccount(row) {
    const before = reviewAuditBefore(row);
    const after = reviewAuditAfter(row);
    const bank = after.bankName || after.bankCode || before.bankName || before.bankCode || "-";
    const account = after.accountNumberMasked || before.accountNumberMasked || after.accountNumber || before.accountNumber || "-";
    return `${safeDisplay(bank)} / ${safeDisplay(account)}`;
  }

  function reviewAuditReason(row) {
    const metadata = reviewAuditMetadata(row);
    return text(metadata.reason || (row && row.reason));
  }

  function reviewAuditPreviousStatus(row) {
    const metadata = reviewAuditMetadata(row);
    const before = reviewAuditBefore(row);
    return text(metadata.previousStatus || before.status);
  }

  function reviewAuditNextStatus(row) {
    const metadata = reviewAuditMetadata(row);
    const after = reviewAuditAfter(row);
    return text(metadata.nextStatus || after.status);
  }

  function reviewAuditActor(row) {
    const metadata = reviewAuditMetadata(row);
    const actor = objectValue(metadata.actor) || objectValue(row && row.actorAdmin) || objectValue(row && row.admin) || {};
    return text(actor.username || metadata.actorUsername || metadata.adminUsername || actor.id);
  }

  function reviewAuditSiteCode(row) {
    const metadata = reviewAuditMetadata(row);
    return text(metadata.siteCode || (row && row.siteCode) || SITE_CODE);
  }

  function reviewAuditDuplicateCount(rows) {
    return rows.filter((row) => {
      const metadata = reviewAuditMetadata(row);
      const status = String(metadata.httpStatus || metadata.statusCode || metadata.result || row.result || "").toLowerCase();
      return status === "409" || status.includes("duplicate") || status.includes("already reviewed");
    }).length;
  }

  function bankReviewAuditMatchesFilters(row) {
    const username = els.bankReviewAuditUsername.value.trim().toLowerCase();
    const target = els.bankReviewAuditTarget.value.trim().toLowerCase();
    const usernameText = reviewAuditUsername(row).toLowerCase();
    const targetText = reviewAuditTargetId(row).toLowerCase();
    if (username && !usernameText.includes(username)) return false;
    if (target && !targetText.includes(target)) return false;
    return true;
  }

  function renderBankReviewAudit(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.bankReviewAuditRows = safeRows;
    els.bankReviewAuditRows.innerHTML = "";
    els.bankReviewAuditCount.textContent = `${formatCountSafe(safeRows.length)} rows`;
    els.bankReviewAuditState.textContent = safeDisplay(config.stateMessage || (safeRows.length ? "Review history loaded." : "ไม่พบข้อมูล"));
    els.bankReviewAuditEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.bankReviewAuditEmpty.classList.toggle("hidden", safeRows.length > 0);
    els.bankReviewSummaryPending.textContent = formatCountSafe(state.pendingBankRows.length);
    els.bankReviewSummaryApproved.textContent = formatCountSafe(safeRows.filter((row) => row.action === "member.bank.approve").length);
    els.bankReviewSummaryRejected.textContent = formatCountSafe(safeRows.filter((row) => row.action === "member.bank.reject").length);
    els.bankReviewSummaryDuplicate.textContent = formatCountSafe(reviewAuditDuplicateCount(safeRows));

    for (const row of safeRows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row && row.createdAt)));
      tr.appendChild(createCell(reviewAuditActionLabel(row && row.action)));
      tr.appendChild(createCell(reviewAuditUsername(row)));
      tr.appendChild(createCell(reviewAuditAccount(row)));
      tr.appendChild(createStatusCell(reviewAuditPreviousStatus(row)));
      tr.appendChild(createStatusCell(reviewAuditNextStatus(row)));
      tr.appendChild(createCell(reviewAuditReason(row)));
      tr.appendChild(createCell(reviewAuditActor(row)));
      tr.appendChild(createCell(reviewAuditSiteCode(row)));
      els.bankReviewAuditRows.appendChild(tr);
    }
  }

  function bankReviewAuditParams(action) {
    const params = new URLSearchParams({ action, target_type: "user_bank_account", limit: "100" });
    const dateFrom = els.bankReviewAuditDateFrom.value;
    const dateTo = els.bankReviewAuditDateTo.value;
    const target = els.bankReviewAuditTarget.value.trim();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (target) params.set("target_id", target);
    return params;
  }

  async function loadBankReviewAudit() {
    updateBankReviewAuditControls();
    if (!state.token) {
      renderBankReviewAudit([], {
        stateMessage: "ยังไม่ได้ login / ต้อง login admin",
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewAudit) {
      renderBankReviewAudit([], {
        stateMessage: "ต้องมี permission admin.audit.view",
        emptyMessage: "ต้องมี permission admin.audit.view",
      });
      return;
    }
    els.bankReviewAuditState.textContent = "Loading review history...";
    const selected = els.bankReviewAuditAction.value;
    const actions =
      selected === "approve"
        ? ["member.bank.approve"]
        : selected === "reject"
          ? ["member.bank.reject"]
          : ["member.bank.approve", "member.bank.reject"];
    const results = await Promise.all(
      actions.map((action) => adminFetchReadOnly(`/admin/audit-logs?${bankReviewAuditParams(action).toString()}`))
    );
    const rows = results
      .flatMap((result) => arrayValue(result && result.rows))
      .filter(bankReviewAuditMatchesFilters)
      .sort((a, b) => new Date(b && b.createdAt).getTime() - new Date(a && a.createdAt).getTime());
    renderBankReviewAudit(rows, {
      stateMessage: "Review history loaded from GET /api/admin/audit-logs.",
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshBankReviewAudit() {
    try {
      await loadBankReviewAudit();
    } catch (error) {
      const safeMessage = sanitizeErrorMessage(error.message);
      renderBankReviewAudit([], {
        stateMessage: safeMessage,
        emptyMessage: state.token ? "ไม่สามารถโหลดประวัติได้" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(safeMessage);
    }
  }

  function rowMemberLabel(row) {
    const user = nestedUser(row);
    return (user && (user.username || user.id)) || (row && (row.username || row.userId || row.memberId)) || "-";
  }

  function rowAmount(row) {
    if (!row || typeof row !== "object") return 0;
    return row.amount || row.balanceDelta || row.credit || row.debit || row.totalAmount || 0;
  }

  function rowReference(row) {
    if (!row || typeof row !== "object") return "-";
    return row.reference || row.referenceId || row.txRef || row.transactionId || row.id || "-";
  }

  function renderLedgerRows(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.ledgerRows = safeRows;
    els.ledgerRows.innerHTML = "";
    els.ledgerCount.textContent = `${formatCountSafe(safeRows.length)} rows`;
    els.ledgerState.textContent = safeDisplay(config.stateMessage || (safeRows.length ? "Read-only ledger loaded." : "ไม่พบข้อมูล"));
    els.ledgerEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.ledgerEmpty.classList.toggle("hidden", safeRows.length > 0);

    for (const row of safeRows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row && (row.createdAt || row.updatedAt))));
      tr.appendChild(createCell(rowMemberLabel(row)));
      tr.appendChild(createCell(row && (row.type || row.transactionType || row.direction)));
      tr.appendChild(createCell(formatMoneySafe(rowAmount(row))));
      tr.appendChild(createCell(formatMoneyOrFallback(row && (row.balanceAfter || row.afterBalance))));
      tr.appendChild(createStatusCell(row && (row.status || row.state || "read-only")));
      tr.appendChild(createCell(rowReference(row)));
      els.ledgerRows.appendChild(tr);
    }
  }

  function statementAccount(row) {
    if (!row || typeof row !== "object") return "-";
    return row.accountNumberMask || row.accountNoMask || row.accountNumber || row.accountNo || row.bankAccount || "-";
  }

  function renderBankStatements(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.bankStatementRows = safeRows;
    els.bankStatementRows.innerHTML = "";
    els.bankStatementCount.textContent = `${formatCountSafe(safeRows.length)} statements`;
    els.bankStatementState.textContent = safeDisplay(config.stateMessage || (safeRows.length ? "Read-only bank statements loaded." : "ไม่พบข้อมูล"));
    els.bankStatementEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.bankStatementEmpty.classList.toggle("hidden", safeRows.length > 0);

    for (const row of safeRows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(row && row.direction));
      tr.appendChild(createCell(formatDate(row && (row.createdAt || row.timestamp || row.statementAt))));
      tr.appendChild(createCell(row && (row.bankName || row.bankCode || row.bank)));
      tr.appendChild(createCell(statementAccount(row)));
      tr.appendChild(createCell(formatMoneySafe(rowAmount(row))));
      tr.appendChild(createStatusCell(row && (row.status || row.matchStatus || "read-only")));
      tr.appendChild(createCell(rowReference(row)));
      els.bankStatementRows.appendChild(tr);
    }
  }

  function auditActorName(row) {
    const actor = objectValue(row && row.actorAdmin) || objectValue(row && row.admin);
    return (actor && (actor.username || actor.email || actor.id)) || "-";
  }

  function auditReasonValue(row) {
    const metadata = objectValue(row && row.metadata);
    return metadata && metadata.reason ? metadata.reason : "-";
  }

  function auditTargetValue(row) {
    const type = safeDisplay(row && row.targetType);
    const id = safeDisplay(row && row.targetId);
    if (type === "-" && id === "-") return "-";
    return `${type} / ${id}`;
  }

  function renderMemberAudit(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.memberAuditRows = safeRows;
    els.memberAuditRows.innerHTML = "";
    els.memberAuditCount.textContent = `${formatCountSafe(safeRows.length)} events`;
    els.memberAuditEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.memberAuditEmpty.classList.toggle("hidden", safeRows.length > 0);

    for (const row of safeRows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row && row.createdAt)));
      tr.appendChild(createCell(row && row.action));
      tr.appendChild(createCell(row && row.result));
      tr.appendChild(createCell(auditActorName(row)));
      tr.appendChild(createCell(row && row.module));
      tr.appendChild(createCell(auditReasonValue(row)));
      tr.appendChild(createCell(auditTargetValue(row)));
      tr.appendChild(createCell(row && row.severity));
      els.memberAuditRows.appendChild(tr);
    }
  }

  function appendDetailRow(label, value) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");
    th.scope = "row";
    th.textContent = label;
    td.textContent = safeDisplay(value);
    tr.appendChild(th);
    tr.appendChild(td);
    els.memberDetailRows.appendChild(tr);
  }

  function renderMemberProfileRows(member) {
    const wallet = objectValue(member && member.walletAccount);
    const rows = [
      ["Member ID", member && member.id],
      ["Username", member && member.username],
      ["Phone", member && member.phone],
      ["Status", member && member.status],
      ["Rank", member && member.rank],
      ["Points", formatMoneyOrFallback(member && member.points)],
      ["Site ID", member && member.siteId],
      ["Referral source", member && member.referralSource],
      ["Accept bonus", booleanText(member && member.acceptBonus)],
      ["Accept terms", booleanText(member && member.acceptTerms)],
      ["Wallet balance", wallet ? moneyWithCurrency(wallet.balance, wallet.currency) : "-"],
      ["Wallet updated", wallet ? formatDate(wallet.updatedAt) : "-"],
      ["Bank accounts", relationCount(member, "bankAccounts", "accounts")],
      ["Recent deposits", relationCount(member, "deposits", "deposits")],
      ["Recent withdrawals", relationCount(member, "withdrawals", "withdrawals")],
      ["Last login", formatDate(member && member.lastLoginAt)],
      ["Created", formatDate(member && member.createdAt)],
      ["Updated", formatDate(member && member.updatedAt)],
    ];
    for (const [label, value] of rows) appendDetailRow(label, value);
  }

  function resetMemberDetailTables() {
    els.memberDetailRows.innerHTML = "";
    els.memberBankRows.innerHTML = "";
    els.memberDepositRows.innerHTML = "";
    els.memberWithdrawRows.innerHTML = "";
    els.memberAuditRows.innerHTML = "";
    els.historyDepositRows.innerHTML = "";
    els.historyWithdrawRows.innerHTML = "";
    els.historyLedgerRows.innerHTML = "";
    els.historySpinRows.innerHTML = "";
    els.historyRewardRows.innerHTML = "";
    els.historyPlayRows.innerHTML = "";
    els.historyPrePromotionRows.innerHTML = "";
    els.historyUsageRows.innerHTML = "";
    els.historyDebtRows.innerHTML = "";
    els.memberBankCount.textContent = "0 accounts";
    els.memberDepositCount.textContent = "0 deposits";
    els.memberWithdrawCount.textContent = "0 withdrawals";
    els.memberAuditCount.textContent = "0 events";
    els.historyDepositCount.textContent = "0 รายการ";
    els.historyWithdrawCount.textContent = "0 รายการ";
    els.historyLedgerCount.textContent = "0 รายการ";
    els.historySpinCount.textContent = "0 รายการ";
    els.historyRewardCount.textContent = "0 รายการ";
    els.historyPlayCount.textContent = "0 รายการ";
    els.historyPrePromotionCount.textContent = "0 รายการ";
    els.historyReferralCount.textContent = "0 รายการ";
    els.historyUsageCount.textContent = "0 รายการ";
    els.historyDebtCount.textContent = "0 รายการ";
    els.memberBankEmpty.classList.remove("hidden");
    els.memberDepositEmpty.classList.remove("hidden");
    els.memberWithdrawEmpty.classList.remove("hidden");
    els.memberAuditEmpty.classList.remove("hidden");
    els.historyDepositEmpty.classList.remove("hidden");
    els.historyWithdrawEmpty.classList.remove("hidden");
    els.historyLedgerEmpty.classList.remove("hidden");
    els.historySpinEmpty.classList.remove("hidden");
    els.historyRewardEmpty.classList.remove("hidden");
    els.historyPlayEmpty.classList.remove("hidden");
    els.historyPrePromotionEmpty.classList.remove("hidden");
    els.historyReferralEmpty.classList.remove("hidden");
    els.historyUsageEmpty.classList.remove("hidden");
    els.historyDebtEmpty.classList.remove("hidden");
    els.historyReferralSource.textContent = "-";
    els.memberHistoryState.textContent = "เลือกสมาชิกเพื่อดูประวัติ";
  }

  function renderMemberBankAccounts(member) {
    const accounts = arrayValue(member && member.bankAccounts);
    els.memberBankRows.innerHTML = "";
    els.memberBankCount.textContent = `${formatCountSafe(accounts.length)} accounts`;
    els.memberBankEmpty.classList.toggle("hidden", accounts.length > 0);
    for (const account of accounts) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(account && account.bankCode));
      tr.appendChild(createCell(account && account.accountNumber));
      tr.appendChild(createCell(account && account.accountName));
      tr.appendChild(createStatusCell(account && account.status));
      tr.appendChild(createCell(formatDate(account && account.approvedAt)));
      tr.appendChild(createCell(formatDate(account && account.createdAt)));
      els.memberBankRows.appendChild(tr);
    }
  }

  function renderMemberDeposits(member) {
    const deposits = arrayValue(member && member.deposits);
    els.memberDepositRows.innerHTML = "";
    els.memberDepositCount.textContent = `${formatCountSafe(deposits.length)} deposits`;
    els.memberDepositEmpty.classList.toggle("hidden", deposits.length > 0);
    for (const deposit of deposits) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell((deposit && deposit.transactionId) || (deposit && deposit.id)));
      tr.appendChild(createCell(formatMoneyOrFallback(deposit && deposit.amount)));
      tr.appendChild(createStatusCell(deposit && deposit.status));
      tr.appendChild(createCell(deposit && deposit.channel));
      tr.appendChild(createCell(formatDate(deposit && deposit.createdAt)));
      tr.appendChild(createCell(formatDate(deposit && deposit.approvedAt)));
      els.memberDepositRows.appendChild(tr);
    }
  }

  function renderMemberWithdrawals(member) {
    const withdrawals = arrayValue(member && member.withdrawals);
    els.memberWithdrawRows.innerHTML = "";
    els.memberWithdrawCount.textContent = `${formatCountSafe(withdrawals.length)} withdrawals`;
    els.memberWithdrawEmpty.classList.toggle("hidden", withdrawals.length > 0);
    for (const withdrawal of withdrawals) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell((withdrawal && withdrawal.transactionId) || (withdrawal && withdrawal.id)));
      tr.appendChild(createCell(formatMoneyOrFallback(withdrawal && withdrawal.amount)));
      tr.appendChild(createStatusCell(withdrawal && withdrawal.status));
      tr.appendChild(createCell(formatDate(withdrawal && withdrawal.createdAt)));
      tr.appendChild(createCell(formatDate(withdrawal && withdrawal.approvedAt)));
      tr.appendChild(createCell(formatDate(withdrawal && withdrawal.paidAt)));
      els.memberWithdrawRows.appendChild(tr);
    }
  }

  function historyAmount(value) {
    return formatMoneySafe(value);
  }

  function historyAmountOrFallback(value) {
    return value === null || value === void 0 || value === "" ? "-" : historyAmount(value);
  }

  function historyMessage(key, fallback) {
    const messages = objectValue(state.memberHistory && state.memberHistory.messages);
    return safeDisplay(messages[key] || fallback || "ไม่พบข้อมูลจาก API read-only");
  }

  function setHistoryEmpty(emptyEl, rows, message) {
    emptyEl.textContent = safeDisplay(message || "ไม่พบข้อมูล");
    emptyEl.classList.toggle("hidden", rows.length > 0);
  }

  function appendHistoryCells(tr, values) {
    for (const value of values) tr.appendChild(createCell(value));
  }

  function setMemberHistoryTab(tabName) {
    const activeTab = String(tabName || "deposits");
    document.querySelectorAll("[data-member-history-tab]").forEach((button) => {
      const isActive = button.dataset.memberHistoryTab === activeTab;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll("[data-member-history-panel]").forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.memberHistoryPanel !== activeTab);
    });
  }

  function renderHistoryDeposits(member) {
    const apiRows = arrayValue(state.memberHistory && state.memberHistory.depositRows);
    const rows = apiRows.length ? apiRows : arrayValue(member && member.deposits);
    els.historyDepositRows.innerHTML = "";
    els.historyDepositCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyDepositEmpty, rows, historyMessage("deposits"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        (row && row.transactionId) || (row && row.id),
        historyAmount(row && row.amount),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        row && row.channel,
        formatDate(row && row.createdAt),
        formatDate(row && row.updatedAt),
      ]);
      els.historyDepositRows.appendChild(tr);
    }
  }

  function renderHistoryWithdrawals(member) {
    const apiRows = arrayValue(state.memberHistory && state.memberHistory.withdrawRows);
    const rows = apiRows.length ? apiRows : arrayValue(member && member.withdrawals);
    els.historyWithdrawRows.innerHTML = "";
    els.historyWithdrawCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyWithdrawEmpty, rows, historyMessage("withdrawals"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        (row && row.transactionId) || (row && row.id),
        historyAmount(row && row.amount),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        formatDate(row && row.createdAt),
        formatDate(row && row.updatedAt),
        formatDate(row && row.paidAt),
      ]);
      els.historyWithdrawRows.appendChild(tr);
    }
  }

  function renderHistoryLedger() {
    const rows = arrayValue(state.memberHistory.ledgerRows);
    els.historyLedgerRows.innerHTML = "";
    els.historyLedgerCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyLedgerEmpty, rows, historyMessage("ledger"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        (row && row.transactionId) || (row && row.id),
        row && row.type,
        historyAmount(row && row.amount),
        historyAmount(row && row.balanceBefore),
        historyAmount(row && row.balanceAfter),
        `${safeDisplay(row && row.referenceType)} / ${safeDisplay(row && row.referenceId)}`,
        formatDate(row && row.createdAt),
      ]);
      els.historyLedgerRows.appendChild(tr);
    }
  }

  function renderHistorySpins() {
    const rows = arrayValue(state.memberHistory.spinRows);
    els.historySpinRows.innerHTML = "";
    els.historySpinCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historySpinEmpty, rows, historyMessage("spins"));
    for (const row of rows) {
      const campaign = objectValue(row && row.campaign);
      const reward = objectValue(row && row.reward);
      const cost = objectValue(row && row.cost);
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && row.id,
        campaign && campaign.name,
        reward && (reward.label || reward.displayValue || reward.id),
        cost ? `${historyAmount(cost.amount)} ${safeDisplay(cost.type)}` : "0.00",
        row && row.prizeIndex,
        formatDate((row && row.time) || (row && row.createdAt)),
      ]);
      els.historySpinRows.appendChild(tr);
    }
  }

  function renderHistoryRewards() {
    const rows = arrayValue(state.memberHistory.rewardRows);
    els.historyRewardRows.innerHTML = "";
    els.historyRewardCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyRewardEmpty, rows, historyMessage("rewards"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && (row.label || row.id),
        row && row.rewardType,
        historyAmount(row && row.rewardValue),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        row && (row.sourceId || row.spinId || row.source),
        formatDate(row && row.createdAt),
        formatDate(row && row.expiresAt),
      ]);
      els.historyRewardRows.appendChild(tr);
    }
  }

  function renderHistoryPlay() {
    const rows = arrayValue(state.memberHistory.playRows);
    els.historyPlayRows.innerHTML = "";
    els.historyPlayCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyPlayEmpty, rows, historyMessage("play"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && (row.roundId || row.id),
        row && row.provider,
        row && row.gameCode,
        historyAmount(row && row.betAmount),
        historyAmount(row && row.winAmount),
        historyAmount(row && row.profitAmount),
        formatDate(row && row.playedAt),
        row && row.source,
      ]);
      els.historyPlayRows.appendChild(tr);
    }
  }

  function renderHistoryPrePromotion() {
    const rows = arrayValue(state.memberHistory.prePromotionRows);
    els.historyPrePromotionRows.innerHTML = "";
    els.historyPrePromotionCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyPrePromotionEmpty, rows, historyMessage("prePromotion"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && row.eventType,
        row && row.promotionTitle,
        historyAmount(row && row.amount),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        row && (row.transactionId || row.promotionId || row.id),
        formatDate(row && (row.approvedAt || row.createdAt)),
      ]);
      els.historyPrePromotionRows.appendChild(tr);
    }
  }

  function renderHistoryReferral(member) {
    const referral = objectValue(state.memberHistory.referral);
    const source = (referral && referral.source) || (member && member.referralSource) || "-";
    const rows = arrayValue(referral && referral.rows);
    els.historyReferralCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    els.historyReferralSource.textContent = safeDisplay(source || "-");
    setHistoryEmpty(els.historyReferralEmpty, rows, historyMessage("referral", referral && referral.note));
  }

  function renderHistoryUsage() {
    const rows = arrayValue(state.memberHistory.usageRows);
    els.historyUsageRows.innerHTML = "";
    els.historyUsageCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyUsageEmpty, rows, historyMessage("usage"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && row.eventType,
        row && (row.provider || "-"),
        row && (row.gameName || row.gameCode || row.referenceType || row.referenceId),
        historyAmountOrFallback(row && row.amount),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        row && row.referenceId,
        formatDate(row && row.createdAt),
      ]);
      els.historyUsageRows.appendChild(tr);
    }
  }

  function renderHistoryDebt() {
    const rows = arrayValue(state.memberHistory.debtRows);
    els.historyDebtRows.innerHTML = "";
    els.historyDebtCount.textContent = `${formatCountSafe(rows.length)} รายการ`;
    setHistoryEmpty(els.historyDebtEmpty, rows, historyMessage("debt"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      appendHistoryCells(tr, [
        row && (row.promotionTitle || row.promotionId || row.id),
        historyAmount(row && row.requiredAmount),
        historyAmount(row && row.currentAmount),
        historyAmount(row && row.remainingAmount),
      ]);
      tr.appendChild(createStatusCell(row && row.status));
      appendHistoryCells(tr, [
        formatDate(row && row.createdAt),
        formatDate(row && row.updatedAt),
      ]);
      els.historyDebtRows.appendChild(tr);
    }
  }

  function renderMemberHistory(member) {
    const safeMember = objectValue(member);
    if (!safeMember) {
      state.memberHistory = {};
      els.memberHistoryState.textContent = "เลือกสมาชิกเพื่อดูประวัติ";
      renderHistoryDeposits(null);
      renderHistoryWithdrawals(null);
      renderHistoryLedger();
      renderHistorySpins();
      renderHistoryRewards();
      renderHistoryPlay();
      renderHistoryPrePromotion();
      renderHistoryReferral(null);
      renderHistoryUsage();
      renderHistoryDebt();
      setMemberHistoryTab("deposits");
      return;
    }
    renderHistoryDeposits(safeMember);
    renderHistoryWithdrawals(safeMember);
    renderHistoryLedger();
    renderHistorySpins();
    renderHistoryRewards();
    renderHistoryPlay();
    renderHistoryPrePromotion();
    renderHistoryReferral(safeMember);
    renderHistoryUsage();
    renderHistoryDebt();
    els.memberHistoryState.textContent = `โหลดประวัติสมาชิกแบบ read-only แล้ว ${MEMBER_CODE_REWARD_CONNECTED_NOTE}`;
  }

  async function safeReadOnly(path, fallback) {
    try {
      return await adminFetchReadOnly(path);
    } catch (_error) {
      return fallback;
    }
  }

  async function loadMemberHistory(memberId, renderResult = true) {
    const historyParams = new URLSearchParams({ limit: "50" });
    const params = new URLSearchParams({ user_id: memberId, limit: "50" });
    const spinParams = new URLSearchParams({ memberId, limit: "50" });
    const [historyData, ledgerRows, spinRows, rewardData] = await Promise.all([
      safeReadOnly(`/admin/members/${encodeURIComponent(memberId)}/history?${historyParams.toString()}`, {}),
      state.canViewWallet ? safeReadOnly(`/admin/reports/wallet-ledger?${params.toString()}`, []) : [],
      canViewWheelSpins() ? safeReadOnly(`/admin/wheel/spins?${spinParams.toString()}`, []) : [],
      canViewWheelRewards() ? safeReadOnly(`/admin/wheel/member-rewards?${spinParams.toString()}`, { rows: [] }) : { rows: [] },
    ]);
    state.memberHistory = {
      depositRows: arrayValue(historyData && historyData.deposits),
      withdrawRows: arrayValue(historyData && historyData.withdrawals),
      ledgerRows: arrayValue(ledgerRows),
      spinRows: arrayValue(spinRows),
      rewardRows: arrayValue(rewardData && rewardData.rows),
      playRows: arrayValue(historyData && historyData.playRows),
      prePromotionRows: arrayValue(historyData && historyData.prePromotionRows),
      referral: objectValue(historyData && historyData.referral) || {},
      usageRows: arrayValue(historyData && historyData.usageRows),
      debtRows: arrayValue(historyData && historyData.debtRows),
      sources: objectValue(historyData && historyData.sources) || {},
      messages: {
        deposits: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
        withdrawals: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
        ledger: state.canViewWallet ? "ไม่พบข้อมูลจาก GET /api/admin/reports/wallet-ledger" : "ต้องมี permission reports.view หรือ wallet.view",
        spins: canViewWheelSpins() ? "ไม่พบข้อมูลจาก GET /api/admin/wheel/spins" : "ต้องมี permission wheel.spin.view หรือ wheel.spins.view",
        rewards: canViewWheelRewards() ? "ไม่พบข้อมูลจาก GET /api/admin/wheel/member-rewards" : "ต้องมี permission wheel.claims.view",
        play: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
        prePromotion: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
        referral: "ไม่พบข้อมูลแนะนำเพื่อนเพิ่มเติมจาก API read-only",
        usage: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
        debt: "ไม่พบข้อมูลจาก GET /api/admin/members/:id/history",
      },
    };
    els.memberHistoryState.textContent = `โหลดประวัติสมาชิกแบบ read-only แล้ว ${MEMBER_CODE_REWARD_CONNECTED_NOTE}`;
    if (renderResult) renderMemberHistory(state.memberDetail);
  }

  async function loadMemberAudit(memberId, renderResult = true) {
    if (!state.token) {
      renderMemberAudit([], {
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewAudit) {
      renderMemberAudit([], {
        emptyMessage: "ต้องมี permission admin.audit.view",
      });
      return;
    }
    const params = new URLSearchParams({ target_type: "user", target_id: memberId, limit: "50" });
    const data = await safeReadOnly(`/admin/audit-logs?${params.toString()}`, { rows: [] });
    state.memberAuditRows = arrayValue(data && data.rows);
    if (renderResult) renderMemberAudit(state.memberAuditRows);
  }

  function renderMemberDetail(member, options) {
    const safeMember = objectValue(member);
    const config = options || {};
    state.memberDetail = safeMember;
    state.selectedMemberId = safeMember && safeMember.id ? String(safeMember.id) : null;
    els.memberDetail.classList.toggle("hidden", Boolean(config.hide));
    els.memberDetailState.textContent = safeDisplay(config.message || (safeMember ? "Member detail loaded." : "No member selected"));
    els.memberDetailEmpty.textContent = safeDisplay(config.emptyMessage || "Select a member from the list.");
    els.memberDetailEmpty.classList.toggle("hidden", Boolean(safeMember));
    resetMemberDetailTables();
    if (!safeMember) {
      state.memberHistory = {};
      state.memberAuditRows = [];
      return;
    }
    renderMemberProfileRows(safeMember);
    renderMemberBankAccounts(safeMember);
    renderMemberDeposits(safeMember);
    renderMemberWithdrawals(safeMember);
    renderMemberAudit(state.memberAuditRows);
    renderMemberHistory(safeMember);
  }

  async function loadMemberDetail(memberId) {
    if (!state.token) {
      renderMemberDetail(null, {
        message: "ยังไม่ได้ login / ต้อง login admin",
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast("No session loaded");
      return;
    }
    if (!state.canViewMembers) {
      renderMemberDetail(null, {
        message: "members.view permission is required for member detail.",
        emptyMessage: "ต้องมี permission members.view",
      });
      setToast("members.view permission is required");
      return;
    }
    els.memberDetail.classList.remove("hidden");
    els.memberDetailState.textContent = "Loading member detail...";
    els.memberDetailEmpty.classList.add("hidden");
    resetMemberDetailTables();
    state.memberHistory = {};
    state.memberAuditRows = [];
    const member = await adminFetchReadOnly(`/admin/members/${encodeURIComponent(memberId)}`);
    state.memberHistory = {};
    state.memberAuditRows = [];
    await loadMemberHistory(memberId, false);
    await loadMemberAudit(memberId, false);
    renderMemberDetail(member, {
      message: "Member detail loaded from GET /api/admin/members/:id.",
      emptyMessage: "ไม่พบข้อมูล",
    });
    els.memberDetail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openMemberDetail(memberId, button) {
    const safeId = String(memberId || "").trim();
    if (!safeId) {
      renderMemberDetail(null, {
        message: "Member id is missing.",
        emptyMessage: "ไม่พบ member id",
      });
      setToast("Member id is missing.");
      return;
    }
    try {
      if (button) {
        await withLoading(button, () => loadMemberDetail(safeId));
      } else {
        await loadMemberDetail(safeId);
      }
    } catch (error) {
      renderMemberDetail(null, {
        message: sanitizeErrorMessage(error.message),
        emptyMessage: state.token ? "โหลด member detail ไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  function backToMemberList() {
    renderMemberDetail(null, { hide: true });
    document.getElementById("member-list").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderMemberList(rows, options) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const config = options || {};
    state.memberRows = safeRows;
    els.memberRows.innerHTML = "";
    els.memberCount.textContent = `${formatCountSafe(safeRows.length)} members`;
    els.memberListState.textContent = safeDisplay(config.message || (safeRows.length ? "Member list loaded." : "ไม่พบข้อมูล"));
    els.memberEmpty.textContent = safeDisplay(config.emptyMessage || "ไม่พบข้อมูล");
    els.memberEmpty.classList.toggle("hidden", safeRows.length > 0 || Boolean(config.hideEmpty));

    for (const member of safeRows) {
      const wallet = memberWallet(member);
      const tr = document.createElement("tr");
      const statusCell = document.createElement("td");
      statusCell.appendChild(memberStatusBadge(member));
      tr.appendChild(createMemberIdentityCell(member));
      tr.appendChild(createCell(member && member.phone));
      tr.appendChild(statusCell);
      tr.appendChild(createCell(member && member.rank));
      tr.appendChild(createCell(wallet.balance === null || wallet.balance === void 0 || wallet.balance === "" ? "-" : `${formatMoneySafe(wallet.balance)} ${safeDisplay(wallet.currency || "THB")}`));
      tr.appendChild(createCell(formatMoneyOrFallback(member && member.points)));
      tr.appendChild(createCell(memberBankSummary(member)));
      tr.appendChild(createCell(formatDate(member && member.createdAt)));
      const actions = document.createElement("td");
      actions.className = "actions";
      actions.appendChild(createMemberDetailButton(member));
      tr.appendChild(actions);
      els.memberRows.appendChild(tr);
    }
  }

  async function loadMemberList() {
    updateMemberListControls();
    if (!state.token) {
      renderMemberList([], {
        message: "ยังไม่ได้ login / ต้อง login admin",
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewMembers) {
      renderMemberList([], {
        message: "members.view permission is required for member list.",
        emptyMessage: "ต้องมี permission members.view",
      });
      return;
    }
    els.memberListState.textContent = "Loading member list...";
    els.memberEmpty.classList.add("hidden");
    const rows = await adminFetchReadOnly(`/admin/members?${memberQueryParams().toString()}`);
    renderMemberList(rows, {
      message: "Member list loaded from GET /api/admin/members.",
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshMemberList() {
    try {
      await loadMemberList();
    } catch (error) {
      renderMemberList([], {
        message: sanitizeErrorMessage(error.message),
        emptyMessage: state.token ? "โหลด member list ไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  async function loadBlockedMembers() {
    if (!state.token) {
      renderBlockedMembers([], {
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewMembers) {
      renderBlockedMembers([], {
        emptyMessage: "ต้องมี permission members.view",
      });
      return;
    }
    const params = new URLSearchParams({ page: "1", limit: "50", status: "blocked" });
    const rows = await adminFetchReadOnly(`/admin/members?${params.toString()}`);
    renderBlockedMembers(payloadRows(rows), {
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshBlockedMembers() {
    try {
      await loadBlockedMembers();
    } catch (error) {
      renderBlockedMembers([], {
        emptyMessage: state.token ? "โหลดข้อมูลสมาชิกที่บล็อคไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  async function loadPendingBankAccounts() {
    if (!state.token) {
      renderPendingBankAccounts([], {
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewBank) {
      renderPendingBankAccounts([], {
        emptyMessage: "ต้องมี permission members.bank.view",
      });
      return;
    }
    const params = new URLSearchParams({ page: "1", limit: "50" });
    const rows = await adminFetchReadOnly(`/admin/bank-accounts/pending?${params.toString()}`);
    renderPendingBankAccounts(payloadRows(rows), {
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshPendingBankAccounts() {
    try {
      await loadPendingBankAccounts();
    } catch (error) {
      renderPendingBankAccounts([], {
        emptyMessage: state.token ? "โหลดข้อมูลบัญชีที่รอตรวจสอบไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  async function loadWalletLedgerReadOnly() {
    if (!state.token) {
      renderLedgerRows([], {
        stateMessage: "ยังไม่ได้ login / ต้อง login admin",
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewWallet) {
      renderLedgerRows([], {
        stateMessage: "ต้องมี permission wallet.view",
        emptyMessage: "ต้องมี permission wallet.view",
      });
      return;
    }
    els.ledgerState.textContent = "Loading...";
    const params = new URLSearchParams({ page: "1", limit: "25" });
    const rows = await adminFetchReadOnly(`/admin/reports/wallet-ledger?${params.toString()}`);
    renderLedgerRows(payloadRows(rows), {
      stateMessage: "Wallet ledger read-only loaded.",
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshWalletLedgerReadOnly() {
    try {
      await loadWalletLedgerReadOnly();
    } catch (error) {
      renderLedgerRows([], {
        stateMessage: sanitizeErrorMessage(error.message),
        emptyMessage: state.token ? "โหลด wallet ledger ไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  async function loadBankStatementsReadOnly() {
    if (!state.token) {
      renderBankStatements([], {
        stateMessage: "ยังไม่ได้ login / ต้อง login admin",
        emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
      });
      return;
    }
    if (!state.canViewBankStatements) {
      renderBankStatements([], {
        stateMessage: "ต้องมี permission bank.view",
        emptyMessage: "ต้องมี permission bank.view",
      });
      return;
    }
    els.bankStatementState.textContent = "Loading...";
    const params = new URLSearchParams({ limit: "25" });
    const [depositRows, withdrawRows] = await Promise.all([
      adminFetchReadOnly(`/admin/bank/mock/statements/deposits?${params.toString()}`),
      adminFetchReadOnly(`/admin/bank/mock/statements/withdrawals?${params.toString()}`),
    ]);
    const rows = [
      ...payloadRows(depositRows).map((row) => ({ ...row, direction: "deposit" })),
      ...payloadRows(withdrawRows).map((row) => ({ ...row, direction: "withdrawal" })),
    ];
    renderBankStatements(rows, {
      stateMessage: "Bank statements read-only loaded.",
      emptyMessage: "ไม่พบข้อมูล",
    });
  }

  async function refreshBankStatementsReadOnly() {
    try {
      await loadBankStatementsReadOnly();
    } catch (error) {
      renderBankStatements([], {
        stateMessage: sanitizeErrorMessage(error.message),
        emptyMessage: state.token ? "โหลด bank statement ไม่สำเร็จ" : "ยังไม่ได้ login / ต้อง login admin",
      });
      setToast(error.message);
    }
  }

  async function refreshMemberReadOnlyViews() {
    await refreshBlockedMembers();
    await refreshPendingBankAccounts();
    await refreshBankReviewAudit();
    await refreshWalletLedgerReadOnly();
    await refreshBankStatementsReadOnly();
  }

  async function loadDashboardSummary() {
    if (!state.token) {
      renderDashboardSummary(null, `Load an admin credential to read the summary. ${DASHBOARD_REPORTS_CONNECTED_NOTE}`);
      return;
    }
    if (!state.canViewReports) {
      renderDashboardSummary(null, "reports.view permission is required for dashboard summary.");
      return;
    }
    els.dashboardState.textContent = `Loading dashboard summary... ${DASHBOARD_REPORTS_CONNECTED_NOTE}`;
    renderDashboardSummary(await adminFetchReadOnly("/admin/reports/summary"), `Dashboard summary loaded. ${DASHBOARD_REPORTS_CONNECTED_NOTE}`);
  }

  async function refreshDashboardSummary() {
    try {
      await loadDashboardSummary();
    } catch (error) {
      renderDashboardSummary(null, sanitizeErrorMessage(error.message));
      setToast(error.message);
    }
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

  async function withLoading(button, task, loadingText) {
    const original = button.disabled;
    const originalText = button.textContent;
    button.disabled = true;
    button.classList.add("is-loading");
    if (loadingText) button.textContent = loadingText;
    try {
      return await task();
    } finally {
      button.classList.remove("is-loading");
      if (loadingText) button.textContent = originalText;
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
    renderDashboardSummary(null, "Load an admin credential to read the summary.");
    renderMemberList([], {
      message: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderBlockedMembers([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderPendingBankAccounts([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderBankReviewAudit([], {
      stateMessage: "ยังไม่ได้ login / ต้อง login admin",
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderMemberAudit([], {
      emptyMessage: "ยังไม่ได้ login / ต้อง login admin",
    });
    renderMemberDetail(null, { hide: true });
    updateMemberListControls();
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
      await refreshDashboardSummary();
      await refreshMemberList();
      await refreshMemberReadOnlyViews();
      await loadSchedules();
      setToast("Session loaded.");
    }).catch((error) => setToast(error.message))
  );
  els.clearToken.addEventListener("click", clearSession);
  els.loadPermissions.addEventListener("click", () =>
    withLoading(els.loadPermissions, async () => {
      await loadPermissions();
      await refreshDashboardSummary();
      await refreshMemberList();
      await refreshMemberReadOnlyViews();
    }).catch((error) => setToast("Permission request failed"))
  );
  els.refreshDashboard.addEventListener("click", () => withLoading(els.refreshDashboard, refreshDashboardSummary).catch((error) => setToast(error.message)));
  els.refreshMembers.addEventListener("click", () => withLoading(els.refreshMembers, refreshMemberList).catch((error) => setToast(error.message)));
  els.backToMembers.addEventListener("click", backToMemberList);
  els.memberHistoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-member-history-tab]");
    if (button) setMemberHistoryTab(button.dataset.memberHistoryTab);
  });
  els.memberSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") refreshMemberList().catch((error) => setToast(error.message));
  });
  els.memberStatusFilter.addEventListener("change", () => refreshMemberList().catch((error) => setToast(error.message)));
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
  els.loadBankReviewAudit.addEventListener("click", () =>
    withLoading(els.loadBankReviewAudit, refreshBankReviewAudit).catch((error) => setToast(error.message))
  );
  els.bankReviewAuditAction.addEventListener("change", () => refreshBankReviewAudit().catch((error) => setToast(error.message)));
  els.bankReviewAuditDateFrom.addEventListener("change", () => refreshBankReviewAudit().catch((error) => setToast(error.message)));
  els.bankReviewAuditDateTo.addEventListener("change", () => refreshBankReviewAudit().catch((error) => setToast(error.message)));
  for (const input of [els.bankReviewAuditUsername, els.bankReviewAuditTarget]) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") refreshBankReviewAudit().catch((error) => setToast(error.message));
    });
  }
  els.scheduleForm.addEventListener("submit", (event) => saveSchedule(event).catch((error) => setToast(error.message)));
  els.toggleForm.addEventListener("submit", (event) => toggleSchedule(event).catch((error) => setToast(error.message)));
  els.overrideForm.addEventListener("submit", (event) => saveOverride(event).catch((error) => setToast(error.message)));
  els.bankReviewForm.addEventListener("submit", (event) => submitBankReview(event).catch((error) => setToast(error.message)));
  els.roleEditForm.addEventListener("submit", (event) => saveRolePermissions(event).catch((error) => setToast(error.message)));
  els.roleAssignmentForm.addEventListener("submit", (event) => saveRoleAssignment(event).catch((error) => setToast("Role update failed")));
  els.startTime.addEventListener("change", updateOvernightNote);
  els.endTime.addEventListener("change", updateOvernightNote);
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  boot();
})();
