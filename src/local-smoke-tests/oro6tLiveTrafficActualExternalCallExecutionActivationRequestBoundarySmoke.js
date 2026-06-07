"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary");
const fixtures = require("../game-provider-mock/oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures");

const {
  ORO_6T_PHASE,
  ORO_6T_ACTIVATION_REQUEST_STATUS,
  PASS,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  assertOro6tStillNoExternalCall,
  buildOro6tActivationRequestSummary,
  buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
  runOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryHarness,
  validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
} = helper;

const {
  activationDecisionAlreadyIssuedFixture,
  activationRequestAlreadySubmittedFixture,
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6sRuntimeFinalReadinessGateFixture,
  oro6sRuntimeFinalReadinessGateNotPassedFixture,
  oro6sRuntimeFinalReadinessStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6T =
  "docs/ORO_6T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md";
const DOC_6S =
  "docs/ORO_6S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6tSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6t";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_activation_request";
const APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY =
  "approved_for_runtime_execution_readiness_only";
const RUNTIME_EXECUTION_READINESS_ONLY = "runtime_execution_readiness_only";
const ORO6T_SECRET_SCAN_FILES = Object.freeze([
  DOC_6T,
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
  const doc6t = readRequired(DOC_6T);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6S",
    "## Actual external call execution activation request boundary",
    "## Why request submitted still is not decision issued",
    "## Why ORO-6T still does not activate actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionActivationRequestPrepared = true",
    "actualExternalCallExecutionActivationRequestSubmitted = true",
    "actualExternalCallExecutionActivationRequestStatus = submitted_pending_activation_decision",
    "actualExternalCallExecutionActivationDecisionIssued = false",
    "actualExternalCallExecutionActivationDecisionStatus = pending",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Activation request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6t.includes(marker), `${DOC_6T} missing marker ${marker}.`);
  }

  const doc6s = readRequired(DOC_6S);
  for (const marker of [
    "ORO-6T actual external call execution activation request boundary is required next",
    "submitted_pending_activation_decision",
    "ORO-6T still does not issue activation decision",
  ]) {
    assert(doc6s.includes(marker), `${DOC_6S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6t",
    "oro-6t",
    "ORO_6T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md",
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
        "ORO-6T records actual external call execution activation request only",
        "submitted_pending_activation_decision",
        "actualExternalCallExecutionActivationDecisionIssued=false",
        "actualExternalCallExecutionActivated=false",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6T Current",
        "submitted_pending_activation_decision",
        "activation request only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6T current/live traffic actual external call execution activation request boundary",
        "next phase blocked until separate activation decision",
        "submitted_pending_activation_decision",
        "`smoke:oro-6t` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6T Live Traffic Actual External Call Execution Activation Request Boundary Coverage",
        "ORO-6T boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6T].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6T files must not contain ${marker}.`);
  }
  for (const file of ORO6T_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionStatus, "pending");
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
    "liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult",
    "dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate",
    "oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed",
    "runtimeFinalReadinessGatePreparedFromOro6s",
    "runtimeFinalReadinessGateEvaluatedFromOro6s",
    "runtimeFinalReadinessGatePassedFromOro6s",
    "runtimeFinalReadinessGateStatusFromOro6s",
    "actualExternalCallExecutionActivationRequestPreparedFromOro6s",
    "actualExternalCallExecutionActivationRequestSubmittedFromOro6s",
    "actualExternalCallExecutionActivationDecisionIssuedFromOro6s",
    "actualExternalCallExecutionActivationDecisionStatusFromOro6s",
    "actualExternalCallExecutionActivatedFromOro6s",
    "actualExternalCallExecutionRuntimeEnabledFromOro6s",
    "actualExternalCallExecutionEnabledFromOro6s",
    "actualExternalCallExecutionAuthorizedFromOro6s",
    "externalCallExecutionAuthorizedFromOro6s",
    "externalCallExecutionPerformedFromOro6s",
    "externalNetworkAllowedFromOro6s",
    "liveOroPlayApiCallAllowedFromOro6s",
    "dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
    "oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r",
    "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r",
    "actualExternalCallExecutionActivationRequestPrepared",
    "actualExternalCallExecutionActivationRequestSubmitted",
    "actualExternalCallExecutionActivationRequestStatus",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionActivationDecisionStatus",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision",
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
  assert.strictEqual(summary.phase, ORO_6T_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(summary.runtimeFinalReadinessGatePreparedFromOro6s, true);
  assert.strictEqual(summary.runtimeFinalReadinessGateEvaluatedFromOro6s, true);
  assert.strictEqual(summary.runtimeFinalReadinessGatePassedFromOro6s, true);
  assert.strictEqual(
    summary.runtimeFinalReadinessGateStatusFromOro6s,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  );
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestPreparedFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestSubmittedFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssuedFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionStatusFromOro6s, "not_requested");
  assert.strictEqual(summary.actualExternalCallExecutionActivatedFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6s, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6s, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6s, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6s, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6s, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6s, false);
  assert.strictEqual(
    summary.dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r,
    APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r,
    RUNTIME_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestStatus,
    SUBMITTED_PENDING_ACTIVATION_DECISION
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6T happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6T hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6T_ACTIVATION_REQUEST_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6tActivationRequestSummary, "function");
  assert.strictEqual(typeof assertOro6tStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6tActivationRequestSummary(happy), happy);
  assert.strictEqual(assertOro6tStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      missingOro6sRuntimeFinalReadinessGateFixture
    ),
    "ORO-6S runtime final readiness gate is required"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      oro6sRuntimeFinalReadinessGateNotPassedFixture
    ),
    "ORO-6S runtime final readiness gate must pass"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      oro6sRuntimeFinalReadinessStatusWrongFixture
    ),
    "ORO-6S runtime final readiness status must allow activation request"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      activationRequestAlreadySubmittedFixture
    ),
    "ORO-6S must not already submit activation request or decision"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      activationDecisionAlreadyIssuedFixture
    ),
    "ORO-6T must not issue activation decision"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      actualExternalCallExecutionAlreadyActivatedFixture
    ),
    "ORO-6T must not activate actual external call execution"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6T must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6T must not enable actual external call execution"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6T must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6T must not perform external call execution"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during activation request boundary"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during activation request boundary"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during activation request boundary"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during activation request boundary"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary({
        id: "activationRequestStatusWrongFixture",
        activationRequestEvidence: {
          actualExternalCallExecutionActivationRequestStatus: "submitted",
        },
      })
    ),
    "activation request must be submitted pending activation decision"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary({
        id: "activationDecisionMissingFixture",
        activationRequestEvidence: {
          nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
            false,
        },
      })
    ),
    "next phase must require separate activation decision"
  );
  assertHeld(
    validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
      buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures().map(
      validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary
    );
  assert.strictEqual(allReports.length, 17, "fixture set must cover ORO-6T cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6T live traffic actual external call execution activation request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6T live traffic actual external call execution activation request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
