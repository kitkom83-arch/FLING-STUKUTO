"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  BLOCKED_DECISION,
  GATE,
  MANUAL_REVIEW_REQUIRED,
  PASS,
  buildMountDecisionReadinessGateReport,
  runMountDecisionReadinessGate,
  sanitizeMountDecisionTrace,
} = require("../game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGate");
const {
  accidentalExpressMountFixture,
  buildMountDecisionReadinessGateFixtures,
  happyPathFixture,
  missingShadowHarnessFixture,
  mutationFixture,
  publicAliasFixture,
  secretLikeTraceFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGateFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS = "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGate.js";
const FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteMountDecisionReadinessGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteMountDecisionReadinessGateSmoke.js";
const DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildMountDecisionReadinessGateReport(fixture);
}

function gateByName(report, name) {
  const gate = report.checks.find((entry) => entry.name === name);
  assert(gate, `missing check ${name}.`);
  return gate;
}

function assertBlocked(report, name) {
  assert.strictEqual(report.result, "FAIL", `${name} fixture must fail.`);
  assert.strictEqual(report.mountDecision, BLOCKED_DECISION, `${name} must block mount decision.`);
  assert.strictEqual(gateByName(report, name).passed, false, `${name} must be flagged.`);
}

function assertNoApprovedDecision(report) {
  const serialized = JSON.stringify(report).toLowerCase();
  assert.notStrictEqual(report.mountDecision, "approved");
  assert.notStrictEqual(report.mountDecision, "ready_to_mount");
  assert(!serialized.includes("mount approved"), "report must not say mount approved.");
  assert(!serialized.includes("ready for live traffic"), "report must not say ready for live traffic.");
  assert.strictEqual(report.approvedForMount, false, "approvedForMount must remain false.");
  assert.strictEqual(report.approvedForLiveTraffic, false, "approvedForLiveTraffic must remain false.");
  assert.strictEqual(report.approvedForPublicAlias, false, "approvedForPublicAlias must remain false.");
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "report must not include undefined.");
  assert(!serialized.includes("NaN"), "report must not include NaN.");
}

function secretLeakPatterns() {
  return [
    /mock-token-value/i,
    /mock-auth-header-value/i,
    /mock-client-credential-value/i,
    /mock-password-value/i,
    /mock-database-url-value/i,
    /mock-private-key-value/i,
    /mock-api-key-value/i,
    /mock-cookie-value/i,
    /\bBearer\s+\S+/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    /DATABASE_URL\s*[:=]/i,
  ];
}

function assertNoSecretLeak(label, value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  for (const pattern of secretLeakPatterns()) {
    assert(!pattern.test(serialized), `${label} leaked secret-like content.`);
  }
}

function assertSourceSafety() {
  const harness = readRequired(HARNESS);
  const forbidden = [
    /\bexpress\b/i,
    /\bfetch\s*\(/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
    /\baxios\b/i,
    /@prisma\/client/i,
    /\bPrismaClient\b/i,
    /\bcreateServer\s*\(/i,
    /\blisten\s*\(/i,
    /\bapp\.(?:use|post|get|put|patch|delete)\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
  ];

  for (const pattern of forbidden) {
    assert(!pattern.test(harness), `${HARNESS} contains forbidden marker ${pattern}.`);
  }

  const app = readRequired("src/app.js");
  const forbiddenMounts = [
    'app.use("/api/oroplay/balance"',
    'app.post("/api/oroplay/balance"',
    'app.use("/api/oroplay/transaction"',
    'app.post("/api/oroplay/transaction"',
    'app.use("/api/balance"',
    'app.post("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/transaction"',
  ];
  for (const marker of forbiddenMounts) {
    assert(!app.includes(marker), `src/app.js must not mount ${marker}.`);
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "ORO-4J",
    "Internal Shadow Harness Review / Mount Decision Readiness Gate",
    "Still No Express Mount",
    "Still No Public Alias",
    "Still No Runtime Wallet/Ledger Mutation",
    "manual_review_required",
    "not_approved_for_mount",
    "Human approval required",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-route-mount-decision-readiness-gate"],
    "node src/local-smoke-tests/oroplayCallbackStagingRouteMountDecisionReadinessGateSmoke.js"
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [HARNESS, FIXTURES, SMOKE, "smoke:oroplay-callback-staging-route-mount-decision-readiness-gate"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
}

function main() {
  assertDocsAndRegistration();

  const happy = reportFor(happyPathFixture);
  assert.strictEqual(happy.phase, "ORO-4J");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.result, PASS);
  assert.strictEqual(happy.mountDecision, MANUAL_REVIEW_REQUIRED);
  assert.strictEqual(happy.expressMount, "absent");
  assert.strictEqual(happy.publicAlias, "absent");
  assert.strictEqual(happy.runtimeTraffic, "absent");
  assert.strictEqual(happy.walletMutation, "absent");
  assert.strictEqual(happy.ledgerMutation, "absent");
  assert.strictEqual(happy.prismaWrite, "absent");
  assert.strictEqual(happy.externalNetwork, "absent");
  assertNoApprovedDecision(happy);
  assertNoUndefinedOrNan(happy);

  assertBlocked(reportFor(missingShadowHarnessFixture), "internalShadowHarnessExists");
  assertBlocked(reportFor(accidentalExpressMountFixture), "expressMountAbsent");
  assertBlocked(reportFor(publicAliasFixture), "publicAliasAbsent");
  const mutation = reportFor(mutationFixture);
  assertBlocked(mutation, "walletMutationAbsent");
  assert.strictEqual(gateByName(mutation, "ledgerMutationAbsent").passed, false, "ledger mutation must be flagged.");

  const secretReport = reportFor(secretLikeTraceFixture);
  assert.strictEqual(secretReport.result, PASS);
  assert.strictEqual(secretReport.mountDecision, MANUAL_REVIEW_REQUIRED);
  assertNoSecretLeak("secret-like sanitized report", secretReport);
  assertNoSecretLeak("direct sanitizer output", sanitizeMountDecisionTrace(secretLikeTraceFixture.trace));

  const allReports = runMountDecisionReadinessGate(buildMountDecisionReadinessGateFixtures());
  assert(allReports.length >= 6, "fixture set must include required ORO-4J cases.");
  for (const report of allReports) {
    assertNoApprovedDecision(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log("ORO-4J OroPlay callback staging route mount decision readiness gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4J OroPlay callback staging route mount decision readiness gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
