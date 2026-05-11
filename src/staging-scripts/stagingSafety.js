require("dotenv").config();

const SAFE_APP_ENVS = new Set(["staging", "stage", "test", "testing", "qa", "sandbox", "local-test"]);
const SAFE_NODE_ENVS = new Set(["", "production", "staging", "stage", "test", "development", "development-local", "local-test"]);
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

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) {
    return { ok: false, reason: "DATABASE_URL must be set to a staging/test PostgreSQL target. Value is not printed." };
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return { ok: false, reason: "DATABASE_URL appears production-like and is blocked. Value is not printed." };
  }
  if (!isLoopbackHost(parsed.hostname) && !targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS))) {
    return { ok: false, reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed." };
  }

  return { ok: true, reason: null };
}

function inspectBaseUrl(label, rawBaseUrl) {
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

function evaluateStagingSafety(env = process.env, options = {}) {
  const reasons = [];
  const appEnv = String(env.APP_ENV || "local-test").trim().toLowerCase();
  const nodeEnv = String(env.NODE_ENV || "").trim().toLowerCase();

  if (!SAFE_APP_ENVS.has(appEnv)) {
    reasons.push("APP_ENV must be staging, test, qa, sandbox, or local-test.");
  }
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be a safe runtime label.");
  }
  if (nodeEnv === "production" && !["staging", "stage", "test", "testing", "qa", "sandbox"].includes(appEnv)) {
    reasons.push("NODE_ENV=production is allowed only when APP_ENV is an explicit staging/test label.");
  }
  if (["prod", "production", "live"].includes(appEnv)) {
    reasons.push("APP_ENV production/live is blocked.");
  }

  if (options.requireDatabaseUrl !== false) {
    const database = inspectDatabaseTarget(env.DATABASE_URL);
    if (!database.ok) reasons.push(database.reason);
  }

  for (const key of MODE_ENV_KEYS) {
    const mode = String(env[key] || "mock").trim().toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(mode)) {
      reasons.push(`${key} must be mock, sandbox, or disabled.`);
    }
  }

  return { ok: reasons.length === 0, reasons, appEnv, nodeEnv };
}

function assertStagingSafety(options = {}, output = console) {
  const result = evaluateStagingSafety(process.env, options);
  if (!result.ok) {
    output.error(`${options.label || "Staging safety guard"}: BLOCKED`);
    for (const reason of result.reasons) output.error(`- ${reason}`);
    const error = new Error("Staging safety guard blocked this command.");
    error.guardReasons = result.reasons;
    throw error;
  }
  output.log(`${options.label || "Staging safety guard"}: PASS`);
  output.log("Target accepted as staging/test only. Sensitive values were not printed.");
  return result;
}

module.exports = {
  MODE_ENV_KEYS,
  SAFE_EXTERNAL_MODES,
  ensureApiPath,
  inspectBaseUrl,
  inspectDatabaseTarget,
  evaluateStagingSafety,
  assertStagingSafety,
};
