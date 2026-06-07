"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures");

const {
  ORO_6S_PHASE,
  ORO_6S_RUNTIME_FINAL_READINESS_STATUS,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
  assertOro6sStillNoExternalCall,
  buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
  buildOro6sRuntimeFinalReadinessSummary,
  runOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateHarness,
  validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
} = helper;

const {
  actualExternalCallExecutionActivationRequestAlreadySubmittedFixture,
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6rRuntimeEnablementDecisionFixture,
  oro6rDecisionScopeWrongFixture,
  oro6rDecisionStatusWrongFixture,
  oro6rRuntimeEnablementDecisionNotIssuedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6S =
  "docs/ORO_6S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_FINAL_READINESS_GATE.md";
const DOC_6R =
  "docs/ORO_6R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6sSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6s";
const APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY =
  "approved_for_runtime_execution_readiness_only";
const RUNTIME_EXECUTION_READINESS_ONLY = "runtime_execution_readiness_only";
const SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION =
  "submitted_pending_runtime_enablement_decision";
const ORO6S_SECRET_SCAN_FILES = Object.freeze([
  DOC_6S,
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
  const doc6s = readRequired(DOC_6S);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6R",
    "## Runtime final readiness gate",
    "## Why approved_for_runtime_execution_readiness_only still is not actual runtime enablement",
    "## Why ORO-6S still does not submit activation request",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "runtimeFinalReadinessGatePrepared = true",
    "runtimeFinalReadinessGateEvaluated = true",
    "runtimeFinalReadinessGatePassed = true",
    `runtimeFinalReadinessGateStatus = ${READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST}`,
    "actualExternalCallExecutionActivationRequestPrepared = false",
    "actualExternalCallExecutionActivationRequestSubmitted = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Runtime final readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6s.includes(marker), `${DOC_6S} missing marker ${marker}.`);
  }

  const doc6r = readRequired(DOC_6R);
  for (const marker of [
    "ORO-6S actual external call execution runtime final readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
    "ORO-6S still does not submit activation request",
  ]) {
    assert(doc6r.includes(marker), `${DOC_6R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6s",
    "oro-6s",
    "ORO_6S_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_FINAL_READINESS_GATE.md",
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
        "ORO-6S records actual external call execution runtime final readiness gate only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
        "runtimeFinalReadinessGatePassed=true",
        "actualExternalCallExecutionActivationRequestSubmitted=false",
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
        "## ORO-6S Current",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
        "runtime final readiness gate only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6S current/live traffic actual external call execution runtime final readiness gate",
        "next phase blocked until separate activation request",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
        "`smoke:oro-6s` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6S Live Traffic Actual External Call Execution Runtime Final Readiness Gate Coverage",
        "ORO-6S boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6S].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6S files must not contain ${marker}.`);
  }
  for (const file of ORO6S_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestPrepared, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestSubmitted, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionStatus, "not_requested");
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
    "liveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateResult",
    "dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
    "oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed",
    "actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r",
    "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r",
    "actualExternalCallExecutionRuntimeEnabledFromOro6r",
    "actualExternalCallExecutionEnabledFromOro6r",
    "actualExternalCallExecutionAuthorizedFromOro6r",
    "externalCallExecutionAuthorizedFromOro6r",
    "externalCallExecutionPerformedFromOro6r",
    "externalNetworkAllowedFromOro6r",
    "liveOroPlayApiCallAllowedFromOro6r",
    "dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
    "oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q",
    "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q",
    "runtimeFinalReadinessGatePrepared",
    "runtimeFinalReadinessGateEvaluated",
    "runtimeFinalReadinessGatePassed",
    "runtimeFinalReadinessGateStatus",
    "actualExternalCallExecutionActivationRequestPrepared",
    "actualExternalCallExecutionActivationRequestSubmitted",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionActivationDecisionStatus",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest",
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
  assert.strictEqual(summary.phase, ORO_6S_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r,
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
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6r, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6r, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6r, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6r, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6r, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6r, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6r, false);
  assert.strictEqual(
    summary.dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q,
    SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
  );
  assert.strictEqual(summary.runtimeFinalReadinessGatePrepared, true);
  assert.strictEqual(summary.runtimeFinalReadinessGateEvaluated, true);
  assert.strictEqual(summary.runtimeFinalReadinessGatePassed, true);
  assert.strictEqual(
    summary.runtimeFinalReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6S happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6S hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6S_RUNTIME_FINAL_READINESS_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro6sRuntimeFinalReadinessSummary, "function");
  assert.strictEqual(typeof assertOro6sStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateHarness(
      happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6sRuntimeFinalReadinessSummary(happy), happy);
  assert.strictEqual(assertOro6sStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      missingOro6rRuntimeEnablementDecisionFixture
    ),
    "ORO-6R runtime enablement decision boundary is required"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      oro6rRuntimeEnablementDecisionNotIssuedFixture
    ),
    "ORO-6R runtime enablement decision must be issued"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      oro6rDecisionStatusWrongFixture
    ),
    "ORO-6R decision status must be approved for runtime execution readiness only"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      oro6rDecisionScopeWrongFixture
    ),
    "ORO-6R decision scope must be runtime execution readiness only"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionActivationRequestAlreadySubmittedFixture
    ),
    "ORO-6S must not submit actual external call execution activation request"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionAlreadyActivatedFixture
    ),
    "ORO-6S must not activate actual external call execution"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6S must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6S must not enable actual external call execution"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6S must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6S must not perform external call execution"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during runtime final readiness gate"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during runtime final readiness gate"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during runtime final readiness gate"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during runtime final readiness gate"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate({
        id: "runtimeFinalReadinessGateStatusWrongFixture",
        runtimeFinalReadinessGateEvidence: {
          runtimeFinalReadinessGateStatus: "not_ready",
        },
      })
    ),
    "ORO-6S runtime final readiness gate must pass for activation request readiness"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate({
        id: "oro6qRequestMissingFixture",
        oro6qRuntimeEnablementRequestEvidence: {
          dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
            false,
        },
      })
    ),
    "ORO-6Q runtime enablement request evidence is required"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate({
        id: "activationDecisionMissingFixture",
        runtimeFinalReadinessGateEvidence: {
          nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
            false,
        },
      })
    ),
    "next phase must require separate activation request and decision"
  );
  assertHeld(
    validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
      buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures().map(
      validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 17, "fixture set must cover ORO-6S cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6S live traffic actual external call execution runtime final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6S live traffic actual external call execution runtime final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
