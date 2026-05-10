const env = require("../config/env");
const prisma = require("../config/prisma");
const { success } = require("../utils/response");

const SAFE_EXTERNAL_MODES = new Set(["mock", "sandbox", "disabled"]);

function safeMode(value) {
  const mode = String(value || "mock").trim().toLowerCase();
  return SAFE_EXTERNAL_MODES.has(mode) ? mode : "unsafe";
}

async function checkDatabaseConnected() {
  if (!env.databaseUrl) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (_error) {
    return false;
  }
}

async function health(req, res) {
  return success(res, {
    ok: true,
    status: "ok",
    version: "0.1.0",
    timestamp: new Date(),
    environment: {
      nodeEnv: env.nodeEnv,
      appEnv: env.appEnv,
    },
    databaseConnected: await checkDatabaseConnected(),
    externalModes: {
      gameProvider: safeMode(env.gameProvider.mode),
      paymentProvider: safeMode(env.paymentProvider.mode),
      bankStatement: safeMode(env.bankStatement.mode),
      smsProvider: safeMode(env.smsProvider.mode),
      slipOcr: safeMode(env.slipOcr.mode),
    },
  });
}

module.exports = {
  health,
};
