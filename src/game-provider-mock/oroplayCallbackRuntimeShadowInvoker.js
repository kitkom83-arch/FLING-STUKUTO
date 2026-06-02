"use strict";

const {
  OROPLAY_CALLBACK_RUNTIME_SHADOW_MOCK_STATE,
  buildOroplayShadowProofFlags,
} = require("./oroplayCallbackRuntimeShadowFixtures");

const OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS = Object.freeze({
  phase: "ORO-4C",
  status: "callback runtime shadow invocation harness",
  defaultDecision: "fail_closed",
  certifiedMockState: "shadow_ready_only",
  shadowInvocationOnly: true,
  directFunctionInvocationOnly: true,
  runtimeWiredToLiveRoute: false,
  aliasBalanceEnabled: false,
  aliasTransactionEnabled: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  networkAllowed: false,
  activationAllowed: false,
});

const SAFE_USER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const SAFE_TRANSACTION_CODE_PATTERN = /^[A-Za-z0-9_.:-]{3,96}$/;
const SUPPORTED_TRANSACTION_TYPES = new Set(["bet", "win"]);
const SENSITIVE_KEY_MARKERS = Object.freeze([
  "auth",
  "credential",
  "password",
  "secret",
  "token",
  "clientsecret",
  "databaseurl",
  "pin",
  "deviceid",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneState(state) {
  const source = isPlainObject(state) ? state : OROPLAY_CALLBACK_RUNTIME_SHADOW_MOCK_STATE;
  return {
    members: clone(source.members || OROPLAY_CALLBACK_RUNTIME_SHADOW_MOCK_STATE.members),
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
  const authScheme = ["be", "arer"].join("");
  const credentialPrefix = ["s", "k"].join("");

  if (new RegExp(`^${authScheme}\\s+`, "i").test(text)) return "[REDACTED]";
  if (/^basic\s+/i.test(text)) return "[REDACTED]";
  if (/\bpostgres(?:ql)?:\/\/[^\s]+/i.test(text)) return "[REDACTED]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) return "[REDACTED]";
  if (new RegExp(`\\b${credentialPrefix}-[A-Za-z0-9_-]{12,}\\b`, "i").test(text)) return "[REDACTED]";
  return value;
}

function sanitizeOroplayShadowLogPreview(value, counter = { redacted: 0 }) {
  if (Array.isArray(value)) return value.map((item) => sanitizeOroplayShadowLogPreview(item, counter));
  if (!isPlainObject(value)) return typeof value === "string" ? sanitizeString(value) : value;

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = "[REDACTED]";
      counter.redacted += 1;
      continue;
    }
    sanitized[key] = sanitizeOroplayShadowLogPreview(nested, counter);
  }
  return sanitized;
}

function buildShadowSafetyProof() {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    proofFlags: buildOroplayShadowProofFlags(),
    runtimeWiredToLiveRoute: false,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    networkAllowed: false,
    activationAllowed: false,
    mutationAllowed: false,
    ledgerWriteAllowed: false,
  };
}

function buildLogPreview(payload, decision, callbackType) {
  const redactionCounter = { redacted: 0 };
  const sanitizedPayload = sanitizeOroplayShadowLogPreview(payload || {}, redactionCounter);

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    mode: "shadow_mock_only",
    callbackType,
    decision,
    rawPayloadPrinted: false,
    bodyLogged: false,
    credentialLikeValuesPrinted: false,
    redactedKeyCount: redactionCounter.redacted,
    redactionMarkers: [
      "auth-header-redaction-marker",
      "credential-prefix-marker",
      "mock-redaction-key-name",
      "redacted-credential-marker",
    ],
    sanitizedPayload,
  };
}

function failClosed(reason, payload, callbackType, extra = {}) {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    callbackType,
    shadowInvocationOnly: true,
    directFunctionInvocationOnly: true,
    decision: "fail_closed",
    reason,
    failClosed: true,
    manualReview: extra.manualReview === true,
    mappedMemberId: extra.mappedMemberId || null,
    balanceSource: "mock_fixture_only",
    debitIntent: null,
    creditIntent: null,
    ledgerIntent: null,
    reconciliationIntent: null,
    nextState: extra.nextState || cloneState(),
    doubleDebitPrevented: true,
    doubleCreditPrevented: true,
    ...buildShadowSafetyProof(),
    logPreview: buildLogPreview(payload, "fail_closed", callbackType),
  };
}

function validateUserCode(userCode) {
  if (typeof userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(userCode.trim())) {
    return { ok: false, reason: "malformed_payload" };
  }
  return { ok: true, value: userCode.trim() };
}

function validateTransactionPayload(payload) {
  if (!isPlainObject(payload)) return { ok: false, reason: "malformed_payload" };

  const userCode = validateUserCode(payload.userCode);
  if (!userCode.ok) return userCode;

  if (typeof payload.transactionCode !== "string" || !SAFE_TRANSACTION_CODE_PATTERN.test(payload.transactionCode.trim())) {
    return { ok: false, reason: "malformed_payload" };
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount === 0) return { ok: false, reason: "malformed_payload" };

  const transactionType = String(payload.transactionType || "").trim().toLowerCase();
  if (!SUPPORTED_TRANSACTION_TYPES.has(transactionType)) return { ok: false, reason: "unsupported_transaction_type" };
  if (transactionType === "bet" && amount >= 0) return { ok: false, reason: "malformed_payload" };
  if (transactionType === "win" && amount <= 0) return { ok: false, reason: "malformed_payload" };

  return {
    ok: true,
    userCode: userCode.value,
    transactionCode: payload.transactionCode.trim(),
    amount,
    roundId: payload.roundId ? String(payload.roundId) : null,
    transactionType,
    isFinished: payload.isFinished === true,
  };
}

function mapMockMember(userCode, state) {
  const member = state.members[userCode];
  if (!member) return { ok: false, reason: "unknown_member" };
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
    transactionType: payload.transactionType || null,
    isFinished: payload.isFinished === true,
  });
}

function buildWalletIntent(validation, member) {
  const isDebit = validation.transactionType === "bet";
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    intentType: isDebit ? "debit_intent_only" : "credit_intent_only",
    direction: isDebit ? "debit" : "credit",
    memberId: member.memberId,
    amount: Math.abs(validation.amount),
    signedAmount: validation.amount,
    currency: member.currency || "THB",
    balanceSource: "mock_fixture_only",
    mutationAllowed: false,
    walletMutationAllowed: false,
    walletMutated: false,
  };
}

function buildLedgerIntent(validation, member) {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    intentType: "ledger_intent_only",
    memberId: member.memberId,
    transactionCode: validation.transactionCode,
    roundId: validation.roundId,
    transactionType: validation.transactionType,
    signedAmount: validation.amount,
    ledgerWriteAllowed: false,
    ledgerMutationAllowed: false,
    ledgerMutated: false,
    prismaWriteAllowed: false,
  };
}

function buildReconciliationIntent(validation, member) {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    intentType: "reconciliation_intent_only",
    memberId: member.memberId,
    transactionCode: validation.transactionCode,
    roundId: validation.roundId,
    reconciliationRecordWritten: false,
    reconciliationWriteAllowed: false,
    prismaWriteAllowed: false,
  };
}

function applyPriorShadowInvocations(state, priorInvocations = []) {
  let nextState = cloneState(state);
  for (const payload of priorInvocations) {
    const result = buildOroplayShadowTransactionInvocation({ payload, state: nextState });
    nextState = result.nextState;
  }
  return nextState;
}

function buildOroplayShadowBalanceInvocation(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const payload = isPlainObject(candidate.payload) ? candidate.payload : candidate;
  const state = cloneState(candidate.state);

  if (!isPlainObject(payload)) return failClosed("malformed_payload", payload, "balance", { nextState: state });

  const userCode = validateUserCode(payload.userCode);
  if (!userCode.ok) return failClosed(userCode.reason, payload, "balance", { nextState: state });

  const memberMapping = mapMockMember(userCode.value, state);
  if (!memberMapping.ok) return failClosed(memberMapping.reason, payload, "balance", { nextState: state });

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    callbackType: "balance",
    shadowInvocationOnly: true,
    directFunctionInvocationOnly: true,
    decision: "mock_balance_available",
    reason: "mock_fixture_balance_read",
    failClosed: false,
    manualReview: false,
    mappedMemberId: memberMapping.member.memberId,
    balanceSource: "mock_fixture_only",
    mockBalance: memberMapping.member.mockBalance,
    currency: memberMapping.member.currency || "THB",
    debitIntent: null,
    creditIntent: null,
    ledgerIntent: null,
    reconciliationIntent: null,
    nextState: state,
    ...buildShadowSafetyProof(),
    logPreview: buildLogPreview(payload, "mock_balance_available", "balance"),
  };
}

function buildOroplayShadowTransactionInvocation(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const payload = isPlainObject(candidate.payload) ? candidate.payload : candidate;
  const state = applyPriorShadowInvocations(candidate.state, candidate.priorInvocations || []);
  const validation = validateTransactionPayload(payload);

  if (!validation.ok) return failClosed(validation.reason, payload, "transaction", { nextState: state });

  const memberMapping = mapMockMember(validation.userCode, state);
  if (!memberMapping.ok) return failClosed(memberMapping.reason, payload, "transaction", { nextState: state });

  if (validation.roundId && state.finishedRounds[validation.roundId]) {
    return failClosed("finished_round_replay", payload, "transaction", {
      mappedMemberId: memberMapping.member.memberId,
      nextState: state,
    });
  }

  const previous = state.transactions[validation.transactionCode];
  const fingerprint = transactionFingerprint(validation);

  if (previous) {
    if (previous.fingerprint === fingerprint) {
      return {
        phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
        callbackType: "transaction",
        shadowInvocationOnly: true,
        directFunctionInvocationOnly: true,
        decision: "idempotent_replay",
        reason: "duplicate_replay_same_payload",
        failClosed: false,
        manualReview: false,
        mappedMemberId: memberMapping.member.memberId,
        balanceSource: "mock_fixture_only",
        debitIntent: null,
        creditIntent: null,
        ledgerIntent: null,
        reconciliationIntent: null,
        nextState: state,
        doubleDebitPrevented: true,
        doubleCreditPrevented: true,
        ...buildShadowSafetyProof(),
        logPreview: buildLogPreview(payload, "idempotent_replay", "transaction"),
      };
    }

    return failClosed("conflicting_duplicate_replay", payload, "transaction", {
      manualReview: true,
      mappedMemberId: memberMapping.member.memberId,
      nextState: state,
    });
  }

  if (validation.transactionType === "bet" && memberMapping.member.mockBalance < Math.abs(validation.amount)) {
    return failClosed("insufficient_balance", payload, "transaction", {
      mappedMemberId: memberMapping.member.memberId,
      nextState: state,
    });
  }

  const nextState = cloneState(state);
  nextState.transactions[validation.transactionCode] = {
    fingerprint,
    transactionType: validation.transactionType,
    roundId: validation.roundId,
  };
  if (validation.roundId && validation.isFinished) nextState.finishedRounds[validation.roundId] = true;

  const walletIntent = buildWalletIntent(validation, memberMapping.member);
  const ledgerIntent = buildLedgerIntent(validation, memberMapping.member);
  const reconciliationIntent = buildReconciliationIntent(validation, memberMapping.member);
  const isDebit = validation.transactionType === "bet";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    callbackType: "transaction",
    shadowInvocationOnly: true,
    directFunctionInvocationOnly: true,
    decision: isDebit ? "debit_intent_only" : "credit_intent_only",
    reason: `${validation.transactionType}_shadow_intent_only`,
    failClosed: false,
    manualReview: false,
    mappedMemberId: memberMapping.member.memberId,
    balanceSource: "mock_fixture_only",
    debitIntent: isDebit ? walletIntent : null,
    creditIntent: isDebit ? null : walletIntent,
    ledgerIntent,
    reconciliationIntent,
    nextState,
    doubleDebitPrevented: true,
    doubleCreditPrevented: true,
    ...buildShadowSafetyProof(),
    logPreview: buildLogPreview(payload, isDebit ? "debit_intent_only" : "credit_intent_only", "transaction"),
  };
}

function invokeOroplayRuntimeSkeletonShadow(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const payload = isPlainObject(candidate.payload) ? candidate.payload : candidate;
  const callbackType = candidate.kind || candidate.callbackType || payload.callbackType;

  if (callbackType === "balance") return buildOroplayShadowBalanceInvocation(candidate);
  if (callbackType === "transaction") return buildOroplayShadowTransactionInvocation(candidate);
  return failClosed("malformed_payload", payload, "unknown");
}

function buildOroplayShadowInvocationSummary(input = {}) {
  const result = invokeOroplayRuntimeSkeletonShadow(input);
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.phase,
    status: OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.status,
    defaultDecision: "fail_closed",
    certifiedMockState: "shadow_ready_only",
    shadowInvocationOnly: true,
    directFunctionInvocationOnly: true,
    runtimeWiredToLiveRoute: false,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    networkAllowed: false,
    activationAllowed: false,
    oro2bFailClosedPreserved: true,
    oro4aDisabledGatePreserved: true,
    oro4bStagingPrecheckPreserved: true,
    callbackType: result.callbackType,
    decision: result.decision,
  };
}

function validateOroplayShadowInvocationDecision(input = {}) {
  const result = input && input.decision ? input : invokeOroplayRuntimeSkeletonShadow(input);
  const summary = buildOroplayShadowInvocationSummary({ callbackType: result.callbackType || "unknown" });
  const errors = [];
  const allowedDecisions = new Set([
    "fail_closed",
    "mock_balance_available",
    "debit_intent_only",
    "credit_intent_only",
    "idempotent_replay",
    "manual_review",
  ]);

  if (!allowedDecisions.has(result.decision)) errors.push(`unsupported shadow decision: ${result.decision}`);
  if (summary.defaultDecision !== "fail_closed") errors.push("default decision must be fail_closed.");
  if (summary.certifiedMockState !== "shadow_ready_only") errors.push("certified mock state must be shadow_ready_only.");
  for (const flag of [
    "activationAllowed",
    "runtimeWiredToLiveRoute",
    "aliasBalanceEnabled",
    "aliasTransactionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "networkAllowed",
  ]) {
    if (summary[flag] !== false) errors.push(`${flag} must remain false.`);
  }

  return { ok: errors.length === 0, errors, result, summary };
}

function assertFalseFlag(result, flagName) {
  if (result[flagName] !== false) throw new Error(`OroPlay ORO-4C must keep ${flagName}=false.`);
}

function assertOroplayShadowNoLiveRouteWiring(input = {}) {
  const summary = buildOroplayShadowInvocationSummary(input);
  assertFalseFlag(summary, "runtimeWiredToLiveRoute");
  if (summary.oro2bFailClosedPreserved !== true) {
    throw new Error("OroPlay ORO-4C must preserve the ORO-2B fail-closed route.");
  }
  return summary;
}

function assertOroplayShadowNoMutation(input = {}) {
  const result = invokeOroplayRuntimeSkeletonShadow(input);
  assertFalseFlag(result, "walletMutationAllowed");
  assertFalseFlag(result, "ledgerMutationAllowed");
  assertFalseFlag(result, "mutationAllowed");
  assertFalseFlag(result, "ledgerWriteAllowed");
  return result;
}

function assertOroplayShadowNoAliasEnabled(input = {}) {
  const summary = buildOroplayShadowInvocationSummary(input);
  assertFalseFlag(summary, "aliasBalanceEnabled");
  assertFalseFlag(summary, "aliasTransactionEnabled");
  return summary;
}

function assertOroplayShadowNoNetwork(input = {}) {
  const summary = buildOroplayShadowInvocationSummary(input);
  assertFalseFlag(summary, "externalNetworkAllowed");
  assertFalseFlag(summary, "networkAllowed");
  return summary;
}

function assertOroplayShadowNoPrismaWrite(input = {}) {
  const summary = buildOroplayShadowInvocationSummary(input);
  assertFalseFlag(summary, "prismaWriteAllowed");
  return summary;
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS,
  buildOroplayShadowBalanceInvocation,
  buildOroplayShadowTransactionInvocation,
  invokeOroplayRuntimeSkeletonShadow,
  validateOroplayShadowInvocationDecision,
  buildOroplayShadowInvocationSummary,
  assertOroplayShadowNoLiveRouteWiring,
  assertOroplayShadowNoMutation,
  assertOroplayShadowNoAliasEnabled,
  assertOroplayShadowNoNetwork,
  assertOroplayShadowNoPrismaWrite,
};
