const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_HARDENING_PLAN.md");

function readPlan() {
  assert(fs.existsSync(DOC_PATH), "docs/FINANCIAL_LEDGER_HARDENING_PLAN.md must exist.");
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

  assert(!lower.includes(postgresProtocol), "Financial ledger hardening plan contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Financial ledger hardening plan contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Financial ledger hardening plan contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Financial ledger hardening plan contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Financial ledger hardening plan contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Financial ledger hardening plan contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Financial ledger hardening plan contains database actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Financial ledger hardening plan contains authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Financial ledger hardening plan contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Financial ledger hardening plan contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Financial ledger hardening plan contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Financial ledger hardening plan contains rendered placeholder: ${marker}`);
  }
}

function assertDocContract(text) {
  assertIncludes("Financial ledger hardening plan", text, [
    "NOT production ready",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no live payout",
  ]);

  assertNormalizedIncludes("Financial safety boundaries", text, [
    "Hard Financial Safety Boundaries",
    "No live payout",
    "No production DB",
    "No real provider/payment/bank",
    "No frontend-selected reward",
    "prizeIndex",
    "All money-affecting actions require audit",
    "Admin write actions require reason",
    "Response leak scan required",
    "Sandbox/mock only",
  ]);

  assertNormalizedIncludes("Ledger model requirements", text, [
    "Ledger Model Requirements",
    "ledgerEntryId",
    "siteId",
    "memberId",
    "sourceType",
    "sourceId",
    "transactionType",
    "amount",
    "currency",
    "balanceBefore",
    "balanceAfter",
    "status",
    "idempotencyKey",
    "createdBy",
    "createdAt",
    "reason",
    "auditLogId",
    "metadataSnapshot",
  ]);

  assertNormalizedIncludes("Double-entry / balance integrity plan", text, [
    "Double-Entry / Balance Integrity Plan",
    "every credit/debit must have a source record",
    "balanceBefore",
    "balanceAfter",
    "No negative balance unless an explicit reviewed rule exists",
    "Idempotency required",
    "Duplicate callback protection",
    "Reconciliation status required",
    "Manual adjustment must require reason and audit",
    "Rollback/reversal entry",
  ]);

  assertNormalizedIncludes("Deposit/withdraw hardening", text, [
    "Deposit Hardening",
    "pending, verified, credited, rejected, cancelled",
    "Slip OCR mock/sandbox only",
    "Bank statement mock/sandbox only",
    "Admin-added deposit requires reason and audit",
    "No live bank automation until certified",
    "Withdraw Hardening",
    "pending, review, approved, paid, rejected, cancelled",
    "Dual control required",
    "No live payout until certified",
    "Balance lock/reserve design",
    "Withdrawal reversal policy",
  ]);

  assertNormalizedIncludes("Admin and reward hardening", text, [
    "Admin Credit Adjustment Hardening",
    "Add credit and remove credit require reason",
    "Bonus credit requires source and reason",
    "Turnover edit requires reason",
    "High-risk action flag",
    "Before/after balance snapshot",
    "Promotion/Bonus/Reward Hardening",
    "Lucky Wheel reward source",
    "Cashback/commission source",
    "No reward value mutation during claim",
    "Report/reconciliation required",
  ]);

  assertNormalizedIncludes("Reconciliation plan", text, [
    "Reconciliation Plan",
    "Daily deposit reconciliation",
    "Daily withdraw reconciliation",
    "Wallet balance reconciliation",
    "Provider callback reconciliation",
    "Admin adjustment reconciliation",
    "Lucky Wheel reward reconciliation",
    "Unmatched transaction report",
    "Stale pending report",
    "Failed callback report",
    "Ledger variance report",
  ]);

  assertNormalizedIncludes("Audit trail requirements", text, [
    "Audit Trail Requirements",
    "Immutable audit events",
    "Actor/admin identity",
    "siteCode",
    "Action",
    "Target type/id",
    "Before/after sanitized snapshot",
    "Reason",
    "IP masked",
    "UserAgent hash",
    "createdAt",
    "No secret values",
  ]);

  assertNormalizedIncludes("Dual control plan", text, [
    "Dual Control Plan",
    "Money-affecting high-risk actions require two-person approval",
    "Maker",
    "Checker",
    "Auditor",
    "Owner",
    "No self-approval",
    "Emergency override requires reason and audit",
  ]);

  assertNormalizedIncludes("Reports required before production", text, [
    "Reports Required Before Production",
    "Ledger balance report",
    "Member balance report",
    "Deposit reconciliation report",
    "Withdraw reconciliation report",
    "Admin adjustment report",
    "Bonus/reward cost report",
    "Stuck pending report",
    "Failed callback report",
    "Audit anomaly report",
  ]);

  assertNormalizedIncludes("Tests required before production", text, [
    "Tests Required Before Production",
    "Existing financial safety tests",
    "Wallet/deposit/withdraw/admin-credit/provider-callback tests",
    "Idempotency tests",
    "Duplicate callback tests",
    "Negative balance tests",
    "Reversal tests",
    "Response leak scan",
    "Reconciliation dry-run",
    "Backup/restore drill",
  ]);

  assertNormalizedIncludes("Go/No-Go financial criteria", text, [
    "Go/No-Go Financial Criteria",
    "No reconciliation report",
    "No audit trail for money-affecting actions",
    "No idempotency for deposits/provider callbacks",
    "No dual control design for withdrawals",
    "No backup/restore drill",
    "Response leak scan fails",
    "Live provider/payment/bank not certified",
    "Production DB not isolated",
    "Admin RBAC negative tests fail",
  ]);

  assertIncludes("Next phases", text, ["Phase Q", "Phase R", "Phase S", "Phase T"]);
}

function main() {
  const text = readPlan();
  console.log("Financial ledger hardening doc exists: PASS");

  assertDocContract(text);
  console.log("Financial safety boundaries documented: PASS");
  console.log("Ledger model requirements documented: PASS");
  console.log("Deposit/withdraw hardening documented: PASS");
  console.log("Reconciliation plan documented: PASS");
  console.log("Audit trail/dual control documented: PASS");
  console.log("Financial Go/No-Go criteria documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  console.log("Financial ledger hardening static secret scan: PASS");

  console.log("Financial ledger hardening smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger hardening smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
