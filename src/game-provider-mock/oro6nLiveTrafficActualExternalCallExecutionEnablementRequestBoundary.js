"use strict";

const {
  PASS: ORO6M_PASS,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
  validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
} = require("./oro6mLiveTrafficActualExternalCallExecutionReadinessGate");

const ORO_6N_PHASE = "ORO-6N";
const PASS = "PASS";
const HOLD = "HOLD";
const PENDING = "pending";
const SUBMITTED_PENDING_ENABLEMENT_DECISION =
  "submitted_pending_enablement_decision";
const APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY =
  "approved_for_live_execution_readiness_only";
const LIVE_EXECUTION_READINESS_ONLY = "live_execution_readiness_only";

const ORO_6N_ACTUAL_EXECUTION_ENABLEMENT_REQUEST_STATUS = Object.freeze({
  PHASE: ORO_6N_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
  SUBMITTED_PENDING_ENABLEMENT_DECISION,
});

const BASELINE_ORO6M_SUMMARY =
  validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
    buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate()
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

function buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture",
    phase: ORO_6N_PHASE,
    oro6mReadinessEvidence: {
      dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate: true,
      oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed:
        BASELINE_ORO6M_SUMMARY
          .liveTrafficActualExternalCallExecutionReadinessGateResult ===
        ORO6M_PASS,
      liveExecutionReadinessGatePreparedFromOro6m:
        BASELINE_ORO6M_SUMMARY.liveExecutionReadinessGatePrepared === true,
      liveExecutionReadinessGateEvaluatedFromOro6m:
        BASELINE_ORO6M_SUMMARY.liveExecutionReadinessGateEvaluated === true,
      liveExecutionReadinessGatePassedFromOro6m:
        BASELINE_ORO6M_SUMMARY.liveExecutionReadinessGatePassed === true,
      liveExecutionReadinessGateStatusFromOro6m:
        BASELINE_ORO6M_SUMMARY.liveExecutionReadinessGateStatus,
      actualExternalCallExecutionEnablementRequestPreparedFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionEnablementRequestPrepared ===
        true,
      actualExternalCallExecutionEnablementRequestSubmittedFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionEnablementRequestSubmitted ===
        true,
      actualExternalCallExecutionEnablementDecisionIssuedFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionEnablementDecisionIssued ===
        true,
      actualExternalCallExecutionEnablementDecisionStatusFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionEnablementDecisionStatus,
      actualExternalCallExecutionEnabledFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionEnabled === true,
      actualExternalCallExecutionAuthorizedFromOro6m:
        BASELINE_ORO6M_SUMMARY.actualExternalCallExecutionAuthorized === true,
      externalCallExecutionAuthorizedFromOro6m:
        BASELINE_ORO6M_SUMMARY.externalCallExecutionAuthorized === true,
      externalCallExecutionPerformedFromOro6m:
        BASELINE_ORO6M_SUMMARY.externalCallExecutionPerformed === true,
      externalNetworkAllowedFromOro6m:
        BASELINE_ORO6M_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6m:
        BASELINE_ORO6M_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6lDecisionEvidence: {
      dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
        BASELINE_ORO6M_SUMMARY
          .dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary ===
        true,
      oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
        BASELINE_ORO6M_SUMMARY
          .oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed ===
        true,
      actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l:
        BASELINE_ORO6M_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l,
      actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l:
        BASELINE_ORO6M_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l,
    },
    requestEvidence: {
      actualExternalCallExecutionEnablementRequestPrepared: true,
      actualExternalCallExecutionEnablementRequestSubmitted: true,
      actualExternalCallExecutionEnablementRequestStatus:
        SUBMITTED_PENDING_ENABLEMENT_DECISION,
    },
    enablementDecisionEvidence: {
      actualExternalCallExecutionEnablementDecisionIssued: false,
      actualExternalCallExecutionEnablementDecisionStatus: PENDING,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision: true,
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
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro6m = isPlainObject(merged.oro6mReadinessEvidence)
    ? merged.oro6mReadinessEvidence
    : {};
  const oro6l = isPlainObject(merged.oro6lDecisionEvidence)
    ? merged.oro6lDecisionEvidence
    : {};
  const request = isPlainObject(merged.requestEvidence)
    ? merged.requestEvidence
    : {};
  const decision = isPlainObject(merged.enablementDecisionEvidence)
    ? merged.enablementDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate: readBoolean(
      oro6m,
      "dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate",
      true
    ),
    oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed: readBoolean(
      oro6m,
      "oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed",
      true
    ),
    liveExecutionReadinessGatePreparedFromOro6m: readBoolean(
      oro6m,
      "liveExecutionReadinessGatePreparedFromOro6m",
      true
    ),
    liveExecutionReadinessGateEvaluatedFromOro6m: readBoolean(
      oro6m,
      "liveExecutionReadinessGateEvaluatedFromOro6m",
      true
    ),
    liveExecutionReadinessGatePassedFromOro6m: readBoolean(
      oro6m,
      "liveExecutionReadinessGatePassedFromOro6m",
      true
    ),
    liveExecutionReadinessGateStatusFromOro6m: readString(
      oro6m,
      "liveExecutionReadinessGateStatusFromOro6m",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionEnablementRequestPreparedFromOro6m: readBoolean(
      oro6m,
      "actualExternalCallExecutionEnablementRequestPreparedFromOro6m",
      false
    ),
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6m: readBoolean(
      oro6m,
      "actualExternalCallExecutionEnablementRequestSubmittedFromOro6m",
      false
    ),
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6m: readBoolean(
      oro6m,
      "actualExternalCallExecutionEnablementDecisionIssuedFromOro6m",
      false
    ),
    actualExternalCallExecutionEnablementDecisionStatusFromOro6m: readString(
      oro6m,
      "actualExternalCallExecutionEnablementDecisionStatusFromOro6m",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionEnabledFromOro6m: readBoolean(
      oro6m,
      "actualExternalCallExecutionEnabledFromOro6m",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6m: readBoolean(
      oro6m,
      "actualExternalCallExecutionAuthorizedFromOro6m",
      false
    ),
    externalCallExecutionAuthorizedFromOro6m: readBoolean(
      oro6m,
      "externalCallExecutionAuthorizedFromOro6m",
      false
    ),
    externalCallExecutionPerformedFromOro6m: readBoolean(
      oro6m,
      "externalCallExecutionPerformedFromOro6m",
      false
    ),
    externalNetworkAllowedFromOro6m: readBoolean(
      oro6m,
      "externalNetworkAllowedFromOro6m",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6m: readBoolean(
      oro6m,
      "liveOroPlayApiCallAllowedFromOro6m",
      false
    ),
    dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      readBoolean(
        oro6l,
        "dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
        true
      ),
    oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
      readBoolean(
        oro6l,
        "oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l: readString(
      oro6l,
      "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l",
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l: readString(
      oro6l,
      "actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l",
      LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionEnablementRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionEnablementRequestPrepared",
      true
    ),
    actualExternalCallExecutionEnablementRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionEnablementRequestSubmitted",
      true
    ),
    actualExternalCallExecutionEnablementRequestStatus: readString(
      request,
      "actualExternalCallExecutionEnablementRequestStatus",
      SUBMITTED_PENDING_ENABLEMENT_DECISION
    ),
    actualExternalCallExecutionEnablementDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionEnablementDecisionIssued",
      false
    ),
    actualExternalCallExecutionEnablementDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionEnablementDecisionStatus",
      PENDING
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
    externalCallExecutionAuthorized: readBoolean(
      decision,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      decision,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision",
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
    liveOroPlayApiCallAllowed: readBoolean(
      safety,
      "liveOroPlayApiCallAllowed",
      false
    ),
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
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate ||
    !fixture.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed
  ) {
    blockers.push("ORO-6M live execution readiness gate is required");
  }
  if (
    !fixture.liveExecutionReadinessGatePreparedFromOro6m ||
    !fixture.liveExecutionReadinessGateEvaluatedFromOro6m ||
    !fixture.liveExecutionReadinessGatePassedFromOro6m ||
    fixture.liveExecutionReadinessGateStatusFromOro6m !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
  ) {
    blockers.push("ORO-6M readiness status must allow separate enablement request");
  }
  if (
    fixture.actualExternalCallExecutionEnablementRequestPreparedFromOro6m ||
    fixture.actualExternalCallExecutionEnablementRequestSubmittedFromOro6m ||
    fixture.actualExternalCallExecutionEnablementDecisionIssuedFromOro6m ||
    fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6m !==
      NOT_REQUESTED ||
    fixture.actualExternalCallExecutionEnabledFromOro6m
  ) {
    blockers.push("ORO-6M must not already submit or decide enablement");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6m ||
    fixture.externalCallExecutionAuthorizedFromOro6m ||
    fixture.externalCallExecutionPerformedFromOro6m ||
    fixture.externalNetworkAllowedFromOro6m ||
    fixture.liveOroPlayApiCallAllowedFromOro6m
  ) {
    blockers.push("ORO-6M must still have no actual execution or live call");
  }
  if (
    !fixture
      .dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary ||
    !fixture
      .oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l !==
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l !==
      LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6L readiness-only decision evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionEnablementRequestPrepared ||
    !fixture.actualExternalCallExecutionEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionEnablementRequestStatus !==
      SUBMITTED_PENDING_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6N enablement request must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionEnablementDecisionStatus !== PENDING
  ) {
    blockers.push("ORO-6N must not issue enablement decision");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6N must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6N must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6N must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate enablement decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during enablement request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during enablement request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during enablement request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during enablement request");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration and deploy must remain absent");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_6N_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult: result,
    dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate:
      fixture.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed:
      pass &&
      fixture.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed,
    liveExecutionReadinessGatePreparedFromOro6m:
      pass && fixture.liveExecutionReadinessGatePreparedFromOro6m,
    liveExecutionReadinessGateEvaluatedFromOro6m:
      pass && fixture.liveExecutionReadinessGateEvaluatedFromOro6m,
    liveExecutionReadinessGatePassedFromOro6m:
      pass && fixture.liveExecutionReadinessGatePassedFromOro6m,
    liveExecutionReadinessGateStatusFromOro6m: pass
      ? fixture.liveExecutionReadinessGateStatusFromOro6m
      : HOLD,
    actualExternalCallExecutionEnablementRequestPreparedFromOro6m: false,
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6m: false,
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6m: false,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6m: NOT_REQUESTED,
    actualExternalCallExecutionEnabledFromOro6m: false,
    actualExternalCallExecutionAuthorizedFromOro6m: false,
    externalCallExecutionAuthorizedFromOro6m: false,
    externalCallExecutionPerformedFromOro6m: false,
    externalNetworkAllowedFromOro6m: false,
    liveOroPlayApiCallAllowedFromOro6m: false,
    dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      fixture
        .dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
      pass &&
      fixture.oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l
      : HOLD,
    actualExternalCallExecutionEnablementRequestPrepared:
      pass && fixture.actualExternalCallExecutionEnablementRequestPrepared,
    actualExternalCallExecutionEnablementRequestSubmitted:
      pass && fixture.actualExternalCallExecutionEnablementRequestSubmitted,
    actualExternalCallExecutionEnablementRequestStatus: pass
      ? fixture.actualExternalCallExecutionEnablementRequestStatus
      : HOLD,
    actualExternalCallExecutionEnablementDecisionIssued: false,
    actualExternalCallExecutionEnablementDecisionStatus: PENDING,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision,
    humanApprovalRequiredForActualExecution:
      pass && fixture.humanApprovalRequiredForActualExecution,
    separateActualExecutionApprovalRequired:
      pass && fixture.separateActualExecutionApprovalRequired,
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
    secretsLeaked: false,
    blockers,
  };
}

function validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
  input =
    buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6nActualExecutionEnablementRequestSummary(input = {}) {
  return validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
    input
  );
}

function assertOro6nStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionEnablementDecisionIssued ||
    report.actualExternalCallExecutionEnabled ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6N still-no-external-call assertion failed");
  }
  return true;
}

function runOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryHarness(
  input
) {
  return validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
    input
  );
}

module.exports = {
  ORO_6N_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ENABLEMENT_DECISION,
  ORO_6N_ACTUAL_EXECUTION_ENABLEMENT_REQUEST_STATUS,
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
  validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
  buildOro6nActualExecutionEnablementRequestSummary,
  assertOro6nStillNoExternalCall,
  runOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryHarness,
};
