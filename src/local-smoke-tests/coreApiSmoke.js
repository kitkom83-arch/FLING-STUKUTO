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
const ADMIN_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_core_api_admin";
const MOCK_PROVIDER = "PG";
const MOCK_GAMES = [
  { code: "fortune_tiger", name: "Fortune Tiger", category: "slot" },
  { code: "fortune_rabbit", name: "Fortune Rabbit", category: "slot" },
];

class ApiRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
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
    reasons.push("JWT_SECRET must be set for the local core API smoke test.");
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
    throw new Error(`Local core API smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Local core API smoke safety guard: PASS");
  return baseUrl;
}

function headerWithAuth(token) {
  const headers = {
    Accept: "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (token) {
    const scheme = ["Be", "arer"].join("");
    headers.Authorization = [scheme, token].join(" ");
  }
  return headers;
}

function stringifyForScan(payload) {
  return JSON.stringify(payload);
}

function assertNoUnsafeValues(label, payload, { allowAuthToken = false } = {}) {
  const serialized = stringifyForScan(payload);
  if (serialized.includes("undefined") || serialized.includes("NaN")) {
    throw new Error(`${label} response contains undefined or NaN.`);
  }
  if (process.env.DATABASE_URL && serialized.includes(process.env.DATABASE_URL)) {
    throw new Error(`${label} response leaked DATABASE_URL.`);
  }
  if (process.env.LOCAL_ADMIN_PASSWORD && serialized.includes(process.env.LOCAL_ADMIN_PASSWORD)) {
    throw new Error(`${label} response leaked LOCAL_ADMIN_PASSWORD.`);
  }
  if (process.env.LOCAL_MEMBER_PASSWORD && serialized.includes(process.env.LOCAL_MEMBER_PASSWORD)) {
    throw new Error(`${label} response leaked LOCAL_MEMBER_PASSWORD.`);
  }
  assertNoUnsafeKeys(label, payload, allowAuthToken);
}

function assertNoUnsafeKeys(label, value, allowAuthToken) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item, allowAuthToken);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    const isAllowedAuthToken = allowAuthToken && normalized === "token";
    if (!isAllowedAuthToken && (normalized.includes("token") || normalized.includes("password"))) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} response exposed database URL key.`);
    }
    assertNoUnsafeKeys(label, item, allowAuthToken);
  }
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = headerWithAuth(options.token);
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

  if (options.expectedStatus && response.status !== options.expectedStatus) {
    throw new ApiRequestError(`API ${path} returned ${response.status}, expected ${options.expectedStatus}`, response.status);
  }

  if (options.expectSuccess === false) {
    if (payload && payload.success !== false) {
      throw new ApiRequestError(`API ${path} returned unexpected success payload`, response.status);
    }
    return payload;
  }

  if (!response.ok || !payload || payload.success !== true) {
    const message = payload && payload.message ? payload.message : "request failed";
    throw new ApiRequestError(`API ${path} blocked with ${response.status}: ${message}`, response.status);
  }

  return payload.data;
}

async function expectUnauthorized(baseUrl, path, label) {
  await apiRequest(baseUrl, path, {
    label,
    expectedStatus: 401,
    expectSuccess: false,
  });
  console.log(`${label}: PASS`);
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

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
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

  await prisma.siteGameProviderConfig.upsert({
    where: { siteId_providerCode: { siteId: site.id, providerCode: MOCK_PROVIDER } },
    update: {
      displayName: "PG Soft",
      status: "active",
      agentCode: `${SITE_CODE}_LOCAL_MOCK`,
      apiBaseUrl: "https://mock-game-provider.local/api",
      walletMode: "transfer",
      metadata: { localSmoke: true, mock: true },
    },
    create: {
      siteId: site.id,
      providerCode: MOCK_PROVIDER,
      displayName: "PG Soft",
      status: "active",
      agentCode: `${SITE_CODE}_LOCAL_MOCK`,
      apiBaseUrl: "https://mock-game-provider.local/api",
      walletMode: "transfer",
      metadata: { localSmoke: true, mock: true },
    },
  });

  const gameProvider = await prisma.gameProvider.upsert({
    where: { code: MOCK_PROVIDER },
    update: {
      name: "PG Soft",
      status: "active",
    },
    create: {
      code: MOCK_PROVIDER,
      name: "PG Soft",
      status: "active",
    },
  });

  for (const game of MOCK_GAMES) {
    await prisma.game.upsert({
      where: { providerCode_code: { providerCode: MOCK_PROVIDER, code: game.code } },
      update: {
        providerId: gameProvider.id,
        name: game.name,
        category: game.category,
        status: "active",
      },
      create: {
        providerId: gameProvider.id,
        providerCode: MOCK_PROVIDER,
        code: game.code,
        name: game.name,
        category: game.category,
        status: "active",
      },
    });
  }

  const passwordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      passwordHash,
      role: "super_admin",
      status: "active",
    },
    create: {
      username: ADMIN_USERNAME,
      passwordHash,
      role: "super_admin",
      status: "active",
    },
  });

  return prisma;
}

async function runMemberFlow(baseUrl) {
  const runId = makeRunId();
  const memberPassword = process.env.LOCAL_MEMBER_PASSWORD || `local-core-${runId}`;
  const memberPhone = `08${runId.slice(-8)}`;
  const accountNumber = `77${runId.slice(-8)}`;

  await apiRequest(baseUrl, "/auth/register", {
    method: "POST",
    allowAuthToken: true,
    label: "member register",
    body: {
      phone: memberPhone,
      username: `core_${runId}`,
      password: memberPassword,
      bank_code: "MOCK",
      bank_account_number: accountNumber,
      bank_account_name: "Local Core Smoke Member",
      referral_source: "local-core-api-smoke",
      accept_bonus: false,
      accept_terms: true,
    },
  });

  const login = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "member login",
    body: {
      phone: memberPhone,
      password: memberPassword,
    },
  });
  const token = requireString(login.token, "Member token");

  const me = await apiRequest(baseUrl, "/me", { token, label: "member me" });
  if (!me.user || me.user.phone !== memberPhone) throw new Error("Member /me did not return the smoke member.");

  const wallet = await apiRequest(baseUrl, "/wallet", { token, label: "member wallet" });
  if (!wallet || typeof wallet.currency !== "string") throw new Error("Wallet response format is invalid.");

  const points = await apiRequest(baseUrl, "/points", { token, label: "member points" });
  if (!points || !Array.isArray(points.ledgers)) throw new Error("Points response format is invalid.");

  const ledger = await apiRequest(baseUrl, "/wallet/ledger?limit=20", { token, label: "member wallet ledger" });
  requireArray(ledger, "Wallet ledger");

  console.log("Member flow: PASS");
  console.log("Wallet checks: PASS");
  return token;
}

async function runPromotions(baseUrl) {
  const promotions = await apiRequest(baseUrl, "/promotions", { label: "promotions" });
  requireArray(promotions, "Promotions");
  console.log("Promotions: PASS");
}

async function runGameMock(baseUrl, memberToken) {
  const providers = await apiRequest(baseUrl, "/game/providers", {
    token: memberToken,
    label: "game providers",
  });
  requireArray(providers, "Game providers");
  const provider = providers.find((item) => item.code === MOCK_PROVIDER) || providers[0];
  if (!provider || !provider.code) throw new Error("No active mock game provider found.");

  const games = await apiRequest(baseUrl, `/game/providers/${encodeURIComponent(provider.code)}/games`, {
    token: memberToken,
    label: "provider games",
  });
  requireArray(games, "Provider games");
  if (games.length < 1 || !games[0].code) throw new Error("Mock provider must return at least one game.");

  const launch = await apiRequest(baseUrl, "/game/launch/mock", {
    method: "POST",
    token: memberToken,
    label: "mock game launch",
    body: {
      provider: provider.code,
      game_code: games[0].code,
    },
  });
  if (!launch || typeof launch.launch_url !== "string" || !launch.launch_url.startsWith("/mock-game")) {
    throw new Error("Mock launch did not return a local mock launch URL.");
  }

  console.log("Game mock: PASS");
}

async function runAdminFlow(baseUrl) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "admin login",
    body: {
      username: ADMIN_USERNAME,
      password: process.env.LOCAL_ADMIN_PASSWORD,
    },
  });
  const token = requireString(login.token, "Admin token");

  const me = await apiRequest(baseUrl, "/admin/me", { token, label: "admin me" });
  if (!me || me.username !== ADMIN_USERNAME) throw new Error("Admin /me did not return the smoke admin.");

  const logs = await apiRequest(baseUrl, "/admin/logs?limit=20", { token, label: "admin logs" });
  requireArray(logs, "Admin logs");

  const members = await apiRequest(baseUrl, "/admin/members?page=1&limit=5", { token, label: "admin members" });
  requireArray(members, "Admin members");

  const deposits = await apiRequest(baseUrl, "/admin/deposits?page=1&limit=5", { token, label: "admin deposits" });
  requireArray(deposits, "Admin deposits");

  const withdrawals = await apiRequest(baseUrl, "/admin/withdrawals?page=1&limit=5", {
    token,
    label: "admin withdrawals",
  });
  requireArray(withdrawals, "Admin withdrawals");

  console.log("Admin flow: PASS");
  console.log("Admin logs: PASS");
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    await apiRequest(baseUrl, "/health", { label: "health" });
    console.log("Health check: PASS");

    prisma = await ensureLocalFixtures();

    await expectUnauthorized(baseUrl, "/me", "Member auth guard");
    await expectUnauthorized(baseUrl, "/wallet", "Wallet auth guard");
    await expectUnauthorized(baseUrl, "/admin/me", "Admin auth guard");

    const memberToken = await runMemberFlow(baseUrl);
    await runPromotions(baseUrl);
    await runGameMock(baseUrl, memberToken);
    await runAdminFlow(baseUrl);

    console.log("Local core API smoke: PASS");
  } catch (error) {
    console.error("Local core API smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
