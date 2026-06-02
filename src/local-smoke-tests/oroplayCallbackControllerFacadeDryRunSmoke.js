"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS,
  assertOroplayFacadeNoAliasEnabled,
  assertOroplayFacadeNoExpressRouteWiring,
  assertOroplayFacadeNoMutation,
  assertOroplayFacadeNoNetwork,
  assertOroplayFacadeNoPrismaWrite,
  buildOroplayControllerFacadeDryRunSummary,
  buildOroplayMockCallbackAuthDecision,
  handleOroplayBalanceCallbackFacadeDryRun,
  handleOroplayTransactionCallbackFacadeDryRun,
  runOroplayControllerFacadeDryRunFlow,
  validateOroplayControllerFacadeDryRun,
} = require("../game-provider-mock/oroplayCallbackControllerFacadeDryRun");
const {
  buildOroplayCallbackControllerFacadeFixtures,
  buildOroplayControllerFacadeProofFlags,
} = require("../game-provider-mock/oroplayCallbackControllerFacadeFixtures");
const {
  OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS,
  invokeOroplayShadowEnvelopeFlow,
  validateOroplayRequestResponseEnvelope,
} = require("../game-provider-mock/oroplayCallbackRequestResponseEnvelope");
const {
  invokeOroplayRuntimeSkeletonShadow,
  validateOroplayShadowInvocationDecision,
} = require("../game-provider-mock/oroplayCallbackRuntimeShadowInvoker");
const {
  buildOroplayStagingWiringPrecheck,
  validateOroplayStagingWiringPrecheck,
} = require("../game-provider-mock/oroplayCallbackStagingWiringPrecheck");
const { evaluateOroplayRuntimeDisabledGate } = require("../game-provider-mock/oroplayCallbackRuntimeDisabledGate");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const FACADE_DOC = "docs/OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN.md";
const FACADE_HELPER = "src/game-provider-mock/oroplayCallbackControllerFacadeDryRun.js";
const FACADE_FIXTURES = "src/game-provider-mock/oroplayCallbackControllerFacadeFixtures.js";
const FACADE_SMOKE = "src/local-smoke-tests/oroplayCallbackControllerFacadeDryRunSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [FACADE_DOC, FACADE_HELPER, FACADE_FIXTURES, FACADE_SMOKE];
const NEW_MOCK_FILES = [FACADE_HELPER, FACADE_FIXTURES];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function scenarioByName(name) {
  const scenario = buildOroplayCallbackControllerFacadeFixtures().find((entry) => entry.name === name);
  assert(scenario, `missing scenario ${name}.`);
  return scenario;
}

function runScenario(name) {
  return runOroplayControllerFacadeDryRunFlow(scenarioByName(name).mockRequest);
}

function assertDocsAndRegistration() {
  const doc = readRequired(FACADE_DOC);
  const helper = readRequired(FACADE_HELPER);
  readRequired(FACADE_FIXTURES);

  assertIncludes("ORO-4E facade doc", doc, [
    "## ORO-4E scope",
    "## controller facade dry-run purpose",
    "## facade vs real Express controller",
    "## mock auth decision",
    "## balance facade flow",
    "## transaction facade flow",
    "## request envelope usage",
    "## shadow invocation usage",
    "## response envelope usage",
    "## unauthorized fail_closed behavior",
    "## malformed request fail_closed behavior",
    "## duplicate replay behavior",
    "## conflicting duplicate behavior",
    "## insufficient balance behavior",
    "## sanitized log behavior",
    "## no Express route wiring proof",
    "## no alias proof",
    "## no wallet mutation proof",
    "## no ledger mutation proof",
    "## no Prisma write proof",
    "## no external network proof",
    "## future staging controller requirements",
    "## explicit no-real-money boundary",
    "expressRouteWired=false",
    "runtimeWiredToLiveRoute=false",
    "aliasBalanceEnabled=false",
    "aliasTransactionEnabled=false",
    "walletMutationAllowed=false",
    "ledgerMutationAllowed=false",
    "prismaWriteAllowed=false",
    "externalNetworkAllowed=false",
    "activationAllowed=false",
  ]);

  assertIncludes("facade helper exports", helper, [
    "OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS",
    "buildOroplayMockCallbackAuthDecision",
    "handleOroplayBalanceCallbackFacadeDryRun",
    "handleOroplayTransactionCallbackFacadeDryRun",
    "runOroplayControllerFacadeDryRunFlow",
    "validateOroplayControllerFacadeDryRun",
    "buildOroplayControllerFacadeDryRunSummary",
    "assertOroplayFacadeNoExpressRouteWiring",
    "assertOroplayFacadeNoAliasEnabled",
    "assertOroplayFacadeNoMutation",
    "assertOroplayFacadeNoNetwork",
    "assertOroplayFacadeNoPrismaWrite",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-controller-facade-dry-run"],
    "node src/local-smoke-tests/oroplayCallbackControllerFacadeDryRunSmoke.js",
    "package.json missing ORO-4E smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4E registration", runner, [
    "oroplayCallbackControllerFacadeDryRun.js",
    "oroplayCallbackControllerFacadeFixtures.js",
    "oroplayCallbackControllerFacadeDryRunSmoke.js",
    "smoke:oroplay-callback-controller-facade-dry-run",
    "oroplayCallbackControllerFacadeDryRun",
    "docs/OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN.md",
  ]);

  assertIncludes("ORO-4E coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4E OroPlay Callback Controller Facade Dry-Run Coverage",
    "smoke:oroplay-callback-controller-facade-dry-run",
  ]);
  assertIncludes("ORO-4E roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4E current/controller facade dry-run",
    "Callback Controller Facade Dry-Run",
  ]);
  assertIncludes("ORO-4E API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4E callback controller facade dry-run",
  ]);
}

function assertFixtureSet() {
  const names = new Set(buildOroplayCallbackControllerFacadeFixtures().map((scenario) => scenario.name));
  for (const name of [
    "balance facade valid member",
    "balance facade unauthorized mock fail_closed",
    "balance facade unknown member fail_closed",
    "balance facade malformed request fail_closed",
    "transaction facade valid bet",
    "transaction facade valid win",
    "transaction facade unauthorized mock fail_closed",
    "transaction facade duplicate replay idempotent",
    "transaction facade conflicting duplicate manual_review",
    "transaction facade insufficient balance fail_closed",
    "transaction facade unsupported type fail_closed",
    "transaction facade finished round replay blocked",
    "response envelope produced from facade",
    "sanitized facade log preview redacts credential-like keys",
    "proof flags all false",
  ]) {
    assert(names.has(name), `missing fixture scenario: ${name}`);
  }
}

function assertFacadeStatus() {
  assert.strictEqual(OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.defaultDecision, "fail_closed");
  assert.strictEqual(OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.controllerFacadeOnly, true);
  assert.strictEqual(OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.mockAuthDecisionOnly, true);
  assert.strictEqual(OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.expressRouteWired, false);
  assert.strictEqual(OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.activationAllowed, false);

  const auth = buildOroplayMockCallbackAuthDecision({ callbackType: "balance", mockAuth: { allowed: true } });
  assert.strictEqual(auth.authorized, true, "mock auth allowed decision must authorize.");
  assert.strictEqual(auth.credentialValuesRead, false, "mock auth must not read credential values.");

  const defaultResult = runOroplayControllerFacadeDryRunFlow();
  assert.strictEqual(defaultResult.responseEnvelope.status, "fail_closed", "default facade invocation must fail closed.");
  const validation = validateOroplayControllerFacadeDryRun(defaultResult);
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
}

function assertBalanceBehavior() {
  const valid = handleOroplayBalanceCallbackFacadeDryRun(scenarioByName("balance facade valid member").mockRequest);
  assert.strictEqual(valid.authDecision.authorized, true, "valid balance mock auth must authorize.");
  assert.strictEqual(valid.responseEnvelope.envelopeType, "balance_response", "valid balance must return response envelope.");
  assert.strictEqual(valid.responseEnvelope.status, "success", "valid balance facade must succeed.");
  assert.strictEqual(valid.responseEnvelope.responseSource, "mock_only_decision", "balance response must use mock-only decision.");

  const unauthorized = handleOroplayBalanceCallbackFacadeDryRun(
    scenarioByName("balance facade unauthorized mock fail_closed").mockRequest
  );
  assert.strictEqual(unauthorized.authDecision.authorized, false, "unauthorized balance mock must not authorize.");
  assert.strictEqual(unauthorized.responseEnvelope.status, "fail_closed", "unauthorized balance must fail closed.");
  assert.strictEqual(unauthorized.responseEnvelope.reason, "unauthorized_mock", "unauthorized balance reason mismatch.");

  const unknown = handleOroplayBalanceCallbackFacadeDryRun(scenarioByName("balance facade unknown member fail_closed").mockRequest);
  assert.strictEqual(unknown.responseEnvelope.status, "fail_closed", "unknown member must fail closed.");
  assert.strictEqual(unknown.shadowResult.reason, "unknown_member", "unknown member reason mismatch.");

  const malformed = handleOroplayBalanceCallbackFacadeDryRun(
    scenarioByName("balance facade malformed request fail_closed").mockRequest
  );
  assert.strictEqual(malformed.responseEnvelope.status, "fail_closed", "malformed balance request must fail closed.");
  assert(["malformed_request", "malformed_payload"].includes(malformed.responseEnvelope.reason), "malformed reason mismatch.");
}

function assertTransactionBehavior() {
  const bet = handleOroplayTransactionCallbackFacadeDryRun(scenarioByName("transaction facade valid bet").mockRequest);
  assert.strictEqual(bet.responseEnvelope.status, "success", "valid bet facade must succeed.");
  assert.strictEqual(bet.shadowResult.decision, "debit_intent_only", "valid bet must return debit intent only.");
  assert.strictEqual(bet.responseEnvelope.responsePayload.debitIntentOnly, true, "valid bet must expose debit intent only.");
  assert.strictEqual(bet.responseEnvelope.responsePayload.creditIntentOnly, false, "valid bet must not expose credit intent.");

  const win = handleOroplayTransactionCallbackFacadeDryRun(scenarioByName("transaction facade valid win").mockRequest);
  assert.strictEqual(win.responseEnvelope.status, "success", "valid win facade must succeed.");
  assert.strictEqual(win.shadowResult.decision, "credit_intent_only", "valid win must return credit intent only.");
  assert.strictEqual(win.responseEnvelope.responsePayload.creditIntentOnly, true, "valid win must expose credit intent only.");
  assert.strictEqual(win.responseEnvelope.responsePayload.debitIntentOnly, false, "valid win must not expose debit intent.");

  const unauthorized = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade unauthorized mock fail_closed").mockRequest
  );
  assert.strictEqual(unauthorized.authDecision.authorized, false, "unauthorized transaction mock must not authorize.");
  assert.strictEqual(unauthorized.responseEnvelope.status, "fail_closed", "unauthorized transaction must fail closed.");
  assert.strictEqual(unauthorized.responseEnvelope.reason, "unauthorized_mock", "unauthorized transaction reason mismatch.");

  const replay = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade duplicate replay idempotent").mockRequest
  );
  assert.strictEqual(replay.shadowResult.decision, "idempotent_replay", "duplicate replay must be idempotent.");
  assert.strictEqual(replay.responseEnvelope.status, "idempotent_replay", "duplicate replay response status mismatch.");
  assert.strictEqual(replay.responseEnvelope.responsePayload.doubleDebitPrevented, true, "duplicate replay must not double debit.");
  assert.strictEqual(replay.responseEnvelope.responsePayload.doubleCreditPrevented, true, "duplicate replay must not double credit.");
  assert.strictEqual(replay.shadowResult.debitIntent, null, "duplicate replay must not create debit intent.");
  assert.strictEqual(replay.shadowResult.creditIntent, null, "duplicate replay must not create credit intent.");

  const conflict = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade conflicting duplicate manual_review").mockRequest
  );
  assert(["manual_review", "fail_closed"].includes(conflict.responseEnvelope.status), "conflicting duplicate must block.");
  assert.strictEqual(conflict.responseEnvelope.manualReview, true, "conflicting duplicate must enter manual review.");
  assert.strictEqual(conflict.responseEnvelope.failClosed, true, "conflicting duplicate must fail closed.");

  const lowBalance = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade insufficient balance fail_closed").mockRequest
  );
  assert.strictEqual(lowBalance.responseEnvelope.status, "fail_closed", "insufficient balance must fail closed.");
  assert.strictEqual(lowBalance.shadowResult.reason, "insufficient_balance", "insufficient balance reason mismatch.");

  const unsupported = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade unsupported type fail_closed").mockRequest
  );
  assert.strictEqual(unsupported.responseEnvelope.status, "fail_closed", "unsupported type must fail closed.");
  assert.strictEqual(unsupported.requestEnvelope.reason, "unsupported_transaction_type", "unsupported type reason mismatch.");

  const finishedRound = handleOroplayTransactionCallbackFacadeDryRun(
    scenarioByName("transaction facade finished round replay blocked").mockRequest
  );
  assert.strictEqual(finishedRound.responseEnvelope.status, "fail_closed", "finished round replay must fail closed.");
  assert.strictEqual(finishedRound.shadowResult.reason, "finished_round_replay", "finished round reason mismatch.");
}

function assertResponseEnvelopeAndSanitizer() {
  const responseFlow = runScenario("response envelope produced from facade");
  assert(responseFlow.responseEnvelope, "response envelope must exist.");
  assert.strictEqual(responseFlow.responseEnvelope.mockResponseEnvelopeOnly, true, "response must be mock envelope only.");

  const sanitized = runScenario("sanitized facade log preview redacts credential-like keys");
  const previewText = JSON.stringify(sanitized.logPreview) + JSON.stringify(sanitized.requestEnvelope.logPreview);

  for (const leaked of ["mock-facade-sensitive-value", "mock-facade-nested-sensitive-value"]) {
    assert(!previewText.includes(leaked), `sanitized facade preview leaked ${leaked}.`);
  }
  assert(previewText.includes("[REDACTED]"), "sanitized facade preview must include redaction output.");
  assertIncludes("sanitized facade preview markers", previewText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "mock-redaction-key-name",
    "redacted-credential-marker",
  ]);
}

function assertProofFlagsAndSafety() {
  const proof = buildOroplayControllerFacadeProofFlags();
  for (const flag of [
    "expressRouteWiring",
    "walletMutation",
    "ledgerMutation",
    "prismaWrite",
    "externalNetwork",
    "aliasBalance",
    "aliasTransaction",
    "activationAllowed",
  ]) {
    assert.strictEqual(proof[flag], false, `${flag} proof flag must be false.`);
  }

  const scenario = scenarioByName("transaction facade valid bet");
  const flow = runOroplayControllerFacadeDryRunFlow(scenario.mockRequest);
  for (const flag of [
    "expressRouteWired",
    "runtimeWiredToLiveRoute",
    "aliasBalanceEnabled",
    "aliasTransactionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "activationAllowed",
  ]) {
    assert.strictEqual(flow[flag], false, `${flag} must stay false.`);
  }

  assert.doesNotThrow(() => assertOroplayFacadeNoExpressRouteWiring(scenario.mockRequest));
  assert.doesNotThrow(() => assertOroplayFacadeNoAliasEnabled(scenario.mockRequest));
  assert.doesNotThrow(() => assertOroplayFacadeNoMutation(scenario.mockRequest));
  assert.doesNotThrow(() => assertOroplayFacadeNoNetwork(scenario.mockRequest));
  assert.doesNotThrow(() => assertOroplayFacadeNoPrismaWrite(scenario.mockRequest));

  const summary = buildOroplayControllerFacadeDryRunSummary(scenario.mockRequest);
  assert.strictEqual(summary.expressRouteWired, false, "summary expressRouteWired must stay false.");
  assert.strictEqual(summary.oro4dEnvelopeMapperPreserved, true, "summary must preserve ORO-4D.");
}

function assertPreviousPhaseGatesPreserved() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });

  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B fail-closed route must not report success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B route must remain fail_closed.");
  }

  const oro4a = evaluateOroplayRuntimeDisabledGate();
  assert.strictEqual(oro4a.gateStatus, "disabled", "ORO-4A disabled gate must remain disabled.");
  assert.strictEqual(oro4a.runtimeEnabled, false, "ORO-4A must not enable runtime.");
  assert.strictEqual(oro4a.aliasEnabled, false, "ORO-4A must not enable alias.");

  const oro4b = buildOroplayStagingWiringPrecheck();
  assert.strictEqual(oro4b.activationAllowed, false, "ORO-4B precheck must keep activation false.");
  assert.strictEqual(oro4b.runtimeWiredToLiveRoute, false, "ORO-4B precheck must keep route wiring false.");
  const oro4bValidation = validateOroplayStagingWiringPrecheck();
  assert.strictEqual(oro4bValidation.ok, true, oro4bValidation.errors.join("; "));

  const oro4c = invokeOroplayRuntimeSkeletonShadow({
    callbackType: "balance",
    payload: { callbackType: "balance", userCode: "ORO_SHADOW_VALID_001" },
  });
  const oro4cValidation = validateOroplayShadowInvocationDecision(oro4c);
  assert.strictEqual(oro4cValidation.ok, true, oro4cValidation.errors.join("; "));
  assert.strictEqual(oro4c.runtimeWiredToLiveRoute, false, "ORO-4C shadow invocation must stay disconnected.");

  const oro4d = invokeOroplayShadowEnvelopeFlow({
    callbackType: "balance",
    payload: { callbackType: "balance", userCode: "ORO_ENVELOPE_VALID_001" },
  });
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.activationAllowed, false);
  const oro4dValidation = validateOroplayRequestResponseEnvelope(oro4d);
  assert.strictEqual(oro4dValidation.ok, true, oro4dValidation.errors.join("; "));
}

function assertNoAliasesOrExpressWiring() {
  const app = readRequired("src/app.js");
  const routes = readRequired("src/routes/oroplayCallbackStub.routes.js");
  const controller = readRequired("src/controllers/oroplayCallbackStub.controller.js");
  const combined = [app, routes, controller].join("\n");

  assertNotIncludes("provider alias mount", combined, [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]);
  assertNotIncludes("facade runtime live wiring", combined, [
    "oroplayCallbackControllerFacadeDryRun",
    "runOroplayControllerFacadeDryRunFlow",
    "handleOroplayBalanceCallbackFacadeDryRun",
    "handleOroplayTransactionCallbackFacadeDryRun",
  ]);
}

function assertNoForbiddenRuntimeMarkers() {
  const forbiddenPatterns = [
    /require\(["']@prisma\/client["']\)/i,
    /from\s+["']@prisma\/client["']/i,
    /require\(["'][^"']*wallet[^"']*["']\)/i,
    /require\(["'][^"']*ledger[^"']*["']\)/i,
    /from\s+["'][^"']*wallet[^"']*["']/i,
    /from\s+["'][^"']*ledger[^"']*["']/i,
    /\bfetch\s*\(/i,
    /\baxios\b/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
    /\bprisma\s*\.\s*\$transaction\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
  ];

  for (const file of NEW_MOCK_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertNoSecretScanFalsePositiveMarkers() {
  const markerText = NEW_FILES.map((file) => readRequired(file)).join("\n");
  const falsePositiveShapes = [
    new RegExp(`${["Authorization", ":"].join("")}\\s+${["Be", "arer"].join("")}`, "i"),
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["api", "key"].join("-")}\\s*[:=]\\s*["'][A-Za-z0-9_-]{8,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["DATABASE", "_URL"].join("")}\\s*=\\s*["']?[A-Za-z0-9_./:@-]+`, "i"),
  ];

  for (const pattern of falsePositiveShapes) {
    assert(!pattern.test(markerText), `new ORO-4E files contain CI false-positive marker text: ${pattern}.`);
  }

  assertIncludes("safe redaction marker wording", markerText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "mock-redaction-key-name",
    "redacted-credential-marker",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertFixtureSet();
  assertFacadeStatus();
  assertBalanceBehavior();
  assertTransactionBehavior();
  assertResponseEnvelopeAndSanitizer();
  assertProofFlagsAndSafety();
  assertPreviousPhaseGatesPreserved();
  assertNoAliasesOrExpressWiring();
  assertNoForbiddenRuntimeMarkers();
  assertNoSecretScanFalsePositiveMarkers();
  console.log("ORO-4E OroPlay callback controller facade dry-run smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4E OroPlay callback controller facade dry-run smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
