const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { buildPromotionAdminDryRunUiPreview } = require("../utils/promotionAdminDryRunUiPreview");

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

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/fetch\(|http:|https:|axios|net\.|dns\.|child_process/i.test(text), `${label} contains a network/runtime import marker.`);
}

function assertCommonSampleFlags(sample) {
  assert.strictEqual(sample.writeLocked, true);
  assert.strictEqual(sample.routeMounted, false);
  assert.strictEqual(sample.noDbWrite, true);
  assert.strictEqual(sample.noLedgerCreation, true);
  assert.strictEqual(sample.noTurnoverCreation, true);
  assert.strictEqual(sample.noClaimExecution, true);
  assert.strictEqual(sample.noRuntimeCreditAction, true);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const previewSource = read("src/utils/promotionAdminDryRunUiPreview.js");
  const stubSource = read("src/utils/promotionAdminDryRunApiStub.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");
  const adminRoutes = read("src/routes/admin.routes.js");
  const adminController = read("src/controllers/admin.controller.js");
  const promotionService = read("src/services/promotion.service.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-ui-preview",
    "backofficePromotionAdminDryRunUiPreviewSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunUiPreviewSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-ui-preview",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-PREVIEW-32",
    "promotion admin dry-run UI preview",
    "ui preview only",
    "no API call",
    "not mounted",
    "validate-only",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-PREVIEW-32",
    "promotion admin dry-run UI preview",
    "ui preview only",
    "no API call",
    "not mounted",
    "validate-only",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run UI preview",
    "ui preview only",
    "no API call",
    "not mounted",
    "validate-only",
    "no DB write",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "write locked",
    "no claim execution",
  ]);

  assertIncludes("preview source markers", previewSource, [
    "buildPromotionAdminDryRunUiPreview",
    "simulatePromotionAdminDryRunApi",
    "dry_run_ui_preview",
    "apiCallEnabled: false",
    "previewOnly: true",
    "UI preview only, no API call, not mounted, write locked, validate-only",
    "diff preview",
    "risk summary",
    "errors and warnings",
    "audit preview",
    "safety flags",
  ]);

  assertNotIncludes("preview source forbidden imports", previewSource, [
    "require(\"../config/prisma\")",
    "require(\"../controllers/",
    "require(\"../services/",
    "require(\"./promotionAdminDryRunApiContract\")",
    "require(\"./promotionAdminWriteValidator\")",
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "process.env",
    "Date.now",
    "fs.writeFile",
    "res.",
    "req.",
    "express",
  ]);

  assertNoSecretShape("preview source", previewSource);
  assertNoSecretShape("stub source", stubSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("validator source", validatorSource);

  assertIncludes("route lock", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNotIncludes("route writes", adminRoutes, [
    'router.post("/promotions"',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
    "dry-run",
  ]);
  assertNotIncludes("controller writes", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "dryRunPromotion",
    "simulatePromotionAdminDryRunApi",
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

  const preview = buildPromotionAdminDryRunUiPreview();
  assert.strictEqual(preview.title, "Promotion Admin Dry-run UI Preview");
  assert.strictEqual(preview.mode, "dry_run_ui_preview");
  assert.strictEqual(preview.writeLocked, true);
  assert.strictEqual(preview.routeMounted, false);
  assert.strictEqual(preview.apiCallEnabled, false);
  assert.strictEqual(preview.previewOnly, true);
  assert.deepStrictEqual(preview.sections, [
    "diff preview",
    "risk summary",
    "errors and warnings",
    "audit preview",
    "safety flags",
  ]);
  assert.deepStrictEqual(preview.safetyFlags, {
    noDbWrite: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
  });
  assertIncludes("preview summary", preview.summary, [
    "UI preview only",
    "no API call",
    "not mounted",
    "write locked",
    "validate-only",
    "no DB write",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
  ]);

  const success = preview.samples.success;
  assert.strictEqual(success.ok, true);
  assert.strictEqual(success.mode, "dry_run");
  assert.strictEqual(success.writeLocked, true);
  assert.strictEqual(success.routeMounted, false);
  assert.strictEqual(success.noDbWrite, true);
  assert.strictEqual(success.noLedgerCreation, true);
  assert.strictEqual(success.noTurnoverCreation, true);
  assert.strictEqual(success.noClaimExecution, true);
  assert.strictEqual(success.noRuntimeCreditAction, true);
  assert.strictEqual(success.audit.required, true);
  assert.strictEqual(success.audit.reasonAccepted, true);
  assert.strictEqual(success.validator, "validatePromotionAdminWriteDryRun");
  assert(Array.isArray(success.diff) && success.diff.length > 0);
  assert(success.diff.some((item) => item.field === "title"));
  assert(success.riskSummary && success.riskSummary.hasEligibilityRisk === true);
  assertCommonSampleFlags(success);

  const forbidden = preview.samples.forbidden;
  assert.strictEqual(forbidden.ok, false);
  assert.strictEqual(forbidden.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonSampleFlags(forbidden);

  const auditReasonRequired = preview.samples.auditReasonRequired;
  assert.strictEqual(auditReasonRequired.ok, false);
  assert.strictEqual(auditReasonRequired.code, "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED");
  assertCommonSampleFlags(auditReasonRequired);

  const riskAcknowledgementRequired = preview.samples.riskAcknowledgementRequired;
  assert.strictEqual(riskAcknowledgementRequired.ok, false);
  assert.strictEqual(riskAcknowledgementRequired.code, "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED");
  assertCommonSampleFlags(riskAcknowledgementRequired);
  assert(Array.isArray(riskAcknowledgementRequired.diff));
  assert(riskAcknowledgementRequired.diff.some((item) => item.field === "bonusValue"));

  const validationFailed = preview.samples.validationFailed;
  assert.strictEqual(validationFailed.ok, false);
  assert.strictEqual(validationFailed.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonSampleFlags(validationFailed);
  assert(Array.isArray(validationFailed.errors));
  assert(validationFailed.errors.some((item) => /non-negative/i.test(item)));

  console.log("Backoffice promotion admin dry-run UI preview package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run UI preview module export: PASS");
  console.log("Backoffice promotion admin dry-run UI preview sample model: PASS");
  console.log("Backoffice promotion admin dry-run UI preview safety boundaries: PASS");
  console.log("Backoffice promotion admin dry-run UI preview smoke: PASS");
}

main();
