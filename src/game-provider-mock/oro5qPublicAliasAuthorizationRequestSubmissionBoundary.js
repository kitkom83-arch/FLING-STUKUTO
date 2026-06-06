"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  PASS: ORO5P_PASS,
  READINESS_STATUS,
  VALIDATED_PASSED,
  buildOro5pPostMountValidationDecisionBoundary,
} = require("./oro5pPostMountValidationDecisionBoundary");

const PHASE = "ORO-5Q";
const PASS = "PASS";
const HOLD = "HOLD";
const REQUEST_STATUS = "submitted_pending_decision";
const REQUEST_RESULT = "submitted";
const REQUEST_SCOPE = "public_alias_authorization_decision_request_only";
const DECISION_STATUS_NOT_ISSUED = "not_issued";
const DECISION_RESULT_PENDING = "pending";
const PUBLIC_ALIAS_NOT_AUTHORIZED = "not_authorized_for_public_alias";
const IMPLEMENTATION_SCOPE_NOT_AUTHORIZED = "not_authorized";

const ORO5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS =
  Object.freeze({
    PHASE,
    PASS,
    HOLD,
    REQUEST_STATUS,
    REQUEST_RESULT,
    REQUEST_SCOPE,
    DECISION_STATUS_NOT_ISSUED,
    DECISION_RESULT_PENDING,
    PUBLIC_ALIAS_NOT_AUTHORIZED,
    IMPLEMENTATION_SCOPE_NOT_AUTHORIZED,
    INTERNAL_FAIL_CLOSED_SCOPE,
    FAIL_CLOSED_NO_MUTATION,
  });

const BASELINE_ORO5P_SUMMARY = buildOro5pPostMountValidationDecisionBoundary();

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

function buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput(
  overrides = {}
) {
  const baseline = {
    id: "happyPathPublicAliasAuthorizationRequestSubmissionFixture",
    phase: PHASE,
    oro5pReadinessEvidence: {
      dependsOnOro5pPublicAliasReadiness: true,
      publicAliasAuthorizationRequestReadinessPreparedFromOro5p:
        BASELINE_ORO5P_SUMMARY.postMountValidationDecisionBoundaryResult === ORO5P_PASS &&
        BASELINE_ORO5P_SUMMARY.publicAliasAuthorizationRequestReadinessPrepared === true,
      publicAliasAuthorizationRequestReadinessStatusFromOro5p:
        BASELINE_ORO5P_SUMMARY.publicAliasAuthorizationRequestReadinessStatus,
      postMountValidationDecisionIssuedFromOro5p:
        BASELINE_ORO5P_SUMMARY.postMountValidationDecisionIssued,
      postMountValidationDecisionResultFromOro5p:
        BASELINE_ORO5P_SUMMARY.postMountValidationDecisionResult,
      oroplayInternalCallbackRouteMounted:
        BASELINE_ORO5P_SUMMARY.oroplayInternalCallbackRouteMounted,
      oroplayBalanceRouteMounted: BASELINE_ORO5P_SUMMARY.oroplayBalanceRouteMounted,
      oroplayTransactionRouteMounted:
        BASELINE_ORO5P_SUMMARY.oroplayTransactionRouteMounted,
      oroplayBalanceRouteMode: BASELINE_ORO5P_SUMMARY.oroplayBalanceRouteMode,
      oroplayTransactionRouteMode: BASELINE_ORO5P_SUMMARY.oroplayTransactionRouteMode,
    },
    submissionEvidence: {
      publicAliasAuthorizationRequestSubmissionBoundaryEntered: true,
      publicAliasAuthorizationRequestSubmissionChecked: true,
      publicAliasAuthorizationRequestSubmitted: true,
      publicAliasAuthorizationRequestStatus: REQUEST_STATUS,
      publicAliasAuthorizationRequestResult: REQUEST_RESULT,
      publicAliasAuthorizationRequestScope: REQUEST_SCOPE,
    },
    decisionEvidence: {
      publicAliasAuthorizationDecisionIssued: false,
      publicAliasAuthorizationDecisionStatus: DECISION_STATUS_NOT_ISSUED,
      publicAliasAuthorizationDecisionResult: DECISION_RESULT_PENDING,
      publicAliasAuthorizationGranted: false,
      publicAliasAuthorization: PUBLIC_ALIAS_NOT_AUTHORIZED,
      publicAliasImplementationAuthorized: false,
      publicAliasImplementationAuthorizationScope: IMPLEMENTATION_SCOPE_NOT_AUTHORIZED,
      publicAliasImplementationBoundaryEntryAllowed: false,
      publicAliasAllowed: false,
      publicAliasImplemented: false,
      apiBalancePublicAliasMounted: false,
      apiTransactionPublicAliasMounted: false,
      apiBalancePublicAliasActive: false,
      apiTransactionPublicAliasActive: false,
    },
    fileEvidence: {
      srcAppChangedInOro5q: false,
      runtimeRouteControllerChangedInOro5q: false,
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
      nextPhaseRequiresPublicAliasAuthorizationDecision: true,
      nextPhaseRequiresPublicAliasImplementationBoundary: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5p = isPlainObject(merged.oro5pReadinessEvidence)
    ? merged.oro5pReadinessEvidence
    : {};
  const submission = isPlainObject(merged.submissionEvidence)
    ? merged.submissionEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence) ? merged.decisionEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    dependsOnOro5pPublicAliasReadiness: readBoolean(
      oro5p,
      "dependsOnOro5pPublicAliasReadiness",
      true
    ),
    publicAliasAuthorizationRequestReadinessPreparedFromOro5p: readBoolean(
      oro5p,
      "publicAliasAuthorizationRequestReadinessPreparedFromOro5p",
      true
    ),
    publicAliasAuthorizationRequestReadinessStatusFromOro5p: readString(
      oro5p,
      "publicAliasAuthorizationRequestReadinessStatusFromOro5p",
      READINESS_STATUS
    ),
    postMountValidationDecisionIssuedFromOro5p: readBoolean(
      oro5p,
      "postMountValidationDecisionIssuedFromOro5p",
      true
    ),
    postMountValidationDecisionResultFromOro5p: readString(
      oro5p,
      "postMountValidationDecisionResultFromOro5p",
      VALIDATED_PASSED
    ),
    publicAliasAuthorizationRequestSubmissionBoundaryEntered: readBoolean(
      submission,
      "publicAliasAuthorizationRequestSubmissionBoundaryEntered",
      true
    ),
    publicAliasAuthorizationRequestSubmissionChecked: readBoolean(
      submission,
      "publicAliasAuthorizationRequestSubmissionChecked",
      true
    ),
    publicAliasAuthorizationRequestSubmitted: readBoolean(
      submission,
      "publicAliasAuthorizationRequestSubmitted",
      true
    ),
    publicAliasAuthorizationRequestStatus: readString(
      submission,
      "publicAliasAuthorizationRequestStatus",
      REQUEST_STATUS
    ),
    publicAliasAuthorizationRequestResult: readString(
      submission,
      "publicAliasAuthorizationRequestResult",
      REQUEST_RESULT
    ),
    publicAliasAuthorizationRequestScope: readString(
      submission,
      "publicAliasAuthorizationRequestScope",
      REQUEST_SCOPE
    ),
    publicAliasAuthorizationDecisionIssued: readBoolean(
      decision,
      "publicAliasAuthorizationDecisionIssued",
      false
    ),
    publicAliasAuthorizationDecisionStatus: readString(
      decision,
      "publicAliasAuthorizationDecisionStatus",
      DECISION_STATUS_NOT_ISSUED
    ),
    publicAliasAuthorizationDecisionResult: readString(
      decision,
      "publicAliasAuthorizationDecisionResult",
      DECISION_RESULT_PENDING
    ),
    publicAliasAuthorizationGranted: readBoolean(
      decision,
      "publicAliasAuthorizationGranted",
      false
    ),
    publicAliasAuthorization: readString(
      decision,
      "publicAliasAuthorization",
      PUBLIC_ALIAS_NOT_AUTHORIZED
    ),
    publicAliasImplementationAuthorized: readBoolean(
      decision,
      "publicAliasImplementationAuthorized",
      false
    ),
    publicAliasImplementationAuthorizationScope: readString(
      decision,
      "publicAliasImplementationAuthorizationScope",
      IMPLEMENTATION_SCOPE_NOT_AUTHORIZED
    ),
    publicAliasImplementationBoundaryEntryAllowed: readBoolean(
      decision,
      "publicAliasImplementationBoundaryEntryAllowed",
      false
    ),
    srcAppChangedInOro5q: readBoolean(files, "srcAppChangedInOro5q", false),
    runtimeRouteControllerChangedInOro5q: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5q",
      false
    ),
    publicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(decision, "publicAliasImplemented", false),
    apiBalancePublicAliasMounted: readBoolean(
      decision,
      "apiBalancePublicAliasMounted",
      false
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      decision,
      "apiTransactionPublicAliasMounted",
      false
    ),
    apiBalancePublicAliasActive: readBoolean(
      decision,
      "apiBalancePublicAliasActive",
      false
    ),
    apiTransactionPublicAliasActive: readBoolean(
      decision,
      "apiTransactionPublicAliasActive",
      false
    ),
    oroplayInternalCallbackRouteMounted: readBoolean(
      oro5p,
      "oroplayInternalCallbackRouteMounted",
      true
    ),
    oroplayBalanceRouteMounted: readBoolean(oro5p, "oroplayBalanceRouteMounted", true),
    oroplayTransactionRouteMounted: readBoolean(
      oro5p,
      "oroplayTransactionRouteMounted",
      true
    ),
    oroplayBalanceRouteMode: readString(
      oro5p,
      "oroplayBalanceRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    oroplayTransactionRouteMode: readString(
      oro5p,
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
    nextPhaseRequiresPublicAliasAuthorizationDecision: readBoolean(
      next,
      "nextPhaseRequiresPublicAliasAuthorizationDecision",
      true
    ),
    nextPhaseRequiresPublicAliasImplementationBoundary: readBoolean(
      next,
      "nextPhaseRequiresPublicAliasImplementationBoundary",
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

  if (!fixture.dependsOnOro5pPublicAliasReadiness) {
    blockers.push("ORO-5P public alias readiness dependency is required");
  }
  if (!fixture.publicAliasAuthorizationRequestReadinessPreparedFromOro5p) {
    blockers.push("ORO-5P public alias readiness must be prepared before ORO-5Q");
  }
  if (
    fixture.publicAliasAuthorizationRequestReadinessStatusFromOro5p !== READINESS_STATUS
  ) {
    blockers.push("ORO-5P readiness status must be ready for request submission");
  }
  if (
    !fixture.postMountValidationDecisionIssuedFromOro5p ||
    fixture.postMountValidationDecisionResultFromOro5p !== VALIDATED_PASSED
  ) {
    blockers.push("ORO-5P post-mount validation decision must be validated passed");
  }
  if (
    !fixture.publicAliasAuthorizationRequestSubmissionBoundaryEntered ||
    !fixture.publicAliasAuthorizationRequestSubmissionChecked ||
    !fixture.publicAliasAuthorizationRequestSubmitted ||
    fixture.publicAliasAuthorizationRequestStatus !== REQUEST_STATUS ||
    fixture.publicAliasAuthorizationRequestResult !== REQUEST_RESULT ||
    fixture.publicAliasAuthorizationRequestScope !== REQUEST_SCOPE
  ) {
    blockers.push("public alias authorization request must be submitted only for decision");
  }
  if (fixture.publicAliasAuthorizationDecisionIssued) {
    blockers.push("public alias authorization decision must not be issued in ORO-5Q");
  }
  if (
    fixture.publicAliasAuthorizationDecisionStatus !== DECISION_STATUS_NOT_ISSUED ||
    fixture.publicAliasAuthorizationDecisionResult !== DECISION_RESULT_PENDING
  ) {
    blockers.push("public alias authorization decision must remain pending and not issued");
  }
  if (
    fixture.publicAliasAuthorizationGranted ||
    fixture.publicAliasAuthorization !== PUBLIC_ALIAS_NOT_AUTHORIZED ||
    fixture.publicAliasAllowed
  ) {
    blockers.push("public alias authorization must not be granted in ORO-5Q");
  }
  if (
    fixture.publicAliasImplementationAuthorized ||
    fixture.publicAliasImplementationAuthorizationScope !== IMPLEMENTATION_SCOPE_NOT_AUTHORIZED ||
    fixture.publicAliasImplementationBoundaryEntryAllowed
  ) {
    blockers.push("public alias implementation must not be authorized in ORO-5Q");
  }
  if (fixture.srcAppChangedInOro5q) {
    blockers.push("src/app.js must not change in ORO-5Q");
  }
  if (fixture.runtimeRouteControllerChangedInOro5q) {
    blockers.push("runtime route/controller files must not change in ORO-5Q");
  }
  if (
    fixture.publicAliasImplemented ||
    fixture.apiBalancePublicAliasMounted ||
    fixture.apiTransactionPublicAliasMounted ||
    fixture.apiBalancePublicAliasActive ||
    fixture.apiTransactionPublicAliasActive
  ) {
    blockers.push("public aliases must not be implemented or active in ORO-5Q");
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
    !fixture.nextPhaseRequiresPublicAliasAuthorizationDecision ||
    !fixture.nextPhaseRequiresPublicAliasImplementationBoundary ||
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
    publicAliasAuthorizationRequestSubmissionBoundaryResult: result,
    publicAliasAuthorizationRequestSubmissionBoundaryEntered:
      pass && fixture.publicAliasAuthorizationRequestSubmissionBoundaryEntered,
    publicAliasAuthorizationRequestSubmissionChecked:
      pass && fixture.publicAliasAuthorizationRequestSubmissionChecked,
    dependsOnOro5pPublicAliasReadiness: fixture.dependsOnOro5pPublicAliasReadiness,
    publicAliasAuthorizationRequestReadinessPreparedFromOro5p:
      pass && fixture.publicAliasAuthorizationRequestReadinessPreparedFromOro5p,
    publicAliasAuthorizationRequestReadinessStatusFromOro5p: pass
      ? fixture.publicAliasAuthorizationRequestReadinessStatusFromOro5p
      : HOLD,
    postMountValidationDecisionIssuedFromOro5p:
      pass && fixture.postMountValidationDecisionIssuedFromOro5p,
    postMountValidationDecisionResultFromOro5p: pass
      ? fixture.postMountValidationDecisionResultFromOro5p
      : HOLD,
    publicAliasAuthorizationRequestSubmitted:
      pass && fixture.publicAliasAuthorizationRequestSubmitted,
    publicAliasAuthorizationRequestStatus: pass
      ? fixture.publicAliasAuthorizationRequestStatus
      : HOLD,
    publicAliasAuthorizationRequestResult: pass
      ? fixture.publicAliasAuthorizationRequestResult
      : HOLD,
    publicAliasAuthorizationRequestScope: pass
      ? fixture.publicAliasAuthorizationRequestScope
      : HOLD,
    publicAliasAuthorizationDecisionIssued: false,
    publicAliasAuthorizationDecisionStatus: DECISION_STATUS_NOT_ISSUED,
    publicAliasAuthorizationDecisionResult: DECISION_RESULT_PENDING,
    publicAliasAuthorizationGranted: false,
    publicAliasAuthorization: PUBLIC_ALIAS_NOT_AUTHORIZED,
    publicAliasImplementationAuthorized: false,
    publicAliasImplementationAuthorizationScope: IMPLEMENTATION_SCOPE_NOT_AUTHORIZED,
    publicAliasImplementationBoundaryEntryAllowed: false,
    srcAppChangedInOro5q: false,
    runtimeRouteControllerChangedInOro5q: false,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    apiBalancePublicAliasMounted: false,
    apiTransactionPublicAliasMounted: false,
    apiBalancePublicAliasActive: false,
    apiTransactionPublicAliasActive: false,
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
    nextPhaseRequiresPublicAliasAuthorizationDecision:
      fixture.nextPhaseRequiresPublicAliasAuthorizationDecision,
    nextPhaseRequiresPublicAliasImplementationBoundary:
      fixture.nextPhaseRequiresPublicAliasImplementationBoundary,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
  input = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
  input = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput()
) {
  const summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(input);
  return {
    valid: summary.publicAliasAuthorizationRequestSubmissionBoundaryResult === PASS,
    publicAliasAuthorizationRequestSubmissionBoundaryResult:
      summary.publicAliasAuthorizationRequestSubmissionBoundaryResult,
    publicAliasAuthorizationRequestSubmitted:
      summary.publicAliasAuthorizationRequestSubmitted,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationGranted: summary.publicAliasAuthorizationGranted,
    publicAliasImplemented: summary.publicAliasImplemented,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    walletMutationPerformed: summary.walletMutationPerformed,
    ledgerMutationPerformed: summary.ledgerMutationPerformed,
    prismaWritePerformed: summary.prismaWritePerformed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
    blockers: summary.blockers.slice(),
  };
}

function buildOro5qSafetyLockSummary(
  input = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput()
) {
  const summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(input);
  return {
    phase: PHASE,
    publicAliasAuthorizationRequestSubmitted:
      summary.publicAliasAuthorizationRequestSubmitted,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationGranted: summary.publicAliasAuthorizationGranted,
    publicAliasAllowed: summary.publicAliasAllowed,
    publicAliasImplemented: summary.publicAliasImplemented,
    publicAliasImplementationAuthorized: summary.publicAliasImplementationAuthorized,
    publicAliasImplementationBoundaryEntryAllowed:
      summary.publicAliasImplementationBoundaryEntryAllowed,
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

function assertOro5qReadinessFromOro5p(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.publicAliasAuthorizationRequestSubmissionBoundaryResult !== PASS ||
    !summary.publicAliasAuthorizationRequestReadinessPreparedFromOro5p ||
    summary.publicAliasAuthorizationRequestReadinessStatusFromOro5p !== READINESS_STATUS
  ) {
    throw new Error("ORO-5Q requires ORO-5P public alias readiness.");
  }
  return true;
}

function assertOro5qRequestSubmittedOnly(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (
    !summary.publicAliasAuthorizationRequestSubmitted ||
    summary.publicAliasAuthorizationRequestStatus !== REQUEST_STATUS ||
    summary.publicAliasAuthorizationRequestScope !== REQUEST_SCOPE
  ) {
    throw new Error("ORO-5Q request submission must be static decision-request only.");
  }
  return true;
}

function assertOro5qNoPublicAliasDecision(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (summary.publicAliasAuthorizationDecisionIssued) {
    throw new Error("ORO-5Q must not issue public alias authorization decision.");
  }
  return true;
}

function assertOro5qNoPublicAliasGrant(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (summary.publicAliasAuthorizationGranted || summary.publicAliasAllowed) {
    throw new Error("ORO-5Q must not grant public alias authorization.");
  }
  return true;
}

function assertOro5qNoPublicAliasImplementation(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.publicAliasImplementationAuthorized ||
    summary.publicAliasImplementationBoundaryEntryAllowed ||
    summary.publicAliasImplemented ||
    summary.apiBalancePublicAliasMounted ||
    summary.apiTransactionPublicAliasMounted ||
    summary.apiBalancePublicAliasActive ||
    summary.apiTransactionPublicAliasActive
  ) {
    throw new Error("ORO-5Q must not implement or authorize public aliases.");
  }
  return true;
}

function assertOro5qNoRuntimeMoneyMutation(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  const unsafe = [
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
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
    throw new Error(`ORO-5Q runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5qNoExternalNetwork(
  summary = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5Q external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  REQUEST_STATUS,
  REQUEST_RESULT,
  REQUEST_SCOPE,
  DECISION_STATUS_NOT_ISSUED,
  DECISION_RESULT_PENDING,
  PUBLIC_ALIAS_NOT_AUTHORIZED,
  IMPLEMENTATION_SCOPE_NOT_AUTHORIZED,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
  validateOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
  buildOro5qSafetyLockSummary,
  assertOro5qReadinessFromOro5p,
  assertOro5qRequestSubmittedOnly,
  assertOro5qNoPublicAliasDecision,
  assertOro5qNoPublicAliasGrant,
  assertOro5qNoPublicAliasImplementation,
  assertOro5qNoRuntimeMoneyMutation,
  assertOro5qNoExternalNetwork,
};
