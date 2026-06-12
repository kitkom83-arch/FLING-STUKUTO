"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");
const {
  ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
  ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
} = require("../game-provider-mock/oro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const {
  CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
  ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
  ORO9D_PHASE,
  PASS,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
  evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9B =
  "docs/ORO_9C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_9C =
  "docs/ORO_9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9dSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-9d";
const DETAIL_SCRIPT =
  "smoke:oro-9d-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary";
const ORO9D_SCAN_FILES = Object.freeze([DOC_9C, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
]);
const ORO9C_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReview";
const ORO9D_PREFIX = `${ORO9C_PREFIX}Approval`;

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
  const doc9b = readRequired(DOC_9B);
  for (const marker of [
    "ORO-9D follows ORO-9C as the separate actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary = true",
  ]) {
    assert(doc9b.includes(marker), `${DOC_9B} missing marker ${marker}.`);
  }

  const doc9c = readRequired(DOC_9C);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-9C",
    "## Finalization review approval",
    "## Finalization-review-approval-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-9D records static/mock actual live execution final execution completion record review approval record finalization review approval record finalization review approval evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only",
    "dependsOnOro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary = true",
    "oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPreparedFromOro9c = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssuedFromOro9c = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassedFromOro9c = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecordedFromOro9c = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9c = completion_record_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9c = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus = completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope = actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApproved = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired = true",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9c.includes(marker), `${DOC_9C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro9d",
    "ORO_9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md",
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
        "## ORO-9D Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Mapping",
        "ORO-9D records finalization review approval evidence only",
        ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
        ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
        ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
        ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPreparedFromOro9c=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApproved=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9D Current",
        "actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary only",
        ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9D current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary",
        "actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary only",
        "`smoke:oro-9c` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9D Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Coverage",
        "ORO-9D actual live execution final execution completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9C].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9D files must not contain ${marker}.`);
  }
  for (const file of ORO9D_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult",
    "dependsOnOro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary",
    "oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed",
    `${ORO9C_PREFIX}PreparedFromOro9c`,
    `${ORO9C_PREFIX}IssuedFromOro9c`,
    `${ORO9C_PREFIX}PassedFromOro9c`,
    `${ORO9C_PREFIX}RecordedFromOro9c`,
    `${ORO9C_PREFIX}StatusFromOro9c`,
    `${ORO9C_PREFIX}ScopeFromOro9c`,
    `${ORO9D_PREFIX}Prepared`,
    `${ORO9D_PREFIX}Issued`,
    `${ORO9D_PREFIX}Passed`,
    `${ORO9D_PREFIX}Recorded`,
    `${ORO9D_PREFIX}Status`,
    `${ORO9D_PREFIX}Scope`,
    "verifiedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
    "verifiedOro9cConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9cConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9cConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9cConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9cConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9cConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9cConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9cConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO9D_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
    true
  );
  assert.strictEqual(
    summary.oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed,
    true
  );
  assert.strictEqual(summary[`${ORO9C_PREFIX}PreparedFromOro9c`], true);
  assert.strictEqual(summary[`${ORO9C_PREFIX}IssuedFromOro9c`], true);
  assert.strictEqual(summary[`${ORO9C_PREFIX}PassedFromOro9c`], true);
  assert.strictEqual(summary[`${ORO9C_PREFIX}RecordedFromOro9c`], true);
  assert.strictEqual(
    summary[`${ORO9C_PREFIX}StatusFromOro9c`],
    ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
  );
  assert.strictEqual(
    summary[`${ORO9C_PREFIX}ScopeFromOro9c`],
    ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
  );
  assert.strictEqual(summary[`${ORO9D_PREFIX}Prepared`], true);
  assert.strictEqual(summary[`${ORO9D_PREFIX}Issued`], true);
  assert.strictEqual(summary[`${ORO9D_PREFIX}Passed`], true);
  assert.strictEqual(summary[`${ORO9D_PREFIX}Recorded`], true);
  assert.strictEqual(
    summary[`${ORO9D_PREFIX}Status`],
    ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary[`${ORO9D_PREFIX}Scope`],
    ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9cConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro9cConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly,
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
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
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired,
    true
  );
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9D happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9D hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro9cDependencyMissingFixture,
      "missing_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency",
    ],
    [
      fixtures.failOro9cFinalizationBoundaryNotPassedFixture,
      "oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_pass_required",
    ],
    [
      fixtures.failOro9cFinalizationStatusMismatchFixture,
      "invalid_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_status",
    ],
    [
      fixtures.failOro9cFinalizationScopeMismatchFixture,
      "invalid_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_scope",
    ],
    [
      fixtures.failOro9cNotFinalizationBoundaryOnlyFixture,
      "oro9c_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only_proof_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_prepared_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_issued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_passed_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_recorded_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_status",
    ],
    [
      fixtures.failFinalizationReviewApprovalScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9d",
    ],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9d"],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro9d",
    ],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9d"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9d"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9d"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro9d"],
    [fixtures.failRouteEnablementAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9d"],
    [fixtures.failPublicAliasAttemptedFixture, "publicAliasAllowed_not_allowed_in_oro9d"],
    [
      fixtures.failApprovalRecordFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalApplied_not_allowed_in_oro9d",
    ],
    [
      fixtures.failApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution_not_allowed_in_oro9d",
    ],
    [
      fixtures.failActualExecutionAuthorizationAttemptedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro9d",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "finalization_review_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "finalization_review_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "finalization_review_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failNextFinalizationReviewApprovalRecordBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9d",
    ],
    [
      fixtures.failSeparateFinalizationReviewApprovalRequirementMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9d",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro9d"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures().map(
      evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-9D cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9D live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9D live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
