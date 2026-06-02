"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  DEFAULT_ADAPTER_STATE,
  buildOroplayCallbackAdapterRequest,
  mapOroplayCallbackToAdapterDecision,
  sanitizeOroplayAdapterPayload,
  validateOroplayCallbackRuntimeAdapterContract,
} = require("../game-provider-mock/oroplayCallbackRuntimeAdapterContract");
const {
  buildOroplayWalletLedgerBridgePlan,
  validateOroplayWalletLedgerBridgeDesign,
} = require("../game-provider-mock/oroplayWalletLedgerBridgeDesign");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTRACT_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT.md";
const ADAPTER_FILE = "src/game-provider-mock/oroplayCallbackRuntimeAdapterContract.js";
const BRIDGE_FILE = "src/game-provider-mock/oroplayWalletLedgerBridgeDesign.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackRuntimeAdapterContractSmoke.js";
const NEW_FILES = [ADAPTER_FILE, BRIDGE_FILE, SMOKE_FILE];

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
  const doc = readRequired(CONTRACT_DOC);
  assertIncludes("ORO-3B adapter contract doc", doc, [
    "## purpose",
    "## non-goals",
    "## safety boundary",
    "## adapter contract overview",
    "## wallet-ledger bridge design",
    "## callback adapter flow",
    "## balance callback adapter plan",
    "## transaction callback adapter plan",
    "## member mapping guard",
    "## idempotency guard",
    "## duplicate replay handling",
    "## conflicting replay handling",
    "## insufficient balance fail-closed",
    "## finished round / canceled round handling",
    "## wallet intent only",
    "## ledger intent only",
    "## reconciliation intent only",
    "## transaction log intent only",
    "## sanitized audit preview",
    "## response shape mapping",
    "## error shape mapping",
    "## rollback / compensation design note",
    "## ORO-3C prerequisites",
    "## no live runtime statement",
    "## no runtime wallet mutation",
    "## no runtime ledger mutation",
    "## no alias provider-compatible route enabled",
    "ORO-3B is bridge design / adapter contract only",
    "ORO-3B is not a runtime adapter",
    "ORO-3B does not enable `/api/balance` or `/api/transaction`",
  ]);

  readRequired(ADAPTER_FILE);
  readRequired(BRIDGE_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-adapter-contract"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeAdapterContractSmoke.js",
    "package.json missing ORO-3B smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-3B registration", runner, [
    "oroplayCallbackRuntimeAdapterContract.js",
    "oroplayWalletLedgerBridgeDesign.js",
    "oroplayCallbackRuntimeAdapterContractSmoke.js",
    "smoke:oroplay-callback-runtime-adapter-contract",
    "oroplayCallbackRuntimeAdapterContract",
  ]);
}

function assertAdapterValidation() {
  const adapterValidation = validateOroplayCallbackRuntimeAdapterContract();
  assert.strictEqual(adapterValidation.ok, true, adapterValidation.errors.join("; "));

  const bridgeValidation = validateOroplayWalletLedgerBridgeDesign();
  assert.strictEqual(bridgeValidation.ok, true, bridgeValidation.errors.join("; "));

  const request = buildOroplayCallbackAdapterRequest({ callbackType: "balance", userCode: "ORO_VALID_001" });
  assert.strictEqual(request.rawPayloadDropped, true, "adapter request must drop raw payload.");
  assert.strictEqual(request.mutationAllowed, false, "adapter request must not allow mutation.");
  assert.strictEqual(request.prismaWriteAllowed, false, "adapter request must not allow Prisma write.");
}

function assertAcceptedPlans() {
  const balance = mapOroplayCallbackToAdapterDecision({ callbackType: "balance", userCode: "ORO_VALID_001" });
  assert.strictEqual(balance.status, "accepted_plan", "balance callback must be accepted as a plan.");
  assert.strictEqual(balance.walletIntent.kind, "future_wallet_balance_read_intent", "balance must build read intent.");
  assert.strictEqual(balance.bridgePlan.mutationAllowed, false, "balance bridge plan must not mutate.");

  const bet = mapOroplayCallbackToAdapterDecision({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ADAPTER_BET_001",
    transactionType: "bet",
    amount: 25,
    roundId: "ROUND_ADAPTER_BET_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });
  assert.strictEqual(bet.status, "accepted_plan", "bet callback must be accepted as a plan.");
  assert.strictEqual(bet.walletIntent.direction, "debit", "bet must map to wallet debit intent only.");
  assert.strictEqual(bet.walletIntent.mutationAllowed, false, "bet wallet intent must not mutate.");
  assert.strictEqual(bet.ledgerIntent.mutationAllowed, false, "bet ledger intent must not write.");
  assert.strictEqual(bet.transactionLogIntent.mutationAllowed, false, "bet transaction log intent must not write.");
  assert.strictEqual(bet.reconciliationIntent.mutationAllowed, false, "bet reconciliation intent must not write.");

  const win = mapOroplayCallbackToAdapterDecision({
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ADAPTER_WIN_001",
    transactionType: "win",
    amount: 75,
    roundId: "ROUND_ADAPTER_WIN_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });
  assert.strictEqual(win.status, "accepted_plan", "win callback must be accepted as a plan.");
  assert.strictEqual(win.walletIntent.direction, "credit", "win must map to wallet credit intent only.");
  assert.strictEqual(win.walletIntent.mutationAllowed, false, "win wallet intent must not mutate.");
  assert.strictEqual(win.ledgerIntent.mutationAllowed, false, "win ledger intent must not write.");
  assert.strictEqual(win.transactionLogIntent.mutationAllowed, false, "win transaction log intent must not write.");
  assert.strictEqual(win.reconciliationIntent.mutationAllowed, false, "win reconciliation intent must not write.");

  const directBridge = buildOroplayWalletLedgerBridgePlan({
    memberId: "pg77-member-001",
    userCode: "ORO_VALID_001",
    callbackType: "transaction",
    transactionType: "bet",
    transactionCode: "TX_DIRECT_BRIDGE_001",
    amount: -30,
    beforeBalanceExpected: 1000,
  });
  assert.strictEqual(directBridge.mutationAllowed, false, "direct bridge plan must be no-mutation.");
  assert.strictEqual(directBridge.prismaWriteAllowed, false, "direct bridge plan must not allow Prisma write.");
  assert.strictEqual(directBridge.liveRuntimeEnabled, false, "direct bridge plan must not enable live runtime.");
}

function assertReplayAndFailClosedCases() {
  const seedPayload = {
    callbackType: "transaction",
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ADAPTER_DUP_001",
    transactionType: "bet",
    amount: 10,
    roundId: "ROUND_ADAPTER_DUP_001",
  };
  const first = mapOroplayCallbackToAdapterDecision(seedPayload, DEFAULT_ADAPTER_STATE);
  const replay = mapOroplayCallbackToAdapterDecision(seedPayload, first.nextState);
  assert.strictEqual(replay.status, "idempotent_replay", "duplicate transactionCode must be idempotent_replay.");
  assert.strictEqual(replay.walletIntent, null, "idempotent replay must not create wallet intent.");

  const conflict = mapOroplayCallbackToAdapterDecision({ ...seedPayload, amount: 12 }, first.nextState);
  assert(["manual_review", "fail_closed"].includes(conflict.status), "conflicting duplicate must stop.");
  assert.strictEqual(conflict.failClosed, true, "conflicting duplicate must fail closed.");
  assert.strictEqual(conflict.decision, "duplicate_conflict", "conflicting duplicate decision mismatch.");

  const cases = [
    [
      "insufficient balance",
      {
        callbackType: "transaction",
        userCode: "ORO_LOW_BAL_001",
        transactionCode: "TX_ADAPTER_LOW_BAL_001",
        transactionType: "bet",
        amount: 100,
      },
      "insufficient_balance",
    ],
    ["unknown member", { callbackType: "balance", userCode: "ORO_UNKNOWN_001" }, "unknown_member"],
    ["blocked member", { callbackType: "balance", userCode: "ORO_BLOCKED_001" }, "blocked_member"],
    ["inactive member", { callbackType: "balance", userCode: "ORO_INACTIVE_001" }, "inactive_member"],
    ["malformed payload", { callbackType: "balance", userCode: "" }, "malformed_payload"],
    [
      "unsupported transaction type",
      {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_ADAPTER_BAD_TYPE_001",
        transactionType: "bonus",
        amount: 25,
      },
      "unsupported_transaction_type",
    ],
  ];

  for (const [name, payload, expectedDecision] of cases) {
    const result = mapOroplayCallbackToAdapterDecision(payload);
    assert.strictEqual(result.status, "fail_closed", `${name} must fail closed.`);
    assert.strictEqual(result.decision, expectedDecision, `${name} decision mismatch.`);
    assert.strictEqual(result.walletIntent, null, `${name} must not create wallet intent.`);
    assert.strictEqual(result.ledgerIntent, null, `${name} must not create ledger intent.`);
  }

  const finishedRound = mapOroplayCallbackToAdapterDecision(
    {
      callbackType: "transaction",
      userCode: "ORO_VALID_001",
      transactionCode: "TX_ADAPTER_FINISHED_001",
      transactionType: "win",
      amount: 25,
      roundId: "ROUND_ADAPTER_DONE_001",
      isFinished: true,
    },
    { finishedRounds: { ROUND_ADAPTER_DONE_001: true } }
  );
  assert(["fail_closed", "manual_review"].includes(finishedRound.status), "finished round replay must stop.");
  assert.strictEqual(finishedRound.failClosed, true, "finished round replay must fail closed.");
  assert.strictEqual(finishedRound.decision, "finished_round_replay", "finished round replay decision mismatch.");
}

function assertSanitizer() {
  const rawValue = "must-not-leak-adapter-value";
  const authScheme = ["Be", "arer"].join("");
  const databaseKey = ["DATABASE", "_URL"].join("");
  const sanitized = sanitizeOroplayAdapterPayload({
    authorization: `${authScheme} field-name-only`,
    password: rawValue,
    secret: rawValue,
    token: rawValue,
    clientSecret: rawValue,
    [databaseKey]: ["postgres", "ql://user:pass@localhost:5432/mock"].join(""),
    pin: rawValue,
    deviceId: rawValue,
    nested: { password: rawValue },
    safeField: "safe",
  });

  const text = JSON.stringify(sanitized);
  assert(text.includes("[REDACTED"), "sanitizer must mark redacted fields.");
  for (const forbidden of [rawValue, "field-name-only", "user:pass"]) {
    assert(!text.includes(forbidden), `sanitizer leaked ${forbidden}.`);
  }
  assert.strictEqual(sanitized.safeField, "safe", "sanitizer must preserve safe metadata.");
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
    /require\(["']@prisma\/client["']\)/i,
  ];

  for (const file of NEW_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertOro2bFailClosedAndAliasDisabled() {
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

function assertStaticDocs() {
  assertIncludes("ORO-3A simulation doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md"), [
    "ORO-3A closed",
    "ORO-3B adapter contract current",
    "simulation remains no-mutation",
  ]);
  assertIncludes("ORO runtime readiness doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md"), [
    "ORO-3A closed",
    "ORO-3B adapter contract current",
    "runtime mutation still blocked",
    "wallet-ledger bridge is design only",
  ]);
  assertIncludes("OroPlay callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-3B adapter contract only",
    "ORO-2B fail-closed route remains default",
    "no runtime wallet/ledger mutation",
    "no provider-compatible alias enabled",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-3A closed",
    "ORO-3B current",
    "ORO-3C blocked until adapter contract smoke passes",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-2B fail-closed route exists",
    "ORO-2C readiness contract closed",
    "ORO-3A runtime simulation closed",
    "ORO-3B adapter contract only",
    "not production runtime",
    "no alias enabled",
    "no runtime wallet/ledger mutation",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-runtime-adapter-contract",
    "adapter contract coverage",
    "walletIntent coverage",
    "ledgerIntent coverage",
    "transactionLogIntent coverage",
    "reconciliationIntent coverage",
    "sanitizer coverage",
    "no mutation coverage",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B closed",
    "ORO-2C closed",
    "ORO-3A closed",
    "ORO-3B current/adapter contract",
    "ORO-3C blocked until ORO-3B pass",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertAdapterValidation();
  assertAcceptedPlans();
  assertReplayAndFailClosedCases();
  assertSanitizer();
  assertNoRuntimeMarkers();
  assertOro2bFailClosedAndAliasDisabled();
  assertStaticDocs();
  console.log("ORO-3B OroPlay callback runtime adapter contract smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-3B OroPlay callback runtime adapter contract smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
