"use strict";

const { buildPromotionAdminDryRunRouteReadiness, simulatePromotionAdminDryRunRouteRequest } = require("./promotionAdminDryRunRouteReadiness");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34";
const CONTROLLER_ACTION = "dryRunPromotionUpdate";
const NOT_MOUNTED_STATUS = "controller_readiness_only_not_mounted";
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
});
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

function buildPromotionAdminDryRunControllerReadiness() {
  const routeReadiness = buildPromotionAdminDryRunRouteReadiness();
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    controllerAction: CONTROLLER_ACTION,
    method: "POST",
    path: ROUTE_PATH,
    status: NOT_MOUNTED_STATUS,
    routeMounted: false,
    expressMounted: false,
    controllerMounted: false,
    runtimeHandlerEnabled: false,
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
    controllerReadiness: {
      phase: PHASE,
      controllerAction: CONTROLLER_ACTION,
      routePhase: routeReadiness.phase,
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
      notMountedReason: "Promotion admin dry-run controller readiness is intentionally unmounted.",
      runtimeHandlerStatus: "controller_runtime_handler_not_enabled",
    },
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
    routeReadiness,
  };
}

function makeBodyFromRouteResponse(routeResponse, controllerAction, responseMode) {
  const routeBody = routeResponse && isPlainObject(routeResponse.body) ? Object.assign({}, routeResponse.body) : {};
  return Object.assign(
    {
      ok: false,
      code: "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED",
      message: "Promotion admin dry-run controller action is not mounted.",
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
    },
    routeBody,
    {
      controllerAction,
      responseMode,
    }
  );
}

function baseEnvelope() {
  const readiness = buildPromotionAdminDryRunControllerReadiness();
  return {
    controllerAction: CONTROLLER_ACTION,
    responseMode: "json",
    status: 200,
    headers: Object.assign({}, JSON_HEADERS),
    body: {
      ok: false,
      code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      message: "Promotion admin dry-run controller readiness failed.",
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
    },
    routeMounted: readiness.routeMounted,
    expressMounted: readiness.expressMounted,
    controllerMounted: readiness.controllerMounted,
    runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
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
    controllerReadiness: readiness.controllerReadiness,
    routeReadiness: readiness.routeReadiness,
    safetyFlags: readiness.safetyFlags,
  };
}

function cloneRouteResponse(routeResponse, controllerAction, responseMode) {
  const readiness = buildPromotionAdminDryRunControllerReadiness();
  const body = makeBodyFromRouteResponse(routeResponse, controllerAction, responseMode);
  const status = routeResponse && typeof routeResponse.status === "number" ? routeResponse.status : 200;

  return Object.assign(baseEnvelope(), {
    controllerAction,
    responseMode,
    status,
    headers: Object.assign({}, JSON_HEADERS),
    body,
    routeMounted: readiness.routeMounted,
    expressMounted: readiness.expressMounted,
    controllerMounted: readiness.controllerMounted,
    runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
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
    controllerReadiness: readiness.controllerReadiness,
    routeReadiness: routeResponse && isPlainObject(routeResponse.routeReadiness) ? routeResponse.routeReadiness : readiness.routeReadiness,
    safetyFlags: routeResponse && isPlainObject(routeResponse.safetyFlags)
      ? Object.assign({}, routeResponse.safetyFlags, readiness.safetyFlags)
      : readiness.safetyFlags,
  });
}

function simulatePromotionAdminDryRunControllerAction(controllerLikeRequest) {
  const input = isPlainObject(controllerLikeRequest) ? controllerLikeRequest : {};
  const action = normalizeString(input.action) || CONTROLLER_ACTION;
  const responseMode = "json";

  if (action !== CONTROLLER_ACTION) {
    const readiness = buildPromotionAdminDryRunControllerReadiness();
    return Object.assign(baseEnvelope(), {
      controllerAction: action,
      responseMode,
      status: 404,
      body: {
        ok: false,
        code: "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED",
        message: "Promotion admin dry-run controller action is not mounted.",
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
        controllerAction: action,
        responseMode,
      },
      routeMounted: readiness.routeMounted,
      expressMounted: readiness.expressMounted,
      controllerMounted: readiness.controllerMounted,
      runtimeHandlerEnabled: readiness.runtimeHandlerEnabled,
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
      controllerReadiness: readiness.controllerReadiness,
      routeReadiness: readiness.routeReadiness,
      safetyFlags: readiness.safetyFlags,
    });
  }

  const request = isPlainObject(input.request) ? input.request : {};
  const routeRequest = {
    method: normalizeString(request.method) || "POST",
    path: normalizeString(request.path) || ROUTE_PATH,
    params: cloneObject(request.params),
    body: cloneObject(request.body),
    actor: cloneObject(request.actor),
    headers: cloneObject(request.headers),
  };
  const routeResponse = simulatePromotionAdminDryRunRouteRequest(routeRequest);
  return cloneRouteResponse(routeResponse, action, responseMode);
}

module.exports = {
  buildPromotionAdminDryRunControllerReadiness,
  simulatePromotionAdminDryRunControllerAction,
};
