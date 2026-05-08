class BankStatementAdapter {
  constructor(config = {}) {
    this.config = config;
    // Real bank config must come from .env or database config. Do not hard-code secrets.
  }

  async listTransactions(dateRange) {
    throw new Error("Not implemented");
  }

  async matchDeposit(deposit, transactions) {
    throw new Error("Not implemented");
  }

  async normalizeTransaction(transaction) {
    throw new Error("Not implemented");
  }
}

module.exports = BankStatementAdapter;
