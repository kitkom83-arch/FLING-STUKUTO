"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate");
const fixtures = require("../game-provider-mock/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures");
const {
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
} = require("../game-provider-mock/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary");

const {
  ORO7T_PHASE,
  ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
  PASS,
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessSummary,
  evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
} = helper;

const {
  buildOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failDbTransactionFixture,
  failDecisionScopeMismatchFixture,
  failDecisionStatusMismatchFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedFixture,
  failExternalNetworkCalledFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationFixture,
  failMissingOro7sDecisionFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionPostDecisionReadinessFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7T =
  "docs/ORO_7T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_GATE.md";
const DOC_7S =
  "docs/ORO_7S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7tSmoke.js";
const GATE =
  "src/game-provider-mock/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7t";
const DETAIL_SCRIPT =
  "smoke:oro-7t-runtime-activation-execution-post-decision-readiness";
const ORO7T_SCAN_FILES = Object.freeze([DOC_7T, GATE, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7t = readRequired(DOC_7T);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7S",
    "## Runtime activation execution post-decision readiness record",
    "## Post-decision-readiness-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7T is runtime activation execution post-decision readiness only.",
    "ORO-7T does not activate runtime execution.",
    "ORO-7T does not enable runtime execution.",
    "ORO-7T does not approve live execution.",
    "ORO-7T does not execute live traffic.",
    "ORO-7T does not permit live OroPlay API calls.",
    "ORO-7T does not mutate wallet or ledger.",
    "ORO-7T does not mount any route.",
    "ORO-7T does not expose public aliases.",
    "dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary = true",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s = true",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s = approved_for_separate_actual_external_call_execution_runtime_activation_execution_post_decision_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s = runtime_activation_execution_decision_only",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope = runtime_activation_execution_post_decision_readiness_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7t.includes(marker), `${DOC_7T} missing marker ${marker}.`);
  }

  const doc7s = readRequired(DOC_7S);
  for (const marker of [
    "ORO-7T is the separate runtime activation execution post-decision readiness gate after ORO-7S.",
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ]) {
    assert(doc7s.includes(marker), `${DOC_7S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7t",
    "oro-7t",
    "ORO_7T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_GATE.md",
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
        "ORO-7T records actual external call execution runtime activation execution post-decision readiness only",
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
        ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed=true",
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
        "## ORO-7T Current",
        "runtime activation execution post-decision readiness only",
        "final authorization request stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7T current/live traffic actual external call execution runtime activation execution post-decision readiness gate",
        "runtime activation execution post-decision readiness only",
        "`smoke:oro-7t` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7T Live Traffic Actual External Call Execution Runtime Activation Execution Post-Decision Readiness Gate Coverage",
        "ORO-7T post-decision-readiness-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7T].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7T files must not contain ${marker}.`);
  }
  for (const file of ORO7T_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateResult",
    "dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary",
    "oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7T_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope,
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7T happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7T hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate, "function");
  assert.strictEqual(typeof evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate, "function");
  assert.strictEqual(typeof validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate, "function");
  assert.strictEqual(typeof buildOro7tRuntimeActivationExecutionPostDecisionReadinessSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
    happyPathRuntimeActivationExecutionPostDecisionReadinessFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7tRuntimeActivationExecutionPostDecisionReadinessSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(happy),
    happy
  );

  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failMissingOro7sDecisionFixture
    ),
    "missing_oro7s_runtime_activation_execution_decision"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failDecisionStatusMismatchFixture
    ),
    "invalid_oro7s_runtime_activation_execution_decision_status"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failDecisionScopeMismatchFixture
    ),
    "invalid_oro7s_runtime_activation_execution_decision_scope"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failLiveExecutedFixture
    ),
    "live_execution_not_allowed_in_oro7t"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(fixture),
      "external_network_not_allowed_in_oro7t"
    );
  }
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failWalletMutationFixture
    ),
    "wallet_mutation_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failLedgerMutationFixture
    ),
    "ledger_mutation_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failPrismaWriteFixture
    ),
    "prisma_write_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failDbTransactionFixture
    ),
    "db_transaction_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failMigrationFixture
    ),
    "migration_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(failDeployFixture),
    "deploy_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failRouteEnablementFixture
    ),
    "route_enablement_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failExpressMountFixture
    ),
    "express_mount_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failPublicAliasFixture
    ),
    "public_alias_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failApiBalanceAliasFixture
    ),
    "api_balance_alias_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7t"
  );
  assertHeld(
    evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7t"
  );

  const allReports =
    buildOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures().map(
      evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate
    );
  assert.strictEqual(allReports.length, 24, "fixture set must cover ORO-7T cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7T live traffic actual external call execution runtime activation execution post-decision readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7T live traffic actual external call execution runtime activation execution post-decision readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
