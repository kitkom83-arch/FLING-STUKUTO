"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5Q_PASS,
  REQUEST_RESULT: REQUEST_RESULT_FROM_ORO5Q,
  REQUEST_STATUS: REQUEST_STATUS_FROM_ORO5Q,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
} = require("./oro5qPublicAliasAuthorizationRequestSubmissionBoundary");

const PHASE = "ORO-5R";
const PASS = "PASS";
const HOLD = "HOLD";
const DECISION_STATUS = "decision_issued";
const DECISION_RESULT = "approved";
const GRANT_SCOPE = "public_alias_implementation_boundary_only";
const PUBLIC_ALIAS_AUTHORIZATION =
  "authorized_for_public_alias_implementation_boundary_only";

const ORO5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  REQUEST_STATUS_FROM_ORO5Q,
  REQUEST_RESULT_FROM_ORO5Q,
  DECISION_STATUS,
  DECISION_RESULT,
  GRANT_SCOPE,
  PUBLIC_ALIAS_AUTHORIZATION,
  FAIL_CLOSED_NO_MUTATION,
});

const BASELINE_ORO5Q_SUMMARY =
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary();

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

function buildOro5rPublicAliasAuthorizationDecisionBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathPublicAliasAuthorizationDecisionApprovedFixture",
    phase: PHASE,
    oro5qRequestEvidence: {
      dependsOnOro5qPublicAliasAuthorizationRequestSubmission: true,
      publicAliasAuthorizationRequestSubmittedFromOro5q:
        BASELINE_ORO5Q_SUMMARY.publicAliasAuthorizationRequestSubmissionBoundaryResult ===
          ORO5Q_PASS &&
        BASELINE_ORO5Q_SUMMARY.publicAliasAuthorizationRequestSubmitted === true,
      publicAliasAuthorizationRequestStatusFromOro5q:
        BASELINE_ORO5Q_SUMMARY.publicAliasAuthorizationRequestStatus,
      publicAliasAuthorizationRequestResultFromOro5q:
        BASELINE_ORO5Q_SUMMARY.publicAliasAuthorizationRequestResult,
      oroplayInternalCallbackRouteMounted:
        BASELINE_ORO5Q_SUMMARY.oroplayInternalCallbackRouteMounted,
      oroplayBalanceRouteMounted: BASELINE_ORO5Q_SUMMARY.oroplayBalanceRouteMounted,
      oroplayTransactionRouteMounted:
        BASELINE_ORO5Q_SUMMARY.oroplayTransactionRouteMounted,
      oroplayBalanceRouteMode: BASELINE_ORO5Q_SUMMARY.oroplayBalanceRouteMode,
      oroplayTransactionRouteMode: BASELINE_ORO5Q_SUMMARY.oroplayTransactionRouteMode,
    },
    decisionEvidence: {
      publicAliasAuthorizationDecisionBoundaryEntered: true,
      publicAliasAuthorizationDecisionChecked: true,
      publicAliasAuthorizationDecisionIssued: true,
      publicAliasAuthorizationDecisionStatus: DECISION_STATUS,
      publicAliasAuthorizationDecisionResult: DECISION_RESULT,
      publicAliasAuthorizationRequestStatus: DECISION_STATUS,
      publicAliasAuthorizationRequestResult: DECISION_RESULT,
      publicAliasAuthorizationRequestResolved: true,
      publicAliasAuthorizationGranted: true,
      publicAliasAuthorizationGrantScope: GRANT_SCOPE,
      publicAliasAuthorization: PUBLIC_ALIAS_AUTHORIZATION,
      publicAliasImplementationAuthorized: true,
      publicAliasImplementationAuthorizationScope: GRANT_SCOPE,
      publicAliasImplementationBoundaryEntryAllowed: true,
      publicAliasImplementationBoundaryEntryScope: GRANT_SCOPE,
    },
    fileEvidence: {
      srcAppChangedInOro5r: false,
      runtimeRouteControllerChangedInOro5r: false,
    },
    implementationEvidence: {
      publicAliasImplemented: false,
      publicAliasPatchImplemented: false,
      apiBalancePublicAliasMounted: false,
      apiTransactionPublicAliasMounted: false,
      apiBalancePublicAliasActive: false,
      apiTransactionPublicAliasActive: false,
      expressMountAllowedInOro5r: false,
      expressMountImplementedInOro5r: false,
    },
    safetyEvidence: {
      runtimeTrafficAllowed: false,
      runtimeTrafficEnabled: false,
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
    },
    nextPhaseEvidence: {
      nextPhaseRequiresPublicAliasImplementationBoundary: true,
      nextPhaseRequiresPostAliasValidationBoundary: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5rPublicAliasAuthorizationDecisionBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5q = isPlainObject(merged.oro5qRequestEvidence)
    ? merged.oro5qRequestEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const implementation = isPlainObject(merged.implementationEvidence)
    ? merged.implementationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    dependsOnOro5qPublicAliasAuthorizationRequestSubmission: readBoolean(
      oro5q,
      "dependsOnOro5qPublicAliasAuthorizationRequestSubmission",
      true
    ),
    publicAliasAuthorizationRequestSubmittedFromOro5q: readBoolean(
      oro5q,
      "publicAliasAuthorizationRequestSubmittedFromOro5q",
      true
    ),
    publicAliasAuthorizationRequestStatusFromOro5q: readString(
      oro5q,
      "publicAliasAuthorizationRequestStatusFromOro5q",
      REQUEST_STATUS_FROM_ORO5Q
    ),
    publicAliasAuthorizationRequestResultFromOro5q: readString(
      oro5q,
      "publicAliasAuthorizationRequestResultFromOro5q",
      REQUEST_RESULT_FROM_ORO5Q
    ),
    publicAliasAuthorizationDecisionBoundaryEntered: readBoolean(
      decision,
      "publicAliasAuthorizationDecisionBoundaryEntered",
      true
    ),
    publicAliasAuthorizationDecisionChecked: readBoolean(
      decision,
      "publicAliasAuthorizationDecisionChecked",
      true
    ),
    publicAliasAuthorizationDecisionIssued: readBoolean(
      decision,
      "publicAliasAuthorizationDecisionIssued",
      true
    ),
    publicAliasAuthorizationDecisionStatus: readString(
      decision,
      "publicAliasAuthorizationDecisionStatus",
      DECISION_STATUS
    ),
    publicAliasAuthorizationDecisionResult: readString(
      decision,
      "publicAliasAuthorizationDecisionResult",
      DECISION_RESULT
    ),
    publicAliasAuthorizationRequestStatus: readString(
      decision,
      "publicAliasAuthorizationRequestStatus",
      DECISION_STATUS
    ),
    publicAliasAuthorizationRequestResult: readString(
      decision,
      "publicAliasAuthorizationRequestResult",
      DECISION_RESULT
    ),
    publicAliasAuthorizationRequestResolved: readBoolean(
      decision,
      "publicAliasAuthorizationRequestResolved",
      true
    ),
    publicAliasAuthorizationGranted: readBoolean(
      decision,
      "publicAliasAuthorizationGranted",
      true
    ),
    publicAliasAuthorizationGrantScope: readString(
      decision,
      "publicAliasAuthorizationGrantScope",
      GRANT_SCOPE
    ),
    publicAliasAuthorization: readString(
      decision,
      "publicAliasAuthorization",
      PUBLIC_ALIAS_AUTHORIZATION
    ),
    publicAliasImplementationAuthorized: readBoolean(
      decision,
      "publicAliasImplementationAuthorized",
      true
    ),
    publicAliasImplementationAuthorizationScope: readString(
      decision,
      "publicAliasImplementationAuthorizationScope",
      GRANT_SCOPE
    ),
    publicAliasImplementationBoundaryEntryAllowed: readBoolean(
      decision,
      "publicAliasImplementationBoundaryEntryAllowed",
      true
    ),
    publicAliasImplementationBoundaryEntryScope: readString(
      decision,
      "publicAliasImplementationBoundaryEntryScope",
      GRANT_SCOPE
    ),
    srcAppChangedInOro5r: readBoolean(files, "srcAppChangedInOro5r", false),
    runtimeRouteControllerChangedInOro5r: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5r",
      false
    ),
    publicAliasImplemented: readBoolean(
      implementation,
      "publicAliasImplemented",
      false
    ),
    publicAliasPatchImplemented: readBoolean(
      implementation,
      "publicAliasPatchImplemented",
      false
    ),
    apiBalancePublicAliasMounted: readBoolean(
      implementation,
      "apiBalancePublicAliasMounted",
      false
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      implementation,
      "apiTransactionPublicAliasMounted",
      false
    ),
    apiBalancePublicAliasActive: readBoolean(
      implementation,
      "apiBalancePublicAliasActive",
      false
    ),
    apiTransactionPublicAliasActive: readBoolean(
      implementation,
      "apiTransactionPublicAliasActive",
      false
    ),
    expressMountAllowedInOro5r: readBoolean(
      implementation,
      "expressMountAllowedInOro5r",
      false
    ),
    expressMountImplementedInOro5r: readBoolean(
      implementation,
      "expressMountImplementedInOro5r",
      false
    ),
    oroplayInternalCallbackRouteMounted: readBoolean(
      oro5q,
      "oroplayInternalCallbackRouteMounted",
      true
    ),
    oroplayBalanceRouteMounted: readBoolean(oro5q, "oroplayBalanceRouteMounted", true),
    oroplayTransactionRouteMounted: readBoolean(
      oro5q,
      "oroplayTransactionRouteMounted",
      true
    ),
    oroplayBalanceRouteMode: readString(
      oro5q,
      "oroplayBalanceRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    oroplayTransactionRouteMode: readString(
      oro5q,
      "oroplayTransactionRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    runtimeTrafficAllowed: readBoolean(safety, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(safety, "runtimeTrafficEnabled", false),
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
    nextPhaseRequiresPublicAliasImplementationBoundary: readBoolean(
      next,
      "nextPhaseRequiresPublicAliasImplementationBoundary",
      true
    ),
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

  if (!fixture.dependsOnOro5qPublicAliasAuthorizationRequestSubmission) {
    blockers.push("ORO-5Q public alias authorization request submission dependency is required");
  }
  if (!fixture.publicAliasAuthorizationRequestSubmittedFromOro5q) {
    blockers.push("ORO-5Q public alias authorization request must be submitted before ORO-5R");
  }
  if (
    fixture.publicAliasAuthorizationRequestStatusFromOro5q !==
      REQUEST_STATUS_FROM_ORO5Q ||
    fixture.publicAliasAuthorizationRequestResultFromOro5q !== REQUEST_RESULT_FROM_ORO5Q
  ) {
    blockers.push("ORO-5Q request must remain submitted pending decision");
  }
  if (
    !fixture.publicAliasAuthorizationDecisionBoundaryEntered ||
    !fixture.publicAliasAuthorizationDecisionChecked ||
    !fixture.publicAliasAuthorizationDecisionIssued ||
    fixture.publicAliasAuthorizationDecisionStatus !== DECISION_STATUS ||
    fixture.publicAliasAuthorizationDecisionResult !== DECISION_RESULT
  ) {
    blockers.push("public alias authorization decision must be issued and approved");
  }
  if (
    fixture.publicAliasAuthorizationRequestStatus !== DECISION_STATUS ||
    fixture.publicAliasAuthorizationRequestResult !== DECISION_RESULT ||
    !fixture.publicAliasAuthorizationRequestResolved
  ) {
    blockers.push("public alias authorization request must be resolved as approved");
  }
  if (
    !fixture.publicAliasAuthorizationGranted ||
    fixture.publicAliasAuthorizationGrantScope !== GRANT_SCOPE ||
    fixture.publicAliasAuthorization !== PUBLIC_ALIAS_AUTHORIZATION
  ) {
    blockers.push("public alias authorization grant must be implementation-boundary only");
  }
  if (
    !fixture.publicAliasImplementationAuthorized ||
    fixture.publicAliasImplementationAuthorizationScope !== GRANT_SCOPE ||
    !fixture.publicAliasImplementationBoundaryEntryAllowed ||
    fixture.publicAliasImplementationBoundaryEntryScope !== GRANT_SCOPE
  ) {
    blockers.push("public alias implementation boundary entry must be the only authorized grant");
  }
  if (fixture.srcAppChangedInOro5r) {
    blockers.push("src/app.js must not change in ORO-5R");
  }
  if (fixture.runtimeRouteControllerChangedInOro5r) {
    blockers.push("runtime route/controller files must not change in ORO-5R");
  }
  if (
    fixture.publicAliasImplemented ||
    fixture.publicAliasPatchImplemented ||
    fixture.apiBalancePublicAliasMounted ||
    fixture.apiTransactionPublicAliasMounted ||
    fixture.apiBalancePublicAliasActive ||
    fixture.apiTransactionPublicAliasActive ||
    fixture.expressMountAllowedInOro5r ||
    fixture.expressMountImplementedInOro5r
  ) {
    blockers.push("public alias implementation and public mounts must remain absent in ORO-5R");
  }
  if (
    !fixture.oroplayInternalCallbackRouteMounted ||
    !fixture.oroplayBalanceRouteMounted ||
    !fixture.oroplayTransactionRouteMounted
  ) {
    blockers.push("internal OroPlay callback routes must remain mounted");
  }
  if (
    fixture.oroplayBalanceRouteMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.oroplayTransactionRouteMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("balance and transaction callback routes must remain fail-closed no-mutation");
  }
  if (
    fixture.runtimeTrafficAllowed ||
    fixture.runtimeTrafficEnabled ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
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
  if (
    !fixture.nextPhaseRequiresPublicAliasImplementationBoundary ||
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
    publicAliasAuthorizationDecisionBoundaryResult: result,
    publicAliasAuthorizationDecisionBoundaryEntered:
      pass && fixture.publicAliasAuthorizationDecisionBoundaryEntered,
    publicAliasAuthorizationDecisionChecked:
      pass && fixture.publicAliasAuthorizationDecisionChecked,
    dependsOnOro5qPublicAliasAuthorizationRequestSubmission:
      fixture.dependsOnOro5qPublicAliasAuthorizationRequestSubmission,
    publicAliasAuthorizationRequestSubmittedFromOro5q:
      pass && fixture.publicAliasAuthorizationRequestSubmittedFromOro5q,
    publicAliasAuthorizationRequestStatusFromOro5q: pass
      ? fixture.publicAliasAuthorizationRequestStatusFromOro5q
      : HOLD,
    publicAliasAuthorizationRequestResultFromOro5q: pass
      ? fixture.publicAliasAuthorizationRequestResultFromOro5q
      : HOLD,
    publicAliasAuthorizationDecisionIssued:
      pass && fixture.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationDecisionStatus: pass
      ? fixture.publicAliasAuthorizationDecisionStatus
      : HOLD,
    publicAliasAuthorizationDecisionResult: pass
      ? fixture.publicAliasAuthorizationDecisionResult
      : HOLD,
    publicAliasAuthorizationRequestStatus: pass
      ? fixture.publicAliasAuthorizationRequestStatus
      : HOLD,
    publicAliasAuthorizationRequestResult: pass
      ? fixture.publicAliasAuthorizationRequestResult
      : HOLD,
    publicAliasAuthorizationRequestResolved:
      pass && fixture.publicAliasAuthorizationRequestResolved,
    publicAliasAuthorizationGranted: pass && fixture.publicAliasAuthorizationGranted,
    publicAliasAuthorizationGrantScope: pass
      ? fixture.publicAliasAuthorizationGrantScope
      : HOLD,
    publicAliasAuthorization: pass ? fixture.publicAliasAuthorization : HOLD,
    publicAliasImplementationAuthorized:
      pass && fixture.publicAliasImplementationAuthorized,
    publicAliasImplementationAuthorizationScope: pass
      ? fixture.publicAliasImplementationAuthorizationScope
      : HOLD,
    publicAliasImplementationBoundaryEntryAllowed:
      pass && fixture.publicAliasImplementationBoundaryEntryAllowed,
    publicAliasImplementationBoundaryEntryScope: pass
      ? fixture.publicAliasImplementationBoundaryEntryScope
      : HOLD,
    srcAppChangedInOro5r: false,
    runtimeRouteControllerChangedInOro5r: false,
    publicAliasImplemented: false,
    publicAliasPatchImplemented: false,
    apiBalancePublicAliasMounted: false,
    apiTransactionPublicAliasMounted: false,
    apiBalancePublicAliasActive: false,
    apiTransactionPublicAliasActive: false,
    expressMountAllowedInOro5r: false,
    expressMountImplementedInOro5r: false,
    oroplayInternalCallbackRouteMounted:
      pass && fixture.oroplayInternalCallbackRouteMounted,
    oroplayBalanceRouteMounted: pass && fixture.oroplayBalanceRouteMounted,
    oroplayTransactionRouteMounted: pass && fixture.oroplayTransactionRouteMounted,
    oroplayBalanceRouteMode: pass ? fixture.oroplayBalanceRouteMode : HOLD,
    oroplayTransactionRouteMode: pass ? fixture.oroplayTransactionRouteMode : HOLD,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
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
    nextPhaseRequiresPublicAliasImplementationBoundary:
      fixture.nextPhaseRequiresPublicAliasImplementationBoundary,
    nextPhaseRequiresPostAliasValidationBoundary:
      fixture.nextPhaseRequiresPostAliasValidationBoundary,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5rPublicAliasAuthorizationDecisionBoundary(
  input = buildOro5rPublicAliasAuthorizationDecisionBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5rPublicAliasAuthorizationDecisionBoundary(
  input = buildOro5rPublicAliasAuthorizationDecisionBoundaryInput()
) {
  const summary = buildOro5rPublicAliasAuthorizationDecisionBoundary(input);
  return {
    valid: summary.publicAliasAuthorizationDecisionBoundaryResult === PASS,
    publicAliasAuthorizationDecisionBoundaryResult:
      summary.publicAliasAuthorizationDecisionBoundaryResult,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationDecisionResult:
      summary.publicAliasAuthorizationDecisionResult,
    publicAliasAuthorizationGranted: summary.publicAliasAuthorizationGranted,
    publicAliasAuthorizationGrantScope: summary.publicAliasAuthorizationGrantScope,
    publicAliasImplementationBoundaryEntryAllowed:
      summary.publicAliasImplementationBoundaryEntryAllowed,
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

function buildOro5rSafetyLockSummary(
  input = buildOro5rPublicAliasAuthorizationDecisionBoundaryInput()
) {
  const summary = buildOro5rPublicAliasAuthorizationDecisionBoundary(input);
  return {
    phase: PHASE,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationGranted: summary.publicAliasAuthorizationGranted,
    publicAliasAuthorizationGrantScope: summary.publicAliasAuthorizationGrantScope,
    publicAliasImplementationAuthorized: summary.publicAliasImplementationAuthorized,
    publicAliasImplementationBoundaryEntryAllowed:
      summary.publicAliasImplementationBoundaryEntryAllowed,
    publicAliasImplemented: summary.publicAliasImplemented,
    publicAliasPatchImplemented: summary.publicAliasPatchImplemented,
    apiBalancePublicAliasMounted: summary.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted: summary.apiTransactionPublicAliasMounted,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    walletMutationAllowed: summary.walletMutationAllowed,
    walletMutationPerformed: summary.walletMutationPerformed,
    ledgerMutationAllowed: summary.ledgerMutationAllowed,
    ledgerMutationPerformed: summary.ledgerMutationPerformed,
    prismaWriteAllowed: summary.prismaWriteAllowed,
    prismaWritePerformed: summary.prismaWritePerformed,
    dbTransactionAllowed: summary.dbTransactionAllowed,
    dbTransactionPerformed: summary.dbTransactionPerformed,
    migrationAllowed: summary.migrationAllowed,
    migrationPerformed: summary.migrationPerformed,
    externalNetworkAllowed: summary.externalNetworkAllowed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCallAllowed: summary.liveOroPlayApiCallAllowed,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
  };
}

function assertOro5rRequestSubmittedFromOro5q(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    summary.publicAliasAuthorizationDecisionBoundaryResult !== PASS ||
    !summary.publicAliasAuthorizationRequestSubmittedFromOro5q ||
    summary.publicAliasAuthorizationRequestStatusFromOro5q !==
      REQUEST_STATUS_FROM_ORO5Q
  ) {
    throw new Error("ORO-5R requires ORO-5Q submitted public alias authorization request.");
  }
  return true;
}

function assertOro5rDecisionIssuedOnly(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    !summary.publicAliasAuthorizationDecisionIssued ||
    summary.publicAliasAuthorizationDecisionStatus !== DECISION_STATUS ||
    summary.publicAliasAuthorizationDecisionResult !== DECISION_RESULT
  ) {
    throw new Error("ORO-5R must issue only the public alias authorization decision.");
  }
  return true;
}

function assertOro5rImplementationBoundaryOnlyGrant(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    !summary.publicAliasAuthorizationGranted ||
    summary.publicAliasAuthorizationGrantScope !== GRANT_SCOPE ||
    !summary.publicAliasImplementationAuthorized ||
    summary.publicAliasImplementationAuthorizationScope !== GRANT_SCOPE ||
    !summary.publicAliasImplementationBoundaryEntryAllowed
  ) {
    throw new Error("ORO-5R grant must be limited to implementation boundary entry.");
  }
  return true;
}

function assertOro5rNoPublicAliasImplementation(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    summary.publicAliasImplemented ||
    summary.publicAliasPatchImplemented ||
    summary.apiBalancePublicAliasMounted ||
    summary.apiTransactionPublicAliasMounted ||
    summary.apiBalancePublicAliasActive ||
    summary.apiTransactionPublicAliasActive ||
    summary.expressMountAllowedInOro5r ||
    summary.expressMountImplementedInOro5r
  ) {
    throw new Error("ORO-5R must not implement public aliases or Express mounts.");
  }
  return true;
}

function assertOro5rNoRuntimeTraffic(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    summary.runtimeTrafficAllowed ||
    summary.runtimeTrafficEnabled ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5R runtime and live traffic must remain disabled.");
  }
  return true;
}

function assertOro5rNoRuntimeMoneyMutation(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
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
    throw new Error(`ORO-5R runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5rNoExternalNetwork(
  summary = buildOro5rPublicAliasAuthorizationDecisionBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5R external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  REQUEST_STATUS_FROM_ORO5Q,
  REQUEST_RESULT_FROM_ORO5Q,
  DECISION_STATUS,
  DECISION_RESULT,
  GRANT_SCOPE,
  PUBLIC_ALIAS_AUTHORIZATION,
  FAIL_CLOSED_NO_MUTATION,
  ORO5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  buildOro5rPublicAliasAuthorizationDecisionBoundaryInput,
  buildOro5rPublicAliasAuthorizationDecisionBoundary,
  validateOro5rPublicAliasAuthorizationDecisionBoundary,
  buildOro5rSafetyLockSummary,
  assertOro5rRequestSubmittedFromOro5q,
  assertOro5rDecisionIssuedOnly,
  assertOro5rImplementationBoundaryOnlyGrant,
  assertOro5rNoPublicAliasImplementation,
  assertOro5rNoRuntimeTraffic,
  assertOro5rNoRuntimeMoneyMutation,
  assertOro5rNoExternalNetwork,
};
