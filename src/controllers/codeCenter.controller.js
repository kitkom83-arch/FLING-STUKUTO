const { success } = require("../utils/response");
const codeCenterService = require("../services/codeCenter.service");

async function adminListCampaigns(req, res) {
  return success(res, await codeCenterService.listCampaigns({ siteId: req.siteId, query: req.query }));
}

async function adminCreateCampaign(req, res) {
  return success(
    res,
    await codeCenterService.createCampaign({
      siteId: req.siteId,
      siteCode: req.siteCode,
      admin: req.admin,
      body: req.body,
    }),
    201
  );
}

async function adminGenerateCodes(req, res) {
  return success(
    res,
    await codeCenterService.generateCodes({
      siteId: req.siteId,
      campaignId: req.params.id,
      admin: req.admin,
      body: req.body,
    }),
    201
  );
}

async function adminRedeemLogs(req, res) {
  return success(res, await codeCenterService.listRedeemLogs({ siteId: req.siteId, query: req.query }));
}

async function redeem(req, res) {
  return success(
    res,
    await codeCenterService.redeemCode({
      siteId: req.siteId,
      userId: req.user.id,
      body: req.body,
    }),
    201
  );
}

async function myRedeemLogs(req, res) {
  return success(
    res,
    await codeCenterService.listRedeemLogs({
      siteId: req.siteId,
      query: { ...req.query, memberId: req.user.id },
    })
  );
}

module.exports = {
  adminListCampaigns,
  adminCreateCampaign,
  adminGenerateCodes,
  adminRedeemLogs,
  redeem,
  myRedeemLogs,
};
