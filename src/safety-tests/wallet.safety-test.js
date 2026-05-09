const assert = require("assert");
const { FinancialSafetyHarness } = require("./financialSafetyHarness");

async function run() {
  const harness = new FinancialSafetyHarness();
  harness.createUser({ id: "user_wallet", balance: "10.00" });

  const credit = harness.createWalletMovement({
    userId: "user_wallet",
    type: "admin_add_credit",
    amount: "15.50",
    referenceType: "admin_credit",
    referenceId: "admin_1",
    createdByType: "admin",
    createdById: "admin_1",
  });
  assert.strictEqual(credit.ledger.balanceBefore, "10.00");
  assert.strictEqual(credit.ledger.balanceAfter, "25.50");

  const debit = harness.createWalletMovement({
    userId: "user_wallet",
    type: "admin_remove_credit",
    amount: "5.25",
    referenceType: "admin_credit",
    referenceId: "admin_1",
    createdByType: "admin",
    createdById: "admin_1",
  });
  assert.strictEqual(debit.wallet.balance, "20.25");
  assert.strictEqual(debit.ledger.amount, "-5.25");
  assert.ok(harness.ledger.every((row) => row.balanceBefore && row.balanceAfter), "ledger must keep before/after balance");

  assert.throws(
    () =>
      harness.createWalletMovement({
        userId: "user_wallet",
        type: "admin_remove_credit",
        amount: "99.00",
        referenceType: "admin_credit",
        referenceId: "admin_1",
        createdByType: "admin",
      }),
    /Insufficient wallet balance/
  );

  console.log("wallet safety harness: PASS");
}

run().catch((error) => {
  console.error("wallet safety harness: FAIL", error.message);
  process.exit(1);
});
