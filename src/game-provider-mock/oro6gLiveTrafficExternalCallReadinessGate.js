"use strict";

const {
  APPROVED_FOR_READINESS_ONLY,
  APPROVED_TO_CALL_NOW,
  LIVE_TRAFFIC_MODE,
  PASS: ORO6F_PASS,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput,
  evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
} = require("./oro6fLiveTrafficExternalCallAuthorizationDecisionBoundary");

const ORO6G_PHASE = "ORO-6G";
const PASS = "PASS";
const HOLD = "HOLD";
const READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST =
  "ready_for_separate_execution_authorization_request";

const ORO6G_EXTERNAL_CALL_READINESS_GATE_STATUS = Object.freeze({
  PHASE: ORO6G_PHASE,
  PASS,
  HOLD,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_READINESS_ONLY,
  APPROVED_TO_CALL_NOW,
  LIVE_TRAFFIC_MODE,
});

const BASELINE_ORO6F_SUMMARY =
  evaluateOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary(
    buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput()
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

function buildOro6gLiveTrafficExternalCallReadinessGateInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallReadinessGateFixture",
    phase: ORO6G_PHASE,
    oro6fDecisionEvidence: {
      dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary: true,
      oro6fLiveTrafficExternalCallAuthorizationDecisionPassed:
        BASELINE_ORO6F_SUMMARY.liveTrafficExternalCallAuthorizationDecisionBoundaryResult ===
        ORO6F_PASS,
      externalCallAuthorizationDecisionPreparedFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationDecisionPrepared === true,
      externalCallAuthorizationDecisionRecordedFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationDecisionRecorded === true,
      externalCallAuthorizationDecisionIssuedFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationDecisionIssued === true,
      externalCallAuthorizationDecisionStatusFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationDecisionStatus,
      externalCallExecutionAuthorizedFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallExecutionAuthorized === true,
      externalCallReadinessGateAllowedFromOro6f:
        BASELINE_ORO6F_SUMMARY.externalCallReadinessGateAllowedNext === true,
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f:
        BASELINE_ORO6F_SUMMARY
          .nextPhaseRequiresSeparateExternalCallExecutionAuthorization === true,
    },
    oro6eRequestEvidence: {
      dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary: true,
      oro6eLiveTrafficExternalCallAuthorizationRequestPassed:
        BASELINE_ORO6F_SUMMARY
          .oro6eLiveTrafficExternalCallAuthorizationRequestPassed === true,
      externalCallAuthorizationRequestPreparedFromOro6e:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationRequestPreparedFromOro6e ===
        true,
      externalCallAuthorizationRequestSubmittedFromOro6e:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationRequestSubmittedFromOro6e ===
        true,
      externalCallAuthorizationRequestStatusFromOro6e:
        BASELINE_ORO6F_SUMMARY.externalCallAuthorizationRequestStatusFromOro6e,
    },
    oro6dValidationEvidence: {
      dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: true,
      oro6dLiveTrafficPostEnablementValidationPassed:
        BASELINE_ORO6F_SUMMARY.oro6dLiveTrafficPostEnablementValidationPassed ===
        true,
      liveTrafficAllowedFromOro6d:
        BASELINE_ORO6F_SUMMARY.liveTrafficAllowedFromOro6d === true,
      liveTrafficEnabledFromOro6d:
        BASELINE_ORO6F_SUMMARY.liveTrafficEnabledFromOro6d === true,
      liveTrafficModeFromOro6d: BASELINE_ORO6F_SUMMARY.liveTrafficModeFromOro6d,
    },
    readinessGateEvidence: {
      externalCallReadinessGatePrepared: true,
      externalCallReadinessGateEvaluated: true,
      externalCallReadinessGatePassed: true,
      externalCallReadinessGateStatus:
        READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
      externalCallExecutionAuthorizationRequestSubmitted: false,
      externalCallExecutionAuthorizationDecisionIssued: false,
      externalCallExecutionAuthorized: false,
      nextPhaseRequiresExternalCallExecutionAuthorizationRequest: true,
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision: true,
      humanApprovalRequired: true,
      separateExternalCallExecutionAuthorizationRequired: true,
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
      srcAppChangedInOro6g: false,
      runtimeRouteControllerServiceChangedInOro6g: false,
      ledgerMockChangedInOro6g: false,
      prismaOrEnvChangedInOro6g: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6gLiveTrafficExternalCallReadinessGateInput();
  const merged = deepMerge(baseline, source);
  const oro6f = isPlainObject(merged.oro6fDecisionEvidence)
    ? merged.oro6fDecisionEvidence
    : {};
  const oro6e = isPlainObject(merged.oro6eRequestEvidence)
    ? merged.oro6eRequestEvidence
    : {};
  const oro6d = isPlainObject(merged.oro6dValidationEvidence)
    ? merged.oro6dValidationEvidence
    : {};
  const gate = isPlainObject(merged.readinessGateEvidence)
    ? merged.readinessGateEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary: readBoolean(
      oro6f,
      "dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary",
      true
    ),
    oro6fLiveTrafficExternalCallAuthorizationDecisionPassed: readBoolean(
      oro6f,
      "oro6fLiveTrafficExternalCallAuthorizationDecisionPassed",
      true
    ),
    externalCallAuthorizationDecisionPreparedFromOro6f: readBoolean(
      oro6f,
      "externalCallAuthorizationDecisionPreparedFromOro6f",
      true
    ),
    externalCallAuthorizationDecisionRecordedFromOro6f: readBoolean(
      oro6f,
      "externalCallAuthorizationDecisionRecordedFromOro6f",
      true
    ),
    externalCallAuthorizationDecisionIssuedFromOro6f: readBoolean(
      oro6f,
      "externalCallAuthorizationDecisionIssuedFromOro6f",
      true
    ),
    externalCallAuthorizationDecisionStatusFromOro6f: readString(
      oro6f,
      "externalCallAuthorizationDecisionStatusFromOro6f",
      APPROVED_FOR_READINESS_ONLY
    ),
    externalCallExecutionAuthorizedFromOro6f: readBoolean(
      oro6f,
      "externalCallExecutionAuthorizedFromOro6f",
      false
    ),
    externalCallReadinessGateAllowedFromOro6f: readBoolean(
      oro6f,
      "externalCallReadinessGateAllowedFromOro6f",
      true
    ),
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f:
      readBoolean(
        oro6f,
        "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f",
        true
      ),
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
      "submitted_pending_decision"
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
    externalCallReadinessGatePrepared: readBoolean(
      gate,
      "externalCallReadinessGatePrepared",
      true
    ),
    externalCallReadinessGateEvaluated: readBoolean(
      gate,
      "externalCallReadinessGateEvaluated",
      true
    ),
    externalCallReadinessGatePassed: readBoolean(
      gate,
      "externalCallReadinessGatePassed",
      true
    ),
    externalCallReadinessGateStatus: readString(
      gate,
      "externalCallReadinessGateStatus",
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
    ),
    externalCallExecutionAuthorizationRequestSubmitted: readBoolean(
      gate,
      "externalCallExecutionAuthorizationRequestSubmitted",
      false
    ),
    externalCallExecutionAuthorizationDecisionIssued: readBoolean(
      gate,
      "externalCallExecutionAuthorizationDecisionIssued",
      false
    ),
    externalCallExecutionAuthorized: readBoolean(
      gate,
      "externalCallExecutionAuthorized",
      false
    ),
    nextPhaseRequiresExternalCallExecutionAuthorizationRequest: readBoolean(
      gate,
      "nextPhaseRequiresExternalCallExecutionAuthorizationRequest",
      true
    ),
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision: readBoolean(
      gate,
      "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision",
      true
    ),
    humanApprovalRequired: readBoolean(gate, "humanApprovalRequired", true),
    separateExternalCallExecutionAuthorizationRequired: readBoolean(
      gate,
      "separateExternalCallExecutionAuthorizationRequired",
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
    srcAppChangedInOro6g: readBoolean(files, "srcAppChangedInOro6g", false),
    runtimeRouteControllerServiceChangedInOro6g: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6g",
      false
    ),
    ledgerMockChangedInOro6g: readBoolean(files, "ledgerMockChangedInOro6g", false),
    prismaOrEnvChangedInOro6g: readBoolean(
      files,
      "prismaOrEnvChangedInOro6g",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary ||
    !fixture.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed ||
    !fixture.externalCallAuthorizationDecisionPreparedFromOro6f ||
    !fixture.externalCallAuthorizationDecisionRecordedFromOro6f ||
    !fixture.externalCallAuthorizationDecisionIssuedFromOro6f ||
    fixture.externalCallAuthorizationDecisionStatusFromOro6f !==
      APPROVED_FOR_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorizedFromOro6f ||
    !fixture.externalCallReadinessGateAllowedFromOro6f ||
    !fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f
  ) {
    blockers.push("ORO-6F readiness-only authorization decision record is required");
  }
  if (
    !fixture.dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary ||
    !fixture.oro6eLiveTrafficExternalCallAuthorizationRequestPassed ||
    !fixture.externalCallAuthorizationRequestPreparedFromOro6e ||
    !fixture.externalCallAuthorizationRequestSubmittedFromOro6e ||
    fixture.externalCallAuthorizationRequestStatusFromOro6e !==
      "submitted_pending_decision"
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
    !fixture.externalCallReadinessGatePrepared ||
    !fixture.externalCallReadinessGateEvaluated ||
    !fixture.externalCallReadinessGatePassed ||
    fixture.externalCallReadinessGateStatus !==
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
  ) {
    blockers.push("external call readiness gate must be ready for separate execution authorization request");
  }
  if (
    fixture.externalCallExecutionAuthorizationRequestSubmitted ||
    fixture.externalCallExecutionAuthorizationDecisionIssued ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6G must not submit or authorize external call execution");
  }
  if (
    !fixture.nextPhaseRequiresExternalCallExecutionAuthorizationRequest ||
    !fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequired ||
    !fixture.separateExternalCallExecutionAuthorizationRequired
  ) {
    blockers.push("next phase must request separate external call execution authorization");
  }
  if (
    fixture.srcAppChangedInOro6g ||
    fixture.runtimeRouteControllerServiceChangedInOro6g ||
    fixture.ledgerMockChangedInOro6g ||
    fixture.prismaOrEnvChangedInOro6g
  ) {
    blockers.push("ORO-6G must not change protected runtime, ledger, Prisma, or env files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during readiness gate");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during readiness gate");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during readiness gate");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during readiness gate");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during readiness gate");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during readiness gate");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during readiness gate");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO6G_PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallReadinessGateResult: result,
    dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary:
      fixture.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
    oro6fLiveTrafficExternalCallAuthorizationDecisionPassed:
      pass && fixture.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed,
    externalCallAuthorizationDecisionPreparedFromOro6f:
      pass && fixture.externalCallAuthorizationDecisionPreparedFromOro6f,
    externalCallAuthorizationDecisionRecordedFromOro6f:
      pass && fixture.externalCallAuthorizationDecisionRecordedFromOro6f,
    externalCallAuthorizationDecisionIssuedFromOro6f:
      pass && fixture.externalCallAuthorizationDecisionIssuedFromOro6f,
    externalCallAuthorizationDecisionStatusFromOro6f: pass
      ? fixture.externalCallAuthorizationDecisionStatusFromOro6f
      : HOLD,
    externalCallExecutionAuthorizedFromOro6f: false,
    externalCallReadinessGateAllowedFromOro6f:
      pass && fixture.externalCallReadinessGateAllowedFromOro6f,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f:
      pass &&
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f,
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
    liveTrafficAllowedFromOro6d: pass && fixture.liveTrafficAllowedFromOro6d,
    liveTrafficEnabledFromOro6d: pass && fixture.liveTrafficEnabledFromOro6d,
    liveTrafficModeFromOro6d: pass ? fixture.liveTrafficModeFromOro6d : HOLD,
    externalCallReadinessGatePrepared:
      pass && fixture.externalCallReadinessGatePrepared,
    externalCallReadinessGateEvaluated:
      pass && fixture.externalCallReadinessGateEvaluated,
    externalCallReadinessGatePassed:
      pass && fixture.externalCallReadinessGatePassed,
    externalCallReadinessGateStatus: pass
      ? fixture.externalCallReadinessGateStatus
      : HOLD,
    externalCallExecutionAuthorizationRequestSubmitted: false,
    externalCallExecutionAuthorizationDecisionIssued: false,
    externalCallExecutionAuthorized: false,
    nextPhaseRequiresExternalCallExecutionAuthorizationRequest:
      pass && fixture.nextPhaseRequiresExternalCallExecutionAuthorizationRequest,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    humanApprovalRequired: pass && fixture.humanApprovalRequired,
    separateExternalCallExecutionAuthorizationRequired:
      pass && fixture.separateExternalCallExecutionAuthorizationRequired,
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

function evaluateOro6gLiveTrafficExternalCallReadinessGate(
  input = buildOro6gLiveTrafficExternalCallReadinessGateInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6gLiveTrafficExternalCallReadinessGateRecord(input = {}) {
  const fixture = normalizeInput(input);
  return {
    externalCallReadinessGatePrepared:
      fixture.externalCallReadinessGatePrepared,
    externalCallReadinessGateEvaluated:
      fixture.externalCallReadinessGateEvaluated,
    externalCallReadinessGatePassed: fixture.externalCallReadinessGatePassed,
    externalCallReadinessGateStatus: fixture.externalCallReadinessGateStatus,
    externalCallExecutionAuthorizationRequestSubmitted:
      fixture.externalCallExecutionAuthorizationRequestSubmitted,
    externalCallExecutionAuthorizationDecisionIssued:
      fixture.externalCallExecutionAuthorizationDecisionIssued,
    externalCallExecutionAuthorized: fixture.externalCallExecutionAuthorized,
    nextPhaseRequiresExternalCallExecutionAuthorizationRequest:
      fixture.nextPhaseRequiresExternalCallExecutionAuthorizationRequest,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision:
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    humanApprovalRequired: fixture.humanApprovalRequired,
    separateExternalCallExecutionAuthorizationRequired:
      fixture.separateExternalCallExecutionAuthorizationRequired,
  };
}

function runOro6gLiveTrafficExternalCallReadinessGateHarness(input) {
  return evaluateOro6gLiveTrafficExternalCallReadinessGate(input);
}

module.exports = {
  ORO6G_PHASE,
  PASS,
  HOLD,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_READINESS_ONLY,
  APPROVED_TO_CALL_NOW,
  LIVE_TRAFFIC_MODE,
  ORO6G_EXTERNAL_CALL_READINESS_GATE_STATUS,
  buildOro6gLiveTrafficExternalCallReadinessGateInput,
  buildOro6gLiveTrafficExternalCallReadinessGateRecord,
  evaluateOro6gLiveTrafficExternalCallReadinessGate,
  runOro6gLiveTrafficExternalCallReadinessGateHarness,
};
