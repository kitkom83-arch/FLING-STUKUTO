"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS = "src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarness.js";
const PROBE_SCRIPT = "src/staging-scripts/disposableStagingDbReadOnlyProbe.js";
const PROBE_DOC = "docs/DISPOSABLE_STAGING_DB_READ_ONLY_PROBE.md";
const COVERAGE_DOC = "docs/SMOKE_COVERAGE.md";
const STATIC_SCAN_FILES = [
  HARNESS,
  PROBE_SCRIPT,
  PROBE_DOC,
  COVERAGE_DOC,
  "README.md",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
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

function assertHarnessStaticContract() {
  const text = readRequired(HARNESS);

  assertIncludes("read-only probe runtime harness", text, [
    "disposableStagingDbReadOnlyProbe",
    "createFakeClient",
    "$queryRaw",
    "SELECT 1 AS probe_ok",
    "SHOW transaction_read_only",
    "information_schema.tables",
    "Safe disposable staging DB read-only probe case: PASS",
    "Missing DATABASE_URL case: PASS",
    "Production-looking hostname case: PASS",
    "Production-looking database name case: PASS",
    "Missing read-only confirmation guard case: PASS",
    "Unsafe provider mode case: PASS",
    "Read-only query failure redaction case: PASS",
    "assertNoLeakedValues",
  ]);

  assertIncludes("runtime harness provider guards", text, [
    "STAGING_DB_READ_ONLY_PROBE_CONFIRM",
    "GAME_PROVIDER_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
  ]);

  const forbiddenBehaviorMarkers = [
    ["Prisma", "Client"].join(""),
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

  for (const marker of forbiddenBehaviorMarkers) {
    assert(!text.includes(marker), `runtime harness must not contain behavior marker: ${marker}`);
  }
}

function assertProbeDocRuntimeBoundary() {
  const text = readRequired(PROBE_DOC);
  assertIncludes("read-only probe runtime doc sections", text, [
    "## 10. Runtime harness boundary",
    "synthetic injected DB client",
    "does not connect to any database",
    "read-only query failures fail closed",
  ]);
  assertSafePlaceholderWording("read-only probe doc", text);
}

function assertPackageRunnerCoverageAndReadme() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-read-only-probe-runtime"],
    "node src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarness.js",
    "package.json missing read-only probe runtime harness smoke script."
  );
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-read-only-probe-runtime-static"],
    "node src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarnessSmoke.js",
    "package.json missing read-only probe runtime harness static smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  const readOnlySmokeIndex = runner.indexOf('"npm run smoke:disposable-staging-db-read-only-probe-static"');
  const staticIndex = runner.indexOf('"npm run smoke:disposable-staging-db-read-only-probe-runtime-static"');
  const runtimeIndex = runner.indexOf('"npm run smoke:disposable-staging-db-read-only-probe-runtime"');
  assert(readOnlySmokeIndex >= 0, "runAllLocalSmoke.js missing read-only probe smoke.");
  assert(staticIndex > readOnlySmokeIndex, "read-only runtime static smoke must run after read-only probe smoke.");
  assert(runtimeIndex > staticIndex, "read-only runtime harness smoke must run after read-only runtime static smoke.");

  const coverage = readRequired(COVERAGE_DOC);
  assertNormalizedIncludes("smoke coverage read-only runtime harness", coverage, [
    "Disposable Staging DB Read-Only Connection Probe Runtime Harness Smoke",
    "synthetic injected DB client",
    "safe PASS case",
    "required fail-closed cases",
    "read-only query failure redaction",
    "no real database connection",
    "no migration/seed/deploy boundary",
    "static secret scan",
    "unsafe rendered placeholder copy scan",
  ]);

  const readme = readRequired("README.md");
  assertIncludes("README read-only runtime commands", readme, [
    "npm run smoke:disposable-staging-db-read-only-probe-runtime-static",
    "npm run smoke:disposable-staging-db-read-only-probe-runtime",
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
  readRequired(HARNESS);
  readRequired(PROBE_DOC);
  console.log("Disposable staging DB read-only probe runtime harness files exist: PASS");

  assertHarnessStaticContract();
  console.log("Disposable staging DB read-only probe runtime harness static contract: PASS");

  assertProbeDocRuntimeBoundary();
  console.log("Disposable staging DB read-only probe runtime harness docs: PASS");

  assertPackageRunnerCoverageAndReadme();
  console.log("Read-only probe runtime package, all-local registration, coverage, and README: PASS");

  assertStaticScans();
  console.log("Disposable staging DB read-only probe runtime harness static secret scan: PASS");
  console.log("Disposable staging DB read-only probe runtime harness unsafe rendered placeholder copy scan: PASS");

  console.log("Disposable staging DB read-only probe runtime harness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB read-only probe runtime harness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
