(function () {
  "use strict";

  const SITE_CODE = "PG77";
  const API_BASE = "/api";
  const STORAGE_PREFIX = "pg77-money-demo";
  const DEFAULT_MEMBER_PASSWORD = "localSmokeMember123";
  const DEFAULT_ADMIN_USERNAME = "local_money_flow_admin";
  const DEFAULT_ADMIN_PASSWORD = "local-demo-admin-code-not-real";

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
      headers.Authorization = `Bearer ${config.token}`;
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
    };

    function setBusy(nextBusy) {
      state.busy = nextBusy;
      [
        els.bootstrap,
        els.refresh,
        els.login,
        els.clear,
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
      }
      setMemberSessionState("not_ready");
      persistMemberSession({ token: null, profile: null });
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

    function renderAll() {
      renderSummary();
      renderBankAccounts();
      renderLedger();
      renderDeposits();
      renderWithdrawals();
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
    }

    async function probeMemberToken() {
      const wallet = await apiRequest("/wallet", { token: state.token });
      state.wallet = wallet || null;
      state.tokenVerified = true;
      setMemberSessionState("ready");
      persistMemberSession({ token: state.token, profile: state.profile });
      return true;
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

      try {
        const [wallet, ledger, bankAccounts, deposits, withdrawals] = await Promise.all([
          apiRequest("/wallet", { token: state.token }),
          apiRequest("/wallet/ledger?limit=20", { token: state.token }),
          apiRequest("/bank-accounts", { token: state.token }),
          apiRequest("/deposits", { token: state.token }),
          apiRequest("/withdrawals", { token: state.token }),
        ]);
        state.wallet = wallet || null;
        state.ledger = Array.isArray(ledger) ? ledger : [];
        state.bankAccounts = Array.isArray(bankAccounts) ? bankAccounts : [];
        state.deposits = Array.isArray(deposits) ? deposits : [];
        state.withdrawals = Array.isArray(withdrawals) ? withdrawals : [];
        state.tokenVerified = true;
        setMemberSessionState("ready");
        persistMemberSession({ token: state.token, profile: state.profile });
        renderAll();
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
      els.statusText.textContent = "Local member session cleared.";
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
    } else {
      ensureMemberDraft();
      setMemberSessionState("not_ready");
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
    els.createDeposit.addEventListener("click", function () {
      createDeposit().catch(function () {});
    });
    els.createWithdrawal.addEventListener("click", function () {
      createWithdrawal().catch(function () {});
    });

    renderAll();
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
      auditEmpty: document.getElementById("admin-audit-empty"),
      auditRows: document.getElementById("admin-audit-rows"),
      statusText: document.getElementById("admin-status-text"),
    };

    const state = {
      busy: false,
      token: null,
      pendingBanks: [],
      pendingDeposits: [],
      pendingWithdrawals: [],
      ledger: [],
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
      setStatus(els.bankCount, state.pendingBanks.length);
      setStatus(els.depositCount, state.pendingDeposits.length);
      setStatus(els.withdrawCount, state.pendingWithdrawals.length);
      setStatus(els.ledgerCount, state.ledger.length);
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
      renderAudit();
    }

    function makeActionButton(label, variant, onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = variant;
      button.textContent = label;
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
        renderAll();
        els.statusText.textContent = "Login an admin first.";
        return;
      }

      setBusy(true);
      els.statusText.textContent = "Refreshing admin finance queues...";
      try {
        const [pendingBanks, pendingDeposits, pendingWithdrawals, ledger, audit] = await Promise.all([
          apiRequest("/admin/bank-accounts/pending", { token: state.token }),
          apiRequest("/admin/deposits?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/withdrawals?status=pending&limit=50", { token: state.token }),
          apiRequest("/admin/reports/wallet-ledger?limit=20", { token: state.token }),
          apiRequest("/admin/logs?limit=20", { token: state.token }),
        ]);

        state.pendingBanks = Array.isArray(pendingBanks) ? pendingBanks : [];
        state.pendingDeposits = Array.isArray(pendingDeposits) ? pendingDeposits : [];
        state.pendingWithdrawals = Array.isArray(pendingWithdrawals) ? pendingWithdrawals : [];
        state.ledger = Array.isArray(ledger) ? ledger : [];
        state.audit = Array.isArray(audit) ? audit : [];
        renderAll();
        els.statusText.textContent = "Admin finance queues refreshed.";
      } catch (error) {
        els.statusText.textContent = safeText(error.message, "Admin finance refresh failed.");
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
        els.statusText.textContent = "Local admin login successful.";
      } catch (error) {
        els.statusText.textContent = safeText(error.message, "Local admin login failed.");
      } finally {
        setBusy(false);
      }
    }

    function clearAdminSession() {
      state.token = null;
      state.pendingBanks = [];
      state.pendingDeposits = [];
      state.pendingWithdrawals = [];
      state.ledger = [];
      state.audit = [];
      clearSavedAdmin();
      els.username.value = DEFAULT_ADMIN_USERNAME;
      els.password.value = DEFAULT_ADMIN_PASSWORD;
      renderAll();
      els.statusText.textContent = "Local admin session cleared.";
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
        els.statusText.textContent = `Bank account ${safeText(action)}d.`;
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
        els.statusText.textContent = `Deposit ${safeText(action)}d.`;
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
        els.statusText.textContent = `Withdrawal ${safeText(action)}d.`;
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
    els.statusText.textContent = "Login with a local-safe admin to review pending finance requests.";
  }

  if (page === "member") {
    initMemberPage();
  } else if (page === "admin") {
    initAdminPage();
  }
})();
