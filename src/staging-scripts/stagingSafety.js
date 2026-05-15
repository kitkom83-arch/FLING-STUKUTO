require("dotenv").config();

const SAFE_APP_ENVS = new Set(["staging", "stage", "test", "testing", "qa", "sandbox", "local-test"]);
const SAFE_NODE_ENVS = new Set(["", "staging", "stage", "test", "development", "development-local", "local-test"]);
const SAFE_STAGING_MODES = new Set(["staging", "mock", "sandbox", "local-test", "test", "testing", "qa"]);
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
    return {
      ok: false,
      missing: true,
      risk: false,
      reason: "DATABASE_URL must be set to a staging/test PostgreSQL target. Value is not printed.",
    };
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, missing: false, risk: true, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      missing: false,
      risk: true,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }
  if (!isLoopbackHost(parsed.hostname) && !targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS))) {
    return {
      ok: false,
      missing: false,
      risk: true,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, missing: false, risk: false, reason: null };
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
  const failReasons = [];
  const skipReasons = [];
  const appEnv = String(env.APP_ENV || "local-test").trim().toLowerCase();
  const nodeEnv = String(env.NODE_ENV || "").trim().toLowerCase();
  const stagingMode = String(env.STAGING_MODE || appEnv).trim().toLowerCase();

  if (!SAFE_APP_ENVS.has(appEnv)) {
    failReasons.push("APP_ENV must be staging, test, qa, sandbox, or local-test.");
  }
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    failReasons.push("NODE_ENV must be a safe runtime label and must not be production.");
  }
  if (nodeEnv === "production") {
    failReasons.push("NODE_ENV=production is blocked for staging mock/sandbox preflight.");
  }
  if (["prod", "production", "live"].includes(appEnv)) {
    failReasons.push("APP_ENV production/live is blocked.");
  }
  if (!SAFE_STAGING_MODES.has(stagingMode)) {
    failReasons.push("STAGING_MODE must be staging, mock, sandbox, or another explicit staging/test label.");
  }
  if (["prod", "production", "live"].includes(stagingMode)) {
    failReasons.push("STAGING_MODE production/live is blocked.");
  }

  if (options.requireDatabaseUrl !== false) {
    const database = inspectDatabaseTarget(env.DATABASE_URL);
    if (!database.ok) {
      if (database.missing && options.allowSkipSafe) skipReasons.push(database.reason);
      else failReasons.push(database.reason);
    }
  } else if (env.DATABASE_URL) {
    const database = inspectDatabaseTarget(env.DATABASE_URL);
    if (!database.ok && database.risk) failReasons.push(database.reason);
  }

  for (const key of MODE_ENV_KEYS) {
    const mode = String(env[key] || "mock").trim().toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(mode)) {
      failReasons.push(`${key} must be mock, sandbox, or disabled.`);
    }
    if (mode === "live") {
      failReasons.push(`${key}=live is blocked for staging mock/sandbox preflight.`);
    }
  }

  return {
    ok: failReasons.length === 0 && skipReasons.length === 0,
    failed: failReasons.length > 0,
    skipped: failReasons.length === 0 && skipReasons.length > 0,
    reasons: [...failReasons, ...skipReasons],
    failReasons,
    skipReasons,
    appEnv,
    nodeEnv,
    stagingMode,
  };
}

function assertStagingSafety(options = {}, output = console) {
  const result = evaluateStagingSafety(process.env, options);
  if (result.failed || (!options.allowSkipSafe && result.skipped)) {
    output.error(`${options.label || "Staging safety guard"}: BLOCKED`);
    for (const reason of result.failReasons.length ? result.failReasons : result.reasons) output.error(`- ${reason}`);
    const error = new Error("Staging safety guard blocked this command.");
    error.guardReasons = result.reasons;
    throw error;
  }
  if (result.skipped) {
    output.log(`${options.label || "Staging safety guard"}: SKIP-SAFE`);
    for (const reason of result.skipReasons) output.log(`reason: ${reason}`);
    return result;
  }
  output.log(`${options.label || "Staging safety guard"}: PASS`);
  output.log("Target accepted as staging/test only. Sensitive values were not printed.");
  return result;
}

module.exports = {
  MODE_ENV_KEYS,
  SAFE_EXTERNAL_MODES,
  SAFE_STAGING_MODES,
  ensureApiPath,
  inspectBaseUrl,
  inspectDatabaseTarget,
  evaluateStagingSafety,
  assertStagingSafety,
};
