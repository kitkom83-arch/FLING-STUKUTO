const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HANDOFF_DOC = path.join(ROOT, "docs", "ADMIN_OPERATOR_HANDOFF_FINAL.md");
const BROWSER_QA_DOC = path.join(ROOT, "docs", "STAGING_ADMIN_BROWSER_QA.md");
const ADMIN_HTML = path.join(ROOT, "src", "admin-ui", "index.html");
const ADMIN_JS = path.join(ROOT, "src", "admin-ui", "app.js");
const WHEEL_HTML = path.join(ROOT, "src", "admin-wheel-ui", "index.html");
const WHEEL_JS = path.join(ROOT, "src", "admin-wheel-ui", "app.js");
const AUDIT_HTML = path.join(ROOT, "src", "admin-audit-ui", "index.html");
const { main: runBrowserRoutesSmoke } = require("./adminBrowserRoutesSmoke");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function visibleTextFromHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function stripAllowedChecklistCopy(text) {
  return String(text || "")
    .replace(/No `undefined`, `NaN`, or `\[object Object\]` appears[^\n]*/g, "")
    .replace(/No `undefined`, `NaN`, or `\[object Object\]` appears in visible copy\./g, "")
    .replace(/No password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` value is (shown|visible)\./g, "")
    .replace(/Confirm the page does not show password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` values\./g, "");
}

function assertNoPlaceholderCopy(label, text) {
  const scanned = stripAllowedChecklistCopy(text);
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `${label} contains unexpected placeholder copy: ${marker}`);
  }
}

function assertNoStaticSecretValue(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const envAssignment = /\b(?:DATABASE_URL|JWT_SECRET|LOCAL_ADMIN_PASSWORD)\s*=/;
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!envAssignment.test(text), `${label} contains a sensitive env assignment marker.`);
}

function assertNoRenderedSensitiveValue(label, html) {
  const rendered = stripAllowedChecklistCopy(visibleTextFromHtml(html));
  const unsafe = /\b(?:DATABASE_URL|Authorization|JWT)\b\s*[:=]|postgres(?:ql)?:\/\/|Bearer\s+[A-Za-z0-9._-]+/i;
  assert(!unsafe.test(rendered), `${label} rendered a sensitive value marker.`);
}

function assertNoAdminForceControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  assert(!/\b(force reward|force spin|set prizeIndex)\b/i.test(rendered), "Admin Wheel UI must not render force reward/spin controls.");
  assert(!/actionButton\(\s*["'](?:force reward|force spin|set prizeIndex)["']|<button[^>]*>\s*(?:force reward|force spin|set prizeIndex)\s*<\/button>/i.test(js), "Admin Wheel UI must not define force reward/spin controls.");
}

async function main() {
  assert(fs.existsSync(HANDOFF_DOC), "docs/ADMIN_OPERATOR_HANDOFF_FINAL.md must exist.");

  const handoff = read(HANDOFF_DOC);
  const browserQa = read(BROWSER_QA_DOC);
  const adminHtml = read(ADMIN_HTML);
  const adminJs = read(ADMIN_JS);
  const wheelHtml = read(WHEEL_HTML);
  const wheelJs = read(WHEEL_JS);
  const auditHtml = read(AUDIT_HTML);

  assertIncludes("Operator handoff doc URLs", handoff, [
    "/admin",
    "/admin/roles",
    "/admin-wheel",
    "/admin/audit-security",
    "/admin/work-schedules",
  ]);
  assertIncludes("Operator handoff doc scope", handoff, [
    "staging/mock/sandbox",
    "No real money",
    "No production database",
    "Build Command must stay `npm install && npx prisma generate`",
    "Render Start Command must be `npm start`",
    "admin.role.permissions.update",
    "wheel.memberReward.status.update",
    "wheel.reward.update",
    "wheel.campaign.update",
  ]);
  assertIncludes("Browser QA doc Phase I routes", browserQa, [
    "/admin",
    "/admin/roles",
    "/admin-wheel",
    "/admin/audit-security",
    "/admin/work-schedules",
    "F12 Console",
    "Reason is required",
  ]);

  for (const [label, text] of [
    ["operator handoff doc", handoff],
    ["browser QA doc", browserQa],
    ["admin HTML", adminHtml],
    ["admin wheel HTML", wheelHtml],
    ["admin audit HTML", auditHtml],
  ]) {
    assertNoPlaceholderCopy(label, text);
    assertNoStaticSecretValue(label, text);
  }
  for (const [label, text] of [
    ["admin JS", adminJs],
    ["admin wheel JS", wheelJs],
  ]) {
    assertNoStaticSecretValue(label, text);
  }

  assertIncludes("Admin UI route/link/selector contract", adminHtml, [
    'data-page="admin-work-schedule"',
    'href="/admin/roles/"',
    'href="/admin-wheel/"',
    'href="/admin/audit-security/"',
    'id="permission-matrix"',
    'id="role-permission-reason"',
    'id="confirm-modal"',
  ]);
  assertIncludes("Admin role UI reason contract", adminHtml + adminJs, [
    "Required for audit context",
    "Reason is required",
    "validateReasonBeforeConfirm",
    "Confirm role permission assignment",
    "admin.role.permissions.update",
    "owner/super_admin permissions are controlled by guard",
  ]);
  assertIncludes("Audit Security UI contract", auditHtml, [
    'data-page="admin-audit-security"',
    "Audit Security Report",
    "Admin audit logs",
    "Security Events",
  ]);
  assertIncludes("Admin Wheel UI contract", wheelHtml + wheelJs, [
    'data-page="admin-lucky-wheel"',
    "Permission summary",
    "Campaign settings",
    "Rewards management",
    "Reward Claims",
    "Spin history",
    "Reports",
    "Audit history",
    "claim-status-reason",
    "validateReason",
    "confirmAction",
  ]);

  assertNoRenderedSensitiveValue("operator handoff doc", handoff);
  assertNoRenderedSensitiveValue("browser QA doc", browserQa);
  assertNoRenderedSensitiveValue("admin HTML", adminHtml);
  assertNoRenderedSensitiveValue("admin wheel HTML", wheelHtml);
  assertNoRenderedSensitiveValue("admin audit HTML", auditHtml);
  assertNoAdminForceControls(wheelHtml, wheelJs);

  await runBrowserRoutesSmoke();

  console.log("Admin operator handoff doc exists: PASS");
  console.log("Admin operator handoff URLs: PASS");
  console.log("Admin operator handoff no static secret values: PASS");
  console.log("Admin operator handoff no unexpected placeholder copy: PASS");
  console.log("Admin UI route/link/selector contract: PASS");
  console.log("Admin role reason-required contract: PASS");
  console.log("Admin Wheel no force reward/spin/prizeIndex controls: PASS");
  console.log("Admin browser routes smoke dependency: PASS");
  console.log("Admin operator handoff smoke: PASS");
}

try {
  main().catch((error) => {
    console.error("Admin operator handoff smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  });
} catch (error) {
  console.error("Admin operator handoff smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
