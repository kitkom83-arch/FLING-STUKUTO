"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_ROUTES,
  OROPLAY_CALLBACK_BOUNDARY_STATUS,
  buildOroplayCallbackRoutePlan,
  validateOroplayCallbackRoutePlan,
  buildOroplayCallbackSafetyMatrix,
  validateOroplayCallbackPayloadShape,
  sanitizeOroplayCallbackForLog,
} = require("../game-provider-mock/oroplayCallbackBoundary");

const ROOT = path.resolve(__dirname, "..", "..");
const CALLBACK_DESIGN_DOC = "docs/OROPLAY_CALLBACK_API_DESIGN.md";
const STATIC_SCAN_FILES = [
  CALLBACK_DESIGN_DOC,
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/OROPLAY_SEAMLESS_WALLET_CONTRACT.md",
  "docs/API_MAPPING.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  "src/game-provider-mock/oroplayCallbackBoundary.js",
  "src/local-smoke-tests/oroplayCallbackBoundarySmoke.js",
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
];

const SENSITIVE_KEYS = {
  password: ["pass", "word"].join(""),
  token: "token",
  clientSecret: ["client", "Secret"].join(""),
  databaseUrl: ["DATABASE", "URL"].join("_"),
  pin: "pin",
  deviceId: ["device", "Id"].join(""),
};

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

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerLiteral = new RegExp(`\\b${["Ba", "sic"].join("")}\\s+[A-Za-z0-9._-]{12,}`);
  const openAiKey = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const databaseAssignment = /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i;
  const credentialAssignment =
    /\b(?:clientSecret|token|password|pin|deviceId)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains credential-like header value.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!databaseAssignment.test(scanned), `${label} contains DATABASE_URL assignment-shaped value.`);
  assert(!credentialAssignment.test(scanned), `${label} contains credential assignment-shaped value.`);
}

function assertRoute(route, method, path) {
  assert(route, `${method} ${path} route must exist.`);
  assert.strictEqual(route.method, method, `${path} must use ${method}.`);
  assert.strictEqual(route.path, path, `${method} ${path} path mismatch.`);
}

function findRoute(routes, path) {
  return routes.find((route) => route.path === path);
}

function assertNoLogLeak(label, sanitized, forbiddenMarkers) {
  const text = JSON.stringify(sanitized);
  for (const marker of forbiddenMarkers) {
    assert(!text.includes(marker), `${label} leaked forbidden marker.`);
  }
}

function assertDocs() {
  const design = readRequired(CALLBACK_DESIGN_DOC);
  assertIncludes("OroPlay callback design doc", design, [
    "ORO-2A status: design/staging-boundary only",
    "`POST /api/oroplay/balance`",
    "`POST /api/oroplay/transaction`",
    "`POST /api/balance`",
    "`POST /api/transaction`",
    "Basic Auth",
    "env-only",
    "userCode",
    "transactionCode",
    "roundId",
    "amount",
    "isFinished",
    "Negative `amount` = bet/debit intent",
    "Positive `amount` = win/credit intent",
    "Zero `amount` = reject",
    "No runtime wallet mutation",
    "No runtime ledger mutation",
    "No production DB",
    "No real money",
    "No live OroPlay API",
    "member mapping",
    "wallet ledger source of truth",
    "callback logs",
    "game transaction storage",
    "idempotency",
    "reconciliation",
  ]);
}

function assertRoutePlan() {
  const plan = buildOroplayCallbackRoutePlan();
  const validation = validateOroplayCallbackRoutePlan(plan);
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
  assert.strictEqual(plan.status, OROPLAY_CALLBACK_BOUNDARY_STATUS.status, "route plan must be staging-boundary only.");
  assert.strictEqual(plan.createsExpressRoute, false, "route plan must not create Express route.");
  assert.strictEqual(plan.authBoundary.type, "Basic Auth", "route plan must use Basic Auth boundary.");
  assert.strictEqual(plan.authBoundary.credentialSource, "env-only", "route plan must use env-only credentials.");
  assert.strictEqual(plan.authBoundary.rawAuthorizationLogging, false, "route plan must not print raw auth.");
  assert.strictEqual(plan.authBoundary.rawAuthorizationStorage, false, "route plan must not store raw auth.");

  assertRoute(findRoute(OROPLAY_CALLBACK_ROUTES.preferredInternal, "/api/oroplay/balance"), "POST", "/api/oroplay/balance");
  assertRoute(
    findRoute(OROPLAY_CALLBACK_ROUTES.preferredInternal, "/api/oroplay/transaction"),
    "POST",
    "/api/oroplay/transaction"
  );

  for (const pathValue of ["/api/balance", "/api/transaction"]) {
    const alias = findRoute(OROPLAY_CALLBACK_ROUTES.optionalProviderAliases, pathValue);
    assertRoute(alias, "POST", pathValue);
    assert.strictEqual(alias.optional, true, `${pathValue} alias must be optional.`);
    assert.strictEqual(alias.usage, "provider-required-only", `${pathValue} alias must be provider-required-only.`);
  }
}

function assertPayloadShape() {
  const balance = validateOroplayCallbackPayloadShape({
    callbackType: "balance",
    userCode: "mock-user-001",
  });
  assert.strictEqual(balance.ok, true, "balance payload with userCode must pass.");
  assert.deepStrictEqual(balance.requiredFields, ["userCode"], "balance payload must require userCode.");

  const missingBalance = validateOroplayCallbackPayloadShape({ callbackType: "balance" });
  assert.strictEqual(missingBalance.ok, false, "balance payload without userCode must fail.");
  assert(missingBalance.missingFields.includes("userCode"), "missing balance payload must report userCode.");

  const transaction = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
    transactionCode: "mock-tx-001",
    amount: -10,
    roundId: "mock-round-001",
    isFinished: true,
  });
  assert.strictEqual(transaction.ok, true, "transaction payload must pass with required fields.");
  assert.deepStrictEqual(
    transaction.requiredFields,
    ["userCode", "transactionCode", "amount"],
    "transaction payload required fields mismatch."
  );
  assert.strictEqual(transaction.optionalGuardFields.roundId.supported, true, "roundId must be supported.");
  assert.strictEqual(transaction.optionalGuardFields.roundId.present, true, "roundId must be detected.");
  assert.strictEqual(transaction.optionalGuardFields.isFinished.supported, true, "isFinished must be supported.");
  assert.strictEqual(transaction.optionalGuardFields.isFinished.present, true, "isFinished must be detected.");

  const missingTransaction = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
  });
  assert.strictEqual(missingTransaction.ok, false, "transaction missing required fields must fail.");
  assert(missingTransaction.missingFields.includes("transactionCode"), "transactionCode must be required.");
  assert(missingTransaction.missingFields.includes("amount"), "amount must be required.");
}

function assertAmountRule() {
  const debit = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
    transactionCode: "mock-tx-debit",
    amount: -1,
  });
  assert.strictEqual(debit.ok, true, "negative amount must be valid intent.");
  assert.strictEqual(debit.amountRule.intent, "bet/debit intent", "negative amount must be bet/debit intent.");

  const credit = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
    transactionCode: "mock-tx-credit",
    amount: 1,
  });
  assert.strictEqual(credit.ok, true, "positive amount must be valid intent.");
  assert.strictEqual(credit.amountRule.intent, "win/credit intent", "positive amount must be win/credit intent.");

  const zero = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
    transactionCode: "mock-tx-zero",
    amount: 0,
  });
  assert.strictEqual(zero.ok, false, "zero amount must be invalid.");
  assert.strictEqual(zero.amountRule.reason, "zero amount", "zero amount reason mismatch.");

  const malformed = validateOroplayCallbackPayloadShape({
    callbackType: "transaction",
    userCode: "mock-user-001",
    transactionCode: "mock-tx-malformed",
    amount: "not-a-number",
  });
  assert.strictEqual(malformed.ok, false, "malformed amount must be invalid.");
  assert.strictEqual(malformed.amountRule.reason, "malformed amount", "malformed amount reason mismatch.");
}

function assertSafetyMatrix() {
  const plan = buildOroplayCallbackRoutePlan();
  const safety = buildOroplayCallbackSafetyMatrix();
  assert.strictEqual(plan.limitations.noRuntimeWalletMutation, true, "route plan must mark no wallet mutation.");
  assert.strictEqual(plan.limitations.noRuntimeLedgerMutation, true, "route plan must mark no ledger mutation.");
  assert.strictEqual(plan.limitations.noProductionDb, true, "route plan must mark no production DB.");
  assert.strictEqual(safety.noRealMoney, true, "safety matrix must mark no real money.");
  assert.strictEqual(safety.noLiveOroplayApi, true, "safety matrix must mark no live OroPlay API.");
  assert.strictEqual(safety.noExternalNetwork, true, "safety matrix must mark no external network.");
  assert.strictEqual(safety.noClientSecret, true, "safety matrix must mark no client secret.");
  assert.strictEqual(safety.noAutoCredit, true, "safety matrix must mark no auto-credit.");
  assert.strictEqual(safety.noPayout, true, "safety matrix must mark no payout.");
}

function assertSanitizedLog() {
  const rawAuth = `Basic ${Buffer.from("mock-user:mock-password").toString("base64")}`;
  const rawCallbackAuth = `${["Ba", "sic"].join("")} mock-callback-value`;
  const rawDatabaseUrl = ["postgres", "ql", "://", "user", ":", "pass", "@", "localhost:5432/db"].join("");
  const forbiddenSecretValue = "must-not-leak-value";
  const payload = {
    authorization: rawAuth,
    body: {
      userCode: "mock-user-001",
      transactionCode: "mock-tx-001",
      amount: 25,
      [SENSITIVE_KEYS.password]: forbiddenSecretValue,
      [SENSITIVE_KEYS.token]: forbiddenSecretValue,
      [SENSITIVE_KEYS.clientSecret]: forbiddenSecretValue,
      [SENSITIVE_KEYS.databaseUrl]: rawDatabaseUrl,
      [SENSITIVE_KEYS.pin]: forbiddenSecretValue,
      [SENSITIVE_KEYS.deviceId]: forbiddenSecretValue,
      nested: {
        authorizationHeader: rawCallbackAuth,
      },
    },
  };
  const sanitized = sanitizeOroplayCallbackForLog(payload);
  assert.strictEqual(sanitized.authorization, "[REDACTED_AUTH]", "authorization must be redacted.");
  assert.strictEqual(sanitized.body.userCode, "mock-user-001", "safe userCode should remain.");
  assert.strictEqual(sanitized.body.nested.authorizationHeader, "[REDACTED_AUTH]", "nested auth must be redacted.");
  assertNoLogLeak("sanitized callback log", sanitized, [
    rawAuth,
    rawCallbackAuth,
    rawDatabaseUrl,
    forbiddenSecretValue,
    "mock-password",
  ]);
  for (const key of Object.values(SENSITIVE_KEYS)) {
    assert(!Object.prototype.hasOwnProperty.call(sanitized.body, key), `${key} must be removed from sanitized body.`);
  }
}

function assertStaticSecretScan() {
  for (const file of STATIC_SCAN_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function assertRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-boundary"],
    "node src/local-smoke-tests/oroplayCallbackBoundarySmoke.js",
    "package.json missing OroPlay callback boundary smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke OroPlay callback registration", runner, [
    "oroplayCallbackBoundary.js",
    "oroplayCallbackBoundarySmoke.js",
    "smoke:oroplay-callback-boundary",
    "oroplayCallbackBoundary",
  ]);
}

function main() {
  assertDocs();
  assertRoutePlan();
  assertPayloadShape();
  assertAmountRule();
  assertSafetyMatrix();
  assertSanitizedLog();
  assertRegistration();
  assertStaticSecretScan();
  console.log("ORO-2A OroPlay callback boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-2A OroPlay callback boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
