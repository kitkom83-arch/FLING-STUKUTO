const prisma = require("../config/prisma");
const { cleanData } = require("../utils/response");
const { cleanSearch, pagination } = require("../utils/query");

const SENSITIVE_KEY_PATTERN =
  /(password|passcode|token|secret|api[_-]?key|apikey|authorization|session|cookie|database[_-]?url|refresh)/i;
const SENSITIVE_VALUE_PATTERNS = [
  /postgres(?:ql)?:\/\/[^\s"']+/i,
  /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
  new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "i"),
];
const REDACTED = "[REDACTED]";

const ROLE_ACTIONS = new Set(["admin.role.update", "admin.role.permissions.update"]);
const PERMISSION_ACTIONS = new Set(["admin.role.update", "admin.role.permissions.update"]);
const SCHEDULE_ACTIONS = new Set([
  "admin.schedule.update",
  "admin.schedule.enable",
  "admin.schedule.disable",
  "admin.schedule.override_enable",
  "admin.schedule.override_disable",
  "admin.session.force_logout_schedule_end",
]);
const LOGIN_ACTIONS = new Set(["admin.login.success", "admin.login.blocked_outside_schedule", "admin.login.failed"]);
const EMERGENCY_OVERRIDE_ACTIONS = new Set([
  "admin.schedule.override_enable",
  "admin.schedule.override_disable",
]);
const SECURITY_ACTIONS = new Set([
  ...ROLE_ACTIONS,
  ...PERMISSION_ACTIONS,
  ...SCHEDULE_ACTIONS,
  ...LOGIN_ACTIONS,
]);

const MODULE_ACTIONS = {
  role: ROLE_ACTIONS,
  permission: PERMISSION_ACTIONS,
  schedule: SCHEDULE_ACTIONS,
  login: LOGIN_ACTIONS,
  security: SECURITY_ACTIONS,
};

const SUMMARY_ZERO = {
  totalEvents: 0,
  blockedLogins: 0,
  emergencyOverrides: 0,
  permissionChanges: 0,
  roleChanges: 0,
  scheduleChanges: 0,
  failedAttempts: 0,
  highSeverityCount: 0,
};

function isSensitiveString(value) {
  return typeof value === "string" && SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function sanitizeAdminLogData(value) {
  const cleaned = cleanData(value);
  if (Array.isArray(cleaned)) return cleaned.map(sanitizeAdminLogData);
  if (isSensitiveString(cleaned)) return REDACTED;
  if (!cleaned || typeof cleaned !== "object") return cleaned;
  return Object.fromEntries(
    Object.entries(cleaned)
      .filter(([key]) => !/^user[-_]?agent$/i.test(key))
      .map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : sanitizeAdminLogData(item),
      ])
  );
}

function maskIp(value) {
  if (!value) return null;
  const ip = String(value);
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    if (parts.length <= 2) return "x:x";
    return `${parts.slice(0, 2).join(":")}:x:x`;
  }
  return REDACTED;
}

function inferResult(action) {
  if (action === "admin.login.blocked_outside_schedule") return "blocked";
  if (String(action || "").includes(".blocked")) return "blocked";
  if (String(action || "").includes(".failed")) return "failed";
  return "success";
}

function inferSeverity(action) {
  if (action === "admin.schedule.override_enable") return "high";
  if (action === "admin.login.blocked_outside_schedule") return "high";
  if (String(action || "").includes(".failed") || String(action || "").includes(".blocked")) return "high";
  if (ROLE_ACTIONS.has(action) || PERMISSION_ACTIONS.has(action) || SCHEDULE_ACTIONS.has(action)) return "medium";
  return "low";
}

function inferModule(action) {
  if (LOGIN_ACTIONS.has(action)) return "login";
  if (SCHEDULE_ACTIONS.has(action)) return "schedule";
  if (ROLE_ACTIONS.has(action)) return "role";
  if (PERMISSION_ACTIONS.has(action)) return "permission";
  if (SECURITY_ACTIONS.has(action)) return "security";
  return "admin";
}

function classifyAction(action) {
  return {
    module: inferModule(action),
    result: inferResult(action),
    severity: inferSeverity(action),
  };
}

function actionSetForFilter(query = {}, securityOnly = false) {
  const sets = [];
  if (securityOnly) sets.push(SECURITY_ACTIONS);
  if (query.module && MODULE_ACTIONS[query.module]) sets.push(MODULE_ACTIONS[query.module]);
  if (query.result === "blocked") sets.push(new Set([...SECURITY_ACTIONS].filter((action) => inferResult(action) === "blocked")));
  if (query.result === "failed") sets.push(new Set([...SECURITY_ACTIONS].filter((action) => inferResult(action) === "failed")));
  if (query.result === "success") sets.push(new Set([...SECURITY_ACTIONS].filter((action) => inferResult(action) === "success")));
  if (query.severity) {
    sets.push(new Set([...SECURITY_ACTIONS].filter((action) => inferSeverity(action) === query.severity)));
  }
  if (sets.length === 0) return null;
  return sets.reduce((current, next) => new Set([...current].filter((action) => next.has(action))));
}

function parseDate(value, label) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${label} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function buildAuditWhere(query = {}, securityOnly = false) {
  const search = cleanSearch(query.search);
  const where = {};
  const actionSet = actionSetForFilter(query, securityOnly);
  const dateFrom = parseDate(query.dateFrom || query.date_from, "dateFrom");
  const dateTo = parseDate(query.dateTo || query.date_to, "dateTo");

  if (query.siteId) where.siteId = query.siteId;
  if (query.action) where.action = query.action;
  if (!query.action && Array.isArray(query.actions)) where.action = { in: query.actions };
  if (!query.action && !query.actions && actionSet) where.action = { in: [...actionSet] };
  if (query.status) where.action = query.status;
  if (query.adminId || query.admin_id) where.adminId = query.adminId || query.admin_id;
  if (query.targetAdminId || query.target_admin_id) {
    where.targetType = "admin";
    where.targetId = query.targetAdminId || query.target_admin_id;
  } else {
    if (query.target_type) where.targetType = query.target_type;
    if (query.target_id) where.targetId = query.target_id;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { targetType: { contains: search, mode: "insensitive" } },
      { targetId: { contains: search, mode: "insensitive" } },
      { admin: { is: { username: { contains: search, mode: "insensitive" } } } },
    ];
  }

  return where;
}

function formatAdmin(admin) {
  if (!admin) return null;
  return {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    status: admin.status,
  };
}

function formatAuditLog(row) {
  const classification = classifyAction(row.action);
  return {
    id: row.id,
    siteId: row.siteId,
    adminId: row.adminId,
    admin: formatAdmin(row.admin),
    actorAdmin: formatAdmin(row.admin),
    action: row.action,
    module: classification.module,
    result: classification.result,
    severity: classification.severity,
    targetType: row.targetType,
    targetId: row.targetId,
    targetAdminId: row.targetType === "admin" ? row.targetId : null,
    metadata: sanitizeAdminLogData(row.metadata),
    beforeJson: sanitizeAdminLogData(row.beforeJson),
    afterJson: sanitizeAdminLogData(row.afterJson),
    ipAddress: maskIp(row.ipAddress),
    createdAt: row.createdAt,
  };
}

function filterFormattedRows(rows, query = {}, securityOnly = false) {
  return rows.filter((row) => {
    if (securityOnly && !SECURITY_ACTIONS.has(row.action)) return false;
    const permissionModuleMatch = query.module === "permission" && PERMISSION_ACTIONS.has(row.action);
    if (query.module && query.module !== row.module && query.module !== "security" && !permissionModuleMatch) return false;
    if (query.module === "security" && !SECURITY_ACTIONS.has(row.action)) return false;
    if (query.result && query.result !== row.result) return false;
    if (query.severity && query.severity !== row.severity) return false;
    return true;
  });
}

function summarizeAuditRows(rows) {
  return rows.reduce(
    (summary, row) => {
      summary.totalEvents += 1;
      if (row.action === "admin.login.blocked_outside_schedule" || row.result === "blocked") summary.blockedLogins += 1;
      if (EMERGENCY_OVERRIDE_ACTIONS.has(row.action)) summary.emergencyOverrides += 1;
      if (PERMISSION_ACTIONS.has(row.action)) summary.permissionChanges += 1;
      if (ROLE_ACTIONS.has(row.action)) summary.roleChanges += 1;
      if (SCHEDULE_ACTIONS.has(row.action)) summary.scheduleChanges += 1;
      if (row.result === "failed") summary.failedAttempts += 1;
      if (row.severity === "high") summary.highSeverityCount += 1;
      return summary;
    },
    { ...SUMMARY_ZERO }
  );
}

async function findFormattedLogs(query = {}, { securityOnly = false } = {}) {
  const { skip, take } = pagination(query, { limit: 100, maxLimit: 200 });
  const where = buildAuditWhere(query, securityOnly);
  const rows = await prisma.adminLog.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  return filterFormattedRows(rows.map(formatAuditLog), query, securityOnly);
}

async function listAuditLogs(query = {}) {
  const rows = await findFormattedLogs(query);
  return {
    rows,
    summary: summarizeAuditRows(rows),
  };
}

async function auditLogSummary(query = {}) {
  const rows = await findFormattedLogs({ ...query, page: 1, limit: 200 });
  return summarizeAuditRows(rows);
}

async function listSecurityEvents(query = {}) {
  const rows = await findFormattedLogs(query, { securityOnly: true });
  return {
    rows,
    summary: summarizeAuditRows(rows),
  };
}

async function securityEventSummary(query = {}) {
  const rows = await findFormattedLogs({ ...query, page: 1, limit: 200 }, { securityOnly: true });
  return summarizeAuditRows(rows);
}

async function logAdminAction({
  tx = prisma,
  admin,
  action,
  targetType,
  targetId = null,
  siteId = null,
  before = null,
  after = null,
  metadata = null,
  req = null,
}) {
  if (!admin || !admin.id) {
    const error = new Error("admin_id is required for admin_log");
    error.statusCode = 500;
    throw error;
  }
  if (!targetId) {
    const error = new Error("target_id is required for admin_log");
    error.statusCode = 500;
    throw error;
  }

  const cleanedBefore = before ? sanitizeAdminLogData(before) : null;
  const cleanedAfter = after ? sanitizeAdminLogData(after) : null;
  const cleanedMetadata = sanitizeAdminLogData({
    ...(metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {}),
    before: cleanedBefore,
    after: cleanedAfter,
  });
  const resolvedSiteId = siteId || (req && req.siteId) || (before && before.siteId) || (after && after.siteId);
  if (!resolvedSiteId) {
    const error = new Error("site_id is required for admin_log");
    error.statusCode = 500;
    throw error;
  }
  return tx.adminLog.create({
    data: {
      siteId: resolvedSiteId,
      adminId: admin.id,
      action,
      targetType,
      targetId,
      metadata: cleanedMetadata,
      beforeJson: cleanedBefore,
      afterJson: cleanedAfter,
      ipAddress: req ? req.ip : null,
      userAgent: req ? req.headers["user-agent"] || null : null,
    },
  });
}

async function listAdminLogs(query = {}) {
  const { skip, take } = pagination(query, { limit: 100, maxLimit: 200 });
  const search = cleanSearch(query.search);
  const where = {};
  if (query.siteId) where.siteId = query.siteId;
  if (query.action) where.action = query.action;
  if (query.status) where.action = query.status;
  if (query.admin_id) where.adminId = query.admin_id;
  if (query.target_type) where.targetType = query.target_type;
  if (query.target_id) where.targetId = query.target_id;
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { targetType: { contains: search, mode: "insensitive" } },
      { targetId: { contains: search, mode: "insensitive" } },
      { admin: { is: { username: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const rows = await prisma.adminLog.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  return rows.map(formatAuditLog);
}

module.exports = {
  logAdminAction,
  listAdminLogs,
  listAuditLogs,
  auditLogSummary,
  listSecurityEvents,
  securityEventSummary,
  maskIp,
  sanitizeAdminLogData,
};
