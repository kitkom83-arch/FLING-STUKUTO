const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "MONITORING_BACKUP_RUNBOOK.md");

function readRunbook() {
  assert(fs.existsSync(DOC_PATH), "docs/MONITORING_BACKUP_RUNBOOK.md must exist.");
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

  assert(!lower.includes(postgresProtocol), "Monitoring backup runbook contains PostgreSQL URL protocol.");
  assert(!lower.includes(postgresqlProtocol), "Monitoring backup runbook contains PostgreSQL URL protocol.");
  assert(!lower.includes(mongoProtocol), "Monitoring backup runbook contains MongoDB URL protocol.");
  assert(!lower.includes(mongoSrvProtocol), "Monitoring backup runbook contains MongoDB URL protocol.");
  assert(!bearerJwt.test(scanned), "Monitoring backup runbook contains bearer JWT-shaped text.");
  assert(!openAiKey.test(scanned), "Monitoring backup runbook contains API-key-shaped text.");
  assert(!/DATABASE_URL\s*=\s*actual/i.test(scanned), "Monitoring backup runbook contains database actual assignment.");
  assert(!/Authorization:\s*actual/i.test(scanned), "Monitoring backup runbook contains authorization actual value.");
  assert(!/\bJWT\s+actual\b/i.test(scanned), "Monitoring backup runbook contains JWT actual value.");
  assert(!jwtLike.test(scanned), "Monitoring backup runbook contains JWT-shaped text.");
  assert(!longTokenLike.test(scanned), "Monitoring backup runbook contains a long token-like string.");
}

function assertNoRenderedPlaceholders(text) {
  const scanned = String(text || "");
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `Monitoring backup runbook contains rendered placeholder: ${marker}`);
  }
}

function assertDocContract(text) {
  assertIncludes("Monitoring backup runbook", text, [
    "NOT production ready",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
  ]);

  assertNormalizedIncludes("Monitoring targets", text, [
    "Monitoring Targets",
    "uptime",
    "API health `/api/health`",
    "API 5xx rate",
    "database connection status",
    "response latency",
    "admin auth failure spike",
    "admin write action spike",
    "role permission update spike",
    "Lucky Wheel spin failure spike",
    "wallet/ledger anomaly",
    "deposit/withdraw anomaly",
    "provider callback anomaly",
    "queue/job failures",
    "response leak alert",
    "Render deploy failures",
    "port binding / no open ports issue",
  ]);

  assertNormalizedIncludes("Alert severity levels", text, [
    "Alert Severity Levels",
    "SEV1",
    "SEV2",
    "SEV3",
    "SEV4",
    "trigger",
    "owner",
    "response time target",
    "first action",
    "escalation",
  ]);

  assertNormalizedIncludes("Alert routing design", text, [
    "Alert Routing Design",
    "operator channel",
    "engineering channel",
    "security incident channel",
    "finance/reconciliation channel",
    "executive update if SEV1",
  ]);

  assertNormalizedIncludes("Log retention plan", text, [
    "Log Retention Plan",
    "admin audit logs",
    "auth/security logs",
    "financial ledger logs",
    "role permission logs",
    "Lucky Wheel logs",
    "provider/payment/bank callback logs",
    "deployment logs",
    "90 days",
    "180 days",
    "365 days",
    "compliance/accounting review",
  ]);

  assertNormalizedIncludes("Backup plan", text, [
    "Backup Plan",
    "database backup schedule",
    "backup encryption",
    "backup storage",
    "backup access control",
    "backup retention",
    "backup restore testing frequency",
    "backup owner",
    "backup failure alert",
  ]);

  assertNormalizedIncludes("Restore drill plan", text, [
    "Restore Drill Plan",
    "restore to non-production target",
    "verify schema",
    "verify sample records",
    "verify admin login is disabled or controlled",
    "verify no live provider credentials",
    "smoke:staging-release-readiness",
    "read-only release gate equivalent",
    "document restore result",
  ]);

  assertNormalizedIncludes("Incident response checklist", text, [
    "Incident Response Checklist",
    "detect",
    "classify severity",
    "freeze risky writes",
    "preserve logs",
    "notify owner",
    "rollback if deploy-related",
    "restore if data-related",
    "run release gate",
    "write incident report",
  ]);

  assertNormalizedIncludes("Incident templates", text, [
    "Incident Templates",
    "Incident Summary",
    "Timeline",
    "Impact",
    "Root Cause",
    "Mitigation",
    "Rollback/Restore Action",
    "Follow-Up Tasks",
  ]);

  assertNormalizedIncludes("Go/No-Go monitoring criteria", text, [
    "Go/No-Go Monitoring Criteria",
    "No uptime monitoring",
    "No DB alert",
    "No 5xx alert",
    "No backup restore drill",
    "No secret leak alert plan",
    "No incident owner",
    "No rollback path",
    "No log retention plan",
  ]);

  assertIncludes("Next phases", text, ["Phase P", "Phase Q", "Phase R"]);
}

function main() {
  const text = readRunbook();
  console.log("Monitoring backup runbook exists: PASS");

  assertDocContract(text);
  console.log("Monitoring targets documented: PASS");
  console.log("Alert severity/routing documented: PASS");
  console.log("Backup/restore drill documented: PASS");
  console.log("Incident checklist/template documented: PASS");
  console.log("Monitoring Go/No-Go criteria documented: PASS");

  assertNoSecretShapedValues(text);
  assertNoRenderedPlaceholders(text);
  console.log("Monitoring backup static secret scan: PASS");

  console.log("Monitoring backup runbook smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Monitoring backup runbook smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
