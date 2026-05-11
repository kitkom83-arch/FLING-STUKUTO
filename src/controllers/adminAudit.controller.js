const { success } = require("../utils/response");
const {
  auditLogSummary,
  listAuditLogs,
  listSecurityEvents,
  securityEventSummary,
} = require("../services/adminLog.service");

async function auditLogs(req, res) {
  return success(res, await listAuditLogs({ ...req.query, siteId: req.siteId }));
}

async function auditLogsSummary(req, res) {
  return success(res, await auditLogSummary({ ...req.query, siteId: req.siteId }));
}

async function securityEvents(req, res) {
  return success(res, await listSecurityEvents({ ...req.query, siteId: req.siteId }));
}

async function securityEventsSummary(req, res) {
  return success(res, await securityEventSummary({ ...req.query, siteId: req.siteId }));
}

module.exports = {
  auditLogs,
  auditLogsSummary,
  securityEvents,
  securityEventsSummary,
};
