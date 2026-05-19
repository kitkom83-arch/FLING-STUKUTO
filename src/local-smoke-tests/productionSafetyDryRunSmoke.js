const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "PRODUCTION_SAFETY_DRY_RUN.md");

function readDryRunDoc() {
  assert(fs.existsSync(DOC_PATH), "docs/PRODUCTION_SAFETY_DRY_RUN.md must exist.");
  return fs.readFileSync(DOC_PATH, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertNoSecretShapedValues(text) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const mongoProtocol = ["mongo", "db://"].join("");
  const mongoSrvProtocol = ["mongo", "db+srv://"].join("");
  const openAiKey = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerJwt = new RegExp(`\\b${["Be", "arer"].join("")}\\s+${["e", "y", "J"].join("")}[A-Za-z0-9._-]+`, "i");
  const longTokenLike = /\b[A-Za-z0-9_-]{48,}\b/;

  assert(!lower.includes(postgresProtocol), "Dry-run doc contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Dry-run doc contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Dry-run doc contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Dry-run doc contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Dry-run doc contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Dry-run doc contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Dry-run doc contains DATABASE_URL actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Dry-run doc contains Authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Dry-run doc contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Dry-run doc contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Dry-run doc contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Dry-run doc contains rendered placeholder: ${marker}`);
  }
}

function assertDocContract(text) {
  assertIncludes("Production safety dry-run doc", text, [
    "NOT production ready",
    "dry-run design",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
  ]);

  assertNormalizedIncludes("Production ENV checklist", text, [
    "Production ENV Dry-Run Checklist",
    "NODE_ENV",
    "APP_ENV",
    "DATABASE_URL",
    "SESSION_SECRET",
    "JWT_SECRET",
    "ADMIN_BOOTSTRAP_ENV",
    "provider",
    "payment",
    "bank",
    "SMS",
    "Slip OCR",
    "webhook",
    "monitoring",
    "backup",
    "allowed origins",
    "rate limit",
  ]);

  assertNormalizedIncludes("Hard safety boundaries", text, [
    "Production DB disabled",
    "Real money disabled",
    "Live provider/payment/bank/SMS/Slip OCR disabled",
    "No real payout",
    "Member spin result remains backend-only",
    "Frontend-selected reward",
    "No secret in logs",
  ]);

  assertNormalizedIncludes("Dry-run smoke plan", text, [
    "Dry-Run Smoke Plan",
    "smoke:production-readiness-audit",
    "smoke:staging-release-readiness",
    "smoke:production-safety-dry-run",
    "smoke:staging-release-gate",
    "smoke:staging-role-permission-uat",
    "smoke:staging-uat",
    "There is no production smoke in Phase N",
    "response leak scan",
  ]);

  assertNormalizedIncludes("Rollback dry-run design", text, [
    "Rollback Dry-Run Design",
    "previous deploy",
    "health check",
    "release gate",
    "audit logs",
    "operator communication",
    "incident timeline template",
  ]);

  assertNormalizedIncludes("Backup/restore dry-run design", text, [
    "Backup/Restore Dry-Run Design",
    "backup schedule",
    "restore drill frequency",
    "restore target",
    "data integrity",
    "rollback",
  ]);

  assertNormalizedIncludes("Monitoring/alerting dry-run design", text, [
    "Monitoring/Alerting Dry-Run Design",
    "uptime",
    "API 5xx rate",
    "database connection",
    "auth failure spike",
    "admin write action spike",
    "wallet/ledger anomaly",
    "provider callback anomaly",
    "queue/job failures",
    "response leak alerts",
  ]);

  assertNormalizedIncludes("Financial safety dry-run", text, [
    "Financial Safety Dry-Run",
    "Deposit and withdraw disabled until certified",
    "Payment/provider sandbox only",
    "Bank statement mock/sandbox only",
    "Reconciliation report required",
    "Operator dual control",
    "No live payout before certification",
  ]);

  assertNormalizedIncludes("Go/No-Go rehearsal", text, [
    "Go/No-Go Rehearsal",
    "P0 blockers",
    "Dry-run pass/fail",
    "Owner signoff",
    "Security signoff",
    "Finance signoff",
    "Operator signoff",
  ]);

  assertIncludes("Next phases", text, ["Phase O", "Phase P", "Phase Q", "Phase R"]);
}

function main() {
  const text = readDryRunDoc();
  console.log("Production safety dry-run doc exists: PASS");

  assertDocContract(text);
  console.log("Hard safety boundaries documented: PASS");
  console.log("Dry-run smoke plan documented: PASS");
  console.log("Rollback/backup/monitoring documented: PASS");
  console.log("Financial safety documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  console.log("Production safety dry-run static secret scan: PASS");

  console.log("Production safety dry-run smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Production safety dry-run smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
