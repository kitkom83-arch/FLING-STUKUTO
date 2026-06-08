"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures");
const {
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
} = require("../game-provider-mock/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary");

const {
  ORO7Q_PHASE,
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
  PASS,
  buildOro7qRuntimeActivationExecutionFinalReadinessGate,
  buildOro7qRuntimeActivationExecutionFinalReadinessSummary,
  evaluateOro7qRuntimeActivationExecutionFinalReadinessGate,
  validateOro7qRuntimeActivationExecutionFinalReadinessGate,
} = helper;

const {
  buildOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failDbTransactionFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedFixture,
  failExternalNetworkCalledFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationFixture,
  failMissingOro7pApprovalDecisionFixture,
  failOro7pDecisionScopeMismatchFixture,
  failOro7pDecisionStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionFinalReadinessFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7Q =
  "docs/ORO_7Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_GATE.md";
const DOC_7P =
  "docs/ORO_7P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7qSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7q";
const DETAIL_SCRIPT =
  "smoke:oro-7q-runtime-activation-execution-final-readiness";
const ORO7Q_SCAN_FILES = Object.freeze([DOC_7Q, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
  const joinedMarkers = [
    ["to", "ken"].join(""),
    ["be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of joinedMarkers) {
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
  const doc7q = readRequired(DOC_7Q);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7P",
    "## Runtime activation execution final readiness",
    "## Final-readiness-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7Q is runtime activation execution final readiness only.",
    "ORO-7Q does not activate runtime execution.",
    "ORO-7Q does not enable runtime execution.",
    "ORO-7Q does not approve live execution.",
    "ORO-7Q does not execute live traffic.",
    "ORO-7Q does not permit live OroPlay API calls.",
    "ORO-7Q does not mutate wallet or ledger.",
    "ORO-7Q does not mount any route.",
    "ORO-7Q does not expose public aliases.",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p = approved_for_separate_actual_external_call_execution_runtime_activation_execution_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p = runtime_activation_execution_approval_decision_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope = runtime_activation_execution_final_readiness_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7q.includes(marker), `${DOC_7Q} missing marker ${marker}.`);
  }

  const doc7p = readRequired(DOC_7P);
  for (const marker of [
    "The next phase must be a separate actual external call execution runtime",
    "activation execution final readiness boundary",
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ]) {
    assert(doc7p.includes(marker), `${DOC_7P} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7q",
    "oro-7q",
    "ORO_7Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_GATE.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-7Q records actual external call execution runtime activation execution final readiness only",
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
        ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed=true",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7Q Current",
        "runtime activation execution final readiness only",
        "runtime activation and live execution stay separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7Q current/live traffic actual external call execution runtime activation execution final readiness gate",
        "runtime activation execution final readiness only",
        "`smoke:oro-7q` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7Q Live Traffic Actual External Call Execution Runtime Activation Execution Final Readiness Gate Coverage",
        "ORO-7Q gate-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7Q].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7Q files must not contain ${marker}.`);
  }
  for (const file of ORO7Q_SCAN_FILES) {
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
    "fixtureId",
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateResult",
    "dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary",
    "oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7Q_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p,
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p,
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope,
    ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7Q happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7Q hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro7qRuntimeActivationExecutionFinalReadinessGate, "function");
  assert.strictEqual(typeof evaluateOro7qRuntimeActivationExecutionFinalReadinessGate, "function");
  assert.strictEqual(typeof validateOro7qRuntimeActivationExecutionFinalReadinessGate, "function");
  assert.strictEqual(typeof buildOro7qRuntimeActivationExecutionFinalReadinessSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
    happyPathRuntimeActivationExecutionFinalReadinessFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7qRuntimeActivationExecutionFinalReadinessSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7qRuntimeActivationExecutionFinalReadinessGate(happy),
    happy
  );

  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
      failMissingOro7pApprovalDecisionFixture
    ),
    "missing_oro7p_runtime_activation_execution_approval_decision"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
      failOro7pDecisionStatusMismatchFixture
    ),
    "invalid_oro7p_runtime_activation_execution_approval_decision_status"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
      failOro7pDecisionScopeMismatchFixture
    ),
    "invalid_oro7p_runtime_activation_execution_approval_decision_scope"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failRuntimeEnabledFixture),
    "runtime_enablement_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failLiveExecutedFixture),
    "live_execution_not_allowed_in_oro7q"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(fixture),
      "external_network_not_allowed_in_oro7q"
    );
  }
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failLiveOroPlayApiCalledFixture),
    "live_oroplay_api_call_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failWalletMutationFixture),
    "wallet_mutation_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failLedgerMutationFixture),
    "ledger_mutation_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failPrismaWriteFixture),
    "prisma_write_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failDbTransactionFixture),
    "db_transaction_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failMigrationFixture),
    "migration_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failDeployFixture),
    "deploy_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failRouteEnablementFixture),
    "route_enablement_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failExpressMountFixture),
    "express_mount_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failPublicAliasFixture),
    "public_alias_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failApiBalanceAliasFixture),
    "api_balance_alias_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failApiTransactionAliasFixture),
    "api_transaction_alias_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7q"
  );
  assertHeld(
    evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(failSensitiveOutputFixture),
    "sensitive_output_not_allowed_in_oro7q"
  );

  const allReports =
    buildOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures().map(
      evaluateOro7qRuntimeActivationExecutionFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 24, "fixture set must cover ORO-7Q cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7Q live traffic actual external call execution runtime activation execution final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7Q live traffic actual external call execution runtime activation execution final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
