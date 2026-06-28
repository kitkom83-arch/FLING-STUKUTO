"use strict";

const {
  buildPromotionAdminDryRunMountAuthorization,
  simulatePromotionAdminDryRunMountAuthorization,
} = require("./promotionAdminDryRunMountAuthorization");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39";
const CHECKLIST_TYPE = "promotionAdminDryRunEnablementRunbook";
const RUNBOOK_MODE = "readiness_only";
const RUNBOOK_STATUS = "enablement_runbook_readiness_only_not_enabled";
const ENABLEMENT_STATUS = "enablement_runbook_readiness_only_not_enabled";
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
const REQUIRED_APPROVAL_KEYS = Object.freeze([
  "productOwnerApproved",
  "technicalLeadApproved",
  "securityApproved",
  "rollbackPlanAccepted",
  "monitoringPlanAccepted",
  "stagingUatPassed",
  "productionWindowApproved",
]);
const APPROVAL_BLOCKING_REASON_MAP = Object.freeze({
  productOwnerApproved: "PRODUCT_OWNER_APPROVAL_REQUIRED",
  technicalLeadApproved: "TECHNICAL_LEAD_APPROVAL_REQUIRED",
  securityApproved: "SECURITY_APPROVAL_REQUIRED",
  rollbackPlanAccepted: "ROLLBACK_PLAN_REQUIRED",
  monitoringPlanAccepted: "MONITORING_PLAN_REQUIRED",
  stagingUatPassed: "STAGING_UAT_REQUIRED",
  productionWindowApproved: "PRODUCTION_WINDOW_APPROVAL_REQUIRED",
});
const REQUIRED_PRECHECKS = Object.freeze([
  "promotion admin dry-run mount authorization gate from phase 38",
  "runtime preflight readiness only from phase 37",
  "readiness_only runbook mode",
  "approval checklist completeness",
  "settings.promotion.write or settings.promotion.manage permission boundary",
  "no DB write",
  "no promotion update",
  "no audit row creation",
  "no ledger creation",
  "no turnover creation",
  "no claim execution",
  "no runtime credit action",
  "no provider outbound",
  "no production deploy",
]);
const REQUIRED_ROLLBACK_STEPS = Object.freeze([
  "rollback plan accepted before any future runtime gate",
  "route remains unmounted",
  "runtime remains disabled",
  "write locked remains true",
]);
const REQUIRED_MONITORING_CHECKS = Object.freeze([
  "monitoring plan accepted before any future runtime gate",
  "monitoring stays local-safe and read-only",
  "no live provider outbound",
  "no production deploy",
]);
const REQUIRED_UAT_CHECKS = Object.freeze([
  "staging UAT passed before any future runtime gate",
  "staging approval records are complete",
  "no production DB touch",
  "no production deploy",
]);

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function cloneObject(value) {
  return isPlainObject(value) ? Object.assign({}, value) : {};
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

function getMountAuthorizationRequest(input) {
  const mountAuthorization = isPlainObject(input.mountAuthorization) ? input.mountAuthorization : {};
  const runtimePreflight = isPlainObject(mountAuthorization.runtimePreflight) ? mountAuthorization.runtimePreflight : {};
  const auditLedgerPlan = isPlainObject(runtimePreflight.auditLedgerPlan) ? runtimePreflight.auditLedgerPlan : {};
  const serviceOperation = isPlainObject(auditLedgerPlan.serviceOperation) ? auditLedgerPlan.serviceOperation : {};
  const controllerAction = isPlainObject(serviceOperation.controllerAction) ? serviceOperation.controllerAction : {};
  const request = isPlainObject(controllerAction.request) ? controllerAction.request : {};
  const body = isPlainObject(request.body) ? request.body : {};
  const params = isPlainObject(request.params) ? request.params : {};
  const actor = isPlainObject(request.actor) ? request.actor : {};

  return {
    authorizationType: normalizeString(mountAuthorization.authorizationType) || "promotionAdminDryRunMountAuthorization",
    authorizationMode: normalizeString(mountAuthorization.authorizationMode) || "gate_only",
    runtimePreflight: {
      preflightType: normalizeString(runtimePreflight.preflightType) || "promotionAdminDryRunRuntimePreflight",
      preflightMode: normalizeString(runtimePreflight.preflightMode) || RUNBOOK_MODE,
      auditLedgerPlan: {
        planType: normalizeString(auditLedgerPlan.planType) || "promotionAdminDryRunAuditLedgerPlan",
        serviceOperation: {
          operation: normalizeString(serviceOperation.operation) || "dryRunPromotionUpdateService",
          controllerAction: {
            action: normalizeString(controllerAction.action) || "dryRunPromotionUpdate",
            request: {
              method: normalizeString(request.method) || "POST",
              path: normalizeString(request.path) || "/api/admin/promotions/:id/dry-run",
              params: Object.assign({ id: "" }, cloneObject(params)),
              actor: cloneObject(actor),
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
    mountRequest: Object.assign({ requested: false, requestedBy: null, reason: "", targetRoute: "/api/admin/promotions/:id/dry-run" }, cloneObject(mountAuthorization.mountRequest)),
  };
}

function getApprovalChecklist(input) {
  const approvalChecklist = isPlainObject(input.approvalChecklist) ? input.approvalChecklist : {};
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

function getApprovalBlockingReasons(approvalChecklist) {
  const reasons = [];
  for (const key of REQUIRED_APPROVAL_KEYS) {
    if (!approvalChecklist[key]) reasons.push(APPROVAL_BLOCKING_REASON_MAP[key]);
  }
  return dedupeStrings(reasons);
}

function getApprovalSummary(approvalChecklist, mountRequest, operatorApproval) {
  const missingApprovals = getApprovalBlockingReasons(approvalChecklist);
  const approvedCount = REQUIRED_APPROVAL_KEYS.length - missingApprovals.length;
  return {
    checklistType: CHECKLIST_TYPE,
    requiredCount: REQUIRED_APPROVAL_KEYS.length,
    approvedCount,
    missingApprovals,
    allApproved: missingApprovals.length === 0,
    mountRequested: !!(mountRequest && mountRequest.requested),
    operatorApproved: !!(operatorApproval && operatorApproval.approved),
  };
}

function buildEnablementRunbookMetadata() {
  const mountAuthorization = buildPromotionAdminDryRunMountAuthorization();
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    checklistType: CHECKLIST_TYPE,
    runbookMode: RUNBOOK_MODE,
    status: RUNBOOK_STATUS,
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
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    noProviderOutbound: true,
    noProductionDeploy: true,
    approvalSummary: {
      checklistType: CHECKLIST_TYPE,
      requiredCount: REQUIRED_APPROVAL_KEYS.length,
      approvedCount: 0,
      missingApprovals: REQUIRED_APPROVAL_KEYS.map((key) => APPROVAL_BLOCKING_REASON_MAP[key]),
      allApproved: false,
      mountRequested: false,
      operatorApproved: false,
    },
    rollbackPlan: {
      required: true,
      accepted: false,
      steps: cloneArray(REQUIRED_ROLLBACK_STEPS),
    },
    monitoringPlan: {
      required: true,
      accepted: false,
      checks: cloneArray(REQUIRED_MONITORING_CHECKS),
    },
    uatPlan: {
      required: true,
      passed: false,
      checks: cloneArray(REQUIRED_UAT_CHECKS),
    },
    enablementRunbook: {
      phase: PHASE,
      mountAuthorizationPhase: mountAuthorization.phase,
      runtimePreflightPhase: mountAuthorization.runtimePreflight.phase,
      runbookStatus: RUNBOOK_STATUS,
      enablementStatus: ENABLEMENT_STATUS,
      requiredApprovals: cloneArray(REQUIRED_APPROVAL_KEYS),
      requiredPrechecks: cloneArray(REQUIRED_PRECHECKS),
      requiredRollbackSteps: cloneArray(REQUIRED_ROLLBACK_STEPS),
      requiredMonitoringChecks: cloneArray(REQUIRED_MONITORING_CHECKS),
      requiredUatChecks: cloneArray(REQUIRED_UAT_CHECKS),
      blockingReasons: REQUIRED_APPROVAL_KEYS.map((key) => APPROVAL_BLOCKING_REASON_MAP[key]),
      notEnabledReason: "Promotion admin dry-run enablement runbook is readiness-only and runtime remains not enabled.",
      targetRoute: contract.endpoint.path,
      targetMethod: contract.endpoint.method,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
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
      noDbWrite: true,
      noPromotionUpdate: true,
      noAuditRowCreation: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
      noProviderOutbound: true,
      noProductionDeploy: true,
    },
    mountAuthorizationPhase: mountAuthorization.phase,
    runtimePreflightPhase: mountAuthorization.runtimePreflight.phase,
    mountAuthorization,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function buildEnablementResponseFromMetadata(metadata, extras) {
  const approvalSummary = extras.approvalSummary || metadata.approvalSummary;
  const rollbackPlan = extras.rollbackPlan || metadata.rollbackPlan;
  const monitoringPlan = extras.monitoringPlan || metadata.monitoringPlan;
  const uatPlan = extras.uatPlan || metadata.uatPlan;
  const body = Object.assign(
    {
      ok: true,
      code: null,
      message: "Promotion admin dry-run enablement runbook is readiness only and runtime is not enabled.",
      checklistType: CHECKLIST_TYPE,
      runbookMode: RUNBOOK_MODE,
      requestedRunbookMode: RUNBOOK_MODE,
      effectiveRunbookMode: RUNBOOK_MODE,
      approvalSummary,
      rollbackPlan,
      monitoringPlan,
      uatPlan,
      blockingReasons: cloneArray(metadata.enablementRunbook.blockingReasons),
      mountRequest: cloneObject(extras.mountRequest),
      operatorApproval: cloneObject(extras.operatorApproval),
      mountAuthorization: Object.assign({}, extras.mountAuthorization),
      enablementRunbook: Object.assign({}, metadata.enablementRunbook, {
        blockingReasons: cloneArray(metadata.enablementRunbook.blockingReasons),
      }),
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    },
    extras.bodyOverrides || {}
  );

  return {
    checklistType: CHECKLIST_TYPE,
    runbookMode: RUNBOOK_MODE,
    status: 200,
    body,
    enablementRunbook: body.enablementRunbook,
    approvalSummary,
    rollbackPlan,
    monitoringPlan,
    uatPlan,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
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
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    noProviderOutbound: true,
    noProductionDeploy: true,
    mountAuthorization: Object.assign({}, extras.mountAuthorization),
    mountAuthorizationPhase: metadata.mountAuthorizationPhase,
    runtimePreflightPhase: metadata.runtimePreflightPhase,
    safetyFlags: Object.assign({}, metadata.safetyFlags),
  };
}

function buildPromotionAdminDryRunEnablementRunbook() {
  return buildEnablementRunbookMetadata();
}

function simulatePromotionAdminDryRunEnablementChecklist(checklistLikeRequest) {
  const input = isPlainObject(checklistLikeRequest) ? checklistLikeRequest : {};
  const checklistType = normalizeString(input.checklistType);

  if (checklistType !== CHECKLIST_TYPE) {
    const metadata = buildEnablementRunbookMetadata();
    const body = {
      ok: false,
      code: "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND",
      message: "Promotion admin dry-run enablement runbook is not mounted.",
      checklistType: checklistType || CHECKLIST_TYPE,
      runbookMode: RUNBOOK_MODE,
      requestedRunbookMode: normalizeString(input.runbookMode) || RUNBOOK_MODE,
      effectiveRunbookMode: RUNBOOK_MODE,
      approvalSummary: metadata.approvalSummary,
      rollbackPlan: metadata.rollbackPlan,
      monitoringPlan: metadata.monitoringPlan,
      uatPlan: metadata.uatPlan,
      blockingReasons: cloneArray(metadata.enablementRunbook.blockingReasons),
      mountRequest: cloneObject(isPlainObject(input.mountAuthorization) ? input.mountAuthorization.mountRequest : input.mountRequest),
      operatorApproval: cloneObject(
        isPlainObject(input.mountAuthorization) && isPlainObject(input.mountAuthorization.runtimePreflight)
          ? input.mountAuthorization.runtimePreflight.operatorApproval
          : input.operatorApproval
      ),
      mountAuthorization: Object.assign({}, metadata.mountAuthorization),
      enablementRunbook: Object.assign({}, metadata.enablementRunbook),
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    };

    return {
      checklistType: body.checklistType,
      runbookMode: RUNBOOK_MODE,
      status: 404,
      body,
      enablementRunbook: body.enablementRunbook,
      approvalSummary: body.approvalSummary,
      rollbackPlan: body.rollbackPlan,
      monitoringPlan: body.monitoringPlan,
      uatPlan: body.uatPlan,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
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
      noDbWrite: true,
      noPromotionUpdate: true,
      noAuditRowCreation: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
      noProviderOutbound: true,
      noProductionDeploy: true,
      mountAuthorization: body.mountAuthorization,
      mountAuthorizationPhase: metadata.mountAuthorizationPhase,
      runtimePreflightPhase: metadata.runtimePreflightPhase,
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    };
  }

  const requestedRunbookMode = normalizeString(input.runbookMode);
  const effectiveRunbookMode = RUNBOOK_MODE;
  const mountRequest = isPlainObject(input.mountAuthorization) && isPlainObject(input.mountAuthorization.mountRequest)
    ? cloneObject(input.mountAuthorization.mountRequest)
    : cloneObject(input.mountRequest);
  const operatorApproval = isPlainObject(input.mountAuthorization) && isPlainObject(input.mountAuthorization.runtimePreflight)
    ? cloneObject(input.mountAuthorization.runtimePreflight.operatorApproval)
    : cloneObject(input.operatorApproval);
  const approvalChecklist = getApprovalChecklist(input);
  const approvalBlockingReasons = getApprovalBlockingReasons(approvalChecklist);
  const mountAuthorizationInput = getMountAuthorizationRequest(input);
  const mountAuthorizationResponse = simulatePromotionAdminDryRunMountAuthorization(
    Object.assign({}, mountAuthorizationInput, {
      authorizationType: mountAuthorizationInput.authorizationType,
      authorizationMode: "gate_only",
      mountRequest: Object.assign({}, mountRequest, {
        requested: hasTruthyFlag(mountRequest.requested),
      }),
      runtimePreflight: Object.assign({}, mountAuthorizationInput.runtimePreflight, {
        preflightMode: RUNBOOK_MODE,
        operatorApproval: Object.assign({}, operatorApproval, {
          approved: hasTruthyFlag(operatorApproval.approved),
        }),
      }),
    })
  );

  const metadata = buildEnablementRunbookMetadata();
  const blockingReasons = dedupeStrings(
    cloneArray(
      mountAuthorizationResponse && mountAuthorizationResponse.body && Array.isArray(mountAuthorizationResponse.body.blockingReasons)
        ? mountAuthorizationResponse.body.blockingReasons
        : metadata.enablementRunbook.blockingReasons
    ).concat(approvalBlockingReasons)
  );
  const approvalSummary = getApprovalSummary(
    approvalChecklist,
    mountRequest,
    Object.assign({}, operatorApproval, { approved: hasTruthyFlag(operatorApproval.approved) })
  );
  const baseResponse = {
    ok: true,
    code: null,
    message: "Promotion admin dry-run enablement runbook is readiness only and runtime is not enabled.",
    checklistType: CHECKLIST_TYPE,
    runbookMode: RUNBOOK_MODE,
    requestedRunbookMode: requestedRunbookMode || RUNBOOK_MODE,
    effectiveRunbookMode,
    approvalSummary,
    rollbackPlan: {
      required: true,
      accepted: approvalChecklist.rollbackPlanAccepted,
      steps: cloneArray(REQUIRED_ROLLBACK_STEPS),
    },
    monitoringPlan: {
      required: true,
      accepted: approvalChecklist.monitoringPlanAccepted,
      checks: cloneArray(REQUIRED_MONITORING_CHECKS),
    },
    uatPlan: {
      required: true,
      passed: approvalChecklist.stagingUatPassed,
      checks: cloneArray(REQUIRED_UAT_CHECKS),
    },
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
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
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    noProviderOutbound: true,
    noProductionDeploy: true,
    blockingReasons,
    mountRequest: Object.assign(
      {
        requested: false,
        requestedBy: null,
        reason: "",
        targetRoute: "/api/admin/promotions/:id/dry-run",
      },
      cloneObject(mountRequest)
    ),
    operatorApproval: Object.assign(
      {
        approved: false,
        approvedBy: null,
        reason: "",
      },
      cloneObject(operatorApproval)
    ),
    mountAuthorization: Object.assign({}, mountAuthorizationResponse),
    enablementRunbook: Object.assign({}, metadata.enablementRunbook, {
      blockingReasons,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
    }),
    safetyFlags: Object.assign({}, metadata.safetyFlags),
  };
  const responseBody = Object.assign({}, baseResponse, {
    ok: true,
    code: null,
    message: "Promotion admin dry-run enablement runbook is readiness only and runtime is not enabled.",
    requestedRunbookMode: requestedRunbookMode || RUNBOOK_MODE,
    effectiveRunbookMode,
    blockingReasons,
    mountAuthorization: Object.assign({}, mountAuthorizationResponse),
    enablementRunbook: Object.assign({}, metadata.enablementRunbook, {
      blockingReasons,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
    }),
    safetyFlags: Object.assign({}, metadata.safetyFlags),
  });

  if (mountAuthorizationResponse.status !== 200) {
    const failure = Object.assign({}, mountAuthorizationResponse, {
      checklistType: CHECKLIST_TYPE,
      runbookMode: RUNBOOK_MODE,
      status: mountAuthorizationResponse.status,
      body: Object.assign({}, mountAuthorizationResponse.body, responseBody, {
        ok: false,
        code: mountAuthorizationResponse.body && mountAuthorizationResponse.body.code ? mountAuthorizationResponse.body.code : "PROMOTION_DRY_RUN_ENABLEMENT_RUNBOOK_NOT_FOUND",
        message:
          mountAuthorizationResponse.body && mountAuthorizationResponse.body.message
            ? mountAuthorizationResponse.body.message
            : "Promotion admin dry-run enablement runbook is not mounted.",
        approvalSummary,
        rollbackPlan: baseResponse.rollbackPlan,
        monitoringPlan: baseResponse.monitoringPlan,
        uatPlan: baseResponse.uatPlan,
        blockingReasons,
        mountRequest: baseResponse.mountRequest,
        operatorApproval: baseResponse.operatorApproval,
        mountAuthorization: Object.assign({}, mountAuthorizationResponse),
        enablementRunbook: Object.assign({}, metadata.enablementRunbook, {
          blockingReasons,
          mountAuthorized: false,
          mountGranted: false,
          mountDenied: true,
        }),
        safetyFlags: Object.assign({}, metadata.safetyFlags),
      }),
      approvalSummary,
      rollbackPlan: baseResponse.rollbackPlan,
      monitoringPlan: baseResponse.monitoringPlan,
      uatPlan: baseResponse.uatPlan,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
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
      noDbWrite: true,
      noPromotionUpdate: true,
      noAuditRowCreation: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
      noProviderOutbound: true,
      noProductionDeploy: true,
      mountAuthorization: Object.assign({}, mountAuthorizationResponse),
      mountAuthorizationPhase: metadata.mountAuthorizationPhase,
      runtimePreflightPhase: metadata.runtimePreflightPhase,
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    });

    return failure;
  }

  return Object.assign({}, baseResponse, {
    status: 200,
    body: responseBody,
    enablementRunbook: responseBody.enablementRunbook,
    mountAuthorization: responseBody.mountAuthorization,
    mountAuthorizationPhase: metadata.mountAuthorizationPhase,
    runtimePreflightPhase: metadata.runtimePreflightPhase,
    approvalSummary,
    rollbackPlan: baseResponse.rollbackPlan,
    monitoringPlan: baseResponse.monitoringPlan,
    uatPlan: baseResponse.uatPlan,
    safetyFlags: Object.assign({}, metadata.safetyFlags),
  });
}

module.exports = {
  buildPromotionAdminDryRunEnablementRunbook,
  simulatePromotionAdminDryRunEnablementChecklist,
};
