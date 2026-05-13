const { z } = require("zod");
const { success } = require("../utils/response");
const {
  PERMISSIONS,
  ROLES,
  resolveAdminPermissions,
  getAdminPermissions,
  assignRole,
} = require("../services/adminPermission.service");
const {
  listAdminWorkSchedules,
  getAdminWorkSchedule,
  listAdminWorkScheduleAuditLogs,
  updateAdminWorkSchedule,
  enableEmergencyOverride,
  disableEmergencyOverride,
} = require("../services/adminWorkSchedule.service");

const assignRoleSchema = z.object({
  role: z.string().min(1),
  permissions: z.array(z.string()).optional().nullable(),
});

const reasonSchema = z.string().trim().min(1).max(500);

const workScheduleSchema = z.object({
  enabled: z.boolean().optional(),
  timezone: z.string().min(1).optional(),
  allowedDays: z.array(z.string().min(1)).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  forceLogoutWhenScheduleEnds: z.boolean().optional(),
  idleTimeoutMinutes: z.number().int().min(1).max(1440).optional(),
  reason: reasonSchema,
  emergencyOverride: z
    .object({
      enabled: z.boolean().optional(),
      expiresAt: z.string().datetime().nullable().optional(),
      reason: z.string().max(500).nullable().optional(),
    })
    .optional(),
});

const overrideSchema = z.object({
  expiresAt: z.string().datetime(),
  reason: reasonSchema,
});

const disableOverrideSchema = z.object({
  reason: reasonSchema,
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

function targetAdminId(req) {
  return req.params.adminId || req.params.id;
}

async function listWorkSchedules(req, res) {
  return success(res, await listAdminWorkSchedules({ siteId: req.siteId, query: req.query }));
}

async function getWorkSchedule(req, res) {
  return success(res, await getAdminWorkSchedule(targetAdminId(req), req.siteId));
}

async function patchWorkSchedule(req, res) {
  const data = workScheduleSchema.parse(req.body);
  return success(
    res,
    await updateAdminWorkSchedule(req.admin, targetAdminId(req), data, {
      siteId: req.siteId,
      req,
    })
  );
}

async function postWorkScheduleOverride(req, res) {
  const data = overrideSchema.parse(req.body);
  return success(
    res,
    await enableEmergencyOverride(req.admin, targetAdminId(req), data.expiresAt, data.reason, {
      siteId: req.siteId,
      req,
    })
  );
}

async function deleteWorkScheduleOverride(req, res) {
  const data = disableOverrideSchema.parse(req.body || {});
  return success(
    res,
    await disableEmergencyOverride(req.admin, targetAdminId(req), data.reason, {
      siteId: req.siteId,
      req,
    })
  );
}

async function listWorkScheduleAuditLogs(req, res) {
  return success(
    res,
    await listAdminWorkScheduleAuditLogs({
      targetAdminId: targetAdminId(req),
      siteId: req.siteId,
      query: req.query,
    })
  );
}

module.exports = {
  listRoles,
  listPermissions,
  me,
  getAdmin,
  assignAdminRole,
  listWorkSchedules,
  getWorkSchedule,
  patchWorkSchedule,
  postWorkScheduleOverride,
  deleteWorkScheduleOverride,
  listWorkScheduleAuditLogs,
};
