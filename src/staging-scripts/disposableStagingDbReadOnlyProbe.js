"use strict";

const { PrismaClient } = require("@prisma/client");

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

function summarizeTarget(parsedUrl) {
  return {
    protocol: safeValue(parsedUrl.protocol),
    hostname: safeValue(parsedUrl.hostname),
    port: safeValue(parsedUrl.port),
    databaseName: safeValue(databaseNameFrom(parsedUrl)),
    username: maskUsername(parsedUrl.username),
  };
}

function evaluateReadOnlyProbeEnv(env = process.env) {
  const reasons = [];
  const databaseUrl = env.DATABASE_URL;

  if (!String(databaseUrl || "").trim()) {
    return {
      ok: false,
      parsedUrl: null,
      summary: null,
      reasons: ["DATABASE_URL is required. Value is not printed."],
    };
  }

  const parsedUrl = parseDatabaseUrl(databaseUrl);
  if (!parsedUrl) {
    return {
      ok: false,
      parsedUrl: null,
      summary: null,
      reasons: ["DATABASE_URL must be a valid URL. Value is not printed."],
    };
  }

  if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
    reasons.push("DATABASE_URL must use PostgreSQL. Value is not printed.");
  }

  const databaseName = databaseNameFrom(parsedUrl);
  const summary = summarizeTarget(parsedUrl);

  if (hasProductionLookingPattern(parsedUrl.hostname) || hasProductionLookingPattern(databaseName)) {
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
  requireExactEnv(env, "STAGING_DB_READ_ONLY_PROBE_CONFIRM", "true", reasons);

  for (const [key, expectedValue] of Object.entries(REQUIRED_PROVIDER_MODES)) {
    requireExactEnv(env, key, expectedValue, reasons);
  }

  return {
    ok: reasons.length === 0,
    parsedUrl,
    summary,
    reasons,
  };
}

function firstRow(rows) {
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
}

function readTableCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

async function runReadOnlyQueries(client) {
  const probeRows = await client.$queryRaw`SELECT 1 AS probe_ok`;
  const probeOk = Number(firstRow(probeRows).probe_ok) === 1;
  if (!probeOk) {
    throw new Error("Read-only probe query failed. Detail is not printed.");
  }

  const transactionRows = await client.$queryRaw`SHOW transaction_read_only`;
  const transactionState =
    firstRow(transactionRows).transaction_read_only || firstRow(transactionRows).Transaction_read_only || "unknown";

  const tableRows = await client.$queryRaw`
    SELECT COUNT(*)::int AS table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;
  const tableCount = readTableCount(firstRow(tableRows).table_count);

  return {
    transactionState: safeValue(transactionState),
    tableCount,
  };
}

function createPrismaClient() {
  return new PrismaClient();
}

function printSummary(output, summary) {
  output.log("Disposable staging DB read-only probe target summary");
  output.log(`- protocol: ${summary.protocol}`);
  output.log(`- hostname: ${summary.hostname}`);
  output.log(`- port: ${summary.port}`);
  output.log(`- database name: ${summary.databaseName}`);
  output.log(`- username: ${summary.username}`);
}

function printFailure(output, reasons) {
  output.error("Disposable staging DB read-only probe: FAIL");
  for (const reason of reasons) {
    output.error(`- ${reason}`);
  }
}

async function main(options = {}) {
  const env = options.env || process.env;
  const output = options.output || console;
  const evaluation = evaluateReadOnlyProbeEnv(env);
  let client = options.client || null;
  let createdClient = false;

  if (evaluation.summary) {
    printSummary(output, evaluation.summary);
  }

  if (!evaluation.ok) {
    printFailure(output, evaluation.reasons);
    return 1;
  }

  try {
    if (!client) {
      client = createPrismaClient();
      createdClient = true;
    }

    const result = await runReadOnlyQueries(client);
    output.log("Read-only connection probe: PASS");
    output.log(`Transaction read-only state: ${result.transactionState}`);
    output.log(`Schema visibility probe: PASS (public tables: ${result.tableCount})`);
    output.log("Disposable staging DB read-only probe: PASS");
    return 0;
  } catch (_error) {
    printFailure(output, ["Read-only probe query failed. Detail is not printed."]);
    return 1;
  } finally {
    if (createdClient && client && typeof client.$disconnect === "function") {
      await client.$disconnect();
    }
  }
}

if (require.main === module) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  });
}

module.exports = {
  databaseNameFrom,
  evaluateReadOnlyProbeEnv,
  main,
  maskUsername,
  runReadOnlyQueries,
};
