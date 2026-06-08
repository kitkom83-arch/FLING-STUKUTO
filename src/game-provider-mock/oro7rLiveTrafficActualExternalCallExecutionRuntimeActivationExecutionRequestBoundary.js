"use strict";

const {
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
  PASS: ORO7Q_PASS,
  buildOro7qRuntimeActivationExecutionFinalReadinessGate,
  validateOro7qRuntimeActivationExecutionFinalReadinessGate,
} = require("./oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate");

const ORO7R_PHASE = "ORO-7R";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE =
  "runtime_activation_execution_request_only";
const ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS =
  "submitted_pending_actual_external_call_execution_runtime_activation_execution_decision";

const ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_RECORD = Object.freeze({
  PHASE: ORO7R_PHASE,
  PASS,
  HOLD,
  ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
});

const BASELINE_ORO7Q_SUMMARY =
  validateOro7qRuntimeActivationExecutionFinalReadinessGate(
    buildOro7qRuntimeActivationExecutionFinalReadinessGate()
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

function buildOro7qEvidenceFromSummary(summary) {
  return {
    dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate:
      true,
    oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateResult ===
      ORO7Q_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassed === true,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q:
      summary.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScope,
  };
}

function buildOro7rRuntimeActivationExecutionRequestBoundary(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionRequestFixture",
    phase: ORO7R_PHASE,
    oro7qRuntimeActivationExecutionFinalReadinessEvidence:
      buildOro7qEvidenceFromSummary(BASELINE_ORO7Q_SUMMARY),
    runtimeActivationExecutionRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared: true,
      actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted: true,
      actualExternalCallExecutionRuntimeActivationExecutionRequestStatus:
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionRequestScope:
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision:
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
  const baseline = buildOro7rRuntimeActivationExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const finalReadiness = isPlainObject(
    merged.oro7qRuntimeActivationExecutionFinalReadinessEvidence
  )
    ? merged.oro7qRuntimeActivationExecutionFinalReadinessEvidence
    : {};
  const request = isPlainObject(merged.runtimeActivationExecutionRequestEvidence)
    ? merged.runtimeActivationExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate:
      readBoolean(
        finalReadiness,
        "dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate",
        true
      ),
    oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed:
      readBoolean(
        finalReadiness,
        "oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q:
      readBoolean(
        finalReadiness,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q:
      readString(
        finalReadiness,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q",
        ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatus:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestStatus",
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionRequestScope:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionRequestScope",
        ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision",
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
    !fixture.dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate ||
    !fixture.oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q
  ) {
    blockers.push("missing_oro7q_runtime_activation_execution_final_readiness");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q !==
    ORO7Q_RUNTIME_ACTIVATION_EXECUTION_FINAL_READINESS_SCOPE
  ) {
    blockers.push("invalid_oro7q_runtime_activation_execution_final_readiness_scope");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted
  ) {
    blockers.push("runtime_activation_execution_request_submission_required_in_oro7r");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestStatus !==
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS
  ) {
    blockers.push("invalid_runtime_activation_execution_request_status_in_oro7r");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestScope !==
    ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE
  ) {
    blockers.push("invalid_runtime_activation_execution_request_scope_in_oro7r");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7r");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_not_allowed_in_oro7r");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7r");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7r");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7r");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7r");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7r");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7r");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7r");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7r");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7r");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7r");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7r");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7r");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7r");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7r");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7r");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7r");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "separate_actual_external_call_execution_runtime_activation_execution_decision_required_after_oro7r"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7r");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7R_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryResult:
      result,
    dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate:
      fixture.dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate,
    oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed:
      pass &&
      fixture.oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGatePassed,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessPassedFromOro7q,
    actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted,
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestStatus
      : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionRequestScope: pass
      ? fixture.actualExternalCallExecutionRuntimeActivationExecutionRequestScope
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionDecision,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7rRuntimeActivationExecutionRequestBoundary(
  input = buildOro7rRuntimeActivationExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7rRuntimeActivationExecutionRequestBoundary(input = {}) {
  return evaluateOro7rRuntimeActivationExecutionRequestBoundary(input);
}

function buildOro7rRuntimeActivationExecutionRequestSummary(input = {}) {
  return evaluateOro7rRuntimeActivationExecutionRequestBoundary(input);
}

module.exports = {
  ORO7R_PHASE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_SCOPE,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_STATUS,
  ORO7R_RUNTIME_ACTIVATION_EXECUTION_REQUEST_RECORD,
  PASS,
  HOLD,
  buildOro7rRuntimeActivationExecutionRequestBoundary,
  evaluateOro7rRuntimeActivationExecutionRequestBoundary,
  validateOro7rRuntimeActivationExecutionRequestBoundary,
  buildOro7rRuntimeActivationExecutionRequestSummary,
};
