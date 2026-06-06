"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE: GRANT_SCOPE_FROM_ORO5W,
  PASS: ORO5W_PASS,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundary,
} = require("./oro5wRuntimeTrafficAuthorizationDecisionBoundary");

const PHASE = "ORO-5X";
const PASS = "PASS";
const HOLD = "HOLD";
const RUNTIME_TRAFFIC_MODE = FAIL_CLOSED_NO_MUTATION;

const ORO5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  GRANT_SCOPE_FROM_ORO5W,
  RUNTIME_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
});

const BASELINE_ORO5W_SUMMARY =
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundary();

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

function buildOro5xRuntimeTrafficEnablementBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathRuntimeTrafficEnablementFailClosedFixture",
    phase: PHASE,
    oro5wDecisionEvidence: {
      dependsOnOro5wRuntimeTrafficAuthorizationDecision: true,
      runtimeTrafficAuthorizationGrantedFromOro5w:
        BASELINE_ORO5W_SUMMARY.runtimeTrafficAuthorizationDecisionBoundaryResult ===
          ORO5W_PASS &&
        BASELINE_ORO5W_SUMMARY.runtimeTrafficAuthorizationGranted === true,
      runtimeTrafficAuthorizationGrantScopeFromOro5w:
        BASELINE_ORO5W_SUMMARY.runtimeTrafficAuthorizationGrantScope,
      runtimeTrafficEnablementAuthorizedFromOro5w:
        BASELINE_ORO5W_SUMMARY.runtimeTrafficEnablementAuthorized === true,
      runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w:
        BASELINE_ORO5W_SUMMARY.runtimeTrafficEnablementBoundaryEntryAllowed === true,
    },
    enablementEvidence: {
      runtimeTrafficEnablementBoundaryEntered: true,
      runtimeTrafficEnablementBoundaryChecked: true,
      runtimeTrafficImplemented: true,
      runtimeTrafficPatchImplemented: true,
      runtimeTrafficAllowed: true,
      runtimeTrafficEnabled: true,
      runtimeTrafficMode: RUNTIME_TRAFFIC_MODE,
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
    },
    requestBehaviorEvidence: {
      malformedPayloadFailClosed: true,
      unknownUserFailClosed: true,
      mockAuthMismatchFailClosed: true,
      duplicateTransactionNoDoubleMutation: true,
      unsupportedTransactionTypeFailClosedOrManualReview: true,
      responseSanitized: true,
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
      srcAppChangedInOro5x: false,
      runtimeRouteControllerChangedInOro5x: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresRuntimeTrafficPostEnablementValidation: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5xRuntimeTrafficEnablementBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5w = isPlainObject(merged.oro5wDecisionEvidence)
    ? merged.oro5wDecisionEvidence
    : {};
  const enablement = isPlainObject(merged.enablementEvidence)
    ? merged.enablementEvidence
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
    dependsOnOro5wRuntimeTrafficAuthorizationDecision: readBoolean(
      oro5w,
      "dependsOnOro5wRuntimeTrafficAuthorizationDecision",
      true
    ),
    runtimeTrafficAuthorizationGrantedFromOro5w: readBoolean(
      oro5w,
      "runtimeTrafficAuthorizationGrantedFromOro5w",
      true
    ),
    runtimeTrafficAuthorizationGrantScopeFromOro5w: readString(
      oro5w,
      "runtimeTrafficAuthorizationGrantScopeFromOro5w",
      GRANT_SCOPE_FROM_ORO5W
    ),
    runtimeTrafficEnablementAuthorizedFromOro5w: readBoolean(
      oro5w,
      "runtimeTrafficEnablementAuthorizedFromOro5w",
      true
    ),
    runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w: readBoolean(
      oro5w,
      "runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w",
      true
    ),
    runtimeTrafficEnablementBoundaryEntered: readBoolean(
      enablement,
      "runtimeTrafficEnablementBoundaryEntered",
      true
    ),
    runtimeTrafficEnablementBoundaryChecked: readBoolean(
      enablement,
      "runtimeTrafficEnablementBoundaryChecked",
      true
    ),
    runtimeTrafficImplemented: readBoolean(
      enablement,
      "runtimeTrafficImplemented",
      true
    ),
    runtimeTrafficPatchImplemented: readBoolean(
      enablement,
      "runtimeTrafficPatchImplemented",
      true
    ),
    runtimeTrafficAllowed: readBoolean(enablement, "runtimeTrafficAllowed", true),
    runtimeTrafficEnabled: readBoolean(enablement, "runtimeTrafficEnabled", true),
    runtimeTrafficMode: readString(
      enablement,
      "runtimeTrafficMode",
      RUNTIME_TRAFFIC_MODE
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
    malformedPayloadFailClosed: readBoolean(
      request,
      "malformedPayloadFailClosed",
      true
    ),
    unknownUserFailClosed: readBoolean(request, "unknownUserFailClosed", true),
    mockAuthMismatchFailClosed: readBoolean(
      request,
      "mockAuthMismatchFailClosed",
      true
    ),
    duplicateTransactionNoDoubleMutation: readBoolean(
      request,
      "duplicateTransactionNoDoubleMutation",
      true
    ),
    unsupportedTransactionTypeFailClosedOrManualReview: readBoolean(
      request,
      "unsupportedTransactionTypeFailClosedOrManualReview",
      true
    ),
    responseSanitized: readBoolean(request, "responseSanitized", true),
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
    srcAppChangedInOro5x: readBoolean(files, "srcAppChangedInOro5x", false),
    runtimeRouteControllerChangedInOro5x: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5x",
      false
    ),
    nextPhaseRequiresRuntimeTrafficPostEnablementValidation: readBoolean(
      next,
      "nextPhaseRequiresRuntimeTrafficPostEnablementValidation",
      true
    ),
    nextPhaseRequiresSeparateLiveTrafficApproval: readBoolean(
      next,
      "nextPhaseRequiresSeparateLiveTrafficApproval",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro5wRuntimeTrafficAuthorizationDecision ||
    !fixture.runtimeTrafficAuthorizationGrantedFromOro5w ||
    fixture.runtimeTrafficAuthorizationGrantScopeFromOro5w !==
      GRANT_SCOPE_FROM_ORO5W ||
    !fixture.runtimeTrafficEnablementAuthorizedFromOro5w ||
    !fixture.runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w
  ) {
    blockers.push("ORO-5W runtime traffic enablement grant is required");
  }
  if (
    !fixture.runtimeTrafficEnablementBoundaryEntered ||
    !fixture.runtimeTrafficEnablementBoundaryChecked ||
    !fixture.runtimeTrafficImplemented ||
    !fixture.runtimeTrafficPatchImplemented ||
    !fixture.runtimeTrafficAllowed ||
    !fixture.runtimeTrafficEnabled
  ) {
    blockers.push("runtime traffic enablement boundary must be entered and enabled");
  }
  if (fixture.runtimeTrafficMode !== RUNTIME_TRAFFIC_MODE) {
    blockers.push("runtime traffic mode must remain fail-closed no-mutation");
  }
  if (
    !fixture.apiBalancePublicAliasMounted ||
    !fixture.apiTransactionPublicAliasMounted ||
    fixture.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("public aliases must remain mounted in fail-closed no-mutation mode");
  }
  if (
    !fixture.apiBalanceRuntimeTrafficEnabled ||
    !fixture.apiTransactionRuntimeTrafficEnabled ||
    fixture.apiBalanceRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.apiTransactionRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("public alias runtime traffic must be fail-closed no-mutation only");
  }
  if (
    !fixture.malformedPayloadFailClosed ||
    !fixture.unknownUserFailClosed ||
    !fixture.mockAuthMismatchFailClosed ||
    !fixture.duplicateTransactionNoDoubleMutation ||
    !fixture.unsupportedTransactionTypeFailClosedOrManualReview ||
    !fixture.responseSanitized
  ) {
    blockers.push("runtime request behavior must remain fail-closed and sanitized");
  }
  if (
    fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain outside ORO-5X");
  }
  if (fixture.srcAppChangedInOro5x) {
    blockers.push("src/app.js must not change unless only fail-closed runtime markers are needed");
  }
  if (fixture.runtimeRouteControllerChangedInOro5x) {
    blockers.push("runtime route/controller files must not change in ORO-5X");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak");
  }
  if (
    !fixture.nextPhaseRequiresRuntimeTrafficPostEnablementValidation ||
    !fixture.nextPhaseRequiresSeparateLiveTrafficApproval
  ) {
    blockers.push("next phase controls must require validation and separate live approval");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    runtimeTrafficEnablementBoundaryResult: result,
    dependsOnOro5wRuntimeTrafficAuthorizationDecision:
      fixture.dependsOnOro5wRuntimeTrafficAuthorizationDecision,
    runtimeTrafficAuthorizationGrantedFromOro5w:
      pass && fixture.runtimeTrafficAuthorizationGrantedFromOro5w,
    runtimeTrafficAuthorizationGrantScopeFromOro5w: pass
      ? fixture.runtimeTrafficAuthorizationGrantScopeFromOro5w
      : HOLD,
    runtimeTrafficEnablementAuthorizedFromOro5w:
      pass && fixture.runtimeTrafficEnablementAuthorizedFromOro5w,
    runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w:
      pass && fixture.runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w,
    runtimeTrafficEnablementBoundaryEntered:
      pass && fixture.runtimeTrafficEnablementBoundaryEntered,
    runtimeTrafficEnablementBoundaryChecked:
      pass && fixture.runtimeTrafficEnablementBoundaryChecked,
    runtimeTrafficImplemented: pass && fixture.runtimeTrafficImplemented,
    runtimeTrafficPatchImplemented: pass && fixture.runtimeTrafficPatchImplemented,
    runtimeTrafficAllowed: pass && fixture.runtimeTrafficAllowed,
    runtimeTrafficEnabled: pass && fixture.runtimeTrafficEnabled,
    runtimeTrafficMode: pass ? fixture.runtimeTrafficMode : HOLD,
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
    malformedPayloadFailClosed: pass && fixture.malformedPayloadFailClosed,
    unknownUserFailClosed: pass && fixture.unknownUserFailClosed,
    mockAuthMismatchFailClosed: pass && fixture.mockAuthMismatchFailClosed,
    duplicateTransactionNoDoubleMutation:
      pass && fixture.duplicateTransactionNoDoubleMutation,
    unsupportedTransactionTypeFailClosedOrManualReview:
      pass && fixture.unsupportedTransactionTypeFailClosedOrManualReview,
    responseSanitized: pass && fixture.responseSanitized,
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
    nextPhaseRequiresRuntimeTrafficPostEnablementValidation:
      fixture.nextPhaseRequiresRuntimeTrafficPostEnablementValidation,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5xRuntimeTrafficEnablementBoundary(
  input = buildOro5xRuntimeTrafficEnablementBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5xRuntimeTrafficEnablementBoundary(
  input = buildOro5xRuntimeTrafficEnablementBoundaryInput()
) {
  const summary = buildOro5xRuntimeTrafficEnablementBoundary(input);
  return {
    valid: summary.runtimeTrafficEnablementBoundaryResult === PASS,
    runtimeTrafficEnablementBoundaryResult:
      summary.runtimeTrafficEnablementBoundaryResult,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    runtimeTrafficMode: summary.runtimeTrafficMode,
    apiBalanceRuntimeTrafficEnabled: summary.apiBalanceRuntimeTrafficEnabled,
    apiTransactionRuntimeTrafficEnabled:
      summary.apiTransactionRuntimeTrafficEnabled,
    liveTrafficEnabled: summary.liveTrafficEnabled,
    walletMutationPerformed: summary.walletMutationPerformed,
    ledgerMutationPerformed: summary.ledgerMutationPerformed,
    prismaWritePerformed: summary.prismaWritePerformed,
    dbTransactionPerformed: summary.dbTransactionPerformed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
    blockers: summary.blockers.slice(),
  };
}

function assertOro5xDecisionGrantFromOro5w(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
  if (
    summary.runtimeTrafficEnablementBoundaryResult !== PASS ||
    !summary.runtimeTrafficAuthorizationGrantedFromOro5w ||
    summary.runtimeTrafficAuthorizationGrantScopeFromOro5w !==
      GRANT_SCOPE_FROM_ORO5W ||
    !summary.runtimeTrafficEnablementAuthorizedFromOro5w ||
    !summary.runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w
  ) {
    throw new Error("ORO-5X requires ORO-5W enablement-boundary authorization.");
  }
  return true;
}

function assertOro5xRuntimeTrafficEnabledFailClosed(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
  if (
    !summary.runtimeTrafficImplemented ||
    !summary.runtimeTrafficPatchImplemented ||
    !summary.runtimeTrafficAllowed ||
    !summary.runtimeTrafficEnabled ||
    summary.runtimeTrafficMode !== RUNTIME_TRAFFIC_MODE
  ) {
    throw new Error("ORO-5X runtime traffic must be enabled only in fail-closed no-mutation mode.");
  }
  return true;
}

function assertOro5xPublicAliasRuntimeTraffic(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
  if (
    !summary.apiBalancePublicAliasMounted ||
    !summary.apiTransactionPublicAliasMounted ||
    summary.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    summary.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    !summary.apiBalanceRuntimeTrafficEnabled ||
    !summary.apiTransactionRuntimeTrafficEnabled ||
    summary.apiBalanceRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION ||
    summary.apiTransactionRuntimeTrafficMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    throw new Error("ORO-5X public alias runtime traffic must remain fail-closed no-mutation.");
  }
  return true;
}

function assertOro5xNoLiveTraffic(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
  if (
    summary.liveTrafficAuthorizationRequestSubmitted ||
    summary.liveTrafficAuthorizationDecisionIssued ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5X must not submit, decide, or enable live traffic.");
  }
  return true;
}

function assertOro5xNoRuntimeMoneyMutation(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
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
  ].filter((key) => summary[key] !== false);
  if (unsafe.length > 0) {
    throw new Error(`ORO-5X runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5xNoExternalNetwork(
  summary = buildOro5xRuntimeTrafficEnablementBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5X external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  GRANT_SCOPE_FROM_ORO5W,
  RUNTIME_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY_STATUS,
  buildOro5xRuntimeTrafficEnablementBoundaryInput,
  buildOro5xRuntimeTrafficEnablementBoundary,
  validateOro5xRuntimeTrafficEnablementBoundary,
  assertOro5xDecisionGrantFromOro5w,
  assertOro5xRuntimeTrafficEnabledFailClosed,
  assertOro5xPublicAliasRuntimeTraffic,
  assertOro5xNoLiveTraffic,
  assertOro5xNoRuntimeMoneyMutation,
  assertOro5xNoExternalNetwork,
};
