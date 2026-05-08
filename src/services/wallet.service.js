const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { assertPositiveAmount, toDecimal } = require("../utils/money");
const { transactionId } = require("../utils/ids");

const CREDIT_TYPES = new Set([
  "deposit",
  "bonus",
  "admin_add_credit",
  "promotion_bonus",
  "cashback",
  "commission",
  "point_exchange",
  "game_credit_mock",
]);

const DEBIT_TYPES = new Set([
  "withdraw",
  "admin_remove_credit",
  "game_debit_mock",
]);

async function ensureWallet(userId, tx = prisma, siteId = null) {
  const wallet = await tx.walletAccount.findUnique({ where: { userId } });
  if (wallet) return wallet;
  let resolvedSiteId = siteId;
  if (!resolvedSiteId) {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { siteId: true } });
    resolvedSiteId = user && user.siteId;
  }
  return tx.walletAccount.create({
    data: {
      siteId: resolvedSiteId,
      userId,
      balance: new Prisma.Decimal("0.00"),
      currency: "THB",
    },
  });
}

async function getWalletSummary(userId, siteId = null) {
  const wallet = await ensureWallet(userId, prisma, siteId);
  return {
    balance: wallet.balance,
    currency: wallet.currency,
  };
}

async function listLedger(userId, query = {}, siteId = null) {
  const take = Math.min(Number(query.limit || 50), 100);
  return prisma.walletLedger.findMany({
    where: { userId, ...(siteId ? { siteId } : {}) },
    orderBy: { createdAt: "desc" },
    take,
  });
}

function ledgerDirection(type) {
  if (CREDIT_TYPES.has(type)) return "credit";
  if (DEBIT_TYPES.has(type)) return "debit";
  const error = new Error(`Unsupported ledger type: ${type}`);
  error.statusCode = 400;
  throw error;
}

async function createWalletMovement({
  tx = prisma,
  userId,
  siteId = null,
  type,
  amount,
  referenceType = null,
  referenceId = null,
  createdByType,
  createdById = null,
  note = null,
  transactionPrefix = "WLG",
}) {
  if (tx === prisma) {
    const error = new Error("Wallet movement must run inside prisma.$transaction()");
    error.statusCode = 500;
    throw error;
  }

  if (!referenceType || !referenceId) {
    const error = new Error("Wallet ledger reference_type and reference_id are required");
    error.statusCode = 400;
    throw error;
  }

  const positiveAmount = assertPositiveAmount(amount);
  const direction = ledgerDirection(type);

  let resolvedSiteId = siteId;
  if (!resolvedSiteId) {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { siteId: true } });
    resolvedSiteId = user && user.siteId;
  }

  const wallet = await ensureWallet(userId, tx, resolvedSiteId);
  const balanceBefore = toDecimal(wallet.balance);
  const balanceAfter =
    direction === "credit"
      ? balanceBefore.plus(positiveAmount)
      : balanceBefore.minus(positiveAmount);

  if (balanceAfter.lt(0)) {
    const error = new Error("Insufficient wallet balance");
    error.statusCode = 400;
    throw error;
  }

  const ledgerAmount = direction === "credit" ? positiveAmount : positiveAmount.negated();

  const updatedWallet = await tx.walletAccount.update({
    where: { userId },
    data: { balance: balanceAfter },
  });

  const ledger = await tx.walletLedger.create({
    data: {
      transactionId: transactionId(transactionPrefix),
      siteId: resolvedSiteId,
      userId,
      type,
      amount: ledgerAmount,
      balanceBefore,
      balanceAfter,
      referenceType,
      referenceId,
      createdByType,
      createdById,
      note,
    },
  });

  return {
    wallet: updatedWallet,
    ledger,
  };
}

module.exports = {
  CREDIT_TYPES,
  DEBIT_TYPES,
  ensureWallet,
  getWalletSummary,
  listLedger,
  createWalletMovement,
};
