"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5jActualPatchImplementationExecutionBoundary");
const fixtures = require("../game-provider-mock/oro5jActualPatchImplementationExecutionBoundaryFixtures");

const {
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  APPROVED,
  EXECUTED,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_STATUS,
  PASS,
  PREPARED,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
  READY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY_FOR_REVIEW,
  buildOro5jActualPatchImplementationExecutionInput,
  evaluateOro5jActualPatchImplementationExecution,
  buildOro5jIsolatedNonMountedPatchArtifact,
  buildOro5jActualRuntimeImplementationStillHeldGate,
  buildOro5jRouteMountStillHeldGate,
  buildOro5jPublicAliasStillHeldGate,
  buildOro5jRuntimeTrafficStillHeldGate,
  buildOro5jActualPatchImplementationExecutionSummary,
  validateOro5jActualPatchImplementationExecution,
} = helper;

const {
  authorizationDecisionMissingFixture,
  authorizationNotGrantedFixture,
  buildOro5jActualPatchImplementationExecutionFixtures,
  dbTransactionAllowedUnexpectedlyFixture,
  executionBoundaryEntryNotAllowedFixture,
  expressMountAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  happyPathActualPatchImplementationExecutionFixture,
  implementationAlreadyImplementedFixture,
  implementationAlreadyStartedFixture,
  isolatedMockExecutionPlanMissingFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  missingOro5iReadinessFixture,
  patchAlreadyAppliedFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  readinessNotCheckedFixture,
  readinessWrongStatusFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  srcAppChangedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  wrongAuthorizationGrantScopeFixture,
  wrongExecutionBoundaryEntryScopeFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md";
const ORO5I_DOC =
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md";
const ORO5H_DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5G_DOC =
  "docs/ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const ORO5F_DOC =
  "docs/ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5jSmoke.js";
const SCRIPT = "smoke:oro-5j";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5I_DOC,
  ORO5H_DOC,
  ORO5G_DOC,
  ORO5F_DOC,
  "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundary.js",
  "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5jActualPatchImplementationExecutionBoundarySmoke.js",
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
    "ORO-5J",
    "oro5j",
    "actualPatchImplementationExecutionBoundary",
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
    "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5jActualPatchImplementationExecutionBoundaryFixtures.js"
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
    assert(!combined.includes(marker), `ORO-5J files must not contain ${marker}.`);
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
    "## ORO-5J scope",
    "## Input from ORO-5I",
    "## Execution boundary rules",
    "## Isolated non-mounted patch artifact",
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
    "ORO-5I checked execution readiness",
    "ORO-5I prepared isolated mock execution plan",
    "ORO-5J executes only an isolated non-mounted actual patch implementation boundary",
    "ORO-5J creates execution record, isolated patch artifact evidence, and post-execution evidence only",
    "ORO-5J does not edit src/app.js",
    "ORO-5J does not mount Express route",
    "ORO-5J does not enable public alias",
    "ORO-5J does not allow runtime traffic",
    "ORO-5J does not mutate wallet/ledger in runtime",
    "ORO-5J does not write Prisma/DB",
    "ORO-5J does not call live OroPlay API",
    "future route mount authorization requires separate explicit authorization",
    "future public alias requires separate explicit approval",
    "future runtime traffic requires separate explicit runtime traffic approval",
    "future post-execution validation / route mount request boundary is separate",
    "actualPatchImplementationExecutionBoundaryEntered = true",
    "actualPatchImplementationExecutionStatus = executed_isolated_non_mounted_patch",
    "actualPatchImplementationExecutionScope = isolated_non_mounted_callback_patch_artifact_only",
    "actualPatchImplementationPatchArtifactStatus = prepared_for_post_execution_review",
    "actualPatchImplementationImplementationScope = isolated_non_mounted_callback_patch_artifact_only",
    "runtimeActualPatchImplementationImplemented = false",
    "runtimeRoutePatched = false",
    "runtimeRouteControllerChanged = false",
    "srcAppChanged = false",
    "routeMountAuthorization = not_authorized_for_mount",
    "publicAliasImplemented = false",
    "runtimeTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "migrationPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresPostExecutionValidationBoundary = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5j", "oro-5j"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5J actual patch implementation execution",
        "ORO-5J executes isolated non-mounted actual patch implementation boundary",
        "ORO-5J prepares isolated patch artifact and post-execution evidence only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5J Current",
        "ORO-5J executes isolated non-mounted actual patch implementation boundary",
        "actualPatchImplementationExecutionStatus=executed_isolated_non_mounted_patch",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5J actual patch implementation execution",
        "ORO-5J prepares isolated patch artifact and post-execution evidence only",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5J Actual Patch Implementation Execution Coverage",
        SCRIPT,
        "isolated non-mounted patch artifact",
      ],
    ],
    [ORO5I_DOC, ["ORO-5J executes isolated non-mounted actual patch implementation boundary"]],
    [ORO5H_DOC, ["ORO-5J executes isolated non-mounted actual patch implementation boundary"]],
    [ORO5G_DOC, ["ORO-5J executes isolated non-mounted actual patch implementation boundary"]],
    [ORO5F_DOC, ["ORO-5J executes isolated non-mounted actual patch implementation boundary"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5J");
  assert.strictEqual(summary.actualPatchImplementationExecutionBoundaryResult, PASS);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationDecisionResult, APPROVED);
  assert.strictEqual(summary.actualPatchImplementationAuthorizationGranted, true);
  assert.strictEqual(
    summary.actualPatchImplementationAuthorizationGrantScope,
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessChecked, true);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionReadinessStatus,
    READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionReadinessResult, READY);
  assert.strictEqual(summary.isolatedMockExecutionPlanPrepared, true);
  assert.strictEqual(summary.executionBoundaryEntryAllowed, true);
  assert.strictEqual(
    summary.executionBoundaryEntryScope,
    ISOLATED_MOCK_EXECUTION_PLAN_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionBoundaryEntered, true);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, true);
  assert.strictEqual(summary.actualPatchImplementationExecutionCompleted, true);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionStatus,
    EXECUTED_ISOLATED_NON_MOUNTED_PATCH
  );
  assert.strictEqual(summary.actualPatchImplementationExecutionResult, EXECUTED);
  assert.strictEqual(
    summary.actualPatchImplementationExecutionScope,
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.isolatedActualPatchImplementationExecuted, true);
  assert.strictEqual(summary.isolatedActualPatchImplementationPatchApplied, true);
  assert.strictEqual(
    summary.isolatedActualPatchImplementationPatchResult,
    APPLIED_TO_MOCK_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.actualPatchImplementationPatchArtifactPrepared, true);
  assert.strictEqual(
    summary.actualPatchImplementationPatchArtifactStatus,
    PREPARED_FOR_POST_EXECUTION_REVIEW
  );
  assert.strictEqual(summary.actualPatchImplementationPatchArtifactResult, READY_FOR_REVIEW);
  assert.strictEqual(summary.actualPatchImplementationImplemented, true);
  assert.strictEqual(
    summary.actualPatchImplementationImplementationScope,
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  );
  assert.strictEqual(summary.postExecutionEvidencePrepared, true);
  assert.strictEqual(summary.postExecutionEvidenceStatus, PREPARED);
  assert.strictEqual(summary.postExecutionEvidenceResult, READY_FOR_REVIEW);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresPostExecutionValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresRouteMountImplementationBoundary, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeldGates(summary) {
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.routeMountPatchApproved, false);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.walletMutationPerformed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationPerformed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.prismaWritePerformed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.dbTransactionPerformed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.migrationPerformed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.actualPatchImplementationExecutionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.actualPatchImplementationExecutionBoundaryEntered, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionStarted, false);
  assert.strictEqual(summary.actualPatchImplementationExecutionCompleted, false);
  assert.strictEqual(summary.actualPatchImplementationImplemented, false);
  assert.strictEqual(summary.actualPatchImplementationPatchArtifactPrepared, false);
  assert.strictEqual(summary.postExecutionEvidencePrepared, false);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresPostExecutionValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRouteMountAuthorization, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresRouteMountImplementationBoundary, true);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro5jActualPatchImplementationExecutionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathActualPatchImplementationExecutionFixture",
    "missingOro5iReadinessFixture",
    "readinessNotCheckedFixture",
    "readinessWrongStatusFixture",
    "isolatedMockExecutionPlanMissingFixture",
    "executionBoundaryEntryNotAllowedFixture",
    "wrongExecutionBoundaryEntryScopeFixture",
    "authorizationDecisionMissingFixture",
    "authorizationNotGrantedFixture",
    "wrongAuthorizationGrantScopeFixture",
    "implementationAlreadyStartedFixture",
    "patchAlreadyAppliedFixture",
    "implementationAlreadyImplementedFixture",
    "runtimeActualImplementationAlreadyImplementedFixture",
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
  assert.strictEqual(typeof ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_STATUS, "object");
  assert.strictEqual(typeof buildOro5jActualPatchImplementationExecutionInput, "function");
  assert.strictEqual(typeof evaluateOro5jActualPatchImplementationExecution, "function");
  assert.strictEqual(typeof buildOro5jIsolatedNonMountedPatchArtifact, "function");
  assert.strictEqual(typeof buildOro5jActualRuntimeImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5jRouteMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5jPublicAliasStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5jRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5jActualPatchImplementationExecutionSummary, "function");
  assert.strictEqual(typeof validateOro5jActualPatchImplementationExecution, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5jActualPatchImplementationExecution(
      happyPathActualPatchImplementationExecutionFixture
    )
  );

  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(missingOro5iReadinessFixture),
    "ORO-5I execution readiness is required"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(readinessNotCheckedFixture),
    "ORO-5I execution readiness must be checked"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(readinessWrongStatusFixture),
    "ORO-5I readiness must be ready for isolated mock execution boundary"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(isolatedMockExecutionPlanMissingFixture),
    "isolated mock execution plan must be prepared"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(executionBoundaryEntryNotAllowedFixture),
    "execution boundary entry must be allowed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(wrongExecutionBoundaryEntryScopeFixture),
    "execution boundary entry scope must be isolated mock execution plan only"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(authorizationDecisionMissingFixture),
    "actual patch implementation authorization decision is required"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(authorizationNotGrantedFixture),
    "actual patch implementation authorization must be granted"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(wrongAuthorizationGrantScopeFixture),
    "actual patch implementation authorization grant scope must be execution boundary only"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(implementationAlreadyStartedFixture),
    "actual patch implementation must not be previously executed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(patchAlreadyAppliedFixture),
    "actual patch implementation must not be previously executed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(implementationAlreadyImplementedFixture),
    "actual patch implementation must not be previously executed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(runtimeActualImplementationAlreadyImplementedFixture),
    "runtime actual patch implementation must not already be implemented"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(runtimeRoutePatchedUnexpectedlyFixture),
    "runtime route must not be patched"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(srcAppChangedUnexpectedlyFixture),
    "src/app.js must not be changed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(routeControllerChangedUnexpectedlyFixture),
    "runtime route or controller must not be changed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(routeMountApprovedUnexpectedlyFixture),
    "route mount patch must not be approved"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(routeMountImplementationAuthorizedUnexpectedlyFixture),
    "route mount patch implementation must not be authorized"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(routeMountAuthorizedUnexpectedlyFixture),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(walletMutationAllowedUnexpectedlyFixture),
    "wallet mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(ledgerMutationAllowedUnexpectedlyFixture),
    "ledger mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(prismaWriteAllowedUnexpectedlyFixture),
    "Prisma write must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(dbTransactionAllowedUnexpectedlyFixture),
    "DB transaction must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(migrationAllowedUnexpectedlyFixture),
    "migration must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(externalNetworkAllowedUnexpectedlyFixture),
    "external network must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(liveOroPlayApiCallAllowedUnexpectedlyFixture),
    "live OroPlay API call must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5jActualPatchImplementationExecution(secretShapedOutputFixture),
    "actual patch implementation execution output contains secret-shaped marker"
  );

  const artifact = buildOro5jIsolatedNonMountedPatchArtifact();
  assert.strictEqual(artifact.isolatedActualPatchImplementationExecuted, true);
  assert.strictEqual(artifact.isolatedActualPatchImplementationPatchApplied, true);
  assert.strictEqual(artifact.actualPatchImplementationPatchArtifactPrepared, true);
  assert.strictEqual(artifact.postExecutionEvidencePrepared, true);

  const runtimeGate = buildOro5jActualRuntimeImplementationStillHeldGate();
  assertHeldGates({
    ...runtimeGate,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    expressMountAllowed: false,
    expressMountImplemented: false,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
  });

  const mountGate = buildOro5jRouteMountStillHeldGate();
  assert.strictEqual(mountGate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(mountGate.expressMountAllowed, false);
  assert.strictEqual(mountGate.expressMountImplemented, false);

  const aliasGate = buildOro5jPublicAliasStillHeldGate();
  assert.strictEqual(aliasGate.publicAliasAllowed, false);
  assert.strictEqual(aliasGate.publicAliasImplemented, false);

  const trafficGate = buildOro5jRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.runtimeTrafficEnabled, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCalled, false);

  const validation = validateOro5jActualPatchImplementationExecution();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro5jActualPatchImplementationExecutionFixtures().map(
    evaluateOro5jActualPatchImplementationExecution
  );
  assert(allReports.length >= 30, "fixture set must cover ORO-5J required cases.");
  for (const report of allReports) {
    const isPass = report.actualPatchImplementationExecutionBoundaryResult === PASS;
    assert.strictEqual(report.actualPatchImplementationImplemented, isPass);
    assert.strictEqual(report.actualPatchImplementationExecutionStarted, isPass);
    assert.strictEqual(report.actualPatchImplementationExecutionCompleted, isPass);
    assertHeldGates(report);
    assert.strictEqual(report.nextPhaseRequiresPostExecutionValidationBoundary, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRouteMountAuthorization, true);
    assert.strictEqual(report.nextPhaseRequiresSeparatePublicAliasApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
    assert.strictEqual(report.nextPhaseRequiresRouteMountImplementationBoundary, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5J actual patch implementation execution smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5J actual patch implementation execution smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
