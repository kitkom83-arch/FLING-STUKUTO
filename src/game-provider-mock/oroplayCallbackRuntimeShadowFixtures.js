"use strict";

const OROPLAY_CALLBACK_RUNTIME_SHADOW_PROOF_FLAGS = Object.freeze({
  walletMutation: false,
  ledgerMutation: false,
  prismaWrite: false,
  externalNetwork: false,
  aliasBalance: false,
  aliasTransaction: false,
  liveRouteWiring: false,
});

const OROPLAY_CALLBACK_RUNTIME_SHADOW_MOCK_STATE = Object.freeze({
  members: Object.freeze({
    ORO_SHADOW_VALID_001: Object.freeze({
      memberId: "pg77-shadow-member-001",
      status: "active",
      blocked: false,
      mockBalance: 1000,
      currency: "THB",
    }),
    ORO_SHADOW_LOW_001: Object.freeze({
      memberId: "pg77-shadow-member-low",
      status: "active",
      blocked: false,
      mockBalance: 5,
      currency: "THB",
    }),
  }),
  transactions: Object.freeze({}),
  finishedRounds: Object.freeze({
    SHADOW_ROUND_DONE_001: true,
  }),
});

const DUPLICATE_SEED_PAYLOAD = Object.freeze({
  callbackType: "transaction",
  userCode: "ORO_SHADOW_VALID_001",
  transactionCode: "SHADOW_TX_DUP_001",
  amount: -10,
  roundId: "SHADOW_ROUND_DUP_001",
  transactionType: "bet",
  isFinished: false,
});

const SANITIZED_LOG_KEY_NAMES = Object.freeze([
  "authHeader",
  "token",
  "password",
  "clientSecret",
  "mockSecret",
  ["DATA", "BASE_URL"].join(""),
  "PIN",
  "deviceId",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildOroplayShadowProofFlags() {
  return { ...OROPLAY_CALLBACK_RUNTIME_SHADOW_PROOF_FLAGS };
}

function buildSanitizedLogShadowPayload() {
  const payload = {
    requestId: "shadow-sanitize-preview",
    safeMarker: "shadow-log-safe-field",
    nested: {},
  };

  for (const key of SANITIZED_LOG_KEY_NAMES) {
    payload[key] = "mock-shadow-sensitive-value";
    payload.nested[key] = "mock-shadow-nested-sensitive-value";
  }

  return payload;
}

function buildOroplayCallbackRuntimeShadowFixtures() {
  return [
    {
      id: "balance_shadow_valid_member",
      name: "balance shadow valid member",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_SHADOW_VALID_001", requestId: "shadow-balance-valid" },
      expectedDecision: "mock_balance_available",
    },
    {
      id: "balance_shadow_unknown_member_fail_closed",
      name: "balance shadow unknown member fail_closed",
      kind: "balance",
      payload: { callbackType: "balance", userCode: "ORO_SHADOW_UNKNOWN_001", requestId: "shadow-balance-unknown" },
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_shadow_valid_bet",
      name: "transaction shadow valid bet",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_VALID_001",
        transactionCode: "SHADOW_TX_BET_001",
        amount: -25,
        roundId: "SHADOW_ROUND_BET_001",
        transactionType: "bet",
      },
      expectedDecision: "debit_intent_only",
    },
    {
      id: "transaction_shadow_valid_win",
      name: "transaction shadow valid win",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_VALID_001",
        transactionCode: "SHADOW_TX_WIN_001",
        amount: 75,
        roundId: "SHADOW_ROUND_WIN_001",
        transactionType: "win",
      },
      expectedDecision: "credit_intent_only",
    },
    {
      id: "transaction_shadow_duplicate_replay_idempotent",
      name: "transaction shadow duplicate replay idempotent",
      kind: "transaction",
      priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)],
      payload: clone(DUPLICATE_SEED_PAYLOAD),
      expectedDecision: "idempotent_replay",
    },
    {
      id: "transaction_shadow_conflicting_duplicate_manual_review",
      name: "transaction shadow conflicting duplicate manual_review",
      kind: "transaction",
      priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)],
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_VALID_001",
        transactionCode: "SHADOW_TX_DUP_001",
        amount: -12,
        roundId: "SHADOW_ROUND_DUP_001",
        transactionType: "bet",
        isFinished: false,
      },
      expectedDecision: "manual_review",
    },
    {
      id: "transaction_shadow_insufficient_balance_fail_closed",
      name: "transaction shadow insufficient balance fail_closed",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_LOW_001",
        transactionCode: "SHADOW_TX_LOW_001",
        amount: -100,
        roundId: "SHADOW_ROUND_LOW_001",
        transactionType: "bet",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_shadow_malformed_payload_fail_closed",
      name: "transaction shadow malformed payload fail_closed",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "",
        transactionCode: "SHADOW_TX_BAD_001",
        amount: 0,
        transactionType: "bet",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_shadow_unsupported_type_fail_closed",
      name: "transaction shadow unsupported type fail_closed",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_VALID_001",
        transactionCode: "SHADOW_TX_UNSUPPORTED_001",
        amount: 25,
        roundId: "SHADOW_ROUND_UNSUPPORTED_001",
        transactionType: "bonus",
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_shadow_finished_round_replay_blocked",
      name: "transaction shadow finished round replay blocked",
      kind: "transaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_SHADOW_VALID_001",
        transactionCode: "SHADOW_TX_DONE_001",
        amount: 25,
        roundId: "SHADOW_ROUND_DONE_001",
        transactionType: "win",
        isFinished: true,
      },
      expectedDecision: "fail_closed",
    },
    {
      id: "sanitized_log_shadow_preview_redacts_credential_like_keys",
      name: "sanitized log shadow preview redacts credential-like keys",
      kind: "sanitize",
      payload: buildSanitizedLogShadowPayload(),
      expectedDecision: "sanitized_preview",
    },
    {
      id: "proof_flags_all_false",
      name: "proof flags all false",
      kind: "proof",
      proofFlags: buildOroplayShadowProofFlags(),
      expectedDecision: "proof_flags_all_false",
    },
  ];
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_SHADOW_MOCK_STATE,
  OROPLAY_CALLBACK_RUNTIME_SHADOW_PROOF_FLAGS,
  buildOroplayCallbackRuntimeShadowFixtures,
  buildOroplayShadowProofFlags,
  buildSanitizedLogShadowPayload,
};
