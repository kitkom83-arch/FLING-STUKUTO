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
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const authScheme = ["Be", "arer"].join("");
  const authHeaderLiteral = new RegExp(`Authorization:\\s*${authScheme}\\s+["'][A-Za-z0-9._-]+["']`, "i");
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/console\.(log|debug|info)\([^)]*(token|authorization|password|session)/i.test(text), `${label} logs sensitive values.`);
  assert(!authHeaderLiteral.test(text), `${label} contains a literal auth credential.`);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const schema = read("prisma/schema.prisma");
  const adminRoutes = read("src/routes/admin.routes.js");
  const adminController = read("src/controllers/admin.controller.js");
  const promotionService = read("src/services/promotion.service.js");
  const promotionRoutes = read("src/routes/promotion.routes.js");
  const adminPermissionService = read("src/services/adminPermission.service.js");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const memberHtml = read("src/money-demo-ui/member.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-config",
    "backofficePromotionAdminConfigSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "smoke:backoffice-promotion-admin-config",
    "BACKOFFICE-PROMOTION-ADMIN-CONFIG-25",
    "GET /api/admin/promotions",
    "read-only/local-safe",
    "no create/update/delete promotion action",
    "no frontend claim POST",
  ]);

  assertIncludes("schema promotion model", schema, [
    "model Promotion",
    "title",
    "type",
    "minDeposit",
    "maxDeposit",
    "bonusType",
    "bonusValue",
    "turnoverMultiplier",
    "maxWithdraw",
    "status",
    "startAt",
    "endAt",
  ]);

  assertIncludes("admin route guard", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
    "const protectedSite = [adminAuth, siteAccess]",
    "const can = (permission) => requirePermission(permission)",
  ]);
  assert(!/router\.(post|put|patch|delete)\(\s*["']\/promotions/.test(adminRoutes), "admin promotions route must stay read-only.");

  assertIncludes("admin permission catalog", adminPermissionService, [
    "settings.promotion.view",
    "View promotion settings",
    "GET /api/admin/promotions",
  ]);

  assertIncludes("admin controller read-only handler", adminController, [
    'const promotionService = require("../services/promotion.service")',
    "async function listPromotionConfigs(req, res)",
    "promotionService.listAdminPromotionConfigs(req.siteId)",
    "listPromotionConfigs",
  ]);
  assertNotIncludes("admin controller promotion writes", adminController, [
    "claimPromotion(req",
    "promotionClaim.create",
    "turnoverRequirement.create",
  ]);

  assertIncludes("promotion service admin read select", promotionService, [
    "async function listAdminPromotionConfigs(siteId)",
    "prisma.promotion.findMany",
    "where: { siteId }",
    "select: {",
    "minDeposit: true",
    "bonusValue: true",
    "turnoverMultiplier: true",
    "maxWithdraw: true",
    "listAdminPromotionConfigs",
  ]);

  assertIncludes("public claim route still guarded separately", promotionRoutes, [
    'router.get("/promotions", asyncHandler(promotionController.list))',
    'router.post("/promotions/:id/claim", auth, asyncHandler(promotionController.claim))',
  ]);

  assertIncludes("admin promotion config UI", adminHtml, [
    "Admin promotion config visibility: GET /api/admin/promotions is backend-connected, read-only/local-safe, and guarded by admin permission.",
    "Admin promotion config is PARTIAL for read-only visibility only; create/update/delete remains out of scope.",
    "Promotion claim guard",
    "guarded hold/fail-closed status",
    "No production DB. No deploy. No live provider/payment/bank/SMS/slip OCR. No real credit/debit runtime action.",
    "Admin promotion config read-only/local-safe visibility from GET /api/admin/promotions.",
    "No backend promotions available for this site.",
    "partial_read_only",
  ]);

  assertIncludes("money demo source admin config", moneyDemoSource, [
    "ADMIN_PROMOTION_CONFIG_ROUTE_NOTE",
    "GET /api/admin/promotions",
    "backend-connected read-only/local-safe PARTIAL surface",
    "create/update/delete promotion actions",
    "runtime credit action",
    "claim execution stay disabled/guarded hold",
    'apiRequest("/admin/promotions", { token: state.token })',
    "Loading backend-connected admin promotion config read-only/local-safe visibility...",
    "Admin promotion config visibility refreshed.",
    "Admin promotion config visibility refresh failed.",
    "partial_read_only",
    "guarded_hold_fail_closed",
  ]);

  assertIncludes("claim guard remains visible", memberHtml + adminHtml + moneyDemoSource + adminUiSource, [
    "promotion claim guard",
    "local-safe preflight only",
    "guarded hold",
    "fail-closed",
    "POST /api/promotions/:id/claim",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "BACKOFFICE-PROMOTION-ADMIN-CONFIG-25",
    "`GET /api/admin/promotions`",
    "Create/update/delete admin promotion config remains out of scope",
    "does not change promotion claim route behavior",
  ]);

  const directAdminPromotionWrite = /apiRequest\(\s*["']\/admin\/promotions[^"']*["'][\s\S]{0,180}method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/;
  const directClaimPost = /apiRequest\(\s*["']\/promotions\/[^"']*\/claim["']|fetch\(\s*["'][^"']*\/promotions\/[^"']*\/claim["'][\s\S]{0,160}method\s*:\s*["']POST["']/;
  assert(!directAdminPromotionWrite.test(moneyDemoSource), "money demo must not write admin promotion config.");
  assert(!directAdminPromotionWrite.test(adminUiSource), "admin UI must not write admin promotion config.");
  assert(!directClaimPost.test(moneyDemoSource), "money demo must not directly POST promotion claim from UI.");
  assert(!directClaimPost.test(adminUiSource), "admin UI must not directly POST promotion claim from UI.");

  assertNotIncludes("money demo fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockPromotion",
    "const mockBonus",
    "const mockCampaign",
    "const fakeRows = [",
  ]);

  const combinedUi = [visibleTextFromHtml(memberHtml), visibleTextFromHtml(adminHtml), moneyDemoSource, adminUiSource].join("\n");
  assertNotIncludes("combined UI forbidden enabled markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
    "live payment provider enabled",
    "real credit runtime action enabled",
    "real debit runtime action enabled",
  ]);

  for (const [label, text] of [
    ["admin routes", adminRoutes],
    ["admin controller", adminController],
    ["promotion service", promotionService],
    ["admin HTML", adminHtml],
    ["member HTML", memberHtml],
    ["money demo source", moneyDemoSource],
    ["admin UI source", adminUiSource],
  ]) {
    assertNoSecretShape(label, text);
  }

  console.log("Backoffice promotion admin config package/docs wiring: PASS");
  console.log("Backoffice promotion admin config guarded read-only route: PASS");
  console.log("Backoffice promotion admin config UI markers: PASS");
  console.log("Backoffice promotion admin config no write/claim frontend action: PASS");
  console.log("Backoffice promotion admin config safety scan: PASS");
  console.log("Backoffice promotion admin config smoke: PASS");
}

main();
