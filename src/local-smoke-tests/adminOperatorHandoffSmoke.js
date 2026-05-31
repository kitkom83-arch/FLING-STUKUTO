const assert = require("assert");
const fs = require("fs");
const path = require("path");

const app = require("../app");

const ROOT = path.resolve(__dirname, "..", "..");
const HANDOFF_DOC = path.join(ROOT, "docs", "ADMIN_OPERATOR_HANDOFF_FINAL.md");
const BROWSER_QA_DOC = path.join(ROOT, "docs", "STAGING_ADMIN_BROWSER_QA.md");
const RELEASE_RUNBOOK_DOC = path.join(ROOT, "docs", "STAGING_RELEASE_RUNBOOK.md");
const ADMIN_HTML = path.join(ROOT, "src", "admin-ui", "index.html");
const ADMIN_JS = path.join(ROOT, "src", "admin-ui", "app.js");
const ADMIN_ROUTES = path.join(ROOT, "src", "routes", "admin.routes.js");
const API_DOC = path.join(ROOT, "docs", "API.md");
const API_MAPPING_DOC = path.join(ROOT, "docs", "API_MAPPING.md");
const PERMISSION_DOC = path.join(ROOT, "docs", "PERMISSION_MATRIX.md");
const AUDIT_DOC = path.join(ROOT, "docs", "AUDIT_LOG_MATRIX.md");
const SMOKE_DOC = path.join(ROOT, "docs", "SMOKE_COVERAGE.md");
const PHASE_ROADMAP_DOC = path.join(ROOT, "docs", "PHASE_ROADMAP.md");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const RUN_ALL_SMOKE = path.join(ROOT, "src", "local-smoke-tests", "runAllLocalSmoke.js");
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

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function assertResponseLeakScan(label, payloadText) {
  assertNoStaticSecretValue(label, payloadText);
  assert(!payloadText.includes(["un", "defined"].join("")), `${label} response contains undefined.`);
  assert(!payloadText.includes(["Na", "N"].join("")), `${label} response contains NaN.`);
}

async function get(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Site-Code": "PG77",
    },
    redirect: "manual",
  });
  const text = await response.text();
  assertResponseLeakScan(route, text);
  return { response, text };
}

async function assertUnauthReviewHistoryEndpoint() {
  const server = app.listen();
  const port = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => resolve(server.address().port));
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const result = await get(baseUrl, "/api/admin/audit-logs?action=member.bank.approve&target_type=user_bank_account&limit=1");
    assert.strictEqual(result.response.status, 401, "review audit/history endpoint unauth must return 401.");
    assert((result.response.headers.get("content-type") || "").includes("application/json"), "review audit/history endpoint must return JSON.");
  } finally {
    await close(server);
  }
}

async function main() {
  assert(fs.existsSync(HANDOFF_DOC), "docs/ADMIN_OPERATOR_HANDOFF_FINAL.md must exist.");
  assert(fs.existsSync(RELEASE_RUNBOOK_DOC), "docs/STAGING_RELEASE_RUNBOOK.md must exist.");

  const handoff = read(HANDOFF_DOC);
  const browserQa = read(BROWSER_QA_DOC);
  const releaseRunbook = read(RELEASE_RUNBOOK_DOC);
  const adminHtml = read(ADMIN_HTML);
  const adminJs = read(ADMIN_JS);
  const adminRoutes = read(ADMIN_ROUTES);
  const apiDoc = read(API_DOC);
  const mappingDoc = read(API_MAPPING_DOC);
  const permissionDoc = read(PERMISSION_DOC);
  const auditDoc = read(AUDIT_DOC);
  const smokeDoc = read(SMOKE_DOC);
  const phaseRoadmapDoc = read(PHASE_ROADMAP_DOC);
  const packageJson = read(PACKAGE_JSON);
  const runAllSmoke = read(RUN_ALL_SMOKE);
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
  assertIncludes("Release runbook smoke policy", releaseRunbook, [
    "npm run smoke:staging-release-gate",
    "npm run smoke:staging-uat",
    "npm run smoke:staging-role-permission-uat",
    "Build Command final = `npm install && npx prisma generate`",
    "Start Command final = `npm start`",
    "Seed command = temporary only",
    "Release gate = run after every deploy",
    "Full UAT = run after seed/reset only",
    "Role Permission UAT = run after role permission changes",
  ]);
  assertIncludes("Release runbook incident policy", releaseRunbook, [
    "502 HTML from `/admin/auth/login`",
    "Cannot find module `express`",
    "No open ports detected",
    "Member spin `400`",
    "No-permission admin credential mismatch",
    "Start Command is still a seed command",
  ]);

  for (const [label, text] of [
    ["operator handoff doc", handoff],
    ["browser QA doc", browserQa],
    ["staging release runbook", releaseRunbook],
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
  assertIncludes("Phase AM bank review audit UI markers", adminHtml, [
    "Bank Account Review Audit",
    "Review History",
    "Operator Handoff",
    "member.bank.approve",
    "member.bank.reject",
    "reason required",
    "audit required",
    "duplicate reviewed safe 409",
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
    'id="bank-review-audit-action"',
    'id="bank-review-audit-username"',
    'id="bank-review-audit-target"',
    'id="bank-review-audit-date-from"',
    'id="bank-review-audit-date-to"',
  ]);
  assertIncludes("Phase AM bank review audit JS contract", adminJs, [
    "loadBankReviewAudit",
    "renderBankReviewAudit",
    "/admin/audit-logs?",
    "target_type",
    "user_bank_account",
    "member.bank.approve",
    "member.bank.reject",
    "admin.audit.view",
    "ไม่สามารถโหลดประวัติได้",
  ]);
  assertIncludes("Phase AM audit route guard", adminRoutes, [
    'router.get("/audit-logs", protectedSite, canAuditLogs',
    "admin.audit.view",
    "wheel.audit.view",
  ]);
  assertIncludes("Phase AM docs contract", apiDoc + mappingDoc + permissionDoc + auditDoc + smokeDoc + phaseRoadmapDoc, [
    "Phase AM Admin Bank Account Review Audit & Operator Handoff",
    "review history",
    "admin.audit.view",
    "member.bank.approve",
    "member.bank.reject",
    "reason required",
    "audit required",
    "duplicate reviewed",
    "read-only operator handoff",
  ]);
  assertIncludes("Phase AM smoke registration", packageJson + runAllSmoke, [
    "smoke:admin-operator-handoff",
    "adminOperatorHandoffSmoke.js",
    "admin-operator-handoff",
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
  assertNoRenderedSensitiveValue("staging release runbook", releaseRunbook);
  assertNoRenderedSensitiveValue("admin HTML", adminHtml);
  assertNoRenderedSensitiveValue("admin wheel HTML", wheelHtml);
  assertNoRenderedSensitiveValue("admin audit HTML", auditHtml);
  assertNoAdminForceControls(wheelHtml, wheelJs);

  await assertUnauthReviewHistoryEndpoint();
  await runBrowserRoutesSmoke();

  console.log("Admin operator handoff doc exists: PASS");
  console.log("Staging release runbook doc exists: PASS");
  console.log("Staging release runbook smoke policy: PASS");
  console.log("Admin operator handoff URLs: PASS");
  console.log("Admin operator handoff no static secret values: PASS");
  console.log("Admin operator handoff no unexpected placeholder copy: PASS");
  console.log("Admin UI route/link/selector contract: PASS");
  console.log("Admin role reason-required contract: PASS");
  console.log("Phase AM Bank Account Review Audit static UI markers: PASS");
  console.log("Phase AM Bank Account Review Audit permission/API contract: PASS");
  console.log("Phase AM Bank Account Review Audit unauth history 401: PASS");
  console.log("Phase AM Bank Account Review Audit no-permission 403: PASS (static route guard contract)");
  console.log("Phase AM Bank Account Review Audit authorized read: PASS (static contract; fixture not required)");
  console.log("Phase AM Bank Account Review Audit response leak scan: PASS");
  console.log("Phase AM Bank Account Review Audit operator handoff safety: PASS");
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
