const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOCS = [
  "docs/FINANCIAL_LEDGER_STAGING_DRY_RUN_MIGRATION_PLAN.md",
  "docs/FINANCIAL_LEDGER_STAGING_BACKUP_RESTORE_PROOF.md",
  "docs/FINANCIAL_LEDGER_STAGING_ROLLBACK_PROOF.md",
];
const PACKAGE_PATH = path.join(ROOT, "package.json");
const RUN_ALL_PATH = path.join(ROOT, "src", "local-smoke-tests", "runAllLocalSmoke.js");
const SMOKE_PATH = __filename;

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
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
  const bearerLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const openAiKey = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(mongoProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!lower.includes(mongoSrvProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!databaseUrlAssignment.test(scanned), `${label} contains database URL assignment text.`);
  assert(!authorizationLiteral.test(scanned), `${label} contains auth header literal.`);
  assert(!bearerLiteral.test(scanned), `${label} contains auth scheme marker.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!jwtLike.test(scanned), `${label} contains dotted credential-shaped text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long token-like text.`);
}

function assertNoUnsafeEnablement(label, text) {
  const scanned = String(text || "");
  const unsafePatterns = [
    /live payout (enabled|enablement|on|active|allowed|approved)/i,
    /live provider (enabled|enablement|on|active|allowed|approved)/i,
    /production db (enabled|enablement|on|active|allowed|approved)/i,
    /real money (enabled|enablement|on|active|allowed|approved)/i,
  ];

  for (const pattern of unsafePatterns) {
    assert(!pattern.test(scanned), `${label} contains unsafe enablement wording.`);
  }
}

function assertDocs() {
  const requiredMarkers = [
    "staging/disposable DB only",
    "no production DB",
    "dry-run migration only",
    "backup/restore proof",
    "rollback proof",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no deploy",
    "no seed",
  ];
  const combinedText = DOCS.map((relativePath) => readRequired(relativePath)).join("\n");
  assertNormalizedIncludes("Phase V docs", combinedText, requiredMarkers);

  for (const relativePath of DOCS) {
    const text = readRequired(relativePath);
    assertNoSecretShapedValues(relativePath, text);
    assertNoUnsafeEnablement(relativePath, text);
  }
}

function assertPackageScript() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  assert.strictEqual(
    packageJson.scripts["smoke:financial-ledger-staging-dry-run-migration"],
    "node src/local-smoke-tests/financialLedgerStagingDryRunMigrationSmoke.js",
    "package.json must define smoke:financial-ledger-staging-dry-run-migration."
  );
}

function assertRunAllIncludesSmoke() {
  const text = fs.readFileSync(RUN_ALL_PATH, "utf8");
  assert(
    text.includes("financialLedgerStagingDryRunMigration"),
    "runAllLocalSmoke.js must include financialLedgerStagingDryRunMigration."
  );
  assert(
    text.includes("smoke:financial-ledger-staging-dry-run-migration"),
    "runAllLocalSmoke.js must run smoke:financial-ledger-staging-dry-run-migration."
  );
}

function assertSmokeSourceBoundary() {
  const text = fs.readFileSync(SMOKE_PATH, "utf8");
  const forbiddenRuntimeMarkers = [
    ["Prisma", "Client"].join(""),
    ["migrate", " deploy"].join(""),
    ["migrate", " dev"].join(""),
    ["db", " push"].join(""),
    ["db", " seed"].join(""),
    ["npm run", " seed"].join(""),
    ["child", "_process"].join(""),
    ["pg", "_dump"].join(""),
    ["pg", "_restore"].join(""),
    ["fet", "ch("].join(""),
    ["ax", "ios"].join(""),
    ["http", ".request"].join(""),
    ["https", ".request"].join(""),
  ];
  for (const marker of forbiddenRuntimeMarkers) {
    assert(!text.includes(marker), `Phase V smoke must not contain runtime marker: ${marker}`);
  }
  assertNoSecretShapedValues("Phase V smoke", text);
  assertNoUnsafeEnablement("Phase V smoke", text);
}

function main() {
  assertDocs();
  console.log("Phase V staging dry-run migration docs exist: PASS");
  console.log("Phase V safety phrases documented: PASS");

  assertPackageScript();
  console.log("Phase V package script registered: PASS");

  assertRunAllIncludesSmoke();
  console.log("Phase V all-local smoke registration: PASS");

  assertSmokeSourceBoundary();
  console.log("Phase V static smoke boundary: PASS");

  console.log("Financial ledger staging dry-run migration smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger staging dry-run migration smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
