"use strict";

const {
  LIVE_TRAFFIC_DECISION_RESULT,
  PASS: ORO6A_PASS,
  RUNTIME_TRAFFIC_MODE,
  buildOro6aLiveTrafficAuthorizationDecisionSummary,
} = require("./oro6aLiveTrafficAuthorizationDecisionBoundary");
const {
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  PASS: ORO6B_PASS,
  buildOro6bLiveTrafficEnablementReadinessSummary,
} = require("./oro6bLiveTrafficEnablementReadinessBoundary");

const PHASE = "ORO-6C";
const PASS = "PASS";
const HOLD = "HOLD";
const LIVE_TRAFFIC_MODE = RUNTIME_TRAFFIC_MODE;

const ORO6C_LIVE_TRAFFIC_ENABLEMENT_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  LIVE_TRAFFIC_DECISION_RESULT,
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  LIVE_TRAFFIC_MODE,
  RUNTIME_TRAFFIC_MODE,
});

const BASELINE_ORO6A_SUMMARY =
  buildOro6aLiveTrafficAuthorizationDecisionSummary();
const BASELINE_ORO6B_SUMMARY =
  buildOro6bLiveTrafficEnablementReadinessSummary();

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

function buildOro6cLiveTrafficEnablementInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficEnablementFailClosedFixture",
    phase: PHASE,
    oro6aDecisionEvidence: {
      dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary: true,
      oro6aLiveTrafficAuthorizationDecisionIssued:
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionBoundaryResult ===
          ORO6A_PASS &&
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionIssued === true,
      oro6aLiveTrafficAuthorizationDecisionResult:
        BASELINE_ORO6A_SUMMARY.liveTrafficAuthorizationDecisionResult,
    },
    oro6bReadinessEvidence: {
      dependsOnOro6bLiveTrafficEnablementReadinessBoundary: true,
      oro6bLiveTrafficEnablementReadinessChecked:
        BASELINE_ORO6B_SUMMARY.liveTrafficEnablementReadinessBoundaryResult ===
          ORO6B_PASS &&
        BASELINE_ORO6B_SUMMARY.liveTrafficEnablementReadinessChecked === true,
      oro6bLiveTrafficEnablementReadinessStatus:
        BASELINE_ORO6B_SUMMARY.liveTrafficEnablementReadinessStatus,
      runtimeTrafficEnabledFromOro6b:
        BASELINE_ORO6B_SUMMARY.runtimeTrafficEnabledFromOro6a === true,
      runtimeTrafficModeFromOro6b:
        BASELINE_ORO6B_SUMMARY.runtimeTrafficModeFromOro6a,
    },
    enablementEvidence: {
      liveTrafficEnablementBoundaryEntered: true,
      liveTrafficEnablementBoundaryChecked: true,
      liveTrafficAllowed: true,
      liveTrafficEnabled: true,
      liveTrafficMode: LIVE_TRAFFIC_MODE,
      responseSanitized: true,
      nextPhaseRequiresLiveTrafficPostEnablementValidation: true,
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
      srcAppChangedInOro6c: false,
      runtimeRouteControllerChangedInOro6c: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6cLiveTrafficEnablementInput();
  const merged = deepMerge(baseline, source);
  const oro6a = isPlainObject(merged.oro6aDecisionEvidence)
    ? merged.oro6aDecisionEvidence
    : {};
  const oro6b = isPlainObject(merged.oro6bReadinessEvidence)
    ? merged.oro6bReadinessEvidence
    : {};
  const enablement = isPlainObject(merged.enablementEvidence)
    ? merged.enablementEvidence
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
    dependsOnOro6bLiveTrafficEnablementReadinessBoundary: readBoolean(
      oro6b,
      "dependsOnOro6bLiveTrafficEnablementReadinessBoundary",
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
    oro6bLiveTrafficEnablementReadinessChecked: readBoolean(
      oro6b,
      "oro6bLiveTrafficEnablementReadinessChecked",
      true
    ),
    oro6bLiveTrafficEnablementReadinessStatus: readString(
      oro6b,
      "oro6bLiveTrafficEnablementReadinessStatus",
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
    ),
    runtimeTrafficEnabledFromOro6b: readBoolean(
      oro6b,
      "runtimeTrafficEnabledFromOro6b",
      true
    ),
    runtimeTrafficModeFromOro6b: readString(
      oro6b,
      "runtimeTrafficModeFromOro6b",
      RUNTIME_TRAFFIC_MODE
    ),
    liveTrafficEnablementBoundaryEntered: readBoolean(
      enablement,
      "liveTrafficEnablementBoundaryEntered",
      true
    ),
    liveTrafficEnablementBoundaryChecked: readBoolean(
      enablement,
      "liveTrafficEnablementBoundaryChecked",
      true
    ),
    liveTrafficAllowed: readBoolean(enablement, "liveTrafficAllowed", true),
    liveTrafficEnabled: readBoolean(enablement, "liveTrafficEnabled", true),
    liveTrafficMode: readString(
      enablement,
      "liveTrafficMode",
      LIVE_TRAFFIC_MODE
    ),
    responseSanitized: readBoolean(enablement, "responseSanitized", true),
    nextPhaseRequiresLiveTrafficPostEnablementValidation: readBoolean(
      enablement,
      "nextPhaseRequiresLiveTrafficPostEnablementValidation",
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
    srcAppChangedInOro6c: readBoolean(files, "srcAppChangedInOro6c", false),
    runtimeRouteControllerChangedInOro6c: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro6c",
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
      LIVE_TRAFFIC_DECISION_RESULT
  ) {
    blockers.push("ORO-6A approved live traffic decision record is required");
  }
  if (
    !fixture.dependsOnOro6bLiveTrafficEnablementReadinessBoundary ||
    !fixture.oro6bLiveTrafficEnablementReadinessChecked ||
    fixture.oro6bLiveTrafficEnablementReadinessStatus !==
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
  ) {
    blockers.push("ORO-6B live traffic enablement readiness record is required");
  }
  if (
    !fixture.runtimeTrafficEnabledFromOro6b ||
    fixture.runtimeTrafficModeFromOro6b !== RUNTIME_TRAFFIC_MODE
  ) {
    blockers.push("runtime traffic must remain fail_closed_no_mutation");
  }
  if (
    !fixture.liveTrafficEnablementBoundaryEntered ||
    !fixture.liveTrafficEnablementBoundaryChecked ||
    !fixture.liveTrafficAllowed ||
    !fixture.liveTrafficEnabled ||
    fixture.liveTrafficMode !== LIVE_TRAFFIC_MODE
  ) {
    blockers.push("live traffic enablement must be fail_closed_no_mutation only");
  }
  if (!fixture.nextPhaseRequiresLiveTrafficPostEnablementValidation) {
    blockers.push("next phase must require live traffic post-enablement validation");
  }
  if (!fixture.responseSanitized) {
    blockers.push("live traffic enablement response must remain sanitized");
  }
  if (fixture.srcAppChangedInOro6c || fixture.runtimeRouteControllerChangedInOro6c) {
    blockers.push("ORO-6C must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during live traffic enablement");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during live traffic enablement");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during live traffic enablement");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during live traffic enablement");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during live traffic enablement");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during live traffic enablement");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during live traffic enablement");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficEnablementBoundaryResult: result,
    dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary:
      fixture.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary,
    dependsOnOro6bLiveTrafficEnablementReadinessBoundary:
      fixture.dependsOnOro6bLiveTrafficEnablementReadinessBoundary,
    oro6aLiveTrafficAuthorizationDecisionIssued:
      pass && fixture.oro6aLiveTrafficAuthorizationDecisionIssued,
    oro6aLiveTrafficAuthorizationDecisionResult: pass
      ? fixture.oro6aLiveTrafficAuthorizationDecisionResult
      : HOLD,
    oro6bLiveTrafficEnablementReadinessChecked:
      pass && fixture.oro6bLiveTrafficEnablementReadinessChecked,
    oro6bLiveTrafficEnablementReadinessStatus: pass
      ? fixture.oro6bLiveTrafficEnablementReadinessStatus
      : HOLD,
    runtimeTrafficEnabledFromOro6b:
      pass && fixture.runtimeTrafficEnabledFromOro6b,
    runtimeTrafficModeFromOro6b: pass
      ? fixture.runtimeTrafficModeFromOro6b
      : HOLD,
    liveTrafficEnablementBoundaryEntered:
      pass && fixture.liveTrafficEnablementBoundaryEntered,
    liveTrafficEnablementBoundaryChecked:
      pass && fixture.liveTrafficEnablementBoundaryChecked,
    liveTrafficAllowed: pass && fixture.liveTrafficAllowed,
    liveTrafficEnabled: pass && fixture.liveTrafficEnabled,
    liveTrafficMode: pass ? fixture.liveTrafficMode : HOLD,
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
    nextPhaseRequiresLiveTrafficPostEnablementValidation:
      pass && fixture.nextPhaseRequiresLiveTrafficPostEnablementValidation,
    blockers,
  };
}

function buildOro6cLiveTrafficEnablementSummary(
  input = buildOro6cLiveTrafficEnablementInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
  return {
    valid: summary.liveTrafficEnablementBoundaryResult === PASS,
    liveTrafficEnablementBoundaryResult:
      summary.liveTrafficEnablementBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro6aLiveTrafficAuthorizationDecisionRecord(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary &&
    summary.oro6aLiveTrafficAuthorizationDecisionIssued &&
    summary.oro6aLiveTrafficAuthorizationDecisionResult ===
      LIVE_TRAFFIC_DECISION_RESULT;
  return { ...base, valid };
}

function validateOro6bLiveTrafficEnablementReadinessRecord(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro6bLiveTrafficEnablementReadinessBoundary &&
    summary.oro6bLiveTrafficEnablementReadinessChecked &&
    summary.oro6bLiveTrafficEnablementReadinessStatus ===
      LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS &&
    summary.runtimeTrafficEnabledFromOro6b &&
    summary.runtimeTrafficModeFromOro6b === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function buildLiveTrafficEnablementRecord(input) {
  const fixture = normalizeInput(input);
  return {
    liveTrafficEnablementBoundaryEntered:
      fixture.liveTrafficEnablementBoundaryEntered,
    liveTrafficEnablementBoundaryChecked:
      fixture.liveTrafficEnablementBoundaryChecked,
    liveTrafficAllowed: fixture.liveTrafficAllowed,
    liveTrafficEnabled: fixture.liveTrafficEnabled,
    liveTrafficMode: fixture.liveTrafficMode,
    responseSanitized: fixture.responseSanitized,
    nextPhaseRequiresLiveTrafficPostEnablementValidation:
      fixture.nextPhaseRequiresLiveTrafficPostEnablementValidation,
  };
}

function validateLiveTrafficEnablementBoundary(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficEnablementBoundaryEntered &&
    summary.liveTrafficEnablementBoundaryChecked &&
    summary.liveTrafficAllowed &&
    summary.liveTrafficEnabled &&
    summary.liveTrafficMode === LIVE_TRAFFIC_MODE &&
    summary.nextPhaseRequiresLiveTrafficPostEnablementValidation;
  return { ...base, valid };
}

function validateFailClosedNoMutationLiveTrafficEnablement(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficAllowed &&
    summary.liveTrafficEnabled &&
    summary.liveTrafficMode === LIVE_TRAFFIC_MODE &&
    summary.runtimeTrafficModeFromOro6b === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function validateNoMutationDuringLiveTrafficEnablement(input) {
  const summary = buildOro6cLiveTrafficEnablementSummary(input);
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
  LIVE_TRAFFIC_MODE,
  LIVE_TRAFFIC_DECISION_RESULT,
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  RUNTIME_TRAFFIC_MODE,
  ORO6C_LIVE_TRAFFIC_ENABLEMENT_STATUS,
  buildOro6cLiveTrafficEnablementInput,
  validateOro6aLiveTrafficAuthorizationDecisionRecord,
  validateOro6bLiveTrafficEnablementReadinessRecord,
  buildLiveTrafficEnablementRecord,
  validateLiveTrafficEnablementBoundary,
  validateFailClosedNoMutationLiveTrafficEnablement,
  validateNoMutationDuringLiveTrafficEnablement,
  buildOro6cLiveTrafficEnablementSummary,
};
