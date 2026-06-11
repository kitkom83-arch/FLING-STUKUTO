"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
  PASS: ORO8G_PASS,
  buildOro8gActualLiveExecutionDecisionBoundary,
  validateOro8gActualLiveExecutionDecisionBoundary,
} = require("./oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundary");

const ORO8H_PHASE = "ORO-8H";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE =
  "actual_live_execution_execution_gate_only";
const ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS =
  "passed_for_separate_actual_live_execution_execution_request_only";

const CLOSED_ORO8H_PRE_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionRequestApproved",
  "actualLiveExecutionDecisionApproved",
]);

const CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionExecutionRequestSubmitted",
  "actualLiveExecutionExecutionRequestApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_RECORD = Object.freeze({
  PHASE: ORO8H_PHASE,
  PASS,
  HOLD,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
});

const BASELINE_ORO8G_SUMMARY = validateOro8gActualLiveExecutionDecisionBoundary(
  buildOro8gActualLiveExecutionDecisionBoundary()
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

function closedRuntimeFlags() {
  return CLOSED_RUNTIME_AND_SAFETY_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function closedDecisionAndExecutionFlags() {
  return CLOSED_ORO8H_PRE_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function closedExecutionRequestAndExecutionFlags() {
  return CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8gEvidenceFromSummary(summary) {
  const decisionPassed =
    summary.result === ORO8G_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryResult ===
      ORO8G_PASS;

  return {
    dependsOnOro8gActualLiveExecutionDecisionBoundary: true,
    oro8gActualLiveExecutionDecisionBoundaryPassed: decisionPassed,
    actualLiveExecutionDecisionIssuedFromOro8g:
      summary.actualLiveExecutionDecisionIssued === true,
    actualLiveExecutionDecisionStatusFromOro8g:
      summary.actualLiveExecutionDecisionStatus,
    actualLiveExecutionDecisionScopeFromOro8g:
      summary.actualLiveExecutionDecisionScope,
  };
}

function buildOro8hActualLiveExecutionExecutionGate(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionExecutionGateFixture",
    phase: ORO8H_PHASE,
    oro8gActualLiveExecutionDecisionBoundaryEvidence:
      buildOro8gEvidenceFromSummary(BASELINE_ORO8G_SUMMARY),
    actualLiveExecutionExecutionGateEvidence: {
      actualLiveExecutionExecutionGatePrepared: true,
      actualLiveExecutionExecutionGateIssued: true,
      actualLiveExecutionExecutionGatePassed: true,
      actualLiveExecutionExecutionGateStatus:
        ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
      actualLiveExecutionExecutionGateScope:
        ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
      ...closedRuntimeFlags(),
      ...closedDecisionAndExecutionFlags(),
      ...closedExecutionRequestAndExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedDecisionAndExecutionFlags(),
      ...closedExecutionRequestAndExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8hActualLiveExecutionExecutionGate();
  const merged = deepMerge(baseline, source);
  const oro8g = isPlainObject(merged.oro8gActualLiveExecutionDecisionBoundaryEvidence)
    ? merged.oro8gActualLiveExecutionDecisionBoundaryEvidence
    : {};
  const executionGate = isPlainObject(merged.actualLiveExecutionExecutionGateEvidence)
    ? merged.actualLiveExecutionExecutionGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8gActualLiveExecutionDecisionBoundary: readBoolean(
      oro8g,
      "dependsOnOro8gActualLiveExecutionDecisionBoundary",
      true
    ),
    oro8gActualLiveExecutionDecisionBoundaryPassed: readBoolean(
      oro8g,
      "oro8gActualLiveExecutionDecisionBoundaryPassed",
      true
    ),
    actualLiveExecutionDecisionIssuedFromOro8g: readBoolean(
      oro8g,
      "actualLiveExecutionDecisionIssuedFromOro8g",
      true
    ),
    actualLiveExecutionDecisionStatusFromOro8g: readString(
      oro8g,
      "actualLiveExecutionDecisionStatusFromOro8g",
      ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionDecisionScopeFromOro8g: readString(
      oro8g,
      "actualLiveExecutionDecisionScopeFromOro8g",
      ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE
    ),
    actualLiveExecutionExecutionGatePrepared: readBoolean(
      executionGate,
      "actualLiveExecutionExecutionGatePrepared",
      true
    ),
    actualLiveExecutionExecutionGateIssued: readBoolean(
      executionGate,
      "actualLiveExecutionExecutionGateIssued",
      true
    ),
    actualLiveExecutionExecutionGatePassed: readBoolean(
      executionGate,
      "actualLiveExecutionExecutionGatePassed",
      true
    ),
    actualLiveExecutionExecutionGateStatus: readString(
      executionGate,
      "actualLiveExecutionExecutionGateStatus",
      ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
    ),
    actualLiveExecutionExecutionGateScope: readString(
      executionGate,
      "actualLiveExecutionExecutionGateScope",
      ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest: readBoolean(
      executionGate,
      "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest",
      true
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      executionGate,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      executionGate,
      "separateActualExecutionApprovalRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(executionGate, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8H_PRE_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(executionGate, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(executionGate, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8gActualLiveExecutionDecisionBoundary ||
    !fixture.oro8gActualLiveExecutionDecisionBoundaryPassed
  ) {
    blockers.push("missing_passed_oro8g_actual_live_execution_decision_boundary");
  }
  if (!fixture.actualLiveExecutionDecisionIssuedFromOro8g) {
    blockers.push("oro8g_actual_live_execution_decision_issuance_required");
  }
  if (
    fixture.actualLiveExecutionDecisionStatusFromOro8g !==
    ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_oro8g_actual_live_execution_decision_status");
  }
  if (
    fixture.actualLiveExecutionDecisionScopeFromOro8g !==
    ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro8g_actual_live_execution_decision_scope");
  }

  if (!fixture.actualLiveExecutionExecutionGatePrepared) {
    blockers.push("actual_live_execution_execution_gate_preparation_required");
  }
  if (!fixture.actualLiveExecutionExecutionGateIssued) {
    blockers.push("actual_live_execution_execution_gate_issuance_required");
  }
  if (!fixture.actualLiveExecutionExecutionGatePassed) {
    blockers.push("actual_live_execution_execution_gate_pass_required");
  }
  if (
    fixture.actualLiveExecutionExecutionGateStatus !==
    ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionExecutionGateScope !==
    ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_execution_gate_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8h`);
  }
  for (const key of CLOSED_ORO8H_PRE_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8h`);
  }
  for (const key of CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8h`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_execution_request_required_after_oro8h");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8h");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8H_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateResult: result,
    dependsOnOro8gActualLiveExecutionDecisionBoundary:
      fixture.dependsOnOro8gActualLiveExecutionDecisionBoundary,
    oro8gActualLiveExecutionDecisionBoundaryPassed:
      pass && fixture.oro8gActualLiveExecutionDecisionBoundaryPassed,
    actualLiveExecutionDecisionIssuedFromOro8g:
      pass && fixture.actualLiveExecutionDecisionIssuedFromOro8g,
    actualLiveExecutionDecisionStatusFromOro8g: pass
      ? fixture.actualLiveExecutionDecisionStatusFromOro8g
      : HOLD,
    actualLiveExecutionDecisionScopeFromOro8g: pass
      ? fixture.actualLiveExecutionDecisionScopeFromOro8g
      : HOLD,
    actualLiveExecutionExecutionGatePrepared:
      pass && fixture.actualLiveExecutionExecutionGatePrepared,
    actualLiveExecutionExecutionGateIssued:
      pass && fixture.actualLiveExecutionExecutionGateIssued,
    actualLiveExecutionExecutionGatePassed:
      pass && fixture.actualLiveExecutionExecutionGatePassed,
    actualLiveExecutionExecutionGateStatus: pass
      ? fixture.actualLiveExecutionExecutionGateStatus
      : HOLD,
    actualLiveExecutionExecutionGateScope: pass
      ? fixture.actualLiveExecutionExecutionGateScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8H_PRE_EXECUTION_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8hActualLiveExecutionExecutionGate(
  input = buildOro8hActualLiveExecutionExecutionGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8hActualLiveExecutionExecutionGate(input = {}) {
  return evaluateOro8hActualLiveExecutionExecutionGate(input);
}

function runOro8hActualLiveExecutionExecutionGate(input = {}) {
  return validateOro8hActualLiveExecutionExecutionGate(input);
}

function buildOro8hActualLiveExecutionExecutionGateSummary(input = {}) {
  return evaluateOro8hActualLiveExecutionExecutionGate(input);
}

module.exports = {
  ORO8H_PHASE,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8H_PRE_EXECUTION_FLAGS,
  CLOSED_ORO8H_EXECUTION_REQUEST_AND_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8hActualLiveExecutionExecutionGate,
  evaluateOro8hActualLiveExecutionExecutionGate,
  validateOro8hActualLiveExecutionExecutionGate,
  runOro8hActualLiveExecutionExecutionGate,
  buildOro8hActualLiveExecutionExecutionGateSummary,
};
