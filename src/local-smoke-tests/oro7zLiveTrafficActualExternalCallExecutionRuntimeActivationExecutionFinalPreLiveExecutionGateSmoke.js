"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate");
const fixtures = require("../game-provider-mock/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures");
const {
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
} = require("../game-provider-mock/oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO7Z_PHASE,
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
  PASS,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSummary,
  evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  runOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
} = helper;

const {
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures,
  failActualExecutionAuthorizedFixture,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failDbTransactionFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedCalledFixture,
  failFinalPreLiveExecutionGateNotPassedFixture,
  failFinalPreLiveExecutionGateNotPreparedFixture,
  failFinalPreLiveExecutionGateScopeMismatchFixture,
  failFinalPreLiveExecutionGateStatusMismatchFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationFixture,
  failMissingOro7yLiveReadinessDecisionFixture,
  failNextPhaseAuthorizationRequestMissingFixture,
  failOro7yLiveReadinessDecisionNotIssuedFixture,
  failOro7yLiveReadinessDecisionNotPassedFixture,
  failOro7yLiveReadinessDecisionScopeMismatchFixture,
  failOro7yLiveReadinessDecisionStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7Z =
  "docs/ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE.md";
const DOC_7Y =
  "docs/ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7zSmoke.js";
const GATE =
  "src/game-provider-mock/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSmoke.js";
const SCRIPT = "smoke:oro-7z";
const DETAIL_SCRIPT =
  "smoke:oro-7z-runtime-activation-execution-final-pre-live-execution-gate";
const ORO7Z_SCAN_FILES = Object.freeze([DOC_7Z, GATE, FIXTURES, WRAPPER]);

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
  const doc7z = readRequired(DOC_7Z);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7Y",
    "## Final pre-live execution gate record",
    "## Final-pre-live-execution-gate-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7Z is runtime activation execution final pre-live execution gate only.",
    "ORO-7Z does not activate runtime execution.",
    "ORO-7Z does not enable runtime execution.",
    "ORO-7Z does not authorize actual execution.",
    "ORO-7Z does not approve live execution.",
    "ORO-7Z does not execute live traffic.",
    "ORO-7Z does not permit live OroPlay API calls.",
    "ORO-7Z does not mutate wallet or ledger.",
    "ORO-7Z does not mount any route.",
    "ORO-7Z does not expose public aliases.",
    "dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary = true",
    "oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y = true",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y = approved_for_separate_runtime_activation_execution_final_pre_live_execution_gate_only",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y = runtime_activation_execution_live_readiness_decision_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus = passed_for_separate_actual_live_execution_authorization_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope = runtime_activation_execution_final_pre_live_execution_gate_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest = true",
  ]) {
    assert(doc7z.includes(marker), `${DOC_7Z} missing marker ${marker}.`);
  }

  const doc7y = readRequired(DOC_7Y);
  for (const marker of [
    "ORO-7Z is the separate runtime activation execution final pre-live execution gate after ORO-7Y.",
    "runtime_activation_execution_final_pre_live_execution_gate_only",
  ]) {
    assert(doc7y.includes(marker), `${DOC_7Y} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7z",
    "oro-7z",
    "ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE.md",
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
        "ORO-7Z records actual external call execution runtime activation execution final pre-live execution gate only",
        ORO7Y_LIVE_READINESS_DECISION_SCOPE,
        ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
        ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
        ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope=runtime_activation_execution_final_pre_live_execution_gate_only",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "actualExternalCallExecutionAuthorized=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7Z Current",
        "runtime activation execution final pre-live execution gate only",
        "actual live execution authorization request stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7Z current/live traffic actual external call execution runtime activation execution final pre-live execution gate",
        "runtime activation execution final pre-live execution gate only",
        "`smoke:oro-7z` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7Z Live Traffic Actual External Call Execution Runtime Activation Execution Final Pre-Live Execution Gate Coverage",
        "ORO-7Z final-pre-live-execution-gate-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7Z].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7Z files must not contain ${marker}.`);
  }
  for (const file of ORO7Z_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateResult",
    "dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary",
    "oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y",
    "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest",
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
  assert.strictEqual(summary.phase, ORO7Z_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y,
    ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y,
    ORO7Y_LIVE_READINESS_DECISION_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus,
    ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope,
    ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7Z happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-7Z hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof runOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failMissingOro7yLiveReadinessDecisionFixture
    ),
    "missing_passed_oro7y_runtime_activation_execution_live_readiness_decision"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failOro7yLiveReadinessDecisionNotPassedFixture
    ),
    "missing_passed_oro7y_runtime_activation_execution_live_readiness_decision"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failOro7yLiveReadinessDecisionNotIssuedFixture
    ),
    "runtime_activation_execution_live_readiness_decision_required_from_oro7y"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failOro7yLiveReadinessDecisionStatusMismatchFixture
    ),
    "invalid_oro7y_runtime_activation_execution_live_readiness_decision_status"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failOro7yLiveReadinessDecisionScopeMismatchFixture
    ),
    "invalid_oro7y_runtime_activation_execution_live_readiness_decision_scope"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failFinalPreLiveExecutionGateNotPreparedFixture
    ),
    "runtime_activation_execution_final_pre_live_execution_gate_preparation_required"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failFinalPreLiveExecutionGateNotPassedFixture
    ),
    "runtime_activation_execution_final_pre_live_execution_gate_must_pass"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failFinalPreLiveExecutionGateStatusMismatchFixture
    ),
    "invalid_runtime_activation_execution_final_pre_live_execution_gate_status"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failFinalPreLiveExecutionGateScopeMismatchFixture
    ),
    "invalid_runtime_activation_execution_final_pre_live_execution_gate_scope"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failRuntimeActivatedFixture
    ),
    "actualExternalCallExecutionActivated_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failRuntimeEnabledFixture
    ),
    "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failActualExecutionAuthorizedFixture
    ),
    "actualExternalCallExecutionAuthorized_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failLiveExecutionApprovedFixture
    ),
    "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failLiveExecutedFixture
    ),
    "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failExternalNetworkAllowedCalledFixture
    ),
    "externalNetworkAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failLiveOroPlayApiCalledFixture
    ),
    "liveOroPlayApiCallAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failWalletMutationFixture
    ),
    "walletMutationAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failLedgerMutationFixture
    ),
    "ledgerMutationAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failPrismaWriteFixture
    ),
    "prismaWriteAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failDbTransactionFixture
    ),
    "dbTransactionAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failMigrationFixture
    ),
    "migrationAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failDeployFixture
    ),
    "deployAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failRouteEnablementFixture
    ),
    "routeEnablementAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failExpressMountFixture
    ),
    "expressMountAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failPublicAliasFixture
    ),
    "publicAliasAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failApiBalanceAliasFixture
    ),
    "apiBalanceAliasAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failApiTransactionAliasFixture
    ),
    "apiTransactionAliasAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failApiOroplayBalanceRouteFixture
    ),
    "apiOroplayBalanceRouteAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failApiOroplayTransactionRouteFixture
    ),
    "apiOroplayTransactionRouteAllowed_not_allowed_in_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failNextPhaseAuthorizationRequestMissingFixture
    ),
    "separate_actual_live_execution_authorization_request_required_after_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failHumanApprovalMissingFixture
    ),
    "separate_actual_live_execution_authorization_request_required_after_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failSeparateActualExecutionApprovalMissingFixture
    ),
    "separate_actual_live_execution_authorization_request_required_after_oro7z"
  );
  assertHeld(
    evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7z"
  );

  const allReports =
    buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures().map(
      evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate
    );
  assert.strictEqual(allReports.length, 34, "fixture set must cover ORO-7Z cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7Z live traffic actual external call execution runtime activation execution final pre-live execution gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7Z live traffic actual external call execution runtime activation execution final pre-live execution gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
