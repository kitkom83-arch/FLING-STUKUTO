"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary");
const fixtures = require("../game-provider-mock/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixtures");
const {
  ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
  ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
} = require("../game-provider-mock/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary");

const {
  CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
  ORO8W_PHASE,
  PASS,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySummary,
  evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  runOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8V =
  "docs/ORO_8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY.md";
const DOC_8W =
  "docs/ORO_8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8wSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-8w";
const DETAIL_SCRIPT =
  "smoke:oro-8w-actual-live-execution-final-execution-completion-record-review-approval-record-boundary";
const ORO8W_SCAN_FILES = Object.freeze([DOC_8W, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
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
  const doc8v = readRequired(DOC_8V);
  for (const marker of [
    "ORO-8W follows ORO-8V as the separate actual live execution final execution completion record review approval record boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary = true",
  ]) {
    assert(doc8v.includes(marker), `${DOC_8V} missing marker ${marker}.`);
  }

  const doc8w = readRequired(DOC_8W);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8V",
    "## Review approval record",
    "## Approval-record-boundary-only",
    "## ORO-8V, ORO-8U, and ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8W records static/mock actual live execution final execution completion record review approval record evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only",
    "dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary = true",
    "oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v = completion_record_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v = actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus = completion_record_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope = actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only",
    "verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly = true",
    "verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly = true",
    "verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForRuntime = false",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForLiveExecution = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired = true",
  ]) {
    assert(doc8w.includes(marker), `${DOC_8W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8w",
    "oro-8w",
    "ORO_8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY.md",
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
        "## ORO-8W Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Boundary Mapping",
        "ORO-8W records review approval evidence only",
        ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
        ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded=true",
        "verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly=true",
        "verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly=true",
        "verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForRuntime=false",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForLiveExecution=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8W Current",
        "actual live execution final execution completion record review approval record boundary only",
        ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8W current/live traffic actual external call execution actual live execution final execution completion record review approval record boundary",
        "actual live execution final execution completion record review approval record boundary only",
        "`smoke:oro-8w` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8W Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Boundary Coverage",
        "ORO-8W actual live execution final execution completion-record-review-approval-record-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8W].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8W files must not contain ${marker}.`);
  }
  for (const file of ORO8W_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryResult",
    "dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary",
    "oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope",
    "verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8W_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v,
    ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v,
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus,
    ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope,
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
  );
  assert.strictEqual(
    summary.verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    true
  );
  assert.strictEqual(
    summary.verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
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
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8W happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8W hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro8vDependencyMissingFixture,
      "missing_oro8v_actual_live_execution_final_execution_completion_record_review_approval_boundary_dependency",
    ],
    [
      fixtures.failOro8vCompletionRecordReviewApprovalBoundaryNotPassedFixture,
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_boundary_pass_required",
    ],
    [
      fixtures.failOro8vCompletionRecordReviewApprovalStatusMismatchFixture,
      "invalid_oro8v_actual_live_execution_final_execution_completion_record_review_approval_status",
    ],
    [
      fixtures.failOro8vCompletionRecordReviewApprovalScopeMismatchFixture,
      "invalid_oro8v_actual_live_execution_final_execution_completion_record_review_approval_scope",
    ],
    [
      fixtures.failOro8vNotCompletionRecordReviewApprovalBoundaryOnlyFixture,
      "oro8v_completion_record_review_approval_boundary_only_proof_required",
    ],
    [
      fixtures.failOro8vCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
      "oro8v_must_confirm_oro8u_completion_record_review_boundary_only",
    ],
    [
      fixtures.failOro8vCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
      "oro8v_must_confirm_oro8t_completion_record_boundary_only",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_preparation_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_issuance_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_pass_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_status",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalRecordScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "completion_record_review_approval_record_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failRuntimeActivationAttemptedFixture,
      "completion_record_review_approval_record_requires_no_runtime_proof",
    ],
    [
      fixtures.failRuntimeEnablementAttemptedFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8w",
    ],
    [
      fixtures.failRuntimeAuthorizationAttemptedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8w",
    ],
    [
      fixtures.failExternalNetworkAttemptedFixture,
      "externalNetworkAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failWalletMutationAttemptedFixture,
      "walletMutationAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failLedgerMutationAttemptedFixture,
      "ledgerMutationAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failPrismaWriteAttemptedFixture,
      "prismaWriteAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failDbTransactionAttemptedFixture,
      "dbTransactionAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failRouteEnablementAttemptedFixture,
      "routeEnablementAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failExpressMountAttemptedFixture,
      "expressMountAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failPublicAliasAttemptedFixture,
      "publicAliasAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failApiBalanceAliasAttemptedFixture,
      "apiBalanceAliasAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failApiTransactionAliasAttemptedFixture,
      "apiTransactionAliasAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failApiOroplayBalanceRouteAttemptedFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failApiOroplayTransactionRouteAttemptedFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8w",
    ],
    [
      fixtures.failApprovalRecordRuntimeApplicationAttemptedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied_not_allowed_in_oro8w",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "completion_record_review_approval_record_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "completion_record_review_approval_record_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "completion_record_review_approval_record_requires_no_actual_execution_route_or_alias_proof",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro8w"],
    [
      fixtures.failApprovalRecordFinalizationBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w",
    ],
    [
      fixtures.failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w",
    ],
    [
      fixtures.failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixtures().map(
      evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary
    );
  assert.strictEqual(allReports.length, 41, "fixture set must cover ORO-8W cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8W live traffic actual external call execution actual live execution final execution completion record review approval record boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8W live traffic actual external call execution actual live execution final execution completion record review approval record boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
