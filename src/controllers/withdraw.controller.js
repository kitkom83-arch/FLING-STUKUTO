const { z } = require("zod");
const { success } = require("../utils/response");
const withdrawService = require("../services/withdraw.service");

const createSchema = z.object({
  user_bank_account_id: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
  note: z.string().optional(),
});

const rejectSchema = z.object({
  reject_reason: z.string().min(1),
});

async function create(req, res) {
  const data = createSchema.parse(req.body);
  return success(res, await withdrawService.createWithdrawal(req.user.id, req.siteId, data), 201);
}

async function listMine(req, res) {
  return success(res, await withdrawService.listUserWithdrawals(req.user.id, req.siteId));
}

async function listAdmin(req, res) {
  return success(res, await withdrawService.listWithdrawals(req.query, req.siteId));
}

async function approve(req, res) {
  return success(
    res,
    await withdrawService.approveWithdrawal({
      id: req.params.id,
      admin: req.admin,
      req,
      note: req.body && req.body.note,
      siteId: req.siteId,
    })
  );
}

async function reject(req, res) {
  const data = rejectSchema.parse(req.body);
  return success(
    res,
    await withdrawService.rejectWithdrawal({
      id: req.params.id,
      rejectReason: data.reject_reason,
      admin: req.admin,
      req,
      siteId: req.siteId,
    })
  );
}

async function markPaid(req, res) {
  return success(
    res,
    await withdrawService.markWithdrawalPaid({
      id: req.params.id,
      admin: req.admin,
      req,
      siteId: req.siteId,
    })
  );
}

module.exports = {
  create,
  listMine,
  listAdmin,
  approve,
  reject,
  markPaid,
};
