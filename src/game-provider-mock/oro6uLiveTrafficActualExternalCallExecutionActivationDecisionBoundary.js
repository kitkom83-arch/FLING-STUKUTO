"use strict";

const {
  PASS: ORO6T_PASS,
  HOLD,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  buildOro6tActivationRequestSummary,
} = require("./oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary");

const ORO_6U_PHASE = "ORO-6U";
const PASS = "PASS";
const PENDING = "pending";
const APPROVED_FOR_ACTIVATION_READINESS_ONLY =
  "approved_for_activation_readiness_only";
const ACTIVATION_READINESS_ONLY = "activation_readiness_only";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_activation_request";

const ORO_6U_ACTIVATION_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6U_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ACTIVATION_READINESS_ONLY,
});

const BASELINE_ORO6T_SUMMARY = buildOro6tActivationRequestSummary();

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

function buildOro6tEvidenceFromSummary(summary) {
  return {
    dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      true,
    oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
      summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult ===
      ORO6T_PASS,
    actualExternalCallExecutionActivationRequestPreparedFromOro6t:
      summary.actualExternalCallExecutionActivationRequestPrepared === true,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6t:
      summary.actualExternalCallExecutionActivationRequestSubmitted === true,
    actualExternalCallExecutionActivationRequestStatusFromOro6t:
      summary.actualExternalCallExecutionActivationRequestStatus,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6t:
      summary.actualExternalCallExecutionActivationDecisionIssued === true,
    actualExternalCallExecutionActivationDecisionStatusFromOro6t:
      summary.actualExternalCallExecutionActivationDecisionStatus,
    actualExternalCallExecutionActivatedFromOro6t:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6t:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6t:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6t:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6t:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6t:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6t: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6t:
      summary.liveOroPlayApiCallAllowed === true,
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      summary.dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate ===
      true,
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      summary.oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed ===
      true,
    runtimeFinalReadinessGateStatusFromOro6s:
      summary.runtimeFinalReadinessGateStatusFromOro6s,
  };
}

function buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture",
    phase: ORO_6U_PHASE,
    oro6tActivationRequestEvidence:
      buildOro6tEvidenceFromSummary(BASELINE_ORO6T_SUMMARY),
    activationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionPrepared: true,
      actualExternalCallExecutionActivationDecisionIssued: true,
      actualExternalCallExecutionActivationDecisionStatus:
        APPROVED_FOR_ACTIVATION_READINESS_ONLY,
      actualExternalCallExecutionActivationDecisionScope:
        ACTIVATION_READINESS_ONLY,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate:
        true,
      nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
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
      secretsLeaked: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6t = isPlainObject(merged.oro6tActivationRequestEvidence)
    ? merged.oro6tActivationRequestEvidence
    : {};
  const decision = isPlainObject(merged.activationDecisionEvidence)
    ? merged.activationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      readBoolean(
        oro6t,
        "dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary",
        true
      ),
    oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
      readBoolean(
        oro6t,
        "oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed",
        true
      ),
    actualExternalCallExecutionActivationRequestPreparedFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionActivationRequestPreparedFromOro6t",
      true
    ),
    actualExternalCallExecutionActivationRequestSubmittedFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionActivationRequestSubmittedFromOro6t",
      true
    ),
    actualExternalCallExecutionActivationRequestStatusFromOro6t: readString(
      oro6t,
      "actualExternalCallExecutionActivationRequestStatusFromOro6t",
      SUBMITTED_PENDING_ACTIVATION_DECISION
    ),
    actualExternalCallExecutionActivationDecisionIssuedFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionActivationDecisionIssuedFromOro6t",
      false
    ),
    actualExternalCallExecutionActivationDecisionStatusFromOro6t: readString(
      oro6t,
      "actualExternalCallExecutionActivationDecisionStatusFromOro6t",
      PENDING
    ),
    actualExternalCallExecutionActivatedFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionActivatedFromOro6t",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionRuntimeEnabledFromOro6t",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionEnabledFromOro6t",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6t: readBoolean(
      oro6t,
      "actualExternalCallExecutionAuthorizedFromOro6t",
      false
    ),
    externalCallExecutionAuthorizedFromOro6t: readBoolean(
      oro6t,
      "externalCallExecutionAuthorizedFromOro6t",
      false
    ),
    externalCallExecutionPerformedFromOro6t: readBoolean(
      oro6t,
      "externalCallExecutionPerformedFromOro6t",
      false
    ),
    externalNetworkAllowedFromOro6t: readBoolean(
      oro6t,
      "externalNetworkAllowedFromOro6t",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6t: readBoolean(
      oro6t,
      "liveOroPlayApiCallAllowedFromOro6t",
      false
    ),
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      readBoolean(
        oro6t,
        "dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate",
        true
      ),
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      readBoolean(
        oro6t,
        "oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed",
        true
      ),
    runtimeFinalReadinessGateStatusFromOro6s: readString(
      oro6t,
      "runtimeFinalReadinessGateStatusFromOro6s",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
    ),
    actualExternalCallExecutionActivationDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionActivationDecisionPrepared",
      true
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionActivationDecisionIssued",
      true
    ),
    actualExternalCallExecutionActivationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionActivationDecisionStatus",
      APPROVED_FOR_ACTIVATION_READINESS_ONLY
    ),
    actualExternalCallExecutionActivationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionActivationDecisionScope",
      ACTIVATION_READINESS_ONLY
    ),
    actualExternalCallExecutionActivated: readBoolean(
      decision,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnabled",
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
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest",
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
      .dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary ||
    !fixture.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed
  ) {
    blockers.push("ORO-6T activation request boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionActivationRequestPreparedFromOro6t ||
    !fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro6t
  ) {
    blockers.push("ORO-6T activation request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionActivationRequestStatusFromOro6t !==
    SUBMITTED_PENDING_ACTIVATION_DECISION
  ) {
    blockers.push("ORO-6T activation request status must be submitted pending activation decision");
  }
  if (
    fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro6t ||
    fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6t !==
      PENDING
  ) {
    blockers.push("ORO-6T activation decision must still be pending");
  }
  if (
    fixture.actualExternalCallExecutionActivatedFromOro6t ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6t ||
    fixture.actualExternalCallExecutionEnabledFromOro6t ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6t ||
    fixture.externalCallExecutionAuthorizedFromOro6t ||
    fixture.externalCallExecutionPerformedFromOro6t
  ) {
    blockers.push("ORO-6T must not activate, enable, authorize, or perform execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6t ||
    fixture.liveOroPlayApiCallAllowedFromOro6t
  ) {
    blockers.push("ORO-6T must still have no external network or live OroPlay call");
  }
  if (
    !fixture
      .dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate ||
    !fixture.oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed ||
    fixture.runtimeFinalReadinessGateStatusFromOro6s !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  ) {
    blockers.push("ORO-6S runtime final readiness gate evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionActivationDecisionPrepared ||
    !fixture.actualExternalCallExecutionActivationDecisionIssued ||
    fixture.actualExternalCallExecutionActivationDecisionStatus !==
      APPROVED_FOR_ACTIVATION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionActivationDecisionScope !==
      ACTIVATION_READINESS_ONLY
  ) {
    blockers.push("activation decision must be issued for activation readiness only");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("ORO-6U must not activate actual external call execution");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6U must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6U must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6U must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6U must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate activation final readiness and live execution request");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during activation decision boundary");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during activation decision boundary");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during activation decision boundary");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during activation decision boundary");
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
    phase: ORO_6U_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult:
      result,
    dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      fixture
        .dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
      pass &&
      fixture.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed,
    actualExternalCallExecutionActivationRequestPreparedFromOro6t:
      pass && fixture.actualExternalCallExecutionActivationRequestPreparedFromOro6t,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6t:
      pass && fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro6t,
    actualExternalCallExecutionActivationRequestStatusFromOro6t: pass
      ? fixture.actualExternalCallExecutionActivationRequestStatusFromOro6t
      : HOLD,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6t: false,
    actualExternalCallExecutionActivationDecisionStatusFromOro6t: PENDING,
    actualExternalCallExecutionActivatedFromOro6t: false,
    actualExternalCallExecutionRuntimeEnabledFromOro6t: false,
    actualExternalCallExecutionEnabledFromOro6t: false,
    actualExternalCallExecutionAuthorizedFromOro6t: false,
    externalCallExecutionAuthorizedFromOro6t: false,
    externalCallExecutionPerformedFromOro6t: false,
    externalNetworkAllowedFromOro6t: false,
    liveOroPlayApiCallAllowedFromOro6t: false,
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      fixture
        .dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      pass &&
      fixture.oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed,
    runtimeFinalReadinessGateStatusFromOro6s: pass
      ? fixture.runtimeFinalReadinessGateStatusFromOro6s
      : HOLD,
    actualExternalCallExecutionActivationDecisionPrepared:
      pass && fixture.actualExternalCallExecutionActivationDecisionPrepared,
    actualExternalCallExecutionActivationDecisionIssued:
      pass && fixture.actualExternalCallExecutionActivationDecisionIssued,
    actualExternalCallExecutionActivationDecisionStatus: pass
      ? fixture.actualExternalCallExecutionActivationDecisionStatus
      : HOLD,
    actualExternalCallExecutionActivationDecisionScope: pass
      ? fixture.actualExternalCallExecutionActivationDecisionScope
      : HOLD,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationFinalReadinessGate,
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest,
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

function validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
  input = buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6uActivationDecisionSummary(input = {}) {
  return validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
    input
  );
}

function assertOro6uStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionActivated ||
    report.actualExternalCallExecutionRuntimeEnabled ||
    report.actualExternalCallExecutionEnabled ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6U still-no-external-call assertion failed");
  }
  return true;
}

function runOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryHarness(
  input
) {
  return validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6U_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ACTIVATION_READINESS_ONLY,
  ORO_6U_ACTIVATION_DECISION_STATUS,
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
  validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
  buildOro6uActivationDecisionSummary,
  assertOro6uStillNoExternalCall,
  runOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryHarness,
};
