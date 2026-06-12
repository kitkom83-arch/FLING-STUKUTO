"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixtures");
const {
  ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
} = require("../game-provider-mock/oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary");

const {
  CLOSED_ORO8Y_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
  ORO8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS,
  ORO8Y_PHASE,
  PASS,
  buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
  buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundarySummary,
  evaluateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
  runOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
  validateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8X =
  "docs/ORO_8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_8Y =
  "docs/ORO_8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8ySmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-8y";
const DETAIL_SCRIPT =
  "smoke:oro-8y-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-boundary";
const ORO8Y_SCAN_FILES = Object.freeze([DOC_8Y, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8Y_ACTUAL_EXECUTION_FLAGS,
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
  const doc8x = readRequired(DOC_8X);
  for (const marker of [
    "ORO-8Y follows ORO-8X as the separate actual live execution final execution completion record review approval record finalization review boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary = true",
  ]) {
    assert(doc8x.includes(marker), `${DOC_8X} missing marker ${marker}.`);
  }

  const doc8y = readRequired(DOC_8Y);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8X",
    "## Finalization review",
    "## Finalization-review-boundary-only",
    "## ORO-8X through ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8Y records static/mock actual live execution final execution completion record review approval record finalization review evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_only",
    "dependsOnOro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary = true",
    "oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPreparedFromOro8x = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssuedFromOro8x = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassedFromOro8x = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecordedFromOro8x = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatusFromOro8x = completion_record_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScopeFromOro8x = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatus = completion_record_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScope = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_only",
    "verifiedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly = true",
    "verifiedOro8xConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly = true",
    "verifiedOro8xConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly = true",
    "verifiedOro8xConfirmedOro8uWasCompletionRecordReviewBoundaryOnly = true",
    "verifiedOro8xConfirmedOro8tWasCompletionRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewed = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRuntimeApplied = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired = true",
  ]) {
    assert(doc8y.includes(marker), `${DOC_8Y} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8y",
    "oro-8y",
    "ORO_8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md",
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
        "## ORO-8Y Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Boundary Mapping",
        "ORO-8Y reviews finalization evidence only",
        ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
        ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
        ORO8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS,
        ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPreparedFromOro8x=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssuedFromOro8x=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassedFromOro8x=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecordedFromOro8x=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecorded=true",
        "verifiedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly=true",
        "verifiedOro8xConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly=true",
        "verifiedOro8xConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly=true",
        "verifiedOro8xConfirmedOro8uWasCompletionRecordReviewBoundaryOnly=true",
        "verifiedOro8xConfirmedOro8tWasCompletionRecordBoundaryOnly=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewed=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApplied=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForRuntime=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRuntimeApplied=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8Y Current",
        "actual live execution final execution completion record review approval record finalization review boundary only",
        ORO8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8Y current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review boundary",
        "actual live execution final execution completion record review approval record finalization review boundary only",
        "`smoke:oro-8y` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8Y Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Boundary Coverage",
        "ORO-8Y actual live execution final execution completion-record-review-approval-record-finalization-review-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8Y].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8Y files must not contain ${marker}.`);
  }
  for (const file of ORO8Y_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryResult",
    "dependsOnOro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary",
    "oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPreparedFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssuedFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassedFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecordedFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatusFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScopeFromOro8x",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScope",
    "verifiedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro8xConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro8xConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro8xConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro8xConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO8Y_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8Y_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPreparedFromOro8x,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssuedFromOro8x,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassedFromOro8x,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecordedFromOro8x,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatusFromOro8x,
    ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScopeFromOro8x,
    ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatus,
    ORO8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScope,
    ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8xConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8xConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8xConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8xConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
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
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8Y happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8Y hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro8xDependencyMissingFixture,
      "missing_oro8x_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_dependency",
    ],
    [
      fixtures.failOro8xFinalizationBoundaryNotPassedFixture,
      "oro8x_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_pass_required",
    ],
    [
      fixtures.failOro8xFinalizationStatusMismatchFixture,
      "invalid_oro8x_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_status",
    ],
    [
      fixtures.failOro8xFinalizationScopeMismatchFixture,
      "invalid_oro8x_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_scope",
    ],
    [
      fixtures.failOro8xNotFinalizationBoundaryOnlyFixture,
      "oro8x_completion_record_review_approval_record_finalization_boundary_only_proof_required",
    ],
    [
      fixtures.failOro8xCannotProveOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
      "oro8x_must_confirm_oro8w_completion_record_review_approval_record_boundary_only",
    ],
    [
      fixtures.failOro8xCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
      "oro8x_must_confirm_oro8v_completion_record_review_approval_boundary_only",
    ],
    [
      fixtures.failOro8xCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
      "oro8x_must_confirm_oro8u_completion_record_review_boundary_only",
    ],
    [
      fixtures.failOro8xCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
      "oro8x_must_confirm_oro8t_completion_record_boundary_only",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_preparation_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_issuance_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_pass_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_record_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_status",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordFinalizationReviewScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "approval_record_finalization_review_requires_no_actual_execution_route_or_alias_proof",
    ],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro8y"],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8y",
    ],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro8y"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro8y"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro8y"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro8y"],
    [fixtures.failRouteEnablementAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro8y"],
    [fixtures.failPublicAliasAttemptedFixture, "publicAliasAllowed_not_allowed_in_oro8y"],
    [
      fixtures.failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewed_not_allowed_in_oro8y",
    ],
    [
      fixtures.failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution_not_allowed_in_oro8y",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "approval_record_finalization_review_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "approval_record_finalization_review_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "approval_record_finalization_review_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failFinalizationReviewApprovalBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_required_after_oro8y",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro8y"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixtures().map(
      evaluateOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary
    );
  assert.strictEqual(allReports.length, 38, "fixture set must cover ORO-8Y cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8Y live traffic actual external call execution actual live execution final execution completion record review approval record finalization review boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8Y live traffic actual external call execution actual live execution final execution completion record review approval record finalization review boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
