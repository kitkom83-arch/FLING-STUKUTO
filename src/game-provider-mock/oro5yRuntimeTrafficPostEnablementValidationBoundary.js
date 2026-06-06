"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5X_PASS,
  buildOro5xRuntimeTrafficEnablementBoundary,
} = require("./oro5xRuntimeTrafficEnablementBoundary");

const PHASE = "ORO-5Y";
const PASS = "PASS";
const HOLD = "HOLD";
const VALIDATION_PASSED = "validation_passed";
const RUNTIME_TRAFFIC_MODE = FAIL_CLOSED_NO_MUTATION;

const ORO5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  VALIDATION_PASSED,
  RUNTIME_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
});

const BASELINE_ORO5X_SUMMARY = buildOro5xRuntimeTrafficEnablementBoundary();

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

function buildOro5yRuntimeTrafficPostEnablementValidationInput(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeTrafficPostEnablementValidationFixture",
    phase: PHASE,
    oro5xEnablementEvidence: {
      dependsOnOro5xRuntimeTrafficEnablementBoundary: true,
      runtimeTrafficEnabledFromOro5x:
        BASELINE_ORO5X_SUMMARY.runtimeTrafficEnablementBoundaryResult ===
          ORO5X_PASS &&
        BASELINE_ORO5X_SUMMARY.runtimeTrafficEnabled === true,
      runtimeTrafficAllowedFromOro5x:
        BASELINE_ORO5X_SUMMARY.runtimeTrafficAllowed === true,
      runtimeTrafficImplementedFromOro5x:
        BASELINE_ORO5X_SUMMARY.runtimeTrafficImplemented === true,
      runtimeTrafficPatchImplementedFromOro5x:
        BASELINE_ORO5X_SUMMARY.runtimeTrafficPatchImplemented === true,
      runtimeTrafficModeFromOro5x: BASELINE_ORO5X_SUMMARY.runtimeTrafficMode,
    },
    validationEvidence: {
      runtimeTrafficPostEnablementValidationEntered: true,
      runtimeTrafficPostEnablementValidationChecked: true,
      runtimeTrafficPostEnablementValidationStatus: VALIDATION_PASSED,
    },
    publicAliasEvidence: {
      apiBalancePublicAliasMounted: true,
      apiTransactionPublicAliasMounted: true,
      apiBalancePublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiTransactionPublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiBalanceRuntimeTrafficEnabled: true,
      apiTransactionRuntimeTrafficEnabled: true,
      apiBalanceRuntimeTrafficMode: FAIL_CLOSED_NO_MUTATION,
      apiTransactionRuntimeTrafficMode: FAIL_CLOSED_NO_MUTATION,
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
    liveTrafficEvidence: {
      liveTrafficAuthorizationRequestSubmitted: false,
      liveTrafficAuthorizationDecisionIssued: false,
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
      srcAppChangedInOro5y: false,
      runtimeRouteControllerChangedInOro5y: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5yRuntimeTrafficPostEnablementValidationInput();
  const merged = deepMerge(baseline, source);
  const oro5x = isPlainObject(merged.oro5xEnablementEvidence)
    ? merged.oro5xEnablementEvidence
    : {};
  const validation = isPlainObject(merged.validationEvidence)
    ? merged.validationEvidence
    : {};
  const alias = isPlainObject(merged.publicAliasEvidence)
    ? merged.publicAliasEvidence
    : {};
  const request = isPlainObject(merged.requestBehaviorEvidence)
    ? merged.requestBehaviorEvidence
    : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5xRuntimeTrafficEnablementBoundary: readBoolean(
      oro5x,
      "dependsOnOro5xRuntimeTrafficEnablementBoundary",
      true
    ),
    runtimeTrafficEnabledFromOro5x: readBoolean(
      oro5x,
      "runtimeTrafficEnabledFromOro5x",
      true
    ),
    runtimeTrafficAllowedFromOro5x: readBoolean(
      oro5x,
      "runtimeTrafficAllowedFromOro5x",
      true
    ),
    runtimeTrafficImplementedFromOro5x: readBoolean(
      oro5x,
      "runtimeTrafficImplementedFromOro5x",
      true
    ),
    runtimeTrafficPatchImplementedFromOro5x: readBoolean(
      oro5x,
      "runtimeTrafficPatchImplementedFromOro5x",
      true
    ),
    runtimeTrafficModeFromOro5x: readString(
      oro5x,
      "runtimeTrafficModeFromOro5x",
      RUNTIME_TRAFFIC_MODE
    ),
    runtimeTrafficPostEnablementValidationEntered: readBoolean(
      validation,
      "runtimeTrafficPostEnablementValidationEntered",
      true
    ),
    runtimeTrafficPostEnablementValidationChecked: readBoolean(
      validation,
      "runtimeTrafficPostEnablementValidationChecked",
      true
    ),
    runtimeTrafficPostEnablementValidationStatus: readString(
      validation,
      "runtimeTrafficPostEnablementValidationStatus",
      VALIDATION_PASSED
    ),
    apiBalancePublicAliasMounted: readBoolean(
      alias,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      alias,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasMode: readString(
      alias,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      alias,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalanceRuntimeTrafficEnabled: readBoolean(
      alias,
      "apiBalanceRuntimeTrafficEnabled",
      true
    ),
    apiTransactionRuntimeTrafficEnabled: readBoolean(
      alias,
      "apiTransactionRuntimeTrafficEnabled",
      true
    ),
    apiBalanceRuntimeTrafficMode: readString(
      alias,
      "apiBalanceRuntimeTrafficMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionRuntimeTrafficMode: readString(
      alias,
      "apiTransactionRuntimeTrafficMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalancePostEnablementValidationPassed: readBoolean(
      alias,
      "apiBalancePostEnablementValidationPassed",
      true
    ),
    apiTransactionPostEnablementValidationPassed: readBoolean(
      alias,
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
    liveTrafficAuthorizationRequestSubmitted: readBoolean(
      live,
      "liveTrafficAuthorizationRequestSubmitted",
      false
    ),
    liveTrafficAuthorizationDecisionIssued: readBoolean(
      live,
      "liveTrafficAuthorizationDecisionIssued",
      false
    ),
    liveTrafficAllowed: readBoolean(live, "liveTrafficAllowed", false),
    liveTrafficEnabled: readBoolean(live, "liveTrafficEnabled", false),
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
    srcAppChangedInOro5y: readBoolean(files, "srcAppChangedInOro5y", false),
    runtimeRouteControllerChangedInOro5y: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5y",
      false
    ),
    nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest: readBoolean(
      next,
      "nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro5xRuntimeTrafficEnablementBoundary ||
    !fixture.runtimeTrafficEnabledFromOro5x ||
    !fixture.runtimeTrafficAllowedFromOro5x ||
    !fixture.runtimeTrafficImplementedFromOro5x ||
    !fixture.runtimeTrafficPatchImplementedFromOro5x ||
    fixture.runtimeTrafficModeFromOro5x !== RUNTIME_TRAFFIC_MODE
  ) {
    blockers.push("ORO-5X runtime traffic enablement record is required");
  }
  if (
    !fixture.runtimeTrafficPostEnablementValidationEntered ||
    !fixture.runtimeTrafficPostEnablementValidationChecked ||
    fixture.runtimeTrafficPostEnablementValidationStatus !== VALIDATION_PASSED
  ) {
    blockers.push("post-enablement validation gate must pass");
  }
  if (
    !fixture.apiBalancePublicAliasMounted ||
    fixture.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiBalanceRuntimeTrafficEnabled ||
    fixture.apiBalanceRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiBalancePostEnablementValidationPassed
  ) {
    blockers.push("api balance post-enablement validation must remain fail-closed");
  }
  if (
    !fixture.apiTransactionPublicAliasMounted ||
    fixture.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiTransactionRuntimeTrafficEnabled ||
    fixture.apiTransactionRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiTransactionPostEnablementValidationPassed
  ) {
    blockers.push("api transaction post-enablement validation must remain fail-closed");
  }
  if (
    !fixture.malformedPayloadStillFailClosed ||
    !fixture.unknownUserStillFailClosed ||
    !fixture.mockAuthMismatchStillFailClosed ||
    !fixture.duplicateTransactionStillNoDoubleMutation ||
    !fixture.unsupportedTransactionTypeStillFailClosedOrManualReview ||
    !fixture.responseStillSanitized
  ) {
    blockers.push("runtime request behavior must still fail closed and sanitize output");
  }
  if (
    fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain blocked after runtime enablement");
  }
  if (fixture.srcAppChangedInOro5y || fixture.runtimeRouteControllerChangedInOro5y) {
    blockers.push("ORO-5Y must not change runtime app, route, or controller files");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent after runtime enablement");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent after runtime enablement");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent after runtime enablement");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent after runtime enablement");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent after runtime enablement");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent after runtime enablement");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak after runtime enablement");
  }
  if (!fixture.nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest) {
    blockers.push("next phase must require separate live traffic authorization request");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    runtimeTrafficPostEnablementValidationBoundaryResult: result,
    dependsOnOro5xRuntimeTrafficEnablementBoundary:
      fixture.dependsOnOro5xRuntimeTrafficEnablementBoundary,
    runtimeTrafficEnabledFromOro5x:
      pass && fixture.runtimeTrafficEnabledFromOro5x,
    runtimeTrafficAllowedFromOro5x:
      pass && fixture.runtimeTrafficAllowedFromOro5x,
    runtimeTrafficImplementedFromOro5x:
      pass && fixture.runtimeTrafficImplementedFromOro5x,
    runtimeTrafficPatchImplementedFromOro5x:
      pass && fixture.runtimeTrafficPatchImplementedFromOro5x,
    runtimeTrafficModeFromOro5x: pass
      ? fixture.runtimeTrafficModeFromOro5x
      : HOLD,
    runtimeTrafficPostEnablementValidationEntered:
      pass && fixture.runtimeTrafficPostEnablementValidationEntered,
    runtimeTrafficPostEnablementValidationChecked:
      pass && fixture.runtimeTrafficPostEnablementValidationChecked,
    runtimeTrafficPostEnablementValidationStatus: pass
      ? fixture.runtimeTrafficPostEnablementValidationStatus
      : HOLD,
    apiBalancePublicAliasMounted: pass && fixture.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted:
      pass && fixture.apiTransactionPublicAliasMounted,
    apiBalancePublicAliasMode: pass ? fixture.apiBalancePublicAliasMode : HOLD,
    apiTransactionPublicAliasMode: pass
      ? fixture.apiTransactionPublicAliasMode
      : HOLD,
    apiBalanceRuntimeTrafficEnabled:
      pass && fixture.apiBalanceRuntimeTrafficEnabled,
    apiTransactionRuntimeTrafficEnabled:
      pass && fixture.apiTransactionRuntimeTrafficEnabled,
    apiBalanceRuntimeTrafficMode: pass ? fixture.apiBalanceRuntimeTrafficMode : HOLD,
    apiTransactionRuntimeTrafficMode: pass
      ? fixture.apiTransactionRuntimeTrafficMode
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
    liveTrafficAuthorizationRequestSubmitted: false,
    liveTrafficAuthorizationDecisionIssued: false,
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
    nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest:
      fixture.nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest,
    blockers,
  };
}

function buildOro5yRuntimeTrafficPostEnablementValidationSummary(
  input = buildOro5yRuntimeTrafficPostEnablementValidationInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  return {
    valid: summary.runtimeTrafficPostEnablementValidationBoundaryResult === PASS,
    runtimeTrafficPostEnablementValidationBoundaryResult:
      summary.runtimeTrafficPostEnablementValidationBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro5xRuntimeTrafficEnablementRecord(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro5xRuntimeTrafficEnablementBoundary &&
    summary.runtimeTrafficEnabledFromOro5x &&
    summary.runtimeTrafficAllowedFromOro5x &&
    summary.runtimeTrafficImplementedFromOro5x &&
    summary.runtimeTrafficPatchImplementedFromOro5x &&
    summary.runtimeTrafficModeFromOro5x === RUNTIME_TRAFFIC_MODE;
  return { ...base, valid };
}

function validateFailClosedNoMutationRuntimeTrafficPostEnablement(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.runtimeTrafficPostEnablementValidationStatus === VALIDATION_PASSED &&
    summary.malformedPayloadStillFailClosed &&
    summary.unknownUserStillFailClosed &&
    summary.mockAuthMismatchStillFailClosed &&
    summary.duplicateTransactionStillNoDoubleMutation &&
    summary.unsupportedTransactionTypeStillFailClosedOrManualReview &&
    summary.responseStillSanitized;
  return { ...base, valid };
}

function validateApiBalanceRuntimeTrafficPostEnablement(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.apiBalancePublicAliasMounted &&
    summary.apiBalancePublicAliasMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiBalanceRuntimeTrafficEnabled &&
    summary.apiBalanceRuntimeTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiBalancePostEnablementValidationPassed;
  return { ...base, valid };
}

function validateApiTransactionRuntimeTrafficPostEnablement(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.apiTransactionPublicAliasMounted &&
    summary.apiTransactionPublicAliasMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiTransactionRuntimeTrafficEnabled &&
    summary.apiTransactionRuntimeTrafficMode === FAIL_CLOSED_NO_MUTATION &&
    summary.apiTransactionPostEnablementValidationPassed;
  return { ...base, valid };
}

function validateNoLiveTrafficAfterRuntimeEnablement(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    !summary.liveTrafficAuthorizationRequestSubmitted &&
    !summary.liveTrafficAuthorizationDecisionIssued &&
    !summary.liveTrafficAllowed &&
    !summary.liveTrafficEnabled;
  return { ...base, valid };
}

function validateNoMutationAfterRuntimeEnablement(input) {
  const summary = buildOro5yRuntimeTrafficPostEnablementValidationSummary(input);
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
  VALIDATION_PASSED,
  RUNTIME_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
  buildOro5yRuntimeTrafficPostEnablementValidationInput,
  buildOro5yRuntimeTrafficPostEnablementValidationSummary,
  validateOro5xRuntimeTrafficEnablementRecord,
  validateFailClosedNoMutationRuntimeTrafficPostEnablement,
  validateApiBalanceRuntimeTrafficPostEnablement,
  validateApiTransactionRuntimeTrafficPostEnablement,
  validateNoLiveTrafficAfterRuntimeEnablement,
  validateNoMutationAfterRuntimeEnablement,
};
