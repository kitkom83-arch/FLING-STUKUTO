"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures");
const {
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
} = require("../game-provider-mock/oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary");

const {
  ORO7P_PHASE,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
  PASS,
  buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
  buildOro7pRuntimeActivationExecutionApprovalDecisionSummary,
  evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
  validateOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
} = helper;

const {
  buildOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures,
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
  failMissingOro7oApprovalRequestFixture,
  failOro7oRequestScopeMismatchFixture,
  failOro7oRequestStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionApprovalDecisionFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7P =
  "docs/ORO_7P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_BOUNDARY.md";
const DOC_7O =
  "docs/ORO_7O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7pSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7p";
const DETAIL_SCRIPT =
  "smoke:oro-7p-runtime-activation-execution-approval-decision";
const ORO7P_SCAN_FILES = Object.freeze([DOC_7P, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7p = readRequired(DOC_7P);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7O",
    "## Runtime activation execution approval decision",
    "## Approval-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7P is runtime activation execution approval decision only.",
    "ORO-7P does not activate runtime execution.",
    "ORO-7P does not enable runtime execution.",
    "ORO-7P does not approve live execution.",
    "ORO-7P does not execute live traffic.",
    "ORO-7P does not permit live OroPlay API calls.",
    "ORO-7P does not mutate wallet or ledger.",
    "ORO-7P does not mount any route.",
    "ORO-7P does not expose public aliases.",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatusFromOro7o = submitted_pending_actual_external_call_execution_runtime_activation_execution_approval_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScopeFromOro7o = runtime_activation_execution_approval_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_activation_execution_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScope = runtime_activation_execution_approval_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7p.includes(marker), `${DOC_7P} missing marker ${marker}.`);
  }

  const doc7o = readRequired(DOC_7O);
  for (const marker of [
    "ORO-7P runtime activation execution approval decision boundary is required next",
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ]) {
    assert(doc7o.includes(marker), `${DOC_7O} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7p",
    "oro-7p",
    "ORO_7P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_BOUNDARY.md",
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
        "ORO-7P records actual external call execution runtime activation execution approval decision only",
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionPrepared=true",
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
        "## ORO-7P Current",
        "runtime activation execution approval decision only",
        "runtime activation and live execution stay separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7P current/live traffic actual external call execution runtime activation execution approval decision boundary",
        "runtime activation execution approval decision only",
        "`smoke:oro-7p` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7P Live Traffic Actual External Call Execution Runtime Activation Execution Approval Decision Boundary Coverage",
        "ORO-7P boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7P].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7P files must not contain ${marker}.`);
  }
  for (const file of ORO7P_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryResult",
    "dependsOnOro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary",
    "oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPreparedFromOro7o",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmittedFromOro7o",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatusFromOro7o",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScopeFromOro7o",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssued",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7P_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPreparedFromOro7o,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmittedFromOro7o,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatusFromOro7o,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScopeFromOro7o,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatus,
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScope,
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7P happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7P hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7pRuntimeActivationExecutionApprovalDecisionSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
    happyPathRuntimeActivationExecutionApprovalDecisionFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7pRuntimeActivationExecutionApprovalDecisionSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(happy),
    happy
  );

  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failMissingOro7oApprovalRequestFixture
    ),
    "missing_oro7o_runtime_activation_execution_approval_request"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failOro7oRequestStatusMismatchFixture
    ),
    "invalid_oro7o_runtime_activation_execution_approval_request_status"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failOro7oRequestScopeMismatchFixture
    ),
    "invalid_oro7o_runtime_activation_execution_approval_request_scope"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failLiveExecutedFixture),
    "live_execution_not_allowed_in_oro7p"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(fixture),
      "external_network_not_allowed_in_oro7p"
    );
  }
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failWalletMutationFixture),
    "wallet_mutation_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failLedgerMutationFixture),
    "ledger_mutation_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failPrismaWriteFixture),
    "prisma_write_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failDbTransactionFixture),
    "db_transaction_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failMigrationFixture),
    "migration_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failDeployFixture),
    "deploy_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failRouteEnablementFixture),
    "route_enablement_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failExpressMountFixture),
    "express_mount_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failPublicAliasFixture),
    "public_alias_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(failApiBalanceAliasFixture),
    "api_balance_alias_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7p"
  );
  assertHeld(
    evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7p"
  );

  const allReports =
    buildOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures().map(
      evaluateOro7pRuntimeActivationExecutionApprovalDecisionBoundary
    );
  assert.strictEqual(allReports.length, 24, "fixture set must cover ORO-7P cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7P live traffic actual external call execution runtime activation execution approval decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7P live traffic actual external call execution runtime activation execution approval decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
