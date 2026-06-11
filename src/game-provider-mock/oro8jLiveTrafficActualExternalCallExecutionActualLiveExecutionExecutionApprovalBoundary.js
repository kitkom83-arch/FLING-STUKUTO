"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
  PASS: ORO8I_PASS,
  buildOro8iActualLiveExecutionExecutionRequestBoundary,
  validateOro8iActualLiveExecutionExecutionRequestBoundary,
} = require("./oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundary");

const ORO8J_PHASE = "ORO-8J";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE =
  "actual_live_execution_execution_approval_boundary_only";
const ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS =
  "approved_for_separate_actual_live_execution_final_execution_gate_only";

const CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionApproved",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecutionApproved",
  "actualLiveExecutionExecutionRequestApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_RECORD = Object.freeze({
  PHASE: ORO8J_PHASE,
  PASS,
  HOLD,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
});

const BASELINE_ORO8I_SUMMARY =
  validateOro8iActualLiveExecutionExecutionRequestBoundary(
    buildOro8iActualLiveExecutionExecutionRequestBoundary()
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

function closedActualExecutionFlags() {
  return CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8iEvidenceFromSummary(summary) {
  const requestPassed =
    summary.result === ORO8I_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryResult ===
      ORO8I_PASS;

  return {
    dependsOnOro8iActualLiveExecutionExecutionRequestBoundary: true,
    oro8iActualLiveExecutionExecutionRequestBoundaryPassed: requestPassed,
    actualLiveExecutionExecutionRequestSubmittedFromOro8i:
      summary.actualLiveExecutionExecutionRequestSubmitted === true,
    actualLiveExecutionExecutionRequestStatusFromOro8i:
      summary.actualLiveExecutionExecutionRequestStatus,
    actualLiveExecutionExecutionRequestScopeFromOro8i:
      summary.actualLiveExecutionExecutionRequestScope,
  };
}

function buildOro8jActualLiveExecutionExecutionApprovalBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionExecutionApprovalBoundaryFixture",
    phase: ORO8J_PHASE,
    oro8iActualLiveExecutionExecutionRequestBoundaryEvidence:
      buildOro8iEvidenceFromSummary(BASELINE_ORO8I_SUMMARY),
    actualLiveExecutionExecutionApprovalEvidence: {
      actualLiveExecutionExecutionApprovalPrepared: true,
      actualLiveExecutionExecutionApprovalIssued: true,
      actualLiveExecutionExecutionApprovalPassed: true,
      actualLiveExecutionExecutionApprovalRecorded: true,
      actualLiveExecutionExecutionApprovalStatus:
        ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
      actualLiveExecutionExecutionApprovalScope:
        ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate: true,
      nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalGateRequired: true,
    },
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8jActualLiveExecutionExecutionApprovalBoundary();
  const merged = deepMerge(baseline, source);
  const oro8i = isPlainObject(merged.oro8iActualLiveExecutionExecutionRequestBoundaryEvidence)
    ? merged.oro8iActualLiveExecutionExecutionRequestBoundaryEvidence
    : {};
  const approval = isPlainObject(merged.actualLiveExecutionExecutionApprovalEvidence)
    ? merged.actualLiveExecutionExecutionApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8iActualLiveExecutionExecutionRequestBoundary: readBoolean(
      oro8i,
      "dependsOnOro8iActualLiveExecutionExecutionRequestBoundary",
      true
    ),
    oro8iActualLiveExecutionExecutionRequestBoundaryPassed: readBoolean(
      oro8i,
      "oro8iActualLiveExecutionExecutionRequestBoundaryPassed",
      true
    ),
    actualLiveExecutionExecutionRequestSubmittedFromOro8i: readBoolean(
      oro8i,
      "actualLiveExecutionExecutionRequestSubmittedFromOro8i",
      true
    ),
    actualLiveExecutionExecutionRequestStatusFromOro8i: readString(
      oro8i,
      "actualLiveExecutionExecutionRequestStatusFromOro8i",
      ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionExecutionRequestScopeFromOro8i: readString(
      oro8i,
      "actualLiveExecutionExecutionRequestScopeFromOro8i",
      ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
    ),
    actualLiveExecutionExecutionApprovalPrepared: readBoolean(
      approval,
      "actualLiveExecutionExecutionApprovalPrepared",
      true
    ),
    actualLiveExecutionExecutionApprovalIssued: readBoolean(
      approval,
      "actualLiveExecutionExecutionApprovalIssued",
      true
    ),
    actualLiveExecutionExecutionApprovalPassed: readBoolean(
      approval,
      "actualLiveExecutionExecutionApprovalPassed",
      true
    ),
    actualLiveExecutionExecutionApprovalRecorded: readBoolean(
      approval,
      "actualLiveExecutionExecutionApprovalRecorded",
      true
    ),
    actualLiveExecutionExecutionApprovalStatus: readString(
      approval,
      "actualLiveExecutionExecutionApprovalStatus",
      ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
    ),
    actualLiveExecutionExecutionApprovalScope: readString(
      approval,
      "actualLiveExecutionExecutionApprovalScope",
      ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate: readBoolean(
      approval,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate",
      true
    ),
    nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest: readBoolean(
      approval,
      "nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest",
      true
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      approval,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      approval,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalGateRequired: readBoolean(
      approval,
      "separateActualExecutionFinalGateRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8iActualLiveExecutionExecutionRequestBoundary) {
    blockers.push("missing_oro8i_actual_live_execution_execution_request_boundary_dependency");
  }
  if (!fixture.oro8iActualLiveExecutionExecutionRequestBoundaryPassed) {
    blockers.push("oro8i_actual_live_execution_execution_request_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionExecutionRequestSubmittedFromOro8i) {
    blockers.push("oro8i_actual_live_execution_execution_request_submission_required");
  }
  if (
    fixture.actualLiveExecutionExecutionRequestStatusFromOro8i !==
    ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_oro8i_actual_live_execution_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionExecutionRequestScopeFromOro8i !==
    ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro8i_actual_live_execution_execution_request_scope");
  }

  if (!fixture.actualLiveExecutionExecutionApprovalPrepared) {
    blockers.push("actual_live_execution_execution_approval_preparation_required");
  }
  if (!fixture.actualLiveExecutionExecutionApprovalIssued) {
    blockers.push("actual_live_execution_execution_approval_issuance_required");
  }
  if (!fixture.actualLiveExecutionExecutionApprovalPassed) {
    blockers.push("actual_live_execution_execution_approval_pass_required");
  }
  if (!fixture.actualLiveExecutionExecutionApprovalRecorded) {
    blockers.push("actual_live_execution_execution_approval_record_required");
  }
  if (
    fixture.actualLiveExecutionExecutionApprovalStatus !==
    ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_execution_approval_status");
  }
  if (
    fixture.actualLiveExecutionExecutionApprovalScope !==
    ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_execution_approval_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8j`);
  }
  for (const key of CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8j`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate ||
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalGateRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_gate_and_request_required_after_oro8j"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8j");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8J_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryResult:
      result,
    dependsOnOro8iActualLiveExecutionExecutionRequestBoundary:
      fixture.dependsOnOro8iActualLiveExecutionExecutionRequestBoundary,
    oro8iActualLiveExecutionExecutionRequestBoundaryPassed:
      pass && fixture.oro8iActualLiveExecutionExecutionRequestBoundaryPassed,
    actualLiveExecutionExecutionRequestSubmittedFromOro8i:
      pass && fixture.actualLiveExecutionExecutionRequestSubmittedFromOro8i,
    actualLiveExecutionExecutionRequestStatusFromOro8i: pass
      ? fixture.actualLiveExecutionExecutionRequestStatusFromOro8i
      : HOLD,
    actualLiveExecutionExecutionRequestScopeFromOro8i: pass
      ? fixture.actualLiveExecutionExecutionRequestScopeFromOro8i
      : HOLD,
    actualLiveExecutionExecutionApprovalPrepared:
      pass && fixture.actualLiveExecutionExecutionApprovalPrepared,
    actualLiveExecutionExecutionApprovalIssued:
      pass && fixture.actualLiveExecutionExecutionApprovalIssued,
    actualLiveExecutionExecutionApprovalPassed:
      pass && fixture.actualLiveExecutionExecutionApprovalPassed,
    actualLiveExecutionExecutionApprovalRecorded:
      pass && fixture.actualLiveExecutionExecutionApprovalRecorded,
    actualLiveExecutionExecutionApprovalStatus: pass
      ? fixture.actualLiveExecutionExecutionApprovalStatus
      : HOLD,
    actualLiveExecutionExecutionApprovalScope: pass
      ? fixture.actualLiveExecutionExecutionApprovalScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate;
  output.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionRequest;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalGateRequired =
    pass && fixture.separateActualExecutionFinalGateRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8jActualLiveExecutionExecutionApprovalBoundary(
  input = buildOro8jActualLiveExecutionExecutionApprovalBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8jActualLiveExecutionExecutionApprovalBoundary(input = {}) {
  return evaluateOro8jActualLiveExecutionExecutionApprovalBoundary(input);
}

function runOro8jActualLiveExecutionExecutionApprovalBoundary(input = {}) {
  return validateOro8jActualLiveExecutionExecutionApprovalBoundary(input);
}

function buildOro8jActualLiveExecutionExecutionApprovalBoundarySummary(input = {}) {
  return evaluateOro8jActualLiveExecutionExecutionApprovalBoundary(input);
}

module.exports = {
  ORO8J_PHASE,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8jActualLiveExecutionExecutionApprovalBoundary,
  evaluateOro8jActualLiveExecutionExecutionApprovalBoundary,
  validateOro8jActualLiveExecutionExecutionApprovalBoundary,
  runOro8jActualLiveExecutionExecutionApprovalBoundary,
  buildOro8jActualLiveExecutionExecutionApprovalBoundarySummary,
};
