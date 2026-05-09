const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_DATABASE_MARKERS = ["test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const PROVIDER_MODE_KEYS = [
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

function parseDatabaseUrl(databaseUrl) {
  try {
    return new URL(databaseUrl);
  } catch (_error) {
    return null;
  }
}

function isPostgresUrl(parsedUrl) {
  return parsedUrl && ["postgres:", "postgresql:"].includes(parsedUrl.protocol);
}

function databaseLooksProduction(parsedUrl) {
  if (!parsedUrl) return false;
  return [parsedUrl.hostname, parsedUrl.pathname, parsedUrl.username].some((part) =>
    hasAnyToken(part, PRODUCTION_MARKERS)
  );
}

function databaseLooksStagingOrTest(parsedUrl) {
  if (!parsedUrl) return false;
  return [parsedUrl.hostname, parsedUrl.pathname, parsedUrl.username].some((part) =>
    hasAnyToken(part, SAFE_DATABASE_MARKERS)
  );
}

function providerMode(env, key) {
  const value = env[key];
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "";
}

function evaluateDbSafetyGuard(env = process.env) {
  const reasons = [];
  const nodeEnv = typeof env.NODE_ENV === "string" ? env.NODE_ENV.trim().toLowerCase() : "";

  if (nodeEnv === "production") {
    reasons.push("NODE_ENV=production is blocked for DB-backed safety tests.");
  }

  const databaseUrl = env.DATABASE_URL;
  const parsedDatabaseUrl = typeof databaseUrl === "string" && databaseUrl.trim()
    ? parseDatabaseUrl(databaseUrl.trim())
    : null;

  if (!parsedDatabaseUrl) {
    reasons.push("DATABASE_URL must be set to a confirmed staging/test PostgreSQL database. Value is not printed.");
  } else if (!isPostgresUrl(parsedDatabaseUrl)) {
    reasons.push("DATABASE_URL must use PostgreSQL for this suite. Value is not printed.");
  } else {
    if (databaseLooksProduction(parsedDatabaseUrl)) {
      reasons.push("DATABASE_URL appears to target a production-like database. Value is not printed.");
    }
    if (!databaseLooksStagingOrTest(parsedDatabaseUrl)) {
      reasons.push("DATABASE_URL must include an explicit staging/test marker in host, database, or user. Value is not printed.");
    }
  }

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = providerMode(env, key);
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      reasons.push(`${key} must be mock or sandbox before DB-backed safety tests run.`);
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
  };
}

function printGuardResult(result, output = console) {
  if (result.ok) {
    output.log("DB safety guard: PASS");
    output.log("Target accepted as staging/test PostgreSQL. Sensitive values were not printed.");
    return;
  }

  output.error("DB safety guard: BLOCKED");
  for (const reason of result.reasons) {
    output.error(`- ${reason}`);
  }
  output.error("Use npm run test:db:safety:dry-run until a staging/test PostgreSQL database is confirmed.");
}

function assertDbSafetyGuard(env = process.env, output = console) {
  const result = evaluateDbSafetyGuard(env);
  printGuardResult(result, output);
  if (!result.ok) {
    const error = new Error("DB safety guard blocked the DB-backed safety suite.");
    error.guardReasons = result.reasons;
    throw error;
  }
  return result;
}

function run() {
  try {
    assertDbSafetyGuard(process.env);
  } catch (_error) {
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  PROVIDER_MODE_KEYS,
  SAFE_PROVIDER_MODES,
  evaluateDbSafetyGuard,
  assertDbSafetyGuard,
};
