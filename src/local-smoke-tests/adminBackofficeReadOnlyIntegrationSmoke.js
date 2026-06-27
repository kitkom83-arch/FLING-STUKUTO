const assert = require("assert");
const fs = require("fs");
const path = require("path");

const app = require("../app");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE_CODE = "PG77";

const READ_ONLY_ENDPOINTS = [
  { path: "/api/admin/reports/summary", permission: "reports.view" },
  { path: "/api/admin/reports/wallet-ledger", permission: "reports.view" },
  { path: "/api/admin/members", permission: "members.view" },
  { path: "/api/admin/bank-accounts/pending", permission: "members.bank.view" },
  { path: "/api/admin/bank/mock/statements/deposits", permission: "bank.view" },
  { path: "/api/admin/bank/mock/statements/withdrawals", permission: "bank.view" },
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function get(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      Accept: "application/json",
      "X-Site-Code": SITE_CODE,
    },
    redirect: "manual",
  });
  const text = await response.text();
  return { response, text };
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

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = new RegExp(`${["Authorization", ":", " Bearer"].join("")}\\s+["'][A-Za-z0-9._-]+["']`, "i");
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!new RegExp(["DATABASE", "_URL"].join(""), "i").test(text), `${label} contains DATABASE_URL.`);
  assert(!new RegExp(["s", "k", "-"].join("")).test(text), `${label} contains an API-key-shaped marker.`);
  assert(!bearerLiteral.test(text), `${label} contains a literal bearer credential.`);
  assert(!/console\.(log|debug|info)\([^)]*(token|authorization)/i.test(text), `${label} logs token-shaped values.`);
}

function assertNoForbiddenRenderedCopy(label, html) {
  const rendered = visibleTextFromHtml(html);
  assert(!rendered.includes(["un", "defined"].join("")), `${label} renders undefined.`);
  assert(!rendered.includes(["Na", "N"].join("")), `${label} renders NaN.`);
  assert(!rendered.includes(["[object", " Object]"].join("")), `${label} renders object placeholder.`);
}

function assertNoForbiddenWriteControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  const forbiddenRendered = [
    "approve payout",
    "force credit",
    "force debit",
    "live payout",
    "live transfer",
    "provider live",
    "real money enabled",
  ];
  for (const marker of forbiddenRendered) {
    assert(!rendered.toLowerCase().includes(marker), `UI renders forbidden write control copy: ${marker}`);
  }

  const dangerousWriteCall = /(?:fetch|api|adminFetchReadOnly)\([^)]*\/admin\/[^)]*\/(?:credit|debit|spin|payout|transfer)(?:\/|["'`?)]|-)/i;
  assert(!dangerousWriteCall.test(js), "Admin read-only UI must not call dangerous write endpoints.");
  const unguardedReadOnlyWriteCall = /adminFetchReadOnly\([^)]*\/(?:approve|reject)(?:\/|["'`?)]|-)/i;
  assert(!unguardedReadOnlyWriteCall.test(js), "Admin read-only helper must not call approve/reject endpoints.");
}

function assertRouteGuard(routes, endpoint) {
  const routePath = endpoint.path.replace(/^\/api\/admin/, "");
  const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const routePattern = new RegExp(`router\\.get\\("${escaped}"[\\s\\S]{0,140}${endpoint.permission.replace(".", "\\.")}`);
  assert(routePattern.test(routes), `${endpoint.path} must be a guarded GET route with ${endpoint.permission}.`);
}

async function assertUnauthReadOnlyEndpoints() {
  const server = app.listen();
  const port = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => resolve(server.address().port));
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (const endpoint of READ_ONLY_ENDPOINTS) {
      const result = await get(baseUrl, endpoint.path);
      assert.strictEqual(result.response.status, 401, `${endpoint.path} unauth must return 401.`);
      assert((result.response.headers.get("content-type") || "").includes("application/json"), `${endpoint.path} must return JSON.`);
      assertNoSecretShape(endpoint.path, result.text);
    }
  } finally {
    await close(server);
  }
}

function hasDatabaseUrl() {
  const databaseUrlKey = ["DATABASE", "URL"].join("_");
  const value = process.env[databaseUrlKey];
  return typeof value === "string" && value.trim().length > 0;
}

async function main() {
  const html = read("src/admin-ui/index.html");
  const js = read("src/admin-ui/app.js");
  const routes = read("src/routes/admin.routes.js");
  const docs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");
  const runAll = read("src/local-smoke-tests/runAllLocalSmoke.js");

  assertIncludes("Admin backoffice HTML", html, [
    "Admin Backoffice Read-only Integration",
    "dashboard.view",
    "reports.view",
    "members.view",
    "wallet.view",
    "bank.view",
    "Wallet ledger / Deposit / Withdrawal / Read-only",
    "Bank summary / Statement / Read-only",
    "Loading",
    "ไม่พบข้อมูล",
  ]);
  assertIncludes("Admin backoffice JS", js, [
    "adminFetchReadOnly",
    "Read-only request blocked.",
    "formatMoneySafe",
    "formatPercentSafe",
    "formatCountSafe",
    "/admin/reports/summary",
    "/admin/reports/wallet-ledger",
    "/admin/bank/mock/statements/deposits",
    "/admin/bank/mock/statements/withdrawals",
  ]);
  assertNoForbiddenRenderedCopy("Admin backoffice HTML", html);
  assertNoForbiddenWriteControls(html, js);
  assertNoSecretShape("Admin backoffice HTML", html);
  assertNoSecretShape("Admin backoffice JS", js);

  for (const endpoint of READ_ONLY_ENDPOINTS) {
    assertRouteGuard(routes, endpoint);
  }
  assertIncludes("Route guard source", routes, [
    'router.get("/reports/summary", protectedSite, can("reports.view")',
    'router.get("/reports/wallet-ledger", protectedSite, can("reports.view")',
    'router.get("/members", protectedSite, can("members.view")',
    'router.get("/bank-accounts/pending", protectedSite, can("members.bank.view")',
    'router.get("/bank/mock/statements/deposits", protectedSite, can("bank.view")',
    'router.get("/bank/mock/statements/withdrawals", protectedSite, can("bank.view")',
  ]);

  assertIncludes("Smoke coverage docs", docs, [
    "Phase AK Admin Backoffice Read-only API Integration",
    "smoke:admin-backoffice-read-only-integration",
    "read-only UI/API integration",
    "no write action",
    "no production DB",
    "no real money",
    "no live integration",
  ]);
  assertIncludes("package scripts", packageJson, [
    "smoke:admin-backoffice-read-only-integration",
    "adminBackofficeReadOnlyIntegrationSmoke.js",
  ]);
  assertIncludes("runAllLocalSmoke", runAll, [
    "adminBackofficeReadOnlyIntegrationSmoke.js",
    "admin-backoffice-read-only-integration",
  ]);

  if (hasDatabaseUrl()) {
    await assertUnauthReadOnlyEndpoints();
    console.log("Admin Backoffice read-only endpoint auth guard: PASS");
  } else {
    console.log("Admin Backoffice read-only endpoint auth guard: SKIP-SAFE (DATABASE_URL not set; static route guard contract still covered)");
  }

  console.log("Admin Backoffice Read-only Integration static markers: PASS");
  console.log("Admin Backoffice no dangerous write controls: PASS");
  console.log("Admin Backoffice no secret-shaped UI/API contract: PASS");
  console.log("Admin Backoffice read-only integration smoke: PASS");
}

main().catch((error) => {
  console.error("Admin Backoffice read-only integration smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
