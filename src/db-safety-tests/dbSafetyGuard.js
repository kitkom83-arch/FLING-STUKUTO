const { DB_SAFETY_CASES } = require("./dbSafetyPlan");

function run() {
  console.error("DB-backed safety tests are not enabled in this checkout.");
  console.error("Use npm run test:db:safety:dry-run until a staging/test PostgreSQL database is confirmed.");
  console.error("Before enabling this runner, verify the target database is staging/test only and never print its URL.");
  console.error(`Planned DB-backed cases: ${DB_SAFETY_CASES.length}`);
  process.exit(1);
}

run();
