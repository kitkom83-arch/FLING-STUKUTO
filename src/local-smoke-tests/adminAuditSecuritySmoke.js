require("dotenv").config();

const { evaluateDbSafetyGuard, PROVIDER_MODE_KEYS } = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const ADMIN_PREFIX = "local_admin_audit_security";
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

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const baseUrl = configuredBaseUrl();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiTarget = inspectApiBaseUrl(baseUrl);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) reasons.push("NODE_ENV must be development-local or test.");
  if (!process.env.JWT_SECRET) reasons.push("JWT_SECRET must be set for the admin audit security smoke test.");
  if (!process.env.LOCAL_ADMIN_PASSWORD) reasons.push("LOCAL_ADMIN_PASSWORD must be set for the admin audit security smoke test.");
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

  if (reasons.length > 0) throw new Error(`Admin audit security smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  console.log("Admin audit security smoke safety guard: PASS");
  return baseUrl;
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
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} response exposed database URL key.`);
    }
    if (normalized === "useragent" || normalized === "user_agent") {
      throw new Error(`${label} response exposed raw user-agent key.`);
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

  if (serialized.includes("undefined") || serialized.includes("NaN")) throw new Error(`${label} response contains undefined or NaN.`);
  if (lower.includes("database_url")) throw new Error(`${label} response leaked DATABASE_URL marker.`);
  if (!allowAuthToken && /(password|token|secret|refresh)/i.test(lower)) throw new Error(`${label} response included unsafe sensitive marker.`);
  if (lower.includes(authScheme)) throw new Error(`${label} response included authorization scheme text.`);
  if (!allowAuthToken && jwtLike.test(serialized)) throw new Error(`${label} response included a JWT-like value.`);
  if (postgresWithCredentials.test(serialized)) throw new Error(`${label} response included a PostgreSQL credential URL.`);
  if (/Mozilla|Chrome|Safari|Firefox|Edg\//i.test(serialized)) throw new Error(`${label} response included raw user-agent content.`);
  if (/"ipAddress":"(?:\d{1,3}\.){3}\d{1,3}"/.test(serialized)) {
    throw new Error(`${label} response exposed unmasked IPv4 address.`);
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
  if (/postgres(?:ql)?:\/\/[^\s"']+|database_url|Bearer\s+/i.test(text)) throw new Error(`${label} included unsafe text.`);
  return text;
}

function assertStaticNoSecretLeak(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  if (jwtLike.test(text)) throw new Error(`${label} included a JWT-like static value.`);
  if (postgresWithCredentials.test(text)) throw new Error(`${label} included a PostgreSQL credential URL.`);
  for (const [name, value] of [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
  ]) {
    if (value && text.includes(value)) throw new Error(`${label} leaked ${name}.`);
  }
}

async function loginAdmin(baseUrl, username) {
  const login = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: `${username} login`,
    body: { username, password: process.env.LOCAL_ADMIN_PASSWORD },
  });
  const token = login.data && login.data.token;
  if (typeof token !== "string" || !token) throw new Error(`${username} login did not return token.`);
  issuedAuthValues.add(token);
  return token;
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");
  const passwordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: { name: `${SITE_CODE} Local Smoke`, brandName: SITE_CODE, status: "active" },
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
  for (const [key, role, permissions] of [
    ["owner", "owner", null],
    ["no_permission", "viewer", []],
    ["target", "viewer", null],
  ]) {
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
  return { prisma, admins };
}

async function assertStaticUi(baseUrl) {
  const webBase = webBaseFromApi(baseUrl);
  const html = await fetchText(`${webBase}/admin/audit-security/`, "admin audit security page");
  for (const marker of [
    "Audit Security Report",
    "Admin audit logs",
    "Security Events",
    "Safe metadata",
    "Permission status",
    "Total audit events",
    "Role changes",
    "Work schedule events",
    "Login/security events",
    "Blocked/failed actions",
    "Events with reason",
    "Action type",
    "Admin username",
    "Target username",
    "Site code",
    "Event category",
    "Clear filters",
    "Refresh / Load audit",
    "Time",
    "Category",
    "Actor admin",
    "Target admin/member",
    "Before",
    "After",
    "Reason",
    "Status",
    "Details",
    "No audit events found",
    "audit-filter-toolbar",
    "audit-role-before-after",
    "audit-reason-visible",
    "audit-work-schedule-events",
    "audit-details-modal",
    "audit-secret-redaction",
  ]) {
    if (!html.includes(marker)) throw new Error(`Static UI missing marker: ${marker}`);
  }
  assertStaticNoSecretLeak("admin audit security page", html);
  const js = await fetchText(`${webBase}/admin/audit-security/app.js`, "admin audit security app.js");
  for (const endpoint of [
    "/admin/permissions/me",
    "/admin/audit-logs",
    "/admin/audit-logs/summary",
    "/admin/security-events",
    "/admin/security-events/summary",
  ]) {
    if (!js.includes(endpoint)) throw new Error(`UI script missing endpoint: ${endpoint}`);
  }
  for (const marker of [
    "audit-filter-toolbar",
    "audit-role-before-after",
    "audit-reason-visible",
    "audit-work-schedule-events",
    "audit-details-modal",
    "audit-secret-redaction",
    "beforeRole",
    "afterRole",
    "reason",
    "sanitizeValue",
    "admin.schedule.override_enable",
    "admin.login.blocked_outside_schedule",
  ]) {
    if (!js.includes(marker)) throw new Error(`UI script missing marker: ${marker}`);
  }
  assertStaticNoSecretLeak("admin audit security app.js", js);
  const css = await fetchText(`${webBase}/admin/audit-security/styles.css`, "admin audit security styles.css");
  if (!css.includes(".summary-grid") || !css.includes(".badge")) throw new Error("UI stylesheet missing summary or badge styles.");
  assertStaticNoSecretLeak("admin audit security styles.css", css);
  console.log("Static audit security UI route: PASS");
}

async function seedAuditEvents(baseUrl, ownerAuth, targetAdmin) {
  await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetAdmin.id)}/role`, {
    method: "PATCH",
    authValue: ownerAuth,
    label: "audit role update",
    body: { role: "support", permissions: ["members.view", "reports.view"], reason: "local audit role update" },
  });

  await apiRequest(baseUrl, `/admin/work-schedules/${encodeURIComponent(targetAdmin.id)}`, {
    method: "PATCH",
    authValue: ownerAuth,
    label: "audit schedule update",
    body: {
      enabled: true,
      timezone: "Asia/Bangkok",
      allowedDays: ["MONDAY"],
      startTime: "23:00",
      endTime: "23:01",
      forceLogoutWhenScheduleEnds: true,
      idleTimeoutMinutes: 60,
      reason: "local audit security schedule update",
    },
  });

  await apiRequest(baseUrl, `/admin/work-schedules/${encodeURIComponent(targetAdmin.id)}/override`, {
    method: "POST",
    authValue: ownerAuth,
    label: "audit emergency override",
    body: {
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      reason: "local audit security smoke override",
    },
  });

  await apiRequest(baseUrl, `/admin/work-schedules/${encodeURIComponent(targetAdmin.id)}/override`, {
    method: "DELETE",
    authValue: ownerAuth,
    label: "audit emergency override cleanup",
    body: { reason: "local audit security smoke cleanup" },
  });
}

async function assertPermissionBlock(baseUrl, noPermissionAuth) {
  await apiRequest(baseUrl, "/admin/audit-logs", {
    authValue: noPermissionAuth,
    expectedStatus: 403,
    expectSuccess: false,
    label: "no-permission audit report block",
  });
  console.log("Permission guard block: PASS");
}

function assertRowsShape(label, data) {
  if (!data || !Array.isArray(data.rows)) throw new Error(`${label} must return rows array.`);
  if (!data.summary || typeof data.summary.totalEvents !== "number") throw new Error(`${label} must return summary totals.`);
  assertNoUnsafeValues(label, data);
}

async function assertAuditEndpoints(baseUrl, ownerAuth, ownerId, targetId) {
  const list = await apiRequest(baseUrl, "/admin/audit-logs?limit=100", {
    authValue: ownerAuth,
    label: "audit logs list",
  });
  assertRowsShape("audit logs list", list.data);
  for (const action of ["admin.login.success", "admin.role.update", "admin.schedule.update", "admin.schedule.override_enable"]) {
    if (!list.data.rows.some((row) => row.action === action)) throw new Error(`Audit list missing ${action}.`);
  }
  if (!list.data.rows.some((row) => row.action === "admin.schedule.update" && row.metadata && row.metadata.reason === "local audit security schedule update")) {
    throw new Error("Audit list missing schedule update reason metadata.");
  }
  if (
    !list.data.rows.some(
      (row) =>
        row.action === "admin.role.update" &&
        row.metadata &&
        row.metadata.reason === "local audit role update" &&
        row.metadata.beforeRole &&
        row.metadata.afterRole === "support"
    )
  ) {
    throw new Error("Audit list missing role update reason or before/after metadata.");
  }
  if (!list.data.rows.some((row) => row.ipAddress && !/(?:\d{1,3}\.){3}\d{1,3}/.test(row.ipAddress))) {
    throw new Error("Audit list did not include a masked IP value.");
  }

  const summary = await apiRequest(baseUrl, "/admin/audit-logs/summary?limit=100", {
    authValue: ownerAuth,
    label: "audit logs summary",
  });
  if (!summary.data || summary.data.totalEvents < 1) throw new Error("Audit summary did not count events.");
  if (summary.data.emergencyOverrides < 1) throw new Error("Audit summary did not count emergency overrides.");
  if (summary.data.roleChanges < 1) throw new Error("Audit summary did not count role changes.");
  if (summary.data.scheduleChanges < 1) throw new Error("Audit summary did not count schedule changes.");

  const filters = [
    ["action filter", `/admin/audit-logs?action=${encodeURIComponent("admin.role.update")}&limit=100`, "admin.role.update"],
    ["admin filter", `/admin/audit-logs?adminId=${encodeURIComponent(ownerId)}&limit=100`, null],
    ["target filter", `/admin/audit-logs?targetAdminId=${encodeURIComponent(targetId)}&limit=100`, null],
    ["module filter", "/admin/audit-logs?module=schedule&limit=100", "admin.schedule.update"],
    ["result filter", "/admin/audit-logs?result=success&limit=100", null],
    ["severity filter", "/admin/audit-logs?severity=high&limit=100", "admin.schedule.override_enable"],
  ];
  for (const [label, path, expectedAction] of filters) {
    const filtered = await apiRequest(baseUrl, path, { authValue: ownerAuth, label });
    assertRowsShape(label, filtered.data);
    if (expectedAction && !filtered.data.rows.some((row) => row.action === expectedAction)) {
      throw new Error(`${label} did not include ${expectedAction}.`);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const dateFiltered = await apiRequest(baseUrl, `/admin/audit-logs?dateFrom=${today}&dateTo=${today}T23:59:59.999Z&limit=100`, {
    authValue: ownerAuth,
    label: "date filter",
  });
  assertRowsShape("date filter", dateFiltered.data);

  const empty = await apiRequest(baseUrl, "/admin/audit-logs?action=admin.not_real&limit=100", {
    authValue: ownerAuth,
    label: "empty audit logs",
  });
  assertRowsShape("empty audit logs", empty.data);
  if (empty.data.rows.length !== 0 || empty.data.summary.totalEvents !== 0) {
    throw new Error("Empty audit response must return empty rows and zero summary.");
  }

  console.log("Audit report endpoints: PASS");
}

async function assertSecurityEndpoints(baseUrl, ownerAuth) {
  const list = await apiRequest(baseUrl, "/admin/security-events?limit=100", {
    authValue: ownerAuth,
    label: "security events list",
  });
  assertRowsShape("security events list", list.data);
  for (const action of ["admin.role.update", "admin.schedule.override_enable"]) {
    if (!list.data.rows.some((row) => row.action === action)) throw new Error(`Security events missing ${action}.`);
  }

  const summary = await apiRequest(baseUrl, "/admin/security-events/summary?limit=100", {
    authValue: ownerAuth,
    label: "security events summary",
  });
  if (!summary.data || summary.data.totalEvents < 1) throw new Error("Security summary did not count events.");
  if (summary.data.highSeverityCount < 1) throw new Error("Security summary did not count high severity events.");

  const blocked = await apiRequest(baseUrl, "/admin/security-events?module=login&result=blocked&limit=100", {
    authValue: ownerAuth,
    label: "blocked login filter empty state",
  });
  assertRowsShape("blocked login filter empty state", blocked.data);
  console.log("Security event endpoints: PASS");
}

async function cleanup(baseUrl, ownerAuth, targetId) {
  await apiRequest(baseUrl, `/admin/work-schedules/${encodeURIComponent(targetId)}`, {
    method: "PATCH",
    authValue: ownerAuth,
    label: "audit schedule cleanup",
    body: {
      enabled: false,
      timezone: "Asia/Bangkok",
      allowedDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      startTime: "09:00",
      endTime: "18:00",
      forceLogoutWhenScheduleEnds: true,
      idleTimeoutMinutes: 60,
      reason: "local audit security cleanup schedule",
    },
  });
  await apiRequest(baseUrl, `/admin/admins/${encodeURIComponent(targetId)}/role`, {
    method: "PATCH",
    authValue: ownerAuth,
    label: "audit role cleanup",
    body: { role: "viewer", permissions: null, reason: "local audit role cleanup" },
  });
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    await assertStaticUi(baseUrl);
    const fixture = await ensureLocalFixtures();
    prisma = fixture.prisma;
    const ownerAuth = await loginAdmin(baseUrl, fixture.admins.owner.username);
    const noPermissionAuth = await loginAdmin(baseUrl, fixture.admins.no_permission.username);

    await assertPermissionBlock(baseUrl, noPermissionAuth);
    await seedAuditEvents(baseUrl, ownerAuth, fixture.admins.target);
    await assertAuditEndpoints(baseUrl, ownerAuth, fixture.admins.owner.id, fixture.admins.target.id);
    await assertSecurityEndpoints(baseUrl, ownerAuth);
    await cleanup(baseUrl, ownerAuth, fixture.admins.target.id);

    console.log("Response leak scan: PASS");
    console.log("Admin audit security smoke: PASS");
  } catch (error) {
    console.error("Admin audit security smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
