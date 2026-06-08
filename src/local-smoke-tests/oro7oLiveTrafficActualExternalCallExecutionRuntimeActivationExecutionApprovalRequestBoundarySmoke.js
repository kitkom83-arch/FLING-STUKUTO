"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary");
const fixtures = require("../game-provider-mock/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryFixtures");
const {
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
} = require("../game-provider-mock/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate");

const {
  ORO7O_PHASE,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
  PASS,
  buildOro7oRuntimeActivationExecutionApprovalRequestBoundary,
  buildOro7oRuntimeActivationExecutionApprovalRequestSummary,
  evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
  validateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
} = helper;

const {
  buildOro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryFixtures,
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
  failMissingOro7nFinalReadinessFixture,
  failOro7nFinalReadinessScopeMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionApprovalRequestFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7O =
  "docs/ORO_7O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_BOUNDARY.md";
const DOC_7N =
  "docs/ORO_7N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7oSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7o";
const DETAIL_SCRIPT =
  "smoke:oro-7o-runtime-activation-execution-approval-request";
const ORO7O_SCAN_FILES = Object.freeze([DOC_7O, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
    ["client", "Secret"].join(""),
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
  const doc7o = readRequired(DOC_7O);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7N",
    "## Runtime activation execution approval request",
    "## Request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7O is runtime activation execution approval request only.",
    "ORO-7O does not activate runtime execution.",
    "ORO-7O does not enable runtime execution.",
    "ORO-7O does not approve live execution.",
    "ORO-7O does not execute live traffic.",
    "ORO-7O does not permit live OroPlay API calls.",
    "ORO-7O does not mutate wallet or ledger.",
    "ORO-7O does not mount any route.",
    "ORO-7O does not expose public aliases.",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n = runtime_activation_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope = runtime_activation_execution_approval_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus = submitted_pending_actual_external_call_execution_runtime_activation_execution_approval_decision",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7o.includes(marker), `${DOC_7O} missing marker ${marker}.`);
  }

  const doc7n = readRequired(DOC_7N);
  for (const marker of [
    "ORO-7O runtime activation execution approval request boundary is required next",
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
  ]) {
    assert(doc7n.includes(marker), `${DOC_7N} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7o",
    "oro-7o",
    "ORO_7O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_BOUNDARY.md",
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
        "ORO-7O records actual external call execution runtime activation execution approval request only",
        ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared=true",
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
        "## ORO-7O Current",
        "runtime activation execution approval request only",
        "runtime activation and live execution stay separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7O current/live traffic actual external call execution runtime activation execution approval request boundary",
        "runtime activation execution approval request only",
        "`smoke:oro-7o` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7O Live Traffic Actual External Call Execution Runtime Activation Execution Approval Request Boundary Coverage",
        "ORO-7O boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7O].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7O files must not contain ${marker}.`);
  }
  for (const file of ORO7O_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryResult",
    "dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate",
    "oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7O_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathRuntimeActivationExecutionApprovalRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n,
    ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7O happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7O hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7oRuntimeActivationExecutionApprovalRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7oRuntimeActivationExecutionApprovalRequestSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
    happyPathRuntimeActivationExecutionApprovalRequestFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7oRuntimeActivationExecutionApprovalRequestSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7oRuntimeActivationExecutionApprovalRequestBoundary(happy),
    happy
  );

  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failMissingOro7nFinalReadinessFixture
    ),
    "missing_oro7n_runtime_activation_final_readiness"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failOro7nFinalReadinessScopeMismatchFixture
    ),
    "invalid_oro7n_runtime_activation_final_readiness_scope"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failLiveExecutedFixture),
    "live_execution_not_allowed_in_oro7o"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(fixture),
      "external_network_not_allowed_in_oro7o"
    );
  }
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failWalletMutationFixture),
    "wallet_mutation_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failLedgerMutationFixture),
    "ledger_mutation_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failPrismaWriteFixture),
    "prisma_write_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failDbTransactionFixture),
    "db_transaction_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failMigrationFixture),
    "migration_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failDeployFixture),
    "deploy_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failRouteEnablementFixture),
    "route_enablement_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failExpressMountFixture),
    "express_mount_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failPublicAliasFixture),
    "public_alias_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(failApiBalanceAliasFixture),
    "api_balance_alias_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7o"
  );
  assertHeld(
    evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7o"
  );

  const allReports =
    buildOro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryFixtures().map(
      evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary
    );
  assert.strictEqual(allReports.length, 23, "fixture set must cover ORO-7O cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7O live traffic actual external call execution runtime activation execution approval request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7O live traffic actual external call execution runtime activation execution approval request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
