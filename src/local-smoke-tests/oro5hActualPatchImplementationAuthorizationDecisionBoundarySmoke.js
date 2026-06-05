"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundaryFixtures");

const {
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  APPROVED,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
  PASS,
  buildOro5hActualPatchImplementationAuthorizationDecisionInput,
  evaluateOro5hActualPatchImplementationAuthorizationDecision,
  buildOro5hActualPatchImplementationStillHeldGate,
  buildOro5hRouteMountStillHeldGate,
  buildOro5hRuntimeTrafficStillHeldGate,
  buildOro5hActualPatchImplementationAuthorizationDecisionSummary,
  validateOro5hActualPatchImplementationAuthorizationDecision,
} = helper;

const {
  actualPatchAlreadyAppliedFixture,
  actualPatchExecutionAlreadyStartedFixture,
  actualPatchImplementationAlreadyImplementedFixture,
  attemptedExpressMountFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  authorizationAlreadyGrantedFixture,
  authorizationDecisionAlreadyIssuedFixture,
  authorizationDecisionTriesActualPatchExecutionFixture,
  authorizationDecisionTriesRouteMountAuthorizationFixture,
  authorizationDecisionTriesRuntimeTrafficApprovalFixture,
  buildOro5hActualPatchImplementationAuthorizationDecisionFixtures,
  expressMountAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture,
  missingOro5gRequestFixture,
  oro5gRequestNotSubmittedFixture,
  oro5gRequestWrongStatusFixture,
  publicAliasAllowedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountPatchApprovedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5G_DOC =
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5hSmoke.js";
const SCRIPT = "smoke:oro-5h";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5G_DOC,
  "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5hActualPatchImplementationAuthorizationDecisionBoundarySmoke.js",
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
    "ORO-5H",
    "oro5h",
    "actualPatchImplementationAuthorizationDecision",
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
    "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5hActualPatchImplementationAuthorizationDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5H files must not contain ${marker}.`);
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
    "## ORO-5H scope",
    "## Input from ORO-5G",
    "## Authorization decision rules",
    "## Actual implementation still held gate",
    "## Route mount authorization still held gate",
    "## No Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5G submitted actual patch implementation authorization request",
    "ORO-5H issues actual patch implementation authorization decision only",
    "ORO-5H may grant authorization to proceed to a later implementation execution boundary",
    "ORO-5H does not execute actual patch implementation",
    "ORO-5H does not edit src/app.js",
    "ORO-5H does not mount Express route",
    "ORO-5H does not enable public alias",
    "ORO-5H does not allow runtime traffic",
    "ORO-5H does not mutate wallet/ledger",
    "ORO-5H does not write Prisma/DB",
    "ORO-5H does not call live OroPlay API",
    "future actual patch implementation execution requires separate explicit implementation phase",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "actualPatchImplementationAuthorizationRequestSubmitted = true",
    "actualPatchImplementationAuthorizationRequestStatus = decision_issued",
    "actualPatchImplementationAuthorizationRequestResult = approved",
    "actualPatchImplementationAuthorizationDecisionIssued = true",
    "actualPatchImplementationAuthorizationDecisionResult = approved",
    "actualPatchImplementationAuthorizationGranted = true",
    "actualPatchImplementationAuthorizationGrantScope = actual_patch_implementation_execution_boundary_only",
    "actualPatchImplementationAuthorized = true",
    "actualPatchImplementationImplemented = false",
    "actualPatchImplementationExecutionStarted = false",
    "actualPatchImplementationPatchApplied = false",
    "routeMountPatchApproved = false",
    "routeMountPatchImplementationAuthorized = false",
    "routeMountPatchImplemented = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "nextPhaseRequiresActualPatchImplementationExecutionBoundary = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5h", "oro-5h"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5H actual patch authorization decision",
        "ORO-5H issued actual patch implementation authorization decision",
        "next phase is actual patch implementation execution boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5H Current",
        "ORO-5H issued actual patch implementation authorization decision",
        "actualPatchImplementationAuthorizationDecisionResult=approved",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5H actual patch authorization decision",
        "ORO-5H issued actual patch implementation authorization decision",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5H Actual Patch Implementation Authorization Decision Coverage",
        SCRIPT,
        "actual patch implementation execution boundary",
      ],
    ],
    [ORO5G_DOC, ["ORO-5H issued actual patch implementation authorization decision"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5H");
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationRequestStatus,
    DECISION_ISSUED
  );
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationRequestResult,
    APPROVED
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationDecisionResult,
    APPROVED
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationGrantScope,
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorized, true);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(summary.actualPatchImplementationPatchApplied, false);
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
    summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
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
    summary.actualPatchImplementationAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestStatus, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestResult, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionResult, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorized, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(summary.actualPatchImplementationPatchApplied, false);
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
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro5hActualPatchImplementationAuthorizationDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture",
    "missingOro5gRequestFixture",
    "oro5gRequestNotSubmittedFixture",
    "oro5gRequestWrongStatusFixture",
    "authorizationDecisionAlreadyIssuedFixture",
    "authorizationAlreadyGrantedFixture",
    "actualPatchImplementationAlreadyImplementedFixture",
    "actualPatchExecutionAlreadyStartedFixture",
    "actualPatchAlreadyAppliedFixture",
    "routeMountPatchApprovedUnexpectedlyFixture",
    "routeMountImplementationAuthorizedUnexpectedlyFixture",
    "routeMountAuthorizedUnexpectedlyFixture",
    "expressMountAllowedUnexpectedlyFixture",
    "publicAliasAllowedUnexpectedlyFixture",
    "runtimeTrafficAllowedUnexpectedlyFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRuntimeRouteControllerEditFixture",
    "attemptedExpressMountFixture",
    "attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture",
    "authorizationDecisionTriesActualPatchExecutionFixture",
    "authorizationDecisionTriesRouteMountAuthorizationFixture",
    "authorizationDecisionTriesRuntimeTrafficApprovalFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5hActualPatchImplementationAuthorizationDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro5hActualPatchImplementationAuthorizationDecision, "function");
  assert.strictEqual(typeof buildOro5hActualPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5hRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5hRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5hActualPatchImplementationAuthorizationDecisionSummary, "function");
  assert.strictEqual(typeof validateOro5hActualPatchImplementationAuthorizationDecision, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(
      happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture
    )
  );

  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(missingOro5gRequestFixture),
    "ORO-5G authorization request is required"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(oro5gRequestNotSubmittedFixture),
    "ORO-5G authorization request must be submitted"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(oro5gRequestWrongStatusFixture),
    "ORO-5G authorization request must be pending decision"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(authorizationDecisionAlreadyIssuedFixture),
    "actual patch implementation authorization decision already issued"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(authorizationAlreadyGrantedFixture),
    "actual patch implementation authorization already granted"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(actualPatchImplementationAlreadyImplementedFixture),
    "actual patch implementation must not be implemented"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(actualPatchExecutionAlreadyStartedFixture),
    "actual patch implementation execution must not be started"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(actualPatchAlreadyAppliedFixture),
    "actual patch implementation patch must not be applied"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(routeMountPatchApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(routeMountImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(attemptedSrcAppJsEditFixture),
    "authorization decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(attemptedRuntimeRouteControllerEditFixture),
    "authorization decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(attemptedExpressMountFixture),
    "authorization decision must not implement Express mount"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "authorization decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "authorization decision must not try external network"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(authorizationDecisionTriesActualPatchExecutionFixture),
    "authorization decision must not execute actual patch implementation"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(authorizationDecisionTriesRouteMountAuthorizationFixture),
    "authorization decision must not authorize route mount"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(authorizationDecisionTriesRuntimeTrafficApprovalFixture),
    "authorization decision must not approve runtime traffic"
  );
  assertHeld(
    evaluateOro5hActualPatchImplementationAuthorizationDecision(secretShapedOutputFixture),
    "authorization decision output contains secret-shaped marker"
  );

  const patchGate = buildOro5hActualPatchImplementationStillHeldGate();
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    patchGate.actualPatchImplementationAuthorizationRequestStatus,
    DECISION_ISSUED
  );
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationDecisionIssued, true);
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationGranted, true);
  assert.strictEqual(patchGate.actualPatchImplementationAuthorized, true);
  assert.strictEqual(patchGate.actualPatchImplementationImplemented, false);
  assert.strictEqual(patchGate.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    true
  );

  const mountGate = buildOro5hRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5hRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);

  const validation = validateOro5hActualPatchImplementationAuthorizationDecision();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5hActualPatchImplementationAuthorizationDecisionFixtures().map(
      evaluateOro5hActualPatchImplementationAuthorizationDecision
    );
  assert(allReports.length >= 20, "fixture set must cover ORO-5H required cases.");
  for (const report of allReports) {
    const isPass =
      report.actualPatchImplementationAuthorizationDecisionBoundaryResult === PASS;
    assert.strictEqual(report.actualPatchImplementationAuthorized, isPass);
    assert.strictEqual(report.actualPatchImplementationImplemented, false);
    assert.strictEqual(report.actualPatchImplementationExecutionStarted, false);
    assert.strictEqual(report.actualPatchImplementationPatchApplied, false);
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
      report.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5H actual patch implementation authorization decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5H actual patch implementation authorization decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
