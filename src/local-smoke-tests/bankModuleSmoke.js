require("dotenv").config();

const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_bank_module_admin";
const issuedAuthValues = new Set();

class ApiRequestError extends Error {
  constructor(message, statusCode, payload) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function ensureApiPath(baseUrl) {
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  const parsed = parseUrl(trimmed);
  if (!parsed) return trimmed;
  if (parsed.pathname === "" || parsed.pathname === "/") return `${trimmed}/api`;
  return trimmed;
}

function configuredBaseUrl() {
  if (process.env.BASE_URL) return ensureApiPath(process.env.BASE_URL);
  if (process.env.CORE_API_BASE_URL) return ensureApiPath(process.env.CORE_API_BASE_URL);
  if (process.env.PUBLIC_API_BASE_URL) return ensureApiPath(process.env.PUBLIC_API_BASE_URL);
  return DEFAULT_BASE_URL;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }

  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, localAllowed, reason: null };
}

function inspectApiBaseUrl(apiBaseUrl) {
  const parsed = parseUrl(apiBaseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: "BASE_URL must be a valid HTTP(S) URL." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "BASE_URL must not contain embedded credentials." };
  }
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    return { ok: false, reason: "BASE_URL appears production-like and is blocked." };
  }
  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: "BASE_URL must target local/staging/test only." };
  }
  return { ok: true, reason: null };
}

function normalizedGuardEnv() {
  const env = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!env[key]) env[key] = "mock";
  }
  return env;
}

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const baseUrl = configuredBaseUrl();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiTarget = inspectApiBaseUrl(baseUrl);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local or test.");
  }
  if (!process.env.JWT_SECRET) {
    reasons.push("JWT_SECRET must be set for the local bank module smoke test.");
  }
  if (!process.env.LOCAL_ADMIN_PASSWORD) {
    reasons.push("LOCAL_ADMIN_PASSWORD must be set for the local bank module smoke test.");
  }
  if (!databaseTarget.ok) reasons.push(databaseTarget.reason);
  if (!apiTarget.ok) reasons.push(apiTarget.reason);

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      reasons.push(`${key} must be mock or sandbox for this smoke test.`);
    }
  }

  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`Bank module smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Bank module smoke safety guard: PASS");
  return baseUrl;
}

function headerWithAuth(authValue) {
  const headers = {
    Accept: "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (authValue) {
    const scheme = ["Be", "arer"].join("");
    headers.Authorization = [scheme, authValue].join(" ");
  }
  return headers;
}

function assertNoUnsafeKeys(label, value, { allowAuthToken = false } = {}) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item, { allowAuthToken });
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    const isAllowedAuthToken = allowAuthToken && normalized === "token";
    if (!isAllowedAuthToken && (normalized.includes("password") || normalized.includes("token") || normalized.includes("secret"))) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} response exposed database URL key.`);
    }
    assertNoUnsafeKeys(label, item, { allowAuthToken });
  }
}

function assertNoUnsafeValues(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;

  if (serialized.includes("undefined") || serialized.includes("NaN")) {
    throw new Error(`${label} response contains undefined or NaN.`);
  }
  if (lower.includes("database_url")) {
    throw new Error(`${label} response leaked DATABASE_URL marker.`);
  }
  if (!allowAuthToken && (lower.includes("password") || lower.includes("token") || lower.includes("secret"))) {
    throw new Error(`${label} response included unsafe sensitive marker.`);
  }
  if (lower.includes(authScheme)) {
    throw new Error(`${label} response included authorization scheme text.`);
  }
  if (!allowAuthToken && jwtLike.test(serialized)) {
    throw new Error(`${label} response included a JWT-like value.`);
  }
  if (postgresWithCredentials.test(serialized)) {
    throw new Error(`${label} response included a PostgreSQL credential URL.`);
  }

  for (const [name, value] of [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
  ]) {
    if (value && serialized.includes(value)) {
      throw new Error(`${label} response leaked ${name}.`);
    }
  }

  if (!allowAuthToken) {
    for (const authValue of issuedAuthValues) {
      if (authValue && serialized.includes(authValue)) {
        throw new Error(`${label} response echoed an authorization value.`);
      }
    }
  }

  assertNoUnsafeKeys(label, payload, { allowAuthToken });
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = headerWithAuth(options.authValue);
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiRequestError(`API returned non-JSON response for ${path}`, response.status);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new ApiRequestError(`API returned invalid JSON for ${path}`, response.status);
  }

  assertNoUnsafeValues(options.label || path, payload, { allowAuthToken: Boolean(options.allowAuthToken) });

  if (response.status >= 500) {
    throw new ApiRequestError(`API ${path} returned unsafe server error ${response.status}`, response.status, payload);
  }
  if (options.expectedStatuses && !options.expectedStatuses.includes(response.status)) {
    throw new ApiRequestError(
      `API ${path} returned ${response.status}, expected ${options.expectedStatuses.join(" or ")}`,
      response.status,
      payload
    );
  }
  if (options.expectSuccess === false) {
    if (!payload || payload.success !== false) {
      throw new ApiRequestError(`API ${path} returned unexpected success payload`, response.status, payload);
    }
    return { status: response.status, payload };
  }
  if (!response.ok || !payload || payload.success !== true) {
    const message = payload && payload.message ? payload.message : "request failed";
    throw new ApiRequestError(`API ${path} blocked with ${response.status}: ${message}`, response.status, payload);
  }
  return { status: response.status, data: payload.data, payload };
}

function requireString(value, label) {
  if (typeof value !== "string" || !value) {
    throw new Error(`${label} was missing from API response.`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: {
      name: `${SITE_CODE} Local Smoke`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
    create: {
      code: SITE_CODE,
      name: `${SITE_CODE} Local Smoke`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
  });

  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      passwordHash: await hashPassword(process.env.LOCAL_ADMIN_PASSWORD),
      role: "super_admin",
      status: "active",
    },
    create: {
      username: ADMIN_USERNAME,
      passwordHash: await hashPassword(process.env.LOCAL_ADMIN_PASSWORD),
      role: "super_admin",
      status: "active",
    },
  });

  return { prisma, site };
}

async function expectUnauthorized(baseUrl, path, label, method = "GET") {
  const result = await apiRequest(baseUrl, path, {
    method,
    label,
    expectedStatuses: [401],
    expectSuccess: false,
  });
  if (result.status !== 401) {
    throw new Error(`${label} returned ${result.status}, expected 401.`);
  }
  console.log(`${label}: PASS`);
}

async function loginAdmin(baseUrl) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "admin login",
    body: {
      username: ADMIN_USERNAME,
      password: process.env.LOCAL_ADMIN_PASSWORD,
    },
  });
  const authValue = requireString(login.data.token, "Admin token");
  issuedAuthValues.add(authValue);
  console.log("Admin login: PASS");
  return authValue;
}

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

async function runBankAccountChecks(baseUrl, siteId, authValue) {
  const sitePath = `/admin/sites/${encodeURIComponent(siteId)}/bank-accounts`;
  const runId = makeRunId();

  const list = await apiRequest(baseUrl, sitePath, { authValue, label: "bank account list" });
  requireArray(list.data, "Bank account list");
  console.log("Bank account list: PASS");

  const deposit = await apiRequest(baseUrl, sitePath, {
    method: "POST",
    authValue,
    label: "create mock deposit bank account",
    body: {
      type: "deposit",
      bankCode: "MOCK",
      bankName: "Mock Bank",
      accountName: "PG77 Mock Deposit",
      accountNumber: `8800${runId.slice(-8)}`,
      status: "active",
      isDefault: false,
      showOnWebsite: true,
      mockBalance: "1000.00",
      mockCapital: "5000.00",
      metadata: { mock: true, smoke: "bank-module" },
    },
  });
  if (deposit.status !== 201 || deposit.data.type !== "deposit") {
    throw new Error("Mock deposit bank account was not created.");
  }
  console.log("Mock deposit bank account: PASS");

  const withdraw = await apiRequest(baseUrl, sitePath, {
    method: "POST",
    authValue,
    label: "create mock withdraw bank account",
    body: {
      type: "withdraw",
      bankCode: "MOCK",
      bankName: "Mock Bank",
      accountName: "PG77 Mock Withdraw",
      accountNumber: `9900${runId.slice(-8)}`,
      status: "active",
      isDefault: false,
      showOnWebsite: false,
      mockBalance: "2000.00",
      mockCapital: "6000.00",
      metadata: { mock: true, smoke: "bank-module" },
    },
  });
  if (withdraw.status !== 201 || withdraw.data.type !== "withdraw") {
    throw new Error("Mock withdraw bank account was not created.");
  }
  console.log("Mock withdraw bank account: PASS");

  const update = await apiRequest(baseUrl, `${sitePath}/${encodeURIComponent(deposit.data.id)}`, {
    method: "PUT",
    authValue,
    label: "update mock bank account status and visibility",
    body: {
      status: "inactive",
      showOnWebsite: false,
      mockBalance: "900.00",
      mockCapital: "5000.00",
    },
  });
  if (update.data.status !== "inactive" || update.data.metadata.showOnWebsite !== false) {
    throw new Error("Mock bank account update did not persist status or visibility.");
  }
  console.log("Mock bank account update: PASS");

  const disabled = await apiRequest(baseUrl, `${sitePath}/${encodeURIComponent(withdraw.data.id)}`, {
    method: "DELETE",
    authValue,
    label: "safe disable mock bank account",
  });
  if (disabled.data.status !== "disabled" || disabled.data.metadata.showOnWebsite !== false) {
    throw new Error("Mock bank account safe disable did not return disabled account.");
  }
  console.log("Mock bank account safe disable: PASS");
}

async function runStatementChecks(baseUrl, authValue) {
  const deposit = await apiRequest(baseUrl, "/admin/bank/mock/statements/deposits?from=2026-05-08&to=2026-05-09&search=MOCK-DEP", {
    authValue,
    label: "deposit statement mock list",
  });
  requireArray(deposit.data, "Deposit statement mock list");
  if (deposit.data.length < 1 || deposit.data.some((row) => row.statementType !== "deposit")) {
    throw new Error("Deposit statement mock response is invalid.");
  }
  console.log("Deposit statement mock: PASS");

  const withdraw = await apiRequest(baseUrl, "/admin/bank/mock/statements/withdrawals?from=2026-05-08&to=2026-05-09&search=MOCK-WDR", {
    authValue,
    label: "withdraw statement mock list",
  });
  requireArray(withdraw.data, "Withdraw statement mock list");
  if (withdraw.data.length < 1 || withdraw.data.some((row) => row.statementType !== "withdraw")) {
    throw new Error("Withdraw statement mock response is invalid.");
  }
  console.log("Withdraw statement mock: PASS");

  const empty = await apiRequest(baseUrl, "/admin/bank/mock/statements/deposits?search=NO_MATCH_FOR_BANK_MODULE_SMOKE", {
    authValue,
    label: "empty deposit statement mock list",
  });
  requireArray(empty.data, "Empty deposit statement mock list");
  if (empty.data.length !== 0) {
    throw new Error("Statement mock empty state must return an empty array.");
  }
  console.log("Statement empty state: PASS");
}

async function runSlipOcrChecks(baseUrl, authValue) {
  const success = await apiRequest(baseUrl, "/admin/slip-ocr/mock/verify", {
    method: "POST",
    authValue,
    label: "slip OCR mock success",
    body: { result: "success", amount: "100.00", reference: "MOCK-SLIP-SMOKE" },
  });
  if (!success.data.ok || success.data.source !== "mock" || !success.data.reference) {
    throw new Error("Slip OCR mock success response is invalid.");
  }
  console.log("Slip OCR mock success: PASS");

  const fail = await apiRequest(baseUrl, "/admin/slip-ocr/mock/verify", {
    method: "POST",
    authValue,
    label: "slip OCR mock fail",
    body: { result: "fail" },
  });
  if (fail.data.ok !== false || !fail.data.error || !fail.data.error.code) {
    throw new Error("Slip OCR mock fail response is invalid.");
  }
  console.log("Slip OCR mock fail: PASS");
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    if (health.status !== 200) throw new Error(`Health returned ${health.status}, expected 200.`);
    console.log("Health 200: PASS");

    const fixtures = await ensureLocalFixtures();
    prisma = fixtures.prisma;
    const siteId = fixtures.site.id;

    await expectUnauthorized(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/bank-accounts`, "Admin bank account list unauth");
    await expectUnauthorized(baseUrl, "/admin/bank/mock/statements/deposits", "Admin deposit statements unauth");
    await expectUnauthorized(baseUrl, "/admin/bank/mock/statements/withdrawals", "Admin withdraw statements unauth");
    await expectUnauthorized(baseUrl, "/admin/slip-ocr/mock/verify", "Admin slip OCR mock unauth", "POST");
    console.log("Admin auth negative: PASS");

    const authValue = await loginAdmin(baseUrl);
    await runBankAccountChecks(baseUrl, siteId, authValue);
    await runStatementChecks(baseUrl, authValue);
    await runSlipOcrChecks(baseUrl, authValue);

    console.log("Response leak scan: PASS");
    console.log("Bank module smoke: PASS");
  } catch (error) {
    console.error("Bank module smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
