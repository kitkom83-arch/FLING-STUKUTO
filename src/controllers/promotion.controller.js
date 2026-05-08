const { success } = require("../utils/response");
const promotionService = require("../services/promotion.service");

async function list(req, res) {
  return success(res, await promotionService.listPromotions(req.siteId));
}

async function claim(req, res) {
  return success(res, await promotionService.claimPromotion(req.user.id, req.siteId, req.params.id), 201);
}

module.exports = {
  list,
  claim,
};
