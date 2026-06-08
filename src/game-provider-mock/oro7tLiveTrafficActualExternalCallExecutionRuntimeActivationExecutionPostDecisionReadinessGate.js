"use strict";

const {
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
  PASS: ORO7S_PASS,
  buildOro7sRuntimeActivationExecutionDecisionBoundary,
  validateOro7sRuntimeActivationExecutionDecisionBoundary,
} = require("./oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary");

const ORO7T_PHASE = "ORO-7T";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE =
  "runtime_activation_execution_post_decision_readiness_only";

const ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_RECORD =
  Object.freeze({
    PHASE: ORO7T_PHASE,
    PASS,
    HOLD,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
  });

const BASELINE_ORO7S_SUMMARY = validateOro7sRuntimeActivationExecutionDecisionBoundary(
  buildOro7sRuntimeActivationExecutionDecisionBoundary()
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

function buildOro7sEvidenceFromSummary(summary) {
  return {
    dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary:
      true,
    oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryResult ===
      ORO7S_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s:
      summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued === true,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s:
      summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s:
      summary.actualExternalCallExecutionRuntimeActivationExecutionDecisionScope,
  };
}

function buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionPostDecisionReadinessFixture",
    phase: ORO7T_PHASE,
    oro7sRuntimeActivationExecutionDecisionEvidence:
      buildOro7sEvidenceFromSummary(BASELINE_ORO7S_SUMMARY),
    runtimeActivationExecutionPostDecisionReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope:
        ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest:
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
  const baseline = buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro7sRuntimeActivationExecutionDecisionEvidence)
    ? merged.oro7sRuntimeActivationExecutionDecisionEvidence
    : {};
  const readiness = isPlainObject(
    merged.runtimeActivationExecutionPostDecisionReadinessEvidence
  )
    ? merged.runtimeActivationExecutionPostDecisionReadinessEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary",
        true
      ),
    oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s",
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s",
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope",
        ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest:
      readBoolean(
        readiness,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest",
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
    !fixture.dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary ||
    !fixture.oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s
  ) {
    blockers.push("missing_oro7s_runtime_activation_execution_decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s !==
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_oro7s_runtime_activation_execution_decision_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s !==
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro7s_runtime_activation_execution_decision_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed
  ) {
    blockers.push("post_decision_readiness_required_in_oro7t");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope !==
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
  ) {
    blockers.push("invalid_post_decision_readiness_scope_in_oro7t");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7t");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7t");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7t");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7t");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7t");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7t");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7t");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7t");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7t");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7t");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7t");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7t");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7t");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7t");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7t");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7t");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7t");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7t");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_final_authorization_request_required_after_oro7t"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7t");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7T_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateResult:
      result,
    dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary:
      fixture.dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary,
    oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed:
      pass &&
      fixture.oro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssuedFromOro7s,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequest,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
  input = buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(input = {}) {
  return evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(input);
}

function buildOro7tRuntimeActivationExecutionPostDecisionReadinessSummary(input = {}) {
  return evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(input);
}

module.exports = {
  ORO7T_PHASE,
  ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
  ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_RECORD,
  PASS,
  HOLD,
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  evaluateOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessSummary,
};
