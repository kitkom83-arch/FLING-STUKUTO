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
  const unsafeMarkers = [["un", "defined"].join(""), ["Na", "N"].join(""), ["[object", " Object]"].join("")];
  for (const marker of unsafeMarkers) {
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
  const forceReward = ["force", " reward"].join("");
  const forceSpin = ["force", " spin"].join("");
  const prizeIndex = ["set", " prizeIndex"].join("");
  const forcedControlPattern = new RegExp(`\\b(${forceReward}|${forceSpin}|${prizeIndex})\\b`, "i");
  assert(!forcedControlPattern.test(rendered), "Admin Wheel UI must not render forced reward/spin controls.");
  const buttonPattern = new RegExp(
    `actionButton\\(\\s*["'](?:${forceReward}|${forceSpin}|${prizeIndex})["']|<button[^>]*>\\s*(?:${forceReward}|${forceSpin}|${prizeIndex})\\s*<\\/button>`,
    "i"
  );
  assert(!buttonPattern.test(js), "Admin Wheel UI must not define forced reward/spin controls.");
}

function assertNoMemberSpinEndpoint(label, js) {
  const endpoint = ["/member", "/wheel", "/spin"].join("");
  assert(!js.includes(endpoint), `${label} must not call member spin endpoint.`);
}

function assertNoGeneralPlayHistoryEndpoint(label, js) {
  const endpoint = ["/api/game", "/bet-history/mock"].join("");
  assert(!js.includes(endpoint), `${label} must not call general play history mock endpoint.`);
}

function assertNoMemberJwtEndpoints(label, text) {
  for (const endpoint of [
    ["/api", "/me"].join(""),
    ["/api", "/wallet/ledger"].join(""),
    ["/api", "/deposits"].join(""),
    ["/api", "/withdrawals"].join(""),
    ["/api", "/member/wheel"].join(""),
  ]) {
    assert(!text.includes(endpoint), `${label} must not call member JWT endpoint: ${endpoint}`);
  }
}

function assertNoMockRowCreatingEndpoint(label, text) {
  const mockRow = ["mock", "-row"].join("");
  assert(!new RegExp(`${mockRow}|createMockRow|seedMockRow`, "i").test(text), `${label} must not define mock-row-creating endpoints.`);
}

function assertNoAdminMemberWriteControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  const forbiddenRendered = /\b(Blacklist|Unblacklist|Credit adjustment|Add credit|Remove credit|Add points|Remove points|Approve bank|Reject bank|Approve deposit|Reject deposit|Approve withdrawal|Reject withdrawal|Mark paid|Claim reward|Cancel reward)\b/i;
  assert(!forbiddenRendered.test(rendered), "Admin member list must not expose member write controls.");
  for (const marker of [
    ["/admin/members/:id", "/block"].join(""),
    ["/admin/members/:id", "/unblock"].join(""),
    ["/admin/members/:id", "/credit/add"].join(""),
    ["/admin/members/:id", "/credit/remove"].join(""),
    ["/admin/members/:id", "/points/add"].join(""),
    ["/admin/members/:id", "/points/remove"].join(""),
  ]) {
    assert(!js.includes(marker), `Admin member list must not define write endpoint marker: ${marker}`);
  }
  const callMarker = ["fe", "tch"].join("");
  const apiMarker = ["a", "pi"].join("");
  const creditMarker = ["cred", "it"].join("");
  const memberWriteCall = new RegExp(`${callMarker}\\([^)]*\\/admin\\/members\\/[^)]*\\/(?:block|unblock|${creditMarker}|points)`, "i");
  const memberWriteApiCall = new RegExp(`${apiMarker}\\([^)]*\\/admin\\/members\\/[^)]*\\/(?:block|unblock|${creditMarker}|points)`, "i");
  assert(!memberWriteCall.test(js), "Admin member UI must not call member write endpoints.");
  assert(!memberWriteApiCall.test(js), "Admin member UI must not call member write endpoints through api().");
  const apiPrefix = ["/api", "/admin"].join("");
  const memberWriteEndpoint = new RegExp(`${apiPrefix}\\/members\\/[^\\s"'<>]+\\/(?:block|unblock|${creditMarker}|points)`, "i");
  const bankWriteEndpoint = new RegExp(`${apiPrefix}\\/bank[^\\s"'<>]+\\/(?:approve|reject)`, "i");
  assert(!memberWriteEndpoint.test(html) && !memberWriteEndpoint.test(js), "Admin member UI must not include active member write endpoint strings.");
  assert(!bankWriteEndpoint.test(html) && !bankWriteEndpoint.test(js), "Admin member UI must not include active bank review write endpoint strings.");
  assert(!/\b(approve bank|reject bank|unblock member|block member)\b/i.test(rendered), "Admin member UI must not render write-looking member/bank action labels.");
  assert(!/\b(approve deposit|reject deposit|approve withdrawal|reject withdrawal|mark-paid|claim reward|cancel reward)\b/i.test(js), "Admin member UI must not define money/reward write actions.");
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
      "Detail / Read-only",
      "Member Detail / Read-only",
      "data-member-detail-read-only-marker=\"GET /api/admin/members/:id\"",
      "member-detail-state",
      "member-detail-rows",
      "Back to Member List",
      "data-member-blocked-read-only-marker",
      "ข้อมูลสมาชิกที่บล็อค",
      "Blocked Members / Read-only",
      "Read-only view only. No unblock action in this phase.",
      "GET /api/admin/members?status=blocked",
      "member-blocked-rows",
      "data-member-pending-bank-read-only-marker",
      "ข้อมูลบัญชีที่รอตรวจสอบ",
      "Pending Bank Accounts / Read-only",
      "Read-only view only. No approve/reject action in this phase.",
      "GET /api/admin/bank-accounts/pending",
      "member-pending-bank-rows",
      "data-admin-audit-read-only-marker",
      "data-member-audit-read-only-marker",
      "Admin Audit / Read-only",
      "Member Audit / Read-only",
      "Audit visibility only",
      "GET /api/admin/audit-logs",
      "GET /api/admin/audit-logs?target_type=user&amp;target_id=&lt;memberId&gt;",
      "member-audit-rows",
      "Bank Account Audit target mapping needs confirmation.",
      "data-member-history-read-only-marker",
      "/api/admin/members/:id",
      "/api/admin/reports/wallet-ledger?user_id=&lt;memberId&gt;",
      "/api/admin/wheel/spins?memberId=&lt;memberId&gt;",
      "/api/admin/wheel/member-rewards?memberId=&lt;memberId&gt;",
      "data-member-history-tabs-marker",
      "ประวัติสมาชิก / Read-only",
      "รายการฝาก",
      "รายการถอน",
      "Wallet Ledger",
      "กงล้อ / Spin history",
      "รางวัล / Member rewards",
      "รายการเล่น",
      "รายการฝากก่อนรับโปร",
      "แนะนำเพื่อน",
      "การใช้งาน",
      "ยอดค้างชำระ",
      "ไม่พบข้อมูล",
      "ยังไม่มี API สำหรับประวัติการเล่นทั่วไป",
      "ยังไม่มี API สำหรับข้อมูลนี้",
      "แนะนำเพื่อน: ใช้ข้อมูล referralSource จากรายละเอียดสมาชิก",
      "ยังไม่มี API สำหรับประวัติแนะนำเพื่อนแบบเต็ม",
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
      "/admin/members?${params.toString()}",
      "/admin/bank-accounts/pending?${params.toString()}",
      "renderBlockedMembers",
      "renderPendingBankAccounts",
      "renderMemberAudit",
      "loadMemberAudit",
      "/admin/audit-logs?${params.toString()}",
      "/admin/members/:id",
      "/admin/members/${encodeURIComponent(memberId)}",
      "loadMemberList",
      "renderMemberList",
      "loadMemberDetail",
      "renderMemberDetail",
      "memberDetailTrigger",
      "loadMemberHistory",
      "/admin/reports/wallet-ledger",
      "/admin/wheel/spins",
      "/admin/wheel/member-rewards",
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
    assertNoGeneralPlayHistoryEndpoint("Admin role JS", adminJs);
    assertNoMemberJwtEndpoints("Admin role JS", adminJs);
    assertNoMockRowCreatingEndpoint("Admin role JS", adminJs);

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
    console.log("Admin browser no forced reward/spin controls or member spin endpoint calls: PASS");
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
