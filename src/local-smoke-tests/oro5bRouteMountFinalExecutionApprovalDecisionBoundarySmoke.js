"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundaryFixtures");
const oro5a = require("../game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission");

const {
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_EXECUTION,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_STATUS,
  PASS,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  SUBMITTED_PENDING_DECISION,
  buildOro5bRouteMountFinalExecutionApprovalDecisionInput,
  evaluateOro5bRouteMountFinalExecutionApprovalDecision,
  buildOro5bPatchImplementationStillHeldGate,
  buildOro5bRouteMountStillHeldGate,
  buildOro5bRouteMountFinalExecutionApprovalDecisionSummary,
  validateOro5bRouteMountFinalExecutionApprovalDecision,
} = helper;

const {
  attemptedDbTransactionFixture,
  attemptedExternalNetworkFixture,
  attemptedLedgerMutationFixture,
  attemptedMigrationFixture,
  attemptedPrismaWriteFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro5bRouteMountFinalExecutionApprovalDecisionFixtures,
  decisionRequiresPatchImplementationAuthorizationRequestFixture,
  decisionSkipsPatchImplementationAuthorizationRequestFixture,
  executionDecisionAlreadyIssuedFixture,
  executionDecisionTriesPatchImplementationApprovalFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathFinalExecutionApprovalDecisionIssuedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro5aRequestFixture,
  oro5aRequestNotSubmittedFixture,
  oro5aStatusNotPendingFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  publicAliasAllowedTrueFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationWrongFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_BOUNDARY.md";
const ORO5A_DOC = "docs/ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_SUBMISSION.md";
const WRAPPER = "src/local-smoke-tests/oro5bSmoke.js";
const SCRIPT = "smoke:oro-5b";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5A_DOC,
  "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5bRouteMountFinalExecutionApprovalDecisionBoundarySmoke.js",
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
  for (const marker of ["ORO-5B", "oro5b", DECISION_ISSUED]) {
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
    "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5bRouteMountFinalExecutionApprovalDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5B files must not contain ${marker}.`);
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
    "## ORO-5B scope",
    "## Input from ORO-5A",
    "## Final execution approval decision rules",
    "## Patch implementation authorization still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5A execution approval request has been submitted",
    "ORO-5A status is submitted_pending_decision",
    "ORO-5B records final execution approval decision only",
    "ORO-5B may approve execution only for the next patch implementation",
    "ORO-5B does not approve patch implementation",
    "ORO-5B does not implement route mount patch",
    "ORO-5B does not edit src/app.js",
    "ORO-5B does not mount Express route",
    "ORO-5B does not enable public alias",
    "ORO-5B does not allow runtime traffic",
    "ORO-5B does not mutate wallet/ledger",
    "ORO-5B does not write Prisma/DB",
    "ORO-5B does not call live OroPlay API",
    "routeMountExecutionApprovalRequestStatus = decision_issued",
    "routeMountExecutionApprovalDecisionIssued = true",
    "executionApprovalDecisionIssued = true",
    "executionApprovalGranted = true",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "implementationExecutionApproved = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro5aDoc = readRequired(ORO5A_DOC);
  const oro5aHelper = readRequired(
    "src/game-provider-mock/oro5aRouteMountExecutionApprovalRequestSubmission.js"
  );
  assert(
    oro5aDoc.includes("ORO-5A Route Mount Execution Approval Request Submission"),
    "ORO-5A doc missing request boundary."
  );
  assert(
    oro5aHelper.includes("buildOro5aRouteMountExecutionApprovalRequestInput"),
    "ORO-5A helper missing input builder."
  );
  assert(doc.includes("ORO-5A execution approval request"), "ORO-5A request missing.");
  assert(doc.includes("final execution approval decision"), "decision text missing.");
  assert(doc.includes("implementation hold remains closed"), "patch hold missing.");
  assert(doc.includes("route mount authorization remains closed"), "mount hold missing.");

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5b", "oro-5b"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5B execution decision",
        "ORO-5B implementation hold",
        "routeMountExecutionApprovalRequestStatus=decision_issued",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5B Current",
        "ORO-5B execution decision",
        "routeMountExecutionApprovalRequestStatus=decision_issued",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5B execution decision",
        "ORO-5B implementation hold",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5B Route Mount Final Execution Approval Decision Coverage",
        SCRIPT,
        "final execution approval decision",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro5aRequest() {
  const summary =
    oro5a.evaluateOro5aRouteMountExecutionApprovalRequestSubmission();
  assert.strictEqual(
    summary.routeMountExecutionApprovalRequestSubmissionResult,
    PASS
  );
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(
    summary.routeMountExecutionApprovalRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(summary.routeMountPatchReviewDecisionAcknowledged, true);
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
  assert.strictEqual(summary.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5B");
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
  assert.strictEqual(summary.srcAppJsEditAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.nextPhaseRequiresPatchImplementationAuthorizationRequest, true);
  assert.strictEqual(summary.nextPhaseRequiresActualPatchImplementationApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.routeMountFinalExecutionApprovalDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestSubmitted, false);
  assert.strictEqual(summary.routeMountExecutionApprovalRequestStatus, "HOLD");
  assert.strictEqual(summary.routeMountExecutionApprovalDecisionIssued, false);
  assert.strictEqual(summary.routeMountExecutionApprovalDecisionResult, "HOLD");
  assert.strictEqual(summary.executionApprovalDecisionIssued, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
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
  const allFixtures = buildOro5bRouteMountFinalExecutionApprovalDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathFinalExecutionApprovalDecisionIssuedFixture",
    "missingOro5aRequestFixture",
    "oro5aRequestNotSubmittedFixture",
    "oro5aStatusNotPendingFixture",
    "executionDecisionAlreadyIssuedFixture",
    "executionDecisionTriesPatchImplementationApprovalFixture",
    "patchApprovedIncorrectlyFixture",
    "patchImplementationAuthorizedIncorrectlyFixture",
    "patchImplementedIncorrectlyFixture",
    "implementationExecutionIncorrectlyApprovedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "routeMountExecutionAuthorizationWrongFixture",
    "expressMountAllowedTrueFixture",
    "expressMountImplementedTrueFixture",
    "publicAliasAllowedTrueFixture",
    "runtimeTrafficAllowedTrueFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRouteControllerRuntimeChangeFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedDbTransactionFixture",
    "attemptedMigrationFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "decisionRequiresPatchImplementationAuthorizationRequestFixture",
    "decisionSkipsPatchImplementationAuthorizationRequestFixture",
    "runtimeTrafficRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5bRouteMountFinalExecutionApprovalDecisionInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5bRouteMountFinalExecutionApprovalDecision,
    "function"
  );
  assert.strictEqual(typeof buildOro5bPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5bRouteMountStillHeldGate, "function");
  assert.strictEqual(
    typeof buildOro5bRouteMountFinalExecutionApprovalDecisionSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5bRouteMountFinalExecutionApprovalDecision,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro5aRequest();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro5bRouteMountFinalExecutionApprovalDecision(
    happyPathFinalExecutionApprovalDecisionIssuedFixture
  ));
  assertHappyPath(buildOro5bRouteMountFinalExecutionApprovalDecisionSummary(
    decisionRequiresPatchImplementationAuthorizationRequestFixture
  ));
  assertHappyPath(buildOro5bRouteMountFinalExecutionApprovalDecisionSummary(
    runtimeTrafficRequiresSeparateApprovalFixture
  ));

  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(missingOro5aRequestFixture),
    "ORO-5A request submission is required"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(oro5aRequestNotSubmittedFixture),
    "ORO-5A request must be submitted"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(oro5aStatusNotPendingFixture),
    "ORO-5A request status must be submitted_pending_decision"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      executionDecisionAlreadyIssuedFixture
    ),
    "execution approval decision must not be previously issued"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      executionDecisionTriesPatchImplementationApprovalFixture
    ),
    "execution decision must not approve patch implementation"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(patchApprovedIncorrectlyFixture),
    "route mount patch must not be approved by final decision"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      patchImplementationAuthorizedIncorrectlyFixture
    ),
    "patch implementation must not be authorized by final decision"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(patchImplementedIncorrectlyFixture),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      routeMountExecutionAuthorizationWrongFixture
    ),
    "route mount execution authorization must be next request only"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(expressMountAllowedTrueFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(publicAliasAllowedTrueFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(runtimeTrafficAllowedTrueFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedSrcAppJsEditFixture),
    "final decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "final decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedWalletMutationFixture),
    "final decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedLedgerMutationFixture),
    "final decision must not try ledger mutation"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedPrismaWriteFixture),
    "final decision must not try Prisma write"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedDbTransactionFixture),
    "final decision must not try DB transaction"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedMigrationFixture),
    "final decision must not try migration"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(attemptedExternalNetworkFixture),
    "final decision must not try external network"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(secretShapedOutputFixture),
    "final decision output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro5bRouteMountFinalExecutionApprovalDecision(
      decisionSkipsPatchImplementationAuthorizationRequestFixture
    ),
    "final decision must require patch implementation authorization request"
  );

  const patchGate = buildOro5bPatchImplementationStillHeldGate();
  assert.strictEqual(patchGate.routeMountExecutionApprovalRequestSubmitted, true);
  assert.strictEqual(patchGate.routeMountExecutionApprovalRequestStatus, DECISION_ISSUED);
  assert.strictEqual(patchGate.routeMountExecutionApprovalDecisionIssued, true);
  assert.strictEqual(patchGate.executionApprovalDecisionIssued, true);
  assert.strictEqual(patchGate.executionApprovalGranted, true);
  assert.strictEqual(
    patchGate.routeMountExecutionAuthorization,
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(patchGate.routeMountPatchApproved, false);
  assert.strictEqual(patchGate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.routeMountPatchImplemented, false);
  assert.strictEqual(patchGate.implementationExecutionApproved, false);
  assert.strictEqual(patchGate.nextPhaseRequiresPatchImplementationAuthorizationRequest, true);
  assert.strictEqual(patchGate.nextPhaseRequiresActualPatchImplementationApproval, true);
  assert.strictEqual(patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);

  const mountGate = buildOro5bRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);
  assert.strictEqual(mountGate.runtimeTrafficAllowed, false);

  const validation = validateOro5bRouteMountFinalExecutionApprovalDecision();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5bRouteMountFinalExecutionApprovalDecisionFixtures().map(
      evaluateOro5bRouteMountFinalExecutionApprovalDecision
    );
  assert(allReports.length >= 28, "fixture set must cover ORO-5B required cases.");
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
    assert.strictEqual(report.nextPhaseRequiresPatchImplementationAuthorizationRequest, true);
    assert.strictEqual(report.nextPhaseRequiresActualPatchImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5B final execution approval decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5B final execution approval decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
