const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");

async function listUserBankAccounts(userId, siteId) {
  return prisma.userBankAccount.findMany({
    where: { userId, siteId },
    orderBy: { createdAt: "desc" },
  });
}

async function createUserBankAccount(userId, siteId, data) {
  return prisma.userBankAccount.create({
    data: {
      siteId,
      userId,
      bankCode: data.bank_code,
      accountNumber: data.bank_account_number,
      accountName: data.bank_account_name,
      status: "pending",
    },
  });
}

async function listPendingBankAccounts(siteId = null) {
  return prisma.userBankAccount.findMany({
    where: { status: "pending", ...(siteId ? { siteId } : {}) },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

async function updateBankAccountStatus({ id, status, rejectReason = null, admin, req, siteId = null }) {
  if (!["approved", "rejected"].includes(status)) {
    const error = new Error("Invalid bank account status");
    error.statusCode = 400;
    throw error;
  }
  if (status === "rejected" && !rejectReason) {
    const error = new Error("reject_reason is required");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const before = await tx.userBankAccount.findFirst({
      where: { id, ...(siteId ? { siteId } : {}) },
    });
    if (!before) {
      const error = new Error("Bank account not found");
      error.statusCode = 404;
      throw error;
    }

    const after = await tx.userBankAccount.update({
      where: { id },
      data: {
        status,
        rejectReason: status === "rejected" ? rejectReason : null,
        approvedById: status === "approved" ? admin.id : null,
        approvedAt: status === "approved" ? new Date() : null,
      },
    });

    await logAdminAction({
      tx,
      admin,
      action: status === "approved" ? "bank_account.approve" : "bank_account.reject",
      targetType: "user_bank_account",
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
  listUserBankAccounts,
  createUserBankAccount,
  listPendingBankAccounts,
  updateBankAccountStatus,
};
