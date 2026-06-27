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
  const memberHtml = read("src/money-demo-ui/member.html");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const promotionRoutes = read("src/routes/promotion.routes.js");
  const promotionController = read("src/controllers/promotion.controller.js");
  const promotionService = read("src/services/promotion.service.js");
  const authMiddleware = read("src/middleware/auth.js");
  const memberService = read("src/services/member.service.js");
  const adminRoutes = read("src/routes/admin.routes.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-claim-guard",
    "backofficePromotionClaimGuardSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "smoke:backoffice-promotion-claim-guard",
    "BACKOFFICE-PROMOTION-CLAIM-GUARD-24",
    "promotion claim guard",
    "local-safe preflight only",
    "guarded hold",
    "fail-closed",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "New project.zip` is a static UI/mock reference only, not a backend source.",
    "Promotion visibility is connected",
    "BACKOFFICE-PROMOTION-CLAIM-GUARD-24",
    "guarded hold",
    "OUT_OF_SCOPE_NOW",
    "Bonus ledger/turnover remain visibility only",
  ]);

  assertIncludes("promotion routes", promotionRoutes, [
    'router.get("/promotions", asyncHandler(promotionController.list))',
    'router.post("/promotions/:id/claim", auth, asyncHandler(promotionController.claim))',
  ]);

  assertIncludes("promotion controller", promotionController, [
    "claimPromotion(req.user.id, req.siteId, req.params.id)",
    "201",
  ]);

  assertIncludes("promotion service behavior", promotionService, [
    "promotion.status !== \"active\"",
    "Promotion not found",
    "Promotion already claimed",
    "promotionClaim.create",
    'status: "claimed"',
    'type: "promotion_bonus"',
    'referenceType: "promotion_claim"',
    "turnoverRequirement.create",
    "requiredAmount",
    "walletMovement ? walletMovement.ledger : null",
  ]);

  assertIncludes("auth fail closed", authMiddleware, [
    "Authentication required",
    "Token site mismatch",
    "User is blocked",
  ]);

  assertIncludes("admin/member relationship reads", memberService, [
    "promotion_claim",
    "turnoverRequirements",
    "promotionDeposits",
  ]);

  assertIncludes("admin route fail closed pattern", adminRoutes, [
    'protectedSite, can("reports.view")',
    'router.get("/reports/wallet-ledger"',
  ]);

  assertIncludes("member guard UI", memberHtml, [
    "data-promotion-claim-guard-marker=\"promotion claim guard local-safe preflight only guarded hold fail-closed\"",
    "Promotion Claim Guard",
    "Route marker: GET /api/promotions",
    "Route marker: POST /api/promotions/:id/claim",
    "claim action locked",
    "guarded hold",
    "fail-closed",
    "local-safe preflight only",
    "min deposit",
    "bonus/free credit",
    "turnover",
    "withdraw condition",
    "status",
    "ledger relationship",
  ]);

  assertIncludes("admin guard UI", adminHtml, [
    "data-promotion-claim-guard-marker=\"promotion claim guard local-safe preflight only guarded hold fail-closed\"",
    "Promotion claim guard",
    "guarded hold/fail-closed status",
    "cannot be triggered by frontend direct POST",
    "Claim Action",
    "guarded_hold",
  ]);

  assertIncludes("money demo source guard behavior", moneyDemoSource, [
    "promotion claim guard",
    "local-safe preflight only",
    "guarded hold",
    "fail-closed",
    "createPromotionClaimGuardCell",
    "button.disabled = true",
    "Claim locked",
    "guarded_hold_fail_closed",
    'apiRequest("/promotions", { token: state.token })',
    "Loading backend-connected promotion/bonus visibility...",
    "Promotion/bonus visibility refreshed.",
    "Promotion/bonus visibility refresh failed.",
  ]);

  assertIncludes("main admin source guard marker", adminUiSource, [
    "PROMOTION_BONUS_CONNECTED_NOTE",
    "Promotion claim guard",
    "local-safe preflight only",
    "guarded hold",
    "fail-closed",
    "GET /api/promotions",
    "POST /api/promotions/:id/claim is not surfaced in backoffice",
  ]);

  const directClaimPost = /apiRequest\(\s*["']\/promotions\/[^"']*\/claim["']|fetch\(\s*["'][^"']*\/promotions\/[^"']*\/claim["'][\s\S]{0,160}method\s*:\s*["']POST["']/;
  assert(!directClaimPost.test(moneyDemoSource), "money demo must not directly POST promotion claim from UI.");
  assert(!directClaimPost.test(adminUiSource), "admin UI must not directly POST promotion claim from UI.");
  assert(!/addEventListener\(\s*["']click["'][\s\S]{0,500}\/promotions\/[^"']*\/claim/.test(moneyDemoSource), "member claim click handler must stay absent.");

  assertNotIncludes("money demo fake primary source markers", moneyDemoSource, [
    "const fake",
    "const mockPromotion",
    "const mockBonus",
    "const mockCampaign",
    "const fakeRows = [",
  ]);

  const combinedUi = [visibleTextFromHtml(memberHtml), visibleTextFromHtml(adminHtml), moneyDemoSource, adminUiSource].join("\n");
  assertNotIncludes("combined UI forbidden live markers", combinedUi.toLowerCase(), [
    "provider live",
    "real money enabled",
    "deploy now",
    "production db enabled",
    "live payment provider enabled",
    "real credit runtime action enabled",
    "real debit runtime action enabled",
  ]);

  for (const [label, text] of [
    ["member HTML", memberHtml],
    ["admin HTML", adminHtml],
    ["money demo source", moneyDemoSource],
    ["admin UI source", adminUiSource],
  ]) {
    assertNoSecretShape(label, text);
  }

  console.log("Backoffice promotion claim guard script wiring: PASS");
  console.log("Backoffice promotion claim route behavior markers: PASS");
  console.log("Backoffice promotion claim guard UI markers: PASS");
  console.log("Backoffice promotion claim no direct frontend POST: PASS");
  console.log("Backoffice promotion claim condition visibility: PASS");
  console.log("Backoffice promotion claim safety scan: PASS");
  console.log("Backoffice promotion claim guard smoke: PASS");
}

main();
