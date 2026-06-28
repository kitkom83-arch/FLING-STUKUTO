"use strict";

const {
  buildPromotionAdminDryRunServiceReadiness,
  simulatePromotionAdminDryRunServiceOperation,
} = require("./promotionAdminDryRunServiceReadiness");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36";
const PLAN_TYPE = "promotionAdminDryRunAuditLedgerPlan";
const DEFAULT_AUDIT_MODE = "plan_only";
const DEFAULT_LEDGER_MODE = "plan_only";
const NOT_MOUNTED_STATUS = "audit_ledger_readiness_only_not_mounted";
const AUDIT_PLAN_STATUS = "audit_plan_only_not_mounted";
const LEDGER_PLAN_STATUS = "ledger_plan_only_not_mounted";
const AUDIT_RUNTIME_STATUS = "audit_runtime_not_enabled";
const LEDGER_RUNTIME_STATUS = "ledger_runtime_not_enabled";
const SAFETY_FLAGS = Object.freeze({
  noDbWrite: true,
  noPromotionUpdate: true,
  noAuditRowCreation: true,
  noLedgerCreation: true,
  noTurnoverCreation: true,
  noClaimExecution: true,
  noRuntimeCreditAction: true,
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

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function cloneObject(value) {
  return isPlainObject(value) ? Object.assign({}, value) : {};
}

function emptyRiskSummary() {
  return {
    hasBonusRisk: false,
    hasTurnoverRisk: false,
    hasWithdrawRisk: false,
    hasEligibilityRisk: false,
    hasStatusRisk: false,
  };
}

function getRequestContext(input) {
  const serviceOperation = isPlainObject(input.serviceOperation) ? input.serviceOperation : {};
  const controllerAction = isPlainObject(serviceOperation.controllerAction) ? serviceOperation.controllerAction : {};
  const request = isPlainObject(controllerAction.request) ? controllerAction.request : {};
  const body = isPlainObject(request.body) ? request.body : {};
  const params = isPlainObject(request.params) ? request.params : {};
  const actor = isPlainObject(request.actor) ? request.actor : {};

  return {
    serviceOperation,
    controllerAction,
    request,
    body,
    params,
    actor,
  };
}

function buildAuditLedgerReadiness() {
  const serviceReadiness = buildPromotionAdminDryRunServiceReadiness();
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    planType: PLAN_TYPE,
    auditMode: DEFAULT_AUDIT_MODE,
    ledgerMode: DEFAULT_LEDGER_MODE,
    method: contract.endpoint.method,
    path: contract.endpoint.path,
    status: NOT_MOUNTED_STATUS,
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
    previewOnly: false,
    readinessOnly: true,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    auditLedgerReadiness: {
      phase: PHASE,
      servicePhase: serviceReadiness.phase,
      controllerPhase: serviceReadiness.serviceReadiness.controllerPhase,
      routePhase: serviceReadiness.serviceReadiness.routePhase,
      auditPlanStatus: AUDIT_PLAN_STATUS,
      ledgerPlanStatus: LEDGER_PLAN_STATUS,
      auditRuntimeStatus: AUDIT_RUNTIME_STATUS,
      ledgerRuntimeStatus: LEDGER_RUNTIME_STATUS,
      requiredAuditFields: [
        "planType",
        "serviceOperation",
        "controllerAction",
        "request.method",
        "request.path",
        "request.params.id",
        "request.body.before",
        "request.body.after",
        "request.body.auditReason",
        "request.body.riskAcknowledgement",
        "auditReason",
        "riskAcknowledgement",
        "request.actor.id",
        "request.actor.permissions",
      ],
      requiredLedgerFields: [
        "promotionId",
        "before",
        "after",
        "diffSummary",
        "riskSummary",
        "safetyFlags",
      ],
      notMountedReason: "Promotion admin dry-run audit/ledger readiness is intentionally unmounted.",
    },
    auditPlan: {
      plannedOnly: true,
      wouldRecordActorId: null,
      wouldRecordPromotionId: null,
      wouldRecordAuditReason: null,
      wouldRecordRiskAcknowledgement: false,
      wouldRecordDiffSummary: [],
      wouldRecordValidationOutcome: "not_mounted",
      auditRowCreated: false,
    },
    ledgerPlan: {
      plannedOnly: true,
      wouldRecordPromotionId: null,
      wouldRecordBeforeAfterDiff: [],
      wouldRecordRiskSummary: emptyRiskSummary(),
      wouldRecordSafetyFlags: Object.assign({}, SAFETY_FLAGS),
      ledgerCreated: false,
      turnoverRequirementCreated: false,
      runtimeCreditActionCreated: false,
    },
    serviceReadiness,
    controllerReadiness: serviceReadiness.controllerReadiness,
    routeReadiness: serviceReadiness.controllerReadiness ? serviceReadiness.controllerReadiness.routeReadiness : null,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function makeBaseBody(readiness, serviceResponse, context, status, code, message) {
  const serviceBody = serviceResponse && isPlainObject(serviceResponse.body) ? cloneObject(serviceResponse.body) : {};
  const diff = cloneArray(serviceBody.diff);
  const riskSummary = isPlainObject(serviceBody.riskSummary)
    ? Object.assign(emptyRiskSummary(), serviceBody.riskSummary)
    : emptyRiskSummary();
  const promotionId = normalizeString(serviceBody.promotionId || context.params.id) || null;
  const auditLedgerReadiness = Object.assign({}, readiness.auditLedgerReadiness, {
    servicePhase: readiness.serviceReadiness.phase,
    controllerPhase: readiness.serviceReadiness.serviceReadiness.controllerPhase,
    routePhase: readiness.serviceReadiness.serviceReadiness.routePhase,
  });
  const auditPlan = {
    plannedOnly: true,
    wouldRecordActorId: Object.prototype.hasOwnProperty.call(context.actor, "id") ? context.actor.id : null,
    wouldRecordPromotionId: promotionId,
    wouldRecordAuditReason: normalizeString(context.body.auditReason) || null,
    wouldRecordRiskAcknowledgement: context.body.riskAcknowledgement === true,
    wouldRecordDiffSummary: diff,
    wouldRecordValidationOutcome: serviceBody.ok === true ? "validated_ok" : normalizeString(serviceBody.code) || "validation_failed",
    auditRowCreated: false,
  };
  const ledgerPlan = {
    plannedOnly: true,
    wouldRecordPromotionId: promotionId,
    wouldRecordBeforeAfterDiff: diff,
    wouldRecordRiskSummary: riskSummary,
    wouldRecordSafetyFlags: Object.assign({}, readiness.safetyFlags),
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
  };
  const mergedSafetyFlags = Object.assign({}, readiness.safetyFlags, {
    noAuditRowCreation: true,
  });

  const body = Object.assign({}, serviceBody, {
    ok: status === 200 && serviceBody.ok === true,
    code: code || serviceBody.code || null,
    message: message || serviceBody.message || "Promotion admin dry-run audit/ledger readiness is ready.",
    planType: PLAN_TYPE,
    auditMode: DEFAULT_AUDIT_MODE,
    ledgerMode: DEFAULT_LEDGER_MODE,
    auditLedgerReadiness,
    auditPlan,
    ledgerPlan,
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
    previewOnly: false,
    readinessOnly: true,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    safetyFlags: mergedSafetyFlags,
  });

  return {
    planType: PLAN_TYPE,
    auditMode: DEFAULT_AUDIT_MODE,
    ledgerMode: DEFAULT_LEDGER_MODE,
    serviceOperation: serviceResponse && serviceResponse.serviceOperation ? serviceResponse.serviceOperation : context.serviceOperation.operation || "dryRunPromotionUpdateService",
    serviceMode: serviceResponse && serviceResponse.serviceMode ? serviceResponse.serviceMode : "validate_only",
    controllerAction: serviceResponse && serviceResponse.controllerAction ? serviceResponse.controllerAction : context.controllerAction.action || "dryRunPromotionUpdate",
    responseMode: serviceResponse && serviceResponse.responseMode ? serviceResponse.responseMode : "json",
    status,
    body,
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
    previewOnly: false,
    readinessOnly: true,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    auditLedgerReadiness,
    auditPlan,
    ledgerPlan,
    serviceReadiness: readiness.serviceReadiness,
    controllerReadiness: readiness.controllerReadiness,
    routeReadiness: readiness.routeReadiness,
    safetyFlags: mergedSafetyFlags,
  };
}

function buildPromotionAdminDryRunAuditLedgerReadiness() {
  return buildAuditLedgerReadiness();
}

function makePlanTypeNotMountedResponse(input, readiness) {
  const body = {
    ok: false,
    code: "PROMOTION_DRY_RUN_AUDIT_LEDGER_PLAN_NOT_MOUNTED",
    message: "Promotion admin dry-run audit/ledger plan is not mounted.",
    errors: [],
    warnings: [],
    diff: [],
    riskSummary: emptyRiskSummary(),
    promotionId: null,
  };
  const auditLedgerReadiness = Object.assign({}, readiness.auditLedgerReadiness);
  const auditPlan = Object.assign({}, readiness.auditPlan);
  const ledgerPlan = Object.assign({}, readiness.ledgerPlan);

  return {
    planType: normalizeString(input.planType) || PLAN_TYPE,
    auditMode: DEFAULT_AUDIT_MODE,
    ledgerMode: DEFAULT_LEDGER_MODE,
    status: 404,
    body: Object.assign({}, body, {
      planType: normalizeString(input.planType) || PLAN_TYPE,
      auditMode: DEFAULT_AUDIT_MODE,
      ledgerMode: DEFAULT_LEDGER_MODE,
      auditLedgerReadiness,
      auditPlan,
      ledgerPlan,
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
      previewOnly: false,
      readinessOnly: true,
      noDbWrite: true,
      noPromotionUpdate: true,
      noAuditRowCreation: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
      auditRowCreated: false,
      ledgerCreated: false,
      turnoverRequirementCreated: false,
      runtimeCreditActionCreated: false,
      safetyFlags: Object.assign({}, readiness.safetyFlags),
      serviceOperation: "dryRunPromotionUpdateService",
      serviceMode: "validate_only",
      controllerAction: "dryRunPromotionUpdate",
      responseMode: "json",
    }),
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
    previewOnly: false,
    readinessOnly: true,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    auditLedgerReadiness,
    auditPlan,
    ledgerPlan,
    serviceReadiness: readiness.serviceReadiness,
    controllerReadiness: readiness.controllerReadiness,
    routeReadiness: readiness.routeReadiness,
    safetyFlags: Object.assign({}, readiness.safetyFlags),
    serviceOperation: "dryRunPromotionUpdateService",
    serviceMode: "validate_only",
    controllerAction: "dryRunPromotionUpdate",
    responseMode: "json",
  };
}

function simulatePromotionAdminDryRunAuditLedgerPlan(auditLedgerLikeRequest) {
  const input = isPlainObject(auditLedgerLikeRequest) ? auditLedgerLikeRequest : {};
  const readiness = buildPromotionAdminDryRunAuditLedgerReadiness();
  const planType = normalizeString(input.planType);

  if (planType !== PLAN_TYPE) {
    return makePlanTypeNotMountedResponse(input, readiness);
  }

  const context = getRequestContext(input);
  const serviceResponse = simulatePromotionAdminDryRunServiceOperation(
    Object.assign({}, context.serviceOperation, {
      controllerAction: Object.assign({}, context.controllerAction, {
        request: Object.assign({}, context.request, {
          body: cloneObject(context.body),
          params: cloneObject(context.params),
          actor: cloneObject(context.actor),
        }),
      }),
    })
  );
  const status = serviceResponse && typeof serviceResponse.status === "number" ? serviceResponse.status : 500;
  const code = serviceResponse && serviceResponse.body && serviceResponse.body.code ? serviceResponse.body.code : null;
  const message = serviceResponse && serviceResponse.body && serviceResponse.body.message ? serviceResponse.body.message : null;

  return makeBaseBody(readiness, serviceResponse, context, status, code, message);
}

module.exports = {
  buildPromotionAdminDryRunAuditLedgerReadiness,
  simulatePromotionAdminDryRunAuditLedgerPlan,
};
