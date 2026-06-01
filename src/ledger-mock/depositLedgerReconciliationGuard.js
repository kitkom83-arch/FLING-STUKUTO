"use strict";

const crypto = require("crypto");

const DEPOSIT_LEDGER_GUARD_STATUSES = Object.freeze({
  RECEIVED: "ledger_guard_received",
  CANDIDATE_MOCK: "ledger_guard_candidate_mock",
  MANUAL_REVIEW: "ledger_guard_manual_review",
  DUPLICATE_SUSPECT: "ledger_guard_duplicate_suspect",
  RECONCILIATION_MISMATCH: "ledger_guard_reconciliation_mismatch",
  REJECTED: "ledger_guard_rejected",
  FAILED: "ledger_guard_failed",
});

const DEPOSIT_RECONCILIATION_STATUSES = Object.freeze({
  RECONCILED_MOCK: "reconciled_mock",
  UNRECONCILED_MOCK: "unreconciled_mock",
  MISMATCH_MOCK: "mismatch_mock",
  PENDING_REVIEW_MOCK: "pending_review_mock",
  DUPLICATE_SUSPECT_MOCK: "duplicate_suspect_mock",
  REJECTED_MOCK: "rejected_mock",
});

const DEPOSIT_LEDGER_RECOMMENDATION_TYPES = Object.freeze({
  NO_ACTION: "no_action",
  MANUAL_REVIEW_REQUIRED: "manual_review_required",
  LEDGER_POSTING_CANDIDATE_MOCK: "ledger_posting_candidate_mock",
  MISMATCH_REVIEW_REQUIRED: "mismatch_review_required",
  DUPLICATE_SUSPECT: "duplicate_suspect",
  REJECT: "reject",
});

const DEPOSIT_VERIFICATION_SOURCE_TYPES = Object.freeze({
  QR_MOCK_ORDER: "qr_mock_order",
  PAYMENT_PROVIDER_MOCK_EVENT: "payment_provider_mock_event",
  SLIP_VERIFICATION_MOCK: "slip_verification_mock",
  BANK_STATEMENT_MOCK: "bank_statement_mock",
  BANK_SMS_FALLBACK_MOCK: "bank_sms_fallback_mock",
  MANUAL_ADMIN_MOCK: "manual_admin_mock",
});

const SOURCE_TYPES = new Set(Object.values(DEPOSIT_VERIFICATION_SOURCE_TYPES));
const LIVE_MODE_PATTERN = /\blive\b|\bproduction\b|\bprod\b/i;

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

function safeOptionalAmount(value) {
  if (value === null || typeof value === ["un", "defined"].join("") || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) / 100 : null;
}

function safeCurrency(value) {
  const currency = safeString(value, "THB").trim().toUpperCase();
  return currency || "THB";
}

function safeSourceType(value) {
  const sourceType = safeString(value).trim();
  if (!SOURCE_TYPES.has(sourceType)) {
    throw new Error("Unsupported deposit ledger guard source type.");
  }
  return sourceType;
}

function shortHash(parts) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function createMockLedgerGuardInput(input = {}) {
  return normalizeLedgerGuardInput({
    sourceType: DEPOSIT_VERIFICATION_SOURCE_TYPES.PAYMENT_PROVIDER_MOCK_EVENT,
    sourceId: "ar-source-001",
    orderId: "ar-order-001",
    providerTransactionId: "ar-provider-tx-001",
    rawHash: "mock_raw_hash_ar_001",
    memberId: "member-mock-001",
    amount: 500,
    currency: "THB",
    expectedAmount: 500,
    expectedMemberId: "member-mock-001",
    expectedCurrency: "THB",
    confidence: "verified",
    status: "source_matched",
    matched: true,
    mockOnly: true,
    ...input,
  });
}

function normalizeLedgerGuardInput(input = {}) {
  assertNoSecretShapedValues(input);
  const source = input && typeof input === "object" ? input : {};
  const sourceType = safeSourceType(source.sourceType);
  const orderId = safeString(source.orderId, `${sourceType}-order-001`).trim() || `${sourceType}-order-001`;
  const providerTransactionId =
    safeString(source.providerTransactionId, `${sourceType}-provider-tx-001`).trim() ||
    `${sourceType}-provider-tx-001`;
  const rawHash =
    safeString(source.rawHash).trim() ||
    `mock_raw_hash_${shortHash([sourceType, orderId, providerTransactionId])}`;

  const normalized = {
    sourceId: safeString(source.sourceId, `${sourceType}-source-001`).trim() || `${sourceType}-source-001`,
    sourceType,
    orderId,
    providerTransactionId,
    rawHash,
    memberId: safeString(source.memberId, "member-mock-001").trim() || "member-mock-001",
    amount: safeAmount(source.amount, 100),
    currency: safeCurrency(source.currency),
    expectedAmount: safeOptionalAmount(source.expectedAmount),
    expectedMemberId: safeString(source.expectedMemberId).trim(),
    expectedCurrency: source.expectedCurrency ? safeCurrency(source.expectedCurrency) : "",
    status: safeString(source.status, "source_pending").trim() || "source_pending",
    confidence: safeString(source.confidence, "weak").trim() || "weak",
    matched: safeBoolean(source.matched, false),
    reviewRequired: safeBoolean(source.reviewRequired, false),
    qrDownloaded: safeBoolean(source.qrDownloaded, false),
    qrOrderStatus: safeString(source.qrOrderStatus, "ready").trim() || "ready",
    reason: safeString(source.reason).trim(),
    mockOnly: true,
    externalNetworkCalled: false,
    realMoneyFlow: false,
    canCreditMember: false,
    canDebitMember: false,
    creditsMember: false,
    debitsMember: false,
    walletMutated: false,
    runtimeLedgerMutation: false,
    ledgerPosted: false,
    autoCredit: false,
  };

  if (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.MANUAL_ADMIN_MOCK) {
    assertManualAdminReasonRequired(normalized);
  }

  assertNoAutoCreditFromLedgerGuard(normalized);
  assertNoRuntimeLedgerMutation(normalized);
  assertNoSecretShapedValues(normalized);
  return normalized;
}

function buildLedgerGuardIdempotencyKey(input) {
  const normalized = normalizeLedgerGuardInput(input);
  const stableIdentity = normalized.providerTransactionId || normalized.orderId || normalized.rawHash;
  if (!stableIdentity) throw new Error("Ledger guard idempotency key requires stable source identity.");
  return [normalized.sourceType, stableIdentity].join(":");
}

function payloadSignature(input) {
  const normalized = normalizeLedgerGuardInput(input);
  return shortHash([
    normalized.sourceType,
    normalized.sourceId,
    normalized.orderId,
    normalized.providerTransactionId,
    normalized.rawHash,
    normalized.memberId,
    normalized.amount,
    normalized.currency,
    normalized.expectedAmount,
    normalized.expectedMemberId,
    normalized.expectedCurrency,
    normalized.status,
    normalized.confidence,
    normalized.matched,
    normalized.qrDownloaded,
    normalized.qrOrderStatus,
    normalized.reason,
  ]);
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

function detectLedgerDuplicate(input, seen = {}) {
  const normalized = normalizeLedgerGuardInput(input);
  const fields = ["orderId", "providerTransactionId", "rawHash"].filter((field) => {
    const values = seenValues(seen, field);
    return normalized[field] && values.has(normalized[field]);
  });

  return {
    duplicate: fields.length > 0,
    duplicateFields: fields,
    duplicateField: fields[0] || null,
    guardStatus: fields.length ? DEPOSIT_LEDGER_GUARD_STATUSES.DUPLICATE_SUSPECT : DEPOSIT_LEDGER_GUARD_STATUSES.RECEIVED,
    recommendationType: fields.length
      ? DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT
      : DEPOSIT_LEDGER_RECOMMENDATION_TYPES.NO_ACTION,
  };
}

function lookupIdempotencyPayload(seen, key) {
  if (!seen || typeof seen !== "object") return null;
  const store = seen.idempotencyPayloadByKey || seen.idempotencyPayloads;
  if (!store) return null;
  if (store instanceof Map) return store.get(key) || null;
  return store[key] || null;
}

function hasMismatch(normalized) {
  const mismatches = [];
  if (normalized.expectedAmount !== null && normalized.amount !== normalized.expectedAmount) mismatches.push("amount");
  if (normalized.expectedMemberId && normalized.memberId !== normalized.expectedMemberId) mismatches.push("member");
  if (normalized.expectedCurrency && normalized.currency !== normalized.expectedCurrency) mismatches.push("currency");
  return mismatches;
}

function baseResult(normalized, overrides = {}) {
  const result = {
    success: true,
    phase: "Phase AR Ledger/Reconciliation Guard",
    sourceId: normalized.sourceId,
    sourceType: normalized.sourceType,
    orderId: normalized.orderId,
    providerTransactionId: normalized.providerTransactionId,
    rawHash: normalized.rawHash,
    memberId: normalized.memberId,
    amount: normalized.amount,
    currency: normalized.currency,
    guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.RECEIVED,
    recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.NO_ACTION,
    reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.UNRECONCILED_MOCK,
    idempotencyKey: buildLedgerGuardIdempotencyKey(normalized),
    reason: "mock guard received",
    auditAction: "admin.deposit_ledger_guard.evaluated_mock",
    mockOnly: true,
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
    ...overrides,
  };
  assertNoRuntimeLedgerMutation(result);
  assertNoAutoCreditFromLedgerGuard(result);
  assertNoSecretShapedValues(result);
  return result;
}

function evaluateLedgerPostingEligibility(input, seen = {}) {
  const normalized = normalizeLedgerGuardInput(input);
  const idempotencyKey = buildLedgerGuardIdempotencyKey(normalized);
  const currentSignature = payloadSignature(normalized);
  const previousSignature = lookupIdempotencyPayload(seen, idempotencyKey);
  if (previousSignature && previousSignature !== currentSignature) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.DUPLICATE_SUSPECT,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.DUPLICATE_SUSPECT_MOCK,
      reason: "idempotency conflict detected for changed mock source payload",
      auditAction: "admin.deposit_ledger_guard.duplicate_suspect_mock",
      duplicateField: "idempotencyKey",
      idempotencyConflict: true,
      idempotencyKey,
    });
  }

  const duplicate = detectLedgerDuplicate(normalized, seen);
  if (duplicate.duplicate) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.DUPLICATE_SUSPECT,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.DUPLICATE_SUSPECT_MOCK,
      reason: `duplicate ${duplicate.duplicateField} detected`,
      auditAction: "admin.deposit_ledger_guard.duplicate_suspect_mock",
      duplicateField: duplicate.duplicateField,
      duplicateFields: duplicate.duplicateFields,
      idempotencyKey,
    });
  }

  const mismatches = hasMismatch(normalized);
  if (mismatches.length > 0) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.RECONCILIATION_MISMATCH,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MISMATCH_REVIEW_REQUIRED,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.MISMATCH_MOCK,
      reason: `${mismatches.join(", ")} mismatch requires mock review`,
      auditAction: "admin.deposit_ledger_guard.mismatch_detected_mock",
      mismatchFields: mismatches,
      idempotencyKey,
    });
  }

  if (normalized.qrOrderStatus === "expired" || normalized.qrOrderStatus === "cancelled") {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.REJECTED,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.REJECT,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.REJECTED_MOCK,
      reason: `${normalized.qrOrderStatus} QR source cannot become ledger posting candidate`,
      auditAction: "admin.deposit_ledger_guard.rejected_mock",
      idempotencyKey,
    });
  }

  if (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.QR_MOCK_ORDER) {
    return baseResult(normalized, {
      guardStatus: normalized.qrDownloaded
        ? DEPOSIT_LEDGER_GUARD_STATUSES.MANUAL_REVIEW
        : DEPOSIT_LEDGER_GUARD_STATUSES.RECEIVED,
      recommendationType: normalized.qrDownloaded
        ? DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED
        : DEPOSIT_LEDGER_RECOMMENDATION_TYPES.NO_ACTION,
      reconciliationStatus: normalized.qrDownloaded
        ? DEPOSIT_RECONCILIATION_STATUSES.PENDING_REVIEW_MOCK
        : DEPOSIT_RECONCILIATION_STATUSES.UNRECONCILED_MOCK,
      reason: normalized.qrDownloaded
        ? "QR downloaded source must never create ledger posting candidate"
        : "QR mock order is not payment evidence",
      auditAction: normalized.qrDownloaded
        ? "admin.deposit_ledger_guard.manual_review_mock"
        : "admin.deposit_ledger_guard.evaluated_mock",
      idempotencyKey,
    });
  }

  if (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_SMS_FALLBACK_MOCK) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.MANUAL_REVIEW,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.PENDING_REVIEW_MOCK,
      reason: "SMS fallback source remains weak signal and manual review only",
      auditAction: "admin.deposit_ledger_guard.manual_review_mock",
      idempotencyKey,
    });
  }

  if (normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.MANUAL_ADMIN_MOCK) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.MANUAL_REVIEW,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.PENDING_REVIEW_MOCK,
      reason: "manual admin mock requires reason and future dual-control marker",
      auditAction: "admin.deposit_ledger_guard.manual_review_mock",
      idempotencyKey,
    });
  }

  const verifiedProvider =
    normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.PAYMENT_PROVIDER_MOCK_EVENT &&
    (normalized.matched || ["verified", "high"].includes(normalized.confidence));
  const verifiedSlip =
    normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.SLIP_VERIFICATION_MOCK &&
    normalized.matched &&
    ["verified", "high"].includes(normalized.confidence);
  const matchedStatement =
    normalized.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.BANK_STATEMENT_MOCK && normalized.matched;

  if (verifiedProvider || verifiedSlip || matchedStatement) {
    return baseResult(normalized, {
      guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.CANDIDATE_MOCK,
      recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.LEDGER_POSTING_CANDIDATE_MOCK,
      reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.RECONCILED_MOCK,
      reason: "ledger_posting_candidate_mock is only a mock recommendation",
      auditAction: "admin.deposit_ledger_guard.reconciliation_checked_mock",
      idempotencyKey,
    });
  }

  return baseResult(normalized, {
    guardStatus: DEPOSIT_LEDGER_GUARD_STATUSES.MANUAL_REVIEW,
    recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED,
    reconciliationStatus: DEPOSIT_RECONCILIATION_STATUSES.PENDING_REVIEW_MOCK,
    reason: "source requires manual mock review",
    auditAction: "admin.deposit_ledger_guard.manual_review_mock",
    idempotencyKey,
  });
}

function createMockReconciliationSnapshot(input = {}) {
  const recommendation = evaluateLedgerPostingEligibility(input);
  const snapshot = {
    snapshotId: `ar-reconciliation-${shortHash([recommendation.sourceId, recommendation.idempotencyKey])}`,
    sourceId: recommendation.sourceId,
    sourceType: recommendation.sourceType,
    orderId: recommendation.orderId,
    providerTransactionId: recommendation.providerTransactionId,
    rawHash: recommendation.rawHash,
    memberId: recommendation.memberId,
    amount: recommendation.amount,
    currency: recommendation.currency,
    guardStatus: recommendation.guardStatus,
    recommendationType: recommendation.recommendationType,
    reconciliationStatus: recommendation.reconciliationStatus,
    idempotencyKey: recommendation.idempotencyKey,
    reason: recommendation.reason,
    mockOnly: true,
    walletMutated: false,
    runtimeLedgerMutation: false,
    ledgerPosted: false,
    externalNetworkCalled: false,
    realMoneyFlow: false,
  };
  assertNoRuntimeLedgerMutation(snapshot);
  assertNoAutoCreditFromLedgerGuard(snapshot);
  assertNoSecretShapedValues(snapshot);
  return snapshot;
}

function evaluateReconciliationSnapshot(snapshot) {
  assertNoSecretShapedValues(snapshot);
  const checked = snapshot && typeof snapshot === "object" ? clone(snapshot) : {};
  assertNoRuntimeLedgerMutation(checked);
  assertNoAutoCreditFromLedgerGuard(checked);
  if (checked.reconciliationStatus === DEPOSIT_RECONCILIATION_STATUSES.MISMATCH_MOCK) {
    return { ...checked, recommendationType: DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MISMATCH_REVIEW_REQUIRED };
  }
  return checked;
}

function assertNoRuntimeLedgerMutation(result) {
  const checked = result && typeof result === "object" ? result : {};
  if (checked.runtimeLedgerMutation === true || checked.ledgerPosted === true || checked.walletMutated === true) {
    throw new Error("Ledger guard must not mutate runtime ledger or wallet in Phase AR.");
  }
  if (Array.isArray(checked.ledgerEntries) && checked.ledgerEntries.length > 0) {
    throw new Error("Ledger guard must not create ledger entries in Phase AR.");
  }
  return true;
}

function assertNoAutoCreditFromLedgerGuard(result) {
  const checked = result && typeof result === "object" ? result : {};
  if (
    checked.canCreditMember === true ||
    checked.creditsMember === true ||
    checked.autoCredit === true ||
    checked.creditCreated === true
  ) {
    throw new Error("Ledger guard mock recommendation must never credit member.");
  }
  if (checked.canDebitMember === true || checked.debitsMember === true || checked.debitCreated === true) {
    throw new Error("Ledger guard mock recommendation must never debit member.");
  }
  const walletCreditAmount = Number(checked.walletCreditAmount || 0);
  if (Number.isFinite(walletCreditAmount) && walletCreditAmount > 0) {
    throw new Error("Ledger guard mock recommendation must not create wallet credit amount.");
  }
  return true;
}

function assertNoLiveLedgerMode(env = {}) {
  const safeEnv = env && typeof env === "object" ? env : {};
  const checkedKeys = [
    "LEDGER_MODE",
    "DEPOSIT_LEDGER_GUARD_MODE",
    "RECONCILIATION_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
    "TRUEMONEY_PROVIDER_MODE",
    "TMNONE_PROVIDER_MODE",
  ];
  for (const key of checkedKeys) {
    const value = safeString(safeEnv[key]).trim();
    if (LIVE_MODE_PATTERN.test(value)) {
      throw new Error(`${key} live ledger mode is blocked in Phase AR mock contract.`);
    }
  }
  return true;
}

function assertManualAdminReasonRequired(input) {
  const checked = input && typeof input === "object" ? input : {};
  if (checked.sourceType === DEPOSIT_VERIFICATION_SOURCE_TYPES.MANUAL_ADMIN_MOCK && !safeString(checked.reason).trim()) {
    throw new Error("Manual admin source must require reason.");
  }
  return true;
}

function assertNoSecretShapedValues(value) {
  const text = typeof value === "string" ? value : stableStringify(value || {});
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
  DEPOSIT_LEDGER_GUARD_STATUSES,
  DEPOSIT_RECONCILIATION_STATUSES,
  DEPOSIT_LEDGER_RECOMMENDATION_TYPES,
  createMockLedgerGuardInput,
  createMockReconciliationSnapshot,
  normalizeLedgerGuardInput,
  buildLedgerGuardIdempotencyKey,
  evaluateLedgerPostingEligibility,
  evaluateReconciliationSnapshot,
  detectLedgerDuplicate,
  assertNoRuntimeLedgerMutation,
  assertNoAutoCreditFromLedgerGuard,
  assertNoLiveLedgerMode,
  assertManualAdminReasonRequired,
  assertNoSecretShapedValues,
};
