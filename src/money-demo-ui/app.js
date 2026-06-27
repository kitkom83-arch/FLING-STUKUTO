(function () {
  "use strict";

  const SITE_CODE = "PG77";
  const API_BASE = "/api";
  const STORAGE_PREFIX = "pg77-money-demo";
  const WHEEL_MEMBER_ROUTE = "/member/lucky-wheel/";
  const WHEEL_AUTH_STORAGE_KEY = "pg77_member_token";
  const DEFAULT_MEMBER_PASSWORD = "localSmokeMember123";
  const DEFAULT_ADMIN_USERNAME = "local_money_flow_admin";
  const DEFAULT_ADMIN_PASSWORD = "local-demo-admin-code-not-real";
  const MEMBER_CODE_REWARD_ROUTE_NOTE =
    "Backend-connected local-safe reward wallet surfaces use POST /api/code-center/redeem, GET /api/code-center/redeem-logs, GET /api/member/rewards, GET /api/member/rewards/summary, GET /api/member/rewards/history, and GET /api/member/wheel/my-rewards.";
  const ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE =
    "Members stay read-only on /admin/ via GET /api/admin/members, GET /api/admin/members/:id, and GET /api/admin/members/:id/history.";
  const ADMIN_FINANCE_CONNECTED_ROUTE_NOTE =
    "Backend-connected local-safe queues use GET /api/admin/bank-accounts/pending, GET /api/admin/deposits, GET /api/admin/withdrawals, GET /api/admin/reports/wallet-ledger, and GET /api/admin/logs.";
  const ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE =
    "Backend-connected read-only dashboard/report cards use GET /api/admin/reports/summary and the main /admin/ surface keeps GET /api/admin/reports/deposits, GET /api/admin/reports/withdrawals, GET /api/admin/reports/wallet-ledger, GET /api/admin/logs, and GET /api/admin/members local-safe.";
  const ADMIN_CODE_REWARD_ROUTE_NOTE =
    "Backend-connected read-only code/reward visibility uses GET /api/admin/code-center/campaigns and GET /api/admin/code-center/redeem-logs, while Lucky Wheel claim visibility remains on GET /api/admin/wheel/member-rewards.";
  const PROMOTION_BONUS_ROUTE_NOTE =
    "Backend-connected promotion/bonus visibility uses GET /api/promotions plus read-only ledger/report relationship markers; POST /api/promotions/:id/claim is held out of this UI because it can create promotion_bonus ledger rows and turnover requirements.";

  const page = document.body && document.body.dataset ? document.body.dataset.page : "";

  function safeText(value, fallback) {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) return fallback || "-";
    return String(value).replace(/[<>]/g, "");
  }

  function safeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      safeNumber(value, 0)
    );
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB", { hour12: false });
  }

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function storageKey(name) {
    return `${STORAGE_PREFIX}:${page}:${name}`;
  }

  function readStorage(name, fallback) {
    try {
      return safeJsonParse(window.localStorage.getItem(storageKey(name)), fallback);
    } catch (_error) {
      return fallback;
    }
  }

  function writeStorage(name, value) {
    try {
      window.localStorage.setItem(storageKey(name), JSON.stringify(value));
    } catch (_error) {
      // Best effort for local demo only.
    }
  }

  function removeStorage(name) {
    try {
      window.localStorage.removeItem(storageKey(name));
    } catch (_error) {
      // Best effort for local demo only.
    }
  }

  function writeRawStorage(key, value) {
    try {
      if (!key) return;
      if (value === null || value === undefined || value === "") {
        window.localStorage.removeItem(key);
        return;
      }
      window.localStorage.setItem(key, String(value));
    } catch (_error) {
      // Best effort for local demo only.
    }
  }

  function syncLuckyWheelMemberToken(token) {
    writeRawStorage(WHEEL_AUTH_STORAGE_KEY, token || "");
  }

  function apiRequest(path, options) {
    const config = options || {};
    const headers = {
      Accept: "application/json",
      "X-Site-Code": SITE_CODE,
    };
    if (config.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (config.token) {
      headers.Authorization = `${["Be", "arer"].join("")} ${config.token}`;
    }

    return fetch(`${API_BASE}${path}`, {
      method: config.method || "GET",
      headers,
      body: config.body === undefined ? undefined : JSON.stringify(config.body),
    })
      .then(async function (response) {
        let payload = null;
        try {
          payload = await response.json();
        } catch (_error) {
          const parseError = new Error(`Non-JSON response for ${path}`);
          parseError.status = response.status;
          throw parseError;
        }

        if (!response.ok || !payload || payload.success !== true) {
          const error = new Error(payload && payload.message ? payload.message : `Request failed for ${path}`);
          error.status = response.status;
          error.payload = payload;
          throw error;
        }

        return payload.data;
      });
  }

  function makeRunId() {
    return `${Date.now()}${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
  }

  function setStatus(element, value) {
    if (element) element.textContent = safeText(value);
  }

  function statusClass(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "approved" || normalized === "paid" || normalized === "active") return "status-approved";
    if (normalized === "pending") return "status-pending";
    if (normalized === "rejected" || normalized === "blocked") return "status-rejected";
    return "";
  }

  function makeMaskedAccount(value) {
    const text = String(value || "");
    if (text.length <= 4) return text || "-";
    return `***${text.slice(-4)}`;
  }

  function promptReason(actionLabel) {
    const input = window.prompt(`${actionLabel} reason`, `${actionLabel} from local money demo`);
    return typeof input === "string" ? input.trim() : "";
  }

  function promptOptionalNote(actionLabel) {
    const input = window.prompt(`${actionLabel} note`, `${actionLabel} from local money demo`);
    return typeof input === "string" ? input.trim() : "";
  }

  function renderEmptyState(container, emptyEl, rows) {
    if (container) container.innerHTML = "";
    if (emptyEl) emptyEl.style.display = rows.length ? "none" : "block";
  }

  function createCell(tr, value, className) {
    const td = document.createElement("td");
    td.textContent = safeText(value);
    if (className) td.className = className;
    tr.appendChild(td);
    return td;
  }

  function initMemberPage() {
    const els = {
      bootstrap: document.getElementById("member-bootstrap"),
      refresh: document.getElementById("member-refresh"),
      login: document.getElementById("member-login"),
      clear: document.getElementById("member-clear-session"),
      openLuckyWheel: document.getElementById("open-member-lucky-wheel"),
      phone: document.getElementById("member-phone"),
      password: document.getElementById("member-password"),
      username: document.getElementById("member-username"),
      bankCode: document.getElementById("member-bank-code"),
      bankNumber: document.getElementById("member-bank-number"),
      bankName: document.getElementById("member-bank-name"),
      walletBalance: document.getElementById("wallet-balance"),
      walletCurrency: document.getElementById("wallet-currency"),
      bankApprovedCount: document.getElementById("bank-approved-count"),
      depositPendingCount: document.getElementById("deposit-pending-count"),
      withdrawPendingCount: document.getElementById("withdraw-pending-count"),
      sessionStatus: document.getElementById("member-session-status"),
      rewardState: document.getElementById("member-reward-state"),
      rewardCouponCount: document.getElementById("member-reward-coupon-count"),
      rewardBoxCount: document.getElementById("member-reward-box-count"),
      rewardDiamondBalance: document.getElementById("member-reward-diamond-balance"),
      rewardPendingCount: document.getElementById("member-reward-pending-count"),
      redeemLogCount: document.getElementById("member-redeem-log-count"),
      wheelRewardCount: document.getElementById("member-wheel-reward-count"),
      promotionState: document.getElementById("member-promotion-state"),
      promotionCount: document.getElementById("member-promotion-count"),
      promotionActiveCount: document.getElementById("member-promotion-active-count"),
      promotionClaimStatus: document.getElementById("member-promotion-claim-status"),
      promotionLedgerCount: document.getElementById("member-promotion-ledger-count"),
      promotionEmpty: document.getElementById("member-promotion-empty"),
      promotionRows: document.getElementById("member-promotion-rows"),
      redeemCode: document.getElementById("member-redeem-code"),
      redeemSubmit: document.getElementById("member-redeem-submit"),
      rewardEmpty: document.getElementById("member-reward-empty"),
      rewardListEmpty: document.getElementById("member-reward-list-empty"),
      rewardListRows: document.getElementById("member-reward-list-rows"),
      redeemLogEmpty: document.getElementById("member-redeem-log-empty"),
      redeemLogRows: document.getElementById("member-redeem-log-rows"),
      rewardHistoryEmpty: document.getElementById("member-reward-history-empty"),
      rewardHistoryRows: document.getElementById("member-reward-history-rows"),
      wheelRewardEmpty: document.getElementById("member-wheel-reward-empty"),
      wheelRewardRows: document.getElementById("member-wheel-reward-rows"),
      depositAmount: document.getElementById("deposit-amount"),
      depositChannel: document.getElementById("deposit-channel"),
      depositBankAccount: document.getElementById("deposit-bank-account"),
      depositNote: document.getElementById("deposit-note"),
      createDeposit: document.getElementById("create-deposit"),
      withdrawAmount: document.getElementById("withdraw-amount"),
      withdrawBankAccount: document.getElementById("withdraw-bank-account"),
      withdrawNote: document.getElementById("withdraw-note"),
      createWithdrawal: document.getElementById("create-withdrawal"),
      bankEmpty: document.getElementById("bank-empty"),
      bankRows: document.getElementById("bank-rows"),
      ledgerEmpty: document.getElementById("ledger-empty"),
      ledgerRows: document.getElementById("ledger-rows"),
      depositsEmpty: document.getElementById("deposits-empty"),
      depositsRows: document.getElementById("deposits-rows"),
      withdrawalsEmpty: document.getElementById("withdrawals-empty"),
      withdrawalsRows: document.getElementById("withdrawals-rows"),
      statusText: document.getElementById("member-status-text"),
    };

    const state = {
      busy: false,
      token: null,
      tokenVerified: false,
      sessionStatus: "not_ready",
      profile: null,
      wallet: null,
      bankAccounts: [],
      ledger: [],
      deposits: [],
      withdrawals: [],
      rewardSummary: null,
      rewardWallet: [],
      rewardHistory: [],
      redeemLogs: [],
      wheelRewards: [],
      promotions: [],
    };

    function setBusy(nextBusy) {
      state.busy = nextBusy;
      [
        els.bootstrap,
        els.refresh,
        els.login,
        els.clear,
        els.openLuckyWheel,
        els.redeemSubmit,
        els.createDeposit,
        els.createWithdrawal,
      ].forEach(function (button) {
        if (button) button.disabled = nextBusy;
      });
    }

    function readSavedMember() {
      return readStorage("member-session", null);
    }

    function writeSavedMember(session) {
      writeStorage("member-session", session);
    }

    function clearSavedMember() {
      removeStorage("member-session");
    }

    function persistMemberSession(extra) {
      writeSavedMember(Object.assign({}, memberSessionFromInputs(), extra || {}));
    }

    function setMemberSessionState(nextStatus) {
      state.sessionStatus = safeText(nextStatus, "not_ready");
    }

    function clearMemberAuth(options) {
      const opts = options || {};
      state.token = null;
      state.tokenVerified = false;
      state.profile = null;
      if (!opts.keepWallet) state.wallet = null;
      if (!opts.keepRows) {
        state.bankAccounts = [];
        state.ledger = [];
        state.deposits = [];
        state.withdrawals = [];
        state.rewardSummary = null;
        state.rewardWallet = [];
        state.rewardHistory = [];
        state.redeemLogs = [];
        state.wheelRewards = [];
        state.promotions = [];
      }
      setMemberSessionState("not_ready");
      persistMemberSession({ token: null, profile: null });
      syncLuckyWheelMemberToken(null);
    }

    function describeError(error, fallback) {
      const status = error && error.status ? `${error.status}` : "";
      const message = safeText(error && error.message, "");
      return [status, message].filter(Boolean).join(" ").trim() || fallback;
    }

    function isAuthError(error) {
      return !!(error && (error.status === 401 || error.status === 403 || /401|403|unauthorized|forbidden/i.test(String(error.message || ""))));
    }

    function isDuplicateMemberError(error) {
      const text = `${safeText(error && error.message, "")} ${JSON.stringify(error && error.payload ? error.payload : {})}`;
      return (
        error && (error.status === 400 || error.status === 409 || error.status === 500) &&
        /unique constraint|p2002|already exists|phone exists|duplicate|siteid.*phone/i.test(text)
      );
    }

    function syncSessionInputs(session) {
      const saved = session || {};
      if (!els.phone.value) els.phone.value = safeText(saved.phone, "");
      if (!els.password.value) els.password.value = safeText(saved.password, DEFAULT_MEMBER_PASSWORD);
      if (!els.username.value) els.username.value = safeText(saved.username, "");
      if (!els.bankNumber.value) els.bankNumber.value = safeText(saved.bankAccountNumber, "");
    }

    function makeDefaultMemberDraft() {
      const runId = makeRunId();
      return {
        phone: `09${runId.slice(-8)}`,
        username: `money_${runId}`,
        password: DEFAULT_MEMBER_PASSWORD,
        bankAccountNumber: `77${runId.slice(-8)}`,
      };
    }

    function ensureMemberDraft() {
      const session = readSavedMember();
      const draft = session || makeDefaultMemberDraft();
      els.phone.value = safeText(draft.phone, "");
      els.username.value = safeText(draft.username, "");
      els.password.value = safeText(draft.password, DEFAULT_MEMBER_PASSWORD);
      els.bankNumber.value = safeText(draft.bankAccountNumber, "");
    }

    function populateBankSelects() {
      const depositOptions = state.bankAccounts.slice();
      const withdrawOptions = state.bankAccounts.filter(function (item) {
        return String(item.status || "").toLowerCase() === "approved";
      });

      function fillSelect(select, options, emptyText) {
        select.innerHTML = "";
        const first = document.createElement("option");
        first.value = "";
        first.textContent = options.length ? "Select account" : emptyText;
        select.appendChild(first);
        options.forEach(function (item) {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = `${safeText(item.bankCode)} ${makeMaskedAccount(item.accountNumber)} (${safeText(item.status)})`;
          select.appendChild(option);
        });
        if (options.length === 1) {
          select.value = options[0].id;
        }
      }

      fillSelect(els.depositBankAccount, depositOptions, "No bank account");
      fillSelect(els.withdrawBankAccount, withdrawOptions, "No approved bank account");
    }

    function renderSummary() {
      setStatus(els.walletBalance, state.wallet ? formatMoney(state.wallet.balance) : "-");
      setStatus(els.walletCurrency, state.wallet ? state.wallet.currency : "-");
      setStatus(
        els.bankApprovedCount,
        state.bankAccounts.filter(function (item) {
          return String(item.status || "").toLowerCase() === "approved";
        }).length
      );
      setStatus(
        els.depositPendingCount,
        state.deposits.filter(function (item) {
          return String(item.status || "").toLowerCase() === "pending";
        }).length
      );
      setStatus(
        els.withdrawPendingCount,
        state.withdrawals.filter(function (item) {
          return String(item.status || "").toLowerCase() === "pending";
        }).length
      );
      setStatus(els.sessionStatus, state.sessionStatus);
      setStatus(els.rewardCouponCount, state.rewardSummary ? safeNumber(state.rewardSummary.couponCount, 0) : "-");
      setStatus(els.rewardBoxCount, state.rewardSummary ? safeNumber(state.rewardSummary.boxCount, 0) : "-");
      setStatus(
        els.rewardDiamondBalance,
        state.rewardSummary ? formatMoney(safeNumber(state.rewardSummary.diamondBalance, 0)) : "-"
      );
      setStatus(els.rewardPendingCount, state.rewardSummary ? safeNumber(state.rewardSummary.pendingRewardCount, 0) : "-");
      setStatus(els.redeemLogCount, state.redeemLogs.length);
      setStatus(els.wheelRewardCount, state.wheelRewards.length);
      setStatus(els.promotionCount, state.promotions.length);
      setStatus(
        els.promotionActiveCount,
        state.promotions.filter(function (item) {
          return String(item.status || "").toLowerCase() === "active";
        }).length
      );
      setStatus(els.promotionClaimStatus, "read_only_hold");
      setStatus(
        els.promotionLedgerCount,
        state.ledger.filter(function (item) {
          return /promotion_bonus|bonus/i.test(String(item.type || item.referenceType || ""));
        }).length
      );
      if (els.rewardEmpty) {
        els.rewardEmpty.style.display = state.rewardSummary ? "none" : "block";
      }
    }

    function renderBankAccounts() {
      renderEmptyState(els.bankRows, els.bankEmpty, state.bankAccounts);
      state.bankAccounts.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, `${safeText(row.bankCode)} ${makeMaskedAccount(row.accountNumber)}`);
        createCell(tr, safeText(row.accountName));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, formatDate(row.approvedAt));
        els.bankRows.appendChild(tr);
      });
    }

    function renderLedger() {
      renderEmptyState(els.ledgerRows, els.ledgerEmpty, state.ledger);
      state.ledger.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.type));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, formatMoney(row.balanceAfter));
        createCell(tr, `${safeText(row.referenceType)} / ${safeText(row.referenceId)}`);
        els.ledgerRows.appendChild(tr);
      });
    }

    function renderDeposits() {
      renderEmptyState(els.depositsRows, els.depositsEmpty, state.deposits);
      state.deposits.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.transactionId));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, formatDate(row.approvedAt));
        els.depositsRows.appendChild(tr);
      });
    }

    function renderWithdrawals() {
      renderEmptyState(els.withdrawalsRows, els.withdrawalsEmpty, state.withdrawals);
      state.withdrawals.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.transactionId));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, formatDate(row.approvedAt));
        els.withdrawalsRows.appendChild(tr);
      });
    }

    function renderRewardWallet() {
      renderEmptyState(els.rewardListRows, els.rewardListEmpty, state.rewardWallet);
      state.rewardWallet.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.type));
        createCell(tr, safeText(row.label));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, safeText(row.source));
        els.rewardListRows.appendChild(tr);
      });
    }

    function renderRewardHistory() {
      renderEmptyState(els.rewardHistoryRows, els.rewardHistoryEmpty, state.rewardHistory);
      state.rewardHistory.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.type));
        createCell(tr, safeText(row.label));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, safeText(row.source));
        els.rewardHistoryRows.appendChild(tr);
      });
    }

    function renderRedeemLogs() {
      renderEmptyState(els.redeemLogRows, els.redeemLogEmpty, state.redeemLogs);
      state.redeemLogs.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.code));
        createCell(tr, safeText(row.rewardType));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, safeText(row.result));
        els.redeemLogRows.appendChild(tr);
      });
    }

    function renderWheelRewards() {
      renderEmptyState(els.wheelRewardRows, els.wheelRewardEmpty, state.wheelRewards);
      state.wheelRewards.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.rewardLabel || row.label || row.reward && row.reward.label));
        createCell(tr, safeText(row.rewardType || row.type || row.reward && row.reward.type));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, safeText(row.spinId || row.reference && row.reference.spinId || "-"));
        els.wheelRewardRows.appendChild(tr);
      });
    }

    function promotionBonusText(row) {
      const type = safeText(row && row.bonusType, "bonus");
      const value = row && row.bonusValue !== undefined ? row.bonusValue : 0;
      return `${type} ${formatMoney(value)}`;
    }

    function promotionWithdrawCondition(row) {
      const maxBonus = row && row.maxBonus !== null && row.maxBonus !== undefined ? `max bonus ${formatMoney(row.maxBonus)}` : "no max bonus";
      const endAt = row && row.endAt ? `ends ${formatDate(row.endAt)}` : "no end date";
      return `${maxBonus}; ${endAt}`;
    }

    function renderPromotions() {
      renderEmptyState(els.promotionRows, els.promotionEmpty, state.promotions);
      state.promotions.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.title || row.name || row.id));
        createCell(tr, promotionBonusText(row));
        createCell(tr, formatMoney(row.minDeposit));
        createCell(tr, `${formatMoney(row.turnoverMultiplier)}x`);
        createCell(tr, promotionWithdrawCondition(row));
        createCell(tr, "read_only_hold", "status-pending");
        els.promotionRows.appendChild(tr);
      });
    }

    function renderAll() {
      renderSummary();
      renderBankAccounts();
      renderLedger();
      renderDeposits();
      renderWithdrawals();
      renderRewardWallet();
      renderRewardHistory();
      renderRedeemLogs();
      renderWheelRewards();
      renderPromotions();
      populateBankSelects();
    }

    function memberSessionFromInputs() {
      return {
        phone: String(els.phone.value || "").trim(),
        username: String(els.username.value || "").trim(),
        password: String(els.password.value || "").trim() || DEFAULT_MEMBER_PASSWORD,
        bankCode: String(els.bankCode.value || "").trim() || "MOCK",
        bankAccountNumber: String(els.bankNumber.value || "").trim(),
        bankAccountName: String(els.bankName.value || "").trim() || "Local Demo Member",
      };
    }

    function applyMemberAuth(data, session) {
      state.token = safeText(data && data.token, "") || null;
      state.tokenVerified = false;
      setMemberSessionState(state.token ? "restoring" : "not_ready");
      state.profile = (data && data.user) || null;
      state.wallet = (data && data.wallet) || null;
      persistMemberSession({
        phone: safeText(session && session.phone, ""),
        username: safeText(session && session.username, ""),
        password: safeText(session && session.password, DEFAULT_MEMBER_PASSWORD),
        bankCode: safeText(session && session.bankCode, "MOCK"),
        bankAccountNumber: safeText(session && session.bankAccountNumber, ""),
        bankAccountName: safeText(session && session.bankAccountName, "Local Demo Member"),
        token: state.token,
          profile: state.profile,
        });
      syncLuckyWheelMemberToken(state.token);
    }

    async function probeMemberToken() {
      const wallet = await apiRequest("/wallet", { token: state.token });
      state.wallet = wallet || null;
      state.tokenVerified = true;
      setMemberSessionState("ready");
      persistMemberSession({ token: state.token, profile: state.profile });
      syncLuckyWheelMemberToken(state.token);
      return true;
    }

    function openLuckyWheel() {
      const savedSession = readSavedMember();
      const token = safeText(state.token || (savedSession && savedSession.token), "");
      if (!token) {
        els.statusText.textContent = "Login a member first before opening Lucky Wheel.";
        return;
      }
      syncLuckyWheelMemberToken(token);
      window.location.assign(WHEEL_MEMBER_ROUTE);
    }

    async function loginWithSession(session) {
      return apiRequest("/auth/login", {
        method: "POST",
        body: {
          phone: session.phone || session.username,
          password: session.password,
        },
      });
    }

    async function ensureMemberReady(options) {
      const opts = options || {};
      const session = Object.assign({}, readSavedMember() || {}, memberSessionFromInputs());
      if (!session.phone || !session.password) {
        clearMemberAuth();
        if (!opts.silent) {
          els.statusText.textContent = "Create or login a local demo member first.";
          renderAll();
        }
        return false;
      }

      if (state.token && state.tokenVerified) {
        setMemberSessionState("ready");
        return true;
      }

      setMemberSessionState("restoring");
      renderAll();

      try {
        clearMemberAuth({ keepRows: true, keepWallet: true });
        const data = await loginWithSession(session);
        applyMemberAuth(data, session);
        await probeMemberToken();
        if (!opts.silent) {
          els.statusText.textContent = "Local demo member session restored.";
        }
        renderAll();
        return true;
      } catch (error) {
        clearMemberAuth();
        if (!opts.silent) {
          els.statusText.textContent = describeError(error, "Local demo member session is not ready.");
          renderAll();
        }
        return false;
      }
    }

    async function refreshMemberData(options) {
      const opts = options || {};
      const ready = await ensureMemberReady({ silent: !!opts.silentRestore || !!opts.silent });
      if (!ready) {
        return;
      }

      if (!opts.skipBusy) {
        setBusy(true);
      }
      setMemberSessionState("restoring");
      renderAll();
      if (!opts.silent && !opts.silentRestore) {
        els.statusText.textContent = "Refreshing member money data...";
      }
      if (els.rewardState) {
        els.rewardState.textContent = `Loading backend-connected reward wallet and redeem data... ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
      }
      if (els.promotionState) {
        els.promotionState.textContent = `Loading backend-connected promotion/bonus visibility... ${PROMOTION_BONUS_ROUTE_NOTE}`;
      }

      try {
        const [wallet, ledger, bankAccounts, deposits, withdrawals, rewardSummary, rewardWallet, rewardHistory, redeemLogs, wheelRewards, promotions] = await Promise.all([
          apiRequest("/wallet", { token: state.token }),
          apiRequest("/wallet/ledger?limit=20", { token: state.token }),
          apiRequest("/bank-accounts", { token: state.token }),
          apiRequest("/deposits", { token: state.token }),
          apiRequest("/withdrawals", { token: state.token }),
          apiRequest("/member/rewards/summary", { token: state.token }),
          apiRequest("/member/rewards?limit=50", { token: state.token }),
          apiRequest("/member/rewards/history?limit=50", { token: state.token }),
          apiRequest("/code-center/redeem-logs?limit=50", { token: state.token }),
          apiRequest("/member/wheel/my-rewards?limit=20", { token: state.token }),
          apiRequest("/promotions", { token: state.token }),
        ]);
        state.wallet = wallet || null;
        state.ledger = Array.isArray(ledger) ? ledger : [];
        state.bankAccounts = Array.isArray(bankAccounts) ? bankAccounts : [];
        state.deposits = Array.isArray(deposits) ? deposits : [];
        state.withdrawals = Array.isArray(withdrawals) ? withdrawals : [];
        state.rewardSummary = rewardSummary && typeof rewardSummary === "object" ? rewardSummary : null;
        state.rewardWallet = Array.isArray(rewardWallet && rewardWallet.rewards) ? rewardWallet.rewards : [];
        state.rewardHistory = Array.isArray(rewardHistory && rewardHistory.history) ? rewardHistory.history : [];
        state.redeemLogs = Array.isArray(redeemLogs && redeemLogs.redeemLogs) ? redeemLogs.redeemLogs : [];
        state.wheelRewards = Array.isArray(wheelRewards) ? wheelRewards : [];
        state.promotions = Array.isArray(promotions) ? promotions : [];
        state.tokenVerified = true;
        setMemberSessionState("ready");
        persistMemberSession({ token: state.token, profile: state.profile });
        renderAll();
        if (els.rewardState) {
          els.rewardState.textContent = `Reward wallet and redeem data refreshed. ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
        }
        if (els.promotionState) {
          els.promotionState.textContent = `Promotion/bonus visibility refreshed. ${PROMOTION_BONUS_ROUTE_NOTE}`;
        }
        if (!opts.silentRestore) {
          els.statusText.textContent = "Member money demo data refreshed.";
        }
      } catch (error) {
        if (!opts.retrying && isAuthError(error)) {
          clearMemberAuth({ keepRows: true, keepWallet: true });
          const restored = await ensureMemberReady({ silent: true });
          if (restored) {
            return refreshMemberData(Object.assign({}, opts, { retrying: true }));
          }
        }
        setMemberSessionState("not_ready");
        renderAll();
        if (els.rewardState) {
          els.rewardState.textContent = `${describeError(error, "Reward wallet refresh failed.")} ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
        }
        if (els.promotionState) {
          els.promotionState.textContent = `${describeError(error, "Promotion/bonus visibility refresh failed.")} ${PROMOTION_BONUS_ROUTE_NOTE}`;
        }
        els.statusText.textContent = describeError(error, "Member money demo refresh failed.");
      } finally {
        if (!opts.skipBusy) {
          setBusy(false);
        }
      }
    }

    async function registerDemoMember() {
      const session = memberSessionFromInputs();
      if (!session.phone || !session.password || !session.bankAccountNumber) {
        els.statusText.textContent = "Phone, password, and bank account number are required.";
        return;
      }

      setBusy(true);
      clearMemberAuth({ keepRows: true, keepWallet: true });
      setMemberSessionState("restoring");
      els.statusText.textContent = "Creating local demo member...";
      renderAll();
      try {
        const data = await apiRequest("/auth/register", {
          method: "POST",
          body: {
            phone: session.phone,
            username: session.username || null,
            password: session.password,
            bank_code: session.bankCode,
            bank_account_number: session.bankAccountNumber,
            bank_account_name: session.bankAccountName,
            referral_source: "member-money-demo",
            accept_bonus: false,
            accept_terms: true,
          },
          });
          applyMemberAuth(data, session);
          await refreshMemberData({ skipBusy: true, silent: true });
          els.statusText.textContent = "Local demo member created. Ask admin to approve the bank account before withdrawal.";
        } catch (error) {
          if (isDuplicateMemberError(error)) {
            try {
              const data = await loginWithSession(session);
              applyMemberAuth(data, session);
              await refreshMemberData({ skipBusy: true, silent: true });
              els.statusText.textContent = "Existing local demo member restored by re-login.";
              return;
            } catch (loginError) {
              clearMemberAuth();
              renderAll();
              els.statusText.textContent = describeError(loginError, "Existing demo member login fallback failed.");
              return;
            }
          }
        clearMemberAuth();
        renderAll();
        els.statusText.textContent = describeError(error, "Local demo member register failed.");
      } finally {
        setBusy(false);
      }
    }

    async function loginDemoMember() {
      const session = memberSessionFromInputs();
      if (!session.phone || !session.password) {
        els.statusText.textContent = "Phone or username and password are required.";
        return;
      }

      setBusy(true);
      clearMemberAuth({ keepRows: true, keepWallet: true });
      setMemberSessionState("restoring");
      els.statusText.textContent = "Logging in demo member...";
      renderAll();
      try {
        const data = await loginWithSession(session);
        applyMemberAuth(data, session);
        await refreshMemberData({ skipBusy: true, silent: true });
        els.statusText.textContent = "Local demo member logged in.";
      } catch (error) {
        clearMemberAuth();
        renderAll();
        els.statusText.textContent = describeError(error, "Local demo member login failed.");
      } finally {
        setBusy(false);
      }
    }

    function clearMemberSession() {
      clearMemberAuth();
      clearSavedMember();
      ensureMemberDraft();
      renderAll();
      if (els.rewardState) {
        els.rewardState.textContent = "Local member session cleared. Reward wallet and code center remain local-safe only.";
      }
      if (els.promotionState) {
        els.promotionState.textContent = "Local member session cleared. Promotion/bonus visibility remains read-only local-safe.";
      }
      els.statusText.textContent = "Local member session cleared.";
    }

    async function redeemMemberCode() {
      const ready = await ensureMemberReady();
      if (!ready) {
        return;
      }

      const code = String(els.redeemCode.value || "").trim();
      if (!code) {
        els.statusText.textContent = "Redeem code is required.";
        return;
      }

      setBusy(true);
      if (els.rewardState) {
        els.rewardState.textContent = `Redeeming local-safe code through backend source... ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
      }
      els.statusText.textContent = "Redeeming local-safe code...";
      try {
        await apiRequest("/code-center/redeem", {
          method: "POST",
          token: state.token,
          body: { code: code },
        });
        els.redeemCode.value = "";
        await refreshMemberData({ skipBusy: true, silent: true });
        if (els.rewardState) {
          els.rewardState.textContent = `Code redeemed into reward wallet. ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
        }
        els.statusText.textContent = "Redeem code completed. Reward wallet refreshed.";
      } catch (error) {
        if (els.rewardState) {
          els.rewardState.textContent = `${safeText(error.message, "Redeem failed.")} ${MEMBER_CODE_REWARD_ROUTE_NOTE}`;
        }
        els.statusText.textContent = safeText(error.message, "Redeem code failed.");
      } finally {
        setBusy(false);
      }
    }

    async function createDeposit() {
      const ready = await ensureMemberReady();
      if (!ready) {
        return;
      }

      const bankAccountId = String(els.depositBankAccount.value || "").trim();
      if (!bankAccountId) {
        els.statusText.textContent = "Select a member bank account for the manual deposit request.";
        return;
      }

      setBusy(true);
      els.statusText.textContent = "Creating manual deposit request...";
      try {
        await apiRequest("/deposits", {
          method: "POST",
          token: state.token,
          body: {
            amount: String(els.depositAmount.value || "").trim(),
            channel: String(els.depositChannel.value || "").trim() || "manual_bank_mock",
            bank_account_id: bankAccountId,
            note: String(els.depositNote.value || "").trim(),
          },
        });
        await refreshMemberData({ skipBusy: true, silent: true });
        els.statusText.textContent = "Manual deposit request created.";
      } catch (error) {
        els.statusText.textContent = safeText(error.message, "Deposit request failed.");
      } finally {
        setBusy(false);
      }
    }

    async function createWithdrawal() {
      const ready = await ensureMemberReady();
      if (!ready) {
        return;
      }

      const bankAccountId = String(els.withdrawBankAccount.value || "").trim();
      if (!bankAccountId) {
        els.statusText.textContent = "An approved bank account is required before withdrawal can be created.";
        return;
      }

      setBusy(true);
      els.statusText.textContent = "Creating manual withdrawal request...";
      try {
        await apiRequest("/withdrawals", {
          method: "POST",
          token: state.token,
          body: {
            user_bank_account_id: bankAccountId,
            amount: String(els.withdrawAmount.value || "").trim(),
            note: String(els.withdrawNote.value || "").trim(),
          },
        });
        await refreshMemberData({ skipBusy: true, silent: true });
        els.statusText.textContent = "Manual withdrawal request created.";
      } catch (error) {
        els.statusText.textContent = safeText(error.message, "Withdrawal request failed.");
      } finally {
        setBusy(false);
      }
    }

    const savedSession = readSavedMember();
    if (savedSession) {
      els.phone.value = safeText(savedSession.phone, "");
      els.username.value = safeText(savedSession.username, "");
      els.password.value = safeText(savedSession.password, DEFAULT_MEMBER_PASSWORD);
      els.bankNumber.value = safeText(savedSession.bankAccountNumber, "");
      syncSessionInputs(savedSession);
      state.token = safeText(savedSession.token, "") || null;
      state.tokenVerified = false;
      state.profile = savedSession.profile || null;
      setMemberSessionState(state.token ? "restoring" : "not_ready");
      if (state.token) {
        syncLuckyWheelMemberToken(state.token);
      }
    } else {
      ensureMemberDraft();
      setMemberSessionState("not_ready");
      syncLuckyWheelMemberToken(null);
    }

    els.bootstrap.addEventListener("click", function () {
      registerDemoMember().catch(function () {});
    });
    els.refresh.addEventListener("click", function () {
      refreshMemberData().catch(function () {});
    });
    els.login.addEventListener("click", function () {
      loginDemoMember().catch(function () {});
    });
    els.clear.addEventListener("click", clearMemberSession);
    if (els.openLuckyWheel) {
      els.openLuckyWheel.addEventListener("click", openLuckyWheel);
    }
    els.createDeposit.addEventListener("click", function () {
      createDeposit().catch(function () {});
    });
    els.createWithdrawal.addEventListener("click", function () {
      createWithdrawal().catch(function () {});
    });
    if (els.redeemSubmit) {
      els.redeemSubmit.addEventListener("click", function () {
        redeemMemberCode().catch(function () {});
      });
    }

    renderAll();
    if (els.rewardState) {
      els.rewardState.textContent = "Login a member first to read backend-connected reward wallet and redeem data.";
    }
    if (els.promotionState) {
      els.promotionState.textContent = "Login a member first to read backend-connected promotion and bonus visibility.";
    }
    if (state.token) {
      refreshMemberData({ silentRestore: true }).catch(function () {});
      els.statusText.textContent = "Restoring local member money session...";
    } else {
      els.statusText.textContent = "Use Create Demo Member to start a local-safe finance flow.";
    }
  }

  function initAdminPage() {
    const els = {
      login: document.getElementById("admin-login"),
      refresh: document.getElementById("admin-refresh"),
      clear: document.getElementById("admin-clear-session"),
      username: document.getElementById("admin-username"),
      password: document.getElementById("admin-password"),
      summaryState: document.getElementById("admin-summary-state"),
      summaryEmpty: document.getElementById("admin-summary-empty"),
      summaryMemberCount: document.getElementById("admin-summary-member-count"),
      summaryTotalDeposit: document.getElementById("admin-summary-total-deposit"),
      summaryTotalWithdraw: document.getElementById("admin-summary-total-withdraw"),
      summaryTotalBonus: document.getElementById("admin-summary-total-bonus"),
      summaryTotalProfitMock: document.getElementById("admin-summary-total-profit-mock"),
      summaryPendingTotal: document.getElementById("admin-summary-pending-total"),
      bankCount: document.getElementById("admin-bank-count"),
      depositCount: document.getElementById("admin-deposit-count"),
      withdrawCount: document.getElementById("admin-withdraw-count"),
      ledgerCount: document.getElementById("admin-ledger-count"),
      auditCount: document.getElementById("admin-audit-count"),
      sessionStatus: document.getElementById("admin-session-status"),
      bankEmpty: document.getElementById("admin-bank-empty"),
      bankRows: document.getElementById("admin-bank-rows"),
      depositEmpty: document.getElementById("admin-deposit-empty"),
      depositRows: document.getElementById("admin-deposit-rows"),
      withdrawEmpty: document.getElementById("admin-withdraw-empty"),
      withdrawRows: document.getElementById("admin-withdraw-rows"),
      ledgerEmpty: document.getElementById("admin-ledger-empty"),
      ledgerRows: document.getElementById("admin-ledger-rows"),
      promotionState: document.getElementById("admin-promotion-state"),
      promotionCount: document.getElementById("admin-promotion-count"),
      promotionTotalBonus: document.getElementById("admin-promotion-total-bonus"),
      promotionLedgerCount: document.getElementById("admin-promotion-ledger-count"),
      promotionCrudStatus: document.getElementById("admin-promotion-crud-status"),
      promotionEmpty: document.getElementById("admin-promotion-empty"),
      promotionRows: document.getElementById("admin-promotion-rows"),
      codeRewardState: document.getElementById("admin-code-reward-state"),
      codeCampaignCount: document.getElementById("admin-code-campaign-count"),
      codeRedeemCount: document.getElementById("admin-code-redeem-count"),
      codeActiveCount: document.getElementById("admin-code-active-count"),
      codeSessionStatus: document.getElementById("admin-code-session-status"),
      codeCampaignEmpty: document.getElementById("admin-code-campaign-empty"),
      codeCampaignRows: document.getElementById("admin-code-campaign-rows"),
      codeRedeemEmpty: document.getElementById("admin-code-redeem-empty"),
      codeRedeemRows: document.getElementById("admin-code-redeem-rows"),
      auditEmpty: document.getElementById("admin-audit-empty"),
      auditRows: document.getElementById("admin-audit-rows"),
      statusText: document.getElementById("admin-status-text"),
    };

    const state = {
      busy: false,
      token: null,
      summary: null,
      pendingBanks: [],
      pendingDeposits: [],
      pendingWithdrawals: [],
      ledger: [],
      promotions: [],
      codeCampaigns: [],
      codeRedeemLogs: [],
      audit: [],
    };

    function setBusy(nextBusy) {
      state.busy = nextBusy;
      [els.login, els.refresh, els.clear].forEach(function (button) {
        if (button) button.disabled = nextBusy;
      });
      document.querySelectorAll(".inline-actions button").forEach(function (button) {
        button.disabled = nextBusy;
      });
    }

    function readSavedAdmin() {
      return readStorage("admin-session", null);
    }

    function writeSavedAdmin(session) {
      writeStorage("admin-session", session);
    }

    function clearSavedAdmin() {
      removeStorage("admin-session");
    }

    function adminSessionFromInputs() {
      return {
        username: String(els.username.value || "").trim() || DEFAULT_ADMIN_USERNAME,
        password: String(els.password.value || "").trim() || DEFAULT_ADMIN_PASSWORD,
      };
    }

    function renderSummary() {
      const summary = state.summary && typeof state.summary === "object" ? state.summary : null;
      setStatus(els.summaryMemberCount, summary ? summary.member_count : "-");
      setStatus(els.summaryTotalDeposit, summary ? formatMoney(summary.total_deposit) : "-");
      setStatus(els.summaryTotalWithdraw, summary ? formatMoney(summary.total_withdraw) : "-");
      setStatus(els.summaryTotalBonus, summary ? formatMoney(summary.total_bonus) : "-");
      setStatus(els.summaryTotalProfitMock, summary ? formatMoney(summary.total_profit_mock) : "-");
      setStatus(
        els.summaryPendingTotal,
        summary ? safeNumber(summary.pending_deposit_count, 0) + safeNumber(summary.pending_withdraw_count, 0) : "-"
      );
      if (els.summaryEmpty) {
        els.summaryEmpty.style.display = summary ? "none" : "block";
      }
      setStatus(els.bankCount, state.pendingBanks.length);
      setStatus(els.depositCount, state.pendingDeposits.length);
      setStatus(els.withdrawCount, state.pendingWithdrawals.length);
      setStatus(els.ledgerCount, state.ledger.length);
      setStatus(els.promotionCount, state.promotions.length);
      setStatus(els.promotionTotalBonus, summary ? formatMoney(summary.total_bonus) : "-");
      setStatus(
        els.promotionLedgerCount,
        state.ledger.filter(function (item) {
          return /promotion_bonus|bonus/i.test(String(item.type || item.referenceType || ""));
        }).length
      );
      setStatus(els.promotionCrudStatus, "missing_backend");
      setStatus(els.codeCampaignCount, state.codeCampaigns.length);
      setStatus(els.codeRedeemCount, state.codeRedeemLogs.length);
      setStatus(
        els.codeActiveCount,
        state.codeCampaigns.filter(function (item) {
          return String(item.status || "").toLowerCase() === "active";
        }).length
      );
      setStatus(els.codeSessionStatus, state.token ? "ready" : "not_ready");
      setStatus(els.auditCount, state.audit.length);
      setStatus(els.sessionStatus, state.token ? "ready" : "not_ready");
    }

    function renderBankAccounts() {
      renderEmptyState(els.bankRows, els.bankEmpty, state.pendingBanks);
      state.pendingBanks.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.username || row.user && row.user.username, "member"));
        createCell(tr, `${safeText(row.bankCode)} ${makeMaskedAccount(row.accountNumber)}`);
        createCell(tr, safeText(row.status), statusClass(row.status));
        const actions = document.createElement("td");
        actions.appendChild(makeActionButton("Approve", "approve", function () {
          reviewBankAccount(row.id, "approve");
        }));
        actions.appendChild(makeActionButton("Reject", "reject", function () {
          reviewBankAccount(row.id, "reject");
        }));
        tr.appendChild(actions);
        els.bankRows.appendChild(tr);
      });
    }

    function renderDeposits() {
      renderEmptyState(els.depositRows, els.depositEmpty, state.pendingDeposits);
      state.pendingDeposits.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.transactionId));
        createCell(tr, safeText(row.user && row.user.username, "member"));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, safeText(row.status), statusClass(row.status));
        const actions = document.createElement("td");
        actions.appendChild(makeActionButton("Approve", "approve", function () {
          reviewDeposit(row.id, "approve");
        }));
        actions.appendChild(makeActionButton("Reject", "reject", function () {
          reviewDeposit(row.id, "reject");
        }));
        tr.appendChild(actions);
        els.depositRows.appendChild(tr);
      });
    }

    function renderWithdrawals() {
      renderEmptyState(els.withdrawRows, els.withdrawEmpty, state.pendingWithdrawals);
      state.pendingWithdrawals.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.transactionId));
        createCell(tr, safeText(row.user && row.user.username, "member"));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, safeText(row.status), statusClass(row.status));
        const actions = document.createElement("td");
        actions.appendChild(makeActionButton("Approve", "approve", function () {
          reviewWithdrawal(row.id, "approve");
        }));
        actions.appendChild(makeActionButton("Reject", "reject", function () {
          reviewWithdrawal(row.id, "reject");
        }));
        tr.appendChild(actions);
        els.withdrawRows.appendChild(tr);
      });
    }

    function renderLedger() {
      renderEmptyState(els.ledgerRows, els.ledgerEmpty, state.ledger);
      state.ledger.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.type));
        createCell(tr, formatMoney(row.amount));
        createCell(tr, `${safeText(row.referenceType)} / ${safeText(row.referenceId)}`);
        createCell(tr, safeText(row.createdByType));
        els.ledgerRows.appendChild(tr);
      });
    }

    function renderCodeCampaigns() {
      renderEmptyState(els.codeCampaignRows, els.codeCampaignEmpty, state.codeCampaigns);
      state.codeCampaigns.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.name));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, safeText(row.reward && row.reward.type));
        createCell(tr, safeNumber(row.codeCount, 0));
        createCell(tr, safeNumber(row.redeemedCount, 0));
        els.codeCampaignRows.appendChild(tr);
      });
    }

    function adminPromotionBonusText(row) {
      const type = safeText(row && row.bonusType, "bonus");
      const value = row && row.bonusValue !== undefined ? row.bonusValue : 0;
      return `${type} ${formatMoney(value)}`;
    }

    function adminPromotionWithdrawCondition(row) {
      const minDeposit = row && row.minDeposit !== null && row.minDeposit !== undefined ? `min deposit ${formatMoney(row.minDeposit)}` : "no min deposit";
      const maxBonus = row && row.maxBonus !== null && row.maxBonus !== undefined ? `max bonus ${formatMoney(row.maxBonus)}` : "no max bonus";
      return `${minDeposit}; ${maxBonus}`;
    }

    function renderPromotions() {
      renderEmptyState(els.promotionRows, els.promotionEmpty, state.promotions);
      state.promotions.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, safeText(row.title || row.name || row.id));
        createCell(tr, safeText(row.status), statusClass(row.status));
        createCell(tr, adminPromotionBonusText(row));
        createCell(tr, `${formatMoney(row.turnoverMultiplier)}x`);
        createCell(tr, adminPromotionWithdrawCondition(row));
        els.promotionRows.appendChild(tr);
      });
    }

    function renderCodeRedeemLogs() {
      renderEmptyState(els.codeRedeemRows, els.codeRedeemEmpty, state.codeRedeemLogs);
      state.codeRedeemLogs.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.code));
        createCell(tr, safeText(row.rewardType));
        createCell(tr, safeText(row.memberId));
        createCell(tr, safeText(row.status), statusClass(row.status));
        els.codeRedeemRows.appendChild(tr);
      });
    }

    function renderAudit() {
      renderEmptyState(els.auditRows, els.auditEmpty, state.audit);
      state.audit.forEach(function (row) {
        const tr = document.createElement("tr");
        createCell(tr, formatDate(row.createdAt));
        createCell(tr, safeText(row.action));
        createCell(tr, `${safeText(row.targetType)} / ${safeText(row.targetId)}`);
        createCell(tr, safeText(row.adminUsername || row.actorUsername || row.username, "admin"));
        createCell(tr, safeText(row.note || row.summary || row.message, "-"));
        els.auditRows.appendChild(tr);
      });
    }

    function renderAll() {
      renderSummary();
      renderBankAccounts();
      renderDeposits();
      renderWithdrawals();
      renderLedger();
      renderPromotions();
      renderCodeCampaigns();
      renderCodeRedeemLogs();
      renderAudit();
      setBusy(state.busy);
    }

    function makeActionButton(label, variant, onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = variant;
      button.textContent = label;
      button.disabled = state.busy;
      button.addEventListener("click", function () {
        onClick();
      });
      const wrapper = document.createElement("span");
      wrapper.className = "inline-actions";
      wrapper.appendChild(button);
      return wrapper;
    }

    async function refreshAdminData() {
      if (!state.token) {
        state.summary = null;
        state.promotions = [];
        state.codeCampaigns = [];
        state.codeRedeemLogs = [];
        renderAll();
        if (els.summaryState) {
          els.summaryState.textContent = "Login an admin first to read backend-connected dashboard/report cards.";
        }
        if (els.codeRewardState) {
          els.codeRewardState.textContent = "Login an admin first to read backend-connected code center and reward visibility.";
        }
        if (els.promotionState) {
          els.promotionState.textContent = "Login an admin first to read backend-connected promotion/bonus relationship data.";
        }
        els.statusText.textContent = "Login an admin first. " + ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE;
        return;
      }

      setBusy(true);
      if (els.summaryState) {
        els.summaryState.textContent = `Loading backend-connected dashboard/report cards... ${ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE}`;
      }
      if (els.codeRewardState) {
        els.codeRewardState.textContent = `Loading backend-connected code center and reward visibility... ${ADMIN_CODE_REWARD_ROUTE_NOTE}`;
      }
      if (els.promotionState) {
        els.promotionState.textContent = `Loading backend-connected promotion/bonus relationship data... ${PROMOTION_BONUS_ROUTE_NOTE}`;
      }
      els.statusText.textContent = `Refreshing admin finance queues... ${ADMIN_FINANCE_CONNECTED_ROUTE_NOTE}`;
      try {
        const [summary, pendingBanks, pendingDeposits, pendingWithdrawals, ledger, promotions, codeCampaigns, codeRedeemLogs, audit] = await Promise.all([
          apiRequest("/admin/reports/summary", { token: state.token }),
          apiRequest("/admin/bank-accounts/pending", { token: state.token }),
          apiRequest("/admin/deposits?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/withdrawals?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/reports/wallet-ledger?limit=20", { token: state.token }),
          apiRequest("/promotions", { token: state.token }),
          apiRequest("/admin/code-center/campaigns", { token: state.token }),
          apiRequest("/admin/code-center/redeem-logs?limit=50", { token: state.token }),
          apiRequest("/admin/logs?limit=20", { token: state.token }),
        ]);

        state.summary = summary && typeof summary === "object" ? summary : null;
        state.pendingBanks = Array.isArray(pendingBanks) ? pendingBanks : [];
        state.pendingDeposits = Array.isArray(pendingDeposits) ? pendingDeposits : [];
        state.pendingWithdrawals = Array.isArray(pendingWithdrawals) ? pendingWithdrawals : [];
        state.ledger = Array.isArray(ledger) ? ledger : [];
        state.promotions = Array.isArray(promotions) ? promotions : [];
        state.codeCampaigns = Array.isArray(codeCampaigns && codeCampaigns.campaigns) ? codeCampaigns.campaigns : [];
        state.codeRedeemLogs = Array.isArray(codeRedeemLogs && codeRedeemLogs.redeemLogs) ? codeRedeemLogs.redeemLogs : [];
        state.audit = Array.isArray(audit) ? audit : [];
        renderAll();
        if (els.summaryState) {
          els.summaryState.textContent = `Dashboard/report cards refreshed. ${ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE}`;
        }
        if (els.codeRewardState) {
          els.codeRewardState.textContent = `Code center and reward visibility refreshed. ${ADMIN_CODE_REWARD_ROUTE_NOTE}`;
        }
        if (els.promotionState) {
          els.promotionState.textContent = `Promotion/bonus relationship data refreshed. ${PROMOTION_BONUS_ROUTE_NOTE}`;
        }
        els.statusText.textContent = `Admin finance queues refreshed. ${ADMIN_FINANCE_CONNECTED_ROUTE_NOTE}`;
      } catch (error) {
        state.summary = null;
        state.promotions = [];
        state.codeCampaigns = [];
        state.codeRedeemLogs = [];
        renderAll();
        if (els.summaryState) {
          els.summaryState.textContent = `${safeText(error.message, "Dashboard/report refresh failed.")} ${ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE}`;
        }
        if (els.codeRewardState) {
          els.codeRewardState.textContent = `${safeText(error.message, "Code center visibility refresh failed.")} ${ADMIN_CODE_REWARD_ROUTE_NOTE}`;
        }
        if (els.promotionState) {
          els.promotionState.textContent = `${safeText(error.message, "Promotion/bonus visibility refresh failed.")} ${PROMOTION_BONUS_ROUTE_NOTE}`;
        }
        els.statusText.textContent = `${safeText(error.message, "Admin finance refresh failed.")} ${ADMIN_FINANCE_CONNECTED_ROUTE_NOTE}`;
      } finally {
        setBusy(false);
      }
    }

    async function loginAdmin() {
      const session = adminSessionFromInputs();
      setBusy(true);
      els.statusText.textContent = "Logging in local admin...";
      try {
        const data = await apiRequest("/admin/auth/login", {
          method: "POST",
          body: {
            username: session.username,
            password: session.password,
          },
        });
        state.token = data.token || null;
        writeSavedAdmin(session);
        await refreshAdminData();
        els.statusText.textContent = `Local admin login successful. ${ADMIN_FINANCE_CONNECTED_ROUTE_NOTE}`;
      } catch (error) {
        els.statusText.textContent = safeText(error.message, "Local admin login failed.");
      } finally {
        setBusy(false);
      }
    }

    function clearAdminSession() {
      state.token = null;
      state.summary = null;
      state.pendingBanks = [];
      state.pendingDeposits = [];
      state.pendingWithdrawals = [];
      state.ledger = [];
      state.promotions = [];
      state.codeCampaigns = [];
      state.codeRedeemLogs = [];
      state.audit = [];
      clearSavedAdmin();
      els.username.value = DEFAULT_ADMIN_USERNAME;
      els.password.value = DEFAULT_ADMIN_PASSWORD;
      renderAll();
      if (els.summaryState) {
        els.summaryState.textContent = "Local admin session cleared. Dashboard/report cards are read-only and local-safe.";
      }
      if (els.codeRewardState) {
        els.codeRewardState.textContent = "Local admin session cleared. Code center and reward visibility stay read-only and local-safe.";
      }
      if (els.promotionState) {
        els.promotionState.textContent = "Local admin session cleared. Promotion/bonus bridge stays read-only and local-safe.";
      }
      els.statusText.textContent = `Local admin session cleared. ${ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE}`;
    }

    async function reviewBankAccount(id, action) {
      const reason = promptReason(`${action} bank account`);
      if (!reason) {
        els.statusText.textContent = "Reason is required for bank account review.";
        return;
      }
      setBusy(true);
      els.statusText.textContent = `${safeText(action)} bank account...`;
      try {
        await apiRequest(`/admin/bank-accounts/${encodeURIComponent(id)}/${action}`, {
          method: "POST",
          token: state.token,
          body: { reason: reason },
        });
        await refreshAdminData();
        els.statusText.textContent = `Bank account ${safeText(action)}d. Local-safe review only.`;
      } catch (error) {
        els.statusText.textContent = safeText(error.message, `Bank account ${action} failed.`);
      } finally {
        setBusy(false);
      }
    }

    async function reviewDeposit(id, action) {
      setBusy(true);
      els.statusText.textContent = `${safeText(action)} deposit...`;
      try {
        const body =
          action === "approve"
            ? { note: promptOptionalNote("Approve deposit") || "approved from admin money demo" }
            : { reject_reason: promptReason("Reject deposit") };
        if (action === "reject" && !body.reject_reason) {
          els.statusText.textContent = "Reject reason is required.";
          return;
        }
        await apiRequest(`/admin/deposits/${encodeURIComponent(id)}/${action}`, {
          method: "POST",
          token: state.token,
          body: body,
        });
        await refreshAdminData();
        els.statusText.textContent = `Deposit ${safeText(action)}d. Local-safe review only.`;
      } catch (error) {
        els.statusText.textContent = safeText(error.message, `Deposit ${action} failed.`);
      } finally {
        setBusy(false);
      }
    }

    async function reviewWithdrawal(id, action) {
      setBusy(true);
      els.statusText.textContent = `${safeText(action)} withdrawal...`;
      try {
        const body =
          action === "approve"
            ? { note: promptOptionalNote("Approve withdrawal") || "approved from admin money demo" }
            : { reject_reason: promptReason("Reject withdrawal") };
        if (action === "reject" && !body.reject_reason) {
          els.statusText.textContent = "Reject reason is required.";
          return;
        }
        await apiRequest(`/admin/withdrawals/${encodeURIComponent(id)}/${action}`, {
          method: "POST",
          token: state.token,
          body: body,
        });
        await refreshAdminData();
        els.statusText.textContent = `Withdrawal ${safeText(action)}d. Local-safe review only.`;
      } catch (error) {
        els.statusText.textContent = safeText(error.message, `Withdrawal ${action} failed.`);
      } finally {
        setBusy(false);
      }
    }

    const savedAdmin = readSavedAdmin();
    if (savedAdmin) {
      els.username.value = safeText(savedAdmin.username, DEFAULT_ADMIN_USERNAME);
      els.password.value = safeText(savedAdmin.password, DEFAULT_ADMIN_PASSWORD);
    } else {
      els.username.value = DEFAULT_ADMIN_USERNAME;
      els.password.value = DEFAULT_ADMIN_PASSWORD;
    }

    els.login.addEventListener("click", function () {
      loginAdmin().catch(function () {});
    });
    els.refresh.addEventListener("click", function () {
      refreshAdminData().catch(function () {});
    });
    els.clear.addEventListener("click", clearAdminSession);

    renderAll();
    if (els.summaryState) {
      els.summaryState.textContent = "Load a local-safe admin to read backend-connected dashboard/report summary cards.";
    }
    if (els.codeRewardState) {
      els.codeRewardState.textContent = "Load a local-safe admin to read backend-connected code center and reward visibility.";
    }
    if (els.promotionState) {
      els.promotionState.textContent = "Load a local-safe admin to read promotion/bonus relationship data.";
    }
    els.statusText.textContent =
      "Login with a local-safe admin to review pending finance requests. " + ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE;
  }

  if (page === "member") {
    initMemberPage();
  } else if (page === "admin") {
    initAdminPage();
  }
})();
