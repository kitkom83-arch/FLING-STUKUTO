"use strict";

const crypto = require("crypto");

const DEPOSIT_VERIFICATION_SOURCE_TYPES = Object.freeze({
  QR_MOCK_ORDER: "qr_mock_order",
  PAYMENT_PROVIDER_MOCK_EVENT: "payment_provider_mock_event",
  SLIP_VERIFICATION_MOCK: "slip_verification_mock",
  BANK_STATEMENT_MOCK: "bank_statement_mock",
  BANK_SMS_FALLBACK_MOCK: "bank_sms_fallback_mock",
  MANUAL_ADMIN_MOCK: "manual_admin_mock",
});

const DEPOSIT_VERIFICATION_STATUSES = Object.freeze({
  SOURCE_RECEIVED: "source_received",
  SOURCE_MATCHED: "source_matched",
  SOURCE_PENDING: "source_pending",
  SOURCE_MANUAL_REVIEW: "source_manual_review",
  SOURCE_DUPLICATE_SUSPECT: "source_duplicate_suspect",
  SOURCE_REJECTED: "source_rejected",
  SOURCE_EXPIRED: "source_expired",
  SOURCE_CANCELLED: "source_cancelled",
  SOURCE_FAILED: "source_failed",
});

const DEPOSIT_VERIFICATION_CONFIDENCE = Object.freeze({
  VERIFIED: "verified",
  HIGH: "high",
  MEDIUM: "medium",
  WEAK: "weak",
});

const SOURCE_TYPES = new Set(Object.values(DEPOSIT_VERIFICATION_SOURCE_TYPES));
const STATUSES = new Set(Object.values(DEPOSIT_VERIFICATION_STATUSES));
const CONFIDENCE = new Set(Object.values(DEPOSIT_VERIFICATION_CONFIDENCE));
const LIVE_MODE_PATTERN = /\blive\b|\bproduction\b/i;

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
  return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
}

function safeCurrency(value) {
  const currency = safeString(value, "THB").trim().toUpperCase();
  return currency || "THB";
}

function safeStatus(value, fallback = DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING) {
  const status = safeString(value, fallback).trim();
  return STATUSES.has(status) ? status : fallback;
}

function safeConfidence(value, fallback = DEPOSIT_VERIFICATION_CONFIDENCE.WEAK) {
  const confidence = safeString(value, fallback).trim();
  return CONFIDENCE.has(confidence) ? confidence : fallback;
}

function safeSourceType(value) {
  const sourceType = safeString(value).trim();
  if (!SOURCE_TYPES.has(sourceType)) {
    throw new Error("Unsupported deposit verification source type.");
  }
  return sourceType;
}

function mockHash(parts) {
  return `mock-raw-hash-${crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 24)}`;
}

function baseSource(sourceType, input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const orderId = safeString(source.orderId, `${sourceType}-order-001`).trim() || `${sourceType}-order-001`;
  const providerTransactionId =
    safeString(source.providerTransactionId, `${sourceType}-provider-tx-001`).trim() ||
    `${sourceType}-provider-tx-001`;
  const rawHash =
    safeString(source.rawHash).trim() ||
    mockHash([sourceType, orderId, providerTransactionId, safeString(source.reference, "mock-reference")]);

  return {
    sourceId: safeString(source.sourceId, `${sourceType}-source-001`).trim() || `${sourceType}-source-001`,
    sourceType,
    orderId,
    providerTransactionId,
    rawHash,
    memberId: safeString(source.memberId, "member-mock-001").trim() || "member-mock-001",
    amount: safeAmount(source.amount, 100),
    currency: safeCurrency(source.currency),
    occurredAt: safeString(source.occurredAt, "2026-06-01T00:00:00.000Z"),
    reference: safeString(source.reference, `${sourceType}-reference-001`),
    confidence: safeConfidence(source.confidence),
    status: safeStatus(source.status),
    reviewRequired: safeBoolean(source.reviewRequired, false),
    matched: safeBoolean(source.matched, false),
    reason: safeString(source.reason).trim(),
    qrOrderStatus: safeString(source.qrOrderStatus, "ready").trim() || "ready",
    qrDownloaded: safeBoolean(source.qrDownloaded, false),
    mockOnly: true,
    externalNetworkCalled: false,
    realMoneyFlow: false,
    canCreditMember: false,
    creditsMember: false,
    creditCreated: false,
    walletCreditAmount: 0,
    autoCredit: false,
  };
}

function createMockQrOrderSource(input = {}) {
  return normalizeDepositVerificationSource({
    ...input,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.QR_MOCK_ORDER,
    confidence: input.qrDownloaded ? DEPOSIT_VERIFICATION_CONFIDENCE.WEAK : DEPOSIT_VERIFICATION_CONFIDENCE.MEDIUM,
    status: input.qrDownloaded
      ? DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING
      : DEPOSIT_VERIFICATION_STATUSES.SOURCE_RECEIVED,
    reviewRequired: Boolean(input.qrDownloaded),
  });
}

function createMockPaymentProviderSource(input = {}) {
  return normalizeDepositVerificationSource({
    confidence: DEPOSIT_VERIFICATION_CONFIDENCE.HIGH,
    status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING,
    matched: true,
    ...input,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.PAYMENT_PROVIDER_MOCK_EVENT,
  });
}

function createMockSlipVerificationSource(input = {}) {
  const verified = safeConfidence(input.confidence, DEPOSIT_VERIFICATION_CONFIDENCE.VERIFIED) === "verified";
  return normalizeDepositVerificationSource({
    confidence: verified ? DEPOSIT_VERIFICATION_CONFIDENCE.VERIFIED : DEPOSIT_VERIFICATION_CONFIDENCE.WEAK,
    status: verified
      ? DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING
      : DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
    reviewRequired: !verified,
    matched: verified,
    ...input,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.SLIP_VERIFICATION_MOCK,
  });
}

function createMockBankStatementSource(input = {}) {
  const matched = safeBoolean(input.matched, true);
  return normalizeDepositVerificationSource({
    confidence: matched ? DEPOSIT_VERIFICATION_CONFIDENCE.HIGH : DEPOSIT_VERIFICATION_CONFIDENCE.MEDIUM,
    status: matched
      ? DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING
      : DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
    reviewRequired: !matched,
    matched,
    ...input,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_STATEMENT_MOCK,
  });
}

function createMockBankSmsFallbackSource(input = {}) {
  return normalizeDepositVerificationSource({
    ...input,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_SMS_FALLBACK_MOCK,
    confidence: DEPOSIT_VERIFICATION_CONFIDENCE.WEAK,
    status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
    reviewRequired: true,
    matched: false,
  });
}

function createMockManualAdminSource(input = {}) {
  const reason = safeString(input.reason).trim();
  if (!reason) throw new Error("Manual admin deposit verification source requires reason.");
  return normalizeDepositVerificationSource({
    confidence: DEPOSIT_VERIFICATION_CONFIDENCE.MEDIUM,
    status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
    reviewRequired: true,
    matched: false,
    ...input,
    reason,
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.MANUAL_ADMIN_MOCK,
  });
}

function normalizeDepositVerificationSource(input = {}) {
  assertNoSecretShapedValues(input);
  const source = input && typeof input === "object" ? input : {};
  const sourceType = safeSourceType(source.sourceType);
  const normalized = baseSource(sourceType, source);

  if (normalized.qrOrderStatus === "expired") {
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_EXPIRED;
    normalized.reviewRequired = true;
    normalized.matched = false;
  } else if (normalized.qrOrderStatus === "cancelled") {
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_CANCELLED;
    normalized.reviewRequired = true;
    normalized.matched = false;
  } else if (sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_SMS_FALLBACK_MOCK) {
    normalized.confidence = DEPOSIT_VERIFICATION_CONFIDENCE.WEAK;
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW;
    normalized.reviewRequired = true;
    normalized.matched = false;
  } else if (sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.QR_MOCK_ORDER && normalized.qrDownloaded) {
    normalized.confidence = DEPOSIT_VERIFICATION_CONFIDENCE.WEAK;
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING;
    normalized.reviewRequired = true;
    normalized.matched = false;
  } else if (
    sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.SLIP_VERIFICATION_MOCK &&
    !["verified", "high"].includes(normalized.confidence)
  ) {
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW;
    normalized.reviewRequired = true;
    normalized.matched = false;
  } else if (sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_STATEMENT_MOCK && !normalized.matched) {
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW;
    normalized.reviewRequired = true;
  } else if (sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.MANUAL_ADMIN_MOCK) {
    if (!normalized.reason) throw new Error("Manual admin deposit verification source requires reason.");
    normalized.status = DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW;
    normalized.reviewRequired = true;
    normalized.matched = false;
  }

  assertNoAutoCreditFromSource(normalized);
  assertNoSecretShapedValues(normalized);
  return normalized;
}

function buildDepositVerificationIdempotencyKey(source) {
  const normalized = normalizeDepositVerificationSource(source);
  const stableId = normalized.providerTransactionId || normalized.orderId || normalized.rawHash;
  if (!stableId) throw new Error("Deposit verification idempotency key requires stable source id.");
  return [normalized.sourceType, stableId].join(":");
}

function hasDuplicateMarker(source, expected = {}) {
  const duplicateSets = [
    ["orderId", expected.seenOrderIds],
    ["providerTransactionId", expected.seenProviderTransactionIds],
    ["rawHash", expected.seenRawHashes],
  ];
  for (const [field, values] of duplicateSets) {
    if (!values) continue;
    const set = values instanceof Set ? values : new Set(values);
    if (source[field] && set.has(source[field])) return field;
  }
  return null;
}

function expectedMatches(source, expected = {}) {
  const checks = [
    ["orderId", source.orderId, expected.orderId],
    ["amount", source.amount, expected.amount],
    ["currency", source.currency, expected.currency ? safeCurrency(expected.currency) : expected.currency],
  ];
  return checks.every(([, actual, wanted]) => wanted === undefined || actual === wanted);
}

function evaluateDepositVerificationMatch(source, expected = {}) {
  const normalized = normalizeDepositVerificationSource(source);
  const duplicateField = hasDuplicateMarker(normalized, expected);
  if (duplicateField) {
    return {
      ...normalized,
      status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_DUPLICATE_SUSPECT,
      reviewRequired: true,
      matched: false,
      duplicateField,
    };
  }

  if (
    [DEPOSIT_VERIFICATION_STATUSES.SOURCE_EXPIRED, DEPOSIT_VERIFICATION_STATUSES.SOURCE_CANCELLED].includes(
      normalized.status
    )
  ) {
    return { ...normalized, matched: false, reviewRequired: true };
  }

  if (!expectedMatches(normalized, expected)) {
    return {
      ...normalized,
      status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
      reviewRequired: true,
      matched: false,
    };
  }

  if (
    normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.PAYMENT_PROVIDER_MOCK_EVENT ||
    (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.SLIP_VERIFICATION_MOCK &&
      ["verified", "high"].includes(normalized.confidence)) ||
    (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_STATEMENT_MOCK && normalized.matched)
  ) {
    return {
      ...normalized,
      status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_MATCHED,
      reviewRequired: false,
      matched: true,
    };
  }

  if (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.QR_MOCK_ORDER) {
    return {
      ...normalized,
      status: normalized.qrDownloaded
        ? DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING
        : DEPOSIT_VERIFICATION_STATUSES.SOURCE_RECEIVED,
      reviewRequired: Boolean(normalized.qrDownloaded),
      matched: false,
    };
  }

  return {
    ...normalized,
    status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW,
    reviewRequired: true,
    matched: false,
  };
}

function assertNoAutoCreditFromSource(source) {
  const checked = source && typeof source === "object" ? source : {};
  if (checked.canCreditMember === true || checked.creditsMember === true || checked.creditCreated === true) {
    throw new Error("Deposit verification source must not credit member in Phase AQ.");
  }
  if (checked.autoCredit === true || safeAmount(checked.walletCreditAmount, 0) > 0) {
    throw new Error("Deposit verification source must not auto-credit member in Phase AQ.");
  }
  return true;
}

function assertNoLiveVerificationMode(env = {}) {
  const safeEnv = env && typeof env === "object" ? env : {};
  const checkedKeys = [
    "PAYMENT_PROVIDER_MODE",
    "DEPOSIT_VERIFICATION_MODE",
    "QR_PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
    "TRUEMONEY_PROVIDER_MODE",
    "TMNONE_PROVIDER_MODE",
  ];
  for (const key of checkedKeys) {
    const value = safeString(safeEnv[key]).trim();
    if (LIVE_MODE_PATTERN.test(value)) {
      throw new Error(`${key} live verification mode is blocked in Phase AQ mock contract.`);
    }
  }
  return true;
}

function assertNoSecretShapedValues(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value || {});
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const forbiddenAssignment = /\b(?:DATABASE_URL|TOKEN|PASSWORD|PIN|DEVICE_ID|DEVICEID)\s*=\s*["']?[A-Za-z0-9_./:@-]{8,}/i;
  const bearerLiteral = /\bBearer\s+[A-Za-z0-9._-]+/i;
  const apiKeyLike = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  if (jwtLike.test(text)) throw new Error("Secret-shaped JWT value is blocked.");
  if (credentialUrl.test(text)) throw new Error("Secret-shaped credential URL is blocked.");
  if (forbiddenAssignment.test(text)) throw new Error("Secret-shaped assignment value is blocked.");
  if (bearerLiteral.test(text)) throw new Error("Secret-shaped bearer value is blocked.");
  if (apiKeyLike.test(text)) throw new Error("Secret-shaped API key value is blocked.");
  return true;
}

module.exports = {
  DEPOSIT_VERIFICATION_SOURCE_TYPES,
  DEPOSIT_VERIFICATION_STATUSES,
  DEPOSIT_VERIFICATION_CONFIDENCE,
  createMockQrOrderSource,
  createMockPaymentProviderSource,
  createMockSlipVerificationSource,
  createMockBankStatementSource,
  createMockBankSmsFallbackSource,
  createMockManualAdminSource,
  normalizeDepositVerificationSource,
  buildDepositVerificationIdempotencyKey,
  evaluateDepositVerificationMatch,
  assertNoAutoCreditFromSource,
  assertNoLiveVerificationMode,
  assertNoSecretShapedValues,
};
