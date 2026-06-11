"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures");
const {
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
} = require("../game-provider-mock/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

const {
  CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO8L_PHASE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  PASS,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySummary,
  evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  runOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
} = helper;

const {
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failFinalExecutionRequestActivatesRuntimeFixture,
  failFinalExecutionRequestApprovesActualExecutionFixture,
  failFinalExecutionRequestApprovesFinalExecutionFixture,
  failFinalExecutionRequestApprovesFinalExecutionRequestFixture,
  failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionRequestEnablesRuntimeFixture,
  failFinalExecutionRequestExecutesLiveCallFixture,
  failFinalExecutionRequestNotIssuedFixture,
  failFinalExecutionRequestNotPassedFixture,
  failFinalExecutionRequestNotPreparedFixture,
  failFinalExecutionRequestNotRecordedFixture,
  failFinalExecutionRequestNotSubmittedFixture,
  failFinalExecutionRequestScopeMismatchFixture,
  failFinalExecutionRequestStatusMismatchFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8kDependencyMissingFixture,
  failOro8kFinalExecutionGateNotPassedFixture,
  failOro8kFinalExecutionGateNotRecordedFixture,
  failOro8kFinalExecutionGateScopeMismatchFixture,
  failOro8kFinalExecutionGateStatusMismatchFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalApprovalMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8K =
  "docs/ORO_8K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE.md";
const DOC_8L =
  "docs/ORO_8L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8lSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-8l";
const DETAIL_SCRIPT =
  "smoke:oro-8l-actual-live-execution-final-execution-request-boundary";
const ORO8L_SCAN_FILES = Object.freeze([DOC_8K, DOC_8L, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS,
]);

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
    ["Be", "arer"].join(""),
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
    `${label} includes compact auth shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes embedded auth URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc8k = readRequired(DOC_8K);
  for (const marker of [
    "ORO-8L follows ORO-8K as the separate actual live execution final execution request boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval = true",
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ]) {
    assert(doc8k.includes(marker), `${DOC_8K} missing marker ${marker}.`);
  }

  const doc8l = readRequired(DOC_8L);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8K",
    "## Actual live execution final execution request record",
    "## Actual-live-execution-final-execution-request-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8L creates static/mock actual live execution final execution request",
    "actual_live_execution_final_execution_request_boundary_only",
    "dependsOnOro8kActualLiveExecutionFinalExecutionGate = true",
    "oro8kActualLiveExecutionFinalExecutionGatePassed = true",
    "actualLiveExecutionFinalExecutionGateIssuedFromOro8k = true",
    "actualLiveExecutionFinalExecutionGateRecordedFromOro8k = true",
    "actualLiveExecutionFinalExecutionGateStatusFromOro8k = passed_for_separate_actual_live_execution_final_execution_request_only",
    "actualLiveExecutionFinalExecutionGateScopeFromOro8k = actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionFinalExecutionRequestPrepared = true",
    "actualLiveExecutionFinalExecutionRequestIssued = true",
    "actualLiveExecutionFinalExecutionRequestSubmitted = true",
    "actualLiveExecutionFinalExecutionRequestPassed = true",
    "actualLiveExecutionFinalExecutionRequestRecorded = true",
    "actualLiveExecutionFinalExecutionRequestStatus = submitted_for_separate_actual_live_execution_final_execution_approval_only",
    "actualLiveExecutionFinalExecutionRequestScope = actual_live_execution_final_execution_request_boundary_only",
    "actualLiveExecutionFinalExecutionRequestApproved = false",
    "actualLiveExecutionFinalExecutionApproved = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalApprovalRequired = true",
  ]) {
    assert(doc8l.includes(marker), `${DOC_8L} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8l",
    "oro-8l",
    "ORO_8L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "## ORO-8L Live Traffic Actual External Call Execution Actual Live Execution Final Execution Request Boundary Mapping",
        "ORO-8L records actual live execution final execution request only",
        ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
        ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
        ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
        ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
        "actualLiveExecutionFinalExecutionGateRecordedFromOro8k=true",
        "actualLiveExecutionFinalExecutionRequestSubmitted=true",
        "actualLiveExecutionFinalExecutionRequestRecorded=true",
        "actualLiveExecutionFinalExecutionRequestApproved=false",
        "actualLiveExecutionFinalExecutionApproved=false",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8L Current",
        "actual live execution final execution request boundary only",
        ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8L current/live traffic actual external call execution actual live execution final execution request boundary",
        "actual live execution final execution request boundary only",
        "`smoke:oro-8l` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8L Live Traffic Actual External Call Execution Actual Live Execution Final Execution Request Boundary Coverage",
        "ORO-8L actual live execution final execution request-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8K, DOC_8L].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8L files must not contain ${marker}.`);
  }
  for (const file of ORO8L_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult",
    "dependsOnOro8kActualLiveExecutionFinalExecutionGate",
    "oro8kActualLiveExecutionFinalExecutionGatePassed",
    "actualLiveExecutionFinalExecutionGateIssuedFromOro8k",
    "actualLiveExecutionFinalExecutionGateRecordedFromOro8k",
    "actualLiveExecutionFinalExecutionGateStatusFromOro8k",
    "actualLiveExecutionFinalExecutionGateScopeFromOro8k",
    "actualLiveExecutionFinalExecutionRequestPrepared",
    "actualLiveExecutionFinalExecutionRequestIssued",
    "actualLiveExecutionFinalExecutionRequestSubmitted",
    "actualLiveExecutionFinalExecutionRequestPassed",
    "actualLiveExecutionFinalExecutionRequestRecorded",
    "actualLiveExecutionFinalExecutionRequestStatus",
    "actualLiveExecutionFinalExecutionRequestScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8L_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture"
  );
  assert.strictEqual(summary.dependsOnOro8kActualLiveExecutionFinalExecutionGate, true);
  assert.strictEqual(summary.oro8kActualLiveExecutionFinalExecutionGatePassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateIssuedFromOro8k, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateRecordedFromOro8k, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateStatusFromOro8k,
    ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateScopeFromOro8k,
    ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestSubmitted, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestStatus,
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestScope,
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8L happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8L hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
      happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8kDependencyMissingFixture,
      "missing_oro8k_actual_live_execution_final_execution_gate_dependency",
    ],
    [
      failOro8kFinalExecutionGateNotPassedFixture,
      "oro8k_actual_live_execution_final_execution_gate_pass_required",
    ],
    [
      failOro8kFinalExecutionGateNotRecordedFixture,
      "oro8k_actual_live_execution_final_execution_gate_record_required",
    ],
    [
      failOro8kFinalExecutionGateStatusMismatchFixture,
      "invalid_oro8k_actual_live_execution_final_execution_gate_status",
    ],
    [
      failOro8kFinalExecutionGateScopeMismatchFixture,
      "invalid_oro8k_actual_live_execution_final_execution_gate_scope",
    ],
    [
      failFinalExecutionRequestNotPreparedFixture,
      "actual_live_execution_final_execution_request_preparation_required",
    ],
    [
      failFinalExecutionRequestNotIssuedFixture,
      "actual_live_execution_final_execution_request_issuance_required",
    ],
    [
      failFinalExecutionRequestNotSubmittedFixture,
      "actual_live_execution_final_execution_request_submission_required",
    ],
    [
      failFinalExecutionRequestNotPassedFixture,
      "actual_live_execution_final_execution_request_pass_required",
    ],
    [
      failFinalExecutionRequestNotRecordedFixture,
      "actual_live_execution_final_execution_request_record_required",
    ],
    [
      failFinalExecutionRequestStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_request_status",
    ],
    [
      failFinalExecutionRequestScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_request_scope",
    ],
    [
      failFinalExecutionRequestApprovesFinalExecutionFixture,
      "actualLiveExecutionFinalExecutionApproved_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestApprovesActualExecutionFixture,
      "actualLiveExecutionApproved_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestApprovesFinalExecutionRequestFixture,
      "actualLiveExecutionFinalExecutionRequestApproved_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8l",
    ],
    [
      failFinalExecutionRequestExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8l",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8l"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8l"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8l"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8l"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8l"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8l"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8l"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8l"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8l"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8l"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8l"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8l",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8l",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8l"],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_approval_required_after_oro8l",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_approval_required_after_oro8l",
    ],
    [
      failSeparateActualExecutionFinalApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_approval_required_after_oro8l",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures().map(
      evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary
    );
  assert.strictEqual(allReports.length, 37, "fixture set must cover ORO-8L cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8L live traffic actual external call execution actual live execution final execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8L live traffic actual external call execution actual live execution final execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
