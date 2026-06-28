"use strict";

const {
  buildPromotionAdminDryRunRuntimePreflight,
  simulatePromotionAdminDryRunRuntimePreflight,
} = require("./promotionAdminDryRunRuntimePreflight");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38";
const AUTHORIZATION_TYPE = "promotionAdminDryRunMountAuthorization";
const AUTHORIZATION_MODE = "gate_only";
const NOT_GRANTED_STATUS = "mount_authorization_gate_only_not_granted";
const MOUNT_STATUS = "mount_not_granted";
const RUNTIME_STATUS = "runtime_preflight_readiness_only_not_mounted";
const REQUIRED_PLAN_TYPE = "promotionAdminDryRunAuditLedgerPlan";
const REQUIRED_SERVICE_OPERATION = "dryRunPromotionUpdateService";
const REQUIRED_CONTROLLER_ACTION = "dryRunPromotionUpdate";
const REQUIRED_METHOD = "POST";
const REQUIRED_PATH = "/api/admin/promotions/:id/dry-run";
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

function cloneArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function cloneObject(value) {
  return isPlainObject(value) ? Object.assign({}, value) : {};
}

function hasTruthyFlag(value) {
  return value === true || value === "true" || value === 1 || value === "1";
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

function getRequiredPermission(actor) {
  if (hasPermission(actor, "settings.promotion.write")) return "settings.promotion.write";
  if (hasPermission(actor, "settings.promotion.manage")) return "settings.promotion.manage";
  return "";
}

function mapRuntimeChecks(runtimeChecks) {
  const input = isPlainObject(runtimeChecks) ? runtimeChecks : {};
  return {
    routeMount: hasTruthyFlag(input.routeExplicitlyMounted || input.routeMount),
    controllerRuntime: hasTruthyFlag(input.controllerRuntimeEnabled || input.controllerRuntime),
    serviceRuntime: hasTruthyFlag(input.serviceRuntimeEnabled || input.serviceRuntime),
    auditRuntime: hasTruthyFlag(input.auditRuntimeEnabled || input.auditRuntime),
    ledgerRuntime: hasTruthyFlag(input.ledgerRuntimeEnabled || input.ledgerRuntime),
    dbWrite: hasTruthyFlag(input.dbWriteEnabled || input.dbWrite),
    promotionUpdate: hasTruthyFlag(input.promotionUpdateEnabled || input.promotionUpdate),
    providerOutbound: hasTruthyFlag(input.providerOutboundEnabled || input.providerOutbound),
    productionDeploy: hasTruthyFlag(input.productionDeployEnabled || input.productionDeploy),
  };
}

function dedupeStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!value) continue;
    const normalized = normalizeString(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function buildMountAuthorizationMetadata() {
  const runtimePreflight = buildPromotionAdminDryRunRuntimePreflight();

  return {
    phase: PHASE,
    authorizationType: AUTHORIZATION_TYPE,
    authorizationMode: AUTHORIZATION_MODE,
    method: REQUIRED_METHOD,
    path: REQUIRED_PATH,
    status: NOT_GRANTED_STATUS,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
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
    noProviderOutbound: true,
    noProductionDeploy: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    mountRequested: false,
    runtimePreflight: runtimePreflight,
    auditLedgerReadiness: runtimePreflight.auditLedgerReadiness,
    mountAuthorization: {
      phase: PHASE,
      authorizationType: AUTHORIZATION_TYPE,
      authorizationMode: AUTHORIZATION_MODE,
      runtimePreflightPhase: runtimePreflight.phase,
      auditLedgerPhase: runtimePreflight.auditLedgerReadiness.phase,
      servicePhase: runtimePreflight.auditLedgerReadiness.serviceReadiness.phase,
      controllerPhase: runtimePreflight.auditLedgerReadiness.controllerReadiness.phase,
      routePhase: runtimePreflight.auditLedgerReadiness.routeReadiness.phase,
      authorizationStatus: NOT_GRANTED_STATUS,
      mountStatus: MOUNT_STATUS,
      runtimeStatus: runtimePreflight.status,
      requiredBeforeMount: [
        "authorizationType",
        "authorizationMode",
        "runtimePreflight.preflightType",
        "runtimePreflight.preflightMode",
        "runtimePreflight.auditLedgerPlan.planType",
        "runtimePreflight.auditLedgerPlan.serviceOperation.operation",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.action",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.method",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.path",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.params.id",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.body.before",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.body.after",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.body.auditReason",
        "runtimePreflight.auditLedgerPlan.serviceOperation.controllerAction.request.body.riskAcknowledgement",
        "runtimePreflight.runtimeChecks",
        "runtimePreflight.operatorApproval.approved",
        "mountRequest.requested",
      ],
      blockingReasons: [
        "MOUNT_AUTHORIZATION_GATE_ONLY",
        "MOUNT_NOT_GRANTED_BY_DEFAULT",
        "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38",
        "RUNTIME_ENABLEMENT_NOT_ALLOWED_IN_PHASE_38",
      ],
      notMountedReason: "Promotion admin dry-run mount authorization is gate only and mount is not granted.",
      mountRequested: false,
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
      previewOnly: false,
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
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function buildErrorResponse(status, code, message, bodyOverrides, metadataOverrides) {
  const metadata = buildMountAuthorizationMetadata();
  const body = Object.assign(
    {
      ok: false,
      code,
      message,
      errors: [],
      warnings: [],
      diff: [],
      riskSummary: emptyRiskSummary(),
      promotionId: null,
      authorizationType: AUTHORIZATION_TYPE,
      authorizationMode: AUTHORIZATION_MODE,
      mountRequested: false,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
      canEnableControllerRuntime: false,
      canEnableServiceRuntime: false,
      canEnableAuditRuntime: false,
      canEnableLedgerRuntime: false,
      canEnableDbWrite: false,
      canEnablePromotionUpdate: false,
      canEnableProviderOutbound: false,
      canEnableProductionDeploy: false,
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
      noProviderOutbound: true,
      noProductionDeploy: true,
      auditRowCreated: false,
      ledgerCreated: false,
      turnoverRequirementCreated: false,
      runtimeCreditActionCreated: false,
      runtimePreflight: metadata.runtimePreflight,
      auditLedgerReadiness: metadata.auditLedgerReadiness,
      mountAuthorization: Object.assign({}, metadata.mountAuthorization),
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    },
    bodyOverrides || {}
  );

  const response = {
    authorizationType: body.authorizationType,
    authorizationMode: body.authorizationMode,
    status,
    body,
    mountRequested: body.mountRequested,
    mountAuthorized: body.mountAuthorized,
    mountGranted: body.mountGranted,
    mountDenied: body.mountDenied,
    canMountRoute: body.canMountRoute,
    canEnableRuntime: body.canEnableRuntime,
    canEnableControllerRuntime: body.canEnableControllerRuntime,
    canEnableServiceRuntime: body.canEnableServiceRuntime,
    canEnableAuditRuntime: body.canEnableAuditRuntime,
    canEnableLedgerRuntime: body.canEnableLedgerRuntime,
    canEnableDbWrite: body.canEnableDbWrite,
    canEnablePromotionUpdate: body.canEnablePromotionUpdate,
    canEnableProviderOutbound: body.canEnableProviderOutbound,
    canEnableProductionDeploy: body.canEnableProductionDeploy,
    routeMounted: body.routeMounted,
    expressMounted: body.expressMounted,
    controllerMounted: body.controllerMounted,
    serviceMounted: body.serviceMounted,
    auditRuntimeEnabled: body.auditRuntimeEnabled,
    ledgerRuntimeEnabled: body.ledgerRuntimeEnabled,
    runtimeHandlerEnabled: body.runtimeHandlerEnabled,
    serviceRuntimeEnabled: body.serviceRuntimeEnabled,
    apiCallEnabled: body.apiCallEnabled,
    writeLocked: body.writeLocked,
    previewOnly: body.previewOnly,
    readinessOnly: body.readinessOnly,
    noDbWrite: body.noDbWrite,
    noPromotionUpdate: body.noPromotionUpdate,
    noAuditRowCreation: body.noAuditRowCreation,
    noLedgerCreation: body.noLedgerCreation,
    noTurnoverCreation: body.noTurnoverCreation,
    noClaimExecution: body.noClaimExecution,
    noRuntimeCreditAction: body.noRuntimeCreditAction,
    noProviderOutbound: body.noProviderOutbound,
    noProductionDeploy: body.noProductionDeploy,
    auditRowCreated: body.auditRowCreated,
    ledgerCreated: body.ledgerCreated,
    turnoverRequirementCreated: body.turnoverRequirementCreated,
    runtimeCreditActionCreated: body.runtimeCreditActionCreated,
    runtimePreflight: body.runtimePreflight,
    auditLedgerReadiness: body.auditLedgerReadiness,
    mountAuthorization: body.mountAuthorization,
    safetyFlags: body.safetyFlags,
  };

  if (metadataOverrides && isPlainObject(metadataOverrides.mountAuthorization)) {
    response.mountAuthorization = Object.assign({}, response.mountAuthorization, metadataOverrides.mountAuthorization);
    response.body.mountAuthorization = Object.assign({}, response.mountAuthorization);
  }

  return response;
}

function buildSuccessResponse(bodyOverrides, metadataOverrides) {
  const metadata = buildMountAuthorizationMetadata();
  const body = Object.assign(
    {
      ok: true,
      code: null,
      message: "Promotion admin dry-run mount authorization gate is ready.",
      errors: [],
      warnings: [],
      diff: [],
      riskSummary: emptyRiskSummary(),
      promotionId: null,
      authorizationType: AUTHORIZATION_TYPE,
      authorizationMode: AUTHORIZATION_MODE,
      mountRequested: false,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
      canEnableControllerRuntime: false,
      canEnableServiceRuntime: false,
      canEnableAuditRuntime: false,
      canEnableLedgerRuntime: false,
      canEnableDbWrite: false,
      canEnablePromotionUpdate: false,
      canEnableProviderOutbound: false,
      canEnableProductionDeploy: false,
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
      noProviderOutbound: true,
      noProductionDeploy: true,
      auditRowCreated: false,
      ledgerCreated: false,
      turnoverRequirementCreated: false,
      runtimeCreditActionCreated: false,
      runtimePreflight: metadata.runtimePreflight,
      auditLedgerReadiness: metadata.auditLedgerReadiness,
      mountAuthorization: Object.assign({}, metadata.mountAuthorization),
      safetyFlags: Object.assign({}, metadata.safetyFlags),
    },
    bodyOverrides || {}
  );

  const response = {
    authorizationType: body.authorizationType,
    authorizationMode: body.authorizationMode,
    status: 200,
    body,
    mountRequested: body.mountRequested,
    mountAuthorized: body.mountAuthorized,
    mountGranted: body.mountGranted,
    mountDenied: body.mountDenied,
    canMountRoute: body.canMountRoute,
    canEnableRuntime: body.canEnableRuntime,
    canEnableControllerRuntime: body.canEnableControllerRuntime,
    canEnableServiceRuntime: body.canEnableServiceRuntime,
    canEnableAuditRuntime: body.canEnableAuditRuntime,
    canEnableLedgerRuntime: body.canEnableLedgerRuntime,
    canEnableDbWrite: body.canEnableDbWrite,
    canEnablePromotionUpdate: body.canEnablePromotionUpdate,
    canEnableProviderOutbound: body.canEnableProviderOutbound,
    canEnableProductionDeploy: body.canEnableProductionDeploy,
    routeMounted: body.routeMounted,
    expressMounted: body.expressMounted,
    controllerMounted: body.controllerMounted,
    serviceMounted: body.serviceMounted,
    auditRuntimeEnabled: body.auditRuntimeEnabled,
    ledgerRuntimeEnabled: body.ledgerRuntimeEnabled,
    runtimeHandlerEnabled: body.runtimeHandlerEnabled,
    serviceRuntimeEnabled: body.serviceRuntimeEnabled,
    apiCallEnabled: body.apiCallEnabled,
    writeLocked: body.writeLocked,
    previewOnly: body.previewOnly,
    readinessOnly: body.readinessOnly,
    noDbWrite: body.noDbWrite,
    noPromotionUpdate: body.noPromotionUpdate,
    noAuditRowCreation: body.noAuditRowCreation,
    noLedgerCreation: body.noLedgerCreation,
    noTurnoverCreation: body.noTurnoverCreation,
    noClaimExecution: body.noClaimExecution,
    noRuntimeCreditAction: body.noRuntimeCreditAction,
    noProviderOutbound: body.noProviderOutbound,
    noProductionDeploy: body.noProductionDeploy,
    auditRowCreated: body.auditRowCreated,
    ledgerCreated: body.ledgerCreated,
    turnoverRequirementCreated: body.turnoverRequirementCreated,
    runtimeCreditActionCreated: body.runtimeCreditActionCreated,
    runtimePreflight: body.runtimePreflight,
    auditLedgerReadiness: body.auditLedgerReadiness,
    mountAuthorization: body.mountAuthorization,
    safetyFlags: body.safetyFlags,
  };

  if (metadataOverrides && isPlainObject(metadataOverrides.mountAuthorization)) {
    response.mountAuthorization = Object.assign({}, response.mountAuthorization, metadataOverrides.mountAuthorization);
    response.body.mountAuthorization = Object.assign({}, response.mountAuthorization);
  }

  return response;
}

function validateDryRunPayload(mountAuthorizationLikeRequest) {
  const input = isPlainObject(mountAuthorizationLikeRequest) ? mountAuthorizationLikeRequest : {};
  const runtimePreflight = isPlainObject(input.runtimePreflight) ? input.runtimePreflight : {};
  const auditLedgerPlan = isPlainObject(runtimePreflight.auditLedgerPlan) ? runtimePreflight.auditLedgerPlan : {};
  const serviceOperation = isPlainObject(auditLedgerPlan.serviceOperation) ? auditLedgerPlan.serviceOperation : {};
  const controllerAction = isPlainObject(serviceOperation.controllerAction) ? serviceOperation.controllerAction : {};
  const request = isPlainObject(controllerAction.request) ? controllerAction.request : {};
  const body = isPlainObject(request.body) ? request.body : {};
  const params = isPlainObject(request.params) ? request.params : {};
  const actor = isPlainObject(request.actor) ? request.actor : {};
  const before = isPlainObject(body.before) ? body.before : null;
  const after = isPlainObject(body.after) ? body.after : null;
  const errors = [];
  const warnings = [];
  const diff = [];

  if (!before) errors.push("before must be a plain object");
  if (!after) errors.push("after must be a plain object");
  if (errors.length) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      message: "Promotion admin dry-run mount authorization payload is invalid.",
      errors,
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
      promotionId: null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  const auditReason = normalizeString(body.auditReason);
  if (!auditReason) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
      message: "Promotion admin dry-run mount authorization requires an audit reason.",
      errors: ["auditReason is required"],
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
      promotionId: normalizeString(params.id) || null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  const changedFields = [];
  const numericFields = ["minDeposit", "maxDeposit", "bonusValue", "turnoverMultiplier", "maxWithdraw"];
  const dateFields = ["startAt", "endAt"];

  for (const field of numericFields) {
    const beforeHas = Object.prototype.hasOwnProperty.call(before, field);
    const afterHas = Object.prototype.hasOwnProperty.call(after, field);
    if (!beforeHas && !afterHas) continue;

    const beforeValue = before[field];
    const afterValue = after[field];
    const beforeParsed = beforeValue === null || beforeValue === undefined || beforeValue === "" ? null : Number(beforeValue);
    const afterParsed = afterValue === null || afterValue === undefined || afterValue === "" ? null : Number(afterValue);

    if ((beforeValue !== null && beforeValue !== undefined && beforeValue !== "" && !Number.isFinite(beforeParsed)) ||
        (afterValue !== null && afterValue !== undefined && afterValue !== "" && !Number.isFinite(afterParsed))) {
      return {
        ok: false,
        status: 422,
        code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
        message: "Promotion admin dry-run mount authorization payload failed validation.",
        errors: [`${field} must be a non-negative number`],
        warnings,
        diff,
        riskSummary: emptyRiskSummary(),
        promotionId: normalizeString(params.id) || null,
        actor,
        request,
        body,
        runtimePreflight,
        auditLedgerPlan,
        serviceOperation,
        controllerAction,
      };
    }
    if ((beforeParsed !== null && beforeParsed < 0) || (afterParsed !== null && afterParsed < 0)) {
      return {
        ok: false,
        status: 422,
        code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
        message: "Promotion admin dry-run mount authorization payload failed validation.",
        errors: [`${field} must be non-negative`],
        warnings,
        diff,
        riskSummary: emptyRiskSummary(),
        promotionId: normalizeString(params.id) || null,
        actor,
        request,
        body,
        runtimePreflight,
        auditLedgerPlan,
        serviceOperation,
        controllerAction,
      };
    }
    if (beforeParsed !== afterParsed) {
      changedFields.push(field);
      diff.push({ field, before: beforeParsed, after: afterParsed });
    }
  }

  for (const field of ["title", "type", "status", "startAt", "endAt", "bonusType"]) {
    const beforeValue = Object.prototype.hasOwnProperty.call(before, field) ? normalizeString(before[field]) : "";
    const afterValue = Object.prototype.hasOwnProperty.call(after, field) ? normalizeString(after[field]) : "";
    if (beforeValue !== afterValue) {
      changedFields.push(field);
      diff.push({ field, before: beforeValue || null, after: afterValue || null });
    }
  }

  const minDeposit = body.after && body.after.minDeposit !== undefined ? Number(body.after.minDeposit) : Number(body.before && body.before.minDeposit);
  const maxDeposit = body.after && body.after.maxDeposit !== undefined ? Number(body.after.maxDeposit) : Number(body.before && body.before.maxDeposit);
  if (Number.isFinite(minDeposit) && Number.isFinite(maxDeposit) && maxDeposit < minDeposit) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      message: "Promotion admin dry-run mount authorization payload failed validation.",
      errors: ["maxDeposit must be greater than or equal to minDeposit"],
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
      promotionId: normalizeString(params.id) || null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  const startAt = normalizeString(body.after && body.after.startAt ? body.after.startAt : body.before && body.before.startAt);
  const endAt = normalizeString(body.after && body.after.endAt ? body.after.endAt : body.before && body.before.endAt);
  if (startAt && endAt && new Date(startAt).getTime() > new Date(endAt).getTime()) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      message: "Promotion admin dry-run mount authorization payload failed validation.",
      errors: ["startAt must not be later than endAt"],
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
      promotionId: normalizeString(params.id) || null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  const riskyFieldChanged = changedFields.some((field) => ["bonusValue", "turnoverMultiplier", "maxWithdraw"].includes(field));
  if (riskyFieldChanged && body.riskAcknowledgement !== true) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
      message: "Promotion admin dry-run mount authorization requires a risk acknowledgement.",
      errors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
      warnings,
      diff,
      riskSummary: {
        hasBonusRisk: changedFields.includes("bonusValue"),
        hasTurnoverRisk: changedFields.includes("turnoverMultiplier"),
        hasWithdrawRisk: changedFields.includes("maxWithdraw"),
        hasEligibilityRisk: changedFields.some((field) => ["title", "type", "status", "minDeposit", "maxDeposit", "startAt", "endAt"].includes(field)),
        hasStatusRisk: changedFields.includes("status"),
      },
      promotionId: normalizeString(params.id) || null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  if (!changedFields.length) {
    return {
      ok: false,
      status: 422,
      code: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      message: "Promotion admin dry-run mount authorization payload failed validation.",
      errors: ["before and after must include at least one changed field"],
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
      promotionId: normalizeString(params.id) || null,
      actor,
      request,
      body,
      runtimePreflight,
      auditLedgerPlan,
      serviceOperation,
      controllerAction,
    };
  }

  return {
    ok: true,
    status: 200,
    code: null,
    message: "Promotion admin dry-run mount authorization payload is valid.",
    errors,
    warnings,
    diff,
    riskSummary: {
      hasBonusRisk: changedFields.includes("bonusValue"),
      hasTurnoverRisk: changedFields.includes("turnoverMultiplier"),
      hasWithdrawRisk: changedFields.includes("maxWithdraw"),
      hasEligibilityRisk: changedFields.some((field) => ["title", "type", "status", "minDeposit", "maxDeposit", "startAt", "endAt"].includes(field)),
      hasStatusRisk: changedFields.includes("status"),
    },
    promotionId: normalizeString(params.id) || null,
    actor,
    request,
    body,
    runtimePreflight,
    auditLedgerPlan,
    serviceOperation,
    controllerAction,
  };
}

function buildBlockingReasons(runtimeBlockingReasons, mountRequested, operatorApproved) {
  const reasons = [
    "MOUNT_AUTHORIZATION_GATE_ONLY",
    "MOUNT_NOT_GRANTED_BY_DEFAULT",
  ];

  if (mountRequested) {
    reasons.push("ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38");
    reasons.push("RUNTIME_ENABLEMENT_NOT_ALLOWED_IN_PHASE_38");
    reasons.push("MOUNT_REQUESTED_BUT_NOT_GRANTED");
  }

  if (operatorApproved) {
    reasons.push("OPERATOR_APPROVAL_DOES_NOT_GRANT_MOUNT");
  }

  return dedupeStrings(reasons.concat(cloneArray(runtimeBlockingReasons)));
}

function buildAuthorizationEnvelope(runtimePreflightResponse, context, validation) {
  const runtimePreflight = runtimePreflightResponse && runtimePreflightResponse.runtimePreflight
    ? runtimePreflightResponse.runtimePreflight
    : buildPromotionAdminDryRunRuntimePreflight().runtimePreflight;
  const auditLedgerReadiness = runtimePreflightResponse && runtimePreflightResponse.auditLedgerReadiness
    ? runtimePreflightResponse.auditLedgerReadiness
    : buildPromotionAdminDryRunRuntimePreflight().auditLedgerReadiness;
  const mountRequested = !!(context.mountRequest && context.mountRequest.requested);
  const operatorApproved = !!(context.operatorApproval && context.operatorApproval.approved);
  const blockingReasons = buildBlockingReasons(
    runtimePreflightResponse && runtimePreflightResponse.body && Array.isArray(runtimePreflightResponse.body.blockingReasons)
      ? runtimePreflightResponse.body.blockingReasons
      : [],
    mountRequested,
    operatorApproved
  );

  const mountAuthorization = {
    phase: PHASE,
    authorizationType: AUTHORIZATION_TYPE,
    authorizationMode: AUTHORIZATION_MODE,
    runtimePreflightPhase: runtimePreflight.phase,
    auditLedgerPhase: auditLedgerReadiness.phase,
    servicePhase: auditLedgerReadiness.serviceReadiness.phase,
    controllerPhase: auditLedgerReadiness.serviceReadiness.controllerReadiness.phase,
    routePhase: auditLedgerReadiness.serviceReadiness.routeReadiness.phase,
    authorizationStatus: NOT_GRANTED_STATUS,
    mountStatus: MOUNT_STATUS,
    runtimeStatus: runtimePreflightResponse.status === 200
      ? runtimePreflight.status
      : (runtimePreflightResponse.body && runtimePreflightResponse.body.code) || runtimePreflight.status,
    requiredBeforeMount: [
      "gate_only authorization mode",
      "mount not granted by default",
      "runtime preflight readiness only",
      "audit ledger readiness plan only",
      "service readiness only",
      "controller readiness only",
      "route readiness only",
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
    blockingReasons,
    notMountedReason: "Promotion admin dry-run mount authorization is gate only and mount is not granted.",
    mountRequested,
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
    previewOnly: false,
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
  };

  return {
    authorizationType: AUTHORIZATION_TYPE,
    authorizationMode: AUTHORIZATION_MODE,
    mountRequested,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
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
    noProviderOutbound: true,
    noProductionDeploy: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    runtimePreflight,
    auditLedgerReadiness,
    mountAuthorization,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
    body: {
      ok: validation.ok,
      code: validation.code,
      message: validation.message,
      errors: cloneArray(validation.errors),
      warnings: cloneArray(validation.warnings),
      diff: cloneArray(validation.diff),
      riskSummary: Object.assign(emptyRiskSummary(), validation.riskSummary || {}),
      promotionId: validation.promotionId || null,
      authorizationType: AUTHORIZATION_TYPE,
      authorizationMode: AUTHORIZATION_MODE,
      mountRequested,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
      canMountRoute: false,
      canEnableRuntime: false,
      canEnableControllerRuntime: false,
      canEnableServiceRuntime: false,
      canEnableAuditRuntime: false,
      canEnableLedgerRuntime: false,
      canEnableDbWrite: false,
      canEnablePromotionUpdate: false,
      canEnableProviderOutbound: false,
      canEnableProductionDeploy: false,
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
      noProviderOutbound: true,
      noProductionDeploy: true,
      auditRowCreated: false,
      ledgerCreated: false,
      turnoverRequirementCreated: false,
      runtimeCreditActionCreated: false,
      runtimePreflight,
      auditLedgerReadiness,
      mountAuthorization,
      safetyFlags: Object.assign({}, SAFETY_FLAGS),
    },
  };
}

function buildPromotionAdminDryRunMountAuthorization() {
  const metadata = buildMountAuthorizationMetadata();
  return metadata;
}

function simulatePromotionAdminDryRunMountAuthorization(mountAuthorizationLikeRequest) {
  const input = isPlainObject(mountAuthorizationLikeRequest) ? mountAuthorizationLikeRequest : {};
  const authorizationType = normalizeString(input.authorizationType);
  const authorizationMode = AUTHORIZATION_MODE;

  if (authorizationType !== AUTHORIZATION_TYPE) {
    const metadata = buildMountAuthorizationMetadata();
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_MOUNT_AUTHORIZATION_NOT_MOUNTED",
      "Promotion admin dry-run mount authorization is not mounted.",
      {
        authorizationType: authorizationType || AUTHORIZATION_TYPE,
        authorizationMode,
      },
      {
        mountAuthorization: Object.assign({}, metadata.mountAuthorization, {
          blockingReasons: dedupeStrings([
            "MOUNT_AUTHORIZATION_GATE_ONLY",
            "MOUNT_NOT_GRANTED_BY_DEFAULT",
            "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_38",
            "RUNTIME_ENABLEMENT_NOT_ALLOWED_IN_PHASE_38",
          ]),
        }),
      }
    );
  }

  const runtimePreflightLike = isPlainObject(input.runtimePreflight) ? input.runtimePreflight : {};
  const mountRequest = isPlainObject(input.mountRequest) ? input.mountRequest : {};
  const runtimePreflightType = normalizeString(runtimePreflightLike.preflightType);
  if (runtimePreflightType !== "promotionAdminDryRunRuntimePreflight") {
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_NOT_MOUNTED",
      "Promotion admin dry-run runtime preflight is not mounted.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  const auditLedgerPlan = isPlainObject(runtimePreflightLike.auditLedgerPlan) ? runtimePreflightLike.auditLedgerPlan : {};
  if (normalizeString(auditLedgerPlan.planType) !== REQUIRED_PLAN_TYPE) {
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_AUDIT_LEDGER_PLAN_NOT_MOUNTED",
      "Promotion admin dry-run audit ledger plan is not mounted.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  const serviceOperation = isPlainObject(auditLedgerPlan.serviceOperation) ? auditLedgerPlan.serviceOperation : {};
  if (normalizeString(serviceOperation.operation) !== REQUIRED_SERVICE_OPERATION) {
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_SERVICE_OPERATION_NOT_MOUNTED",
      "Promotion admin dry-run service operation is not mounted.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  const controllerAction = isPlainObject(serviceOperation.controllerAction) ? serviceOperation.controllerAction : {};
  if (normalizeString(controllerAction.action) !== REQUIRED_CONTROLLER_ACTION) {
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_CONTROLLER_ACTION_NOT_MOUNTED",
      "Promotion admin dry-run controller action is not mounted.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  const request = isPlainObject(controllerAction.request) ? controllerAction.request : {};
  if (normalizeString(request.method).toUpperCase() !== REQUIRED_METHOD) {
    return buildErrorResponse(
      405,
      "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED",
      "Promotion admin dry-run mount authorization accepts POST only.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  if (normalizeString(request.path) !== REQUIRED_PATH) {
    return buildErrorResponse(
      404,
      "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED",
      "Promotion admin dry-run mount authorization is not mounted on that path.",
      { authorizationType, authorizationMode, mountRequested: !!mountRequest.requested }
    );
  }

  const params = isPlainObject(request.params) ? request.params : {};
  const actor = isPlainObject(request.actor) ? request.actor : {};
  const promotionId = normalizeString(params.id);
  if (!promotionId) {
    return buildErrorResponse(
      400,
      "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      "Promotion admin dry-run mount authorization requires a promotion id.",
      {
        authorizationType,
        authorizationMode,
        mountRequested: !!mountRequest.requested,
        promotionId: null,
        errors: ["params.id is required"],
      }
    );
  }

  if (!getRequiredPermission(actor)) {
    return buildErrorResponse(
      403,
      "PROMOTION_DRY_RUN_FORBIDDEN",
      "Promotion admin dry-run mount authorization requires promotion write or manage permission.",
      {
        authorizationType,
        authorizationMode,
        mountRequested: !!mountRequest.requested,
        promotionId,
        errors: ["settings.promotion.write or settings.promotion.manage is required"],
      }
    );
  }

  const validation = validateDryRunPayload(input);
  if (!validation.ok) {
    return buildErrorResponse(
      validation.status,
      validation.code,
      validation.message,
      {
        authorizationType,
        authorizationMode,
        mountRequested: !!mountRequest.requested,
        code: validation.code,
        message: validation.message,
        errors: validation.errors,
        warnings: validation.warnings,
        diff: validation.diff,
        riskSummary: validation.riskSummary,
        promotionId: validation.promotionId,
      }
    );
  }

  const runtimePreflightRequest = {
    preflightType: runtimePreflightType,
    preflightMode: normalizeString(runtimePreflightLike.preflightMode) || "readiness_only",
    runtimeChecks: mapRuntimeChecks(runtimePreflightLike.runtimeChecks),
    operatorApproval: Object.assign(
      {
        approved: false,
        approvedBy: null,
        reason: "",
      },
      isPlainObject(runtimePreflightLike.operatorApproval) ? cloneObject(runtimePreflightLike.operatorApproval) : {}
    ),
  };

  const runtimePreflightResponse = simulatePromotionAdminDryRunRuntimePreflight(runtimePreflightRequest);
  const runtimeCode = runtimePreflightResponse && runtimePreflightResponse.body ? runtimePreflightResponse.body.code : null;
  const runtimeStatus = runtimePreflightResponse && typeof runtimePreflightResponse.status === "number" ? runtimePreflightResponse.status : 500;

  if (runtimeStatus !== 200) {
    return buildErrorResponse(
      runtimeStatus,
      runtimeCode || "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      runtimePreflightResponse && runtimePreflightResponse.body && runtimePreflightResponse.body.message
        ? runtimePreflightResponse.body.message
        : "Promotion admin dry-run mount authorization runtime preflight failed.",
      {
        authorizationType,
        authorizationMode,
        mountRequested: !!mountRequest.requested,
        runtimePreflight: runtimePreflightResponse.runtimePreflight,
        auditLedgerReadiness: runtimePreflightResponse.auditLedgerReadiness,
        mountAuthorization: Object.assign({}, buildMountAuthorizationMetadata().mountAuthorization, {
          blockingReasons: buildBlockingReasons(
            runtimePreflightResponse.body && Array.isArray(runtimePreflightResponse.body.blockingReasons)
              ? runtimePreflightResponse.body.blockingReasons
              : [],
            !!mountRequest.requested,
            runtimePreflightRequest.operatorApproval && runtimePreflightRequest.operatorApproval.approved === true
          ),
        }),
      }
    );
  }

  const metadata = buildMountAuthorizationMetadata();
  const blockingReasons = buildBlockingReasons(
    runtimePreflightResponse.body && Array.isArray(runtimePreflightResponse.body.blockingReasons)
      ? runtimePreflightResponse.body.blockingReasons
      : [],
    !!mountRequest.requested,
    runtimePreflightRequest.operatorApproval && runtimePreflightRequest.operatorApproval.approved === true
  );

  const body = Object.assign({}, runtimePreflightResponse.body, {
    ok: true,
    code: null,
    message: "Promotion admin dry-run mount authorization gate is ready.",
    authorizationType: AUTHORIZATION_TYPE,
    authorizationMode: AUTHORIZATION_MODE,
    mountRequested: !!mountRequest.requested,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
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
    noProviderOutbound: true,
    noProductionDeploy: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    runtimePreflight: runtimePreflightResponse.runtimePreflight,
    auditLedgerReadiness: runtimePreflightResponse.auditLedgerReadiness,
    mountAuthorization: Object.assign({}, metadata.mountAuthorization, {
      runtimeStatus: runtimePreflightResponse.runtimePreflight.status,
      mountRequested: !!mountRequest.requested,
      blockingReasons,
      mountAuthorized: false,
      mountGranted: false,
      mountDenied: true,
    }),
    safetyFlags: Object.assign({}, metadata.safetyFlags),
    blockingReasons,
  });

  return {
    authorizationType: AUTHORIZATION_TYPE,
    authorizationMode: AUTHORIZATION_MODE,
    status: 200,
    body,
    mountRequested: !!mountRequest.requested,
    mountAuthorized: false,
    mountGranted: false,
    mountDenied: true,
    canMountRoute: false,
    canEnableRuntime: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
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
    noProviderOutbound: true,
    noProductionDeploy: true,
    auditRowCreated: false,
    ledgerCreated: false,
    turnoverRequirementCreated: false,
    runtimeCreditActionCreated: false,
    runtimePreflight: runtimePreflightResponse.runtimePreflight,
    auditLedgerReadiness: runtimePreflightResponse.auditLedgerReadiness,
    mountAuthorization: body.mountAuthorization,
    safetyFlags: Object.assign({}, metadata.safetyFlags),
    blockingReasons,
  };
}

module.exports = {
  buildPromotionAdminDryRunMountAuthorization,
  simulatePromotionAdminDryRunMountAuthorization,
};
