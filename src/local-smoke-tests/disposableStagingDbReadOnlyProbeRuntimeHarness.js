"use strict";

const assert = require("assert");
const {
  evaluateReadOnlyProbeEnv,
  main: runReadOnlyProbe,
} = require("../staging-scripts/disposableStagingDbReadOnlyProbe");

const DB_URL_ENV_KEY = ["DATA", "BASE_URL"].join("");
const AUTHORIZATION_LOOKING_VALUE = `${["Author", "ization"].join("")}: read-only-probe-auth-sentinel`;
const TOKEN_LOOKING_VALUE = ["token", "read", "only", "probe", "redaction", "sentinel"].join("-");
const SYNTHETIC_PASSWORD = ["read", "only", "probe", "password", "sentinel"].join("-");

function syntheticDatabaseUrl({ hostname, databaseName, password = SYNTHETIC_PASSWORD }) {
  const protocol = `${["postgres", "ql"].join("")}://`;
  const username = "readonly_probe_user";
  return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:5432/${databaseName}`;
}

const SAFE_DB_CONNECTION_URL = syntheticDatabaseUrl({
  hostname: "pg77-disposable-staging-readonly.local",
  databaseName: "pg77_disposable_staging_readonly_probe",
});

const SAFE_ENV = {
  NODE_ENV: "development-local",
  APP_ENV: "staging",
  STAGING_DB_DISPOSABLE_CONFIRM: "true",
  STAGING_DB_DRY_RUN_ONLY: "true",
  STAGING_DB_READ_ONLY_PROBE_CONFIRM: "true",
  [DB_URL_ENV_KEY]: SAFE_DB_CONNECTION_URL,
  GAME_PROVIDER_MODE: "mock",
  PAYMENT_PROVIDER_MODE: "sandbox",
  BANK_STATEMENT_MODE: "mock",
  SMS_PROVIDER_MODE: "mock",
  SLIP_OCR_MODE: "mock",
};

function buildEnv(overrides = {}, removals = []) {
  const env = { ...SAFE_ENV, ...overrides };
  for (const key of removals) {
    delete env[key];
  }
  return env;
}

function makeOutputCapture() {
  const lines = [];
  return {
    output: {
      log(message) {
        lines.push(String(message));
      },
      error(message) {
        lines.push(String(message));
      },
    },
    text() {
      return lines.join("\n");
    },
  };
}

function queryText(strings) {
  return Array.isArray(strings) ? String(strings.join(" ")) : String(strings || "");
}

function createFakeClient(options = {}) {
  const calls = [];
  return {
    calls,
    async $queryRaw(strings) {
      const text = queryText(strings);
      calls.push(text);
      if (options.failWithProtectedValue) {
        throw new Error(AUTHORIZATION_LOOKING_VALUE);
      }
      if (text.includes("SELECT 1 AS probe_ok")) {
        return [{ probe_ok: 1 }];
      }
      if (text.includes("SHOW transaction_read_only")) {
        return [{ transaction_read_only: "on" }];
      }
      if (text.includes("information_schema.tables")) {
        return [{ table_count: 7 }];
      }
      throw new Error("Unexpected read-only query.");
    },
    async $disconnect() {
      calls.push("disconnect");
    },
  };
}

function assertNoLeakedValues(label, output, values) {
  for (const value of values) {
    assert(value, `${label} leak check received an empty sentinel.`);
    assert(!output.includes(value), `${label} leaked a protected synthetic value.`);
  }
}

function protectedValues() {
  return [SAFE_DB_CONNECTION_URL, SYNTHETIC_PASSWORD, AUTHORIZATION_LOOKING_VALUE, TOKEN_LOOKING_VALUE];
}

async function runProbeWithFakeClient(env, client = createFakeClient()) {
  const capture = makeOutputCapture();
  const exitCode = await runReadOnlyProbe({ env, client, output: capture.output });
  return {
    exitCode,
    output: capture.text(),
    client,
  };
}

async function assertSafePassCase() {
  const result = await runProbeWithFakeClient(buildEnv());

  assert.strictEqual(result.exitCode, 0, "safe read-only probe case should pass.");
  assert(result.output.includes("Disposable staging DB read-only probe: PASS"), "safe case missing pass status.");
  assert(result.output.includes("Read-only connection probe: PASS"), "safe case missing connection pass.");
  assert(result.output.includes("Transaction read-only state: on"), "safe case missing transaction state.");
  assert(result.output.includes("Schema visibility probe: PASS (public tables: 7)"), "safe case missing schema count.");
  assert.strictEqual(result.client.calls.length, 3, "safe case should run exactly three read-only queries.");
  assertNoLeakedValues("safe read-only probe case", result.output, protectedValues());
}

async function assertFailedClosed(label, env, markers) {
  const result = await runProbeWithFakeClient(env);

  assert.notStrictEqual(result.exitCode, 0, `${label} should fail closed.`);
  assert(result.output.includes("Disposable staging DB read-only probe: FAIL"), `${label} missing fail status.`);
  for (const marker of markers) {
    assert(result.output.includes(marker), `${label} missing safe failure marker: ${marker}`);
  }
  assert.strictEqual(result.client.calls.length, 0, `${label} must not run DB queries after guard failure.`);
  assertNoLeakedValues(label, result.output, protectedValues());
}

async function assertMissingDatabaseUrlCase() {
  await assertFailedClosed("missing DATABASE_URL case", buildEnv({}, [DB_URL_ENV_KEY]), [
    "DATABASE_URL is required. Value is not printed.",
  ]);
}

async function assertProductionLookingHostnameCase() {
  await assertFailedClosed(
    "production-looking hostname case",
    buildEnv({
      [DB_URL_ENV_KEY]: syntheticDatabaseUrl({
        hostname: "pg77-production-disposable-readonly.local",
        databaseName: "pg77_disposable_staging_readonly_probe",
      }),
    }),
    ["Database hostname or database name looks production-like and is blocked."]
  );
}

async function assertProductionLookingDatabaseNameCase() {
  await assertFailedClosed(
    "production-looking database name case",
    buildEnv({
      [DB_URL_ENV_KEY]: syntheticDatabaseUrl({
        hostname: "pg77-disposable-staging-readonly.local",
        databaseName: "pg77_production_readonly_probe",
      }),
    }),
    ["Database hostname or database name looks production-like and is blocked."]
  );
}

async function assertReadOnlyConfirmationCase() {
  await assertFailedClosed("missing read-only confirmation guard case", buildEnv({}, ["STAGING_DB_READ_ONLY_PROBE_CONFIRM"]), [
    "STAGING_DB_READ_ONLY_PROBE_CONFIRM must be true. Actual value is not printed.",
  ]);
}

async function assertUnsafeProviderModeCase() {
  await assertFailedClosed("unsafe provider mode case", buildEnv({ GAME_PROVIDER_MODE: "live" }), [
    "GAME_PROVIDER_MODE must be mock. Actual value is not printed.",
  ]);
}

async function assertReadOnlyQueryFailureCase() {
  const result = await runProbeWithFakeClient(
    buildEnv({
      RUNTIME_HARNESS_AUTH_PROBE: AUTHORIZATION_LOOKING_VALUE,
      RUNTIME_HARNESS_TOKEN_PROBE: TOKEN_LOOKING_VALUE,
    }),
    createFakeClient({ failWithProtectedValue: true })
  );

  assert.notStrictEqual(result.exitCode, 0, "read-only query failure case should fail closed.");
  assert(result.output.includes("Disposable staging DB read-only probe: FAIL"), "query failure missing fail status.");
  assert(
    result.output.includes("Read-only probe query failed. Detail is not printed."),
    "query failure missing safe failure detail."
  );
  assertNoLeakedValues("read-only query failure case", result.output, protectedValues());
}

function assertEnvEvaluatorSafeContract() {
  const result = evaluateReadOnlyProbeEnv(buildEnv());
  assert.strictEqual(result.ok, true, "safe synthetic env should pass evaluator.");
  assert.strictEqual(result.summary.username, "r*****************r", "username should be masked.");
}

async function main() {
  assertEnvEvaluatorSafeContract();
  console.log("Read-only probe env evaluator case: PASS");

  await assertSafePassCase();
  console.log("Safe disposable staging DB read-only probe case: PASS");

  await assertMissingDatabaseUrlCase();
  console.log("Missing DATABASE_URL case: PASS");

  await assertProductionLookingHostnameCase();
  console.log("Production-looking hostname case: PASS");

  await assertProductionLookingDatabaseNameCase();
  console.log("Production-looking database name case: PASS");

  await assertReadOnlyConfirmationCase();
  console.log("Missing read-only confirmation guard case: PASS");

  await assertUnsafeProviderModeCase();
  console.log("Unsafe provider mode case: PASS");

  await assertReadOnlyQueryFailureCase();
  console.log("Read-only query failure redaction case: PASS");

  console.log("Disposable staging DB read-only probe runtime harness: PASS");
}

main().catch((error) => {
  console.error("Disposable staging DB read-only probe runtime harness: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
