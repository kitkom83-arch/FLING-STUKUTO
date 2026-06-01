"use strict";

const assert = require("assert");

const {
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
} = require("./depositLedgerReconciliationGuard");

function runCase(label, fn) {
  fn();
  return `${label}: PASS`;
}

function baseInput(overrides = {}) {
  return createMockLedgerGuardInput({
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
    ...overrides,
  });
}

function assertCandidateOnly(result) {
  assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.LEDGER_POSTING_CANDIDATE_MOCK);
  assert.strictEqual(result.guardStatus, DEPOSIT_LEDGER_GUARD_STATUSES.CANDIDATE_MOCK);
  assert.strictEqual(result.reconciliationStatus, DEPOSIT_RECONCILIATION_STATUSES.RECONCILED_MOCK);
  assertNoAutoCreditFromLedgerGuard(result);
  assertNoRuntimeLedgerMutation(result);
}

function assertNotCandidate(result) {
  assert.notStrictEqual(
    result.recommendationType,
    DEPOSIT_LEDGER_RECOMMENDATION_TYPES.LEDGER_POSTING_CANDIDATE_MOCK
  );
  assertNoAutoCreditFromLedgerGuard(result);
  assertNoRuntimeLedgerMutation(result);
}

function runDepositLedgerReconciliationGuardHarness() {
  const lines = [];

  assertNoLiveLedgerMode({
    LEDGER_MODE: "mock",
    DEPOSIT_LEDGER_GUARD_MODE: "mock",
    RECONCILIATION_MODE: "mock",
    PAYMENT_PROVIDER_MODE: "mock",
    BANK_STATEMENT_MODE: "mock",
    SMS_PROVIDER_MODE: "mock",
    SLIP_OCR_MODE: "mock",
    TRUEMONEY_PROVIDER_MODE: "mock",
    TMNONE_PROVIDER_MODE: "sandbox",
  });

  lines.push(
    runCase("verified payment provider source becomes ledger_posting_candidate_mock only", () => {
      const result = evaluateLedgerPostingEligibility(baseInput());
      assertCandidateOnly(result);
    })
  );

  lines.push(
    runCase("ledger_posting_candidate_mock does not credit member", () => {
      const result = evaluateLedgerPostingEligibility(baseInput());
      assert.strictEqual(result.canCreditMember, false);
      assert.strictEqual(result.creditsMember, false);
      assertNoAutoCreditFromLedgerGuard(result);
    })
  );

  lines.push(
    runCase("ledger_posting_candidate_mock does not mutate wallet", () => {
      const result = evaluateLedgerPostingEligibility(baseInput());
      assert.strictEqual(result.walletMutated, false);
      assert.strictEqual(result.runtimeLedgerMutation, false);
      assertNoRuntimeLedgerMutation(result);
    })
  );

  lines.push(
    runCase("QR downloaded source does not credit", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({
          sourceType: "qr_mock_order",
          qrDownloaded: true,
          matched: false,
          confidence: "weak",
          status: "source_pending",
        })
      );
      assert.strictEqual(result.canCreditMember, false);
      assertNotCandidate(result);
    })
  );

  lines.push(
    runCase("QR downloaded source does not become ledger candidate", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "qr_mock_order", qrDownloaded: true, matched: false })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED);
    })
  );

  lines.push(
    runCase("expired QR cannot become ledger candidate", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "qr_mock_order", qrOrderStatus: "expired", matched: true })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.REJECT);
      assertNotCandidate(result);
    })
  );

  lines.push(
    runCase("cancelled QR cannot become ledger candidate", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "qr_mock_order", qrOrderStatus: "cancelled", matched: true })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.REJECT);
      assertNotCandidate(result);
    })
  );

  lines.push(
    runCase("SMS fallback always manual_review_required", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "bank_sms_fallback_mock", confidence: "verified", matched: true })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED);
      assert.strictEqual(result.guardStatus, DEPOSIT_LEDGER_GUARD_STATUSES.MANUAL_REVIEW);
    })
  );

  lines.push(
    runCase("SMS-only cannot credit", () => {
      const result = evaluateLedgerPostingEligibility(baseInput({ sourceType: "bank_sms_fallback_mock" }));
      assert.strictEqual(result.canCreditMember, false);
      assertNotCandidate(result);
    })
  );

  lines.push(
    runCase("verified slip source can become ledger candidate mock", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "slip_verification_mock", confidence: "verified", matched: true })
      );
      assertCandidateOnly(result);
    })
  );

  lines.push(
    runCase("uncertain slip source becomes manual_review_required", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "slip_verification_mock", confidence: "weak", matched: false })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED);
    })
  );

  lines.push(
    runCase("bank statement matched source can become ledger candidate mock", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "bank_statement_mock", confidence: "high", matched: true })
      );
      assertCandidateOnly(result);
    })
  );

  lines.push(
    runCase("bank statement unmatched becomes manual_review_required", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ sourceType: "bank_statement_mock", confidence: "medium", matched: false })
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED);
    })
  );

  lines.push(
    runCase("amount mismatch becomes mismatch_review_required", () => {
      const result = evaluateLedgerPostingEligibility(baseInput({ amount: 501, expectedAmount: 500 }));
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MISMATCH_REVIEW_REQUIRED);
      assert(result.mismatchFields.includes("amount"));
    })
  );

  lines.push(
    runCase("member mismatch becomes mismatch_review_required", () => {
      const result = evaluateLedgerPostingEligibility(baseInput({ memberId: "member-mock-002" }));
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MISMATCH_REVIEW_REQUIRED);
      assert(result.mismatchFields.includes("member"));
    })
  );

  lines.push(
    runCase("currency mismatch becomes mismatch_review_required", () => {
      const result = evaluateLedgerPostingEligibility(baseInput({ currency: "USD", expectedCurrency: "THB" }));
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MISMATCH_REVIEW_REQUIRED);
      assert(result.mismatchFields.includes("currency"));
    })
  );

  lines.push(
    runCase("manual admin source requires reason", () => {
      assert.throws(() => normalizeLedgerGuardInput({ ...baseInput(), sourceType: "manual_admin_mock", reason: "" }), /reason/);
      const source = baseInput({ sourceType: "manual_admin_mock", reason: "mock operator review reason" });
      assertManualAdminReasonRequired(source);
      const result = evaluateLedgerPostingEligibility(source);
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.MANUAL_REVIEW_REQUIRED);
    })
  );

  lines.push(
    runCase("duplicate orderId detected", () => {
      const result = evaluateLedgerPostingEligibility(baseInput(), { orderIds: ["ar-order-001"] });
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT);
      assert.strictEqual(result.duplicateField, "orderId");
    })
  );

  lines.push(
    runCase("duplicate providerTransactionId detected", () => {
      const result = evaluateLedgerPostingEligibility(baseInput({ orderId: "ar-order-002" }), {
        providerTransactionIds: ["ar-provider-tx-001"],
      });
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT);
      assert.strictEqual(result.duplicateField, "providerTransactionId");
    })
  );

  lines.push(
    runCase("duplicate rawHash detected", () => {
      const result = evaluateLedgerPostingEligibility(
        baseInput({ orderId: "ar-order-003", providerTransactionId: "ar-provider-tx-003" }),
        { rawHashes: ["mock_raw_hash_ar_001"] }
      );
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT);
      assert.strictEqual(result.duplicateField, "rawHash");
    })
  );

  lines.push(
    runCase("idempotency key stable for same input", () => {
      const first = buildLedgerGuardIdempotencyKey(baseInput());
      const second = buildLedgerGuardIdempotencyKey(baseInput());
      assert.strictEqual(first, second);
    })
  );

  lines.push(
    runCase("idempotency conflict detected for changed amount with same order/provider transaction", () => {
      const original = baseInput();
      const changed = baseInput({ amount: 700, expectedAmount: 700 });
      const key = buildLedgerGuardIdempotencyKey(original);
      assert.strictEqual(key, buildLedgerGuardIdempotencyKey(changed));
      const result = evaluateLedgerPostingEligibility(changed, {
        idempotencyPayloadByKey: {
          [key]: "different_mock_payload_signature",
        },
      });
      assert.strictEqual(result.recommendationType, DEPOSIT_LEDGER_RECOMMENDATION_TYPES.DUPLICATE_SUSPECT);
      assert.strictEqual(result.idempotencyConflict, true);
    })
  );

  lines.push(
    runCase("no live ledger mode allowed", () => {
      assert.throws(() => assertNoLiveLedgerMode({ DEPOSIT_LEDGER_GUARD_MODE: "live" }), /blocked/);
    })
  );

  lines.push(
    runCase("no external network marker", () => {
      const result = evaluateLedgerPostingEligibility(baseInput());
      assert.strictEqual(result.externalNetworkCalled, false);
    })
  );

  lines.push(
    runCase("no real money marker", () => {
      const result = evaluateLedgerPostingEligibility(baseInput());
      assert.strictEqual(result.realMoneyFlow, false);
      assert.strictEqual(result.noRealMoney, true);
    })
  );

  lines.push(
    runCase("reconciliation snapshot does not mutate wallet", () => {
      const snapshot = createMockReconciliationSnapshot(baseInput());
      const evaluated = evaluateReconciliationSnapshot(snapshot);
      assert.strictEqual(evaluated.walletMutated, false);
      assertNoRuntimeLedgerMutation(evaluated);
    })
  );

  lines.push(
    runCase("duplicate guard helper detects rawHash", () => {
      const duplicate = detectLedgerDuplicate(baseInput(), { rawHashes: ["mock_raw_hash_ar_001"] });
      assert.strictEqual(duplicate.duplicate, true);
      assert.strictEqual(duplicate.duplicateField, "rawHash");
    })
  );

  const result = {
    success: true,
    phase: "Phase AR Ledger/Reconciliation Guard",
    mode: "docs/static/mock only",
    noProductionDb: true,
    noExternalNetwork: true,
    noRealMoney: true,
    noRealQr: true,
    noRealPayment: true,
    noLiveProvider: true,
    noPayout: true,
    noRuntimeLedgerMutation: true,
    noAutoCreditFromLedgerGuard: true,
    recommendationType: evaluateLedgerPostingEligibility(baseInput()).recommendationType,
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
    const result = runDepositLedgerReconciliationGuardHarness();
    console.log("Deposit ledger reconciliation guard harness: PASS");
    for (const line of result.cases) console.log(line);
    console.log("no external network: PASS");
    console.log("no real money: PASS");
    console.log("no auto-credit from ledger guard: PASS");
    console.log("no runtime ledger mutation: PASS");
    console.log("no secret-shaped values: PASS");
  } catch (error) {
    console.error("Deposit ledger reconciliation guard harness: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runDepositLedgerReconciliationGuardHarness,
};
