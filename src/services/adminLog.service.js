const prisma = require("../config/prisma");
const { cleanData } = require("../utils/response");
const { cleanSearch, pagination } = require("../utils/query");

const SENSITIVE_KEY_PATTERN = /(password|token|secret|api[_-]?key|apikey|authorization)/i;

function sanitizeAdminLogData(value) {
  const cleaned = cleanData(value);
  if (Array.isArray(cleaned)) return cleaned.map(sanitizeAdminLogData);
  if (!cleaned || typeof cleaned !== "object") return cleaned;
  return Object.fromEntries(
    Object.entries(cleaned).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : sanitizeAdminLogData(item),
    ])
  );
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
      metadata: {
        before: cleanedBefore,
        after: cleanedAfter,
      },
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

  return prisma.adminLog.findMany({
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
}

module.exports = {
  logAdminAction,
  listAdminLogs,
};
