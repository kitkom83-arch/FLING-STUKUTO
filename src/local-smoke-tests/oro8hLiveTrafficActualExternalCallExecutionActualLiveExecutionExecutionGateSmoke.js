"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGate");
const fixtures = require("../game-provider-mock/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateFixtures");
const {
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
} = require("../game-provider-mock/oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8H_PRE_EXECUTION_FLAGS,
  CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO8H_PHASE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
  PASS,
  buildOro8hActualLiveExecutionExecutionGate,
  buildOro8hActualLiveExecutionExecutionGateSummary,
  evaluateOro8hActualLiveExecutionExecutionGate,
  runOro8hActualLiveExecutionExecutionGate,
  validateOro8hActualLiveExecutionExecutionGate,
} = helper;

const {
  buildOro8hActualLiveExecutionExecutionGateFixtures,
  failActualLiveExecutionAlreadyExecutedFixture,
  failDbTransactionAllowedFixture,
  failExecutionRequestAlreadyApprovedFixture,
  failExecutionRequestAlreadySubmittedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMissingOro8gDecisionFixture,
  failOro8gDecisionScopeMismatchFixture,
  failOro8gDecisionStatusMismatchFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionExecutionGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8G =
  "docs/ORO_8G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_DECISION_BOUNDARY.md";
const DOC_8H =
  "docs/ORO_8H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro8hSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGate.js";
const FIXTURES =
  "src/game-provider-mock/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateSmoke.js";
const SCRIPT = "smoke:oro-8h";
const DETAIL_SCRIPT =
  "smoke:oro-8h-actual-live-execution-execution-gate";
const ORO8H_SCAN_FILES = Object.freeze([DOC_8G, DOC_8H, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8H_PRE_EXECUTION_FLAGS,
  ...CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS,
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
  const doc8g = readRequired(DOC_8G);
  for (const marker of [
    "## Next phase requirement",
    "ORO-8H follows ORO-8G as the separate actual live execution execution gate.",
  ]) {
    assert(doc8g.includes(marker), `${DOC_8G} missing marker ${marker}.`);
  }

  const doc8h = readRequired(DOC_8H);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8G",
    "## Actual live execution execution gate record",
    "## Actual-live-execution-execution-gate-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8H records the live traffic actual external call execution actual live",
    "ORO-8H is actual live execution execution gate only.",
    "ORO-8H does not perform actual live execution.",
    "dependsOnOro8gActualLiveExecutionDecisionBoundary = true",
    "oro8gActualLiveExecutionDecisionBoundaryPassed = true",
    "actualLiveExecutionDecisionIssuedFromOro8g = true",
    "actualLiveExecutionDecisionStatusFromOro8g = approved_for_separate_actual_live_execution_execution_gate_only",
    "actualLiveExecutionDecisionScopeFromOro8g = actual_live_execution_decision_boundary_only",
    "actualLiveExecutionExecutionGatePrepared = true",
    "actualLiveExecutionExecutionGateIssued = true",
    "actualLiveExecutionExecutionGatePassed = true",
    "actualLiveExecutionExecutionGateStatus = passed_for_separate_actual_live_execution_execution_request_only",
    "actualLiveExecutionExecutionGateScope = actual_live_execution_execution_gate_only",
    "actualLiveExecutionExecutionRequestSubmitted = false",
    "actualLiveExecutionExecutionRequestApproved = false",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
  ]) {
    assert(doc8h.includes(marker), `${DOC_8H} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8h",
    "oro-8h",
    "ORO_8H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_EXECUTION_GATE.md",
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
        "## ORO-8H Live Traffic Actual External Call Execution Actual Live Execution Execution Gate Mapping",
        "ORO-8H records actual live execution execution gate only",
        ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
        ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
        "actualLiveExecutionDecisionIssuedFromOro8g=true",
        "actualLiveExecutionExecutionGatePrepared=true",
        "actualLiveExecutionExecutionGateIssued=true",
        "actualLiveExecutionExecutionGatePassed=true",
        "actualLiveExecutionExecutionGateStatus=passed_for_separate_actual_live_execution_execution_request_only",
        "actualLiveExecutionExecutionGateScope=actual_live_execution_execution_gate_only",
        "actualLiveExecutionExecutionRequestSubmitted=false",
        "actualLiveExecutionExecutionRequestApproved=false",
        "smoke:oro-8h",
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8H Current",
        "actual live execution execution gate only",
        ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8H current/live traffic actual external call execution actual live execution execution gate",
        "actual live execution execution gate only",
        "`smoke:oro-8h` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8H Live Traffic Actual External Call Execution Actual Live Execution Execution Gate Coverage",
        "ORO-8H actual live execution execution gate-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8G, DOC_8H].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8H files must not contain ${marker}.`);
  }
  for (const file of ORO8H_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateResult",
    "dependsOnOro8gActualLiveExecutionDecisionBoundary",
    "oro8gActualLiveExecutionDecisionBoundaryPassed",
    "actualLiveExecutionDecisionIssuedFromOro8g",
    "actualLiveExecutionDecisionStatusFromOro8g",
    "actualLiveExecutionDecisionScopeFromOro8g",
    "actualLiveExecutionExecutionGatePrepared",
    "actualLiveExecutionExecutionGateIssued",
    "actualLiveExecutionExecutionGatePassed",
    "actualLiveExecutionExecutionGateStatus",
    "actualLiveExecutionExecutionGateScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8H_PRE_EXECUTION_FLAGS,
    ...CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest",
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
  assert.strictEqual(summary.phase, ORO8H_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8gActualLiveExecutionDecisionBoundary, true);
  assert.strictEqual(summary.oro8gActualLiveExecutionDecisionBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionDecisionIssuedFromOro8g, true);
  assert.strictEqual(
    summary.actualLiveExecutionDecisionStatusFromOro8g,
    ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionDecisionScopeFromOro8g,
    ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionExecutionGatePrepared, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionGateIssued, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionGatePassed, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionGateStatus,
    ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionGateScope,
    ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8H happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary.actualLiveExecutionExecutionGatePrepared, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionGateIssued, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionGatePassed, false);
  assertNoSensitiveShape("ORO-8H hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro8hActualLiveExecutionExecutionGate, "function");
  assert.strictEqual(typeof evaluateOro8hActualLiveExecutionExecutionGate, "function");
  assert.strictEqual(typeof validateOro8hActualLiveExecutionExecutionGate, "function");
  assert.strictEqual(typeof runOro8hActualLiveExecutionExecutionGate, "function");
  assert.strictEqual(typeof buildOro8hActualLiveExecutionExecutionGateSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8hActualLiveExecutionExecutionGate(
    happyPathActualLiveExecutionExecutionGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro8hActualLiveExecutionExecutionGateSummary(happy), happy);
  assert.deepStrictEqual(validateOro8hActualLiveExecutionExecutionGate(happy), happy);
  assert.deepStrictEqual(runOro8hActualLiveExecutionExecutionGate(happy), happy);

  const heldCases = [
    [
      failMissingOro8gDecisionFixture,
      "missing_passed_oro8g_actual_live_execution_decision_boundary",
    ],
    [failOro8gDecisionStatusMismatchFixture, "invalid_oro8g_actual_live_execution_decision_status"],
    [failOro8gDecisionScopeMismatchFixture, "invalid_oro8g_actual_live_execution_decision_scope"],
    [failActualLiveExecutionAlreadyExecutedFixture, "actualLiveExecutionExecuted_not_allowed_in_oro8h"],
    [
      failExecutionRequestAlreadySubmittedFixture,
      "actualLiveExecutionExecutionRequestSubmitted_not_allowed_in_oro8h",
    ],
    [
      failExecutionRequestAlreadyApprovedFixture,
      "actualLiveExecutionExecutionRequestApproved_not_allowed_in_oro8h",
    ],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8h"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8h"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8h"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8h"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8h"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8h"],
    [
      failRouteEnablementExpressMountPublicAliasFixture,
      "routeEnablementAllowed_not_allowed_in_oro8h",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8h"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8hActualLiveExecutionExecutionGate(input), blocker);
  }

  const allReports = buildOro8hActualLiveExecutionExecutionGateFixtures().map(
    evaluateOro8hActualLiveExecutionExecutionGate
  );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-8H.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8H live traffic actual external call execution actual live execution execution gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8H live traffic actual external call execution actual live execution execution gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
