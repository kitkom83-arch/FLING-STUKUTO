const { z } = require("zod");
const { success } = require("../utils/response");
const bankMockService = require("../services/bankMock.service");

const slipVerifySchema = z.object({
  result: z.enum(["success", "fail"]).optional(),
  invalid: z.boolean().optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  reference: z.string().optional(),
});

async function listDepositStatements(req, res) {
  return success(res, await bankMockService.listStatements("deposit", req.query));
}

async function listWithdrawStatements(req, res) {
  return success(res, await bankMockService.listStatements("withdraw", req.query));
}

async function verifySlip(req, res) {
  const data = slipVerifySchema.parse(req.body || {});
  return success(res, await bankMockService.verifySlipMock(data));
}

module.exports = {
  listDepositStatements,
  listWithdrawStatements,
  verifySlip,
};
