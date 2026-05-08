const prisma = require("../../config/prisma");
const { assertPositiveAmount, toDecimal } = require("../../utils/money");
const { transactionId } = require("../../utils/ids");
const { createWalletMovement, getWalletSummary } = require("../../services/wallet.service");
const GameProviderAdapter = require("./GameProviderAdapter");

const PROVIDERS = [
  { code: "PG", name: "PG Soft" },
  { code: "JILI", name: "JILI" },
  { code: "PRAGMATIC", name: "Pragmatic Play" },
  { code: "EVO", name: "Evolution" },
  { code: "JOKER", name: "Joker Gaming" },
];

const GAMES = {
  PG: [
    { code: "fortune_tiger", name: "Fortune Tiger", category: "slot" },
    { code: "fortune_rabbit", name: "Fortune Rabbit", category: "slot" },
  ],
  JILI: [{ code: "mahjong_ways", name: "Mahjong Ways", category: "slot" }],
  PRAGMATIC: [{ code: "sweet_bonanza", name: "Sweet Bonanza", category: "slot" }],
  EVO: [{ code: "baccarat_mock", name: "Baccarat Mock", category: "live" }],
  JOKER: [{ code: "joker_treasure_mock", name: "Joker Treasure Mock", category: "slot" }],
};

class MockGameProviderAdapter extends GameProviderAdapter {
  listProviders() {
    return PROVIDERS;
  }

  listGames(providerCode) {
    return GAMES[providerCode] || [];
  }

  createPlayer(user) {
    return {
      provider_player_id: `MOCK-${user.id}`,
      username: user.username || user.phone,
      status: "created",
    };
  }

  async getBalance(user) {
    return getWalletSummary(user.id, user.siteId);
  }

  async transferIn(user, amount, provider = "PG", siteId = null) {
    const transferAmount = assertPositiveAmount(amount);
    const resolvedSiteId = siteId || user.siteId;
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.gameTransfer.create({
        data: {
          siteId: resolvedSiteId,
          transactionId: transactionId("GTR"),
          userId: user.id,
          provider,
          type: "transfer_in",
          amount: transferAmount,
          status: "pending",
        },
      });

      const movement = await createWalletMovement({
        tx,
        userId: user.id,
        siteId: resolvedSiteId,
        type: "game_debit_mock",
        amount: transferAmount,
        referenceType: "game_transfer",
        referenceId: transfer.id,
        createdByType: "system",
        note: `Mock transfer in to ${provider}`,
      });

      const updatedTransfer = await tx.gameTransfer.update({
        where: { id: transfer.id },
        data: {
          walletLedgerId: movement.ledger.id,
          status: "success",
        },
      });

      return { transfer: updatedTransfer, wallet: movement.wallet, ledger: movement.ledger };
    });
  }

  async transferOut(user, amount, provider = "PG", siteId = null) {
    const transferAmount = assertPositiveAmount(amount);
    const resolvedSiteId = siteId || user.siteId;
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.gameTransfer.create({
        data: {
          siteId: resolvedSiteId,
          transactionId: transactionId("GTR"),
          userId: user.id,
          provider,
          type: "transfer_out",
          amount: transferAmount,
          status: "pending",
        },
      });

      const movement = await createWalletMovement({
        tx,
        userId: user.id,
        siteId: resolvedSiteId,
        type: "game_credit_mock",
        amount: transferAmount,
        referenceType: "game_transfer",
        referenceId: transfer.id,
        createdByType: "system",
        note: `Mock transfer out from ${provider}`,
      });

      const updatedTransfer = await tx.gameTransfer.update({
        where: { id: transfer.id },
        data: {
          walletLedgerId: movement.ledger.id,
          status: "success",
        },
      });

      return { transfer: updatedTransfer, wallet: movement.wallet, ledger: movement.ledger };
    });
  }

  async launchGame(user, gameCode, provider = "PG", siteId = null) {
    const launchUrl = `/mock-game?provider=${encodeURIComponent(provider)}&game=${encodeURIComponent(gameCode)}`;
    const session = await prisma.gameSession.create({
      data: {
        siteId: siteId || user.siteId,
        userId: user.id,
        provider,
        gameCode,
        launchUrl,
        status: "active",
      },
    });
    return { launch_url: launchUrl, session };
  }

  async getBetHistory(user, siteId = null, dateRange = {}) {
    const resolvedSiteId = siteId || user.siteId;
    const existing = await prisma.gameBetHistoryMock.findMany({
      where: { userId: user.id, siteId: resolvedSiteId },
      orderBy: { playedAt: "desc" },
      take: 50,
    });
    if (existing.length > 0) return existing;

    const rows = [
      {
        userId: user.id,
        siteId: resolvedSiteId,
        provider: "PG",
        gameCode: "fortune_tiger",
        betAmount: toDecimal("10.00"),
        winAmount: toDecimal("15.50"),
        profitAmount: toDecimal("-5.50"),
        roundId: `ROUND-${Date.now()}-1`,
      },
      {
        userId: user.id,
        siteId: resolvedSiteId,
        provider: "EVO",
        gameCode: "baccarat_mock",
        betAmount: toDecimal("20.00"),
        winAmount: toDecimal("0.00"),
        profitAmount: toDecimal("20.00"),
        roundId: `ROUND-${Date.now()}-2`,
      },
    ];

    await prisma.gameBetHistoryMock.createMany({ data: rows });
    return prisma.gameBetHistoryMock.findMany({
      where: { userId: user.id, siteId: resolvedSiteId },
      orderBy: { playedAt: "desc" },
      take: 50,
    });
  }
}

module.exports = MockGameProviderAdapter;
