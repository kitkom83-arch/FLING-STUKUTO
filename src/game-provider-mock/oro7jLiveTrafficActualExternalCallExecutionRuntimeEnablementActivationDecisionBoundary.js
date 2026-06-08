"use strict";

const {
  PASS: ORO7I_PASS,
  RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
  buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
  validateOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
} = require("./oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary");

const ORO_7J_PHASE = "ORO-7J";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY =
  "approved_for_separate_actual_external_call_execution_runtime_enablement_final_activation_readiness_only";
const RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY =
  "runtime_enablement_activation_decision_only";

const ORO7J_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7J_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
  RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
});

const BASELINE_ORO7I_SUMMARY =
  validateOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary(
    buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary()
  );

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, overrides) {
  if (!isPlainObject(overrides)) return clone(base);
  const output = clone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = clone(value);
    }
  }
  return output;
}

function readBoolean(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  return fallback;
}

function readString(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) {
    return source[key];
  }
  return fallback;
}

function buildOro7iEvidenceFromSummary(summary) {
  return {
    dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary:
      true,
    oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryResult ===
      ORO7I_PASS,
    actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i:
      summary.actualExternalCallExecutionRuntimeEnablementActivationRequestPrepared === true,
    actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i:
      summary.actualExternalCallExecutionRuntimeEnablementActivationRequestSubmitted === true,
    actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i:
      summary.actualExternalCallExecutionRuntimeEnablementActivationRequestStatus,
    actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i:
      summary.actualExternalCallExecutionRuntimeEnablementActivationRequestScope,
  };
}

function buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixture",
    phase: ORO_7J_PHASE,
    oro7iRuntimeEnablementActivationRequestEvidence: buildOro7iEvidenceFromSummary(
      BASELINE_ORO7I_SUMMARY
    ),
    runtimeEnablementActivationDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared: true,
      actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued: true,
      actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
      actualExternalCallExecutionRuntimeEnablementActivationDecisionScope:
        RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      externalNetworkAllowed: false,
      externalNetworkCalled: false,
      liveOroPlayApiCallAllowed: false,
      liveOroPlayApiCalled: false,
      walletMutationAllowed: false,
      walletMutationPerformed: false,
      ledgerMutationAllowed: false,
      ledgerMutationPerformed: false,
      prismaWriteAllowed: false,
      prismaWritePerformed: false,
      dbTransactionAllowed: false,
      dbTransactionPerformed: false,
      migrationAllowed: false,
      migrationPerformed: false,
      deployAllowed: false,
      deployPerformed: false,
      routeEnablementAllowed: false,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      apiBalanceAliasAllowed: false,
      apiTransactionAliasAllowed: false,
      apiOroplayBalanceRouteAllowed: false,
      apiOroplayTransactionRouteAllowed: false,
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro7iRuntimeEnablementActivationRequestEvidence)
    ? merged.oro7iRuntimeEnablementActivationRequestEvidence
    : {};
  const decision = isPlainObject(merged.runtimeEnablementActivationDecisionEvidence)
    ? merged.runtimeEnablementActivationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary",
        true
      ),
    oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i:
      readString(
        request,
        "actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION
      ),
    actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i:
      readString(
        request,
        "actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i",
        RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementActivationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementActivationDecisionScope",
      RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      decision,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      decision,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionLiveExecuted: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecuted",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      decision,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      decision,
      "separateActualExecutionApprovalRequired",
      true
    ),
    externalNetworkAllowed: readBoolean(safety, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(safety, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      safety,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(safety, "liveOroPlayApiCalled", false),
    walletMutationAllowed: readBoolean(safety, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(safety, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(safety, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(safety, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(safety, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(safety, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(safety, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(safety, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(safety, "migrationAllowed", false),
    migrationPerformed: readBoolean(safety, "migrationPerformed", false),
    deployAllowed: readBoolean(safety, "deployAllowed", false),
    deployPerformed: readBoolean(safety, "deployPerformed", false),
    routeEnablementAllowed: readBoolean(safety, "routeEnablementAllowed", false),
    expressMountAllowed: readBoolean(safety, "expressMountAllowed", false),
    publicAliasAllowed: readBoolean(safety, "publicAliasAllowed", false),
    apiBalanceAliasAllowed: readBoolean(safety, "apiBalanceAliasAllowed", false),
    apiTransactionAliasAllowed: readBoolean(
      safety,
      "apiTransactionAliasAllowed",
      false
    ),
    apiOroplayBalanceRouteAllowed: readBoolean(
      safety,
      "apiOroplayBalanceRouteAllowed",
      false
    ),
    apiOroplayTransactionRouteAllowed: readBoolean(
      safety,
      "apiOroplayTransactionRouteAllowed",
      false
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary ||
    !fixture.oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i ||
    !fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i ||
    fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i !==
      RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
  ) {
    blockers.push("missing_oro7i_runtime_enablement_activation_request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i !==
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION
  ) {
    blockers.push("invalid_oro7i_runtime_enablement_activation_request_status");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued ||
    fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionScope !==
      RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY
  ) {
    blockers.push("runtime_enablement_activation_decision_record_required_in_oro7j");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7j");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7j");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7j");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7j");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7j");
  }
  if (
    fixture.walletMutationAllowed ||
    fixture.walletMutationPerformed ||
    fixture.ledgerMutationAllowed ||
    fixture.ledgerMutationPerformed ||
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("mutation_not_allowed_in_oro7j");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration_or_deploy_not_allowed_in_oro7j");
  }
  if (
    fixture.routeEnablementAllowed ||
    fixture.expressMountAllowed ||
    fixture.publicAliasAllowed ||
    fixture.apiBalanceAliasAllowed ||
    fixture.apiTransactionAliasAllowed ||
    fixture.apiOroplayBalanceRouteAllowed ||
    fixture.apiOroplayTransactionRouteAllowed
  ) {
    blockers.push("route_enablement_not_allowed_in_oro7j");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next_phase_final_activation_readiness_required_after_oro7j");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7j");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_7J_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryResult:
      result,
    dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary:
      fixture.dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
    oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed:
      pass &&
      fixture.oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i,
    actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i,
    actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared,
    actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued,
    actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementActivationDecisionScope: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementActivationDecisionScope
      : HOLD,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionLiveExecuted: false,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    walletMutationAllowed: false,
    walletMutationPerformed: false,
    ledgerMutationAllowed: false,
    ledgerMutationPerformed: false,
    prismaWriteAllowed: false,
    prismaWritePerformed: false,
    dbTransactionAllowed: false,
    dbTransactionPerformed: false,
    migrationAllowed: false,
    migrationPerformed: false,
    deployAllowed: false,
    deployPerformed: false,
    routeEnablementAllowed: false,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    apiBalanceAliasAllowed: false,
    apiTransactionAliasAllowed: false,
    apiOroplayBalanceRouteAllowed: false,
    apiOroplayTransactionRouteAllowed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7jRuntimeEnablementActivationDecisionBoundary(
  input =
    buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary(
  input = {}
) {
  return evaluateOro7jRuntimeEnablementActivationDecisionBoundary(input);
}

function buildOro7jRuntimeEnablementActivationDecisionBoundarySummary(input = {}) {
  return evaluateOro7jRuntimeEnablementActivationDecisionBoundary(input);
}

module.exports = {
  ORO_7J_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
  ORO7J_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY_STATUS,
  buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
  evaluateOro7jRuntimeEnablementActivationDecisionBoundary,
  validateOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
  buildOro7jRuntimeEnablementActivationDecisionBoundarySummary,
};
