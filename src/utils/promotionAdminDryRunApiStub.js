"use strict";

const { validatePromotionAdminWriteDryRun } = require("./promotionAdminWriteValidator");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const NOT_MOUNTED_STATUS = "contract_only_not_mounted";
const BASE_FLAGS = Object.freeze({
  writeLocked: true,
  routeMounted: false,
  noDbWrite: true,
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

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function makeBaseResponse(overrides) {
  return Object.assign(
    {
      mode: "dry_run",
      contractOnly: true,
      contractStatus: NOT_MOUNTED_STATUS,
      message: "Promotion admin dry-run API stub is not mounted yet.",
    },
    BASE_FLAGS,
    overrides || {}
  );
}

function makeFailureResponse(code, message, overrides) {
  return makeBaseResponse(
    Object.assign(
      {
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
      overrides || {}
    )
  );
}

function mapValidationCode(errors) {
  const list = Array.isArray(errors) ? errors : [];
  if (list.some((item) => /auditReason is required/i.test(String(item)))) {
    return "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED";
  }
  if (list.some((item) => /riskAcknowledgement must be true/i.test(String(item)))) {
    return "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED";
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
    case "PROMOTION_DRY_RUN_NOT_MOUNTED":
      return "Promotion admin dry-run API is not mounted.";
    default:
      return "Promotion admin dry-run failed.";
  }
}

function simulatePromotionAdminDryRunApi(request) {
  const contract = getPromotionAdminDryRunApiContract();
  if (!contract || !contract.endpoint || contract.endpoint.status !== NOT_MOUNTED_STATUS) {
    return makeFailureResponse("PROMOTION_DRY_RUN_NOT_MOUNTED", mapValidationMessage("PROMOTION_DRY_RUN_NOT_MOUNTED"));
  }

  const input = isPlainObject(request) ? request : {};
  const params = isPlainObject(input.params) ? input.params : {};
  const body = isPlainObject(input.body) ? input.body : {};
  const actor = isPlainObject(input.actor) ? input.actor : {};
  const promotionId = normalizeString(params.id);

  if (!hasPermission(actor, "settings.promotion.write") && !hasPermission(actor, "settings.promotion.manage")) {
    return makeFailureResponse("PROMOTION_DRY_RUN_FORBIDDEN", mapValidationMessage("PROMOTION_DRY_RUN_FORBIDDEN"), {
      promotionId: promotionId || null,
    });
  }

  if (!promotionId) {
    return makeFailureResponse("PROMOTION_DRY_RUN_VALIDATION_FAILED", mapValidationMessage("PROMOTION_DRY_RUN_VALIDATION_FAILED"), {
      promotionId: null,
      errors: ["params.id is required"],
    });
  }

  const validation = validatePromotionAdminWriteDryRun(body);
  if (!validation.ok) {
    const code = mapValidationCode(validation.errors);
    return makeFailureResponse(code, mapValidationMessage(code), {
      promotionId,
      errors: cloneArray(validation.errors),
      warnings: cloneArray(validation.warnings),
      diff: cloneArray(validation.diff),
      riskSummary: validation.riskSummary,
    });
  }

  return makeBaseResponse({
    ok: true,
    promotionId,
    validator: "validatePromotionAdminWriteDryRun",
    warnings: cloneArray(validation.warnings),
    errors: cloneArray(validation.errors),
    diff: cloneArray(validation.diff),
    riskSummary: validation.riskSummary,
    audit: {
      required: true,
      reasonAccepted: true,
      actorId: Object.prototype.hasOwnProperty.call(actor, "id") ? actor.id : null,
    },
    message: "Promotion admin dry-run validated successfully.",
  });
}

module.exports = {
  simulatePromotionAdminDryRunApi,
};
