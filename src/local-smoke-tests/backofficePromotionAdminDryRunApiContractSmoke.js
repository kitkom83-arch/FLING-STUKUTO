const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTRACT_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunApiContract.js");

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

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/fetch\(|http:|https:|axios|net\.|dns\.|child_process/i.test(text), `${label} contains a network/runtime import marker.`);
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
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  const contract = require(CONTRACT_PATH);
  const exportedContract = contract.PROMOTION_ADMIN_DRY_RUN_API_CONTRACT;
  const contractViaGetter = contract.getPromotionAdminDryRunApiContract();

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-api-contract",
    "backofficePromotionAdminDryRunApiContractSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunApiContractSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-api-contract",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-API-CONTRACT-30",
    "promotion admin dry-run API contract",
    "contract-only",
    "not mounted",
    "validate-only",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-API-CONTRACT-30",
    "promotion admin dry-run API contract",
    "contract-only",
    "not mounted",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run API contract",
    "contract-only",
    "not mounted",
    "validate-only",
    "no DB write",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "write locked",
  ]);

  assertIncludes("contract source markers", contractSource, [
    "PROMOTION_ADMIN_DRY_RUN_API_CONTRACT",
    "getPromotionAdminDryRunApiContract",
    "contract_only_not_mounted",
    "/api/admin/promotions/:id/dry-run",
    "PROMOTION_DRY_RUN_VALIDATION_FAILED",
    "no provider/payment/bank/SMS/slip OCR",
  ]);

  assertIncludes("validator source markers", validatorSource, [
    "validatePromotionAdminWriteDryRun",
    "before and after must include at least one changed field",
    "riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes",
  ]);

  assertNotIncludes("contract source forbidden imports", contractSource, [
    "require(\"../config/prisma\")",
    "require(\"../controllers/",
    "require(\"../services/",
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "process.env",
    "Date.now",
  ]);

  assertNoSecretShape("contract source", contractSource);

  assert.strictEqual(typeof contract.PROMOTION_ADMIN_DRY_RUN_API_CONTRACT, "object");
  assert.strictEqual(typeof contract.getPromotionAdminDryRunApiContract, "function");
  assert.strictEqual(exportedContract, contractViaGetter, "getter should return the exported contract object");

  assert.strictEqual(exportedContract.endpoint.method, "POST");
  assert.strictEqual(exportedContract.endpoint.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(exportedContract.endpoint.status, "contract_only_not_mounted");

  assert.deepStrictEqual(exportedContract.permissions.futureDryRunPermissions, ["settings.promotion.write", "settings.promotion.manage"]);
  assert.strictEqual(exportedContract.permissions.currentReadPermission, "settings.promotion.view");

  assert.deepStrictEqual(exportedContract.request.fields, [
    "title",
    "type",
    "status",
    "minDeposit",
    "maxDeposit",
    "bonusType",
    "bonusValue",
    "turnoverMultiplier",
    "maxWithdraw",
    "startAt",
    "endAt",
  ]);
  assert.strictEqual(exportedContract.request.bodyShape.before, "plain object");
  assert.strictEqual(exportedContract.request.bodyShape.after, "plain object");
  assert.strictEqual(exportedContract.request.bodyShape.auditReason, "required string");
  assert.strictEqual(exportedContract.request.bodyShape.riskAcknowledgement, "boolean");

  assert.strictEqual(exportedContract.response.successShape.ok, true);
  assert.strictEqual(exportedContract.response.successShape.mode, "dry_run");
  assert.strictEqual(exportedContract.response.successShape.writeLocked, true);
  assert.strictEqual(exportedContract.response.successShape.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(exportedContract.response.successShape.audit, "object");
  assert.strictEqual(exportedContract.response.errorShape.ok, false);
  assert.deepStrictEqual(exportedContract.errorCodes, [
    "PROMOTION_DRY_RUN_VALIDATION_FAILED",
    "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
    "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
    "PROMOTION_DRY_RUN_FORBIDDEN",
    "PROMOTION_DRY_RUN_NOT_MOUNTED",
  ]);
  assert.deepStrictEqual(exportedContract.safetyInvariants, [
    "no DB write",
    "no promotion update",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no runtime credit action",
    "no provider/payment/bank/SMS/slip OCR",
    "no production DB/deploy",
  ]);

  assert.strictEqual(
    adminRoutes.includes('router.post("/promotions/:id/dry-run"'),
    true,
    "admin routes must mount dry-run route."
  );
  assert.strictEqual(adminRoutes.includes('router.post("/promotions",'), false, "admin routes must not mount promotion write route");
  assert.strictEqual(adminRoutes.includes('router.patch("/promotions"'), false, "admin routes must not mount promotion write route");
  assert.strictEqual(adminRoutes.includes('router.put("/promotions"'), false, "admin routes must not mount promotion write route");
  assert.strictEqual(adminRoutes.includes('router.delete("/promotions"'), false, "admin routes must not mount promotion write route");
  assertNotIncludes("controller writes", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "dryRunPromotion",
  ]);

  console.log("Backoffice promotion admin dry-run API contract package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run API contract export shape: PASS");
  console.log("Backoffice promotion admin dry-run API contract request/response shape: PASS");
  console.log("Backoffice promotion admin dry-run API contract safety invariants: PASS");
  console.log("Backoffice promotion admin dry-run API contract route lock: PASS");
  console.log("Backoffice promotion admin dry-run API contract smoke: PASS");
}

main();
