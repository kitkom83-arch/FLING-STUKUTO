"use strict";

const {
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
  PASS: ORO7V_PASS,
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
} = require("./oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary");

const ORO7W_PHASE = "ORO-7W";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE =
  "runtime_activation_execution_authorized_execution_readiness_only";

const ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_RECORD =
  Object.freeze({
    PHASE: ORO7W_PHASE,
    PASS,
    HOLD,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  });

const BASELINE_ORO7V_SUMMARY = validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary()
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

function buildOro7vEvidenceFromSummary(summary) {
  return {
    dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary:
      true,
    oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryResult ===
      ORO7V_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope,
  };
}

function buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture",
    phase: ORO7W_PHASE,
    oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence:
      buildOro7vEvidenceFromSummary(BASELINE_ORO7V_SUMMARY),
    runtimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope:
        ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest:
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
  const baseline = buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(
    merged.oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence
  )
    ? merged.oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence
    : {};
  const readiness = isPlainObject(
    merged.runtimeActivationExecutionAuthorizedExecutionReadinessEvidence
  )
    ? merged.runtimeActivationExecutionAuthorizedExecutionReadinessEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary",
        true
      ),
    oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v",
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v",
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope",
        ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest:
      readBoolean(
        readiness,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest",
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
    !fixture.dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary ||
    !fixture.oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v
  ) {
    blockers.push("missing_oro7v_runtime_activation_execution_final_authorization_decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v !==
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
  ) {
    blockers.push(
      "invalid_oro7v_runtime_activation_execution_final_authorization_decision_status"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v !==
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
  ) {
    blockers.push(
      "invalid_oro7v_runtime_activation_execution_final_authorization_decision_scope"
    );
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed
  ) {
    blockers.push("runtime_activation_execution_authorized_execution_readiness_required_in_oro7w");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope !==
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_authorized_execution_readiness_scope_in_oro7w");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7w");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7w");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7w");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7w");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7w");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7w");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7w");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7w");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7w");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7w");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7w");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7w");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7w");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7w");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7w");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7w");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7w");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7w");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_live_readiness_request_required_after_oro7w"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7w");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7W_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateResult:
      result,
    dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary:
      fixture.dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
    oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed:
      pass &&
      fixture.oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssuedFromOro7v,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequest,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
  input = buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
  input = {}
) {
  return evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(input);
}

function buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessSummary(
  input = {}
) {
  return evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(input);
}

module.exports = {
  ORO7W_PHASE,
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_RECORD,
  PASS,
  HOLD,
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  evaluateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessSummary,
};
