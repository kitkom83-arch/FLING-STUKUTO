"use strict";

const OROPLAY_CALLBACK_REQUEST_RESPONSE_PROOF_FLAGS = Object.freeze({
  walletMutation: false,
  ledgerMutation: false,
  prismaWrite: false,
  externalNetwork: false,
  aliasBalance: false,
  aliasTransaction: false,
  liveRouteWiring: false,
  activationAllowed: false,
});

const OROPLAY_CALLBACK_REQUEST_RESPONSE_MOCK_STATE = Object.freeze({
  members: Object.freeze({
    ORO_ENVELOPE_VALID_001: Object.freeze({
      memberId: "pg77-envelope-member-001",
      status: "active",
      blocked: false,
      mockBalance: 1000,
      currency: "THB",
    }),
    ORO_ENVELOPE_LOW_001: Object.freeze({
      memberId: "pg77-envelope-member-low",
      status: "active",
      blocked: false,
      mockBalance: 5,
      currency: "THB",
    }),
  }),
  transactions: Object.freeze({}),
  finishedRounds: Object.freeze({
    ENVELOPE_ROUND_DONE_001: true,
  }),
});

const DUPLICATE_SEED_PAYLOAD = Object.freeze({
  callbackType: "transaction",
  userCode: "ORO_ENVELOPE_VALID_001",
  transactionCode: "ENVELOPE_TX_DUP_001",
  amount: 10,
  roundId: "ENVELOPE_ROUND_DUP_001",
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
  "mockRedactionKeyName",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildOroplayEnvelopeMockState() {
  return clone(OROPLAY_CALLBACK_REQUEST_RESPONSE_MOCK_STATE);
}

function buildOroplayEnvelopeProofFlags() {
  return { ...OROPLAY_CALLBACK_REQUEST_RESPONSE_PROOF_FLAGS };
}

function buildSanitizedEnvelopePayload() {
  const payload = {
    callbackType: "balance",
    userCode: "ORO_ENVELOPE_VALID_001",
    requestId: "envelope-sanitize-preview",
    safeMarker: "envelope-log-safe-field",
    nested: {},
  };

  for (const key of SANITIZED_LOG_KEY_NAMES) {
    payload[key] = "mock-envelope-sensitive-value";
    payload.nested[key] = "mock-envelope-nested-sensitive-value";
  }

  return payload;
}

function buildOroplayCallbackRequestResponseFixtures() {
  const state = buildOroplayEnvelopeMockState();

  return [
    {
      id: "balance_request_envelope_valid_member",
      name: "balance request envelope valid member",
      kind: "balance",
      state,
      payload: {
        callbackType: "balance",
        userCode: "ORO_ENVELOPE_VALID_001",
        requestId: "envelope-balance-valid",
      },
      expectedDecision: "mock_balance_available",
      expectedResponseStatus: "success",
    },
    {
      id: "balance_request_envelope_unknown_member_fail_closed",
      name: "balance request envelope unknown member fail_closed",
      kind: "balance",
      state,
      payload: {
        callbackType: "balance",
        userCode: "ORO_ENVELOPE_UNKNOWN_001",
        requestId: "envelope-balance-unknown",
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "balance_request_malformed_payload_fail_closed",
      name: "balance request malformed payload fail_closed",
      kind: "balance",
      state,
      payload: {
        callbackType: "balance",
        requestId: "envelope-balance-malformed",
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "transaction_request_valid_bet",
      name: "transaction request valid bet",
      kind: "transaction",
      state,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_VALID_001",
        transactionCode: "ENVELOPE_TX_BET_001",
        amount: 25,
        roundId: "ENVELOPE_ROUND_BET_001",
        transactionType: "bet",
      },
      expectedDecision: "debit_intent_only",
      expectedResponseStatus: "success",
    },
    {
      id: "transaction_request_valid_win",
      name: "transaction request valid win",
      kind: "transaction",
      state,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_VALID_001",
        transactionCode: "ENVELOPE_TX_WIN_001",
        amount: 75,
        roundId: "ENVELOPE_ROUND_WIN_001",
        transactionType: "win",
      },
      expectedDecision: "credit_intent_only",
      expectedResponseStatus: "success",
    },
    {
      id: "transaction_request_duplicate_replay_idempotent",
      name: "transaction request duplicate replay idempotent",
      kind: "transaction",
      state,
      priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)],
      payload: clone(DUPLICATE_SEED_PAYLOAD),
      expectedDecision: "idempotent_replay",
      expectedResponseStatus: "idempotent_replay",
    },
    {
      id: "transaction_request_conflicting_duplicate_manual_review",
      name: "transaction request conflicting duplicate manual_review",
      kind: "transaction",
      state,
      priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)],
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_VALID_001",
        transactionCode: "ENVELOPE_TX_DUP_001",
        amount: 12,
        roundId: "ENVELOPE_ROUND_DUP_001",
        transactionType: "bet",
        isFinished: false,
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "manual_review",
    },
    {
      id: "transaction_request_insufficient_balance_fail_closed",
      name: "transaction request insufficient balance fail_closed",
      kind: "transaction",
      state,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_LOW_001",
        transactionCode: "ENVELOPE_TX_LOW_001",
        amount: 100,
        roundId: "ENVELOPE_ROUND_LOW_001",
        transactionType: "bet",
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "transaction_request_unsupported_type_fail_closed",
      name: "transaction request unsupported type fail_closed",
      kind: "transaction",
      state,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_VALID_001",
        transactionCode: "ENVELOPE_TX_UNSUPPORTED_001",
        amount: 25,
        roundId: "ENVELOPE_ROUND_UNSUPPORTED_001",
        transactionType: "bonus",
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "transaction_request_finished_round_replay_blocked",
      name: "transaction request finished round replay blocked",
      kind: "transaction",
      state,
      payload: {
        callbackType: "transaction",
        userCode: "ORO_ENVELOPE_VALID_001",
        transactionCode: "ENVELOPE_TX_DONE_001",
        amount: 25,
        roundId: "ENVELOPE_ROUND_DONE_001",
        transactionType: "win",
        isFinished: true,
      },
      expectedDecision: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "response_envelope_success_shape",
      name: "response envelope success shape",
      kind: "response",
      responseStatus: "success",
      expectedResponseStatus: "success",
    },
    {
      id: "response_envelope_fail_closed_shape",
      name: "response envelope fail_closed shape",
      kind: "response",
      responseStatus: "fail_closed",
      expectedResponseStatus: "fail_closed",
    },
    {
      id: "response_envelope_manual_review_shape",
      name: "response envelope manual_review shape",
      kind: "response",
      responseStatus: "manual_review",
      expectedResponseStatus: "manual_review",
    },
    {
      id: "sanitized_response_log_preview_redacts_credential_like_keys",
      name: "sanitized response/log preview redacts credential-like keys",
      kind: "sanitize",
      state,
      payload: buildSanitizedEnvelopePayload(),
      expectedDecision: "sanitized_preview",
    },
    {
      id: "proof_flags_all_false",
      name: "proof flags all false",
      kind: "proof",
      proofFlags: buildOroplayEnvelopeProofFlags(),
      expectedDecision: "proof_flags_all_false",
    },
  ];
}

module.exports = {
  OROPLAY_CALLBACK_REQUEST_RESPONSE_MOCK_STATE,
  OROPLAY_CALLBACK_REQUEST_RESPONSE_PROOF_FLAGS,
  buildOroplayCallbackRequestResponseFixtures,
  buildOroplayEnvelopeMockState,
  buildOroplayEnvelopeProofFlags,
  buildSanitizedEnvelopePayload,
};
