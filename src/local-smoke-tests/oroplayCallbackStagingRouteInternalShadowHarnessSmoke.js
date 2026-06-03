"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  BLOCKED,
  BLOCKED_ALIASES,
  HARNESS_MODE,
  INTERNAL_SHADOW_PASS,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRouteInternalShadowHarnessReport,
  evaluateOroPlayCallbackStagingRouteInternalShadowHarness,
  runOroPlayCallbackInternalShadowInvocation,
  summarizeOroPlayCallbackInternalShadowHarness,
} = require("../game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarness");
const {
  balanceShadowInvocationFixture,
  blockedActiveRouteShadowFixture,
  blockedCredentialLeakShadowFixture,
  blockedDbTransactionShadowFixture,
  blockedExpressMountShadowFixture,
  blockedExternalNetworkShadowFixture,
  blockedHttpListenerShadowFixture,
  blockedLedgerMutationShadowFixture,
  blockedLiveOroPlayCallShadowFixture,
  blockedMissingIdempotencyShadowFixture,
  blockedMissingSanitizedTraceShadowFixture,
  blockedPrismaWriteShadowFixture,
  blockedPublicAliasShadowFixture,
  blockedRuntimeTrafficShadowFixture,
  blockedSideEffectShadowFixture,
  blockedSrcAppChangeShadowFixture,
  blockedWalletMutationShadowFixture,
  cleanInternalShadowHarnessFixture,
  cloneFixture,
  rollbackMissingShadowFixture,
  transactionBetShadowInvocationFixture,
  transactionWinShadowInvocationFixture,
  buildOroPlayCallbackStagingRouteInternalShadowHarnessFixtures,
} = require("../game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarnessFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const SHADOW_DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md";
const SHADOW_HELPER = "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarness.js";
const SHADOW_FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteInternalShadowHarnessFixtures.js";
const SHADOW_SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteInternalShadowHarnessSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [SHADOW_DOC, SHADOW_HELPER, SHADOW_FIXTURES, SHADOW_SMOKE];
const NEW_MOCK_FILES = [SHADOW_HELPER, SHADOW_FIXTURES];

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
  return [
    "READY_TO_MOUNT",
    "PUBLIC_ALIAS_READY",
    "ROUTE_ACTIVE",
    "LIVE_TRAFFIC_READY",
    "RUNTIME_TRAFFIC_READY",
    "MUTATION_READY",
  ];
}

function assertNoForbiddenRuntimeStatus(value) {
  const serialized = JSON.stringify(value);
  for (const forbidden of forbiddenRuntimeStatuses()) {
    assert(!serialized.includes(forbidden), `ORO-4I output must not include ${forbidden}.`);
  }
}

function assertReportNeverRuntimeReady(report) {
  assert.strictEqual(report.expressMountAllowed, false, "Express mount must not be allowed.");
  assert.strictEqual(report.publicAliasAllowed, false, "Public alias must not be allowed.");
  assert.strictEqual(report.runtimeTrafficAllowed, false, "Runtime traffic must not be allowed.");
  assert.strictEqual(report.externalNetworkAllowed, false, "External network must not be allowed.");
  assert.strictEqual(report.sideEffectsAllowed, false, "Side effects must not be allowed.");
  assert.strictEqual(report.routeActive, false, "Route must not be active.");
  assert.strictEqual(report.liveRouteActive, false, "Live route must not be active.");
  assert.strictEqual(report.httpListener, false, "HTTP listener must not be active.");
  for (const route of report.routeCandidates) {
    assert.strictEqual(route.active, false, `${route.path} must not be active.`);
    assert.strictEqual(route.mounted, false, `${route.path} must not be mounted.`);
    assert.strictEqual(route.public, false, `${route.path} must not be public.`);
    assert.strictEqual(route.staticRouteDescriptorOnly, true, `${route.path} must be descriptor only.`);
    assert.strictEqual(route.internalShadowInvocationOnly, true, `${route.path} must be internal shadow only.`);
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
  const doc = readRequired(SHADOW_DOC);
  assertIncludes("ORO-4I internal shadow doc", doc, [
    "ORO-4I Staging Route Wiring Internal Shadow Harness / Still No Express Mount",
    "INTERNAL SHADOW ONLY",
    "NO EXPRESS MOUNT",
    "NO PUBLIC ALIAS",
    "NO RUNTIME TRAFFIC",
    "NO RUNTIME MUTATION",
    "NO EXTERNAL NETWORK",
    "internal shadow only",
    "direct-call mock invocation",
    "static route descriptor",
    "sanitized shadow trace",
    "no Express mount",
    "no public alias",
    "no runtime traffic",
    "no external network",
    "no side effect",
    "POST /api/oroplay/balance",
    "POST /api/oroplay/transaction",
    "POST /api/balance",
    "POST /api/transaction",
    "internal shadow auth boundary",
    "request envelope mapper",
    "response envelope mapper",
    "side-effect assertion",
    "INTERNAL_SHADOW_PASS",
    "MOUNT_BLOCKED_BY_PHASE",
    "PUBLIC_ALIAS_BLOCKED_BY_PHASE",
    "NO_RUNTIME_TRAFFIC",
    "NO_SIDE_EFFECT",
    "ORO-4J",
    "Internal Shadow Result Contract Review",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-route-internal-shadow-harness"],
    "node src/local-smoke-tests/oroplayCallbackStagingRouteInternalShadowHarnessSmoke.js",
    "package.json missing ORO-4I smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4I registration", runner, [
    "oroplayCallbackStagingRouteInternalShadowHarness.js",
    "oroplayCallbackStagingRouteInternalShadowHarnessFixtures.js",
    "oroplayCallbackStagingRouteInternalShadowHarnessSmoke.js",
    "smoke:oroplay-callback-staging-route-internal-shadow-harness",
    "oroplayCallbackStagingRouteInternalShadowHarness",
    "docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md",
  ]);

  assertIncludes("ORO-4I API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4I callback staging route internal shadow harness",
    "route candidates remain inactive",
    "public aliases remain blocked",
    "no Express mount",
    "no runtime traffic",
    "no external network",
    "no side effect",
  ]);
  assertIncludes("ORO-4I integration plan docs", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-4I Current",
    "internal shadow harness",
    "static route descriptor",
    "direct-call shadow invocation",
    "sanitized trace",
    "no runtime mutation",
  ]);
  assertIncludes("ORO-4I roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4I current/staging route wiring internal shadow harness",
    "ORO-4I CLOSED target criteria",
    "ORO-4J Internal Shadow Result Contract Review / Still No Express Mount",
  ]);
  assertIncludes("ORO-4I coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4I OroPlay Callback Staging Route Internal Shadow Harness Coverage",
    "smoke:oroplay-callback-staging-route-internal-shadow-harness",
    "no mount-ready/public-ready/runtime-ready status",
  ]);
}

function assertCleanInternalShadowHarness() {
  const report = evaluateOroPlayCallbackStagingRouteInternalShadowHarness(cleanInternalShadowHarnessFixture);
  assert.strictEqual(report.phase, "ORO-4I");
  assert.strictEqual(report.name, "Staging Route Wiring Internal Shadow Harness");
  assert.strictEqual(report.harnessMode, HARNESS_MODE);
  assert.strictEqual(report.shadowStatus, INTERNAL_SHADOW_PASS);
  assert.strictEqual(report.ok, true);
  assert.strictEqual(report.shadowInvocations.length, 3, "clean fixture must include balance, bet, and win shadows.");
  assertReportNeverRuntimeReady(report);

  const summary = summarizeOroPlayCallbackInternalShadowHarness(report);
  assert.strictEqual(summary.shadowStatus, INTERNAL_SHADOW_PASS);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.sideEffectsAllowed, false);
  assert.strictEqual(summary.blockedGateCount, 0);
  assertNoForbiddenRuntimeStatus(summary);
}

function assertInvocationNeverRuntimeReady(invocation) {
  assert.strictEqual(invocation.invocationMode, "direct-call mock invocation");
  assert.strictEqual(invocation.expressMounted, false);
  assert.strictEqual(invocation.routeActive, false);
  assert.strictEqual(invocation.httpListener, false);
  assert.strictEqual(invocation.runtimeTraffic, false);
  assert.strictEqual(invocation.externalNetwork, false);
  assert.strictEqual(invocation.sideEffectAssertion.sideEffects, "NONE");
  assert.strictEqual(invocation.sideEffectAssertion.walletMutation, false);
  assert.strictEqual(invocation.sideEffectAssertion.ledgerMutation, false);
  assert.strictEqual(invocation.sideEffectAssertion.prismaWrite, false);
  assert.strictEqual(invocation.sideEffectAssertion.dbTransaction, false);
  assertNoForbiddenRuntimeStatus(invocation);
}

function assertBalanceShadowInvocation() {
  const invocation = runOroPlayCallbackInternalShadowInvocation(balanceShadowInvocationFixture.requestEnvelope);
  assert.strictEqual(invocation.phase, "ORO-4I");
  assert.strictEqual(invocation.harnessMode, HARNESS_MODE);
  assert.strictEqual(invocation.requestEnvelope.method, "POST");
  assert.strictEqual(invocation.requestEnvelope.path, "/api/oroplay/balance");
  assert.strictEqual(invocation.requestEnvelope.routeCandidate.candidateOnly, true);
  assert.strictEqual(invocation.responseEnvelope.envelopeShape, "sanitized-balance-response-envelope");
  assert.strictEqual(invocation.responseEnvelope.sideEffects, "NONE");
  assert.strictEqual(invocation.sanitizedShadowTrace.authPreview, "redacted-auth-preview");
  assertInvocationNeverRuntimeReady(invocation);
}

function assertTransactionShadowInvocation() {
  const bet = runOroPlayCallbackInternalShadowInvocation(transactionBetShadowInvocationFixture.requestEnvelope);
  const win = runOroPlayCallbackInternalShadowInvocation(transactionWinShadowInvocationFixture.requestEnvelope);

  for (const invocation of [bet, win]) {
    assert.strictEqual(invocation.requestEnvelope.method, "POST");
    assert.strictEqual(invocation.requestEnvelope.path, "/api/oroplay/transaction");
    assert.strictEqual(invocation.responseEnvelope.envelopeShape, "sanitized-transaction-response-envelope");
    assert.strictEqual(invocation.responseEnvelope.idempotency, "DOCUMENTED");
    assert.strictEqual(invocation.responseEnvelope.duplicateBehavior, "FAIL_CLOSED_DOCUMENTED");
    assert.strictEqual(invocation.responseEnvelope.sideEffects, "NONE");
    assertInvocationNeverRuntimeReady(invocation);
  }

  const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(cleanInternalShadowHarnessFixture);
  assert.strictEqual(gateByName(report, "transactionIdempotencyDocumented").passed, true);
  assert.strictEqual(gateByName(report, "duplicateTransactionFailClosedDocumented").passed, true);
  assert.strictEqual(gateByName(report, "insufficientBalanceFailClosedDocumented").passed, true);
}

function assertBlockedAliases() {
  const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(blockedPublicAliasShadowFixture);
  assert.strictEqual(report.shadowStatus, BLOCKED);
  assertGateBlocked(report, "noPublicAlias");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/balance"), "/api/balance must be blocked.");
  assert(report.blockedAliases.some((entry) => entry.path === "/api/transaction"), "/api/transaction must be blocked.");
  const gate = gateByName(report, "noPublicAlias");
  assert(gate.evidence.proposedBlockedAliases.includes("/api/balance"));
  assert(gate.evidence.proposedBlockedAliases.includes("/api/transaction"));
  assertReportNeverRuntimeReady(report);
}

function assertMountAndRouteBlockers() {
  const cases = [
    [blockedExpressMountShadowFixture, "noExpressMount"],
    [blockedActiveRouteShadowFixture, "noActiveRoute"],
    [blockedHttpListenerShadowFixture, "noHttpListener"],
    [blockedSrcAppChangeShadowFixture, "noSrcAppChangeRequired"],
    [blockedRuntimeTrafficShadowFixture, "noRuntimeTraffic"],
  ];

  for (const [fixture, gateName] of cases) {
    const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixture);
    assert.strictEqual(report.shadowStatus, BLOCKED);
    assertGateBlocked(report, gateName);
    assertReportNeverRuntimeReady(report);
  }
}

function assertMutationBlockers() {
  const cases = [
    [blockedWalletMutationShadowFixture, "noRuntimeWalletMutation"],
    [blockedLedgerMutationShadowFixture, "noRuntimeLedgerMutation"],
    [blockedPrismaWriteShadowFixture, "noPrismaWrite"],
    [blockedDbTransactionShadowFixture, "noDbTransaction"],
    [blockedSideEffectShadowFixture, "noSideEffect"],
  ];

  for (const [fixture, gateName] of cases) {
    const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixture);
    assert.strictEqual(report.shadowStatus, BLOCKED);
    assertGateBlocked(report, gateName);
    assertReportNeverRuntimeReady(report);
  }
}

function assertExternalAndLiveBlockers() {
  const cases = [
    [blockedExternalNetworkShadowFixture, "noExternalNetwork"],
    [blockedLiveOroPlayCallShadowFixture, "noLiveOroPlayCall"],
  ];

  for (const [fixture, gateName] of cases) {
    const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixture);
    assert.strictEqual(report.shadowStatus, BLOCKED);
    assertGateBlocked(report, gateName);
    assertReportNeverRuntimeReady(report);
  }
}

function assertRequestResponseAndIdempotency() {
  const missingRequest = cloneFixture(cleanInternalShadowHarnessFixture);
  missingRequest.id = "missingRequestEnvelopeFixture";
  missingRequest.documentation.requestEnvelopeDocumented = false;
  const requestReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(missingRequest);
  assert.strictEqual(requestReport.shadowStatus, BLOCKED);
  assertGateBlocked(requestReport, "requestEnvelopeDocumented");
  assertReportNeverRuntimeReady(requestReport);

  const missingResponse = cloneFixture(cleanInternalShadowHarnessFixture);
  missingResponse.id = "missingResponseEnvelopeFixture";
  missingResponse.documentation.responseEnvelopeDocumented = false;
  const responseReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(missingResponse);
  assert.strictEqual(responseReport.shadowStatus, BLOCKED);
  assertGateBlocked(responseReport, "responseEnvelopeDocumented");
  assertReportNeverRuntimeReady(responseReport);

  const idempotencyReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(
    blockedMissingIdempotencyShadowFixture
  );
  assert.strictEqual(idempotencyReport.shadowStatus, BLOCKED);
  assertGateBlocked(idempotencyReport, "transactionIdempotencyDocumented");
  assertReportNeverRuntimeReady(idempotencyReport);

  const traceReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(
    blockedMissingSanitizedTraceShadowFixture
  );
  assert.strictEqual(traceReport.shadowStatus, BLOCKED);
  assertGateBlocked(traceReport, "sanitizedShadowTraceDocumented");
  assertReportNeverRuntimeReady(traceReport);
}

function assertRollbackChecklist() {
  const cleanReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(cleanInternalShadowHarnessFixture);
  assert.strictEqual(cleanReport.rollback.status, "PASS");
  for (const requirement of ROLLBACK_REQUIREMENTS) {
    const item = cleanReport.rollback.requirements.find((entry) => entry.key === requirement.key);
    assert(item, `missing rollback requirement ${requirement.key}.`);
    assert.strictEqual(item.status, "PASS", `${requirement.key} must pass.`);
  }

  const missingReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(rollbackMissingShadowFixture);
  assert.strictEqual(missingReport.shadowStatus, BLOCKED);
  assertGateBlocked(missingReport, "rollbackDocumented");
  assertReportNeverRuntimeReady(missingReport);
}

function assertSanitizerAndSecretBoundary() {
  const leakReport = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(blockedCredentialLeakShadowFixture);
  assert.strictEqual(leakReport.shadowStatus, BLOCKED);
  assertGateBlocked(leakReport, "noCredentialLeak");
  const serializedLeakReport = JSON.stringify(leakReport);
  assert(!serializedLeakReport.includes("neutral-shadow-auth-marker"), "report must not echo raw marker values.");
  assert(!serializedLeakReport.includes("internal-shadow-credential-marker"), "report must not echo raw marker values.");
  assert(!serializedLeakReport.includes("mock-callback-credential-marker"), "report must not echo raw marker values.");
  assertNoSecretShapedText("ORO-4I leak report", serializedLeakReport);

  const cleanSerialized = JSON.stringify(buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(cleanInternalShadowHarnessFixture));
  assert(!cleanSerialized.includes("neutral-shadow-auth-marker"), "clean report must not echo raw marker values.");
  assert(!cleanSerialized.includes("internal-shadow-credential-marker"), "clean report must not echo raw marker values.");
  assertNoSecretShapedText("ORO-4I clean report", cleanSerialized);

  const sourceText = NEW_FILES.map((file) => readRequired(file)).join("\n");
  assertNoSecretShapedText("ORO-4I changed files", sourceText);
  assertNoForbiddenRuntimeMarkers();
}

function assertInvariantAcrossFixtures() {
  const fixtures = buildOroPlayCallbackStagingRouteInternalShadowHarnessFixtures();
  assert(fixtures.length >= 18, "fixture set must include required ORO-4I cases.");
  for (const fixture of fixtures) {
    const report = buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixture);
    assertReportNeverRuntimeReady(report);
  }
  assert.strictEqual(BLOCKED_ALIASES.length, 2, "blocked alias set must include balance and transaction aliases.");
}

function assertNoRuntimeRouteWiring() {
  const app = readRequired("src/app.js");
  assert(!app.includes("oroplayCallbackStagingRouteInternalShadowHarness"), "src/app.js must not import ORO-4I harness.");
  assert(!app.includes('app.use("/api/balance"'), "src/app.js must not mount /api/balance.");
  assert(!app.includes('app.use("/api/transaction"'), "src/app.js must not mount /api/transaction.");
}

function main() {
  assertDocsAndRegistration();
  assertCleanInternalShadowHarness();
  assertBalanceShadowInvocation();
  assertTransactionShadowInvocation();
  assertBlockedAliases();
  assertMountAndRouteBlockers();
  assertMutationBlockers();
  assertExternalAndLiveBlockers();
  assertRequestResponseAndIdempotency();
  assertRollbackChecklist();
  assertSanitizerAndSecretBoundary();
  assertInvariantAcrossFixtures();
  assertNoRuntimeRouteWiring();
  console.log("ORO-4I OroPlay callback staging route internal shadow harness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4I OroPlay callback staging route internal shadow harness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
