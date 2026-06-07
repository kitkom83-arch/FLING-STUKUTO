"use strict";

const {
  PASS: ORO6S_PASS,
  HOLD,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
  buildOro6sRuntimeFinalReadinessSummary,
} = require("./oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate");

const ORO_6T_PHASE = "ORO-6T";
const PASS = "PASS";
const PENDING = "pending";
const SUBMITTED_PENDING_ACTIVATION_DECISION =
  "submitted_pending_activation_decision";
const APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY =
  "approved_for_runtime_execution_readiness_only";
const RUNTIME_EXECUTION_READINESS_ONLY = "runtime_execution_readiness_only";
const NOT_REQUESTED = "not_requested";

const ORO_6T_ACTIVATION_REQUEST_STATUS = Object.freeze({
  PHASE: ORO_6T_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
});

const BASELINE_ORO6S_SUMMARY = buildOro6sRuntimeFinalReadinessSummary();

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

function buildOro6sEvidenceFromSummary(summary) {
  return {
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      true,
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateResult ===
      ORO6S_PASS,
    runtimeFinalReadinessGatePreparedFromOro6s:
      summary.runtimeFinalReadinessGatePrepared === true,
    runtimeFinalReadinessGateEvaluatedFromOro6s:
      summary.runtimeFinalReadinessGateEvaluated === true,
    runtimeFinalReadinessGatePassedFromOro6s:
      summary.runtimeFinalReadinessGatePassed === true,
    runtimeFinalReadinessGateStatusFromOro6s:
      summary.runtimeFinalReadinessGateStatus,
    actualExternalCallExecutionActivationRequestPreparedFromOro6s:
      summary.actualExternalCallExecutionActivationRequestPrepared === true,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6s:
      summary.actualExternalCallExecutionActivationRequestSubmitted === true,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6s:
      summary.actualExternalCallExecutionActivationDecisionIssued === true,
    actualExternalCallExecutionActivationDecisionStatusFromOro6s:
      summary.actualExternalCallExecutionActivationDecisionStatus,
    actualExternalCallExecutionActivatedFromOro6s:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6s:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6s:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6s:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6s:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6s:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6s: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6s:
      summary.liveOroPlayApiCallAllowed === true,
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      summary.dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary ===
      true,
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      summary.oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed ===
      true,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r,
  };
}

function buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture",
    phase: ORO_6T_PHASE,
    oro6sRuntimeFinalReadinessGateEvidence:
      buildOro6sEvidenceFromSummary(BASELINE_ORO6S_SUMMARY),
    activationRequestEvidence: {
      actualExternalCallExecutionActivationRequestPrepared: true,
      actualExternalCallExecutionActivationRequestSubmitted: true,
      actualExternalCallExecutionActivationRequestStatus:
        SUBMITTED_PENDING_ACTIVATION_DECISION,
      actualExternalCallExecutionActivationDecisionIssued: false,
      actualExternalCallExecutionActivationDecisionStatus: PENDING,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
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
    buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro6s = isPlainObject(merged.oro6sRuntimeFinalReadinessGateEvidence)
    ? merged.oro6sRuntimeFinalReadinessGateEvidence
    : {};
  const request = isPlainObject(merged.activationRequestEvidence)
    ? merged.activationRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      readBoolean(
        oro6s,
        "dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate",
        true
      ),
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      readBoolean(
        oro6s,
        "oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed",
        true
      ),
    runtimeFinalReadinessGatePreparedFromOro6s: readBoolean(
      oro6s,
      "runtimeFinalReadinessGatePreparedFromOro6s",
      true
    ),
    runtimeFinalReadinessGateEvaluatedFromOro6s: readBoolean(
      oro6s,
      "runtimeFinalReadinessGateEvaluatedFromOro6s",
      true
    ),
    runtimeFinalReadinessGatePassedFromOro6s: readBoolean(
      oro6s,
      "runtimeFinalReadinessGatePassedFromOro6s",
      true
    ),
    runtimeFinalReadinessGateStatusFromOro6s: readString(
      oro6s,
      "runtimeFinalReadinessGateStatusFromOro6s",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
    ),
    actualExternalCallExecutionActivationRequestPreparedFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionActivationRequestPreparedFromOro6s",
      false
    ),
    actualExternalCallExecutionActivationRequestSubmittedFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionActivationRequestSubmittedFromOro6s",
      false
    ),
    actualExternalCallExecutionActivationDecisionIssuedFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionActivationDecisionIssuedFromOro6s",
      false
    ),
    actualExternalCallExecutionActivationDecisionStatusFromOro6s: readString(
      oro6s,
      "actualExternalCallExecutionActivationDecisionStatusFromOro6s",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionActivatedFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionActivatedFromOro6s",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionRuntimeEnabledFromOro6s",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionEnabledFromOro6s",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6s: readBoolean(
      oro6s,
      "actualExternalCallExecutionAuthorizedFromOro6s",
      false
    ),
    externalCallExecutionAuthorizedFromOro6s: readBoolean(
      oro6s,
      "externalCallExecutionAuthorizedFromOro6s",
      false
    ),
    externalCallExecutionPerformedFromOro6s: readBoolean(
      oro6s,
      "externalCallExecutionPerformedFromOro6s",
      false
    ),
    externalNetworkAllowedFromOro6s: readBoolean(
      oro6s,
      "externalNetworkAllowedFromOro6s",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6s: readBoolean(
      oro6s,
      "liveOroPlayApiCallAllowedFromOro6s",
      false
    ),
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      readBoolean(
        oro6s,
        "dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
        true
      ),
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      readBoolean(
        oro6s,
        "oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r:
      readString(
        oro6s,
        "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r",
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r:
      readString(
        oro6s,
        "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r",
        RUNTIME_EXECUTION_READINESS_ONLY
      ),
    actualExternalCallExecutionActivationRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionActivationRequestPrepared",
      true
    ),
    actualExternalCallExecutionActivationRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionActivationRequestSubmitted",
      true
    ),
    actualExternalCallExecutionActivationRequestStatus: readString(
      request,
      "actualExternalCallExecutionActivationRequestStatus",
      SUBMITTED_PENDING_ACTIVATION_DECISION
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionActivationDecisionIssued",
      false
    ),
    actualExternalCallExecutionActivationDecisionStatus: readString(
      request,
      "actualExternalCallExecutionActivationDecisionStatus",
      PENDING
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
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision",
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
      .dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate ||
    !fixture
      .oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed
  ) {
    blockers.push("ORO-6S runtime final readiness gate is required");
  }
  if (
    !fixture.runtimeFinalReadinessGatePreparedFromOro6s ||
    !fixture.runtimeFinalReadinessGateEvaluatedFromOro6s ||
    !fixture.runtimeFinalReadinessGatePassedFromOro6s
  ) {
    blockers.push("ORO-6S runtime final readiness gate must pass");
  }
  if (
    fixture.runtimeFinalReadinessGateStatusFromOro6s !==
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  ) {
    blockers.push("ORO-6S runtime final readiness status must allow activation request");
  }
  if (
    fixture.actualExternalCallExecutionActivationRequestPreparedFromOro6s ||
    fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro6s ||
    fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro6s ||
    fixture.actualExternalCallExecutionActivationDecisionStatusFromOro6s !==
      NOT_REQUESTED
  ) {
    blockers.push("ORO-6S must not already submit activation request or decision");
  }
  if (
    fixture.actualExternalCallExecutionActivatedFromOro6s ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6s ||
    fixture.actualExternalCallExecutionEnabledFromOro6s ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6s ||
    fixture.externalCallExecutionAuthorizedFromOro6s ||
    fixture.externalCallExecutionPerformedFromOro6s
  ) {
    blockers.push("ORO-6S must not activate, enable, authorize, or perform execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6s ||
    fixture.liveOroPlayApiCallAllowedFromOro6s
  ) {
    blockers.push("ORO-6S must still have no external network or live OroPlay call");
  }
  if (
    !fixture
      .dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary ||
    !fixture.oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r !==
      APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r !==
      RUNTIME_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6R runtime enablement decision evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionActivationRequestPrepared ||
    !fixture.actualExternalCallExecutionActivationRequestSubmitted ||
    fixture.actualExternalCallExecutionActivationRequestStatus !==
      SUBMITTED_PENDING_ACTIVATION_DECISION
  ) {
    blockers.push("activation request must be submitted pending activation decision");
  }
  if (
    fixture.actualExternalCallExecutionActivationDecisionIssued ||
    fixture.actualExternalCallExecutionActivationDecisionStatus !== PENDING
  ) {
    blockers.push("ORO-6T must not issue activation decision");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("ORO-6T must not activate actual external call execution");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6T must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6T must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6T must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6T must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate activation decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during activation request boundary");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during activation request boundary");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during activation request boundary");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during activation request boundary");
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
    phase: ORO_6T_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult:
      result,
    dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
      fixture
        .dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
    oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
      pass &&
      fixture
        .oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed,
    runtimeFinalReadinessGatePreparedFromOro6s:
      pass && fixture.runtimeFinalReadinessGatePreparedFromOro6s,
    runtimeFinalReadinessGateEvaluatedFromOro6s:
      pass && fixture.runtimeFinalReadinessGateEvaluatedFromOro6s,
    runtimeFinalReadinessGatePassedFromOro6s:
      pass && fixture.runtimeFinalReadinessGatePassedFromOro6s,
    runtimeFinalReadinessGateStatusFromOro6s: pass
      ? fixture.runtimeFinalReadinessGateStatusFromOro6s
      : HOLD,
    actualExternalCallExecutionActivationRequestPreparedFromOro6s: false,
    actualExternalCallExecutionActivationRequestSubmittedFromOro6s: false,
    actualExternalCallExecutionActivationDecisionIssuedFromOro6s: false,
    actualExternalCallExecutionActivationDecisionStatusFromOro6s:
      NOT_REQUESTED,
    actualExternalCallExecutionActivatedFromOro6s: false,
    actualExternalCallExecutionRuntimeEnabledFromOro6s: false,
    actualExternalCallExecutionEnabledFromOro6s: false,
    actualExternalCallExecutionAuthorizedFromOro6s: false,
    externalCallExecutionAuthorizedFromOro6s: false,
    externalCallExecutionPerformedFromOro6s: false,
    externalNetworkAllowedFromOro6s: false,
    liveOroPlayApiCallAllowedFromOro6s: false,
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      fixture
        .dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      pass &&
      fixture
        .oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r
      : HOLD,
    actualExternalCallExecutionActivationRequestPrepared:
      pass && fixture.actualExternalCallExecutionActivationRequestPrepared,
    actualExternalCallExecutionActivationRequestSubmitted:
      pass && fixture.actualExternalCallExecutionActivationRequestSubmitted,
    actualExternalCallExecutionActivationRequestStatus: pass
      ? fixture.actualExternalCallExecutionActivationRequestStatus
      : HOLD,
    actualExternalCallExecutionActivationDecisionIssued: false,
    actualExternalCallExecutionActivationDecisionStatus: PENDING,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision,
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

function validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
  input = buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6tActivationRequestSummary(input = {}) {
  return validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
    input
  );
}

function assertOro6tStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionActivationDecisionIssued ||
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
    throw new Error("ORO-6T still-no-external-call assertion failed");
  }
  return true;
}

function runOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryHarness(
  input
) {
  return validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary(
    input
  );
}

module.exports = {
  ORO_6T_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ACTIVATION_DECISION,
  ORO_6T_ACTIVATION_REQUEST_STATUS,
  buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
  validateOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
  buildOro6tActivationRequestSummary,
  assertOro6tStillNoExternalCall,
  runOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryHarness,
};
