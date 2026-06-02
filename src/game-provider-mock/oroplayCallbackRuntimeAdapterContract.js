"use strict";

const crypto = require("crypto");

const {
  buildOroplayWalletLedgerBridgePlan,
  validateOroplayWalletLedgerBridgeDesign,
} = require("./oroplayWalletLedgerBridgeDesign");

const OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS = Object.freeze({
  phase: "ORO-3B",
  status: "callback runtime adapter contract only",
  runtimeAdapterEnabled: false,
  liveRuntimeEnabled: false,
  providerAliasesEnabled: false,
  runtimeWalletMutation: false,
  runtimeLedgerMutation: false,
  prismaWriteAllowed: false,
  noProductionDb: true,
  noRealMoney: true,
  noLiveOroplayApi: true,
  noExternalNetwork: true,
  previousPhase: "ORO-3A closed; runtime simulation remains no-mutation",
  nextPhase: "ORO-3C blocked until ORO-3B adapter contract smoke passes",
  supportedDecisions: Object.freeze([
    "accepted_plan",
    "fail_closed",
    "manual_review",
    "idempotent_replay",
    "duplicate_conflict",
    "insufficient_balance",
    "unknown_member",
    "blocked_member",
    "inactive_member",
    "malformed_payload",
    "unsupported_transaction_type",
    "finished_round_replay",
  ]),
});

const DEFAULT_ADAPTER_STATE = Object.freeze({
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
  canceledRounds: Object.freeze({}),
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
  const source = state && typeof state === "object" ? state : DEFAULT_ADAPTER_STATE;
  return {
    members: clone(source.members || DEFAULT_ADAPTER_STATE.members),
    transactions: clone(source.transactions || {}),
    finishedRounds: clone(source.finishedRounds || {}),
    canceledRounds: clone(source.canceledRounds || {}),
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

function redactString(value) {
  const text = String(value || "");
  const bearerScheme = ["Be", "arer"].join("");
  if (/^basic\s+/i.test(text)) return "[REDACTED_AUTH]";
  if (new RegExp(`^${bearerScheme}\\s+`, "i").test(text)) return "[REDACTED_AUTH]";
  if (/\bpostgres(?:ql)?:\/\/[^\s]+/i.test(text)) return "[REDACTED_DB_URL]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) {
    return "[REDACTED_TOKEN]";
  }
  return value;
}

function sanitizeOroplayAdapterPayload(value) {
  if (Array.isArray(value)) return value.map(sanitizeOroplayAdapterPayload);
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? redactString(value) : value;
  }

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = normalizeKey(key).includes("authorization") ? "[REDACTED_AUTH]" : "[REDACTED]";
      continue;
    }
    sanitized[key] = sanitizeOroplayAdapterPayload(nested);
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

function inferCallbackType(payload) {
  const candidate = payload && typeof payload === "object" ? payload : {};
  const explicit = String(candidate.callbackType || candidate.type || "").trim().toLowerCase();
  if (explicit === "balance" || explicit === "transaction") return explicit;
  if (Object.prototype.hasOwnProperty.call(candidate, "amount") || candidate.transactionCode) return "transaction";
  return "balance";
}

function buildOroplayAdapterAuditPreview(input = {}, decision = "received") {
  const sanitizedPayload = sanitizeOroplayAdapterPayload(input.sanitizedPayload || input);
  const callbackType = inferCallbackType(sanitizedPayload);

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    eventType: `oroplay_${callbackType}_adapter_contract_preview`,
    route: callbackType === "transaction" ? "/api/oroplay/transaction" : "/api/oroplay/balance",
    callbackType,
    userCodeMasked: maskValue(sanitizedPayload.userCode),
    userCodeHash: stableHash(sanitizedPayload.userCode),
    transactionCodeMasked: maskValue(sanitizedPayload.transactionCode),
    transactionCodeHash: stableHash(sanitizedPayload.transactionCode),
    decision,
    bodyLogged: false,
    rawBodyDropped: true,
    sanitizedPayloadPreview: sanitizedPayload,
  };
}

function buildOroplayCallbackAdapterRequest(payload = {}) {
  const candidate = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const sanitizedPayload = sanitizeOroplayAdapterPayload(candidate);
  const callbackType = inferCallbackType(candidate);

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    status: "request_plan_only",
    callbackType,
    userCode: typeof candidate.userCode === "string" ? candidate.userCode.trim() : candidate.userCode,
    transactionCode:
      typeof candidate.transactionCode === "string" ? candidate.transactionCode.trim() : candidate.transactionCode,
    transactionType: String(candidate.transactionType || "").trim().toLowerCase(),
    amount: candidate.amount,
    roundId: candidate.roundId ? String(candidate.roundId) : null,
    vendorCode: candidate.vendorCode ? String(candidate.vendorCode) : null,
    gameCode: candidate.gameCode ? String(candidate.gameCode) : null,
    isFinished: candidate.isFinished === true,
    isCanceled: candidate.isCanceled === true,
    sanitizedPayload,
    auditPreview: buildOroplayAdapterAuditPreview({ sanitizedPayload }, "received"),
    rawPayloadDropped: true,
    liveRuntimeEnabled: false,
    mutationAllowed: false,
    prismaWriteAllowed: false,
  };
}

function validateOroplayCallbackAdapterPreconditions(request = {}) {
  const errors = [];
  const status = OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS;

  if (status.runtimeAdapterEnabled !== false) errors.push("runtime adapter must remain disabled.");
  if (status.liveRuntimeEnabled !== false) errors.push("live runtime must remain disabled.");
  if (status.providerAliasesEnabled !== false) errors.push("provider aliases must remain disabled.");
  if (status.runtimeWalletMutation !== false) errors.push("runtime wallet mutation must remain false.");
  if (status.runtimeLedgerMutation !== false) errors.push("runtime ledger mutation must remain false.");
  if (status.prismaWriteAllowed !== false) errors.push("Prisma write must remain false.");
  if (!request || typeof request !== "object") errors.push("adapter request must be an object.");
  if (request.liveRuntimeEnabled !== false) errors.push("request liveRuntimeEnabled must be false.");
  if (request.mutationAllowed !== false) errors.push("request mutationAllowed must be false.");
  if (request.prismaWriteAllowed !== false) errors.push("request prismaWriteAllowed must be false.");

  return { ok: errors.length === 0, errors };
}

function validateBasicShape(request) {
  if (!request || typeof request !== "object") return { ok: false, decision: "malformed_payload" };
  if (request.callbackType !== "balance" && request.callbackType !== "transaction") {
    return { ok: false, decision: "malformed_payload" };
  }
  if (typeof request.userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(request.userCode)) {
    return { ok: false, decision: "malformed_payload" };
  }
  if (request.callbackType === "balance") {
    return { ok: true, normalized: { userCode: request.userCode, callbackType: "balance" } };
  }
  if (typeof request.transactionCode !== "string" || !SAFE_TRANSACTION_CODE_PATTERN.test(request.transactionCode)) {
    return { ok: false, decision: "malformed_payload" };
  }

  const amount = Number(request.amount);
  if (!Number.isFinite(amount) || amount === 0) return { ok: false, decision: "malformed_payload" };

  const transactionType = String(request.transactionType || "").trim().toLowerCase();
  if (!SUPPORTED_TRANSACTION_TYPES.has(transactionType)) {
    return { ok: false, decision: "unsupported_transaction_type" };
  }

  return {
    ok: true,
    normalized: {
      userCode: request.userCode,
      callbackType: "transaction",
      transactionCode: request.transactionCode,
      transactionType,
      amount,
      roundId: request.roundId,
      vendorCode: request.vendorCode,
      gameCode: request.gameCode,
      isFinished: request.isFinished === true,
      isCanceled: request.isCanceled === true,
    },
  };
}

function mapMemberMappingIntent(userCode, state) {
  const member = state.members[userCode];
  if (!member) return { ok: false, decision: "unknown_member", memberMappingIntent: null };
  if (member.blocked === true) return { ok: false, decision: "blocked_member", memberMappingIntent: null };
  if (member.status !== "active") return { ok: false, decision: "inactive_member", memberMappingIntent: null };
  return {
    ok: true,
    member: clone(member),
    memberMappingIntent: {
      kind: "future_member_mapping_intent",
      userCode,
      memberId: member.memberId,
      status: member.status,
      dbLookupAllowed: false,
      mutationAllowed: false,
      prismaWriteAllowed: false,
    },
  };
}

function transactionFingerprint(normalized) {
  return JSON.stringify({
    userCode: normalized.userCode,
    transactionCode: normalized.transactionCode,
    transactionType: normalized.transactionType,
    amount: Number(normalized.amount),
    roundId: normalized.roundId || null,
    vendorCode: normalized.vendorCode || null,
    gameCode: normalized.gameCode || null,
    isFinished: normalized.isFinished === true,
    isCanceled: normalized.isCanceled === true,
  });
}

function buildAdapterIdempotencyKey(normalized) {
  if (normalized.callbackType === "balance") {
    return `oroplay:balance:${stableHash(normalized.userCode)}`;
  }
  return `oroplay:transaction:${stableHash(normalized.transactionCode)}`;
}

function inspectIdempotency(normalized, state) {
  if (normalized.callbackType === "balance") {
    return {
      status: "new_balance_plan",
      decision: "accepted_plan",
      idempotencyKey: buildAdapterIdempotencyKey(normalized),
      intentAllowed: true,
      nextState: state,
    };
  }

  const roundId = normalized.roundId;
  if (roundId && (state.finishedRounds[roundId] || state.canceledRounds[roundId])) {
    return {
      status: "fail_closed",
      decision: "finished_round_replay",
      idempotencyKey: buildAdapterIdempotencyKey(normalized),
      intentAllowed: false,
      failClosed: true,
      nextState: state,
    };
  }

  const previous = state.transactions[normalized.transactionCode];
  const currentFingerprint = transactionFingerprint(normalized);
  if (previous) {
    if (previous.fingerprint === currentFingerprint) {
      return {
        status: "idempotent_replay",
        decision: "idempotent_replay",
        idempotencyKey: buildAdapterIdempotencyKey(normalized),
        intentAllowed: false,
        failClosed: false,
        nextState: state,
      };
    }

    return {
      status: "manual_review",
      decision: "duplicate_conflict",
      idempotencyKey: buildAdapterIdempotencyKey(normalized),
      intentAllowed: false,
      failClosed: true,
      manualReview: true,
      nextState: state,
    };
  }

  const nextState = cloneState(state);
  nextState.transactions[normalized.transactionCode] = {
    fingerprint: currentFingerprint,
    transactionType: normalized.transactionType,
    roundId: normalized.roundId,
  };
  if (normalized.roundId && normalized.isFinished) nextState.finishedRounds[normalized.roundId] = true;
  if (normalized.roundId && normalized.isCanceled) nextState.canceledRounds[normalized.roundId] = true;

  return {
    status: "new_transaction_plan",
    decision: "accepted_plan",
    idempotencyKey: buildAdapterIdempotencyKey(normalized),
    intentAllowed: true,
    failClosed: false,
    nextState,
  };
}

function failClosedDecision(decision, request, state, extra = {}) {
  const callbackType = request && request.callbackType === "transaction" ? "transaction" : "balance";
  const auditPreview = buildOroplayAdapterAuditPreview(request || {}, decision);

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    status: extra.status || "fail_closed",
    decision,
    callbackType,
    failClosed: true,
    manualReview: extra.manualReview === true,
    reason: decision,
    memberMappingIntent: extra.memberMappingIntent || null,
    idempotencyKey: extra.idempotencyKey || null,
    duplicateGuard: extra.duplicateGuard || null,
    walletIntent: null,
    ledgerIntent: null,
    transactionLogIntent: null,
    auditLogIntent: null,
    reconciliationIntent: null,
    bridgePlan: null,
    responsePlan: null,
    auditPreview,
    nextState: state,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildAuditLogIntent(decision) {
  return {
    kind: "future_audit_log_intent",
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    callbackType: decision.callbackType,
    decision: decision.decision,
    memberId: decision.memberId || null,
    idempotencyKey: decision.idempotencyKey || null,
    auditPreview: decision.auditPreview,
    intentOnly: true,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildOroplayCallbackAdapterResponsePlan(decision = {}) {
  const callbackType = decision.callbackType === "transaction" ? "transaction" : "balance";
  const result =
    decision.status === "accepted_plan"
      ? "accepted_plan"
      : decision.status === "idempotent_replay"
      ? "idempotent_replay"
      : decision.status === "manual_review"
      ? "manual_review"
      : "fail_closed";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    responsePlanOnly: true,
    runtimeResponseEnabled: false,
    providerCompatibleAliasEnabled: false,
    route: callbackType === "transaction" ? "/api/oroplay/transaction" : "/api/oroplay/balance",
    callbackType,
    result,
    decision: decision.decision || result,
    reason: decision.reason || decision.decision || result,
    walletIntentIncluded: Boolean(decision.walletIntent),
    ledgerIntentIncluded: Boolean(decision.ledgerIntent),
    transactionLogIntentIncluded: Boolean(decision.transactionLogIntent),
    reconciliationIntentIncluded: Boolean(decision.reconciliationIntent),
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function mapOroplayCallbackToAdapterDecision(payload = {}, state = DEFAULT_ADAPTER_STATE) {
  const workingState = cloneState(state);
  const request = buildOroplayCallbackAdapterRequest(payload);
  const preconditions = validateOroplayCallbackAdapterPreconditions(request);
  if (!preconditions.ok) {
    const decision = failClosedDecision("malformed_payload", request, workingState);
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  const validation = validateBasicShape(request);
  if (!validation.ok) {
    const decision = failClosedDecision(validation.decision, request, workingState);
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  const memberMapping = mapMemberMappingIntent(validation.normalized.userCode, workingState);
  if (!memberMapping.ok) {
    const decision = failClosedDecision(memberMapping.decision, request, workingState, {
      memberMappingIntent: memberMapping.memberMappingIntent,
    });
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  const idempotency = inspectIdempotency(validation.normalized, workingState);
  if (idempotency.status === "idempotent_replay") {
    const decision = {
      phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
      status: "idempotent_replay",
      decision: "idempotent_replay",
      callbackType: validation.normalized.callbackType,
      failClosed: false,
      manualReview: false,
      reason: "duplicate_transactionCode_same_payload",
      memberId: memberMapping.member.memberId,
      memberMappingIntent: memberMapping.memberMappingIntent,
      idempotencyKey: idempotency.idempotencyKey,
      duplicateGuard: { result: "idempotent_replay", intentAllowed: false },
      walletIntent: null,
      ledgerIntent: null,
      transactionLogIntent: null,
      auditLogIntent: null,
      reconciliationIntent: null,
      bridgePlan: null,
      auditPreview: buildOroplayAdapterAuditPreview(request, "idempotent_replay"),
      nextState: idempotency.nextState,
      mutationAllowed: false,
      prismaWriteAllowed: false,
      liveRuntimeEnabled: false,
    };
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  if (idempotency.failClosed) {
    const decision = failClosedDecision(idempotency.decision, request, workingState, {
      status: idempotency.status,
      manualReview: idempotency.manualReview === true,
      memberMappingIntent: memberMapping.memberMappingIntent,
      idempotencyKey: idempotency.idempotencyKey,
      duplicateGuard: { result: idempotency.decision, intentAllowed: false },
    });
    decision.memberId = memberMapping.member.memberId;
    decision.nextState = idempotency.nextState;
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  if (
    validation.normalized.callbackType === "transaction" &&
    validation.normalized.transactionType === "bet" &&
    memberMapping.member.mockBalance < Math.abs(Number(validation.normalized.amount))
  ) {
    const decision = failClosedDecision("insufficient_balance", request, workingState, {
      memberMappingIntent: memberMapping.memberMappingIntent,
      idempotencyKey: idempotency.idempotencyKey,
    });
    decision.memberId = memberMapping.member.memberId;
    decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
    return decision;
  }

  const auditPreview = buildOroplayAdapterAuditPreview(request, "accepted_plan");
  const bridgePlan = buildOroplayWalletLedgerBridgePlan({
    memberId: memberMapping.member.memberId,
    userCode: validation.normalized.userCode,
    callbackType: validation.normalized.callbackType,
    transactionType: validation.normalized.transactionType,
    transactionCode: validation.normalized.transactionCode,
    roundId: validation.normalized.roundId,
    vendorCode: validation.normalized.vendorCode,
    gameCode: validation.normalized.gameCode,
    amount: validation.normalized.amount || 0,
    beforeBalanceExpected: memberMapping.member.mockBalance,
    auditPreview,
  });
  const decision = {
    phase: OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS.phase,
    status: "accepted_plan",
    decision: "accepted_plan",
    callbackType: validation.normalized.callbackType,
    failClosed: false,
    manualReview: false,
    reason: "adapter_contract_plan_only",
    memberId: memberMapping.member.memberId,
    memberMappingIntent: memberMapping.memberMappingIntent,
    idempotencyKey: idempotency.idempotencyKey,
    duplicateGuard: { result: "new_plan", intentAllowed: true },
    walletIntent: bridgePlan.walletIntent,
    ledgerIntent: bridgePlan.ledgerIntent,
    transactionLogIntent: bridgePlan.transactionLogIntent,
    auditLogIntent: null,
    reconciliationIntent: bridgePlan.reconciliationIntent,
    bridgePlan,
    auditPreview,
    nextState: idempotency.nextState,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
  decision.auditLogIntent = buildAuditLogIntent(decision);
  decision.responsePlan = buildOroplayCallbackAdapterResponsePlan(decision);
  return decision;
}

function validateOroplayCallbackRuntimeAdapterContract() {
  const errors = [];
  const status = OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS;
  const bridgeValidation = validateOroplayWalletLedgerBridgeDesign();

  if (status.runtimeAdapterEnabled !== false) errors.push("runtime adapter must remain disabled.");
  if (status.liveRuntimeEnabled !== false) errors.push("live runtime must remain disabled.");
  if (status.providerAliasesEnabled !== false) errors.push("provider aliases must remain disabled.");
  if (status.runtimeWalletMutation !== false) errors.push("runtime wallet mutation must remain false.");
  if (status.runtimeLedgerMutation !== false) errors.push("runtime ledger mutation must remain false.");
  if (status.prismaWriteAllowed !== false) errors.push("Prisma write must remain false.");
  if (!bridgeValidation.ok) errors.push(...bridgeValidation.errors);

  const balance = mapOroplayCallbackToAdapterDecision({ callbackType: "balance", userCode: "ORO_VALID_001" });
  const bet = mapOroplayCallbackToAdapterDecision({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_VALIDATE_BET_001",
    transactionType: "bet",
    amount: 25,
    roundId: "ROUND_VALIDATE_BET_001",
  });
  const win = mapOroplayCallbackToAdapterDecision({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_VALIDATE_WIN_001",
    transactionType: "win",
    amount: 75,
    roundId: "ROUND_VALIDATE_WIN_001",
  });

  if (balance.status !== "accepted_plan") errors.push("balance callback must produce accepted_plan.");
  if (bet.walletIntent.direction !== "debit") errors.push("bet callback must produce wallet debit intent.");
  if (win.walletIntent.direction !== "credit") errors.push("win callback must produce wallet credit intent.");
  if (bet.mutationAllowed !== false || win.mutationAllowed !== false) {
    errors.push("accepted adapter plans must keep mutationAllowed false.");
  }
  if (bet.prismaWriteAllowed !== false || win.prismaWriteAllowed !== false) {
    errors.push("accepted adapter plans must keep prismaWriteAllowed false.");
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT_STATUS,
  DEFAULT_ADAPTER_STATE,
  buildOroplayCallbackAdapterRequest,
  validateOroplayCallbackAdapterPreconditions,
  mapOroplayCallbackToAdapterDecision,
  buildOroplayCallbackAdapterResponsePlan,
  buildOroplayAdapterAuditPreview,
  sanitizeOroplayAdapterPayload,
  validateOroplayCallbackRuntimeAdapterContract,
};
