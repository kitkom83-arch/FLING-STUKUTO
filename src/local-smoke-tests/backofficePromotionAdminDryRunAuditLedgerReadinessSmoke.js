const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunAuditLedgerReadiness,
  simulatePromotionAdminDryRunAuditLedgerPlan,
} = require("../utils/promotionAdminDryRunAuditLedgerReadiness");

const ROOT = path.resolve(__dirname, "..", "..");
const AUDIT_LEDGER_READINESS_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunAuditLedgerReadiness.js");

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

function makeRequest(changes, actorOverrides, method = "POST", pathValue = "/api/admin/promotions/:id/dry-run") {
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
    planType: changes.planType || "promotionAdminDryRunAuditLedgerPlan",
    auditMode: changes.auditMode,
    ledgerMode: changes.ledgerMode,
    serviceOperation: {
      operation: changes.operation || "dryRunPromotionUpdateService",
      serviceMode: changes.serviceMode,
      controllerAction: {
        action: changes.action || "dryRunPromotionUpdate",
        request: {
          method,
          path: pathValue,
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
          headers: {
            "x-site-code": "PG77",
          },
        },
        responseMode: "json",
      },
    },
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.routeMounted, false);
  assert.strictEqual(response.expressMounted, false);
  assert.strictEqual(response.controllerMounted, false);
  assert.strictEqual(response.serviceMounted, false);
  assert.strictEqual(response.auditRuntimeEnabled, false);
  assert.strictEqual(response.ledgerRuntimeEnabled, false);
  assert.strictEqual(response.runtimeHandlerEnabled, false);
  assert.strictEqual(response.serviceRuntimeEnabled, false);
  assert.strictEqual(response.apiCallEnabled, false);
  assert.strictEqual(response.writeLocked, true);
  assert.strictEqual(response.previewOnly, false);
  assert.strictEqual(response.readinessOnly, true);
  assert.strictEqual(response.noDbWrite, true);
  assert.strictEqual(response.noPromotionUpdate, true);
  assert.strictEqual(response.noAuditRowCreation, true);
  assert.strictEqual(response.noLedgerCreation, true);
  assert.strictEqual(response.noTurnoverCreation, true);
  assert.strictEqual(response.noClaimExecution, true);
  assert.strictEqual(response.noRuntimeCreditAction, true);
  assert.strictEqual(response.auditRowCreated, false);
  assert.strictEqual(response.ledgerCreated, false);
  assert.strictEqual(response.turnoverRequirementCreated, false);
  assert.strictEqual(response.runtimeCreditActionCreated, false);
  assert(response.auditLedgerReadiness && response.auditLedgerReadiness.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36", "auditLedgerReadiness should carry phase metadata.");
  assert(response.auditLedgerReadiness.servicePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35", "auditLedgerReadiness should carry service phase metadata.");
  assert(response.auditLedgerReadiness.controllerPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34", "auditLedgerReadiness should carry controller phase metadata.");
  assert(response.auditLedgerReadiness.routePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33", "auditLedgerReadiness should carry route phase metadata.");
  assert(response.safetyFlags && response.safetyFlags.noAuditRowCreation === true, "safetyFlags should include noAuditRowCreation.");
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
  const moduleSource = read("src/utils/promotionAdminDryRunAuditLedgerReadiness.js");
  const serviceSource = read("src/utils/promotionAdminDryRunServiceReadiness.js");
  const controllerSource = read("src/utils/promotionAdminDryRunControllerReadiness.js");
  const routeSource = read("src/utils/promotionAdminDryRunRouteReadiness.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-audit-ledger-readiness",
    "backofficePromotionAdminDryRunAuditLedgerReadinessSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunAuditLedgerReadinessSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-audit-ledger-readiness",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36",
    "audit ledger readiness only",
    "audit mode plan only",
    "ledger mode plan only",
    "audit runtime not enabled",
    "ledger runtime not enabled",
    "audit row not created",
    "ledger not created",
    "turnover requirement not created",
    "service not mounted",
    "controller not mounted",
    "no Express mount",
    "no API call",
    "validate-only",
    "write locked",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36",
    "audit ledger readiness",
    "plan only",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("module markers", moduleSource, [
    "buildPromotionAdminDryRunAuditLedgerReadiness",
    "simulatePromotionAdminDryRunAuditLedgerPlan",
    "audit_ledger_readiness_only_not_mounted",
    "promotionAdminDryRunAuditLedgerPlan",
    "noAuditRowCreation: true",
    "auditLedgerReadiness",
    "auditPlan",
    "ledgerPlan",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunServiceReadiness")',
    'require("./promotionAdminDryRunApiContract")',
  ]);

  assertNotIncludes("module forbidden imports", moduleSource, [
    'require("../config/prisma")',
    'require("../controllers/',
    'require("../services/',
    'require("express")',
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "process.env",
    "res.",
    "req.",
  ]);

  assertNoSecretShape("audit ledger readiness source", moduleSource);
  assertNoSecretShape("service readiness source", serviceSource);
  assertNoSecretShape("controller readiness source", controllerSource);
  assertNoSecretShape("route readiness source", routeSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("validator source", validatorSource);
  assertNoSecretShape("audit ledger readiness path", AUDIT_LEDGER_READINESS_PATH);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run audit ledger readiness",
    "audit ledger readiness only",
    "audit mode plan only",
    "ledger mode plan only",
    "audit runtime not enabled",
    "ledger runtime not enabled",
    "audit row not created",
    "ledger not created",
    "turnover requirement not created",
    "service not mounted",
    "controller not mounted",
    "no Express mount",
    "no API call",
    "not mounted",
    "validate-only",
    "write locked",
    "no DB write",
    "no promotion update",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
  ]);

  assertIncludes("route lock", adminRoutes, [
    'router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs))',
  ]);
  assertNotIncludes("route writes", adminRoutes, [
    'router.post("/promotions",',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
    "/promotions/:id/dry-run",
  ]);
  assertNotIncludes("controller writes", adminController, [
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "simulatePromotionAdminDryRunAuditLedgerPlan",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "simulatePromotionAdminDryRunAuditLedgerPlan",
    "dryRunPromotion",
  ]);

  const readiness = buildPromotionAdminDryRunAuditLedgerReadiness();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36");
  assert.strictEqual(readiness.planType, "promotionAdminDryRunAuditLedgerPlan");
  assert.strictEqual(readiness.auditMode, "plan_only");
  assert.strictEqual(readiness.ledgerMode, "plan_only");
  assert.strictEqual(readiness.method, "POST");
  assert.strictEqual(readiness.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(readiness.status, "audit_ledger_readiness_only_not_mounted");
  assert.strictEqual(readiness.routeMounted, false);
  assert.strictEqual(readiness.expressMounted, false);
  assert.strictEqual(readiness.controllerMounted, false);
  assert.strictEqual(readiness.serviceMounted, false);
  assert.strictEqual(readiness.auditRuntimeEnabled, false);
  assert.strictEqual(readiness.ledgerRuntimeEnabled, false);
  assert.strictEqual(readiness.runtimeHandlerEnabled, false);
  assert.strictEqual(readiness.serviceRuntimeEnabled, false);
  assert.strictEqual(readiness.apiCallEnabled, false);
  assert.strictEqual(readiness.writeLocked, true);
  assert.strictEqual(readiness.previewOnly, false);
  assert.strictEqual(readiness.readinessOnly, true);
  assert.strictEqual(readiness.noDbWrite, true);
  assert.strictEqual(readiness.noPromotionUpdate, true);
  assert.strictEqual(readiness.noAuditRowCreation, true);
  assert.strictEqual(readiness.noLedgerCreation, true);
  assert.strictEqual(readiness.noTurnoverCreation, true);
  assert.strictEqual(readiness.noClaimExecution, true);
  assert.strictEqual(readiness.noRuntimeCreditAction, true);
  assert.strictEqual(readiness.auditLedgerReadiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36");
  assert.strictEqual(readiness.auditLedgerReadiness.servicePhase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35");
  assert.strictEqual(readiness.auditLedgerReadiness.controllerPhase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34");
  assert.strictEqual(readiness.auditLedgerReadiness.routePhase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33");
  assert.strictEqual(readiness.auditLedgerReadiness.auditPlanStatus, "audit_plan_only_not_mounted");
  assert.strictEqual(readiness.auditLedgerReadiness.ledgerPlanStatus, "ledger_plan_only_not_mounted");
  assert.strictEqual(readiness.auditLedgerReadiness.auditRuntimeStatus, "audit_runtime_not_enabled");
  assert.strictEqual(readiness.auditLedgerReadiness.ledgerRuntimeStatus, "ledger_runtime_not_enabled");
  assert(readiness.auditLedgerReadiness.requiredAuditFields.includes("auditReason"));
  assert(readiness.auditLedgerReadiness.requiredAuditFields.includes("riskAcknowledgement"));
  assert(readiness.auditLedgerReadiness.requiredLedgerFields.includes("riskSummary"));
  assert(readiness.auditLedgerReadiness.requiredLedgerFields.includes("safetyFlags"));
  assert.strictEqual(readiness.auditPlan.plannedOnly, true);
  assert.strictEqual(readiness.auditPlan.auditRowCreated, false);
  assert.strictEqual(readiness.ledgerPlan.plannedOnly, true);
  assert.strictEqual(readiness.ledgerPlan.ledgerCreated, false);
  assert.strictEqual(readiness.ledgerPlan.turnoverRequirementCreated, false);
  assert.strictEqual(readiness.ledgerPlan.runtimeCreditActionCreated, false);

  const validWrite = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest({
      after: { title: "New Year Promo Updated" },
      auditReason: "title refresh",
    })
  );
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.ok, true);
  assert.strictEqual(validWrite.body.planType, "promotionAdminDryRunAuditLedgerPlan");
  assert.strictEqual(validWrite.body.auditMode, "plan_only");
  assert.strictEqual(validWrite.body.ledgerMode, "plan_only");
  assert.strictEqual(validWrite.body.writeLocked, true);
  assert.strictEqual(validWrite.body.auditRowCreated, false);
  assert.strictEqual(validWrite.body.ledgerCreated, false);
  assert.strictEqual(validWrite.body.turnoverRequirementCreated, false);
  assert.strictEqual(validWrite.body.runtimeCreditActionCreated, false);
  assert.strictEqual(validWrite.body.serviceOperation, "dryRunPromotionUpdateService");
  assert.strictEqual(validWrite.body.serviceMode, "validate_only");
  assert.strictEqual(validWrite.body.controllerAction, "dryRunPromotionUpdate");
  assert.strictEqual(validWrite.body.promotionId, "promo-123");
  assert.strictEqual(validWrite.body.validator, "validatePromotionAdminWriteDryRun");
  assertCommonResponseFlags(validWrite);
  assert.strictEqual(validWrite.body.auditLedgerReadiness.auditPlanStatus, "audit_plan_only_not_mounted");
  assert.strictEqual(validWrite.body.auditPlan.wouldRecordAuditReason, "title refresh");
  assert(Array.isArray(validWrite.body.auditPlan.wouldRecordDiffSummary));
  assert(validWrite.body.auditPlan.wouldRecordValidationOutcome === "validated_ok");
  assert(validWrite.body.ledgerPlan.wouldRecordSafetyFlags.noAuditRowCreation === true);

  const validManage = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest(
      {
        after: { title: "New Year Promo Manage" },
        auditReason: "manage refresh",
        auditMode: "write",
        ledgerMode: "write",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.manage"],
      }
    )
  );
  assert.strictEqual(validManage.status, 200);
  assert.strictEqual(validManage.body.ok, true);
  assert.strictEqual(validManage.auditMode, "plan_only");
  assert.strictEqual(validManage.ledgerMode, "plan_only");
  assert.strictEqual(validManage.body.auditMode, "plan_only");
  assert.strictEqual(validManage.body.ledgerMode, "plan_only");
  assertCommonResponseFlags(validManage);

  const wrongPlanType = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest({
      planType: "otherPlanType",
      after: { title: "Wrong Plan Promo" },
      auditReason: "wrong plan",
    })
  );
  assert.strictEqual(wrongPlanType.status, 404);
  assert.strictEqual(wrongPlanType.body.code, "PROMOTION_DRY_RUN_AUDIT_LEDGER_PLAN_NOT_MOUNTED");
  assertCommonResponseFlags(wrongPlanType);

  const wrongOperation = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest({
      operation: "otherOperation",
      after: { title: "Wrong Operation Promo" },
      auditReason: "wrong operation",
    })
  );
  assert.strictEqual(wrongOperation.status, 404);
  assert.strictEqual(wrongOperation.body.code, "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongOperation);

  const wrongControllerAction = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest({
      action: "otherAction",
      after: { title: "Wrong Action Promo" },
      auditReason: "wrong action",
    })
  );
  assert.strictEqual(wrongControllerAction.status, 404);
  assert.strictEqual(wrongControllerAction.body.code, "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongControllerAction);

  const wrongMethod = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest(
      {
        after: { title: "Wrong Method Promo" },
        auditReason: "method check",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      "GET"
    )
  );
  assert.strictEqual(wrongMethod.status, 405);
  assert.strictEqual(wrongMethod.body.code, "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED");
  assertCommonResponseFlags(wrongMethod);

  const wrongPath = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest(
      {
        after: { title: "Wrong Path Promo" },
        auditReason: "path check",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      "POST",
      "/api/admin/promotions"
    )
  );
  assert.strictEqual(wrongPath.status, 404);
  assert.strictEqual(wrongPath.body.code, "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED");
  assertCommonResponseFlags(wrongPath);

  const forbidden = simulatePromotionAdminDryRunAuditLedgerPlan(
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
  assert.strictEqual(forbidden.status, 403);
  assert.strictEqual(forbidden.body.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(forbidden);

  const missingAuditReason = simulatePromotionAdminDryRunAuditLedgerPlan(
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
  assert.strictEqual(missingAuditReason.status, 422);
  assert.strictEqual(missingAuditReason.body.code, "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED");
  assertCommonResponseFlags(missingAuditReason);

  const missingRiskAck = simulatePromotionAdminDryRunAuditLedgerPlan(
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
  assert.strictEqual(missingRiskAck.status, 422);
  assert.strictEqual(missingRiskAck.body.code, "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED");
  assertCommonResponseFlags(missingRiskAck);
  assert(Array.isArray(missingRiskAck.body.diff));
  assert(missingRiskAck.body.diff.some((item) => item.field === "bonusValue"));

  const negativeNumeric = simulatePromotionAdminDryRunAuditLedgerPlan(
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
  assert.strictEqual(negativeNumeric.status, 422);
  assert.strictEqual(negativeNumeric.body.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(negativeNumeric);
  assert(negativeNumeric.body.errors.some((item) => /non-negative/i.test(item)));

  const modeFallback = simulatePromotionAdminDryRunAuditLedgerPlan(
    makeRequest(
      {
        after: { title: "Mode Fallback Promo" },
        auditReason: "mode fallback",
        auditMode: "write",
        ledgerMode: "write",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(modeFallback.auditMode, "plan_only");
  assert.strictEqual(modeFallback.ledgerMode, "plan_only");
  assert.strictEqual(modeFallback.body.auditMode, "plan_only");
  assert.strictEqual(modeFallback.body.ledgerMode, "plan_only");
  assertCommonResponseFlags(modeFallback);

  console.log("Backoffice promotion admin dry-run audit ledger readiness package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run audit ledger readiness module export: PASS");
  console.log("Backoffice promotion admin dry-run audit ledger readiness metadata: PASS");
  console.log("Backoffice promotion admin dry-run audit ledger readiness request simulation: PASS");
  console.log("Backoffice promotion admin dry-run audit ledger readiness boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run audit ledger readiness smoke: PASS");
}

main();
