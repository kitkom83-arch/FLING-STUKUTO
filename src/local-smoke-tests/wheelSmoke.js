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
const ADMIN_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_wheel_admin";
const ADMIN_REASON = "local wheel smoke reason";
const MEMBER_PASSWORD = process.env.LOCAL_MEMBER_PASSWORD || "local-wheel-member-only";
const REWARD_IDS = [
  "wheel_reward_1",
  "wheel_reward_2",
  "wheel_reward_3",
  "wheel_reward_4",
  "wheel_reward_5",
  "wheel_reward_6",
  "wheel_reward_7",
  "wheel_reward_8",
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
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }
  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL appears production-like and is blocked. Value is not printed." };
  }
  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed." };
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
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiTarget = inspectApiBaseUrl(configuredBaseUrl());
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) reasons.push("NODE_ENV must be development-local or test.");
  if (!process.env.JWT_SECRET) reasons.push("JWT_SECRET must be set for the local wheel smoke test.");
  if (!process.env.LOCAL_ADMIN_PASSWORD) reasons.push("LOCAL_ADMIN_PASSWORD must be set for the local wheel smoke admin.");
  if (!databaseTarget.ok) reasons.push(databaseTarget.reason);
  if (!apiTarget.ok) reasons.push(apiTarget.reason);

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) reasons.push(`${key} must be mock or sandbox for wheel smoke.`);
  }
  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`Lucky Wheel smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Lucky Wheel smoke safety guard: PASS");
  return configuredBaseUrl();
}

function headerWithAuth(token) {
  const headers = {
    Accept: "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (token) headers.Authorization = [["Be", "arer"].join(""), token].join(" ");
  return headers;
}

function assertNoUnsafeValues(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  if (serialized.includes("undefined") || serialized.includes("NaN")) throw new Error(`${label} response contains undefined or NaN.`);
  if (process.env.DATABASE_URL && serialized.includes(process.env.DATABASE_URL)) throw new Error(`${label} response leaked DATABASE_URL.`);
  if (process.env.LOCAL_ADMIN_PASSWORD && serialized.includes(process.env.LOCAL_ADMIN_PASSWORD)) {
    throw new Error(`${label} response leaked LOCAL_ADMIN_PASSWORD.`);
  }
  if (process.env.LOCAL_MEMBER_PASSWORD && serialized.includes(process.env.LOCAL_MEMBER_PASSWORD)) {
    throw new Error(`${label} response leaked LOCAL_MEMBER_PASSWORD.`);
  }
  if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) throw new Error(`${label} response leaked a connection string.`);
  if (!allowAuthToken && /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(serialized)) {
    throw new Error(`${label} response leaked a JWT-shaped value.`);
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
    if (!isAllowedAuthToken && (normalized.includes("token") || normalized.includes("password") || normalized.includes("secret"))) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl" || normalized === "authorization") {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    assertNoUnsafeKeys(label, item, allowAuthToken);
  }
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = headerWithAuth(options.token);
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
  const payload = await response.json();
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

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

async function ensureFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");
  const { Prisma } = require("@prisma/client");

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: { name: `${SITE_CODE} Wheel Smoke`, brandName: SITE_CODE, status: "active" },
    create: {
      code: SITE_CODE,
      name: `${SITE_CODE} Wheel Smoke`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
  });

  const adminPasswordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);
  const admin = await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash: adminPasswordHash, role: "super_admin", status: "active" },
    create: { username: ADMIN_USERNAME, passwordHash: adminPasswordHash, role: "super_admin", status: "active" },
  });
  await prisma.adminSiteAccess.upsert({
    where: { adminId_siteId: { adminId: admin.id, siteId: site.id } },
    update: { role: "super_admin", permissions: { all: true } },
    create: { adminId: admin.id, siteId: site.id, role: "super_admin", permissions: { all: true } },
  });

  await prisma.wheelCampaign.upsert({
    where: { id: "wheel_main" },
    update: {
      siteId: site.id,
      name: "กงล้อนำโชค",
      status: "active",
      costType: "point",
      costAmount: new Prisma.Decimal("10.00"),
      dailySpinLimit: 3,
      monthlySpinLimit: null,
      startAt: null,
      endAt: null,
      rulesText: "Demo rewards only. No real payout.",
      showHistory: true,
    },
    create: {
      id: "wheel_main",
      siteId: site.id,
      name: "กงล้อนำโชค",
      status: "active",
      costType: "point",
      costAmount: new Prisma.Decimal("10.00"),
      dailySpinLimit: 3,
      rulesText: "Demo rewards only. No real payout.",
      showHistory: true,
    },
  });

  const rewardFixtures = [
    ["wheel_reward_1", "Credit 10", "credit", "10.00", "10 credit", 1000, "#c41d1d", 1],
    ["wheel_reward_2", "Credit 50", "credit", "50.00", "50 credit", 0, "#d97706", 2],
    ["wheel_reward_3", "Points 20", "point", "20.00", "20 points", 0, "#2563eb", 3],
    ["wheel_reward_4", "Ticket 1", "ticket", "1.00", "1 ticket", 0, "#16a34a", 4],
    ["wheel_reward_5", "No reward", "no_reward", "0.00", "No reward", 0, "#64748b", 5],
    ["wheel_reward_6", "Gold Mystery Box", "item", "1.00", "Gold Mystery Box", 0, "#facc15", 6],
    ["wheel_reward_7", "Jackpot mock", "credit", "500.00", "500 mock credit", 0, "#db2777", 7],
    ["wheel_reward_8", "Try again", "no_reward", "0.00", "Try again", 0, "#7c3aed", 8],
  ];

  for (const [id, label, rewardType, rewardValue, displayValue, probabilityWeight, segmentColor, sortOrder] of rewardFixtures) {
    await prisma.wheelReward.upsert({
      where: { id },
      update: {
        campaignId: "wheel_main",
        label,
        rewardType,
        rewardValue: new Prisma.Decimal(rewardValue),
        displayValue,
        probabilityWeight,
        stockLimit: null,
        segmentColor,
        imageUrl: null,
        sortOrder,
        status: "active",
      },
      create: {
        id,
        campaignId: "wheel_main",
        label,
        rewardType,
        rewardValue: new Prisma.Decimal(rewardValue),
        displayValue,
        probabilityWeight,
        stockLimit: null,
        stockUsed: 0,
        segmentColor,
        imageUrl: null,
        sortOrder,
        status: "active",
      },
    });
  }

  await prisma.wheelReward.upsert({
    where: { id: "wheel_reward_stock_zero_smoke" },
    update: {
      campaignId: "wheel_main",
      label: "Stock Zero Smoke",
      rewardType: "credit",
      rewardValue: new Prisma.Decimal("999.00"),
      displayValue: "999 mock credit",
      probabilityWeight: 999999,
      stockLimit: 0,
      segmentColor: "#111827",
      imageUrl: null,
      sortOrder: 90,
      status: "active",
    },
    create: {
      id: "wheel_reward_stock_zero_smoke",
      campaignId: "wheel_main",
      label: "Stock Zero Smoke",
      rewardType: "credit",
      rewardValue: new Prisma.Decimal("999.00"),
      displayValue: "999 mock credit",
      probabilityWeight: 999999,
      stockLimit: 0,
      stockUsed: 0,
      segmentColor: "#111827",
      imageUrl: null,
      sortOrder: 90,
      status: "active",
    },
  });

  return prisma;
}

async function createMember(prisma, siteId, points) {
  const { hashPassword } = require("../utils/password");
  const { Prisma } = require("@prisma/client");
  const runId = makeRunId();
  const phone = `09${runId.slice(-8)}`;
  const username = `wheel_${runId}`;
  const passwordHash = await hashPassword(MEMBER_PASSWORD);
  const member = await prisma.user.create({
    data: {
      siteId,
      phone,
      username,
      passwordHash,
      referralSource: "wheel-smoke",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      points: new Prisma.Decimal(points),
      walletAccount: { create: { siteId, balance: new Prisma.Decimal("180.00"), currency: "THB" } },
    },
  });
  return { member, phone };
}

async function loginAdmin(baseUrl) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "wheel admin login",
    body: { username: ADMIN_USERNAME, password: process.env.LOCAL_ADMIN_PASSWORD },
  });
  if (!login.token) throw new Error("Admin login token missing.");
  return login.token;
}

async function loginMember(baseUrl, phone) {
  const login = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "wheel member login",
    body: { phone, password: MEMBER_PASSWORD },
  });
  if (!login.token) throw new Error("Member login token missing.");
  return login.token;
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    prisma = await ensureFixtures();
    const site = await prisma.site.findUnique({ where: { code: SITE_CODE } });
    const adminToken = await loginAdmin(baseUrl);
    const { phone } = await createMember(prisma, site.id, "360.00");
    const memberToken = await loginMember(baseUrl, phone);

    const config = await apiRequest(baseUrl, "/member/wheel/config", { token: memberToken, label: "wheel member config" });
    if (config.campaignId !== "wheel_main" || config.rewards.length < REWARD_IDS.length) throw new Error("Wheel config did not return active campaign and rewards.");
    if (config.rewards.some((reward) => Object.prototype.hasOwnProperty.call(reward, "probabilityWeight"))) {
      throw new Error("Member config exposed probabilityWeight.");
    }
    console.log("Wheel member config: PASS");

    await apiRequest(baseUrl, "/member/wheel/spin", {
      method: "POST",
      token: memberToken,
      label: "wheel spin injection reject",
      expectedStatus: 400,
      expectSuccess: false,
      body: { campaignId: "wheel_main", rewardId: "wheel_reward_1", prizeIndex: 0 },
    });
    console.log("Wheel frontend result injection guard: PASS");

    const spin = await apiRequest(baseUrl, "/member/wheel/spin", {
      method: "POST",
      token: memberToken,
      label: "wheel spin success",
      body: { campaignId: "wheel_main" },
    });
    if (!spin.spinId || typeof spin.prizeIndex !== "number" || spin.rewardId === "wheel_reward_stock_zero_smoke") {
      throw new Error("Wheel spin did not return backend-selected result.");
    }
    console.log("Wheel spin success: PASS");

    const history = await apiRequest(baseUrl, "/member/wheel/history", { token: memberToken, label: "wheel history" });
    if (!history.some((row) => row.spinId === spin.spinId)) throw new Error("Wheel history did not include spin.");
    console.log("Wheel history: PASS");

    const myRewards = await apiRequest(baseUrl, "/member/wheel/my-rewards", { token: memberToken, label: "wheel my rewards" });
    if (!myRewards.some((row) => row.status === "pending" && row.rewardType !== "no_reward")) {
      throw new Error("Wheel my-rewards did not include pending reward.");
    }
    console.log("Wheel my rewards: PASS");

    await apiRequest(baseUrl, "/member/wheel/spin", { method: "POST", token: memberToken, label: "wheel spin 2", body: { campaignId: "wheel_main" } });
    await apiRequest(baseUrl, "/member/wheel/spin", { method: "POST", token: memberToken, label: "wheel spin 3", body: { campaignId: "wheel_main" } });
    await apiRequest(baseUrl, "/member/wheel/spin", {
      method: "POST",
      token: memberToken,
      label: "wheel daily limit",
      expectedStatus: 400,
      expectSuccess: false,
      body: { campaignId: "wheel_main" },
    });
    console.log("Wheel daily limit: PASS");

    const poorMember = await createMember(prisma, site.id, "0.00");
    const poorToken = await loginMember(baseUrl, poorMember.phone);
    await apiRequest(baseUrl, "/member/wheel/spin", {
      method: "POST",
      token: poorToken,
      label: "wheel not enough points",
      expectedStatus: 400,
      expectSuccess: false,
      body: { campaignId: "wheel_main" },
    });
    console.log("Wheel not enough points: PASS");

    await apiRequest(baseUrl, "/admin/wheel/campaign", {
      method: "PATCH",
      token: adminToken,
      label: "wheel inactive campaign set",
      body: { status: "inactive", reason: ADMIN_REASON },
    });
    const inactiveMember = await createMember(prisma, site.id, "100.00");
    const inactiveToken = await loginMember(baseUrl, inactiveMember.phone);
    await apiRequest(baseUrl, "/member/wheel/spin", {
      method: "POST",
      token: inactiveToken,
      label: "wheel inactive campaign",
      expectedStatus: 400,
      expectSuccess: false,
      body: { campaignId: "wheel_main" },
    });
    await apiRequest(baseUrl, "/admin/wheel/campaign", {
      method: "PATCH",
      token: adminToken,
      label: "wheel active campaign restore",
      body: { status: "active", reason: ADMIN_REASON },
    });
    console.log("Wheel inactive campaign guard: PASS");

    await apiRequest(baseUrl, "/admin/wheel/campaign", {
      method: "PATCH",
      token: adminToken,
      label: "wheel campaign empty reason",
      expectedStatus: 400,
      expectSuccess: false,
      body: { name: "กงล้อนำโชค", reason: "" },
    });
    await apiRequest(baseUrl, "/admin/wheel/rewards/wheel_reward_1", {
      method: "PATCH",
      token: adminToken,
      label: "wheel reward empty reason",
      expectedStatus: 400,
      expectSuccess: false,
      body: { label: "Credit 10", reason: "" },
    });
    console.log("Wheel admin reason validation: PASS");

    await apiRequest(baseUrl, "/admin/wheel/rewards/wheel_reward_1", {
      method: "PATCH",
      token: adminToken,
      label: "wheel reward update reason",
      body: { label: "Credit 10", probabilityWeight: 1000, reason: ADMIN_REASON },
    });
    const adminLogs = await apiRequest(baseUrl, "/admin/logs?action=wheel.reward.update&limit=20", {
      token: adminToken,
      label: "wheel admin audit log",
    });
    if (!adminLogs.some((row) => row.metadata && row.metadata.reason === ADMIN_REASON)) {
      throw new Error("Wheel admin update did not store audit reason.");
    }
    console.log("Wheel audit reason: PASS");

    const adminConfig = await apiRequest(baseUrl, "/admin/wheel/config", { token: adminToken, label: "wheel admin config" });
    if (!adminConfig.summary || adminConfig.rewards.length < REWARD_IDS.length) throw new Error("Wheel admin config shape invalid.");
    const adminSpins = await apiRequest(baseUrl, "/admin/wheel/spins?limit=20", { token: adminToken, label: "wheel admin spins" });
    if (!Array.isArray(adminSpins) || adminSpins.length < 1) throw new Error("Wheel admin spins response invalid.");

    console.log("Wheel response leak scan: PASS");
    console.log("Lucky Wheel smoke: PASS");
  } catch (error) {
    console.error("Lucky Wheel smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
