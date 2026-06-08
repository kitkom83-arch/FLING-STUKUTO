"use strict";

const {
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
  PASS: ORO7U_PASS,
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
} = require("./oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary");

const ORO7V_PHASE = "ORO-7V";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE =
  "runtime_activation_execution_final_authorization_decision_only";
const ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS =
  "approved_for_separate_actual_external_call_execution_runtime_activation_execution_authorized_execution_readiness_only";

const ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_RECORD =
  Object.freeze({
    PHASE: ORO7V_PHASE,
    PASS,
    HOLD,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
  });

const BASELINE_ORO7U_SUMMARY = validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary()
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

function buildOro7uEvidenceFromSummary(summary) {
  return {
    dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary:
      true,
    oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryResult ===
      ORO7U_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope,
  };
}

function buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture",
    phase: ORO7V_PHASE,
    oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence:
      buildOro7uEvidenceFromSummary(BASELINE_ORO7U_SUMMARY),
    runtimeActivationExecutionFinalAuthorizationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus:
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope:
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness:
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
  const baseline = buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(
    merged.oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence
  )
    ? merged.oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence
    : {};
  const decision = isPlainObject(
    merged.runtimeActivationExecutionFinalAuthorizationDecisionEvidence
  )
    ? merged.runtimeActivationExecutionFinalAuthorizationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary:
      readBoolean(
        request,
        "dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary",
        true
      ),
    oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed:
      readBoolean(
        request,
        "oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u",
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u",
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued:
      readBoolean(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus",
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope:
      readString(
        decision,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope",
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness",
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
    !fixture.dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary ||
    !fixture.oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u
  ) {
    blockers.push("missing_oro7u_runtime_activation_execution_final_authorization_request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u !==
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
  ) {
    blockers.push(
      "invalid_oro7u_runtime_activation_execution_final_authorization_request_status"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u !==
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
  ) {
    blockers.push(
      "invalid_oro7u_runtime_activation_execution_final_authorization_request_scope"
    );
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued
  ) {
    blockers.push("runtime_activation_execution_final_authorization_decision_required_in_oro7v");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus !==
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
  ) {
    blockers.push("invalid_runtime_activation_execution_final_authorization_decision_status_in_oro7v");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope !==
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_final_authorization_decision_scope_in_oro7v");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7v");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7v");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7v");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7v");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7v");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7v");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7v");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7v");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7v");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7v");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7v");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7v");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7v");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7v");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7v");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7v");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7v");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7v");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_authorized_execution_readiness_required_after_oro7v"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7v");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7V_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryResult:
      result,
    dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary:
      fixture.dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
    oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed:
      pass &&
      fixture.oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
  input = buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
  input = {}
) {
  return evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(input);
}

function buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionSummary(
  input = {}
) {
  return evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(input);
}

module.exports = {
  ORO7V_PHASE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_RECORD,
  PASS,
  HOLD,
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionSummary,
};
