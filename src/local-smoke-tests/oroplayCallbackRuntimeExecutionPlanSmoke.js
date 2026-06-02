"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE,
  buildOroplayBalanceExecutionPlan,
  buildOroplayTransactionExecutionPlan,
  sanitizeOroplayRuntimeExecutionPayload,
  validateOroplayCallbackRuntimeExecutionPlan,
} = require("../game-provider-mock/oroplayCallbackRuntimeExecutionPlan");
const {
  buildOroplayRuntimeGateSummary,
  evaluateOroplayRuntimeGate,
  validateOroplayCallbackRuntimeGate,
} = require("../game-provider-mock/oroplayCallbackRuntimeGate");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const EXECUTION_PLAN_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN.md";
const EXECUTION_PLAN_FILE = "src/game-provider-mock/oroplayCallbackRuntimeExecutionPlan.js";
const RUNTIME_GATE_FILE = "src/game-provider-mock/oroplayCallbackRuntimeGate.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackRuntimeExecutionPlanSmoke.js";
const NEW_FILES = [EXECUTION_PLAN_FILE, RUNTIME_GATE_FILE, SMOKE_FILE];

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

function assertStepSafe(step, label) {
  assert(step, `${label} must exist.`);
  assert.strictEqual(step.mutationAllowed, false, `${label} mutationAllowed must be false.`);
  assert.strictEqual(step.runtimeEnabled, false, `${label} runtimeEnabled must be false.`);
  assert.strictEqual(step.requiresFutureApproval, true, `${label} requiresFutureApproval must be true.`);
  assert.strictEqual(step.prismaWriteAllowed, false, `${label} prismaWriteAllowed must be false.`);
}

function assertPlanSafe(plan, label) {
  assert.strictEqual(plan.phase, "ORO-3C", `${label} phase mismatch.`);
  assert.strictEqual(plan.mutationAllowed, false, `${label} must not allow mutation.`);
  assert.strictEqual(plan.prismaWriteAllowed, false, `${label} must not allow Prisma write.`);
  assert.strictEqual(plan.liveRuntimeEnabled, false, `${label} must not enable live runtime.`);
  assert.strictEqual(plan.aliasEnabled, false, `${label} must not enable aliases.`);
  assert.strictEqual(plan.safetyGate.gateStatus, "closed", `${label} gate must be closed.`);
  assert.strictEqual(plan.safetyGate.runtimeEnabled, false, `${label} gate must not enable runtime.`);
  assertStepSafe(plan.walletStep, `${label} walletStep`);
  assertStepSafe(plan.ledgerStep, `${label} ledgerStep`);
  assertStepSafe(plan.transactionLogStep, `${label} transactionLogStep`);
  assertStepSafe(plan.reconciliationStep, `${label} reconciliationStep`);
  assertStepSafe(plan.auditStep, `${label} auditStep`);
}

function assertDocsAndRegistration() {
  const doc = readRequired(EXECUTION_PLAN_DOC);
  assertIncludes("ORO-3C execution plan doc", doc, [
    "## purpose",
    "## non-goals",
    "## safety boundary",
    "## execution plan overview",
    "## no-mutation runtime gate",
    "## callback execution lifecycle",
    "## balance callback execution plan",
    "## transaction callback execution plan",
    "## wallet execution plan",
    "## ledger execution plan",
    "## transaction log execution plan",
    "## reconciliation execution plan",
    "## audit execution plan",
    "## idempotency execution plan",
    "## duplicate replay handling",
    "## conflicting duplicate handling",
    "## insufficient balance handling",
    "## unknown member handling",
    "## blocked/inactive member handling",
    "## finished round handling",
    "## canceled transaction handling",
    "## fail-closed rules",
    "## manual review rules",
    "## lock ordering design",
    "## rollback / compensation plan",
    "## required runtime prerequisites",
    "## ORO-3D prerequisites",
    "## no live runtime statement",
    "## no runtime wallet mutation",
    "## no runtime ledger mutation",
    "## no Prisma write",
    "## no alias provider-compatible route enabled",
    "ORO-3C is execution plan only",
    "ORO-3C does not enable `/api/balance` or `/api/transaction`",
    "ORO-3D is blocked until ORO-3C passes",
  ]);

  readRequired(EXECUTION_PLAN_FILE);
  readRequired(RUNTIME_GATE_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-execution-plan"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeExecutionPlanSmoke.js",
    "package.json missing ORO-3C smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-3C registration", runner, [
    "oroplayCallbackRuntimeExecutionPlan.js",
    "oroplayCallbackRuntimeGate.js",
    "oroplayCallbackRuntimeExecutionPlanSmoke.js",
    "smoke:oroplay-callback-runtime-execution-plan",
    "oroplayCallbackRuntimeExecutionPlan",
  ]);
}

function assertExecutionPlanValidation() {
  const validation = validateOroplayCallbackRuntimeExecutionPlan();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const gateValidation = validateOroplayCallbackRuntimeGate();
  assert.strictEqual(gateValidation.ok, true, gateValidation.errors.join("; "));
}

function assertAcceptedPlans() {
  const balance = buildOroplayBalanceExecutionPlan({ userCode: "ORO_VALID_001" });
  assert.strictEqual(balance.decision, "accepted_plan", "balance execution plan must be accepted_plan.");
  assertPlanSafe(balance, "balance");
  assert.strictEqual(balance.walletStep.operation, "read_balance", "balance must build read step.");

  const bet = buildOroplayTransactionExecutionPlan({
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ORO3C_BET_001",
    transactionType: "bet",
    amount: 25,
    roundId: "ROUND_ORO3C_BET_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });
  assert.strictEqual(bet.decision, "accepted_plan", "bet execution plan must be accepted_plan.");
  assertPlanSafe(bet, "bet");
  assert.strictEqual(bet.walletStep.operation, "debit", "bet must return wallet debit step.");
  assert.strictEqual(bet.walletStep.signedAmount, -25, "bet signed amount must be negative.");
  assert.strictEqual(bet.walletStep.mutationAllowed, false, "bet wallet debit step must not mutate.");
  assert.strictEqual(bet.ledgerStep.prismaWriteAllowed, false, "bet ledger step must not write Prisma.");
  assert.strictEqual(bet.transactionLogStep.prismaWriteAllowed, false, "bet transaction log step must not write Prisma.");

  const win = buildOroplayTransactionExecutionPlan({
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ORO3C_WIN_001",
    transactionType: "win",
    amount: 75,
    roundId: "ROUND_ORO3C_WIN_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });
  assert.strictEqual(win.decision, "accepted_plan", "win execution plan must be accepted_plan.");
  assertPlanSafe(win, "win");
  assert.strictEqual(win.walletStep.operation, "credit", "win must return wallet credit step.");
  assert.strictEqual(win.walletStep.signedAmount, 75, "win signed amount must be positive.");
  assert.strictEqual(win.walletStep.mutationAllowed, false, "win wallet credit step must not mutate.");

  assert(bet.reconciliationStep.requiredChecks.includes("ledger_entry"), "reconciliation step must exist.");
  assert.strictEqual(bet.auditStep.sanitizedPayloadOnly, true, "audit step must use sanitized payload only.");
}

function assertRuntimeGate() {
  const defaultGate = evaluateOroplayRuntimeGate();
  assert.strictEqual(defaultGate.gateStatus, "closed", "default runtime gate must be closed.");
  assert.strictEqual(defaultGate.runtimeEnabled, false, "default runtime gate must keep runtime disabled.");
  assert.strictEqual(
    defaultGate.reason,
    "ORO-3C is execution-plan-only / no-mutation runtime gate",
    "runtime gate reason mismatch."
  );

  const summary = buildOroplayRuntimeGateSummary();
  assert.strictEqual(summary.noPrismaWrite, true, "gate summary must block Prisma write.");

  for (const flag of [
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "liveOroplayCallAllowed",
    "providerAliasEnabled",
  ]) {
    const result = evaluateOroplayRuntimeGate({ [flag]: true });
    assert.strictEqual(result.decision, "fail_closed", `${flag} must fail closed.`);
    assert(result.blockedReasons.length > 0, `${flag} must include blocked reasons.`);
    assert.strictEqual(result[flag], false, `${flag} must remain false in output.`);
  }
}

function assertReplayAndFailClosedCases() {
  const seedPayload = {
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ORO3C_DUP_001",
    transactionType: "bet",
    amount: 10,
    roundId: "ROUND_ORO3C_DUP_001",
  };
  const first = buildOroplayTransactionExecutionPlan(seedPayload, DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE);
  const replay = buildOroplayTransactionExecutionPlan(seedPayload, first.nextState);
  assert.strictEqual(replay.status, "idempotent_replay", "duplicate transactionCode must become idempotent_replay.");
  assert.strictEqual(replay.decision, "idempotent_replay", "duplicate replay decision mismatch.");
  assert.strictEqual(replay.walletStep.mutationAllowed, false, "duplicate replay must not mutate wallet.");

  const conflict = buildOroplayTransactionExecutionPlan({ ...seedPayload, amount: 12 }, first.nextState);
  assert(["manual_review", "fail_closed"].includes(conflict.status), "conflicting duplicate must stop.");
  assert.strictEqual(conflict.decision, "duplicate_conflict", "conflicting duplicate decision mismatch.");
  assert.strictEqual(conflict.failClosed, true, "conflicting duplicate must fail closed.");

  const cases = [
    [
      "insufficient balance",
      {
        userCode: "ORO_LOW_BAL_001",
        transactionCode: "TX_ORO3C_LOW_BAL_001",
        transactionType: "bet",
        amount: 100,
      },
      "insufficient_balance",
    ],
    ["unknown member", { userCode: "ORO_UNKNOWN_001" }, "unknown_member", "balance"],
    ["blocked member", { userCode: "ORO_BLOCKED_001" }, "blocked_member", "balance"],
    ["inactive member", { userCode: "ORO_INACTIVE_001" }, "inactive_member", "balance"],
    ["malformed payload", { userCode: "" }, "malformed_payload", "balance"],
    [
      "unsupported transaction type",
      {
        userCode: "ORO_VALID_001",
        transactionCode: "TX_ORO3C_BAD_TYPE_001",
        transactionType: "bonus",
        amount: 25,
      },
      "unsupported_transaction_type",
    ],
    [
      "canceled transaction",
      {
        userCode: "ORO_VALID_001",
        transactionCode: "TX_ORO3C_CANCELED_001",
        transactionType: "bet",
        amount: 25,
        isCanceled: true,
      },
      "canceled_transaction",
    ],
  ];

  for (const [name, payload, expectedDecision, callbackType] of cases) {
    const result =
      callbackType === "balance" ? buildOroplayBalanceExecutionPlan(payload) : buildOroplayTransactionExecutionPlan(payload);
    assert.strictEqual(result.status, "fail_closed", `${name} must fail closed.`);
    assert.strictEqual(result.decision, expectedDecision, `${name} decision mismatch.`);
    assert.strictEqual(result.walletStep.mutationAllowed, false, `${name} must not mutate wallet.`);
    assert.strictEqual(result.ledgerStep.prismaWriteAllowed, false, `${name} must not write ledger.`);
  }

  const finishedRound = buildOroplayTransactionExecutionPlan(
    {
      userCode: "ORO_VALID_001",
      transactionCode: "TX_ORO3C_FINISHED_001",
      transactionType: "win",
      amount: 25,
      roundId: "ROUND_ORO3C_FINISHED_001",
    },
    { finishedRounds: { ROUND_ORO3C_FINISHED_001: true } }
  );
  assert(["fail_closed", "manual_review"].includes(finishedRound.status), "finished round replay must stop.");
  assert.strictEqual(finishedRound.decision, "finished_round_replay", "finished round replay decision mismatch.");
}

function assertSanitizer() {
  const rawValue = "must-not-leak-oro3c-value";
  const authScheme = ["Be", "arer"].join("");
  const databaseKey = ["DATABASE", "_URL"].join("");
  const sanitized = sanitizeOroplayRuntimeExecutionPayload({
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
  assert(text.includes("[REDACTED"), "sanitizer must mark credential-like fields as redacted.");
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
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
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
  assertIncludes("ORO-3B adapter doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT.md"), [
    "ORO-3B closed",
    "ORO-3C execution plan current",
    "adapter contract remains no-mutation",
  ]);
  assertIncludes("ORO-3A simulation doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C execution plan current",
  ]);
  assertIncludes("ORO runtime readiness doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C execution plan current",
    "runtime mutation still blocked",
    "runtime gate remains closed",
  ]);
  assertIncludes("OroPlay callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-3C execution plan only",
    "ORO-2B fail-closed route remains default",
    "no runtime wallet/ledger mutation",
    "no provider-compatible alias enabled",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C current",
    "ORO-3D blocked until execution plan smoke passes",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-2B fail-closed route exists",
    "ORO-2C readiness contract closed",
    "ORO-3A runtime simulation closed",
    "ORO-3B adapter contract closed",
    "ORO-3C execution plan only",
    "not production runtime",
    "no alias enabled",
    "no runtime wallet/ledger mutation",
    "runtime gate closed",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-runtime-execution-plan",
    "execution plan coverage",
    "runtime gate coverage",
    "wallet execution step coverage",
    "ledger execution step coverage",
    "transaction log execution step coverage",
    "reconciliation execution step coverage",
    "audit sanitized coverage",
    "no mutation coverage",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B closed",
    "ORO-2C closed",
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C current/execution plan",
    "ORO-3D blocked until ORO-3C pass",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertExecutionPlanValidation();
  assertAcceptedPlans();
  assertRuntimeGate();
  assertReplayAndFailClosedCases();
  assertSanitizer();
  assertNoRuntimeMarkers();
  assertOro2bFailClosedAndAliasDisabled();
  assertStaticDocs();
  console.log("ORO-3C OroPlay callback runtime execution plan smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-3C OroPlay callback runtime execution plan smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
