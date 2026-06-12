"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures");
const {
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
} = require("../game-provider-mock/oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary");

const {
  CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO8N_PHASE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  PASS,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySummary,
  evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  runOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
} = helper;

const {
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failFinalExecutionDecisionActivatesRuntimeFixture,
  failFinalExecutionDecisionApprovesRuntimeExecutionFixture,
  failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionDecisionEnablesRuntimeFixture,
  failFinalExecutionDecisionExecutesLiveCallFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8mDependencyMissingFixture,
  failOro8mFinalExecutionApprovalBoundaryNotPassedFixture,
  failOro8mFinalExecutionApprovalNotIssuedFixture,
  failOro8mFinalExecutionApprovalNotPreparedFixture,
  failOro8mFinalExecutionApprovalNotRecordedFixture,
  failOro8mFinalExecutionApprovalScopeMismatchFixture,
  failOro8mFinalExecutionApprovalStatusMismatchFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8M =
  "docs/ORO_8M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_BOUNDARY.md";
const DOC_8N =
  "docs/ORO_8N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8nSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-8n";
const DETAIL_SCRIPT =
  "smoke:oro-8n-actual-live-execution-final-execution-decision-boundary";
const ORO8N_SCAN_FILES = Object.freeze([DOC_8M, DOC_8N, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
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
  const doc8m = readRequired(DOC_8M);
  for (const marker of [
    "ORO-8N follows ORO-8M as the separate actual live execution final execution decision boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary = true",
    ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
    ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ]) {
    assert(doc8m.includes(marker), `${DOC_8M} missing marker ${marker}.`);
  }

  const doc8n = readRequired(DOC_8N);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8M",
    "## Actual live execution final execution decision record",
    "## Actual-live-execution-final-execution-decision-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8N creates static/mock actual live execution final execution decision",
    "actual_live_execution_final_execution_decision_boundary_only",
    "dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary = true",
    "oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m = true",
    "actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m = true",
    "actualLiveExecutionFinalExecutionApprovalPassedFromOro8m = true",
    "actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m = true",
    "actualLiveExecutionFinalExecutionApprovalStatusFromOro8m = approved_for_separate_actual_live_execution_final_execution_decision_boundary_only",
    "actualLiveExecutionFinalExecutionApprovalScopeFromOro8m = actual_live_execution_final_execution_approval_boundary_only",
    "actualLiveExecutionFinalExecutionDecisionPrepared = true",
    "actualLiveExecutionFinalExecutionDecisionIssued = true",
    "actualLiveExecutionFinalExecutionDecisionPassed = true",
    "actualLiveExecutionFinalExecutionDecisionRecorded = true",
    "actualLiveExecutionFinalExecutionDecisionStatus = decided_for_separate_actual_live_execution_final_execution_execution_boundary_only",
    "actualLiveExecutionFinalExecutionDecisionScope = actual_live_execution_final_execution_decision_boundary_only",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualLiveExecutionFinalExecutionApproved = false",
    "actualLiveExecutionFinalExecutionExecuted = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionRequired = true",
  ]) {
    assert(doc8n.includes(marker), `${DOC_8N} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8n",
    "oro-8n",
    "ORO_8N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md",
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
        "## ORO-8N Live Traffic Actual External Call Execution Actual Live Execution Final Execution Decision Boundary Mapping",
        "ORO-8N records actual live execution final execution decision only",
        ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
        ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
        ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
        ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
        "actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m=true",
        "actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m=true",
        "actualLiveExecutionFinalExecutionApprovalPassedFromOro8m=true",
        "actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m=true",
        "actualLiveExecutionFinalExecutionDecisionPrepared=true",
        "actualLiveExecutionFinalExecutionDecisionIssued=true",
        "actualLiveExecutionFinalExecutionDecisionPassed=true",
        "actualLiveExecutionFinalExecutionDecisionRecorded=true",
        "actualExternalCallExecutionLiveExecutionApproved=false",
        "actualLiveExecutionFinalExecutionApproved=false",
        "actualLiveExecutionFinalExecutionExecuted=false",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8N Current",
        "actual live execution final execution decision boundary only",
        ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8N current/live traffic actual external call execution actual live execution final execution decision boundary",
        "actual live execution final execution decision boundary only",
        "`smoke:oro-8n` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8N Live Traffic Actual External Call Execution Actual Live Execution Final Execution Decision Boundary Coverage",
        "ORO-8N actual live execution final execution decision-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8M, DOC_8N].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8N files must not contain ${marker}.`);
  }
  for (const file of ORO8N_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult",
    "dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary",
    "oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed",
    "actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m",
    "actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m",
    "actualLiveExecutionFinalExecutionApprovalPassedFromOro8m",
    "actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m",
    "actualLiveExecutionFinalExecutionApprovalStatusFromOro8m",
    "actualLiveExecutionFinalExecutionApprovalScopeFromOro8m",
    "actualLiveExecutionFinalExecutionDecisionPrepared",
    "actualLiveExecutionFinalExecutionDecisionIssued",
    "actualLiveExecutionFinalExecutionDecisionPassed",
    "actualLiveExecutionFinalExecutionDecisionRecorded",
    "actualLiveExecutionFinalExecutionDecisionStatus",
    "actualLiveExecutionFinalExecutionDecisionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8N_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary,
    true
  );
  assert.strictEqual(summary.oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalPassedFromOro8m, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionApprovalStatusFromOro8m,
    ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionApprovalScopeFromOro8m,
    ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionStatus,
    ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionScope,
    ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalExecutionRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8N happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8N hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
      happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8mDependencyMissingFixture,
      "missing_oro8m_actual_live_execution_final_execution_approval_boundary_dependency",
    ],
    [
      failOro8mFinalExecutionApprovalNotPreparedFixture,
      "oro8m_actual_live_execution_final_execution_approval_preparation_required",
    ],
    [
      failOro8mFinalExecutionApprovalNotIssuedFixture,
      "oro8m_actual_live_execution_final_execution_approval_issuance_required",
    ],
    [
      failOro8mFinalExecutionApprovalBoundaryNotPassedFixture,
      "oro8m_actual_live_execution_final_execution_approval_boundary_pass_required",
    ],
    [
      failOro8mFinalExecutionApprovalNotRecordedFixture,
      "oro8m_actual_live_execution_final_execution_approval_record_required",
    ],
    [
      failOro8mFinalExecutionApprovalStatusMismatchFixture,
      "invalid_oro8m_actual_live_execution_final_execution_approval_status",
    ],
    [
      failOro8mFinalExecutionApprovalScopeMismatchFixture,
      "invalid_oro8m_actual_live_execution_final_execution_approval_scope",
    ],
    [
      failFinalExecutionDecisionApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8n",
    ],
    [
      failFinalExecutionDecisionActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8n",
    ],
    [
      failFinalExecutionDecisionEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8n",
    ],
    [
      failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8n",
    ],
    [
      failFinalExecutionDecisionExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8n",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8n"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8n"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8n"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8n"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8n"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8n"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8n"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8n"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8n"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8n"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8n"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8n",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8n",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8n"],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_execution_boundary_required_after_oro8n",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_execution_boundary_required_after_oro8n",
    ],
    [
      failSeparateActualExecutionFinalExecutionMissingFixture,
      "separate_actual_live_execution_final_execution_execution_boundary_required_after_oro8n",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures().map(
      evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-8N cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8N live traffic actual external call execution actual live execution final execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8N live traffic actual external call execution actual live execution final execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
