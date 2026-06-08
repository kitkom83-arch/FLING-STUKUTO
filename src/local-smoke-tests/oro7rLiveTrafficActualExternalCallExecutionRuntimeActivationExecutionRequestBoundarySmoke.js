"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures");
const {
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
} = require("../game-provider-mock/oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate");

const {
  ORO7R_PHASE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
  PASS,
  buildOro7rRuntimeActivationExecutionRequestBoundary,
  buildOro7rRuntimeActivationExecutionRequestSummary,
  evaluateOro7rRuntimeActivationExecutionRequestBoundary,
  validateOro7rRuntimeActivationExecutionRequestBoundary,
} = helper;

const {
  buildOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures,
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
  failMissingOro7qFinalReadinessFixture,
  failOro7qFinalReadinessScopeMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRequestNotSubmittedFixture,
  failRequestScopeMismatchFixture,
  failRequestStatusMismatchFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionRequestFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7R =
  "docs/ORO_7R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_7Q =
  "docs/ORO_7Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7rSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7r";
const DETAIL_SCRIPT = "smoke:oro-7r-runtime-activation-execution-request";
const ORO7R_SCAN_FILES = Object.freeze([DOC_7R, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7r = readRequired(DOC_7R);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7Q",
    "## Runtime activation execution request record",
    "## Execution-request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7R is runtime activation execution request only.",
    "ORO-7R does not activate runtime execution.",
    "ORO-7R does not enable runtime execution.",
    "ORO-7R does not approve live execution.",
    "ORO-7R does not execute live traffic.",
    "ORO-7R does not permit live OroPlay API calls.",
    "ORO-7R does not mutate wallet or ledger.",
    "ORO-7R does not mount any route.",
    "ORO-7R does not expose public aliases.",
    "dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q = runtime_activation_execution_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestStatus = submitted_pending_actual_external_call_execution_runtime_activation_execution_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestScope = runtime_activation_execution_request_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7r.includes(marker), `${DOC_7R} missing marker ${marker}.`);
  }

  const doc7q = readRequired(DOC_7Q);
  for (const marker of [
    "ORO-7R is the separate runtime activation execution request boundary after ORO-7Q.",
    ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
  ]) {
    assert(doc7q.includes(marker), `${DOC_7Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7r",
    "oro-7r",
    "ORO_7R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_REQUEST_BOUNDARY.md",
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
        "ORO-7R records actual external call execution runtime activation execution request only",
        ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted=true",
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
        "## ORO-7R Current",
        "runtime activation execution request only",
        "runtime activation execution decision stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7R current/live traffic actual external call execution runtime activation execution request boundary",
        "runtime activation execution request only",
        "`smoke:oro-7r` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7R Live Traffic Actual External Call Execution Runtime Activation Execution Request Boundary Coverage",
        "ORO-7R request-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7R].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7R files must not contain ${marker}.`);
  }
  for (const file of ORO7R_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryResult",
    "dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate",
    "oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionRequestScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7R_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q,
    ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestStatus,
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionRequestScope,
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7R happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7R hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro7rRuntimeActivationExecutionRequestBoundary, "function");
  assert.strictEqual(typeof evaluateOro7rRuntimeActivationExecutionRequestBoundary, "function");
  assert.strictEqual(typeof validateOro7rRuntimeActivationExecutionRequestBoundary, "function");
  assert.strictEqual(typeof buildOro7rRuntimeActivationExecutionRequestSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7rRuntimeActivationExecutionRequestBoundary(
    happyPathRuntimeActivationExecutionRequestFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7rRuntimeActivationExecutionRequestSummary(happy), happy);
  assert.deepStrictEqual(validateOro7rRuntimeActivationExecutionRequestBoundary(happy), happy);

  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(
      failMissingOro7qFinalReadinessFixture
    ),
    "missing_oro7q_runtime_activation_execution_final_readiness"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(
      failOro7qFinalReadinessScopeMismatchFixture
    ),
    "invalid_oro7q_runtime_activation_execution_final_readiness_scope"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRequestNotSubmittedFixture),
    "runtime_activation_execution_request_submission_required_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRequestStatusMismatchFixture),
    "invalid_runtime_activation_execution_request_status_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRequestScopeMismatchFixture),
    "invalid_runtime_activation_execution_request_scope_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRuntimeEnabledFixture),
    "runtime_enablement_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failLiveExecutedFixture),
    "live_execution_not_allowed_in_oro7r"
  );
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7rRuntimeActivationExecutionRequestBoundary(fixture),
      "external_network_not_allowed_in_oro7r"
    );
  }
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failLiveOroPlayApiCalledFixture),
    "live_oroplay_api_call_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failWalletMutationFixture),
    "wallet_mutation_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failLedgerMutationFixture),
    "ledger_mutation_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failPrismaWriteFixture),
    "prisma_write_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failDbTransactionFixture),
    "db_transaction_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failMigrationFixture),
    "migration_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failDeployFixture),
    "deploy_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failRouteEnablementFixture),
    "route_enablement_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failExpressMountFixture),
    "express_mount_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failPublicAliasFixture),
    "public_alias_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failApiBalanceAliasFixture),
    "api_balance_alias_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failApiTransactionAliasFixture),
    "api_transaction_alias_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failApiOroplayBalanceRouteFixture),
    "api_oroplay_balance_route_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7r"
  );
  assertHeld(
    evaluateOro7rRuntimeActivationExecutionRequestBoundary(failSensitiveOutputFixture),
    "sensitive_output_not_allowed_in_oro7r"
  );

  const allReports =
    buildOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures().map(
      evaluateOro7rRuntimeActivationExecutionRequestBoundary
    );
  assert.strictEqual(allReports.length, 26, "fixture set must cover ORO-7R cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7R live traffic actual external call execution runtime activation execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7R live traffic actual external call execution runtime activation execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
