"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixtures");
const {
  ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
  ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
} = require("../game-provider-mock/oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary");

const {
  CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
  ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS,
  ORO8V_PHASE,
  PASS,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySummary,
  evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  runOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8U =
  "docs/ORO_8U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_BOUNDARY.md";
const DOC_8V =
  "docs/ORO_8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8vSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-8v";
const DETAIL_SCRIPT =
  "smoke:oro-8v-actual-live-execution-final-execution-completion-record-review-approval-boundary";
const ORO8V_SCAN_FILES = Object.freeze([DOC_8V, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
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
  const doc8u = readRequired(DOC_8U);
  for (const marker of [
    "ORO-8V follows ORO-8U as the separate actual live execution final execution completion record review approval boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary = true",
  ]) {
    assert(doc8u.includes(marker), `${DOC_8U} missing marker ${marker}.`);
  }

  const doc8v = readRequired(DOC_8V);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8U",
    "## Completion record review approval",
    "## Completion-record-review-approval-boundary-only",
    "## ORO-8U and ORO-8T proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8V creates static/mock actual live execution final execution completion record review approval evidence",
    "actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary = true",
    "oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u = completion_record_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u = actual_live_execution_final_execution_completion_record_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus = completion_record_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope = actual_live_execution_final_execution_completion_record_review_approval_boundary_only",
    "verifiedOro8uWasCompletionRecordReviewBoundaryOnly = true",
    "verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApproved = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired = true",
  ]) {
    assert(doc8v.includes(marker), `${DOC_8V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8v",
    "oro-8v",
    "ORO_8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY.md",
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
        "## ORO-8V Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Boundary Mapping",
        "ORO-8V approves review evidence only",
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
        ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
        ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS,
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded=true",
        "verifiedOro8uWasCompletionRecordReviewBoundaryOnly=true",
        "verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApproved=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8V Current",
        "actual live execution final execution completion record review approval boundary only",
        ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8V current/live traffic actual external call execution actual live execution final execution completion record review approval boundary",
        "actual live execution final execution completion record review approval boundary only",
        "`smoke:oro-8v` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8V Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Boundary Coverage",
        "ORO-8V actual live execution final execution completion-record-review-approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8V].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8V files must not contain ${marker}.`);
  }
  for (const file of ORO8V_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryResult",
    "dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary",
    "oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope",
    "verifiedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
    ...CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary",
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
  assert.strictEqual(summary.phase, ORO8V_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u,
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u,
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus,
    ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope,
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8uWasCompletionRecordReviewBoundaryOnly, true);
  assert.strictEqual(
    summary.verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8V happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8V hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof helper.ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS,
    "string"
  );
  assert.strictEqual(
    typeof buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      fixtures.failOro8uDependencyMissingFixture,
      "missing_oro8u_actual_live_execution_final_execution_completion_record_review_boundary_dependency",
    ],
    [
      fixtures.failOro8uCompletionRecordReviewBoundaryNotPassedFixture,
      "oro8u_actual_live_execution_final_execution_completion_record_review_boundary_pass_required",
    ],
    [
      fixtures.failOro8uCompletionRecordReviewStatusMismatchFixture,
      "invalid_oro8u_actual_live_execution_final_execution_completion_record_review_status",
    ],
    [
      fixtures.failOro8uCompletionRecordReviewScopeMismatchFixture,
      "invalid_oro8u_actual_live_execution_final_execution_completion_record_review_scope",
    ],
    [
      fixtures.failOro8uNotCompletionRecordReviewBoundaryOnlyFixture,
      "oro8u_completion_record_review_boundary_only_proof_required",
    ],
    [
      fixtures.failOro8uCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
      "oro8u_must_confirm_oro8t_completion_record_boundary_only",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_preparation_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_issuance_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_pass_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_review_approval_record_required",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_status",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_scope",
    ],
    [
      fixtures.failActualLiveExecutionAttemptedFixture,
      "completion_record_review_approval_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      fixtures.failRuntimeActivationAttemptedFixture,
      "completion_record_review_approval_requires_no_runtime_proof",
    ],
    [
      fixtures.failRuntimeEnablementAttemptedFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8v",
    ],
    [
      fixtures.failRuntimeAuthorizationAttemptedFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8v",
    ],
    [
      fixtures.failExternalNetworkAttemptedFixture,
      "externalNetworkAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failWalletMutationAttemptedFixture,
      "walletMutationAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failLedgerMutationAttemptedFixture,
      "ledgerMutationAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failPrismaWriteAttemptedFixture,
      "prismaWriteAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failDbTransactionAttemptedFixture,
      "dbTransactionAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failRouteEnablementAttemptedFixture,
      "routeEnablementAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failExpressMountAttemptedFixture,
      "expressMountAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failPublicAliasAttemptedFixture,
      "publicAliasAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failApiBalanceAliasAttemptedFixture,
      "apiBalanceAliasAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failApiTransactionAliasAttemptedFixture,
      "apiTransactionAliasAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failApiOroplayBalanceRouteAttemptedFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failApiOroplayTransactionRouteAttemptedFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8v",
    ],
    [
      fixtures.failCompletionRecordReviewApprovalMarksActualApprovalFixture,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewApproved_not_allowed_in_oro8v",
    ],
    [
      fixtures.failCannotProveNoMutationOrExternalNetworkFixture,
      "completion_record_review_approval_requires_no_mutation_and_no_external_network_proof",
    ],
    [
      fixtures.failCannotProveNoRuntimeFixture,
      "completion_record_review_approval_requires_no_runtime_proof",
    ],
    [
      fixtures.failCannotProveNoRouteOrAliasFixture,
      "completion_record_review_approval_requires_no_actual_execution_route_or_alias_proof",
    ],
    [fixtures.failSecretShapedValueLeakedFixture, "sensitive_output_not_allowed_in_oro8v"],
    [
      fixtures.failApprovalRecordBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_required_after_oro8v",
    ],
    [
      fixtures.failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_required_after_oro8v",
    ],
    [
      fixtures.failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_required_after_oro8v",
    ],
    [
      fixtures.failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_required_after_oro8v",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixtures().map(
      evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary
    );
  assert.strictEqual(allReports.length, 39, "fixture set must cover ORO-8V cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8V live traffic actual external call execution actual live execution final execution completion record review approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8V live traffic actual external call execution actual live execution final execution completion record review approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
