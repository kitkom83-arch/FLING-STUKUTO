const { success } = require("../utils/response");
const wheelService = require("../services/wheel.service");

async function memberConfig(req, res) {
  return success(
    res,
    await wheelService.getMemberConfig({
      siteId: req.siteId,
      userId: req.user.id,
      campaignId: req.query.campaignId || req.query.campaign_id,
    })
  );
}

async function spin(req, res) {
  return success(
    res,
    await wheelService.spin({
      siteId: req.siteId,
      userId: req.user.id,
      body: req.body,
      req,
    }),
    201
  );
}

async function history(req, res) {
  return success(
    res,
    await wheelService.history({
      siteId: req.siteId,
      userId: req.user.id,
      query: req.query,
    })
  );
}

async function myRewards(req, res) {
  return success(
    res,
    await wheelService.myRewards({
      siteId: req.siteId,
      userId: req.user.id,
      query: req.query,
    })
  );
}

async function adminConfig(req, res) {
  return success(res, await wheelService.adminConfig(req.siteId));
}

async function updateCampaign(req, res) {
  return success(
    res,
    await wheelService.updateCampaign({
      siteId: req.siteId,
      siteCode: req.siteCode,
      admin: req.admin,
      body: req.body,
      req,
    })
  );
}

async function createReward(req, res) {
  return success(
    res,
    await wheelService.createReward({
      siteId: req.siteId,
      siteCode: req.siteCode,
      admin: req.admin,
      body: req.body,
      req,
    }),
    201
  );
}

async function updateReward(req, res) {
  return success(
    res,
    await wheelService.updateReward({
      siteId: req.siteId,
      siteCode: req.siteCode,
      admin: req.admin,
      rewardId: req.params.id,
      body: req.body,
      req,
    })
  );
}

async function adminSpins(req, res) {
  return success(
    res,
    await wheelService.listAdminSpins({
      siteId: req.siteId,
      query: req.query,
    })
  );
}

module.exports = {
  memberConfig,
  spin,
  history,
  myRewards,
  adminConfig,
  updateCampaign,
  createReward,
  updateReward,
  adminSpins,
};
