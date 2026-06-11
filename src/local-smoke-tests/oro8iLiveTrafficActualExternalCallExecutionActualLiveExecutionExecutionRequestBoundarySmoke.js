"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryFixtures");
const {
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
} = require("../game-provider-mock/oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGate");

const {
  CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO8I_PHASE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
  PASS,
  buildOro8iActualLiveExecutionExecutionRequestBoundary,
  buildOro8iActualLiveExecutionExecutionRequestBoundarySummary,
  evaluateOro8iActualLiveExecutionExecutionRequestBoundary,
  runOro8iActualLiveExecutionExecutionRequestBoundary,
  validateOro8iActualLiveExecutionExecutionRequestBoundary,
} = helper;

const {
  buildOro8iActualLiveExecutionExecutionRequestBoundaryFixtures,
  failApiBalanceAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failDbTransactionAllowedFixture,
  failExecutionRequestApprovesExecutionFixture,
  failExecutionRequestExecutesLiveCallFixture,
  failExpressMountAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failOro8hDependencyMissingFixture,
  failOro8hExecutionGateNotPassedFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionExecutionRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8H =
  "docs/ORO_8H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE.md";
const DOC_8I =
  "docs/ORO_8I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8iSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-8i";
const DETAIL_SCRIPT =
  "smoke:oro-8i-actual-live-execution-execution-request-boundary";
const ORO8I_SCAN_FILES = Object.freeze([DOC_8H, DOC_8I, BOUNDARY, FIXTURES, WRAPPER]);
const FALSE_FLAGS = Object.freeze([
  ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ...CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS,
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
  const doc8h = readRequired(DOC_8H);
  for (const marker of [
    "## Next phase requirement",
    "ORO-8I follows ORO-8H as the separate actual live execution execution request boundary.",
  ]) {
    assert(doc8h.includes(marker), `${DOC_8H} missing marker ${marker}.`);
  }

  const doc8i = readRequired(DOC_8I);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8H",
    "## Actual live execution execution request record",
    "## Actual-live-execution-execution-request-boundary-only",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-8I creates static/mock actual live execution execution request evidence only.",
    "dependsOnOro8hActualLiveExecutionExecutionGate = true",
    "oro8hActualLiveExecutionExecutionGatePassed = true",
    "actualLiveExecutionExecutionGateIssuedFromOro8h = true",
    "actualLiveExecutionExecutionGateStatusFromOro8h = passed_for_separate_actual_live_execution_execution_request_only",
    "actualLiveExecutionExecutionGateScopeFromOro8h = actual_live_execution_execution_gate_only",
    "actualLiveExecutionExecutionRequestPrepared = true",
    "actualLiveExecutionExecutionRequestIssued = true",
    "actualLiveExecutionExecutionRequestSubmitted = true",
    "actualLiveExecutionExecutionRequestPassed = true",
    "actualLiveExecutionExecutionRequestStatus = submitted_for_separate_actual_live_execution_execution_approval_only",
    "actualLiveExecutionExecutionRequestScope = actual_live_execution_execution_request_boundary_only",
    "actualLiveExecutionExecutionApproved = false",
    "actualLiveExecutionExecuted = false",
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
  ]) {
    assert(doc8i.includes(marker), `${DOC_8I} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro8i",
    "oro-8i",
    "ORO_8I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_BOUNDARY.md",
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
        "## ORO-8I Live Traffic Actual External Call Execution Actual Live Execution Execution Request Boundary Mapping",
        "ORO-8I records actual live execution execution request boundary only",
        ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
        ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
        ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
        ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
        "actualLiveExecutionExecutionRequestSubmitted=true",
        "actualLiveExecutionExecutionApproved=false",
        "actualLiveExecutionExecuted=false",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8I Current",
        "actual live execution execution request boundary only",
        ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8I current/live traffic actual external call execution actual live execution execution request boundary",
        "actual live execution execution request boundary only",
        "`smoke:oro-8i` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8I Live Traffic Actual External Call Execution Actual Live Execution Execution Request Boundary Coverage",
        "ORO-8I actual live execution execution request-boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8H, DOC_8I].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8I files must not contain ${marker}.`);
  }
  for (const file of ORO8I_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryResult",
    "dependsOnOro8hActualLiveExecutionExecutionGate",
    "oro8hActualLiveExecutionExecutionGatePassed",
    "actualLiveExecutionExecutionGateIssuedFromOro8h",
    "actualLiveExecutionExecutionGateStatusFromOro8h",
    "actualLiveExecutionExecutionGateScopeFromOro8h",
    "actualLiveExecutionExecutionRequestPrepared",
    "actualLiveExecutionExecutionRequestIssued",
    "actualLiveExecutionExecutionRequestSubmitted",
    "actualLiveExecutionExecutionRequestPassed",
    "actualLiveExecutionExecutionRequestStatus",
    "actualLiveExecutionExecutionRequestScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval",
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
  assert.strictEqual(summary.phase, ORO8I_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8hActualLiveExecutionExecutionGate, true);
  assert.strictEqual(summary.oro8hActualLiveExecutionExecutionGatePassed, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionGateIssuedFromOro8h, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionGateStatusFromOro8h,
    ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionGateScopeFromOro8h,
    ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestIssued, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestSubmitted, true);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestPassed, true);
  assert.strictEqual(
    summary.actualLiveExecutionExecutionRequestStatus,
    ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionExecutionRequestScope,
    ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8I happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestPrepared, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestIssued, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestSubmitted, false);
  assert.strictEqual(summary.actualLiveExecutionExecutionRequestPassed, false);
  assertNoSensitiveShape("ORO-8I hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro8iActualLiveExecutionExecutionRequestBoundary, "function");
  assert.strictEqual(typeof evaluateOro8iActualLiveExecutionExecutionRequestBoundary, "function");
  assert.strictEqual(typeof validateOro8iActualLiveExecutionExecutionRequestBoundary, "function");
  assert.strictEqual(typeof runOro8iActualLiveExecutionExecutionRequestBoundary, "function");
  assert.strictEqual(
    typeof buildOro8iActualLiveExecutionExecutionRequestBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8iActualLiveExecutionExecutionRequestBoundary(
    happyPathActualLiveExecutionExecutionRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8iActualLiveExecutionExecutionRequestBoundarySummary(happy),
    happy
  );
  assert.deepStrictEqual(validateOro8iActualLiveExecutionExecutionRequestBoundary(happy), happy);
  assert.deepStrictEqual(runOro8iActualLiveExecutionExecutionRequestBoundary(happy), happy);

  const heldCases = [
    [
      failOro8hDependencyMissingFixture,
      "missing_passed_oro8h_actual_live_execution_execution_gate",
    ],
    [
      failOro8hExecutionGateNotPassedFixture,
      "missing_passed_oro8h_actual_live_execution_execution_gate",
    ],
    [
      failExecutionRequestApprovesExecutionFixture,
      "actualLiveExecutionExecutionApproved_not_allowed_in_oro8i",
    ],
    [
      failExecutionRequestExecutesLiveCallFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro8i",
    ],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8i"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8i"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8i"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8i"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8i"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8i"],
    [failRouteEnablementAllowedFixture, "routeEnablementAllowed_not_allowed_in_oro8i"],
    [failExpressMountAllowedFixture, "expressMountAllowed_not_allowed_in_oro8i"],
    [failPublicAliasAllowedFixture, "publicAliasAllowed_not_allowed_in_oro8i"],
    [failApiBalanceAliasAllowedFixture, "apiBalanceAliasAllowed_not_allowed_in_oro8i"],
    [failApiTransactionAliasAllowedFixture, "apiTransactionAliasAllowed_not_allowed_in_oro8i"],
    [
      failApiOroplayBalanceRouteAllowedFixture,
      "apiOroplayBalanceRouteAllowed_not_allowed_in_oro8i",
    ],
    [
      failApiOroplayTransactionRouteAllowedFixture,
      "apiOroplayTransactionRouteAllowed_not_allowed_in_oro8i",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8i"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8iActualLiveExecutionExecutionRequestBoundary(input), blocker);
  }

  const allReports = buildOro8iActualLiveExecutionExecutionRequestBoundaryFixtures().map(
    evaluateOro8iActualLiveExecutionExecutionRequestBoundary
  );
  assert.strictEqual(allReports.length, 19, "fixture set must cover ORO-8I.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8I live traffic actual external call execution actual live execution execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8I live traffic actual external call execution actual live execution execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
