"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundary");
const fixtures = require("../game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundaryFixtures");

const {
  ACCEPTED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  EXECUTED,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_ISSUED,
  ORO_5K_POST_EXECUTION_VALIDATION_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_STATUS,
  PASS,
  PASSED,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PREPARED,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
  READINESS_RECORD_ONLY,
  READY,
  READY_FOR_REVIEW,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput,
  evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
  buildOro5kIsolatedPatchArtifactReview,
  buildOro5kPostExecutionEvidenceReview,
  buildOro5kRouteMountAuthorizationRequestReadinessRecord,
  buildOro5kRouteMountRequestSubmissionStillHeldGate,
  buildOro5kRouteMountDecisionStillHeldGate,
  buildOro5kExpressMountStillHeldGate,
  buildOro5kPublicAliasStillHeldGate,
  buildOro5kRuntimeTrafficStillHeldGate,
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary,
  validateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
} = helper;

const {
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessFixtures,
  dbTransactionAllowedUnexpectedlyFixture,
  executionBoundaryNotEnteredFixture,
  executionNotCompletedFixture,
  executionNotStartedFixture,
  expressMountAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture,
  isolatedPatchArtifactMissingFixture,
  isolatedPatchArtifactNotReadyFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  missingOro5jExecutionFixture,
  postExecutionEvidenceMissingFixture,
  postExecutionEvidenceNotReadyFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountAuthorizationAlreadyGrantedFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountDecisionAlreadyIssuedFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountRequestAlreadySubmittedFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  srcAppChangedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  wrongActualPatchImplementationScopeFixture,
  wrongExecutionResultFixture,
  wrongExecutionScopeFixture,
  wrongExecutionStatusFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5K_POST_EXECUTION_VALIDATION_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const ORO5J_DOC = "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md";
const ORO5I_DOC =
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md";
const ORO5H_DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5G_DOC =
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const ORO5F_DOC =
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5kSmoke.js";
const SCRIPT = "smoke:oro-5k";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5J_DOC,
  ORO5I_DOC,
  ORO5H_DOC,
  ORO5G_DOC,
  ORO5F_DOC,
  "src/game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundary.js",
  "src/game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "docs/API_MAPPING.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "summary must not include undefined.");
  assert(!serialized.includes("NaN"), "summary must not include NaN.");
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
    assert(!serialized.includes(marker), `summary leaked sensitive marker ${marker}.`);
  }
}

function assertNoSrcAppJsEditMarkers() {
  const app = readRequired("src/app.js");
  for (const marker of [
    "ORO-5K",
    "oro5k",
    "postExecutionValidationRouteMountAuthorizationRequestReadiness",
  ]) {
    assert(!app.includes(marker), `src/app.js must not include ${marker}.`);
  }
}

function assertNoActiveRouteMountInApp() {
  const app = readRequired("src/app.js");
  for (const route of [
    "/api/oroplay/balance",
    "/api/oroplay/transaction",
    "/api/balance",
    "/api/transaction",
  ]) {
    assert(!app.includes(route), `src/app.js must not contain ${route}.`);
  }
}

function assertNoRuntimeImplementationText() {
  const helperText = readRequired(
    "src/game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundaryFixtures.js"
  );
  const combined = `${helperText}\n${fixtureText}`;
  for (const marker of [
    "app.use(",
    "express.Router",
    "router.post",
    "PrismaClient",
    "prisma.",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert(!combined.includes(marker), `ORO-5K files must not contain ${marker}.`);
  }
}

function assertChangedFilesStaticSafety() {
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];

  for (const file of STATIC_SAFETY_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## ORO-5K scope",
    "## Input from ORO-5J",
    "## Post-execution validation rules",
    "## Isolated patch artifact review",
    "## Post-execution evidence review",
    "## Route mount authorization request readiness record",
    "## Route mount request submission still held gate",
    "## Route mount decision still held gate",
    "## No Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Wallet / ledger / Prisma write boundary",
    "## Safety boundary",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5K validates post-execution evidence",
    "ORO-5K reviews isolated non-mounted patch artifact",
    "ORO-5K records route mount authorization request readiness only",
    "ORO-5K does not submit route mount authorization request",
    "ORO-5K does not issue route mount authorization decision",
    "ORO-5K does not mount Express route",
    "ORO-5K does not edit src/app.js",
    "ORO-5K does not enable public alias",
    "ORO-5K does not allow runtime traffic",
    "ORO-5K does not mutate wallet/ledger in runtime",
    "ORO-5K does not write Prisma/DB",
    "ORO-5K does not call live OroPlay API",
    "postExecutionValidationStatus = passed_for_route_mount_authorization_request_readiness",
    "routeMountAuthorizationRequestReadinessStatus = ready_to_prepare_route_mount_authorization_request",
    "routeMountAuthorizationRequestPreparationScope = readiness_record_only",
    "routeMountAuthorizationRequestSubmissionAllowed = false",
    "routeMountAuthorizationRequestSubmitted = false",
    "routeMountAuthorizationDecisionIssued = false",
    "routeMountAuthorizationGranted = false",
    "routeMountAuthorizationDecisionResult = not_issued",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "migrationPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary = true",
    "nextPhaseRequiresSeparateRouteMountAuthorizationDecision = true",
    "nextPhaseRequiresSeparateRouteMountImplementationBoundary = true",
    "nextPhaseRequiresSeparatePublicAliasApproval = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
    "nextPhaseRequiresPostMountValidationBoundary = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5k", "oro-5k"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5K post-execution validation route mount authorization request readiness",
        "ORO-5K validates post-execution evidence",
        "ORO-5K records route mount authorization request readiness only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5K Current",
        "ORO-5K validates post-execution evidence",
        "routeMountAuthorizationRequestReadinessStatus=ready_to_prepare_route_mount_authorization_request",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5K current/local pending post-execution validation route mount authorization request readiness",
        "ORO-5J closed",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5K Post-Execution Validation Route Mount Authorization Request Readiness Coverage",
        SCRIPT,
        "route mount authorization request readiness",
      ],
    ],
    [ORO5J_DOC, ["ORO-5K validates post-execution evidence"]],
    [ORO5I_DOC, ["ORO-5K validates post-execution evidence"]],
    [ORO5H_DOC, ["ORO-5K validates post-execution evidence"]],
    [ORO5G_DOC, ["ORO-5K validates post-execution evidence"]],
    [ORO5F_DOC, ["ORO-5K validates post-execution evidence"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHeldGates(summary) {
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.walletMutationPerformed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationPerformed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.prismaWritePerformed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.dbTransactionPerformed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.migrationPerformed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
}

function assertNextPhaseFlags(summary) {
  assert.strictEqual(
    summary.nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateRouteMountAuthorizationDecision,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateRouteMountImplementationBoundary,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresPostMountValidationBoundary, true);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5K");
  assert.strictEqual(summary.postExecutionValidationBoundaryResult, PASS);
  assert.strictEqual(summary.actualPatchImplementationExecutionBoundaryEntered, true);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, true);
  assert.strictEqual(summary.actualPatchImplementationExecutionCompleted, true);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionStatus,
    EXECUTED_ISOLATED_NON_MOUNTED_PATCH
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionResult, EXECUTED);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionScope,
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.isolatedActualPatchImplementationExecuted, true);
  assert.strictEqual(summary.isolatedActualPatchImplementationPatchApplied, true);
  assert.strictEqual(
    summary.isolatedActualPatchImplementationPatchResult,
    APPLIED_TO_MOCK_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationPatchArtifactPrepared, true);
  assert.strictEqual(
    summary.actualPatchImplementationPatchArtifactStatus,
    PREPARED_FOR_POST_EXECUTION_REVIEW
  );
  assert.strictEqual(summary.actualPatchImplementationPatchArtifactResult, READY_FOR_REVIEW);
  assert.strictEqual(summary.actualPatchImplementationImplemented, true);
  assert.strictEqual(
    summary.actualPatchImplementationImplementationScope,
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.postExecutionEvidencePrepared, true);
  assert.strictEqual(summary.postExecutionEvidenceStatus, PREPARED);
  assert.strictEqual(summary.postExecutionEvidenceResult, READY_FOR_REVIEW);
  assert.strictEqual(summary.postExecutionValidationChecked, true);
  assert.strictEqual(
    summary.postExecutionValidationStatus,
    PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS
  );
  assert.strictEqual(summary.postExecutionValidationResult, PASSED);
  assert.strictEqual(summary.isolatedPatchArtifactReviewed, true);
  assert.strictEqual(
    summary.isolatedPatchArtifactReviewStatus,
    ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS
  );
  assert.strictEqual(summary.isolatedPatchArtifactReviewResult, ACCEPTED);
  assert.strictEqual(summary.postExecutionEvidenceReviewed, true);
  assert.strictEqual(summary.postExecutionEvidenceReviewStatus, ACCEPTED);
  assert.strictEqual(summary.postExecutionEvidenceReviewResult, ACCEPTED);
  assert.strictEqual(summary.routeMountAuthorizationRequestReadinessChecked, true);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestReadinessStatus,
    READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestReadinessResult, READY);
  assert.strictEqual(summary.routeMountAuthorizationRequestPreparationAllowed, true);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestPreparationScope,
    READINESS_RECORD_ONLY
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionAllowed, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, NOT_ISSUED);
  assertHeldGates(summary);
  assertNextPhaseFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.postExecutionValidationBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.postExecutionValidationChecked, false);
  assert.strictEqual(summary.isolatedPatchArtifactReviewed, false);
  assert.strictEqual(summary.postExecutionEvidenceReviewed, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestReadinessChecked, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestPreparationAllowed, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionAllowed, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, NOT_ISSUED);
  assertHeldGates(summary);
  assertNextPhaseFlags(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures =
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture",
    "missingOro5jExecutionFixture",
    "executionBoundaryNotEnteredFixture",
    "executionNotStartedFixture",
    "executionNotCompletedFixture",
    "wrongExecutionStatusFixture",
    "wrongExecutionResultFixture",
    "wrongExecutionScopeFixture",
    "isolatedPatchArtifactMissingFixture",
    "isolatedPatchArtifactNotReadyFixture",
    "postExecutionEvidenceMissingFixture",
    "postExecutionEvidenceNotReadyFixture",
    "wrongActualPatchImplementationScopeFixture",
    "runtimeActualImplementationAlreadyImplementedFixture",
    "runtimeRoutePatchedUnexpectedlyFixture",
    "srcAppChangedUnexpectedlyFixture",
    "routeControllerChangedUnexpectedlyFixture",
    "routeMountRequestAlreadySubmittedFixture",
    "routeMountDecisionAlreadyIssuedFixture",
    "routeMountAuthorizationAlreadyGrantedFixture",
    "routeMountApprovedUnexpectedlyFixture",
    "routeMountImplementationAuthorizedUnexpectedlyFixture",
    "routeMountAuthorizedUnexpectedlyFixture",
    "expressMountAllowedUnexpectedlyFixture",
    "publicAliasAllowedUnexpectedlyFixture",
    "runtimeTrafficAllowedUnexpectedlyFixture",
    "walletMutationAllowedUnexpectedlyFixture",
    "ledgerMutationAllowedUnexpectedlyFixture",
    "prismaWriteAllowedUnexpectedlyFixture",
    "dbTransactionAllowedUnexpectedlyFixture",
    "migrationAllowedUnexpectedlyFixture",
    "externalNetworkAllowedUnexpectedlyFixture",
    "liveOroPlayApiCallAllowedUnexpectedlyFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5K_POST_EXECUTION_VALIDATION_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
    "function"
  );
  assert.strictEqual(typeof buildOro5kIsolatedPatchArtifactReview, "function");
  assert.strictEqual(typeof buildOro5kPostExecutionEvidenceReview, "function");
  assert.strictEqual(
    typeof buildOro5kRouteMountAuthorizationRequestReadinessRecord,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5kRouteMountRequestSubmissionStillHeldGate,
    "function"
  );
  assert.strictEqual(typeof buildOro5kRouteMountDecisionStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5kExpressMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5kPublicAliasStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5kRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(
    typeof buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture
    )
  );

  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      missingOro5jExecutionFixture
    ),
    "ORO-5J execution evidence is required"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      executionBoundaryNotEnteredFixture
    ),
    "ORO-5J execution boundary must be entered"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      executionNotStartedFixture
    ),
    "ORO-5J execution must be started"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      executionNotCompletedFixture
    ),
    "ORO-5J execution must be completed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      wrongExecutionStatusFixture
    ),
    "ORO-5J execution status must be executed isolated non-mounted patch"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      wrongExecutionResultFixture
    ),
    "ORO-5J execution result must be executed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      wrongExecutionScopeFixture
    ),
    "ORO-5J execution scope must be isolated non-mounted artifact only"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      isolatedPatchArtifactMissingFixture
    ),
    "isolated patch artifact must be executed and applied"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      isolatedPatchArtifactNotReadyFixture
    ),
    "isolated patch artifact must be ready for review"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      postExecutionEvidenceMissingFixture
    ),
    "post-execution evidence is required"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      postExecutionEvidenceNotReadyFixture
    ),
    "post-execution evidence must be ready for review"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      wrongActualPatchImplementationScopeFixture
    ),
    "actual patch implementation scope must be isolated non-mounted artifact only"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      runtimeActualImplementationAlreadyImplementedFixture
    ),
    "runtime actual patch implementation must not already be implemented"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      runtimeRoutePatchedUnexpectedlyFixture
    ),
    "runtime route must not be patched"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      srcAppChangedUnexpectedlyFixture
    ),
    "src/app.js must not be changed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeControllerChangedUnexpectedlyFixture
    ),
    "runtime route or controller must not be changed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountRequestAlreadySubmittedFixture
    ),
    "route mount authorization request must not already be submitted"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountDecisionAlreadyIssuedFixture
    ),
    "route mount authorization decision must not already be issued"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountAuthorizationAlreadyGrantedFixture
    ),
    "route mount authorization must not already be granted"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountApprovedUnexpectedlyFixture
    ),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountImplementationAuthorizedUnexpectedlyFixture
    ),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      routeMountAuthorizedUnexpectedlyFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      expressMountAllowedUnexpectedlyFixture
    ),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      publicAliasAllowedUnexpectedlyFixture
    ),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      runtimeTrafficAllowedUnexpectedlyFixture
    ),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      walletMutationAllowedUnexpectedlyFixture
    ),
    "wallet mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      ledgerMutationAllowedUnexpectedlyFixture
    ),
    "ledger mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      prismaWriteAllowedUnexpectedlyFixture
    ),
    "Prisma write must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      dbTransactionAllowedUnexpectedlyFixture
    ),
    "DB transaction must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      migrationAllowedUnexpectedlyFixture
    ),
    "migration must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      externalNetworkAllowedUnexpectedlyFixture
    ),
    "external network must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      liveOroPlayApiCallAllowedUnexpectedlyFixture
    ),
    "live OroPlay API call must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
      secretShapedOutputFixture
    ),
    "post-execution validation input contains secret-shaped marker"
  );

  const artifactReview = buildOro5kIsolatedPatchArtifactReview();
  assert.strictEqual(artifactReview.isolatedPatchArtifactReviewed, true);
  assert.strictEqual(
    artifactReview.isolatedPatchArtifactReviewStatus,
    ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS
  );
  assert.strictEqual(artifactReview.isolatedPatchArtifactReviewResult, ACCEPTED);

  const evidenceReview = buildOro5kPostExecutionEvidenceReview();
  assert.strictEqual(evidenceReview.postExecutionEvidenceReviewed, true);
  assert.strictEqual(evidenceReview.postExecutionEvidenceReviewStatus, ACCEPTED);

  const readinessRecord = buildOro5kRouteMountAuthorizationRequestReadinessRecord();
  assert.strictEqual(readinessRecord.routeMountAuthorizationRequestReadinessChecked, true);
  assert.strictEqual(readinessRecord.routeMountAuthorizationRequestPreparationAllowed, true);
  assert.strictEqual(readinessRecord.routeMountAuthorizationRequestSubmitted, false);

  const submissionGate = buildOro5kRouteMountRequestSubmissionStillHeldGate();
  assert.strictEqual(submissionGate.routeMountAuthorizationRequestSubmitted, false);

  const decisionGate = buildOro5kRouteMountDecisionStillHeldGate();
  assert.strictEqual(decisionGate.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(decisionGate.routeMountAuthorizationGranted, false);

  const expressGate = buildOro5kExpressMountStillHeldGate();
  assert.strictEqual(expressGate.expressMountAllowed, false);
  assert.strictEqual(expressGate.srcAppChanged, false);

  const aliasGate = buildOro5kPublicAliasStillHeldGate();
  assert.strictEqual(aliasGate.publicAliasAllowed, false);

  const trafficGate = buildOro5kRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCallAllowed, false);

  const validation =
    validateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessFixtures().map(
      evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness
    );
  assert(allReports.length >= 34, "fixture set must cover ORO-5K required cases.");
  for (const report of allReports) {
    const isPass = report.postExecutionValidationBoundaryResult === PASS;
    assert.strictEqual(report.postExecutionValidationChecked, isPass);
    assert.strictEqual(report.routeMountAuthorizationRequestReadinessChecked, isPass);
    assert.strictEqual(report.routeMountAuthorizationRequestSubmitted, false);
    assert.strictEqual(report.routeMountAuthorizationDecisionIssued, false);
    assert.strictEqual(report.routeMountAuthorizationGranted, false);
    assertHeldGates(report);
    assertNextPhaseFlags(report);
    assertResultHasNoSensitiveFields(report);
  }

  console.log(
    "ORO-5K post-execution validation route mount authorization request readiness smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-5K post-execution validation route mount authorization request readiness smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
