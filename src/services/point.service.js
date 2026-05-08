const prisma = require("../config/prisma");
const { assertPositiveAmount, toDecimal } = require("../utils/money");
const { logAdminAction } = require("./adminLog.service");

async function listPoints(userId, siteId = null) {
  const [user, ledgers] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, ...(siteId ? { siteId } : {}) } }),
    prisma.pointLedger.findMany({
      where: { userId, ...(siteId ? { siteId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    balance: user ? user.points : "0.00",
    ledgers,
  };
}

async function movePoints({ userId, siteId = null, amount, direction, reason, referenceType, referenceId, admin, req }) {
  const positiveAmount = assertPositiveAmount(amount);
  if (!["add", "remove"].includes(direction)) {
    const error = new Error("Invalid point direction");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({ where: { id: userId, ...(siteId ? { siteId } : {}) } });
    if (!user) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }

    const before = toDecimal(user.points);
    const movement = direction === "add" ? positiveAmount : positiveAmount.negated();
    const after = before.plus(movement);
    if (after.lt(0)) {
      const error = new Error("Insufficient point balance");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: after },
    });

    const ledger = await tx.pointLedger.create({
      data: {
        userId,
        siteId: user.siteId,
        before,
        amount: movement,
        after,
        reason,
        referenceType: referenceType || "admin_points",
        referenceId: referenceId || admin.id,
        createdByType: "admin",
        createdById: admin.id,
      },
    });

    await logAdminAction({
      tx,
      admin,
      action: direction === "add" ? "points.add" : "points.remove",
      targetType: "user",
      targetId: userId,
      before: user,
      after: { user: updatedUser, ledger },
      req,
      siteId: user.siteId,
    });

    return { user: updatedUser, ledger };
  });
}

module.exports = {
  listPoints,
  movePoints,
};
