const env = require("../config/env");
const MockBankStatementAdapter = require("../adapters/bank/MockBankStatementAdapter");
const MockSlipOcrAdapter = require("../adapters/slipOcr/MockSlipOcrAdapter");

function bankStatementAdapter() {
  return new MockBankStatementAdapter({ mode: env.bankStatement.mode });
}

function slipOcrAdapter() {
  return new MockSlipOcrAdapter({ mode: env.slipOcr.mode });
}

async function listStatements(statementType, query = {}) {
  const adapter = bankStatementAdapter();
  return adapter.listTransactions({
    statementType,
    from: query.from || query.date_from,
    to: query.to || query.date_to,
    search: query.search,
  });
}

async function verifySlipMock(payload = {}) {
  const adapter = slipOcrAdapter();
  const result = await adapter.verifySlip(payload);
  return adapter.normalizeResult(result);
}

module.exports = {
  listStatements,
  verifySlipMock,
};
