"use strict";

const {
  PASS: ORO6P_PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
  validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
} = require("./oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate");

const ORO_6Q_PHASE = "ORO-6Q";
const PASS = "PASS";
const PENDING = "pending";
const SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION =
  "submitted_pending_runtime_enablement_decision";
const APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY =
  "approved_for_final_live_execution_readiness_only";
const FINAL_LIVE_EXECUTION_READINESS_ONLY =
  "final_live_execution_readiness_only";

const ORO_6Q_RUNTIME_ENABLEMENT_REQUEST_STATUS = Object.freeze({
  PHASE: ORO_6Q_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
});

const BASELINE_ORO6P_SUMMARY =
  validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
    buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate()
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

function buildOro6pEvidenceFromSummary(summary) {
  return {
    dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
      true,
    oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionFinalReadinessGateResult ===
      ORO6P_PASS,
    finalLiveExecutionReadinessGatePreparedFromOro6p:
      summary.finalLiveExecutionReadinessGatePrepared === true,
    finalLiveExecutionReadinessGateEvaluatedFromOro6p:
      summary.finalLiveExecutionReadinessGateEvaluated === true,
    finalLiveExecutionReadinessGatePassedFromOro6p:
      summary.finalLiveExecutionReadinessGatePassed === true,
    finalLiveExecutionReadinessGateStatusFromOro6p:
      summary.finalLiveExecutionReadinessGateStatus,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p:
      summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared ===
      true,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p:
      summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ===
      true,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued ===
      true,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    actualExternalCallExecutionRuntimeEnabledFromOro6p:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6p:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6p:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6p:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6p:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6p: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6p:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6oEvidenceFromOro6pSummary(summary) {
  return {
    dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
      summary.dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary ===
      true,
    oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed:
      summary.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed ===
      true,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionStatusFromOro6o,
    actualExternalCallExecutionEnablementDecisionScopeFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionScopeFromOro6o,
  };
}

function buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture",
    phase: ORO_6Q_PHASE,
    oro6pFinalReadinessGateEvidence:
      buildOro6pEvidenceFromSummary(BASELINE_ORO6P_SUMMARY),
    oro6oEnablementDecisionEvidence:
      buildOro6oEvidenceFromOro6pSummary(BASELINE_ORO6P_SUMMARY),
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestPrepared: true,
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: true,
      actualExternalCallExecutionRuntimeEnablementRequestStatus:
        SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus: PENDING,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision:
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
    buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro6p = isPlainObject(merged.oro6pFinalReadinessGateEvidence)
    ? merged.oro6pFinalReadinessGateEvidence
    : {};
  const oro6o = isPlainObject(merged.oro6oEnablementDecisionEvidence)
    ? merged.oro6oEnablementDecisionEvidence
    : {};
  const request = isPlainObject(merged.runtimeEnablementRequestEvidence)
    ? merged.runtimeEnablementRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
      readBoolean(
        oro6p,
        "dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate",
        true
      ),
    oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed:
      readBoolean(
        oro6p,
        "oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed",
        true
      ),
    finalLiveExecutionReadinessGatePreparedFromOro6p: readBoolean(
      oro6p,
      "finalLiveExecutionReadinessGatePreparedFromOro6p",
      true
    ),
    finalLiveExecutionReadinessGateEvaluatedFromOro6p: readBoolean(
      oro6p,
      "finalLiveExecutionReadinessGateEvaluatedFromOro6p",
      true
    ),
    finalLiveExecutionReadinessGatePassedFromOro6p: readBoolean(
      oro6p,
      "finalLiveExecutionReadinessGatePassedFromOro6p",
      true
    ),
    finalLiveExecutionReadinessGateStatusFromOro6p: readString(
      oro6p,
      "finalLiveExecutionReadinessGateStatusFromOro6p",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p:
      readBoolean(
        oro6p,
        "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p",
        false
      ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p:
      readBoolean(
        oro6p,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p",
        false
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p:
      readBoolean(
        oro6p,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p",
        false
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p:
      readString(
        oro6p,
        "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p",
        NOT_REQUESTED
      ),
    actualExternalCallExecutionRuntimeEnabledFromOro6p: readBoolean(
      oro6p,
      "actualExternalCallExecutionRuntimeEnabledFromOro6p",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6p: readBoolean(
      oro6p,
      "actualExternalCallExecutionEnabledFromOro6p",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6p: readBoolean(
      oro6p,
      "actualExternalCallExecutionAuthorizedFromOro6p",
      false
    ),
    externalCallExecutionAuthorizedFromOro6p: readBoolean(
      oro6p,
      "externalCallExecutionAuthorizedFromOro6p",
      false
    ),
    externalCallExecutionPerformedFromOro6p: readBoolean(
      oro6p,
      "externalCallExecutionPerformedFromOro6p",
      false
    ),
    externalNetworkAllowedFromOro6p: readBoolean(
      oro6p,
      "externalNetworkAllowedFromOro6p",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6p: readBoolean(
      oro6p,
      "liveOroPlayApiCallAllowedFromOro6p",
      false
    ),
    dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
      readBoolean(
        oro6o,
        "dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary",
        true
      ),
    oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed:
      readBoolean(
        oro6o,
        "oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed",
        true
      ),
    actualExternalCallExecutionEnablementDecisionStatusFromOro6o: readString(
      oro6o,
      "actualExternalCallExecutionEnablementDecisionStatusFromOro6o",
      APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionEnablementDecisionScopeFromOro6o: readString(
      oro6o,
      "actualExternalCallExecutionEnablementDecisionScopeFromOro6o",
      FINAL_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnablementRequestPrepared",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementRequestStatus: readString(
      request,
      "actualExternalCallExecutionRuntimeEnablementRequestStatus",
      SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
      false
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: readString(
      request,
      "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
      PENDING
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision",
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
      .dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate ||
    !fixture.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed
  ) {
    blockers.push("ORO-6P final readiness gate is required");
  }
  if (
    !fixture.finalLiveExecutionReadinessGatePreparedFromOro6p ||
    !fixture.finalLiveExecutionReadinessGateEvaluatedFromOro6p ||
    !fixture.finalLiveExecutionReadinessGatePassedFromOro6p
  ) {
    blockers.push("ORO-6P final readiness gate must pass");
  }
  if (
    fixture.finalLiveExecutionReadinessGateStatusFromOro6p !==
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
  ) {
    blockers.push("ORO-6P final readiness status must be ready for runtime enablement request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p !==
      NOT_REQUESTED
  ) {
    blockers.push("ORO-6P must not have submitted runtime enablement request");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabledFromOro6p) {
    blockers.push("ORO-6P must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabledFromOro6p) {
    blockers.push("ORO-6P must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6p ||
    fixture.externalCallExecutionAuthorizedFromOro6p
  ) {
    blockers.push("ORO-6P must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformedFromOro6p) {
    blockers.push("ORO-6P must not perform external call execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6p ||
    fixture.liveOroPlayApiCallAllowedFromOro6p
  ) {
    blockers.push("ORO-6P must still have no external network or live OroPlay call");
  }
  if (
    !fixture
      .dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary ||
    !fixture.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed ||
    fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6o !==
      APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionEnablementDecisionScopeFromOro6o !==
      FINAL_LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6O final readiness-only decision evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestStatus !==
      SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6Q runtime enablement request must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus !== PENDING
  ) {
    blockers.push("ORO-6Q must not issue runtime enablement decision");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6Q must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6Q must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6Q must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6Q must not perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate runtime enablement decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during runtime enablement request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during runtime enablement request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during runtime enablement request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during runtime enablement request");
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
    phase: ORO_6Q_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult:
      result,
    dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
      fixture.dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed:
      pass &&
      fixture.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed,
    finalLiveExecutionReadinessGatePreparedFromOro6p:
      pass && fixture.finalLiveExecutionReadinessGatePreparedFromOro6p,
    finalLiveExecutionReadinessGateEvaluatedFromOro6p:
      pass && fixture.finalLiveExecutionReadinessGateEvaluatedFromOro6p,
    finalLiveExecutionReadinessGatePassedFromOro6p:
      pass && fixture.finalLiveExecutionReadinessGatePassedFromOro6p,
    finalLiveExecutionReadinessGateStatusFromOro6p: pass
      ? fixture.finalLiveExecutionReadinessGateStatusFromOro6p
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p: false,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p: false,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p: false,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p:
      NOT_REQUESTED,
    actualExternalCallExecutionRuntimeEnabledFromOro6p: false,
    actualExternalCallExecutionEnabledFromOro6p: false,
    actualExternalCallExecutionAuthorizedFromOro6p: false,
    externalCallExecutionAuthorizedFromOro6p: false,
    externalCallExecutionPerformedFromOro6p: false,
    externalNetworkAllowedFromOro6p: false,
    liveOroPlayApiCallAllowedFromOro6p: false,
    dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
      fixture
        .dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed:
      pass &&
      fixture.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6o: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6o
      : HOLD,
    actualExternalCallExecutionEnablementDecisionScopeFromOro6o: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionScopeFromOro6o
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementRequestPrepared,
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted,
    actualExternalCallExecutionRuntimeEnablementRequestStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: PENDING,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision,
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

function validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
  input =
    buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6qRuntimeEnablementRequestSummary(input = {}) {
  return validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
    input
  );
}

function assertOro6qStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionRuntimeEnablementDecisionIssued ||
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
    throw new Error("ORO-6Q still-no-external-call assertion failed");
  }
  return true;
}

function runOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryHarness(
  input
) {
  return validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary(
    input
  );
}

module.exports = {
  ORO_6Q_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
  ORO_6Q_RUNTIME_ENABLEMENT_REQUEST_STATUS,
  buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
  validateOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
  buildOro6qRuntimeEnablementRequestSummary,
  assertOro6qStillNoExternalCall,
  runOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryHarness,
};
