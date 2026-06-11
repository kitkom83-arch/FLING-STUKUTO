"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
  PASS: ORO8H_PASS,
  buildOro8hActualLiveExecutionExecutionGate,
  validateOro8hActualLiveExecutionExecutionGate,
} = require("./oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGate");

const ORO8I_PHASE = "ORO-8I";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE =
  "actual_live_execution_execution_request_boundary_only";
const ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS =
  "submitted_for_separate_actual_live_execution_execution_approval_only";

const CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS = Object.freeze([
  "actualLiveExecutionApproved",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecutionApproved",
  "actualLiveExecutionExecutionRequestApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO8I_PHASE,
  PASS,
  HOLD,
  ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE,
  ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
});

const BASELINE_ORO8H_SUMMARY = validateOro8hActualLiveExecutionExecutionGate(
  buildOro8hActualLiveExecutionExecutionGate()
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

function closedApprovalAndExecutionFlags() {
  return CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8hEvidenceFromSummary(summary) {
  const gatePassed =
    summary.result === ORO8H_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGateResult ===
      ORO8H_PASS;

  return {
    dependsOnOro8hActualLiveExecutionExecutionGate: true,
    oro8hActualLiveExecutionExecutionGatePassed: gatePassed,
    actualLiveExecutionExecutionGateIssuedFromOro8h:
      summary.actualLiveExecutionExecutionGateIssued === true,
    actualLiveExecutionExecutionGateStatusFromOro8h:
      summary.actualLiveExecutionExecutionGateStatus,
    actualLiveExecutionExecutionGateScopeFromOro8h:
      summary.actualLiveExecutionExecutionGateScope,
  };
}

function buildOro8iActualLiveExecutionExecutionRequestBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionExecutionRequestBoundaryFixture",
    phase: ORO8I_PHASE,
    oro8hActualLiveExecutionExecutionGateEvidence:
      buildOro8hEvidenceFromSummary(BASELINE_ORO8H_SUMMARY),
    actualLiveExecutionExecutionRequestEvidence: {
      actualLiveExecutionExecutionRequestPrepared: true,
      actualLiveExecutionExecutionRequestIssued: true,
      actualLiveExecutionExecutionRequestSubmitted: true,
      actualLiveExecutionExecutionRequestPassed: true,
      actualLiveExecutionExecutionRequestStatus:
        ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
      actualLiveExecutionExecutionRequestScope:
        ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
      ...closedRuntimeFlags(),
      ...closedApprovalAndExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedApprovalAndExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8iActualLiveExecutionExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro8h = isPlainObject(merged.oro8hActualLiveExecutionExecutionGateEvidence)
    ? merged.oro8hActualLiveExecutionExecutionGateEvidence
    : {};
  const request = isPlainObject(merged.actualLiveExecutionExecutionRequestEvidence)
    ? merged.actualLiveExecutionExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8hActualLiveExecutionExecutionGate: readBoolean(
      oro8h,
      "dependsOnOro8hActualLiveExecutionExecutionGate",
      true
    ),
    oro8hActualLiveExecutionExecutionGatePassed: readBoolean(
      oro8h,
      "oro8hActualLiveExecutionExecutionGatePassed",
      true
    ),
    actualLiveExecutionExecutionGateIssuedFromOro8h: readBoolean(
      oro8h,
      "actualLiveExecutionExecutionGateIssuedFromOro8h",
      true
    ),
    actualLiveExecutionExecutionGateStatusFromOro8h: readString(
      oro8h,
      "actualLiveExecutionExecutionGateStatusFromOro8h",
      ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
    ),
    actualLiveExecutionExecutionGateScopeFromOro8h: readString(
      oro8h,
      "actualLiveExecutionExecutionGateScopeFromOro8h",
      ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
    ),
    actualLiveExecutionExecutionRequestPrepared: readBoolean(
      request,
      "actualLiveExecutionExecutionRequestPrepared",
      true
    ),
    actualLiveExecutionExecutionRequestIssued: readBoolean(
      request,
      "actualLiveExecutionExecutionRequestIssued",
      true
    ),
    actualLiveExecutionExecutionRequestSubmitted: readBoolean(
      request,
      "actualLiveExecutionExecutionRequestSubmitted",
      true
    ),
    actualLiveExecutionExecutionRequestPassed: readBoolean(
      request,
      "actualLiveExecutionExecutionRequestPassed",
      true
    ),
    actualLiveExecutionExecutionRequestStatus: readString(
      request,
      "actualLiveExecutionExecutionRequestStatus",
      ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionExecutionRequestScope: readString(
      request,
      "actualLiveExecutionExecutionRequestScope",
      ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval",
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
  for (const key of CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS) {
    normalized[key] = readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8hActualLiveExecutionExecutionGate ||
    !fixture.oro8hActualLiveExecutionExecutionGatePassed
  ) {
    blockers.push("missing_passed_oro8h_actual_live_execution_execution_gate");
  }
  if (!fixture.actualLiveExecutionExecutionGateIssuedFromOro8h) {
    blockers.push("oro8h_actual_live_execution_execution_gate_issuance_required");
  }
  if (
    fixture.actualLiveExecutionExecutionGateStatusFromOro8h !==
    ORO_8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_STATUS
  ) {
    blockers.push("invalid_oro8h_actual_live_execution_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionExecutionGateScopeFromOro8h !==
    ORO8H_ACTUAL_LIVE_EXECUTION_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_oro8h_actual_live_execution_execution_gate_scope");
  }

  if (!fixture.actualLiveExecutionExecutionRequestPrepared) {
    blockers.push("actual_live_execution_execution_request_preparation_required");
  }
  if (!fixture.actualLiveExecutionExecutionRequestIssued) {
    blockers.push("actual_live_execution_execution_request_issuance_required");
  }
  if (!fixture.actualLiveExecutionExecutionRequestSubmitted) {
    blockers.push("actual_live_execution_execution_request_submission_required");
  }
  if (!fixture.actualLiveExecutionExecutionRequestPassed) {
    blockers.push("actual_live_execution_execution_request_pass_required");
  }
  if (
    fixture.actualLiveExecutionExecutionRequestStatus !==
    ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_execution_request_status");
  }
  if (
    fixture.actualLiveExecutionExecutionRequestScope !==
    ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_execution_request_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8i`);
  }
  for (const key of CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8i`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_execution_approval_required_after_oro8i");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8i");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8I_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundaryResult:
      result,
    dependsOnOro8hActualLiveExecutionExecutionGate:
      fixture.dependsOnOro8hActualLiveExecutionExecutionGate,
    oro8hActualLiveExecutionExecutionGatePassed:
      pass && fixture.oro8hActualLiveExecutionExecutionGatePassed,
    actualLiveExecutionExecutionGateIssuedFromOro8h:
      pass && fixture.actualLiveExecutionExecutionGateIssuedFromOro8h,
    actualLiveExecutionExecutionGateStatusFromOro8h: pass
      ? fixture.actualLiveExecutionExecutionGateStatusFromOro8h
      : HOLD,
    actualLiveExecutionExecutionGateScopeFromOro8h: pass
      ? fixture.actualLiveExecutionExecutionGateScopeFromOro8h
      : HOLD,
    actualLiveExecutionExecutionRequestPrepared:
      pass && fixture.actualLiveExecutionExecutionRequestPrepared,
    actualLiveExecutionExecutionRequestIssued:
      pass && fixture.actualLiveExecutionExecutionRequestIssued,
    actualLiveExecutionExecutionRequestSubmitted:
      pass && fixture.actualLiveExecutionExecutionRequestSubmitted,
    actualLiveExecutionExecutionRequestPassed:
      pass && fixture.actualLiveExecutionExecutionRequestPassed,
    actualLiveExecutionExecutionRequestStatus: pass
      ? fixture.actualLiveExecutionExecutionRequestStatus
      : HOLD,
    actualLiveExecutionExecutionRequestScope: pass
      ? fixture.actualLiveExecutionExecutionRequestScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionExecutionApproval;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8iActualLiveExecutionExecutionRequestBoundary(
  input = buildOro8iActualLiveExecutionExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8iActualLiveExecutionExecutionRequestBoundary(input = {}) {
  return evaluateOro8iActualLiveExecutionExecutionRequestBoundary(input);
}

function runOro8iActualLiveExecutionExecutionRequestBoundary(input = {}) {
  return validateOro8iActualLiveExecutionExecutionRequestBoundary(input);
}

function buildOro8iActualLiveExecutionExecutionRequestBoundarySummary(input = {}) {
  return evaluateOro8iActualLiveExecutionExecutionRequestBoundary(input);
}

module.exports = {
  ORO8I_PHASE,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_SCOPE,
  ORO_8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_STATUS,
  ORO8I_ACTUAL_LIVE_EXECUTION_EXECUTION_REQUEST_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8I_APPROVAL_AND_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8iActualLiveExecutionExecutionRequestBoundary,
  evaluateOro8iActualLiveExecutionExecutionRequestBoundary,
  validateOro8iActualLiveExecutionExecutionRequestBoundary,
  runOro8iActualLiveExecutionExecutionRequestBoundary,
  buildOro8iActualLiveExecutionExecutionRequestBoundarySummary,
};
