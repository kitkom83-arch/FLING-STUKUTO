const assert = require("assert");
const { FinancialSafetyHarness } = require("./financialSafetyHarness");

async function run() {
  const admin = { id: "admin_withdraw" };
  const harness = new FinancialSafetyHarness();
  harness.createUser({ id: "user_withdraw", balance: "200.00" });

  harness.createWithdrawal({ id: "withdraw_approved", userId: "user_withdraw", amount: "80.00" });
  const approved = harness.approveWithdrawal({ id: "withdraw_approved", admin });
  assert.strictEqual(approved.withdrawal.status, "approved");
  assert.strictEqual(approved.wallet.balance, "120.00");
  assert.strictEqual(approved.ledger.balanceBefore, "200.00");
  assert.strictEqual(approved.ledger.balanceAfter, "120.00");

  assert.throws(() => harness.approveWithdrawal({ id: "withdraw_approved", admin }), /Withdrawal is not pending/);
  assert.throws(
    () => harness.rejectWithdrawal({ id: "withdraw_approved", admin, rejectReason: "late reject" }),
    /Only pending withdrawal can be rejected/
  );
  assert.strictEqual(harness.walletSummary("user_withdraw").balance, "120.00", "duplicate withdrawal approval must not debit again");

  const paid = harness.markWithdrawalPaid({ id: "withdraw_approved", admin });
  assert.strictEqual(paid.status, "paid");
  assert.throws(() => harness.markWithdrawalPaid({ id: "withdraw_approved", admin }), /approved before mark-paid/);

  harness.createWithdrawal({ id: "withdraw_rejected", userId: "user_withdraw", amount: "20.00" });
  const rejected = harness.rejectWithdrawal({ id: "withdraw_rejected", admin, rejectReason: "manual reject" });
  assert.strictEqual(rejected.status, "rejected");
  assert.throws(() => harness.approveWithdrawal({ id: "withdraw_rejected", admin }), /Withdrawal is not pending/);

  console.log("withdraw safety harness: PASS");
}

run().catch((error) => {
  console.error("withdraw safety harness: FAIL", error.message);
  process.exit(1);
});
