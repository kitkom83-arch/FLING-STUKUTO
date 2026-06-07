"use strict";

const {
  PASS: ORO6W_PASS,
  PENDING,
  SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
  validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
} = require("./oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary");

const {
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST,
} = require("./oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate");

const ORO_6X_PHASE = "ORO-6X";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY =
  "approved_for_live_execution_readiness_only";
const LIVE_EXECUTION_READINESS_ONLY = "live_execution_readiness_only";

const ORO_6X_LIVE_EXECUTION_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6X_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_LIVE_EXECUTION_DECISION,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
});

const BASELINE_ORO6W_SUMMARY =
  validateOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary(
    buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary()
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

function buildOro6wEvidenceFromSummary(summary) {
  return {
    dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary:
      true,
    oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed:
      summary.liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult ===
      ORO6W_PASS,
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionRequestPrepared === true,
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionRequestSubmitted === true,
    actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionRequestStatus,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionDecisionIssued === true,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionDecisionStatus,
    actualExternalCallExecutionLiveExecutionApprovedFromOro6w:
      summary.actualExternalCallExecutionLiveExecutionApproved === true,
    actualExternalCallExecutionActivatedFromOro6w:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6w:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6w:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6w:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6w:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6w:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6w: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6w:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6vEvidenceFromOro6wSummary(summary) {
  return {
    dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
      summary.dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate ===
      true,
    oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
      summary.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed ===
      true,
    activationFinalReadinessGateStatusFromOro6v:
      summary.activationFinalReadinessGateStatusFromOro6v,
  };
}

function buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture",
    phase: ORO_6X_PHASE,
    oro6wLiveExecutionRequestEvidence:
      buildOro6wEvidenceFromSummary(BASELINE_ORO6W_SUMMARY),
    oro6vActivationFinalReadinessEvidence:
      buildOro6vEvidenceFromOro6wSummary(BASELINE_ORO6W_SUMMARY),
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionLiveExecutionDecisionPrepared: true,
      actualExternalCallExecutionLiveExecutionDecisionIssued: true,
      actualExternalCallExecutionLiveExecutionDecisionStatus:
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionLiveExecutionDecisionScope:
        LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate:
        true,
      nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest:
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
    buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6w = isPlainObject(merged.oro6wLiveExecutionRequestEvidence)
    ? merged.oro6wLiveExecutionRequestEvidence
    : {};
  const oro6v = isPlainObject(merged.oro6vActivationFinalReadinessEvidence)
    ? merged.oro6vActivationFinalReadinessEvidence
    : {};
  const decision = isPlainObject(merged.liveExecutionDecisionEvidence)
    ? merged.liveExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary:
      readBoolean(
        oro6w,
        "dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary",
        true
      ),
    oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed:
      readBoolean(
        oro6w,
        "oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed",
        true
      ),
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w",
      true
    ),
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w",
      true
    ),
    actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w: readString(
      oro6w,
      "actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w",
      SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
    ),
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w",
      false
    ),
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w: readString(
      oro6w,
      "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w",
      PENDING
    ),
    actualExternalCallExecutionLiveExecutionApprovedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionLiveExecutionApprovedFromOro6w",
      false
    ),
    actualExternalCallExecutionActivatedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionActivatedFromOro6w",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionRuntimeEnabledFromOro6w",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionEnabledFromOro6w",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6w: readBoolean(
      oro6w,
      "actualExternalCallExecutionAuthorizedFromOro6w",
      false
    ),
    externalCallExecutionAuthorizedFromOro6w: readBoolean(
      oro6w,
      "externalCallExecutionAuthorizedFromOro6w",
      false
    ),
    externalCallExecutionPerformedFromOro6w: readBoolean(
      oro6w,
      "externalCallExecutionPerformedFromOro6w",
      false
    ),
    externalNetworkAllowedFromOro6w: readBoolean(
      oro6w,
      "externalNetworkAllowedFromOro6w",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6w: readBoolean(
      oro6w,
      "liveOroPlayApiCallAllowedFromOro6w",
      false
    ),
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
    activationFinalReadinessGateStatusFromOro6v: readString(
      oro6v,
      "activationFinalReadinessGateStatusFromOro6v",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
    ),
    actualExternalCallExecutionLiveExecutionDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecutionDecisionPrepared",
      true
    ),
    actualExternalCallExecutionLiveExecutionDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecutionDecisionIssued",
      true
    ),
    actualExternalCallExecutionLiveExecutionDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionLiveExecutionDecisionStatus",
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionLiveExecutionDecisionScope: readString(
      decision,
      "actualExternalCallExecutionLiveExecutionDecisionScope",
      LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      decision,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
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
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest",
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
      .dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary ||
    !fixture.oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed
  ) {
    blockers.push("ORO-6W live execution request boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w ||
    !fixture.actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w
  ) {
    blockers.push("ORO-6W live execution request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w !==
    SUBMITTED_PENDING_LIVE_EXECUTION_DECISION
  ) {
    blockers.push("ORO-6W live execution request status must be pending decision");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w !==
      PENDING ||
    fixture.actualExternalCallExecutionLiveExecutionApprovedFromOro6w
  ) {
    blockers.push("ORO-6W must still have pending decision and no live approval");
  }
  if (
    fixture.actualExternalCallExecutionActivatedFromOro6w ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6w ||
    fixture.actualExternalCallExecutionEnabledFromOro6w ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6w ||
    fixture.externalCallExecutionAuthorizedFromOro6w ||
    fixture.externalCallExecutionPerformedFromOro6w
  ) {
    blockers.push("ORO-6W must still have no activation, authorization, or execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6w ||
    fixture.liveOroPlayApiCallAllowedFromOro6w
  ) {
    blockers.push("ORO-6W must still have no external network or live OroPlay call");
  }
  if (
    !fixture.dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate ||
    !fixture.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed ||
    fixture.activationFinalReadinessGateStatusFromOro6v !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_LIVE_EXECUTION_REQUEST
  ) {
    blockers.push("ORO-6V activation final readiness evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionLiveExecutionDecisionPrepared ||
    !fixture.actualExternalCallExecutionLiveExecutionDecisionIssued ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatus !==
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionScope !==
      LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6X decision must be live-readiness-only");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6X must not approve, activate, enable, authorize, or execute");
  }
  if (
    !fixture
      .nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phases must require separate readiness and execution request");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live execution decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live execution decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live execution decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live execution decision");
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
    phase: ORO_6X_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryResult:
      result,
    dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary:
      fixture
        .dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
    oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed:
      pass &&
      fixture.oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed,
    actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w:
      pass && fixture.actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6w,
    actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w:
      pass && fixture.actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w,
    actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w: pass
      ? fixture.actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w
      : HOLD,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w: false,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6w: PENDING,
    actualExternalCallExecutionLiveExecutionApprovedFromOro6w: false,
    actualExternalCallExecutionActivatedFromOro6w: false,
    actualExternalCallExecutionRuntimeEnabledFromOro6w: false,
    actualExternalCallExecutionEnabledFromOro6w: false,
    actualExternalCallExecutionAuthorizedFromOro6w: false,
    externalCallExecutionAuthorizedFromOro6w: false,
    externalCallExecutionPerformedFromOro6w: false,
    externalNetworkAllowedFromOro6w: false,
    liveOroPlayApiCallAllowedFromOro6w: false,
    dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
      fixture
        .dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
    oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
      pass &&
      fixture.oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed,
    activationFinalReadinessGateStatusFromOro6v: pass
      ? fixture.activationFinalReadinessGateStatusFromOro6v
      : HOLD,
    actualExternalCallExecutionLiveExecutionDecisionPrepared:
      pass && fixture.actualExternalCallExecutionLiveExecutionDecisionPrepared,
    actualExternalCallExecutionLiveExecutionDecisionIssued:
      pass && fixture.actualExternalCallExecutionLiveExecutionDecisionIssued,
    actualExternalCallExecutionLiveExecutionDecisionStatus: pass
      ? fixture.actualExternalCallExecutionLiveExecutionDecisionStatus
      : HOLD,
    actualExternalCallExecutionLiveExecutionDecisionScope: pass
      ? fixture.actualExternalCallExecutionLiveExecutionDecisionScope
      : HOLD,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate:
      pass &&
      fixture
        .nextPhaseRequiresSeparateActualExternalCallExecutionLiveExecutionFinalReadinessGate,
    nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest,
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

function validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
  input = buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6xLiveExecutionDecisionSummary(input = {}) {
  return validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
    input
  );
}

function assertOro6xStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
        summary
      );
  if (
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
    throw new Error("ORO-6X still-no-external-call assertion failed");
  }
  return true;
}

function runOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryHarness(
  input
) {
  return validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6X_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  ORO_6X_LIVE_EXECUTION_DECISION_STATUS,
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
  validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
  buildOro6xLiveExecutionDecisionSummary,
  assertOro6xStillNoExternalCall,
  runOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryHarness,
};
