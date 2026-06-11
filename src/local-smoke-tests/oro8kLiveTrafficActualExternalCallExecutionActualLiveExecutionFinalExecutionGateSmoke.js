"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");
const fixtures = require("../game-provider-mock/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures");
const {
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
} = require("../game-provider-mock/oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundary");

const {
  CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO8K_PHASE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
  PASS,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSummary,
  evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  runOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
} = helper;

const {
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures,
  failApiBalanceAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failApiTransactionAliasFlagFixture,
  failDbTransactionFlagFixture,
  failExpressMountFlagFixture,
  failExternalNetworkFlagFixture,
  failFinalExecutionGateActivatesRuntimeFixture,
  failFinalExecutionGateApprovesActualExecutionFixture,
  failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionGateEnablesRuntimeFixture,
  failFinalExecutionGateExecutesLiveCallFixture,
  failFinalExecutionGateNotIssuedFixture,
  failFinalExecutionGateNotPassedFixture,
  failFinalExecutionGateNotPreparedFixture,
  failFinalExecutionGateNotRecordedFixture,
  failFinalExecutionGateScopeMismatchFixture,
  failFinalExecutionGateStatusMismatchFixture,
  failFinalExecutionGateSubmitsFinalExecutionRequestFixture,
  failHumanApprovalMissingFixture,
  failLedgerMutationFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failOro8jApprovalBoundaryNotPassedFixture,
  failOro8jApprovalNotRecordedFixture,
  failOro8jApprovalScopeMismatchFixture,
  failOro8jApprovalStatusMismatchFixture,
  failOro8jDependencyMissingFixture,
  failPrismaWriteFlagFixture,
  failPublicAliasFlagFixture,
  failRouteEnablementFlagFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalRequestMissingFixture,
  failWalletMutationFlagFixture,
  happyPathActualLiveExecutionFinalExecutionGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8J =
  "docs/ORO_8J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_BOUNDARY.md";
const DOC_8K =
  "docs/ORO_8K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro8kSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate.js";
const FIXTURES =
  "src/game-provider-mock/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSmoke.js";
const SCRIPT = "smoke:oro-8k";
const DETAIL_SCRIPT = "smoke:oro-8k-actual-live-execution-final-execution-gate";
const ORO8K_SCAN_FILES = Object.freeze([DOC_8J, DOC_8K, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS,
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
  const doc8j = readRequired(DOC_8J);
  for (const marker of [
    "ORO-8K follows ORO-8J as the separate actual live execution final execution gate.",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate = true",
    ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
    ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ]) {
    assert(doc8j.includes(marker), `${DOC_8J} missing marker ${marker}.`);
  }

  const doc8k = readRequired(DOC_8K);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8J",
    "## Actual live execution final execution gate record",
    "## Actual-live-execution-final-execution-gate-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8K creates static/mock actual live execution final execution gate evidence only.",
    "actual_live_execution_final_execution_gate_only",
    "dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary = true",
    "oro8jActualLiveExecutionExecutionApprovalBoundaryPassed = true",
    "actualLiveExecutionExecutionApprovalIssuedFromOro8j = true",
    "actualLiveExecutionExecutionApprovalRecordedFromOro8j = true",
    "actualLiveExecutionExecutionApprovalStatusFromOro8j = approved_for_separate_actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionExecutionApprovalScopeFromOro8j = actual_live_execution_execution_approval_boundary_only",
    "actualLiveExecutionFinalExecutionGatePrepared = true",
    "actualLiveExecutionFinalExecutionGateIssued = true",
    "actualLiveExecutionFinalExecutionGatePassed = true",
    "actualLiveExecutionFinalExecutionGateRecorded = true",
    "actualLiveExecutionFinalExecutionGateStatus = passed_for_separate_actual_live_execution_final_execution_request_only",
    "actualLiveExecutionFinalExecutionGateScope = actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionFinalExecutionRequestSubmitted = false",
    "actualLiveExecutionFinalExecutionRequestApproved = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "separateActualExecutionFinalRequestRequired = true",
  ]) {
    assert(doc8k.includes(marker), `${DOC_8K} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8k",
    "oro-8k",
    "ORO_8K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE.md",
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
        "## ORO-8K Live Traffic Actual External Call Execution Actual Live Execution Final Execution Gate Mapping",
        "ORO-8K records actual live execution final execution gate only",
        ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
        ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
        ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
        ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
        "actualLiveExecutionExecutionApprovalRecordedFromOro8j=true",
        "actualLiveExecutionFinalExecutionGateRecorded=true",
        "actualLiveExecutionFinalExecutionRequestSubmitted=false",
        "actualLiveExecutionFinalExecutionRequestApproved=false",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8K Current",
        "actual live execution final execution gate only",
        ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8K current/live traffic actual external call execution actual live execution final execution gate",
        "actual live execution final execution gate only",
        "`smoke:oro-8k` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8K Live Traffic Actual External Call Execution Actual Live Execution Final Execution Gate Coverage",
        "ORO-8K actual live execution final execution gate-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8J, DOC_8K].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8K files must not contain ${marker}.`);
  }
  for (const file of ORO8K_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult",
    "dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary",
    "oro8jActualLiveExecutionExecutionApprovalBoundaryPassed",
    "actualLiveExecutionExecutionApprovalIssuedFromOro8j",
    "actualLiveExecutionExecutionApprovalRecordedFromOro8j",
    "actualLiveExecutionExecutionApprovalStatusFromOro8j",
    "actualLiveExecutionExecutionApprovalScopeFromOro8j",
    "actualLiveExecutionFinalExecutionGatePrepared",
    "actualLiveExecutionFinalExecutionGateIssued",
    "actualLiveExecutionFinalExecutionGatePassed",
    "actualLiveExecutionFinalExecutionGateRecorded",
    "actualLiveExecutionFinalExecutionGateStatus",
    "actualLiveExecutionFinalExecutionGateScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "separateActualExecutionFinalRequestRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8K_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult,
    PASS
  );
  assert.strictEqual(summary.fixtureId, "happyPathActualLiveExecutionFinalExecutionGateFixture");
  assert.strictEqual(summary.dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary, true);
  assert.strictEqual(summary.oro8jActualLiveExecutionExecutionApprovalBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalIssuedFromOro8j, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionApprovalRecordedFromOro8j, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionApprovalStatusFromOro8j,
    ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionApprovalScopeFromOro8j,
    ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGatePrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateIssued, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGatePassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateRecorded, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateStatus,
    ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateScope,
    ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.strictEqual(summary.separateActualExecutionFinalRequestRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8K happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8K hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof runOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
      happyPathActualLiveExecutionFinalExecutionGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8jDependencyMissingFixture,
      "missing_oro8j_actual_live_execution_execution_approval_boundary_dependency",
    ],
    [
      failOro8jApprovalBoundaryNotPassedFixture,
      "oro8j_actual_live_execution_execution_approval_boundary_pass_required",
    ],
    [
      failOro8jApprovalNotRecordedFixture,
      "oro8j_actual_live_execution_execution_approval_record_required",
    ],
    [
      failOro8jApprovalStatusMismatchFixture,
      "invalid_oro8j_actual_live_execution_execution_approval_status",
    ],
    [
      failOro8jApprovalScopeMismatchFixture,
      "invalid_oro8j_actual_live_execution_execution_approval_scope",
    ],
    [
      failFinalExecutionGateNotPreparedFixture,
      "actual_live_execution_final_execution_gate_preparation_required",
    ],
    [
      failFinalExecutionGateNotIssuedFixture,
      "actual_live_execution_final_execution_gate_issuance_required",
    ],
    [
      failFinalExecutionGateNotPassedFixture,
      "actual_live_execution_final_execution_gate_pass_required",
    ],
    [
      failFinalExecutionGateNotRecordedFixture,
      "actual_live_execution_final_execution_gate_record_required",
    ],
    [
      failFinalExecutionGateStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_gate_status",
    ],
    [
      failFinalExecutionGateScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_gate_scope",
    ],
    [
      failFinalExecutionGateSubmitsFinalExecutionRequestFixture,
      "actualLiveExecutionFinalExecutionRequestSubmitted_not_allowed_in_oro8k",
    ],
    [
      failFinalExecutionGateApprovesActualExecutionFixture,
      "actualLiveExecutionApproved_not_allowed_in_oro8k",
    ],
    [
      failFinalExecutionGateActivatesRuntimeFixture,
      "actualExternalCallExecutionActivated_not_allowed_in_oro8k",
    ],
    [
      failFinalExecutionGateEnablesRuntimeFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro8k",
    ],
    [
      failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture,
      "actualExternalCallExecutionAuthorized_not_allowed_in_oro8k",
    ],
    [
      failFinalExecutionGateExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8k",
    ],
    [failExternalNetworkFlagFixture, "externalNetworkAllowed_not_allowed_in_oro8k"],
    [failLiveOroPlayApiFlagFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8k"],
    [failWalletMutationFlagFixture, "walletMutationAllowed_not_allowed_in_oro8k"],
    [failLedgerMutationFlagFixture, "ledgerMutationAllowed_not_allowed_in_oro8k"],
    [failPrismaWriteFlagFixture, "prismaWriteAllowed_not_allowed_in_oro8k"],
    [failDbTransactionFlagFixture, "dbTransactionAllowed_not_allowed_in_oro8k"],
    [failRouteEnablementFlagFixture, "routeEnablementAllowed_not_allowed_in_oro8k"],
    [failExpressMountFlagFixture, "expressMountAllowed_not_allowed_in_oro8k"],
    [failPublicAliasFlagFixture, "publicAliasAllowed_not_allowed_in_oro8k"],
    [failApiBalanceAliasFlagFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8k"],
    [failApiTransactionAliasFlagFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8k"],
    [
      failApiOroplayBalanceRouteFlagFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8k",
    ],
    [
      failApiOroplayTransactionRouteFlagFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8k",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8k"],
    [
      failHumanApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_request_required_after_oro8k",
    ],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_final_execution_request_required_after_oro8k",
    ],
    [
      failSeparateActualExecutionFinalRequestMissingFixture,
      "separate_actual_live_execution_final_execution_request_required_after_oro8k",
    ],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures().map(
      evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate
    );
  assert.strictEqual(allReports.length, 35, "fixture set must cover ORO-8K cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8K live traffic actual external call execution actual live execution final execution gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8K live traffic actual external call execution actual live execution final execution gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
