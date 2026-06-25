const { PrismaClient } = require("@prisma/client");
const codeCenter = require("./codeCenter.service");
const rewardWallet = require("./memberRewardWallet.service");
const { createCodeCenterPrismaStore } = require("./codeCenterPrismaStore");
const { createMemberRewardPrismaStore } = require("./memberRewardPrismaStore");

const STORAGE_MODE_ENV = "CODE_CENTER_STORAGE_MODE";
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];

let activeMode = null;
let prisma = null;

function error(message, statusCode = 503, details = {}) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}

function storageMode() {
  return String(process.env[STORAGE_MODE_ENV] || "memory").trim().toLowerCase();
}

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

function isLoopbackHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) return { ok: false, reason: "DATABASE_URL is required for Code Center Prisma storage. Value is not printed." };
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, reason: "Code Center Prisma storage requires PostgreSQL. DATABASE_URL value is not printed." };
  }
  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return { ok: false, reason: "Code Center Prisma storage blocked a production-like database target. Value is not printed." };
  }
  const safeTarget = isLoopbackHost(parsed.hostname) || targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!safeTarget) {
    return { ok: false, reason: "Code Center Prisma storage requires local/staging/test database labels. Value is not printed." };
  }
  return { ok: true };
}

function configureMemory() {
  codeCenter.configureStoreForSmoke(null);
  rewardWallet.configureStoreForSmoke(null);
  activeMode = "memory";
  return { mode: activeMode };
}

function configurePrisma() {
  const target = inspectDatabaseTarget(process.env.DATABASE_URL);
  if (!target.ok) throw error(target.reason);
  if (!prisma) prisma = new PrismaClient({ log: ["error"] });
  rewardWallet.configureStoreForSmoke(createMemberRewardPrismaStore(prisma));
  codeCenter.configureStoreForSmoke(createCodeCenterPrismaStore(prisma));
  activeMode = "prisma";
  return { mode: activeMode };
}

function ensureRuntimeStores() {
  const mode = storageMode();
  if (mode === activeMode) return { mode: activeMode };
  if (mode === "memory") return configureMemory();
  if (mode === "prisma") return configurePrisma();
  throw error(`Unsupported Code Center storage mode: ${mode}`, 503, { supportedModes: ["memory", "prisma"] });
}

async function disconnectRuntimeStores() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  activeMode = null;
  configureMemory();
}

function runtimeStatus() {
  return {
    mode: activeMode || storageMode(),
    configured: Boolean(activeMode),
    env: STORAGE_MODE_ENV,
  };
}

module.exports = {
  STORAGE_MODE_ENV,
  ensureRuntimeStores,
  disconnectRuntimeStores,
  inspectDatabaseTarget,
  runtimeStatus,
};
