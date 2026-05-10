const prisma = require("../config/prisma");
const { assertPositiveAmount } = require("../utils/money");
const { transactionId } = require("../utils/ids");
const { createWalletMovement } = require("./wallet.service");
const { logAdminAction } = require("./adminLog.service");
const { cleanSearch, pagination } = require("../utils/query");

async function createDeposit(userId, siteId, data) {
  const amount = assertPositiveAmount(data.amount);
  if (data.bank_account_id) {
    const account = await prisma.userBankAccount.findFirst({
      where: { id: data.bank_account_id, userId, siteId },
    });
    if (!account) {
      const error = new Error("Bank account not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.promotion_id) {
    const promotion = await prisma.promotion.findFirst({
      where: { id: data.promotion_id, siteId, status: "active" },
    });
    if (!promotion) {
      const error = new Error("Promotion not found");
      error.statusCode = 404;
      throw error;
    }
  }

  return prisma.depositTransaction.create({
    data: {
      siteId,
      transactionId: transactionId("PGD"),
      userId,
      amount,
      channel: data.channel,
      bankAccountId: data.bank_account_id || null,
      promotionId: data.promotion_id || null,
      slipFileUrl: data.slip_file_url || null,
      note: data.note || null,
      status: "pending",
    },
  });
}

async function listUserDeposits(userId, siteId) {
  return prisma.depositTransaction.findMany({
    where: { userId, siteId },
    orderBy: { createdAt: "desc" },
    include: { promotion: true, bankAccount: true },
  });
}

async function listDeposits(query = {}, siteId = null) {
  const { skip, take } = pagination(query, { limit: 100, maxLimit: 200 });
  const search = cleanSearch(query.search);
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.status) where.status = String(query.status);
  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: "insensitive" } },
      { channel: { contains: search, mode: "insensitive" } },
      { userId: { contains: search, mode: "insensitive" } },
      { user: { is: { OR: [
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ] } } },
    ];
  }
  return prisma.depositTransaction.findMany({
    where,
    include: { user: true, promotion: true, bankAccount: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

async function approveDeposit({ id, admin, req, note, siteId = null }) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.depositTransaction.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Deposit not found");
      error.statusCode = 404;
      throw error;
    }
    if (before.status !== "pending") {
      const error = new Error("Deposit is not pending");
      error.statusCode = 400;
      throw error;
    }

    const movement = await createWalletMovement({
      tx,
      userId: before.userId,
      siteId: before.siteId,
      type: "deposit",
      amount: before.amount,
      referenceType: "deposit",
      referenceId: before.id,
      createdByType: "admin",
      createdById: admin.id,
      note: note || `Deposit approved ${before.transactionId}`,
      transactionPrefix: "WLG",
    });

    const after = await tx.depositTransaction.update({
      where: { id },
      data: {
        status: "approved",
        approvedById: admin.id,
        approvedAt: new Date(),
      },
    });

    await logAdminAction({
      tx,
      admin,
      action: "deposit.approve",
      targetType: "deposit",
      targetId: id,
      before,
      after: { deposit: after, ledger: movement.ledger },
      req,
      siteId: before.siteId,
    });

    return { deposit: after, wallet: movement.wallet, ledger: movement.ledger };
  });
}

async function rejectDeposit({ id, rejectReason, admin, req, siteId = null }) {
  if (!rejectReason) {
    const error = new Error("reject_reason is required");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const before = await tx.depositTransaction.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Deposit not found");
      error.statusCode = 404;
      throw error;
    }
    if (before.status !== "pending") {
      const error = new Error("Deposit is not pending");
      error.statusCode = 400;
      throw error;
    }

    const after = await tx.depositTransaction.update({
      where: { id },
      data: { status: "rejected", rejectReason },
    });

    await logAdminAction({
      tx,
      admin,
      action: "deposit.reject",
      targetType: "deposit",
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
  createDeposit,
  listUserDeposits,
  listDeposits,
  approveDeposit,
  rejectDeposit,
};
