const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunServiceReadiness,
  simulatePromotionAdminDryRunServiceOperation,
} = require("../utils/promotionAdminDryRunServiceReadiness");

const ROOT = path.resolve(__dirname, "..", "..");
const SERVICE_READINESS_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunServiceReadiness.js");

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
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.routeMounted, false);
  assert.strictEqual(response.expressMounted, false);
  assert.strictEqual(response.controllerMounted, false);
  assert.strictEqual(response.serviceMounted, false);
  assert.strictEqual(response.runtimeHandlerEnabled, false);
  assert.strictEqual(response.serviceRuntimeEnabled, false);
  assert.strictEqual(response.apiCallEnabled, false);
  assert.strictEqual(response.writeLocked, true);
  assert.strictEqual(response.previewOnly, false);
  assert.strictEqual(response.readinessOnly, true);
  assert.strictEqual(response.noDbWrite, true);
  assert.strictEqual(response.noPromotionUpdate, true);
  assert.strictEqual(response.noLedgerCreation, true);
  assert.strictEqual(response.noTurnoverCreation, true);
  assert.strictEqual(response.noClaimExecution, true);
  assert.strictEqual(response.noRuntimeCreditAction, true);
  assert(response.serviceReadiness && response.serviceReadiness.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35", "serviceReadiness should carry phase metadata.");
  assert(response.serviceReadiness.controllerPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34", "serviceReadiness should carry controller phase metadata.");
  assert(response.serviceReadiness.routePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33", "serviceReadiness should carry route phase metadata.");
  assert(response.safetyFlags && response.safetyFlags.noPromotionUpdate === true, "safetyFlags should include noPromotionUpdate.");
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
  const serviceSource = read("src/utils/promotionAdminDryRunServiceReadiness.js");
  const controllerSource = read("src/utils/promotionAdminDryRunControllerReadiness.js");
  const routeSource = read("src/utils/promotionAdminDryRunRouteReadiness.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-service-readiness",
    "backofficePromotionAdminDryRunServiceReadinessSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunServiceReadinessSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-service-readiness",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35",
    "service readiness only",
    "service runtime not enabled",
    "service not mounted",
    "no Express mount",
    "no API call",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35",
    "service readiness",
    "service readiness only",
    "not mounted",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("service readiness source markers", serviceSource, [
    "buildPromotionAdminDryRunServiceReadiness",
    "simulatePromotionAdminDryRunServiceOperation",
    "service_readiness_only_not_mounted",
    "serviceMounted: false",
    "serviceRuntimeEnabled: false",
    "noPromotionUpdate: true",
    "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED",
    "controllerReadiness",
    "serviceReadiness",
  ]);

  assertIncludes("service readiness source dependencies", serviceSource, [
    'require("./promotionAdminDryRunControllerReadiness")',
    'require("./promotionAdminDryRunApiContract")',
  ]);

  assertNotIncludes("service readiness forbidden imports", serviceSource, [
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

  assertNoSecretShape("service readiness source", serviceSource);
  assertNoSecretShape("controller readiness source", controllerSource);
  assertNoSecretShape("route readiness source", routeSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("service readiness path", SERVICE_READINESS_PATH);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run service readiness",
    "service readiness only",
    "service runtime not enabled",
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
    "simulatePromotionAdminDryRunServiceOperation",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "simulatePromotionAdminDryRunServiceOperation",
    "dryRunPromotion",
  ]);

  const readiness = buildPromotionAdminDryRunServiceReadiness();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35");
  assert.strictEqual(readiness.serviceOperation, "dryRunPromotionUpdateService");
  assert.strictEqual(readiness.serviceMode, "validate_only");
  assert.strictEqual(readiness.method, "POST");
  assert.strictEqual(readiness.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(readiness.status, "service_readiness_only_not_mounted");
  assert.strictEqual(readiness.routeMounted, false);
  assert.strictEqual(readiness.expressMounted, false);
  assert.strictEqual(readiness.controllerMounted, false);
  assert.strictEqual(readiness.serviceMounted, false);
  assert.strictEqual(readiness.runtimeHandlerEnabled, false);
  assert.strictEqual(readiness.serviceRuntimeEnabled, false);
  assert.strictEqual(readiness.apiCallEnabled, false);
  assert.strictEqual(readiness.writeLocked, true);
  assert.strictEqual(readiness.previewOnly, false);
  assert.strictEqual(readiness.readinessOnly, true);
  assert.strictEqual(readiness.noDbWrite, true);
  assert.strictEqual(readiness.noPromotionUpdate, true);
  assert.strictEqual(readiness.noLedgerCreation, true);
  assert.strictEqual(readiness.noTurnoverCreation, true);
  assert.strictEqual(readiness.noClaimExecution, true);
  assert.strictEqual(readiness.noRuntimeCreditAction, true);
  assert(readiness.serviceReadiness.requiredGuards.includes("adminAuth"));
  assert(readiness.serviceReadiness.requiredGuards.includes("siteAccess"));
  assert(readiness.serviceReadiness.requiredGuards.includes("settings.promotion.write or settings.promotion.manage"));
  assert(readiness.serviceReadiness.requiredGuards.includes("auditReason required"));
  assert(readiness.serviceReadiness.requiredGuards.includes("riskAcknowledgement required when risky fields change"));
  assert.strictEqual(readiness.serviceReadiness.contractStatus, "contract_only_not_mounted");
  assert.strictEqual(readiness.serviceReadiness.runtimeHandlerStatus, "service_runtime_handler_not_enabled");
  assert.strictEqual(readiness.serviceReadiness.serviceRuntimeStatus, "service_runtime_handler_not_enabled");

  const validWrite = simulatePromotionAdminDryRunServiceOperation(
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
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.ok, true);
  assert.strictEqual(validWrite.body.mode, "dry_run");
  assert.strictEqual(validWrite.body.writeLocked, true);
  assert.strictEqual(validWrite.body.routeMounted, false);
  assert.strictEqual(validWrite.body.serviceOperation, "dryRunPromotionUpdateService");
  assert.strictEqual(validWrite.body.serviceMode, "validate_only");
  assert.strictEqual(validWrite.body.controllerAction, "dryRunPromotionUpdate");
  assert.strictEqual(validWrite.body.promotionId, "promo-123");
  assert.strictEqual(validWrite.body.validator, "validatePromotionAdminWriteDryRun");
  assertCommonResponseFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunServiceOperation(
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
  assert.strictEqual(validManage.status, 200);
  assert.strictEqual(validManage.body.ok, true);
  assertCommonResponseFlags(validManage);

  const wrongOperation = simulatePromotionAdminDryRunServiceOperation(
    makeRequest(
      {
        operation: "otherOperation",
        after: { title: "Wrong Operation Promo" },
        auditReason: "wrong operation",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(wrongOperation.status, 404);
  assert.strictEqual(wrongOperation.body.code, "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongOperation);

  const wrongControllerAction = simulatePromotionAdminDryRunServiceOperation(
    makeRequest(
      {
        action: "otherAction",
        after: { title: "Wrong Action Promo" },
        auditReason: "wrong action",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(wrongControllerAction.status, 404);
  assert.strictEqual(wrongControllerAction.body.code, "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongControllerAction);

  const wrongMethod = simulatePromotionAdminDryRunServiceOperation(
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

  const wrongPath = simulatePromotionAdminDryRunServiceOperation(
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

  const forbidden = simulatePromotionAdminDryRunServiceOperation(
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

  const missingAuditReason = simulatePromotionAdminDryRunServiceOperation(
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

  const missingRiskAck = simulatePromotionAdminDryRunServiceOperation(
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

  const negativeNumeric = simulatePromotionAdminDryRunServiceOperation(
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

  const modeFallback = simulatePromotionAdminDryRunServiceOperation(
    makeRequest(
      {
        after: { title: "Mode Fallback Promo" },
        auditReason: "mode fallback",
        serviceMode: "write",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(modeFallback.serviceMode, "validate_only");
  assert.strictEqual(modeFallback.body.serviceMode, "validate_only");
  assertCommonResponseFlags(modeFallback);

  console.log("Backoffice promotion admin dry-run service readiness package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run service readiness module export: PASS");
  console.log("Backoffice promotion admin dry-run service readiness metadata: PASS");
  console.log("Backoffice promotion admin dry-run service readiness request simulation: PASS");
  console.log("Backoffice promotion admin dry-run service readiness boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run service readiness smoke: PASS");
}

main();
