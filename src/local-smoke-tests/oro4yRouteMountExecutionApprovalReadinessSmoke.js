"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro4yRouteMountExecutionApprovalReadiness");
const fixtures = require("../game-provider-mock/oro4yRouteMountExecutionApprovalReadinessFixtures");
const oro4x = require("../game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundary");

const {
  NOT_AUTHORIZED_FOR_EXECUTION,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_STATUS,
  PASS,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
  buildOro4yRouteMountExecutionApprovalInput,
  evaluateOro4yRouteMountExecutionApprovalReadiness,
  buildOro4yRouteMountPatchReviewGate,
  buildOro4yRouteMountExecutionApprovalSummary,
  validateOro4yRouteMountExecutionApprovalReadiness,
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
  buildOro4yRouteMountExecutionApprovalReadinessFixtures,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathExecutionReadinessRecordedFixture,
  implementationApprovalNotGrantedFixture,
  implementationApprovalScopeWrongFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  missingOro4xDecisionFixture,
  oro4xDecisionFailedFixture,
  publicAliasAllowedTrueFixture,
  readinessRequiresExplicitExecutionApprovalFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  routeMountPatchIncorrectlyImplementedFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_READINESS.md";
const ORO4X_DOC = "docs/ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const ORO4W_DOC = "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md";
const ORO4V_DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4ySmoke.js";
const SCRIPT = "smoke:oro-4y";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4X_DOC,
  ORO4W_DOC,
  ORO4V_DOC,
  "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadiness.js",
  "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadinessFixtures.js",
  "src/local-smoke-tests/oro4yRouteMountExecutionApprovalReadinessSmoke.js",
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
    assert(!serialized.includes(marker), `summary leaked sensitive field marker ${marker}.`);
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
    "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadiness.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro4yRouteMountExecutionApprovalReadinessFixtures.js"
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
    assert(!combined.includes(marker), `ORO-4Y files must not contain ${marker}.`);
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
    "## ORO-4Y scope",
    "## Input from ORO-4X",
    "## Execution approval readiness rules",
    "## Route mount patch review preparation boundary",
    "## Execution still not authorized gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4X implementation approval decision has been recorded",
    "ORO-4X approval scope is static route mount implementation planning only",
    "ORO-4Y prepares execution approval readiness only",
    "ORO-4Y prepares patch review metadata only",
    "ORO-4Y does not edit src/app.js",
    "ORO-4Y does not mount Express route",
    "ORO-4Y does not enable public alias",
    "ORO-4Y does not allow runtime traffic",
    "ORO-4Y does not mutate wallet/ledger",
    "ORO-4Y does not write Prisma/DB",
    "ORO-4Y does not call live OroPlay API",
    "ORO-4Y does not authorize real route mount execution",
    "ORO-4Y does not authorize runtime traffic",
    "routeMountAuthorization remains not_authorized_for_mount",
    "routeMountExecutionAuthorization remains not_authorized_for_execution",
    "implementationExecutionApproved = false",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro4xDoc = readRequired(ORO4X_DOC);
  for (const marker of [
    "ORO-4X implementation approval decision",
    "ORO-4Y execution approval readiness",
    "routeMountExecutionAuthorization remains not_authorized_for_execution",
  ]) {
    assert(oro4xDoc.includes(marker), `${ORO4X_DOC} missing marker ${marker}.`);
  }

  const oro4wDoc = readRequired(ORO4W_DOC);
  assert(
    oro4wDoc.includes("ORO-4Y execution approval readiness"),
    `${ORO4W_DOC} missing ORO-4Y reference.`
  );

  const oro4vDoc = readRequired(ORO4V_DOC);
  assert(
    oro4vDoc.includes("ORO-4Y execution approval readiness"),
    `${ORO4V_DOC} missing ORO-4Y reference.`
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4y", "oro-4y"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4Y execution approval readiness",
        "ORO-4Y patch review preparation",
        "executionApprovalReadinessRecorded=true",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4Y Current",
        "execution approval readiness recorded",
        "routeMountPatchReviewPrepared=true",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4Y execution approval readiness",
        "ORO-4Y patch review preparation",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4Y Route Mount Execution Approval Readiness Coverage",
        SCRIPT,
        "execution approval readiness recorded",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro4xDecision() {
  const summary = oro4x.evaluateOro4xRouteMountImplementationApprovalDecisionBoundary();
  assert.strictEqual(summary.implementationApprovalDecisionResult, PASS);
  assert.strictEqual(summary.implementationApprovalDecisionIssued, true);
  assert.strictEqual(summary.implementationApprovalGranted, true);
  assert.strictEqual(
    summary.implementationApprovalScope,
    STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
  );
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
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-4Y");
  assert.strictEqual(summary.executionApprovalReadinessResult, PASS);
  assert.strictEqual(summary.implementationApprovalDecisionIssued, true);
  assert.strictEqual(summary.oro4xImplementationApprovalGranted, true);
  assert.strictEqual(
    summary.implementationApprovalScope,
    STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
  );
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
  assert.strictEqual(summary.executionApprovalReadinessResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.executionApprovalReadinessRecorded, false);
  assert.strictEqual(summary.executionApprovalGranted, false);
  assert.strictEqual(summary.routeMountPatchReviewPrepared, false);
  assert.strictEqual(summary.routeMountPatchReviewed, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
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
  const allFixtures = buildOro4yRouteMountExecutionApprovalReadinessFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathExecutionReadinessRecordedFixture",
    "missingOro4xDecisionFixture",
    "oro4xDecisionFailedFixture",
    "implementationApprovalNotGrantedFixture",
    "implementationApprovalScopeWrongFixture",
    "implementationExecutionIncorrectlyApprovedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
    "routeMountPatchIncorrectlyImplementedFixture",
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
    "readinessRequiresExplicitExecutionApprovalFixture",
    "runtimeTrafficRequiresSeparateApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_STATUS, "object");
  assert.strictEqual(typeof buildOro4yRouteMountExecutionApprovalInput, "function");
  assert.strictEqual(
    typeof evaluateOro4yRouteMountExecutionApprovalReadiness,
    "function"
  );
  assert.strictEqual(typeof buildOro4yRouteMountPatchReviewGate, "function");
  assert.strictEqual(
    typeof buildOro4yRouteMountExecutionApprovalSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro4yRouteMountExecutionApprovalReadiness,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro4xDecision();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4yRouteMountExecutionApprovalReadiness(
    happyPathExecutionReadinessRecordedFixture
  ));
  assertHappyPath(buildOro4yRouteMountExecutionApprovalSummary(
    readinessRequiresExplicitExecutionApprovalFixture
  ));
  assertHappyPath(buildOro4yRouteMountExecutionApprovalSummary(
    runtimeTrafficRequiresSeparateApprovalFixture
  ));

  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(missingOro4xDecisionFixture),
    "ORO-4X implementation approval decision is required"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(oro4xDecisionFailedFixture),
    "ORO-4X decision result must be PASS"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      implementationApprovalNotGrantedFixture
    ),
    "ORO-4X implementation approval must be granted"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      implementationApprovalScopeWrongFixture
    ),
    "implementation approval scope must be static planning only"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      implementationExecutionIncorrectlyApprovedFixture
    ),
    "implementation execution must remain not approved"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      routeMountExecutionAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount execution authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      routeMountPatchIncorrectlyImplementedFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(expressMountAllowedTrueFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(publicAliasAllowedTrueFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(runtimeTrafficAllowedTrueFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedSrcAppJsEditFixture),
    "readiness must not edit src/app.js"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "readiness must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedWalletMutationFixture),
    "readiness must not try wallet mutation"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedLedgerMutationFixture),
    "readiness must not try ledger mutation"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedPrismaWriteFixture),
    "readiness must not try Prisma write"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedDbTransactionFixture),
    "readiness must not try DB transaction"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedMigrationFixture),
    "readiness must not try migration"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(attemptedExternalNetworkFixture),
    "readiness must not try external network"
  );
  assertHeld(
    evaluateOro4yRouteMountExecutionApprovalReadiness(secretShapedOutputFixture),
    "readiness output contains secret-shaped marker"
  );

  const gate = buildOro4yRouteMountPatchReviewGate();
  assert.strictEqual(gate.executionApprovalReadinessRecorded, true);
  assert.strictEqual(gate.executionApprovalGranted, false);
  assert.strictEqual(gate.routeMountPatchReviewPrepared, true);
  assert.strictEqual(gate.routeMountPatchReviewed, false);
  assert.strictEqual(gate.routeMountPatchApproved, false);
  assert.strictEqual(gate.routeMountPatchImplemented, false);
  assert.strictEqual(gate.implementationExecutionApproved, false);
  assert.strictEqual(gate.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);

  const validation = validateOro4yRouteMountExecutionApprovalReadiness();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4yRouteMountExecutionApprovalReadinessFixtures().map(
    evaluateOro4yRouteMountExecutionApprovalReadiness
  );
  assert(allReports.length >= 24, "fixture set must cover ORO-4Y required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.executionApprovalGranted, false);
    assert.strictEqual(report.routeMountPatchReviewed, false);
    assert.strictEqual(report.routeMountPatchApproved, false);
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
    assert.strictEqual(report.nextPhaseRequiresExplicitExecutionApproval, true);
    assert.strictEqual(report.nextPhaseRequiresActualPatchImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4Y execution approval readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4Y execution approval readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
