"use strict";

const {
  CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
  PASS: ORO8J_PASS,
  buildOro8jActualLiveExecutionExecutionApprovalBoundary,
  validateOro8jActualLiveExecutionExecutionApprovalBoundary,
} = require("./oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundary");

const ORO8K_PHASE = "ORO-8K";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE =
  "actual_live_execution_final_execution_gate_only";
const ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS =
  "passed_for_separate_actual_live_execution_final_execution_request_only";

const CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8J_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionRequestSubmitted",
  "actualLiveExecutionFinalExecutionRequestApproved",
]);

const ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_RECORD = Object.freeze({
  PHASE: ORO8K_PHASE,
  PASS,
  HOLD,
  ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE,
  ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
});

const BASELINE_ORO8J_SUMMARY =
  validateOro8jActualLiveExecutionExecutionApprovalBoundary(
    buildOro8jActualLiveExecutionExecutionApprovalBoundary()
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
  return CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8jEvidenceFromSummary(summary) {
  const approvalPassed =
    summary.result === ORO8J_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundaryResult ===
      ORO8J_PASS;

  return {
    dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary: true,
    oro8jActualLiveExecutionExecutionApprovalBoundaryPassed: approvalPassed,
    actualLiveExecutionExecutionApprovalIssuedFromOro8j:
      summary.actualLiveExecutionExecutionApprovalIssued === true,
    actualLiveExecutionExecutionApprovalRecordedFromOro8j:
      summary.actualLiveExecutionExecutionApprovalRecorded === true,
    actualLiveExecutionExecutionApprovalStatusFromOro8j:
      summary.actualLiveExecutionExecutionApprovalStatus,
    actualLiveExecutionExecutionApprovalScopeFromOro8j:
      summary.actualLiveExecutionExecutionApprovalScope,
  };
}

function buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionGateFixture",
    phase: ORO8K_PHASE,
    oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence:
      buildOro8jEvidenceFromSummary(BASELINE_ORO8J_SUMMARY),
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGatePrepared: true,
      actualLiveExecutionFinalExecutionGateIssued: true,
      actualLiveExecutionFinalExecutionGatePassed: true,
      actualLiveExecutionFinalExecutionGateRecorded: true,
      actualLiveExecutionFinalExecutionGateStatus:
        ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
      actualLiveExecutionFinalExecutionGateScope:
        ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalRequestRequired: true,
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
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate();
  const merged = deepMerge(baseline, source);
  const oro8j = isPlainObject(
    merged.oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence
  )
    ? merged.oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence
    : {};
  const finalGate = isPlainObject(merged.actualLiveExecutionFinalExecutionGateEvidence)
    ? merged.actualLiveExecutionFinalExecutionGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary: readBoolean(
      oro8j,
      "dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary",
      true
    ),
    oro8jActualLiveExecutionExecutionApprovalBoundaryPassed: readBoolean(
      oro8j,
      "oro8jActualLiveExecutionExecutionApprovalBoundaryPassed",
      true
    ),
    actualLiveExecutionExecutionApprovalIssuedFromOro8j: readBoolean(
      oro8j,
      "actualLiveExecutionExecutionApprovalIssuedFromOro8j",
      true
    ),
    actualLiveExecutionExecutionApprovalRecordedFromOro8j: readBoolean(
      oro8j,
      "actualLiveExecutionExecutionApprovalRecordedFromOro8j",
      true
    ),
    actualLiveExecutionExecutionApprovalStatusFromOro8j: readString(
      oro8j,
      "actualLiveExecutionExecutionApprovalStatusFromOro8j",
      ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
    ),
    actualLiveExecutionExecutionApprovalScopeFromOro8j: readString(
      oro8j,
      "actualLiveExecutionExecutionApprovalScopeFromOro8j",
      ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
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
    actualLiveExecutionFinalExecutionGatePassed: readBoolean(
      finalGate,
      "actualLiveExecutionFinalExecutionGatePassed",
      true
    ),
    actualLiveExecutionFinalExecutionGateRecorded: readBoolean(
      finalGate,
      "actualLiveExecutionFinalExecutionGateRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionGateStatus: readString(
      finalGate,
      "actualLiveExecutionFinalExecutionGateStatus",
      ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
    ),
    actualLiveExecutionFinalExecutionGateScope: readString(
      finalGate,
      "actualLiveExecutionFinalExecutionGateScope",
      ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest: readBoolean(
      finalGate,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest",
      true
    ),
    humanApprovalRequiredForActualExecution: readBoolean(
      finalGate,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      finalGate,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalRequestRequired: readBoolean(
      finalGate,
      "separateActualExecutionFinalRequestRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(finalGate, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(finalGate, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary) {
    blockers.push("missing_oro8j_actual_live_execution_execution_approval_boundary_dependency");
  }
  if (!fixture.oro8jActualLiveExecutionExecutionApprovalBoundaryPassed) {
    blockers.push("oro8j_actual_live_execution_execution_approval_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionExecutionApprovalIssuedFromOro8j) {
    blockers.push("oro8j_actual_live_execution_execution_approval_issuance_required");
  }
  if (!fixture.actualLiveExecutionExecutionApprovalRecordedFromOro8j) {
    blockers.push("oro8j_actual_live_execution_execution_approval_record_required");
  }
  if (
    fixture.actualLiveExecutionExecutionApprovalStatusFromOro8j !==
    ORO_8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_STATUS
  ) {
    blockers.push("invalid_oro8j_actual_live_execution_execution_approval_status");
  }
  if (
    fixture.actualLiveExecutionExecutionApprovalScopeFromOro8j !==
    ORO8J_ACTUAL_LIVE_EXECUTION_EXECUTION_APPROVAL_SCOPE
  ) {
    blockers.push("invalid_oro8j_actual_live_execution_execution_approval_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionGatePrepared) {
    blockers.push("actual_live_execution_final_execution_gate_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateIssued) {
    blockers.push("actual_live_execution_final_execution_gate_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGatePassed) {
    blockers.push("actual_live_execution_final_execution_gate_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionGateRecorded) {
    blockers.push("actual_live_execution_final_execution_gate_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateStatus !==
    ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_gate_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionGateScope !==
    ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_gate_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8k`);
  }
  for (const key of CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8k`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalRequestRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_request_required_after_oro8k"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8k");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8K_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateResult:
      result,
    dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary:
      fixture.dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary,
    oro8jActualLiveExecutionExecutionApprovalBoundaryPassed:
      pass && fixture.oro8jActualLiveExecutionExecutionApprovalBoundaryPassed,
    actualLiveExecutionExecutionApprovalIssuedFromOro8j:
      pass && fixture.actualLiveExecutionExecutionApprovalIssuedFromOro8j,
    actualLiveExecutionExecutionApprovalRecordedFromOro8j:
      pass && fixture.actualLiveExecutionExecutionApprovalRecordedFromOro8j,
    actualLiveExecutionExecutionApprovalStatusFromOro8j: pass
      ? fixture.actualLiveExecutionExecutionApprovalStatusFromOro8j
      : HOLD,
    actualLiveExecutionExecutionApprovalScopeFromOro8j: pass
      ? fixture.actualLiveExecutionExecutionApprovalScopeFromOro8j
      : HOLD,
    actualLiveExecutionFinalExecutionGatePrepared:
      pass && fixture.actualLiveExecutionFinalExecutionGatePrepared,
    actualLiveExecutionFinalExecutionGateIssued:
      pass && fixture.actualLiveExecutionFinalExecutionGateIssued,
    actualLiveExecutionFinalExecutionGatePassed:
      pass && fixture.actualLiveExecutionFinalExecutionGatePassed,
    actualLiveExecutionFinalExecutionGateRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionGateRecorded,
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
  for (const key of CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionRequest;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalRequestRequired =
    pass && fixture.separateActualExecutionFinalRequestRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
  input =
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
  input = {}
) {
  return evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
    input
  );
}

function runOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
  input = {}
) {
  return validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
    input
  );
}

function buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSummary(
  input = {}
) {
  return evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate(
    input
  );
}

module.exports = {
  ORO8K_PHASE,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_SCOPE,
  ORO_8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_STATUS,
  ORO8K_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_GATE_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8K_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  evaluateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  validateOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  runOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateSummary,
};
