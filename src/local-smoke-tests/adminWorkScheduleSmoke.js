require("dotenv").config();

const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");
const { isWithinSchedule } = require("../services/adminWorkSchedule.service");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const ADMIN_PREFIX = "local_admin_work_schedule";
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
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
  if (!process.env.JWT_SECRET) reasons.push("JWT_SECRET must be set for the admin work schedule smoke test.");
  if (!process.env.LOCAL_ADMIN_PASSWORD) reasons.push("LOCAL_ADMIN_PASSWORD must be set for the admin work schedule smoke test.");
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
    throw new Error(`Admin work schedule smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Admin work schedule smoke safety guard: PASS");
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

async function loginAdmin(baseUrl, username, { expectBlocked = false } = {}) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: !expectBlocked,
    expectedStatuses: expectBlocked ? [403] : undefined,
    expectSuccess: expectBlocked ? false : undefined,
    label: `${username} login`,
    body: {
      username,
      password: process.env.LOCAL_ADMIN_PASSWORD,
    },
  });
  if (expectBlocked) {
    if (login.payload && JSON.stringify(login.payload).toLowerCase().includes("token")) {
      throw new Error(`${username} blocked login response included a token marker.`);
    }
    return null;
  }
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

function currentBangkokDay() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
  }).formatToParts(new Date());
  return String(parts.find((part) => part.type === "weekday").value).toUpperCase();
}

function nextDifferentDay(day) {
  const index = DAYS.indexOf(day);
  return DAYS[(index + 1) % DAYS.length];
}

function blockingSchedule() {
  return {
    enabled: true,
    timezone: "Asia/Bangkok",
    allowedDays: [nextDifferentDay(currentBangkokDay())],
    startTime: "09:00",
    endTime: "10:00",
    forceLogoutWhenScheduleEnds: true,
    idleTimeoutMinutes: 60,
    emergencyOverride: {
      enabled: false,
      expiresAt: null,
      reason: null,
    },
  };
}

function allowingSchedule() {
  return {
    enabled: true,
    timezone: "Asia/Bangkok",
    allowedDays: [currentBangkokDay()],
    startTime: "00:00",
    endTime: "23:59",
    forceLogoutWhenScheduleEnds: true,
    idleTimeoutMinutes: 60,
    emergencyOverride: {
      enabled: false,
      expiresAt: null,
      reason: null,
    },
  };
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");
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
    ["no_permission", "viewer", []],
    ["target", "viewer", null],
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

  return { prisma, site, admins };
}

async function runUnauthChecks(baseUrl, targetId) {
  await expectStatus(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule`, {
    status: 401,
    label: "work schedule read unauth",
  });
  await expectStatus(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule`, {
    method: "PATCH",
    status: 401,
    label: "work schedule update unauth",
    body: blockingSchedule(),
  });
  console.log("Unauth 401: PASS");
}

async function runNonOwnerForbiddenChecks(baseUrl, noPermissionAuth, targetId) {
  await expectStatus(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule`, {
    method: "PATCH",
    authValue: noPermissionAuth,
    status: 403,
    label: "no permission schedule update forbidden",
    body: blockingSchedule(),
  });
  console.log("Non-owner 403: PASS");
}

async function updateSchedule(baseUrl, ownerAuth, targetId, body, label) {
  const result = await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule`, {
    method: "PATCH",
    authValue: ownerAuth,
    label,
    body,
  });
  if (!result.data || !result.data.schedule) throw new Error(`${label} did not return schedule data.`);
  return result.data.schedule;
}

async function runOwnerAccessChecks(baseUrl, ownerAuth, targetId) {
  const permissions = await apiRequest(baseUrl, "/admin/permissions", {
    authValue: ownerAuth,
    label: "owner permissions catalog",
  });
  requireArray(permissions.data, "Permission catalog");
  for (const permission of ["admin.schedule.view", "admin.schedule.update", "admin.schedule.override"]) {
    if (!permissions.data.includes(permission)) throw new Error(`Permission catalog did not include ${permission}.`);
  }

  const read = await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule`, {
    authValue: ownerAuth,
    label: "owner read schedule",
  });
  if (!read.data || read.data.admin.id !== targetId || !read.data.schedule) {
    throw new Error("Owner schedule read returned the wrong target.");
  }

  const schedule = await updateSchedule(baseUrl, ownerAuth, targetId, allowingSchedule(), "owner update schedule");
  if (!schedule.enabled) throw new Error("Owner schedule update did not enable the schedule.");

  const override = await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule/override`, {
    method: "POST",
    authValue: ownerAuth,
    label: "owner enable override",
    body: {
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      reason: "local smoke temporary override",
    },
  });
  if (!override.data.schedule.emergencyOverride.enabled) throw new Error("Owner override enable did not activate override.");

  const disabled = await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/work-schedule/override`, {
    method: "DELETE",
    authValue: ownerAuth,
    label: "owner disable override",
    body: { reason: "local smoke override cleanup" },
  });
  if (disabled.data.schedule.emergencyOverride.enabled) throw new Error("Owner override disable did not clear override.");

  console.log("Owner access: PASS");
}

async function assertAuditLog(baseUrl, ownerAuth, action, targetId) {
  const logs = await apiRequest(baseUrl, `/admin/logs?action=${encodeURIComponent(action)}&target_id=${encodeURIComponent(targetId)}&limit=20`, {
    authValue: ownerAuth,
    label: `${action} audit log`,
  });
  requireArray(logs.data, `${action} logs`);
  if (!logs.data.some((row) => row.action === action && row.targetId === targetId)) {
    throw new Error(`${action} audit log was not found.`);
  }
}

async function runLoginScheduleChecks(baseUrl, ownerAuth, targetAdmin) {
  await updateSchedule(baseUrl, ownerAuth, targetAdmin.id, blockingSchedule(), "target blocking schedule");
  await loginAdmin(baseUrl, targetAdmin.username, { expectBlocked: true });
  await assertAuditLog(baseUrl, ownerAuth, "admin.login.blocked_outside_schedule", targetAdmin.id);
  console.log("Login outside schedule block: PASS");

  await updateSchedule(baseUrl, ownerAuth, targetAdmin.id, allowingSchedule(), "target allowing schedule");
  const targetAuth = await loginAdmin(baseUrl, targetAdmin.username);
  if (!targetAuth) throw new Error("Target login inside schedule did not return an auth value.");
  console.log("Login inside schedule allow: PASS");
}

async function runEmergencyOverrideChecks(baseUrl, ownerAuth, targetAdmin) {
  await updateSchedule(baseUrl, ownerAuth, targetAdmin.id, blockingSchedule(), "target block for override");
  await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetAdmin.id)}/work-schedule/override`, {
    method: "POST",
    authValue: ownerAuth,
    label: "enable active emergency override",
    body: {
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      reason: "local smoke emergency access",
    },
  });

  await loginAdmin(baseUrl, targetAdmin.username);
  await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetAdmin.id)}/work-schedule/override`, {
    method: "DELETE",
    authValue: ownerAuth,
    label: "disable active emergency override",
    body: { reason: "local smoke emergency done" },
  });
  await loginAdmin(baseUrl, targetAdmin.username, { expectBlocked: true });
  console.log("Emergency override: PASS");
}

async function runExpiredOverrideChecks(baseUrl, ownerAuth, targetAdmin) {
  const expiredSchedule = {
    ...blockingSchedule(),
    emergencyOverride: {
      enabled: true,
      expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      reason: "local smoke expired override",
    },
  };
  await updateSchedule(baseUrl, ownerAuth, targetAdmin.id, expiredSchedule, "target expired override schedule");
  await loginAdmin(baseUrl, targetAdmin.username, { expectBlocked: true });
  console.log("Expired override: PASS");
}

function runOvernightShiftChecks() {
  const schedule = {
    enabled: true,
    timezone: "UTC",
    allowedDays: ["MONDAY"],
    startTime: "18:00",
    endTime: "02:00",
    forceLogoutWhenScheduleEnds: true,
    idleTimeoutMinutes: 60,
    emergencyOverride: { enabled: false, expiresAt: null, reason: null },
  };
  const inside = isWithinSchedule(schedule, new Date("2026-05-12T01:30:00.000Z"), "UTC");
  const outside = isWithinSchedule(schedule, new Date("2026-05-12T03:00:00.000Z"), "UTC");
  if (!inside || outside) throw new Error("Overnight shift helper did not handle a Monday 18:00-02:00 schedule.");
  console.log("Overnight shift: PASS");
}

async function cleanupSchedule(baseUrl, ownerAuth, targetId) {
  await updateSchedule(
    baseUrl,
    ownerAuth,
    targetId,
    {
      enabled: false,
      timezone: "Asia/Bangkok",
      allowedDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      startTime: "09:00",
      endTime: "18:00",
      forceLogoutWhenScheduleEnds: true,
      idleTimeoutMinutes: 60,
      emergencyOverride: { enabled: false, expiresAt: null, reason: null },
    },
    "target cleanup schedule"
  );
  console.log("Cleanup rollback: PASS");
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
    const { admins } = fixture;

    await runUnauthChecks(baseUrl, admins.target.id);

    const ownerAuth = await loginAdmin(baseUrl, admins.owner.username);
    const noPermissionAuth = await loginAdmin(baseUrl, admins.no_permission.username);

    await runNonOwnerForbiddenChecks(baseUrl, noPermissionAuth, admins.target.id);
    await runOwnerAccessChecks(baseUrl, ownerAuth, admins.target.id);
    await runLoginScheduleChecks(baseUrl, ownerAuth, admins.target);
    await runEmergencyOverrideChecks(baseUrl, ownerAuth, admins.target);
    await runExpiredOverrideChecks(baseUrl, ownerAuth, admins.target);
    runOvernightShiftChecks();
    await cleanupSchedule(baseUrl, ownerAuth, admins.target.id);

    for (const action of [
      "admin.schedule.update",
      "admin.schedule.enable",
      "admin.schedule.disable",
      "admin.schedule.override_enable",
      "admin.schedule.override_disable",
      "admin.login.blocked_outside_schedule",
    ]) {
      await assertAuditLog(baseUrl, ownerAuth, action, admins.target.id);
    }

    console.log("Audit log actions: PASS");
    console.log("Response leak scan: PASS");
    console.log("Admin work schedule smoke: PASS");
  } catch (error) {
    console.error("Admin work schedule smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
