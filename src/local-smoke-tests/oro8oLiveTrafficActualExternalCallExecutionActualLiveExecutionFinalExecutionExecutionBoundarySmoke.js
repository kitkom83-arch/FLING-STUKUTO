"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary");
const fixtures = require("../game-provider-mock/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures");
const {
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
} = require("../game-provider-mock/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

const {
  CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
  ORO8O_PHASE,
  ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
  PASS,
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySummary,
  evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  runOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
} = helper;

const {
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failFinalExecutionExecutionActivatesRuntimeFixture,
  failFinalExecutionExecutionApprovesRuntimeExecutionFixture,
  failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionExecutionEnablesRuntimeFixture,
  failFinalExecutionExecutionExecutesLiveCallFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8nDependencyMissingFixture,
  failOro8nFinalExecutionDecisionBoundaryNotPassedFixture,
  failOro8nFinalExecutionDecisionNotIssuedFixture,
  failOro8nFinalExecutionDecisionNotPreparedFixture,
  failOro8nFinalExecutionDecisionNotRecordedFixture,
  failOro8nFinalExecutionDecisionScopeMismatchFixture,
  failOro8nFinalExecutionDecisionStatusMismatchFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionVerificationMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8N =
  "docs/ORO_8N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const DOC_8O =
  "docs/ORO_8O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8oSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySmoke.js";
const SCRIPT = "smoke:oro-8o";
const DETAIL_SCRIPT =
  "smoke:oro-8o-actual-live-execution-final-execution-execution-boundary";
const ORO8O_SCAN_FILES = Object.freeze([DOC_8N, DOC_8O, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS,
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
  const doc8n = readRequired(DOC_8N);
  for (const marker of [
    "ORO-8O follows ORO-8N as the separate actual live execution final execution execution boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary = true",
    ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
    ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ]) {
    assert(doc8n.includes(marker), `${DOC_8N} missing marker ${marker}.`);
  }

  const doc8o = readRequired(DOC_8O);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8N",
    "## Actual live execution final execution execution record",
    "## Actual-live-execution-final-execution-execution-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8O creates static/mock actual live execution final execution execution",
    "actual_live_execution_final_execution_execution_boundary_only",
    "dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary = true",
    "oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n = true",
    "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n = true",
    "actualLiveExecutionFinalExecutionDecisionPassedFromOro8n = true",
    "actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n = true",
    "actualLiveExecutionFinalExecutionDecisionStatusFromOro8n = decided_for_separate_actual_live_execution_final_execution_execution_boundary_only",
    "actualLiveExecutionFinalExecutionDecisionScopeFromOro8n = actual_live_execution_final_execution_decision_boundary_only",
    "actualLiveExecutionFinalExecutionExecutionPrepared = true",
    "actualLiveExecutionFinalExecutionExecutionIssued = true",
    "actualLiveExecutionFinalExecutionExecutionPassed = true",
    "actualLiveExecutionFinalExecutionExecutionRecorded = true",
    "actualLiveExecutionFinalExecutionExecutionStatus = executed_as_mock_boundary_for_separate_actual_live_execution_final_execution_post_execution_verification_only",
    "actualLiveExecutionFinalExecutionExecutionScope = actual_live_execution_final_execution_execution_boundary_only",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualLiveExecutionFinalExecutionApproved = false",
    "actualLiveExecutionFinalExecutionExecuted = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionVerificationRequired = true",
  ]) {
    assert(doc8o.includes(marker), `${DOC_8O} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8o",
    "oro-8o",
    "ORO_8O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_BOUNDARY.md",
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
        "## ORO-8O Live Traffic Actual External Call Execution Actual Live Execution Final Execution Execution Boundary Mapping",
        "ORO-8O records actual live execution final execution execution only",
        ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
        ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
        ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
        ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
        "actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n=true",
        "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n=true",
        "actualLiveExecutionFinalExecutionDecisionPassedFromOro8n=true",
        "actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n=true",
        "actualLiveExecutionFinalExecutionExecutionPrepared=true",
        "actualLiveExecutionFinalExecutionExecutionIssued=true",
        "actualLiveExecutionFinalExecutionExecutionPassed=true",
        "actualLiveExecutionFinalExecutionExecutionRecorded=true",
        "actualExternalCallExecutionLiveExecutionApproved=false",
        "actualLiveExecutionFinalExecutionApproved=false",
        "actualLiveExecutionFinalExecutionExecuted=false",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8O Current",
        "actual live execution final execution execution boundary only",
        ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8O current/live traffic actual external call execution actual live execution final execution execution boundary",
        "actual live execution final execution execution boundary only",
        "`smoke:oro-8o` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8O Live Traffic Actual External Call Execution Actual Live Execution Final Execution Execution Boundary Coverage",
        "ORO-8O actual live execution final execution execution-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8N, DOC_8O].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8O files must not contain ${marker}.`);
  }
  for (const file of ORO8O_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryResult",
    "dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary",
    "oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed",
    "actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n",
    "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n",
    "actualLiveExecutionFinalExecutionDecisionPassedFromOro8n",
    "actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n",
    "actualLiveExecutionFinalExecutionDecisionStatusFromOro8n",
    "actualLiveExecutionFinalExecutionDecisionScopeFromOro8n",
    "actualLiveExecutionFinalExecutionExecutionPrepared",
    "actualLiveExecutionFinalExecutionExecutionIssued",
    "actualLiveExecutionFinalExecutionExecutionPassed",
    "actualLiveExecutionFinalExecutionExecutionRecorded",
    "actualLiveExecutionFinalExecutionExecutionStatus",
    "actualLiveExecutionFinalExecutionExecutionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionVerificationRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8O_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(summary.oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionPassedFromOro8n, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionStatusFromOro8n,
    ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionScopeFromOro8n,
    ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionExecutionStatus,
    ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionExecutionScope,
    ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalExecutionVerificationRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8O happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8O hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
      happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8nDependencyMissingFixture,
      "missing_oro8n_actual_live_execution_final_execution_decision_boundary_dependency",
    ],
    [
      failOro8nFinalExecutionDecisionNotPreparedFixture,
      "oro8n_actual_live_execution_final_execution_decision_preparation_required",
    ],
    [
      failOro8nFinalExecutionDecisionNotIssuedFixture,
      "oro8n_actual_live_execution_final_execution_decision_issuance_required",
    ],
    [
      failOro8nFinalExecutionDecisionBoundaryNotPassedFixture,
      "oro8n_actual_live_execution_final_execution_decision_boundary_pass_required",
    ],
    [
      failOro8nFinalExecutionDecisionNotRecordedFixture,
      "oro8n_actual_live_execution_final_execution_decision_record_required",
    ],
    [
      failOro8nFinalExecutionDecisionStatusMismatchFixture,
      "invalid_oro8n_actual_live_execution_final_execution_decision_status",
    ],
    [
      failOro8nFinalExecutionDecisionScopeMismatchFixture,
      "invalid_oro8n_actual_live_execution_final_execution_decision_scope",
    ],
    [
      failFinalExecutionExecutionApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8o",
    ],
    [
      failFinalExecutionExecutionActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8o",
    ],
    [
      failFinalExecutionExecutionEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8o",
    ],
    [
      failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8o",
    ],
    [
      failFinalExecutionExecutionExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8o",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8o"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8o"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8o"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8o"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8o"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8o"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8o"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8o"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8o"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8o"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8o"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8o",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8o",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8o"],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_post_execution_verification_boundary_required_after_oro8o",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_post_execution_verification_boundary_required_after_oro8o",
    ],
    [
      failSeparateActualExecutionFinalExecutionVerificationMissingFixture,
      "separate_actual_live_execution_final_execution_post_execution_verification_boundary_required_after_oro8o",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures().map(
      evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-8O cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8O live traffic actual external call execution actual live execution final execution execution boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8O live traffic actual external call execution actual live execution final execution execution boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
