"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures");
const {
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
} = require("../game-provider-mock/oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO7Y_PHASE,
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
  PASS,
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionSummary,
  evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  runOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
} = helper;

const {
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures,
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
  failLiveReadinessDecisionNotIssuedFixture,
  failLiveReadinessDecisionScopeMismatchFixture,
  failLiveReadinessDecisionStatusMismatchFixture,
  failMigrationFixture,
  failMissingOro7xLiveReadinessRequestFixture,
  failOro7xLiveReadinessRequestNotPassedFixture,
  failOro7xLiveReadinessRequestNotSubmittedFixture,
  failOro7xLiveReadinessRequestScopeMismatchFixture,
  failOro7xLiveReadinessRequestStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7Y =
  "docs/ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY.md";
const DOC_7X =
  "docs/ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7ySmoke.js";
const GATE =
  "src/game-provider-mock/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7y";
const DETAIL_SCRIPT =
  "smoke:oro-7y-runtime-activation-execution-live-readiness-decision";
const ORO7Y_SCAN_FILES = Object.freeze([DOC_7Y, GATE, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7y = readRequired(DOC_7Y);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7X",
    "## Live readiness decision record",
    "## Live-readiness-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7Y is runtime activation execution live readiness decision only.",
    "ORO-7Y does not activate runtime execution.",
    "ORO-7Y does not enable runtime execution.",
    "ORO-7Y does not authorize actual execution.",
    "ORO-7Y does not approve live execution.",
    "ORO-7Y does not execute live traffic.",
    "ORO-7Y does not permit live OroPlay API calls.",
    "ORO-7Y does not mutate wallet or ledger.",
    "ORO-7Y does not mount any route.",
    "ORO-7Y does not expose public aliases.",
    "dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary = true",
    "oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x = submitted_pending_separate_live_readiness_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x = runtime_activation_execution_live_readiness_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus = approved_for_separate_runtime_activation_execution_final_pre_live_execution_gate_only",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope = runtime_activation_execution_live_readiness_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
    "nextPhaseRequiresSeparateFinalPreLiveExecutionGate = true",
  ]) {
    assert(doc7y.includes(marker), `${DOC_7Y} missing marker ${marker}.`);
  }

  const doc7x = readRequired(DOC_7X);
  for (const marker of [
    "ORO-7Y is the separate runtime activation execution live readiness decision boundary after ORO-7X.",
    "runtime_activation_execution_live_readiness_decision_only",
  ]) {
    assert(doc7x.includes(marker), `${DOC_7X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7y",
    "oro-7y",
    "ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY.md",
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
        "ORO-7Y records actual external call execution runtime activation execution live readiness decision only",
        ORO7X_LIVE_READINESS_REQUEST_SCOPE,
        ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
        ORO7Y_LIVE_READINESS_DECISION_SCOPE,
        ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued=true",
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope=runtime_activation_execution_live_readiness_decision_only",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "actualExternalCallExecutionAuthorized=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateFinalPreLiveExecutionGate=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7Y Current",
        "runtime activation execution live readiness decision only",
        "final pre-live execution gate stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7Y current/live traffic actual external call execution runtime activation execution live readiness decision boundary",
        "runtime activation execution live readiness decision only",
        "`smoke:oro-7y` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7Y Live Traffic Actual External Call Execution Runtime Activation Execution Live Readiness Decision Boundary Coverage",
        "ORO-7Y live-readiness-decision-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7Y].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7Y files must not contain ${marker}.`);
  }
  for (const file of ORO7Y_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryResult",
    "dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary",
    "oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    "nextPhaseRequiresSeparateFinalPreLiveExecutionGate",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7Y_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x,
    ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x,
    ORO7X_LIVE_READINESS_REQUEST_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus,
    ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope,
    ORO7Y_LIVE_READINESS_DECISION_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateFinalPreLiveExecutionGate, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7Y happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-7Y hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionSummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failMissingOro7xLiveReadinessRequestFixture
    ),
    "missing_oro7x_runtime_activation_execution_live_readiness_request"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failOro7xLiveReadinessRequestNotPassedFixture
    ),
    "missing_oro7x_runtime_activation_execution_live_readiness_request"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failOro7xLiveReadinessRequestNotSubmittedFixture
    ),
    "runtime_activation_execution_live_readiness_request_submission_required_in_oro7x"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failOro7xLiveReadinessRequestStatusMismatchFixture
    ),
    "invalid_oro7x_runtime_activation_execution_live_readiness_request_status"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failOro7xLiveReadinessRequestScopeMismatchFixture
    ),
    "invalid_oro7x_runtime_activation_execution_live_readiness_request_scope"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLiveReadinessDecisionNotIssuedFixture
    ),
    "runtime_activation_execution_live_readiness_decision_required"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLiveReadinessDecisionStatusMismatchFixture
    ),
    "invalid_runtime_activation_execution_live_readiness_decision_status"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLiveReadinessDecisionScopeMismatchFixture
    ),
    "invalid_runtime_activation_execution_live_readiness_decision_scope"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failRuntimeActivatedFixture
    ),
    "actualExternalCallExecutionActivated_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failRuntimeEnabledFixture
    ),
    "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failActualExecutionAuthorizedFixture
    ),
    "actualExternalCallExecutionAuthorized_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLiveExecutedFixture
    ),
    "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failExternalNetworkAllowedCalledFixture
    ),
    "externalNetworkAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "liveOroPlayApiCalled_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failWalletMutationFixture
    ),
    "walletMutationPerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failLedgerMutationFixture
    ),
    "ledgerMutationPerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failPrismaWriteFixture
    ),
    "prismaWritePerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failDbTransactionFixture
    ),
    "dbTransactionPerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failMigrationFixture
    ),
    "migrationPerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failDeployFixture
    ),
    "deployPerformed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failRouteEnablementFixture
    ),
    "routeEnablementAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failExpressMountFixture
    ),
    "expressMountAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failPublicAliasFixture
    ),
    "publicAliasAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failApiBalanceAliasFixture
    ),
    "apiBalanceAliasAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failApiTransactionAliasFixture
    ),
    "apiTransactionAliasAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "apiOroplayBalanceRouteAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "apiOroplayTransactionRouteAllowed_not_allowed_in_oro7y"
  );
  assertHeld(
    evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7y"
  );

  const allReports =
    buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures().map(
      evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary
    );
  assert.strictEqual(allReports.length, 29, "fixture set must cover ORO-7Y cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7Y live traffic actual external call execution runtime activation execution live readiness decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7Y live traffic actual external call execution runtime activation execution live readiness decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
