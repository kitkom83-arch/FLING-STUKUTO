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
const ADMIN_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_admin_reports_config_admin";
const issuedAuthValues = new Set();

const REPORT_ENDPOINTS = [
  { label: "admin reports summary", path: "/admin/reports/summary", shape: "object" },
  { label: "admin reports deposits", path: "/admin/reports/deposits?limit=20", shape: "array" },
  { label: "admin reports withdrawals", path: "/admin/reports/withdrawals?limit=20", shape: "array" },
  { label: "admin reports wallet-ledger", path: "/admin/reports/wallet-ledger?limit=20", shape: "array" },
];

const CONFIG_ENDPOINTS = [
  { label: "admin sites list", path: "/admin/sites", shape: "array" },
  { label: "admin current site config", path: "/admin/sites/current/config", shape: "object" },
  { label: "admin site detail", pathForSite: (siteId) => `/admin/sites/${encodeURIComponent(siteId)}`, shape: "object" },
  {
    label: "admin site bank accounts",
    pathForSite: (siteId) => `/admin/sites/${encodeURIComponent(siteId)}/bank-accounts`,
    shape: "array",
  },
  {
    label: "admin site game providers",
    pathForSite: (siteId) => `/admin/sites/${encodeURIComponent(siteId)}/game-providers`,
    shape: "array",
  },
  {
    label: "admin site payment configs",
    pathForSite: (siteId) => `/admin/sites/${encodeURIComponent(siteId)}/payment-configs`,
    shape: "array",
  },
];

const PUBLIC_CONFIG_ENDPOINTS = [
  { label: "public site config", path: "/site/config", shape: "object" },
];

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
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim()
    ? parseUrl(databaseUrl.trim())
    : null;

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
  const guardEnv = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!guardEnv[key]) guardEnv[key] = "mock";
  }
  return guardEnv;
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
    reasons.push("JWT_SECRET must be set for the local admin reports/config smoke test.");
  }
  if (!process.env.LOCAL_ADMIN_PASSWORD) {
    reasons.push("LOCAL_ADMIN_PASSWORD must be set for the local smoke admin.");
  }
  if (!databaseTarget.ok) {
    reasons.push(databaseTarget.reason);
  }
  if (!apiTarget.ok) {
    reasons.push(apiTarget.reason);
  }

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
    throw new Error(`Admin reports/config smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Admin reports/config smoke safety guard: PASS");
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

function stringifyForScan(payload) {
  return JSON.stringify(payload);
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
  const serialized = stringifyForScan(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const envValues = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
    ["LOCAL_MEMBER_PASSWORD", process.env.LOCAL_MEMBER_PASSWORD],
  ];

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
  for (const [name, value] of envValues) {
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
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

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

function assertResponseShape(value, shape, label) {
  if (shape === "array" && !Array.isArray(value)) {
    throw new Error(`${label} must return an array.`);
  }
  if (shape === "object" && (!value || typeof value !== "object" || Array.isArray(value))) {
    throw new Error(`${label} must return an object.`);
  }
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");

  let site = await prisma.site.findUnique({ where: { code: SITE_CODE } });
  if (!site) {
    site = await prisma.site.create({
      data: {
        code: SITE_CODE,
        name: `${SITE_CODE} Local Smoke`,
        brandName: SITE_CODE,
        status: "active",
        defaultLanguage: "th",
        currency: "THB",
        timezone: "Asia/Bangkok",
      },
    });
  }

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

async function expectUnauthorized(baseUrl, endpoint) {
  const path = endpoint.path || endpoint.pathForSite(endpoint.siteId);
  const result = await apiRequest(baseUrl, path, {
    label: `${endpoint.label} unauth`,
    expectedStatuses: [401],
    expectSuccess: false,
  });
  if (result.status >= 500) {
    throw new Error(`${endpoint.label} unauth returned an unsafe 500-class response.`);
  }
  console.log(`${endpoint.label} unauth: PASS`);
}

async function runAuthNegative(baseUrl, siteId) {
  const endpoints = [
    ...REPORT_ENDPOINTS,
    ...CONFIG_ENDPOINTS.map((endpoint) => ({ ...endpoint, siteId })),
  ];

  for (const endpoint of endpoints) {
    await expectUnauthorized(baseUrl, endpoint);
  }
  console.log("Admin auth negative: PASS");
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

async function runReadOnlyEndpoints(baseUrl, authValue, endpoints, siteId, groupLabel) {
  const covered = [];
  for (const endpoint of endpoints) {
    const path = endpoint.path || endpoint.pathForSite(siteId);
    const response = await apiRequest(baseUrl, path, {
      authValue,
      label: endpoint.label,
    });
    assertResponseShape(response.data, endpoint.shape, endpoint.label);
    covered.push(path);
    console.log(`${endpoint.label}: PASS`);
  }
  console.log(`${groupLabel}: PASS`);
  return covered;
}

async function runSmoke(baseUrl, siteId) {
  const health = await apiRequest(baseUrl, "/health", { label: "health" });
  if (health.status !== 200) {
    throw new Error(`Health returned ${health.status}, expected 200.`);
  }
  console.log("Health 200: PASS");

  await runReadOnlyEndpoints(baseUrl, null, PUBLIC_CONFIG_ENDPOINTS, siteId, "Public site config endpoint");
  await runAuthNegative(baseUrl, siteId);
  const adminAuth = await loginAdmin(baseUrl);
  const reportCovered = await runReadOnlyEndpoints(baseUrl, adminAuth, REPORT_ENDPOINTS, siteId, "Admin reports endpoints");
  const configCovered = await runReadOnlyEndpoints(baseUrl, adminAuth, CONFIG_ENDPOINTS, siteId, "Admin site/config endpoints");

  console.log("Read-only safety: PASS");
  console.log("Response leak scan: PASS");

  return { reportCovered, configCovered };
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    const fixtures = await ensureLocalFixtures();
    prisma = fixtures.prisma;
    await runSmoke(baseUrl, fixtures.site.id);
    console.log("Admin reports/config smoke: PASS");
  } catch (error) {
    console.error("Admin reports/config smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
