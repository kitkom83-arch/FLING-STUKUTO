const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PREFLIGHT_SCRIPT = "src/staging-scripts/disposableStagingDbPreflight.js";
const PREFLIGHT_DOC = "docs/DISPOSABLE_STAGING_DB_PREFLIGHT.md";
const STATIC_SCAN_FILES = [
  PREFLIGHT_SCRIPT,
  PREFLIGHT_DOC,
  "docs/SMOKE_COVERAGE.md",
  "README.md",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/disposableStagingDbPreflightSmoke.js",
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

function assertPreflightScript() {
  const text = readRequired(PREFLIGHT_SCRIPT);
  assertIncludes("preflight script", text, [
    "process.env",
    "DATABASE_URL",
    "new URL",
    "STAGING_DB_DISPOSABLE_CONFIRM",
    "STAGING_DB_DRY_RUN_ONLY",
    "GAME_PROVIDER_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
    "Disposable staging DB preflight: PASS",
  ]);

  assertIncludes("production-looking blocker", text, [
    "production",
    "prod",
    "live",
    "primary",
    "main-prod",
    "real-money",
    "payout-live",
    "toLowerCase",
  ]);

  assertIncludes("safe summary output", text, [
    "protocol",
    "hostname",
    "port",
    "database name",
    "maskUsername",
  ]);

  const forbiddenScriptMarkers = [
    ["Prisma", "Client"].join(""),
    ["migrate", " deploy"].join(""),
    ["migrate", " dev"].join(""),
    ["db", " push"].join(""),
    ["db", " seed"].join(""),
    ["npm run", " seed"].join(""),
    ["npm run", " deploy"].join(""),
    ["child", "_process"].join(""),
    ["spawn", "Sync"].join(""),
    ["exec", "Sync"].join(""),
    ["fet", "ch("].join(""),
    ["ax", "ios"].join(""),
    ["http", ".request"].join(""),
    ["https", ".request"].join(""),
    ".connect(",
  ];

  for (const marker of forbiddenScriptMarkers) {
    assert(!text.includes(marker), `preflight script must not contain runtime marker: ${marker}`);
  }

  assert(!/console\.(log|error)\(\s*databaseUrl\s*\)/.test(text), "preflight script must not print raw database URL.");
  assert(!/console\.(log|error)\([^)]*parsed\.password/.test(text), "preflight script must not print password.");
}

function assertPreflightDoc() {
  const text = readRequired(PREFLIGHT_DOC);
  assertIncludes("preflight doc sections", text, [
    "## 1. Phase AC status",
    "## 2. What the preflight script checks",
    "## 3. What the preflight script does not do",
    "## 4. Required ENV variables",
    "## 5. Safe output rules",
    "## 6. Secret redaction rules",
    "## 7. Production-looking DB block rules",
    "## 8. Provider mode requirements",
    "## 9. Required commands",
    "## 10. Expected PASS output",
    "## 11. Expected FAIL output",
    "## 12. Operator evidence checklist",
    "## 13. Stop conditions",
    "## 14. Next phase boundary",
  ]);

  assertNormalizedIncludes("preflight doc no DB connection boundary", text, [
    "no DB connection",
    "connect to a database",
  ]);
  assertNormalizedIncludes("preflight doc no migration seed deploy boundary", text, [
    "no migration",
    "no seed",
    "no deploy",
  ]);
  assertNormalizedIncludes("preflight doc provider mode boundary", text, [
    "GAME_PROVIDER_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
  ]);
  assertSafePlaceholderWording("preflight doc", text);
}

function assertPackageRunnerAndCoverage() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["staging:db:preflight"],
    "node src/staging-scripts/disposableStagingDbPreflight.js",
    "package.json missing disposable staging DB preflight script."
  );
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-preflight"],
    "node src/local-smoke-tests/disposableStagingDbPreflightSmoke.js",
    "package.json missing disposable staging DB preflight smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assert(
    runner.includes("npm run smoke:disposable-staging-db-preflight"),
    "runAllLocalSmoke.js must include disposable staging DB preflight smoke."
  );

  const coverage = readRequired("docs/SMOKE_COVERAGE.md");
  assertNormalizedIncludes("smoke coverage", coverage, [
    "Disposable Staging DB Preflight Smoke",
    "preflight script exists",
    "docs exist",
    "no DB connection boundary",
    "no migration/seed/deploy boundary",
    "production-looking DB blocker",
    "secret redaction rule",
    "provider mode boundary",
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
  readRequired(PREFLIGHT_SCRIPT);
  readRequired(PREFLIGHT_DOC);
  console.log("Disposable staging DB preflight files exist: PASS");

  assertPreflightScript();
  console.log("Disposable staging DB preflight script boundary: PASS");

  assertPreflightDoc();
  console.log("Disposable staging DB preflight docs boundary: PASS");

  assertPackageRunnerAndCoverage();
  console.log("Package script, all-local registration, and coverage: PASS");

  assertStaticScans();
  console.log("Disposable staging DB preflight static secret scan: PASS");
  console.log("Disposable staging DB preflight unsafe rendered placeholder copy scan: PASS");

  console.log("Disposable staging DB preflight smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB preflight smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
