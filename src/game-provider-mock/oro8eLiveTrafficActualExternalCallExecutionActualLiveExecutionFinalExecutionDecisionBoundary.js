"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  PASS: ORO8D_PASS,
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8dActualLiveExecutionFinalExecutionRequestBoundary,
} = require("./oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

const ORO8E_PHASE = "ORO-8E";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE =
  "actual_live_execution_final_execution_decision_boundary_only";
const ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS =
  "approved_for_separate_actual_live_execution_request_only";

const CLOSED_ORO8E_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionRequestSubmitted",
  "actualLiveExecutionRequestApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_RECORD = Object.freeze({
  PHASE: ORO8E_PHASE,
  PASS,
  HOLD,
  ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
});

const BASELINE_ORO8D_SUMMARY =
  validateOro8dActualLiveExecutionFinalExecutionRequestBoundary(
    buildOro8dActualLiveExecutionFinalExecutionRequestBoundary()
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

function closedExecutionFlags() {
  return CLOSED_ORO8E_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8dEvidenceFromSummary(summary) {
  const requestPassed =
    summary.result === ORO8D_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult ===
      ORO8D_PASS;

  return {
    dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary: true,
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed: requestPassed,
    actualLiveExecutionFinalExecutionRequestIssuedFromOro8d:
      summary.actualLiveExecutionFinalExecutionRequestIssued === true,
    actualLiveExecutionFinalExecutionRequestStatusFromOro8d:
      summary.actualLiveExecutionFinalExecutionRequestStatus,
    actualLiveExecutionFinalExecutionRequestScopeFromOro8d:
      summary.actualLiveExecutionFinalExecutionRequestScope,
  };
}

function buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture",
    phase: ORO8E_PHASE,
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence:
      buildOro8dEvidenceFromSummary(BASELINE_ORO8D_SUMMARY),
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualLiveExecutionFinalExecutionDecisionPrepared: true,
      actualLiveExecutionFinalExecutionDecisionIssued: true,
      actualLiveExecutionFinalExecutionDecisionStatus:
        ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
      actualLiveExecutionFinalExecutionDecisionScope:
        ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
      ...closedFlags(),
      ...closedExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionRequest: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedFlags(),
      ...closedExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro8d = isPlainObject(merged.oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence)
    ? merged.oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence
    : {};
  const decision = isPlainObject(merged.actualLiveExecutionFinalExecutionDecisionEvidence)
    ? merged.actualLiveExecutionFinalExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary: readBoolean(
      oro8d,
      "dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary",
      true
    ),
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed: readBoolean(
      oro8d,
      "oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionRequestIssuedFromOro8d: readBoolean(
      oro8d,
      "actualLiveExecutionFinalExecutionRequestIssuedFromOro8d",
      true
    ),
    actualLiveExecutionFinalExecutionRequestStatusFromOro8d: readString(
      oro8d,
      "actualLiveExecutionFinalExecutionRequestStatusFromOro8d",
      ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionFinalExecutionRequestScopeFromOro8d: readString(
      oro8d,
      "actualLiveExecutionFinalExecutionRequestScopeFromOro8d",
      ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
    ),
    actualLiveExecutionFinalExecutionDecisionPrepared: readBoolean(
      decision,
      "actualLiveExecutionFinalExecutionDecisionPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionIssued: readBoolean(
      decision,
      "actualLiveExecutionFinalExecutionDecisionIssued",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionStatus: readString(
      decision,
      "actualLiveExecutionFinalExecutionDecisionStatus",
      ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionFinalExecutionDecisionScope: readString(
      decision,
      "actualLiveExecutionFinalExecutionDecisionScope",
      ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionRequest: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualLiveExecutionRequest",
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
  for (const key of CLOSED_ORO8E_EXECUTION_FLAGS) {
    normalized[key] = readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary ||
    !fixture.oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed
  ) {
    blockers.push("missing_passed_oro8d_actual_live_execution_final_execution_request_boundary");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestIssuedFromOro8d) {
    blockers.push("oro8d_actual_live_execution_final_execution_request_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestStatusFromOro8d !==
    ORO_8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_oro8d_actual_live_execution_final_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestScopeFromOro8d !==
    ORO8D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro8d_actual_live_execution_final_execution_request_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionDecisionPrepared) {
    blockers.push("actual_live_execution_final_execution_decision_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionIssued) {
    blockers.push("actual_live_execution_final_execution_decision_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionStatus !==
    ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_decision_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionScope !==
    ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_decision_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8e`);
  }
  for (const key of CLOSED_ORO8E_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8e`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_request_required_after_oro8e");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8e");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8E_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult:
      result,
    dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary:
      fixture.dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary,
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed:
      pass && fixture.oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed,
    actualLiveExecutionFinalExecutionRequestIssuedFromOro8d:
      pass && fixture.actualLiveExecutionFinalExecutionRequestIssuedFromOro8d,
    actualLiveExecutionFinalExecutionRequestStatusFromOro8d: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestStatusFromOro8d
      : HOLD,
    actualLiveExecutionFinalExecutionRequestScopeFromOro8d: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestScopeFromOro8d
      : HOLD,
    actualLiveExecutionFinalExecutionDecisionPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionPrepared,
    actualLiveExecutionFinalExecutionDecisionIssued:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionIssued,
    actualLiveExecutionFinalExecutionDecisionStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionStatus
      : HOLD,
    actualLiveExecutionFinalExecutionDecisionScope: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8E_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionRequest;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(
  input = buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input = {}) {
  return evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input);
}

function runOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input = {}) {
  return validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input);
}

function buildOro8eActualLiveExecutionFinalExecutionDecisionSummary(input = {}) {
  return evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(input);
}

module.exports = {
  ORO8E_PHASE,
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8E_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  evaluateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  runOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  buildOro8eActualLiveExecutionFinalExecutionDecisionSummary,
};
