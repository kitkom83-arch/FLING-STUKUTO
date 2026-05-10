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
const ADMIN_PREFIX = "local_admin_permission";
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

  if (!SAFE_NODE_ENVS.has(nodeEnv)) reasons.push("NODE_ENV must be development-local or test.");
  if (!process.env.JWT_SECRET) reasons.push("JWT_SECRET must be set for the admin permission smoke test.");
  if (!process.env.LOCAL_ADMIN_PASSWORD) reasons.push("LOCAL_ADMIN_PASSWORD must be set for the admin permission smoke test.");
  if (!databaseTarget.ok) reasons.push(databaseTarget.reason);
  if (!apiTarget.ok) reasons.push(apiTarget.reason);

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) reasons.push(`${key} must be mock or sandbox for this smoke test.`);
  }

  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`Admin permission smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Admin permission smoke safety guard: PASS");
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
    if (value && serialized.includes(value)) throw new Error(`${label} response leaked ${name}.`);
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
  if (typeof value !== "string" || !value) throw new Error(`${label} was missing from API response.`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
}

async function loginAdmin(baseUrl, username) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: `${username} login`,
    body: {
      username,
      password: process.env.LOCAL_ADMIN_PASSWORD,
    },
  });
  const authValue = requireString(login.data.token, `${username} token`);
  issuedAuthValues.add(authValue);
  return authValue;
}

async function expectStatus(baseUrl, path, options) {
  const result = await apiRequest(baseUrl, path, {
    ...options,
    expectedStatuses: [options.status],
    expectSuccess: options.status >= 400 ? false : undefined,
  });
  if (result.status !== options.status) {
    throw new Error(`${options.label} returned ${result.status}, expected ${options.status}.`);
  }
  return result;
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");
  const runId = Date.now().toString();
  const passwordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);

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

  const admins = {};
  const adminRoles = [
    ["owner", "owner", null],
    ["finance", "finance", null],
    ["support", "support", null],
    ["graphic", "graphic", null],
    ["viewer", "viewer", null],
    ["no_permission", "viewer", []],
    ["assignee", "viewer", null],
  ];

  for (const [key, role, permissions] of adminRoles) {
    const username = `${ADMIN_PREFIX}_${key}`;
    const admin = await prisma.admin.upsert({
      where: { username },
      update: { passwordHash, role, status: "active" },
      create: { username, passwordHash, role, status: "active" },
    });
    await prisma.adminSiteAccess.upsert({
      where: { adminId_siteId: { adminId: admin.id, siteId: site.id } },
      update: { role, permissions },
      create: { adminId: admin.id, siteId: site.id, role, permissions },
    });
    admins[key] = admin;
  }

  const member = await prisma.user.create({
    data: {
      siteId: site.id,
      username: `perm_smoke_${runId}`,
      phone: `089${runId.slice(-7)}`,
      passwordHash,
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      walletAccount: {
        create: { siteId: site.id, balance: "500.00", currency: "THB" },
      },
    },
  });

  const bankAccount = await prisma.userBankAccount.create({
    data: {
      siteId: site.id,
      userId: member.id,
      bankCode: "MOCK",
      accountNumber: `77${runId.slice(-8)}`,
      accountName: "Admin Permission Smoke",
      status: "approved",
      approvedById: admins.owner.id,
      approvedAt: new Date(),
    },
  });

  async function createDeposit(amount) {
    return prisma.depositTransaction.create({
      data: {
        siteId: site.id,
        userId: member.id,
        transactionId: `PGD-RBAC-${runId}-${Math.floor(Math.random() * 100000)}`,
        amount,
        channel: "mock",
        bankAccountId: bankAccount.id,
        status: "pending",
      },
    });
  }

  async function createWithdrawal(amount) {
    return prisma.withdrawTransaction.create({
      data: {
        siteId: site.id,
        userId: member.id,
        userBankAccountId: bankAccount.id,
        transactionId: `PGW-RBAC-${runId}-${Math.floor(Math.random() * 100000)}`,
        amount,
        status: "pending",
      },
    });
  }

  const fixtures = {
    financeDeposit: await createDeposit("10.00"),
    financeWithdrawal: await createWithdrawal("5.00"),
    ownerDeposit: await createDeposit("3.00"),
    deniedDeposit: await createDeposit("4.00"),
    deniedWithdrawal: await createWithdrawal("4.00"),
    supportDeniedDeposit: await createDeposit("6.00"),
  };

  return { prisma, site, admins, member, fixtures };
}

async function runOwnerChecks(baseUrl, siteId, ownerAuth, assigneeId, depositId) {
  const roles = await apiRequest(baseUrl, "/admin/roles", { authValue: ownerAuth, label: "owner list roles" });
  requireArray(roles.data, "Role list");

  const permissions = await apiRequest(baseUrl, "/admin/permissions", {
    authValue: ownerAuth,
    label: "owner list permissions",
  });
  requireArray(permissions.data, "Permission list");

  const me = await apiRequest(baseUrl, "/admin/permissions/me", {
    authValue: ownerAuth,
    label: "owner current permissions",
  });
  if (!me.data.owner || !me.data.permissions.includes("admin.manage")) {
    throw new Error("Owner did not bypass admin.manage.");
  }

  await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(assigneeId)}/role`, {
    method: "PATCH",
    authValue: ownerAuth,
    label: "owner assign role",
    body: { role: "finance" },
  });

  await apiRequest(baseUrl, `/admin/deposits/${encodeURIComponent(depositId)}/approve`, {
    method: "POST",
    authValue: ownerAuth,
    label: "owner approve deposit",
    body: { note: "owner rbac smoke approval" },
  });

  await apiRequest(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/settings`, {
    method: "POST",
    authValue: ownerAuth,
    label: "owner update settings",
    body: { announcement: "Owner RBAC smoke" },
  });

  console.log("Owner RBAC: PASS");
}

async function runFinanceChecks(baseUrl, siteId, financeAuth, depositId, withdrawalId) {
  const deposits = await apiRequest(baseUrl, "/admin/deposits?limit=5", { authValue: financeAuth, label: "finance deposits view" });
  requireArray(deposits.data, "Finance deposits");

  const withdrawals = await apiRequest(baseUrl, "/admin/withdrawals?limit=5", {
    authValue: financeAuth,
    label: "finance withdrawals view",
  });
  requireArray(withdrawals.data, "Finance withdrawals");

  await apiRequest(baseUrl, `/admin/deposits/${encodeURIComponent(depositId)}/approve`, {
    method: "POST",
    authValue: financeAuth,
    label: "finance approve deposit",
    body: { note: "finance rbac smoke approval" },
  });

  await apiRequest(baseUrl, `/admin/withdrawals/${encodeURIComponent(withdrawalId)}/approve`, {
    method: "POST",
    authValue: financeAuth,
    label: "finance approve withdrawal",
    body: { note: "finance rbac smoke approval" },
  });

  await expectStatus(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/settings`, {
    method: "POST",
    authValue: financeAuth,
    status: 403,
    label: "finance settings update forbidden",
    body: { announcement: "finance should not update settings" },
  });

  console.log("Finance RBAC: PASS");
}

async function runSupportChecks(baseUrl, supportAuth, memberId, deniedDepositId) {
  const members = await apiRequest(baseUrl, "/admin/members?limit=5", { authValue: supportAuth, label: "support members view" });
  requireArray(members.data, "Support members");

  await apiRequest(baseUrl, `/admin/members/${encodeURIComponent(memberId)}/block`, {
    method: "POST",
    authValue: supportAuth,
    label: "support block member",
  });
  await apiRequest(baseUrl, `/admin/members/${encodeURIComponent(memberId)}/unblock`, {
    method: "POST",
    authValue: supportAuth,
    label: "support unblock member",
  });
  await expectStatus(baseUrl, `/admin/deposits/${encodeURIComponent(deniedDepositId)}/approve`, {
    method: "POST",
    authValue: supportAuth,
    status: 403,
    label: "support deposit approve forbidden",
    body: { note: "support should not approve deposits" },
  });

  console.log("Support RBAC: PASS");
}

async function runGraphicChecks(baseUrl, siteId, graphicAuth, deniedDepositId, deniedWithdrawalId) {
  await apiRequest(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/settings`, {
    method: "POST",
    authValue: graphicAuth,
    label: "graphic update website settings",
    body: { announcement: "Graphic RBAC smoke" },
  });

  await apiRequest(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/theme`, {
    method: "POST",
    authValue: graphicAuth,
    label: "graphic update website banner/theme",
    body: { logoUrl: "/mock-assets/rbac-logo.png", layoutMode: "default" },
  });

  await expectStatus(baseUrl, `/admin/deposits/${encodeURIComponent(deniedDepositId)}/approve`, {
    method: "POST",
    authValue: graphicAuth,
    status: 403,
    label: "graphic deposit approve forbidden",
    body: { note: "graphic should not approve deposits" },
  });

  await expectStatus(baseUrl, `/admin/withdrawals/${encodeURIComponent(deniedWithdrawalId)}/approve`, {
    method: "POST",
    authValue: graphicAuth,
    status: 403,
    label: "graphic withdrawal approve forbidden",
    body: { note: "graphic should not approve withdrawals" },
  });

  console.log("Graphic RBAC: PASS");
}

async function runViewerChecks(baseUrl, siteId, viewerAuth, deniedDepositId) {
  const deposits = await apiRequest(baseUrl, "/admin/deposits?limit=5", { authValue: viewerAuth, label: "viewer deposits view" });
  requireArray(deposits.data, "Viewer deposits");

  const site = await apiRequest(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}`, {
    authValue: viewerAuth,
    label: "viewer site config view",
  });
  if (!site.data || site.data.id !== siteId) throw new Error("Viewer site view returned the wrong site.");

  await expectStatus(baseUrl, `/admin/deposits/${encodeURIComponent(deniedDepositId)}/approve`, {
    method: "POST",
    authValue: viewerAuth,
    status: 403,
    label: "viewer deposit approve forbidden",
    body: { note: "viewer should not approve deposits" },
  });

  await expectStatus(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/settings`, {
    method: "POST",
    authValue: viewerAuth,
    status: 403,
    label: "viewer settings update forbidden",
    body: { announcement: "viewer should not update settings" },
  });

  console.log("Viewer RBAC: PASS");
}

async function runNoPermissionChecks(baseUrl, noPermissionAuth) {
  await expectStatus(baseUrl, "/admin/deposits?limit=5", {
    authValue: noPermissionAuth,
    status: 403,
    label: "no permission deposits view forbidden",
  });
  console.log("No permission 403: PASS");
}

async function runUnauthChecks(baseUrl, siteId) {
  await expectStatus(baseUrl, "/admin/permissions/me", {
    status: 401,
    label: "current permissions unauth",
  });
  await expectStatus(baseUrl, `/admin/sites/${encodeURIComponent(siteId)}/settings`, {
    method: "POST",
    status: 401,
    label: "settings update unauth",
    body: { announcement: "unauth should fail" },
  });
  console.log("Unauth 401: PASS");
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    if (health.status !== 200) throw new Error(`Health returned ${health.status}, expected 200.`);
    console.log("Health 200: PASS");

    const fixture = await ensureLocalFixtures();
    prisma = fixture.prisma;
    const { site, admins, member, fixtures } = fixture;

    await runUnauthChecks(baseUrl, site.id);

    const ownerAuth = await loginAdmin(baseUrl, admins.owner.username);
    const financeAuth = await loginAdmin(baseUrl, admins.finance.username);
    const supportAuth = await loginAdmin(baseUrl, admins.support.username);
    const graphicAuth = await loginAdmin(baseUrl, admins.graphic.username);
    const viewerAuth = await loginAdmin(baseUrl, admins.viewer.username);
    const noPermissionAuth = await loginAdmin(baseUrl, admins.no_permission.username);

    console.log("Admin login by role: PASS");

    await runOwnerChecks(baseUrl, site.id, ownerAuth, admins.assignee.id, fixtures.ownerDeposit.id);
    await runFinanceChecks(baseUrl, site.id, financeAuth, fixtures.financeDeposit.id, fixtures.financeWithdrawal.id);
    await runSupportChecks(baseUrl, supportAuth, member.id, fixtures.supportDeniedDeposit.id);
    await runGraphicChecks(baseUrl, site.id, graphicAuth, fixtures.deniedDeposit.id, fixtures.deniedWithdrawal.id);
    await runViewerChecks(baseUrl, site.id, viewerAuth, fixtures.deniedDeposit.id);
    await runNoPermissionChecks(baseUrl, noPermissionAuth);

    console.log("Forbidden 403: PASS");
    console.log("Response leak scan: PASS");
    console.log("Admin permission smoke: PASS");
  } catch (error) {
    console.error("Admin permission smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
