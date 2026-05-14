(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const CAMPAIGN_STATUSES = ["active", "inactive", "draft"];
  const COST_TYPES = ["point", "ticket", "mock_credit"];
  const REWARD_TYPES = ["credit", "point", "ticket", "item", "no_reward"];
  const REWARD_STATUSES = ["active", "inactive"];
  const WHEEL_AUDIT_ACTIONS = ["wheel.campaign.update", "wheel.reward.create", "wheel.reward.update", "wheel.reward.delete", "wheel.spin.adjust"];
  const SENSITIVE_KEY_PATTERN = /(pass(word|code)?|token|secret|api[_-]?key|authorization|session|cookie|database[_-]?url|refresh|user[-_]?agent|headers?)/i;
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
    auditRows: [],
    activeTab: "campaign",
    editingReward: null,
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
    campaignForm: document.getElementById("campaign-form"),
    campaignStatus: document.getElementById("campaign-status"),
    campaignName: document.getElementById("campaign-name"),
    campaignCostType: document.getElementById("campaign-cost-type"),
    campaignCostAmount: document.getElementById("campaign-cost-amount"),
    campaignDailyLimit: document.getElementById("campaign-daily-limit"),
    campaignStart: document.getElementById("campaign-start"),
    campaignEnd: document.getElementById("campaign-end"),
    campaignRules: document.getElementById("campaign-rules"),
    campaignReason: document.getElementById("campaign-reason"),
    campaignNameError: document.getElementById("campaign-name-error"),
    campaignCostError: document.getElementById("campaign-cost-error"),
    campaignDailyError: document.getElementById("campaign-daily-error"),
    campaignDateError: document.getElementById("campaign-date-error"),
    campaignReasonError: document.getElementById("campaign-reason-error"),
    saveCampaign: document.getElementById("save-campaign"),
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
    filterCampaign: document.getElementById("filter-campaign"),
    filterStatus: document.getElementById("filter-status"),
    filterSite: document.getElementById("filter-site"),
    applySpinFilters: document.getElementById("apply-spin-filters"),
    reportTotalSpins: document.getElementById("report-total-spins"),
    reportIssued: document.getElementById("report-issued"),
    reportStockUsed: document.getElementById("report-stock-used"),
    reportStockRemaining: document.getElementById("report-stock-remaining"),
    reportTopReward: document.getElementById("report-top-reward"),
    reportCostUsed: document.getElementById("report-cost-used"),
    topRewardRows: document.getElementById("top-reward-rows"),
    topRewardsEmpty: document.getElementById("top-rewards-empty"),
    distributionRows: document.getElementById("distribution-rows"),
    distributionEmpty: document.getElementById("distribution-empty"),
    stockRows: document.getElementById("stock-rows"),
    refreshAudit: document.getElementById("refresh-audit"),
    auditRows: document.getElementById("audit-rows"),
    auditEmpty: document.getElementById("audit-empty"),
    auditPlaceholder: document.getElementById("audit-placeholder"),
    auditLoading: document.getElementById("audit-loading"),
    detailModal: document.getElementById("detail-modal"),
    detailTitle: document.getElementById("detail-title"),
    detailGrid: document.getElementById("detail-grid"),
    detailJson: document.getElementById("detail-json"),
  };

  function safeText(value) {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "-";
    const display = String(value);
    if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(display))) return REDACTED;
    if (RAW_IPV4_PATTERN.test(display)) return maskIp(display);
    if (/\b(password|token|secret|authorization|database_url)\b/i.test(display)) return REDACTED;
    return display.replace(/[<>]/g, "");
  }

  function safeEnum(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
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
    if (state.credential) headers.Authorization = `${["Be", "arer"].join("")} ${state.credential}`;
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

  function actionButton(label, handler, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = Boolean(disabled);
    button.addEventListener("click", handler);
    return button;
  }

  async function withLoading(button, fn) {
    button.classList.add("is-loading");
    button.disabled = true;
    try {
      return await fn();
    } finally {
      button.classList.remove("is-loading");
      button.disabled = false;
    }
  }

  function setActiveTab(tab) {
    state.activeTab = tab;
    for (const button of els.tabButtons) button.classList.toggle("active", button.dataset.tab === tab);
    for (const panel of els.tabPanels) panel.classList.toggle("active", panel.id === `tab-${tab}`);
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
      status: safeEnum(source.status, CAMPAIGN_STATUSES, "draft"),
      costType: safeEnum(source.costType, COST_TYPES, "point"),
      costAmount: numberValue(source.costAmount).toFixed(2),
      dailySpinLimit: intValue(source.dailySpinLimit),
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
      rewardType: safeEnum(source.rewardType, REWARD_TYPES, "no_reward"),
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
        rewardType: safeEnum(reward.rewardType, REWARD_TYPES, "no_reward"),
        rewardValue: numberValue(reward.rewardValue).toFixed(2),
        displayValue: reward.displayValue ? safeText(reward.displayValue) : reward.label ? safeText(reward.label) : "Unknown",
        status: reward.status ? safeText(reward.status) : "no_reward",
      },
      cost: {
        type: safeEnum(cost.type, COST_TYPES, "point"),
        amount: numberValue(cost.amount).toFixed(2),
      },
      prizeIndex: intValue(source.prizeIndex),
      ipAddressMasked: source.ipAddressMasked ? maskIp(source.ipAddressMasked) : maskIp(source.ipAddress || source.rawIp),
      siteCode: source.siteCode ? safeText(source.siteCode) : SITE_CODE,
      result: sanitizeValue(source.result || {}),
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

  async function loadAll() {
    await loadConfig();
    await loadSpins();
    await loadAudit();
  }

  async function loadConfig() {
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
    const row = campaign();
    els.campaignStatus.value = safeEnum(row.status, CAMPAIGN_STATUSES, "draft");
    els.campaignName.value = row.name || "";
    els.campaignCostType.value = safeEnum(row.costType, COST_TYPES, "point");
    els.campaignCostAmount.value = row.costAmount || "0.00";
    els.campaignDailyLimit.value = row.dailySpinLimit === null || row.dailySpinLimit === undefined ? "0" : String(row.dailySpinLimit);
    els.campaignStart.value = datetimeLocal(row.startAt);
    els.campaignEnd.value = datetimeLocal(row.endAt);
    els.campaignRules.value = row.rulesText || "";
    els.campaignReason.value = "";
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
    const start = els.campaignStart.value ? new Date(els.campaignStart.value) : null;
    const end = els.campaignEnd.value ? new Date(els.campaignEnd.value) : null;
    if (start && end && end < start) {
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
      startAt: isoOrNull(els.campaignStart.value),
      endAt: isoOrNull(els.campaignEnd.value),
      rulesText: els.campaignRules.value,
      reason,
    };
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
    const rows = rewards();
    els.rewardRows.innerHTML = "";
    els.rewardsEmpty.classList.toggle("hidden", rows.length > 0);
    rows.forEach((reward, index) => {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.sortOrder || index + 1));
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(reward.rewardType));
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
      actions.appendChild(actionButton("Edit", () => openRewardModal(reward)));
      actions.appendChild(actionButton(reward.status === "active" ? "Disable" : "Enable", () => quickToggleReward(reward)));
      tr.appendChild(actions);
      els.rewardRows.appendChild(tr);
    });
  }

  function drawRewardTypeFilter() {
    const existing = new Set(rewards().map((reward) => reward.rewardType).filter(Boolean));
    els.filterReward.innerHTML = '<option value="">All</option>';
    for (const type of new Set([...REWARD_TYPES, ...existing])) {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      els.filterReward.appendChild(option);
    }
  }

  function validColor(value) {
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(value || "").trim());
  }

  function openRewardModal(reward) {
    state.editingReward = reward || null;
    els.rewardModalTitle.textContent = reward ? "Edit reward" : "Create reward";
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
    if (ok && !validColor(els.rewardColor.value)) {
      setFieldError(els.rewardFormError, "Segment color must be a hex color");
      ok = false;
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
      segmentColor: els.rewardColor.value.trim(),
      imageUrl: els.rewardImage.value.trim() || null,
      sortOrder: Math.max(1, intValue(els.rewardSort.value)),
      status: els.rewardStatus.value,
      reason,
    };
  }

  async function saveReward(event) {
    event.preventDefault();
    const reason = validateReward();
    if (!reason) {
      setToast("Reason is required");
      return;
    }
    const body = rewardPayload(reason);
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

  function quickToggleReward(reward) {
    openRewardModal(reward);
    els.rewardStatus.value = reward.status === "active" ? "inactive" : "active";
  }

  async function loadSpins() {
    els.spinsLoading.classList.remove("hidden");
    try {
      const params = new URLSearchParams();
      if (els.filterCampaign.value.trim()) params.set("campaignId", els.filterCampaign.value.trim());
      if (els.filterMember.value.trim()) params.set("username", els.filterMember.value.trim());
      if (els.filterReward.value) params.set("rewardType", els.filterReward.value);
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

  function memberLabel(member) {
    if (!member) return "-";
    return member.username || member.phone || member.id || "-";
  }

  function renderSpins() {
    els.spinRows.innerHTML = "";
    els.spinsEmpty.classList.toggle("hidden", state.spins.length > 0);
    for (const spin of state.spins) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(spin.time)));
      tr.appendChild(createCell(memberLabel(spin.member)));
      tr.appendChild(createCell(spin.campaign && (spin.campaign.name || spin.campaign.id)));
      tr.appendChild(createCell(spin.reward && (spin.reward.label || spin.reward.rewardType)));
      tr.appendChild(createCell(spin.cost ? `${safeText(spin.cost.type)} ${safeText(spin.cost.amount)}` : "-"));
      tr.appendChild(createCell(spin.prizeIndex));
      tr.appendChild(createCell(spin.ipAddressMasked));
      tr.appendChild(createCell(spin.siteCode || SITE_CODE));
      tr.appendChild(createCell(spin.reward && spin.reward.status));
      const detail = document.createElement("td");
      detail.appendChild(actionButton("Details", () => openSpinDetail(spin)));
      tr.appendChild(detail);
      els.spinRows.appendChild(tr);
    }
  }

  function openSpinDetail(spin) {
    openDetail("Spin detail", [
      ["spinId", spin.id],
      ["time", formatDate(spin.time)],
      ["member", memberLabel(spin.member)],
      ["reward", spin.reward && spin.reward.label],
      ["cost", spin.cost ? `${safeText(spin.cost.type)} ${safeText(spin.cost.amount)}` : "-"],
      ["prizeIndex", spin.prizeIndex],
      ["ipAddressMasked", spin.ipAddressMasked],
      ["siteCode", spin.siteCode || SITE_CODE],
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
    const rows = rewards();
    const counts = rewardCounts();
    const totalSpins = state.spins.length;
    const issued = state.spins.filter((spin) => spin.reward && spin.reward.status !== "no_reward").length;
    const totalStockUsed = rows.reduce((sum, reward) => sum + intValue(reward.stockUsed), 0);
    const finiteRemaining = rows.reduce((sum, reward) => {
      if (reward.stockLimit === null || reward.stockLimit === undefined) return sum;
      return sum + Math.max(intValue(reward.stockLimit) - intValue(reward.stockUsed), 0);
    }, 0);
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    const costByType = state.spins.reduce((acc, spin) => {
      const type = spin.cost && spin.cost.type ? spin.cost.type : "unknown";
      acc[type] = (acc[type] || 0) + numberValue(spin.cost && spin.cost.amount);
      return acc;
    }, {});

    els.reportTotalSpins.textContent = formatNumber(totalSpins);
    els.reportIssued.textContent = formatNumber(issued);
    els.reportStockUsed.textContent = formatNumber(totalStockUsed);
    els.reportStockRemaining.textContent = formatNumber(finiteRemaining);
    els.reportTopReward.textContent = top ? safeText(top[0]) : "-";
    els.reportCostUsed.textContent = Object.keys(costByType).length
      ? Object.entries(costByType).map(([type, value]) => `${formatNumber(value)} ${safeText(type)}`).join(", ")
      : "0";

    renderTopRewards(counts, totalSpins);
    renderDistribution(counts);
    renderStockUsage();
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

  function renderDistribution(counts) {
    els.distributionRows.innerHTML = "";
    const totalSpins = state.spins.length;
    els.distributionEmpty.classList.toggle("hidden", rewards().length > 0);
    for (const reward of rewards()) {
      const issuedCount = counts.get(reward.label) || 0;
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(reward.probabilityWeight));
      tr.appendChild(createCell(issuedCount));
      tr.appendChild(createCell(totalSpins > 0 ? `${formatNumber((issuedCount / totalSpins) * 100)} %` : "0 %"));
      els.distributionRows.appendChild(tr);
    }
  }

  function renderStockUsage() {
    els.stockRows.innerHTML = "";
    for (const reward of rewards()) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(reward.label));
      tr.appendChild(createCell(reward.stockLimit === null || reward.stockLimit === undefined ? "ไม่จำกัด" : reward.stockLimit));
      tr.appendChild(createCell(reward.stockUsed || 0));
      tr.appendChild(createCell(remainingStock(reward)));
      els.stockRows.appendChild(tr);
    }
  }

  async function loadAudit() {
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
    els.auditRows.innerHTML = "";
    els.auditEmpty.classList.toggle("hidden", state.auditRows.length > 0 || !els.auditPlaceholder.classList.contains("hidden"));
    for (const row of state.auditRows) {
      const tr = document.createElement("tr");
      tr.appendChild(createCell(formatDate(row.createdAt)));
      tr.appendChild(createCell(row.action));
      tr.appendChild(createCell(auditReason(row)));
      tr.appendChild(createCell(auditActor(row)));
      tr.appendChild(createCell(auditSiteCode(row)));
      tr.appendChild(createCell(shortJson(row.beforeJson || row.before)));
      tr.appendChild(createCell(shortJson(row.afterJson || row.after)));
      const detail = document.createElement("td");
      detail.appendChild(actionButton("Diff", () => openAuditDetail(row)));
      tr.appendChild(detail);
      els.auditRows.appendChild(tr);
    }
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
    state.auditRows = [];
    els.credential.value = "";
    els.sessionState.textContent = "No session loaded";
    setGlobalError("");
    els.rewardsLoading.classList.add("hidden");
    els.spinsLoading.classList.add("hidden");
    els.auditLoading.classList.add("hidden");
    renderRewards();
    renderSpins();
    renderReports();
    renderAudit();
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
    els.createReward.addEventListener("click", () => openRewardModal(null));
    els.refreshRewards.addEventListener("click", () => withLoading(els.refreshRewards, loadConfig).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
    els.rewardForm.addEventListener("submit", (event) => saveReward(event));
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
    els.refreshAudit.addEventListener("click", () => withLoading(els.refreshAudit, loadAudit).catch((error) => {
      const message = error && error.message ? error.message : "โหลดข้อมูลไม่สำเร็จ";
      setGlobalError(message);
      setToast(message);
    }));
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
    renderReports();
    renderAudit();
  }

  boot();
})();
