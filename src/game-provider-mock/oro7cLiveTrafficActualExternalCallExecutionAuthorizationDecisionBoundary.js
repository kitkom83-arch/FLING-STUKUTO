"use strict";

const {
  PASS: ORO7B_PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
  AUTHORIZATION_REQUEST_ONLY,
  buildOro7bAuthorizationRequestInput,
  validateOro7bAuthorizationRequestContract,
} = require("./oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");

const ORO_7C_PHASE = "ORO-7C";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY =
  "approved_for_separate_actual_external_call_execution_activation_request_only";
const AUTHORIZATION_DECISION_ONLY = "authorization_decision_only";

const ORO7C_AUTHORIZATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7C_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
  AUTHORIZATION_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
});

const BASELINE_ORO7B_SUMMARY =
  validateOro7bAuthorizationRequestContract(buildOro7bAuthorizationRequestInput());

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

function buildOro7bEvidenceFromSummary(summary) {
  return {
    dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      true,
    oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult ===
      ORO7B_PASS,
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b:
      summary.actualExternalCallExecutionAuthorizationRequestPrepared === true,
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b:
      summary.actualExternalCallExecutionAuthorizationRequestSubmitted === true,
    actualExternalCallExecutionAuthorizationRequestStatusFromOro7b:
      summary.actualExternalCallExecutionAuthorizationRequestStatus,
    actualExternalCallExecutionAuthorizationRequestScopeFromOro7b:
      summary.actualExternalCallExecutionAuthorizationRequestScope,
  };
}

function buildOro7cAuthorizationDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture",
    phase: ORO_7C_PHASE,
    oro7bAuthorizationRequestEvidence: buildOro7bEvidenceFromSummary(
      BASELINE_ORO7B_SUMMARY
    ),
    authorizationDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionPrepared: true,
      actualExternalCallExecutionAuthorizationDecisionIssued: true,
      actualExternalCallExecutionAuthorizationDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
      actualExternalCallExecutionAuthorizationDecisionScope:
        AUTHORIZATION_DECISION_ONLY,
      actualExternalCallExecutionActivationRequestSubmitted: false,
      actualExternalCallExecutionActivationDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest:
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
  const baseline = buildOro7cAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const oro7b = isPlainObject(merged.oro7bAuthorizationRequestEvidence)
    ? merged.oro7bAuthorizationRequestEvidence
    : {};
  const decision = isPlainObject(merged.authorizationDecisionEvidence)
    ? merged.authorizationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      readBoolean(
        oro7b,
        "dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary",
        true
      ),
    oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed:
      readBoolean(
        oro7b,
        "oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b:
      readBoolean(
        oro7b,
        "actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b",
        true
      ),
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b:
      readBoolean(
        oro7b,
        "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b",
        true
      ),
    actualExternalCallExecutionAuthorizationRequestStatusFromOro7b:
      readString(
        oro7b,
        "actualExternalCallExecutionAuthorizationRequestStatusFromOro7b",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION
      ),
    actualExternalCallExecutionAuthorizationRequestScopeFromOro7b:
      readString(
        oro7b,
        "actualExternalCallExecutionAuthorizationRequestScopeFromOro7b",
        AUTHORIZATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionAuthorizationDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionPrepared",
      true
    ),
    actualExternalCallExecutionAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionIssued",
      true
    ),
    actualExternalCallExecutionAuthorizationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY
    ),
    actualExternalCallExecutionAuthorizationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionScope",
      AUTHORIZATION_DECISION_ONLY
    ),
    actualExternalCallExecutionActivationRequestSubmitted: readBoolean(
      decision,
      "actualExternalCallExecutionActivationRequestSubmitted",
      false
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionActivationDecisionIssued",
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
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest",
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
      .dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary
  ) {
    blockers.push("ORO-7B authorization request dependency is required");
  }
  if (
    !fixture
      .oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed
  ) {
    blockers.push("ORO-7B authorization request boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b ||
    !fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b
  ) {
    blockers.push("ORO-7B authorization request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro7b !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION ||
    fixture.actualExternalCallExecutionAuthorizationRequestScopeFromOro7b !==
      AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("ORO-7B authorization request must be pending decision");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationDecisionPrepared ||
    !fixture.actualExternalCallExecutionAuthorizationDecisionIssued ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionAuthorizationDecisionScope !==
      AUTHORIZATION_DECISION_ONLY
  ) {
    blockers.push("authorization decision must be decision-only and issued");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("authorization decision must require separate activation request");
  }
  if (
    fixture.actualExternalCallExecutionActivationRequestSubmitted ||
    fixture.actualExternalCallExecutionActivationDecisionIssued
  ) {
    blockers.push("activation request and decision must not occur in ORO-7C");
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
    blockers.push("ORO-7C must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during authorization decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during authorization decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during authorization decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during authorization decision");
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
    phase: ORO_7C_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult:
      result,
    dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      fixture
        .dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed:
      pass &&
      fixture
        .oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed,
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b,
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b,
    actualExternalCallExecutionAuthorizationRequestStatusFromOro7b: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro7b
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestScopeFromOro7b: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestScopeFromOro7b
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionPrepared:
      pass && fixture.actualExternalCallExecutionAuthorizationDecisionPrepared,
    actualExternalCallExecutionAuthorizationDecisionIssued:
      pass && fixture.actualExternalCallExecutionAuthorizationDecisionIssued,
    actualExternalCallExecutionAuthorizationDecisionStatus: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionStatus
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionScope: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionScope
      : HOLD,
    actualExternalCallExecutionActivationRequestSubmitted: false,
    actualExternalCallExecutionActivationDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest,
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

function evaluateOro7cAuthorizationDecisionBoundary(
  input = buildOro7cAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7cAuthorizationDecisionSummary(input = {}) {
  return evaluateOro7cAuthorizationDecisionBoundary(input);
}

function validateOro7cAuthorizationDecisionContract(input = {}) {
  return evaluateOro7cAuthorizationDecisionBoundary(input);
}

module.exports = {
  ORO_7C_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
  ORO7C_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  buildOro7cAuthorizationDecisionInput,
  evaluateOro7cAuthorizationDecisionBoundary,
  buildOro7cAuthorizationDecisionSummary,
  validateOro7cAuthorizationDecisionContract,
};
