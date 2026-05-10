const prisma = require("../config/prisma");
const { logAdminAction } = require("./adminLog.service");
const { isOwnerRole } = require("./adminPermission.service");
const { cleanSearch, pagination } = require("../utils/query");

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const SCHEDULE_AUDIT_ACTIONS = [
  "admin.schedule.update",
  "admin.schedule.enable",
  "admin.schedule.disable",
  "admin.schedule.override_enable",
  "admin.schedule.override_disable",
  "admin.login.blocked_outside_schedule",
];
const DEFAULT_SCHEDULE = {
  enabled: false,
  timezone: "Asia/Bangkok",
  allowedDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  startTime: "09:00",
  endTime: "18:00",
  forceLogoutWhenScheduleEnds: true,
  idleTimeoutMinutes: 60,
  emergencyOverride: {
    enabled: false,
    expiresAt: null,
    reason: null,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function error(message, statusCode = 400, details = null) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (details) err.details = details;
  return err;
}

function parseTimeToMinutes(value, fieldName = "time") {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ""));
  if (!match) throw error(`${fieldName} must use HH:mm format`, 400);
  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeAllowedDays(value) {
  if (!Array.isArray(value)) return clone(DEFAULT_SCHEDULE.allowedDays);
  const days = [...new Set(value.map((day) => String(day || "").trim().toUpperCase()))].filter((day) => DAYS.includes(day));
  if (days.length === 0) throw error("allowedDays must include at least one valid day", 400);
  return days;
}

function normalizeOverride(value) {
  const source = value && typeof value === "object" ? value : {};
  const enabled = Boolean(source.enabled);
  const expiresAt = source.expiresAt ? new Date(source.expiresAt) : null;
  if (enabled && (!expiresAt || Number.isNaN(expiresAt.getTime()))) {
    throw error("emergencyOverride.expiresAt must be a valid date when enabled", 400);
  }
  return {
    enabled,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    reason: source.reason ? String(source.reason).slice(0, 500) : null,
  };
}

function normalizeSchedule(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const schedule = {
    ...clone(DEFAULT_SCHEDULE),
    ...source,
    allowedDays: normalizeAllowedDays(source.allowedDays || DEFAULT_SCHEDULE.allowedDays),
    emergencyOverride: normalizeOverride(source.emergencyOverride || DEFAULT_SCHEDULE.emergencyOverride),
  };

  schedule.enabled = Boolean(schedule.enabled);
  schedule.timezone = String(schedule.timezone || DEFAULT_SCHEDULE.timezone).trim() || DEFAULT_SCHEDULE.timezone;
  schedule.startTime = String(schedule.startTime || DEFAULT_SCHEDULE.startTime);
  schedule.endTime = String(schedule.endTime || DEFAULT_SCHEDULE.endTime);
  parseTimeToMinutes(schedule.startTime, "startTime");
  parseTimeToMinutes(schedule.endTime, "endTime");
  schedule.forceLogoutWhenScheduleEnds = Boolean(schedule.forceLogoutWhenScheduleEnds);

  const idleTimeout = Number(schedule.idleTimeoutMinutes);
  schedule.idleTimeoutMinutes = Number.isFinite(idleTimeout)
    ? Math.min(1440, Math.max(1, Math.floor(idleTimeout)))
    : DEFAULT_SCHEDULE.idleTimeoutMinutes;

  return schedule;
}

function getPermissionsObject(permissions) {
  if (!permissions || Array.isArray(permissions)) return {};
  if (typeof permissions === "object") return { ...permissions };
  return {};
}

function setScheduleOnPermissions(currentPermissions, schedule) {
  if (Array.isArray(currentPermissions)) {
    return { permissions: currentPermissions, adminWorkSchedule: schedule };
  }
  return { ...getPermissionsObject(currentPermissions), adminWorkSchedule: schedule };
}

function removeScheduleFromPermissions(currentPermissions) {
  if (Array.isArray(currentPermissions) || !currentPermissions || typeof currentPermissions !== "object") {
    return currentPermissions || null;
  }
  const next = { ...currentPermissions };
  delete next.adminWorkSchedule;
  return Object.keys(next).length > 0 ? next : null;
}

function summarizeSchedule(schedule) {
  if (!schedule) return null;
  let overnightShift = false;
  try {
    overnightShift = parseTimeToMinutes(schedule.startTime, "startTime") > parseTimeToMinutes(schedule.endTime, "endTime");
  } catch (_error) {
    overnightShift = false;
  }
  return {
    enabled: Boolean(schedule.enabled),
    timezone: schedule.timezone,
    allowedDays: schedule.allowedDays,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    overnightShift,
    forceLogoutWhenScheduleEnds: Boolean(schedule.forceLogoutWhenScheduleEnds),
    idleTimeoutMinutes: schedule.idleTimeoutMinutes,
    emergencyOverride: {
      enabled: Boolean(schedule.emergencyOverride && schedule.emergencyOverride.enabled),
      expiresAt: schedule.emergencyOverride ? schedule.emergencyOverride.expiresAt : null,
      reason: schedule.emergencyOverride ? schedule.emergencyOverride.reason : null,
    },
  };
}

async function findTargetAdmin(targetAdminId) {
  const admin = await prisma.admin.findUnique({
    where: { id: targetAdminId },
    select: { id: true, username: true, role: true, status: true, createdAt: true, updatedAt: true },
  });
  if (!admin) throw error("Admin not found", 404);
  return admin;
}

async function getScheduleAccess(adminId, siteId, tx = prisma) {
  if (!adminId || !siteId) return null;
  return tx.adminSiteAccess.findUnique({
    where: { adminId_siteId: { adminId, siteId } },
  });
}

async function getAdminWorkSchedule(adminId, siteId = null) {
  const admin = await findTargetAdmin(adminId);
  const access = siteId
    ? await getScheduleAccess(adminId, siteId)
    : await prisma.adminSiteAccess.findFirst({ where: { adminId }, orderBy: { createdAt: "asc" } });
  const stored =
    access &&
    access.permissions &&
    typeof access.permissions === "object" &&
    !Array.isArray(access.permissions) &&
    access.permissions.adminWorkSchedule
      ? access.permissions.adminWorkSchedule
      : null;
  const schedule = normalizeSchedule(stored || DEFAULT_SCHEDULE);
  return {
    admin,
    siteId: siteId || (access && access.siteId) || null,
    schedule,
  };
}

async function listAdminWorkSchedules({ siteId, query = {} }) {
  if (!siteId) throw error("siteId is required", 500);
  const { skip, take } = pagination(query, { limit: 100, maxLimit: 200 });
  const search = cleanSearch(query.search);
  const where = { siteId };
  if (search) {
    where.admin = { username: { contains: search, mode: "insensitive" } };
  }
  if (query.role) where.role = String(query.role);

  const rows = await prisma.adminSiteAccess.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    skip,
    take,
  });

  return rows
    .filter((row) => !query.status || (row.admin && row.admin.status === String(query.status)))
    .map((row) => {
      const stored =
        row.permissions &&
        typeof row.permissions === "object" &&
        !Array.isArray(row.permissions) &&
        row.permissions.adminWorkSchedule
          ? row.permissions.adminWorkSchedule
          : null;
      const schedule = normalizeSchedule(stored || DEFAULT_SCHEDULE);
      return {
        admin: row.admin,
        siteId: row.siteId,
        siteAccessRole: row.role,
        schedule,
        summary: summarizeSchedule(schedule),
      };
    });
}

async function listAdminWorkScheduleAuditLogs({ targetAdminId, siteId, query = {} }) {
  if (!targetAdminId) throw error("targetAdminId is required", 400);
  if (!siteId) throw error("siteId is required", 500);
  await findTargetAdmin(targetAdminId);
  const { skip, take } = pagination(query, { limit: 50, maxLimit: 100 });
  const search = cleanSearch(query.search);
  const where = {
    siteId,
    targetType: "admin",
    targetId: targetAdminId,
    action: { in: SCHEDULE_AUDIT_ACTIONS },
  };
  if (query.action && SCHEDULE_AUDIT_ACTIONS.includes(String(query.action))) {
    where.action = String(query.action);
  }
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
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

function safeActor(actorAdmin) {
  return actorAdmin && actorAdmin.id ? actorAdmin : null;
}

async function writeSchedule({ actorAdmin, targetAdminId, siteId, nextSchedule, action, beforeSchedule, req, tx = prisma }) {
  const access = await getScheduleAccess(targetAdminId, siteId, tx);
  if (!access) throw error("Admin site access not found", 404);
  const nextPermissions = nextSchedule
    ? setScheduleOnPermissions(access.permissions, nextSchedule)
    : removeScheduleFromPermissions(access.permissions);

  const updatedAccess = await tx.adminSiteAccess.update({
    where: { adminId_siteId: { adminId: targetAdminId, siteId } },
    data: { permissions: nextPermissions },
  });

  if (safeActor(actorAdmin)) {
    await logAdminAction({
      tx,
      admin: actorAdmin,
      action,
      targetType: "admin",
      targetId: targetAdminId,
      before: { targetAdminId, schedule: summarizeSchedule(beforeSchedule) },
      after: { targetAdminId, schedule: summarizeSchedule(nextSchedule) },
      req,
      siteId,
    });
  }

  return updatedAccess;
}

async function updateAdminWorkSchedule(actorAdmin, targetAdminId, payload, options = {}) {
  const siteId = options.siteId;
  if (!siteId) throw error("siteId is required", 500);
  const targetAdmin = await findTargetAdmin(targetAdminId);
  const before = await getAdminWorkSchedule(targetAdminId, siteId);
  const nextSchedule = normalizeSchedule({ ...before.schedule, ...(payload || {}) });

  await prisma.$transaction(async (tx) => {
    await writeSchedule({
      actorAdmin,
      targetAdminId,
      siteId,
      nextSchedule,
      action: "admin.schedule.update",
      beforeSchedule: before.schedule,
      req: options.req,
      tx,
    });

    if (before.schedule.enabled !== nextSchedule.enabled) {
      await logAdminAction({
        tx,
        admin: actorAdmin,
        action: nextSchedule.enabled ? "admin.schedule.enable" : "admin.schedule.disable",
        targetType: "admin",
        targetId: targetAdminId,
        before: { targetAdminId, schedule: summarizeSchedule(before.schedule) },
        after: { targetAdminId, schedule: summarizeSchedule(nextSchedule) },
        req: options.req,
        siteId,
      });
    }
  });

  return {
    admin: targetAdmin,
    siteId,
    schedule: nextSchedule,
  };
}

async function enableEmergencyOverride(actorAdmin, targetAdminId, expiresAt, reason, options = {}) {
  const siteId = options.siteId;
  if (!siteId) throw error("siteId is required", 500);
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) throw error("expiresAt must be a valid date", 400);
  if (expires.getTime() <= Date.now()) throw error("expiresAt must be in the future", 400);
  if (!reason || !String(reason).trim()) throw error("reason is required", 400);

  const targetAdmin = await findTargetAdmin(targetAdminId);
  const before = await getAdminWorkSchedule(targetAdminId, siteId);
  const nextSchedule = normalizeSchedule({
    ...before.schedule,
    emergencyOverride: {
      enabled: true,
      expiresAt: expires.toISOString(),
      reason: String(reason).trim().slice(0, 500),
    },
  });

  await prisma.$transaction(async (tx) => {
    await writeSchedule({
      actorAdmin,
      targetAdminId,
      siteId,
      nextSchedule,
      action: "admin.schedule.override_enable",
      beforeSchedule: before.schedule,
      req: options.req,
      tx,
    });
  });

  return {
    admin: targetAdmin,
    siteId,
    schedule: nextSchedule,
  };
}

async function disableEmergencyOverride(actorAdmin, targetAdminId, reason = null, options = {}) {
  const siteId = options.siteId;
  if (!siteId) throw error("siteId is required", 500);
  const targetAdmin = await findTargetAdmin(targetAdminId);
  const before = await getAdminWorkSchedule(targetAdminId, siteId);
  const nextSchedule = normalizeSchedule({
    ...before.schedule,
    emergencyOverride: {
      enabled: false,
      expiresAt: null,
      reason: reason ? String(reason).trim().slice(0, 500) : null,
    },
  });

  await prisma.$transaction(async (tx) => {
    await writeSchedule({
      actorAdmin,
      targetAdminId,
      siteId,
      nextSchedule,
      action: "admin.schedule.override_disable",
      beforeSchedule: before.schedule,
      req: options.req,
      tx,
    });
  });

  return {
    admin: targetAdmin,
    siteId,
    schedule: nextSchedule,
  };
}

function formatLocalParts(now, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || DEFAULT_SCHEDULE.timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const day = String(parts.weekday || "").toUpperCase();
  const hour = Number(parts.hour === "24" ? 0 : parts.hour);
  const minute = Number(parts.minute);
  if (!DAYS.includes(day) || !Number.isFinite(hour) || !Number.isFinite(minute)) {
    throw error("Unable to evaluate schedule time", 500);
  }
  return {
    day,
    minutes: hour * 60 + minute,
  };
}

function previousDay(day) {
  const index = DAYS.indexOf(day);
  return DAYS[(index + DAYS.length - 1) % DAYS.length];
}

function isWithinSchedule(scheduleInput, now = new Date(), timezone = null) {
  const schedule = normalizeSchedule(scheduleInput || DEFAULT_SCHEDULE);
  if (!schedule.enabled) return true;

  const local = formatLocalParts(now instanceof Date ? now : new Date(now), timezone || schedule.timezone);
  const start = parseTimeToMinutes(schedule.startTime, "startTime");
  const end = parseTimeToMinutes(schedule.endTime, "endTime");
  const allowedDays = new Set(schedule.allowedDays);

  if (start === end) return allowedDays.has(local.day);
  if (start < end) {
    return allowedDays.has(local.day) && local.minutes >= start && local.minutes < end;
  }
  if (local.minutes >= start) return allowedDays.has(local.day);
  if (local.minutes < end) return allowedDays.has(previousDay(local.day));
  return false;
}

function overrideActive(schedule, now = new Date()) {
  const emergency = schedule && schedule.emergencyOverride;
  if (!emergency || !emergency.enabled || !emergency.expiresAt) return false;
  const expiresAt = new Date(emergency.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
}

async function checkAdminLoginSchedule(admin, now = new Date(), options = {}) {
  if (!admin || !admin.id) return { allowed: false, reason: "admin_missing" };
  if (isOwnerRole(admin.role)) return { allowed: true, reason: "owner_bypass" };

  const siteId = options.siteId || null;
  const { schedule } = await getAdminWorkSchedule(admin.id, siteId);
  if (!schedule.enabled) return { allowed: true, reason: "schedule_disabled", schedule };
  if (overrideActive(schedule, now)) return { allowed: true, reason: "emergency_override", schedule };
  if (isWithinSchedule(schedule, now, schedule.timezone)) return { allowed: true, reason: "within_schedule", schedule };

  return { allowed: false, reason: "outside_schedule", schedule };
}

async function auditLoginBlockedOutsideSchedule({ admin, siteId, schedule, req = null, now = new Date() }) {
  await logAdminAction({
    admin,
    action: "admin.login.blocked_outside_schedule",
    targetType: "admin",
    targetId: admin.id,
    before: null,
    after: {
      targetAdminId: admin.id,
      blockedAt: now.toISOString(),
      schedule: summarizeSchedule(schedule),
    },
    req,
    siteId,
  });
}

module.exports = {
  DEFAULT_SCHEDULE,
  DAYS,
  SCHEDULE_AUDIT_ACTIONS,
  listAdminWorkSchedules,
  getAdminWorkSchedule,
  listAdminWorkScheduleAuditLogs,
  updateAdminWorkSchedule,
  enableEmergencyOverride,
  disableEmergencyOverride,
  checkAdminLoginSchedule,
  isWithinSchedule,
  auditLoginBlockedOutsideSchedule,
  normalizeSchedule,
  summarizeSchedule,
};
