const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

const DOCS = [
  "docs/MASTER_BACKOFFICE_SPEC.md",
  "docs/MASTER_FRONTEND_MEMBER_SPEC.md",
  "docs/API_MAPPING.md",
  "docs/PERMISSION_MATRIX.md",
  "docs/AUDIT_LOG_MATRIX.md",
  "docs/PHASE_ROADMAP.md",
];

const STATIC_SCAN_FILES = [
  ...DOCS,
  "docs/SMOKE_COVERAGE.md",
  "src/local-smoke-tests/masterSpecMappingSmoke.js",
];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
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

function assertNoSecretShapedValues(label, text) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const mongoProtocol = ["mongo", "db://"].join("");
  const mongoSrvProtocol = ["mongo", "db+srv://"].join("");
  const databaseUrlAssignment = new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=`, "i");
  const authorizationLiteral = new RegExp(`${["Author", "ization"].join("")}:`, "i");
  const authSchemeLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const apiKeyShape = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(mongoProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!lower.includes(mongoSrvProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!databaseUrlAssignment.test(scanned), `${label} contains database URL assignment text.`);
  assert(!authorizationLiteral.test(scanned), `${label} contains auth header literal.`);
  assert(!authSchemeLiteral.test(scanned), `${label} contains auth scheme marker.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!jwtLike.test(scanned), `${label} contains dotted credential-shaped text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long token-like text.`);
}

function assertForbiddenLiveEnablement(label, text) {
  const lower = normalize(text);
  const forbidden = [
    ["production", "live", "enabled"].join(" "),
    ["real", "money", "enabled"].join(" "),
  ];

  for (const marker of forbidden) {
    assert(!lower.includes(marker), `${label} contains forbidden live enablement marker: ${marker}`);
  }
}

function assertDocsExist() {
  for (const doc of DOCS) readRequired(doc);
  console.log("Phase AJ master docs exist: PASS");
}

function assertBackofficeSpec() {
  const text = readRequired("docs/MASTER_BACKOFFICE_SPEC.md");
  assertIncludes("MASTER_BACKOFFICE_SPEC", text, [
    "รายงาน",
    "จัดการสมาชิก",
    "รายการเดินบัญชี",
    "ธนาคาร",
    "บริการเสริม",
    "ตั้งค่า",
  ]);
  assertNormalizedIncludes("MASTER_BACKOFFICE_SPEC", text, [
    "Purpose",
    "Main screens/tabs",
    "Key fields",
    "Primary tables",
    "Important buttons",
    "API that should be used",
    "Permission that should be used",
    "Audit log that should be recorded",
    "read-only",
    "write guarded",
    "future live integration",
  ]);
  console.log("Master backoffice spec markers: PASS");
}

function assertFrontendSpec() {
  const text = readRequired("docs/MASTER_FRONTEND_MEMBER_SPEC.md");
  assertIncludes("MASTER_FRONTEND_MEMBER_SPEC", text, [
    "Login",
    "Register",
    "Deposit",
    "Withdraw",
    "Promotions",
    "Lucky Wheel",
    "Provider modal",
  ]);
  assertNormalizedIncludes("MASTER_FRONTEND_MEMBER_SPEC", text, [
    "User flow",
    "UI components",
    "API mapping",
    "Validation",
    "Empty/error states",
    "No-real-money boundary",
    "Mock/staging/live readiness status",
  ]);
  console.log("Master frontend member spec markers: PASS");
}

function assertApiMapping() {
  const text = readRequired("docs/API_MAPPING.md");
  assertIncludes("API_MAPPING", text, [
    "Endpoint",
    "Permission",
    "Audit action",
    "Current status",
    "Admin auth",
    "Admin members",
    "Admin member detail",
    "Admin member history",
    "Admin audit logs",
    "Admin security events",
    "Admin roles/permissions",
    "Work schedule",
    "Bank module",
    "Reports",
    "Promotions",
    "Deposits",
    "Withdrawals",
    "Wallet ledger",
    "Lucky Wheel",
    "Frontend member auth",
    "Frontend wallet/profile/history",
    "Future game provider API",
    "implemented",
    "read-only implemented",
    "mock implemented",
    "static spec only",
    "future guarded write",
    "future live integration",
  ]);
  console.log("API mapping markers: PASS");
}

function assertPermissionMatrix() {
  const text = readRequired("docs/PERMISSION_MATRIX.md");
  assertIncludes("PERMISSION_MATRIX", text, [
    "owner",
    "super_admin",
    "finance",
    "support",
    "graphic",
    "viewer",
    "read-only permission",
    "write permission",
    "Reason required",
    "Audit required",
    "No self-approval",
    "No live action until certification",
  ]);
  console.log("Permission matrix markers: PASS");
}

function assertAuditMatrix() {
  const text = readRequired("docs/AUDIT_LOG_MATRIX.md");
  assertNormalizedIncludes("AUDIT_LOG_MATRIX", text, [
    "reason required",
    "before snapshot",
    "after snapshot",
  ]);
  assertIncludes("AUDIT_LOG_MATRIX", text, [
    "admin.login.success",
    "admin.login.failed",
    "admin.login.blocked_outside_schedule",
    "admin.role.assign",
    "admin.role.permissions.update",
    "admin.schedule.update",
    "member.bank.approve",
    "member.bank.reject",
    "member.blacklist.add",
    "member.blacklist.remove",
    "wallet.adjust.credit",
    "wallet.adjust.debit",
    "deposit.create",
    "deposit.approve",
    "withdrawal.approve",
    "withdrawal.mark_paid",
    "promotion.create/update",
    "wheel.campaign.update",
    "wheel.reward.create/update",
    "settings.update",
    "live_provider.config.update",
    "implemented",
    "planned guarded write",
    "future certification required",
  ]);
  console.log("Audit log matrix markers: PASS");
}

function assertRoadmap() {
  const text = readRequired("docs/PHASE_ROADMAP.md");
  assertIncludes("PHASE_ROADMAP", text, [
    "Phase AJ",
    "Phase AK",
    "Phase AL",
    "Phase AM",
    "Phase AN",
    "Phase AO",
    "Phase AP",
    "Phase AQ",
    "Phase AR",
    "Goal",
    "Scope",
    "Allowed files",
    "Forbidden actions",
    "Required tests",
    "Exit criteria",
    "Safety boundary",
  ]);
  console.log("Phase roadmap markers: PASS");
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretShapedValues(file, text);
    assertForbiddenLiveEnablement(file, text);
  }
  console.log("Phase AJ static secret scan: PASS");
  console.log("Phase AJ live enablement wording scan: PASS");
}

function main() {
  assertDocsExist();
  assertBackofficeSpec();
  assertFrontendSpec();
  assertApiMapping();
  assertPermissionMatrix();
  assertAuditMatrix();
  assertRoadmap();
  assertStaticScans();
  console.log("Master spec mapping smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Master spec mapping smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
