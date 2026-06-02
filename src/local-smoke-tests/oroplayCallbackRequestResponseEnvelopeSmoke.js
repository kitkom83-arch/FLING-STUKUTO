"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS,
  assertOroplayEnvelopeNoAliasEnabled,
  assertOroplayEnvelopeNoLiveRouteWiring,
  assertOroplayEnvelopeNoMutation,
  assertOroplayEnvelopeNoNetwork,
  assertOroplayEnvelopeNoPrismaWrite,
  buildOroplayBalanceResponseEnvelope,
  buildOroplayTransactionResponseEnvelope,
  invokeOroplayShadowEnvelopeFlow,
  normalizeOroplayBalanceRequest,
  normalizeOroplayTransactionRequest,
  validateOroplayRequestResponseEnvelope,
} = require("../game-provider-mock/oroplayCallbackRequestResponseEnvelope");
const {
  buildOroplayCallbackRequestResponseFixtures,
  buildOroplayEnvelopeProofFlags,
} = require("../game-provider-mock/oroplayCallbackRequestResponseFixtures");
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
const ENVELOPE_DOC = "docs/OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE.md";
const ENVELOPE_MAPPER = "src/game-provider-mock/oroplayCallbackRequestResponseEnvelope.js";
const ENVELOPE_FIXTURES = "src/game-provider-mock/oroplayCallbackRequestResponseFixtures.js";
const ENVELOPE_SMOKE = "src/local-smoke-tests/oroplayCallbackRequestResponseEnvelopeSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [ENVELOPE_DOC, ENVELOPE_MAPPER, ENVELOPE_FIXTURES, ENVELOPE_SMOKE];
const NEW_MOCK_FILES = [ENVELOPE_MAPPER, ENVELOPE_FIXTURES];

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
  const scenario = buildOroplayCallbackRequestResponseFixtures().find((entry) => entry.name === name);
  assert(scenario, `missing scenario ${name}.`);
  return scenario;
}

function runScenario(scenario) {
  return invokeOroplayShadowEnvelopeFlow({
    callbackType: scenario.kind,
    payload: scenario.payload,
    state: scenario.state,
    priorInvocations: scenario.priorInvocations,
  });
}

function assertDocsAndRegistration() {
  const doc = readRequired(ENVELOPE_DOC);
  const mapper = readRequired(ENVELOPE_MAPPER);
  readRequired(ENVELOPE_FIXTURES);

  assertIncludes("ORO-4D envelope doc", doc, [
    "## ORO-4D scope",
    "## request/response envelope purpose",
    "## mapper vs live route",
    "## balance request normalization",
    "## transaction request normalization",
    "## balance response envelope",
    "## transaction response envelope",
    "## fail_closed response behavior",
    "## manual_review response behavior",
    "## duplicate replay response behavior",
    "## insufficient balance response behavior",
    "## sanitized log behavior",
    "## no wallet mutation proof",
    "## no ledger mutation proof",
    "## no Prisma write proof",
    "## no external network proof",
    "## no alias proof",
    "## no live route wiring proof",
    "## future staging route wiring requirements",
    "## explicit no-real-money boundary",
    "runtimeWiredToLiveRoute=false",
    "aliasBalanceEnabled=false",
    "aliasTransactionEnabled=false",
    "walletMutationAllowed=false",
    "ledgerMutationAllowed=false",
    "prismaWriteAllowed=false",
    "externalNetworkAllowed=false",
    "activationAllowed=false",
  ]);

  assertIncludes("envelope mapper exports", mapper, [
    "OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS",
    "normalizeOroplayBalanceRequest",
    "normalizeOroplayTransactionRequest",
    "buildOroplayBalanceResponseEnvelope",
    "buildOroplayTransactionResponseEnvelope",
    "invokeOroplayShadowEnvelopeFlow",
    "validateOroplayRequestResponseEnvelope",
    "assertOroplayEnvelopeNoLiveRouteWiring",
    "assertOroplayEnvelopeNoAliasEnabled",
    "assertOroplayEnvelopeNoMutation",
    "assertOroplayEnvelopeNoNetwork",
    "assertOroplayEnvelopeNoPrismaWrite",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-request-response-envelope"],
    "node src/local-smoke-tests/oroplayCallbackRequestResponseEnvelopeSmoke.js",
    "package.json missing ORO-4D smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4D registration", runner, [
    "oroplayCallbackRequestResponseEnvelope.js",
    "oroplayCallbackRequestResponseFixtures.js",
    "oroplayCallbackRequestResponseEnvelopeSmoke.js",
    "smoke:oroplay-callback-request-response-envelope",
    "oroplayCallbackRequestResponseEnvelope",
    "docs/OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE.md",
  ]);

  assertIncludes("ORO-4D coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4D OroPlay Callback Request/Response Envelope Coverage",
    "smoke:oroplay-callback-request-response-envelope",
  ]);
  assertIncludes("ORO-4D roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4D current/request response envelope mapper",
    "Callback Request/Response Envelope Mapper",
  ]);
  assertIncludes("ORO-4D API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4D callback request/response envelope mapper",
  ]);
}

function assertFixtureSet() {
  const names = new Set(buildOroplayCallbackRequestResponseFixtures().map((scenario) => scenario.name));
  for (const name of [
    "balance request envelope valid member",
    "balance request envelope unknown member fail_closed",
    "balance request malformed payload fail_closed",
    "transaction request valid bet",
    "transaction request valid win",
    "transaction request duplicate replay idempotent",
    "transaction request conflicting duplicate manual_review",
    "transaction request insufficient balance fail_closed",
    "transaction request unsupported type fail_closed",
    "transaction request finished round replay blocked",
    "response envelope success shape",
    "response envelope fail_closed shape",
    "response envelope manual_review shape",
    "sanitized response/log preview redacts credential-like keys",
    "proof flags all false",
  ]) {
    assert(names.has(name), `missing fixture scenario: ${name}`);
  }
}

function assertEnvelopeStatus() {
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.defaultDecision, "fail_closed");
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.mapperOnly, true);
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.mockResponseEnvelopeOnly, true);
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.activationAllowed, false);
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.runtimeWiredToLiveRoute, false);
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.aliasBalanceEnabled, false);
  assert.strictEqual(OROPLAY_CALLBACK_REQUEST_RESPONSE_ENVELOPE_STATUS.aliasTransactionEnabled, false);

  const defaultResult = invokeOroplayShadowEnvelopeFlow();
  assert.strictEqual(defaultResult.response.status, "fail_closed", "default envelope invocation must fail closed.");
  const validation = validateOroplayRequestResponseEnvelope(defaultResult);
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
}

function assertBalanceBehavior() {
  const scenario = scenarioByName("balance request envelope valid member");
  const normalized = normalizeOroplayBalanceRequest(scenario.payload);
  assert.strictEqual(normalized.normalized, true, "valid balance request must normalize.");
  assert.strictEqual(normalized.shadowPayload.callbackType, "balance");
  assert.strictEqual(normalized.shadowPayload.userCode, "ORO_ENVELOPE_VALID_001");

  const flow = runScenario(scenario);
  assert.strictEqual(flow.shadowResult.decision, "mock_balance_available", "valid balance must use mock decision.");
  assert.strictEqual(flow.response.status, "success", "valid balance response must succeed.");
  assert.strictEqual(flow.response.responseSource, "mock_only_decision", "balance response must use mock-only decision.");
  assert.strictEqual(flow.response.responsePayload.balance, 1000, "balance response must include fixture balance.");

  const unknown = runScenario(scenarioByName("balance request envelope unknown member fail_closed"));
  assert.strictEqual(unknown.response.status, "fail_closed", "unknown member must fail closed.");
  assert.strictEqual(unknown.shadowResult.reason, "unknown_member", "unknown member reason mismatch.");

  const malformed = runScenario(scenarioByName("balance request malformed payload fail_closed"));
  assert.strictEqual(malformed.response.status, "fail_closed", "malformed balance payload must fail closed.");
  assert.strictEqual(malformed.request.reason, "malformed_payload", "malformed balance reason mismatch.");
}

function assertTransactionBehavior() {
  const betScenario = scenarioByName("transaction request valid bet");
  const normalizedBet = normalizeOroplayTransactionRequest(betScenario.payload);
  assert.strictEqual(normalizedBet.normalized, true, "valid bet request must normalize.");
  assert.strictEqual(normalizedBet.shadowPayload.amount, -25, "bet request must become debit signed amount.");
  const bet = runScenario(betScenario);
  assert.strictEqual(bet.shadowResult.decision, "debit_intent_only", "valid bet must return debit intent only.");
  assert.strictEqual(bet.response.status, "success", "valid bet response must succeed.");
  assert.strictEqual(bet.response.responsePayload.debitIntentOnly, true, "valid bet must expose debit intent only.");
  assert.strictEqual(bet.response.responsePayload.creditIntentOnly, false, "valid bet must not expose credit intent.");

  const win = runScenario(scenarioByName("transaction request valid win"));
  assert.strictEqual(win.shadowResult.decision, "credit_intent_only", "valid win must return credit intent only.");
  assert.strictEqual(win.response.status, "success", "valid win response must succeed.");
  assert.strictEqual(win.response.responsePayload.creditIntentOnly, true, "valid win must expose credit intent only.");
  assert.strictEqual(win.response.responsePayload.debitIntentOnly, false, "valid win must not expose debit intent.");

  const replay = runScenario(scenarioByName("transaction request duplicate replay idempotent"));
  assert.strictEqual(replay.shadowResult.decision, "idempotent_replay", "duplicate replay must be idempotent.");
  assert.strictEqual(replay.response.status, "idempotent_replay", "duplicate replay response status mismatch.");
  assert.strictEqual(replay.response.responsePayload.doubleDebitPrevented, true, "duplicate replay must not double debit.");
  assert.strictEqual(replay.response.responsePayload.doubleCreditPrevented, true, "duplicate replay must not double credit.");
  assert.strictEqual(replay.shadowResult.debitIntent, null, "duplicate replay must not create debit intent.");
  assert.strictEqual(replay.shadowResult.creditIntent, null, "duplicate replay must not create credit intent.");

  const conflict = runScenario(scenarioByName("transaction request conflicting duplicate manual_review"));
  assert(["manual_review", "fail_closed"].includes(conflict.response.status), "conflicting duplicate must block.");
  assert.strictEqual(conflict.response.manualReview, true, "conflicting duplicate must enter manual review.");
  assert.strictEqual(conflict.response.failClosed, true, "conflicting duplicate must fail closed.");

  const lowBalance = runScenario(scenarioByName("transaction request insufficient balance fail_closed"));
  assert.strictEqual(lowBalance.response.status, "fail_closed", "insufficient balance must fail closed.");
  assert.strictEqual(lowBalance.shadowResult.reason, "insufficient_balance", "insufficient balance reason mismatch.");

  const unsupported = runScenario(scenarioByName("transaction request unsupported type fail_closed"));
  assert.strictEqual(unsupported.response.status, "fail_closed", "unsupported type must fail closed.");
  assert.strictEqual(unsupported.request.reason, "unsupported_transaction_type", "unsupported type reason mismatch.");

  const finishedRound = runScenario(scenarioByName("transaction request finished round replay blocked"));
  assert.strictEqual(finishedRound.response.status, "fail_closed", "finished round replay must fail closed.");
  assert.strictEqual(finishedRound.shadowResult.reason, "finished_round_replay", "finished round reason mismatch.");
}

function assertResponseShapes() {
  const successFlow = runScenario(scenarioByName("balance request envelope valid member"));
  const success = buildOroplayBalanceResponseEnvelope(successFlow.shadowResult);
  assert.strictEqual(success.envelopeType, "balance_response", "success balance envelope type mismatch.");
  assert.strictEqual(success.status, "success", "success response shape must exist.");
  assert.strictEqual(success.mockResponseEnvelopeOnly, true, "success response must be mock-only.");

  const failClosed = buildOroplayTransactionResponseEnvelope({
    callbackType: "transaction",
    decision: "fail_closed",
    reason: "mock_fail_closed_shape",
    failClosed: true,
    manualReview: false,
  });
  assert.strictEqual(failClosed.envelopeType, "transaction_response", "fail_closed envelope type mismatch.");
  assert.strictEqual(failClosed.status, "fail_closed", "fail_closed response shape must exist.");
  assert.strictEqual(failClosed.failClosed, true, "fail_closed response must mark failClosed.");

  const manualReview = buildOroplayTransactionResponseEnvelope({
    callbackType: "transaction",
    decision: "fail_closed",
    reason: "mock_manual_review_shape",
    failClosed: true,
    manualReview: true,
  });
  assert.strictEqual(manualReview.status, "manual_review", "manual_review response shape must exist.");
  assert.strictEqual(manualReview.manualReview, true, "manual_review response must mark manualReview.");
}

function assertSanitizerAndProofFlags() {
  const scenario = scenarioByName("sanitized response/log preview redacts credential-like keys");
  const flow = runScenario(scenario);
  const previewText = JSON.stringify(flow.request.logPreview) + JSON.stringify(flow.response.logPreview);

  for (const leaked of ["mock-envelope-sensitive-value", "mock-envelope-nested-sensitive-value"]) {
    assert(!previewText.includes(leaked), `sanitized preview leaked ${leaked}.`);
  }
  assert(previewText.includes("[REDACTED]"), "sanitized preview must include redaction output.");
  assertIncludes("sanitized preview markers", previewText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "mock-redaction-key-name",
    "redacted-credential-marker",
  ]);

  const proof = buildOroplayEnvelopeProofFlags();
  for (const flag of [
    "walletMutation",
    "ledgerMutation",
    "prismaWrite",
    "externalNetwork",
    "aliasBalance",
    "aliasTransaction",
    "liveRouteWiring",
    "activationAllowed",
  ]) {
    assert.strictEqual(proof[flag], false, `${flag} proof flag must be false.`);
  }
}

function assertSafetyFlags() {
  const scenario = scenarioByName("transaction request valid bet");
  const input = { callbackType: scenario.kind, payload: scenario.payload, state: scenario.state };
  const flow = invokeOroplayShadowEnvelopeFlow(input);

  for (const flag of [
    "runtimeWiredToLiveRoute",
    "aliasBalanceEnabled",
    "aliasTransactionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "activationAllowed",
  ]) {
    assert.strictEqual(flow.response[flag], false, `${flag} must stay false.`);
  }

  assert.doesNotThrow(() => assertOroplayEnvelopeNoLiveRouteWiring(input));
  assert.doesNotThrow(() => assertOroplayEnvelopeNoAliasEnabled(input));
  assert.doesNotThrow(() => assertOroplayEnvelopeNoMutation(input));
  assert.doesNotThrow(() => assertOroplayEnvelopeNoNetwork(input));
  assert.doesNotThrow(() => assertOroplayEnvelopeNoPrismaWrite(input));
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
  assertNotIncludes("envelope runtime live wiring", combined, [
    "oroplayCallbackRequestResponseEnvelope",
    "invokeOroplayShadowEnvelopeFlow",
    "buildOroplayBalanceResponseEnvelope",
    "buildOroplayTransactionResponseEnvelope",
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
    assert(!pattern.test(markerText), `new ORO-4D files contain CI false-positive marker text: ${pattern}.`);
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
  assertEnvelopeStatus();
  assertBalanceBehavior();
  assertTransactionBehavior();
  assertResponseShapes();
  assertSanitizerAndProofFlags();
  assertSafetyFlags();
  assertPreviousPhaseGatesPreserved();
  assertNoAliasesOrExpressWiring();
  assertNoForbiddenRuntimeMarkers();
  assertNoSecretScanFalsePositiveMarkers();
  console.log("ORO-4D OroPlay callback request response envelope smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4D OroPlay callback request response envelope smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
