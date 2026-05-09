const assert = require("assert");
const { FinancialSafetyHarness } = require("./financialSafetyHarness");

async function run() {
  const harness = new FinancialSafetyHarness();
  harness.createUser({ id: "user_callback", balance: "0.00" });

  const first = harness.applyProviderCallback({
    userId: "user_callback",
    reference: "PAY-CALLBACK-0001",
    amount: "100.00",
  });
  assert.strictEqual(first.duplicate, false);
  assert.strictEqual(first.creditApplied, true);
  assert.strictEqual(first.wallet.balance, "100.00");

  const duplicate = harness.applyProviderCallback({
    userId: "user_callback",
    reference: "PAY-CALLBACK-0001",
    amount: "100.00",
  });
  assert.strictEqual(duplicate.duplicate, true);
  assert.strictEqual(duplicate.creditApplied, false);
  assert.strictEqual(duplicate.wallet.balance, "100.00", "duplicate callback must not add balance twice");
  assert.strictEqual(harness.ledger.filter((row) => row.referenceId === "PAY-CALLBACK-0001").length, 1);

  console.log("provider callback safety harness: PASS");
}

run().catch((error) => {
  console.error("provider callback safety harness: FAIL", error.message);
  process.exit(1);
});
