"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  BLOCKED,
  BLOCKED_ALIASES,
  DRY_RUN_GATE_PASS,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRouteDryRunGateReport,
  evaluateOroPlayCallbackStagingRouteDryRunGate,
  summarizeOroPlayCallbackDryRunGate,
} = require("../game-provider-mock/oroplayCallbackStagingRouteDryRunGate");
const {
  blockedActiveRouteDryRunFixture,
  blockedCredentialLeakDryRunFixture,
  blockedExpressMountDryRunFixture,
  blockedExternalNetworkDryRunFixture,
  blockedLedgerMutationDryRunFixture,
  blockedLiveOroPlayCallDryRunFixture,
  blockedMissingIdempotencyDryRunFixture,
  blockedPrismaWriteDryRunFixture,
  blockedPublicAliasDryRunFixture,
  blockedSrcAppChangeDryRunFixture,
  blockedWalletMutationDryRunFixture,
  cleanDryRunGateFixture,
  cloneFixture,
  rollbackMissingDryRunFixture,
  buildOroPlayCallbackStagingRouteDryRunGateFixtures,
} = require("../game-provider-mock/oroplayCallbackStagingRouteDryRunGateFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const DRY_RUN_DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_DRY_RUN_GATE.md";
const DRY_RUN_HELPER = "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGate.js";
const DRY_RUN_FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteDryRunGateFixtures.js";
const DRY_RUN_SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteDryRunGateSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [DRY_RUN_DOC, DRY_RUN_HELPER, DRY_RUN_FIXTURES, DRY_RUN_SMOKE];
const NEW_MOCK_FILES = [DRY_RUN_HELPER, DRY_RUN_FIXTURES];

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
  assert.strictEqual(gate.status, BLOCKED, `${name} status must be BLOCKED.`);
}

function forbiddenRuntimeStatuses() {
  return ["READY_TO_MOUNT", "PUBLIC_ALIAS_READY", "ROUTE_ACTIVE", "LIVE_TRAFFIC_READY"];
}

function assertNoForbiddenRuntimeStatus(report) {
  const serialized = JSON.stringify(report);
  for (const forbidden of forbiddenRuntimeStatuses()) {
    assert(!serialized.includes(forbidden), `ORO-4H report must not include ${forbidden}.`);
  }
}

function assertReportNeverRuntimeReady(report) {
  assert.strictEqual(report.expressMountAllowed, false, "Express mount must not be allowed.");
  assert.strictEqual(report.publicAliasAllowed, false, "Public alias must not be allowed.");
  assert.strictEqual(report.runtimeTrafficAllowed, false, "Runtime traffic must not be allowed.");
  assert.strictEqual(report.routeActive, false, "Route must not be active.");
  assert.strictEqual(report.liveRouteActive, false, "Live route must not be active.");
  for (const route of report.routeCandidates) {
    assert.strictEqual(route.active, false, `${route.path} must not be active.`);
    assert.strictEqual(route.mounted, false, `${route.path} must not be mounted.`);
    assert.strictEqual(route.public, false, `${route.path} must not be public.`);
    assert.strictEqual(route.staticRouteDescriptorOnly, true, `${route.path} must be descriptor only.`);
  }
  for (const alias of report.blockedAliases) {
    assert.strictEqual(alias.active, false, `${alias.path} alias must not be active.`);
    assert.strictEqual(alias.mounted, false, `${alias.path} alias must not be mounted.`);
    assert.strictEqual(alias.blocked, true, `${alias.path} alias must be blocked.`);
  }
  assertNoForbiddenRuntimeStatus(report);
}

function secretShapePatterns() {
  return [
    new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
    new RegExp(`${["Ba", "sic"].join("")}\\s+[A-Za-z0-9+/=]{12,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["DATABASE", "_URL"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["pass", "word"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["client", "Secret"].join("")}\\s*[:=]`, "i"),
    new RegExp(["-----BEGIN", " PRIVATE KEY-----"].join(""), "i"),
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

  for (const file of NEW_MOCK_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DRY_RUN_DOC);
  assertIncludes("ORO-4H dry-run gate doc", doc, [
    "ORO-4H Staging Route Wiring Dry-Run Gate / Still No Public Alias",
    "DRY-RUN GATE ONLY",
    "NO EXPRESS MOUNT",
    "NO PUBLIC ALIAS",
    "NO RUNTIME TRAFFIC",
    "NO RUNTIME MUTATION",
    "dry-run only",
    "static route descriptor",
    "mock invocation",
    "no Express mount",
    "no public alias",
    "no runtime traffic",
    "POST /api/oroplay/balance",
    "POST /api/oroplay/transaction",
    "POST /api/balance",
    "POST /api/transaction",
    "DRY_RUN_GATE_PASS",
    "MOUNT_BLOCKED_BY_PHASE",
    "PUBLIC_ALIAS_BLOCKED_BY_PHASE",
    "NO_RUNTIME_TRAFFIC",
    "ORO-4I",
    "Staging Route Wiring Internal Shadow Harness",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-route-dry-run-gate"],
    "node src/local-smoke-tests/oroplayCallbackStagingRouteDryRunGateSmoke.js",
    "package.json missing ORO-4H smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4H registration", runner, [
    "oroplayCallbackStagingRouteDryRunGate.js",
    "oroplayCallbackStagingRouteDryRunGateFixtures.js",
    "oroplayCallbackStagingRouteDryRunGateSmoke.js",
    "smoke:oroplay-callback-staging-route-dry-run-gate",
    "oroplayCallbackStagingRouteDryRunGate",
    "docs/OROPLAY_CALLBACK_STAGING_ROUTE_DRY_RUN_GATE.md",
  ]);

  assertIncludes("ORO-4H API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4H callback staging route dry-run gate",
    "route candidates remain inactive",
    "public aliases remain blocked",
    "no Express mount",
    "no runtime traffic",
  ]);
  assertIncludes("ORO-4H integration plan docs", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-4H Current",
    "dry-run gate",
    "static route descriptor",
    "abort criteria",
    "no runtime mutation",
  ]);
  assertIncludes("ORO-4H roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4H current/staging route wiring dry-run gate",
    "ORO-4H CLOSED target criteria",
    "ORO-4I Staging Route Wiring Internal Shadow Harness / Still No Express Mount",
  ]);
  assertIncludes("ORO-4H coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4H OroPlay Callback Staging Route Dry-Run Gate Coverage",
    "smoke:oroplay-callback-staging-route-dry-run-gate",
    "no mount-ready/public-ready status",
  ]);
}

function assertCleanDryRunGate() {
  const report = evaluateOroPlayCallbackStagingRouteDryRunGate(cleanDryRunGateFixture);
  assert.strictEqual(report.phase, "ORO-4H");
  assert.strictEqual(report.name, "Staging Route Wiring Dry-Run Gate");
  assert.strictEqual(report.gateMode, "DRY_RUN_ONLY");
  assert.strictEqual(report.dryRunStatus, DRY_RUN_GATE_PASS);
  assert.strictEqual(report.ok, true);
  assertReportNeverRuntimeReady(report);

  const summary = summarizeOroPlayCallbackDryRunGate(report);
  assert.strictEqual(summary.dryRunStatus, DRY_RUN_GATE_PASS);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.blockedGateCount, 0);
  assertNoForbiddenRuntimeStatus(summary);
}

function assertBlockedAliases() {
  const report = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedPublicAliasDryRunFixture);
  assert.strictEqual(report.dryRunStatus, BLOCKED);
  assertGateBlocked(report, "noPublicAlias");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/balance"), "/api/balance must be blocked.");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/transaction"), "/api/transaction must be blocked.");
  const gate = gateByName(report, "noPublicAlias");
  assert(gate.evidence.proposedBlockedAliases.includes("/api/balance"));
  assert(gate.evidence.proposedBlockedAliases.includes("/api/transaction"));
  assertReportNeverRuntimeReady(report);
}

function assertMountAndRouteBlockers() {
  const mountReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedExpressMountDryRunFixture);
  assert.strictEqual(mountReport.dryRunStatus, BLOCKED);
  assertGateBlocked(mountReport, "noExpressMount");
  assertReportNeverRuntimeReady(mountReport);

  const activeReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedActiveRouteDryRunFixture);
  assert.strictEqual(activeReport.dryRunStatus, BLOCKED);
  assertGateBlocked(activeReport, "noActiveRoute");
  assertReportNeverRuntimeReady(activeReport);

  const appChangeReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedSrcAppChangeDryRunFixture);
  assert.strictEqual(appChangeReport.dryRunStatus, BLOCKED);
  assertGateBlocked(appChangeReport, "noSrcAppChangeRequired");
  assertReportNeverRuntimeReady(appChangeReport);
}

function assertMutationBlockers() {
  const cases = [
    [blockedWalletMutationDryRunFixture, "noRuntimeWalletMutation"],
    [blockedLedgerMutationDryRunFixture, "noRuntimeLedgerMutation"],
    [blockedPrismaWriteDryRunFixture, "noPrismaWrite"],
  ];

  for (const [fixture, gateName] of cases) {
    const report = buildOroPlayCallbackStagingRouteDryRunGateReport(fixture);
    assert.strictEqual(report.dryRunStatus, BLOCKED);
    assertGateBlocked(report, gateName);
    assertReportNeverRuntimeReady(report);
  }
}

function assertExternalAndLiveBlockers() {
  const externalReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedExternalNetworkDryRunFixture);
  assert.strictEqual(externalReport.dryRunStatus, BLOCKED);
  assertGateBlocked(externalReport, "noExternalNetwork");
  assertReportNeverRuntimeReady(externalReport);

  const liveReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedLiveOroPlayCallDryRunFixture);
  assert.strictEqual(liveReport.dryRunStatus, BLOCKED);
  assertGateBlocked(liveReport, "noLiveOroPlayCall");
  assertReportNeverRuntimeReady(liveReport);
}

function assertRequestResponseAndIdempotency() {
  const missingRequest = cloneFixture(cleanDryRunGateFixture);
  missingRequest.id = "missingRequestEnvelopeFixture";
  missingRequest.documentation.requestEnvelopeDocumented = false;
  const requestReport = buildOroPlayCallbackStagingRouteDryRunGateReport(missingRequest);
  assert.strictEqual(requestReport.dryRunStatus, BLOCKED);
  assertGateBlocked(requestReport, "requestEnvelopeDocumented");
  assertReportNeverRuntimeReady(requestReport);

  const missingResponse = cloneFixture(cleanDryRunGateFixture);
  missingResponse.id = "missingResponseEnvelopeFixture";
  missingResponse.documentation.responseEnvelopeDocumented = false;
  const responseReport = buildOroPlayCallbackStagingRouteDryRunGateReport(missingResponse);
  assert.strictEqual(responseReport.dryRunStatus, BLOCKED);
  assertGateBlocked(responseReport, "responseEnvelopeDocumented");
  assertReportNeverRuntimeReady(responseReport);

  const idempotencyReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedMissingIdempotencyDryRunFixture);
  assert.strictEqual(idempotencyReport.dryRunStatus, BLOCKED);
  assertGateBlocked(idempotencyReport, "transactionIdempotencyDocumented");
  assertReportNeverRuntimeReady(idempotencyReport);
}

function assertRollbackChecklist() {
  const cleanReport = buildOroPlayCallbackStagingRouteDryRunGateReport(cleanDryRunGateFixture);
  assert.strictEqual(cleanReport.rollback.status, "PASS");
  for (const requirement of ROLLBACK_REQUIREMENTS) {
    const item = cleanReport.rollback.requirements.find((entry) => entry.key === requirement.key);
    assert(item, `missing rollback requirement ${requirement.key}.`);
    assert.strictEqual(item.status, "PASS", `${requirement.key} must pass.`);
  }

  const missingReport = buildOroPlayCallbackStagingRouteDryRunGateReport(rollbackMissingDryRunFixture);
  assert.strictEqual(missingReport.dryRunStatus, BLOCKED);
  assertGateBlocked(missingReport, "rollbackDocumented");
  assertReportNeverRuntimeReady(missingReport);
}

function assertSanitizerAndSecretBoundary() {
  const leakReport = buildOroPlayCallbackStagingRouteDryRunGateReport(blockedCredentialLeakDryRunFixture);
  assert.strictEqual(leakReport.dryRunStatus, BLOCKED);
  assertGateBlocked(leakReport, "noCredentialLeak");
  const serializedLeakReport = JSON.stringify(leakReport);
  assert(!serializedLeakReport.includes("neutral-dry-run-auth-marker"), "report must not echo marker values.");
  assert(!serializedLeakReport.includes("mock-callback-credential-marker"), "report must not echo marker values.");
  assertNoSecretShapedText("ORO-4H leak report", serializedLeakReport);

  const sourceText = NEW_FILES.map((file) => readRequired(file)).join("\n");
  assertNoSecretShapedText("ORO-4H changed files", sourceText);
  assertNoForbiddenRuntimeMarkers();
}

function assertInvariantAcrossFixtures() {
  const fixtures = buildOroPlayCallbackStagingRouteDryRunGateFixtures();
  assert(fixtures.length >= 13, "fixture set must include required ORO-4H cases.");
  for (const fixture of fixtures) {
    const report = buildOroPlayCallbackStagingRouteDryRunGateReport(fixture);
    assertReportNeverRuntimeReady(report);
  }
  assert.strictEqual(BLOCKED_ALIASES.length, 2, "blocked alias set must include balance and transaction aliases.");
}

function assertNoRuntimeRouteWiring() {
  const app = readRequired("src/app.js");
  assert(!app.includes("oroplayCallbackStagingRouteDryRunGate"), "src/app.js must not import ORO-4H dry-run gate.");
  assert(!app.includes('app.use("/api/balance"'), "src/app.js must not mount /api/balance.");
  assert(!app.includes('app.use("/api/transaction"'), "src/app.js must not mount /api/transaction.");
}

function main() {
  assertDocsAndRegistration();
  assertCleanDryRunGate();
  assertBlockedAliases();
  assertMountAndRouteBlockers();
  assertMutationBlockers();
  assertExternalAndLiveBlockers();
  assertRequestResponseAndIdempotency();
  assertRollbackChecklist();
  assertSanitizerAndSecretBoundary();
  assertInvariantAcrossFixtures();
  assertNoRuntimeRouteWiring();
  console.log("ORO-4H OroPlay callback staging route dry-run gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4H OroPlay callback staging route dry-run gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
