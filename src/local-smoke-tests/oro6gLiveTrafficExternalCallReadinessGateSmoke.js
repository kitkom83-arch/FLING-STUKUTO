"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6gLiveTrafficExternalCallReadinessGate");
const fixtures = require("../game-provider-mock/oro6gLiveTrafficExternalCallReadinessGateFixtures");

const {
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
  ORO6G_EXTERNAL_CALL_READINESS_GATE_STATUS,
  ORO6G_PHASE,
  PASS,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  buildOro6gLiveTrafficExternalCallReadinessGateRecord,
  evaluateOro6gLiveTrafficExternalCallReadinessGate,
  runOro6gLiveTrafficExternalCallReadinessGateHarness,
} = helper;

const {
  buildOro6gLiveTrafficExternalCallReadinessGateFixtures,
  executionAuthorizationRequestSubmittedFixture,
  externalCallExecutionAuthorizedFixture,
  externalNetworkAllowedFixture,
  happyPathLiveTrafficExternalCallReadinessGateFixture,
  liveOroPlayApiCallAllowedFixture,
  liveTrafficModeMismatchFixture,
  mutationAttemptFixture,
  oro6dValidationFailedFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6fDecisionMissingFixture,
  oro6fDecisionNotApprovedForReadinessOnlyFixture,
  oro6fExecutionAlreadyAuthorizedFixture,
  oro6fReadinessGateNotAllowedFixture,
  oro6fSeparateExecutionDecisionMissingFixture,
  secretLeakFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6G = "docs/ORO_6G_LIVE_TRAFFIC_EXTERNAL_CALL_READINESS_GATE.md";
const DOC_6F =
  "docs/ORO_6F_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_6E =
  "docs/ORO_6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6D =
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6gSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6gLiveTrafficExternalCallReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro6gLiveTrafficExternalCallReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6gLiveTrafficExternalCallReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-6g";
const LONG_SCRIPT = "smoke:oro-6g-live-traffic-external-call-readiness-gate";
const ORO6G_SECRET_SCAN_FILES = Object.freeze([
  DOC_6G,
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
  const doc6g = readRequired(DOC_6G);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6F",
    "## Dependency on ORO-6E",
    "## Dependency on ORO-6D",
    "## Readiness gate status",
    "externalCallReadinessGateStatus = ready_for_separate_execution_authorization_request",
    "externalCallAuthorizationDecisionStatusFromOro6f = approved_for_readiness_only",
    "not approved_to_call_now",
    "externalCallExecutionAuthorizationRequestSubmitted = false",
    "externalCallExecutionAuthorizationDecisionIssued = false",
    "externalCallExecutionAuthorized = false",
    "## No external network",
    "## No live OroPlay API call",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase execution authorization request",
    "## Secret redaction rules",
    "## Readiness gate output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6g.includes(marker), `${DOC_6G} missing marker ${marker}.`);
  }

  const doc6f = readRequired(DOC_6F);
  for (const marker of [
    "ORO-6G readiness gate is required next",
    "ready_for_separate_execution_authorization_request",
    "ORO-6G does not submit execution authorization request",
  ]) {
    assert(doc6f.includes(marker), `${DOC_6F} missing marker ${marker}.`);
  }

  const doc6e = readRequired(DOC_6E);
  assert(
    doc6e.includes("ORO-6G readiness gate still depends on the ORO-6E submitted request"),
    `${DOC_6E} missing ORO-6G linkage marker.`
  );

  const doc6d = readRequired(DOC_6D);
  assert(
    doc6d.includes("ORO-6G still requires ORO-6D validation to remain passed"),
    `${DOC_6D} missing ORO-6G validation marker.`
  );

  const doc6c = readRequired(DOC_6C);
  assert(
    doc6c.includes("ORO-6G remains downstream of ORO-6C live traffic enablement"),
    `${DOC_6C} missing ORO-6G prerequisite marker.`
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6g", "oro-6g", DOC_6G]) {
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
        "ORO-6G records external/live call readiness gate only",
        "ready_for_separate_execution_authorization_request",
        "externalCallExecutionAuthorizationRequestSubmitted=false",
        "externalCallExecutionAuthorized=false",
        "no outgoing live OroPlay API call yet",
        "no wallet/ledger mutation",
        "smoke:oro-6g",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6G Current",
        "ready_for_separate_execution_authorization_request",
        "separate external call execution authorization request",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6G current/live traffic external call readiness gate boundary",
        "next phase blocked until separate external call execution authorization request",
        "ready_for_separate_execution_authorization_request",
        "`smoke:oro-6g` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6G Live Traffic External Call Readiness Gate Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6G].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6G files must not contain ${marker}.`);
  }
  for (const file of ORO6G_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6f, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.externalCallExecutionAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.externalCallExecutionAuthorized, false);
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
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "liveTrafficExternalCallReadinessGateResult",
    "dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary",
    "oro6fLiveTrafficExternalCallAuthorizationDecisionPassed",
    "externalCallAuthorizationDecisionPreparedFromOro6f",
    "externalCallAuthorizationDecisionRecordedFromOro6f",
    "externalCallAuthorizationDecisionIssuedFromOro6f",
    "externalCallAuthorizationDecisionStatusFromOro6f",
    "externalCallExecutionAuthorizedFromOro6f",
    "externalCallReadinessGateAllowedFromOro6f",
    "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f",
    "dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary",
    "oro6eLiveTrafficExternalCallAuthorizationRequestPassed",
    "externalCallAuthorizationRequestPreparedFromOro6e",
    "externalCallAuthorizationRequestSubmittedFromOro6e",
    "externalCallAuthorizationRequestStatusFromOro6e",
    "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary",
    "oro6dLiveTrafficPostEnablementValidationPassed",
    "liveTrafficAllowedFromOro6d",
    "liveTrafficEnabledFromOro6d",
    "liveTrafficModeFromOro6d",
    "externalCallReadinessGatePrepared",
    "externalCallReadinessGateEvaluated",
    "externalCallReadinessGatePassed",
    "externalCallReadinessGateStatus",
    "externalCallExecutionAuthorizationRequestSubmitted",
    "externalCallExecutionAuthorizationDecisionIssued",
    "externalCallExecutionAuthorized",
    "nextPhaseRequiresExternalCallExecutionAuthorizationRequest",
    "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision",
    "humanApprovalRequired",
    "separateExternalCallExecutionAuthorizationRequired",
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
  assert.strictEqual(summary.phase, ORO6G_PHASE);
  assert.strictEqual(summary.fixtureId, "happyPathLiveTrafficExternalCallReadinessGateFixture");
  assert.strictEqual(summary.liveTrafficExternalCallReadinessGateResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(summary.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed, true);
  assert.strictEqual(summary.externalCallAuthorizationDecisionPreparedFromOro6f, true);
  assert.strictEqual(summary.externalCallAuthorizationDecisionRecordedFromOro6f, true);
  assert.strictEqual(summary.externalCallAuthorizationDecisionIssuedFromOro6f, true);
  assert.strictEqual(
    summary.externalCallAuthorizationDecisionStatusFromOro6f,
    APPROVED_FOR_READINESS_ONLY
  );
  assert.strictEqual(summary.externalCallReadinessGateAllowedFromOro6f, true);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f,
    true
  );
  assert.strictEqual(
    summary.dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(summary.oro6eLiveTrafficExternalCallAuthorizationRequestPassed, true);
  assert.strictEqual(summary.externalCallAuthorizationRequestPreparedFromOro6e, true);
  assert.strictEqual(summary.externalCallAuthorizationRequestSubmittedFromOro6e, true);
  assert.strictEqual(
    summary.externalCallAuthorizationRequestStatusFromOro6e,
    "submitted_pending_decision"
  );
  assert.strictEqual(
    summary.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary,
    true
  );
  assert.strictEqual(summary.oro6dLiveTrafficPostEnablementValidationPassed, true);
  assert.strictEqual(summary.liveTrafficAllowedFromOro6d, true);
  assert.strictEqual(summary.liveTrafficEnabledFromOro6d, true);
  assert.strictEqual(summary.liveTrafficModeFromOro6d, LIVE_TRAFFIC_MODE);
  assert.strictEqual(summary.externalCallReadinessGatePrepared, true);
  assert.strictEqual(summary.externalCallReadinessGateEvaluated, true);
  assert.strictEqual(summary.externalCallReadinessGatePassed, true);
  assert.strictEqual(
    summary.externalCallReadinessGateStatus,
    READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
  );
  assert.strictEqual(
    summary.nextPhaseRequiresExternalCallExecutionAuthorizationRequest,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequired, true);
  assert.strictEqual(summary.separateExternalCallExecutionAuthorizationRequired, true);
  assertNoExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6G happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.liveTrafficExternalCallReadinessGateResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6G hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6G_EXTERNAL_CALL_READINESS_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro6gLiveTrafficExternalCallReadinessGateRecord, "function");
  assert.strictEqual(typeof evaluateOro6gLiveTrafficExternalCallReadinessGate, "function");
  assert.strictEqual(typeof runOro6gLiveTrafficExternalCallReadinessGateHarness, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = runOro6gLiveTrafficExternalCallReadinessGateHarness(
    happyPathLiveTrafficExternalCallReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    buildOro6gLiveTrafficExternalCallReadinessGateRecord(
      happyPathLiveTrafficExternalCallReadinessGateFixture
    ).externalCallExecutionAuthorizationRequestSubmitted,
    false
  );

  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(oro6fDecisionMissingFixture),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      oro6fDecisionNotApprovedForReadinessOnlyFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      oro6fExecutionAlreadyAuthorizedFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      oro6fReadinessGateNotAllowedFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      oro6fSeparateExecutionDecisionMissingFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(oro6eRequestMissingFixture),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(oro6eRequestNotSubmittedFixture),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(oro6dValidationFailedFixture),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(liveTrafficModeMismatchFixture),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      executionAuthorizationRequestSubmittedFixture
    ),
    "ORO-6G must not submit or authorize external call execution"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(
      externalCallExecutionAuthorizedFixture
    ),
    "ORO-6G must not submit or authorize external call execution"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(externalNetworkAllowedFixture),
    "external network must remain absent during readiness gate"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(liveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during readiness gate"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(mutationAttemptFixture),
    "wallet mutation must remain absent during readiness gate"
  );
  assertHeld(
    evaluateOro6gLiveTrafficExternalCallReadinessGate(secretLeakFixture),
    "sensitive-shaped values must not leak during readiness gate"
  );

  const allReports =
    buildOro6gLiveTrafficExternalCallReadinessGateFixtures().map(
      evaluateOro6gLiveTrafficExternalCallReadinessGate
    );
  assert(allReports.length >= 16, "fixture set must cover ORO-6G required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-6G live traffic external call readiness gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-6G live traffic external call readiness gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
