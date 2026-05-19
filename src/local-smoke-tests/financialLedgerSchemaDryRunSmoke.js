const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md");

function readPlan() {
  assert(fs.existsSync(DOC_PATH), "docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md must exist.");
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

  assert(!lower.includes(postgresProtocol), "Financial ledger schema dry-run plan contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Financial ledger schema dry-run plan contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Financial ledger schema dry-run plan contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Financial ledger schema dry-run plan contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Financial ledger schema dry-run plan contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Financial ledger schema dry-run plan contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Financial ledger schema dry-run plan contains database actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Financial ledger schema dry-run plan contains authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Financial ledger schema dry-run plan contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Financial ledger schema dry-run plan contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Financial ledger schema dry-run plan contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Financial ledger schema dry-run plan contains rendered placeholder: ${marker}`);
  }
}

function assertNoUnsafeEnablement(text) {
  const lower = normalize(text);
  const withoutAllowedNotReady = lower.replace(/not production ready/g, "");

  assert(!withoutAllowedNotReady.includes("production ready"), "Financial ledger schema dry-run plan implies production ready.");
  assert(!/live payout (enabled|on|active|allowed|approved)/i.test(text), "Financial ledger schema dry-run plan implies live payout enabled.");
  assert(!/production db (enabled|on|active|allowed|approved)/i.test(text), "Financial ledger schema dry-run plan implies production DB enabled.");
}

function assertDocContract(text) {
  assertIncludes("Financial ledger schema dry-run plan", text, [
    "Phase R",
    "NOT production ready",
    "schema dry-run design only",
    "migration plan only",
    "no Prisma migration",
    "no schema.prisma change",
    "no production DB",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
  ]);

  assertNormalizedIncludes("Safety boundaries", text, [
    "Safety Boundaries",
    "Mock/staging/sandbox only",
    "No Prisma migration in Phase R",
    "No schema.prisma runtime change in Phase R",
    "No route/controller/service runtime implementation",
    "No frontend money authority",
    "No secret/token/password/DATABASE_URL/JWT/Authorization in docs/logs",
  ]);

  assertNormalizedIncludes("Existing contract references", text, [
    "Existing Contract References",
    "Phase P Financial Ledger Hardening Plan",
    "Phase Q Financial Ledger Runtime Data Contract",
    "API contract draft",
    "Idempotency contract",
    "Dual control contract",
    "Reconciliation contract",
    "Audit event contract",
  ]);

  assertNormalizedIncludes("Proposed schema draft", text, [
    "Proposed Schema Draft",
    "ledger_accounts",
    "ledger_entries",
    "ledger_transactions",
    "ledger_idempotency_keys",
    "ledger_reconciliation_runs",
    "ledger_reconciliation_items",
    "ledger_admin_adjustment_requests",
    "ledger_balance_snapshots",
    "ledger_audit_links",
    "Purpose",
    "Draft columns",
    "Required fields",
    "Nullable fields",
    "Unique constraints draft",
    "Indexes draft",
    "Relation draft",
    "Safety notes",
  ]);

  assertNormalizedIncludes("Ledger accounts draft", text, [
    "ledger_accounts Draft",
    "id",
    "siteId",
    "memberId",
    "accountType",
    "currency",
    "status",
    "createdAt",
    "updatedAt",
    "member_cash_wallet",
    "member_bonus_wallet",
    "member_point_wallet",
    "member_wheel_credit_wallet",
    "platform_clearing",
    "deposit_pending",
    "withdraw_reserved",
    "provider_transfer_pending",
    "admin_adjustment_clearing",
    "promotion_liability",
    "reward_liability",
  ]);

  assertNormalizedIncludes("Ledger entries draft", text, [
    "ledger_entries Draft",
    "transactionId",
    "sourceType",
    "sourceId",
    "transactionType",
    "direction",
    "amount",
    "balanceBefore",
    "balanceAfter",
    "idempotencyKey",
    "correlationId",
    "requestId",
    "createdByType",
    "createdById",
    "reason",
    "auditLogId",
    "metadataSnapshot",
    "reversalOfLedgerEntryId",
    "reconciliationStatus",
  ]);

  assertNormalizedIncludes("Ledger transactions draft", text, [
    "ledger_transactions Draft",
    "totalDebit",
    "totalCredit",
    "completedAt",
    "failedAt",
    "failureReason",
    "totalDebit must equal totalCredit",
    "failed/reversed transaction must use explicit reversal entries",
  ]);

  assertNormalizedIncludes("Idempotency schema plan", text, [
    "Idempotency Schema Plan",
    "siteId + action + memberId/sourceId",
    "requestHash",
    "responseSnapshot",
    "status",
    "expiresAt",
    "Unique constraint",
    "Conflict behavior",
  ]);

  assertNormalizedIncludes("Reconciliation schema plan", text, [
    "Reconciliation Schema Plan",
    "Reconciliation run",
    "Reconciliation item",
    "Unmatched deposit",
    "Unmatched withdraw",
    "Stale pending",
    "Provider variance",
    "Lucky Wheel reward liability",
    "Admin adjustment variance",
    "Wallet balance snapshot mismatch",
  ]);

  assertNormalizedIncludes("Admin adjustment schema plan", text, [
    "Admin Adjustment Schema Plan",
    "Request table draft",
    "Approval/rejection fields",
    "Maker/checker separation",
    "No self-approval constraint plan",
    "Reason required",
    "auditLogId required",
    "Emergency override fields",
  ]);

  assertNormalizedIncludes("Index and constraint plan", text, [
    "Index and Constraint Plan",
    "siteId + memberId + createdAt",
    "siteId + sourceType + sourceId",
    "siteId + idempotencyKey",
    "siteId + transactionType + createdAt",
    "reconciliationStatus + createdAt",
    "auditLogId",
    "reversalOfLedgerEntryId",
    "transactionId",
  ]);

  assertNormalizedIncludes("Migration dry-run plan", text, [
    "Migration Dry-Run Plan",
    "Create draft migration in isolated branch only in Phase S/T, not Phase R",
    "Run against disposable local DB only",
    "Run Prisma generate only in dry-run environment",
    "Verify no production DB",
    "Verify no seed touching live data",
    "Verify rollback script",
    "Verify response leak scan",
    "Verify smoke suite",
    "Verify backup/restore drill requirement before production",
  ]);

  assertNormalizedIncludes("Rollback plan", text, [
    "Rollback Plan",
    "Rollback migration plan draft",
    "Restore from backup requirement",
    "Stop writes before rollback",
    "Verify ledger/wallet snapshot consistency",
    "Post-rollback reconciliation",
    "Incident report",
  ]);

  assertNormalizedIncludes("Data backfill plan", text, [
    "Data Backfill Plan Draft",
    "No live backfill in Phase R",
    "Historical wallet balance snapshot strategy",
    "Deposit/withdraw historical mapping draft",
    "Admin adjustment mapping draft",
    "Lucky Wheel reward liability mapping draft",
    "Provider callback mapping draft",
    "Backfill verification report",
    "Unmatched records report",
  ]);

  assertNormalizedIncludes("Phase S Go/No-Go criteria", text, [
    "Phase S Go/No-Go Criteria",
    "Phase S must not start",
    "Schema dry-run plan",
    "Proposed schema draft",
    "Migration dry-run plan",
    "Rollback plan",
    "Reconciliation schema plan",
    "Idempotency schema plan",
    "Admin adjustment dual-control schema plan",
    "No production DB boundary",
    "No migration created",
    "No schema.prisma changed",
    "Static smoke guard PASS",
    "Secret scan PASS",
    "Rendered placeholder scan PASS",
  ]);

  assertIncludes("Next phases", text, ["Phase S", "Phase T", "Phase U", "Phase V"]);
}

function main() {
  const text = readPlan();
  console.log("Financial ledger schema dry-run doc exists: PASS");

  assertDocContract(text);
  console.log("Financial ledger schema safety boundaries documented: PASS");
  console.log("Proposed schema draft documented: PASS");
  console.log("Ledger account/entry/transaction drafts documented: PASS");
  console.log("Idempotency/reconciliation/admin adjustment schema plans documented: PASS");
  console.log("Index/migration/rollback/backfill plans documented: PASS");
  console.log("Financial Phase S Go/No-Go criteria documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  assertNoUnsafeEnablement(text);
  console.log("Financial ledger schema dry-run static secret scan: PASS");

  console.log("Financial ledger schema dry-run smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger schema dry-run smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
