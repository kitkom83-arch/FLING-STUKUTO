const { SAFE_EXTERNAL_MODES, ensureApiPath, inspectBaseUrl } = require("./stagingSafety");

const DEFAULT_BASE_URL = "https://fling-stukuto-staging-api.onrender.com/api";
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.STAGING_DEMO_ADMIN_USERNAME || "admin";
const INVALID_ADMIN_PASSWORD = "staging-uat-invalid-admin-login-check";
const issuedAuthValues = new Set();

function configuredBaseUrl() {
  return ensureApiPath(process.env.BASE_URL || DEFAULT_BASE_URL);
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 8)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
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
    if (!allowedToken && /(password|token|secret|authorization|refresh|session)/i.test(normalized)) {
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
  if (!allowAuthToken) {
    for (const authValue of issuedAuthValues) {
      if (authValue && serialized.includes(authValue)) throw new Error(`${label} echoed an authorization token.`);
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
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${path} returned non-JSON response.`);
  }

  const payload = await response.json();
  assertNoLeaks(options.label || path, payload, { allowAuthToken: Boolean(options.allowAuthToken) });
  return { status: response.status, payload, data: payload.data };
}

function assertHealth(result) {
  if (result.status !== 200 || !result.payload || result.payload.success !== true) {
    throw new Error(`Health returned ${result.status}, expected 200 success.`);
  }
  const data = result.data;
  if (!data || data.ok !== true || data.status !== "ok") {
    throw new Error("Health response must include ok true and status ok.");
  }
  if (data.databaseConnected !== true) {
    throw new Error("Health databaseConnected must be true for staging UAT readiness.");
  }
  if (!data.environment || String(data.environment.appEnv || "").toLowerCase() !== "staging") {
    throw new Error("Health environment.appEnv must be staging.");
  }
  for (const [name, mode] of Object.entries(data.externalModes || {})) {
    const normalized = String(mode).toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(normalized) || normalized === "live") {
      throw new Error(`Health external mode ${name} must not be live.`);
    }
  }
}

function assertAdminAuthSafeFailure(label, result) {
  if (![400, 401, 403].includes(result.status) || !result.payload || result.payload.success !== false) {
    throw new Error(`${label} returned ${result.status}, expected safe failure.`);
  }
}

async function assertUnknownAdminAuthFailure(baseUrl) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    label: "unknown admin auth negative",
    body: {
      username: "staging_uat_invalid_admin",
      password: INVALID_ADMIN_PASSWORD,
    },
  });
  assertAdminAuthSafeFailure("Unknown admin auth negative", result);
}

async function assertDemoAdminWrongPasswordFailure(baseUrl, realPassword) {
  const invalidPassword =
    realPassword === INVALID_ADMIN_PASSWORD ? "staging-uat-invalid-admin-login-check-alt" : INVALID_ADMIN_PASSWORD;
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    label: "demo admin wrong password negative",
    body: {
      username: ADMIN_USERNAME,
      password: invalidPassword,
    },
  });
  assertAdminAuthSafeFailure("Demo admin wrong password negative", result);
}

async function loginDemoAdmin(baseUrl) {
  const password = process.env.LOCAL_ADMIN_PASSWORD || process.env.STAGING_DEMO_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Missing staging demo admin password env. Value is not printed.");
  }
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "staging demo admin login",
    body: { username: ADMIN_USERNAME, password },
  });
  if (result.status === 400 || result.status === 401 || result.status === 403) {
    throw new Error(`Missing staging demo admin ${ADMIN_USERNAME} or staging password mismatch.`);
  }
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`Staging demo admin login returned ${result.status}, expected 200 with token.`);
  }
  issuedAuthValues.add(result.data.token);
  console.log(`Demo admin auth: PASS (${ADMIN_USERNAME})`);
  return result.data.token;
}

function assertRowsSummaryShape(label, data) {
  if (!data || !Array.isArray(data.rows)) throw new Error(`${label} must return rows array.`);
  if (!data.summary || typeof data.summary.totalEvents !== "number") {
    throw new Error(`${label} must return summary totalEvents.`);
  }
}

async function assertAdminEndpoints(baseUrl, authValue) {
  const schedules = await apiRequest(baseUrl, "/admin/work-schedules?limit=20", {
    authValue,
    label: "admin work schedule list",
  });
  if (schedules.status !== 200 || !Array.isArray(schedules.data)) {
    throw new Error(`Admin work schedule endpoint returned ${schedules.status}, expected 200 array.`);
  }
  console.log("Admin work schedule endpoint: PASS");

  const audit = await apiRequest(baseUrl, "/admin/audit-logs?limit=20", {
    authValue,
    label: "admin audit logs",
  });
  if (audit.status !== 200) throw new Error(`Admin audit logs returned ${audit.status}, expected 200.`);
  assertRowsSummaryShape("admin audit logs", audit.data);

  const auditSummary = await apiRequest(baseUrl, "/admin/audit-logs/summary?limit=20", {
    authValue,
    label: "admin audit summary",
  });
  if (auditSummary.status !== 200 || !auditSummary.data || typeof auditSummary.data.totalEvents !== "number") {
    throw new Error(`Admin audit summary returned ${auditSummary.status}, expected summary.`);
  }

  const security = await apiRequest(baseUrl, "/admin/security-events?limit=20", {
    authValue,
    label: "admin security events",
  });
  if (security.status !== 200) throw new Error(`Admin security events returned ${security.status}, expected 200.`);
  assertRowsSummaryShape("admin security events", security.data);

  const securitySummary = await apiRequest(baseUrl, "/admin/security-events/summary?limit=20", {
    authValue,
    label: "admin security summary",
  });
  if (securitySummary.status !== 200 || !securitySummary.data || typeof securitySummary.data.totalEvents !== "number") {
    throw new Error(`Admin security summary returned ${securitySummary.status}, expected summary.`);
  }
  console.log("Admin audit/security endpoints: PASS");
}

async function main() {
  try {
    const baseUrl = configuredBaseUrl();
    const target = inspectBaseUrl("BASE_URL", baseUrl);
    if (!target.ok) throw new Error(target.reason);
    console.log("Staging UAT smoke safety guard: PASS");

    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    assertHealth(health);
    console.log("Health/database/mode contract: PASS");

    await assertUnknownAdminAuthFailure(baseUrl);
    console.log("Unknown admin auth negative leak check: PASS");

    const authValue = await loginDemoAdmin(baseUrl);
    const demoAdminPassword = process.env.LOCAL_ADMIN_PASSWORD || process.env.STAGING_DEMO_ADMIN_PASSWORD;
    await assertDemoAdminWrongPasswordFailure(baseUrl, demoAdminPassword);
    console.log("Demo admin wrong password negative leak check: PASS");
    await assertAdminEndpoints(baseUrl, authValue);

    console.log("Response leak scan: PASS");
    console.log("Staging UAT smoke: PASS");
  } catch (error) {
    console.error("Staging UAT smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
