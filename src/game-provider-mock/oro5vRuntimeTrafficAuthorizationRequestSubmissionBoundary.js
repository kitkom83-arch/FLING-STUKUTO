"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5U_PASS,
  REQUEST_READY_STATUS,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
} = require("./oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary");

const PHASE = "ORO-5V";
const PASS = "PASS";
const HOLD = "HOLD";
const REQUEST_STATUS = "submitted_pending_decision";
const REQUEST_RESULT = "submitted";
const REQUEST_SCOPE = "runtime_traffic_authorization_decision_request_only";

const ORO5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS =
  Object.freeze({
    PHASE,
    PASS,
    HOLD,
    REQUEST_READY_STATUS,
    REQUEST_STATUS,
    REQUEST_RESULT,
    REQUEST_SCOPE,
    FAIL_CLOSED_NO_MUTATION,
  });

const BASELINE_ORO5U_SUMMARY =
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary();

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

function buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture",
    phase: PHASE,
    oro5uReadinessEvidence: {
      dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness: true,
      runtimeTrafficAuthorizationRequestReadyFromOro5u:
        BASELINE_ORO5U_SUMMARY.runtimeTrafficAuthorizationRequestReadinessBoundaryResult ===
          ORO5U_PASS &&
        BASELINE_ORO5U_SUMMARY.runtimeTrafficAuthorizationRequestReady === true,
      runtimeTrafficAuthorizationRequestPreparedFromOro5u:
        BASELINE_ORO5U_SUMMARY.runtimeTrafficAuthorizationRequestPrepared === true,
      runtimeTrafficAuthorizationRequestReadinessStatusFromOro5u: REQUEST_READY_STATUS,
      publicAliasPostImplementationValidationFromOro5t:
        BASELINE_ORO5U_SUMMARY.publicAliasPostImplementationValidationFromOro5t,
      apiBalancePublicAliasMounted: BASELINE_ORO5U_SUMMARY.apiBalancePublicAliasMounted,
      apiTransactionPublicAliasMounted:
        BASELINE_ORO5U_SUMMARY.apiTransactionPublicAliasMounted,
      apiBalancePublicAliasMode: BASELINE_ORO5U_SUMMARY.apiBalancePublicAliasMode,
      apiTransactionPublicAliasMode:
        BASELINE_ORO5U_SUMMARY.apiTransactionPublicAliasMode,
    },
    submissionEvidence: {
      runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered: true,
      runtimeTrafficAuthorizationRequestSubmissionChecked: true,
      runtimeTrafficAuthorizationRequestSubmitted: true,
      runtimeTrafficAuthorizationRequestStatus: REQUEST_STATUS,
      runtimeTrafficAuthorizationRequestResult: REQUEST_RESULT,
      runtimeTrafficAuthorizationRequestScope: REQUEST_SCOPE,
    },
    decisionEvidence: {
      runtimeTrafficAuthorizationDecisionIssued: false,
      runtimeTrafficAuthorizationGranted: false,
      runtimeTrafficAllowed: false,
      runtimeTrafficEnabled: false,
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
      srcAppChangedInOro5v: false,
      runtimeRouteControllerChangedInOro5v: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresRuntimeTrafficAuthorizationDecision: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro5uReadinessEvidence)
    ? merged.oro5uReadinessEvidence
    : {};
  const submission = isPlainObject(merged.submissionEvidence)
    ? merged.submissionEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness: readBoolean(
      readiness,
      "dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness",
      true
    ),
    runtimeTrafficAuthorizationRequestReadyFromOro5u: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestReadyFromOro5u",
      true
    ),
    runtimeTrafficAuthorizationRequestPreparedFromOro5u: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestPreparedFromOro5u",
      true
    ),
    runtimeTrafficAuthorizationRequestReadinessStatusFromOro5u: readString(
      readiness,
      "runtimeTrafficAuthorizationRequestReadinessStatusFromOro5u",
      REQUEST_READY_STATUS
    ),
    publicAliasPostImplementationValidationFromOro5t: readBoolean(
      readiness,
      "publicAliasPostImplementationValidationFromOro5t",
      true
    ),
    apiBalancePublicAliasMounted: readBoolean(
      readiness,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      readiness,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasMode: readString(
      readiness,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      readiness,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered: readBoolean(
      submission,
      "runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered",
      true
    ),
    runtimeTrafficAuthorizationRequestSubmissionChecked: readBoolean(
      submission,
      "runtimeTrafficAuthorizationRequestSubmissionChecked",
      true
    ),
    runtimeTrafficAuthorizationRequestSubmitted: readBoolean(
      submission,
      "runtimeTrafficAuthorizationRequestSubmitted",
      true
    ),
    runtimeTrafficAuthorizationRequestStatus: readString(
      submission,
      "runtimeTrafficAuthorizationRequestStatus",
      REQUEST_STATUS
    ),
    runtimeTrafficAuthorizationRequestResult: readString(
      submission,
      "runtimeTrafficAuthorizationRequestResult",
      REQUEST_RESULT
    ),
    runtimeTrafficAuthorizationRequestScope: readString(
      submission,
      "runtimeTrafficAuthorizationRequestScope",
      REQUEST_SCOPE
    ),
    runtimeTrafficAuthorizationDecisionIssued: readBoolean(
      decision,
      "runtimeTrafficAuthorizationDecisionIssued",
      false
    ),
    runtimeTrafficAuthorizationGranted: readBoolean(
      decision,
      "runtimeTrafficAuthorizationGranted",
      false
    ),
    runtimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(decision, "runtimeTrafficEnabled", false),
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
    srcAppChangedInOro5v: readBoolean(files, "srcAppChangedInOro5v", false),
    runtimeRouteControllerChangedInOro5v: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5v",
      false
    ),
    nextPhaseRequiresRuntimeTrafficAuthorizationDecision: readBoolean(
      next,
      "nextPhaseRequiresRuntimeTrafficAuthorizationDecision",
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

  if (!fixture.dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness) {
    blockers.push("ORO-5U runtime traffic authorization request readiness dependency is required");
  }
  if (
    !fixture.runtimeTrafficAuthorizationRequestReadyFromOro5u ||
    !fixture.runtimeTrafficAuthorizationRequestPreparedFromOro5u ||
    fixture.runtimeTrafficAuthorizationRequestReadinessStatusFromOro5u !==
      REQUEST_READY_STATUS
  ) {
    blockers.push("ORO-5U runtime traffic request readiness must be ready and prepared");
  }
  if (!fixture.publicAliasPostImplementationValidationFromOro5t) {
    blockers.push("ORO-5T public alias validation evidence is required");
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
    !fixture.runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered ||
    !fixture.runtimeTrafficAuthorizationRequestSubmissionChecked ||
    !fixture.runtimeTrafficAuthorizationRequestSubmitted ||
    fixture.runtimeTrafficAuthorizationRequestStatus !== REQUEST_STATUS ||
    fixture.runtimeTrafficAuthorizationRequestResult !== REQUEST_RESULT ||
    fixture.runtimeTrafficAuthorizationRequestScope !== REQUEST_SCOPE
  ) {
    blockers.push("runtime traffic authorization request must be submitted only for decision");
  }
  if (
    fixture.runtimeTrafficAuthorizationDecisionIssued ||
    fixture.runtimeTrafficAuthorizationGranted ||
    fixture.runtimeTrafficAllowed ||
    fixture.runtimeTrafficEnabled
  ) {
    blockers.push("runtime traffic decision, grant, and enablement must remain absent");
  }
  if (
    fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain outside ORO-5V");
  }
  if (fixture.srcAppChangedInOro5v) {
    blockers.push("src/app.js must not change in ORO-5V");
  }
  if (fixture.runtimeRouteControllerChangedInOro5v) {
    blockers.push("runtime route/controller files must not change in ORO-5V");
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
    !fixture.nextPhaseRequiresRuntimeTrafficAuthorizationDecision ||
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
    runtimeTrafficAuthorizationRequestSubmissionBoundaryResult: result,
    dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness:
      fixture.dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness,
    runtimeTrafficAuthorizationRequestReadyFromOro5u:
      pass && fixture.runtimeTrafficAuthorizationRequestReadyFromOro5u,
    runtimeTrafficAuthorizationRequestPreparedFromOro5u:
      pass && fixture.runtimeTrafficAuthorizationRequestPreparedFromOro5u,
    runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered:
      pass && fixture.runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered,
    runtimeTrafficAuthorizationRequestSubmissionChecked:
      pass && fixture.runtimeTrafficAuthorizationRequestSubmissionChecked,
    runtimeTrafficAuthorizationRequestSubmitted:
      pass && fixture.runtimeTrafficAuthorizationRequestSubmitted,
    runtimeTrafficAuthorizationRequestStatus: pass
      ? fixture.runtimeTrafficAuthorizationRequestStatus
      : HOLD,
    runtimeTrafficAuthorizationRequestResult: pass
      ? fixture.runtimeTrafficAuthorizationRequestResult
      : HOLD,
    runtimeTrafficAuthorizationRequestScope: pass
      ? fixture.runtimeTrafficAuthorizationRequestScope
      : HOLD,
    runtimeTrafficAuthorizationDecisionIssued: false,
    runtimeTrafficAuthorizationGranted: false,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    liveTrafficAuthorizationRequestSubmitted: false,
    liveTrafficAuthorizationDecisionIssued: false,
    liveTrafficAllowed: false,
    liveTrafficEnabled: false,
    apiBalancePublicAliasMounted: pass && fixture.apiBalancePublicAliasMounted,
    apiTransactionPublicAliasMounted:
      pass && fixture.apiTransactionPublicAliasMounted,
    apiBalancePublicAliasMode: pass ? fixture.apiBalancePublicAliasMode : HOLD,
    apiTransactionPublicAliasMode: pass
      ? fixture.apiTransactionPublicAliasMode
      : HOLD,
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
    nextPhaseRequiresRuntimeTrafficAuthorizationDecision:
      fixture.nextPhaseRequiresRuntimeTrafficAuthorizationDecision,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
  input = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(
  input = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput()
) {
  const summary =
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary(input);
  return {
    valid:
      summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryResult === PASS,
    runtimeTrafficAuthorizationRequestSubmissionBoundaryResult:
      summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryResult,
    runtimeTrafficAuthorizationRequestSubmitted:
      summary.runtimeTrafficAuthorizationRequestSubmitted,
    runtimeTrafficAuthorizationRequestStatus:
      summary.runtimeTrafficAuthorizationRequestStatus,
    runtimeTrafficAuthorizationDecisionIssued:
      summary.runtimeTrafficAuthorizationDecisionIssued,
    runtimeTrafficAuthorizationGranted:
      summary.runtimeTrafficAuthorizationGranted,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    liveTrafficAllowed: summary.liveTrafficAllowed,
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

function assertOro5vReadinessFromOro5u(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.runtimeTrafficAuthorizationRequestSubmissionBoundaryResult !== PASS ||
    !summary.runtimeTrafficAuthorizationRequestReadyFromOro5u ||
    !summary.runtimeTrafficAuthorizationRequestPreparedFromOro5u
  ) {
    throw new Error("ORO-5V requires ORO-5U runtime traffic request readiness.");
  }
  return true;
}

function assertOro5vRequestSubmittedOnly(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
) {
  if (
    !summary.runtimeTrafficAuthorizationRequestSubmitted ||
    summary.runtimeTrafficAuthorizationRequestStatus !== REQUEST_STATUS ||
    summary.runtimeTrafficAuthorizationRequestResult !== REQUEST_RESULT ||
    summary.runtimeTrafficAuthorizationRequestScope !== REQUEST_SCOPE
  ) {
    throw new Error("ORO-5V request submission must be decision-request only.");
  }
  return true;
}

function assertOro5vNoRuntimeDecisionOrGrant(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.runtimeTrafficAuthorizationDecisionIssued ||
    summary.runtimeTrafficAuthorizationGranted ||
    summary.runtimeTrafficAllowed ||
    summary.runtimeTrafficEnabled
  ) {
    throw new Error("ORO-5V must not decide, grant, or enable runtime traffic.");
  }
  return true;
}

function assertOro5vNoLiveTraffic(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.liveTrafficAuthorizationRequestSubmitted ||
    summary.liveTrafficAuthorizationDecisionIssued ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5V must not submit, decide, or enable live traffic.");
  }
  return true;
}

function assertOro5vNoRuntimeMoneyMutation(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
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
    throw new Error(`ORO-5V runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5vNoExternalNetwork(
  summary = buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5V external network and live OroPlay calls must remain absent.");
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
  REQUEST_READY_STATUS,
  FAIL_CLOSED_NO_MUTATION,
  ORO5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput,
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
  validateOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
  assertOro5vReadinessFromOro5u,
  assertOro5vRequestSubmittedOnly,
  assertOro5vNoRuntimeDecisionOrGrant,
  assertOro5vNoLiveTraffic,
  assertOro5vNoRuntimeMoneyMutation,
  assertOro5vNoExternalNetwork,
};
