"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundarySummary,
  evaluateChatApprovalNotSignedArtifact,
  evaluateEvidencePackReadinessForDecision,
  evaluateFinalPreMountAuthorizationDecisionNotIssued,
  evaluatePlainTextApprovalNotSignedArtifact,
  sanitizeBoundaryTrace,
  validateMockSignedApprovalArtifactReviewOnly,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundary");
const {
  actualSignedApprovalArtifactAttemptFixture,
  buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures,
  chatApprovalMustNotCountAsSignedArtifactFixture,
  evidencePackCannotApproveMountWithoutActualArtifactFixture,
  evidencePackPreparedNotSubmittedFixture,
  expressMountAllowedRemainsFalseFixture,
  finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture,
  finalPreMountDecisionPreparedNotIssuedFixture,
  happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture,
  invalidArtifactDigestFormatFailsSchemaFixture,
  malformedArtifactMetadataFailsSchemaFixture,
  missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture,
  missingApprovalScopeFailsSchemaFixture,
  missingArtifactDigestFailsSchemaFixture,
  missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture,
  missingSignedAtFailsSchemaFixture,
  missingSignerIdentityFailsSchemaFixture,
  mockSignedApprovalArtifactMetadataReviewOnlyFixture,
  mountAuthorizationRequestRemainsNotSubmittedFixture,
  noPrismaWriteDbTransactionMarkersFixture,
  noSecretShapedValueMarkersFixture,
  noSrcAppJsExpressMountPublicAliasMarkersFixture,
  noWalletLedgerMutationMarkersFixture,
  plainTextApprovalWithoutSignatureMustNotCountFixture,
  publicAliasAllowedRemainsFalseFixture,
  routeMountAuthorizationRemainsBlockedFixture,
  routeMountScopeMockArtifactStillNotAcceptedFixture,
  runtimeTrafficAllowedRemainsFalseFixture,
  separateRouteMountApprovalRequiredFixture,
  staleSignedAtTimestampFailsAcceptanceReviewValidationFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const HARNESS =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundarySmoke.js";
const DOC =
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_ACCEPTANCE_REVIEW_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4pSmoke.js";
const SCRIPT = "smoke:oro-4p";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundarySummary(fixture);
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
    "issued",
    "submitted",
  ];

  for (const value of [
    report.preMountAuthorization,
    report.routeMountAuthorization,
    report.acceptanceReviewStatus,
    report.finalPreMountAuthorizationDecisionStatus,
  ]) {
    for (const marker of forbidden) {
      assert.notStrictEqual(value, marker, `authorization output must not be ${marker}.`);
    }
  }
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.signedApprovalArtifactAcceptanceReviewBoundaryResult, "FAIL");
  assert.strictEqual(report.actualSignedApprovalArtifactPresent, false);
  assert.strictEqual(report.signedApprovalRecordPresent, false);
  assert.strictEqual(report.signedApprovalArtifactAccepted, false);
  assert.strictEqual(report.signedApprovalArtifactVerified, false);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
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
    /mock-artifact-digest/i,
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
    /\bsigned\s*artifact\s*reference\b/i,
    /\bartifact\s*digest\b/i,
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
    /expressMountAllowed\s*[:=]\s*true/i,
    /publicAliasAllowed\s*[:=]\s*true/i,
    /runtimeTrafficAllowed\s*[:=]\s*true/i,
    /walletMutationAllowed\s*[:=]\s*true/i,
    /ledgerMutationAllowed\s*[:=]\s*true/i,
    /prismaWriteAllowed\s*[:=]\s*true/i,
    /finalPreMountAuthorizationDecisionIssued\s*[:=]\s*true/i,
    /signedApprovalArtifactAccepted\s*[:=]\s*true/i,
    /signedApprovalArtifactVerified\s*[:=]\s*true/i,
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
    "## Relationship to ORO-4O",
    "## Signed approval artifact intake vs acceptance review",
    "## Actual signed approval artifact requirements",
    "## Mock signed approval artifact review-only policy",
    "## Chat approval is not signed approval artifact",
    "## Plain text approval is not signed approval artifact",
    "## Acceptance review contract",
    "## Final pre-mount authorization decision boundary contract",
    "## Evidence pack is not mount authorization",
    "## Final decision pack is not issued authorization",
    "## Verification / acceptance review decision matrix",
    "## Route mount authorization decision",
    "## Required happy path output",
    "## Blockers",
    "## Next phase requirements",
    "this phase does not approve mount",
    "this phase does not issue final pre-mount authorization",
    "this phase does not submit mount authorization",
    "this phase does not create or store actual signed approval artifact",
    "separate authorization required before any route/mount change",
    "signedApprovalArtifactAcceptanceReviewBoundaryResult: PASS",
    "signedApprovalArtifactAcceptanceReviewContractPresent: true",
    "finalPreMountAuthorizationDecisionBoundaryPresent: true",
    "actualSignedApprovalArtifactPresent: false",
    "signedApprovalRecordPresent: false",
    "signedApprovalArtifactAccepted: false",
    "signedApprovalArtifactVerified: false",
    "mockSignedApprovalArtifactReviewOnly: true",
    "acceptanceReviewStatus: review_boundary_passed_pending_actual_signed_approval_artifact",
    "finalPreMountAuthorizationDecisionPrepared: true",
    "finalPreMountAuthorizationDecisionIssued: false",
    "finalPreMountAuthorizationDecisionStatus: decision_pack_prepared_pending_actual_signed_approval_artifact",
    "mountAuthorizationEvidencePackPrepared: true",
    "mountAuthorizationEvidencePackSubmitted: false",
    "mountAuthorizationRequestSubmitted: false",
    "preMountAuthorization: pending_actual_signed_approval_artifact",
    "routeMountAuthorization: not_authorized_for_mount",
    "expressMountAllowed: false",
    "publicAliasAllowed: false",
    "runtimeTrafficAllowed: false",
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
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_INTAKE_PRE_MOUNT_EVIDENCE_BOUNDARY.md",
      ["ORO-4P", "signed approval artifact acceptance review", "ORO-4O still has no actual signed artifact"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_RECORD_REVIEW_MOUNT_AUTHORIZATION_REQUEST_BOUNDARY.md",
      ["ORO-4P", "review/request boundary before ORO-4P is not an actual signed artifact"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_INTAKE_GATE.md",
      ["ORO-4P", "intake/review/evidence/acceptance boundary is not an actual signed approval artifact"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_APPROVAL_RECORD_PRE_MOUNT_AUTHORIZATION_BOUNDARY.md",
      ["ORO-4P", "approval template/intake/review is not an actual signed artifact"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md",
      ["ORO-4P", "evidence pack is not mount authorization"],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md",
      ["ORO-4P", "route mount remains `not_authorized_for_mount`", "not issued approval"],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["ORO-4P Current", DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT, "no mount, no alias, and no runtime traffic"],
    ],
    [
      "docs/API_MAPPING.md",
      ["ORO-4P acceptance review / decision boundary only", "not authorized for mount", "no public alias"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4P OroPlay Callback Staging Route Signed Approval Artifact Acceptance Review Final Pre-Mount Authorization Decision Boundary Coverage",
        SCRIPT,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-4P current/signed approval artifact acceptance review final pre-mount authorization decision boundary", "separate explicit authorization"],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath() {
  const happy = reportFor(happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture);
  assert.strictEqual(happy.phase, "ORO-4P");
  assert.strictEqual(happy.gate, GATE);
  assert.strictEqual(happy.signedApprovalArtifactAcceptanceReviewBoundaryResult, PASS);
  assert.strictEqual(happy.signedApprovalArtifactAcceptanceReviewContractPresent, true);
  assert.strictEqual(happy.finalPreMountAuthorizationDecisionBoundaryPresent, true);
  assert.strictEqual(happy.actualSignedApprovalArtifactPresent, false);
  assert.strictEqual(happy.signedApprovalRecordPresent, false);
  assert.strictEqual(happy.signedApprovalArtifactAccepted, false);
  assert.strictEqual(happy.signedApprovalArtifactVerified, false);
  assert.strictEqual(happy.mockSignedApprovalArtifactReviewOnly, true);
  assert.strictEqual(happy.acceptanceReviewStatus, REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT);
  assert.strictEqual(happy.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(happy.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(
    happy.finalPreMountAuthorizationDecisionStatus,
    DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT
  );
  assert.strictEqual(happy.mountAuthorizationEvidencePackPrepared, true);
  assert.strictEqual(happy.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(happy.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(happy.preMountAuthorization, PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT);
  assert.strictEqual(happy.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(happy.expressMountAllowed, false);
  assert.strictEqual(happy.publicAliasAllowed, false);
  assert.strictEqual(happy.runtimeTrafficAllowed, false);
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

  const chat = reportFor(chatApprovalMustNotCountAsSignedArtifactFixture);
  assertFailed(chat, "chat approval is not signed approval artifact");
  assert.strictEqual(
    evaluateChatApprovalNotSignedArtifact(chatApprovalMustNotCountAsSignedArtifactFixture)
      .chatApprovalCountedAsSignedApprovalArtifact,
    false
  );

  const plainText = reportFor(plainTextApprovalWithoutSignatureMustNotCountFixture);
  assertFailed(plainText, "plain text approval is not signed approval artifact");
  assert.strictEqual(
    evaluatePlainTextApprovalNotSignedArtifact(plainTextApprovalWithoutSignatureMustNotCountFixture)
      .plainTextApprovalCountedAsSignedApprovalArtifact,
    false
  );

  const mockArtifact = reportFor(mockSignedApprovalArtifactMetadataReviewOnlyFixture);
  assert.strictEqual(mockArtifact.signedApprovalArtifactAcceptanceReviewBoundaryResult, PASS);
  assert.strictEqual(mockArtifact.mockSignedApprovalArtifactReviewOnly, true);
  assert.strictEqual(mockArtifact.mockSignedApprovalArtifactSchemaOnly, true);
  assert.strictEqual(mockArtifact.mockSignedApprovalArtifactMetadataOnly, true);
  assert.strictEqual(mockArtifact.signedApprovalArtifactAccepted, false);
  assert.strictEqual(mockArtifact.signedApprovalArtifactVerified, false);
  assert.strictEqual(mockArtifact.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(
    validateMockSignedApprovalArtifactReviewOnly(mockSignedApprovalArtifactMetadataReviewOnlyFixture)
      .signedApprovalArtifactAccepted,
    false
  );

  assertFailed(reportFor(malformedArtifactMetadataFailsSchemaFixture), "malformed signed approval artifact review metadata schema");
  assertFailed(
    reportFor(missingSignerIdentityFailsSchemaFixture),
    "missing mock signed approval artifact review field: signerIdentity"
  );
  assertFailed(reportFor(missingSignedAtFailsSchemaFixture), "missing mock signed approval artifact review field: signedAt");
  assertFailed(
    reportFor(missingApprovalScopeFailsSchemaFixture),
    "missing mock signed approval artifact review field: approvalScope"
  );
  assertFailed(
    reportFor(missingArtifactDigestFailsSchemaFixture),
    "missing mock signed approval artifact review field: artifactDigest"
  );
  assertFailed(
    reportFor(invalidArtifactDigestFormatFailsSchemaFixture),
    "invalid mock signed approval artifact digest format"
  );
  assertFailed(
    reportFor(missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture),
    "missing mock signed approval artifact review field: acceptanceReviewerIdentity"
  );
  assertFailed(
    reportFor(missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture),
    "missing mock signed approval artifact review field: finalDecisionReviewerIdentity"
  );
  assertFailed(reportFor(staleSignedAtTimestampFailsAcceptanceReviewValidationFixture), "stale signed approval artifact timestamp");

  const routeMountScope = reportFor(routeMountScopeMockArtifactStillNotAcceptedFixture);
  assert.strictEqual(routeMountScope.signedApprovalArtifactAcceptanceReviewBoundaryResult, PASS);
  assert.strictEqual(routeMountScope.signedApprovalArtifactAccepted, false);
  assert.strictEqual(routeMountScope.signedApprovalArtifactVerified, false);
  assert.strictEqual(routeMountScope.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);

  const evidencePack = reportFor(evidencePackPreparedNotSubmittedFixture);
  assert.strictEqual(evidencePack.mountAuthorizationEvidencePackPrepared, true);
  assert.strictEqual(evidencePack.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(
    evaluateEvidencePackReadinessForDecision(evidencePackPreparedNotSubmittedFixture)
      .mountAuthorizationEvidencePackAcceptedAsMountAuthorization,
    false
  );

  assertFailed(
    reportFor(evidencePackCannotApproveMountWithoutActualArtifactFixture),
    "mount authorization evidence pack is not mount authorization"
  );

  const decision = reportFor(finalPreMountDecisionPreparedNotIssuedFixture);
  assert.strictEqual(decision.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(decision.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(
    decision.finalPreMountAuthorizationDecisionStatus,
    DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT
  );
  assert.strictEqual(
    evaluateFinalPreMountAuthorizationDecisionNotIssued(finalPreMountDecisionPreparedNotIssuedFixture)
      .finalPreMountAuthorizationDecisionAcceptedAsAuthorization,
    false
  );

  assertFailed(
    reportFor(finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture),
    "final pre-mount authorization decision cannot be issued without actual signed approval artifact"
  );

  const request = reportFor(mountAuthorizationRequestRemainsNotSubmittedFixture);
  assert.strictEqual(request.mountAuthorizationRequestSubmitted, false);

  const routeBoundary = reportFor(routeMountAuthorizationRemainsBlockedFixture);
  assert.strictEqual(routeBoundary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);

  const expressMount = reportFor(expressMountAllowedRemainsFalseFixture);
  assert.strictEqual(expressMount.expressMountAllowed, false);

  const publicAlias = reportFor(publicAliasAllowedRemainsFalseFixture);
  assert.strictEqual(publicAlias.publicAliasAllowed, false);

  const runtimeTraffic = reportFor(runtimeTrafficAllowedRemainsFalseFixture);
  assert.strictEqual(runtimeTraffic.runtimeTrafficAllowed, false);

  const separateApproval = reportFor(separateRouteMountApprovalRequiredFixture);
  assert.strictEqual(separateApproval.separateRouteMountApprovalRequired, true);
  assert.strictEqual(separateApproval.nextPhaseRequiresSeparateAuthorization, true);

  const noMountAlias = reportFor(noSrcAppJsExpressMountPublicAliasMarkersFixture);
  assert.strictEqual(noMountAlias.expressMount, "absent");
  assert.strictEqual(noMountAlias.publicAlias, "absent");
  assert.strictEqual(noMountAlias.activeRoute, "absent");

  const noMutation = reportFor(noWalletLedgerMutationMarkersFixture);
  assert.strictEqual(noMutation.walletMutation, "absent");
  assert.strictEqual(noMutation.ledgerMutation, "absent");

  const noPrisma = reportFor(noPrismaWriteDbTransactionMarkersFixture);
  assert.strictEqual(noPrisma.prismaWrite, "absent");
  assert.strictEqual(noPrisma.dbTransaction, "absent");

  const secretReport = reportFor(noSecretShapedValueMarkersFixture);
  assert.strictEqual(secretReport.signedApprovalArtifactAcceptanceReviewBoundaryResult, PASS);
  assertSanitizedTraceHasNoSensitiveOutput(secretReport.sanitizedTrace);
  assertSanitizedTraceHasNoSensitiveOutput(sanitizeBoundaryTrace(noSecretShapedValueMarkersFixture.trace));

  const actualAttempt = reportFor(actualSignedApprovalArtifactAttemptFixture);
  assertFailed(actualAttempt, "actual signed approval artifact not accepted in ORO-4P acceptance review boundary");
  assert.strictEqual(actualAttempt.actualSignedApprovalArtifactPresent, false);
  assert.strictEqual(actualAttempt.signedApprovalArtifactAccepted, false);
  assert.strictEqual(actualAttempt.signedApprovalArtifactVerified, false);

  const allReports = buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures().map(
    reportFor
  );
  assert(allReports.length >= 29, "fixture set must include required ORO-4P scenarios.");
  for (const report of allReports) {
    assert.strictEqual(report.actualSignedApprovalArtifactPresent, false);
    assert.strictEqual(report.signedApprovalRecordPresent, false);
    assert.strictEqual(report.signedApprovalArtifactAccepted, false);
    assert.strictEqual(report.signedApprovalArtifactVerified, false);
    assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
    assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assertNoForbiddenAuthorization(report);
    assertNoUndefinedOrNan(report);
  }

  assertSourceSafety();
  console.log(
    "ORO-4P OroPlay callback staging route signed approval artifact acceptance review final pre-mount authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-4P OroPlay callback staging route signed approval artifact acceptance review final pre-mount authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
