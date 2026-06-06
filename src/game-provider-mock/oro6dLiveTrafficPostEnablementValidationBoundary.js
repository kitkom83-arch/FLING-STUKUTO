"use strict";

const {
  LIVE_TRAFFIC_MODE,
  PASS: ORO6C_PASS,
  buildOro6cLiveTrafficEnablementSummary,
} = require("./oro6cLiveTrafficEnablementBoundary");

const PHASE = "ORO-6D";
const PASS = "PASS";
const HOLD = "HOLD";
const VALIDATION_PASSED = "validation_passed";
const FAIL_CLOSED_NO_MUTATION = LIVE_TRAFFIC_MODE;

const ORO6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  VALIDATION_PASSED,
  LIVE_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
});

const BASELINE_ORO6C_SUMMARY = buildOro6cLiveTrafficEnablementSummary();

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

function buildOro6dLiveTrafficPostEnablementValidationInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficPostEnablementValidationFixture",
    phase: PHASE,
    oro6cEnablementEvidence: {
      dependsOnOro6cLiveTrafficEnablementBoundary: true,
      liveTrafficAllowedFromOro6c:
        BASELINE_ORO6C_SUMMARY.liveTrafficEnablementBoundaryResult ===
          ORO6C_PASS &&
        BASELINE_ORO6C_SUMMARY.liveTrafficAllowed === true,
      liveTrafficEnabledFromOro6c:
        BASELINE_ORO6C_SUMMARY.liveTrafficEnablementBoundaryResult ===
          ORO6C_PASS &&
        BASELINE_ORO6C_SUMMARY.liveTrafficEnabled === true,
      liveTrafficModeFromOro6c: BASELINE_ORO6C_SUMMARY.liveTrafficMode,
    },
    validationEvidence: {
      liveTrafficPostEnablementValidationEntered: true,
      liveTrafficPostEnablementValidationChecked: true,
      liveTrafficPostEnablementValidationStatus: VALIDATION_PASSED,
    },
    apiLiveTrafficEvidence: {
      apiBalanceLiveTrafficEnabled: true,
      apiTransactionLiveTrafficEnabled: true,
      apiBalanceLiveTrafficMode: FAIL_CLOSED_NO_MUTATION,
      apiTransactionLiveTrafficMode: FAIL_CLOSED_NO_MUTATION,
      apiBalancePostEnablementValidationPassed: true,
      apiTransactionPostEnablementValidationPassed: true,
    },
    requestBehaviorEvidence: {
      malformedPayloadStillFailClosed: true,
      unknownUserStillFailClosed: true,
      mockAuthMismatchStillFailClosed: true,
      duplicateTransactionStillNoDoubleMutation: true,
      unsupportedTransactionTypeStillFailClosedOrManualReview: true,
      responseStillSanitized: true,
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
      srcAppChangedInOro6d: false,
      runtimeRouteControllerChangedInOro6d: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro6dLiveTrafficPostEnablementValidationInput();
  const merged = deepMerge(baseline, source);
  const oro6c = isPlainObject(merged.oro6cEnablementEvidence)
    ? merged.oro6cEnablementEvidence
    : {};
  const validation = isPlainObject(merged.validationEvidence)
    ? merged.validationEvidence
    : {};
  const api = isPlainObject(merged.apiLiveTrafficEvidence)
    ? merged.apiLiveTrafficEvidence
    : {};
  const request = isPlainObject(merged.requestBehaviorEvidence)
    ? merged.requestBehaviorEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6cLiveTrafficEnablementBoundary: readBoolean(
      oro6c,
      "dependsOnOro6cLiveTrafficEnablementBoundary",
      true
    ),
    liveTrafficAllowedFromOro6c: readBoolean(
      oro6c,
      "liveTrafficAllowedFromOro6c",
      true
    ),
    liveTrafficEnabledFromOro6c: readBoolean(
      oro6c,
      "liveTrafficEnabledFromOro6c",
      true
    ),
    liveTrafficModeFromOro6c: readString(
      oro6c,
      "liveTrafficModeFromOro6c",
      FAIL_CLOSED_NO_MUTATION
    ),
    liveTrafficPostEnablementValidationEntered: readBoolean(
      validation,
      "liveTrafficPostEnablementValidationEntered",
      true
    ),
    liveTrafficPostEnablementValidationChecked: readBoolean(
      validation,
      "liveTrafficPostEnablementValidationChecked",
      true
    ),
    liveTrafficPostEnablementValidationStatus: readString(
      validation,
      "liveTrafficPostEnablementValidationStatus",
      VALIDATION_PASSED
    ),
    apiBalanceLiveTrafficEnabled: readBoolean(
      api,
      "apiBalanceLiveTrafficEnabled",
      true
    ),
    apiTransactionLiveTrafficEnabled: readBoolean(
      api,
      "apiTransactionLiveTrafficEnabled",
      true
    ),
    apiBalanceLiveTrafficMode: readString(
      api,
      "apiBalanceLiveTrafficMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionLiveTrafficMode: readString(
      api,
      "apiTransactionLiveTrafficMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalancePostEnablementValidationPassed: readBoolean(
      api,
      "apiBalancePostEnablementValidationPassed",
      true
    ),
    apiTransactionPostEnablementValidationPassed: readBoolean(
      api,
      "apiTransactionPostEnablementValidationPassed",
      true
    ),
    malformedPayloadStillFailClosed: readBoolean(
      request,
      "malformedPayloadStillFailClosed",
      true
    ),
    unknownUserStillFailClosed: readBoolean(
      request,
      "unknownUserStillFailClosed",
      true
    ),
    mockAuthMismatchStillFailClosed: readBoolean(
      request,
      "mockAuthMismatchStillFailClosed",
      true
    ),
    duplicateTransactionStillNoDoubleMutation: readBoolean(
      request,
      "duplicateTransactionStillNoDoubleMutation",
      true
    ),
    unsupportedTransactionTypeStillFailClosedOrManualReview: readBoolean(
      request,
      "unsupportedTransactionTypeStillFailClosedOrManualReview",
      true
    ),
    responseStillSanitized: readBoolean(request, "responseStillSanitized", true),
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
    srcAppChangedInOro6d: readBoolean(files, "srcAppChangedInOro6d", false),
    runtimeRouteControllerChangedInOro6d: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro6d",
      false
    ),
    nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest: readBoolean(
      next,
      "nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6cLiveTrafficEnablementBoundary ||
    !fixture.liveTrafficAllowedFromOro6c ||
    !fixture.liveTrafficEnabledFromOro6c ||
    fixture.liveTrafficModeFromOro6c !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("ORO-6C live traffic enablement record is required");
  }
  if (
    !fixture.liveTrafficPostEnablementValidationEntered ||
    !fixture.liveTrafficPostEnablementValidationChecked ||
    fixture.liveTrafficPostEnablementValidationStatus !== VALIDATION_PASSED
  ) {
    blockers.push("live traffic post-enablement validation gate must pass");
  }
  if (
    !fixture.apiBalanceLiveTrafficEnabled ||
    fixture.apiBalanceLiveTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiBalancePostEnablementValidationPassed
  ) {
    blockers.push("api balance live traffic validation must remain fail_closed_no_mutation");
  }
  if (
    !fixture.apiTransactionLiveTrafficEnabled ||
    fixture.apiTransactionLiveTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiTransactionPostEnablementValidationPassed
  ) {
    blockers.push("api transaction live traffic validation must remain fail_closed_no_mutation");
  }
  if (
    !fixture.malformedPayloadStillFailClosed ||
    !fixture.unknownUserStillFailClosed ||
    !fixture.mockAuthMismatchStillFailClosed ||
    !fixture.duplicateTransactionStillNoDoubleMutation ||
    !fixture.unsupportedTransactionTypeStillFailClosedOrManualReview ||
    !fixture.responseStillSanitized
  ) {
    blockers.push("live traffic request behavior must still fail closed and sanitize output");
  }
  if (fixture.srcAppChangedInOro6d || fixture.runtimeRouteControllerChangedInOro6d) {
    blockers.push("ORO-6D must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent after live traffic enablement");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent after live traffic enablement");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent after live traffic enablement");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent after live traffic enablement");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent after live traffic enablement");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent after live traffic enablement");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak after live traffic enablement");
  }
  if (!fixture.nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest) {
    blockers.push("next phase must require external/live OroPlay call authorization request");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficPostEnablementValidationBoundaryResult: result,
    dependsOnOro6cLiveTrafficEnablementBoundary:
      fixture.dependsOnOro6cLiveTrafficEnablementBoundary,
    liveTrafficAllowedFromOro6c:
      pass && fixture.liveTrafficAllowedFromOro6c,
    liveTrafficEnabledFromOro6c:
      pass && fixture.liveTrafficEnabledFromOro6c,
    liveTrafficModeFromOro6c: pass ? fixture.liveTrafficModeFromOro6c : HOLD,
    liveTrafficPostEnablementValidationEntered:
      pass && fixture.liveTrafficPostEnablementValidationEntered,
    liveTrafficPostEnablementValidationChecked:
      pass && fixture.liveTrafficPostEnablementValidationChecked,
    liveTrafficPostEnablementValidationStatus: pass
      ? fixture.liveTrafficPostEnablementValidationStatus
      : HOLD,
    apiBalanceLiveTrafficEnabled:
      pass && fixture.apiBalanceLiveTrafficEnabled,
    apiTransactionLiveTrafficEnabled:
      pass && fixture.apiTransactionLiveTrafficEnabled,
    apiBalanceLiveTrafficMode: pass ? fixture.apiBalanceLiveTrafficMode : HOLD,
    apiTransactionLiveTrafficMode: pass
      ? fixture.apiTransactionLiveTrafficMode
      : HOLD,
    apiBalancePostEnablementValidationPassed:
      pass && fixture.apiBalancePostEnablementValidationPassed,
    apiTransactionPostEnablementValidationPassed:
      pass && fixture.apiTransactionPostEnablementValidationPassed,
    malformedPayloadStillFailClosed:
      pass && fixture.malformedPayloadStillFailClosed,
    unknownUserStillFailClosed: pass && fixture.unknownUserStillFailClosed,
    mockAuthMismatchStillFailClosed:
      pass && fixture.mockAuthMismatchStillFailClosed,
    duplicateTransactionStillNoDoubleMutation:
      pass && fixture.duplicateTransactionStillNoDoubleMutation,
    unsupportedTransactionTypeStillFailClosedOrManualReview:
      pass && fixture.unsupportedTransactionTypeStillFailClosedOrManualReview,
    responseStillSanitized: pass && fixture.responseStillSanitized,
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
    nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest:
      pass && fixture.nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest,
    blockers,
  };
}

function buildOro6dLiveTrafficPostEnablementValidationSummary(
  input = buildOro6dLiveTrafficPostEnablementValidationInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  return {
    valid:
      summary.liveTrafficPostEnablementValidationBoundaryResult === PASS,
    liveTrafficPostEnablementValidationBoundaryResult:
      summary.liveTrafficPostEnablementValidationBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro6cLiveTrafficEnablementRecord(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro6cLiveTrafficEnablementBoundary &&
    summary.liveTrafficAllowedFromOro6c &&
    summary.liveTrafficEnabledFromOro6c &&
    summary.liveTrafficModeFromOro6c === FAIL_CLOSED_NO_MUTATION;
  return { ...base, valid };
}

function validateFailClosedNoMutationLiveTrafficPostEnablement(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.liveTrafficPostEnablementValidationStatus === VALIDATION_PASSED &&
    summary.liveTrafficModeFromOro6c === FAIL_CLOSED_NO_MUTATION &&
    summary.apiBalanceLiveTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiTransactionLiveTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.malformedPayloadStillFailClosed &&
    summary.unknownUserStillFailClosed &&
    summary.mockAuthMismatchStillFailClosed &&
    summary.duplicateTransactionStillNoDoubleMutation &&
    summary.unsupportedTransactionTypeStillFailClosedOrManualReview &&
    summary.responseStillSanitized;
  return { ...base, valid };
}

function validateApiBalanceLiveTrafficPostEnablement(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.apiBalanceLiveTrafficEnabled &&
    summary.apiBalanceLiveTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiBalancePostEnablementValidationPassed;
  return { ...base, valid };
}

function validateApiTransactionLiveTrafficPostEnablement(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.apiTransactionLiveTrafficEnabled &&
    summary.apiTransactionLiveTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiTransactionPostEnablementValidationPassed;
  return { ...base, valid };
}

function validateNoMutationAfterLiveTrafficEnablement(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
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
    "secretsLeaked",
  ].filter((key) => summary[key] !== false);
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

function validateNoExternalOrLiveOroPlayAfterLiveTrafficEnablement(input) {
  const summary = buildOro6dLiveTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const unsafe = [
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
  ].filter((key) => summary[key] !== false);
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  VALIDATION_PASSED,
  LIVE_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
  ORO6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
  buildOro6dLiveTrafficPostEnablementValidationInput,
  validateOro6cLiveTrafficEnablementRecord,
  validateFailClosedNoMutationLiveTrafficPostEnablement,
  validateApiBalanceLiveTrafficPostEnablement,
  validateApiTransactionLiveTrafficPostEnablement,
  validateNoMutationAfterLiveTrafficEnablement,
  validateNoExternalOrLiveOroPlayAfterLiveTrafficEnablement,
  buildOro6dLiveTrafficPostEnablementValidationSummary,
};
