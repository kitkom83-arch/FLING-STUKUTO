"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryFixtures");

const {
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
  ORO6H_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_STATUS,
  ORO6H_PHASE,
  PASS,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestRecord,
  evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
  runOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryHarness,
} = helper;

const {
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestFixtures,
  executionAlreadyAuthorizedFixture,
  executionDecisionAlreadyIssuedFixture,
  externalNetworkAllowedFixture,
  happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture,
  liveOroPlayApiCallAllowedFixture,
  liveTrafficModeMismatchFixture,
  mutationAttemptFixture,
  oro6dValidationFailedFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6fDecisionMissingFixture,
  oro6fDecisionStatusMismatchFixture,
  oro6gAlreadyAuthorizedExecutionFixture,
  oro6gAlreadyIssuedExecutionDecisionFixture,
  oro6gAlreadySubmittedExecutionRequestFixture,
  oro6gNextPhaseRequestMissingFixture,
  oro6gReadinessGateMissingFixture,
  oro6gReadinessGateNotPassedFixture,
  oro6gReadinessStatusMismatchFixture,
  oro6gSeparateExecutionDecisionMissingFixture,
  secretLeakFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6H =
  "docs/ORO_6H_LIVE_TRAFFIC_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6G = "docs/ORO_6G_LIVE_TRAFFIC_EXTERNAL_CALL_READINESS_GATE.md";
const DOC_6F =
  "docs/ORO_6F_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_6E =
  "docs/ORO_6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6D =
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6hSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6h";
const LONG_SCRIPT =
  "smoke:oro-6h-live-traffic-external-call-execution-authorization-request-boundary";
const ORO6H_SECRET_SCAN_FILES = Object.freeze([
  DOC_6H,
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
  const doc6h = readRequired(DOC_6H);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6G",
    "## Dependency on ORO-6F",
    "## Dependency on ORO-6E",
    "## Dependency on ORO-6D",
    "## Execution authorization request boundary",
    "externalCallReadinessGateStatusFromOro6g = ready_for_separate_execution_authorization_request",
    "externalCallExecutionAuthorizationRequestStatus = submitted_pending_execution_decision",
    "externalCallExecutionAuthorizationDecisionStatus = pending",
    "externalCallExecutionAuthorizationDecisionIssued = false",
    "externalCallExecutionAuthorized = false",
    "## No external network",
    "## No live OroPlay API call",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase execution authorization decision",
    "## Secret redaction rules",
    "## Execution authorization request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc6h.includes(marker), `${DOC_6H} missing marker ${marker}.`);
  }

  const doc6g = readRequired(DOC_6G);
  for (const marker of [
    "ORO-6H execution authorization request boundary is required next",
    "submitted_pending_execution_decision",
    "ORO-6H does not issue execution authorization decision",
  ]) {
    assert(doc6g.includes(marker), `${DOC_6G} missing marker ${marker}.`);
  }

  const doc6f = readRequired(DOC_6F);
  assert(
    doc6f.includes(
      "ORO-6H remains downstream of ORO-6F approved_for_readiness_only decision"
    ),
    `${DOC_6F} missing ORO-6H linkage marker.`
  );

  const doc6e = readRequired(DOC_6E);
  assert(
    doc6e.includes(
      "ORO-6H execution request still depends on the ORO-6E submitted request"
    ),
    `${DOC_6E} missing ORO-6H linkage marker.`
  );

  const doc6d = readRequired(DOC_6D);
  assert(
    doc6d.includes("ORO-6H still requires ORO-6D validation to remain passed"),
    `${DOC_6D} missing ORO-6H validation marker.`
  );

  const doc6c = readRequired(DOC_6C);
  assert(
    doc6c.includes("ORO-6H remains downstream of ORO-6C live traffic enablement"),
    `${DOC_6C} missing ORO-6H prerequisite marker.`
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6h", "oro-6h", DOC_6H]) {
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
        "ORO-6H records external/live call execution authorization request only",
        "submitted_pending_execution_decision",
        "externalCallExecutionAuthorizationDecisionStatus=pending",
        "externalCallExecutionAuthorized=false",
        "no outgoing live OroPlay API call yet",
        "no wallet/ledger mutation",
        "smoke:oro-6h",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6H Current",
        "submitted_pending_execution_decision",
        "separate external call execution authorization decision",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6H current/live traffic external call execution authorization request boundary",
        "next phase blocked until separate external call execution authorization decision",
        "submitted_pending_execution_decision",
        "`smoke:oro-6h` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6H Live Traffic External Call Execution Authorization Request Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6H].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6H files must not contain ${marker}.`);
  }
  for (const file of ORO6H_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoExecutionDecisionOrCallFlags(summary) {
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
    "liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult",
    "dependsOnOro6gLiveTrafficExternalCallReadinessGate",
    "oro6gLiveTrafficExternalCallReadinessGatePassed",
    "externalCallReadinessGatePreparedFromOro6g",
    "externalCallReadinessGateEvaluatedFromOro6g",
    "externalCallReadinessGatePassedFromOro6g",
    "externalCallReadinessGateStatusFromOro6g",
    "externalCallExecutionAuthorizationRequestSubmittedFromOro6g",
    "externalCallExecutionAuthorizationDecisionIssuedFromOro6g",
    "externalCallExecutionAuthorizedFromOro6g",
    "nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g",
    "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g",
    "dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary",
    "oro6fLiveTrafficExternalCallAuthorizationDecisionPassed",
    "externalCallAuthorizationDecisionStatusFromOro6f",
    "externalCallExecutionAuthorizedFromOro6f",
    "externalCallReadinessGateAllowedFromOro6f",
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
    "externalCallExecutionAuthorizationRequestPrepared",
    "externalCallExecutionAuthorizationRequestSubmitted",
    "externalCallExecutionAuthorizationRequestStatus",
    "externalCallExecutionAuthorizationDecisionIssued",
    "externalCallExecutionAuthorizationDecisionStatus",
    "externalCallExecutionAuthorized",
    "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision",
    "humanApprovalRequired",
    "separateExternalCallExecutionAuthorizationDecisionRequired",
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
  assert.strictEqual(summary.phase, ORO6H_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(summary.dependsOnOro6gLiveTrafficExternalCallReadinessGate, true);
  assert.strictEqual(summary.oro6gLiveTrafficExternalCallReadinessGatePassed, true);
  assert.strictEqual(summary.externalCallReadinessGatePreparedFromOro6g, true);
  assert.strictEqual(summary.externalCallReadinessGateEvaluatedFromOro6g, true);
  assert.strictEqual(summary.externalCallReadinessGatePassedFromOro6g, true);
  assert.strictEqual(
    summary.externalCallReadinessGateStatusFromOro6g,
    READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestSubmittedFromOro6g,
    false
  );
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationDecisionIssuedFromOro6g,
    false
  );
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6g, false);
  assert.strictEqual(
    summary.nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g,
    true
  );
  assert.strictEqual(
    summary.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(summary.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed, true);
  assert.strictEqual(
    summary.externalCallAuthorizationDecisionStatusFromOro6f,
    APPROVED_FOR_READINESS_ONLY
  );
  assert.strictEqual(summary.externalCallExecutionAuthorizedFromOro6f, false);
  assert.strictEqual(summary.externalCallReadinessGateAllowedFromOro6f, true);
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
  assert.strictEqual(summary.externalCallExecutionAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.externalCallExecutionAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.externalCallExecutionAuthorizationRequestStatus,
    SUBMITTED_PENDING_EXECUTION_DECISION
  );
  assert.strictEqual(summary.externalCallExecutionAuthorizationDecisionStatus, PENDING);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequired, true);
  assert.strictEqual(
    summary.separateExternalCallExecutionAuthorizationDecisionRequired,
    true
  );
  assertNoExecutionDecisionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6H happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoExecutionDecisionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6H hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO6H_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestRecord,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryHarness(
      happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture
    );
  assertHappyPath(happy);

  const record =
    buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestRecord(
      happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture
    );
  assert.strictEqual(record.externalCallExecutionAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    record.externalCallExecutionAuthorizationRequestStatus,
    SUBMITTED_PENDING_EXECUTION_DECISION
  );
  assert.strictEqual(record.externalCallExecutionAuthorizationDecisionIssued, false);
  assert.strictEqual(record.externalCallExecutionAuthorizationDecisionStatus, PENDING);
  assert.strictEqual(record.externalCallExecutionAuthorized, false);

  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gReadinessGateMissingFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gReadinessGateNotPassedFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gReadinessStatusMismatchFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gAlreadySubmittedExecutionRequestFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gAlreadyIssuedExecutionDecisionFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gAlreadyAuthorizedExecutionFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gNextPhaseRequestMissingFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6gSeparateExecutionDecisionMissingFixture
    ),
    "ORO-6G external call readiness gate record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6fDecisionMissingFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6fDecisionStatusMismatchFixture
    ),
    "ORO-6F readiness-only authorization decision record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6eRequestMissingFixture
    ),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6eRequestNotSubmittedFixture
    ),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      oro6dValidationFailedFixture
    ),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      liveTrafficModeMismatchFixture
    ),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      executionAlreadyAuthorizedFixture
    ),
    "ORO-6H must not issue or authorize external call execution"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      executionDecisionAlreadyIssuedFixture
    ),
    "ORO-6H must not issue or authorize external call execution"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      externalNetworkAllowedFixture
    ),
    "external network must remain absent during request submission"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      liveOroPlayApiCallAllowedFixture
    ),
    "live OroPlay API call must remain absent during request submission"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      mutationAttemptFixture
    ),
    "wallet mutation must remain absent during request submission"
  );
  assertHeld(
    evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
      secretLeakFixture
    ),
    "sensitive-shaped values must not leak during request submission"
  );

  const allReports =
    buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestFixtures().map(
      evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary
    );
  assert.strictEqual(allReports.length, 21, "fixture set must cover ORO-6H cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoExecutionDecisionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6H live traffic external call execution authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6H live traffic external call execution authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
