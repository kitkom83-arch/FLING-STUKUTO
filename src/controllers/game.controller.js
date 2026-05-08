const { z } = require("zod");
const prisma = require("../config/prisma");
const { success } = require("../utils/response");
const MockGameProviderAdapter = require("../adapters/game/MockGameProviderAdapter");

const adapter = new MockGameProviderAdapter();

const launchSchema = z.object({
  provider: z.string().default("PG"),
  game_code: z.string().min(1),
});

const transferSchema = z.object({
  provider: z.string().default("PG"),
  amount: z.union([z.string(), z.number()]),
});

async function providers(req, res) {
  const baseProviders = Object.fromEntries(adapter.listProviders().map((provider) => [provider.code, provider]));
  const configs = await prisma.siteGameProviderConfig.findMany({
    where: { siteId: req.siteId, status: "active" },
    orderBy: { providerCode: "asc" },
  });
  return success(
    res,
    configs.map((config) => ({
      code: config.providerCode,
      name: config.displayName || (baseProviders[config.providerCode] && baseProviders[config.providerCode].name),
      status: config.status,
      agentCode: config.agentCode,
      walletMode: config.walletMode,
    }))
  );
}

async function games(req, res) {
  await requireActiveProvider(req.siteId, req.params.provider);
  return success(res, adapter.listGames(req.params.provider));
}

async function launchMock(req, res) {
  const data = launchSchema.parse(req.body);
  await requireActiveProvider(req.siteId, data.provider);
  return success(res, await adapter.launchGame(req.user, data.game_code, data.provider, req.siteId));
}

async function transferInMock(req, res) {
  const data = transferSchema.parse(req.body);
  await requireActiveProvider(req.siteId, data.provider);
  return success(res, await adapter.transferIn(req.user, data.amount, data.provider, req.siteId));
}

async function transferOutMock(req, res) {
  const data = transferSchema.parse(req.body);
  await requireActiveProvider(req.siteId, data.provider);
  return success(res, await adapter.transferOut(req.user, data.amount, data.provider, req.siteId));
}

async function betHistoryMock(req, res) {
  return success(
    res,
    await adapter.getBetHistory(req.user, req.siteId, {
      from: req.query.from,
      to: req.query.to,
    })
  );
}

async function requireActiveProvider(siteId, providerCode) {
  const config = await prisma.siteGameProviderConfig.findUnique({
    where: { siteId_providerCode: { siteId, providerCode } },
  });
  if (!config || config.status !== "active") {
    const error = new Error("Game provider is not active for this site");
    error.statusCode = 403;
    throw error;
  }
  return config;
}

module.exports = {
  providers,
  games,
  launchMock,
  transferInMock,
  transferOutMock,
  betHistoryMock,
};
