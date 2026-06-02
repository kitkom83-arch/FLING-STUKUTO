"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  BLOCKED_ALIASES,
  MOUNT_READINESS_BLOCKED,
  MOUNT_READINESS_NOT_READY,
  MOUNT_READINESS_STATE,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRoutePreflightReport,
  evaluateOroPlayCallbackStagingRoutePreflight,
  summarizeOroPlayCallbackMountReadiness,
} = require("../game-provider-mock/oroplayCallbackStagingRoutePreflight");
const {
  blockedCredentialLeakFixture,
  blockedExpressMountFixture,
  blockedExternalNetworkFixture,
  blockedLedgerMutationFixture,
  blockedLiveOroPlayCallFixture,
  blockedPrismaWriteFixture,
  blockedPublicAliasFixture,
  blockedWalletMutationFixture,
  cleanPreflightFixture,
  cloneFixture,
  rollbackReadyFixture,
  buildOroPlayCallbackStagingRoutePreflightFixtures,
} = require("../game-provider-mock/oroplayCallbackStagingRoutePreflightFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const PREFLIGHT_DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_PREFLIGHT.md";
const PREFLIGHT_HELPER = "src/game-provider-mock/oroplayCallbackStagingRoutePreflight.js";
const PREFLIGHT_FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRoutePreflightFixtures.js";
const PREFLIGHT_SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRoutePreflightSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const CHANGED_PHASE_FILES = [PREFLIGHT_DOC, PREFLIGHT_HELPER, PREFLIGHT_FIXTURES, PREFLIGHT_SMOKE];

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

function gateByName(report, name) {
  const gate = report.gates.find((entry) => entry.name === name);
  assert(gate, `missing gate ${name}.`);
  return gate;
}

function assertGateBlocked(report, name) {
  const gate = gateByName(report, name);
  assert.strictEqual(gate.passed, false, `${name} must fail.`);
  assert.strictEqual(gate.status, "BLOCKED", `${name} status must be BLOCKED.`);
}

function assertNoReadyToMountValue(report) {
  assert.notStrictEqual(report.mountReadiness, "READY_TO_MOUNT", "ORO-4G must never return ready-to-mount.");
  assert(!JSON.stringify(report).includes('"READY_TO_MOUNT"'), "report must not contain ready-to-mount status.");
}

function assertReportNeverActive(report) {
  assert.strictEqual(report.expressMountAllowed, false, "Express mount must not be allowed.");
  assert.strictEqual(report.publicAliasAllowed, false, "Public alias must not be allowed.");
  assert.strictEqual(report.routeActive, false, "Route must not be active.");
  assert.strictEqual(report.publicAliasActive, false, "Public alias must not be active.");
  for (const route of report.routeCandidates) {
    assert.strictEqual(route.active, false, `${route.path} must not be active.`);
    assert.strictEqual(route.mounted, false, `${route.path} must not be mounted.`);
    assert.strictEqual(route.public, false, `${route.path} must not be public.`);
  }
  for (const alias of report.blockedAliases) {
    assert.strictEqual(alias.active, false, `${alias.path} alias must not be active.`);
    assert.strictEqual(alias.blocked, true, `${alias.path} alias must be blocked.`);
  }
}

function secretShapePatterns() {
  return [
    new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
    new RegExp(`${["Ba", "sic"].join("")}\\s+[A-Za-z0-9+/=]{12,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["DATABASE", "_URL"].join("")}\\s*=`, "i"),
    new RegExp(`${["pass", "word"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["client", "Secret"].join("")}\\s*[:=]`, "i"),
  ];
}

function assertNoSecretShapedText(label, text) {
  for (const pattern of secretShapePatterns()) {
    assert(!pattern.test(text), `${label} contains secret-shaped text: ${pattern}.`);
  }
}

function assertNoForbiddenRuntimeMarkers() {
  const forbiddenPatterns = [
    /require\(["']@prisma\/client["']\)/i,
    /from\s+["']@prisma\/client["']/i,
    /require\(["'][^"']*wallet[^"']*["']\)/i,
    /require\(["'][^"']*ledger[^"']*["']\)/i,
    /from\s+["'][^"']*wallet[^"']*["']/i,
    /from\s+["'][^"']*ledger[^"']*["']/i,
    /\bfetch\s*\(/i,
    /\baxios\b/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
    /\bprisma\s*\.\s*\$transaction\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
  ];

  for (const file of [PREFLIGHT_HELPER, PREFLIGHT_FIXTURES]) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(PREFLIGHT_DOC);
  assertIncludes("ORO-4G preflight doc", doc, [
    "ORO-4G Staging Route Wiring Preflight / Mount Readiness Checklist",
    "PRE-MOUNT ONLY",
    "NO EXPRESS MOUNT",
    "NO PUBLIC ALIAS",
    "NO RUNTIME MUTATION",
    "NOT_READY_TO_MOUNT_BY_DEFAULT",
    "POST /api/oroplay/balance",
    "POST /api/oroplay/transaction",
    "POST /api/balance",
    "POST /api/transaction",
    "disable staging flag",
    "remove route mount",
    "run Safe CI",
    "ORO-4H Staging Route Wiring Dry-Run Gate / Still No Public Alias",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-route-preflight"],
    "node src/local-smoke-tests/oroplayCallbackStagingRoutePreflightSmoke.js",
    "package.json missing ORO-4G smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4G registration", runner, [
    "oroplayCallbackStagingRoutePreflight.js",
    "oroplayCallbackStagingRoutePreflightFixtures.js",
    "oroplayCallbackStagingRoutePreflightSmoke.js",
    "smoke:oroplay-callback-staging-route-preflight",
    "oroplayCallbackStagingRoutePreflight",
    "docs/OROPLAY_CALLBACK_STAGING_ROUTE_PREFLIGHT.md",
  ]);

  assertIncludes("ORO-4G API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4G callback staging route preflight",
    "no Express mount",
    "public aliases remain blocked",
  ]);
  assertIncludes("ORO-4G integration plan docs", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-4G Current",
    "Staging Route Wiring Preflight",
    "rollback readiness",
  ]);
  assertIncludes("ORO-4G roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4G current/staging route wiring preflight",
    "ORO-4H Staging Route Wiring Dry-Run Gate / Still No Public Alias",
  ]);
  assertIncludes("ORO-4G coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4G OroPlay Callback Staging Route Preflight Coverage",
    "smoke:oroplay-callback-staging-route-preflight",
  ]);
}

function assertCleanPreflight() {
  const report = evaluateOroPlayCallbackStagingRoutePreflight(cleanPreflightFixture);
  assert.strictEqual(report.phase, "ORO-4G");
  assert.strictEqual(report.name, "Staging Route Wiring Preflight");
  assert.strictEqual(report.mountReadiness, MOUNT_READINESS_NOT_READY);
  assert.strictEqual(report.mountReadinessState, MOUNT_READINESS_STATE);
  assert.strictEqual(report.ok, true);
  assertReportNeverActive(report);
  assertNoReadyToMountValue(report);

  const summary = summarizeOroPlayCallbackMountReadiness(report);
  assert.strictEqual(summary.readyToMount, false);
  assert.strictEqual(summary.mountReadiness, MOUNT_READINESS_NOT_READY);
  assert.strictEqual(summary.blockedGateCount, 0);
}

function assertBlockedAliases() {
  const report = buildOroPlayCallbackStagingRoutePreflightReport(blockedPublicAliasFixture);
  assert.strictEqual(report.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(report, "noPublicAlias");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/balance"), "/api/balance must be blocked.");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/transaction"), "/api/transaction must be blocked.");
  assert(gateByName(report, "noPublicAlias").evidence.proposedBlockedAliases.includes("/api/balance"));
  assert(gateByName(report, "noPublicAlias").evidence.proposedBlockedAliases.includes("/api/transaction"));
  assertReportNeverActive(report);
  assertNoReadyToMountValue(report);
}

function assertBlockedExpressMount() {
  const report = buildOroPlayCallbackStagingRoutePreflightReport(blockedExpressMountFixture);
  assert.strictEqual(report.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(report, "noExpressMount");
  assertReportNeverActive(report);
  assertNoReadyToMountValue(report);
}

function assertMutationBlockers() {
  const cases = [
    [blockedWalletMutationFixture, "noRuntimeWalletMutation"],
    [blockedLedgerMutationFixture, "noRuntimeLedgerMutation"],
    [blockedPrismaWriteFixture, "noPrismaWrite"],
  ];

  for (const [fixture, gateName] of cases) {
    const report = buildOroPlayCallbackStagingRoutePreflightReport(fixture);
    assert.strictEqual(report.mountReadiness, MOUNT_READINESS_BLOCKED);
    assertGateBlocked(report, gateName);
    assertReportNeverActive(report);
    assertNoReadyToMountValue(report);
  }
}

function assertExternalAndLiveBlockers() {
  const externalReport = buildOroPlayCallbackStagingRoutePreflightReport(blockedExternalNetworkFixture);
  assert.strictEqual(externalReport.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(externalReport, "noExternalNetwork");

  const liveReport = buildOroPlayCallbackStagingRoutePreflightReport(blockedLiveOroPlayCallFixture);
  assert.strictEqual(liveReport.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(liveReport, "noLiveOroPlayCall");
  assertReportNeverActive(externalReport);
  assertReportNeverActive(liveReport);
  assertNoReadyToMountValue(externalReport);
  assertNoReadyToMountValue(liveReport);
}

function assertRollbackChecklist() {
  const readyReport = buildOroPlayCallbackStagingRoutePreflightReport(rollbackReadyFixture);
  assert.strictEqual(readyReport.rollback.status, "PASS");
  for (const requirement of ROLLBACK_REQUIREMENTS) {
    const item = readyReport.rollback.requirements.find((entry) => entry.key === requirement.key);
    assert(item, `missing rollback requirement ${requirement.key}.`);
    assert.strictEqual(item.status, "PASS", `${requirement.key} must pass.`);
  }

  const missingRollback = cloneFixture(cleanPreflightFixture);
  missingRollback.id = "missingRollbackFixture";
  missingRollback.rollback.removeRouteMount = false;
  const missingReport = buildOroPlayCallbackStagingRoutePreflightReport(missingRollback);
  assert.strictEqual(missingReport.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(missingReport, "rollbackChecklistComplete");
  assertNoReadyToMountValue(missingReport);
}

function assertSanitizerAndSecretBoundary() {
  const leakReport = buildOroPlayCallbackStagingRoutePreflightReport(blockedCredentialLeakFixture);
  assert.strictEqual(leakReport.mountReadiness, MOUNT_READINESS_BLOCKED);
  assertGateBlocked(leakReport, "noCredentialLeak");
  const serializedLeakReport = JSON.stringify(leakReport);
  assert(!serializedLeakReport.includes("mock-callback-credential-marker"), "report must not echo leak marker values.");
  assertNoSecretShapedText("ORO-4G leak report", serializedLeakReport);

  const sourceText = CHANGED_PHASE_FILES.map((file) => readRequired(file)).join("\n");
  assertNoSecretShapedText("ORO-4G changed files", sourceText);
  assertNoForbiddenRuntimeMarkers();
}

function assertInvariantAcrossFixtures() {
  const fixtures = buildOroPlayCallbackStagingRoutePreflightFixtures();
  assert(fixtures.length >= 8, "fixture set must include required ORO-4G cases.");
  for (const fixture of fixtures) {
    const report = buildOroPlayCallbackStagingRoutePreflightReport(fixture);
    assertNoReadyToMountValue(report);
    assertReportNeverActive(report);
  }
  assert.strictEqual(BLOCKED_ALIASES.length, 2, "blocked alias set must include balance and transaction aliases.");
}

function assertNoRuntimeRouteWiring() {
  const app = readRequired("src/app.js");
  assert(!app.includes("oroplayCallbackStagingRoutePreflight"), "src/app.js must not import ORO-4G preflight.");
  assert(!app.includes('app.use("/api/balance"'), "src/app.js must not mount /api/balance.");
  assert(!app.includes('app.use("/api/transaction"'), "src/app.js must not mount /api/transaction.");
}

function main() {
  assertDocsAndRegistration();
  assertCleanPreflight();
  assertBlockedAliases();
  assertBlockedExpressMount();
  assertMutationBlockers();
  assertExternalAndLiveBlockers();
  assertRollbackChecklist();
  assertSanitizerAndSecretBoundary();
  assertInvariantAcrossFixtures();
  assertNoRuntimeRouteWiring();
  console.log("ORO-4G OroPlay callback staging route preflight smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4G OroPlay callback staging route preflight smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
