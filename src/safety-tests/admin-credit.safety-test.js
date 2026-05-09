const assert = require("assert");
const { FinancialSafetyHarness } = require("./financialSafetyHarness");

async function run() {
  const admin = { id: "admin_credit" };
  const harness = new FinancialSafetyHarness();
  harness.createUser({ id: "user_credit", balance: "25.00" });

  const add = harness.adminAddCredit({ userId: "user_credit", admin, amount: "40.00" });
  assert.strictEqual(add.wallet.balance, "65.00");
  assert.strictEqual(add.ledger.type, "admin_add_credit");

  const remove = harness.adminRemoveCredit({ userId: "user_credit", admin, amount: "15.00" });
  assert.strictEqual(remove.wallet.balance, "50.00");
  assert.strictEqual(remove.ledger.type, "admin_remove_credit");

  const actions = harness.adminLogs.map((row) => row.action);
  assert.ok(actions.includes("credit.add"), "admin add credit must create audit log");
  assert.ok(actions.includes("credit.remove"), "admin remove credit must create audit log");
  assert.ok(harness.adminLogs.every((row) => row.adminId === admin.id && row.targetType === "user"), "audit logs must identify admin and target");

  console.log("admin credit safety harness: PASS");
}

run().catch((error) => {
  console.error("admin credit safety harness: FAIL", error.message);
  process.exit(1);
});
