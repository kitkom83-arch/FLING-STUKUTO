const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
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

function assertNoSecretShape(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = /Authorization:\s*Bearer\s+["'][A-Za-z0-9._-]+["']/i;
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/DATABASE_URL/i.test(text), `${label} contains DATABASE_URL.`);
  assert(!bearerLiteral.test(text), `${label} contains a literal bearer credential.`);
  assert(!/console\.(log|debug|info)\([^)]*(token|authorization|password|session)/i.test(text), `${label} logs sensitive values.`);
}

function main() {
  const adminUiJs = read("src/admin-ui/app.js");
  const adminMoneyHtml = read("src/money-demo-ui/admin.html");
  const adminMoneyJs = read("src/money-demo-ui/app.js");
  const routes = read("src/routes/admin.routes.js");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-member-money-connect",
    "backofficeMemberMoneyConnectSmoke.js",
  ]);
  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "Implementation Follow-up",
    "src/money-demo-ui/admin.html",
    "src/money-demo-ui/app.js",
    "src/admin-ui/app.js",
  ]);
  assertIncludes("smoke coverage docs", smokeDocs, [
    "smoke:backoffice-member-money-connect",
    "Phase AO Backoffice Member Money Connect",
    "backend-connected local-safe",
    "no production DB",
    "no live provider/payment/bank/SMS/slip OCR",
  ]);

  assertIncludes("admin backoffice member JS", adminUiJs, [
    'GET /api/admin/members, GET /api/admin/members/:id',
    "/admin/members/${encodeURIComponent(memberId)}",
    "/admin/members/${encodeURIComponent(memberId)}/history",
    "/admin/reports/wallet-ledger?",
    "Read-only request blocked.",
    "members.view",
    "wallet.view",
  ]);

  assertIncludes("admin money HTML", adminMoneyHtml, [
    "Backend-connected local-safe admin finance queue",
    'data-backoffice-member-money-connect-marker="backend_connected_local_safe"',
    "Members stay read-only on the main backoffice",
    "GET /api/admin/members, GET /api/admin/members/:id, GET /api/admin/members/:id/history on /admin/",
    "GET /api/admin/bank-accounts/pending, GET /api/admin/deposits?status=pending, GET /api/admin/withdrawals?status=pending, GET /api/admin/reports/wallet-ledger, GET /api/admin/logs",
    "POST /api/admin/bank-accounts/:id/approve, POST /api/admin/bank-accounts/:id/reject, POST /api/admin/deposits/:id/approve, POST /api/admin/deposits/:id/reject, POST /api/admin/withdrawals/:id/approve, POST /api/admin/withdrawals/:id/reject",
    "No live payment provider. No real money movement. No production DB. No deploy. No live payment/bank/SMS/slip OCR.",
    "No pending bank accounts.",
    "No pending deposits.",
    "No pending withdrawals.",
    "No ledger rows yet.",
    "No audit rows yet.",
    "Open Main Backoffice Members",
  ]);

  assertIncludes("admin money JS", adminMoneyJs, [
    "ADMIN_MEMBER_READ_ONLY_ROUTE_NOTE",
    "ADMIN_FINANCE_CONNECTED_ROUTE_NOTE",
    'apiRequest("/admin/bank-accounts/pending", { token: state.token })',
    'apiRequest("/admin/deposits?status=pending&limit=50", { token: state.token })',
    'apiRequest("/admin/withdrawals?status=pending&limit=50", { token: state.token })',
    'apiRequest("/admin/reports/wallet-ledger?limit=20", { token: state.token })',
    'apiRequest("/admin/logs?limit=20", { token: state.token })',
    'apiRequest(`/admin/bank-accounts/${encodeURIComponent(id)}/${action}`',
    'apiRequest(`/admin/deposits/${encodeURIComponent(id)}/${action}`',
    'apiRequest(`/admin/withdrawals/${encodeURIComponent(id)}/${action}`',
    "Refreshing admin finance queues...",
    "Admin finance refresh failed.",
    "Login an admin first.",
    "Local-safe review only.",
  ]);

  assertIncludes("admin routes", routes, [
    'router.get("/members", protectedSite, can("members.view")',
    'router.get("/members/:id/history", protectedSite, can("members.view")',
    'router.get("/bank-accounts/pending", protectedSite, can("members.bank.view")',
    'router.post("/bank-accounts/:id/approve", protectedSite, can("members.bank.approve")',
    'router.post("/bank-accounts/:id/reject", protectedSite, can("members.bank.approve")',
    'router.get("/deposits", protectedSite, can("deposits.view")',
    'router.post("/deposits/:id/approve", protectedSite, can("deposits.approve")',
    'router.post("/deposits/:id/reject", protectedSite, can("deposits.approve")',
    'router.get("/withdrawals", protectedSite, can("withdrawals.view")',
    'router.post("/withdrawals/:id/approve", protectedSite, can("withdrawals.approve")',
    'router.post("/withdrawals/:id/reject", protectedSite, can("withdrawals.approve")',
    'router.get("/reports/wallet-ledger", protectedSite, can("reports.view")',
    'router.get("/logs", protectedSite, can("reports.view")',
  ]);

  const combinedUi = `${visibleTextFromHtml(adminMoneyHtml)}\n${adminMoneyJs}\n${adminUiJs}`;
  assertNotIncludes("connected UI forbidden live markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
  ]);
  assertNotIncludes("connected UI fake primary source markers", adminMoneyJs, [
    "const fake",
    "const mockDeposits = [",
    "const mockWithdrawals = [",
    "const mockLedger = [",
    "const fakeRows = [",
  ]);
  assertNoSecretShape("admin money HTML", adminMoneyHtml);
  assertNoSecretShape("admin money JS", adminMoneyJs);
  assertNoSecretShape("admin backoffice member JS", adminUiJs);

  console.log("Backoffice member money connect script wiring: PASS");
  console.log("Backoffice member read-only route markers: PASS");
  console.log("Backoffice member money backend-connected local-safe markers: PASS");
  console.log("Backoffice member money loading/empty/error markers: PASS");
  console.log("Backoffice member money fail-closed route guard markers: PASS");
  console.log("Backoffice member money no fake primary source arrays: PASS");
  console.log("Backoffice member money no secret/token/session render or log markers: PASS");
  console.log("Backoffice member money connect smoke: PASS");
}

main();
