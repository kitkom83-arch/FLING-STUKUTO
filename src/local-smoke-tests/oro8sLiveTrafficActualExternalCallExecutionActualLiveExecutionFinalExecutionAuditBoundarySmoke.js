"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary");
const fixtures = require("../game-provider-mock/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures");
const {
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
} = require("../game-provider-mock/oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary");

const {
  CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO8S_PHASE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
  PASS,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySummary,
  evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  runOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
} = helper;

const {
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failAuditActivatesRuntimeFixture,
  failAuditApprovesRuntimeExecutionFixture,
  failAuditAuthorizesRuntimeExternalExecutionFixture,
  failAuditEnablesRuntimeFixture,
  failAuditExecutesLiveCallFixture,
  failAuditMarksActualLiveFinalExecutionArchivedFixture,
  failAuditMarksActualLiveFinalExecutionAuditedFixture,
  failAuditMarksActualLiveFinalExecutionClosedFixture,
  failAuditMarksActualLiveFinalExecutionExecutedFixture,
  failAuditNotIssuedFixture,
  failAuditNotPassedFixture,
  failAuditNotPreparedFixture,
  failAuditNotRecordedFixture,
  failAuditScopeMismatchFixture,
  failAuditStatusMismatchFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRouteOrAliasFixture,
  failCannotProveNoRuntimeFixture,
  failCompletionRecordBoundaryMissingFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8rArchiveBoundaryNotPassedFixture,
  failOro8rArchiveNotIssuedFixture,
  failOro8rArchiveNotPreparedFixture,
  failOro8rArchiveNotRecordedFixture,
  failOro8rArchiveScopeMismatchFixture,
  failOro8rArchiveStatusMismatchFixture,
  failOro8rCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8rDependencyMissingFixture,
  failOro8rNotArchiveBoundaryOnlyFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8R =
  "docs/ORO_8R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_BOUNDARY.md";
const DOC_8S =
  "docs/ORO_8S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8sSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySmoke.js";
const SCRIPT = "smoke:oro-8s";
const DETAIL_SCRIPT =
  "smoke:oro-8s-actual-live-execution-final-execution-audit-boundary";
const ORO8S_SCAN_FILES = Object.freeze([DOC_8R, DOC_8S, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
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
  const doc8r = readRequired(DOC_8R);
  for (const marker of [
    "ORO-8S follows ORO-8R as the separate actual live execution final execution audit boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary = true",
    ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
    ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ]) {
    assert(doc8r.includes(marker), `${DOC_8R} missing marker ${marker}.`);
  }

  const doc8s = readRequired(DOC_8S);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8R",
    "## Audit record",
    "## Audit-boundary-only",
    "## ORO-8R, ORO-8Q, ORO-8P, and ORO-8O proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8S creates static/mock actual live execution final execution audit",
    "actual_live_execution_final_execution_audit_boundary_only",
    "dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary = true",
    "oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionArchivePreparedFromOro8r = true",
    "actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r = true",
    "actualLiveExecutionFinalExecutionArchivePassedFromOro8r = true",
    "actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r = true",
    "actualLiveExecutionFinalExecutionArchiveStatusFromOro8r = archived_for_separate_actual_live_execution_final_execution_audit_boundary_only",
    "actualLiveExecutionFinalExecutionArchiveScopeFromOro8r = actual_live_execution_final_execution_archive_boundary_only",
    "actualLiveExecutionFinalExecutionAuditPrepared = true",
    "actualLiveExecutionFinalExecutionAuditIssued = true",
    "actualLiveExecutionFinalExecutionAuditPassed = true",
    "actualLiveExecutionFinalExecutionAuditRecorded = true",
    "actualLiveExecutionFinalExecutionAuditStatus = audited_for_separate_actual_live_execution_final_execution_completion_record_boundary_only",
    "actualLiveExecutionFinalExecutionAuditScope = actual_live_execution_final_execution_audit_boundary_only",
    "verifiedOro8rWasArchiveBoundaryOnly = true",
    "verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly = true",
    "verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly = true",
    "verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly = true",
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
    "actualLiveExecutionFinalExecutionAudited = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCompletionRecordRequired = true",
  ]) {
    assert(doc8s.includes(marker), `${DOC_8S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8s",
    "oro-8s",
    "ORO_8S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_BOUNDARY.md",
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
        "## ORO-8S Live Traffic Actual External Call Execution Actual Live Execution Final Execution Audit Boundary Mapping",
        "ORO-8S records actual live execution final execution audit only",
        ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
        ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
        ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
        ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
        "actualLiveExecutionFinalExecutionArchivePreparedFromOro8r=true",
        "actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r=true",
        "actualLiveExecutionFinalExecutionArchivePassedFromOro8r=true",
        "actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r=true",
        "actualLiveExecutionFinalExecutionAuditPrepared=true",
        "actualLiveExecutionFinalExecutionAuditIssued=true",
        "actualLiveExecutionFinalExecutionAuditPassed=true",
        "actualLiveExecutionFinalExecutionAuditRecorded=true",
        "verifiedOro8rWasArchiveBoundaryOnly=true",
        "verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly=true",
        "verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly=true",
        "verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "actualLiveExecutionFinalExecutionArchived=false",
        "actualLiveExecutionFinalExecutionAudited=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8S Current",
        "actual live execution final execution audit boundary only",
        ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8S current/live traffic actual external call execution actual live execution final execution audit boundary",
        "actual live execution final execution audit boundary only",
        "`smoke:oro-8s` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8S Live Traffic Actual External Call Execution Actual Live Execution Final Execution Audit Boundary Coverage",
        "ORO-8S actual live execution final execution audit-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8R, DOC_8S].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8S files must not contain ${marker}.`);
  }
  for (const file of ORO8S_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryResult",
    "dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary",
    "oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed",
    "actualLiveExecutionFinalExecutionArchivePreparedFromOro8r",
    "actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r",
    "actualLiveExecutionFinalExecutionArchivePassedFromOro8r",
    "actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r",
    "actualLiveExecutionFinalExecutionArchiveStatusFromOro8r",
    "actualLiveExecutionFinalExecutionArchiveScopeFromOro8r",
    "actualLiveExecutionFinalExecutionAuditPrepared",
    "actualLiveExecutionFinalExecutionAuditIssued",
    "actualLiveExecutionFinalExecutionAuditPassed",
    "actualLiveExecutionFinalExecutionAuditRecorded",
    "actualLiveExecutionFinalExecutionAuditStatus",
    "actualLiveExecutionFinalExecutionAuditScope",
    "verifiedOro8rWasArchiveBoundaryOnly",
    "verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly",
    "verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
    "verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly",
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
    ...CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCompletionRecordRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8S_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchivePreparedFromOro8r,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchivePassedFromOro8r,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveStatusFromOro8r,
    ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionArchiveScopeFromOro8r,
    ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionAuditRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionAuditStatus,
    ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionAuditScope,
    ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8rWasArchiveBoundaryOnly, true);
  assert.strictEqual(summary.verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly, true);
  assert.strictEqual(
    summary.verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    true
  );
  assert.strictEqual(summary.verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(
    summary.separateActualExecutionFinalExecutionCompletionRecordRequired,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8S happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8S hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
      happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8rDependencyMissingFixture,
      "missing_oro8r_actual_live_execution_final_execution_archive_boundary_dependency",
    ],
    [
      failOro8rArchiveNotPreparedFixture,
      "oro8r_actual_live_execution_final_execution_archive_preparation_required",
    ],
    [
      failOro8rArchiveNotIssuedFixture,
      "oro8r_actual_live_execution_final_execution_archive_issuance_required",
    ],
    [
      failOro8rArchiveBoundaryNotPassedFixture,
      "oro8r_actual_live_execution_final_execution_archive_boundary_pass_required",
    ],
    [
      failOro8rArchiveNotRecordedFixture,
      "oro8r_actual_live_execution_final_execution_archive_record_required",
    ],
    [
      failOro8rArchiveStatusMismatchFixture,
      "invalid_oro8r_actual_live_execution_final_execution_archive_status",
    ],
    [
      failOro8rArchiveScopeMismatchFixture,
      "invalid_oro8r_actual_live_execution_final_execution_archive_scope",
    ],
    [
      failOro8rCannotProveNoActualLiveExecutionOccurredFixture,
      "audit_requires_no_actual_execution_route_or_alias_proof",
    ],
    [
      failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
      "oro8r_must_confirm_oro8o_mock_execution_boundary_only",
    ],
    [failOro8rNotArchiveBoundaryOnlyFixture, "oro8r_archive_boundary_only_proof_required"],
    [
      failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
      "oro8r_must_confirm_oro8q_closeout_boundary_only",
    ],
    [
      failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
      "oro8r_must_confirm_oro8p_post_execution_verification_boundary_only",
    ],
    [
      failAuditNotPreparedFixture,
      "actual_live_execution_final_execution_audit_preparation_required",
    ],
    [
      failAuditNotIssuedFixture,
      "actual_live_execution_final_execution_audit_issuance_required",
    ],
    [failAuditNotPassedFixture, "actual_live_execution_final_execution_audit_pass_required"],
    [
      failAuditNotRecordedFixture,
      "actual_live_execution_final_execution_audit_record_required",
    ],
    [failAuditStatusMismatchFixture, "invalid_actual_live_execution_final_execution_audit_status"],
    [failAuditScopeMismatchFixture, "invalid_actual_live_execution_final_execution_audit_scope"],
    [
      failAuditApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8s",
    ],
    [
      failAuditActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8s",
    ],
    [
      failAuditEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8s",
    ],
    [
      failAuditAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8s",
    ],
    [
      failAuditExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8s",
    ],
    [
      failAuditMarksActualLiveFinalExecutionExecutedFixture,
      "actualLiveExecutionFinalExecutionExecuted_not_allowed_in_oro8s",
    ],
    [
      failAuditMarksActualLiveFinalExecutionClosedFixture,
      "actualLiveExecutionFinalExecutionClosed_not_allowed_in_oro8s",
    ],
    [
      failAuditMarksActualLiveFinalExecutionArchivedFixture,
      "actualLiveExecutionFinalExecutionArchived_not_allowed_in_oro8s",
    ],
    [
      failAuditMarksActualLiveFinalExecutionAuditedFixture,
      "actualLiveExecutionFinalExecutionAudited_not_allowed_in_oro8s",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8s"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8s"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8s"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8s"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8s"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8s"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8s"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8s"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8s"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8s"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8s"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8s",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8s",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "audit_requires_no_mutation_and_no_external_network_proof",
    ],
    [failCannotProveNoRuntimeFixture, "audit_requires_no_runtime_proof"],
    [
      failCannotProveNoRouteOrAliasFixture,
      "audit_requires_no_actual_execution_route_or_alias_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8s"],
    [
      failCompletionRecordBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_boundary_required_after_oro8s",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_boundary_required_after_oro8s",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_boundary_required_after_oro8s",
    ],
    [
      failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture,
      "separate_actual_live_execution_final_execution_completion_record_boundary_required_after_oro8s",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures().map(
      evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary
    );
  assert.strictEqual(allReports.length, 49, "fixture set must cover ORO-8S cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8S live traffic actual external call execution actual live execution final execution audit boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8S live traffic actual external call execution actual live execution final execution audit boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
