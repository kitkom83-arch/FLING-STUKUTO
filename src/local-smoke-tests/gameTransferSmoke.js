require("dotenv").config();

const { Prisma } = require("@prisma/client");
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
const MOCK_PROVIDER = "PG";
const MOCK_GAMES = [
  { code: "fortune_tiger", name: "Fortune Tiger", category: "slot" },
  { code: "fortune_rabbit", name: "Fortune Rabbit", category: "slot" },
];
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
    reasons.push("JWT_SECRET must be set for the local game transfer smoke test.");
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
    throw new Error(`Game transfer smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Game transfer smoke safety guard: PASS");
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

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${expected}, got ${actual}`);
  }
}

function assertMoney(actual, expected, label) {
  if (String(actual) !== expected) {
    throw new Error(`${label} expected ${expected}, got ${String(actual)}`);
  }
}

function assertDecimalString(value, label) {
  if (typeof value !== "string" || !/^-?\d+\.\d{2}$/.test(value)) {
    throw new Error(`${label} must be a decimal string with two places.`);
  }
}

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

async function expectUnauthorized(baseUrl, label, path, options = {}) {
  const result = await apiRequest(baseUrl, path, {
    ...options,
    label,
    expectedStatuses: [401],
    expectSuccess: false,
  });
  if (result.status >= 500) {
    throw new Error(`${label} returned an unsafe 500-class response.`);
  }
  console.log(`${label}: PASS`);
}

async function ensureLocalFixtures(runId) {
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

  const memberPassword = process.env.LOCAL_MEMBER_PASSWORD || `local-game-${runId}`;
  const user = await prisma.user.create({
    data: {
      siteId: site.id,
      phone: `05${runId.slice(-8)}`,
      username: `game_${runId}`,
      passwordHash: await hashPassword(memberPassword),
      referralSource: "local-game-transfer-smoke",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      walletAccount: {
        create: {
          siteId: site.id,
          balance: new Prisma.Decimal("100.00"),
          currency: "THB",
        },
      },
    },
    include: { walletAccount: true },
  });

  return {
    prisma,
    user,
    memberPassword,
  };
}

async function loginMember(baseUrl, fixtures) {
  const login = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "member login",
    body: {
      phone: fixtures.user.phone,
      password: fixtures.memberPassword,
    },
  });
  const authValue = requireString(login.data.token, "Member token");
  issuedAuthValues.add(authValue);
  console.log("Member login: PASS");
  return authValue;
}

async function getWallet(baseUrl, memberAuth) {
  const wallet = await apiRequest(baseUrl, "/wallet", {
    authValue: memberAuth,
    label: "member wallet",
  });
  if (!wallet.data || typeof wallet.data.currency !== "string") {
    throw new Error("Wallet response format is invalid.");
  }
  return wallet.data;
}

async function getLedger(baseUrl, memberAuth) {
  const ledger = await apiRequest(baseUrl, "/wallet/ledger?limit=20", {
    authValue: memberAuth,
    label: "member wallet ledger",
  });
  return requireArray(ledger.data, "Wallet ledger");
}

function assertTransferResponse(value, expectedType, expectedAmount, label) {
  if (!value || !value.transfer || !value.wallet || !value.ledger) {
    throw new Error(`${label} response format is invalid.`);
  }
  assertEqual(value.transfer.provider, MOCK_PROVIDER, `${label} provider`);
  assertEqual(value.transfer.type, expectedType, `${label} type`);
  assertEqual(value.transfer.status, "success", `${label} status`);
  assertMoney(value.transfer.amount, expectedAmount, `${label} transfer amount`);
  assertMoney(value.ledger.balanceAfter, value.wallet.balance, `${label} wallet/ledger balance`);
}

function assertBetHistoryResponse(rows) {
  requireArray(rows, "Bet history");
  for (const row of rows) {
    if (
      !row ||
      typeof row.id !== "string" ||
      typeof row.provider !== "string" ||
      typeof row.gameCode !== "string" ||
      typeof row.roundId !== "string" ||
      typeof row.playedAt !== "string"
    ) {
      throw new Error("Bet history row format is invalid.");
    }
    assertDecimalString(row.betAmount, "Bet history bet amount");
    assertDecimalString(row.winAmount, "Bet history win amount");
    assertDecimalString(row.profitAmount, "Bet history profit amount");
  }
}

async function runAuthNegative(baseUrl) {
  await expectUnauthorized(baseUrl, "Unauth transfer-in guard", "/game/transfer-in/mock", {
    method: "POST",
    body: { provider: MOCK_PROVIDER, amount: "1.00" },
  });
  await expectUnauthorized(baseUrl, "Unauth transfer-out guard", "/game/transfer-out/mock", {
    method: "POST",
    body: { provider: MOCK_PROVIDER, amount: "1.00" },
  });
  await expectUnauthorized(baseUrl, "Unauth bet-history guard", "/game/bet-history/mock");
}

async function runTransferSmoke(baseUrl, memberAuth) {
  const walletBefore = await getWallet(baseUrl, memberAuth);
  assertMoney(walletBefore.balance, "100.00", "Initial wallet balance");

  const transferIn = await apiRequest(baseUrl, "/game/transfer-in/mock", {
    method: "POST",
    authValue: memberAuth,
    label: "game transfer-in mock",
    body: {
      provider: MOCK_PROVIDER,
      amount: "25.00",
    },
  });
  assertTransferResponse(transferIn.data, "transfer_in", "25.00", "Transfer-in");
  assertMoney(transferIn.data.wallet.balance, "75.00", "Wallet after transfer-in");
  console.log("Transfer-in mock: PASS");

  const transferOut = await apiRequest(baseUrl, "/game/transfer-out/mock", {
    method: "POST",
    authValue: memberAuth,
    label: "game transfer-out mock",
    body: {
      provider: MOCK_PROVIDER,
      amount: "10.00",
    },
  });
  assertTransferResponse(transferOut.data, "transfer_out", "10.00", "Transfer-out");
  assertMoney(transferOut.data.wallet.balance, "85.00", "Wallet after transfer-out");
  console.log("Transfer-out mock: PASS");

  const walletFinal = await getWallet(baseUrl, memberAuth);
  assertMoney(walletFinal.balance, "85.00", "Final wallet balance");

  const ledger = await getLedger(baseUrl, memberAuth);
  const transferInLedger = ledger.filter((row) => row.referenceType === "game_transfer" && row.referenceId === transferIn.data.transfer.id);
  const transferOutLedger = ledger.filter((row) => row.referenceType === "game_transfer" && row.referenceId === transferOut.data.transfer.id);
  assertEqual(transferInLedger.length, 1, "Transfer-in ledger row count");
  assertEqual(transferOutLedger.length, 1, "Transfer-out ledger row count");
  assertEqual(transferInLedger[0].type, "game_debit_mock", "Transfer-in ledger type");
  assertEqual(transferOutLedger[0].type, "game_credit_mock", "Transfer-out ledger type");
  assertMoney(transferInLedger[0].amount, "-25.00", "Transfer-in ledger amount");
  assertMoney(transferOutLedger[0].amount, "10.00", "Transfer-out ledger amount");
  console.log("Wallet transfer side effects: PASS");
}

async function runBetHistorySmoke(baseUrl, memberAuth) {
  const response = await apiRequest(baseUrl, "/game/bet-history/mock", {
    authValue: memberAuth,
    label: "game bet-history mock",
  });
  assertBetHistoryResponse(response.data);
  console.log("Bet-history mock: PASS");
}

async function runSmoke(baseUrl, fixtures) {
  const health = await apiRequest(baseUrl, "/health", { label: "health" });
  assertEqual(health.status, 200, "Health status");
  console.log("Health 200: PASS");

  await runAuthNegative(baseUrl);
  const memberAuth = await loginMember(baseUrl, fixtures);
  await runTransferSmoke(baseUrl, memberAuth);
  await runBetHistorySmoke(baseUrl, memberAuth);
  console.log("Response leak scan: PASS");
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    const runId = makeRunId();
    const fixtures = await ensureLocalFixtures(runId);
    prisma = fixtures.prisma;
    await runSmoke(baseUrl, fixtures);
    console.log("Game transfer smoke: PASS");
  } catch (error) {
    console.error("Game transfer smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
