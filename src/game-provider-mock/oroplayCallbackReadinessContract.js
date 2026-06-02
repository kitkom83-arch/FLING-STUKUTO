"use strict";

const crypto = require("crypto");

const OROPLAY_CALLBACK_READINESS_STATUS = Object.freeze({
  phase: "ORO-2C",
  status: "callback runtime readiness contract only",
  runtimeEnabled: false,
  noLiveRuntime: true,
  previousPhase: "ORO-2B closed; fail-closed stub remains default",
  nextPhase: "ORO-3 blocked until ORO-2C readiness smoke passes and runtime safety gates are approved",
});

const OROPLAY_MEMBER_MAPPING_CASES = Object.freeze([
  Object.freeze({
    caseId: "valid_userCode",
    input: "well-formed OroPlay userCode mapped in mock member registry",
    result: "mapped_pg77_member_identity",
    status: "readiness_only",
    dbLookup: false,
    failClosed: false,
  }),
  Object.freeze({
    caseId: "unknown_userCode",
    input: "well-formed OroPlay userCode missing from mock member registry",
    result: "fail_closed",
    status: "unknown_member",
    dbLookup: false,
    failClosed: true,
  }),
  Object.freeze({
    caseId: "blocked_member",
    input: "well-formed OroPlay userCode mapped to blocked mock member",
    result: "fail_closed",
    status: "blocked_member",
    dbLookup: false,
    failClosed: true,
  }),
  Object.freeze({
    caseId: "inactive_member",
    input: "well-formed OroPlay userCode mapped to inactive mock member",
    result: "fail_closed",
    status: "inactive_member",
    dbLookup: false,
    failClosed: true,
  }),
  Object.freeze({
    caseId: "malformed_userCode",
    input: "missing, blank, non-string, or unsafe userCode shape",
    result: "fail_closed",
    status: "malformed_userCode",
    dbLookup: false,
    failClosed: true,
  }),
]);

const OROPLAY_CALLBACK_PAYLOAD_VALIDATION_CASES = Object.freeze([
  Object.freeze({
    caseId: "balance_payload",
    callbackType: "balance",
    requiredFields: Object.freeze(["userCode"]),
    invalidCases: Object.freeze(["malformed_body", "missing_userCode", "malformed_userCode"]),
    unknownVendorGameFields: "ignored_for_readiness",
  }),
  Object.freeze({
    caseId: "transaction_payload",
    callbackType: "transaction",
    requiredFields: Object.freeze(["userCode", "transactionCode", "amount"]),
    invalidCases: Object.freeze([
      "malformed_body",
      "missing_userCode",
      "missing_transactionCode",
      "invalid_amount",
      "unsupported_transaction_type",
      "malformed_userCode",
    ]),
    unknownVendorGameFields: "ignored_for_readiness",
  }),
]);

const OROPLAY_CALLBACK_IDEMPOTENCY_CASES = Object.freeze([
  Object.freeze({
    caseId: "duplicate_transactionCode",
    result: "duplicate_safe",
    doubleDebitCreditAllowed: false,
    mutatesLedger: false,
  }),
  Object.freeze({
    caseId: "round_session_replay",
    result: "replay_blocked",
    doubleDebitCreditAllowed: false,
    mutatesLedger: false,
  }),
  Object.freeze({
    caseId: "same_payload_replay",
    result: "same_payload_safe",
    doubleDebitCreditAllowed: false,
    mutatesLedger: false,
  }),
  Object.freeze({
    caseId: "conflicting_replay",
    result: "manual_review_fail_closed",
    doubleDebitCreditAllowed: false,
    mutatesLedger: false,
  }),
]);

const OROPLAY_CALLBACK_LOG_SANITIZATION_RULES = Object.freeze({
  allowedMetadata: Object.freeze([
    "requestId",
    "route",
    "eventType",
    "callbackType",
    "userCodeMasked",
    "userCodeHash",
    "transactionCodeMasked",
    "transactionCodeHash",
    "result",
  ]),
  rawAuthorizationLogging: false,
  rawBasicAuthLogging: false,
  rawBodyLoggingWithCredentialLikeField: false,
  rawBodyLoggingDefault: false,
  blockedKeyMarkers: Object.freeze([
    "authorization",
    "password",
    "secret",
    "token",
    "clientSecret",
    "DATABASE_URL",
    "pin",
    "deviceId",
  ]),
});

const OROPLAY_LEDGER_RECONCILIATION_BOUNDARY = Object.freeze({
  phase: "ORO-2C",
  runtimeWalletMutation: false,
  runtimeLedgerMutation: false,
  prismaWrite: false,
  ledgerTransactionRequiredInOro3: true,
  auditLogRequiredInOro3: true,
  reconciliationRecordRequiredInOro3: true,
  currentCapability: "mock readiness only; no wallet mutation; no ledger mutation; no Prisma write",
});

const SAFE_USER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const SAFE_TRANSACTION_CODE_PATTERN = /^[A-Za-z0-9_.:-]{3,96}$/;
const SUPPORTED_TRANSACTION_TYPES = new Set(["bet", "win", "rollback", "settle", "adjustment"]);

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function hasCredentialLikeKey(value) {
  if (Array.isArray(value)) return value.some(hasCredentialLikeKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) => {
    const normalized = normalizeKey(key);
    if (
      normalized.includes("authorization") ||
      normalized.includes("password") ||
      normalized.includes("secret") ||
      normalized.includes("token") ||
      normalized.includes("databaseurl") ||
      normalized.includes("pin") ||
      normalized.includes("deviceid")
    ) {
      return true;
    }
    return hasCredentialLikeKey(nested);
  });
}

function stableHash(value) {
  if (!hasValue(value)) return null;
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
  if (Object.prototype.hasOwnProperty.call(candidate, "amount") || hasValue(candidate.transactionCode)) {
    return "transaction";
  }
  return "balance";
}

function validateUserCode(userCode) {
  if (typeof userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(userCode.trim())) {
    return { ok: false, reason: "malformed_userCode" };
  }
  return { ok: true, normalized: userCode.trim() };
}

function validateAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return { ok: false, reason: "invalid_amount" };
  return {
    ok: true,
    normalizedAmount: amount,
    intent: amount < 0 ? "debit_readiness" : "credit_readiness",
  };
}

function validateTransactionCode(value) {
  if (typeof value !== "string" || !SAFE_TRANSACTION_CODE_PATTERN.test(value.trim())) {
    return { ok: false, reason: "missing_or_malformed_transactionCode" };
  }
  return { ok: true, normalized: value.trim() };
}

function validateCallbackPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, callbackType: "unknown", result: "fail_closed", reason: "malformed_body" };
  }

  const callbackType = inferCallbackType(payload);
  const userCode = validateUserCode(payload.userCode);
  if (!userCode.ok) {
    return { ok: false, callbackType, result: "fail_closed", reason: userCode.reason };
  }

  if (callbackType === "balance") {
    return { ok: true, callbackType, result: "readiness_only", userCode: userCode.normalized };
  }

  const transactionCode = validateTransactionCode(payload.transactionCode);
  if (!transactionCode.ok) {
    return { ok: false, callbackType, result: "fail_closed", reason: "missing_transactionCode" };
  }

  const amount = validateAmount(payload.amount);
  if (!amount.ok) {
    return { ok: false, callbackType, result: "fail_closed", reason: amount.reason };
  }

  if (hasValue(payload.transactionType)) {
    const transactionType = String(payload.transactionType).trim().toLowerCase();
    if (!SUPPORTED_TRANSACTION_TYPES.has(transactionType)) {
      return { ok: false, callbackType, result: "fail_closed", reason: "unsupported_transaction_type" };
    }
  }

  return {
    ok: true,
    callbackType,
    result: "readiness_only",
    userCode: userCode.normalized,
    transactionCode: transactionCode.normalized,
    amount: amount.normalizedAmount,
    intent: amount.intent,
    unknownVendorGameFields: "ignored_for_readiness",
  };
}

function sanitizeOroplayCallbackLogPreview(input = {}) {
  const body = input.body && typeof input.body === "object" ? input.body : {};
  const callbackType = input.callbackType || inferCallbackType(body);
  const eventType = input.eventType || `oroplay_${callbackType}_callback_readiness`;
  const route = input.route || (callbackType === "transaction" ? "/api/oroplay/transaction" : "/api/oroplay/balance");
  const result = input.result || "readiness_only";
  const credentialLikeBody = hasCredentialLikeKey(body) || hasCredentialLikeKey(input.headers || {});

  return {
    requestId: input.requestId || "mock-request",
    route,
    eventType,
    callbackType,
    userCodeMasked: maskValue(body.userCode),
    userCodeHash: stableHash(body.userCode),
    transactionCodeMasked: maskValue(body.transactionCode),
    transactionCodeHash: stableHash(body.transactionCode),
    result,
    bodyLogged: false,
    rawBodyDropped: credentialLikeBody || true,
  };
}

function buildOroplayCallbackReadinessSummary() {
  return {
    phase: OROPLAY_CALLBACK_READINESS_STATUS.phase,
    status: OROPLAY_CALLBACK_READINESS_STATUS.status,
    noLiveRuntime: OROPLAY_CALLBACK_READINESS_STATUS.noLiveRuntime,
    oro2bFailClosedRemainsDefault: true,
    memberMappingCases: OROPLAY_MEMBER_MAPPING_CASES.map((entry) => ({ ...entry })),
    payloadValidationCases: OROPLAY_CALLBACK_PAYLOAD_VALIDATION_CASES.map((entry) => ({ ...entry })),
    idempotencyCases: OROPLAY_CALLBACK_IDEMPOTENCY_CASES.map((entry) => ({ ...entry })),
    sanitizedLogRules: { ...OROPLAY_CALLBACK_LOG_SANITIZATION_RULES },
    ledgerReconciliationBoundary: { ...OROPLAY_LEDGER_RECONCILIATION_BOUNDARY },
    optionalAliasDecision:
      "Provider-compatible aliases /api/balance and /api/transaction remain disabled in ORO-2C.",
  };
}

function validateOroplayCallbackReadinessContract() {
  const errors = [];
  const mappingIds = new Set(OROPLAY_MEMBER_MAPPING_CASES.map((entry) => entry.caseId));
  const idempotencyIds = new Set(OROPLAY_CALLBACK_IDEMPOTENCY_CASES.map((entry) => entry.caseId));
  const logRules = OROPLAY_CALLBACK_LOG_SANITIZATION_RULES;
  const boundary = OROPLAY_LEDGER_RECONCILIATION_BOUNDARY;

  for (const required of [
    "valid_userCode",
    "unknown_userCode",
    "blocked_member",
    "inactive_member",
    "malformed_userCode",
  ]) {
    if (!mappingIds.has(required)) errors.push(`missing member mapping case ${required}.`);
  }
  for (const required of [
    "duplicate_transactionCode",
    "round_session_replay",
    "same_payload_replay",
    "conflicting_replay",
  ]) {
    if (!idempotencyIds.has(required)) errors.push(`missing idempotency case ${required}.`);
  }
  if (logRules.rawAuthorizationLogging !== false) errors.push("raw authorization logging must be disabled.");
  if (logRules.rawBasicAuthLogging !== false) errors.push("raw Basic auth logging must be disabled.");
  if (logRules.rawBodyLoggingWithCredentialLikeField !== false) {
    errors.push("credential-like raw body logging must be disabled.");
  }
  if (boundary.runtimeWalletMutation !== false) errors.push("runtime wallet mutation must be disabled.");
  if (boundary.runtimeLedgerMutation !== false) errors.push("runtime ledger mutation must be disabled.");
  if (boundary.prismaWrite !== false) errors.push("Prisma write must be disabled.");
  if (OROPLAY_CALLBACK_READINESS_STATUS.runtimeEnabled !== false) errors.push("runtime must not be enabled.");

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_READINESS_STATUS,
  OROPLAY_MEMBER_MAPPING_CASES,
  OROPLAY_CALLBACK_PAYLOAD_VALIDATION_CASES,
  OROPLAY_CALLBACK_IDEMPOTENCY_CASES,
  OROPLAY_CALLBACK_LOG_SANITIZATION_RULES,
  OROPLAY_LEDGER_RECONCILIATION_BOUNDARY,
  buildOroplayCallbackReadinessSummary,
  sanitizeOroplayCallbackLogPreview,
  validateCallbackPayload,
  validateOroplayCallbackReadinessContract,
};
