"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const {
  handleOroplayBalanceStub,
  handleOroplayTransactionStub,
} = require("../controllers/oroplayCallbackStub.controller");
const helper = require("../game-provider-mock/oro5sPublicAliasImplementationBoundary");
const fixtures = require("../game-provider-mock/oro5sPublicAliasImplementationBoundaryFixtures");

const {
  BALANCE_ALIAS_PATH,
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE,
  ORO5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY_STATUS,
  PASS,
  TRANSACTION_ALIAS_PATH,
  assertOro5sAuthorizedFromOro5r,
  assertOro5sNoExternalNetwork,
  assertOro5sNoRuntimeMoneyMutation,
  assertOro5sNoRuntimeTraffic,
  assertOro5sPublicAliasesImplementedFailClosed,
  buildOro5sPublicAliasImplementationBoundary,
  buildOro5sPublicAliasImplementationBoundaryInput,
  buildOro5sSafetyLockSummary,
  validateOro5sPublicAliasImplementationBoundary,
} = helper;

const {
  balanceAliasMissingFixture,
  balanceAliasRuntimeTrafficFixture,
  buildOro5sPublicAliasImplementationBoundaryFixtures,
  dbTransactionDetectedFixture,
  externalNetworkDetectedFixture,
  happyPathPublicAliasImplementationFailClosedFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  missingOro5rGrantFixture,
  prismaWriteDetectedFixture,
  runtimeTrafficDetectedFixture,
  transactionAliasMissingFixture,
  transactionAliasRuntimeTrafficFixture,
  walletMutationDetectedFixture,
  wrongGrantScopeFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const APP = "src/app.js";
const DOC_5S = "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md";
const DOC_5R = "docs/ORO_5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY.md";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const WRAPPER = "src/local-smoke-tests/oro5sSmoke.js";
const SCRIPT = "smoke:oro-5s";
const ORO5S_SURFACE_FILES = Object.freeze([
  APP,
  DOC_5S,
  "src/game-provider-mock/oro5sPublicAliasImplementationBoundary.js",
  "src/game-provider-mock/oro5sPublicAliasImplementationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5sPublicAliasImplementationBoundarySmoke.js",
  WRAPPER,
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function gitChangedFiles() {
  const result = spawnSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git diff --name-only failed: ${result.stderr}`);
  return new Set(
    result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function assertRuntimeScope() {
  const changed = gitChangedFiles();
  assert(changed.has(APP), "ORO-5S must change src/app.js for alias wiring.");
  for (const forbidden of [ROUTE_FILE, CONTROLLER_FILE]) {
    assert(!changed.has(forbidden), `${forbidden} must not be modified by ORO-5S.`);
  }
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
  assert(!app.includes('app.use("/api/balance"'), "balance alias must not mount a new router.");
  assert(!app.includes('app.use("/api/transaction"'), "transaction alias must not mount a new router.");
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
    assert.strictEqual(response.body.safety.failClosed, true, `${label} must mark failClosed.`);
    assert.strictEqual(response.body.safety.noWalletMutation, true, `${label} must block wallet mutation.`);
    assert.strictEqual(response.body.safety.noLedgerMutation, true, `${label} must block ledger mutation.`);
    assert.strictEqual(response.body.safety.noExternalNetwork, true, `${label} must block external network.`);
    assertNoSensitiveShape(`${label} response`, JSON.stringify(response.body));
  }
}

function assertDocsAndRegistration() {
  const doc5r = readRequired(DOC_5R);
  assert(
    doc5r.includes("ORO-5S implements the public alias wiring as fail-closed no-mutation"),
    `${DOC_5R} missing ORO-5S downstream marker.`
  );

  const doc5s = readRequired(DOC_5S);
  for (const marker of [
    "## ORO-5S scope",
    "## Dependency on ORO-5R authorization decision",
    "publicAliasImplementationBoundaryResult = PASS",
    "publicAliasAuthorizationGrantedFromOro5r = true",
    "publicAliasAuthorizationGrantScopeFromOro5r = public_alias_implementation_boundary_only",
    "publicAliasImplemented = true",
    "publicAliasPatchImplemented = true",
    "apiBalancePublicAliasMounted = true",
    "apiTransactionPublicAliasMounted = true",
    "apiBalancePublicAliasMode = fail_closed_no_mutation",
    "apiTransactionPublicAliasMode = fail_closed_no_mutation",
    "runtimeTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "secretsLeaked = false",
  ]) {
    assert(doc5s.includes(marker), `${DOC_5S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5s", "oro-5s"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["ORO-5S public alias implementation boundary", "fail_closed_no_mutation"],
    ],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-5S Current", "fail_closed_no_mutation"]],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5S current/local public alias implementation boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5S Public Alias Implementation Boundary Coverage", SCRIPT],
    ],
    [
      "docs/ORO_5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
      ["ORO-5S implements the public alias wiring as fail-closed no-mutation"],
    ],
    [
      [
        "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_",
        "PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5S implements the public alias wiring as fail-closed no-mutation"],
    ],
    [
      "docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md",
      ["ORO-5S implements the public alias wiring as fail-closed no-mutation"],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
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
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact credential shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes credential URL shape.`);
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
    "src/game-provider-mock/oro5sPublicAliasImplementationBoundary.js",
    "src/game-provider-mock/oro5sPublicAliasImplementationBoundaryFixtures.js",
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5S boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5S_SURFACE_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    assertNoSensitiveShape(file, fs.readFileSync(absolutePath, "utf8"));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
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
    "publicAliasImplementationBoundaryResult",
    "dependsOnOro5rPublicAliasAuthorizationDecision",
    "publicAliasAuthorizationGrantedFromOro5r",
    "publicAliasAuthorizationGrantScopeFromOro5r",
    "publicAliasImplementationBoundaryEntered",
    "publicAliasImplementationBoundaryChecked",
    "publicAliasImplemented",
    "publicAliasPatchImplemented",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasPath",
    "apiTransactionPublicAliasPath",
    "apiBalancePublicAliasMapsTo",
    "apiTransactionPublicAliasMapsTo",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
    "apiBalancePublicAliasRuntimeTrafficEnabled",
    "apiTransactionPublicAliasRuntimeTrafficEnabled",
    "srcAppChangedInOro5s",
    "runtimeRouteControllerChangedInOro5s",
    "runtimeTrafficEnabled",
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
    "nextPhaseRequiresPostAliasValidationBoundary",
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
  assert.strictEqual(summary.phase, "ORO-5S");
  assert.strictEqual(summary.fixtureId, "happyPathPublicAliasImplementationFailClosedFixture");
  assert.strictEqual(summary.publicAliasImplementationBoundaryResult, PASS);
  assert.strictEqual(summary.dependsOnOro5rPublicAliasAuthorizationDecision, true);
  assert.strictEqual(summary.publicAliasAuthorizationGrantedFromOro5r, true);
  assert.strictEqual(summary.publicAliasAuthorizationGrantScopeFromOro5r, GRANT_SCOPE);
  assert.strictEqual(summary.publicAliasImplementationBoundaryEntered, true);
  assert.strictEqual(summary.publicAliasImplementationBoundaryChecked, true);
  assert.strictEqual(summary.publicAliasImplemented, true);
  assert.strictEqual(summary.publicAliasPatchImplemented, true);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasPath, BALANCE_ALIAS_PATH);
  assert.strictEqual(summary.apiTransactionPublicAliasPath, TRANSACTION_ALIAS_PATH);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiBalancePublicAliasRuntimeTrafficEnabled, false);
  assert.strictEqual(summary.apiTransactionPublicAliasRuntimeTrafficEnabled, false);
  assert.strictEqual(summary.srcAppChangedInOro5s, true);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5s, false);
  assertNoMutationFlags(summary);
  assert.strictEqual(summary.nextPhaseRequiresPostAliasValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5S happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.publicAliasImplementationBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5S hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro5sPublicAliasImplementationBoundaryInput, "function");
  assert.strictEqual(typeof buildOro5sPublicAliasImplementationBoundary, "function");
  assert.strictEqual(typeof validateOro5sPublicAliasImplementationBoundary, "function");
  assert.strictEqual(typeof buildOro5sSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5sAuthorizedFromOro5r, "function");
  assert.strictEqual(typeof assertOro5sPublicAliasesImplementedFailClosed, "function");
  assert.strictEqual(typeof assertOro5sNoRuntimeTraffic, "function");
  assert.strictEqual(typeof assertOro5sNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5sNoExternalNetwork, "function");

  assertRuntimeScope();
  assertAppAliasWiring();
  assertAliasHandlerSafety();
  assertDocsAndRegistration();
  assertStaticSafety();

  const happy = buildOro5sPublicAliasImplementationBoundary(
    happyPathPublicAliasImplementationFailClosedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5sAuthorizedFromOro5r(happy), true);
  assert.strictEqual(assertOro5sPublicAliasesImplementedFailClosed(happy), true);
  assert.strictEqual(assertOro5sNoRuntimeTraffic(happy), true);
  assert.strictEqual(assertOro5sNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5sNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(missingOro5rGrantFixture),
    "ORO-5R implementation-boundary grant is required"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(wrongGrantScopeFixture),
    "ORO-5R implementation-boundary grant is required"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(balanceAliasMissingFixture),
    "balance public alias must map fail-closed without runtime traffic"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(transactionAliasMissingFixture),
    "transaction public alias must map fail-closed without runtime traffic"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(balanceAliasRuntimeTrafficFixture),
    "balance public alias must map fail-closed without runtime traffic"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(transactionAliasRuntimeTrafficFixture),
    "transaction public alias must map fail-closed without runtime traffic"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(runtimeTrafficDetectedFixture),
    "runtime and live traffic must remain disabled"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(dbTransactionDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5sPublicAliasImplementationBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );

  const validation = validateOro5sPublicAliasImplementationBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5sSafetyLockSummary();
  assert.strictEqual(safety.publicAliasImplemented, true);
  assert.strictEqual(safety.apiBalancePublicAliasMounted, true);
  assert.strictEqual(safety.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(safety.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(safety.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.externalNetworkCalled, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports = buildOro5sPublicAliasImplementationBoundaryFixtures().map(
    buildOro5sPublicAliasImplementationBoundary
  );
  assert(allReports.length >= 14, "fixture set must cover ORO-5S required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5S public alias implementation boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5S public alias implementation boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
