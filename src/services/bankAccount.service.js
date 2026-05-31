const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");

function maskAccountNumber(value) {
  const digits = String(value || "").replace(/\s+/g, "");
  if (!digits) return null;
  if (digits.length <= 4) return "****";
  return `${"*".repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}

function publicUserBankAccount(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteId: row.siteId,
    userId: row.userId,
    bankCode: row.bankCode,
    accountNumberMasked: maskAccountNumber(row.accountNumber),
    accountName: row.accountName,
    status: row.status,
    rejectReason: row.rejectReason,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user
      ? {
          id: row.user.id,
          username: row.user.username,
          phone: row.user.phone,
          status: row.user.status,
          createdAt: row.user.createdAt,
        }
      : undefined,
  };
}

function reviewAuditSnapshot(row) {
  return {
    id: row.id,
    siteId: row.siteId,
    userId: row.userId,
    bankCode: row.bankCode,
    accountNumberMasked: maskAccountNumber(row.accountNumber),
    accountName: row.accountName,
    status: row.status,
    rejectReason: row.rejectReason,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

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
  const rows = await prisma.userBankAccount.findMany({
    where: { status: "pending", ...(siteId ? { siteId } : {}) },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(publicUserBankAccount);
}

async function updateBankAccountStatus({ id, status, reason, admin, req, siteId = null, siteCode = null }) {
  if (!["approved", "rejected"].includes(status)) {
    const error = new Error("Invalid bank account status");
    error.statusCode = 400;
    throw error;
  }
  const auditReason = String(reason || "").trim();
  if (!auditReason) {
    const error = new Error("reason is required");
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
    if (before.status !== "pending") {
      const error = new Error("Bank account has already been reviewed");
      error.statusCode = 409;
      throw error;
    }

    const after = await tx.userBankAccount.update({
      where: { id },
      data: {
        status,
        rejectReason: status === "rejected" ? auditReason : null,
        approvedById: status === "approved" ? admin.id : null,
        approvedAt: status === "approved" ? new Date() : null,
      },
    });
    const auditAction = status === "approved" ? "member.bank.approve" : "member.bank.reject";

    await logAdminAction({
      tx,
      admin,
      action: auditAction,
      targetType: "user_bank_account",
      targetId: id,
      before: reviewAuditSnapshot(before),
      after: reviewAuditSnapshot(after),
      metadata: {
        reason: auditReason,
        previousStatus: before.status,
        nextStatus: after.status,
        targetType: "user_bank_account",
        targetId: id,
        actor: { id: admin.id, username: admin.username },
        siteCode,
      },
      req,
      siteId: before.siteId,
    });

    return {
      id: after.id,
      status: after.status,
      auditAction,
    };
  });
}

module.exports = {
  listUserBankAccounts,
  createUserBankAccount,
  listPendingBankAccounts,
  updateBankAccountStatus,
};
