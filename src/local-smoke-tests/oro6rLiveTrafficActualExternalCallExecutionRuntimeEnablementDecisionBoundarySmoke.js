"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures");

const {
  ORO_6R_PHASE,
  ORO_6R_RUNTIME_ENABLEMENT_DECISION_STATUS,
  PASS,
  APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
  RUNTIME_EXECUTION_READINESS_ONLY,
  assertOro6rStillNoExternalCall,
  buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  buildOro6rRuntimeEnablementDecisionSummary,
  runOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryHarness,
  validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6qRuntimeEnablementRequestFixture,
  oro6qRuntimeEnablementRequestNotSubmittedFixture,
  oro6qRuntimeEnablementRequestStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  runtimeEnablementDecisionAlreadyIssuedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6R =
  "docs/ORO_6R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md";
const DOC_6Q =
  "docs/ORO_6Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6rSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6r";
const SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION =
  "submitted_pending_runtime_enablement_decision";
const READY_FOR_RUNTIME_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_runtime_enablement_request";
const ORO6R_SECRET_SCAN_FILES = Object.freeze([
  DOC_6R,
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
  const doc6r = readRequired(DOC_6R);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6Q",
    "## Actual external call execution runtime enablement decision boundary",
    "## Why decision issued still is runtime-readiness-only",
    "## Why ORO-6R still does not enable runtime execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionRuntimeEnablementDecisionPrepared = true",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued = true",
    `actualExternalCallExecutionRuntimeEnablementDecisionStatus = ${APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY}`,
    `actualExternalCallExecutionRuntimeEnablementDecisionScope = ${RUNTIME_EXECUTION_READINESS_ONLY}`,
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Runtime enablement decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6r.includes(marker), `${DOC_6R} missing marker ${marker}.`);
  }

  const doc6q = readRequired(DOC_6Q);
  for (const marker of [
    "ORO-6R actual external call execution runtime enablement decision boundary is required next",
    APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
    "ORO-6R still does not enable runtime execution",
  ]) {
    assert(doc6q.includes(marker), `${DOC_6Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6r",
    "oro-6r",
    "ORO_6R_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md",
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
        "ORO-6R records actual external call execution runtime enablement decision only",
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
        RUNTIME_EXECUTION_READINESS_ONLY,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssued=true",
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
        "## ORO-6R Current",
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
        "runtime enablement decision only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6R current/live traffic actual external call execution runtime enablement decision boundary",
        "next phase blocked until separate runtime final readiness gate",
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
        "`smoke:oro-6r` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6R Live Traffic Actual External Call Execution Runtime Enablement Decision Boundary Coverage",
        "ORO-6R boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6R].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6R files must not contain ${marker}.`);
  }
  for (const file of ORO6R_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult",
    "dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
    "oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed",
    "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q",
    "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q",
    "actualExternalCallExecutionRuntimeEnabledFromOro6q",
    "actualExternalCallExecutionEnabledFromOro6q",
    "actualExternalCallExecutionAuthorizedFromOro6q",
    "externalCallExecutionAuthorizedFromOro6q",
    "externalCallExecutionPerformedFromOro6q",
    "externalNetworkAllowedFromOro6q",
    "liveOroPlayApiCallAllowedFromOro6q",
    "dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate",
    "oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed",
    "finalLiveExecutionReadinessGateStatusFromOro6p",
    "actualExternalCallExecutionRuntimeEnablementDecisionPrepared",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
    "actualExternalCallExecutionRuntimeEnablementDecisionScope",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest",
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
  assert.strictEqual(summary.phase, ORO_6R_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q,
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
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q,
    "pending"
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabledFromOro6q, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6q, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6q, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6q, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6q, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6q, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6q, false);
  assert.strictEqual(
    summary.dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.finalLiveExecutionReadinessGateStatusFromOro6p,
    READY_FOR_RUNTIME_ENABLEMENT_REQUEST
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionScope,
    RUNTIME_EXECUTION_READINESS_ONLY
  );
  assertNoRuntimeExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6R happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6R hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6R_RUNTIME_ENABLEMENT_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6rRuntimeEnablementDecisionSummary, "function");
  assert.strictEqual(typeof assertOro6rStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6rRuntimeEnablementDecisionSummary(happy), happy);
  assert.strictEqual(assertOro6rStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      missingOro6qRuntimeEnablementRequestFixture
    ),
    "ORO-6Q runtime enablement request boundary is required"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      oro6qRuntimeEnablementRequestNotSubmittedFixture
    ),
    "ORO-6Q runtime enablement request must be submitted"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      oro6qRuntimeEnablementRequestStatusWrongFixture
    ),
    "ORO-6Q runtime enablement request status must be submitted pending decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      runtimeEnablementDecisionAlreadyIssuedFixture
    ),
    "ORO-6Q must not already issue runtime enablement decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      actualExternalCallExecutionRuntimeAlreadyEnabledFixture
    ),
    "ORO-6R must not enable actual external call execution runtime"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6R must not enable actual external call execution"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6R must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6R must not perform external call execution"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during runtime enablement decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during runtime enablement decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during runtime enablement decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during runtime enablement decision"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
        id: "runtimeEnablementDecisionStatusWrongFixture",
        runtimeEnablementDecisionEvidence: {
          actualExternalCallExecutionRuntimeEnablementDecisionStatus: "approved",
        },
      })
    ),
    "ORO-6R decision must be runtime execution readiness only"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
        id: "runtimeFinalReadinessMissingFixture",
        runtimeEnablementDecisionEvidence: {
          nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate:
            false,
        },
      })
    ),
    "next phase must require separate runtime final readiness and activation approval"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
        id: "oro6pFinalReadinessMissingFixture",
        oro6pFinalReadinessGateEvidence: {
          dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
            false,
        },
      })
    ),
    "ORO-6P final readiness evidence is required"
  );
  assertHeld(
    validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
      buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures().map(
      validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary
    );
  assert.strictEqual(allReports.length, 15, "fixture set must cover ORO-6R cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6R live traffic actual external call execution runtime enablement decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6R live traffic actual external call execution runtime enablement decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
