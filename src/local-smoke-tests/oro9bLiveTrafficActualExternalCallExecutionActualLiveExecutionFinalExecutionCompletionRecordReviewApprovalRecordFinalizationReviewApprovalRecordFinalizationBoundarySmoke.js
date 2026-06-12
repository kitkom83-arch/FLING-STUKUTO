"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");
const {
  ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
} = require("../game-provider-mock/oro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const {
  CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  ORO9B_PHASE,
  PASS,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
  evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9A =
  "docs/ORO_9A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9B =
  "docs/ORO_9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9bSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9b";
const DETAIL_SCRIPT =
  "smoke:oro-9b-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-approval-record-finalization-boundary";
const ORO9B_SCAN_FILES = Object.freeze([DOC_9B, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
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
  const doc9a = readRequired(DOC_9A);
  for (const marker of [
    "ORO-9B follows ORO-9A as the separate actual live execution final execution completion record review approval record finalization review approval record finalization boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary = true",
  ]) {
    assert(doc9a.includes(marker), `${DOC_9A} missing marker ${marker}.`);
  }

  const doc9b = readRequired(DOC_9B);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-9A",
    "## Finalization review approval record finalization",
    "## Finalization-boundary-only",
    "## ORO-9A through ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-9B records static/mock actual live execution final execution completion record review approval record finalization review approval record finalization evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only",
    "dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary = true",
    "oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a = completion_record_review_approval_record_finalization_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus = completion_record_review_approval_record_finalization_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only",
    "verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeApplied = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired = true",
  ]) {
    assert(doc9b.includes(marker), `${DOC_9B} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro9b",
    "ORO_9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md",
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
        "## ORO-9B Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping",
        "ORO-9B finalizes finalization review approval record evidence only",
        ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
        ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
        ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
        ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationApplied=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeApplied=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9B Current",
        "actual live execution final execution completion record review approval record finalization review approval record finalization boundary only",
        ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9B current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization boundary",
        "actual live execution final execution completion record review approval record finalization review approval record finalization boundary only",
        "`smoke:oro-9a` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9B Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage",
        "ORO-9B actual live execution final execution completion-record-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9B].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9B files must not contain ${marker}.`);
  }
  for (const file of ORO9B_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult",
    "dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary",
    "oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
    "verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO9B_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    true
  );
  assert.strictEqual(
    summary.oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a,
    ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a,
    ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus,
    ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope,
    ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
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
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired,
    true
  );
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired,
    true
  );
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9B happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9B hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro9aDependencyMissingFixture,
      "missing_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_dependency",
    ],
    [
      fixtures.failOro9aFinalizationReviewApprovalRecordBoundaryNotPassedFixture,
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_pass_required",
    ],
    [
      fixtures.failOro9aFinalizationReviewApprovalRecordStatusMismatchFixture,
      "invalid_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_status",
    ],
    [
      fixtures.failOro9aFinalizationReviewApprovalRecordScopeMismatchFixture,
      "invalid_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_scope",
    ],
    [
      fixtures.failOro9aNotFinalizationReviewApprovalRecordBoundaryOnlyFixture,
      "oro9a_completion_record_review_approval_record_finalization_review_approval_record_boundary_only_proof_required",
    ],
    [
      fixtures.failFinalizationNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_preparation_required",
    ],
    [
      fixtures.failFinalizationNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_issuance_required",
    ],
    [
      fixtures.failFinalizationNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_pass_required",
    ],
    [
      fixtures.failFinalizationNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_record_required",
    ],
    [
      fixtures.failFinalizationStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_status",
    ],
    [
      fixtures.failFinalizationScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9b",
    ],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9b"],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro9b",
    ],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9b"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9b"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9b"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro9b"],
    [fixtures.failRouteEnablementAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9b"],
    [fixtures.failPublicAliasAttemptedFixture, "publicAliasAllowed_not_allowed_in_oro9b"],
    [
      fixtures.failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationApplied_not_allowed_in_oro9b",
    ],
    [
      fixtures.failApprovalRecordFinalizationAcceptedForLiveExecutionFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution_not_allowed_in_oro9b",
    ],
    [
      fixtures.failActualExecutionAuthorizationAttemptedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro9b",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "finalization_review_approval_record_finalization_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "finalization_review_approval_record_finalization_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "finalization_review_approval_record_finalization_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failNextFinalizationReviewBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_required_after_oro9b",
    ],
    [
      fixtures.failSeparateFinalizationRequirementMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_required_after_oro9b",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro9b"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures().map(
      evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-9B cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9B live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9B live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
