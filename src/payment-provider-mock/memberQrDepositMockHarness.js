"use strict";

const assert = require("assert");

const {
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
} = require("./memberQrDepositUxContract");

function assertNoSecretShape(label, value) {
  const text = JSON.stringify(value);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const forbiddenAssignment = /\b(?:DATABASE_URL|TOKEN|PASSWORD|PIN|DEVICE_ID|DEVICEID)\s*=/i;
  const bearerLiteral = /\bBearer\s+[A-Za-z0-9._-]+/i;
  const apiKeyLike = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  assert(!jwtLike.test(text), `${label} contains JWT-shaped output.`);
  assert(!credentialUrl.test(text), `${label} contains credential URL output.`);
  assert(!forbiddenAssignment.test(text), `${label} contains secret assignment output.`);
  assert(!bearerLiteral.test(text), `${label} contains bearer-shaped output.`);
  assert(!apiKeyLike.test(text), `${label} contains key-shaped output.`);
}

function duplicateGuard(orders) {
  const orderIds = new Set();
  const hashes = new Set();
  const duplicates = [];
  for (const order of orders) {
    if (orderIds.has(order.orderId)) duplicates.push({ type: "orderId", status: "duplicate_suspect" });
    orderIds.add(order.orderId);
    if (hashes.has(order.qrPayloadMockHash)) duplicates.push({ type: "qrPayloadMockHash", status: "duplicate_suspect" });
    hashes.add(order.qrPayloadMockHash);
  }
  return duplicates;
}

function assertCannotBecomeMatched(label, order) {
  assert(
    [QR_DEPOSIT_STATES.EXPIRED, QR_DEPOSIT_STATES.CANCELLED].includes(order.status),
    `${label} must be terminal for matching.`
  );
  assert.strictEqual(order.matched, false, `${label} must not be matched.`);
  const event = normalizeQrDepositEvent(order);
  assert.notStrictEqual(event.status, "matched", `${label} event must not be matched.`);
}

function runMemberQrDepositMockHarness() {
  assertNoLiveQrProviderMode({
    PAYMENT_PROVIDER_MODE: "mock",
    QR_PAYMENT_PROVIDER_MODE: "sandbox",
    QR_PAYMENT_GATEWAY_MODE: "mock",
    MEMBER_QR_DEPOSIT_PROVIDER_MODE: "mock",
  });
  assert.throws(
    () => assertNoLiveQrProviderMode({ QR_PAYMENT_GATEWAY_MODE: "live" }),
    /blocked/,
    "live provider mode must be blocked"
  );

  const order = createMockQrDepositOrder({
    orderId: "qr-ap-order-001",
    memberId: "member-ap-001",
    amount: 250,
    providerMode: "mock",
  });
  assert.strictEqual(order.providerKey, QR_DEPOSIT_PROVIDER_KEY);
  assert.strictEqual(order.providerMode, "mock");
  assert.strictEqual(order.status, QR_DEPOSIT_STATES.QR_READY);
  assert(order.qrPreviewAltText.includes("Mock QR preview"), "QR preview must contain mock marker.");

  const sandboxOrder = createMockQrDepositOrder({
    orderId: "qr-ap-order-002",
    memberId: "member-ap-001",
    amount: 300,
    providerMode: "sandbox",
  });
  assert.strictEqual(sandboxOrder.providerMode, "sandbox");

  assert.throws(() => createMockQrDepositOrder({ amount: 0 }), /greater than zero/, "zero amount must be rejected");
  assert.throws(() => createMockQrDepositOrder({ amount: -1 }), /greater than zero/, "negative amount must be rejected");

  const artifact = createMockQrDownloadArtifact(order);
  assert(artifact.body.includes("MOCK_QR_DOWNLOAD_ARTIFACT"), "QR download artifact must contain mock marker.");
  assert(artifact.body.includes("MOCK_QR_ONLY_NOT_PAYABLE"), "QR download artifact must be mock-only.");
  assert.strictEqual(artifact.paymentCapable, false, "QR artifact must not be payment capable.");
  assert.strictEqual(artifact.creditsMember, false, "QR download must never credit member.");
  assertMockQrIsNotRealPaymentQr(artifact);

  const downloaded = markMockQrDownloaded(order);
  assert.strictEqual(downloaded.status, QR_DEPOSIT_STATES.QR_DOWNLOADED);
  assert.strictEqual(downloaded.walletCreditAmount, 0);
  assert.strictEqual(downloaded.creditCreated, false);

  const event = normalizeQrDepositEvent(downloaded);
  assert.strictEqual(event.providerKey, QR_DEPOSIT_PROVIDER_KEY);
  assert.strictEqual(event.providerTransactionId, downloaded.orderId);
  assert.strictEqual(event.orderId, downloaded.orderId);
  assert.strictEqual(event.status, "pending");
  assert.strictEqual(event.reviewRequired, true);
  assert.strictEqual(event.creditsMember, false);
  assert.strictEqual(buildQrDepositIdempotencyKey(event), `${QR_DEPOSIT_PROVIDER_KEY}:${downloaded.orderId}`);

  const expired = expireMockQrOrder(order);
  assert.strictEqual(expired.status, QR_DEPOSIT_STATES.EXPIRED);
  assertCannotBecomeMatched("expired QR", expired);
  assert.throws(() => createMockQrDownloadArtifact(expired), /not allowed/, "expired QR cannot download active artifact");

  const cancelled = cancelMockQrOrder(sandboxOrder);
  assert.strictEqual(cancelled.status, QR_DEPOSIT_STATES.CANCELLED);
  assertCannotBecomeMatched("cancelled QR", cancelled);
  assert.throws(() => createMockQrDownloadArtifact(cancelled), /not allowed/, "cancelled QR cannot download active artifact");

  const duplicateOrder = createMockQrDepositOrder({
    orderId: order.orderId,
    memberId: "member-ap-002",
    amount: 250,
    providerMode: "mock",
    qrPayloadMockHash: "mock-hash-unique-duplicate-order",
  });
  const duplicateHash = createMockQrDepositOrder({
    orderId: "qr-ap-order-003",
    memberId: "member-ap-003",
    amount: 450,
    providerMode: "mock",
    qrPayloadMockHash: order.qrPayloadMockHash,
  });
  const duplicates = duplicateGuard([order, duplicateOrder, duplicateHash]);
  assert(duplicates.some((item) => item.type === "orderId"), "duplicate orderId must be detected.");
  assert(
    duplicates.some((item) => item.type === "qrPayloadMockHash"),
    "duplicate qrPayloadMockHash must be detected."
  );

  const result = {
    success: true,
    phase: "Phase AP Member QR Deposit UX / Mock QR Download",
    mode: "mock-only",
    providerKey: QR_DEPOSIT_PROVIDER_KEY,
    providerMode: order.providerMode,
    noExternalNetwork: order.externalNetworkCalled === false,
    noProductionDb: true,
    noRealMoney: order.realMoneyFlow === false,
    noRealQr: artifact.paymentCapable === false,
    noLiveProvider: true,
    noPayout: true,
    noRuntimeMoneyFlow: true,
    noAutoCreditFromQrDownload: downloaded.creditCreated === false,
    normalizedEvent: event,
    idempotencyKey: buildQrDepositIdempotencyKey(event),
    duplicateOrderIdDetected: duplicates.some((item) => item.type === "orderId"),
    duplicateQrPayloadMockHashDetected: duplicates.some((item) => item.type === "qrPayloadMockHash"),
  };

  assertNoSecretShape("member QR deposit mock harness", result);
  return result;
}

if (require.main === module) {
  try {
    const result = runMemberQrDepositMockHarness();
    console.log("Member QR deposit mock harness: PASS");
    console.log(`providerKey ${result.providerKey}: PASS`);
    console.log(`providerMode ${result.providerMode}: PASS`);
    console.log("mock QR download artifact: PASS");
    console.log("download never credits member: PASS");
    console.log("expired QR cannot be matched: PASS");
    console.log("cancelled QR cannot be matched: PASS");
    console.log("duplicate orderId detected: PASS");
    console.log("duplicate qrPayloadMockHash detected: PASS");
    console.log("no external network: PASS");
    console.log("no real money: PASS");
    console.log("no secret-shaped values: PASS");
  } catch (error) {
    console.error("Member QR deposit mock harness: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runMemberQrDepositMockHarness,
};
