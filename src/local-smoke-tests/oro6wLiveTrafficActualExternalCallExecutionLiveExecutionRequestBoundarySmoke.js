"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary");
const fixtures = require("../game-provider-mock/oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures");

const {
  ACTIVATION_READINESS_ONLY,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
} = require("../game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const {
  NOT_REQUESTED,
  ORO_6W_LIVE_EXECUTION_REQUEST_STATUS,
  ORO_6W_PHASE,
  PASS,
  PENDING,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
  SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
  assertOro6wStillNoExternalCall,
  buildOro6wLiveExecutionRequestSummary,
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
  runOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryHarness,
  validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveExecutionAlreadyApprovedFixture,
  liveExecutionDecisionAlreadyIssuedFixture,
  liveExecutionRequestAlreadySubmittedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6vActivationFinalReadinessGateFixture,
  oro6vActivationFinalReadinessGateNotPassedFixture,
  oro6vActivationFinalReadinessStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6W =
  "docs/ORO_6W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST_BOUNDARY.md";
const DOC_6V =
  "docs/ORO_6V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6wSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6w";
const ORO6W_SECRET_SCAN_FILES = Object.freeze([
  DOC_6W,
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
  const doc6w = readRequired(DOC_6W);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6V",
    "## Actual external call execution live execution request boundary",
    "## Why request submitted still is not decision issued",
    "## Why ORO-6W still does not approve live execution",
    "## Why ORO-6W still does not execute external call",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionLiveExecutionRequestPrepared = true",
    "actualExternalCallExecutionLiveExecutionRequestSubmitted = true",
    "actualExternalCallExecutionLiveExecutionRequestStatus = submitted_pending_live_execution_decision",
    "actualExternalCallExecutionLiveExecutionDecisionIssued = false",
    "actualExternalCallExecutionLiveExecutionDecisionStatus = pending",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Live execution request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6w.includes(marker), `${DOC_6W} missing marker ${marker}.`);
  }

  const doc6v = readRequired(DOC_6V);
  for (const marker of [
    "ORO-6W live execution request boundary is required next",
    SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
    "ORO-6W still does not approve live execution",
  ]) {
    assert(doc6v.includes(marker), `${DOC_6V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6w",
    "oro-6w",
    "ORO_6W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_REQUEST_BOUNDARY.md",
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
        "ORO-6W records actual external call execution live execution request only",
        SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
        "actualExternalCallExecutionLiveExecutionApproved=false",
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
        "## ORO-6W Current",
        "live execution request only",
        SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6W current/live traffic actual external call execution live execution request boundary",
        "next phase blocked until separate live execution decision",
        SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
        "`smoke:oro-6w` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6W Live Traffic Actual External Call Execution Live Execution Request Boundary Coverage",
        "ORO-6W boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6W].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6W files must not contain ${marker}.`);
  }
  for (const file of ORO6W_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionStatus, PENDING);
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
    "liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult",
    "dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate",
    "oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed",
    "activationFinalReadinessGatePreparedFromOro6v",
    "activationFinalReadinessGateEvaluatedFromOro6v",
    "activationFinalReadinessGatePassedFromOro6v",
    "activationFinalReadinessGateStatusFromOro6v",
    "actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v",
    "actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v",
    "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v",
    "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v",
    "actualExternalCallExecutionLiveExecutionApprovedFromOro6v",
    "actualExternalCallExecutionActivatedFromOro6v",
    "actualExternalCallExecutionRuntimeEnabledFromOro6v",
    "actualExternalCallExecutionEnabledFromOro6v",
    "actualExternalCallExecutionAuthorizedFromOro6v",
    "externalCallExecutionAuthorizedFromOro6v",
    "externalCallExecutionPerformedFromOro6v",
    "externalNetworkAllowedFromOro6v",
    "liveOroPlayApiCallAllowedFromOro6v",
    "dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary",
    "oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed",
    "actualExternalCallExecutionActivationDecisionStatusFromOro6u",
    "actualExternalCallExecutionActivationDecisionScopeFromOro6u",
    "actualExternalCallExecutionLiveExecutionRequestPrepared",
    "actualExternalCallExecutionLiveExecutionRequestSubmitted",
    "actualExternalCallExecutionLiveExecutionRequestStatus",
    "actualExternalCallExecutionLiveExecutionDecisionIssued",
    "actualExternalCallExecutionLiveExecutionDecisionStatus",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision",
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
  assert.strictEqual(summary.phase, ORO_6W_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(summary.activationFinalReadinessGatePreparedFromOro6v, true);
  assert.strictEqual(summary.activationFinalReadinessGateEvaluatedFromOro6v, true);
  assert.strictEqual(summary.activationFinalReadinessGatePassedFromOro6v, true);
  assert.strictEqual(
    summary.activationFinalReadinessGateStatusFromOro6v,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v, NOT_REQUESTED);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApprovedFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivatedFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6v, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6v, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6v, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6v, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6v, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6v, false);
  assert.strictEqual(
    summary.dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionStatusFromOro6u,
    APPROVED_FOR_ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionScopeFromOro6u,
    ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionRequestStatus,
    SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
  );
  assertNoDecisionExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6W happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6W hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6W_LIVE_EXECUTION_REQUEST_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6wLiveExecutionRequestSummary, "function");
  assert.strictEqual(typeof assertOro6wStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6wLiveExecutionRequestSummary(happy), happy);
  assert.strictEqual(assertOro6wStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      missingOro6vActivationFinalReadinessGateFixture
    ),
    "ORO-6V activation final readiness gate is required"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      oro6vActivationFinalReadinessGateNotPassedFixture
    ),
    "ORO-6V activation final readiness gate must be passed"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      oro6vActivationFinalReadinessStatusWrongFixture
    ),
    "ORO-6V readiness status must allow separate live execution request"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      liveExecutionRequestAlreadySubmittedFixture
    ),
    "ORO-6V must not already submit or decide live execution"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      liveExecutionDecisionAlreadyIssuedFixture
    ),
    "ORO-6W must not issue decision or approve live execution"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      liveExecutionAlreadyApprovedFixture
    ),
    "ORO-6W must not issue decision or approve live execution"
  );
  for (const fixture of [
    actualExternalCallExecutionAlreadyActivatedFixture,
    actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionAlreadyPerformedFixture,
  ]) {
    assertHeld(
      validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
        fixture
      ),
      "ORO-6W must not activate, enable, authorize, or perform execution"
    );
  }
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during live execution request"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during live execution request"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during live execution request"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during live execution request"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
      buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary({
        id: "requestStatusWrongFixture",
        liveExecutionRequestEvidence: {
          actualExternalCallExecutionLiveExecutionRequestStatus: "submitted",
        },
      })
    ),
    "ORO-6W live execution request must be submitted pending decision"
  );

  const allReports =
    buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures().map(
      validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary
    );
  assert.strictEqual(allReports.length, 18, "fixture set must cover ORO-6W cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6W live traffic actual external call execution live execution request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6W live traffic actual external call execution live execution request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
