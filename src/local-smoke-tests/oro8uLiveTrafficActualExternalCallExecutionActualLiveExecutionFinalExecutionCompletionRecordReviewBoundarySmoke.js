"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary");
const fixtures = require("../game-provider-mock/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures");
const {
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
} = require("../game-provider-mock/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary");

const {
  CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
  ORO8U_PHASE,
  ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
  PASS,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySummary,
  evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  runOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
} = helper;

const {
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRouteOrAliasFixture,
  failCannotProveNoRuntimeFixture,
  failCompletionRecordReviewActivatesRuntimeFixture,
  failCompletionRecordReviewApprovalBoundaryMissingFixture,
  failCompletionRecordReviewApprovesRuntimeExecutionFixture,
  failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture,
  failCompletionRecordReviewEnablesRuntimeFixture,
  failCompletionRecordReviewExecutesLiveCallFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture,
  failCompletionRecordReviewNotIssuedFixture,
  failCompletionRecordReviewNotPassedFixture,
  failCompletionRecordReviewNotPreparedFixture,
  failCompletionRecordReviewNotRecordedFixture,
  failCompletionRecordReviewScopeMismatchFixture,
  failCompletionRecordReviewStatusMismatchFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8tCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture,
  failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture,
  failOro8tCompletionRecordBoundaryNotPassedFixture,
  failOro8tCompletionRecordNotIssuedFixture,
  failOro8tCompletionRecordNotPreparedFixture,
  failOro8tCompletionRecordNotRecordedFixture,
  failOro8tCompletionRecordScopeMismatchFixture,
  failOro8tCompletionRecordStatusMismatchFixture,
  failOro8tDependencyMissingFixture,
  failOro8tNotCompletionRecordBoundaryOnlyFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8T =
  "docs/ORO_8T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_BOUNDARY.md";
const DOC_8U =
  "docs/ORO_8U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8uSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-8u";
const DETAIL_SCRIPT =
  "smoke:oro-8u-actual-live-execution-final-execution-completion-record-review-boundary";
const ORO8U_SCAN_FILES = Object.freeze([DOC_8T, DOC_8U, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
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
  const doc8t = readRequired(DOC_8T);
  for (const marker of [
    "ORO-8U follows ORO-8T as the separate actual live execution final execution completion record review boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary = true",
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ]) {
    assert(doc8t.includes(marker), `${DOC_8T} missing marker ${marker}.`);
  }

  const doc8u = readRequired(DOC_8U);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8T",
    "## Completion record review",
    "## Completion-record-review-boundary-only",
    "## ORO-8T, ORO-8S, ORO-8R, ORO-8Q, ORO-8P, and ORO-8O proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8U creates static/mock actual live execution final execution completion record review evidence",
    "actual_live_execution_final_execution_completion_record_review_boundary_only",
    "dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary = true",
    "oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t = true",
    "actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t = true",
    "actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t = true",
    "actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t = true",
    "actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t = completion_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t = actual_live_execution_final_execution_completion_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewStatus = completion_record_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewScope = actual_live_execution_final_execution_completion_record_review_boundary_only",
    "verifiedOro8tWasCompletionRecordBoundaryOnly = true",
    "verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly = true",
    "verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly = true",
    "verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly = true",
    "verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly = true",
    "verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly = true",
    "verifiedNoActualLiveExecutionOccurred = true",
    "verifiedNoRuntimeActivationOccurred = true",
    "verifiedNoRuntimeEnablementOccurred = true",
    "verifiedNoRuntimeAuthorizationOccurred = true",
    "verifiedNoExternalNetworkOccurred = true",
    "verifiedNoLiveOroPlayApiCallOccurred = true",
    "verifiedNoWalletMutationOccurred = true",
    "verifiedNoLedgerMutationOccurred = true",
    "verifiedNoPrismaWriteOccurred = true",
    "verifiedNoDbTransactionOccurred = true",
    "verifiedNoRouteEnablementOccurred = true",
    "verifiedNoExpressMountOccurred = true",
    "verifiedNoPublicAliasOccurred = true",
    "actualLiveExecutionFinalExecutionCompletionRecorded = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
  ]) {
    assert(doc8u.includes(marker), `${DOC_8U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8u",
    "oro-8u",
    "ORO_8U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_BOUNDARY.md",
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
        "## ORO-8U Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Boundary Mapping",
        "ORO-8U reviews actual live execution final execution completion record only",
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
        ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
        ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t=true",
        "actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t=true",
        "actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t=true",
        "actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded=true",
        "verifiedOro8tWasCompletionRecordBoundaryOnly=true",
        "verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly=true",
        "verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly=true",
        "verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly=true",
        "verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly=true",
        "verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "actualLiveExecutionFinalExecutionCompletionRecorded=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8U Current",
        "actual live execution final execution completion record review boundary only",
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8U current/live traffic actual external call execution actual live execution final execution completion record review boundary",
        "actual live execution final execution completion record review boundary only",
        "`smoke:oro-8u` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8U Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Boundary Coverage",
        "ORO-8U actual live execution final execution completion-record-review-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8T, DOC_8U].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8U files must not contain ${marker}.`);
  }
  for (const file of ORO8U_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryResult",
    "dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary",
    "oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewScope",
    "verifiedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly",
    "verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly",
    "verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly",
    "verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
    "verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly",
    "verifiedNoActualLiveExecutionOccurred",
    "verifiedNoRuntimeActivationOccurred",
    "verifiedNoRuntimeEnablementOccurred",
    "verifiedNoRuntimeAuthorizationOccurred",
    "verifiedNoExternalNetworkOccurred",
    "verifiedNoLiveOroPlayApiCallOccurred",
    "verifiedNoWalletMutationOccurred",
    "verifiedNoLedgerMutationOccurred",
    "verifiedNoPrismaWriteOccurred",
    "verifiedNoDbTransactionOccurred",
    "verifiedNoRouteEnablementOccurred",
    "verifiedNoExpressMountOccurred",
    "verifiedNoPublicAliasOccurred",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8U_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t,
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t,
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewStatus,
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewScope,
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8tWasCompletionRecordBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly, true);
  assert.strictEqual(
    summary.verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly, true);
  assert.strictEqual(summary.verifiedNoActualLiveExecutionOccurred, true);
  assert.strictEqual(summary.verifiedNoRuntimeActivationOccurred, true);
  assert.strictEqual(summary.verifiedNoRuntimeEnablementOccurred, true);
  assert.strictEqual(summary.verifiedNoRuntimeAuthorizationOccurred, true);
  assert.strictEqual(summary.verifiedNoExternalNetworkOccurred, true);
  assert.strictEqual(summary.verifiedNoLiveOroPlayApiCallOccurred, true);
  assert.strictEqual(summary.verifiedNoWalletMutationOccurred, true);
  assert.strictEqual(summary.verifiedNoLedgerMutationOccurred, true);
  assert.strictEqual(summary.verifiedNoPrismaWriteOccurred, true);
  assert.strictEqual(summary.verifiedNoDbTransactionOccurred, true);
  assert.strictEqual(summary.verifiedNoRouteEnablementOccurred, true);
  assert.strictEqual(summary.verifiedNoExpressMountOccurred, true);
  assert.strictEqual(summary.verifiedNoPublicAliasOccurred, true);
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8U happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8U hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
      happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8tDependencyMissingFixture,
      "missing_oro8t_actual_live_execution_final_execution_completion_record_boundary_dependency",
    ],
    [
      failOro8tCompletionRecordNotPreparedFixture,
      "oro8t_actual_live_execution_final_execution_completion_record_preparation_required",
    ],
    [
      failOro8tCompletionRecordNotIssuedFixture,
      "oro8t_actual_live_execution_final_execution_completion_record_issuance_required",
    ],
    [
      failOro8tCompletionRecordBoundaryNotPassedFixture,
      "oro8t_actual_live_execution_final_execution_completion_record_boundary_pass_required",
    ],
    [
      failOro8tCompletionRecordNotRecordedFixture,
      "oro8t_actual_live_execution_final_execution_completion_record_record_required",
    ],
    [
      failOro8tCompletionRecordStatusMismatchFixture,
      "invalid_oro8t_actual_live_execution_final_execution_completion_record_status",
    ],
    [
      failOro8tCompletionRecordScopeMismatchFixture,
      "invalid_oro8t_actual_live_execution_final_execution_completion_record_scope",
    ],
    [
      failOro8tCannotProveNoActualLiveExecutionOccurredFixture,
      "completion_record_review_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
      "oro8t_must_confirm_oro8o_mock_execution_boundary_only",
    ],
    [
      failOro8tNotCompletionRecordBoundaryOnlyFixture,
      "oro8t_completion_record_boundary_only_proof_required",
    ],
    [
      failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture,
      "oro8t_must_confirm_oro8s_audit_boundary_only",
    ],
    [
      failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture,
      "oro8t_must_confirm_oro8r_archive_boundary_only",
    ],
    [
      failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
      "oro8t_must_confirm_oro8q_closeout_boundary_only",
    ],
    [
      failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
      "oro8t_must_confirm_oro8p_post_execution_verification_boundary_only",
    ],
    [
      failCompletionRecordReviewNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_preparation_required",
    ],
    [
      failCompletionRecordReviewNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_issuance_required",
    ],
    [
      failCompletionRecordReviewNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_pass_required",
    ],
    [
      failCompletionRecordReviewNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_record_required",
    ],
    [
      failCompletionRecordReviewStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_status",
    ],
    [
      failCompletionRecordReviewScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_scope",
    ],
    [
      failCompletionRecordReviewApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture,
      "actualLiveExecutionFinalExecutionExecuted_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture,
      "actualLiveExecutionFinalExecutionClosed_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture,
      "actualLiveExecutionFinalExecutionArchived_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture,
      "actualLiveExecutionFinalExecutionAudited_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecorded_not_allowed_in_oro8u",
    ],
    [
      failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewed_not_allowed_in_oro8u",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8u"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8u"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8u"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8u"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8u"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8u"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8u"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8u"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8u"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8u"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8u"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8u",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8u",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "completion_record_review_requires_no_mutation_and_no_external_network_proof",
    ],
    [failCannotProveNoRuntimeFixture, "completion_record_review_requires_no_runtime_proof"],
    [
      failCannotProveNoRouteOrAliasFixture,
      "completion_record_review_requires_no_actual_execution_route_or_alias_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8u"],
    [
      failCompletionRecordReviewApprovalBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_required_after_oro8u",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_required_after_oro8u",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_required_after_oro8u",
    ],
    [
      failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_required_after_oro8u",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures().map(
      evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary
    );
  assert.strictEqual(allReports.length, 53, "fixture set must cover ORO-8U cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8U live traffic actual external call execution actual live execution final execution completion record review boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8U live traffic actual external call execution actual live execution final execution completion record review boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
