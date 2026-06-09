"use strict";

const {
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  PASS: ORO8A_PASS,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
} = require("./oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary");

const ORO8B_PHASE = "ORO-8B";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE =
  "actual_live_execution_authorization_decision_only";
const ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS =
  "approved_for_separate_actual_live_execution_final_execution_gate_only";

const ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_RECORD = Object.freeze({
  PHASE: ORO8B_PHASE,
  PASS,
  HOLD,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
});

const BASELINE_ORO8A_SUMMARY =
  validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary()
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

function buildOro8aEvidenceFromSummary(summary) {
  const requestPassed =
    summary.result === ORO8A_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryResult ===
      ORO8A_PASS;

  return {
    dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary:
      true,
    oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed:
      requestPassed,
    oro8aActualLiveExecutionAuthorizationRequestPassed: requestPassed,
    actualLiveExecutionAuthorizationRequestSubmittedFromOro8a:
      summary.actualLiveExecutionAuthorizationRequestSubmitted === true,
    actualLiveExecutionAuthorizationRequestStatusFromOro8a:
      summary.actualLiveExecutionAuthorizationRequestStatus,
    actualLiveExecutionAuthorizationRequestScopeFromOro8a:
      summary.actualLiveExecutionAuthorizationRequestScope,
  };
}

function buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture",
    phase: ORO8B_PHASE,
    oro8aActualLiveExecutionAuthorizationRequestEvidence:
      buildOro8aEvidenceFromSummary(BASELINE_ORO8A_SUMMARY),
    actualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionPrepared: true,
      actualLiveExecutionAuthorizationDecisionIssued: true,
      actualLiveExecutionAuthorizationDecisionStatus:
        ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
      actualLiveExecutionAuthorizationDecisionScope:
        ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
      ...closedFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedFlags(),
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro8a = isPlainObject(merged.oro8aActualLiveExecutionAuthorizationRequestEvidence)
    ? merged.oro8aActualLiveExecutionAuthorizationRequestEvidence
    : {};
  const decision = isPlainObject(merged.actualLiveExecutionAuthorizationDecisionEvidence)
    ? merged.actualLiveExecutionAuthorizationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary:
      readBoolean(
        oro8a,
        "dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary",
        true
      ),
    oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed:
      readBoolean(
        oro8a,
        "oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed",
        true
      ),
    oro8aActualLiveExecutionAuthorizationRequestPassed: readBoolean(
      oro8a,
      "oro8aActualLiveExecutionAuthorizationRequestPassed",
      true
    ),
    actualLiveExecutionAuthorizationRequestSubmittedFromOro8a: readBoolean(
      oro8a,
      "actualLiveExecutionAuthorizationRequestSubmittedFromOro8a",
      true
    ),
    actualLiveExecutionAuthorizationRequestStatusFromOro8a: readString(
      oro8a,
      "actualLiveExecutionAuthorizationRequestStatusFromOro8a",
      ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
    ),
    actualLiveExecutionAuthorizationRequestScopeFromOro8a: readString(
      oro8a,
      "actualLiveExecutionAuthorizationRequestScopeFromOro8a",
      ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
    ),
    actualLiveExecutionAuthorizationDecisionPrepared: readBoolean(
      decision,
      "actualLiveExecutionAuthorizationDecisionPrepared",
      true
    ),
    actualLiveExecutionAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualLiveExecutionAuthorizationDecisionIssued",
      true
    ),
    actualLiveExecutionAuthorizationDecisionStatus: readString(
      decision,
      "actualLiveExecutionAuthorizationDecisionStatus",
      ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
    ),
    actualLiveExecutionAuthorizationDecisionScope: readString(
      decision,
      "actualLiveExecutionAuthorizationDecisionScope",
      ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate",
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
    normalized[key] =
      readBoolean(decision, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture
      .dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary ||
    !fixture
      .oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed ||
    !fixture.oro8aActualLiveExecutionAuthorizationRequestPassed
  ) {
    blockers.push(
      "missing_passed_oro8a_actual_live_execution_authorization_request_boundary"
    );
  }
  if (!fixture.actualLiveExecutionAuthorizationRequestSubmittedFromOro8a) {
    blockers.push("oro8a_actual_live_execution_authorization_request_submission_required");
  }
  if (
    fixture.actualLiveExecutionAuthorizationRequestStatusFromOro8a !==
    ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_oro8a_actual_live_execution_authorization_request_status");
  }
  if (
    fixture.actualLiveExecutionAuthorizationRequestScopeFromOro8a !==
    ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro8a_actual_live_execution_authorization_request_scope");
  }
  if (!fixture.actualLiveExecutionAuthorizationDecisionPrepared) {
    blockers.push("actual_live_execution_authorization_decision_preparation_required");
  }
  if (!fixture.actualLiveExecutionAuthorizationDecisionIssued) {
    blockers.push("actual_live_execution_authorization_decision_issuance_required");
  }
  if (
    fixture.actualLiveExecutionAuthorizationDecisionStatus !==
    ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_authorization_decision_status");
  }
  if (
    fixture.actualLiveExecutionAuthorizationDecisionScope !==
    ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_authorization_decision_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8b`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_final_execution_gate_required_after_oro8b");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8b");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8B_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryResult:
      result,
    dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary:
      fixture
        .dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
    oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed:
      pass &&
      fixture
        .oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed,
    oro8aActualLiveExecutionAuthorizationRequestPassed:
      pass && fixture.oro8aActualLiveExecutionAuthorizationRequestPassed,
    actualLiveExecutionAuthorizationRequestSubmittedFromOro8a:
      pass && fixture.actualLiveExecutionAuthorizationRequestSubmittedFromOro8a,
    actualLiveExecutionAuthorizationRequestStatusFromOro8a: pass
      ? fixture.actualLiveExecutionAuthorizationRequestStatusFromOro8a
      : HOLD,
    actualLiveExecutionAuthorizationRequestScopeFromOro8a: pass
      ? fixture.actualLiveExecutionAuthorizationRequestScopeFromOro8a
      : HOLD,
    actualLiveExecutionAuthorizationDecisionPrepared:
      pass && fixture.actualLiveExecutionAuthorizationDecisionPrepared,
    actualLiveExecutionAuthorizationDecisionIssued:
      pass && fixture.actualLiveExecutionAuthorizationDecisionIssued,
    actualLiveExecutionAuthorizationDecisionStatus: pass
      ? fixture.actualLiveExecutionAuthorizationDecisionStatus
      : HOLD,
    actualLiveExecutionAuthorizationDecisionScope: pass
      ? fixture.actualLiveExecutionAuthorizationDecisionScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
  input =
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
  input = {}
) {
  return evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
    input
  );
}

function runOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
  input = {}
) {
  return validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
    input
  );
}

function buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySummary(
  input = {}
) {
  return evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
    input
  );
}

module.exports = {
  ORO8B_PHASE,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_SCOPE,
  ORO_8B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  ORO8B_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_DECISION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  PASS,
  HOLD,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  evaluateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  validateOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  runOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundarySummary,
};
