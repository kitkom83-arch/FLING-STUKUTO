"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundaryFixtures");
const oro5c = require("../game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission");

const {
  APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
  PASS,
  PENDING_DECISION,
  SUBMITTED_PENDING_DECISION,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput,
  evaluateOro5dRouteMountPatchImplementationAuthorizationDecision,
  buildOro5dActualPatchImplementationStillHeldGate,
  buildOro5dRouteMountStillHeldGate,
  buildOro5dRuntimeTrafficStillHeldGate,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary,
  validateOro5dRouteMountPatchImplementationAuthorizationDecision,
} = helper;

const {
  actualPatchImplementationApprovalAlreadyGrantedFixture,
  actualPatchImplementationApprovalAlreadyIssuedFixture,
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
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionFixtures,
  decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture,
  executionApprovalDecisionMissingFixture,
  executionApprovalNotGrantedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathPatchImplementationAuthorizationDecisionIssuedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro5cRequestFixture,
  oro5cRequestNotSubmittedFixture,
  oro5cStatusNotPendingFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
  patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture,
  patchImplementedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  publicAliasAllowedTrueFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountCorrectlyRequiresSeparateAuthorizationFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
  wrongOro5cRequestResultFixture,
  wrongRouteMountExecutionAuthorizationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5C_DOC =
  "docs/ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION.md";
const ORO5C_HELPER =
  "src/game-provider-mock/oro5cRouteMountPatchImplementationAuthorizationRequestSubmission.js";
const WRAPPER = "src/local-smoke-tests/oro5dSmoke.js";
const SCRIPT = "smoke:oro-5d";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5C_DOC,
  "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundarySmoke.js",
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
    "ORO-5D",
    "oro5d",
    "routeMountPatchImplementationAuthorizationDecision",
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
    "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5dRouteMountPatchImplementationAuthorizationDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5D files must not contain ${marker}.`);
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
    "## ORO-5D scope",
    "## Input from ORO-5C",
    "## Patch implementation authorization decision rules",
    "## Actual patch implementation approval still pending gate",
    "## Patch implementation still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5C patch implementation authorization request has been submitted",
    "ORO-5C status is submitted_pending_decision",
    "ORO-5D records patch implementation authorization decision only",
    "ORO-5D may approve only the next actual patch implementation approval request",
    "ORO-5D does not approve actual patch implementation",
    "ORO-5D does not implement route mount patch",
    "ORO-5D does not edit src/app.js",
    "ORO-5D does not mount Express route",
    "ORO-5D does not enable public alias",
    "ORO-5D does not allow runtime traffic",
    "ORO-5D does not mutate wallet/ledger",
    "ORO-5D does not write Prisma/DB",
    "ORO-5D does not call live OroPlay API",
    "future actual patch implementation approval requires separate explicit approval",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "routeMountPatchImplementationAuthorizationRequestSubmitted = true",
    "routeMountPatchImplementationAuthorizationRequestStatus = decision_issued",
    "routeMountPatchImplementationAuthorizationRequestResult = approved_for_actual_patch_implementation_approval_request_only",
    "routeMountPatchImplementationAuthorizationDecisionIssued = true",
    "routeMountPatchImplementationAuthorizationDecisionResult = approved_for_actual_patch_implementation_approval_request_only",
    "routeMountPatchImplementationAuthorizationGranted = true",
    "routeMountPatchImplementationAuthorization = authorized_for_actual_patch_implementation_approval_request_only",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "implementationExecutionApproved = false",
    "actualPatchImplementationApprovalIssued = false",
    "actualPatchImplementationApprovalGranted = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "nextPhaseRequiresActualPatchImplementationApprovalRequest = true",
    "nextPhaseRequiresActualPatchImplementationApprovalDecision = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro5cDoc = readRequired(ORO5C_DOC);
  const oro5cHelper = readRequired(ORO5C_HELPER);
  assert(
    oro5cDoc.includes("ORO-5C Route Mount Patch Implementation Authorization Request"),
    "ORO-5C doc missing request boundary."
  );
  assert(
    oro5cHelper.includes("buildOro5cRouteMountPatchImplementationAuthorizationRequestInput"),
    "ORO-5C helper missing input builder."
  );
  assert(doc.includes("patch implementation authorization decision"), "decision missing.");
  assert(
    doc.includes("actual patch implementation approval still pending"),
    "actual approval pending marker missing."
  );
  assert(doc.includes("patch implementation hold remains closed"), "patch hold missing.");
  assert(doc.includes("ORO-5D mount hold remains closed"), "mount hold missing.");
  assert(doc.includes("ORO-5D does not allow runtime traffic"), "traffic hold missing.");

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5d", "oro-5d"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5D implementation decision",
        "ORO-5D mount hold",
        "actual patch approval request only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5D Current",
        "ORO-5D implementation decision",
        "routeMountPatchImplementationAuthorizationRequestStatus=decision_issued",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5D implementation decision",
        "ORO-5D mount hold",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5D Route Mount Patch Implementation Authorization Decision Coverage",
        SCRIPT,
        "actual patch approval request only",
      ],
    ],
    [ORO5C_DOC, ["ORO-5D implementation decision", "ORO-5D mount hold"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro5cRequest() {
  const summary =
    oro5c.evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission();
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
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5D");
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionBoundaryResult,
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
    DECISION_ISSUED
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationRequestResult,
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionResult,
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationGranted,
    true
  );
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorization,
    AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalIssued, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, false);
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
    summary.nextPhaseRequiresActualPatchImplementationApprovalRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationApprovalDecision,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionBoundaryResult,
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
  assert.strictEqual(summary.actualPatchImplementationApprovalIssued, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, false);
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
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathPatchImplementationAuthorizationDecisionIssuedFixture",
    "missingOro5cRequestFixture",
    "oro5cRequestNotSubmittedFixture",
    "oro5cStatusNotPendingFixture",
    "wrongOro5cRequestResultFixture",
    "executionApprovalDecisionMissingFixture",
    "executionApprovalNotGrantedFixture",
    "wrongRouteMountExecutionAuthorizationFixture",
    "patchImplementationAuthorizationDecisionAlreadyIssuedFixture",
    "patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture",
    "patchApprovedIncorrectlyFixture",
    "patchImplementationAuthorizedIncorrectlyFixture",
    "patchImplementedIncorrectlyFixture",
    "actualPatchImplementationApprovalAlreadyIssuedFixture",
    "actualPatchImplementationApprovalAlreadyGrantedFixture",
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
    "decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture",
    "routeMountCorrectlyRequiresSeparateAuthorizationFixture",
    "runtimeTrafficCorrectlyRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro5dRouteMountPatchImplementationAuthorizationDecision,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5dActualPatchImplementationStillHeldGate,
    "function"
  );
  assert.strictEqual(typeof buildOro5dRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5dRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(
    typeof buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5dRouteMountPatchImplementationAuthorizationDecision,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro5cRequest();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      happyPathPatchImplementationAuthorizationDecisionIssuedFixture
    )
  );
  assertHappyPath(
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(
      decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture
    )
  );
  assertHappyPath(
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(
      routeMountCorrectlyRequiresSeparateAuthorizationFixture
    )
  );
  assertHappyPath(
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(
      runtimeTrafficCorrectlyRequiresSeparateApprovalFixture
    )
  );

  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      missingOro5cRequestFixture
    ),
    "ORO-5C patch implementation authorization request is required"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      oro5cRequestNotSubmittedFixture
    ),
    "ORO-5C request must be submitted"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      oro5cStatusNotPendingFixture
    ),
    "ORO-5C request status must be submitted_pending_decision"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      wrongOro5cRequestResultFixture
    ),
    "ORO-5C request result must be pending_decision"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      executionApprovalDecisionMissingFixture
    ),
    "execution approval decision must be issued"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      executionApprovalNotGrantedFixture
    ),
    "execution approval must be granted for authorization decision"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      wrongRouteMountExecutionAuthorizationFixture
    ),
    "route mount execution authorization must be request only"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      patchImplementationAuthorizationDecisionAlreadyIssuedFixture
    ),
    "patch implementation authorization decision already issued"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture
    ),
    "authorization decision must not approve actual implementation"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      patchApprovedIncorrectlyFixture
    ),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      patchImplementationAuthorizedIncorrectlyFixture
    ),
    "actual patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      patchImplementedIncorrectlyFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      actualPatchImplementationApprovalAlreadyIssuedFixture
    ),
    "actual patch implementation approval must not be issued"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      actualPatchImplementationApprovalAlreadyGrantedFixture
    ),
    "actual patch implementation approval must not be granted"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      expressMountAllowedTrueFixture
    ),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      publicAliasAllowedTrueFixture
    ),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      runtimeTrafficAllowedTrueFixture
    ),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedSrcAppJsEditFixture
    ),
    "authorization decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "authorization decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedExpressMountImplementationFixture
    ),
    "authorization decision must not implement Express mount"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedPublicAliasAuthorizationFixture
    ),
    "authorization decision must not authorize public alias"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedRuntimeTrafficAuthorizationFixture
    ),
    "authorization decision must not authorize runtime traffic"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedWalletMutationFixture
    ),
    "authorization decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedLedgerMutationFixture
    ),
    "authorization decision must not try ledger mutation"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedPrismaWriteFixture
    ),
    "authorization decision must not try Prisma write"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedDbTransactionFixture
    ),
    "authorization decision must not try DB transaction"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedMigrationFixture
    ),
    "authorization decision must not try migration"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      attemptedExternalNetworkFixture
    ),
    "authorization decision must not try external network"
  );
  assertHeld(
    evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
      secretShapedOutputFixture
    ),
    "authorization decision output contains secret-shaped marker"
  );

  const patchGate = buildOro5dActualPatchImplementationStillHeldGate();
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationDecisionIssued,
    true
  );
  assert.strictEqual(
    patchGate.routeMountPatchImplementationAuthorizationDecisionResult,
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(patchGate.routeMountPatchApproved, false);
  assert.strictEqual(patchGate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.routeMountPatchImplemented, false);
  assert.strictEqual(patchGate.implementationExecutionApproved, false);
  assert.strictEqual(patchGate.actualPatchImplementationApprovalIssued, false);
  assert.strictEqual(patchGate.actualPatchImplementationApprovalGranted, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationApprovalRequest,
    true
  );
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationApprovalDecision,
    true
  );

  const mountGate = buildOro5dRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);
  assert.strictEqual(mountGate.nextPhaseRequiresSeparateRouteMountAuthorization, true);

  const trafficGate = buildOro5dRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);
  assert.strictEqual(trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);

  const validation =
    validateOro5dRouteMountPatchImplementationAuthorizationDecision();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionFixtures().map(
      evaluateOro5dRouteMountPatchImplementationAuthorizationDecision
    );
  assert(allReports.length >= 33, "fixture set must cover ORO-5D required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountPatchApproved, false);
    assert.strictEqual(report.routeMountPatchImplementationAuthorized, false);
    assert.strictEqual(report.routeMountPatchImplemented, false);
    assert.strictEqual(report.implementationExecutionApproved, false);
    assert.strictEqual(report.actualPatchImplementationApprovalIssued, false);
    assert.strictEqual(report.actualPatchImplementationApprovalGranted, false);
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
      report.nextPhaseRequiresActualPatchImplementationApprovalRequest,
      true
    );
    assert.strictEqual(
      report.nextPhaseRequiresActualPatchImplementationApprovalDecision,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5D implementation decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5D implementation decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
