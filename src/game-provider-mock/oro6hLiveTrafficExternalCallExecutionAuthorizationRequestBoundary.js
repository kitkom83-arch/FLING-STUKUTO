"use strict";

const {
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
  PASS: ORO6G_PASS,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  buildOro6gLiveTrafficExternalCallReadinessGateInput,
  evaluateOro6gLiveTrafficExternalCallReadinessGate,
} = require("./oro6gLiveTrafficExternalCallReadinessGate");

const ORO6H_PHASE = "ORO-6H";
const PASS = "PASS";
const HOLD = "HOLD";
const SUBMITTED_PENDING_EXECUTION_DECISION =
  "submitted_pending_execution_decision";
const PENDING = "pending";

const ORO6H_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_STATUS = Object.freeze({
  PHASE: ORO6H_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
});

const BASELINE_ORO6G_SUMMARY = evaluateOro6gLiveTrafficExternalCallReadinessGate(
  buildOro6gLiveTrafficExternalCallReadinessGateInput()
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

function buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput(
  overrides = {}
) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture",
    phase: ORO6H_PHASE,
    oro6gReadinessGateEvidence: {
      dependsOnOro6gLiveTrafficExternalCallReadinessGate: true,
      oro6gLiveTrafficExternalCallReadinessGatePassed:
        BASELINE_ORO6G_SUMMARY.liveTrafficExternalCallReadinessGateResult ===
        ORO6G_PASS,
      externalCallReadinessGatePreparedFromOro6g:
        BASELINE_ORO6G_SUMMARY.externalCallReadinessGatePrepared === true,
      externalCallReadinessGateEvaluatedFromOro6g:
        BASELINE_ORO6G_SUMMARY.externalCallReadinessGateEvaluated === true,
      externalCallReadinessGatePassedFromOro6g:
        BASELINE_ORO6G_SUMMARY.externalCallReadinessGatePassed === true,
      externalCallReadinessGateStatusFromOro6g:
        BASELINE_ORO6G_SUMMARY.externalCallReadinessGateStatus,
      externalCallExecutionAuthorizationRequestSubmittedFromOro6g:
        BASELINE_ORO6G_SUMMARY
          .externalCallExecutionAuthorizationRequestSubmitted === true,
      externalCallExecutionAuthorizationDecisionIssuedFromOro6g:
        BASELINE_ORO6G_SUMMARY
          .externalCallExecutionAuthorizationDecisionIssued === true,
      externalCallExecutionAuthorizedFromOro6g:
        BASELINE_ORO6G_SUMMARY.externalCallExecutionAuthorized === true,
      nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g:
        BASELINE_ORO6G_SUMMARY
          .nextPhaseRequiresExternalCallExecutionAuthorizationRequest === true,
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g:
        BASELINE_ORO6G_SUMMARY
          .nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision === true,
    },
    oro6fDecisionEvidence: {
      dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary: true,
      oro6fLiveTrafficExternalCallAuthorizationDecisionPassed:
        BASELINE_ORO6G_SUMMARY
          .oro6fLiveTrafficExternalCallAuthorizationDecisionPassed === true,
      externalCallAuthorizationDecisionStatusFromOro6f:
        BASELINE_ORO6G_SUMMARY.externalCallAuthorizationDecisionStatusFromOro6f,
      externalCallExecutionAuthorizedFromOro6f:
        BASELINE_ORO6G_SUMMARY.externalCallExecutionAuthorizedFromOro6f === true,
      externalCallReadinessGateAllowedFromOro6f:
        BASELINE_ORO6G_SUMMARY.externalCallReadinessGateAllowedFromOro6f === true,
    },
    oro6eRequestEvidence: {
      dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary: true,
      oro6eLiveTrafficExternalCallAuthorizationRequestPassed:
        BASELINE_ORO6G_SUMMARY
          .oro6eLiveTrafficExternalCallAuthorizationRequestPassed === true,
      externalCallAuthorizationRequestPreparedFromOro6e:
        BASELINE_ORO6G_SUMMARY.externalCallAuthorizationRequestPreparedFromOro6e ===
        true,
      externalCallAuthorizationRequestSubmittedFromOro6e:
        BASELINE_ORO6G_SUMMARY
          .externalCallAuthorizationRequestSubmittedFromOro6e === true,
      externalCallAuthorizationRequestStatusFromOro6e:
        BASELINE_ORO6G_SUMMARY.externalCallAuthorizationRequestStatusFromOro6e,
    },
    oro6dValidationEvidence: {
      dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: true,
      oro6dLiveTrafficPostEnablementValidationPassed:
        BASELINE_ORO6G_SUMMARY.oro6dLiveTrafficPostEnablementValidationPassed ===
        true,
      liveTrafficAllowedFromOro6d:
        BASELINE_ORO6G_SUMMARY.liveTrafficAllowedFromOro6d === true,
      liveTrafficEnabledFromOro6d:
        BASELINE_ORO6G_SUMMARY.liveTrafficEnabledFromOro6d === true,
      liveTrafficModeFromOro6d: BASELINE_ORO6G_SUMMARY.liveTrafficModeFromOro6d,
    },
    requestEvidence: {
      externalCallExecutionAuthorizationRequestPrepared: true,
      externalCallExecutionAuthorizationRequestSubmitted: true,
      externalCallExecutionAuthorizationRequestStatus:
        SUBMITTED_PENDING_EXECUTION_DECISION,
      externalCallExecutionAuthorizationDecisionIssued: false,
      externalCallExecutionAuthorizationDecisionStatus: PENDING,
      externalCallExecutionAuthorized: false,
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision: true,
      humanApprovalRequired: true,
      separateExternalCallExecutionAuthorizationDecisionRequired: true,
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
      srcAppChangedInOro6h: false,
      runtimeRouteControllerServiceChangedInOro6h: false,
      ledgerMockChangedInOro6h: false,
      prismaOrEnvChangedInOro6h: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const oro6g = isPlainObject(merged.oro6gReadinessGateEvidence)
    ? merged.oro6gReadinessGateEvidence
    : {};
  const oro6f = isPlainObject(merged.oro6fDecisionEvidence)
    ? merged.oro6fDecisionEvidence
    : {};
  const oro6e = isPlainObject(merged.oro6eRequestEvidence)
    ? merged.oro6eRequestEvidence
    : {};
  const oro6d = isPlainObject(merged.oro6dValidationEvidence)
    ? merged.oro6dValidationEvidence
    : {};
  const request = isPlainObject(merged.requestEvidence)
    ? merged.requestEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
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
    externalCallReadinessGatePreparedFromOro6g: readBoolean(
      oro6g,
      "externalCallReadinessGatePreparedFromOro6g",
      true
    ),
    externalCallReadinessGateEvaluatedFromOro6g: readBoolean(
      oro6g,
      "externalCallReadinessGateEvaluatedFromOro6g",
      true
    ),
    externalCallReadinessGatePassedFromOro6g: readBoolean(
      oro6g,
      "externalCallReadinessGatePassedFromOro6g",
      true
    ),
    externalCallReadinessGateStatusFromOro6g: readString(
      oro6g,
      "externalCallReadinessGateStatusFromOro6g",
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST
    ),
    externalCallExecutionAuthorizationRequestSubmittedFromOro6g: readBoolean(
      oro6g,
      "externalCallExecutionAuthorizationRequestSubmittedFromOro6g",
      false
    ),
    externalCallExecutionAuthorizationDecisionIssuedFromOro6g: readBoolean(
      oro6g,
      "externalCallExecutionAuthorizationDecisionIssuedFromOro6g",
      false
    ),
    externalCallExecutionAuthorizedFromOro6g: readBoolean(
      oro6g,
      "externalCallExecutionAuthorizedFromOro6g",
      false
    ),
    nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g:
      readBoolean(
        oro6g,
        "nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g",
        true
      ),
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g:
      readBoolean(
        oro6g,
        "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g",
        true
      ),
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
    externalCallExecutionAuthorizationRequestPrepared: readBoolean(
      request,
      "externalCallExecutionAuthorizationRequestPrepared",
      true
    ),
    externalCallExecutionAuthorizationRequestSubmitted: readBoolean(
      request,
      "externalCallExecutionAuthorizationRequestSubmitted",
      true
    ),
    externalCallExecutionAuthorizationRequestStatus: readString(
      request,
      "externalCallExecutionAuthorizationRequestStatus",
      SUBMITTED_PENDING_EXECUTION_DECISION
    ),
    externalCallExecutionAuthorizationDecisionIssued: readBoolean(
      request,
      "externalCallExecutionAuthorizationDecisionIssued",
      false
    ),
    externalCallExecutionAuthorizationDecisionStatus: readString(
      request,
      "externalCallExecutionAuthorizationDecisionStatus",
      PENDING
    ),
    externalCallExecutionAuthorized: readBoolean(
      request,
      "externalCallExecutionAuthorized",
      false
    ),
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision",
      true
    ),
    humanApprovalRequired: readBoolean(request, "humanApprovalRequired", true),
    separateExternalCallExecutionAuthorizationDecisionRequired: readBoolean(
      request,
      "separateExternalCallExecutionAuthorizationDecisionRequired",
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
    srcAppChangedInOro6h: readBoolean(files, "srcAppChangedInOro6h", false),
    runtimeRouteControllerServiceChangedInOro6h: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6h",
      false
    ),
    ledgerMockChangedInOro6h: readBoolean(files, "ledgerMockChangedInOro6h", false),
    prismaOrEnvChangedInOro6h: readBoolean(
      files,
      "prismaOrEnvChangedInOro6h",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6gLiveTrafficExternalCallReadinessGate ||
    !fixture.oro6gLiveTrafficExternalCallReadinessGatePassed ||
    !fixture.externalCallReadinessGatePreparedFromOro6g ||
    !fixture.externalCallReadinessGateEvaluatedFromOro6g ||
    !fixture.externalCallReadinessGatePassedFromOro6g ||
    fixture.externalCallReadinessGateStatusFromOro6g !==
      READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST ||
    fixture.externalCallExecutionAuthorizationRequestSubmittedFromOro6g ||
    fixture.externalCallExecutionAuthorizationDecisionIssuedFromOro6g ||
    fixture.externalCallExecutionAuthorizedFromOro6g ||
    !fixture.nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g ||
    !fixture
      .nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g
  ) {
    blockers.push("ORO-6G external call readiness gate record is required");
  }
  if (
    !fixture.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary ||
    !fixture.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed ||
    fixture.externalCallAuthorizationDecisionStatusFromOro6f !==
      APPROVED_FOR_READINESS_ONLY ||
    fixture.externalCallExecutionAuthorizedFromOro6f ||
    !fixture.externalCallReadinessGateAllowedFromOro6f
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
    !fixture.externalCallExecutionAuthorizationRequestPrepared ||
    !fixture.externalCallExecutionAuthorizationRequestSubmitted ||
    fixture.externalCallExecutionAuthorizationRequestStatus !==
      SUBMITTED_PENDING_EXECUTION_DECISION
  ) {
    blockers.push(
      "ORO-6H execution authorization request must be submitted pending execution decision"
    );
  }
  if (
    fixture.externalCallExecutionAuthorizationDecisionIssued ||
    fixture.externalCallExecutionAuthorizationDecisionStatus !== PENDING ||
    fixture.externalCallExecutionAuthorized
  ) {
    blockers.push("ORO-6H must not issue or authorize external call execution");
  }
  if (
    !fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision ||
    !fixture.humanApprovalRequired ||
    !fixture.separateExternalCallExecutionAuthorizationDecisionRequired
  ) {
    blockers.push(
      "next phase must issue separate external call execution authorization decision"
    );
  }
  if (
    fixture.srcAppChangedInOro6h ||
    fixture.runtimeRouteControllerServiceChangedInOro6h ||
    fixture.ledgerMockChangedInOro6h ||
    fixture.prismaOrEnvChangedInOro6h
  ) {
    blockers.push("ORO-6H must not change protected runtime, ledger, data, or env files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during request submission");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during request submission");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during request submission");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during request submission");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("data write and DB transaction must remain absent during request submission");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during request submission");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during request submission");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: ORO6H_PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult: result,
    dependsOnOro6gLiveTrafficExternalCallReadinessGate:
      fixture.dependsOnOro6gLiveTrafficExternalCallReadinessGate,
    oro6gLiveTrafficExternalCallReadinessGatePassed:
      pass && fixture.oro6gLiveTrafficExternalCallReadinessGatePassed,
    externalCallReadinessGatePreparedFromOro6g:
      pass && fixture.externalCallReadinessGatePreparedFromOro6g,
    externalCallReadinessGateEvaluatedFromOro6g:
      pass && fixture.externalCallReadinessGateEvaluatedFromOro6g,
    externalCallReadinessGatePassedFromOro6g:
      pass && fixture.externalCallReadinessGatePassedFromOro6g,
    externalCallReadinessGateStatusFromOro6g: pass
      ? fixture.externalCallReadinessGateStatusFromOro6g
      : HOLD,
    externalCallExecutionAuthorizationRequestSubmittedFromOro6g: false,
    externalCallExecutionAuthorizationDecisionIssuedFromOro6g: false,
    externalCallExecutionAuthorizedFromOro6g: false,
    nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g:
      pass &&
      fixture.nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g:
      pass &&
      fixture
        .nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g,
    dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary:
      fixture.dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary,
    oro6fLiveTrafficExternalCallAuthorizationDecisionPassed:
      pass && fixture.oro6fLiveTrafficExternalCallAuthorizationDecisionPassed,
    externalCallAuthorizationDecisionStatusFromOro6f: pass
      ? fixture.externalCallAuthorizationDecisionStatusFromOro6f
      : HOLD,
    externalCallExecutionAuthorizedFromOro6f: false,
    externalCallReadinessGateAllowedFromOro6f:
      pass && fixture.externalCallReadinessGateAllowedFromOro6f,
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
    externalCallExecutionAuthorizationRequestPrepared:
      pass && fixture.externalCallExecutionAuthorizationRequestPrepared,
    externalCallExecutionAuthorizationRequestSubmitted:
      pass && fixture.externalCallExecutionAuthorizationRequestSubmitted,
    externalCallExecutionAuthorizationRequestStatus: pass
      ? fixture.externalCallExecutionAuthorizationRequestStatus
      : HOLD,
    externalCallExecutionAuthorizationDecisionIssued: false,
    externalCallExecutionAuthorizationDecisionStatus: pass ? PENDING : HOLD,
    externalCallExecutionAuthorized: false,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision:
      pass &&
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    humanApprovalRequired: pass && fixture.humanApprovalRequired,
    separateExternalCallExecutionAuthorizationDecisionRequired:
      pass && fixture.separateExternalCallExecutionAuthorizationDecisionRequired,
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

function evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
  input = buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestRecord(
  input = {}
) {
  const fixture = normalizeInput(input);
  return {
    externalCallExecutionAuthorizationRequestPrepared:
      fixture.externalCallExecutionAuthorizationRequestPrepared,
    externalCallExecutionAuthorizationRequestSubmitted:
      fixture.externalCallExecutionAuthorizationRequestSubmitted,
    externalCallExecutionAuthorizationRequestStatus:
      fixture.externalCallExecutionAuthorizationRequestStatus,
    externalCallExecutionAuthorizationDecisionIssued:
      fixture.externalCallExecutionAuthorizationDecisionIssued,
    externalCallExecutionAuthorizationDecisionStatus:
      fixture.externalCallExecutionAuthorizationDecisionStatus,
    externalCallExecutionAuthorized: fixture.externalCallExecutionAuthorized,
    nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision:
      fixture.nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision,
    humanApprovalRequired: fixture.humanApprovalRequired,
    separateExternalCallExecutionAuthorizationDecisionRequired:
      fixture.separateExternalCallExecutionAuthorizationDecisionRequired,
  };
}

function runOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryHarness(
  input
) {
  return evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary(
    input
  );
}

module.exports = {
  ORO6H_PHASE,
  PASS,
  HOLD,
  SUBMITTED_PENDING_EXECUTION_DECISION,
  PENDING,
  READY_FOR_SEPARATE_EXECUTION_AUTHORIZATION_REQUEST,
  APPROVED_FOR_READINESS_ONLY,
  LIVE_TRAFFIC_MODE,
  ORO6H_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_STATUS,
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput,
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestRecord,
  evaluateOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary,
  runOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundaryHarness,
};
