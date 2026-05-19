const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "PRODUCTION_READINESS_GAP_AUDIT.md");

function readAuditDoc() {
  assert(fs.existsSync(DOC_PATH), "docs/PRODUCTION_READINESS_GAP_AUDIT.md must exist.");
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

function assertPattern(label, text, pattern, description) {
  assert(pattern.test(text), `${label} missing ${description}.`);
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

  assert(!lower.includes(postgresProtocol), "Audit doc contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Audit doc contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Audit doc contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Audit doc contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Audit doc contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Audit doc contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Audit doc contains DATABASE_URL actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Audit doc contains Authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Audit doc contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Audit doc contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Audit doc contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Audit doc contains rendered placeholder: ${marker}`);
  }
}

function assertDocContract(text) {
  const lower = normalize(text);
  assert(text.includes("NOT production ready"), "Audit doc must state NOT production ready.");
  assert(lower.includes("production blockers"), "Audit doc must include production blockers.");
  assert(lower.includes("mock/sandbox boundaries"), "Audit doc must include mock/sandbox boundaries.");
  assert(lower.includes("no real money") || lower.includes("real money payout must remain off"), "Audit doc must state no real money.");
  assert(lower.includes("no production db") || lower.includes("production db must remain off"), "Audit doc must state no production DB.");
  assert(
    lower.includes("no live provider") || lower.includes("provider/payment/bank/sms/slip ocr must remain mock"),
    "Audit doc must state no live provider boundary."
  );
  assert(lower.includes("go/no-go criteria"), "Audit doc must include Go/No-Go criteria.");
  assert(lower.includes("p0 checklist"), "Audit doc must include P0 checklist.");
  assert(lower.includes("recommended next phases"), "Audit doc must include recommended next phases.");

  assertIncludes("Production blocker categories", text, [
    "Production DB provisioning",
    "Secret management / rotation",
    "Admin credential policy",
    "Live provider/payment/bank/SMS/Slip OCR integration",
    "Financial ledger/audit hardening",
    "Monitoring/alerting/log retention",
    "Backup/restore",
    "Rate limiting / abuse prevention",
    "Legal/compliance/accounting review",
    "Incident response runbook",
    "Data privacy / PII handling",
    "Security review / penetration test",
    "Observability for payouts/deposits/withdrawals",
    "Customer support/operator training",
    "Migration/rollback plan",
  ]);

  assertIncludes("Mock/sandbox boundary markers", text, [
    "Provider/payment/bank/SMS/Slip OCR",
    "Lucky Wheel reward payout",
    "Real money payout",
    "Production DB",
    "Frontend-selected spin result",
  ]);

  assertPattern("Go/No-Go criteria", text, /Go only if all P0 items are complete/i, "P0 go condition");
  assertPattern("Go/No-Go criteria", text, /No-Go if response leak scan fails/i, "response leak no-go");
  assertPattern("Go/No-Go criteria", text, /No-Go if DB backup restore is not tested/i, "backup restore no-go");
}

function main() {
  const text = readAuditDoc();
  console.log("Production readiness doc exists: PASS");

  assertDocContract(text);
  console.log("Production blockers documented: PASS");
  console.log("Mock/sandbox boundaries documented: PASS");
  console.log("Go/No-Go criteria documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  console.log("Production readiness static secret scan: PASS");

  console.log("Production readiness audit smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Production readiness audit smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
