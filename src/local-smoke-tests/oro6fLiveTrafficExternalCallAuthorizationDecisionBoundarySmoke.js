"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryFixtures");

const {
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
  ORO6F_EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
  ORO6F_PHASE,
  PASS,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionRecord,
  evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
  runOro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryHarness,
} = helper;

const {
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionFixtures,
  decisionApprovesExecutionNowFixture,
  externalNetworkAllowedFixture,
  happyPathLiveTrafficExternalCallAuthorizationDecisionFixture,
  liveOroPlayApiCallAllowedFixture,
  liveTrafficModeMismatchFixture,
  mutationAttemptFixture,
  oro6dValidationFailedFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6eRequestStatusNotPendingDecisionFixture,
  secretLeakFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6F =
  "docs/ORO_6F_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_6E =
  "docs/ORO_6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6D =
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6fSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6fLiveTrafficExternalCallAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6f";
const LONG_SCRIPT =
  "smoke:oro-6f-live-traffic-external-call-authorization-decision-boundary";
const ORO6F_SECRET_SCAN_FILES = Object.freeze([
  DOC_6F,
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
  const doc6f = readRequired(DOC_6F);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6E",
    "## Dependency on ORO-6D",
    "## Readiness-only decision boundary",
    "decision status = approved_for_readiness_only",
    "not approved_to_call_now",
    "## No external network",
    "## No live OroPlay API call",
    "## No mutation, persistence, deploy, or real-money statement",
    "## Next phase readiness gate",
    "## Secret redaction rules",
    "## Decision output JSON",
    "## Rollback and blocker rules",
    "liveTrafficExternalCallAuthorizationDecisionBoundaryResult = PASS",
    "dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary = true",
    "oro6eLiveTrafficExternalCallAuthorizationRequestPassed = true",
    "externalCallAuthorizationRequestSubmittedFromOro6e = true",
    "externalCallAuthorizationRequestStatusFromOro6e = submitted_pending_decision",
    "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true",
    "oro6dLiveTrafficPostEnablementValidationPassed = true",
    "liveTrafficModeFromOro6d = fail_closed_no_mutation",
    "externalCallAuthorizationDecisionIssued = true",
    "externalCallAuthorizationDecisionStatus = approved_for_readiness_only",
    "externalCallExecutionAuthorized = false",
    "externalNetworkAllowed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCallAllowed = false",
    "liveOroPlayApiCalled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "migrationPerformed = false",
    "secretsLeaked = false",
  ]) {
    assert(doc6f.includes(marker), `${DOC_6F} missing marker ${marker}.`);
  }

  const doc6e = readRequired(DOC_6E);
  for (const marker of [
    "ORO-6F is required for external/live OroPlay call authorization decision",
    "approved_for_readiness_only",
    "ORO-6E does not authorize execution",
  ]) {
    assert(doc6e.includes(marker), `${DOC_6E} missing marker ${marker}.`);
  }

  const doc6d = readRequired(DOC_6D);
  for (const marker of [
    "ORO-6F still requires ORO-6D validation to remain passed",
    "ORO-6F does not allow external network or live OroPlay API calls",
  ]) {
    assert(doc6d.includes(marker), `${DOC_6D} missing marker ${marker}.`);
  }

  const doc6c = readRequired(DOC_6C);
  assert(
    doc6c.includes("ORO-6C live traffic enablement remains a prerequisite boundary"),
    `${DOC_6C} missing ORO-6 prerequisite marker.`
  );

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6f", "oro-6f", DOC_6F]) {
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
        "ORO-6F records external/live call authorization decision only",
        "approved_for_readiness_only",
        "not approved_to_call_now",
        "no outgoing live OroPlay API call yet",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6F Current",
        "approved_for_readiness_only",
        "external/live OroPlay call execution still blocked",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6F current/live traffic external call authorization decision boundary",
        "next phase blocked until external call readiness gate",
        "next phase blocked until separate external call execution authorization",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6F Live Traffic External Call Authorization Decision Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6F].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6F files must not contain ${marker}.`);
  }
  for (const file of ORO6F_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoExecutionOrCallFlags(summary) {
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
    "liveTrafficExternalCallAuthorizationDecisionBoundaryResult",
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
    "externalCallAuthorizationDecisionPrepared",
    "externalCallAuthorizationDecisionRecorded",
    "externalCallAuthorizationDecisionIssued",
    "externalCallAuthorizationDecisionStatus",
    "externalCallExecutionAuthorized",
    "externalCallReadinessGateAllowedNext",
    "nextPhaseRequiresExternalCallReadinessGate",
    "nextPhaseRequiresSeparateExternalCallExecutionAuthorization",
    "humanApprovalRequired",
    "separateExternalCallExecutionDecisionRequired",
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
  assert.strictEqual(summary.phase, ORO6F_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficExternalCallAuthorizationDecisionFixture"
  );
  assert.strictEqual(
    summary.liveTrafficExternalCallAuthorizationDecisionBoundaryResult,
    PASS
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
  assert.strictEqual(summary.externalCallAuthorizationDecisionPrepared, true);
  assert.strictEqual(summary.externalCallAuthorizationDecisionRecorded, true);
  assert.strictEqual(summary.externalCallAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.externalCallAuthorizationDecisionStatus,
    APPROVED_FOR_READINESS_ONLY
  );
  assert.strictEqual(summary.externalCallReadinessGateAllowedNext, true);
  assert.strictEqual(summary.nextPhaseRequiresExternalCallReadinessGate, true);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateExternalCallExecutionAuthorization,
    true
  );
  assert.strictEqual(summary.humanApprovalRequired, true);
  assert.strictEqual(summary.separateExternalCallExecutionDecisionRequired, true);
  assertNoExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6F happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficExternalCallAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6F hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6F_EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro6fLiveTrafficExternalCallAuthorizationDecisionRecord,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof runOro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryHarness,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    runOro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryHarness(
      happyPathLiveTrafficExternalCallAuthorizationDecisionFixture
    );
  assertHappyPath(happy);
  assert.strictEqual(
    buildOro6fLiveTrafficExternalCallAuthorizationDecisionRecord(
      happyPathLiveTrafficExternalCallAuthorizationDecisionFixture
    ).externalCallExecutionAuthorized,
    false
  );

  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      oro6eRequestMissingFixture
    ),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      oro6eRequestNotSubmittedFixture
    ),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      oro6eRequestStatusNotPendingDecisionFixture
    ),
    "ORO-6E external call authorization request record is required"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      oro6dValidationFailedFixture
    ),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      liveTrafficModeMismatchFixture
    ),
    "ORO-6D live traffic post-enablement validation record is required"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      decisionApprovesExecutionNowFixture
    ),
    "external call decision must be approved_for_readiness_only and not execution authorization"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      externalNetworkAllowedFixture
    ),
    "external network must remain absent during readiness-only decision"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      liveOroPlayApiCallAllowedFixture
    ),
    "live OroPlay API call must remain absent during readiness-only decision"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      mutationAttemptFixture
    ),
    "wallet mutation must remain absent during readiness-only decision"
  );
  assertHeld(
    evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
      secretLeakFixture
    ),
    "sensitive-shaped values must not leak during readiness-only decision"
  );

  const allReports =
    buildOro6fLiveTrafficExternalCallAuthorizationDecisionFixtures().map(
      evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary
    );
  assert(allReports.length >= 11, "fixture set must cover ORO-6F required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6F live traffic external call authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6F live traffic external call authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
