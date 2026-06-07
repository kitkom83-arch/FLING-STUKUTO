"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures");

const {
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
} = require("../game-provider-mock/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary");

const {
  FINAL_READINESS_ONLY,
  ORO6Y_LIVE_EXECUTION_FINAL_READINESS_GATE_STATUS,
  ORO_6Y_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
  buildOro6yLiveExecutionFinalReadinessGateSummary,
  buildOro6yLiveExecutionFinalReadinessInput,
  evaluateOro6yLiveExecutionFinalReadinessGate,
  validateOro6yLiveExecutionFinalReadinessGateContract,
} = helper;

const {
  buildOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures,
  failActualExecutionApprovedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro6xDecisionFixture,
  failOro6xDecisionNotReadinessOnlyFixture,
  failPrismaWriteAllowedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6Y =
  "docs/ORO_6Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_FINAL_READINESS_GATE.md";
const DOC_6X =
  "docs/ORO_6X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6ySmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6y";
const ORO6Y_SECRET_SCAN_FILES = Object.freeze([
  DOC_6Y,
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
  const doc6y = readRequired(DOC_6Y);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6X",
    "## Live execution final readiness gate",
    "## Why final readiness still is not final execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared = true",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated = true",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed = true",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus = ready_for_separate_actual_external_call_execution_final_execution_request",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateScope = final_readiness_only",
    "actualExternalCallExecutionFinalExecutionRequestSubmitted = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Final readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6y.includes(marker), `${DOC_6Y} missing marker ${marker}.`);
  }

  const doc6x = readRequired(DOC_6X);
  for (const marker of [
    "ORO-6Y final readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
    FINAL_READINESS_ONLY,
  ]) {
    assert(doc6x.includes(marker), `${DOC_6X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6y",
    "oro-6y",
    "ORO_6Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_FINAL_READINESS_GATE.md",
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
        "ORO-6Y records actual external call execution live execution final readiness only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
        FINAL_READINESS_ONLY,
        "actualExternalCallExecutionFinalExecutionRequestSubmitted=false",
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
        "## ORO-6Y Current",
        "live execution final readiness gate only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6Y current/live traffic actual external call execution live execution final readiness gate",
        "final readiness only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
        "`smoke:oro-6y` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6Y Live Traffic Actual External Call Execution Live Execution Final Readiness Gate Coverage",
        "ORO-6Y boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6Y].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6Y files must not contain ${marker}.`);
  }
  for (const file of ORO6Y_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRequestApprovalExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionRequestSubmitted, false);
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
    "liveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateResult",
    "dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary",
    "oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed",
    "actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x",
    "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x",
    "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x",
    "actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus",
    "actualExternalCallExecutionLiveExecutionFinalReadinessGateScope",
    "actualExternalCallExecutionFinalExecutionRequestSubmitted",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest",
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
  assert.strictEqual(summary.phase, ORO_6Y_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x,
    APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x,
    LIVE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateScope,
    FINAL_READINESS_ONLY
  );
  assertNoRequestApprovalExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6Y happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRequestApprovalExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6Y hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6Y_LIVE_EXECUTION_FINAL_READINESS_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro6yLiveExecutionFinalReadinessInput, "function");
  assert.strictEqual(typeof evaluateOro6yLiveExecutionFinalReadinessGate, "function");
  assert.strictEqual(typeof buildOro6yLiveExecutionFinalReadinessGateSummary, "function");
  assert.strictEqual(typeof validateOro6yLiveExecutionFinalReadinessGateContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro6yLiveExecutionFinalReadinessGate(
    happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6yLiveExecutionFinalReadinessGateSummary(happy), happy);
  assert.deepStrictEqual(validateOro6yLiveExecutionFinalReadinessGateContract(happy), happy);

  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failMissingOro6xDecisionFixture),
    "ORO-6X live execution decision boundary is required"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failOro6xDecisionNotReadinessOnlyFixture),
    "ORO-6X decision must be live-execution-readiness-only"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failActualExecutionApprovedFixture),
    "ORO-6Y must not request, approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failExternalNetworkAllowedFixture),
    "external network must remain absent during final readiness"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during final readiness"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during final readiness"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during final readiness"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro6yLiveExecutionFinalReadinessGate(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures().map(
      evaluateOro6yLiveExecutionFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 12, "fixture set must cover ORO-6Y cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRequestApprovalExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6Y live traffic actual external call execution live execution final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6Y live traffic actual external call execution live execution final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
