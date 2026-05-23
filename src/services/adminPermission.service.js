const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");

const OWNER_ROLES = new Set(["owner", "super_admin"]);
const DEFAULT_STAGING_SAFE_ROLE = "staging_safe_role";

function safeStagingRoleName(value) {
  const role = String(value || DEFAULT_STAGING_SAFE_ROLE).trim().toLowerCase();
  if (!/^[a-z0-9_:-]{3,64}$/.test(role)) return DEFAULT_STAGING_SAFE_ROLE;
  if (OWNER_ROLES.has(role) || role === "admin.manage") return DEFAULT_STAGING_SAFE_ROLE;
  if (!/(staging|stage|demo|test|sandbox|qa|uat)/i.test(role)) return DEFAULT_STAGING_SAFE_ROLE;
  return role;
}

const STAGING_SAFE_ROLE = safeStagingRoleName(process.env.STAGING_SAFE_ROLE_NAME);

const PERMISSIONS = [
  "members.view",
  "members.update",
  "deposits.view",
  "deposits.approve",
  "withdrawals.view",
  "withdrawals.approve",
  "bank.view",
  "bank.update",
  "reports.view",
  "settings.website.view",
  "settings.website.update",
  "settings.promotion.view",
  "assets.upload",
  "admin.manage",
  "admin.audit.view",
  "admin.security.view",
  "admin.roles.view",
  "admin.roles.update",
  "admin.schedule.view",
  "admin.schedule.update",
  "admin.schedule.override",
  "admin.workSchedule.view",
  "admin.workSchedule.update",
  "wheel.view",
  "wheel.campaign.view",
  "wheel.campaign.update",
  "wheel.rewards.view",
  "wheel.rewards.create",
  "wheel.rewards.update",
  "wheel.rewards.status.update",
  "wheel.reward.view",
  "wheel.reward.create",
  "wheel.reward.update",
  "wheel.reward.enable",
  "wheel.reward.disable",
  "wheel.spins.view",
  "wheel.spin.view",
  "wheel.reports.view",
  "wheel.report.view",
  "wheel.claims.view",
  "wheel.claims.status.update",
  "wheel.audit.view",
];

const ROLE_PERMISSIONS = {
  owner: [...PERMISSIONS],
  super_admin: [...PERMISSIONS],
  finance: [
    "members.view",
    "deposits.view",
    "deposits.approve",
    "withdrawals.view",
    "withdrawals.approve",
    "bank.view",
    "reports.view",
    "admin.audit.view",
    "wheel.view",
    "wheel.spins.view",
    "wheel.spin.view",
    "wheel.reports.view",
    "wheel.report.view",
    "wheel.claims.view",
  ],
  support: [
    "members.view",
    "members.update",
    "deposits.view",
    "withdrawals.view",
    "bank.view",
    "wheel.view",
    "wheel.claims.view",
    "wheel.claims.status.update",
  ],
  graphic: [
    "settings.website.view",
    "settings.website.update",
    "settings.promotion.view",
    "assets.upload",
    "wheel.view",
    "wheel.campaign.view",
    "wheel.campaign.update",
    "wheel.rewards.view",
    "wheel.rewards.create",
    "wheel.rewards.update",
    "wheel.rewards.status.update",
    "wheel.reward.view",
    "wheel.reward.create",
    "wheel.reward.update",
    "wheel.reward.enable",
    "wheel.reward.disable",
  ],
  viewer: [
    "members.view",
    "deposits.view",
    "withdrawals.view",
    "bank.view",
    "reports.view",
    "settings.website.view",
    "settings.promotion.view",
    "wheel.view",
    "wheel.campaign.view",
    "wheel.rewards.view",
    "wheel.spins.view",
    "wheel.spin.view",
    "wheel.reports.view",
    "wheel.report.view",
    "wheel.claims.view",
  ],
};

if (!ROLE_PERMISSIONS[STAGING_SAFE_ROLE]) {
  ROLE_PERMISSIONS[STAGING_SAFE_ROLE] = ["wheel.view", "wheel.reports.view", "wheel.report.view"];
}

const ROLES = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
  role,
  permissions,
}));
const ROLE_DESCRIPTIONS = {
  owner: "Full backend access with owner bypass.",
  super_admin: "Legacy full access role with owner/super_admin guard.",
  finance: "Finance operations, deposits, withdrawals, claims, and reports.",
  support: "Member support and reward claim handling.",
  graphic: "Website, promotion, Lucky Wheel campaign, and reward setup.",
  viewer: "Read-only operational visibility.",
  [STAGING_SAFE_ROLE]: "Staging-only safe role used for permission update/restore UAT.",
};
const PERMISSION_DETAILS = [
  ["Lucky Wheel", "wheel.view", "View Lucky Wheel console", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
  ["Lucky Wheel", "wheel.campaign.view", "View wheel campaign", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
  ["Lucky Wheel", "wheel.campaign.update", "Update wheel campaign", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/campaign"],
  ["Lucky Wheel", "wheel.rewards.view", "View wheel rewards", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
  ["Lucky Wheel", "wheel.rewards.create", "Create wheel rewards", "write", true, true, "/admin/lucky-wheel", "POST /api/admin/wheel/rewards"],
  ["Lucky Wheel", "wheel.rewards.update", "Update wheel rewards", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
  ["Lucky Wheel", "wheel.rewards.status.update", "Update wheel reward status", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
  ["Lucky Wheel", "wheel.reward.view", "View wheel rewards", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/config"],
  ["Lucky Wheel", "wheel.reward.create", "Create wheel rewards", "write", true, true, "/admin/lucky-wheel", "POST /api/admin/wheel/rewards"],
  ["Lucky Wheel", "wheel.reward.update", "Update wheel rewards", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
  ["Lucky Wheel", "wheel.reward.enable", "Enable wheel reward", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
  ["Lucky Wheel", "wheel.reward.disable", "Disable wheel reward", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/rewards/:id"],
  ["Lucky Wheel", "wheel.spins.view", "View wheel spins", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
  ["Lucky Wheel", "wheel.spin.view", "View wheel spins", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
  ["Lucky Wheel", "wheel.reports.view", "View wheel reports", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
  ["Lucky Wheel", "wheel.report.view", "View wheel reports", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/spins"],
  ["Lucky Wheel", "wheel.claims.view", "View reward claims", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/wheel/member-rewards"],
  ["Lucky Wheel", "wheel.claims.status.update", "Update reward claim status", "write", true, true, "/admin/lucky-wheel", "PATCH /api/admin/wheel/member-rewards/:id/status"],
  ["Lucky Wheel", "wheel.audit.view", "View wheel audit history", "read", false, false, "/admin/lucky-wheel", "GET /api/admin/audit-logs"],
  ["Admin/Audit", "admin.audit.view", "View admin audit logs", "read", false, false, "/admin/audit-security", "GET /api/admin/audit-logs"],
  ["Admin/Audit", "admin.security.view", "View security events", "read", false, false, "/admin/audit-security", "GET /api/admin/security-events"],
  ["Admin/Audit", "admin.roles.view", "View role management", "read", false, false, "/admin/roles", "GET /api/admin/roles"],
  ["Admin/Audit", "admin.roles.update", "Update role permissions", "write", true, true, "/admin/roles", "PATCH /api/admin/roles/:role/permissions"],
  ["Admin/Audit", "admin.workSchedule.view", "View admin work schedules", "read", false, false, "/admin/work-schedules", "GET /api/admin/work-schedules"],
  ["Admin/Audit", "admin.workSchedule.update", "Update admin work schedules", "write", true, true, "/admin/work-schedules", "PATCH /api/admin/work-schedules/:adminId"],
  ["General Admin", "members.view", "View members", "read", false, false, "Admin member tools", "GET /api/admin/members"],
  ["General Admin", "members.update", "Update members", "write", true, true, "Admin member tools", "POST /api/admin/members/:id/*"],
  ["General Admin", "deposits.view", "View deposits", "read", false, false, "Admin finance tools", "GET /api/admin/deposits"],
  ["General Admin", "deposits.approve", "Approve/reject deposits", "write", true, true, "Admin finance tools", "POST /api/admin/deposits/:id/*"],
  ["General Admin", "withdrawals.view", "View withdrawals", "read", false, false, "Admin finance tools", "GET /api/admin/withdrawals"],
  ["General Admin", "withdrawals.approve", "Approve/reject withdrawals", "write", true, true, "Admin finance tools", "POST /api/admin/withdrawals/:id/*"],
  ["General Admin", "bank.view", "View bank tools", "read", false, false, "Admin bank tools", "GET /api/admin/bank-accounts/pending"],
  ["General Admin", "bank.update", "Update bank tools", "write", true, true, "Admin bank tools", "POST /api/admin/bank-accounts/:id/*"],
  ["General Admin", "reports.view", "View reports", "read", false, false, "Admin reports", "GET /api/admin/reports/summary"],
  ["General Admin", "settings.website.view", "View site settings", "read", false, false, "Admin site settings", "GET /api/admin/sites"],
  ["General Admin", "settings.website.update", "Update site settings", "write", true, true, "Admin site settings", "POST /api/admin/sites/:id/*"],
  ["General Admin", "settings.promotion.view", "View promotion settings", "read", false, false, "Admin promotion settings", "GET /api/admin/promotions"],
  ["General Admin", "assets.upload", "Upload admin assets", "write", true, true, "Admin assets", "Admin asset upload"],
  ["General Admin", "admin.manage", "Legacy full admin management", "write", true, true, "/admin/roles", "Legacy admin management"],
  ["Admin/Audit", "admin.schedule.view", "Legacy schedule view", "read", false, false, "/admin/work-schedules", "GET /api/admin/work-schedules"],
  ["Admin/Audit", "admin.schedule.update", "Legacy schedule update", "write", true, true, "/admin/work-schedules", "PATCH /api/admin/work-schedules/:adminId"],
  ["Admin/Audit", "admin.schedule.override", "Legacy schedule override", "write", true, true, "/admin/work-schedules", "POST/DELETE /api/admin/work-schedules/:adminId/override"],
].filter((item) => PERMISSIONS.includes(item[1])).map(([group, key, label, access, requiresReason, auditRequired, linkedPage, linkedApi]) => ({
  group,
  key,
  label,
  access,
  requiresReason,
  auditRequired,
  linkedPage,
  linkedApi,
}));
const SENSITIVE_REASON_PATTERNS = [
  /postgres(?:ql)?:\/\/[^\s"']+/gi,
  /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
  new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "gi"),
  /\b(password|token|secret|authorization)\b/gi,
];

function isOwnerRole(role) {
  return OWNER_ROLES.has(String(role || ""));
}

function normalizePermissionList(value) {
  if (Array.isArray(value)) return value.filter((item) => PERMISSIONS.includes(item));
  if (value && typeof value === "object" && Array.isArray(value.permissions)) {
    return normalizePermissionList(value.permissions);
  }
  return null;
}

function preserveAccessMetadata(nextPermissions, currentPermissions) {
  const schedule =
    currentPermissions &&
    typeof currentPermissions === "object" &&
    !Array.isArray(currentPermissions) &&
    currentPermissions.adminWorkSchedule
      ? currentPermissions.adminWorkSchedule
      : null;

  if (!schedule) return nextPermissions;
  if (Array.isArray(nextPermissions)) {
    return { permissions: nextPermissions, adminWorkSchedule: schedule };
  }
  return { adminWorkSchedule: schedule };
}

function effectiveRole(admin, access) {
  const accessRole = access && access.role;
  if (accessRole && ROLE_PERMISSIONS[accessRole]) return accessRole;
  return admin && admin.role ? admin.role : "viewer";
}

async function getSiteAccess(adminId, siteId) {
  if (!adminId || !siteId) return null;
  return prisma.adminSiteAccess.findUnique({
    where: { adminId_siteId: { adminId, siteId } },
  });
}

async function resolveAdminPermissions(admin, siteId) {
  const role = admin && admin.role ? admin.role : "viewer";
  if (isOwnerRole(role)) {
    return {
      role,
      permissions: [...PERMISSIONS],
      owner: true,
      source: "role",
      admin: admin
        ? {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            status: admin.status,
          }
        : null,
    };
  }

  const access = await getSiteAccess(admin.id, siteId);
  const overridePermissions = normalizePermissionList(access && access.permissions);
  const resolvedRole = effectiveRole(admin, access);

  return {
    role: resolvedRole,
    permissions: overridePermissions || ROLE_PERMISSIONS[resolvedRole] || [],
    owner: false,
    source: overridePermissions ? "site_override" : "role",
    admin: admin
      ? {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          status: admin.status,
        }
      : null,
  };
}

async function getAdminPermissions({ adminId, siteId }) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  const resolved = await resolveAdminPermissions(admin, siteId);
  return {
    admin,
    siteId,
    ...resolved,
  };
}

async function adminHasPermission(admin, siteId, permission) {
  if (!admin || !permission) return false;
  const resolved = await resolveAdminPermissions(admin, siteId);
  return resolved.owner || resolved.permissions.includes(permission);
}

function assertKnownRole(role) {
  if (!ROLE_PERMISSIONS[role]) {
    const error = new Error("Unknown admin role");
    error.statusCode = 400;
    throw error;
  }
}

function assertKnownPermissions(permissions) {
  const unknown = (permissions || []).filter((permission) => !PERMISSIONS.includes(permission));
  if (unknown.length > 0) {
    const error = new Error("Unknown admin permission");
    error.statusCode = 400;
    error.details = { permissions: unknown };
    throw error;
  }
}

function assertAssignableRolePermissions(role, permissions) {
  if (isOwnerRole(role)) {
    const error = new Error("owner/super_admin permissions are controlled by guard and cannot be edited");
    error.statusCode = 400;
    throw error;
  }
  if ((permissions || []).includes("*") || (permissions || []).includes("admin.manage")) {
    const error = new Error("Forbidden permission key for role assignment");
    error.statusCode = 400;
    throw error;
  }
}

function normalizeReason(reason) {
  let value = String(reason || "").trim();
  if (!value) {
    const error = new Error("reason is required");
    error.statusCode = 400;
    throw error;
  }
  for (const pattern of SENSITIVE_REASON_PATTERNS) value = value.replace(pattern, "[REDACTED]");
  return value.slice(0, 500);
}

function permissionCatalog() {
  const detailByKey = new Map(PERMISSION_DETAILS.map((item) => [item.key, item]));
  return PERMISSIONS.map((key) => detailByKey.get(key) || {
    group: "General Admin",
    key,
    label: key,
    access: key.includes(".update") || key.includes(".approve") || key.includes(".create") ? "write" : "read",
    requiresReason: key.includes(".update") || key.includes(".approve") || key.includes(".create"),
    auditRequired: key.includes(".update") || key.includes(".approve") || key.includes(".create"),
    linkedPage: "Admin console",
    linkedApi: "See docs/API.md",
  });
}

function maxDate(rows, fallback = null) {
  return rows.reduce((latest, row) => {
    const value = row && row.updatedAt ? new Date(row.updatedAt).getTime() : 0;
    return value > latest.value ? { value, date: row.updatedAt } : latest;
  }, { value: 0, date: fallback }).date;
}

function formatRoleSummary(role, rows = []) {
  const latestOverride = rows
    .slice()
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .find((row) => normalizePermissionList(row.permissions));
  const overridePermissions = latestOverride ? normalizePermissionList(latestOverride.permissions) : null;
  return {
    role,
    description: ROLE_DESCRIPTIONS[role] || "Backend role catalog",
    permissions: overridePermissions || ROLE_PERMISSIONS[role] || [],
    defaultPermissions: ROLE_PERMISSIONS[role] || [],
    source: overridePermissions ? "site_override" : "role",
    siteCode: null,
    adminCount: rows.length,
    status: "active",
    updatedAt: maxDate(rows),
    protected: isOwnerRole(role),
  };
}

async function listRoles({ siteId = null, siteCode = null } = {}) {
  const accessRows = siteId
    ? await prisma.adminSiteAccess.findMany({
        where: { siteId },
        select: { role: true, permissions: true, updatedAt: true },
      })
    : [];
  return Object.keys(ROLE_PERMISSIONS).map((role) => ({
    ...formatRoleSummary(role, accessRows.filter((row) => row.role === role)),
    siteCode,
  }));
}

async function getRole({ role, siteId = null, siteCode = null }) {
  assertKnownRole(role);
  const rows = siteId
    ? await prisma.adminSiteAccess.findMany({
        where: { siteId, role },
        select: { role: true, permissions: true, updatedAt: true },
      })
    : [];
  return { ...formatRoleSummary(role, rows), siteCode };
}

async function updateRolePermissions({ role, permissions, reason, actor = null, req = null, siteId, siteCode = null }) {
  assertKnownRole(role);
  const normalizedPermissions = normalizePermissionList(permissions);
  if (!Array.isArray(permissions) || !normalizedPermissions || normalizedPermissions.length !== permissions.length) {
    assertKnownPermissions(Array.isArray(permissions) ? permissions : []);
    const error = new Error("permissions must be an array of known permission keys");
    error.statusCode = 400;
    throw error;
  }
  assertKnownPermissions(normalizedPermissions);
  assertAssignableRolePermissions(role, normalizedPermissions);
  const auditReason = normalizeReason(reason);

  const updated = await prisma.$transaction(async (tx) => {
    const rows = await tx.adminSiteAccess.findMany({
      where: { siteId, role },
      include: {
        admin: { select: { id: true, username: true, role: true, status: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    if (actor && !isOwnerRole(actor.role) && rows.some((row) => row.adminId === actor.id)) {
      const error = new Error("You cannot change permissions for your own role in this staging UI.");
      error.statusCode = 400;
      throw error;
    }

    const beforeRows = rows.map((row) => ({
      adminId: row.adminId,
      username: row.admin && row.admin.username,
      permissions: normalizePermissionList(row.permissions) || ROLE_PERMISSIONS[role] || [],
    }));

    for (const row of rows) {
      await tx.adminSiteAccess.update({
        where: { adminId_siteId: { adminId: row.adminId, siteId } },
        data: { permissions: preserveAccessMetadata(normalizedPermissions, row.permissions) },
      });
    }

    if (actor && siteId) {
      await logAdminAction({
        tx,
        admin: actor,
        action: "admin.role.permissions.update",
        targetType: "role",
        targetId: role,
        metadata: {
          action: "admin.role.permissions.update",
          actor: { id: actor.id, username: actor.username, role: actor.role },
          role,
          reason: auditReason,
          siteCode,
          changedAdminCount: rows.length,
          beforePermissionCount: beforeRows.length ? beforeRows[0].permissions.length : ROLE_PERMISSIONS[role].length,
          afterPermissionCount: normalizedPermissions.length,
        },
        before: {
          role,
          permissions: beforeRows.length ? beforeRows[0].permissions : ROLE_PERMISSIONS[role],
          affectedAdmins: beforeRows,
        },
        after: {
          role,
          permissions: normalizedPermissions,
          affectedAdminCount: rows.length,
        },
        req,
        siteId,
      });
    }

    return rows.length;
  });

  return {
    ...(await getRole({ role, siteId, siteCode })),
    permissions: normalizedPermissions,
    source: "site_override",
    updatedAdminCount: updated,
  };
}

async function assignRole({ adminId, siteId, siteCode = null, role, permissions = null, reason, actor = null, req = null }) {
  assertKnownRole(role);
  const auditReason = normalizeReason(reason);
  const normalizedPermissions = permissions === null ? null : normalizePermissionList(permissions);
  if (permissions !== null) assertKnownPermissions(permissions);

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }
  if (isOwnerRole(role) && actor && !isOwnerRole(actor.role)) {
    const error = new Error("Only owner/super_admin can assign owner/super_admin roles");
    error.statusCode = 403;
    throw error;
  }
  if (actor && actor.id === adminId) {
    const error = new Error("You cannot change your own role in this staging UI.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const beforeAccess = siteId
      ? await tx.adminSiteAccess.findUnique({
          where: { adminId_siteId: { adminId, siteId } },
        })
      : null;
    const beforeRole = effectiveRole(admin, beforeAccess);
    if (beforeRole === role) {
      const error = new Error("New role must be different from current role");
      error.statusCode = 400;
      throw error;
    }

    const nextAdmin = await tx.admin.update({
      where: { id: adminId },
      data: { role },
      select: { id: true, username: true, role: true, status: true },
    });

    if (siteId) {
      const nextAccessPermissions = preserveAccessMetadata(normalizedPermissions, beforeAccess && beforeAccess.permissions);
      await tx.adminSiteAccess.upsert({
        where: { adminId_siteId: { adminId, siteId } },
        update: { role, permissions: nextAccessPermissions },
        create: { adminId, siteId, role, permissions: normalizedPermissions },
      });
    }

    if (actor && siteId) {
      await logAdminAction({
        tx,
        admin: actor,
        action: "admin.role.update",
        targetType: "admin",
        targetId: adminId,
        metadata: {
          action: "admin.role.update",
          actor: actor ? { id: actor.id, username: actor.username, role: actor.role } : null,
          targetRole: role,
          targetAdminId: adminId,
          targetUsername: admin.username,
          beforeRole,
          afterRole: role,
          reason: auditReason,
          siteCode,
        },
        before: {
          adminId,
          username: admin.username,
          role: admin.role,
          siteAccessRole: beforeAccess && beforeAccess.role,
          permissions: beforeAccess && beforeAccess.permissions,
        },
        after: {
          adminId,
          username: admin.username,
          role,
          siteAccessRole: role,
          permissions: normalizedPermissions || ROLE_PERMISSIONS[role],
        },
        req,
        siteId,
      });
    }

    return nextAdmin;
  });

  return {
    admin: updated,
    siteId,
    role,
    permissions: normalizedPermissions || ROLE_PERMISSIONS[role],
  };
}

module.exports = {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  PERMISSION_DETAILS,
  isOwnerRole,
  permissionCatalog,
  listRoles,
  getRole,
  resolveAdminPermissions,
  getAdminPermissions,
  adminHasPermission,
  assignRole,
  updateRolePermissions,
};
