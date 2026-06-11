"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
  PASS: ORO8K_PASS,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
} = require("./oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

const ORO8L_PHASE = "ORO-8L";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE =
  "actual_live_execution_final_execution_request_boundary_only";
const ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS =
  "submitted_for_separate_actual_live_execution_final_execution_approval_only";

const CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionApproved",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecutionApproved",
  "actualLiveExecutionExecutionRequestApproved",
  "actualLiveExecutionFinalExecutionRequestApproved",
  "actualLiveExecutionFinalExecutionApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO8L_PHASE,
  PASS,
  HOLD,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
});

const BASELINE_ORO8K_SUMMARY =
  validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate()
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
  return CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8kEvidenceFromSummary(summary) {
  const gatePassed =
    summary.result === ORO8K_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult ===
      ORO8K_PASS;

  return {
    dependsOnOro8kActualLiveExecutionFinalExecutionGate: true,
    oro8kActualLiveExecutionFinalExecutionGatePassed: gatePassed,
    actualLiveExecutionFinalExecutionGateIssuedFromOro8k:
      summary.actualLiveExecutionFinalExecutionGateIssued === true,
    actualLiveExecutionFinalExecutionGateRecordedFromOro8k:
      summary.actualLiveExecutionFinalExecutionGateRecorded === true,
    actualLiveExecutionFinalExecutionGateStatusFromOro8k:
      summary.actualLiveExecutionFinalExecutionGateStatus,
    actualLiveExecutionFinalExecutionGateScopeFromOro8k:
      summary.actualLiveExecutionFinalExecutionGateScope,
  };
}

function buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture",
    phase: ORO8L_PHASE,
    oro8kActualLiveExecutionFinalExecutionGateEvidence:
      buildOro8kEvidenceFromSummary(BASELINE_ORO8K_SUMMARY),
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestPrepared: true,
      actualLiveExecutionFinalExecutionRequestIssued: true,
      actualLiveExecutionFinalExecutionRequestSubmitted: true,
      actualLiveExecutionFinalExecutionRequestPassed: true,
      actualLiveExecutionFinalExecutionRequestRecorded: true,
      actualLiveExecutionFinalExecutionRequestStatus:
        ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
      actualLiveExecutionFinalExecutionRequestScope:
        ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalApprovalRequired: true,
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
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro8k = isPlainObject(merged.oro8kActualLiveExecutionFinalExecutionGateEvidence)
    ? merged.oro8kActualLiveExecutionFinalExecutionGateEvidence
    : {};
  const request = isPlainObject(merged.actualLiveExecutionFinalExecutionRequestEvidence)
    ? merged.actualLiveExecutionFinalExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8kActualLiveExecutionFinalExecutionGate: readBoolean(
      oro8k,
      "dependsOnOro8kActualLiveExecutionFinalExecutionGate",
      true
    ),
    oro8kActualLiveExecutionFinalExecutionGatePassed: readBoolean(
      oro8k,
      "oro8kActualLiveExecutionFinalExecutionGatePassed",
      true
    ),
    actualLiveExecutionFinalExecutionGateIssuedFromOro8k: readBoolean(
      oro8k,
      "actualLiveExecutionFinalExecutionGateIssuedFromOro8k",
      true
    ),
    actualLiveExecutionFinalExecutionGateRecordedFromOro8k: readBoolean(
      oro8k,
      "actualLiveExecutionFinalExecutionGateRecordedFromOro8k",
      true
    ),
    actualLiveExecutionFinalExecutionGateStatusFromOro8k: readString(
      oro8k,
      "actualLiveExecutionFinalExecutionGateStatusFromOro8k",
      ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
    ),
    actualLiveExecutionFinalExecutionGateScopeFromOro8k: readString(
      oro8k,
      "actualLiveExecutionFinalExecutionGateScopeFromOro8k",
      ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
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
    actualLiveExecutionFinalExecutionRequestSubmitted: readBoolean(
      request,
      "actualLiveExecutionFinalExecutionRequestSubmitted",
      true
    ),
    actualLiveExecutionFinalExecutionRequestPassed: readBoolean(
      request,
      "actualLiveExecutionFinalExecutionRequestPassed",
      true
    ),
    actualLiveExecutionFinalExecutionRequestRecorded: readBoolean(
      request,
      "actualLiveExecutionFinalExecutionRequestRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionRequestStatus: readString(
      request,
      "actualLiveExecutionFinalExecutionRequestStatus",
      ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionFinalExecutionRequestScope: readString(
      request,
      "actualLiveExecutionFinalExecutionRequestScope",
      ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval",
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
    separateActualExecutionFinalApprovalRequired: readBoolean(
      request,
      "separateActualExecutionFinalApprovalRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(request, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8kActualLiveExecutionFinalExecutionGate) {
    blockers.push("missing_oro8k_actual_live_execution_final_execution_gate_dependency");
  }
  if (!fixture.oro8kActualLiveExecutionFinalExecutionGatePassed) {
    blockers.push("oro8k_actual_live_execution_final_execution_gate_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateIssuedFromOro8k) {
    blockers.push("oro8k_actual_live_execution_final_execution_gate_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateRecordedFromOro8k) {
    blockers.push("oro8k_actual_live_execution_final_execution_gate_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateStatusFromOro8k !==
    ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
  ) {
    blockers.push("invalid_oro8k_actual_live_execution_final_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateScopeFromOro8k !==
    ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_oro8k_actual_live_execution_final_execution_gate_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionRequestPrepared) {
    blockers.push("actual_live_execution_final_execution_request_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestIssued) {
    blockers.push("actual_live_execution_final_execution_request_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestSubmitted) {
    blockers.push("actual_live_execution_final_execution_request_submission_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestPassed) {
    blockers.push("actual_live_execution_final_execution_request_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionRequestRecorded) {
    blockers.push("actual_live_execution_final_execution_request_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestStatus !==
    ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionRequestScope !==
    ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_request_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8l`);
  }
  for (const key of CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8l`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalApprovalRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_approval_required_after_oro8l"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8l");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8L_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryResult:
      result,
    dependsOnOro8kActualLiveExecutionFinalExecutionGate:
      fixture.dependsOnOro8kActualLiveExecutionFinalExecutionGate,
    oro8kActualLiveExecutionFinalExecutionGatePassed:
      pass && fixture.oro8kActualLiveExecutionFinalExecutionGatePassed,
    actualLiveExecutionFinalExecutionGateIssuedFromOro8k:
      pass && fixture.actualLiveExecutionFinalExecutionGateIssuedFromOro8k,
    actualLiveExecutionFinalExecutionGateRecordedFromOro8k:
      pass && fixture.actualLiveExecutionFinalExecutionGateRecordedFromOro8k,
    actualLiveExecutionFinalExecutionGateStatusFromOro8k: pass
      ? fixture.actualLiveExecutionFinalExecutionGateStatusFromOro8k
      : HOLD,
    actualLiveExecutionFinalExecutionGateScopeFromOro8k: pass
      ? fixture.actualLiveExecutionFinalExecutionGateScopeFromOro8k
      : HOLD,
    actualLiveExecutionFinalExecutionRequestPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionRequestPrepared,
    actualLiveExecutionFinalExecutionRequestIssued:
      pass && fixture.actualLiveExecutionFinalExecutionRequestIssued,
    actualLiveExecutionFinalExecutionRequestSubmitted:
      pass && fixture.actualLiveExecutionFinalExecutionRequestSubmitted,
    actualLiveExecutionFinalExecutionRequestPassed:
      pass && fixture.actualLiveExecutionFinalExecutionRequestPassed,
    actualLiveExecutionFinalExecutionRequestRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionRequestRecorded,
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
  for (const key of CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionApproval;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalApprovalRequired =
    pass && fixture.separateActualExecutionFinalApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
  input =
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
  input = {}
) {
  return evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
    input
  );
}

function runOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
  input = {}
) {
  return validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
    input
  );
}

function buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySummary(
  input = {}
) {
  return evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
    input
  );
}

module.exports = {
  ORO8L_PHASE,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_SCOPE,
  ORO_8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_STATUS,
  ORO8L_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_REQUEST_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8L_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  evaluateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  validateOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  runOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundarySummary,
};
