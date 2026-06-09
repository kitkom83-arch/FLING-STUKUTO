"use strict";

const {
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
  PASS: ORO7X_PASS,
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
} = require("./oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary");

const ORO7Y_PHASE = "ORO-7Y";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7Y_LIVE_READINESS_DECISION_SCOPE =
  "runtime_activation_execution_live_readiness_decision_only";
const ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS =
  "approved_for_separate_runtime_activation_execution_final_pre_live_execution_gate_only";

const CLOSED_RUNTIME_AND_SAFETY_FLAGS = Object.freeze([
  "actualExternalCallExecutionRuntimeEnabled",
  "actualExternalCallExecutionActivated",
  "actualExternalCallExecutionEnabled",
  "actualExternalCallExecutionAuthorized",
  "actualExternalCallExecutionLiveExecutionApproved",
  "actualExternalCallExecutionLiveExecuted",
  "externalNetworkAllowed",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCalled",
  "walletMutationAllowed",
  "walletMutationPerformed",
  "ledgerMutationAllowed",
  "ledgerMutationPerformed",
  "prismaWriteAllowed",
  "prismaWritePerformed",
  "dbTransactionAllowed",
  "dbTransactionPerformed",
  "migrationAllowed",
  "migrationPerformed",
  "deployAllowed",
  "deployPerformed",
  "routeEnablementAllowed",
  "expressMountAllowed",
  "publicAliasAllowed",
  "apiBalanceAliasAllowed",
  "apiTransactionAliasAllowed",
  "apiOroplayBalanceRouteAllowed",
  "apiOroplayTransactionRouteAllowed",
]);

const ORO7Y_LIVE_READINESS_DECISION_RECORD = Object.freeze({
  PHASE: ORO7Y_PHASE,
  PASS,
  HOLD,
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
});

const BASELINE_ORO7X_SUMMARY =
  validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
    buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary()
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

function closedFlags() {
  return CLOSED_RUNTIME_AND_SAFETY_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro7xEvidenceFromSummary(summary) {
  return {
    dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary:
      true,
    oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryResult ===
      ORO7X_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope,
  };
}

function buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture",
    phase: ORO7Y_PHASE,
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence:
      buildOro7xEvidenceFromSummary(BASELINE_ORO7X_SUMMARY),
    runtimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus:
        ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope:
        ORO7Y_LIVE_READINESS_DECISION_SCOPE,
      ...closedFlags(),
      nextPhaseRequiresSeparateFinalPreLiveExecutionGate: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedFlags(),
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(
    merged.oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence
  )
    ? merged.oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence
    : {};
  const decision = isPlainObject(
    merged.runtimeActivationExecutionLiveReadinessDecisionEvidence
  )
    ? merged.runtimeActivationExecutionLiveReadinessDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary",
        true
      ),
    oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x",
        ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x",
        ORO7X_LIVE_READINESS_REQUEST_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus",
        ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope",
        ORO7Y_LIVE_READINESS_DECISION_SCOPE
      ),
    nextPhaseRequiresSeparateFinalPreLiveExecutionGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparateFinalPreLiveExecutionGate",
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
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] = readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary ||
    !fixture.oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed
  ) {
    blockers.push("missing_oro7x_runtime_activation_execution_live_readiness_request");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x
  ) {
    blockers.push(
      "runtime_activation_execution_live_readiness_request_submission_required_in_oro7x"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x !==
    ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_oro7x_runtime_activation_execution_live_readiness_request_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x !==
    ORO7X_LIVE_READINESS_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro7x_runtime_activation_execution_live_readiness_request_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued
  ) {
    blockers.push("runtime_activation_execution_live_readiness_decision_required");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus !==
    ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_runtime_activation_execution_live_readiness_decision_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope !==
    ORO7Y_LIVE_READINESS_DECISION_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_live_readiness_decision_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro7y`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateFinalPreLiveExecutionGate ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_final_pre_live_execution_gate_required_after_oro7y");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7y");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO7Y_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryResult:
      result,
    dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary:
      fixture.dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
    oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed:
      pass &&
      fixture.oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope
        : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateFinalPreLiveExecutionGate =
    pass && fixture.nextPhaseRequiresSeparateFinalPreLiveExecutionGate;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
  input = buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
  input = {}
) {
  return evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
    input
  );
}

function runOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
  input = {}
) {
  return validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
    input
  );
}

function buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionSummary(
  input = {}
) {
  return evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
    input
  );
}

module.exports = {
  ORO7Y_PHASE,
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
  ORO7Y_LIVE_READINESS_DECISION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  PASS,
  HOLD,
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  evaluateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  runOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionSummary,
};
