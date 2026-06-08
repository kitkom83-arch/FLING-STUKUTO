"use strict";

const {
  PASS: ORO6Z_PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
  FINAL_EXECUTION_REQUEST_ONLY,
  buildOro6zFinalExecutionRequestInput,
  validateOro6zFinalExecutionRequestContract,
} = require("./oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary");

const ORO_7A_PHASE = "ORO-7A";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY =
  "approved_for_separate_actual_external_call_execution_authorization_request_only";
const FINAL_EXECUTION_DECISION_ONLY = "final_execution_decision_only";

const ORO7A_FINAL_EXECUTION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7A_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
  FINAL_EXECUTION_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
});

const BASELINE_ORO6Z_SUMMARY =
  validateOro6zFinalExecutionRequestContract(buildOro6zFinalExecutionRequestInput());

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

function buildOro6zEvidenceFromSummary(summary) {
  return {
    dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary:
      true,
    oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult ===
      ORO6Z_PASS,
    actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z:
      summary.actualExternalCallExecutionFinalExecutionRequestPrepared === true,
    actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z:
      summary.actualExternalCallExecutionFinalExecutionRequestSubmitted === true,
    actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z:
      summary.actualExternalCallExecutionFinalExecutionRequestStatus,
    actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z:
      summary.actualExternalCallExecutionFinalExecutionRequestScope,
  };
}

function buildOro7aFinalExecutionDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture",
    phase: ORO_7A_PHASE,
    oro6zFinalExecutionRequestEvidence: buildOro6zEvidenceFromSummary(
      BASELINE_ORO6Z_SUMMARY
    ),
    finalExecutionDecisionEvidence: {
      actualExternalCallExecutionFinalExecutionDecisionPrepared: true,
      actualExternalCallExecutionFinalExecutionDecisionIssued: true,
      actualExternalCallExecutionFinalExecutionDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
      actualExternalCallExecutionFinalExecutionDecisionScope:
        FINAL_EXECUTION_DECISION_ONLY,
      actualExternalCallExecutionAuthorizationRequestSubmitted: false,
      actualExternalCallExecutionAuthorizationDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
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
  const baseline = buildOro7aFinalExecutionDecisionInput();
  const merged = deepMerge(baseline, source);
  const oro6z = isPlainObject(merged.oro6zFinalExecutionRequestEvidence)
    ? merged.oro6zFinalExecutionRequestEvidence
    : {};
  const decision = isPlainObject(merged.finalExecutionDecisionEvidence)
    ? merged.finalExecutionDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary:
      readBoolean(
        oro6z,
        "dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary",
        true
      ),
    oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed:
      readBoolean(
        oro6z,
        "oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z:
      readBoolean(
        oro6z,
        "actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z",
        true
      ),
    actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z:
      readBoolean(
        oro6z,
        "actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z",
        true
      ),
    actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z:
      readString(
        oro6z,
        "actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION
      ),
    actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z:
      readString(
        oro6z,
        "actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z",
        FINAL_EXECUTION_REQUEST_ONLY
      ),
    actualExternalCallExecutionFinalExecutionDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionFinalExecutionDecisionPrepared",
      true
    ),
    actualExternalCallExecutionFinalExecutionDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionFinalExecutionDecisionIssued",
      true
    ),
    actualExternalCallExecutionFinalExecutionDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionFinalExecutionDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY
    ),
    actualExternalCallExecutionFinalExecutionDecisionScope: readString(
      decision,
      "actualExternalCallExecutionFinalExecutionDecisionScope",
      FINAL_EXECUTION_DECISION_ONLY
    ),
    actualExternalCallExecutionAuthorizationRequestSubmitted: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorizationRequestSubmitted",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionIssued",
      false
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
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest",
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
      .dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary
  ) {
    blockers.push("ORO-6Z final execution request dependency is required");
  }
  if (
    !fixture
      .oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed
  ) {
    blockers.push("ORO-6Z final execution request boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z ||
    !fixture.actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z
  ) {
    blockers.push("ORO-6Z final execution request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION ||
    fixture.actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z !==
      FINAL_EXECUTION_REQUEST_ONLY
  ) {
    blockers.push("ORO-6Z final execution request must be pending decision");
  }
  if (
    !fixture.actualExternalCallExecutionFinalExecutionDecisionPrepared ||
    !fixture.actualExternalCallExecutionFinalExecutionDecisionIssued ||
    fixture.actualExternalCallExecutionFinalExecutionDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionFinalExecutionDecisionScope !==
      FINAL_EXECUTION_DECISION_ONLY
  ) {
    blockers.push("final execution decision must be decision-only and issued");
  }
  if (
    !fixture
      .nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("final execution decision must require separate authorization request");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationRequestSubmitted ||
    fixture.actualExternalCallExecutionAuthorizationDecisionIssued
  ) {
    blockers.push("authorization request and decision must not occur in ORO-7A");
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
    blockers.push("ORO-7A must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during final decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during final decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during final decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during final decision");
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
    phase: ORO_7A_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryResult:
      result,
    dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary:
      fixture
        .dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary,
    oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed:
      pass &&
      fixture
        .oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed,
    actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z:
      pass && fixture.actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z,
    actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z:
      pass && fixture.actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z,
    actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z: pass
      ? fixture.actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z
      : HOLD,
    actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z: pass
      ? fixture.actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z
      : HOLD,
    actualExternalCallExecutionFinalExecutionDecisionPrepared:
      pass && fixture.actualExternalCallExecutionFinalExecutionDecisionPrepared,
    actualExternalCallExecutionFinalExecutionDecisionIssued:
      pass && fixture.actualExternalCallExecutionFinalExecutionDecisionIssued,
    actualExternalCallExecutionFinalExecutionDecisionStatus: pass
      ? fixture.actualExternalCallExecutionFinalExecutionDecisionStatus
      : HOLD,
    actualExternalCallExecutionFinalExecutionDecisionScope: pass
      ? fixture.actualExternalCallExecutionFinalExecutionDecisionScope
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestSubmitted: false,
    actualExternalCallExecutionAuthorizationDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest,
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

function evaluateOro7aFinalExecutionDecisionBoundary(
  input = buildOro7aFinalExecutionDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7aFinalExecutionDecisionSummary(input = {}) {
  return evaluateOro7aFinalExecutionDecisionBoundary(input);
}

function validateOro7aFinalExecutionDecisionContract(input = {}) {
  return evaluateOro7aFinalExecutionDecisionBoundary(input);
}

module.exports = {
  ORO_7A_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
  ORO7A_FINAL_EXECUTION_DECISION_BOUNDARY_STATUS,
  buildOro7aFinalExecutionDecisionInput,
  evaluateOro7aFinalExecutionDecisionBoundary,
  buildOro7aFinalExecutionDecisionSummary,
  validateOro7aFinalExecutionDecisionContract,
};
