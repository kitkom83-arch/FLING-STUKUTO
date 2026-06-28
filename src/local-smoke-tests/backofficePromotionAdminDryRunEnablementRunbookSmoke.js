const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunEnablementRunbook,
  simulatePromotionAdminDryRunEnablementChecklist,
} = require("../utils/promotionAdminDryRunEnablementRunbook");

const ROOT = path.resolve(__dirname, "..", "..");
const MODULE_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunEnablementRunbook.js");

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

function makeChecklistRequest(options) {
  const input = options || {};
  const approvalChecklist = Object.assign(
    {
      productOwnerApproved: false,
      technicalLeadApproved: false,
      securityApproved: false,
      rollbackPlanAccepted: false,
      monitoringPlanAccepted: false,
      stagingUatPassed: false,
      productionWindowApproved: false,
    },
    input.approvalChecklist || {}
  );
  const before = {
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
  const after = Object.assign({}, before, { title: "New Year Promo Updated" }, input.after || {});
  const permission = input.permission || "settings.promotion.write";

  const mountAuthorization = Object.assign(
    {
      authorizationType: "promotionAdminDryRunMountAuthorization",
      authorizationMode: "gate_only",
      runtimePreflight: {
        preflightType: "promotionAdminDryRunRuntimePreflight",
        preflightMode: "readiness_only",
        auditLedgerPlan: {
          planType: "promotionAdminDryRunAuditLedgerPlan",
          serviceOperation: {
            operation: "dryRunPromotionUpdateService",
            controllerAction: {
              action: "dryRunPromotionUpdate",
              request: {
                method: "POST",
                path: "/api/admin/promotions/:id/dry-run",
                params: { id: "promo-1" },
                actor: {
                  id: "admin-1",
                  permissions: ["settings.promotion.view", permission],
                },
                body: {
                  before,
                  after,
                  auditReason: "enablement checklist review",
                  riskAcknowledgement: true,
                },
              },
            },
          },
        },
        runtimeChecks: {},
        operatorApproval: {
          approved: false,
          approvedBy: null,
          reason: "not approved",
        },
      },
      mountRequest: {
        requested: false,
        requestedBy: null,
        reason: "",
        targetRoute: "/api/admin/promotions/:id/dry-run",
      },
    },
    input.mountAuthorization || {}
  );

  if (input.mountAuthorization && input.mountAuthorization.runtimePreflight) {
    mountAuthorization.runtimePreflight = Object.assign(
      {
        preflightType: "promotionAdminDryRunRuntimePreflight",
        preflightMode: "readiness_only",
        auditLedgerPlan: {
          planType: "promotionAdminDryRunAuditLedgerPlan",
          serviceOperation: {
            operation: "dryRunPromotionUpdateService",
            controllerAction: {
              action: "dryRunPromotionUpdate",
              request: {
                method: "POST",
                path: "/api/admin/promotions/:id/dry-run",
                params: { id: "promo-1" },
                actor: {
                  id: "admin-1",
                  permissions: ["settings.promotion.view", permission],
                },
                body: {
                  before,
                  after,
                  auditReason: "enablement checklist review",
                  riskAcknowledgement: true,
                },
              },
            },
          },
        },
        runtimeChecks: {},
        operatorApproval: {
          approved: false,
          approvedBy: null,
          reason: "not approved",
        },
      },
      input.mountAuthorization.runtimePreflight
    );
  }

  if (input.mountAuthorization && input.mountAuthorization.mountRequest) {
    mountAuthorization.mountRequest = Object.assign(
      {
        requested: false,
        requestedBy: null,
        reason: "",
        targetRoute: "/api/admin/promotions/:id/dry-run",
      },
      input.mountAuthorization.mountRequest
    );
  }

  return {
    checklistType: Object.prototype.hasOwnProperty.call(input, "checklistType")
      ? input.checklistType
      : "promotionAdminDryRunEnablementRunbook",
    runbookMode: Object.prototype.hasOwnProperty.call(input, "runbookMode")
      ? input.runbookMode
      : "readiness_only",
    mountAuthorization,
    approvalChecklist,
  };
}

function assertCommonFlags(response) {
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
  assert(response.safetyFlags && response.safetyFlags.noDbWrite === true);
  assert(response.enablementRunbook && response.enablementRunbook.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39");
  assert(response.enablementRunbook.mountAuthorizationPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38");
  assert(response.enablementRunbook.runtimePreflightPhase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37");
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const runbookDoc = read("docs/PROMOTION_ADMIN_DRY_RUN_ENABLEMENT_RUNBOOK.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const moduleSource = read("src/utils/promotionAdminDryRunEnablementRunbook.js");
  const mountAuthSource = read("src/utils/promotionAdminDryRunMountAuthorization.js");
  const runtimePreflightSource = read("src/utils/promotionAdminDryRunRuntimePreflight.js");
  const auditLedgerSource = read("src/utils/promotionAdminDryRunAuditLedgerReadiness.js");
  const routeSource = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/admin.controller.js");
  const serviceSource = read("src/services/promotion.service.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-enablement-runbook",
    "backofficePromotionAdminDryRunEnablementRunbookSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunEnablementRunbookSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-enablement-runbook",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39",
    "enablement runbook readiness only",
    "runtime not enabled",
    "mount not granted",
    "mount denied by default",
    "approval checklist required",
    "rollback plan required",
    "monitoring plan required",
    "staging UAT required",
    "production window approval required",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39",
    "enablement runbook readiness only",
    "runtime not enabled",
    "mount not granted",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("runbook doc headings", runbookDoc, [
    "# Promotion Admin Dry-run Enablement Runbook",
    "## Purpose",
    "## Current status",
    "## Required approvals",
    "## Required prechecks",
    "## UAT checklist",
    "## Monitoring checklist",
    "## Rollback checklist",
    "## Non-goals",
    "## Hard safety locks",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39",
    "readiness_only",
    "Runtime enabled: `false`",
    "Mount denied by default: `true`",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run enablement runbook",
    "enablement runbook readiness only",
    "runtime not enabled",
    "mount not granted",
    "mount denied by default",
    "approval checklist required",
    "rollback plan required",
    "monitoring plan required",
    "staging UAT required",
    "production window approval required",
    "can mount route false",
    "can enable runtime false",
    "no DB write",
    "no promotion update",
    "no runtime credit action",
    "no ledger creation",
    "no turnover creation",
    "write locked",
  ]);

  assertIncludes("module markers", moduleSource, [
    "buildPromotionAdminDryRunEnablementRunbook",
    "simulatePromotionAdminDryRunEnablementChecklist",
    "enablement_runbook_readiness_only_not_enabled",
    "promotionAdminDryRunEnablementRunbook",
    "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND",
    "PRODUCT_OWNER_APPROVAL_REQUIRED",
    "TECHNICAL_LEAD_APPROVAL_REQUIRED",
    "SECURITY_APPROVAL_REQUIRED",
    "ROLLBACK_PLAN_REQUIRED",
    "MONITORING_PLAN_REQUIRED",
    "STAGING_UAT_REQUIRED",
    "PRODUCTION_WINDOW_APPROVAL_REQUIRED",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunMountAuthorization")',
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

  assertNoSecretShape("enablement runbook source", moduleSource);
  assertNoSecretShape("mount authorization source", mountAuthSource);
  assertNoSecretShape("runtime preflight source", runtimePreflightSource);
  assertNoSecretShape("audit ledger readiness source", auditLedgerSource);
  assertNoSecretShape("contract source", contractSource);

  assertNotIncludes("route lock", routeSource, [
    "dry-run",
    'router.post("/promotions"',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
  ]);
  assertNotIncludes("controller runtime change", controllerSource, [
    "simulatePromotionAdminDryRunEnablementChecklist",
    "enablement runbook",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service runtime change", serviceSource, [
    "simulatePromotionAdminDryRunEnablementChecklist",
    "enablement runbook",
    "dryRunPromotion",
  ]);

  const readiness = buildPromotionAdminDryRunEnablementRunbook();
  assert.strictEqual(readiness.phase, "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39");
  assert.strictEqual(readiness.checklistType, "promotionAdminDryRunEnablementRunbook");
  assert.strictEqual(readiness.runbookMode, "readiness_only");
  assert.strictEqual(readiness.status, "enablement_runbook_readiness_only_not_enabled");
  assert.strictEqual(readiness.canMountRoute, false);
  assert.strictEqual(readiness.canEnableRuntime, false);
  assert.strictEqual(readiness.mountAuthorized, false);
  assert.strictEqual(readiness.mountGranted, false);
  assert.strictEqual(readiness.mountDenied, true);
  assert.strictEqual(readiness.routeMounted, false);
  assert.strictEqual(readiness.expressMounted, false);
  assert.strictEqual(readiness.controllerMounted, false);
  assert.strictEqual(readiness.serviceMounted, false);
  assert.strictEqual(readiness.auditRuntimeEnabled, false);
  assert.strictEqual(readiness.ledgerRuntimeEnabled, false);
  assert.strictEqual(readiness.apiCallEnabled, false);
  assert.strictEqual(readiness.writeLocked, true);
  assert.strictEqual(readiness.readinessOnly, true);
  assert(readiness.enablementRunbook.requiredApprovals.includes("productOwnerApproved"));
  assert(readiness.enablementRunbook.requiredPrechecks.includes("readiness_only runbook mode"));
  assert(readiness.enablementRunbook.requiredRollbackSteps.includes("route remains unmounted"));
  assert(readiness.enablementRunbook.requiredMonitoringChecks.includes("no live provider outbound"));
  assert(readiness.enablementRunbook.requiredUatChecks.includes("staging approval records are complete"));
  assertCommonFlags(readiness);

  const validWrite = simulatePromotionAdminDryRunEnablementChecklist(makeChecklistRequest({ permission: "settings.promotion.write" }));
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.ok, true);
  assert.strictEqual(validWrite.body.runbookMode, "readiness_only");
  assert.strictEqual(validWrite.body.approvalSummary.allApproved, false);
  assert.strictEqual(validWrite.body.mountAuthorized, false);
  assert.strictEqual(validWrite.body.mountGranted, false);
  assert.strictEqual(validWrite.body.mountDenied, true);
  assert.strictEqual(validWrite.body.canMountRoute, false);
  assert.strictEqual(validWrite.body.canEnableRuntime, false);
  assertCommonFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunEnablementChecklist(makeChecklistRequest({ permission: "settings.promotion.manage" }));
  assert.strictEqual(validManage.status, 200);
  assert.strictEqual(validManage.body.ok, true);
  assert.strictEqual(validManage.body.canMountRoute, false);
  assert.strictEqual(validManage.body.canEnableRuntime, false);
  assertCommonFlags(validManage);

  const wrongChecklistType = simulatePromotionAdminDryRunEnablementChecklist(makeChecklistRequest({ checklistType: "otherChecklistType" }));
  assert.strictEqual(wrongChecklistType.status, 404);
  assert.strictEqual(wrongChecklistType.body.code, "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND");
  assertCommonFlags(wrongChecklistType);

  const missingApprovals = simulatePromotionAdminDryRunEnablementChecklist(
    makeChecklistRequest({
      approvalChecklist: {
        productOwnerApproved: false,
        technicalLeadApproved: false,
        securityApproved: false,
        rollbackPlanAccepted: false,
        monitoringPlanAccepted: false,
        stagingUatPassed: false,
        productionWindowApproved: false,
      },
    })
  );
  assert.strictEqual(missingApprovals.status, 200);
  assert(missingApprovals.body.blockingReasons.includes("PRODUCT_OWNER_APPROVAL_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("TECHNICAL_LEAD_APPROVAL_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("SECURITY_APPROVAL_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("ROLLBACK_PLAN_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("MONITORING_PLAN_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("STAGING_UAT_REQUIRED"));
  assert(missingApprovals.body.blockingReasons.includes("PRODUCTION_WINDOW_APPROVAL_REQUIRED"));
  assert.strictEqual(missingApprovals.body.enablementRunbook.blockingReasons.includes("PRODUCT_OWNER_APPROVAL_REQUIRED"), true);
  assertCommonFlags(missingApprovals);

  const allApproved = simulatePromotionAdminDryRunEnablementChecklist(
    makeChecklistRequest({
      approvalChecklist: {
        productOwnerApproved: true,
        technicalLeadApproved: true,
        securityApproved: true,
        rollbackPlanAccepted: true,
        monitoringPlanAccepted: true,
        stagingUatPassed: true,
        productionWindowApproved: true,
      },
    })
  );
  assert.strictEqual(allApproved.status, 200);
  assert.strictEqual(allApproved.body.approvalSummary.allApproved, true);
  assert.strictEqual(allApproved.body.canMountRoute, false);
  assert.strictEqual(allApproved.body.canEnableRuntime, false);
  assert.strictEqual(allApproved.body.mountDenied, true);
  assertCommonFlags(allApproved);

  const mountRequested = simulatePromotionAdminDryRunEnablementChecklist(
    makeChecklistRequest({
      mountAuthorization: {
        mountRequest: {
          requested: true,
          requestedBy: "operator-1",
          reason: "check mount readiness",
        },
      },
    })
  );
  assert.strictEqual(mountRequested.status, 200);
  assert.strictEqual(mountRequested.body.mountRequest.requested, true);
  assert.strictEqual(mountRequested.body.mountAuthorized, false);
  assert.strictEqual(mountRequested.body.mountGranted, false);
  assert.strictEqual(mountRequested.body.mountDenied, true);
  assert(mountRequested.body.blockingReasons.includes("MOUNT_REQUESTED_BUT_NOT_GRANTED") || mountRequested.body.blockingReasons.includes("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38"));
  assertCommonFlags(mountRequested);

  const operatorApproved = simulatePromotionAdminDryRunEnablementChecklist(
    makeChecklistRequest({
      mountAuthorization: {
        runtimePreflight: {
          operatorApproval: {
            approved: true,
            approvedBy: "operator-1",
            reason: "approved",
          },
        },
      },
    })
  );
  assert.strictEqual(operatorApproved.status, 200);
  assert.strictEqual(operatorApproved.body.operatorApproval.approved, true);
  assert.strictEqual(operatorApproved.body.mountAuthorized, false);
  assert.strictEqual(operatorApproved.body.mountGranted, false);
  assert.strictEqual(operatorApproved.body.mountDenied, true);
  assert(operatorApproved.body.blockingReasons.includes("OPERATOR_APPROVAL_DOES_NOT_GRANT_MOUNT"));
  assertCommonFlags(operatorApproved);

  const forcedRunbookMode = simulatePromotionAdminDryRunEnablementChecklist(
    makeChecklistRequest({
      runbookMode: "not_readiness_only",
      approvalChecklist: {
        productOwnerApproved: true,
        technicalLeadApproved: true,
        securityApproved: true,
        rollbackPlanAccepted: true,
        monitoringPlanAccepted: true,
        stagingUatPassed: true,
        productionWindowApproved: true,
      },
    })
  );
  assert.strictEqual(forcedRunbookMode.status, 200);
  assert.strictEqual(forcedRunbookMode.body.runbookMode, "readiness_only");
  assert.strictEqual(forcedRunbookMode.body.effectiveRunbookMode, "readiness_only");
  assert.strictEqual(forcedRunbookMode.body.canMountRoute, false);
  assert.strictEqual(forcedRunbookMode.body.canEnableRuntime, false);
  assertCommonFlags(forcedRunbookMode);

  console.log("Backoffice promotion admin dry-run enablement runbook package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run enablement runbook module export: PASS");
  console.log("Backoffice promotion admin dry-run enablement runbook metadata: PASS");
  console.log("Backoffice promotion admin dry-run enablement runbook checklist simulation: PASS");
  console.log("Backoffice promotion admin dry-run enablement runbook boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run enablement runbook smoke: PASS");
}

main();
