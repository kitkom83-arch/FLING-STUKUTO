"use strict";

const {
  PASS,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro5eActualPatchImplementationApprovalRequestInput,
  evaluateOro5eActualPatchImplementationApprovalRequest,
} = require("./oro5eActualPatchImplementationApprovalRequestSubmissionBoundary");

const PHASE = "ORO-5F";
const FAIL = "FAIL";
const APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY =
  "approved_for_actual_patch_implementation_authorization_request_only";
const ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY =
  "actual_patch_implementation_authorization_request_only";

const ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
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

const BASELINE_ORO5E_SUMMARY =
  evaluateOro5eActualPatchImplementationApprovalRequest(
    buildOro5eActualPatchImplementationApprovalRequestInput()
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

function buildOro5fActualPatchImplementationApprovalDecisionInput(overrides = {}) {
  const oro5eSummary = BASELINE_ORO5E_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationApprovalDecisionIssued",
    phase: PHASE,
    oro5eRequest: {
      requestPresent: true,
      actualPatchImplementationApprovalRequestSubmissionBoundaryResult:
        oro5eSummary.actualPatchImplementationApprovalRequestSubmissionBoundaryResult,
      actualPatchImplementationApprovalRequestSubmitted:
        oro5eSummary.actualPatchImplementationApprovalRequestSubmitted,
      actualPatchImplementationApprovalRequestStatus:
        oro5eSummary.actualPatchImplementationApprovalRequestStatus,
      actualPatchImplementationApprovalRequestResult:
        oro5eSummary.actualPatchImplementationApprovalRequestResult,
      actualPatchImplementationApprovalDecisionIssued:
        oro5eSummary.actualPatchImplementationApprovalDecisionIssued,
      actualPatchImplementationApprovalGranted:
        oro5eSummary.actualPatchImplementationApprovalGranted,
      actualPatchImplementationApprovalGrantScope: null,
      routeMountPatchImplementationAuthorizationDecisionIssued:
        oro5eSummary.routeMountPatchImplementationAuthorizationDecisionIssued,
      routeMountPatchImplementationAuthorizationGranted:
        oro5eSummary.routeMountPatchImplementationAuthorizationGranted,
      routeMountPatchImplementationAuthorization:
        oro5eSummary.routeMountPatchImplementationAuthorization,
      actualPatchImplementationAuthorized: false,
      actualPatchImplementationImplemented: false,
      routeMountPatchApproved: oro5eSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5eSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5eSummary.routeMountPatchImplemented,
      implementationExecutionApproved: oro5eSummary.implementationExecutionApproved,
      routeMountAuthorization: oro5eSummary.routeMountAuthorization,
      expressMountAllowed: oro5eSummary.expressMountAllowed,
      expressMountImplemented: oro5eSummary.expressMountImplemented,
      publicAliasAllowed: oro5eSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5eSummary.runtimeTrafficAllowed,
    },
    decisionState: {
      actualPatchImplementationApprovalRequestSubmitted: true,
      actualPatchImplementationApprovalRequestStatus: DECISION_ISSUED,
      actualPatchImplementationApprovalDecisionIssued: true,
      actualPatchImplementationApprovalDecisionResult:
        APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
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
      nextPhaseRequiresActualPatchImplementationAuthorizationRequest: true,
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
      approvalDecisionTriesActualPatchImplementationAuthorization: false,
      approvalDecisionTriesActualPatchImplementationExecution: false,
      approvalDecisionTriesRouteMountAuthorization: false,
      approvalDecisionTriesRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-actual-patch-implementation-approval-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5fActualPatchImplementationApprovalDecisionInput();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro5eRequest) ? merged.oro5eRequest : {};
  const decision = isPlainObject(merged.decisionState) ? merged.decisionState : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5eRequestPresent: readBoolean(request, "requestPresent", true),
    oro5eRequestSubmissionResult: readString(
      request,
      "actualPatchImplementationApprovalRequestSubmissionBoundaryResult",
      PASS
    ),
    oro5eRequestSubmitted: readBoolean(
      request,
      "actualPatchImplementationApprovalRequestSubmitted",
      true
    ),
    oro5eRequestStatus: readString(
      request,
      "actualPatchImplementationApprovalRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    oro5eRequestResult: readString(
      request,
      "actualPatchImplementationApprovalRequestResult",
      PENDING_DECISION
    ),
    oro5eApprovalDecisionIssued: readBoolean(
      request,
      "actualPatchImplementationApprovalDecisionIssued",
      false
    ),
    oro5eApprovalGranted: readBoolean(
      request,
      "actualPatchImplementationApprovalGranted",
      false
    ),
    oro5eApprovalGrantScope: readString(
      request,
      "actualPatchImplementationApprovalGrantScope",
      ""
    ),
    oro5dDecisionIssued: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    oro5dAuthorizationGranted: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationGranted",
      true
    ),
    oro5dAuthorization: readString(
      request,
      "routeMountPatchImplementationAuthorization",
      AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
    ),
    oro5eActualPatchImplementationAuthorized: readBoolean(
      request,
      "actualPatchImplementationAuthorized",
      false
    ),
    oro5eActualPatchImplementationImplemented: readBoolean(
      request,
      "actualPatchImplementationImplemented",
      false
    ),
    oro5eRouteMountPatchApproved: readBoolean(
      request,
      "routeMountPatchApproved",
      false
    ),
    oro5eRouteMountPatchImplementationAuthorized: readBoolean(
      request,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5eRouteMountPatchImplemented: readBoolean(
      request,
      "routeMountPatchImplemented",
      false
    ),
    oro5eImplementationExecutionApproved: readBoolean(
      request,
      "implementationExecutionApproved",
      false
    ),
    oro5eRouteMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5eExpressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    oro5eExpressMountImplemented: readBoolean(
      request,
      "expressMountImplemented",
      false
    ),
    oro5ePublicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    oro5eRuntimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    actualPatchImplementationApprovalRequestSubmitted: readBoolean(
      decision,
      "actualPatchImplementationApprovalRequestSubmitted",
      true
    ),
    actualPatchImplementationApprovalRequestStatus: readString(
      decision,
      "actualPatchImplementationApprovalRequestStatus",
      DECISION_ISSUED
    ),
    actualPatchImplementationApprovalDecisionIssued: readBoolean(
      decision,
      "actualPatchImplementationApprovalDecisionIssued",
      true
    ),
    actualPatchImplementationApprovalDecisionResult: readString(
      decision,
      "actualPatchImplementationApprovalDecisionResult",
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    actualPatchImplementationApprovalGranted: readBoolean(
      decision,
      "actualPatchImplementationApprovalGranted",
      true
    ),
    actualPatchImplementationApprovalGrantScope: readString(
      decision,
      "actualPatchImplementationApprovalGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    actualPatchImplementationAuthorized: readBoolean(
      decision,
      "actualPatchImplementationAuthorized",
      false
    ),
    actualPatchImplementationImplemented: readBoolean(
      decision,
      "actualPatchImplementationImplemented",
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
    nextPhaseRequiresActualPatchImplementationAuthorizationRequest: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationAuthorizationRequest",
      true
    ),
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationAuthorizationDecision",
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
    approvalDecisionTriesActualPatchImplementationAuthorization: readBoolean(
      attempt,
      "approvalDecisionTriesActualPatchImplementationAuthorization",
      false
    ),
    approvalDecisionTriesActualPatchImplementationExecution: readBoolean(
      attempt,
      "approvalDecisionTriesActualPatchImplementationExecution",
      false
    ),
    approvalDecisionTriesRouteMountAuthorization: readBoolean(
      attempt,
      "approvalDecisionTriesRouteMountAuthorization",
      false
    ),
    approvalDecisionTriesRuntimeTrafficApproval: readBoolean(
      attempt,
      "approvalDecisionTriesRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5eRequestPresent) {
    blockers.push("ORO-5E actual patch implementation approval request is required");
  }
  if (fixture.oro5eRequestSubmissionResult !== PASS) {
    blockers.push("ORO-5E request submission result must be PASS");
  }
  if (!fixture.oro5eRequestSubmitted) {
    blockers.push("ORO-5E request must be submitted");
  }
  if (
    fixture.oro5eRequestStatus !== SUBMITTED_PENDING_DECISION ||
    fixture.oro5eRequestResult !== PENDING_DECISION
  ) {
    blockers.push("ORO-5E request must be pending decision");
  }
  if (!fixture.oro5dDecisionIssued) {
    blockers.push("ORO-5D decision is required");
  }
  if (!fixture.oro5dAuthorizationGranted) {
    blockers.push("ORO-5D authorization must be granted");
  }
  if (
    fixture.oro5dAuthorization !==
    AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("ORO-5D authorization scope must be approval request only");
  }
  if (fixture.oro5eApprovalDecisionIssued) {
    blockers.push("actual patch implementation approval decision already issued");
  }
  if (
    fixture.oro5eApprovalGranted &&
    fixture.oro5eApprovalGrantScope !==
      ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("actual patch implementation approval already granted with broader scope");
  }
  if (!fixture.actualPatchImplementationApprovalDecisionIssued) {
    blockers.push("actual patch implementation approval decision must be issued");
  }
  if (
    fixture.actualPatchImplementationApprovalDecisionResult !==
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("actual patch implementation approval decision result must be authorization request only");
  }
  if (!fixture.actualPatchImplementationApprovalGranted) {
    blockers.push("actual patch implementation approval must be granted for request only");
  }
  if (
    fixture.actualPatchImplementationApprovalGrantScope !==
    ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("actual patch implementation approval grant scope must be authorization request only");
  }
  if (
    fixture.actualPatchImplementationApprovalRequestStatus !== DECISION_ISSUED
  ) {
    blockers.push("actual patch implementation approval request status must be decision_issued");
  }
  if (
    fixture.oro5eActualPatchImplementationAuthorized ||
    fixture.actualPatchImplementationAuthorized
  ) {
    blockers.push("actual patch implementation must not be authorized");
  }
  if (
    fixture.oro5eActualPatchImplementationImplemented ||
    fixture.actualPatchImplementationImplemented
  ) {
    blockers.push("actual patch implementation must not be implemented");
  }
  if (
    fixture.oro5eRouteMountPatchApproved ||
    fixture.routeMountPatchApproved
  ) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5eRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (
    fixture.oro5eRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5eImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5eRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5eExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5eExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5ePublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5eRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationAuthorizationRequest) {
    blockers.push("actual patch implementation authorization request must remain required");
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
  if (fixture.approvalDecisionTriesActualPatchImplementationAuthorization) {
    blockers.push("approval decision must not authorize actual patch implementation");
  }
  if (fixture.approvalDecisionTriesActualPatchImplementationExecution) {
    blockers.push("approval decision must not execute actual patch implementation");
  }
  if (fixture.approvalDecisionTriesRouteMountAuthorization) {
    blockers.push("approval decision must not authorize route mount");
  }
  if (fixture.approvalDecisionTriesRuntimeTrafficApproval) {
    blockers.push("approval decision must not approve runtime traffic");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("approval decision must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("approval decision must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("approval decision must not implement Express mount");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("approval decision must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("approval decision must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("approval decision must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("approval decision must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("approval decision must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("approval decision must not try external network");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("approval decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5fActualPatchImplementationStillHeldGate(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    actualPatchImplementationApprovalRequestSubmitted: true,
    actualPatchImplementationApprovalRequestStatus: DECISION_ISSUED,
    actualPatchImplementationApprovalDecisionIssued: true,
    actualPatchImplementationApprovalDecisionResult:
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationRequest: true,
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5fRouteMountStillHeldGate(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
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

function buildOro5fRuntimeTrafficStillHeldGate(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
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
    actualPatchImplementationApprovalDecisionBoundaryResult: HOLD,
    actualPatchImplementationApprovalRequestSubmitted: false,
    actualPatchImplementationApprovalRequestStatus: HOLD,
    actualPatchImplementationApprovalDecisionIssued: false,
    actualPatchImplementationApprovalDecisionResult: HOLD,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationRequest: true,
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5fActualPatchImplementationApprovalDecisionSummary(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5fActualPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5fRouteMountStillHeldGate(input);
  const trafficGate = buildOro5fRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationApprovalDecisionBoundaryResult: PASS,
    actualPatchImplementationApprovalRequestSubmitted:
      patchGate.actualPatchImplementationApprovalRequestSubmitted,
    actualPatchImplementationApprovalRequestStatus:
      patchGate.actualPatchImplementationApprovalRequestStatus,
    actualPatchImplementationApprovalDecisionIssued:
      patchGate.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalDecisionResult:
      patchGate.actualPatchImplementationApprovalDecisionResult,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationRequest:
      patchGate.nextPhaseRequiresActualPatchImplementationAuthorizationRequest,
    nextPhaseRequiresActualPatchImplementationAuthorizationDecision:
      patchGate.nextPhaseRequiresActualPatchImplementationAuthorizationDecision,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5fActualPatchImplementationApprovalDecision(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
) {
  return buildOro5fActualPatchImplementationApprovalDecisionSummary(input);
}

function validateOro5fActualPatchImplementationApprovalDecision(
  input = buildOro5fActualPatchImplementationApprovalDecisionInput()
) {
  const summary =
    buildOro5fActualPatchImplementationApprovalDecisionSummary(input);
  return {
    valid:
      summary.actualPatchImplementationApprovalDecisionBoundaryResult === PASS,
    actualPatchImplementationApprovalDecisionBoundaryResult:
      summary.actualPatchImplementationApprovalDecisionBoundaryResult,
    actualPatchImplementationApprovalRequestSubmitted:
      summary.actualPatchImplementationApprovalRequestSubmitted,
    actualPatchImplementationApprovalRequestStatus:
      summary.actualPatchImplementationApprovalRequestStatus,
    actualPatchImplementationApprovalDecisionIssued:
      summary.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalDecisionResult:
      summary.actualPatchImplementationApprovalDecisionResult,
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
    nextPhaseRequiresActualPatchImplementationAuthorizationRequest:
      summary.nextPhaseRequiresActualPatchImplementationAuthorizationRequest,
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
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5F_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_DECISION_STATUS,
  buildOro5fActualPatchImplementationApprovalDecisionInput,
  evaluateOro5fActualPatchImplementationApprovalDecision,
  buildOro5fActualPatchImplementationStillHeldGate,
  buildOro5fRouteMountStillHeldGate,
  buildOro5fRuntimeTrafficStillHeldGate,
  buildOro5fActualPatchImplementationApprovalDecisionSummary,
  validateOro5fActualPatchImplementationApprovalDecision,
};
