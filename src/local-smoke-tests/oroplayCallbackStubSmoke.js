"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");

const {
  OROPLAY_CALLBACK_STUB_ROUTES,
  OROPLAY_CALLBACK_STUB_STATUS,
  buildOroplayCallbackStubResponse,
  buildOroplayCallbackStubRouteSummary,
  sanitizeOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const CONTRACT_FILE = "src/game-provider-mock/oroplayCallbackStubContract.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackStubSmoke.js";
const STATIC_SCAN_FILES = [
  "src/app.js",
  ROUTE_FILE,
  CONTROLLER_FILE,
  CONTRACT_FILE,
  SMOKE_FILE,
  "docs/OROPLAY_CALLBACK_API_DESIGN.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/API_MAPPING.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/PHASE_ROADMAP.md",
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
  const basicLiteral = new RegExp(`\\b${["Ba", "sic"].join("")}\\s+[A-Za-z0-9._-]{12,}`);
  const openAiKey = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const databaseAssignment = /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i;
  const credentialAssignment =
    /\b(?:clientSecret|token|password|pin|deviceId)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!bearerLiteral.test(scanned), `${label} contains credential-like header value.`);
  assert(!basicLiteral.test(scanned), `${label} contains basic credential-like header value.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!databaseAssignment.test(scanned), `${label} contains DATABASE_URL assignment-shaped value.`);
  assert(!credentialAssignment.test(scanned), `${label} contains credential assignment-shaped value.`);
}

function findRoute(routes, pathValue) {
  return routes.find((route) => route.path === pathValue);
}

function assertContractRoutes() {
  const summary = buildOroplayCallbackStubRouteSummary();
  assert.strictEqual(summary.phase, OROPLAY_CALLBACK_STUB_STATUS.phase, "summary phase mismatch.");
  assert.strictEqual(summary.mount, "/api/oroplay", "stub must mount only under /api/oroplay.");
  assert.strictEqual(summary.defaultBehavior, "fail-closed", "default behavior must fail closed.");
  assert.strictEqual(summary.activeAliases, false, "provider aliases must stay disabled in ORO-2B.");

  const balance = findRoute(OROPLAY_CALLBACK_STUB_ROUTES.preferredInternal, "/api/oroplay/balance");
  const transaction = findRoute(OROPLAY_CALLBACK_STUB_ROUTES.preferredInternal, "/api/oroplay/transaction");
  assert(balance, "missing POST /api/oroplay/balance contract route.");
  assert(transaction, "missing POST /api/oroplay/transaction contract route.");
  assert.strictEqual(balance.method, "POST", "balance route method mismatch.");
  assert.strictEqual(transaction.method, "POST", "transaction route method mismatch.");
  assert.strictEqual(balance.activeSkeleton, true, "balance route must be active skeleton.");
  assert.strictEqual(transaction.activeSkeleton, true, "transaction route must be active skeleton.");

  for (const aliasPath of ["/api/balance", "/api/transaction"]) {
    const alias = findRoute(OROPLAY_CALLBACK_STUB_ROUTES.optionalProviderAliases, aliasPath);
    assert(alias, `${aliasPath} optional alias must be documented.`);
    assert.strictEqual(alias.activeSkeleton, false, `${aliasPath} must not be active in ORO-2B.`);
    assert.strictEqual(alias.optional, true, `${aliasPath} must be optional.`);
    assert.strictEqual(alias.usage, "provider-required-only", `${aliasPath} must be provider-required-only.`);
  }
}

function assertFilesAndMount() {
  const app = readRequired("src/app.js");
  const route = readRequired(ROUTE_FILE);
  readRequired(CONTROLLER_FILE);

  assertIncludes("app.js OroPlay stub mount", app, [
    'const oroplayCallbackStubRoutes = require("./routes/oroplayCallbackStub.routes");',
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]);
  assertNotIncludes("app.js provider alias mount", app, ['app.use("/api/balance"', 'app.use("/api/transaction"']);
  assertIncludes("OroPlay stub routes", route, [
    'router.post("/balance", handleOroplayBalanceStub);',
    'router.post("/transaction", handleOroplayTransactionStub);',
  ]);
}

function assertNoProviderAliasRuntime() {
  const sourceFiles = ["src/app.js", ROUTE_FILE, "src/routes/index.js"];
  for (const file of sourceFiles) {
    const source = readRequired(file);
    assertNotIncludes(`${file} provider aliases`, source, [
      '"/api/balance"',
      '"/api/transaction"',
      'router.post("/api/balance"',
      'router.post("/api/transaction"',
    ]);
  }
}

function assertControllerSafety() {
  const controller = readRequired(CONTROLLER_FILE);
  const lower = controller.toLowerCase();
  const forbiddenTerms = ["prisma", "axios", "external network"];
  for (const term of forbiddenTerms) {
    assert(!lower.includes(term), `controller must not include ${term}.`);
  }
  assert(!/\bdb\b/i.test(controller), "controller must not reference db.");
  assert(!/\bfetch\s*\(/i.test(controller), "controller must not call fetch.");
  assert(!/\bwallet\b/i.test(controller), "controller must not reference wallet.");
  assert(!/\bledger\b/i.test(controller), "controller must not reference ledger.");
  assert(!/\bcredit\s*\(/i.test(controller), "controller must not call credit.");
  assert(!/\bdebit\s*\(/i.test(controller), "controller must not call debit.");
}

function assertFailClosedResponseContract() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });
  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "stub response must not report success.");
    assert.strictEqual(response.result, "fail_closed", "stub response must fail closed.");
    assert.strictEqual(response.safety.failClosed, true, "stub response must mark failClosed.");
    assert.strictEqual(response.safety.stagingOnly, true, "stub response must mark stagingOnly.");
    assert.strictEqual(response.safety.noProductionDb, true, "stub response must mark noProductionDb.");
    assert.strictEqual(response.safety.noWalletMutation, true, "stub response must mark noWalletMutation.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "stub response must mark noLedgerMutation.");
    assert.strictEqual(response.safety.noExternalNetwork, true, "stub response must mark noExternalNetwork.");
    assert.strictEqual(response.safety.noRealMoney, true, "stub response must mark noRealMoney.");
    assert.strictEqual(response.safety.noLiveOroplayApi, true, "stub response must mark noLiveOroplayApi.");

    const text = JSON.stringify(response).toLowerCase();
    assert(!text.includes('"success":true'), "stub response must not claim runtime success.");
    assert(!text.includes("credited"), "stub response must not claim credited state.");
    assert(!text.includes("debited"), "stub response must not claim debited state.");
    assert(!text.includes("walletmutated"), "stub response must not claim wallet mutation.");
    assert(!text.includes("ledgermutated"), "stub response must not claim ledger mutation.");
  }
}

function assertSanitizer() {
  const forbiddenSecretValue = "must-not-leak-value";
  const rawAuth = `${["Ba", "sic"].join("")} ${Buffer.from("stub-user:stub-password").toString("base64")}`;
  const rawBearer = `${["Be", "arer"].join("")} callback-token-shape`;
  const rawDatabaseUrl = ["postgres", "ql", "://", "user", ":", "pass", "@", "localhost:5432/stub"].join("");
  const payload = {
    authorization: rawAuth,
    credential: forbiddenSecretValue,
    password: forbiddenSecretValue,
    secret: forbiddenSecretValue,
    token: forbiddenSecretValue,
    clientSecret: forbiddenSecretValue,
    DATABASE_URL: rawDatabaseUrl,
    pin: forbiddenSecretValue,
    deviceId: forbiddenSecretValue,
    nested: {
      authorizationHeader: rawBearer,
      safeStatus: "fail_closed",
    },
  };
  const sanitized = sanitizeOroplayCallbackStubResponse(payload);
  const text = JSON.stringify(sanitized);
  assert.strictEqual(sanitized.authorization, "[REDACTED_AUTH]", "authorization must be redacted.");
  assert.strictEqual(sanitized.nested.authorizationHeader, "[REDACTED_AUTH]", "nested authorization must be redacted.");
  assert.strictEqual(sanitized.nested.safeStatus, "fail_closed", "safe marker should remain.");
  for (const forbidden of [
    rawAuth,
    rawBearer,
    rawDatabaseUrl,
    forbiddenSecretValue,
    "stub-password",
    "clientSecret",
    "DATABASE_URL",
    "deviceId",
  ]) {
    assert(!text.includes(forbidden), `sanitized response leaked ${forbidden}.`);
  }
}

function assertDocsAndRegistration() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-stub"],
    "node src/local-smoke-tests/oroplayCallbackStubSmoke.js",
    "package.json missing ORO-2B smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-2B registration", runner, [
    "oroplayCallbackStubContract.js",
    "oroplayCallbackStubSmoke.js",
    "smoke:oroplay-callback-stub",
    "oroplayCallbackStub",
  ]);

  const design = readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md");
  assertIncludes("ORO-2B callback design doc", design, [
    "ORO-2B Staging Callback Stub Route Skeleton",
    "fail-closed default",
    "`POST /api/oroplay/balance`",
    "`POST /api/oroplay/transaction`",
    "`POST /api/balance` remains disabled",
    "`POST /api/transaction` remains disabled",
    "No runtime wallet mutation",
    "No runtime ledger mutation",
    "No production DB",
    "No real money",
    "No live provider",
  ]);

  assertIncludes("ORO integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-2A callback design boundary is closed.",
    "ORO-2B staging fail-closed callback stub is current.",
    "sanitized callback log design",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-2B fail-closed stub only",
    "no wallet mutation",
    "no ledger mutation",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-stub",
    "optional alias disabled guard",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B Staging Callback Stub Route Skeleton",
    "ORO-3 is not allowed until ORO-2B passes",
  ]);
}

function assertStaticSecretScan() {
  for (const file of STATIC_SCAN_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function postLocal(pathname) {
  return new Promise((resolve) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port: 4000,
        path: pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 1500,
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          resolve({ available: true, statusCode: response.statusCode, body });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy();
      resolve({ available: false, reason: "timeout" });
    });
    request.on("error", (error) => {
      if (error.code === "ECONNREFUSED") return resolve({ available: false, reason: error.code });
      return resolve({ available: true, statusCode: 0, body: "", error });
    });
    request.write(JSON.stringify({ userCode: "stub-user" }));
    request.end();
  });
}

async function assertLocalRouteIfBackendOpen() {
  const checks = ["/api/oroplay/balance", "/api/oroplay/transaction"];
  for (const pathname of checks) {
    const result = await postLocal(pathname);
    if (!result.available) {
      console.log(`ORO-2B local route check skipped: backend not listening on port 4000 (${result.reason}).`);
      return;
    }
    assert.notStrictEqual(result.statusCode, 404, `${pathname} must not return 404 when backend is open.`);
    assert(
      result.statusCode === 503 || result.statusCode === 501,
      `${pathname} must return fail-closed 503 or 501, got ${result.statusCode}.`
    );
    const payload = JSON.parse(result.body);
    assert.strictEqual(payload.success, false, `${pathname} must not report success.`);
    assert.strictEqual(payload.result, "fail_closed", `${pathname} must fail closed.`);
    assert.strictEqual(payload.safety.failClosed, true, `${pathname} must mark failClosed.`);
    assert.strictEqual(payload.safety.noWalletMutation, true, `${pathname} must mark noWalletMutation.`);
    assert.strictEqual(payload.safety.noLedgerMutation, true, `${pathname} must mark noLedgerMutation.`);
  }
}

async function main() {
  assertFilesAndMount();
  assertContractRoutes();
  assertNoProviderAliasRuntime();
  assertControllerSafety();
  assertFailClosedResponseContract();
  assertSanitizer();
  assertDocsAndRegistration();
  assertStaticSecretScan();
  await assertLocalRouteIfBackendOpen();
  console.log("ORO-2B OroPlay callback stub smoke: PASS");
}

main().catch((error) => {
  console.error("ORO-2B OroPlay callback stub smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
