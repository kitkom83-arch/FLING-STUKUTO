"use strict";

const { buildPromotionAdminDryRunControllerReadiness, simulatePromotionAdminDryRunControllerAction } = require("./promotionAdminDryRunControllerReadiness");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35";
const SERVICE_OPERATION = "dryRunPromotionUpdateService";
const DEFAULT_SERVICE_MODE = "validate_only";
const NOT_MOUNTED_STATUS = "service_readiness_only_not_mounted";
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const SAFETY_FLAGS = Object.freeze({
  noDbWrite: true,
  noPromotionUpdate: true,
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

function buildPromotionAdminDryRunServiceReadiness() {
  const controllerReadiness = buildPromotionAdminDryRunControllerReadiness();
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    serviceOperation: SERVICE_OPERATION,
    serviceMode: DEFAULT_SERVICE_MODE,
    method: "POST",
    path: ROUTE_PATH,
    status: NOT_MOUNTED_STATUS,
    routeMounted: false,
    expressMounted: false,
    controllerMounted: false,
    serviceMounted: false,
    runtimeHandlerEnabled: false,
    serviceRuntimeEnabled: false,
    apiCallEnabled: false,
    writeLocked: true,
    previewOnly: false,
    readinessOnly: true,
    noDbWrite: true,
    noPromotionUpdate: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    serviceReadiness: {
      phase: PHASE,
      serviceOperation: SERVICE_OPERATION,
      controllerPhase: controllerReadiness.phase,
      routePhase: controllerReadiness.routeReadiness.phase,
      method: "POST",
      path: ROUTE_PATH,
      contractStatus: contract.endpoint.status,
      permissionBoundary: {
        currentReadPermission: contract.permissions.currentReadPermission,
        futureDryRunPermissions: cloneArray(contract.permissions.futureDryRunPermissions),
      },
      requiredGuards: [
        "adminAuth",
        "siteAccess",
        "settings.promotion.write or settings.promotion.manage",
        "auditReason required",
        "riskAcknowledgement required when risky fields change",
      ],
      notMountedReason: "Promotion admin dry-run service readiness is intentionally unmounted.",
      runtimeHandlerStatus: "service_runtime_handler_not_enabled",
      serviceRuntimeStatus: "service_runtime_handler_not_enabled",
    },
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
    controllerReadiness,
  };
}

function makeBody(overrides) {
  return Object.assign(
    {
      ok: false,
      code: "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED",
      message: "Promotion admin dry-run service operation is not mounted.",
      errors: [],
      warnings: [],
      diff: [],
      riskSummary: {
        hasBonusRisk: false,
        hasTurnoverRisk: false,
        hasWithdrawRisk: false,
        hasEligibilityRisk: false,
        hasStatusRisk: false,
      },
      promotionId: null,
      controllerAction: null,
      serviceOperation: SERVICE_OPERATION,
      serviceMode: DEFAULT_SERVICE_MODE,
      responseMode: "json",
    },
    overrides || {}
  );
}

function makeEnvelope(overrides) {
  const readiness = buildPromotionAdminDryRunServiceReadiness();
  return Object.assign(
    {
      serviceOperation: SERVICE_OPERATION,
      serviceMode: DEFAULT_SERVICE_MODE,
      status: 200,
      body: makeBody(),
      routeMounted: readiness.routeMounted,
      expressMounted: readiness.expressMounted,
      controllerMounted: readiness.controllerMounted,
      serviceMounted: readiness.serviceMounted,
      runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
      serviceRuntimeEnabled: readiness.serviceRuntimeEnabled,
      apiCallEnabled: readiness.apiCallEnabled,
      writeLocked: readiness.writeLocked,
      previewOnly: readiness.previewOnly,
      readinessOnly: readiness.readinessOnly,
      noDbWrite: readiness.noDbWrite,
      noPromotionUpdate: readiness.noPromotionUpdate,
      noLedgerCreation: readiness.noLedgerCreation,
      noTurnoverCreation: readiness.noTurnoverCreation,
      noClaimExecution: readiness.noClaimExecution,
      noRuntimeCreditAction: readiness.noRuntimeCreditAction,
      serviceReadiness: readiness.serviceReadiness,
      controllerReadiness: readiness.controllerReadiness,
      safetyFlags: readiness.safetyFlags,
    },
    overrides || {}
  );
}

function cloneControllerResponse(controllerResponse, serviceMode) {
  const readiness = buildPromotionAdminDryRunServiceReadiness();
  const status = controllerResponse && typeof controllerResponse.status === "number" ? controllerResponse.status : 200;
  const controllerBody = controllerResponse && isPlainObject(controllerResponse.body) ? Object.assign({}, controllerResponse.body) : {};

  return Object.assign(makeEnvelope(), {
    serviceOperation: SERVICE_OPERATION,
    serviceMode: serviceMode || DEFAULT_SERVICE_MODE,
    status,
    body: Object.assign(
      makeBody({
        ok: !!controllerBody.ok,
        code: controllerBody.code,
        message: controllerBody.message,
        errors: cloneArray(controllerBody.errors),
        warnings: cloneArray(controllerBody.warnings),
        diff: cloneArray(controllerBody.diff),
        riskSummary: isPlainObject(controllerBody.riskSummary)
          ? Object.assign(
              {
                hasBonusRisk: false,
                hasTurnoverRisk: false,
                hasWithdrawRisk: false,
                hasEligibilityRisk: false,
                hasStatusRisk: false,
              },
              controllerBody.riskSummary
            )
          : {
              hasBonusRisk: false,
              hasTurnoverRisk: false,
              hasWithdrawRisk: false,
              hasEligibilityRisk: false,
              hasStatusRisk: false,
            },
        promotionId: controllerBody.promotionId || null,
        controllerAction: controllerBody.controllerAction || null,
        serviceOperation: SERVICE_OPERATION,
        serviceMode: serviceMode || DEFAULT_SERVICE_MODE,
        responseMode: "json",
      }),
      controllerBody,
      {
        controllerAction: controllerBody.controllerAction || null,
        serviceOperation: SERVICE_OPERATION,
        serviceMode: serviceMode || DEFAULT_SERVICE_MODE,
        responseMode: "json",
      }
    ),
    routeMounted: readiness.routeMounted,
    expressMounted: readiness.expressMounted,
    controllerMounted: readiness.controllerMounted,
    serviceMounted: readiness.serviceMounted,
    runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
    serviceRuntimeEnabled: readiness.serviceRuntimeEnabled,
    apiCallEnabled: readiness.apiCallEnabled,
    writeLocked: readiness.writeLocked,
    previewOnly: readiness.previewOnly,
    readinessOnly: readiness.readinessOnly,
    noDbWrite: readiness.noDbWrite,
    noPromotionUpdate: readiness.noPromotionUpdate,
    noLedgerCreation: readiness.noLedgerCreation,
    noTurnoverCreation: readiness.noTurnoverCreation,
    noClaimExecution: readiness.noClaimExecution,
    noRuntimeCreditAction: readiness.noRuntimeCreditAction,
    serviceReadiness: readiness.serviceReadiness,
    controllerReadiness: readiness.controllerReadiness,
    safetyFlags: Object.assign({}, readiness.safetyFlags, controllerResponse && isPlainObject(controllerResponse.safetyFlags) ? controllerResponse.safetyFlags : {}),
  });
}

function simulatePromotionAdminDryRunServiceOperation(serviceLikeRequest) {
  const input = isPlainObject(serviceLikeRequest) ? serviceLikeRequest : {};
  const operation = normalizeString(input.operation) || SERVICE_OPERATION;
  const requestedServiceMode = normalizeString(input.serviceMode);
  const serviceMode = requestedServiceMode === DEFAULT_SERVICE_MODE ? DEFAULT_SERVICE_MODE : DEFAULT_SERVICE_MODE;

  if (operation !== SERVICE_OPERATION) {
    const readiness = buildPromotionAdminDryRunServiceReadiness();
    return Object.assign(makeEnvelope(), {
      serviceOperation: operation,
      serviceMode: DEFAULT_SERVICE_MODE,
      status: 404,
      body: makeBody({
        ok: false,
        code: "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED",
        message: "Promotion admin dry-run service operation is not mounted.",
        serviceOperation: operation,
        serviceMode: DEFAULT_SERVICE_MODE,
      }),
      routeMounted: readiness.routeMounted,
      expressMounted: readiness.expressMounted,
      controllerMounted: readiness.controllerMounted,
      serviceMounted: readiness.serviceMounted,
      runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
      serviceRuntimeEnabled: readiness.serviceRuntimeEnabled,
      apiCallEnabled: readiness.apiCallEnabled,
      writeLocked: readiness.writeLocked,
      previewOnly: readiness.previewOnly,
      readinessOnly: readiness.readinessOnly,
      noDbWrite: readiness.noDbWrite,
      noPromotionUpdate: readiness.noPromotionUpdate,
      noLedgerCreation: readiness.noLedgerCreation,
      noTurnoverCreation: readiness.noTurnoverCreation,
      noClaimExecution: readiness.noClaimExecution,
      noRuntimeCreditAction: readiness.noRuntimeCreditAction,
      serviceReadiness: readiness.serviceReadiness,
      controllerReadiness: readiness.controllerReadiness,
      safetyFlags: readiness.safetyFlags,
    });
  }

  const controllerAction = isPlainObject(input.controllerAction) ? input.controllerAction : {};
  const controllerResponse = simulatePromotionAdminDryRunControllerAction(controllerAction);
  return cloneControllerResponse(controllerResponse, serviceMode);
}

module.exports = {
  buildPromotionAdminDryRunServiceReadiness,
  simulatePromotionAdminDryRunServiceOperation,
};
