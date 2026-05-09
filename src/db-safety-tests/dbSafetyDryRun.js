const assert = require("assert");
const { DB_SAFETY_CASES } = require("./dbSafetyPlan");

async function run() {
  assert.strictEqual(DB_SAFETY_CASES.length, 5, "DB safety plan must include the required cases");
  assert.ok(DB_SAFETY_CASES.every((testCase) => testCase.id && testCase.title && testCase.expectation));

  console.log("db safety dry-run: PASS");
  for (const testCase of DB_SAFETY_CASES) {
    console.log(`- ${testCase.id}: planned`);
  }
}

run().catch((error) => {
  console.error("db safety dry-run: FAIL", error.message);
  process.exit(1);
});
