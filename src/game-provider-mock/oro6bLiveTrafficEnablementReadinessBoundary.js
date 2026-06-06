"use strict";

const {
  LIVE_TRAFFIC_DECISION_RESULT,
  PASS: ORO6A_PASS,
  RUNTIME_TRAFFIC_MODE,
  buildOro6aLiveTrafficAuthorizationDecisionSummary,
} = require("./oro6aLiveTrafficAuthorizationDecisionBoundary");

const PHASE = "ORO-6B";
const PASS = "PASS";
const HOLD = "HOLD";
const LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS =
  "ready_for_enablement_boundary";

const ORO6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  LIVE_TRAFFIC_DECISION_RESULT,
  RUNTIME_TRAFFIC_MODE,
});

const BASELINE_ORO6A_SUMMARY =
  buildOro6aLiveTrafficAuthorizationDecisionSummary();

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

function buildOro6bLiveTrafficEnablementReadinessInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficEnablementReadinessFixture",
    phase: PHASE,
    oro6aDecisionEvidence: {
      dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary: true,
      oro6aLiveTrafficAuthorizationDecisionIssued:
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionBoundaryResult ===
          ORO6A_PASS &&
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionIssued === true,
      oro6aLiveTrafficAuthorizationDecisionResult:
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionResult,
      runtimeTrafficEnabledFromOro6a:
        BASELINE_ORO6A_SUMMARY.runtimeTrafficEnabledFromOro5z === true,
      runtimeTrafficModeFromOro6a:
        BASELINE_ORO6A_SUMMARY.runtimeTrafficModeFromOro5z,
    },
    readinessEvidence: {
      liveTrafficEnablementReadinessChecked: true,
      liveTrafficEnablementReadinessStatus:
        LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
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
      srcAppChangedInOro6b: false,
      runtimeRouteControllerChangedInOro6b: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6bLiveTrafficEnablementReadinessInput();
  const merged = deepMerge(baseline, source);
  const oro6a = isPlainObject(merged.oro6aDecisionEvidence)
    ? merged.oro6aDecisionEvidence
    : {};
  const readiness = isPlainObject(merged.readinessEvidence)
    ? merged.readinessEvidence
    : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary: readBoolean(
      oro6a,
      "dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary",
      true
    ),
    oro6aLiveTrafficAuthorizationDecisionIssued: readBoolean(
      oro6a,
      "oro6aLiveTrafficAuthorizationDecisionIssued",
      true
    ),
    oro6aLiveTrafficAuthorizationDecisionResult: readString(
      oro6a,
      "oro6aLiveTrafficAuthorizationDecisionResult",
      LIVE_TRAFFIC_DECISION_RESULT
    ),
    runtimeTrafficEnabledFromOro6a: readBoolean(
      oro6a,
      "runtimeTrafficEnabledFromOro6a",
      true
    ),
    runtimeTrafficModeFromOro6a: readString(
      oro6a,
      "runtimeTrafficModeFromOro6a",
      RUNTIME_TRAFFIC_MODE
    ),
    liveTrafficEnablementReadinessChecked: readBoolean(
      readiness,
      "liveTrafficEnablementReadinessChecked",
      true
    ),
    liveTrafficEnablementReadinessStatus: readString(
      readiness,
      "liveTrafficEnablementReadinessStatus",
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
    ),
    responseSanitized: readBoolean(readiness, "responseSanitized", true),
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
    srcAppChangedInOro6b: readBoolean(files, "srcAppChangedInOro6b", false),
    runtimeRouteControllerChangedInOro6b: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro6b",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary ||
    !fixture.oro6aLiveTrafficAuthorizationDecisionIssued ||
    fixture.oro6aLiveTrafficAuthorizationDecisionResult !==
      LIVE_TRAFFIC_DECISION_RESULT ||
    !fixture.runtimeTrafficEnabledFromOro6a ||
    fixture.runtimeTrafficModeFromOro6a !== RUNTIME_TRAFFIC_MODE
  ) {
    blockers.push("ORO-6A approved live traffic decision record is required");
  }
  if (
    !fixture.liveTrafficEnablementReadinessChecked ||
    fixture.liveTrafficEnablementReadinessStatus !==
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
  ) {
    blockers.push("live traffic enablement readiness must be checked");
  }
  if (fixture.liveTrafficAllowed || fixture.liveTrafficEnabled) {
    blockers.push("live traffic must remain disabled during readiness");
  }
  if (
    !fixture.separateLiveTrafficEnablementRequired ||
    !fixture.nextPhaseRequiresLiveTrafficEnablementBoundary
  ) {
    blockers.push("separate live traffic enablement boundary is required");
  }
  if (!fixture.responseSanitized) {
    blockers.push("live traffic enablement readiness response must remain sanitized");
  }
  if (fixture.srcAppChangedInOro6b || fixture.runtimeRouteControllerChangedInOro6b) {
    blockers.push("ORO-6B must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live traffic readiness");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live traffic readiness");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during live traffic readiness");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during live traffic readiness");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live traffic readiness");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live traffic readiness");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during live traffic readiness");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficEnablementReadinessBoundaryResult: result,
    dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary:
      fixture.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary,
    oro6aLiveTrafficAuthorizationDecisionIssued:
      pass && fixture.oro6aLiveTrafficAuthorizationDecisionIssued,
    oro6aLiveTrafficAuthorizationDecisionResult: pass
      ? fixture.oro6aLiveTrafficAuthorizationDecisionResult
      : HOLD,
    runtimeTrafficEnabledFromOro6a:
      pass && fixture.runtimeTrafficEnabledFromOro6a,
    runtimeTrafficModeFromOro6a: pass
      ? fixture.runtimeTrafficModeFromOro6a
      : HOLD,
    liveTrafficEnablementReadinessChecked:
      pass && fixture.liveTrafficEnablementReadinessChecked,
    liveTrafficEnablementReadinessStatus: pass
      ? fixture.liveTrafficEnablementReadinessStatus
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

function buildOro6bLiveTrafficEnablementReadinessSummary(
  input = buildOro6bLiveTrafficEnablementReadinessInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro6bLiveTrafficEnablementReadinessSummary(input);
  return {
    valid: summary.liveTrafficEnablementReadinessBoundaryResult === PASS,
    liveTrafficEnablementReadinessBoundaryResult:
      summary.liveTrafficEnablementReadinessBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro6aLiveTrafficAuthorizationDecisionRecord(input) {
  const summary = buildOro6bLiveTrafficEnablementReadinessSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary &&
    summary.oro6aLiveTrafficAuthorizationDecisionIssued &&
    summary.oro6aLiveTrafficAuthorizationDecisionResult ===
      LIVE_TRAFFIC_DECISION_RESULT &&
    summary.runtimeTrafficEnabledFromOro6a &&
    summary.runtimeTrafficModeFromOro6a === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function buildLiveTrafficEnablementReadinessRecord(input) {
  const fixture = normalizeInput(input);
  return {
    liveTrafficEnablementReadinessChecked:
      fixture.liveTrafficEnablementReadinessChecked,
    liveTrafficEnablementReadinessStatus:
      fixture.liveTrafficEnablementReadinessStatus,
    separateLiveTrafficEnablementRequired:
      fixture.separateLiveTrafficEnablementRequired,
    nextPhaseRequiresLiveTrafficEnablementBoundary:
      fixture.nextPhaseRequiresLiveTrafficEnablementBoundary,
    responseSanitized: fixture.responseSanitized,
  };
}

function validateLiveTrafficEnablementReadinessBoundary(input) {
  const summary = buildOro6bLiveTrafficEnablementReadinessSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficEnablementReadinessChecked &&
    summary.liveTrafficEnablementReadinessStatus ===
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS &&
    summary.separateLiveTrafficEnablementRequired &&
    summary.nextPhaseRequiresLiveTrafficEnablementBoundary;
  return { ...base, valid };
}

function validateNoLiveTrafficEnabledDuringReadiness(input) {
  const summary = buildOro6bLiveTrafficEnablementReadinessSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    !summary.liveTrafficAllowed &&
    !summary.liveTrafficEnabled &&
    summary.separateLiveTrafficEnablementRequired &&
    summary.nextPhaseRequiresLiveTrafficEnablementBoundary;
  return { ...base, valid };
}

function validateNoMutationDuringLiveTrafficReadiness(input) {
  const summary = buildOro6bLiveTrafficEnablementReadinessSummary(input);
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
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  LIVE_TRAFFIC_DECISION_RESULT,
  RUNTIME_TRAFFIC_MODE,
  ORO6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  buildOro6bLiveTrafficEnablementReadinessInput,
  validateOro6aLiveTrafficAuthorizationDecisionRecord,
  buildLiveTrafficEnablementReadinessRecord,
  validateLiveTrafficEnablementReadinessBoundary,
  validateNoLiveTrafficEnabledDuringReadiness,
  validateNoMutationDuringLiveTrafficReadiness,
  buildOro6bLiveTrafficEnablementReadinessSummary,
};
