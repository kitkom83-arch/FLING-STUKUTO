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
  assert(!writeRoute.test(adminRoutes), "admin promotion POST/PATCH/PUT/DELETE route must not exist.");
}

function assertNoAdminPromotionUiWrite(label, source) {
  const directWrite = /(?:apiRequest|api|fetch)\(\s*["'`][^"'`]*\/admin\/promotions(?:\/[^"'`]*)?["'`][\s\S]{0,240}method\s*:\s*["'`](?:POST|PUT|PATCH|DELETE)["'`]/i;
  assert(!directWrite.test(source), `${label} must not call admin promotion write endpoints.`);
}

function assertNoClaimRuntimeAction(label, source) {
  const claimPost = /(?:apiRequest|api|fetch)\(\s*["'`][^"'`]*\/promotions\/[^"'`]*\/claim["'`][\s\S]{0,240}method\s*:\s*["'`]POST["'`]/i;
  assert(!claimPost.test(source), `${label} must not POST promotion claim from frontend.`);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const schema = read("prisma/schema.prisma");
  const adminRoutes = read("src/routes/admin.routes.js");
  const adminController = read("src/controllers/admin.controller.js");
  const promotionService = read("src/services/promotion.service.js");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-write-readiness",
    "backofficePromotionAdminWriteReadinessSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminWriteReadinessSmoke.js",
    "smoke:backoffice-promotion-admin-write-readiness",
    "BACKOFFICE-PROMOTION-ADMIN-WRITE-READINESS-27",
    "write locked",
    "field risk",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-WRITE-READINESS-27",
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "write locked",
    "local-safe preflight only",
  ]);

  assertIncludes("schema promotion risk fields", schema, [
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
    "model PromotionClaim",
    "model TurnoverRequirement",
    "promotionClaimId",
  ]);

  assertIncludes("promotion service relationship evidence", promotionService, [
    'type: "promotion_bonus"',
    "turnoverRequirement.create",
    "promotionClaim.create",
    "turnoverMultiplier",
    "maxWithdraw",
  ]);

  assertIncludes("admin read route only", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNoAdminPromotionWriteRoute(adminRoutes);

  assertNotIncludes("admin controller write handlers", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
  ]);
  assertNotIncludes("promotion service admin write functions", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
  ]);

  const visibleAdmin = visibleTextFromHtml(adminHtml);
  const combinedUi = [visibleAdmin, moneyDemoSource, adminUiSource].join("\n");
  assertIncludes("UI write-readiness markers", combinedUi, [
    "promotion admin write readiness",
    "write locked",
    "local-safe preflight only",
    "no runtime credit action",
    "claim guarded hold",
    "audit reason required",
    "before/after diff required",
    "bonus/turnover risk acknowledgement",
    "status transition guard",
    "future permission boundary",
  ]);
  assertIncludes("field risk visibility", visibleAdmin, [
    "title/type/status",
    "minDeposit/maxDeposit",
    "bonusType/bonusValue",
    "turnoverMultiplier",
    "maxWithdraw",
    "startAt/endAt",
    "promotion_bonus ledger",
    "turnoverRequirement",
    "Withdraw condition",
    "Member eligibility",
  ]);
  assertIncludes("UI state coverage", adminHtml + moneyDemoSource, [
    "Load a local-safe admin to read promotion/bonus relationship data.",
    "No backend promotions available for this site.",
    "Admin promotion config visibility refresh failed.",
  ]);

  assertNoAdminPromotionUiWrite("money demo source", moneyDemoSource);
  assertNoAdminPromotionUiWrite("admin UI source", adminUiSource);
  assertNoClaimRuntimeAction("money demo source", moneyDemoSource);
  assertNoClaimRuntimeAction("admin UI source", adminUiSource);

  assert(!/<button[^>]*>\s*(?:create|update|delete|save)\s+promotion/i.test(adminHtml), "admin HTML must not render promotion write buttons.");
  assert(!/addEventListener\(\s*["']click["'][\s\S]{0,220}(?:create|update|delete|save)Promotion/i.test(moneyDemoSource), "money demo must not wire promotion write click actions.");
  assert(!/addEventListener\(\s*["']click["'][\s\S]{0,220}(?:create|update|delete|save)Promotion/i.test(adminUiSource), "admin UI must not wire promotion write click actions.");
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

  console.log("Backoffice promotion admin write readiness package/docs wiring: PASS");
  console.log("Backoffice promotion field risk visibility: PASS");
  console.log("Backoffice promotion admin write boundary remains locked: PASS");
  console.log("Backoffice promotion admin no write route/action/claim runtime: PASS");
  console.log("Backoffice promotion admin write readiness safety scan: PASS");
  console.log("Backoffice promotion admin write readiness smoke: PASS");
}

main();
