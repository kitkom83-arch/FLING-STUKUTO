"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
  PASS: ORO8F_PASS,
  buildOro8fActualLiveExecutionRequestBoundary,
  validateOro8fActualLiveExecutionRequestBoundary,
} = require("./oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundary");

const ORO8G_PHASE = "ORO-8G";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE =
  "actual_live_execution_decision_boundary_only";
const ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS =
  "approved_for_separate_actual_live_execution_execution_gate_only";

const CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionRequestApproved",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecutionGateIssued",
  "actualLiveExecutionExecutionGatePassed",
  "actualLiveExecutionExecuted",
]);

const ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_RECORD = Object.freeze({
  PHASE: ORO8G_PHASE,
  PASS,
  HOLD,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
});

const BASELINE_ORO8F_SUMMARY = validateOro8fActualLiveExecutionRequestBoundary(
  buildOro8fActualLiveExecutionRequestBoundary()
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
  return CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8fEvidenceFromSummary(summary) {
  const requestPassed =
    summary.result === ORO8F_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryResult ===
      ORO8F_PASS;

  return {
    dependsOnOro8fActualLiveExecutionRequestBoundary: true,
    oro8fActualLiveExecutionRequestBoundaryPassed: requestPassed,
    actualLiveExecutionRequestSubmittedFromOro8f: summary.actualLiveExecutionRequestSubmitted === true,
    actualLiveExecutionRequestStatusFromOro8f: summary.actualLiveExecutionRequestStatus,
    actualLiveExecutionRequestScopeFromOro8f: summary.actualLiveExecutionRequestScope,
  };
}

function buildOro8gActualLiveExecutionDecisionBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionDecisionBoundaryFixture",
    phase: ORO8G_PHASE,
    oro8fActualLiveExecutionRequestBoundaryEvidence: buildOro8fEvidenceFromSummary(
      BASELINE_ORO8F_SUMMARY
    ),
    actualLiveExecutionDecisionEvidence: {
      actualLiveExecutionDecisionPrepared: true,
      actualLiveExecutionDecisionIssued: true,
      actualLiveExecutionDecisionStatus: ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
      actualLiveExecutionDecisionScope: ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
      ...closedRuntimeFlags(),
      ...closedDecisionAndExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionExecutionGate: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedDecisionAndExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8gActualLiveExecutionDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro8f = isPlainObject(merged.oro8fActualLiveExecutionRequestBoundaryEvidence)
    ? merged.oro8fActualLiveExecutionRequestBoundaryEvidence
    : {};
  const decision = isPlainObject(merged.actualLiveExecutionDecisionEvidence)
    ? merged.actualLiveExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8fActualLiveExecutionRequestBoundary: readBoolean(
      oro8f,
      "dependsOnOro8fActualLiveExecutionRequestBoundary",
      true
    ),
    oro8fActualLiveExecutionRequestBoundaryPassed: readBoolean(
      oro8f,
      "oro8fActualLiveExecutionRequestBoundaryPassed",
      true
    ),
    actualLiveExecutionRequestSubmittedFromOro8f: readBoolean(
      oro8f,
      "actualLiveExecutionRequestSubmittedFromOro8f",
      true
    ),
    actualLiveExecutionRequestStatusFromOro8f: readString(
      oro8f,
      "actualLiveExecutionRequestStatusFromOro8f",
      ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionRequestScopeFromOro8f: readString(
      oro8f,
      "actualLiveExecutionRequestScopeFromOro8f",
      ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE
    ),
    actualLiveExecutionDecisionPrepared: readBoolean(
      decision,
      "actualLiveExecutionDecisionPrepared",
      true
    ),
    actualLiveExecutionDecisionIssued: readBoolean(
      decision,
      "actualLiveExecutionDecisionIssued",
      true
    ),
    actualLiveExecutionDecisionStatus: readString(
      decision,
      "actualLiveExecutionDecisionStatus",
      ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionDecisionScope: readString(
      decision,
      "actualLiveExecutionDecisionScope",
      ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionExecutionGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualLiveExecutionExecutionGate",
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
  for (const key of CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS) {
    normalized[key] = readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8fActualLiveExecutionRequestBoundary ||
    !fixture.oro8fActualLiveExecutionRequestBoundaryPassed
  ) {
    blockers.push("missing_passed_oro8f_actual_live_execution_request_boundary");
  }
  if (!fixture.actualLiveExecutionRequestSubmittedFromOro8f) {
    blockers.push("oro8f_actual_live_execution_request_submission_required");
  }
  if (
    fixture.actualLiveExecutionRequestStatusFromOro8f !==
    ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_oro8f_actual_live_execution_request_status");
  }
  if (fixture.actualLiveExecutionRequestScopeFromOro8f !== ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE) {
    blockers.push("invalid_oro8f_actual_live_execution_request_scope");
  }

  if (!fixture.actualLiveExecutionDecisionPrepared) {
    blockers.push("actual_live_execution_decision_preparation_required");
  }
  if (!fixture.actualLiveExecutionDecisionIssued) {
    blockers.push("actual_live_execution_decision_issuance_required");
  }
  if (fixture.actualLiveExecutionDecisionStatus !== ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS) {
    blockers.push("invalid_actual_live_execution_decision_status");
  }
  if (fixture.actualLiveExecutionDecisionScope !== ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE) {
    blockers.push("invalid_actual_live_execution_decision_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8g`);
  }
  for (const key of CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8g`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionGate ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_execution_gate_required_after_oro8g");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8g");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8G_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundaryResult: result,
    dependsOnOro8fActualLiveExecutionRequestBoundary:
      fixture.dependsOnOro8fActualLiveExecutionRequestBoundary,
    oro8fActualLiveExecutionRequestBoundaryPassed:
      pass && fixture.oro8fActualLiveExecutionRequestBoundaryPassed,
    actualLiveExecutionRequestSubmittedFromOro8f:
      pass && fixture.actualLiveExecutionRequestSubmittedFromOro8f,
    actualLiveExecutionRequestStatusFromOro8f: pass
      ? fixture.actualLiveExecutionRequestStatusFromOro8f
      : HOLD,
    actualLiveExecutionRequestScopeFromOro8f: pass
      ? fixture.actualLiveExecutionRequestScopeFromOro8f
      : HOLD,
    actualLiveExecutionDecisionPrepared: pass && fixture.actualLiveExecutionDecisionPrepared,
    actualLiveExecutionDecisionIssued: pass && fixture.actualLiveExecutionDecisionIssued,
    actualLiveExecutionDecisionStatus: pass
      ? fixture.actualLiveExecutionDecisionStatus
      : HOLD,
    actualLiveExecutionDecisionScope: pass ? fixture.actualLiveExecutionDecisionScope : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionExecutionGate =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionGate;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8gActualLiveExecutionDecisionBoundary(
  input = buildOro8gActualLiveExecutionDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8gActualLiveExecutionDecisionBoundary(input = {}) {
  return evaluateOro8gActualLiveExecutionDecisionBoundary(input);
}

function runOro8gActualLiveExecutionDecisionBoundary(input = {}) {
  return validateOro8gActualLiveExecutionDecisionBoundary(input);
}

function buildOro8gActualLiveExecutionDecisionSummary(input = {}) {
  return evaluateOro8gActualLiveExecutionDecisionBoundary(input);
}

module.exports = {
  ORO8G_PHASE,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_SCOPE,
  ORO_8G_ACTUAL_LIVE_EXECUTION_DECISION_STATUS,
  ORO8G_ACTUAL_LIVE_EXECUTION_DECISION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8G_DECISION_AND_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8gActualLiveExecutionDecisionBoundary,
  evaluateOro8gActualLiveExecutionDecisionBoundary,
  validateOro8gActualLiveExecutionDecisionBoundary,
  runOro8gActualLiveExecutionDecisionBoundary,
  buildOro8gActualLiveExecutionDecisionSummary,
};
