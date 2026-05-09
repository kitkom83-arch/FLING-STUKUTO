const assert = require("assert");
const { FinancialSafetyHarness } = require("./financialSafetyHarness");

async function run() {
  const admin = { id: "admin_deposit" };
  const harness = new FinancialSafetyHarness();
  harness.createUser({ id: "user_deposit", balance: "0.00" });

  harness.createDeposit({ id: "deposit_approved", userId: "user_deposit", amount: "100.00" });
  const approved = harness.approveDeposit({ id: "deposit_approved", admin });
  assert.strictEqual(approved.deposit.status, "approved");
  assert.strictEqual(approved.wallet.balance, "100.00");
  assert.strictEqual(approved.ledger.balanceBefore, "0.00");
  assert.strictEqual(approved.ledger.balanceAfter, "100.00");

  assert.throws(() => harness.approveDeposit({ id: "deposit_approved", admin }), /Deposit is not pending/);
  assert.throws(
    () => harness.rejectDeposit({ id: "deposit_approved", admin, rejectReason: "late reject" }),
    /Deposit is not pending/
  );
  assert.strictEqual(harness.walletSummary("user_deposit").balance, "100.00", "duplicate approval must not add balance");

  harness.createDeposit({ id: "deposit_rejected", userId: "user_deposit", amount: "50.00" });
  const rejected = harness.rejectDeposit({ id: "deposit_rejected", admin, rejectReason: "invalid slip" });
  assert.strictEqual(rejected.status, "rejected");
  assert.throws(() => harness.approveDeposit({ id: "deposit_rejected", admin }), /Deposit is not pending/);
  assert.strictEqual(harness.walletSummary("user_deposit").balance, "100.00", "approve after reject must not add balance");

  console.log("deposit safety harness: PASS");
}

run().catch((error) => {
  console.error("deposit safety harness: FAIL", error.message);
  process.exit(1);
});
