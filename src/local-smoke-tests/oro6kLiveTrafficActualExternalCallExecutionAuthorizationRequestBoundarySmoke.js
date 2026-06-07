"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures");

const {
  ORO_6K_ACTUAL_EXECUTION_AUTHORIZATION_REQUEST_STATUS,
  ORO_6K_PHASE,
  PASS,
  PENDING,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  assertOro6kStillNoExternalCall,
  buildOro6kActualExecutionAuthorizationRequestSummary,
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
  runOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryHarness,
  validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
} = helper;

const {
  actualExecutionAuthorizationRequestAlreadySubmittedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionDecisionAlreadyIssuedFixture,
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6jPreExecutionReadinessGateFixture,
  oro6jPreExecutionReadinessGateNotPassedFixture,
  oro6jPreExecutionReadinessStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6K =
  "docs/ORO_6K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6J =
  "docs/ORO_6J_LIVE_TRAFFIC_EXTERNAL_CALL_PRE_EXECUTION_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro6kSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6k";
const ORO6K_SECRET_SCAN_FILES = Object.freeze([
  DOC_6K,
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
  const doc6k = readRequired(DOC_6K);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6J",
    "## Actual external call execution authorization request boundary",
    "submitted_pending_actual_execution_decision",
    "actualExternalCallExecutionAuthorizationRequestSubmitted = true",
    "actualExternalCallExecutionAuthorizationDecisionIssued = false",
    "actualExternalCallExecutionAuthorizationDecisionStatus = pending",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Actual execution authorization request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6k.includes(marker), `${DOC_6K} missing marker ${marker}.`);
  }

  const doc6j = readRequired(DOC_6J);
  for (const marker of [
    "ORO-6K actual external call execution authorization request boundary is required next",
    "submitted_pending_actual_execution_decision",
    "ORO-6K does not issue the actual execution decision",
  ]) {
    assert(doc6j.includes(marker), `${DOC_6J} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6k",
    "oro-6k",
    "ORO_6K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
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
        "ORO-6K records actual external call execution authorization request only",
        "submitted_pending_actual_execution_decision",
        "actualExternalCallExecutionAuthorizationDecisionIssued=false",
        "actualExternalCallExecutionAuthorized=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "smoke:oro-6k",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6K Current",
        "submitted_pending_actual_execution_decision",
        "separate actual external call execution authorization decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6K current/live traffic actual external call execution authorization request boundary",
        "next phase blocked until separate actual external call execution authorization decision",
        "submitted_pending_actual_execution_decision",
        "`smoke:oro-6k` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6K Live Traffic Actual External Call Execution Authorization Request Boundary Coverage",
        "ORO-6K boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6K].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6K files must not contain ${marker}.`);
  }
  for (const file of ORO6K_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoActualExecutionOrCallFlags(summary) {
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssued,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatus,
    PENDING
  );
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
    "liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult",
    "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate",
    "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed",
    "preExecutionReadinessGatePreparedFromOro6j",
    "preExecutionReadinessGateEvaluatedFromOro6j",
    "preExecutionReadinessGatePassedFromOro6j",
    "preExecutionReadinessGateStatusFromOro6j",
    "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j",
    "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j",
    "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j",
    "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j",
    "actualExternalCallExecutionAuthorizedFromOro6j",
    "externalCallExecutionAuthorizedFromOro6j",
    "externalCallExecutionPerformedFromOro6j",
    "externalNetworkAllowedFromOro6j",
    "liveOroPlayApiCallAllowedFromOro6j",
    "dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary",
    "oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed",
    "externalCallExecutionAuthorizationDecisionStatusFromOro6i",
    "externalCallExecutionAuthorizationDecisionScopeFromOro6i",
    "actualExternalCallExecutionAuthorizationRequestPrepared",
    "actualExternalCallExecutionAuthorizationRequestSubmitted",
    "actualExternalCallExecutionAuthorizationRequestStatus",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionAuthorizationDecisionStatus",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision",
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
  assert.strictEqual(summary.phase, ORO_6K_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed,
    true
  );
  assert.strictEqual(summary.preExecutionReadinessGatePreparedFromOro6j, true);
  assert.strictEqual(summary.preExecutionReadinessGateEvaluatedFromOro6j, true);
  assert.strictEqual(summary.preExecutionReadinessGatePassedFromOro6j, true);
  assert.strictEqual(
    summary.preExecutionReadinessGateStatusFromOro6j,
    "ready_for_separate_actual_external_call_execution_authorization_request"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j,
    "not_requested"
  );
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6j, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6j, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6j, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6j, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6j, false);
  assert.strictEqual(
    summary.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionStatusFromOro6i,
    "approved_for_pre_execution_readiness_only"
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionScopeFromOro6i,
    "pre_execution_readiness_only"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
  );
  assertNoActualExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6K happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoActualExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6K hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6K_ACTUAL_EXECUTION_AUTHORIZATION_REQUEST_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6kActualExecutionAuthorizationRequestSummary, "function");
  assert.strictEqual(typeof assertOro6kStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6kActualExecutionAuthorizationRequestSummary(happy), happy);
  assert.strictEqual(assertOro6kStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      missingOro6jPreExecutionReadinessGateFixture
    ),
    "ORO-6J pre-execution readiness gate record is required"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      oro6jPreExecutionReadinessGateNotPassedFixture
    ),
    "ORO-6J pre-execution readiness gate must be ready"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      oro6jPreExecutionReadinessStatusWrongFixture
    ),
    "ORO-6J pre-execution readiness gate must be ready"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      actualExecutionAuthorizationRequestAlreadySubmittedFixture
    ),
    "ORO-6J must still have no actual execution request or call"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6K must not decide, authorize, or perform actual execution"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      actualExternalCallExecutionDecisionAlreadyIssuedFixture
    ),
    "ORO-6K must not decide, authorize, or perform actual execution"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during actual execution request"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during actual execution request"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during actual execution request"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during actual execution request"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent during request"
  );
  assertHeld(
    validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak during request"
  );

  const allReports =
    buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures().map(
      validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary
    );
  assert.strictEqual(allReports.length, 13, "fixture set must cover ORO-6K cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoActualExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6K live traffic actual external call execution authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6K live traffic actual external call execution authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
