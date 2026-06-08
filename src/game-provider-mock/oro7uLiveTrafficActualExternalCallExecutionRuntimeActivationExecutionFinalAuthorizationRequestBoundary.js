"use strict";

const {
  ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
  PASS: ORO7T_PASS,
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
  validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
} = require("./oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate");

const ORO7U_PHASE = "ORO-7U";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE =
  "runtime_activation_execution_final_authorization_request_only";
const ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS =
  "submitted_pending_actual_external_call_execution_runtime_activation_execution_final_authorization_decision";

const ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_RECORD =
  Object.freeze({
    PHASE: ORO7U_PHASE,
    PASS,
    HOLD,
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
  });

const BASELINE_ORO7T_SUMMARY = validateOro7tRuntimeActivationExecutionPostDecisionReadinessGate(
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate()
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

function buildOro7tEvidenceFromSummary(summary) {
  return {
    dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate:
      true,
    oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateResult ===
      ORO7T_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t:
      summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassed ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t:
      summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScope,
  };
}

function buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture",
    phase: ORO7U_PHASE,
    oro7tRuntimeActivationExecutionPostDecisionReadinessEvidence:
      buildOro7tEvidenceFromSummary(BASELINE_ORO7T_SUMMARY),
    runtimeActivationExecutionFinalAuthorizationRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus:
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope:
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision:
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
  const baseline = buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(
    merged.oro7tRuntimeActivationExecutionPostDecisionReadinessEvidence
  )
    ? merged.oro7tRuntimeActivationExecutionPostDecisionReadinessEvidence
    : {};
  const request = isPlainObject(
    merged.runtimeActivationExecutionFinalAuthorizationRequestEvidence
  )
    ? merged.runtimeActivationExecutionFinalAuthorizationRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate:
      readBoolean(
        readiness,
        "dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate",
        true
      ),
    oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed:
      readBoolean(
        readiness,
        "oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t",
        ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus",
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope",
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
      ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      request,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      request,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      request,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionLiveExecuted: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecuted",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision",
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
    !fixture.dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate ||
    !fixture.oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t
  ) {
    blockers.push(
      "missing_oro7t_runtime_activation_execution_post_decision_readiness"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t !==
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
  ) {
    blockers.push(
      "invalid_oro7t_runtime_activation_execution_post_decision_readiness_scope"
    );
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted
  ) {
    blockers.push(
      "runtime_activation_execution_final_authorization_request_submission_required_in_oro7u"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus !==
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
  ) {
    blockers.push(
      "invalid_runtime_activation_execution_final_authorization_request_status_in_oro7u"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope !==
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
  ) {
    blockers.push(
      "invalid_runtime_activation_execution_final_authorization_request_scope_in_oro7u"
    );
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7u");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7u");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7u");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7u");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7u");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7u");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7u");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7u");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7u");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7u");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7u");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7u");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7u");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7u");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7u");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7u");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7u");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7u");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_final_authorization_decision_required_after_oro7u"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7u");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7U_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryResult:
      result,
    dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate:
      fixture.dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate,
    oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed:
      pass &&
      fixture.oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t,
    actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
  input = buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
  input = {}
) {
  return evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(input);
}

function buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestSummary(
  input = {}
) {
  return evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(input);
}

module.exports = {
  ORO7U_PHASE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_RECORD,
  PASS,
  HOLD,
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestSummary,
};
