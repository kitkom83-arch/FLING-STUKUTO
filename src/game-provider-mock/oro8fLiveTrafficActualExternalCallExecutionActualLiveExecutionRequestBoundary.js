"use strict";

const {
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
  validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
} = require("./oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

const ORO8F_PHASE = "ORO-8F";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE =
  "actual_live_execution_request_boundary_only";
const ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS =
  "submitted_for_separate_actual_live_execution_decision_only";

const CLOSED_RUNTIME_AND_SAFETY_FLAGS = Object.freeze([
  "actualExternalCallExecutionRuntimeEnabled",
  "actualExternalCallExecutionActivated",
  "actualExternalCallExecutionEnabled",
  "actualExternalCallExecutionAuthorized",
  "actualExternalCallExecutionLiveExecutionApproved",
  "actualExternalCallExecutionLiveExecuted",
  "externalNetworkAllowed",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCalled",
  "walletMutationAllowed",
  "walletMutationPerformed",
  "ledgerMutationAllowed",
  "ledgerMutationPerformed",
  "prismaWriteAllowed",
  "prismaWritePerformed",
  "dbTransactionAllowed",
  "dbTransactionPerformed",
  "migrationAllowed",
  "migrationPerformed",
  "deployAllowed",
  "deployPerformed",
  "routeEnablementAllowed",
  "expressMountAllowed",
  "publicAliasAllowed",
  "apiBalanceAliasAllowed",
  "apiTransactionAliasAllowed",
  "apiOroplayBalanceRouteAllowed",
  "apiOroplayTransactionRouteAllowed",
]);

const CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS = Object.freeze([
  "actualLiveExecutionRequestApproved",
  "actualLiveExecutionDecisionIssued",
  "actualLiveExecutionDecisionApproved",
  "actualLiveExecutionExecuted",
]);

const ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO8F_PHASE,
  PASS,
  HOLD,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
  ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE,
  ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS,
});

const BASELINE_ORO8E_SUMMARY = validateOro8eActualLiveExecutionFinalExecutionDecisionBoundary(
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary()
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

function closedRequestAndDecisionFlags() {
  return CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8eEvidenceFromSummary(summary) {
  const decisionPassed =
    summary.result === PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryResult ===
      PASS;

  return {
    dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary: true,
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed: decisionPassed,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e:
      summary.actualLiveExecutionFinalExecutionDecisionIssued === true,
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8e:
      summary.actualLiveExecutionFinalExecutionDecisionStatus,
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8e:
      summary.actualLiveExecutionFinalExecutionDecisionScope,
  };
}

function buildOro8fActualLiveExecutionRequestBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathActualLiveExecutionRequestBoundaryFixture",
    phase: ORO8F_PHASE,
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence:
      buildOro8eEvidenceFromSummary(BASELINE_ORO8E_SUMMARY),
    actualLiveExecutionRequestEvidence: {
      actualLiveExecutionRequestPrepared: true,
      actualLiveExecutionRequestSubmitted: true,
      actualLiveExecutionRequestApproved: false,
      actualLiveExecutionRequestStatus: ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
      actualLiveExecutionRequestScope: ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
      ...closedRuntimeFlags(),
      ...closedRequestAndDecisionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionDecision: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedRequestAndDecisionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro8fActualLiveExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro8e = isPlainObject(merged.oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence)
    ? merged.oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence
    : {};
  const request = isPlainObject(merged.actualLiveExecutionRequestEvidence)
    ? merged.actualLiveExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary: readBoolean(
      oro8e,
      "dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary",
      true
    ),
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed: readBoolean(
      oro8e,
      "oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e: readBoolean(
      oro8e,
      "actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e",
      true
    ),
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8e: readString(
      oro8e,
      "actualLiveExecutionFinalExecutionDecisionStatusFromOro8e",
      ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
    ),
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8e: readString(
      oro8e,
      "actualLiveExecutionFinalExecutionDecisionScopeFromOro8e",
      ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
    ),
    actualLiveExecutionRequestPrepared: readBoolean(
      request,
      "actualLiveExecutionRequestPrepared",
      true
    ),
    actualLiveExecutionRequestSubmitted: readBoolean(
      request,
      "actualLiveExecutionRequestSubmitted",
      true
    ),
    actualLiveExecutionRequestApproved: readBoolean(
      request,
      "actualLiveExecutionRequestApproved",
      false
    ),
    actualLiveExecutionRequestStatus: readString(
      request,
      "actualLiveExecutionRequestStatus",
      ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
    ),
    actualLiveExecutionRequestScope: readString(
      request,
      "actualLiveExecutionRequestScope",
      ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualLiveExecutionDecision",
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
  for (const key of CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS) {
    normalized[key] = readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary ||
    !fixture.oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed
  ) {
    blockers.push("missing_passed_oro8e_actual_live_execution_final_execution_decision_boundary");
  }
  if (!fixture.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e) {
    blockers.push("oro8e_actual_live_execution_final_execution_decision_issuance_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionStatusFromOro8e !==
    ORO_8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_oro8e_actual_live_execution_final_execution_decision_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionDecisionScopeFromOro8e !==
    ORO8E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro8e_actual_live_execution_final_execution_decision_scope");
  }

  if (!fixture.actualLiveExecutionRequestPrepared) {
    blockers.push("actual_live_execution_request_preparation_required");
  }
  if (!fixture.actualLiveExecutionRequestSubmitted) {
    blockers.push("actual_live_execution_request_submission_required");
  }
  if (
    fixture.actualLiveExecutionRequestStatus !== ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_request_status");
  }
  if (fixture.actualLiveExecutionRequestScope !== ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE) {
    blockers.push("invalid_actual_live_execution_request_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8f`);
  }
  for (const key of CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8f`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_decision_required_after_oro8f");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8f");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8F_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundaryResult: result,
    dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary:
      fixture.dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed:
      pass && fixture.oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e:
      pass && fixture.actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e,
    actualLiveExecutionFinalExecutionDecisionStatusFromOro8e: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionStatusFromOro8e
      : HOLD,
    actualLiveExecutionFinalExecutionDecisionScopeFromOro8e: pass
      ? fixture.actualLiveExecutionFinalExecutionDecisionScopeFromOro8e
      : HOLD,
    actualLiveExecutionRequestPrepared: pass && fixture.actualLiveExecutionRequestPrepared,
    actualLiveExecutionRequestSubmitted: pass && fixture.actualLiveExecutionRequestSubmitted,
    actualLiveExecutionRequestApproved: false,
    actualLiveExecutionRequestStatus: pass
      ? fixture.actualLiveExecutionRequestStatus
      : HOLD,
    actualLiveExecutionRequestScope: pass ? fixture.actualLiveExecutionRequestScope : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionDecision =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionDecision;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8fActualLiveExecutionRequestBoundary(
  input = buildOro8fActualLiveExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8fActualLiveExecutionRequestBoundary(input = {}) {
  return evaluateOro8fActualLiveExecutionRequestBoundary(input);
}

function runOro8fActualLiveExecutionRequestBoundary(input = {}) {
  return validateOro8fActualLiveExecutionRequestBoundary(input);
}

function buildOro8fActualLiveExecutionRequestBoundarySummary(input = {}) {
  return evaluateOro8fActualLiveExecutionRequestBoundary(input);
}

module.exports = {
  ORO8F_PHASE,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_SCOPE,
  ORO_8F_ACTUAL_LIVE_EXECUTION_REQUEST_STATUS,
  ORO8F_ACTUAL_LIVE_EXECUTION_REQUEST_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8F_REQUEST_AND_DECISION_FLAGS,
  PASS,
  HOLD,
  buildOro8fActualLiveExecutionRequestBoundary,
  evaluateOro8fActualLiveExecutionRequestBoundary,
  validateOro8fActualLiveExecutionRequestBoundary,
  runOro8fActualLiveExecutionRequestBoundary,
  buildOro8fActualLiveExecutionRequestBoundarySummary,
};
