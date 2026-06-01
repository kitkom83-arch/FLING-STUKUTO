"use strict";

const assert = require("assert");

const {
  DEPOSIT_VERIFICATION_SOURCE_TYPES,
  DEPOSIT_VERIFICATION_STATUSES,
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
} = require("./depositVerificationSourceContract");

function runCase(label, fn) {
  fn();
  return `${label}: PASS`;
}

function duplicateGuard(sources) {
  const seen = {
    orderId: new Set(),
    providerTransactionId: new Set(),
    rawHash: new Set(),
  };
  const duplicates = [];
  for (const source of sources.map(normalizeDepositVerificationSource)) {
    for (const field of Object.keys(seen)) {
      if (source[field] && seen[field].has(source[field])) {
        duplicates.push({ field, status: DEPOSIT_VERIFICATION_STATUSES.SOURCE_DUPLICATE_SUSPECT });
      }
      seen[field].add(source[field]);
    }
  }
  return duplicates;
}

function runDepositVerificationSourceMockHarness() {
  const lines = [];
  const expected = {
    orderId: "aq-order-001",
    amount: 500,
    currency: "THB",
  };

  assertNoLiveVerificationMode({
    PAYMENT_PROVIDER_MODE: "mock",
    DEPOSIT_VERIFICATION_MODE: "mock",
    QR_PAYMENT_PROVIDER_MODE: "sandbox",
    BANK_STATEMENT_MODE: "mock",
    SMS_PROVIDER_MODE: "mock",
    SLIP_OCR_MODE: "mock",
    TRUEMONEY_PROVIDER_MODE: "mock",
    TMNONE_PROVIDER_MODE: "sandbox",
  });

  lines.push(
    runCase("QR mock order source normalizes", () => {
      const source = createMockQrOrderSource(expected);
      assert.strictEqual(source.sourceType, DEPOSIT_VERIFICATION_SOURCE_TYPES.QR_MOCK_ORDER);
      assert.strictEqual(source.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_RECEIVED);
      assertNoAutoCreditFromSource(source);
    })
  );

  lines.push(
    runCase("QR downloaded source does not credit", () => {
      const source = createMockQrOrderSource({ ...expected, qrDownloaded: true });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_PENDING);
      assert.strictEqual(evaluated.matched, false);
      assertNoAutoCreditFromSource(evaluated);
    })
  );

  lines.push(
    runCase("expired QR cannot become matched", () => {
      const source = createMockQrOrderSource({ ...expected, qrOrderStatus: "expired" });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_EXPIRED);
      assert.strictEqual(evaluated.matched, false);
    })
  );

  lines.push(
    runCase("cancelled QR cannot become matched", () => {
      const source = createMockQrOrderSource({ ...expected, qrOrderStatus: "cancelled" });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_CANCELLED);
      assert.strictEqual(evaluated.matched, false);
    })
  );

  lines.push(
    runCase("payment provider mock source can become matched", () => {
      const source = createMockPaymentProviderSource(expected);
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MATCHED);
      assertNoAutoCreditFromSource(evaluated);
    })
  );

  lines.push(
    runCase("verified slip source can become matched", () => {
      const source = createMockSlipVerificationSource({ ...expected, confidence: "verified" });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MATCHED);
    })
  );

  lines.push(
    runCase("uncertain slip source becomes manual_review", () => {
      const source = createMockSlipVerificationSource({ ...expected, confidence: "weak" });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW);
      assert.strictEqual(evaluated.reviewRequired, true);
    })
  );

  lines.push(
    runCase("bank statement matched source can become matched", () => {
      const source = createMockBankStatementSource({ ...expected, matched: true });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MATCHED);
    })
  );

  lines.push(
    runCase("bank statement unmatched becomes manual_review", () => {
      const source = createMockBankStatementSource({ ...expected, matched: false });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW);
    })
  );

  lines.push(
    runCase("bank SMS fallback always manual_review", () => {
      const source = createMockBankSmsFallbackSource({ ...expected, confidence: "verified", status: "source_matched" });
      const evaluated = evaluateDepositVerificationMatch(source, expected);
      assert.strictEqual(evaluated.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW);
      assert.strictEqual(evaluated.confidence, "weak");
    })
  );

  lines.push(
    runCase("SMS-only cannot credit", () => {
      const source = createMockBankSmsFallbackSource(expected);
      assertNoAutoCreditFromSource(source);
      assert.strictEqual(source.matched, false);
    })
  );

  lines.push(
    runCase("manual admin source requires reason", () => {
      assert.throws(() => createMockManualAdminSource(expected), /requires reason/);
      const source = createMockManualAdminSource({ ...expected, reason: "mock operator review reason" });
      assert.strictEqual(source.status, DEPOSIT_VERIFICATION_STATUSES.SOURCE_MANUAL_REVIEW);
    })
  );

  const baseProvider = createMockPaymentProviderSource({
    ...expected,
    providerTransactionId: "aq-provider-tx-001",
    rawHash: "mock-raw-hash-aq-001",
  });

  lines.push(
    runCase("duplicate orderId detected", () => {
      const duplicates = duplicateGuard([
        baseProvider,
        createMockSlipVerificationSource({
          ...expected,
          providerTransactionId: "aq-provider-tx-002",
          rawHash: "mock-raw-hash-aq-002",
        }),
      ]);
      assert(duplicates.some((item) => item.field === "orderId"));
    })
  );

  lines.push(
    runCase("duplicate providerTransactionId detected", () => {
      const duplicates = duplicateGuard([
        baseProvider,
        createMockPaymentProviderSource({
          ...expected,
          orderId: "aq-order-002",
          providerTransactionId: baseProvider.providerTransactionId,
          rawHash: "mock-raw-hash-aq-003",
        }),
      ]);
      assert(duplicates.some((item) => item.field === "providerTransactionId"));
    })
  );

  lines.push(
    runCase("duplicate rawHash detected", () => {
      const duplicates = duplicateGuard([
        baseProvider,
        createMockBankStatementSource({
          ...expected,
          orderId: "aq-order-003",
          providerTransactionId: "aq-provider-tx-003",
          rawHash: baseProvider.rawHash,
        }),
      ]);
      assert(duplicates.some((item) => item.field === "rawHash"));
    })
  );

  lines.push(
    runCase("no live verification mode allowed", () => {
      assert.throws(() => assertNoLiveVerificationMode({ DEPOSIT_VERIFICATION_MODE: "live" }), /blocked/);
    })
  );

  lines.push(
    runCase("no external network marker", () => {
      assert.strictEqual(baseProvider.externalNetworkCalled, false);
    })
  );

  lines.push(
    runCase("no real money marker", () => {
      assert.strictEqual(baseProvider.realMoneyFlow, false);
      assert.strictEqual(baseProvider.walletCreditAmount, 0);
    })
  );

  const result = {
    success: true,
    phase: "Phase AQ Deposit Verification Source Mock Harness",
    mode: "docs/static/mock only",
    noProductionDb: true,
    noExternalNetwork: true,
    noRealMoney: true,
    noRealQr: true,
    noRealPayment: true,
    noLiveProvider: true,
    noPayout: true,
    noRuntimeMoneyFlow: true,
    noAutoCreditFromVerificationSource: true,
    idempotencyKey: buildDepositVerificationIdempotencyKey(baseProvider),
    cases: lines,
  };
  assertNoSecretShapedValues(result);

  lines.push(
    runCase("no secret-shaped values in output", () => {
      assertNoSecretShapedValues(result);
    })
  );

  result.cases = lines;
  return result;
}

if (require.main === module) {
  try {
    const result = runDepositVerificationSourceMockHarness();
    console.log("Deposit verification source mock harness: PASS");
    for (const line of result.cases) console.log(line);
    console.log("no external network: PASS");
    console.log("no real money: PASS");
    console.log("no auto-credit from verification source: PASS");
    console.log("no secret-shaped values: PASS");
  } catch (error) {
    console.error("Deposit verification source mock harness: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runDepositVerificationSourceMockHarness,
};
