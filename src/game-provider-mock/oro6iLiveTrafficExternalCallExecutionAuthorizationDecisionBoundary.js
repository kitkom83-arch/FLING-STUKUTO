"use strict";

const {
  PASS: ORO6H_PASS,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput,
  evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
} = require("./oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary");

const ORO_6I_PHASE = "ORO-6I";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY =
  "approved_for_pre_execution_readiness_only";
const PRE_EXECUTION_READINESS_ONLY = "pre_execution_readiness_only";

const ORO_6I_DECISION_STATUS = Object.freeze({
  PHASE: ORO_6I_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  PRE_EXECUTION_READINESS_ONLY,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
});

const BASELINE_ORO6H_SUMMARY =
  evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
    buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput()
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

function buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture",
    phase: ORO_6I_PHASE,
    oro6hRequestEvidence: {
      dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
        true,
      oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed:
        BASELINE_ORO6H_SUMMARY
          .liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult ===
        ORO6H_PASS,
      externalCallExecutionAuthorizationRequestPreparedFromOro6h:
        BASELINE_ORO6H_SUMMARY
          .externalCallExecutionAuthorizationRequestPrepared === true,
      externalCallExecutionAuthorizationRequestSubmittedFromOro6h:
        BASELINE_ORO6H_SUMMARY
          .externalCallExecutionAuthorizationRequestSubmitted === true,
      externalCallExecutionAuthorizationRequestStatusFromOro6h:
        BASELINE_ORO6H_SUMMARY.externalCallExecutionAuthorizationRequestStatus,
      externalCallExecutionAuthorizationDecisionIssuedFromOro6h:
        BASELINE_ORO6H_SUMMARY
          .externalCallExecutionAuthorizationDecisionIssued === true,
      externalCallExecutionAuthorizationDecisionStatusFromOro6h:
        BASELINE_ORO6H_SUMMARY.externalCallExecutionAuthorizationDecisionStatus,
      externalCallExecutionAuthorizedFromOro6h:
        BASELINE_ORO6H_SUMMARY.externalCallExecutionAuthorized === true,
      externalNetworkAllowedFromOro6h:
        BASELINE_ORO6H_SUMMARY.externalNetworkAllowed === true,
      liveOroPlayApiCallAllowedFromOro6h:
        BASELINE_ORO6H_SUMMARY.liveOroPlayApiCallAllowed === true,
    },
    oro6gReadinessGateEvidence: {
      dependsOnOro6gLiveTrafficExternalCallReadinessGate:
        BASELINE_ORO6H_SUMMARY.dependsOnOro6gLiveTrafficExternalCallReadinessGate ===
        true,
      oro6gLiveTrafficExternalCallReadinessGatePassed:
        BASELINE_ORO6H_SUMMARY.oro6gLiveTrafficExternalCallReadinessGatePassed ===
        true,
      externalCallReadinessGateStatusFromOro6g:
        BASELINE_ORO6H_SUMMARY.externalCallReadinessGateStatusFromOro6g,
    },
    decisionEvidence: {
      externalCallExecutionAuthorizationDecisionPrepared: true,
      externalCallExecutionAuthorizationDecisionIssued: true,
      externalCallExecutionAuthorizationDecisionStatus:
        APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
      externalCallExecutionAuthorizationDecisionScope:
        PRE_EXECUTION_READINESS_ONLY,
      externalCallExecutionAuthorized: false,
      actualExternalCallExecutionAuthorized: false,
      externalCallExecutionPerformed: false,
      nextPhaseRequiresSeparatePreExecutionReadinessGate: true,
      nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization: true,
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
      srcAppChangedInOro6i: false,
      runtimeRouteControllerServiceChangedInOro6i: false,
      ledgerMockChangedInOro6i: false,
      prismaOrEnvChangedInOro6i: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary();
  const merged = deepMerge(baseline, source);
  const oro6h = isPlainObject(merged.oro6hRequestEvidence)
    ? merged.oro6hRequestEvidence
    : {};
  const oro6g = isPlainObject(merged.oro6gReadinessGateEvidence)
    ? merged.oro6gReadinessGateEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    externalCallExecutionAuthorizationRequestPreparedFromOro6h: readBoolean(
      oro6h,
      "externalCallExecutionAuthorizationRequestPreparedFromOro6h",
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
    externalCallExecutionAuthorizationDecisionIssuedFromOro6h: readBoolean(
      oro6h,
      "externalCallExecutionAuthorizationDecisionIssuedFromOro6h",
      false
    ),
    externalCallExecutionAuthorizationDecisionStatusFromOro6h: readString(
      oro6h,
      "externalCallExecutionAuthorizationDecisionStatusFromOro6h",
      PENDING
    ),
    externalCallExecutionAuthorizedFromOro6h: readBoolean(
      oro6h,
      "externalCallExecutionAuthorizedFromOro6h",
      false
    ),
    externalNetworkAllowedFromOro6h: readBoolean(
      oro6h,
      "externalNetworkAllowedFromOro6h",
      false
    ),
    liveOroPlayApiCallAllowedFromOro6h: readBoolean(
      oro6h,
      "liveOroPlayApiCallAllowedFromOro6h",
      false
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
    externalCallExecutionAuthorizationDecisionPrepared: readBoolean(
      decision,
      "externalCallExecutionAuthorizationDecisionPrepared",
      true
    ),
    externalCallExecutionAuthorizationDecisionIssued: readBoolean(
      decision,
      "externalCallExecutionAuthorizationDecisionIssued",
      true
    ),
    externalCallExecutionAuthorizationDecisionStatus: readString(
      decision,
      "externalCallExecutionAuthorizationDecisionStatus",
      APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY
    ),
    externalCallExecutionAuthorizationDecisionScope: readString(
      decision,
      "externalCallExecutionAuthorizationDecisionScope",
      PRE_EXECUTION_READINESS_ONLY
    ),
    externalCallExecutionAuthorized: readBoolean(
      decision,
      "externalCallExecutionAuthorized",
      false
    ),
    actualExternalCallExecutionAuthorized: readBoolean(
      decision,
      "actualExternalCallExecutionAuthorized",
      false
    ),
    externalCallExecutionPerformed: readBoolean(
      decision,
      "externalCallExecutionPerformed",
      false
    ),
    nextPhaseRequiresSeparatePreExecutionReadinessGate: readBoolean(
      decision,
      "nextPhaseRequiresSeparatePreExecutionReadinessGate",
      true
    ),
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization: readBoolean(
      decision,
      "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization",
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
    srcAppChangedInOro6i: readBoolean(files, "srcAppChangedInOro6i", false),
    runtimeRouteControllerServiceChangedInOro6i: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6i",
      false
    ),
    ledgerMockChangedInOro6i: readBoolean(files, "ledgerMockChangedInOro6i", false),
    prismaOrEnvChangedInOro6i: readBoolean(
      files,
      "prismaOrEnvChangedInOro6i",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary ||
    !fixture.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed ||
    !fixture.externalCallExecutionAuthorizationRequestPreparedFromOro6h ||
    !fixture.externalCallExecutionAuthorizationRequestSubmittedFromOro6h ||
    fixture.externalCallExecutionAuthorizationRequestStatusFromOro6h !==
      SUBMITTED_PENDING_EXECUTION_DECISION ||
    fixture.externalCallExecutionAuthorizationDecisionIssuedFromOro6h ||
    fixture.externalCallExecutionAuthorizationDecisionStatusFromOro6h !==
      PENDING ||
    fixture.externalCallExecutionAuthorizedFromOro6h ||
    fixture.externalNetworkAllowedFromOro6h ||
    fixture.liveOroPlayApiCallAllowedFromOro6h
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
    !fixture.externalCallExecutionAuthorizationDecisionPrepared ||
    !fixture.externalCallExecutionAuthorizationDecisionIssued ||
    fixture.externalCallExecutionAuthorizationDecisionStatus !==
      APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorizationDecisionScope !==
      PRE_EXECUTION_READINESS_ONLY
  ) {
    blockers.push("ORO-6I decision must be readiness-only and issued");
  }
  if (
    fixture.externalCallExecutionAuthorized ||
    fixture.actualExternalCallExecutionAuthorized ||
    fixture.externalCallExecutionPerformed
  ) {
    blockers.push("ORO-6I must not authorize or perform external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparatePreExecutionReadinessGate ||
    !fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired
  ) {
    blockers.push("next phase must require separate actual execution approval");
  }
  if (
    fixture.srcAppChangedInOro6i ||
    fixture.runtimeRouteControllerServiceChangedInOro6i ||
    fixture.ledgerMockChangedInOro6i ||
    fixture.prismaOrEnvChangedInOro6i
  ) {
    blockers.push("ORO-6I must not change protected runtime, ledger, data, or env files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during decision boundary");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during decision boundary");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during decision boundary");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during decision boundary");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent during decision boundary");
  }
  if (
    fixture.migrationAllowed ||
    fixture.migrationPerformed ||
    fixture.deployAllowed ||
    fixture.deployPerformed
  ) {
    blockers.push("migration and deploy must remain absent during decision boundary");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during decision boundary");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO_6I_PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult: result,
    dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
      fixture.dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
    oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed:
      pass &&
      fixture.oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed,
    externalCallExecutionAuthorizationRequestPreparedFromOro6h:
      pass && fixture.externalCallExecutionAuthorizationRequestPreparedFromOro6h,
    externalCallExecutionAuthorizationRequestSubmittedFromOro6h:
      pass && fixture.externalCallExecutionAuthorizationRequestSubmittedFromOro6h,
    externalCallExecutionAuthorizationRequestStatusFromOro6h: pass
      ? fixture.externalCallExecutionAuthorizationRequestStatusFromOro6h
      : HOLD,
    externalCallExecutionAuthorizationDecisionIssuedFromOro6h: false,
    externalCallExecutionAuthorizationDecisionStatusFromOro6h: pass ? PENDING : HOLD,
    externalCallExecutionAuthorizedFromOro6h: false,
    externalNetworkAllowedFromOro6h: false,
    liveOroPlayApiCallAllowedFromOro6h: false,
    dependsOnOro6gLiveTrafficExternalCallReadinessGate:
      fixture.dependsOnOro6gLiveTrafficExternalCallReadinessGate,
    oro6gLiveTrafficExternalCallReadinessGatePassed:
      pass && fixture.oro6gLiveTrafficExternalCallReadinessGatePassed,
    externalCallReadinessGateStatusFromOro6g: pass
      ? fixture.externalCallReadinessGateStatusFromOro6g
      : HOLD,
    externalCallExecutionAuthorizationDecisionPrepared:
      pass && fixture.externalCallExecutionAuthorizationDecisionPrepared,
    externalCallExecutionAuthorizationDecisionIssued:
      pass && fixture.externalCallExecutionAuthorizationDecisionIssued,
    externalCallExecutionAuthorizationDecisionStatus: pass
      ? fixture.externalCallExecutionAuthorizationDecisionStatus
      : HOLD,
    externalCallExecutionAuthorizationDecisionScope: pass
      ? fixture.externalCallExecutionAuthorizationDecisionScope
      : HOLD,
    externalCallExecutionAuthorized: false,
    actualExternalCallExecutionAuthorized: false,
    externalCallExecutionPerformed: false,
    nextPhaseRequiresSeparatePreExecutionReadinessGate:
      pass && fixture.nextPhaseRequiresSeparatePreExecutionReadinessGate,
    nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization:
      pass &&
      fixture.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization,
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

function validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
  input = buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6iDecisionSummary(input = {}) {
  return validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
    input
  );
}

function assertOro6iStillNoExternalCall(summary) {
  const report = isPlainObject(summary)
    ? summary
    : validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
        summary
      );
  if (
    report.externalCallExecutionAuthorized ||
    report.actualExternalCallExecutionAuthorized ||
    report.externalCallExecutionPerformed ||
    report.externalNetworkAllowed ||
    report.externalNetworkCalled ||
    report.liveOroPlayApiCallAllowed ||
    report.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-6I still-no-external-call assertion failed");
  }
  return true;
}

function runOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryHarness(
  input
) {
  return validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary(
    input
  );
}

module.exports = {
  ORO_6I_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_PRE_EXECUTION_READINESS_ONLY,
  PRE_EXECUTION_READINESS_ONLY,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  ORO_6I_DECISION_STATUS,
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
  validateOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
  buildOro6iDecisionSummary,
  assertOro6iStillNoExternalCall,
  runOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundaryHarness,
};
