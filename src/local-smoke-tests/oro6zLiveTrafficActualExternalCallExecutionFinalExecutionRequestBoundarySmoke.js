"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures");

const {
  FINAL_READINESS_ONLY,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
} = require("../game-provider-mock/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate");

const {
  FINAL_EXECUTION_REQUEST_ONLY,
  ORO6Z_FINAL_EXECUTION_REQUEST_BOUNDARY_STATUS,
  ORO_6Z_PHASE,
  PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
  buildOro6zFinalExecutionRequestInput,
  buildOro6zFinalExecutionRequestSummary,
  evaluateOro6zFinalExecutionRequestBoundary,
  validateOro6zFinalExecutionRequestContract,
} = helper;

const {
  buildOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures,
  failActualExecutionApprovedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failFinalExecutionDecisionAlreadyIssuedFixture,
  failFinalExecutionRequestWithoutHumanApprovalRequirementFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro6yFinalReadinessGateFixture,
  failOro6yFinalReadinessGateNotPassedFixture,
  failOro6yFinalReadinessGateStatusNotReadyFixture,
  failPrismaWriteAllowedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6Z =
  "docs/ORO_6Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_6Y =
  "docs/ORO_6Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6zSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6z";
const ORO6Z_SECRET_SCAN_FILES = Object.freeze([
  DOC_6Z,
  BOUNDARY,
  FIXTURES,
  SMOKE,
  WRAPPER,
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
  const joinedMarkers = [
    ["to", "ken"].join(""),
    ["be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of joinedMarkers) {
    assert(!scanned.includes(marker), `${label} includes sensitive marker ${marker}.`);
  }
  assert(
    !/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned),
    `${label} includes compact credential shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes credential URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc6z = readRequired(DOC_6Z);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6Y",
    "## Final execution request boundary",
    "## Why this still is not execution approval",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionFinalExecutionRequestPrepared = true",
    "actualExternalCallExecutionFinalExecutionRequestSubmitted = true",
    "actualExternalCallExecutionFinalExecutionRequestStatus = submitted_pending_actual_external_call_execution_decision",
    "actualExternalCallExecutionFinalExecutionRequestScope = final_execution_request_only",
    "actualExternalCallExecutionFinalExecutionDecisionIssued = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Final execution request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6z.includes(marker), `${DOC_6Z} missing marker ${marker}.`);
  }

  const doc6y = readRequired(DOC_6Y);
  for (const marker of [
    "ORO-6Z final execution request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
    FINAL_EXECUTION_REQUEST_ONLY,
  ]) {
    assert(doc6y.includes(marker), `${DOC_6Y} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6z",
    "oro-6z",
    "ORO_6Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md",
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
        "ORO-6Z records actual external call execution final execution request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
        FINAL_EXECUTION_REQUEST_ONLY,
        "actualExternalCallExecutionFinalExecutionDecisionIssued=false",
        "actualExternalCallExecutionLiveExecutionApproved=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6Z Current",
        "final execution request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6Z current/live traffic actual external call execution final execution request boundary",
        "final execution request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
        "`smoke:oro-6z` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6Z Live Traffic Actual External Call Execution Final Execution Request Boundary Coverage",
        "ORO-6Z boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6Z].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6Z files must not contain ${marker}.`);
  }
  for (const file of ORO6Z_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoApprovalExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApproved, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivated, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorized, false);
  assert.strictEqual(summary.externalCallExecutionAuthorized, false);
  assert.strictEqual(summary.externalCallExecutionPerformed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.walletMutationPerformed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationPerformed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.prismaWritePerformed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.dbTransactionPerformed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.migrationPerformed, false);
  assert.strictEqual(summary.deployAllowed, false);
  assert.strictEqual(summary.deployPerformed, false);
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult",
    "dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate",
    "oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y",
    "actualExternalCallExecutionFinalExecutionRequestPrepared",
    "actualExternalCallExecutionFinalExecutionRequestSubmitted",
    "actualExternalCallExecutionFinalExecutionRequestStatus",
    "actualExternalCallExecutionFinalExecutionRequestScope",
    "actualExternalCallExecutionFinalExecutionDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "walletMutationAllowed",
    "walletMutationPerformed",
    "ledgerMutationAllowed",
    "ledgerMutationPerformed",
    "prismaWriteAllowed",
    "prismaWritePerformed",
    "dbTransactionAllowed",
    "dbTransactionPerformed",
    "migrationAllowed",
    "migrationPerformed",
    "deployAllowed",
    "deployPerformed",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_6Z_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y,
    FINAL_READINESS_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionRequestScope,
    FINAL_EXECUTION_REQUEST_ONLY
  );
  assertNoApprovalExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6Z happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoApprovalExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6Z hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6Z_FINAL_EXECUTION_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro6zFinalExecutionRequestInput, "function");
  assert.strictEqual(typeof evaluateOro6zFinalExecutionRequestBoundary, "function");
  assert.strictEqual(typeof buildOro6zFinalExecutionRequestSummary, "function");
  assert.strictEqual(typeof validateOro6zFinalExecutionRequestContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro6zFinalExecutionRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6zFinalExecutionRequestSummary(happy), happy);
  assert.deepStrictEqual(validateOro6zFinalExecutionRequestContract(happy), happy);

  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failMissingOro6yFinalReadinessGateFixture),
    "ORO-6Y final readiness gate dependency is required"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failOro6yFinalReadinessGateNotPassedFixture),
    "ORO-6Y final readiness gate must have passed"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failOro6yFinalReadinessGateStatusNotReadyFixture),
    "ORO-6Y final readiness gate must be ready for final request"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(
      failFinalExecutionRequestWithoutHumanApprovalRequirementFixture
    ),
    "final execution request must require separate human approval"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failFinalExecutionDecisionAlreadyIssuedFixture),
    "final execution decision must not be issued in ORO-6Z"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failActualExecutionApprovedFixture),
    "ORO-6Z must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during final execution request"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during final execution request"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during final execution request"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during final execution request"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro6zFinalExecutionRequestBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures().map(
      evaluateOro6zFinalExecutionRequestBoundary
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-6Z cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoApprovalExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6Z live traffic actual external call execution final execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6Z live traffic actual external call execution final execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
