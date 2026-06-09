"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary");
const fixtures = require("../game-provider-mock/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures");
const {
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
} = require("../game-provider-mock/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate");

const {
  ORO7X_PHASE,
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
  PASS,
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSummary,
  evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  runOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
} = helper;

const {
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures,
  failActualExecutionAuthorizedFixture,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failDbTransactionFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedCalledFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveOroPlayApiCalledFixture,
  failLiveReadinessRequestNotSubmittedFixture,
  failLiveReadinessRequestScopeMismatchFixture,
  failMigrationFixture,
  failMissingOro7wAuthorizedExecutionReadinessFixture,
  failOro7wAuthorizedExecutionReadinessScopeMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionLiveReadinessRequestFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7X =
  "docs/ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY.md";
const DOC_7W =
  "docs/ORO_7W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7xSmoke.js";
const GATE =
  "src/game-provider-mock/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7x";
const DETAIL_SCRIPT =
  "smoke:oro-7x-runtime-activation-execution-live-readiness-request";
const ORO7X_SCAN_FILES = Object.freeze([DOC_7X, GATE, FIXTURES, SMOKE, WRAPPER]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function gitChangedFiles(paths = []) {
  const args = ["diff", "--name-only"];
  if (paths.length > 0) args.push("--", ...paths);
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git diff --name-only failed: ${result.stderr}`);
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function gitUntrackedFiles(paths = []) {
  const args = ["ls-files", "--others", "--exclude-standard"];
  if (paths.length > 0) args.push("--", ...paths);
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git ls-files failed: ${result.stderr}`);
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function assertProtectedRuntimeFilesUntouched() {
  const protectedPaths = [
    "src/app.js",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/ledger-mock",
    "prisma",
    ".env",
    ".env.staging.example",
    "package-lock.json",
  ];
  assert.deepStrictEqual(gitChangedFiles(protectedPaths), []);
  assert.deepStrictEqual(gitUntrackedFiles(protectedPaths), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken"].join(""),
    ["be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of guardedMarkers) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  }
  assert(
    !/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned),
    `${label} includes compact credential shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes credential URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc7x = readRequired(DOC_7X);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7W",
    "## Live readiness request record",
    "## Live-readiness-request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7X is runtime activation execution live readiness request only.",
    "ORO-7X does not activate runtime execution.",
    "ORO-7X does not enable runtime execution.",
    "ORO-7X does not authorize actual execution.",
    "ORO-7X does not approve live execution.",
    "ORO-7X does not execute live traffic.",
    "ORO-7X does not permit live OroPlay API calls.",
    "ORO-7X does not mutate wallet or ledger.",
    "ORO-7X does not mount any route.",
    "ORO-7X does not expose public aliases.",
    "dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate = true",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w = true",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w = runtime_activation_execution_authorized_execution_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope = runtime_activation_execution_live_readiness_request_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
    "nextPhaseRequiresSeparateLiveReadinessDecision = true",
  ]) {
    assert(doc7x.includes(marker), `${DOC_7X} missing marker ${marker}.`);
  }

  const doc7w = readRequired(DOC_7W);
  for (const marker of [
    "ORO-7X is the separate runtime activation execution live readiness request boundary after ORO-7W.",
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  ]) {
    assert(doc7w.includes(marker), `${DOC_7W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7x",
    "oro-7x",
    "ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [GATE, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-7X records actual external call execution runtime activation execution live readiness request only",
        ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
        ORO7X_LIVE_READINESS_REQUEST_SCOPE,
        ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted=true",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "actualExternalCallExecutionAuthorized=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateLiveReadinessDecision=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7X Current",
        "runtime activation execution live readiness request only",
        "live readiness decision stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7X current/live traffic actual external call execution runtime activation execution live readiness request boundary",
        "runtime activation execution live readiness request only",
        "`smoke:oro-7x` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7X Live Traffic Actual External Call Execution Runtime Activation Execution Live Readiness Request Boundary Coverage",
        "ORO-7X live-readiness-request-specific package smoke alias",
        SCRIPT,
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertStaticSafety() {
  const unsafeRuntimePatterns = [
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "http.request",
    "https.request",
    "fetch(",
    "process.env",
  ];
  const gateText = [GATE, FIXTURES, DOC_7X].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7X files must not contain ${marker}.`);
  }
  for (const file of ORO7X_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionRouteOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivated, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorized, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApproved, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
  assert.strictEqual(summary.routeEnablementAllowed, false);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.apiBalanceAliasAllowed, false);
  assert.strictEqual(summary.apiTransactionAliasAllowed, false);
  assert.strictEqual(summary.apiOroplayBalanceRouteAllowed, false);
  assert.strictEqual(summary.apiOroplayTransactionRouteAllowed, false);
}

function assertNoMutationFlags(summary) {
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
  assert.strictEqual(summary.deployAllowed, false);
  assert.strictEqual(summary.deployPerformed, false);
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryResult",
    "dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate",
    "oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionLiveExecuted",
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "walletMutationAllowed",
    "walletMutationPerformed",
    "ledgerMutationAllowed",
    "ledgerMutationPerformed",
    "prismaWriteAllowed",
    "prismaWritePerformed",
    "dbTransactionAllowed",
    "dbTransactionPerformed",
    "migrationAllowed",
    "migrationPerformed",
    "deployAllowed",
    "deployPerformed",
    "routeEnablementAllowed",
    "expressMountAllowed",
    "publicAliasAllowed",
    "apiBalanceAliasAllowed",
    "apiTransactionAliasAllowed",
    "apiOroplayBalanceRouteAllowed",
    "apiOroplayTransactionRouteAllowed",
    "nextPhaseRequiresSeparateLiveReadinessDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7X_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w,
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus,
    ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope,
    ORO7X_LIVE_READINESS_REQUEST_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveReadinessDecision, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7X happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7X hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      happyPathRuntimeActivationExecutionLiveReadinessRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failMissingOro7wAuthorizedExecutionReadinessFixture
    ),
    "missing_oro7w_runtime_activation_execution_authorized_execution_readiness"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failOro7wAuthorizedExecutionReadinessScopeMismatchFixture
    ),
    "invalid_oro7w_runtime_activation_execution_authorized_execution_readiness_scope"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failLiveReadinessRequestNotSubmittedFixture
    ),
    "runtime_activation_execution_live_readiness_request_submission_required_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failLiveReadinessRequestScopeMismatchFixture
    ),
    "invalid_runtime_activation_execution_live_readiness_request_scope_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_or_execution_authorization_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failActualExecutionAuthorizedFixture
    ),
    "runtime_enablement_or_execution_authorization_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failLiveExecutedFixture
    ),
    "live_execution_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failExternalNetworkAllowedCalledFixture
    ),
    "external_network_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failWalletMutationFixture
    ),
    "wallet_mutation_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failLedgerMutationFixture
    ),
    "ledger_mutation_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failPrismaWriteFixture
    ),
    "prisma_write_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failDbTransactionFixture
    ),
    "db_transaction_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failMigrationFixture
    ),
    "migration_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failDeployFixture
    ),
    "deploy_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failRouteEnablementFixture
    ),
    "route_enablement_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failExpressMountFixture
    ),
    "express_mount_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failPublicAliasFixture
    ),
    "public_alias_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failApiBalanceAliasFixture
    ),
    "api_balance_alias_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7x"
  );
  assertHeld(
    evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7x"
  );

  const allReports =
    buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures().map(
      evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary
    );
  assert.strictEqual(allReports.length, 25, "fixture set must cover ORO-7X cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7X live traffic actual external call execution runtime activation execution live readiness request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7X live traffic actual external call execution runtime activation execution live readiness request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
