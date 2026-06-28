"use strict";

const {
  buildPromotionAdminDryRunEnablementRunbook,
  simulatePromotionAdminDryRunEnablementChecklist,
} = require("./promotionAdminDryRunEnablementRunbook");
const { buildPromotionAdminDryRunMountAuthorization } = require("./promotionAdminDryRunMountAuthorization");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-FINAL-READINESS-41";
const FINAL_READINESS_TYPE = "promotionAdminDryRunFinalReadiness";
const FINAL_READINESS_MODE = "record_only";
const FINAL_READINESS_STATUS = "final_readiness_record_only_runtime_not_enabled";
const CHAIN_STATUS = "phase_32_to_40_closed";
const FINAL_READINESS_SUMMARY_STATUS = "ready_for_separate_runtime_decision";
const DECISION_STATUS = "not_approved_for_runtime";
const NOT_ENABLED_REASON =
  "Promotion admin dry-run final readiness is record only and runtime remains not enabled until a separate approved runtime phase exists.";
const REQUIRED_SEPARATE_RUNTIME_PHASE = true;
const COVERED_PHASES = Object.freeze([
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-PREVIEW-32",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39",
  "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HOUSEKEEPING-40",
  PHASE,
]);
const FINAL_READINESS_BLOCKING_REASONS = Object.freeze([
  "FINAL_READINESS_RECORD_ONLY",
  "SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED",
  "RUNTIME_NOT_APPROVED_IN_PHASE_41",
  "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_41",
]);
const SAFETY_FLAGS = Object.freeze({
  noDbWrite: true,
  noPromotionUpdate: true,
  noAuditRowCreation: true,
  noLedgerCreation: true,
  noTurnoverCreation: true,
  noClaimExecution: true,
  noRuntimeCreditAction: true,
  noProviderOutbound: true,
  noProductionDeploy: true,
});

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function cloneObject(value) {
  return isPlainObject(value) ? Object.assign({}, value) : {};
}

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function hasTruthyFlag(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function dedupeStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const normalized = normalizeString(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function normalizeApprovalChecklist(approvalChecklistLike) {
  const approvalChecklist = isPlainObject(approvalChecklistLike) ? approvalChecklistLike : {};
  return {
    productOwnerApproved: hasTruthyFlag(approvalChecklist.productOwnerApproved),
    technicalLeadApproved: hasTruthyFlag(approvalChecklist.technicalLeadApproved),
    securityApproved: hasTruthyFlag(approvalChecklist.securityApproved),
    rollbackPlanAccepted: hasTruthyFlag(approvalChecklist.rollbackPlanAccepted),
    monitoringPlanAccepted: hasTruthyFlag(approvalChecklist.monitoringPlanAccepted),
    stagingUatPassed: hasTruthyFlag(approvalChecklist.stagingUatPassed),
    productionWindowApproved: hasTruthyFlag(approvalChecklist.productionWindowApproved),
  };
}

function normalizeFinalDecision(finalDecisionLike) {
  const finalDecision = isPlainObject(finalDecisionLike) ? finalDecisionLike : {};
  const decision = normalizeString(finalDecision.decision);
  return {
    requested: hasTruthyFlag(finalDecision.requested),
    requestedBy: finalDecision.requestedBy === undefined ? null : finalDecision.requestedBy,
    decision: decision || "not_requested",
    decisionReason: normalizeString(finalDecision.decisionReason),
    separateRuntimePhaseRequired: true,
  };
}

function getPhaseReadinessNotes() {
  return {
    phase: PHASE,
    finalReadinessType: FINAL_READINESS_TYPE,
    finalReadinessMode: FINAL_READINESS_MODE,
    status: FINAL_READINESS_STATUS,
    chainStatus: CHAIN_STATUS,
    finalReadinessStatus: FINAL_READINESS_SUMMARY_STATUS,
    decisionStatus: DECISION_STATUS,
    requiredSeparateRuntimePhase: REQUIRED_SEPARATE_RUNTIME_PHASE,
    coveredPhases: cloneArray(COVERED_PHASES),
    blockingReasons: cloneArray(FINAL_READINESS_BLOCKING_REASONS),
    notEnabledReason: NOT_ENABLED_REASON,
  };
}

function buildFinalReadinessResponse({
  finalReadinessType,
  finalReadinessMode,
  status,
  message,
  enablementRunbook,
  mountAuthorization,
  approvalSummary,
  decisionSummary,
  finalReadinessRecord,
  bodyOverrides,
  code,
}) {
  const baseRecord = finalReadinessRecord || getPhaseReadinessNotes();
  const body = Object.assign(
    {
      ok: status === 200,
      code: code || null,
      message: message || "Promotion admin dry-run final readiness record is ready.",
      finalReadinessType,
      finalReadinessMode,
      status: FINAL_READINESS_STATUS,
      bodyStatus: FINAL_READINESS_STATUS,
      phase: PHASE,
      chainStatus: baseRecord.chainStatus,
      coveredPhases: cloneArray(baseRecord.coveredPhases),
      finalReadinessStatus: baseRecord.finalReadinessStatus,
      decisionStatus: baseRecord.decisionStatus,
      requiredBeforeRuntime: cloneArray(baseRecord.requiredBeforeRuntime),
      requiredSeparateRuntimePhase: true,
      blockingReasons: cloneArray(baseRecord.blockingReasons),
      notEnabledReason: baseRecord.notEnabledReason,
      enablementRunbook,
      mountAuthorization,
      approvalSummary,
      decisionSummary,
      finalReadinessRecord: Object.assign({}, baseRecord, {
        coveredPhases: cloneArray(baseRecord.coveredPhases),
        requiredBeforeRuntime: cloneArray(baseRecord.requiredBeforeRuntime),
        blockingReasons: cloneArray(baseRecord.blockingReasons),
      }),
      canRequestRuntimeImplementation: false,
      canMountRoute: false,
      canEnableRuntime: false,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      routeMounted: false,
      expressMounted: false,
      controllerMounted: false,
      serviceMounted: false,
      auditRuntimeEnabled: false,
      ledgerRuntimeEnabled: false,
      runtimeHandlerEnabled: false,
      serviceRuntimeEnabled: false,
      apiCallEnabled: false,
      writeLocked: true,
      readinessOnly: true,
      recordOnly: true,
      safetyFlags: Object.assign({}, SAFETY_FLAGS),
    },
    bodyOverrides || {}
  );

  return {
    finalReadinessType,
    finalReadinessMode: FINAL_READINESS_MODE,
    status,
    body,
    finalReadinessRecord: body.finalReadinessRecord,
    enablementRunbook: body.enablementRunbook,
    mountAuthorization: body.mountAuthorization,
    approvalSummary: body.approvalSummary,
    decisionSummary: body.decisionSummary,
    canRequestRuntimeImplementation: false,
    canMountRoute: false,
    canEnableRuntime: false,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    routeMounted: false,
    expressMounted: false,
    controllerMounted: false,
    serviceMounted: false,
    auditRuntimeEnabled: false,
    ledgerRuntimeEnabled: false,
    runtimeHandlerEnabled: false,
    serviceRuntimeEnabled: false,
    apiCallEnabled: false,
    writeLocked: true,
    readinessOnly: true,
    recordOnly: true,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function buildPromotionAdminDryRunFinalReadinessRecord() {
  const enablementRunbook = buildPromotionAdminDryRunEnablementRunbook();
  const mountAuthorization = enablementRunbook.mountAuthorization || buildPromotionAdminDryRunMountAuthorization();
  const contract = getPromotionAdminDryRunApiContract();
  const finalReadinessRecord = Object.assign({}, getPhaseReadinessNotes(), {
    requiredBeforeRuntime: [
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredPrechecks),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredRollbackSteps),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredMonitoringChecks),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredUatChecks),
      contract.endpoint.method,
      contract.endpoint.path,
      "record_only final readiness mode",
      "separate runtime implementation phase required",
      "runtime not approved in phase 41",
      "route not mounted",
      "runtime not enabled",
      "write locked",
      "no DB write",
      "no promotion update",
      "no audit row creation",
      "no ledger creation",
      "no turnover creation",
      "no claim execution",
      "no runtime credit action",
      "no provider outbound",
      "no production deploy",
    ],
    blockingReasons: dedupeStrings([
      ...FINAL_READINESS_BLOCKING_REASONS,
      ...(enablementRunbook.enablementRunbook ? enablementRunbook.enablementRunbook.blockingReasons : []),
      ...(mountAuthorization.blockingReasons || []),
    ]),
  });
  const approvalSummary = Object.assign(
    {
      checklistType: "promotionAdminDryRunEnablementRunbook",
      requiredCount: 7,
      approvedCount: 0,
      missingApprovals: [
        "PRODUCT_OWNER_APPROVAL_REQUIRED",
        "TECHNICAL_LEAD_APPROVAL_REQUIRED",
        "SECURITY_APPROVAL_REQUIRED",
        "ROLLBACK_PLAN_REQUIRED",
        "MONITORING_PLAN_REQUIRED",
        "STAGING_UAT_REQUIRED",
        "PRODUCTION_WINDOW_APPROVAL_REQUIRED",
      ],
      allApproved: false,
      mountRequested: false,
      operatorApproved: false,
    },
    enablementRunbook.approvalSummary || {}
  );
  const decisionSummary = {
    requested: false,
    requestedBy: null,
    decision: "not_requested",
    decisionReason: "",
    separateRuntimePhaseRequired: true,
  };

  return buildFinalReadinessResponse({
    finalReadinessType: FINAL_READINESS_TYPE,
    finalReadinessMode: FINAL_READINESS_MODE,
    status: FINAL_READINESS_STATUS,
    message: "Promotion admin dry-run final readiness record is ready for a separate runtime decision.",
    enablementRunbook,
    mountAuthorization,
    approvalSummary,
    decisionSummary,
    finalReadinessRecord,
  });
}

function buildNotFoundResponse(input, code, message) {
  const metadata = buildPromotionAdminDryRunFinalReadinessRecord();
  const requestedFinalReadinessType = normalizeString(input.finalReadinessType) || FINAL_READINESS_TYPE;
  return buildFinalReadinessResponse({
    finalReadinessType: requestedFinalReadinessType,
    finalReadinessMode: FINAL_READINESS_MODE,
    status: 404,
    code,
    message,
    enablementRunbook: metadata.enablementRunbook,
    mountAuthorization: metadata.mountAuthorization,
    approvalSummary: metadata.approvalSummary,
    decisionSummary: metadata.decisionSummary,
    finalReadinessRecord: Object.assign({}, metadata.finalReadinessRecord, {
      blockingReasons: dedupeStrings([
        code,
        ...FINAL_READINESS_BLOCKING_REASONS,
        ...(metadata.finalReadinessRecord && metadata.finalReadinessRecord.blockingReasons ? metadata.finalReadinessRecord.blockingReasons : []),
      ]),
    }),
  });
}

function buildFinalReadinessRequestShape(input) {
  const finalDecision = normalizeFinalDecision(input.finalDecision);
  const enablementRunbook = isPlainObject(input.enablementRunbook) ? input.enablementRunbook : {};
  const mountAuthorization = isPlainObject(enablementRunbook.mountAuthorization)
    ? enablementRunbook.mountAuthorization
    : {};
  const runtimePreflight = isPlainObject(mountAuthorization.runtimePreflight) ? mountAuthorization.runtimePreflight : {};
  const auditLedgerPlan = isPlainObject(runtimePreflight.auditLedgerPlan) ? runtimePreflight.auditLedgerPlan : {};
  const serviceOperation = isPlainObject(auditLedgerPlan.serviceOperation) ? auditLedgerPlan.serviceOperation : {};
  const controllerAction = isPlainObject(serviceOperation.controllerAction) ? serviceOperation.controllerAction : {};
  const request = isPlainObject(controllerAction.request) ? controllerAction.request : {};
  const body = isPlainObject(request.body) ? request.body : {};

  return {
    finalReadinessType: normalizeString(input.finalReadinessType) || FINAL_READINESS_TYPE,
    finalReadinessMode: FINAL_READINESS_MODE,
    finalDecision,
    enablementRunbook: {
      checklistType: normalizeString(enablementRunbook.checklistType) || "promotionAdminDryRunEnablementRunbook",
      runbookMode: FINAL_READINESS_MODE,
      mountAuthorization: {
        authorizationType: normalizeString(mountAuthorization.authorizationType) || "promotionAdminDryRunMountAuthorization",
        authorizationMode: "gate_only",
        runtimePreflight: {
          preflightType: normalizeString(runtimePreflight.preflightType) || "promotionAdminDryRunRuntimePreflight",
          preflightMode: FINAL_READINESS_MODE,
          auditLedgerPlan: {
            planType: normalizeString(auditLedgerPlan.planType) || "promotionAdminDryRunAuditLedgerPlan",
            serviceOperation: {
              operation: normalizeString(serviceOperation.operation) || "dryRunPromotionUpdateService",
              controllerAction: {
                action: normalizeString(controllerAction.action) || "dryRunPromotionUpdate",
                request: {
                  method: normalizeString(request.method) || "POST",
                  path: normalizeString(request.path) || "/api/admin/promotions/:id/dry-run",
                  params: Object.assign({ id: "" }, cloneObject(request.params)),
                  actor: cloneObject(request.actor),
                  body: Object.assign(
                    {
                      before: null,
                      after: null,
                      auditReason: "",
                      riskAcknowledgement: false,
                    },
                    cloneObject(body)
                  ),
                },
              },
            },
          },
          runtimeChecks: cloneObject(runtimePreflight.runtimeChecks),
          operatorApproval: Object.assign(
            {
              approved: false,
              approvedBy: null,
              reason: "",
            },
            cloneObject(runtimePreflight.operatorApproval)
          ),
        },
        mountRequest: Object.assign(
          {
            requested: false,
            requestedBy: null,
            reason: "",
            targetRoute: "/api/admin/promotions/:id/dry-run",
          },
          cloneObject(mountAuthorization.mountRequest)
        ),
        approvalChecklist: normalizeApprovalChecklist(enablementRunbook.approvalChecklist),
      },
    },
  };
}

function simulatePromotionAdminDryRunFinalReadiness(finalReadinessLikeRequest) {
  const input = isPlainObject(finalReadinessLikeRequest) ? finalReadinessLikeRequest : {};
  const requestedFinalReadinessType = normalizeString(input.finalReadinessType);

  if (requestedFinalReadinessType && requestedFinalReadinessType !== FINAL_READINESS_TYPE) {
    return buildNotFoundResponse(input, "PROMOTION_DRY_RUN_FINAL_READINESS_NOT_FOUND", "Promotion admin dry-run final readiness is not mounted.");
  }

  const request = buildFinalReadinessRequestShape(input);
  const enablementResponse = simulatePromotionAdminDryRunEnablementChecklist({
    checklistType: request.enablementRunbook.checklistType,
    runbookMode: request.enablementRunbook.runbookMode,
    approvalChecklist: request.enablementRunbook.approvalChecklist,
    mountAuthorization: request.enablementRunbook.mountAuthorization,
  });

  if (enablementResponse.status !== 200) {
    const metadata = buildPromotionAdminDryRunFinalReadinessRecord();
    const requestedFinalDecision = normalizeFinalDecision(input.finalDecision);
    const blockingReasons = dedupeStrings([
      ...(enablementResponse.body && Array.isArray(enablementResponse.body.blockingReasons) ? enablementResponse.body.blockingReasons : []),
      ...FINAL_READINESS_BLOCKING_REASONS,
      ...(requestedFinalDecision.requested || requestedFinalDecision.decision === "approved"
        ? FINAL_READINESS_BLOCKING_REASONS
        : []),
    ]);

    return buildFinalReadinessResponse({
      finalReadinessType: requestedFinalReadinessType || FINAL_READINESS_TYPE,
      finalReadinessMode: FINAL_READINESS_MODE,
      status: enablementResponse.status,
      code: enablementResponse.body && enablementResponse.body.code ? enablementResponse.body.code : "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND",
      message:
        enablementResponse.body && enablementResponse.body.message
          ? enablementResponse.body.message
          : "Promotion admin dry-run enablement runbook is not mounted.",
      enablementRunbook: Object.assign({}, enablementResponse.enablementRunbook || metadata.enablementRunbook, {
        blockingReasons,
      }),
      mountAuthorization: Object.assign({}, enablementResponse.mountAuthorization || metadata.mountAuthorization),
      approvalSummary: Object.assign({}, enablementResponse.approvalSummary || metadata.approvalSummary),
      decisionSummary: Object.assign({}, requestedFinalDecision, {
        separateRuntimePhaseRequired: true,
      }),
      finalReadinessRecord: Object.assign({}, metadata.finalReadinessRecord, {
        blockingReasons,
      }),
    });
  }

  const enablementRunbook = enablementResponse.enablementRunbook || buildPromotionAdminDryRunEnablementRunbook();
  const mountAuthorization = enablementResponse.mountAuthorization || enablementRunbook.mountAuthorization || buildPromotionAdminDryRunMountAuthorization();
  const finalDecision = normalizeFinalDecision(input.finalDecision);
  const approvalSummary = Object.assign(
    {
      checklistType: "promotionAdminDryRunEnablementRunbook",
      requiredCount: 7,
      approvedCount: 0,
      missingApprovals: [],
      allApproved: false,
      mountRequested: false,
      operatorApproved: false,
    },
    enablementResponse.approvalSummary || {}
  );
  const finalBlockingReasons = dedupeStrings([
    ...(enablementResponse.body && Array.isArray(enablementResponse.body.blockingReasons) ? enablementResponse.body.blockingReasons : []),
    ...FINAL_READINESS_BLOCKING_REASONS,
  ]);
  const finalReadinessRecord = Object.assign({}, getPhaseReadinessNotes(), {
    requiredBeforeRuntime: [
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredPrechecks),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredRollbackSteps),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredMonitoringChecks),
      ...cloneArray(enablementRunbook.enablementRunbook && enablementRunbook.enablementRunbook.requiredUatChecks),
      "final readiness record only",
      "ready for separate runtime decision",
      "runtime not approved in phase 41",
      "separate runtime implementation phase required",
      "route not mounted",
      "runtime not enabled",
      "can request runtime implementation false",
      "can mount route false",
      "can enable runtime false",
      "write locked",
    ],
    blockingReasons: finalBlockingReasons,
  });

  if (finalDecision.requested || finalDecision.decision === "approved") {
    finalBlockingReasons.push(...FINAL_READINESS_BLOCKING_REASONS);
  }

  return buildFinalReadinessResponse({
    finalReadinessType: FINAL_READINESS_TYPE,
    finalReadinessMode: FINAL_READINESS_MODE,
    status: 200,
    message: "Promotion admin dry-run final readiness record is ready for a separate runtime decision.",
    enablementRunbook,
    mountAuthorization,
    approvalSummary,
    decisionSummary: Object.assign({}, finalDecision, {
      separateRuntimePhaseRequired: true,
    }),
    finalReadinessRecord: Object.assign({}, finalReadinessRecord, {
      blockingReasons: dedupeStrings(finalBlockingReasons),
    }),
  });
}

module.exports = {
  buildPromotionAdminDryRunFinalReadinessRecord,
  simulatePromotionAdminDryRunFinalReadiness,
};
