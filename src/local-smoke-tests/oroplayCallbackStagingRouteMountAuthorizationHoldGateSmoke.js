"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  buildMountAuthorizationHoldGateInput,
  evaluateMountAuthorizationHoldGate,
  validateMountAuthorizationHoldGate,
} = require("../game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGate");
const {
  attemptedExpressMountFixture,
  attemptedFinalDecisionWithoutActualArtifactFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  baselinePendingActualSignedApprovalArtifactFixture,
  buildMountAuthorizationHoldGateFixtures,
  chatApprovalOnlyFixture,
  decisionPackPreparedButNotIssuedFixture,
  evidencePackPreparedButNotSubmittedFixture,
  missingSignedApprovalRecordFixture,
  mockSignedArtifactReviewOnlyFixture,
  mountAuthorizationRequestNotSubmittedFixture,
  plainTextApprovalOnlyFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGateFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE.md";
const HARNESS = "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGate.js";
const FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteMountAuthorizationHoldGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteMountAuthorizationHoldGateSmoke.js";
const SCRIPT = "smoke:oroplay-callback-staging-route-mount-authorization-hold-gate";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function reportFor(fixture) {
  return evaluateMountAuthorizationHoldGate(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "result must not include undefined.");
  assert(!serialized.includes("NaN"), "result must not include NaN.");
}

function assertResultHasNoSensitiveFields(value) {
  const forbidden = [
    ["to", "ken"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    "PIN",
    ["device", "Id"].join(""),
  ];
  const serialized = JSON.stringify(value);
  for (const marker of forbidden) {
    assert(!serialized.includes(marker), `result leaked sensitive field marker ${marker}.`);
  }
}

function assertHappyPath(report) {
  assert.strictEqual(report.phase, "ORO-4Q");
  assert.strictEqual(report.gate, GATE);
  assert.strictEqual(report.mountAuthorizationHoldGateResult, PASS);
  assert.strictEqual(report.signedApprovalArtifactAcceptanceReviewBoundaryPassed, true);
  assert.strictEqual(report.signedApprovalArtifactAcceptanceReviewContractPresent, true);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionBoundaryPresent, true);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.actualSignedApprovalArtifactPresent, false);
  assert.strictEqual(report.signedApprovalRecordPresent, false);
  assert.strictEqual(report.signedApprovalArtifactAccepted, false);
  assert.strictEqual(report.signedApprovalArtifactVerified, false);
  assert.strictEqual(report.chatApprovalRejectedAsSignedApprovalArtifact, true);
  assert.strictEqual(report.plainTextApprovalRejectedAsSignedApprovalArtifact, true);
  assert.strictEqual(report.mockSignedApprovalArtifactRejectedAsActualAuthorization, true);
  assert.strictEqual(report.mockSignedApprovalArtifactReviewOnly, true);
  assert.strictEqual(report.mountAuthorizationEvidencePackPrepared, true);
  assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.preMountAuthorization, PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.mountAuthorizationHoldActive, true);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assert.strictEqual(report.humanAuthorizationRequired, true);
  assert.strictEqual(report.separateRouteMountApprovalRequired, true);
  assert.strictEqual(report.nextPhaseRequiresSeparateAuthorization, true);
  assert.deepStrictEqual(report.mountBlockers, [
    "missing_actual_signed_approval_artifact",
    "missing_actual_signed_approval_record",
    "final_pre_mount_authorization_decision_not_issued",
    "mount_authorization_request_not_submitted",
  ]);
  assert.deepStrictEqual(report.blockers, []);
  assertNoUndefinedOrNan(report);
  assertResultHasNoSensitiveFields(report);
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.mountAuthorizationHoldGateResult, "FAIL");
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.actualSignedApprovalArtifactPresent, false);
  assert.strictEqual(report.signedApprovalRecordPresent, false);
  assert.strictEqual(report.signedApprovalArtifactAccepted, false);
  assert.strictEqual(report.signedApprovalArtifactVerified, false);
  assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoUndefinedOrNan(report);
  assertResultHasNoSensitiveFields(report);
}

function assertNoActiveRouteMountInApp() {
  const app = readRequired("src/app.js");
  const forbiddenRoutes = [
    "/api/oroplay/balance",
    "/api/oroplay/transaction",
    "/api/balance",
    "/api/transaction",
  ];
  for (const route of forbiddenRoutes) {
    const pattern = new RegExp(`app\\.(?:use|post|get|put|patch|delete)\\(\\s*["']${route.replace(/\//g, "\\/")}["']`, "i");
    assert(!pattern.test(app), `src/app.js must not mount ${route}.`);
  }
}

function assertNoSecretShapedValues() {
  const files = [
    DOC,
    HARNESS,
    FIXTURES,
    SMOKE,
    "package.json",
    "src/local-smoke-tests/runAllLocalSmoke.js",
    "docs/API_MAPPING.md",
    "docs/OROPLAY_INTEGRATION_PLAN.md",
    "docs/PHASE_ROADMAP.md",
    "docs/SMOKE_COVERAGE.md",
    "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_ACCEPTANCE_REVIEW_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md",
  ];
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /DATABASE_URL\s*=\s*\S+/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];

  for (const file of files) {
    const text = readRequired(file);
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## Phase ORO-4Q scope",
    "## Relationship to ORO-4P",
    "## Actual signed approval artifact waiting boundary",
    "## Mount authorization hold gate",
    "## Final pre-mount decision not-issued boundary",
    "## Route mount still not authorized",
    "## Chat/plain text approval rejection rule",
    "## Mock artifact rejection rule",
    "## Evidence pack prepared but not submitted",
    "## Mount authorization request not submitted",
    "## Express mount prohibition",
    "## Public alias prohibition",
    "## Runtime traffic prohibition",
    "## Safety boundary",
    "## Next phase requirement",
    "ORO-4Q is not route mount approval.",
    "ORO-4Q is a hold gate only.",
    "ORO-4Q must not issue final pre-mount authorization.",
    "ORO-4Q must not submit mount authorization request.",
    "ORO-4Q must not enable route mount.",
    "ORO-4Q must not accept chat approval or plain text approval as signed approval artifact.",
    "ORO-4Q must not accept mock signed artifact as actual authorization.",
    "signedApprovalArtifactAcceptanceReviewBoundaryPassed: true",
    "finalPreMountAuthorizationDecisionPrepared: true",
    "finalPreMountAuthorizationDecisionIssued: false",
    "actualSignedApprovalArtifactPresent: false",
    "signedApprovalRecordPresent: false",
    "signedApprovalArtifactAccepted: false",
    "signedApprovalArtifactVerified: false",
    "mountAuthorizationEvidencePackPrepared: true",
    "mountAuthorizationEvidencePackSubmitted: false",
    "mountAuthorizationRequestSubmitted: false",
    "preMountAuthorization: pending_actual_signed_approval_artifact",
    "routeMountAuthorization: not_authorized_for_mount",
    "mountAuthorizationHoldActive: true",
    "expressMountAllowed: false",
    "publicAliasAllowed: false",
    "runtimeTrafficAllowed: false",
    "humanAuthorizationRequired: true",
    "separateRouteMountApprovalRequired: true",
    "nextPhaseRequiresSeparateAuthorization: true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [DOC, HARNESS, FIXTURES, SMOKE, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4Q mount authorization hold gate only",
        "/api/oroplay/balance` | POST | ORO-4Q hold gate only; route remains not mounted and not authorized for mount",
        "/api/balance` | POST | ORO-4Q hold gate only; no public alias",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-4Q Current", "next step still requires separate explicit authorization"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-4Q current/mount authorization hold gate", "not authorized for mount"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-4Q OroPlay Callback Staging Route Mount Authorization Hold Gate Coverage", SCRIPT],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_ACCEPTANCE_REVIEW_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md",
      ["ORO-4Q", "hold gate", "ORO-4P remains an acceptance review and decision boundary, not mount approval"],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function main() {
  assert.strictEqual(typeof evaluateMountAuthorizationHoldGate, "function");
  assert.strictEqual(typeof validateMountAuthorizationHoldGate, "function");

  assertDocsAndRegistration();
  assertNoActiveRouteMountInApp();
  assertNoSecretShapedValues();

  assertHappyPath(reportFor(baselinePendingActualSignedApprovalArtifactFixture));
  assertHappyPath(reportFor(missingSignedApprovalRecordFixture));
  assertHappyPath(reportFor(decisionPackPreparedButNotIssuedFixture));
  assertHappyPath(reportFor(evidencePackPreparedButNotSubmittedFixture));
  assertHappyPath(reportFor(mountAuthorizationRequestNotSubmittedFixture));

  assertFailed(reportFor(chatApprovalOnlyFixture), "chat approval cannot be counted as signed approval artifact");
  assertFailed(
    reportFor(plainTextApprovalOnlyFixture),
    "plain text approval cannot be counted as signed approval artifact"
  );

  const mockReviewOnly = reportFor(mockSignedArtifactReviewOnlyFixture);
  assertHappyPath(mockReviewOnly);
  assert.strictEqual(mockReviewOnly.mockSignedApprovalArtifactRejectedAsActualAuthorization, true);
  assert.strictEqual(mockReviewOnly.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);

  assertFailed(
    reportFor(
      buildMountAuthorizationHoldGateInput({
        id: "mockSignedArtifactAttemptedActualAuthorizationFixture",
        approvalCandidates: {
          mockSignedApprovalArtifact: {
            present: true,
            artifactId: "mock-review-only-artifact-id",
            reviewOnly: false,
            acceptedAsActualAuthorization: true,
          },
        },
        attemptedAuthorizationStates: {
          actualSignedApprovalArtifactSource: "mock_signed_artifact",
        },
      })
    ),
    "mock signed approval artifact cannot be accepted as actual authorization"
  );

  assertFailed(
    reportFor(attemptedFinalDecisionWithoutActualArtifactFixture),
    "final pre-mount authorization decision cannot be issued before actual signed approval artifact"
  );
  assertFailed(reportFor(attemptedExpressMountFixture), "Express mount is not allowed in ORO-4Q");
  assertFailed(reportFor(attemptedPublicAliasFixture), "public alias is not allowed in ORO-4Q");
  assertFailed(reportFor(attemptedRuntimeTrafficFixture), "runtime traffic is not allowed in ORO-4Q");

  assertFailed(
    reportFor(
      buildMountAuthorizationHoldGateInput({
        id: "actualSignedApprovalArtifactWithoutProofTypeFixture",
        actualSignedApprovalArtifact: {
          present: true,
          proofType: "",
          sourceType: "mock-approval-placeholder",
        },
      })
    ),
    "actual signed approval artifact present without actual proof type"
  );
  assertFailed(
    reportFor(
      buildMountAuthorizationHoldGateInput({
        id: "signedApprovalRecordWithoutActualRecordTypeFixture",
        signedApprovalRecord: {
          present: true,
          recordType: "",
        },
      })
    ),
    "signed approval record present without actual signed record type"
  );

  const allReports = buildMountAuthorizationHoldGateFixtures().map(reportFor);
  assert(allReports.length >= 12, "fixture set must include required ORO-4Q scenarios.");
  for (const report of allReports) {
    assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
    assert.strictEqual(report.actualSignedApprovalArtifactPresent, false);
    assert.strictEqual(report.signedApprovalRecordPresent, false);
    assert.strictEqual(report.signedApprovalArtifactAccepted, false);
    assert.strictEqual(report.signedApprovalArtifactVerified, false);
    assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assertResultHasNoSensitiveFields(report);
  }

  const validation = validateMountAuthorizationHoldGate(baselinePendingActualSignedApprovalArtifactFixture);
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  console.log("ORO-4Q OroPlay callback staging route mount authorization hold gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4Q OroPlay callback staging route mount authorization hold gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
