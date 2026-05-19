const {
  SAFE_EXTERNAL_MODES,
  ensureApiPath,
  evaluateStagingSafety,
  inspectBaseUrl,
} = require("./stagingSafety");

const DEFAULT_BASE_URL = "https://stukuto-real-core-staging.onrender.com/api";
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.STAGING_DEMO_ADMIN_EMAIL || process.env.STAGING_DEMO_ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.STAGING_DEMO_ADMIN_PASSWORD || "";
const MEMBER_USERNAME = process.env.STAGING_DEMO_MEMBER_USERNAME || "";
const MEMBER_PHONE = process.env.STAGING_DEMO_MEMBER_PHONE || "";
const MEMBER_PASSWORD = process.env.STAGING_DEMO_MEMBER_PASSWORD || "";
const SAFE_ROLE_NAME = process.env.STAGING_SAFE_ROLE_NAME || "";
const INVALID_ADMIN_PASSWORD = "staging-release-gate-invalid-admin-login-check";
const issuedAuthValues = new Set();

function configuredBaseUrl() {
  return ensureApiPath(process.env.BASE_URL || DEFAULT_BASE_URL);
}

function printSafeBoundary() {
  console.log("no production DB used");
  console.log("no real provider/payment/bank/SMS/Slip OCR used");
  console.log("no real money payout");
}

function skipSafe(reason) {
  console.log("Staging release gate smoke: SKIPPED by safety guard");
  console.log(`reason: ${reason}`);
  printSafeBoundary();
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isStagingApiUrl(baseUrl) {
  const parsed = new URL(baseUrl);
  const tokens = tokenize(`${parsed.hostname} ${parsed.pathname}`);
  return parsed.protocol === "https:" && tokens.some((token) => ["stage", "staging", "qa", "sandbox"].includes(token));
}

function webBaseFromApi(baseUrl) {
  const parsed = new URL(baseUrl);
  return `${parsed.protocol}//${parsed.host}`;
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([, value]) => typeof value === "string" && value.length >= 8)
    .filter(([key]) => sensitiveKeyPattern.test(key))
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function sanitizeStringForLog(value) {
  let safe = String(value || "");
  for (const sensitiveValue of sensitiveEnvValues()) {
    safe = safe.split(sensitiveValue).join("[redacted]");
  }
  return safe
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]")
    .replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, "[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+/gi, "[redacted]")
    .replace(/password/gi, "credential")
    .replace(/token/gi, "credential")
    .replace(/secret/gi, "credential")
    .replace(/authorization/gi, "credential")
    .replace(/database_url/gi, "database-redacted");
}

function sanitizeForLog(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const safeKey = sanitizeStringForLog(key);
        if (/(password|token|secret|authorization|refresh|session|database|api_?key|jwt)/i.test(key)) {
          return [safeKey, "[redacted]"];
        }
        return [safeKey, sanitizeForLog(item)];
      })
    );
  }
  if (typeof value === "string") return sanitizeStringForLog(value);
  return value;
}

function safePayloadSummary(payload) {
  const serialized = JSON.stringify(sanitizeForLog(payload));
  return serialized.length > 800 ? `${serialized.slice(0, 800)}...` : serialized;
}

async function safeNonJsonSummary(response) {
  let body = "";
  try {
    body = await response.text();
  } catch (_error) {
    body = "";
  }
  const contentType = sanitizeStringForLog(response.headers.get("content-type") || "");
  const preview = sanitizeStringForLog(body).replace(/\s+/g, " ").trim().slice(0, 120);
  return `status=${response.status}; content-type=${contentType || "missing"}; preview=${preview || "[empty]"}`;
}

function isSafeDemoMemberPhone(value) {
  return Boolean(value) && !/^\d+$/.test(value) && !/^0[89]\d{8}$/.test(value) && /(demo|staging|test)/i.test(value);
}

function assertNoUnsafeKeys(label, value, { allowAuthToken = false } = {}) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item, { allowAuthToken });
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    const allowedToken = allowAuthToken && normalized === "token";
    if (!allowedToken && /(password|token|secret|authorization|refresh|session|jwt)/i.test(normalized)) {
      throw new Error(`${label} exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} exposed database URL key.`);
    }
    if (normalized === "api_key" || normalized.includes("apikey")) {
      throw new Error(`${label} exposed API key field.`);
    }
    assertNoUnsafeKeys(label, item, { allowAuthToken });
  }
}

function assertNoLeaks(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");

  for (const value of sensitiveEnvValues()) {
    if (serialized.includes(value)) throw new Error(`${label} leaked a sensitive environment value.`);
  }
  if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) throw new Error(`${label} leaked a PostgreSQL URL.`);
  if (!allowAuthToken && /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(serialized)) {
    throw new Error(`${label} leaked a JWT-shaped value.`);
  }
  if (lower.includes(authScheme)) throw new Error(`${label} leaked an authorization scheme marker.`);
  if (/(Error:\s.+\n\s+at\s+)|(\"stack\"\s*:)/i.test(serialized)) throw new Error(`${label} leaked a raw internal stack.`);
  if (!allowAuthToken) {
    for (const authValue of issuedAuthValues) {
      if (authValue && serialized.includes(authValue)) throw new Error(`${label} echoed an authorization value.`);
    }
  }
  assertNoUnsafeKeys(label, payload, { allowAuthToken });
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (options.authValue) headers.Authorization = `${["Be", "arer"].join("")} ${options.authValue}`;

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(`API request failed for ${path}: ${sanitizeStringForLog(error.message)}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${sanitizeStringForLog(path)} returned non-JSON response. ${await safeNonJsonSummary(response)}`);
  }

  const payload = await response.json();
  const allowAuthToken = Boolean(options.allowAuthToken && response.status >= 200 && response.status < 300);
  assertNoLeaks(options.label || path, payload, { allowAuthToken });

  if (options.expectedStatuses && !options.expectedStatuses.includes(response.status)) {
    throw new Error(
      `${options.label || path} returned ${response.status}, expected ${options.expectedStatuses.join(" or ")}. Sanitized response body: ${safePayloadSummary(payload)}`
    );
  }
  if (options.expectSuccess === false) {
    if (!payload || payload.success !== false) throw new Error(`${options.label || path} returned unexpected success payload.`);
    return { status: response.status, payload, data: payload.data };
  }
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(
      `${options.label || path} blocked with ${response.status}: ${payload && payload.message ? sanitizeStringForLog(payload.message) : "request failed"}`
    );
  }
  return { status: response.status, payload, data: payload.data };
}

async function webRequest(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: options.accept || "text/html,application/json,*/*",
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    redirect: "manual",
  });
  const text = await response.text();
  assertNoStaticLeaks(options.label || url, text);
  return { response, text };
}

function assertNoStaticLeaks(label, text) {
  for (const value of sensitiveEnvValues()) {
    if (value && text.includes(value)) throw new Error(`${label} leaked a sensitive environment value.`);
  }
  if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(text)) throw new Error(`${label} leaked a PostgreSQL URL.`);
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) {
    throw new Error(`${label} leaked a JWT-shaped value.`);
  }
  if (/\bBearer\s+[A-Za-z0-9._-]+/i.test(text)) throw new Error(`${label} leaked an authorization scheme marker.`);
}

function assertHealth(result) {
  if (result.status !== 200 || !result.data || result.data.ok !== true || result.data.status !== "ok") {
    throw new Error(`Health returned ${result.status}, expected 200 ok.`);
  }
  if (result.data.databaseConnected !== true) {
    throw new Error("Health databaseConnected must be true for release gate.");
  }
  const appEnv = String((result.data.environment && result.data.environment.appEnv) || "").toLowerCase();
  if (!["staging", "stage", "qa", "sandbox", "test", "testing"].includes(appEnv)) {
    throw new Error("Health environment.appEnv must be a safe staging/test label.");
  }
  for (const [name, mode] of Object.entries(result.data.externalModes || {})) {
    const normalized = String(mode).toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(normalized) || normalized === "live") {
      throw new Error(`Health external mode ${name} must not be live.`);
    }
  }
}

function assertRowsSummaryShape(label, data) {
  if (!data || !Array.isArray(data.rows)) throw new Error(`${label} must return rows array.`);
  if (!data.summary || typeof data.summary.totalEvents !== "number") throw new Error(`${label} must return summary totalEvents.`);
}

async function assertUnknownAdminAuthFailure(baseUrl) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    expectedStatuses: [400, 401, 403],
    expectSuccess: false,
    label: "unknown admin auth negative",
    body: {
      username: "staging_release_gate_invalid_admin",
      password: INVALID_ADMIN_PASSWORD,
    },
  });
  if (![400, 401, 403].includes(result.status)) throw new Error("Unknown admin auth negative did not fail safely.");
}

async function loginDemoAdmin(baseUrl) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "staging release gate demo admin login",
    body: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  });
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`Demo admin login returned ${result.status}, expected 200 with credential.`);
  }
  issuedAuthValues.add(result.data.token);
  return result.data.token;
}

async function loginDemoMember(baseUrl) {
  const loginIdentifier = MEMBER_USERNAME || MEMBER_PHONE;
  const missing = [];
  if (!loginIdentifier) missing.push("STAGING_DEMO_MEMBER_USERNAME or STAGING_DEMO_MEMBER_PHONE");
  if (!MEMBER_PASSWORD) missing.push("STAGING_DEMO_MEMBER_PASSWORD");
  if (missing.length) throw new Error(`Missing ${missing.join(", ")} env for release gate member read-only checks.`);
  if (MEMBER_USERNAME && MEMBER_USERNAME.length > 64) {
    throw new Error("STAGING_DEMO_MEMBER_USERNAME must be 1-64 characters when provided.");
  }
  if (MEMBER_PHONE && !isSafeDemoMemberPhone(MEMBER_PHONE)) {
    throw new Error("STAGING_DEMO_MEMBER_PHONE must be a non-real staging/test/demo login value when provided.");
  }

  const result = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "staging release gate demo member login",
    body: { phone: loginIdentifier, password: MEMBER_PASSWORD },
  });
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`Demo member login returned ${result.status}, expected 200 with credential.`);
  }
  issuedAuthValues.add(result.data.token);
  return result.data.token;
}

async function assertAdminReadOnlyRegression(baseUrl, authValue) {
  const me = await apiRequest(baseUrl, "/admin/permissions/me", {
    authValue,
    label: "release gate admin permissions me",
  });
  if (!me.data || !Array.isArray(me.data.permissions)) throw new Error("Admin permissions/me response shape invalid.");

  const catalog = await apiRequest(baseUrl, "/admin/permissions/catalog", {
    authValue,
    label: "release gate permission catalog",
  });
  if (!Array.isArray(catalog.data)) throw new Error("Permission catalog response shape invalid.");

  const roles = await apiRequest(baseUrl, "/admin/roles", {
    authValue,
    label: "release gate role list",
  });
  if (!Array.isArray(roles.data)) throw new Error("Role list response shape invalid.");

  const config = await apiRequest(baseUrl, "/admin/wheel/config", {
    authValue,
    label: "release gate admin wheel config",
  });
  if (!config.data || !config.data.campaign || !Array.isArray(config.data.rewards)) {
    throw new Error("Admin wheel config response shape invalid.");
  }

  const spins = await apiRequest(baseUrl, "/admin/wheel/spins?limit=20", {
    authValue,
    label: "release gate admin wheel spins",
  });
  if (!Array.isArray(spins.data)) throw new Error("Admin wheel spins response shape invalid.");

  const memberRewards = await apiRequest(baseUrl, "/admin/wheel/member-rewards?limit=20", {
    authValue,
    label: "release gate admin wheel member rewards",
  });
  if (!memberRewards.data || !Array.isArray(memberRewards.data.rows)) {
    throw new Error("Admin wheel member rewards response shape invalid.");
  }

  const audit = await apiRequest(baseUrl, "/admin/audit-logs?limit=10", {
    authValue,
    label: "release gate admin audit logs",
  });
  assertRowsSummaryShape("release gate admin audit logs", audit.data);
}

async function assertBrowserRouteContract(baseUrl) {
  const webBase = webBaseFromApi(baseUrl);
  const routes = ["/admin", "/admin/roles", "/admin-wheel", "/admin/audit-security", "/admin/work-schedules"];
  for (const route of routes) {
    const { response, text } = await webRequest(`${webBase}${route}`, { label: `GET ${route}` });
    if (response.status !== 200) throw new Error(`${route} returned ${response.status}, expected 200.`);
    if (!String(response.headers.get("content-type") || "").includes("text/html")) {
      throw new Error(`${route} must return HTML.`);
    }
    if (!text.toLowerCase().includes("<!doctype html>")) throw new Error(`${route} did not return an HTML document.`);
  }

  const apiMiss = await webRequest(`${webBase}/api/__staging_release_gate_static_boundary__`, {
    label: "GET /api static boundary",
    accept: "application/json,*/*",
  });
  const apiContentType = apiMiss.response.headers.get("content-type") || "";
  if (!apiContentType.toLowerCase().includes("application/json")) {
    throw new Error("/api/* boundary must return JSON, not static HTML.");
  }
  if (apiMiss.text.toLowerCase().includes("<!doctype html>")) throw new Error("/api/* boundary returned static HTML.");

  const login = await webRequest(`${webBase}/admin/auth/login`, {
    method: "POST",
    label: "POST /admin/auth/login browser JSON boundary",
    accept: "application/json,*/*",
    body: { username: "staging_release_gate_invalid_admin", password: INVALID_ADMIN_PASSWORD },
  });
  const loginContentType = login.response.headers.get("content-type") || "";
  if (!loginContentType.toLowerCase().includes("application/json")) {
    throw new Error("/admin/auth/login must return JSON.");
  }
  if (login.text.toLowerCase().includes("<!doctype html>")) throw new Error("/admin/auth/login returned static HTML.");
  const payload = JSON.parse(login.text);
  assertNoLeaks("POST /admin/auth/login browser JSON boundary", payload);
  if (!payload || payload.success !== false) throw new Error("/admin/auth/login boundary must fail safely.");
}

async function assertMemberLuckyWheelReadOnlyRegression(baseUrl, authValue) {
  const config = await apiRequest(baseUrl, "/member/wheel/config", {
    authValue,
    label: "release gate member wheel config",
  });
  if (!config.data || !config.data.campaignId || !Array.isArray(config.data.rewards)) {
    throw new Error("Member wheel config response shape invalid.");
  }
  if (config.data.rewards.some((reward) => Object.prototype.hasOwnProperty.call(reward, "probabilityWeight"))) {
    throw new Error("Member wheel config exposed probabilityWeight.");
  }

  const history = await apiRequest(baseUrl, "/member/wheel/history?limit=20", {
    authValue,
    label: "release gate member wheel history",
  });
  if (!Array.isArray(history.data)) throw new Error("Member wheel history response shape invalid.");

  const rewards = await apiRequest(baseUrl, "/member/wheel/my-rewards?limit=20", {
    authValue,
    label: "release gate member wheel my rewards",
  });
  if (!Array.isArray(rewards.data)) throw new Error("Member wheel my-rewards response shape invalid.");
}

function safeRoleName(value) {
  const role = String(value || "").trim().toLowerCase();
  if (!role) return "";
  if (!/^[a-z0-9_:-]{3,64}$/.test(role)) throw new Error("STAGING_SAFE_ROLE_NAME must be 3-64 safe characters.");
  if (role === "owner" || role === "super_admin" || role === "admin.manage") {
    throw new Error("STAGING_SAFE_ROLE_NAME must not be owner, super_admin, or admin.manage.");
  }
  if (!/(staging|stage|demo|test|sandbox|qa|uat)/i.test(role)) {
    throw new Error("STAGING_SAFE_ROLE_NAME must be a staging/demo/test/sandbox/qa/uat role.");
  }
  return role;
}

async function assertRolePermissionReadOnlyRegression(baseUrl, authValue) {
  const role = safeRoleName(SAFE_ROLE_NAME);
  if (role) {
    const detail = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}`, {
      authValue,
      label: "release gate safe role detail",
    });
    if (!detail.data || !Array.isArray(detail.data.permissions)) throw new Error("Safe role detail response shape invalid.");
  } else {
    console.log("Safe role detail read: SKIPPED");
    console.log("reason: STAGING_SAFE_ROLE_NAME env is not set");
  }

  const audit = await apiRequest(
    baseUrl,
    `/admin/audit-logs?action=${encodeURIComponent("admin.role.permissions.update")}&limit=10`,
    {
      authValue,
      label: "release gate role permission audit logs",
    }
  );
  assertRowsSummaryShape("release gate role permission audit logs", audit.data);
}

async function main() {
  try {
    const safety = evaluateStagingSafety(process.env, {
      requireDatabaseUrl: false,
      allowSkipSafe: true,
    });
    if (safety.failed) {
      throw new Error(`Staging release gate safety guard: BLOCKED\n- ${safety.failReasons.join("\n- ")}`);
    }

    const baseUrl = configuredBaseUrl();
    const target = inspectBaseUrl("BASE_URL", baseUrl);
    if (!target.ok) throw new Error(target.reason);
    if (!isStagingApiUrl(baseUrl)) {
      throw new Error("BASE_URL must be an HTTPS staging/QA/sandbox API URL for release gate smoke.");
    }
    console.log("Staging release gate safety guard: PASS");

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      skipSafe("missing STAGING_DEMO_ADMIN_EMAIL/USERNAME or STAGING_DEMO_ADMIN_PASSWORD env");
      return;
    }
    if (!(MEMBER_USERNAME || MEMBER_PHONE) || !MEMBER_PASSWORD) {
      skipSafe("missing STAGING_DEMO_MEMBER_USERNAME/PHONE or STAGING_DEMO_MEMBER_PASSWORD env");
      return;
    }

    const health = await apiRequest(baseUrl, "/health", { label: "release gate health" });
    assertHealth(health);
    console.log("Health/database/mode contract: PASS");

    await assertUnknownAdminAuthFailure(baseUrl);
    console.log("Admin auth negative JSON contract: PASS");

    const adminAuthValue = await loginDemoAdmin(baseUrl);
    console.log("Demo admin auth: PASS");

    await assertAdminReadOnlyRegression(baseUrl, adminAuthValue);
    console.log("Admin read-only regression: PASS");

    await assertBrowserRouteContract(baseUrl);
    console.log("Browser route contract: PASS");

    const memberAuthValue = await loginDemoMember(baseUrl);
    console.log("Demo member auth: PASS");

    await assertMemberLuckyWheelReadOnlyRegression(baseUrl, memberAuthValue);
    console.log("Member Lucky Wheel read-only regression: PASS");
    console.log("Member wheel spin is intentionally not consumed in release gate.");

    await assertRolePermissionReadOnlyRegression(baseUrl, adminAuthValue);
    console.log("Role permission read-only regression: PASS");

    console.log("Response leak scan: PASS");
    printSafeBoundary();
    console.log("Staging release gate smoke: PASS");
  } catch (error) {
    console.error("Staging release gate smoke: FAIL");
    console.error(sanitizeStringForLog(error.message));
    printSafeBoundary();
    process.exitCode = 1;
  }
}

main();
