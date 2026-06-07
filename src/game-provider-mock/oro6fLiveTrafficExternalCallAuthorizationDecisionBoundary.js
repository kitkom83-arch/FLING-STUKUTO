"use strict";

const {
  EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO6E_PASS,
  buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary,
} = require("./oro6eLiveTrafficExternalCallAuthorizationRequestBoundary");

const {
  PASS: ORO6D_PASS,
  VALIDATION_PASSED,
  buildOro6dLiveTrafficPostEnablementValidationSummary,
} = require("./oro6dLiveTrafficPostEnablementValidationBoundary");

const ORO6F_PHASE = "ORO-6F";
const PASS = "PASS";
const HOLD = "HOLD";
const APPROVED_FOR_READINESS_ONLY = "approved_for_readiness_only";
const APPROVED_TO_CALL_NOW = "approved_to_call_now";
const LIVE_TRAFFIC_MODE = FAIL_CLOSED_NO_MUTATION;

const ORO6F_EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS = Object.freeze({
  PHASE: ORO6F_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_READINESS_ONLY,
  APPROVED_TO_CALL_NOW,
  LIVE_TRAFFIC_MODE,
});

const BASELINE_ORO6E_SUMMARY =
  buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary();
const BASELINE_ORO6D_SUMMARY =
  buildOro6dLiveTrafficPostEnablementValidationSummary();

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

function buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallAuthorizationDecisionFixture",
    phase: ORO6F_PHASE,
    oro6eRequestEvidence: {
      dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary: true,
      oro6eLiveTrafficExternalCallAuthorizationRequestPassed:
        BASELINE_ORO6E_SUMMARY.liveTrafficExternalCallAuthorizationRequestBoundaryResult ===
        ORO6E_PASS,
      externalCallAuthorizationRequestPreparedFromOro6e:
        BASELINE_ORO6E_SUMMARY.externalCallAuthorizationRequestPrepared === true,
      externalCallAuthorizationRequestSubmittedFromOro6e:
        BASELINE_ORO6E_SUMMARY.externalCallAuthorizationRequestSubmitted === true,
      externalCallAuthorizationRequestStatusFromOro6e:
        BASELINE_ORO6E_SUMMARY.externalCallAuthorizationRequestStatus,
    },
    oro6dValidationEvidence: {
      dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: true,
      oro6dLiveTrafficPostEnablementValidationPassed:
        BASELINE_ORO6D_SUMMARY.liveTrafficPostEnablementValidationBoundaryResult ===
          ORO6D_PASS &&
        BASELINE_ORO6D_SUMMARY.liveTrafficPostEnablementValidationStatus ===
          VALIDATION_PASSED,
      liveTrafficAllowedFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficAllowedFromOro6c === true,
      liveTrafficEnabledFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficEnabledFromOro6c === true,
      liveTrafficModeFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficModeFromOro6c,
    },
    decisionEvidence: {
      externalCallAuthorizationDecisionPrepared: true,
      externalCallAuthorizationDecisionRecorded: true,
      externalCallAuthorizationDecisionIssued: true,
      externalCallAuthorizationDecisionStatus: APPROVED_FOR_READINESS_ONLY,
      externalCallExecutionAuthorized: false,
      externalCallReadinessGateAllowedNext: true,
      nextPhaseRequiresExternalCallReadinessGate: true,
      nextPhaseRequiresSeparateExternalCallExecutionAuthorization: true,
      humanApprovalRequired: true,
      separateExternalCallExecutionDecisionRequired: true,
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
      secretsLeaked: false,
    },
    fileEvidence: {
      srcAppChangedInOro6f: false,
      runtimeRouteControllerServiceChangedInOro6f: false,
      ledgerMockChangedInOro6f: false,
      prismaOrEnvChangedInOro6f: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const oro6e = isPlainObject(merged.oro6eRequestEvidence)
    ? merged.oro6eRequestEvidence
    : {};
  const oro6d = isPlainObject(merged.oro6dValidationEvidence)
    ? merged.oro6dValidationEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary: readBoolean(
      oro6e,
      "dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary",
      true
    ),
    oro6eLiveTrafficExternalCallAuthorizationRequestPassed: readBoolean(
      oro6e,
      "oro6eLiveTrafficExternalCallAuthorizationRequestPassed",
      true
    ),
    externalCallAuthorizationRequestPreparedFromOro6e: readBoolean(
      oro6e,
      "externalCallAuthorizationRequestPreparedFromOro6e",
      true
    ),
    externalCallAuthorizationRequestSubmittedFromOro6e: readBoolean(
      oro6e,
      "externalCallAuthorizationRequestSubmittedFromOro6e",
      true
    ),
    externalCallAuthorizationRequestStatusFromOro6e: readString(
      oro6e,
      "externalCallAuthorizationRequestStatusFromOro6e",
      EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS
    ),
    dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: readBoolean(
      oro6d,
      "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary",
      true
    ),
    oro6dLiveTrafficPostEnablementValidationPassed: readBoolean(
      oro6d,
      "oro6dLiveTrafficPostEnablementValidationPassed",
      true
    ),
    liveTrafficAllowedFromOro6d: readBoolean(
      oro6d,
      "liveTrafficAllowedFromOro6d",
      true
    ),
    liveTrafficEnabledFromOro6d: readBoolean(
      oro6d,
      "liveTrafficEnabledFromOro6d",
      true
    ),
    liveTrafficModeFromOro6d: readString(
      oro6d,
      "liveTrafficModeFromOro6d",
      LIVE_TRAFFIC_MODE
    ),
    externalCallAuthorizationDecisionPrepared: readBoolean(
      decision,
      "externalCallAuthorizationDecisionPrepared",
      true
    ),
    externalCallAuthorizationDecisionRecorded: readBoolean(
      decision,
      "externalCallAuthorizationDecisionRecorded",
      true
    ),
    externalCallAuthorizationDecisionIssued: readBoolean(
      decision,
      "externalCallAuthorizationDecisionIssued",
      true
    ),
    externalCallAuthorizationDecisionStatus: readString(
      decision,
      "externalCallAuthorizationDecisionStatus",
      APPROVED_FOR_READINESS_ONLY
    ),
    externalCallExecutionAuthorized: readBoolean(
      decision,
      "externalCallExecutionAuthorized",
      false
    ),
    externalCallReadinessGateAllowedNext: readBoolean(
      decision,
      "externalCallReadinessGateAllowedNext",
      true
    ),
    nextPhaseRequiresExternalCallReadinessGate: readBoolean(
      decision,
      "nextPhaseRequiresExternalCallReadinessGate",
      true
    ),
    nextPhaseRequiresSeparateExternalCallExecutionAuthorization: readBoolean(
      decision,
      "nextPhaseRequiresSeparateExternalCallExecutionAuthorization",
      true
    ),
    humanApprovalRequired: readBoolean(decision, "humanApprovalRequired", true),
    separateExternalCallExecutionDecisionRequired: readBoolean(
      decision,
      "separateExternalCallExecutionDecisionRequired",
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
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
    srcAppChangedInOro6f: readBoolean(files, "srcAppChangedInOro6f", false),
    runtimeRouteControllerServiceChangedInOro6f: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6f",
      false
    ),
    ledgerMockChangedInOro6f: readBoolean(files, "ledgerMockChangedInOro6f", false),
    prismaOrEnvChangedInOro6f: readBoolean(
      files,
      "prismaOrEnvChangedInOro6f",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary ||
    !fixture.oro6eLiveTrafficExternalCallAuthorizationRequestPassed ||
    !fixture.externalCallAuthorizationRequestPreparedFromOro6e ||
    !fixture.externalCallAuthorizationRequestSubmittedFromOro6e ||
    fixture.externalCallAuthorizationRequestStatusFromOro6e !==
      EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS
  ) {
    blockers.push("ORO-6E external call authorization request record is required");
  }
  if (
    !fixture.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary ||
    !fixture.oro6dLiveTrafficPostEnablementValidationPassed ||
    !fixture.liveTrafficAllowedFromOro6d ||
    !fixture.liveTrafficEnabledFromOro6d ||
    fixture.liveTrafficModeFromOro6d !== LIVE_TRAFFIC_MODE
  ) {
    blockers.push("ORO-6D live traffic post-enablement validation record is required");
  }
  if (
    !fixture.externalCallAuthorizationDecisionPrepared ||
    !fixture.externalCallAuthorizationDecisionRecorded ||
    !fixture.externalCallAuthorizationDecisionIssued ||
    fixture.externalCallAuthorizationDecisionStatus !== APPROVED_FOR_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("external call decision must be approved_for_readiness_only and not execution authorization");
  }
  if (
    !fixture.externalCallReadinessGateAllowedNext ||
    !fixture.nextPhaseRequiresExternalCallReadinessGate ||
    !fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorization
  ) {
    blockers.push("next phase must be readiness gate before separate execution authorization");
  }
  if (
    !fixture.humanApprovalRequired ||
    !fixture.separateExternalCallExecutionDecisionRequired
  ) {
    blockers.push("human approval and separate execution decision are required");
  }
  if (
    fixture.srcAppChangedInOro6f ||
    fixture.runtimeRouteControllerServiceChangedInOro6f ||
    fixture.ledgerMockChangedInOro6f ||
    fixture.prismaOrEnvChangedInOro6f
  ) {
    blockers.push("ORO-6F must not change protected runtime, ledger, Prisma, or env files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during readiness-only decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during readiness-only decision");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during readiness-only decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during readiness-only decision");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during readiness-only decision");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during readiness-only decision");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during readiness-only decision");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO6F_PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallAuthorizationDecisionBoundaryResult: result,
    dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary:
      fixture.dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary,
    oro6eLiveTrafficExternalCallAuthorizationRequestPassed:
      pass && fixture.oro6eLiveTrafficExternalCallAuthorizationRequestPassed,
    externalCallAuthorizationRequestPreparedFromOro6e:
      pass && fixture.externalCallAuthorizationRequestPreparedFromOro6e,
    externalCallAuthorizationRequestSubmittedFromOro6e:
      pass && fixture.externalCallAuthorizationRequestSubmittedFromOro6e,
    externalCallAuthorizationRequestStatusFromOro6e: pass
      ? fixture.externalCallAuthorizationRequestStatusFromOro6e
      : HOLD,
    dependsOnOro6dLiveTrafficPostEnablementValidationBoundary:
      fixture.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary,
    oro6dLiveTrafficPostEnablementValidationPassed:
      pass && fixture.oro6dLiveTrafficPostEnablementValidationPassed,
    liveTrafficAllowedFromOro6d:
      pass && fixture.liveTrafficAllowedFromOro6d,
    liveTrafficEnabledFromOro6d:
      pass && fixture.liveTrafficEnabledFromOro6d,
    liveTrafficModeFromOro6d: pass ? fixture.liveTrafficModeFromOro6d : HOLD,
    externalCallAuthorizationDecisionPrepared:
      pass && fixture.externalCallAuthorizationDecisionPrepared,
    externalCallAuthorizationDecisionRecorded:
      pass && fixture.externalCallAuthorizationDecisionRecorded,
    externalCallAuthorizationDecisionIssued:
      pass && fixture.externalCallAuthorizationDecisionIssued,
    externalCallAuthorizationDecisionStatus: pass
      ? fixture.externalCallAuthorizationDecisionStatus
      : HOLD,
    externalCallExecutionAuthorized: false,
    externalCallReadinessGateAllowedNext:
      pass && fixture.externalCallReadinessGateAllowedNext,
    nextPhaseRequiresExternalCallReadinessGate:
      pass && fixture.nextPhaseRequiresExternalCallReadinessGate,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorization:
      pass && fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorization,
    humanApprovalRequired: pass && fixture.humanApprovalRequired,
    separateExternalCallExecutionDecisionRequired:
      pass && fixture.separateExternalCallExecutionDecisionRequired,
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
    secretsLeaked: false,
    blockers,
  };
}

function evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
  input = buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6fLiveTrafficExternalCallAuthorizationDecisionRecord(input = {}) {
  const fixture = normalizeInput(input);
  return {
    externalCallAuthorizationDecisionPrepared:
      fixture.externalCallAuthorizationDecisionPrepared,
    externalCallAuthorizationDecisionRecorded:
      fixture.externalCallAuthorizationDecisionRecorded,
    externalCallAuthorizationDecisionIssued:
      fixture.externalCallAuthorizationDecisionIssued,
    externalCallAuthorizationDecisionStatus:
      fixture.externalCallAuthorizationDecisionStatus,
    externalCallExecutionAuthorized:
      fixture.externalCallExecutionAuthorized,
    externalCallReadinessGateAllowedNext:
      fixture.externalCallReadinessGateAllowedNext,
    nextPhaseRequiresExternalCallReadinessGate:
      fixture.nextPhaseRequiresExternalCallReadinessGate,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorization:
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorization,
    humanApprovalRequired: fixture.humanApprovalRequired,
    separateExternalCallExecutionDecisionRequired:
      fixture.separateExternalCallExecutionDecisionRequired,
  };
}

function runOro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryHarness(input) {
  return evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(input);
}

module.exports = {
  ORO6F_PHASE,
  PASS,
  HOLD,
  APPROVED_FOR_READINESS_ONLY,
  APPROVED_TO_CALL_NOW,
  LIVE_TRAFFIC_MODE,
  ORO6F_EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionRecord,
  evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
  runOro6fLiveTrafficExternalCallAuthorizationDecisionBoundaryHarness,
};
