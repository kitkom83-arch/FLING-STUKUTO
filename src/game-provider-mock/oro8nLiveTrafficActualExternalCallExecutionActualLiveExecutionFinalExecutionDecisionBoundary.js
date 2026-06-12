"use strict";

const {
  CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
  PASS: ORO8M_PASS,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
  validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
} = require("./oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary");

const ORO8N_PHASE = "ORO-8N";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE =
  "actual_live_execution_final_execution_decision_boundary_only";
const ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS =
  "decided_for_separate_actual_live_execution_final_execution_execution_boundary_only";

const CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8M_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionExecuted",
]);

const ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_RECORD = Object.freeze({
  PHASE: ORO8N_PHASE,
  PASS,
  HOLD,
  ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE,
  ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
});

const BASELINE_ORO8M_SUMMARY =
  validateOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary()
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
  return CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8mEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8M_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryResult ===
      ORO8M_PASS;

  return {
    dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary: true,
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalPrepared === true,
    actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalIssued === true,
    actualLiveExecutionFinalExecutionApprovalPassedFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalPassed === true,
    actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalRecorded === true,
    actualLiveExecutionFinalExecutionApprovalStatusFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalStatus,
    actualLiveExecutionFinalExecutionApprovalScopeFromOro8m:
      summary.actualLiveExecutionFinalExecutionApprovalScope,
  };
}

function buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture",
    phase: ORO8N_PHASE,
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence:
      buildOro8mEvidenceFromSummary(BASELINE_ORO8M_SUMMARY),
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualLiveExecutionFinalExecutionDecisionPrepared: true,
      actualLiveExecutionFinalExecutionDecisionIssued: true,
      actualLiveExecutionFinalExecutionDecisionPassed: true,
      actualLiveExecutionFinalExecutionDecisionRecorded: true,
      actualLiveExecutionFinalExecutionDecisionStatus:
        ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
      actualLiveExecutionFinalExecutionDecisionScope:
        ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionRequired: true,
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
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro8m = isPlainObject(
    merged.oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence
  )
    ? merged.oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence
    : {};
  const decision = isPlainObject(
    merged.actualLiveExecutionFinalExecutionDecisionEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary: readBoolean(
      oro8m,
      "dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary",
      true
    ),
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed: readBoolean(
      oro8m,
      "oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m: readBoolean(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m: readBoolean(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalPassedFromOro8m: readBoolean(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalPassedFromOro8m",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m: readBoolean(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m",
      true
    ),
    actualLiveExecutionFinalExecutionApprovalStatusFromOro8m: readString(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalStatusFromOro8m",
      ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
    ),
    actualLiveExecutionFinalExecutionApprovalScopeFromOro8m: readString(
      oro8m,
      "actualLiveExecutionFinalExecutionApprovalScopeFromOro8m",
      ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
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
    actualLiveExecutionFinalExecutionDecisionPassed: readBoolean(
      decision,
      "actualLiveExecutionFinalExecutionDecisionPassed",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionRecorded: readBoolean(
      decision,
      "actualLiveExecutionFinalExecutionDecisionRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionStatus: readString(
      decision,
      "actualLiveExecutionFinalExecutionDecisionStatus",
      ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionFinalExecutionDecisionScope: readString(
      decision,
      "actualLiveExecutionFinalExecutionDecisionScope",
      ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary",
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
    separateActualExecutionFinalExecutionRequired: readBoolean(
      decision,
      "separateActualExecutionFinalExecutionRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary) {
    blockers.push("missing_oro8m_actual_live_execution_final_execution_approval_boundary_dependency");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m) {
    blockers.push("oro8m_actual_live_execution_final_execution_approval_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m) {
    blockers.push("oro8m_actual_live_execution_final_execution_approval_issuance_required");
  }
  if (!fixture.oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed) {
    blockers.push("oro8m_actual_live_execution_final_execution_approval_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m) {
    blockers.push("oro8m_actual_live_execution_final_execution_approval_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionApprovalStatusFromOro8m !==
    ORO_8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_STATUS
  ) {
    blockers.push("invalid_oro8m_actual_live_execution_final_execution_approval_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionApprovalScopeFromOro8m !==
    ORO8M_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_APPROVAL_SCOPE
  ) {
    blockers.push("invalid_oro8m_actual_live_execution_final_execution_approval_scope");
  }

  if (!fixture.actualLiveExecutionFinalExecutionDecisionPrepared) {
    blockers.push("actual_live_execution_final_execution_decision_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionIssued) {
    blockers.push("actual_live_execution_final_execution_decision_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionPassed) {
    blockers.push("actual_live_execution_final_execution_decision_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionRecorded) {
    blockers.push("actual_live_execution_final_execution_decision_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionStatus !==
    ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_decision_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionScope !==
    ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_decision_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8n`);
  }
  for (const key of CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8n`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_execution_boundary_required_after_oro8n"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8n");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8N_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult:
      result,
    dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary:
      fixture.dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary,
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed:
      pass && fixture.oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed,
    actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m,
    actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m,
    actualLiveExecutionFinalExecutionApprovalPassedFromOro8m:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalPassedFromOro8m,
    actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m:
      pass && fixture.actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m,
    actualLiveExecutionFinalExecutionApprovalStatusFromOro8m: pass
      ? fixture.actualLiveExecutionFinalExecutionApprovalStatusFromOro8m
      : HOLD,
    actualLiveExecutionFinalExecutionApprovalScopeFromOro8m: pass
      ? fixture.actualLiveExecutionFinalExecutionApprovalScopeFromOro8m
      : HOLD,
    actualLiveExecutionFinalExecutionDecisionPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionPrepared,
    actualLiveExecutionFinalExecutionDecisionIssued:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionIssued,
    actualLiveExecutionFinalExecutionDecisionPassed:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionPassed,
    actualLiveExecutionFinalExecutionDecisionRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionRecorded,
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
  for (const key of CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionExecutionBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionRequired =
    pass && fixture.separateActualExecutionFinalExecutionRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
  input =
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
  input = {}
) {
  return evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
    input
  );
}

function runOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
  input = {}
) {
  return validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
    input
  );
}

function buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySummary(
  input = {}
) {
  return evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
    input
  );
}

module.exports = {
  ORO8N_PHASE,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  ORO8N_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8N_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  evaluateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  runOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundarySummary,
};
