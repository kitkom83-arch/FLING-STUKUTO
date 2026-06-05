"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission");
const fixtures = require("../game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures");
const oro5b = require("../game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary");

const {
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
  PASS,
  PENDING_DECISION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  SUBMITTED_PENDING_DECISION,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestInput,
  evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
  buildOro5cPatchImplementationStillHeldGate,
  buildOro5cRouteMountStillHeldGate,
  buildOro5cRuntimeTrafficStillHeldGate,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary,
  validateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
} = helper;

const {
  attemptedDbTransactionFixture,
  attemptedExpressMountImplementationFixture,
  attemptedExternalNetworkFixture,
  attemptedLedgerMutationFixture,
  attemptedMigrationFixture,
  attemptedPrismaWriteFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures,
  decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture,
  executionApprovalDecisionNotIssuedFixture,
  executionApprovalNotGrantedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathPatchImplementationAuthorizationRequestSubmittedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro5bFinalExecutionDecisionFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
  patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture,
  patchImplementedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  publicAliasAllowedTrueFixture,
  requestSkipsPatchImplementationAuthorizationDecisionFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
  wrongExecutionDecisionResultFixture,
  wrongRouteMountExecutionAuthorizationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION.md";
const ORO5B_DOC =
  "docs/ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5cSmoke.js";
const SCRIPT = "smoke:oro-5c";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5B_DOC,
  "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission.js",
  "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures.js",
  "src/local-smoke-tests/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionSmoke.js",
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
    "ORO-5C",
    "oro5c",
    "routeMountPatchImplementationAuthorizationRequest",
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
    "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5C files must not contain ${marker}.`);
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
    "## ORO-5C scope",
    "## Input from ORO-5B",
    "## Patch implementation authorization request submission rules",
    "## Patch implementation authorization decision still pending gate",
    "## Patch implementation still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5B final execution approval decision has been issued",
    "ORO-5B decision result only allows patch implementation authorization request",
    "ORO-5C submits the patch implementation authorization request only",
    "ORO-5C does not issue patch implementation authorization decision",
    "ORO-5C does not approve patch implementation",
    "ORO-5C does not implement route mount patch",
    "ORO-5C does not edit src/app.js",
    "ORO-5C does not mount Express route",
    "ORO-5C does not enable public alias",
    "ORO-5C does not allow runtime traffic",
    "ORO-5C does not mutate wallet/ledger",
    "ORO-5C does not write Prisma/DB",
    "ORO-5C does not call live OroPlay API",
    "future patch implementation authorization decision requires separate",
    "future patch implementation requires separate explicit implementation",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "routeMountPatchImplementationAuthorizationRequestSubmitted = true",
    "routeMountPatchImplementationAuthorizationRequestStatus = submitted_pending_decision",
    "routeMountPatchImplementationAuthorizationRequestResult = pending_decision",
    "routeMountPatchImplementationAuthorizationDecisionIssued = false",
    "routeMountPatchImplementationAuthorizationGranted = false",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "implementationExecutionApproved = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "nextPhaseRequiresPatchImplementationAuthorizationDecision = true",
    "nextPhaseRequiresActualPatchImplementationApproval = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro5bDoc = readRequired(ORO5B_DOC);
  const oro5bHelper = readRequired(
    "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary.js"
  );
  assert(
    oro5bDoc.includes("ORO-5B Route Mount Final Execution Approval Decision Boundary"),
    "ORO-5B doc missing final execution boundary."
  );
  assert(
    oro5bHelper.includes("buildOro5bRouteMountFinalExecutionApprovalDecisionInput"),
    "ORO-5B helper missing input builder."
  );
  assert(doc.includes("final execution approval decision"), "ORO-5B decision missing.");
  assert(doc.includes("patch implementation authorization request"), "request missing.");
  assert(doc.includes("decision pending"), "pending decision missing.");
  assert(doc.includes("patch implementation hold remains closed"), "patch hold missing.");
  assert(doc.includes("ORO-5C mount hold remains closed"), "mount hold missing.");
  assert(doc.includes("ORO-5C does not allow runtime traffic"), "traffic hold missing.");

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5c", "oro-5c"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5C implementation request",
        "ORO-5C mount hold",
        "patch authorization request submitted",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5C Current",
        "ORO-5C implementation request",
        "routeMountPatchImplementationAuthorizationRequestStatus=submitted_pending_decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5C implementation request",
        "ORO-5C mount hold",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5C Route Mount Patch Implementation Authorization Request Coverage",
        SCRIPT,
        "patch authorization request submitted",
      ],
    ],
    [ORO5B_DOC, ["ORO-5C implementation request", "ORO-5C mount hold"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro5bDecision() {
  const summary =
    oro5b.evaluateOro5bRouteMountFinalExecutionApprovalDecision();
  assert.strictEqual(summary.routeMountFinalExecutionApprovalDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestStatus, DECISION_ISSUED);
  assert.strictEqual(summary.routeMountExecutionApprovalDecisionIssued, true);
  assert.strictEqual(
    summary.routeMountExecutionApprovalDecisionResult,
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountPatchReviewDecisionAcknowledged, true);
  assert.strictEqual(
    summary.routeMountPatchReviewResult,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(summary.executionApprovalDecisionIssued, true);
  assert.strictEqual(summary.executionApprovalGranted, true);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5C");
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestSubmissionResult,
    PASS
  );
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestStatus, DECISION_ISSUED);
  assert.strictEqual(summary.routeMountExecutionApprovalDecisionIssued, true);
  assert.strictEqual(
    summary.routeMountExecutionApprovalDecisionResult,
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.executionApprovalDecisionIssued, true);
  assert.strictEqual(summary.executionApprovalGranted, true);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestResult,
    PENDING_DECISION
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionIssued,
    false
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationGranted,
    false
  );
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.srcAppJsEditAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(
    summary.nextPhaseRequiresPatchImplementationAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresActualPatchImplementationApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestSubmissionResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorizationRequestStatus, "HOLD");
  assert.strictEqual(summary.routeMountPatchImplementationAuthorizationRequestResult, "HOLD");
  assert.strictEqual(summary.routeMountPatchImplementationAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures =
    buildOro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathPatchImplementationAuthorizationRequestSubmittedFixture",
    "missingOro5bFinalExecutionDecisionFixture",
    "executionApprovalDecisionNotIssuedFixture",
    "executionApprovalNotGrantedFixture",
    "wrongExecutionDecisionResultFixture",
    "wrongRouteMountExecutionAuthorizationFixture",
    "patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture",
    "patchImplementationAuthorizationDecisionAlreadyIssuedFixture",
    "patchApprovedIncorrectlyFixture",
    "patchImplementationAuthorizedIncorrectlyFixture",
    "patchImplementedIncorrectlyFixture",
    "implementationExecutionIncorrectlyApprovedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "expressMountAllowedTrueFixture",
    "expressMountImplementedTrueFixture",
    "publicAliasAllowedTrueFixture",
    "runtimeTrafficAllowedTrueFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRouteControllerRuntimeChangeFixture",
    "attemptedExpressMountImplementationFixture",
    "attemptedPublicAliasAuthorizationFixture",
    "attemptedRuntimeTrafficAuthorizationFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedDbTransactionFixture",
    "attemptedMigrationFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture",
    "requestSkipsPatchImplementationAuthorizationDecisionFixture",
    "runtimeTrafficCorrectlyRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5cRouteMountPatchImplementationAuthorizationRequestInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
    "function"
  );
  assert.strictEqual(typeof buildOro5cPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5cRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5cRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(
    typeof buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro5bDecision();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      happyPathPatchImplementationAuthorizationRequestSubmittedFixture
    )
  );
  assertHappyPath(
    buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary(
      decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture
    )
  );
  assertHappyPath(
    buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary(
      runtimeTrafficCorrectlyRequiresSeparateApprovalFixture
    )
  );

  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      missingOro5bFinalExecutionDecisionFixture
    ),
    "ORO-5B final execution decision is required"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      executionApprovalDecisionNotIssuedFixture
    ),
    "execution approval decision must be issued"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      executionApprovalNotGrantedFixture
    ),
    "execution approval must be granted for request submission"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      wrongExecutionDecisionResultFixture
    ),
    "execution approval decision result must be request only"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      wrongRouteMountExecutionAuthorizationFixture
    ),
    "route mount execution authorization must be request only"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture
    ),
    "patch implementation authorization request already submitted with conflicting state"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      patchImplementationAuthorizationDecisionAlreadyIssuedFixture
    ),
    "patch implementation authorization decision must not be issued"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      patchApprovedIncorrectlyFixture
    ),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      patchImplementationAuthorizedIncorrectlyFixture
    ),
    "patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      patchImplementedIncorrectlyFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      expressMountAllowedTrueFixture
    ),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      publicAliasAllowedTrueFixture
    ),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      runtimeTrafficAllowedTrueFixture
    ),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedSrcAppJsEditFixture
    ),
    "request submission must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "request submission must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedExpressMountImplementationFixture
    ),
    "request submission must not implement Express mount"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedPublicAliasAuthorizationFixture
    ),
    "request submission must not authorize public alias"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedRuntimeTrafficAuthorizationFixture
    ),
    "request submission must not authorize runtime traffic"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedWalletMutationFixture
    ),
    "request submission must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedLedgerMutationFixture
    ),
    "request submission must not try ledger mutation"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedPrismaWriteFixture
    ),
    "request submission must not try Prisma write"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedDbTransactionFixture
    ),
    "request submission must not try DB transaction"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedMigrationFixture
    ),
    "request submission must not try migration"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      attemptedExternalNetworkFixture
    ),
    "request submission must not try external network"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      secretShapedOutputFixture
    ),
    "request submission output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
      requestSkipsPatchImplementationAuthorizationDecisionFixture
    ),
    "request submission must not skip authorization decision"
  );

  const patchGate = buildOro5cPatchImplementationStillHeldGate();
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationRequestSubmitted,
    true
  );
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationRequestResult,
    PENDING_DECISION
  );
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationDecisionIssued,
    false
  );
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationGranted,
    false
  );
  assert.strictEqual(patchGate.routeMountPatchApproved, false);
  assert.strictEqual(patchGate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.routeMountPatchImplemented, false);
  assert.strictEqual(patchGate.implementationExecutionApproved, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresPatchImplementationAuthorizationDecision,
    true
  );
  assert.strictEqual(patchGate.nextPhaseRequiresActualPatchImplementationApproval, true);
  assert.strictEqual(patchGate.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);

  const mountGate = buildOro5cRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5cRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);

  const validation =
    validateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures().map(
      evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission
    );
  assert(allReports.length >= 30, "fixture set must cover ORO-5C required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountPatchApproved, false);
    assert.strictEqual(report.routeMountPatchImplementationAuthorized, false);
    assert.strictEqual(report.routeMountPatchImplemented, false);
    assert.strictEqual(report.implementationExecutionApproved, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.expressMountImplemented, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.walletMutationAllowed, false);
    assert.strictEqual(report.ledgerMutationAllowed, false);
    assert.strictEqual(report.prismaWriteAllowed, false);
    assert.strictEqual(report.dbTransactionAllowed, false);
    assert.strictEqual(report.migrationAllowed, false);
    assert.strictEqual(report.externalNetworkAllowed, false);
    assert.strictEqual(
      report.nextPhaseRequiresPatchImplementationAuthorizationDecision,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresActualPatchImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5C implementation request smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5C implementation request smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
