const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { validatePromotionAdminWriteDryRun } = require("../utils/promotionAdminWriteValidator");

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

function makeInput(changes) {
  const base = {
    title: "New Year Promo",
    type: "deposit",
    status: "active",
    minDeposit: 100,
    maxDeposit: 500,
    bonusType: "fixed",
    bonusValue: 20,
    turnoverMultiplier: 3,
    maxWithdraw: 200,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-01-31T23:59:59.000Z",
  };

  return {
    before: Object.assign({}, base),
    after: Object.assign({}, base, changes.after || {}),
    auditReason: changes.auditReason,
    riskAcknowledgement: changes.riskAcknowledgement,
  };
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

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-write-validator",
    "backofficePromotionAdminWriteValidatorSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminWriteValidatorSmoke.js",
    "smoke:backoffice-promotion-admin-write-validator",
    "BACKOFFICE-PROMOTION-ADMIN-WRITE-VALIDATOR-29",
    "promotion admin write validator",
    "pure validator",
    "validate-only",
    "write locked",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-WRITE-VALIDATOR-29",
    "pure validator module",
    "validate-only dry-run payloads",
    "no DB write",
    "write locked",
  ]);

  assertIncludes("ui markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin write validator",
    "pure validator",
    "validate-only",
    "no DB write",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "write locked",
  ]);

  assertIncludes("validator source markers", validatorSource, [
    "validatePromotionAdminWriteDryRun",
    "ALLOWED_FIELDS",
    "NUMERIC_FIELDS",
    "RISK_TAGS",
    "auditReason is required",
    "riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes",
  ]);

  assertNotIncludes("validator source forbidden imports", validatorSource, [
    "require(\"../config/prisma\")",
    "require(\"../controllers/",
    "require(\"../services/",
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "fs.writeFile",
    "process.env",
    "Date.now",
  ]);

  assertNoSecretShape("validator source", validatorSource);

  const validTitleChange = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { title: "New Year Promo Updated" },
      auditReason: "title copy refresh",
    })
  );
  assert.strictEqual(validTitleChange.ok, true, "title-only diff should pass");
  assert.strictEqual(validTitleChange.errors.length, 0);
  assert.strictEqual(validTitleChange.diff.length, 1);
  assert.strictEqual(validTitleChange.diff[0].field, "title");
  assert.strictEqual(validTitleChange.riskSummary.hasEligibilityRisk, true);

  const missingAuditReason = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { title: "New Year Promo Updated" },
      auditReason: "   ",
    })
  );
  assert.strictEqual(missingAuditReason.ok, false, "missing audit reason should fail");
  assert(missingAuditReason.errors.some((item) => /auditReason/i.test(item)));

  const noDiff = validatePromotionAdminWriteDryRun(
    makeInput({
      auditReason: "no diff test",
    })
  );
  assert.strictEqual(noDiff.ok, false, "no diff should fail");
  assert(noDiff.errors.some((item) => /changed field/i.test(item)));

  const negativeNumeric = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { bonusValue: -1 },
      auditReason: "negative bonus",
    })
  );
  assert.strictEqual(negativeNumeric.ok, false, "negative numeric field should fail");
  assert(negativeNumeric.errors.some((item) => /non-negative/i.test(item)));

  const depositRange = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { minDeposit: 200, maxDeposit: 100 },
      auditReason: "bad deposit range",
    })
  );
  assert.strictEqual(depositRange.ok, false, "maxDeposit lower than minDeposit should fail");
  assert(depositRange.errors.some((item) => /maxDeposit/i.test(item)));

  const badDateWindow = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { startAt: "2026-02-01T00:00:00.000Z", endAt: "2026-01-01T00:00:00.000Z" },
      auditReason: "bad window",
    })
  );
  assert.strictEqual(badDateWindow.ok, false, "startAt after endAt should fail");
  assert(badDateWindow.errors.some((item) => /startAt/i.test(item)));

  const bonusNoAck = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { bonusValue: 25 },
      auditReason: "bonus change",
    })
  );
  assert.strictEqual(bonusNoAck.ok, false, "bonus change without ack should fail");
  assert(bonusNoAck.errors.some((item) => /riskAcknowledgement/i.test(item)));

  const bonusAck = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { bonusValue: 25 },
      auditReason: "bonus change",
      riskAcknowledgement: true,
    })
  );
  assert.strictEqual(bonusAck.ok, true, "bonus change with ack should pass");
  assert(bonusAck.diff.some((item) => item.field === "bonusValue" && item.riskTags.includes("bonus") && item.riskTags.includes("ledger")));
  assert.strictEqual(bonusAck.riskSummary.hasBonusRisk, true);

  const turnoverChange = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { turnoverMultiplier: 5 },
      auditReason: "turnover change",
      riskAcknowledgement: true,
    })
  );
  assert.strictEqual(turnoverChange.ok, true, "turnover change with ack should pass");
  assert.strictEqual(turnoverChange.riskSummary.hasTurnoverRisk, true);
  assert(turnoverChange.diff.some((item) => item.field === "turnoverMultiplier" && item.riskTags.includes("turnover")));

  const withdrawChange = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { maxWithdraw: 300 },
      auditReason: "withdraw change",
      riskAcknowledgement: true,
    })
  );
  assert.strictEqual(withdrawChange.ok, true, "withdraw change with ack should pass");
  assert.strictEqual(withdrawChange.riskSummary.hasWithdrawRisk, true);
  assert(withdrawChange.diff.some((item) => item.field === "maxWithdraw" && item.riskTags.includes("withdraw")));

  const statusChange = validatePromotionAdminWriteDryRun(
    makeInput({
      after: { status: "paused" },
      auditReason: "status change",
    })
  );
  assert.strictEqual(statusChange.ok, true, "status change should pass");
  assert.strictEqual(statusChange.riskSummary.hasStatusRisk, true);
  assert(statusChange.diff.some((item) => item.field === "status" && item.riskTags.includes("status")));

  const unknownField = validatePromotionAdminWriteDryRun({
    before: {
      title: "New Year Promo",
      type: "deposit",
      status: "active",
      minDeposit: 100,
      maxDeposit: 500,
      bonusType: "fixed",
      bonusValue: 20,
      turnoverMultiplier: 3,
      maxWithdraw: 200,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-01-31T23:59:59.000Z",
      secretField: "nope",
    },
    after: {
      title: "New Year Promo",
      type: "deposit",
      status: "active",
      minDeposit: 100,
      maxDeposit: 500,
      bonusType: "fixed",
      bonusValue: 20,
      turnoverMultiplier: 3,
      maxWithdraw: 200,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-01-31T23:59:59.000Z",
    },
    auditReason: "unknown field",
  });
  assert.strictEqual(unknownField.ok, false, "unknown field should fail");
  assert(unknownField.errors.some((item) => /not an allowed promotion field/i.test(item)));

  assertIncludes("route lock", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNotIncludes("route writes", adminRoutes, [
    'router.post("/promotions",',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
  ]);
  assertNotIncludes("controller writes", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
  ]);

  console.log("Backoffice promotion admin write validator package/docs wiring: PASS");
  console.log("Backoffice promotion admin write validator module export: PASS");
  console.log("Backoffice promotion admin write validator pure-function cases: PASS");
  console.log("Backoffice promotion admin write validator route lock: PASS");
  console.log("Backoffice promotion admin write validator safety scan: PASS");
  console.log("Backoffice promotion admin write validator smoke: PASS");
}

main();
