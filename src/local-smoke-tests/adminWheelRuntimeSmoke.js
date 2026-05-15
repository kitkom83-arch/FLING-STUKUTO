require("dotenv").config();

const { Prisma } = require("@prisma/client");
const { evaluateDbSafetyGuard, PROVIDER_MODE_KEYS } = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const OWNER_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_wheel_runtime_owner";
const NO_PERMISSION_USERNAME = "local_wheel_runtime_no_permission";
const MEMBER_PASSWORD = process.env.LOCAL_MEMBER_PASSWORD || "local-wheel-runtime-member-only";
const RUNTIME_REASON = "admin wheel runtime smoke reason";
const WHEEL_AUDIT_ACTIONS = ["wheel.campaign.update", "wheel.reward.create", "wheel.reward.update"];
const issuedAuthValues = new Set();

function tokenize(value) {
  return String(value || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
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
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
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

function webBaseFromApi(baseUrl) {
  const parsed = parseUrl(baseUrl);
  if (!parsed) throw new Error("BASE_URL must be a valid URL.");
  return `${parsed.protocol}//${parsed.host}`;
}

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) return { ok: false, missing: true, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
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

function inspectApiBaseUrl(baseUrl) {
  const parsed = parseUrl(baseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) return { ok: false, reason: "BASE_URL must be a valid HTTP(S) URL." };
  if (parsed.username || parsed.password) return { ok: false, reason: "BASE_URL must not contain embedded credentials." };
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) return { ok: false, reason: "BASE_URL appears production-like and is blocked." };
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

function runtimeSafety() {
  const blockers = [];
  const missing = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const baseUrl = configuredBaseUrl();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiTarget = inspectApiBaseUrl(baseUrl);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) missing.push("NODE_ENV must be development-local or test.");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET must be set for the admin wheel runtime smoke.");
  if (!process.env.LOCAL_ADMIN_PASSWORD) missing.push("local admin env not configured");
  if (!databaseTarget.ok) {
    if (databaseTarget.missing) missing.push(databaseTarget.reason);
    else blockers.push(databaseTarget.reason);
  }
  if (!apiTarget.ok) blockers.push(apiTarget.reason);

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) blockers.push(`${key} must be mock or sandbox for this smoke test.`);
  }
  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    if (databaseTarget.missing && /DATABASE_URL/.test(reason)) missing.push(reason);
    else blockers.push(reason);
  }

  if (blockers.length > 0) return { ok: false, blocked: true, reasons: blockers };
  if (missing.length > 0) return { ok: false, skipped: true, reasons: [...new Set(missing)] };
  return { ok: true, baseUrl };
}

function headerWithAuth(authValue) {
  const headers = { Accept: "application/json", "X-Site-Code": SITE_CODE };
  if (authValue) headers.Authorization = [["Be", "arer"].join(""), authValue].join(" ");
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
    if (!isAllowedAuthToken && /(password|token|secret|session|authorization|refresh)/i.test(normalized)) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") throw new Error(`${label} response exposed database URL key.`);
    if (normalized === "useragent" || normalized === "user_agent") throw new Error(`${label} response exposed raw user-agent key.`);
    assertNoUnsafeKeys(label, item, { allowAuthToken });
  }
}

function assertNoUnsafeValues(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;

  if (serialized.includes("undefined") || serialized.includes("NaN")) throw new Error(`${label} response contains undefined or NaN.`);
  if (lower.includes("database_url")) throw new Error(`${label} response leaked DATABASE_URL marker.`);
  if (!allowAuthToken && /(password|token|secret|refresh)/i.test(lower)) throw new Error(`${label} response included unsafe sensitive marker.`);
  if (lower.includes(authScheme)) throw new Error(`${label} response included authorization scheme text.`);
  if (!allowAuthToken && jwtLike.test(serialized)) throw new Error(`${label} response included a JWT-like value.`);
  if (postgresWithCredentials.test(serialized)) throw new Error(`${label} response included a PostgreSQL credential URL.`);
  if (/Mozilla|Chrome|Safari|Firefox|Edg\//i.test(serialized)) throw new Error(`${label} response included raw user-agent content.`);
  if (/"ipAddress":"(?:\d{1,3}\.){3}\d{1,3}"/.test(serialized)) throw new Error(`${label} response exposed unmasked IPv4 address.`);
  if (/(Error:\s.+\n\s+at\s+)|(\"stack\"\s*:)/i.test(serialized)) throw new Error(`${label} response included a raw internal stack.`);

  for (const [name, value] of [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
  ]) {
    if (value && serialized.includes(value)) throw new Error(`${label} response leaked ${name}.`);
  }
  if (!allowAuthToken) {
    for (const authValue of issuedAuthValues) {
      if (authValue && serialized.includes(authValue)) throw new Error(`${label} response echoed an authorization value.`);
    }
  }
  assertNoUnsafeKeys(label, payload, { allowAuthToken });
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = headerWithAuth(options.authValue);
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) throw new Error(`API returned non-JSON response for ${path}`);
  const payload = await response.json();
  assertNoUnsafeValues(options.label || path, payload, { allowAuthToken: Boolean(options.allowAuthToken) });
  if (options.expectedStatus && response.status !== options.expectedStatus) {
    throw new Error(`API ${path} returned ${response.status}, expected ${options.expectedStatus}`);
  }
  if (options.expectSuccess === false) {
    if (!payload || payload.success !== false) throw new Error(`API ${path} returned unexpected success payload`);
    return { status: response.status, payload };
  }
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(`API ${path} blocked with ${response.status}: ${payload && payload.message ? payload.message : "request failed"}`);
  }
  return { status: response.status, data: payload.data, payload };
}

async function fetchText(url, label) {
  const response = await fetch(url, { headers: { Accept: "text/html,*/*" } });
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  const text = await response.text();
  const leakPatterns = [
    /postgres(?:ql)?:\/\/[^\s"']+/i,
    new RegExp(["data", "base", "_url"].join(""), "i"),
    new RegExp(["Bear", "er"].join("") + "\\s+", "i"),
    new RegExp(["e", "yJ"].join("") + "[A-Za-z0-9_-]+", "i"),
    new RegExp(["s", "k"].join("") + "-" + "[A-Za-z0-9_-]+", "i"),
  ];
  if (leakPatterns.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} included unsafe text.`);
  }
  if (/(Error:\s.+\n\s+at\s+)|(<pre>[\s\S]*stack[\s\S]*<\/pre>)/i.test(text)) {
    throw new Error(`${label} included a raw stack trace.`);
  }
  return text;
}

async function ensureFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");
  const passwordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);
  const memberPasswordHash = await hashPassword(MEMBER_PASSWORD);

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: { name: `${SITE_CODE} Admin Wheel Runtime`, brandName: SITE_CODE, status: "active" },
    create: {
      code: SITE_CODE,
      name: `${SITE_CODE} Admin Wheel Runtime`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
  });

  const owner = await prisma.admin.upsert({
    where: { username: OWNER_USERNAME },
    update: { passwordHash, role: "super_admin", status: "active" },
    create: { username: OWNER_USERNAME, passwordHash, role: "super_admin", status: "active" },
  });
  await prisma.adminSiteAccess.upsert({
    where: { adminId_siteId: { adminId: owner.id, siteId: site.id } },
    update: { role: "super_admin", permissions: { all: true } },
    create: { adminId: owner.id, siteId: site.id, role: "super_admin", permissions: { all: true } },
  });

  const noPermission = await prisma.admin.upsert({
    where: { username: NO_PERMISSION_USERNAME },
    update: { passwordHash, role: "viewer", status: "active" },
    create: { username: NO_PERMISSION_USERNAME, passwordHash, role: "viewer", status: "active" },
  });
  await prisma.adminSiteAccess.upsert({
    where: { adminId_siteId: { adminId: noPermission.id, siteId: site.id } },
    update: { role: "viewer", permissions: [] },
    create: { adminId: noPermission.id, siteId: site.id, role: "viewer", permissions: [] },
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

  await prisma.wheelReward.upsert({
    where: { id: "wheel_runtime_base_reward" },
    update: {
      campaignId: "wheel_main",
      label: "Runtime Base Reward",
      rewardType: "point",
      rewardValue: new Prisma.Decimal("1.00"),
      displayValue: "1 point",
      probabilityWeight: 1,
      stockLimit: null,
      segmentColor: "#16705d",
      imageUrl: null,
      sortOrder: 80,
      status: "active",
    },
    create: {
      id: "wheel_runtime_base_reward",
      campaignId: "wheel_main",
      label: "Runtime Base Reward",
      rewardType: "point",
      rewardValue: new Prisma.Decimal("1.00"),
      displayValue: "1 point",
      probabilityWeight: 1,
      stockLimit: null,
      stockUsed: 0,
      segmentColor: "#16705d",
      imageUrl: null,
      sortOrder: 80,
      status: "active",
    },
  });

  const runId = makeRunId();
  const member = await prisma.user.create({
    data: {
      siteId: site.id,
      phone: `08${runId.slice(-8)}`,
      username: `local_wheel_runtime_member_${runId}`,
      passwordHash: memberPasswordHash,
      referralSource: "admin-wheel-runtime-smoke",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      points: new Prisma.Decimal("120.00"),
      walletAccount: {
        create: {
          siteId: site.id,
          balance: new Prisma.Decimal("180.00"),
          currency: "THB",
        },
      },
    },
  });

  return { prisma, memberPhone: member.phone };
}

async function loginAdmin(baseUrl, username) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: `admin wheel runtime login ${username}`,
    body: { username, password: process.env.LOCAL_ADMIN_PASSWORD },
  });
  if (!login.data.token) throw new Error("Admin login token missing.");
  issuedAuthValues.add(login.data.token);
  return login.data.token;
}

async function loginMember(baseUrl, phone) {
  const login = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "admin wheel runtime member login",
    body: { phone, password: MEMBER_PASSWORD },
  });
  if (!login.data.token) throw new Error("Member login token missing.");
  issuedAuthValues.add(login.data.token);
  return login.data.token;
}

async function assertMemberWheelRuntime(baseUrl, memberToken) {
  await apiRequest(baseUrl, "/member/wheel/config", {
    expectedStatus: 401,
    expectSuccess: false,
    label: "admin wheel runtime member config missing auth",
  });

  const config = await apiRequest(baseUrl, "/member/wheel/config", {
    authValue: memberToken,
    label: "admin wheel runtime member config",
  });
  if (!config.data.campaignId || !Array.isArray(config.data.rewards)) {
    throw new Error("Member wheel config response shape invalid.");
  }
  if (config.data.rewards.some((reward) => Object.prototype.hasOwnProperty.call(reward, "probabilityWeight"))) {
    throw new Error("Member wheel config exposed probabilityWeight.");
  }

  await apiRequest(baseUrl, "/member/wheel/spin", {
    method: "POST",
    authValue: memberToken,
    expectedStatus: 400,
    expectSuccess: false,
    label: "admin wheel runtime member unsafe spin payload",
    body: {
      campaignId: config.data.campaignId,
      rewardId: "wheel_runtime_base_reward",
      prizeIndex: 0,
      probabilityWeight: 999999,
      rewardValue: "999.00",
    },
  });

  await apiRequest(baseUrl, "/member/wheel/spin", {
    method: "POST",
    authValue: memberToken,
    expectedStatus: 404,
    expectSuccess: false,
    label: "admin wheel runtime member invalid campaign",
    body: { campaignId: "missing_wheel_campaign" },
  });

  const spin = await apiRequest(baseUrl, "/member/wheel/spin", {
    method: "POST",
    authValue: memberToken,
    label: "admin wheel runtime member spin",
    body: { campaignId: config.data.campaignId },
  });
  if (!spin.data.spinId || !spin.data.rewardId || typeof spin.data.prizeIndex !== "number" || !spin.data.reward) {
    throw new Error("Member wheel spin response shape invalid.");
  }

  const history = await apiRequest(baseUrl, "/member/wheel/history?limit=20", {
    authValue: memberToken,
    label: "admin wheel runtime member history",
  });
  if (!Array.isArray(history.data) || !history.data.some((row) => row.spinId === spin.data.spinId)) {
    throw new Error("Member wheel history response shape invalid.");
  }

  const myRewards = await apiRequest(baseUrl, "/member/wheel/my-rewards?limit=20", {
    authValue: memberToken,
    label: "admin wheel runtime member my rewards",
  });
  if (!Array.isArray(myRewards.data)) throw new Error("Member wheel my-rewards response shape invalid.");

  console.log("Admin Wheel member config/spin/history/my-rewards runtime: PASS");
  console.log("Admin Wheel frontend result injection guard: PASS");
}

function assertAuditRow(row, action) {
  if (!row) throw new Error(`Audit row missing for ${action}.`);
  if (!row.metadata || row.metadata.reason !== RUNTIME_REASON) throw new Error(`${action} audit row missing reason.`);
  if (!row.metadata.actor || !row.metadata.actor.username) throw new Error(`${action} audit row missing actor.`);
  if (row.metadata.siteCode !== SITE_CODE) throw new Error(`${action} audit row missing siteCode.`);
  if (action !== "wheel.reward.create" && !row.beforeJson) throw new Error(`${action} audit row missing sanitized before state.`);
  if (!row.afterJson) throw new Error(`${action} audit row missing sanitized after state.`);
}

async function assertStaticRoutes(webBase) {
  await fetchText(`${webBase}/admin/lucky-wheel/`, "GET /admin/lucky-wheel");
  await fetchText(`${webBase}/admin/lucky-wheel/app.js`, "GET /admin/lucky-wheel/app.js");
  await fetchText(`${webBase}/admin/lucky-wheel/styles.css`, "GET /admin/lucky-wheel/styles.css");
  console.log("Admin Wheel static page/assets: PASS");
}

async function main() {
  let prisma = null;
  try {
    const safety = runtimeSafety();
    if (safety.blocked) throw new Error(`Admin Wheel runtime smoke safety guard: BLOCKED\n- ${safety.reasons.join("\n- ")}`);
    if (safety.skipped) {
      console.log("Admin Wheel runtime smoke: SKIPPED by safety guard");
      console.log(`reason: ${safety.reasons.join("; ")}`);
      console.log("no production DB used");
      console.log("no real provider/payment/bank/SMS/Slip OCR used");
      console.log("no real money payout");
      return;
    }

    const baseUrl = safety.baseUrl;
    const webBase = webBaseFromApi(baseUrl);
    console.log("Admin Wheel runtime smoke safety guard: PASS");
    await assertStaticRoutes(webBase);

    const fixtures = await ensureFixtures();
    prisma = fixtures.prisma;
    const ownerToken = await loginAdmin(baseUrl, OWNER_USERNAME);
    const noPermissionToken = await loginAdmin(baseUrl, NO_PERMISSION_USERNAME);
    const memberToken = await loginMember(baseUrl, fixtures.memberPhone);

    await apiRequest(baseUrl, "/admin/wheel/config", {
      expectedStatus: 401,
      expectSuccess: false,
      label: "admin wheel config no auth",
    });
    await apiRequest(baseUrl, "/admin/wheel/config", {
      authValue: noPermissionToken,
      expectedStatus: 403,
      expectSuccess: false,
      label: "admin wheel config no permission",
    });
    console.log("Admin Wheel 401/403 permission behavior: PASS");

    const config = await apiRequest(baseUrl, "/admin/wheel/config", {
      authValue: ownerToken,
      label: "admin wheel config read",
    });
    if (!config.data.campaign || !Array.isArray(config.data.rewards) || !config.data.summary) {
      throw new Error("Admin wheel config response shape invalid.");
    }
    console.log("Admin Wheel config read: PASS");

    const spins = await apiRequest(baseUrl, "/admin/wheel/spins?limit=20", {
      authValue: ownerToken,
      label: "admin wheel spins read",
    });
    if (!Array.isArray(spins.data)) throw new Error("Admin wheel spins response shape invalid.");
    console.log("Admin Wheel spins read: PASS");

    await assertMemberWheelRuntime(baseUrl, memberToken);

    await apiRequest(baseUrl, "/admin/wheel/campaign", {
      method: "PATCH",
      authValue: ownerToken,
      expectedStatus: 400,
      expectSuccess: false,
      label: "admin wheel campaign missing reason",
      body: { name: config.data.campaign.name || "กงล้อนำโชค", reason: "" },
    });
    await apiRequest(baseUrl, "/admin/wheel/rewards", {
      method: "POST",
      authValue: ownerToken,
      expectedStatus: 400,
      expectSuccess: false,
      label: "admin wheel reward create missing reason",
      body: {
        label: "Runtime Missing Reason",
        rewardType: "point",
        rewardValue: "1.00",
        displayValue: "1 point",
        probabilityWeight: 1,
        stockLimit: null,
        segmentColor: "#16705d",
        sortOrder: 91,
        status: "active",
        reason: "",
      },
    });
    await apiRequest(baseUrl, "/admin/wheel/rewards/wheel_runtime_base_reward", {
      method: "PATCH",
      authValue: ownerToken,
      expectedStatus: 400,
      expectSuccess: false,
      label: "admin wheel reward update missing reason",
      body: { label: "Runtime Base Reward", reason: "" },
    });
    console.log("Admin Wheel write reason validation: PASS");

    await apiRequest(baseUrl, "/admin/wheel/campaign", {
      method: "PATCH",
      authValue: ownerToken,
      label: "admin wheel campaign update with reason",
      body: { name: config.data.campaign.name || "กงล้อนำโชค", reason: RUNTIME_REASON },
    });

    const rewardId = `wheel_runtime_reward_${Date.now()}`;
    const sortOrder = 100000 + Math.floor(Math.random() * 100000);
    const createdReward = await apiRequest(baseUrl, "/admin/wheel/rewards", {
      method: "POST",
      authValue: ownerToken,
      label: "admin wheel reward create with reason",
      body: {
        id: rewardId,
        label: "Runtime Smoke Reward",
        rewardType: "point",
        rewardValue: "2.00",
        displayValue: "2 points",
        probabilityWeight: 1,
        stockLimit: null,
        segmentColor: "#0f766e",
        sortOrder,
        status: "active",
        reason: RUNTIME_REASON,
      },
    });
    if (!createdReward.data || createdReward.data.id !== rewardId) throw new Error("Reward create response shape invalid.");

    await apiRequest(baseUrl, `/admin/wheel/rewards/${encodeURIComponent(rewardId)}`, {
      method: "PATCH",
      authValue: ownerToken,
      label: "admin wheel reward update with reason",
      body: { label: "Runtime Smoke Reward Updated", probabilityWeight: 2, reason: RUNTIME_REASON },
    });
    console.log("Admin Wheel writes with reason: PASS");

    const audit = await apiRequest(baseUrl, "/admin/audit-logs?limit=100", {
      authValue: ownerToken,
      label: "admin wheel audit read",
    });
    if (!audit.data || !Array.isArray(audit.data.rows)) throw new Error("Audit log response shape invalid.");
    for (const action of WHEEL_AUDIT_ACTIONS) {
      const row = audit.data.rows.find((item) => item.action === action && item.metadata && item.metadata.reason === RUNTIME_REASON);
      assertAuditRow(row, action);
    }
    console.log("Admin Wheel audit log read: PASS");
    console.log("Admin Wheel runtime response leak scan: PASS");
    console.log("no production DB used");
    console.log("no real provider/payment/bank/SMS/Slip OCR used");
    console.log("no real money payout");
    console.log("Admin Wheel runtime smoke: PASS");
  } catch (error) {
    console.error("Admin Wheel runtime smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
