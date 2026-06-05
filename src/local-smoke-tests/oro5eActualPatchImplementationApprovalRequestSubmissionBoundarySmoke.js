"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundary");
const fixtures = require("../game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundaryFixtures");

const {
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_STATUS,
  PASS,
  PENDING_DECISION,
  SUBMITTED_PENDING_DECISION,
  buildOro5eActualPatchImplementationApprovalRequestInput,
  evaluateOro5eActualPatchImplementationApprovalRequest,
  buildOro5eActualPatchImplementationStillHeldGate,
  buildOro5eRouteMountStillHeldGate,
  buildOro5eRuntimeTrafficStillHeldGate,
  buildOro5eActualPatchImplementationApprovalRequestSummary,
  validateOro5eActualPatchImplementationApprovalRequest,
} = helper;

const {
  actualPatchApprovalDecisionAlreadyIssuedFixture,
  actualPatchApprovalGrantedFixture,
  actualPatchApprovalRequestAlreadySubmittedFixture,
  approvalRequestTriesActualImplementationApprovalFixture,
  approvalRequestTriesRouteMountAuthorizationFixture,
  approvalRequestTriesRuntimeTrafficApprovalFixture,
  attemptedExpressMountFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  buildOro5eActualPatchImplementationApprovalRequestFixtures,
  expressMountAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationApprovalRequestSubmittedFixture,
  missingOro5dDecisionFixture,
  oro5dAuthorizationMissingFixture,
  oro5dAuthorizationWrongScopeFixture,
  oro5dDecisionNotIssuedFixture,
  patchImplementedUnexpectedlyFixture,
  patchImplementationAuthorizedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountPatchApprovedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_SUBMISSION_BOUNDARY.md";
const ORO5D_DOC =
  "docs/ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5eSmoke.js";
const SCRIPT = "smoke:oro-5e";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5D_DOC,
  "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5eActualPatchImplementationApprovalRequestSubmissionBoundarySmoke.js",
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
    "ORO-5E",
    "oro5e",
    "actualPatchImplementationApprovalRequest",
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
    "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5eActualPatchImplementationApprovalRequestSubmissionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5E files must not contain ${marker}.`);
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
    "## ORO-5E scope",
    "## Input from ORO-5D",
    "## Actual patch implementation approval request rules",
    "## Actual patch implementation approval decision still pending gate",
    "## Actual patch implementation still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5D decision issued",
    "ORO-5D approved only the next actual patch implementation approval request",
    "ORO-5E records actual patch implementation approval request submission only",
    "ORO-5E does not approve actual patch implementation",
    "ORO-5E does not implement route mount patch",
    "ORO-5E does not edit src/app.js",
    "ORO-5E does not mount Express route",
    "ORO-5E does not enable public alias",
    "ORO-5E does not allow runtime traffic",
    "ORO-5E does not mutate wallet/ledger",
    "ORO-5E does not write Prisma/DB",
    "ORO-5E does not call live OroPlay API",
    "future actual patch implementation approval decision requires separate explicit approval",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "actualPatchImplementationApprovalRequestSubmitted = true",
    "actualPatchImplementationApprovalRequestStatus = submitted_pending_decision",
    "actualPatchImplementationApprovalRequestResult = pending_decision",
    "actualPatchImplementationApprovalDecisionIssued = false",
    "actualPatchImplementationApprovalGranted = false",
    "routeMountPatchImplementationAuthorizationDecisionIssued = true",
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
    "nextPhaseRequiresActualPatchImplementationApprovalDecision = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5e", "oro-5e"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5E actual patch approval request",
        "ORO-5E submitted actual patch implementation approval request",
        "next phase is actual patch implementation approval decision boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5E Current",
        "ORO-5E submitted actual patch implementation approval request",
        "actualPatchImplementationApprovalRequestStatus=submitted_pending_decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5E actual patch approval request",
        "ORO-5E submitted actual patch implementation approval request",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5E Actual Patch Implementation Approval Request Coverage",
        SCRIPT,
        "actual patch implementation approval decision boundary",
      ],
    ],
    [ORO5D_DOC, ["ORO-5E submitted actual patch implementation approval request"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5E");
  assert.strictEqual(
    summary.actualPatchImplementationApprovalRequestSubmissionBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestSubmitted, true);
  assert.strictEqual(
    summary.actualPatchImplementationApprovalRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(
    summary.actualPatchImplementationApprovalRequestResult,
    PENDING_DECISION
  );
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, false);
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationDecisionIssued,
    true
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
    summary.actualPatchImplementationApprovalRequestSubmissionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestSubmitted, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestStatus, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestResult, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.implementationExecutionApproved, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalIssued, false);
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
  const allFixtures = buildOro5eActualPatchImplementationApprovalRequestFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationApprovalRequestSubmittedFixture",
    "missingOro5dDecisionFixture",
    "oro5dDecisionNotIssuedFixture",
    "oro5dAuthorizationMissingFixture",
    "oro5dAuthorizationWrongScopeFixture",
    "actualPatchApprovalRequestAlreadySubmittedFixture",
    "actualPatchApprovalDecisionAlreadyIssuedFixture",
    "actualPatchApprovalGrantedFixture",
    "routeMountPatchApprovedUnexpectedlyFixture",
    "patchImplementationAuthorizedUnexpectedlyFixture",
    "patchImplementedUnexpectedlyFixture",
    "routeMountAuthorizedUnexpectedlyFixture",
    "expressMountAllowedUnexpectedlyFixture",
    "publicAliasAllowedUnexpectedlyFixture",
    "runtimeTrafficAllowedUnexpectedlyFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRuntimeRouteControllerEditFixture",
    "attemptedExpressMountFixture",
    "attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5eActualPatchImplementationApprovalRequestInput, "function");
  assert.strictEqual(typeof evaluateOro5eActualPatchImplementationApprovalRequest, "function");
  assert.strictEqual(typeof buildOro5eActualPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5eRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5eRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5eActualPatchImplementationApprovalRequestSummary, "function");
  assert.strictEqual(typeof validateOro5eActualPatchImplementationApprovalRequest, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      happyPathActualPatchImplementationApprovalRequestSubmittedFixture
    )
  );

  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      missingOro5dDecisionFixture
    ),
    "ORO-5D decision is required"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      oro5dDecisionNotIssuedFixture
    ),
    "ORO-5D decision must be issued"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      oro5dAuthorizationMissingFixture
    ),
    "ORO-5D authorization must be granted"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      oro5dAuthorizationWrongScopeFixture
    ),
    "ORO-5D authorization scope must be request only"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      actualPatchApprovalRequestAlreadySubmittedFixture
    ),
    "actual patch approval request already submitted"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      actualPatchApprovalDecisionAlreadyIssuedFixture
    ),
    "actual patch approval decision already issued"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      actualPatchApprovalGrantedFixture
    ),
    "actual patch approval already granted"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      routeMountPatchApprovedUnexpectedlyFixture
    ),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      patchImplementationAuthorizedUnexpectedlyFixture
    ),
    "actual patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      patchImplementedUnexpectedlyFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      routeMountAuthorizedUnexpectedlyFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      expressMountAllowedUnexpectedlyFixture
    ),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      publicAliasAllowedUnexpectedlyFixture
    ),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      runtimeTrafficAllowedUnexpectedlyFixture
    ),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      attemptedSrcAppJsEditFixture
    ),
    "approval request must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      attemptedRuntimeRouteControllerEditFixture
    ),
    "approval request must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      attemptedExpressMountFixture
    ),
    "approval request must not implement Express mount"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture
    ),
    "approval request must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture
    ),
    "approval request must not try external network"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      secretShapedOutputFixture
    ),
    "approval request output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      approvalRequestTriesActualImplementationApprovalFixture
    ),
    "approval request must not approve actual implementation"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      approvalRequestTriesRouteMountAuthorizationFixture
    ),
    "approval request must not authorize route mount"
  );
  assertHeld(
    evaluateOro5eActualPatchImplementationApprovalRequest(
      approvalRequestTriesRuntimeTrafficApprovalFixture
    ),
    "approval request must not approve runtime traffic"
  );

  const patchGate = buildOro5eActualPatchImplementationStillHeldGate();
  assert.strictEqual(patchGate.actualPatchImplementationApprovalRequestSubmitted, true);
  assert.strictEqual(patchGate.actualPatchImplementationApprovalDecisionIssued, false);
  assert.strictEqual(patchGate.actualPatchImplementationApprovalGranted, false);
  assert.strictEqual(patchGate.routeMountPatchApproved, false);
  assert.strictEqual(patchGate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.routeMountPatchImplemented, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationApprovalDecision,
    true
  );

  const mountGate = buildOro5eRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5eRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);

  const validation = validateOro5eActualPatchImplementationApprovalRequest();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5eActualPatchImplementationApprovalRequestFixtures().map(
      evaluateOro5eActualPatchImplementationApprovalRequest
    );
  assert(allReports.length >= 20, "fixture set must cover ORO-5E required cases.");
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
      report.nextPhaseRequiresActualPatchImplementationApprovalDecision,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5E actual patch implementation approval request submission smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5E actual patch implementation approval request submission smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
