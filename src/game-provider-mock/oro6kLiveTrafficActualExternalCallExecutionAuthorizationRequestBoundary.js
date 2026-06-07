"use strict";

const {
  PASS: ORO6J_PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
  validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
} = require("./oro6jLiveTrafficExternalCallPreExecutionReadinessGate");

const ORO_6K_PHASE = "ORO-6K";
const PASS = "PASS";
const HOLD = "HOLD";
const PENDING = "pending";
const NOT_REQUESTED = "not_requested";
const SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION =
  "submitted_pending_actual_execution_decision";
const APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY =
  "approved_for_pre_execution_readiness_only";
const PRE_EXECUTION_READINESS_ONLY = "pre_execution_readiness_only";

const ORO_6K_ACTUAL_EXECUTION_AUTHORIZATION_REQUEST_STATUS = Object.freeze({
  PHASE: ORO_6K_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  PRE_EXECUTION_READINESS_ONLY,
});

const BASELINE_ORO6J_SUMMARY =
  validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
    buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate()
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

function buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture",
    phase: ORO_6K_PHASE,
    oro6jPreExecutionReadinessGateEvidence: {
      dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate: true,
      oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed:
        BASELINE_ORO6J_SUMMARY.liveTrafficExternalCallPreExecutionReadinessGateResult ===
        ORO6J_PASS,
      preExecutionReadinessGatePreparedFromOro6j:
        BASELINE_ORO6J_SUMMARY.preExecutionReadinessGatePrepared === true,
      preExecutionReadinessGateEvaluatedFromOro6j:
        BASELINE_ORO6J_SUMMARY.preExecutionReadinessGateEvaluated === true,
      preExecutionReadinessGatePassedFromOro6j:
        BASELINE_ORO6J_SUMMARY.preExecutionReadinessGatePassed === true,
      preExecutionReadinessGateStatusFromOro6j:
        BASELINE_ORO6J_SUMMARY.preExecutionReadinessGateStatus,
      actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j:
        BASELINE_ORO6J_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestPrepared === true,
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j:
        BASELINE_ORO6J_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestSubmitted === true,
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j:
        BASELINE_ORO6J_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionIssued === true,
      actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j:
        BASELINE_ORO6J_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionStatus,
      actualExternalCallExecutionAuthorizedFromOro6j:
        BASELINE_ORO6J_SUMMARY.actualExternalCallExecutionAuthorized === true,
      externalCallExecutionAuthorizedFromOro6j:
        BASELINE_ORO6J_SUMMARY.externalCallExecutionAuthorized === true,
      externalCallExecutionPerformedFromOro6j:
        BASELINE_ORO6J_SUMMARY.externalCallExecutionPerformed === true,
      externalNetworkAllowedFromOro6j:
        BASELINE_ORO6J_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6j:
        BASELINE_ORO6J_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6iDecisionEvidence: {
      dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
        BASELINE_ORO6J_SUMMARY
          .dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary ===
        true,
      oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed:
        BASELINE_ORO6J_SUMMARY
          .oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed ===
        true,
      externalCallExecutionAuthorizationDecisionStatusFromOro6i:
        BASELINE_ORO6J_SUMMARY
          .externalCallExecutionAuthorizationDecisionStatusFromOro6i,
      externalCallExecutionAuthorizationDecisionScopeFromOro6i:
        BASELINE_ORO6J_SUMMARY
          .externalCallExecutionAuthorizationDecisionScopeFromOro6i,
    },
    requestEvidence: {
      actualExternalCallExecutionAuthorizationRequestPrepared: true,
      actualExternalCallExecutionAuthorizationRequestSubmitted: true,
      actualExternalCallExecutionAuthorizationRequestStatus:
        SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
    },
    decisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssued: false,
      actualExternalCallExecutionAuthorizationDecisionStatus: PENDING,
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
    fileEvidence: {
      srcAppChangedInOro6k: false,
      runtimeRouteControllerServiceChangedInOro6k: false,
      ledgerMockChangedInOro6k: false,
      prismaOrEnvChangedInOro6k: false,
      packageLockChangedInOro6k: false,
      stagingEnvExampleChangedInOro6k: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary();
  const merged = deepMerge(baseline, source);
  const oro6j = isPlainObject(merged.oro6jPreExecutionReadinessGateEvidence)
    ? merged.oro6jPreExecutionReadinessGateEvidence
    : {};
  const oro6i = isPlainObject(merged.oro6iDecisionEvidence)
    ? merged.oro6iDecisionEvidence
    : {};
  const request = isPlainObject(merged.requestEvidence)
    ? merged.requestEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate: readBoolean(
      oro6j,
      "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate",
      true
    ),
    oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed: readBoolean(
      oro6j,
      "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed",
      true
    ),
    preExecutionReadinessGatePreparedFromOro6j: readBoolean(
      oro6j,
      "preExecutionReadinessGatePreparedFromOro6j",
      true
    ),
    preExecutionReadinessGateEvaluatedFromOro6j: readBoolean(
      oro6j,
      "preExecutionReadinessGateEvaluatedFromOro6j",
      true
    ),
    preExecutionReadinessGatePassedFromOro6j: readBoolean(
      oro6j,
      "preExecutionReadinessGatePassedFromOro6j",
      true
    ),
    preExecutionReadinessGateStatusFromOro6j: readString(
      oro6j,
      "preExecutionReadinessGateStatusFromOro6j",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
    ),
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j: readBoolean(
      oro6j,
      "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j",
      false
    ),
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j: readBoolean(
      oro6j,
      "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j: readBoolean(
      oro6j,
      "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j: readString(
      oro6j,
      "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionAuthorizedFromOro6j: readBoolean(
      oro6j,
      "actualExternalCallExecutionAuthorizedFromOro6j",
      false
    ),
    externalCallExecutionAuthorizedFromOro6j: readBoolean(
      oro6j,
      "externalCallExecutionAuthorizedFromOro6j",
      false
    ),
    externalCallExecutionPerformedFromOro6j: readBoolean(
      oro6j,
      "externalCallExecutionPerformedFromOro6j",
      false
    ),
    externalNetworkAllowedFromOro6j: readBoolean(
      oro6j,
      "externalNetworkAllowedFromOro6j",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6j: readBoolean(
      oro6j,
      "liveOroPlayApiCallAllowedFromOro6j",
      false
    ),
    dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
      readBoolean(
        oro6i,
        "dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary",
        true
      ),
    oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed: readBoolean(
      oro6i,
      "oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed",
      true
    ),
    externalCallExecutionAuthorizationDecisionStatusFromOro6i: readString(
      oro6i,
      "externalCallExecutionAuthorizationDecisionStatusFromOro6i",
      APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY
    ),
    externalCallExecutionAuthorizationDecisionScopeFromOro6i: readString(
      oro6i,
      "externalCallExecutionAuthorizationDecisionScopeFromOro6i",
      PRE_EXECUTION_READINESS_ONLY
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
      SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
    ),
    actualExternalCallExecutionAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionIssued",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionStatus: readString(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionStatus",
      PENDING
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
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision:
      readBoolean(
        decision,
        "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision",
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
    srcAppChangedInOro6k: readBoolean(files, "srcAppChangedInOro6k", false),
    runtimeRouteControllerServiceChangedInOro6k: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6k",
      false
    ),
    ledgerMockChangedInOro6k: readBoolean(files, "ledgerMockChangedInOro6k", false),
    prismaOrEnvChangedInOro6k: readBoolean(
      files,
      "prismaOrEnvChangedInOro6k",
      false
    ),
    packageLockChangedInOro6k: readBoolean(
      files,
      "packageLockChangedInOro6k",
      false
    ),
    stagingEnvExampleChangedInOro6k: readBoolean(
      files,
      "stagingEnvExampleChangedInOro6k",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate ||
    !fixture.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed ||
    !fixture.preExecutionReadinessGatePreparedFromOro6j ||
    !fixture.preExecutionReadinessGateEvaluatedFromOro6j
  ) {
    blockers.push("ORO-6J pre-execution readiness gate record is required");
  }
  if (
    !fixture.preExecutionReadinessGatePassedFromOro6j ||
    fixture.preExecutionReadinessGateStatusFromOro6j !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
  ) {
    blockers.push("ORO-6J pre-execution readiness gate must be ready");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j ||
    fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j ||
    fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j !==
      NOT_REQUESTED ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6j ||
    fixture.externalCallExecutionAuthorizedFromOro6j ||
    fixture.externalCallExecutionPerformedFromOro6j ||
    fixture.externalNetworkAllowedFromOro6j ||
    fixture.liveOroPlayApiCallAllowedFromOro6j
  ) {
    blockers.push("ORO-6J must still have no actual execution request or call");
  }
  if (
    !fixture.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary ||
    !fixture.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed ||
    fixture.externalCallExecutionAuthorizationDecisionStatusFromOro6i !==
      APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorizationDecisionScopeFromOro6i !==
      PRE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6I readiness-only decision record is required");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationRequestPrepared ||
    !fixture.actualExternalCallExecutionAuthorizationRequestSubmitted ||
    fixture.actualExternalCallExecutionAuthorizationRequestStatus !==
      SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
  ) {
    blockers.push("ORO-6K actual execution request must be submitted pending decision");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationDecisionIssued ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatus !== PENDING ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6K must not decide, authorize, or perform actual execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate actual execution decision");
  }
  if (
    fixture.srcAppChangedInOro6k ||
    fixture.runtimeRouteControllerServiceChangedInOro6k ||
    fixture.ledgerMockChangedInOro6k ||
    fixture.prismaOrEnvChangedInOro6k ||
    fixture.packageLockChangedInOro6k ||
    fixture.stagingEnvExampleChangedInOro6k
  ) {
    blockers.push("ORO-6K must not change protected runtime, data, env, or lock files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during actual execution request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during actual execution request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during actual execution request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during actual execution request");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent during request");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration and deploy must remain absent during request");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during request");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_6K_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult:
      result,
    dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate:
      fixture.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed:
      pass && fixture.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed,
    preExecutionReadinessGatePreparedFromOro6j:
      pass && fixture.preExecutionReadinessGatePreparedFromOro6j,
    preExecutionReadinessGateEvaluatedFromOro6j:
      pass && fixture.preExecutionReadinessGateEvaluatedFromOro6j,
    preExecutionReadinessGatePassedFromOro6j:
      pass && fixture.preExecutionReadinessGatePassedFromOro6j,
    preExecutionReadinessGateStatusFromOro6j: pass
      ? fixture.preExecutionReadinessGateStatusFromOro6j
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j: false,
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j: false,
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j: false,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j: NOT_REQUESTED,
    actualExternalCallExecutionAuthorizedFromOro6j: false,
    externalCallExecutionAuthorizedFromOro6j: false,
    externalCallExecutionPerformedFromOro6j: false,
    externalNetworkAllowedFromOro6j: false,
    liveOroPlayApiCallAllowedFromOro6j: false,
    dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
      fixture.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed:
      pass && fixture.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed,
    externalCallExecutionAuthorizationDecisionStatusFromOro6i: pass
      ? fixture.externalCallExecutionAuthorizationDecisionStatusFromOro6i
      : HOLD,
    externalCallExecutionAuthorizationDecisionScopeFromOro6i: pass
      ? fixture.externalCallExecutionAuthorizationDecisionScopeFromOro6i
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestPrepared:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestPrepared,
    actualExternalCallExecutionAuthorizationRequestSubmitted:
      pass && fixture.actualExternalCallExecutionAuthorizationRequestSubmitted,
    actualExternalCallExecutionAuthorizationRequestStatus: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestStatus
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionIssued: false,
    actualExternalCallExecutionAuthorizationDecisionStatus: PENDING,
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

function validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
  input = buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6kActualExecutionAuthorizationRequestSummary(input = {}) {
  return validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
    input
  );
}

function assertOro6kStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionAuthorizationDecisionIssued ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6K still-no-external-call assertion failed");
  }
  return true;
}

function runOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryHarness(
  input
) {
  return validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
    input
  );
}

module.exports = {
  ORO_6K_PHASE,
  PASS,
  HOLD,
  PENDING,
  NOT_REQUESTED,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  ORO_6K_ACTUAL_EXECUTION_AUTHORIZATION_REQUEST_STATUS,
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
  validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
  buildOro6kActualExecutionAuthorizationRequestSummary,
  assertOro6kStillNoExternalCall,
  runOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryHarness,
};
