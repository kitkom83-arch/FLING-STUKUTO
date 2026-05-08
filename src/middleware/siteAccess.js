const prisma = require("../config/prisma");
const { fail } = require("../utils/response");

async function adminCanAccessSite(admin, siteId) {
  if (!admin || !siteId) return false;
  if (admin.role === "super_admin") return true;
  const access = await prisma.adminSiteAccess.findUnique({
    where: { adminId_siteId: { adminId: admin.id, siteId } },
  });
  return Boolean(access);
}

async function siteAccess(req, res, next) {
  try {
    if (await adminCanAccessSite(req.admin, req.siteId)) return next();
    return fail(res, "You do not have access to this site", 403, {});
  } catch (error) {
    return next(error);
  }
}

function requireTargetSiteAccess(paramName = "id") {
  return async function targetSiteAccess(req, res, next) {
    try {
      const siteId = req.params[paramName];
      if (await adminCanAccessSite(req.admin, siteId)) return next();
      return fail(res, "You do not have access to this site", 403, {});
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  adminCanAccessSite,
  siteAccess,
  requireTargetSiteAccess,
};
