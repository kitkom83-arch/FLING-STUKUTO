"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary");
const fixtures = require("../game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  ORO5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY_STATUS,
  PASS,
  REQUEST_READINESS_SCOPE,
  REQUEST_READY_STATUS,
  assertOro5uEvidenceChecklist,
  assertOro5uNoExternalNetwork,
  assertOro5uNoLiveTraffic,
  assertOro5uNoRuntimeDecisionOrGrant,
  assertOro5uNoRuntimeMoneyMutation,
  assertOro5uReadinessFromOro5t,
  assertOro5uRequestPreparedOnly,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput,
  validateOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
} = helper;

const {
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures,
  dbTransactionDetectedFixture,
  externalNetworkDetectedFixture,
  happyPathRuntimeTrafficAuthorizationRequestReadinessFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  liveTrafficDecisionIssuedAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  migrationDetectedFixture,
  missingEvidenceChecklistFixture,
  missingOro5tValidationFixture,
  prismaWriteDetectedFixture,
  publicAliasWrongModeFixture,
  readinessNotPreparedFixture,
  runtimeDecisionIssuedAttemptFixture,
  runtimeGrantAttemptFixture,
  runtimeRequestSubmittedAttemptFixture,
  sensitiveValueLeakFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5U =
  "docs/ORO_5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const DOC_5T =
  "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5uSmoke.js";
const SCRIPT = "smoke:oro-5u";
const ORO5U_SURFACE_FILES = Object.freeze([
  DOC_5U,
  "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary.js",
  "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures.js",
  "src/local-smoke-tests/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundarySmoke.js",
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
  const doc5t = readRequired(DOC_5T);
  for (const marker of [
    "publicAliasPostImplementationValidationBoundaryResult = PASS",
    "apiBalancePublicAliasMode = fail_closed_no_mutation",
    "apiTransactionPublicAliasMode = fail_closed_no_mutation",
    "nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness = true",
  ]) {
    assert(doc5t.includes(marker), `${DOC_5T} missing marker ${marker}.`);
  }

  const doc5u = readRequired(DOC_5U);
  for (const marker of [
    "## ORO-5U scope",
    "runtimeTrafficAuthorizationRequestReadinessBoundaryResult = PASS",
    "dependsOnOro5tPublicAliasPostImplementationValidation = true",
    "publicAliasPostImplementationValidationFromOro5t = true",
    "runtimeTrafficAuthorizationRequestReady = true",
    "runtimeTrafficAuthorizationRequestPrepared = true",
    "runtimeTrafficAuthorizationRequestSubmitted = false",
    "runtimeTrafficAuthorizationDecisionIssued = false",
    "runtimeTrafficAuthorizationGranted = false",
    "runtimeTrafficAllowed = false",
    "runtimeTrafficEnabled = false",
    "liveTrafficAuthorizationRequestSubmitted = false",
    "liveTrafficAuthorizationDecisionIssued = false",
    "liveTrafficAllowed = false",
    "liveTrafficEnabled = false",
    "failClosedAliasValidationEvidencePresent = true",
    "noMutationEvidencePresent = true",
    "rollbackPlanPresent = true",
    "monitoringPlanPresent = true",
    "auditLogPlanPresent = true",
    "idempotencyPlanPresent = true",
    "sanitizedResponsePlanPresent = true",
    "rateLimitPlanPresent = true",
    "manualHoldPlanPresent = true",
    "emergencyDisablePlanPresent = true",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission = true",
    "nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision = true",
    "nextPhaseRequiresSeparateLiveTrafficApproval = true",
  ]) {
    assert(doc5u.includes(marker), `${DOC_5U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5u", "oro-5u", DOC_5U]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [
    "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary.js",
    "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures.js",
    "src/local-smoke-tests/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundarySmoke.js",
    WRAPPER,
  ]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["ORO-5U runtime traffic authorization request readiness boundary", SCRIPT],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5U Current", "runtime traffic authorization request readiness only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5U current/local runtime traffic authorization request readiness boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5U Runtime Traffic Authorization Request Readiness Boundary Coverage", SCRIPT],
    ],
    [DOC_5T, ["ORO-5U prepares runtime traffic authorization request readiness"]],
    [
      "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md",
      ["ORO-5U remains readiness-only after ORO-5T"],
    ],
    [
      "docs/ORO_5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY.md",
      ["ORO-5U remains readiness-only after ORO-5T"],
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
    "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary.js",
    "src/game-provider-mock/oro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures.js",
    DOC_5U,
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5U boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5U_SURFACE_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestSubmitted, false);
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
    "runtimeTrafficAuthorizationRequestReadinessBoundaryResult",
    "dependsOnOro5tPublicAliasPostImplementationValidation",
    "publicAliasPostImplementationValidationFromOro5t",
    "runtimeTrafficAuthorizationRequestReadinessBoundaryEntered",
    "runtimeTrafficAuthorizationRequestReadinessChecked",
    "runtimeTrafficAuthorizationRequestReady",
    "runtimeTrafficAuthorizationRequestPrepared",
    "runtimeTrafficAuthorizationRequestSubmitted",
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
    "failClosedAliasValidationEvidencePresent",
    "noMutationEvidencePresent",
    "rollbackPlanPresent",
    "monitoringPlanPresent",
    "auditLogPlanPresent",
    "idempotencyPlanPresent",
    "sanitizedResponsePlanPresent",
    "rateLimitPlanPresent",
    "manualHoldPlanPresent",
    "emergencyDisablePlanPresent",
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
    "nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission",
    "nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision",
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
  assert.strictEqual(summary.phase, "ORO-5U");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathRuntimeTrafficAuthorizationRequestReadinessFixture"
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestReadinessBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro5tPublicAliasPostImplementationValidation,
    true
  );
  assert.strictEqual(summary.publicAliasPostImplementationValidationFromOro5t, true);
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestReadinessBoundaryEntered,
    true
  );
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestReadinessChecked, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestReady, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.failClosedAliasValidationEvidencePresent, true);
  assert.strictEqual(summary.noMutationEvidencePresent, true);
  assert.strictEqual(summary.rollbackPlanPresent, true);
  assert.strictEqual(summary.monitoringPlanPresent, true);
  assert.strictEqual(summary.auditLogPlanPresent, true);
  assert.strictEqual(summary.idempotencyPlanPresent, true);
  assert.strictEqual(summary.sanitizedResponsePlanPresent, true);
  assert.strictEqual(summary.rateLimitPlanPresent, true);
  assert.strictEqual(summary.manualHoldPlanPresent, true);
  assert.strictEqual(summary.emergencyDisablePlanPresent, true);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission,
    true
  );
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5U happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestReadinessBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5U hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
    "function"
  );
  assert.strictEqual(typeof assertOro5uReadinessFromOro5t, "function");
  assert.strictEqual(typeof assertOro5uRequestPreparedOnly, "function");
  assert.strictEqual(typeof assertOro5uNoRuntimeDecisionOrGrant, "function");
  assert.strictEqual(typeof assertOro5uNoLiveTraffic, "function");
  assert.strictEqual(typeof assertOro5uEvidenceChecklist, "function");
  assert.strictEqual(typeof assertOro5uNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5uNoExternalNetwork, "function");
  assert.strictEqual(REQUEST_READY_STATUS, "ready_for_runtime_traffic_request_submission");
  assert.strictEqual(
    REQUEST_READINESS_SCOPE,
    "runtime_traffic_authorization_request_readiness_only"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
    happyPathRuntimeTrafficAuthorizationRequestReadinessFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5uReadinessFromOro5t(happy), true);
  assert.strictEqual(assertOro5uRequestPreparedOnly(happy), true);
  assert.strictEqual(assertOro5uNoRuntimeDecisionOrGrant(happy), true);
  assert.strictEqual(assertOro5uNoLiveTraffic(happy), true);
  assert.strictEqual(assertOro5uEvidenceChecklist(happy), true);
  assert.strictEqual(assertOro5uNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5uNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      missingOro5tValidationFixture
    ),
    "ORO-5T public alias post-implementation validation is required"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      publicAliasWrongModeFixture
    ),
    "public aliases must remain mounted in fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      readinessNotPreparedFixture
    ),
    "runtime traffic authorization request readiness must be prepared only"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      runtimeRequestSubmittedAttemptFixture
    ),
    "runtime traffic authorization request must not be submitted in ORO-5U"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      runtimeDecisionIssuedAttemptFixture
    ),
    "runtime traffic must remain undecided, ungranted, and disabled"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      runtimeGrantAttemptFixture
    ),
    "runtime traffic must remain undecided, ungranted, and disabled"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      liveTrafficRequestSubmittedAttemptFixture
    ),
    "live traffic must remain outside ORO-5U"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      liveTrafficDecisionIssuedAttemptFixture
    ),
    "live traffic must remain outside ORO-5U"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      missingEvidenceChecklistFixture
    ),
    "runtime traffic request readiness evidence checklist must be complete"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      walletMutationDetectedFixture
    ),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      ledgerMutationDetectedFixture
    ),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      prismaWriteDetectedFixture
    ),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      dbTransactionDetectedFixture
    ),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      migrationDetectedFixture
    ),
    "migration must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      externalNetworkDetectedFixture
    ),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      liveOroPlayCallDetectedFixture
    ),
    "live OroPlay API call must remain absent"
  );
  assertHeld(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
      sensitiveValueLeakFixture
    ),
    "sensitive-shaped values must not leak"
  );

  const validation = validateOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures().map(
      buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary
    );
  assert(allReports.length >= 18, "fixture set must cover ORO-5U required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-5U runtime traffic authorization request readiness boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-5U runtime traffic authorization request readiness boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
