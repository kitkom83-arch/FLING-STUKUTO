"use strict";

const {
  PASS: ORO5Z_PASS,
  RUNTIME_TRAFFIC_MODE,
  buildOro5zLiveTrafficAuthorizationRequestSummary,
} = require("./oro5zLiveTrafficAuthorizationRequestBoundary");

const PHASE = "ORO-6A";
const PASS = "PASS";
const HOLD = "HOLD";
const LIVE_TRAFFIC_DECISION_STATUS = "decision_issued";
const LIVE_TRAFFIC_DECISION_RESULT = "approved";

const ORO6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  LIVE_TRAFFIC_DECISION_STATUS,
  LIVE_TRAFFIC_DECISION_RESULT,
  RUNTIME_TRAFFIC_MODE,
});

const BASELINE_ORO5Z_SUMMARY =
  buildOro5zLiveTrafficAuthorizationRequestSummary();

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

function buildOro6aLiveTrafficAuthorizationDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficAuthorizationDecisionFixture",
    phase: PHASE,
    oro5zRequestEvidence: {
      dependsOnOro5zLiveTrafficAuthorizationRequestBoundary: true,
      oro5zLiveTrafficAuthorizationRequestSubmitted:
        BASELINE_ORO5Z_SUMMARY.liveTrafficAuthorizationRequestBoundaryResult ===
          ORO5Z_PASS &&
        BASELINE_ORO5Z_SUMMARY.liveTrafficAuthorizationRequestSubmitted === true,
      runtimeTrafficEnabledFromOro5z:
        BASELINE_ORO5Z_SUMMARY.runtimeTrafficEnabledFromOro5y === true,
      runtimeTrafficModeFromOro5z:
        BASELINE_ORO5Z_SUMMARY.runtimeTrafficModeFromOro5y,
    },
    decisionEvidence: {
      liveTrafficAuthorizationDecisionIssued: true,
      liveTrafficAuthorizationDecisionStatus: LIVE_TRAFFIC_DECISION_STATUS,
      liveTrafficAuthorizationDecisionResult: LIVE_TRAFFIC_DECISION_RESULT,
      responseSanitized: true,
    },
    liveTrafficEvidence: {
      liveTrafficAllowed: false,
      liveTrafficEnabled: false,
      separateLiveTrafficEnablementRequired: true,
      nextPhaseRequiresLiveTrafficEnablementBoundary: true,
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
      srcAppChangedInOro6a: false,
      runtimeRouteControllerChangedInOro6a: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6aLiveTrafficAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const oro5z = isPlainObject(merged.oro5zRequestEvidence)
    ? merged.oro5zRequestEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5zLiveTrafficAuthorizationRequestBoundary: readBoolean(
      oro5z,
      "dependsOnOro5zLiveTrafficAuthorizationRequestBoundary",
      true
    ),
    oro5zLiveTrafficAuthorizationRequestSubmitted: readBoolean(
      oro5z,
      "oro5zLiveTrafficAuthorizationRequestSubmitted",
      true
    ),
    runtimeTrafficEnabledFromOro5z: readBoolean(
      oro5z,
      "runtimeTrafficEnabledFromOro5z",
      true
    ),
    runtimeTrafficModeFromOro5z: readString(
      oro5z,
      "runtimeTrafficModeFromOro5z",
      RUNTIME_TRAFFIC_MODE
    ),
    liveTrafficAuthorizationDecisionIssued: readBoolean(
      decision,
      "liveTrafficAuthorizationDecisionIssued",
      true
    ),
    liveTrafficAuthorizationDecisionStatus: readString(
      decision,
      "liveTrafficAuthorizationDecisionStatus",
      LIVE_TRAFFIC_DECISION_STATUS
    ),
    liveTrafficAuthorizationDecisionResult: readString(
      decision,
      "liveTrafficAuthorizationDecisionResult",
      LIVE_TRAFFIC_DECISION_RESULT
    ),
    responseSanitized: readBoolean(decision, "responseSanitized", true),
    liveTrafficAllowed: readBoolean(live, "liveTrafficAllowed", false),
    liveTrafficEnabled: readBoolean(live, "liveTrafficEnabled", false),
    separateLiveTrafficEnablementRequired: readBoolean(
      live,
      "separateLiveTrafficEnablementRequired",
      true
    ),
    nextPhaseRequiresLiveTrafficEnablementBoundary: readBoolean(
      live,
      "nextPhaseRequiresLiveTrafficEnablementBoundary",
      true
    ),
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
    srcAppChangedInOro6a: readBoolean(files, "srcAppChangedInOro6a", false),
    runtimeRouteControllerChangedInOro6a: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro6a",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro5zLiveTrafficAuthorizationRequestBoundary ||
    !fixture.oro5zLiveTrafficAuthorizationRequestSubmitted ||
    !fixture.runtimeTrafficEnabledFromOro5z ||
    fixture.runtimeTrafficModeFromOro5z !== RUNTIME_TRAFFIC_MODE
  ) {
    blockers.push("ORO-5Z live traffic authorization request record is required");
  }
  if (
    !fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAuthorizationDecisionStatus !==
      LIVE_TRAFFIC_DECISION_STATUS ||
    fixture.liveTrafficAuthorizationDecisionResult !== LIVE_TRAFFIC_DECISION_RESULT
  ) {
    blockers.push("live traffic authorization decision must be issued and approved");
  }
  if (fixture.liveTrafficAllowed || fixture.liveTrafficEnabled) {
    blockers.push("live traffic must remain disabled until enablement boundary");
  }
  if (
    !fixture.separateLiveTrafficEnablementRequired ||
    !fixture.nextPhaseRequiresLiveTrafficEnablementBoundary
  ) {
    blockers.push("separate live traffic enablement boundary is required");
  }
  if (!fixture.responseSanitized) {
    blockers.push("live traffic authorization decision response must remain sanitized");
  }
  if (fixture.srcAppChangedInOro6a || fixture.runtimeRouteControllerChangedInOro6a) {
    blockers.push("ORO-6A must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live traffic decision");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live traffic decision");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during live traffic decision");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during live traffic decision");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live traffic decision");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live traffic decision");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during live traffic decision");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficAuthorizationDecisionBoundaryResult: result,
    dependsOnOro5zLiveTrafficAuthorizationRequestBoundary:
      fixture.dependsOnOro5zLiveTrafficAuthorizationRequestBoundary,
    oro5zLiveTrafficAuthorizationRequestSubmitted:
      pass && fixture.oro5zLiveTrafficAuthorizationRequestSubmitted,
    runtimeTrafficEnabledFromOro5z:
      pass && fixture.runtimeTrafficEnabledFromOro5z,
    runtimeTrafficModeFromOro5z: pass
      ? fixture.runtimeTrafficModeFromOro5z
      : HOLD,
    liveTrafficAuthorizationDecisionIssued:
      pass && fixture.liveTrafficAuthorizationDecisionIssued,
    liveTrafficAuthorizationDecisionStatus: pass
      ? fixture.liveTrafficAuthorizationDecisionStatus
      : HOLD,
    liveTrafficAuthorizationDecisionResult: pass
      ? fixture.liveTrafficAuthorizationDecisionResult
      : HOLD,
    liveTrafficAllowed: false,
    liveTrafficEnabled: false,
    separateLiveTrafficEnablementRequired:
      pass && fixture.separateLiveTrafficEnablementRequired,
    nextPhaseRequiresLiveTrafficEnablementBoundary:
      pass && fixture.nextPhaseRequiresLiveTrafficEnablementBoundary,
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

function buildOro6aLiveTrafficAuthorizationDecisionSummary(
  input = buildOro6aLiveTrafficAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro6aLiveTrafficAuthorizationDecisionSummary(input);
  return {
    valid: summary.liveTrafficAuthorizationDecisionBoundaryResult === PASS,
    liveTrafficAuthorizationDecisionBoundaryResult:
      summary.liveTrafficAuthorizationDecisionBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro5zLiveTrafficAuthorizationRequestRecord(input) {
  const summary = buildOro6aLiveTrafficAuthorizationDecisionSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro5zLiveTrafficAuthorizationRequestBoundary &&
    summary.oro5zLiveTrafficAuthorizationRequestSubmitted &&
    summary.runtimeTrafficEnabledFromOro5z &&
    summary.runtimeTrafficModeFromOro5z === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function buildLiveTrafficAuthorizationDecision(input) {
  const fixture = normalizeInput(input);
  return {
    liveTrafficAuthorizationDecisionIssued:
      fixture.liveTrafficAuthorizationDecisionIssued,
    liveTrafficAuthorizationDecisionStatus:
      fixture.liveTrafficAuthorizationDecisionStatus,
    liveTrafficAuthorizationDecisionResult:
      fixture.liveTrafficAuthorizationDecisionResult,
    separateLiveTrafficEnablementRequired:
      fixture.separateLiveTrafficEnablementRequired,
    nextPhaseRequiresLiveTrafficEnablementBoundary:
      fixture.nextPhaseRequiresLiveTrafficEnablementBoundary,
    responseSanitized: fixture.responseSanitized,
  };
}

function validateLiveTrafficAuthorizationDecisionBoundary(input) {
  const summary = buildOro6aLiveTrafficAuthorizationDecisionSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficAuthorizationDecisionIssued &&
    summary.liveTrafficAuthorizationDecisionStatus ===
      LIVE_TRAFFIC_DECISION_STATUS &&
    summary.liveTrafficAuthorizationDecisionResult === LIVE_TRAFFIC_DECISION_RESULT &&
    summary.separateLiveTrafficEnablementRequired &&
    summary.nextPhaseRequiresLiveTrafficEnablementBoundary;
  return { ...base, valid };
}

function validateNoLiveTrafficEnabledDuringDecision(input) {
  const summary = buildOro6aLiveTrafficAuthorizationDecisionSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    !summary.liveTrafficAllowed &&
    !summary.liveTrafficEnabled &&
    summary.separateLiveTrafficEnablementRequired &&
    summary.nextPhaseRequiresLiveTrafficEnablementBoundary;
  return { ...base, valid };
}

function validateNoMutationDuringLiveTrafficDecision(input) {
  const summary = buildOro6aLiveTrafficAuthorizationDecisionSummary(input);
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
  LIVE_TRAFFIC_DECISION_STATUS,
  LIVE_TRAFFIC_DECISION_RESULT,
  RUNTIME_TRAFFIC_MODE,
  ORO6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_STATUS,
  buildOro6aLiveTrafficAuthorizationDecisionInput,
  validateOro5zLiveTrafficAuthorizationRequestRecord,
  buildLiveTrafficAuthorizationDecision,
  validateLiveTrafficAuthorizationDecisionBoundary,
  validateNoLiveTrafficEnabledDuringDecision,
  validateNoMutationDuringLiveTrafficDecision,
  buildOro6aLiveTrafficAuthorizationDecisionSummary,
};
