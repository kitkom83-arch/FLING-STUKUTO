"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures");

const {
  ACTIVATION_READINESS_ONLY,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ORO_6U_ACTIVATION_DECISION_STATUS,
  ORO_6U_PHASE,
  PASS,
  assertOro6uStillNoExternalCall,
  buildOro6uActivationDecisionSummary,
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
  runOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryHarness,
  validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
} = helper;

const {
  activationDecisionAlreadyIssuedFixture,
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6tActivationRequestFixture,
  oro6tActivationRequestNotSubmittedFixture,
  oro6tActivationRequestStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6U =
  "docs/ORO_6U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION_BOUNDARY.md";
const DOC_6T =
  "docs/ORO_6T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6uSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6u";
const SUBMITTED_PENDING_ACTIVATION_DECISION =
  "submitted_pending_activation_decision";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_activation_request";
const ORO6U_SECRET_SCAN_FILES = Object.freeze([
  DOC_6U,
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
  const doc6u = readRequired(DOC_6U);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6T",
    "## Actual external call execution activation decision boundary",
    "## Why decision issued still is activation-readiness-only",
    "## Why ORO-6U still does not activate actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionActivationDecisionPrepared = true",
    "actualExternalCallExecutionActivationDecisionIssued = true",
    "actualExternalCallExecutionActivationDecisionStatus = approved_for_activation_readiness_only",
    "actualExternalCallExecutionActivationDecisionScope = activation_readiness_only",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Activation decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6u.includes(marker), `${DOC_6U} missing marker ${marker}.`);
  }

  const doc6t = readRequired(DOC_6T);
  for (const marker of [
    "ORO-6U actual external call execution activation decision boundary is required next",
    APPROVED_FOR_ACTIVATION_READINESS_ONLY,
    "ORO-6U still does not activate actual execution",
  ]) {
    assert(doc6t.includes(marker), `${DOC_6T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6u",
    "oro-6u",
    "ORO_6U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_DECISION_BOUNDARY.md",
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
        "ORO-6U records actual external call execution activation decision record only",
        APPROVED_FOR_ACTIVATION_READINESS_ONLY,
        ACTIVATION_READINESS_ONLY,
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
        "## ORO-6U Current",
        APPROVED_FOR_ACTIVATION_READINESS_ONLY,
        "activation decision record only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6U current/live traffic actual external call execution activation decision boundary",
        "next phase blocked until separate activation final readiness gate",
        APPROVED_FOR_ACTIVATION_READINESS_ONLY,
        "`smoke:oro-6u` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6U Live Traffic Actual External Call Execution Activation Decision Boundary Coverage",
        "ORO-6U boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6U].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6U files must not contain ${marker}.`);
  }
  for (const file of ORO6U_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult",
    "dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary",
    "oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed",
    "actualExternalCallExecutionActivationRequestPreparedFromOro6t",
    "actualExternalCallExecutionActivationRequestSubmittedFromOro6t",
    "actualExternalCallExecutionActivationRequestStatusFromOro6t",
    "actualExternalCallExecutionActivationDecisionIssuedFromOro6t",
    "actualExternalCallExecutionActivationDecisionStatusFromOro6t",
    "actualExternalCallExecutionActivatedFromOro6t",
    "actualExternalCallExecutionRuntimeEnabledFromOro6t",
    "actualExternalCallExecutionEnabledFromOro6t",
    "actualExternalCallExecutionAuthorizedFromOro6t",
    "externalCallExecutionAuthorizedFromOro6t",
    "externalCallExecutionPerformedFromOro6t",
    "externalNetworkAllowedFromOro6t",
    "liveOroPlayApiCallAllowedFromOro6t",
    "dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate",
    "oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed",
    "runtimeFinalReadinessGateStatusFromOro6s",
    "actualExternalCallExecutionActivationDecisionPrepared",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionActivationDecisionStatus",
    "actualExternalCallExecutionActivationDecisionScope",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate",
    "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest",
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
  assert.strictEqual(summary.phase, ORO_6U_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestPreparedFromOro6t,
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
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssuedFromOro6t, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionStatusFromOro6t, "pending");
  assert.strictEqual(summary.actualExternalCallExecutionActivatedFromOro6t, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6t, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6t, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6t, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6t, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6t, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6t, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6t, false);
  assert.strictEqual(
    summary.dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.runtimeFinalReadinessGateStatusFromOro6s,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  );
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionStatus,
    APPROVED_FOR_ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionScope,
    ACTIVATION_READINESS_ONLY
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6U happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6U hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6U_ACTIVATION_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6uActivationDecisionSummary, "function");
  assert.strictEqual(typeof assertOro6uStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6uActivationDecisionSummary(happy), happy);
  assert.strictEqual(assertOro6uStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      missingOro6tActivationRequestFixture
    ),
    "ORO-6T activation request boundary is required"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      oro6tActivationRequestNotSubmittedFixture
    ),
    "ORO-6T activation request must be submitted"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      oro6tActivationRequestStatusWrongFixture
    ),
    "ORO-6T activation request status must be submitted pending activation decision"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      activationDecisionAlreadyIssuedFixture
    ),
    "ORO-6T activation decision must still be pending"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      actualExternalCallExecutionAlreadyActivatedFixture
    ),
    "ORO-6U must not activate actual external call execution"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6U must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6U must not enable actual external call execution"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6U must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6U must not perform external call execution"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during activation decision boundary"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during activation decision boundary"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during activation decision boundary"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during activation decision boundary"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary({
        id: "decisionStatusWrongFixture",
        activationDecisionEvidence: {
          actualExternalCallExecutionActivationDecisionStatus: "approved",
        },
      })
    ),
    "activation decision must be issued for activation readiness only"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary({
        id: "decisionScopeWrongFixture",
        activationDecisionEvidence: {
          actualExternalCallExecutionActivationDecisionScope: "activation",
        },
      })
    ),
    "activation decision must be issued for activation readiness only"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary({
        id: "nextPhaseMissingFixture",
        activationDecisionEvidence: {
          nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
            false,
        },
      })
    ),
    "next phase must require separate activation final readiness and live execution request"
  );
  assertHeld(
    validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
      buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures().map(
      validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 16, "fixture set must cover ORO-6U cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6U live traffic actual external call execution activation decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6U live traffic actual external call execution activation decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
