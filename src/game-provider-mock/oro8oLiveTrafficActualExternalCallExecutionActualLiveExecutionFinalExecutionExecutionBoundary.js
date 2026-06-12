"use strict";

const {
  CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  PASS: ORO8N_PASS,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
} = require("./oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

const ORO8O_PHASE = "ORO-8O";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE =
  "actual_live_execution_final_execution_execution_boundary_only";
const ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS =
  "executed_as_mock_boundary_for_separate_actual_live_execution_final_execution_post_execution_verification_only";

const CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
]);

const ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_RECORD = Object.freeze({
  PHASE: ORO8O_PHASE,
  PASS,
  HOLD,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
  ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
});

const BASELINE_ORO8N_SUMMARY =
  validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary()
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
  return CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8nEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8N_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult ===
      ORO8N_PASS;

  return {
    dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary: true,
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionPrepared === true,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionIssued === true,
    actualLiveExecutionFinalExecutionDecisionPassedFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionPassed === true,
    actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionRecorded === true,
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionStatus,
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8n:
      summary.actualLiveExecutionFinalExecutionDecisionScope,
  };
}

function buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture",
    phase: ORO8O_PHASE,
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence:
      buildOro8nEvidenceFromSummary(BASELINE_ORO8N_SUMMARY),
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualLiveExecutionFinalExecutionExecutionPrepared: true,
      actualLiveExecutionFinalExecutionExecutionIssued: true,
      actualLiveExecutionFinalExecutionExecutionPassed: true,
      actualLiveExecutionFinalExecutionExecutionRecorded: true,
      actualLiveExecutionFinalExecutionExecutionStatus:
        ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
      actualLiveExecutionFinalExecutionExecutionScope:
        ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionVerificationRequired: true,
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
    buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary();
  const merged = deepMerge(baseline, source);
  const oro8n = isPlainObject(
    merged.oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence
  )
    ? merged.oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence
    : {};
  const execution = isPlainObject(
    merged.actualLiveExecutionFinalExecutionExecutionEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionExecutionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary: readBoolean(
      oro8n,
      "dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary",
      true
    ),
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed: readBoolean(
      oro8n,
      "oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n: readBoolean(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n: readBoolean(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionPassedFromOro8n: readBoolean(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionPassedFromOro8n",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n: readBoolean(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8n: readString(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionStatusFromOro8n",
      ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8n: readString(
      oro8n,
      "actualLiveExecutionFinalExecutionDecisionScopeFromOro8n",
      ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
    ),
    actualLiveExecutionFinalExecutionExecutionPrepared: readBoolean(
      execution,
      "actualLiveExecutionFinalExecutionExecutionPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionExecutionIssued: readBoolean(
      execution,
      "actualLiveExecutionFinalExecutionExecutionIssued",
      true
    ),
    actualLiveExecutionFinalExecutionExecutionPassed: readBoolean(
      execution,
      "actualLiveExecutionFinalExecutionExecutionPassed",
      true
    ),
    actualLiveExecutionFinalExecutionExecutionRecorded: readBoolean(
      execution,
      "actualLiveExecutionFinalExecutionExecutionRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionExecutionStatus: readString(
      execution,
      "actualLiveExecutionFinalExecutionExecutionStatus",
      ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS
    ),
    actualLiveExecutionFinalExecutionExecutionScope: readString(
      execution,
      "actualLiveExecutionFinalExecutionExecutionScope",
      ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary:
      readBoolean(
        execution,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      execution,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      execution,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionVerificationRequired: readBoolean(
      execution,
      "separateActualExecutionFinalExecutionVerificationRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(execution, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(execution, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary) {
    blockers.push("missing_oro8n_actual_live_execution_final_execution_decision_boundary_dependency");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n) {
    blockers.push("oro8n_actual_live_execution_final_execution_decision_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n) {
    blockers.push("oro8n_actual_live_execution_final_execution_decision_issuance_required");
  }
  if (!fixture.oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed) {
    blockers.push("oro8n_actual_live_execution_final_execution_decision_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n) {
    blockers.push("oro8n_actual_live_execution_final_execution_decision_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionStatusFromOro8n !==
    ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_oro8n_actual_live_execution_final_execution_decision_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionScopeFromOro8n !==
    ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro8n_actual_live_execution_final_execution_decision_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionExecutionPrepared) {
    blockers.push("actual_live_execution_final_execution_execution_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionExecutionIssued) {
    blockers.push("actual_live_execution_final_execution_execution_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionExecutionPassed) {
    blockers.push("actual_live_execution_final_execution_execution_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionExecutionRecorded) {
    blockers.push("actual_live_execution_final_execution_execution_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionExecutionStatus !==
    ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_execution_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionExecutionScope !==
    ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_execution_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8o`);
  }
  for (const key of CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8o`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionVerificationRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_post_execution_verification_boundary_required_after_oro8o"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8o");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8O_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryResult:
      result,
    dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary:
      fixture.dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary,
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed:
      pass && fixture.oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed,
    actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n,
    actualLiveExecutionFinalExecutionDecisionPassedFromOro8n:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionPassedFromOro8n,
    actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n,
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8n: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionStatusFromOro8n
      : HOLD,
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8n: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionScopeFromOro8n
      : HOLD,
    actualLiveExecutionFinalExecutionExecutionPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionExecutionPrepared,
    actualLiveExecutionFinalExecutionExecutionIssued:
      pass && fixture.actualLiveExecutionFinalExecutionExecutionIssued,
    actualLiveExecutionFinalExecutionExecutionPassed:
      pass && fixture.actualLiveExecutionFinalExecutionExecutionPassed,
    actualLiveExecutionFinalExecutionExecutionRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionExecutionRecorded,
    actualLiveExecutionFinalExecutionExecutionStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionExecutionStatus
      : HOLD,
    actualLiveExecutionFinalExecutionExecutionScope: pass
      ? fixture.actualLiveExecutionFinalExecutionExecutionScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionVerificationRequired =
    pass && fixture.separateActualExecutionFinalExecutionVerificationRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
  input =
    buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
  input = {}
) {
  return evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
    input
  );
}

function runOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
  input = {}
) {
  return validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
    input
  );
}

function buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySummary(
  input = {}
) {
  return evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
    input
  );
}

module.exports = {
  ORO8O_PHASE,
  ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_SCOPE,
  ORO_8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_STATUS,
  ORO8O_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_EXECUTION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8O_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  evaluateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  validateOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  runOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundarySummary,
};
