"use strict";

const {
  DEFAULT_MOCK_STATE,
  sanitizeOroplayRuntimeLogPreview,
  simulateOroplayBalanceCallback,
  simulateOroplayTransactionCallback,
} = require("./oroplayCallbackRuntimeSimulator");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedDuplicateState() {
  const first = simulateOroplayTransactionCallback(
    {
      callbackType: "transaction",
      userCode: "ORO_VALID_001",
      transactionCode: "TX_DUP_001",
      amount: -10,
      roundId: "ROUND_DUP_001",
      isFinished: false,
      transactionType: "bet",
    },
    DEFAULT_MOCK_STATE
  );
  return first.nextState;
}

function seedFinishedRoundState() {
  const state = clone(DEFAULT_MOCK_STATE);
  state.finishedRounds.ROUND_DONE_001 = true;
  return state;
}

function runScenario(scenario) {
  if (scenario.kind === "balance") return simulateOroplayBalanceCallback(scenario.payload, scenario.state);
  if (scenario.kind === "sanitize") return sanitizeOroplayRuntimeLogPreview(scenario.payload);
  return simulateOroplayTransactionCallback(scenario.payload, scenario.state);
}

function buildOroplayCallbackRuntimeScenarios() {
  const duplicateState = seedDuplicateState();
  const finishedRoundState = seedFinishedRoundState();

  return [
    {
      id: "valid_balance_simulation",
      name: "valid balance simulation",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_VALID_001" },
      expectedDecision: "mock_balance_available",
    },
    {
      id: "unknown_userCode_fail_closed",
      name: "unknown userCode fail-closed",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_UNKNOWN_001" },
      expectedDecision: "fail_closed",
    },
    {
      id: "blocked_member_fail_closed",
      name: "blocked member fail-closed",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_BLOCKED_001" },
      expectedDecision: "fail_closed",
    },
    {
      id: "inactive_member_fail_closed",
      name: "inactive member fail-closed",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_INACTIVE_001" },
      expectedDecision: "fail_closed",
    },
    {
      id: "malformed_balance_payload",
      name: "malformed balance payload",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "" },
      expectedDecision: "fail_closed",
    },
    {
      id: "valid_bet_transaction_simulation",
      name: "valid bet transaction simulation",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_BET_001",
        amount: -25,
        roundId: "ROUND_BET_001",
        transactionType: "bet",
      },
      expectedDecision: "ledger_intent_only",
    },
    {
      id: "valid_win_transaction_simulation",
      name: "valid win transaction simulation",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_WIN_001",
        amount: 75,
        roundId: "ROUND_WIN_001",
        transactionType: "win",
      },
      expectedDecision: "ledger_intent_only",
    },
    {
      id: "insufficient_balance_bet_fail_closed",
      name: "insufficient balance bet fail-closed",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_LOW_BAL_001",
        transactionCode: "TX_LOW_BAL_001",
        amount: -100,
        roundId: "ROUND_LOW_BAL_001",
        transactionType: "bet",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "duplicate_transactionCode_replay_idempotent",
      name: "duplicate transactionCode replay idempotent",
      kind: "transaction",
      state: duplicateState,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_DUP_001",
        amount: -10,
        roundId: "ROUND_DUP_001",
        isFinished: false,
        transactionType: "bet",
      },
      expectedDecision: "idempotent_replay",
    },
    {
      id: "conflicting_duplicate_manual_review",
      name: "conflicting duplicate manual_review",
      kind: "transaction",
      state: duplicateState,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_DUP_001",
        amount: -12,
        roundId: "ROUND_DUP_001",
        isFinished: false,
        transactionType: "bet",
      },
      expectedDecision: "manual_review",
    },
    {
      id: "finished_round_replay_blocked",
      name: "finished round replay blocked",
      kind: "transaction",
      state: finishedRoundState,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_ROUND_REPLAY_001",
        amount: 25,
        roundId: "ROUND_DONE_001",
        isFinished: true,
        transactionType: "win",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "unsupported_transaction_type_fail_closed",
      name: "unsupported transaction type fail-closed",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_UNKNOWN_TYPE_001",
        amount: 25,
        roundId: "ROUND_UNKNOWN_TYPE_001",
        transactionType: "bonus",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "sanitized_log_preview_redacts_credential_like_fields",
      name: "sanitized log preview redacts credential-like fields",
      kind: "sanitize",
      payload: {
        requestId: "runtime-sanitize-case",
        userCodeMasked: "OR***01",
        transactionCodeMasked: "TX***01",
        authorization: "Basic field-name-only",
        password: "field-name-only",
        secret: "field-name-only",
        token: "field-name-only",
        clientSecret: "field-name-only",
        DATABASE_URL: "field-name-only",
        pin: "field-name-only",
        deviceId: "field-name-only",
      },
      expectedDecision: "sanitized_preview",
    },
    {
      id: "ledger_intent_generated_but_no_runtime_ledger_write",
      name: "ledger intent generated but no runtime ledger write",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_LEDGER_INTENT_001",
        amount: -30,
        roundId: "ROUND_LEDGER_INTENT_001",
        transactionType: "bet",
      },
      expectedDecision: "ledger_intent_only",
    },
    {
      id: "no_prisma_db_wallet_ledger_mutation_markers",
      name: "no Prisma / DB / wallet / ledger mutation markers",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_NO_MUTATION_001",
        amount: 10,
        roundId: "ROUND_NO_MUTATION_001",
        transactionType: "win",
      },
      expectedDecision: "ledger_intent_only",
    },
  ];
}

function runOroplayCallbackRuntimeScenarios() {
  return buildOroplayCallbackRuntimeScenarios().map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    expectedDecision: scenario.expectedDecision,
    result: runScenario(scenario),
  }));
}

module.exports = {
  buildOroplayCallbackRuntimeScenarios,
  runOroplayCallbackRuntimeScenarios,
};
