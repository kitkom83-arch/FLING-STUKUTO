"use strict";

const {
  PASS: ORO6R_PASS,
  HOLD,
  APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
  RUNTIME_EXECUTION_READINESS_ONLY,
  buildOro6rRuntimeEnablementDecisionSummary,
} = require("./oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");

const ORO_6S_PHASE = "ORO-6S";
const PASS = "PASS";
const NOT_REQUESTED = "not_requested";
const SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION =
  "submitted_pending_runtime_enablement_decision";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_activation_request";

const ORO_6S_RUNTIME_FINAL_READINESS_STATUS = Object.freeze({
  PHASE: ORO_6S_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
  RUNTIME_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
});

const BASELINE_ORO6R_SUMMARY = buildOro6rRuntimeEnablementDecisionSummary();

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

function buildOro6rEvidenceFromSummary(summary) {
  return {
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      true,
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult ===
      ORO6R_PASS,
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionPrepared === true,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued === true,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionScope,
    actualExternalCallExecutionRuntimeEnabledFromOro6r:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6r:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6r:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6r:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6r:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6r: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6r:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6qEvidenceFromOro6rSummary(summary) {
  return {
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      summary.dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary ===
      true,
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      summary.oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed ===
      true,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q ===
      true,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q,
  };
}

function buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture",
    phase: ORO_6S_PHASE,
    oro6rRuntimeEnablementDecisionEvidence:
      buildOro6rEvidenceFromSummary(BASELINE_ORO6R_SUMMARY),
    oro6qRuntimeEnablementRequestEvidence:
      buildOro6qEvidenceFromOro6rSummary(BASELINE_ORO6R_SUMMARY),
    runtimeFinalReadinessGateEvidence: {
      runtimeFinalReadinessGatePrepared: true,
      runtimeFinalReadinessGateEvaluated: true,
      runtimeFinalReadinessGatePassed: true,
      runtimeFinalReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
      actualExternalCallExecutionActivationRequestPrepared: false,
      actualExternalCallExecutionActivationRequestSubmitted: false,
      actualExternalCallExecutionActivationDecisionIssued: false,
      actualExternalCallExecutionActivationDecisionStatus: NOT_REQUESTED,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest: true,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision: true,
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
    buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const oro6r = isPlainObject(merged.oro6rRuntimeEnablementDecisionEvidence)
    ? merged.oro6rRuntimeEnablementDecisionEvidence
    : {};
  const oro6q = isPlainObject(merged.oro6qRuntimeEnablementRequestEvidence)
    ? merged.oro6qRuntimeEnablementRequestEvidence
    : {};
  const gate = isPlainObject(merged.runtimeFinalReadinessGateEvidence)
    ? merged.runtimeFinalReadinessGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      readBoolean(
        oro6r,
        "dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
        true
      ),
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      readBoolean(
        oro6r,
        "oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r:
      readBoolean(
        oro6r,
        "actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r:
      readBoolean(
        oro6r,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r:
      readString(
        oro6r,
        "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r",
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r:
      readString(
        oro6r,
        "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r",
        RUNTIME_EXECUTION_READINESS_ONLY
      ),
    actualExternalCallExecutionRuntimeEnabledFromOro6r: readBoolean(
      oro6r,
      "actualExternalCallExecutionRuntimeEnabledFromOro6r",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6r: readBoolean(
      oro6r,
      "actualExternalCallExecutionEnabledFromOro6r",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6r: readBoolean(
      oro6r,
      "actualExternalCallExecutionAuthorizedFromOro6r",
      false
    ),
    externalCallExecutionAuthorizedFromOro6r: readBoolean(
      oro6r,
      "externalCallExecutionAuthorizedFromOro6r",
      false
    ),
    externalCallExecutionPerformedFromOro6r: readBoolean(
      oro6r,
      "externalCallExecutionPerformedFromOro6r",
      false
    ),
    externalNetworkAllowedFromOro6r: readBoolean(
      oro6r,
      "externalNetworkAllowedFromOro6r",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6r: readBoolean(
      oro6r,
      "liveOroPlayApiCallAllowedFromOro6r",
      false
    ),
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      readBoolean(
        oro6q,
        "dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
        true
      ),
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      readBoolean(
        oro6q,
        "oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      readBoolean(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q:
      readString(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q",
        SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
      ),
    runtimeFinalReadinessGatePrepared: readBoolean(
      gate,
      "runtimeFinalReadinessGatePrepared",
      true
    ),
    runtimeFinalReadinessGateEvaluated: readBoolean(
      gate,
      "runtimeFinalReadinessGateEvaluated",
      true
    ),
    runtimeFinalReadinessGatePassed: readBoolean(
      gate,
      "runtimeFinalReadinessGatePassed",
      true
    ),
    runtimeFinalReadinessGateStatus: readString(
      gate,
      "runtimeFinalReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
    ),
    actualExternalCallExecutionActivationRequestPrepared: readBoolean(
      gate,
      "actualExternalCallExecutionActivationRequestPrepared",
      false
    ),
    actualExternalCallExecutionActivationRequestSubmitted: readBoolean(
      gate,
      "actualExternalCallExecutionActivationRequestSubmitted",
      false
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      gate,
      "actualExternalCallExecutionActivationDecisionIssued",
      false
    ),
    actualExternalCallExecutionActivationDecisionStatus: readString(
      gate,
      "actualExternalCallExecutionActivationDecisionStatus",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionActivated: readBoolean(
      gate,
      "actualExternalCallExecutionActivated",
      false
    ),
    actualExternalCallExecutionRuntimeEnabled: readBoolean(
      gate,
      "actualExternalCallExecutionRuntimeEnabled",
      false
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      gate,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      gate,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionAuthorized: readBoolean(
      gate,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      gate,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest:
      readBoolean(
        gate,
        "nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision:
      readBoolean(
        gate,
        "nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      gate,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      gate,
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
      .dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary ||
    !fixture
      .oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed
  ) {
    blockers.push("ORO-6R runtime enablement decision boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r ||
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r
  ) {
    blockers.push("ORO-6R runtime enablement decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r !==
    APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6R decision status must be approved for runtime execution readiness only");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r !==
    RUNTIME_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6R decision scope must be runtime execution readiness only");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabledFromOro6r) {
    blockers.push("ORO-6R must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabledFromOro6r) {
    blockers.push("ORO-6R must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6r ||
    fixture.externalCallExecutionAuthorizedFromOro6r
  ) {
    blockers.push("ORO-6R must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformedFromOro6r) {
    blockers.push("ORO-6R must not perform external call execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6r ||
    fixture.liveOroPlayApiCallAllowedFromOro6r
  ) {
    blockers.push("ORO-6R must still have no external network or live OroPlay call");
  }
  if (
    !fixture
      .dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary ||
    !fixture.oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q !==
      SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6Q runtime enablement request evidence is required");
  }
  if (
    !fixture.runtimeFinalReadinessGatePrepared ||
    !fixture.runtimeFinalReadinessGateEvaluated ||
    !fixture.runtimeFinalReadinessGatePassed ||
    fixture.runtimeFinalReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST
  ) {
    blockers.push("ORO-6S runtime final readiness gate must pass for activation request readiness");
  }
  if (
    fixture.actualExternalCallExecutionActivationRequestPrepared ||
    fixture.actualExternalCallExecutionActivationRequestSubmitted ||
    fixture.actualExternalCallExecutionActivationDecisionIssued ||
    fixture.actualExternalCallExecutionActivationDecisionStatus !== NOT_REQUESTED
  ) {
    blockers.push("ORO-6S must not submit actual external call execution activation request");
  }
  if (fixture.actualExternalCallExecutionActivated) {
    blockers.push("ORO-6S must not activate actual external call execution");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6S must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6S must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6S must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6S must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate activation request and decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during runtime final readiness gate");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during runtime final readiness gate");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during runtime final readiness gate");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during runtime final readiness gate");
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
    phase: ORO_6S_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateResult:
      result,
    dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
      fixture
        .dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
      pass &&
      fixture
        .oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed,
    actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r
      : HOLD,
    actualExternalCallExecutionRuntimeEnabledFromOro6r: false,
    actualExternalCallExecutionEnabledFromOro6r: false,
    actualExternalCallExecutionAuthorizedFromOro6r: false,
    externalCallExecutionAuthorizedFromOro6r: false,
    externalCallExecutionPerformedFromOro6r: false,
    externalNetworkAllowedFromOro6r: false,
    liveOroPlayApiCallAllowedFromOro6r: false,
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      fixture
        .dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      pass &&
      fixture
        .oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q
      : HOLD,
    runtimeFinalReadinessGatePrepared:
      pass && fixture.runtimeFinalReadinessGatePrepared,
    runtimeFinalReadinessGateEvaluated:
      pass && fixture.runtimeFinalReadinessGateEvaluated,
    runtimeFinalReadinessGatePassed:
      pass && fixture.runtimeFinalReadinessGatePassed,
    runtimeFinalReadinessGateStatus: pass
      ? fixture.runtimeFinalReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionActivationRequestPrepared: false,
    actualExternalCallExecutionActivationRequestSubmitted: false,
    actualExternalCallExecutionActivationDecisionIssued: false,
    actualExternalCallExecutionActivationDecisionStatus: NOT_REQUESTED,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest,
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

function validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
  input = buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6sRuntimeFinalReadinessSummary(input = {}) {
  return validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
    input
  );
}

function assertOro6sStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
        summary
      );
  if (
    report.actualExternalCallExecutionActivationRequestSubmitted ||
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
    throw new Error("ORO-6S still-no-external-call assertion failed");
  }
  return true;
}

function runOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateHarness(
  input
) {
  return validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate(
    input
  );
}

module.exports = {
  ORO_6S_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST,
  ORO_6S_RUNTIME_FINAL_READINESS_STATUS,
  buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
  validateOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
  buildOro6sRuntimeFinalReadinessSummary,
  assertOro6sStillNoExternalCall,
  runOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateHarness,
};
