"use strict";

const {
  PASS: ORO7D_PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  ACTIVATION_REQUEST_ONLY,
  buildOro7dActivationRequestInput,
  validateOro7dActivationRequestContract,
} = require("./oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary");

const ORO_7E_PHASE = "ORO-7E";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY =
  "approved_for_separate_actual_external_call_execution_runtime_enablement_request_only";
const ACTIVATION_DECISION_ONLY = "activation_decision_only";

const ORO7E_ACTIVATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7E_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  ACTIVATION_REQUEST_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ACTIVATION_DECISION_ONLY,
});

const BASELINE_ORO7D_SUMMARY =
  validateOro7dActivationRequestContract(buildOro7dActivationRequestInput());

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

function buildOro7dEvidenceFromSummary(summary) {
  return {
    dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      true,
    oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult ===
      ORO7D_PASS,
    actualExternalCallExecutionActivationRequestPreparedFromOro7d:
      summary.actualExternalCallExecutionActivationRequestPrepared === true,
    actualExternalCallExecutionActivationRequestSubmittedFromOro7d:
      summary.actualExternalCallExecutionActivationRequestSubmitted === true,
    actualExternalCallExecutionActivationRequestStatusFromOro7d:
      summary.actualExternalCallExecutionActivationRequestStatus,
    actualExternalCallExecutionActivationRequestScopeFromOro7d:
      summary.actualExternalCallExecutionActivationRequestScope,
  };
}

function buildOro7eActivationDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture",
    phase: ORO_7E_PHASE,
    oro7dActivationRequestEvidence: buildOro7dEvidenceFromSummary(
      BASELINE_ORO7D_SUMMARY
    ),
    activationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionPrepared: true,
      actualExternalCallExecutionActivationDecisionIssued: true,
      actualExternalCallExecutionActivationDecisionStatus:
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
      actualExternalCallExecutionActivationDecisionScope:
        ACTIVATION_DECISION_ONLY,
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: false,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
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
  const baseline = buildOro7eActivationDecisionInput();
  const merged = deepMerge(baseline, source);
  const oro7d = isPlainObject(merged.oro7dActivationRequestEvidence)
    ? merged.oro7dActivationRequestEvidence
    : {};
  const decision = isPlainObject(merged.activationDecisionEvidence)
    ? merged.activationDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      readBoolean(
        oro7d,
        "dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary",
        true
      ),
    oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed:
      readBoolean(
        oro7d,
        "oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed",
        true
      ),
    actualExternalCallExecutionActivationRequestPreparedFromOro7d:
      readBoolean(
        oro7d,
        "actualExternalCallExecutionActivationRequestPreparedFromOro7d",
        true
      ),
    actualExternalCallExecutionActivationRequestSubmittedFromOro7d:
      readBoolean(
        oro7d,
        "actualExternalCallExecutionActivationRequestSubmittedFromOro7d",
        true
      ),
    actualExternalCallExecutionActivationRequestStatusFromOro7d:
      readString(
        oro7d,
        "actualExternalCallExecutionActivationRequestStatusFromOro7d",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION
      ),
    actualExternalCallExecutionActivationRequestScopeFromOro7d:
      readString(
        oro7d,
        "actualExternalCallExecutionActivationRequestScopeFromOro7d",
        ACTIVATION_REQUEST_ONLY
      ),
    actualExternalCallExecutionActivationDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionActivationDecisionPrepared",
      true
    ),
    actualExternalCallExecutionActivationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionActivationDecisionIssued",
      true
    ),
    actualExternalCallExecutionActivationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionActivationDecisionStatus",
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY
    ),
    actualExternalCallExecutionActivationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionActivationDecisionScope",
      ACTIVATION_DECISION_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
      false
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest",
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

  if (!fixture.dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary) {
    blockers.push("ORO-7D activation request dependency is required");
  }
  if (!fixture.oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed) {
    blockers.push("ORO-7D activation request boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionActivationRequestPreparedFromOro7d ||
    !fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro7d
  ) {
    blockers.push("ORO-7D activation request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionActivationRequestStatusFromOro7d !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION ||
    fixture.actualExternalCallExecutionActivationRequestScopeFromOro7d !==
      ACTIVATION_REQUEST_ONLY
  ) {
    blockers.push("ORO-7D activation request must be pending decision");
  }
  if (
    !fixture.actualExternalCallExecutionActivationDecisionPrepared ||
    !fixture.actualExternalCallExecutionActivationDecisionIssued ||
    fixture.actualExternalCallExecutionActivationDecisionStatus !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionActivationDecisionScope !==
      ACTIVATION_DECISION_ONLY
  ) {
    blockers.push("activation decision must be decision-only and issued");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("activation decision must require separate runtime enablement request");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued
  ) {
    blockers.push("runtime enablement request and decision must not occur in ORO-7E");
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
    blockers.push("ORO-7E must not approve, activate, enable, authorize, or execute");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during activation decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during activation decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during activation decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during activation decision");
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
    phase: ORO_7E_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult:
      result,
    dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
      fixture.dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed:
      pass && fixture.oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed,
    actualExternalCallExecutionActivationRequestPreparedFromOro7d:
      pass && fixture.actualExternalCallExecutionActivationRequestPreparedFromOro7d,
    actualExternalCallExecutionActivationRequestSubmittedFromOro7d:
      pass && fixture.actualExternalCallExecutionActivationRequestSubmittedFromOro7d,
    actualExternalCallExecutionActivationRequestStatusFromOro7d: pass
      ? fixture.actualExternalCallExecutionActivationRequestStatusFromOro7d
      : HOLD,
    actualExternalCallExecutionActivationRequestScopeFromOro7d: pass
      ? fixture.actualExternalCallExecutionActivationRequestScopeFromOro7d
      : HOLD,
    actualExternalCallExecutionActivationDecisionPrepared:
      pass && fixture.actualExternalCallExecutionActivationDecisionPrepared,
    actualExternalCallExecutionActivationDecisionIssued:
      pass && fixture.actualExternalCallExecutionActivationDecisionIssued,
    actualExternalCallExecutionActivationDecisionStatus: pass
      ? fixture.actualExternalCallExecutionActivationDecisionStatus
      : HOLD,
    actualExternalCallExecutionActivationDecisionScope: pass
      ? fixture.actualExternalCallExecutionActivationDecisionScope
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted: false,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest,
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

function evaluateOro7eActivationDecisionBoundary(
  input = buildOro7eActivationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7eActivationDecisionSummary(input = {}) {
  return evaluateOro7eActivationDecisionBoundary(input);
}

function validateOro7eActivationDecisionContract(input = {}) {
  return evaluateOro7eActivationDecisionBoundary(input);
}

module.exports = {
  ORO_7E_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ACTIVATION_DECISION_ONLY,
  ORO7E_ACTIVATION_DECISION_BOUNDARY_STATUS,
  buildOro7eActivationDecisionInput,
  evaluateOro7eActivationDecisionBoundary,
  buildOro7eActivationDecisionSummary,
  validateOro7eActivationDecisionContract,
};
