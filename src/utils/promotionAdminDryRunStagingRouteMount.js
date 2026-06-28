"use strict";

const { validatePromotionAdminWriteDryRun } = require("./promotionAdminWriteValidator");

const ROUTE_METHOD = "POST";
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const ROUTE_PATH_PATTERN = /^\/api\/admin\/promotions\/[^/]+\/dry-run$/;
const MOUNT_MODE = "staging_dry_run_only";
const CURRENT_READ_PERMISSION = "settings.promotion.view";
const FUTURE_DRY_RUN_PERMISSIONS = Object.freeze(["settings.promotion.write", "settings.promotion.manage"]);

const SAFETY_LOCKS = Object.freeze({
  dryRunOnly: true,
  validateOnly: true,
  writeLocked: true,
  routeMounted: true,
  apiCallEnabled: true,
  dbWriteEnabled: false,
  walletWriteEnabled: false,
  promotionUpdateEnabled: false,
  auditWriteEnabled: false,
  ledgerWriteEnabled: false,
  turnoverCreationEnabled: false,
  claimExecutionEnabled: false,
  providerOutboundEnabled: false,
  productionLiveEnabled: false,
  productionDeployEnabled: false,
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

function isPromotionAdminDryRunPath(path) {
  return path === ROUTE_PATH || ROUTE_PATH_PATTERN.test(path);
}

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function cloneObject(value) {
  return isPlainObject(value) ? Object.assign({}, value) : {};
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
  if (typeof permissions === "string") {
    return permissions
      .split(/[\s,]+/)
      .filter(Boolean)
      .some((item) => item === permission);
  }
  if (isPlainObject(permissions)) {
    return permissions[permission] === true || normalizeString(permissions[permission]) === "true";
  }

  return false;
}

function hasAnyPermission(actor, permissions) {
  return permissions.some((permission) => hasPermission(actor, permission));
}

function mapValidationCode(errors) {
  const list = Array.isArray(errors) ? errors : [];
  if (list.some((item) => /auditReason is required/i.test(String(item)))) {
    return "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED";
  }
  if (list.some((item) => /riskAcknowledgement must be true/i.test(String(item)))) {
    return "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED";
  }
  if (list.some((item) => /params\.id is required/i.test(String(item)))) {
    return "PROMOTION_DRY_RUN_VALIDATION_FAILED";
  }
  return "PROMOTION_DRY_RUN_VALIDATION_FAILED";
}

function mapValidationMessage(code) {
  switch (code) {
    case "PROMOTION_DRY_RUN_FORBIDDEN":
      return "Promotion admin dry-run is forbidden for the current actor.";
    case "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED":
      return "Promotion admin dry-run requires auditReason.";
    case "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED":
      return "Promotion admin dry-run requires riskAcknowledgement for risky changes.";
    case "PROMOTION_DRY_RUN_VALIDATION_FAILED":
      return "Promotion admin dry-run validation failed.";
    default:
      return "Promotion admin dry-run failed.";
  }
}

function buildResponse(status, code, message, overrides) {
  const body = Object.assign(
    {
      success: status < 400,
      code,
      message,
      mode: MOUNT_MODE,
      routeMounted: true,
      apiCallEnabled: true,
      dryRunOnly: true,
      validateOnly: true,
      writeLocked: true,
      dbWriteEnabled: false,
      walletWriteEnabled: false,
      promotionUpdateEnabled: false,
      auditWriteEnabled: false,
      ledgerWriteEnabled: false,
      turnoverCreationEnabled: false,
      claimExecutionEnabled: false,
      providerOutboundEnabled: false,
      productionLiveEnabled: false,
      productionDeployEnabled: false,
      mountedRoute: ROUTE_PATH,
      mountedMethod: ROUTE_METHOD,
      permissionBoundary: {
        currentReadPermission: CURRENT_READ_PERMISSION,
        futureDryRunPermissions: cloneArray(FUTURE_DRY_RUN_PERMISSIONS),
      },
      requestShape: {
        before: "plain object",
        after: "plain object",
        auditReason: "required string",
        riskAcknowledgement: "boolean",
      },
      responseShape: {
        mode: MOUNT_MODE,
        routeMounted: true,
        apiCallEnabled: true,
        dryRunOnly: true,
        validateOnly: true,
        writeLocked: true,
        dbWriteEnabled: false,
        walletWriteEnabled: false,
        promotionUpdateEnabled: false,
        auditWriteEnabled: false,
        ledgerWriteEnabled: false,
        turnoverCreationEnabled: false,
        claimExecutionEnabled: false,
        providerOutboundEnabled: false,
        productionLiveEnabled: false,
        productionDeployEnabled: false,
      },
      safetyLocks: Object.assign({}, SAFETY_LOCKS),
    },
    overrides || {}
  );

  return {
    status,
    body,
  };
}

function simulatePromotionAdminDryRunStagingRouteMount(request) {
  const input = isPlainObject(request) ? request : {};
  const method = normalizeString(input.method).toUpperCase();
  const path = normalizeString(input.path);
  const params = isPlainObject(input.params) ? input.params : {};
  const body = isPlainObject(input.body) ? input.body : {};
  const actor = isPlainObject(input.actor) ? input.actor : {};
  const promotionId = normalizeString(params.id);
  const routeMatched = method === ROUTE_METHOD && isPromotionAdminDryRunPath(path);

  if (!routeMatched) {
    return buildResponse(
      method !== ROUTE_METHOD ? 405 : 404,
      method !== ROUTE_METHOD ? "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED" : "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED",
      method !== ROUTE_METHOD
        ? "Promotion admin dry-run staging route mount accepts POST only."
        : "Promotion admin dry-run staging route mount is not mounted on that path.",
      {
        success: false,
        routeMounted: false,
        apiCallEnabled: false,
        dryRunOnly: false,
        validateOnly: false,
        mountedRoute: ROUTE_PATH,
        mountedMethod: ROUTE_METHOD,
      }
    );
  }

  if (!promotionId) {
    return buildResponse(400, "PROMOTION_DRY_RUN_VALIDATION_FAILED", "Promotion admin dry-run requires params.id.", {
      success: false,
      promotionId: null,
      routeMounted: true,
      apiCallEnabled: true,
      dryRunOnly: true,
      validateOnly: true,
      errors: ["params.id is required"],
    });
  }

  if (!hasAnyPermission(actor, FUTURE_DRY_RUN_PERMISSIONS)) {
    return buildResponse(403, "PROMOTION_DRY_RUN_FORBIDDEN", mapValidationMessage("PROMOTION_DRY_RUN_FORBIDDEN"), {
      success: false,
      promotionId,
      routeMounted: true,
      apiCallEnabled: true,
      dryRunOnly: true,
      validateOnly: true,
      errors: ["settings.promotion.write or settings.promotion.manage is required"],
      actorId: Object.prototype.hasOwnProperty.call(actor, "id") ? actor.id : null,
    });
  }

  const validation = validatePromotionAdminWriteDryRun(body);
  if (!validation.ok) {
    const code = mapValidationCode(validation.errors);
    return buildResponse(422, code, mapValidationMessage(code), {
      success: false,
      promotionId,
      routeMounted: true,
      apiCallEnabled: true,
      dryRunOnly: true,
      validateOnly: true,
      validator: "validatePromotionAdminWriteDryRun",
      errors: cloneArray(validation.errors),
      warnings: cloneArray(validation.warnings),
      diff: cloneArray(validation.diff),
      riskSummary: validation.riskSummary,
      actorId: Object.prototype.hasOwnProperty.call(actor, "id") ? actor.id : null,
    });
  }

  return buildResponse(200, null, "Promotion admin dry-run staging route mount validated successfully.", {
    success: true,
    promotionId,
    routeMounted: true,
    apiCallEnabled: true,
    dryRunOnly: true,
    validateOnly: true,
    validator: "validatePromotionAdminWriteDryRun",
    errors: cloneArray(validation.errors),
    warnings: cloneArray(validation.warnings),
    diff: cloneArray(validation.diff),
    riskSummary: validation.riskSummary,
    actorId: Object.prototype.hasOwnProperty.call(actor, "id") ? actor.id : null,
  });
}

module.exports = {
  ROUTE_METHOD,
  ROUTE_PATH,
  MOUNT_MODE,
  simulatePromotionAdminDryRunStagingRouteMount,
};
