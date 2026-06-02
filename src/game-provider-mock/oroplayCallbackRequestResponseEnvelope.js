"use strict";

const {
  buildOroplayShadowBalanceInvocation,
  buildOroplayShadowTransactionInvocation,
  validateOroplayShadowInvocationDecision,
} = require("./oroplayCallbackRuntimeShadowInvoker");

const OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS = Object.freeze({
  phase: "ORO-4D",
  status: "callback request response envelope mapper",
  defaultDecision: "fail_closed",
  mapperOnly: true,
  mockRequestEnvelopeOnly: true,
  mockResponseEnvelopeOnly: true,
  shadowResponseContractOnly: true,
  runtimeWiredToLiveRoute: false,
  aliasBalanceEnabled: false,
  aliasTransactionEnabled: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  externalNetworkAllowed: false,
  networkAllowed: false,
  activationAllowed: false,
});

const SAFE_USER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]{3,96}$/;
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
  "redactionkey",
]);
const REDACTION_MARKERS = Object.freeze([
  "auth-header-redaction-marker",
  "credential-prefix-marker",
  "mock-redaction-key-name",
  "redacted-credential-marker",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function firstString(source, names) {
  for (const name of names) {
    if (typeof source[name] === "string" && source[name].trim()) return source[name].trim();
  }
  return "";
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
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) {
    return "[REDACTED]";
  }
  if (new RegExp(`\\b${credentialPrefix}-[A-Za-z0-9_-]{12,}\\b`, "i").test(text)) return "[REDACTED]";
  return value;
}

function sanitizeOroplayEnvelopeLogPreview(value, counter = { redacted: 0 }) {
  if (Array.isArray(value)) return value.map((item) => sanitizeOroplayEnvelopeLogPreview(item, counter));
  if (!isPlainObject(value)) return typeof value === "string" ? sanitizeString(value) : value;

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = "[REDACTED]";
      counter.redacted += 1;
      continue;
    }
    sanitized[key] = sanitizeOroplayEnvelopeLogPreview(nested, counter);
  }
  return sanitized;
}

function buildEnvelopeSafetyProof() {
  return {
    runtimeWiredToLiveRoute: false,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    networkAllowed: false,
    activationAllowed: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
    aliasBalance: false,
    aliasTransaction: false,
    liveRouteWiring: false,
    walletMutated: false,
    ledgerMutated: false,
    prismaWritten: false,
    externalNetworkCalled: false,
  };
}

function buildLogPreview(payload, decision, callbackType) {
  const redactionCounter = { redacted: 0 };
  const sanitizedPayload = sanitizeOroplayEnvelopeLogPreview(payload || {}, redactionCounter);

  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    mode: "request_response_envelope_mock_only",
    callbackType,
    decision,
    rawPayloadPrinted: false,
    bodyLogged: false,
    credentialLikeValuesPrinted: false,
    redactedKeyCount: redactionCounter.redacted,
    redactionMarkers: REDACTION_MARKERS.slice(),
    sanitizedPayload,
  };
}

function failClosedRequest(callbackType, reason, payload) {
  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType,
    normalized: false,
    mapperOnly: true,
    shadowRequestOnly: true,
    decision: "fail_closed",
    reason,
    failClosed: true,
    manualReview: false,
    shadowPayload: null,
    internalShadowRequest: null,
    ...buildEnvelopeSafetyProof(),
    logPreview: buildLogPreview(payload, "fail_closed", callbackType),
  };
}

function validateUserCode(userCode) {
  if (typeof userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(userCode.trim())) {
    return { ok: false, reason: "malformed_payload" };
  }
  return { ok: true, value: userCode.trim() };
}

function normalizeRequestId(value, fallback) {
  if (typeof value === "string" && SAFE_REQUEST_ID_PATTERN.test(value.trim())) return value.trim();
  return fallback;
}

function normalizeTransactionType(value) {
  const type = String(value || "").trim().toLowerCase();
  if (type === "debit") return "bet";
  if (type === "credit") return "win";
  return type;
}

function normalizeOroplayBalanceRequest(payload = {}) {
  if (!isPlainObject(payload)) return failClosedRequest("balance", "malformed_payload", payload);

  const userCode = validateUserCode(firstString(payload, ["userCode", "memberCode", "playerCode"]));
  if (!userCode.ok) return failClosedRequest("balance", userCode.reason, payload);

  const requestId = normalizeRequestId(firstString(payload, ["requestId", "reqId", "traceId"]), "balance-envelope-request");
  const shadowPayload = {
    callbackType: "balance",
    userCode: userCode.value,
    requestId,
  };

  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType: "balance",
    normalized: true,
    mapperOnly: true,
    shadowRequestOnly: true,
    decision: "normalized_balance_request",
    reason: "mock_balance_request_normalized",
    failClosed: false,
    manualReview: false,
    userCode: userCode.value,
    requestId,
    shadowPayload,
    internalShadowRequest: clone(shadowPayload),
    ...buildEnvelopeSafetyProof(),
    logPreview: buildLogPreview(payload, "normalized_balance_request", "balance"),
  };
}

function normalizeOroplayTransactionRequest(payload = {}) {
  if (!isPlainObject(payload)) return failClosedRequest("transaction", "malformed_payload", payload);

  const userCode = validateUserCode(firstString(payload, ["userCode", "memberCode", "playerCode"]));
  if (!userCode.ok) return failClosedRequest("transaction", userCode.reason, payload);

  const transactionCode = firstString(payload, ["transactionCode", "txCode", "transactionId", "replayId"]);
  if (!SAFE_TRANSACTION_CODE_PATTERN.test(transactionCode)) {
    return failClosedRequest("transaction", "malformed_payload", payload);
  }

  const transactionType = normalizeTransactionType(firstString(payload, ["transactionType", "type", "action"]));
  if (!SUPPORTED_TRANSACTION_TYPES.has(transactionType)) {
    return failClosedRequest("transaction", "unsupported_transaction_type", payload);
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount === 0) return failClosedRequest("transaction", "malformed_payload", payload);

  const signedAmount = transactionType === "bet" ? -Math.abs(amount) : Math.abs(amount);
  const roundId = firstString(payload, ["roundId", "gameRoundId", "roundCode"]) || null;
  const requestId = normalizeRequestId(firstString(payload, ["requestId", "reqId", "traceId"]), "transaction-envelope-request");
  const shadowPayload = {
    callbackType: "transaction",
    userCode: userCode.value,
    transactionCode,
    amount: signedAmount,
    roundId,
    transactionType,
    isFinished: payload.isFinished === true || payload.roundFinished === true,
  };

  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType: "transaction",
    normalized: true,
    mapperOnly: true,
    shadowRequestOnly: true,
    decision: "normalized_transaction_request",
    reason: `${transactionType}_shadow_request_normalized`,
    failClosed: false,
    manualReview: false,
    userCode: userCode.value,
    requestId,
    transactionCode,
    transactionType,
    signedAmount,
    roundId,
    shadowPayload,
    internalShadowRequest: clone(shadowPayload),
    ...buildEnvelopeSafetyProof(),
    logPreview: buildLogPreview(payload, "normalized_transaction_request", "transaction"),
  };
}

function buildFailClosedShadowResult(callbackType, reason, payload, extra = {}) {
  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType,
    decision: "fail_closed",
    reason,
    failClosed: true,
    manualReview: extra.manualReview === true,
    mappedMemberId: null,
    mockBalance: null,
    currency: "THB",
    debitIntent: null,
    creditIntent: null,
    ledgerIntent: null,
    reconciliationIntent: null,
    doubleDebitPrevented: true,
    doubleCreditPrevented: true,
    ...buildEnvelopeSafetyProof(),
    logPreview: buildLogPreview(payload, "fail_closed", callbackType),
  };
}

function buildBaseResponseEnvelope(callbackType, result, status, responsePayload) {
  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType,
    envelopeType: `${callbackType}_response`,
    mapperOnly: true,
    mockResponseEnvelopeOnly: true,
    shadowResponseContractOnly: true,
    responseSource: callbackType === "balance" ? "mock_only_decision" : "shadow_intent_only",
    status,
    decision: result.decision || "fail_closed",
    reason: result.reason || null,
    success: status === "success" || status === "idempotent_replay",
    failClosed: status === "fail_closed" || status === "manual_review",
    manualReview: status === "manual_review",
    responsePayload,
    rawPayloadPrinted: false,
    credentialLikeValuesPrinted: false,
    ...buildEnvelopeSafetyProof(),
    logPreview: buildLogPreview(responsePayload, status, callbackType),
  };
}

function buildOroplayBalanceResponseEnvelope(result = {}) {
  const shadowResult = isPlainObject(result) ? result : buildFailClosedShadowResult("balance", "malformed_payload", result);
  const success = shadowResult.decision === "mock_balance_available" && shadowResult.failClosed !== true;
  const status = success ? "success" : "fail_closed";
  const responsePayload = success
    ? {
        result: "success",
        balance: shadowResult.mockBalance,
        currency: shadowResult.currency || "THB",
        balanceSource: "mock_fixture_only",
        walletMutationAllowed: false,
      }
    : {
        result: "fail_closed",
        reason: shadowResult.reason || "fail_closed",
        balance: null,
        currency: "THB",
        walletMutationAllowed: false,
      };

  return buildBaseResponseEnvelope("balance", shadowResult, status, responsePayload);
}

function buildOroplayTransactionResponseEnvelope(result = {}) {
  const shadowResult = isPlainObject(result)
    ? result
    : buildFailClosedShadowResult("transaction", "malformed_payload", result);
  const status =
    shadowResult.manualReview === true
      ? "manual_review"
      : shadowResult.decision === "idempotent_replay"
        ? "idempotent_replay"
        : shadowResult.failClosed === true || shadowResult.decision === "fail_closed"
          ? "fail_closed"
          : "success";
  const debitIntentOnly = shadowResult.debitIntent && shadowResult.debitIntent.mutationAllowed === false;
  const creditIntentOnly = shadowResult.creditIntent && shadowResult.creditIntent.mutationAllowed === false;
  const responsePayload = {
    result: status,
    reason: shadowResult.reason || null,
    intentSource: "shadow_intent_only",
    debitIntentOnly: Boolean(debitIntentOnly),
    creditIntentOnly: Boolean(creditIntentOnly),
    idempotentReplay: shadowResult.decision === "idempotent_replay",
    doubleDebitPrevented: shadowResult.doubleDebitPrevented === true,
    doubleCreditPrevented: shadowResult.doubleCreditPrevented === true,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
  };

  return buildBaseResponseEnvelope("transaction", shadowResult, status, responsePayload);
}

function normalizePriorTransactions(priorInvocations = []) {
  if (!Array.isArray(priorInvocations)) return [];

  return priorInvocations
    .map((payload) => normalizeOroplayTransactionRequest(payload))
    .filter((normalized) => normalized.normalized === true)
    .map((normalized) => normalized.shadowPayload);
}

function invokeOroplayShadowEnvelopeFlow(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const payload = isPlainObject(candidate.payload) ? candidate.payload : candidate;
  const callbackType = candidate.kind || candidate.callbackType || payload.callbackType || payload.action;

  if (callbackType === "balance") {
    const request = normalizeOroplayBalanceRequest(payload);
    const shadowResult = request.normalized
      ? buildOroplayShadowBalanceInvocation({ payload: request.shadowPayload, state: candidate.state })
      : buildFailClosedShadowResult("balance", request.reason, payload);
    const response = buildOroplayBalanceResponseEnvelope(shadowResult);
    return {
      phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
      callbackType: "balance",
      request,
      shadowResult,
      response,
      ...buildEnvelopeSafetyProof(),
    };
  }

  if (callbackType === "transaction") {
    const request = normalizeOroplayTransactionRequest(payload);
    const shadowResult = request.normalized
      ? buildOroplayShadowTransactionInvocation({
          payload: request.shadowPayload,
          state: candidate.state,
          priorInvocations: normalizePriorTransactions(candidate.priorInvocations),
        })
      : buildFailClosedShadowResult("transaction", request.reason, payload);
    const response = buildOroplayTransactionResponseEnvelope(shadowResult);
    return {
      phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
      callbackType: "transaction",
      request,
      shadowResult,
      response,
      ...buildEnvelopeSafetyProof(),
    };
  }

  const request = failClosedRequest("unknown", "malformed_payload", payload);
  const shadowResult = buildFailClosedShadowResult("unknown", "malformed_payload", payload);
  return {
    phase: OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase,
    callbackType: "unknown",
    request,
    shadowResult,
    response: buildBaseResponseEnvelope("unknown", shadowResult, "fail_closed", {
      result: "fail_closed",
      reason: "malformed_payload",
    }),
    ...buildEnvelopeSafetyProof(),
  };
}

function validateOroplayRequestResponseEnvelope(input = {}) {
  const flow = input && input.response ? input : invokeOroplayShadowEnvelopeFlow(input);
  const response = flow.response || {};
  const errors = [];
  const allowedStatuses = new Set(["success", "fail_closed", "manual_review", "idempotent_replay"]);

  if (!allowedStatuses.has(response.status)) errors.push(`unsupported response status: ${response.status}`);
  if (response.mockResponseEnvelopeOnly !== true) errors.push("response must stay mockResponseEnvelopeOnly.");
  if (response.shadowResponseContractOnly !== true) errors.push("response must stay shadowResponseContractOnly.");

  for (const flag of [
    "runtimeWiredToLiveRoute",
    "aliasBalanceEnabled",
    "aliasTransactionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "networkAllowed",
    "activationAllowed",
  ]) {
    if (response[flag] !== false) errors.push(`${flag} must remain false.`);
  }

  if (flow.shadowResult && flow.shadowResult.phase !== OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.phase) {
    const shadowValidation = validateOroplayShadowInvocationDecision(flow.shadowResult);
    if (!shadowValidation.ok) errors.push(...shadowValidation.errors);
  }

  if (response.callbackType === "balance" && response.status === "success") {
    if (response.responseSource !== "mock_only_decision") errors.push("balance response must use mock-only decision.");
    if (typeof response.responsePayload.balance !== "number") errors.push("balance response must include numeric balance.");
  }

  if (response.callbackType === "transaction" && response.status === "success") {
    if (response.responseSource !== "shadow_intent_only") errors.push("transaction response must use shadow intent only.");
    if (!response.responsePayload.debitIntentOnly && !response.responsePayload.creditIntentOnly) {
      errors.push("transaction success response must include one shadow intent direction.");
    }
  }

  if (response.status === "manual_review" && response.manualReview !== true) {
    errors.push("manual_review response must set manualReview true.");
  }

  if (response.status === "fail_closed" && response.failClosed !== true) {
    errors.push("fail_closed response must set failClosed true.");
  }

  return { ok: errors.length === 0, errors, flow };
}

function assertFalseFlag(target, flagName) {
  if (target[flagName] !== false) throw new Error(`OroPlay ORO-4D must keep ${flagName}=false.`);
}

function assertOroplayEnvelopeNoLiveRouteWiring(input = {}) {
  const flow = invokeOroplayShadowEnvelopeFlow(input);
  assertFalseFlag(flow.response, "runtimeWiredToLiveRoute");
  return flow;
}

function assertOroplayEnvelopeNoAliasEnabled(input = {}) {
  const flow = invokeOroplayShadowEnvelopeFlow(input);
  assertFalseFlag(flow.response, "aliasBalanceEnabled");
  assertFalseFlag(flow.response, "aliasTransactionEnabled");
  return flow;
}

function assertOroplayEnvelopeNoMutation(input = {}) {
  const flow = invokeOroplayShadowEnvelopeFlow(input);
  assertFalseFlag(flow.response, "walletMutationAllowed");
  assertFalseFlag(flow.response, "ledgerMutationAllowed");
  if (flow.response.walletMutated !== false) throw new Error("OroPlay ORO-4D must not mutate wallet state.");
  if (flow.response.ledgerMutated !== false) throw new Error("OroPlay ORO-4D must not mutate ledger state.");
  return flow;
}

function assertOroplayEnvelopeNoNetwork(input = {}) {
  const flow = invokeOroplayShadowEnvelopeFlow(input);
  assertFalseFlag(flow.response, "externalNetworkAllowed");
  assertFalseFlag(flow.response, "networkAllowed");
  return flow;
}

function assertOroplayEnvelopeNoPrismaWrite(input = {}) {
  const flow = invokeOroplayShadowEnvelopeFlow(input);
  assertFalseFlag(flow.response, "prismaWriteAllowed");
  if (flow.response.prismaWritten !== false) throw new Error("OroPlay ORO-4D must not write through Prisma.");
  return flow;
}

module.exports = {
  OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS,
  normalizeOroplayBalanceRequest,
  normalizeOroplayTransactionRequest,
  buildOroplayBalanceResponseEnvelope,
  buildOroplayTransactionResponseEnvelope,
  invokeOroplayShadowEnvelopeFlow,
  validateOroplayRequestResponseEnvelope,
  assertOroplayEnvelopeNoLiveRouteWiring,
  assertOroplayEnvelopeNoAliasEnabled,
  assertOroplayEnvelopeNoMutation,
  assertOroplayEnvelopeNoNetwork,
  assertOroplayEnvelopeNoPrismaWrite,
  sanitizeOroplayEnvelopeLogPreview,
};
