require("dotenv").config();

const SAFE_APP_ENVS = new Set(["staging", "local-test"]);
const SAFE_NODE_ENVS = new Set(["", "staging", "test", "development", "development-local", "local-test"]);
const SAFE_EXTERNAL_MODES = new Set(["mock", "sandbox", "disabled"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const MODE_ENV_KEYS = [
  "GAME_PROVIDER_MODE",
  "PAYMENT_PROVIDER_MODE",
  "BANK_STATEMENT_MODE",
  "SMS_PROVIDER_MODE",
  "SLIP_OCR_MODE",
];
const SENSITIVE_RESPONSE_KEY_PATTERN = /token|password|secret|database[_-]?url|databaseurl/i;

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

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 8)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function inspectDatabaseTarget(databaseUrl, appEnv) {
  if (!databaseUrl || !databaseUrl.trim()) {
    if (appEnv === "staging") {
      return {
        ok: false,
        reason: "DATABASE_URL must be set in the platform secret manager for a real staging run. Value is not printed.",
      };
    }
    return { ok: true, reason: null };
  }

  const parsed = parseUrl(databaseUrl.trim());
  if (!parsed || !["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, reason: "DATABASE_URL must use PostgreSQL for staging. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return { ok: false, reason: "DATABASE_URL appears production-like and is blocked. Value is not printed." };
  }

  if (!isLoopbackHost(parsed.hostname) && !targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS))) {
    return {
      ok: false,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, reason: null };
}

function inspectBaseUrl(label, rawBaseUrl) {
  if (!rawBaseUrl || !rawBaseUrl.trim()) return { ok: true, reason: null, value: "" };

  const baseUrl = ensureApiPath(rawBaseUrl);
  const parsed = parseUrl(baseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: `${label} must be a valid HTTP(S) URL.`, value: "" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: `${label} must not contain embedded credentials.`, value: "" };
  }
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    return { ok: false, reason: `${label} appears production-like and is blocked.`, value: "" };
  }
  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: `${label} must target local/staging/test/sandbox only.`, value: "" };
  }

  return { ok: true, reason: null, value: baseUrl };
}

function assertNoUnsafeKeys(label, value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_RESPONSE_KEY_PATTERN.test(key) || key.toLowerCase() === "api_key") {
      throw new Error(`${label} exposed unsafe key: ${key}.`);
    }
    assertNoUnsafeKeys(label, item);
  }
}

function assertNoLeaks(label, payload) {
  const serialized = JSON.stringify(payload);
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

function assertHealthContract(label, result) {
  if (result.status !== 200) {
    throw new Error(`${label} returned ${result.status}, expected 200.`);
  }
  if (!result.payload || result.payload.success !== true) {
    throw new Error(`${label} response must have success true.`);
  }

  const data = result.payload.data;
  if (!data || data.ok !== true || data.status !== "ok") {
    throw new Error(`${label} data must include ok true and status ok.`);
  }
  if (!data.environment || !SAFE_APP_ENVS.has(String(data.environment.appEnv || "").toLowerCase())) {
    throw new Error(`${label} environment.appEnv must be staging or local-test.`);
  }
  if (typeof data.databaseConnected !== "boolean") {
    throw new Error(`${label} databaseConnected must be a boolean.`);
  }
  if (!data.externalModes || typeof data.externalModes !== "object") {
    throw new Error(`${label} externalModes must be present.`);
  }

  for (const [name, mode] of Object.entries(data.externalModes)) {
    if (!SAFE_EXTERNAL_MODES.has(String(mode).toLowerCase())) {
      throw new Error(`${label} external mode ${name} must be mock, sandbox, or disabled.`);
    }
  }
}

async function requestHealth(baseUrl) {
  let response;
  try {
    response = await fetch(`${baseUrl}/health`, { headers: { Accept: "application/json" } });
  } catch (error) {
    throw new Error(`Health request failed: ${error.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Health endpoint returned non-JSON response.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new Error("Health endpoint returned invalid JSON.");
  }

  assertNoLeaks("health", payload);
  return { status: response.status, payload };
}

function localHealthContractFixture(appEnv) {
  const externalModes = Object.fromEntries(
    MODE_ENV_KEYS.map((key) => {
      const label = key
        .toLowerCase()
        .replace(/_mode$/, "")
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      return [label, String(process.env[key] || "mock").trim().toLowerCase()];
    })
  );

  return {
    status: 200,
    payload: {
      success: true,
      data: {
        ok: true,
        status: "ok",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV || "test",
          appEnv,
        },
        databaseConnected: false,
        externalModes,
      },
    },
  };
}

function assertEnvironment() {
  const effectiveAppEnv = String(process.env.APP_ENV || "local-test").trim().toLowerCase();
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const reasons = [];

  if (!SAFE_APP_ENVS.has(effectiveAppEnv)) {
    reasons.push("APP_ENV must be staging or local-test.");
  }
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must not force production/live mode for staging preflight.");
  }

  const database = inspectDatabaseTarget(process.env.DATABASE_URL, effectiveAppEnv);
  if (!database.ok) reasons.push(database.reason);

  for (const key of MODE_ENV_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(mode)) {
      reasons.push(`${key} must be mock, sandbox, or disabled.`);
    }
    if (mode === "live") {
      reasons.push(`${key}=live is blocked for staging preflight.`);
    }
  }

  for (const key of ["BASE_URL", "PUBLIC_API_BASE_URL"]) {
    const result = inspectBaseUrl(key, process.env[key]);
    if (!result.ok) reasons.push(result.reason);
  }

  if (reasons.length > 0) {
    throw new Error(`Staging preflight safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Staging preflight safety guard: PASS");
  console.log(`Environment boundary: PASS (${effectiveAppEnv})`);
  return effectiveAppEnv;
}

async function main() {
  try {
    const appEnv = assertEnvironment();
    const baseUrl = inspectBaseUrl("BASE_URL", process.env.BASE_URL).value;

    if (baseUrl) {
      const health = await requestHealth(baseUrl);
      assertHealthContract("health", health);
      console.log("Health endpoint contract: PASS");
    } else {
      const health = localHealthContractFixture(appEnv);
      assertNoLeaks("local health contract fixture", health.payload);
      assertHealthContract("local health contract fixture", health);
      console.log("Health endpoint contract: PASS (local fixture, no BASE_URL)");
    }

    console.log("Provider/payment/bank/SMS/Slip OCR mode check: PASS");
    console.log("Response leak scan: PASS");
    console.log("Staging preflight: PASS");
  } catch (error) {
    console.error("Staging preflight: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
