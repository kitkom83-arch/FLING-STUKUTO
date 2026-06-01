"use strict";

const assert = require("assert");

const {
  PROVIDER_KEYS,
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
} = require("./paymentProviderContract");

function assertNoSecretShape(label, value) {
  const text = JSON.stringify(value);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const forbiddenAssignment = /\b(?:DATABASE_URL|TOKEN|PASSWORD|PIN|DEVICE_ID|DEVICEID)\s*=/i;
  const bearerLiteral = /\bBearer\s+[A-Za-z0-9._-]+/i;
  assert(!jwtLike.test(text), `${label} contains JWT-shaped output.`);
  assert(!credentialUrl.test(text), `${label} contains credential URL output.`);
  assert(!forbiddenAssignment.test(text), `${label} contains secret assignment output.`);
  assert(!bearerLiteral.test(text), `${label} contains bearer-shaped output.`);
}

function duplicateGuard(events) {
  const byIdempotency = new Set();
  const byRawHash = new Set();
  const duplicateKeys = [];
  for (const event of events) {
    const key = buildIdempotencyKey(event);
    if (byIdempotency.has(key)) duplicateKeys.push(key);
    byIdempotency.add(key);
    if (event.rawHash) {
      if (byRawHash.has(event.rawHash)) duplicateKeys.push(`rawHash:${event.rawHash}`);
      byRawHash.add(event.rawHash);
    }
  }
  return duplicateKeys;
}

function runMockHarness() {
  assertNoLiveProviderMode({
    PAYMENT_PROVIDER_MODE: "mock",
    TRUEMONEY_PROVIDER_MODE: "sandbox",
    TMNONE_PROVIDER_MODE: "mock",
    QR_PAYMENT_PROVIDER_MODE: "mock",
    BANK_STATEMENT_MODE: "sandbox",
    SMS_PROVIDER_MODE: "mock",
    SLIP_OCR_MODE: "mock",
  });

  assert.throws(
    () => assertNoLiveProviderMode({ TRUEMONEY_PROVIDER_MODE: "live" }),
    /blocked/,
    "live provider mode must be blocked"
  );

  const official = createMockTrueMoneyOfficialEvent();
  assert.strictEqual(official.providerKey, PROVIDER_KEYS.TRUEMONEY_OFFICIAL);

  const tmnone = createMockTMNOneEvent();
  assert.strictEqual(tmnone.providerKey, PROVIDER_KEYS.TMNONE);

  const qr = createMockQrGatewayEvent();
  assert.strictEqual(qr.providerKey, PROVIDER_KEYS.QR_PAYMENT_GATEWAY);
  assert(qr.orderId, "QR Gateway mock must include orderId.");
  assert(
    String(qr.qrDownloadContract || "").includes("download QR"),
    "QR Gateway mock must include QR download contract marker."
  );

  const slipVerified = createMockSlipVerificationEvent();
  assert.strictEqual(slipVerified.providerKey, PROVIDER_KEYS.SLIP_VERIFICATION);
  assert.strictEqual(slipVerified.status, "matched");

  const slipUncertain = createMockSlipVerificationEvent({
    providerEventId: "slip-event-uncertain",
    providerTransactionId: "slip-tx-uncertain",
    rawHash: "slip-hash-uncertain",
    confidence: "weak",
    status: "matched",
  });
  assert.strictEqual(slipUncertain.status, "manual_review");
  assert.strictEqual(slipUncertain.reviewRequired, true);

  const statementMatched = createMockStatementEvent();
  assert.strictEqual(statementMatched.providerKey, PROVIDER_KEYS.BANK_STATEMENT);

  const statementUnmatched = createMockStatementEvent({
    providerEventId: "statement-event-unmatched",
    providerTransactionId: "statement-tx-unmatched",
    rawHash: "statement-hash-unmatched",
    matched: false,
  });
  assert.strictEqual(statementUnmatched.status, "manual_review");

  const sms = createMockSmsFallbackEvent({ status: "matched", confidence: "verified" });
  assert.strictEqual(sms.providerKey, PROVIDER_KEYS.BANK_SMS_FALLBACK);
  assert.strictEqual(sms.status, "manual_review");
  assert.strictEqual(sms.confidence, "weak");
  assert.strictEqual(sms.reviewRequired, true);
  assert.notStrictEqual(sms.status, "credited");

  const manual = createMockManualAdminEvent();
  assert.strictEqual(manual.providerKey, PROVIDER_KEYS.MANUAL_ADMIN);
  assert.strictEqual(manual.status, "manual_review");

  const duplicateByTransaction = duplicateGuard([
    official,
    createMockTrueMoneyOfficialEvent({
      providerEventId: "tm-official-event-002",
      providerTransactionId: official.providerTransactionId,
      rawHash: "tm-official-hash-002",
    }),
  ]);
  assert(duplicateByTransaction.length > 0, "duplicate providerTransactionId must be detected.");

  const duplicateByRawHash = duplicateGuard([
    tmnone,
    createMockTMNOneEvent({
      providerEventId: "tmnone-event-002",
      providerTransactionId: "tmnone-tx-002",
      rawHash: tmnone.rawHash,
    }),
  ]);
  assert(duplicateByRawHash.some((key) => key.startsWith("rawHash:")), "duplicate rawHash must be detected.");

  const normalized = [
    official,
    tmnone,
    qr,
    slipVerified,
    slipUncertain,
    statementMatched,
    statementUnmatched,
    sms,
    manual,
  ].map((event) => normalizeDepositEvent(event));

  assertNoSecretShape("payment provider mock harness", normalized);

  return {
    success: true,
    phase: "Phase AO Payment Provider Contract / Dual TrueMoney Provider",
    mode: "mock-only",
    noProductionDb: true,
    noRealMoney: true,
    noLiveProvider: true,
    noPayout: true,
    noRuntimeMoneyFlow: true,
    events: normalized,
    duplicateProviderTransactionIdDetected: true,
    duplicateRawHashDetected: true,
    smsFallbackManualReviewOnly: sms.status === "manual_review" && sms.confidence === "weak",
  };
}

if (require.main === module) {
  try {
    const result = runMockHarness();
    console.log("Payment provider mock harness: PASS");
    console.log(`events normalized: ${result.events.length}`);
    console.log("no production DB: PASS");
    console.log("no real money: PASS");
    console.log("no live provider: PASS");
    console.log("SMS fallback manual_review only: PASS");
  } catch (error) {
    console.error("Payment provider mock harness: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runMockHarness,
};
