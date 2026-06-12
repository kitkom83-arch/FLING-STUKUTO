"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary");
const fixtures = require("../game-provider-mock/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures");
const {
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
} = require("../game-provider-mock/oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary");

const {
  CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO8R_PHASE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
  PASS,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySummary,
  evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  runOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
} = helper;

const {
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failArchiveActivatesRuntimeFixture,
  failArchiveApprovesRuntimeExecutionFixture,
  failArchiveAuthorizesRuntimeExternalExecutionFixture,
  failArchiveEnablesRuntimeFixture,
  failArchiveExecutesLiveCallFixture,
  failArchiveMarksActualLiveFinalExecutionArchivedFixture,
  failArchiveMarksActualLiveFinalExecutionClosedFixture,
  failArchiveMarksActualLiveFinalExecutionExecutedFixture,
  failAuditBoundaryMissingFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8qCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failOro8qCloseoutBoundaryNotPassedFixture,
  failOro8qCloseoutNotIssuedFixture,
  failOro8qCloseoutNotPreparedFixture,
  failOro8qCloseoutNotRecordedFixture,
  failOro8qCloseoutScopeMismatchFixture,
  failOro8qCloseoutStatusMismatchFixture,
  failOro8qDependencyMissingFixture,
  failOro8qNotCloseoutBoundaryOnlyFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionAuditMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8Q =
  "docs/ORO_8Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_BOUNDARY.md";
const DOC_8R =
  "docs/ORO_8R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8rSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySmoke.js";
const SCRIPT = "smoke:oro-8r";
const DETAIL_SCRIPT =
  "smoke:oro-8r-actual-live-execution-final-execution-archive-boundary";
const ORO8R_SCAN_FILES = Object.freeze([DOC_8Q, DOC_8R, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
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
  const doc8q = readRequired(DOC_8Q);
  for (const marker of [
    "ORO-8R follows ORO-8Q as the separate actual live execution final execution archive boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary = true",
    ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
    ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ]) {
    assert(doc8q.includes(marker), `${DOC_8Q} missing marker ${marker}.`);
  }

  const doc8r = readRequired(DOC_8R);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8Q",
    "## Archive record",
    "## Archive-boundary-only",
    "## ORO-8Q, ORO-8P, and ORO-8O proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8R creates static/mock actual live execution final execution archive",
    "actual_live_execution_final_execution_archive_boundary_only",
    "dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary = true",
    "oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q = true",
    "actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q = true",
    "actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q = true",
    "actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q = true",
    "actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q = closed_for_separate_actual_live_execution_final_execution_archive_boundary_only",
    "actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q = actual_live_execution_final_execution_closeout_boundary_only",
    "actualLiveExecutionFinalExecutionArchivePrepared = true",
    "actualLiveExecutionFinalExecutionArchiveIssued = true",
    "actualLiveExecutionFinalExecutionArchivePassed = true",
    "actualLiveExecutionFinalExecutionArchiveRecorded = true",
    "actualLiveExecutionFinalExecutionArchiveStatus = archived_for_separate_actual_live_execution_final_execution_audit_boundary_only",
    "actualLiveExecutionFinalExecutionArchiveScope = actual_live_execution_final_execution_archive_boundary_only",
    "verifiedOro8qWasCloseoutBoundaryOnly = true",
    "verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly = true",
    "verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionArchived = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionAuditRequired = true",
  ]) {
    assert(doc8r.includes(marker), `${DOC_8R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8r",
    "oro-8r",
    "ORO_8R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_BOUNDARY.md",
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
        "## ORO-8R Live Traffic Actual External Call Execution Actual Live Execution Final Execution Archive Boundary Mapping",
        "ORO-8R records actual live execution final execution archive only",
        ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
        ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
        ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
        ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
        "actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q=true",
        "actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q=true",
        "actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q=true",
        "actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q=true",
        "actualLiveExecutionFinalExecutionArchivePrepared=true",
        "actualLiveExecutionFinalExecutionArchiveIssued=true",
        "actualLiveExecutionFinalExecutionArchivePassed=true",
        "actualLiveExecutionFinalExecutionArchiveRecorded=true",
        "verifiedOro8qWasCloseoutBoundaryOnly=true",
        "verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly=true",
        "verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "actualLiveExecutionFinalExecutionClosed=false",
        "actualLiveExecutionFinalExecutionArchived=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8R Current",
        "actual live execution final execution archive boundary only",
        ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8R current/live traffic actual external call execution actual live execution final execution archive boundary",
        "actual live execution final execution archive boundary only",
        "`smoke:oro-8r` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8R Live Traffic Actual External Call Execution Actual Live Execution Final Execution Archive Boundary Coverage",
        "ORO-8R actual live execution final execution archive-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8Q, DOC_8R].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8R files must not contain ${marker}.`);
  }
  for (const file of ORO8R_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryResult",
    "dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary",
    "oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed",
    "actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q",
    "actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q",
    "actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q",
    "actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q",
    "actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q",
    "actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q",
    "actualLiveExecutionFinalExecutionArchivePrepared",
    "actualLiveExecutionFinalExecutionArchiveIssued",
    "actualLiveExecutionFinalExecutionArchivePassed",
    "actualLiveExecutionFinalExecutionArchiveRecorded",
    "actualLiveExecutionFinalExecutionArchiveStatus",
    "actualLiveExecutionFinalExecutionArchiveScope",
    "verifiedOro8qWasCloseoutBoundaryOnly",
    "verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
    "verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly",
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
    ...CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionAuditRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8R_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q,
    ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q,
    ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionArchivePrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionArchiveIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionArchivePassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionArchiveRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveStatus,
    ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveScope,
    ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8qWasCloseoutBoundaryOnly, true);
  assert.strictEqual(
    summary.verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalExecutionAuditRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8R happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8R hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
      happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8qDependencyMissingFixture,
      "missing_oro8q_actual_live_execution_final_execution_closeout_boundary_dependency",
    ],
    [
      failOro8qCloseoutNotPreparedFixture,
      "oro8q_actual_live_execution_final_execution_closeout_preparation_required",
    ],
    [
      failOro8qCloseoutNotIssuedFixture,
      "oro8q_actual_live_execution_final_execution_closeout_issuance_required",
    ],
    [
      failOro8qCloseoutBoundaryNotPassedFixture,
      "oro8q_actual_live_execution_final_execution_closeout_boundary_pass_required",
    ],
    [
      failOro8qCloseoutNotRecordedFixture,
      "oro8q_actual_live_execution_final_execution_closeout_record_required",
    ],
    [
      failOro8qCloseoutStatusMismatchFixture,
      "invalid_oro8q_actual_live_execution_final_execution_closeout_status",
    ],
    [
      failOro8qCloseoutScopeMismatchFixture,
      "invalid_oro8q_actual_live_execution_final_execution_closeout_scope",
    ],
    [
      failOro8qCannotProveNoActualLiveExecutionOccurredFixture,
      "archive_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
      "oro8q_must_confirm_oro8o_mock_execution_boundary_only",
    ],
    [
      failOro8qNotCloseoutBoundaryOnlyFixture,
      "oro8q_closeout_boundary_only_proof_required",
    ],
    [
      failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
      "oro8q_must_confirm_oro8p_post_execution_verification_boundary_only",
    ],
    [
      failArchiveApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8r",
    ],
    [
      failArchiveActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8r",
    ],
    [
      failArchiveEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8r",
    ],
    [
      failArchiveAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8r",
    ],
    [
      failArchiveExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8r",
    ],
    [
      failArchiveMarksActualLiveFinalExecutionExecutedFixture,
      "actualLiveExecutionFinalExecutionExecuted_not_allowed_in_oro8r",
    ],
    [
      failArchiveMarksActualLiveFinalExecutionClosedFixture,
      "actualLiveExecutionFinalExecutionClosed_not_allowed_in_oro8r",
    ],
    [
      failArchiveMarksActualLiveFinalExecutionArchivedFixture,
      "actualLiveExecutionFinalExecutionArchived_not_allowed_in_oro8r",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8r"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8r"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8r"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8r"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8r"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8r"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8r"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8r"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8r"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8r"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8r"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8r",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8r",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "archive_requires_no_mutation_and_no_external_network_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8r"],
    [
      failAuditBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_audit_boundary_required_after_oro8r",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_audit_boundary_required_after_oro8r",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_audit_boundary_required_after_oro8r",
    ],
    [
      failSeparateActualExecutionFinalExecutionAuditMissingFixture,
      "separate_actual_live_execution_final_execution_audit_boundary_required_after_oro8r",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures().map(
      evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary
    );
  assert.strictEqual(allReports.length, 39, "fixture set must cover ORO-8R cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8R live traffic actual external call execution actual live execution final execution archive boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8R live traffic actual external call execution actual live execution final execution archive boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
