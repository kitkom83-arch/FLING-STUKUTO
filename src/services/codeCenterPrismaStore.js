const crypto = require("crypto");
const codeCenterService = require("./codeCenter.service");
const memberRewardWallet = require("./memberRewardWallet.service");

function rewardFromCampaign(row) {
  return {
    type: row.rewardType,
    amount: Number(row.rewardPayload && row.rewardPayload.amount ? row.rewardPayload.amount : 0),
    label: String((row.rewardPayload && row.rewardPayload.label) || row.rewardType || "Reward"),
    metadata: memberRewardWallet.sanitize((row.rewardPayload && row.rewardPayload.metadata) || {}),
  };
}

function campaignFromDb(row) {
  return {
    id: row.id,
    siteId: row.siteId,
    siteCode: row.siteCode,
    name: row.name,
    status: row.status,
    reward: rewardFromCampaign(row),
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    maxRedemptions: row.maxRedemptions,
    perMemberLimit: row.perMemberLimit,
    createdBy: row.createdBy,
    codeCount: row._count ? row._count.codes : row.codeCount,
    redeemedCount: row.redeemedCount || 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function codeFromDb(row) {
  return {
    id: row.id,
    siteId: row.siteId,
    campaignId: row.campaignId,
    code: row.code,
    status: row.status,
    maxRedemptions: row.maxRedemptions,
    redeemedCount: row.redeemedCount,
    createdBy: row.createdBy,
    redeemedBy: row.redeemedBy,
    redeemedAt: row.redeemedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function logFromDb(row) {
  const payload = row.rewardPayload || {};
  return {
    id: row.id,
    siteId: row.siteId,
    campaignId: row.campaignId,
    codeId: row.codeId,
    code: row.code,
    memberId: row.memberId,
    rewardType: row.rewardType,
    rewardAmount: Number(payload.amount || 0),
    rewardPayload: payload,
    status: row.status,
    result: row.result,
    rewardId: row.rewardEntryId,
    createdAt: row.createdAt,
  };
}

async function campaignCounts(prisma, campaignId) {
  const [codeCount, redeemedCount] = await Promise.all([
    prisma.codeCenterCode.count({ where: { campaignId } }),
    prisma.codeCenterCode.count({ where: { campaignId, status: "redeemed" } }),
  ]);
  return { codeCount, redeemedCount };
}

function createCodeCenterPrismaStore(prisma) {
  if (!prisma) throw new Error("Prisma client is required for CodeCenterPrismaStore");

  return {
    async createCampaign(input) {
      const campaign = codeCenterService.normalizeCampaignInput(input);
      const created = await prisma.codeCampaign.create({
        data: {
          id: campaign.id,
          siteId: campaign.siteId,
          siteCode: campaign.siteCode,
          name: campaign.name,
          status: campaign.status,
          rewardType: campaign.reward.type,
          rewardPayload: memberRewardWallet.sanitize(campaign.reward),
          startsAt: campaign.startsAt ? new Date(campaign.startsAt) : null,
          expiresAt: campaign.expiresAt ? new Date(campaign.expiresAt) : null,
          maxRedemptions: campaign.maxRedemptions,
          perMemberLimit: campaign.perMemberLimit,
          createdBy: campaign.createdBy,
        },
        include: { _count: { select: { codes: true } } },
      });
      return { campaign: codeCenterService.publicCampaign(campaignFromDb(created)) };
    },

    async listCampaigns({ siteId, query = {} }) {
      const where = { siteId };
      if (query.status) where.status = String(query.status).toLowerCase();
      const rows = await prisma.codeCampaign.findMany({
        where,
        include: { _count: { select: { codes: true } } },
        orderBy: { createdAt: "desc" },
      });
      const campaigns = [];
      for (const row of rows) {
        campaigns.push(
          codeCenterService.publicCampaign({
            ...campaignFromDb(row),
            ...(await campaignCounts(prisma, row.id)),
          })
        );
      }
      return { campaigns };
    },

    async generateCodes({ siteId, campaignId, admin = null, body = {} }) {
      const campaign = await prisma.codeCampaign.findFirst({ where: { siteId, id: campaignId } });
      if (!campaign) throw codeCenterService.error("Campaign not found", 404);
      const campaignRow = campaignFromDb(campaign);
      const count = Math.min(Math.max(Number(body.count || 1), 1), 100);
      const prefix = codeCenterService.normalizeCode(body.prefix || campaignRow.name.slice(0, 4) || "CODE").slice(0, 12) || "CODE";
      const created = [];
      for (let index = 0; index < count; index += 1) {
        let codeValue = "";
        let row = null;
        for (let attempt = 0; attempt < 10 && !row; attempt += 1) {
          codeValue = `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
          try {
            row = await prisma.codeCenterCode.create({
              data: {
                id: `code_${crypto.randomUUID()}`,
                siteId,
                campaignId,
                code: codeValue,
                status: "active",
                maxRedemptions: 1,
                redeemedCount: 0,
                createdBy: admin ? { id: admin.id, username: admin.username } : null,
              },
            });
          } catch (err) {
            if (err && err.code !== "P2002") throw err;
          }
        }
        if (!row) throw codeCenterService.error("Unable to generate unique code", 409);
        created.push(codeCenterService.publicCode(codeFromDb(row)));
      }
      return {
        campaign: codeCenterService.publicCampaign({ ...campaignRow, ...(await campaignCounts(prisma, campaignId)) }),
        codes: created,
      };
    },

    async redeemCode({ siteId, userId, body = {} }) {
      const codeValue = codeCenterService.normalizeCode(body.code);
      if (!codeValue) throw codeCenterService.error("code is required", 400);

      const result = await prisma.$transaction(async (tx) => {
        const codeRow = await tx.codeCenterCode.findFirst({ where: { siteId, code: codeValue } });
        if (!codeRow) throw codeCenterService.error("Code not found", 404);
        const campaign = await tx.codeCampaign.findFirst({ where: { siteId, id: codeRow.campaignId } });
        if (!campaign) throw codeCenterService.error("Campaign not found", 404);
        const campaignRow = campaignFromDb(campaign);
        const [campaignRedeems, memberRedeems] = await Promise.all([
          tx.codeRedeemLog.count({ where: { campaignId: campaign.id, status: "success" } }),
          tx.codeRedeemLog.count({ where: { campaignId: campaign.id, memberId: userId, status: "success" } }),
        ]);

        codeCenterService.assertRedeemable({
          campaign: campaignRow,
          codeRow: codeFromDb(codeRow),
          userId,
          campaignRedeems,
          memberRedeems,
        });

        const reward = campaignRow.reward;
        const redeemLock = await tx.codeCenterCode.updateMany({
          where: { id: codeRow.id, status: "active" },
          data: {
            status: "redeemed",
            redeemedBy: userId,
            redeemedAt: new Date(),
            redeemedCount: { increment: 1 },
          },
        });
        if (redeemLock.count !== 1) {
          throw codeCenterService.error("Code is not redeemable", 409, { codeStatus: "redeemed" });
        }

        const rewardEntry = await tx.memberRewardWalletEntry.create({
          data: {
            id: `reward_${crypto.randomUUID()}`,
            siteId,
            memberId: userId,
            rewardType: reward.type,
            amount: reward.amount,
            label: reward.label,
            status: reward.type === "pending_reward" ? "pending" : "available",
            sourceType: "code_center",
            sourceId: `redeem_${crypto.randomUUID()}`,
            payload: {
              reference: { campaignId: campaign.id, codeId: codeRow.id, code: codeRow.code },
              metadata: reward.metadata,
            },
          },
        });

        const log = await tx.codeRedeemLog.create({
          data: {
            id: rewardEntry.sourceId,
            siteId,
            campaignId: campaign.id,
            codeId: codeRow.id,
            code: codeRow.code,
            memberId: userId,
            status: "success",
            result: "reward_wallet_created",
            rewardType: reward.type,
            rewardPayload: memberRewardWallet.sanitize(reward),
            rewardEntryId: rewardEntry.id,
          },
        });

        return {
          redeem: codeCenterService.publicRedeemLog(logFromDb(log)),
          reward: memberRewardWallet.publicReward({
            id: rewardEntry.id,
            siteId: rewardEntry.siteId,
            memberId: rewardEntry.memberId,
            type: rewardEntry.rewardType,
            amount: Number(rewardEntry.amount),
            label: rewardEntry.label,
            status: rewardEntry.status,
            source: rewardEntry.sourceType,
            sourceId: rewardEntry.sourceId,
            reference: rewardEntry.payload.reference,
            metadata: rewardEntry.payload.metadata,
            createdAt: rewardEntry.createdAt,
            updatedAt: rewardEntry.updatedAt,
          }),
          cashWalletMutation: false,
        };
      });

      return result;
    },

    async listRedeemLogs({ siteId, query = {} }) {
      const where = { siteId };
      const memberId = query.memberId || query.member_id || null;
      if (memberId) where.memberId = memberId;
      const rows = await prisma.codeRedeemLog.findMany({ where, orderBy: { createdAt: "desc" } });
      return { redeemLogs: rows.map((row) => codeCenterService.publicRedeemLog(logFromDb(row))) };
    },

    async resetForSmoke({ siteIdPrefix = "site_code_center_persist" } = {}) {
      await prisma.codeRedeemLog.deleteMany({ where: { siteId: { startsWith: siteIdPrefix } } });
      await prisma.memberRewardWalletEntry.deleteMany({ where: { siteId: { startsWith: siteIdPrefix } } });
      await prisma.codeCenterCode.deleteMany({ where: { siteId: { startsWith: siteIdPrefix } } });
      await prisma.codeCampaign.deleteMany({ where: { siteId: { startsWith: siteIdPrefix } } });
    },
  };
}

module.exports = {
  createCodeCenterPrismaStore,
};
