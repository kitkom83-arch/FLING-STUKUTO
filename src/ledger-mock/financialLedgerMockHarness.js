const crypto = require("crypto");

const SUPPORTED_TRANSACTION_TYPES = new Set([
  "deposit.requested",
  "deposit.verified",
  "deposit.credited",
  "deposit.rejected",
  "withdraw.requested",
  "withdraw.reserved",
  "withdraw.approved",
  "withdraw.paid_mock",
  "withdraw.rejected",
  "withdraw.reversed",
  "admin.credit.requested",
  "admin.credit.approved",
  "admin.credit.applied",
  "admin.debit.requested",
  "admin.debit.approved",
  "admin.debit.applied",
  "promotion.bonus.awarded",
  "promotion.bonus.reversed",
  "wheel.reward.awarded",
  "wheel.reward.claimed",
  "provider.transfer.out",
  "provider.transfer.in",
  "provider.callback.adjustment",
  "reconciliation.adjustment",
]);

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  ["database", "_url"].join(""),
  "authorization",
  "jwt",
  "bearer",
  "apikey",
  "accesstoken",
  "refreshtoken",
]);

function createMockLedgerState() {
  return {
    accounts: {},
    balances: {},
    ledgerTransactions: [],
    ledgerEntries: [],
    idempotencyKeys: {},
    auditEvents: [],
    adjustmentRequests: {},
    reconciliationRuns: [],
    reconciliationItems: [],
    counters: {
      account: 0,
      transaction: 0,
      entry: 0,
      audit: 0,
      adjustment: 0,
      reconciliationRun: 0,
      reconciliationItem: 0,
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function nextId(state, counterName, prefix) {
  state.counters[counterName] += 1;
  return `${prefix}_${String(state.counters[counterName]).padStart(4, "0")}`;
}

function normalizeAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

function fail(code, message, correlationId) {
  return {
    success: false,
    error: {
      code,
      message,
      correlationId: correlationId || "mock-ledger-correlation",
    },
  };
}

function ok(data) {
  return {
    success: true,
    data,
  };
}

function stableStringify(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashValue(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function maskIpAddress(value) {
  const ip = String(value || "").trim();
  if (!ip) return "masked";
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 2).join(":")}:masked`;
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  return "masked";
}

function hashUserAgent(value) {
  return crypto.createHash("sha256").update(String(value || "unknown-user-agent")).digest("hex");
}

function isSensitiveKey(key) {
  const compact = String(key || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
  return SENSITIVE_KEYS.has(compact);
}

function sanitizeAuditSnapshot(value) {
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(sanitizeAuditSnapshot);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        isSensitiveKey(key) ? "[REDACTED]" : sanitizeAuditSnapshot(entryValue),
      ])
    );
  }
  if (typeof value === "string" && /bearer\s+[a-z0-9._-]+/i.test(value)) return "[REDACTED]";
  return value;
}

function assertNoSecretLeak(value) {
  const scanned = stableStringify(sanitizeAuditSnapshot(value)).toLowerCase();
  const forbidden = [
    "real_password_value",
    "real_token_value",
    "real_secret_value",
    ["authorization", " actual"].join(""),
    ["jwt", " actual"].join(""),
    ["postgres", "://"].join(""),
    ["postgres", "ql://"].join(""),
  ];
  for (const marker of forbidden) {
    if (scanned.includes(marker)) {
      return fail("validation_error", "Secret-shaped value found in mock output.");
    }
  }
  return ok({ status: "no_secret_leak_detected" });
}

function assertNoLiveMoneyBoundary(options) {
  const attempted = options || {};
  if (attempted.livePayout === true) return fail("live_payout_disabled", "Live payout is disabled in mock harness.");
  if (attempted.liveProvider === true) return fail("provider_live_disabled", "Live provider is disabled in mock harness.");
  if (attempted.productionDb === true) return fail("production_db_blocked", "Production DB is blocked in mock harness.");
  if (attempted.prisma === true) {
    return fail("prisma_disabled_in_mock_harness", "Prisma is disabled in mock harness.");
  }
  if (attempted.network === true) {
    return fail("network_disabled_in_mock_harness", "Network calls are disabled in mock harness.");
  }
  return ok({ status: "mock_boundary_pass" });
}

function createLedgerAccount(state, input) {
  if (!state || !input || !input.siteId || !input.accountType || !input.currency) {
    return fail("validation_error", "siteId, accountType, and currency are required.");
  }
  const id = input.id || nextId(state, "account", "mock_acct");
  const account = {
    id,
    siteId: input.siteId,
    memberId: input.memberId || null,
    accountType: input.accountType,
    currency: input.currency,
    status: input.status || "active",
  };
  state.accounts[id] = account;
  state.balances[id] = 0;
  return ok({ account: clone(account) });
}

function getAccountBalance(state, accountId) {
  return Number(state.balances[accountId] || 0);
}

function createAuditEvent(state, input) {
  const auditEvent = {
    auditLogId: nextId(state, "audit", "mock_audit"),
    siteCode: input.siteId,
    actorType: input.actorType || "mock",
    actorId: input.actorId || "mock-system",
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    beforeSnapshotSanitized: sanitizeAuditSnapshot(input.beforeSnapshot || {}),
    afterSnapshotSanitized: sanitizeAuditSnapshot(input.afterSnapshot || {}),
    reason: input.reason || "mock harness event",
    ipAddressMasked: maskIpAddress(input.ipAddress),
    userAgentHash: hashUserAgent(input.userAgent),
    createdAt: nowIso(),
    correlationId: input.correlationId || "mock-ledger-correlation",
  };
  state.auditEvents.push(auditEvent);
  return auditEvent;
}

function idempotencyScope(input) {
  return [
    input.siteId,
    input.action || input.transactionType,
    input.memberId || input.sourceId,
    input.idempotencyKey,
  ].join(":");
}

function idempotencyPayload(input) {
  return {
    siteId: input.siteId,
    memberId: input.memberId || null,
    transactionType: input.transactionType,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    entries: input.entries,
    reason: input.reason || null,
    metadata: sanitizeAuditSnapshot(input.metadata || {}),
  };
}

function applyMockLedgerTransaction(state, input) {
  const boundary = assertNoLiveMoneyBoundary(input && input.boundary);
  if (!boundary.success) return boundary;
  if (!state || !input || !input.siteId) return fail("validation_error", "siteId is required.");
  if (!SUPPORTED_TRANSACTION_TYPES.has(input.transactionType)) {
    return fail("validation_error", "Unsupported transactionType.");
  }
  if (!input.sourceType || !input.sourceId) return fail("validation_error", "sourceType and sourceId are required.");
  if (!input.idempotencyKey) return fail("validation_error", "idempotencyKey is required.");
  if (!Array.isArray(input.entries) || input.entries.length === 0) {
    return fail("validation_error", "entries are required.");
  }

  const scope = idempotencyScope(input);
  const requestHash = hashValue(idempotencyPayload(input));
  const stored = state.idempotencyKeys[scope];
  if (stored) {
    if (stored.requestHash === requestHash) return clone(stored.responseSnapshot);
    return fail("idempotency_conflict", "Idempotency key was reused with a different payload.");
  }

  const beforeByAccount = {};
  const newEntries = [];
  for (const entryInput of input.entries) {
    const account = state.accounts[entryInput.accountId];
    if (!account || account.siteId !== input.siteId) {
      return fail("validation_error", "Ledger account is missing or not site-scoped.");
    }
    if (entryInput.direction !== "credit" && entryInput.direction !== "debit") {
      return fail("validation_error", "Entry direction must be credit or debit.");
    }
    const amount = normalizeAmount(entryInput.amount);
    if (amount === null) return fail("validation_error", "Entry amount must be positive and finite.");
    const balanceBefore = getAccountBalance(state, account.id);
    const balanceAfter = entryInput.direction === "credit" ? balanceBefore + amount : balanceBefore - amount;
    if (balanceAfter < 0 && entryInput.allowNegative !== true) {
      return fail("insufficient_balance", "Mock account balance is insufficient.");
    }
    beforeByAccount[account.id] = balanceBefore;
    newEntries.push({
      id: nextId(state, "entry", "mock_entry"),
      transactionId: null,
      siteId: input.siteId,
      memberId: account.memberId,
      accountId: account.id,
      accountType: account.accountType,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      transactionType: input.transactionType,
      direction: entryInput.direction,
      amount,
      currency: account.currency,
      balanceBefore,
      balanceAfter: Math.round(balanceAfter * 100) / 100,
      status: entryInput.status || "posted",
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId || "mock-ledger-correlation",
      requestId: input.requestId || null,
      createdByType: input.createdByType || "mock",
      createdById: input.createdById || null,
      createdAt: nowIso(),
      reason: entryInput.reason || input.reason || null,
      auditLogId: null,
      metadataSnapshot: sanitizeAuditSnapshot(input.metadata || {}),
      reversalOfLedgerEntryId: entryInput.reversalOfLedgerEntryId || null,
      reconciliationStatus: entryInput.reconciliationStatus || "pending",
    });
  }

  const transactionId = nextId(state, "transaction", "mock_txn");
  const auditRequired =
    input.auditRequired === true || /^admin\./.test(input.transactionType) || input.transactionType.includes("reversed");
  let auditEvent = null;
  if (auditRequired) {
    if (!input.reason) return fail("validation_error", "Reason is required for audited mock transaction.");
    auditEvent = createAuditEvent(state, {
      siteId: input.siteId,
      actorType: input.createdByType || "mock",
      actorId: input.createdById || "mock-system",
      action: input.transactionType,
      targetType: input.sourceType,
      targetId: input.sourceId,
      beforeSnapshot: beforeByAccount,
      afterSnapshot: newEntries.map((entry) => ({
        accountId: entry.accountId,
        balanceAfter: entry.balanceAfter,
      })),
      reason: input.reason,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      correlationId: input.correlationId,
    });
  }

  for (const entry of newEntries) {
    entry.transactionId = transactionId;
    if (auditEvent) entry.auditLogId = auditEvent.auditLogId;
    state.balances[entry.accountId] = entry.balanceAfter;
    state.ledgerEntries.push(entry);
  }

  const transaction = {
    transactionId,
    siteId: input.siteId,
    transactionType: input.transactionType,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    status: input.status || "completed",
    idempotencyKey: input.idempotencyKey,
    totalDebit: newEntries.filter((entry) => entry.direction === "debit").reduce((sum, entry) => sum + entry.amount, 0),
    totalCredit: newEntries
      .filter((entry) => entry.direction === "credit")
      .reduce((sum, entry) => sum + entry.amount, 0),
    currency: newEntries[0].currency,
    createdAt: nowIso(),
    completedAt: nowIso(),
    metadataSnapshot: sanitizeAuditSnapshot(input.metadata || {}),
  };
  state.ledgerTransactions.push(transaction);

  const response = ok({
    transaction: clone(transaction),
    ledgerEntries: clone(newEntries),
    auditEvent: auditEvent ? clone(auditEvent) : null,
  });
  state.idempotencyKeys[scope] = {
    scope,
    requestHash,
    responseSnapshot: clone(response),
    createdAt: nowIso(),
  };
  return response;
}

function applyMockDepositCredit(state, input) {
  return applyMockLedgerTransaction(state, {
    ...input,
    transactionType: "deposit.credited",
    sourceType: input.sourceType || "mock_deposit",
    entries: [
      {
        accountId: input.accountId,
        direction: "credit",
        amount: input.amount,
      },
    ],
    auditRequired: true,
  });
}

function applyMockWithdrawReserve(state, input) {
  return applyMockLedgerTransaction(state, {
    ...input,
    transactionType: "withdraw.reserved",
    sourceType: input.sourceType || "mock_withdraw",
    entries: [
      {
        accountId: input.accountId,
        direction: "debit",
        amount: input.amount,
      },
    ],
    auditRequired: true,
  });
}

function applyMockWithdrawPaidMock(state, input) {
  const boundary = assertNoLiveMoneyBoundary({ livePayout: input && input.livePayout === true });
  if (!boundary.success) return boundary;
  return applyMockLedgerTransaction(state, {
    ...input,
    transactionType: "withdraw.paid_mock",
    sourceType: input.sourceType || "mock_withdraw",
    entries: [
      {
        accountId: input.accountId,
        direction: "debit",
        amount: input.amount,
        allowNegative: input.allowNegative === true,
      },
    ],
    auditRequired: true,
    metadata: {
      ...(input.metadata || {}),
      livePayout: false,
      mockOnly: true,
    },
  });
}

function applyMockReversal(state, input) {
  const original = state.ledgerEntries.find((entry) => entry.id === input.originalLedgerEntryId);
  if (!original) return fail("validation_error", "Original ledger entry is required for reversal.");
  const direction = original.direction === "credit" ? "debit" : "credit";
  return applyMockLedgerTransaction(state, {
    siteId: original.siteId,
    memberId: original.memberId,
    transactionType: input.transactionType || "withdraw.reversed",
    sourceType: input.sourceType || "mock_reversal",
    sourceId: input.sourceId,
    idempotencyKey: input.idempotencyKey,
    reason: input.reason,
    createdByType: input.createdByType || "admin",
    createdById: input.createdById,
    auditRequired: true,
    entries: [
      {
        accountId: original.accountId,
        direction,
        amount: original.amount,
        reversalOfLedgerEntryId: original.id,
      },
    ],
  });
}

function requestMockAdminAdjustment(state, input) {
  if (!input || !input.siteId || !input.memberId || !input.makerAdminId) {
    return fail("validation_error", "siteId, memberId, and makerAdminId are required.");
  }
  const amount = normalizeAmount(input.amount);
  if (amount === null) return fail("validation_error", "Adjustment amount must be positive and finite.");
  if (!input.reason) return fail("validation_error", "Adjustment reason is required.");
  const id = nextId(state, "adjustment", "mock_adjustment");
  const request = {
    id,
    siteId: input.siteId,
    memberId: input.memberId,
    accountId: input.accountId,
    requestType: input.requestType || "credit",
    amount,
    currency: input.currency || "THB",
    status: "requested",
    makerAdminId: input.makerAdminId,
    checkerAdminId: null,
    requestedAt: nowIso(),
    reason: input.reason,
    auditLogId: null,
    ledgerTransactionId: null,
  };
  const auditEvent = createAuditEvent(state, {
    siteId: input.siteId,
    actorType: "admin",
    actorId: input.makerAdminId,
    action: `admin.${request.requestType}.requested`,
    targetType: "admin_adjustment",
    targetId: id,
    afterSnapshot: request,
    reason: input.reason,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  request.auditLogId = auditEvent.auditLogId;
  state.adjustmentRequests[id] = request;
  return ok({ adjustmentRequest: clone(request), auditEvent: clone(auditEvent) });
}

function approveMockAdminAdjustment(state, input) {
  const request = state.adjustmentRequests[input.adjustmentRequestId];
  if (!request) return fail("validation_error", "Adjustment request is required.");
  if (!input.checkerAdminId) return fail("dual_control_required", "Checker admin is required.");
  if (!input.reason) return fail("validation_error", "Approval reason is required.");
  if (input.checkerAdminId === request.makerAdminId) {
    return fail("no_self_approval", "Maker cannot approve the same adjustment.");
  }
  const before = clone(request);
  request.status = "approved";
  request.checkerAdminId = input.checkerAdminId;
  request.approvedAt = nowIso();
  const auditEvent = createAuditEvent(state, {
    siteId: request.siteId,
    actorType: "admin",
    actorId: input.checkerAdminId,
    action: `admin.${request.requestType}.approved`,
    targetType: "admin_adjustment",
    targetId: request.id,
    beforeSnapshot: before,
    afterSnapshot: request,
    reason: input.reason,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const direction = request.requestType === "debit" ? "debit" : "credit";
  const applied = applyMockLedgerTransaction(state, {
    siteId: request.siteId,
    memberId: request.memberId,
    transactionType: request.requestType === "debit" ? "admin.debit.applied" : "admin.credit.applied",
    sourceType: "admin_adjustment",
    sourceId: request.id,
    idempotencyKey: input.idempotencyKey,
    reason: input.reason,
    createdByType: "admin",
    createdById: input.checkerAdminId,
    auditRequired: true,
    entries: [
      {
        accountId: request.accountId,
        direction,
        amount: request.amount,
      },
    ],
  });
  if (!applied.success) return applied;
  request.status = "applied";
  request.ledgerTransactionId = applied.data.transaction.transactionId;
  return ok({
    adjustmentRequest: clone(request),
    approvalAuditEvent: clone(auditEvent),
    ledgerResult: clone(applied.data),
  });
}

function rejectMockAdminAdjustment(state, input) {
  const request = state.adjustmentRequests[input.adjustmentRequestId];
  if (!request) return fail("validation_error", "Adjustment request is required.");
  if (!input.checkerAdminId) return fail("dual_control_required", "Checker admin is required.");
  if (!input.reason) return fail("validation_error", "Rejection reason is required.");
  if (input.checkerAdminId === request.makerAdminId) {
    return fail("no_self_approval", "Maker cannot reject the same adjustment.");
  }
  const before = clone(request);
  request.status = "rejected";
  request.checkerAdminId = input.checkerAdminId;
  request.rejectedAt = nowIso();
  request.rejectionReason = input.reason;
  const auditEvent = createAuditEvent(state, {
    siteId: request.siteId,
    actorType: "admin",
    actorId: input.checkerAdminId,
    action: `admin.${request.requestType}.rejected`,
    targetType: "admin_adjustment",
    targetId: request.id,
    beforeSnapshot: before,
    afterSnapshot: request,
    reason: input.reason,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return ok({ adjustmentRequest: clone(request), auditEvent: clone(auditEvent) });
}

function applyMockWheelRewardAwarded(state, input) {
  return applyMockLedgerTransaction(state, {
    ...input,
    transactionType: "wheel.reward.awarded",
    sourceType: input.sourceType || "mock_wheel_reward",
    entries: [
      {
        accountId: input.accountId,
        direction: "credit",
        amount: input.amount,
      },
    ],
    auditRequired: true,
    metadata: {
      ...(input.metadata || {}),
      cashPayout: false,
      liabilityOnly: true,
    },
  });
}

function applyMockProviderCallbackAdjustment(state, input) {
  const boundary = assertNoLiveMoneyBoundary({ liveProvider: input && input.liveProvider === true });
  if (!boundary.success) return boundary;
  return applyMockLedgerTransaction(state, {
    ...input,
    transactionType: "provider.callback.adjustment",
    sourceType: input.sourceType || "mock_provider_callback",
    entries: [
      {
        accountId: input.accountId,
        direction: input.direction || "credit",
        amount: input.amount,
      },
    ],
    auditRequired: true,
    metadata: {
      ...(input.metadata || {}),
      providerMode: "mock",
      liveProvider: false,
      varianceOnly: true,
    },
  });
}

function runMockReconciliation(state, input) {
  if (!state || !input || !input.siteId) return fail("validation_error", "siteId is required.");
  const runId = nextId(state, "reconciliationRun", "mock_recon_run");
  const items = [];
  const accounts = Object.values(state.accounts).filter((account) => account.siteId === input.siteId);

  for (const account of accounts) {
    const ledgerSum = state.ledgerEntries
      .filter((entry) => entry.accountId === account.id)
      .reduce((sum, entry) => sum + (entry.direction === "credit" ? entry.amount : -entry.amount), 0);
    const walletSnapshot = input.walletSnapshots && account.id in input.walletSnapshots
      ? Number(input.walletSnapshots[account.id])
      : getAccountBalance(state, account.id);
    const varianceAmount = Math.round((walletSnapshot - ledgerSum) * 100) / 100;
    const status = varianceAmount === 0 ? "matched" : "variance";
    items.push({
      id: nextId(state, "reconciliationItem", "mock_recon_item"),
      runId,
      siteId: input.siteId,
      itemType: "wallet_balance_snapshot",
      sourceType: "mock_account",
      sourceId: account.id,
      ledgerEntryId: null,
      status,
      varianceAmount,
      currency: account.currency,
      reason: status === "matched" ? "mock balance matched ledger sum" : "mock balance variance",
      createdAt: nowIso(),
    });
  }

  const stalePending = state.ledgerTransactions.filter(
    (transaction) => transaction.siteId === input.siteId && transaction.status === "pending"
  );
  for (const transaction of stalePending) {
    items.push({
      id: nextId(state, "reconciliationItem", "mock_recon_item"),
      runId,
      siteId: input.siteId,
      itemType: "stale_pending_mock",
      sourceType: transaction.sourceType,
      sourceId: transaction.sourceId,
      ledgerEntryId: null,
      status: "stale",
      varianceAmount: 0,
      currency: transaction.currency,
      reason: "mock pending transaction requires review",
      createdAt: nowIso(),
    });
  }

  const unmatched = state.ledgerEntries.filter(
    (entry) => entry.siteId === input.siteId && entry.reconciliationStatus === "unmatched"
  );
  for (const entry of unmatched) {
    items.push({
      id: nextId(state, "reconciliationItem", "mock_recon_item"),
      runId,
      siteId: input.siteId,
      itemType: "unmatched_entry_mock",
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      ledgerEntryId: entry.id,
      status: "unmatched",
      varianceAmount: entry.amount,
      currency: entry.currency,
      reason: "mock unmatched ledger entry",
      createdAt: nowIso(),
    });
  }

  const summary = {
    walletBalanceSnapshotCount: accounts.length,
    matchedCount: items.filter((item) => item.status === "matched").length,
    varianceCount: items.filter((item) => item.status === "variance").length,
    stalePendingCount: items.filter((item) => item.status === "stale").length,
    unmatchedCount: items.filter((item) => item.status === "unmatched").length,
    depositCreditedVsStatementMock: {
      creditedCount: state.ledgerTransactions.filter((item) => item.transactionType === "deposit.credited").length,
      statementMockCount: Array.isArray(input.statementMockDeposits) ? input.statementMockDeposits.length : 0,
    },
    withdrawReservedApprovedPaidMock: {
      reservedCount: state.ledgerTransactions.filter((item) => item.transactionType === "withdraw.reserved").length,
      approvedCount: state.ledgerTransactions.filter((item) => item.transactionType === "withdraw.approved").length,
      paidMockCount: state.ledgerTransactions.filter((item) => item.transactionType === "withdraw.paid_mock").length,
    },
    adminAdjustmentVarianceCount: state.ledgerTransactions.filter((item) => item.transactionType.startsWith("admin."))
      .length,
    providerCallbackVarianceCount: state.ledgerTransactions.filter(
      (item) => item.transactionType === "provider.callback.adjustment"
    ).length,
    luckyWheelRewardLiabilityCount: state.ledgerTransactions.filter((item) => item.transactionType.startsWith("wheel."))
      .length,
  };
  const status = summary.varianceCount === 0 && summary.unmatchedCount === 0 ? "matched" : "mismatch";
  const run = {
    id: runId,
    siteId: input.siteId,
    runType: input.runType || "mock_financial_ledger",
    status,
    startedAt: nowIso(),
    completedAt: nowIso(),
    summarySnapshot: sanitizeAuditSnapshot(summary),
  };
  state.reconciliationRuns.push(run);
  state.reconciliationItems.push(...items);
  return ok({ run: clone(run), items: clone(items), summary: clone(summary) });
}

module.exports = {
  createMockLedgerState,
  createLedgerAccount,
  getAccountBalance,
  applyMockLedgerTransaction,
  applyMockDepositCredit,
  applyMockWithdrawReserve,
  applyMockWithdrawPaidMock,
  applyMockReversal,
  requestMockAdminAdjustment,
  approveMockAdminAdjustment,
  rejectMockAdminAdjustment,
  applyMockWheelRewardAwarded,
  applyMockProviderCallbackAdjustment,
  runMockReconciliation,
  sanitizeAuditSnapshot,
  maskIpAddress,
  hashUserAgent,
  assertNoLiveMoneyBoundary,
  assertNoSecretLeak,
};
