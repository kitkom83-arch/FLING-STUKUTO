"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  CANDIDATE_RECORD_RECEIVED_FOR_REVIEW,
  GATE,
  INTAKE_CONTRACT_MISSING,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PENDING_SIGNED_APPROVAL_RECORD,
  VERIFICATION_PACK_PASSED_PENDING_HUMAN_RECORD,
  buildSignedApprovalIntakeGateReport,
  runSignedApprovalIntakeGate,
  sanitizeSignedApprovalIntakeTrace,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGate");
const {
  accidentalExpressMountFixture,
  actualSignedApprovalAttemptedFixture,
  buildSignedApprovalIntakeGateFixtures,
  chatApprovalPhraseFixture,
  externalNetworkFixture,
  forbiddenAuthorizationStateFixture,
  happyPathSignedApprovalIntakeGateFixture,
  missingOro4lAuthorizationBoundaryFixture,
  missingSignedApprovalIntakeContractFixture,
  mockSignedApprovalCandidateFixture,
  prismaWriteFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  secretLikeTraceFixture,
  vagueApprovalPhraseFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGateFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS = "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGate.js";
const FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalIntakeGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalIntakeGateSmoke.js";
const DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_INTAKE_GATE.md";
const SCRIPT = "smoke:oroplay-callback-staging-route-signed-approval-intake-gate";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildSignedApprovalIntakeGateReport(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "report must not include undefined.");
  assert(!serialized.includes("NaN"), "report must not include NaN.");
}

function assertNoForbiddenAuthorization(report) {
  for (const forbidden of [
    "approved",
    "mount_approved",
    "ready_for_live_traffic",
    "production_ready",
    "live_ready",
    "auto_approved",
    "route_mount_authorized",
    "express_mount_authorized",
  ]) {
    assert.notStrictEqual(report.preMountAuthorization, forbidden, `preMountAuthorization must not be ${forbidden}.`);
    assert.notStrictEqual(report.routeMountAuthorization, forbidden, `routeMountAuthorization must not be ${forbidden}.`);
  }
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.signedApprovalIntakeGateResult, "FAIL");
  assert.strictEqual(report.preMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.humanAuthorizationRequired, true);
  assert.strictEqual(report.nextPhaseRequiresSeparateAuthorization, true);
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoForbiddenAuthorization(report);
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
    /mock-set-cookie-value/i,
    /mock-signature-value/i,
    /mock-approval-placeholder-value/i,
    /mock-signed-record-reference/i,
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
    /\bsigned\s*record\s*reference\b/i,
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
    /\/api\/oroplay\/balance/i,
    /\/api\/oroplay\/transaction/i,
    /\/api\/balance/i,
    /\/api\/transaction/i,
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
    "ORO-4M",
    "Pre-Mount Authorization Verification / Signed Approval Intake Gate",
    "Still No Express Mount",
    "Still No Public Alias",
    "Still No Runtime Wallet/Ledger Mutation",
    "Still No Actual Signed Approval Record Intake",
    "Still No Route Mount Authorization",
    "Still Separate Human Authorization Required",
    "signedApprovalIntakeGateResult",
    "signedApprovalRecordPresent=false",
    "routeMountAuthorization=not_authorized_for_mount",
    "A chat message is not a signed approval record.",
    "ORO-4M does not authorize `src/app.js` changes.",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const mountDecisionDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md");
  assert(
    mountDecisionDoc.includes("ORO-4M Signed Approval Intake Gate"),
    "ORO-4J doc must cross-reference ORO-4M."
  );

  const evidencePackDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md");
  assert(
    evidencePackDoc.includes("ORO-4M Signed Approval Intake Gate"),
    "ORO-4K doc must mention the ORO-4M follow-up boundary."
  );

  const oro4lDoc = readRequired("docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_APPROVAL_RECORD_PRE_MOUNT_AUTHORIZATION_BOUNDARY.md");
  assert(
    oro4lDoc.includes("Followed by ORO-4M Signed Approval Intake Gate"),
    "ORO-4L doc must mention the ORO-4M follow-up boundary."
  );
  assert(
    oro4lDoc.includes("template is an input, not a signed approval record"),
    "ORO-4L doc must state the template is not a signed approval record."
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [HARNESS, FIXTURES, SMOKE, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      ["ORO-4M callback staging route signed approval intake gate", "no actual signed approval record"],
    ],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["ORO-4M Current", "pending_signed_approval_record"]],
    ["docs/PHASE_ROADMAP.md", ["ORO-4M current/signed approval intake gate", "separate explicit authorization"]],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-4M OroPlay Callback Staging Route Signed Approval Intake Gate Coverage", SCRIPT],
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

  const happy = reportFor(happyPathSignedApprovalIntakeGateFixture);
  assert.strictEqual(happy.phase, "ORO-4M");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.signedApprovalIntakeGateResult, PASS);
  assert.strictEqual(happy.signedApprovalIntakeContractPresent, true);
  assert.strictEqual(happy.signedApprovalRecordPresent, false);
  assert.strictEqual(happy.signedApprovalRecordVerified, false);
  assert.strictEqual(happy.signedApprovalIntakeStatus, VERIFICATION_PACK_PASSED_PENDING_HUMAN_RECORD);
  assert.strictEqual(happy.preMountAuthorization, PENDING_SIGNED_APPROVAL_RECORD);
  assert.strictEqual(happy.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
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
  assertNoForbiddenAuthorization(happy);
  assertNoUndefinedOrNan(happy);

  assertFailed(reportFor(missingOro4lAuthorizationBoundaryFixture), "missing ORO-4L authorization boundary");

  const missingContract = reportFor(missingSignedApprovalIntakeContractFixture);
  assertFailed(missingContract, "missing signed approval intake contract");
  assert.strictEqual(missingContract.signedApprovalIntakeStatus, INTAKE_CONTRACT_MISSING);

  const chatPhrase = reportFor(chatApprovalPhraseFixture);
  assertFailed(chatPhrase, "chat approval is not accepted as signed record");
  assert.strictEqual(chatPhrase.signedApprovalRecordVerified, false);

  const vaguePhrase = reportFor(vagueApprovalPhraseFixture);
  assertFailed(vaguePhrase, "vague approval phrase rejected");
  assert.strictEqual(vaguePhrase.signedApprovalRecordVerified, false);

  const mockCandidate = reportFor(mockSignedApprovalCandidateFixture);
  assert.strictEqual(mockCandidate.signedApprovalRecordPresent, true);
  assert.strictEqual(mockCandidate.signedApprovalRecordVerified, false);
  assert.strictEqual(mockCandidate.signedApprovalIntakeStatus, CANDIDATE_RECORD_RECEIVED_FOR_REVIEW);
  assert.strictEqual(mockCandidate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert(mockCandidate.notes.includes("mock candidate is not actual authorization"));
  assertNoForbiddenAuthorization(mockCandidate);
  assertNoUndefinedOrNan(mockCandidate);

  const actualAttempt = reportFor(actualSignedApprovalAttemptedFixture);
  assertFailed(actualAttempt, "actual signed approval record not accepted in ORO-4M static/mock gate");
  assert.strictEqual(actualAttempt.signedApprovalRecordVerified, false);

  assertFailed(reportFor(accidentalExpressMountFixture), "express mount present");
  assertFailed(reportFor(publicAliasFixture), "public alias present");

  const mutation = reportFor(runtimeMutationFixture);
  assertFailed(mutation, "walletMutation present");
  assert(mutation.blockers.includes("ledgerMutation present"), "runtime mutation fixture must flag ledgerMutation.");

  assertFailed(reportFor(externalNetworkFixture), "externalNetwork present");
  assertFailed(reportFor(prismaWriteFixture), "prismaWrite present");
  assertFailed(reportFor(forbiddenAuthorizationStateFixture), "forbidden route mount authorization state");

  const secretReport = reportFor(secretLikeTraceFixture);
  assert.strictEqual(secretReport.signedApprovalIntakeGateResult, PASS);
  assert.strictEqual(secretReport.preMountAuthorization, PENDING_SIGNED_APPROVAL_RECORD);
  assertSanitizedTraceHasNoSensitiveOutput(secretReport.sanitizedTrace);
  assertSanitizedTraceHasNoSensitiveOutput(sanitizeSignedApprovalIntakeTrace(secretLikeTraceFixture.trace));

  const allReports = runSignedApprovalIntakeGate(buildSignedApprovalIntakeGateFixtures());
  assert(allReports.length >= 14, "fixture set must include required ORO-4M cases.");
  for (const report of allReports) {
    assertNoForbiddenAuthorization(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log("ORO-4M OroPlay callback staging route signed approval intake gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4M OroPlay callback staging route signed approval intake gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
