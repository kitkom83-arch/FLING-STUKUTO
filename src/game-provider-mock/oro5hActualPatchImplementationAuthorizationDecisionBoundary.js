"use strict";

const {
  PASS,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro5gActualPatchImplementationAuthorizationRequestInput,
  evaluateOro5gActualPatchImplementationAuthorizationRequest,
} = require("./oro5gActualPatchImplementationAuthorizationRequestBoundary");

const PHASE = "ORO-5H";
const FAIL = "FAIL";
const APPROVED = "approved";
const ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY =
  "actual_patch_implementation_execution_boundary_only";

const ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    DECISION_ISSUED,
    SUBMITTED_PENDING_DECISION,
    PENDING_DECISION,
    APPROVED,
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
    NOT_AUTHORIZED_FOR_MOUNT,
  });

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5G_SUMMARY =
  evaluateOro5gActualPatchImplementationAuthorizationRequest(
    buildOro5gActualPatchImplementationAuthorizationRequestInput()
  );

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

function buildOro5hActualPatchImplementationAuthorizationDecisionInput(
  overrides = {}
) {
  const oro5gSummary = BASELINE_ORO5G_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationAuthorizationDecisionIssued",
    phase: PHASE,
    oro5gRequest: {
      requestPresent: true,
      actualPatchImplementationAuthorizationRequestSubmitted:
        oro5gSummary.actualPatchImplementationAuthorizationRequestSubmitted,
      actualPatchImplementationAuthorizationRequestStatus:
        oro5gSummary.actualPatchImplementationAuthorizationRequestStatus,
      actualPatchImplementationAuthorizationRequestResult:
        oro5gSummary.actualPatchImplementationAuthorizationRequestResult,
      actualPatchImplementationAuthorizationDecisionIssued:
        oro5gSummary.actualPatchImplementationAuthorizationDecisionIssued,
      actualPatchImplementationAuthorizationGranted:
        oro5gSummary.actualPatchImplementationAuthorizationGranted,
      actualPatchImplementationAuthorized:
        oro5gSummary.actualPatchImplementationAuthorized,
      actualPatchImplementationImplemented:
        oro5gSummary.actualPatchImplementationImplemented,
      actualPatchImplementationExecutionStarted: false,
      actualPatchImplementationPatchApplied: false,
      routeMountPatchApproved: oro5gSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5gSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5gSummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro5gSummary.implementationExecutionApproved,
      routeMountAuthorization: oro5gSummary.routeMountAuthorization,
      expressMountAllowed: oro5gSummary.expressMountAllowed,
      expressMountImplemented: oro5gSummary.expressMountImplemented,
      publicAliasAllowed: oro5gSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5gSummary.runtimeTrafficAllowed,
    },
    decisionState: {
      actualPatchImplementationAuthorizationRequestSubmitted: true,
      actualPatchImplementationAuthorizationRequestStatus: DECISION_ISSUED,
      actualPatchImplementationAuthorizationRequestResult: APPROVED,
      actualPatchImplementationAuthorizationDecisionIssued: true,
      actualPatchImplementationAuthorizationDecisionResult: APPROVED,
      actualPatchImplementationAuthorizationGranted: true,
      actualPatchImplementationAuthorizationGrantScope:
        ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
      actualPatchImplementationAuthorized: true,
      actualPatchImplementationImplemented: false,
      actualPatchImplementationExecutionStarted: false,
      actualPatchImplementationPatchApplied: false,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
      nextPhaseRequiresSeparateRouteMountAuthorization: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    },
    implementationAttempt: {
      srcAppJsEditAttempted: false,
      routeControllerRuntimeChangeAttempted: false,
      expressMountImplementationAttempted: false,
      walletMutationAttempted: false,
      ledgerMutationAttempted: false,
      prismaWriteAttempted: false,
      dbTransactionAttempted: false,
      migrationAttempted: false,
      externalNetworkAttempted: false,
      authorizationDecisionTriesActualPatchImplementationExecution: false,
      authorizationDecisionTriesRouteMountAuthorization: false,
      authorizationDecisionTriesRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-actual-patch-implementation-authorization-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5hActualPatchImplementationAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro5gRequest) ? merged.oro5gRequest : {};
  const decision = isPlainObject(merged.decisionState) ? merged.decisionState : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5gRequestPresent: readBoolean(request, "requestPresent", true),
    oro5gAuthorizationRequestSubmitted: readBoolean(
      request,
      "actualPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    oro5gAuthorizationRequestStatus: readString(
      request,
      "actualPatchImplementationAuthorizationRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    oro5gAuthorizationRequestResult: readString(
      request,
      "actualPatchImplementationAuthorizationRequestResult",
      PENDING_DECISION
    ),
    oro5gAuthorizationDecisionIssued: readBoolean(
      request,
      "actualPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    oro5gAuthorizationGranted: readBoolean(
      request,
      "actualPatchImplementationAuthorizationGranted",
      false
    ),
    oro5gActualPatchImplementationAuthorized: readBoolean(
      request,
      "actualPatchImplementationAuthorized",
      false
    ),
    oro5gActualPatchImplementationImplemented: readBoolean(
      request,
      "actualPatchImplementationImplemented",
      false
    ),
    oro5gActualPatchExecutionStarted: readBoolean(
      request,
      "actualPatchImplementationExecutionStarted",
      false
    ),
    oro5gActualPatchApplied: readBoolean(
      request,
      "actualPatchImplementationPatchApplied",
      false
    ),
    oro5gRouteMountPatchApproved: readBoolean(
      request,
      "routeMountPatchApproved",
      false
    ),
    oro5gRouteMountPatchImplementationAuthorized: readBoolean(
      request,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5gRouteMountPatchImplemented: readBoolean(
      request,
      "routeMountPatchImplemented",
      false
    ),
    oro5gImplementationExecutionApproved: readBoolean(
      request,
      "implementationExecutionApproved",
      false
    ),
    oro5gRouteMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5gExpressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    oro5gExpressMountImplemented: readBoolean(
      request,
      "expressMountImplemented",
      false
    ),
    oro5gPublicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    oro5gRuntimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    actualPatchImplementationAuthorizationRequestSubmitted: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    actualPatchImplementationAuthorizationRequestStatus: readString(
      decision,
      "actualPatchImplementationAuthorizationRequestStatus",
      DECISION_ISSUED
    ),
    actualPatchImplementationAuthorizationRequestResult: readString(
      decision,
      "actualPatchImplementationAuthorizationRequestResult",
      APPROVED
    ),
    actualPatchImplementationAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    actualPatchImplementationAuthorizationDecisionResult: readString(
      decision,
      "actualPatchImplementationAuthorizationDecisionResult",
      APPROVED
    ),
    actualPatchImplementationAuthorizationGranted: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationGranted",
      true
    ),
    actualPatchImplementationAuthorizationGrantScope: readString(
      decision,
      "actualPatchImplementationAuthorizationGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
    ),
    actualPatchImplementationAuthorized: readBoolean(
      decision,
      "actualPatchImplementationAuthorized",
      true
    ),
    actualPatchImplementationImplemented: readBoolean(
      decision,
      "actualPatchImplementationImplemented",
      false
    ),
    actualPatchImplementationExecutionStarted: readBoolean(
      decision,
      "actualPatchImplementationExecutionStarted",
      false
    ),
    actualPatchImplementationPatchApplied: readBoolean(
      decision,
      "actualPatchImplementationPatchApplied",
      false
    ),
    routeMountPatchApproved: readBoolean(decision, "routeMountPatchApproved", false),
    routeMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    implementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    routeMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(decision, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationExecutionBoundary",
      true
    ),
    nextPhaseRequiresSeparateRouteMountAuthorization: readBoolean(
      decision,
      "nextPhaseRequiresSeparateRouteMountAuthorization",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      decision,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
      true
    ),
    srcAppJsEditAttempted: readBoolean(attempt, "srcAppJsEditAttempted", false),
    routeControllerRuntimeChangeAttempted: readBoolean(
      attempt,
      "routeControllerRuntimeChangeAttempted",
      false
    ),
    expressMountImplementationAttempted: readBoolean(
      attempt,
      "expressMountImplementationAttempted",
      false
    ),
    walletMutationAttempted: readBoolean(attempt, "walletMutationAttempted", false),
    ledgerMutationAttempted: readBoolean(attempt, "ledgerMutationAttempted", false),
    prismaWriteAttempted: readBoolean(attempt, "prismaWriteAttempted", false),
    dbTransactionAttempted: readBoolean(attempt, "dbTransactionAttempted", false),
    migrationAttempted: readBoolean(attempt, "migrationAttempted", false),
    externalNetworkAttempted: readBoolean(attempt, "externalNetworkAttempted", false),
    authorizationDecisionTriesActualPatchImplementationExecution: readBoolean(
      attempt,
      "authorizationDecisionTriesActualPatchImplementationExecution",
      false
    ),
    authorizationDecisionTriesRouteMountAuthorization: readBoolean(
      attempt,
      "authorizationDecisionTriesRouteMountAuthorization",
      false
    ),
    authorizationDecisionTriesRuntimeTrafficApproval: readBoolean(
      attempt,
      "authorizationDecisionTriesRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5gRequestPresent) {
    blockers.push("ORO-5G authorization request is required");
  }
  if (!fixture.oro5gAuthorizationRequestSubmitted) {
    blockers.push("ORO-5G authorization request must be submitted");
  }
  if (
    fixture.oro5gAuthorizationRequestStatus !== SUBMITTED_PENDING_DECISION ||
    fixture.oro5gAuthorizationRequestResult !== PENDING_DECISION
  ) {
    blockers.push("ORO-5G authorization request must be pending decision");
  }
  if (fixture.oro5gAuthorizationDecisionIssued) {
    blockers.push("actual patch implementation authorization decision already issued");
  }
  if (fixture.oro5gAuthorizationGranted) {
    blockers.push("actual patch implementation authorization already granted");
  }
  if (
    !fixture.actualPatchImplementationAuthorizationDecisionIssued ||
    fixture.actualPatchImplementationAuthorizationDecisionResult !== APPROVED
  ) {
    blockers.push("actual patch implementation authorization decision must be approved");
  }
  if (!fixture.actualPatchImplementationAuthorizationGranted) {
    blockers.push("actual patch implementation authorization must be granted");
  }
  if (
    fixture.actualPatchImplementationAuthorizationGrantScope !==
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
  ) {
    blockers.push("actual patch implementation authorization grant scope must be execution boundary only");
  }
  if (!fixture.actualPatchImplementationAuthorized) {
    blockers.push("actual patch implementation authorization must be true for boundary only");
  }
  if (
    fixture.oro5gActualPatchImplementationImplemented ||
    fixture.actualPatchImplementationImplemented
  ) {
    blockers.push("actual patch implementation must not be implemented");
  }
  if (
    fixture.oro5gActualPatchExecutionStarted ||
    fixture.actualPatchImplementationExecutionStarted
  ) {
    blockers.push("actual patch implementation execution must not be started");
  }
  if (fixture.oro5gActualPatchApplied || fixture.actualPatchImplementationPatchApplied) {
    blockers.push("actual patch implementation patch must not be applied");
  }
  if (fixture.oro5gRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5gRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (
    fixture.oro5gRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5gImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5gRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5gExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5gExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5gPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5gRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationExecutionBoundary) {
    blockers.push("actual patch implementation execution boundary must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.authorizationDecisionTriesActualPatchImplementationExecution) {
    blockers.push("authorization decision must not execute actual patch implementation");
  }
  if (fixture.authorizationDecisionTriesRouteMountAuthorization) {
    blockers.push("authorization decision must not authorize route mount");
  }
  if (fixture.authorizationDecisionTriesRuntimeTrafficApproval) {
    blockers.push("authorization decision must not approve runtime traffic");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("authorization decision must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("authorization decision must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("authorization decision must not implement Express mount");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("authorization decision must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("authorization decision must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("authorization decision must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("authorization decision must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("authorization decision must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("authorization decision must not try external network");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("authorization decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5hActualPatchImplementationStillHeldGate(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    actualPatchImplementationAuthorizationRequestSubmitted: true,
    actualPatchImplementationAuthorizationRequestStatus: DECISION_ISSUED,
    actualPatchImplementationAuthorizationRequestResult: APPROVED,
    actualPatchImplementationAuthorizationDecisionIssued: true,
    actualPatchImplementationAuthorizationDecisionResult: APPROVED,
    actualPatchImplementationAuthorizationGranted: true,
    actualPatchImplementationAuthorizationGrantScope:
      ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
    actualPatchImplementationAuthorized: true,
    actualPatchImplementationImplemented: false,
    actualPatchImplementationExecutionStarted: false,
    actualPatchImplementationPatchApplied: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    srcAppJsEditAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5hRouteMountStillHeldGate(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    expressMountImplemented: false,
    publicAliasAllowed: false,
    routeControllerRuntimeChangeAllowed: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
  };
}

function buildOro5hRuntimeTrafficStillHeldGate(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationAuthorizationDecisionBoundaryResult: HOLD,
    actualPatchImplementationAuthorizationRequestSubmitted: false,
    actualPatchImplementationAuthorizationRequestStatus: HOLD,
    actualPatchImplementationAuthorizationRequestResult: HOLD,
    actualPatchImplementationAuthorizationDecisionIssued: false,
    actualPatchImplementationAuthorizationDecisionResult: HOLD,
    actualPatchImplementationAuthorizationGranted: false,
    actualPatchImplementationAuthorizationGrantScope: HOLD,
    actualPatchImplementationAuthorized: false,
    actualPatchImplementationImplemented: false,
    actualPatchImplementationExecutionStarted: false,
    actualPatchImplementationPatchApplied: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    expressMountImplemented: false,
    srcAppJsEditAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5hActualPatchImplementationAuthorizationDecisionSummary(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5hActualPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5hRouteMountStillHeldGate(input);
  const trafficGate = buildOro5hRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationAuthorizationDecisionBoundaryResult: PASS,
    actualPatchImplementationAuthorizationRequestSubmitted:
      patchGate.actualPatchImplementationAuthorizationRequestSubmitted,
    actualPatchImplementationAuthorizationRequestStatus:
      patchGate.actualPatchImplementationAuthorizationRequestStatus,
    actualPatchImplementationAuthorizationRequestResult:
      patchGate.actualPatchImplementationAuthorizationRequestResult,
    actualPatchImplementationAuthorizationDecisionIssued:
      patchGate.actualPatchImplementationAuthorizationDecisionIssued,
    actualPatchImplementationAuthorizationDecisionResult:
      patchGate.actualPatchImplementationAuthorizationDecisionResult,
    actualPatchImplementationAuthorizationGranted:
      patchGate.actualPatchImplementationAuthorizationGranted,
    actualPatchImplementationAuthorizationGrantScope:
      patchGate.actualPatchImplementationAuthorizationGrantScope,
    actualPatchImplementationAuthorized:
      patchGate.actualPatchImplementationAuthorized,
    actualPatchImplementationImplemented:
      patchGate.actualPatchImplementationImplemented,
    actualPatchImplementationExecutionStarted:
      patchGate.actualPatchImplementationExecutionStarted,
    actualPatchImplementationPatchApplied:
      patchGate.actualPatchImplementationPatchApplied,
    routeMountPatchApproved: patchGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      patchGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: patchGate.routeMountPatchImplemented,
    implementationExecutionApproved: patchGate.implementationExecutionApproved,
    routeMountAuthorization: mountGate.routeMountAuthorization,
    expressMountAllowed: mountGate.expressMountAllowed,
    expressMountImplemented: mountGate.expressMountImplemented,
    srcAppJsEditAllowed: patchGate.srcAppJsEditAllowed,
    publicAliasAllowed: trafficGate.publicAliasAllowed,
    runtimeTrafficAllowed: trafficGate.runtimeTrafficAllowed,
    walletMutationAllowed: patchGate.walletMutationAllowed,
    ledgerMutationAllowed: patchGate.ledgerMutationAllowed,
    prismaWriteAllowed: patchGate.prismaWriteAllowed,
    dbTransactionAllowed: patchGate.dbTransactionAllowed,
    migrationAllowed: patchGate.migrationAllowed,
    externalNetworkAllowed: patchGate.externalNetworkAllowed,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary:
      patchGate.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5hActualPatchImplementationAuthorizationDecision(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  return buildOro5hActualPatchImplementationAuthorizationDecisionSummary(input);
}

function validateOro5hActualPatchImplementationAuthorizationDecision(
  input = buildOro5hActualPatchImplementationAuthorizationDecisionInput()
) {
  const summary =
    buildOro5hActualPatchImplementationAuthorizationDecisionSummary(input);
  return {
    valid:
      summary.actualPatchImplementationAuthorizationDecisionBoundaryResult === PASS,
    actualPatchImplementationAuthorizationDecisionBoundaryResult:
      summary.actualPatchImplementationAuthorizationDecisionBoundaryResult,
    actualPatchImplementationAuthorizationRequestSubmitted:
      summary.actualPatchImplementationAuthorizationRequestSubmitted,
    actualPatchImplementationAuthorizationRequestStatus:
      summary.actualPatchImplementationAuthorizationRequestStatus,
    actualPatchImplementationAuthorizationRequestResult:
      summary.actualPatchImplementationAuthorizationRequestResult,
    actualPatchImplementationAuthorizationDecisionIssued:
      summary.actualPatchImplementationAuthorizationDecisionIssued,
    actualPatchImplementationAuthorizationDecisionResult:
      summary.actualPatchImplementationAuthorizationDecisionResult,
    actualPatchImplementationAuthorizationGranted:
      summary.actualPatchImplementationAuthorizationGranted,
    actualPatchImplementationAuthorizationGrantScope:
      summary.actualPatchImplementationAuthorizationGrantScope,
    actualPatchImplementationAuthorized:
      summary.actualPatchImplementationAuthorized,
    actualPatchImplementationImplemented:
      summary.actualPatchImplementationImplemented,
    actualPatchImplementationExecutionStarted:
      summary.actualPatchImplementationExecutionStarted,
    actualPatchImplementationPatchApplied:
      summary.actualPatchImplementationPatchApplied,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      summary.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary:
      summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      summary.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      summary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  APPROVED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
  buildOro5hActualPatchImplementationAuthorizationDecisionInput,
  evaluateOro5hActualPatchImplementationAuthorizationDecision,
  buildOro5hActualPatchImplementationStillHeldGate,
  buildOro5hRouteMountStillHeldGate,
  buildOro5hRuntimeTrafficStillHeldGate,
  buildOro5hActualPatchImplementationAuthorizationDecisionSummary,
  validateOro5hActualPatchImplementationAuthorizationDecision,
};
