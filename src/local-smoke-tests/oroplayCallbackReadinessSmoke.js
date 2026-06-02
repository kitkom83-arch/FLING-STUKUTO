"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_IDEMPOTENCY_CASES,
  OROPLAY_CALLBACK_LOG_SANITIZATION_RULES,
  OROPLAY_LEDGER_RECONCILIATION_BOUNDARY,
  OROPLAY_MEMBER_MAPPING_CASES,
  buildOroplayCallbackReadinessSummary,
  sanitizeOroplayCallbackLogPreview,
  validateOroplayCallbackReadinessContract,
} = require("../game-provider-mock/oroplayCallbackReadinessContract");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");
const {
  runOroplayCallbackReadinessHarness,
} = require("../game-provider-mock/oroplayCallbackReadinessHarness");

const ROOT = path.resolve(__dirname, "..", "..");
const READINESS_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md";
const CONTRACT_FILE = "src/game-provider-mock/oroplayCallbackReadinessContract.js";
const HARNESS_FILE = "src/game-provider-mock/oroplayCallbackReadinessHarness.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackReadinessSmoke.js";
const NEW_MOCK_FILES = [CONTRACT_FILE, HARNESS_FILE];
const STATIC_SCAN_FILES = [
  READINESS_DOC,
  "docs/OROPLAY_CALLBACK_API_DESIGN.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/API_MAPPING.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/PHASE_ROADMAP.md",
  CONTRACT_FILE,
  HARNESS_FILE,
  SMOKE_FILE,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
];

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

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerLiteral = new RegExp(`\\b${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{12,}`);
  const basicLiteral = new RegExp(`\\b${["Ba", "sic"].join("")}\\s+[A-Za-z0-9+/=._-]{12,}`);
  const openAiKey = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const databaseAssignment = /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i;
  const credentialAssignment =
    /\b(?:clientSecret|token|password|pin|deviceId)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains credential-like bearer value.`);
  assert(!basicLiteral.test(scanned), `${label} contains credential-like basic value.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!databaseAssignment.test(scanned), `${label} contains DATABASE_URL assignment-shaped value.`);
  assert(!credentialAssignment.test(scanned), `${label} contains credential assignment-shaped value.`);
}

function assertNoRuntimeWriteMarkers() {
  const forbiddenPatterns = [
    /\bprisma\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany)\s*\(/i,
    /\bdb\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany|insert)\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
    /\b(?:credit|debit|autoCredit|payout)\s*\(/i,
    /\bfetch\s*\(/i,
    /\baxios\./i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
  ];
  for (const file of NEW_MOCK_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const readinessDoc = readRequired(READINESS_DOC);
  assertIncludes("readiness doc", readinessDoc, [
    "Purpose",
    "Non-goals",
    "Safety Boundary",
    "Member Mapping Contract",
    "Callback Payload Validation Contract",
    "Idempotency Contract",
    "Sanitized Callback Log Contract",
    "Ledger / Reconciliation Boundary",
    "ORO-3 Prerequisites",
    "No live runtime statement",
    "ORO-2C does not query DB",
    "aliases remain disabled",
  ]);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-readiness"],
    "node src/local-smoke-tests/oroplayCallbackReadinessSmoke.js",
    "package.json missing ORO-2C smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-2C registration", runner, [
    "oroplayCallbackReadinessContract.js",
    "oroplayCallbackReadinessHarness.js",
    "oroplayCallbackReadinessSmoke.js",
    "smoke:oroplay-callback-readiness",
    "oroplayCallbackReadiness",
  ]);
}

function assertContract() {
  const validation = validateOroplayCallbackReadinessContract();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const summary = buildOroplayCallbackReadinessSummary();
  assert.strictEqual(summary.phase, "ORO-2C", "summary phase mismatch.");
  assert.strictEqual(summary.noLiveRuntime, true, "summary must mark no live runtime.");
  assert.strictEqual(summary.oro2bFailClosedRemainsDefault, true, "ORO-2B fail-closed must remain default.");

  const memberCaseIds = new Set(OROPLAY_MEMBER_MAPPING_CASES.map((entry) => entry.caseId));
  for (const required of [
    "valid_userCode",
    "unknown_userCode",
    "blocked_member",
    "inactive_member",
    "malformed_userCode",
  ]) {
    assert(memberCaseIds.has(required), `missing member mapping case ${required}.`);
  }

  const idempotencyCaseIds = new Set(OROPLAY_CALLBACK_IDEMPOTENCY_CASES.map((entry) => entry.caseId));
  for (const required of [
    "duplicate_transactionCode",
    "round_session_replay",
    "same_payload_replay",
    "conflicting_replay",
  ]) {
    assert(idempotencyCaseIds.has(required), `missing idempotency case ${required}.`);
  }

  assert.strictEqual(OROPLAY_CALLBACK_LOG_SANITIZATION_RULES.rawAuthorizationLogging, false);
  assert.strictEqual(OROPLAY_CALLBACK_LOG_SANITIZATION_RULES.rawBasicAuthLogging, false);
  assert.strictEqual(OROPLAY_CALLBACK_LOG_SANITIZATION_RULES.rawBodyLoggingWithCredentialLikeField, false);
  assert.strictEqual(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY.runtimeWalletMutation, false);
  assert.strictEqual(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY.runtimeLedgerMutation, false);
  assert.strictEqual(OROPLAY_LEDGER_RECONCILIATION_BOUNDARY.prismaWrite, false);
}

function assertHarness() {
  const results = runOroplayCallbackReadinessHarness();
  const byName = new Map(results.map((entry) => [entry.scenario, entry]));
  for (const required of [
    "valid balance readiness",
    "unknown userCode fail-closed",
    "blocked member fail-closed",
    "malformed balance request",
    "valid transaction readiness",
    "duplicate transactionCode safe result",
    "conflicting duplicate manual_review fail-closed",
    "insufficient balance readiness only",
    "finished round replay blocked",
    "credential-like log redaction",
  ]) {
    assert(byName.has(required), `missing harness scenario ${required}.`);
  }

  assert.strictEqual(byName.get("valid balance readiness").result, "balance_readiness_only");
  assert.strictEqual(byName.get("unknown userCode fail-closed").failClosed, true);
  assert.strictEqual(byName.get("blocked member fail-closed").reason, "blocked_member");
  assert.strictEqual(byName.get("malformed balance request").reason, "malformed_userCode");
  assert.strictEqual(byName.get("valid transaction readiness").result, "new_readiness_recorded_in_memory");
  assert.strictEqual(byName.get("duplicate transactionCode safe result").result, "duplicate_safe");
  assert.strictEqual(byName.get("conflicting duplicate manual_review fail-closed").manualReview, true);
  assert.strictEqual(byName.get("insufficient balance readiness only").result, "insufficient_balance_readiness_only");
  assert.strictEqual(byName.get("finished round replay blocked").result, "replay_blocked");
}

function assertSanitizer() {
  const rawDatabaseUrl = ["postgres", "ql", "://", "user", ":", "pass", "@", "localhost:5432/mock"].join("");
  const forbiddenValue = "must-not-leak-value";
  const sanitized = sanitizeOroplayCallbackLogPreview({
    requestId: "mock-request-001",
    route: "/api/oroplay/transaction",
    body: {
      userCode: "ORO_VALID_001",
      transactionCode: "TX_SAFE_LOG_001",
      amount: 20,
      authorization: `${["Ba", "sic"].join("")} mock-auth-value`,
      password: forbiddenValue,
      secret: forbiddenValue,
      token: forbiddenValue,
      clientSecret: forbiddenValue,
      DATABASE_URL: rawDatabaseUrl,
      pin: forbiddenValue,
      deviceId: forbiddenValue,
    },
  });
  const text = JSON.stringify(sanitized);
  assert.strictEqual(sanitized.bodyLogged, false, "sanitizer must not log body.");
  assert.strictEqual(sanitized.rawBodyDropped, true, "sanitizer must drop raw body.");
  assert.strictEqual(sanitized.userCodeMasked, "OR***01", "userCode should be masked.");
  assert.strictEqual(sanitized.transactionCodeMasked, "TX***01", "transactionCode should be masked.");
  for (const forbidden of [
    rawDatabaseUrl,
    forbiddenValue,
    "authorization",
    "password",
    "secret",
    "token",
    "clientSecret",
    "DATABASE_URL",
    "pin",
    "deviceId",
    "mock-auth-value",
  ]) {
    assert(!text.includes(forbidden), `sanitized log preview leaked ${forbidden}.`);
  }
}

function assertNoProviderAliasRuntime() {
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

function assertOro2bFailClosed() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "transaction" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "balance", stubEnabled: true });
  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B stub must not report runtime success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B stub must remain fail-closed.");
    assert.strictEqual(response.safety.noWalletMutation, true, "ORO-2B stub must mark no wallet mutation.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "ORO-2B stub must mark no ledger mutation.");
  }
}

function assertStaticSecretScan() {
  for (const file of STATIC_SCAN_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function main() {
  readRequired(CONTRACT_FILE);
  readRequired(HARNESS_FILE);
  assertDocsAndRegistration();
  assertContract();
  assertHarness();
  assertSanitizer();
  assertNoProviderAliasRuntime();
  assertOro2bFailClosed();
  assertNoRuntimeWriteMarkers();
  assertStaticSecretScan();
  console.log("ORO-2C OroPlay callback readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-2C OroPlay callback readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
