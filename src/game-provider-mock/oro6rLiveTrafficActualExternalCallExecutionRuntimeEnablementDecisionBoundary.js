"use strict";

const {
  PASS: ORO6Q_PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
  buildOro6qRuntimeEnablementRequestSummary,
} = require("./oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");

const ORO_6R_PHASE = "ORO-6R";
const PASS = "PASS";
const APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY =
  "approved_for_runtime_execution_readiness_only";
const RUNTIME_EXECUTION_READINESS_ONLY = "runtime_execution_readiness_only";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_runtime_enablement_request";

const ORO_6R_RUNTIME_ENABLEMENT_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6R_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION,
  APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
  RUNTIME_EXECUTION_READINESS_ONLY,
});

const BASELINE_ORO6Q_SUMMARY = buildOro6qRuntimeEnablementRequestSummary();

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

function buildOro6qEvidenceFromSummary(summary) {
  return {
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      true,
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult ===
      ORO6Q_PASS,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared === true,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted === true,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementRequestStatus,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued === true,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    actualExternalCallExecutionRuntimeEnabledFromOro6q:
      summary.actualExternalCallExecutionRuntimeEnabled === true,
    actualExternalCallExecutionEnabledFromOro6q:
      summary.actualExternalCallExecutionEnabled === true,
    actualExternalCallExecutionAuthorizedFromOro6q:
      summary.actualExternalCallExecutionAuthorized === true,
    externalCallExecutionAuthorizedFromOro6q:
      summary.externalCallExecutionAuthorized === true,
    externalCallExecutionPerformedFromOro6q:
      summary.externalCallExecutionPerformed === true,
    externalNetworkAllowedFromOro6q: summary.externalNetworkAllowed === true,
    liveOroPlayApiCallAllowedFromOro6q:
      summary.liveOroPlayApiCallAllowed === true,
  };
}

function buildOro6pEvidenceFromOro6qSummary(summary) {
  return {
    dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
      summary.dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate ===
      true,
    oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed:
      summary.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed ===
      true,
    finalLiveExecutionReadinessGateStatusFromOro6p:
      summary.finalLiveExecutionReadinessGateStatusFromOro6p,
  };
}

function buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture",
    phase: ORO_6R_PHASE,
    oro6qRuntimeEnablementRequestEvidence:
      buildOro6qEvidenceFromSummary(BASELINE_ORO6Q_SUMMARY),
    oro6pFinalReadinessGateEvidence:
      buildOro6pEvidenceFromOro6qSummary(BASELINE_ORO6Q_SUMMARY),
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionPrepared: true,
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus:
        APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionRuntimeEnablementDecisionScope:
        RUNTIME_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionRuntimeEnabled: false,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate:
        true,
      nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest: true,
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
    buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6q = isPlainObject(merged.oro6qRuntimeEnablementRequestEvidence)
    ? merged.oro6qRuntimeEnablementRequestEvidence
    : {};
  const oro6p = isPlainObject(merged.oro6pFinalReadinessGateEvidence)
    ? merged.oro6pFinalReadinessGateEvidence
    : {};
  const decision = isPlainObject(merged.runtimeEnablementDecisionEvidence)
    ? merged.runtimeEnablementDecisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      readBoolean(
        oro6q,
        "dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
        true
      ),
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      readBoolean(
        oro6q,
        "oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q:
      readBoolean(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      readBoolean(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q",
        true
      ),
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q: readString(
      oro6q,
      "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q",
      SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q:
      readBoolean(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q",
        false
      ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q:
      readString(
        oro6q,
        "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q",
        PENDING
      ),
    actualExternalCallExecutionRuntimeEnabledFromOro6q: readBoolean(
      oro6q,
      "actualExternalCallExecutionRuntimeEnabledFromOro6q",
      false
    ),
    actualExternalCallExecutionEnabledFromOro6q: readBoolean(
      oro6q,
      "actualExternalCallExecutionEnabledFromOro6q",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6q: readBoolean(
      oro6q,
      "actualExternalCallExecutionAuthorizedFromOro6q",
      false
    ),
    externalCallExecutionAuthorizedFromOro6q: readBoolean(
      oro6q,
      "externalCallExecutionAuthorizedFromOro6q",
      false
    ),
    externalCallExecutionPerformedFromOro6q: readBoolean(
      oro6q,
      "externalCallExecutionPerformedFromOro6q",
      false
    ),
    externalNetworkAllowedFromOro6q: readBoolean(
      oro6q,
      "externalNetworkAllowedFromOro6q",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6q: readBoolean(
      oro6q,
      "liveOroPlayApiCallAllowedFromOro6q",
      false
    ),
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
    finalLiveExecutionReadinessGateStatusFromOro6p: readString(
      oro6p,
      "finalLiveExecutionReadinessGateStatusFromOro6p",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionPrepared: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionPrepared",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
      true
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
      APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionRuntimeEnablementDecisionScope: readString(
      decision,
      "actualExternalCallExecutionRuntimeEnablementDecisionScope",
      RUNTIME_EXECUTION_READINESS_ONLY
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
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate",
        true
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
      .dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary ||
    !fixture
      .oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed
  ) {
    blockers.push("ORO-6Q runtime enablement request boundary is required");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q ||
    !fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q
  ) {
    blockers.push("ORO-6Q runtime enablement request must be submitted");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q !==
    SUBMITTED_PENDING_RUNTIME_ENABLEMENT_DECISION
  ) {
    blockers.push("ORO-6Q runtime enablement request status must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q !==
      PENDING
  ) {
    blockers.push("ORO-6Q must not already issue runtime enablement decision");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabledFromOro6q) {
    blockers.push("ORO-6Q must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabledFromOro6q) {
    blockers.push("ORO-6Q must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6q ||
    fixture.externalCallExecutionAuthorizedFromOro6q
  ) {
    blockers.push("ORO-6Q must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformedFromOro6q) {
    blockers.push("ORO-6Q must not perform external call execution");
  }
  if (
    fixture.externalNetworkAllowedFromOro6q ||
    fixture.liveOroPlayApiCallAllowedFromOro6q
  ) {
    blockers.push("ORO-6Q must still have no external network or live OroPlay call");
  }
  if (
    !fixture
      .dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate ||
    !fixture.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed ||
    fixture.finalLiveExecutionReadinessGateStatusFromOro6p !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST
  ) {
    blockers.push("ORO-6P final readiness evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionPrepared ||
    !fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued
  ) {
    blockers.push("ORO-6R runtime enablement decision record must be issued");
  }
  if (
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus !==
      APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionRuntimeEnablementDecisionScope !==
      RUNTIME_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6R decision must be runtime execution readiness only");
  }
  if (fixture.actualExternalCallExecutionRuntimeEnabled) {
    blockers.push("ORO-6R must not enable actual external call execution runtime");
  }
  if (fixture.actualExternalCallExecutionEnabled) {
    blockers.push("ORO-6R must not enable actual external call execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6R must not authorize actual external call execution");
  }
  if (fixture.externalCallExecutionPerformed) {
    blockers.push("ORO-6R must not perform external call execution");
  }
  if (
    !fixture
      .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate runtime final readiness and activation approval");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during runtime enablement decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during runtime enablement decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during runtime enablement decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during runtime enablement decision");
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
    phase: ORO_6R_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult:
      result,
    dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
      fixture
        .dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
      pass &&
      fixture
        .oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed,
    actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q,
    actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q:
      pass &&
      fixture.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q,
    actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q: false,
    actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q:
      PENDING,
    actualExternalCallExecutionRuntimeEnabledFromOro6q: false,
    actualExternalCallExecutionEnabledFromOro6q: false,
    actualExternalCallExecutionAuthorizedFromOro6q: false,
    externalCallExecutionAuthorizedFromOro6q: false,
    externalCallExecutionPerformedFromOro6q: false,
    externalNetworkAllowedFromOro6q: false,
    liveOroPlayApiCallAllowedFromOro6q: false,
    dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
      fixture
        .dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
    oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed:
      pass &&
      fixture.oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed,
    finalLiveExecutionReadinessGateStatusFromOro6p: pass
      ? fixture.finalLiveExecutionReadinessGateStatusFromOro6p
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionPrepared:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionPrepared,
    actualExternalCallExecutionRuntimeEnablementDecisionIssued:
      pass && fixture.actualExternalCallExecutionRuntimeEnablementDecisionIssued,
    actualExternalCallExecutionRuntimeEnablementDecisionStatus: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionStatus
      : HOLD,
    actualExternalCallExecutionRuntimeEnablementDecisionScope: pass
      ? fixture.actualExternalCallExecutionRuntimeEnablementDecisionScope
      : HOLD,
    actualExternalCallExecutionRuntimeEnabled: false,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate:
      pass &&
      fixture
        .nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeFinalReadinessGate,
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

function validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
  input =
    buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6rRuntimeEnablementDecisionSummary(input = {}) {
  return validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
    input
  );
}

function assertOro6rStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
        summary
      );
  if (
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
    throw new Error("ORO-6R still-no-external-call assertion failed");
  }
  return true;
}

function runOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryHarness(
  input
) {
  return validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6R_PHASE,
  PASS,
  HOLD,
  PENDING,
  APPROVED_FOR_RUNTIME_EXECUTION_READINESS_ONLY,
  RUNTIME_EXECUTION_READINESS_ONLY,
  ORO_6R_RUNTIME_ENABLEMENT_DECISION_STATUS,
  buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  validateOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  buildOro6rRuntimeEnablementDecisionSummary,
  assertOro6rStillNoExternalCall,
  runOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryHarness,
};
