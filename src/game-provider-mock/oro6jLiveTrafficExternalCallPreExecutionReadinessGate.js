"use strict";

const {
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  PASS: ORO6I_PASS,
  PRE_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
  validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
} = require("./oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary");

const ORO_6J_PHASE = "ORO-6J";
const PASS = "PASS";
const HOLD = "HOLD";
const NOT_REQUESTED = "not_requested";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_authorization_request";

const ORO_6J_PRE_EXECUTION_READINESS_STATUS = Object.freeze({
  PHASE: ORO_6J_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  PRE_EXECUTION_READINESS_ONLY,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  SUBMITTED_PENDING_EXECUTION_DECISION,
});

const BASELINE_ORO6I_SUMMARY =
  validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
    buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary()
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

function buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture",
    phase: ORO_6J_PHASE,
    oro6iDecisionEvidence: {
      dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
        true,
      oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed:
        BASELINE_ORO6I_SUMMARY
          .liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult ===
        ORO6I_PASS,
      externalCallExecutionAuthorizationDecisionPreparedFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionAuthorizationDecisionPrepared ===
        true,
      externalCallExecutionAuthorizationDecisionIssuedFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionAuthorizationDecisionIssued ===
        true,
      externalCallExecutionAuthorizationDecisionStatusFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionAuthorizationDecisionStatus,
      externalCallExecutionAuthorizationDecisionScopeFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionAuthorizationDecisionScope,
      externalCallExecutionAuthorizedFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionAuthorized === true,
      actualExternalCallExecutionAuthorizedFromOro6i:
        BASELINE_ORO6I_SUMMARY.actualExternalCallExecutionAuthorized === true,
      externalCallExecutionPerformedFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalCallExecutionPerformed === true,
      externalNetworkAllowedFromOro6i:
        BASELINE_ORO6I_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6i:
        BASELINE_ORO6I_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6hRequestEvidence: {
      dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
        BASELINE_ORO6I_SUMMARY
          .dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary ===
        true,
      oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed:
        BASELINE_ORO6I_SUMMARY
          .oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed ===
        true,
      externalCallExecutionAuthorizationRequestSubmittedFromOro6h:
        BASELINE_ORO6I_SUMMARY
          .externalCallExecutionAuthorizationRequestSubmittedFromOro6h === true,
      externalCallExecutionAuthorizationRequestStatusFromOro6h:
        BASELINE_ORO6I_SUMMARY
          .externalCallExecutionAuthorizationRequestStatusFromOro6h,
    },
    oro6gReadinessGateEvidence: {
      dependsOnOro6gLiveTrafficExternalCallReadinessGate:
        BASELINE_ORO6I_SUMMARY.dependsOnOro6gLiveTrafficExternalCallReadinessGate ===
        true,
      oro6gLiveTrafficExternalCallReadinessGatePassed:
        BASELINE_ORO6I_SUMMARY.oro6gLiveTrafficExternalCallReadinessGatePassed ===
        true,
      externalCallReadinessGateStatusFromOro6g:
        BASELINE_ORO6I_SUMMARY.externalCallReadinessGateStatusFromOro6g,
    },
    preExecutionReadinessGateEvidence: {
      preExecutionReadinessGatePrepared: true,
      preExecutionReadinessGateEvaluated: true,
      preExecutionReadinessGatePassed: true,
      preExecutionReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
    },
    actualExecutionAuthorizationEvidence: {
      actualExternalCallExecutionAuthorizationRequestPrepared: false,
      actualExternalCallExecutionAuthorizationRequestSubmitted: false,
      actualExternalCallExecutionAuthorizationDecisionIssued: false,
      actualExternalCallExecutionAuthorizationDecisionStatus: NOT_REQUESTED,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
        true,
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
      srcAppChangedInOro6j: false,
      runtimeRouteControllerServiceChangedInOro6j: false,
      ledgerMockChangedInOro6j: false,
      prismaOrEnvChangedInOro6j: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate();
  const merged = deepMerge(baseline, source);
  const oro6i = isPlainObject(merged.oro6iDecisionEvidence)
    ? merged.oro6iDecisionEvidence
    : {};
  const oro6h = isPlainObject(merged.oro6hRequestEvidence)
    ? merged.oro6hRequestEvidence
    : {};
  const oro6g = isPlainObject(merged.oro6gReadinessGateEvidence)
    ? merged.oro6gReadinessGateEvidence
    : {};
  const gate = isPlainObject(merged.preExecutionReadinessGateEvidence)
    ? merged.preExecutionReadinessGateEvidence
    : {};
  const actual = isPlainObject(merged.actualExecutionAuthorizationEvidence)
    ? merged.actualExecutionAuthorizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    externalCallExecutionAuthorizationDecisionPreparedFromOro6i: readBoolean(
      oro6i,
      "externalCallExecutionAuthorizationDecisionPreparedFromOro6i",
      true
    ),
    externalCallExecutionAuthorizationDecisionIssuedFromOro6i: readBoolean(
      oro6i,
      "externalCallExecutionAuthorizationDecisionIssuedFromOro6i",
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
    externalCallExecutionAuthorizedFromOro6i: readBoolean(
      oro6i,
      "externalCallExecutionAuthorizedFromOro6i",
      false
    ),
    actualExternalCallExecutionAuthorizedFromOro6i: readBoolean(
      oro6i,
      "actualExternalCallExecutionAuthorizedFromOro6i",
      false
    ),
    externalCallExecutionPerformedFromOro6i: readBoolean(
      oro6i,
      "externalCallExecutionPerformedFromOro6i",
      false
    ),
    externalNetworkAllowedFromOro6i: readBoolean(
      oro6i,
      "externalNetworkAllowedFromOro6i",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6i: readBoolean(
      oro6i,
      "liveOroPlayApiCallAllowedFromOro6i",
      false
    ),
    dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
      readBoolean(
        oro6h,
        "dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary",
        true
      ),
    oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed: readBoolean(
      oro6h,
      "oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed",
      true
    ),
    externalCallExecutionAuthorizationRequestSubmittedFromOro6h: readBoolean(
      oro6h,
      "externalCallExecutionAuthorizationRequestSubmittedFromOro6h",
      true
    ),
    externalCallExecutionAuthorizationRequestStatusFromOro6h: readString(
      oro6h,
      "externalCallExecutionAuthorizationRequestStatusFromOro6h",
      SUBMITTED_PENDING_EXECUTION_DECISION
    ),
    dependsOnOro6gLiveTrafficExternalCallReadinessGate: readBoolean(
      oro6g,
      "dependsOnOro6gLiveTrafficExternalCallReadinessGate",
      true
    ),
    oro6gLiveTrafficExternalCallReadinessGatePassed: readBoolean(
      oro6g,
      "oro6gLiveTrafficExternalCallReadinessGatePassed",
      true
    ),
    externalCallReadinessGateStatusFromOro6g: readString(
      oro6g,
      "externalCallReadinessGateStatusFromOro6g",
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
    ),
    preExecutionReadinessGatePrepared: readBoolean(
      gate,
      "preExecutionReadinessGatePrepared",
      true
    ),
    preExecutionReadinessGateEvaluated: readBoolean(
      gate,
      "preExecutionReadinessGateEvaluated",
      true
    ),
    preExecutionReadinessGatePassed: readBoolean(
      gate,
      "preExecutionReadinessGatePassed",
      true
    ),
    preExecutionReadinessGateStatus: readString(
      gate,
      "preExecutionReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
    ),
    actualExternalCallExecutionAuthorizationRequestPrepared: readBoolean(
      actual,
      "actualExternalCallExecutionAuthorizationRequestPrepared",
      false
    ),
    actualExternalCallExecutionAuthorizationRequestSubmitted: readBoolean(
      actual,
      "actualExternalCallExecutionAuthorizationRequestSubmitted",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionIssued: readBoolean(
      actual,
      "actualExternalCallExecutionAuthorizationDecisionIssued",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionStatus: readString(
      actual,
      "actualExternalCallExecutionAuthorizationDecisionStatus",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      actual,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionAuthorized: readBoolean(
      actual,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      actual,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
      readBoolean(
        actual,
        "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision:
      readBoolean(
        actual,
        "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      actual,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      actual,
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
    srcAppChangedInOro6j: readBoolean(files, "srcAppChangedInOro6j", false),
    runtimeRouteControllerServiceChangedInOro6j: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6j",
      false
    ),
    ledgerMockChangedInOro6j: readBoolean(files, "ledgerMockChangedInOro6j", false),
    prismaOrEnvChangedInOro6j: readBoolean(
      files,
      "prismaOrEnvChangedInOro6j",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary ||
    !fixture.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed ||
    !fixture.externalCallExecutionAuthorizationDecisionPreparedFromOro6i
  ) {
    blockers.push("ORO-6I execution authorization decision record is required");
  }
  if (!fixture.externalCallExecutionAuthorizationDecisionIssuedFromOro6i) {
    blockers.push("ORO-6I decision must be issued for pre-execution readiness");
  }
  if (
    fixture.externalCallExecutionAuthorizationDecisionStatusFromOro6i !==
      APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorizationDecisionScopeFromOro6i !==
      PRE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6I decision must be pre-execution readiness only");
  }
  if (
    fixture.externalCallExecutionAuthorizedFromOro6i ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6i ||
    fixture.externalCallExecutionPerformedFromOro6i ||
    fixture.externalNetworkAllowedFromOro6i ||
    fixture.liveOroPlayApiCallAllowedFromOro6i
  ) {
    blockers.push("ORO-6I must still have no actual external call execution");
  }
  if (
    !fixture.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary ||
    !fixture.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed ||
    !fixture.externalCallExecutionAuthorizationRequestSubmittedFromOro6h ||
    fixture.externalCallExecutionAuthorizationRequestStatusFromOro6h !==
      SUBMITTED_PENDING_EXECUTION_DECISION
  ) {
    blockers.push("ORO-6H execution authorization request record is required");
  }
  if (
    !fixture.dependsOnOro6gLiveTrafficExternalCallReadinessGate ||
    !fixture.oro6gLiveTrafficExternalCallReadinessGatePassed ||
    fixture.externalCallReadinessGateStatusFromOro6g !==
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
  ) {
    blockers.push("ORO-6G external call readiness gate record is required");
  }
  if (
    !fixture.preExecutionReadinessGatePrepared ||
    !fixture.preExecutionReadinessGateEvaluated ||
    !fixture.preExecutionReadinessGatePassed ||
    fixture.preExecutionReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
  ) {
    blockers.push("ORO-6J pre-execution readiness gate must pass");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationRequestPrepared ||
    fixture.actualExternalCallExecutionAuthorizationRequestSubmitted ||
    fixture.actualExternalCallExecutionAuthorizationDecisionIssued ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatus !== NOT_REQUESTED ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push(
      "ORO-6J must not request, authorize, or perform actual external call execution"
    );
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate actual execution approval");
  }
  if (
    fixture.srcAppChangedInOro6j ||
    fixture.runtimeRouteControllerServiceChangedInOro6j ||
    fixture.ledgerMockChangedInOro6j ||
    fixture.prismaOrEnvChangedInOro6j
  ) {
    blockers.push("ORO-6J must not change protected runtime, ledger, data, or env files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during pre-execution readiness");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during pre-execution readiness");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during pre-execution readiness");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during pre-execution readiness");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent during readiness");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration and deploy must remain absent during readiness");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during readiness");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_6J_PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallPreExecutionReadinessGateResult: result,
    dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
      fixture.dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
    oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed:
      pass && fixture.oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed,
    externalCallExecutionAuthorizationDecisionPreparedFromOro6i:
      pass && fixture.externalCallExecutionAuthorizationDecisionPreparedFromOro6i,
    externalCallExecutionAuthorizationDecisionIssuedFromOro6i:
      pass && fixture.externalCallExecutionAuthorizationDecisionIssuedFromOro6i,
    externalCallExecutionAuthorizationDecisionStatusFromOro6i: pass
      ? fixture.externalCallExecutionAuthorizationDecisionStatusFromOro6i
      : HOLD,
    externalCallExecutionAuthorizationDecisionScopeFromOro6i: pass
      ? fixture.externalCallExecutionAuthorizationDecisionScopeFromOro6i
      : HOLD,
    externalCallExecutionAuthorizedFromOro6i: false,
    actualExternalCallExecutionAuthorizedFromOro6i: false,
    externalCallExecutionPerformedFromOro6i: false,
    externalNetworkAllowedFromOro6i: false,
    liveOroPlayApiCallAllowedFromOro6i: false,
    dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
      fixture.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
    oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed:
      pass && fixture.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed,
    externalCallExecutionAuthorizationRequestSubmittedFromOro6h:
      pass && fixture.externalCallExecutionAuthorizationRequestSubmittedFromOro6h,
    externalCallExecutionAuthorizationRequestStatusFromOro6h: pass
      ? fixture.externalCallExecutionAuthorizationRequestStatusFromOro6h
      : HOLD,
    dependsOnOro6gLiveTrafficExternalCallReadinessGate:
      fixture.dependsOnOro6gLiveTrafficExternalCallReadinessGate,
    oro6gLiveTrafficExternalCallReadinessGatePassed:
      pass && fixture.oro6gLiveTrafficExternalCallReadinessGatePassed,
    externalCallReadinessGateStatusFromOro6g: pass
      ? fixture.externalCallReadinessGateStatusFromOro6g
      : HOLD,
    preExecutionReadinessGatePrepared:
      pass && fixture.preExecutionReadinessGatePrepared,
    preExecutionReadinessGateEvaluated:
      pass && fixture.preExecutionReadinessGateEvaluated,
    preExecutionReadinessGatePassed: pass && fixture.preExecutionReadinessGatePassed,
    preExecutionReadinessGateStatus: pass
      ? fixture.preExecutionReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionAuthorizationRequestPrepared: false,
    actualExternalCallExecutionAuthorizationRequestSubmitted: false,
    actualExternalCallExecutionAuthorizationDecisionIssued: false,
    actualExternalCallExecutionAuthorizationDecisionStatus: NOT_REQUESTED,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest,
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

function validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(
  input = buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6jPreExecutionReadinessSummary(input = {}) {
  return validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(input);
}

function assertOro6jStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(summary);
  if (
    report.actualExternalCallExecutionAuthorizationRequestPrepared ||
    report.actualExternalCallExecutionAuthorizationRequestSubmitted ||
    report.actualExternalCallExecutionAuthorizationDecisionIssued ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6J still-no-external-call assertion failed");
  }
  return true;
}

function runOro6jLiveTrafficExternalCallPreExecutionReadinessGateHarness(input) {
  return validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate(input);
}

module.exports = {
  ORO_6J_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST,
  ORO_6J_PRE_EXECUTION_READINESS_STATUS,
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
  validateOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
  buildOro6jPreExecutionReadinessSummary,
  assertOro6jStillNoExternalCall,
  runOro6jLiveTrafficExternalCallPreExecutionReadinessGateHarness,
};
