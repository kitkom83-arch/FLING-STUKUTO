"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures");

const {
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  ORO_6L_ACTUAL_EXECUTION_AUTHORIZATION_DECISION_STATUS,
  ORO_6L_PHASE,
  PASS,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  assertOro6lStillNoExternalCall,
  buildOro6lActualExecutionAuthorizationDecisionSummary,
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
  runOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryHarness,
  validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
} = helper;

const {
  actualExecutionDecisionAlreadyIssuedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures,
  externalCallExecutionAccidentallyPerformedFixture,
  externalNetworkAccidentallyAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture,
  ledgerMutationAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  missingOro6kActualExecutionAuthorizationRequestFixture,
  oro6kActualExecutionAuthorizationRequestNotSubmittedFixture,
  oro6kRequestStatusWrongFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  walletMutationAccidentallyAllowedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6L =
  "docs/ORO_6L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_6K =
  "docs/ORO_6K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6lSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6l";
const ORO6L_SECRET_SCAN_FILES = Object.freeze([
  DOC_6L,
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
  const doc6l = readRequired(DOC_6L);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6K",
    "## Actual external call execution authorization decision boundary",
    "approved_for_live_execution_readiness_only",
    "live_execution_readiness_only",
    "actualExternalCallExecutionAuthorizationDecisionIssued = true",
    "actualExternalCallExecutionAuthorized = false",
    "externalCallExecutionAuthorized = false",
    "externalCallExecutionPerformed = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Why the decision remains readiness-only",
    "## Still-no-external-call safety",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase expectations",
    "## Actual execution authorization decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6l.includes(marker), `${DOC_6L} missing marker ${marker}.`);
  }

  const doc6k = readRequired(DOC_6K);
  for (const marker of [
    "ORO-6L actual external call execution authorization decision boundary is required next",
    "approved_for_live_execution_readiness_only",
    "ORO-6L still does not authorize actual execution",
  ]) {
    assert(doc6k.includes(marker), `${DOC_6K} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro6l",
    "oro-6l",
    "ORO_6L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
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
        "ORO-6L records actual external call execution authorization decision only",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
        LIVE_EXECUTION_READINESS_ONLY,
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
        "## ORO-6L Current",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
        "readiness-only decision record",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6L current/live traffic actual external call execution authorization decision boundary",
        "next phase blocked until separate live execution readiness gate",
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
        "`smoke:oro-6l` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6L Live Traffic Actual External Call Execution Authorization Decision Boundary Coverage",
        "ORO-6L boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6L].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6L files must not contain ${marker}.`);
  }
  for (const file of ORO6L_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoActualExecutionOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult",
    "dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary",
    "oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed",
    "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k",
    "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k",
    "actualExternalCallExecutionAuthorizationRequestStatusFromOro6k",
    "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k",
    "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k",
    "actualExternalCallExecutionAuthorizedFromOro6k",
    "externalCallExecutionAuthorizedFromOro6k",
    "externalCallExecutionPerformedFromOro6k",
    "externalNetworkAllowedFromOro6k",
    "liveOroPlayApiCallAllowedFromOro6k",
    "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate",
    "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed",
    "preExecutionReadinessGateStatusFromOro6j",
    "actualExternalCallExecutionAuthorizationDecisionPrepared",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionAuthorizationDecisionStatus",
    "actualExternalCallExecutionAuthorizationDecisionScope",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateLiveExecutionReadinessGate",
    "nextPhaseRequiresSeparateActualExternalCallExecutionEnablement",
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
  assert.strictEqual(summary.phase, ORO_6L_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k,
    SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k,
    false
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k,
    "pending"
  );
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizedFromOro6k, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6k, false);
  assert.strictEqual(summary.externalCallExecutionPerformedFromOro6k, false);
  assert.strictEqual(summary.externalNetworkAllowedFromOro6k, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowedFromOro6k, false);
  assert.strictEqual(
    summary.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.preExecutionReadinessGateStatusFromOro6j,
    "ready_for_separate_actual_external_call_execution_authorization_request"
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatus,
    APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionScope,
    LIVE_EXECUTION_READINESS_ONLY
  );
  assertNoActualExecutionOrCallFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveExecutionReadinessGate, true);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionEnablement,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6L happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoActualExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6L hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO_6L_ACTUAL_EXECUTION_AUTHORIZATION_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro6lActualExecutionAuthorizationDecisionSummary, "function");
  assert.strictEqual(typeof assertOro6lStillNoExternalCall, "function");
  assert.strictEqual(
    typeof runOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryHarness(
      happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture
    );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro6lActualExecutionAuthorizationDecisionSummary(happy), happy);
  assert.strictEqual(assertOro6lStillNoExternalCall(happy), true);

  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      missingOro6kActualExecutionAuthorizationRequestFixture
    ),
    "ORO-6K actual execution authorization request record is required"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      oro6kActualExecutionAuthorizationRequestNotSubmittedFixture
    ),
    "ORO-6K actual execution request must be submitted pending actual decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      oro6kRequestStatusWrongFixture
    ),
    "ORO-6K actual execution request must be submitted pending actual decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      actualExecutionDecisionAlreadyIssuedFixture
    ),
    "ORO-6K must still be pending with no actual execution authorization or call"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      actualExternalCallExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6L must not authorize or perform actual execution"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      externalCallExecutionAccidentallyPerformedFixture
    ),
    "ORO-6L must not authorize or perform actual execution"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      externalNetworkAccidentallyAllowedFixture
    ),
    "external network must remain absent during actual execution decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      liveOroPlayCallAccidentallyAllowedFixture
    ),
    "live OroPlay API call must remain absent during actual execution decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      walletMutationAccidentallyAllowedFixture
    ),
    "wallet mutation must remain absent during actual execution decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      ledgerMutationAccidentallyAllowedFixture
    ),
    "ledger mutation must remain absent during actual execution decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      prismaWriteAccidentallyAllowedFixture
    ),
    "data write and DB transaction must remain absent during decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      secretLeakShapeFixture
    ),
    "sensitive-shaped values must not leak during decision"
  );
  assertHeld(
    validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
      buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary({
        id: "wrongDecisionScopeFixture",
        decisionEvidence: {
          actualExternalCallExecutionAuthorizationDecisionStatus: "approved",
          actualExternalCallExecutionAuthorizationDecisionScope: "actual_execution",
        },
      })
    ),
    "ORO-6L decision must be issued as live execution readiness only"
  );

  const allReports =
    buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures().map(
      validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 13, "fixture set must cover ORO-6L cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoActualExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6L live traffic actual external call execution authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6L live traffic actual external call execution authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
