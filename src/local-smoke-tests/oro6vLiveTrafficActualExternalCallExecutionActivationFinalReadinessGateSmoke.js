"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures");

const {
  ACTIVATION_READINESS_ONLY,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
} = require("../game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const {
  NOT_REQUESTED,
  ORO_6V_ACTIVATION_FINAL_READINESS_STATUS,
  ORO_6V_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
  assertOro6vStillNoExternalCall,
  buildOro6vActivationFinalReadinessSummary,
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
  runOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateHarness,
  validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
} = helper;

const {
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveExecutionDecisionAlreadyIssuedFixture,
  liveExecutionRequestAlreadySubmittedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6uActivationDecisionFixture,
  oro6uActivationDecisionNotIssuedFixture,
  oro6uActivationDecisionScopeWrongFixture,
  oro6uActivationDecisionStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6V =
  "docs/ORO_6V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_FINAL_READINESS_GATE.md";
const DOC_6U =
  "docs/ORO_6U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6vSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6v";
const SUBMITTED_PENDING_ACTIVATION_DECISION =
  "submitted_pending_activation_decision";
const ORO6V_SECRET_SCAN_FILES = Object.freeze([
  DOC_6V,
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
  const doc6v = readRequired(DOC_6V);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6U",
    "## Activation final readiness gate",
    "## Why approved_for_activation_readiness_only still is not actual execution",
    "## Why ORO-6V still does not submit live execution request",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "activationFinalReadinessGatePrepared = true",
    "activationFinalReadinessGateEvaluated = true",
    "activationFinalReadinessGatePassed = true",
    "activationFinalReadinessGateStatus = ready_for_separate_actual_external_call_execution_live_execution_request",
    "actualExternalCallExecutionLiveExecutionRequestSubmitted = false",
    "actualExternalCallExecutionLiveExecutionDecisionStatus = not_requested",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Activation final readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6v.includes(marker), `${DOC_6V} missing marker ${marker}.`);
  }

  const doc6u = readRequired(DOC_6U);
  for (const marker of [
    "ORO-6V activation final readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
    "ORO-6V still does not submit live execution request",
  ]) {
    assert(doc6u.includes(marker), `${DOC_6U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6v",
    "oro-6v",
    "ORO_6V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_FINAL_READINESS_GATE.md",
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
        "ORO-6V records activation final readiness gate evidence only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
        "actualExternalCallExecutionLiveExecutionRequestSubmitted=false",
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
        "## ORO-6V Current",
        "activation final readiness gate evidence only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6V current/live traffic actual external call execution activation final readiness gate",
        "next phase blocked until separate live execution request",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
        "`smoke:oro-6v` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6V Live Traffic Actual External Call Execution Activation Final Readiness Gate Coverage",
        "ORO-6V boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6V].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6V files must not contain ${marker}.`);
  }
  for (const file of ORO6V_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestPrepared, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionRequestSubmitted, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionDecisionStatus, NOT_REQUESTED);
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
    "liveTrafficActualExternalCallExecutionActivationFinalReadinessGateResult",
    "dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary",
    "oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed",
    "actualExternalCallExecutionActivationDecisionPreparedFromOro6u",
    "actualExternalCallExecutionActivationDecisionIssuedFromOro6u",
    "actualExternalCallExecutionActivationDecisionStatusFromOro6u",
    "actualExternalCallExecutionActivationDecisionScopeFromOro6u",
    "actualExternalCallExecutionActivatedFromOro6u",
    "actualExternalCallExecutionRuntimeEnabledFromOro6u",
    "actualExternalCallExecutionEnabledFromOro6u",
    "actualExternalCallExecutionAuthorizedFromOro6u",
    "externalCallExecutionAuthorizedFromOro6u",
    "externalCallExecutionPerformedFromOro6u",
    "externalNetworkAllowedFromOro6u",
    "liveOroPlayApiCallAllowedFromOro6u",
    "dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary",
    "oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed",
    "actualExternalCallExecutionActivationRequestSubmittedFromOro6t",
    "actualExternalCallExecutionActivationRequestStatusFromOro6t",
    "activationFinalReadinessGatePrepared",
    "activationFinalReadinessGateEvaluated",
    "activationFinalReadinessGatePassed",
    "activationFinalReadinessGateStatus",
    "actualExternalCallExecutionLiveExecutionRequestPrepared",
    "actualExternalCallExecutionLiveExecutionRequestSubmitted",
    "actualExternalCallExecutionLiveExecutionDecisionIssued",
    "actualExternalCallExecutionLiveExecutionDecisionStatus",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest",
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
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_6V_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionPreparedFromOro6u,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionIssuedFromOro6u,
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
  assert.strictEqual(summary.actualExternalCallExecutionActivatedFromOro6u, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6u, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6u, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6u, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6u, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6u, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6u, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6u, false);
  assert.strictEqual(
    summary.dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestSubmittedFromOro6t,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestStatusFromOro6t,
    SUBMITTED_PENDING_ACTIVATION_DECISION
  );
  assert.strictEqual(summary.activationFinalReadinessGatePrepared, true);
  assert.strictEqual(summary.activationFinalReadinessGateEvaluated, true);
  assert.strictEqual(summary.activationFinalReadinessGatePassed, true);
  assert.strictEqual(
    summary.activationFinalReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6V happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6V hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6V_ACTIVATION_FINAL_READINESS_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro6vActivationFinalReadinessSummary, "function");
  assert.strictEqual(typeof assertOro6vStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateHarness(
      happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6vActivationFinalReadinessSummary(happy), happy);
  assert.strictEqual(assertOro6vStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      missingOro6uActivationDecisionFixture
    ),
    "ORO-6U activation decision boundary is required"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      oro6uActivationDecisionNotIssuedFixture
    ),
    "ORO-6U activation decision must be issued"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      oro6uActivationDecisionStatusWrongFixture
    ),
    "ORO-6U decision status must be activation-readiness-only approved"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      oro6uActivationDecisionScopeWrongFixture
    ),
    "ORO-6U decision scope must be activation readiness only"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      liveExecutionRequestAlreadySubmittedFixture
    ),
    "ORO-6V must not prepare, submit, decide, or approve live execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      liveExecutionDecisionAlreadyIssuedFixture
    ),
    "ORO-6V must not prepare, submit, decide, or approve live execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      actualExternalCallExecutionAlreadyActivatedFixture
    ),
    "ORO-6V must not activate, enable, authorize, or perform execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6V must not activate, enable, authorize, or perform execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6V must not activate, enable, authorize, or perform execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6V must not activate, enable, authorize, or perform execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6V must not activate, enable, authorize, or perform execution"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during activation final readiness"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during activation final readiness"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during activation final readiness"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during activation final readiness"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate({
        id: "activationFinalReadinessStatusWrongFixture",
        activationFinalReadinessGateEvidence: {
          activationFinalReadinessGateStatus: "ready_for_live_execution",
        },
      })
    ),
    "ORO-6V activation final readiness gate must pass for live execution request"
  );
  assertHeld(
    validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
      buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures().map(
      validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 18, "fixture set must cover ORO-6V cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6V live traffic actual external call execution activation final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6V live traffic actual external call execution activation final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
