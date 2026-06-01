"use strict";

const crypto = require("crypto");

const QR_DEPOSIT_PROVIDER_KEY = "qr_payment_gateway";
const QR_DEPOSIT_STATES = Object.freeze({
  IDLE: "idle",
  AMOUNT_ENTERED: "amount_entered",
  ORDER_CREATING: "order_creating",
  QR_READY: "qr_ready",
  QR_DOWNLOADED: "qr_downloaded",
  PENDING_VERIFICATION: "pending_verification",
  MATCHED_MOCK_ONLY: "matched_mock_only",
  MANUAL_REVIEW: "manual_review",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  FAILED: "failed",
});

const ALLOWED_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const BLOCKED_PROVIDER_MODE_PATTERN = /\blive\b|production/i;
const REAL_PAYMENT_QR_PATTERNS = [
  /\bA000000677010111\b/i,
  /\bpromptpay\b/i,
  /\bmerchant\b/i,
  /\bpayee\b/i,
  /\bEMVCo\b/i,
];

function safeString(value, fallback = "") {
  if (value === null || typeof value === ["un", "defined"].join("")) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function positiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Mock QR deposit amount must be greater than zero.");
  }
  return amount;
}

function safeCurrency(value) {
  const currency = safeString(value, "THB").trim().toUpperCase();
  return currency || "THB";
}

function safeProviderMode(value) {
  const providerMode = safeString(value, "mock").trim().toLowerCase();
  if (!ALLOWED_PROVIDER_MODES.has(providerMode)) {
    throw new Error("Phase AP QR deposit providerMode must be mock or sandbox.");
  }
  return providerMode;
}

function isoFrom(value, fallback) {
  const date = value ? new Date(value) : fallback;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Mock QR deposit timestamp must be valid.");
  }
  return date.toISOString();
}

function mockHash(parts) {
  return `mock-hash-${crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 24)}`;
}

function createMockQrDepositOrder(input = {}) {
  const now = input.createdAt ? new Date(input.createdAt) : new Date("2026-06-01T00:00:00.000Z");
  if (Number.isNaN(now.getTime())) throw new Error("Mock QR deposit createdAt must be valid.");
  const ttlMinutes = Number.isFinite(Number(input.ttlMinutes)) && Number(input.ttlMinutes) > 0 ? Number(input.ttlMinutes) : 15;
  const expires = input.expiresAt ? new Date(input.expiresAt) : new Date(now.getTime() + ttlMinutes * 60 * 1000);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= now.getTime()) {
    throw new Error("Mock QR deposit expiresAt must be after createdAt.");
  }

  const amount = positiveAmount(input.amount);
  const providerMode = safeProviderMode(input.providerMode);
  const memberId = safeString(input.memberId, "member-mock-001").trim() || "member-mock-001";
  const orderId = safeString(input.orderId, "qr-mock-order-001").trim() || "qr-mock-order-001";
  const currency = safeCurrency(input.currency);
  const qrMockId = safeString(input.qrMockId, `${orderId}-qr-mock`).trim() || `${orderId}-qr-mock`;
  const qrPayloadMockHash =
    safeString(input.qrPayloadMockHash).trim() ||
    mockHash([QR_DEPOSIT_PROVIDER_KEY, providerMode, orderId, memberId, amount, currency, "MOCK_QR_ONLY"]);

  return {
    providerKey: QR_DEPOSIT_PROVIDER_KEY,
    providerMode,
    orderId,
    memberId,
    amount,
    currency,
    createdAt: isoFrom(now, now),
    expiresAt: isoFrom(expires, expires),
    qrMockId,
    qrPayloadMockHash,
    qrDownloadFileName: `${orderId}-mock-qr.txt`,
    qrDownloadMimeType: "text/plain",
    qrDownloadAllowed: true,
    qrPreviewAltText: `Mock QR preview for sandbox deposit order ${orderId}`,
    status: QR_DEPOSIT_STATES.QR_READY,
    reviewRequired: false,
    source: "member_qr_deposit_mock",
    mockOnlyMarker: "MOCK_QR_ONLY_NOT_PAYABLE",
    walletCreditAmount: 0,
    externalNetworkCalled: false,
    realMoneyFlow: false,
  };
}

function createMockQrDownloadArtifact(order) {
  const safeOrder = validateOrder(order);
  if (!safeOrder.qrDownloadAllowed || safeOrder.status === QR_DEPOSIT_STATES.EXPIRED || safeOrder.status === QR_DEPOSIT_STATES.CANCELLED) {
    throw new Error("Mock QR download is not allowed for expired or cancelled orders.");
  }

  const body = [
    "MOCK_QR_DOWNLOAD_ARTIFACT",
    "MOCK_QR_ONLY_NOT_PAYABLE",
    `providerKey:${safeOrder.providerKey}`,
    `providerMode:${safeOrder.providerMode}`,
    `orderId:${safeOrder.orderId}`,
    `memberId:${safeOrder.memberId}`,
    `amount:${safeOrder.amount}`,
    `currency:${safeOrder.currency}`,
    `qrPayloadMockHash:${safeOrder.qrPayloadMockHash}`,
    "downloadMustNeverCreateCredit:true",
    "noExternalNetwork:true",
    "noRealMoney:true",
  ].join("\n");

  const artifact = {
    fileName: safeOrder.qrDownloadFileName,
    mimeType: safeOrder.qrDownloadMimeType,
    body,
    mockOnly: true,
    paymentCapable: false,
    creditsMember: false,
  };
  assertMockQrIsNotRealPaymentQr(artifact);
  return artifact;
}

function markMockQrDownloaded(order) {
  const safeOrder = validateOrder(order);
  if (safeOrder.status === QR_DEPOSIT_STATES.EXPIRED || safeOrder.status === QR_DEPOSIT_STATES.CANCELLED) {
    throw new Error("Expired or cancelled mock QR order cannot be downloaded.");
  }
  return {
    ...safeOrder,
    status: QR_DEPOSIT_STATES.QR_DOWNLOADED,
    downloadedAt: safeString(safeOrder.downloadedAt, safeOrder.createdAt),
    qrDownloadAllowed: true,
    reviewRequired: true,
    walletCreditAmount: 0,
    creditCreated: false,
  };
}

function expireMockQrOrder(order) {
  const safeOrder = validateOrder(order);
  return {
    ...safeOrder,
    status: QR_DEPOSIT_STATES.EXPIRED,
    qrDownloadAllowed: false,
    reviewRequired: true,
    matched: false,
    walletCreditAmount: 0,
  };
}

function cancelMockQrOrder(order) {
  const safeOrder = validateOrder(order);
  return {
    ...safeOrder,
    status: QR_DEPOSIT_STATES.CANCELLED,
    qrDownloadAllowed: false,
    reviewRequired: true,
    matched: false,
    walletCreditAmount: 0,
  };
}

function normalizeQrDepositEvent(order) {
  const safeOrder = validateOrder(order);
  const normalizedStatus = normalizeEventStatus(safeOrder);
  return {
    providerKey: safeOrder.providerKey,
    providerEventId: `${safeOrder.orderId}-mock-event`,
    providerTransactionId: safeOrder.orderId,
    orderId: safeOrder.orderId,
    memberId: safeOrder.memberId,
    amount: safeOrder.amount,
    currency: safeOrder.currency,
    occurredAt: safeString(safeOrder.downloadedAt, safeOrder.createdAt),
    receiverAccountMasked: "mock-qr-receiver",
    senderAccountMasked: "member-mock-source",
    reference: safeOrder.orderId,
    rawHash: safeOrder.qrPayloadMockHash,
    confidence: "weak",
    status: normalizedStatus,
    reviewRequired: true,
    source: safeOrder.source,
    contractMode: safeOrder.providerMode,
    qrMockId: safeOrder.qrMockId,
    mockOnly: true,
    creditsMember: false,
  };
}

function buildQrDepositIdempotencyKey(event) {
  const source = event && typeof event === "object" ? event : {};
  const providerKey = safeString(source.providerKey, QR_DEPOSIT_PROVIDER_KEY).trim();
  const orderId = safeString(source.orderId || source.providerTransactionId).trim();
  if (providerKey !== QR_DEPOSIT_PROVIDER_KEY || !orderId) {
    throw new Error("QR deposit idempotency key requires providerKey and orderId.");
  }
  return `${providerKey}:${orderId}`;
}

function assertNoLiveQrProviderMode(env = {}) {
  const checkedKeys = [
    "PAYMENT_PROVIDER_MODE",
    "QR_PAYMENT_PROVIDER_MODE",
    "QR_PAYMENT_GATEWAY_MODE",
    "MEMBER_QR_DEPOSIT_PROVIDER_MODE",
  ];
  for (const key of checkedKeys) {
    const value = safeString(env[key]).trim();
    if (BLOCKED_PROVIDER_MODE_PATTERN.test(value)) {
      throw new Error(`${key} live QR provider mode is blocked in Phase AP mock contract.`);
    }
  }
  return true;
}

function assertMockQrIsNotRealPaymentQr(artifact) {
  const text = typeof artifact === "string" ? artifact : JSON.stringify(artifact);
  if (!text.includes("MOCK_QR_ONLY_NOT_PAYABLE") || !text.includes("MOCK_QR_DOWNLOAD_ARTIFACT")) {
    throw new Error("Mock QR artifact must include mock-only markers.");
  }
  for (const pattern of REAL_PAYMENT_QR_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error("Mock QR artifact contains a real-payment-like QR marker.");
    }
  }
  if (/credit(s|ed)?Member\s*:\s*true/i.test(text)) {
    throw new Error("Mock QR artifact must not credit member.");
  }
  return true;
}

function normalizeEventStatus(order) {
  if (order.status === QR_DEPOSIT_STATES.EXPIRED) return "expired";
  if (order.status === QR_DEPOSIT_STATES.CANCELLED) return "manual_review";
  if (order.status === QR_DEPOSIT_STATES.FAILED) return "failed";
  if (order.status === QR_DEPOSIT_STATES.MANUAL_REVIEW) return "manual_review";
  return "pending";
}

function validateOrder(order) {
  if (!order || typeof order !== "object") throw new Error("Mock QR deposit order is required.");
  if (order.providerKey !== QR_DEPOSIT_PROVIDER_KEY) throw new Error("Mock QR deposit order providerKey mismatch.");
  safeProviderMode(order.providerMode);
  positiveAmount(order.amount);
  if (!safeString(order.orderId).trim()) throw new Error("Mock QR deposit orderId is required.");
  if (!safeString(order.qrPayloadMockHash).trim()) throw new Error("Mock QR deposit qrPayloadMockHash is required.");
  return order;
}

module.exports = {
  QR_DEPOSIT_STATES,
  QR_DEPOSIT_PROVIDER_KEY,
  createMockQrDepositOrder,
  createMockQrDownloadArtifact,
  markMockQrDownloaded,
  expireMockQrOrder,
  cancelMockQrOrder,
  normalizeQrDepositEvent,
  buildQrDepositIdempotencyKey,
  assertNoLiveQrProviderMode,
  assertMockQrIsNotRealPaymentQr,
};
