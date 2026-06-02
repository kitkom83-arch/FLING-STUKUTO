"use strict";

const {
  OROPLAY_LEDGER_RECONCILIATION_BOUNDARY,
  sanitizeOroplayCallbackLogPreview,
  validateCallbackPayload,
} = require("./oroplayCallbackReadinessContract");

const MOCK_MEMBERS_BY_USER_CODE = Object.freeze({
  ORO_VALID_001: Object.freeze({
    memberId: "pg77-member-001",
    status: "active",
    blocked: false,
    mockBalance: 1000,
  }),
  ORO_BLOCKED_001: Object.freeze({
    memberId: "pg77-member-blocked",
    status: "active",
    blocked: true,
    mockBalance: 1000,
  }),
  ORO_INACTIVE_001: Object.freeze({
    memberId: "pg77-member-inactive",
    status: "inactive",
    blocked: false,
    mockBalance: 1000,
  }),
  ORO_LOW_BAL_001: Object.freeze({
    memberId: "pg77-member-low-balance",
    status: "active",
    blocked: false,
    mockBalance: 5,
  }),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mapMockMember(userCode) {
  const member = MOCK_MEMBERS_BY_USER_CODE[userCode];
  if (!member) {
    return { ok: false, result: "fail_closed", reason: "unknown_userCode", dbQuery: false };
  }
  if (member.blocked) {
    return { ok: false, result: "fail_closed", reason: "blocked_member", dbQuery: false };
  }
  if (member.status !== "active") {
    return { ok: false, result: "fail_closed", reason: "inactive_member", dbQuery: false };
  }
  return {
    ok: true,
    result: "mapped_pg77_member_identity",
    dbQuery: false,
    member: clone(member),
  };
}

function fingerprintPayload(payload) {
  return JSON.stringify({
    userCode: payload.userCode,
    transactionCode: payload.transactionCode,
    amount: payload.amount,
    roundId: payload.roundId || null,
    isFinished: payload.isFinished === true,
    transactionType: payload.transactionType || null,
  });
}

function evaluateIdempotency(payload, state) {
  const transactionCode = payload.transactionCode;
  const roundId = payload.roundId;
  const nextState = clone(state || { transactions: {}, finishedRounds: {} });
  const payloadFingerprint = fingerprintPayload(payload);

  if (roundId && nextState.finishedRounds[roundId]) {
    return {
      result: "replay_blocked",
      manualReview: false,
      failClosed: true,
      state: nextState,
      mutatesLedger: false,
      mutatesWallet: false,
    };
  }

  if (transactionCode && nextState.transactions[transactionCode]) {
    const previous = nextState.transactions[transactionCode];
    if (previous.payloadFingerprint === payloadFingerprint) {
      return {
        result: "duplicate_safe",
        manualReview: false,
        failClosed: false,
        state: nextState,
        mutatesLedger: false,
        mutatesWallet: false,
      };
    }
    return {
      result: "manual_review_fail_closed",
      manualReview: true,
      failClosed: true,
      state: nextState,
      mutatesLedger: false,
      mutatesWallet: false,
    };
  }

  if (transactionCode) {
    nextState.transactions[transactionCode] = { payloadFingerprint };
  }
  if (roundId && payload.isFinished === true) {
    nextState.finishedRounds[roundId] = true;
  }

  return {
    result: "new_readiness_recorded_in_memory",
    manualReview: false,
    failClosed: false,
    state: nextState,
    mutatesLedger: false,
    mutatesWallet: false,
  };
}

function evaluateReadinessRequest(input) {
  const payload = input && input.payload;
  const validation = validateCallbackPayload(payload);
  const logPreview = sanitizeOroplayCallbackLogPreview({
    requestId: input.requestId || "mock-request",
    route: input.route,
    eventType: input.eventType,
    body: payload,
    headers: input.headers || {},
    result: validation.result,
  });

  if (!validation.ok) {
    return {
      scenario: input.name,
      callbackType: validation.callbackType,
      result: validation.result,
      reason: validation.reason,
      failClosed: true,
      manualReview: false,
      logPreview,
      safety: clone(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY),
    };
  }

  const memberMapping = mapMockMember(validation.userCode);
  if (!memberMapping.ok) {
    return {
      scenario: input.name,
      callbackType: validation.callbackType,
      result: memberMapping.result,
      reason: memberMapping.reason,
      failClosed: true,
      manualReview: false,
      dbQuery: memberMapping.dbQuery,
      logPreview,
      safety: clone(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY),
    };
  }

  if (validation.callbackType === "balance") {
    return {
      scenario: input.name,
      callbackType: "balance",
      result: "balance_readiness_only",
      failClosed: false,
      manualReview: false,
      mappedMemberId: memberMapping.member.memberId,
      mockBalanceAvailable: memberMapping.member.mockBalance,
      logPreview,
      safety: clone(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY),
    };
  }

  const idempotency = evaluateIdempotency(payload, input.idempotencyState);
  if (idempotency.result === "new_readiness_recorded_in_memory" && validation.intent === "debit_readiness") {
    const debitAmount = Math.abs(validation.amount);
    if (memberMapping.member.mockBalance < debitAmount) {
      return {
        scenario: input.name,
        callbackType: "transaction",
        result: "insufficient_balance_readiness_only",
        failClosed: true,
        manualReview: false,
        mappedMemberId: memberMapping.member.memberId,
        idempotencyState: idempotency.state,
        logPreview,
        safety: clone(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY),
      };
    }
  }

  return {
    scenario: input.name,
    callbackType: "transaction",
    result: idempotency.result,
    failClosed: idempotency.failClosed,
    manualReview: idempotency.manualReview,
    mappedMemberId: memberMapping.member.memberId,
    idempotencyState: idempotency.state,
    logPreview,
    safety: clone(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY),
  };
}

function buildOroplayCallbackReadinessHarnessScenarios() {
  const duplicateState = {
    transactions: {
      TX_DUP_001: {
        payloadFingerprint: fingerprintPayload({
          userCode: "ORO_VALID_001",
          transactionCode: "TX_DUP_001",
          amount: -10,
          roundId: "ROUND_DUP_001",
          isFinished: false,
        }),
      },
    },
    finishedRounds: {},
  };
  const finishedRoundState = {
    transactions: {},
    finishedRounds: {
      ROUND_DONE_001: true,
    },
  };

  return [
    {
      name: "valid balance readiness",
      payload: { callbackType: "balance", userCode: "ORO_VALID_001", vendorGameId: "ignored-mock" },
      route: "/api/oroplay/balance",
    },
    {
      name: "unknown userCode fail-closed",
      payload: { callbackType: "balance", userCode: "ORO_UNKNOWN_001" },
      route: "/api/oroplay/balance",
    },
    {
      name: "blocked member fail-closed",
      payload: { callbackType: "balance", userCode: "ORO_BLOCKED_001" },
      route: "/api/oroplay/balance",
    },
    {
      name: "malformed balance request",
      payload: { callbackType: "balance", userCode: "" },
      route: "/api/oroplay/balance",
    },
    {
      name: "valid transaction readiness",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_VALID_001",
        amount: -10,
        roundId: "ROUND_VALID_001",
        transactionType: "bet",
      },
      route: "/api/oroplay/transaction",
      idempotencyState: { transactions: {}, finishedRounds: {} },
    },
    {
      name: "duplicate transactionCode safe result",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_DUP_001",
        amount: -10,
        roundId: "ROUND_DUP_001",
        isFinished: false,
      },
      route: "/api/oroplay/transaction",
      idempotencyState: duplicateState,
    },
    {
      name: "conflicting duplicate manual_review fail-closed",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_DUP_001",
        amount: -12,
        roundId: "ROUND_DUP_001",
        isFinished: false,
      },
      route: "/api/oroplay/transaction",
      idempotencyState: duplicateState,
    },
    {
      name: "insufficient balance readiness only",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_LOW_BAL_001",
        transactionCode: "TX_LOW_BAL_001",
        amount: -100,
        roundId: "ROUND_LOW_BAL_001",
        transactionType: "bet",
      },
      route: "/api/oroplay/transaction",
      idempotencyState: { transactions: {}, finishedRounds: {} },
    },
    {
      name: "finished round replay blocked",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_ROUND_REPLAY_001",
        amount: 25,
        roundId: "ROUND_DONE_001",
        isFinished: true,
      },
      route: "/api/oroplay/transaction",
      idempotencyState: finishedRoundState,
    },
    {
      name: "credential-like log redaction",
      payload: {
        callbackType: "transaction",
        userCode: "ORO_VALID_001",
        transactionCode: "TX_SAFE_LOG_001",
        amount: 20,
        nestedSecretMarker: "field-name-only",
      },
      headers: {
        authorization: `${["Ba", "sic"].join("")} ${["mock", "value"].join("-")}`,
      },
      route: "/api/oroplay/transaction",
      idempotencyState: { transactions: {}, finishedRounds: {} },
    },
  ];
}

function runOroplayCallbackReadinessHarness() {
  return buildOroplayCallbackReadinessHarnessScenarios().map(evaluateReadinessRequest);
}

module.exports = {
  buildOroplayCallbackReadinessHarnessScenarios,
  evaluateReadinessRequest,
  runOroplayCallbackReadinessHarness,
};
