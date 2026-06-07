"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures");

const {
  ORO_6P_FINAL_LIVE_EXECUTION_READINESS_STATUS,
  ORO_6P_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
  assertOro6pStillNoExternalCall,
  buildOro6pFinalLiveExecutionReadinessSummary,
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
  runOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateHarness,
  validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6oEnablementDecisionFixture,
  oro6oDecisionScopeWrongFixture,
  oro6oDecisionStatusWrongFixture,
  oro6oEnablementDecisionNotIssuedFixture,
  prismaWriteAccidentallyAllowedFixture,
  runtimeEnablementRequestAlreadySubmittedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6P =
  "docs/ORO_6P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_READINESS_GATE.md";
const DOC_6O =
  "docs/ORO_6O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6pSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6p";
const ORO6P_SECRET_SCAN_FILES = Object.freeze([
  DOC_6P,
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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const doc6p = readRequired(DOC_6P);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6O",
    "## Final live execution readiness gate",
    "approved_for_final_live_execution_readiness_only",
    "final_live_execution_readiness_only",
    "ready_for_separate_actual_external_call_execution_runtime_enablement_request",
    "finalLiveExecutionReadinessGatePrepared = true",
    "finalLiveExecutionReadinessGateEvaluated = true",
    "finalLiveExecutionReadinessGatePassed = true",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why final readiness-only approval still is not actual execution enablement",
    "## Why ORO-6P still does not submit runtime enablement request",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "## Final live execution readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6p.includes(marker), `${DOC_6P} missing marker ${marker}.`);
  }

  const doc6o = readRequired(DOC_6O);
  for (const marker of [
    "ORO-6P actual external call execution final readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
    "ORO-6P still does not submit runtime enablement request",
  ]) {
    assert(doc6o.includes(marker), `${DOC_6O} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6p",
    "oro-6p",
    "ORO_6P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_READINESS_GATE.md",
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
        "ORO-6P records final live execution readiness gate only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
        "finalLiveExecutionReadinessGatePassed=true",
        "actualExternalCallExecutionRuntimeEnablementRequestSubmitted=false",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionEnabled=false",
        "actualExternalCallExecutionAuthorized=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6P Current",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
        "final live execution readiness gate only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6P current/live traffic actual external call execution final readiness gate",
        "next phase blocked until separate actual external call execution runtime enablement request",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
        "`smoke:oro-6p` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6P Live Traffic Actual External Call Execution Final Readiness Gate Coverage",
        "ORO-6P boundary-specific package smoke alias",
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
  ];
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6P].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6P files must not contain ${marker}.`);
  }
  for (const file of ORO6P_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeOrExecutionFlags(summary) {
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    "not_requested"
  );
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
    "liveTrafficActualExternalCallExecutionFinalReadinessGateResult",
    "dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary",
    "oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed",
    "actualExternalCallExecutionEnablementDecisionPreparedFromOro6o",
    "actualExternalCallExecutionEnablementDecisionIssuedFromOro6o",
    "actualExternalCallExecutionEnablementDecisionStatusFromOro6o",
    "actualExternalCallExecutionEnablementDecisionScopeFromOro6o",
    "actualExternalCallExecutionEnabledFromOro6o",
    "actualExternalCallExecutionAuthorizedFromOro6o",
    "externalCallExecutionAuthorizedFromOro6o",
    "externalCallExecutionPerformedFromOro6o",
    "externalNetworkAllowedFromOro6o",
    "liveOroPlayApiCallAllowedFromOro6o",
    "dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary",
    "oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed",
    "actualExternalCallExecutionEnablementRequestSubmittedFromOro6n",
    "actualExternalCallExecutionEnablementRequestStatusFromOro6n",
    "finalLiveExecutionReadinessGatePrepared",
    "finalLiveExecutionReadinessGateEvaluated",
    "finalLiveExecutionReadinessGatePassed",
    "finalLiveExecutionReadinessGateStatus",
    "actualExternalCallExecutionRuntimeEnablementRequestPrepared",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision",
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
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_6P_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionPreparedFromOro6o,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionIssuedFromOro6o,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionStatusFromOro6o,
    "approved_for_final_live_execution_readiness_only"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionScopeFromOro6o,
    "final_live_execution_readiness_only"
  );
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6o, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6o, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6o, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6o, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6o, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6o, false);
  assert.strictEqual(
    summary.dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestStatusFromOro6n,
    "submitted_pending_enablement_decision"
  );
  assert.strictEqual(summary.finalLiveExecutionReadinessGatePrepared, true);
  assert.strictEqual(summary.finalLiveExecutionReadinessGateEvaluated, true);
  assert.strictEqual(summary.finalLiveExecutionReadinessGatePassed, true);
  assert.strictEqual(
    summary.finalLiveExecutionReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
  );
  assertNoRuntimeOrExecutionFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6P happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeOrExecutionFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6P hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO_6P_FINAL_LIVE_EXECUTION_READINESS_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof buildOro6pFinalLiveExecutionReadinessSummary,
    "function"
  );
  assert.strictEqual(typeof assertOro6pStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateHarness(
      happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro6pFinalLiveExecutionReadinessSummary(happy),
    happy
  );
  assert.strictEqual(assertOro6pStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      missingOro6oEnablementDecisionFixture
    ),
    "ORO-6O enablement decision boundary is required"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      oro6oEnablementDecisionNotIssuedFixture
    ),
    "ORO-6O enablement decision must be issued"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      oro6oDecisionStatusWrongFixture
    ),
    "ORO-6O decision status must be final readiness-only approved"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      oro6oDecisionScopeWrongFixture
    ),
    "ORO-6O decision scope must be final readiness-only"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6P must not enable actual external call execution"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6P must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6P must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6P must not perform external call execution"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      runtimeEnablementRequestAlreadySubmittedFixture
    ),
    "ORO-6P must not submit runtime enablement request"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during final readiness gate"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during final readiness gate"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during final readiness gate"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during final readiness gate"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate({
        id: "oro6nRequestMissingFixture",
        oro6nEnablementRequestEvidence: {
          dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
            false,
        },
      })
    ),
    "ORO-6N submitted enablement request evidence is required"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate({
        id: "gateStatusWrongFixture",
        finalReadinessGateEvidence: {
          finalLiveExecutionReadinessGateStatus: "runtime_enabled",
        },
      })
    ),
    "ORO-6P final readiness gate must pass for runtime enablement request"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate({
        id: "dbTransactionAccidentallyAllowedFixture",
        safetyEvidence: {
          dbTransactionAllowed: true,
        },
      })
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
      buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures().map(
      validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 16, "fixture set must cover ORO-6P cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeOrExecutionFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6P live traffic actual external call execution final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6P live traffic actual external call execution final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
