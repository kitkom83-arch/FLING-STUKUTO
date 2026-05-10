const prisma = require("../config/prisma");
const { assertPositiveAmount } = require("../utils/money");
const { transactionId } = require("../utils/ids");
const { createWalletMovement, ensureWallet } = require("./wallet.service");
const { logAdminAction } = require("./adminLog.service");
const { cleanSearch, pagination } = require("../utils/query");

async function createWithdrawal(userId, siteId, data) {
  const amount = assertPositiveAmount(data.amount);
  const account = await prisma.userBankAccount.findFirst({
    where: { id: data.user_bank_account_id, userId, siteId, status: "approved" },
  });
  if (!account) {
    const error = new Error("Approved bank account not found");
    error.statusCode = 404;
    throw error;
  }

  const wallet = await ensureWallet(userId, prisma, siteId);
  if (wallet.balance.lt(amount)) {
    const error = new Error("Insufficient wallet balance");
    error.statusCode = 400;
    throw error;
  }

  return prisma.withdrawTransaction.create({
    data: {
      siteId,
      transactionId: transactionId("PGW"),
      userId,
      userBankAccountId: account.id,
      amount,
      note: data.note || null,
      status: "pending",
    },
    include: { userBankAccount: true },
  });
}

async function listUserWithdrawals(userId, siteId) {
  return prisma.withdrawTransaction.findMany({
    where: { userId, siteId },
    include: { userBankAccount: true },
    orderBy: { createdAt: "desc" },
  });
}

async function listWithdrawals(query = {}, siteId = null) {
  const { skip, take } = pagination(query, { limit: 100, maxLimit: 200 });
  const search = cleanSearch(query.search);
  const where = { ...(siteId ? { siteId } : {}) };
  if (query.status) where.status = String(query.status);
  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: "insensitive" } },
      { userId: { contains: search, mode: "insensitive" } },
      { user: { is: { OR: [
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ] } } },
      { userBankAccount: { is: { OR: [
        { bankCode: { contains: search, mode: "insensitive" } },
        { accountNumber: { contains: search, mode: "insensitive" } },
        { accountName: { contains: search, mode: "insensitive" } },
      ] } } },
    ];
  }
  return prisma.withdrawTransaction.findMany({
    where,
    include: { user: true, userBankAccount: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

async function approveWithdrawal({ id, admin, req, note, siteId = null }) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.withdrawTransaction.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }
    if (before.status !== "pending") {
      const error = new Error("Withdrawal is not pending");
      error.statusCode = 400;
      throw error;
    }

    const movement = await createWalletMovement({
      tx,
      userId: before.userId,
      siteId: before.siteId,
      type: "withdraw",
      amount: before.amount,
      referenceType: "withdraw",
      referenceId: before.id,
      createdByType: "admin",
      createdById: admin.id,
      note: note || `Withdrawal approved ${before.transactionId}`,
      transactionPrefix: "WLG",
    });

    const after = await tx.withdrawTransaction.update({
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
      action: "withdraw.approve",
      targetType: "withdraw",
      targetId: id,
      before,
      after: { withdrawal: after, ledger: movement.ledger },
      req,
      siteId: before.siteId,
    });

    return { withdrawal: after, wallet: movement.wallet, ledger: movement.ledger };
  });
}

async function rejectWithdrawal({ id, rejectReason, admin, req, siteId = null }) {
  if (!rejectReason) {
    const error = new Error("reject_reason is required");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const before = await tx.withdrawTransaction.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }
    if (before.status !== "pending") {
      const error = new Error("Only pending withdrawal can be rejected");
      error.statusCode = 400;
      throw error;
    }

    const after = await tx.withdrawTransaction.update({
      where: { id },
      data: { status: "rejected", rejectReason },
    });

    await logAdminAction({
      tx,
      admin,
      action: "withdraw.reject",
      targetType: "withdraw",
      targetId: id,
      before,
      after,
      req,
      siteId: before.siteId,
    });

    return after;
  });
}

async function markWithdrawalPaid({ id, admin, req, siteId = null }) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.withdrawTransaction.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }
    if (before.status !== "approved") {
      const error = new Error("Withdrawal must be approved before mark-paid");
      error.statusCode = 400;
      throw error;
    }

    const after = await tx.withdrawTransaction.update({
      where: { id },
      data: {
        status: "paid",
        paidById: admin.id,
        paidAt: new Date(),
      },
    });

    await logAdminAction({
      tx,
      admin,
      action: "withdraw.mark_paid",
      targetType: "withdraw",
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
  createWithdrawal,
  listUserWithdrawals,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
};
