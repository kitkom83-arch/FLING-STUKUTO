"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  EVIDENCE_INCOMPLETE,
  GATE,
  NOT_APPROVED_FOR_MOUNT,
  PASS,
  PENDING_HUMAN_APPROVAL,
  buildHumanMountReviewEvidencePack,
  runHumanMountReviewEvidencePack,
  sanitizeHumanMountReviewEvidence,
} = require("../game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePack");
const {
  accidentalExpressMountFixture,
  autoApprovalAttemptedFixture,
  buildHumanMountReviewEvidencePackFixtures,
  externalNetworkFixture,
  happyPathEvidencePackFixture,
  missingInternalShadowHarnessEvidenceFixture,
  missingMountDecisionGateEvidenceFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  secretLikeTraceFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePackFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS = "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePack.js";
const FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteHumanMountReviewEvidencePackFixtures.js";
const SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteHumanMountReviewEvidencePackSmoke.js";
const DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md";
const SCRIPT = "smoke:oroplay-callback-staging-route-human-mount-review-evidence-pack";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildHumanMountReviewEvidencePack(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "report must not include undefined.");
  assert(!serialized.includes("NaN"), "report must not include NaN.");
}

function assertNoForbiddenMountApproval(report) {
  for (const forbidden of ["approved", "mount_approved", "ready_for_live_traffic", "production_ready"]) {
    assert.notStrictEqual(report.mountApproval, forbidden, `mountApproval must not be ${forbidden}.`);
  }
}

function assertFailed(report, expectedApproval, blocker) {
  assert.strictEqual(report.evidencePackResult, "FAIL");
  assert.strictEqual(report.mountApproval, expectedApproval);
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(report.humanApprovalRequired, true);
  assertNoForbiddenMountApproval(report);
  assertNoUndefinedOrNan(report);
}

function assertSanitizedTraceHasNoSensitiveOutput(value) {
  const serialized = JSON.stringify(value);
  const forbidden = [
    /mock-auth-header-value/i,
    /mock-token-value/i,
    /mock-client-credential-value/i,
    /mock-password-value/i,
    /mock-database-url-value/i,
    /mock-private-key-value/i,
    /mock-api-key-value/i,
    /mock-cookie-value/i,
    /mock-signature-value/i,
    /\bauthorization\b/i,
    /\bbearer\b/i,
    /\bbasic\b/i,
    /\btoken\b/i,
    /\bsecret\b/i,
    /\bclientSecret\b/i,
    /\bpassword\b/i,
    /\bDATABASE_URL\b/i,
    /\bprivate\s*key\b/i,
    /\bapi\s*key\b/i,
    /\bcookie\b/i,
    /\bsignature\b/i,
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];
  for (const pattern of forbidden) {
    assert(!pattern.test(serialized), "sanitized trace leaked sensitive output.");
  }
}

function assertSourceSafety() {
  const harness = readRequired(HARNESS);
  const forbiddenHarnessPatterns = [
    /require\(["']express["']\)/i,
    /from\s+["']express["']/i,
    /\bfetch\s*\(/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
    /from\s+["']http["']/i,
    /from\s+["']https["']/i,
    /\baxios\b/i,
    /@prisma\/client/i,
    /\bPrismaClient\b/i,
    /\bcreateServer\s*\(/i,
    /\blisten\s*\(/i,
    /\bapp\.(?:use|post|get|put|patch|delete)\s*\(/i,
  ];
  for (const pattern of forbiddenHarnessPatterns) {
    assert(!pattern.test(harness), `${HARNESS} contains forbidden runtime marker ${pattern}.`);
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
    "ORO-4K",
    "Human Mount Review Evidence Pack / Mount Approval Boundary",
    "Still No Express Mount",
    "Still No Public Alias",
    "Still No Runtime Wallet/Ledger Mutation",
    "Still Human Approval Required",
    "pending_human_approval",
    "not_approved_for_mount",
    "I understand this evidence pack does not mount any route.",
    "any future Express mount requires a separate phase and separate approval",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const mountDecisionDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md");
  assert(
    mountDecisionDoc.includes("Reviewed by ORO-4K Human Mount Review Evidence Pack"),
    "ORO-4J doc must cross-reference ORO-4K."
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [HARNESS, FIXTURES, SMOKE, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["ORO-4K callback staging route human mount review evidence pack", "no Express mount"]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["ORO-4K Current", "pending_human_approval"]],
    ["docs/PHASE_ROADMAP.md", ["ORO-4K current/human mount review evidence pack", "separate approval"]],
    ["docs/SMOKE_COVERAGE.md", ["ORO-4K OroPlay Callback Staging Route Human Mount Review Evidence Pack Coverage", SCRIPT]],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_DRY_RUN_GATE.md",
      ["ORO-4K cross-reference", "human mount review evidence pack"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md",
      ["Evidence source for ORO-4K", "human mount review evidence pack"],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function main() {
  assertDocsAndRegistration();

  const happy = reportFor(happyPathEvidencePackFixture);
  assert.strictEqual(happy.phase, "ORO-4K");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.evidencePackResult, PASS);
  assert.strictEqual(happy.mountApproval, PENDING_HUMAN_APPROVAL);
  assert.strictEqual(happy.humanApprovalRequired, true);
  assert.deepStrictEqual(happy.blockers, []);
  assert.strictEqual(happy.expressMount, "absent");
  assert.strictEqual(happy.publicAlias, "absent");
  assert.strictEqual(happy.activeRoute, "absent");
  assert.strictEqual(happy.runtimeTraffic, "absent");
  assert.strictEqual(happy.walletMutation, "absent");
  assert.strictEqual(happy.ledgerMutation, "absent");
  assert.strictEqual(happy.prismaWrite, "absent");
  assert.strictEqual(happy.externalNetwork, "absent");
  assert.strictEqual(happy.liveOroPlayApiCall, "absent");
  assert.strictEqual(happy.realMoney, "absent");
  assertNoForbiddenMountApproval(happy);
  assertNoUndefinedOrNan(happy);

  assertFailed(reportFor(missingInternalShadowHarnessEvidenceFixture), EVIDENCE_INCOMPLETE, "missing internal shadow harness");
  assertFailed(reportFor(missingMountDecisionGateEvidenceFixture), EVIDENCE_INCOMPLETE, "missing mount decision gate");
  assertFailed(reportFor(accidentalExpressMountFixture), NOT_APPROVED_FOR_MOUNT, "express mount present");
  assertFailed(reportFor(publicAliasFixture), NOT_APPROVED_FOR_MOUNT, "public alias present");

  const mutation = reportFor(runtimeMutationFixture);
  assertFailed(mutation, NOT_APPROVED_FOR_MOUNT, "walletMutation present");
  assert(mutation.blockers.includes("ledgerMutation present"), "runtime mutation fixture must flag ledgerMutation.");

  assertFailed(reportFor(externalNetworkFixture), NOT_APPROVED_FOR_MOUNT, "externalNetwork present");
  assertFailed(reportFor(autoApprovalAttemptedFixture), NOT_APPROVED_FOR_MOUNT, "auto approval forbidden");

  const secretReport = reportFor(secretLikeTraceFixture);
  assert.strictEqual(secretReport.evidencePackResult, PASS);
  assert.strictEqual(secretReport.mountApproval, PENDING_HUMAN_APPROVAL);
  assertSanitizedTraceHasNoSensitiveOutput(secretReport.sanitizedTrace);
  assertSanitizedTraceHasNoSensitiveOutput(sanitizeHumanMountReviewEvidence(secretLikeTraceFixture.trace));

  const allReports = runHumanMountReviewEvidencePack(buildHumanMountReviewEvidencePackFixtures());
  assert(allReports.length >= 9, "fixture set must include required ORO-4K cases.");
  for (const report of allReports) {
    assertNoForbiddenMountApproval(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log("ORO-4K OroPlay callback staging route human mount review evidence pack smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4K OroPlay callback staging route human mount review evidence pack smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
