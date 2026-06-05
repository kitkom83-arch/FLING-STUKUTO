"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundaryFixtures");

const {
  ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_STATUS,
  PASS,
  PENDING_DECISION,
  SUBMITTED_PENDING_DECISION,
  buildOro5gActualPatchImplementationAuthorizationRequestInput,
  evaluateOro5gActualPatchImplementationAuthorizationRequest,
  buildOro5gActualPatchImplementationStillHeldGate,
  buildOro5gRouteMountStillHeldGate,
  buildOro5gRuntimeTrafficStillHeldGate,
  buildOro5gActualPatchImplementationAuthorizationRequestSummary,
  validateOro5gActualPatchImplementationAuthorizationRequest,
} = helper;

const {
  actualPatchImplementationAuthorizedUnexpectedlyFixture,
  actualPatchImplementedUnexpectedlyFixture,
  attemptedExpressMountFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  authorizationAlreadyGrantedFixture,
  authorizationDecisionAlreadyIssuedFixture,
  authorizationRequestAlreadySubmittedFixture,
  authorizationRequestTriesActualPatchImplementationFixture,
  authorizationRequestTriesAuthorizationDecisionFixture,
  authorizationRequestTriesImplementationAuthorizationFixture,
  authorizationRequestTriesRouteMountAuthorizationFixture,
  authorizationRequestTriesRuntimeTrafficApprovalFixture,
  buildOro5gActualPatchImplementationAuthorizationRequestFixtures,
  expressMountAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture,
  missingOro5fDecisionFixture,
  oro5fApprovalNotGrantedFixture,
  oro5fApprovalWrongScopeFixture,
  oro5fDecisionNotIssuedFixture,
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
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const ORO5F_DOC =
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5gSmoke.js";
const SCRIPT = "smoke:oro-5g";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5F_DOC,
  "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundary.js",
  "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundaryFixtures.js",
  "src/local-smoke-tests/oro5gActualPatchImplementationAuthorizationRequestBoundarySmoke.js",
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
    "ORO-5G",
    "oro5g",
    "actualPatchImplementationAuthorizationRequest",
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
    "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5gActualPatchImplementationAuthorizationRequestBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5G files must not contain ${marker}.`);
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
    "## ORO-5G scope",
    "## Input from ORO-5F",
    "## Actual patch implementation authorization request rules",
    "## Authorization decision still pending gate",
    "## Actual implementation still held gate",
    "## Route mount authorization still held gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5F issued actual patch implementation approval decision",
    "ORO-5F grants only the right to submit actual patch implementation authorization request",
    "ORO-5G records actual patch implementation authorization request submission only",
    "ORO-5G does not issue authorization decision",
    "ORO-5G does not grant implementation authorization",
    "ORO-5G does not implement route mount patch",
    "ORO-5G does not edit src/app.js",
    "ORO-5G does not mount Express route",
    "ORO-5G does not enable public alias",
    "ORO-5G does not allow runtime traffic",
    "ORO-5G does not mutate wallet/ledger",
    "ORO-5G does not write Prisma/DB",
    "ORO-5G does not call live OroPlay API",
    "future actual patch implementation authorization decision requires separate explicit decision",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "actualPatchImplementationAuthorizationRequestSubmitted = true",
    "actualPatchImplementationAuthorizationRequestStatus = submitted_pending_decision",
    "actualPatchImplementationAuthorizationRequestResult = pending_decision",
    "actualPatchImplementationAuthorizationDecisionIssued = false",
    "actualPatchImplementationAuthorizationGranted = false",
    "actualPatchImplementationApprovalDecisionIssued = true",
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
    "nextPhaseRequiresActualPatchImplementationAuthorizationDecision = true",
    "nextPhaseRequiresSeparateRouteMountAuthorization = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5g", "oro-5g"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5G actual patch authorization request",
        "ORO-5G submitted actual patch implementation authorization request",
        "next phase is actual patch implementation authorization decision boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5G Current",
        "ORO-5G submitted actual patch implementation authorization request",
        "actualPatchImplementationAuthorizationRequestStatus=submitted_pending_decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5G actual patch authorization request",
        "ORO-5G submitted actual patch implementation authorization request",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5G Actual Patch Implementation Authorization Request Coverage",
        SCRIPT,
        "actual patch implementation authorization decision boundary",
      ],
    ],
    [ORO5F_DOC, ["ORO-5G submitted actual patch implementation authorization request"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5G");
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationRequestResult,
    PENDING_DECISION
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, false);
  assert.strictEqual(summary.actualPatchImplementationApprovalDecisionIssued, true);
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
    summary.actualPatchImplementationAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestStatus, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationAuthorizationRequestResult, "HOLD");
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, false);
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
  const allFixtures = buildOro5gActualPatchImplementationAuthorizationRequestFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture",
    "missingOro5fDecisionFixture",
    "oro5fDecisionNotIssuedFixture",
    "oro5fApprovalNotGrantedFixture",
    "oro5fApprovalWrongScopeFixture",
    "authorizationRequestAlreadySubmittedFixture",
    "authorizationDecisionAlreadyIssuedFixture",
    "authorizationAlreadyGrantedFixture",
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
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5gActualPatchImplementationAuthorizationRequestInput, "function");
  assert.strictEqual(typeof evaluateOro5gActualPatchImplementationAuthorizationRequest, "function");
  assert.strictEqual(typeof buildOro5gActualPatchImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5gRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5gRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5gActualPatchImplementationAuthorizationRequestSummary, "function");
  assert.strictEqual(typeof validateOro5gActualPatchImplementationAuthorizationRequest, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(
      happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture
    )
  );

  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(missingOro5fDecisionFixture),
    "ORO-5F approval decision is required"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(oro5fDecisionNotIssuedFixture),
    "ORO-5F approval decision must be issued"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(oro5fApprovalNotGrantedFixture),
    "ORO-5F approval must be granted"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(oro5fApprovalWrongScopeFixture),
    "ORO-5F approval grant scope must be authorization request only"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestAlreadySubmittedFixture),
    "actual patch implementation authorization request already submitted"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationDecisionAlreadyIssuedFixture),
    "actual patch implementation authorization decision already issued"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationAlreadyGrantedFixture),
    "actual patch implementation authorization already granted"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(actualPatchImplementationAuthorizedUnexpectedlyFixture),
    "actual patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(actualPatchImplementedUnexpectedlyFixture),
    "actual patch implementation must not be implemented"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(routeMountPatchApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(patchImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(patchImplementedUnexpectedlyFixture),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(attemptedSrcAppJsEditFixture),
    "authorization request must not edit src/app.js"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(attemptedRuntimeRouteControllerEditFixture),
    "authorization request must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(attemptedExpressMountFixture),
    "authorization request must not implement Express mount"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "authorization request must not try wallet mutation"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture),
    "authorization request must not try external network"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestTriesAuthorizationDecisionFixture),
    "authorization request must not issue authorization decision"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestTriesImplementationAuthorizationFixture),
    "authorization request must not grant implementation authorization"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestTriesActualPatchImplementationFixture),
    "authorization request must not implement actual patch"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestTriesRouteMountAuthorizationFixture),
    "authorization request must not authorize route mount"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(authorizationRequestTriesRuntimeTrafficApprovalFixture),
    "authorization request must not approve runtime traffic"
  );
  assertHeld(
    evaluateOro5gActualPatchImplementationAuthorizationRequest(secretShapedOutputFixture),
    "authorization request output contains secret-shaped marker"
  );

  const patchGate = buildOro5gActualPatchImplementationStillHeldGate();
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    patchGate.actualPatchImplementationAuthorizationRequestStatus,
    SUBMITTED_PENDING_DECISION
  );
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationDecisionIssued, false);
  assert.strictEqual(patchGate.actualPatchImplementationAuthorizationGranted, false);
  assert.strictEqual(patchGate.actualPatchImplementationAuthorized, false);
  assert.strictEqual(patchGate.actualPatchImplementationImplemented, false);
  assert.strictEqual(
    patchGate.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
    true
  );

  const mountGate = buildOro5gRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5gRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);

  const validation = validateOro5gActualPatchImplementationAuthorizationRequest();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5gActualPatchImplementationAuthorizationRequestFixtures().map(
      evaluateOro5gActualPatchImplementationAuthorizationRequest
    );
  assert(allReports.length >= 20, "fixture set must cover ORO-5G required cases.");
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
      report.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5G actual patch implementation authorization request smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5G actual patch implementation authorization request smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
