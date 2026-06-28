const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { simulatePromotionAdminDryRunApi } = require("../utils/promotionAdminDryRunApiStub");

const ROOT = path.resolve(__dirname, "..", "..");
const STUB_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunApiStub.js");

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

function makeRequest(changes, actorOverrides) {
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
    params: { id: "promo-123" },
    body: {
      before: Object.assign({}, base),
      after: Object.assign({}, base, changes.after || {}),
      auditReason: changes.auditReason,
      riskAcknowledgement: changes.riskAcknowledgement,
    },
    actor: Object.assign(
      {
        id: "admin-77",
        role: "finance",
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      actorOverrides || {}
    ),
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.writeLocked, true);
  assert.strictEqual(response.routeMounted, false);
  assert.strictEqual(response.noDbWrite, true);
  assert.strictEqual(response.noLedgerCreation, true);
  assert.strictEqual(response.noTurnoverCreation, true);
  assert.strictEqual(response.noClaimExecution, true);
  assert.strictEqual(response.noRuntimeCreditAction, true);
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
  const stubSource = read("src/utils/promotionAdminDryRunApiStub.js");
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-api-stub",
    "backofficePromotionAdminDryRunApiStubSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunApiStubSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-api-stub",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-API-STUB-31",
    "promotion admin dry-run API stub",
    "pure stub",
    "contract-only",
    "not mounted",
    "validate-only",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-API-STUB-31",
    "promotion admin dry-run API stub",
    "pure stub",
    "contract-only",
    "not mounted",
    "validate-only",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run API stub",
    "pure stub",
    "contract-only",
    "not mounted",
    "validate-only",
    "no DB write",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "write locked",
  ]);

  assertIncludes("stub source markers", stubSource, [
    "simulatePromotionAdminDryRunApi",
    "validatePromotionAdminWriteDryRun",
    "getPromotionAdminDryRunApiContract",
    "PROMOTION_DRY_RUN_FORBIDDEN",
    "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
    "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
    "PROMOTION_DRY_RUN_VALIDATION_FAILED",
    "PROMOTION_DRY_RUN_NOT_MOUNTED",
    "routeMounted: false",
    "noDbWrite: true",
  ]);

  assertNotIncludes("stub source forbidden imports", stubSource, [
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
    "fs.writeFile",
    "res.",
    "req.",
    "express",
  ]);

  assertNoSecretShape("stub source", stubSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("validator source", validatorSource);

  assertIncludes("route lock", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNotIncludes("route writes", adminRoutes, [
    'router.post("/promotions",',
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
    "simulatePromotionAdminDryRunApi",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "simulatePromotionAdminDryRunApi",
    "dryRunPromotion",
  ]);

  const validWrite = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { title: "New Year Promo Updated" },
        auditReason: "title refresh",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(validWrite.ok, true);
  assert.strictEqual(validWrite.mode, "dry_run");
  assert.strictEqual(validWrite.writeLocked, true);
  assert.strictEqual(validWrite.routeMounted, false);
  assert.strictEqual(validWrite.promotionId, "promo-123");
  assert.strictEqual(validWrite.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(validWrite.audit.required, true);
  assert.strictEqual(validWrite.audit.reasonAccepted, true);
  assert.strictEqual(validWrite.audit.actorId, "admin-77");
  assert.strictEqual(validWrite.diff.length, 1);
  assert(validWrite.diff.some((item) => item.field === "title"));
  assert.strictEqual(validWrite.riskSummary.hasEligibilityRisk, true);
  assertCommonResponseFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { title: "New Year Promo Manage" },
        auditReason: "manage refresh",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.manage"],
      }
    )
  );
  assert.strictEqual(validManage.ok, true);
  assert.strictEqual(validManage.validator, "validatePromotionAdminWriteDryRun");
  assertCommonResponseFlags(validManage);

  const forbidden = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { title: "Denied Promo" },
        auditReason: "should not matter",
      },
      {
        permissions: ["settings.promotion.view"],
      }
    )
  );
  assert.strictEqual(forbidden.ok, false);
  assert.strictEqual(forbidden.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(forbidden);

  const missingAuditReason = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { title: "Missing Audit Promo" },
        auditReason: "   ",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(missingAuditReason.ok, false);
  assert.strictEqual(missingAuditReason.code, "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED");
  assertCommonResponseFlags(missingAuditReason);
  assert(Array.isArray(missingAuditReason.errors));

  const missingRiskAck = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { bonusValue: 25 },
        auditReason: "bonus change",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(missingRiskAck.ok, false);
  assert.strictEqual(missingRiskAck.code, "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED");
  assertCommonResponseFlags(missingRiskAck);
  assert(Array.isArray(missingRiskAck.diff));
  assert(missingRiskAck.diff.some((item) => item.field === "bonusValue"));

  const negativeNumeric = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { bonusValue: -1 },
        auditReason: "negative bonus",
        riskAcknowledgement: true,
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(negativeNumeric.ok, false);
  assert.strictEqual(negativeNumeric.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(negativeNumeric);
  assert(negativeNumeric.errors.some((item) => /non-negative/i.test(item)));

  const noPermissionRequest = simulatePromotionAdminDryRunApi(
    makeRequest(
      {
        after: { title: "No Permission Promo" },
        auditReason: "no permission",
      },
      {
        permissions: ["settings.promotion.view"],
      }
    )
  );
  assert.strictEqual(noPermissionRequest.ok, false);
  assert.strictEqual(noPermissionRequest.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(noPermissionRequest);

  const missingPromotionId = simulatePromotionAdminDryRunApi({
    params: {},
    body: makeRequest({ after: { title: "Missing Id Promo" }, auditReason: "missing id" }).body,
    actor: {
      id: "admin-77",
      permissions: ["settings.promotion.view", "settings.promotion.write"],
    },
  });
  assert.strictEqual(missingPromotionId.ok, false);
  assert.strictEqual(missingPromotionId.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(missingPromotionId);

  console.log("Backoffice promotion admin dry-run API stub package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run API stub module export: PASS");
  console.log("Backoffice promotion admin dry-run API stub validator/contract integration: PASS");
  console.log("Backoffice promotion admin dry-run API stub permission behavior: PASS");
  console.log("Backoffice promotion admin dry-run API stub smoke: PASS");
}

main();
