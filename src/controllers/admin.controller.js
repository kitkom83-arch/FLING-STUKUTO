const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { success, fail } = require("../utils/response");
const { verifyPassword } = require("../utils/password");
const memberService = require("../services/member.service");
const walletService = require("../services/wallet.service");
const pointService = require("../services/point.service");
const reportService = require("../services/report.service");
const { logAdminAction, listAdminLogs } = require("../services/adminLog.service");
const {
  auditLoginBlockedOutsideSchedule,
  checkAdminLoginSchedule,
} = require("../services/adminWorkSchedule.service");
const { attachSiteToRequest, resolveSiteForRequest } = require("../middleware/siteResolver");

const loginSchema = z.object({
  username: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  password: z.string().min(1),
}).refine((value) => value.username || value.email);
const INVALID_ADMIN_LOGIN_MESSAGE = "Invalid admin credentials";

const amountSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  note: z.string().optional(),
});

const pointSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  reason: z.string().min(1),
  reference_type: z.string().optional(),
  reference_id: z.string().optional(),
});

function publicAdmin(admin) {
  return {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    status: admin.status,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
  };
}

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, type: "admin", role: admin.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function safeAdminLoginError(error) {
  return {
    name: error && error.name ? error.name : "Error",
    code: error && error.code ? error.code : undefined,
    message: "Admin login credential check failed",
  };
}

function invalidAdminLogin(res) {
  return fail(res, INVALID_ADMIN_LOGIN_MESSAGE, 400);
}

function parseAdminLoginBody(body) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return null;
  return {
    username: parsed.data.username || parsed.data.email,
    password: parsed.data.password,
  };
}

async function ensureAdminLoginSite(req) {
  if (req.siteId) return true;

  try {
    const site = await resolveSiteForRequest(req);
    if (!site) return false;
    attachSiteToRequest(req, site);
    return true;
  } catch (error) {
    console.error({ event: "admin.login.site_resolution_failed", error: safeAdminLoginError(error) });
    return false;
  }
}

async function login(req, res) {
  const data = parseAdminLoginBody(req.body);
  if (!data) return invalidAdminLogin(res);

  let admin = null;
  try {
    admin = await prisma.admin.findUnique({ where: { username: data.username } });
  } catch (error) {
    console.error({ event: "admin.login.credential_lookup_failed", error: safeAdminLoginError(error) });
    return invalidAdminLogin(res);
  }

  let passwordMatches = false;
  if (admin && typeof admin.passwordHash === "string" && admin.passwordHash) {
    try {
      passwordMatches = await verifyPassword(data.password, admin.passwordHash);
    } catch (_error) {
      console.error({
        event: "admin.login.password_verify_failed",
        error: safeAdminLoginError(_error),
      });
      passwordMatches = false;
    }
  }

  if (!admin || !passwordMatches) {
    return invalidAdminLogin(res);
  }
  if (admin.status !== "active") {
    const error = new Error("Admin is not active");
    error.statusCode = 403;
    throw error;
  }
  if (!(await ensureAdminLoginSite(req))) {
    return invalidAdminLogin(res);
  }

  const now = new Date();
  const scheduleCheck = await checkAdminLoginSchedule(admin, now, { siteId: req.siteId });
  if (!scheduleCheck.allowed) {
    await auditLoginBlockedOutsideSchedule({
      admin,
      siteId: req.siteId,
      schedule: scheduleCheck.schedule,
      req,
      now,
    });
    const error = new Error("Admin login is outside allowed work schedule");
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await logAdminAction({
    admin: updated,
    action: "admin.login.success",
    targetType: "admin",
    targetId: updated.id,
    before: null,
    after: {
      adminId: updated.id,
      role: updated.role,
      status: updated.status,
      result: "success",
      scheduleResult: scheduleCheck.reason,
    },
    req,
    siteId: req.siteId,
  });

  return success(res, {
    token: signAdminToken(updated),
    admin: publicAdmin(updated),
  });
}

async function me(req, res) {
  return success(res, publicAdmin(req.admin));
}

async function listMembers(req, res) {
  return success(res, await memberService.listMembers(req.query, req.siteId));
}

async function getMember(req, res) {
  return success(res, await memberService.getMember(req.params.id, req.siteId));
}

async function blockMember(req, res) {
  return success(res, await memberService.setBlocked({ id: req.params.id, blocked: true, admin: req.admin, req, siteId: req.siteId }));
}

async function unblockMember(req, res) {
  return success(res, await memberService.setBlocked({ id: req.params.id, blocked: false, admin: req.admin, req, siteId: req.siteId }));
}

async function addCredit(req, res) {
  const data = amountSchema.parse(req.body);
  const result = await prisma.$transaction(async (tx) => {
    const before = await tx.user.findFirst({ where: { id: req.params.id, siteId: req.siteId } });
    if (!before) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }
    const movement = await walletService.createWalletMovement({
      tx,
      userId: req.params.id,
      siteId: req.siteId,
      type: "admin_add_credit",
      amount: data.amount,
      referenceType: "admin_credit",
      referenceId: req.admin.id,
      createdByType: "admin",
      createdById: req.admin.id,
      note: data.note || "Admin add credit",
    });
    await logAdminAction({
      tx,
      admin: req.admin,
      action: "credit.add",
      targetType: "user",
      targetId: req.params.id,
      before,
      after: movement,
      req,
      siteId: req.siteId,
    });
    return movement;
  });
  return success(res, result);
}

async function removeCredit(req, res) {
  const data = amountSchema.parse(req.body);
  const result = await prisma.$transaction(async (tx) => {
    const before = await tx.user.findFirst({ where: { id: req.params.id, siteId: req.siteId } });
    if (!before) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }
    const movement = await walletService.createWalletMovement({
      tx,
      userId: req.params.id,
      siteId: req.siteId,
      type: "admin_remove_credit",
      amount: data.amount,
      referenceType: "admin_credit",
      referenceId: req.admin.id,
      createdByType: "admin",
      createdById: req.admin.id,
      note: data.note || "Admin remove credit",
    });
    await logAdminAction({
      tx,
      admin: req.admin,
      action: "credit.remove",
      targetType: "user",
      targetId: req.params.id,
      before,
      after: movement,
      req,
      siteId: req.siteId,
    });
    return movement;
  });
  return success(res, result);
}

async function addPoints(req, res) {
  const data = pointSchema.parse(req.body);
  return success(
    res,
    await pointService.movePoints({
      userId: req.params.id,
      siteId: req.siteId,
      amount: data.amount,
      direction: "add",
      reason: data.reason,
      referenceType: data.reference_type,
      referenceId: data.reference_id,
      admin: req.admin,
      req,
    })
  );
}

async function removePoints(req, res) {
  const data = pointSchema.parse(req.body);
  return success(
    res,
    await pointService.movePoints({
      userId: req.params.id,
      siteId: req.siteId,
      amount: data.amount,
      direction: "remove",
      reason: data.reason,
      referenceType: data.reference_type,
      referenceId: data.reference_id,
      admin: req.admin,
      req,
    })
  );
}

async function reportSummary(req, res) {
  return success(res, await reportService.summary(req.siteId));
}

async function reportDeposits(req, res) {
  return success(res, await reportService.deposits(req.query, req.siteId));
}

async function reportWithdrawals(req, res) {
  return success(res, await reportService.withdrawals(req.query, req.siteId));
}

async function reportWalletLedger(req, res) {
  return success(res, await reportService.walletLedger(req.query, req.siteId));
}

async function logs(req, res) {
  return success(res, await listAdminLogs({ ...req.query, siteId: req.siteId }));
}

module.exports = {
  login,
  me,
  listMembers,
  getMember,
  blockMember,
  unblockMember,
  addCredit,
  removeCredit,
  addPoints,
  removePoints,
  reportSummary,
  reportDeposits,
  reportWithdrawals,
  reportWalletLedger,
  logs,
};
