const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildPromotionAdminDryRunRuntimeDecisionGate,
  simulatePromotionAdminDryRunRuntimeDecision,
} = require("../utils/promotionAdminDryRunRuntimeDecision");

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

function makeRuntimeDecisionRequest(options) {
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
                  auditReason: "runtime decision review",
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
  const finalReadiness = Object.assign(
    {
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
    },
    input.finalReadiness || {}
  );
  if (input.finalReadiness && input.finalReadiness.enablementRunbook) {
    finalReadiness.enablementRunbook = Object.assign({}, finalReadiness.enablementRunbook, input.finalReadiness.enablementRunbook);
  }
  if (input.finalReadiness && input.finalReadiness.enablementRunbook && input.finalReadiness.enablementRunbook.mountAuthorization) {
    finalReadiness.enablementRunbook.mountAuthorization = Object.assign(
      {},
      finalReadiness.enablementRunbook.mountAuthorization,
      input.finalReadiness.enablementRunbook.mountAuthorization
    );
  }
  if (input.finalReadiness && input.finalReadiness.enablementRunbook && input.finalReadiness.enablementRunbook.approvalChecklist) {
    finalReadiness.enablementRunbook.approvalChecklist = Object.assign(
      {},
      finalReadiness.enablementRunbook.approvalChecklist,
      input.finalReadiness.enablementRunbook.approvalChecklist
    );
  }
  if (input.finalReadiness && input.finalReadiness.finalDecision) {
    finalReadiness.finalDecision = Object.assign({}, finalReadiness.finalDecision, input.finalReadiness.finalDecision);
  }

  const runtimeDecision = Object.assign(
    {
      requested: false,
      requestedBy: null,
      decision: "hold_runtime",
      decisionReason: "",
      separateRuntimePhaseRequired: true,
      stagingOnlyRequested: false,
      productionRuntimeRequested: false,
    },
    input.runtimeDecision || {}
  );

  return {
    runtimeDecisionType: Object.prototype.hasOwnProperty.call(input, "runtimeDecisionType")
      ? input.runtimeDecisionType
      : "promotionAdminDryRunRuntimeDecision",
    runtimeDecisionMode: Object.prototype.hasOwnProperty.call(input, "runtimeDecisionMode")
      ? input.runtimeDecisionMode
      : undefined,
    finalReadiness,
    runtimeDecision,
  };
}

function assertCommonFlags(response) {
  assert.strictEqual(response.canRequestRuntimeImplementation, false);
  assert.strictEqual(response.canMountRoute, false);
  assert.strictEqual(response.canEnableRuntime, false);
  assert.strictEqual(response.canEnableStagingRuntime, false);
  assert.strictEqual(response.canEnableProductionRuntime, false);
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
  assert.strictEqual(response.decisionOnly, true);
  assert.strictEqual(response.runtimeHeld, true);
  assert.strictEqual(response.runtimeEnabled, false);
  assert(response.safetyFlags && response.safetyFlags.noDbWrite === true);
  assert(response.runtimeDecisionGate && response.runtimeDecisionGate.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42");
  assert(response.runtimeDecisionGate.chainStatus === "phase_32_to_41_closed");
  assert(response.finalReadinessRecord && response.finalReadinessRecord.phase === "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41");
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const runtimeDecisionDoc = read("docs/PROMOTION_ADMIN_DRY_RUN_RUNTIME_DECISION.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const moduleSource = read("src/utils/promotionAdminDryRunRuntimeDecision.js");
  const finalReadinessSource = read("src/utils/promotionAdminDryRunFinalReadiness.js");
  const enablementSource = read("src/utils/promotionAdminDryRunEnablementRunbook.js");
  const contractSource = read("src/utils/promotionAdminDryRunApiContract.js");
  const routeSource = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/admin.controller.js");
  const serviceSource = read("src/services/promotion.service.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-runtime-decision",
    "backofficePromotionAdminDryRunRuntimeDecisionSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunRuntimeDecisionSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-runtime-decision",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42",
    "runtime decision record only",
    "runtime decision gate",
    "hold runtime",
    "request staging-only runtime phase",
    "request separate runtime implementation phase",
    "reject runtime for now",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42",
    "runtime decision record only",
    "runtime decision gate",
    "hold runtime",
    "request staging-only runtime phase",
    "request separate runtime implementation phase",
    "reject runtime for now",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("runtime decision doc headings", runtimeDecisionDoc, [
    "# Promotion Admin Dry-run Runtime Decision",
    "## Purpose",
    "## Current status",
    "## Decision options",
    "## Selected decision",
    "## Runtime boundary",
    "## Required separate runtime phase",
    "## Staging-only path",
    "## Production runtime path",
    "## Non-goals",
    "## Hard safety locks",
    "## Next possible phase",
  ]);

  assertIncludes("UI markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run runtime decision",
    "runtime decision record only",
    "runtime decision gate",
    "hold runtime",
    "request staging-only runtime phase",
    "request separate runtime implementation phase",
    "reject runtime for now",
    "runtime not enabled in phase 42",
    "separate runtime phase required",
    "route not mounted",
    "runtime not enabled",
    "can enable staging runtime false",
    "can enable production runtime false",
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
    "buildPromotionAdminDryRunRuntimeDecisionGate",
    "simulatePromotionAdminDryRunRuntimeDecision",
    "promotionAdminDryRunRuntimeDecision",
    "runtime_decision_record_only_runtime_not_enabled",
    "phase_32_to_41_closed",
    "decision_record_only",
    "PROMOTION_DRY_RUN_RUNTIME_DECISION_NOT_FOUND",
    "RUNTIME_DECISION_RECORD_ONLY",
    "SEPARATE_STAGING_RUNTIME_PHASE_REQUIRED",
    "RUNTIME_NOT_ENABLED_IN_PHASE_42",
    "SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED",
    "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_42",
    "STAGING_OR_PRODUCTION_ENABLEMENT_NOT_ALLOWED_IN_PHASE_42",
  ]);

  assertIncludes("module dependencies", moduleSource, [
    'require("./promotionAdminDryRunFinalReadiness")',
    'require("./promotionAdminDryRunEnablementRunbook")',
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
    "child_process",
    "process.env",
    "res.",
    "req.",
  ]);

  assertNoSecretShape("runtime decision source", moduleSource);
  assertNoSecretShape("final readiness source", finalReadinessSource);
  assertNoSecretShape("enablement source", enablementSource);
  assertNoSecretShape("contract source", contractSource);

  assertNotIncludes("route lock", routeSource, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42",
    "runtime decision record only",
    "runtime decision gate",
    "dry-run",
    'router.post("/promotions",',
    'router.patch("/promotions"',
    'router.put("/promotions"',
    'router.delete("/promotions"',
  ]);
  assertNotIncludes("controller runtime change", controllerSource, [
    "buildPromotionAdminDryRunRuntimeDecisionGate",
    "simulatePromotionAdminDryRunRuntimeDecision",
    "runtime decision gate",
    "dryRunPromotion",
  ]);
  assertNotIncludes("service runtime change", serviceSource, [
    "buildPromotionAdminDryRunRuntimeDecisionGate",
    "simulatePromotionAdminDryRunRuntimeDecision",
    "runtime decision gate",
    "dryRunPromotion",
  ]);

  const gate = buildPromotionAdminDryRunRuntimeDecisionGate();
  assert.strictEqual(gate.runtimeDecisionType, "promotionAdminDryRunRuntimeDecision");
  assert.strictEqual(gate.runtimeDecisionMode, "decision_record_only");
  assert.strictEqual(gate.status, "runtime_decision_record_only_runtime_not_enabled");
  assert.strictEqual(gate.runtimeDecisionGate.chainStatus, "phase_32_to_41_closed");
  assert.strictEqual(gate.runtimeDecisionGate.decisionGateStatus, "decision_record_only");
  assert.strictEqual(gate.runtimeDecisionGate.selectedDecision, "hold_runtime");
  assert.strictEqual(gate.runtimeDecisionGate.targetRuntimeMode, "none");
  assert.strictEqual(gate.runtimeDecisionGate.requiredSeparateRuntimePhase, true);
  assert(gate.runtimeDecisionGate.blockingReasons.includes("RUNTIME_DECISION_RECORD_ONLY"));
  assert(gate.runtimeDecisionGate.blockingReasons.includes("RUNTIME_NOT_ENABLED_IN_PHASE_42"));
  assertCommonFlags(gate);

  const holdRuntime = simulatePromotionAdminDryRunRuntimeDecision(makeRuntimeDecisionRequest({ permission: "settings.promotion.write" }));
  assert.strictEqual(holdRuntime.status, 200);
  assert.strictEqual(holdRuntime.body.ok, true);
  assert.strictEqual(holdRuntime.body.runtimeDecisionGate.selectedDecision, "hold_runtime");
  assert.strictEqual(holdRuntime.body.runtimeDecisionGate.targetRuntimeMode, "none");
  assert.strictEqual(holdRuntime.body.runtimeHeld, true);
  assert.strictEqual(holdRuntime.body.runtimeEnabled, false);
  assert.strictEqual(holdRuntime.body.canMountRoute, false);
  assert.strictEqual(holdRuntime.body.canEnableRuntime, false);
  assertCommonFlags(holdRuntime);

  const stagingDecision = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      permission: "settings.promotion.write",
      runtimeDecision: {
        decision: "request_staging_only_runtime_phase",
        decisionReason: "staging-only decision requested",
      },
    })
  );
  assert.strictEqual(stagingDecision.status, 200);
  assert.strictEqual(stagingDecision.body.runtimeDecisionGate.selectedDecision, "request_staging_only_runtime_phase");
  assert.strictEqual(stagingDecision.body.runtimeDecisionGate.targetRuntimeMode, "staging_only");
  assert.strictEqual(stagingDecision.body.canEnableStagingRuntime, false);
  assert.strictEqual(stagingDecision.body.canEnableRuntime, false);
  assert(stagingDecision.body.runtimeDecisionGate.blockingReasons.includes("RUNTIME_DECISION_RECORD_ONLY"));
  assert(stagingDecision.body.runtimeDecisionGate.blockingReasons.includes("SEPARATE_STAGING_RUNTIME_PHASE_REQUIRED"));
  assert(stagingDecision.body.runtimeDecisionGate.blockingReasons.includes("RUNTIME_NOT_ENABLED_IN_PHASE_42"));
  assertCommonFlags(stagingDecision);

  const separateDecision = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      permission: "settings.promotion.manage",
      runtimeDecision: {
        decision: "request_separate_runtime_implementation_phase",
        decisionReason: "separate runtime requested",
      },
    })
  );
  assert.strictEqual(separateDecision.status, 200);
  assert.strictEqual(separateDecision.body.runtimeDecisionGate.selectedDecision, "request_separate_runtime_implementation_phase");
  assert.strictEqual(separateDecision.body.runtimeDecisionGate.targetRuntimeMode, "separate_runtime_phase");
  assert.strictEqual(separateDecision.body.canRequestRuntimeImplementation, false);
  assert.strictEqual(separateDecision.body.canMountRoute, false);
  assert.strictEqual(separateDecision.body.canEnableRuntime, false);
  assert(separateDecision.body.runtimeDecisionGate.blockingReasons.includes("RUNTIME_DECISION_RECORD_ONLY"));
  assert(separateDecision.body.runtimeDecisionGate.blockingReasons.includes("SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED"));
  assert(separateDecision.body.runtimeDecisionGate.blockingReasons.includes("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_42"));
  assertCommonFlags(separateDecision);

  const rejectDecision = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      runtimeDecision: {
        decision: "reject_runtime_for_now",
        decisionReason: "reject runtime for now",
      },
    })
  );
  assert.strictEqual(rejectDecision.status, 200);
  assert.strictEqual(rejectDecision.body.runtimeDecisionGate.selectedDecision, "reject_runtime_for_now");
  assert.strictEqual(rejectDecision.body.runtimeRejected, true);
  assert.strictEqual(rejectDecision.body.runtimeHeld, true);
  assert.strictEqual(rejectDecision.body.runtimeEnabled, false);
  assertCommonFlags(rejectDecision);

  const wrongRuntimeDecisionType = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      runtimeDecisionType: "otherRuntimeDecisionType",
    })
  );
  assert.strictEqual(wrongRuntimeDecisionType.status, 404);
  assert.strictEqual(wrongRuntimeDecisionType.body.code, "PROMOTION_DRY_RUN_RUNTIME_DECISION_NOT_FOUND");
  assertCommonFlags(wrongRuntimeDecisionType);

  const wrongFinalReadinessType = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      finalReadinessType: "otherFinalReadinessType",
    })
  );
  assert.strictEqual(wrongFinalReadinessType.status, 404);
  assert.strictEqual(wrongFinalReadinessType.body.code, "PROMOTION_DRY_RUN_FINAL_READINESS_NOT_FOUND");
  assertCommonFlags(wrongFinalReadinessType);

  const stagingOnlyRequested = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      runtimeDecision: {
        decision: "hold_runtime",
        stagingOnlyRequested: true,
      },
    })
  );
  assert.strictEqual(stagingOnlyRequested.status, 200);
  assert.strictEqual(stagingOnlyRequested.body.runtimeDecisionGate.selectedDecision, "hold_runtime");
  assert.strictEqual(stagingOnlyRequested.body.runtimeEnabled, false);
  assert(stagingOnlyRequested.body.runtimeDecisionGate.blockingReasons.includes("SEPARATE_RUNTIME_PHASE_REQUIRED"));
  assert(stagingOnlyRequested.body.runtimeDecisionGate.blockingReasons.includes("STAGING_OR_PRODUCTION_ENABLEMENT_NOT_ALLOWED_IN_PHASE_42"));
  assertCommonFlags(stagingOnlyRequested);

  const productionRequested = simulatePromotionAdminDryRunRuntimeDecision(
    makeRuntimeDecisionRequest({
      runtimeDecision: {
        decision: "hold_runtime",
        productionRuntimeRequested: true,
      },
    })
  );
  assert.strictEqual(productionRequested.status, 200);
  assert.strictEqual(productionRequested.body.runtimeDecisionGate.selectedDecision, "hold_runtime");
  assert.strictEqual(productionRequested.body.runtimeEnabled, false);
  assert(productionRequested.body.runtimeDecisionGate.blockingReasons.includes("SEPARATE_RUNTIME_PHASE_REQUIRED"));
  assert(productionRequested.body.runtimeDecisionGate.blockingReasons.includes("STAGING_OR_PRODUCTION_ENABLEMENT_NOT_ALLOWED_IN_PHASE_42"));
  assertCommonFlags(productionRequested);

  console.log("Backoffice promotion admin dry-run runtime decision package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run runtime decision module export: PASS");
  console.log("Backoffice promotion admin dry-run runtime decision metadata: PASS");
  console.log("Backoffice promotion admin dry-run runtime decision simulation: PASS");
  console.log("Backoffice promotion admin dry-run runtime decision boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run runtime decision smoke: PASS");
}

main();
