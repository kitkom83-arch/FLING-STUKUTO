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
  const adminUiHtml = read("src/admin-ui/index.html");
  const adminUiSource = read("src/admin-ui/app.js");
  const moneyDemoHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const routes = read("src/routes/admin.routes.js");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-dashboard-reports-connect",
    "backofficeDashboardReportsConnectSmoke.js",
  ]);
  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "src/admin-ui/app.js` is also the primary backend-connected read-only dashboard/report surface",
    "src/money-demo-ui/admin.html` and `src/money-demo-ui/app.js` now expose a dashboard/reports bridge card set backed by `GET /api/admin/reports/summary`",
  ]);
  assertIncludes("smoke coverage docs", smokeDocs, [
    "smoke:backoffice-dashboard-reports-connect",
    "Phase AP Backoffice Dashboard Reports Connect",
    "backend-connected read-only local-safe",
    "GET /api/admin/reports/summary",
    "GET /api/admin/reports/deposits",
    "GET /api/admin/reports/withdrawals",
    "GET /api/admin/reports/wallet-ledger",
    "GET /api/admin/logs",
  ]);

  assertIncludes("admin UI HTML", adminUiHtml, [
    'data-phase-ak-marker="Admin Backoffice Read-only Integration"',
    "Read-only dashboard",
    "Summary cards read from the guarded admin report endpoint.",
    "Dashboard summary",
    "Load an admin credential to read the summary.",
    "Refresh dashboard",
    'data-wallet-ledger-read-only-marker="GET /api/admin/reports/wallet-ledger"',
    'data-transaction-read-only-marker="GET /api/admin/reports/deposits, GET /api/admin/reports/withdrawals"',
    "Admin Audit / Read-only",
  ]);

  assertIncludes("admin UI source", adminUiSource, [
    "DASHBOARD_REPORTS_CONNECTED_NOTE",
    "/admin/reports/summary",
    "/admin/reports/wallet-ledger",
    "/admin/audit-logs?",
    "/admin/members?",
    "/admin/wheel/spins?",
    "/admin/wheel/member-rewards?",
    "Loading dashboard summary...",
    "Dashboard summary loaded.",
    "Read-only request blocked.",
    "dashboard.view",
    "reports.view",
    "members.view",
    "wallet.view",
    "admin.audit.view",
  ]);

  assertIncludes("money demo HTML", moneyDemoHtml, [
    'data-backoffice-dashboard-reports-connect-marker="backend_connected_read_only_local_safe"',
    "Dashboard / Reports Bridge",
    "Backend-connected read-only local-safe summary cards.",
    "Summary cards below use GET /api/admin/reports/summary.",
    "GET /api/admin/reports/deposits, GET /api/admin/reports/withdrawals, GET /api/admin/reports/wallet-ledger, GET /api/admin/logs, GET /api/admin/members.",
    "GET /api/admin/wheel/spins, GET /api/admin/wheel/member-rewards.",
    "Load a local-safe admin to read backend-connected dashboard/report summary cards.",
    "No dashboard/report summary yet.",
  ]);

  assertIncludes("money demo source", moneyDemoSource, [
    "ADMIN_DASHBOARD_REPORTS_ROUTE_NOTE",
    'apiRequest("/admin/reports/summary", { token: state.token })',
    'apiRequest("/admin/bank-accounts/pending", { token: state.token })',
    'apiRequest("/admin/deposits?status=pending&limit=50", { token: state.token })',
    'apiRequest("/admin/withdrawals?status=pending&limit=50", { token: state.token })',
    'apiRequest("/admin/reports/wallet-ledger?limit=20", { token: state.token })',
    'apiRequest("/admin/logs?limit=20", { token: state.token })',
    "Loading backend-connected dashboard/report cards...",
    "Dashboard/report cards refreshed.",
    "Dashboard/report refresh failed.",
    "Login an admin first to read backend-connected dashboard/report cards.",
    "Local admin session cleared. Dashboard/report cards are read-only and local-safe.",
  ]);

  assertIncludes("admin routes", routes, [
    'router.get("/reports/summary", protectedSite, can("reports.view")',
    'router.get("/reports/deposits", protectedSite, can("reports.view")',
    'router.get("/reports/withdrawals", protectedSite, can("reports.view")',
    'router.get("/reports/wallet-ledger", protectedSite, can("reports.view")',
    'router.get("/logs", protectedSite, can("reports.view")',
    'router.get("/members", protectedSite, can("members.view")',
    'router.get("/wheel/spins", protectedSite, canAny(["wheel.spin.view", "wheel.spins.view"])',
    'router.get("/wheel/member-rewards", protectedSite, can("wheel.claims.view")',
  ]);

  const combinedUi = `${visibleTextFromHtml(adminUiHtml)}\n${adminUiSource}\n${visibleTextFromHtml(moneyDemoHtml)}\n${moneyDemoSource}`;
  assertNotIncludes("combined UI forbidden live markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
  ]);
  assertNotIncludes("combined UI fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockSummary = [",
    "const mockDeposits = [",
    "const mockWithdrawals = [",
    "const mockLedger = [",
    "const fakeRows = [",
  ]);

  assertNoSecretShape("admin UI source", adminUiSource);
  assertNoSecretShape("money demo source", moneyDemoSource);
  assertNoSecretShape("money demo HTML", moneyDemoHtml);

  console.log("Backoffice dashboard reports script wiring: PASS");
  console.log("Backoffice dashboard reports main admin route markers: PASS");
  console.log("Backoffice dashboard reports money demo bridge markers: PASS");
  console.log("Backoffice dashboard reports loading/empty/error markers: PASS");
  console.log("Backoffice dashboard reports optional wheel read markers: PASS");
  console.log("Backoffice dashboard reports no fake primary source arrays: PASS");
  console.log("Backoffice dashboard reports no secret/token/session render or log markers: PASS");
  console.log("Backoffice dashboard reports connect smoke: PASS");
}

main();
