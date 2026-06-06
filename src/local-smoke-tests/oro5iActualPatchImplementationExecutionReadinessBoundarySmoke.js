"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundary");
const fixtures = require("../game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundaryFixtures");

const {
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  APPROVED,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_STATUS,
  PASS,
  PREPARED,
  READY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY_FOR_REVIEW,
  buildOro5iActualPatchImplementationExecutionReadinessInput,
  evaluateOro5iActualPatchImplementationExecutionReadiness,
  buildOro5iIsolatedMockExecutionPlan,
  buildOro5iActualRuntimeImplementationStillHeldGate,
  buildOro5iRouteMountStillHeldGate,
  buildOro5iRuntimeTrafficStillHeldGate,
  buildOro5iActualPatchImplementationExecutionReadinessSummary,
  validateOro5iActualPatchImplementationExecutionReadiness,
} = helper;

const {
  authorizationNotGrantedFixture,
  buildOro5iActualPatchImplementationExecutionReadinessFixtures,
  dbTransactionAllowedUnexpectedlyFixture,
  expressMountAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationExecutionReadinessFixture,
  implementationAlreadyImplementedFixture,
  implementationAlreadyStartedFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  missingOro5hDecisionFixture,
  oro5hDecisionNotApprovedFixture,
  patchAlreadyAppliedFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  srcAppChangedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  wrongGrantScopeFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md";
const ORO5H_DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5G_DOC =
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const ORO5F_DOC =
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5iSmoke.js";
const SCRIPT = "smoke:oro-5i";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5H_DOC,
  ORO5G_DOC,
  ORO5F_DOC,
  "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundary.js",
  "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro5iActualPatchImplementationExecutionReadinessBoundarySmoke.js",
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
    "ORO-5I",
    "oro5i",
    "actualPatchImplementationExecutionReadiness",
  ]) {
    assert(!app.includes(marker), `src/app.js must not include ${marker}.`);
  }
}

function assertOro5sPublicAliasWiringOnly() {
  const app = readRequired("src/app.js");
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `src/app.js missing ORO-5S fail-closed marker ${marker}.`);
  }
  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
    "PrismaClient",
    "prisma.",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert(!app.includes(marker), `src/app.js contains unsafe ORO-5S alias marker ${marker}.`);
  }
}

function assertNoActiveRouteMountInApp() {
  assertOro5sPublicAliasWiringOnly();
}

function assertNoRuntimeImplementationText() {
  const helperText = readRequired(
    "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5iActualPatchImplementationExecutionReadinessBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5I files must not contain ${marker}.`);
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
    "## ORO-5I scope",
    "## Input from ORO-5H",
    "## Execution readiness rules",
    "## Isolated mock execution plan",
    "## Actual runtime implementation still held gate",
    "## Route mount authorization still held gate",
    "## No Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Wallet / ledger / Prisma write boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5H issued actual patch implementation authorization decision",
    "ORO-5H granted authorization scope only for `actual_patch_implementation_execution_boundary_only`",
    "ORO-5I checks actual patch implementation execution readiness only",
    "ORO-5I prepares isolated mock execution plan only",
    "ORO-5I does not start runtime execution",
    "ORO-5I does not apply actual runtime patch",
    "ORO-5I does not edit src/app.js",
    "ORO-5I does not mount Express route",
    "ORO-5I does not enable public alias",
    "ORO-5I does not allow runtime traffic",
    "ORO-5I does not mutate wallet/ledger",
    "ORO-5I does not write Prisma/DB",
    "ORO-5I does not call live OroPlay API",
    "future actual patch implementation execution requires separate explicit phase",
    "future route mount authorization requires separate explicit authorization",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "actualPatchImplementationExecutionReadinessChecked = true",
    "actualPatchImplementationExecutionReadinessStatus = ready_for_isolated_mock_execution_boundary",
    "isolatedMockExecutionPlanPrepared = true",
    "executionBoundaryEntryScope = isolated_mock_execution_plan_only",
    "actualPatchImplementationExecutionStarted = false",
    "actualPatchImplementationPatchApplied = false",
    "actualPatchImplementationImplemented = false",
    "runtimeActualPatchImplementationImplemented = false",
    "runtimeRoutePatched = false",
    "runtimeRouteControllerChanged = false",
    "srcAppChanged = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "expressMountAllowed = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "prismaWriteAllowed = false",
    "dbTransactionAllowed = false",
    "migrationAllowed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "nextPhaseRequiresPostExecutionValidation = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5i", "oro-5i"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5I actual patch implementation execution readiness",
        "ORO-5I checks actual patch implementation execution readiness",
        "ORO-5I prepares isolated mock execution plan only",
        "next phase is actual patch implementation execution boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5I Current",
        "ORO-5I checks actual patch implementation execution readiness",
        "isolatedMockExecutionPlanPrepared=true",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5I actual patch implementation execution readiness",
        "ORO-5I prepares isolated mock execution plan only",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5I Actual Patch Implementation Execution Readiness Coverage",
        SCRIPT,
        "isolated mock execution plan",
      ],
    ],
    [ORO5H_DOC, ["ORO-5I checks actual patch implementation execution readiness"]],
    [ORO5G_DOC, ["ORO-5I checks actual patch implementation execution readiness"]],
    [ORO5F_DOC, ["ORO-5I checks actual patch implementation execution readiness"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5I");
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessBoundaryResult, PASS);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionResult, APPROVED);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationGrantScope,
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationAuthorized, true);
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessChecked, true);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionReadinessStatus,
    READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessResult, READY);
  assert.strictEqual(summary.isolatedMockExecutionPlanPrepared, true);
  assert.strictEqual(summary.isolatedMockExecutionPlanStatus, PREPARED);
  assert.strictEqual(summary.isolatedMockExecutionPlanResult, READY_FOR_REVIEW);
  assert.strictEqual(summary.executionBoundaryEntryAllowed, true);
  assert.strictEqual(
    summary.executionBoundaryEntryScope,
    ISOLATED_MOCK_EXECUTION_PLAN_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(summary.actualPatchImplementationPatchApplied, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
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
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresPostExecutionValidation, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.actualPatchImplementationExecutionReadinessBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessChecked, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessStatus, "HOLD");
  assert.strictEqual(summary.isolatedMockExecutionPlanPrepared, false);
  assert.strictEqual(summary.executionBoundaryEntryAllowed, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(summary.actualPatchImplementationPatchApplied, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
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
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(
    summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresPostExecutionValidation, true);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro5iActualPatchImplementationExecutionReadinessFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationExecutionReadinessFixture",
    "missingOro5hDecisionFixture",
    "oro5hDecisionNotApprovedFixture",
    "authorizationNotGrantedFixture",
    "wrongGrantScopeFixture",
    "implementationAlreadyStartedFixture",
    "patchAlreadyAppliedFixture",
    "implementationAlreadyImplementedFixture",
    "runtimeRoutePatchedUnexpectedlyFixture",
    "srcAppChangedUnexpectedlyFixture",
    "routeControllerChangedUnexpectedlyFixture",
    "routeMountApprovedUnexpectedlyFixture",
    "routeMountImplementationAuthorizedUnexpectedlyFixture",
    "routeMountAuthorizedUnexpectedlyFixture",
    "expressMountAllowedUnexpectedlyFixture",
    "publicAliasAllowedUnexpectedlyFixture",
    "runtimeTrafficAllowedUnexpectedlyFixture",
    "walletMutationAllowedUnexpectedlyFixture",
    "ledgerMutationAllowedUnexpectedlyFixture",
    "prismaWriteAllowedUnexpectedlyFixture",
    "dbTransactionAllowedUnexpectedlyFixture",
    "migrationAllowedUnexpectedlyFixture",
    "externalNetworkAllowedUnexpectedlyFixture",
    "liveOroPlayApiCallAllowedUnexpectedlyFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(
    typeof ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5iActualPatchImplementationExecutionReadinessInput, "function");
  assert.strictEqual(typeof evaluateOro5iActualPatchImplementationExecutionReadiness, "function");
  assert.strictEqual(typeof buildOro5iIsolatedMockExecutionPlan, "function");
  assert.strictEqual(typeof buildOro5iActualRuntimeImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5iRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5iRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5iActualPatchImplementationExecutionReadinessSummary, "function");
  assert.strictEqual(typeof validateOro5iActualPatchImplementationExecutionReadiness, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5iActualPatchImplementationExecutionReadiness(
      happyPathActualPatchImplementationExecutionReadinessFixture
    )
  );

  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(missingOro5hDecisionFixture),
    "ORO-5H authorization decision is required"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(oro5hDecisionNotApprovedFixture),
    "ORO-5H authorization decision must be approved"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(authorizationNotGrantedFixture),
    "actual patch implementation authorization must be granted"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(wrongGrantScopeFixture),
    "actual patch implementation authorization grant scope must be execution boundary only"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(implementationAlreadyStartedFixture),
    "actual patch implementation execution must not be started"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(patchAlreadyAppliedFixture),
    "actual patch implementation patch must not be applied"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(implementationAlreadyImplementedFixture),
    "actual patch implementation must not be implemented"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(runtimeRoutePatchedUnexpectedlyFixture),
    "runtime route must not be patched"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(srcAppChangedUnexpectedlyFixture),
    "src/app.js must not be changed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(routeControllerChangedUnexpectedlyFixture),
    "runtime route or controller must not be changed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(routeMountApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(routeMountImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(walletMutationAllowedUnexpectedlyFixture),
    "wallet mutation must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(ledgerMutationAllowedUnexpectedlyFixture),
    "ledger mutation must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(prismaWriteAllowedUnexpectedlyFixture),
    "Prisma write must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(dbTransactionAllowedUnexpectedlyFixture),
    "DB transaction must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(migrationAllowedUnexpectedlyFixture),
    "migration must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(externalNetworkAllowedUnexpectedlyFixture),
    "external network must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(liveOroPlayApiCallAllowedUnexpectedlyFixture),
    "live OroPlay API call must remain not allowed"
  );
  assertHeld(
    evaluateOro5iActualPatchImplementationExecutionReadiness(secretShapedOutputFixture),
    "execution readiness output contains secret-shaped marker"
  );

  const plan = buildOro5iIsolatedMockExecutionPlan();
  assert.strictEqual(plan.isolatedMockExecutionPlanPrepared, true);
  assert.strictEqual(plan.executionBoundaryEntryAllowed, true);
  assert.strictEqual(plan.executionBoundaryEntryScope, ISOLATED_MOCK_EXECUTION_PLAN_ONLY);
  assert.strictEqual(plan.runtimeRoutePatched, false);
  assert.strictEqual(plan.srcAppChanged, false);

  const runtimeGate = buildOro5iActualRuntimeImplementationStillHeldGate();
  assert.strictEqual(runtimeGate.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(runtimeGate.actualPatchImplementationPatchApplied, false);
  assert.strictEqual(runtimeGate.actualPatchImplementationImplemented, false);
  assert.strictEqual(runtimeGate.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(runtimeGate.liveOroPlayApiCallAllowed, false);

  const mountGate = buildOro5iRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);
  assert.strictEqual(mountGate.publicAliasAllowed, false);

  const trafficGate = buildOro5iRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.publicAliasAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.externalNetworkAllowed, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCallAllowed, false);

  const validation = validateOro5iActualPatchImplementationExecutionReadiness();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5iActualPatchImplementationExecutionReadinessFixtures().map(
      evaluateOro5iActualPatchImplementationExecutionReadiness
    );
  assert(allReports.length >= 24, "fixture set must cover ORO-5I required cases.");
  for (const report of allReports) {
    const isPass =
      report.actualPatchImplementationExecutionReadinessBoundaryResult === PASS;
    assert.strictEqual(report.executionBoundaryEntryAllowed, isPass);
    assert.strictEqual(report.actualPatchImplementationExecutionStarted, false);
    assert.strictEqual(report.actualPatchImplementationPatchApplied, false);
    assert.strictEqual(report.actualPatchImplementationImplemented, false);
    assert.strictEqual(report.runtimeActualPatchImplementationImplemented, false);
    assert.strictEqual(report.runtimeRoutePatched, false);
    assert.strictEqual(report.runtimeRouteControllerChanged, false);
    assert.strictEqual(report.srcAppChanged, false);
    assert.strictEqual(report.routeMountPatchApproved, false);
    assert.strictEqual(report.routeMountPatchImplementationAuthorized, false);
    assert.strictEqual(report.routeMountPatchImplemented, false);
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
    assert.strictEqual(report.liveOroPlayApiCallAllowed, false);
    assert.strictEqual(
      report.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
      true
    );
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assert.strictEqual(report.nextPhaseRequiresPostExecutionValidation, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5I actual patch implementation execution readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5I actual patch implementation execution readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
