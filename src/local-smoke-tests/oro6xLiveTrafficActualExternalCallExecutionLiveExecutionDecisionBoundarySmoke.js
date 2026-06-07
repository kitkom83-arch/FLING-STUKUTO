"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures");

const {
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
} = require("../game-provider-mock/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate");

const {
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  ORO_6X_LIVE_EXECUTION_DECISION_STATUS,
  ORO_6X_PHASE,
  PASS,
  assertOro6xStillNoExternalCall,
  buildOro6xLiveExecutionDecisionSummary,
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
  runOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryHarness,
  validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveExecutionAlreadyApprovedFixture,
  liveExecutionDecisionAlreadyIssuedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6wLiveExecutionRequestFixture,
  oro6wLiveExecutionRequestNotSubmittedFixture,
  oro6wLiveExecutionRequestStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6X =
  "docs/ORO_6X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_DECISION_BOUNDARY.md";
const DOC_6W =
  "docs/ORO_6W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6xSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6x";
const SUBMITTED_PENDING_LIVE_EXECUTION_DECISION =
  "submitted_pending_live_execution_decision";
const ORO6X_SECRET_SCAN_FILES = Object.freeze([
  DOC_6X,
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
  const doc6x = readRequired(DOC_6X);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6W",
    "## Actual external call execution live execution decision boundary",
    "## Why decision issued still is live-readiness-only",
    "## Why ORO-6X still does not approve live execution",
    "## Why ORO-6X still does not execute external call",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionLiveExecutionDecisionPrepared = true",
    "actualExternalCallExecutionLiveExecutionDecisionIssued = true",
    "actualExternalCallExecutionLiveExecutionDecisionStatus = approved_for_live_execution_readiness_only",
    "actualExternalCallExecutionLiveExecutionDecisionScope = live_execution_readiness_only",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Live execution decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6x.includes(marker), `${DOC_6X} missing marker ${marker}.`);
  }

  const doc6w = readRequired(DOC_6W);
  for (const marker of [
    "ORO-6X live execution decision boundary is required next",
    APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
    LIVE_EXECUTION_READINESS_ONLY,
    "ORO-6X still does not approve live execution",
  ]) {
    assert(doc6w.includes(marker), `${DOC_6W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6x",
    "oro-6x",
    "ORO_6X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_LIVE_EXECUTION_DECISION_BOUNDARY.md",
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
        "ORO-6X records actual external call execution live execution decision only",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
        LIVE_EXECUTION_READINESS_ONLY,
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
        "## ORO-6X Current",
        "live execution decision record only",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6X current/live traffic actual external call execution live execution decision boundary",
        "live execution readiness only",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
        "`smoke:oro-6x` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6X Live Traffic Actual External Call Execution Live Execution Decision Boundary Coverage",
        "ORO-6X boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6X].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6X files must not contain ${marker}.`);
  }
  for (const file of ORO6X_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoApprovalExecutionOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryResult",
    "dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary",
    "oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed",
    "actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w",
    "actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w",
    "actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w",
    "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w",
    "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w",
    "actualExternalCallExecutionLiveExecutionApprovedFromOro6w",
    "actualExternalCallExecutionActivatedFromOro6w",
    "actualExternalCallExecutionRuntimeEnabledFromOro6w",
    "actualExternalCallExecutionEnabledFromOro6w",
    "actualExternalCallExecutionAuthorizedFromOro6w",
    "externalCallExecutionAuthorizedFromOro6w",
    "externalCallExecutionPerformedFromOro6w",
    "externalNetworkAllowedFromOro6w",
    "liveOroPlayApiCallAllowedFromOro6w",
    "dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate",
    "oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed",
    "activationFinalReadinessGateStatusFromOro6v",
    "actualExternalCallExecutionLiveExecutionDecisionPrepared",
    "actualExternalCallExecutionLiveExecutionDecisionIssued",
    "actualExternalCallExecutionLiveExecutionDecisionStatus",
    "actualExternalCallExecutionLiveExecutionDecisionScope",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate",
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
  assert.strictEqual(summary.phase, ORO_6X_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed,
    true
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w,
    SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w, "pending");
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApprovedFromOro6w, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivatedFromOro6w, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6w, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6w, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6w, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6w, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6w, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6w, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6w, false);
  assert.strictEqual(
    summary.dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.activationFinalReadinessGateStatusFromOro6v,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  );
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionDecisionStatus,
    APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionLiveExecutionDecisionScope,
    LIVE_EXECUTION_READINESS_ONLY
  );
  assertNoApprovalExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6X happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoApprovalExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6X hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6X_LIVE_EXECUTION_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6xLiveExecutionDecisionSummary, "function");
  assert.strictEqual(typeof assertOro6xStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6xLiveExecutionDecisionSummary(happy), happy);
  assert.strictEqual(assertOro6xStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      missingOro6wLiveExecutionRequestFixture
    ),
    "ORO-6W live execution request boundary is required"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      oro6wLiveExecutionRequestNotSubmittedFixture
    ),
    "ORO-6W live execution request must be submitted"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      oro6wLiveExecutionRequestStatusWrongFixture
    ),
    "ORO-6W live execution request status must be pending decision"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      liveExecutionDecisionAlreadyIssuedFixture
    ),
    "ORO-6W must still have pending decision and no live approval"
  );
  for (const fixture of [
    liveExecutionAlreadyApprovedFixture,
    actualExternalCallExecutionAlreadyActivatedFixture,
    actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionAlreadyPerformedFixture,
  ]) {
    assertHeld(
      validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
        fixture
      ),
      "ORO-6X must not approve, activate, enable, authorize, or execute"
    );
  }
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during live execution decision"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during live execution decision"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during live execution decision"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during live execution decision"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
      buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary({
        id: "decisionStatusWrongFixture",
        liveExecutionDecisionEvidence: {
          actualExternalCallExecutionLiveExecutionDecisionStatus: "approved",
        },
      })
    ),
    "ORO-6X decision must be live-readiness-only"
  );

  const allReports =
    buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures().map(
      validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary
    );
  assert.strictEqual(allReports.length, 17, "fixture set must cover ORO-6X cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoApprovalExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6X live traffic actual external call execution live execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6X live traffic actual external call execution live execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
