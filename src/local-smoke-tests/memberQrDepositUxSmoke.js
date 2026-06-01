"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const { runMemberQrDepositMockHarness } = require("../payment-provider-mock/memberQrDepositMockHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const UX_DOC = "docs/MEMBER_QR_DEPOSIT_UX_CONTRACT.md";
const UAT_DOC = "docs/MEMBER_QR_DEPOSIT_MOCK_UAT_CHECKLIST.md";
const CONTRACT_FILE = "src/payment-provider-mock/memberQrDepositUxContract.js";
const HARNESS_FILE = "src/payment-provider-mock/memberQrDepositMockHarness.js";
const SMOKE_FILE = "src/local-smoke-tests/memberQrDepositUxSmoke.js";

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
    assert(!stagingUat.includes(marker), `docs/STAGING_UAT.md contains forbidden literal display marker.`);
  }
  assertIncludes("docs/STAGING_UAT.md safe display replacements", stagingUat, [
    "missing display value",
    "invalid numeric display",
    "raw object display value",
  ]);
}

function nodeCheck(relativePath) {
  const text = readRequired(relativePath);
  new vm.Script(text, { filename: relativePath });
}

function assertDocs() {
  const ux = readRequired(UX_DOC);
  const uat = readRequired(UAT_DOC);
  const combined = `${ux}\n${uat}`;

  assertIncludes("Phase AP member QR docs", combined, [
    "Phase AP",
    "Member QR Deposit UX",
    "Mock QR Download",
    "qr_payment_gateway",
    "no real QR",
    "no real payment",
    "Download QR must never credit member",
    "Expired QR cannot be matched",
    "Cancelled QR cannot be matched",
    "Duplicate `orderId`",
    "Duplicate `qrPayloadMockHash`",
    "no production DB",
    "no external network",
    "no payout",
  ]);
  assertNoCredentialShape("Phase AP member QR docs", combined);
}

function assertMockFiles() {
  nodeCheck(CONTRACT_FILE);
  nodeCheck(HARNESS_FILE);
  const result = runMemberQrDepositMockHarness();
  assert.strictEqual(result.success, true, "member QR deposit mock harness must pass.");
  assert.strictEqual(result.providerKey, "qr_payment_gateway", "providerKey must be qr_payment_gateway.");
  assert.strictEqual(result.noRealQr, true, "mock harness must mark no real QR.");
  assert.strictEqual(result.noRealMoney, true, "mock harness must mark no real money.");
  assert.strictEqual(result.noAutoCreditFromQrDownload, true, "QR download must not credit member.");
  assertNoCredentialShape("member QR deposit harness result", JSON.stringify(result));
  assertIncludes("member QR deposit harness source", readRequired(HARNESS_FILE), [
    "Member QR deposit mock harness: PASS",
  ]);
}

function assertRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:member-qr-deposit-ux"],
    "node src/local-smoke-tests/memberQrDepositUxSmoke.js",
    "package.json missing member QR deposit UX smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke member QR registration", runner, [
    "memberQrDepositUxSmoke.js",
    "smoke:member-qr-deposit-ux",
    "memberQrDepositUxContract.js",
    "memberQrDepositMockHarness.js",
  ]);
}

function main() {
  nodeCheck(SMOKE_FILE);
  assertDocs();
  console.log("Member QR deposit docs: PASS");
  assertMockFiles();
  console.log("Member QR deposit mock harness: PASS");
  assertRegistration();
  console.log("Member QR deposit package/runAll registration: PASS");
  assertNoForbiddenStagingUatDisplayLiterals();
  console.log("Member QR deposit forbidden literal scan: PASS");
  console.log("Member QR deposit UX smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Member QR deposit UX smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
