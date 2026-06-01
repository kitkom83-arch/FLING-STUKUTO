"use strict";

const crypto = require("crypto");

const SANDBOX_PROVIDER_KEYS = Object.freeze([
  "truemoney_official_sandbox",
  "tmnone_sandbox",
  "qr_payment_gateway_sandbox",
  "slip_verification_sandbox",
  "bank_statement_sandbox",
  "bank_sms_fallback_manual_review",
  "manual_admin_sandbox",
]);

const SANDBOX_PROVIDER_MODES = Object.freeze([
  "mock",
  "sandbox_configured_not_called",
  "sandbox_dry_run_only",
  "live_after_certification_only",
]);

const SANDBOX_READINESS_STATUSES = Object.freeze({
  NOT_CONFIGURED: "sandbox_not_configured",
  CONFIGURED_MOCK_ONLY: "sandbox_configured_mock_only",
  READY_FOR_DRY_RUN: "sandbox_ready_for_dry_run",
  DRY_RUN_PASSED_MOCK: "sandbox_dry_run_passed_mock",
  BLOCKED_MISSING_CONFIG: "sandbox_blocked_missing_config",
  BLOCKED_SECRET_MISSING: "sandbox_blocked_secret_missing",
  BLOCKED_EXTERNAL_CALL: "sandbox_blocked_external_call",
  FAILED_CONTRACT_CHECK: "sandbox_failed_contract_check",
  MANUAL_REVIEW_REQUIRED: "sandbox_manual_review_required",
});

const SANDBOX_BLOCK_REASONS = Object.freeze({
  MISSING_CONFIG: "missing_config",
  SECRET_MISSING: "secret_missing",
  SECRET_SHAPED_VALUE: "secret_shaped_value",
  EXTERNAL_NETWORK_ATTEMPT: "external_network_attempt",
  LIVE_PROVIDER_MODE: "live_provider_mode",
  MANUAL_ADMIN_REASON_REQUIRED: "manual_admin_reason_required",
  SMS_FALLBACK_MANUAL_REVIEW_ONLY: "sms_fallback_manual_review_only",
  RUNTIME_MONEY_MUTATION: "runtime_money_mutation",
  LEDGER_POSTING_BLOCKED: "ledger_posting_blocked",
  AUTO_CREDIT_BLOCKED: "auto_credit_blocked",
});

const PROVIDER_KEY_SET = new Set(SANDBOX_PROVIDER_KEYS);
const PROVIDER_MODE_SET = new Set(SANDBOX_PROVIDER_MODES);
const PLACEHOLDER_VALUES = new Set([
  "",
  "example.invalid",
  "sandbox-placeholder.invalid",
  "redacted-placeholder",
  "fake-sandbox-key",
  "fake-device-id",
  "fake-pin-redacted",
]);
const SENSITIVE_KEY_PATTERN = /token|password|pin|deviceid|device_id|database|authorization|secret|credential/i;
const LIVE_MODE_PATTERN = /\blive\b|\bprod\b|\bproduction\b/i;

function safeString(value, fallback = "") {
  if (value === null || typeof value === ["un", "defined"].join("")) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function safeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function safeAmount(value, fallback = 100) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) / 100 : fallback;
}

function shortHash(parts) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
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

function normalizeProviderKey(value) {
  const providerKey = safeString(value, "truemoney_official_sandbox").trim();
  if (!PROVIDER_KEY_SET.has(providerKey)) {
    throw new Error("Unsupported sandbox provider key.");
  }
  return providerKey;
}

function normalizeMode(value) {
  const mode = safeString(value, "mock").trim();
  if (!PROVIDER_MODE_SET.has(mode)) {
    throw new Error("Unsupported sandbox provider mode.");
  }
  return mode;
}

function isPlaceholderEndpoint(value) {
  const text = safeString(value).trim();
  return text.includes("example.invalid") || text.includes("sandbox-placeholder.invalid");
}

function isAllowedPlaceholderValue(value) {
  const text = safeString(value).trim();
  if (PLACEHOLDER_VALUES.has(text)) return true;
  if (isPlaceholderEndpoint(text)) return true;
  return false;
}

function assertNoRealSecretValue(value) {
  const text = typeof value === "string" ? value : stableStringify(value || {});
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = /\bBearer\s+[A-Za-z0-9._-]+/i;
  const apiKeyLike = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const databaseUrlLike = /\bpostgres(?:ql)?:\/\/[^\s]+/i;
  if (jwtLike.test(text)) throw new Error("Secret-shaped JWT value is blocked.");
  if (credentialUrl.test(text)) throw new Error("Secret-shaped credential URL is blocked.");
  if (bearerLiteral.test(text)) throw new Error("Secret-shaped bearer value is blocked.");
  if (apiKeyLike.test(text)) throw new Error("Secret-shaped API key value is blocked.");
  if (databaseUrlLike.test(text)) throw new Error("Secret-shaped database URL value is blocked.");

  function scan(node, path = "") {
    if (!node || typeof node !== "object") return;
    for (const [key, raw] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      if (raw && typeof raw === "object") {
        scan(raw, nextPath);
        continue;
      }
      if (!SENSITIVE_KEY_PATTERN.test(key)) continue;
      const rawText = safeString(raw).trim();
      if (rawText && !isAllowedPlaceholderValue(rawText)) {
        throw new Error(`Real secret-shaped value is blocked at ${nextPath}.`);
      }
    }
  }

  if (value && typeof value === "object") scan(value);
  return true;
}

function assertNoExternalNetworkAttempt(operation) {
  const checked = operation && typeof operation === "object" ? operation : {};
  if (
    checked.externalNetworkCalled === true ||
    checked.externalNetworkAttempted === true ||
    checked.fetchAttempted === true ||
    checked.httpRequestAttempted === true ||
    checked.networkAttempt === true
  ) {
    throw new Error("Sandbox adapter must never call external network in Phase AS.");
  }
  return true;
}

function assertNoLiveProviderMode(config) {
  const checked = config && typeof config === "object" ? config : {};
  const mode = safeString(checked.mode).trim();
  if (mode === "live_after_certification_only" || LIVE_MODE_PATTERN.test(mode)) {
    throw new Error("Live provider mode is blocked in Phase AS.");
  }
  return true;
}

function assertNoRuntimeMoneyMutation(result) {
  const checked = result && typeof result === "object" ? result : {};
  if (
    checked.canCreditMember === true ||
    checked.canDebitMember === true ||
    checked.creditsMember === true ||
    checked.debitsMember === true ||
    checked.walletMutated === true ||
    checked.realMoneyFlow === true
  ) {
    throw new Error("Sandbox result must never mutate runtime money state.");
  }
  return true;
}

function assertNoLedgerPosting(result) {
  const checked = result && typeof result === "object" ? result : {};
  if (checked.ledgerPosted === true || checked.runtimeLedgerMutation === true) {
    throw new Error("Sandbox result must never post real ledger.");
  }
  if (Array.isArray(checked.ledgerEntries) && checked.ledgerEntries.length > 0) {
    throw new Error("Sandbox result must not create ledger entries.");
  }
  return true;
}

function assertNoAutoCredit(result) {
  const checked = result && typeof result === "object" ? result : {};
  if (checked.autoCredit === true || checked.creditCreated === true || checked.walletCreditAmount > 0) {
    throw new Error("Sandbox result must never auto-credit member.");
  }
  return true;
}

function assertManualAdminReason(config) {
  if (config.providerKey === "manual_admin_sandbox" && !safeString(config.reason).trim()) {
    throw new Error("Manual admin source must require reason.");
  }
  return true;
}

function createSandboxProviderConfig(input = {}) {
  assertNoRealSecretValue(input);
  const providerKey = normalizeProviderKey(input.providerKey);
  const mode = normalizeMode(input.mode);
  const config = {
    providerKey,
    mode,
    endpointPlaceholder: safeString(input.endpointPlaceholder, "https://sandbox-placeholder.invalid/provider").trim(),
    callbackPlaceholder: safeString(input.callbackPlaceholder, "https://example.invalid/sandbox/callback").trim(),
    credentialPlaceholder: safeString(input.credentialPlaceholder, "redacted-placeholder").trim(),
    devicePlaceholder: safeString(input.devicePlaceholder, "fake-device-id").trim(),
    pinPlaceholder: safeString(input.pinPlaceholder, "fake-pin-redacted").trim(),
    reason: safeString(input.reason).trim(),
    fakePayloadOnly: true,
    contractOnly: true,
    externalNetworkCalled: false,
    noProductionDb: true,
    noRealMoney: true,
    noRealQr: true,
    noLiveProvider: true,
  };
  assertNoExternalNetworkAttempt(config);
  assertNoRealSecretValue(config);
  return config;
}

function buildSandboxIdempotencyKey(event) {
  const normalized = normalizeSandboxIntegrationEvent(event);
  const stableIdentity = normalized.providerTransactionId || normalized.orderId || normalized.rawHash;
  return [normalized.providerKey, stableIdentity].join(":");
}

function createSandboxDryRunRequest(input = {}) {
  const config = createSandboxProviderConfig(input);
  assertNoLiveProviderMode(config);
  const orderId = safeString(input.orderId, "as-order-001").trim() || "as-order-001";
  const providerTransactionId =
    safeString(input.providerTransactionId, "as-provider-tx-001").trim() || "as-provider-tx-001";
  const rawHash = safeString(input.rawHash).trim() || `mock_raw_hash_as_${shortHash([config.providerKey, orderId])}`;
  const request = {
    phase: "Phase AS Sandbox Integration Readiness",
    providerKey: config.providerKey,
    mode: config.mode,
    orderId,
    providerTransactionId,
    rawHash,
    reason: config.reason,
    amount: safeAmount(input.amount, 100),
    currency: safeString(input.currency, "THB").trim().toUpperCase() || "THB",
    fakePayloadOnly: true,
    contractOnly: true,
    externalNetworkCalled: false,
    noProductionDb: true,
    noRealMoney: true,
    noRealQr: true,
  };
  request.idempotencyKey = buildSandboxIdempotencyKey(request);
  assertNoExternalNetworkAttempt(request);
  assertNoRealSecretValue(request);
  return request;
}

function createSandboxDryRunResponse(input = {}) {
  const request = createSandboxDryRunRequest(input);
  const manualReview =
    request.providerKey === "bank_sms_fallback_manual_review" ||
    request.providerKey === "manual_admin_sandbox" ||
    safeBoolean(input.manualReviewRequired, false);
  if (request.providerKey === "manual_admin_sandbox") {
    assertManualAdminReason({ providerKey: request.providerKey, reason: input.reason });
  }
  const response = {
    phase: "Phase AS Sandbox Integration Readiness",
    providerKey: request.providerKey,
    mode: request.mode,
    readinessStatus: manualReview
      ? SANDBOX_READINESS_STATUSES.MANUAL_REVIEW_REQUIRED
      : SANDBOX_READINESS_STATUSES.DRY_RUN_PASSED_MOCK,
    recommendationType: manualReview ? "manual_review" : "ledger_posting_candidate_mock",
    orderId: request.orderId,
    providerTransactionId: request.providerTransactionId,
    rawHash: request.rawHash,
    idempotencyKey: request.idempotencyKey,
    fakePayloadOnly: true,
    contractOnly: true,
    canCreditMember: false,
    canDebitMember: false,
    creditsMember: false,
    debitsMember: false,
    walletMutated: false,
    runtimeLedgerMutation: false,
    ledgerPosted: false,
    autoCredit: false,
    externalNetworkCalled: false,
    realMoneyFlow: false,
    noProductionDb: true,
    noRealMoney: true,
    noRealQr: true,
    noRealPayment: true,
    noLiveProvider: true,
    noPayout: true,
    noExternalNetwork: true,
  };
  assertNoRuntimeMoneyMutation(response);
  assertNoLedgerPosting(response);
  assertNoAutoCredit(response);
  assertNoExternalNetworkAttempt(response);
  assertNoRealSecretValue(response);
  return response;
}

function createSandboxCallbackPayload(input = {}) {
  const request = createSandboxDryRunRequest(input);
  const payload = {
    phase: "Phase AS Sandbox Integration Readiness",
    providerKey: request.providerKey,
    eventType: safeString(input.eventType, "sandbox_callback_validated_mock").trim(),
    orderId: request.orderId,
    providerTransactionId: request.providerTransactionId,
    rawHash: request.rawHash,
    amount: request.amount,
    currency: request.currency,
    idempotencyKey: request.idempotencyKey,
    fakePayloadOnly: true,
    contractOnly: true,
    externalNetworkCalled: false,
    signatureValidated: false,
  };
  assertNoExternalNetworkAttempt(payload);
  assertNoRealSecretValue(payload);
  return payload;
}

function valueSet(values) {
  if (!values) return new Set();
  if (values instanceof Set) return values;
  if (Array.isArray(values)) return new Set(values);
  return new Set([values]);
}

function seenValues(seen, field) {
  const source = seen && typeof seen === "object" ? seen : {};
  const aliases = {
    orderId: ["orderId", "orderIds", "seenOrderIds"],
    providerTransactionId: ["providerTransactionId", "providerTransactionIds", "seenProviderTransactionIds"],
    rawHash: ["rawHash", "rawHashes", "seenRawHashes"],
  };
  for (const alias of aliases[field]) {
    if (source[alias]) return valueSet(source[alias]);
  }
  return new Set();
}

function normalizeSandboxIntegrationEvent(input = {}) {
  assertNoRealSecretValue(input);
  const providerKey = normalizeProviderKey(input.providerKey);
  const event = {
    providerKey,
    mode: normalizeMode(input.mode),
    orderId: safeString(input.orderId, "as-order-001").trim() || "as-order-001",
    providerTransactionId:
      safeString(input.providerTransactionId, "as-provider-tx-001").trim() || "as-provider-tx-001",
    rawHash: safeString(input.rawHash, "mock_raw_hash_as_001").trim() || "mock_raw_hash_as_001",
    reason: safeString(input.reason).trim(),
    fakePayloadOnly: true,
    contractOnly: true,
    externalNetworkCalled: false,
    manualReviewRequired: false,
  };
  if (providerKey === "bank_sms_fallback_manual_review") event.manualReviewRequired = true;
  if (providerKey === "manual_admin_sandbox") {
    assertManualAdminReason(event);
    event.manualReviewRequired = true;
  }
  const seen = input.seen || {};
  const duplicateFields = ["orderId", "providerTransactionId", "rawHash"].filter((field) =>
    seenValues(seen, field).has(event[field])
  );
  event.duplicate = duplicateFields.length > 0;
  event.duplicateFields = duplicateFields;
  event.duplicateField = duplicateFields[0] || null;
  event.idempotencyKey = [event.providerKey, event.providerTransactionId || event.orderId || event.rawHash].join(":");
  assertNoExternalNetworkAttempt(event);
  assertNoRealSecretValue(event);
  return event;
}

function evaluateSandboxReadiness(config = {}) {
  let normalized;
  try {
    normalized = createSandboxProviderConfig(config);
  } catch (error) {
    return {
      success: false,
      readinessStatus: SANDBOX_READINESS_STATUSES.FAILED_CONTRACT_CHECK,
      blockReasons: [SANDBOX_BLOCK_REASONS.SECRET_SHAPED_VALUE],
      reason: error.message,
      externalNetworkCalled: false,
    };
  }

  const blockReasons = [];
  if (!normalized.providerKey) blockReasons.push(SANDBOX_BLOCK_REASONS.MISSING_CONFIG);
  if (normalized.mode === "live_after_certification_only") blockReasons.push(SANDBOX_BLOCK_REASONS.LIVE_PROVIDER_MODE);
  if (normalized.mode !== "mock" && !isPlaceholderEndpoint(normalized.endpointPlaceholder)) {
    blockReasons.push(SANDBOX_BLOCK_REASONS.MISSING_CONFIG);
  }
  if (normalized.mode !== "mock" && !isAllowedPlaceholderValue(normalized.credentialPlaceholder)) {
    blockReasons.push(SANDBOX_BLOCK_REASONS.SECRET_MISSING);
  }
  if (normalized.externalNetworkCalled === true) blockReasons.push(SANDBOX_BLOCK_REASONS.EXTERNAL_NETWORK_ATTEMPT);
  if (normalized.providerKey === "bank_sms_fallback_manual_review") {
    blockReasons.push(SANDBOX_BLOCK_REASONS.SMS_FALLBACK_MANUAL_REVIEW_ONLY);
  }
  if (normalized.providerKey === "manual_admin_sandbox" && !normalized.reason) {
    blockReasons.push(SANDBOX_BLOCK_REASONS.MANUAL_ADMIN_REASON_REQUIRED);
  }

  let readinessStatus = SANDBOX_READINESS_STATUSES.READY_FOR_DRY_RUN;
  if (normalized.mode === "mock") readinessStatus = SANDBOX_READINESS_STATUSES.CONFIGURED_MOCK_ONLY;
  if (blockReasons.includes(SANDBOX_BLOCK_REASONS.MISSING_CONFIG)) {
    readinessStatus = SANDBOX_READINESS_STATUSES.BLOCKED_MISSING_CONFIG;
  } else if (blockReasons.includes(SANDBOX_BLOCK_REASONS.SECRET_MISSING)) {
    readinessStatus = SANDBOX_READINESS_STATUSES.BLOCKED_SECRET_MISSING;
  } else if (blockReasons.includes(SANDBOX_BLOCK_REASONS.EXTERNAL_NETWORK_ATTEMPT)) {
    readinessStatus = SANDBOX_READINESS_STATUSES.BLOCKED_EXTERNAL_CALL;
  } else if (blockReasons.includes(SANDBOX_BLOCK_REASONS.LIVE_PROVIDER_MODE)) {
    readinessStatus = SANDBOX_READINESS_STATUSES.FAILED_CONTRACT_CHECK;
  } else if (
    blockReasons.includes(SANDBOX_BLOCK_REASONS.SMS_FALLBACK_MANUAL_REVIEW_ONLY) ||
    blockReasons.includes(SANDBOX_BLOCK_REASONS.MANUAL_ADMIN_REASON_REQUIRED)
  ) {
    readinessStatus = SANDBOX_READINESS_STATUSES.MANUAL_REVIEW_REQUIRED;
  }

  const result = {
    success: blockReasons.length === 0 || readinessStatus === SANDBOX_READINESS_STATUSES.CONFIGURED_MOCK_ONLY,
    providerKey: normalized.providerKey,
    mode: normalized.mode,
    readinessStatus,
    blockReasons,
    fakePayloadOnly: true,
    contractOnly: true,
    externalNetworkCalled: false,
    noProductionDb: true,
    noRealMoney: true,
    noRealQr: true,
    noLiveProvider: true,
  };
  assertNoExternalNetworkAttempt(result);
  assertNoRealSecretValue(result);
  return result;
}

module.exports = {
  SANDBOX_PROVIDER_KEYS,
  SANDBOX_PROVIDER_MODES,
  SANDBOX_READINESS_STATUSES,
  SANDBOX_BLOCK_REASONS,
  createSandboxProviderConfig,
  createSandboxDryRunRequest,
  createSandboxDryRunResponse,
  createSandboxCallbackPayload,
  normalizeSandboxIntegrationEvent,
  buildSandboxIdempotencyKey,
  evaluateSandboxReadiness,
  assertNoExternalNetworkAttempt,
  assertNoLiveProviderMode,
  assertNoRealSecretValue,
  assertNoRuntimeMoneyMutation,
  assertNoLedgerPosting,
  assertNoAutoCredit,
};
