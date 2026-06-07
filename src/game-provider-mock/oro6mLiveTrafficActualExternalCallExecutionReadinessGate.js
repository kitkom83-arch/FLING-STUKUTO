"use strict";

const {
  PASS: ORO6L_PASS,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
  validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
} = require("./oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");

const ORO_6M_PHASE = "ORO-6M";
const PASS = "PASS";
const HOLD = "HOLD";
const NOT_REQUESTED = "not_requested";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST =
  "ready_for_separate_actual_external_call_execution_enablement_request";

const ORO_6M_LIVE_EXECUTION_READINESS_STATUS = Object.freeze({
  PHASE: ORO_6M_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
});

const BASELINE_ORO6L_SUMMARY =
  validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
    buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary()
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

function buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture",
    phase: ORO_6M_PHASE,
    oro6lDecisionEvidence: {
      dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
        true,
      oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
        BASELINE_ORO6L_SUMMARY
          .liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult ===
        ORO6L_PASS,
      actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionPrepared === true,
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionIssued === true,
      actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionStatus,
      actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionScope,
      actualExternalCallExecutionAuthorizedFromOro6l:
        BASELINE_ORO6L_SUMMARY.actualExternalCallExecutionAuthorized === true,
      externalCallExecutionAuthorizedFromOro6l:
        BASELINE_ORO6L_SUMMARY.externalCallExecutionAuthorized === true,
      externalCallExecutionPerformedFromOro6l:
        BASELINE_ORO6L_SUMMARY.externalCallExecutionPerformed === true,
      externalNetworkAllowedFromOro6l:
        BASELINE_ORO6L_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6l:
        BASELINE_ORO6L_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6kRequestEvidence: {
      dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
        BASELINE_ORO6L_SUMMARY
          .dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary ===
        true,
      oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed:
        BASELINE_ORO6L_SUMMARY
          .oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed ===
        true,
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k ===
        true,
      actualExternalCallExecutionAuthorizationRequestStatusFromOro6k:
        BASELINE_ORO6L_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestStatusFromOro6k,
    },
    readinessGateEvidence: {
      liveExecutionReadinessGatePrepared: true,
      liveExecutionReadinessGateEvaluated: true,
      liveExecutionReadinessGatePassed: true,
      liveExecutionReadinessGateStatus:
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
    },
    enablementEvidence: {
      actualExternalCallExecutionEnablementRequestPrepared: false,
      actualExternalCallExecutionEnablementRequestSubmitted: false,
      actualExternalCallExecutionEnablementDecisionIssued: false,
      actualExternalCallExecutionEnablementDecisionStatus: NOT_REQUESTED,
      actualExternalCallExecutionEnabled: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest: true,
      nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision: true,
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
      srcAppChangedInOro6m: false,
      runtimeRouteControllerServiceChangedInOro6m: false,
      ledgerMockChangedInOro6m: false,
      prismaOrEnvChangedInOro6m: false,
      packageLockChangedInOro6m: false,
      stagingEnvExampleChangedInOro6m: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate();
  const merged = deepMerge(baseline, source);
  const oro6l = isPlainObject(merged.oro6lDecisionEvidence)
    ? merged.oro6lDecisionEvidence
    : {};
  const oro6k = isPlainObject(merged.oro6kRequestEvidence)
    ? merged.oro6kRequestEvidence
    : {};
  const gate = isPlainObject(merged.readinessGateEvidence)
    ? merged.readinessGateEvidence
    : {};
  const enablement = isPlainObject(merged.enablementEvidence)
    ? merged.enablementEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      readBoolean(
        oro6l,
        "dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
        true
      ),
    oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
      readBoolean(
        oro6l,
        "oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l:
      readBoolean(
        oro6l,
        "actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l:
      readBoolean(
        oro6l,
        "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l",
        true
      ),
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l: readString(
      oro6l,
      "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l",
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l: readString(
      oro6l,
      "actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l",
      LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionAuthorizedFromOro6l: readBoolean(
      oro6l,
      "actualExternalCallExecutionAuthorizedFromOro6l",
      false
    ),
    externalCallExecutionAuthorizedFromOro6l: readBoolean(
      oro6l,
      "externalCallExecutionAuthorizedFromOro6l",
      false
    ),
    externalCallExecutionPerformedFromOro6l: readBoolean(
      oro6l,
      "externalCallExecutionPerformedFromOro6l",
      false
    ),
    externalNetworkAllowedFromOro6l: readBoolean(
      oro6l,
      "externalNetworkAllowedFromOro6l",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6l: readBoolean(
      oro6l,
      "liveOroPlayApiCallAllowedFromOro6l",
      false
    ),
    dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      readBoolean(
        oro6k,
        "dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary",
        true
      ),
    oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed:
      readBoolean(
        oro6k,
        "oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed",
        true
      ),
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k:
      readBoolean(
        oro6k,
        "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k",
        true
      ),
    actualExternalCallExecutionAuthorizationRequestStatusFromOro6k: readString(
      oro6k,
      "actualExternalCallExecutionAuthorizationRequestStatusFromOro6k",
      SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
    ),
    liveExecutionReadinessGatePrepared: readBoolean(
      gate,
      "liveExecutionReadinessGatePrepared",
      true
    ),
    liveExecutionReadinessGateEvaluated: readBoolean(
      gate,
      "liveExecutionReadinessGateEvaluated",
      true
    ),
    liveExecutionReadinessGatePassed: readBoolean(
      gate,
      "liveExecutionReadinessGatePassed",
      true
    ),
    liveExecutionReadinessGateStatus: readString(
      gate,
      "liveExecutionReadinessGateStatus",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
    ),
    actualExternalCallExecutionEnablementRequestPrepared: readBoolean(
      enablement,
      "actualExternalCallExecutionEnablementRequestPrepared",
      false
    ),
    actualExternalCallExecutionEnablementRequestSubmitted: readBoolean(
      enablement,
      "actualExternalCallExecutionEnablementRequestSubmitted",
      false
    ),
    actualExternalCallExecutionEnablementDecisionIssued: readBoolean(
      enablement,
      "actualExternalCallExecutionEnablementDecisionIssued",
      false
    ),
    actualExternalCallExecutionEnablementDecisionStatus: readString(
      enablement,
      "actualExternalCallExecutionEnablementDecisionStatus",
      NOT_REQUESTED
    ),
    actualExternalCallExecutionEnabled: readBoolean(
      enablement,
      "actualExternalCallExecutionEnabled",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      enablement,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionAuthorized: readBoolean(
      enablement,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      enablement,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest:
      readBoolean(
        enablement,
        "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest",
        true
      ),
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision:
      readBoolean(
        enablement,
        "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      enablement,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      enablement,
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
    srcAppChangedInOro6m: readBoolean(files, "srcAppChangedInOro6m", false),
    runtimeRouteControllerServiceChangedInOro6m: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6m",
      false
    ),
    ledgerMockChangedInOro6m: readBoolean(files, "ledgerMockChangedInOro6m", false),
    prismaOrEnvChangedInOro6m: readBoolean(
      files,
      "prismaOrEnvChangedInOro6m",
      false
    ),
    packageLockChangedInOro6m: readBoolean(
      files,
      "packageLockChangedInOro6m",
      false
    ),
    stagingEnvExampleChangedInOro6m: readBoolean(
      files,
      "stagingEnvExampleChangedInOro6m",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture
      .dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary ||
    !fixture
      .oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed
  ) {
    blockers.push("ORO-6L actual execution authorization decision record is required");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l ||
    !fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l !==
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l !==
      LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6L decision must be readiness-only for live execution");
  }
  if (
    fixture.actualExternalCallExecutionAuthorizedFromOro6l ||
    fixture.externalCallExecutionAuthorizedFromOro6l ||
    fixture.externalCallExecutionPerformedFromOro6l ||
    fixture.externalNetworkAllowedFromOro6l ||
    fixture.liveOroPlayApiCallAllowedFromOro6l
  ) {
    blockers.push("ORO-6L must still have no actual execution authorization or call");
  }
  if (
    !fixture.dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary ||
    !fixture.oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed ||
    !fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k ||
    fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k !==
      SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
  ) {
    blockers.push("ORO-6K actual execution request evidence is required");
  }
  if (
    !fixture.liveExecutionReadinessGatePrepared ||
    !fixture.liveExecutionReadinessGateEvaluated ||
    !fixture.liveExecutionReadinessGatePassed ||
    fixture.liveExecutionReadinessGateStatus !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST
  ) {
    blockers.push(
      "ORO-6M live execution readiness gate must pass for separate enablement request"
    );
  }
  if (
    fixture.actualExternalCallExecutionEnablementRequestPrepared ||
    fixture.actualExternalCallExecutionEnablementRequestSubmitted ||
    fixture.actualExternalCallExecutionEnablementDecisionIssued ||
    fixture.actualExternalCallExecutionEnablementDecisionStatus !== NOT_REQUESTED ||
    fixture.actualExternalCallExecutionEnabled
  ) {
    blockers.push(
      "ORO-6M must not submit enablement request, issue enablement decision, or enable execution"
    );
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6M must not authorize or perform actual execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate enablement request and decision");
  }
  if (
    fixture.srcAppChangedInOro6m ||
    fixture.runtimeRouteControllerServiceChangedInOro6m ||
    fixture.ledgerMockChangedInOro6m ||
    fixture.prismaOrEnvChangedInOro6m ||
    fixture.packageLockChangedInOro6m ||
    fixture.stagingEnvExampleChangedInOro6m
  ) {
    blockers.push("ORO-6M must not change protected runtime, data, env, or lock files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live execution readiness");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live execution readiness");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live execution readiness");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live execution readiness");
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
    phase: ORO_6M_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionReadinessGateResult: result,
    dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
      fixture
        .dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed:
      pass &&
      fixture.oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed,
    actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l:
      pass &&
      fixture.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l,
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l:
      pass &&
      fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l: pass
      ? fixture.actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l
      : HOLD,
    actualExternalCallExecutionAuthorizedFromOro6l: false,
    externalCallExecutionAuthorizedFromOro6l: false,
    externalCallExecutionPerformedFromOro6l: false,
    externalNetworkAllowedFromOro6l: false,
    liveOroPlayApiCallAllowedFromOro6l: false,
    dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      fixture
        .dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed:
      pass &&
      fixture.oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed,
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k:
      pass &&
      fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k,
    actualExternalCallExecutionAuthorizationRequestStatusFromOro6k: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k
      : HOLD,
    liveExecutionReadinessGatePrepared:
      pass && fixture.liveExecutionReadinessGatePrepared,
    liveExecutionReadinessGateEvaluated:
      pass && fixture.liveExecutionReadinessGateEvaluated,
    liveExecutionReadinessGatePassed:
      pass && fixture.liveExecutionReadinessGatePassed,
    liveExecutionReadinessGateStatus: pass
      ? fixture.liveExecutionReadinessGateStatus
      : HOLD,
    actualExternalCallExecutionEnablementRequestPrepared: false,
    actualExternalCallExecutionEnablementRequestSubmitted: false,
    actualExternalCallExecutionEnablementDecisionIssued: false,
    actualExternalCallExecutionEnablementDecisionStatus: NOT_REQUESTED,
    actualExternalCallExecutionEnabled: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementRequest,
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision,
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

function validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(
  input = buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6mLiveExecutionReadinessSummary(input = {}) {
  return validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(input);
}

function assertOro6mStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(summary);
  if (
    report.actualExternalCallExecutionEnablementRequestSubmitted ||
    report.actualExternalCallExecutionEnablementDecisionIssued ||
    report.actualExternalCallExecutionEnabled ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6M still-no-external-call assertion failed");
  }
  return true;
}

function runOro6mLiveTrafficActualExternalCallExecutionReadinessGateHarness(
  input
) {
  return validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate(input);
}

module.exports = {
  ORO_6M_PHASE,
  PASS,
  HOLD,
  NOT_REQUESTED,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ENABLEMENT_REQUEST,
  ORO_6M_LIVE_EXECUTION_READINESS_STATUS,
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
  validateOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
  buildOro6mLiveExecutionReadinessSummary,
  assertOro6mStillNoExternalCall,
  runOro6mLiveTrafficActualExternalCallExecutionReadinessGateHarness,
};
