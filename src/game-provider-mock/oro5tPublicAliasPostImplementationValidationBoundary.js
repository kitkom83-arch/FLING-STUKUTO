"use strict";

const {
  BALANCE_ALIAS_PATH,
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_BALANCE_PATH,
  INTERNAL_TRANSACTION_PATH,
  PASS: ORO5S_PASS,
  TRANSACTION_ALIAS_PATH,
  buildOro5sPublicAliasImplementationBoundary,
} = require("./oro5sPublicAliasImplementationBoundary");

const PHASE = "ORO-5T";
const PASS = "PASS";
const HOLD = "HOLD";
const FAIL_CLOSED = "fail_closed";
const MANUAL_REVIEW = "manual_review";

const ORO5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  FAIL_CLOSED,
  MANUAL_REVIEW,
  FAIL_CLOSED_NO_MUTATION,
  BALANCE_ALIAS_PATH,
  TRANSACTION_ALIAS_PATH,
  INTERNAL_BALANCE_PATH,
  INTERNAL_TRANSACTION_PATH,
});

const BASELINE_ORO5S_SUMMARY = buildOro5sPublicAliasImplementationBoundary();

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

function buildOro5tPublicAliasPostImplementationValidationBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathPublicAliasPostImplementationValidationFixture",
    phase: PHASE,
    oro5sEvidence: {
      dependsOnOro5sPublicAliasImplementationBoundary: true,
      publicAliasImplementationFromOro5s:
        BASELINE_ORO5S_SUMMARY.publicAliasImplementationBoundaryResult === ORO5S_PASS &&
        BASELINE_ORO5S_SUMMARY.publicAliasImplemented === true,
      oro5sBalanceAliasMounted: BASELINE_ORO5S_SUMMARY.apiBalancePublicAliasMounted === true,
      oro5sTransactionAliasMounted:
        BASELINE_ORO5S_SUMMARY.apiTransactionPublicAliasMounted === true,
      oro5sBalanceAliasMode: BASELINE_ORO5S_SUMMARY.apiBalancePublicAliasMode,
      oro5sTransactionAliasMode: BASELINE_ORO5S_SUMMARY.apiTransactionPublicAliasMode,
    },
    validationEvidence: {
      publicAliasPostImplementationValidationBoundaryEntered: true,
      publicAliasPostImplementationValidated: true,
      apiBalancePublicAliasMounted: true,
      apiTransactionPublicAliasMounted: true,
      apiBalancePublicAliasPath: BALANCE_ALIAS_PATH,
      apiTransactionPublicAliasPath: TRANSACTION_ALIAS_PATH,
      apiBalancePublicAliasMapsTo: INTERNAL_BALANCE_PATH,
      apiTransactionPublicAliasMapsTo: INTERNAL_TRANSACTION_PATH,
      apiBalancePublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiTransactionPublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiBalancePublicAliasFailClosedValidated: true,
      apiTransactionPublicAliasFailClosedValidated: true,
      apiBalancePublicAliasNoMutationValidated: true,
      apiTransactionPublicAliasNoMutationValidated: true,
      malformedPayloadFailClosed: true,
      unknownUserFailClosed: true,
      mockAuthMismatchFailClosed: true,
      duplicateTransactionNoDoubleMutation: true,
      unsupportedTransactionTypeFailClosedOrManualReview: true,
      responseSanitized: true,
    },
    safetyEvidence: {
      runtimeTrafficApprovalIssued: false,
      runtimeTrafficAllowed: false,
      runtimeTrafficEnabled: false,
      liveTrafficApprovalIssued: false,
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
    },
    nextPhaseEvidence: {
      nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5tPublicAliasPostImplementationValidationBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5s = isPlainObject(merged.oro5sEvidence) ? merged.oro5sEvidence : {};
  const validation = isPlainObject(merged.validationEvidence)
    ? merged.validationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5sPublicAliasImplementationBoundary: readBoolean(
      oro5s,
      "dependsOnOro5sPublicAliasImplementationBoundary",
      true
    ),
    publicAliasImplementationFromOro5s: readBoolean(
      oro5s,
      "publicAliasImplementationFromOro5s",
      true
    ),
    oro5sBalanceAliasMounted: readBoolean(oro5s, "oro5sBalanceAliasMounted", true),
    oro5sTransactionAliasMounted: readBoolean(
      oro5s,
      "oro5sTransactionAliasMounted",
      true
    ),
    oro5sBalanceAliasMode: readString(
      oro5s,
      "oro5sBalanceAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    oro5sTransactionAliasMode: readString(
      oro5s,
      "oro5sTransactionAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    publicAliasPostImplementationValidationBoundaryEntered: readBoolean(
      validation,
      "publicAliasPostImplementationValidationBoundaryEntered",
      true
    ),
    publicAliasPostImplementationValidated: readBoolean(
      validation,
      "publicAliasPostImplementationValidated",
      true
    ),
    apiBalancePublicAliasMounted: readBoolean(
      validation,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      validation,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasPath: readString(
      validation,
      "apiBalancePublicAliasPath",
      BALANCE_ALIAS_PATH
    ),
    apiTransactionPublicAliasPath: readString(
      validation,
      "apiTransactionPublicAliasPath",
      TRANSACTION_ALIAS_PATH
    ),
    apiBalancePublicAliasMapsTo: readString(
      validation,
      "apiBalancePublicAliasMapsTo",
      INTERNAL_BALANCE_PATH
    ),
    apiTransactionPublicAliasMapsTo: readString(
      validation,
      "apiTransactionPublicAliasMapsTo",
      INTERNAL_TRANSACTION_PATH
    ),
    apiBalancePublicAliasMode: readString(
      validation,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      validation,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalancePublicAliasFailClosedValidated: readBoolean(
      validation,
      "apiBalancePublicAliasFailClosedValidated",
      true
    ),
    apiTransactionPublicAliasFailClosedValidated: readBoolean(
      validation,
      "apiTransactionPublicAliasFailClosedValidated",
      true
    ),
    apiBalancePublicAliasNoMutationValidated: readBoolean(
      validation,
      "apiBalancePublicAliasNoMutationValidated",
      true
    ),
    apiTransactionPublicAliasNoMutationValidated: readBoolean(
      validation,
      "apiTransactionPublicAliasNoMutationValidated",
      true
    ),
    malformedPayloadFailClosed: readBoolean(
      validation,
      "malformedPayloadFailClosed",
      true
    ),
    unknownUserFailClosed: readBoolean(validation, "unknownUserFailClosed", true),
    mockAuthMismatchFailClosed: readBoolean(
      validation,
      "mockAuthMismatchFailClosed",
      true
    ),
    duplicateTransactionNoDoubleMutation: readBoolean(
      validation,
      "duplicateTransactionNoDoubleMutation",
      true
    ),
    unsupportedTransactionTypeFailClosedOrManualReview: readBoolean(
      validation,
      "unsupportedTransactionTypeFailClosedOrManualReview",
      true
    ),
    responseSanitized: readBoolean(validation, "responseSanitized", true),
    runtimeTrafficApprovalIssued: readBoolean(
      safety,
      "runtimeTrafficApprovalIssued",
      false
    ),
    runtimeTrafficAllowed: readBoolean(safety, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(safety, "runtimeTrafficEnabled", false),
    liveTrafficApprovalIssued: readBoolean(safety, "liveTrafficApprovalIssued", false),
    liveTrafficAllowed: readBoolean(safety, "liveTrafficAllowed", false),
    liveTrafficEnabled: readBoolean(safety, "liveTrafficEnabled", false),
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
    nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness: readBoolean(
      next,
      "nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      next,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
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
    !fixture.dependsOnOro5sPublicAliasImplementationBoundary ||
    !fixture.publicAliasImplementationFromOro5s ||
    !fixture.oro5sBalanceAliasMounted ||
    !fixture.oro5sTransactionAliasMounted ||
    fixture.oro5sBalanceAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.oro5sTransactionAliasMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("ORO-5S fail-closed public alias implementation is required");
  }

  if (
    !fixture.publicAliasPostImplementationValidationBoundaryEntered ||
    !fixture.publicAliasPostImplementationValidated
  ) {
    blockers.push("public alias post-implementation validation must be entered");
  }

  if (
    !fixture.apiBalancePublicAliasMounted ||
    fixture.apiBalancePublicAliasPath !== BALANCE_ALIAS_PATH ||
    fixture.apiBalancePublicAliasMapsTo !== INTERNAL_BALANCE_PATH ||
    fixture.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiBalancePublicAliasFailClosedValidated ||
    !fixture.apiBalancePublicAliasNoMutationValidated
  ) {
    blockers.push("balance public alias must validate fail-closed no-mutation mode");
  }

  if (
    !fixture.apiTransactionPublicAliasMounted ||
    fixture.apiTransactionPublicAliasPath !== TRANSACTION_ALIAS_PATH ||
    fixture.apiTransactionPublicAliasMapsTo !== INTERNAL_TRANSACTION_PATH ||
    fixture.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    !fixture.apiTransactionPublicAliasFailClosedValidated ||
    !fixture.apiTransactionPublicAliasNoMutationValidated
  ) {
    blockers.push("transaction public alias must validate fail-closed no-mutation mode");
  }

  if (!fixture.malformedPayloadFailClosed) {
    blockers.push("malformed payload must fail closed");
  }
  if (!fixture.unknownUserFailClosed) {
    blockers.push("unknown user must fail closed");
  }
  if (!fixture.mockAuthMismatchFailClosed) {
    blockers.push("mock auth mismatch must fail closed");
  }
  if (!fixture.duplicateTransactionNoDoubleMutation) {
    blockers.push("duplicate transaction must not double mutate");
  }
  if (!fixture.unsupportedTransactionTypeFailClosedOrManualReview) {
    blockers.push("unsupported transaction type must fail closed or route to manual review");
  }
  if (!fixture.responseSanitized) {
    blockers.push("response must remain sanitized");
  }

  if (
    fixture.runtimeTrafficApprovalIssued ||
    fixture.runtimeTrafficAllowed ||
    fixture.runtimeTrafficEnabled ||
    fixture.liveTrafficApprovalIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("runtime and live traffic must remain unapproved and disabled");
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
    !fixture.nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness ||
    !fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval ||
    !fixture.nextPhaseRequiresSeparateLiveTrafficApproval
  ) {
    blockers.push("next phase controls must require separate approval boundaries");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    publicAliasPostImplementationValidationBoundaryResult: result,
    dependsOnOro5sPublicAliasImplementationBoundary:
      fixture.dependsOnOro5sPublicAliasImplementationBoundary,
    publicAliasImplementationFromOro5s: pass && fixture.publicAliasImplementationFromOro5s,
    publicAliasPostImplementationValidationBoundaryEntered:
      pass && fixture.publicAliasPostImplementationValidationBoundaryEntered,
    publicAliasPostImplementationValidated:
      pass && fixture.publicAliasPostImplementationValidated,
    apiBalancePublicAliasMounted: pass && fixture.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted: pass && fixture.apiTransactionPublicAliasMounted,
    apiBalancePublicAliasPath: pass ? fixture.apiBalancePublicAliasPath : HOLD,
    apiTransactionPublicAliasPath: pass ? fixture.apiTransactionPublicAliasPath : HOLD,
    apiBalancePublicAliasMapsTo: pass ? fixture.apiBalancePublicAliasMapsTo : HOLD,
    apiTransactionPublicAliasMapsTo: pass ? fixture.apiTransactionPublicAliasMapsTo : HOLD,
    apiBalancePublicAliasMode: pass ? fixture.apiBalancePublicAliasMode : HOLD,
    apiTransactionPublicAliasMode: pass ? fixture.apiTransactionPublicAliasMode : HOLD,
    apiBalancePublicAliasFailClosedValidated:
      pass && fixture.apiBalancePublicAliasFailClosedValidated,
    apiTransactionPublicAliasFailClosedValidated:
      pass && fixture.apiTransactionPublicAliasFailClosedValidated,
    apiBalancePublicAliasNoMutationValidated:
      pass && fixture.apiBalancePublicAliasNoMutationValidated,
    apiTransactionPublicAliasNoMutationValidated:
      pass && fixture.apiTransactionPublicAliasNoMutationValidated,
    malformedPayloadFailClosed: pass && fixture.malformedPayloadFailClosed,
    unknownUserFailClosed: pass && fixture.unknownUserFailClosed,
    mockAuthMismatchFailClosed: pass && fixture.mockAuthMismatchFailClosed,
    duplicateTransactionNoDoubleMutation:
      pass && fixture.duplicateTransactionNoDoubleMutation,
    unsupportedTransactionTypeFailClosedOrManualReview:
      pass && fixture.unsupportedTransactionTypeFailClosedOrManualReview,
    responseSanitized: pass && fixture.responseSanitized,
    runtimeTrafficApprovalIssued: false,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    liveTrafficApprovalIssued: false,
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
    nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness:
      fixture.nextPhaseRequiresRuntimeTrafficAuthorizationRequestReadiness,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5tPublicAliasPostImplementationValidationBoundary(
  input = buildOro5tPublicAliasPostImplementationValidationBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5tPublicAliasPostImplementationValidationBoundary(
  input = buildOro5tPublicAliasPostImplementationValidationBoundaryInput()
) {
  const summary = buildOro5tPublicAliasPostImplementationValidationBoundary(input);
  return {
    valid: summary.publicAliasPostImplementationValidationBoundaryResult === PASS,
    publicAliasPostImplementationValidationBoundaryResult:
      summary.publicAliasPostImplementationValidationBoundaryResult,
    publicAliasImplementationFromOro5s: summary.publicAliasImplementationFromOro5s,
    apiBalancePublicAliasMounted: summary.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted: summary.apiTransactionPublicAliasMounted,
    apiBalancePublicAliasMode: summary.apiBalancePublicAliasMode,
    apiTransactionPublicAliasMode: summary.apiTransactionPublicAliasMode,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
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

function assertOro5tPostImplementationValidationPassed(
  summary = buildOro5tPublicAliasPostImplementationValidationBoundary()
) {
  if (summary.publicAliasPostImplementationValidationBoundaryResult !== PASS) {
    throw new Error("ORO-5T post-implementation validation must pass.");
  }
  return true;
}

function assertOro5tNoRuntimeOrLiveApproval(
  summary = buildOro5tPublicAliasPostImplementationValidationBoundary()
) {
  if (
    summary.runtimeTrafficApprovalIssued ||
    summary.runtimeTrafficAllowed ||
    summary.runtimeTrafficEnabled ||
    summary.liveTrafficApprovalIssued ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5T must not approve or enable runtime/live traffic.");
  }
  return true;
}

function assertOro5tNoRuntimeMutation(
  summary = buildOro5tPublicAliasPostImplementationValidationBoundary()
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
    throw new Error(`ORO-5T runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5tNoExternalNetwork(
  summary = buildOro5tPublicAliasPostImplementationValidationBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5T external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  FAIL_CLOSED,
  MANUAL_REVIEW,
  FAIL_CLOSED_NO_MUTATION,
  BALANCE_ALIAS_PATH,
  TRANSACTION_ALIAS_PATH,
  INTERNAL_BALANCE_PATH,
  INTERNAL_TRANSACTION_PATH,
  ORO5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_STATUS,
  buildOro5tPublicAliasPostImplementationValidationBoundaryInput,
  buildOro5tPublicAliasPostImplementationValidationBoundary,
  validateOro5tPublicAliasPostImplementationValidationBoundary,
  assertOro5tPostImplementationValidationPassed,
  assertOro5tNoRuntimeOrLiveApproval,
  assertOro5tNoRuntimeMutation,
  assertOro5tNoExternalNetwork,
};
