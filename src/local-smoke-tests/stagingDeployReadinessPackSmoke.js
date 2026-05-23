const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const READINESS_PACK = "docs/STAGING_DEPLOY_READINESS_PACK.md";
const ENV_MATRIX = "docs/STAGING_ENVIRONMENT_MATRIX.md";
const GO_NO_GO = "docs/STAGING_DEPLOY_GO_NO_GO.md";
const STATIC_SCAN_FILES = [
  READINESS_PACK,
  ENV_MATRIX,
  GO_NO_GO,
  "docs/SMOKE_COVERAGE.md",
  "README.md",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/stagingDeployReadinessPackSmoke.js",
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

function assertPackageAndRunner() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:staging-deploy-readiness-pack"],
    "node src/local-smoke-tests/stagingDeployReadinessPackSmoke.js",
    "package.json missing staging deploy readiness pack smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assert(
    runner.includes("npm run smoke:staging-deploy-readiness-pack"),
    "runAllLocalSmoke.js must include staging deploy readiness pack smoke."
  );
}

function assertReadinessPack() {
  const text = readRequired(READINESS_PACK);
  assertIncludes("readiness pack sections", text, [
    "## 1. Phase AA status",
    "## 2. Current repository baseline",
    "## 3. Required preflight checks",
    "## 4. Required local smoke checks",
    "## 5. Safe CI verification",
    "## 6. Staging-only boundary",
    "## 7. No-production DB proof",
    "## 8. No-real-money proof",
    "## 9. No-live-provider/payment/bank/SMS/Slip OCR proof",
    "## 10. ENV readiness checklist",
    "## 11. Staging secrets handling checklist",
    "## 12. Staging database checklist",
    "## 13. Staging health check checklist",
    "## 14. Staging rollback checklist",
    "## 15. Staging monitoring checklist",
    "## 16. Staging UAT checklist",
    "## 17. Go/No-Go matrix",
    "## 18. Manual evidence checklist",
    "## 19. Operator handoff checkpoint",
    "## 20. Final approval gate before any deploy",
  ]);
  assertNormalizedIncludes("readiness pack boundary", text, [
    "local/staging/mock/sandbox only",
    "no production DB",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
    "deploy requires explicit approval in a later phase",
  ]);
  assertSafePlaceholderWording("readiness pack", text);
}

function assertEnvironmentMatrix() {
  const text = readRequired(ENV_MATRIX);
  assertIncludes("environment matrix sections", text, [
    "## 1. Required ENV names",
    "## 2. Allowed staging values",
    "## 3. Forbidden production/live values",
    "## 4. Provider mode matrix",
    "## 5. Payment mode matrix",
    "## 6. Bank statement mode matrix",
    "## 7. SMS mode matrix",
    "## 8. Slip OCR mode matrix",
    "## 9. Game provider mode matrix",
    "## 10. DATABASE_URL handling rules",
    "## 11. JWT/admin/member secret handling rules",
    "## 12. Health endpoint expectations",
    "## 13. Admin route expectations",
    "## 14. Member wheel expectations",
    "## 15. Financial ledger boundary expectations",
    "## 16. Evidence checklist",
    "GAME_PROVIDER_MODE=mock",
    "PAYMENT_PROVIDER_MODE=sandbox",
    "BANK_STATEMENT_MODE=mock",
    "SMS_PROVIDER_MODE=mock",
    "SLIP_OCR_MODE=mock",
  ]);
  assertNormalizedIncludes("environment matrix forbidden values", text, [
    "production DATABASE_URL",
    "live payout",
    "live bank",
    "live payment",
    "live provider",
    "live SMS",
    "live Slip OCR",
  ]);
}

function assertGoNoGo() {
  const text = readRequired(GO_NO_GO);
  assertIncludes("go no-go sections", text, [
    "## 1. Go criteria",
    "## 2. No-Go criteria",
    "## 3. Required local smoke evidence",
    "## 4. Required Safe CI evidence",
    "## 5. Required ENV evidence",
    "## 6. Required staging DB evidence",
    "## 7. Required mock/sandbox provider evidence",
    "## 8. Required rollback evidence",
    "## 9. Required operator acceptance",
    "## 10. Required manual UAT acceptance",
    "## 11. Approval section",
    "## 12. Explicit deploy approval gate",
  ]);
  assertNormalizedIncludes("go no-go deploy gate", text, [
    "Phase AA does not deploy",
    "Actual staging deploy belongs to the next phase only",
    "Any production deploy remains forbidden",
  ]);
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretShapedValues(file, text);
    assertNoUnsafeRenderedPlaceholderCopy(file, text);
  }
}

function main() {
  readRequired(READINESS_PACK);
  readRequired(ENV_MATRIX);
  readRequired(GO_NO_GO);
  console.log("Staging deploy readiness docs exist: PASS");

  assertReadinessPack();
  console.log("Readiness pack boundaries: PASS");

  assertEnvironmentMatrix();
  console.log("Environment matrix modes and forbidden values: PASS");

  assertGoNoGo();
  console.log("Go/No-Go explicit deploy approval gate: PASS");

  assertPackageAndRunner();
  console.log("Package script and all-local registration: PASS");

  assertStaticScans();
  console.log("Staging deploy readiness static secret scan: PASS");
  console.log("Staging deploy readiness unsafe rendered placeholder copy scan: PASS");

  console.log("Staging deploy readiness pack smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Staging deploy readiness pack smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
