"use strict";

const {
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  PASS: ORO7W_PASS,
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
  validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
} = require("./oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate");

const ORO7X_PHASE = "ORO-7X";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO7X_LIVE_READINESS_REQUEST_SCOPE =
  "runtime_activation_execution_live_readiness_request_only";
const ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS =
  "submitted_pending_separate_live_readiness_decision";

const ORO7X_LIVE_READINESS_REQUEST_RECORD = Object.freeze({
  PHASE: ORO7X_PHASE,
  PASS,
  HOLD,
  ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE,
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
});

const BASELINE_ORO7W_SUMMARY = validateOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate(
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate()
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

function buildOro7wEvidenceFromSummary(summary) {
  return {
    dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate:
      true,
    oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateResult ===
      ORO7W_PASS,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w:
      summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassed ===
      true,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w:
      summary.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScope,
  };
}

function buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeActivationExecutionLiveReadinessRequestFixture",
    phase: ORO7X_PHASE,
    oro7wRuntimeActivationExecutionAuthorizedExecutionReadinessEvidence:
      buildOro7wEvidenceFromSummary(BASELINE_ORO7W_SUMMARY),
    runtimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted:
        true,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus:
        ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope:
        ORO7X_LIVE_READINESS_REQUEST_SCOPE,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionLiveExecuted: false,
      nextPhaseRequiresSeparateLiveReadinessDecision: true,
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
    buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(
    merged.oro7wRuntimeActivationExecutionAuthorizedExecutionReadinessEvidence
  )
    ? merged.oro7wRuntimeActivationExecutionAuthorizedExecutionReadinessEvidence
    : {};
  const request = isPlainObject(
    merged.runtimeActivationExecutionLiveReadinessRequestEvidence
  )
    ? merged.runtimeActivationExecutionLiveReadinessRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate:
      readBoolean(
        readiness,
        "dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate",
        true
      ),
    oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed:
      readBoolean(
        readiness,
        "oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w:
      readBoolean(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w:
      readString(
        readiness,
        "actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w",
        ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted:
      readBoolean(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted",
        true
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus",
        ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
      ),
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope:
      readString(
        request,
        "actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope",
        ORO7X_LIVE_READINESS_REQUEST_SCOPE
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
    nextPhaseRequiresSeparateLiveReadinessDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateLiveReadinessDecision",
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
    !fixture.dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate ||
    !fixture.oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w
  ) {
    blockers.push("missing_oro7w_runtime_activation_execution_authorized_execution_readiness");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w !==
    ORO7W_RUNTIME_ACTIVATION_EXECUTION_AUTHORIZED_EXECUTION_READINESS_SCOPE
  ) {
    blockers.push(
      "invalid_oro7w_runtime_activation_execution_authorized_execution_readiness_scope"
    );
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted
  ) {
    blockers.push(
      "runtime_activation_execution_live_readiness_request_submission_required_in_oro7x"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus !==
    ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS
  ) {
    blockers.push(
      "invalid_runtime_activation_execution_live_readiness_request_status_in_oro7x"
    );
  }
  if (
    fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope !==
    ORO7X_LIVE_READINESS_REQUEST_SCOPE
  ) {
    blockers.push(
      "invalid_runtime_activation_execution_live_readiness_request_scope_in_oro7x"
    );
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("runtime_activation_not_allowed_in_oro7x");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized
  ) {
    blockers.push("runtime_enablement_or_execution_authorization_not_allowed_in_oro7x");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionLiveExecuted
  ) {
    blockers.push("live_execution_not_allowed_in_oro7x");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external_network_not_allowed_in_oro7x");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live_oroplay_api_call_not_allowed_in_oro7x");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet_mutation_not_allowed_in_oro7x");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger_mutation_not_allowed_in_oro7x");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("prisma_write_not_allowed_in_oro7x");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("db_transaction_not_allowed_in_oro7x");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration_not_allowed_in_oro7x");
  }
  if (fixture.deployAllowed || fixture.deployPerformed) {
    blockers.push("deploy_not_allowed_in_oro7x");
  }
  if (fixture.routeEnablementAllowed) {
    blockers.push("route_enablement_not_allowed_in_oro7x");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("express_mount_not_allowed_in_oro7x");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public_alias_not_allowed_in_oro7x");
  }
  if (fixture.apiBalanceAliasAllowed) {
    blockers.push("api_balance_alias_not_allowed_in_oro7x");
  }
  if (fixture.apiTransactionAliasAllowed) {
    blockers.push("api_transaction_alias_not_allowed_in_oro7x");
  }
  if (fixture.apiOroplayBalanceRouteAllowed) {
    blockers.push("api_oroplay_balance_route_not_allowed_in_oro7x");
  }
  if (fixture.apiOroplayTransactionRouteAllowed) {
    blockers.push("api_oroplay_transaction_route_not_allowed_in_oro7x");
  }
  if (
    !fixture.nextPhaseRequiresSeparateLiveReadinessDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("separate_live_readiness_decision_required_after_oro7x");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro7x");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO7X_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryResult:
      result,
    dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate:
      fixture.dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
    oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed:
      pass &&
      fixture.oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGatePassed,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessPassedFromOro7w,
    actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestPrepared,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted:
      pass &&
      fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatus
        : HOLD,
    actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope:
      pass
        ? fixture.actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope
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
    nextPhaseRequiresSeparateLiveReadinessDecision:
      pass && fixture.nextPhaseRequiresSeparateLiveReadinessDecision,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
  input = buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
  input = {}
) {
  return evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
    input
  );
}

function runOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
  input = {}
) {
  return validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
    input
  );
}

function buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSummary(
  input = {}
) {
  return evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
    input
  );
}

module.exports = {
  ORO7X_PHASE,
  ORO7X_LIVE_READINESS_REQUEST_SCOPE,
  ORO_7X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_LIVE_READINESS_REQUEST_BOUNDARY_STATUS,
  ORO7X_LIVE_READINESS_REQUEST_RECORD,
  PASS,
  HOLD,
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  evaluateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  validateOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  runOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSummary,
};
