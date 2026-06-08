"use strict";

const {
  PASS: ORO7M_PASS,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
  RUNTIME_ACTIVATION_DECISION_ONLY,
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
  validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
} = require("./oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary");

const ORO7N_PHASE = "ORO-7N";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE =
  "runtime_activation_final_readiness_only";

const ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_GATE_STATUS = Object.freeze({
  PHASE: ORO7N_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
  RUNTIME_ACTIVATION_DECISION_ONLY,
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
});

const BASELINE_ORO7M_SUMMARY =
  validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary(
    buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary()
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

function buildOro7mEvidenceFromSummary(summary) {
  return {
    dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary:
      true,
    oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryResult ===
      ORO7M_PASS,
    actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m:
      summary.actualExternalCallExecutionRuntimeActivationDecisionIssued === true,
    actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m:
      summary.actualExternalCallExecutionRuntimeActivationDecisionStatus,
    actualExternalCallExecutionRuntimeActivationDecisionScopeFromOro7m:
      summary.actualExternalCallExecutionRuntimeActivationDecisionScope,
  };
}

function buildOro7nRuntimeActivationFinalReadinessGate(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture",
    phase: ORO7N_PHASE,
    oro7mRuntimeActivationDecisionEvidence:
      buildOro7mEvidenceFromSummary(BASELINE_ORO7M_SUMMARY),
    runtimeActivationFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared: true,
      actualExternalCallExecutionRuntimeActivationFinalReadinessPassed: true,
      actualExternalCallExecutionRuntimeActivationFinalReadinessScope:
        ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval:
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
  const baseline = buildOro7nRuntimeActivationFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro7mRuntimeActivationDecisionEvidence)
    ? merged.oro7mRuntimeActivationDecisionEvidence
    : {};
  const readiness = isPlainObject(merged.runtimeActivationFinalReadinessEvidence)
    ? merged.runtimeActivationFinalReadinessEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary",
        true
      ),
    oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m",
        true
      ),
    actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m: readString(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeActivationDecisionScopeFromOro7m: readString(
      decision,
      "actualExternalCallExecutionRuntimeActivationDecisionScopeFromOro7m",
      RUNTIME_ACTIVATION_DECISION_ONLY
    ),
    actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared: readBoolean(
      readiness,
      "actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared",
      true
    ),
    actualExternalCallExecutionRuntimeActivationFinalReadinessPassed: readBoolean(
      readiness,
      "actualExternalCallExecutionRuntimeActivationFinalReadinessPassed",
      true
    ),
    actualExternalCallExecutionRuntimeActivationFinalReadinessScope: readString(
      readiness,
      "actualExternalCallExecutionRuntimeActivationFinalReadinessScope",
      ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval:
      readBoolean(
        readiness,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval",
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
    liveOroPlayApiCallAllowed: readBoolean(safety, "liveOroPlayApiCallAllowed", false),
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
    apiTransactionAliasAllowed: readBoolean(safety, "apiTransactionAliasAllowed", false),
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
    !fixture.dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary ||
    !fixture.oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m ||
    fixture.actualExternalCallExecutionRuntimeActivationDecisionScopeFromOro7m !==
      RUNTIME_ACTIVATION_DECISION_ONLY
  ) {
    blockers.push("missing_oro7m_runtime_activation_decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m !==
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY
  ) {
    blockers.push("invalid_oro7m_runtime_activation_decision_status");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPassed ||
    fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessScope !==
      ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
  ) {
    blockers.push("runtime_activation_final_readiness_record_required_in_oro7n");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7n");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7n");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7n");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7n");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7n");
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
    blockers.push("mutation_not_allowed_in_oro7n");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration_or_deploy_not_allowed_in_oro7n");
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
    blockers.push("route_enablement_not_allowed_in_oro7n");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next_phase_runtime_activation_request_or_execution_approval_required_after_oro7n");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7n");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7N_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateResult:
      result,
    dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary:
      fixture.dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
    oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed:
      pass &&
      fixture.oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m:
      pass && fixture.actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m,
    actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m
      : HOLD,
    actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared,
    actualExternalCallExecutionRuntimeActivationFinalReadinessPassed:
      pass && fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPassed,
    actualExternalCallExecutionRuntimeActivationFinalReadinessScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7nRuntimeActivationFinalReadinessGate(
  input = buildOro7nRuntimeActivationFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7nRuntimeActivationFinalReadinessGate(input = {}) {
  return evaluateOro7nRuntimeActivationFinalReadinessGate(input);
}

function buildOro7nRuntimeActivationFinalReadinessSummary(input = {}) {
  return evaluateOro7nRuntimeActivationFinalReadinessGate(input);
}

module.exports = {
  ORO7N_PHASE,
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
  PASS,
  HOLD,
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_GATE_STATUS,
  buildOro7nRuntimeActivationFinalReadinessGate,
  evaluateOro7nRuntimeActivationFinalReadinessGate,
  validateOro7nRuntimeActivationFinalReadinessGate,
  buildOro7nRuntimeActivationFinalReadinessSummary,
};
