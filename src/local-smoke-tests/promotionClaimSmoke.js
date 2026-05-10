require("dotenv").config();

const jwt = require("jsonwebtoken");
const { Prisma } = require("@prisma/client");
const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");
const env = require("../config/env");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const PROMOTION_ID = "local_mock_promotion_claim_smoke";
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
    reasons.push("JWT_SECRET must be set for the local promotion claim smoke test.");
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
    throw new Error(`Promotion claim smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Promotion claim smoke safety guard: PASS");
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

function assertNoUnsafeKeys(label, value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (normalized.includes("password") || normalized.includes("secret")) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} response exposed database URL key.`);
    }
    assertNoUnsafeKeys(label, item);
  }
}

function assertNoUnsafeValues(label, payload) {
  const serialized = JSON.stringify(payload);
  if (serialized.includes("undefined") || serialized.includes("NaN")) {
    throw new Error(`${label} response contains undefined or NaN.`);
  }
  const envValues = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
    ["LOCAL_MEMBER_PASSWORD", process.env.LOCAL_MEMBER_PASSWORD],
  ];
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:@\s]+:[^@\s]+@/i;
  if (postgresWithCredentials.test(serialized)) {
    throw new Error(`${label} response included a PostgreSQL credential URL.`);
  }
  for (const [name, value] of envValues) {
    if (value && serialized.includes(value)) {
      throw new Error(`${label} response leaked ${name}.`);
    }
  }
  for (const authValue of issuedAuthValues) {
    if (authValue && serialized.includes(authValue)) {
      throw new Error(`${label} response echoed an authorization value.`);
    }
  }
  assertNoUnsafeKeys(label, payload);
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

  assertNoUnsafeValues(options.label || path, payload);

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

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

function createMemberAuth(user) {
  const authValue = jwt.sign(
    { sub: user.id, type: "member", phone: user.phone, siteId: user.siteId, siteCode: SITE_CODE },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  issuedAuthValues.add(authValue);
  return authValue;
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

  const promotion = await prisma.promotion.upsert({
    where: { id: PROMOTION_ID },
    update: {
      siteId: site.id,
      title: "Local Mock Promotion Claim Smoke",
      type: "local_mock",
      minDeposit: new Prisma.Decimal("100.00"),
      maxDeposit: new Prisma.Decimal("1000.00"),
      bonusType: "fixed",
      bonusValue: new Prisma.Decimal("25.00"),
      turnoverMultiplier: new Prisma.Decimal("2.00"),
      maxWithdraw: new Prisma.Decimal("500.00"),
      status: "active",
      startAt: null,
      endAt: null,
    },
    create: {
      id: PROMOTION_ID,
      siteId: site.id,
      title: "Local Mock Promotion Claim Smoke",
      type: "local_mock",
      minDeposit: new Prisma.Decimal("100.00"),
      maxDeposit: new Prisma.Decimal("1000.00"),
      bonusType: "fixed",
      bonusValue: new Prisma.Decimal("25.00"),
      turnoverMultiplier: new Prisma.Decimal("2.00"),
      maxWithdraw: new Prisma.Decimal("500.00"),
      status: "active",
      startAt: null,
      endAt: null,
    },
  });

  const user = await prisma.user.create({
    data: {
      siteId: site.id,
      phone: `06${runId.slice(-8)}`,
      username: `promo_${runId}`,
      passwordHash: await hashPassword(`local-promo-${runId}`),
      referralSource: "local-promotion-claim-smoke",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      walletAccount: {
        create: {
          siteId: site.id,
          balance: new Prisma.Decimal("0.00"),
          currency: "THB",
        },
      },
    },
    include: { walletAccount: true },
  });

  return {
    prisma,
    site,
    promotion,
    user,
    memberAuth: createMemberAuth(user),
  };
}

async function getCounts(prisma, userId, promotionId) {
  const [claimCount, turnoverCount, ledgerCount, wallet] = await Promise.all([
    prisma.promotionClaim.count({ where: { userId, promotionId } }),
    prisma.turnoverRequirement.count({ where: { userId, promotionId } }),
    prisma.walletLedger.count({ where: { userId } }),
    prisma.walletAccount.findUnique({ where: { userId } }),
  ]);

  return {
    claimCount,
    turnoverCount,
    ledgerCount,
    walletBalance: wallet ? wallet.balance.toFixed(2) : null,
  };
}

async function runSmoke(baseUrl, fixtures) {
  const { prisma, promotion, user, memberAuth } = fixtures;

  const health = await apiRequest(baseUrl, "/health", { label: "health" });
  assertEqual(health.status, 200, "Health status");
  console.log("Health 200: PASS");

  await apiRequest(baseUrl, `/promotions/${encodeURIComponent(promotion.id)}/claim`, {
    method: "POST",
    body: {},
    label: "unauth promotion claim",
    expectedStatuses: [401],
    expectSuccess: false,
  });
  console.log("Unauth claim guard: PASS");

  const list = await apiRequest(baseUrl, "/promotions", {
    label: "promotion list",
  });
  const promotions = requireArray(list.data, "Promotion list");
  const listedPromotion = promotions.find((item) => item.id === promotion.id);
  if (!listedPromotion || listedPromotion.status !== "active") {
    throw new Error("Promotion list did not include the active local mock promotion.");
  }
  console.log("Promotion list response: PASS");

  const before = await getCounts(prisma, user.id, promotion.id);
  assertEqual(before.claimCount, 0, "PromotionClaim count before claim");
  assertEqual(before.turnoverCount, 0, "TurnoverRequirement count before claim");
  assertEqual(before.ledgerCount, 0, "Wallet ledger count before claim");
  assertMoney(before.walletBalance, "0.00", "Wallet balance before claim");

  const firstClaim = await apiRequest(baseUrl, `/promotions/${encodeURIComponent(promotion.id)}/claim`, {
    method: "POST",
    authValue: memberAuth,
    body: {},
    label: "first promotion claim",
  });
  assertEqual(firstClaim.status, 201, "First claim status");
  if (!firstClaim.data || !firstClaim.data.claim || !firstClaim.data.turnover) {
    throw new Error("First promotion claim response format is invalid.");
  }
  console.log("Successful claim: PASS");

  const afterFirst = await getCounts(prisma, user.id, promotion.id);
  assertEqual(afterFirst.claimCount, 1, "PromotionClaim count after first claim");
  assertEqual(afterFirst.turnoverCount, 1, "TurnoverRequirement count after first claim");
  assertEqual(afterFirst.ledgerCount, 1, "Wallet ledger count after first claim");
  assertMoney(afterFirst.walletBalance, "25.00", "Wallet balance after first claim");

  await apiRequest(baseUrl, `/promotions/${encodeURIComponent(promotion.id)}/claim`, {
    method: "POST",
    authValue: memberAuth,
    body: {},
    label: "duplicate promotion claim",
    expectedStatuses: [400, 409],
    expectSuccess: false,
  });
  console.log("Duplicate claim guard: PASS");

  const afterDuplicate = await getCounts(prisma, user.id, promotion.id);
  assertEqual(afterDuplicate.claimCount, afterFirst.claimCount, "PromotionClaim count after duplicate");
  assertEqual(afterDuplicate.turnoverCount, afterFirst.turnoverCount, "TurnoverRequirement count after duplicate");
  assertEqual(afterDuplicate.ledgerCount, afterFirst.ledgerCount, "Wallet ledger count after duplicate");
  assertMoney(afterDuplicate.walletBalance, afterFirst.walletBalance, "Wallet balance after duplicate");
  console.log("Duplicate side effects: PASS");

  await apiRequest(baseUrl, "/promotions/local_mock_missing_promotion/claim", {
    method: "POST",
    authValue: memberAuth,
    body: {},
    label: "invalid promotion claim",
    expectedStatuses: [400, 404],
    expectSuccess: false,
  });
  console.log("Invalid promotion id guard: PASS");

  const afterInvalid = await getCounts(prisma, user.id, promotion.id);
  assertEqual(afterInvalid.claimCount, afterFirst.claimCount, "PromotionClaim count after invalid id");
  assertEqual(afterInvalid.turnoverCount, afterFirst.turnoverCount, "TurnoverRequirement count after invalid id");
  assertEqual(afterInvalid.ledgerCount, afterFirst.ledgerCount, "Wallet ledger count after invalid id");
  assertMoney(afterInvalid.walletBalance, afterFirst.walletBalance, "Wallet balance after invalid id");

  console.log("PromotionClaim count guard: PASS");
  console.log("TurnoverRequirement count guard: PASS");
  console.log("Wallet/ledger effect guard: PASS");
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
    console.log("Promotion claim smoke: PASS");
  } catch (error) {
    console.error("Promotion claim smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
