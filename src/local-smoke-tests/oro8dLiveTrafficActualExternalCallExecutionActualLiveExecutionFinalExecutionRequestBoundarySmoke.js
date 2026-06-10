"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures");
const {
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
} = require("../game-provider-mock/oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8D_DECISION_FLAGS,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO8D_PHASE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  PASS,
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  buildOro8dActualLiveExecutionFinalExecutionRequestSummary,
  evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  runOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
} = helper;

const {
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundaryFixtures,
  failDbTransactionAllowedFixture,
  failExpressMountOrPublicAliasAllowedFixture,
  failExternalNetworkAllowedFixture,
  failFinalExecutionDecisionAlreadyIssuedFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMissingOro8cGateFixture,
  failOro8cGateScopeMismatchFixture,
  failOro8cGateStatusMismatchFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnablementAllowedFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8D =
  "docs/ORO_8D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_8C =
  "docs/ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro8dSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-8d";
const DETAIL_SCRIPT =
  "smoke:oro-8d-actual-live-execution-final-execution-request-boundary";
const ORO8D_SCAN_FILES = Object.freeze([DOC_8D, BOUNDARY, FIXTURES, WRAPPER]);

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
  const doc8d = readRequired(DOC_8D);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8C",
    "## Actual live execution final execution request record",
    "## Actual-live-execution-final-execution-request-boundary-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Safety confirmation",
    "ORO-8D records the live traffic actual external call execution actual live",
    "ORO-8D is actual live execution final execution request boundary only.",
    "ORO-8D does not perform actual live execution.",
    "ORO-8D does not issue final execution decision.",
    "ORO-8D does not activate runtime execution.",
    "ORO-8D does not enable runtime execution.",
    "ORO-8D does not call external networks.",
    "ORO-8D does not call live OroPlay APIs.",
    "ORO-8D does not mutate wallet or ledger.",
    "ORO-8D does not mount any route.",
    "ORO-8D does not expose public aliases.",
    "actualLiveExecutionFinalExecutionRequestPrepared = true",
    "actualLiveExecutionFinalExecutionRequestIssued = true",
    "actualLiveExecutionFinalExecutionRequestStatus = submitted_for_separate_actual_live_execution_final_execution_decision_only",
    "actualLiveExecutionFinalExecutionRequestScope = actual_live_execution_final_execution_request_boundary_only",
    "actualLiveExecutionFinalExecutionDecisionIssued = false",
    "actualLiveExecutionFinalExecutionDecisionApproved = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "prismaWriteAllowed = false",
    "dbTransactionAllowed = false",
    "routeEnablementAllowed = false",
    "expressMountAllowed = false",
    "publicAliasAllowed = false",
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "dependsOnOro8cActualLiveExecutionFinalExecutionGate = true",
    "oro8cActualLiveExecutionFinalExecutionGatePassed = true",
    "actualLiveExecutionFinalExecutionGateIssuedFromOro8c = true",
    "actualLiveExecutionFinalExecutionGateStatusFromOro8c = passed_for_separate_actual_live_execution_final_execution_request_only",
    "actualLiveExecutionFinalExecutionGateScopeFromOro8c = actual_live_execution_final_execution_gate_only",
  ]) {
    assert(doc8d.includes(marker), `${DOC_8D} missing marker ${marker}.`);
  }

  const doc8c = readRequired(DOC_8C);
  for (const marker of [
    "ORO-8D follows ORO-8C as the separate actual live execution final execution request boundary.",
    ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
    ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ]) {
    assert(doc8c.includes(marker), `${DOC_8C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8d",
    "oro-8d",
    "ORO_8D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md",
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
        "## ORO-8D Live Traffic Actual External Call Execution Actual Live Execution Final Execution Request Boundary Mapping",
        "ORO-8D records actual live execution final execution request only",
        ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
        ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
        "actualLiveExecutionFinalExecutionRequestPrepared=true",
        "actualLiveExecutionFinalExecutionRequestIssued=true",
        "actualLiveExecutionFinalExecutionDecisionIssued=false",
        "actualLiveExecutionFinalExecutionDecisionApproved=false",
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8D Current",
        "actual live execution final execution request boundary only",
        ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8D current/live traffic actual external call execution actual live execution final execution request",
        "actual live execution final execution request only",
        "`smoke:oro-8d` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8D Live Traffic Actual External Call Execution Actual Live Execution Final Execution Request Coverage",
        "ORO-8D actual live execution final execution request boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8D].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8D files must not contain ${marker}.`);
  }
  for (const file of ORO8D_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  for (const key of CLOSED_ORO8D_DECISION_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult",
    "dependsOnOro8cActualLiveExecutionFinalExecutionGate",
    "oro8cActualLiveExecutionFinalExecutionGatePassed",
    "actualLiveExecutionFinalExecutionGateIssuedFromOro8c",
    "actualLiveExecutionFinalExecutionGateStatusFromOro8c",
    "actualLiveExecutionFinalExecutionGateScopeFromOro8c",
    "actualLiveExecutionFinalExecutionRequestPrepared",
    "actualLiveExecutionFinalExecutionRequestIssued",
    "actualLiveExecutionFinalExecutionRequestStatus",
    "actualLiveExecutionFinalExecutionRequestScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8D_DECISION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision",
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
  assert.strictEqual(summary.phase, ORO8D_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8cActualLiveExecutionFinalExecutionGate, true);
  assert.strictEqual(summary.oro8cActualLiveExecutionFinalExecutionGatePassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionGateIssuedFromOro8c, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateStatusFromOro8c,
    ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionGateScopeFromOro8c,
    ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestIssued, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestStatus,
    ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestScope,
    ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8D happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8D hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8dActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8dActualLiveExecutionFinalExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8dActualLiveExecutionFinalExecutionRequestSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary(
    happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro8dActualLiveExecutionFinalExecutionRequestSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro8dActualLiveExecutionFinalExecutionRequestBoundary(happy),
    happy
  );
  assert.deepStrictEqual(runOro8dActualLiveExecutionFinalExecutionRequestBoundary(happy), happy);

  const heldCases = [
    [
      failMissingOro8cGateFixture,
      "missing_passed_oro8c_actual_live_execution_final_execution_gate",
    ],
    [
      failOro8cGateStatusMismatchFixture,
      "invalid_oro8c_actual_live_execution_final_execution_gate_status",
    ],
    [
      failOro8cGateScopeMismatchFixture,
      "invalid_oro8c_actual_live_execution_final_execution_gate_scope",
    ],
    [
      failFinalExecutionDecisionAlreadyIssuedFixture,
      "actualLiveExecutionFinalExecutionDecisionIssued_not_allowed_in_oro8d",
    ],
    [
      failLiveExecutionApprovedFixture,
      "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro8d",
    ],
    [
      failExternalNetworkAllowedFixture,
      "externalNetworkAllowed_not_allowed_in_oro8d",
    ],
    [
      failLiveOroPlayApiCallAllowedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro8d",
    ],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8d"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8d"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8d"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8d"],
    [failRouteEnablementAllowedFixture, "routeEnablementAllowed_not_allowed_in_oro8d"],
    [
      failExpressMountOrPublicAliasAllowedFixture,
      "expressMountAllowed_not_allowed_in_oro8d",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8d"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary(input), blocker);
  }

  const allReports =
    buildOro8dActualLiveExecutionFinalExecutionRequestBoundaryFixtures().map(
      evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-8D cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8D live traffic actual external call execution actual live execution final execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8D live traffic actual external call execution actual live execution final execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
