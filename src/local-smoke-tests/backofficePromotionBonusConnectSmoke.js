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
  assert(!authHeaderLiteral.test(text), `${label} contains a literal auth credential.`);
}

function main() {
  const adminHtml = read("src/money-demo-ui/admin.html");
  const memberHtml = read("src/money-demo-ui/member.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const adminRoutes = read("src/routes/admin.routes.js");
  const promotionRoutes = read("src/routes/promotion.routes.js");
  const promotionService = read("src/services/promotion.service.js");
  const reportService = read("src/services/report.service.js");
  const memberService = read("src/services/member.service.js");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const packageJson = read("package.json");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-bonus-connect",
    "backofficePromotionBonusConnectSmoke.js",
  ]);

  assertIncludes("promotion routes", promotionRoutes, [
    'router.get("/promotions", asyncHandler(promotionController.list))',
    'router.post("/promotions/:id/claim", auth, asyncHandler(promotionController.claim))',
  ]);

  assertIncludes("promotion service", promotionService, [
    "listPromotions",
    "claimPromotion",
    'type: "promotion_bonus"',
    "turnoverRequirement.create",
    "requiredAmount",
  ]);

  assertIncludes("admin fail closed routes", adminRoutes, [
    'router.get("/reports/summary", protectedSite, can("reports.view")',
    'router.get("/reports/wallet-ledger", protectedSite, can("reports.view")',
    'router.get("/code-center/campaigns", protectedSite, can("code_center.view")',
    'router.get("/code-center/redeem-logs", protectedSite, can("code_center.view")',
  ]);

  assertIncludes("report service relationship", reportService, [
    '"promotion_bonus"',
    "walletLedger",
    "total_bonus",
  ]);

  assertIncludes("member service relationship", memberService, [
    "promotion_claim",
    "turnoverRequirements",
    "promotionDeposits",
  ]);

  assertIncludes("member HTML", memberHtml, [
    'data-backoffice-promotion-bonus-connect-marker="backend_connected_promotion_bonus_local_safe"',
    "Promotion / Bonus Visibility",
    "Promotion campaign visibility: GET /api/promotions.",
    "POST /api/promotions/:id/claim",
    "this UI does not call it because it can create promotion_bonus ledger rows and turnover requirements",
    "Relationship markers: Code Center / Reward Wallet / Ledger stay local-safe/read-only or guarded-safe only.",
    "No production DB. No deploy. No live provider/payment/bank/SMS/slip OCR. No real credit/debit runtime action.",
    "No backend promotions available for this site.",
  ]);

  assertIncludes("admin HTML", adminHtml, [
    'data-backoffice-promotion-bonus-connect-marker="backend_connected_promotion_bonus_read_only_local_safe"',
    "Promotion / Bonus Read-only Bridge",
    "Member-visible promotion campaign list: GET /api/promotions.",
    "Bonus/free-credit relationship visibility: GET /api/admin/reports/summary and GET /api/admin/reports/wallet-ledger.",
    "Admin promotion config visibility: GET /api/admin/promotions is backend-connected, read-only/local-safe, and guarded by admin permission.",
    "Admin promotion config is PARTIAL for read-only visibility only; create/update/delete remains out of scope.",
    "New project.zip remains a UI/mock reference only.",
    "No production DB. No deploy. No live provider/payment/bank/SMS/slip OCR. No real credit/debit runtime action.",
  ]);

  assertIncludes("money demo source", moneyDemoSource, [
    "PROMOTION_BONUS_ROUTE_NOTE",
    'apiRequest("/promotions", { token: state.token })',
    "Loading backend-connected promotion/bonus visibility...",
    "Promotion/bonus visibility refreshed.",
    "Promotion/bonus visibility refresh failed.",
    "Loading backend-connected admin promotion config read-only/local-safe visibility...",
    "Admin promotion config visibility refreshed.",
    "Admin promotion config visibility refresh failed.",
    "Admin promotion config visibility stays read-only/local-safe",
    "read_only_hold",
    "partial_read_only",
    "promotion_bonus",
  ]);

  assertIncludes("admin UI source", adminUiSource, [
    "PROMOTION_BONUS_CONNECTED_NOTE",
    "GET /api/promotions",
    "GET /api/admin/reports/summary",
    "GET /api/admin/reports/wallet-ledger",
    "POST /api/promotions/:id/claim is not surfaced in backoffice",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "Promotions",
    "`GET /api/promotions`",
    "`POST /api/promotions/:id/claim`",
    "`GET /api/admin/promotions`",
    "promotion_bonus ledger",
    "BACKOFFICE-PROMOTION-BONUS-CONNECT-23",
  ]);

  assertIncludes("smoke coverage docs", smokeDocs, [
    "smoke:backoffice-promotion-bonus-connect",
    "BACKOFFICE-PROMOTION-BONUS-CONNECT-23",
    "backend-connected promotion/bonus visibility",
    "no real credit/debit runtime action",
  ]);

  const combinedUi = [visibleTextFromHtml(memberHtml), visibleTextFromHtml(adminHtml), moneyDemoSource, adminUiSource].join("\n");

  assertNotIncludes("money demo fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockPromotion",
    "const mockBonus",
    "const mockCampaign",
    "const fakeRows = [",
  ]);

  assertNotIncludes("combined UI forbidden live markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
    "live payment provider enabled",
    "real credit runtime action enabled",
    "real debit runtime action enabled",
  ]);

  assertNoSecretShape("member HTML", memberHtml);
  assertNoSecretShape("admin HTML", adminHtml);
  assertNoSecretShape("money demo source", moneyDemoSource);
  assertNoSecretShape("admin UI source", adminUiSource);

  console.log("Backoffice promotion bonus script wiring: PASS");
  console.log("Backoffice promotion bonus existing route markers: PASS");
  console.log("Backoffice promotion bonus UI markers: PASS");
  console.log("Backoffice promotion bonus loading/empty/error markers: PASS");
  console.log("Backoffice promotion bonus no fake primary source arrays: PASS");
  console.log("Backoffice promotion bonus safety boundaries: PASS");
  console.log("Backoffice promotion bonus connect smoke: PASS");
}

main();
