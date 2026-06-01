"use strict";

const PROVIDER_KEYS = Object.freeze({
  TRUEMONEY_OFFICIAL: "truemoney_official",
  TMNONE: "tmnone",
  QR_PAYMENT_GATEWAY: "qr_payment_gateway",
  SLIP_VERIFICATION: "slip_verification",
  BANK_STATEMENT: "bank_statement",
  BANK_SMS_FALLBACK: "bank_sms_fallback",
  MANUAL_ADMIN: "manual_admin",
});

const PROVIDER_MODES = Object.freeze({
  MOCK: "mock",
  SANDBOX: "sandbox",
  LIVE_AFTER_CERTIFICATION: "live_after_certification",
});

const ALLOWED_STATUSES = new Set(["received", "matched", "pending", "manual_review", "duplicate_suspect", "rejected", "expired", "failed"]);
const ALLOWED_CONFIDENCE = new Set(["verified", "high", "medium", "weak"]);
const ALLOWED_PROVIDER_KEYS = new Set(Object.values(PROVIDER_KEYS));
const LIVE_MODE_PATTERN = /\blive\b|production/i;

function safeString(value, fallback = "") {
  if (value === null || typeof value === ["un", "defined"].join("")) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function safeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function defaultCurrency(value) {
  const currency = safeString(value, "THB").trim().toUpperCase();
  return currency || "THB";
}

function normalizeStatus(input) {
  const status = safeString(input.status, "pending").trim();
  return ALLOWED_STATUSES.has(status) ? status : "manual_review";
}

function normalizeConfidence(input) {
  const confidence = safeString(input.confidence, "weak").trim();
  return ALLOWED_CONFIDENCE.has(confidence) ? confidence : "weak";
}

function normalizeDepositEvent(input) {
  const source = input && typeof input === "object" ? input : {};
  const providerKey = safeString(source.providerKey).trim();
  if (!ALLOWED_PROVIDER_KEYS.has(providerKey)) {
    throw new Error("Unsupported providerKey for payment provider contract.");
  }

  let confidence = normalizeConfidence(source);
  let status = normalizeStatus(source);
  let reviewRequired = Boolean(source.reviewRequired);

  if (providerKey === PROVIDER_KEYS.BANK_SMS_FALLBACK) {
    confidence = "weak";
    status = "manual_review";
    reviewRequired = true;
  }

  if (providerKey === PROVIDER_KEYS.SLIP_VERIFICATION && confidence !== "verified" && confidence !== "high") {
    status = "manual_review";
    reviewRequired = true;
  }

  if (providerKey === PROVIDER_KEYS.BANK_STATEMENT && source.matched === false) {
    status = "manual_review";
    reviewRequired = true;
  }

  return {
    providerKey,
    providerEventId: safeString(source.providerEventId, `${providerKey}-mock-event`),
    providerTransactionId: safeString(source.providerTransactionId, `${providerKey}-mock-transaction`),
    orderId: safeString(source.orderId, `${providerKey}-mock-order`),
    memberId: safeString(source.memberId, "mock-member-001"),
    amount: safeAmount(source.amount || 100),
    currency: defaultCurrency(source.currency),
    occurredAt: safeString(source.occurredAt, "2026-06-01T00:00:00.000Z"),
    receiverAccountMasked: safeString(source.receiverAccountMasked, "099***9999"),
    senderAccountMasked: safeString(source.senderAccountMasked, "088***8888"),
    reference: safeString(source.reference, `${providerKey}-mock-reference`),
    rawHash: safeString(source.rawHash, `${providerKey}-mock-raw-hash`),
    confidence,
    status,
    reviewRequired,
    source: safeString(source.source, "mock"),
    contractMode: safeString(source.contractMode, PROVIDER_MODES.MOCK),
  };
}

function buildIdempotencyKey(event) {
  const normalized = normalizeDepositEvent(event);
  const stableId =
    normalized.providerTransactionId ||
    normalized.providerEventId ||
    normalized.rawHash ||
    normalized.orderId;
  return [normalized.providerKey, stableId].join(":");
}

function assertNoLiveProviderMode(env) {
  const safeEnv = env && typeof env === "object" ? env : {};
  const checkedKeys = [
    "PAYMENT_PROVIDER_MODE",
    "TRUEMONEY_PROVIDER_MODE",
    "TMNONE_PROVIDER_MODE",
    "QR_PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
  ];
  for (const key of checkedKeys) {
    const value = safeString(safeEnv[key]).trim();
    if (LIVE_MODE_PATTERN.test(value)) {
      throw new Error(`${key} live provider mode is blocked in Phase AO mock contract.`);
    }
  }
  return true;
}

function createMockTrueMoneyOfficialEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.TRUEMONEY_OFFICIAL,
    providerEventId: "tm-official-event-001",
    providerTransactionId: "tm-official-tx-001",
    orderId: "tm-official-order-001",
    reference: "tm-official-ref-001",
    confidence: "verified",
    status: "received",
    source: "mock_truemoney_official",
    ...overrides,
  });
}

function createMockTMNOneEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.TMNONE,
    providerEventId: "tmnone-event-001",
    providerTransactionId: "tmnone-tx-001",
    orderId: "tmnone-order-001",
    reference: "tmnone-history-ref-001",
    confidence: "high",
    status: "received",
    source: "mock_tmnone_history",
    limitMarkers: ["per-user", "per-transaction", "daily"],
    ...overrides,
  });
}

function createMockQrGatewayEvent(overrides = {}) {
  const event = normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.QR_PAYMENT_GATEWAY,
    providerEventId: "qr-event-001",
    providerTransactionId: "qr-tx-001",
    orderId: "qr-order-001",
    reference: "qr-reference-001",
    confidence: "high",
    status: "pending",
    source: "mock_qr_gateway",
    qrDownloadContract: "download QR, open full screen QR, copy amount, copy reference/orderId, upload slip fallback",
    ...overrides,
  });
  event.qrDownloadContract = "download QR, open full screen QR, copy amount, copy reference/orderId, upload slip fallback";
  return event;
}

function createMockSlipVerificationEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.SLIP_VERIFICATION,
    providerEventId: "slip-event-001",
    providerTransactionId: "slip-tx-001",
    orderId: "slip-order-001",
    reference: "slip-reference-001",
    confidence: "verified",
    status: "matched",
    source: "mock_slip_verification",
    ...overrides,
  });
}

function createMockStatementEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.BANK_STATEMENT,
    providerEventId: "statement-event-001",
    providerTransactionId: "statement-tx-001",
    orderId: "statement-order-001",
    reference: "statement-reference-001",
    confidence: "high",
    status: "matched",
    source: "mock_statement_api",
    matched: true,
    ...overrides,
  });
}

function createMockSmsFallbackEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.BANK_SMS_FALLBACK,
    providerEventId: "sms-event-001",
    providerTransactionId: "sms-tx-001",
    orderId: "sms-order-001",
    reference: "sms-reference-001",
    confidence: "weak",
    status: "manual_review",
    reviewRequired: true,
    source: "mock_bank_sms_fallback",
    ...overrides,
  });
}

function createMockManualAdminEvent(overrides = {}) {
  return normalizeDepositEvent({
    providerKey: PROVIDER_KEYS.MANUAL_ADMIN,
    providerEventId: "manual-admin-event-001",
    providerTransactionId: "manual-admin-tx-001",
    orderId: "manual-admin-order-001",
    reference: "manual-admin-reference-001",
    confidence: "medium",
    status: "manual_review",
    reviewRequired: true,
    source: "mock_manual_admin",
    reasonRequired: true,
    auditRequired: true,
    ...overrides,
  });
}

module.exports = {
  PROVIDER_KEYS,
  PROVIDER_MODES,
  normalizeDepositEvent,
  buildIdempotencyKey,
  assertNoLiveProviderMode,
  createMockTrueMoneyOfficialEvent,
  createMockTMNOneEvent,
  createMockQrGatewayEvent,
  createMockSlipVerificationEvent,
  createMockStatementEvent,
  createMockSmsFallbackEvent,
  createMockManualAdminEvent,
};
