"use strict";

const {
  PASS: ORO7C_PASS,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
  buildOro7cAuthorizationDecisionInput,
  validateOro7cAuthorizationDecisionContract,
} = require("./oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");

const ORO_7D_PHASE = "ORO-7D";
const PASS = "PASS";
const HOLD = "HOLD";
const SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION =
  "submitted_pending_actual_external_call_execution_activation_decision";
const ACTIVATION_REQUEST_ONLY = "activation_request_only";

const ORO7D_ACTIVATION_REQUEST_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7D_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  ACTIVATION_REQUEST_ONLY,
});

const BASELINE_ORO7C_SUMMARY =
  validateOro7cAuthorizationDecisionContract(buildOro7cAuthorizationDecisionInput());

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

function buildOro7cEvidenceFromSummary(summary) {
  return {
    dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      true,
    oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult ===
      ORO7C_PASS,
    actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c:
      summary.actualExternalCallExecutionAuthorizationDecisionPrepared === true,
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c:
      summary.actualExternalCallExecutionAuthorizationDecisionIssued === true,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c:
      summary.actualExternalCallExecutionAuthorizationDecisionStatus,
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c:
      summary.actualExternalCallExecutionAuthorizationDecisionScope,
  };
}

function buildOro7dActivationRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture",
    phase: ORO_7D_PHASE,
    oro7cAuthorizationDecisionEvidence: buildOro7cEvidenceFromSummary(
      BASELINE_ORO7C_SUMMARY
    ),
    activationRequestEvidence: {
      actualExternalCallExecutionActivationRequestPrepared: true,
      actualExternalCallExecutionActivationRequestSubmitted: true,
      actualExternalCallExecutionActivationRequestStatus:
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
      actualExternalCallExecutionActivationRequestScope: ACTIVATION_REQUEST_ONLY,
      actualExternalCallExecutionActivationDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
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
  const baseline = buildOro7dActivationRequestInput();
  const merged = deepMerge(baseline, source);
  const oro7c = isPlainObject(merged.oro7cAuthorizationDecisionEvidence)
    ? merged.oro7cAuthorizationDecisionEvidence
    : {};
  const request = isPlainObject(merged.activationRequestEvidence)
    ? merged.activationRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      readBoolean(
        oro7c,
        "dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
        true
      ),
    oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed:
      readBoolean(
        oro7c,
        "oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c:
      readBoolean(
        oro7c,
        "actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c:
      readBoolean(
        oro7c,
        "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c:
      readString(
        oro7c,
        "actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c:
      readString(
        oro7c,
        "actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c",
        AUTHORIZATION_DECISION_ONLY
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
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION
    ),
    actualExternalCallExecutionActivationRequestScope: readString(
      request,
      "actualExternalCallExecutionActivationRequestScope",
      ACTIVATION_REQUEST_ONLY
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionActivationDecisionIssued",
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
      .dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary
  ) {
    blockers.push("ORO-7C authorization decision dependency is required");
  }
  if (
    !fixture
      .oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed
  ) {
    blockers.push("ORO-7C authorization decision boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c ||
    !fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c
  ) {
    blockers.push("ORO-7C authorization decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c !==
      AUTHORIZATION_DECISION_ONLY
  ) {
    blockers.push("ORO-7C authorization decision must approve activation request only");
  }
  if (
    !fixture.actualExternalCallExecutionActivationRequestPrepared ||
    !fixture.actualExternalCallExecutionActivationRequestSubmitted ||
    fixture.actualExternalCallExecutionActivationRequestStatus !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION ||
    fixture.actualExternalCallExecutionActivationRequestScope !==
      ACTIVATION_REQUEST_ONLY
  ) {
    blockers.push("activation request must be request-only and submitted");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("activation request must require separate activation decision");
  }
  if (fixture.actualExternalCallExecutionActivationDecisionIssued) {
    blockers.push("activation decision must not occur in ORO-7D");
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
    blockers.push("ORO-7D must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during activation request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during activation request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during activation request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during activation request");
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
    phase: ORO_7D_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult:
      result,
    dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      fixture
        .dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed:
      pass &&
      fixture
        .oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed,
    actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c:
      pass && fixture.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c,
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c:
      pass && fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c
      : HOLD,
    actualExternalCallExecutionActivationRequestPrepared:
      pass && fixture.actualExternalCallExecutionActivationRequestPrepared,
    actualExternalCallExecutionActivationRequestSubmitted:
      pass && fixture.actualExternalCallExecutionActivationRequestSubmitted,
    actualExternalCallExecutionActivationRequestStatus: pass
      ? fixture.actualExternalCallExecutionActivationRequestStatus
      : HOLD,
    actualExternalCallExecutionActivationRequestScope: pass
      ? fixture.actualExternalCallExecutionActivationRequestScope
      : HOLD,
    actualExternalCallExecutionActivationDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
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

function evaluateOro7dActivationRequestBoundary(
  input = buildOro7dActivationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7dActivationRequestSummary(input = {}) {
  return evaluateOro7dActivationRequestBoundary(input);
}

function validateOro7dActivationRequestContract(input = {}) {
  return evaluateOro7dActivationRequestBoundary(input);
}

module.exports = {
  ORO_7D_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  ACTIVATION_REQUEST_ONLY,
  ORO7D_ACTIVATION_REQUEST_BOUNDARY_STATUS,
  buildOro7dActivationRequestInput,
  evaluateOro7dActivationRequestBoundary,
  buildOro7dActivationRequestSummary,
  validateOro7dActivationRequestContract,
};
