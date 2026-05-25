const assert = require("assert");

const app = require("../app");

const ROUTES = [
  "/admin",
  "/admin/",
  "/admin/roles",
  "/admin/roles/",
  "/admin/audit-security",
  "/admin/audit-security/",
  "/admin/work-schedules",
  "/admin/work-schedules/",
  "/admin-wheel",
  "/admin-wheel/",
  "/admin/lucky-wheel",
  "/admin/lucky-wheel/",
];

const REQUIRED_ASSETS = [
  "/admin/work-schedules/app.js",
  "/admin/work-schedules/styles.css",
  "/admin/roles/app.js",
  "/admin/roles/styles.css",
  "/admin/audit-security/app.js",
  "/admin/audit-security/styles.css",
  "/admin-wheel/app.js",
  "/admin-wheel/styles.css",
  "/admin/lucky-wheel/app.js",
  "/admin/lucky-wheel/styles.css",
];

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function get(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const text = await response.text();
  return { response, text };
}

async function postJson(baseUrl, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

function assertNoForbiddenRenderedText(label, html) {
  const rendered = visibleTextFromHtml(html);
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!rendered.includes(marker), `${label} rendered forbidden placeholder: ${marker}`);
  }
  assert(!/\b(password|token|secret|database_url|authorization|jwt)\b/i.test(rendered), `${label} rendered sensitive keyword copy.`);
}

function assertNoStaticSecret(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/DATABASE_URL\s*=|LOCAL_ADMIN_PASSWORD\s*=|JWT_SECRET\s*=/.test(text), `${label} contains an env assignment marker.`);
}

function assertNoRoleBypassControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  const forbiddenRendered = /\b(owner override|super_admin override|force owner|grant owner|grant super_admin|wildcard permission)\b/i;
  assert(!forbiddenRendered.test(rendered), "Role UI must not expose owner/super_admin bypass controls.");
  assert(!/value=["']\*["']|data-permission=["']\*["']/.test(html), "Role UI must not expose wildcard permission controls.");
  assert(!/ownerOverride|superAdminOverride|grantWildcard|setWildcard/.test(js), "Role UI must not define owner/super_admin bypass controls.");
}

function assertNoAdminForceControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  assert(!/\b(force reward|force spin|set prizeIndex)\b/i.test(rendered), "Admin Wheel UI must not render force reward/spin controls.");
  assert(!/actionButton\(\s*["'](?:force reward|force spin|set prizeIndex)["']|<button[^>]*>\s*(?:force reward|force spin|set prizeIndex)\s*<\/button>/i.test(js), "Admin Wheel UI must not define force reward/spin controls.");
}

function assertNoMemberSpinEndpoint(label, js) {
  assert(!js.includes("/member/wheel/spin"), `${label} must not call member spin endpoint.`);
}

function assertNoAdminMemberWriteControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  const forbiddenRendered = /\b(Blacklist|Unblacklist|Credit adjustment|Add credit|Remove credit|Add points|Remove points|Approve bank|Reject bank)\b/i;
  assert(!forbiddenRendered.test(rendered), "Admin member list must not expose member write controls.");
  for (const marker of [
    "/admin/members/:id/block",
    "/admin/members/:id/unblock",
    "/admin/members/:id/credit/add",
    "/admin/members/:id/credit/remove",
    "/admin/members/:id/points/add",
    "/admin/members/:id/points/remove",
  ]) {
    assert(!js.includes(marker), `Admin member list must not define write endpoint marker: ${marker}`);
  }
}

async function assertHtmlRoute(baseUrl, route) {
  const { response, text } = await get(baseUrl, route);
  assert.strictEqual(response.status, 200, `${route} should return 200`);
  assert(!String(response.headers.get("location") || "").trim(), `${route} should not redirect`);
  assert((response.headers.get("content-type") || "").includes("text/html"), `${route} should return HTML`);
  assert(text.includes("<!doctype html>"), `${route} should return an HTML document`);
  assertNoForbiddenRenderedText(route, text);
  assertNoStaticSecret(route, text);
  return text;
}

async function assertAsset(baseUrl, route) {
  const { response, text } = await get(baseUrl, route);
  assert.strictEqual(response.status, 200, `${route} asset should return 200`);
  if (route.endsWith(".js")) {
    assert((response.headers.get("content-type") || "").includes("javascript"), `${route} should be JavaScript`);
    assert(text.includes("const ") || text.includes("function "), `${route} should contain script source`);
  }
  if (route.endsWith(".css")) {
    assert((response.headers.get("content-type") || "").includes("text/css"), `${route} should be CSS`);
    assert(text.includes("{") && text.includes("}"), `${route} should contain stylesheet source`);
  }
  assertNoStaticSecret(route, text);
  return text;
}

async function assertJsonNotHtml(label, result) {
  const contentType = result.response.headers.get("content-type") || "";
  assert(contentType.toLowerCase().includes("application/json"), `${label} should return JSON, got ${contentType || "missing content-type"}`);
  assert(!result.text.toLowerCase().includes("<!doctype html>"), `${label} must not return static HTML`);
  assert(!result.text.includes("Admin Role Management"), `${label} must not return Admin Role Management HTML`);
  assert(!result.text.includes("Lucky Wheel Admin Console"), `${label} must not return Admin Wheel HTML`);
  const payload = JSON.parse(result.text);
  assert(payload && payload.success === false, `${label} should return a safe failure JSON payload`);
}

async function main() {
  const server = app.listen();
  const port = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => resolve(server.address().port));
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const htmlByRoute = new Map();
    for (const route of ROUTES) {
      htmlByRoute.set(route, await assertHtmlRoute(baseUrl, route));
    }

    const assets = new Map();
    for (const asset of REQUIRED_ASSETS) {
      assets.set(asset, await assertAsset(baseUrl, asset));
    }

    const adminHtml = htmlByRoute.get("/admin");
    const rolesHtml = htmlByRoute.get("/admin/roles");
    const auditHtml = htmlByRoute.get("/admin/audit-security");
    const scheduleHtml = htmlByRoute.get("/admin/work-schedules");
    const wheelHtml = htmlByRoute.get("/admin-wheel");
    const adminJs = assets.get("/admin/work-schedules/app.js");
    const auditJs = assets.get("/admin/audit-security/app.js");
    const wheelJs = assets.get("/admin-wheel/app.js");

    assertIncludes("/admin HTML", adminHtml, [
      'data-page="admin-work-schedule"',
      "Admin Role Management",
      "Permission Guard",
      "Dashboard Summary",
      "Read-only dashboard",
      "dashboard-summary-cards",
      "refresh-dashboard",
      "Member List",
      "data-member-permission-marker=\"members.view\"",
      "member-list-state",
      "member-rows",
      "Role Management",
      "Work Schedule",
      "Audit Security",
      "Audit History",
      "/admin-wheel/",
      "Response leak warning",
    ]);
    assertIncludes("/admin/work-schedules HTML", scheduleHtml, [
      "Admin Role Management",
      "Admin schedule list",
      "Emergency override",
      "Audit history",
      "Confirm schedule change",
    ]);
    assertIncludes("/admin/roles HTML", rolesHtml, [
      "Admin Role Management",
      "Role Management / Admin Permission",
      "Permission matrix",
      "Effective permission preview",
      "Save permission assignment",
      "Reset changes",
      "Confirm action",
    ]);
    assertIncludes("Admin role JS", adminJs, [
      "/admin/roles",
      "/admin/roles/",
      "/admin/permissions/catalog",
      "/admin/permissions/me",
      "/admin/reports/summary",
      "loadDashboardSummary",
      "renderDashboardSummary",
      "reports.view",
      "/admin/members",
      "loadMemberList",
      "renderMemberList",
      "members.view",
      "/admin/roles/",
      "admin.roles.update",
      "admin.audit.view",
      "wheel.view",
      "confirmAction",
      "validateReasonBeforeConfirm",
    ]);
    assertIncludes("/admin/audit-security HTML", auditHtml, [
      'data-page="admin-audit-security"',
      "Audit Security Report",
      "Admin audit logs",
      "Security Events",
      "Safe metadata",
      "audit-filter-toolbar",
      "audit-secret-redaction",
    ]);
    assertIncludes("Admin audit security JS", auditJs, [
      "/admin/permissions/me",
      "/admin/audit-logs",
      "/admin/audit-logs/summary",
      "/admin/security-events",
      "/admin/security-events/summary",
      "sanitizeValue",
      "reasonFor",
    ]);
    assertIncludes("/admin-wheel HTML", wheelHtml, [
      'data-page="admin-lucky-wheel"',
      "Lucky Wheel Admin Console",
      "Permission summary",
      "Campaign settings",
      "Rewards management",
      "Spin history",
      "Reports",
      "Audit history",
      "Reward Claims",
      "claim-status-reason",
      "No real money / no live provider",
    ]);
    assertIncludes("Admin wheel JS", wheelJs, [
      "/admin/permissions/me",
      "/admin/wheel/config",
      "/admin/wheel/rewards",
      "/admin/wheel/spins",
      "/admin/wheel/member-rewards",
      "validateReason",
      "confirmAction",
    ]);

    assertNoRoleBypassControls(rolesHtml, adminJs);
    assertNoAdminMemberWriteControls(adminHtml, adminJs);
    assertNoAdminForceControls(wheelHtml, wheelJs);
    assertNoMemberSpinEndpoint("Admin role JS", adminJs);
    assertNoMemberSpinEndpoint("Admin wheel JS", wheelJs);

    const apiMiss = await get(baseUrl, "/api/__admin_browser_routes_smoke__");
    assert.notStrictEqual(apiMiss.response.status, 200, "/api/* should remain outside admin static HTML routes");
    assert(
      (apiMiss.response.headers.get("content-type") || "").toLowerCase().includes("application/json"),
      "/api/* misses should return JSON, not static HTML"
    );
    assert(!apiMiss.text.includes("Admin Role Management"), "/api/* must not return Admin Role Management HTML");
    assert(!apiMiss.text.includes("Lucky Wheel Admin Console"), "/api/* must not return Admin Wheel HTML");

    await assertJsonNotHtml(
      "POST /admin/auth/login",
      await postJson(baseUrl, "/admin/auth/login", { username: "admin_browser_routes_smoke" })
    );

    console.log("Admin browser route /admin contract: PASS");
    console.log("Admin browser route /admin/roles contract: PASS");
    console.log("Admin browser route /admin/audit-security contract: PASS");
    console.log("Admin browser route /admin/work-schedules contract: PASS");
    console.log("Admin browser route /admin-wheel contract: PASS");
    console.log("Admin browser static asset contract: PASS");
    console.log("Admin browser no forbidden rendered copy/static secret values: PASS");
    console.log("Admin browser no owner/super_admin bypass controls: PASS");
    console.log("Admin browser member list read-only controls: PASS");
    console.log("Admin browser no force reward/spin controls or member spin endpoint calls: PASS");
    console.log("Admin browser /api route boundary: PASS");
    console.log("Admin browser /admin/auth/login JSON boundary: PASS");
    console.log("Admin browser routes smoke: PASS");
  } finally {
    await close(server);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Admin browser routes smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main };
