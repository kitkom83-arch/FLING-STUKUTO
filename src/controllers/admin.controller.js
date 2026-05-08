const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { success } = require("../utils/response");
const { verifyPassword } = require("../utils/password");
const memberService = require("../services/member.service");
const walletService = require("../services/wallet.service");
const pointService = require("../services/point.service");
const reportService = require("../services/report.service");
const { logAdminAction, listAdminLogs } = require("../services/adminLog.service");

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

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

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const admin = await prisma.admin.findUnique({ where: { username: data.username } });
  if (!admin || !(await verifyPassword(data.password, admin.passwordHash))) {
    const error = new Error("Invalid username or password");
    error.statusCode = 400;
    throw error;
  }
  if (admin.status !== "active") {
    const error = new Error("Admin is not active");
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
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
