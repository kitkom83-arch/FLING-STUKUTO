"use strict";

const {
  PASS: ORO7E_PASS,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ACTIVATION_DECISION_ONLY,
  buildOro7eActivationDecisionInput,
  validateOro7eActivationDecisionContract,
} = require("./oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const ORO_7F_PHASE = "ORO-7F";
const PASS = "PASS";
const HOLD = "HOLD";
const SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION =
  "submitted_pending_actual_external_call_execution_runtime_enablement_decision";
const RUNTIME_ENABLEMENT_REQUEST_ONLY = "runtime_enablement_request_only";

const ORO7F_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY_STATUS = Object.freeze({
  PHASE: ORO_7F_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ACTIVATION_DECISION_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
});

const BASELINE_ORO7E_SUMMARY =
  validateOro7eActivationDecisionContract(buildOro7eActivationDecisionInput());

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

function buildOro7eEvidenceFromSummary(summary) {
  return {
    dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      true,
    oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed:
      summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult ===
      ORO7E_PASS,
    actualExternalCallExecutionActivationDecisionPreparedFromOro7e:
      summary.actualExternalCallExecutionActivationDecisionPrepared === true,
    actualExternalCallExecutionActivationDecisionIssuedFromOro7e:
      summary.actualExternalCallExecutionActivationDecisionIssued === true,
    actualExternalCallExecutionActivationDecisionStatusFromOro7e:
      summary.actualExternalCallExecutionActivationDecisionStatus,
    actualExternalCallExecutionActivationDecisionScopeFromOro7e:
      summary.actualExternalCallExecutionActivationDecisionScope,
  };
}

function buildOro7fRuntimeEnablementRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture",
    phase: ORO_7F_PHASE,
    oro7eActivationDecisionEvidence: buildOro7eEvidenceFromSummary(
      BASELINE_ORO7E_SUMMARY
    ),
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestPrepared: true,
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: true,
      actualExternalCallExecutionRuntimeEnablementRequestStatus:
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
      actualExternalCallExecutionRuntimeEnablementRequestScope:
        RUNTIME_ENABLEMENT_REQUEST_ONLY,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
      actualExternalCallExecutionLiveExecutionApproved: false,
      actualExternalCallExecutionActivated: false,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionRouteEnabled: false,
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
  const baseline = buildOro7fRuntimeEnablementRequestInput();
  const merged = deepMerge(baseline, source);
  const oro7e = isPlainObject(merged.oro7eActivationDecisionEvidence)
    ? merged.oro7eActivationDecisionEvidence
    : {};
  const request = isPlainObject(merged.runtimeEnablementRequestEvidence)
    ? merged.runtimeEnablementRequestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      readBoolean(
        oro7e,
        "dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary",
        true
      ),
    oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed:
      readBoolean(
        oro7e,
        "oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed",
        true
      ),
    actualExternalCallExecutionActivationDecisionPreparedFromOro7e:
      readBoolean(
        oro7e,
        "actualExternalCallExecutionActivationDecisionPreparedFromOro7e",
        true
      ),
    actualExternalCallExecutionActivationDecisionIssuedFromOro7e:
      readBoolean(
        oro7e,
        "actualExternalCallExecutionActivationDecisionIssuedFromOro7e",
        true
      ),
    actualExternalCallExecutionActivationDecisionStatusFromOro7e:
      readString(
        oro7e,
        "actualExternalCallExecutionActivationDecisionStatusFromOro7e",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY
      ),
    actualExternalCallExecutionActivationDecisionScopeFromOro7e:
      readString(
        oro7e,
        "actualExternalCallExecutionActivationDecisionScopeFromOro7e",
        ACTIVATION_DECISION_ONLY
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
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION
    ),
    actualExternalCallExecutionRuntimeEnablementRequestScope: readString(
      request,
      "actualExternalCallExecutionRuntimeEnablementRequestScope",
      RUNTIME_ENABLEMENT_REQUEST_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      request,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
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
    actualExternalCallExecutionRouteEnabled: readBoolean(
      request,
      "actualExternalCallExecutionRouteEnabled",
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

  if (!fixture.dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary) {
    blockers.push("ORO-7E activation decision dependency is required");
  }
  if (!fixture.oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed) {
    blockers.push("ORO-7E activation decision boundary must have passed");
  }
  if (
    !fixture.actualExternalCallExecutionActivationDecisionPreparedFromOro7e ||
    !fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro7e
  ) {
    blockers.push("ORO-7E activation decision must be issued");
  }
  if (
    fixture.actualExternalCallExecutionActivationDecisionStatusFromOro7e !==
      APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY ||
    fixture.actualExternalCallExecutionActivationDecisionScopeFromOro7e !==
      ACTIVATION_DECISION_ONLY
  ) {
    blockers.push("ORO-7E activation decision must approve request-only runtime enablement");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestStatus !==
      SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION ||
    fixture.actualExternalCallExecutionRuntimeEnablementRequestScope !==
      RUNTIME_ENABLEMENT_REQUEST_ONLY
  ) {
    blockers.push("runtime enablement request must be submitted as request-only");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("runtime enablement request must require separate human decision");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued) {
    blockers.push("runtime enablement decision must not occur in ORO-7F");
  }
  if (
    fixture.actualExternalCallExecutionLiveExecutionApproved ||
    fixture.actualExternalCallExecutionActivated ||
    fixture.actualExternalCallExecutionRuntimeEnabled ||
    fixture.actualExternalCallExecutionEnabled ||
    fixture.actualExternalCallExecutionRouteEnabled ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-7F must not approve, activate, enable, authorize, route, or execute");
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
    phase: ORO_7F_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult:
      result,
    dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
      fixture.dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed:
      pass && fixture.oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed,
    actualExternalCallExecutionActivationDecisionPreparedFromOro7e:
      pass && fixture.actualExternalCallExecutionActivationDecisionPreparedFromOro7e,
    actualExternalCallExecutionActivationDecisionIssuedFromOro7e:
      pass && fixture.actualExternalCallExecutionActivationDecisionIssuedFromOro7e,
    actualExternalCallExecutionActivationDecisionStatusFromOro7e: pass
      ? fixture.actualExternalCallExecutionActivationDecisionStatusFromOro7e
      : HOLD,
    actualExternalCallExecutionActivationDecisionScopeFromOro7e: pass
      ? fixture.actualExternalCallExecutionActivationDecisionScopeFromOro7e
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementRequestPrepared,
    actualExternalCallExecutionRuntimeEnablementRequestSubmitted:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmitted,
    actualExternalCallExecutionRuntimeEnablementRequestStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementRequestScope: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestScope
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
    actualExternalCallExecutionLiveExecutionApproved: false,
    actualExternalCallExecutionActivated: false,
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

function evaluateOro7fRuntimeEnablementRequestBoundary(
  input = buildOro7fRuntimeEnablementRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro7fRuntimeEnablementRequestSummary(input = {}) {
  return evaluateOro7fRuntimeEnablementRequestBoundary(input);
}

function validateOro7fRuntimeEnablementRequestContract(input = {}) {
  return evaluateOro7fRuntimeEnablementRequestBoundary(input);
}

module.exports = {
  ORO_7F_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ORO7F_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY_STATUS,
  buildOro7fRuntimeEnablementRequestInput,
  evaluateOro7fRuntimeEnablementRequestBoundary,
  buildOro7fRuntimeEnablementRequestSummary,
  validateOro7fRuntimeEnablementRequestContract,
};
