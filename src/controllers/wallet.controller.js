const { success } = require("../utils/response");
const walletService = require("../services/wallet.service");
const pointService = require("../services/point.service");

async function wallet(req, res) {
  return success(res, await walletService.getWalletSummary(req.user.id, req.siteId));
}

async function ledger(req, res) {
  return success(res, await walletService.listLedger(req.user.id, req.query, req.siteId));
}

async function points(req, res) {
  return success(res, await pointService.listPoints(req.user.id, req.siteId));
}

module.exports = {
  wallet,
  ledger,
  points,
};
