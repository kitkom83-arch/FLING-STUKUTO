"use strict";

const {
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
  PASS: ORO7P_PASS,
  buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
  validateOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
} = require("./oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary");

const ORO7Q_PHASE = "ORO-7Q";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE =
  "runtime_activation_execution_final_readiness_only";

const ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_RECORD = Object.freeze({
  PHASE: ORO7Q_PHASE,
  PASS,
  HOLD,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE,
  ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS,
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
});

const BASELINE_ORO7P_SUMMARY =
  validateOro7pRuntimeActivationExecutionApprovalDecisionBoundary(
    buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary()
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

function buildOro7pEvidenceFromSummary(summary) {
  return {
    dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary:
      true,
    oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryResult ===
      ORO7P_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p:
      summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssued === true,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p:
      summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatus,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p:
      summary.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScope,
  };
}

function buildOro7qRuntimeActivationExecutionFinalReadinessGate(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionFinalReadinessFixture",
    phase: ORO7Q_PHASE,
    oro7pRuntimeActivationExecutionApprovalDecisionEvidence:
      buildOro7pEvidenceFromSummary(BASELINE_ORO7P_SUMMARY),
    runtimeActivationExecutionFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared: true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed: true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope:
        ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest:
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
  const baseline = buildOro7qRuntimeActivationExecutionFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(
    merged.oro7pRuntimeActivationExecutionApprovalDecisionEvidence
  )
    ? merged.oro7pRuntimeActivationExecutionApprovalDecisionEvidence
    : {};
  const readiness = isPlainObject(
    merged.runtimeActivationExecutionFinalReadinessEvidence
  )
    ? merged.runtimeActivationExecutionFinalReadinessEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary:
      readBoolean(
        decision,
        "dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary",
        true
      ),
    oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed:
      readBoolean(
        decision,
        "oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p",
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p",
        ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope",
        ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest:
      readBoolean(
        readiness,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest",
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
    !fixture.dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary ||
    !fixture.oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p
  ) {
    blockers.push("missing_oro7p_runtime_activation_execution_approval_decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p !==
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_STATUS
  ) {
    blockers.push("invalid_oro7p_runtime_activation_execution_approval_decision_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p !==
    ORO7P_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_DECISION_SCOPE
  ) {
    blockers.push("invalid_oro7p_runtime_activation_execution_approval_decision_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed ||
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope !==
      ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
  ) {
    blockers.push("runtime_activation_execution_final_readiness_record_required_in_oro7q");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7q");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7q");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7q");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7q");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7q");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7q");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7q");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7q");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7q");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7q");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7q");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7q");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7q");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7q");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7q");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7q");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7q");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7q");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_runtime_activation_execution_request_required_after_oro7q");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7q");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7Q_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateResult:
      result,
    dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary:
      fixture.dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary,
    oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed:
      pass &&
      fixture.oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionIssuedFromOro7p,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionRequest,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(
  input = buildOro7qRuntimeActivationExecutionFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7qRuntimeActivationExecutionFinalReadinessGate(input = {}) {
  return evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(input);
}

function buildOro7qRuntimeActivationExecutionFinalReadinessSummary(input = {}) {
  return evaluateOro7qRuntimeActivationExecutionFinalReadinessGate(input);
}

module.exports = {
  ORO7Q_PHASE,
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_RECORD,
  PASS,
  HOLD,
  buildOro7qRuntimeActivationExecutionFinalReadinessGate,
  evaluateOro7qRuntimeActivationExecutionFinalReadinessGate,
  validateOro7qRuntimeActivationExecutionFinalReadinessGate,
  buildOro7qRuntimeActivationExecutionFinalReadinessSummary,
};
