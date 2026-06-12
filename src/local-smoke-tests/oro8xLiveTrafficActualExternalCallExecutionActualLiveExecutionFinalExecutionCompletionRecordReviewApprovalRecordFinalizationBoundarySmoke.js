"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixtures");
const {
  ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
} = require("../game-provider-mock/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary");

const {
  CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  ORO8X_PHASE,
  PASS,
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySummary,
  evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  runOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8W =
  "docs/ORO_8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_8X =
  "docs/ORO_8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8xSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-8x";
const DETAIL_SCRIPT =
  "smoke:oro-8x-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-boundary";
const ORO8X_SCAN_FILES = Object.freeze([DOC_8X, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS,
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
  const doc8w = readRequired(DOC_8W);
  for (const marker of [
    "ORO-8X follows ORO-8W as the separate actual live execution final execution completion record review approval record finalization boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary = true",
  ]) {
    assert(doc8w.includes(marker), `${DOC_8W} missing marker ${marker}.`);
  }

  const doc8x = readRequired(DOC_8X);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8W",
    "## Review approval record finalization",
    "## Finalization-boundary-only",
    "## ORO-8W, ORO-8V, ORO-8U, and ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8X records static/mock actual live execution final execution completion record review approval record finalization evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only",
    "dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary = true",
    "oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w = completion_record_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w = actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus = completion_record_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only",
    "verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly = true",
    "verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly = true",
    "verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly = true",
    "verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForLiveExecution = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRuntimeFinalized = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired = true",
  ]) {
    assert(doc8x.includes(marker), `${DOC_8X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8x",
    "oro-8x",
    "ORO_8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md",
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
        "## ORO-8X Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Boundary Mapping",
        "ORO-8X finalizes review approval record evidence only",
        ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
        ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
        ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded=true",
        "verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly=true",
        "verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly=true",
        "verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly=true",
        "verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationApplied=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForRuntime=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForLiveExecution=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRuntimeFinalized=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8X Current",
        "actual live execution final execution completion record review approval record finalization boundary only",
        ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8X current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization boundary",
        "actual live execution final execution completion record review approval record finalization boundary only",
        "`smoke:oro-8x` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8X Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Boundary Coverage",
        "ORO-8X actual live execution final execution completion-record-review-approval-record-finalization-boundary package smoke alias",
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
    ["process", "env"].join("."),
  ];
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8X].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8X files must not contain ${marker}.`);
  }
  for (const file of ORO8X_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryResult",
    "dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary",
    "oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope",
    "verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8X_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w,
    ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w,
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus,
    ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope,
    ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly,
    true
  );
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired,
    true
  );
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired,
    true
  );
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8X happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8X hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro8wDependencyMissingFixture,
      "missing_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_dependency",
    ],
    [
      fixtures.failOro8wCompletionRecordReviewApprovalRecordBoundaryNotPassedFixture,
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_pass_required",
    ],
    [
      fixtures.failOro8wCompletionRecordReviewApprovalRecordStatusMismatchFixture,
      "invalid_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_status",
    ],
    [
      fixtures.failOro8wCompletionRecordReviewApprovalRecordScopeMismatchFixture,
      "invalid_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_scope",
    ],
    [
      fixtures.failOro8wNotCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
      "oro8w_completion_record_review_approval_record_boundary_only_proof_required",
    ],
    [
      fixtures.failOro8wCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
      "oro8w_must_confirm_oro8v_completion_record_review_approval_boundary_only",
    ],
    [
      fixtures.failOro8wCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
      "oro8w_must_confirm_oro8u_completion_record_review_boundary_only",
    ],
    [
      fixtures.failOro8wCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
      "oro8w_must_confirm_oro8t_completion_record_boundary_only",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_preparation_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_issuance_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_pass_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_record_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_status",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "approval_record_finalization_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failExternalNetworkAttemptedFixture,
      "externalNetworkAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failWalletMutationAttemptedFixture,
      "walletMutationAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failLedgerMutationAttemptedFixture,
      "ledgerMutationAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failPrismaWriteAttemptedFixture,
      "prismaWriteAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failDbTransactionAttemptedFixture,
      "dbTransactionAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failRouteEnablementAttemptedFixture,
      "routeEnablementAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failPublicAliasAttemptedFixture,
      "publicAliasAllowed_not_allowed_in_oro8x",
    ],
    [
      fixtures.failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationApplied_not_allowed_in_oro8x",
    ],
    [
      fixtures.failApprovalRecordFinalizationAcceptedForLiveExecutionFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForLiveExecution_not_allowed_in_oro8x",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "approval_record_finalization_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "approval_record_finalization_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "approval_record_finalization_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failFinalizationReviewBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [
      fixtures.failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [
      fixtures.failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro8x"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixtures().map(
      evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary
    );
  assert.strictEqual(allReports.length, 36, "fixture set must cover ORO-8X cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8X live traffic actual external call execution actual live execution final execution completion record review approval record finalization boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8X live traffic actual external call execution actual live execution final execution completion record review approval record finalization boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
