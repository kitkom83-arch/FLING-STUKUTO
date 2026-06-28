"use strict";

const {
  buildPromotionAdminDryRunFinalReadinessRecord,
  simulatePromotionAdminDryRunFinalReadiness,
} = require("./promotionAdminDryRunFinalReadiness");
const { buildPromotionAdminDryRunEnablementRunbook } = require("./promotionAdminDryRunEnablementRunbook");
const { getPromotionAdminDryRunApiContract } = require("./promotionAdminDryRunApiContract");

const PHASE = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42";
const RUNTIME_DECISION_TYPE = "promotionAdminDryRunRuntimeDecision";
const RUNTIME_DECISION_MODE = "decision_record_only";
const RUNTIME_DECISION_STATUS = "runtime_decision_record_only_runtime_not_enabled";
const CHAIN_STATUS = "phase_32_to_41_closed";
const DECISION_GATE_STATUS = "decision_record_only";
const DEFAULT_SELECTED_DECISION = "hold_runtime";
const DEFAULT_TARGET_RUNTIME_MODE = "none";
const REQUIRED_SEPARATE_RUNTIME_PHASE = true;
const NOT_ENABLED_REASON =
  "Promotion admin dry-run runtime decision is record only and runtime remains not enabled in phase 42 until a separate approved runtime phase exists.";
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

function normalizeRuntimeDecision(runtimeDecisionLike) {
  const runtimeDecision = isPlainObject(runtimeDecisionLike) ? runtimeDecisionLike : {};
  const decision = normalizeString(runtimeDecision.decision);

  return {
    requested: hasTruthyFlag(runtimeDecision.requested),
    requestedBy: runtimeDecision.requestedBy === undefined ? null : runtimeDecision.requestedBy,
    decision: decision || DEFAULT_SELECTED_DECISION,
    decisionReason: normalizeString(runtimeDecision.decisionReason),
    separateRuntimePhaseRequired: true,
    stagingOnlyRequested: hasTruthyFlag(runtimeDecision.stagingOnlyRequested),
    productionRuntimeRequested: hasTruthyFlag(runtimeDecision.productionRuntimeRequested),
  };
}

function buildRuntimeDecisionRequestShape(input) {
  const runtimeDecisionInput = isPlainObject(input.runtimeDecision) ? input.runtimeDecision : {};
  const finalReadinessInput = isPlainObject(input.finalReadiness) ? input.finalReadiness : {};
  const enablementRunbook = isPlainObject(finalReadinessInput.enablementRunbook)
    ? finalReadinessInput.enablementRunbook
    : {};

  return {
    runtimeDecisionType: normalizeString(input.runtimeDecisionType) || RUNTIME_DECISION_TYPE,
    runtimeDecisionMode: RUNTIME_DECISION_MODE,
    runtimeDecision: normalizeRuntimeDecision(runtimeDecisionInput),
    finalReadiness: Object.assign({}, cloneObject(finalReadinessInput), {
      finalReadinessType: normalizeString(finalReadinessInput.finalReadinessType) || "promotionAdminDryRunFinalReadiness",
      finalReadinessMode: normalizeString(finalReadinessInput.finalReadinessMode) || "record_only",
      enablementRunbook: Object.assign({}, cloneObject(enablementRunbook), {
        checklistType: normalizeString(enablementRunbook.checklistType) || "promotionAdminDryRunEnablementRunbook",
        runbookMode: normalizeString(enablementRunbook.runbookMode) || "readiness_only",
      }),
    }),
  };
}

function cloneFinalReadinessRecord(finalReadinessRecord) {
  return Object.assign({}, finalReadinessRecord, {
    coveredPhases: cloneArray(finalReadinessRecord.coveredPhases),
    requiredBeforeRuntime: cloneArray(finalReadinessRecord.requiredBeforeRuntime),
    blockingReasons: cloneArray(finalReadinessRecord.blockingReasons),
  });
}

function buildRuntimeDecisionGate(finalReadinessResponse, runtimeDecision, selectedDecision, targetRuntimeMode, extraBlockingReasons) {
  const enablementRunbook =
    finalReadinessResponse.enablementRunbook || buildPromotionAdminDryRunEnablementRunbook();
  const finalReadinessRecord =
    finalReadinessResponse.finalReadinessRecord || buildPromotionAdminDryRunFinalReadinessRecord().finalReadinessRecord;
  const contract = getPromotionAdminDryRunApiContract();
  const blockingReasons = dedupeStrings([
    "RUNTIME_DECISION_RECORD_ONLY",
    ...cloneArray(finalReadinessRecord.blockingReasons),
    ...(enablementRunbook.enablementRunbook ? enablementRunbook.enablementRunbook.blockingReasons : []),
    ...cloneArray(extraBlockingReasons),
  ]);

  return {
    phase: PHASE,
    runtimeDecisionType: RUNTIME_DECISION_TYPE,
    runtimeDecisionMode: RUNTIME_DECISION_MODE,
    status: RUNTIME_DECISION_STATUS,
    chainStatus: CHAIN_STATUS,
    decisionGateStatus: DECISION_GATE_STATUS,
    selectedDecision,
    targetRuntimeMode,
    requiredBeforeRuntime: dedupeStrings([
      ...cloneArray(finalReadinessRecord.requiredBeforeRuntime),
      "runtime decision record only",
      "runtime not enabled in phase 42",
      "hold runtime",
      "request staging-only runtime phase",
      "request separate runtime implementation phase",
      "reject runtime for now",
      contract.endpoint.method,
      contract.endpoint.path,
    ]),
    requiredSeparateRuntimePhase: REQUIRED_SEPARATE_RUNTIME_PHASE,
    blockingReasons,
    notEnabledReason: NOT_ENABLED_REASON,
    finalReadinessPhase: finalReadinessRecord.phase,
    finalReadinessStatus: finalReadinessRecord.finalReadinessStatus,
    finalReadinessRecord: cloneFinalReadinessRecord(finalReadinessRecord),
    enablementRunbook: Object.assign({}, enablementRunbook, {
      enablementRunbook: enablementRunbook.enablementRunbook
        ? Object.assign({}, enablementRunbook.enablementRunbook, {
            requiredApprovals: cloneArray(enablementRunbook.enablementRunbook.requiredApprovals),
            requiredPrechecks: cloneArray(enablementRunbook.enablementRunbook.requiredPrechecks),
            requiredRollbackSteps: cloneArray(enablementRunbook.enablementRunbook.requiredRollbackSteps),
            requiredMonitoringChecks: cloneArray(enablementRunbook.enablementRunbook.requiredMonitoringChecks),
            requiredUatChecks: cloneArray(enablementRunbook.enablementRunbook.requiredUatChecks),
            blockingReasons: cloneArray(enablementRunbook.enablementRunbook.blockingReasons),
          })
        : enablementRunbook.enablementRunbook,
    }),
    runtimeDecision: Object.assign({}, runtimeDecision),
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function buildRuntimeDecisionResponse({
  runtimeDecisionType,
  status,
  code,
  message,
  runtimeDecisionMode,
  runtimeDecisionGate,
  runtimeDecision,
  decisionSummary,
  finalReadinessResponse,
  bodyOverrides,
}) {
  const finalReadinessRecord = cloneFinalReadinessRecord(runtimeDecisionGate.finalReadinessRecord);
  const enablementRunbook = Object.assign({}, runtimeDecisionGate.enablementRunbook);
  const body = Object.assign(
    {
      ok: status === 200,
      code: code || null,
      message: message || "Promotion admin dry-run runtime decision record is ready.",
      runtimeDecisionType,
      runtimeDecisionMode,
      status: RUNTIME_DECISION_STATUS,
      bodyStatus: RUNTIME_DECISION_STATUS,
      phase: PHASE,
      chainStatus: runtimeDecisionGate.chainStatus,
      finalReadinessPhase: runtimeDecisionGate.finalReadinessPhase,
      finalReadinessStatus: runtimeDecisionGate.finalReadinessStatus,
      decisionGateStatus: runtimeDecisionGate.decisionGateStatus,
      selectedDecision: runtimeDecisionGate.selectedDecision,
      targetRuntimeMode: runtimeDecisionGate.targetRuntimeMode,
      requiredBeforeRuntime: cloneArray(runtimeDecisionGate.requiredBeforeRuntime),
      requiredSeparateRuntimePhase: true,
      blockingReasons: cloneArray(runtimeDecisionGate.blockingReasons),
      notEnabledReason: runtimeDecisionGate.notEnabledReason,
      runtimeDecisionGate: Object.assign({}, runtimeDecisionGate, {
        requiredBeforeRuntime: cloneArray(runtimeDecisionGate.requiredBeforeRuntime),
        blockingReasons: cloneArray(runtimeDecisionGate.blockingReasons),
        finalReadinessRecord: cloneFinalReadinessRecord(runtimeDecisionGate.finalReadinessRecord),
        runtimeDecision: Object.assign({}, runtimeDecisionGate.runtimeDecision),
        safetyFlags: Object.assign({}, runtimeDecisionGate.safetyFlags),
      }),
      finalReadinessRecord,
      enablementRunbook,
      runtimeDecision: Object.assign({}, runtimeDecision),
      decisionSummary: Object.assign({}, decisionSummary),
      canRequestRuntimeImplementation: false,
      canMountRoute: false,
      canEnableRuntime: false,
      canEnableStagingRuntime: false,
      canEnableProductionRuntime: false,
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
      decisionOnly: true,
      runtimeHeld: true,
      runtimeRejected: false,
      runtimeEnabled: false,
      safetyFlags: Object.assign({}, SAFETY_FLAGS),
    },
    bodyOverrides || {}
  );

  return {
    runtimeDecisionType,
    runtimeDecisionMode,
    status,
    body,
    runtimeDecisionGate: body.runtimeDecisionGate,
    finalReadinessRecord: body.finalReadinessRecord,
    finalReadiness: finalReadinessResponse,
    enablementRunbook: body.enablementRunbook,
    decisionSummary: body.decisionSummary,
    canRequestRuntimeImplementation: false,
    canMountRoute: false,
    canEnableRuntime: false,
    canEnableStagingRuntime: false,
    canEnableProductionRuntime: false,
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
    decisionOnly: true,
    runtimeHeld: body.runtimeHeld,
    runtimeRejected: body.runtimeRejected,
    runtimeEnabled: body.runtimeEnabled,
    safetyFlags: Object.assign({}, SAFETY_FLAGS),
  };
}

function buildRuntimeDecisionNotFoundResponse(input, finalReadinessResponse) {
  const runtimeDecisionType = normalizeString(input.runtimeDecisionType) || "promotionAdminDryRunRuntimeDecision";
  const runtimeDecision = normalizeRuntimeDecision(isPlainObject(input.runtimeDecision) ? input.runtimeDecision : {});
  const runtimeDecisionGate = buildRuntimeDecisionGate(
    finalReadinessResponse,
    runtimeDecision,
    runtimeDecision.decision || DEFAULT_SELECTED_DECISION,
    DEFAULT_TARGET_RUNTIME_MODE,
    ["PROMOTION_DRY_RUN_RUNTIME_DECISION_NOT_FOUND", "RUNTIME_DECISION_RECORD_ONLY"]
  );

  return buildRuntimeDecisionResponse({
    runtimeDecisionType,
    status: 404,
    code: "PROMOTION_DRY_RUN_RUNTIME_DECISION_NOT_FOUND",
    message: "Promotion admin dry-run runtime decision is not mounted.",
    runtimeDecisionMode: RUNTIME_DECISION_MODE,
    runtimeDecisionGate,
    runtimeDecision,
    decisionSummary: Object.assign({}, runtimeDecision, {
      decision: runtimeDecision.decision || DEFAULT_SELECTED_DECISION,
      targetRuntimeMode: DEFAULT_TARGET_RUNTIME_MODE,
      runtimeHeld: true,
      runtimeRejected: false,
      runtimeEnabled: false,
      separateRuntimePhaseRequired: true,
    }),
    finalReadinessResponse,
  });
}

function getDecisionOutcome(runtimeDecision) {
  switch (runtimeDecision.decision) {
    case "request_staging_only_runtime_phase":
      return {
        selectedDecision: "request_staging_only_runtime_phase",
        targetRuntimeMode: "staging_only",
        blockingReasons: [
          "RUNTIME_DECISION_RECORD_ONLY",
          "SEPARATE_STAGING_RUNTIME_PHASE_REQUIRED",
          "RUNTIME_NOT_ENABLED_IN_PHASE_42",
        ],
        runtimeHeld: true,
        runtimeRejected: false,
        runtimeEnabled: false,
      };
    case "request_separate_runtime_implementation_phase":
      return {
        selectedDecision: "request_separate_runtime_implementation_phase",
        targetRuntimeMode: "separate_runtime_phase",
        blockingReasons: [
          "RUNTIME_DECISION_RECORD_ONLY",
          "SEPARATE_RUNTIME_IMPLEMENTATION_PHASE_REQUIRED",
          "ROUTE_MOUNT_NOT_ALLOWED_IN_PHASE_42",
        ],
        runtimeHeld: true,
        runtimeRejected: false,
        runtimeEnabled: false,
      };
    case "reject_runtime_for_now":
      return {
        selectedDecision: "reject_runtime_for_now",
        targetRuntimeMode: DEFAULT_TARGET_RUNTIME_MODE,
        blockingReasons: ["RUNTIME_DECISION_RECORD_ONLY", "RUNTIME_NOT_ENABLED_IN_PHASE_42", "RUNTIME_REJECTED_FOR_NOW"],
        runtimeHeld: true,
        runtimeRejected: true,
        runtimeEnabled: false,
      };
    case "hold_runtime":
    default:
      return {
        selectedDecision: DEFAULT_SELECTED_DECISION,
        targetRuntimeMode: DEFAULT_TARGET_RUNTIME_MODE,
        blockingReasons: ["RUNTIME_DECISION_RECORD_ONLY", "RUNTIME_NOT_ENABLED_IN_PHASE_42"],
        runtimeHeld: true,
        runtimeRejected: false,
        runtimeEnabled: false,
      };
  }
}

function buildPromotionAdminDryRunRuntimeDecisionGate() {
  const finalReadinessResponse = simulatePromotionAdminDryRunFinalReadiness({
    finalReadinessType: "promotionAdminDryRunFinalReadiness",
    finalReadinessMode: "record_only",
    enablementRunbook: {
      checklistType: "promotionAdminDryRunEnablementRunbook",
      runbookMode: "readiness_only",
    },
    finalDecision: {
      requested: false,
      requestedBy: null,
      decision: "not_requested",
      decisionReason: "",
      separateRuntimePhaseRequired: true,
    },
  });
  const runtimeDecision = normalizeRuntimeDecision({
    requested: false,
    requestedBy: null,
    decision: DEFAULT_SELECTED_DECISION,
    decisionReason: "",
    separateRuntimePhaseRequired: true,
    stagingOnlyRequested: false,
    productionRuntimeRequested: false,
  });
  const decisionOutcome = getDecisionOutcome(runtimeDecision);
  const runtimeDecisionGate = buildRuntimeDecisionGate(
    finalReadinessResponse,
    runtimeDecision,
    decisionOutcome.selectedDecision,
    decisionOutcome.targetRuntimeMode,
    decisionOutcome.blockingReasons
  );

  return buildRuntimeDecisionResponse({
    runtimeDecisionType: RUNTIME_DECISION_TYPE,
    status: RUNTIME_DECISION_STATUS,
    code: null,
    message: "Promotion admin dry-run runtime decision record is ready.",
    runtimeDecisionMode: RUNTIME_DECISION_MODE,
    runtimeDecisionGate,
    runtimeDecision,
    decisionSummary: Object.assign({}, runtimeDecision, decisionOutcome, {
      separateRuntimePhaseRequired: true,
    }),
    finalReadinessResponse,
  });
}

function simulatePromotionAdminDryRunRuntimeDecision(runtimeDecisionLikeRequest) {
  const input = isPlainObject(runtimeDecisionLikeRequest) ? runtimeDecisionLikeRequest : {};
  const request = buildRuntimeDecisionRequestShape(input);
  const requestedRuntimeDecisionType = normalizeString(input.runtimeDecisionType);

  if (requestedRuntimeDecisionType && requestedRuntimeDecisionType !== RUNTIME_DECISION_TYPE) {
    const finalReadinessResponse = simulatePromotionAdminDryRunFinalReadiness(request.finalReadiness);
    return buildRuntimeDecisionNotFoundResponse(input, finalReadinessResponse);
  }

  const finalReadinessResponse = simulatePromotionAdminDryRunFinalReadiness(request.finalReadiness);
  const finalReadinessStatus = finalReadinessResponse && typeof finalReadinessResponse.status === "number" ? finalReadinessResponse.status : 500;

  if (finalReadinessStatus !== 200) {
    const runtimeDecision = normalizeRuntimeDecision(request.runtimeDecision);
    const decisionOutcome = getDecisionOutcome(runtimeDecision);
    const runtimeDecisionGate = buildRuntimeDecisionGate(
      finalReadinessResponse,
      runtimeDecision,
      decisionOutcome.selectedDecision,
      decisionOutcome.targetRuntimeMode,
      decisionOutcome.blockingReasons
    );

    return buildRuntimeDecisionResponse({
      runtimeDecisionType: request.runtimeDecisionType,
      status: finalReadinessStatus,
      code:
        finalReadinessResponse &&
        finalReadinessResponse.body &&
        finalReadinessResponse.body.code
          ? finalReadinessResponse.body.code
          : "PROMOTION_DRY_RUN_FINAL_READINESS_NOT_FOUND",
      message:
        finalReadinessResponse &&
        finalReadinessResponse.body &&
        finalReadinessResponse.body.message
          ? finalReadinessResponse.body.message
          : "Promotion admin dry-run final readiness is not mounted.",
      runtimeDecisionMode: RUNTIME_DECISION_MODE,
      runtimeDecisionGate,
      runtimeDecision,
      decisionSummary: Object.assign({}, runtimeDecision, decisionOutcome, {
        separateRuntimePhaseRequired: true,
      }),
      finalReadinessResponse,
    });
  }

  const runtimeDecision = normalizeRuntimeDecision(request.runtimeDecision);
  const decisionOutcome = getDecisionOutcome(runtimeDecision);
  const finalReadinessRecord = finalReadinessResponse.finalReadinessRecord || buildPromotionAdminDryRunFinalReadinessRecord().finalReadinessRecord;
  const blockingReasons = dedupeStrings([
    ...cloneArray(finalReadinessRecord.blockingReasons),
    ...cloneArray(decisionOutcome.blockingReasons),
    ...(runtimeDecision.stagingOnlyRequested || runtimeDecision.productionRuntimeRequested
      ? [
          "RUNTIME_DECISION_RECORD_ONLY",
          "SEPARATE_RUNTIME_PHASE_REQUIRED",
          "STAGING_OR_PRODUCTION_ENABLEMENT_NOT_ALLOWED_IN_PHASE_42",
        ]
      : []),
  ]);
  const runtimeDecisionGate = buildRuntimeDecisionGate(
    finalReadinessResponse,
    runtimeDecision,
    decisionOutcome.selectedDecision,
    decisionOutcome.targetRuntimeMode,
    blockingReasons
  );

  return buildRuntimeDecisionResponse({
    runtimeDecisionType: request.runtimeDecisionType,
    status: 200,
    code: null,
    message: "Promotion admin dry-run runtime decision record is ready.",
    runtimeDecisionMode: RUNTIME_DECISION_MODE,
    runtimeDecisionGate,
    runtimeDecision,
    decisionSummary: Object.assign({}, runtimeDecision, decisionOutcome, {
      blockingReasons: cloneArray(blockingReasons),
      separateRuntimePhaseRequired: true,
    }),
    finalReadinessResponse,
    bodyOverrides: runtimeDecision.decision === "reject_runtime_for_now"
      ? {
          runtimeHeld: true,
          runtimeRejected: true,
          runtimeEnabled: false,
        }
      : {
          runtimeHeld: true,
          runtimeRejected: false,
          runtimeEnabled: false,
        },
  });
}

module.exports = {
  buildPromotionAdminDryRunRuntimeDecisionGate,
  simulatePromotionAdminDryRunRuntimeDecision,
};
