"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundary");
const fixtures = require("../game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundaryFixtures");
const oro4w = require("../game-provider-mock/oro4wRouteMountImplementationApprovalReadiness");

const {
  NOT_AUTHORIZED_FOR_EXECUTION,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS,
  PASS,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
  buildOro4xExecutionStillNotAuthorizedGate,
  buildOro4xRouteMountImplementationApprovalDecisionInput,
  buildOro4xRouteMountImplementationApprovalSummary,
  evaluateOro4xRouteMountImplementationApprovalDecisionBoundary,
  validateOro4xRouteMountImplementationApprovalDecisionBoundary,
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
  buildOro4xRouteMountImplementationApprovalDecisionFixtures,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathImplementationApprovalDecisionRecordedFixture,
  implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture,
  missingOro4wReadinessFixture,
  oro4wReadinessFailedFixture,
  publicAliasAllowedTrueFixture,
  readinessNotRecordedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  runtimeTrafficAllowedTrueFixture,
  runtimeTrafficSeparateApprovalRequiredFixture,
  secretShapedOutputFixture,
  separateExecutionApprovalRequiredFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const ORO4W_DOC = "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md";
const ORO4V_DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4xSmoke.js";
const SCRIPT = "smoke:oro-4x";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4W_DOC,
  ORO4V_DOC,
  "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundary.js",
  "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro4xRouteMountImplementationApprovalDecisionBoundarySmoke.js",
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
    "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro4xRouteMountImplementationApprovalDecisionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-4X files must not contain ${marker}.`);
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
    "## ORO-4X scope",
    "## Input from ORO-4W",
    "## Implementation approval decision rules",
    "## Execution still not authorized gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4W implementation approval readiness has been recorded",
    "ORO-4X records explicit implementation approval decision",
    "static_route_mount_implementation_planning_only",
    "ORO-4X does not edit src/app.js",
    "ORO-4X does not mount Express route",
    "ORO-4X does not enable public alias",
    "ORO-4X does not allow runtime traffic",
    "ORO-4X does not mutate wallet/ledger",
    "ORO-4X does not write Prisma/DB",
    "ORO-4X does not call live OroPlay API",
    "ORO-4X does not authorize real route mount execution",
    "ORO-4X does not authorize runtime traffic",
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

  const oro4wDoc = readRequired(ORO4W_DOC);
  for (const marker of [
    "ORO-4W implementation approval readiness",
    "ORO-4X implementation approval decision",
    "nextPhaseRequiresSeparateExecutionApproval = true",
  ]) {
    assert(oro4wDoc.includes(marker), `${ORO4W_DOC} missing marker ${marker}.`);
  }

  const oro4vDoc = readRequired(ORO4V_DOC);
  for (const marker of [
    "ORO-4V route mount approval boundary",
    "ORO-4W implementation approval readiness",
  ]) {
    assert(oro4vDoc.includes(marker), `${ORO4V_DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4x"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4X implementation approval decision",
        "ORO-4X execution still not authorized gate",
        "implementationApprovalDecisionIssued=true",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4X Current",
        "implementation approval decision issued",
        "routeMountExecutionAuthorization=not_authorized_for_execution",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4X implementation approval decision",
        "ORO-4X execution still not authorized gate",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4X Route Mount Implementation Approval Decision Coverage",
        SCRIPT,
        "implementation approval decision issued",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro4wReadiness() {
  const summary = oro4w.evaluateOro4wRouteMountImplementationApprovalReadiness();
  assert.strictEqual(summary.implementationApprovalReadinessResult, PASS);
  assert.strictEqual(summary.implementationApprovalReadinessRecorded, true);
  assert.strictEqual(summary.implementationApprovalGranted, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-4X");
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
  assert.strictEqual(summary.implementationApprovalReadinessRecorded, true);
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
  assert.strictEqual(summary.nextPhaseRequiresSeparateExecutionApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresRouteMountPatchReview, true);
  assert.strictEqual(summary.nextPhaseRequiresExplicitRuntimeTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.implementationApprovalDecisionResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.implementationApprovalGranted, false);
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
  const allFixtures = buildOro4xRouteMountImplementationApprovalDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathImplementationApprovalDecisionRecordedFixture",
    "missingOro4wReadinessFixture",
    "oro4wReadinessFailedFixture",
    "readinessNotRecordedFixture",
    "implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
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
    "separateExecutionApprovalRequiredFixture",
    "runtimeTrafficSeparateApprovalRequiredFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS, "object");
  assert.strictEqual(
    typeof buildOro4xRouteMountImplementationApprovalDecisionInput,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro4xRouteMountImplementationApprovalDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro4xExecutionStillNotAuthorizedGate, "function");
  assert.strictEqual(
    typeof buildOro4xRouteMountImplementationApprovalSummary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro4xRouteMountImplementationApprovalDecisionBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro4wReadiness();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
    happyPathImplementationApprovalDecisionRecordedFixture
  ));
  assertHappyPath(buildOro4xRouteMountImplementationApprovalSummary(
    separateExecutionApprovalRequiredFixture
  ));
  assertHappyPath(buildOro4xRouteMountImplementationApprovalSummary(
    runtimeTrafficSeparateApprovalRequiredFixture
  ));

  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      missingOro4wReadinessFixture
    ),
    "ORO-4W implementation approval readiness is required"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      oro4wReadinessFailedFixture
    ),
    "ORO-4W readiness result must be PASS"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(readinessNotRecordedFixture),
    "ORO-4W implementation approval readiness must be recorded"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture
    ),
    "implementation approval must not approve execution"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      routeMountExecutionAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount execution authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(expressMountAllowedTrueFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      expressMountImplementedTrueFixture
    ),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(publicAliasAllowedTrueFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(runtimeTrafficAllowedTrueFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedSrcAppJsEditFixture),
    "decision must not edit src/app.js"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "decision must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedWalletMutationFixture),
    "decision must not try wallet mutation"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedLedgerMutationFixture),
    "decision must not try ledger mutation"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedPrismaWriteFixture),
    "decision must not try Prisma write"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedDbTransactionFixture),
    "decision must not try DB transaction"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedMigrationFixture),
    "decision must not try migration"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(attemptedExternalNetworkFixture),
    "decision must not try external network"
  );
  assertHeld(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(secretShapedOutputFixture),
    "decision output contains secret-shaped marker"
  );

  const gate = buildOro4xExecutionStillNotAuthorizedGate();
  assert.strictEqual(gate.implementationApprovalDecisionIssued, true);
  assert.strictEqual(gate.implementationApprovalGranted, true);
  assert.strictEqual(
    gate.implementationApprovalScope,
    STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
  );
  assert.strictEqual(gate.implementationExecutionApproved, false);
  assert.strictEqual(gate.routeMountExecutionAuthorization, NOT_AUTHORIZED_FOR_EXECUTION);
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);

  const validation = validateOro4xRouteMountImplementationApprovalDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4xRouteMountImplementationApprovalDecisionFixtures().map(
    evaluateOro4xRouteMountImplementationApprovalDecisionBoundary
  );
  assert(allReports.length >= 22, "fixture set must cover ORO-4X required cases.");
  for (const report of allReports) {
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
    assert.strictEqual(report.nextPhaseRequiresSeparateExecutionApproval, true);
    assert.strictEqual(report.nextPhaseRequiresRouteMountPatchReview, true);
    assert.strictEqual(report.nextPhaseRequiresExplicitRuntimeTrafficApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4X implementation approval decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4X implementation approval decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
