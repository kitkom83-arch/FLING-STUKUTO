"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO5T_PASS,
  buildOro5tPublicAliasPostImplementationValidationBoundary,
} = require("./oro5tPublicAliasPostImplementationValidationBoundary");

const PHASE = "ORO-5U";
const PASS = "PASS";
const HOLD = "HOLD";
const REQUEST_READY_STATUS = "ready_for_runtime_traffic_request_submission";
const REQUEST_READINESS_SCOPE = "runtime_traffic_authorization_request_readiness_only";

const ORO5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY_STATUS =
  Object.freeze({
    PHASE,
    PASS,
    HOLD,
    REQUEST_READY_STATUS,
    REQUEST_READINESS_SCOPE,
    FAIL_CLOSED_NO_MUTATION,
  });

const BASELINE_ORO5T_SUMMARY =
  buildOro5tPublicAliasPostImplementationValidationBoundary();

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

function buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput(
  overrides = {}
) {
  const baseline = {
    id: "happyPathRuntimeTrafficAuthorizationRequestReadinessFixture",
    phase: PHASE,
    oro5tEvidence: {
      dependsOnOro5tPublicAliasPostImplementationValidation: true,
      publicAliasPostImplementationValidationFromOro5t:
        BASELINE_ORO5T_SUMMARY.publicAliasPostImplementationValidationBoundaryResult ===
          ORO5T_PASS &&
        BASELINE_ORO5T_SUMMARY.publicAliasImplementationFromOro5s === true,
      apiBalancePublicAliasMounted: BASELINE_ORO5T_SUMMARY.apiBalancePublicAliasMounted,
      apiTransactionPublicAliasMounted:
        BASELINE_ORO5T_SUMMARY.apiTransactionPublicAliasMounted,
      apiBalancePublicAliasMode: BASELINE_ORO5T_SUMMARY.apiBalancePublicAliasMode,
      apiTransactionPublicAliasMode:
        BASELINE_ORO5T_SUMMARY.apiTransactionPublicAliasMode,
      apiBalancePublicAliasFailClosedValidated:
        BASELINE_ORO5T_SUMMARY.apiBalancePublicAliasFailClosedValidated,
      apiTransactionPublicAliasFailClosedValidated:
        BASELINE_ORO5T_SUMMARY.apiTransactionPublicAliasFailClosedValidated,
      apiBalancePublicAliasNoMutationValidated:
        BASELINE_ORO5T_SUMMARY.apiBalancePublicAliasNoMutationValidated,
      apiTransactionPublicAliasNoMutationValidated:
        BASELINE_ORO5T_SUMMARY.apiTransactionPublicAliasNoMutationValidated,
    },
    readinessEvidence: {
      runtimeTrafficAuthorizationRequestReadinessBoundaryEntered: true,
      runtimeTrafficAuthorizationRequestReadinessChecked: true,
      runtimeTrafficAuthorizationRequestReady: true,
      runtimeTrafficAuthorizationRequestPrepared: true,
      runtimeTrafficAuthorizationRequestStatus: REQUEST_READY_STATUS,
      runtimeTrafficAuthorizationRequestScope: REQUEST_READINESS_SCOPE,
      runtimeTrafficAuthorizationRequestSubmitted: false,
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
    evidenceChecklist: {
      failClosedAliasValidationEvidencePresent: true,
      noMutationEvidencePresent: true,
      rollbackPlanPresent: true,
      monitoringPlanPresent: true,
      auditLogPlanPresent: true,
      idempotencyPlanPresent: true,
      sanitizedResponsePlanPresent: true,
      rateLimitPlanPresent: true,
      manualHoldPlanPresent: true,
      emergencyDisablePlanPresent: true,
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
      srcAppChangedInOro5u: false,
      runtimeRouteControllerChangedInOro5u: false,
    },
    nextPhaseEvidence: {
      nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission: true,
      nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision: true,
      nextPhaseRequiresSeparateLiveTrafficApproval: true,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5t = isPlainObject(merged.oro5tEvidence) ? merged.oro5tEvidence : {};
  const readiness = isPlainObject(merged.readinessEvidence)
    ? merged.readinessEvidence
    : {};
  const live = isPlainObject(merged.liveTrafficEvidence)
    ? merged.liveTrafficEvidence
    : {};
  const checklist = isPlainObject(merged.evidenceChecklist)
    ? merged.evidenceChecklist
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro5tPublicAliasPostImplementationValidation: readBoolean(
      oro5t,
      "dependsOnOro5tPublicAliasPostImplementationValidation",
      true
    ),
    publicAliasPostImplementationValidationFromOro5t: readBoolean(
      oro5t,
      "publicAliasPostImplementationValidationFromOro5t",
      true
    ),
    apiBalancePublicAliasMounted: readBoolean(
      oro5t,
      "apiBalancePublicAliasMounted",
      true
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      oro5t,
      "apiTransactionPublicAliasMounted",
      true
    ),
    apiBalancePublicAliasMode: readString(
      oro5t,
      "apiBalancePublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiTransactionPublicAliasMode: readString(
      oro5t,
      "apiTransactionPublicAliasMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    apiBalancePublicAliasFailClosedValidated: readBoolean(
      oro5t,
      "apiBalancePublicAliasFailClosedValidated",
      true
    ),
    apiTransactionPublicAliasFailClosedValidated: readBoolean(
      oro5t,
      "apiTransactionPublicAliasFailClosedValidated",
      true
    ),
    apiBalancePublicAliasNoMutationValidated: readBoolean(
      oro5t,
      "apiBalancePublicAliasNoMutationValidated",
      true
    ),
    apiTransactionPublicAliasNoMutationValidated: readBoolean(
      oro5t,
      "apiTransactionPublicAliasNoMutationValidated",
      true
    ),
    runtimeTrafficAuthorizationRequestReadinessBoundaryEntered: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestReadinessBoundaryEntered",
      true
    ),
    runtimeTrafficAuthorizationRequestReadinessChecked: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestReadinessChecked",
      true
    ),
    runtimeTrafficAuthorizationRequestReady: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestReady",
      true
    ),
    runtimeTrafficAuthorizationRequestPrepared: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestPrepared",
      true
    ),
    runtimeTrafficAuthorizationRequestStatus: readString(
      readiness,
      "runtimeTrafficAuthorizationRequestStatus",
      REQUEST_READY_STATUS
    ),
    runtimeTrafficAuthorizationRequestScope: readString(
      readiness,
      "runtimeTrafficAuthorizationRequestScope",
      REQUEST_READINESS_SCOPE
    ),
    runtimeTrafficAuthorizationRequestSubmitted: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationRequestSubmitted",
      false
    ),
    runtimeTrafficAuthorizationDecisionIssued: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationDecisionIssued",
      false
    ),
    runtimeTrafficAuthorizationGranted: readBoolean(
      readiness,
      "runtimeTrafficAuthorizationGranted",
      false
    ),
    runtimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(readiness, "runtimeTrafficEnabled", false),
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
    failClosedAliasValidationEvidencePresent: readBoolean(
      checklist,
      "failClosedAliasValidationEvidencePresent",
      true
    ),
    noMutationEvidencePresent: readBoolean(
      checklist,
      "noMutationEvidencePresent",
      true
    ),
    rollbackPlanPresent: readBoolean(checklist, "rollbackPlanPresent", true),
    monitoringPlanPresent: readBoolean(checklist, "monitoringPlanPresent", true),
    auditLogPlanPresent: readBoolean(checklist, "auditLogPlanPresent", true),
    idempotencyPlanPresent: readBoolean(checklist, "idempotencyPlanPresent", true),
    sanitizedResponsePlanPresent: readBoolean(
      checklist,
      "sanitizedResponsePlanPresent",
      true
    ),
    rateLimitPlanPresent: readBoolean(checklist, "rateLimitPlanPresent", true),
    manualHoldPlanPresent: readBoolean(checklist, "manualHoldPlanPresent", true),
    emergencyDisablePlanPresent: readBoolean(
      checklist,
      "emergencyDisablePlanPresent",
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
    srcAppChangedInOro5u: readBoolean(files, "srcAppChangedInOro5u", false),
    runtimeRouteControllerChangedInOro5u: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5u",
      false
    ),
    nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission: readBoolean(
      next,
      "nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision: readBoolean(
      next,
      "nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision",
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
    !fixture.dependsOnOro5tPublicAliasPostImplementationValidation ||
    !fixture.publicAliasPostImplementationValidationFromOro5t
  ) {
    blockers.push("ORO-5T public alias post-implementation validation is required");
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
    !fixture.apiBalancePublicAliasFailClosedValidated ||
    !fixture.apiTransactionPublicAliasFailClosedValidated ||
    !fixture.apiBalancePublicAliasNoMutationValidated ||
    !fixture.apiTransactionPublicAliasNoMutationValidated
  ) {
    blockers.push("ORO-5T fail-closed no-mutation evidence is required");
  }
  if (
    !fixture.runtimeTrafficAuthorizationRequestReadinessBoundaryEntered ||
    !fixture.runtimeTrafficAuthorizationRequestReadinessChecked ||
    !fixture.runtimeTrafficAuthorizationRequestReady ||
    !fixture.runtimeTrafficAuthorizationRequestPrepared ||
    fixture.runtimeTrafficAuthorizationRequestStatus !== REQUEST_READY_STATUS ||
    fixture.runtimeTrafficAuthorizationRequestScope !== REQUEST_READINESS_SCOPE
  ) {
    blockers.push("runtime traffic authorization request readiness must be prepared only");
  }
  if (fixture.runtimeTrafficAuthorizationRequestSubmitted) {
    blockers.push("runtime traffic authorization request must not be submitted in ORO-5U");
  }
  if (
    fixture.runtimeTrafficAuthorizationDecisionIssued ||
    fixture.runtimeTrafficAuthorizationGranted ||
    fixture.runtimeTrafficAllowed ||
    fixture.runtimeTrafficEnabled
  ) {
    blockers.push("runtime traffic must remain undecided, ungranted, and disabled");
  }
  if (
    fixture.liveTrafficAuthorizationRequestSubmitted ||
    fixture.liveTrafficAuthorizationDecisionIssued ||
    fixture.liveTrafficAllowed ||
    fixture.liveTrafficEnabled
  ) {
    blockers.push("live traffic must remain outside ORO-5U");
  }

  const missingEvidence = [
    ["failClosedAliasValidationEvidencePresent", fixture.failClosedAliasValidationEvidencePresent],
    ["noMutationEvidencePresent", fixture.noMutationEvidencePresent],
    ["rollbackPlanPresent", fixture.rollbackPlanPresent],
    ["monitoringPlanPresent", fixture.monitoringPlanPresent],
    ["auditLogPlanPresent", fixture.auditLogPlanPresent],
    ["idempotencyPlanPresent", fixture.idempotencyPlanPresent],
    ["sanitizedResponsePlanPresent", fixture.sanitizedResponsePlanPresent],
    ["rateLimitPlanPresent", fixture.rateLimitPlanPresent],
    ["manualHoldPlanPresent", fixture.manualHoldPlanPresent],
    ["emergencyDisablePlanPresent", fixture.emergencyDisablePlanPresent],
  ].filter(([, value]) => value !== true);
  if (missingEvidence.length > 0) {
    blockers.push("runtime traffic request readiness evidence checklist must be complete");
  }

  if (fixture.srcAppChangedInOro5u) {
    blockers.push("src/app.js must not change in ORO-5U");
  }
  if (fixture.runtimeRouteControllerChangedInOro5u) {
    blockers.push("runtime route/controller files must not change in ORO-5U");
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
    !fixture.nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission ||
    !fixture.nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision ||
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
    runtimeTrafficAuthorizationRequestReadinessBoundaryResult: result,
    dependsOnOro5tPublicAliasPostImplementationValidation:
      fixture.dependsOnOro5tPublicAliasPostImplementationValidation,
    publicAliasPostImplementationValidationFromOro5t:
      pass && fixture.publicAliasPostImplementationValidationFromOro5t,
    runtimeTrafficAuthorizationRequestReadinessBoundaryEntered:
      pass && fixture.runtimeTrafficAuthorizationRequestReadinessBoundaryEntered,
    runtimeTrafficAuthorizationRequestReadinessChecked:
      pass && fixture.runtimeTrafficAuthorizationRequestReadinessChecked,
    runtimeTrafficAuthorizationRequestReady:
      pass && fixture.runtimeTrafficAuthorizationRequestReady,
    runtimeTrafficAuthorizationRequestPrepared:
      pass && fixture.runtimeTrafficAuthorizationRequestPrepared,
    runtimeTrafficAuthorizationRequestSubmitted: false,
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
    failClosedAliasValidationEvidencePresent:
      pass && fixture.failClosedAliasValidationEvidencePresent,
    noMutationEvidencePresent: pass && fixture.noMutationEvidencePresent,
    rollbackPlanPresent: pass && fixture.rollbackPlanPresent,
    monitoringPlanPresent: pass && fixture.monitoringPlanPresent,
    auditLogPlanPresent: pass && fixture.auditLogPlanPresent,
    idempotencyPlanPresent: pass && fixture.idempotencyPlanPresent,
    sanitizedResponsePlanPresent: pass && fixture.sanitizedResponsePlanPresent,
    rateLimitPlanPresent: pass && fixture.rateLimitPlanPresent,
    manualHoldPlanPresent: pass && fixture.manualHoldPlanPresent,
    emergencyDisablePlanPresent: pass && fixture.emergencyDisablePlanPresent,
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
    nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission:
      fixture.nextPhaseRequiresRuntimeTrafficAuthorizationRequestSubmission,
    nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision:
      fixture.nextPhaseRequiresSeparateRuntimeTrafficAuthorizationDecision,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      fixture.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
  input = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(
  input = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput()
) {
  const summary =
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary(input);
  return {
    valid:
      summary.runtimeTrafficAuthorizationRequestReadinessBoundaryResult === PASS,
    runtimeTrafficAuthorizationRequestReadinessBoundaryResult:
      summary.runtimeTrafficAuthorizationRequestReadinessBoundaryResult,
    publicAliasPostImplementationValidationFromOro5t:
      summary.publicAliasPostImplementationValidationFromOro5t,
    runtimeTrafficAuthorizationRequestReady:
      summary.runtimeTrafficAuthorizationRequestReady,
    runtimeTrafficAuthorizationRequestPrepared:
      summary.runtimeTrafficAuthorizationRequestPrepared,
    runtimeTrafficAuthorizationRequestSubmitted:
      summary.runtimeTrafficAuthorizationRequestSubmitted,
    runtimeTrafficAuthorizationDecisionIssued:
      summary.runtimeTrafficAuthorizationDecisionIssued,
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

function assertOro5uReadinessFromOro5t(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  if (
    summary.runtimeTrafficAuthorizationRequestReadinessBoundaryResult !== PASS ||
    !summary.publicAliasPostImplementationValidationFromOro5t ||
    summary.apiBalancePublicAliasMode !== FAIL_CLOSED_NO_MUTATION ||
    summary.apiTransactionPublicAliasMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    throw new Error("ORO-5U requires passed ORO-5T public alias validation.");
  }
  return true;
}

function assertOro5uRequestPreparedOnly(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  if (
    !summary.runtimeTrafficAuthorizationRequestReady ||
    !summary.runtimeTrafficAuthorizationRequestPrepared ||
    summary.runtimeTrafficAuthorizationRequestSubmitted
  ) {
    throw new Error("ORO-5U must prepare readiness without request submission.");
  }
  return true;
}

function assertOro5uNoRuntimeDecisionOrGrant(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  if (
    summary.runtimeTrafficAuthorizationDecisionIssued ||
    summary.runtimeTrafficAuthorizationGranted ||
    summary.runtimeTrafficAllowed ||
    summary.runtimeTrafficEnabled
  ) {
    throw new Error("ORO-5U must not decide, grant, or enable runtime traffic.");
  }
  return true;
}

function assertOro5uNoLiveTraffic(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  if (
    summary.liveTrafficAuthorizationRequestSubmitted ||
    summary.liveTrafficAuthorizationDecisionIssued ||
    summary.liveTrafficAllowed ||
    summary.liveTrafficEnabled
  ) {
    throw new Error("ORO-5U must not submit, decide, or enable live traffic.");
  }
  return true;
}

function assertOro5uEvidenceChecklist(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  const missing = [
    "failClosedAliasValidationEvidencePresent",
    "noMutationEvidencePresent",
    "rollbackPlanPresent",
    "monitoringPlanPresent",
    "auditLogPlanPresent",
    "idempotencyPlanPresent",
    "sanitizedResponsePlanPresent",
    "rateLimitPlanPresent",
    "manualHoldPlanPresent",
    "emergencyDisablePlanPresent",
  ].filter((key) => summary[key] !== true);
  if (missing.length > 0) {
    throw new Error(`ORO-5U evidence checklist incomplete: ${missing.join(", ")}`);
  }
  return true;
}

function assertOro5uNoRuntimeMoneyMutation(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
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
    throw new Error(`ORO-5U runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5uNoExternalNetwork(
  summary = buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5U external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  REQUEST_READY_STATUS,
  REQUEST_READINESS_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY_STATUS,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
  validateOro5uRuntimeTrafficAuthorizationRequestReadinessBoundary,
  assertOro5uReadinessFromOro5t,
  assertOro5uRequestPreparedOnly,
  assertOro5uNoRuntimeDecisionOrGrant,
  assertOro5uNoLiveTraffic,
  assertOro5uEvidenceChecklist,
  assertOro5uNoRuntimeMoneyMutation,
  assertOro5uNoExternalNetwork,
};
