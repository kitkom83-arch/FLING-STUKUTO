"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const https = require("https");
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
const DEFAULT_STUB_BASE_URL = "http://127.0.0.1:4000/api";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
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

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  return LOOPBACK_HOSTS.has(normalizeHost(hostname));
}

function removeTrailingSlashes(value) {
  return String(value || "").replace(/\/+$/, "");
}

function rootPathFromConfiguredPath(pathname) {
  const cleanPath = removeTrailingSlashes(pathname || "");
  if (!cleanPath || cleanPath === "/") return "";

  const segments = cleanPath.split("/");
  const apiIndex = segments.findIndex((segment) => segment.toLowerCase() === "api");
  if (apiIndex === -1) return cleanPath;

  const rootSegments = segments.slice(0, apiIndex);
  const rootPath = rootSegments.join("/");
  return rootPath === "/" ? "" : rootPath;
}

function normalizeStubBaseUrl() {
  const configured =
    process.env.OROPLAY_CALLBACK_STUB_BASE_URL || process.env.BASE_URL || DEFAULT_STUB_BASE_URL;
  const source = process.env.OROPLAY_CALLBACK_STUB_BASE_URL
    ? "OROPLAY_CALLBACK_STUB_BASE_URL"
    : process.env.BASE_URL
      ? "BASE_URL"
      : "default";
  const parsed = parseUrl(String(configured || "").trim());

  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${source} must be a valid HTTP(S) URL. Value is not printed.`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${source} must not contain embedded credentials. Value is not printed.`);
  }
  if (parsed.search || parsed.hash) {
    throw new Error(`${source} must not include query string or fragment. Value is not printed.`);
  }
  if (!isLoopbackHost(parsed.hostname)) {
    throw new Error(`${source} must target localhost, 127.0.0.1, or ::1 for this local-only smoke.`);
  }

  const rootPath = rootPathFromConfiguredPath(parsed.pathname);
  const rootBaseUrl = `${parsed.origin}${rootPath}`;
  const apiBaseUrl = `${rootBaseUrl}/api`;
  return { source, rootBaseUrl, apiBaseUrl };
}

function buildUrl(baseUrl, pathname) {
  return `${removeTrailingSlashes(baseUrl)}/${String(pathname || "").replace(/^\/+/, "")}`;
}

function parseJsonBody(body) {
  try {
    return JSON.parse(body);
  } catch (_error) {
    return null;
  }
}

function isPg77HealthResponse(result) {
  if (!result || result.statusCode !== 200) return false;
  const payload = parseJsonBody(result.body);
  const data = payload && payload.data;
  return Boolean(
    payload &&
      payload.success === true &&
      data &&
      data.ok === true &&
      data.status === "ok" &&
      typeof data.databaseConnected === "boolean" &&
      data.externalModes &&
      typeof data.externalModes === "object"
  );
}

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const authHeaderLiteral = /\b[A-Z][a-z]{2,12}\s+(?=[A-Za-z0-9._]{20,})[A-Za-z0-9._]*[a-z0-9.][A-Za-z0-9._]*/;
  const basicLiteral = new RegExp(`\\b${["Ba", "sic"].join("")}\\s+[A-Za-z0-9._-]{12,}`);
  const openAiKey = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`);
  const databaseAssignment = /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i;
  const credentialAssignment =
    /\b(?:clientSecret|token|password|pin|deviceId)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!authHeaderLiteral.test(scanned), `${label} contains credential-like header value.`);
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
  const rawAuthHeaderValue = "mock-auth-header-value";
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
      authorizationHeader: rawAuthHeaderValue,
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
    rawAuthHeaderValue,
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
    "OROPLAY_CALLBACK_STUB_BASE_URL",
    "local port conflict / wrong service",
    "/api/health",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B Staging Callback Stub Route Skeleton",
    "ORO-3 is not allowed until ORO-2B passes",
    "ORO-3F current/local smoke normalization",
    "local port 4000 wrong service is classified as local port conflict / wrong service",
  ]);
}

function assertStaticSecretScan() {
  for (const file of STATIC_SCAN_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function requestLocal(urlValue, options = {}) {
  return new Promise((resolve) => {
    const parsed = parseUrl(urlValue);
    if (!parsed) return resolve({ available: false, reason: "invalid_url" });
    const transport = parsed.protocol === "https:" ? https : http;
    const body = options.body ? JSON.stringify(options.body) : null;
    const request = transport.request(
      {
        hostname: normalizeHost(parsed.hostname),
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method || "GET",
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
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
      if (error.code === "ENOTFOUND") return resolve({ available: false, reason: error.code });
      return resolve({ available: true, statusCode: 0, body: "", error });
    });
    if (body) request.write(body);
    request.end();
  });
}

function postLocal(baseUrl, pathname) {
  return requestLocal(buildUrl(baseUrl, pathname), {
    method: "POST",
    body: { userCode: "stub-user" },
  });
}

async function isPg77BackendTarget(config) {
  const apiHealth = await requestLocal(buildUrl(config.apiBaseUrl, "/health"));
  if (!apiHealth.available) {
    console.log(
      `ORO-2B local route check skipped: PG77 backend not listening on ${config.source} target (${apiHealth.reason}).`
    );
    return false;
  }

  if (isPg77HealthResponse(apiHealth)) {
    console.log("ORO-2B local route check target: PG77 /api/health contract PASS.");
    return true;
  }

  if (apiHealth.statusCode === 404) {
    const rootHealth = await requestLocal(buildUrl(config.rootBaseUrl, "/health"));
    if (rootHealth.available) {
      const classification = isPg77HealthResponse(rootHealth)
        ? "PG77 /health responded but /api/health did not; verify BASE_URL points at the API base"
        : "local port conflict / wrong service";
      console.log(
        `ORO-2B local route check skipped: ${classification}; /api/health returned 404 and /health responded.`
      );
      return false;
    }
    console.log("ORO-2B local route check skipped: /api/health returned 404 and /health was unavailable.");
    return false;
  }

  console.log(
    `ORO-2B local route check skipped: /api/health did not match PG77 health contract (status ${apiHealth.statusCode}).`
  );
  return false;
}

async function assertLocalRouteIfBackendOpen() {
  const config = normalizeStubBaseUrl();
  const isPg77Target = await isPg77BackendTarget(config);
  if (!isPg77Target) return;

  const checks = [
    { label: "/api/oroplay/balance", pathname: "/oroplay/balance" },
    { label: "/api/oroplay/transaction", pathname: "/oroplay/transaction" },
  ];
  for (const pathname of checks) {
    const result = await postLocal(config.apiBaseUrl, pathname.pathname);
    if (!result.available) {
      console.log(`ORO-2B local route check skipped: PG77 backend route unavailable (${result.reason}).`);
      return;
    }
    assert.notStrictEqual(result.statusCode, 404, `${pathname.label} must not return 404 when PG77 backend is open.`);
    assert(
      result.statusCode === 503 || result.statusCode === 501,
      `${pathname.label} must return fail-closed 503 or 501, got ${result.statusCode}.`
    );
    assertNoCredentialShape(`${pathname.label} response`, result.body);
    const payload = JSON.parse(result.body);
    assert.strictEqual(payload.success, false, `${pathname.label} must not report success.`);
    assert.strictEqual(payload.result, "fail_closed", `${pathname.label} must fail closed.`);
    assert.strictEqual(payload.safety.failClosed, true, `${pathname.label} must mark failClosed.`);
    assert.strictEqual(payload.safety.noWalletMutation, true, `${pathname.label} must mark noWalletMutation.`);
    assert.strictEqual(payload.safety.noLedgerMutation, true, `${pathname.label} must mark noLedgerMutation.`);
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
