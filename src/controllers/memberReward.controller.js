const { success } = require("../utils/response");
const memberRewardWallet = require("../services/memberRewardWallet.service");
const { ensureRuntimeStores } = require("../services/codeCenterRuntimeStore");

async function listMine(req, res) {
  ensureRuntimeStores();
  return success(
    res,
    await memberRewardWallet.listRewards({ siteId: req.siteId, memberId: req.user.id, query: req.query })
  );
}

async function summary(req, res) {
  ensureRuntimeStores();
  return success(res, await memberRewardWallet.summary({ siteId: req.siteId, memberId: req.user.id }));
}

async function history(req, res) {
  ensureRuntimeStores();
  return success(
    res,
    await memberRewardWallet.history({ siteId: req.siteId, memberId: req.user.id, query: req.query })
  );
}

module.exports = {
  listMine,
  summary,
  history,
};
