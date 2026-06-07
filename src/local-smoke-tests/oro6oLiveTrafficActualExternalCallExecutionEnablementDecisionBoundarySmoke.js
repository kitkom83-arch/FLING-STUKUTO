"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures");

const {
  APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
  FINAL_LIVE_EXECUTION_READINESS_ONLY,
  ORO_6O_ACTUAL_EXECUTION_ENABLEMENT_DECISION_STATUS,
  ORO_6O_PHASE,
  PASS,
  assertOro6oStillNoExternalCall,
  buildOro6oActualExecutionEnablementDecisionSummary,
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
  runOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryHarness,
  validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
} = helper;

const {
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures,
  enablementDecisionAlreadyIssuedFixture,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6nEnablementRequestFixture,
  oro6nEnablementRequestNotSubmittedFixture,
  oro6nEnablementRequestStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6O =
  "docs/ORO_6O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_DECISION_BOUNDARY.md";
const DOC_6N =
  "docs/ORO_6N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6oSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6o";
const ORO6O_SECRET_SCAN_FILES = Object.freeze([
  DOC_6O,
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
  const doc6o = readRequired(DOC_6O);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6N",
    "## Actual external call execution enablement decision boundary",
    "approved_for_final_live_execution_readiness_only",
    "final_live_execution_readiness_only",
    "actualExternalCallExecutionEnablementDecisionIssued = true",
    "actualExternalCallExecutionEnabled = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why decision issued remains final readiness-only",
    "## Why ORO-6O still does not enable actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "## Actual execution enablement decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6o.includes(marker), `${DOC_6O} missing marker ${marker}.`);
  }

  const doc6n = readRequired(DOC_6N);
  for (const marker of [
    "ORO-6O actual external call execution enablement decision boundary is required next",
    "approved_for_final_live_execution_readiness_only",
    "ORO-6O still does not enable actual execution",
  ]) {
    assert(doc6n.includes(marker), `${DOC_6N} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6o",
    "oro-6o",
    "ORO_6O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ENABLEMENT_DECISION_BOUNDARY.md",
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
        "ORO-6O records actual external call execution enablement decision only",
        APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
        FINAL_LIVE_EXECUTION_READINESS_ONLY,
        "actualExternalCallExecutionEnablementDecisionIssued=true",
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
        "## ORO-6O Current",
        APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
        "final readiness-only decision record",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6O current/live traffic actual external call execution enablement decision boundary",
        "next phase blocked until separate final live execution readiness gate",
        APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
        "`smoke:oro-6o` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6O Live Traffic Actual External Call Execution Enablement Decision Boundary Coverage",
        "ORO-6O boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6O].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6O files must not contain ${marker}.`);
  }
  for (const file of ORO6O_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoExecutionOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionEnablementDecisionBoundaryResult",
    "dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary",
    "oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed",
    "actualExternalCallExecutionEnablementRequestPreparedFromOro6n",
    "actualExternalCallExecutionEnablementRequestSubmittedFromOro6n",
    "actualExternalCallExecutionEnablementRequestStatusFromOro6n",
    "actualExternalCallExecutionEnablementDecisionIssuedFromOro6n",
    "actualExternalCallExecutionEnablementDecisionStatusFromOro6n",
    "actualExternalCallExecutionEnabledFromOro6n",
    "actualExternalCallExecutionAuthorizedFromOro6n",
    "externalCallExecutionAuthorizedFromOro6n",
    "externalCallExecutionPerformedFromOro6n",
    "externalNetworkAllowedFromOro6n",
    "liveOroPlayApiCallAllowedFromOro6n",
    "dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate",
    "oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed",
    "liveExecutionReadinessGateStatusFromOro6m",
    "actualExternalCallExecutionEnablementDecisionPrepared",
    "actualExternalCallExecutionEnablementDecisionIssued",
    "actualExternalCallExecutionEnablementDecisionStatus",
    "actualExternalCallExecutionEnablementDecisionScope",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement",
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
  assert.strictEqual(summary.phase, ORO_6O_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionEnablementDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestPreparedFromOro6n,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementRequestStatusFromOro6n,
    "submitted_pending_enablement_decision"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionIssuedFromOro6n,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionStatusFromOro6n,
    "pending"
  );
  assert.strictEqual(summary.actualExternalCallExecutionEnabledFromOro6n, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6n, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6n, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6n, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6n, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6n, false);
  assert.strictEqual(
    summary.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.liveExecutionReadinessGateStatusFromOro6m,
    "ready_for_separate_actual_external_call_execution_enablement_request"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionStatus,
    APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionEnablementDecisionScope,
    FINAL_LIVE_EXECUTION_READINESS_ONLY
  );
  assertNoExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6O happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionEnablementDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6O hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO_6O_ACTUAL_EXECUTION_ENABLEMENT_DECISION_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro6oActualExecutionEnablementDecisionSummary,
    "function"
  );
  assert.strictEqual(typeof assertOro6oStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro6oActualExecutionEnablementDecisionSummary(happy),
    happy
  );
  assert.strictEqual(assertOro6oStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      missingOro6nEnablementRequestFixture
    ),
    "ORO-6N enablement request boundary is required"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      oro6nEnablementRequestNotSubmittedFixture
    ),
    "ORO-6N enablement request must be submitted"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      oro6nEnablementRequestStatusWrongFixture
    ),
    "ORO-6N enablement request status must be submitted pending decision"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      enablementDecisionAlreadyIssuedFixture
    ),
    "ORO-6N enablement decision must still be pending"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyEnabledFixture
    ),
    "ORO-6O must not enable actual external call execution"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6O must not authorize actual external call execution"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      actualExternalCallExecutionAlreadyPerformedFixture
    ),
    "ORO-6O must not perform external call execution"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during enablement decision"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during enablement decision"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during enablement decision"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during enablement decision"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary({
        id: "oro6mReadinessMissingFixture",
        oro6mReadinessEvidence: {
          dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate: false,
        },
      })
    ),
    "ORO-6M live execution readiness evidence is required"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary({
        id: "decisionScopeWrongFixture",
        decisionEvidence: {
          actualExternalCallExecutionEnablementDecisionScope: "runtime_enablement",
        },
      })
    ),
    "ORO-6O decision must be final readiness-only"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary({
        id: "dbTransactionAccidentallyAllowedFixture",
        safetyEvidence: {
          dbTransactionAllowed: true,
        },
      })
    ),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
      buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary({
        id: "migrationAccidentallyAllowedFixture",
        safetyEvidence: {
          migrationAllowed: true,
        },
      })
    ),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures().map(
      validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary
    );
  assert.strictEqual(allReports.length, 14, "fixture set must cover ORO-6O cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6O live traffic actual external call execution enablement decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6O live traffic actual external call execution enablement decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
