"use strict";

const { simulatePromotionAdminDryRunApi } = require("./promotionAdminDryRunApiStub");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33";
const NOT_MOUNTED_STATUS = "readiness_only_not_mounted";
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const SAFETY_FLAGS = Object.freeze({
  noDbWrite: true,
  noLedgerCreation: true,
  noTurnoverCreation: true,
  noClaimExecution: true,
  noRuntimeCreditAction: true,
});

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.prototype.toString.call(value) === "[object Object]";
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

function getRouteReadinessMetadata() {
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    method: contract.endpoint.method,
    path: contract.endpoint.path,
    status: NOT_MOUNTED_STATUS,
    routeMounted: false,
    expressMounted: false,
    apiCallEnabled: false,
    writeLocked: true,
    previewOnly: false,
    readinessOnly: true,
    routeReadiness: {
      phase: PHASE,
      method: contract.endpoint.method,
      path: contract.endpoint.path,
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
      notMountedReason: "Promotion admin dry-run route readiness is intentionally unmounted.",
    },
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function makeResponse(status, code, message, overrides) {
  const metadata = getRouteReadinessMetadata();
  return Object.assign(
    {
      status,
      body: {
        ok: false,
        code,
        message,
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
      routeMounted: metadata.routeMounted,
      expressMounted: metadata.expressMounted,
      apiCallEnabled: metadata.apiCallEnabled,
      writeLocked: metadata.writeLocked,
      previewOnly: metadata.previewOnly,
      readinessOnly: metadata.readinessOnly,
      noDbWrite: metadata.safetyFlags.noDbWrite,
      noLedgerCreation: metadata.safetyFlags.noLedgerCreation,
      noTurnoverCreation: metadata.safetyFlags.noTurnoverCreation,
      noClaimExecution: metadata.safetyFlags.noClaimExecution,
      noRuntimeCreditAction: metadata.safetyFlags.noRuntimeCreditAction,
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    },
    overrides || {}
  );
}

function makeSuccessResponse(body, overrides) {
  const metadata = getRouteReadinessMetadata();
  return Object.assign(
    {
      status: 200,
      body,
      routeMounted: metadata.routeMounted,
      expressMounted: metadata.expressMounted,
      apiCallEnabled: metadata.apiCallEnabled,
      writeLocked: metadata.writeLocked,
      previewOnly: metadata.previewOnly,
      readinessOnly: metadata.readinessOnly,
      noDbWrite: metadata.safetyFlags.noDbWrite,
      noLedgerCreation: metadata.safetyFlags.noLedgerCreation,
      noTurnoverCreation: metadata.safetyFlags.noTurnoverCreation,
      noClaimExecution: metadata.safetyFlags.noClaimExecution,
      noRuntimeCreditAction: metadata.safetyFlags.noRuntimeCreditAction,
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    },
    overrides || {}
  );
}

function hasPermission(actor, permission) {
  if (!isPlainObject(actor)) return false;

  const permissions = actor.permissions;
  if (Array.isArray(permissions)) {
    return permissions.some((item) => normalizeString(item) === permission);
  }
  if (permissions instanceof Set) {
    return permissions.has(permission);
  }
  if (isPlainObject(permissions)) {
    return permissions[permission] === true || normalizeString(permissions[permission]) === "true";
  }
  if (typeof permissions === "string") {
    return permissions
      .split(/[\s,]+/)
      .filter(Boolean)
      .some((item) => item === permission);
  }

  return false;
}

function simulatePromotionAdminDryRunRouteRequest(httpLikeRequest) {
  const metadata = getRouteReadinessMetadata();
  const input = httpLikeRequest && typeof httpLikeRequest === "object" && !Array.isArray(httpLikeRequest) ? httpLikeRequest : {};
  const method = normalizeString(input.method).toUpperCase();
  const path = normalizeString(input.path);
  const params = isPlainObject(input.params) ? input.params : {};
  const body = isPlainObject(input.body) ? input.body : {};
  const actor = isPlainObject(input.actor) ? input.actor : {};
  const promotionId = normalizeString(params.id);

  if (method !== "POST") {
    return makeResponse(405, "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED", "Promotion admin dry-run route readiness accepts POST only.", {
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    });
  }

  if (path !== ROUTE_PATH) {
    return makeResponse(404, "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED", "Promotion admin dry-run route readiness is not mounted on that path.", {
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    });
  }

  if (!promotionId) {
    return makeResponse(400, "PROMOTION_DRY_RUN_VALIDATION_FAILED", "Promotion admin dry-run route readiness requires params.id.", {
      body: {
        ok: false,
        code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
        message: "Promotion admin dry-run route readiness requires params.id.",
        errors: ["params.id is required"],
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
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    });
  }

  if (!hasPermission(actor, "settings.promotion.write") && !hasPermission(actor, "settings.promotion.manage")) {
    return makeResponse(403, "PROMOTION_DRY_RUN_FORBIDDEN", "Promotion admin dry-run route readiness is forbidden for the current actor.", {
      body: {
        ok: false,
        code: "PROMOTION_DRY_RUN_FORBIDDEN",
        message: "Promotion admin dry-run route readiness is forbidden for the current actor.",
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
        promotionId,
      },
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    });
  }

  const stubResponse = simulatePromotionAdminDryRunApi(
    Object.assign({}, input, {
      params: Object.assign({}, params, { id: promotionId }),
      body: cloneObject(body),
      actor: cloneObject(actor),
    })
  );

  if (!stubResponse || stubResponse.ok !== true) {
    const code = stubResponse && stubResponse.code ? stubResponse.code : "PROMOTION_DRY_RUN_VALIDATION_FAILED";
    const status = code === "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED" || code === "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED" || code === "PROMOTION_DRY_RUN_VALIDATION_FAILED"
      ? 422
      : 500;
    return makeResponse(status, code, stubResponse && stubResponse.message ? stubResponse.message : "Promotion admin dry-run route readiness validation failed.", {
      body: Object.assign(
        {
          ok: false,
          code,
          message: stubResponse && stubResponse.message ? stubResponse.message : "Promotion admin dry-run route readiness validation failed.",
          errors: cloneArray(stubResponse && stubResponse.errors),
          warnings: cloneArray(stubResponse && stubResponse.warnings),
          diff: cloneArray(stubResponse && stubResponse.diff),
          riskSummary: stubResponse && isPlainObject(stubResponse.riskSummary)
            ? Object.assign({}, stubResponse.riskSummary)
            : {
                hasBonusRisk: false,
                hasTurnoverRisk: false,
                hasWithdrawRisk: false,
                hasEligibilityRisk: false,
                hasStatusRisk: false,
              },
          promotionId,
        },
        stubResponse || {}
      ),
      routeReadiness: metadata.routeReadiness,
      safetyFlags: metadata.safetyFlags,
    });
  }

  return makeSuccessResponse(stubResponse, {
    status: 200,
    body: Object.assign({}, stubResponse, {
      readinessOnly: true,
      routeMounted: false,
      expressMounted: false,
      apiCallEnabled: false,
      writeLocked: true,
      noDbWrite: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
    }),
    routeReadiness: metadata.routeReadiness,
    safetyFlags: metadata.safetyFlags,
  });
}

module.exports = {
  buildPromotionAdminDryRunRouteReadiness: getRouteReadinessMetadata,
  simulatePromotionAdminDryRunRouteRequest,
};
