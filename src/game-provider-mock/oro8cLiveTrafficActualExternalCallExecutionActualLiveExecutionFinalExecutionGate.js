"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  PASS: ORO8B_PASS,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
} = require("./oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary");

const ORO8C_PHASE = "ORO-8C";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE =
  "actual_live_execution_final_execution_gate_only";
const ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS =
  "passed_for_separate_actual_live_execution_final_execution_request_only";

const ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_RECORD = Object.freeze({
  PHASE: ORO8C_PHASE,
  PASS,
  HOLD,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
});

const BASELINE_ORO8B_SUMMARY =
  validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary()
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

function buildOro8bEvidenceFromSummary(summary) {
  const decisionPassed =
    summary.result === ORO8B_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryResult ===
      ORO8B_PASS;

  return {
    dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary:
      true,
    oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed:
      decisionPassed,
    oro8bActualLiveExecutionAuthorizationDecisionPassed: decisionPassed,
    actualLiveExecutionAuthorizationDecisionIssuedFromOro8b:
      summary.actualLiveExecutionAuthorizationDecisionIssued === true,
    actualLiveExecutionAuthorizationDecisionStatusFromOro8b:
      summary.actualLiveExecutionAuthorizationDecisionStatus,
    actualLiveExecutionAuthorizationDecisionScopeFromOro8b:
      summary.actualLiveExecutionAuthorizationDecisionScope,
  };
}

function buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture",
    phase: ORO8C_PHASE,
    oro8bActualLiveExecutionAuthorizationDecisionEvidence:
      buildOro8bEvidenceFromSummary(BASELINE_ORO8B_SUMMARY),
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGatePrepared: true,
      actualLiveExecutionFinalExecutionGateIssued: true,
      actualLiveExecutionFinalExecutionGateStatus:
        ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
      actualLiveExecutionFinalExecutionGateScope:
        ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
      ...closedFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest: true,
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
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary();
  const merged = deepMerge(baseline, source);
  const oro8b = isPlainObject(merged.oro8bActualLiveExecutionAuthorizationDecisionEvidence)
    ? merged.oro8bActualLiveExecutionAuthorizationDecisionEvidence
    : {};
  const finalGate = isPlainObject(
    merged.actualLiveExecutionFinalExecutionGateEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary:
      readBoolean(
        oro8b,
        "dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary",
        true
      ),
    oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed:
      readBoolean(
        oro8b,
        "oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed",
        true
      ),
    oro8bActualLiveExecutionAuthorizationDecisionPassed: readBoolean(
      oro8b,
      "oro8bActualLiveExecutionAuthorizationDecisionPassed",
      true
    ),
    actualLiveExecutionAuthorizationDecisionIssuedFromOro8b: readBoolean(
      oro8b,
      "actualLiveExecutionAuthorizationDecisionIssuedFromOro8b",
      true
    ),
    actualLiveExecutionAuthorizationDecisionStatusFromOro8b: readString(
      oro8b,
      "actualLiveExecutionAuthorizationDecisionStatusFromOro8b",
      ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
    ),
    actualLiveExecutionAuthorizationDecisionScopeFromOro8b: readString(
      oro8b,
      "actualLiveExecutionAuthorizationDecisionScopeFromOro8b",
      ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
    ),
    actualLiveExecutionFinalExecutionGatePrepared: readBoolean(
      finalGate,
      "actualLiveExecutionFinalExecutionGatePrepared",
      true
    ),
    actualLiveExecutionFinalExecutionGateIssued: readBoolean(
      finalGate,
      "actualLiveExecutionFinalExecutionGateIssued",
      true
    ),
    actualLiveExecutionFinalExecutionGateStatus: readString(
      finalGate,
      "actualLiveExecutionFinalExecutionGateStatus",
      ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
    ),
    actualLiveExecutionFinalExecutionGateScope: readString(
      finalGate,
      "actualLiveExecutionFinalExecutionGateScope",
      ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      finalGate,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest: readBoolean(
      finalGate,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      finalGate,
      "separateActualExecutionApprovalRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(finalGate, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture
      .dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary ||
    !fixture
      .oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed ||
    !fixture.oro8bActualLiveExecutionAuthorizationDecisionPassed
  ) {
    blockers.push(
      "missing_passed_oro8b_actual_live_execution_authorization_decision_boundary"
    );
  }
  if (!fixture.actualLiveExecutionAuthorizationDecisionIssuedFromOro8b) {
    blockers.push("oro8b_actual_live_execution_authorization_decision_issuance_required");
  }
  if (
    fixture.actualLiveExecutionAuthorizationDecisionStatusFromOro8b !==
    ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
  ) {
    blockers.push(
      "invalid_oro8b_actual_live_execution_authorization_decision_status"
    );
  }
  if (
    fixture.actualLiveExecutionAuthorizationDecisionScopeFromOro8b !==
    ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro8b_actual_live_execution_authorization_decision_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionGatePrepared) {
    blockers.push("actual_live_execution_final_execution_gate_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateIssued) {
    blockers.push("actual_live_execution_final_execution_gate_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateStatus !==
    ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateScope !==
    ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_gate_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8c`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_approval_required_after_oro8c"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8c");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8C_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult:
      result,
    dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary:
      fixture
        .dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
    oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed:
      pass &&
      fixture
        .oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed,
    oro8bActualLiveExecutionAuthorizationDecisionPassed:
      pass && fixture.oro8bActualLiveExecutionAuthorizationDecisionPassed,
    actualLiveExecutionAuthorizationDecisionIssuedFromOro8b:
      pass && fixture.actualLiveExecutionAuthorizationDecisionIssuedFromOro8b,
    actualLiveExecutionAuthorizationDecisionStatusFromOro8b: pass
      ? fixture.actualLiveExecutionAuthorizationDecisionStatusFromOro8b
      : HOLD,
    actualLiveExecutionAuthorizationDecisionScopeFromOro8b: pass
      ? fixture.actualLiveExecutionAuthorizationDecisionScopeFromOro8b
      : HOLD,
    actualLiveExecutionFinalExecutionGatePrepared:
      pass && fixture.actualLiveExecutionFinalExecutionGatePrepared,
    actualLiveExecutionFinalExecutionGateIssued:
      pass && fixture.actualLiveExecutionFinalExecutionGateIssued,
    actualLiveExecutionFinalExecutionGateStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionGateStatus
      : HOLD,
    actualLiveExecutionFinalExecutionGateScope: pass
      ? fixture.actualLiveExecutionFinalExecutionGateScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
  input =
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
  input = {}
) {
  return evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
    input
  );
}

function runOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
  input = {}
) {
  return validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
    input
  );
}

function buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundarySummary(
  input = {}
) {
  return evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
    input
  );
}

module.exports = {
  ORO8C_PHASE,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  PASS,
  HOLD,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  evaluateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  runOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundarySummary,
};
