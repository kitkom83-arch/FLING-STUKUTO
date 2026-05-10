const { fail } = require("../utils/response");
const { adminHasPermission } = require("../services/adminPermission.service");

function requirePermission(permission, options = {}) {
  return async function adminPermissionGuard(req, res, next) {
    try {
      const siteId = options.siteIdParam ? req.params[options.siteIdParam] : req.siteId;
      if (await adminHasPermission(req.admin, siteId, permission)) return next();
      return fail(res, "Admin permission denied", 403, { permission });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  requirePermission,
};
