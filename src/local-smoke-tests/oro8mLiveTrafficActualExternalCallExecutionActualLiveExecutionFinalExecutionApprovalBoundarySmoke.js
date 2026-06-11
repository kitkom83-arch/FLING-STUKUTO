"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary");
const fixtures = require("../game-provider-mock/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures");
const {
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
} = require("../game-provider-mock/oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

const {
  CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO8M_PHASE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
  PASS,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySummary,
  evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  runOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
} = helper;

const {
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failFinalExecutionApprovalActivatesRuntimeFixture,
  failFinalExecutionApprovalApprovesRuntimeExecutionFixture,
  failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionApprovalEnablesRuntimeFixture,
  failFinalExecutionApprovalExecutesLiveCallFixture,
  failFinalExecutionApprovalNotIssuedFixture,
  failFinalExecutionApprovalNotPassedFixture,
  failFinalExecutionApprovalNotPreparedFixture,
  failFinalExecutionApprovalNotRecordedFixture,
  failFinalExecutionApprovalScopeMismatchFixture,
  failFinalExecutionApprovalStatusMismatchFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8lDependencyMissingFixture,
  failOro8lFinalExecutionRequestBoundaryNotPassedFixture,
  failOro8lFinalExecutionRequestNotRecordedFixture,
  failOro8lFinalExecutionRequestNotSubmittedFixture,
  failOro8lFinalExecutionRequestScopeMismatchFixture,
  failOro8lFinalExecutionRequestStatusMismatchFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalDecisionMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8L =
  "docs/ORO_8L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_8M =
  "docs/ORO_8M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8mSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-8m";
const DETAIL_SCRIPT =
  "smoke:oro-8m-actual-live-execution-final-execution-approval-boundary";
const ORO8M_SCAN_FILES = Object.freeze([DOC_8L, DOC_8M, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
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
  const doc8l = readRequired(DOC_8L);
  for (const marker of [
    "ORO-8M follows ORO-8L as the separate actual live execution final execution approval boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval = true",
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ]) {
    assert(doc8l.includes(marker), `${DOC_8L} missing marker ${marker}.`);
  }

  const doc8m = readRequired(DOC_8M);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8L",
    "## Actual live execution final execution approval record",
    "## Actual-live-execution-final-execution-approval-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8M creates static/mock actual live execution final execution approval",
    "actual_live_execution_final_execution_approval_boundary_only",
    "dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary = true",
    "oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l = true",
    "actualLiveExecutionFinalExecutionRequestRecordedFromOro8l = true",
    "actualLiveExecutionFinalExecutionRequestStatusFromOro8l = submitted_for_separate_actual_live_execution_final_execution_approval_only",
    "actualLiveExecutionFinalExecutionRequestScopeFromOro8l = actual_live_execution_final_execution_request_boundary_only",
    "actualLiveExecutionFinalExecutionApprovalPrepared = true",
    "actualLiveExecutionFinalExecutionApprovalIssued = true",
    "actualLiveExecutionFinalExecutionApprovalPassed = true",
    "actualLiveExecutionFinalExecutionApprovalRecorded = true",
    "actualLiveExecutionFinalExecutionApprovalStatus = approved_for_separate_actual_live_execution_final_execution_decision_boundary_only",
    "actualLiveExecutionFinalExecutionApprovalScope = actual_live_execution_final_execution_approval_boundary_only",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualLiveExecutionFinalExecutionApproved = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalDecisionRequired = true",
  ]) {
    assert(doc8m.includes(marker), `${DOC_8M} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8m",
    "oro-8m",
    "ORO_8M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_BOUNDARY.md",
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
        "## ORO-8M Live Traffic Actual External Call Execution Actual Live Execution Final Execution Approval Boundary Mapping",
        "ORO-8M records actual live execution final execution approval only",
        ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
        ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
        ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
        ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
        "actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l=true",
        "actualLiveExecutionFinalExecutionRequestRecordedFromOro8l=true",
        "actualLiveExecutionFinalExecutionApprovalPrepared=true",
        "actualLiveExecutionFinalExecutionApprovalIssued=true",
        "actualLiveExecutionFinalExecutionApprovalPassed=true",
        "actualLiveExecutionFinalExecutionApprovalRecorded=true",
        "actualExternalCallExecutionLiveExecutionApproved=false",
        "actualLiveExecutionFinalExecutionApproved=false",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8M Current",
        "actual live execution final execution approval boundary only",
        ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8M current/live traffic actual external call execution actual live execution final execution approval boundary",
        "actual live execution final execution approval boundary only",
        "`smoke:oro-8m` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8M Live Traffic Actual External Call Execution Actual Live Execution Final Execution Approval Boundary Coverage",
        "ORO-8M actual live execution final execution approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8L, DOC_8M].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8M files must not contain ${marker}.`);
  }
  for (const file of ORO8M_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryResult",
    "dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary",
    "oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed",
    "actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l",
    "actualLiveExecutionFinalExecutionRequestRecordedFromOro8l",
    "actualLiveExecutionFinalExecutionRequestStatusFromOro8l",
    "actualLiveExecutionFinalExecutionRequestScopeFromOro8l",
    "actualLiveExecutionFinalExecutionApprovalPrepared",
    "actualLiveExecutionFinalExecutionApprovalIssued",
    "actualLiveExecutionFinalExecutionApprovalPassed",
    "actualLiveExecutionFinalExecutionApprovalRecorded",
    "actualLiveExecutionFinalExecutionApprovalStatus",
    "actualLiveExecutionFinalExecutionApprovalScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalDecisionRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8M_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary,
    true
  );
  assert.strictEqual(summary.oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestRecordedFromOro8l, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestStatusFromOro8l,
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestScopeFromOro8l,
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionApprovalStatus,
    ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionApprovalScope,
    ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalDecisionRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8M happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8M hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
      happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8lDependencyMissingFixture,
      "missing_oro8l_actual_live_execution_final_execution_request_boundary_dependency",
    ],
    [
      failOro8lFinalExecutionRequestNotSubmittedFixture,
      "oro8l_actual_live_execution_final_execution_request_submission_required",
    ],
    [
      failOro8lFinalExecutionRequestBoundaryNotPassedFixture,
      "oro8l_actual_live_execution_final_execution_request_boundary_pass_required",
    ],
    [
      failOro8lFinalExecutionRequestNotRecordedFixture,
      "oro8l_actual_live_execution_final_execution_request_record_required",
    ],
    [
      failOro8lFinalExecutionRequestStatusMismatchFixture,
      "invalid_oro8l_actual_live_execution_final_execution_request_status",
    ],
    [
      failOro8lFinalExecutionRequestScopeMismatchFixture,
      "invalid_oro8l_actual_live_execution_final_execution_request_scope",
    ],
    [
      failFinalExecutionApprovalNotPreparedFixture,
      "actual_live_execution_final_execution_approval_preparation_required",
    ],
    [
      failFinalExecutionApprovalNotIssuedFixture,
      "actual_live_execution_final_execution_approval_issuance_required",
    ],
    [
      failFinalExecutionApprovalNotPassedFixture,
      "actual_live_execution_final_execution_approval_pass_required",
    ],
    [
      failFinalExecutionApprovalNotRecordedFixture,
      "actual_live_execution_final_execution_approval_record_required",
    ],
    [
      failFinalExecutionApprovalStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_approval_status",
    ],
    [
      failFinalExecutionApprovalScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_approval_scope",
    ],
    [
      failFinalExecutionApprovalApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8m",
    ],
    [
      failFinalExecutionApprovalActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8m",
    ],
    [
      failFinalExecutionApprovalEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8m",
    ],
    [
      failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8m",
    ],
    [
      failFinalExecutionApprovalExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8m",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8m"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8m"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8m"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8m"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8m"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8m"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8m"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8m"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8m"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8m"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8m"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8m",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8m",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8m"],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_decision_boundary_required_after_oro8m",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_decision_boundary_required_after_oro8m",
    ],
    [
      failSeparateActualExecutionFinalDecisionMissingFixture,
      "separate_actual_live_execution_final_execution_decision_boundary_required_after_oro8m",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures().map(
      evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary
    );
  assert.strictEqual(allReports.length, 35, "fixture set must cover ORO-8M cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8M live traffic actual external call execution actual live execution final execution approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8M live traffic actual external call execution actual live execution final execution approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
