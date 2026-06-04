"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission");
const fixtures = require("../game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmissionFixtures");
const oro4z = require("../game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary");

const {
  NOT_AUTHORIZED_FOR_EXECUTION,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_STATUS,
  PASS,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  SUBMITTED_PENDING_DECISION,
  buildOro5aRouteMountExecutionApprovalRequestInput,
  evaluateOro5aRouteMountExecutionApprovalRequestSubmission,
  buildOro5aPatchImplementationHoldGate,
  buildOro5aRouteMountExecutionApprovalRequestSummary,
  validateOro5aRouteMountExecutionApprovalRequestSubmission,
} = helper;

const {
  attemptedDbTransactionFixture,
  attemptedExternalNetworkFixture,
  attemptedExpressMountImplementationFixture,
  attemptedLedgerMutationFixture,
  attemptedMigrationFixture,
  attemptedPrismaWriteFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro5aRouteMountExecutionApprovalRequestSubmissionFixtures,
  executionApprovalDecisionIncorrectlyIssuedFixture,
  executionApprovalIncorrectlyGrantedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathExecutionApprovalRequestSubmittedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro4zPatchReviewDecisionFixture,
  oro4zDecisionFailedFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  patchReviewDecisionNotIssuedFixture,
  patchReviewResultWrongFixture,
  publicAliasAllowedTrueFixture,
  requestCannotBeFinalExecutionApprovalFixture,
  requestRequiresFinalExecutionApprovalDecisionFixture,
  requestRequiresPatchImplementationApprovalFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_SUBMISSION.md";
const ORO4Z_DOC = "docs/ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_DECISION_BOUNDARY.md";
const ORO4Y_DOC = "docs/ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_READINESS.md";
const ORO4X_DOC = "docs/ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const ORO4W_DOC = "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md";
const ORO4V_DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5aSmoke.js";
const SCRIPT = "smoke:oro-5a";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4Z_DOC,
  ORO4Y_DOC,
  ORO4X_DOC,
  ORO4W_DOC,
  ORO4V_DOC,
  "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission.js",
  "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmissionFixtures.js",
  "src/local-smoke-tests/oro5aRouteMountExecutionApprovalRequestSubmissionSmoke.js",
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
    "ORO-5A",
    "oro5a",
    "RouteMountExecutionApprovalRequest",
    SUBMITTED_PENDING_DECISION,
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
    "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmissionFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5A files must not contain ${marker}.`);
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
    "## ORO-5A scope",
    "## Input from ORO-4Z",
    "## Execution approval request submission rules",
    "## Patch implementation authorization still held gate",
    "## Execution decision still pending gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4Z patch review decision has been recorded",
    "ORO-4Z result is ready for execution approval request only",
    "ORO-5A records execution approval request submission only",
    "ORO-5A does not issue final execution approval decision",
    "ORO-5A does not grant execution approval",
    "ORO-5A does not approve patch implementation",
    "ORO-5A does not implement route mount patch",
    "ORO-5A does not edit src/app.js",
    "ORO-5A does not mount Express route",
    "ORO-5A does not enable public alias",
    "ORO-5A does not allow runtime traffic",
    "ORO-5A does not mutate wallet/ledger",
    "ORO-5A does not write Prisma/DB",
    "ORO-5A does not call live OroPlay API",
    "routeMountAuthorization remains not_authorized_for_mount",
    "routeMountExecutionAuthorization remains not_authorized_for_execution",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "executionApprovalGranted = false",
    "implementationExecutionApproved = false",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro4zDoc = readRequired(ORO4Z_DOC);
  const oro4zHelper = readRequired(
    "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary.js"
  );
  assert(
    oro4zDoc.includes("ORO-4Z Route Mount Patch Review Decision Boundary"),
    "ORO-4Z doc missing decision boundary."
  );
  assert(
    oro4zHelper.includes("buildOro4zRouteMountPatchReviewInput"),
    "ORO-4Z helper missing input builder."
  );

  for (const [file, markers] of [
    [
      ORO4Z_DOC,
      [
        "ORO-5A execution approval request",
        "ORO-5A patch implementation hold",
      ],
    ],
    [ORO4Y_DOC, ["ORO-5A execution approval request"]],
    [ORO4X_DOC, ["ORO-5A execution approval request"]],
    [ORO4W_DOC, ["ORO-5A execution approval request"]],
    [ORO4V_DOC, ["ORO-5A execution approval request"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5a", "oro-5a"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5A execution approval request",
        "ORO-5A patch implementation hold",
        "routeMountExecutionApprovalRequestSubmitted=true",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5A Current",
        "execution approval request submitted",
        "routeMountExecutionApprovalRequestStatus=submitted_pending_decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5A execution approval request",
        "ORO-5A patch implementation hold",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5A Route Mount Execution Approval Request Coverage",
        SCRIPT,
        "execution approval request submitted",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro4zDecision() {
  const summary = oro4z.evaluateOro4zRouteMountPatchReviewDecisionBoundary();
  assert.strictEqual(summary.routeMountPatchReviewDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountPatchReviewDecisionIssued, true);
  assert.strictEqual(summary.routeMountPatchReviewed, true);
  assert.strictEqual(
    summary.routeMountPatchReviewResult,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    NOT_AUTHORIZED_FOR_EXECUTION
  );
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5A");
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmissionResult, PASS);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(
    summary.routeMountExecutionApprovalRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(summary.routeMountPatchReviewDecisionAcknowledged, true);
  assert.strictEqual(summary.routeMountPatchReviewDecisionIssued, true);
  assert.strictEqual(summary.routeMountPatchReviewed, true);
  assert.strictEqual(
    summary.routeMountPatchReviewResult,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(summary.executionApprovalDecisionIssued, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    NOT_AUTHORIZED_FOR_EXECUTION
  );
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
  assert.strictEqual(summary.nextPhaseRequiresFinalExecutionApprovalDecision, true);
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationApproval,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.routeMountExecutionApprovalRequestSubmissionResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, false);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestStatus, "HOLD");
  assert.strictEqual(summary.routeMountPatchReviewDecisionAcknowledged, false);
  assert.strictEqual(summary.executionApprovalDecisionIssued, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    NOT_AUTHORIZED_FOR_EXECUTION
  );
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
  const allFixtures = buildOro5aRouteMountExecutionApprovalRequestSubmissionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathExecutionApprovalRequestSubmittedFixture",
    "missingOro4zPatchReviewDecisionFixture",
    "oro4zDecisionFailedFixture",
    "patchReviewDecisionNotIssuedFixture",
    "patchReviewResultWrongFixture",
    "patchApprovedIncorrectlyFixture",
    "patchImplementationAuthorizedIncorrectlyFixture",
    "patchImplementedIncorrectlyFixture",
    "executionApprovalIncorrectlyGrantedFixture",
    "executionApprovalDecisionIncorrectlyIssuedFixture",
    "implementationExecutionIncorrectlyApprovedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
    "expressMountAllowedTrueFixture",
    "expressMountImplementedTrueFixture",
    "publicAliasAllowedTrueFixture",
    "runtimeTrafficAllowedTrueFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRouteControllerRuntimeChangeFixture",
    "attemptedExpressMountImplementationFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedDbTransactionFixture",
    "attemptedMigrationFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "requestRequiresFinalExecutionApprovalDecisionFixture",
    "requestCannotBeFinalExecutionApprovalFixture",
    "requestRequiresPatchImplementationApprovalFixture",
    "runtimeTrafficRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5aRouteMountExecutionApprovalRequestInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5aRouteMountExecutionApprovalRequestSubmission,
    "function"
  );
  assert.strictEqual(typeof buildOro5aPatchImplementationHoldGate, "function");
  assert.strictEqual(
    typeof buildOro5aRouteMountExecutionApprovalRequestSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5aRouteMountExecutionApprovalRequestSubmission,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro4zDecision();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
    happyPathExecutionApprovalRequestSubmittedFixture
  ));
  assertHappyPath(buildOro5aRouteMountExecutionApprovalRequestSummary(
    requestRequiresFinalExecutionApprovalDecisionFixture
  ));
  assertHappyPath(buildOro5aRouteMountExecutionApprovalRequestSummary(
    runtimeTrafficRequiresSeparateApprovalFixture
  ));

  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      missingOro4zPatchReviewDecisionFixture
    ),
    "ORO-4Z patch review decision is required"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      oro4zDecisionFailedFixture
    ),
    "ORO-4Z patch review decision result must be PASS"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      patchReviewDecisionNotIssuedFixture
    ),
    "route mount patch review decision must be issued"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      patchReviewResultWrongFixture
    ),
    "route mount patch review result must be request only"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      patchApprovedIncorrectlyFixture
    ),
    "route mount patch must not be approved by request submission"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      patchImplementationAuthorizedIncorrectlyFixture
    ),
    "patch implementation must not be authorized by request submission"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      patchImplementedIncorrectlyFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      executionApprovalIncorrectlyGrantedFixture
    ),
    "execution approval must not be granted by request submission"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      executionApprovalDecisionIncorrectlyIssuedFixture
    ),
    "execution approval decision must remain pending"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      routeMountExecutionAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount execution authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      expressMountAllowedTrueFixture
    ),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      publicAliasAllowedTrueFixture
    ),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      runtimeTrafficAllowedTrueFixture
    ),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedSrcAppJsEditFixture
    ),
    "request submission must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "request submission must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedExpressMountImplementationFixture
    ),
    "request submission must not implement Express mount"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedWalletMutationFixture
    ),
    "request submission must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedLedgerMutationFixture
    ),
    "request submission must not try ledger mutation"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedPrismaWriteFixture
    ),
    "request submission must not try Prisma write"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedDbTransactionFixture
    ),
    "request submission must not try DB transaction"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedMigrationFixture
    ),
    "request submission must not try migration"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      attemptedExternalNetworkFixture
    ),
    "request submission must not try external network"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(secretShapedOutputFixture),
    "request submission output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      requestCannotBeFinalExecutionApprovalFixture
    ),
    "request submission must not be final execution approval"
  );
  assertHeld(
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
      requestRequiresPatchImplementationApprovalFixture
    ),
    "request submission must not skip patch implementation approval"
  );

  const gate = buildOro5aPatchImplementationHoldGate();
  assert.strictEqual(gate.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(
    gate.routeMountExecutionApprovalRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(gate.routeMountPatchReviewDecisionAcknowledged, true);
  assert.strictEqual(gate.executionApprovalDecisionIssued, false);
  assert.strictEqual(gate.executionApprovalGranted, false);
  assert.strictEqual(gate.routeMountPatchApproved, false);
  assert.strictEqual(gate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(gate.routeMountPatchImplemented, false);
  assert.strictEqual(gate.implementationExecutionApproved, false);
  assert.strictEqual(gate.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);
  assert.strictEqual(gate.nextPhaseRequiresFinalExecutionApprovalDecision, true);
  assert.strictEqual(gate.nextPhaseRequiresActualPatchImplementationApproval, true);
  assert.strictEqual(gate.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);

  const validation = validateOro5aRouteMountExecutionApprovalRequestSubmission();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5aRouteMountExecutionApprovalRequestSubmissionFixtures().map(
      evaluateOro5aRouteMountExecutionApprovalRequestSubmission
    );
  assert(allReports.length >= 30, "fixture set must cover ORO-5A required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.executionApprovalDecisionIssued, false);
    assert.strictEqual(report.executionApprovalGranted, false);
    assert.strictEqual(report.routeMountPatchApproved, false);
    assert.strictEqual(report.routeMountPatchImplementationAuthorized, false);
    assert.strictEqual(report.routeMountPatchImplemented, false);
    assert.strictEqual(report.implementationExecutionApproved, false);
    assert.strictEqual(report.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
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
    assert.strictEqual(report.nextPhaseRequiresFinalExecutionApprovalDecision, true);
    assert.strictEqual(report.nextPhaseRequiresActualPatchImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5A execution approval request smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5A execution approval request smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
