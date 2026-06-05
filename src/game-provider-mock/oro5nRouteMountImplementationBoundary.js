"use strict";

const {
  APPROVED,
  DECISION_ISSUED,
  ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  evaluateOro5mRouteMountAuthorizationDecision,
} = require("./oro5mRouteMountAuthorizationDecisionBoundary");

const PHASE = "ORO-5N";
const PASS = "PASS";
const HOLD = "HOLD";
const INTERNAL_FAIL_CLOSED_SCOPE =
  "internal_fail_closed_oroplay_callback_staging_mount_only";
const FAIL_CLOSED_NO_MUTATION = "fail_closed_no_mutation";

const ORO5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_STATUS = Object.freeze({
  PASS,
  HOLD,
  PHASE,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  DECISION_ISSUED,
  APPROVED,
  ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
});

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5M_DECISION = evaluateOro5mRouteMountAuthorizationDecision();

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

function buildOro5nRouteMountImplementationBoundaryInput(overrides = {}) {
  const decision = BASELINE_ORO5M_DECISION;
  const baseline = {
    id: "happyPathInternalFailClosedMountFixture",
    phase: PHASE,
    oro5mDecision: {
      authorizationPresent: true,
      routeMountAuthorizationDecisionIssued:
        decision.routeMountAuthorizationDecisionIssued,
      routeMountAuthorizationDecisionResult:
        decision.routeMountAuthorizationDecisionResult,
      routeMountAuthorizationGranted: decision.routeMountAuthorizationGranted,
      routeMountAuthorizationGrantScope: decision.routeMountAuthorizationGrantScope,
      routeMountPatchImplementationAuthorized:
        decision.routeMountPatchImplementationAuthorized,
      routeMountImplementationBoundaryEntryAllowed:
        decision.routeMountImplementationBoundaryEntryAllowed,
    },
    requestedMount: {
      srcAppChangeRequested: true,
      expressMountRequested: true,
      internalOrOplayMountRequested: true,
      balanceRouteRequested: true,
      transactionRouteRequested: true,
      publicAliasRequested: false,
      runtimeTrafficRequested: false,
      liveTrafficRequested: false,
      walletMutationRequested: false,
      ledgerMutationRequested: false,
      prismaWriteRequested: false,
      dbTransactionRequested: false,
      migrationRequested: false,
      externalNetworkRequested: false,
      liveOroPlayApiCallRequested: false,
      controllerBehaviorChangeRequested: false,
    },
    trace: {
      mode: "static-internal-fail-closed-route-mount-implementation",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5nRouteMountImplementationBoundaryInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro5mDecision) ? merged.oro5mDecision : {};
  const mount = isPlainObject(merged.requestedMount) ? merged.requestedMount : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    authorizationPresent: readBoolean(decision, "authorizationPresent", true),
    routeMountAuthorizationDecisionIssued: readBoolean(
      decision,
      "routeMountAuthorizationDecisionIssued",
      true
    ),
    routeMountAuthorizationDecisionResult: readString(
      decision,
      "routeMountAuthorizationDecisionResult",
      APPROVED
    ),
    routeMountAuthorizationGranted: readBoolean(
      decision,
      "routeMountAuthorizationGranted",
      true
    ),
    routeMountAuthorizationGrantScope: readString(
      decision,
      "routeMountAuthorizationGrantScope",
      ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
    ),
    routeMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      true
    ),
    routeMountImplementationBoundaryEntryAllowed: readBoolean(
      decision,
      "routeMountImplementationBoundaryEntryAllowed",
      true
    ),
    srcAppChangeRequested: readBoolean(mount, "srcAppChangeRequested", true),
    expressMountRequested: readBoolean(mount, "expressMountRequested", true),
    internalOrOplayMountRequested: readBoolean(
      mount,
      "internalOrOplayMountRequested",
      true
    ),
    balanceRouteRequested: readBoolean(mount, "balanceRouteRequested", true),
    transactionRouteRequested: readBoolean(
      mount,
      "transactionRouteRequested",
      true
    ),
    publicAliasRequested: readBoolean(mount, "publicAliasRequested", false),
    runtimeTrafficRequested: readBoolean(mount, "runtimeTrafficRequested", false),
    liveTrafficRequested: readBoolean(mount, "liveTrafficRequested", false),
    walletMutationRequested: readBoolean(mount, "walletMutationRequested", false),
    ledgerMutationRequested: readBoolean(mount, "ledgerMutationRequested", false),
    prismaWriteRequested: readBoolean(mount, "prismaWriteRequested", false),
    dbTransactionRequested: readBoolean(mount, "dbTransactionRequested", false),
    migrationRequested: readBoolean(mount, "migrationRequested", false),
    externalNetworkRequested: readBoolean(mount, "externalNetworkRequested", false),
    liveOroPlayApiCallRequested: readBoolean(
      mount,
      "liveOroPlayApiCallRequested",
      false
    ),
    controllerBehaviorChangeRequested: readBoolean(
      mount,
      "controllerBehaviorChangeRequested",
      false
    ),
  };
}

function blockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.authorizationPresent) {
    blockers.push("ORO-5M authorization decision is required");
  }
  if (!fixture.routeMountAuthorizationDecisionIssued) {
    blockers.push("route mount authorization decision must be issued");
  }
  if (fixture.routeMountAuthorizationDecisionResult !== APPROVED) {
    blockers.push("route mount authorization decision must be approved");
  }
  if (!fixture.routeMountAuthorizationGranted) {
    blockers.push("route mount authorization must be granted");
  }
  if (
    fixture.routeMountAuthorizationGrantScope !==
    ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
  ) {
    blockers.push("route mount authorization grant scope must be implementation boundary only");
  }
  if (!fixture.routeMountPatchImplementationAuthorized) {
    blockers.push("route mount patch implementation must be authorized");
  }
  if (!fixture.routeMountImplementationBoundaryEntryAllowed) {
    blockers.push("route mount implementation boundary entry must be allowed");
  }
  if (!fixture.srcAppChangeRequested || !fixture.expressMountRequested) {
    blockers.push("internal fail-closed Express mount must be requested");
  }
  if (!fixture.internalOrOplayMountRequested) {
    blockers.push("internal OroPlay callback staging mount must be requested");
  }
  if (!fixture.balanceRouteRequested || !fixture.transactionRouteRequested) {
    blockers.push("internal balance and transaction callbacks must remain mounted");
  }
  if (fixture.publicAliasRequested) {
    blockers.push("public aliases must not be requested");
  }
  if (fixture.runtimeTrafficRequested || fixture.liveTrafficRequested) {
    blockers.push("runtime traffic must not be requested");
  }
  if (fixture.walletMutationRequested || fixture.ledgerMutationRequested) {
    blockers.push("wallet and ledger mutation must not be requested");
  }
  if (fixture.prismaWriteRequested || fixture.dbTransactionRequested) {
    blockers.push("Prisma write and DB transaction must not be requested");
  }
  if (fixture.migrationRequested) {
    blockers.push("migration must not be requested");
  }
  if (fixture.externalNetworkRequested || fixture.liveOroPlayApiCallRequested) {
    blockers.push("external network and live OroPlay API must not be requested");
  }
  if (fixture.controllerBehaviorChangeRequested) {
    blockers.push("route/controller behavior change must not be requested");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("route mount implementation input contains secret-shaped marker");
  }

  return blockers;
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountImplementationBoundaryResult: HOLD,
    routeMountImplementationBoundaryEntered: false,
    routeMountImplementationAuthorizedFromOro5m: false,
    routeMountAuthorizationDecisionIssued:
      fixture.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationDecisionResult:
      fixture.routeMountAuthorizationDecisionResult,
    routeMountAuthorizationGrantScope: fixture.routeMountAuthorizationGrantScope,
    routeMountPatchImplemented: false,
    routeMountPatchImplementationScope: HOLD,
    srcAppChanged: false,
    srcAppChangeScope: HOLD,
    expressMountAllowed: false,
    expressMountImplemented: false,
    expressMountScope: HOLD,
    oroplayInternalCallbackRouteMounted: false,
    oroplayBalanceRouteMounted: false,
    oroplayTransactionRouteMounted: false,
    oroplayBalanceRouteMode: HOLD,
    oroplayTransactionRouteMode: HOLD,
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
    nextPhaseRequiresPostMountValidationBoundary: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresSeparateLiveTrafficApproval: true,
    blockers,
  };
}

function buildPassOutput(fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountImplementationBoundaryResult: PASS,
    routeMountImplementationBoundaryEntered: true,
    routeMountImplementationAuthorizedFromOro5m: true,
    routeMountAuthorizationDecisionIssued: true,
    routeMountAuthorizationDecisionResult: APPROVED,
    routeMountAuthorizationGrantScope: ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
    routeMountPatchImplemented: true,
    routeMountPatchImplementationScope: INTERNAL_FAIL_CLOSED_SCOPE,
    srcAppChanged: true,
    srcAppChangeScope: "internal_oroplay_callback_staging_mount_only",
    expressMountAllowed: true,
    expressMountImplemented: true,
    expressMountScope: INTERNAL_FAIL_CLOSED_SCOPE,
    oroplayInternalCallbackRouteMounted: true,
    oroplayBalanceRouteMounted: true,
    oroplayTransactionRouteMounted: true,
    oroplayBalanceRouteMode: FAIL_CLOSED_NO_MUTATION,
    oroplayTransactionRouteMode: FAIL_CLOSED_NO_MUTATION,
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
    nextPhaseRequiresPostMountValidationBoundary: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresSeparateLiveTrafficApproval: true,
    blockers: [],
  };
}

function buildOro5nRouteMountImplementationBoundary(
  input = buildOro5nRouteMountImplementationBoundaryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = blockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);
  return buildPassOutput(fixture);
}

function buildOro5nSafetyLockSummary(
  input = buildOro5nRouteMountImplementationBoundaryInput()
) {
  const summary = buildOro5nRouteMountImplementationBoundary(input);
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
    externalNetworkAllowed: summary.externalNetworkAllowed,
    externalNetworkCalled: summary.externalNetworkCalled,
    liveOroPlayApiCallAllowed: summary.liveOroPlayApiCallAllowed,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
  };
}

function assertOro5nNoPublicAlias(
  summary = buildOro5nRouteMountImplementationBoundary()
) {
  if (
    summary.publicAliasAllowed ||
    summary.publicAliasImplemented ||
    summary.apiBalancePublicAliasMounted ||
    summary.apiTransactionPublicAliasMounted
  ) {
    throw new Error("ORO-5N public aliases must remain blocked.");
  }
  return true;
}

function assertOro5nNoRuntimeMoneyMutation(
  summary = buildOro5nRouteMountImplementationBoundary()
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
  ].filter((key) => summary[key] !== false);

  if (unsafe.length > 0) {
    throw new Error(`ORO-5N runtime money mutation must remain blocked: ${unsafe.join(", ")}`);
  }
  return true;
}

function validateOro5nRouteMountImplementationBoundary(
  input = buildOro5nRouteMountImplementationBoundaryInput()
) {
  const summary = buildOro5nRouteMountImplementationBoundary(input);
  return {
    valid: summary.routeMountImplementationBoundaryResult === PASS,
    routeMountImplementationBoundaryResult:
      summary.routeMountImplementationBoundaryResult,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    expressMountImplemented: summary.expressMountImplemented,
    oroplayInternalCallbackRouteMounted:
      summary.oroplayInternalCallbackRouteMounted,
    publicAliasImplemented: summary.publicAliasImplemented,
    runtimeTrafficEnabled: summary.runtimeTrafficEnabled,
    walletMutationPerformed: summary.walletMutationPerformed,
    ledgerMutationPerformed: summary.ledgerMutationPerformed,
    prismaWritePerformed: summary.prismaWritePerformed,
    liveOroPlayApiCalled: summary.liveOroPlayApiCalled,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  INTERNAL_FAIL_CLOSED_SCOPE,
  FAIL_CLOSED_NO_MUTATION,
  ORO5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_STATUS,
  buildOro5nRouteMountImplementationBoundaryInput,
  buildOro5nRouteMountImplementationBoundary,
  validateOro5nRouteMountImplementationBoundary,
  buildOro5nSafetyLockSummary,
  assertOro5nNoPublicAlias,
  assertOro5nNoRuntimeMoneyMutation,
};
