"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary");
const fixtures = require("../game-provider-mock/oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures");

const {
  ORO_6N_ACTUAL_EXECUTION_ENABLEMENT_REQUEST_STATUS,
  ORO_6N_PHASE,
  PASS,
  PENDING,
  SUBMITTED_PENDING_ENABLEMENT_DECISION,
  assertOro6nStillNoExternalCall,
  buildOro6nActualExecutionEnablementRequestSummary,
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
  runOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryHarness,
  validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures,
  enablementDecisionAlreadyIssuedFixture,
  enablementRequestAlreadySubmittedFixture,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6mLiveExecutionReadinessGateFixture,
  oro6mLiveExecutionReadinessGateNotPassedFixture,
  oro6mLiveExecutionReadinessStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6N =
  "docs/ORO_6N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST_BOUNDARY.md";
const DOC_6M =
  "docs/ORO_6M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6nSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6n";
const ORO6N_SECRET_SCAN_FILES = Object.freeze([
  DOC_6N,
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
  const doc6n = readRequired(DOC_6N);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6M",
    "## Actual external call execution enablement request boundary",
    "submitted_pending_enablement_decision",
    "actualExternalCallExecutionEnablementRequestSubmitted = true",
    "actualExternalCallExecutionEnablementDecisionIssued = false",
    "actualExternalCallExecutionEnablementDecisionStatus = pending",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why request submission does not enable execution",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Actual execution enablement request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6n.includes(marker), `${DOC_6N} missing marker ${marker}.`);
  }

  const doc6m = readRequired(DOC_6M);
  for (const marker of [
    "ORO-6N actual external call execution enablement request boundary is required next",
    "submitted_pending_enablement_decision",
    "ORO-6N still does not issue enablement decision",
  ]) {
    assert(doc6m.includes(marker), `${DOC_6M} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6n",
    "oro-6n",
    "ORO_6N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ENABLEMENT_REQUEST_BOUNDARY.md",
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
        "ORO-6N records actual external call execution enablement request only",
        SUBMITTED_PENDING_ENABLEMENT_DECISION,
        "actualExternalCallExecutionEnablementRequestSubmitted=true",
        "actualExternalCallExecutionEnablementDecisionIssued=false",
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
        "## ORO-6N Current",
        SUBMITTED_PENDING_ENABLEMENT_DECISION,
        "actual execution enablement request only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6N current/live traffic actual external call execution enablement request boundary",
        "next phase blocked until separate actual external call execution enablement decision",
        SUBMITTED_PENDING_ENABLEMENT_DECISION,
        "`smoke:oro-6n` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6N Live Traffic Actual External Call Execution Enablement Request Boundary Coverage",
        "ORO-6N boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6N].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6N files must not contain ${marker}.`);
  }
  for (const file of ORO6N_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionEnablementDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnablementDecisionStatus, PENDING);
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
    "liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult",
    "dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate",
    "oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed",
    "liveExecutionReadinessGatePreparedFromOro6m",
    "liveExecutionReadinessGateEvaluatedFromOro6m",
    "liveExecutionReadinessGatePassedFromOro6m",
    "liveExecutionReadinessGateStatusFromOro6m",
    "actualExternalCallExecutionEnablementRequestPreparedFromOro6m",
    "actualExternalCallExecutionEnablementRequestSubmittedFromOro6m",
    "actualExternalCallExecutionEnablementDecisionIssuedFromOro6m",
    "actualExternalCallExecutionEnablementDecisionStatusFromOro6m",
    "actualExternalCallExecutionEnabledFromOro6m",
    "actualExternalCallExecutionAuthorizedFromOro6m",
    "externalCallExecutionAuthorizedFromOro6m",
    "externalCallExecutionPerformedFromOro6m",
    "externalNetworkAllowedFromOro6m",
    "liveOroPlayApiCallAllowedFromOro6m",
    "dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
    "oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed",
    "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l",
    "actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l",
    "actualExternalCallExecutionEnablementRequestPrepared",
    "actualExternalCallExecutionEnablementRequestSubmitted",
    "actualExternalCallExecutionEnablementRequestStatus",
    "actualExternalCallExecutionEnablementDecisionIssued",
    "actualExternalCallExecutionEnablementDecisionStatus",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
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
  assert.strictEqual(summary.phase, ORO_6N_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed,
    true
  );
  assert.strictEqual(summary.liveExecutionReadinessGatePreparedFromOro6m, true);
  assert.strictEqual(summary.liveExecutionReadinessGateEvaluatedFromOro6m, true);
  assert.strictEqual(summary.liveExecutionReadinessGatePassedFromOro6m, true);
  assert.strictEqual(
    summary.liveExecutionReadinessGateStatusFromOro6m,
    "ready_for_separate_actual_external_call_execution_enablement_request"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestPreparedFromOro6m,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestSubmittedFromOro6m,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionIssuedFromOro6m,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionStatusFromOro6m,
    "not_requested"
  );
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6m, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6m, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6m, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6m, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6m, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6m, false);
  assert.strictEqual(
    summary.dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed,
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
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestStatus,
    SUBMITTED_PENDING_ENABLEMENT_DECISION
  );
  assertNoDecisionExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6N happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6N hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO_6N_ACTUAL_EXECUTION_ENABLEMENT_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro6nActualExecutionEnablementRequestSummary,
    "function"
  );
  assert.strictEqual(typeof assertOro6nStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro6nActualExecutionEnablementRequestSummary(happy),
    happy
  );
  assert.strictEqual(assertOro6nStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      missingOro6mLiveExecutionReadinessGateFixture
    ),
    "ORO-6M live execution readiness gate is required"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      oro6mLiveExecutionReadinessGateNotPassedFixture
    ),
    "ORO-6M live execution readiness gate is required"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      oro6mLiveExecutionReadinessStatusWrongFixture
    ),
    "ORO-6M readiness status must allow separate enablement request"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      enablementRequestAlreadySubmittedFixture
    ),
    "ORO-6M must not already submit or decide enablement"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      enablementDecisionAlreadyIssuedFixture
    ),
    "ORO-6N must not issue enablement decision"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6N must not enable actual external call execution"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6N must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6N must not perform external call execution"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during enablement request"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during enablement request"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during enablement request"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during enablement request"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary({
        id: "dbTransactionAccidentallyAllowedFixture",
        safetyEvidence: {
          dbTransactionAllowed: true,
        },
      })
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );
  assertHeld(
    validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
      buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary({
        id: "requestStatusWrongFixture",
        requestEvidence: {
          actualExternalCallExecutionEnablementRequestStatus: "draft",
        },
      })
    ),
    "ORO-6N enablement request must be submitted pending decision"
  );

  const allReports =
    buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures().map(
      validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-6N cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6N live traffic actual external call execution enablement request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6N live traffic actual external call execution enablement request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
