"use strict";

const {
  PASS: ORO7L_PASS,
  RUNTIME_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
  buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
  validateOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
} = require("./oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary");

const ORO_7M_PHASE = "ORO-7M";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY =
  "approved_for_separate_actual_external_call_execution_runtime_activation_final_readiness_only";
const RUNTIME_ACTIVATION_DECISION_ONLY = "runtime_activation_decision_only";

const ORO7M_RUNTIME_ACTIVATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7M_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
  RUNTIME_ACTIVATION_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
  RUNTIME_ACTIVATION_DECISION_ONLY,
});

const BASELINE_ORO7L_SUMMARY =
  validateOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary(
    buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary()
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

function buildOro7lEvidenceFromSummary(summary) {
  return {
    dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary:
      true,
    oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryResult ===
      ORO7L_PASS,
    actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l:
      summary.actualExternalCallExecutionRuntimeActivationRequestPrepared === true,
    actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l:
      summary.actualExternalCallExecutionRuntimeActivationRequestSubmitted === true,
    actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l:
      summary.actualExternalCallExecutionRuntimeActivationRequestStatus,
    actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l:
      summary.actualExternalCallExecutionRuntimeActivationRequestScope,
  };
}

function buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture",
    phase: ORO_7M_PHASE,
    oro7lRuntimeActivationRequestBoundaryEvidence:
      buildOro7lEvidenceFromSummary(BASELINE_ORO7L_SUMMARY),
    runtimeActivationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationDecisionPrepared: true,
      actualExternalCallExecutionRuntimeActivationDecisionIssued: true,
      actualExternalCallExecutionRuntimeActivationDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
      actualExternalCallExecutionRuntimeActivationDecisionScope:
        RUNTIME_ACTIVATION_DECISION_ONLY,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness:
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
    buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro7lRuntimeActivationRequestBoundaryEvidence)
    ? merged.oro7lRuntimeActivationRequestBoundaryEvidence
    : {};
  const decision = isPlainObject(merged.runtimeActivationDecisionEvidence)
    ? merged.runtimeActivationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary",
        true
      ),
    oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l",
        true
      ),
    actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l",
        true
      ),
    actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l: readString(
      request,
      "actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l",
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION
    ),
    actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l: readString(
      request,
      "actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l",
      RUNTIME_ACTIVATION_REQUEST_ONLY
    ),
    actualExternalCallExecutionRuntimeActivationDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionPrepared",
      true
    ),
    actualExternalCallExecutionRuntimeActivationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionIssued",
      true
    ),
    actualExternalCallExecutionRuntimeActivationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeActivationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionScope",
      RUNTIME_ACTIVATION_DECISION_ONLY
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness",
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
    liveOroPlayApiCallAllowed: readBoolean(safety, "liveOroPlayApiCallAllowed", false),
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
    apiTransactionAliasAllowed: readBoolean(safety, "apiTransactionAliasAllowed", false),
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
    !fixture.dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary ||
    !fixture.oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l ||
    !fixture.actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l ||
    fixture.actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l !==
      RUNTIME_ACTIVATION_REQUEST_ONLY
  ) {
    blockers.push("missing_oro7l_runtime_activation_request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l !==
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION
  ) {
    blockers.push("invalid_oro7l_runtime_activation_request_status");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationDecisionIssued ||
    fixture.actualExternalCallExecutionRuntimeActivationDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY ||
    fixture.actualExternalCallExecutionRuntimeActivationDecisionScope !==
      RUNTIME_ACTIVATION_DECISION_ONLY
  ) {
    blockers.push("runtime_activation_decision_record_required_in_oro7m");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next_phase_runtime_activation_final_readiness_required_after_oro7m");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7m");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7m");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7m");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7m");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7m");
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
    blockers.push("mutation_not_allowed_in_oro7m");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration_or_deploy_not_allowed_in_oro7m");
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
    blockers.push("route_enablement_not_allowed_in_oro7m");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7m");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_7M_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryResult:
      result,
    dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary:
      fixture.dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
    oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed:
      pass &&
      fixture.oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l,
    actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l,
    actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l
      : HOLD,
    actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l
      : HOLD,
    actualExternalCallExecutionRuntimeActivationDecisionPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeActivationDecisionPrepared,
    actualExternalCallExecutionRuntimeActivationDecisionIssued:
      pass && fixture.actualExternalCallExecutionRuntimeActivationDecisionIssued,
    actualExternalCallExecutionRuntimeActivationDecisionStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationDecisionStatus
      : HOLD,
    actualExternalCallExecutionRuntimeActivationDecisionScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationDecisionScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7mRuntimeActivationDecisionBoundary(
  input =
    buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary(
  input = {}
) {
  return evaluateOro7mRuntimeActivationDecisionBoundary(input);
}

function buildOro7mRuntimeActivationDecisionBoundarySummary(input = {}) {
  return evaluateOro7mRuntimeActivationDecisionBoundary(input);
}

module.exports = {
  ORO_7M_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
  RUNTIME_ACTIVATION_DECISION_ONLY,
  ORO7M_RUNTIME_ACTIVATION_DECISION_BOUNDARY_STATUS,
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
  evaluateOro7mRuntimeActivationDecisionBoundary,
  validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
  buildOro7mRuntimeActivationDecisionBoundarySummary,
};
