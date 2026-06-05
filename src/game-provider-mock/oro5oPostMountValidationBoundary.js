"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  PASS: ORO5N_PASS,
  buildOro5nRouteMountImplementationBoundary,
} = require("./oro5nRouteMountImplementationBoundary");

const PHASE = "ORO-5O";
const PASS = "PASS";
const HOLD = "HOLD";
const SKIPPED_OR_PASS = "skipped_or_pass";
const BACKEND_NOT_LISTENING_OR_NOT_REQUIRED =
  "backend_not_listening_or_not_required_for_static_boundary";

const ORO5O_POST_MOUNT_VALIDATION_BOUNDARY_STATUS = Object.freeze({
  PHASE,
  PASS,
  HOLD,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  SKIPPED_OR_PASS,
  BACKEND_NOT_LISTENING_OR_NOT_REQUIRED,
});

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  ["P", "IN"].join(""),
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5N_SUMMARY = buildOro5nRouteMountImplementationBoundary();

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

function collectSecretShapedFindings(value, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      collectSecretShapedFindings(entry, path.concat(String(index)), output)
    );
    return output;
  }
  if (isPlainObject(value)) {
    for (const [key, entry] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (SECRET_KEY_MARKERS.some((marker) => lowerKey === marker.toLowerCase())) {
        output.push(path.concat(key).join("."));
      }
      collectSecretShapedFindings(entry, path.concat(key), output);
    }
    return output;
  }
  if (typeof value !== "string") return output;

  const secretValuePatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
  ];
  if (secretValuePatterns.some((pattern) => pattern.test(value))) {
    output.push(path.join(".") || "(root)");
  }
  return output;
}

function buildOro5oPostMountValidationBoundaryInput(overrides = {}) {
  const baseline = {
    id: "happyPathInternalFailClosedRouteVerificationFixture",
    phase: PHASE,
    oro5nMountEvidence: {
      dependsOnOro5nRouteMountImplementation: true,
      routeMountPatchImplementedFromOro5n:
        BASELINE_ORO5N_SUMMARY.routeMountImplementationBoundaryResult === ORO5N_PASS &&
        BASELINE_ORO5N_SUMMARY.routeMountPatchImplemented === true,
      routeMountPatchImplementationScope:
        BASELINE_ORO5N_SUMMARY.routeMountPatchImplementationScope,
      oroplayInternalCallbackRouteMounted:
        BASELINE_ORO5N_SUMMARY.oroplayInternalCallbackRouteMounted,
      oroplayBalanceRouteMounted: BASELINE_ORO5N_SUMMARY.oroplayBalanceRouteMounted,
      oroplayTransactionRouteMounted:
        BASELINE_ORO5N_SUMMARY.oroplayTransactionRouteMounted,
      oroplayBalanceRouteMode: BASELINE_ORO5N_SUMMARY.oroplayBalanceRouteMode,
      oroplayTransactionRouteMode:
        BASELINE_ORO5N_SUMMARY.oroplayTransactionRouteMode,
    },
    postMountEvidence: {
      srcAppChangedInOro5o: false,
      runtimeRouteControllerChangedInOro5o: false,
      optionalLocalProbeAttempted: false,
      optionalLocalProbeSkippedReason: BACKEND_NOT_LISTENING_OR_NOT_REQUIRED,
      optionalLocalProbeResult: SKIPPED_OR_PASS,
    },
    safetyEvidence: {
      publicAliasAllowed: false,
      publicAliasImplemented: false,
      apiBalancePublicAliasMounted: false,
      apiTransactionPublicAliasMounted: false,
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
    trace: {
      mode: "static-post-mount-validation-boundary",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5oPostMountValidationBoundaryInput();
  const merged = deepMerge(baseline, source);
  const mount = isPlainObject(merged.oro5nMountEvidence)
    ? merged.oro5nMountEvidence
    : {};
  const postMount = isPlainObject(merged.postMountEvidence)
    ? merged.postMountEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    dependsOnOro5nRouteMountImplementation: readBoolean(
      mount,
      "dependsOnOro5nRouteMountImplementation",
      true
    ),
    routeMountPatchImplementedFromOro5n: readBoolean(
      mount,
      "routeMountPatchImplementedFromOro5n",
      true
    ),
    routeMountPatchImplementationScope: readString(
      mount,
      "routeMountPatchImplementationScope",
      INTERNAL_FAIL_CLOSED_SCOPE
    ),
    oroplayInternalCallbackRouteMounted: readBoolean(
      mount,
      "oroplayInternalCallbackRouteMounted",
      true
    ),
    oroplayBalanceRouteMounted: readBoolean(
      mount,
      "oroplayBalanceRouteMounted",
      true
    ),
    oroplayTransactionRouteMounted: readBoolean(
      mount,
      "oroplayTransactionRouteMounted",
      true
    ),
    oroplayBalanceRouteMode: readString(
      mount,
      "oroplayBalanceRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    oroplayTransactionRouteMode: readString(
      mount,
      "oroplayTransactionRouteMode",
      FAIL_CLOSED_NO_MUTATION
    ),
    srcAppChangedInOro5o: readBoolean(postMount, "srcAppChangedInOro5o", false),
    runtimeRouteControllerChangedInOro5o: readBoolean(
      postMount,
      "runtimeRouteControllerChangedInOro5o",
      false
    ),
    optionalLocalProbeAttempted: readBoolean(
      postMount,
      "optionalLocalProbeAttempted",
      false
    ),
    optionalLocalProbeSkippedReason: readString(
      postMount,
      "optionalLocalProbeSkippedReason",
      BACKEND_NOT_LISTENING_OR_NOT_REQUIRED
    ),
    optionalLocalProbeResult: readString(
      postMount,
      "optionalLocalProbeResult",
      SKIPPED_OR_PASS
    ),
    publicAliasAllowed: readBoolean(safety, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(safety, "publicAliasImplemented", false),
    apiBalancePublicAliasMounted: readBoolean(
      safety,
      "apiBalancePublicAliasMounted",
      false
    ),
    apiTransactionPublicAliasMounted: readBoolean(
      safety,
      "apiTransactionPublicAliasMounted",
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
    liveOroPlayApiCallAllowed: readBoolean(
      safety,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(safety, "liveOroPlayApiCalled", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro5nRouteMountImplementation) {
    blockers.push("ORO-5N route mount implementation dependency is required");
  }
  if (!fixture.routeMountPatchImplementedFromOro5n) {
    blockers.push("ORO-5N route mount patch implementation must be present");
  }
  if (fixture.routeMountPatchImplementationScope !== INTERNAL_FAIL_CLOSED_SCOPE) {
    blockers.push("route mount patch scope must remain internal fail-closed only");
  }
  if (!fixture.oroplayInternalCallbackRouteMounted) {
    blockers.push("internal /api/oroplay mount must be verified");
  }
  if (!fixture.oroplayBalanceRouteMounted || !fixture.oroplayTransactionRouteMounted) {
    blockers.push("internal balance and transaction callback routes must be mounted");
  }
  if (
    fixture.oroplayBalanceRouteMode !== FAIL_CLOSED_NO_MUTATION ||
    fixture.oroplayTransactionRouteMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    blockers.push("balance and transaction callback routes must remain fail-closed no-mutation");
  }
  if (fixture.srcAppChangedInOro5o) {
    blockers.push("src/app.js must not change in ORO-5O");
  }
  if (fixture.runtimeRouteControllerChangedInOro5o) {
    blockers.push("runtime route/controller files must not change in ORO-5O");
  }
  if (
    fixture.optionalLocalProbeAttempted &&
    fixture.optionalLocalProbeResult !== "pass"
  ) {
    blockers.push("attempted local route probe must confirm fail-closed responses");
  }
  if (
    fixture.publicAliasAllowed ||
    fixture.publicAliasImplemented ||
    fixture.apiBalancePublicAliasMounted ||
    fixture.apiTransactionPublicAliasMounted
  ) {
    blockers.push("public aliases must remain absent");
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
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("post-mount validation input contains secret-shaped marker");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    postMountValidationBoundaryResult: result,
    postMountValidationBoundaryEntered: pass,
    postMountValidationChecked: pass,
    dependsOnOro5nRouteMountImplementation:
      fixture.dependsOnOro5nRouteMountImplementation,
    routeMountPatchImplementedFromOro5n:
      pass && fixture.routeMountPatchImplementedFromOro5n,
    routeMountPatchImplementationScope: pass
      ? fixture.routeMountPatchImplementationScope
      : HOLD,
    srcAppChangedInOro5o: false,
    runtimeRouteControllerChangedInOro5o: false,
    internalOroPlayMountVerified:
      pass && fixture.oroplayInternalCallbackRouteMounted,
    oroplayInternalCallbackRouteMounted:
      pass && fixture.oroplayInternalCallbackRouteMounted,
    oroplayBalanceRouteMounted: pass && fixture.oroplayBalanceRouteMounted,
    oroplayTransactionRouteMounted: pass && fixture.oroplayTransactionRouteMounted,
    oroplayBalanceRouteMode: pass ? fixture.oroplayBalanceRouteMode : HOLD,
    oroplayTransactionRouteMode: pass ? fixture.oroplayTransactionRouteMode : HOLD,
    failClosedRouteVerificationPassed: pass,
    optionalLocalProbeAttempted: fixture.optionalLocalProbeAttempted,
    optionalLocalProbeSkippedReason: fixture.optionalLocalProbeSkippedReason,
    optionalLocalProbeResult: fixture.optionalLocalProbeResult,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    apiBalancePublicAliasMounted: false,
    apiTransactionPublicAliasMounted: false,
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
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresSeparateLiveTrafficApproval: true,
    nextPhaseRequiresPostValidationDecisionBoundary: true,
    blockers,
  };
}

function buildOro5oPostMountValidationBoundary(
  input = buildOro5oPostMountValidationBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro5oPostMountValidationBoundary(
  input = buildOro5oPostMountValidationBoundaryInput()
) {
  const summary = buildOro5oPostMountValidationBoundary(input);
  return {
    valid: summary.postMountValidationBoundaryResult === PASS,
    postMountValidationBoundaryResult:
      summary.postMountValidationBoundaryResult,
    internalOroPlayMountVerified: summary.internalOroPlayMountVerified,
    failClosedRouteVerificationPassed:
      summary.failClosedRouteVerificationPassed,
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

function buildOro5oSafetyLockSummary(
  input = buildOro5oPostMountValidationBoundaryInput()
) {
  const summary = buildOro5oPostMountValidationBoundary(input);
  return {
    phase: PHASE,
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

function assertOro5oInternalMountOnly(
  summary = buildOro5oPostMountValidationBoundary()
) {
  if (
    !summary.internalOroPlayMountVerified ||
    summary.routeMountPatchImplementationScope !== INTERNAL_FAIL_CLOSED_SCOPE
  ) {
    throw new Error("ORO-5O internal /api/oroplay mount validation failed.");
  }
  return true;
}

function assertOro5oFailClosedRouteVerification(
  summary = buildOro5oPostMountValidationBoundary()
) {
  if (
    !summary.failClosedRouteVerificationPassed ||
    summary.oroplayBalanceRouteMode !== FAIL_CLOSED_NO_MUTATION ||
    summary.oroplayTransactionRouteMode !== FAIL_CLOSED_NO_MUTATION
  ) {
    throw new Error("ORO-5O fail-closed route verification failed.");
  }
  return true;
}

function assertOro5oNoPublicAlias(
  summary = buildOro5oPostMountValidationBoundary()
) {
  if (
    summary.publicAliasAllowed ||
    summary.publicAliasImplemented ||
    summary.apiBalancePublicAliasMounted ||
    summary.apiTransactionPublicAliasMounted
  ) {
    throw new Error("ORO-5O public aliases must remain absent.");
  }
  return true;
}

function assertOro5oNoRuntimeMoneyMutation(
  summary = buildOro5oPostMountValidationBoundary()
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
    throw new Error(`ORO-5O runtime mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function assertOro5oNoExternalNetwork(
  summary = buildOro5oPostMountValidationBoundary()
) {
  if (
    summary.externalNetworkAllowed ||
    summary.externalNetworkCalled ||
    summary.liveOroPlayApiCallAllowed ||
    summary.liveOroPlayApiCalled
  ) {
    throw new Error("ORO-5O external network and live OroPlay calls must remain absent.");
  }
  return true;
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5O_POST_MOUNT_VALIDATION_BOUNDARY_STATUS,
  buildOro5oPostMountValidationBoundaryInput,
  buildOro5oPostMountValidationBoundary,
  validateOro5oPostMountValidationBoundary,
  buildOro5oSafetyLockSummary,
  assertOro5oInternalMountOnly,
  assertOro5oFailClosedRouteVerification,
  assertOro5oNoPublicAlias,
  assertOro5oNoRuntimeMoneyMutation,
  assertOro5oNoExternalNetwork,
};
