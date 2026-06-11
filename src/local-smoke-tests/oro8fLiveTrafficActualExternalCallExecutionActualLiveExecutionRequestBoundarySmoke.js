"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryFixtures");
const {
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
} = require("../game-provider-mock/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO8F_PHASE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
  PASS,
  buildOro8fActualLiveExecutionRequestBoundary,
  buildOro8fActualLiveExecutionRequestBoundarySummary,
  evaluateOro8fActualLiveExecutionRequestBoundary,
  runOro8fActualLiveExecutionRequestBoundary,
  validateOro8fActualLiveExecutionRequestBoundary,
} = helper;

const {
  buildOro8fActualLiveExecutionRequestBoundaryFixtures,
  failActualLiveExecutionAlreadyExecutedFixture,
  failActualLiveExecutionDecisionAlreadyApprovedFixture,
  failActualLiveExecutionDecisionAlreadyIssuedFixture,
  failDbTransactionAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMissingOro8eDecisionFixture,
  failOro8eDecisionScopeMismatchFixture,
  failOro8eDecisionStatusMismatchFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8F =
  "docs/ORO_8F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_8E =
  "docs/ORO_8E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8fSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-8f";
const DETAIL_SCRIPT =
  "smoke:oro-8f-actual-live-execution-request-boundary";
const ORO8F_SCAN_FILES = Object.freeze([DOC_8F, BOUNDARY, FIXTURES, WRAPPER]);

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
    "ORO-8F does not perform actual live execution.",
    "ORO-8F does not issue actual live execution decision.",
    "ORO-8F does not activate runtime execution.",
    "ORO-8F does not enable runtime execution.",
    "ORO-8F does not call external networks.",
    "ORO-8F does not call live OroPlay APIs.",
    "ORO-8F does not mutate wallet or ledger.",
    "ORO-8F does not mount any route.",
    "ORO-8F does not expose public aliases.",
    "actualLiveExecutionRequestPrepared = true",
    "actualLiveExecutionRequestSubmitted = true",
    "actualLiveExecutionRequestStatus = submitted_for_separate_actual_live_execution_decision_only",
    "actualLiveExecutionRequestScope = actual_live_execution_request_boundary_only",
    "actualLiveExecutionDecisionIssued = false",
    "actualLiveExecutionDecisionApproved = false",
    "actualLiveExecutionExecuted = false",
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
    "nextPhaseRequiresSeparateActualLiveExecutionDecision = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary = true",
    "oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e = true",
    "actualLiveExecutionFinalExecutionDecisionStatusFromOro8e = approved_for_separate_actual_live_execution_request_only",
    "actualLiveExecutionFinalExecutionDecisionScopeFromOro8e = actual_live_execution_final_execution_decision_boundary_only",
  ]) {
    assert(doc8f.includes(marker), `${DOC_8F} missing marker ${marker}.`);
  }

  const doc8e = readRequired(DOC_8E);
  for (const marker of [
    "ORO-8F follows ORO-8E as the separate actual live execution request boundary.",
  ]) {
    assert(doc8e.includes(marker), `${DOC_8E} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8f",
    "oro-8f",
    "ORO_8F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_REQUEST_BOUNDARY.md",
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
        "## ORO-8F Live Traffic Actual External Call Execution Actual Live Execution Request Boundary Mapping",
        "ORO-8F records actual live execution request only",
        ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
        ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
        "actualLiveExecutionRequestPrepared=true",
        "actualLiveExecutionRequestSubmitted=true",
        "actualLiveExecutionRequestApproved=false",
        "actualLiveExecutionDecisionIssued=false",
        "actualLiveExecutionDecisionApproved=false",
        "actualLiveExecutionExecuted=false",
        "nextPhaseRequiresSeparateActualLiveExecutionDecision=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8F Current",
        "actual live execution request boundary only",
        ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8F current/live traffic actual external call execution actual live execution request",
        "actual live execution request only",
        "`smoke:oro-8f` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8F Live Traffic Actual External Call Execution Actual Live Execution Request Coverage",
        "ORO-8F actual live execution request boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8F].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8F files must not contain ${marker}.`);
  }
  for (const file of ORO8F_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  for (const key of CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryResult",
    "dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary",
    "oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed",
    "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e",
    "actualLiveExecutionFinalExecutionDecisionStatusFromOro8e",
    "actualLiveExecutionFinalExecutionDecisionScopeFromOro8e",
    "actualLiveExecutionRequestPrepared",
    "actualLiveExecutionRequestSubmitted",
    "actualLiveExecutionRequestApproved",
    "actualLiveExecutionRequestStatus",
    "actualLiveExecutionRequestScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionDecision",
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
  assert.strictEqual(summary.phase, ORO8F_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(summary.oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionStatusFromOro8e,
    ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionScopeFromOro8e,
    ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionRequestSubmitted, true);
  assert.strictEqual(summary.actualLiveExecutionRequestApproved, false);
  assert.strictEqual(
    summary.actualLiveExecutionRequestStatus,
    ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionRequestScope,
    ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionDecision, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8F happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8F hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro8fActualLiveExecutionRequestBoundary, "function");
  assert.strictEqual(typeof evaluateOro8fActualLiveExecutionRequestBoundary, "function");
  assert.strictEqual(typeof validateOro8fActualLiveExecutionRequestBoundary, "function");
  assert.strictEqual(typeof runOro8fActualLiveExecutionRequestBoundary, "function");
  assert.strictEqual(typeof buildOro8fActualLiveExecutionRequestBoundarySummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8fActualLiveExecutionRequestBoundary(
    happyPathActualLiveExecutionRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro8fActualLiveExecutionRequestBoundarySummary(happy), happy);
  assert.deepStrictEqual(validateOro8fActualLiveExecutionRequestBoundary(happy), happy);
  assert.deepStrictEqual(runOro8fActualLiveExecutionRequestBoundary(happy), happy);

  const heldCases = [
    [
      failMissingOro8eDecisionFixture,
      "missing_passed_oro8e_actual_live_execution_final_execution_decision_boundary",
    ],
    [failOro8eDecisionStatusMismatchFixture, "invalid_oro8e_actual_live_execution_final_execution_decision_status"],
    [failOro8eDecisionScopeMismatchFixture, "invalid_oro8e_actual_live_execution_final_execution_decision_scope"],
    [failActualLiveExecutionDecisionAlreadyIssuedFixture, "actualLiveExecutionDecisionIssued_not_allowed_in_oro8f"],
    [failActualLiveExecutionDecisionAlreadyApprovedFixture, "actualLiveExecutionDecisionApproved_not_allowed_in_oro8f"],
    [failActualLiveExecutionAlreadyExecutedFixture, "actualLiveExecutionExecuted_not_allowed_in_oro8f"],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8f"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8f"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8f"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8f"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8f"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8f"],
    [
      failRouteEnablementExpressMountPublicAliasFixture,
      "routeEnablementAllowed_not_allowed_in_oro8f",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8f"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8fActualLiveExecutionRequestBoundary(input), blocker);
  }

  const allReports = buildOro8fActualLiveExecutionRequestBoundaryFixtures().map(
    evaluateOro8fActualLiveExecutionRequestBoundary
  );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-8F.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8F live traffic actual external call execution actual live execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8F live traffic actual external call execution actual live execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
