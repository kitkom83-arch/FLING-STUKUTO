const { success } = require("../utils/response");
const {
  auditLogSummary,
  listAuditLogs,
  listSecurityEvents,
  securityEventSummary,
} = require("../services/adminLog.service");

const WHEEL_AUDIT_ACTIONS = [
  "wheel.campaign.update",
  "wheel.reward.create",
  "wheel.reward.update",
  "wheel.reward.status.update",
  "wheel.memberReward.status.update",
];
const WHEEL_AUDIT_ACTION_SET = new Set(WHEEL_AUDIT_ACTIONS);

function auditQuery(req) {
  const query = { ...req.query, siteId: req.siteId };
  if (!req.auditWheelOnly) return query;
  if (query.action) {
    return WHEEL_AUDIT_ACTION_SET.has(query.action)
      ? query
      : { ...query, action: "__wheel_audit_denied__" };
  }
  return { ...query, actions: WHEEL_AUDIT_ACTIONS };
}

async function auditLogs(req, res) {
  return success(res, await listAuditLogs(auditQuery(req)));
}

async function auditLogsSummary(req, res) {
  return success(res, await auditLogSummary(auditQuery(req)));
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
