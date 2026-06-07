"use strict";

const {
  PASS: ORO6V_PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
  validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
} = require("./oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate");

const {
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ACTIVATION_READINESS_ONLY,
} = require("./oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const ORO_6W_PHASE = "ORO-6W";
const PASS = "PASS";
const PENDING = "pending";
const SUBMITTED_PENDING_LIVE_EXECUTION_DECISION =
  "submitted_pending_live_execution_decision";

const ORO_6W_LIVE_EXECUTION_REQUEST_STATUS = Object.freeze({
  PHASE: ORO_6W_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
});

const BASELINE_ORO6V_SUMMARY =
  validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
    buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate()
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

function buildOro6vEvidenceFromSummary(summary) {
  return {
    dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
      true,
    oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionActivationFinalReadinessGateResult ===
      ORO6V_PASS,
    activationFinalReadinessGatePreparedFromOro6v:
      summary.activationFinalReadinessGatePrepared === true,
    activationFinalReadinessGateEvaluatedFromOro6v:
      summary.activationFinalReadinessGateEvaluated === true,
    activationFinalReadinessGatePassedFromOro6v:
      summary.activationFinalReadinessGatePassed === true,
    activationFinalReadinessGateStatusFromOro6v:
      summary.activationFinalReadinessGateStatus,
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v:
      summary.actualExternalCallExecutionLiveExecutionRequestPrepared === true,
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v:
      summary.actualExternalCallExecutionLiveExecutionRequestSubmitted === true,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v:
      summary.actualExternalCallExecutionLiveExecutionDecisionIssued === true,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v:
      summary.actualExternalCallExecutionLiveExecutionDecisionStatus,
    actualExternalCallExecutionLiveExecutionApprovedFromOro6v:
      summary.actualExternalCallExecutionLiveExecutionApproved === true,
    actualExternalCallExecutionActivatedFromOro6v:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6v:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6v:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6v:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6v:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6v:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6v: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6v:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6uEvidenceFromOro6vSummary(summary) {
  return {
    dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      summary.dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary ===
      true,
    oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
      summary.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed ===
      true,
    actualExternalCallExecutionActivationDecisionStatusFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionStatusFromOro6u,
    actualExternalCallExecutionActivationDecisionScopeFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionScopeFromOro6u,
  };
}

function buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture",
    phase: ORO_6W_PHASE,
    oro6vActivationFinalReadinessEvidence:
      buildOro6vEvidenceFromSummary(BASELINE_ORO6V_SUMMARY),
    oro6uActivationDecisionEvidence:
      buildOro6uEvidenceFromOro6vSummary(BASELINE_ORO6V_SUMMARY),
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionRequestPrepared: true,
      actualExternalCallExecutionLiveExecutionRequestSubmitted: true,
      actualExternalCallExecutionLiveExecutionRequestStatus:
        SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
      actualExternalCallExecutionLiveExecutionDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionDecisionStatus: PENDING,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision:
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
    buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro6v = isPlainObject(merged.oro6vActivationFinalReadinessEvidence)
    ? merged.oro6vActivationFinalReadinessEvidence
    : {};
  const oro6u = isPlainObject(merged.oro6uActivationDecisionEvidence)
    ? merged.oro6uActivationDecisionEvidence
    : {};
  const request = isPlainObject(merged.liveExecutionRequestEvidence)
    ? merged.liveExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
      readBoolean(
        oro6v,
        "dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate",
        true
      ),
    oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
      readBoolean(
        oro6v,
        "oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed",
        true
      ),
    activationFinalReadinessGatePreparedFromOro6v: readBoolean(
      oro6v,
      "activationFinalReadinessGatePreparedFromOro6v",
      true
    ),
    activationFinalReadinessGateEvaluatedFromOro6v: readBoolean(
      oro6v,
      "activationFinalReadinessGateEvaluatedFromOro6v",
      true
    ),
    activationFinalReadinessGatePassedFromOro6v: readBoolean(
      oro6v,
      "activationFinalReadinessGatePassedFromOro6v",
      true
    ),
    activationFinalReadinessGateStatusFromOro6v: readString(
      oro6v,
      "activationFinalReadinessGateStatusFromOro6v",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
    ),
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v",
      false
    ),
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v: readString(
      oro6v,
      "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionLiveExecutionApprovedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionLiveExecutionApprovedFromOro6v",
      false
    ),
    actualExternalCallExecutionActivatedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionActivatedFromOro6v",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionRuntimeEnabledFromOro6v",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionEnabledFromOro6v",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6v: readBoolean(
      oro6v,
      "actualExternalCallExecutionAuthorizedFromOro6v",
      false
    ),
    externalCallExecutionAuthorizedFromOro6v: readBoolean(
      oro6v,
      "externalCallExecutionAuthorizedFromOro6v",
      false
    ),
    externalCallExecutionPerformedFromOro6v: readBoolean(
      oro6v,
      "externalCallExecutionPerformedFromOro6v",
      false
    ),
    externalNetworkAllowedFromOro6v: readBoolean(
      oro6v,
      "externalNetworkAllowedFromOro6v",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6v: readBoolean(
      oro6v,
      "liveOroPlayApiCallAllowedFromOro6v",
      false
    ),
    dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      readBoolean(
        oro6u,
        "dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary",
        true
      ),
    oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
      readBoolean(
        oro6u,
        "oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed",
        true
      ),
    actualExternalCallExecutionActivationDecisionStatusFromOro6u: readString(
      oro6u,
      "actualExternalCallExecutionActivationDecisionStatusFromOro6u",
      APPROVED_FOR_ACTIVATION_READINESS_ONLY
    ),
    actualExternalCallExecutionActivationDecisionScopeFromOro6u: readString(
      oro6u,
      "actualExternalCallExecutionActivationDecisionScopeFromOro6u",
      ACTIVATION_READINESS_ONLY
    ),
    actualExternalCallExecutionLiveExecutionRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecutionRequestPrepared",
      true
    ),
    actualExternalCallExecutionLiveExecutionRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecutionRequestSubmitted",
      true
    ),
    actualExternalCallExecutionLiveExecutionRequestStatus: readString(
      request,
      "actualExternalCallExecutionLiveExecutionRequestStatus",
      SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
    ),
    actualExternalCallExecutionLiveExecutionDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecutionDecisionIssued",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionStatus: readString(
      request,
      "actualExternalCallExecutionLiveExecutionDecisionStatus",
      PENDING
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      request,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      request,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnabled",
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
    externalCallExecutionAuthorized: readBoolean(
      request,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      request,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision",
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
      .dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate ||
    !fixture.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed
  ) {
    blockers.push("ORO-6V activation final readiness gate is required");
  }
  if (
    !fixture.activationFinalReadinessGatePreparedFromOro6v ||
    !fixture.activationFinalReadinessGateEvaluatedFromOro6v ||
    !fixture.activationFinalReadinessGatePassedFromOro6v
  ) {
    blockers.push("ORO-6V activation final readiness gate must be passed");
  }
  if (
    fixture.activationFinalReadinessGateStatusFromOro6v !==
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  ) {
    blockers.push("ORO-6V readiness status must allow separate live execution request");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v ||
    fixture.actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v !==
      NOT_REQUESTED ||
    fixture.actualExternalCallExecutionLiveExecutionApprovedFromOro6v
  ) {
    blockers.push("ORO-6V must not already submit or decide live execution");
  }
  if (
    fixture.actualExternalCallExecutionActivatedFromOro6v ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6v ||
    fixture.actualExternalCallExecutionEnabledFromOro6v ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6v ||
    fixture.externalCallExecutionAuthorizedFromOro6v ||
    fixture.externalCallExecutionPerformedFromOro6v
  ) {
    blockers.push("ORO-6V must still have no activation, authorization, or execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6v ||
    fixture.liveOroPlayApiCallAllowedFromOro6v
  ) {
    blockers.push("ORO-6V must still have no external network or live OroPlay call");
  }
  if (
    !fixture.dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary ||
    !fixture.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed ||
    fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6u !==
      APPROVED_FOR_ACTIVATION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionActivationDecisionScopeFromOro6u !==
      ACTIVATION_READINESS_ONLY
  ) {
    blockers.push("ORO-6U activation-readiness-only decision evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionLiveExecutionRequestPrepared ||
    !fixture.actualExternalCallExecutionLiveExecutionRequestSubmitted ||
    fixture.actualExternalCallExecutionLiveExecutionRequestStatus !==
      SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
  ) {
    blockers.push("ORO-6W live execution request must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionDecisionIssued ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatus !== PENDING ||
    fixture.actualExternalCallExecutionLiveExecutionApproved
  ) {
    blockers.push("ORO-6W must not issue decision or approve live execution");
  }
  if (
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6W must not activate, enable, authorize, or perform execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate live execution decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live execution request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live execution request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live execution request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live execution request");
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
    phase: ORO_6W_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult:
      result,
    dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
      fixture
        .dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
      pass &&
      fixture
        .oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed,
    activationFinalReadinessGatePreparedFromOro6v:
      pass && fixture.activationFinalReadinessGatePreparedFromOro6v,
    activationFinalReadinessGateEvaluatedFromOro6v:
      pass && fixture.activationFinalReadinessGateEvaluatedFromOro6v,
    activationFinalReadinessGatePassedFromOro6v:
      pass && fixture.activationFinalReadinessGatePassedFromOro6v,
    activationFinalReadinessGateStatusFromOro6v: pass
      ? fixture.activationFinalReadinessGateStatusFromOro6v
      : HOLD,
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v: false,
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v: false,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v: false,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v:
      NOT_REQUESTED,
    actualExternalCallExecutionLiveExecutionApprovedFromOro6v: false,
    actualExternalCallExecutionActivatedFromOro6v: false,
    actualExternalCallExecutionRuntimeEnabledFromOro6v: false,
    actualExternalCallExecutionEnabledFromOro6v: false,
    actualExternalCallExecutionAuthorizedFromOro6v: false,
    externalCallExecutionAuthorizedFromOro6v: false,
    externalCallExecutionPerformedFromOro6v: false,
    externalNetworkAllowedFromOro6v: false,
    liveOroPlayApiCallAllowedFromOro6v: false,
    dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      fixture
        .dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
      pass &&
      fixture.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed,
    actualExternalCallExecutionActivationDecisionStatusFromOro6u: pass
      ? fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6u
      : HOLD,
    actualExternalCallExecutionActivationDecisionScopeFromOro6u: pass
      ? fixture.actualExternalCallExecutionActivationDecisionScopeFromOro6u
      : HOLD,
    actualExternalCallExecutionLiveExecutionRequestPrepared:
      pass && fixture.actualExternalCallExecutionLiveExecutionRequestPrepared,
    actualExternalCallExecutionLiveExecutionRequestSubmitted:
      pass && fixture.actualExternalCallExecutionLiveExecutionRequestSubmitted,
    actualExternalCallExecutionLiveExecutionRequestStatus: pass
      ? fixture.actualExternalCallExecutionLiveExecutionRequestStatus
      : HOLD,
    actualExternalCallExecutionLiveExecutionDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionDecisionStatus: PENDING,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision,
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

function validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
  input = buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6wLiveExecutionRequestSummary(input = {}) {
  return validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
    input
  );
}

function assertOro6wStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionLiveExecutionDecisionIssued ||
    report.actualExternalCallExecutionLiveExecutionApproved ||
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
    throw new Error("ORO-6W still-no-external-call assertion failed");
  }
  return true;
}

function runOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryHarness(
  input
) {
  return validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
    input
  );
}

module.exports = {
  ORO_6W_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
  ORO_6W_LIVE_EXECUTION_REQUEST_STATUS,
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
  validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
  buildOro6wLiveExecutionRequestSummary,
  assertOro6wStillNoExternalCall,
  runOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryHarness,
};
