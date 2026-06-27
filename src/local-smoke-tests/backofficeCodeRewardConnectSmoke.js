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
  const authScheme = ["Be", "arer"].join("");
  const authHeaderLiteral = new RegExp(`Authorization:\\s*${authScheme}\\s+[\"'][A-Za-z0-9._-]+[\"']`, "i");
  assert(!jwtLike.test(text), `${label} contains a JWT-like static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/console\.(log|debug|info)\([^)]*(token|authorization|password|session)/i.test(text), `${label} logs sensitive values.`);
  assert(!authHeaderLiteral.test(text), `${label} contains a literal bearer credential.`);
}

function main() {
  const adminUiSource = read("src/admin-ui/app.js");
  const adminWheelSource = read("src/admin-wheel-ui/app.js");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const memberHtml = read("src/money-demo-ui/member.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminRoutes = read("src/routes/admin.routes.js");
  const codeCenterRoutes = read("src/routes/codeCenter.routes.js");
  const memberRewardRoutes = read("src/routes/memberReward.routes.js");
  const wheelRoutes = read("src/routes/wheel.routes.js");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-code-reward-connect",
    "backofficeCodeRewardConnectSmoke.js",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "Reward / Prize / Code Center",
    "`src/money-demo-ui/member.html` and `src/money-demo-ui/app.js` now expose a backend-connected local-safe Code Center and Reward Wallet bridge",
    "`src/money-demo-ui/admin.html` and `src/money-demo-ui/app.js` now expose backend-connected read-only code/reward visibility",
    "`src/admin-ui/app.js` now explicitly marks member reward/code-center visibility as backend-connected local-safe",
  ]);

  assertIncludes("smoke coverage docs", smokeDocs, [
    "smoke:backoffice-code-reward-connect",
    "Phase AQ Backoffice Code Reward Connect",
    "backend-connected local-safe",
    "Lucky Wheel reward selection remains backend-only",
  ]);

  assertIncludes("member HTML", memberHtml, [
    'data-backoffice-code-reward-connect-marker="backend_connected_reward_wallet_local_safe"',
    "Code Center / Reward Wallet Bridge",
    "POST /api/code-center/redeem, GET /api/code-center/redeem-logs.",
    "GET /api/member/rewards, GET /api/member/rewards/summary, GET /api/member/rewards/history.",
    "GET /api/member/wheel/my-rewards. Frontend must not choose reward results itself.",
    "Redeem Code / Coupon",
    "Current available reward wallet entries from GET /api/member/rewards.",
    "Current member redeem history from GET /api/code-center/redeem-logs.",
    "Latest member reward wallet history from GET /api/member/rewards/history.",
    "Read-only member wheel rewards from GET /api/member/wheel/my-rewards. Backend remains the reward source-of-truth.",
    "No production DB. No deploy. No live provider/payment/bank/SMS/slip OCR. No real money or real credit runtime action.",
  ]);

  assertIncludes("admin HTML", adminHtml, [
    'data-backoffice-code-reward-connect-marker="backend_connected_code_reward_local_safe"',
    "Code Center / Rewards Visibility",
    "GET /api/admin/code-center/campaigns and GET /api/admin/code-center/redeem-logs.",
    "POST /api/code-center/redeem, GET /api/code-center/redeem-logs, GET /api/member/rewards, GET /api/member/rewards/summary, and GET /api/member/rewards/history.",
    "GET /api/admin/wheel/member-rewards. Frontend must not choose reward results itself.",
    "Code Center Campaigns",
    "Code Redeem Logs",
    "No production DB. No deploy. No live provider/payment/bank/SMS/slip OCR. No real money or real credit runtime action.",
  ]);

  assertIncludes("money demo source", moneyDemoSource, [
    "MEMBER_CODE_REWARD_ROUTE_NOTE",
    "ADMIN_CODE_REWARD_ROUTE_NOTE",
    'apiRequest("/member/rewards/summary", { token: state.token })',
    'apiRequest("/member/rewards?limit=50", { token: state.token })',
    'apiRequest("/member/rewards/history?limit=50", { token: state.token })',
    'apiRequest("/code-center/redeem-logs?limit=50", { token: state.token })',
    'apiRequest("/member/wheel/my-rewards?limit=20", { token: state.token })',
    'await apiRequest("/code-center/redeem", {',
    'apiRequest("/admin/code-center/campaigns", { token: state.token })',
    'apiRequest("/admin/code-center/redeem-logs?limit=50", { token: state.token })',
    "Loading backend-connected reward wallet and redeem data...",
    "Reward wallet and redeem data refreshed.",
    "Reward wallet refresh failed.",
    "Login a member first to read backend-connected reward wallet and redeem data.",
    "Redeeming local-safe code through backend source...",
    "Code redeemed into reward wallet.",
    "Loading backend-connected code center and reward visibility...",
    "Code center and reward visibility refreshed.",
    "Code center visibility refresh failed.",
    "Login an admin first to read backend-connected code center and reward visibility.",
  ]);

  assertIncludes("admin UI source", adminUiSource, [
    "MEMBER_CODE_REWARD_CONNECTED_NOTE",
    "POST /api/code-center/redeem",
    "GET /api/code-center/redeem-logs",
    "GET /api/member/rewards",
    "GET /api/member/rewards/summary",
    "GET /api/member/rewards/history",
    "GET /api/admin/wheel/member-rewards",
    "GET /api/member/wheel/my-rewards",
  ]);

  assertIncludes("admin wheel source", adminWheelSource, [
    "/admin/wheel/member-rewards?",
    "ไม่มีสิทธิ์ใช้งานเมนู Lucky Wheel",
  ]);

  assertIncludes("admin routes", adminRoutes, [
    'router.get("/code-center/campaigns", protectedSite, can("code_center.view")',
    'router.get("/code-center/redeem-logs", protectedSite, can("code_center.view")',
    'router.get("/wheel/member-rewards", protectedSite, can("wheel.claims.view")',
  ]);

  assertIncludes("code center routes", codeCenterRoutes, [
    'router.post("/code-center/redeem", auth',
    'router.get("/code-center/redeem-logs", auth',
  ]);

  assertIncludes("member reward routes", memberRewardRoutes, [
    'router.get("/member/rewards", auth',
    'router.get("/member/rewards/summary", auth',
    'router.get("/member/rewards/history", auth',
  ]);

  assertIncludes("wheel routes", wheelRoutes, [
    'router.get("/member/wheel/my-rewards", wheelMemberAuth',
  ]);

  const combinedUi = [
    visibleTextFromHtml(memberHtml),
    visibleTextFromHtml(adminHtml),
    moneyDemoSource,
    adminUiSource,
    adminWheelSource,
  ].join("\n");

  assertNotIncludes("combined UI fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockReward",
    "const mockCampaign",
    "const mockRedeem",
    "const fakeRows = [",
  ]);

  assertNotIncludes("combined UI forbidden live markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
    "live payment provider enabled",
  ]);

  assertNoSecretShape("member HTML", memberHtml);
  assertNoSecretShape("admin HTML", adminHtml);
  assertNoSecretShape("money demo source", moneyDemoSource);
  assertNoSecretShape("admin UI source", adminUiSource);
  assertNoSecretShape("admin wheel source", adminWheelSource);

  console.log("Backoffice code reward script wiring: PASS");
  console.log("Backoffice code reward member route markers: PASS");
  console.log("Backoffice code reward admin route markers: PASS");
  console.log("Backoffice code reward loading/empty/error markers: PASS");
  console.log("Backoffice code reward wheel source-of-truth markers: PASS");
  console.log("Backoffice code reward no fake primary source arrays: PASS");
  console.log("Backoffice code reward no secret/token/session render or log markers: PASS");
  console.log("Backoffice code reward connect smoke: PASS");
}

main();
