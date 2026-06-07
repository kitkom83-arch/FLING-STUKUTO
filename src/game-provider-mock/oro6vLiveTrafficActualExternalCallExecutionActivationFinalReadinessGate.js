"use strict";

const {
  PASS: ORO6U_PASS,
  HOLD,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ACTIVATION_READINESS_ONLY,
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
  validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
} = require("./oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const ORO_6V_PHASE = "ORO-6V";
const PASS = "PASS";
const NOT_REQUESTED = "not_requested";
const SUBMITTED_PENDING_ACTIVATION_DECISION =
  "submitted_pending_activation_decision";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST =
  "ready_for_separate_actual_external_call_execution_live_execution_request";

const ORO_6V_ACTIVATION_FINAL_READINESS_STATUS = Object.freeze({
  PHASE: ORO_6V_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  APPROVED_FOR_ACTIVATION_READINESS_ONLY,
  ACTIVATION_READINESS_ONLY,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
});

const BASELINE_ORO6U_SUMMARY =
  validateOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary(
    buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary()
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

function buildOro6uEvidenceFromSummary(summary) {
  return {
    dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      true,
    oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
      summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult ===
      ORO6U_PASS,
    actualExternalCallExecutionActivationDecisionPreparedFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionPrepared === true,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionIssued === true,
    actualExternalCallExecutionActivationDecisionStatusFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionStatus,
    actualExternalCallExecutionActivationDecisionScopeFromOro6u:
      summary.actualExternalCallExecutionActivationDecisionScope,
    actualExternalCallExecutionActivatedFromOro6u:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6u:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6u:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6u:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6u:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6u:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6u: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6u:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6tEvidenceFromOro6uSummary(summary) {
  return {
    dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      summary.dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary ===
      true,
    oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
      summary.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed ===
      true,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6t:
      summary.actualExternalCallExecutionActivationRequestSubmittedFromOro6t ===
      true,
    actualExternalCallExecutionActivationRequestStatusFromOro6t:
      summary.actualExternalCallExecutionActivationRequestStatusFromOro6t,
  };
}

function buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture",
    phase: ORO_6V_PHASE,
    oro6uActivationDecisionEvidence:
      buildOro6uEvidenceFromSummary(BASELINE_ORO6U_SUMMARY),
    oro6tActivationRequestEvidence:
      buildOro6tEvidenceFromOro6uSummary(BASELINE_ORO6U_SUMMARY),
    activationFinalReadinessGateEvidence: {
      activationFinalReadinessGatePrepared: true,
      activationFinalReadinessGateEvaluated: true,
      activationFinalReadinessGatePassed: true,
      activationFinalReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
    },
    liveExecutionEvidence: {
      actualExternalCallExecutionLiveExecutionRequestPrepared: false,
      actualExternalCallExecutionLiveExecutionRequestSubmitted: false,
      actualExternalCallExecutionLiveExecutionDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionDecisionStatus: NOT_REQUESTED,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
        true,
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
    buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const oro6u = isPlainObject(merged.oro6uActivationDecisionEvidence)
    ? merged.oro6uActivationDecisionEvidence
    : {};
  const oro6t = isPlainObject(merged.oro6tActivationRequestEvidence)
    ? merged.oro6tActivationRequestEvidence
    : {};
  const gate = isPlainObject(merged.activationFinalReadinessGateEvidence)
    ? merged.activationFinalReadinessGateEvidence
    : {};
  const live = isPlainObject(merged.liveExecutionEvidence)
    ? merged.liveExecutionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    actualExternalCallExecutionActivationDecisionPreparedFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionActivationDecisionPreparedFromOro6u",
      true
    ),
    actualExternalCallExecutionActivationDecisionIssuedFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionActivationDecisionIssuedFromOro6u",
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
    actualExternalCallExecutionActivatedFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionActivatedFromOro6u",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionRuntimeEnabledFromOro6u",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionEnabledFromOro6u",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6u: readBoolean(
      oro6u,
      "actualExternalCallExecutionAuthorizedFromOro6u",
      false
    ),
    externalCallExecutionAuthorizedFromOro6u: readBoolean(
      oro6u,
      "externalCallExecutionAuthorizedFromOro6u",
      false
    ),
    externalCallExecutionPerformedFromOro6u: readBoolean(
      oro6u,
      "externalCallExecutionPerformedFromOro6u",
      false
    ),
    externalNetworkAllowedFromOro6u: readBoolean(
      oro6u,
      "externalNetworkAllowedFromOro6u",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6u: readBoolean(
      oro6u,
      "liveOroPlayApiCallAllowedFromOro6u",
      false
    ),
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
    activationFinalReadinessGatePrepared: readBoolean(
      gate,
      "activationFinalReadinessGatePrepared",
      true
    ),
    activationFinalReadinessGateEvaluated: readBoolean(
      gate,
      "activationFinalReadinessGateEvaluated",
      true
    ),
    activationFinalReadinessGatePassed: readBoolean(
      gate,
      "activationFinalReadinessGatePassed",
      true
    ),
    activationFinalReadinessGateStatus: readString(
      gate,
      "activationFinalReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
    ),
    actualExternalCallExecutionLiveExecutionRequestPrepared: readBoolean(
      live,
      "actualExternalCallExecutionLiveExecutionRequestPrepared",
      false
    ),
    actualExternalCallExecutionLiveExecutionRequestSubmitted: readBoolean(
      live,
      "actualExternalCallExecutionLiveExecutionRequestSubmitted",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionIssued: readBoolean(
      live,
      "actualExternalCallExecutionLiveExecutionDecisionIssued",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionStatus: readString(
      live,
      "actualExternalCallExecutionLiveExecutionDecisionStatus",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      live,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
    ),
    actualExternalCallExecutionActivated: readBoolean(
      live,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      live,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      live,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      live,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionAuthorized: readBoolean(
      live,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      live,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
      readBoolean(
        live,
        "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision:
      readBoolean(
        live,
        "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      live,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      live,
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
      .dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary ||
    !fixture.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed
  ) {
    blockers.push("ORO-6U activation decision boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionActivationDecisionPreparedFromOro6u ||
    !fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro6u
  ) {
    blockers.push("ORO-6U activation decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6u !==
    APPROVED_FOR_ACTIVATION_READINESS_ONLY
  ) {
    blockers.push("ORO-6U decision status must be activation-readiness-only approved");
  }
  if (
    fixture.actualExternalCallExecutionActivationDecisionScopeFromOro6u !==
    ACTIVATION_READINESS_ONLY
  ) {
    blockers.push("ORO-6U decision scope must be activation readiness only");
  }
  if (
    fixture.actualExternalCallExecutionActivatedFromOro6u ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6u ||
    fixture.actualExternalCallExecutionEnabledFromOro6u ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6u ||
    fixture.externalCallExecutionAuthorizedFromOro6u ||
    fixture.externalCallExecutionPerformedFromOro6u
  ) {
    blockers.push("ORO-6U must still have no activation, authorization, or execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6u ||
    fixture.liveOroPlayApiCallAllowedFromOro6u
  ) {
    blockers.push("ORO-6U must still have no external network or live OroPlay call");
  }
  if (
    !fixture.dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary ||
    !fixture.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed ||
    !fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro6t ||
    fixture.actualExternalCallExecutionActivationRequestStatusFromOro6t !==
      SUBMITTED_PENDING_ACTIVATION_DECISION
  ) {
    blockers.push("ORO-6T submitted activation request evidence is required");
  }
  if (
    !fixture.activationFinalReadinessGatePrepared ||
    !fixture.activationFinalReadinessGateEvaluated ||
    !fixture.activationFinalReadinessGatePassed ||
    fixture.activationFinalReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  ) {
    blockers.push("ORO-6V activation final readiness gate must pass for live execution request");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionRequestPrepared ||
    fixture.actualExternalCallExecutionLiveExecutionRequestSubmitted ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionIssued ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatus !== NOT_REQUESTED ||
    fixture.actualExternalCallExecutionLiveExecutionApproved
  ) {
    blockers.push("ORO-6V must not prepare, submit, decide, or approve live execution");
  }
  if (
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6V must not activate, enable, authorize, or perform execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate live execution request and decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during activation final readiness");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during activation final readiness");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during activation final readiness");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during activation final readiness");
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
    phase: ORO_6V_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActivationFinalReadinessGateResult:
      result,
    dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      fixture
        .dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
      pass &&
      fixture.oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed,
    actualExternalCallExecutionActivationDecisionPreparedFromOro6u:
      pass &&
      fixture.actualExternalCallExecutionActivationDecisionPreparedFromOro6u,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6u:
      pass && fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro6u,
    actualExternalCallExecutionActivationDecisionStatusFromOro6u: pass
      ? fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6u
      : HOLD,
    actualExternalCallExecutionActivationDecisionScopeFromOro6u: pass
      ? fixture.actualExternalCallExecutionActivationDecisionScopeFromOro6u
      : HOLD,
    actualExternalCallExecutionActivatedFromOro6u: false,
    actualExternalCallExecutionRuntimeEnabledFromOro6u: false,
    actualExternalCallExecutionEnabledFromOro6u: false,
    actualExternalCallExecutionAuthorizedFromOro6u: false,
    externalCallExecutionAuthorizedFromOro6u: false,
    externalCallExecutionPerformedFromOro6u: false,
    externalNetworkAllowedFromOro6u: false,
    liveOroPlayApiCallAllowedFromOro6u: false,
    dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      fixture
        .dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
      pass &&
      fixture.oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6t:
      pass && fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro6t,
    actualExternalCallExecutionActivationRequestStatusFromOro6t: pass
      ? fixture.actualExternalCallExecutionActivationRequestStatusFromOro6t
      : HOLD,
    activationFinalReadinessGatePrepared:
      pass && fixture.activationFinalReadinessGatePrepared,
    activationFinalReadinessGateEvaluated:
      pass && fixture.activationFinalReadinessGateEvaluated,
    activationFinalReadinessGatePassed:
      pass && fixture.activationFinalReadinessGatePassed,
    activationFinalReadinessGateStatus: pass
      ? fixture.activationFinalReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionLiveExecutionRequestPrepared: false,
    actualExternalCallExecutionLiveExecutionRequestSubmitted: false,
    actualExternalCallExecutionLiveExecutionDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionDecisionStatus: NOT_REQUESTED,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionRequest,
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

function validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
  input = buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6vActivationFinalReadinessSummary(input = {}) {
  return validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
    input
  );
}

function assertOro6vStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
        summary
      );
  if (
    report.actualExternalCallExecutionLiveExecutionRequestSubmitted ||
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
    throw new Error("ORO-6V still-no-external-call assertion failed");
  }
  return true;
}

function runOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateHarness(
  input
) {
  return validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate(
    input
  );
}

module.exports = {
  ORO_6V_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
  ORO_6V_ACTIVATION_FINAL_READINESS_STATUS,
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
  validateOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
  buildOro6vActivationFinalReadinessSummary,
  assertOro6vStillNoExternalCall,
  runOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateHarness,
};
