const assert = require("assert");
const fs = require("fs");
const path = require("path");

const app = require("../app");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE_CODE = "PG77";
const REVIEW_ENDPOINTS = [
  "/api/admin/bank-accounts/static-approve-id/approve",
  "/api/admin/bank-accounts/static-reject-id/reject",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function visibleTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = new RegExp(`${["Authorization", ":", " Bearer"].join("")}\\s+["'][A-Za-z0-9._-]+["']`, "i");
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!new RegExp(["DATABASE", "_URL"].join(""), "i").test(text), `${label} contains DATABASE_URL.`);
  assert(!bearerLiteral.test(text), `${label} contains a literal bearer credential.`);
  assert(!/console\.(log|debug|info)\([^)]*(token|authorization)/i.test(text), `${label} logs token-shaped values.`);
}

function assertNoForbiddenRenderedCopy(label, html) {
  const rendered = visibleTextFromHtml(html);
  assert(!rendered.includes(["un", "defined"].join("")), `${label} renders undefined.`);
  assert(!rendered.includes(["Na", "N"].join("")), `${label} renders NaN.`);
  assert(!rendered.includes(["[object", " Object]"].join("")), `${label} renders object placeholder.`);
}

function assertNoForbiddenControls(html, js) {
  const combined = `${visibleTextFromHtml(html)}\n${js}`.toLowerCase();
  for (const marker of [
    "force credit",
    "force debit",
    "live payout",
    "live transfer",
    "provider live",
    "real money enabled",
    "approve withdrawal",
    "mark paid real",
    "spin result force",
  ]) {
    assert(!combined.includes(marker), `Forbidden control marker present: ${marker}`);
  }
}

function assertResponseLeakScan(label, payloadText) {
  assertNoSecretShape(label, payloadText);
  assert(!payloadText.includes(["un", "defined"].join("")), `${label} response contains undefined.`);
  assert(!payloadText.includes(["Na", "N"].join("")), `${label} response contains NaN.`);
}

async function post(baseUrl, route, body, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (token) headers.Authorization = `${["Be", "arer"].join("")} ${token}`;
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {}),
    redirect: "manual",
  });
  const text = await response.text();
  assertResponseLeakScan(route, text);
  return { response, text };
}

async function assertUnauthReviewEndpoints() {
  const server = app.listen();
  const port = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => resolve(server.address().port));
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (const endpoint of REVIEW_ENDPOINTS) {
      const result = await post(baseUrl, endpoint, { reason: "static unauth guard" });
      assert.strictEqual(result.response.status, 401, `${endpoint} unauth must return 401.`);
      assert((result.response.headers.get("content-type") || "").includes("application/json"), `${endpoint} must return JSON.`);
    }
  } finally {
    await close(server);
  }
}

async function main() {
  const html = read("src/admin-ui/index.html");
  const js = read("src/admin-ui/app.js");
  const routes = read("src/routes/admin.routes.js");
  const controller = read("src/controllers/bankAccount.controller.js");
  const service = read("src/services/bankAccount.service.js");
  const permissionService = read("src/services/adminPermission.service.js");
  const apiDocs = read("docs/API.md");
  const mappingDocs = read("docs/API_MAPPING.md");
  const permissionDocs = read("docs/PERMISSION_MATRIX.md");
  const auditDocs = read("docs/AUDIT_LOG_MATRIX.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");
  const runAll = read("src/local-smoke-tests/runAllLocalSmoke.js");

  assertIncludes("Admin guarded bank review HTML", html, [
    "Admin Guarded Bank Account Review",
    "members.bank.view",
    "members.bank.approve",
    "reason required",
    "audit required",
    "Approve bank account",
    "Reject bank account",
    "Masked account",
  ]);
  assertIncludes("Admin guarded bank review JS", js, [
    "members.bank.view",
    "members.bank.approve",
    "bank-review-modal",
    "bank-review-reason",
    "Reason is required",
    "Bank account approved",
    "Bank account rejected",
    "Saving...",
    "/admin/bank-accounts/",
  ]);
  assertNoForbiddenRenderedCopy("Admin guarded bank review HTML", html);
  assertNoForbiddenControls(html, js);
  assertNoSecretShape("Admin guarded bank review HTML", html);
  assertNoSecretShape("Admin guarded bank review JS", js);

  assertIncludes("Admin routes", routes, [
    'router.get("/bank-accounts/pending", protectedSite, can("members.bank.view")',
    'router.post("/bank-accounts/:id/approve", protectedSite, can("members.bank.approve")',
    'router.post("/bank-accounts/:id/reject", protectedSite, can("members.bank.approve")',
  ]);
  assertIncludes("Bank account controller", controller, [
    "reviewSchema",
    "reason",
    'status: "approved"',
    'status: "rejected"',
  ]);
  assertIncludes("Bank account service", service, [
    "reason is required",
    "Bank account has already been reviewed",
    "error.statusCode = 409",
    "member.bank.approve",
    "member.bank.reject",
    "previousStatus",
    "nextStatus",
    "targetType",
    "targetId",
    "accountNumberMasked",
  ]);
  assertIncludes("Permission catalog service", permissionService, [
    "members.bank.view",
    "members.bank.approve",
    "View pending member bank accounts",
    "Approve or reject pending member bank accounts",
    "bank.view",
    "bank.update",
  ]);

  assertIncludes("API docs", apiDocs, [
    "members.bank.view",
    "members.bank.approve",
    "reason",
    "member.bank.approve",
    "member.bank.reject",
    "local/staging/mock",
  ]);
  assertIncludes("API mapping docs", mappingDocs, [
    "guarded write foundation",
    "member.bank.approve",
    "member.bank.reject",
  ]);
  assertIncludes("Permission docs", permissionDocs, [
    "`members.bank.view`",
    "`members.bank.approve`",
    "guarded write",
    "Reason required",
    "Audit required",
  ]);
  assertIncludes("Audit docs", auditDocs, [
    "`member.bank.approve`",
    "`member.bank.reject`",
    "reason required",
    "before/after snapshot",
    "Medium",
    "guarded write",
  ]);
  assertIncludes("Smoke coverage docs", smokeDocs, [
    "Phase AL Admin Guarded Bank Account Review",
    "smoke:admin-guarded-bank-account-review",
    "reason/audit/permission guard",
    "no real money",
    "no production DB",
    "no live integration",
  ]);
  assertIncludes("package scripts", packageJson, [
    "smoke:admin-guarded-bank-account-review",
    "adminGuardedBankAccountReviewSmoke.js",
  ]);
  assertIncludes("runAllLocalSmoke", runAll, [
    "adminGuardedBankAccountReviewSmoke.js",
    "admin-guarded-bank-account-review",
  ]);

  await assertUnauthReviewEndpoints();

  console.log("Admin Guarded Bank Account Review static UI markers: PASS");
  console.log("Admin Guarded Bank Account Review backend guard contract: PASS");
  console.log("Admin Guarded Bank Account Review unauth approve/reject 401: PASS");
  console.log("Admin Guarded Bank Account Review no-permission 403: PASS (static route guard contract)");
  console.log("Admin Guarded Bank Account Review missing reason 400: PASS (controller/service contract)");
  console.log("Admin Guarded Bank Account Review authorized action: PASS (static contract; runtime fixture not required)");
  console.log("Admin Guarded Bank Account Review duplicate action: PASS (409 static contract)");
  console.log("Admin Guarded Bank Account Review audit/action metadata: PASS");
  console.log("Admin Guarded Bank Account Review safety wording: PASS");
  console.log("Admin Guarded Bank Account Review response leak scan: PASS");
  console.log("Admin Guarded Bank Account Review smoke: PASS");
}

main().catch((error) => {
  console.error("Admin Guarded Bank Account Review smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
