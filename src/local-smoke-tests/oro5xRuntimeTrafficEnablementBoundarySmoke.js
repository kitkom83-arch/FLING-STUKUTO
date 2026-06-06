"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5xRuntimeTrafficEnablementBoundary");
const fixtures = require("../game-provider-mock/oro5xRuntimeTrafficEnablementBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE_FROM_ORO5W,
  ORO5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  assertOro5xDecisionGrantFromOro5w,
  assertOro5xNoExternalNetwork,
  assertOro5xNoLiveTraffic,
  assertOro5xNoRuntimeMoneyMutation,
  assertOro5xPublicAliasRuntimeTraffic,
  assertOro5xRuntimeTrafficEnabledFailClosed,
  buildOro5xRuntimeTrafficEnablementBoundary,
  buildOro5xRuntimeTrafficEnablementBoundaryInput,
  validateOro5xRuntimeTrafficEnablementBoundary,
} = helper;

const {
  aliasRuntimeTrafficNotEnabledFixture,
  aliasRuntimeTrafficWrongModeFixture,
  buildOro5xRuntimeTrafficEnablementBoundaryFixtures,
  dbTransactionDetectedFixture,
  duplicateTransactionMutationFixture,
  enablementBoundaryNotEnteredFixture,
  externalNetworkDetectedFixture,
  happyPathRuntimeTrafficEnablementFailClosedFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  liveTrafficEnabledAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  malformedPayloadNotFailClosedFixture,
  migrationDetectedFixture,
  missingDecisionGrantFromOro5wFixture,
  prismaWriteDetectedFixture,
  publicAliasMissingFixture,
  publicAliasWrongModeFixture,
  responseNotSanitizedFixture,
  runtimeTrafficNotEnabledFixture,
  runtimeTrafficWrongModeFixture,
  sensitiveValueLeakFixture,
  walletMutationDetectedFixture,
  wrongGrantScopeFromOro5wFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5X = "docs/ORO_5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const DOC_5W =
  "docs/ORO_5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_5V =
  "docs/ORO_5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const DOC_5U =
  "docs/ORO_5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const DOC_5T =
  "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md";
const DOC_5S = "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md";
const APP = "src/app.js";
const WRAPPER = "src/local-smoke-tests/oro5xSmoke.js";
const SCRIPT = "smoke:oro-5x";
const ORO5X_SECRET_SCAN_FILES = Object.freeze([
  DOC_5X,
  "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundary.js",
  "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundaryFixtures.js",
  "src/local-smoke-tests/oro5xRuntimeTrafficEnablementBoundarySmoke.js",
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

function assertAppAliasesReuseFailClosedHandlers() {
  const app = readRequired(APP);
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `src/app.js missing public alias marker ${marker}.`);
  }
  for (const forbidden of [
    "PrismaClient",
    "prisma.",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
    "walletMutationPerformed: true",
    "ledgerMutationPerformed: true",
    "liveOroPlayApiCalled: true",
  ]) {
    assert(!app.includes(forbidden), `src/app.js must not include ${forbidden}.`);
  }
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
  const doc5w = readRequired(DOC_5W);
  for (const marker of [
    "runtimeTrafficAuthorizationDecisionBoundaryResult = PASS",
    "runtimeTrafficAuthorizationGranted = true",
    "runtimeTrafficAuthorizationGrantScope = runtime_traffic_enablement_boundary_only",
    "runtimeTrafficEnablementAuthorized = true",
    "runtimeTrafficEnablementBoundaryEntryAllowed = true",
    "ORO-5X enables runtime traffic only in fail-closed no-mutation mode",
  ]) {
    assert(doc5w.includes(marker), `${DOC_5W} missing marker ${marker}.`);
  }

  for (const doc of [DOC_5V, DOC_5U, DOC_5T, DOC_5S]) {
    const text = readRequired(doc);
    assert(
      text.includes("ORO-5X enables runtime traffic only in fail-closed no-mutation mode"),
      `${doc} missing ORO-5X downstream marker.`
    );
  }

  const doc5x = readRequired(DOC_5X);
  for (const marker of [
    "## ORO-5X scope",
    "## Dependency on ORO-5W authorization decision",
    "runtimeTrafficEnablementBoundaryResult = PASS",
    "dependsOnOro5wRuntimeTrafficAuthorizationDecision = true",
    "runtimeTrafficAuthorizationGrantedFromOro5w = true",
    "runtimeTrafficAuthorizationGrantScopeFromOro5w = runtime_traffic_enablement_boundary_only",
    "runtimeTrafficEnablementAuthorizedFromOro5w = true",
    "runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w = true",
    "runtimeTrafficEnablementBoundaryEntered = true",
    "runtimeTrafficEnablementBoundaryChecked = true",
    "runtimeTrafficImplemented = true",
    "runtimeTrafficPatchImplemented = true",
    "runtimeTrafficAllowed = true",
    "runtimeTrafficEnabled = true",
    "runtimeTrafficMode = fail_closed_no_mutation",
    "apiBalancePublicAliasMounted = true",
    "apiTransactionPublicAliasMounted = true",
    "apiBalanceRuntimeTrafficEnabled = true",
    "apiTransactionRuntimeTrafficEnabled = true",
    "malformedPayloadFailClosed = true",
    "duplicateTransactionNoDoubleMutation = true",
    "liveTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresRuntimeTrafficPostEnablementValidation = true",
    "nextPhaseRequiresSeparateLiveTrafficApproval = true",
  ]) {
    assert(doc5x.includes(marker), `${DOC_5X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5x", "oro-5x", DOC_5X]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [
    "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundary.js",
    "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundaryFixtures.js",
    "src/local-smoke-tests/oro5xRuntimeTrafficEnablementBoundarySmoke.js",
    WRAPPER,
  ]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5X runtime traffic enablement boundary",
        "runtimeTrafficMode=fail_closed_no_mutation",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5X Current", "runtime traffic enablement boundary only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5X current/local runtime traffic enablement boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5X Runtime Traffic Enablement Boundary Coverage", SCRIPT],
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
    "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundary.js",
    "src/game-provider-mock/oro5xRuntimeTrafficEnablementBoundaryFixtures.js",
    DOC_5X,
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5X boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5X_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
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
    "runtimeTrafficEnablementBoundaryResult",
    "dependsOnOro5wRuntimeTrafficAuthorizationDecision",
    "runtimeTrafficAuthorizationGrantedFromOro5w",
    "runtimeTrafficAuthorizationGrantScopeFromOro5w",
    "runtimeTrafficEnablementAuthorizedFromOro5w",
    "runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w",
    "runtimeTrafficEnablementBoundaryEntered",
    "runtimeTrafficEnablementBoundaryChecked",
    "runtimeTrafficImplemented",
    "runtimeTrafficPatchImplemented",
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "runtimeTrafficMode",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
    "apiBalanceRuntimeTrafficEnabled",
    "apiTransactionRuntimeTrafficEnabled",
    "apiBalanceRuntimeTrafficMode",
    "apiTransactionRuntimeTrafficMode",
    "malformedPayloadFailClosed",
    "unknownUserFailClosed",
    "mockAuthMismatchFailClosed",
    "duplicateTransactionNoDoubleMutation",
    "unsupportedTransactionTypeFailClosedOrManualReview",
    "responseSanitized",
    "liveTrafficAuthorizationRequestSubmitted",
    "liveTrafficAuthorizationDecisionIssued",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
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
    "nextPhaseRequiresRuntimeTrafficPostEnablementValidation",
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
  assert.strictEqual(summary.phase, "ORO-5X");
  assert.strictEqual(summary.fixtureId, "happyPathRuntimeTrafficEnablementFailClosedFixture");
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryResult, PASS);
  assert.strictEqual(summary.dependsOnOro5wRuntimeTrafficAuthorizationDecision, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationGrantedFromOro5w, true);
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationGrantScopeFromOro5w,
    GRANT_SCOPE_FROM_ORO5W
  );
  assert.strictEqual(summary.runtimeTrafficEnablementAuthorizedFromOro5w, true);
  assert.strictEqual(
    summary.runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w,
    true
  );
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryEntered, true);
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryChecked, true);
  assert.strictEqual(summary.runtimeTrafficImplemented, true);
  assert.strictEqual(summary.runtimeTrafficPatchImplemented, true);
  assert.strictEqual(summary.runtimeTrafficAllowed, true);
  assert.strictEqual(summary.runtimeTrafficEnabled, true);
  assert.strictEqual(summary.runtimeTrafficMode, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiBalanceRuntimeTrafficEnabled, true);
  assert.strictEqual(summary.apiTransactionRuntimeTrafficEnabled, true);
  assert.strictEqual(summary.apiBalanceRuntimeTrafficMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionRuntimeTrafficMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.malformedPayloadFailClosed, true);
  assert.strictEqual(summary.unknownUserFailClosed, true);
  assert.strictEqual(summary.mockAuthMismatchFailClosed, true);
  assert.strictEqual(summary.duplicateTransactionNoDoubleMutation, true);
  assert.strictEqual(summary.unsupportedTransactionTypeFailClosedOrManualReview, true);
  assert.strictEqual(summary.responseSanitized, true);
  assertNoMutationFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresRuntimeTrafficPostEnablementValidation, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5X happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5X hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro5xRuntimeTrafficEnablementBoundaryInput, "function");
  assert.strictEqual(typeof buildOro5xRuntimeTrafficEnablementBoundary, "function");
  assert.strictEqual(typeof validateOro5xRuntimeTrafficEnablementBoundary, "function");
  assert.strictEqual(typeof assertOro5xDecisionGrantFromOro5w, "function");
  assert.strictEqual(typeof assertOro5xRuntimeTrafficEnabledFailClosed, "function");
  assert.strictEqual(typeof assertOro5xPublicAliasRuntimeTraffic, "function");
  assert.strictEqual(typeof assertOro5xNoLiveTraffic, "function");
  assert.strictEqual(typeof assertOro5xNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5xNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertAppAliasesReuseFailClosedHandlers();
  assertStaticSafety();

  const happy = buildOro5xRuntimeTrafficEnablementBoundary(
    happyPathRuntimeTrafficEnablementFailClosedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5xDecisionGrantFromOro5w(happy), true);
  assert.strictEqual(assertOro5xRuntimeTrafficEnabledFailClosed(happy), true);
  assert.strictEqual(assertOro5xPublicAliasRuntimeTraffic(happy), true);
  assert.strictEqual(assertOro5xNoLiveTraffic(happy), true);
  assert.strictEqual(assertOro5xNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5xNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(missingDecisionGrantFromOro5wFixture),
    "ORO-5W runtime traffic enablement grant is required"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(wrongGrantScopeFromOro5wFixture),
    "ORO-5W runtime traffic enablement grant is required"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(enablementBoundaryNotEnteredFixture),
    "runtime traffic enablement boundary must be entered and enabled"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(runtimeTrafficNotEnabledFixture),
    "runtime traffic enablement boundary must be entered and enabled"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(runtimeTrafficWrongModeFixture),
    "runtime traffic mode must remain fail-closed no-mutation"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(publicAliasMissingFixture),
    "public aliases must remain mounted in fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(publicAliasWrongModeFixture),
    "public aliases must remain mounted in fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(aliasRuntimeTrafficNotEnabledFixture),
    "public alias runtime traffic must be fail-closed no-mutation only"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(aliasRuntimeTrafficWrongModeFixture),
    "public alias runtime traffic must be fail-closed no-mutation only"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(malformedPayloadNotFailClosedFixture),
    "runtime request behavior must remain fail-closed and sanitized"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(duplicateTransactionMutationFixture),
    "runtime request behavior must remain fail-closed and sanitized"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(responseNotSanitizedFixture),
    "runtime request behavior must remain fail-closed and sanitized"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(liveTrafficRequestSubmittedAttemptFixture),
    "live traffic must remain outside ORO-5X"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(liveTrafficEnabledAttemptFixture),
    "live traffic must remain outside ORO-5X"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(dbTransactionDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(migrationDetectedFixture),
    "migration must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );
  assertHeld(
    buildOro5xRuntimeTrafficEnablementBoundary(sensitiveValueLeakFixture),
    "sensitive-shaped values must not leak"
  );

  const validation = validateOro5xRuntimeTrafficEnablementBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5xRuntimeTrafficEnablementBoundaryFixtures().map(
      buildOro5xRuntimeTrafficEnablementBoundary
    );
  assert(allReports.length >= 23, "fixture set must cover ORO-5X required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5X runtime traffic enablement boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5X runtime traffic enablement boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
