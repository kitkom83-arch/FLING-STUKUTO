const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DISPOSABLE_DRY_RUN_DOC = "docs/DISPOSABLE_STAGING_DB_DRY_RUN.md";
const SAFETY_EVIDENCE_CHECKLIST = "docs/STAGING_DB_SAFETY_EVIDENCE_CHECKLIST.md";
const PHASE_AB_GO_NO_GO = "docs/PHASE_AB_GO_NO_GO.md";
const STATIC_SCAN_FILES = [
  DISPOSABLE_DRY_RUN_DOC,
  SAFETY_EVIDENCE_CHECKLIST,
  PHASE_AB_GO_NO_GO,
  "docs/SMOKE_COVERAGE.md",
  "README.md",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/disposableStagingDbDryRunPackSmoke.js",
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

function assertNoRuntimeExecutionMarkers() {
  const text = fs.readFileSync(__filename, "utf8");
  const forbiddenRuntimeMarkers = [
    ["Prisma", "Client"].join(""),
    ["migrate", " deploy"].join(""),
    ["migrate", " dev"].join(""),
    ["db", " push"].join(""),
    ["db", " seed"].join(""),
    ["npm run", " seed"].join(""),
    ["child", "_process"].join(""),
    ["spawn", "Sync"].join(""),
    ["exec", "Sync"].join(""),
    ["fet", "ch("].join(""),
    ["ax", "ios"].join(""),
    ["http", ".request"].join(""),
    ["https", ".request"].join(""),
  ];

  for (const marker of forbiddenRuntimeMarkers) {
    assert(!text.includes(marker), `Disposable staging DB smoke must not contain runtime marker: ${marker}`);
  }
}

function assertDisposableDryRunDoc() {
  const text = readRequired(DISPOSABLE_DRY_RUN_DOC);
  assertIncludes("disposable dry-run doc sections", text, [
    "## 1. Phase AB status",
    "## 2. Disposable staging DB definition",
    "## 3. Strict no-production DB boundary",
    "## 4. Required evidence before dry-run",
    "## 5. Required DATABASE_URL safety checks",
    "## 6. Allowed database targets",
    "## 7. Forbidden database targets",
    "## 8. Backup/restore proof checklist",
    "## 9. Rollback proof checklist",
    "## 10. Migration dry-run checklist",
    "## 11. Prisma dry-run checklist",
    "## 12. Seed restriction checklist",
    "## 13. Data isolation checklist",
    "## 14. No-real-money checklist",
    "## 15. No-live-provider/payment/bank/SMS/Slip OCR checklist",
    "## 16. Operator evidence checklist",
    "## 17. Go/No-Go matrix",
    "## 18. Stop conditions",
    "## 19. Final approval gate before any actual DB operation",
  ]);
  assertNormalizedIncludes("disposable dry-run no-production DB boundary", text, [
    "no production DB",
    "production clone",
    "production read replica",
    "production service account",
    "stop immediately if any DB target is unclear or production-like",
  ]);
  assertNormalizedIncludes("disposable dry-run staging-only boundary", text, [
    "disposable/staging DB only",
    "actual DB dry-run belongs to a later explicit approval phase only",
  ]);
  assertNormalizedIncludes("disposable dry-run Phase AB migration boundary", text, [
    "no actual migration in Phase AB",
    "Phase AB does not execute migration",
  ]);
}

function assertSafetyEvidenceChecklist() {
  const text = readRequired(SAFETY_EVIDENCE_CHECKLIST);
  assertIncludes("safety evidence checklist sections", text, [
    "## 1. Evidence owner",
    "## 2. Local machine evidence",
    "## 3. Git baseline evidence",
    "## 4. Safe CI evidence",
    "## 5. Staging DB identity evidence",
    "## 6. DB hostname/IP evidence",
    "## 7. DB name evidence",
    "## 8. DB user evidence",
    "## 9. No production host evidence",
    "## 10. No production database name evidence",
    "## 11. No live provider evidence",
    "## 12. No real-money evidence",
    "## 13. Backup evidence",
    "## 14. Restore evidence",
    "## 15. Rollback evidence",
    "## 16. Prisma command evidence",
    "## 17. Migration command evidence",
    "## 18. Seed command evidence",
    "## 19. Logs redaction evidence",
    "## 20. Final approval signature area",
  ]);
  assertNormalizedIncludes("safety evidence forbids secrets", text, [
    "Do not include secret values",
    "password values",
    "token values",
    "real database connection values",
  ]);
  assertNormalizedIncludes("safety evidence proof coverage", text, [
    "Backup evidence",
    "Restore evidence",
    "Rollback evidence",
  ]);
  assertSafePlaceholderWording("safety evidence checklist", text);
}

function assertPhaseAbGoNoGo() {
  const text = readRequired(PHASE_AB_GO_NO_GO);
  assertIncludes("Phase AB go no-go sections", text, [
    "## 1. GO criteria",
    "## 2. NO-GO criteria",
    "## 3. Required docs",
    "## 4. Required smoke results",
    "## 5. Required Safe CI result",
    "## 6. Required DB safety evidence",
    "## 7. Required backup/restore evidence",
    "## 8. Required rollback evidence",
    "## 9. Required mock/sandbox provider evidence",
    "## 10. Required approval before actual DB dry-run",
    "## 11. Explicit stop condition if production DB is detected",
    "## 12. Explicit stop condition if secret appears in logs",
    "## 13. Explicit stop condition if live provider mode is detected",
  ]);
  assertNormalizedIncludes("Phase AB production DB stop condition", text, [
    "Stop immediately if production DB",
  ]);
  assertNormalizedIncludes("Phase AB live provider stop condition", text, [
    "Stop immediately if live provider/payment/bank/SMS/Slip OCR mode is detected",
  ]);
  assertNormalizedIncludes("Phase AB approval before actual DB dry-run", text, [
    "Actual DB dry-run belongs to a later explicit approval phase only",
    "Without this approval, actual DB dry-run is NO-GO",
  ]);
  assertNormalizedIncludes("Phase AB final boundary", text, [
    "Phase AB does not execute migration",
    "Phase AB does not deploy",
    "Phase AB prepares evidence and guardrails only",
  ]);
}

function assertPackageAndRunner() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-dry-run-pack"],
    "node src/local-smoke-tests/disposableStagingDbDryRunPackSmoke.js",
    "package.json missing disposable staging DB dry-run pack smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assert(
    runner.includes("npm run smoke:disposable-staging-db-dry-run-pack"),
    "runAllLocalSmoke.js must include disposable staging DB dry-run pack smoke."
  );
}

function assertSmokeCoverage() {
  const text = readRequired("docs/SMOKE_COVERAGE.md");
  assertNormalizedIncludes("smoke coverage", text, [
    "Disposable Staging DB Dry-Run Pack Smoke",
    "disposable staging DB dry-run docs",
    "staging DB safety evidence checklist",
    "Phase AB Go/No-Go gate",
    "no production DB boundary",
    "no actual migration in Phase AB boundary",
    "backup/restore/rollback evidence checklist",
    "static secret scan",
    "unsafe rendered placeholder copy scan",
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
  readRequired(DISPOSABLE_DRY_RUN_DOC);
  readRequired(SAFETY_EVIDENCE_CHECKLIST);
  readRequired(PHASE_AB_GO_NO_GO);
  console.log("Disposable staging DB dry-run docs exist: PASS");

  assertDisposableDryRunDoc();
  console.log("Disposable staging DB boundaries: PASS");

  assertSafetyEvidenceChecklist();
  console.log("Staging DB safety evidence checklist: PASS");

  assertPhaseAbGoNoGo();
  console.log("Phase AB Go/No-Go gate: PASS");

  assertPackageAndRunner();
  console.log("Package script and all-local registration: PASS");

  assertSmokeCoverage();
  console.log("Smoke coverage registration: PASS");

  assertNoRuntimeExecutionMarkers();
  console.log("Disposable staging DB dry-run static-only source boundary: PASS");

  assertStaticScans();
  console.log("Disposable staging DB dry-run static secret scan: PASS");
  console.log("Disposable staging DB dry-run unsafe rendered placeholder copy scan: PASS");

  console.log("Disposable staging DB dry-run pack smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB dry-run pack smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
