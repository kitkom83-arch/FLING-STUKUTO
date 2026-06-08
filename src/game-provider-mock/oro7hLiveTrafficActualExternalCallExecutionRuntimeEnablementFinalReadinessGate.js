"use strict";

const {
  PASS: ORO7G_PASS,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
} = require("./oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");

const ORO_7H_PHASE = "ORO-7H";
const PASS = "PASS";
const HOLD = "HOLD";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY =
  "ready_for_separate_actual_external_call_execution_runtime_enablement_activation_request_only";
const RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY =
  "runtime_enablement_final_readiness_only";

const ORO7H_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE_STATUS = Object.freeze({
  PHASE: ORO_7H_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
});

const BASELINE_ORO7G_SUMMARY =
  validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
    buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary()
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

function buildOro7gEvidenceFromSummary(summary) {
  return {
    dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      true,
    oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult ===
      ORO7G_PASS,
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionPrepared === true,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued === true,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionScope,
  };
}

function buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture",
    phase: ORO_7H_PHASE,
    oro7gRuntimeEnablementDecisionEvidence: buildOro7gEvidenceFromSummary(
      BASELINE_ORO7G_SUMMARY
    ),
    runtimeEnablementFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared: true,
      actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked: true,
      actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed: true,
      actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
      actualExternalCallExecutionRuntimeEnablementFinalReadinessScope:
        RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest:
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
    buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro7gRuntimeEnablementDecisionEvidence)
    ? merged.oro7gRuntimeEnablementDecisionEvidence
    : {};
  const readiness = isPlainObject(merged.runtimeEnablementFinalReadinessEvidence)
    ? merged.runtimeEnablementFinalReadinessEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
        true
      ),
    oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g",
        RUNTIME_ENABLEMENT_DECISION_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementFinalReadinessScope:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeEnablementFinalReadinessScope",
        RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
      ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      readiness,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      readiness,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      readiness,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      readiness,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      readiness,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionLiveExecuted: readBoolean(
      readiness,
      "actualExternalCallExecutionLiveExecuted",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest:
      readBoolean(
        readiness,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      readiness,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      readiness,
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
    !fixture.dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary ||
    !fixture.oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g ||
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g !==
      RUNTIME_ENABLEMENT_DECISION_ONLY
  ) {
    blockers.push("missing_oro7g_runtime_enablement_decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g !==
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  ) {
    blockers.push("invalid_oro7g_runtime_enablement_decision_status");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked ||
    !fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed ||
    fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessScope !==
      RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  ) {
    blockers.push("runtime_enablement_final_readiness_record_required_in_oro7h");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7h");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7h");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7h");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7h");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7h");
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
    blockers.push("mutation_not_allowed_in_oro7h");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration_or_deploy_not_allowed_in_oro7h");
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
    blockers.push("route_enablement_not_allowed_in_oro7h");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next_phase_activation_request_required_after_oro7h");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7h");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_7H_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateResult:
      result,
    dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      fixture.dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed:
      pass &&
      fixture.oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared,
    actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked,
    actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed,
    actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementFinalReadinessScope: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementFinalReadinessScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7hRuntimeEnablementFinalReadinessGate(
  input =
    buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate(
  input = {}
) {
  return evaluateOro7hRuntimeEnablementFinalReadinessGate(input);
}

function buildOro7hRuntimeEnablementFinalReadinessGateSummary(input = {}) {
  return evaluateOro7hRuntimeEnablementFinalReadinessGate(input);
}

module.exports = {
  ORO_7H_PHASE,
  PASS,
  HOLD,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  ORO7H_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE_STATUS,
  buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
  evaluateOro7hRuntimeEnablementFinalReadinessGate,
  validateOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
  buildOro7hRuntimeEnablementFinalReadinessGateSummary,
};
