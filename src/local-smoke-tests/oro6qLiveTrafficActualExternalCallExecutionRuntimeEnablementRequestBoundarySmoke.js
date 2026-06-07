"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");
const fixtures = require("../game-provider-mock/oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures");

const {
  ORO_6Q_PHASE,
  ORO_6Q_RUNTIME_ENABLEMENT_REQUEST_STATUS,
  PASS,
  SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
  assertOro6qStillNoExternalCall,
  buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
  buildOro6qRuntimeEnablementRequestSummary,
  runOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryHarness,
  validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6pFinalReadinessGateFixture,
  oro6pFinalReadinessGateNotPassedFixture,
  oro6pFinalReadinessStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  runtimeEnablementDecisionAlreadyIssuedFixture,
  runtimeEnablementRequestAlreadySubmittedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6Q =
  "docs/ORO_6Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md";
const DOC_6P =
  "docs/ORO_6P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6qSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6q";
const READY_FOR_RUNTIME_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_runtime_enablement_request";
const ORO6Q_SECRET_SCAN_FILES = Object.freeze([
  DOC_6Q,
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
  const doc6q = readRequired(DOC_6Q);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6P",
    "## Actual external call execution runtime enablement request boundary",
    "submitted_pending_runtime_enablement_decision",
    READY_FOR_RUNTIME_ENABLEMENT_REQUEST,
    "actualExternalCallExecutionRuntimeEnablementRequestPrepared = true",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why request submitted still is not decision issued",
    "## Why ORO-6Q still does not enable runtime execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "## Runtime enablement request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6q.includes(marker), `${DOC_6Q} missing marker ${marker}.`);
  }

  const doc6p = readRequired(DOC_6P);
  for (const marker of [
    "ORO-6Q actual external call execution runtime enablement request boundary is required next",
    SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
    "ORO-6Q still does not issue runtime enablement decision",
  ]) {
    assert(doc6p.includes(marker), `${DOC_6P} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6q",
    "oro-6q",
    "ORO_6Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md",
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
        "ORO-6Q records actual external call execution runtime enablement request only",
        SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmitted=true",
        "actualExternalCallExecutionRuntimeEnablementDecisionIssued=false",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionEnabled=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6Q Current",
        SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
        "runtime enablement request only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6Q current/live traffic actual external call execution runtime enablement request boundary",
        "next phase blocked until separate runtime enablement decision",
        SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
        "`smoke:oro-6q` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6Q Live Traffic Actual External Call Execution Runtime Enablement Request Boundary Coverage",
        "ORO-6Q boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6Q].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6Q files must not contain ${marker}.`);
  }
  for (const file of ORO6Q_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    "pending"
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult",
    "dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate",
    "oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed",
    "finalLiveExecutionReadinessGatePreparedFromOro6p",
    "finalLiveExecutionReadinessGateEvaluatedFromOro6p",
    "finalLiveExecutionReadinessGatePassedFromOro6p",
    "finalLiveExecutionReadinessGateStatusFromOro6p",
    "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p",
    "actualExternalCallExecutionRuntimeEnabledFromOro6p",
    "actualExternalCallExecutionEnabledFromOro6p",
    "actualExternalCallExecutionAuthorizedFromOro6p",
    "externalCallExecutionAuthorizedFromOro6p",
    "externalCallExecutionPerformedFromOro6p",
    "externalNetworkAllowedFromOro6p",
    "liveOroPlayApiCallAllowedFromOro6p",
    "dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary",
    "oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed",
    "actualExternalCallExecutionEnablementDecisionStatusFromOro6o",
    "actualExternalCallExecutionEnablementDecisionScopeFromOro6o",
    "actualExternalCallExecutionRuntimeEnablementRequestPrepared",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
    "actualExternalCallExecutionRuntimeEnablementRequestStatus",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
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
  assert.strictEqual(summary.phase, ORO_6Q_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(summary.finalLiveExecutionReadinessGatePreparedFromOro6p, true);
  assert.strictEqual(summary.finalLiveExecutionReadinessGateEvaluatedFromOro6p, true);
  assert.strictEqual(summary.finalLiveExecutionReadinessGatePassedFromOro6p, true);
  assert.strictEqual(
    summary.finalLiveExecutionReadinessGateStatusFromOro6p,
    READY_FOR_RUNTIME_ENABLEMENT_REQUEST
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p,
    "not_requested"
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6p, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6p, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6p, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6p, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6p, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6p, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6p, false);
  assert.strictEqual(
    summary.dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed,
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
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestStatus,
    SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6Q happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6Q hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6Q_RUNTIME_ENABLEMENT_REQUEST_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6qRuntimeEnablementRequestSummary, "function");
  assert.strictEqual(typeof assertOro6qStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6qRuntimeEnablementRequestSummary(happy), happy);
  assert.strictEqual(assertOro6qStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      missingOro6pFinalReadinessGateFixture
    ),
    "ORO-6P final readiness gate is required"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      oro6pFinalReadinessGateNotPassedFixture
    ),
    "ORO-6P final readiness gate must pass"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      oro6pFinalReadinessStatusWrongFixture
    ),
    "ORO-6P final readiness status must be ready for runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      runtimeEnablementRequestAlreadySubmittedFixture
    ),
    "ORO-6P must not have submitted runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      runtimeEnablementDecisionAlreadyIssuedFixture
    ),
    "ORO-6Q must not issue runtime enablement decision"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6Q must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6Q must not enable actual external call execution"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6Q must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6Q must not perform external call execution"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during runtime enablement request"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary({
        id: "requestStatusWrongFixture",
        runtimeEnablementRequestEvidence: {
          actualExternalCallExecutionRuntimeEnablementRequestStatus: "draft",
        },
      })
    ),
    "ORO-6Q runtime enablement request must be submitted pending decision"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary({
        id: "oro6oDecisionMissingFixture",
        oro6oEnablementDecisionEvidence: {
          dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
            false,
        },
      })
    ),
    "ORO-6O final readiness-only decision evidence is required"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary({
        id: "dbTransactionAccidentallyAllowedFixture",
        safetyEvidence: {
          dbTransactionAllowed: true,
        },
      })
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
      buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures().map(
      validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary
    );
  assert.strictEqual(allReports.length, 16, "fixture set must cover ORO-6Q cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6Q live traffic actual external call execution runtime enablement request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6Q live traffic actual external call execution runtime enablement request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
