"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const steps = [
  { label: "node --check src/safety-tests/financialSafetyHarness.js", args: ["--check", "src/safety-tests/financialSafetyHarness.js"] },
  { label: "node --check src/safety-tests/wallet.safety-test.js", args: ["--check", "src/safety-tests/wallet.safety-test.js"] },
  { label: "node --check src/safety-tests/deposit.safety-test.js", args: ["--check", "src/safety-tests/deposit.safety-test.js"] },
  { label: "node --check src/safety-tests/withdraw.safety-test.js", args: ["--check", "src/safety-tests/withdraw.safety-test.js"] },
  { label: "node --check src/safety-tests/admin-credit.safety-test.js", args: ["--check", "src/safety-tests/admin-credit.safety-test.js"] },
  { label: "node --check src/safety-tests/provider-callback.safety-test.js", args: ["--check", "src/safety-tests/provider-callback.safety-test.js"] },
  { label: "node --check src/safety-tests/adminLoginFailClosed.test.js", args: ["--check", "src/safety-tests/adminLoginFailClosed.test.js"] },
  { label: "node src/safety-tests/adminLoginFailClosed.test.js", args: ["src/safety-tests/adminLoginFailClosed.test.js"] },
  { label: "node --check src/safety-tests/adminWheelConfigRoute.test.js", args: ["--check", "src/safety-tests/adminWheelConfigRoute.test.js"] },
  { label: "node src/safety-tests/adminWheelConfigRoute.test.js", args: ["src/safety-tests/adminWheelConfigRoute.test.js"] },
  { label: "node --check src/safety-tests/memberWheelRoute.test.js", args: ["--check", "src/safety-tests/memberWheelRoute.test.js"] },
  { label: "node src/safety-tests/memberWheelRoute.test.js", args: ["src/safety-tests/memberWheelRoute.test.js"] },
  { label: "node --check src/db-safety-tests/dbSafetyPlan.js", args: ["--check", "src/db-safety-tests/dbSafetyPlan.js"] },
  { label: "node --check src/db-safety-tests/dbSafetyDryRun.js", args: ["--check", "src/db-safety-tests/dbSafetyDryRun.js"] },
  { label: "node --check src/db-safety-tests/dbSafetyGuard.js", args: ["--check", "src/db-safety-tests/dbSafetyGuard.js"] },
  { label: "node --check src/db-safety-tests/dbBackedSafetySuite.js", args: ["--check", "src/db-safety-tests/dbBackedSafetySuite.js"] },
  { label: "node --check src/local-smoke-tests/runSafetyCheck.js", args: ["--check", "src/local-smoke-tests/runSafetyCheck.js"] },
];

function runStep(step) {
  console.log(`[check:safety] ${step.label}`);
  const result = spawnSync(process.execPath, step.args, {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(`[check:safety] failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.signal) {
    console.error(`[check:safety] stopped by signal: ${result.signal}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(typeof result.status === "number" ? result.status : 1);
  }
}

for (const step of steps) {
  runStep(step);
}

console.log("[check:safety] PASS");
