"use strict";

const {
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
  PASS: ORO7Z_PASS,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
  validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
} = require("./oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate");

const ORO8A_PHASE = "ORO-8A";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE =
  "actual_live_execution_authorization_request_only";
const ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS =
  "submitted_pending_separate_actual_live_execution_authorization_decision";

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

const ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO8A_PHASE,
  PASS,
  HOLD,
  ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE,
  ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
});

const BASELINE_ORO7Z_SUMMARY =
  validateOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
    buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate()
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

function buildOro7zEvidenceFromSummary(summary) {
  return {
    dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate:
      true,
    oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateResult ===
      ORO7Z_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z:
      summary.result === ORO7Z_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope,
  };
}

function buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture",
    phase: ORO8A_PHASE,
    oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence:
      buildOro7zEvidenceFromSummary(BASELINE_ORO7Z_SUMMARY),
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestPrepared: true,
      actualLiveExecutionAuthorizationRequestSubmitted: true,
      actualLiveExecutionAuthorizationRequestStatus:
        ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
      actualLiveExecutionAuthorizationRequestScope:
        ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
      ...closedFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision: true,
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
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro7z = isPlainObject(
    merged.oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence
  )
    ? merged.oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence
    : {};
  const request = isPlainObject(merged.actualLiveExecutionAuthorizationRequestEvidence)
    ? merged.actualLiveExecutionAuthorizationRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate:
      readBoolean(
        oro7z,
        "dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate",
        true
      ),
    oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
      readBoolean(
        oro7z,
        "oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z:
      readBoolean(
        oro7z,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z:
      readString(
        oro7z,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z",
        ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z:
      readString(
        oro7z,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z",
        ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
      ),
    actualLiveExecutionAuthorizationRequestPrepared: readBoolean(
      request,
      "actualLiveExecutionAuthorizationRequestPrepared",
      true
    ),
    actualLiveExecutionAuthorizationRequestSubmitted: readBoolean(
      request,
      "actualLiveExecutionAuthorizationRequestSubmitted",
      true
    ),
    actualLiveExecutionAuthorizationRequestStatus: readString(
      request,
      "actualLiveExecutionAuthorizationRequestStatus",
      ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
    ),
    actualLiveExecutionAuthorizationRequestScope: readString(
      request,
      "actualLiveExecutionAuthorizationRequestScope",
      ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
    ),
    nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision",
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
    normalized[key] =
      readBoolean(request, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate ||
    !fixture.oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z
  ) {
    blockers.push(
      "missing_passed_oro7z_runtime_activation_execution_final_pre_live_execution_gate"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z !==
    ORO_7Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_PRE_LIVE_EXECUTION_GATE_STATUS
  ) {
    blockers.push(
      "invalid_oro7z_runtime_activation_execution_final_pre_live_execution_gate_status"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z !==
    ORO7Z_FINAL_PRE_LIVE_EXECUTION_GATE_SCOPE
  ) {
    blockers.push(
      "invalid_oro7z_runtime_activation_execution_final_pre_live_execution_gate_scope"
    );
  }
  if (!fixture.actualLiveExecutionAuthorizationRequestPrepared) {
    blockers.push("actual_live_execution_authorization_request_preparation_required");
  }
  if (!fixture.actualLiveExecutionAuthorizationRequestSubmitted) {
    blockers.push("actual_live_execution_authorization_request_submission_required");
  }
  if (
    fixture.actualLiveExecutionAuthorizationRequestStatus !==
    ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_authorization_request_status");
  }
  if (
    fixture.actualLiveExecutionAuthorizationRequestScope !==
    ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_authorization_request_scope");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8a`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_live_execution_authorization_decision_required_after_oro8a");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8a");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8A_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryResult:
      result,
    dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate:
      fixture.dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
    oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
      pass &&
      fixture.oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z
        : HOLD,
    actualLiveExecutionAuthorizationRequestPrepared:
      pass && fixture.actualLiveExecutionAuthorizationRequestPrepared,
    actualLiveExecutionAuthorizationRequestSubmitted:
      pass && fixture.actualLiveExecutionAuthorizationRequestSubmitted,
    actualLiveExecutionAuthorizationRequestStatus: pass
      ? fixture.actualLiveExecutionAuthorizationRequestStatus
      : HOLD,
    actualLiveExecutionAuthorizationRequestScope: pass
      ? fixture.actualLiveExecutionAuthorizationRequestScope
      : HOLD,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
  input =
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
  input = {}
) {
  return evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
    input
  );
}

function runOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
  input = {}
) {
  return validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
    input
  );
}

function buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySummary(
  input = {}
) {
  return evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
    input
  );
}

module.exports = {
  ORO8A_PHASE,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_SCOPE,
  ORO_8A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  ORO8A_ACTUAL_LIVE_EXECUTION_AUTHORIZATION_REQUEST_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  PASS,
  HOLD,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  evaluateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  validateOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  runOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundarySummary,
};
