"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { runMockHarness } = require("../payment-provider-mock/paymentProviderMockHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const DOCS = [
  "docs/PAYMENT_PROVIDER_CONTRACT.md",
  "docs/DUAL_TRUEMONEY_PROVIDER_RUNBOOK.md",
  "docs/PAYMENT_PROVIDER_MOCK_UAT_CHECKLIST.md",
  "docs/API_MAPPING.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/STAGING_UAT.md",
  "docs/STAGING_RELEASE_RUNBOOK.md",
];
const STATIC_SCAN_FILES = [
  ...DOCS,
  "src/payment-provider-mock/paymentProviderContract.js",
  "src/payment-provider-mock/paymentProviderMockHarness.js",
  "src/local-smoke-tests/paymentProviderContractSmoke.js",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
];

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
  const openAiKeyPrefix = ["s", "k"].join("") + "-";
  const openAiKey = new RegExp(`\\b${openAiKeyPrefix}[A-Za-z0-9_-]{12,}\\b`);
  const secretAssignment = /\b(?:DATABASE_URL|TOKEN|PASSWORD|PIN|DEVICE_ID|DEVICEID)\s*=\s*["']?[A-Za-z0-9_./:@-]{8,}/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains bearer-shaped value.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!secretAssignment.test(scanned), `${label} contains secret assignment-shaped value.`);
}

function assertNoUnsafePlaceholderCopy(label, text) {
  const scanned = String(text || "")
    .replace(/missing display value/g, "")
    .replace(/invalid numeric display/g, "")
    .replace(/raw object display value/g, "");
  for (const marker of [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")]) {
    assert(!scanned.includes(marker), `${label} contains unsafe placeholder copy.`);
  }
}

function assertNoForbiddenRuntimeText(label, text) {
  const scanned = String(text || "")
    .replace(/forbidden state: `sms_detected -> credited`/gi, "")
    .replace(/not `sms_detected -> credited`/gi, "")
    .replace(/`sms_detected -> credited` is forbidden/gi, "");
  const allowedNoRealMoney = scanned.replace(/no real money (enabled|on|active|allowed|approved)/gi, "");
  const forbidden = [
    /real money (enabled|on|active|allowed|approved)/i,
    /live provider (enabled|on|active|allowed|approved)/i,
    /live TrueMoney (enabled|on|active|allowed|approved)/i,
    /live TMNOne (enabled|on|active|allowed|approved)/i,
    new RegExp(["auto-credit", "from", "SMS"].join(" "), "i"),
    new RegExp(["sms_detected", "->", "credited"].join(" "), "i"),
  ];
  for (const pattern of forbidden) {
    const target = pattern.source.startsWith("real money") ? allowedNoRealMoney : scanned;
    assert(!pattern.test(target), `${label} contains forbidden enablement wording.`);
  }
}

function assertDocsContract() {
  const paymentContract = readRequired("docs/PAYMENT_PROVIDER_CONTRACT.md");
  assertIncludes("payment provider contract", paymentContract, [
    "Phase AO scope",
    "Provider list",
    "Safety boundary",
    "Provider Mode",
    "Normalized Deposit Event Contract",
    "Idempotency Contract",
    "Duplicate Guard",
    "Manual Review Rules",
    "Audit Requirements",
    "Secret Redaction Requirements",
    "No Live Money Boundary",
    "truemoney_official",
    "tmnone",
    "qr_payment_gateway",
    "slip_verification",
    "bank_statement",
    "bank_sms_fallback",
    "manual_admin",
    "SMS fallback default status = `manual_review`",
    "SMS-only event must never credit member",
  ]);

  const truemoneyRunbook = readRequired("docs/DUAL_TRUEMONEY_PROVIDER_RUNBOOK.md");
  assertIncludes("dual TrueMoney runbook", truemoneyRunbook, [
    "TrueMoney Official / Partner Gateway",
    "TMNOne / tmn.one",
    "separate providers",
    "`truemoney_official`",
    "`tmnone`",
    "create payment order",
    "callback / webhook",
    "payment inquiry",
    "balance inquiry",
    "transaction history",
    "transaction info",
    "backoffice-controlled transfer/withdrawal in future only",
    "PIN/token/device data must be secret only",
    "No live transfer now",
  ]);

  const uat = readRequired("docs/PAYMENT_PROVIDER_MOCK_UAT_CHECKLIST.md");
  assertIncludes("payment provider mock UAT", uat, [
    "TrueMoney Official mock order",
    "TMNOne mock transaction history",
    "QR Payment mock QR order",
    "QR download UX contract",
    "Slip Verification mock verified",
    "Slip Verification uncertain result becomes `manual_review`",
    "Statement API mock fetch",
    "Statement unmatched result becomes `manual_review`",
    "SMS fallback mock event always returns `manual_review`",
    "SMS-only cannot credit",
    "Duplicate providerTransactionId",
    "Duplicate rawHash",
    "No secret printed",
    "No live provider",
    "No real money",
    "No production DB",
  ]);
}

function assertCrossDocContract() {
  const combined = DOCS.map(readRequired).join("\n");
  assertIncludes("payment provider cross docs", combined, [
    "Payment Provider Contract / Dual TrueMoney Provider",
    "Future Payment Provider Contract Mapping",
    "smoke:payment-provider-contract",
    "truemoney_official",
    "tmnone",
    "qr_payment_gateway",
    "slip_verification",
    "bank_statement",
    "bank_sms_fallback",
    "manual_admin",
    "SMS fallback is manual_review only",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no payout",
  ]);
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoCredentialShape(file, text);
    assertNoUnsafePlaceholderCopy(file, text);
    assertNoForbiddenRuntimeText(file, text);
  }
}

function assertPackageAndRunner() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:payment-provider-contract"],
    "node src/local-smoke-tests/paymentProviderContractSmoke.js",
    "package.json missing payment provider contract smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke payment provider registration", runner, [
    "paymentProviderContractSmoke.js",
    "payment-provider-contract",
    "paymentProviderContract",
    "paymentProviderContract.js",
    "paymentProviderMockHarness.js",
  ]);
}

function assertHarness() {
  const result = runMockHarness();
  assert.strictEqual(result.success, true, "mock harness must pass.");
  assert.strictEqual(result.noProductionDb, true, "mock harness must mark no production DB.");
  assert.strictEqual(result.noRealMoney, true, "mock harness must mark no real money.");
  assert.strictEqual(result.noLiveProvider, true, "mock harness must mark no live provider.");
  assert.strictEqual(result.noPayout, true, "mock harness must mark no payout.");
  assert.strictEqual(result.smsFallbackManualReviewOnly, true, "SMS fallback must stay manual_review only.");
  assertNoCredentialShape("payment provider mock harness result", JSON.stringify(result));
}

function main() {
  assertDocsContract();
  console.log("Payment provider contract docs: PASS");
  assertCrossDocContract();
  console.log("Payment provider cross-doc mapping: PASS");
  assertPackageAndRunner();
  console.log("Payment provider package/runAll registration: PASS");
  assertStaticScans();
  console.log("Payment provider static safety scan: PASS");
  assertHarness();
  console.log("Payment provider mock harness: PASS");
  console.log("Payment provider contract smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Payment provider contract smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
