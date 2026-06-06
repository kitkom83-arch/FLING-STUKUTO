"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5V_PASS,
  REQUEST_RESULT: REQUEST_RESULT_FROM_ORO5V,
  REQUEST_STATUS: REQUEST_STATUS_FROM_ORO5V,
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary,
} = require("./oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary");

const PHASE = "ORO-5W";
const PASS = "PASS";
const HOLD = "HOLD";
const DECISION_STATUS = "decision_issued";
const DECISION_RESULT = "approved";
const GRANT_SCOPE = "runtime_traffic_enablement_boundary_only";

const ORO5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY_STATUS =
  Object.freeze({
    PHASE,
    PASS,
    HOLD,
    REQUEST_STATUS_FROM_ORO5V,
    REQUEST_RESULT_FROM_ORO5V,
    DECISION_STATUS,
    DECISION_RESULT,
    GRANT_SCOPE,
    FAIL_CLOSED_NO_MUTATION,
  });

const BASELINE_ORO5V_SUMMARY =
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary();

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

function buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture",
    phase: PHASE,
    oro5vSubmissionEvidence: {
      dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission: true,
      runtimeTrafficAuthorizationRequestSubmittedFromOro5v:
        BASELINE_ORO5V_SUMMARY
          .runtimeTrafficAuthorizationRequestSubmissionBoundaryResult ===
          ORO5V_PASS &&
        BASELINE_ORO5V_SUMMARY.runtimeTrafficAuthorizationRequestSubmitted === true,
      runtimeTrafficAuthorizationRequestStatusFromOro5v:
        BASELINE_ORO5V_SUMMARY.runtimeTrafficAuthorizationRequestStatus,
      runtimeTrafficAuthorizationRequestResultFromOro5v:
        BASELINE_ORO5V_SUMMARY.runtimeTrafficAuthorizationRequestResult,
      apiBalancePublicAliasMounted:
        BASELINE_ORO5V_SUMMARY.apiBalancePublicAliasMounted,
      apiTransactionPublicAliasMounted:
        BASELINE_ORO5V_SUMMARY.apiTransactionPublicAliasMounted,
      apiBalancePublicAliasMode:
        BASELINE_ORO5V_SUMMARY.apiBalancePublicAliasMode,
      apiTransactionPublicAliasMode:
        BASELINE_ORO5V_SUMMARY.apiTransactionPublicAliasMode,
    },
    decisionEvidence: {
      runtimeTrafficAuthorizationDecisionBoundaryEntered: true,
      runtimeTrafficAuthorizationDecisionChecked: true,
      runtimeTrafficAuthorizationDecisionIssued: true,
      runtimeTrafficAuthorizationDecisionStatus: DECISION_STATUS,
      runtimeTrafficAuthorizationDecisionResult: DECISION_RESULT,
      runtimeTrafficAuthorizationRequestStatus: DECISION_STATUS,
      runtimeTrafficAuthorizationRequestResult: DECISION_RESULT,
      runtimeTrafficAuthorizationRequestResolved: true,
      runtimeTrafficAuthorizationGranted: true,
      runtimeTrafficAuthorizationGrantScope: GRANT_SCOPE,
      runtimeTrafficEnablementAuthorized: true,
      runtimeTrafficEnablementAuthorizationScope: GRANT_SCOPE,
      runtimeTrafficEnablementBoundaryEntryAllowed: true,
      runtimeTrafficEnablementBoundaryEntryScope: GRANT_SCOPE,
    },
    runtimeEvidence: {
      runtimeTrafficAllowed: false,
      runtimeTrafficEnabled: false,
      runtimeTrafficImplemented: false,
      runtimeTrafficPatchImplemented: false,
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
      srcAppChangedInOro5w: false,
      runtimeRouteControllerChangedInOro5w: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresRuntimeTrafficEnablementBoundary: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5v = isPlainObject(merged.oro5vSubmissionEvidence)
    ? merged.oro5vSubmissionEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const runtime = isPlainObject(merged.runtimeEvidence) ? merged.runtimeEvidence : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission: readBoolean(
      oro5v,
      "dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission",
      true
    ),
    runtimeTrafficAuthorizationRequestSubmittedFromOro5v: readBoolean(
      oro5v,
      "runtimeTrafficAuthorizationRequestSubmittedFromOro5v",
      true
    ),
    runtimeTrafficAuthorizationRequestStatusFromOro5v: readString(
      oro5v,
      "runtimeTrafficAuthorizationRequestStatusFromOro5v",
      REQUEST_STATUS_FROM_ORO5V
    ),
    runtimeTrafficAuthorizationRequestResultFromOro5v: readString(
      oro5v,
      "runtimeTrafficAuthorizationRequestResultFromOro5v",
      REQUEST_RESULT_FROM_ORO5V
    ),
    runtimeTrafficAuthorizationDecisionBoundaryEntered: readBoolean(
      decision,
      "runtimeTrafficAuthorizationDecisionBoundaryEntered",
      true
    ),
    runtimeTrafficAuthorizationDecisionChecked: readBoolean(
      decision,
      "runtimeTrafficAuthorizationDecisionChecked",
      true
    ),
    runtimeTrafficAuthorizationDecisionIssued: readBoolean(
      decision,
      "runtimeTrafficAuthorizationDecisionIssued",
      true
    ),
    runtimeTrafficAuthorizationDecisionStatus: readString(
      decision,
      "runtimeTrafficAuthorizationDecisionStatus",
      DECISION_STATUS
    ),
    runtimeTrafficAuthorizationDecisionResult: readString(
      decision,
      "runtimeTrafficAuthorizationDecisionResult",
      DECISION_RESULT
    ),
    runtimeTrafficAuthorizationRequestStatus: readString(
      decision,
      "runtimeTrafficAuthorizationRequestStatus",
      DECISION_STATUS
    ),
    runtimeTrafficAuthorizationRequestResult: readString(
      decision,
      "runtimeTrafficAuthorizationRequestResult",
      DECISION_RESULT
    ),
    runtimeTrafficAuthorizationRequestResolved: readBoolean(
      decision,
      "runtimeTrafficAuthorizationRequestResolved",
      true
    ),
    runtimeTrafficAuthorizationGranted: readBoolean(
      decision,
      "runtimeTrafficAuthorizationGranted",
      true
    ),
    runtimeTrafficAuthorizationGrantScope: readString(
      decision,
      "runtimeTrafficAuthorizationGrantScope",
      GRANT_SCOPE
    ),
    runtimeTrafficEnablementAuthorized: readBoolean(
      decision,
      "runtimeTrafficEnablementAuthorized",
      true
    ),
    runtimeTrafficEnablementAuthorizationScope: readString(
      decision,
      "runtimeTrafficEnablementAuthorizationScope",
      GRANT_SCOPE
    ),
    runtimeTrafficEnablementBoundaryEntryAllowed: readBoolean(
      decision,
      "runtimeTrafficEnablementBoundaryEntryAllowed",
      true
    ),
    runtimeTrafficEnablementBoundaryEntryScope: readString(
      decision,
      "runtimeTrafficEnablementBoundaryEntryScope",
      GRANT_SCOPE
    ),
    runtimeTrafficAllowed: readBoolean(runtime, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(runtime, "runtimeTrafficEnabled", false),
    runtimeTrafficImplemented: readBoolean(
      runtime,
      "runtimeTrafficImplemented",
      false
    ),
    runtimeTrafficPatchImplemented: readBoolean(
      runtime,
      "runtimeTrafficPatchImplemented",
      false
    ),
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
    apiBalancePublicAliasMounted: readBoolean(
      oro5v,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      oro5v,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasMode: readString(
      oro5v,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      oro5v,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
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
    srcAppChangedInOro5w: readBoolean(files, "srcAppChangedInOro5w", false),
    runtimeRouteControllerChangedInOro5w: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5w",
      false
    ),
    nextPhaseRequiresRuntimeTrafficEnablementBoundary: readBoolean(
      next,
      "nextPhaseRequiresRuntimeTrafficEnablementBoundary",
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

  if (!fixture.dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission) {
    blockers.push("ORO-5V runtime traffic request submission dependency is required");
  }
  if (!fixture.runtimeTrafficAuthorizationRequestSubmittedFromOro5v) {
    blockers.push("ORO-5V runtime traffic authorization request must be submitted before ORO-5W");
  }
  if (
    fixture.runtimeTrafficAuthorizationRequestStatusFromOro5v !==
      REQUEST_STATUS_FROM_ORO5V ||
    fixture.runtimeTrafficAuthorizationRequestResultFromOro5v !==
      REQUEST_RESULT_FROM_ORO5V
  ) {
    blockers.push("ORO-5V request must remain submitted pending decision");
  }
  if (
    !fixture.runtimeTrafficAuthorizationDecisionBoundaryEntered ||
    !fixture.runtimeTrafficAuthorizationDecisionChecked ||
    !fixture.runtimeTrafficAuthorizationDecisionIssued ||
    fixture.runtimeTrafficAuthorizationDecisionStatus !== DECISION_STATUS ||
    fixture.runtimeTrafficAuthorizationDecisionResult !== DECISION_RESULT
  ) {
    blockers.push("runtime traffic authorization decision must be issued and approved");
  }
  if (
    fixture.runtimeTrafficAuthorizationRequestStatus !== DECISION_STATUS ||
    fixture.runtimeTrafficAuthorizationRequestResult !== DECISION_RESULT ||
    !fixture.runtimeTrafficAuthorizationRequestResolved
  ) {
    blockers.push("runtime traffic authorization request must be resolved as approved");
  }
  if (
    !fixture.runtimeTrafficAuthorizationGranted ||
    fixture.runtimeTrafficAuthorizationGrantScope !== GRANT_SCOPE ||
    !fixture.runtimeTrafficEnablementAuthorized ||
    fixture.runtimeTrafficEnablementAuthorizationScope !== GRANT_SCOPE ||
    !fixture.runtimeTrafficEnablementBoundaryEntryAllowed ||
    fixture.runtimeTrafficEnablementBoundaryEntryScope !== GRANT_SCOPE
  ) {
    blockers.push("runtime traffic grant must be enablement-boundary only");
  }
  if (
    fixture.runtimeTrafficAllowed ||
    fixture.runtimeTrafficEnabled ||
    fixture.runtimeTrafficImplemented ||
    fixture.runtimeTrafficPatchImplemented
  ) {
    blockers.push("runtime traffic must remain unopened and unimplemented");
  }
  if (
    fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain outside ORO-5W");
  }
  if (
    !fixture.apiBalancePublicAliasMounted ||
    !fixture.apiTransactionPublicAliasMounted ||
    fixture.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("public aliases must remain mounted in fail-closed no-mutation mode");
  }
  if (fixture.srcAppChangedInOro5w) {
    blockers.push("src/app.js must not change in ORO-5W");
  }
  if (fixture.runtimeRouteControllerChangedInOro5w) {
    blockers.push("runtime route/controller files must not change in ORO-5W");
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
    !fixture.nextPhaseRequiresRuntimeTrafficEnablementBoundary ||
    !fixture.nextPhaseRequiresSeparateLiveTrafficApproval
  ) {
    blockers.push("next phase controls must require separate runtime and live boundaries");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    runtimeTrafficAuthorizationDecisionBoundaryResult: result,
    dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission:
      fixture.dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission,
    runtimeTrafficAuthorizationRequestSubmittedFromOro5v:
      pass && fixture.runtimeTrafficAuthorizationRequestSubmittedFromOro5v,
    runtimeTrafficAuthorizationRequestStatusFromOro5v: pass
      ? fixture.runtimeTrafficAuthorizationRequestStatusFromOro5v
      : HOLD,
    runtimeTrafficAuthorizationRequestResultFromOro5v: pass
      ? fixture.runtimeTrafficAuthorizationRequestResultFromOro5v
      : HOLD,
    runtimeTrafficAuthorizationDecisionBoundaryEntered:
      pass && fixture.runtimeTrafficAuthorizationDecisionBoundaryEntered,
    runtimeTrafficAuthorizationDecisionChecked:
      pass && fixture.runtimeTrafficAuthorizationDecisionChecked,
    runtimeTrafficAuthorizationDecisionIssued:
      pass && fixture.runtimeTrafficAuthorizationDecisionIssued,
    runtimeTrafficAuthorizationDecisionStatus: pass
      ? fixture.runtimeTrafficAuthorizationDecisionStatus
      : HOLD,
    runtimeTrafficAuthorizationDecisionResult: pass
      ? fixture.runtimeTrafficAuthorizationDecisionResult
      : HOLD,
    runtimeTrafficAuthorizationRequestStatus: pass
      ? fixture.runtimeTrafficAuthorizationRequestStatus
      : HOLD,
    runtimeTrafficAuthorizationRequestResult: pass
      ? fixture.runtimeTrafficAuthorizationRequestResult
      : HOLD,
    runtimeTrafficAuthorizationRequestResolved:
      pass && fixture.runtimeTrafficAuthorizationRequestResolved,
    runtimeTrafficAuthorizationGranted:
      pass && fixture.runtimeTrafficAuthorizationGranted,
    runtimeTrafficAuthorizationGrantScope: pass
      ? fixture.runtimeTrafficAuthorizationGrantScope
      : HOLD,
    runtimeTrafficEnablementAuthorized:
      pass && fixture.runtimeTrafficEnablementAuthorized,
    runtimeTrafficEnablementAuthorizationScope: pass
      ? fixture.runtimeTrafficEnablementAuthorizationScope
      : HOLD,
    runtimeTrafficEnablementBoundaryEntryAllowed:
      pass && fixture.runtimeTrafficEnablementBoundaryEntryAllowed,
    runtimeTrafficEnablementBoundaryEntryScope: pass
      ? fixture.runtimeTrafficEnablementBoundaryEntryScope
      : HOLD,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    runtimeTrafficImplemented: false,
    runtimeTrafficPatchImplemented: false,
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
    nextPhaseRequiresRuntimeTrafficEnablementBoundary:
      fixture.nextPhaseRequiresRuntimeTrafficEnablementBoundary,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
  input = buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5wRuntimeTrafficAuthorizationDecisionBoundary(
  input = buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput()
) {
  const summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(input);
  return {
    valid: summary.runtimeTrafficAuthorizationDecisionBoundaryResult === PASS,
    runtimeTrafficAuthorizationDecisionBoundaryResult:
      summary.runtimeTrafficAuthorizationDecisionBoundaryResult,
    runtimeTrafficAuthorizationDecisionIssued:
      summary.runtimeTrafficAuthorizationDecisionIssued,
    runtimeTrafficAuthorizationDecisionResult:
      summary.runtimeTrafficAuthorizationDecisionResult,
    runtimeTrafficAuthorizationGranted:
      summary.runtimeTrafficAuthorizationGranted,
    runtimeTrafficAuthorizationGrantScope:
      summary.runtimeTrafficAuthorizationGrantScope,
    runtimeTrafficEnablementBoundaryEntryAllowed:
      summary.runtimeTrafficEnablementBoundaryEntryAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    runtimeTrafficImplemented: summary.runtimeTrafficImplemented,
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

function assertOro5wRequestSubmittedFromOro5v(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    summary.runtimeTrafficAuthorizationDecisionBoundaryResult !== PASS ||
    !summary.runtimeTrafficAuthorizationRequestSubmittedFromOro5v ||
    summary.runtimeTrafficAuthorizationRequestStatusFromOro5v !==
      REQUEST_STATUS_FROM_ORO5V ||
    summary.runtimeTrafficAuthorizationRequestResultFromOro5v !==
      REQUEST_RESULT_FROM_ORO5V
  ) {
    throw new Error("ORO-5W requires ORO-5V submitted runtime traffic request.");
  }
  return true;
}

function assertOro5wDecisionIssuedOnly(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    !summary.runtimeTrafficAuthorizationDecisionIssued ||
    summary.runtimeTrafficAuthorizationDecisionStatus !== DECISION_STATUS ||
    summary.runtimeTrafficAuthorizationDecisionResult !== DECISION_RESULT
  ) {
    throw new Error("ORO-5W must issue only the runtime traffic authorization decision.");
  }
  return true;
}

function assertOro5wEnablementBoundaryOnlyGrant(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    !summary.runtimeTrafficAuthorizationGranted ||
    summary.runtimeTrafficAuthorizationGrantScope !== GRANT_SCOPE ||
    !summary.runtimeTrafficEnablementAuthorized ||
    summary.runtimeTrafficEnablementAuthorizationScope !== GRANT_SCOPE ||
    !summary.runtimeTrafficEnablementBoundaryEntryAllowed ||
    summary.runtimeTrafficEnablementBoundaryEntryScope !== GRANT_SCOPE
  ) {
    throw new Error("ORO-5W grant must be limited to runtime enablement boundary entry.");
  }
  return true;
}

function assertOro5wNoRuntimeTraffic(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    summary.runtimeTrafficAllowed ||
    summary.runtimeTrafficEnabled ||
    summary.runtimeTrafficImplemented ||
    summary.runtimeTrafficPatchImplemented
  ) {
    throw new Error("ORO-5W must not open or implement runtime traffic.");
  }
  return true;
}

function assertOro5wNoLiveTraffic(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    summary.liveTrafficAuthorizationRequestSubmitted ||
    summary.liveTrafficAuthorizationDecisionIssued ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5W must not submit, decide, or enable live traffic.");
  }
  return true;
}

function assertOro5wNoRuntimeMoneyMutation(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
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
    throw new Error(`ORO-5W runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5wNoExternalNetwork(
  summary = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5W external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  REQUEST_STATUS_FROM_ORO5V,
  REQUEST_RESULT_FROM_ORO5V,
  DECISION_STATUS,
  DECISION_RESULT,
  GRANT_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundary,
  validateOro5wRuntimeTrafficAuthorizationDecisionBoundary,
  assertOro5wRequestSubmittedFromOro5v,
  assertOro5wDecisionIssuedOnly,
  assertOro5wEnablementBoundaryOnlyGrant,
  assertOro5wNoRuntimeTraffic,
  assertOro5wNoLiveTraffic,
  assertOro5wNoRuntimeMoneyMutation,
  assertOro5wNoExternalNetwork,
};
