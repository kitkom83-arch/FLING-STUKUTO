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
  const PROMOTION_ADMIN_DRY_RUN_FINAL_READINESS_NOTE =
    "promotion admin dry-run final readiness is final readiness record only, ready for separate runtime decision, runtime not approved in phase 41, separate runtime implementation phase required, route not mounted, runtime not enabled, can request runtime implementation false, can mount route false, can enable runtime false, write locked, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, and no production deploy.";
  const PROMOTION_ADMIN_DRY_RUN_RUNTIME_DECISION_NOTE =
    "promotion admin dry-run runtime decision is runtime decision record only, runtime decision gate, hold runtime, request staging-only runtime phase, request separate runtime implementation phase, reject runtime for now, runtime not enabled in phase 42, separate runtime phase required, route not mounted, runtime not enabled, can enable staging runtime false, can enable production runtime false, can mount route false, can enable runtime false, write locked, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, and no production deploy.";
  const PROMOTION_ADMIN_DRY_RUN_STAGING_ROUTE_MOUNT_NOTE =
    "promotion admin dry-run staging route mount is staging/local-safe dry-run only, POST /api/admin/promotions/:id/dry-run, route mounted for dry-run only, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, no production deploy, write locked, and production disabled.";
  const PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE =
    "promotion admin dry-run UI action wiring uses POST /api/admin/promotions/:id/dry-run through the existing admin auth flow only, dry-run only, validate-only, write locked, Dry-run เท่านั้น, ไม่มีการบันทึกจริง, ไม่แตะ wallet/claim/ledger/provider, no DB write, no wallet write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no provider outbound, no production live mode, no production deploy, and fail-closed on error.";
  const PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE =
    "ยังไม่ยิง API เพราะตรวจหน้า form ไม่ผ่าน";
  const PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_RISKY_FIELDS = [
    "bonusValue",
    "turnoverMultiplier",
    "maxWithdraw",
    "minDeposit",
    "maxDeposit",
    "status",
  ];
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
    "Backend-connected promotion/bonus visibility uses GET /api/promotions plus read-only ledger/report relationship markers; POST /api/promotions/:id/claim is on promotion claim guard, local-safe preflight only, guarded hold, and fail-closed because it can create promotion_bonus ledger rows and turnover requirements.";
  const ADMIN_PROMOTION_CONFIG_ROUTE_NOTE =
    "Admin promotion config visibility uses GET /api/admin/promotions as backend-connected read-only/local-safe PARTIAL surface; permission guarded route guard evidence requires adminAuth, siteAccess, and settings.promotion.view; audit boundary, create/update/delete promotion actions, runtime credit action, and claim execution stay disabled/guarded hold.";
  const ADMIN_PROMOTION_WRITE_READINESS_NOTE =
    "Promotion admin write readiness is write locked and local-safe preflight only: future settings.promotion.write or settings.promotion.manage permission, audit reason required, before/after diff required, status transition guard, bonus/turnover risk acknowledgement, local-safe dry-run before runtime, no runtime credit action, and claim guarded hold.";
  const ADMIN_PROMOTION_WRITE_VALIDATOR_NOTE =
    "Promotion admin write validator is a pure validator, validate-only, write locked, no DB write, no runtime credit action, no ledger creation, and no turnover creation.";
  const ADMIN_PROMOTION_DRY_RUN_API_CONTRACT_NOTE =
    "Promotion admin dry-run API contract is contract-only, not mounted, validate-only, write locked, and no DB write.";
  const ADMIN_PROMOTION_DRY_RUN_API_STUB_NOTE =
    "Promotion admin dry-run API stub is a pure stub, contract-only, not mounted, validate-only, no DB write, no runtime credit action, no ledger creation, no turnover creation, and write locked.";
  const ADMIN_PROMOTION_DRY_RUN_UI_PREVIEW_NOTE =
    "Promotion admin dry-run UI preview is ui preview only, no API call, not mounted, validate-only, write locked, no DB write, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_ROUTE_READINESS_NOTE =
    "Promotion admin dry-run route readiness is readiness only, not mounted, no Express mount, no API call, validate-only, write locked, no DB write, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_CONTROLLER_READINESS_NOTE =
    "promotion admin dry-run controller readiness is controller readiness only, runtime handler not enabled, controller not mounted, no Express mount, no API call, not mounted, validate-only, write locked, no DB write, no promotion update, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_SERVICE_READINESS_NOTE =
    "promotion admin dry-run service readiness is service readiness only, service runtime not enabled, service not mounted, controller not mounted, no Express mount, no API call, not mounted, validate-only, write locked, no DB write, no promotion update, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_AUDIT_LEDGER_READINESS_NOTE =
    "promotion admin dry-run audit ledger readiness is audit ledger readiness only, audit mode plan only, ledger mode plan only, audit runtime not enabled, ledger runtime not enabled, audit row not created, ledger not created, turnover requirement not created, service not mounted, controller not mounted, no Express mount, no API call, not mounted, validate-only, write locked, no DB write, no promotion update, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_NOTE =
    "promotion admin dry-run runtime preflight is runtime preflight readiness only, not mounted, read-only/readiness-only, validate-only, write locked, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, and no production deploy.";
  const ADMIN_PROMOTION_DRY_RUN_MOUNT_AUTHORIZATION_NOTE =
    "promotion admin dry-run mount authorization is mount authorization gate only, mount not granted, mount denied by default, route not mounted, runtime not enabled, can mount route false, can enable runtime false, controller runtime not enabled, service runtime not enabled, audit runtime not enabled, ledger runtime not enabled, DB write not enabled, provider outbound not enabled, production deploy not enabled, no DB write, no promotion update, no runtime credit action, no ledger creation, no turnover creation, and no claim execution.";
  const ADMIN_PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOTE =
    "promotion admin dry-run enablement runbook is readiness only, runtime not enabled, mount not granted, mount denied by default, approval checklist required, rollback plan required, monitoring plan required, staging UAT required, production window approval required, can mount route false, can enable runtime false, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, and no production deploy.";
  const ADMIN_PROMOTION_DRY_RUN_HOUSEKEEPING_NOTE =
    "promotion admin dry-run housekeeping is housekeeping only, no runtime behavior change, route not mounted, runtime not enabled, write locked, no DB write, no promotion update, no audit row creation, no ledger creation, no turnover creation, no claim execution, no runtime credit action, no provider outbound, no production deploy, and no live provider/payment/bank/SMS/slip OCR marker.";
  const PROMOTION_ADMIN_WRITE_DRY_RUN_CONTRACT = {
    phase: "BACKOFFICE-PROMOTION-ADMIN-WRITE-DRY-RUN-28",
    mode: "promotion admin write dry-run validate-only no DB write no runtime credit action no ledger creation no turnover creation dry-run before runtime write locked future permission boundary",
    payloadShape: {
      title: "string",
      type: "string",
      status: "string",
      minDeposit: "non-negative number",
      maxDeposit: "non-negative number",
      bonusType: "string",
      bonusValue: "non-negative number",
      turnoverMultiplier: "non-negative number",
      maxWithdraw: "non-negative number",
      startAt: "date",
      endAt: "date",
      auditReason: "required string",
      riskAcknowledgement: "required when bonus/turnover/maxWithdraw changes",
    },
    validationRules: {
      auditReason: "audit reason required",
      diff: "before/after diff required",
      riskAcknowledgement: "risk acknowledgement required when bonus/turnover/maxWithdraw changes",
      status: "status transition must be explicit",
      numeric: "numeric fields must be non-negative",
      dateWindow: "startAt <= endAt when both set",
      claim: "no claim execution",
      ledger: "no ledger creation",
      turnover: "no turnover creation",
    },
  };

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

        return config.returnPayload ? payload : payload.data;
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

    function createPromotionClaimGuardCell(tr) {
      const td = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = true;
      button.className = "secondary";
      button.textContent = "Claim locked";
      button.setAttribute("aria-label", "Promotion claim action locked on guarded hold");
      td.appendChild(button);
      const note = document.createElement("p");
      note.className = "status-note";
      note.textContent = "local-safe preflight only";
      td.appendChild(note);
      tr.appendChild(td);
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
        createCell(tr, "guarded_hold_fail_closed", "status-pending");
        createPromotionClaimGuardCell(tr);
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
      promotionDryRunState: document.getElementById("admin-promotion-dry-run-state"),
      promotionDryRunRouteMounted: document.getElementById("admin-promotion-dry-run-route-mounted"),
      promotionDryRunApiEnabled: document.getElementById("admin-promotion-dry-run-api-enabled"),
      promotionDryRunOnly: document.getElementById("admin-promotion-dry-run-only"),
      promotionDryRunValidateOnly: document.getElementById("admin-promotion-dry-run-validate-only"),
      promotionDryRunWriteLocked: document.getElementById("admin-promotion-dry-run-write-locked"),
      promotionDryRunDbWriteEnabled: document.getElementById("admin-promotion-dry-run-db-write-enabled"),
      promotionDryRunWalletWriteEnabled: document.getElementById("admin-promotion-dry-run-wallet-write-enabled"),
      promotionDryRunPromotionUpdateEnabled: document.getElementById("admin-promotion-dry-run-promotion-update-enabled"),
      promotionDryRunAuditWriteEnabled: document.getElementById("admin-promotion-dry-run-audit-write-enabled"),
      promotionDryRunLedgerWriteEnabled: document.getElementById("admin-promotion-dry-run-ledger-write-enabled"),
      promotionDryRunTurnoverEnabled: document.getElementById("admin-promotion-dry-run-turnover-enabled"),
      promotionDryRunClaimEnabled: document.getElementById("admin-promotion-dry-run-claim-enabled"),
      promotionDryRunProviderEnabled: document.getElementById("admin-promotion-dry-run-provider-enabled"),
      promotionDryRunProductionLiveEnabled: document.getElementById("admin-promotion-dry-run-production-live-enabled"),
      promotionDryRunProductionDeployEnabled: document.getElementById("admin-promotion-dry-run-production-deploy-enabled"),
      promotionDryRunSafetyMessage: document.getElementById("admin-promotion-dry-run-safety-message"),
      promotionDryRunSelected: document.getElementById("admin-promotion-dry-run-selected"),
      promotionDryRunValidator: document.getElementById("admin-promotion-dry-run-validator"),
      promotionDryRunResultCode: document.getElementById("admin-promotion-dry-run-result-code"),
      promotionDryRunResultRows: document.getElementById("admin-promotion-dry-run-result-rows"),
      promotionDryRunPromotionIdInput: document.getElementById("admin-promotion-dry-run-promotion-id"),
      promotionDryRunTitleInput: document.getElementById("admin-promotion-dry-run-title"),
      promotionDryRunTypeInput: document.getElementById("admin-promotion-dry-run-type"),
      promotionDryRunStatusInput: document.getElementById("admin-promotion-dry-run-status"),
      promotionDryRunMinDepositInput: document.getElementById("admin-promotion-dry-run-min-deposit"),
      promotionDryRunMaxDepositInput: document.getElementById("admin-promotion-dry-run-max-deposit"),
      promotionDryRunBonusTypeInput: document.getElementById("admin-promotion-dry-run-bonus-type"),
      promotionDryRunBonusValueInput: document.getElementById("admin-promotion-dry-run-bonus-value"),
      promotionDryRunTurnoverMultiplierInput: document.getElementById("admin-promotion-dry-run-turnover-multiplier"),
      promotionDryRunMaxWithdrawInput: document.getElementById("admin-promotion-dry-run-max-withdraw"),
      promotionDryRunStartAtInput: document.getElementById("admin-promotion-dry-run-start-at"),
      promotionDryRunEndAtInput: document.getElementById("admin-promotion-dry-run-end-at"),
      promotionDryRunAuditReasonInput: document.getElementById("admin-promotion-dry-run-audit-reason"),
      promotionDryRunAcknowledgementInput: document.getElementById("admin-promotion-dry-run-acknowledgement"),
      promotionDryRunSubmit: document.getElementById("admin-promotion-dry-run-submit"),
      promotionDryRunValidationStatus: document.getElementById("admin-promotion-dry-run-validation-status"),
      promotionDryRunValidationErrors: document.getElementById("admin-promotion-dry-run-validation-errors"),
      promotionDryRunDiffPreview: document.getElementById("admin-promotion-dry-run-diff-preview"),
      promotionDryRunWarningNotes: document.getElementById("admin-promotion-dry-run-warning-notes"),
      promotionDryRunPreflightStatus: document.getElementById("admin-promotion-dry-run-preflight-status"),
      promotionDryRunPreflightApiBlocked: document.getElementById("admin-promotion-dry-run-preflight-api-blocked"),
      promotionDryRunPreflightSelectedMatch: document.getElementById("admin-promotion-dry-run-preflight-selected-match"),
      promotionDryRunPreflightState: document.getElementById("admin-promotion-dry-run-preflight-state"),
      promotionDryRunPreflightErrors: document.getElementById("admin-promotion-dry-run-preflight-errors"),
      promotionDryRunPreflightRiskyFields: document.getElementById("admin-promotion-dry-run-preflight-risky-fields"),
      promotionDryRunReviewPacketState: document.getElementById("admin-promotion-dry-run-review-packet-state"),
      promotionDryRunReviewPacketFreshnessState: document.getElementById("admin-promotion-dry-run-review-packet-freshness-state"),
      promotionDryRunReviewPacketStatus: document.getElementById("admin-promotion-dry-run-review-packet-status"),
      promotionDryRunReviewPacketPromotionId: document.getElementById("admin-promotion-dry-run-review-packet-promotion-id"),
      promotionDryRunReviewPacketGeneratedAt: document.getElementById("admin-promotion-dry-run-review-packet-generated-at"),
      promotionDryRunReviewPacketSafety: document.getElementById("admin-promotion-dry-run-review-packet-safety"),
      promotionDryRunReviewPacketFreshness: document.getElementById("admin-promotion-dry-run-review-packet-freshness"),
      promotionDryRunReviewPacketChangedFields: document.getElementById("admin-promotion-dry-run-review-packet-changed-fields"),
      promotionDryRunReviewPacketUnchangedFields: document.getElementById("admin-promotion-dry-run-review-packet-unchanged-fields"),
      promotionDryRunReviewPacketRiskyFields: document.getElementById("admin-promotion-dry-run-review-packet-risky-fields"),
      promotionDryRunReviewPacketValidationSummary: document.getElementById("admin-promotion-dry-run-review-packet-validation-summary"),
      promotionDryRunReviewPacketWarningSummary: document.getElementById("admin-promotion-dry-run-review-packet-warning-summary"),
      promotionDryRunReviewPacketSafetySummary: document.getElementById("admin-promotion-dry-run-review-packet-safety-summary"),
      promotionDryRunReviewPacketCopy: document.getElementById("admin-promotion-dry-run-review-packet-copy"),
      promotionDryRunReviewPacketExport: document.getElementById("admin-promotion-dry-run-review-packet-export"),
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
      promotionDryRunResult: null,
      promotionDryRunError: null,
      promotionDryRunLastDryRunPayloadSnapshot: null,
      promotionDryRunPromotionId: null,
      promotionDryRunPromotionLabel: "",
      promotionDryRunPromotionRow: null,
      promotionDryRunReviewPacketFreshness: "fail-closed",
      codeCampaigns: [],
      codeRedeemLogs: [],
      audit: [],
    };

    function setBusy(nextBusy) {
      state.busy = nextBusy;
      [els.login, els.refresh, els.clear, els.promotionDryRunSubmit, els.promotionDryRunReviewPacketCopy].forEach(function (button) {
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
      setStatus(els.promotionCrudStatus, "partial_read_only");
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

    function createListText(value, fallback) {
      if (!Array.isArray(value) || value.length === 0) return fallback;
      return value
        .map(function (item) {
          if (item === null || item === undefined || item === "") return null;
          if (typeof item === "string") return item;
          if (typeof item === "object") {
            const field = safeText(item.field || item.key || item.type, "");
            const before = safeText(item.before, "");
            const after = safeText(item.after, "");
            if (field && (before || after)) return `${field}: ${before} -> ${after}`;
            if (field) return field;
          }
          return safeText(item, "");
        })
        .filter(Boolean)
        .join(", ");
    }

    function riskSummaryText(riskSummary) {
      const summary = riskSummary && typeof riskSummary === "object" ? riskSummary : null;
      if (!summary) return "-";
      const labels = [
        ["hasBonusRisk", "bonus"],
        ["hasTurnoverRisk", "turnover"],
        ["hasWithdrawRisk", "withdraw"],
        ["hasEligibilityRisk", "eligibility"],
        ["hasStatusRisk", "status"],
      ]
        .filter(function (entry) {
          return summary[entry[0]] === true;
        })
        .map(function (entry) {
          return entry[1];
        });
      return labels.length ? labels.join(", ") : "none";
    }

    function promotionDryRunPacketClone(value) {
      if (!value || typeof value !== "object") return value || null;
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (_error) {
        return null;
      }
    }

    function promotionDryRunPayloadSnapshot(form) {
      const source = form && typeof form === "object" ? form : readPromotionDryRunForm();
      return promotionDryRunPacketClone({
        promotionId: source.promotionId || null,
        before: source.before,
        after: source.after,
        auditReason: source.auditReason,
        riskAcknowledgement: source.riskAcknowledgement,
      });
    }

    function promotionDryRunPayloadSnapshotsMatch(left, right) {
      return JSON.stringify(left || null) === JSON.stringify(right || null);
    }

    function promotionDryRunReviewPacketFreshness(form) {
      const snapshot = promotionDryRunPayloadSnapshot(form);
      const lastSnapshot = state.promotionDryRunLastDryRunPayloadSnapshot;
      if (!lastSnapshot) {
        return {
          snapshot: snapshot,
          freshness: "fail-closed",
          isStale: false,
          matchesLastSnapshot: false,
        };
      }

      const matchesLastSnapshot = promotionDryRunPayloadSnapshotsMatch(snapshot, lastSnapshot);
      return {
        snapshot: snapshot,
        freshness: matchesLastSnapshot ? "fresh" : "stale",
        isStale: !matchesLastSnapshot,
        matchesLastSnapshot: matchesLastSnapshot,
      };
    }

    function promotionDryRunFieldChanges(beforeRow, afterRow) {
      const before = promotionDryRunRowDraft(beforeRow);
      const after = promotionDryRunRowDraft(afterRow);
      return [
        ["title", before.title, after.title],
        ["type", before.type, after.type],
        ["status", before.status, after.status],
        ["minDeposit", before.minDeposit, after.minDeposit],
        ["maxDeposit", before.maxDeposit, after.maxDeposit],
        ["bonusType", before.bonusType, after.bonusType],
        ["bonusValue", before.bonusValue, after.bonusValue],
        ["turnoverMultiplier", before.turnoverMultiplier, after.turnoverMultiplier],
        ["maxWithdraw", before.maxWithdraw, after.maxWithdraw],
        ["startAt", before.startAt, after.startAt],
        ["endAt", before.endAt, after.endAt],
      ].map(function (entry) {
        return {
          field: entry[0],
          before: entry[1],
          after: entry[2],
          changed: entry[1] !== entry[2],
        };
      });
    }

    function promotionDryRunRiskyFields(changedFields, riskSummary) {
      const risky = new Set();
      changedFields.forEach(function (field) {
        if (/bonus|turnover|maxWithdraw|minDeposit|maxDeposit|status/i.test(field)) {
          risky.add(field);
        }
      });
      const summary = riskSummary && typeof riskSummary === "object" ? riskSummary : null;
      if (summary) {
        if (summary.hasBonusRisk) risky.add("bonus");
        if (summary.hasTurnoverRisk) risky.add("turnover");
        if (summary.hasWithdrawRisk) risky.add("maxWithdraw");
        if (summary.hasEligibilityRisk) risky.add("eligibility");
        if (summary.hasStatusRisk) risky.add("status");
      }
      return Array.from(risky);
    }

    function promotionDryRunSafetyFlags(source) {
      const flags = source && typeof source === "object" ? source : {};
      return {
        dryRunOnly: flags.dryRunOnly !== false,
        validateOnly: flags.validateOnly !== false,
        writeLocked: flags.writeLocked !== false,
        routeMounted: flags.routeMounted === true,
        apiCallEnabled: flags.apiCallEnabled === true,
        dbWriteEnabled: flags.dbWriteEnabled === true,
        walletWriteEnabled: flags.walletWriteEnabled === true,
        promotionUpdateEnabled: flags.promotionUpdateEnabled === true,
        auditWriteEnabled: flags.auditWriteEnabled === true,
        ledgerWriteEnabled: flags.ledgerWriteEnabled === true,
        turnoverCreationEnabled: flags.turnoverCreationEnabled === true,
        claimExecutionEnabled: flags.claimExecutionEnabled === true,
        providerOutboundEnabled: flags.providerOutboundEnabled === true,
        productionLiveEnabled: flags.productionLiveEnabled === true,
        productionDeployEnabled: flags.productionDeployEnabled === true,
      };
    }

    function promotionDryRunLocalTimestamp() {
      return new Date().toLocaleString();
    }

    function promotionDryRunPacketPayload(form) {
      return promotionDryRunPacketClone({
        before: form.before,
        after: form.after,
        auditReason: form.auditReason,
        riskAcknowledgement: form.riskAcknowledgement,
      });
    }

    function promotionDryRunPacketBase(form, selectedRow, source) {
      const fieldChanges = promotionDryRunFieldChanges(form.before, form.after);
      const changedFields = fieldChanges.filter(function (item) {
        return item.changed;
      });
      const unchangedFields = fieldChanges
        .filter(function (item) {
          return !item.changed;
        })
        .map(function (item) {
          return item.field;
        });
      const riskSummary = source && source.riskSummary ? source.riskSummary : null;

      return {
        promotionId: form.promotionId || state.promotionDryRunPromotionId || null,
        originalSnapshot: promotionDryRunPacketClone(selectedRow),
        formPayload: promotionDryRunPacketPayload(form),
        beforeAfterDiff: source && Array.isArray(source.diff) ? promotionDryRunPacketClone(source.diff) : changedFields,
        changedFields: changedFields,
        unchangedFields: unchangedFields,
        riskyFields: promotionDryRunRiskyFields(
          changedFields.map(function (item) {
            return item.field;
          }),
          riskSummary
        ),
        auditReason: form.auditReason,
        riskAcknowledgement: form.riskAcknowledgement,
        validationErrors: source && Array.isArray(source.errors) ? source.errors.slice() : form.errors.slice(),
        warningNotes: source && Array.isArray(source.warnings) ? source.warnings.slice() : [],
        safetyFlags: promotionDryRunSafetyFlags(source),
        safetyConfirmation:
          "dry-run only, local-only review packet, no DB write, no promotion update, no audit row, no ledger, no turnover, no claim, no wallet mutation, no provider outbound, no production deploy",
        generatedAt: promotionDryRunLocalTimestamp(),
      };
    }

    function buildPromotionDryRunReviewPacket() {
      const result = state.promotionDryRunResult && typeof state.promotionDryRunResult === "object" ? state.promotionDryRunResult : null;
      const error = state.promotionDryRunError && typeof state.promotionDryRunError === "object" ? state.promotionDryRunError : null;
      const source = result || error;
      const form = readPromotionDryRunForm();
      const selectedRow = form.promotionRow || state.promotionDryRunPromotionRow || null;
      const freshness = promotionDryRunReviewPacketFreshness(form);
      const base = promotionDryRunPacketBase(form, selectedRow, source);

      if (!selectedRow) {
        return Object.assign(base, {
          status: "fail-closed",
          reason: "no_selected_promotion",
          freshness: freshness.freshness,
          isStale: freshness.isStale,
          validationStatus: "fail-closed",
          validationErrors: base.validationErrors.length ? base.validationErrors : ["promotionId must reference a loaded promotion row"],
          warningNotes: ["Review packet blocked until a promotion row is selected."],
        });
      }

      if (freshness.isStale) {
        return Object.assign(base, {
          status: "fail-closed",
          reason: "stale_review_packet",
          freshness: "stale",
          isStale: true,
          validationStatus: "fail-closed",
          validationErrors: ["Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export."].concat(base.validationErrors),
          warningNotes: ["Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export."],
        });
      }

      if (!source) {
        return Object.assign(base, {
          status: "fail-closed",
          reason: "dry_run_required",
          freshness: freshness.freshness,
          isStale: freshness.isStale,
          validationStatus: "fail-closed",
          validationErrors: ["dry-run response is required before a success review packet can be generated"].concat(form.errors),
          warningNotes: ["Complete dry-run before reviewing a packet."],
        });
      }

      if (error && error.code === "PROMOTION_DRY_RUN_CLIENT_PREFLIGHT_FAILED") {
        return Object.assign(base, {
          status: "fail-closed",
          reason: "client_preflight_failed",
          freshness: freshness.freshness,
          isStale: freshness.isStale,
          validationStatus: "fail-closed",
          validationErrors: Array.isArray(error.errors) && error.errors.length ? error.errors.slice() : base.validationErrors,
          warningNotes: [PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE],
        });
      }

      const validationStatus = result ? "validated" : "fail-closed";

      return Object.assign(base, {
        status: result ? "ready_for_review" : "fail-closed",
        reason: result ? "dry_run_completed" : "dry_run_failed",
        freshness: freshness.freshness,
        isStale: freshness.isStale,
        validationStatus: validationStatus,
      });
    }

    function renderPromotionDryRunReviewPacket() {
      const packet = buildPromotionDryRunReviewPacket();
      const changedFields = Array.isArray(packet.changedFields)
        ? packet.changedFields.map(function (item) {
            return item && item.field ? `${item.field}: ${safeText(item.before, "-")} -> ${safeText(item.after, "-")}` : safeText(item, "");
          }).filter(Boolean)
        : [];
      const unchangedFields = Array.isArray(packet.unchangedFields) ? packet.unchangedFields : [];
      const riskyFields = Array.isArray(packet.riskyFields) ? packet.riskyFields : [];
      const validationErrors = Array.isArray(packet.validationErrors) ? packet.validationErrors : [];
      const warningNotes = Array.isArray(packet.warningNotes) ? packet.warningNotes : [];

      setStatus(els.promotionDryRunReviewPacketStatus, packet.status);
      setStatus(els.promotionDryRunReviewPacketPromotionId, packet.promotionId || "-");
      setStatus(els.promotionDryRunReviewPacketGeneratedAt, packet.generatedAt || "-");
      setStatus(els.promotionDryRunReviewPacketSafety, "dry_run_only_local_only");
      setStatus(els.promotionDryRunReviewPacketChangedFields, changedFields.length ? changedFields.join(" | ") : "no changed fields");
      setStatus(els.promotionDryRunReviewPacketUnchangedFields, unchangedFields.length ? unchangedFields.join(", ") : "-");
      setStatus(els.promotionDryRunReviewPacketRiskyFields, riskyFields.length ? riskyFields.join(", ") : "none");
      setStatus(
        els.promotionDryRunReviewPacketValidationSummary,
        `${safeText(packet.validationStatus, "fail-closed")} | ${validationErrors.length ? validationErrors.join(", ") : "no validation errors"}`
      );
      setStatus(els.promotionDryRunReviewPacketWarningSummary, warningNotes.length ? warningNotes.join(", ") : "no warnings");
      setStatus(els.promotionDryRunReviewPacketSafetySummary, packet.safetyConfirmation || "Dry-run only. No write path is available.");
      setStatus(els.promotionDryRunReviewPacketFreshness, safeText(packet.freshness || (packet.status === "ready_for_review" ? "fresh" : "fail-closed"), "fail-closed"));
      if (els.promotionDryRunReviewPacketState) {
        els.promotionDryRunReviewPacketState.textContent =
          packet.status === "ready_for_review" && packet.freshness === "fresh"
            ? "Review packet generated from selected snapshot, form payload, and dry-run response. Local-only copy/export is available."
            : packet.freshness === "stale"
              ? "Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export."
            : `${safeText(packet.reason, "fail-closed")} - review packet remains fail-closed until selection and dry-run are complete.`;
      }
      if (els.promotionDryRunReviewPacketFreshnessState) {
        els.promotionDryRunReviewPacketFreshnessState.textContent =
          packet.freshness === "fresh"
            ? "Packet freshness is fresh because the current form still matches the last successful dry-run snapshot."
            : packet.freshness === "stale"
              ? "Packet freshness is stale because the current form no longer matches the last successful dry-run snapshot."
              : "Packet freshness is fail-closed until a dry-run succeeds.";
      }
      if (els.promotionDryRunReviewPacketExport) {
        els.promotionDryRunReviewPacketExport.value = JSON.stringify(packet, null, 2);
      }
      if (els.promotionDryRunReviewPacketCopy) {
        els.promotionDryRunReviewPacketCopy.disabled = state.busy;
      }
      return packet;
    }

    function renderPromotionDryRunResult() {
      const result = state.promotionDryRunResult && typeof state.promotionDryRunResult === "object" ? state.promotionDryRunResult : null;
      const error = state.promotionDryRunError && typeof state.promotionDryRunError === "object" ? state.promotionDryRunError : null;
      const selectedRow = state.promotionDryRunPromotionRow || null;
      const selectedLabel = selectedRow ? promotionDryRunFieldSummary(selectedRow) : state.promotionDryRunPromotionLabel || "-";
      const previewForm = readPromotionDryRunForm();
      const preflight = buildPromotionDryRunClientPreflight(previewForm);
      const source = result || error;
      const previewDiff = source && Array.isArray(source.diff) && source.diff.length
        ? createListText(source.diff, "no diff")
        : previewForm
          ? previewForm.diffPreview
          : promotionDryRunPreviewText(previewForm);
      const previewWarnings = source
        ? createListText(source.warnings, "no warnings")
        : !preflight.ok
          ? PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE
          : selectedRow
            ? "Row selected. Edit the form to review the before/after diff before dry-run submit."
            : "-";
      const previewErrors = source
        ? createListText(source.errors, "no validation errors")
        : Array.isArray(preflight.errors) && preflight.errors.length
          ? createListText(preflight.errors, "no validation errors")
          : "-";
      const rows = source
        ? [
            previewDiff,
            previewWarnings,
            previewErrors,
            riskSummaryText(source.riskSummary),
          ]
        : [];

      setStatus(els.promotionDryRunRouteMounted, source && Object.prototype.hasOwnProperty.call(source, "routeMounted") ? String(source.routeMounted) : "-");
      setStatus(els.promotionDryRunApiEnabled, source && Object.prototype.hasOwnProperty.call(source, "apiCallEnabled") ? String(source.apiCallEnabled) : "-");
      setStatus(els.promotionDryRunOnly, source && Object.prototype.hasOwnProperty.call(source, "dryRunOnly") ? String(source.dryRunOnly) : "-");
      setStatus(els.promotionDryRunValidateOnly, source && Object.prototype.hasOwnProperty.call(source, "validateOnly") ? String(source.validateOnly) : "-");
      setStatus(els.promotionDryRunWriteLocked, source && Object.prototype.hasOwnProperty.call(source, "writeLocked") ? String(source.writeLocked) : "-");
      setStatus(els.promotionDryRunDbWriteEnabled, source && Object.prototype.hasOwnProperty.call(source, "dbWriteEnabled") ? String(source.dbWriteEnabled) : "-");
      setStatus(els.promotionDryRunWalletWriteEnabled, source && Object.prototype.hasOwnProperty.call(source, "walletWriteEnabled") ? String(source.walletWriteEnabled) : "-");
      setStatus(els.promotionDryRunPromotionUpdateEnabled, source && Object.prototype.hasOwnProperty.call(source, "promotionUpdateEnabled") ? String(source.promotionUpdateEnabled) : "-");
      setStatus(els.promotionDryRunAuditWriteEnabled, source && Object.prototype.hasOwnProperty.call(source, "auditWriteEnabled") ? String(source.auditWriteEnabled) : "-");
      setStatus(els.promotionDryRunLedgerWriteEnabled, source && Object.prototype.hasOwnProperty.call(source, "ledgerWriteEnabled") ? String(source.ledgerWriteEnabled) : "-");
      setStatus(els.promotionDryRunTurnoverEnabled, source && Object.prototype.hasOwnProperty.call(source, "turnoverCreationEnabled") ? String(source.turnoverCreationEnabled) : "-");
      setStatus(els.promotionDryRunClaimEnabled, source && Object.prototype.hasOwnProperty.call(source, "claimExecutionEnabled") ? String(source.claimExecutionEnabled) : "-");
      setStatus(els.promotionDryRunProviderEnabled, source && Object.prototype.hasOwnProperty.call(source, "providerOutboundEnabled") ? String(source.providerOutboundEnabled) : "-");
      setStatus(els.promotionDryRunProductionLiveEnabled, source && Object.prototype.hasOwnProperty.call(source, "productionLiveEnabled") ? String(source.productionLiveEnabled) : "-");
      setStatus(els.promotionDryRunProductionDeployEnabled, source && Object.prototype.hasOwnProperty.call(source, "productionDeployEnabled") ? String(source.productionDeployEnabled) : "-");
      setStatus(els.promotionDryRunSelected, selectedLabel);
      setStatus(els.promotionDryRunValidator, source && source.validator ? source.validator : "-");
      setStatus(
        els.promotionDryRunResultCode,
        source
          ? [source.code || "OK", source.message || ""].filter(Boolean).join(" - ")
          : "-"
      );
      setStatus(
        els.promotionDryRunValidationStatus,
        result ? "validated" : !preflight.ok || error ? "fail-closed" : selectedRow ? "preview" : "-"
      );
      setStatus(
        els.promotionDryRunValidationErrors,
        previewErrors
      );
      setStatus(
        els.promotionDryRunDiffPreview,
        previewDiff
      );
      setStatus(
        els.promotionDryRunWarningNotes,
        previewWarnings
      );
      setStatus(els.promotionDryRunPreflightStatus, result ? "passed" : preflight.ok ? "ready" : "fail-closed");
      setStatus(els.promotionDryRunPreflightApiBlocked, String(result ? false : preflight.apiBlocked));
      setStatus(els.promotionDryRunPreflightSelectedMatch, String(preflight.selectedSnapshotMatch));
      setStatus(
        els.promotionDryRunPreflightErrors,
        preflight.errors.length ? preflight.errors.join(" | ") : "no preflight errors"
      );
      setStatus(
        els.promotionDryRunPreflightRiskyFields,
        preflight.riskyFields.length ? preflight.riskyFields.join(", ") : "none"
      );

      if (els.promotionDryRunSafetyMessage) {
        els.promotionDryRunSafetyMessage.textContent = result
          ? "Dry-run เท่านั้น ไม่มีการบันทึกจริง ไม่แตะ wallet/claim/ledger/provider"
          : error
            ? "Dry-run เท่านั้น และ fail-closed เมื่อ request ไม่ผ่าน ไม่มีการบันทึกจริง ไม่แตะ wallet/claim/ledger/provider"
            : "Dry-run เท่านั้น ไม่มีการบันทึกจริง ไม่แตะ wallet/claim/ledger/provider";
      }

      if (els.promotionDryRunPreflightState) {
        els.promotionDryRunPreflightState.textContent = result
          ? "Client preflight passed before POST /api/admin/promotions/:id/dry-run. Review packet remains local-only."
          : preflight.ok
            ? "Client preflight passed. POST /api/admin/promotions/:id/dry-run stays dry-run only and write locked."
            : `${PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE}.`;
      }

      if (els.promotionDryRunState) {
        if (result) {
          els.promotionDryRunState.textContent = `Dry-run response loaded for ${selectedLabel}. ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        } else if (error && error.code === "PROMOTION_DRY_RUN_CLIENT_PREFLIGHT_FAILED") {
          els.promotionDryRunState.textContent = `${safeText(error.message, "Promotion dry-run failed.")} Fail-closed. ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        } else if (!preflight.ok) {
          els.promotionDryRunState.textContent = `${PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE}. ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        } else if (error) {
          els.promotionDryRunState.textContent = `${safeText(error.message, "Promotion dry-run failed.")} Fail-closed. ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        } else if (state.token) {
          els.promotionDryRunState.textContent = `เลือก promotion จากรายการเพื่อ prefill form แล้วแก้ไขก่อนกด Dry-run promotion เพื่อตรวจแบบ Dry-run เท่านั้น ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        } else {
          els.promotionDryRunState.textContent = `Login an admin first to call POST /api/admin/promotions/:id/dry-run. ${PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE}`;
        }
      }

      if (els.promotionDryRunResultRows) {
        els.promotionDryRunResultRows.innerHTML = "";
        if (rows.length) {
          const tr = document.createElement("tr");
          rows.forEach(function (value) {
            createCell(tr, value);
          });
          els.promotionDryRunResultRows.appendChild(tr);
        }
      }

      renderPromotionDryRunReviewPacket();
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
      const maxWithdraw = row && row.maxWithdraw !== null && row.maxWithdraw !== undefined ? `max withdraw ${formatMoney(row.maxWithdraw)}` : "no max withdraw";
      return `${minDeposit}; ${maxWithdraw}`;
    }

    function promotionDryRunTextValue(element) {
      if (!element || element.value === null || element.value === undefined) return "";
      return String(element.value).trim();
    }

    function promotionDryRunNumberValue(element, fieldName, errors) {
      const raw = promotionDryRunTextValue(element);
      if (!raw) return null;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        errors.push(`${fieldName} must be a non-negative number`);
        return null;
      }
      return parsed;
    }

    function promotionDryRunDateValue(element) {
      const raw = promotionDryRunTextValue(element);
      return raw || null;
    }

    function promotionDryRunRowDraft(row) {
      const source = row && typeof row === "object" ? row : {};
      return {
        id: safeText(source.id, ""),
        title: safeText(source.title || source.name || source.id, ""),
        type: safeText(source.type, ""),
        status: safeText(source.status, ""),
        minDeposit: source.minDeposit === undefined || source.minDeposit === null || source.minDeposit === "" ? null : safeNumber(source.minDeposit, null),
        maxDeposit: source.maxDeposit === undefined || source.maxDeposit === null || source.maxDeposit === "" ? null : safeNumber(source.maxDeposit, null),
        bonusType: safeText(source.bonusType, ""),
        bonusValue: source.bonusValue === undefined || source.bonusValue === null || source.bonusValue === "" ? null : safeNumber(source.bonusValue, null),
        turnoverMultiplier: source.turnoverMultiplier === undefined || source.turnoverMultiplier === null || source.turnoverMultiplier === "" ? null : safeNumber(source.turnoverMultiplier, null),
        maxWithdraw: source.maxWithdraw === undefined || source.maxWithdraw === null || source.maxWithdraw === "" ? null : safeNumber(source.maxWithdraw, null),
        startAt: source.startAt ? String(source.startAt) : "",
        endAt: source.endAt ? String(source.endAt) : "",
      };
    }

    function promotionDryRunFieldSummary(row) {
      const source = promotionDryRunRowDraft(row);
      if (!source.id && !source.title) return "-";
      const parts = [
        source.id ? `id ${source.id}` : null,
        source.title ? `title ${source.title}` : null,
        source.status ? `status ${source.status}` : null,
        source.type ? `type ${source.type}` : null,
        source.minDeposit === null ? null : `min ${formatMoney(source.minDeposit)}`,
        source.maxDeposit === null ? null : `max ${formatMoney(source.maxDeposit)}`,
        source.bonusType ? `bonus ${source.bonusType}` : null,
        source.bonusValue === null ? null : `bonus value ${formatMoney(source.bonusValue)}`,
        source.turnoverMultiplier === null ? null : `turnover ${source.turnoverMultiplier}x`,
        source.maxWithdraw === null ? null : `max withdraw ${formatMoney(source.maxWithdraw)}`,
        source.startAt ? `start ${source.startAt}` : null,
        source.endAt ? `end ${source.endAt}` : null,
      ].filter(Boolean);
      return parts.length ? parts.join(" | ") : "-";
    }

    function promotionDryRunDiffText(beforeRow, afterRow) {
      const before = promotionDryRunRowDraft(beforeRow);
      const after = promotionDryRunRowDraft(afterRow);
      const fields = [
        ["title", before.title, after.title],
        ["type", before.type, after.type],
        ["status", before.status, after.status],
        ["minDeposit", before.minDeposit, after.minDeposit],
        ["maxDeposit", before.maxDeposit, after.maxDeposit],
        ["bonusType", before.bonusType, after.bonusType],
        ["bonusValue", before.bonusValue, after.bonusValue],
        ["turnoverMultiplier", before.turnoverMultiplier, after.turnoverMultiplier],
        ["maxWithdraw", before.maxWithdraw, after.maxWithdraw],
        ["startAt", before.startAt, after.startAt],
        ["endAt", before.endAt, after.endAt],
      ];
      const diffs = fields
        .filter(function (entry) {
          return entry[1] !== entry[2];
        })
        .map(function (entry) {
          return `${entry[0]}: ${safeText(entry[1], "-")} -> ${safeText(entry[2], "-")}`;
        });
      return diffs.length ? diffs.join(" | ") : "no diff";
    }

    function promotionDryRunPreviewText(form) {
      if (!form || !form.promotionRow) return "Select a promotion row to preview before/after diff.";
      return promotionDryRunDiffText(form.promotionRow, form.after);
    }

    function promotionDryRunChangedFields(beforeRow, afterRow) {
      const before = promotionDryRunRowDraft(beforeRow);
      const after = promotionDryRunRowDraft(afterRow);
      return [
        "title",
        "type",
        "status",
        "minDeposit",
        "maxDeposit",
        "bonusType",
        "bonusValue",
        "turnoverMultiplier",
        "maxWithdraw",
        "startAt",
        "endAt",
      ].filter(function (field) {
        return before[field] !== after[field];
      });
    }

    function promotionDryRunSelectedRow() {
      const promotionId = safeText(els.promotionDryRunPromotionIdInput && els.promotionDryRunPromotionIdInput.value, "").trim();
      if (!promotionId) return null;
      const row = state.promotions.find(function (item) {
        return safeText(item && item.id, "") === promotionId;
      });
      return row || null;
    }

    function syncPromotionDryRunForm(row) {
      const source = promotionDryRunRowDraft(row);
      if (els.promotionDryRunPromotionIdInput) els.promotionDryRunPromotionIdInput.value = source.id;
      if (els.promotionDryRunTitleInput) els.promotionDryRunTitleInput.value = source.title;
      if (els.promotionDryRunTypeInput) els.promotionDryRunTypeInput.value = source.type;
      if (els.promotionDryRunStatusInput) els.promotionDryRunStatusInput.value = source.status;
      if (els.promotionDryRunMinDepositInput) els.promotionDryRunMinDepositInput.value = source.minDeposit === null ? "" : String(source.minDeposit);
      if (els.promotionDryRunMaxDepositInput) els.promotionDryRunMaxDepositInput.value = source.maxDeposit === null ? "" : String(source.maxDeposit);
      if (els.promotionDryRunBonusTypeInput) els.promotionDryRunBonusTypeInput.value = source.bonusType;
      if (els.promotionDryRunBonusValueInput) els.promotionDryRunBonusValueInput.value = source.bonusValue === null ? "" : String(source.bonusValue);
      if (els.promotionDryRunTurnoverMultiplierInput) els.promotionDryRunTurnoverMultiplierInput.value = source.turnoverMultiplier === null ? "" : String(source.turnoverMultiplier);
      if (els.promotionDryRunMaxWithdrawInput) els.promotionDryRunMaxWithdrawInput.value = source.maxWithdraw === null ? "" : String(source.maxWithdraw);
      if (els.promotionDryRunStartAtInput) els.promotionDryRunStartAtInput.value = source.startAt;
      if (els.promotionDryRunEndAtInput) els.promotionDryRunEndAtInput.value = source.endAt;
      if (els.promotionDryRunAuditReasonInput) {
        els.promotionDryRunAuditReasonInput.value = "";
      }
      if (els.promotionDryRunAcknowledgementInput) {
        els.promotionDryRunAcknowledgementInput.checked = false;
      }
      state.promotionDryRunPromotionId = source.id || null;
      state.promotionDryRunPromotionLabel = source.id ? safeText(source.title || source.id, source.id) : "";
      state.promotionDryRunPromotionRow = row || null;
      state.promotionDryRunResult = null;
      state.promotionDryRunError = null;
      state.promotionDryRunLastDryRunPayloadSnapshot = null;
      state.promotionDryRunReviewPacketFreshness = "fail-closed";
      renderPromotionDryRunResult();
    }

    function selectPromotionForDryRun(row) {
      syncPromotionDryRunForm(row);
      if (els.statusText) {
        const label = row ? safeText(row.title || row.name || row.id, safeText(row && row.id, "promotion")) : "promotion";
        els.statusText.textContent = `Selected ${label} for dry-run prefill. Edit the form, then submit dry-run.`;
      }
    }

    function readPromotionDryRunForm() {
      const errors = [];
      const promotionId = promotionDryRunTextValue(els.promotionDryRunPromotionIdInput);
      if (!promotionId) {
        errors.push("promotionId is required");
      }

      const promotionRow = promotionId
        ? state.promotions.find(function (row) {
            return safeText(row && row.id, "") === promotionId;
          })
        : null;
      if (!promotionRow) {
        errors.push("promotionId must reference a loaded promotion row");
      }

      const before = promotionDryRunRowDraft(promotionRow);
      const after = {
        title: promotionDryRunTextValue(els.promotionDryRunTitleInput),
        type: promotionDryRunTextValue(els.promotionDryRunTypeInput),
        status: promotionDryRunTextValue(els.promotionDryRunStatusInput),
        minDeposit: promotionDryRunNumberValue(els.promotionDryRunMinDepositInput, "minDeposit", errors),
        maxDeposit: promotionDryRunNumberValue(els.promotionDryRunMaxDepositInput, "maxDeposit", errors),
        bonusType: promotionDryRunTextValue(els.promotionDryRunBonusTypeInput),
        bonusValue: promotionDryRunNumberValue(els.promotionDryRunBonusValueInput, "bonusValue", errors),
        turnoverMultiplier: promotionDryRunNumberValue(els.promotionDryRunTurnoverMultiplierInput, "turnoverMultiplier", errors),
        maxWithdraw: promotionDryRunNumberValue(els.promotionDryRunMaxWithdrawInput, "maxWithdraw", errors),
        startAt: promotionDryRunDateValue(els.promotionDryRunStartAtInput),
        endAt: promotionDryRunDateValue(els.promotionDryRunEndAtInput),
      };
      const auditReason = promotionDryRunTextValue(els.promotionDryRunAuditReasonInput);
      if (!auditReason) {
        errors.push("auditReason is required");
      }

      const riskAcknowledgement = Boolean(els.promotionDryRunAcknowledgementInput && els.promotionDryRunAcknowledgementInput.checked);

      if (after.minDeposit !== null && after.maxDeposit !== null && after.maxDeposit < after.minDeposit) {
        errors.push("maxDeposit must be greater than or equal to minDeposit");
      }

      if (after.startAt && after.endAt && new Date(after.startAt).getTime() > new Date(after.endAt).getTime()) {
        errors.push("startAt must not be later than endAt");
      }

      const preview = promotionDryRunDiffText(before, after);
      return {
        ok: errors.length === 0,
        errors: errors,
        promotionId: promotionId,
        promotionRow: promotionRow,
        promotionLabel: promotionRow ? safeText(promotionRow.title || promotionRow.name || promotionRow.id, promotionId) : promotionId,
        before: before,
        after: after,
        auditReason: auditReason,
        riskAcknowledgement: riskAcknowledgement,
        diffPreview: preview,
      };
    }

    function buildPromotionDryRunClientPreflight(form) {
      const previewForm = form || readPromotionDryRunForm();
      const errors = Array.isArray(previewForm.errors) ? previewForm.errors.slice() : [];
      const selectedSnapshot = state.promotionDryRunPromotionRow || null;
      const selectedSnapshotId = safeText(selectedSnapshot && selectedSnapshot.id, "").trim();
      const promotionRowId = safeText(previewForm.promotionRow && previewForm.promotionRow.id, "").trim();
      const selectedSnapshotMatch = selectedSnapshotId
        ? previewForm.promotionId === selectedSnapshotId && promotionRowId === selectedSnapshotId
        : Boolean(previewForm.promotionId) && promotionRowId === previewForm.promotionId;
      const riskyFields = promotionDryRunChangedFields(previewForm.before, previewForm.after).filter(function (field) {
        return PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_RISKY_FIELDS.includes(field);
      });

      if (!previewForm.promotionRow) {
        errors.push("selected promotion is required before dry-run submit");
      }
      if (selectedSnapshotId && !selectedSnapshotMatch) {
        errors.push("promotionId must match the currently selected promotion snapshot");
      }
      if (riskyFields.length && previewForm.riskAcknowledgement !== true) {
        errors.push(`riskAcknowledgement must be true when risky fields change: ${riskyFields.join(", ")}`);
      }

      return {
        ok: errors.length === 0,
        errors: Array.from(new Set(errors)),
        riskyFields: riskyFields,
        selectedSnapshotMatch: selectedSnapshotMatch,
        apiBlocked: errors.length > 0,
      };
    }

    function buildPromotionDryRunPayloadFromForm() {
      const form = readPromotionDryRunForm();
      const preflight = buildPromotionDryRunClientPreflight(form);
      if (!preflight.ok) {
        return {
          ok: false,
          promotionId: form.promotionId || null,
          promotionLabel: form.promotionLabel || "",
          promotionRow: form.promotionRow || null,
          error: {
            code: "PROMOTION_DRY_RUN_CLIENT_PREFLIGHT_FAILED",
            message: `Promotion dry-run client preflight failed. ${PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE}.`,
            errors: preflight.errors.slice(),
            warnings: [PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE],
            diffPreview: form.diffPreview,
            validator: "buildPromotionDryRunClientPreflight",
            routeMounted: false,
            apiCallEnabled: false,
            dryRunOnly: true,
            validateOnly: true,
            writeLocked: true,
            dbWriteEnabled: false,
            walletWriteEnabled: false,
            promotionUpdateEnabled: false,
            auditWriteEnabled: false,
            ledgerWriteEnabled: false,
            turnoverCreationEnabled: false,
            claimExecutionEnabled: false,
            providerOutboundEnabled: false,
            productionLiveEnabled: false,
            productionDeployEnabled: false,
            preflightStatus: "fail-closed",
            preflightApiBlocked: true,
            selectedSnapshotMatch: preflight.selectedSnapshotMatch,
            riskyFields: preflight.riskyFields.slice(),
          },
        };
      }

      const beforePayload = {
        title: form.before.title,
        type: form.before.type,
        status: form.before.status,
        minDeposit: form.before.minDeposit,
        maxDeposit: form.before.maxDeposit,
        bonusType: form.before.bonusType,
        bonusValue: form.before.bonusValue,
        turnoverMultiplier: form.before.turnoverMultiplier,
        maxWithdraw: form.before.maxWithdraw,
        startAt: form.before.startAt,
        endAt: form.before.endAt,
      };
      const afterPayload = {
        title: form.after.title,
        type: form.after.type,
        status: form.after.status,
        minDeposit: form.after.minDeposit,
        maxDeposit: form.after.maxDeposit,
        bonusType: form.after.bonusType,
        bonusValue: form.after.bonusValue,
        turnoverMultiplier: form.after.turnoverMultiplier,
        maxWithdraw: form.after.maxWithdraw,
        startAt: form.after.startAt,
        endAt: form.after.endAt,
      };

      return {
        ok: true,
        promotionLabel: form.promotionLabel,
        diffPreview: form.diffPreview,
        payload: {
          before: beforePayload,
          after: afterPayload,
          auditReason: form.auditReason,
          riskAcknowledgement: form.riskAcknowledgement,
        },
        promotionRow: form.promotionRow,
        promotionId: form.promotionId,
      };
    }

    function buildPromotionDryRunNetworkFailure(error) {
      return {
        code: error && error.status ? `HTTP_${error.status}` : "PROMOTION_DRY_RUN_FAILED",
        message: safeText(error && error.message, "Promotion dry-run failed."),
        errors: error && error.payload && Array.isArray(error.payload.errors) ? error.payload.errors.slice() : [],
        routeMounted: error && error.payload && Object.prototype.hasOwnProperty.call(error.payload, "routeMounted") ? error.payload.routeMounted : false,
        apiCallEnabled: error && error.payload && Object.prototype.hasOwnProperty.call(error.payload, "apiCallEnabled") ? error.payload.apiCallEnabled : false,
        dryRunOnly: true,
        validateOnly: true,
        writeLocked: true,
        dbWriteEnabled: false,
        walletWriteEnabled: false,
        promotionUpdateEnabled: false,
        auditWriteEnabled: false,
        ledgerWriteEnabled: false,
        turnoverCreationEnabled: false,
        claimExecutionEnabled: false,
        providerOutboundEnabled: false,
        productionLiveEnabled: false,
        productionDeployEnabled: false,
      };
    }

    async function submitPromotionDryRunFromForm() {
      if (!state.token) {
        state.promotionDryRunResult = null;
        state.promotionDryRunError = {
          code: "PROMOTION_DRY_RUN_LOGIN_REQUIRED",
          message: "Login an admin first before running promotion dry-run.",
          routeMounted: false,
          apiCallEnabled: false,
          dryRunOnly: true,
          validateOnly: true,
          writeLocked: true,
          dbWriteEnabled: false,
          walletWriteEnabled: false,
          promotionUpdateEnabled: false,
          auditWriteEnabled: false,
          ledgerWriteEnabled: false,
          turnoverCreationEnabled: false,
          claimExecutionEnabled: false,
          providerOutboundEnabled: false,
          productionLiveEnabled: false,
          productionDeployEnabled: false,
          errors: ["admin session is required"],
        };
        state.promotionDryRunLastDryRunPayloadSnapshot = null;
        state.promotionDryRunReviewPacketFreshness = "fail-closed";
        renderPromotionDryRunResult();
        els.statusText.textContent = "Promotion dry-run is fail-closed until an admin session is loaded.";
        return;
      }

      const form = buildPromotionDryRunPayloadFromForm();
      if (!form.ok) {
        state.promotionDryRunResult = null;
        state.promotionDryRunError = form.error;
        state.promotionDryRunPromotionId = form.promotionId || null;
        state.promotionDryRunPromotionLabel = form.promotionLabel || "";
        state.promotionDryRunPromotionRow = form.promotionRow || null;
        state.promotionDryRunReviewPacketFreshness = "fail-closed";
        renderPromotionDryRunResult();
        els.statusText.textContent = `${safeText(form.error.message, "Promotion dry-run form validation failed.")} Fail-closed.`;
        return;
      }

      setBusy(true);
      state.promotionDryRunPromotionId = form.promotionId;
      state.promotionDryRunPromotionLabel = form.promotionLabel;
      state.promotionDryRunPromotionRow = form.promotionRow || null;
      state.promotionDryRunResult = null;
      state.promotionDryRunError = null;
      renderPromotionDryRunResult();
      els.statusText.textContent = `Running promotion dry-run for ${form.promotionLabel}...`;
      try {
        const response = await apiRequest(`/admin/promotions/${encodeURIComponent(form.promotionId)}/dry-run`, {
          method: "POST",
          token: state.token,
          body: form.payload,
          returnPayload: true,
        });
        state.promotionDryRunResult = response;
        state.promotionDryRunError = null;
        state.promotionDryRunLastDryRunPayloadSnapshot = promotionDryRunPayloadSnapshot();
        state.promotionDryRunReviewPacketFreshness = "fresh";
        renderPromotionDryRunResult();
        els.statusText.textContent = "Promotion dry-run completed. Dry-run เท่านั้น ไม่มีการบันทึกจริง ไม่แตะ wallet/claim/ledger/provider.";
      } catch (error) {
        state.promotionDryRunResult = null;
        state.promotionDryRunError = buildPromotionDryRunNetworkFailure(error);
        state.promotionDryRunReviewPacketFreshness = "fail-closed";
        renderPromotionDryRunResult();
        els.statusText.textContent = `${safeText(error && error.message, "Promotion dry-run failed.")} Fail-closed.`;
      } finally {
        setBusy(false);
      }
    }

    function dryRunPromotion(row) {
      selectPromotionForDryRun(row);
      return submitPromotionDryRunFromForm();
    }

    function copyPromotionDryRunReviewPacket() {
      const packet = renderPromotionDryRunReviewPacket();
      const text = JSON.stringify(packet, null, 2);
      if (packet.freshness === "stale" || packet.status !== "ready_for_review") {
        if (els.statusText) {
          els.statusText.textContent =
            packet.freshness === "stale"
              ? "Review packet is stale. กรุณา dry-run ใหม่ก่อน copy/export."
              : "Review packet is fail-closed. Select a promotion and complete dry-run first.";
        }
        return;
      }
      if (els.promotionDryRunReviewPacketExport) {
        els.promotionDryRunReviewPacketExport.value = text;
        if (typeof els.promotionDryRunReviewPacketExport.focus === "function") {
          els.promotionDryRunReviewPacketExport.focus();
        }
        if (typeof els.promotionDryRunReviewPacketExport.select === "function") {
          els.promotionDryRunReviewPacketExport.select();
        }
      }
      if (window.navigator && window.navigator.clipboard && typeof window.navigator.clipboard.writeText === "function") {
        window.navigator.clipboard.writeText(text).catch(function () {});
      }
      if (els.statusText) {
        els.statusText.textContent = "Promotion dry-run review packet copied/exported locally. No API call was made.";
      }
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
        createCell(tr, "guarded_hold_fail_closed", "status-pending");
        const actionCell = document.createElement("td");
        actionCell.appendChild(
          makeActionButton("Dry-run promotion", "secondary", function () {
            dryRunPromotion(row).catch(function () {});
          })
        );
        actionCell.appendChild(
          makeActionButton("Select for dry-run", "secondary", function () {
            selectPromotionForDryRun(row);
          })
        );
        const actionNote = document.createElement("p");
        actionNote.className = "status-note";
        actionNote.textContent = "Select the row to prefill the form, or dry-run it immediately.";
        actionCell.appendChild(actionNote);
        tr.appendChild(actionCell);
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
      renderPromotionDryRunResult();
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
        state.promotionDryRunResult = null;
        state.promotionDryRunError = null;
        state.promotionDryRunPromotionId = null;
        state.promotionDryRunPromotionLabel = "";
        state.promotionDryRunPromotionRow = null;
        state.codeCampaigns = [];
        state.codeRedeemLogs = [];
        syncPromotionDryRunForm(null);
        renderAll();
        if (els.summaryState) {
          els.summaryState.textContent = "Login an admin first to read backend-connected dashboard/report cards.";
        }
        if (els.codeRewardState) {
          els.codeRewardState.textContent = "Login an admin first to read backend-connected code center and reward visibility.";
        }
      if (els.promotionState) {
        els.promotionState.textContent = "Login an admin first to read backend-connected admin promotion config visibility.";
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
        els.promotionState.textContent = `Loading backend-connected admin promotion config read-only/local-safe visibility... ${ADMIN_PROMOTION_CONFIG_ROUTE_NOTE}`;
      }
      els.statusText.textContent = `Refreshing admin finance queues... ${ADMIN_FINANCE_CONNECTED_ROUTE_NOTE}`;
      try {
        const [summary, pendingBanks, pendingDeposits, pendingWithdrawals, ledger, promotions, codeCampaigns, codeRedeemLogs, audit] = await Promise.all([
          apiRequest("/admin/reports/summary", { token: state.token }),
          apiRequest("/admin/bank-accounts/pending", { token: state.token }),
          apiRequest("/admin/deposits?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/withdrawals?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/reports/wallet-ledger?limit=20", { token: state.token }),
          apiRequest("/admin/promotions", { token: state.token }),
          apiRequest("/admin/code-center/campaigns", { token: state.token }),
          apiRequest("/admin/code-center/redeem-logs?limit=50", { token: state.token }),
          apiRequest("/admin/logs?limit=20", { token: state.token }),
        ]);

        state.summary = summary && typeof summary === "object" ? summary : null;
        state.pendingBanks = Array.isArray(pendingBanks) ? pendingBanks : [];
        state.pendingDeposits = Array.isArray(pendingDeposits) ? pendingDeposits : [];
        state.pendingWithdrawals = Array.isArray(pendingWithdrawals) ? pendingWithdrawals : [];
        state.ledger = Array.isArray(ledger) ? ledger : [];
        state.promotions = Array.isArray(promotions)
          ? promotions
          : Array.isArray(promotions && promotions.promotions)
            ? promotions.promotions
            : [];
        state.codeCampaigns = Array.isArray(codeCampaigns && codeCampaigns.campaigns) ? codeCampaigns.campaigns : [];
        state.codeRedeemLogs = Array.isArray(codeRedeemLogs && codeRedeemLogs.redeemLogs) ? codeRedeemLogs.redeemLogs : [];
        state.audit = Array.isArray(audit) ? audit : [];
        const selectedPromotionRow = promotionDryRunSelectedRow();
        if (selectedPromotionRow) {
          syncPromotionDryRunForm(selectedPromotionRow);
        } else if (state.promotions.length > 0) {
          syncPromotionDryRunForm(state.promotions[0]);
        } else {
          syncPromotionDryRunForm(null);
        }
        renderAll();
        if (els.summaryState) {
          els.summaryState.textContent = `Dashboard/report cards refreshed. ${ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE}`;
        }
        if (els.codeRewardState) {
          els.codeRewardState.textContent = `Code center and reward visibility refreshed. ${ADMIN_CODE_REWARD_ROUTE_NOTE}`;
        }
        if (els.promotionState) {
          els.promotionState.textContent = `Admin promotion config visibility refreshed. ${ADMIN_PROMOTION_CONFIG_ROUTE_NOTE}`;
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
          els.promotionState.textContent = `${safeText(error.message, "Admin promotion config visibility refresh failed.")} ${ADMIN_PROMOTION_CONFIG_ROUTE_NOTE}`;
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
      state.promotionDryRunResult = null;
      state.promotionDryRunError = null;
      state.promotionDryRunPromotionId = null;
      state.promotionDryRunPromotionLabel = "";
      state.promotionDryRunPromotionRow = null;
      syncPromotionDryRunForm(null);
      renderAll();
      if (els.summaryState) {
        els.summaryState.textContent = "Local admin session cleared. Dashboard/report cards are read-only and local-safe.";
      }
      if (els.codeRewardState) {
        els.codeRewardState.textContent = "Local admin session cleared. Code center and reward visibility stay read-only and local-safe.";
      }
      if (els.promotionState) {
        els.promotionState.textContent = "Local admin session cleared. Admin promotion config visibility stays read-only/local-safe and claim guarded hold.";
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
      return loginAdmin().catch(function () {});
    });
    els.refresh.addEventListener("click", function () {
      return refreshAdminData().catch(function () {});
    });
    if (els.promotionDryRunSubmit) {
      els.promotionDryRunSubmit.addEventListener("click", function () {
        return submitPromotionDryRunFromForm().catch(function () {});
      });
    }
    if (els.promotionDryRunReviewPacketCopy) {
      els.promotionDryRunReviewPacketCopy.addEventListener("click", copyPromotionDryRunReviewPacket);
    }
    [
      els.promotionDryRunPromotionIdInput,
      els.promotionDryRunTitleInput,
      els.promotionDryRunTypeInput,
      els.promotionDryRunStatusInput,
      els.promotionDryRunMinDepositInput,
      els.promotionDryRunMaxDepositInput,
      els.promotionDryRunBonusTypeInput,
      els.promotionDryRunBonusValueInput,
      els.promotionDryRunTurnoverMultiplierInput,
      els.promotionDryRunMaxWithdrawInput,
      els.promotionDryRunStartAtInput,
      els.promotionDryRunEndAtInput,
      els.promotionDryRunAuditReasonInput,
      els.promotionDryRunAcknowledgementInput,
    ]
      .filter(Boolean)
      .forEach(function (input) {
        const rerender = function () {
          if (
            state.promotionDryRunError &&
            state.promotionDryRunError.code === "PROMOTION_DRY_RUN_CLIENT_PREFLIGHT_FAILED"
          ) {
            state.promotionDryRunError = null;
          }
          renderPromotionDryRunResult();
        };
        input.addEventListener("input", rerender);
        input.addEventListener("change", rerender);
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
      els.promotionState.textContent = "Load a local-safe admin to read admin promotion config visibility.";
    }
    renderPromotionDryRunResult();
    els.statusText.textContent =
      "Login with a local-safe admin to review pending finance requests. " + ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE;
  }

  if (page === "member") {
    initMemberPage();
  } else if (page === "admin") {
    initAdminPage();
  }
})();
