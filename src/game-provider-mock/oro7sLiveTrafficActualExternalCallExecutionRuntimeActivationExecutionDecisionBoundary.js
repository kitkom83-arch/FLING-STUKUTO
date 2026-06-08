"use strict";

const {
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
  PASS: ORO7R_PASS,
  buildOro7rRuntimeActivationExecutionRequestBoundary,
  validateOro7rRuntimeActivationExecutionRequestBoundary,
} = require("./oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary");

const ORO7S_PHASE = "ORO-7S";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE =
  "runtime_activation_execution_decision_only";
const ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS =
  "approved_for_separate_actual_external_call_execution_runtime_activation_execution_post_decision_readiness_only";

const ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_RECORD = Object.freeze({
  PHASE: ORO7S_PHASE,
  PASS,
  HOLD,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
});

const BASELINE_ORO7R_SUMMARY = validateOro7rRuntimeActivationExecutionRequestBoundary(
  buildOro7rRuntimeActivationExecutionRequestBoundary()
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

function buildOro7rEvidenceFromSummary(summary) {
  return {
    dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary:
      true,
    oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryResult ===
      ORO7R_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r:
      summary.actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared === true,
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r:
      summary.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted === true,
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r:
      summary.actualExternalCallExecutionRuntimeActivationExecutionRequestStatus,
    actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r:
      summary.actualExternalCallExecutionRuntimeActivationExecutionRequestScope,
  };
}

function buildOro7sRuntimeActivationExecutionDecisionBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionDecisionFixture",
    phase: ORO7S_PHASE,
    oro7rRuntimeActivationExecutionRequestEvidence:
      buildOro7rEvidenceFromSummary(BASELINE_ORO7R_SUMMARY),
    runtimeActivationExecutionDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared: true,
      actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued: true,
      actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus:
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionDecisionScope:
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness:
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
  const baseline = buildOro7sRuntimeActivationExecutionDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro7rRuntimeActivationExecutionRequestEvidence)
    ? merged.oro7rRuntimeActivationExecutionRequestEvidence
    : {};
  const decision = isPlainObject(merged.runtimeActivationExecutionDecisionEvidence)
    ? merged.runtimeActivationExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary",
        true
      ),
    oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r",
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r",
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus",
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScope:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionDecisionScope",
        ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness",
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
    !fixture.dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary ||
    !fixture.oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r
  ) {
    blockers.push("missing_oro7r_runtime_activation_execution_request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r !==
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_oro7r_runtime_activation_execution_request_status");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r !==
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_oro7r_runtime_activation_execution_request_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued
  ) {
    blockers.push("runtime_activation_execution_decision_required_in_oro7s");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus !==
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS
  ) {
    blockers.push("invalid_runtime_activation_execution_decision_status_in_oro7s");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionScope !==
    ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_decision_scope_in_oro7s");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7s");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7s");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7s");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7s");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7s");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7s");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7s");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7s");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7s");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7s");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7s");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7s");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7s");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7s");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7s");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7s");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7s");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7s");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_post_decision_readiness_required_after_oro7s"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7s");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7S_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundaryResult:
      result,
    dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary:
      fixture.dependsOnOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary,
    oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed:
      pass &&
      fixture.oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestPreparedFromOro7r,
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmittedFromOro7r,
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestStatusFromOro7r
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestScopeFromOro7r
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionIssued,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionStatus
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionDecisionScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadiness,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7sRuntimeActivationExecutionDecisionBoundary(
  input = buildOro7sRuntimeActivationExecutionDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7sRuntimeActivationExecutionDecisionBoundary(input = {}) {
  return evaluateOro7sRuntimeActivationExecutionDecisionBoundary(input);
}

function buildOro7sRuntimeActivationExecutionDecisionSummary(input = {}) {
  return evaluateOro7sRuntimeActivationExecutionDecisionBoundary(input);
}

module.exports = {
  ORO7S_PHASE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_SCOPE,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_STATUS,
  ORO7S_RUNTIME_ACTIVATION_EXECUTION_DECISION_RECORD,
  PASS,
  HOLD,
  buildOro7sRuntimeActivationExecutionDecisionBoundary,
  evaluateOro7sRuntimeActivationExecutionDecisionBoundary,
  validateOro7sRuntimeActivationExecutionDecisionBoundary,
  buildOro7sRuntimeActivationExecutionDecisionSummary,
};
