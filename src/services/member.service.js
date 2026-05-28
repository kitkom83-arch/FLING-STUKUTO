const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");
const { cleanSearch, pagination } = require("../utils/query");
const { toDecimal } = require("../utils/money");

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    siteId: user.siteId,
    username: user.username,
    phone: user.phone,
    referralSource: user.referralSource,
    acceptBonus: user.acceptBonus,
    acceptTerms: user.acceptTerms,
    status: user.status,
    rank: user.rank,
    points: user.points,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function listMembers(query = {}, siteId = null) {
  const { skip, take } = pagination(query, { limit: 50, maxLimit: 100 });
  const search = cleanSearch(query.search);
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.status) where.status = String(query.status);
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }
  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      walletAccount: true,
      bankAccounts: true,
    },
  });
}

async function getMember(id, siteId = null) {
  const member = await prisma.user.findFirst({
    where: { id, ...(siteId ? { siteId } : {}) },
    include: {
      walletAccount: true,
      bankAccounts: true,
      deposits: { orderBy: { createdAt: "desc" }, take: 20 },
      withdrawals: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }
  return member;
}

function remainingString(requiredAmount, currentAmount) {
  const remaining = toDecimal(requiredAmount || "0.00").minus(toDecimal(currentAmount || "0.00"));
  return (remaining.lt(0) ? toDecimal("0.00") : remaining).toFixed(2);
}

function promotionLabel(promotion) {
  if (!promotion) return null;
  return promotion.title || promotion.id || null;
}

function publicGameBet(row) {
  return {
    id: row.id,
    provider: row.provider,
    gameCode: row.gameCode,
    roundId: row.roundId,
    betAmount: row.betAmount,
    winAmount: row.winAmount,
    profitAmount: row.profitAmount,
    playedAt: row.playedAt,
    source: "game_bet_history_mock",
    mockSource: true,
  };
}

function publicGameSession(row) {
  const game = row.game || null;
  return {
    id: row.id,
    eventType: "game_session",
    provider: row.provider,
    gameCode: row.gameCode,
    gameName: game ? game.name : null,
    gameCategory: game ? game.category : null,
    status: row.status,
    amount: null,
    referenceId: row.id,
    createdAt: row.createdAt,
  };
}

function publicGameTransfer(row) {
  return {
    id: row.id,
    eventType: `game_transfer_${row.type}`,
    provider: row.provider,
    gameCode: null,
    gameName: null,
    status: row.status,
    amount: row.amount,
    referenceId: row.transactionId,
    walletLedgerId: row.walletLedgerId,
    createdAt: row.createdAt,
  };
}

function publicPointLedger(row) {
  return {
    id: row.id,
    eventType: "point_ledger",
    provider: null,
    gameCode: null,
    gameName: row.reason,
    status: "recorded",
    amount: row.amount,
    before: row.before,
    after: row.after,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    createdAt: row.createdAt,
  };
}

function sortNewestRows(rows) {
  return rows.sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.playedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.playedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function publicPromotionDeposit(row) {
  return {
    id: row.id,
    eventType: "promotion_deposit",
    transactionId: row.transactionId,
    promotionId: row.promotionId,
    promotionTitle: promotionLabel(row.promotion),
    amount: row.amount,
    status: row.status,
    channel: row.channel,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
  };
}

function publicPromotionClaim(row) {
  return {
    id: row.id,
    eventType: "promotion_claim",
    promotionId: row.promotionId,
    promotionTitle: promotionLabel(row.promotion),
    amount: row.bonusAmount,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function publicTurnoverRequirement(row) {
  return {
    id: row.id,
    promotionId: row.promotionId,
    promotionClaimId: row.promotionClaimId,
    promotionTitle: promotionLabel(row.promotion),
    requiredAmount: row.requiredAmount,
    currentAmount: row.currentAmount,
    remainingAmount: remainingString(row.requiredAmount, row.currentAmount),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getMemberHistory(id, query = {}, siteId = null) {
  const { take } = pagination(query, { limit: 50, maxLimit: 100 });
  const member = await prisma.user.findFirst({
    where: { id, ...(siteId ? { siteId } : {}) },
    select: {
      id: true,
      siteId: true,
      username: true,
      phone: true,
      referralSource: true,
      acceptBonus: true,
      acceptTerms: true,
      status: true,
      rank: true,
      points: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const memberWhere = { siteId: member.siteId, userId: member.id };
  const [
    deposits,
    withdrawals,
    promotionDeposits,
    promotionClaims,
    turnoverRequirements,
    gameSessions,
    gameTransfers,
    pointLedgers,
    playRows,
  ] = await Promise.all([
    prisma.depositTransaction.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        channel: true,
        promotionId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        promotion: { select: { id: true, title: true, type: true } },
      },
    }),
    prisma.withdrawTransaction.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        paidAt: true,
      },
    }),
    prisma.depositTransaction.findMany({
      where: { ...memberWhere, promotionId: { not: null } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        channel: true,
        promotionId: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        promotion: { select: { id: true, title: true, type: true } },
      },
    }),
    prisma.promotionClaim.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        promotionId: true,
        bonusAmount: true,
        status: true,
        createdAt: true,
        promotion: { select: { id: true, title: true, type: true } },
      },
    }),
    prisma.turnoverRequirement.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        promotionId: true,
        promotionClaimId: true,
        requiredAmount: true,
        currentAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        promotion: { select: { id: true, title: true, type: true } },
      },
    }),
    prisma.gameSession.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        provider: true,
        gameCode: true,
        status: true,
        createdAt: true,
        game: { select: { name: true, category: true } },
      },
    }),
    prisma.gameTransfer.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        transactionId: true,
        provider: true,
        type: true,
        amount: true,
        walletLedgerId: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.pointLedger.findMany({
      where: memberWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        before: true,
        amount: true,
        after: true,
        reason: true,
        referenceType: true,
        referenceId: true,
        createdAt: true,
      },
    }),
    prisma.gameBetHistoryMock.findMany({
      where: memberWhere,
      orderBy: { playedAt: "desc" },
      take,
      select: {
        id: true,
        provider: true,
        gameCode: true,
        betAmount: true,
        winAmount: true,
        profitAmount: true,
        roundId: true,
        playedAt: true,
      },
    }),
  ]);

  const usageRows = sortNewestRows([
    ...gameSessions.map(publicGameSession),
    ...gameTransfers.map(publicGameTransfer),
    ...pointLedgers.map(publicPointLedger),
  ]).slice(0, take);
  const prePromotionRows = sortNewestRows([
    ...promotionDeposits.map(publicPromotionDeposit),
    ...promotionClaims.map(publicPromotionClaim),
  ]).slice(0, take);

  return {
    member: publicUser(member),
    deposits,
    withdrawals,
    playRows: playRows.map(publicGameBet),
    prePromotionRows,
    referral: {
      source: member.referralSource || null,
      rows: [],
      note: "Full referral tree is not modeled yet; only referralSource is available.",
    },
    usageRows,
    debtRows: turnoverRequirements.map(publicTurnoverRequirement),
    sources: {
      readOnly: true,
      noWriteActions: true,
      noLiveProviderCalls: true,
      playRows: "game_bet_history_mock local table",
      wheelRows: "existing guarded wheel history endpoints",
      walletLedgerRows: "existing guarded reports wallet-ledger endpoint",
    },
    totals: {
      deposits: deposits.length,
      withdrawals: withdrawals.length,
      playRows: playRows.length,
      prePromotionRows: prePromotionRows.length,
      usageRows: usageRows.length,
      debtRows: turnoverRequirements.length,
      referralRows: 0,
    },
  };
}

async function setBlocked({ id, blocked, admin, req, siteId = null }) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.user.findFirst({ where: { id, ...(siteId ? { siteId } : {}) } });
    if (!before) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }

    const after = await tx.user.update({
      where: { id },
      data: { status: blocked ? "blocked" : "active" },
    });

    await logAdminAction({
      tx,
      admin,
      action: blocked ? "user.block" : "user.unblock",
      targetType: "user",
      targetId: id,
      before,
      after,
      req,
      siteId: before.siteId,
    });

    return after;
  });
}

module.exports = {
  publicUser,
  listMembers,
  getMember,
  getMemberHistory,
  setBlocked,
};
