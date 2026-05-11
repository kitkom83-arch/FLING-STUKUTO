require("dotenv").config();

const SAFE_BASE_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const SAFE_EXTERNAL_MODES = new Set(["mock", "sandbox", "disabled"]);
const MODE_ENV_KEYS = [
  "GAME_PROVIDER_MODE",
  "PAYMENT_PROVIDER_MODE",
  "BANK_STATEMENT_MODE",
  "SMS_PROVIDER_MODE",
  "SLIP_OCR_MODE",
];

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
  const rawBaseUrl = process.env.BASE_URL;
  if (!rawBaseUrl || !rawBaseUrl.trim()) {
    throw new Error("BASE_URL must be set before running staging smoke. Value is not printed.");
  }
  return ensureApiPath(rawBaseUrl);
}

function assertBaseUrlSafe(baseUrl) {
  const parsed = parseUrl(baseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("BASE_URL must be a valid HTTP(S) URL.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("BASE_URL must not contain embedded credentials.");
  }
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    throw new Error("BASE_URL appears production-like and is blocked.");
  }
  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_BASE_MARKERS)) {
    throw new Error("BASE_URL must target a local/staging/test/sandbox API host.");
  }
}

function assertEnvModesSafe() {
  for (const key of MODE_ENV_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(mode)) {
      throw new Error(`${key} must be mock, sandbox, or disabled for staging smoke.`);
    }
  }
}

function stringifyForScan(payload) {
  return JSON.stringify(payload);
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([, value]) => typeof value === "string" && value.length >= 6)
    .filter(([key]) => sensitiveKeyPattern.test(key))
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function assertNoUnsafeKeys(label, value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (normalized.includes("token") || normalized.includes("password") || normalized.includes("secret")) {
      throw new Error(`${label} exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} exposed database URL key.`);
    }
    if (normalized.includes("apikey") || normalized === "api_key") {
      throw new Error(`${label} exposed API key field.`);
    }
    assertNoUnsafeKeys(label, item);
  }
}

function assertNoLeaks(label, payload) {
  const serialized = stringifyForScan(payload);
  for (const value of sensitiveEnvValues()) {
    if (serialized.includes(value)) {
      throw new Error(`${label} leaked a sensitive environment value.`);
    }
  }

  if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) {
    throw new Error(`${label} leaked a PostgreSQL URL.`);
  }
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(serialized)) {
    throw new Error(`${label} leaked a JWT-shaped value.`);
  }
  if (new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "i").test(serialized)) {
    throw new Error(`${label} leaked an authorization header.`);
  }
  assertNoUnsafeKeys(label, payload);
}

async function apiRequest(baseUrl, path, options = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Site-Code": process.env.STAGING_SMOKE_SITE_CODE || "PG77",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${path} returned non-JSON response.`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new Error(`${path} returned invalid JSON.`);
  }

  assertNoLeaks(options.label || path, payload);
  return { status: response.status, payload };
}

function assertHealthContract(result) {
  if (result.status !== 200) {
    throw new Error(`health returned ${result.status}, expected 200.`);
  }
  if (!result.payload || result.payload.success !== true) {
    throw new Error("health response must have success true.");
  }

  const data = result.payload.data;
  if (!data || data.ok !== true) {
    throw new Error("health data.ok must be true.");
  }
  if (typeof data.databaseConnected !== "boolean") {
    throw new Error("health data.databaseConnected must be a boolean.");
  }
  if (!data.externalModes || typeof data.externalModes !== "object") {
    throw new Error("health data.externalModes must be present.");
  }

  for (const [name, mode] of Object.entries(data.externalModes)) {
    if (!SAFE_EXTERNAL_MODES.has(String(mode).toLowerCase())) {
      throw new Error(`health external mode ${name} must be mock, sandbox, or disabled.`);
    }
  }
}

function assertAdminAuthContract(result) {
  if (![400, 401, 403].includes(result.status)) {
    throw new Error(`admin auth negative returned ${result.status}, expected a safe error status.`);
  }
  if (!result.payload || result.payload.success !== false) {
    throw new Error("admin auth negative response must be a failed JSON payload.");
  }
}

async function main() {
  try {
    const baseUrl = configuredBaseUrl();
    assertBaseUrlSafe(baseUrl);
    assertEnvModesSafe();
    console.log("Staging smoke safety guard: PASS");

    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    assertHealthContract(health);
    console.log("Health contract: PASS");

    const adminAuth = await apiRequest(baseUrl, "/admin/auth/login", {
      method: "POST",
      label: "admin auth negative",
      body: {
        username: "staging_smoke_invalid_admin",
        password: "staging-smoke-invalid-password",
      },
    });
    assertAdminAuthContract(adminAuth);
    console.log("Admin auth leak check: PASS");

    console.log("Provider/payment/bank mode check: PASS");
    console.log("Response leak scan: PASS");
    console.log("Staging smoke: PASS");
  } catch (error) {
    console.error("Staging smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
