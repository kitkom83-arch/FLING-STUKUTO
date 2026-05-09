const assert = require("assert");
const { DB_SAFETY_CASES } = require("./dbSafetyPlan");
const { evaluateDbSafetyGuard, PROVIDER_MODE_KEYS } = require("./dbSafetyGuard");

const REQUIRED_CASE_IDS = [
  "deposit-concurrent-approve",
  "withdraw-concurrent-approve",
  "withdraw-concurrent-mark-paid",
  "provider-callback-duplicate-reference",
  "wallet-ledger-rollback",
];

function mockProviderEnv(mode) {
  return Object.fromEntries(PROVIDER_MODE_KEYS.map((key) => [key, mode]));
}

function assertGuardBlocks(message, env) {
  const result = evaluateDbSafetyGuard(env);
  assert.strictEqual(result.ok, false, message);
  return result;
}

function assertGuardReasonIsSanitized(result, forbiddenValues) {
  const output = result.reasons.join("\n");
  for (const forbiddenValue of forbiddenValues) {
    assert.ok(!output.includes(forbiddenValue), "guard reason must not print sensitive values");
  }
}

function validateGuardDryRun() {
  const fakeSecret = "secret-password-value";
  const fakeProductionUrl = `postgresql://prod_user:${fakeSecret}@db.internal/pg77_production`;

  assertGuardBlocks("production NODE_ENV must be blocked", {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://safe_user:secret@staging.internal/pg77_staging",
    ...mockProviderEnv("mock"),
  });

  const productionDbResult = assertGuardBlocks("production-like database target must be blocked", {
    NODE_ENV: "test",
    DATABASE_URL: fakeProductionUrl,
    ...mockProviderEnv("sandbox"),
  });
  assertGuardReasonIsSanitized(productionDbResult, [fakeProductionUrl, fakeSecret, "pg77_production"]);

  assertGuardBlocks("real provider mode must be blocked", {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://safe_user:secret@staging.internal/pg77_staging",
    ...mockProviderEnv("mock"),
    PAYMENT_PROVIDER_MODE: "real",
  });

  const safeResult = evaluateDbSafetyGuard({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://safe_user:secret@staging.internal/pg77_staging",
    ...mockProviderEnv("sandbox"),
  });
  assert.strictEqual(safeResult.ok, true, "staging/test PostgreSQL with sandbox providers should pass the guard");
}

async function run() {
  assert.strictEqual(DB_SAFETY_CASES.length, 5, "DB safety plan must include the required cases");
  assert.ok(DB_SAFETY_CASES.every((testCase) => testCase.id && testCase.title && testCase.expectation));
  assert.deepStrictEqual(DB_SAFETY_CASES.map((testCase) => testCase.id), REQUIRED_CASE_IDS);
  assert.ok(
    DB_SAFETY_CASES.every(
      (testCase) =>
        Array.isArray(testCase.concurrentActions) &&
        testCase.concurrentActions.length === 2 &&
        Array.isArray(testCase.assertions) &&
        testCase.assertions.length > 0
    ),
    "each DB safety case must define concurrent actions and assertions"
  );
  validateGuardDryRun();

  console.log("db safety dry-run: PASS");
  for (const testCase of DB_SAFETY_CASES) {
    console.log(`- ${testCase.id}: planned`);
  }
}

run().catch((error) => {
  console.error("db safety dry-run: FAIL", error.message);
  process.exit(1);
});
