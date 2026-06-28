const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunControllerReadiness,
  simulatePromotionAdminDryRunControllerAction,
} = require("../utils/promotionAdminDryRunControllerReadiness");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTROLLER_READINESS_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunControllerReadiness.js");

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
    action: changes.action || "dryRunPromotionUpdate",
    responseMode: changes.responseMode,
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
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.routeMounted, false);
  assert.strictEqual(response.expressMounted, false);
  assert.strictEqual(response.controllerMounted, false);
  assert.strictEqual(response.runtimeHandlerEnabled, false);
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
  assert(response.controllerReadiness && response.controllerReadiness.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34", "controllerReadiness should carry phase metadata.");
  assert(response.controllerReadiness.routePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33", "controllerReadiness should carry route phase metadata.");
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
  const controllerSource = read("src/utils/promotionAdminDryRunControllerReadiness.js");
  const routeSource = read("src/utils/promotionAdminDryRunRouteReadiness.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-controller-readiness",
    "backofficePromotionAdminDryRunControllerReadinessSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunControllerReadinessSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-controller-readiness",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34",
    "controller readiness only",
    "runtime handler not enabled",
    "controller not mounted",
    "no Express mount",
    "no API call",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34",
    "controller readiness",
    "controller readiness only",
    "not mounted",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("controller readiness source markers", controllerSource, [
    "buildPromotionAdminDryRunControllerReadiness",
    "simulatePromotionAdminDryRunControllerAction",
    "controller_readiness_only_not_mounted",
    "controllerMounted: false",
    "runtimeHandlerEnabled: false",
    "apiCallEnabled: false",
    "noPromotionUpdate: true",
    "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED",
    "routeReadiness",
    "controllerReadiness",
  ]);

  assertIncludes("controller readiness source dependencies", controllerSource, [
    'require("./promotionAdminDryRunRouteReadiness")',
    'require("./promotionAdminDryRunApiContract")',
  ]);

  assertNotIncludes("controller readiness forbidden imports", controllerSource, [
    'require("../config/prisma")',
    'require("../controllers/',
    'require("../services/',
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "process.env",
    "res.",
    "req.",
    'require("express")',
    'from "express"',
  ]);

  assertNoSecretShape("controller readiness source", controllerSource);
  assertNoSecretShape("route readiness source", routeSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("controller readiness path", CONTROLLER_READINESS_PATH);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run controller readiness",
    "controller readiness only",
    "runtime handler not enabled",
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
    "simulatePromotionAdminDryRunControllerAction",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service writes", promotionService, [
    "createAdminPromotion",
    "updateAdminPromotion",
    "deleteAdminPromotion",
    "createPromotionConfig",
    "updatePromotionConfig",
    "deletePromotionConfig",
    "simulatePromotionAdminDryRunControllerAction",
    "dryRunPromotion",
  ]);

  const readiness = buildPromotionAdminDryRunControllerReadiness();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34");
  assert.strictEqual(readiness.controllerAction, "dryRunPromotionUpdate");
  assert.strictEqual(readiness.method, "POST");
  assert.strictEqual(readiness.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(readiness.status, "controller_readiness_only_not_mounted");
  assert.strictEqual(readiness.routeMounted, false);
  assert.strictEqual(readiness.expressMounted, false);
  assert.strictEqual(readiness.controllerMounted, false);
  assert.strictEqual(readiness.runtimeHandlerEnabled, false);
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
  assert(readiness.controllerReadiness.requiredGuards.includes("adminAuth"));
  assert(readiness.controllerReadiness.requiredGuards.includes("siteAccess"));
  assert(readiness.controllerReadiness.requiredGuards.includes("settings.promotion.write or settings.promotion.manage"));
  assert(readiness.controllerReadiness.requiredGuards.includes("auditReason required"));
  assert(readiness.controllerReadiness.requiredGuards.includes("riskAcknowledgement required when risky fields change"));
  assert.strictEqual(readiness.controllerReadiness.contractStatus, "contract_only_not_mounted");
  assert.strictEqual(readiness.controllerReadiness.runtimeHandlerStatus, "controller_runtime_handler_not_enabled");
  assert.strictEqual(readiness.safetyFlags.noPromotionUpdate, true);

  const validWrite = simulatePromotionAdminDryRunControllerAction(
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
  assert.strictEqual(validWrite.body.promotionId, "promo-123");
  assert.strictEqual(validWrite.body.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(validWrite.body.controllerAction, "dryRunPromotionUpdate");
  assert.strictEqual(validWrite.responseMode, "json");
  assert.strictEqual(validWrite.headers["content-type"], "application/json; charset=utf-8");
  assertCommonResponseFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunControllerAction(
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

  const wrongAction = simulatePromotionAdminDryRunControllerAction(
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
  assert.strictEqual(wrongAction.status, 404);
  assert.strictEqual(wrongAction.body.code, "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongAction);

  const wrongMethod = simulatePromotionAdminDryRunControllerAction(
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

  const wrongPath = simulatePromotionAdminDryRunControllerAction(
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

  const forbidden = simulatePromotionAdminDryRunControllerAction(
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

  const missingId = simulatePromotionAdminDryRunControllerAction({
    ...makeRequest(
      {
        after: { title: "Missing Id Promo" },
        auditReason: "missing id",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    ),
    request: {
      ...makeRequest(
        {
          after: { title: "Missing Id Promo" },
          auditReason: "missing id",
        },
        {
          permissions: ["settings.promotion.view", "settings.promotion.write"],
        }
      ).request,
      params: {},
    },
  });
  assert.strictEqual(missingId.status, 400);
  assert.strictEqual(missingId.body.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(missingId);

  const missingAuditReason = simulatePromotionAdminDryRunControllerAction(
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

  const missingRiskAck = simulatePromotionAdminDryRunControllerAction(
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

  const negativeNumeric = simulatePromotionAdminDryRunControllerAction(
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

  const renderModeFallback = simulatePromotionAdminDryRunControllerAction(
    makeRequest(
      {
        after: { title: "Render Mode Promo" },
        auditReason: "render fallback",
        responseMode: "render",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(renderModeFallback.responseMode, "json");
  assert.strictEqual(renderModeFallback.headers["content-type"], "application/json; charset=utf-8");
  assert.strictEqual(renderModeFallback.body.responseMode, "json");
  assert.strictEqual(renderModeFallback.body.html, undefined);
  assertCommonResponseFlags(renderModeFallback);

  console.log("Backoffice promotion admin dry-run controller readiness package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run controller readiness module export: PASS");
  console.log("Backoffice promotion admin dry-run controller readiness metadata: PASS");
  console.log("Backoffice promotion admin dry-run controller readiness request simulation: PASS");
  console.log("Backoffice promotion admin dry-run controller readiness boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run controller readiness smoke: PASS");
}

main();
