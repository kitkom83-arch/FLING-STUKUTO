"use strict";

const assert = require("assert");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const PREFLIGHT_SCRIPT = path.join(ROOT, "src", "staging-scripts", "disposableStagingDbPreflight.js");
const DB_URL_ENV_KEY = ["DATA", "BASE_URL"].join("");
const AUTHORIZATION_LOOKING_VALUE = `${["Author", "ization"].join("")}: runtime-harness-auth-probe`;
const TOKEN_LOOKING_VALUE = ["token", "runtime", "harness", "redaction", "probe"].join("-");
const SYNTHETIC_PASSWORD = ["runtime", "password", "redaction", "probe"].join("-");

function syntheticDatabaseUrl({ hostname, databaseName, password = SYNTHETIC_PASSWORD }) {
  const protocol = `${["postgres", "ql"].join("")}://`;
  const username = "runtime_user";
  return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:5432/${databaseName}`;
}

const SAFE_DB_CONNECTION_URL = syntheticDatabaseUrl({
  hostname: "pg77-disposable-staging-db.local",
  databaseName: "pg77_disposable_staging_runtime",
});

const SAFE_ENV = {
  NODE_ENV: "development-local",
  APP_ENV: "staging",
  STAGING_DB_DISPOSABLE_CONFIRM: "true",
  STAGING_DB_DRY_RUN_ONLY: "true",
  [DB_URL_ENV_KEY]: SAFE_DB_CONNECTION_URL,
  GAME_PROVIDER_MODE: "mock",
  PAYMENT_PROVIDER_MODE: "sandbox",
  BANK_STATEMENT_MODE: "mock",
  SMS_PROVIDER_MODE: "mock",
  SLIP_OCR_MODE: "mock",
};

function minimalProcessEnv() {
  const allowedKeys = [
    "APPDATA",
    "ComSpec",
    "COMSPEC",
    "HOME",
    "LOCALAPPDATA",
    "PATH",
    "Path",
    "PATHEXT",
    "SystemRoot",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "WINDIR",
  ];
  const env = {};
  for (const key of allowedKeys) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}

function buildEnv(overrides = {}, removals = []) {
  const env = { ...minimalProcessEnv(), ...SAFE_ENV, ...overrides };
  for (const key of removals) {
    delete env[key];
  }
  return env;
}

function runPreflight(overrides = {}, removals = []) {
  return spawnSync(process.execPath, [PREFLIGHT_SCRIPT], {
    cwd: ROOT,
    env: buildEnv(overrides, removals),
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function combinedOutput(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function exitCode(result) {
  return typeof result.status === "number" ? result.status : 1;
}

function assertNoLeakedValues(label, output, values) {
  for (const value of values) {
    assert(value, `${label} leak check received an empty sentinel.`);
    assert(!output.includes(value), `${label} leaked a protected synthetic value.`);
  }
}

function assertFailedClosed(label, result, markers) {
  const output = combinedOutput(result);
  assert.notStrictEqual(exitCode(result), 0, `${label} should fail closed.`);
  assert(output.includes("Disposable staging DB preflight: FAIL"), `${label} missing fail status.`);
  for (const marker of markers) {
    assert(output.includes(marker), `${label} missing safe failure marker: ${marker}`);
  }
  assertNoLeakedValues(label, output, [
    SAFE_DB_CONNECTION_URL,
    SYNTHETIC_PASSWORD,
    AUTHORIZATION_LOOKING_VALUE,
    TOKEN_LOOKING_VALUE,
  ]);
}

function assertSafePassCase() {
  const result = runPreflight();
  const output = combinedOutput(result);

  assert.strictEqual(exitCode(result), 0, "safe disposable staging DB case should pass.");
  assert(output.includes("Disposable staging DB preflight: PASS"), "safe case missing pass status.");
  assertNoLeakedValues("safe disposable staging DB case", output, [SAFE_DB_CONNECTION_URL, SYNTHETIC_PASSWORD]);
}

function assertMissingDatabaseUrlCase() {
  const result = runPreflight({}, [DB_URL_ENV_KEY]);
  assertFailedClosed("missing DATABASE_URL case", result, ["DATABASE_URL is required. Value is not printed."]);
}

function assertProductionLookingHostnameCase() {
  const result = runPreflight({
    [DB_URL_ENV_KEY]: syntheticDatabaseUrl({
      hostname: "pg77-production-disposable-staging.local",
      databaseName: "pg77_disposable_staging_runtime",
    }),
  });
  assertFailedClosed("production-looking hostname case", result, [
    "Database hostname or database name looks production-like and is blocked.",
  ]);
}

function assertProductionLookingDatabaseNameCase() {
  const result = runPreflight({
    [DB_URL_ENV_KEY]: syntheticDatabaseUrl({
      hostname: "pg77-disposable-staging-db.local",
      databaseName: "pg77_production_disposable_staging_runtime",
    }),
  });
  assertFailedClosed("production-looking database name case", result, [
    "Database hostname or database name looks production-like and is blocked.",
  ]);
}

function assertNodeEnvProductionCase() {
  const result = runPreflight({ NODE_ENV: "production" });
  assertFailedClosed("NODE_ENV production case", result, ["NODE_ENV production is blocked."]);
}

function assertAppEnvProductionCase() {
  const result = runPreflight({ APP_ENV: "production" });
  assertFailedClosed("APP_ENV production case", result, ["APP_ENV production is blocked."]);
}

function assertMissingDisposableConfirmationCase() {
  const result = runPreflight({}, ["STAGING_DB_DISPOSABLE_CONFIRM"]);
  assertFailedClosed("missing disposable confirmation guard case", result, [
    "STAGING_DB_DISPOSABLE_CONFIRM must be true. Actual value is not printed.",
  ]);
}

function assertMissingDryRunOnlyCase() {
  const result = runPreflight({}, ["STAGING_DB_DRY_RUN_ONLY"]);
  assertFailedClosed("missing dry-run guard case", result, [
    "STAGING_DB_DRY_RUN_ONLY must be true. Actual value is not printed.",
  ]);
}

function assertUnsafeProviderModeCase() {
  const result = runPreflight({ GAME_PROVIDER_MODE: "live" });
  assertFailedClosed("unsafe provider mode case", result, [
    "GAME_PROVIDER_MODE must be mock. Actual value is not printed.",
  ]);
}

function assertRedactionCase() {
  const result = runPreflight({
    RUNTIME_HARNESS_AUTH_PROBE: AUTHORIZATION_LOOKING_VALUE,
    RUNTIME_HARNESS_TOKEN_PROBE: TOKEN_LOOKING_VALUE,
  });
  const output = combinedOutput(result);

  assert.strictEqual(exitCode(result), 0, "redaction case should keep safe preflight passing.");
  assert(output.includes("Disposable staging DB preflight: PASS"), "redaction case missing pass status.");
  assertNoLeakedValues("redaction case", output, [
    SAFE_DB_CONNECTION_URL,
    SYNTHETIC_PASSWORD,
    AUTHORIZATION_LOOKING_VALUE,
    TOKEN_LOOKING_VALUE,
  ]);
}

function main() {
  assertSafePassCase();
  console.log("Safe disposable staging DB case: PASS");

  assertMissingDatabaseUrlCase();
  console.log("Missing DATABASE_URL case: PASS");

  assertProductionLookingHostnameCase();
  console.log("Production-looking hostname case: PASS");

  assertProductionLookingDatabaseNameCase();
  console.log("Production-looking database name case: PASS");

  assertNodeEnvProductionCase();
  console.log("NODE_ENV production case: PASS");

  assertAppEnvProductionCase();
  console.log("APP_ENV production case: PASS");

  assertMissingDisposableConfirmationCase();
  console.log("Missing disposable confirmation guard case: PASS");

  assertMissingDryRunOnlyCase();
  console.log("Missing dry-run guard case: PASS");

  assertUnsafeProviderModeCase();
  console.log("Unsafe provider mode case: PASS");

  assertRedactionCase();
  console.log("Redaction case: PASS");

  console.log("Disposable staging DB preflight runtime harness: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB preflight runtime harness: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
