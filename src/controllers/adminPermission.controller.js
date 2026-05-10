const { z } = require("zod");
const { success } = require("../utils/response");
const {
  PERMISSIONS,
  ROLES,
  resolveAdminPermissions,
  getAdminPermissions,
  assignRole,
} = require("../services/adminPermission.service");

const assignRoleSchema = z.object({
  role: z.string().min(1),
  permissions: z.array(z.string()).optional().nullable(),
});

async function listRoles(req, res) {
  return success(res, ROLES);
}

async function listPermissions(req, res) {
  return success(res, PERMISSIONS);
}

async function me(req, res) {
  const result = await resolveAdminPermissions(req.admin, req.siteId);
  return success(res, result);
}

async function getAdmin(req, res) {
  return success(
    res,
    await getAdminPermissions({
      adminId: req.params.id,
      siteId: req.siteId,
    })
  );
}

async function assignAdminRole(req, res) {
  const data = assignRoleSchema.parse(req.body);
  const result = await assignRole({
    adminId: req.params.id,
    siteId: req.siteId,
    role: data.role,
    permissions: data.permissions === undefined ? null : data.permissions,
    actor: req.admin,
    req,
  });
  return success(res, result);
}

module.exports = {
  listRoles,
  listPermissions,
  me,
  getAdmin,
  assignAdminRole,
};
