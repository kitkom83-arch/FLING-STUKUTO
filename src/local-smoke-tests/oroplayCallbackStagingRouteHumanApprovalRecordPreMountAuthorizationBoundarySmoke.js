"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  AUTHORIZATION_RECORD_INCOMPLETE,
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PENDING_MANUAL_AUTHORIZATION,
  buildHumanApprovalRecordPreMountAuthorizationBoundary,
  runHumanApprovalRecordPreMountAuthorizationBoundary,
  sanitizeHumanApprovalRecordTrace,
} = require("../game-provider-mock/oroplayCallbackStagingRouteHumanApprovalRecordPreMountAuthorizationBoundary");
const {
  accidentalExpressMountFixture,
  buildHumanApprovalRecordPreMountAuthorizationBoundaryFixtures,
  externalNetworkFixture,
  happyPathAuthorizationBoundaryFixture,
  missingHumanApprovalRecordTemplateFixture,
  missingOro4kEvidencePackFixture,
  prismaWriteFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  secretLikeTraceFixture,
  signedApprovalAttemptedFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteHumanApprovalRecordPreMountAuthorizationBoundaryFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS =
  "src/game-provider-mock/oroplayCallbackStagingRouteHumanApprovalRecordPreMountAuthorizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oroplayCallbackStagingRouteHumanApprovalRecordPreMountAuthorizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oroplayCallbackStagingRouteHumanApprovalRecordPreMountAuthorizationBoundarySmoke.js";
const DOC =
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_APPROVAL_RECORD_PRE_MOUNT_AUTHORIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4lSmoke.js";
const SCRIPT = "smoke:oro-4l";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildHumanApprovalRecordPreMountAuthorizationBoundary(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "report must not include undefined.");
  assert(!serialized.includes("NaN"), "report must not include NaN.");
}

function assertNoForbiddenPreMountAuthorization(report) {
  for (const forbidden of [
    "approved",
    "mount_approved",
    "ready_for_live_traffic",
    "production_ready",
    "live_ready",
    "auto_approved",
    "route_mount_authorized",
  ]) {
    assert.notStrictEqual(report.preMountAuthorization, forbidden, `preMountAuthorization must not be ${forbidden}.`);
  }
}

function assertFailed(report, expectedAuthorization, blocker) {
  assert.strictEqual(report.authorizationBoundaryResult, "FAIL");
  assert.strictEqual(report.preMountAuthorization, expectedAuthorization);
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(report.humanAuthorizationRequired, true);
  assert.strictEqual(report.nextPhaseRequiresSeparateAuthorization, true);
  assertNoForbiddenPreMountAuthorization(report);
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
    /mock-approval-placeholder-value/i,
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
    /\bsigned\s*approval\b/i,
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
    "ORO-4L",
    "Human Approval Record / Pre-Mount Authorization Boundary",
    "Still No Express Mount",
    "Still No Public Alias",
    "Still No Runtime Wallet/Ledger Mutation",
    "Still No Actual Mount Authorization",
    "Still Separate Human Authorization Required",
    "pending_manual_authorization",
    "signedHumanApprovalRecordPresent",
    "I understand this phase does not mount any Express route.",
    "ORO-4L does not authorize `src/app.js` changes.",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const mountDecisionDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md");
  assert(
    mountDecisionDoc.includes("ORO-4L Human Approval Record / Pre-Mount Authorization Boundary"),
    "ORO-4J doc must cross-reference ORO-4L."
  );

  const evidencePackDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md");
  assert(
    evidencePackDoc.includes("Followed by ORO-4L Human Approval Record / Pre-Mount Authorization Boundary"),
    "ORO-4K doc must mention the ORO-4L follow-up boundary."
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      ["ORO-4L callback staging route human approval record", "no actual mount authorization"],
    ],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["ORO-4L Current", "pending_manual_authorization"]],
    ["docs/PHASE_ROADMAP.md", ["ORO-4L current/human approval record", "separate explicit authorization"]],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-4L OroPlay Callback Staging Route Human Approval Record Pre-Mount Authorization Boundary Coverage", SCRIPT],
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

  const happy = reportFor(happyPathAuthorizationBoundaryFixture);
  assert.strictEqual(happy.phase, "ORO-4L");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.authorizationBoundaryResult, PASS);
  assert.strictEqual(happy.humanApprovalRecordTemplatePresent, true);
  assert.strictEqual(happy.signedHumanApprovalRecordPresent, false);
  assert.strictEqual(happy.preMountAuthorization, PENDING_MANUAL_AUTHORIZATION);
  assert.strictEqual(happy.humanAuthorizationRequired, true);
  assert.strictEqual(happy.nextPhaseRequiresSeparateAuthorization, true);
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
  assertNoForbiddenPreMountAuthorization(happy);
  assertNoUndefinedOrNan(happy);

  assertFailed(reportFor(missingOro4kEvidencePackFixture), AUTHORIZATION_RECORD_INCOMPLETE, "missing ORO-4K evidence pack");
  assertFailed(
    reportFor(missingHumanApprovalRecordTemplateFixture),
    AUTHORIZATION_RECORD_INCOMPLETE,
    "missing approval record template"
  );
  assertFailed(
    reportFor(signedApprovalAttemptedFixture),
    NOT_AUTHORIZED_FOR_MOUNT,
    "signed approval not accepted in ORO-4L static boundary"
  );
  assertFailed(reportFor(accidentalExpressMountFixture), NOT_AUTHORIZED_FOR_MOUNT, "express mount present");
  assertFailed(reportFor(publicAliasFixture), NOT_AUTHORIZED_FOR_MOUNT, "public alias present");

  const mutation = reportFor(runtimeMutationFixture);
  assertFailed(mutation, NOT_AUTHORIZED_FOR_MOUNT, "walletMutation present");
  assert(mutation.blockers.includes("ledgerMutation present"), "runtime mutation fixture must flag ledgerMutation.");

  assertFailed(reportFor(externalNetworkFixture), NOT_AUTHORIZED_FOR_MOUNT, "externalNetwork present");
  assertFailed(reportFor(prismaWriteFixture), NOT_AUTHORIZED_FOR_MOUNT, "prismaWrite present");

  const secretReport = reportFor(secretLikeTraceFixture);
  assert.strictEqual(secretReport.authorizationBoundaryResult, PASS);
  assert.strictEqual(secretReport.preMountAuthorization, PENDING_MANUAL_AUTHORIZATION);
  assertSanitizedTraceHasNoSensitiveOutput(secretReport.sanitizedTrace);
  assertSanitizedTraceHasNoSensitiveOutput(sanitizeHumanApprovalRecordTrace(secretLikeTraceFixture.trace));

  const allReports = runHumanApprovalRecordPreMountAuthorizationBoundary(
    buildHumanApprovalRecordPreMountAuthorizationBoundaryFixtures()
  );
  assert(allReports.length >= 10, "fixture set must include required ORO-4L cases.");
  for (const report of allReports) {
    assertNoForbiddenPreMountAuthorization(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log("ORO-4L OroPlay callback staging route human approval record pre-mount authorization boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4L OroPlay callback staging route human approval record pre-mount authorization boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
