"use strict";

const {
  PASS: ORO6O_PASS,
  HOLD,
  APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
  FINAL_LIVE_EXECUTION_READINESS_ONLY,
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
  validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
} = require("./oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary");

const ORO_6P_PHASE = "ORO-6P";
const PASS = "PASS";
const NOT_REQUESTED = "not_requested";
const SUBMITTED_PENDING_ENABLEMENT_DECISION =
  "submitted_pending_enablement_decision";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_runtime_enablement_request";

const ORO_6P_FINAL_LIVE_EXECUTION_READINESS_STATUS = Object.freeze({
  PHASE: ORO_6P_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY,
  FINAL_LIVE_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
});

const BASELINE_ORO6O_SUMMARY =
  validateOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary(
    buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary()
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

function buildOro6oEvidenceFromSummary(summary) {
  return {
    dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
      true,
    oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed:
      summary.liveTrafficActualExternalCallExecutionEnablementDecisionBoundaryResult ===
      ORO6O_PASS,
    actualExternalCallExecutionEnablementDecisionPreparedFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionPrepared === true,
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionIssued === true,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionStatus,
    actualExternalCallExecutionEnablementDecisionScopeFromOro6o:
      summary.actualExternalCallExecutionEnablementDecisionScope,
    actualExternalCallExecutionEnabledFromOro6o:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6o:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6o:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6o:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6o: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6o:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6nEvidenceFromOro6oSummary(summary) {
  return {
    dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
      summary.dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary ===
      true,
    oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed:
      summary.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed ===
      true,
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6n:
      summary.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n ===
      true,
    actualExternalCallExecutionEnablementRequestStatusFromOro6n:
      summary.actualExternalCallExecutionEnablementRequestStatusFromOro6n,
  };
}

function buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture",
    phase: ORO_6P_PHASE,
    oro6oEnablementDecisionEvidence:
      buildOro6oEvidenceFromSummary(BASELINE_ORO6O_SUMMARY),
    oro6nEnablementRequestEvidence:
      buildOro6nEvidenceFromOro6oSummary(BASELINE_ORO6O_SUMMARY),
    finalReadinessGateEvidence: {
      finalLiveExecutionReadinessGatePrepared: true,
      finalLiveExecutionReadinessGateEvaluated: true,
      finalLiveExecutionReadinessGatePassed: true,
      finalLiveExecutionReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
      actualExternalCallExecutionRuntimeEnablementRequestPrepared: false,
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: false,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus: NOT_REQUESTED,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
        true,
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
    buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate();
  const merged = deepMerge(baseline, source);
  const oro6o = isPlainObject(merged.oro6oEnablementDecisionEvidence)
    ? merged.oro6oEnablementDecisionEvidence
    : {};
  const oro6n = isPlainObject(merged.oro6nEnablementRequestEvidence)
    ? merged.oro6nEnablementRequestEvidence
    : {};
  const gate = isPlainObject(merged.finalReadinessGateEvidence)
    ? merged.finalReadinessGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    actualExternalCallExecutionEnablementDecisionPreparedFromOro6o: readBoolean(
      oro6o,
      "actualExternalCallExecutionEnablementDecisionPreparedFromOro6o",
      true
    ),
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6o: readBoolean(
      oro6o,
      "actualExternalCallExecutionEnablementDecisionIssuedFromOro6o",
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
    actualExternalCallExecutionEnabledFromOro6o: readBoolean(
      oro6o,
      "actualExternalCallExecutionEnabledFromOro6o",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6o: readBoolean(
      oro6o,
      "actualExternalCallExecutionAuthorizedFromOro6o",
      false
    ),
    externalCallExecutionAuthorizedFromOro6o: readBoolean(
      oro6o,
      "externalCallExecutionAuthorizedFromOro6o",
      false
    ),
    externalCallExecutionPerformedFromOro6o: readBoolean(
      oro6o,
      "externalCallExecutionPerformedFromOro6o",
      false
    ),
    externalNetworkAllowedFromOro6o: readBoolean(
      oro6o,
      "externalNetworkAllowedFromOro6o",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6o: readBoolean(
      oro6o,
      "liveOroPlayApiCallAllowedFromOro6o",
      false
    ),
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
    finalLiveExecutionReadinessGatePrepared: readBoolean(
      gate,
      "finalLiveExecutionReadinessGatePrepared",
      true
    ),
    finalLiveExecutionReadinessGateEvaluated: readBoolean(
      gate,
      "finalLiveExecutionReadinessGateEvaluated",
      true
    ),
    finalLiveExecutionReadinessGatePassed: readBoolean(
      gate,
      "finalLiveExecutionReadinessGatePassed",
      true
    ),
    finalLiveExecutionReadinessGateStatus: readString(
      gate,
      "finalLiveExecutionReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionRuntimeEnablementRequestPrepared: readBoolean(
      gate,
      "actualExternalCallExecutionRuntimeEnablementRequestPrepared",
      false
    ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted: readBoolean(
      gate,
      "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
      false
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      gate,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
      false
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: readString(
      gate,
      "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
      NOT_REQUESTED
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
      readBoolean(
        gate,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision:
      readBoolean(
        gate,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision",
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
      .dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary ||
    !fixture.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed
  ) {
    blockers.push("ORO-6O enablement decision boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionEnablementDecisionPreparedFromOro6o ||
    !fixture.actualExternalCallExecutionEnablementDecisionIssuedFromOro6o
  ) {
    blockers.push("ORO-6O enablement decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6o !==
    APPROVED_FOR_FINAL_LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6O decision status must be final readiness-only approved");
  }
  if (
    fixture.actualExternalCallExecutionEnablementDecisionScopeFromOro6o !==
    FINAL_LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6O decision scope must be final readiness-only");
  }
  if (fixture.actualExternalCallExecutionEnabledFromOro6o) {
    blockers.push("ORO-6O must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6o ||
    fixture.externalCallExecutionAuthorizedFromOro6o
  ) {
    blockers.push("ORO-6O must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformedFromOro6o) {
    blockers.push("ORO-6O must not perform external call execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6o ||
    fixture.liveOroPlayApiCallAllowedFromOro6o
  ) {
    blockers.push("ORO-6O must still have no external network or live OroPlay call");
  }
  if (
    !fixture.dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary ||
    !fixture.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed ||
    !fixture.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n ||
    fixture.actualExternalCallExecutionEnablementRequestStatusFromOro6n !==
      SUBMITTED_PENDING_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6N submitted enablement request evidence is required");
  }
  if (
    !fixture.finalLiveExecutionReadinessGatePrepared ||
    !fixture.finalLiveExecutionReadinessGateEvaluated ||
    !fixture.finalLiveExecutionReadinessGatePassed ||
    fixture.finalLiveExecutionReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
  ) {
    blockers.push("ORO-6P final readiness gate must pass for runtime enablement request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementRequestPrepared ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus !==
      NOT_REQUESTED
  ) {
    blockers.push("ORO-6P must not submit runtime enablement request");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6P must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6P must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6P must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6P must not perform external call execution");
  }
  if (
    !fixture
      .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest ||
    !fixture
      .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate runtime enablement request and decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during final readiness gate");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during final readiness gate");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during final readiness gate");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during final readiness gate");
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
    phase: ORO_6P_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionFinalReadinessGateResult: result,
    dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
      fixture
        .dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
    oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed:
      pass &&
      fixture.oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed,
    actualExternalCallExecutionEnablementDecisionPreparedFromOro6o:
      pass && fixture.actualExternalCallExecutionEnablementDecisionPreparedFromOro6o,
    actualExternalCallExecutionEnablementDecisionIssuedFromOro6o:
      pass && fixture.actualExternalCallExecutionEnablementDecisionIssuedFromOro6o,
    actualExternalCallExecutionEnablementDecisionStatusFromOro6o: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionStatusFromOro6o
      : HOLD,
    actualExternalCallExecutionEnablementDecisionScopeFromOro6o: pass
      ? fixture.actualExternalCallExecutionEnablementDecisionScopeFromOro6o
      : HOLD,
    actualExternalCallExecutionEnabledFromOro6o: false,
    actualExternalCallExecutionAuthorizedFromOro6o: false,
    externalCallExecutionAuthorizedFromOro6o: false,
    externalCallExecutionPerformedFromOro6o: false,
    externalNetworkAllowedFromOro6o: false,
    liveOroPlayApiCallAllowedFromOro6o: false,
    dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
      fixture
        .dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
    oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed:
      pass &&
      fixture.oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed,
    actualExternalCallExecutionEnablementRequestSubmittedFromOro6n:
      pass && fixture.actualExternalCallExecutionEnablementRequestSubmittedFromOro6n,
    actualExternalCallExecutionEnablementRequestStatusFromOro6n: pass
      ? fixture.actualExternalCallExecutionEnablementRequestStatusFromOro6n
      : HOLD,
    finalLiveExecutionReadinessGatePrepared:
      pass && fixture.finalLiveExecutionReadinessGatePrepared,
    finalLiveExecutionReadinessGateEvaluated:
      pass && fixture.finalLiveExecutionReadinessGateEvaluated,
    finalLiveExecutionReadinessGatePassed:
      pass && fixture.finalLiveExecutionReadinessGatePassed,
    finalLiveExecutionReadinessGateStatus: pass
      ? fixture.finalLiveExecutionReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestPrepared: false,
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted: false,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: NOT_REQUESTED,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
      pass &&
      fixture
        .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision:
      pass &&
      fixture
        .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision,
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

function validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
  input = buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6pFinalLiveExecutionReadinessSummary(input = {}) {
  return validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
    input
  );
}

function assertOro6pStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
        summary
      );
  if (
    report.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ||
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
    throw new Error("ORO-6P still-no-external-call assertion failed");
  }
  return true;
}

function runOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateHarness(
  input
) {
  return validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate(
    input
  );
}

module.exports = {
  ORO_6P_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST,
  ORO_6P_FINAL_LIVE_EXECUTION_READINESS_STATUS,
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
  validateOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
  buildOro6pFinalLiveExecutionReadinessSummary,
  assertOro6pStillNoExternalCall,
  runOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateHarness,
};
