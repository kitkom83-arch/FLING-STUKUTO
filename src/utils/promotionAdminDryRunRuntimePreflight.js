"use strict";

const { buildPromotionAdminDryRunAuditLedgerReadiness } = require("./promotionAdminDryRunAuditLedgerReadiness");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37";
const PREFLIGHT_TYPE = "promotionAdminDryRunRuntimePreflight";
const DEFAULT_PREFLIGHT_MODE = "readiness_only";
const NOT_MOUNTED_STATUS = "runtime_preflight_readiness_only_not_mounted";
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

function readRuntimeChecks(runtimeChecks) {
  const input = isPlainObject(runtimeChecks) ? runtimeChecks : {};
  return {
    routeMount: hasTruthyFlag(input.routeMount),
    controllerRuntime: hasTruthyFlag(input.controllerRuntime),
    serviceRuntime: hasTruthyFlag(input.serviceRuntime),
    auditRuntime: hasTruthyFlag(input.auditRuntime),
    ledgerRuntime: hasTruthyFlag(input.ledgerRuntime),
    dbWrite: hasTruthyFlag(input.dbWrite),
    promotionUpdate: hasTruthyFlag(input.promotionUpdate),
    providerOutbound: hasTruthyFlag(input.providerOutbound),
    productionDeploy: hasTruthyFlag(input.productionDeploy),
  };
}

function buildBlockingReasons(runtimeChecks, operatorApproval) {
  const reasons = [];

  if (runtimeChecks.routeMount) reasons.push("route mount remains disabled");
  if (runtimeChecks.controllerRuntime) reasons.push("controller runtime remains disabled");
  if (runtimeChecks.serviceRuntime) reasons.push("service runtime remains disabled");
  if (runtimeChecks.auditRuntime) reasons.push("audit runtime remains disabled");
  if (runtimeChecks.ledgerRuntime) reasons.push("ledger runtime remains disabled");
  if (runtimeChecks.dbWrite) reasons.push("database writes remain disabled");
  if (runtimeChecks.promotionUpdate) reasons.push("promotion updates remain disabled");
  if (runtimeChecks.providerOutbound) reasons.push("provider outbound remains disabled");
  if (runtimeChecks.productionDeploy) reasons.push("production deploy remains disabled");
  if (operatorApproval.approved === true) reasons.push("operator approval does not enable runtime");

  if (!reasons.length) {
    reasons.push("runtime preflight is intentionally unmounted");
  }

  return reasons;
}

function buildPromotionAdminDryRunRuntimePreflight() {
  const auditLedgerReadiness = buildPromotionAdminDryRunAuditLedgerReadiness();
  const contract = getPromotionAdminDryRunApiContract();

  return {
    phase: PHASE,
    preflightType: PREFLIGHT_TYPE,
    preflightMode: DEFAULT_PREFLIGHT_MODE,
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
    canMountRoute: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    runtimePreflight: {
      phase: PHASE,
      preflightType: PREFLIGHT_TYPE,
      preflightMode: DEFAULT_PREFLIGHT_MODE,
      status: NOT_MOUNTED_STATUS,
      contractStatus: contract.endpoint.status,
      auditLedgerPhase: auditLedgerReadiness.phase,
      servicePhase: auditLedgerReadiness.serviceReadiness.phase,
      controllerPhase: auditLedgerReadiness.controllerReadiness.phase,
      routePhase: auditLedgerReadiness.routeReadiness.phase,
      requiredPreflightFields: [
        "preflightType",
        "preflightMode",
        "runtimeChecks",
        "operatorApproval.approved",
        "auditLedgerReadiness.phase",
      ],
      requiredRuntimeChecks: [
        "routeMount",
        "controllerRuntime",
        "serviceRuntime",
        "auditRuntime",
        "ledgerRuntime",
        "dbWrite",
        "promotionUpdate",
        "providerOutbound",
        "productionDeploy",
      ],
      notMountedReason: "Promotion admin dry-run runtime preflight is intentionally unmounted.",
    },
    auditLedgerReadiness,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function makeResponse(status, code, message, overrides) {
  const readiness = buildPromotionAdminDryRunRuntimePreflight();
  const body = Object.assign(
    {
      ok: false,
      code,
      message,
      errors: [],
      warnings: [],
      blockingReasons: [],
      runtimeChecks: {},
      operatorApproval: {
        approved: false,
        reason: "",
      },
      preflightType: normalizeString(overrides && overrides.preflightType) || PREFLIGHT_TYPE,
      preflightMode: normalizeString(overrides && overrides.preflightMode) || DEFAULT_PREFLIGHT_MODE,
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
      canMountRoute: false,
      canEnableControllerRuntime: false,
      canEnableServiceRuntime: false,
      canEnableAuditRuntime: false,
      canEnableLedgerRuntime: false,
      canEnableDbWrite: false,
      canEnablePromotionUpdate: false,
      canEnableProviderOutbound: false,
      canEnableProductionDeploy: false,
      noDbWrite: true,
      noPromotionUpdate: true,
      noAuditRowCreation: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
      safetyFlags: Object.assign({}, readiness.safetyFlags),
      runtimePreflight: Object.assign({}, readiness.runtimePreflight, {
        blockingReasons: [],
        runtimeChecks: {},
        operatorApproval: {
          approved: false,
          reason: "",
        },
      }),
      auditLedgerReadiness: readiness.auditLedgerReadiness,
    },
    overrides || {}
  );

  return {
    preflightType: normalizeString(overrides && overrides.preflightType) || PREFLIGHT_TYPE,
    preflightMode: normalizeString(overrides && overrides.preflightMode) || DEFAULT_PREFLIGHT_MODE,
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
    canMountRoute: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    runtimePreflight: body.runtimePreflight,
    auditLedgerReadiness: body.auditLedgerReadiness,
    safetyFlags: Object.assign({}, readiness.safetyFlags),
  };
}

function makeNotMountedResponse(input, code, message) {
  const overrides = {
    preflightType: normalizeString(input.preflightType) || PREFLIGHT_TYPE,
    preflightMode: normalizeString(input.preflightMode) || DEFAULT_PREFLIGHT_MODE,
  };

  return makeResponse(404, code, message, overrides);
}

function simulatePromotionAdminDryRunRuntimePreflight(preflightLikeRequest) {
  const input = isPlainObject(preflightLikeRequest) ? preflightLikeRequest : {};
  const preflightType = normalizeString(input.preflightType);
  const preflightMode = normalizeString(input.preflightMode);

  if (preflightType !== PREFLIGHT_TYPE) {
    return makeNotMountedResponse(
      input,
      "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_NOT_MOUNTED",
      "Promotion admin dry-run runtime preflight is not mounted."
    );
  }

  if (preflightMode && preflightMode !== DEFAULT_PREFLIGHT_MODE) {
    return makeNotMountedResponse(
      input,
      "PROMOTION_DRY_RUN_RUNTIME_PREFLIGHT_MODE_NOT_MOUNTED",
      "Promotion admin dry-run runtime preflight is readiness-only and not mounted in that mode."
    );
  }

  const runtimeChecks = readRuntimeChecks(input.runtimeChecks);
  const operatorApproval = isPlainObject(input.operatorApproval)
    ? Object.assign(
        {
          approved: false,
          reason: "",
        },
        cloneObject(input.operatorApproval)
      )
    : {
        approved: false,
        reason: "",
      };
  const readiness = buildPromotionAdminDryRunRuntimePreflight();
  const blockingReasons = buildBlockingReasons(runtimeChecks, operatorApproval);
  const body = {
    ok: true,
    code: null,
    message: "Promotion admin dry-run runtime preflight is ready.",
    errors: [],
    warnings: [],
    blockingReasons: cloneArray(blockingReasons),
    runtimeChecks: Object.assign({}, runtimeChecks),
    operatorApproval: Object.assign({}, operatorApproval),
    preflightType: PREFLIGHT_TYPE,
    preflightMode: DEFAULT_PREFLIGHT_MODE,
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
    canMountRoute: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    runtimePreflight: Object.assign({}, readiness.runtimePreflight, {
      blockingReasons: cloneArray(blockingReasons),
      runtimeChecks: Object.assign({}, runtimeChecks),
      operatorApproval: Object.assign({}, operatorApproval),
    }),
    auditLedgerReadiness: readiness.auditLedgerReadiness,
    safetyFlags: Object.assign({}, readiness.safetyFlags),
  };

  return {
    preflightType: PREFLIGHT_TYPE,
    preflightMode: DEFAULT_PREFLIGHT_MODE,
    status: 200,
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
    canMountRoute: false,
    canEnableControllerRuntime: false,
    canEnableServiceRuntime: false,
    canEnableAuditRuntime: false,
    canEnableLedgerRuntime: false,
    canEnableDbWrite: false,
    canEnablePromotionUpdate: false,
    canEnableProviderOutbound: false,
    canEnableProductionDeploy: false,
    noDbWrite: true,
    noPromotionUpdate: true,
    noAuditRowCreation: true,
    noLedgerCreation: true,
    noTurnoverCreation: true,
    noClaimExecution: true,
    noRuntimeCreditAction: true,
    runtimePreflight: body.runtimePreflight,
    auditLedgerReadiness: body.auditLedgerReadiness,
    safetyFlags: Object.assign({}, readiness.safetyFlags),
  };
}

module.exports = {
  buildPromotionAdminDryRunRuntimePreflight,
  simulatePromotionAdminDryRunRuntimePreflight,
};
