const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md");

function readContract() {
  assert(fs.existsSync(DOC_PATH), "docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md must exist.");
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

  assert(!lower.includes(postgresProtocol), "Financial ledger runtime contract contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Financial ledger runtime contract contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Financial ledger runtime contract contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Financial ledger runtime contract contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Financial ledger runtime contract contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Financial ledger runtime contract contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Financial ledger runtime contract contains database actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Financial ledger runtime contract contains authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Financial ledger runtime contract contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Financial ledger runtime contract contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Financial ledger runtime contract contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Financial ledger runtime contract contains rendered placeholder: ${marker}`);
  }
}

function assertNoUnsafeEnablement(text) {
  const lower = normalize(text);
  const withoutAllowedNotReady = lower.replace(/not production ready/g, "");

  assert(!withoutAllowedNotReady.includes("production ready"), "Financial ledger runtime contract implies production ready.");
  assert(!/live payout (enabled|on|active|allowed|approved)/i.test(text), "Financial ledger runtime contract implies live payout enabled.");
  assert(!/production db (enabled|on|active|allowed|approved)/i.test(text), "Financial ledger runtime contract implies production DB enabled.");
}

function assertDocContract(text) {
  assertIncludes("Financial ledger runtime contract", text, [
    "Phase Q",
    "NOT production ready",
    "no production DB",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
  ]);

  assertNormalizedIncludes("Safety boundaries", text, [
    "Safety Boundaries",
    "Mock/staging/sandbox only",
    "No frontend money calculation authority",
    "No admin direct balance mutation without ledger, audit, and dual control",
    "No secret/token/password/DATABASE_URL/JWT/Authorization in docs/logs",
    "No runtime deposit, withdraw, provider, payment, bank, SMS, Slip OCR, or payout behavior change",
  ]);

  assertNormalizedIncludes("Runtime ledger principles", text, [
    "Runtime Ledger Principles",
    "Immutable ledger",
    "Append-only entries",
    "Double-entry compatible design",
    "Idempotency required",
    "sourceType",
    "sourceId",
    "balanceBefore",
    "balanceAfter",
    "reason",
    "auditLogId",
    "atomic with wallet balance update",
    "explicit entries, not delete/edit old entries",
  ]);

  assertNormalizedIncludes("Ledger account model", text, [
    "Ledger Account Model Contract",
    "contract draft only",
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

  assertNormalizedIncludes("Ledger entry data contract", text, [
    "Ledger Entry Data Contract",
    "ledgerEntryId",
    "siteId",
    "memberId",
    "accountId",
    "accountType",
    "sourceType",
    "sourceId",
    "transactionType",
    "direction",
    "debit",
    "credit",
    "amount",
    "currency",
    "balanceBefore",
    "balanceAfter",
    "status",
    "idempotencyKey",
    "correlationId",
    "requestId",
    "createdByType",
    "createdById",
    "createdAt",
    "reason",
    "auditLogId",
    "metadataSnapshot",
    "reversalOfLedgerEntryId",
    "reconciliationStatus",
  ]);

  assertNormalizedIncludes("Transaction type contract", text, [
    "Transaction Type Contract",
    "deposit.requested",
    "deposit.verified",
    "deposit.credited",
    "deposit.rejected",
    "withdraw.requested",
    "withdraw.reserved",
    "withdraw.approved",
    "withdraw.paid_mock",
    "withdraw.rejected",
    "withdraw.reversed",
    "admin.credit.requested",
    "admin.credit.approved",
    "admin.credit.applied",
    "admin.debit.requested",
    "admin.debit.approved",
    "admin.debit.applied",
    "promotion.bonus.awarded",
    "promotion.bonus.reversed",
    "wheel.reward.awarded",
    "wheel.reward.claimed",
    "provider.transfer.out",
    "provider.transfer.in",
    "provider.callback.adjustment",
    "reconciliation.adjustment",
    "Live payout remains disabled",
  ]);

  assertNormalizedIncludes("API contract draft", text, [
    "API Contract Draft",
    "/api/admin/ledger/entries",
    "/api/admin/ledger/entries/:id",
    "/api/admin/ledger/reconciliation",
    "/api/admin/ledger/member/:memberId",
    "/api/admin/ledger/admin-adjustment/request",
    "/api/admin/ledger/admin-adjustment/:id/approve",
    "/api/admin/ledger/admin-adjustment/:id/reject",
    "/api/member/ledger/history",
    "/api/member/wallet/balance",
    "/api/internal/mock-ledger/deposit-credit",
    "/api/internal/mock-ledger/withdraw-reserve",
    "/api/internal/mock-ledger/reversal",
    "Auth required",
    "Permission required",
    "Idempotency",
    "Audit",
    "No secret response",
    "Response shape",
    "Error shape",
  ]);

  assertNormalizedIncludes("Idempotency contract", text, [
    "Idempotency Contract",
    "idempotencyKey",
    "Duplicate key with same payload returns same result",
    "Duplicate key with different payload returns conflict",
    "siteId + action + memberId/sourceId",
    "TTL policy draft",
    "No replay without audit",
  ]);

  assertNormalizedIncludes("Dual control contract", text, [
    "Dual Control Contract",
    "Maker",
    "Checker",
    "Auditor",
    "Owner",
    "No self-approval",
    "Emergency override reason required",
    "All approval/rejection writes audit event",
    "High-risk action requires second admin",
  ]);

  assertNormalizedIncludes("Reconciliation data contract", text, [
    "Reconciliation Data Contract",
    "Daily deposit ledger vs statement",
    "Withdraw reserve vs approved vs paid mock",
    "Wallet balance snapshot vs ledger sum",
    "Admin adjustment report",
    "Provider callback variance report",
    "Lucky Wheel reward liability report",
    "Stale pending deposit/withdraw report",
    "Unmatched entries report",
  ]);

  assertNormalizedIncludes("Audit event contract", text, [
    "Audit Event Contract",
    "auditLogId",
    "siteCode",
    "actorType",
    "actorId",
    "action",
    "targetType",
    "targetId",
    "beforeSnapshotSanitized",
    "afterSnapshotSanitized",
    "reason",
    "ipAddressMasked",
    "userAgentHash",
    "createdAt",
    "correlationId",
    "Immutable",
    "Sanitized",
    "No secret-shaped values",
    "Redact token/password/DATABASE_URL/JWT/Authorization",
  ]);

  assertNormalizedIncludes("Error contract", text, [
    "Error Contract",
    "validation_error",
    "unauthorized",
    "forbidden",
    "idempotency_conflict",
    "insufficient_balance",
    "ledger_write_failed",
    "reconciliation_mismatch",
    "dual_control_required",
    "live_payout_disabled",
    "provider_live_disabled",
    "production_db_blocked",
  ]);

  assertNormalizedIncludes("Go/No-Go criteria", text, [
    "Go/No-Go Criteria for Phase R",
    "Phase R must not start",
    "Ledger data contract",
    "API contract",
    "Idempotency contract",
    "Dual control contract",
    "Audit event contract",
    "Reconciliation contract",
    "Static smoke guard",
    "Secret scan",
    "Rendered placeholder scan",
    "missing values",
    "invalid numeric output",
    "object string output",
    "No-live-payout boundary",
    "Production DB boundary",
  ]);

  assertIncludes("Next phases", text, ["Phase R", "Phase S", "Phase T", "Phase U"]);
}

function main() {
  const text = readContract();
  console.log("Financial ledger runtime contract doc exists: PASS");

  assertDocContract(text);
  console.log("Financial ledger runtime safety boundaries documented: PASS");
  console.log("Ledger account model documented: PASS");
  console.log("Ledger entry data contract documented: PASS");
  console.log("Transaction type contract documented: PASS");
  console.log("API/idempotency/dual control contract documented: PASS");
  console.log("Reconciliation/audit/error contract documented: PASS");
  console.log("Financial Phase R Go/No-Go criteria documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  assertNoUnsafeEnablement(text);
  console.log("Financial ledger runtime contract static secret scan: PASS");

  console.log("Financial ledger runtime contract smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger runtime contract smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
