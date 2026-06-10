"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
  PASS: ORO8C_PASS,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
  validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
} = require("./oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

const ORO8D_PHASE = "ORO-8D";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE =
  "actual_live_execution_final_execution_request_boundary_only";
const ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS =
  "submitted_for_separate_actual_live_execution_final_execution_decision_only";

const CLOSED_ORO8D_DECISION_FLAGS = Object.freeze([
  "actualLiveExecutionFinalExecutionDecisionIssued",
  "actualLiveExecutionFinalExecutionDecisionApproved",
]);

const ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO8D_PHASE,
  PASS,
  HOLD,
  ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
});

const BASELINE_ORO8C_SUMMARY =
  validateOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary()
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

function closedDecisionFlags() {
  return CLOSED_ORO8D_DECISION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8cEvidenceFromSummary(summary) {
  const gatePassed =
    summary.result === ORO8C_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult ===
      ORO8C_PASS;

  return {
    dependsOnOro8cActualLiveExecutionFinalExecutionGate: true,
    oro8cActualLiveExecutionFinalExecutionGatePassed: gatePassed,
    actualLiveExecutionFinalExecutionGateIssuedFromOro8c:
      summary.actualLiveExecutionFinalExecutionGateIssued === true,
    actualLiveExecutionFinalExecutionGateStatusFromOro8c:
      summary.actualLiveExecutionFinalExecutionGateStatus,
    actualLiveExecutionFinalExecutionGateScopeFromOro8c:
      summary.actualLiveExecutionFinalExecutionGateScope,
  };
}

function buildOro8dActualLiveExecutionFinalExecutionRequestBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture",
    phase: ORO8D_PHASE,
    oro8cActualLiveExecutionFinalExecutionGateEvidence:
      buildOro8cEvidenceFromSummary(BASELINE_ORO8C_SUMMARY),
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestPrepared: true,
      actualLiveExecutionFinalExecutionRequestIssued: true,
      actualLiveExecutionFinalExecutionRequestStatus:
        ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
      actualLiveExecutionFinalExecutionRequestScope:
        ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
      ...closedFlags(),
      ...closedDecisionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedFlags(),
      ...closedDecisionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8dActualLiveExecutionFinalExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro8c = isPlainObject(merged.oro8cActualLiveExecutionFinalExecutionGateEvidence)
    ? merged.oro8cActualLiveExecutionFinalExecutionGateEvidence
    : {};
  const request = isPlainObject(merged.actualLiveExecutionFinalExecutionRequestEvidence)
    ? merged.actualLiveExecutionFinalExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8cActualLiveExecutionFinalExecutionGate: readBoolean(
      oro8c,
      "dependsOnOro8cActualLiveExecutionFinalExecutionGate",
      true
    ),
    oro8cActualLiveExecutionFinalExecutionGatePassed: readBoolean(
      oro8c,
      "oro8cActualLiveExecutionFinalExecutionGatePassed",
      true
    ),
    actualLiveExecutionFinalExecutionGateIssuedFromOro8c: readBoolean(
      oro8c,
      "actualLiveExecutionFinalExecutionGateIssuedFromOro8c",
      true
    ),
    actualLiveExecutionFinalExecutionGateStatusFromOro8c: readString(
      oro8c,
      "actualLiveExecutionFinalExecutionGateStatusFromOro8c",
      ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
    ),
    actualLiveExecutionFinalExecutionGateScopeFromOro8c: readString(
      oro8c,
      "actualLiveExecutionFinalExecutionGateScopeFromOro8c",
      ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
    ),
    actualLiveExecutionFinalExecutionRequestPrepared: readBoolean(
      request,
      "actualLiveExecutionFinalExecutionRequestPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionRequestIssued: readBoolean(
      request,
      "actualLiveExecutionFinalExecutionRequestIssued",
      true
    ),
    actualLiveExecutionFinalExecutionRequestStatus: readString(
      request,
      "actualLiveExecutionFinalExecutionRequestStatus",
      ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionFinalExecutionRequestScope: readString(
      request,
      "actualLiveExecutionFinalExecutionRequestScope",
      ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision",
      true
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      request,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      request,
      "separateActualExecutionApprovalRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] = readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  for (const key of CLOSED_ORO8D_DECISION_FLAGS) {
    normalized[key] = readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8cActualLiveExecutionFinalExecutionGate ||
    !fixture.oro8cActualLiveExecutionFinalExecutionGatePassed
  ) {
    blockers.push("missing_passed_oro8c_actual_live_execution_final_execution_gate");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateIssuedFromOro8c) {
    blockers.push("oro8c_actual_live_execution_final_execution_gate_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateStatusFromOro8c !==
    ORO_8C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_oro8c_actual_live_execution_final_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateScopeFromOro8c !==
    ORO8C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_oro8c_actual_live_execution_final_execution_gate_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionRequestPrepared) {
    blockers.push("actual_live_execution_final_execution_request_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestIssued) {
    blockers.push("actual_live_execution_final_execution_request_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestStatus !==
    ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestScope !==
    ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_request_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8d`);
  }

  for (const key of CLOSED_ORO8D_DECISION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8d`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_final_execution_decision_required_after_oro8d");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8d");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8D_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult:
      result,
    dependsOnOro8cActualLiveExecutionFinalExecutionGate:
      fixture.dependsOnOro8cActualLiveExecutionFinalExecutionGate,
    oro8cActualLiveExecutionFinalExecutionGatePassed:
      pass && fixture.oro8cActualLiveExecutionFinalExecutionGatePassed,
    actualLiveExecutionFinalExecutionGateIssuedFromOro8c:
      pass && fixture.actualLiveExecutionFinalExecutionGateIssuedFromOro8c,
    actualLiveExecutionFinalExecutionGateStatusFromOro8c: pass
      ? fixture.actualLiveExecutionFinalExecutionGateStatusFromOro8c
      : HOLD,
    actualLiveExecutionFinalExecutionGateScopeFromOro8c: pass
      ? fixture.actualLiveExecutionFinalExecutionGateScopeFromOro8c
      : HOLD,
    actualLiveExecutionFinalExecutionRequestPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionRequestPrepared,
    actualLiveExecutionFinalExecutionRequestIssued:
      pass && fixture.actualLiveExecutionFinalExecutionRequestIssued,
    actualLiveExecutionFinalExecutionRequestStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestStatus
      : HOLD,
    actualLiveExecutionFinalExecutionRequestScope: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  for (const key of CLOSED_ORO8D_DECISION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecision;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary(
  input = buildOro8dActualLiveExecutionFinalExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8dActualLiveExecutionFinalExecutionRequestBoundary(input = {}) {
  return evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary(input);
}

function runOro8dActualLiveExecutionFinalExecutionRequestBoundary(input = {}) {
  return validateOro8dActualLiveExecutionFinalExecutionRequestBoundary(input);
}

function buildOro8dActualLiveExecutionFinalExecutionRequestSummary(input = {}) {
  return evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary(input);
}

module.exports = {
  ORO8D_PHASE,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8D_DECISION_FLAGS,
  PASS,
  HOLD,
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  evaluateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  runOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  buildOro8dActualLiveExecutionFinalExecutionRequestSummary,
};
