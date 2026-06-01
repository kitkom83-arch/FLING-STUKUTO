"use strict";

const assert = require("assert");

const {
  OROPLAY_SEAMLESS_ERROR_CODES,
  OROPLAY_SEAMLESS_STATUSES,
  sanitizeOroplayPayload,
  validateBasicAuthHeader,
} = require("../game-provider-mock/oroplaySeamlessContract");
const {
  DEFAULT_USER_CODE,
  createDefaultOroplaySeamlessHarness,
} = require("../game-provider-mock/oroplaySeamlessMockHarness");

const CALLBACK_USER = "mock-oroplay-callback-user";
const CALLBACK_SECRET = "redacted-placeholder";
const GOOD_AUTH_HEADER = `Basic ${Buffer.from(`${CALLBACK_USER}:${CALLBACK_SECRET}`).toString("base64")}`;
const BAD_AUTH_HEADER = `Basic ${Buffer.from(`${CALLBACK_USER}:wrong-placeholder`).toString("base64")}`;
const CLIENT_SECRET_KEY = ["client", "Secret"].join("");

function assertNoSecretLeak(label, value) {
  const text = JSON.stringify(value);
  const forbidden = [
    GOOD_AUTH_HEADER,
    BAD_AUTH_HEADER,
    CALLBACK_SECRET,
    "wrong-placeholder",
    CLIENT_SECRET_KEY,
    "token",
    "password",
    "DATABASE_URL",
    "postgres://",
    ["Bear", "er"].join("") + " ",
  ];
  for (const marker of forbidden) {
    assert(!text.includes(marker), `${label} leaked forbidden marker: ${marker}`);
  }
}

function assertAccepted(response) {
  assert.strictEqual(response.success, true, "response must succeed.");
  assert.strictEqual(response.status, OROPLAY_SEAMLESS_STATUSES.ACCEPTED, "response must be accepted.");
  assert.strictEqual(response.errorCode, null, "accepted response must not include an error code.");
}

function assertRejected(response, errorCode) {
  assert.strictEqual(response.success, false, "response must fail.");
  assert.strictEqual(response.status, OROPLAY_SEAMLESS_STATUSES.REJECTED, "response must be rejected.");
  assert.strictEqual(response.errorCode, errorCode, `response must reject with ${errorCode}.`);
}

function main() {
  const harness = createDefaultOroplaySeamlessHarness({
    expectedUser: CALLBACK_USER,
    expectedSecret: CALLBACK_SECRET,
  });

  const authAccepted = validateBasicAuthHeader({
    authorizationHeader: GOOD_AUTH_HEADER,
    expectedUser: CALLBACK_USER,
    expectedSecret: CALLBACK_SECRET,
  });
  assert.strictEqual(authAccepted.ok, true, "Basic Auth must be accepted.");
  assertNoSecretLeak("accepted auth result", authAccepted);

  const initialBalance = harness.getUserBalance(DEFAULT_USER_CODE);
  const authRejected = harness.handleBalance({
    authorizationHeader: BAD_AUTH_HEADER,
    body: { userCode: DEFAULT_USER_CODE },
  });
  assertRejected(authRejected, OROPLAY_SEAMLESS_ERROR_CODES.AUTH_FAILED);
  assert.strictEqual(harness.getUserBalance(DEFAULT_USER_CODE), initialBalance, "auth reject must not change balance.");

  const balance = harness.handleBalance({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: { userCode: DEFAULT_USER_CODE },
  });
  assertAccepted(balance);
  assert.strictEqual(balance.userCode, DEFAULT_USER_CODE, "balance response must include userCode.");
  assert.strictEqual(balance.balance, 1000, "balance response must include normalized balance.");

  const unknownUser = harness.handleBalance({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: { userCode: "mock-oroplay-missing-user" },
  });
  assertRejected(unknownUser, OROPLAY_SEAMLESS_ERROR_CODES.USER_NOT_FOUND);

  const bet = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-bet-001",
      roundId: "oro-round-001",
      amount: -125.255,
    },
  });
  assertAccepted(bet);
  assert.strictEqual(bet.balance, 874.75, "bet debit must subtract normalized amount.");

  const duplicateBet = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-bet-001",
      roundId: "oro-round-001",
      amount: -125.255,
    },
  });
  assert.deepStrictEqual(duplicateBet, bet, "duplicate bet must return saved response.");
  assert.strictEqual(harness.getUserBalance(DEFAULT_USER_CODE), 874.75, "duplicate bet must not debit twice.");

  const win = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-win-001",
      roundId: "oro-round-001",
      amount: 50,
    },
  });
  assertAccepted(win);
  assert.strictEqual(win.balance, 924.75, "win credit must add amount.");

  const duplicateWin = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-win-001",
      roundId: "oro-round-001",
      amount: 50,
    },
  });
  assert.deepStrictEqual(duplicateWin, win, "duplicate win must return saved response.");
  assert.strictEqual(harness.getUserBalance(DEFAULT_USER_CODE), 924.75, "duplicate win must not credit twice.");

  const beforeInsufficient = harness.getUserBalance(DEFAULT_USER_CODE);
  const insufficient = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-bet-002",
      roundId: "oro-round-002",
      amount: -5000,
    },
  });
  assertRejected(insufficient, OROPLAY_SEAMLESS_ERROR_CODES.INSUFFICIENT_BALANCE);
  assert.strictEqual(
    harness.getUserBalance(DEFAULT_USER_CODE),
    beforeInsufficient,
    "insufficient balance must not change balance."
  );

  const finishedRoundWin = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-win-002",
      roundId: "oro-round-003",
      amount: 10,
      isFinished: true,
    },
  });
  assertAccepted(finishedRoundWin);
  const afterFinishedRound = harness.getUserBalance(DEFAULT_USER_CODE);
  const finishedRoundReject = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-win-003",
      roundId: "oro-round-003",
      amount: 10,
    },
  });
  assertRejected(finishedRoundReject, OROPLAY_SEAMLESS_ERROR_CODES.ROUND_FINISHED);
  assert.strictEqual(
    harness.getUserBalance(DEFAULT_USER_CODE),
    afterFinishedRound,
    "finished round reject must not change balance."
  );

  const malformed = harness.handleTransaction({
    authorizationHeader: GOOD_AUTH_HEADER,
    body: {
      userCode: DEFAULT_USER_CODE,
      transactionCode: "oro-invalid-001",
      roundId: "oro-round-004",
      amount: 0,
      [CLIENT_SECRET_KEY]: "must-not-leak",
      token: "must-not-leak",
      password: "must-not-leak",
      DATABASE_URL: "postgres://must-not-leak",
    },
  });
  assertRejected(malformed, OROPLAY_SEAMLESS_ERROR_CODES.INVALID_TRANSACTION);

  const sanitized = sanitizeOroplayPayload({
    authorization: GOOD_AUTH_HEADER,
    nested: {
      [CLIENT_SECRET_KEY]: "must-not-leak",
      token: "must-not-leak",
      password: "must-not-leak",
      DATABASE_URL: "postgres://must-not-leak",
    },
  });
  assertNoSecretLeak("sanitized payload", sanitized);
  assertNoSecretLeak("all responses", [
    authRejected,
    balance,
    unknownUser,
    bet,
    duplicateBet,
    win,
    duplicateWin,
    insufficient,
    finishedRoundWin,
    finishedRoundReject,
    malformed,
  ]);
  assertNoSecretLeak("sanitized logs", harness.getSanitizedLogs());

  console.log("ORO-1 OroPlay seamless contract smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-1 OroPlay seamless contract smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
