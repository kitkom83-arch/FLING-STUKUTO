const BankStatementAdapter = require("./BankStatementAdapter");

const SAFE_MODES = new Set(["mock", "sandbox"]);

function assertSafeMode(mode) {
  const normalized = String(mode || "mock").trim().toLowerCase();
  if (!SAFE_MODES.has(normalized)) {
    const error = new Error("Bank statement mock is only available in mock or sandbox mode");
    error.statusCode = 400;
    throw error;
  }
}

function normalizeDate(value, fallback) {
  const date = value ? new Date(value) : new Date(fallback);
  if (Number.isNaN(date.getTime())) {
    const error = new Error("Invalid statement date filter");
    error.statusCode = 400;
    throw error;
  }
  return date;
}

function containsSearch(transaction, search) {
  if (!search) return true;
  const haystack = [
    transaction.statementType,
    transaction.bank,
    transaction.account,
    transaction.amount,
    transaction.reference,
    transaction.description,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search.toLowerCase());
}

class MockBankStatementAdapter extends BankStatementAdapter {
  constructor(config = {}) {
    super(config);
    assertSafeMode(config.mode);
    this.transactions = config.transactions || [
      {
        statementType: "deposit",
        bank: "MOCK_BANK",
        account: "000-xxx-1001",
        amount: "100.00",
        date: "2026-05-08T10:00:00.000Z",
        reference: "MOCK-DEP-0001",
        direction: "credit",
        description: "Mock deposit statement row",
      },
      {
        statementType: "deposit",
        bank: "MOCK_BANK",
        account: "000-xxx-1002",
        amount: "250.00",
        date: "2026-05-09T11:30:00.000Z",
        reference: "MOCK-DEP-0002",
        direction: "credit",
        description: "Mock deposit statement row",
      },
      {
        statementType: "withdraw",
        bank: "MOCK_BANK",
        account: "000-xxx-2001",
        amount: "50.00",
        date: "2026-05-08T12:00:00.000Z",
        reference: "MOCK-WDR-0001",
        direction: "debit",
        description: "Mock withdraw statement row",
      },
      {
        statementType: "withdraw",
        bank: "MOCK_BANK",
        account: "000-xxx-2002",
        amount: "75.00",
        date: "2026-05-09T14:45:00.000Z",
        reference: "MOCK-WDR-0002",
        direction: "debit",
        description: "Mock withdraw statement row",
      },
    ];
  }

  async listTransactions(options = {}) {
    const statementType = options.statementType;
    const from = options.from ? normalizeDate(options.from, options.from) : null;
    const to = options.to ? normalizeDate(options.to, options.to) : null;
    const search = String(options.search || "").trim();

    const rows = this.transactions
      .filter((transaction) => !statementType || transaction.statementType === statementType)
      .filter((transaction) => {
        const date = new Date(transaction.date);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return containsSearch(transaction, search);
      });
    return Promise.all(rows.map((transaction) => this.normalizeTransaction(transaction)));
  }

  async matchDeposit(deposit, transactions) {
    const match = transactions.find(
      (transaction) =>
        transaction.reference === deposit.reference &&
        String(transaction.amount) === String(deposit.amount) &&
        transaction.account === deposit.account
    );
    return match ? { status: "match", transaction: match } : { status: "no-match", transaction: null };
  }

  async normalizeTransaction(transaction) {
    return {
      source: "mock",
      mode: "mock",
      statementType: transaction.statementType,
      bank: transaction.bank || "MOCK_BANK",
      account: transaction.account,
      amount: normalizeAmount(transaction.amount),
      date: new Date(transaction.date).toISOString(),
      reference: transaction.reference,
      direction: transaction.direction,
      description: transaction.description || null,
    };
  }
}

function normalizeAmount(value) {
  const amount = Number(String(value));
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("Mock statement amount is invalid");
    error.statusCode = 400;
    throw error;
  }
  return amount.toFixed(2);
}

module.exports = MockBankStatementAdapter;
