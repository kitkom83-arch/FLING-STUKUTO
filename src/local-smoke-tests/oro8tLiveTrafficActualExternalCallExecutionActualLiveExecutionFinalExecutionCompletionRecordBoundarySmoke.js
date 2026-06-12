"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary");
const fixtures = require("../game-provider-mock/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures");
const {
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
} = require("../game-provider-mock/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary");

const {
  CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ORO8T_PHASE,
  ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
  PASS,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySummary,
  evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  runOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
} = helper;

const {
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRouteOrAliasFixture,
  failCannotProveNoRuntimeFixture,
  failCompletionRecordActivatesRuntimeFixture,
  failCompletionRecordApprovesRuntimeExecutionFixture,
  failCompletionRecordAuthorizesRuntimeExternalExecutionFixture,
  failCompletionRecordEnablesRuntimeFixture,
  failCompletionRecordExecutesLiveCallFixture,
  failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionClosedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture,
  failCompletionRecordNotIssuedFixture,
  failCompletionRecordNotPassedFixture,
  failCompletionRecordNotPreparedFixture,
  failCompletionRecordNotRecordedFixture,
  failCompletionRecordReviewBoundaryMissingFixture,
  failCompletionRecordScopeMismatchFixture,
  failCompletionRecordStatusMismatchFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8sAuditBoundaryNotPassedFixture,
  failOro8sAuditNotIssuedFixture,
  failOro8sAuditNotPreparedFixture,
  failOro8sAuditNotRecordedFixture,
  failOro8sAuditScopeMismatchFixture,
  failOro8sAuditStatusMismatchFixture,
  failOro8sCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture,
  failOro8sDependencyMissingFixture,
  failOro8sNotAuditBoundaryOnlyFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8S =
  "docs/ORO_8S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_BOUNDARY.md";
const DOC_8T =
  "docs/ORO_8T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8tSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-8t";
const DETAIL_SCRIPT =
  "smoke:oro-8t-actual-live-execution-final-execution-completion-record-boundary";
const ORO8T_SCAN_FILES = Object.freeze([DOC_8S, DOC_8T, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
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
  const doc8s = readRequired(DOC_8S);
  for (const marker of [
    "ORO-8T follows ORO-8S as the separate actual live execution final execution completion record boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary = true",
    ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
    ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ]) {
    assert(doc8s.includes(marker), `${DOC_8S} missing marker ${marker}.`);
  }

  const doc8t = readRequired(DOC_8T);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8S",
    "## Completion record",
    "## Completion-record-boundary-only",
    "## ORO-8S, ORO-8R, ORO-8Q, ORO-8P, and ORO-8O proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8T creates static/mock actual live execution final execution completion",
    "actual_live_execution_final_execution_completion_record_boundary_only",
    "dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary = true",
    "oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionAuditPreparedFromOro8s = true",
    "actualLiveExecutionFinalExecutionAuditIssuedFromOro8s = true",
    "actualLiveExecutionFinalExecutionAuditPassedFromOro8s = true",
    "actualLiveExecutionFinalExecutionAuditRecordedFromOro8s = true",
    "actualLiveExecutionFinalExecutionAuditStatusFromOro8s = audited_for_separate_actual_live_execution_final_execution_completion_record_boundary_only",
    "actualLiveExecutionFinalExecutionAuditScopeFromOro8s = actual_live_execution_final_execution_audit_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordPrepared = true",
    "actualLiveExecutionFinalExecutionCompletionRecordIssued = true",
    "actualLiveExecutionFinalExecutionCompletionRecordPassed = true",
    "actualLiveExecutionFinalExecutionCompletionRecordRecorded = true",
    "actualLiveExecutionFinalExecutionCompletionRecordStatus = completion_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_boundary_only",
    "actualLiveExecutionFinalExecutionCompletionRecordScope = actual_live_execution_final_execution_completion_record_boundary_only",
    "verifiedOro8sWasAuditBoundaryOnly = true",
    "verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly = true",
    "verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly = true",
    "verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly = true",
    "verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly = true",
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
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordReviewRequired = true",
  ]) {
    assert(doc8t.includes(marker), `${DOC_8T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8t",
    "oro-8t",
    "ORO_8T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_BOUNDARY.md",
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
        "## ORO-8T Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Boundary Mapping",
        "ORO-8T records actual live execution final execution completion record only",
        ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
        ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
        ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
        "actualLiveExecutionFinalExecutionAuditPreparedFromOro8s=true",
        "actualLiveExecutionFinalExecutionAuditIssuedFromOro8s=true",
        "actualLiveExecutionFinalExecutionAuditPassedFromOro8s=true",
        "actualLiveExecutionFinalExecutionAuditRecordedFromOro8s=true",
        "actualLiveExecutionFinalExecutionCompletionRecordPrepared=true",
        "actualLiveExecutionFinalExecutionCompletionRecordIssued=true",
        "actualLiveExecutionFinalExecutionCompletionRecordPassed=true",
        "actualLiveExecutionFinalExecutionCompletionRecordRecorded=true",
        "verifiedOro8sWasAuditBoundaryOnly=true",
        "verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly=true",
        "verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly=true",
        "verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly=true",
        "verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "actualLiveExecutionFinalExecutionAudited=false",
        "actualLiveExecutionFinalExecutionCompletionRecorded=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8T Current",
        "actual live execution final execution completion record boundary only",
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8T current/live traffic actual external call execution actual live execution final execution completion record boundary",
        "actual live execution final execution completion record boundary only",
        "`smoke:oro-8t` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8T Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Boundary Coverage",
        "ORO-8T actual live execution final execution completion-record-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8S, DOC_8T].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8T files must not contain ${marker}.`);
  }
  for (const file of ORO8T_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryResult",
    "dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary",
    "oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed",
    "actualLiveExecutionFinalExecutionAuditPreparedFromOro8s",
    "actualLiveExecutionFinalExecutionAuditIssuedFromOro8s",
    "actualLiveExecutionFinalExecutionAuditPassedFromOro8s",
    "actualLiveExecutionFinalExecutionAuditRecordedFromOro8s",
    "actualLiveExecutionFinalExecutionAuditStatusFromOro8s",
    "actualLiveExecutionFinalExecutionAuditScopeFromOro8s",
    "actualLiveExecutionFinalExecutionCompletionRecordPrepared",
    "actualLiveExecutionFinalExecutionCompletionRecordIssued",
    "actualLiveExecutionFinalExecutionCompletionRecordPassed",
    "actualLiveExecutionFinalExecutionCompletionRecordRecorded",
    "actualLiveExecutionFinalExecutionCompletionRecordStatus",
    "actualLiveExecutionFinalExecutionCompletionRecordScope",
    "verifiedOro8sWasAuditBoundaryOnly",
    "verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly",
    "verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly",
    "verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
    "verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly",
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
    ...CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordReviewRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8T_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionAuditPreparedFromOro8s,
    true
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditIssuedFromOro8s, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditPassedFromOro8s, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditRecordedFromOro8s, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionAuditStatusFromOro8s,
    ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionAuditScopeFromOro8s,
    ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordPrepared,
    true
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCompletionRecordIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCompletionRecordPassed, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordStatus,
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCompletionRecordScope,
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8sWasAuditBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly, true);
  assert.strictEqual(
    summary.verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordReviewRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8T happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8T hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
      happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8sDependencyMissingFixture,
      "missing_oro8s_actual_live_execution_final_execution_audit_boundary_dependency",
    ],
    [
      failOro8sAuditNotPreparedFixture,
      "oro8s_actual_live_execution_final_execution_audit_preparation_required",
    ],
    [
      failOro8sAuditNotIssuedFixture,
      "oro8s_actual_live_execution_final_execution_audit_issuance_required",
    ],
    [
      failOro8sAuditBoundaryNotPassedFixture,
      "oro8s_actual_live_execution_final_execution_audit_boundary_pass_required",
    ],
    [
      failOro8sAuditNotRecordedFixture,
      "oro8s_actual_live_execution_final_execution_audit_record_required",
    ],
    [
      failOro8sAuditStatusMismatchFixture,
      "invalid_oro8s_actual_live_execution_final_execution_audit_status",
    ],
    [
      failOro8sAuditScopeMismatchFixture,
      "invalid_oro8s_actual_live_execution_final_execution_audit_scope",
    ],
    [
      failOro8sCannotProveNoActualLiveExecutionOccurredFixture,
      "completion_record_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
      "oro8s_must_confirm_oro8o_mock_execution_boundary_only",
    ],
    [failOro8sNotAuditBoundaryOnlyFixture, "oro8s_audit_boundary_only_proof_required"],
    [
      failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture,
      "oro8s_must_confirm_oro8r_archive_boundary_only",
    ],
    [
      failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
      "oro8s_must_confirm_oro8q_closeout_boundary_only",
    ],
    [
      failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
      "oro8s_must_confirm_oro8p_post_execution_verification_boundary_only",
    ],
    [
      failCompletionRecordNotPreparedFixture,
      "actual_live_execution_final_execution_completion_record_preparation_required",
    ],
    [
      failCompletionRecordNotIssuedFixture,
      "actual_live_execution_final_execution_completion_record_issuance_required",
    ],
    [
      failCompletionRecordNotPassedFixture,
      "actual_live_execution_final_execution_completion_record_pass_required",
    ],
    [
      failCompletionRecordNotRecordedFixture,
      "actual_live_execution_final_execution_completion_record_record_required",
    ],
    [
      failCompletionRecordStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_status",
    ],
    [
      failCompletionRecordScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_completion_record_scope",
    ],
    [
      failCompletionRecordApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture,
      "actualLiveExecutionFinalExecutionExecuted_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordMarksActualLiveFinalExecutionClosedFixture,
      "actualLiveExecutionFinalExecutionClosed_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture,
      "actualLiveExecutionFinalExecutionArchived_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture,
      "actualLiveExecutionFinalExecutionAudited_not_allowed_in_oro8t",
    ],
    [
      failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture,
      "actualLiveExecutionFinalExecutionCompletionRecorded_not_allowed_in_oro8t",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8t"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8t"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8t"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8t"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8t"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8t"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8t"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8t"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8t"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8t"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8t"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8t",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8t",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "completion_record_requires_no_mutation_and_no_external_network_proof",
    ],
    [failCannotProveNoRuntimeFixture, "completion_record_requires_no_runtime_proof"],
    [
      failCannotProveNoRouteOrAliasFixture,
      "completion_record_requires_no_actual_execution_route_or_alias_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8t"],
    [
      failCompletionRecordReviewBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_boundary_required_after_oro8t",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_boundary_required_after_oro8t",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_boundary_required_after_oro8t",
    ],
    [
      failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_review_boundary_required_after_oro8t",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures().map(
      evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary
    );
  assert.strictEqual(allReports.length, 51, "fixture set must cover ORO-8T cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8T live traffic actual external call execution actual live execution final execution completion record boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8T live traffic actual external call execution actual live execution final execution completion record boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
