"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures");
const {
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
} = require("../game-provider-mock/oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8E_EXECUTION_FLAGS,
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO8E_PHASE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  PASS,
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  buildOro8eActualLiveExecutionFinalExecutionDecisionSummary,
  evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  runOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
} = helper;

const {
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundaryFixtures,
  failActualLiveExecutionAlreadyApprovedFixture,
  failActualLiveExecutionAlreadyExecutedFixture,
  failActualLiveExecutionRequestAlreadySubmittedFixture,
  failDbTransactionAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMissingOro8dRequestFixture,
  failOro8dRequestScopeMismatchFixture,
  failOro8dRequestStatusMismatchFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  failWalletMutationAllowedFixture,
  happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_8E =
  "docs/ORO_8E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const DOC_8D =
  "docs/ORO_8D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro8eSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-8e";
const DETAIL_SCRIPT =
  "smoke:oro-8e-actual-live-execution-final-execution-decision-boundary";
const ORO8E_SCAN_FILES = Object.freeze([DOC_8E, BOUNDARY, FIXTURES, WRAPPER]);

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
  const doc8e = readRequired(DOC_8E);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-8D",
    "## Actual live execution final execution decision record",
    "## Actual-live-execution-final-execution-decision-boundary-only boundary",
    "## Explicit non-execution rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Safety confirmation",
    "ORO-8E records the live traffic actual external call execution actual live",
    "ORO-8E is actual live execution final execution decision boundary only.",
    "ORO-8E does not perform actual live execution.",
    "ORO-8E does not submit actual live execution request.",
    "ORO-8E does not activate runtime execution.",
    "ORO-8E does not enable runtime execution.",
    "ORO-8E does not call external networks.",
    "ORO-8E does not call live OroPlay APIs.",
    "ORO-8E does not mutate wallet or ledger.",
    "ORO-8E does not mount any route.",
    "ORO-8E does not expose public aliases.",
    "actualLiveExecutionFinalExecutionDecisionPrepared = true",
    "actualLiveExecutionFinalExecutionDecisionIssued = true",
    "actualLiveExecutionFinalExecutionDecisionStatus = approved_for_separate_actual_live_execution_request_only",
    "actualLiveExecutionFinalExecutionDecisionScope = actual_live_execution_final_execution_decision_boundary_only",
    "actualLiveExecutionRequestSubmitted = false",
    "actualLiveExecutionRequestApproved = false",
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
    "nextPhaseRequiresSeparateActualLiveExecutionRequest = true",
    "humanApprovalRequiredForActualExecution = true",
    "separateActualExecutionApprovalRequired = true",
    "dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary = true",
    "oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed = true",
    "actualLiveExecutionFinalExecutionRequestIssuedFromOro8d = true",
    "actualLiveExecutionFinalExecutionRequestStatusFromOro8d = submitted_for_separate_actual_live_execution_final_execution_decision_only",
    "actualLiveExecutionFinalExecutionRequestScopeFromOro8d = actual_live_execution_final_execution_request_boundary_only",
  ]) {
    assert(doc8e.includes(marker), `${DOC_8E} missing marker ${marker}.`);
  }

  const doc8d = readRequired(DOC_8D);
  for (const marker of [
    "ORO-8E follows ORO-8D as the separate actual live execution final execution decision boundary.",
    ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
    ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ]) {
    assert(doc8d.includes(marker), `${DOC_8D} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro8e",
    "oro-8e",
    "ORO_8E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md",
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
        "## ORO-8E Live Traffic Actual External Call Execution Actual Live Execution Final Execution Decision Boundary Mapping",
        "ORO-8E records actual live execution final execution decision only",
        ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
        ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
        "actualLiveExecutionFinalExecutionDecisionPrepared=true",
        "actualLiveExecutionFinalExecutionDecisionIssued=true",
        "actualLiveExecutionRequestSubmitted=false",
        "actualLiveExecutionRequestApproved=false",
        "actualLiveExecutionExecuted=false",
        "nextPhaseRequiresSeparateActualLiveExecutionRequest=true",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-8E Current",
        "actual live execution final execution decision boundary only",
        ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-8E current/live traffic actual external call execution actual live execution final execution decision",
        "actual live execution final execution decision only",
        "`smoke:oro-8e` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-8E Live Traffic Actual External Call Execution Actual Live Execution Final Execution Decision Coverage",
        "ORO-8E actual live execution final execution decision boundary-only package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_8E].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-8E files must not contain ${marker}.`);
  }
  for (const file of ORO8E_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  for (const key of CLOSED_ORO8E_EXECUTION_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "result",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult",
    "dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary",
    "oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed",
    "actualLiveExecutionFinalExecutionRequestIssuedFromOro8d",
    "actualLiveExecutionFinalExecutionRequestStatusFromOro8d",
    "actualLiveExecutionFinalExecutionRequestScopeFromOro8d",
    "actualLiveExecutionFinalExecutionDecisionPrepared",
    "actualLiveExecutionFinalExecutionDecisionIssued",
    "actualLiveExecutionFinalExecutionDecisionStatus",
    "actualLiveExecutionFinalExecutionDecisionScope",
    ...CLOSED_RUNTIME_AND_SAFETY_FLAGS,
    ...CLOSED_ORO8E_EXECUTION_FLAGS,
    "nextPhaseRequiresSeparateActualLiveExecutionRequest",
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
  assert.strictEqual(summary.phase, ORO8E_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary, true);
  assert.strictEqual(summary.oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionRequestIssuedFromOro8d, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestStatusFromOro8d,
    ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionRequestScopeFromOro8d,
    ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  );
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionPrepared, true);
  assert.strictEqual(summary.actualLiveExecutionFinalExecutionDecisionIssued, true);
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionStatus,
    ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualLiveExecutionFinalExecutionDecisionScope,
    ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  );
  assertClosedFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateActualLiveExecutionRequest, true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-8E happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert.strictEqual(summary.result, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-8E hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro8eActualLiveExecutionFinalExecutionDecisionSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(
    happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro8eActualLiveExecutionFinalExecutionDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(happy), happy);
  assert.deepStrictEqual(runOro8eActualLiveExecutionFinalExecutionDecisionBoundary(happy), happy);

  const heldCases = [
    [
      failMissingOro8dRequestFixture,
      "missing_passed_oro8d_actual_live_execution_final_execution_request_boundary",
    ],
    [
      failOro8dRequestStatusMismatchFixture,
      "invalid_oro8d_actual_live_execution_final_execution_request_status",
    ],
    [
      failOro8dRequestScopeMismatchFixture,
      "invalid_oro8d_actual_live_execution_final_execution_request_scope",
    ],
    [
      failActualLiveExecutionRequestAlreadySubmittedFixture,
      "actualLiveExecutionRequestSubmitted_not_allowed_in_oro8e",
    ],
    [
      failActualLiveExecutionAlreadyApprovedFixture,
      "actualLiveExecutionRequestApproved_not_allowed_in_oro8e",
    ],
    [
      failActualLiveExecutionAlreadyExecutedFixture,
      "actualLiveExecutionExecuted_not_allowed_in_oro8e",
    ],
    [failExternalNetworkAllowedFixture, "externalNetworkAllowed_not_allowed_in_oro8e"],
    [failLiveOroPlayApiCallAllowedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro8e"],
    [failWalletMutationAllowedFixture, "walletMutationAllowed_not_allowed_in_oro8e"],
    [failLedgerMutationAllowedFixture, "ledgerMutationAllowed_not_allowed_in_oro8e"],
    [failPrismaWriteAllowedFixture, "prismaWriteAllowed_not_allowed_in_oro8e"],
    [failDbTransactionAllowedFixture, "dbTransactionAllowed_not_allowed_in_oro8e"],
    [
      failRouteEnablementExpressMountPublicAliasFixture,
      "routeEnablementAllowed_not_allowed_in_oro8e",
    ],
    [failSecretLeakFixture, "sensitive_output_not_allowed_in_oro8e"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input), blocker);
  }

  const allReports =
    buildOro8eActualLiveExecutionFinalExecutionDecisionBoundaryFixtures().map(
      evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-8E cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-8E live traffic actual external call execution actual live execution final execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-8E live traffic actual external call execution actual live execution final execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
