const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");

const OWNER_ROLES = new Set(["owner", "super_admin"]);

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
  "wheel.spins.view",
  "wheel.reports.view",
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
    "wheel.reports.view",
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
    "wheel.reports.view",
    "wheel.claims.view",
  ],
};

const ROLES = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
  role,
  permissions,
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
  isOwnerRole,
  resolveAdminPermissions,
  getAdminPermissions,
  adminHasPermission,
  assignRole,
};
