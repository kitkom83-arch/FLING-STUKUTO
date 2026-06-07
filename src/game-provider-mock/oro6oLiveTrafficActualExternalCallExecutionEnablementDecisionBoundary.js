"use strict";

const {
  PASS: ORO6N_PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ENABLEMENT_DECISION,
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
  validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
} = require("./oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary");

const ORO_6O_PHASE = "ORO-6O";
const PASS = "PASS";
const APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY =
  "approved_for_final_live_execution_readiness_only";
const FINAL_LIVE_EXECUTION_READINESS_ONLY =
  "final_live_execution_readiness_only";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_enablement_request";

const ORO_6O_ACTUAL_EXECUTION_ENABLEMENT_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6O_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ENABLEMENT_DECISION,
  APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
  FINAL_LIVE_EXECUTION_READINESS_ONLY,
});

const BASELINE_ORO6N_SUMMARY =
  validateOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary(
    buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary()
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

function buildOro6nEvidenceFromSummary(summary) {
  return {
    dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
      true,
    oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed:
      summary.liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult ===
      ORO6N_PASS,
    actualExternalCallExecutionEnablementRequestPreparedFromOro6n:
      summary.actualExternalCallExecutionEnablementRequestPrepared === true,
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6n:
      summary.actualExternalCallExecutionEnablementRequestSubmitted === true,
    actualExternalCallExecutionEnablementRequestStatusFromOro6n:
      summary.actualExternalCallExecutionEnablementRequestStatus,
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6n:
      summary.actualExternalCallExecutionEnablementDecisionIssued === true,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6n:
      summary.actualExternalCallExecutionEnablementDecisionStatus,
    actualExternalCallExecutionEnabledFromOro6n:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6n:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6n:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6n:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6n: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6n:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6mEvidenceFromOro6nSummary(summary) {
  return {
    dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate:
      summary.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate ===
      true,
    oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed:
      summary.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed ===
      true,
    liveExecutionReadinessGateStatusFromOro6m:
      summary.liveExecutionReadinessGateStatusFromOro6m,
  };
}

function buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture",
    phase: ORO_6O_PHASE,
    oro6nEnablementRequestEvidence:
      buildOro6nEvidenceFromSummary(BASELINE_ORO6N_SUMMARY),
    oro6mReadinessEvidence:
      buildOro6mEvidenceFromOro6nSummary(BASELINE_ORO6N_SUMMARY),
    decisionEvidence: {
      actualExternalCallExecutionEnablementDecisionPrepared: true,
      actualExternalCallExecutionEnablementDecisionIssued: true,
      actualExternalCallExecutionEnablementDecisionStatus:
        APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionEnablementDecisionScope:
        FINAL_LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate: true,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement: true,
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
    buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6n = isPlainObject(merged.oro6nEnablementRequestEvidence)
    ? merged.oro6nEnablementRequestEvidence
    : {};
  const oro6m = isPlainObject(merged.oro6mReadinessEvidence)
    ? merged.oro6mReadinessEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
      readBoolean(
        oro6n,
        "dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary",
        true
      ),
    oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed:
      readBoolean(
        oro6n,
        "oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed",
        true
      ),
    actualExternalCallExecutionEnablementRequestPreparedFromOro6n: readBoolean(
      oro6n,
      "actualExternalCallExecutionEnablementRequestPreparedFromOro6n",
      true
    ),
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6n: readBoolean(
      oro6n,
      "actualExternalCallExecutionEnablementRequestSubmittedFromOro6n",
      true
    ),
    actualExternalCallExecutionEnablementRequestStatusFromOro6n: readString(
      oro6n,
      "actualExternalCallExecutionEnablementRequestStatusFromOro6n",
      SUBMITTED_PENDING_ENABLEMENT_DECISION
    ),
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6n: readBoolean(
      oro6n,
      "actualExternalCallExecutionEnablementDecisionIssuedFromOro6n",
      false
    ),
    actualExternalCallExecutionEnablementDecisionStatusFromOro6n: readString(
      oro6n,
      "actualExternalCallExecutionEnablementDecisionStatusFromOro6n",
      PENDING
    ),
    actualExternalCallExecutionEnabledFromOro6n: readBoolean(
      oro6n,
      "actualExternalCallExecutionEnabledFromOro6n",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6n: readBoolean(
      oro6n,
      "actualExternalCallExecutionAuthorizedFromOro6n",
      false
    ),
    externalCallExecutionAuthorizedFromOro6n: readBoolean(
      oro6n,
      "externalCallExecutionAuthorizedFromOro6n",
      false
    ),
    externalCallExecutionPerformedFromOro6n: readBoolean(
      oro6n,
      "externalCallExecutionPerformedFromOro6n",
      false
    ),
    externalNetworkAllowedFromOro6n: readBoolean(
      oro6n,
      "externalNetworkAllowedFromOro6n",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6n: readBoolean(
      oro6n,
      "liveOroPlayApiCallAllowedFromOro6n",
      false
    ),
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
    liveExecutionReadinessGateStatusFromOro6m: readString(
      oro6m,
      "liveExecutionReadinessGateStatusFromOro6m",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionEnablementDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionEnablementDecisionPrepared",
      true
    ),
    actualExternalCallExecutionEnablementDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionEnablementDecisionIssued",
      true
    ),
    actualExternalCallExecutionEnablementDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionEnablementDecisionStatus",
      APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionEnablementDecisionScope: readString(
      decision,
      "actualExternalCallExecutionEnablementDecisionScope",
      FINAL_LIVE_EXECUTION_READINESS_ONLY
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
    nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate",
      true
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement",
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
    !fixture
      .dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary ||
    !fixture
      .oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed
  ) {
    blockers.push("ORO-6N enablement request boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionEnablementRequestPreparedFromOro6n ||
    !fixture.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n
  ) {
    blockers.push("ORO-6N enablement request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionEnablementRequestStatusFromOro6n !==
    SUBMITTED_PENDING_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6N enablement request status must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionEnablementDecisionIssuedFromOro6n ||
    fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6n !==
      PENDING
  ) {
    blockers.push("ORO-6N enablement decision must still be pending");
  }
  if (fixture.actualExternalCallExecutionEnabledFromOro6n) {
    blockers.push("ORO-6N must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6n ||
    fixture.externalCallExecutionAuthorizedFromOro6n
  ) {
    blockers.push("ORO-6N must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformedFromOro6n) {
    blockers.push("ORO-6N must not perform external call execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6n ||
    fixture.liveOroPlayApiCallAllowedFromOro6n
  ) {
    blockers.push("ORO-6N must still have no external network or live OroPlay call");
  }
  if (
    !fixture.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate ||
    !fixture.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed ||
    fixture.liveExecutionReadinessGateStatusFromOro6m !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
  ) {
    blockers.push("ORO-6M live execution readiness evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionEnablementDecisionPrepared ||
    !fixture.actualExternalCallExecutionEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionEnablementDecisionStatus !==
      APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionEnablementDecisionScope !==
      FINAL_LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6O decision must be final readiness-only");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6O must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6O must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6O must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate final readiness and runtime enablement");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during enablement decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during enablement decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during enablement decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during enablement decision");
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
    phase: ORO_6O_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionEnablementDecisionBoundaryResult:
      result,
    dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
      fixture
        .dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed:
      pass &&
      fixture.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed,
    actualExternalCallExecutionEnablementRequestPreparedFromOro6n:
      pass && fixture.actualExternalCallExecutionEnablementRequestPreparedFromOro6n,
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6n:
      pass && fixture.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n,
    actualExternalCallExecutionEnablementRequestStatusFromOro6n: pass
      ? fixture.actualExternalCallExecutionEnablementRequestStatusFromOro6n
      : HOLD,
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6n: false,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6n: PENDING,
    actualExternalCallExecutionEnabledFromOro6n: false,
    actualExternalCallExecutionAuthorizedFromOro6n: false,
    externalCallExecutionAuthorizedFromOro6n: false,
    externalCallExecutionPerformedFromOro6n: false,
    externalNetworkAllowedFromOro6n: false,
    liveOroPlayApiCallAllowedFromOro6n: false,
    dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate:
      fixture.dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
    oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed:
      pass &&
      fixture.oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed,
    liveExecutionReadinessGateStatusFromOro6m: pass
      ? fixture.liveExecutionReadinessGateStatusFromOro6m
      : HOLD,
    actualExternalCallExecutionEnablementDecisionPrepared:
      pass && fixture.actualExternalCallExecutionEnablementDecisionPrepared,
    actualExternalCallExecutionEnablementDecisionIssued:
      pass && fixture.actualExternalCallExecutionEnablementDecisionIssued,
    actualExternalCallExecutionEnablementDecisionStatus: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionStatus
      : HOLD,
    actualExternalCallExecutionEnablementDecisionScope: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionScope
      : HOLD,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate:
      pass && fixture.nextPhaseRequiresSeparateFinalLiveExecutionReadinessGate,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablement,
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

function validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
  input =
    buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6oActualExecutionEnablementDecisionSummary(input = {}) {
  return validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
    input
  );
}

function assertOro6oStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionEnabled ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6O still-no-external-call assertion failed");
  }
  return true;
}

function runOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryHarness(
  input
) {
  return validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6O_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
  FINAL_LIVE_EXECUTION_READINESS_ONLY,
  ORO_6O_ACTUAL_EXECUTION_ENABLEMENT_DECISION_STATUS,
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
  validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
  buildOro6oActualExecutionEnablementDecisionSummary,
  assertOro6oStillNoExternalCall,
  runOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryHarness,
};
