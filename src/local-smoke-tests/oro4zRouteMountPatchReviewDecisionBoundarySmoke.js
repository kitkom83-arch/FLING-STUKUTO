"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary");
const fixtures = require("../game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundaryFixtures");
const oro4y = require("../game-provider-mock/oro4yRouteMountExecutionApprovalReadiness");

const {
  NOT_AUTHORIZED_FOR_EXECUTION,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_STATUS,
  PASS,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  buildOro4zRouteMountPatchReviewInput,
  evaluateOro4zRouteMountPatchReviewDecisionBoundary,
  buildOro4zExecutionAuthorizationHoldGate,
  buildOro4zRouteMountPatchReviewSummary,
  validateOro4zRouteMountPatchReviewDecisionBoundary,
} = helper;

const {
  attemptedDbTransactionFixture,
  attemptedExternalNetworkFixture,
  attemptedLedgerMutationFixture,
  attemptedMigrationFixture,
  attemptedPrismaWriteFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro4zRouteMountPatchReviewDecisionBoundaryFixtures,
  executionApprovalIncorrectlyGrantedFixture,
  executionReadinessNotRecordedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathPatchReviewDecisionRecordedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro4yReadinessFixture,
  oro4yReadinessFailedFixture,
  patchReviewCannotBeExecutionAuthorizationFixture,
  patchReviewNotPreparedFixture,
  patchReviewRequiresExplicitExecutionApprovalFixture,
  patchReviewRequiresPatchImplementationApprovalFixture,
  publicAliasAllowedTrueFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  routeMountPatchIncorrectlyApprovedFixture,
  routeMountPatchIncorrectlyImplementedFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_DECISION_BOUNDARY.md";
const ORO4Y_DOC = "docs/ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_READINESS.md";
const ORO4X_DOC = "docs/ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const ORO4W_DOC = "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md";
const ORO4V_DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4zSmoke.js";
const SCRIPT = "smoke:oro-4z";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4Y_DOC,
  ORO4X_DOC,
  ORO4W_DOC,
  ORO4V_DOC,
  "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary.js",
  "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro4zRouteMountPatchReviewDecisionBoundarySmoke.js",
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
    "ORO-4Z",
    "oro4z",
    "RouteMountPatchReview",
    "reviewed_ready_for_execution_approval_request_only",
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
    "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro4zRouteMountPatchReviewDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-4Z files must not contain ${marker}.`);
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
    "## ORO-4Z scope",
    "## Input from ORO-4Y",
    "## Patch review decision rules",
    "## Execution authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4Y execution approval readiness has been recorded",
    "ORO-4Y patch review preparation has been recorded",
    "ORO-4Z records patch review decision only",
    "ORO-4Z patch review result is ready for execution approval request only",
    "ORO-4Z does not edit src/app.js",
    "ORO-4Z does not mount Express route",
    "ORO-4Z does not enable public alias",
    "ORO-4Z does not allow runtime traffic",
    "ORO-4Z does not mutate wallet/ledger",
    "ORO-4Z does not write Prisma/DB",
    "ORO-4Z does not call live OroPlay API",
    "ORO-4Z does not authorize real route mount execution",
    "ORO-4Z does not authorize runtime traffic",
    "routeMountAuthorization remains not_authorized_for_mount",
    "routeMountExecutionAuthorization remains not_authorized_for_execution",
    "routeMountPatchApproved = false",
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

  const oro4yDoc = readRequired(ORO4Y_DOC);
  const oro4yHelper = readRequired(
    "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadiness.js"
  );
  assert(
    oro4yDoc.includes("ORO-4Y Route Mount Execution Approval Readiness"),
    "ORO-4Y doc missing readiness."
  );
  assert(
    oro4yHelper.includes("buildOro4yRouteMountExecutionApprovalInput"),
    "ORO-4Y helper missing input builder."
  );

  for (const [file, markers] of [
    [
      ORO4Y_DOC,
      [
        "ORO-4Z patch review decision",
        "ORO-4Z execution authorization hold",
      ],
    ],
    [ORO4X_DOC, ["ORO-4Z patch review decision"]],
    [ORO4W_DOC, ["ORO-4Z patch review decision"]],
    [ORO4V_DOC, ["ORO-4Z patch review decision"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4z", "oro-4z"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4Z patch review decision",
        "ORO-4Z execution authorization hold",
        "routeMountPatchReviewDecisionIssued=true",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4Z Current",
        "patch review decision issued",
        "routeMountPatchReviewResult=reviewed_ready_for_execution_approval_request_only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4Z patch review decision",
        "ORO-4Z execution authorization hold",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4Z Route Mount Patch Review Decision Coverage",
        SCRIPT,
        "patch review decision issued",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro4yReadiness() {
  const summary = oro4y.evaluateOro4yRouteMountExecutionApprovalReadiness();
  assert.strictEqual(summary.executionApprovalReadinessResult, PASS);
  assert.strictEqual(summary.executionApprovalReadinessRecorded, true);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchReviewPrepared, true);
  assert.strictEqual(summary.routeMountPatchReviewed, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(
    summary.routeMountExecutionAuthorization,
    NOT_AUTHORIZED_FOR_EXECUTION
  );
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-4Z");
  assert.strictEqual(summary.routeMountPatchReviewDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountPatchReviewDecisionIssued, true);
  assert.strictEqual(summary.routeMountPatchReviewPrepared, true);
  assert.strictEqual(summary.routeMountPatchReviewed, true);
  assert.strictEqual(
    summary.routeMountPatchReviewResult,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.executionApprovalReadinessRecorded, true);
  assert.strictEqual(summary.executionApprovalGranted, false);
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
  assert.strictEqual(summary.nextPhaseRequiresExplicitExecutionApproval, true);
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
  assert.strictEqual(summary.routeMountPatchReviewDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountPatchReviewDecisionIssued, false);
  assert.strictEqual(summary.routeMountPatchReviewPrepared, false);
  assert.strictEqual(summary.routeMountPatchReviewed, false);
  assert.strictEqual(summary.routeMountPatchReviewResult, "HOLD");
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
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
  const allFixtures = buildOro4zRouteMountPatchReviewDecisionBoundaryFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathPatchReviewDecisionRecordedFixture",
    "missingOro4yReadinessFixture",
    "oro4yReadinessFailedFixture",
    "executionReadinessNotRecordedFixture",
    "patchReviewNotPreparedFixture",
    "executionApprovalIncorrectlyGrantedFixture",
    "implementationExecutionIncorrectlyApprovedFixture",
    "routeMountPatchIncorrectlyApprovedFixture",
    "routeMountPatchIncorrectlyImplementedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
    "expressMountAllowedTrueFixture",
    "expressMountImplementedTrueFixture",
    "publicAliasAllowedTrueFixture",
    "runtimeTrafficAllowedTrueFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRouteControllerRuntimeChangeFixture",
    "attemptedPublicAliasAuthorizationFixture",
    "attemptedRuntimeTrafficAuthorizationFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedDbTransactionFixture",
    "attemptedMigrationFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "patchReviewRequiresExplicitExecutionApprovalFixture",
    "patchReviewCannotBeExecutionAuthorizationFixture",
    "patchReviewRequiresPatchImplementationApprovalFixture",
    "runtimeTrafficRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_STATUS, "object");
  assert.strictEqual(typeof buildOro4zRouteMountPatchReviewInput, "function");
  assert.strictEqual(
    typeof evaluateOro4zRouteMountPatchReviewDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro4zExecutionAuthorizationHoldGate, "function");
  assert.strictEqual(typeof buildOro4zRouteMountPatchReviewSummary, "function");
  assert.strictEqual(
    typeof validateOro4zRouteMountPatchReviewDecisionBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro4yReadiness();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4zRouteMountPatchReviewDecisionBoundary(
    happyPathPatchReviewDecisionRecordedFixture
  ));
  assertHappyPath(buildOro4zRouteMountPatchReviewSummary(
    patchReviewRequiresExplicitExecutionApprovalFixture
  ));
  assertHappyPath(buildOro4zRouteMountPatchReviewSummary(
    runtimeTrafficRequiresSeparateApprovalFixture
  ));

  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(missingOro4yReadinessFixture),
    "ORO-4Y execution approval readiness is required"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(oro4yReadinessFailedFixture),
    "ORO-4Y readiness result must be PASS"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      executionReadinessNotRecordedFixture
    ),
    "execution approval readiness must be recorded"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(patchReviewNotPreparedFixture),
    "route mount patch review preparation must be recorded"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      executionApprovalIncorrectlyGrantedFixture
    ),
    "execution approval must not be granted by patch review"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      routeMountPatchIncorrectlyApprovedFixture
    ),
    "route mount patch must not be approved by review decision"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      routeMountPatchIncorrectlyImplementedFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      routeMountExecutionAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount execution authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(expressMountAllowedTrueFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(publicAliasAllowedTrueFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(runtimeTrafficAllowedTrueFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedSrcAppJsEditFixture),
    "patch review decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "patch review decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      attemptedPublicAliasAuthorizationFixture
    ),
    "patch review decision must not authorize public alias"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      attemptedRuntimeTrafficAuthorizationFixture
    ),
    "patch review decision must not authorize runtime traffic"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedWalletMutationFixture),
    "patch review decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedLedgerMutationFixture),
    "patch review decision must not try ledger mutation"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedPrismaWriteFixture),
    "patch review decision must not try Prisma write"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedDbTransactionFixture),
    "patch review decision must not try DB transaction"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedMigrationFixture),
    "patch review decision must not try migration"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(attemptedExternalNetworkFixture),
    "patch review decision must not try external network"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(secretShapedOutputFixture),
    "patch review decision output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      patchReviewCannotBeExecutionAuthorizationFixture
    ),
    "patch review decision must not be execution authorization"
  );
  assertHeld(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(
      patchReviewRequiresPatchImplementationApprovalFixture
    ),
    "patch review decision must not skip patch implementation approval"
  );

  const gate = buildOro4zExecutionAuthorizationHoldGate();
  assert.strictEqual(gate.routeMountPatchReviewDecisionIssued, true);
  assert.strictEqual(gate.routeMountPatchReviewPrepared, true);
  assert.strictEqual(gate.routeMountPatchReviewed, true);
  assert.strictEqual(
    gate.routeMountPatchReviewResult,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  );
  assert.strictEqual(gate.routeMountPatchApproved, false);
  assert.strictEqual(gate.routeMountPatchImplemented, false);
  assert.strictEqual(gate.executionApprovalGranted, false);
  assert.strictEqual(gate.implementationExecutionApproved, false);
  assert.strictEqual(gate.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);

  const validation = validateOro4zRouteMountPatchReviewDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4zRouteMountPatchReviewDecisionBoundaryFixtures().map(
    evaluateOro4zRouteMountPatchReviewDecisionBoundary
  );
  assert(allReports.length >= 30, "fixture set must cover ORO-4Z required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountPatchApproved, false);
    assert.strictEqual(report.routeMountPatchImplemented, false);
    assert.strictEqual(report.executionApprovalGranted, false);
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
    assert.strictEqual(report.nextPhaseRequiresExplicitExecutionApproval, true);
    assert.strictEqual(report.nextPhaseRequiresActualPatchImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4Z patch review decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4Z patch review decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
