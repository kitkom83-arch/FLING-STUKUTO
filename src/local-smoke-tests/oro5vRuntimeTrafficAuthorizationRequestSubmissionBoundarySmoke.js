"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary");
const fixtures = require("../game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  ORO5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
  PASS,
  REQUEST_RESULT,
  REQUEST_SCOPE,
  REQUEST_STATUS,
  assertOro5vNoExternalNetwork,
  assertOro5vNoLiveTraffic,
  assertOro5vNoRuntimeDecisionOrGrant,
  assertOro5vNoRuntimeMoneyMutation,
  assertOro5vReadinessFromOro5u,
  assertOro5vRequestSubmittedOnly,
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput,
  validateOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
} = helper;

const {
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures,
  dbTransactionDetectedFixture,
  externalNetworkDetectedFixture,
  happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  liveTrafficEnabledAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  migrationDetectedFixture,
  missingReadinessFromOro5uFixture,
  prismaWriteDetectedFixture,
  publicAliasWrongModeFixture,
  runtimeDecisionIssuedAttemptFixture,
  runtimeGrantAttemptFixture,
  runtimeRequestNotSubmittedFixture,
  runtimeRequestWrongScopeFixture,
  runtimeTrafficEnabledAttemptFixture,
  sensitiveValueLeakFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5V =
  "docs/ORO_5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const DOC_5U =
  "docs/ORO_5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5vSmoke.js";
const SCRIPT = "smoke:oro-5v";
const ORO5V_SURFACE_FILES = Object.freeze([
  DOC_5V,
  "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundarySmoke.js",
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

function assertProtectedRuntimeFilesUntouched() {
  const changed = gitChangedFiles([
    "src/app.js",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/ledger-mock",
    "prisma",
    ".env",
  ]);
  assert.deepStrictEqual(changed, []);
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
  const doc5u = readRequired(DOC_5U);
  for (const marker of [
    "runtimeTrafficAuthorizationRequestReadinessBoundaryResult = PASS",
    "runtimeTrafficAuthorizationRequestReady = true",
    "runtimeTrafficAuthorizationRequestPrepared = true",
    "runtimeTrafficAuthorizationRequestSubmitted = false",
    "nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission = true",
  ]) {
    assert(doc5u.includes(marker), `${DOC_5U} missing marker ${marker}.`);
  }

  const doc5v = readRequired(DOC_5V);
  for (const marker of [
    "## ORO-5V scope",
    "runtimeTrafficAuthorizationRequestSubmissionBoundaryResult = PASS",
    "dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness = true",
    "runtimeTrafficAuthorizationRequestReadyFromOro5u = true",
    "runtimeTrafficAuthorizationRequestPreparedFromOro5u = true",
    "runtimeTrafficAuthorizationRequestSubmitted = true",
    "runtimeTrafficAuthorizationRequestStatus = submitted_pending_decision",
    "runtimeTrafficAuthorizationRequestResult = submitted",
    "runtimeTrafficAuthorizationRequestScope = runtime_traffic_authorization_decision_request_only",
    "runtimeTrafficAuthorizationDecisionIssued = false",
    "runtimeTrafficAuthorizationGranted = false",
    "runtimeTrafficAllowed = false",
    "runtimeTrafficEnabled = false",
    "liveTrafficAuthorizationRequestSubmitted = false",
    "liveTrafficAuthorizationDecisionIssued = false",
    "liveTrafficAllowed = false",
    "liveTrafficEnabled = false",
    "apiBalancePublicAliasMounted = true",
    "apiTransactionPublicAliasMounted = true",
    "apiBalancePublicAliasMode = fail_closed_no_mutation",
    "apiTransactionPublicAliasMode = fail_closed_no_mutation",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresRuntimeTrafficAuthorizationDecision = true",
    "nextPhaseRequiresSeparateLiveTrafficApproval = true",
  ]) {
    assert(doc5v.includes(marker), `${DOC_5V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5v", "oro-5v", DOC_5V]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [
    "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary.js",
    "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures.js",
    "src/local-smoke-tests/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundarySmoke.js",
    WRAPPER,
  ]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["ORO-5V runtime traffic authorization request submission boundary", SCRIPT],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5V Current", "runtime traffic authorization request submission record only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5V current/local runtime traffic authorization request submission boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5V Runtime Traffic Authorization Request Submission Boundary Coverage", SCRIPT],
    ],
    [DOC_5U, ["ORO-5V submits the runtime traffic authorization request record"]],
    [
      "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md",
      ["ORO-5V submits the runtime traffic authorization request record"],
    ],
    [
      "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md",
      ["ORO-5V submits the runtime traffic authorization request record"],
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
  const boundaryText = [
    "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary.js",
    "src/game-provider-mock/oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures.js",
    DOC_5V,
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5V boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5V_SURFACE_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.runtimeTrafficAuthorizationGranted, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.liveTrafficAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.liveTrafficAllowed, false);
  assert.strictEqual(summary.liveTrafficEnabled, false);
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
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "runtimeTrafficAuthorizationRequestSubmissionBoundaryResult",
    "dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness",
    "runtimeTrafficAuthorizationRequestReadyFromOro5u",
    "runtimeTrafficAuthorizationRequestPreparedFromOro5u",
    "runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered",
    "runtimeTrafficAuthorizationRequestSubmissionChecked",
    "runtimeTrafficAuthorizationRequestSubmitted",
    "runtimeTrafficAuthorizationRequestStatus",
    "runtimeTrafficAuthorizationRequestResult",
    "runtimeTrafficAuthorizationRequestScope",
    "runtimeTrafficAuthorizationDecisionIssued",
    "runtimeTrafficAuthorizationGranted",
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "liveTrafficAuthorizationRequestSubmitted",
    "liveTrafficAuthorizationDecisionIssued",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
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
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "secretsLeaked",
    "nextPhaseRequiresRuntimeTrafficAuthorizationDecision",
    "nextPhaseRequiresSeparateLiveTrafficApproval",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-5V");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture"
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness,
    true
  );
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestReadyFromOro5u, true);
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestPreparedFromOro5u,
    true
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered,
    true
  );
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestSubmissionChecked, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestSubmitted, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestStatus, REQUEST_STATUS);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestResult, REQUEST_RESULT);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestScope, REQUEST_SCOPE);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresRuntimeTrafficAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5V happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5V hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
    "function"
  );
  assert.strictEqual(typeof assertOro5vReadinessFromOro5u, "function");
  assert.strictEqual(typeof assertOro5vRequestSubmittedOnly, "function");
  assert.strictEqual(typeof assertOro5vNoRuntimeDecisionOrGrant, "function");
  assert.strictEqual(typeof assertOro5vNoLiveTraffic, "function");
  assert.strictEqual(typeof assertOro5vNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5vNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
    happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5vReadinessFromOro5u(happy), true);
  assert.strictEqual(assertOro5vRequestSubmittedOnly(happy), true);
  assert.strictEqual(assertOro5vNoRuntimeDecisionOrGrant(happy), true);
  assert.strictEqual(assertOro5vNoLiveTraffic(happy), true);
  assert.strictEqual(assertOro5vNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5vNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      missingReadinessFromOro5uFixture
    ),
    "ORO-5U runtime traffic request readiness must be ready and prepared"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      publicAliasWrongModeFixture
    ),
    "public aliases must remain mounted in fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      runtimeRequestNotSubmittedFixture
    ),
    "runtime traffic authorization request must be submitted only for decision"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      runtimeRequestWrongScopeFixture
    ),
    "runtime traffic authorization request must be submitted only for decision"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      runtimeDecisionIssuedAttemptFixture
    ),
    "runtime traffic decision, grant, and enablement must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      runtimeGrantAttemptFixture
    ),
    "runtime traffic decision, grant, and enablement must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      runtimeTrafficEnabledAttemptFixture
    ),
    "runtime traffic decision, grant, and enablement must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      liveTrafficRequestSubmittedAttemptFixture
    ),
    "live traffic must remain outside ORO-5V"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      liveTrafficEnabledAttemptFixture
    ),
    "live traffic must remain outside ORO-5V"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      walletMutationDetectedFixture
    ),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      ledgerMutationDetectedFixture
    ),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      prismaWriteDetectedFixture
    ),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      dbTransactionDetectedFixture
    ),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      migrationDetectedFixture
    ),
    "migration must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      externalNetworkDetectedFixture
    ),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      liveOroPlayCallDetectedFixture
    ),
    "live OroPlay API call must remain absent"
  );
  assertHeld(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
      sensitiveValueLeakFixture
    ),
    "sensitive-shaped values must not leak"
  );

  const validation = validateOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures().map(
      buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary
    );
  assert(allReports.length >= 18, "fixture set must cover ORO-5V required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-5V runtime traffic authorization request submission boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-5V runtime traffic authorization request submission boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
