"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryFixtures");
const {
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
} = require("../game-provider-mock/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO8G_PHASE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
  PASS,
  buildOro8gActualLiveExecutionDecisionBoundary,
  buildOro8gActualLiveExecutionDecisionSummary,
  evaluateOro8gActualLiveExecutionDecisionBoundary,
  runOro8gActualLiveExecutionDecisionBoundary,
  validateOro8gActualLiveExecutionDecisionBoundary,
} = helper;

const {
  buildOro8gActualLiveExecutionDecisionBoundaryFixtures,
  failActualLiveExecutionAlreadyExecutedFixture,
  failActualLiveExecutionExecutionGateAlreadyIssuedFixture,
  failActualLiveExecutionExecutionGateAlreadyPassedFixture,
  failDbTransactionAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMissingOro8fRequestFixture,
  failOro8fRequestScopeMismatchFixture,
  failOro8fRequestStatusMismatchFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8F =
  "docs/ORO_8F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_8G =
  "docs/ORO_8G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8gSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-8g";
const DETAIL_SCRIPT =
  "smoke:oro-8g-actual-live-execution-decision-boundary";
const ORO8G_SCAN_FILES = Object.freeze([DOC_8F, DOC_8G, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS,
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
  const doc8f = readRequired(DOC_8F);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8E",
    "## Actual live execution request record",
    "## Actual-live-execution-request-boundary-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8F records the live traffic actual external call execution actual live",
    "ORO-8F is actual live execution request boundary only.",
    "ORO-8G follows ORO-8F as the separate actual live execution decision boundary.",
  ]) {
    assert(doc8f.includes(marker), `${DOC_8F} missing marker ${marker}.`);
  }

  const doc8g = readRequired(DOC_8G);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8F",
    "## Actual live execution decision record",
    "## Actual-live-execution-decision-boundary-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8G records the live traffic actual external call execution actual live",
    "ORO-8G is actual live execution decision boundary only.",
    "ORO-8G does not issue actual live execution execution gate.",
    "actualLiveExecutionRequestSubmittedFromOro8f = true",
    "actualLiveExecutionRequestStatusFromOro8f = submitted_for_separate_actual_live_execution_decision_only",
    "actualLiveExecutionRequestScopeFromOro8f = actual_live_execution_request_boundary_only",
    "actualLiveExecutionDecisionPrepared = true",
    "actualLiveExecutionDecisionIssued = true",
    "actualLiveExecutionDecisionStatus = approved_for_separate_actual_live_execution_execution_gate_only",
    "actualLiveExecutionDecisionScope = actual_live_execution_decision_boundary_only",
    "actualLiveExecutionExecutionGateIssued = false",
    "actualLiveExecutionExecutionGatePassed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionGate = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "dependsOnOro8fActualLiveExecutionRequestBoundary = true",
    "oro8fActualLiveExecutionRequestBoundaryPassed = true",
  ]) {
    assert(doc8g.includes(marker), `${DOC_8G} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8g",
    "oro-8g",
    "ORO_8G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_DECISION_BOUNDARY.md",
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
        "## ORO-8G Live Traffic Actual External Call Execution Actual Live Execution Decision Boundary Mapping",
        "ORO-8G records actual live execution decision only",
        ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
        ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
        "actualLiveExecutionRequestSubmittedFromOro8f=true",
        "actualLiveExecutionDecisionPrepared=true",
        "actualLiveExecutionDecisionIssued=true",
        "actualLiveExecutionDecisionStatus=approved_for_separate_actual_live_execution_execution_gate_only",
        "actualLiveExecutionDecisionScope=actual_live_execution_decision_boundary_only",
        "actualLiveExecutionExecutionGateIssued=false",
        "actualLiveExecutionExecutionGatePassed=false",
        "smoke:oro-8g",
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8G Current",
        "actual live execution decision boundary only",
        ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8G current/live traffic actual external call execution actual live execution decision",
        "actual live execution decision only",
        "`smoke:oro-8g` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8G Live Traffic Actual External Call Execution Actual Live Execution Decision Coverage",
        "ORO-8G actual live execution decision boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8F, DOC_8G].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8G files must not contain ${marker}.`);
  }
  for (const file of ORO8G_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryResult",
    "dependsOnOro8fActualLiveExecutionRequestBoundary",
    "oro8fActualLiveExecutionRequestBoundaryPassed",
    "actualLiveExecutionRequestSubmittedFromOro8f",
    "actualLiveExecutionRequestStatusFromOro8f",
    "actualLiveExecutionRequestScopeFromOro8f",
    "actualLiveExecutionDecisionPrepared",
    "actualLiveExecutionDecisionIssued",
    "actualLiveExecutionDecisionStatus",
    "actualLiveExecutionDecisionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionGate",
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
  assert.strictEqual(summary.phase, ORO8G_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8fActualLiveExecutionRequestBoundary, true);
  assert.strictEqual(summary.oro8fActualLiveExecutionRequestBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionRequestSubmittedFromOro8f, true);
  assert.strictEqual(
    summary.actualLiveExecutionRequestStatusFromOro8f,
    ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionRequestScopeFromOro8f,
    ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionDecisionPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionDecisionIssued, true);
  assert.strictEqual(summary.actualLiveExecutionDecisionStatus, ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS);
  assert.strictEqual(summary.actualLiveExecutionDecisionScope, ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE);
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionExecutionGate, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8G happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary.actualLiveExecutionDecisionPrepared, false);
  assert.strictEqual(summary.actualLiveExecutionDecisionIssued, false);
  assertNoSensitiveShape("ORO-8G hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro8gActualLiveExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof evaluateOro8gActualLiveExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof validateOro8gActualLiveExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof runOro8gActualLiveExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro8gActualLiveExecutionDecisionSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8gActualLiveExecutionDecisionBoundary(
    happyPathActualLiveExecutionDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro8gActualLiveExecutionDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro8gActualLiveExecutionDecisionBoundary(happy), happy);
  assert.deepStrictEqual(runOro8gActualLiveExecutionDecisionBoundary(happy), happy);

  const heldCases = [
    [
      failMissingOro8fRequestFixture,
      "missing_passed_oro8f_actual_live_execution_request_boundary",
    ],
    [failOro8fRequestStatusMismatchFixture, "invalid_oro8f_actual_live_execution_request_status"],
    [failOro8fRequestScopeMismatchFixture, "invalid_oro8f_actual_live_execution_request_scope"],
    [failActualLiveExecutionAlreadyExecutedFixture, "actualLiveExecutionExecuted_not_allowed_in_oro8g"],
    [
      failActualLiveExecutionExecutionGateAlreadyIssuedFixture,
      "actualLiveExecutionExecutionGateIssued_not_allowed_in_oro8g",
    ],
    [
      failActualLiveExecutionExecutionGateAlreadyPassedFixture,
      "actualLiveExecutionExecutionGatePassed_not_allowed_in_oro8g",
    ],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8g"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8g"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8g"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8g"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8g"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8g"],
    [
      failRouteEnablementExpressMountPublicAliasFixture,
      "routeEnablementAllowed_not_allowed_in_oro8g",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8g"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8gActualLiveExecutionDecisionBoundary(input), blocker);
  }

  const allReports = buildOro8gActualLiveExecutionDecisionBoundaryFixtures().map(
    evaluateOro8gActualLiveExecutionDecisionBoundary
  );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-8G.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8G live traffic actual external call execution actual live execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8G live traffic actual external call execution actual live execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
