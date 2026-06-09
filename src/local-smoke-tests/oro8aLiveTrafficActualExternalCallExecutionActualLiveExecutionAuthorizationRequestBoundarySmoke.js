"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures");
const {
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
} = require("../game-provider-mock/oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8A_PHASE,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  PASS,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySummary,
  evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  runOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
} = helper;

const {
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures,
  failActualExecutionAuthorizedFixture,
  failActualExecutionEnabledFixture,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failAuthorizationRequestNotPreparedFixture,
  failAuthorizationRequestNotSubmittedFixture,
  failAuthorizationRequestScopeMismatchFixture,
  failAuthorizationRequestStatusMismatchFixture,
  failDbTransactionFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedCalledFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationFixture,
  failMissingOro7zFinalPreLiveExecutionGateFixture,
  failNextPhaseAuthorizationDecisionMissingFixture,
  failOro7zFinalPreLiveExecutionGateNotPassedFixture,
  failOro7zFinalPreLiveExecutionGateScopeMismatchFixture,
  failOro7zFinalPreLiveExecutionGateStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failWalletMutationFixture,
  happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8A =
  "docs/ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_7Z =
  "docs/ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro8aSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-8a";
const DETAIL_SCRIPT =
  "smoke:oro-8a-actual-live-execution-authorization-request";
const ORO8A_SCAN_FILES = Object.freeze([DOC_8A, BOUNDARY, FIXTURES, WRAPPER]);

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
  const doc8a = readRequired(DOC_8A);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7Z",
    "## Actual live execution authorization request record",
    "## Actual-live-execution-authorization-request-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8A is actual live execution authorization request boundary only.",
    "ORO-8A does not perform actual live execution.",
    "ORO-8A does not activate runtime execution.",
    "ORO-8A does not enable runtime execution.",
    "ORO-8A does not call external networks.",
    "ORO-8A does not call live OroPlay APIs.",
    "ORO-8A does not mutate wallet or ledger.",
    "ORO-8A does not mount any route.",
    "ORO-8A does not expose public aliases.",
    "dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate = true",
    "oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z = passed_for_separate_actual_live_execution_authorization_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z = runtime_activation_execution_final_pre_live_execution_gate_only",
    "actualLiveExecutionAuthorizationRequestPrepared = true",
    "actualLiveExecutionAuthorizationRequestSubmitted = true",
    "actualLiveExecutionAuthorizationRequestStatus = submitted_pending_separate_actual_live_execution_authorization_decision",
    "actualLiveExecutionAuthorizationRequestScope = actual_live_execution_authorization_request_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "routeEnablementAllowed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision = true",
    "separateActualExecutionApprovalRequired = true",
  ]) {
    assert(doc8a.includes(marker), `${DOC_8A} missing marker ${marker}.`);
  }

  const doc7z = readRequired(DOC_7Z);
  for (const marker of [
    "ORO-8A is the separate actual live execution authorization request boundary after ORO-7Z.",
    "actual_live_execution_authorization_request_only",
    "submitted_pending_separate_actual_live_execution_authorization_decision",
  ]) {
    assert(doc7z.includes(marker), `${DOC_7Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8a",
    "oro-8a",
    "ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
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
        "ORO-8A records actual live execution authorization request only",
        ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
        ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
        ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
        ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
        "actualLiveExecutionAuthorizationRequestPrepared=true",
        "actualLiveExecutionAuthorizationRequestSubmitted=true",
        "actualLiveExecutionAuthorizationRequestScope=actual_live_execution_authorization_request_only",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "actualExternalCallExecutionAuthorized=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8A Current",
        "actual live execution authorization request boundary only",
        "actual live execution authorization decision stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-8A current/live traffic actual external call execution actual live execution authorization request boundary",
        "actual live execution authorization request boundary only",
        "`smoke:oro-8a` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-8A Live Traffic Actual External Call Execution Actual Live Execution Authorization Request Boundary Coverage",
        "ORO-8A actual-live-execution-authorization-request-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8A].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8A files must not contain ${marker}.`);
  }
  for (const file of ORO8A_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryResult",
    "dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate",
    "oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z",
    "actualLiveExecutionAuthorizationRequestPrepared",
    "actualLiveExecutionAuthorizationRequestSubmitted",
    "actualLiveExecutionAuthorizationRequestStatus",
    "actualLiveExecutionAuthorizationRequestScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision",
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
  assert.strictEqual(summary.phase, ORO8A_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    true
  );
  assert.strictEqual(
    summary.oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z,
    ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z,
    ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationRequestStatus,
    ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationRequestScope,
    ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8A happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8A hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
      happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failMissingOro7zFinalPreLiveExecutionGateFixture,
      "missing_passed_oro7z_runtime_activation_execution_final_pre_live_execution_gate",
    ],
    [
      failOro7zFinalPreLiveExecutionGateNotPassedFixture,
      "missing_passed_oro7z_runtime_activation_execution_final_pre_live_execution_gate",
    ],
    [
      failOro7zFinalPreLiveExecutionGateStatusMismatchFixture,
      "invalid_oro7z_runtime_activation_execution_final_pre_live_execution_gate_status",
    ],
    [
      failOro7zFinalPreLiveExecutionGateScopeMismatchFixture,
      "invalid_oro7z_runtime_activation_execution_final_pre_live_execution_gate_scope",
    ],
    [
      failAuthorizationRequestNotPreparedFixture,
      "actual_live_execution_authorization_request_preparation_required",
    ],
    [
      failAuthorizationRequestNotSubmittedFixture,
      "actual_live_execution_authorization_request_submission_required",
    ],
    [
      failAuthorizationRequestStatusMismatchFixture,
      "invalid_actual_live_execution_authorization_request_status",
    ],
    [
      failAuthorizationRequestScopeMismatchFixture,
      "invalid_actual_live_execution_authorization_request_scope",
    ],
    [failRuntimeEnabledFixture, "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8a"],
    [failRuntimeActivatedFixture, "actualExternalCallExecutionActivated_not_allowed_in_oro8a"],
    [failActualExecutionEnabledFixture, "actualExternalCallExecutionEnabled_not_allowed_in_oro8a"],
    [
      failActualExecutionAuthorizedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8a",
    ],
    [
      failLiveExecutionApprovedFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8a",
    ],
    [failLiveExecutedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8a"],
    [failExternalNetworkAllowedCalledFixture, "externalNetworkAllowed_not_allowed_in_oro8a"],
    [failLiveOroPlayApiCalledFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8a"],
    [failWalletMutationFixture, "walletMutationAllowed_not_allowed_in_oro8a"],
    [failLedgerMutationFixture, "ledgerMutationAllowed_not_allowed_in_oro8a"],
    [failPrismaWriteFixture, "prismaWriteAllowed_not_allowed_in_oro8a"],
    [failDbTransactionFixture, "dbTransactionAllowed_not_allowed_in_oro8a"],
    [failMigrationFixture, "migrationAllowed_not_allowed_in_oro8a"],
    [failDeployFixture, "deployAllowed_not_allowed_in_oro8a"],
    [failRouteEnablementFixture, "routeEnablementAllowed_not_allowed_in_oro8a"],
    [failExpressMountFixture, "expressMountAllowed_not_allowed_in_oro8a"],
    [failPublicAliasFixture, "publicAliasAllowed_not_allowed_in_oro8a"],
    [failApiBalanceAliasFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8a"],
    [failApiTransactionAliasFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8a"],
    [failApiOroplayBalanceRouteFixture, "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8a"],
    [
      failApiOroplayTransactionRouteFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8a",
    ],
    [
      failNextPhaseAuthorizationDecisionMissingFixture,
      "separate_actual_live_execution_authorization_decision_required_after_oro8a",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_authorization_decision_required_after_oro8a",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_authorization_decision_required_after_oro8a",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8a"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures().map(
      evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary
    );
  assert.strictEqual(allReports.length, 34, "fixture set must cover ORO-8A cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8A live traffic actual external call execution actual live execution authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8A live traffic actual external call execution actual live execution authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
