"use strict";

const {
  PASS: ORO6Y_PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
  FINAL_READINESS_ONLY,
  buildOro6yLiveExecutionFinalReadinessInput,
  validateOro6yLiveExecutionFinalReadinessGateContract,
} = require("./oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate");

const ORO_6Z_PHASE = "ORO-6Z";
const PASS = "PASS";
const HOLD = "HOLD";
const SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION =
  "submitted_pending_actual_external_call_execution_decision";
const FINAL_EXECUTION_REQUEST_ONLY = "final_execution_request_only";

const ORO6Z_FINAL_EXECUTION_REQUEST_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_6Z_PHASE,
  PASS,
  HOLD,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST,
  FINAL_READINESS_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
  FINAL_EXECUTION_REQUEST_ONLY,
});

const BASELINE_ORO6Y_SUMMARY =
  validateOro6yLiveExecutionFinalReadinessGateContract(
    buildOro6yLiveExecutionFinalReadinessInput()
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

function buildOro6yEvidenceFromSummary(summary) {
  return {
    dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate:
      true,
    oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
      summary.liveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateResult ===
      ORO6Y_PASS,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y:
      summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePrepared ===
      true,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y:
      summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluated ===
      true,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y:
      summary.actualExternalCallExecutionLiveExecutionFinalReadinessGatePassed === true,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y:
      summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateStatus,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y:
      summary.actualExternalCallExecutionLiveExecutionFinalReadinessGateScope,
  };
}

function buildOro6zFinalExecutionRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture",
    phase: ORO_6Z_PHASE,
    oro6yFinalReadinessGateEvidence: buildOro6yEvidenceFromSummary(
      BASELINE_ORO6Y_SUMMARY
    ),
    finalExecutionRequestEvidence: {
      actualExternalCallExecutionFinalExecutionRequestPrepared: true,
      actualExternalCallExecutionFinalExecutionRequestSubmitted: true,
      actualExternalCallExecutionFinalExecutionRequestStatus:
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
      actualExternalCallExecutionFinalExecutionRequestScope:
        FINAL_EXECUTION_REQUEST_ONLY,
      actualExternalCallExecutionFinalExecutionDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionDecision: true,
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
  const baseline = buildOro6zFinalExecutionRequestInput();
  const merged = deepMerge(baseline, source);
  const oro6y = isPlainObject(merged.oro6yFinalReadinessGateEvidence)
    ? merged.oro6yFinalReadinessGateEvidence
    : {};
  const request = isPlainObject(merged.finalExecutionRequestEvidence)
    ? merged.finalExecutionRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate:
      readBoolean(
        oro6y,
        "dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate",
        true
      ),
    oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
      readBoolean(
        oro6y,
        "oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y:
      readBoolean(
        oro6y,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y:
      readBoolean(
        oro6y,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y:
      readBoolean(
        oro6y,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y",
        true
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y:
      readString(
        oro6y,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST
      ),
    actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y:
      readString(
        oro6y,
        "actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y",
        FINAL_READINESS_ONLY
      ),
    actualExternalCallExecutionFinalExecutionRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionFinalExecutionRequestPrepared",
      true
    ),
    actualExternalCallExecutionFinalExecutionRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionFinalExecutionRequestSubmitted",
      true
    ),
    actualExternalCallExecutionFinalExecutionRequestStatus: readString(
      request,
      "actualExternalCallExecutionFinalExecutionRequestStatus",
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION
    ),
    actualExternalCallExecutionFinalExecutionRequestScope: readString(
      request,
      "actualExternalCallExecutionFinalExecutionRequestScope",
      FINAL_EXECUTION_REQUEST_ONLY
    ),
    actualExternalCallExecutionFinalExecutionDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionFinalExecutionDecisionIssued",
      false
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
    nextPhaseRequiresSeparateActualExternalCallExecutionDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateActualExternalCallExecutionDecision",
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
      .dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate
  ) {
    blockers.push("ORO-6Y final readiness gate dependency is required");
  }
  if (
    !fixture
      .oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed
  ) {
    blockers.push("ORO-6Y final readiness gate must have passed");
  }
  if (
    !fixture
      .actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y ||
    !fixture
      .actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y ||
    !fixture
      .actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y ||
    fixture
      .actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST ||
    fixture
      .actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y !==
      FINAL_READINESS_ONLY
  ) {
    blockers.push("ORO-6Y final readiness gate must be ready for final request");
  }
  if (
    !fixture.actualExternalCallExecutionFinalExecutionRequestPrepared ||
    !fixture.actualExternalCallExecutionFinalExecutionRequestSubmitted ||
    fixture.actualExternalCallExecutionFinalExecutionRequestStatus !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION ||
    fixture.actualExternalCallExecutionFinalExecutionRequestScope !==
      FINAL_EXECUTION_REQUEST_ONLY
  ) {
    blockers.push("final execution request must be request-only and pending decision");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("final execution request must require separate human approval");
  }
  if (fixture.actualExternalCallExecutionFinalExecutionDecisionIssued) {
    blockers.push("final execution decision must not be issued in ORO-6Z");
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
    blockers.push("ORO-6Z must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during final execution request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during final execution request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during final execution request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during final execution request");
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
    phase: ORO_6Z_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult:
      result,
    dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate:
      fixture
        .dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate,
    oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
      pass &&
      fixture
        .oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y:
      pass &&
      fixture
        .actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y:
      pass &&
      fixture
        .actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y,
    actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y:
      pass &&
      fixture
        .actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y:
      pass
        ? fixture
            .actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y
        : HOLD,
    actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y:
      pass
        ? fixture
            .actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y
        : HOLD,
    actualExternalCallExecutionFinalExecutionRequestPrepared:
      pass && fixture.actualExternalCallExecutionFinalExecutionRequestPrepared,
    actualExternalCallExecutionFinalExecutionRequestSubmitted:
      pass && fixture.actualExternalCallExecutionFinalExecutionRequestSubmitted,
    actualExternalCallExecutionFinalExecutionRequestStatus: pass
      ? fixture.actualExternalCallExecutionFinalExecutionRequestStatus
      : HOLD,
    actualExternalCallExecutionFinalExecutionRequestScope: pass
      ? fixture.actualExternalCallExecutionFinalExecutionRequestScope
      : HOLD,
    actualExternalCallExecutionFinalExecutionDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionDecision:
      pass && fixture.nextPhaseRequiresSeparateActualExternalCallExecutionDecision,
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

function evaluateOro6zFinalExecutionRequestBoundary(
  input = buildOro6zFinalExecutionRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6zFinalExecutionRequestSummary(input = {}) {
  return evaluateOro6zFinalExecutionRequestBoundary(input);
}

function validateOro6zFinalExecutionRequestContract(input = {}) {
  return evaluateOro6zFinalExecutionRequestBoundary(input);
}

module.exports = {
  ORO_6Z_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
  FINAL_EXECUTION_REQUEST_ONLY,
  ORO6Z_FINAL_EXECUTION_REQUEST_BOUNDARY_STATUS,
  buildOro6zFinalExecutionRequestInput,
  evaluateOro6zFinalExecutionRequestBoundary,
  buildOro6zFinalExecutionRequestSummary,
  validateOro6zFinalExecutionRequestContract,
};
