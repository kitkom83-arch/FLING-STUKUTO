const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunMountAuthorization,
  simulatePromotionAdminDryRunMountAuthorization,
} = require("../utils/promotionAdminDryRunMountAuthorization");

const ROOT = path.resolve(__dirname, "..", "..");
const MODULE_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunMountAuthorization.js");

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

function makeRequest(options) {
  const input = options || {};
  const actorPermissions = Object.prototype.hasOwnProperty.call(input, "permissions")
    ? input.permissions
    : ["settings.promotion.write"];
  const changedField = input.changedField || "title";
  const before = {
    title: "Old promo",
    type: "deposit",
    status: "active",
    minDeposit: 100,
    maxDeposit: 500,
    bonusValue: 10,
    turnoverMultiplier: 1,
    maxWithdraw: 1000,
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-06-30T23:59:59.000Z",
    bonusType: "fixed",
  };
  const after = Object.assign({}, before);

  if (changedField === "title") after.title = "New promo";
  if (changedField === "status") after.status = "paused";
  if (changedField === "bonusValue") after.bonusValue = 25;
  if (changedField === "minDeposit") after.minDeposit = 150;

  if (input.after) Object.assign(after, input.after);
  if (input.before) Object.assign(before, input.before);

  return {
    authorizationType: Object.prototype.hasOwnProperty.call(input, "authorizationType")
      ? input.authorizationType
      : "promotionAdminDryRunMountAuthorization",
    runtimePreflight: {
      preflightType: Object.prototype.hasOwnProperty.call(input, "preflightType")
        ? input.preflightType
        : "promotionAdminDryRunRuntimePreflight",
      preflightMode: Object.prototype.hasOwnProperty.call(input, "preflightMode")
        ? input.preflightMode
        : "readiness_only",
      auditLedgerPlan: {
        planType: Object.prototype.hasOwnProperty.call(input, "planType")
          ? input.planType
          : "promotionAdminDryRunAuditLedgerPlan",
        serviceOperation: {
          operation: Object.prototype.hasOwnProperty.call(input, "operation")
            ? input.operation
            : "dryRunPromotionUpdateService",
          controllerAction: {
            action: Object.prototype.hasOwnProperty.call(input, "action")
              ? input.action
              : "dryRunPromotionUpdate",
            request: {
              method: Object.prototype.hasOwnProperty.call(input, "method") ? input.method : "POST",
              path: Object.prototype.hasOwnProperty.call(input, "path")
                ? input.path
                : "/api/admin/promotions/:id/dry-run",
              params: Object.assign(
                { id: "promo-1" },
                Object.prototype.hasOwnProperty.call(input, "params") ? input.params : {}
              ),
              actor: {
                id: "admin-1",
                permissions: actorPermissions,
              },
              body: {
                before,
                after,
                auditReason: Object.prototype.hasOwnProperty.call(input, "auditReason")
                  ? input.auditReason
                  : "manual review",
                riskAcknowledgement: Object.prototype.hasOwnProperty.call(input, "riskAcknowledgement")
                  ? input.riskAcknowledgement
                  : false,
              },
            },
          },
        },
      },
      runtimeChecks: Object.assign({}, input.runtimeChecks || {}),
      operatorApproval: Object.assign(
        { approved: false, reason: "not approved" },
        input.operatorApproval || {}
      ),
    },
    mountRequest: Object.assign({ requested: false }, input.mountRequest || {}),
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.mountAuthorized, false);
  assert.strictEqual(response.mountGranted, false);
  assert.strictEqual(response.mountDenied, true);
  assert.strictEqual(response.canMountRoute, false);
  assert.strictEqual(response.canEnableRuntime, false);
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
  assert.strictEqual(response.noProviderOutbound, true);
  assert.strictEqual(response.noProductionDeploy, true);
  assert.strictEqual(response.auditRowCreated, false);
  assert.strictEqual(response.ledgerCreated, false);
  assert.strictEqual(response.turnoverRequirementCreated, false);
  assert.strictEqual(response.runtimeCreditActionCreated, false);
  assert(response.runtimePreflight && response.runtimePreflight.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37");
  assert(response.auditLedgerReadiness && response.auditLedgerReadiness.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36");
  assert(response.mountAuthorization && response.mountAuthorization.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38");
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const moduleSource = read("src/utils/promotionAdminDryRunMountAuthorization.js");
  const runtimePreflightSource = read("src/utils/promotionAdminDryRunRuntimePreflight.js");
  const auditLedgerSource = read("src/utils/promotionAdminDryRunAuditLedgerReadiness.js");
  const serviceSource = read("src/utils/promotionAdminDryRunServiceReadiness.js");
  const controllerSource = read("src/utils/promotionAdminDryRunControllerReadiness.js");
  const routeSource = read("src/utils/promotionAdminDryRunRouteReadiness.js");
  const previewSource = read("src/utils/promotionAdminDryRunUiPreview.js");
  const apiStubSource = read("src/utils/promotionAdminDryRunApiStub.js");
  const apiContractSource = read("src/utils/promotionAdminDryRunApiContract.js");
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-mount-authorization",
    "backofficePromotionAdminDryRunMountAuthorizationSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunMountAuthorizationSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-mount-authorization",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38",
    "mount authorization gate only",
    "mount not granted",
    "mount denied by default",
    "no provider outbound",
    "no production deploy",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38",
    "mount authorization gate only",
    "mount not granted",
    "mount denied by default",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run mount authorization",
    "mount authorization gate only",
    "mount not granted",
    "mount denied by default",
    "route not mounted",
    "runtime not enabled",
    "can mount route false",
    "can enable runtime false",
    "controller runtime not enabled",
    "service runtime not enabled",
    "audit runtime not enabled",
    "ledger runtime not enabled",
    "DB write not enabled",
    "provider outbound not enabled",
    "production deploy not enabled",
    "no DB write",
    "no promotion update",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
  ]);

  assertIncludes("module markers", moduleSource, [
    "buildPromotionAdminDryRunMountAuthorization",
    "simulatePromotionAdminDryRunMountAuthorization",
    "mount_authorization_gate_only_not_granted",
    "promotionAdminDryRunMountAuthorization",
    "PROMOTION_DRY_RUN_MOUNT_AUTHORIZATION_NOT_MOUNTED",
    "PROMOTION_DRY_RUN_FORBIDDEN",
    "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
    "MOUNT_AUTHORIZATION_GATE_ONLY",
    "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38",
    "RUNTIME_ENABLEMENT_NOT_ALLOWED_IN_PHASE_38",
    "canEnableProviderOutbound: false",
    "canEnableProductionDeploy: false",
    "noProviderOutbound: true",
    "noProductionDeploy: true",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunRuntimePreflight")',
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

  assertNoSecretShape("mount authorization source", moduleSource);
  assertNoSecretShape("runtime preflight source", runtimePreflightSource);
  assertNoSecretShape("audit ledger readiness source", auditLedgerSource);
  assertNoSecretShape("service readiness source", serviceSource);
  assertNoSecretShape("controller readiness source", controllerSource);
  assertNoSecretShape("route readiness source", routeSource);
  assertNoSecretShape("ui preview source", previewSource);
  assertNoSecretShape("api stub source", apiStubSource);
  assertNoSecretShape("api contract source", apiContractSource);
  assertNoSecretShape("write validator source", validatorSource);
  assertNoSecretShape("module path", MODULE_PATH);

  const readiness = buildPromotionAdminDryRunMountAuthorization();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38");
  assert.strictEqual(readiness.authorizationType, "promotionAdminDryRunMountAuthorization");
  assert.strictEqual(readiness.authorizationMode, "gate_only");
  assert.strictEqual(readiness.method, "POST");
  assert.strictEqual(readiness.path, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(readiness.status, "mount_authorization_gate_only_not_granted");
  assert.strictEqual(readiness.mountRequested, false);
  assert.strictEqual(readiness.mountAuthorization.authorizationStatus, "mount_authorization_gate_only_not_granted");
  assert.strictEqual(readiness.mountAuthorization.mountStatus, "mount_not_granted");
  assert(readiness.mountAuthorization.blockingReasons.includes("MOUNT_AUTHORIZATION_GATE_ONLY"));
  assert(readiness.mountAuthorization.blockingReasons.includes("MOUNT_NOT_GRANTED_BY_DEFAULT"));
  assertCommonResponseFlags(readiness);

  const validWrite = simulatePromotionAdminDryRunMountAuthorization(makeRequest());
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.ok, true);
  assert.strictEqual(validWrite.body.code, null);
  assert.strictEqual(validWrite.body.authorizationMode, "gate_only");
  assert.strictEqual(validWrite.body.mountRequested, false);
  assert.strictEqual(validWrite.body.mountAuthorized, false);
  assert.strictEqual(validWrite.body.mountGranted, false);
  assert.strictEqual(validWrite.body.mountDenied, true);
  assert.strictEqual(validWrite.body.mountAuthorization.authorizationStatus, "mount_authorization_gate_only_not_granted");
  assert.strictEqual(validWrite.body.mountAuthorization.mountStatus, "mount_not_granted");
  assert(validWrite.body.blockingReasons.includes("MOUNT_AUTHORIZATION_GATE_ONLY"));
  assert(validWrite.body.blockingReasons.includes("MOUNT_NOT_GRANTED_BY_DEFAULT"));
  assertCommonResponseFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ permissions: ["settings.promotion.manage"] })
  );
  assert.strictEqual(validManage.status, 200);
  assert.strictEqual(validManage.body.ok, true);
  assertCommonResponseFlags(validManage);

  const wrongType = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ authorizationType: "otherMountAuthorization" })
  );
  assert.strictEqual(wrongType.status, 404);
  assert.strictEqual(wrongType.body.code, "PROMOTION_DRY_RUN_MOUNT_AUTHORIZATION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongType);

  const wrongPreflightType = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ preflightType: "otherRuntimePreflight" })
  );
  assert.strictEqual(wrongPreflightType.status, 404);
  assert.strictEqual(wrongPreflightType.body.code, "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_NOT_MOUNTED");
  assertCommonResponseFlags(wrongPreflightType);

  const wrongPlanType = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ planType: "otherAuditLedgerPlan" })
  );
  assert.strictEqual(wrongPlanType.status, 404);
  assert.strictEqual(wrongPlanType.body.code, "PROMOTION_DRY_RUN_AUDIT_LEDGER_PLAN_NOT_MOUNTED");
  assertCommonResponseFlags(wrongPlanType);

  const wrongOperation = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ operation: "otherServiceOperation" })
  );
  assert.strictEqual(wrongOperation.status, 404);
  assert.strictEqual(wrongOperation.body.code, "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongOperation);

  const wrongAction = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ action: "otherControllerAction" })
  );
  assert.strictEqual(wrongAction.status, 404);
  assert.strictEqual(wrongAction.body.code, "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED");
  assertCommonResponseFlags(wrongAction);

  const wrongMethod = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ method: "GET" })
  );
  assert.strictEqual(wrongMethod.status, 405);
  assert.strictEqual(wrongMethod.body.code, "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED");
  assertCommonResponseFlags(wrongMethod);

  const wrongPath = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ path: "/api/admin/promotions" })
  );
  assert.strictEqual(wrongPath.status, 404);
  assert.strictEqual(wrongPath.body.code, "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED");
  assertCommonResponseFlags(wrongPath);

  const missingId = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ params: { id: "" } })
  );
  assert.strictEqual(missingId.status, 400);
  assert.strictEqual(missingId.body.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(missingId);

  const noPermission = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ permissions: ["settings.promotion.view"] })
  );
  assert.strictEqual(noPermission.status, 403);
  assert.strictEqual(noPermission.body.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(noPermission);

  const missingAuditReason = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ auditReason: "" })
  );
  assert.strictEqual(missingAuditReason.status, 422);
  assert.strictEqual(missingAuditReason.body.code, "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED");
  assertCommonResponseFlags(missingAuditReason);

  const riskAckRequired = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ changedField: "bonusValue", riskAcknowledgement: false })
  );
  assert.strictEqual(riskAckRequired.status, 422);
  assert.strictEqual(riskAckRequired.body.code, "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED");
  assertCommonResponseFlags(riskAckRequired);

  const negativeNumeric = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ after: { minDeposit: -1 }, changedField: "minDeposit" })
  );
  assert.strictEqual(negativeNumeric.status, 422);
  assert.strictEqual(negativeNumeric.body.code, "PROMOTION_DRY_RUN_VALIDATION_FAILED");
  assertCommonResponseFlags(negativeNumeric);

  const mountRequested = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ mountRequest: { requested: true } })
  );
  assert.strictEqual(mountRequested.status, 200);
  assert.strictEqual(mountRequested.body.mountRequested, true);
  assert(mountRequested.body.blockingReasons.includes("MOUNT_AUTHORIZATION_GATE_ONLY"));
  assert(mountRequested.body.blockingReasons.includes("MOUNT_NOT_GRANTED_BY_DEFAULT"));
  assert(mountRequested.body.blockingReasons.includes("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38"));
  assert(mountRequested.body.blockingReasons.includes("RUNTIME_ENABLEMENT_NOT_ALLOWED_IN_PHASE_38"));
  assert.strictEqual(mountRequested.body.mountAuthorized, false);
  assert.strictEqual(mountRequested.body.mountGranted, false);
  assertCommonResponseFlags(mountRequested);

  const withRuntimeChecks = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({
      runtimeChecks: {
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
    })
  );
  assert.strictEqual(withRuntimeChecks.status, 200);
  assert(withRuntimeChecks.body.blockingReasons.some((item) => /route mount remains disabled/i.test(item)));
  assert(withRuntimeChecks.body.blockingReasons.some((item) => /provider outbound remains disabled/i.test(item)));
  assert(withRuntimeChecks.body.blockingReasons.some((item) => /production deploy remains disabled/i.test(item)));
  assert.strictEqual(withRuntimeChecks.body.mountAuthorized, false);
  assert.strictEqual(withRuntimeChecks.body.mountGranted, false);
  assertCommonResponseFlags(withRuntimeChecks);

  const operatorApproved = simulatePromotionAdminDryRunMountAuthorization(
    makeRequest({ operatorApproval: { approved: true, reason: "approved" } })
  );
  assert.strictEqual(operatorApproved.status, 200);
  assert(operatorApproved.body.blockingReasons.includes("OPERATOR_APPROVAL_DOES_NOT_GRANT_MOUNT"));
  assert.strictEqual(operatorApproved.body.mountAuthorized, false);
  assert.strictEqual(operatorApproved.body.mountGranted, false);
  assertCommonResponseFlags(operatorApproved);

  console.log("Backoffice promotion admin dry-run mount authorization package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run mount authorization module export: PASS");
  console.log("Backoffice promotion admin dry-run mount authorization metadata: PASS");
  console.log("Backoffice promotion admin dry-run mount authorization request simulation: PASS");
  console.log("Backoffice promotion admin dry-run mount authorization boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run mount authorization smoke: PASS");
}

main();
