"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary");
const fixtures = require("../game-provider-mock/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures");
const {
  ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
  ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
} = require("../game-provider-mock/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary");

const {
  CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO8Q_PHASE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
  PASS,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySummary,
  evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  runOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
} = helper;

const {
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failArchiveBoundaryMissingFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCloseoutActivatesRuntimeFixture,
  failCloseoutApprovesRuntimeExecutionFixture,
  failCloseoutAuthorizesRuntimeExternalExecutionFixture,
  failCloseoutEnablesRuntimeFixture,
  failCloseoutExecutesLiveCallFixture,
  failCloseoutMarksActualLiveFinalExecutionClosedFixture,
  failCloseoutMarksActualLiveFinalExecutionExecutedFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8pDependencyMissingFixture,
  failOro8pNotPostExecutionVerificationBoundaryOnlyFixture,
  failOro8pPostExecutionVerificationBoundaryNotPassedFixture,
  failOro8pPostExecutionVerificationNotIssuedFixture,
  failOro8pPostExecutionVerificationNotPreparedFixture,
  failOro8pPostExecutionVerificationNotRecordedFixture,
  failOro8pPostExecutionVerificationScopeMismatchFixture,
  failOro8pPostExecutionVerificationStatusMismatchFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionArchiveMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8P =
  "docs/ORO_8P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_BOUNDARY.md";
const DOC_8Q =
  "docs/ORO_8Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8qSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySmoke.js";
const SCRIPT = "smoke:oro-8q";
const DETAIL_SCRIPT =
  "smoke:oro-8q-actual-live-execution-final-execution-closeout-boundary";
const ORO8Q_SCAN_FILES = Object.freeze([DOC_8P, DOC_8Q, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
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
  const doc8p = readRequired(DOC_8P);
  for (const marker of [
    "ORO-8Q follows ORO-8P as the separate actual live execution final execution closeout boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary = true",
    ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
    ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
  ]) {
    assert(doc8p.includes(marker), `${DOC_8P} missing marker ${marker}.`);
  }

  const doc8q = readRequired(DOC_8Q);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8P",
    "## Closeout record",
    "## Closeout-boundary-only",
    "## ORO-8P and ORO-8O proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8Q creates static/mock actual live execution final execution closeout",
    "actual_live_execution_final_execution_closeout_boundary_only",
    "dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary = true",
    "oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p = verified_for_separate_actual_live_execution_final_execution_closeout_boundary_only",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p = actual_live_execution_final_execution_post_execution_verification_boundary_only",
    "actualLiveExecutionFinalExecutionCloseoutPrepared = true",
    "actualLiveExecutionFinalExecutionCloseoutIssued = true",
    "actualLiveExecutionFinalExecutionCloseoutPassed = true",
    "actualLiveExecutionFinalExecutionCloseoutRecorded = true",
    "actualLiveExecutionFinalExecutionCloseoutStatus = closed_for_separate_actual_live_execution_final_execution_archive_boundary_only",
    "actualLiveExecutionFinalExecutionCloseoutScope = actual_live_execution_final_execution_closeout_boundary_only",
    "verifiedOro8pWasPostExecutionVerificationBoundaryOnly = true",
    "verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly = true",
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
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionArchiveRequired = true",
  ]) {
    assert(doc8q.includes(marker), `${DOC_8Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8q",
    "oro-8q",
    "ORO_8Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_BOUNDARY.md",
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
        "## ORO-8Q Live Traffic Actual External Call Execution Actual Live Execution Final Execution Closeout Boundary Mapping",
        "ORO-8Q records actual live execution final execution closeout only",
        ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
        ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
        ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
        ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p=true",
        "actualLiveExecutionFinalExecutionCloseoutPrepared=true",
        "actualLiveExecutionFinalExecutionCloseoutIssued=true",
        "actualLiveExecutionFinalExecutionCloseoutPassed=true",
        "actualLiveExecutionFinalExecutionCloseoutRecorded=true",
        "verifiedOro8pWasPostExecutionVerificationBoundaryOnly=true",
        "verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "actualLiveExecutionFinalExecutionClosed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8Q Current",
        "actual live execution final execution closeout boundary only",
        ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8Q current/live traffic actual external call execution actual live execution final execution closeout boundary",
        "actual live execution final execution closeout boundary only",
        "`smoke:oro-8q` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8Q Live Traffic Actual External Call Execution Actual Live Execution Final Execution Closeout Boundary Coverage",
        "ORO-8Q actual live execution final execution closeout-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8P, DOC_8Q].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8Q files must not contain ${marker}.`);
  }
  for (const file of ORO8Q_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryResult",
    "dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary",
    "oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p",
    "actualLiveExecutionFinalExecutionCloseoutPrepared",
    "actualLiveExecutionFinalExecutionCloseoutIssued",
    "actualLiveExecutionFinalExecutionCloseoutPassed",
    "actualLiveExecutionFinalExecutionCloseoutRecorded",
    "actualLiveExecutionFinalExecutionCloseoutStatus",
    "actualLiveExecutionFinalExecutionCloseoutScope",
    "verifiedOro8pWasPostExecutionVerificationBoundaryOnly",
    "verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly",
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
    ...CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionArchiveRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8Q_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p,
    ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p,
    ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCloseoutPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCloseoutIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCloseoutPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionCloseoutRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutStatus,
    ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutScope,
    ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8pWasPostExecutionVerificationBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalExecutionArchiveRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8Q happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8Q hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
      happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8pDependencyMissingFixture,
      "missing_oro8p_actual_live_execution_final_execution_post_execution_verification_boundary_dependency",
    ],
    [
      failOro8pPostExecutionVerificationNotPreparedFixture,
      "oro8p_actual_live_execution_final_execution_post_execution_verification_preparation_required",
    ],
    [
      failOro8pPostExecutionVerificationNotIssuedFixture,
      "oro8p_actual_live_execution_final_execution_post_execution_verification_issuance_required",
    ],
    [
      failOro8pPostExecutionVerificationBoundaryNotPassedFixture,
      "oro8p_actual_live_execution_final_execution_post_execution_verification_boundary_pass_required",
    ],
    [
      failOro8pPostExecutionVerificationNotRecordedFixture,
      "oro8p_actual_live_execution_final_execution_post_execution_verification_record_required",
    ],
    [
      failOro8pPostExecutionVerificationStatusMismatchFixture,
      "invalid_oro8p_actual_live_execution_final_execution_post_execution_verification_status",
    ],
    [
      failOro8pPostExecutionVerificationScopeMismatchFixture,
      "invalid_oro8p_actual_live_execution_final_execution_post_execution_verification_scope",
    ],
    [
      failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
      "oro8p_must_confirm_oro8o_mock_execution_boundary_only",
    ],
    [
      failOro8pNotPostExecutionVerificationBoundaryOnlyFixture,
      "oro8p_post_execution_verification_boundary_only_proof_required",
    ],
    [
      failCloseoutApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8q",
    ],
    [
      failCloseoutActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8q",
    ],
    [
      failCloseoutEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8q",
    ],
    [
      failCloseoutAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8q",
    ],
    [
      failCloseoutExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8q",
    ],
    [
      failCloseoutMarksActualLiveFinalExecutionExecutedFixture,
      "actualLiveExecutionFinalExecutionExecuted_not_allowed_in_oro8q",
    ],
    [
      failCloseoutMarksActualLiveFinalExecutionClosedFixture,
      "actualLiveExecutionFinalExecutionClosed_not_allowed_in_oro8q",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8q"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8q"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8q"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8q"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8q"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8q"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8q"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8q"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8q"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8q"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8q"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8q",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8q",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "closeout_requires_no_mutation_and_no_external_network_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8q"],
    [
      failArchiveBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_archive_boundary_required_after_oro8q",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_archive_boundary_required_after_oro8q",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_archive_boundary_required_after_oro8q",
    ],
    [
      failSeparateActualExecutionFinalExecutionArchiveMissingFixture,
      "separate_actual_live_execution_final_execution_archive_boundary_required_after_oro8q",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures().map(
      evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary
    );
  assert.strictEqual(allReports.length, 36, "fixture set must cover ORO-8Q cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8Q live traffic actual external call execution actual live execution final execution closeout boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8Q live traffic actual external call execution actual live execution final execution closeout boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
