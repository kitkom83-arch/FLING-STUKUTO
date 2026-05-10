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
  ],
  support: ["members.view", "members.update", "deposits.view", "withdrawals.view", "bank.view"],
  graphic: ["settings.website.view", "settings.website.update", "settings.promotion.view", "assets.upload"],
  viewer: [
    "members.view",
    "deposits.view",
    "withdrawals.view",
    "bank.view",
    "reports.view",
    "settings.website.view",
    "settings.promotion.view",
  ],
};

const ROLES = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
  role,
  permissions,
}));

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

async function assignRole({ adminId, siteId, role, permissions = null, actor = null, req = null }) {
  assertKnownRole(role);
  const normalizedPermissions = permissions === null ? null : normalizePermissionList(permissions);
  if (permissions !== null) assertKnownPermissions(permissions);

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const beforeAccess = siteId
      ? await tx.adminSiteAccess.findUnique({
          where: { adminId_siteId: { adminId, siteId } },
        })
      : null;

    const nextAdmin = await tx.admin.update({
      where: { id: adminId },
      data: { role },
      select: { id: true, username: true, role: true, status: true },
    });

    if (siteId) {
      await tx.adminSiteAccess.upsert({
        where: { adminId_siteId: { adminId, siteId } },
        update: { role, permissions: normalizedPermissions },
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
        before: {
          adminId,
          role: admin.role,
          siteAccessRole: beforeAccess && beforeAccess.role,
          permissions: beforeAccess && beforeAccess.permissions,
        },
        after: {
          adminId,
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
