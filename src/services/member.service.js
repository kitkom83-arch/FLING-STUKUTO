const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");
const { cleanSearch, pagination } = require("../utils/query");

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
  setBlocked,
};
