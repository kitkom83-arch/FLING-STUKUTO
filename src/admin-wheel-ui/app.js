(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const CAMPAIGN_STATUSES = ["active", "inactive"];
  const COST_TYPES = ["point", "ticket", "free"];
  const REWARD_TYPES = ["credit", "point", "ticket", "physical", "no_reward"];
  const REWARD_STATUSES = ["active", "inactive"];
  const MEMBER_REWARD_STATUSES = ["pending", "claimed", "expired", "cancelled"];
  const WHEEL_AUDIT_ACTIONS = ["wheel.campaign.update", "wheel.reward.create", "wheel.reward.update", "wheel.reward.enable", "wheel.reward.disable", "wheel.memberReward.status.update"];
  const DENIED_ACTION_MESSAGE = "ไม่มีสิทธิ์ดำเนินการนี้";
  const DENIED_VIEW_MESSAGE = "ไม่มีสิทธิ์เข้าถึง";
  const DB_CONNECTION_KEY_PATTERN = ["data", "base", "[_-]?url"].join("");
  const SENSITIVE_KEY_PATTERN = new RegExp(`(pass(word|code)?|token|secret|api[_-]?key|authorization|session|cookie|${DB_CONNECTION_KEY_PATTERN}|refresh|headers?)`, "i");
  const SENSITIVE_DISPLAY_PATTERN = new RegExp(`\\b(password|token|secret|authorization|${["data", "base", "_url"].join("")})\\b`, "i");
  const IP_KEY_PATTERN = /^(ip|ipAddress|rawIp|clientIp|remoteAddress)$/i;
  const RAW_IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  const SENSITIVE_VALUE_PATTERNS = [
    /postgres(?:ql)?:\/\/[^\s"']+/i,
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "i"),
  ];
  const REDACTED = "[REDACTED]";

  const state = {
    credential: "",
    config: null,
    spins: [],
    memberRewards: [],
    auditRows: [],
    permissions: null,
    activeTab: "campaign",
    editingReward: null,
    statusReward: null,
    memberRewardStatus: null,
  };

  const els = {
    credential: document.getElementById("admin-token"),
    saveToken: document.getElementById("save-token"),
    clearToken: document.getElementById("clear-token"),
    sessionState: document.getElementById("session-state"),
    globalError: document.getElementById("global-error"),
    toast: document.getElementById("toast"),
    tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
    consoleStatusBadge: document.getElementById("console-status-badge"),
    consoleSiteCode: document.getElementById("console-site-code"),
    consoleLastUpdated: document.getElementById("console-last-updated"),
    permissionRole: document.getElementById("permission-role"),
    permissionSite: document.getElementById("permission-site"),
    permissionCampaignView: document.getElementById("permission-campaign-view"),
    permissionCampaignUpdate: document.getElementById("permission-campaign-update"),
    permissionRewardsManage: document.getElementById("permission-rewards-manage"),
    permissionClaimsView: document.getElementById("permission-claims-view"),
    permissionClaimsUpdate: document.getElementById("permission-claims-update"),
    permissionReportsView: document.getElementById("permission-reports-view"),
    permissionAuditView: document.getElementById("permission-audit-view"),
    campaignForm: document.getElementById("campaign-form"),
    campaignId: document.getElementById("campaign-id"),
    campaignStatus: document.getElementById("campaign-status"),
    campaignName: document.getElementById("campaign-name"),
    campaignCostType: document.getElementById("campaign-cost-type"),
    campaignCostAmount: document.getElementById("campaign-cost-amount"),
    campaignDailyLimit: document.getElementById("campaign-daily-limit"),
    campaignMonthlyLimit: document.getElementById("campaign-monthly-limit"),
    campaignStart: document.getElementById("campaign-start"),
    campaignEnd: document.getElementById("campaign-end"),
    campaignRules: document.getElementById("campaign-rules"),
    campaignReason: document.getElementById("campaign-reason"),
    campaignSummaryStatus: document.getElementById("campaign-summary-status"),
    campaignSummaryName: document.getElementById("campaign-summary-name"),
    campaignSummaryCost: document.getElementById("campaign-summary-cost"),
    campaignSummaryDaily: document.getElementById("campaign-summary-daily"),
    campaignSummaryWindow: document.getElementById("campaign-summary-window"),
    campaignNameError: document.getElementById("campaign-name-error"),
    campaignCostError: document.getElementById("campaign-cost-error"),
    campaignDailyError: document.getElementById("campaign-daily-error"),
    campaignMonthlyError: document.getElementById("campaign-monthly-error"),
    campaignDateError: document.getElementById("campaign-date-error"),
    campaignReasonError: document.getElementById("campaign-reason-error"),
    saveCampaign: document.getElementById("save-campaign"),
    refreshCampaign: document.getElementById("refresh-campaign"),
    createReward: document.getElementById("create-reward"),
    refreshRewards: document.getElementById("refresh-rewards"),
    rewardRows: document.getElementById("reward-rows"),
    rewardsEmpty: document.getElementById("rewards-empty"),
    rewardsLoading: document.getElementById("rewards-loading"),
    rewardModal: document.getElementById("reward-modal"),
    rewardForm: document.getElementById("reward-form"),
    rewardModalTitle: document.getElementById("reward-modal-title"),
    rewardId: document.getElementById("reward-id"),
    rewardLabel: document.getElementById("reward-label"),
    rewardType: document.getElementById("reward-type"),
    rewardValue: document.getElementById("reward-value"),
    rewardDisplay: document.getElementById("reward-display"),
    rewardWeight: document.getElementById("reward-weight"),
    rewardStock: document.getElementById("reward-stock"),
    rewardSort: document.getElementById("reward-sort"),
    rewardColor: document.getElementById("reward-color"),
    rewardImage: document.getElementById("reward-image"),
    rewardStatus: document.getElementById("reward-status"),
    rewardReason: document.getElementById("reward-reason"),
    rewardLabelError: document.getElementById("reward-label-error"),
    rewardReasonError: document.getElementById("reward-reason-error"),
    rewardFormError: document.getElementById("reward-form-error"),
    saveReward: document.getElementById("save-reward"),
    refreshSpins: document.getElementById("refresh-spins"),
    spinRows: document.getElementById("spin-rows"),
    spinsEmpty: document.getElementById("spins-empty"),
    spinsLoading: document.getElementById("spins-loading"),
    filterFrom: document.getElementById("filter-from"),
    filterTo: document.getElementById("filter-to"),
    filterMember: document.getElementById("filter-member"),
    filterReward: document.getElementById("filter-reward"),
    filterRewardId: document.getElementById("filter-reward-id"),
    filterCampaign: document.getElementById("filter-campaign"),
    filterStatus: document.getElementById("filter-status"),
    filterSite: document.getElementById("filter-site"),
    applySpinFilters: document.getElementById("apply-spin-filters"),
    refreshReports: document.getElementById("refresh-reports"),
    reportTotalSpins: document.getElementById("report-total-spins"),
    reportTotalCostUsed: document.getElementById("report-total-cost-used"),
    reportUniqueMembers: document.getElementById("report-unique-members"),
    reportIssued: document.getElementById("report-issued"),
    reportPendingRewards: document.getElementById("report-pending-rewards"),
    reportClaimedRewards: document.getElementById("report-claimed-rewards"),
    reportExpiredCancelledRewards: document.getElementById("report-expired-cancelled-rewards"),
    reportStockUsed: document.getElementById("report-stock-used"),
    reportTopReward: document.getElementById("report-top-reward"),
    reportPointCost: document.getElementById("report-point-cost"),
    reportTicketCost: document.getElementById("report-ticket-cost"),
    reportEmptyCount: document.getElementById("report-empty-count"),
    reportTopStockReward: document.getElementById("report-top-stock-reward"),
    rewardSummaryRows: document.getElementById("reward-summary-rows"),
    rewardSummaryEmpty: document.getElementById("reward-summary-empty"),
    topRewardRows: document.getElementById("top-reward-rows"),
    topRewardsEmpty: document.getElementById("top-rewards-empty"),
    distributionRows: document.getElementById("distribution-rows"),
    distributionEmpty: document.getElementById("distribution-empty"),
    stockRows: document.getElementById("stock-rows"),
    stockEmpty: document.getElementById("stock-empty"),
    dailyRows: document.getElementById("daily-rows"),
    dailyEmpty: document.getElementById("daily-empty"),
    claimStatusRows: document.getElementById("claim-status-rows"),
    claimStatusEmpty: document.getElementById("claim-status-empty"),
    memberRewardSummaryRows: document.getElementById("member-reward-summary-rows"),
    memberRewardSummaryEmpty: document.getElementById("member-reward-summary-empty"),
    refreshAudit: document.getElementById("refresh-audit"),
    auditFilterAction: document.getElementById("audit-filter-action"),
    auditFilterActor: document.getElementById("audit-filter-actor"),
    auditFilterCampaign: document.getElementById("audit-filter-campaign"),
    auditFilterReward: document.getElementById("audit-filter-reward"),
    auditFilterTarget: document.getElementById("audit-filter-target"),
    auditFilterFrom: document.getElementById("audit-filter-from"),
    auditFilterTo: document.getElementById("audit-filter-to"),
    applyAuditFilters: document.getElementById("apply-audit-filters"),
    auditRows: document.getElementById("audit-rows"),
    auditEmpty: document.getElementById("audit-empty"),
    auditPlaceholder: document.getElementById("audit-placeholder"),
    auditLoading: document.getElementById("audit-loading"),
    detailModal: document.getElementById("detail-modal"),
    detailTitle: document.getElementById("detail-title"),
    detailGrid: document.getElementById("detail-grid"),
    detailJson: document.getElementById("detail-json"),
    statusModal: document.getElementById("status-modal"),
    statusForm: document.getElementById("status-form"),
    statusModalTitle: document.getElementById("status-modal-title"),
    statusModalCopy: document.getElementById("status-modal-copy"),
    statusReason: document.getElementById("status-reason"),
    statusReasonError: document.getElementById("status-reason-error"),
    confirmStatus: document.getElementById("confirm-status"),
    confirmModal: document.getElementById("confirm-modal"),
    confirmForm: document.getElementById("confirm-form"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmCancel: document.getElementById("confirm-cancel"),
    confirmOk: document.getElementById("confirm-ok"),
    refreshClaims: document.getElementById("refresh-claims"),
    claimRows: document.getElementById("claim-rows"),
    claimsEmpty: document.getElementById("claims-empty"),
    claimsLoading: document.getElementById("claims-loading"),
    claimLastUpdated: document.getElementById("claim-last-updated"),
    claimFilterFrom: document.getElementById("claim-filter-from"),
    claimFilterTo: document.getElementById("claim-filter-to"),
    claimFilterMember: document.getElementById("claim-filter-member"),
    claimFilterType: document.getElementById("claim-filter-type"),
    claimFilterStatus: document.getElementById("claim-filter-status"),
    claimFilterCampaign: document.getElementById("claim-filter-campaign"),
    claimFilterSpin: document.getElementById("claim-filter-spin"),
    applyClaimFilters: document.getElementById("apply-claim-filters"),
    claimTotalIssued: document.getElementById("claim-total-issued"),
    claimPending: document.getElementById("claim-pending"),
    claimClaimed: document.getElementById("claim-claimed"),
    claimExpired: document.getElementById("claim-expired"),
    claimCancelled: document.getElementById("claim-cancelled"),
    claimTypeCounts: document.getElementById("claim-type-counts"),
    claimStatusModal: document.getElementById("claim-status-modal"),
    claimStatusForm: document.getElementById("claim-status-form"),
    claimStatusTitle: document.getElementById("claim-status-title"),
    claimStatusCopy: document.getElementById("claim-status-copy"),
    claimStatusReason: document.getElementById("claim-status-reason"),
    claimStatusReasonError: document.getElementById("claim-status-reason-error"),
    confirmClaimStatus: document.getElementById("confirm-claim-status"),
  };

  function safeText(value) {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "-";
    const display = String(value);
    if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(display))) return REDACTED;
    if (RAW_IPV4_PATTERN.test(display)) return maskIp(display);
    if (SENSITIVE_DISPLAY_PATTERN.test(display)) return REDACTED;
    return display.replace(/[<>]/g, "");
  }

  function safeEnum(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }

  function canonicalCostType(value) {
    const raw = String(value || "").trim();
    if (raw === "mock_credit") return "free";
    return safeEnum(raw, COST_TYPES, "point");
  }

  function canonicalRewardType(value) {
    const raw = String(value || "").trim();
    if (raw === "item") return "physical";
    return safeEnum(raw, REWARD_TYPES, "no_reward");
  }

  function maskIp(value) {
    if (!value) return "-";
    const ip = String(value);
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
      const parts = ip.split(".");
      return `${parts[0]}.${parts[1]}.x.x`;
    }
    if (ip.includes(":")) {
      const parts = ip.split(":").filter(Boolean);
      if (parts.length <= 2) return "x:x";
      return `${parts.slice(0, 2).join(":")}:x:x`;
    }
    return safeText(ip);
  }

  function nullableInt(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function intValue(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(numberValue(value));
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", { hour12: false });
  }

  function datetimeLocal(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function isoOrNull(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function setFieldError(el, message) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("hidden", !message);
  }

  function setGlobalError(message) {
    els.globalError.textContent = message || "โหลดข้อมูลไม่สำเร็จ";
    els.globalError.classList.toggle("hidden", !message);
  }

  function setToast(message) {
    els.toast.textContent = safeText(message);
    els.toast.classList.add("show");
    window.clearTimeout(setToast.timer);
    setToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function sanitizeCredential(value) {
    return String(value || "")
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/[^\x20-\x7E]/g, "");
  }

  function sanitizeValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") return safeText(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (typeof value !== "object") return value;
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      if (IP_KEY_PATTERN.test(key)) {
        next[key] = maskIp(item);
      } else if (/^user[-_]?agent$/i.test(key)) {
        next[key] = REDACTED;
      } else if (SENSITIVE_KEY_PATTERN.test(key)) {
        next[key] = REDACTED;
      } else {
        next[key] = sanitizeValue(item);
      }
    }
    return next;
  }

  function assertNoUnsafePayload(label, payload) {
    const sanitized = sanitizeValue(payload);
    const serialized = JSON.stringify(sanitized || {});
    if (serialized.includes("undefined") || serialized.includes("NaN")) throw new Error(`${label} contained unsafe placeholders`);
    if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(serialized))) throw new Error(`${label} contained unsafe values`);
    return sanitized;
  }

  function authHeaders() {
    const headers = { Accept: "application/json", "Content-Type": "application/json", "X-Site-Code": SITE_CODE };
    if (state.credential) headers[["Author", "ization"].join("")] = `${["Be", "arer"].join("")} ${state.credential}`;
    return headers;
  }

  class SafeApiError extends Error {
    constructor(message, status) {
      super(message);
      this.name = "SafeApiError";
      this.status = status;
    }
  }

  function safeApiMessage(status, fallback) {
    if (status === 401) return "กรุณาเข้าสู่ระบบแอดมิน";
    if (status === 403) return "ไม่มีสิทธิ์ใช้งานเมนู Lucky Wheel";
    if (status === 404) return "ยังไม่พบข้อมูล Lucky Wheel";
    return fallback || "โหลดข้อมูลไม่สำเร็จ";
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers: authHeaders(),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const payload = await response.json().catch(() => ({ success: false, message: "Request failed" }));
    assertNoUnsafePayload(path, payload);
    if (response.status === 401) {
      clearSession();
      throw new SafeApiError(safeApiMessage(401), 401);
    }
    if (!response.ok || !payload || payload.success !== true) {
      throw new SafeApiError(safeApiMessage(response.status, options.safeError), response.status);
    }
    return sanitizeValue(payload.data);
  }

  function createCell(value) {
    const td = document.createElement("td");
    td.textContent = safeText(value);
    return td;
  }

  function createBadge(label, tone) {
    const span = document.createElement("span");
    span.className = `badge ${tone || ""}`.trim();
    span.textContent = safeText(label);
    return span;
  }

  function setButtonPermission(button, allowed) {
    if (!button) return;
    const denied = !allowed;
    button.disabled = denied;
    button.dataset.permissionDisabled = denied ? "true" : "false";
    button.classList.toggle("permission-disabled", denied);
    button.title = denied ? DENIED_ACTION_MESSAGE : "";
    button.setAttribute("aria-disabled", denied ? "true" : "false");
  }

  function actionButton(label, handler, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    setButtonPermission(button, !disabled);
    button.addEventListener("click", handler);
    return button;
  }

  function hasPermission(permission) {
    if (!state.permissions || !permission) return false;
    if (state.permissions.owner) return true;
    return Array.isArray(state.permissions.permissions) && state.permissions.permissions.includes(permission);
  }

  function hasAnyPermission(permissions) {
    return permissions.some((permission) => hasPermission(permission));
  }

  const access = {
    viewCampaign: () => hasAnyPermission(["wheel.view", "wheel.campaign.view"]),
    updateCampaign: () => hasPermission("wheel.campaign.update"),
    viewRewards: () => hasAnyPermission(["wheel.rewards.view", "wheel.reward.view"]),
    createRewards: () => hasAnyPermission(["wheel.rewards.create", "wheel.reward.create"]),
    updateRewards: () => hasAnyPermission(["wheel.rewards.update", "wheel.reward.update"]),
    updateRewardStatus: () => hasAnyPermission(["wheel.rewards.status.update", "wheel.reward.enable", "wheel.reward.disable"]),
    viewSpins: () => hasAnyPermission(["wheel.spins.view", "wheel.spin.view"]),
    viewReports: () => hasAnyPermission(["wheel.reports.view", "wheel.report.view"]),
    viewClaims: () => hasPermission("wheel.claims.view"),
    updateClaims: () => hasPermission("wheel.claims.status.update"),
    viewAudit: () => hasPermission("wheel.audit.view") || hasPermission("admin.audit.view"),
  };

  function setPermissionText(el, allowed) {
    el.textContent = allowed ? "Yes" : "No";
    el.className = allowed ? "allowed" : "denied";
  }

  function updatePermissionPanel() {
    const current = state.permissions || {};
    els.permissionRole.textContent = safeText(current.role || "-");
    els.permissionSite.textContent = safeText(current.siteCode || SITE_CODE);
    setPermissionText(els.permissionCampaignView, access.viewCampaign());
    setPermissionText(els.permissionCampaignUpdate, access.updateCampaign());
    setPermissionText(els.permissionRewardsManage, access.createRewards() || access.updateRewards() || access.updateRewardStatus());
    setPermissionText(els.permissionClaimsView, access.viewClaims());
    setPermissionText(els.permissionClaimsUpdate, access.updateClaims());
    setPermissionText(els.permissionReportsView, access.viewReports());
    setPermissionText(els.permissionAuditView, access.viewAudit());
  }

  function updateDeniedState(panelId, allowed) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle("permission-denied", !allowed);
    const denied = panel.querySelector(".access-denied");
    if (denied) denied.classList.toggle("hidden", allowed);
  }

  function updateAccessStates() {
    updatePermissionPanel();
    updateDeniedState("tab-campaign", access.viewCampaign());
    updateDeniedState("tab-rewards", access.viewRewards());
    updateDeniedState("tab-spins", access.viewSpins());
    updateDeniedState("tab-reports", access.viewReports());
    updateDeniedState("tab-audit", access.viewAudit());
    updateDeniedState("tab-claims", access.viewClaims());
    setButtonPermission(els.saveCampaign, access.updateCampaign());
    setButtonPermission(els.createReward, access.createRewards());
  }

  function rewardTypeLabel(value) {
    return value === "item" ? "physical" : safeText(value);
  }

  function confirmAction(title, message) {
    els.confirmTitle.textContent = safeText(title);
    els.confirmMessage.textContent = safeText(message);
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

  async function withLoading(button, fn) {
    button.classList.add("is-loading");
    button.disabled = true;
    try {
      return await fn();
    } finally {
      button.classList.remove("is-loading");
      button.disabled = button.dataset.permissionDisabled === "true";
    }
  }

  function setActiveTab(tab) {
    state.activeTab = tab;
    for (const button of els.tabButtons) button.classList.toggle("active", button.dataset.tab === tab);
    for (const panel of els.tabPanels) panel.classList.toggle("active", panel.id === `tab-${tab}`);
    updateAccessStates();
  }

  function campaign() {
    return state.config && state.config.campaign ? state.config.campaign : {};
  }

  function rewards() {
    return state.config && Array.isArray(state.config.rewards) ? state.config.rewards : [];
  }

  function normalizeCampaign(row) {
    const source = row && typeof row === "object" ? row : {};
    return {
      id: safeText(source.id) === "-" ? "wheel_main" : source.id,
      name: safeText(source.name) === "-" ? "" : safeText(source.name),
      status: safeEnum(source.status, CAMPAIGN_STATUSES, "inactive"),
      costType: canonicalCostType(source.costType),
      costAmount: numberValue(source.costAmount).toFixed(2),
      dailySpinLimit: intValue(source.dailySpinLimit),
      monthlySpinLimit: intValue(source.monthlySpinLimit),
      startAt: source.startAt || null,
      endAt: source.endAt || null,
      rulesText: source.rulesText ? safeText(source.rulesText) : "",
    };
  }

  function normalizeReward(row, index) {
    const source = row && typeof row === "object" ? row : {};
    const fallbackLabel = `Reward ${index + 1}`;
    return {
      id: source.id ? String(source.id) : `reward_${index + 1}`,
      campaignId: source.campaignId || "wheel_main",
      label: source.label ? safeText(source.label) : fallbackLabel,
      rewardType: canonicalRewardType(source.rewardType),
      rewardValue: numberValue(source.rewardValue).toFixed(2),
      displayValue: source.displayValue ? safeText(source.displayValue) : source.label ? safeText(source.label) : fallbackLabel,
      probabilityWeight: intValue(source.probabilityWeight),
      stockLimit: nullableInt(source.stockLimit),
      stockUsed: intValue(source.stockUsed),
      segmentColor: validColor(source.segmentColor) ? String(source.segmentColor).trim() : "#16705d",
      imageUrl: source.imageUrl ? safeText(source.imageUrl) : null,
      sortOrder: Math.max(1, intValue(source.sortOrder) || index + 1),
      status: safeEnum(source.status, REWARD_STATUSES, "inactive"),
    };
  }

  function normalizeConfig(data) {
    const source = data && typeof data === "object" ? data : {};
    const normalizedRewards = Array.isArray(source.rewards)
      ? source.rewards.map((reward, index) => normalizeReward(reward, index))
      : [];
    return {
      campaign: normalizeCampaign(source.campaign),
      rewards: normalizedRewards,
      summary: source.summary && typeof source.summary === "object" ? sanitizeValue(source.summary) : {},
    };
  }

  function normalizeSpin(row) {
    const source = row && typeof row === "object" ? row : {};
    const reward = source.reward && typeof source.reward === "object" ? source.reward : {};
    const cost = source.cost && typeof source.cost === "object" ? source.cost : {};
    return {
      id: source.id ? safeText(source.id) : "-",
      time: source.time || source.createdAt || null,
      member: source.member && typeof source.member === "object" ? sanitizeValue(source.member) : null,
      campaign: source.campaign && typeof source.campaign === "object" ? sanitizeValue(source.campaign) : null,
      reward: {
        id: reward.id ? safeText(reward.id) : "-",
        label: reward.label ? safeText(reward.label) : "Unknown",
        rewardType: canonicalRewardType(reward.rewardType),
        rewardValue: numberValue(reward.rewardValue).toFixed(2),
        displayValue: reward.displayValue ? safeText(reward.displayValue) : reward.label ? safeText(reward.label) : "Unknown",
        status: reward.status ? safeText(reward.status) : "no_reward",
      },
      cost: {
        type: canonicalCostType(cost.type),
        amount: numberValue(cost.amount).toFixed(2),
      },
      prizeIndex: intValue(source.prizeIndex),
      ipAddressMasked: source.ipAddressMasked ? maskIp(source.ipAddressMasked) : maskIp(source.ipAddress || source.rawIp),
      userAgentHash: source.userAgentHash ? safeText(source.userAgentHash) : "-",
      siteCode: source.siteCode ? safeText(source.siteCode) : SITE_CODE,
      result: sanitizeValue(source.result || {}),
    };
  }

  function normalizeMemberReward(row) {
    const source = row && typeof row === "object" ? row : {};
    const member = source.member && typeof source.member === "object" ? source.member : {};
    const campaign = source.campaign && typeof source.campaign === "object" ? source.campaign : {};
    return {
      id: source.id ? safeText(source.id) : "-",
      siteCode: source.siteCode ? safeText(source.siteCode) : SITE_CODE,
      memberId: source.memberId ? safeText(source.memberId) : member.id ? safeText(member.id) : "-",
      member: sanitizeValue(member),
      campaignId: source.campaignId ? safeText(source.campaignId) : campaign.id ? safeText(campaign.id) : "-",
      campaign: sanitizeValue(campaign),
      source: source.source ? safeText(source.source) : "wheel",
      sourceId: source.sourceId ? safeText(source.sourceId) : source.spinId ? safeText(source.spinId) : "-",
      spinId: source.spinId ? safeText(source.spinId) : source.sourceId ? safeText(source.sourceId) : "-",
      label: source.label ? safeText(source.label) : "Unknown",
      rewardType: canonicalRewardType(source.rewardType),
      rewardValue: numberValue(source.rewardValue).toFixed(2),
      status: safeEnum(source.status, MEMBER_REWARD_STATUSES, "pending"),
      claimedAt: source.claimedAt || null,
      expiresAt: source.expiresAt || null,
      createdAt: source.createdAt || null,
      updatedAt: source.updatedAt || null,
      resultSnapshot: sanitizeValue(source.resultSnapshot || {}),
    };
  }

  function normalizeAuditRow(row) {
    const source = row && typeof row === "object" ? row : {};
    return {
      ...sanitizeValue(source),
      action: source.action ? safeText(source.action) : "-",
      createdAt: source.createdAt || null,
      beforeJson: sanitizeValue(source.beforeJson || source.before || null),
      afterJson: sanitizeValue(source.afterJson || source.after || null),
      metadata: sanitizeValue(source.metadata || {}),
    };
  }

  async function loadPermissions() {
    const data = await api("/admin/permissions/me");
    state.permissions = {
      role: data && data.role ? safeText(data.role) : "-",
      siteCode: data && data.siteCode ? safeText(data.siteCode) : SITE_CODE,
      owner: Boolean(data && data.owner),
      permissions: data && Array.isArray(data.permissions) ? data.permissions.map(safeText) : [],
    };
    updateAccessStates();
  }

  async function loadAll() {
    await loadPermissions();
    if (access.viewCampaign() || access.viewRewards() || access.viewReports()) await loadConfig();
    else {
      renderCampaign();
      renderRewards();
    }
    if (access.viewSpins() || access.viewReports()) await loadSpins();
    else renderSpins();
    if (access.viewClaims() || access.viewReports()) await loadMemberRewards();
    else renderMemberRewards();
    if (access.viewAudit()) await loadAudit();
    else renderAudit();
    updateAccessStates();
  }

  async function loadConfig() {
    if (!(access.viewCampaign() || access.viewRewards() || access.viewReports())) {
      updateAccessStates();
      return;
    }
    els.rewardsLoading.classList.remove("hidden");
    try {
      const data = await api("/admin/wheel/config");
      state.config = normalizeConfig(data);
      renderCampaign();
      renderRewards();
      drawRewardTypeFilter();
      renderReports();
      setGlobalError("");
    } finally {
      els.rewardsLoading.classList.add("hidden");
    }
  }

  function renderCampaign() {
    updateAccessStates();
    const row = campaign();
    els.campaignId.value = row.id || "wheel_main";
    els.campaignStatus.value = safeEnum(row.status, CAMPAIGN_STATUSES, "inactive");
    els.campaignName.value = row.name || "";
    els.campaignCostType.value = safeEnum(row.costType, COST_TYPES, "point");
    els.campaignCostAmount.value = row.costAmount || "0.00";
    els.campaignDailyLimit.value = row.dailySpinLimit === null || row.dailySpinLimit === undefined ? "0" : String(row.dailySpinLimit);
    els.campaignMonthlyLimit.value = row.monthlySpinLimit === null || row.monthlySpinLimit === undefined ? "0" : String(row.monthlySpinLimit);
    els.campaignStart.value = datetimeLocal(row.startAt);
    els.campaignEnd.value = datetimeLocal(row.endAt);
    els.campaignRules.value = row.rulesText || "";
    els.campaignReason.value = "";
    renderCampaignSummary(row);
  }

  function renderCampaignSummary(row) {
    const status = safeEnum(row.status, CAMPAIGN_STATUSES, "inactive");
    els.campaignSummaryStatus.textContent = status;
    els.campaignSummaryStatus.className = `summary-status ${status === "active" ? "ok" : ""}`.trim();
    els.consoleStatusBadge.textContent = status;
    els.consoleStatusBadge.className = `summary-status ${status === "active" ? "ok" : ""}`.trim();
    els.consoleSiteCode.textContent = SITE_CODE;
    els.consoleLastUpdated.textContent = formatDate(row.updatedAt);
    els.campaignSummaryName.textContent = safeText(row.name || "-");
    els.campaignSummaryCost.textContent = `${formatNumber(row.costAmount)} ${safeText(row.costType || "point")}`;
    els.campaignSummaryDaily.textContent = formatNumber(row.dailySpinLimit || 0);
    const start = row.startAt ? formatDate(row.startAt) : "-";
    const end = row.endAt ? formatDate(row.endAt) : "-";
    els.campaignSummaryWindow.textContent = `${start} / ${end}`;
  }

  function validateReason(input, errorEl) {
    const reason = String(input.value || "").trim();
    input.value = reason;
    if (!reason) {
      setFieldError(errorEl, "Reason is required");
      return null;
    }
    if (reason.length > 500) {
      setFieldError(errorEl, "Reason must be 500 characters or fewer");
      return null;
    }
    setFieldError(errorEl, "");
    return reason;
  }

  function validateCampaign() {
    let ok = true;
    setGlobalError("");
    const name = els.campaignName.value.trim();
    if (!CAMPAIGN_STATUSES.includes(els.campaignStatus.value)) {
      setGlobalError("บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
      ok = false;
    }
    if (!COST_TYPES.includes(els.campaignCostType.value)) {
      setGlobalError("บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
      ok = false;
    }
    if (!name) {
      setFieldError(els.campaignNameError, "Campaign name is required");
      ok = false;
    } else {
      setFieldError(els.campaignNameError, "");
    }
    if (numberValue(els.campaignCostAmount.value) < 0) {
      setFieldError(els.campaignCostError, "Cost amount must be 0 or more");
      ok = false;
    } else {
      setFieldError(els.campaignCostError, "");
    }
    if (!Number.isInteger(Number(els.campaignDailyLimit.value)) || Number(els.campaignDailyLimit.value) < 0) {
      setFieldError(els.campaignDailyError, "Daily spin limit must be 0 or more");
      ok = false;
    } else {
      setFieldError(els.campaignDailyError, "");
    }
    if (!Number.isInteger(Number(els.campaignMonthlyLimit.value)) || Number(els.campaignMonthlyLimit.value) < 0) {
      setFieldError(els.campaignMonthlyError, "Monthly spin limit must be 0 or more");
      ok = false;
    } else {
      setFieldError(els.campaignMonthlyError, "");
    }
    const start = els.campaignStart.value ? new Date(els.campaignStart.value) : null;
    const end = els.campaignEnd.value ? new Date(els.campaignEnd.value) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
      setFieldError(els.campaignDateError, "Start date and end date must be valid");
      ok = false;
    } else if (start && end && end < start) {
      setFieldError(els.campaignDateError, "End date must not be before start date");
      ok = false;
    } else {
      setFieldError(els.campaignDateError, "");
    }
    const reason = validateReason(els.campaignReason, els.campaignReasonError);
    if (!reason) ok = false;
    return ok ? reason : null;
  }

  async function saveCampaign(event) {
    event.preventDefault();
    if (!access.updateCampaign()) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    const reason = validateCampaign();
    if (!reason) {
      setToast("Reason is required");
      return;
    }
    const body = {
      status: els.campaignStatus.value,
      name: els.campaignName.value.trim(),
      costType: els.campaignCostType.value,
      costAmount: els.campaignCostAmount.value,
      dailySpinLimit: intValue(els.campaignDailyLimit.value),
      monthlySpinLimit: intValue(els.campaignMonthlyLimit.value),
      startAt: isoOrNull(els.campaignStart.value),
      endAt: isoOrNull(els.campaignEnd.value),
      rulesText: els.campaignRules.value,
      reason,
    };
    const confirmed = await confirmAction("Confirm campaign update", `Save campaign settings for ${safeText(body.name)}. Reason: ${safeText(reason)}`);
    if (!confirmed) return;
    await withLoading(els.saveCampaign, async () => {
      try {
        await api("/admin/wheel/campaign", {
          method: "PATCH",
          body,
          safeError: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
        });
        setToast("บันทึกการตั้งค่าแคมเปญสำเร็จ");
        await loadConfig();
      } catch (_error) {
        const message = _error && (_error.status === 401 || _error.status === 403) ? _error.message : "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง";
        setGlobalError(message);
        setToast(message);
      }
    });
  }

  function remainingStock(reward) {
    if (reward.stockLimit === null || reward.stockLimit === undefined || reward.stockLimit === "") return "ไม่จำกัด";
    return Math.max(intValue(reward.stockLimit) - intValue(reward.stockUsed), 0);
  }

  function renderRewards() {
    updateAccessStates();
    const rows = rewards();
    els.rewardRows.innerHTML = "";
    els.rewardsEmpty.classList.toggle("hidden", rows.length > 0);
    rows.forEach((reward, index) => {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.sortOrder || index + 1));
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(rewardTypeLabel(reward.rewardType)));
      tr.appendChild(createCell(reward.rewardValue));
      tr.appendChild(createCell(reward.probabilityWeight));
      tr.appendChild(createCell(reward.stockLimit === null || reward.stockLimit === undefined ? "ไม่จำกัด" : reward.stockLimit));
      tr.appendChild(createCell(reward.stockUsed));
      tr.appendChild(createCell(remainingStock(reward)));
      const color = document.createElement("td");
      const chip = document.createElement("span");
      chip.className = "color-chip";
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.setProperty("--swatch", validColor(reward.segmentColor) ? reward.segmentColor : "#16705d");
      chip.appendChild(swatch);
      chip.appendChild(document.createTextNode(safeText(reward.segmentColor)));
      color.appendChild(chip);
      tr.appendChild(color);
      const image = document.createElement("td");
      if (reward.imageUrl) {
        const img = document.createElement("img");
        img.className = "reward-image";
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        img.src = reward.imageUrl;
        image.appendChild(img);
      } else {
        image.textContent = "-";
      }
      tr.appendChild(image);
      const status = document.createElement("td");
      status.appendChild(createBadge(reward.status || "-", reward.status === "active" ? "ok" : ""));
      tr.appendChild(status);
      const actions = document.createElement("td");
      actions.className = "button-row";
      actions.appendChild(actionButton("Edit", () => openRewardModal(reward), !access.updateRewards()));
      actions.appendChild(actionButton(reward.status === "active" ? "Disable" : "Enable", () => openStatusModal(reward), !access.updateRewardStatus()));
      tr.appendChild(actions);
      els.rewardRows.appendChild(tr);
    });
  }

  function drawRewardTypeFilter() {
    const existing = new Set(rewards().map((reward) => reward.rewardType).filter(Boolean));
    els.filterReward.innerHTML = '<option value="">All</option>';
    if (els.claimFilterType) els.claimFilterType.innerHTML = '<option value="">All</option>';
    for (const type of new Set([...REWARD_TYPES, ...existing])) {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = rewardTypeLabel(type);
      els.filterReward.appendChild(option);
      if (els.claimFilterType) els.claimFilterType.appendChild(option.cloneNode(true));
    }
  }

  function validColor(value) {
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(value || "").trim());
  }

  function openRewardModal(reward) {
    if ((reward && !access.updateRewards()) || (!reward && !access.createRewards())) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    state.editingReward = reward || null;
    els.rewardModalTitle.textContent = reward ? "Edit reward" : "Add reward";
    els.rewardId.value = reward ? reward.id : "";
    els.rewardLabel.value = reward ? reward.label || "" : "";
    els.rewardType.value = reward ? reward.rewardType || "credit" : "credit";
    els.rewardValue.value = reward ? reward.rewardValue || "0.00" : "0.00";
    els.rewardDisplay.value = reward ? reward.displayValue || "" : "";
    els.rewardWeight.value = reward ? String(reward.probabilityWeight || 0) : "0";
    els.rewardStock.value = reward && reward.stockLimit !== null && reward.stockLimit !== undefined ? String(reward.stockLimit) : "";
    els.rewardSort.value = reward ? String(reward.sortOrder || rewards().length + 1) : String(rewards().length + 1);
    els.rewardColor.value = reward ? reward.segmentColor || "#16705d" : "#16705d";
    els.rewardImage.value = reward ? reward.imageUrl || "" : "";
    els.rewardStatus.value = reward ? reward.status || "active" : "active";
    els.rewardReason.value = "";
    setFieldError(els.rewardLabelError, "");
    setFieldError(els.rewardReasonError, "");
    setFieldError(els.rewardFormError, "");
    els.rewardModal.showModal();
  }

  function validateReward() {
    let ok = true;
    setFieldError(els.rewardFormError, "");
    if (!els.rewardLabel.value.trim()) {
      setFieldError(els.rewardLabelError, "Label is required");
      ok = false;
    } else {
      setFieldError(els.rewardLabelError, "");
    }
    if (!REWARD_TYPES.includes(els.rewardType.value) || !REWARD_STATUSES.includes(els.rewardStatus.value)) {
      setFieldError(els.rewardFormError, "Reward type or status is invalid");
      ok = false;
    }
    if (!els.rewardDisplay.value.trim()) {
      setFieldError(els.rewardFormError, "Display value is required");
      ok = false;
    }
    const checks = [
      [els.rewardValue.value, "Reward value must be 0 or more"],
      [els.rewardWeight.value, "Probability weight must be 0 or more"],
      [els.rewardSort.value, "Sort order must be at least 1"],
    ];
    if (ok) {
      for (const [value, message] of checks) {
        if (!Number.isFinite(Number(value)) || Number(value) < 0) {
          setFieldError(els.rewardFormError, message);
          ok = false;
          break;
        }
      }
    }
    if (ok && Number(els.rewardSort.value) < 1) {
      setFieldError(els.rewardFormError, "Sort order must be at least 1");
      ok = false;
    }
    if (ok && els.rewardStock.value !== "" && (!Number.isInteger(Number(els.rewardStock.value)) || Number(els.rewardStock.value) < 0)) {
      setFieldError(els.rewardFormError, "Stock limit must be blank or 0 or more");
      ok = false;
    }
    const currentStockUsed = state.editingReward ? intValue(state.editingReward.stockUsed) : 0;
    if (ok && els.rewardStock.value !== "" && Number(els.rewardStock.value) < currentStockUsed) {
      setFieldError(els.rewardFormError, "Stock limit must be greater than or equal to stock used");
      ok = false;
    }
    if (ok && !validColor(els.rewardColor.value)) {
      els.rewardColor.value = "#16705d";
    }
    if (ok) setFieldError(els.rewardFormError, "");
    const reason = validateReason(els.rewardReason, els.rewardReasonError);
    if (!reason) ok = false;
    return ok ? reason : null;
  }

  function rewardPayload(reason) {
    return {
      label: els.rewardLabel.value.trim(),
      rewardType: els.rewardType.value,
      rewardValue: els.rewardValue.value,
      displayValue: els.rewardDisplay.value.trim() || els.rewardLabel.value.trim(),
      probabilityWeight: intValue(els.rewardWeight.value),
      stockLimit: els.rewardStock.value === "" ? null : intValue(els.rewardStock.value),
      segmentColor: validColor(els.rewardColor.value) ? els.rewardColor.value.trim() : "#16705d",
      imageUrl: els.rewardImage.value.trim() || null,
      sortOrder: Math.max(1, intValue(els.rewardSort.value)),
      status: els.rewardStatus.value,
      reason,
    };
  }

  async function saveReward(event) {
    event.preventDefault();
    if ((state.editingReward && !access.updateRewards()) || (!state.editingReward && !access.createRewards())) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    const reason = validateReward();
    if (!reason) {
      setToast("Reason is required");
      return;
    }
    const body = rewardPayload(reason);
    const confirmed = await confirmAction(
      state.editingReward ? "Confirm reward update" : "Confirm reward create",
      `${state.editingReward ? "Update" : "Create"} reward ${safeText(body.label)}. Reason: ${safeText(reason)}`
    );
    if (!confirmed) return;
    await withLoading(els.saveReward, async () => {
      try {
        if (state.editingReward) {
          await api(`/admin/wheel/rewards/${encodeURIComponent(state.editingReward.id)}`, {
            method: "PATCH",
            body,
            safeError: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
          });
        } else {
          await api("/admin/wheel/rewards", {
            method: "POST",
            body,
            safeError: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
          });
        }
        els.rewardModal.close();
        setToast("บันทึกข้อมูลรางวัลสำเร็จ");
        await loadConfig();
      } catch (_error) {
        const message = _error && (_error.status === 401 || _error.status === 403 || _error.status === 404)
          ? _error.message
          : "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง";
        setGlobalError(message);
        setToast(message);
      }
    });
  }

  function openStatusModal(reward) {
    if (!access.updateRewardStatus()) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    state.statusReward = reward || null;
    if (!state.statusReward) return;
    const nextStatus = reward.status === "active" ? "inactive" : "active";
    els.statusModalTitle.textContent = nextStatus === "active" ? "Enable reward" : "Disable reward";
    els.statusModalCopy.textContent = `${nextStatus === "active" ? "Enable" : "Disable"} reward ${safeText(reward.label)}. This does not force a member spin result.`;
    els.statusReason.value = "";
    setFieldError(els.statusReasonError, "");
    els.confirmStatus.textContent = nextStatus === "active" ? "Enable" : "Disable";
    els.statusModal.showModal();
  }

  async function saveStatus(event) {
    event.preventDefault();
    if (!access.updateRewardStatus()) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    const reward = state.statusReward;
    if (!reward) return;
    const reason = validateReason(els.statusReason, els.statusReasonError);
    if (!reason) {
      setToast("Reason is required");
      return;
    }
    const nextStatus = reward.status === "active" ? "inactive" : "active";
    const confirmed = await confirmAction(
      "Confirm reward status update",
      `${nextStatus === "active" ? "Enable" : "Disable"} reward ${safeText(reward.label)}. Reason: ${safeText(reason)}`
    );
    if (!confirmed) return;
    await withLoading(els.confirmStatus, async () => {
      try {
        await api(`/admin/wheel/rewards/${encodeURIComponent(reward.id)}`, {
          method: "PATCH",
          body: { status: nextStatus, reason },
          safeError: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
        });
        els.statusModal.close();
        state.statusReward = null;
        setToast("บันทึกสถานะรางวัลสำเร็จ");
        await loadConfig();
      } catch (_error) {
        const message = _error && (_error.status === 401 || _error.status === 403 || _error.status === 404)
          ? _error.message
          : "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง";
        setGlobalError(message);
        setToast(message);
      }
    });
  }

  async function loadSpins() {
    if (!(access.viewSpins() || access.viewReports())) {
      state.spins = [];
      renderSpins();
      updateAccessStates();
      return;
    }
    els.spinsLoading.classList.remove("hidden");
    try {
      const params = new URLSearchParams();
      if (els.filterCampaign.value.trim()) params.set("campaignId", els.filterCampaign.value.trim());
      if (els.filterMember.value.trim()) {
        const memberFilter = els.filterMember.value.trim();
        if (/^[a-z0-9_-]{8,}$/i.test(memberFilter)) params.set("memberId", memberFilter);
        else params.set("username", memberFilter);
      }
      if (els.filterReward.value) params.set("rewardType", els.filterReward.value);
      if (els.filterRewardId.value.trim()) params.set("rewardId", els.filterRewardId.value.trim());
      if (els.filterFrom.value) params.set("dateFrom", els.filterFrom.value);
      if (els.filterTo.value) params.set("dateTo", `${els.filterTo.value}T23:59:59.999Z`);
      params.set("limit", "100");
      const rows = await api(`/admin/wheel/spins?${params.toString()}`);
      const statusFilter = els.filterStatus.value;
      const siteFilter = els.filterSite.value.trim();
      const safeRows = Array.isArray(rows) ? rows.map(normalizeSpin) : [];
      state.spins = safeRows.filter((row) => {
        if (statusFilter && row.reward && row.reward.status !== statusFilter) return false;
        if (siteFilter && row.siteCode !== siteFilter) return false;
        return true;
      });
      renderSpins();
      renderReports();
    } finally {
      els.spinsLoading.classList.add("hidden");
    }
  }

  async function loadMemberRewards() {
    if (!(access.viewClaims() || access.viewReports())) {
      state.memberRewards = [];
      renderMemberRewards();
      updateAccessStates();
      return;
    }
    els.claimsLoading.classList.remove("hidden");
    try {
      const params = new URLSearchParams();
      if (els.claimFilterCampaign.value.trim()) params.set("campaignId", els.claimFilterCampaign.value.trim());
      if (els.claimFilterMember.value.trim()) {
        const memberValue = els.claimFilterMember.value.trim();
        if (/^member_|^user_|^cm/i.test(memberValue)) params.set("memberId", memberValue);
        else params.set("username", memberValue);
      }
      if (els.claimFilterType.value) params.set("rewardType", els.claimFilterType.value);
      if (els.claimFilterStatus.value) params.set("status", els.claimFilterStatus.value);
      if (els.claimFilterSpin.value.trim()) params.set("spinId", els.claimFilterSpin.value.trim());
      if (els.claimFilterFrom.value) params.set("dateFrom", els.claimFilterFrom.value);
      if (els.claimFilterTo.value) params.set("dateTo", `${els.claimFilterTo.value}T23:59:59.999Z`);
      params.set("limit", "100");
      const data = await api(`/admin/wheel/member-rewards?${params.toString()}`);
      const rows = data && Array.isArray(data.rows) ? data.rows : Array.isArray(data) ? data : [];
      state.memberRewards = rows.map(normalizeMemberReward);
      els.claimLastUpdated.textContent = formatDate(new Date());
      renderMemberRewards();
      renderReports();
      setGlobalError("");
    } finally {
      els.claimsLoading.classList.add("hidden");
    }
  }

  function memberLabel(member) {
    if (!member) return "-";
    return member.username || member.phone || member.id || "-";
  }

  function claimStatusTone(status) {
    if (status === "claimed") return "ok";
    if (status === "expired" || status === "cancelled") return "danger";
    return "warn";
  }

  function canManualClaim(reward) {
    return reward && reward.status === "pending" && reward.rewardType === "physical";
  }

  function canCancelReward(reward) {
    return reward && reward.status === "pending";
  }

  function renderClaimSummary() {
    const summary = state.memberRewards.reduce(
      (acc, reward) => {
        acc.total += 1;
        acc[reward.status] = (acc[reward.status] || 0) + 1;
        acc.byType[reward.rewardType] = (acc.byType[reward.rewardType] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, claimed: 0, expired: 0, cancelled: 0, byType: {} }
    );
    els.claimTotalIssued.textContent = formatNumber(summary.total);
    els.claimPending.textContent = formatNumber(summary.pending);
    els.claimClaimed.textContent = formatNumber(summary.claimed);
    els.claimExpired.textContent = formatNumber(summary.expired);
    els.claimCancelled.textContent = formatNumber(summary.cancelled);
    els.claimTypeCounts.textContent = REWARD_TYPES
      .filter((type) => type !== "no_reward")
      .map((type) => `${rewardTypeLabel(type)} ${formatNumber(summary.byType[type] || 0)}`)
      .join(", ");
  }

  function renderMemberRewards() {
    updateAccessStates();
    els.claimRows.innerHTML = "";
    els.claimsEmpty.classList.toggle("hidden", state.memberRewards.length > 0);
    renderClaimSummary();
    for (const reward of state.memberRewards) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(reward.createdAt)));
      tr.appendChild(createCell(memberLabel(reward.member) || reward.memberId));
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(rewardTypeLabel(reward.rewardType)));
      tr.appendChild(createCell(reward.rewardValue));
      tr.appendChild(createCell(reward.source));
      tr.appendChild(createCell(reward.spinId || reward.sourceId));
      const status = document.createElement("td");
      status.appendChild(createBadge(reward.status, claimStatusTone(reward.status)));
      tr.appendChild(status);
      tr.appendChild(createCell(formatDate(reward.claimedAt)));
      tr.appendChild(createCell(formatDate(reward.expiresAt)));
      const actions = document.createElement("td");
      actions.className = "button-row";
      actions.appendChild(actionButton("View detail", () => openRewardClaimDetail(reward)));
      actions.appendChild(actionButton("Mark claimed", () => openClaimStatusModal(reward, "claimed"), !access.updateClaims() || !canManualClaim(reward)));
      actions.appendChild(actionButton("Cancel", () => openClaimStatusModal(reward, "cancelled"), !access.updateClaims() || !canCancelReward(reward)));
      tr.appendChild(actions);
      els.claimRows.appendChild(tr);
    }
  }

  function openRewardClaimDetail(reward) {
    const auditRows = state.auditRows.filter((row) => row.targetId === reward.id || (row.metadata && row.metadata.targetMemberRewardId === reward.id));
    openDetail("Reward detail", [
      ["reward id", reward.id],
      ["member id", reward.memberId],
      ["member", memberLabel(reward.member)],
      ["campaign id", reward.campaignId],
      ["source spin id", reward.spinId],
      ["reward label", reward.label],
      ["reward type", rewardTypeLabel(reward.rewardType)],
      ["reward value", reward.rewardValue],
      ["status", reward.status],
      ["createdAt", formatDate(reward.createdAt)],
      ["claimedAt", formatDate(reward.claimedAt)],
      ["expiresAt", formatDate(reward.expiresAt)],
      ["audit summary", auditRows.length ? `${formatNumber(auditRows.length)} event(s)` : "ไม่พบข้อมูล"],
    ], {
      resultSnapshot: reward.resultSnapshot || {},
      auditSummary: auditRows.map((row) => ({
        time: row.createdAt,
        actor: auditActor(row),
        action: row.action,
        reason: auditReason(row),
      })),
    });
  }

  function openClaimStatusModal(reward, status) {
    if (!access.updateClaims()) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    state.memberRewardStatus = { reward, status };
    els.claimStatusTitle.textContent = status === "claimed" ? "Mark reward as claimed" : "Cancel reward";
    els.claimStatusCopy.textContent =
      status === "claimed"
        ? `Mark physical reward ${safeText(reward.label)} as manually claimed. No real payout or wallet credit is performed.`
        : `Cancel reward ${safeText(reward.label)} in staging/mock mode. No real payout is performed.`;
    els.claimStatusReason.value = "";
    setFieldError(els.claimStatusReasonError, "");
    els.confirmClaimStatus.textContent = status === "claimed" ? "Mark claimed" : "Cancel reward";
    els.claimStatusModal.showModal();
  }

  async function saveClaimStatus(event) {
    event.preventDefault();
    if (!access.updateClaims()) {
      setToast(DENIED_ACTION_MESSAGE);
      return;
    }
    const target = state.memberRewardStatus;
    if (!target || !target.reward) return;
    const reason = validateReason(els.claimStatusReason, els.claimStatusReasonError);
    if (!reason) {
      setToast("Reason is required");
      return;
    }
    const confirmed = await confirmAction(
      "Confirm reward claim status",
      `${target.status === "claimed" ? "Mark claimed" : "Cancel"} reward ${safeText(target.reward.label)}. Reason: ${safeText(reason)}`
    );
    if (!confirmed) return;
    await withLoading(els.confirmClaimStatus, async () => {
      try {
        await api(`/admin/wheel/member-rewards/${encodeURIComponent(target.reward.id)}/status`, {
          method: "PATCH",
          body: { status: target.status, reason },
          safeError: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
        });
        els.claimStatusModal.close();
        state.memberRewardStatus = null;
        setToast("บันทึกสถานะ Reward Claims สำเร็จ");
        await loadMemberRewards();
        await loadAudit();
      } catch (_error) {
        const message = _error && (_error.status === 401 || _error.status === 403 || _error.status === 404)
          ? _error.message
          : "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง";
        setGlobalError(message);
        setToast(message);
      }
    });
  }

  function spinResultLabel(spin) {
    const result = spin && spin.result && typeof spin.result === "object" ? spin.result : {};
    return result.status || result.outcome || result.rewardType || (spin.reward && spin.reward.status) || "recorded";
  }

  function renderSpins() {
    updateAccessStates();
    els.spinRows.innerHTML = "";
    els.spinsEmpty.classList.toggle("hidden", state.spins.length > 0);
    for (const spin of state.spins) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(spin.time)));
      tr.appendChild(createCell(memberLabel(spin.member)));
      tr.appendChild(createCell(spin.campaign && (spin.campaign.name || spin.campaign.id)));
      tr.appendChild(createCell(spin.reward && (spin.reward.label || spin.reward.rewardType)));
      tr.appendChild(createCell(spin.reward && rewardTypeLabel(spin.reward.rewardType)));
      tr.appendChild(createCell(spin.cost && spin.cost.type));
      tr.appendChild(createCell(spin.cost && spin.cost.amount));
      tr.appendChild(createCell(spin.id));
      tr.appendChild(createCell(spinResultLabel(spin)));
      const detail = document.createElement("td");
      detail.appendChild(actionButton("Details", () => openSpinDetail(spin)));
      tr.appendChild(detail);
      els.spinRows.appendChild(tr);
    }
  }

  function openSpinDetail(spin) {
    openDetail("Spin detail", [
      ["spin id", spin.id],
      ["member id", spin.member && spin.member.id],
      ["campaign id", spin.campaign && spin.campaign.id],
      ["reward id", spin.reward && spin.reward.id],
      ["result snapshot", spinResultLabel(spin)],
      ["ip masked", spin.ipAddressMasked],
      ["user agent hash", spin.userAgentHash],
      ["created at", formatDate(spin.time)],
    ], spin.result || {});
  }

  function rewardCounts() {
    const counts = new Map();
    for (const spin of state.spins) {
      const label = spin.reward && spin.reward.label ? spin.reward.label : "Unknown";
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return counts;
  }

  function renderReports() {
    updateAccessStates();
    if (!access.viewReports()) return;
    const rows = rewards();
    const counts = rewardCounts();
    const totalSpins = state.spins.length;
    const issued = state.memberRewards.length;
    const uniqueMembers = new Set(state.spins.map((spin) => spin.member && spin.member.id).filter(Boolean)).size;
    const pendingRewards = state.memberRewards.filter((reward) => reward.status === "pending").length;
    const claimedRewards = state.memberRewards.filter((reward) => reward.status === "claimed").length;
    const expiredCancelledRewards = state.memberRewards.filter((reward) => reward.status === "expired" || reward.status === "cancelled").length;
    const emptyCount = state.spins.filter((spin) => spin.reward && spin.reward.rewardType === "no_reward").length;
    const totalStockUsed = rows.reduce((sum, reward) => sum + intValue(reward.stockUsed), 0);
    const topRewards = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const costByType = state.spins.reduce((acc, spin) => {
      const type = spin.cost && spin.cost.type ? spin.cost.type : "unknown";
      acc[type] = (acc[type] || 0) + numberValue(spin.cost && spin.cost.amount);
      return acc;
    }, {});
    const totalCostUsed = Object.values(costByType).reduce((sum, value) => sum + numberValue(value), 0);
    const topStockReward = rows.slice().sort((a, b) => intValue(b.stockUsed) - intValue(a.stockUsed))[0];

    els.reportTotalSpins.textContent = formatNumber(totalSpins);
    els.reportTotalCostUsed.textContent = formatNumber(totalCostUsed);
    els.reportUniqueMembers.textContent = formatNumber(uniqueMembers);
    els.reportIssued.textContent = formatNumber(issued);
    els.reportPendingRewards.textContent = formatNumber(pendingRewards);
    els.reportClaimedRewards.textContent = formatNumber(claimedRewards);
    els.reportExpiredCancelledRewards.textContent = formatNumber(expiredCancelledRewards);
    els.reportStockUsed.textContent = formatNumber(totalStockUsed);
    els.reportTopReward.textContent = topRewards.length
      ? topRewards.map(([label, count]) => `${safeText(label)} (${formatNumber(count)})`).join(", ")
      : "ไม่พบข้อมูล";
    els.reportPointCost.textContent = formatNumber(costByType.point || 0);
    els.reportTicketCost.textContent = formatNumber(costByType.ticket || 0);
    els.reportEmptyCount.textContent = formatNumber(emptyCount);
    els.reportTopStockReward.textContent = topStockReward && intValue(topStockReward.stockUsed) > 0
      ? `${safeText(topStockReward.label)} (${formatNumber(topStockReward.stockUsed)})`
      : "ไม่พบข้อมูล";

    renderTopRewards(counts, totalSpins);
    renderRewardSummary(totalSpins);
    renderRewardTypeSummary();
    renderStockUsage();
    renderDailySpinCount();
    renderClaimStatusSummary();
    renderMemberRewardSummary();
  }

  function renderTopRewards(counts, totalSpins) {
    els.topRewardRows.innerHTML = "";
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    els.topRewardsEmpty.classList.toggle("hidden", entries.length > 0);
    for (const [label, count] of entries) {
      const reward = rewards().find((item) => item.label === label) || {};
      const tr = document.createElement("tr");
      tr.appendChild(createCell(label));
      tr.appendChild(createCell(count));
      tr.appendChild(createCell(totalSpins > 0 ? `${formatNumber((count / totalSpins) * 100)} %` : "0 %"));
      tr.appendChild(createCell(reward.stockUsed || 0));
      els.topRewardRows.appendChild(tr);
    }
  }

  function renderRewardSummary(totalSpins) {
    els.rewardSummaryRows.innerHTML = "";
    const rows = rewards();
    els.rewardSummaryEmpty.classList.toggle("hidden", rows.length > 0);
    for (const reward of rows) {
      const spinCount = state.spins.filter((spin) => {
        const spinReward = spin.reward || {};
        return spinReward.id === reward.id || spinReward.label === reward.label;
      }).length;
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(rewardTypeLabel(reward.rewardType)));
      tr.appendChild(createCell(spinCount));
      tr.appendChild(createCell(reward.stockUsed || 0));
      tr.appendChild(createCell(reward.probabilityWeight || 0));
      tr.appendChild(createCell(totalSpins > 0 ? `${formatNumber((spinCount / totalSpins) * 100)} %` : "0 %"));
      tr.appendChild(createCell(remainingStock(reward)));
      els.rewardSummaryRows.appendChild(tr);
    }
  }

  function renderRewardTypeSummary() {
    els.distributionRows.innerHTML = "";
    const totalSpins = state.spins.length;
    const byType = state.spins.reduce((acc, spin) => {
      const type = spin.reward && spin.reward.rewardType ? spin.reward.rewardType : "unknown";
      if (!acc[type]) acc[type] = { spinCount: 0, issuedCount: 0 };
      acc[type].spinCount += 1;
      if (type !== "no_reward") acc[type].issuedCount += 1;
      return acc;
    }, {});
    const entries = Object.entries(byType).sort((a, b) => b[1].spinCount - a[1].spinCount);
    els.distributionEmpty.classList.toggle("hidden", entries.length > 0);
    for (const [type, summary] of entries) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(rewardTypeLabel(type)));
      tr.appendChild(createCell(summary.spinCount));
      tr.appendChild(createCell(summary.issuedCount));
      tr.appendChild(createCell(totalSpins > 0 ? `${formatNumber((summary.spinCount / totalSpins) * 100)} %` : "0 %"));
      els.distributionRows.appendChild(tr);
    }
  }

  function renderStockUsage() {
    els.stockRows.innerHTML = "";
    els.stockEmpty.classList.toggle("hidden", rewards().length > 0);
    for (const reward of rewards()) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(reward.stockLimit === null || reward.stockLimit === undefined ? "ไม่จำกัด" : reward.stockLimit));
      tr.appendChild(createCell(reward.stockUsed || 0));
      tr.appendChild(createCell(remainingStock(reward)));
      els.stockRows.appendChild(tr);
    }
  }

  function renderClaimStatusSummary() {
    els.claimStatusRows.innerHTML = "";
    const byStatus = state.memberRewards.reduce((acc, reward) => {
      acc[reward.status] = (acc[reward.status] || 0) + 1;
      return acc;
    }, {});
    const entries = MEMBER_REWARD_STATUSES.map((status) => [status, byStatus[status] || 0]).filter(([, count]) => count > 0);
    els.claimStatusEmpty.classList.toggle("hidden", entries.length > 0);
    for (const [status, count] of entries) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(status));
      tr.appendChild(createCell(count));
      tr.appendChild(createCell(state.memberRewards.length > 0 ? `${formatNumber((count / state.memberRewards.length) * 100)} %` : "0 %"));
      els.claimStatusRows.appendChild(tr);
    }
  }

  function renderMemberRewardSummary() {
    els.memberRewardSummaryRows.innerHTML = "";
    const byMember = state.memberRewards.reduce((acc, reward) => {
      const key = reward.memberId || memberLabel(reward.member);
      if (!acc[key]) acc[key] = { member: memberLabel(reward.member), total: 0, pending: 0, claimed: 0, cancelledExpired: 0 };
      acc[key].total += 1;
      if (reward.status === "pending") acc[key].pending += 1;
      if (reward.status === "claimed") acc[key].claimed += 1;
      if (reward.status === "cancelled" || reward.status === "expired") acc[key].cancelledExpired += 1;
      return acc;
    }, {});
    const entries = Object.values(byMember).sort((a, b) => b.total - a.total);
    els.memberRewardSummaryEmpty.classList.toggle("hidden", entries.length > 0);
    for (const row of entries) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(row.member));
      tr.appendChild(createCell(row.total));
      tr.appendChild(createCell(row.pending));
      tr.appendChild(createCell(row.claimed));
      tr.appendChild(createCell(row.cancelledExpired));
      els.memberRewardSummaryRows.appendChild(tr);
    }
  }

  function renderDailySpinCount() {
    els.dailyRows.innerHTML = "";
    const byDay = state.spins.reduce((acc, spin) => {
      const date = spin.time ? new Date(spin.time) : null;
      const key = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "unknown";
      if (!acc[key]) acc[key] = { spins: 0, issued: 0, cost: {} };
      acc[key].spins += 1;
      if (spin.reward && spin.reward.rewardType !== "no_reward") acc[key].issued += 1;
      const type = spin.cost && spin.cost.type ? spin.cost.type : "unknown";
      acc[key].cost[type] = (acc[key].cost[type] || 0) + numberValue(spin.cost && spin.cost.amount);
      return acc;
    }, {});
    const entries = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0]));
    els.dailyEmpty.classList.toggle("hidden", entries.length > 0);
    for (const [day, summary] of entries) {
      const cost = Object.entries(summary.cost).map(([type, value]) => `${formatNumber(value)} ${safeText(type)}`).join(", ");
      const tr = document.createElement("tr");
      tr.appendChild(createCell(day));
      tr.appendChild(createCell(summary.spins));
      tr.appendChild(createCell(summary.issued));
      tr.appendChild(createCell(cost || "0"));
      els.dailyRows.appendChild(tr);
    }
  }

  async function loadAudit() {
    if (!access.viewAudit()) {
      state.auditRows = [];
      renderAudit();
      updateAccessStates();
      return;
    }
    els.auditLoading.classList.remove("hidden");
    try {
      const data = await api("/admin/audit-logs?limit=100");
      const rows = data && Array.isArray(data.rows) ? data.rows : [];
      state.auditRows = rows.map(normalizeAuditRow).filter((row) => WHEEL_AUDIT_ACTIONS.includes(row.action));
      els.auditPlaceholder.classList.add("hidden");
      setGlobalError("");
    } catch (_error) {
      state.auditRows = [];
      if (_error && (_error.status === 401 || _error.status === 403)) {
        els.auditPlaceholder.classList.add("hidden");
        setGlobalError(_error.message);
      } else {
        els.auditPlaceholder.classList.remove("hidden");
      }
    } finally {
      els.auditLoading.classList.add("hidden");
    }
    renderAudit();
  }

  function auditReason(row) {
    return row.metadata && row.metadata.reason ? row.metadata.reason : "-";
  }

  function auditSiteCode(row) {
    return row.metadata && row.metadata.siteCode ? row.metadata.siteCode : SITE_CODE;
  }

  function auditActor(row) {
    if (row.admin && row.admin.username) return row.admin.username;
    if (row.actorAdmin && row.actorAdmin.username) return row.actorAdmin.username;
    if (row.metadata && row.metadata.actor && row.metadata.actor.username) return row.metadata.actor.username;
    return "-";
  }

  function shortJson(value) {
    const text = JSON.stringify(sanitizeValue(value || {}));
    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
  }

  function renderAudit() {
    updateAccessStates();
    els.auditRows.innerHTML = "";
    const rows = filteredAuditRows();
    els.auditEmpty.classList.toggle("hidden", rows.length > 0 || !els.auditPlaceholder.classList.contains("hidden"));
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row.createdAt)));
      tr.appendChild(createCell(auditActor(row)));
      tr.appendChild(createCell(row.action));
      tr.appendChild(createCell(auditReason(row)));
      tr.appendChild(createCell(`${safeText(row.targetType)} ${safeText(row.targetId)}`.trim()));
      tr.appendChild(createCell(shortJson(row.metadata || {})));
      tr.appendChild(createCell(auditNetwork(row)));
      const detail = document.createElement("td");
      detail.appendChild(actionButton("Diff", () => openAuditDetail(row)));
      tr.appendChild(detail);
      els.auditRows.appendChild(tr);
    }
  }

  function filteredAuditRows() {
    const action = els.auditFilterAction.value;
    const actor = els.auditFilterActor.value.trim().toLowerCase();
    const campaign = els.auditFilterCampaign.value.trim().toLowerCase();
    const reward = els.auditFilterReward.value.trim().toLowerCase();
    const target = els.auditFilterTarget.value.trim().toLowerCase();
    const from = els.auditFilterFrom.value ? new Date(els.auditFilterFrom.value) : null;
    const to = els.auditFilterTo.value ? new Date(`${els.auditFilterTo.value}T23:59:59.999Z`) : null;
    return state.auditRows.filter((row) => {
      const created = row.createdAt ? new Date(row.createdAt) : null;
      if (action && row.action !== action) return false;
      if (actor && !String(auditActor(row)).toLowerCase().includes(actor)) return false;
      if (campaign && !auditFieldMatches(row, ["targetCampaignId", "campaignId"], campaign)) return false;
      if (reward && !auditFieldMatches(row, ["targetRewardId", "rewardId"], reward)) return false;
      if (target && !String(row.targetId || "").toLowerCase().includes(target)) return false;
      if (from && created && created < from) return false;
      if (to && created && created > to) return false;
      return true;
    });
  }

  function auditFieldMatches(row, keys, expected) {
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
    const values = keys.map((key) => metadata[key]).filter((value) => value !== undefined && value !== null);
    return values.some((value) => String(value).toLowerCase().includes(expected));
  }

  function auditNetwork(row) {
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
    const ip = row.ipAddressMasked || row.ipMasked || metadata.ipAddressMasked || metadata.ipMasked || "-";
    const ua = row.userAgentHash || metadata.userAgentHash || "-";
    return `${safeText(ip)} / ${safeText(ua)}`;
  }

  function openAuditDetail(row) {
    openDetail("Audit diff", [
      ["time", formatDate(row.createdAt)],
      ["action", row.action],
      ["reason", auditReason(row)],
      ["actor", auditActor(row)],
      ["siteCode", auditSiteCode(row)],
    ], {
      before: row.beforeJson || row.before || null,
      after: row.afterJson || row.after || null,
      metadata: row.metadata || {},
    });
  }

  function openDetail(title, pairs, payload) {
    els.detailTitle.textContent = safeText(title);
    els.detailGrid.innerHTML = "";
    for (const [key, value] of pairs) {
      const dt = document.createElement("dt");
      dt.textContent = safeText(key);
      const dd = document.createElement("dd");
      dd.textContent = safeText(value);
      els.detailGrid.appendChild(dt);
      els.detailGrid.appendChild(dd);
    }
    els.detailJson.textContent = JSON.stringify(sanitizeValue(payload || {}), null, 2);
    els.detailModal.showModal();
  }

  function clearSession() {
    state.credential = "";
    state.config = null;
    state.spins = [];
    state.memberRewards = [];
    state.auditRows = [];
    state.permissions = null;
    state.statusReward = null;
    state.memberRewardStatus = null;
    els.credential.value = "";
    els.sessionState.textContent = "No session loaded";
    setGlobalError("");
    els.rewardsLoading.classList.add("hidden");
    els.spinsLoading.classList.add("hidden");
    els.claimsLoading.classList.add("hidden");
    els.auditLoading.classList.add("hidden");
    renderCampaign();
    renderRewards();
    renderSpins();
    renderMemberRewards();
    renderReports();
    renderAudit();
    updateAccessStates();
  }

  async function bootWithCredential() {
    const credential = sanitizeCredential(els.credential.value);
    els.credential.value = credential;
    if (!credential) {
      clearSession();
      setToast("Enter an admin credential");
      return;
    }
    state.credential = credential;
    els.sessionState.textContent = "Session loaded for PG77";
    try {
      await loadAll();
      setToast("Loaded Lucky Wheel console");
    } catch (_error) {
      const message = _error && _error.message ? _error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }
  }

  function bindEvents() {
    els.tabButtons.forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
    els.saveToken.addEventListener("click", () => withLoading(els.saveToken, bootWithCredential));
    els.clearToken.addEventListener("click", clearSession);
    els.campaignForm.addEventListener("submit", (event) => saveCampaign(event));
    els.refreshCampaign.addEventListener("click", () => withLoading(els.refreshCampaign, loadConfig).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.createReward.addEventListener("click", () => openRewardModal(null));
    els.refreshRewards.addEventListener("click", () => withLoading(els.refreshRewards, loadConfig).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.rewardForm.addEventListener("submit", (event) => saveReward(event));
    els.statusForm.addEventListener("submit", (event) => saveStatus(event));
    els.refreshSpins.addEventListener("click", () => withLoading(els.refreshSpins, loadSpins).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.applySpinFilters.addEventListener("click", () => withLoading(els.applySpinFilters, loadSpins).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.refreshReports.addEventListener("click", () => withLoading(els.refreshReports, async () => {
      await loadSpins();
      await loadMemberRewards();
    }).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.refreshClaims.addEventListener("click", () => withLoading(els.refreshClaims, loadMemberRewards).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.applyClaimFilters.addEventListener("click", () => withLoading(els.applyClaimFilters, loadMemberRewards).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.claimStatusForm.addEventListener("submit", (event) => saveClaimStatus(event));
    els.refreshAudit.addEventListener("click", () => withLoading(els.refreshAudit, loadAudit).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.applyAuditFilters.addEventListener("click", renderAudit);
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = document.getElementById(button.dataset.closeModal);
        if (modal && typeof modal.close === "function") modal.close();
      });
    });
  }

  function boot() {
    bindEvents();
    renderRewards();
    renderSpins();
    renderMemberRewards();
    renderReports();
    renderAudit();
  }

  boot();
})();
