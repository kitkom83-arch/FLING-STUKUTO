"use strict";

const crypto = require("crypto");

const OROPLAY_CALLBACK_RUNTIME_SIMULATION_STATUS = Object.freeze({
  phase: "ORO-3A",
  status: "callback runtime simulation only",
  runtimeEnabled: false,
  noLiveRuntime: true,
  noProductionDb: true,
  noRealMoney: true,
  noLiveOroplayApi: true,
  noExternalNetwork: true,
  noClientSecret: true,
  runtimeWalletMutation: false,
  runtimeLedgerMutation: false,
  prismaWrite: false,
  previousPhase: "ORO-2C closed; readiness contract is satisfied",
  nextPhase: "ORO-3B blocked until runtime simulation smoke passes and safety gates are approved",
});

const DEFAULT_MOCK_STATE = Object.freeze({
  members: Object.freeze({
    ORO_VALID_001: Object.freeze({
      memberId: "pg77-member-001",
      status: "active",
      blocked: false,
      mockBalance: 1000,
    }),
    ORO_BLOCKED_001: Object.freeze({
      memberId: "pg77-member-blocked",
      status: "active",
      blocked: true,
      mockBalance: 1000,
    }),
    ORO_INACTIVE_001: Object.freeze({
      memberId: "pg77-member-inactive",
      status: "inactive",
      blocked: false,
      mockBalance: 1000,
    }),
    ORO_LOW_BAL_001: Object.freeze({
      memberId: "pg77-member-low-balance",
      status: "active",
      blocked: false,
      mockBalance: 5,
    }),
  }),
  transactions: Object.freeze({}),
  finishedRounds: Object.freeze({}),
});

const SAFE_USER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const SAFE_TRANSACTION_CODE_PATTERN = /^[A-Za-z0-9_.:-]{3,96}$/;
const SUPPORTED_TRANSACTION_TYPES = new Set(["bet", "win", "rollback", "settle", "adjustment"]);
const SENSITIVE_KEY_MARKERS = Object.freeze([
  "authorization",
  "authorizationheader",
  "credential",
  "password",
  "secret",
  "token",
  "clientsecret",
  "databaseurl",
  "pin",
  "deviceid",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneState(state) {
  const source = state && typeof state === "object" ? state : DEFAULT_MOCK_STATE;
  return {
    members: clone(source.members || DEFAULT_MOCK_STATE.members),
    transactions: clone(source.transactions || {}),
    finishedRounds: clone(source.finishedRounds || {}),
  };
}

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  const normalized = normalizeKey(key);
  if (normalized.startsWith("no")) return false;
  return SENSITIVE_KEY_MARKERS.some((marker) => normalized === marker || normalized.includes(marker));
}

function sanitizeString(value) {
  const text = String(value || "");
  if (/^basic\s+/i.test(text)) return "[REDACTED_AUTH]";
  if (/^bearer\s+/i.test(text)) return "[REDACTED_AUTH]";
  if (/\bpostgres(?:ql)?:\/\/[^\s]+/i.test(text)) return "[REDACTED_DB_URL]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) {
    return "[REDACTED_TOKEN]";
  }
  return value;
}

function sanitizeOroplayRuntimeLogPreview(value) {
  if (Array.isArray(value)) return value.map(sanitizeOroplayRuntimeLogPreview);
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? sanitizeString(value) : value;
  }

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    sanitized[key] = sanitizeOroplayRuntimeLogPreview(nested);
  }
  return sanitized;
}

function stableHash(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

function maskValue(value) {
  const text = String(value || "");
  if (!text) return null;
  if (text.length <= 4) return `${text[0] || ""}***`;
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
}

function buildRuntimeSafety() {
  return {
    noProductionDb: true,
    noRealMoney: true,
    noLiveOroplayApi: true,
    noExternalNetwork: true,
    noClientSecret: true,
    runtimeWalletMutation: false,
    runtimeLedgerMutation: false,
    prismaWrite: false,
    adapterBoundary: "mock_decision_only",
  };
}

function buildLogPreview(payload, decision, callbackType) {
  const candidate = payload && typeof payload === "object" ? payload : {};
  return sanitizeOroplayRuntimeLogPreview({
    requestId: candidate.requestId || "mock-runtime-request",
    route: callbackType === "transaction" ? "/api/oroplay/transaction" : "/api/oroplay/balance",
    eventType: `oroplay_${callbackType}_runtime_simulation`,
    callbackType,
    userCodeMasked: maskValue(candidate.userCode),
    userCodeHash: stableHash(candidate.userCode),
    transactionCodeMasked: maskValue(candidate.transactionCode),
    transactionCodeHash: stableHash(candidate.transactionCode),
    decision,
    bodyLogged: false,
    rawBodyDropped: true,
  });
}

function failClosed(reason, payload, callbackType, extra = {}) {
  return {
    phase: "ORO-3A",
    callbackType,
    decision: "fail_closed",
    reason,
    failClosed: true,
    manualReview: extra.manualReview === true,
    ledgerIntent: null,
    reconciliationIntent: null,
    runtimeWalletMutation: false,
    runtimeLedgerMutation: false,
    prismaWrite: false,
    safety: buildRuntimeSafety(),
    logPreview: buildLogPreview(payload, "fail_closed", callbackType),
    ...extra,
  };
}

function validateUserCode(userCode) {
  if (typeof userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(userCode.trim())) {
    return { ok: false, reason: "malformed_payload" };
  }
  return { ok: true, normalized: userCode.trim() };
}

function validateTransactionPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, reason: "malformed_payload" };
  }

  const userCode = validateUserCode(payload.userCode);
  if (!userCode.ok) return userCode;

  if (typeof payload.transactionCode !== "string" || !SAFE_TRANSACTION_CODE_PATTERN.test(payload.transactionCode.trim())) {
    return { ok: false, reason: "malformed_payload" };
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount === 0) return { ok: false, reason: "malformed_payload" };

  const transactionType = String(payload.transactionType || "").trim().toLowerCase();
  if (!SUPPORTED_TRANSACTION_TYPES.has(transactionType)) {
    return { ok: false, reason: "unsupported_transaction_type" };
  }

  return {
    ok: true,
    userCode: userCode.normalized,
    transactionCode: payload.transactionCode.trim(),
    amount,
    roundId: payload.roundId ? String(payload.roundId) : null,
    isFinished: payload.isFinished === true,
    transactionType,
  };
}

function mapMockMember(userCode, state) {
  const member = state.members[userCode];
  if (!member) return { ok: false, reason: "unknown_userCode" };
  if (member.blocked === true) return { ok: false, reason: "blocked_member" };
  if (member.status !== "active") return { ok: false, reason: "inactive_member" };
  return { ok: true, member: clone(member) };
}

function transactionFingerprint(payload) {
  return JSON.stringify({
    userCode: payload.userCode,
    transactionCode: payload.transactionCode,
    amount: Number(payload.amount),
    roundId: payload.roundId || null,
    isFinished: payload.isFinished === true,
    transactionType: payload.transactionType || null,
  });
}

function simulateOroplayRuntimeIdempotencyDecision(payload, state = DEFAULT_MOCK_STATE) {
  const validation = validateTransactionPayload(payload);
  const nextState = cloneState(state);
  if (!validation.ok) {
    return {
      decision: "fail_closed",
      reason: validation.reason,
      failClosed: true,
      manualReview: false,
      nextState,
      ledgerIntentAllowed: false,
    };
  }

  if (validation.roundId && nextState.finishedRounds[validation.roundId]) {
    return {
      decision: "fail_closed",
      reason: "finished_round_replay",
      failClosed: true,
      manualReview: false,
      nextState,
      ledgerIntentAllowed: false,
    };
  }

  const previous = nextState.transactions[validation.transactionCode];
  const currentFingerprint = transactionFingerprint(payload);
  if (previous) {
    if (previous.fingerprint === currentFingerprint) {
      return {
        decision: "idempotent_replay",
        reason: "duplicate_transactionCode_same_payload",
        failClosed: false,
        manualReview: false,
        nextState,
        ledgerIntentAllowed: false,
      };
    }

    return {
      decision: "manual_review",
      reason: "conflicting_duplicate_transactionCode",
      failClosed: true,
      manualReview: true,
      nextState,
      ledgerIntentAllowed: false,
    };
  }

  nextState.transactions[validation.transactionCode] = {
    fingerprint: currentFingerprint,
    transactionType: validation.transactionType,
    roundId: validation.roundId,
  };
  if (validation.roundId && validation.isFinished) {
    nextState.finishedRounds[validation.roundId] = true;
  }

  return {
    decision: "new_transaction_decision",
    reason: "new_transactionCode",
    failClosed: false,
    manualReview: false,
    nextState,
    ledgerIntentAllowed: true,
  };
}

function simulateOroplayBalanceCallback(payload, state = DEFAULT_MOCK_STATE) {
  const workingState = cloneState(state);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return failClosed("malformed_payload", payload, "balance", { nextState: workingState });
  }

  const userCode = validateUserCode(payload.userCode);
  if (!userCode.ok) return failClosed(userCode.reason, payload, "balance", { nextState: workingState });

  const memberMapping = mapMockMember(userCode.normalized, workingState);
  if (!memberMapping.ok) return failClosed(memberMapping.reason, payload, "balance", { nextState: workingState });

  return {
    phase: "ORO-3A",
    callbackType: "balance",
    decision: "mock_balance_available",
    reason: "mock_member_balance_read",
    failClosed: false,
    manualReview: false,
    mappedMemberId: memberMapping.member.memberId,
    mockBalance: memberMapping.member.mockBalance,
    ledgerIntent: null,
    reconciliationIntent: null,
    nextState: workingState,
    runtimeWalletMutation: false,
    runtimeLedgerMutation: false,
    prismaWrite: false,
    safety: buildRuntimeSafety(),
    logPreview: buildLogPreview(payload, "mock_balance_available", "balance"),
  };
}

function simulateOroplayRuntimeLedgerIntent(payload, member) {
  const amount = Number(payload.amount);
  const direction = amount < 0 ? "bet_decrease_intent" : "win_increase_intent";
  return {
    kind: "mock_ledger_intent",
    phase: "ORO-3A",
    memberId: member.memberId,
    userCodeHash: stableHash(payload.userCode),
    transactionCodeHash: stableHash(payload.transactionCode),
    transactionType: payload.transactionType,
    roundId: payload.roundId || null,
    amount,
    direction,
    runtimeWrite: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
  };
}

function buildReconciliationIntent(payload, member) {
  return {
    kind: "mock_reconciliation_intent",
    phase: "ORO-3A",
    memberId: member.memberId,
    transactionCodeHash: stableHash(payload.transactionCode),
    roundId: payload.roundId || null,
    runtimeWrite: false,
    requiresFutureAuditTrail: true,
  };
}

function simulateOroplayTransactionCallback(payload, state = DEFAULT_MOCK_STATE) {
  const workingState = cloneState(state);
  const validation = validateTransactionPayload(payload);
  if (!validation.ok) return failClosed(validation.reason, payload, "transaction", { nextState: workingState });

  const memberMapping = mapMockMember(validation.userCode, workingState);
  if (!memberMapping.ok) return failClosed(memberMapping.reason, payload, "transaction", { nextState: workingState });

  const idempotency = simulateOroplayRuntimeIdempotencyDecision(payload, workingState);
  if (idempotency.failClosed || idempotency.decision === "idempotent_replay") {
    return {
      phase: "ORO-3A",
      callbackType: "transaction",
      decision: idempotency.decision,
      reason: idempotency.reason,
      failClosed: idempotency.failClosed,
      manualReview: idempotency.manualReview,
      mappedMemberId: memberMapping.member.memberId,
      ledgerIntent: null,
      reconciliationIntent: null,
      nextState: idempotency.nextState,
      runtimeWalletMutation: false,
      runtimeLedgerMutation: false,
      prismaWrite: false,
      safety: buildRuntimeSafety(),
      logPreview: buildLogPreview(payload, idempotency.decision, "transaction"),
    };
  }

  if (validation.transactionType === "bet" && memberMapping.member.mockBalance < Math.abs(validation.amount)) {
    return failClosed("insufficient_balance", payload, "transaction", {
      mappedMemberId: memberMapping.member.memberId,
      nextState: workingState,
    });
  }

  return {
    phase: "ORO-3A",
    callbackType: "transaction",
    decision: "ledger_intent_only",
    reason: `${validation.transactionType}_transaction_simulated`,
    failClosed: false,
    manualReview: false,
    mappedMemberId: memberMapping.member.memberId,
    ledgerIntent: simulateOroplayRuntimeLedgerIntent(validation, memberMapping.member),
    reconciliationIntent: buildReconciliationIntent(validation, memberMapping.member),
    nextState: idempotency.nextState,
    runtimeWalletMutation: false,
    runtimeLedgerMutation: false,
    prismaWrite: false,
    safety: buildRuntimeSafety(),
    logPreview: buildLogPreview(payload, "ledger_intent_only", "transaction"),
  };
}

function buildOroplayRuntimeSimulationSummary() {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SIMULATION_STATUS.phase,
    status: OROPLAY_CALLBACK_RUNTIME_SIMULATION_STATUS.status,
    runtimeEnabled: false,
    noLiveRuntime: true,
    balanceSimulation: "mock_state_read_only",
    transactionSimulation: "decision_and_intent_only",
    idempotencySimulation: "mock_state_only_no_double_intent",
    ledgerBoundary: "ledgerIntent and reconciliationIntent only",
    oro2bFailClosedRemainsDefault: true,
    providerAliasesEnabled: false,
    safety: buildRuntimeSafety(),
  };
}

function validateOroplayRuntimeSimulationContract() {
  const errors = [];
  const status = OROPLAY_CALLBACK_RUNTIME_SIMULATION_STATUS;
  const safety = buildRuntimeSafety();
  const summary = buildOroplayRuntimeSimulationSummary();

  if (status.runtimeEnabled !== false) errors.push("runtime must remain disabled.");
  if (status.noLiveRuntime !== true) errors.push("live runtime must remain blocked.");
  if (safety.runtimeWalletMutation !== false) errors.push("runtime wallet mutation must be false.");
  if (safety.runtimeLedgerMutation !== false) errors.push("runtime ledger mutation must be false.");
  if (safety.prismaWrite !== false) errors.push("Prisma write must be false.");
  if (summary.providerAliasesEnabled !== false) errors.push("provider aliases must remain disabled.");
  if (summary.oro2bFailClosedRemainsDefault !== true) errors.push("ORO-2B fail-closed default must remain true.");

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_SIMULATION_STATUS,
  DEFAULT_MOCK_STATE,
  buildOroplayRuntimeSimulationSummary,
  sanitizeOroplayRuntimeLogPreview,
  simulateOroplayBalanceCallback,
  simulateOroplayRuntimeIdempotencyDecision,
  simulateOroplayRuntimeLedgerIntent,
  simulateOroplayTransactionCallback,
  validateOroplayRuntimeSimulationContract,
};
