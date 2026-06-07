"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryFixtures");

const {
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  ORO_6I_DECISION_STATUS,
  ORO_6I_PHASE,
  PASS,
  PENDING,
  PRE_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  assertOro6iStillNoExternalCall,
  buildOro6iDecisionSummary,
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
  runOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryHarness,
  validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
} = helper;

const {
  alreadyAuthorizedForActualExternalCallFixture,
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionFixtures,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6hRequestSubmissionFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6I =
  "docs/ORO_6I_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_6H =
  "docs/ORO_6H_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6iSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6i";
const LONG_SCRIPT =
  "smoke:oro-6i-live-traffic-external-call-execution-authorization-decision-boundary";
const ORO6I_SECRET_SCAN_FILES = Object.freeze([
  DOC_6I,
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
  const doc6i = readRequired(DOC_6I);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6H",
    "## Decision boundary",
    "## Decision status allowed values",
    "approved_for_pre_execution_readiness_only",
    "pre_execution_readiness_only",
    "externalCallExecutionAuthorized = false",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Execution authorization decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6i.includes(marker), `${DOC_6I} missing marker ${marker}.`);
  }

  const doc6h = readRequired(DOC_6H);
  for (const marker of [
    "ORO-6I execution authorization decision boundary is required next",
    "approved_for_pre_execution_readiness_only",
    "ORO-6I does not authorize actual external call execution",
  ]) {
    assert(doc6h.includes(marker), `${DOC_6H} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6i", "oro-6i", DOC_6I]) {
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
        "ORO-6I records external/live call execution authorization decision only",
        "approved_for_pre_execution_readiness_only",
        "actualExternalCallExecutionAuthorized=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        "smoke:oro-6i",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6I Current",
        "approved_for_pre_execution_readiness_only",
        "separate actual external call execution authorization",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6I current/live traffic external call execution authorization decision boundary",
        "next phase blocked until separate pre-execution readiness gate",
        "approved_for_pre_execution_readiness_only",
        "`smoke:oro-6i` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6I Live Traffic External Call Execution Authorization Decision Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6I].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6I files must not contain ${marker}.`);
  }
  for (const file of ORO6I_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoActualExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.externalCallExecutionAuthorized, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorized, false);
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
    "liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult",
    "dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary",
    "oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed",
    "externalCallExecutionAuthorizationRequestPreparedFromOro6h",
    "externalCallExecutionAuthorizationRequestSubmittedFromOro6h",
    "externalCallExecutionAuthorizationRequestStatusFromOro6h",
    "externalCallExecutionAuthorizationDecisionIssuedFromOro6h",
    "externalCallExecutionAuthorizationDecisionStatusFromOro6h",
    "externalCallExecutionAuthorizedFromOro6h",
    "externalNetworkAllowedFromOro6h",
    "liveOroPlayApiCallAllowedFromOro6h",
    "dependsOnOro6gLiveTrafficExternalCallReadinessGate",
    "oro6gLiveTrafficExternalCallReadinessGatePassed",
    "externalCallReadinessGateStatusFromOro6g",
    "externalCallExecutionAuthorizationDecisionPrepared",
    "externalCallExecutionAuthorizationDecisionIssued",
    "externalCallExecutionAuthorizationDecisionStatus",
    "externalCallExecutionAuthorizationDecisionScope",
    "externalCallExecutionAuthorized",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparatePreExecutionReadinessGate",
    "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization",
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
  assert.strictEqual(summary.phase, ORO_6I_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestPreparedFromOro6h,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestSubmittedFromOro6h,
    true
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestStatusFromOro6h,
    SUBMITTED_PENDING_EXECUTION_DECISION
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionIssuedFromOro6h,
    false
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionStatusFromOro6h,
    PENDING
  );
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6h, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6h, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6h, false);
  assert.strictEqual(summary.dependsOnOro6gLiveTrafficExternalCallReadinessGate, true);
  assert.strictEqual(summary.oro6gLiveTrafficExternalCallReadinessGatePassed, true);
  assert.strictEqual(
    summary.externalCallReadinessGateStatusFromOro6g,
    READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
  );
  assert.strictEqual(summary.externalCallExecutionAuthorizationDecisionPrepared, true);
  assert.strictEqual(summary.externalCallExecutionAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionStatus,
    APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionScope,
    PRE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparatePreExecutionReadinessGate, true);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoActualExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6I happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoActualExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6I hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6I_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6iDecisionSummary, "function");
  assert.strictEqual(typeof assertOro6iStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryHarness(
      happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6iDecisionSummary(happy), happy);
  assert.strictEqual(assertOro6iStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      missingOro6hRequestSubmissionFixture
    ),
    "ORO-6H execution authorization request record is required"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      alreadyAuthorizedForActualExternalCallFixture
    ),
    "ORO-6I must not authorize or perform external call execution"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during decision boundary"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during decision boundary"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during decision boundary"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during decision boundary"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent during decision boundary"
  );
  assertHeld(
    validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak during decision boundary"
  );

  const allReports =
    buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionFixtures().map(
      validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 9, "fixture set must cover ORO-6I cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoActualExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6I live traffic external call execution authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6I live traffic external call execution authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
