"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  PASS: ORO5O_PASS,
  buildOro5oPostMountValidationBoundary,
} = require("./oro5oPostMountValidationBoundary");

const PHASE = "ORO-5P";
const PASS = "PASS";
const HOLD = "HOLD";
const DECISION_ISSUED = "decision_issued";
const VALIDATED_PASSED = "validated_passed";
const READINESS_STATUS = "ready_for_request_submission_boundary";
const READINESS_SCOPE = "public_alias_authorization_request_readiness_only";

const ORO5P_POST_MOUNT_VALIDATION_DECISION_BOUNDARY_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  DECISION_ISSUED,
  VALIDATED_PASSED,
  READINESS_STATUS,
  READINESS_SCOPE,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
});

const BASELINE_ORO5O_SUMMARY = buildOro5oPostMountValidationBoundary();

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

function buildOro5pPostMountValidationDecisionBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathPostMountValidationDecisionPublicAliasReadinessFixture",
    phase: PHASE,
    oro5oPostMountValidationEvidence: {
      dependsOnOro5oPostMountValidation: true,
      oro5oPostMountValidationPassed:
        BASELINE_ORO5O_SUMMARY.postMountValidationBoundaryResult === ORO5O_PASS,
      internalOroPlayMountVerifiedFromOro5o:
        BASELINE_ORO5O_SUMMARY.internalOroPlayMountVerified === true,
      failClosedRouteVerificationPassedFromOro5o:
        BASELINE_ORO5O_SUMMARY.failClosedRouteVerificationPassed === true,
      routeMountPatchImplementedFromOro5n:
        BASELINE_ORO5O_SUMMARY.routeMountPatchImplementedFromOro5n === true,
      routeMountPatchImplementationScope:
        BASELINE_ORO5O_SUMMARY.routeMountPatchImplementationScope,
      oroplayInternalCallbackRouteMounted:
        BASELINE_ORO5O_SUMMARY.oroplayInternalCallbackRouteMounted,
      oroplayBalanceRouteMounted: BASELINE_ORO5O_SUMMARY.oroplayBalanceRouteMounted,
      oroplayTransactionRouteMounted:
        BASELINE_ORO5O_SUMMARY.oroplayTransactionRouteMounted,
      oroplayBalanceRouteMode: BASELINE_ORO5O_SUMMARY.oroplayBalanceRouteMode,
      oroplayTransactionRouteMode: BASELINE_ORO5O_SUMMARY.oroplayTransactionRouteMode,
    },
    decisionEvidence: {
      postMountValidationDecisionBoundaryEntered: true,
      postMountValidationDecisionChecked: true,
      postMountValidationDecisionIssued: true,
      postMountValidationDecisionStatus: DECISION_ISSUED,
      postMountValidationDecisionResult: VALIDATED_PASSED,
    },
    readinessEvidence: {
      publicAliasAuthorizationRequestReadinessPrepared: true,
      publicAliasAuthorizationRequestReadinessStatus: READINESS_STATUS,
      publicAliasAuthorizationRequestScope: READINESS_SCOPE,
      publicAliasAuthorizationRequestSubmitted: false,
      publicAliasAuthorizationDecisionIssued: false,
      publicAliasAuthorizationGranted: false,
      publicAliasAllowed: false,
      publicAliasImplemented: false,
      apiBalancePublicAliasMounted: false,
      apiTransactionPublicAliasMounted: false,
      apiBalancePublicAliasActive: false,
      apiTransactionPublicAliasActive: false,
    },
    fileEvidence: {
      srcAppChangedInOro5p: false,
      runtimeRouteControllerChangedInOro5p: false,
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
      nextPhaseRequiresPublicAliasAuthorizationRequestSubmission: true,
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
  const baseline = buildOro5pPostMountValidationDecisionBoundaryInput();
  const merged = deepMerge(baseline, source);
  const oro5o = isPlainObject(merged.oro5oPostMountValidationEvidence)
    ? merged.oro5oPostMountValidationEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence) ? merged.decisionEvidence : {};
  const readiness = isPlainObject(merged.readinessEvidence) ? merged.readinessEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const next = isPlainObject(merged.nextPhaseEvidence) ? merged.nextPhaseEvidence : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    dependsOnOro5oPostMountValidation: readBoolean(
      oro5o,
      "dependsOnOro5oPostMountValidation",
      true
    ),
    oro5oPostMountValidationPassed: readBoolean(
      oro5o,
      "oro5oPostMountValidationPassed",
      true
    ),
    internalOroPlayMountVerifiedFromOro5o: readBoolean(
      oro5o,
      "internalOroPlayMountVerifiedFromOro5o",
      true
    ),
    failClosedRouteVerificationPassedFromOro5o: readBoolean(
      oro5o,
      "failClosedRouteVerificationPassedFromOro5o",
      true
    ),
    routeMountPatchImplementedFromOro5n: readBoolean(
      oro5o,
      "routeMountPatchImplementedFromOro5n",
      true
    ),
    routeMountPatchImplementationScope: readString(
      oro5o,
      "routeMountPatchImplementationScope",
      INTERNAL_FAIL_CLOSED_SCOPE
    ),
    oroplayInternalCallbackRouteMounted: readBoolean(
      oro5o,
      "oroplayInternalCallbackRouteMounted",
      true
    ),
    oroplayBalanceRouteMounted: readBoolean(oro5o, "oroplayBalanceRouteMounted", true),
    oroplayTransactionRouteMounted: readBoolean(
      oro5o,
      "oroplayTransactionRouteMounted",
      true
    ),
    oroplayBalanceRouteMode: readString(
      oro5o,
      "oroplayBalanceRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    oroplayTransactionRouteMode: readString(
      oro5o,
      "oroplayTransactionRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    postMountValidationDecisionBoundaryEntered: readBoolean(
      decision,
      "postMountValidationDecisionBoundaryEntered",
      true
    ),
    postMountValidationDecisionChecked: readBoolean(
      decision,
      "postMountValidationDecisionChecked",
      true
    ),
    postMountValidationDecisionIssued: readBoolean(
      decision,
      "postMountValidationDecisionIssued",
      true
    ),
    postMountValidationDecisionStatus: readString(
      decision,
      "postMountValidationDecisionStatus",
      DECISION_ISSUED
    ),
    postMountValidationDecisionResult: readString(
      decision,
      "postMountValidationDecisionResult",
      VALIDATED_PASSED
    ),
    srcAppChangedInOro5p: readBoolean(files, "srcAppChangedInOro5p", false),
    runtimeRouteControllerChangedInOro5p: readBoolean(
      files,
      "runtimeRouteControllerChangedInOro5p",
      false
    ),
    publicAliasAuthorizationRequestReadinessPrepared: readBoolean(
      readiness,
      "publicAliasAuthorizationRequestReadinessPrepared",
      true
    ),
    publicAliasAuthorizationRequestReadinessStatus: readString(
      readiness,
      "publicAliasAuthorizationRequestReadinessStatus",
      READINESS_STATUS
    ),
    publicAliasAuthorizationRequestScope: readString(
      readiness,
      "publicAliasAuthorizationRequestScope",
      READINESS_SCOPE
    ),
    publicAliasAuthorizationRequestSubmitted: readBoolean(
      readiness,
      "publicAliasAuthorizationRequestSubmitted",
      false
    ),
    publicAliasAuthorizationDecisionIssued: readBoolean(
      readiness,
      "publicAliasAuthorizationDecisionIssued",
      false
    ),
    publicAliasAuthorizationGranted: readBoolean(
      readiness,
      "publicAliasAuthorizationGranted",
      false
    ),
    publicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(readiness, "publicAliasImplemented", false),
    apiBalancePublicAliasMounted: readBoolean(
      readiness,
      "apiBalancePublicAliasMounted",
      false
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      readiness,
      "apiTransactionPublicAliasMounted",
      false
    ),
    apiBalancePublicAliasActive: readBoolean(
      readiness,
      "apiBalancePublicAliasActive",
      false
    ),
    apiTransactionPublicAliasActive: readBoolean(
      readiness,
      "apiTransactionPublicAliasActive",
      false
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
    nextPhaseRequiresPublicAliasAuthorizationRequestSubmission: readBoolean(
      next,
      "nextPhaseRequiresPublicAliasAuthorizationRequestSubmission",
      true
    ),
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

  if (!fixture.dependsOnOro5oPostMountValidation) {
    blockers.push("ORO-5O post-mount validation dependency is required");
  }
  if (!fixture.oro5oPostMountValidationPassed) {
    blockers.push("ORO-5O post-mount validation must pass before ORO-5P");
  }
  if (!fixture.internalOroPlayMountVerifiedFromOro5o) {
    blockers.push("internal /api/oroplay mount must be verified from ORO-5O");
  }
  if (!fixture.failClosedRouteVerificationPassedFromOro5o) {
    blockers.push("fail-closed route verification must pass from ORO-5O");
  }
  if (!fixture.routeMountPatchImplementedFromOro5n) {
    blockers.push("ORO-5N route mount patch implementation evidence is required");
  }
  if (fixture.routeMountPatchImplementationScope !== INTERNAL_FAIL_CLOSED_SCOPE) {
    blockers.push("route mount patch scope must remain internal fail-closed only");
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
    !fixture.postMountValidationDecisionBoundaryEntered ||
    !fixture.postMountValidationDecisionChecked ||
    !fixture.postMountValidationDecisionIssued ||
    fixture.postMountValidationDecisionStatus !== DECISION_ISSUED ||
    fixture.postMountValidationDecisionResult !== VALIDATED_PASSED
  ) {
    blockers.push("post-mount validation decision must be issued as validated passed");
  }
  if (fixture.srcAppChangedInOro5p) {
    blockers.push("src/app.js must not change in ORO-5P");
  }
  if (fixture.runtimeRouteControllerChangedInOro5p) {
    blockers.push("runtime route/controller files must not change in ORO-5P");
  }
  if (
    !fixture.publicAliasAuthorizationRequestReadinessPrepared ||
    fixture.publicAliasAuthorizationRequestReadinessStatus !== READINESS_STATUS ||
    fixture.publicAliasAuthorizationRequestScope !== READINESS_SCOPE
  ) {
    blockers.push("public alias authorization request readiness must be prepared only");
  }
  if (fixture.publicAliasAuthorizationRequestSubmitted) {
    blockers.push("public alias authorization request must not be submitted in ORO-5P");
  }
  if (fixture.publicAliasAuthorizationDecisionIssued) {
    blockers.push("public alias authorization decision must not be issued in ORO-5P");
  }
  if (fixture.publicAliasAuthorizationGranted || fixture.publicAliasAllowed) {
    blockers.push("public alias authorization must not be granted in ORO-5P");
  }
  if (
    fixture.publicAliasImplemented ||
    fixture.apiBalancePublicAliasMounted ||
    fixture.apiTransactionPublicAliasMounted ||
    fixture.apiBalancePublicAliasActive ||
    fixture.apiTransactionPublicAliasActive
  ) {
    blockers.push("public aliases must not be implemented or active in ORO-5P");
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
    !fixture.nextPhaseRequiresPublicAliasAuthorizationRequestSubmission ||
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
    postMountValidationDecisionBoundaryResult: result,
    postMountValidationDecisionBoundaryEntered:
      pass && fixture.postMountValidationDecisionBoundaryEntered,
    postMountValidationDecisionChecked:
      pass && fixture.postMountValidationDecisionChecked,
    postMountValidationDecisionIssued:
      pass && fixture.postMountValidationDecisionIssued,
    postMountValidationDecisionStatus: pass
      ? fixture.postMountValidationDecisionStatus
      : HOLD,
    postMountValidationDecisionResult: pass
      ? fixture.postMountValidationDecisionResult
      : HOLD,
    dependsOnOro5oPostMountValidation: fixture.dependsOnOro5oPostMountValidation,
    oro5oPostMountValidationPassed: pass && fixture.oro5oPostMountValidationPassed,
    internalOroPlayMountVerifiedFromOro5o:
      pass && fixture.internalOroPlayMountVerifiedFromOro5o,
    failClosedRouteVerificationPassedFromOro5o:
      pass && fixture.failClosedRouteVerificationPassedFromOro5o,
    routeMountPatchImplementedFromOro5n:
      pass && fixture.routeMountPatchImplementedFromOro5n,
    routeMountPatchImplementationScope: pass
      ? fixture.routeMountPatchImplementationScope
      : HOLD,
    srcAppChangedInOro5p: false,
    runtimeRouteControllerChangedInOro5p: false,
    publicAliasAuthorizationRequestReadinessPrepared:
      pass && fixture.publicAliasAuthorizationRequestReadinessPrepared,
    publicAliasAuthorizationRequestReadinessStatus: pass
      ? fixture.publicAliasAuthorizationRequestReadinessStatus
      : HOLD,
    publicAliasAuthorizationRequestScope: pass
      ? fixture.publicAliasAuthorizationRequestScope
      : HOLD,
    publicAliasAuthorizationRequestSubmitted: false,
    publicAliasAuthorizationDecisionIssued: false,
    publicAliasAuthorizationGranted: false,
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
    nextPhaseRequiresPublicAliasAuthorizationRequestSubmission:
      fixture.nextPhaseRequiresPublicAliasAuthorizationRequestSubmission,
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

function buildOro5pPostMountValidationDecisionBoundary(
  input = buildOro5pPostMountValidationDecisionBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5pPostMountValidationDecisionBoundary(
  input = buildOro5pPostMountValidationDecisionBoundaryInput()
) {
  const summary = buildOro5pPostMountValidationDecisionBoundary(input);
  return {
    valid: summary.postMountValidationDecisionBoundaryResult === PASS,
    postMountValidationDecisionBoundaryResult:
      summary.postMountValidationDecisionBoundaryResult,
    postMountValidationDecisionIssued: summary.postMountValidationDecisionIssued,
    oro5oPostMountValidationPassed: summary.oro5oPostMountValidationPassed,
    publicAliasAuthorizationRequestReadinessPrepared:
      summary.publicAliasAuthorizationRequestReadinessPrepared,
    publicAliasAuthorizationRequestSubmitted:
      summary.publicAliasAuthorizationRequestSubmitted,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
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

function buildOro5pSafetyLockSummary(
  input = buildOro5pPostMountValidationDecisionBoundaryInput()
) {
  const summary = buildOro5pPostMountValidationDecisionBoundary(input);
  return {
    phase: PHASE,
    publicAliasAuthorizationRequestSubmitted:
      summary.publicAliasAuthorizationRequestSubmitted,
    publicAliasAuthorizationDecisionIssued:
      summary.publicAliasAuthorizationDecisionIssued,
    publicAliasAuthorizationGranted: summary.publicAliasAuthorizationGranted,
    publicAliasAllowed: summary.publicAliasAllowed,
    publicAliasImplemented: summary.publicAliasImplemented,
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

function assertOro5pPostMountValidationPassed(
  summary = buildOro5pPostMountValidationDecisionBoundary()
) {
  if (
    summary.postMountValidationDecisionBoundaryResult !== PASS ||
    !summary.oro5oPostMountValidationPassed ||
    !summary.internalOroPlayMountVerifiedFromOro5o ||
    !summary.failClosedRouteVerificationPassedFromOro5o
  ) {
    throw new Error("ORO-5P requires passed ORO-5O post-mount validation.");
  }
  return true;
}

function assertOro5pNoPublicAliasRequestSubmission(
  summary = buildOro5pPostMountValidationDecisionBoundary()
) {
  if (summary.publicAliasAuthorizationRequestSubmitted) {
    throw new Error("ORO-5P must not submit public alias authorization request.");
  }
  return true;
}

function assertOro5pNoPublicAliasDecision(
  summary = buildOro5pPostMountValidationDecisionBoundary()
) {
  if (
    summary.publicAliasAuthorizationDecisionIssued ||
    summary.publicAliasAuthorizationGranted ||
    summary.publicAliasAllowed
  ) {
    throw new Error("ORO-5P must not issue or grant public alias authorization.");
  }
  return true;
}

function assertOro5pNoPublicAliasImplementation(
  summary = buildOro5pPostMountValidationDecisionBoundary()
) {
  if (
    summary.publicAliasImplemented ||
    summary.apiBalancePublicAliasMounted ||
    summary.apiTransactionPublicAliasMounted ||
    summary.apiBalancePublicAliasActive ||
    summary.apiTransactionPublicAliasActive
  ) {
    throw new Error("ORO-5P must not implement public aliases.");
  }
  return true;
}

function assertOro5pNoRuntimeMoneyMutation(
  summary = buildOro5pPostMountValidationDecisionBoundary()
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
    throw new Error(`ORO-5P runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5pNoExternalNetwork(
  summary = buildOro5pPostMountValidationDecisionBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5P external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  DECISION_ISSUED,
  VALIDATED_PASSED,
  READINESS_STATUS,
  READINESS_SCOPE,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5P_POST_MOUNT_VALIDATION_DECISION_BOUNDARY_STATUS,
  buildOro5pPostMountValidationDecisionBoundaryInput,
  buildOro5pPostMountValidationDecisionBoundary,
  validateOro5pPostMountValidationDecisionBoundary,
  buildOro5pSafetyLockSummary,
  assertOro5pPostMountValidationPassed,
  assertOro5pNoPublicAliasRequestSubmission,
  assertOro5pNoPublicAliasDecision,
  assertOro5pNoPublicAliasImplementation,
  assertOro5pNoRuntimeMoneyMutation,
  assertOro5pNoExternalNetwork,
};
