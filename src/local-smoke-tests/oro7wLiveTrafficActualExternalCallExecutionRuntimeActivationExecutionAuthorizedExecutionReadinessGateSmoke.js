"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate");
const fixtures = require("../game-provider-mock/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures");
const {
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
} = require("../game-provider-mock/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary");

const {
  ORO7W_PHASE,
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  PASS,
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessSummary,
  evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
} = helper;

const {
  buildOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures,
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
  failMigrationFixture,
  failMissingOro7vFinalAuthorizationDecisionFixture,
  failOro7vFinalAuthorizationDecisionScopeMismatchFixture,
  failOro7vFinalAuthorizationDecisionStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7W =
  "docs/ORO_7W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_GATE.md";
const DOC_7V =
  "docs/ORO_7V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7wSmoke.js";
const GATE =
  "src/game-provider-mock/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7w";
const DETAIL_SCRIPT =
  "smoke:oro-7w-runtime-activation-execution-authorized-execution-readiness";
const ORO7W_SCAN_FILES = Object.freeze([DOC_7W, GATE, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7w = readRequired(DOC_7W);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7V",
    "## Runtime activation execution authorized execution readiness record",
    "## Authorized-execution-readiness-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7W is runtime activation execution authorized execution readiness only.",
    "ORO-7W does not activate runtime execution.",
    "ORO-7W does not enable runtime execution.",
    "ORO-7W does not authorize actual execution.",
    "ORO-7W does not approve live execution.",
    "ORO-7W does not execute live traffic.",
    "ORO-7W does not permit live OroPlay API calls.",
    "ORO-7W does not mutate wallet or ledger.",
    "ORO-7W does not mount any route.",
    "ORO-7W does not expose public aliases.",
    "dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v = approved_for_separate_actual_external_call_execution_runtime_activation_execution_authorized_execution_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v = runtime_activation_execution_final_authorization_decision_only",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope = runtime_activation_execution_authorized_execution_readiness_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7w.includes(marker), `${DOC_7W} missing marker ${marker}.`);
  }

  const doc7v = readRequired(DOC_7V);
  for (const marker of [
    "ORO-7W is the separate runtime activation execution authorized execution readiness boundary after ORO-7V.",
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
  ]) {
    assert(doc7v.includes(marker), `${DOC_7V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7w",
    "oro-7w",
    "ORO_7W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_GATE.md",
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
        "ORO-7W records actual external call execution runtime activation execution authorized execution readiness only",
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
        ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed=true",
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
        "## ORO-7W Current",
        "runtime activation execution authorized execution readiness only",
        "runtime activation execution live readiness request stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7W current/live traffic actual external call execution runtime activation execution authorized execution readiness gate",
        "runtime activation execution authorized execution readiness only",
        "`smoke:oro-7w` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7W Live Traffic Actual External Call Execution Runtime Activation Execution Authorized Execution Readiness Gate Coverage",
        "ORO-7W authorized-execution-readiness-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7W].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7W files must not contain ${marker}.`);
  }
  for (const file of ORO7W_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateResult",
    "dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary",
    "oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7W_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope,
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7W happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7W hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
    happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(happy),
    happy
  );

  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failMissingOro7vFinalAuthorizationDecisionFixture
    ),
    "missing_oro7v_runtime_activation_execution_final_authorization_decision"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failOro7vFinalAuthorizationDecisionStatusMismatchFixture
    ),
    "invalid_oro7v_runtime_activation_execution_final_authorization_decision_status"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failOro7vFinalAuthorizationDecisionScopeMismatchFixture
    ),
    "invalid_oro7v_runtime_activation_execution_final_authorization_decision_scope"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failLiveExecutedFixture
    ),
    "live_execution_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failExternalNetworkAllowedCalledFixture
    ),
    "external_network_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failWalletMutationFixture
    ),
    "wallet_mutation_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failLedgerMutationFixture
    ),
    "ledger_mutation_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failPrismaWriteFixture
    ),
    "prisma_write_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failDbTransactionFixture
    ),
    "db_transaction_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failMigrationFixture
    ),
    "migration_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failDeployFixture
    ),
    "deploy_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failRouteEnablementFixture
    ),
    "route_enablement_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failExpressMountFixture
    ),
    "express_mount_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failPublicAliasFixture
    ),
    "public_alias_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failApiBalanceAliasFixture
    ),
    "api_balance_alias_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7w"
  );
  assertHeld(
    evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7w"
  );

  const allReports =
    buildOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures().map(
      evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate
    );
  assert.strictEqual(allReports.length, 23, "fixture set must cover ORO-7W cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7W live traffic actual external call execution runtime activation execution authorized execution readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7W live traffic actual external call execution runtime activation execution authorized execution readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
