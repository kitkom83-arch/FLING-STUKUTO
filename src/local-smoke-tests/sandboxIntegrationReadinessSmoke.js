"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  runSandboxIntegrationReadinessHarness,
} = require("../sandbox-integration/sandboxIntegrationReadinessHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const READINESS_DOC = "docs/SANDBOX_INTEGRATION_READINESS.md";
const ENV_DOC = "docs/SANDBOX_PROVIDER_ENV_CONTRACT.md";
const UAT_DOC = "docs/SANDBOX_INTEGRATION_UAT_CHECKLIST.md";
const CONTRACT_FILE = "src/sandbox-integration/sandboxIntegrationReadinessContract.js";
const HARNESS_FILE = "src/sandbox-integration/sandboxIntegrationReadinessHarness.js";
const SMOKE_FILE = "src/local-smoke-tests/sandboxIntegrationReadinessSmoke.js";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerLiteral = /\bBearer\s+[A-Za-z0-9._-]+/i;
  const apiKeyLike = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const secretAssignment = /\b(?:DATABASE_URL|TOKEN|PASSWORD|PIN|DEVICE_ID|DEVICEID)\s*=\s*["']?[A-Za-z0-9_./:@-]{8,}/i;
  const databaseUrlLike = /\bpostgres(?:ql)?:\/\/[^\s]+/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains bearer-shaped value.`);
  assert(!apiKeyLike.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!secretAssignment.test(scanned), `${label} contains secret assignment-shaped value.`);
  assert(!databaseUrlLike.test(scanned), `${label} contains database URL-shaped value.`);
}

function assertNoForbiddenStagingUatDisplayLiterals() {
  const stagingUat = readRequired("docs/STAGING_UAT.md");
  const forbidden = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")];
  for (const marker of forbidden) {
    assert(!stagingUat.includes(marker), "docs/STAGING_UAT.md contains forbidden display literal.");
  }
}

function nodeCheck(relativePath) {
  const text = readRequired(relativePath);
  new vm.Script(text, { filename: relativePath });
}

function assertDocs() {
  const readinessDoc = readRequired(READINESS_DOC);
  const envDoc = readRequired(ENV_DOC);
  const uatDoc = readRequired(UAT_DOC);
  const combined = `${readinessDoc}\n${envDoc}\n${uatDoc}`;

  assertIncludes("Phase AS sandbox integration readiness docs", combined, [
    "Phase AS",
    "Sandbox Integration Readiness",
    "sandbox_configured_not_called",
    "sandbox_dry_run_only",
    "live_after_certification_only",
    "Sandbox adapter must never call external network in Phase AS",
    "Sandbox result must never credit member",
    "Sandbox result must never mutate wallet",
    "Sandbox result must never post real ledger",
    "real secrets blocked",
    "fake payload only",
    "SMS fallback remains manual_review only",
    "manual admin source must require reason",
    "no production DB",
    "no external network",
    "no payout",
    "no runtime ledger mutation",
  ]);
  assertNoCredentialShape("Phase AS sandbox integration readiness docs", combined);
}

function assertMockFiles() {
  nodeCheck(CONTRACT_FILE);
  nodeCheck(HARNESS_FILE);
  nodeCheck(SMOKE_FILE);
  const result = runSandboxIntegrationReadinessHarness();
  assert.strictEqual(result.success, true, "sandbox integration readiness harness must pass.");
  assert.strictEqual(result.noProductionDb, true, "harness must mark no production DB.");
  assert.strictEqual(result.noExternalNetwork, true, "harness must mark no external network.");
  assert.strictEqual(result.noRealMoney, true, "harness must mark no real money.");
  assert.strictEqual(result.noRuntimeLedgerMutation, true, "harness must mark no runtime ledger mutation.");
  assert.strictEqual(result.noAutoCreditFromSandboxResult, true, "sandbox result must not auto-credit.");
  assertNoCredentialShape("sandbox integration readiness harness result", JSON.stringify(result));
  assertIncludes("sandbox integration readiness harness source", readRequired(HARNESS_FILE), [
    "Sandbox integration readiness harness: PASS",
  ]);
}

function assertRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:sandbox-integration-readiness"],
    "node src/local-smoke-tests/sandboxIntegrationReadinessSmoke.js",
    "package.json missing sandbox integration readiness smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke sandbox integration readiness registration", runner, [
    "sandboxIntegrationReadinessContract.js",
    "sandboxIntegrationReadinessHarness.js",
    "sandboxIntegrationReadinessSmoke.js",
    "smoke:sandbox-integration-readiness",
  ]);
}

function main() {
  assertDocs();
  console.log("Sandbox integration readiness docs: PASS");
  assertMockFiles();
  console.log("Sandbox integration readiness mock harness: PASS");
  assertRegistration();
  console.log("Sandbox integration readiness package/runAll registration: PASS");
  assertNoForbiddenStagingUatDisplayLiterals();
  console.log("Sandbox integration readiness forbidden literal scan: PASS");
  console.log("Sandbox integration readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Sandbox integration readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
