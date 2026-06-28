"use strict";

const { simulatePromotionAdminDryRunStagingRouteMount } = require("../utils/promotionAdminDryRunStagingRouteMount");

async function promotionAdminDryRun(req, res) {
  const response = simulatePromotionAdminDryRunStagingRouteMount({
    method: req.method,
    path: String(req.originalUrl || req.path || "").split("?")[0],
    params: req.params,
    body: req.body,
    actor: req.admin,
  });

  return res.status(response.status).json(response.body);
}

module.exports = {
  promotionAdminDryRun,
};
