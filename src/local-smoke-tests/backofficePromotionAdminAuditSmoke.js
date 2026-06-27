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

function assertNoAdminPromotionWriteRoute(adminRoutes) {
  const writeRoute = /router\.(post|put|patch|delete)\(\s*["']\/promotions(?:\/[^"']*)?["']/i;
  assert(!writeRoute.test(adminRoutes), "admin promotion create/update/delete route must not exist.");
}

function assertNoAdminPromotionUiWrite(label, source) {
  const adminPromotionWrite = /(?:apiRequest|api|fetch)\(\s*["'`][^"'`]*\/admin\/promotions(?:\/[^"'`]*)?["'`][\s\S]{0,220}method\s*:\s*["'`](?:POST|PUT|PATCH|DELETE)["'`]/i;
  assert(!adminPromotionWrite.test(source), `${label} must not write admin promotion config.`);
}

function assertNoClaimRuntimeAction(label, source) {
  const claimPost = /(?:apiRequest|api|fetch)\(\s*["'`][^"'`]*\/promotions\/[^"'`]*\/claim["'`][\s\S]{0,220}method\s*:\s*["'`]POST["'`]/i;
  assert(!claimPost.test(source), `${label} must not POST promotion claim from UI.`);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminRoutes = read("src/routes/admin.routes.js");
  const adminController = read("src/controllers/admin.controller.js");
  const promotionService = read("src/services/promotion.service.js");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-audit",
    "backofficePromotionAdminAuditSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminAuditSmoke.js",
    "smoke:backoffice-promotion-admin-audit",
    "BACKOFFICE-PROMOTION-ADMIN-AUDIT-26",
    "route guard evidence",
    "adminAuth",
    "siteAccess",
    "settings.promotion.view",
    "write actions remain out-of-scope",
  ]);

  assertIncludes("admin route guard contract", adminRoutes, [
    'const protectedSite = [adminAuth, siteAccess]',
    "const can = (permission) => requirePermission(permission)",
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNoAdminPromotionWriteRoute(adminRoutes);

  assertIncludes("admin controller read-only handler", adminController, [
    'const promotionService = require("../services/promotion.service")',
    "async function listPromotionConfigs(req, res)",
    "promotionService.listAdminPromotionConfigs(req.siteId)",
    "listPromotionConfigs",
  ]);
  assertNotIncludes("admin controller promotion write behavior", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "claimPromotion(req",
    "promotionClaim.create",
    "turnoverRequirement.create",
  ]);

  assertIncludes("promotion service read-only admin list", promotionService, [
    "async function listAdminPromotionConfigs(siteId)",
    "prisma.promotion.findMany",
    "where: { siteId }",
    "select: {",
    "listAdminPromotionConfigs",
  ]);
  assertNotIncludes("promotion service admin write functions", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
  ]);

  const combinedUi = [visibleTextFromHtml(adminHtml), moneyDemoSource, adminUiSource].join("\n");
  assertIncludes("admin promotion audit UI markers", combinedUi, [
    "admin promotion config",
    "read-only/local-safe",
    "permission guarded",
    "audit boundary",
    "route guard evidence",
    "no runtime credit action",
    "claim guarded hold",
    "GET /api/admin/promotions",
  ]);
  assertIncludes("admin promotion UI states", adminHtml + moneyDemoSource, [
    "Loading backend-connected admin promotion config",
    "No backend promotions available for this site.",
    "Admin promotion config visibility refresh failed.",
  ]);

  assertNoAdminPromotionUiWrite("money demo source", moneyDemoSource);
  assertNoAdminPromotionUiWrite("admin UI source", adminUiSource);
  assertNoClaimRuntimeAction("money demo source", moneyDemoSource);
  assertNoClaimRuntimeAction("admin UI source", adminUiSource);

  assertNotIncludes("money demo fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockPromotion",
    "const mockBonus",
    "const mockCampaign",
    "const fakeRows = [",
  ]);

  assertNotIncludes("forbidden live/runtime markers", combinedUi.toLowerCase(), [
    "provider live",
    "payment live",
    "bank live",
    "sms live",
    "slip ocr live",
    "production db enabled",
    "deploy now",
    "real credit runtime action enabled",
    "real debit runtime action enabled",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "BACKOFFICE-PROMOTION-ADMIN-AUDIT-26",
    "`GET /api/admin/promotions`",
    "route guard evidence",
    "write actions remain out of scope",
  ]);

  for (const [label, text] of [
    ["admin routes", adminRoutes],
    ["admin controller", adminController],
    ["promotion service", promotionService],
    ["admin HTML", adminHtml],
    ["money demo source", moneyDemoSource],
    ["admin UI source", adminUiSource],
  ]) {
    assertNoSecretShape(label, text);
  }

  console.log("Backoffice promotion admin audit package/docs wiring: PASS");
  console.log("Backoffice promotion admin route guard evidence: PASS");
  console.log("Backoffice promotion admin read-only boundary: PASS");
  console.log("Backoffice promotion admin UI audit markers: PASS");
  console.log("Backoffice promotion admin safety scan: PASS");
  console.log("Backoffice promotion admin audit smoke: PASS");
}

main();
