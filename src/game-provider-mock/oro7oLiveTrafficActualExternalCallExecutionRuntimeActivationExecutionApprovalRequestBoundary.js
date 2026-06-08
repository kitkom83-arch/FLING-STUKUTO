"use strict";

const {
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
  PASS: ORO7N_PASS,
  buildOro7nRuntimeActivationFinalReadinessGate,
  validateOro7nRuntimeActivationFinalReadinessGate,
} = require("./oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate");

const ORO7O_PHASE = "ORO-7O";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE =
  "runtime_activation_execution_approval_request_only";
const ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS =
  "submitted_pending_actual_external_call_execution_runtime_activation_execution_approval_decision";

const ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE_RECORD =
  Object.freeze({
    PHASE: ORO7O_PHASE,
    PASS,
    HOLD,
    ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
    ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
  });

const BASELINE_ORO7N_SUMMARY = validateOro7nRuntimeActivationFinalReadinessGate(
  buildOro7nRuntimeActivationFinalReadinessGate()
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

function buildOro7nEvidenceFromSummary(summary) {
  return {
    dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate:
      true,
    oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateResult ===
      ORO7N_PASS,
    actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n:
      summary.actualExternalCallExecutionRuntimeActivationFinalReadinessPassed === true,
    actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n:
      summary.actualExternalCallExecutionRuntimeActivationFinalReadinessScope,
  };
}

function buildOro7oRuntimeActivationExecutionApprovalRequestBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionApprovalRequestFixture",
    phase: ORO7O_PHASE,
    oro7nRuntimeActivationFinalReadinessEvidence:
      buildOro7nEvidenceFromSummary(BASELINE_ORO7N_SUMMARY),
    runtimeActivationExecutionApprovalRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared: true,
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted: true,
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus:
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope:
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision:
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
  const baseline = buildOro7oRuntimeActivationExecutionApprovalRequestBoundary();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro7nRuntimeActivationFinalReadinessEvidence)
    ? merged.oro7nRuntimeActivationFinalReadinessEvidence
    : {};
  const request = isPlainObject(
    merged.runtimeActivationExecutionApprovalRequestEvidence
  )
    ? merged.runtimeActivationExecutionApprovalRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate:
      readBoolean(
        readiness,
        "dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate",
        true
      ),
    oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed:
      readBoolean(
        readiness,
        "oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n",
        true
      ),
    actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n",
        ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus",
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope",
        ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision",
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
    !fixture.dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate ||
    !fixture.oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n
  ) {
    blockers.push("missing_oro7n_runtime_activation_final_readiness");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n !==
    ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
  ) {
    blockers.push("invalid_oro7n_runtime_activation_final_readiness_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted ||
    fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus !==
      ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS ||
    fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope !==
      ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE
  ) {
    blockers.push("runtime_activation_execution_approval_request_record_required_in_oro7o");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7o");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7o");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7o");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7o");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7o");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7o");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7o");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7o");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7o");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7o");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7o");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7o");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7o");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7o");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7o");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7o");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7o");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7o");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_actual_execution_approval_decision_required_after_oro7o");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7o");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7O_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundaryResult:
      result,
    dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate:
      fixture.dependsOnOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate,
    oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed:
      pass &&
      fixture.oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGatePassed,
    actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessPassedFromOro7n,
    actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationFinalReadinessScopeFromOro7n
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestSubmitted,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatus
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionApprovalDecision,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(
  input = buildOro7oRuntimeActivationExecutionApprovalRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7oRuntimeActivationExecutionApprovalRequestBoundary(input = {}) {
  return evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(input);
}

function buildOro7oRuntimeActivationExecutionApprovalRequestSummary(input = {}) {
  return evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary(input);
}

module.exports = {
  ORO7O_PHASE,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_STATUS,
  ORO7O_RUNTIME_ACTIVATION_EXECUTION_APPROVAL_REQUEST_SCOPE_RECORD,
  PASS,
  HOLD,
  buildOro7oRuntimeActivationExecutionApprovalRequestBoundary,
  evaluateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
  validateOro7oRuntimeActivationExecutionApprovalRequestBoundary,
  buildOro7oRuntimeActivationExecutionApprovalRequestSummary,
};
