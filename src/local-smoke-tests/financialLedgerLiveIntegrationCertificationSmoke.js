const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md");

function readDoc() {
  assert(fs.existsSync(DOC_PATH), "docs/FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md must exist.");
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
  const bearerJwt = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+${["e", "y", "J"].join("")}[A-Za-z0-9._-]+`, "i");
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), "Certification checklist contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Certification checklist contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Certification checklist contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Certification checklist contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Certification checklist contains bearer credential-shaped text.");
  assert(!openAiKey.test(scanned), "Certification checklist contains API-key-shaped text.");
  assert(!new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=\\s*actual`, "i").test(scanned), "Certification checklist contains DB actual assignment.");
  assert(!new RegExp(`${["Author", "ization"].join("")}:\\s*actual`, "i").test(scanned), "Certification checklist contains auth actual marker.");
  assert(!new RegExp(`\\b${["J", "WT"].join("")}\\s+actual\\b`, "i").test(scanned), "Certification checklist contains credential actual marker.");
  assert(!jwtLike.test(scanned), "Certification checklist contains credential-shaped dotted text.");
  assert(!longTokenLike.test(scanned), "Certification checklist contains long credential-like text.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object ", "Object]"].join("")]) {
    assert(!scanned.includes(marker), `Certification checklist contains rendered marker: ${marker}`);
  }
}

function assertNoUnsafeEnablement(text) {
  const lower = normalize(text);
  const launchPhrase = ["production", "ready"].join(" ");
  const withoutAllowedStatus = lower.replace(new RegExp(`not ${launchPhrase}`, "g"), "");
  const withoutAllowedRealMoney = text.replace(/no real money (enabled|on|active|allowed|approved)/gi, "");
  assert(!withoutAllowedStatus.includes(launchPhrase), "Certification checklist implies production ready.");
  assert(!/live payout (enabled|on|active|allowed|approved)/i.test(text), "Certification checklist implies live payout enabled.");
  assert(!/production db (enabled|on|active|allowed|approved)/i.test(text), "Certification checklist implies production DB enabled.");
  assert(!/real money (enabled|on|active|allowed|approved)/i.test(withoutAllowedRealMoney), "Certification checklist implies real money enabled.");
}

function assertDocContract(text) {
  assertIncludes("Phase U doc", text, [
    "Phase U",
    "NOT production ready",
    "certification checklist only",
    "docs/static smoke only",
    "no production DB",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no Prisma migration",
    "no schema.prisma change",
    "no seed",
    "no runtime money flow change",
    "no route/controller/service integration",
    "no admin write action",
  ]);

  assertNormalizedIncludes("Certification safety boundaries", text, [
    "Safety boundaries",
    "mock/staging/sandbox only",
    "no DB writes",
    "no external network calls",
    "no seed/fixture change",
    "no frontend money authority",
    "no admin direct balance mutation without ledger/audit/dual control",
    "no secret/token/password/database env/JWT/auth header values in docs/logs",
  ]);

  assertNormalizedIncludes("Certification purpose", text, [
    "Certification purpose",
    "before live integration",
    "before staging dry-run migration",
    "before DB-backed ledger staging prototype",
    "before provider/payment/bank integration certification",
    "before payout certification",
    "does not authorize real money",
    "does not authorize live payout",
    "does not authorize production DB",
    "does not enable live integration by itself",
  ]);

  assertNormalizedIncludes("Required closed phases", text, [
    "Required closed phases before live integration",
    "Phase P: Financial Ledger Hardening Plan",
    "Phase Q: Financial Ledger Runtime Design / Data Contract",
    "Phase R: Ledger schema dry-run design + migration plan only",
    "Phase S: Ledger mock runtime harness, no real money",
    "Phase T: Reconciliation mock reports + admin read-only UI",
    "Safe CI",
    "no deploy required",
    "no seed required",
    "Scope summary",
  ]);

  assertNormalizedIncludes("Production DB isolation checklist", text, [
    "Production DB isolation checklist",
    "production DB credential not present in local/staging docs/logs",
    "production DB access blocked for dry-run",
    "DB endpoint allowlist reviewed",
    "staging DB and production DB are separate",
    "local disposable DB plan exists",
    "backup/restore drill required before any production-like migration",
    "migration dry-run cannot target production",
    "CI/static scans must reject database env assignments in docs/logs",
    "No-Go if production DB boundary missing/failing",
  ]);

  assertNormalizedIncludes("Real-money and payout boundary checklist", text, [
    "Real-money and payout boundary checklist",
    "no real money enabled",
    "live payout disabled",
    "withdraw paid_mock remains mock only",
    "payout provider disabled",
    "bank transfer live mode disabled",
    "payment live mode disabled",
    "provider live mode disabled",
    "admin payout action not implemented",
    "no frontend payout authority",
    "no member-triggered live payout",
    "No-Go if any live payout path exists",
  ]);

  assertNormalizedIncludes("Provider certification", text, [
    "Provider/payment/bank/SMS/Slip OCR certification checklist",
    "Provider game callback certification",
    "Payment deposit certification",
    "Bank statement certification",
    "SMS provider certification",
    "Slip OCR certification",
    "sandbox/mock mode proof",
    "contract review",
    "credential handling review",
    "callback signature validation plan",
    "idempotency plan",
    "reconciliation plan",
    "error handling plan",
    "response leak scan",
    "rollback/disable switch",
    "live enablement requires explicit approval",
  ]);

  assertNormalizedIncludes("Ledger runtime certification checklist", text, [
    "Ledger runtime certification checklist",
    "ledger data contract locked",
    "schema dry-run plan reviewed",
    "idempotency behavior reviewed",
    "double-entry-compatible balancing reviewed",
    "immutable append-only entries reviewed",
    "reversal policy reviewed",
    "ledger write atomicity plan reviewed",
    "wallet balance snapshot strategy reviewed",
    "failed/reversed entries explicit policy reviewed",
    "no frontend money calculation authority",
  ]);

  assertNormalizedIncludes("Dual control certification checklist", text, [
    "Dual control certification checklist",
    "maker/checker separation",
    "no self-approval",
    "auditor role",
    "owner role",
    "emergency override reason required",
    "high-risk action requires second admin",
    "all approval/rejection audit events required",
    "admin RBAC negative tests required",
    "No-Go if self-approval possible",
  ]);

  assertNormalizedIncludes("Audit and redaction certification checklist", text, [
    "Audit and redaction certification checklist",
    "auditLogId required for money-affecting action",
    "actorType/actorId required",
    "siteCode required",
    "action/target required",
    "before/after sanitized snapshots",
    "reason required",
    "masked IP",
    "userAgent hash",
    "no raw secret-shaped values",
    "no raw internal error",
    "response leak scan required",
    "No-Go if audit or redaction incomplete",
  ]);

  assertNormalizedIncludes("Reconciliation certification checklist", text, [
    "Reconciliation certification checklist",
    "daily deposit ledger vs statement",
    "withdraw reserve vs approved vs paid_mock",
    "wallet snapshot vs ledger sum",
    "provider callback variance",
    "admin adjustment variance",
    "Lucky Wheel reward liability",
    "stale pending deposit/withdraw",
    "unmatched entries",
    "audit coverage report",
    "reconciliation owner assigned",
    "No-Go if variance report missing",
  ]);

  assertNormalizedIncludes("Backup/restore and rollback certification checklist", text, [
    "Backup/restore and rollback certification checklist",
    "backup before migration",
    "restore drill completed",
    "rollback script reviewed",
    "stop-write procedure documented",
    "post-rollback reconciliation",
    "incident report template",
    "monitoring/alerting enabled before any live operation",
    "No-Go if backup/restore drill missing",
  ]);

  assertNormalizedIncludes("Monitoring and alerting certification checklist", text, [
    "Monitoring and alerting certification checklist",
    "ledger write failure alert",
    "reconciliation mismatch alert",
    "stale pending alert",
    "idempotency conflict alert",
    "payout-disabled violation alert",
    "provider callback variance alert",
    "admin adjustment high-risk alert",
    "audit missing reason alert",
    "dashboard owner",
    "escalation path",
  ]);

  assertNormalizedIncludes("API and response contract certification checklist", text, [
    "API and response contract certification checklist",
    "auth required",
    "permission required",
    "idempotency required for money-affecting writes",
    "error shape documented",
    "no secret response",
    "no raw internal error",
    "correlationId/requestId included",
    "response leak scan",
    "unauthorized/forbidden negative tests",
    "No-Go if any money write lacks auth/permission/idempotency",
  ]);

  assertNormalizedIncludes("Staging dry-run migration readiness checklist", text, [
    "Staging dry-run migration readiness checklist",
    "Phase V requires explicit approval",
    "disposable local DB dry-run first",
    "staging DB dry-run after local success",
    "migration rollback plan",
    "backup/restore proof",
    "no production DB proof",
    "smoke suite required",
    "response leak scan required",
    "no live integration",
    "no real money",
  ]);

  assertNormalizedIncludes("DB-backed ledger staging prototype readiness checklist", text, [
    "DB-backed ledger staging prototype readiness checklist",
    "Phase W requires Phase V approval",
    "staging only",
    "read/write isolated to staging prototype",
    "no production",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no live payout",
    "fixture data only",
    "admin RBAC guard required",
    "audit guard required",
    "dual control guard required",
  ]);

  assertNormalizedIncludes("Final Go/No-Go matrix", text, [
    "Final Go/No-Go matrix",
    "required evidence",
    "pass condition",
    "no-go condition",
    "owner",
    "phase dependency",
    "safety boundary",
    "production DB isolation",
    "real-money boundary",
    "live payout boundary",
    "provider certification",
    "payment certification",
    "bank certification",
    "SMS certification",
    "Slip OCR certification",
    "ledger contract",
    "schema dry-run",
    "idempotency",
    "dual control",
    "audit/redaction",
    "reconciliation",
    "backup/restore",
    "monitoring",
    "RBAC",
    "response leak scan",
    "CI/static smoke",
  ]);

  assertNormalizedIncludes("Phase V criteria", text, [
    "Phase V Go/No-Go criteria",
    "Phase V must not start",
    "checklist doc exists",
    "static smoke PASS",
    "all phase dependencies listed",
    "no production DB boundary documented",
    "no real money boundary documented",
    "no live payout boundary documented",
    "no live provider/payment/bank/SMS/Slip OCR boundary documented",
    "no migration/schema/seed/runtime change",
    "certification evidence matrix present",
    "response leak scan requirement present",
    "backup/restore requirement present",
    "explicit approval requirement present",
  ]);

  assertIncludes("Next phases", text, ["Phase V", "Phase W", "Phase X", "Phase Y"]);
}

function main() {
  const text = readDoc();
  console.log("Financial ledger live integration certification doc exists: PASS");
  assertDocContract(text);
  console.log("Certification safety boundaries documented: PASS");
  console.log("Production DB isolation checklist documented: PASS");
  console.log("Real-money and payout boundary checklist documented: PASS");
  console.log("Provider/payment/bank/SMS/Slip OCR certification checklist documented: PASS");
  console.log("Ledger runtime certification checklist documented: PASS");
  console.log("Dual control certification checklist documented: PASS");
  console.log("Audit and redaction certification checklist documented: PASS");
  console.log("Reconciliation certification checklist documented: PASS");
  console.log("Backup/restore and rollback certification checklist documented: PASS");
  console.log("Monitoring and alerting certification checklist documented: PASS");
  console.log("API and response contract certification checklist documented: PASS");
  console.log("Staging dry-run migration readiness checklist documented: PASS");
  console.log("DB-backed ledger staging prototype readiness checklist documented: PASS");
  console.log("Final Go/No-Go matrix documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  assertNoUnsafeEnablement(text);
  console.log("Financial ledger live integration certification static secret scan: PASS");

  console.log("Financial ledger live integration certification smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger live integration certification smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
