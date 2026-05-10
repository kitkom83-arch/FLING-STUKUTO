const prisma = require("../config/prisma");
const { toDecimal } = require("../utils/money");
const { createWalletMovement } = require("./wallet.service");

function duplicateClaimError() {
  const error = new Error("Promotion already claimed");
  error.statusCode = 409;
  return error;
}

function isPromotionClaimUniqueError(error) {
  if (!error || error.code !== "P2002") return false;
  const target = error.meta && error.meta.target;
  if (Array.isArray(target)) {
    return target.includes("userId") && target.includes("promotionId");
  }
  return String(target || "").includes("promotion_claims_userId_promotionId_key");
}

function calculateBonus(promotion) {
  const value = promotion.bonusValue ? toDecimal(promotion.bonusValue) : toDecimal("0.00");
  if (value.lte(0)) return toDecimal("0.00");
  if (promotion.bonusType === "fixed") return value;
  if (promotion.bonusType === "percent") {
    const minDeposit = promotion.minDeposit ? toDecimal(promotion.minDeposit) : toDecimal("100.00");
    return minDeposit.mul(value).div(100).toDecimalPlaces(2);
  }
  return toDecimal("0.00");
}

async function listPromotions(siteId) {
  const now = new Date();
  return prisma.promotion.findMany({
    where: {
      siteId,
      status: "active",
      OR: [{ startAt: null }, { startAt: { lte: now } }],
      AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
    },
    orderBy: { createdAt: "asc" },
  });
}

async function claimPromotion(userId, siteId, promotionId) {
  try {
    return await prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.findFirst({ where: { id: promotionId, siteId } });
      if (!promotion || promotion.status !== "active") {
        const error = new Error("Promotion not found");
        error.statusCode = 404;
        throw error;
      }

      const existingClaim = await tx.promotionClaim.findFirst({
        where: { userId, promotionId },
        select: { id: true },
      });
      if (existingClaim) throw duplicateClaimError();

      const bonusAmount = calculateBonus(promotion);
      const claim = await tx.promotionClaim.create({
        data: {
          userId,
          siteId,
          promotionId,
          bonusAmount,
          status: "claimed",
        },
      });

      let walletMovement = null;
      if (bonusAmount.gt(0)) {
        walletMovement = await createWalletMovement({
          tx,
          userId,
          siteId,
          type: "promotion_bonus",
          amount: bonusAmount,
          referenceType: "promotion_claim",
          referenceId: claim.id,
          createdByType: "system",
          createdById: null,
          note: `Promotion claim: ${promotion.title}`,
        });
      }

      const base = promotion.minDeposit ? toDecimal(promotion.minDeposit) : bonusAmount;
      const requiredAmount = base.plus(bonusAmount).mul(toDecimal(promotion.turnoverMultiplier || "0.00"));
      const turnover = await tx.turnoverRequirement.create({
        data: {
          userId,
          siteId,
          promotionId,
          promotionClaimId: claim.id,
          requiredAmount,
          currentAmount: toDecimal("0.00"),
          status: requiredAmount.gt(0) ? "active" : "completed",
        },
      });

      return {
        promotion,
        claim,
        turnover,
        wallet: walletMovement ? walletMovement.wallet : null,
        ledger: walletMovement ? walletMovement.ledger : null,
      };
    });
  } catch (error) {
    if (isPromotionClaimUniqueError(error)) throw duplicateClaimError();
    throw error;
  }
}

module.exports = {
  listPromotions,
  claimPromotion,
};
