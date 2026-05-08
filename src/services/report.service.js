const prisma = require("../config/prisma");
const { toDecimal } = require("../utils/money");

function sumDecimals(rows, field = "amount") {
  return rows.reduce((total, row) => total.plus(toDecimal(row[field] || "0.00")), toDecimal("0.00"));
}

async function summary(siteId = null) {
  const siteWhere = siteId ? { siteId } : {};
  const [
    memberCount,
    approvedDeposits,
    paidWithdrawals,
    bonusLedgers,
    pendingDepositCount,
    pendingWithdrawCount,
    mockBets,
  ] = await Promise.all([
    prisma.user.count({ where: siteWhere }),
    prisma.depositTransaction.findMany({ where: { ...siteWhere, status: "approved" }, select: { amount: true } }),
    prisma.withdrawTransaction.findMany({ where: { ...siteWhere, status: { in: ["approved", "paid"] } }, select: { amount: true } }),
    prisma.walletLedger.findMany({
      where: { ...siteWhere, type: { in: ["bonus", "promotion_bonus", "cashback", "commission"] } },
      select: { amount: true },
    }),
    prisma.depositTransaction.count({ where: { ...siteWhere, status: "pending" } }),
    prisma.withdrawTransaction.count({ where: { ...siteWhere, status: "pending" } }),
    prisma.gameBetHistoryMock.findMany({ where: siteWhere, select: { profitAmount: true } }),
  ]);

  return {
    member_count: memberCount,
    total_deposit: sumDecimals(approvedDeposits),
    total_withdraw: sumDecimals(paidWithdrawals),
    total_bonus: sumDecimals(bonusLedgers),
    total_profit_mock: sumDecimals(mockBets, "profitAmount"),
    pending_deposit_count: pendingDepositCount,
    pending_withdraw_count: pendingWithdrawCount,
  };
}

async function deposits(query = {}, siteId = null) {
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.status) where.status = query.status;
  return prisma.depositTransaction.findMany({
    where,
    include: { user: true, bankAccount: true, promotion: true },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(query.limit || 100), 200),
  });
}

async function withdrawals(query = {}, siteId = null) {
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.status) where.status = query.status;
  return prisma.withdrawTransaction.findMany({
    where,
    include: { user: true, userBankAccount: true },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(query.limit || 100), 200),
  });
}

async function walletLedger(query = {}, siteId = null) {
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.user_id) where.userId = query.user_id;
  return prisma.walletLedger.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(query.limit || 100), 200),
  });
}

module.exports = {
  summary,
  deposits,
  withdrawals,
  walletLedger,
};
