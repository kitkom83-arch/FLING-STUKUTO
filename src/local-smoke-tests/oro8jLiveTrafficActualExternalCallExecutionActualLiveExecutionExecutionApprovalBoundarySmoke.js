"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundary");
const fixtures = require("../game-provider-mock/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryFixtures");
const {
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
} = require("../game-provider-mock/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundary");

const {
  CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO8J_PHASE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
  PASS,
  buildOro8jActualLiveExecutionExecutionApprovalBoundary,
  buildOro8jActualLiveExecutionExecutionApprovalBoundarySummary,
  evaluateOro8jActualLiveExecutionExecutionApprovalBoundary,
  runOro8jActualLiveExecutionExecutionApprovalBoundary,
  validateOro8jActualLiveExecutionExecutionApprovalBoundary,
} = helper;

const {
  buildOro8jActualLiveExecutionExecutionApprovalBoundaryFixtures,
  failApiBalanceAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failApprovalBoundaryActivatesRuntimeFixture,
  failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture,
  failApprovalBoundaryEnablesRuntimeFixture,
  failApprovalBoundaryExecutesLiveCallFixture,
  failDbTransactionAllowedFixture,
  failExpressMountAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failOro8iDependencyMissingFixture,
  failOro8iRequestBoundaryNotPassedFixture,
  failOro8iRequestNotSubmittedFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionExecutionApprovalBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8I =
  "docs/ORO_8I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_8J =
  "docs/ORO_8J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8jSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-8j";
const DETAIL_SCRIPT =
  "smoke:oro-8j-actual-live-execution-execution-approval-boundary";
const ORO8J_SCAN_FILES = Object.freeze([DOC_8I, DOC_8J, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
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
    !/[a-z]+:\/\/[^:\s/]+:[^@\s]+@/i.test(scanned),
    `${label} includes embedded auth URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc8i = readRequired(DOC_8I);
  for (const marker of [
    "ORO-8J follows ORO-8I as the separate actual live execution execution approval boundary.",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval = true",
  ]) {
    assert(doc8i.includes(marker), `${DOC_8I} missing marker ${marker}.`);
  }

  const doc8j = readRequired(DOC_8J);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8I",
    "## Actual live execution execution approval record",
    "## Actual-live-execution-execution-approval-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8J creates static/mock actual live execution execution approval boundary evidence only.",
    "dependsOnOro8iActualLiveExecutionExecutionRequestBoundary = true",
    "oro8iActualLiveExecutionExecutionRequestBoundaryPassed = true",
    "actualLiveExecutionExecutionRequestSubmittedFromOro8i = true",
    "actualLiveExecutionExecutionRequestStatusFromOro8i = submitted_for_separate_actual_live_execution_execution_approval_only",
    "actualLiveExecutionExecutionRequestScopeFromOro8i = actual_live_execution_execution_request_boundary_only",
    "actualLiveExecutionExecutionApprovalPrepared = true",
    "actualLiveExecutionExecutionApprovalIssued = true",
    "actualLiveExecutionExecutionApprovalPassed = true",
    "actualLiveExecutionExecutionApprovalRecorded = true",
    "actualLiveExecutionExecutionApprovalStatus = approved_for_separate_actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionExecutionApprovalScope = actual_live_execution_execution_approval_boundary_only",
    "actualLiveExecutionExecutionApproved = false",
    "actualLiveExecutionExecutionRequestApproved = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate = true",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalGateRequired = true",
  ]) {
    assert(doc8j.includes(marker), `${DOC_8J} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8j",
    "oro-8j",
    "ORO_8J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_BOUNDARY.md",
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
        "## ORO-8J Live Traffic Actual External Call Execution Actual Live Execution Execution Approval Boundary Mapping",
        "ORO-8J records actual live execution execution approval boundary only",
        ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
        ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
        ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
        ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
        "actualLiveExecutionExecutionApprovalRecorded=true",
        "actualLiveExecutionExecutionApproved=false",
        "actualLiveExecutionExecutionRequestApproved=false",
        "actualLiveExecutionExecuted=false",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8J Current",
        "actual live execution execution approval boundary only",
        ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8J current/live traffic actual external call execution actual live execution execution approval boundary",
        "actual live execution execution approval boundary only",
        "`smoke:oro-8j` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8J Live Traffic Actual External Call Execution Actual Live Execution Execution Approval Boundary Coverage",
        "ORO-8J actual live execution execution approval-boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8I, DOC_8J].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8J files must not contain ${marker}.`);
  }
  for (const file of ORO8J_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryResult",
    "dependsOnOro8iActualLiveExecutionExecutionRequestBoundary",
    "oro8iActualLiveExecutionExecutionRequestBoundaryPassed",
    "actualLiveExecutionExecutionRequestSubmittedFromOro8i",
    "actualLiveExecutionExecutionRequestStatusFromOro8i",
    "actualLiveExecutionExecutionRequestScopeFromOro8i",
    "actualLiveExecutionExecutionApprovalPrepared",
    "actualLiveExecutionExecutionApprovalIssued",
    "actualLiveExecutionExecutionApprovalPassed",
    "actualLiveExecutionExecutionApprovalRecorded",
    "actualLiveExecutionExecutionApprovalStatus",
    "actualLiveExecutionExecutionApprovalScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalGateRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8J_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8iActualLiveExecutionExecutionRequestBoundary, true);
  assert.strictEqual(summary.oro8iActualLiveExecutionExecutionRequestBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestSubmittedFromOro8i, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionRequestStatusFromOro8i,
    ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionRequestScopeFromOro8i,
    ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalIssued, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalPassed, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionApprovalStatus,
    ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionApprovalScope,
    ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalGateRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8J happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalPrepared, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalIssued, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalPassed, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalRecorded, false);
  assertNoSensitiveShape("ORO-8J hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro8jActualLiveExecutionExecutionApprovalBoundary, "function");
  assert.strictEqual(typeof evaluateOro8jActualLiveExecutionExecutionApprovalBoundary, "function");
  assert.strictEqual(typeof validateOro8jActualLiveExecutionExecutionApprovalBoundary, "function");
  assert.strictEqual(typeof runOro8jActualLiveExecutionExecutionApprovalBoundary, "function");
  assert.strictEqual(
    typeof buildOro8jActualLiveExecutionExecutionApprovalBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8jActualLiveExecutionExecutionApprovalBoundary(
    happyPathActualLiveExecutionExecutionApprovalBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8jActualLiveExecutionExecutionApprovalBoundarySummary(happy),
    happy
  );
  assert.deepStrictEqual(validateOro8jActualLiveExecutionExecutionApprovalBoundary(happy), happy);
  assert.deepStrictEqual(runOro8jActualLiveExecutionExecutionApprovalBoundary(happy), happy);

  const heldCases = [
    [
      failOro8iDependencyMissingFixture,
      "missing_oro8i_actual_live_execution_execution_request_boundary_dependency",
    ],
    [
      failOro8iRequestNotSubmittedFixture,
      "oro8i_actual_live_execution_execution_request_submission_required",
    ],
    [
      failOro8iRequestBoundaryNotPassedFixture,
      "oro8i_actual_live_execution_execution_request_boundary_pass_required",
    ],
    [
      failApprovalBoundaryActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8j",
    ],
    [
      failApprovalBoundaryEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8j",
    ],
    [
      failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8j",
    ],
    [
      failApprovalBoundaryExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8j",
    ],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8j"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8j"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8j"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8j"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8j"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8j"],
    [failRouteEnablementAllowedFixture, "routeEnablementAllowed_not_allowed_in_oro8j"],
    [failExpressMountAllowedFixture, "expressMountAllowed_not_allowed_in_oro8j"],
    [failPublicAliasAllowedFixture, "publicAliasAllowed_not_allowed_in_oro8j"],
    [failApiBalanceAliasAllowedFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8j"],
    [failApiTransactionAliasAllowedFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8j"],
    [
      failApiOroplayBalanceRouteAllowedFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8j",
    ],
    [
      failApiOroplayTransactionRouteAllowedFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8j",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8j"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8jActualLiveExecutionExecutionApprovalBoundary(input), blocker);
  }

  const allReports = buildOro8jActualLiveExecutionExecutionApprovalBoundaryFixtures().map(
    evaluateOro8jActualLiveExecutionExecutionApprovalBoundary
  );
  assert.strictEqual(allReports.length, 22, "fixture set must cover ORO-8J.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8J live traffic actual external call execution actual live execution execution approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8J live traffic actual external call execution actual live execution execution approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
