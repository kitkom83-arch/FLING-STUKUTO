const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunRuntimePreflight,
  simulatePromotionAdminDryRunRuntimePreflight,
} = require("../utils/promotionAdminDryRunRuntimePreflight");

const ROOT = path.resolve(__dirname, "..", "..");
const RUNTIME_PREFLIGHT_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunRuntimePreflight.js");

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

function makeRequest(overrides, runtimeChecks, operatorApproval) {
  return {
    preflightType: overrides && Object.prototype.hasOwnProperty.call(overrides, "preflightType")
      ? overrides.preflightType
      : "promotionAdminDryRunRuntimePreflight",
    preflightMode: overrides && Object.prototype.hasOwnProperty.call(overrides, "preflightMode")
      ? overrides.preflightMode
      : "readiness_only",
    auditLedgerReadiness: {
      phase: "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36",
    },
    runtimeChecks: Object.assign(
      {
        routeMount: false,
        controllerRuntime: false,
        serviceRuntime: false,
        auditRuntime: false,
        ledgerRuntime: false,
        dbWrite: false,
        promotionUpdate: false,
        providerOutbound: false,
        productionDeploy: false,
      },
      runtimeChecks || {}
    ),
    operatorApproval: Object.assign(
      {
        approved: false,
        reason: "not approved",
      },
      operatorApproval || {}
    ),
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
  assert.strictEqual(response.canMountRoute, false);
  assert.strictEqual(response.canEnableControllerRuntime, false);
  assert.strictEqual(response.canEnableServiceRuntime, false);
  assert.strictEqual(response.canEnableAuditRuntime, false);
  assert.strictEqual(response.canEnableLedgerRuntime, false);
  assert.strictEqual(response.canEnableDbWrite, false);
  assert.strictEqual(response.canEnablePromotionUpdate, false);
  assert.strictEqual(response.canEnableProviderOutbound, false);
  assert.strictEqual(response.canEnableProductionDeploy, false);
  assert.strictEqual(response.noDbWrite, true);
  assert.strictEqual(response.noPromotionUpdate, true);
  assert.strictEqual(response.noAuditRowCreation, true);
  assert.strictEqual(response.noLedgerCreation, true);
  assert.strictEqual(response.noTurnoverCreation, true);
  assert.strictEqual(response.noClaimExecution, true);
  assert.strictEqual(response.noRuntimeCreditAction, true);
  assert(response.runtimePreflight && response.runtimePreflight.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37", "runtimePreflight should carry phase metadata.");
  assert(response.runtimePreflight.auditLedgerPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36", "runtimePreflight should carry audit ledger phase metadata.");
  assert(response.runtimePreflight.servicePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35", "runtimePreflight should carry service phase metadata.");
  assert(response.runtimePreflight.controllerPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34", "runtimePreflight should carry controller phase metadata.");
  assert(response.runtimePreflight.routePhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33", "runtimePreflight should carry route phase metadata.");
  assert(response.safetyFlags && response.safetyFlags.noProviderOutbound === true, "safetyFlags should include noProviderOutbound.");
  assert(response.safetyFlags && response.safetyFlags.noProductionDeploy === true, "safetyFlags should include noProductionDeploy.");
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const moduleSource = read("src/utils/promotionAdminDryRunRuntimePreflight.js");
  const auditLedgerSource = read("src/utils/promotionAdminDryRunAuditLedgerReadiness.js");
  const serviceSource = read("src/utils/promotionAdminDryRunServiceReadiness.js");
  const controllerSource = read("src/utils/promotionAdminDryRunControllerReadiness.js");
  const routeSource = read("src/utils/promotionAdminDryRunRouteReadiness.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-runtime-preflight",
    "backofficePromotionAdminDryRunRuntimePreflightSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunRuntimePreflightSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-runtime-preflight",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37",
    "runtime preflight readiness only",
    "readiness only",
    "not mounted",
    "validate-only",
    "write locked",
    "no provider outbound",
    "no production deploy",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37",
    "runtime preflight readiness only",
    "readiness only",
    "write locked",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run runtime preflight",
    "runtime preflight readiness only",
    "readiness only",
    "not mounted",
    "validate-only",
    "write locked",
    "no DB write",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "no provider outbound",
    "no production deploy",
  ]);

  assertIncludes("module markers", moduleSource, [
    "buildPromotionAdminDryRunRuntimePreflight",
    "simulatePromotionAdminDryRunRuntimePreflight",
    "runtime_preflight_readiness_only_not_mounted",
    "promotionAdminDryRunRuntimePreflight",
    "canEnableProviderOutbound: false",
    "canEnableProductionDeploy: false",
    "noProviderOutbound: true",
    "noProductionDeploy: true",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunAuditLedgerReadiness")',
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

  assertNoSecretShape("runtime preflight source", moduleSource);
  assertNoSecretShape("audit ledger readiness source", auditLedgerSource);
  assertNoSecretShape("service readiness source", serviceSource);
  assertNoSecretShape("controller readiness source", controllerSource);
  assertNoSecretShape("route readiness source", routeSource);
  assertNoSecretShape("contract source", contractSource);
  assertNoSecretShape("runtime preflight path", RUNTIME_PREFLIGHT_PATH);

  const readiness = buildPromotionAdminDryRunRuntimePreflight();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37");
  assert.strictEqual(readiness.preflightType, "promotionAdminDryRunRuntimePreflight");
  assert.strictEqual(readiness.preflightMode, "readiness_only");
  assert.strictEqual(readiness.method, "POST");
  assert.strictEqual(readiness.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(readiness.status, "runtime_preflight_readiness_only_not_mounted");
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
  assert.strictEqual(readiness.canMountRoute, false);
  assert.strictEqual(readiness.canEnableControllerRuntime, false);
  assert.strictEqual(readiness.canEnableServiceRuntime, false);
  assert.strictEqual(readiness.canEnableAuditRuntime, false);
  assert.strictEqual(readiness.canEnableLedgerRuntime, false);
  assert.strictEqual(readiness.canEnableDbWrite, false);
  assert.strictEqual(readiness.canEnablePromotionUpdate, false);
  assert.strictEqual(readiness.canEnableProviderOutbound, false);
  assert.strictEqual(readiness.canEnableProductionDeploy, false);
  assert.strictEqual(readiness.noDbWrite, true);
  assert.strictEqual(readiness.noPromotionUpdate, true);
  assert.strictEqual(readiness.noAuditRowCreation, true);
  assert.strictEqual(readiness.noLedgerCreation, true);
  assert.strictEqual(readiness.noTurnoverCreation, true);
  assert.strictEqual(readiness.noClaimExecution, true);
  assert.strictEqual(readiness.noRuntimeCreditAction, true);
  assert(readiness.runtimePreflight.requiredPreflightFields.includes("preflightType"));
  assert(readiness.runtimePreflight.requiredPreflightFields.includes("runtimeChecks"));
  assert(readiness.runtimePreflight.requiredRuntimeChecks.includes("providerOutbound"));
  assert(readiness.runtimePreflight.requiredRuntimeChecks.includes("productionDeploy"));

  const valid = simulatePromotionAdminDryRunRuntimePreflight(
    makeRequest(
      { preflightMode: "readiness_only" },
      {
        routeMount: true,
        controllerRuntime: true,
        serviceRuntime: true,
        auditRuntime: true,
        ledgerRuntime: true,
        dbWrite: true,
        promotionUpdate: true,
        providerOutbound: true,
        productionDeploy: true,
      },
      {
        approved: true,
        reason: "operator approved runtime preflight review",
      }
    )
  );
  assert.strictEqual(valid.status, 200);
  assert.strictEqual(valid.body.ok, true);
  assert.strictEqual(valid.body.preflightType, "promotionAdminDryRunRuntimePreflight");
  assert.strictEqual(valid.body.preflightMode, "readiness_only");
  assert.strictEqual(valid.body.runtimePreflight.status, "runtime_preflight_readiness_only_not_mounted");
  assert.strictEqual(valid.body.canMountRoute, false);
  assert.strictEqual(valid.body.canEnableControllerRuntime, false);
  assert.strictEqual(valid.body.canEnableServiceRuntime, false);
  assert.strictEqual(valid.body.canEnableAuditRuntime, false);
  assert.strictEqual(valid.body.canEnableLedgerRuntime, false);
  assert.strictEqual(valid.body.canEnableDbWrite, false);
  assert.strictEqual(valid.body.canEnablePromotionUpdate, false);
  assert.strictEqual(valid.body.canEnableProviderOutbound, false);
  assert.strictEqual(valid.body.canEnableProductionDeploy, false);
  assert.strictEqual(valid.body.runtimePreflight.operatorApproval.approved, true);
  assert(Array.isArray(valid.body.blockingReasons));
  assert(valid.body.blockingReasons.some((item) => /route mount remains disabled/i.test(item)));
  assert(valid.body.blockingReasons.some((item) => /provider outbound remains disabled/i.test(item)));
  assert(valid.body.blockingReasons.some((item) => /production deploy remains disabled/i.test(item)));
  assert(valid.body.blockingReasons.some((item) => /operator approval does not enable runtime/i.test(item)));
  assertCommonResponseFlags(valid);

  const wrongType = simulatePromotionAdminDryRunRuntimePreflight(
    makeRequest(
      { preflightType: "otherRuntimePreflight" },
      {
        routeMount: true,
      }
    )
  );
  assert.strictEqual(wrongType.status, 404);
  assert.strictEqual(wrongType.body.code, "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_NOT_MOUNTED");
  assertCommonResponseFlags(wrongType);

  const wrongMode = simulatePromotionAdminDryRunRuntimePreflight(
    makeRequest(
      { preflightMode: "write" },
      {
        routeMount: true,
      }
    )
  );
  assert.strictEqual(wrongMode.status, 404);
  assert.strictEqual(wrongMode.body.code, "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_MODE_NOT_MOUNTED");
  assertCommonResponseFlags(wrongMode);

  const neutral = simulatePromotionAdminDryRunRuntimePreflight(makeRequest({}, {}, { approved: false }));
  assert.strictEqual(neutral.status, 200);
  assert.strictEqual(neutral.body.ok, true);
  assert.strictEqual(neutral.body.blockingReasons.some((item) => /runtime preflight is intentionally unmounted/i.test(item)), true);
  assertCommonResponseFlags(neutral);

  console.log("Backoffice promotion admin dry-run runtime preflight package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run runtime preflight module export: PASS");
  console.log("Backoffice promotion admin dry-run runtime preflight metadata: PASS");
  console.log("Backoffice promotion admin dry-run runtime preflight request simulation: PASS");
  console.log("Backoffice promotion admin dry-run runtime preflight boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run runtime preflight smoke: PASS");
}

main();
