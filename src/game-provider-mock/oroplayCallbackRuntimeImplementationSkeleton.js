"use strict";

const {
  OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS,
  evaluateOroplayRuntimeDisabledGate,
} = require("./oroplayCallbackRuntimeDisabledGate");

const OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON_STATUS = Object.freeze({
  phase: "ORO-4A",
  status: "callback runtime implementation skeleton intent only",
  runtimeImplemented: false,
  runtimeEnabled: false,
  runtimeActive: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  aliasEnabled: false,
});

const SENSITIVE_LOG_KEYS = Object.freeze([
  "authorization",
  "token",
  "password",
  "clientSecret",
  "client_secret",
  "DATABASE_URL",
  "PIN",
  "deviceId",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeSensitiveKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isSensitiveLogKey(key) {
  const normalized = normalizeSensitiveKey(key);
  return SENSITIVE_LOG_KEYS.some((marker) => normalizeSensitiveKey(marker) === normalized);
}

function redactSensitiveLogValue(payload) {
  if (Array.isArray(payload)) return payload.map(redactSensitiveLogValue);
  if (!isPlainObject(payload)) return payload;

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    sanitized[key] = isSensitiveLogKey(key) ? "[REDACTED]" : redactSensitiveLogValue(value);
  }
  return sanitized;
}

function toFiniteAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function buildOroplayCallbackRuntimeContext(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const payload = isPlainObject(candidate.payload) ? candidate.payload : {};
  const callbackType = candidate.callbackType === "transaction" ? "transaction" : "balance";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON_STATUS.phase,
    callbackType,
    runtimeImplemented: false,
    runtimeEnabled: false,
    runtimeActive: false,
    memberId: candidate.memberId || payload.memberId || payload.userCode || "mock_member",
    amount: toFiniteAmount(candidate.amount !== undefined ? candidate.amount : payload.amount),
    currency: candidate.currency || payload.currency || "THB",
    transactionCode: candidate.transactionCode || payload.transactionCode || "mock_transaction",
    requestId: candidate.requestId || "mock_request",
    provider: "oroplay",
    inputMode: "mock_only",
  };
}

function validateOroplayCallbackRuntimeAuthIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "auth_validation_intent",
    provider: context.provider,
    validationMode: "intent_only",
    credentialsRead: false,
    realSecretRead: false,
    authorizationHeaderPrinted: false,
    liveProviderTrafficAllowed: false,
    decision: "runtime_not_activated",
  };
}

function resolveOroplayCallbackMemberMappingIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "member_mapping_intent",
    memberId: context.memberId,
    source: "mock_only",
    productionLookupAllowed: false,
    prismaReadAllowed: false,
    prismaWriteAllowed: false,
    mappingMutationAllowed: false,
    decision: "intent_only",
  };
}

function buildOroplayCallbackIdempotencyIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "idempotency_decision_intent",
    transactionCode: context.transactionCode,
    idempotencyKey: `mock_only:${context.provider}:${context.transactionCode}`,
    storageMode: "mock_only",
    storageWriteAllowed: false,
    lockAllowed: false,
    duplicateDecision: "future_fail_closed_or_manual_review",
    decision: "intent_only",
  };
}

function buildOroplayCallbackWalletDebitIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "wallet_debit_intent",
    memberId: context.memberId,
    amount: context.amount,
    currency: context.currency,
    transactionCode: context.transactionCode,
    beforeBalanceSource: "mock_only",
    mutationAllowed: false,
    walletMutated: false,
    reason: "runtime_not_activated",
  };
}

function buildOroplayCallbackWalletCreditIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "wallet_credit_intent",
    memberId: context.memberId,
    amount: context.amount,
    currency: context.currency,
    transactionCode: context.transactionCode,
    mutationAllowed: false,
    walletMutated: false,
    reason: "runtime_not_activated",
  };
}

function buildOroplayCallbackLedgerWriteIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "ledger_write_intent",
    memberId: context.memberId,
    amount: context.amount,
    currency: context.currency,
    transactionCode: context.transactionCode,
    ledgerWriteAllowed: false,
    ledgerMutated: false,
    reason: "runtime_not_activated",
  };
}

function buildOroplayCallbackReconciliationIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  return {
    phase: context.phase,
    intentType: "reconciliation_intent",
    transactionCode: context.transactionCode,
    mode: "mock_only",
    intentOnly: true,
    reconciliationRecordWritten: false,
    reconciliationAllowed: false,
    walletDeltaVerified: false,
    ledgerEntryVerified: false,
    providerTraceVerified: false,
    decision: "runtime_not_activated",
  };
}

function buildOroplayCallbackSanitizedLogIntent(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  const payload = isPlainObject(input) && isPlainObject(input.payload) ? input.payload : {};
  const sanitizedPayload = redactSensitiveLogValue(payload);

  return {
    phase: context.phase,
    intentType: "sanitized_log_intent",
    mode: "mock_only",
    logWriteAllowed: false,
    rawPayloadPrinted: false,
    redactedKeys: SENSITIVE_LOG_KEYS.slice(),
    sanitizedPayload,
  };
}

function executeOroplayCallbackRuntimeSkeleton(input = {}) {
  const context = buildOroplayCallbackRuntimeContext(input);
  const gate = evaluateOroplayRuntimeDisabledGate(input);
  const decision = gate.decision === "staging_ready_only" ? "staging_ready_only" : "fail_closed";
  const authIntent = validateOroplayCallbackRuntimeAuthIntent(context);
  const memberMappingIntent = resolveOroplayCallbackMemberMappingIntent(context);
  const idempotencyIntent = buildOroplayCallbackIdempotencyIntent(context);
  const walletDebitIntent = buildOroplayCallbackWalletDebitIntent(context);
  const walletCreditIntent = buildOroplayCallbackWalletCreditIntent(context);
  const ledgerWriteIntent = buildOroplayCallbackLedgerWriteIntent(context);
  const reconciliationIntent = buildOroplayCallbackReconciliationIntent(context);
  const sanitizedLogIntent = buildOroplayCallbackSanitizedLogIntent(input);

  return {
    phase: context.phase,
    status: OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON_STATUS.status,
    gatePhase: OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS.phase,
    decision,
    gateDecision: gate.decision,
    runtimeImplemented: false,
    runtimeEnabled: false,
    runtimeActive: false,
    walletMutated: false,
    ledgerMutated: false,
    prismaWritten: false,
    externalNetworkCalled: false,
    aliasEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    intents: {
      authIntent,
      memberMappingIntent,
      idempotencyIntent,
      walletDebitIntent,
      walletCreditIntent,
      ledgerWriteIntent,
      reconciliationIntent,
      sanitizedLogIntent,
    },
  };
}

function validateOroplayCallbackRuntimeImplementationSkeleton() {
  const errors = [];
  const defaultResult = executeOroplayCallbackRuntimeSkeleton();
  const stagingReady = executeOroplayCallbackRuntimeSkeleton({
    runtimeFlag: "enabled",
    certificationMockPresent: true,
  });
  const debitIntent = buildOroplayCallbackWalletDebitIntent({ memberId: "mock_member", amount: 10 });
  const creditIntent = buildOroplayCallbackWalletCreditIntent({ memberId: "mock_member", amount: 10 });
  const ledgerIntent = buildOroplayCallbackLedgerWriteIntent({ memberId: "mock_member", amount: 10 });
  const reconciliationIntent = buildOroplayCallbackReconciliationIntent({ transactionCode: "mock_transaction" });
  const logFixture = { safeStatus: "intent_only", nested: {} };

  for (const key of SENSITIVE_LOG_KEYS) {
    logFixture[key] = `mock-redaction-${normalizeSensitiveKey(key)}`;
    logFixture.nested[key] = `mock-nested-redaction-${normalizeSensitiveKey(key)}`;
  }

  const sanitizedLog = buildOroplayCallbackSanitizedLogIntent({ payload: logFixture });

  if (defaultResult.decision !== "fail_closed") errors.push("default skeleton execution must fail closed.");
  if (stagingReady.decision !== "staging_ready_only") errors.push("certified mock input must be staging_ready_only.");
  if (defaultResult.walletMutated !== false) errors.push("default execution must not mutate wallet.");
  if (defaultResult.ledgerMutated !== false) errors.push("default execution must not mutate ledger.");
  if (defaultResult.prismaWritten !== false) errors.push("default execution must not write Prisma.");
  if (defaultResult.externalNetworkCalled !== false) errors.push("default execution must not call external network.");
  if (defaultResult.aliasEnabled !== false) errors.push("default execution must not enable alias.");
  if (debitIntent.mutationAllowed !== false) errors.push("debit intent must keep mutationAllowed false.");
  if (debitIntent.beforeBalanceSource !== "mock_only") errors.push("debit intent must use mock_only balance source.");
  if (creditIntent.mutationAllowed !== false) errors.push("credit intent must keep mutationAllowed false.");
  if (ledgerIntent.ledgerWriteAllowed !== false) errors.push("ledger intent must keep ledgerWriteAllowed false.");
  if (ledgerIntent.reason !== "runtime_not_activated") errors.push("ledger intent reason mismatch.");
  if (reconciliationIntent.mode !== "mock_only" || reconciliationIntent.intentOnly !== true) {
    errors.push("reconciliation intent must be mock_only intent.");
  }

  for (const key of SENSITIVE_LOG_KEYS) {
    if (sanitizedLog.sanitizedPayload[key] !== "[REDACTED]") errors.push(`${key} must be redacted.`);
    if (sanitizedLog.sanitizedPayload.nested[key] !== "[REDACTED]") errors.push(`nested ${key} must be redacted.`);
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON_STATUS,
  buildOroplayCallbackRuntimeContext,
  validateOroplayCallbackRuntimeAuthIntent,
  resolveOroplayCallbackMemberMappingIntent,
  buildOroplayCallbackIdempotencyIntent,
  buildOroplayCallbackWalletDebitIntent,
  buildOroplayCallbackWalletCreditIntent,
  buildOroplayCallbackLedgerWriteIntent,
  buildOroplayCallbackReconciliationIntent,
  buildOroplayCallbackSanitizedLogIntent,
  executeOroplayCallbackRuntimeSkeleton,
  validateOroplayCallbackRuntimeImplementationSkeleton,
};
