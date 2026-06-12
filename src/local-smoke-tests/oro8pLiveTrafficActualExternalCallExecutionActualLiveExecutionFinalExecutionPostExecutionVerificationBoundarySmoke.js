"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary");
const fixtures = require("../game-provider-mock/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures");
const {
  ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
  ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
} = require("../game-provider-mock/oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary");

const {
  CLOSED_ORO8P_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
  ORO8P_PHASE,
  ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
  PASS,
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundarySummary,
  evaluateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
  runOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
  validateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
} = helper;

const {
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCloseoutBoundaryMissingFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8oDependencyMissingFixture,
  failOro8oFinalExecutionExecutionBoundaryNotPassedFixture,
  failOro8oFinalExecutionExecutionNotIssuedFixture,
  failOro8oFinalExecutionExecutionNotPreparedFixture,
  failOro8oFinalExecutionExecutionNotRecordedFixture,
  failOro8oFinalExecutionExecutionScopeMismatchFixture,
  failOro8oFinalExecutionExecutionStatusMismatchFixture,
  failOro8oIndicatesActualLiveExecutionOccurredFixture,
  failPostExecutionVerificationActivatesRuntimeFixture,
  failPostExecutionVerificationApprovesRuntimeExecutionFixture,
  failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture,
  failPostExecutionVerificationEnablesRuntimeFixture,
  failPostExecutionVerificationExecutesLiveCallFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8O =
  "docs/ORO_8O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_BOUNDARY.md";
const DOC_8P =
  "docs/ORO_8P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8pSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundarySmoke.js";
const SCRIPT = "smoke:oro-8p";
const DETAIL_SCRIPT =
  "smoke:oro-8p-actual-live-execution-final-execution-post-execution-verification-boundary";
const ORO8P_SCAN_FILES = Object.freeze([DOC_8O, DOC_8P, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8P_ACTUAL_EXECUTION_FLAGS,
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
  const doc8o = readRequired(DOC_8O);
  for (const marker of [
    "ORO-8P follows ORO-8O as the separate actual live execution final execution post-execution verification boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary = true",
    ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
    ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
  ]) {
    assert(doc8o.includes(marker), `${DOC_8O} missing marker ${marker}.`);
  }

  const doc8p = readRequired(DOC_8P);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8O",
    "## Post-execution verification record",
    "## Post-execution-verification-boundary-only",
    "## ORO-8O mock-only proof",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8P creates static/mock actual live execution final execution post-execution verification",
    "actual_live_execution_final_execution_post_execution_verification_boundary_only",
    "dependsOnOro8oActualLiveExecutionFinalExecutionExecutionBoundary = true",
    "oro8oActualLiveExecutionFinalExecutionExecutionBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o = true",
    "actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o = true",
    "actualLiveExecutionFinalExecutionExecutionPassedFromOro8o = true",
    "actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o = true",
    "actualLiveExecutionFinalExecutionExecutionStatusFromOro8o = executed_as_mock_boundary_for_separate_actual_live_execution_final_execution_post_execution_verification_only",
    "actualLiveExecutionFinalExecutionExecutionScopeFromOro8o = actual_live_execution_final_execution_execution_boundary_only",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPrepared = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationIssued = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPassed = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationRecorded = true",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationStatus = verified_for_separate_actual_live_execution_final_execution_closeout_boundary_only",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationScope = actual_live_execution_final_execution_post_execution_verification_boundary_only",
    "verifiedOro8oWasMockExecutionBoundaryOnly = true",
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
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalExecutionCloseoutRequired = true",
  ]) {
    assert(doc8p.includes(marker), `${DOC_8P} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8p",
    "oro-8p",
    "ORO_8P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_BOUNDARY.md",
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
        "## ORO-8P Live Traffic Actual External Call Execution Actual Live Execution Final Execution Post-Execution Verification Boundary Mapping",
        "ORO-8P records actual live execution final execution post-execution verification only",
        ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
        ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
        ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
        ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
        "actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o=true",
        "actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o=true",
        "actualLiveExecutionFinalExecutionExecutionPassedFromOro8o=true",
        "actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPrepared=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationIssued=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPassed=true",
        "actualLiveExecutionFinalExecutionPostExecutionVerificationRecorded=true",
        "verifiedOro8oWasMockExecutionBoundaryOnly=true",
        "verifiedNoActualLiveExecutionOccurred=true",
        "verifiedNoExternalNetworkOccurred=true",
        "verifiedNoWalletMutationOccurred=true",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8P Current",
        "actual live execution final execution post-execution verification boundary only",
        ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8P current/live traffic actual external call execution actual live execution final execution post-execution verification boundary",
        "actual live execution final execution post-execution verification boundary only",
        "`smoke:oro-8p` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8P Live Traffic Actual External Call Execution Actual Live Execution Final Execution Post-Execution Verification Boundary Coverage",
        "ORO-8P actual live execution final execution post-execution-verification-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8O, DOC_8P].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8P files must not contain ${marker}.`);
  }
  for (const file of ORO8P_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryResult",
    "dependsOnOro8oActualLiveExecutionFinalExecutionExecutionBoundary",
    "oro8oActualLiveExecutionFinalExecutionExecutionBoundaryPassed",
    "actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o",
    "actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o",
    "actualLiveExecutionFinalExecutionExecutionPassedFromOro8o",
    "actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o",
    "actualLiveExecutionFinalExecutionExecutionStatusFromOro8o",
    "actualLiveExecutionFinalExecutionExecutionScopeFromOro8o",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPrepared",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationIssued",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationPassed",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationRecorded",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationStatus",
    "actualLiveExecutionFinalExecutionPostExecutionVerificationScope",
    "verifiedOro8oWasMockExecutionBoundaryOnly",
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
    ...CLOSED_ORO8P_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalExecutionCloseoutRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8P_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture"
  );
  assert.strictEqual(
    summary.dependsOnOro8oActualLiveExecutionFinalExecutionExecutionBoundary,
    true
  );
  assert.strictEqual(summary.oro8oActualLiveExecutionFinalExecutionExecutionBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionPassedFromOro8o, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionExecutionStatusFromOro8o,
    ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionExecutionScopeFromOro8o,
    ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPrepared,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationIssued,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPassed,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationRecorded,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationStatus,
    ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionPostExecutionVerificationScope,
    ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE
  );
  assert.strictEqual(summary.verifiedOro8oWasMockExecutionBoundaryOnly, true);
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
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalExecutionCloseoutRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8P happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8P hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
      happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8oDependencyMissingFixture,
      "missing_oro8o_actual_live_execution_final_execution_execution_boundary_dependency",
    ],
    [
      failOro8oFinalExecutionExecutionNotPreparedFixture,
      "oro8o_actual_live_execution_final_execution_execution_preparation_required",
    ],
    [
      failOro8oFinalExecutionExecutionNotIssuedFixture,
      "oro8o_actual_live_execution_final_execution_execution_issuance_required",
    ],
    [
      failOro8oFinalExecutionExecutionBoundaryNotPassedFixture,
      "oro8o_actual_live_execution_final_execution_execution_boundary_pass_required",
    ],
    [
      failOro8oFinalExecutionExecutionNotRecordedFixture,
      "oro8o_actual_live_execution_final_execution_execution_record_required",
    ],
    [
      failOro8oFinalExecutionExecutionStatusMismatchFixture,
      "invalid_oro8o_actual_live_execution_final_execution_execution_status",
    ],
    [
      failOro8oFinalExecutionExecutionScopeMismatchFixture,
      "invalid_oro8o_actual_live_execution_final_execution_execution_scope",
    ],
    [
      failOro8oIndicatesActualLiveExecutionOccurredFixture,
      "oro8o_actual_live_execution_must_not_have_occurred",
    ],
    [
      failPostExecutionVerificationApprovesRuntimeExecutionFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8p",
    ],
    [
      failPostExecutionVerificationActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8p",
    ],
    [
      failPostExecutionVerificationEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8p",
    ],
    [
      failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8p",
    ],
    [
      failPostExecutionVerificationExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8p",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8p"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8p"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8p"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8p"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8p"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8p"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8p"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8p"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8p"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8p"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8p"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8p",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8p",
    ],
    [
      failCannotProveNoMutationOrExternalNetworkFixture,
      "post_execution_verification_requires_no_mutation_and_no_external_network_proof",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8p"],
    [
      failCloseoutBoundaryMissingFixture,
      "separate_actual_live_execution_final_execution_closeout_boundary_required_after_oro8p",
    ],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_closeout_boundary_required_after_oro8p",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_closeout_boundary_required_after_oro8p",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures().map(
      evaluateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary
    );
  assert.strictEqual(allReports.length, 32, "fixture set must cover ORO-8P cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8P live traffic actual external call execution actual live execution final execution post-execution verification boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8P live traffic actual external call execution actual live execution final execution post-execution verification boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
