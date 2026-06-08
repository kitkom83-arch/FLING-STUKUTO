"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryFixtures");
const {
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
} = require("../game-provider-mock/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary");

const {
  ORO7S_PHASE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
  PASS,
  buildOro7sRuntimeActivationExecutionDecisionBoundary,
  buildOro7sRuntimeActivationExecutionDecisionSummary,
  evaluateOro7sRuntimeActivationExecutionDecisionBoundary,
  validateOro7sRuntimeActivationExecutionDecisionBoundary,
} = helper;

const {
  buildOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryFixtures,
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
  failMissingOro7rRequestFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRequestScopeMismatchFixture,
  failRequestStatusMismatchFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionDecisionFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7S =
  "docs/ORO_7S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_DECISION_BOUNDARY.md";
const DOC_7R =
  "docs/ORO_7R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7sSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7s";
const DETAIL_SCRIPT = "smoke:oro-7s-runtime-activation-execution-decision";
const ORO7S_SCAN_FILES = Object.freeze([DOC_7S, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7s = readRequired(DOC_7S);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7R",
    "## Runtime activation execution decision record",
    "## Execution-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7S is runtime activation execution decision only.",
    "ORO-7S does not activate runtime execution.",
    "ORO-7S does not enable runtime execution.",
    "ORO-7S does not approve live execution.",
    "ORO-7S does not execute live traffic.",
    "ORO-7S does not permit live OroPlay API calls.",
    "ORO-7S does not mutate wallet or ledger.",
    "ORO-7S does not mount any route.",
    "ORO-7S does not expose public aliases.",
    "dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary = true",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r = submitted_pending_actual_external_call_execution_runtime_activation_execution_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r = runtime_activation_execution_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued = true",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_activation_execution_post_decision_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionScope = runtime_activation_execution_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7s.includes(marker), `${DOC_7S} missing marker ${marker}.`);
  }

  const doc7r = readRequired(DOC_7R);
  for (const marker of [
    "ORO-7S is the separate runtime activation execution decision boundary after ORO-7R.",
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ]) {
    assert(doc7r.includes(marker), `${DOC_7R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7s",
    "oro-7s",
    "ORO_7S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_DECISION_BOUNDARY.md",
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
        "ORO-7S records actual external call execution runtime activation execution decision only",
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued=true",
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
        "## ORO-7S Current",
        "runtime activation execution decision only",
        "post-decision readiness stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7S current/live traffic actual external call execution runtime activation execution decision boundary",
        "runtime activation execution decision only",
        "`smoke:oro-7s` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7S Live Traffic Actual External Call Execution Runtime Activation Execution Decision Boundary Coverage",
        "ORO-7S decision-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7S].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7S files must not contain ${marker}.`);
  }
  for (const file of ORO7S_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryResult",
    "dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary",
    "oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionDecisionScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7S_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r,
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r,
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionScope,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7S happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7S hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro7sRuntimeActivationExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof evaluateOro7sRuntimeActivationExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof validateOro7sRuntimeActivationExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro7sRuntimeActivationExecutionDecisionSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7sRuntimeActivationExecutionDecisionBoundary(
    happyPathRuntimeActivationExecutionDecisionFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7sRuntimeActivationExecutionDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro7sRuntimeActivationExecutionDecisionBoundary(happy), happy);

  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failMissingOro7rRequestFixture),
    "missing_oro7r_runtime_activation_execution_request"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failRequestStatusMismatchFixture),
    "invalid_oro7r_runtime_activation_execution_request_status"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failRequestScopeMismatchFixture),
    "invalid_oro7r_runtime_activation_execution_request_scope"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failRuntimeEnabledFixture),
    "runtime_enablement_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failLiveExecutedFixture),
    "live_execution_not_allowed_in_oro7s"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7sRuntimeActivationExecutionDecisionBoundary(fixture),
      "external_network_not_allowed_in_oro7s"
    );
  }
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failLiveOroPlayApiCalledFixture),
    "live_oroplay_api_call_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failWalletMutationFixture),
    "wallet_mutation_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failLedgerMutationFixture),
    "ledger_mutation_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failPrismaWriteFixture),
    "prisma_write_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failDbTransactionFixture),
    "db_transaction_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failMigrationFixture),
    "migration_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failDeployFixture),
    "deploy_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failRouteEnablementFixture),
    "route_enablement_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failExpressMountFixture),
    "express_mount_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failPublicAliasFixture),
    "public_alias_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failApiBalanceAliasFixture),
    "api_balance_alias_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failApiTransactionAliasFixture),
    "api_transaction_alias_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failApiOroplayBalanceRouteFixture),
    "api_oroplay_balance_route_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7s"
  );
  assertHeld(
    evaluateOro7sRuntimeActivationExecutionDecisionBoundary(failSensitiveOutputFixture),
    "sensitive_output_not_allowed_in_oro7s"
  );

  const allReports =
    buildOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryFixtures().map(
      evaluateOro7sRuntimeActivationExecutionDecisionBoundary
    );
  assert.strictEqual(allReports.length, 24, "fixture set must cover ORO-7S cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7S live traffic actual external call execution runtime activation execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7S live traffic actual external call execution runtime activation execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
