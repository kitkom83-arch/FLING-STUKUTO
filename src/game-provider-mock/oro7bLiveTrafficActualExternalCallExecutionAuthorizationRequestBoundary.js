"use strict";

const {
  PASS: ORO7A_PASS,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
  buildOro7aFinalExecutionDecisionInput,
  validateOro7aFinalExecutionDecisionContract,
} = require("./oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary");

const ORO_7B_PHASE = "ORO-7B";
const PASS = "PASS";
const HOLD = "HOLD";
const SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION =
  "submitted_pending_actual_external_call_execution_authorization_decision";
const AUTHORIZATION_REQUEST_ONLY = "authorization_request_only";

const ORO7B_AUTHORIZATION_REQUEST_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7B_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
  AUTHORIZATION_REQUEST_ONLY,
});

const BASELINE_ORO7A_SUMMARY =
  validateOro7aFinalExecutionDecisionContract(buildOro7aFinalExecutionDecisionInput());

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

function buildOro7aEvidenceFromSummary(summary) {
  return {
    dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary:
      true,
    oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryResult ===
      ORO7A_PASS,
    actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a:
      summary.actualExternalCallExecutionFinalExecutionDecisionPrepared === true,
    actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a:
      summary.actualExternalCallExecutionFinalExecutionDecisionIssued === true,
    actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a:
      summary.actualExternalCallExecutionFinalExecutionDecisionStatus,
    actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a:
      summary.actualExternalCallExecutionFinalExecutionDecisionScope,
  };
}

function buildOro7bAuthorizationRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture",
    phase: ORO_7B_PHASE,
    oro7aFinalExecutionDecisionEvidence: buildOro7aEvidenceFromSummary(
      BASELINE_ORO7A_SUMMARY
    ),
    authorizationRequestEvidence: {
      actualExternalCallExecutionAuthorizationRequestPrepared: true,
      actualExternalCallExecutionAuthorizationRequestSubmitted: true,
      actualExternalCallExecutionAuthorizationRequestStatus:
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
      actualExternalCallExecutionAuthorizationRequestScope:
        AUTHORIZATION_REQUEST_ONLY,
      actualExternalCallExecutionAuthorizationDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision:
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
  const baseline = buildOro7bAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const oro7a = isPlainObject(merged.oro7aFinalExecutionDecisionEvidence)
    ? merged.oro7aFinalExecutionDecisionEvidence
    : {};
  const request = isPlainObject(merged.authorizationRequestEvidence)
    ? merged.authorizationRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary:
      readBoolean(
        oro7a,
        "dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary",
        true
      ),
    oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed:
      readBoolean(
        oro7a,
        "oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a:
      readBoolean(
        oro7a,
        "actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a",
        true
      ),
    actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a:
      readBoolean(
        oro7a,
        "actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a",
        true
      ),
    actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a:
      readString(
        oro7a,
        "actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a:
      readString(
        oro7a,
        "actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a",
        FINAL_EXECUTION_DECISION_ONLY
      ),
    actualExternalCallExecutionAuthorizationRequestPrepared: readBoolean(
      request,
      "actualExternalCallExecutionAuthorizationRequestPrepared",
      true
    ),
    actualExternalCallExecutionAuthorizationRequestSubmitted: readBoolean(
      request,
      "actualExternalCallExecutionAuthorizationRequestSubmitted",
      true
    ),
    actualExternalCallExecutionAuthorizationRequestStatus: readString(
      request,
      "actualExternalCallExecutionAuthorizationRequestStatus",
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION
    ),
    actualExternalCallExecutionAuthorizationRequestScope: readString(
      request,
      "actualExternalCallExecutionAuthorizationRequestScope",
      AUTHORIZATION_REQUEST_ONLY
    ),
    actualExternalCallExecutionAuthorizationDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionAuthorizationDecisionIssued",
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
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision:
      readBoolean(
        request,
        "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision",
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
      .dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary
  ) {
    blockers.push("ORO-7A final execution decision dependency is required");
  }
  if (
    !fixture
      .oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed
  ) {
    blockers.push("ORO-7A final execution decision boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a ||
    !fixture.actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a
  ) {
    blockers.push("ORO-7A final execution decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a !==
      FINAL_EXECUTION_DECISION_ONLY
  ) {
    blockers.push(
      "ORO-7A final execution decision must approve separate authorization request only"
    );
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationRequestPrepared ||
    !fixture.actualExternalCallExecutionAuthorizationRequestSubmitted ||
    fixture.actualExternalCallExecutionAuthorizationRequestStatus !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION ||
    fixture.actualExternalCallExecutionAuthorizationRequestScope !==
      AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("authorization request must be request-only and pending decision");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("authorization request must require separate human approval");
  }
  if (fixture.actualExternalCallExecutionAuthorizationDecisionIssued) {
    blockers.push("authorization decision must not be issued in ORO-7B");
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
    blockers.push("ORO-7B must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during authorization request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during authorization request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during authorization request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during authorization request");
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
    phase: ORO_7B_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult:
      result,
    dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary:
      fixture
        .dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary,
    oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed:
      pass &&
      fixture
        .oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed,
    actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a:
      pass &&
      fixture.actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a,
    actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a:
      pass &&
      fixture.actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a,
    actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a: pass
      ? fixture.actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a
      : HOLD,
    actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a: pass
      ? fixture.actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestPrepared:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestPrepared,
    actualExternalCallExecutionAuthorizationRequestSubmitted:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestSubmitted,
    actualExternalCallExecutionAuthorizationRequestStatus: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestStatus
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestScope: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestScope
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision,
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

function evaluateOro7bAuthorizationRequestBoundary(
  input = buildOro7bAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7bAuthorizationRequestSummary(input = {}) {
  return evaluateOro7bAuthorizationRequestBoundary(input);
}

function validateOro7bAuthorizationRequestContract(input = {}) {
  return evaluateOro7bAuthorizationRequestBoundary(input);
}

module.exports = {
  ORO_7B_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
  AUTHORIZATION_REQUEST_ONLY,
  ORO7B_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  buildOro7bAuthorizationRequestInput,
  evaluateOro7bAuthorizationRequestBoundary,
  buildOro7bAuthorizationRequestSummary,
  validateOro7bAuthorizationRequestContract,
};
