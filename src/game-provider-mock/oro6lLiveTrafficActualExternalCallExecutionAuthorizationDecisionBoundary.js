"use strict";

const {
  PASS: ORO6K_PASS,
  PENDING,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
  validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
} = require("./oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");

const ORO_6L_PHASE = "ORO-6L";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY =
  "approved_for_live_execution_readiness_only";
const LIVE_EXECUTION_READINESS_ONLY = "live_execution_readiness_only";
const READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST =
  "ready_for_separate_actual_external_call_execution_authorization_request";

const ORO_6L_ACTUAL_EXECUTION_AUTHORIZATION_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6L_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
});

const BASELINE_ORO6K_SUMMARY =
  validateOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary(
    buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary()
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

function buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture",
    phase: ORO_6L_PHASE,
    oro6kRequestEvidence: {
      dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
        true,
      oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed:
        BASELINE_ORO6K_SUMMARY
          .liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult ===
        ORO6K_PASS,
      actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k:
        BASELINE_ORO6K_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestPrepared === true,
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k:
        BASELINE_ORO6K_SUMMARY
          .actualExternalCallExecutionAuthorizationRequestSubmitted === true,
      actualExternalCallExecutionAuthorizationRequestStatusFromOro6k:
        BASELINE_ORO6K_SUMMARY.actualExternalCallExecutionAuthorizationRequestStatus,
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k:
        BASELINE_ORO6K_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionIssued === true,
      actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k:
        BASELINE_ORO6K_SUMMARY
          .actualExternalCallExecutionAuthorizationDecisionStatus,
      actualExternalCallExecutionAuthorizedFromOro6k:
        BASELINE_ORO6K_SUMMARY.actualExternalCallExecutionAuthorized === true,
      externalCallExecutionAuthorizedFromOro6k:
        BASELINE_ORO6K_SUMMARY.externalCallExecutionAuthorized === true,
      externalCallExecutionPerformedFromOro6k:
        BASELINE_ORO6K_SUMMARY.externalCallExecutionPerformed === true,
      externalNetworkAllowedFromOro6k:
        BASELINE_ORO6K_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6k:
        BASELINE_ORO6K_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6jPreExecutionReadinessGateEvidence: {
      dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate:
        BASELINE_ORO6K_SUMMARY
          .dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate ===
        true,
      oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed:
        BASELINE_ORO6K_SUMMARY
          .oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed ===
        true,
      preExecutionReadinessGateStatusFromOro6j:
        BASELINE_ORO6K_SUMMARY.preExecutionReadinessGateStatusFromOro6j,
    },
    decisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionPrepared: true,
      actualExternalCallExecutionAuthorizationDecisionIssued: true,
      actualExternalCallExecutionAuthorizationDecisionStatus:
        APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionAuthorizationDecisionScope:
        LIVE_EXECUTION_READINESS_ONLY,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparateLiveExecutionReadinessGate: true,
      nextPhaseRequiresSeparateActualExternalCallExecutionEnablement: true,
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
      srcAppChangedInOro6l: false,
      runtimeRouteControllerServiceChangedInOro6l: false,
      ledgerMockChangedInOro6l: false,
      prismaOrEnvChangedInOro6l: false,
      packageLockChangedInOro6l: false,
      stagingEnvExampleChangedInOro6l: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6k = isPlainObject(merged.oro6kRequestEvidence)
    ? merged.oro6kRequestEvidence
    : {};
  const oro6j = isPlainObject(merged.oro6jPreExecutionReadinessGateEvidence)
    ? merged.oro6jPreExecutionReadinessGateEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k:
      readBoolean(
        oro6k,
        "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k",
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
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k: readBoolean(
      oro6k,
      "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k",
      false
    ),
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k: readString(
      oro6k,
      "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k",
      PENDING
    ),
    actualExternalCallExecutionAuthorizedFromOro6k: readBoolean(
      oro6k,
      "actualExternalCallExecutionAuthorizedFromOro6k",
      false
    ),
    externalCallExecutionAuthorizedFromOro6k: readBoolean(
      oro6k,
      "externalCallExecutionAuthorizedFromOro6k",
      false
    ),
    externalCallExecutionPerformedFromOro6k: readBoolean(
      oro6k,
      "externalCallExecutionPerformedFromOro6k",
      false
    ),
    externalNetworkAllowedFromOro6k: readBoolean(
      oro6k,
      "externalNetworkAllowedFromOro6k",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6k: readBoolean(
      oro6k,
      "liveOroPlayApiCallAllowedFromOro6k",
      false
    ),
    dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate:
      readBoolean(
        oro6j,
        "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate",
        true
      ),
    oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed: readBoolean(
      oro6j,
      "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed",
      true
    ),
    preExecutionReadinessGateStatusFromOro6j: readString(
      oro6j,
      "preExecutionReadinessGateStatusFromOro6j",
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
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
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY
    ),
    actualExternalCallExecutionAuthorizationDecisionScope: readString(
      decision,
      "actualExternalCallExecutionAuthorizationDecisionScope",
      LIVE_EXECUTION_READINESS_ONLY
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
    nextPhaseRequiresSeparateLiveExecutionReadinessGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparateLiveExecutionReadinessGate",
      true
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablement: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualExternalCallExecutionEnablement",
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
    srcAppChangedInOro6l: readBoolean(files, "srcAppChangedInOro6l", false),
    runtimeRouteControllerServiceChangedInOro6l: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6l",
      false
    ),
    ledgerMockChangedInOro6l: readBoolean(files, "ledgerMockChangedInOro6l", false),
    prismaOrEnvChangedInOro6l: readBoolean(
      files,
      "prismaOrEnvChangedInOro6l",
      false
    ),
    packageLockChangedInOro6l: readBoolean(
      files,
      "packageLockChangedInOro6l",
      false
    ),
    stagingEnvExampleChangedInOro6l: readBoolean(
      files,
      "stagingEnvExampleChangedInOro6l",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture
      .dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary ||
    !fixture
      .oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed
  ) {
    blockers.push("ORO-6K actual execution authorization request record is required");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k ||
    !fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k ||
    fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k !==
      SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION
  ) {
    blockers.push(
      "ORO-6K actual execution request must be submitted pending actual decision"
    );
  }
  if (
    fixture.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k !==
      PENDING ||
    fixture.actualExternalCallExecutionAuthorizedFromOro6k ||
    fixture.externalCallExecutionAuthorizedFromOro6k ||
    fixture.externalCallExecutionPerformedFromOro6k ||
    fixture.externalNetworkAllowedFromOro6k ||
    fixture.liveOroPlayApiCallAllowedFromOro6k
  ) {
    blockers.push(
      "ORO-6K must still be pending with no actual execution authorization or call"
    );
  }
  if (
    !fixture.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate ||
    !fixture.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed ||
    fixture.preExecutionReadinessGateStatusFromOro6j !==
      READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST
  ) {
    blockers.push("ORO-6J pre-execution readiness gate evidence is required");
  }
  if (
    !fixture.actualExternalCallExecutionAuthorizationDecisionPrepared ||
    !fixture.actualExternalCallExecutionAuthorizationDecisionIssued ||
    fixture.actualExternalCallExecutionAuthorizationDecisionStatus !==
      APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY ||
    fixture.actualExternalCallExecutionAuthorizationDecisionScope !==
      LIVE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6L decision must be issued as live execution readiness only");
  }
  if (
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6L must not authorize or perform actual execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateLiveExecutionReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablement ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push(
      "next phase must require separate live execution readiness and enablement"
    );
  }
  if (
    fixture.srcAppChangedInOro6l ||
    fixture.runtimeRouteControllerServiceChangedInOro6l ||
    fixture.ledgerMockChangedInOro6l ||
    fixture.prismaOrEnvChangedInOro6l ||
    fixture.packageLockChangedInOro6l ||
    fixture.stagingEnvExampleChangedInOro6l
  ) {
    blockers.push("ORO-6L must not change protected runtime, data, env, or lock files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during actual execution decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during actual execution decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during actual execution decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during actual execution decision");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent during decision");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration and deploy must remain absent during decision");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during decision");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_6L_PHASE,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult:
      result,
    dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
      fixture
        .dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed:
      pass &&
      fixture.oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed,
    actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k:
      pass &&
      fixture.actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k,
    actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k:
      pass &&
      fixture.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k,
    actualExternalCallExecutionAuthorizationRequestStatusFromOro6k: pass
      ? fixture.actualExternalCallExecutionAuthorizationRequestStatusFromOro6k
      : HOLD,
    actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k: false,
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k: PENDING,
    actualExternalCallExecutionAuthorizedFromOro6k: false,
    externalCallExecutionAuthorizedFromOro6k: false,
    externalCallExecutionPerformedFromOro6k: false,
    externalNetworkAllowedFromOro6k: false,
    liveOroPlayApiCallAllowedFromOro6k: false,
    dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate:
      fixture.dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
    oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed:
      pass && fixture.oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed,
    preExecutionReadinessGateStatusFromOro6j: pass
      ? fixture.preExecutionReadinessGateStatusFromOro6j
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
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparateLiveExecutionReadinessGate:
      pass && fixture.nextPhaseRequiresSeparateLiveExecutionReadinessGate,
    nextPhaseRequiresSeparateActualExternalCallExecutionEnablement:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionEnablement,
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

function validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
  input = buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6lActualExecutionAuthorizationDecisionSummary(input = {}) {
  return validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
    input
  );
}

function assertOro6lStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
        summary
      );
  if (
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6L still-no-external-call assertion failed");
  }
  return true;
}

function runOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryHarness(
  input
) {
  return validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6L_PHASE,
  PASS,
  HOLD,
  PENDING,
  SUBMITTED_PENDING_ACTUAL_EXECUTION_DECISION,
  APPROVED_FOR_LIVE_EXECUTION_READINESS_ONLY,
  LIVE_EXECUTION_READINESS_ONLY,
  ORO_6L_ACTUAL_EXECUTION_AUTHORIZATION_DECISION_STATUS,
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
  validateOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
  buildOro6lActualExecutionAuthorizationDecisionSummary,
  assertOro6lStillNoExternalCall,
  runOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryHarness,
};
