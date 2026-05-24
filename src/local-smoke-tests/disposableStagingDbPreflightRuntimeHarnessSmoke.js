"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS = "src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarness.js";
const RUNTIME_DOC = "docs/DISPOSABLE_STAGING_DB_PREFLIGHT_RUNTIME_HARNESS.md";
const COVERAGE_DOC = "docs/SMOKE_COVERAGE.md";
const STATIC_SCAN_FILES = [
  HARNESS,
  RUNTIME_DOC,
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

  assertIncludes("runtime harness", text, [
    "src",
    "staging-scripts",
    "disposableStagingDbPreflight.js",
    "spawnSync",
    "SAFE_ENV",
    "Safe disposable staging DB case: PASS",
    "Missing DATABASE_URL case: PASS",
    "Production-looking hostname case: PASS",
    "Production-looking database name case: PASS",
    "NODE_ENV production case: PASS",
    "APP_ENV production case: PASS",
    "Missing disposable confirmation guard case: PASS",
    "Missing dry-run guard case: PASS",
    "Unsafe provider mode case: PASS",
    "Redaction case: PASS",
    "assertNoLeakedValues",
  ]);

  assertIncludes("runtime harness provider guards", text, [
    "GAME_PROVIDER_MODE",
    "PAYMENT_PROVIDER_MODE",
    "BANK_STATEMENT_MODE",
    "SMS_PROVIDER_MODE",
    "SLIP_OCR_MODE",
  ]);

  assertIncludes("runtime harness process isolation", text, [
    "minimalProcessEnv",
    "process.execPath",
    "shell: false",
    "stdio: [\"ignore\", \"pipe\", \"pipe\"]",
  ]);

  const forbiddenBehaviorMarkers = [
    ["Prisma", "Client"].join(""),
    ["prisma", "."].join(""),
    ["migrate", " deploy"].join(""),
    ["migrate", " dev"].join(""),
    ["db", " push"].join(""),
    ["db", " seed"].join(""),
    ["npm run", " seed"].join(""),
    ["npm run", " deploy"].join(""),
    ["fet", "ch("].join(""),
    ["ax", "ios"].join(""),
    ["http", ".request"].join(""),
    ["https", ".request"].join(""),
    ".connect(",
  ];

  for (const marker of forbiddenBehaviorMarkers) {
    assert(!text.includes(marker), `runtime harness must not contain behavior marker: ${marker}`);
  }
}

function assertRuntimeDoc() {
  const text = readRequired(RUNTIME_DOC);
  assertIncludes("runtime harness doc sections", text, [
    "## 1. Phase AD status",
    "## 2. What the runtime harness proves",
    "## 3. Synthetic ENV only boundary",
    "## 4. No DB connection boundary",
    "## 5. Safe PASS case",
    "## 6. Required FAIL cases",
    "## 7. Production-looking blocker tests",
    "## 8. Provider mode blocker tests",
    "## 9. Redaction proof",
    "## 10. Commands to run",
    "## 11. Expected PASS output",
    "## 12. Expected FAIL behavior",
    "## 13. Stop conditions",
    "## 14. Next phase boundary",
  ]);

  assertNormalizedIncludes("runtime harness doc boundaries", text, [
    "no real DATABASE_URL",
    "no DB connection",
    "no migration",
    "no seed",
    "no deploy",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
  ]);
  assertSafePlaceholderWording("runtime harness doc", text);
}

function assertPackageRunnerCoverageAndReadme() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-preflight-runtime"],
    "node src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarness.js",
    "package.json missing runtime harness smoke script."
  );
  assert.strictEqual(
    pkg.scripts["smoke:disposable-staging-db-preflight-runtime-static"],
    "node src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarnessSmoke.js",
    "package.json missing runtime harness static smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  const preflightIndex = runner.indexOf('"npm run smoke:disposable-staging-db-preflight"');
  const staticIndex = runner.indexOf('"npm run smoke:disposable-staging-db-preflight-runtime-static"');
  const runtimeIndex = runner.indexOf('"npm run smoke:disposable-staging-db-preflight-runtime"');
  assert(preflightIndex >= 0, "runAllLocalSmoke.js missing preflight smoke.");
  assert(staticIndex > preflightIndex, "runtime static smoke must run after preflight smoke.");
  assert(runtimeIndex > staticIndex, "runtime harness smoke must run after runtime static smoke.");

  const coverage = readRequired(COVERAGE_DOC);
  assertNormalizedIncludes("smoke coverage runtime harness", coverage, [
    "Disposable Staging DB Preflight Runtime Harness Smoke",
    "runtime harness exists",
    "synthetic safe PASS case",
    "required fail-closed cases",
    "production-looking DB blockers",
    "provider mode blockers",
    "redaction checks",
    "no DB connection boundary",
    "no migration/seed/deploy boundary",
    "static secret scan",
    "unsafe rendered placeholder copy scan",
  ]);

  const readme = readRequired("README.md");
  assertIncludes("README runtime commands", readme, [
    "npm run smoke:disposable-staging-db-preflight-runtime-static",
    "npm run smoke:disposable-staging-db-preflight-runtime",
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
  readRequired(RUNTIME_DOC);
  console.log("Disposable staging DB preflight runtime harness files exist: PASS");

  assertHarnessStaticContract();
  console.log("Disposable staging DB preflight runtime harness static contract: PASS");

  assertRuntimeDoc();
  console.log("Disposable staging DB preflight runtime harness docs: PASS");

  assertPackageRunnerCoverageAndReadme();
  console.log("Runtime harness package, all-local registration, coverage, and README: PASS");

  assertStaticScans();
  console.log("Disposable staging DB preflight runtime harness static secret scan: PASS");
  console.log("Disposable staging DB preflight runtime harness unsafe rendered placeholder copy scan: PASS");

  console.log("Disposable staging DB preflight runtime harness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Disposable staging DB preflight runtime harness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
