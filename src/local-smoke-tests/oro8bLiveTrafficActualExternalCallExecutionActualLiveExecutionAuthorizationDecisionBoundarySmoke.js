"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures");
const {
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
} = require("../game-provider-mock/oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO8B_PHASE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  PASS,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySummary,
  evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  runOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
} = helper;

const {
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures,
  failAuthorizationDecisionNotIssuedFixture,
  failAuthorizationDecisionScopeMismatchFixture,
  failAuthorizationDecisionStatusMismatchFixture,
  failExternalNetworkCalledFixture,
  failLiveExecutedFixture,
  failNextFinalExecutionGateMissingFixture,
  failOro8aAuthorizationRequestNotPassedFixture,
  failOro8aAuthorizationRequestNotSubmittedFixture,
  failOro8aAuthorizationRequestScopeMismatchFixture,
  failOro8aAuthorizationRequestStatusMismatchFixture,
  failRouteEnablementFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8B =
  "docs/ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_8A =
  "docs/ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8bSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-8b";
const DETAIL_SCRIPT =
  "smoke:oro-8b-actual-live-execution-authorization-decision";
const ORO8B_SCAN_FILES = Object.freeze([DOC_8B, BOUNDARY, FIXTURES, WRAPPER]);

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
  const doc8b = readRequired(DOC_8B);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8A",
    "## Actual live execution authorization decision record",
    "## Actual-live-execution-authorization-decision-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8B is actual live execution authorization decision boundary only.",
    "ORO-8B does not perform actual live execution.",
    "ORO-8B does not activate runtime execution.",
    "ORO-8B does not enable runtime execution.",
    "ORO-8B does not authorize execution to proceed immediately.",
    "ORO-8B does not approve live execution.",
    "ORO-8B does not call external networks.",
    "ORO-8B does not call live OroPlay APIs.",
    "ORO-8B does not mutate wallet or ledger.",
    "ORO-8B does not mount any route.",
    "ORO-8B does not expose public aliases.",
    "dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary = true",
    "oro8aActualLiveExecutionAuthorizationRequestPassed = true",
    "actualLiveExecutionAuthorizationRequestSubmittedFromOro8a = true",
    "actualLiveExecutionAuthorizationRequestStatusFromOro8a = submitted_pending_separate_actual_live_execution_authorization_decision",
    "actualLiveExecutionAuthorizationRequestScopeFromOro8a = actual_live_execution_authorization_request_only",
    "actualLiveExecutionAuthorizationDecisionIssued = true",
    "actualLiveExecutionAuthorizationDecisionStatus = approved_for_separate_actual_live_execution_final_execution_gate_only",
    "actualLiveExecutionAuthorizationDecisionScope = actual_live_execution_authorization_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "routeEnablementAllowed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate = true",
    "separateActualExecutionApprovalRequired = true",
  ]) {
    assert(doc8b.includes(marker), `${DOC_8B} missing marker ${marker}.`);
  }

  const doc8a = readRequired(DOC_8A);
  for (const marker of [
    "ORO-8B follows ORO-8A as the separate actual live execution authorization decision boundary.",
    ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
    ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ]) {
    assert(doc8a.includes(marker), `${DOC_8A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8b",
    "oro-8b",
    "ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
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
        "ORO-8B records actual live execution authorization decision only",
        ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
        ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
        ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
        ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
        "actualLiveExecutionAuthorizationDecisionIssued=true",
        "actualLiveExecutionAuthorizationDecisionScope=actual_live_execution_authorization_decision_only",
        "actualExternalCallExecutionLiveExecuted=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "walletMutationAllowed=false",
        "routeEnablementAllowed=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8B Current",
        "actual live execution authorization decision boundary only",
        ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-8B current/live traffic actual external call execution actual live execution authorization decision boundary",
        "actual live execution authorization decision boundary only",
        "`smoke:oro-8b` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-8B Live Traffic Actual External Call Execution Actual Live Execution Authorization Decision Boundary Coverage",
        "ORO-8B actual-live-execution-authorization-decision-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8B].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8B files must not contain ${marker}.`);
  }
  for (const file of ORO8B_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryResult",
    "dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary",
    "oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed",
    "oro8aActualLiveExecutionAuthorizationRequestPassed",
    "actualLiveExecutionAuthorizationRequestSubmittedFromOro8a",
    "actualLiveExecutionAuthorizationRequestStatusFromOro8a",
    "actualLiveExecutionAuthorizationRequestScopeFromOro8a",
    "actualLiveExecutionAuthorizationDecisionPrepared",
    "actualLiveExecutionAuthorizationDecisionIssued",
    "actualLiveExecutionAuthorizationDecisionStatus",
    "actualLiveExecutionAuthorizationDecisionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO8B_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(summary.oro8aActualLiveExecutionAuthorizationRequestPassed, true);
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationRequestSubmittedFromOro8a,
    true
  );
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationRequestStatusFromOro8a,
    ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationRequestScopeFromOro8a,
    ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionAuthorizationDecisionPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationDecisionStatus,
    ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionAuthorizationDecisionScope,
    ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8B happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8B hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
      happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySummary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
      happy
    ),
    happy
  );
  assert.deepStrictEqual(
    runOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
      happy
    ),
    happy
  );

  const heldCases = [
    [
      failOro8aAuthorizationRequestNotPassedFixture,
      "missing_passed_oro8a_actual_live_execution_authorization_request_boundary",
    ],
    [
      failOro8aAuthorizationRequestNotSubmittedFixture,
      "oro8a_actual_live_execution_authorization_request_submission_required",
    ],
    [
      failOro8aAuthorizationRequestStatusMismatchFixture,
      "invalid_oro8a_actual_live_execution_authorization_request_status",
    ],
    [
      failOro8aAuthorizationRequestScopeMismatchFixture,
      "invalid_oro8a_actual_live_execution_authorization_request_scope",
    ],
    [
      failAuthorizationDecisionNotIssuedFixture,
      "actual_live_execution_authorization_decision_issuance_required",
    ],
    [
      failAuthorizationDecisionStatusMismatchFixture,
      "invalid_actual_live_execution_authorization_decision_status",
    ],
    [
      failAuthorizationDecisionScopeMismatchFixture,
      "invalid_actual_live_execution_authorization_decision_scope",
    ],
    [failRouteEnablementFixture, "routeEnablementAllowed_not_allowed_in_oro8b"],
    [failExternalNetworkCalledFixture, "externalNetworkAllowed_not_allowed_in_oro8b"],
    [failWalletMutationFixture, "walletMutationAllowed_not_allowed_in_oro8b"],
    [failLiveExecutedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8b"],
    [
      failNextFinalExecutionGateMissingFixture,
      "separate_actual_live_execution_final_execution_gate_required_after_oro8b",
    ],
    [failSensitiveOutputFixture, "sensitive_output_not_allowed_in_oro8b"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures().map(
      evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 14, "fixture set must cover ORO-8B cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8B live traffic actual external call execution actual live execution authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8B live traffic actual external call execution actual live execution authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
