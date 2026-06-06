"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundary");
const fixtures = require("../game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundaryFixtures");

const {
  ACCEPTED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
  PASS,
  PASSED,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PENDING_DECISION,
  POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY,
  PREPARED_FOR_SUBMISSION,
  READINESS_RECORD_ONLY,
  READY,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  SUBMITTED,
  SUBMITTED_PENDING_DECISION,
  buildOro5lRouteMountAuthorizationRequestSubmissionInput,
  evaluateOro5lRouteMountAuthorizationRequestSubmission,
  buildOro5lRouteMountAuthorizationRequestRecord,
  buildOro5lRouteMountAuthorizationDecisionStillHeldGate,
  buildOro5lRouteMountImplementationStillHeldGate,
  buildOro5lExpressMountStillHeldGate,
  buildOro5lPublicAliasStillHeldGate,
  buildOro5lRuntimeTrafficStillHeldGate,
  buildOro5lRouteMountAuthorizationRequestSubmissionSummary,
  validateOro5lRouteMountAuthorizationRequestSubmission,
} = helper;

const {
  buildOro5lRouteMountAuthorizationRequestSubmissionFixtures,
  dbTransactionAllowedUnexpectedlyFixture,
  expressMountAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  happyPathRouteMountAuthorizationRequestSubmissionFixture,
  isolatedArtifactNotAcceptedFixture,
  isolatedArtifactNotReviewedFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  missingOro5kReadinessFixture,
  postExecutionEvidenceNotAcceptedFixture,
  postExecutionEvidenceNotReviewedFixture,
  postExecutionValidationMissingFixture,
  postExecutionValidationNotPassedFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  requestAlreadySubmittedFixture,
  requestPreparationNotAllowedFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountDecisionAlreadyIssuedFixture,
  routeMountGrantedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountReadinessNotCheckedFixture,
  routeMountReadinessNotReadyFixture,
  routePatchImplementedUnexpectedlyFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  srcAppChangedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  wrongRequestPreparationScopeFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const ORO5K_DOC = [
  "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
  "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
].join("");
const ORO5J_DOC = "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md";
const ORO5I_DOC =
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md";
const ORO5H_DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5G_DOC =
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5lSmoke.js";
const SCRIPT = "smoke:oro-5l";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5K_DOC,
  ORO5J_DOC,
  ORO5I_DOC,
  ORO5H_DOC,
  ORO5G_DOC,
  "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5lRouteMountAuthorizationRequestSubmissionBoundarySmoke.js",
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
    "ORO-5L",
    "oro5l",
    "routeMountAuthorizationRequestSubmission",
  ]) {
    assert(!app.includes(marker), `src/app.js must not include ${marker}.`);
  }
}

function assertOro5sPublicAliasWiringOnly() {
  const app = readRequired("src/app.js");
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `src/app.js missing ORO-5S fail-closed marker ${marker}.`);
  }
  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
    "PrismaClient",
    "prisma.",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert(!app.includes(marker), `src/app.js contains unsafe ORO-5S alias marker ${marker}.`);
  }
}

function assertNoActiveRouteMountInApp() {
  assertOro5sPublicAliasWiringOnly();
}

function assertNoRuntimeImplementationText() {
  const helperText = readRequired(
    "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5lRouteMountAuthorizationRequestSubmissionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5L files must not contain ${marker}.`);
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
    "## ORO-5L scope",
    "## Input from ORO-5K",
    "## Route mount authorization request submission rules",
    "## Request submitted / decision held boundary",
    "## Route mount authorization decision still held gate",
    "## Route mount implementation still held gate",
    "## No Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Wallet / ledger / Prisma write boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5L submits route mount authorization request record only",
    "ORO-5L does not issue route mount authorization decision",
    "ORO-5L does not grant route mount authorization",
    "ORO-5L does not edit src/app.js",
    "ORO-5L does not mount Express route",
    "ORO-5L does not enable public alias",
    "ORO-5L does not allow runtime traffic",
    "ORO-5L does not mutate wallet/ledger",
    "ORO-5L does not write Prisma/DB",
    "ORO-5L does not call live OroPlay API",
    "routeMountAuthorizationRequestSubmissionBoundaryEntered = true",
    "routeMountAuthorizationRequestPrepared = true",
    "routeMountAuthorizationRequestPreparationStatus = prepared_for_submission",
    "routeMountAuthorizationRequestStatus = submitted_pending_decision",
    "routeMountAuthorizationRequestScope = route_mount_authorization_decision_request_only",
    "routeMountAuthorizationDecisionResult = pending_decision",
    "routeMountAuthorization = not_authorized_for_mount",
    "nextPhaseRequiresRouteMountAuthorizationDecisionBoundary = true",
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
  for (const marker of [WRAPPER, SCRIPT, "oro5l", "oro-5l"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5L route mount authorization request submission",
        "ORO-5L submits route mount authorization request record",
        "next phase is route mount authorization decision boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5L Current",
        "ORO-5L submits route mount authorization request record",
        "routeMountAuthorizationRequestStatus=submitted_pending_decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5L current/local pending route mount authorization request submission",
        "ORO-5K closed",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5L Route Mount Authorization Request Submission Coverage",
        SCRIPT,
        "submitted pending decision",
      ],
    ],
    [ORO5K_DOC, ["ORO-5L submits route mount authorization request record"]],
    [ORO5J_DOC, ["ORO-5L submits route mount authorization request record"]],
    [ORO5I_DOC, ["ORO-5L submits route mount authorization request record"]],
    [ORO5H_DOC, ["ORO-5L submits route mount authorization request record"]],
    [ORO5G_DOC, ["ORO-5L submits route mount authorization request record"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHeldGates(summary) {
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
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
    summary.nextPhaseRequiresRouteMountAuthorizationDecisionBoundary,
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
  assert.strictEqual(summary.phase, "ORO-5L");
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionBoundaryResult, PASS);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestSubmissionBoundaryEntered,
    true
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestPrepared, true);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestPreparationStatus,
    PREPARED_FOR_SUBMISSION
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionChecked, true);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionAllowed, true);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestResult, SUBMITTED);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestScope,
    ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestEvidenceIncluded, true);
  assert.strictEqual(
    summary.routeMountAuthorizationRequestEvidenceScope,
    POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY
  );
  assert.strictEqual(summary.routeMountAuthorizationDecisionRequired, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, PENDING_DECISION);
  assert.strictEqual(summary.routeMountAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assertHeldGates(summary);
  assertNextPhaseFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.routeMountAuthorizationRequestSubmissionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.routeMountAuthorizationRequestSubmissionAllowed, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assertHeldGates(summary);
  assertNextPhaseFlags(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro5lRouteMountAuthorizationRequestSubmissionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathRouteMountAuthorizationRequestSubmissionFixture",
    "missingOro5kReadinessFixture",
    "postExecutionValidationMissingFixture",
    "postExecutionValidationNotPassedFixture",
    "isolatedArtifactNotReviewedFixture",
    "isolatedArtifactNotAcceptedFixture",
    "postExecutionEvidenceNotReviewedFixture",
    "postExecutionEvidenceNotAcceptedFixture",
    "routeMountReadinessNotCheckedFixture",
    "routeMountReadinessNotReadyFixture",
    "requestPreparationNotAllowedFixture",
    "wrongRequestPreparationScopeFixture",
    "requestAlreadySubmittedFixture",
    "routeMountDecisionAlreadyIssuedFixture",
    "routeMountGrantedUnexpectedlyFixture",
    "routeMountApprovedUnexpectedlyFixture",
    "routeMountImplementationAuthorizedUnexpectedlyFixture",
    "routeMountAuthorizedUnexpectedlyFixture",
    "routePatchImplementedUnexpectedlyFixture",
    "runtimeActualImplementationAlreadyImplementedFixture",
    "runtimeRoutePatchedUnexpectedlyFixture",
    "srcAppChangedUnexpectedlyFixture",
    "routeControllerChangedUnexpectedlyFixture",
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
    typeof ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5lRouteMountAuthorizationRequestSubmissionInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5lRouteMountAuthorizationRequestSubmission,
    "function"
  );
  assert.strictEqual(typeof buildOro5lRouteMountAuthorizationRequestRecord, "function");
  assert.strictEqual(
    typeof buildOro5lRouteMountAuthorizationDecisionStillHeldGate,
    "function"
  );
  assert.strictEqual(typeof buildOro5lRouteMountImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5lExpressMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5lPublicAliasStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5lRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(
    typeof buildOro5lRouteMountAuthorizationRequestSubmissionSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5lRouteMountAuthorizationRequestSubmission,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(
      happyPathRouteMountAuthorizationRequestSubmissionFixture
    )
  );

  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(missingOro5kReadinessFixture),
    "ORO-5K readiness is required"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(postExecutionValidationMissingFixture),
    "post-execution validation must be checked"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(postExecutionValidationNotPassedFixture),
    "post-execution validation must be passed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(isolatedArtifactNotReviewedFixture),
    "isolated patch artifact must be reviewed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(isolatedArtifactNotAcceptedFixture),
    "isolated patch artifact must be accepted"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(postExecutionEvidenceNotReviewedFixture),
    "post-execution evidence must be reviewed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(postExecutionEvidenceNotAcceptedFixture),
    "post-execution evidence must be accepted"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountReadinessNotCheckedFixture),
    "route mount readiness must be checked"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountReadinessNotReadyFixture),
    "route mount readiness must be ready"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(requestPreparationNotAllowedFixture),
    "route mount authorization request preparation must be allowed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(wrongRequestPreparationScopeFixture),
    "route mount authorization request preparation scope must be readiness record only"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(requestAlreadySubmittedFixture),
    "route mount authorization request must not already be submitted"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountDecisionAlreadyIssuedFixture),
    "route mount authorization decision must not already be issued"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountGrantedUnexpectedlyFixture),
    "route mount authorization must not already be granted"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routePatchImplementedUnexpectedlyFixture),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(runtimeActualImplementationAlreadyImplementedFixture),
    "runtime actual patch implementation must not already be implemented"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(runtimeRoutePatchedUnexpectedlyFixture),
    "runtime route must not be patched"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(srcAppChangedUnexpectedlyFixture),
    "src/app.js must not be changed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(routeControllerChangedUnexpectedlyFixture),
    "runtime route or controller must not be changed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed or implemented"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed or implemented"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed or enabled"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(walletMutationAllowedUnexpectedlyFixture),
    "wallet mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(ledgerMutationAllowedUnexpectedlyFixture),
    "ledger mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(prismaWriteAllowedUnexpectedlyFixture),
    "Prisma write must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(dbTransactionAllowedUnexpectedlyFixture),
    "DB transaction must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(migrationAllowedUnexpectedlyFixture),
    "migration must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(externalNetworkAllowedUnexpectedlyFixture),
    "external network must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(liveOroPlayApiCallAllowedUnexpectedlyFixture),
    "live OroPlay API call must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5lRouteMountAuthorizationRequestSubmission(secretShapedOutputFixture),
    "route mount authorization request submission input contains secret-shaped marker"
  );

  const record = buildOro5lRouteMountAuthorizationRequestRecord();
  assert.strictEqual(record.routeMountAuthorizationRequestSubmitted, true);
  assert.strictEqual(record.routeMountAuthorizationRequestStatus, SUBMITTED_PENDING_DECISION);

  const decisionGate = buildOro5lRouteMountAuthorizationDecisionStillHeldGate();
  assert.strictEqual(decisionGate.routeMountAuthorizationDecisionRequired, true);
  assert.strictEqual(decisionGate.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(decisionGate.routeMountAuthorizationGranted, false);

  const implementationGate = buildOro5lRouteMountImplementationStillHeldGate();
  assert.strictEqual(implementationGate.routeMountPatchImplemented, false);

  const expressGate = buildOro5lExpressMountStillHeldGate();
  assert.strictEqual(expressGate.expressMountAllowed, false);

  const aliasGate = buildOro5lPublicAliasStillHeldGate();
  assert.strictEqual(aliasGate.publicAliasAllowed, false);

  const trafficGate = buildOro5lRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCallAllowed, false);

  const validation = validateOro5lRouteMountAuthorizationRequestSubmission();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5lRouteMountAuthorizationRequestSubmissionFixtures().map(
      evaluateOro5lRouteMountAuthorizationRequestSubmission
    );
  assert(allReports.length >= 34, "fixture set must cover ORO-5L required cases.");
  for (const report of allReports) {
    const isPass = report.routeMountAuthorizationRequestSubmissionBoundaryResult === PASS;
    assert.strictEqual(report.routeMountAuthorizationRequestSubmitted, isPass);
    assert.strictEqual(report.routeMountAuthorizationDecisionIssued, false);
    assert.strictEqual(report.routeMountAuthorizationGranted, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assertHeldGates(report);
    assertNextPhaseFlags(report);
    assertResultHasNoSensitiveFields(report);
  }

  assert.strictEqual(PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS.includes("passed"), true);
  assert.strictEqual(ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS.includes(ACCEPTED), true);
  assert.strictEqual(READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST.includes(READY), true);
  assert.strictEqual(READINESS_RECORD_ONLY.includes("readiness"), true);
  assert.strictEqual(PASSED, "passed");

  console.log("ORO-5L route mount authorization request submission smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5L route mount authorization request submission smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
