const assert = require("assert");
const BankStatementAdapter = require("../adapters/bank/BankStatementAdapter");

function isDecimalSafe(value) {
  return typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
}

class SandboxBankStatementAdapter extends BankStatementAdapter {
  async listTransactions(dateRange) {
    assert.ok(dateRange.from && dateRange.to, "dateRange.from and dateRange.to are required");
    return [
      {
        bank: "SANDBOX_BANK",
        account: "123-xxx-7890",
        amount: "100.00",
        date: "2026-05-08T10:00:00.000Z",
        reference: "BANK-SANDBOX-0001",
      },
    ];
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
      bank: transaction.bank || "UNKNOWN",
      account: transaction.account,
      amount: String(transaction.amount),
      date: new Date(transaction.date).toISOString(),
      reference: transaction.reference,
    };
  }
}

async function run() {
  const adapter = new SandboxBankStatementAdapter();
  const transactions = await adapter.listTransactions({
    from: "2026-05-08T00:00:00.000Z",
    to: "2026-05-08T23:59:59.999Z",
  });
  assert.ok(Array.isArray(transactions) && transactions.length > 0, "listTransactions must return transactions");

  const normalized = await adapter.normalizeTransaction(transactions[0]);
  assert.ok(normalized.amount, "transaction must include amount");
  assert.ok(normalized.date, "transaction must include date");
  assert.ok(normalized.reference, "transaction must include reference");
  assert.ok(normalized.account, "transaction must include account");
  assert.ok(isDecimalSafe(normalized.amount), "transaction amount must not be NaN");

  const match = await adapter.matchDeposit(
    { reference: "BANK-SANDBOX-0001", amount: "100.00", account: "123-xxx-7890" },
    transactions
  );
  assert.strictEqual(match.status, "match", "matchDeposit must return clear match status");

  const noMatch = await adapter.matchDeposit(
    { reference: "BANK-SANDBOX-9999", amount: "200.00", account: "123-xxx-7890" },
    transactions
  );
  assert.strictEqual(noMatch.status, "no-match", "matchDeposit must return clear no-match status");

  console.log("bank integration harness: PASS");
}

run().catch((error) => {
  console.error("bank integration harness: FAIL", error.message);
  process.exit(1);
});
