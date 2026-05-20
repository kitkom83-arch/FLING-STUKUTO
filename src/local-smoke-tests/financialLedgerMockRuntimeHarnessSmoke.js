const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md");
const HARNESS_PATH = path.join(ROOT, "src", "ledger-mock", "financialLedgerMockHarness.js");
const SMOKE_PATH = __filename;

const {
  createMockLedgerState,
  createLedgerAccount,
  getAccountBalance,
  applyMockDepositCredit,
  applyMockWithdrawReserve,
  applyMockWithdrawPaidMock,
  applyMockReversal,
  requestMockAdminAdjustment,
  approveMockAdminAdjustment,
  applyMockWheelRewardAwarded,
  applyMockProviderCallbackAdjustment,
  runMockReconciliation,
  sanitizeAuditSnapshot,
  assertNoLiveMoneyBoundary,
  assertNoSecretLeak,
} = require("../ledger-mock/financialLedgerMockHarness");

function readFile(filePath, label) {
  assert(fs.existsSync(filePath), `${label} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertHarnessIsolation(harnessText) {
  const forbiddenMarkers = [
    'require("prisma")',
    "PrismaClient",
    "fetch(",
    "axios",
    "http.request",
    "https.request",
    ["DATABASE", "_URL"].join(""),
  ];
  for (const marker of forbiddenMarkers) {
    assert(!harnessText.includes(marker), `Harness must not contain ${marker}.`);
  }
}

function assertNoSecretShapedValues(text, label) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const mongoProtocol = ["mongo", "db://"].join("");
  const mongoSrvProtocol = ["mongo", "db+srv://"].join("");
  const openAiKey = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerJwt = new RegExp(`\\b${["Be", "arer"].join("")}\\s+${["e", "y", "J"].join("")}[A-Za-z0-9._-]+`, "i");
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(mongoProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!lower.includes(mongoSrvProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!bearerJwt.test(scanned), `${label} contains bearer credential-shaped text.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!new RegExp(`${["DATABASE", "_URL"].join("")}\\s*=\\s*actual`, "i").test(scanned), `${label} contains DB actual assignment.`);
  assert(!/Authorization:\s*actual/i.test(scanned), `${label} contains auth actual marker.`);
  assert(!new RegExp(`\\b${["J", "WT"].join("")}\\s+actual\\b`, "i").test(scanned), `${label} contains credential actual marker.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long credential-like text.`);
}

function assertNoUnexpectedRenderedMarkers(text, label) {
  const invalidNumberMarker = ["N", "aN"].join("");
  const missingValueMarker = ["un", "defined"].join("");
  const objectStringMarker = ["[object ", "Object]"].join("");
  const allowedCriterion = `${missingValueMarker}/${invalidNumberMarker}/${objectStringMarker} scan PASS`;
  const scanned = String(text || "").replace(allowedCriterion, "");
  for (const marker of [missingValueMarker, invalidNumberMarker, objectStringMarker]) {
    assert(!scanned.includes(marker), `${label} contains rendered marker: ${marker}`);
  }
}

function assertNoUnsafeEnablement(text, label) {
  const lower = normalize(text);
  const launchPhrase = ["production", "ready"].join(" ");
  const withoutAllowedStatus = lower.replace(new RegExp(`not ${launchPhrase}`, "g"), "");
  assert(!withoutAllowedStatus.includes(launchPhrase), `${label} contains unsafe launch wording.`);
  assert(!/live payout (enabled|on|active|allowed|approved)/i.test(text), `${label} contains unsafe payout wording.`);
  assert(!/production db (enabled|on|active|allowed|approved)/i.test(text), `${label} contains unsafe DB wording.`);
}

function assertDocContract(text) {
  assertIncludes("Financial ledger mock runtime doc", text, [
    "Phase S",
    "NOT production ready",
    "mock runtime harness only",
    "in-memory only",
    "No production DB",
    "No real money",
    "No live payout",
    "No live provider/payment/bank/SMS/Slip OCR",
    "No Prisma migration",
    "No schema.prisma change",
    "No runtime route/controller/service integration",
  ]);

  assertNormalizedIncludes("Safety boundaries", text, [
    "mock/staging/sandbox only",
    "No DB writes",
    "No external network calls",
    "No Prisma client usage",
    "No Express route exposure",
    "No frontend money calculation authority",
    "No admin direct balance mutation without ledger/audit/dual control",
  ]);

  assertNormalizedIncludes("Mock scope", text, [
    "simulate ledger entries",
    "simulate wallet balance changes",
    "simulate idempotency behavior",
    "simulate audit event creation",
    "simulate dual-control decision",
    "simulate reconciliation summary",
    "simulate reversal entries",
    "simulate no-live-payout guard",
  ]);

  assertNormalizedIncludes("Mock principles", text, [
    "immutable append-only entries",
    "balanceBefore",
    "balanceAfter",
    "idempotency is required",
    "sourceType",
    "sourceId",
    "Every admin mock action must have a reason",
    "Every manual approval/rejection must have an audit event",
    "Reversal creates an explicit reversal entry",
  ]);

  assertNormalizedIncludes("Mock operations", text, [
    "deposit.requested",
    "deposit.verified",
    "deposit.credited",
    "deposit.rejected",
    "withdraw.requested",
    "withdraw.reserved",
    "withdraw.approved",
    "withdraw.paid_mock",
    "withdraw.rejected",
    "withdraw.reversed",
    "admin.credit.requested",
    "admin.credit.approved",
    "admin.credit.applied",
    "admin.debit.requested",
    "admin.debit.approved",
    "admin.debit.applied",
    "promotion.bonus.awarded",
    "promotion.bonus.reversed",
    "wheel.reward.awarded",
    "wheel.reward.claimed",
    "provider.transfer.out",
    "provider.transfer.in",
    "provider.callback.adjustment",
    "reconciliation.adjustment",
    "Live payout remains disabled",
  ]);

  assertNormalizedIncludes("Mock data model", text, [
    "mockState",
    "accounts",
    "balances",
    "ledgerTransactions",
    "ledgerEntries",
    "idempotencyKeys",
    "auditEvents",
    "adjustmentRequests",
    "reconciliationRuns",
    "reconciliationItems",
  ]);

  assertNormalizedIncludes("Idempotency behavior", text, [
    "Same idempotencyKey plus same payload returns the same result",
    "Same idempotencyKey plus different payload returns idempotency_conflict",
    "siteId + action + memberId/sourceId",
    "requestHash",
    "responseSnapshot",
    "No replay without audit",
  ]);

  assertNormalizedIncludes("Dual control behavior", text, [
    "Maker/checker separation",
    "No self-approval",
    "Approval requires reason",
    "Rejection requires reason",
    "Emergency override requires reason",
    "High-risk adjustment requires second admin",
    "All decisions write an audit event",
  ]);

  assertNormalizedIncludes("Audit behavior", text, [
    "Audit event is required",
    "Before/after snapshots are sanitized",
    "IP is masked",
    "UserAgent is hashed",
    "No token/password/secret/DATABASE_URL/JWT/Authorization",
    "No raw internal error",
  ]);

  assertNormalizedIncludes("Reconciliation behavior", text, [
    "Wallet balance snapshot vs ledger sum",
    "Deposit credited vs statement mock",
    "Withdraw reserved vs approved vs paid_mock",
    "Admin adjustment variance",
    "Provider callback variance",
    "Lucky Wheel reward liability",
    "Stale pending mock report",
    "Unmatched entries mock report",
  ]);

  assertNormalizedIncludes("Error contract", text, [
    "validation_error",
    "unauthorized_mock",
    "forbidden_mock",
    "idempotency_conflict",
    "insufficient_balance",
    "ledger_write_failed_mock",
    "dual_control_required",
    "no_self_approval",
    "reconciliation_mismatch",
    "live_payout_disabled",
    "provider_live_disabled",
    "production_db_blocked",
    "prisma_disabled_in_mock_harness",
    "network_disabled_in_mock_harness",
  ]);

  assertNormalizedIncludes("Phase T criteria", text, [
    "Phase T must not start",
    "Mock runtime harness exists",
    "Smoke PASS",
    "No DB usage",
    "No Prisma usage",
    "No network call",
    "No route/controller/service integration",
    "Idempotency mock PASS",
    "Dual control mock PASS",
    "Audit redaction mock PASS",
    "Reversal mock PASS",
    "Reconciliation mock PASS",
    "No secret scan PASS",
    "No-live-payout boundary PASS",
    "No-production-DB boundary PASS",
  ]);

  assertIncludes("Next phases", text, ["Phase T", "Phase U", "Phase V", "Phase W"]);
}

function expectSuccess(label, result) {
  assert(result && result.success === true, `${label} expected success.`);
  return result;
}

function expectError(label, result, code) {
  assert(result && result.success === false, `${label} expected error.`);
  assert.strictEqual(result.error.code, code, `${label} expected ${code}.`);
  return result;
}

function createAccountOrThrow(state, input) {
  return expectSuccess("createLedgerAccount", createLedgerAccount(state, input)).data.account;
}

function assertRuntimeHarness() {
  const state = createMockLedgerState();
  const cash = createAccountOrThrow(state, {
    siteId: "site_phase_s",
    memberId: "member_001",
    accountType: "member_cash_wallet",
    currency: "THB",
  });
  const rewardLiability = createAccountOrThrow(state, {
    siteId: "site_phase_s",
    memberId: null,
    accountType: "reward_liability",
    currency: "THB",
  });

  const deposit = expectSuccess(
    "deposit credit mock",
    applyMockDepositCredit(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "deposit_001",
      idempotencyKey: "idem_deposit_001",
      accountId: cash.id,
      amount: 100,
      reason: "mock deposit credit",
      createdByType: "admin",
      createdById: "admin_finance",
    })
  );
  assert.strictEqual(getAccountBalance(state, cash.id), 100, "Deposit credit should update balance.");

  expectError(
    "withdraw reserve insufficient balance",
    applyMockWithdrawReserve(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "withdraw_too_large",
      idempotencyKey: "idem_withdraw_too_large",
      accountId: cash.id,
      amount: 500,
      reason: "mock withdraw reserve too large",
      createdByType: "admin",
      createdById: "admin_finance",
    }),
    "insufficient_balance"
  );

  const reserve = expectSuccess(
    "withdraw reserve success",
    applyMockWithdrawReserve(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "withdraw_001",
      idempotencyKey: "idem_withdraw_001",
      accountId: cash.id,
      amount: 40,
      reason: "mock withdraw reserve",
      createdByType: "admin",
      createdById: "admin_finance",
    })
  );
  assert.strictEqual(getAccountBalance(state, cash.id), 60, "Withdraw reserve should reduce mock balance.");

  expectError(
    "withdraw paid mock live guard",
    applyMockWithdrawPaidMock(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "withdraw_live_attempt",
      idempotencyKey: "idem_withdraw_live_attempt",
      accountId: cash.id,
      amount: 1,
      reason: "mock live payout blocked",
      livePayout: true,
      createdByType: "admin",
      createdById: "admin_finance",
    }),
    "live_payout_disabled"
  );

  const reversal = expectSuccess(
    "reversal creates explicit entry",
    applyMockReversal(state, {
      originalLedgerEntryId: reserve.data.ledgerEntries[0].id,
      sourceId: "withdraw_reversal_001",
      idempotencyKey: "idem_reversal_001",
      reason: "mock reserve reversal",
      createdById: "admin_checker",
    })
  );
  assert.strictEqual(
    reversal.data.ledgerEntries[0].reversalOfLedgerEntryId,
    reserve.data.ledgerEntries[0].id,
    "Reversal entry should link original entry."
  );

  const duplicateDeposit = expectSuccess(
    "idempotency same payload",
    applyMockDepositCredit(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "deposit_001",
      idempotencyKey: "idem_deposit_001",
      accountId: cash.id,
      amount: 100,
      reason: "mock deposit credit",
      createdByType: "admin",
      createdById: "admin_finance",
    })
  );
  assert.strictEqual(
    duplicateDeposit.data.transaction.transactionId,
    deposit.data.transaction.transactionId,
    "Same payload should return same transaction."
  );

  expectError(
    "idempotency conflict",
    applyMockDepositCredit(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      sourceId: "deposit_001",
      idempotencyKey: "idem_deposit_001",
      accountId: cash.id,
      amount: 101,
      reason: "mock deposit credit changed",
      createdByType: "admin",
      createdById: "admin_finance",
    }),
    "idempotency_conflict"
  );

  expectError(
    "admin adjustment requires reason",
    requestMockAdminAdjustment(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      accountId: cash.id,
      makerAdminId: "admin_maker",
      amount: 25,
    }),
    "validation_error"
  );

  const adjustment = expectSuccess(
    "admin adjustment request",
    requestMockAdminAdjustment(state, {
      siteId: "site_phase_s",
      memberId: "member_001",
      accountId: cash.id,
      makerAdminId: "admin_maker",
      amount: 25,
      requestType: "credit",
      reason: "mock adjustment reason",
    })
  );

  expectError(
    "no self approval",
    approveMockAdminAdjustment(state, {
      adjustmentRequestId: adjustment.data.adjustmentRequest.id,
      checkerAdminId: "admin_maker",
      reason: "self approval blocked",
      idempotencyKey: "idem_adjust_self",
    }),
    "no_self_approval"
  );

  const approved = expectSuccess(
    "dual control approval",
    approveMockAdminAdjustment(state, {
      adjustmentRequestId: adjustment.data.adjustmentRequest.id,
      checkerAdminId: "admin_checker",
      reason: "checker approval reason",
      idempotencyKey: "idem_adjust_apply",
    })
  );
  assert.strictEqual(approved.data.adjustmentRequest.status, "applied", "Adjustment should apply after checker approval.");

  const authorizationKey = ["Author", "ization"].join("");
  const bearerValue = ["Bea", "rer value"].join("");
  const apiKeyKey = ["api", "Key"].join("");
  const accessTokenKey = ["access", "Token"].join("");
  const refreshTokenKey = ["refresh", "Token"].join("");
  const redacted = sanitizeAuditSnapshot({
    password: "value",
    token: "value",
    secret: "value",
    [(["DATABASE", "_URL"].join(""))]: "value",
    [authorizationKey]: bearerValue,
    nested: {
      [apiKeyKey]: "value",
      [accessTokenKey]: "value",
      [refreshTokenKey]: "value",
    },
  });
  assert.strictEqual(redacted.password, "[REDACTED]", "Password must be redacted.");
  assert.strictEqual(redacted.token, "[REDACTED]", "Token must be redacted.");
  assert.strictEqual(redacted.secret, "[REDACTED]", "Secret must be redacted.");
  assert.strictEqual(redacted[["DATABASE", "_URL"].join("")], "[REDACTED]", "DB marker must be redacted.");
  assert.strictEqual(redacted[authorizationKey], "[REDACTED]", "Auth header must be redacted.");
  assert.strictEqual(redacted.nested[apiKeyKey], "[REDACTED]", "API key must be redacted.");
  assert.strictEqual(redacted.nested[accessTokenKey], "[REDACTED]", "Access token must be redacted.");
  assert.strictEqual(redacted.nested[refreshTokenKey], "[REDACTED]", "Refresh token must be redacted.");

  expectSuccess(
    "wheel reward mock",
    applyMockWheelRewardAwarded(state, {
      siteId: "site_phase_s",
      sourceId: "wheel_reward_001",
      idempotencyKey: "idem_wheel_reward_001",
      accountId: rewardLiability.id,
      amount: 10,
      reason: "mock wheel reward liability",
      createdByType: "system",
      createdById: "mock_wheel",
    })
  );

  expectError(
    "provider callback live guard",
    applyMockProviderCallbackAdjustment(state, {
      siteId: "site_phase_s",
      sourceId: "provider_callback_live_attempt",
      idempotencyKey: "idem_provider_live_attempt",
      accountId: cash.id,
      amount: 5,
      reason: "mock live provider blocked",
      liveProvider: true,
      createdByType: "system",
      createdById: "mock_provider",
    }),
    "provider_live_disabled"
  );

  expectSuccess(
    "provider callback sandbox adjustment",
    applyMockProviderCallbackAdjustment(state, {
      siteId: "site_phase_s",
      sourceId: "provider_callback_001",
      idempotencyKey: "idem_provider_callback_001",
      accountId: cash.id,
      amount: 5,
      reason: "mock provider callback variance",
      createdByType: "system",
      createdById: "mock_provider",
    })
  );

  const reconciliation = expectSuccess(
    "reconciliation mock",
    runMockReconciliation(state, {
      siteId: "site_phase_s",
      walletSnapshots: {
        [cash.id]: getAccountBalance(state, cash.id),
        [rewardLiability.id]: getAccountBalance(state, rewardLiability.id),
      },
      statementMockDeposits: ["deposit_001"],
    })
  );
  const reportOutput = JSON.stringify(reconciliation.data);
  assertNoUnexpectedRenderedMarkers(reportOutput, "Mock reconciliation report");
  expectSuccess("no live money boundary", assertNoLiveMoneyBoundary({}));
  expectSuccess("no secret leak", assertNoSecretLeak(reconciliation.data));

  return { state, reconciliation };
}

function main() {
  const docText = readFile(DOC_PATH, "docs/FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md");
  console.log("Financial ledger mock runtime doc exists: PASS");
  assertDocContract(docText);
  console.log("Financial ledger mock runtime Phase S status documented: PASS");

  const harnessText = readFile(HARNESS_PATH, "src/ledger-mock/financialLedgerMockHarness.js");
  console.log("Financial ledger mock runtime harness file exists: PASS");
  assertHarnessIsolation(harnessText);
  console.log("Mock harness isolated from DB/network: PASS");

  const smokeText = readFile(SMOKE_PATH, "src/local-smoke-tests/financialLedgerMockRuntimeHarnessSmoke.js");
  for (const [label, text] of [
    ["Phase S doc", docText],
    ["Mock harness", harnessText],
    ["Mock harness smoke", smokeText],
  ]) {
    assertNoSecretShapedValues(text, label);
    assertNoUnexpectedRenderedMarkers(text, label);
    assertNoUnsafeEnablement(text, label);
  }
  console.log("Financial ledger mock runtime static guard: PASS");

  const { reconciliation } = assertRuntimeHarness();
  console.log("Deposit credit mock: PASS");
  console.log("Withdraw reserve insufficient balance fails: PASS");
  console.log("Withdraw reserve success: PASS");
  console.log("Withdraw paid_mock guard: PASS");
  console.log("Reversal creates explicit entry: PASS");
  console.log("Idempotency same payload: PASS");
  console.log("Idempotency conflict: PASS");
  console.log("Admin adjustment requires reason: PASS");
  console.log("No self-approval: PASS");
  console.log("Dual control approval: PASS");
  console.log("Audit event sanitized: PASS");
  console.log("Wheel reward mock: PASS");
  console.log("Provider callback mock is sandbox only: PASS");
  assert(reconciliation.data.summary.walletBalanceSnapshotCount >= 2, "Reconciliation should summarize account snapshots.");
  console.log("Reconciliation mock: PASS");
  console.log("Financial ledger mock runtime no secret scan: PASS");
  console.log("Financial ledger mock runtime rendered output scan: PASS");
  console.log("Financial ledger mock runtime no-live-payout boundary: PASS");
  console.log("Financial ledger mock runtime no-production-DB boundary: PASS");
  console.log("Financial ledger mock runtime harness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger mock runtime harness smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
