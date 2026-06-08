"use strict";

const {
  PASS: ORO7F_PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
  buildOro7fRuntimeEnablementRequestInput,
  validateOro7fRuntimeEnablementRequestContract,
} = require("./oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");

const ORO_7G_PHASE = "ORO-7G";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY =
  "approved_for_separate_actual_external_call_execution_runtime_enablement_final_readiness_only";
const RUNTIME_ENABLEMENT_DECISION_ONLY = "runtime_enablement_decision_only";

const ORO7G_RUNTIME_ENABLEMENT_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7G_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
});

const BASELINE_ORO7F_SUMMARY = validateOro7fRuntimeEnablementRequestContract(
  buildOro7fRuntimeEnablementRequestInput()
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

function buildOro7fEvidenceFromSummary(summary) {
  return {
    dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      true,
    oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult ===
      ORO7F_PASS,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f:
      summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared === true,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f:
      summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted === true,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f:
      summary.actualExternalCallExecutionRuntimeEnablementRequestStatus,
    actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f:
      summary.actualExternalCallExecutionRuntimeEnablementRequestScope,
  };
}

function buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture",
    phase: ORO_7G_PHASE,
    oro7fRuntimeEnablementRequestEvidence: buildOro7fEvidenceFromSummary(
      BASELINE_ORO7F_SUMMARY
    ),
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionPrepared: true,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
      actualExternalCallExecutionRuntimeEnablementDecisionScope:
        RUNTIME_ENABLEMENT_DECISION_ONLY,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
    },
    safetyEvidence: {
      externalNetworkAllowed: false,
      externalNetworkCalled: false,
      liveOroPlayApiCallAllowed: false,
      liveOroPlayApiCalled: false,
      walletMutationAllowed: false,
      walletMutationPerformed: false,
      ledgerMutationAllowed: false,
      ledgerMutationPerformed: false,
      prismaWriteAllowed: false,
      prismaWritePerformed: false,
      dbTransactionAllowed: false,
      dbTransactionPerformed: false,
      migrationAllowed: false,
      migrationPerformed: false,
      deployAllowed: false,
      deployPerformed: false,
      routeEnablementAllowed: false,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      apiBalanceAliasAllowed: false,
      apiTransactionAliasAllowed: false,
      apiOroplayBalanceRouteAllowed: false,
      apiOroplayTransactionRouteAllowed: false,
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro7fRuntimeEnablementRequestEvidence)
    ? merged.oro7fRuntimeEnablementRequestEvidence
    : {};
  const decision = isPlainObject(merged.runtimeEnablementDecisionEvidence)
    ? merged.runtimeEnablementDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
        true
      ),
    oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f:
      readString(
        request,
        "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION
      ),
    actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f:
      readString(
        request,
        "actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f",
        RUNTIME_ENABLEMENT_REQUEST_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionPrepared",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionScope: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionScope",
      RUNTIME_ENABLEMENT_DECISION_ONLY
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      decision,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      decision,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionLiveExecuted: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecuted",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness",
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
    externalNetworkAllowed: readBoolean(safety, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(safety, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      safety,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(safety, "liveOroPlayApiCalled", false),
    walletMutationAllowed: readBoolean(safety, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(safety, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(safety, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(safety, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(safety, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(safety, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(safety, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(safety, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(safety, "migrationAllowed", false),
    migrationPerformed: readBoolean(safety, "migrationPerformed", false),
    deployAllowed: readBoolean(safety, "deployAllowed", false),
    deployPerformed: readBoolean(safety, "deployPerformed", false),
    routeEnablementAllowed: readBoolean(safety, "routeEnablementAllowed", false),
    expressMountAllowed: readBoolean(safety, "expressMountAllowed", false),
    publicAliasAllowed: readBoolean(safety, "publicAliasAllowed", false),
    apiBalanceAliasAllowed: readBoolean(safety, "apiBalanceAliasAllowed", false),
    apiTransactionAliasAllowed: readBoolean(
      safety,
      "apiTransactionAliasAllowed",
      false
    ),
    apiOroplayBalanceRouteAllowed: readBoolean(
      safety,
      "apiOroplayBalanceRouteAllowed",
      false
    ),
    apiOroplayTransactionRouteAllowed: readBoolean(
      safety,
      "apiOroplayTransactionRouteAllowed",
      false
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary ||
    !fixture.oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f !==
      RUNTIME_ENABLEMENT_REQUEST_ONLY
  ) {
    blockers.push("missing_oro7f_runtime_enablement_request");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionScope !==
      RUNTIME_ENABLEMENT_DECISION_ONLY
  ) {
    blockers.push("runtime_enablement_decision_record_required_in_oro7g");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7g");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7g");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7g");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7g");
  }
  if (
    fixture.walletMutationAllowed ||
    fixture.walletMutationPerformed ||
    fixture.ledgerMutationAllowed ||
    fixture.ledgerMutationPerformed ||
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("mutation_not_allowed_in_oro7g");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration_or_deploy_not_allowed_in_oro7g");
  }
  if (
    fixture.routeEnablementAllowed ||
    fixture.expressMountAllowed ||
    fixture.publicAliasAllowed ||
    fixture.apiBalanceAliasAllowed ||
    fixture.apiTransactionAliasAllowed ||
    fixture.apiOroplayBalanceRouteAllowed ||
    fixture.apiOroplayTransactionRouteAllowed
  ) {
    blockers.push("route_or_alias_not_allowed_in_oro7g");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next_phase_final_readiness_required_after_oro7g");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7g");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_7G_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult:
      result,
    dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      fixture.dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed:
      pass &&
      fixture.oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionPrepared,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued,
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionScope: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionScope
      : HOLD,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionLiveExecuted: false,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    walletMutationAllowed: false,
    walletMutationPerformed: false,
    ledgerMutationAllowed: false,
    ledgerMutationPerformed: false,
    prismaWriteAllowed: false,
    prismaWritePerformed: false,
    dbTransactionAllowed: false,
    dbTransactionPerformed: false,
    migrationAllowed: false,
    migrationPerformed: false,
    deployAllowed: false,
    deployPerformed: false,
    routeEnablementAllowed: false,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    apiBalanceAliasAllowed: false,
    apiTransactionAliasAllowed: false,
    apiOroplayBalanceRouteAllowed: false,
    apiOroplayTransactionRouteAllowed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7gRuntimeEnablementDecisionBoundary(
  input =
    buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
  input = {}
) {
  return evaluateOro7gRuntimeEnablementDecisionBoundary(input);
}

function buildOro7gRuntimeEnablementDecisionBoundarySummary(input = {}) {
  return evaluateOro7gRuntimeEnablementDecisionBoundary(input);
}

module.exports = {
  ORO_7G_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
  ORO7G_RUNTIME_ENABLEMENT_DECISION_BOUNDARY_STATUS,
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  evaluateOro7gRuntimeEnablementDecisionBoundary,
  validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  buildOro7gRuntimeEnablementDecisionBoundarySummary,
};
