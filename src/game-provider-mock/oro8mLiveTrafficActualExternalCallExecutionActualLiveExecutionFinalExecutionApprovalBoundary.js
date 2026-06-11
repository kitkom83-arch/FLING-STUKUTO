"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  PASS: ORO8L_PASS,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
} = require("./oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

const ORO8M_PHASE = "ORO-8M";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE =
  "actual_live_execution_final_execution_approval_boundary_only";
const ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS =
  "approved_for_separate_actual_live_execution_final_execution_decision_boundary_only";

const CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionApproved",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecutionApproved",
  "actualLiveExecutionExecutionRequestApproved",
  "actualLiveExecutionFinalExecutionRequestApproved",
  "actualLiveExecutionFinalExecutionApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_RECORD = Object.freeze({
  PHASE: ORO8M_PHASE,
  PASS,
  HOLD,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
});

const BASELINE_ORO8L_SUMMARY =
  validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary()
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
  return CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8lEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8L_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult ===
      ORO8L_PASS;

  return {
    dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary: true,
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l:
      summary.actualLiveExecutionFinalExecutionRequestSubmitted === true,
    actualLiveExecutionFinalExecutionRequestRecordedFromOro8l:
      summary.actualLiveExecutionFinalExecutionRequestRecorded === true,
    actualLiveExecutionFinalExecutionRequestStatusFromOro8l:
      summary.actualLiveExecutionFinalExecutionRequestStatus,
    actualLiveExecutionFinalExecutionRequestScopeFromOro8l:
      summary.actualLiveExecutionFinalExecutionRequestScope,
  };
}

function buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture",
    phase: ORO8M_PHASE,
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence:
      buildOro8lEvidenceFromSummary(BASELINE_ORO8L_SUMMARY),
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalPrepared: true,
      actualLiveExecutionFinalExecutionApprovalIssued: true,
      actualLiveExecutionFinalExecutionApprovalPassed: true,
      actualLiveExecutionFinalExecutionApprovalRecorded: true,
      actualLiveExecutionFinalExecutionApprovalStatus:
        ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
      actualLiveExecutionFinalExecutionApprovalScope:
        ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalDecisionRequired: true,
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
  const baseline =
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary();
  const merged = deepMerge(baseline, source);
  const oro8l = isPlainObject(
    merged.oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence
  )
    ? merged.oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence
    : {};
  const approval = isPlainObject(merged.actualLiveExecutionFinalExecutionApprovalEvidence)
    ? merged.actualLiveExecutionFinalExecutionApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary: readBoolean(
      oro8l,
      "dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary",
      true
    ),
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed: readBoolean(
      oro8l,
      "oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l: readBoolean(
      oro8l,
      "actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l",
      true
    ),
    actualLiveExecutionFinalExecutionRequestRecordedFromOro8l: readBoolean(
      oro8l,
      "actualLiveExecutionFinalExecutionRequestRecordedFromOro8l",
      true
    ),
    actualLiveExecutionFinalExecutionRequestStatusFromOro8l: readString(
      oro8l,
      "actualLiveExecutionFinalExecutionRequestStatusFromOro8l",
      ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionFinalExecutionRequestScopeFromOro8l: readString(
      oro8l,
      "actualLiveExecutionFinalExecutionRequestScopeFromOro8l",
      ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
    ),
    actualLiveExecutionFinalExecutionApprovalPrepared: readBoolean(
      approval,
      "actualLiveExecutionFinalExecutionApprovalPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalIssued: readBoolean(
      approval,
      "actualLiveExecutionFinalExecutionApprovalIssued",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalPassed: readBoolean(
      approval,
      "actualLiveExecutionFinalExecutionApprovalPassed",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalRecorded: readBoolean(
      approval,
      "actualLiveExecutionFinalExecutionApprovalRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalStatus: readString(
      approval,
      "actualLiveExecutionFinalExecutionApprovalStatus",
      ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
    ),
    actualLiveExecutionFinalExecutionApprovalScope: readString(
      approval,
      "actualLiveExecutionFinalExecutionApprovalScope",
      ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary: readBoolean(
      approval,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary",
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
    separateActualExecutionFinalDecisionRequired: readBoolean(
      approval,
      "separateActualExecutionFinalDecisionRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary) {
    blockers.push("missing_oro8l_actual_live_execution_final_execution_request_boundary_dependency");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l) {
    blockers.push("oro8l_actual_live_execution_final_execution_request_submission_required");
  }
  if (!fixture.oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed) {
    blockers.push("oro8l_actual_live_execution_final_execution_request_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestRecordedFromOro8l) {
    blockers.push("oro8l_actual_live_execution_final_execution_request_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestStatusFromOro8l !==
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_oro8l_actual_live_execution_final_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestScopeFromOro8l !==
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro8l_actual_live_execution_final_execution_request_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionApprovalPrepared) {
    blockers.push("actual_live_execution_final_execution_approval_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalIssued) {
    blockers.push("actual_live_execution_final_execution_approval_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalPassed) {
    blockers.push("actual_live_execution_final_execution_approval_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalRecorded) {
    blockers.push("actual_live_execution_final_execution_approval_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionApprovalStatus !==
    ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_approval_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionApprovalScope !==
    ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_approval_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8m`);
  }
  for (const key of CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8m`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalDecisionRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_decision_boundary_required_after_oro8m"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8m");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8M_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryResult:
      result,
    dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary:
      fixture.dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary,
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed:
      pass && fixture.oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed,
    actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l:
      pass && fixture.actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l,
    actualLiveExecutionFinalExecutionRequestRecordedFromOro8l:
      pass && fixture.actualLiveExecutionFinalExecutionRequestRecordedFromOro8l,
    actualLiveExecutionFinalExecutionRequestStatusFromOro8l: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestStatusFromOro8l
      : HOLD,
    actualLiveExecutionFinalExecutionRequestScopeFromOro8l: pass
      ? fixture.actualLiveExecutionFinalExecutionRequestScopeFromOro8l
      : HOLD,
    actualLiveExecutionFinalExecutionApprovalPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalPrepared,
    actualLiveExecutionFinalExecutionApprovalIssued:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalIssued,
    actualLiveExecutionFinalExecutionApprovalPassed:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalPassed,
    actualLiveExecutionFinalExecutionApprovalRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalRecorded,
    actualLiveExecutionFinalExecutionApprovalStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionApprovalStatus
      : HOLD,
    actualLiveExecutionFinalExecutionApprovalScope: pass
      ? fixture.actualLiveExecutionFinalExecutionApprovalScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionDecisionBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalDecisionRequired =
    pass && fixture.separateActualExecutionFinalDecisionRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
  input =
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
  input = {}
) {
  return evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
    input
  );
}

function runOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
  input = {}
) {
  return validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
    input
  );
}

function buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySummary(
  input = {}
) {
  return evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
    input
  );
}

module.exports = {
  ORO8M_PHASE,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  evaluateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  runOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundarySummary,
};
