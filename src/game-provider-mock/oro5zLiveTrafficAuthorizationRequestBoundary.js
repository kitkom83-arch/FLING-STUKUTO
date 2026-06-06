"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5Y_PASS,
  VALIDATION_PASSED,
  buildOro5yRuntimeTrafficPostEnablementValidationSummary,
} = require("./oro5yRuntimeTrafficPostEnablementValidationBoundary");

const PHASE = "ORO-5Z";
const PASS = "PASS";
const HOLD = "HOLD";
const LIVE_TRAFFIC_REQUEST_STATUS = "submitted_pending_decision";
const LIVE_TRAFFIC_DECISION_STATUS = "pending";
const RUNTIME_TRAFFIC_MODE = FAIL_CLOSED_NO_MUTATION;

const ORO5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  LIVE_TRAFFIC_REQUEST_STATUS,
  LIVE_TRAFFIC_DECISION_STATUS,
  RUNTIME_TRAFFIC_MODE,
});

const BASELINE_ORO5Y_SUMMARY =
  buildOro5yRuntimeTrafficPostEnablementValidationSummary();

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

function buildOro5zLiveTrafficAuthorizationRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficAuthorizationRequestFixture",
    phase: PHASE,
    oro5yValidationEvidence: {
      dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary: true,
      oro5yRuntimeTrafficPostEnablementValidationPassed:
        BASELINE_ORO5Y_SUMMARY.runtimeTrafficPostEnablementValidationBoundaryResult ===
          ORO5Y_PASS &&
        BASELINE_ORO5Y_SUMMARY.runtimeTrafficPostEnablementValidationStatus ===
          VALIDATION_PASSED,
      runtimeTrafficEnabledFromOro5y:
        BASELINE_ORO5Y_SUMMARY.runtimeTrafficEnabledFromOro5x === true,
      runtimeTrafficModeFromOro5y:
        BASELINE_ORO5Y_SUMMARY.runtimeTrafficModeFromOro5x,
    },
    requestEvidence: {
      liveTrafficAuthorizationRequestPrepared: true,
      liveTrafficAuthorizationRequestSubmitted: true,
      liveTrafficAuthorizationRequestStatus: LIVE_TRAFFIC_REQUEST_STATUS,
      humanApprovalRequired: true,
      separateLiveTrafficDecisionRequired: true,
      nextPhaseRequiresLiveTrafficAuthorizationDecision: true,
      responseSanitized: true,
    },
    decisionEvidence: {
      liveTrafficAuthorizationDecisionIssued: false,
      liveTrafficAuthorizationDecisionStatus: LIVE_TRAFFIC_DECISION_STATUS,
      liveTrafficAllowed: false,
      liveTrafficEnabled: false,
    },
    safetyEvidence: {
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
      externalNetworkAllowed: false,
      externalNetworkCalled: false,
      liveOroPlayApiCallAllowed: false,
      liveOroPlayApiCalled: false,
      secretsLeaked: false,
    },
    fileEvidence: {
      srcAppChangedInOro5z: false,
      runtimeRouteControllerChangedInOro5z: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5zLiveTrafficAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const oro5y = isPlainObject(merged.oro5yValidationEvidence)
    ? merged.oro5yValidationEvidence
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
    dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary: readBoolean(
      oro5y,
      "dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary",
      true
    ),
    oro5yRuntimeTrafficPostEnablementValidationPassed: readBoolean(
      oro5y,
      "oro5yRuntimeTrafficPostEnablementValidationPassed",
      true
    ),
    runtimeTrafficEnabledFromOro5y: readBoolean(
      oro5y,
      "runtimeTrafficEnabledFromOro5y",
      true
    ),
    runtimeTrafficModeFromOro5y: readString(
      oro5y,
      "runtimeTrafficModeFromOro5y",
      RUNTIME_TRAFFIC_MODE
    ),
    liveTrafficAuthorizationRequestPrepared: readBoolean(
      request,
      "liveTrafficAuthorizationRequestPrepared",
      true
    ),
    liveTrafficAuthorizationRequestSubmitted: readBoolean(
      request,
      "liveTrafficAuthorizationRequestSubmitted",
      true
    ),
    liveTrafficAuthorizationRequestStatus: readString(
      request,
      "liveTrafficAuthorizationRequestStatus",
      LIVE_TRAFFIC_REQUEST_STATUS
    ),
    humanApprovalRequired: readBoolean(
      request,
      "humanApprovalRequired",
      true
    ),
    separateLiveTrafficDecisionRequired: readBoolean(
      request,
      "separateLiveTrafficDecisionRequired",
      true
    ),
    nextPhaseRequiresLiveTrafficAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresLiveTrafficAuthorizationDecision",
      true
    ),
    responseSanitized: readBoolean(request, "responseSanitized", true),
    liveTrafficAuthorizationDecisionIssued: readBoolean(
      decision,
      "liveTrafficAuthorizationDecisionIssued",
      false
    ),
    liveTrafficAuthorizationDecisionStatus: readString(
      decision,
      "liveTrafficAuthorizationDecisionStatus",
      LIVE_TRAFFIC_DECISION_STATUS
    ),
    liveTrafficAllowed: readBoolean(decision, "liveTrafficAllowed", false),
    liveTrafficEnabled: readBoolean(decision, "liveTrafficEnabled", false),
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
    externalNetworkAllowed: readBoolean(safety, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(safety, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(safety, "liveOroPlayApiCallAllowed", false),
    liveOroPlayApiCalled: readBoolean(safety, "liveOroPlayApiCalled", false),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
    srcAppChangedInOro5z: readBoolean(files, "srcAppChangedInOro5z", false),
    runtimeRouteControllerChangedInOro5z: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5z",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary ||
    !fixture.oro5yRuntimeTrafficPostEnablementValidationPassed ||
    !fixture.runtimeTrafficEnabledFromOro5y ||
    fixture.runtimeTrafficModeFromOro5y !== RUNTIME_TRAFFIC_MODE
  ) {
    blockers.push("ORO-5Y post-enablement validation record is required");
  }
  if (
    !fixture.liveTrafficAuthorizationRequestPrepared ||
    !fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationRequestStatus !== LIVE_TRAFFIC_REQUEST_STATUS
  ) {
    blockers.push("live traffic authorization request must be submitted only as pending decision");
  }
  if (
    !fixture.humanApprovalRequired ||
    !fixture.separateLiveTrafficDecisionRequired ||
    !fixture.nextPhaseRequiresLiveTrafficAuthorizationDecision
  ) {
    blockers.push("human approval and separate live traffic decision are required");
  }
  if (!fixture.responseSanitized) {
    blockers.push("live traffic authorization request response must remain sanitized");
  }
  if (
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAuthorizationDecisionStatus !== LIVE_TRAFFIC_DECISION_STATUS ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain disabled while request waits for decision");
  }
  if (fixture.srcAppChangedInOro5z || fixture.runtimeRouteControllerChangedInOro5z) {
    blockers.push("ORO-5Z must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live traffic request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live traffic request");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during live traffic request");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during live traffic request");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live traffic request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live traffic request");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during live traffic request");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficAuthorizationRequestBoundaryResult: result,
    dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary:
      fixture.dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary,
    oro5yRuntimeTrafficPostEnablementValidationPassed:
      pass && fixture.oro5yRuntimeTrafficPostEnablementValidationPassed,
    runtimeTrafficEnabledFromOro5y:
      pass && fixture.runtimeTrafficEnabledFromOro5y,
    runtimeTrafficModeFromOro5y: pass
      ? fixture.runtimeTrafficModeFromOro5y
      : HOLD,
    liveTrafficAuthorizationRequestPrepared:
      pass && fixture.liveTrafficAuthorizationRequestPrepared,
    liveTrafficAuthorizationRequestSubmitted:
      pass && fixture.liveTrafficAuthorizationRequestSubmitted,
    liveTrafficAuthorizationRequestStatus: pass
      ? fixture.liveTrafficAuthorizationRequestStatus
      : HOLD,
    humanApprovalRequired: pass && fixture.humanApprovalRequired,
    separateLiveTrafficDecisionRequired:
      pass && fixture.separateLiveTrafficDecisionRequired,
    nextPhaseRequiresLiveTrafficAuthorizationDecision:
      pass && fixture.nextPhaseRequiresLiveTrafficAuthorizationDecision,
    liveTrafficAuthorizationDecisionIssued: false,
    liveTrafficAuthorizationDecisionStatus: LIVE_TRAFFIC_DECISION_STATUS,
    liveTrafficAllowed: false,
    liveTrafficEnabled: false,
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
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    secretsLeaked: false,
    blockers,
  };
}

function buildOro5zLiveTrafficAuthorizationRequestSummary(
  input = buildOro5zLiveTrafficAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro5zLiveTrafficAuthorizationRequestSummary(input);
  return {
    valid: summary.liveTrafficAuthorizationRequestBoundaryResult === PASS,
    liveTrafficAuthorizationRequestBoundaryResult:
      summary.liveTrafficAuthorizationRequestBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro5yPostEnablementValidationRecord(input) {
  const summary = buildOro5zLiveTrafficAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary &&
    summary.oro5yRuntimeTrafficPostEnablementValidationPassed &&
    summary.runtimeTrafficEnabledFromOro5y &&
    summary.runtimeTrafficModeFromOro5y === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function buildLiveTrafficAuthorizationRequest(input) {
  const fixture = normalizeInput(input);
  return {
    liveTrafficAuthorizationRequestPrepared:
      fixture.liveTrafficAuthorizationRequestPrepared,
    liveTrafficAuthorizationRequestSubmitted:
      fixture.liveTrafficAuthorizationRequestSubmitted,
    liveTrafficAuthorizationRequestStatus:
      fixture.liveTrafficAuthorizationRequestStatus,
    humanApprovalRequired: fixture.humanApprovalRequired,
    separateLiveTrafficDecisionRequired:
      fixture.separateLiveTrafficDecisionRequired,
    nextPhaseRequiresLiveTrafficAuthorizationDecision:
      fixture.nextPhaseRequiresLiveTrafficAuthorizationDecision,
    responseSanitized: fixture.responseSanitized,
  };
}

function validateLiveTrafficAuthorizationRequestBoundary(input) {
  const summary = buildOro5zLiveTrafficAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficAuthorizationRequestPrepared &&
    summary.liveTrafficAuthorizationRequestSubmitted &&
    summary.liveTrafficAuthorizationRequestStatus === LIVE_TRAFFIC_REQUEST_STATUS &&
    summary.humanApprovalRequired &&
    summary.separateLiveTrafficDecisionRequired &&
    summary.nextPhaseRequiresLiveTrafficAuthorizationDecision;
  return { ...base, valid };
}

function validateNoLiveTrafficEnabledDuringRequest(input) {
  const summary = buildOro5zLiveTrafficAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    !summary.liveTrafficAuthorizationDecisionIssued &&
    summary.liveTrafficAuthorizationDecisionStatus === LIVE_TRAFFIC_DECISION_STATUS &&
    !summary.liveTrafficAllowed &&
    !summary.liveTrafficEnabled;
  return { ...base, valid };
}

function validateNoMutationDuringLiveTrafficRequest(input) {
  const summary = buildOro5zLiveTrafficAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const unsafe = [
    "walletMutationAllowed",
    "walletMutationPerformed",
    "ledgerMutationAllowed",
    "ledgerMutationPerformed",
    "prismaWriteAllowed",
    "prismaWritePerformed",
    "dbTransactionAllowed",
    "dbTransactionPerformed",
    "migrationAllowed",
    "migrationPerformed",
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "secretsLeaked",
  ].filter((key) => summary[key] !== false);
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  LIVE_TRAFFIC_REQUEST_STATUS,
  LIVE_TRAFFIC_DECISION_STATUS,
  RUNTIME_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_STATUS,
  buildOro5zLiveTrafficAuthorizationRequestInput,
  validateOro5yPostEnablementValidationRecord,
  buildLiveTrafficAuthorizationRequest,
  validateLiveTrafficAuthorizationRequestBoundary,
  validateNoLiveTrafficEnabledDuringRequest,
  validateNoMutationDuringLiveTrafficRequest,
  buildOro5zLiveTrafficAuthorizationRequestSummary,
};
