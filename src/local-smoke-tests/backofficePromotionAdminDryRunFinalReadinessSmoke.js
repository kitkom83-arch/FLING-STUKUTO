const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunFinalReadinessRecord,
  simulatePromotionAdminDryRunFinalReadiness,
} = require("../utils/promotionAdminDryRunFinalReadiness");

const ROOT = path.resolve(__dirname, "..", "..");
const MODULE_PATH = path.join(ROOT, "src/utils/promotionAdminDryRunFinalReadiness.js");

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

function makeFinalReadinessRequest(options) {
  const input = options || {};
  const permission = input.permission || "settings.promotion.write";
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
  const finalDecision = Object.assign(
    {
      requested: false,
      requestedBy: null,
      decision: "not_requested",
      decisionReason: "",
      separateRuntimePhaseRequired: true,
    },
    input.finalDecision || {}
  );
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
                  auditReason: "final readiness review",
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
      approvalChecklist,
    },
    input.mountAuthorization || {}
  );
  if (input.mountAuthorization && input.mountAuthorization.runtimePreflight) {
    mountAuthorization.runtimePreflight = Object.assign({}, mountAuthorization.runtimePreflight, input.mountAuthorization.runtimePreflight);
  }
  if (input.mountAuthorization && input.mountAuthorization.mountRequest) {
    mountAuthorization.mountRequest = Object.assign({}, mountAuthorization.mountRequest, input.mountAuthorization.mountRequest);
  }
  if (input.mountAuthorization && input.mountAuthorization.approvalChecklist) {
    mountAuthorization.approvalChecklist = Object.assign({}, mountAuthorization.approvalChecklist, input.mountAuthorization.approvalChecklist);
  }

  return {
    finalReadinessType: Object.prototype.hasOwnProperty.call(input, "finalReadinessType")
      ? input.finalReadinessType
      : "promotionAdminDryRunFinalReadiness",
    finalReadinessMode: Object.prototype.hasOwnProperty.call(input, "finalReadinessMode")
      ? input.finalReadinessMode
      : "record_only",
    enablementRunbook: {
      checklistType: Object.prototype.hasOwnProperty.call(input, "checklistType")
        ? input.checklistType
        : "promotionAdminDryRunEnablementRunbook",
      runbookMode: Object.prototype.hasOwnProperty.call(input, "runbookMode")
        ? input.runbookMode
        : "readiness_only",
      mountAuthorization,
      approvalChecklist,
    },
    finalDecision,
  };
}

function assertCommonFlags(response) {
  assert.strictEqual(response.canRequestRuntimeImplementation, false);
  assert.strictEqual(response.canMountRoute, false);
  assert.strictEqual(response.canEnableRuntime, false);
  assert.strictEqual(response.mountAuthorized, false);
  assert.strictEqual(response.mountGranted, false);
  assert.strictEqual(response.mountDenied, true);
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
  assert.strictEqual(response.recordOnly, true);
  assert(response.safetyFlags && response.safetyFlags.noDbWrite === true);
  assert(response.finalReadinessRecord && response.finalReadinessRecord.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41");
  assert(response.finalReadinessRecord.chainStatus === "phase_32_to_40_closed");
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const finalReadinessDoc = read("docs/PROMOTION_ADMIN_DRY_RUN_FINAL_READINESS.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const moduleSource = read("src/utils/promotionAdminDryRunFinalReadiness.js");
  const enablementSource = read("src/utils/promotionAdminDryRunEnablementRunbook.js");
  const mountAuthSource = read("src/utils/promotionAdminDryRunMountAuthorization.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");
  const routeSource = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/admin.controller.js");
  const serviceSource = read("src/services/promotion.service.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-final-readiness",
    "backofficePromotionAdminDryRunFinalReadinessSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunFinalReadinessSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-final-readiness",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41",
    "final readiness record only",
    "ready for separate runtime decision",
    "runtime not approved in phase 41",
    "separate runtime implementation phase required",
    "route not mounted",
    "runtime not enabled",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41",
    "final readiness record only",
    "ready for separate runtime decision",
    "runtime not approved in phase 41",
    "separate runtime implementation phase required",
    "route not mounted",
    "runtime not enabled",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("final readiness doc headings", finalReadinessDoc, [
    "# Promotion Admin Dry-run Final Readiness",
    "## Purpose",
    "## Current status",
    "## Covered phases",
    "## Final readiness summary",
    "## Runtime decision boundary",
    "## Required separate runtime phase",
    "## Approval evidence required",
    "## Non-goals",
    "## Hard safety locks",
    "## Next possible phase",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run final readiness",
    "final readiness record only",
    "ready for separate runtime decision",
    "runtime not approved in phase 41",
    "separate runtime implementation phase required",
    "route not mounted",
    "runtime not enabled",
    "can request runtime implementation false",
    "can mount route false",
    "can enable runtime false",
    "no DB write",
    "no promotion update",
    "no audit row creation",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no runtime credit action",
    "no provider outbound",
    "no production deploy",
    "write locked",
  ]);

  assertIncludes("module markers", moduleSource, [
    "buildPromotionAdminDryRunFinalReadinessRecord",
    "simulatePromotionAdminDryRunFinalReadiness",
    "promotionAdminDryRunFinalReadiness",
    "final_readiness_record_only_runtime_not_enabled",
    "phase_32_to_40_closed",
    "ready_for_separate_runtime_decision",
    "not_approved_for_runtime",
    "PROMOTION_DRY_RUN_FINAL_READINESS_NOT_FOUND",
    "FINAL_READINESS_RECORD_ONLY",
    "SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED",
    "RUNTIME_NOT_APPROVED_IN_PHASE_41",
    "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_41",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunEnablementRunbook")',
    'require("./promotionAdminDryRunMountAuthorization")',
    'require("./promotionAdminDryRunApiContract")',
  ]);

  assertNoSecretShape("final readiness source", moduleSource);
  assertNoSecretShape("enablement source", enablementSource);
  assertNoSecretShape("mount auth source", mountAuthSource);
  assertNoSecretShape("contract source", contractSource);

  assertNotIncludes("route lock", routeSource, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41",
    "final readiness record only",
    "ready for separate runtime decision",
    "runtime not approved in phase 41",
    "separate runtime implementation phase required",
    "dry-run",
    'router.post("/promotions"',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
  ]);
  assertNotIncludes("controller runtime change", controllerSource, [
    "buildPromotionAdminDryRunFinalReadinessRecord",
    "simulatePromotionAdminDryRunFinalReadiness",
    "final readiness record only",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service runtime change", serviceSource, [
    "buildPromotionAdminDryRunFinalReadinessRecord",
    "simulatePromotionAdminDryRunFinalReadiness",
    "final readiness record only",
    "dryRunPromotion",
  ]);

  const readiness = buildPromotionAdminDryRunFinalReadinessRecord();
  assert.strictEqual(readiness.finalReadinessType, "promotionAdminDryRunFinalReadiness");
  assert.strictEqual(readiness.finalReadinessMode, "record_only");
  assert.strictEqual(readiness.status, "final_readiness_record_only_runtime_not_enabled");
  assert.strictEqual(readiness.finalReadinessRecord.chainStatus, "phase_32_to_40_closed");
  assert.strictEqual(readiness.finalReadinessRecord.finalReadinessStatus, "ready_for_separate_runtime_decision");
  assert.strictEqual(readiness.finalReadinessRecord.decisionStatus, "not_approved_for_runtime");
  assert.strictEqual(readiness.finalReadinessRecord.requiredSeparateRuntimePhase, true);
  assert(readiness.finalReadinessRecord.coveredPhases.includes("BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-PREVIEW-32"));
  assert(readiness.finalReadinessRecord.coveredPhases.includes("BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41"));
  assert(readiness.finalReadinessRecord.blockingReasons.includes("FINAL_READINESS_RECORD_ONLY"));
  assert(readiness.finalReadinessRecord.blockingReasons.includes("SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED"));
  assert(readiness.finalReadinessRecord.blockingReasons.includes("RUNTIME_NOT_APPROVED_IN_PHASE_41"));
  assert(readiness.finalReadinessRecord.blockingReasons.includes("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_41"));
  assertCommonFlags(readiness);

  const validWrite = simulatePromotionAdminDryRunFinalReadiness(makeFinalReadinessRequest({ permission: "settings.promotion.write" }));
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.ok, true);
  assert.strictEqual(validWrite.body.canMountRoute, false);
  assert.strictEqual(validWrite.body.canEnableRuntime, false);
  assert.strictEqual(validWrite.body.recordOnly, true);
  assert.strictEqual(validWrite.body.readinessOnly, true);
  assertCommonFlags(validWrite);

  const validManage = simulatePromotionAdminDryRunFinalReadiness(makeFinalReadinessRequest({ permission: "settings.promotion.manage" }));
  assert.strictEqual(validManage.status, 200);
  assert.strictEqual(validManage.body.ok, true);
  assert.strictEqual(validManage.body.canMountRoute, false);
  assert.strictEqual(validManage.body.canEnableRuntime, false);
  assertCommonFlags(validManage);

  const wrongFinalReadinessType = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      finalReadinessType: "otherFinalReadinessType",
    })
  );
  assert.strictEqual(wrongFinalReadinessType.status, 404);
  assert.strictEqual(wrongFinalReadinessType.body.code, "PROMOTION_DRY_RUN_FINAL_READINESS_NOT_FOUND");
  assertCommonFlags(wrongFinalReadinessType);

  const wrongChecklistType = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      checklistType: "otherChecklistType",
    })
  );
  assert.strictEqual(wrongChecklistType.status, 404);
  assert.strictEqual(wrongChecklistType.body.code, "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND");
  assertCommonFlags(wrongChecklistType);

  const requestedRuntime = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      finalDecision: {
        requested: true,
        requestedBy: "operator-1",
        decision: "not_requested",
        decisionReason: "request submitted",
      },
    })
  );
  assert.strictEqual(requestedRuntime.status, 200);
  assert.strictEqual(requestedRuntime.body.finalReadinessRecord.decisionStatus, "not_approved_for_runtime");
  assert(requestedRuntime.body.finalReadinessRecord.blockingReasons.includes("FINAL_READINESS_RECORD_ONLY"));
  assert(requestedRuntime.body.finalReadinessRecord.blockingReasons.includes("SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED"));
  assert(requestedRuntime.body.finalReadinessRecord.blockingReasons.includes("RUNTIME_NOT_APPROVED_IN_PHASE_41"));
  assert(requestedRuntime.body.finalReadinessRecord.blockingReasons.includes("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_41"));
  assertCommonFlags(requestedRuntime);

  const approvedRuntime = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      finalDecision: {
        requested: false,
        requestedBy: "operator-1",
        decision: "approved",
        decisionReason: "approved for runtime",
      },
    })
  );
  assert.strictEqual(approvedRuntime.status, 200);
  assert.strictEqual(approvedRuntime.body.finalReadinessRecord.decisionStatus, "not_approved_for_runtime");
  assert(approvedRuntime.body.finalReadinessRecord.blockingReasons.includes("RUNTIME_NOT_APPROVED_IN_PHASE_41"));
  assertCommonFlags(approvedRuntime);

  const allApproved = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
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
  assert.strictEqual(allApproved.body.canMountRoute, false);
  assert.strictEqual(allApproved.body.canEnableRuntime, false);
  assert.strictEqual(allApproved.body.mountDenied, true);
  assert(allApproved.body.finalReadinessRecord.blockingReasons.includes("FINAL_READINESS_RECORD_ONLY"));
  assertCommonFlags(allApproved);

  const forcedRecordOnly = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      finalReadinessMode: "runtime_enabled",
    })
  );
  assert.strictEqual(forcedRecordOnly.status, 200);
  assert.strictEqual(forcedRecordOnly.body.finalReadinessMode, "record_only");
  assert.strictEqual(forcedRecordOnly.body.finalReadinessRecord.requiredSeparateRuntimePhase, true);
  assertCommonFlags(forcedRecordOnly);

  const settingsWrite = simulatePromotionAdminDryRunFinalReadiness(
    makeFinalReadinessRequest({
      permission: "settings.promotion.write",
    })
  );
  assert.strictEqual(settingsWrite.status, 200);
  assert.strictEqual(settingsWrite.body.canRequestRuntimeImplementation, false);
  assert.strictEqual(settingsWrite.body.canMountRoute, false);
  assert.strictEqual(settingsWrite.body.canEnableRuntime, false);
  assertCommonFlags(settingsWrite);

  console.log("Backoffice promotion admin dry-run final readiness package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run final readiness module export: PASS");
  console.log("Backoffice promotion admin dry-run final readiness metadata: PASS");
  console.log("Backoffice promotion admin dry-run final readiness checklist simulation: PASS");
  console.log("Backoffice promotion admin dry-run final readiness boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run final readiness smoke: PASS");
}

main();
