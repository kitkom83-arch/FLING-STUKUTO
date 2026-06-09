"use strict";

const {
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
  PASS: ORO7Y_PASS,
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
  validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
} = require("./oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary");

const ORO7Z_PHASE = "ORO-7Z";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE =
  "runtime_activation_execution_final_pre_live_execution_gate_only";
const ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS =
  "passed_for_separate_actual_live_execution_authorization_request_only";

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

const ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_RECORD = Object.freeze({
  PHASE: ORO7Z_PHASE,
  PASS,
  HOLD,
  ORO7Y_LIVE_READINESS_DECISION_SCOPE,
  ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS,
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
});

const BASELINE_ORO7Y_SUMMARY =
  validateOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
    buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary()
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

function buildOro7yEvidenceFromSummary(summary) {
  return {
    dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary:
      true,
    oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryResult ===
      ORO7Y_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y:
      summary.result === ORO7Y_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y:
      summary.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope,
  };
}

function buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture",
    phase: ORO7Z_PHASE,
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence:
      buildOro7yEvidenceFromSummary(BASELINE_ORO7Y_SUMMARY),
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus:
        ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope:
        ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
      ...closedFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest: true,
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
    buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(
    merged.oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence
  )
    ? merged.oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence
    : {};
  const gate = isPlainObject(
    merged.runtimeActivationExecutionFinalPreLiveExecutionGateEvidence
  )
    ? merged.runtimeActivationExecutionFinalPreLiveExecutionGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary",
        true
      ),
    oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y",
        ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y",
        ORO7Y_LIVE_READINESS_DECISION_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared:
      readBoolean(
        gate,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
      readBoolean(
        gate,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus:
      readString(
        gate,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus",
        ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope:
      readString(
        gate,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope",
        ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
      ),
    nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest: readBoolean(
      gate,
      "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest",
      true
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      gate,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      gate,
      "separateActualExecutionApprovalRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] = readBoolean(gate, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary ||
    !fixture.oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y
  ) {
    blockers.push("missing_passed_oro7y_runtime_activation_execution_live_readiness_decision");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y
  ) {
    blockers.push("runtime_activation_execution_live_readiness_decision_required_from_oro7y");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y !==
    ORO_7Y_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_DECISION_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_oro7y_runtime_activation_execution_live_readiness_decision_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y !==
    ORO7Y_LIVE_READINESS_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro7y_runtime_activation_execution_live_readiness_decision_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared
  ) {
    blockers.push("runtime_activation_execution_final_pre_live_execution_gate_preparation_required");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed
  ) {
    blockers.push("runtime_activation_execution_final_pre_live_execution_gate_must_pass");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus !==
    ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
  ) {
    blockers.push("invalid_runtime_activation_execution_final_pre_live_execution_gate_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope !==
    ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_final_pre_live_execution_gate_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro7z`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_authorization_request_required_after_oro7z");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7z");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO7Z_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateResult:
      result,
    dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary:
      fixture.dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
    oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed:
      pass &&
      fixture.oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope
        : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
  input = buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
  input = {}
) {
  return evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
    input
  );
}

function runOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
  input = {}
) {
  return validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
    input
  );
}

function buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSummary(
  input = {}
) {
  return evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
    input
  );
}

module.exports = {
  ORO7Z_PHASE,
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  PASS,
  HOLD,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  evaluateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  runOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateSummary,
};
