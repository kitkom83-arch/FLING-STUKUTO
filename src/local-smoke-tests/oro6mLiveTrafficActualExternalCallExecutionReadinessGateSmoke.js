"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6mLiveTrafficActualExternalCallExecutionReadinessGate");
const fixtures = require("../game-provider-mock/oro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures");

const {
  ORO_6M_LIVE_EXECUTION_READINESS_STATUS,
  ORO_6M_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
  assertOro6mStillNoExternalCall,
  buildOro6mLiveExecutionReadinessSummary,
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
  runOro6mLiveTrafficActualExternalCallExecutionReadinessGateHarness,
  validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures,
  enablementRequestAlreadySubmittedFixture,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6lActualExecutionDecisionFixture,
  oro6lActualExecutionDecisionNotIssuedFixture,
  oro6lDecisionScopeWrongFixture,
  oro6lDecisionStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6M =
  "docs/ORO_6M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_READINESS_GATE.md";
const DOC_6L =
  "docs/ORO_6L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6mSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6mLiveTrafficActualExternalCallExecutionReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6mLiveTrafficActualExternalCallExecutionReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6m";
const ORO6M_SECRET_SCAN_FILES = Object.freeze([
  DOC_6M,
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
  const doc6m = readRequired(DOC_6M);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6L",
    "## Live execution readiness gate",
    "ready_for_separate_actual_external_call_execution_enablement_request",
    "liveExecutionReadinessGatePassed = true",
    "actualExternalCallExecutionEnablementRequestSubmitted = false",
    "actualExternalCallExecutionEnablementDecisionIssued = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why readiness does not enable execution",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Live execution readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6m.includes(marker), `${DOC_6M} missing marker ${marker}.`);
  }

  const doc6l = readRequired(DOC_6L);
  for (const marker of [
    "ORO-6M live traffic actual external call execution readiness gate is required next",
    "ready_for_separate_actual_external_call_execution_enablement_request",
    "ORO-6M still does not submit enablement request",
  ]) {
    assert(doc6l.includes(marker), `${DOC_6L} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6m",
    "oro-6m",
    "ORO_6M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_READINESS_GATE.md",
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
        "ORO-6M records live execution readiness gate only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
        "actualExternalCallExecutionEnablementRequestSubmitted=false",
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
        "## ORO-6M Current",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
        "live execution readiness gate only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6M current/live traffic actual external call execution readiness gate",
        "next phase blocked until separate actual external call execution enablement request",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
        "`smoke:oro-6m` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6M Live Traffic Actual External Call Execution Readiness Gate Coverage",
        "ORO-6M boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6M].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6M files must not contain ${marker}.`);
  }
  for (const file of ORO6M_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoEnablementExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionEnablementRequestPrepared, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnablementRequestSubmitted, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnablementDecisionIssued, false);
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionStatus,
    "not_requested"
  );
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
    "liveTrafficActualExternalCallExecutionReadinessGateResult",
    "dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
    "oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed",
    "actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l",
    "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l",
    "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l",
    "actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l",
    "actualExternalCallExecutionAuthorizedFromOro6l",
    "externalCallExecutionAuthorizedFromOro6l",
    "externalCallExecutionPerformedFromOro6l",
    "externalNetworkAllowedFromOro6l",
    "liveOroPlayApiCallAllowedFromOro6l",
    "dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary",
    "oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed",
    "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k",
    "actualExternalCallExecutionAuthorizationRequestStatusFromOro6k",
    "liveExecutionReadinessGatePrepared",
    "liveExecutionReadinessGateEvaluated",
    "liveExecutionReadinessGatePassed",
    "liveExecutionReadinessGateStatus",
    "actualExternalCallExecutionEnablementRequestPrepared",
    "actualExternalCallExecutionEnablementRequestSubmitted",
    "actualExternalCallExecutionEnablementDecisionIssued",
    "actualExternalCallExecutionEnablementDecisionStatus",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest",
    "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision",
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
  assert.strictEqual(summary.phase, ORO_6M_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture"
  );
  assert.strictEqual(summary.liveTrafficActualExternalCallExecutionReadinessGateResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l,
    "approved_for_live_execution_readiness_only"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l,
    "live_execution_readiness_only"
  );
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6l, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6l, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6l, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6l, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6l, false);
  assert.strictEqual(
    summary.dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k,
    "submitted_pending_actual_execution_decision"
  );
  assert.strictEqual(summary.liveExecutionReadinessGatePrepared, true);
  assert.strictEqual(summary.liveExecutionReadinessGateEvaluated, true);
  assert.strictEqual(summary.liveExecutionReadinessGatePassed, true);
  assert.strictEqual(
    summary.liveExecutionReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
  );
  assertNoEnablementExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6M happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoEnablementExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6M hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6M_LIVE_EXECUTION_READINESS_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro6mLiveExecutionReadinessSummary, "function");
  assert.strictEqual(typeof assertOro6mStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6mLiveTrafficActualExternalCallExecutionReadinessGateHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6mLiveTrafficActualExternalCallExecutionReadinessGateHarness(
      happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6mLiveExecutionReadinessSummary(happy), happy);
  assert.strictEqual(assertOro6mStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      missingOro6lActualExecutionDecisionFixture
    ),
    "ORO-6L actual execution authorization decision record is required"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      oro6lActualExecutionDecisionNotIssuedFixture
    ),
    "ORO-6L decision must be readiness-only for live execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      oro6lDecisionStatusWrongFixture
    ),
    "ORO-6L decision must be readiness-only for live execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      oro6lDecisionScopeWrongFixture
    ),
    "ORO-6L decision must be readiness-only for live execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6L must still have no actual execution authorization or call"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6M must not submit enablement request, issue enablement decision, or enable execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6M must not authorize or perform actual execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      enablementRequestAlreadySubmittedFixture
    ),
    "ORO-6M must not submit enablement request, issue enablement decision, or enable execution"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during live execution readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during live execution readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during live execution readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during live execution readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent during readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak during readiness"
  );
  assertHeld(
    validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
      buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate({
        id: "wrongReadinessGateStatusFixture",
        readinessGateEvidence: {
          liveExecutionReadinessGateStatus: "ready_for_execution",
        },
      })
    ),
    "ORO-6M live execution readiness gate must pass for separate enablement request"
  );

  const allReports =
    buildOro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures().map(
      validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-6M cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoEnablementExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6M live traffic actual external call execution readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6M live traffic actual external call execution readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
