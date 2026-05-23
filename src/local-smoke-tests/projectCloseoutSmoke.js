const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOCS = [
  "docs/PROJECT_CLOSEOUT.md",
  "docs/LUCKY_WHEEL_FINAL_UAT.md",
  "docs/ADMIN_OPERATOR_HANDOFF.md",
];
const STATIC_SCAN_FILES = [
  ...DOCS,
  "docs/SMOKE_COVERAGE.md",
  "src/local-smoke-tests/projectCloseoutSmoke.js",
];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
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

function forbiddenRenderedMarkers() {
  return [
    ["un", "defined"].join(""),
    ["N", "aN"].join(""),
    ["[object", " Object]"].join(""),
  ];
}

function assertNoUnsafeRenderedPlaceholderCopy(label, text) {
  const scanned = String(text || "");
  for (const marker of forbiddenRenderedMarkers()) {
    assert(!scanned.includes(marker), `${label} contains unsafe rendered placeholder copy.`);
  }
}

function assertSafePlaceholderWording(label, text) {
  assertIncludes(label, text, [
    "missing-value placeholder",
    "invalid-number placeholder",
    "object-string placeholder",
    "unsafe rendered placeholder copy",
  ]);
}

function assertNoSecretShapedValues(label, text) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const mongoProtocol = ["mongo", "db://"].join("");
  const mongoSrvProtocol = ["mongo", "db+srv://"].join("");
  const databaseUrlAssignment = new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=`, "i");
  const authorizationLiteral = new RegExp(`${["Author", "ization"].join("")}:`, "i");
  const authSchemeLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const apiKeyShape = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(mongoProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!lower.includes(mongoSrvProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!databaseUrlAssignment.test(scanned), `${label} contains database URL assignment text.`);
  assert(!authorizationLiteral.test(scanned), `${label} contains auth header literal.`);
  assert(!authSchemeLiteral.test(scanned), `${label} contains auth scheme marker.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!jwtLike.test(scanned), `${label} contains dotted credential-shaped text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long token-like text.`);
}

function assertSafetyBoundaries() {
  for (const doc of DOCS) {
    const text = readRequired(doc);
    assertNormalizedIncludes(doc, text, [
      "no production DB",
      "no real money",
      "no live provider/payment/bank/SMS/Slip OCR",
    ]);
  }

  const closeout = readRequired("docs/PROJECT_CLOSEOUT.md");
  assertNormalizedIncludes("Project closeout", closeout, [
    "local/staging/mock/sandbox only",
    "no live payout",
    "Phase W",
    "Phase X",
    "Phase Y",
    "Phase Z",
  ]);
}

function assertLuckyWheelRules() {
  const text = readRequired("docs/LUCKY_WHEEL_FINAL_UAT.md");
  assertIncludes("Lucky Wheel Final UAT", text, [
    "backend decides prizeIndex",
    "frontend must not decide reward",
    "admin write actions require reason",
    "audit log must record actor/action/reason safely",
    "local/staging/mock only",
  ]);
}

function assertAdminOperatorRules() {
  const text = readRequired("docs/ADMIN_OPERATOR_HANDOFF.md");
  assertIncludes("Admin Operator Handoff", text, [
    "## 10. What operators may do",
    "## 11. What operators must not do",
    "no live money",
    "no production DB",
    "no live bank/payment/provider/SMS/Slip OCR",
    "no secret sharing",
    "no guard downgrade",
  ]);
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretShapedValues(file, text);
    if (file.startsWith("docs/")) {
      assertNoUnsafeRenderedPlaceholderCopy(file, text);
    }
  }

  for (const doc of DOCS) {
    assertSafePlaceholderWording(doc, readRequired(doc));
  }
}

function main() {
  for (const doc of DOCS) readRequired(doc);
  console.log("Project closeout docs exist: PASS");

  assertSafetyBoundaries();
  console.log("Project closeout safety boundaries: PASS");

  assertLuckyWheelRules();
  console.log("Lucky Wheel backend result authority: PASS");
  console.log("Lucky Wheel frontend no result decision: PASS");

  assertAdminOperatorRules();
  console.log("Admin operator do/don't checklist: PASS");

  assertStaticScans();
  console.log("Project closeout static secret scan: PASS");
  console.log("Project closeout unsafe rendered placeholder copy scan: PASS");

  console.log("Project closeout smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Project closeout smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}