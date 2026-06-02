"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS,
  assertOroplayShadowNoAliasEnabled,
  assertOroplayShadowNoLiveRouteWiring,
  assertOroplayShadowNoMutation,
  assertOroplayShadowNoNetwork,
  assertOroplayShadowNoPrismaWrite,
  buildOroplayShadowBalanceInvocation,
  buildOroplayShadowInvocationSummary,
  buildOroplayShadowTransactionInvocation,
  invokeOroplayRuntimeSkeletonShadow,
  validateOroplayShadowInvocationDecision,
} = require("../game-provider-mock/oroplayCallbackRuntimeShadowInvoker");
const {
  buildOroplayCallbackRuntimeShadowFixtures,
  buildOroplayShadowProofFlags,
} = require("../game-provider-mock/oroplayCallbackRuntimeShadowFixtures");
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
const SHADOW_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION.md";
const SHADOW_INVOKER = "src/game-provider-mock/oroplayCallbackRuntimeShadowInvoker.js";
const SHADOW_FIXTURES = "src/game-provider-mock/oroplayCallbackRuntimeShadowFixtures.js";
const SHADOW_SMOKE = "src/local-smoke-tests/oroplayCallbackRuntimeShadowInvocationSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [SHADOW_DOC, SHADOW_INVOKER, SHADOW_FIXTURES, SHADOW_SMOKE];
const NEW_MOCK_FILES = [SHADOW_INVOKER, SHADOW_FIXTURES];

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
  const scenario = buildOroplayCallbackRuntimeShadowFixtures().find((entry) => entry.name === name);
  assert(scenario, `missing scenario ${name}.`);
  return scenario;
}

function runScenario(scenario) {
  if (scenario.kind === "balance") return buildOroplayShadowBalanceInvocation(scenario);
  if (scenario.kind === "transaction") return buildOroplayShadowTransactionInvocation(scenario);
  if (scenario.kind === "sanitize") {
    return invokeOroplayRuntimeSkeletonShadow({
      callbackType: "balance",
      payload: { callbackType: "balance", userCode: "ORO_SHADOW_VALID_001", shadowLogPayload: scenario.payload },
    }).logPreview;
  }
  return scenario.proofFlags;
}

function assertDocsAndRegistration() {
  const doc = readRequired(SHADOW_DOC);
  const invoker = readRequired(SHADOW_INVOKER);
  readRequired(SHADOW_FIXTURES);

  assertIncludes("ORO-4C shadow invocation doc", doc, [
    "## ORO-4C scope",
    "## shadow invocation purpose",
    "## shadow invocation vs live route wiring",
    "## balance shadow flow",
    "## transaction shadow flow",
    "## idempotency / duplicate replay behavior",
    "## conflicting duplicate behavior",
    "## insufficient balance behavior",
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
    "networkAllowed=false",
    "activationAllowed=false",
  ]);

  assertIncludes("shadow invoker exports", invoker, [
    "OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS",
    "buildOroplayShadowBalanceInvocation",
    "buildOroplayShadowTransactionInvocation",
    "invokeOroplayRuntimeSkeletonShadow",
    "validateOroplayShadowInvocationDecision",
    "buildOroplayShadowInvocationSummary",
    "assertOroplayShadowNoLiveRouteWiring",
    "assertOroplayShadowNoMutation",
    "assertOroplayShadowNoAliasEnabled",
    "assertOroplayShadowNoNetwork",
    "assertOroplayShadowNoPrismaWrite",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-shadow-invocation"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeShadowInvocationSmoke.js",
    "package.json missing ORO-4C smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4C registration", runner, [
    "oroplayCallbackRuntimeShadowInvoker.js",
    "oroplayCallbackRuntimeShadowFixtures.js",
    "oroplayCallbackRuntimeShadowInvocationSmoke.js",
    "smoke:oroplay-callback-runtime-shadow-invocation",
    "oroplayCallbackRuntimeShadowInvocation",
    "docs/OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION.md",
  ]);
}

function assertFixtureSet() {
  const names = new Set(buildOroplayCallbackRuntimeShadowFixtures().map((scenario) => scenario.name));
  for (const name of [
    "balance shadow valid member",
    "balance shadow unknown member fail_closed",
    "transaction shadow valid bet",
    "transaction shadow valid win",
    "transaction shadow duplicate replay idempotent",
    "transaction shadow conflicting duplicate manual_review",
    "transaction shadow insufficient balance fail_closed",
    "transaction shadow malformed payload fail_closed",
    "transaction shadow unsupported type fail_closed",
    "transaction shadow finished round replay blocked",
    "sanitized log shadow preview redacts credential-like keys",
    "proof flags all false",
  ]) {
    assert(names.has(name), `missing fixture scenario: ${name}`);
  }
}

function assertShadowStatus() {
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.defaultDecision, "fail_closed");
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.certifiedMockState, "shadow_ready_only");
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.activationAllowed, false);
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.runtimeWiredToLiveRoute, false);
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.aliasBalanceEnabled, false);
  assert.strictEqual(OROPLAY_CALLBACK_RUNTIME_SHADOW_INVOCATION_STATUS.aliasTransactionEnabled, false);

  const defaultResult = invokeOroplayRuntimeSkeletonShadow();
  assert.strictEqual(defaultResult.decision, "fail_closed", "default invocation must fail closed.");

  const summary = buildOroplayShadowInvocationSummary({
    callbackType: "balance",
    payload: { callbackType: "balance", userCode: "ORO_SHADOW_VALID_001" },
  });
  assert.strictEqual(summary.certifiedMockState, "shadow_ready_only", "certified mock state mismatch.");
  assert.strictEqual(summary.activationAllowed, false, "activation must stay false.");

  const validation = validateOroplayShadowInvocationDecision(defaultResult);
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
}

function assertShadowBehavior() {
  const balance = runScenario(scenarioByName("balance shadow valid member"));
  assert.strictEqual(balance.decision, "mock_balance_available", "valid balance must return mock-only decision.");
  assert.strictEqual(balance.balanceSource, "mock_fixture_only", "balance must read mock fixture only.");
  assert.strictEqual(balance.mockBalance, 1000, "balance must return fixture balance.");

  const unknown = runScenario(scenarioByName("balance shadow unknown member fail_closed"));
  assert.strictEqual(unknown.decision, "fail_closed", "unknown member must fail closed.");
  assert.strictEqual(unknown.reason, "unknown_member", "unknown member reason mismatch.");

  const bet = runScenario(scenarioByName("transaction shadow valid bet"));
  assert.strictEqual(bet.decision, "debit_intent_only", "valid bet must return debit intent only.");
  assert(bet.debitIntent, "valid bet must include debitIntent.");
  assert.strictEqual(bet.creditIntent, null, "valid bet must not include creditIntent.");
  assert.strictEqual(bet.debitIntent.mutationAllowed, false, "debit intent must not allow mutation.");
  assert.strictEqual(bet.ledgerIntent.ledgerWriteAllowed, false, "bet ledger intent must not allow write.");
  assert.strictEqual(bet.reconciliationIntent.reconciliationWriteAllowed, false, "bet reconciliation must not write.");

  const win = runScenario(scenarioByName("transaction shadow valid win"));
  assert.strictEqual(win.decision, "credit_intent_only", "valid win must return credit intent only.");
  assert(win.creditIntent, "valid win must include creditIntent.");
  assert.strictEqual(win.debitIntent, null, "valid win must not include debitIntent.");
  assert.strictEqual(win.creditIntent.mutationAllowed, false, "credit intent must not allow mutation.");

  const replay = runScenario(scenarioByName("transaction shadow duplicate replay idempotent"));
  assert.strictEqual(replay.decision, "idempotent_replay", "duplicate replay must be idempotent.");
  assert.strictEqual(replay.debitIntent, null, "duplicate replay must not double debit.");
  assert.strictEqual(replay.creditIntent, null, "duplicate replay must not double credit.");
  assert.strictEqual(replay.ledgerIntent, null, "duplicate replay must not write ledger intent again.");
  assert.strictEqual(replay.doubleDebitPrevented, true, "duplicate replay must prevent double debit.");
  assert.strictEqual(replay.doubleCreditPrevented, true, "duplicate replay must prevent double credit.");

  const conflict = runScenario(scenarioByName("transaction shadow conflicting duplicate manual_review"));
  assert(["manual_review", "fail_closed"].includes(conflict.decision), "conflicting duplicate must block.");
  assert.strictEqual(conflict.failClosed, true, "conflicting duplicate must fail closed.");
  assert.strictEqual(conflict.manualReview, true, "conflicting duplicate must enter manual review.");

  const lowBalance = runScenario(scenarioByName("transaction shadow insufficient balance fail_closed"));
  assert.strictEqual(lowBalance.decision, "fail_closed", "insufficient balance must fail closed.");
  assert.strictEqual(lowBalance.reason, "insufficient_balance", "insufficient balance reason mismatch.");

  const malformed = runScenario(scenarioByName("transaction shadow malformed payload fail_closed"));
  assert.strictEqual(malformed.decision, "fail_closed", "malformed payload must fail closed.");
  assert.strictEqual(malformed.reason, "malformed_payload", "malformed reason mismatch.");

  const unsupported = runScenario(scenarioByName("transaction shadow unsupported type fail_closed"));
  assert.strictEqual(unsupported.decision, "fail_closed", "unsupported type must fail closed.");
  assert.strictEqual(unsupported.reason, "unsupported_transaction_type", "unsupported type reason mismatch.");

  const finishedRound = runScenario(scenarioByName("transaction shadow finished round replay blocked"));
  assert.strictEqual(finishedRound.decision, "fail_closed", "finished round replay must fail closed.");
  assert.strictEqual(finishedRound.reason, "finished_round_replay", "finished round reason mismatch.");
}

function assertSanitizerAndProofFlags() {
  const scenario = scenarioByName("sanitized log shadow preview redacts credential-like keys");
  const preview = runScenario(scenario);
  const previewText = JSON.stringify(preview);

  for (const leaked of ["mock-shadow-sensitive-value", "mock-shadow-nested-sensitive-value"]) {
    assert(!previewText.includes(leaked), `sanitized preview leaked ${leaked}.`);
  }
  assert(previewText.includes("[REDACTED]"), "sanitized preview must include redaction output.");
  assertIncludes("sanitized preview markers", previewText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "mock-redaction-key-name",
    "redacted-credential-marker",
  ]);

  const proof = buildOroplayShadowProofFlags();
  for (const flag of [
    "walletMutation",
    "ledgerMutation",
    "prismaWrite",
    "externalNetwork",
    "aliasBalance",
    "aliasTransaction",
    "liveRouteWiring",
  ]) {
    assert.strictEqual(proof[flag], false, `${flag} proof flag must be false.`);
  }
}

function assertSafetyFlags() {
  const payload = {
    callbackType: "transaction",
    userCode: "ORO_SHADOW_VALID_001",
    transactionCode: "SHADOW_TX_SAFETY_001",
    amount: -10,
    transactionType: "bet",
  };
  const result = invokeOroplayRuntimeSkeletonShadow({ callbackType: "transaction", payload });

  assert.strictEqual(result.runtimeWiredToLiveRoute, false, "runtimeWiredToLiveRoute must be false.");
  assert.strictEqual(result.aliasBalanceEnabled, false, "aliasBalanceEnabled must be false.");
  assert.strictEqual(result.aliasTransactionEnabled, false, "aliasTransactionEnabled must be false.");
  assert.strictEqual(result.walletMutationAllowed, false, "walletMutationAllowed must be false.");
  assert.strictEqual(result.ledgerMutationAllowed, false, "ledgerMutationAllowed must be false.");
  assert.strictEqual(result.prismaWriteAllowed, false, "prismaWriteAllowed must be false.");
  assert.strictEqual(result.externalNetworkAllowed, false, "externalNetworkAllowed must be false.");
  assert.strictEqual(result.activationAllowed, false, "activationAllowed must be false.");

  assert.doesNotThrow(() => assertOroplayShadowNoLiveRouteWiring({ callbackType: "transaction", payload }));
  assert.doesNotThrow(() => assertOroplayShadowNoMutation({ callbackType: "transaction", payload }));
  assert.doesNotThrow(() => assertOroplayShadowNoAliasEnabled({ callbackType: "transaction", payload }));
  assert.doesNotThrow(() => assertOroplayShadowNoNetwork({ callbackType: "transaction", payload }));
  assert.doesNotThrow(() => assertOroplayShadowNoPrismaWrite({ callbackType: "transaction", payload }));
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
  assertNotIncludes("shadow runtime live wiring", combined, [
    "oroplayCallbackRuntimeShadowInvoker",
    "invokeOroplayRuntimeSkeletonShadow",
    "buildOroplayShadowTransactionInvocation",
    "buildOroplayShadowBalanceInvocation",
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
    /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i,
  ];

  for (const pattern of falsePositiveShapes) {
    assert(!pattern.test(markerText), `new ORO-4C files contain CI false-positive marker text: ${pattern}.`);
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
  assertShadowStatus();
  assertShadowBehavior();
  assertSanitizerAndProofFlags();
  assertSafetyFlags();
  assertPreviousPhaseGatesPreserved();
  assertNoAliasesOrExpressWiring();
  assertNoForbiddenRuntimeMarkers();
  assertNoSecretScanFalsePositiveMarkers();
  console.log("ORO-4C OroPlay callback runtime shadow invocation smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4C OroPlay callback runtime shadow invocation smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
