"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGate");
const fixtures = require("../game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures");

const {
  NOT_REQUESTED,
  ORO_6J_PHASE,
  ORO_6J_PRE_EXECUTION_READINESS_STATUS,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
  assertOro6jStillNoExternalCall,
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
  buildOro6jPreExecutionReadinessSummary,
  runOro6jLiveTrafficExternalCallPreExecutionReadinessGateHarness,
  validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
} = helper;

const {
  actualExecutionAuthorizationRequestAlreadySubmittedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6iDecisionFixture,
  oro6iDecisionNotIssuedFixture,
  oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6J =
  "docs/ORO_6J_LIVE_TRAFFIC_EXTERNAL_CALL_PRE_EXECUTION_READINESS_GATE.md";
const DOC_6I =
  "docs/ORO_6I_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6jSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6jLiveTrafficExternalCallPreExecutionReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6j";
const LONG_SCRIPT =
  "smoke:oro-6j-live-traffic-external-call-pre-execution-readiness-gate";
const ORO6J_SECRET_SCAN_FILES = Object.freeze([
  DOC_6J,
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
  const doc6j = readRequired(DOC_6J);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6I",
    "## Pre-execution readiness gate",
    "approved_for_pre_execution_readiness_only",
    "pre_execution_readiness_only",
    "ready_for_separate_actual_external_call_execution_authorization_request",
    "actualExternalCallExecutionAuthorizationRequestSubmitted = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Pre-execution readiness output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6j.includes(marker), `${DOC_6J} missing marker ${marker}.`);
  }

  const doc6i = readRequired(DOC_6I);
  for (const marker of [
    "ORO-6J pre-execution readiness gate is required next",
    "ready_for_separate_actual_external_call_execution_authorization_request",
    "ORO-6J does not submit actual execution authorization",
  ]) {
    assert(doc6i.includes(marker), `${DOC_6I} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6j", "oro-6j", DOC_6J]) {
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
        "ORO-6J records external/live call pre-execution readiness gate only",
        "ready_for_separate_actual_external_call_execution_authorization_request",
        "actualExternalCallExecutionAuthorizationRequestSubmitted=false",
        "actualExternalCallExecutionAuthorized=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "smoke:oro-6j",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6J Current",
        "ready_for_separate_actual_external_call_execution_authorization_request",
        "separate actual external call execution authorization request",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6J current/live traffic external call pre-execution readiness gate",
        "next phase blocked until separate actual external call execution authorization request",
        "ready_for_separate_actual_external_call_execution_authorization_request",
        "`smoke:oro-6j` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6J Live Traffic External Call Pre-Execution Readiness Gate Coverage",
        LONG_SCRIPT,
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6J].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6J files must not contain ${marker}.`);
  }
  for (const file of ORO6J_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoActualExecutionOrCallFlags(summary) {
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestPrepared,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmitted,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssued,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatus,
    NOT_REQUESTED
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
    "liveTrafficExternalCallPreExecutionReadinessGateResult",
    "dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary",
    "oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed",
    "externalCallExecutionAuthorizationDecisionPreparedFromOro6i",
    "externalCallExecutionAuthorizationDecisionIssuedFromOro6i",
    "externalCallExecutionAuthorizationDecisionStatusFromOro6i",
    "externalCallExecutionAuthorizationDecisionScopeFromOro6i",
    "externalCallExecutionAuthorizedFromOro6i",
    "actualExternalCallExecutionAuthorizedFromOro6i",
    "externalCallExecutionPerformedFromOro6i",
    "externalNetworkAllowedFromOro6i",
    "liveOroPlayApiCallAllowedFromOro6i",
    "dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary",
    "oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed",
    "externalCallExecutionAuthorizationRequestSubmittedFromOro6h",
    "externalCallExecutionAuthorizationRequestStatusFromOro6h",
    "dependsOnOro6gLiveTrafficExternalCallReadinessGate",
    "oro6gLiveTrafficExternalCallReadinessGatePassed",
    "externalCallReadinessGateStatusFromOro6g",
    "preExecutionReadinessGatePrepared",
    "preExecutionReadinessGateEvaluated",
    "preExecutionReadinessGatePassed",
    "preExecutionReadinessGateStatus",
    "actualExternalCallExecutionAuthorizationRequestPrepared",
    "actualExternalCallExecutionAuthorizationRequestSubmitted",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionAuthorizationDecisionStatus",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest",
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
  assert.strictEqual(summary.phase, ORO_6J_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture"
  );
  assert.strictEqual(summary.liveTrafficExternalCallPreExecutionReadinessGateResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionPreparedFromOro6i,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionIssuedFromOro6i,
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
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6i, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6i, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6i, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6i, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6i, false);
  assert.strictEqual(
    summary.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestSubmittedFromOro6h,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestStatusFromOro6h,
    "submitted_pending_execution_decision"
  );
  assert.strictEqual(summary.dependsOnOro6gLiveTrafficExternalCallReadinessGate, true);
  assert.strictEqual(summary.oro6gLiveTrafficExternalCallReadinessGatePassed, true);
  assert.strictEqual(
    summary.externalCallReadinessGateStatusFromOro6g,
    "ready_for_separate_execution_authorization_request"
  );
  assert.strictEqual(summary.preExecutionReadinessGatePrepared, true);
  assert.strictEqual(summary.preExecutionReadinessGateEvaluated, true);
  assert.strictEqual(summary.preExecutionReadinessGatePassed, true);
  assert.strictEqual(
    summary.preExecutionReadinessGateStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
  );
  assertNoActualExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6J happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficExternalCallPreExecutionReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoActualExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6J hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6J_PRE_EXECUTION_READINESS_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro6jPreExecutionReadinessSummary, "function");
  assert.strictEqual(typeof assertOro6jStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6jLiveTrafficExternalCallPreExecutionReadinessGateHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = runOro6jLiveTrafficExternalCallPreExecutionReadinessGateHarness(
    happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6jPreExecutionReadinessSummary(happy), happy);
  assert.strictEqual(assertOro6jStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      missingOro6iDecisionFixture
    ),
    "ORO-6I execution authorization decision record is required"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      oro6iDecisionNotIssuedFixture
    ),
    "ORO-6I decision must be issued for pre-execution readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture
    ),
    "ORO-6I decision must be pre-execution readiness only"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6J must not request, authorize, or perform actual external call execution"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      actualExecutionAuthorizationRequestAlreadySubmittedFixture
    ),
    "ORO-6J must not request, authorize, or perform actual external call execution"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during pre-execution readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during pre-execution readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during pre-execution readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during pre-execution readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent during readiness"
  );
  assertHeld(
    validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak during readiness"
  );

  const allReports =
    buildOro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures().map(
      validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate
    );
  assert.strictEqual(allReports.length, 12, "fixture set must cover ORO-6J cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoActualExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6J live traffic external call pre-execution readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6J live traffic external call pre-execution readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
