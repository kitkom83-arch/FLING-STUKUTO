"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");
const {
  ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
  ORO_8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
} = require("../game-provider-mock/oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary");

const {
  CLOSED_ORO8Z_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
  ORO8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
  ORO8Z_PHASE,
  PASS,
  buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
  evaluateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8Y =
  "docs/ORO_8Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_8Z =
  "docs/ORO_8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8zSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-8z";
const DETAIL_SCRIPT =
  "smoke:oro-8z-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-approval-boundary";
const ORO8Z_SCAN_FILES = Object.freeze([DOC_8Z, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8Z_ACTUAL_EXECUTION_FLAGS,
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
  const doc8y = readRequired(DOC_8Y);
  for (const marker of [
    "ORO-8Z follows ORO-8Y as the separate actual live execution final execution completion record review approval record finalization review approval boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary = true",
  ]) {
    assert(doc8y.includes(marker), `${DOC_8Y} missing marker ${marker}.`);
  }

  const doc8z = readRequired(DOC_8Z);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8Y",
    "## Finalization review approval",
    "## Finalization-review-approval-boundary-only",
    "## ORO-8Y through ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8Z records static/mock actual live execution final execution completion record review approval record finalization review approval evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_only",
    "dependsOnOro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary = true",
    "oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPreparedFromOro8y = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssuedFromOro8y = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassedFromOro8y = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecordedFromOro8y = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatusFromOro8y = completion_record_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScopeFromOro8y = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus = completion_record_review_approval_record_finalization_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_only",
    "verifiedOro8yWasCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryOnly = true",
    "verifiedOro8yConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly = true",
    "verifiedOro8yConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly = true",
    "verifiedOro8yConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly = true",
    "verifiedOro8yConfirmedOro8uWasCompletionRecordReviewBoundaryOnly = true",
    "verifiedOro8yConfirmedOro8tWasCompletionRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApproved = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired = true",
  ]) {
    assert(doc8z.includes(marker), `${DOC_8Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8z",
    "oro-8z",
    "ORO_8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md",
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
        "## ORO-8Z Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Boundary Mapping",
        "ORO-8Z approves finalization review evidence only",
        ORO_8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
        ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
        ORO8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
        ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPreparedFromOro8y=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApproved=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalApplied=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8Z Current",
        "actual live execution final execution completion record review approval record finalization review approval boundary only",
        ORO8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8Z current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval boundary",
        "actual live execution final execution completion record review approval record finalization review approval boundary only",
        "`smoke:oro-8z` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8Z Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Boundary Coverage",
        "ORO-8Z actual live execution final execution completion-record-review-approval-record-finalization-review-approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8Z].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8Z files must not contain ${marker}.`);
  }
  for (const file of ORO8Z_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryResult",
    "dependsOnOro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary",
    "oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPreparedFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssuedFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassedFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecordedFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatusFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScopeFromOro8y",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope",
    "verifiedOro8yWasCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryOnly",
    "verifiedOro8yConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro8yConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro8yConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro8yConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro8yConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO8Z_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8Z_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPreparedFromOro8y,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssuedFromOro8y,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassedFromOro8y,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecordedFromOro8y,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatusFromOro8y,
    ORO_8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScopeFromOro8y,
    ORO8Y_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus,
    ORO8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope,
    ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro8yWasCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8yConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8yConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8yConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8yConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro8yConfirmedOro8tWasCompletionRecordBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
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
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8Z happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8Z hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO8Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro8yDependencyMissingFixture,
      "missing_oro8y_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_dependency",
    ],
    [
      fixtures.failOro8yFinalizationReviewBoundaryNotPassedFixture,
      "oro8y_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_pass_required",
    ],
    [
      fixtures.failOro8yFinalizationReviewStatusMismatchFixture,
      "invalid_oro8y_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_status",
    ],
    [
      fixtures.failOro8yFinalizationReviewScopeMismatchFixture,
      "invalid_oro8y_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_scope",
    ],
    [
      fixtures.failOro8yNotFinalizationReviewBoundaryOnlyFixture,
      "oro8y_completion_record_review_approval_record_finalization_review_boundary_only_proof_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_preparation_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_issuance_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_pass_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_status",
    ],
    [
      fixtures.failFinalizationReviewApprovalScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8z",
    ],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro8z"],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8z",
    ],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro8z"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro8z"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro8z"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro8z"],
    [fixtures.failRouteEnablementAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro8z"],
    [fixtures.failPublicAliasAttemptedFixture, "publicAliasAllowed_not_allowed_in_oro8z"],
    [
      fixtures.failFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApproved_not_allowed_in_oro8z",
    ],
    [
      fixtures.failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution_not_allowed_in_oro8z",
    ],
    [
      fixtures.failActualExecutionAuthorizationAttemptedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8z",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "finalization_review_approval_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "finalization_review_approval_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "finalization_review_approval_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failNextApprovalRecordBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_required_after_oro8z",
    ],
    [
      fixtures.failSeparateFinalizationReviewApprovalRequiredMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_required_after_oro8z",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro8z"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures().map(
      evaluateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-8Z cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8Z live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8Z live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
