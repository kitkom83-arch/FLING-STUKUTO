"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  DEFAULT_MOCK_STATE,
  buildOroplayRuntimeSimulationSummary,
  simulateOroplayBalanceCallback,
  simulateOroplayTransactionCallback,
  validateOroplayRuntimeSimulationContract,
} = require("../game-provider-mock/oroplayCallbackRuntimeSimulator");
const {
  buildOroplayCallbackRuntimeScenarios,
  runOroplayCallbackRuntimeScenarios,
} = require("../game-provider-mock/oroplayCallbackRuntimeScenarios");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const SIM_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md";
const SIMULATOR_FILE = "src/game-provider-mock/oroplayCallbackRuntimeSimulator.js";
const SCENARIOS_FILE = "src/game-provider-mock/oroplayCallbackRuntimeScenarios.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackRuntimeSimulationSmoke.js";
const NEW_MOCK_FILES = [SIMULATOR_FILE, SCENARIOS_FILE];

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

function assertDocsAndRegistration() {
  const doc = readRequired(SIM_DOC);
  assertIncludes("ORO-3A simulation doc", doc, [
    "Purpose",
    "Non-goals",
    "Safety Boundary",
    "Mock Runtime Simulation Flow",
    "Member Mapping Simulation",
    "Idempotency Simulation",
    "Duplicate / Conflicting Replay Handling",
    "Ledger Intent / Reconciliation Intent Only",
    "Sanitized Log Preview",
    "ORO-3B Prerequisites",
    "No live runtime statement",
  ]);

  readRequired(SIMULATOR_FILE);
  readRequired(SCENARIOS_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-simulation"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeSimulationSmoke.js",
    "package.json missing ORO-3A smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-3A registration", runner, [
    "oroplayCallbackRuntimeSimulator.js",
    "oroplayCallbackRuntimeScenarios.js",
    "oroplayCallbackRuntimeSimulationSmoke.js",
    "smoke:oroplay-callback-runtime-simulation",
    "oroplayCallbackRuntimeSimulation",
  ]);
}

function assertScenarioSet() {
  const scenarios = buildOroplayCallbackRuntimeScenarios();
  const names = new Set(scenarios.map((scenario) => scenario.name));
  for (const required of [
    "valid balance simulation",
    "unknown userCode fail-closed",
    "blocked member fail-closed",
    "inactive member fail-closed",
    "malformed balance payload",
    "valid bet transaction simulation",
    "valid win transaction simulation",
    "insufficient balance bet fail-closed",
    "duplicate transactionCode replay idempotent",
    "conflicting duplicate manual_review",
    "finished round replay blocked",
    "unsupported transaction type fail-closed",
    "sanitized log preview redacts credential-like fields",
    "ledger intent generated but no runtime ledger write",
    "no Prisma / DB / wallet / ledger mutation markers",
  ]) {
    assert(names.has(required), `missing scenario ${required}.`);
  }
}

function assertRuntimeSimulationContract() {
  const validation = validateOroplayRuntimeSimulationContract();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const summary = buildOroplayRuntimeSimulationSummary();
  assert.strictEqual(summary.phase, "ORO-3A", "summary phase mismatch.");
  assert.strictEqual(summary.runtimeEnabled, false, "runtime must remain disabled.");
  assert.strictEqual(summary.providerAliasesEnabled, false, "provider aliases must remain disabled.");
  assert.strictEqual(summary.safety.runtimeWalletMutation, false, "wallet mutation must remain false.");
  assert.strictEqual(summary.safety.runtimeLedgerMutation, false, "ledger mutation must remain false.");
  assert.strictEqual(summary.safety.prismaWrite, false, "Prisma write must remain false.");
}

function assertSimulationBehavior() {
  const balance = simulateOroplayBalanceCallback({ callbackType: "balance", userCode: "ORO_VALID_001" });
  assert.strictEqual(balance.decision, "mock_balance_available", "valid balance decision mismatch.");
  assert.strictEqual(balance.mockBalance, 1000, "valid balance must read mock state.");
  assert.strictEqual(balance.runtimeWalletMutation, false, "balance must not mutate wallet.");
  assert.strictEqual(balance.runtimeLedgerMutation, false, "balance must not mutate ledger.");

  const bet = simulateOroplayTransactionCallback({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_SMOKE_BET_001",
    amount: -25,
    roundId: "ROUND_SMOKE_BET_001",
    transactionType: "bet",
  });
  assert.strictEqual(bet.decision, "ledger_intent_only", "valid bet must return ledger intent only.");
  assert(bet.ledgerIntent, "valid bet must return ledgerIntent.");
  assert(bet.reconciliationIntent, "valid bet must return reconciliationIntent.");
  assert.strictEqual(bet.ledgerIntent.runtimeWrite, false, "ledgerIntent must not be runtime write.");
  assert.strictEqual(bet.ledgerIntent.walletMutation, false, "ledgerIntent must not mutate wallet.");
  assert.strictEqual(bet.ledgerIntent.ledgerMutation, false, "ledgerIntent must not mutate ledger.");

  const replay = simulateOroplayTransactionCallback(
    {
      callbackType: "transaction",
      userCode: "ORO_VALID_001",
      transactionCode: "TX_SMOKE_BET_001",
      amount: -25,
      roundId: "ROUND_SMOKE_BET_001",
      transactionType: "bet",
    },
    bet.nextState
  );
  assert.strictEqual(replay.decision, "idempotent_replay", "duplicate transaction must be idempotent.");
  assert.strictEqual(replay.ledgerIntent, null, "duplicate transaction must not create a second ledgerIntent.");

  const conflict = simulateOroplayTransactionCallback(
    {
      callbackType: "transaction",
      userCode: "ORO_VALID_001",
      transactionCode: "TX_SMOKE_BET_001",
      amount: -30,
      roundId: "ROUND_SMOKE_BET_001",
      transactionType: "bet",
    },
    bet.nextState
  );
  assert.strictEqual(conflict.decision, "manual_review", "conflicting duplicate must enter manual_review.");
  assert.strictEqual(conflict.failClosed, true, "conflicting duplicate must fail closed.");

  for (const [name, payload, reason] of [
    ["unknown member", { callbackType: "balance", userCode: "ORO_UNKNOWN_001" }, "unknown_userCode"],
    ["blocked member", { callbackType: "balance", userCode: "ORO_BLOCKED_001" }, "blocked_member"],
    ["inactive member", { callbackType: "balance", userCode: "ORO_INACTIVE_001" }, "inactive_member"],
    [
      "insufficient balance",
      {
        callbackType: "transaction",
        userCode: "ORO_LOW_BAL_001",
        transactionCode: "TX_LOW_BAL_SMOKE_001",
        amount: -100,
        transactionType: "bet",
      },
      "insufficient_balance",
    ],
    ["malformed payload", { callbackType: "balance", userCode: "" }, "malformed_payload"],
  ]) {
    const result = payload.transactionCode
      ? simulateOroplayTransactionCallback(payload, DEFAULT_MOCK_STATE)
      : simulateOroplayBalanceCallback(payload, DEFAULT_MOCK_STATE);
    assert.strictEqual(result.decision, "fail_closed", `${name} must fail closed.`);
    assert.strictEqual(result.reason, reason, `${name} reason mismatch.`);
  }
}

function assertScenarioResults() {
  const results = runOroplayCallbackRuntimeScenarios();
  for (const entry of results) {
    if (entry.expectedDecision === "sanitized_preview") continue;
    assert.strictEqual(entry.result.decision, entry.expectedDecision, `${entry.name} decision mismatch.`);
  }
}

function assertSanitizer() {
  const rawDatabaseUrl = ["postgres", "ql", "://", "user", ":", "pass", "@", "localhost:5432/runtime"].join("");
  const rawValue = "must-not-leak-value";
  const results = runOroplayCallbackRuntimeScenarios();
  const sanitizeCase = results.find((entry) => entry.name === "sanitized log preview redacts credential-like fields");
  assert(sanitizeCase, "missing sanitizer scenario.");

  const sanitizedText = JSON.stringify(sanitizeCase.result);
  for (const forbidden of [
    "authorization",
    "password",
    "secret",
    "token",
    "clientSecret",
    "DATABASE_URL",
    "pin",
    "deviceId",
    "field-name-only",
  ]) {
    assert(!sanitizedText.includes(forbidden), `sanitizer leaked ${forbidden}.`);
  }

  const runtimeResult = simulateOroplayTransactionCallback({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_SECRET_SCAN_001",
    amount: 10,
    transactionType: "win",
    authorization: "Basic field-name-only",
    password: rawValue,
    secret: rawValue,
    token: rawValue,
    clientSecret: rawValue,
    DATABASE_URL: rawDatabaseUrl,
    pin: rawValue,
    deviceId: rawValue,
  });
  const runtimeText = JSON.stringify(runtimeResult.logPreview);
  for (const forbidden of [rawDatabaseUrl, rawValue, "field-name-only"]) {
    assert(!runtimeText.includes(forbidden), `runtime log preview leaked ${forbidden}.`);
  }
}

function assertNoRuntimeMarkers() {
  const forbiddenPatterns = [
    /\bprisma\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany)\s*\(/i,
    /\bdb\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany|insert)\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
    /\b(?:autoCredit|payout)\s*\(/i,
    /\bfetch\s*\(/i,
    /\baxios\./i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
  ];
  for (const file of NEW_MOCK_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertNoProviderAliasRuntime() {
  const app = readRequired("src/app.js");
  const route = readRequired("src/routes/oroplayCallbackStub.routes.js");
  assertNotIncludes("app.js provider alias mount", app, [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    '"/api/balance"',
    '"/api/transaction"',
  ]);
  assertNotIncludes("stub routes provider alias", route, [
    '"/api/balance"',
    '"/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]);
}

function assertOro2bFailClosed() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });
  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B stub must not report runtime success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B stub must remain fail-closed.");
    assert.strictEqual(response.safety.noWalletMutation, true, "ORO-2B stub must mark no wallet mutation.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "ORO-2B stub must mark no ledger mutation.");
  }
}

function assertStaticDocs() {
  assertIncludes("ORO-2C readiness doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md"), [
    "ORO-2C readiness closed",
    "ORO-3A simulation current",
    "runtime mutation still blocked",
  ]);
  assertIncludes("ORO callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-3A simulation only",
    "ORO-2B fail-closed route remains default",
    "no runtime wallet/ledger mutation",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-2C closed",
    "ORO-3A current",
    "ORO-3B blocked until simulation smoke passes",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-3A runtime simulation only",
    "not production runtime",
    "no alias enabled",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-runtime-simulation",
    "runtime simulation coverage",
    "idempotency/replay coverage",
    "ledger intent only coverage",
    "no mutation coverage",
    "sanitizer coverage",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B closed",
    "ORO-2C closed",
    "ORO-3A current/simulation",
    "ORO-3B blocked until ORO-3A pass",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertScenarioSet();
  assertRuntimeSimulationContract();
  assertSimulationBehavior();
  assertScenarioResults();
  assertSanitizer();
  assertNoRuntimeMarkers();
  assertOro2bFailClosed();
  assertNoProviderAliasRuntime();
  assertStaticDocs();
  console.log("ORO-3A OroPlay callback runtime simulation smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-3A OroPlay callback runtime simulation smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
