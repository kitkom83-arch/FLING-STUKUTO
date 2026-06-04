"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PENDING_SIGNED_APPROVAL_RECORD,
  REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
  buildSignedApprovalRecordReviewMountAuthorizationRequestBoundarySummary,
  evaluateChatApprovalNotSignedRecord,
  evaluateMockSignedRecordSchemaOnly,
  evaluateMountAuthorizationRequestNotAuthorization,
  sanitizeBoundaryTrace,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundary");
const {
  actualSignedApprovalRecordAttemptFixture,
  buildSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures,
  chatApprovalMustNotCountFixture,
  happyPathRequestBoundaryPassedPendingActualSignedRecordFixture,
  malformedSignedRecordFailsSchemaFixture,
  missingApprovalArtifactHashFailsSchemaFixture,
  missingApprovalScopeFailsSchemaFixture,
  missingReviewerIdentityFailsReviewFixture,
  missingSignedAtFailsSchemaFixture,
  missingSignerIdentityFailsSchemaFixture,
  mockSignedRecordSchemaOnlyFixture,
  noExpressMountOrPublicAliasMarkersFixture,
  noPrismaWriteOrDbTransactionMarkersFixture,
  noSecretShapedValueMarkersFixture,
  noWalletLedgerMutationMarkersFixture,
  plainTextApprovalWithoutSignatureFixture,
  requestCannotAuthorizeWithoutActualRecordFixture,
  requestPackPreparedNotSubmittedFixture,
  routeMountAuthorizationRemainsBlockedFixture,
  routeMountScopeMockRecordNotActualFixture,
  separateRouteMountApprovalRequiredFixture,
  staleTimestampFailsReviewFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundarySmoke.js";
const DOC =
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_RECORD_REVIEW_MOUNT_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4nSmoke.js";
const SCRIPT = "smoke:oro-4n";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildSignedApprovalRecordReviewMountAuthorizationRequestBoundarySummary(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "report must not include undefined.");
  assert(!serialized.includes("NaN"), "report must not include NaN.");
}

function assertNoForbiddenAuthorization(report) {
  const forbidden = [
    ["ap", "proved"].join(""),
    ["mount", "ap", "proved"].join("_"),
    ["ready", "for", "live", "traffic"].join("_"),
    ["production", "ready"].join("_"),
    ["live", "ready"].join("_"),
    ["auto", "ap", "proved"].join("_"),
    ["route", "mount", "authorized"].join("_"),
    ["express", "mount", "authorized"].join("_"),
  ];

  for (const value of [
    report.preMountAuthorization,
    report.routeMountAuthorization,
    report.mountAuthorizationRequestStatus,
  ]) {
    for (const marker of forbidden) {
      assert.notStrictEqual(value, marker, `authorization output must not be ${marker}.`);
    }
  }
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.signedApprovalRecordReviewBoundaryResult, "FAIL");
  assert.strictEqual(report.signedApprovalRecordPresent, false);
  assert.strictEqual(report.signedApprovalRecordAccepted, false);
  assert.strictEqual(report.signedApprovalRecordVerified, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
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
    /mock-artifact-hash/i,
    /\bauthorization\b/i,
    /\bbearer\b/i,
    /\bbasic\b/i,
    /\btoken\b/i,
    /\bsecret\b/i,
    /\bclientSecret\b/i,
    /\bpassword\b/i,
    /\bDATABASE_URL\b/i,
    /\bapi\s*key\b/i,
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
  const fixtures = readRequired(FIXTURES);
  const forbiddenSourcePatterns = [
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
    /\bprisma\.\w+\.(?:create|update|delete|upsert|createMany|updateMany|deleteMany|transaction)\s*\(/i,
    /\bwallet\.\w+\.(?:create|update|increment|decrement|upsert)\s*\(/i,
    /\bledger\.\w+\.(?:create|update|upsert|createMany)\s*\(/i,
  ];

  for (const source of [harness, fixtures]) {
    for (const pattern of forbiddenSourcePatterns) {
      assert(!pattern.test(source), `${HARNESS}/${FIXTURES} contains forbidden runtime marker ${pattern}.`);
    }
  }

  const forbiddenActiveMarkers = [
    /mountApproved\s*[:=]\s*true/i,
    /readyForLiveTraffic\s*[:=]\s*true/i,
    /routeMountAuthorized\s*[:=]\s*true/i,
    /expressRouteMounted\s*[:=]\s*true/i,
    /publicAliasMounted\s*[:=]\s*true/i,
    /walletMutationAllowed\s*[:=]\s*true/i,
    /ledgerMutationAllowed\s*[:=]\s*true/i,
    /prismaWriteAllowed\s*[:=]\s*true/i,
  ];
  for (const pattern of forbiddenActiveMarkers) {
    assert(!pattern.test(harness), `${HARNESS} contains active authorization marker ${pattern}.`);
    assert(!pattern.test(fixtures), `${FIXTURES} contains active authorization marker ${pattern}.`);
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
    "## Phase name",
    "## Purpose",
    "## Non-goals",
    "## Safety boundary",
    "## Relationship to ORO-4M",
    "## Signed approval intake vs signed approval record review",
    "## Actual signed approval record requirements",
    "## Signed approval record review contract",
    "## Mount authorization request boundary contract",
    "## Mock signed record schema-only policy",
    "## Chat approval is not signed approval",
    "## Mount authorization request is not mount authorization",
    "## Verification / review decision matrix",
    "## Route mount authorization decision",
    "## Required happy path output",
    "## Blockers",
    "## Next phase requirements",
    "this phase does not approve mount",
    "this phase does not submit mount authorization",
    "separate authorization required before any route/mount change",
    "signedApprovalRecordReviewBoundaryResult: PASS",
    "signedApprovalRecordReviewContractPresent: true",
    "mountAuthorizationRequestBoundaryPresent: true",
    "signedApprovalRecordPresent: false",
    "signedApprovalRecordAccepted: false",
    "signedApprovalRecordVerified: false",
    "mountAuthorizationRequestPrepared: true",
    "mountAuthorizationRequestSubmitted: false",
    "mountAuthorizationRequestStatus: request_pack_prepared_pending_actual_signed_record",
    "preMountAuthorization: pending_signed_approval_record",
    "routeMountAuthorization: not_authorized_for_mount",
    "humanAuthorizationRequired: true",
    "separateRouteMountApprovalRequired: true",
    "nextPhaseRequiresSeparateAuthorization: true",
    "blockers: []",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_INTAKE_GATE.md",
      ["ORO-4N", "actual signed record", "does not authorize mount"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_APPROVAL_RECORD_PRE_MOUNT_AUTHORIZATION_BOUNDARY.md",
      ["ORO-4N", "template/intake is not an actual signed approval record"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md",
      ["ORO-4N", "evidence pack is not mount authorization"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md",
      ["ORO-4N", "route mount remains `not_authorized_for_mount`"],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["ORO-4N Current", REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD],
    ],
    [
      "docs/API_MAPPING.md",
      ["ORO-4N request boundary only", "not authorized for mount", "no public alias"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4N OroPlay Callback Staging Route Signed Approval Record Review Mount Authorization Request Boundary Coverage",
        SCRIPT,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-4N current/signed approval record review mount authorization request boundary", "separate explicit authorization"],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath() {
  const happy = reportFor(happyPathRequestBoundaryPassedPendingActualSignedRecordFixture);
  assert.strictEqual(happy.phase, "ORO-4N");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.signedApprovalRecordReviewBoundaryResult, PASS);
  assert.strictEqual(happy.signedApprovalRecordReviewContractPresent, true);
  assert.strictEqual(happy.mountAuthorizationRequestBoundaryPresent, true);
  assert.strictEqual(happy.signedApprovalRecordPresent, false);
  assert.strictEqual(happy.signedApprovalRecordAccepted, false);
  assert.strictEqual(happy.signedApprovalRecordVerified, false);
  assert.strictEqual(happy.mountAuthorizationRequestPrepared, true);
  assert.strictEqual(happy.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(happy.mountAuthorizationRequestStatus, REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD);
  assert.strictEqual(happy.preMountAuthorization, PENDING_SIGNED_APPROVAL_RECORD);
  assert.strictEqual(happy.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(happy.humanAuthorizationRequired, true);
  assert.strictEqual(happy.separateRouteMountApprovalRequired, true);
  assert.strictEqual(happy.nextPhaseRequiresSeparateAuthorization, true);
  assert.deepStrictEqual(happy.blockers, []);
  assert.strictEqual(happy.expressMount, "absent");
  assert.strictEqual(happy.publicAlias, "absent");
  assert.strictEqual(happy.activeRoute, "absent");
  assert.strictEqual(happy.httpListener, "absent");
  assert.strictEqual(happy.runtimeTraffic, "absent");
  assert.strictEqual(happy.walletMutation, "absent");
  assert.strictEqual(happy.ledgerMutation, "absent");
  assert.strictEqual(happy.prismaWrite, "absent");
  assert.strictEqual(happy.dbTransaction, "absent");
  assert.strictEqual(happy.externalNetwork, "absent");
  assert.strictEqual(happy.liveOroPlayApiCall, "absent");
  assert.strictEqual(happy.realMoney, "absent");
  assertNoForbiddenAuthorization(happy);
  assertNoUndefinedOrNan(happy);
}

function main() {
  assertDocsAndRegistration();
  assertHappyPath();

  const chat = reportFor(chatApprovalMustNotCountFixture);
  assertFailed(chat, "chat approval is not signed approval record");
  assert.strictEqual(evaluateChatApprovalNotSignedRecord(chatApprovalMustNotCountFixture).chatApprovalCountedAsSignedRecord, false);

  const plainText = reportFor(plainTextApprovalWithoutSignatureFixture);
  assertFailed(plainText, "plain text approval is not signed approval record");
  assert.strictEqual(
    evaluateChatApprovalNotSignedRecord(plainTextApprovalWithoutSignatureFixture).plainTextApprovalCountedAsSignedRecord,
    false
  );

  const mockRecord = reportFor(mockSignedRecordSchemaOnlyFixture);
  assert.strictEqual(mockRecord.signedApprovalRecordReviewBoundaryResult, PASS);
  assert.strictEqual(mockRecord.mockSignedRecordSchemaValid, true);
  assert.strictEqual(mockRecord.signedApprovalRecordPresent, false);
  assert.strictEqual(mockRecord.signedApprovalRecordAccepted, false);
  assert.strictEqual(mockRecord.signedApprovalRecordVerified, false);
  assert.strictEqual(mockRecord.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(evaluateMockSignedRecordSchemaOnly(mockSignedRecordSchemaOnlyFixture).signedApprovalRecordAccepted, false);

  assertFailed(reportFor(malformedSignedRecordFailsSchemaFixture), "malformed signed record schema");
  assertFailed(reportFor(missingSignerIdentityFailsSchemaFixture), "missing mock signed record field: signerIdentity");
  assertFailed(reportFor(missingSignedAtFailsSchemaFixture), "missing mock signed record field: signedAt");
  assertFailed(reportFor(missingApprovalScopeFailsSchemaFixture), "missing mock signed record field: approvalScope");
  assertFailed(
    reportFor(missingApprovalArtifactHashFailsSchemaFixture),
    "missing mock signed record field: approvalArtifactHash"
  );
  assertFailed(reportFor(missingReviewerIdentityFailsReviewFixture), "missing mock signed record field: reviewerIdentity");
  assertFailed(reportFor(staleTimestampFailsReviewFixture), "stale signed record timestamp");

  const routeMountScope = reportFor(routeMountScopeMockRecordNotActualFixture);
  assert.strictEqual(routeMountScope.signedApprovalRecordReviewBoundaryResult, PASS);
  assert.strictEqual(routeMountScope.signedApprovalRecordAccepted, false);
  assert.strictEqual(routeMountScope.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);

  const requestPack = reportFor(requestPackPreparedNotSubmittedFixture);
  assert.strictEqual(requestPack.mountAuthorizationRequestPrepared, true);
  assert.strictEqual(requestPack.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(requestPack.mountAuthorizationRequestStatus, REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD);
  assert.strictEqual(
    evaluateMountAuthorizationRequestNotAuthorization(requestPackPreparedNotSubmittedFixture)
      .mountAuthorizationRequestAcceptedAsAuthorization,
    false
  );

  assertFailed(reportFor(requestCannotAuthorizeWithoutActualRecordFixture), "mount authorization request is not authorization");

  const routeBoundary = reportFor(routeMountAuthorizationRemainsBlockedFixture);
  assert.strictEqual(routeBoundary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);

  const separateApproval = reportFor(separateRouteMountApprovalRequiredFixture);
  assert.strictEqual(separateApproval.separateRouteMountApprovalRequired, true);
  assert.strictEqual(separateApproval.nextPhaseRequiresSeparateAuthorization, true);

  const noMountAlias = reportFor(noExpressMountOrPublicAliasMarkersFixture);
  assert.strictEqual(noMountAlias.expressMount, "absent");
  assert.strictEqual(noMountAlias.publicAlias, "absent");
  assert.strictEqual(noMountAlias.activeRoute, "absent");

  const noMutation = reportFor(noWalletLedgerMutationMarkersFixture);
  assert.strictEqual(noMutation.walletMutation, "absent");
  assert.strictEqual(noMutation.ledgerMutation, "absent");

  const noPrisma = reportFor(noPrismaWriteOrDbTransactionMarkersFixture);
  assert.strictEqual(noPrisma.prismaWrite, "absent");
  assert.strictEqual(noPrisma.dbTransaction, "absent");

  const secretReport = reportFor(noSecretShapedValueMarkersFixture);
  assert.strictEqual(secretReport.signedApprovalRecordReviewBoundaryResult, PASS);
  assertSanitizedTraceHasNoSensitiveOutput(secretReport.sanitizedTrace);
  assertSanitizedTraceHasNoSensitiveOutput(sanitizeBoundaryTrace(noSecretShapedValueMarkersFixture.trace));

  const actualAttempt = reportFor(actualSignedApprovalRecordAttemptFixture);
  assertFailed(actualAttempt, "actual signed approval record not accepted in ORO-4N mock boundary");
  assert.strictEqual(actualAttempt.signedApprovalRecordAccepted, false);
  assert.strictEqual(actualAttempt.signedApprovalRecordVerified, false);

  const allReports = buildSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures().map(reportFor);
  assert(allReports.length >= 21, "fixture set must include required ORO-4N scenarios.");
  for (const report of allReports) {
    assert.strictEqual(report.signedApprovalRecordPresent, false);
    assert.strictEqual(report.signedApprovalRecordAccepted, false);
    assert.strictEqual(report.signedApprovalRecordVerified, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assertNoForbiddenAuthorization(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log(
    "ORO-4N OroPlay callback staging route signed approval record review mount authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-4N OroPlay callback staging route signed approval record review mount authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
