"use strict";

const {
  PASS: ORO6X_PASS,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
  validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
} = require("./oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary");

const ORO_6Y_PHASE = "ORO-6Y";
const PASS = "PASS";
const HOLD = "HOLD";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST =
  "ready_for_separate_actual_external_call_execution_final_execution_request";
const FINAL_READINESS_ONLY = "final_readiness_only";

const ORO6Y_LIVE_EXECUTION_FINAL_READINESS_GATE_STATUS = Object.freeze({
  PHASE: ORO_6Y_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
  FINAL_READINESS_ONLY,
});

const BASELINE_ORO6X_SUMMARY =
  validateOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary(
    buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary()
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

function buildOro6xEvidenceFromSummary(summary) {
  return {
    dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary:
      true,
    oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryResult ===
      ORO6X_PASS,
    actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x:
      summary.actualExternalCallExecutionLiveExecutionDecisionPrepared === true,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x:
      summary.actualExternalCallExecutionLiveExecutionDecisionIssued === true,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x:
      summary.actualExternalCallExecutionLiveExecutionDecisionStatus,
    actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x:
      summary.actualExternalCallExecutionLiveExecutionDecisionScope,
    actualExternalCallExecutionLiveExecutionApprovedFromOro6x:
      summary.actualExternalCallExecutionLiveExecutionApproved === true,
    actualExternalCallExecutionActivatedFromOro6x:
      summary.actualExternalCallExecutionActivated === true,
    actualExternalCallExecutionRuntimeEnabledFromOro6x:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6x:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6x:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6x:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6x:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6x: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6x:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6yLiveExecutionFinalReadinessInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture",
    phase: ORO_6Y_PHASE,
    oro6xLiveExecutionDecisionEvidence:
      buildOro6xEvidenceFromSummary(BASELINE_ORO6X_SUMMARY),
    finalReadinessGateEvidence: {
      actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared: true,
      actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated: true,
      actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed: true,
      actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
      actualExternalCallExecutionLiveExecutionFinalReadinessGateScope:
        FINAL_READINESS_ONLY,
      actualExternalCallExecutionFinalExecutionRequestSubmitted: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
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
  const baseline = buildOro6yLiveExecutionFinalReadinessInput();
  const merged = deepMerge(baseline, source);
  const oro6x = isPlainObject(merged.oro6xLiveExecutionDecisionEvidence)
    ? merged.oro6xLiveExecutionDecisionEvidence
    : {};
  const gate = isPlainObject(merged.finalReadinessGateEvidence)
    ? merged.finalReadinessGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary:
      readBoolean(
        oro6x,
        "dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary",
        true
      ),
    oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed:
      readBoolean(
        oro6x,
        "oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x:
      readBoolean(
        oro6x,
        "actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x",
        true
      ),
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x:
      readBoolean(
        oro6x,
        "actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x",
        true
      ),
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x: readString(
      oro6x,
      "actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x",
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x: readString(
      oro6x,
      "actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x",
      LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionLiveExecutionApprovedFromOro6x: readBoolean(
      oro6x,
      "actualExternalCallExecutionLiveExecutionApprovedFromOro6x",
      false
    ),
    actualExternalCallExecutionActivatedFromOro6x: readBoolean(
      oro6x,
      "actualExternalCallExecutionActivatedFromOro6x",
      false
    ),
    actualExternalCallExecutionRuntimeEnabledFromOro6x: readBoolean(
      oro6x,
      "actualExternalCallExecutionRuntimeEnabledFromOro6x",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6x: readBoolean(
      oro6x,
      "actualExternalCallExecutionEnabledFromOro6x",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6x: readBoolean(
      oro6x,
      "actualExternalCallExecutionAuthorizedFromOro6x",
      false
    ),
    externalCallExecutionAuthorizedFromOro6x: readBoolean(
      oro6x,
      "externalCallExecutionAuthorizedFromOro6x",
      false
    ),
    externalCallExecutionPerformedFromOro6x: readBoolean(
      oro6x,
      "externalCallExecutionPerformedFromOro6x",
      false
    ),
    externalNetworkAllowedFromOro6x: readBoolean(
      oro6x,
      "externalNetworkAllowedFromOro6x",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6x: readBoolean(
      oro6x,
      "liveOroPlayApiCallAllowedFromOro6x",
      false
    ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared:
      readBoolean(
        gate,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated:
      readBoolean(
        gate,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
      readBoolean(
        gate,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus: readString(
      gate,
      "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST
    ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateScope: readString(
      gate,
      "actualExternalCallExecutionLiveExecutionFinalReadinessGateScope",
      FINAL_READINESS_ONLY
    ),
    actualExternalCallExecutionFinalExecutionRequestSubmitted: readBoolean(
      gate,
      "actualExternalCallExecutionFinalExecutionRequestSubmitted",
      false
    ),
    actualExternalCallExecutionLiveExecutionApproved: readBoolean(
      gate,
      "actualExternalCallExecutionLiveExecutionApproved",
      false
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
    nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest:
      readBoolean(
        gate,
        "nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest",
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
      .dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary ||
    !fixture
      .oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed
  ) {
    blockers.push("ORO-6X live execution decision boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x ||
    !fixture.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x !==
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x !==
      LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6X decision must be live-execution-readiness-only");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApprovedFromOro6x ||
    fixture.actualExternalCallExecutionActivatedFromOro6x ||
    fixture.actualExternalCallExecutionRuntimeEnabledFromOro6x ||
    fixture.actualExternalCallExecutionEnabledFromOro6x ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6x ||
    fixture.externalCallExecutionAuthorizedFromOro6x ||
    fixture.externalCallExecutionPerformedFromOro6x
  ) {
    blockers.push("ORO-6X must still have no approval, activation, or execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6x ||
    fixture.liveOroPlayApiCallAllowedFromOro6x
  ) {
    blockers.push("ORO-6X must still have no external network or live OroPlay call");
  }
  if (
    !fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared ||
    !fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated ||
    !fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed ||
    fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST ||
    fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateScope !==
      FINAL_READINESS_ONLY
  ) {
    blockers.push("ORO-6Y final readiness gate must be final-readiness-only");
  }
  if (
    fixture.actualExternalCallExecutionFinalExecutionRequestSubmitted ||
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6Y must not request, approve, activate, enable, authorize, or execute");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionFinalExecutionRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate final execution request");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during final readiness");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during final readiness");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during final readiness");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during final readiness");
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
    phase: ORO_6Y_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateResult:
      result,
    dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary:
      fixture
        .dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
    oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed:
      pass &&
      fixture
        .oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed,
    actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x:
      pass && fixture.actualExternalCallExecutionLiveExecutionDecisionPreparedFromOro6x,
    actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x:
      pass && fixture.actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6x,
    actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x: pass
      ? fixture.actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x
      : HOLD,
    actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x: pass
      ? fixture.actualExternalCallExecutionLiveExecutionDecisionScopeFromOro6x
      : HOLD,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared:
      pass &&
      fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated:
      pass &&
      fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
      pass && fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus: pass
      ? fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateScope: pass
      ? fixture.actualExternalCallExecutionLiveExecutionFinalReadinessGateScope
      : HOLD,
    actualExternalCallExecutionFinalExecutionRequestSubmitted: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
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

function evaluateOro6yLiveExecutionFinalReadinessGate(
  input = buildOro6yLiveExecutionFinalReadinessInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6yLiveExecutionFinalReadinessGateSummary(input = {}) {
  return evaluateOro6yLiveExecutionFinalReadinessGate(input);
}

function validateOro6yLiveExecutionFinalReadinessGateContract(input = {}) {
  return evaluateOro6yLiveExecutionFinalReadinessGate(input);
}

module.exports = {
  ORO_6Y_PHASE,
  PASS,
  HOLD,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
  FINAL_READINESS_ONLY,
  ORO6Y_LIVE_EXECUTION_FINAL_READINESS_GATE_STATUS,
  buildOro6yLiveExecutionFinalReadinessInput,
  evaluateOro6yLiveExecutionFinalReadinessGate,
  buildOro6yLiveExecutionFinalReadinessGateSummary,
  validateOro6yLiveExecutionFinalReadinessGateContract,
};
