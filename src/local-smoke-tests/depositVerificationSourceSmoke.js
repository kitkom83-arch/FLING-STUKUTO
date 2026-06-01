"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  runDepositVerificationSourceMockHarness,
} = require("../payment-provider-mock/depositVerificationSourceMockHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS_DOC = "docs/DEPOSIT_VERIFICATION_SOURCE_MOCK_HARNESS.md";
const UAT_DOC = "docs/DEPOSIT_VERIFICATION_SOURCE_MOCK_UAT_CHECKLIST.md";
const CONTRACT_FILE = "src/payment-provider-mock/depositVerificationSourceContract.js";
const HARNESS_FILE = "src/payment-provider-mock/depositVerificationSourceMockHarness.js";
const SMOKE_FILE = "src/local-smoke-tests/depositVerificationSourceSmoke.js";

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
  const harnessDoc = readRequired(HARNESS_DOC);
  const uatDoc = readRequired(UAT_DOC);
  const combined = `${harnessDoc}\n${uatDoc}`;

  assertIncludes("Phase AQ deposit verification source docs", combined, [
    "Phase AQ",
    "Deposit Verification Source Mock Harness",
    "qr_mock_order",
    "payment_provider_mock_event",
    "slip_verification_mock",
    "bank_statement_mock",
    "bank_sms_fallback_mock",
    "manual_admin_mock",
    "source_received",
    "source_matched",
    "source_pending",
    "source_manual_review",
    "source_duplicate_suspect",
    "source_rejected",
    "source_expired",
    "source_cancelled",
    "source_failed",
    "SMS fallback default status = `source_manual_review`",
    "SMS-only source must never credit member",
    "QR download source must never credit member",
    "Expired QR source must not be matched",
    "Cancelled QR source must not be matched",
    "Duplicate `orderId`",
    "Duplicate `providerTransactionId`",
    "Duplicate `rawHash`",
    "no production DB",
    "no external network",
    "no payout",
  ]);
  assertNoCredentialShape("Phase AQ deposit verification docs", combined);
}

function assertMockFiles() {
  nodeCheck(CONTRACT_FILE);
  nodeCheck(HARNESS_FILE);
  nodeCheck(SMOKE_FILE);
  const result = runDepositVerificationSourceMockHarness();
  assert.strictEqual(result.success, true, "deposit verification source mock harness must pass.");
  assert.strictEqual(result.noProductionDb, true, "harness must mark no production DB.");
  assert.strictEqual(result.noExternalNetwork, true, "harness must mark no external network.");
  assert.strictEqual(result.noRealMoney, true, "harness must mark no real money.");
  assert.strictEqual(result.noAutoCreditFromVerificationSource, true, "source verification must not auto-credit.");
  assertNoCredentialShape("deposit verification harness result", JSON.stringify(result));
  assertIncludes("deposit verification harness source", readRequired(HARNESS_FILE), [
    "Deposit verification source mock harness: PASS",
  ]);
}

function assertRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:deposit-verification-source"],
    "node src/local-smoke-tests/depositVerificationSourceSmoke.js",
    "package.json missing deposit verification source smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke deposit verification source registration", runner, [
    "depositVerificationSourceContract.js",
    "depositVerificationSourceMockHarness.js",
    "depositVerificationSourceSmoke.js",
    "smoke:deposit-verification-source",
  ]);
}

function main() {
  assertDocs();
  console.log("Deposit verification source docs: PASS");
  assertMockFiles();
  console.log("Deposit verification source mock harness: PASS");
  assertRegistration();
  console.log("Deposit verification source package/runAll registration: PASS");
  assertNoForbiddenStagingUatDisplayLiterals();
  console.log("Deposit verification source forbidden literal scan: PASS");
  console.log("Deposit verification source smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Deposit verification source smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
