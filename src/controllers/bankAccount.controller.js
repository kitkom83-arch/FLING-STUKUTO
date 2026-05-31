const { z } = require("zod");
const { success } = require("../utils/response");
const bankAccountService = require("../services/bankAccount.service");

const createSchema = z.object({
  bank_code: z.string().min(1),
  bank_account_number: z.string().min(1),
  bank_account_name: z.string().min(1),
});

const reviewSchema = z.object({
  reason: z.string().trim().min(1),
});

async function listMine(req, res) {
  return success(res, await bankAccountService.listUserBankAccounts(req.user.id, req.siteId));
}

async function createMine(req, res) {
  const data = createSchema.parse(req.body);
  return success(res, await bankAccountService.createUserBankAccount(req.user.id, req.siteId, data), 201);
}

async function pending(req, res) {
  return success(res, await bankAccountService.listPendingBankAccounts(req.siteId));
}

async function approve(req, res) {
  const data = reviewSchema.parse(req.body);
  return success(
    res,
    await bankAccountService.updateBankAccountStatus({
      id: req.params.id,
      status: "approved",
      reason: data.reason,
      admin: req.admin,
      req,
      siteId: req.siteId,
      siteCode: req.siteCode,
    })
  );
}

async function reject(req, res) {
  const data = reviewSchema.parse(req.body);
  return success(
    res,
    await bankAccountService.updateBankAccountStatus({
      id: req.params.id,
      status: "rejected",
      reason: data.reason,
      admin: req.admin,
      req,
      siteId: req.siteId,
      siteCode: req.siteCode,
    })
  );
}

module.exports = {
  listMine,
  createMine,
  pending,
  approve,
  reject,
};
