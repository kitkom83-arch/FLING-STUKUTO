"use strict";

const PRODUCTION_LOOKING_PATTERNS = [
  "production",
  "prod",
  "live",
  "primary",
  "main-prod",
  "real-money",
  "payout-live",
];

const REQUIRED_PROVIDER_MODES = {
  GAME_PROVIDER_MODE: "mock",
  PAYMENT_PROVIDER_MODE: "sandbox",
  BANK_STATEMENT_MODE: "mock",
  SMS_PROVIDER_MODE: "mock",
  SLIP_OCR_MODE: "mock",
};

function safeValue(value) {
  const text = String(value || "").trim();
  return text || "missing-value placeholder";
}

function maskUsername(username) {
  const text = String(username || "");
  if (!text) return "missing-value placeholder";
  if (text.length <= 2) return "*".repeat(text.length);
  return `${text.slice(0, 1)}${"*".repeat(Math.max(3, text.length - 2))}${text.slice(-1)}`;
}

function fail(reasons) {
  console.error("Disposable staging DB preflight: FAIL");
  for (const reason of reasons) {
    console.error(`- ${reason}`);
  }
  process.exitCode = 1;
}

function parseDatabaseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function databaseNameFrom(parsedUrl) {
  const pathname = String(parsedUrl.pathname || "").replace(/^\/+/, "");
  if (!pathname) return "";
  try {
    return decodeURIComponent(pathname);
  } catch (_error) {
    return pathname;
  }
}

function hasProductionLookingPattern(value) {
  const lower = String(value || "").toLowerCase();
  return PRODUCTION_LOOKING_PATTERNS.some((pattern) => lower.includes(pattern));
}

function requireExactEnv(env, key, expectedValue, reasons) {
  const actualValue = String(env[key] || "").trim().toLowerCase();
  if (actualValue !== expectedValue) {
    reasons.push(`${key} must be ${expectedValue}. Actual value is not printed.`);
  }
}

function main(env = process.env) {
  const reasons = [];
  const databaseUrl = env.DATABASE_URL;

  if (!String(databaseUrl || "").trim()) {
    fail(["DATABASE_URL is required. Value is not printed."]);
    return;
  }

  const parsed = parseDatabaseUrl(databaseUrl);
  if (!parsed) {
    fail(["DATABASE_URL must be a valid URL. Value is not printed."]);
    return;
  }

  const databaseName = databaseNameFrom(parsed);

  console.log("Disposable staging DB target summary");
  console.log(`- protocol: ${safeValue(parsed.protocol)}`);
  console.log(`- hostname: ${safeValue(parsed.hostname)}`);
  console.log(`- port: ${safeValue(parsed.port)}`);
  console.log(`- database name: ${safeValue(databaseName)}`);
  console.log(`- username: ${maskUsername(parsed.username)}`);

  if (hasProductionLookingPattern(parsed.hostname) || hasProductionLookingPattern(databaseName)) {
    reasons.push("Database hostname or database name looks production-like and is blocked.");
  }

  if (String(env.NODE_ENV || "").trim().toLowerCase() === "production") {
    reasons.push("NODE_ENV production is blocked.");
  }

  if (String(env.APP_ENV || "").trim().toLowerCase() === "production") {
    reasons.push("APP_ENV production is blocked.");
  }

  requireExactEnv(env, "STAGING_DB_DISPOSABLE_CONFIRM", "true", reasons);
  requireExactEnv(env, "STAGING_DB_DRY_RUN_ONLY", "true", reasons);

  for (const [key, expectedValue] of Object.entries(REQUIRED_PROVIDER_MODES)) {
    requireExactEnv(env, key, expectedValue, reasons);
  }

  if (reasons.length > 0) {
    fail(reasons);
    return;
  }

  console.log("Disposable staging DB preflight: PASS");
}

main();
