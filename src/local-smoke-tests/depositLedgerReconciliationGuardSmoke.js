"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  runDepositLedgerReconciliationGuardHarness,
} = require("../ledger-mock/depositLedgerReconciliationGuardHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const GUARD_DOC = "docs/DEPOSIT_LEDGER_RECONCILIATION_GUARD.md";
const UAT_DOC = "docs/DEPOSIT_LEDGER_RECONCILIATION_GUARD_UAT_CHECKLIST.md";
const CONTRACT_FILE = "src/ledger-mock/depositLedgerReconciliationGuard.js";
const HARNESS_FILE = "src/ledger-mock/depositLedgerReconciliationGuardHarness.js";
const SMOKE_FILE = "src/local-smoke-tests/depositLedgerReconciliationGuardSmoke.js";

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
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains bearer-shaped value.`);
  assert(!apiKeyLike.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!secretAssignment.test(scanned), `${label} contains secret assignment-shaped value.`);
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
  const guardDoc = readRequired(GUARD_DOC);
  const uatDoc = readRequired(UAT_DOC);
  const combined = `${guardDoc}\n${uatDoc}`;

  assertIncludes("Phase AR ledger reconciliation guard docs", combined, [
    "Phase AR",
    "Ledger/Reconciliation Guard",
    "ledger_posting_candidate_mock",
    "mock recommendation must never credit member",
    "reconciliation result must never mutate wallet",
    "SMS-only source must never create ledger posting candidate",
    "QR downloaded source must never create ledger posting candidate",
    "expired QR source must be rejected or manual_review only",
    "cancelled QR source must be rejected or manual_review only",
    "mismatch_review_required",
    "duplicate orderId",
    "duplicate providerTransactionId",
    "duplicate rawHash",
    "manual admin source must require reason",
    "no production DB",
    "no external network",
    "no payout",
    "no runtime ledger mutation",
  ]);
  assertNoCredentialShape("Phase AR ledger reconciliation guard docs", combined);
}

function assertMockFiles() {
  nodeCheck(CONTRACT_FILE);
  nodeCheck(HARNESS_FILE);
  nodeCheck(SMOKE_FILE);
  const result = runDepositLedgerReconciliationGuardHarness();
  assert.strictEqual(result.success, true, "deposit ledger reconciliation guard harness must pass.");
  assert.strictEqual(result.noProductionDb, true, "harness must mark no production DB.");
  assert.strictEqual(result.noExternalNetwork, true, "harness must mark no external network.");
  assert.strictEqual(result.noRealMoney, true, "harness must mark no real money.");
  assert.strictEqual(result.noRuntimeLedgerMutation, true, "harness must mark no runtime ledger mutation.");
  assert.strictEqual(result.noAutoCreditFromLedgerGuard, true, "ledger guard must not auto-credit.");
  assertNoCredentialShape("deposit ledger reconciliation guard harness result", JSON.stringify(result));
  assertIncludes("deposit ledger reconciliation guard harness source", readRequired(HARNESS_FILE), [
    "Deposit ledger reconciliation guard harness: PASS",
  ]);
}

function assertRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:deposit-ledger-reconciliation-guard"],
    "node src/local-smoke-tests/depositLedgerReconciliationGuardSmoke.js",
    "package.json missing deposit ledger reconciliation guard smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke deposit ledger reconciliation guard registration", runner, [
    "depositLedgerReconciliationGuard.js",
    "depositLedgerReconciliationGuardHarness.js",
    "depositLedgerReconciliationGuardSmoke.js",
    "smoke:deposit-ledger-reconciliation-guard",
  ]);
}

function main() {
  assertDocs();
  console.log("Deposit ledger reconciliation guard docs: PASS");
  assertMockFiles();
  console.log("Deposit ledger reconciliation guard mock harness: PASS");
  assertRegistration();
  console.log("Deposit ledger reconciliation guard package/runAll registration: PASS");
  assertNoForbiddenStagingUatDisplayLiterals();
  console.log("Deposit ledger reconciliation guard forbidden literal scan: PASS");
  console.log("Deposit ledger reconciliation guard smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Deposit ledger reconciliation guard smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
