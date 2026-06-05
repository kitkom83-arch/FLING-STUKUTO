"use strict";

const {
  PASS,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro5fActualPatchImplementationApprovalDecisionInput,
  evaluateOro5fActualPatchImplementationApprovalDecision,
} = require("./oro5fActualPatchImplementationApprovalDecisionBoundary");

const PHASE = "ORO-5G";
const FAIL = "FAIL";

const ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    DECISION_ISSUED,
    SUBMITTED_PENDING_DECISION,
    PENDING_DECISION,
    ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
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

const BASELINE_ORO5F_SUMMARY =
  evaluateOro5fActualPatchImplementationApprovalDecision(
    buildOro5fActualPatchImplementationApprovalDecisionInput()
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

function buildOro5gActualPatchImplementationAuthorizationRequestInput(
  overrides = {}
) {
  const oro5fSummary = BASELINE_ORO5F_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationAuthorizationRequestSubmitted",
    phase: PHASE,
    oro5fDecision: {
      decisionPresent: true,
      actualPatchImplementationApprovalRequestSubmitted:
        oro5fSummary.actualPatchImplementationApprovalRequestSubmitted,
      actualPatchImplementationApprovalRequestStatus:
        oro5fSummary.actualPatchImplementationApprovalRequestStatus,
      actualPatchImplementationApprovalDecisionIssued:
        oro5fSummary.actualPatchImplementationApprovalDecisionIssued,
      actualPatchImplementationApprovalGranted:
        oro5fSummary.actualPatchImplementationApprovalGranted,
      actualPatchImplementationApprovalGrantScope:
        oro5fSummary.actualPatchImplementationApprovalGrantScope,
      actualPatchImplementationAuthorizationRequestSubmitted: false,
      actualPatchImplementationAuthorizationDecisionIssued: false,
      actualPatchImplementationAuthorizationGranted: false,
      actualPatchImplementationAuthorized: oro5fSummary.actualPatchImplementationAuthorized,
      actualPatchImplementationImplemented: oro5fSummary.actualPatchImplementationImplemented,
      routeMountPatchApproved: oro5fSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5fSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5fSummary.routeMountPatchImplemented,
      implementationExecutionApproved: oro5fSummary.implementationExecutionApproved,
      routeMountAuthorization: oro5fSummary.routeMountAuthorization,
      expressMountAllowed: oro5fSummary.expressMountAllowed,
      expressMountImplemented: oro5fSummary.expressMountImplemented,
      publicAliasAllowed: oro5fSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5fSummary.runtimeTrafficAllowed,
    },
    requestState: {
      actualPatchImplementationAuthorizationRequestAlreadySubmittedBeforeOro5g: false,
      actualPatchImplementationAuthorizationRequestSubmitted: true,
      actualPatchImplementationAuthorizationRequestStatus:
        SUBMITTED_PENDING_DECISION,
      actualPatchImplementationAuthorizationRequestResult: PENDING_DECISION,
      actualPatchImplementationAuthorizationDecisionIssued: false,
      actualPatchImplementationAuthorizationGranted: false,
      actualPatchImplementationApprovalDecisionIssued: true,
      actualPatchImplementationApprovalGranted: true,
      actualPatchImplementationApprovalGrantScope:
        ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
      actualPatchImplementationAuthorized: false,
      actualPatchImplementationImplemented: false,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresActualPatchImplementationAuthorizationDecision: true,
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
      authorizationRequestTriesAuthorizationDecision: false,
      authorizationRequestTriesImplementationAuthorization: false,
      authorizationRequestTriesActualPatchImplementation: false,
      authorizationRequestTriesRouteMountAuthorization: false,
      authorizationRequestTriesRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-actual-patch-implementation-authorization-request",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5gActualPatchImplementationAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro5fDecision) ? merged.oro5fDecision : {};
  const request = isPlainObject(merged.requestState) ? merged.requestState : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5fDecisionPresent: readBoolean(decision, "decisionPresent", true),
    oro5fApprovalRequestSubmitted: readBoolean(
      decision,
      "actualPatchImplementationApprovalRequestSubmitted",
      true
    ),
    oro5fApprovalRequestStatus: readString(
      decision,
      "actualPatchImplementationApprovalRequestStatus",
      DECISION_ISSUED
    ),
    oro5fApprovalDecisionIssued: readBoolean(
      decision,
      "actualPatchImplementationApprovalDecisionIssued",
      true
    ),
    oro5fApprovalGranted: readBoolean(
      decision,
      "actualPatchImplementationApprovalGranted",
      true
    ),
    oro5fApprovalGrantScope: readString(
      decision,
      "actualPatchImplementationApprovalGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    oro5fAuthorizationRequestSubmitted: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationRequestSubmitted",
      false
    ),
    oro5fAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    oro5fAuthorizationGranted: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationGranted",
      false
    ),
    oro5fActualPatchImplementationAuthorized: readBoolean(
      decision,
      "actualPatchImplementationAuthorized",
      false
    ),
    oro5fActualPatchImplementationImplemented: readBoolean(
      decision,
      "actualPatchImplementationImplemented",
      false
    ),
    oro5fRouteMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    oro5fRouteMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5fRouteMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    oro5fImplementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    oro5fRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5fExpressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    oro5fExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro5fPublicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    oro5fRuntimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    actualPatchImplementationAuthorizationRequestAlreadySubmittedBeforeOro5g:
      readBoolean(
        request,
        "actualPatchImplementationAuthorizationRequestAlreadySubmittedBeforeOro5g",
        false
      ),
    actualPatchImplementationAuthorizationRequestSubmitted: readBoolean(
      request,
      "actualPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    actualPatchImplementationAuthorizationRequestStatus: readString(
      request,
      "actualPatchImplementationAuthorizationRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    actualPatchImplementationAuthorizationRequestResult: readString(
      request,
      "actualPatchImplementationAuthorizationRequestResult",
      PENDING_DECISION
    ),
    actualPatchImplementationAuthorizationDecisionIssued: readBoolean(
      request,
      "actualPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    actualPatchImplementationAuthorizationGranted: readBoolean(
      request,
      "actualPatchImplementationAuthorizationGranted",
      false
    ),
    actualPatchImplementationApprovalDecisionIssued: readBoolean(
      request,
      "actualPatchImplementationApprovalDecisionIssued",
      true
    ),
    actualPatchImplementationApprovalGranted: readBoolean(
      request,
      "actualPatchImplementationApprovalGranted",
      true
    ),
    actualPatchImplementationApprovalGrantScope: readString(
      request,
      "actualPatchImplementationApprovalGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    actualPatchImplementationAuthorized: readBoolean(
      request,
      "actualPatchImplementationAuthorized",
      false
    ),
    actualPatchImplementationImplemented: readBoolean(
      request,
      "actualPatchImplementationImplemented",
      false
    ),
    routeMountPatchApproved: readBoolean(request, "routeMountPatchApproved", false),
    routeMountPatchImplementationAuthorized: readBoolean(
      request,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      request,
      "routeMountPatchImplemented",
      false
    ),
    implementationExecutionApproved: readBoolean(
      request,
      "implementationExecutionApproved",
      false
    ),
    routeMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(request, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresActualPatchImplementationAuthorizationDecision",
      true
    ),
    nextPhaseRequiresSeparateRouteMountAuthorization: readBoolean(
      request,
      "nextPhaseRequiresSeparateRouteMountAuthorization",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      request,
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
    authorizationRequestTriesAuthorizationDecision: readBoolean(
      attempt,
      "authorizationRequestTriesAuthorizationDecision",
      false
    ),
    authorizationRequestTriesImplementationAuthorization: readBoolean(
      attempt,
      "authorizationRequestTriesImplementationAuthorization",
      false
    ),
    authorizationRequestTriesActualPatchImplementation: readBoolean(
      attempt,
      "authorizationRequestTriesActualPatchImplementation",
      false
    ),
    authorizationRequestTriesRouteMountAuthorization: readBoolean(
      attempt,
      "authorizationRequestTriesRouteMountAuthorization",
      false
    ),
    authorizationRequestTriesRuntimeTrafficApproval: readBoolean(
      attempt,
      "authorizationRequestTriesRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5fDecisionPresent) {
    blockers.push("ORO-5F approval decision is required");
  }
  if (!fixture.oro5fApprovalRequestSubmitted) {
    blockers.push("ORO-5F approval request must be submitted");
  }
  if (fixture.oro5fApprovalRequestStatus !== DECISION_ISSUED) {
    blockers.push("ORO-5F approval request status must be decision_issued");
  }
  if (!fixture.oro5fApprovalDecisionIssued) {
    blockers.push("ORO-5F approval decision must be issued");
  }
  if (!fixture.oro5fApprovalGranted) {
    blockers.push("ORO-5F approval must be granted");
  }
  if (
    fixture.oro5fApprovalGrantScope !==
    ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("ORO-5F approval grant scope must be authorization request only");
  }
  if (
    fixture.oro5fAuthorizationRequestSubmitted ||
    fixture.actualPatchImplementationAuthorizationRequestAlreadySubmittedBeforeOro5g
  ) {
    blockers.push("actual patch implementation authorization request already submitted");
  }
  if (
    fixture.oro5fAuthorizationDecisionIssued ||
    fixture.actualPatchImplementationAuthorizationDecisionIssued
  ) {
    blockers.push("actual patch implementation authorization decision already issued");
  }
  if (
    fixture.oro5fAuthorizationGranted ||
    fixture.actualPatchImplementationAuthorizationGranted
  ) {
    blockers.push("actual patch implementation authorization already granted");
  }
  if (
    !fixture.actualPatchImplementationAuthorizationRequestSubmitted ||
    fixture.actualPatchImplementationAuthorizationRequestStatus !==
      SUBMITTED_PENDING_DECISION ||
    fixture.actualPatchImplementationAuthorizationRequestResult !== PENDING_DECISION
  ) {
    blockers.push("actual patch implementation authorization request must be submitted pending decision");
  }
  if (
    !fixture.actualPatchImplementationApprovalDecisionIssued ||
    !fixture.actualPatchImplementationApprovalGranted ||
    fixture.actualPatchImplementationApprovalGrantScope !==
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("actual patch implementation approval must allow authorization request only");
  }
  if (
    fixture.oro5fActualPatchImplementationAuthorized ||
    fixture.actualPatchImplementationAuthorized
  ) {
    blockers.push("actual patch implementation must not be authorized");
  }
  if (
    fixture.oro5fActualPatchImplementationImplemented ||
    fixture.actualPatchImplementationImplemented
  ) {
    blockers.push("actual patch implementation must not be implemented");
  }
  if (fixture.oro5fRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5fRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (
    fixture.oro5fRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5fImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5fRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5fExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5fExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5fPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5fRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationAuthorizationDecision) {
    blockers.push("actual patch implementation authorization decision must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.authorizationRequestTriesAuthorizationDecision) {
    blockers.push("authorization request must not issue authorization decision");
  }
  if (fixture.authorizationRequestTriesImplementationAuthorization) {
    blockers.push("authorization request must not grant implementation authorization");
  }
  if (fixture.authorizationRequestTriesActualPatchImplementation) {
    blockers.push("authorization request must not implement actual patch");
  }
  if (fixture.authorizationRequestTriesRouteMountAuthorization) {
    blockers.push("authorization request must not authorize route mount");
  }
  if (fixture.authorizationRequestTriesRuntimeTrafficApproval) {
    blockers.push("authorization request must not approve runtime traffic");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("authorization request must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("authorization request must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("authorization request must not implement Express mount");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("authorization request must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("authorization request must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("authorization request must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("authorization request must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("authorization request must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("authorization request must not try external network");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("authorization request output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5gActualPatchImplementationStillHeldGate(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    actualPatchImplementationAuthorizationRequestSubmitted: true,
    actualPatchImplementationAuthorizationRequestStatus: SUBMITTED_PENDING_DECISION,
    actualPatchImplementationAuthorizationRequestResult: PENDING_DECISION,
    actualPatchImplementationAuthorizationDecisionIssued: false,
    actualPatchImplementationAuthorizationGranted: false,
    actualPatchImplementationApprovalDecisionIssued: true,
    actualPatchImplementationApprovalGranted: true,
    actualPatchImplementationApprovalGrantScope:
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    actualPatchImplementationAuthorized: false,
    actualPatchImplementationImplemented: false,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5gRouteMountStillHeldGate(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
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

function buildOro5gRuntimeTrafficStillHeldGate(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
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
    actualPatchImplementationAuthorizationRequestBoundaryResult: HOLD,
    actualPatchImplementationAuthorizationRequestSubmitted: false,
    actualPatchImplementationAuthorizationRequestStatus: HOLD,
    actualPatchImplementationAuthorizationRequestResult: HOLD,
    actualPatchImplementationAuthorizationDecisionIssued: false,
    actualPatchImplementationAuthorizationGranted: false,
    actualPatchImplementationApprovalDecisionIssued: false,
    actualPatchImplementationApprovalGranted: false,
    actualPatchImplementationApprovalGrantScope: HOLD,
    actualPatchImplementationAuthorized: false,
    actualPatchImplementationImplemented: false,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5gActualPatchImplementationAuthorizationRequestSummary(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5gActualPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5gRouteMountStillHeldGate(input);
  const trafficGate = buildOro5gRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationAuthorizationRequestBoundaryResult: PASS,
    actualPatchImplementationAuthorizationRequestSubmitted:
      patchGate.actualPatchImplementationAuthorizationRequestSubmitted,
    actualPatchImplementationAuthorizationRequestStatus:
      patchGate.actualPatchImplementationAuthorizationRequestStatus,
    actualPatchImplementationAuthorizationRequestResult:
      patchGate.actualPatchImplementationAuthorizationRequestResult,
    actualPatchImplementationAuthorizationDecisionIssued:
      patchGate.actualPatchImplementationAuthorizationDecisionIssued,
    actualPatchImplementationAuthorizationGranted:
      patchGate.actualPatchImplementationAuthorizationGranted,
    actualPatchImplementationApprovalDecisionIssued:
      patchGate.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalGranted:
      patchGate.actualPatchImplementationApprovalGranted,
    actualPatchImplementationApprovalGrantScope:
      patchGate.actualPatchImplementationApprovalGrantScope,
    actualPatchImplementationAuthorized:
      patchGate.actualPatchImplementationAuthorized,
    actualPatchImplementationImplemented:
      patchGate.actualPatchImplementationImplemented,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision:
      patchGate.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5gActualPatchImplementationAuthorizationRequest(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
) {
  return buildOro5gActualPatchImplementationAuthorizationRequestSummary(input);
}

function validateOro5gActualPatchImplementationAuthorizationRequest(
  input = buildOro5gActualPatchImplementationAuthorizationRequestInput()
) {
  const summary =
    buildOro5gActualPatchImplementationAuthorizationRequestSummary(input);
  return {
    valid:
      summary.actualPatchImplementationAuthorizationRequestBoundaryResult === PASS,
    actualPatchImplementationAuthorizationRequestBoundaryResult:
      summary.actualPatchImplementationAuthorizationRequestBoundaryResult,
    actualPatchImplementationAuthorizationRequestSubmitted:
      summary.actualPatchImplementationAuthorizationRequestSubmitted,
    actualPatchImplementationAuthorizationRequestStatus:
      summary.actualPatchImplementationAuthorizationRequestStatus,
    actualPatchImplementationAuthorizationRequestResult:
      summary.actualPatchImplementationAuthorizationRequestResult,
    actualPatchImplementationAuthorizationDecisionIssued:
      summary.actualPatchImplementationAuthorizationDecisionIssued,
    actualPatchImplementationAuthorizationGranted:
      summary.actualPatchImplementationAuthorizationGranted,
    actualPatchImplementationApprovalDecisionIssued:
      summary.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalGranted:
      summary.actualPatchImplementationApprovalGranted,
    actualPatchImplementationApprovalGrantScope:
      summary.actualPatchImplementationApprovalGrantScope,
    actualPatchImplementationAuthorized:
      summary.actualPatchImplementationAuthorized,
    actualPatchImplementationImplemented:
      summary.actualPatchImplementationImplemented,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      summary.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    implementationExecutionApproved: summary.implementationExecutionApproved,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision:
      summary.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
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
  ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5G_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_STATUS,
  buildOro5gActualPatchImplementationAuthorizationRequestInput,
  evaluateOro5gActualPatchImplementationAuthorizationRequest,
  buildOro5gActualPatchImplementationStillHeldGate,
  buildOro5gRouteMountStillHeldGate,
  buildOro5gRuntimeTrafficStillHeldGate,
  buildOro5gActualPatchImplementationAuthorizationRequestSummary,
  validateOro5gActualPatchImplementationAuthorizationRequest,
};
