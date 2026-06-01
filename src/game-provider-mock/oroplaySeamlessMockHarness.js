"use strict";

const {
  OROPLAY_SEAMLESS_ERROR_CODES,
  OROPLAY_SEAMLESS_STATUSES,
  normalizeMoneyAmount,
  sanitizeOroplayPayload,
  validateBasicAuthHeader,
  buildBalanceResponse,
  buildTransactionResponse,
  buildErrorResponse,
} = require("./oroplaySeamlessContract");

const DEFAULT_USER_CODE = "mock-oroplay-user-001";
const DEFAULT_CALLBACK_USER = "mock-oroplay-callback-user";
const DEFAULT_CALLBACK_SECRET = "redacted-placeholder";

function createDefaultOroplaySeamlessHarness(options = {}) {
  const expectedUser = options.expectedUser || DEFAULT_CALLBACK_USER;
  const expectedSecret = options.expectedSecret || DEFAULT_CALLBACK_SECRET;
  const users = new Map([[DEFAULT_USER_CODE, { userCode: DEFAULT_USER_CODE, balance: 1000 }]]);
  const transactions = new Map();
  const rounds = new Map();
  const sanitizedLogs = [];

  function logCallback(type, authorizationHeader, body, response) {
    sanitizedLogs.push(
      sanitizeOroplayPayload({
        type,
        authorizationHeader,
        body,
        response,
      })
    );
  }

  function authError(authorizationHeader, body, type) {
    const auth = validateBasicAuthHeader({ authorizationHeader, expectedUser, expectedSecret });
    if (auth.ok) return null;
    const response = buildErrorResponse({
      errorCode: auth.errorCode,
      message: auth.message,
    });
    logCallback(type, authorizationHeader, body, response);
    return response;
  }

  function getUserBalance(userCode) {
    const user = users.get(userCode);
    return user ? normalizeMoneyAmount(user.balance) : null;
  }

  function handleBalance({ authorizationHeader, body } = {}) {
    const authFailure = authError(authorizationHeader, body, "balance");
    if (authFailure) return authFailure;

    const userCode = body && body.userCode;
    const user = users.get(userCode);
    if (!user) {
      const response = buildErrorResponse({
        errorCode: OROPLAY_SEAMLESS_ERROR_CODES.USER_NOT_FOUND,
        message: "User not found.",
      });
      logCallback("balance", authorizationHeader, body, response);
      return response;
    }

    const response = buildBalanceResponse({ userCode, balance: user.balance });
    logCallback("balance", authorizationHeader, body, response);
    return response;
  }

  function handleTransaction({ authorizationHeader, body } = {}) {
    const authFailure = authError(authorizationHeader, body, "transaction");
    if (authFailure) return authFailure;

    const payload = body && typeof body === "object" ? body : {};
    const userCode = payload.userCode;
    const transactionCode = payload.transactionCode;
    const roundId = payload.roundId;
    const amount = normalizeMoneyAmount(payload.amount);

    if (!transactionCode || !roundId || amount === null || amount === 0) {
      const response = buildTransactionResponse({
        userCode,
        transactionCode,
        roundId,
        balance: getUserBalance(userCode),
        status: OROPLAY_SEAMLESS_STATUSES.REJECTED,
        errorCode: OROPLAY_SEAMLESS_ERROR_CODES.INVALID_TRANSACTION,
        message: "Invalid transaction payload.",
      });
      logCallback("transaction", authorizationHeader, body, response);
      return response;
    }

    if (transactions.has(transactionCode)) {
      const saved = transactions.get(transactionCode);
      logCallback("transaction_duplicate", authorizationHeader, body, saved.response);
      return saved.response;
    }

    const user = users.get(userCode);
    if (!user) {
      const response = buildTransactionResponse({
        userCode,
        transactionCode,
        roundId,
        balance: null,
        status: OROPLAY_SEAMLESS_STATUSES.REJECTED,
        errorCode: OROPLAY_SEAMLESS_ERROR_CODES.USER_NOT_FOUND,
        message: "User not found.",
      });
      logCallback("transaction", authorizationHeader, body, response);
      return response;
    }

    if (rounds.get(roundId) && rounds.get(roundId).finished === true) {
      const response = buildTransactionResponse({
        userCode,
        transactionCode,
        roundId,
        balance: user.balance,
        status: OROPLAY_SEAMLESS_STATUSES.REJECTED,
        errorCode: OROPLAY_SEAMLESS_ERROR_CODES.ROUND_FINISHED,
        message: "Round is already finished.",
      });
      logCallback("transaction", authorizationHeader, body, response);
      return response;
    }

    if (amount < 0 && user.balance < Math.abs(amount)) {
      const response = buildTransactionResponse({
        userCode,
        transactionCode,
        roundId,
        balance: user.balance,
        status: OROPLAY_SEAMLESS_STATUSES.REJECTED,
        errorCode: OROPLAY_SEAMLESS_ERROR_CODES.INSUFFICIENT_BALANCE,
        message: "Insufficient balance.",
      });
      logCallback("transaction", authorizationHeader, body, response);
      return response;
    }

    user.balance = normalizeMoneyAmount(user.balance + amount);
    const response = buildTransactionResponse({
      userCode,
      transactionCode,
      roundId,
      balance: user.balance,
      status: OROPLAY_SEAMLESS_STATUSES.ACCEPTED,
      message: amount < 0 ? "Bet debit accepted." : "Win credit accepted.",
    });
    transactions.set(transactionCode, { amount, response });

    if (payload.isFinished === true) {
      rounds.set(roundId, { roundId, finished: true });
    } else if (!rounds.has(roundId)) {
      rounds.set(roundId, { roundId, finished: false });
    }

    logCallback("transaction", authorizationHeader, body, response);
    return response;
  }

  return {
    createDefaultOroplaySeamlessHarness,
    handleBalance,
    handleTransaction,
    getUserBalance,
    getSanitizedLogs: () => sanitizedLogs.slice(),
  };
}

module.exports = {
  DEFAULT_USER_CODE,
  createDefaultOroplaySeamlessHarness,
};
