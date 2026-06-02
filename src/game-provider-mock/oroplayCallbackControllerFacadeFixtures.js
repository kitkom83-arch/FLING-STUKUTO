"use strict";

const OROPLAY_CALLBACK_CONTROLLER_FACADE_PROOF_FLAGS = Object.freeze({
  expressRouteWiring: false,
  walletMutation: false,
  ledgerMutation: false,
  prismaWrite: false,
  externalNetwork: false,
  aliasBalance: false,
  aliasTransaction: false,
  activationAllowed: false,
});

const OROPLAY_CALLBACK_CONTROLLER_FACADE_MOCK_STATE = Object.freeze({
  members: Object.freeze({
    ORO_FACADE_VALID_001: Object.freeze({
      memberId: "pg77-facade-member-001",
      status: "active",
      blocked: false,
      mockBalance: 1000,
      currency: "THB",
    }),
    ORO_FACADE_LOW_001: Object.freeze({
      memberId: "pg77-facade-member-low",
      status: "active",
      blocked: false,
      mockBalance: 5,
      currency: "THB",
    }),
  }),
  transactions: Object.freeze({}),
  finishedRounds: Object.freeze({
    FACADE_ROUND_DONE_001: true,
  }),
});

const VALID_MOCK_AUTH = Object.freeze({
  allowed: true,
  principal: "oroplay-facade-mock",
});

const UNAUTHORIZED_MOCK_AUTH = Object.freeze({
  allowed: false,
  principal: "oroplay-facade-mock",
});

const DUPLICATE_SEED_PAYLOAD = Object.freeze({
  callbackType: "transaction",
  userCode: "ORO_FACADE_VALID_001",
  transactionCode: "FACADE_TX_DUP_001",
  amount: 10,
  roundId: "FACADE_ROUND_DUP_001",
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

function buildOroplayControllerFacadeMockState() {
  return clone(OROPLAY_CALLBACK_CONTROLLER_FACADE_MOCK_STATE);
}

function buildOroplayControllerFacadeProofFlags() {
  return { ...OROPLAY_CALLBACK_CONTROLLER_FACADE_PROOF_FLAGS };
}

function buildMockRequest(kind, body, options = {}) {
  return {
    callbackType: kind,
    mockAuth: clone(options.mockAuth || VALID_MOCK_AUTH),
    requestMeta: {
      requestId: options.requestId || `facade-${kind}-request`,
      source: "mock-direct-call",
    },
    body: clone(body || {}),
    state: buildOroplayControllerFacadeMockState(),
    priorInvocations: Array.isArray(options.priorInvocations) ? options.priorInvocations.map(clone) : [],
  };
}

function buildSanitizedFacadeMockRequest() {
  const body = {
    callbackType: "balance",
    userCode: "ORO_FACADE_VALID_001",
    requestId: "facade-sanitize-preview",
    safeMarker: "facade-log-safe-field",
    nested: {},
  };

  for (const key of SANITIZED_LOG_KEY_NAMES) {
    body[key] = "mock-facade-sensitive-value";
    body.nested[key] = "mock-facade-nested-sensitive-value";
  }

  return {
    callbackType: "balance",
    mockAuth: clone(VALID_MOCK_AUTH),
    requestMeta: {
      requestId: "facade-sanitize-request",
      safeMarker: "facade-request-safe-field",
    },
    body,
    state: buildOroplayControllerFacadeMockState(),
  };
}

function buildOroplayCallbackControllerFacadeFixtures() {
  return [
    {
      id: "balance_facade_valid_member",
      name: "balance facade valid member",
      kind: "balance",
      mockRequest: buildMockRequest("balance", {
        callbackType: "balance",
        userCode: "ORO_FACADE_VALID_001",
        requestId: "facade-balance-valid",
      }),
      expectedStatus: "success",
      expectedDecision: "mock_balance_available",
    },
    {
      id: "balance_facade_unauthorized_mock_fail_closed",
      name: "balance facade unauthorized mock fail_closed",
      kind: "balance",
      mockRequest: buildMockRequest(
        "balance",
        {
          callbackType: "balance",
          userCode: "ORO_FACADE_VALID_001",
          requestId: "facade-balance-unauthorized",
        },
        { mockAuth: UNAUTHORIZED_MOCK_AUTH }
      ),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "balance_facade_unknown_member_fail_closed",
      name: "balance facade unknown member fail_closed",
      kind: "balance",
      mockRequest: buildMockRequest("balance", {
        callbackType: "balance",
        userCode: "ORO_FACADE_UNKNOWN_001",
        requestId: "facade-balance-unknown",
      }),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "balance_facade_malformed_request_fail_closed",
      name: "balance facade malformed request fail_closed",
      kind: "balance",
      mockRequest: {
        callbackType: "balance",
        mockAuth: clone(VALID_MOCK_AUTH),
        requestMeta: { requestId: "facade-balance-malformed" },
        state: buildOroplayControllerFacadeMockState(),
      },
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_facade_valid_bet",
      name: "transaction facade valid bet",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", {
        callbackType: "transaction",
        userCode: "ORO_FACADE_VALID_001",
        transactionCode: "FACADE_TX_BET_001",
        amount: 25,
        roundId: "FACADE_ROUND_BET_001",
        transactionType: "bet",
      }),
      expectedStatus: "success",
      expectedDecision: "debit_intent_only",
    },
    {
      id: "transaction_facade_valid_win",
      name: "transaction facade valid win",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", {
        callbackType: "transaction",
        userCode: "ORO_FACADE_VALID_001",
        transactionCode: "FACADE_TX_WIN_001",
        amount: 75,
        roundId: "FACADE_ROUND_WIN_001",
        transactionType: "win",
      }),
      expectedStatus: "success",
      expectedDecision: "credit_intent_only",
    },
    {
      id: "transaction_facade_unauthorized_mock_fail_closed",
      name: "transaction facade unauthorized mock fail_closed",
      kind: "transaction",
      mockRequest: buildMockRequest(
        "transaction",
        {
          callbackType: "transaction",
          userCode: "ORO_FACADE_VALID_001",
          transactionCode: "FACADE_TX_UNAUTH_001",
          amount: 25,
          roundId: "FACADE_ROUND_UNAUTH_001",
          transactionType: "bet",
        },
        { mockAuth: UNAUTHORIZED_MOCK_AUTH }
      ),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_facade_duplicate_replay_idempotent",
      name: "transaction facade duplicate replay idempotent",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", clone(DUPLICATE_SEED_PAYLOAD), {
        priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)],
      }),
      expectedStatus: "idempotent_replay",
      expectedDecision: "idempotent_replay",
    },
    {
      id: "transaction_facade_conflicting_duplicate_manual_review",
      name: "transaction facade conflicting duplicate manual_review",
      kind: "transaction",
      mockRequest: buildMockRequest(
        "transaction",
        {
          callbackType: "transaction",
          userCode: "ORO_FACADE_VALID_001",
          transactionCode: "FACADE_TX_DUP_001",
          amount: 12,
          roundId: "FACADE_ROUND_DUP_001",
          transactionType: "bet",
          isFinished: false,
        },
        { priorInvocations: [clone(DUPLICATE_SEED_PAYLOAD)] }
      ),
      expectedStatus: "manual_review",
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_facade_insufficient_balance_fail_closed",
      name: "transaction facade insufficient balance fail_closed",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", {
        callbackType: "transaction",
        userCode: "ORO_FACADE_LOW_001",
        transactionCode: "FACADE_TX_LOW_001",
        amount: 100,
        roundId: "FACADE_ROUND_LOW_001",
        transactionType: "bet",
      }),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_facade_unsupported_type_fail_closed",
      name: "transaction facade unsupported type fail_closed",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", {
        callbackType: "transaction",
        userCode: "ORO_FACADE_VALID_001",
        transactionCode: "FACADE_TX_UNSUPPORTED_001",
        amount: 25,
        roundId: "FACADE_ROUND_UNSUPPORTED_001",
        transactionType: "bonus",
      }),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "transaction_facade_finished_round_replay_blocked",
      name: "transaction facade finished round replay blocked",
      kind: "transaction",
      mockRequest: buildMockRequest("transaction", {
        callbackType: "transaction",
        userCode: "ORO_FACADE_VALID_001",
        transactionCode: "FACADE_TX_DONE_001",
        amount: 25,
        roundId: "FACADE_ROUND_DONE_001",
        transactionType: "win",
        isFinished: true,
      }),
      expectedStatus: "fail_closed",
      expectedDecision: "fail_closed",
    },
    {
      id: "response_envelope_produced_from_facade",
      name: "response envelope produced from facade",
      kind: "response",
      mockRequest: buildMockRequest("balance", {
        callbackType: "balance",
        userCode: "ORO_FACADE_VALID_001",
        requestId: "facade-response-envelope",
      }),
      expectedStatus: "success",
    },
    {
      id: "sanitized_facade_log_preview_redacts_credential_like_keys",
      name: "sanitized facade log preview redacts credential-like keys",
      kind: "sanitize",
      mockRequest: buildSanitizedFacadeMockRequest(),
      expectedStatus: "success",
    },
    {
      id: "proof_flags_all_false",
      name: "proof flags all false",
      kind: "proof",
      proofFlags: buildOroplayControllerFacadeProofFlags(),
      expectedDecision: "proof_flags_all_false",
    },
  ];
}

module.exports = {
  OROPLAY_CALLBACK_CONTROLLER_FACADE_MOCK_STATE,
  OROPLAY_CALLBACK_CONTROLLER_FACADE_PROOF_FLAGS,
  buildOroplayCallbackControllerFacadeFixtures,
  buildOroplayControllerFacadeMockState,
  buildOroplayControllerFacadeProofFlags,
  buildSanitizedFacadeMockRequest,
};
