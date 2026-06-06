"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE,
  PASS: ORO5R_PASS,
  buildOro5rPublicAliasAuthorizationDecisionBoundary,
} = require("./oro5rPublicAliasAuthorizationDecisionBoundary");

const PHASE = "ORO-5S";
const PASS = "PASS";
const HOLD = "HOLD";
const BALANCE_ALIAS_PATH = "/api/balance";
const TRANSACTION_ALIAS_PATH = "/api/transaction";
const INTERNAL_BALANCE_PATH = "/api/oroplay/balance";
const INTERNAL_TRANSACTION_PATH = "/api/oroplay/transaction";

const ORO5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  GRANT_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  BALANCE_ALIAS_PATH,
  TRANSACTION_ALIAS_PATH,
  INTERNAL_BALANCE_PATH,
  INTERNAL_TRANSACTION_PATH,
});

const BASELINE_ORO5R_SUMMARY = buildOro5rPublicAliasAuthorizationDecisionBoundary();

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

function buildOro5sPublicAliasImplementationBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathPublicAliasImplementationFailClosedFixture",
    phase: PHASE,
    oro5rDecisionEvidence: {
      dependsOnOro5rPublicAliasAuthorizationDecision: true,
      publicAliasAuthorizationGrantedFromOro5r:
        BASELINE_ORO5R_SUMMARY.publicAliasAuthorizationDecisionBoundaryResult ===
          ORO5R_PASS && BASELINE_ORO5R_SUMMARY.publicAliasAuthorizationGranted === true,
      publicAliasAuthorizationGrantScopeFromOro5r:
        BASELINE_ORO5R_SUMMARY.publicAliasAuthorizationGrantScope,
      publicAliasImplementationBoundaryEntryAllowedFromOro5r:
        BASELINE_ORO5R_SUMMARY.publicAliasImplementationBoundaryEntryAllowed,
    },
    implementationEvidence: {
      publicAliasImplementationBoundaryEntered: true,
      publicAliasImplementationBoundaryChecked: true,
      publicAliasImplemented: true,
      publicAliasPatchImplemented: true,
      apiBalancePublicAliasMounted: true,
      apiTransactionPublicAliasMounted: true,
      apiBalancePublicAliasPath: BALANCE_ALIAS_PATH,
      apiTransactionPublicAliasPath: TRANSACTION_ALIAS_PATH,
      apiBalancePublicAliasMapsTo: INTERNAL_BALANCE_PATH,
      apiTransactionPublicAliasMapsTo: INTERNAL_TRANSACTION_PATH,
      apiBalancePublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiTransactionPublicAliasMode: FAIL_CLOSED_NO_MUTATION,
      apiBalancePublicAliasRuntimeTrafficEnabled: false,
      apiTransactionPublicAliasRuntimeTrafficEnabled: false,
    },
    fileEvidence: {
      srcAppChangedInOro5s: true,
      runtimeRouteControllerChangedInOro5s: false,
    },
    safetyEvidence: {
      runtimeTrafficEnabled: false,
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
      nextPhaseRequiresPostAliasValidationBoundary: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5sPublicAliasImplementationBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5r = isPlainObject(merged.oro5rDecisionEvidence)
    ? merged.oro5rDecisionEvidence
    : {};
  const implementation = isPlainObject(merged.implementationEvidence)
    ? merged.implementationEvidence
    : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5rPublicAliasAuthorizationDecision: readBoolean(
      oro5r,
      "dependsOnOro5rPublicAliasAuthorizationDecision",
      true
    ),
    publicAliasAuthorizationGrantedFromOro5r: readBoolean(
      oro5r,
      "publicAliasAuthorizationGrantedFromOro5r",
      true
    ),
    publicAliasAuthorizationGrantScopeFromOro5r: readString(
      oro5r,
      "publicAliasAuthorizationGrantScopeFromOro5r",
      GRANT_SCOPE
    ),
    publicAliasImplementationBoundaryEntryAllowedFromOro5r: readBoolean(
      oro5r,
      "publicAliasImplementationBoundaryEntryAllowedFromOro5r",
      true
    ),
    publicAliasImplementationBoundaryEntered: readBoolean(
      implementation,
      "publicAliasImplementationBoundaryEntered",
      true
    ),
    publicAliasImplementationBoundaryChecked: readBoolean(
      implementation,
      "publicAliasImplementationBoundaryChecked",
      true
    ),
    publicAliasImplemented: readBoolean(implementation, "publicAliasImplemented", true),
    publicAliasPatchImplemented: readBoolean(
      implementation,
      "publicAliasPatchImplemented",
      true
    ),
    apiBalancePublicAliasMounted: readBoolean(
      implementation,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      implementation,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasPath: readString(
      implementation,
      "apiBalancePublicAliasPath",
      BALANCE_ALIAS_PATH
    ),
    apiTransactionPublicAliasPath: readString(
      implementation,
      "apiTransactionPublicAliasPath",
      TRANSACTION_ALIAS_PATH
    ),
    apiBalancePublicAliasMapsTo: readString(
      implementation,
      "apiBalancePublicAliasMapsTo",
      INTERNAL_BALANCE_PATH
    ),
    apiTransactionPublicAliasMapsTo: readString(
      implementation,
      "apiTransactionPublicAliasMapsTo",
      INTERNAL_TRANSACTION_PATH
    ),
    apiBalancePublicAliasMode: readString(
      implementation,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      implementation,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalancePublicAliasRuntimeTrafficEnabled: readBoolean(
      implementation,
      "apiBalancePublicAliasRuntimeTrafficEnabled",
      false
    ),
    apiTransactionPublicAliasRuntimeTrafficEnabled: readBoolean(
      implementation,
      "apiTransactionPublicAliasRuntimeTrafficEnabled",
      false
    ),
    srcAppChangedInOro5s: readBoolean(files, "srcAppChangedInOro5s", true),
    runtimeRouteControllerChangedInOro5s: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5s",
      false
    ),
    runtimeTrafficEnabled: readBoolean(safety, "runtimeTrafficEnabled", false),
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
    nextPhaseRequiresPostAliasValidationBoundary: readBoolean(
      next,
      "nextPhaseRequiresPostAliasValidationBoundary",
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
    !fixture.dependsOnOro5rPublicAliasAuthorizationDecision ||
    !fixture.publicAliasAuthorizationGrantedFromOro5r ||
    fixture.publicAliasAuthorizationGrantScopeFromOro5r !== GRANT_SCOPE ||
    !fixture.publicAliasImplementationBoundaryEntryAllowedFromOro5r
  ) {
    blockers.push("ORO-5R implementation-boundary grant is required");
  }
  if (
    !fixture.publicAliasImplementationBoundaryEntered ||
    !fixture.publicAliasImplementationBoundaryChecked ||
    !fixture.publicAliasImplemented ||
    !fixture.publicAliasPatchImplemented
  ) {
    blockers.push("public alias fail-closed wiring must be implemented");
  }
  if (
    !fixture.apiBalancePublicAliasMounted ||
    fixture.apiBalancePublicAliasPath !== BALANCE_ALIAS_PATH ||
    fixture.apiBalancePublicAliasMapsTo !== INTERNAL_BALANCE_PATH ||
    fixture.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.apiBalancePublicAliasRuntimeTrafficEnabled
  ) {
    blockers.push("balance public alias must map fail-closed without runtime traffic");
  }
  if (
    !fixture.apiTransactionPublicAliasMounted ||
    fixture.apiTransactionPublicAliasPath !== TRANSACTION_ALIAS_PATH ||
    fixture.apiTransactionPublicAliasMapsTo !== INTERNAL_TRANSACTION_PATH ||
    fixture.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.apiTransactionPublicAliasRuntimeTrafficEnabled
  ) {
    blockers.push("transaction public alias must map fail-closed without runtime traffic");
  }
  if (!fixture.srcAppChangedInOro5s || fixture.runtimeRouteControllerChangedInOro5s) {
    blockers.push("ORO-5S may only change src/app.js runtime wiring");
  }
  if (fixture.runtimeTrafficEnabled || fixture.liveTrafficEnabled) {
    blockers.push("runtime and live traffic must remain disabled");
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
    blockers.push("sensitive values must not leak");
  }
  if (
    !fixture.nextPhaseRequiresPostAliasValidationBoundary ||
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
    publicAliasImplementationBoundaryResult: result,
    dependsOnOro5rPublicAliasAuthorizationDecision:
      fixture.dependsOnOro5rPublicAliasAuthorizationDecision,
    publicAliasAuthorizationGrantedFromOro5r:
      pass && fixture.publicAliasAuthorizationGrantedFromOro5r,
    publicAliasAuthorizationGrantScopeFromOro5r: pass
      ? fixture.publicAliasAuthorizationGrantScopeFromOro5r
      : HOLD,
    publicAliasImplementationBoundaryEntered:
      pass && fixture.publicAliasImplementationBoundaryEntered,
    publicAliasImplementationBoundaryChecked:
      pass && fixture.publicAliasImplementationBoundaryChecked,
    publicAliasImplemented: pass && fixture.publicAliasImplemented,
    publicAliasPatchImplemented: pass && fixture.publicAliasPatchImplemented,
    apiBalancePublicAliasMounted: pass && fixture.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted: pass && fixture.apiTransactionPublicAliasMounted,
    apiBalancePublicAliasPath: pass ? fixture.apiBalancePublicAliasPath : HOLD,
    apiTransactionPublicAliasPath: pass ? fixture.apiTransactionPublicAliasPath : HOLD,
    apiBalancePublicAliasMapsTo: pass ? fixture.apiBalancePublicAliasMapsTo : HOLD,
    apiTransactionPublicAliasMapsTo: pass ? fixture.apiTransactionPublicAliasMapsTo : HOLD,
    apiBalancePublicAliasMode: pass ? fixture.apiBalancePublicAliasMode : HOLD,
    apiTransactionPublicAliasMode: pass ? fixture.apiTransactionPublicAliasMode : HOLD,
    apiBalancePublicAliasRuntimeTrafficEnabled: false,
    apiTransactionPublicAliasRuntimeTrafficEnabled: false,
    srcAppChangedInOro5s: pass && fixture.srcAppChangedInOro5s,
    runtimeRouteControllerChangedInOro5s: false,
    runtimeTrafficEnabled: false,
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
    nextPhaseRequiresPostAliasValidationBoundary:
      fixture.nextPhaseRequiresPostAliasValidationBoundary,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5sPublicAliasImplementationBoundary(
  input = buildOro5sPublicAliasImplementationBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5sPublicAliasImplementationBoundary(
  input = buildOro5sPublicAliasImplementationBoundaryInput()
) {
  const summary = buildOro5sPublicAliasImplementationBoundary(input);
  return {
    valid: summary.publicAliasImplementationBoundaryResult === PASS,
    publicAliasImplementationBoundaryResult:
      summary.publicAliasImplementationBoundaryResult,
    publicAliasImplemented: summary.publicAliasImplemented,
    apiBalancePublicAliasMounted: summary.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted: summary.apiTransactionPublicAliasMounted,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    walletMutationPerformed: summary.walletMutationPerformed,
    ledgerMutationPerformed: summary.ledgerMutationPerformed,
    prismaWritePerformed: summary.prismaWritePerformed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
    blockers: summary.blockers.slice(),
  };
}

function buildOro5sSafetyLockSummary(
  input = buildOro5sPublicAliasImplementationBoundaryInput()
) {
  const summary = buildOro5sPublicAliasImplementationBoundary(input);
  return {
    phase: PHASE,
    publicAliasImplemented: summary.publicAliasImplemented,
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
    migrationPerformed: summary.migrationPerformed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
    secretsLeaked: summary.secretsLeaked,
  };
}

function assertOro5sAuthorizedFromOro5r(
  summary = buildOro5sPublicAliasImplementationBoundary()
) {
  if (
    summary.publicAliasImplementationBoundaryResult !== PASS ||
    !summary.publicAliasAuthorizationGrantedFromOro5r ||
    summary.publicAliasAuthorizationGrantScopeFromOro5r !== GRANT_SCOPE
  ) {
    throw new Error("ORO-5S requires the ORO-5R implementation-boundary grant.");
  }
  return true;
}

function assertOro5sPublicAliasesImplementedFailClosed(
  summary = buildOro5sPublicAliasImplementationBoundary()
) {
  if (
    !summary.publicAliasImplemented ||
    !summary.apiBalancePublicAliasMounted ||
    !summary.apiTransactionPublicAliasMounted ||
    summary.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    summary.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    throw new Error("ORO-5S public aliases must be implemented as fail-closed wiring.");
  }
  return true;
}

function assertOro5sNoRuntimeTraffic(
  summary = buildOro5sPublicAliasImplementationBoundary()
) {
  if (
    summary.apiBalancePublicAliasRuntimeTrafficEnabled ||
    summary.apiTransactionPublicAliasRuntimeTrafficEnabled ||
    summary.runtimeTrafficEnabled ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5S runtime and live traffic must remain disabled.");
  }
  return true;
}

function assertOro5sNoRuntimeMoneyMutation(
  summary = buildOro5sPublicAliasImplementationBoundary()
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
    throw new Error(`ORO-5S runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5sNoExternalNetwork(
  summary = buildOro5sPublicAliasImplementationBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5S external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  GRANT_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  BALANCE_ALIAS_PATH,
  TRANSACTION_ALIAS_PATH,
  INTERNAL_BALANCE_PATH,
  INTERNAL_TRANSACTION_PATH,
  ORO5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY_STATUS,
  buildOro5sPublicAliasImplementationBoundaryInput,
  buildOro5sPublicAliasImplementationBoundary,
  validateOro5sPublicAliasImplementationBoundary,
  buildOro5sSafetyLockSummary,
  assertOro5sAuthorizedFromOro5r,
  assertOro5sPublicAliasesImplementedFailClosed,
  assertOro5sNoRuntimeTraffic,
  assertOro5sNoRuntimeMoneyMutation,
  assertOro5sNoExternalNetwork,
};
