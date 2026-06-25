const { Prisma } = require("@prisma/client");
const walletService = require("./memberRewardWallet.service");

function toNumber(value) {
  if (value && typeof value.toNumber === "function") return value.toNumber();
  return Number(value || 0);
}

function fromDb(row) {
  const payload = row.payload || {};
  return {
    id: row.id,
    siteId: row.siteId,
    memberId: row.memberId,
    type: row.rewardType,
    amount: toNumber(row.amount),
    label: row.label,
    status: row.status,
    source: row.sourceType,
    sourceId: row.sourceId,
    reference: payload.reference || null,
    metadata: payload.metadata || {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function createMemberRewardPrismaStore(prisma) {
  if (!prisma) throw new Error("Prisma client is required for MemberRewardPrismaStore");

  return {
    async addReward(input) {
      const row = walletService.normalizeRewardInput(input);
      const duplicate = await prisma.memberRewardWalletEntry.findUnique({
        where: {
          siteId_sourceType_sourceId: {
            siteId: row.siteId,
            sourceType: row.source,
            sourceId: row.sourceId,
          },
        },
      });
      if (duplicate) return walletService.publicReward(fromDb(duplicate));

      const created = await prisma.memberRewardWalletEntry.create({
        data: {
          id: row.id,
          siteId: row.siteId,
          memberId: row.memberId,
          rewardType: row.type,
          amount: new Prisma.Decimal(row.amount),
          label: row.label,
          status: row.status,
          sourceType: row.source,
          sourceId: row.sourceId,
          payload: {
            reference: row.reference,
            metadata: row.metadata,
          },
        },
      });
      return walletService.publicReward(fromDb(created));
    },

    async listRewards({ siteId, memberId, query = {} }) {
      const where = { siteId, memberId };
      if (query.type) where.rewardType = String(query.type).toLowerCase();
      if (query.status) where.status = String(query.status).toLowerCase();
      const rows = await prisma.memberRewardWalletEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return { rewards: rows.map((row) => walletService.publicReward(fromDb(row))) };
    },

    async history({ siteId, memberId, query = {} }) {
      const limit = Math.min(Math.max(Number(query.limit || 50), 1), 100);
      const rows = await prisma.memberRewardWalletEntry.findMany({
        where: { siteId, memberId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return { history: rows.map((row) => walletService.publicReward(fromDb(row))) };
    },

    async summary({ siteId, memberId }) {
      const rows = await prisma.memberRewardWalletEntry.findMany({ where: { siteId, memberId } });
      return walletService.summarizeRows(rows.map(fromDb));
    },

    async resetForSmoke({ siteIdPrefix = "site_code_center_persist" } = {}) {
      await prisma.memberRewardWalletEntry.deleteMany({
        where: { siteId: { startsWith: siteIdPrefix } },
      });
    },
  };
}

module.exports = {
  createMemberRewardPrismaStore,
};
