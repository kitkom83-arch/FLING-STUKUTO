"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundaryFixtures");

const {
  ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_STATUS,
  PASS,
  buildOro5fActualPatchImplementationApprovalDecisionInput,
  evaluateOro5fActualPatchImplementationApprovalDecision,
  buildOro5fActualPatchImplementationStillHeldGate,
  buildOro5fRouteMountStillHeldGate,
  buildOro5fRuntimeTrafficStillHeldGate,
  buildOro5fActualPatchImplementationApprovalDecisionSummary,
  validateOro5fActualPatchImplementationApprovalDecision,
} = helper;

const {
  actualPatchImplementationAuthorizedUnexpectedlyFixture,
  actualPatchImplementedUnexpectedlyFixture,
  approvalAlreadyGrantedWithBroaderScopeFixture,
  approvalDecisionAlreadyIssuedFixture,
  approvalDecisionTriesActualPatchImplementationAuthorizationFixture,
  approvalDecisionTriesActualPatchImplementationExecutionFixture,
  approvalDecisionTriesRouteMountAuthorizationFixture,
  approvalDecisionTriesRuntimeTrafficApprovalFixture,
  attemptedExpressMountFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  buildOro5fActualPatchImplementationApprovalDecisionFixtures,
  expressMountAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationApprovalDecisionIssuedFixture,
  missingOro5dDecisionFixture,
  missingOro5eRequestFixture,
  oro5dAuthorizationMissingFixture,
  oro5dAuthorizationWrongScopeFixture,
  oro5eRequestNotPendingDecisionFixture,
  oro5eRequestNotSubmittedFixture,
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
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const ORO5E_DOC =
  "docs/ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_SUBMISSION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5fSmoke.js";
const SCRIPT = "smoke:oro-5f";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5E_DOC,
  "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5fActualPatchImplementationApprovalDecisionBoundarySmoke.js",
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
    "ORO-5F",
    "oro5f",
    "actualPatchImplementationApprovalDecision",
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
    "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5fActualPatchImplementationApprovalDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5F files must not contain ${marker}.`);
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
    "## ORO-5F scope",
    "## Input from ORO-5E",
    "## Actual patch implementation approval decision rules",
    "## Approval grant scope",
    "## Actual implementation still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5E submitted actual patch implementation approval request",
    "ORO-5F records actual patch implementation approval decision only",
    "ORO-5F approval decision grants only the right to request actual patch implementation authorization",
    "ORO-5F does not authorize implementation execution",
    "ORO-5F does not implement route mount patch",
    "ORO-5F does not edit src/app.js",
    "ORO-5F does not mount Express route",
    "ORO-5F does not enable public alias",
    "ORO-5F does not allow runtime traffic",
    "ORO-5F does not mutate wallet/ledger",
    "ORO-5F does not write Prisma/DB",
    "ORO-5F does not call live OroPlay API",
    "future actual patch implementation authorization requires separate explicit request and decision",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "actualPatchImplementationApprovalRequestSubmitted = true",
    "actualPatchImplementationApprovalRequestStatus = decision_issued",
    "actualPatchImplementationApprovalDecisionIssued = true",
    "actualPatchImplementationApprovalDecisionResult = approved_for_actual_patch_implementation_authorization_request_only",
    "actualPatchImplementationApprovalGranted = true",
    "actualPatchImplementationApprovalGrantScope = actual_patch_implementation_authorization_request_only",
    "actualPatchImplementationAuthorized = false",
    "actualPatchImplementationImplemented = false",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "implementationExecutionApproved = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "nextPhaseRequiresActualPatchImplementationAuthorizationRequest = true",
    "nextPhaseRequiresActualPatchImplementationAuthorizationDecision = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5f", "oro-5f"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5F actual patch approval decision",
        "ORO-5F issued actual patch implementation approval decision",
        "next phase is actual patch implementation authorization request boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5F Current",
        "ORO-5F issued actual patch implementation approval decision",
        "actualPatchImplementationApprovalRequestStatus=decision_issued",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5F actual patch approval decision",
        "ORO-5F issued actual patch implementation approval decision",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5F Actual Patch Implementation Approval Decision Coverage",
        SCRIPT,
        "actual patch implementation authorization request boundary",
      ],
    ],
    [ORO5E_DOC, ["ORO-5F issued actual patch implementation approval decision"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5F");
  assert.strictEqual(
    summary.actualPatchImplementationApprovalDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestSubmitted, true);
  assert.strictEqual(
    summary.actualPatchImplementationApprovalRequestStatus,
    DECISION_ISSUED
  );
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionIssued, true);
  assert.strictEqual(
    summary.actualPatchImplementationApprovalDecisionResult,
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, true);
  assert.strictEqual(
    summary.actualPatchImplementationApprovalGrantScope,
    ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorized, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
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
    summary.nextPhaseRequiresActualPatchImplementationAuthorizationRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
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
    summary.actualPatchImplementationApprovalDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestSubmitted, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalRequestStatus, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionResult, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationApprovalGranted, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorized, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
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
  const allFixtures = buildOro5fActualPatchImplementationApprovalDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationApprovalDecisionIssuedFixture",
    "missingOro5eRequestFixture",
    "oro5eRequestNotSubmittedFixture",
    "oro5eRequestNotPendingDecisionFixture",
    "missingOro5dDecisionFixture",
    "oro5dAuthorizationMissingFixture",
    "oro5dAuthorizationWrongScopeFixture",
    "approvalDecisionAlreadyIssuedFixture",
    "approvalAlreadyGrantedWithBroaderScopeFixture",
    "actualPatchImplementationAuthorizedUnexpectedlyFixture",
    "actualPatchImplementedUnexpectedlyFixture",
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
    "approvalDecisionTriesActualPatchImplementationAuthorizationFixture",
    "approvalDecisionTriesActualPatchImplementationExecutionFixture",
    "approvalDecisionTriesRouteMountAuthorizationFixture",
    "approvalDecisionTriesRuntimeTrafficApprovalFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5fActualPatchImplementationApprovalDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro5fActualPatchImplementationApprovalDecision, "function");
  assert.strictEqual(typeof buildOro5fActualPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5fRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5fRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5fActualPatchImplementationApprovalDecisionSummary, "function");
  assert.strictEqual(typeof validateOro5fActualPatchImplementationApprovalDecision, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5fActualPatchImplementationApprovalDecision(
      happyPathActualPatchImplementationApprovalDecisionIssuedFixture
    )
  );

  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(missingOro5eRequestFixture),
    "ORO-5E actual patch implementation approval request is required"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(oro5eRequestNotSubmittedFixture),
    "ORO-5E request must be submitted"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(oro5eRequestNotPendingDecisionFixture),
    "ORO-5E request must be pending decision"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(missingOro5dDecisionFixture),
    "ORO-5D decision is required"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(oro5dAuthorizationMissingFixture),
    "ORO-5D authorization must be granted"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(oro5dAuthorizationWrongScopeFixture),
    "ORO-5D authorization scope must be approval request only"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalDecisionAlreadyIssuedFixture),
    "actual patch implementation approval decision already issued"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalAlreadyGrantedWithBroaderScopeFixture),
    "actual patch implementation approval already granted with broader scope"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(actualPatchImplementationAuthorizedUnexpectedlyFixture),
    "actual patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(actualPatchImplementedUnexpectedlyFixture),
    "actual patch implementation must not be implemented"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(routeMountPatchApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(patchImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(patchImplementedUnexpectedlyFixture),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(attemptedSrcAppJsEditFixture),
    "approval decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(attemptedRuntimeRouteControllerEditFixture),
    "approval decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(attemptedExpressMountFixture),
    "approval decision must not implement Express mount"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "approval decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "approval decision must not try external network"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalDecisionTriesActualPatchImplementationAuthorizationFixture),
    "approval decision must not authorize actual patch implementation"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalDecisionTriesActualPatchImplementationExecutionFixture),
    "approval decision must not execute actual patch implementation"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalDecisionTriesRouteMountAuthorizationFixture),
    "approval decision must not authorize route mount"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(approvalDecisionTriesRuntimeTrafficApprovalFixture),
    "approval decision must not approve runtime traffic"
  );
  assertHeld(
    evaluateOro5fActualPatchImplementationApprovalDecision(secretShapedOutputFixture),
    "approval decision output contains secret-shaped marker"
  );

  const patchGate = buildOro5fActualPatchImplementationStillHeldGate();
  assert.strictEqual(patchGate.actualPatchImplementationApprovalDecisionIssued, true);
  assert.strictEqual(patchGate.actualPatchImplementationApprovalGranted, true);
  assert.strictEqual(patchGate.actualPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.actualPatchImplementationImplemented, false);
  assert.strictEqual(patchGate.routeMountPatchApproved, false);
  assert.strictEqual(patchGate.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.routeMountPatchImplemented, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationAuthorizationRequest,
    true
  );

  const mountGate = buildOro5fRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5fRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);

  const validation = validateOro5fActualPatchImplementationApprovalDecision();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5fActualPatchImplementationApprovalDecisionFixtures().map(
      evaluateOro5fActualPatchImplementationApprovalDecision
    );
  assert(allReports.length >= 25, "fixture set must cover ORO-5F required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.actualPatchImplementationAuthorized, false);
    assert.strictEqual(report.actualPatchImplementationImplemented, false);
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
      report.nextPhaseRequiresActualPatchImplementationAuthorizationRequest,
      true
    );
    assert.strictEqual(
      report.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5F actual patch implementation approval decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5F actual patch implementation approval decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
