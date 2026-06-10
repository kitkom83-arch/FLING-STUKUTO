"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");
const fixtures = require("../game-provider-mock/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures");
const {
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
} = require("../game-provider-mock/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO8C_PHASE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
  PASS,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundarySummary,
  evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  runOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
} = helper;

const {
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundaryFixtures,
  failFinalExecutionGateNotIssuedFixture,
  failFinalExecutionGateNotPreparedFixture,
  failFinalExecutionGateScopeMismatchFixture,
  failFinalExecutionGateStatusMismatchFixture,
  failExternalNetworkCalledFixture,
  failHumanApprovalMissingFixture,
  failOro8bFinalExecutionDecisionNotIssuedFixture,
  failOro8bFinalExecutionDecisionNotPassedFixture,
  failOro8bFinalExecutionDecisionScopeMismatchFixture,
  failOro8bFinalExecutionDecisionStatusMismatchFixture,
  failRouteEnablementFixture,
  failSensitiveOutputFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failWalletMutationFixture,
  happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8C =
  "docs/ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE.md";
const DOC_8B =
  "docs/ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8cSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate.js";
const FIXTURES =
  "src/game-provider-mock/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSmoke.js";
const SCRIPT = "smoke:oro-8c";
const DETAIL_SCRIPT =
  "smoke:oro-8c-actual-live-execution-final-execution-gate";
const ORO8C_SCAN_FILES = Object.freeze([DOC_8C, BOUNDARY, FIXTURES, WRAPPER]);

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
    ["be", "arer"].join(""),
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
  const doc8c = readRequired(DOC_8C);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8B",
    "## Actual live execution final execution gate record",
    "## Actual-live-execution-final-execution-gate-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Safety confirmation",
    "ORO-8C records the live traffic actual external call execution actual live",
    "ORO-8C is actual live execution final execution gate boundary only.",
    "ORO-8C does not perform actual live execution.",
    "ORO-8C does not activate runtime execution.",
    "ORO-8C does not enable runtime execution.",
    "ORO-8C does not authorize execution to proceed immediately.",
    "ORO-8C does not approve live execution.",
    "ORO-8C does not call external networks.",
    "ORO-8C does not call live OroPlay APIs.",
    "ORO-8C does not mutate wallet or ledger.",
    "ORO-8C does not mount any route.",
    "ORO-8C does not expose public aliases.",
    "actualLiveExecutionFinalExecutionGatePrepared = true",
    "actualLiveExecutionFinalExecutionGateIssued = true",
    "actualLiveExecutionFinalExecutionGateStatus = passed_for_separate_actual_live_execution_final_execution_request_only",
    "actualLiveExecutionFinalExecutionGateScope = actual_live_execution_final_execution_gate_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "externalNetworkAllowed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCallAllowed = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary = true",
    "oro8bActualLiveExecutionAuthorizationDecisionPassed = true",
    "actualLiveExecutionAuthorizationDecisionIssuedFromOro8b = true",
    "actualLiveExecutionAuthorizationDecisionStatusFromOro8b = approved_for_separate_actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionAuthorizationDecisionScopeFromOro8b = actual_live_execution_authorization_decision_only",
  ]) {
    assert(doc8c.includes(marker), `${DOC_8C} missing marker ${marker}.`);
  }

  const doc8b = readRequired(DOC_8B);
  for (const marker of [
    "ORO-8C follows ORO-8B as the separate actual live execution final execution gate boundary.",
    ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
    ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ]) {
    assert(doc8b.includes(marker), `${DOC_8B} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8c",
    "oro-8c",
    "ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
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
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-8C records actual live execution final execution gate only",
        "ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE",
        ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
        ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
        ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
        "actualLiveExecutionFinalExecutionGateIssued=true",
        "actualLiveExecutionFinalExecutionGateScope=actual_live_execution_final_execution_gate_only",
        "actualLiveExecutionFinalExecutionGateStatus=passed_for_separate_actual_live_execution_final_execution_request_only",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "actualLiveExecutionAuthorizationDecisionStatusFromOro8b=approved_for_separate_actual_live_execution_final_execution_gate_only",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8C Current",
        "actual live execution final execution gate boundary only",
        ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-8C current/live traffic actual external call execution actual live execution final execution gate",
        "actual live execution final execution gate only",
        "`smoke:oro-8c` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-8C Live Traffic Actual External Call Execution Actual Live Execution Final Execution Gate Coverage",
        "ORO-8C actual live execution final execution gate boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8C].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8C files must not contain ${marker}.`);
  }
  for (const file of ORO8C_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
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
    "dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary",
    "oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed",
    "oro8bActualLiveExecutionAuthorizationDecisionPassed",
    "actualLiveExecutionAuthorizationDecisionIssuedFromOro8b",
    "actualLiveExecutionAuthorizationDecisionStatusFromOro8b",
    "actualLiveExecutionAuthorizationDecisionScopeFromOro8b",
    "actualLiveExecutionFinalExecutionGatePrepared",
    "actualLiveExecutionFinalExecutionGateIssued",
    "actualLiveExecutionFinalExecutionGateStatus",
    "actualLiveExecutionFinalExecutionGateScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    "humanApprovalRequiredForActualExecution",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8C_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(summary.oro8bActualLiveExecutionAuthorizationDecisionPassed, true);
  assert.strictEqual(summary.actualLiveExecutionAuthorizationDecisionIssuedFromOro8b, true);
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationDecisionStatusFromOro8b,
    ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationDecisionScopeFromOro8b,
    ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGatePrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateIssued, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateStatus,
    ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateScope,
    ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest,
    true
  );
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8C happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8C hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
      happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8bFinalExecutionDecisionNotPassedFixture,
      "missing_passed_oro8b_actual_live_execution_authorization_decision_boundary",
    ],
    [
      failOro8bFinalExecutionDecisionNotIssuedFixture,
      "oro8b_actual_live_execution_authorization_decision_issuance_required",
    ],
    [
      failOro8bFinalExecutionDecisionStatusMismatchFixture,
      "invalid_oro8b_actual_live_execution_authorization_decision_status",
    ],
    [
      failOro8bFinalExecutionDecisionScopeMismatchFixture,
      "invalid_oro8b_actual_live_execution_authorization_decision_scope",
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
      failFinalExecutionGateStatusMismatchFixture,
      "invalid_actual_live_execution_final_execution_gate_status",
    ],
    [
      failFinalExecutionGateScopeMismatchFixture,
      "invalid_actual_live_execution_final_execution_gate_scope",
    ],
    [failRouteEnablementFixture, "routeEnablementAllowed_not_allowed_in_oro8c"],
    [failExternalNetworkCalledFixture, "externalNetworkAllowed_not_allowed_in_oro8c"],
    [failWalletMutationFixture, "walletMutationAllowed_not_allowed_in_oro8c"],
    [failHumanApprovalMissingFixture, "separate_actual_live_execution_approval_required_after_oro8c"],
    [
      failSeparateActualExecutionApprovalMissingFixture,
      "separate_actual_live_execution_approval_required_after_oro8c",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8c"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundaryFixtures().map(
      evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary
    );
  assert.strictEqual(
    allReports.length,
    15,
    "fixture set must cover ORO-8C cases."
  );
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8C live traffic actual external call execution actual live execution final execution gate boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8C live traffic actual external call execution actual live execution final execution gate boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
