"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PROBE_SCRIPT = "src/staging-scripts/disposableStagingDbReadOnlyProbe.js";
const PROBE_DOC = "docs/DISPOSABLE_STAGING_DB_READ_ONLY_PROBE.md";
const COVERAGE_DOC = "docs/SMOKE_COVERAGE.md";
const STATIC_SCAN_FILES = [
  PROBE_SCRIPT,
  PROBE_DOC,
  COVERAGE_DOC,
  "README.md",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/disposableStagingDbReadOnlyProbeSmoke.js",
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

function assertProbeScript() {
  const text = readRequired(PROBE_SCRIPT);

  assertIncludes("read-only probe script", text, [
    "@prisma/client",
    "PrismaClient",
    "process.env",
    "DATABASE_URL",
    "new URL",
    "STAGING_DB_DISPOSABLE_CONFIRM",
    "STAGING_DB_DRY_RUN_ONLY",
    "STAGING_DB_READ_ONLY_PROBE_CONFIRM",
    "GAME_PROVIDER_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
    "SELECT 1 AS probe_ok",
    "SHOW transaction_read_only",
    "information_schema.tables",
    "$queryRaw",
    "Disposable staging DB read-only probe: PASS",
  ]);

  assertIncludes("read-only probe production blocker", text, [
    "production",
    "prod",
    "live",
    "primary",
    "main-prod",
    "real-money",
    "payout-live",
    "toLowerCase",
  ]);

  assertIncludes("read-only probe safe output", text, [
    "protocol",
    "hostname",
    "port",
    "database name",
    "maskUsername",
    "Read-only connection probe: PASS",
    "Schema visibility probe: PASS",
  ]);

  const forbiddenScriptMarkers = [
    ["$execute", "Raw"].join(""),
    ["$transaction"].join(""),
    ["create", "Many"].join(""),
    ["update", "Many"].join(""),
    ["delete", "Many"].join(""),
    ["up", "sert"].join(""),
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
  ];

  for (const marker of forbiddenScriptMarkers) {
    assert(!text.includes(marker), `read-only probe script must not contain forbidden marker: ${marker}`);
  }

  assert(!/console\.(log|error)\(\s*databaseUrl\s*\)/.test(text), "probe script must not print raw database URL.");
  assert(!/console\.(log|error)\([^)]*parsedUrl\.password/.test(text), "probe script must not print password.");
}

function assertProbeDoc() {
  const text = readRequired(PROBE_DOC);
  assertIncludes("read-only probe doc sections", text, [
    "## 1. Phase AE status",
    "## 2. What the read-only probe checks",
    "## 3. What the read-only probe does",
    "## 4. What the read-only probe does not do",
    "## 5. Required ENV variables",
    "## 6. Safe output rules",
    "## 7. Secret redaction rules",
    "## 8. Production-looking DB block rules",
    "## 9. Provider mode requirements",
    "## 10. Runtime harness boundary",
    "## 11. Required commands",
    "## 12. Expected PASS output",
    "## 13. Expected FAIL output",
    "## 14. Operator evidence checklist",
    "## 15. Stop conditions",
    "## 16. Next phase boundary",
  ]);

  assertNormalizedIncludes("read-only probe doc boundaries", text, [
    "read-only connection probe",
    "no migration",
    "no seed",
    "no deploy",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
    "does not approve migration",
  ]);
  assertSafePlaceholderWording("read-only probe doc", text);
}

function assertPackageRunnerCoverageAndReadme() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["staging:db:read-only-probe"],
    "node src/staging-scripts/disposableStagingDbReadOnlyProbe.js",
    "package.json missing read-only probe staging script."
  );
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-read-only-probe-static"],
    "node src/local-smoke-tests/disposableStagingDbReadOnlyProbeSmoke.js",
    "package.json missing read-only probe smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  const preflightRuntimeIndex = runner.indexOf('"npm run smoke:disposable-staging-db-preflight-runtime"');
  const readOnlyStaticIndex = runner.indexOf('"npm run smoke:disposable-staging-db-read-only-probe-static"');
  assert(preflightRuntimeIndex >= 0, "runAllLocalSmoke.js missing preflight runtime smoke.");
  assert(readOnlyStaticIndex > preflightRuntimeIndex, "read-only probe smoke must run after preflight runtime smoke.");
  assert(
    !runner.includes('"npm run staging:db:read-only-probe"'),
    "runAllLocalSmoke.js must not run manual-only read-only probe."
  );

  const coverage = readRequired(COVERAGE_DOC);
  assertNormalizedIncludes("smoke coverage read-only probe", coverage, [
    "Disposable Staging DB Read-Only Connection Probe Smoke",
    "read-only probe script exists",
    "operator-approved DB connection guard",
    "read-only SQL only",
    "production-looking DB blocker",
    "provider mode boundary",
    "no migration/seed/deploy boundary",
    "static secret scan",
    "unsafe rendered placeholder copy scan",
  ]);

  const readme = readRequired("README.md");
  assertIncludes("README read-only probe commands", readme, [
    "npm run smoke:disposable-staging-db-read-only-probe-static",
    "npm run staging:db:read-only-probe",
    "manual-only",
    "not part of `npm run smoke:all-local`",
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
  readRequired(PROBE_SCRIPT);
  readRequired(PROBE_DOC);
  console.log("Disposable staging DB read-only probe files exist: PASS");

  assertProbeScript();
  console.log("Disposable staging DB read-only probe script boundary: PASS");

  assertProbeDoc();
  console.log("Disposable staging DB read-only probe docs boundary: PASS");

  assertPackageRunnerCoverageAndReadme();
  console.log("Read-only probe package, all-local registration, coverage, and README: PASS");

  assertStaticScans();
  console.log("Disposable staging DB read-only probe static secret scan: PASS");
  console.log("Disposable staging DB read-only probe unsafe rendered placeholder copy scan: PASS");

  console.log("Disposable staging DB read-only probe smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB read-only probe smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
