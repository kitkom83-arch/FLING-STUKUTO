"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  handleOroplayBalanceStub,
  handleOroplayTransactionStub,
} = require("../controllers/oroplayCallbackStub.controller");
const helper = require("../game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundary");
const fixtures = require("../game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundaryFixtures");

const {
  BALANCE_ALIAS_PATH,
  FAIL_CLOSED_NO_MUTATION,
  ORO5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_STATUS,
  PASS,
  TRANSACTION_ALIAS_PATH,
  assertOro5tNoExternalNetwork,
  assertOro5tNoRuntimeMutation,
  assertOro5tNoRuntimeOrLiveApproval,
  assertOro5tPostImplementationValidationPassed,
  buildOro5tPublicAliasPostImplementationValidationBoundary,
  buildOro5tPublicAliasPostImplementationValidationBoundaryInput,
  validateOro5tPublicAliasPostImplementationValidationBoundary,
} = helper;

const {
  balanceAliasMissingFixture,
  balanceAliasWrongModeFixture,
  buildOro5tPublicAliasPostImplementationValidationBoundaryFixtures,
  dbTransactionDetectedFixture,
  duplicateTransactionMutatesTwiceFixture,
  externalNetworkDetectedFixture,
  happyPathPublicAliasPostImplementationValidationFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  liveTrafficApprovalIssuedFixture,
  malformedPayloadNotFailClosedFixture,
  missingOro5sImplementationFixture,
  mockAuthMismatchNotFailClosedFixture,
  prismaWriteDetectedFixture,
  responseNotSanitizedFixture,
  runtimeTrafficApprovalIssuedFixture,
  sensitiveValueLeakFixture,
  transactionAliasMissingFixture,
  transactionAliasWrongModeFixture,
  unknownUserNotFailClosedFixture,
  unsupportedTransactionTypeAcceptedFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const APP = "src/app.js";
const DOC_5T = "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5tSmoke.js";
const SCRIPT = "smoke:oro-5t";
const ORO5T_SURFACE_FILES = Object.freeze([
  DOC_5T,
  "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundary.js",
  "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5tPublicAliasPostImplementationValidationBoundarySmoke.js",
  WRAPPER,
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function invokeHandler(handler) {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  handler({}, response);
  return response;
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

function assertAppAliasWiring() {
  const app = readRequired(APP);
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `src/app.js missing marker ${marker}.`);
  }

  const unsafeAliasPatterns = [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    "runtimeTrafficEnabled: true",
    "liveTrafficEnabled: true",
    "PrismaClient",
    "prisma.",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
    "liveOroPlayApi",
    "wallet.service",
    "ledger.service",
  ];
  for (const marker of unsafeAliasPatterns) {
    assert(!app.includes(marker), `src/app.js alias validation must not contain ${marker}.`);
  }
}

function assertAliasHandlerSafety() {
  for (const [label, handler, callbackType] of [
    [BALANCE_ALIAS_PATH, handleOroplayBalanceStub, "balance"],
    [TRANSACTION_ALIAS_PATH, handleOroplayTransactionStub, "transaction"],
  ]) {
    const response = invokeHandler(handler);
    assert.strictEqual(response.statusCode, 503, `${label} must default to fail-closed 503.`);
    assert.strictEqual(response.body.success, false, `${label} must not report success.`);
    assert.strictEqual(response.body.result, "fail_closed", `${label} must fail closed.`);
    assert.strictEqual(response.body.callbackType, callbackType, `${label} type mismatch.`);
    assert.strictEqual(response.body.safety.noWalletMutation, true, `${label} must block wallet mutation.`);
    assert.strictEqual(response.body.safety.noLedgerMutation, true, `${label} must block ledger mutation.`);
    assert.strictEqual(response.body.safety.noExternalNetwork, true, `${label} must block external network.`);
    assertNoSensitiveShape(`${label} response`, JSON.stringify(response.body));
  }
}

function assertDocsAndRegistration() {
  const doc5t = readRequired(DOC_5T);
  for (const marker of [
    "## ORO-5T scope",
    "publicAliasPostImplementationValidationBoundaryResult = PASS",
    "publicAliasImplementationFromOro5s = true",
    "apiBalancePublicAliasMounted = true",
    "apiTransactionPublicAliasMounted = true",
    "apiBalancePublicAliasMode = fail_closed_no_mutation",
    "apiTransactionPublicAliasMode = fail_closed_no_mutation",
    "runtimeTrafficApprovalIssued = false",
    "liveTrafficApprovalIssued = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "secretsLeaked = false",
  ]) {
    assert(doc5t.includes(marker), `${DOC_5T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5t", "oro-5t", DOC_5T]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["ORO-5T public alias post-implementation validation boundary", SCRIPT],
    ],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-5T Current", "fail_closed_no_mutation"]],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5T current/local public alias post-implementation validation boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5T Public Alias Post-Implementation Validation Boundary Coverage", SCRIPT],
    ],
    [
      "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md",
      ["ORO-5T validates the public alias implementation after ORO-5S"],
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
    DOC_5T,
    "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundary.js",
    "src/game-provider-mock/oro5tPublicAliasPostImplementationValidationBoundaryFixtures.js",
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5T boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5T_SURFACE_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.runtimeTrafficApprovalIssued, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.liveTrafficApprovalIssued, false);
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
    "publicAliasPostImplementationValidationBoundaryResult",
    "dependsOnOro5sPublicAliasImplementationBoundary",
    "publicAliasImplementationFromOro5s",
    "publicAliasPostImplementationValidationBoundaryEntered",
    "publicAliasPostImplementationValidated",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasPath",
    "apiTransactionPublicAliasPath",
    "apiBalancePublicAliasMapsTo",
    "apiTransactionPublicAliasMapsTo",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
    "apiBalancePublicAliasFailClosedValidated",
    "apiTransactionPublicAliasFailClosedValidated",
    "apiBalancePublicAliasNoMutationValidated",
    "apiTransactionPublicAliasNoMutationValidated",
    "malformedPayloadFailClosed",
    "unknownUserFailClosed",
    "mockAuthMismatchFailClosed",
    "duplicateTransactionNoDoubleMutation",
    "unsupportedTransactionTypeFailClosedOrManualReview",
    "responseSanitized",
    "runtimeTrafficApprovalIssued",
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "liveTrafficApprovalIssued",
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
    "nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval",
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
  assert.strictEqual(summary.phase, "ORO-5T");
  assert.strictEqual(summary.fixtureId, "happyPathPublicAliasPostImplementationValidationFixture");
  assert.strictEqual(summary.publicAliasPostImplementationValidationBoundaryResult, PASS);
  assert.strictEqual(summary.dependsOnOro5sPublicAliasImplementationBoundary, true);
  assert.strictEqual(summary.publicAliasImplementationFromOro5s, true);
  assert.strictEqual(summary.publicAliasPostImplementationValidationBoundaryEntered, true);
  assert.strictEqual(summary.publicAliasPostImplementationValidated, true);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasPath, BALANCE_ALIAS_PATH);
  assert.strictEqual(summary.apiTransactionPublicAliasPath, TRANSACTION_ALIAS_PATH);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiBalancePublicAliasFailClosedValidated, true);
  assert.strictEqual(summary.apiTransactionPublicAliasFailClosedValidated, true);
  assert.strictEqual(summary.apiBalancePublicAliasNoMutationValidated, true);
  assert.strictEqual(summary.apiTransactionPublicAliasNoMutationValidated, true);
  assert.strictEqual(summary.malformedPayloadFailClosed, true);
  assert.strictEqual(summary.unknownUserFailClosed, true);
  assert.strictEqual(summary.mockAuthMismatchFailClosed, true);
  assert.strictEqual(summary.duplicateTransactionNoDoubleMutation, true);
  assert.strictEqual(summary.unsupportedTransactionTypeFailClosedOrManualReview, true);
  assert.strictEqual(summary.responseSanitized, true);
  assertNoMutationFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5T happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.publicAliasPostImplementationValidationBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5T hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_STATUS, "object");
  assert.strictEqual(
    typeof buildOro5tPublicAliasPostImplementationValidationBoundaryInput,
    "function"
  );
  assert.strictEqual(typeof buildOro5tPublicAliasPostImplementationValidationBoundary, "function");
  assert.strictEqual(
    typeof validateOro5tPublicAliasPostImplementationValidationBoundary,
    "function"
  );
  assert.strictEqual(typeof assertOro5tPostImplementationValidationPassed, "function");
  assert.strictEqual(typeof assertOro5tNoRuntimeOrLiveApproval, "function");
  assert.strictEqual(typeof assertOro5tNoRuntimeMutation, "function");
  assert.strictEqual(typeof assertOro5tNoExternalNetwork, "function");

  assertAppAliasWiring();
  assertAliasHandlerSafety();
  assertDocsAndRegistration();
  assertStaticSafety();

  const happy = buildOro5tPublicAliasPostImplementationValidationBoundary(
    happyPathPublicAliasPostImplementationValidationFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5tPostImplementationValidationPassed(happy), true);
  assert.strictEqual(assertOro5tNoRuntimeOrLiveApproval(happy), true);
  assert.strictEqual(assertOro5tNoRuntimeMutation(happy), true);
  assert.strictEqual(assertOro5tNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(missingOro5sImplementationFixture),
    "ORO-5S fail-closed public alias implementation is required"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(balanceAliasMissingFixture),
    "balance public alias must validate fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(transactionAliasMissingFixture),
    "transaction public alias must validate fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(balanceAliasWrongModeFixture),
    "balance public alias must validate fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(transactionAliasWrongModeFixture),
    "transaction public alias must validate fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(malformedPayloadNotFailClosedFixture),
    "malformed payload must fail closed"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(unknownUserNotFailClosedFixture),
    "unknown user must fail closed"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(mockAuthMismatchNotFailClosedFixture),
    "mock auth mismatch must fail closed"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(duplicateTransactionMutatesTwiceFixture),
    "duplicate transaction must not double mutate"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(unsupportedTransactionTypeAcceptedFixture),
    "unsupported transaction type must fail closed or route to manual review"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(responseNotSanitizedFixture),
    "response must remain sanitized"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(runtimeTrafficApprovalIssuedFixture),
    "runtime and live traffic must remain unapproved and disabled"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(liveTrafficApprovalIssuedFixture),
    "runtime and live traffic must remain unapproved and disabled"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(dbTransactionDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );
  assertHeld(
    buildOro5tPublicAliasPostImplementationValidationBoundary(sensitiveValueLeakFixture),
    "sensitive-shaped values must not leak"
  );

  const validation = validateOro5tPublicAliasPostImplementationValidationBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5tPublicAliasPostImplementationValidationBoundaryFixtures().map(
      buildOro5tPublicAliasPostImplementationValidationBoundary
    );
  assert(allReports.length >= 20, "fixture set must cover ORO-5T required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5T public alias post-implementation validation boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5T public alias post-implementation validation boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
