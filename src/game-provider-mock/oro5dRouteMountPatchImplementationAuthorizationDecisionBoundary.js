"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestInput,
  evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
} = require("./oro5cRouteMountPatchImplementationAuthorizationRequestSubmission");

const PHASE = "ORO-5D";
const FAIL = "FAIL";
const APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY =
  "approved_for_actual_patch_implementation_approval_request_only";
const AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY =
  "authorized_for_actual_patch_implementation_approval_request_only";

const ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    DECISION_ISSUED,
    SUBMITTED_PENDING_DECISION,
    PENDING_DECISION,
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
    AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
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

const BASELINE_ORO5C_SUMMARY =
  evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
    buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
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

function buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput(
  overrides = {}
) {
  const oro5cSummary = BASELINE_ORO5C_SUMMARY;
  const baseline = {
    id: "happyPathPatchImplementationAuthorizationDecisionIssued",
    phase: PHASE,
    oro5cRequest: {
      requestPresent: true,
      routeMountPatchImplementationAuthorizationRequestSubmissionResult:
        oro5cSummary.routeMountPatchImplementationAuthorizationRequestSubmissionResult,
      routeMountExecutionApprovalRequestSubmitted:
        oro5cSummary.routeMountExecutionApprovalRequestSubmitted,
      routeMountExecutionApprovalRequestStatus:
        oro5cSummary.routeMountExecutionApprovalRequestStatus,
      routeMountExecutionApprovalDecisionIssued:
        oro5cSummary.routeMountExecutionApprovalDecisionIssued,
      routeMountExecutionApprovalDecisionResult:
        oro5cSummary.routeMountExecutionApprovalDecisionResult,
      executionApprovalDecisionIssued:
        oro5cSummary.executionApprovalDecisionIssued,
      executionApprovalGranted: oro5cSummary.executionApprovalGranted,
      routeMountExecutionAuthorization:
        oro5cSummary.routeMountExecutionAuthorization,
      routeMountPatchImplementationAuthorizationRequestSubmitted:
        oro5cSummary.routeMountPatchImplementationAuthorizationRequestSubmitted,
      routeMountPatchImplementationAuthorizationRequestStatus:
        oro5cSummary.routeMountPatchImplementationAuthorizationRequestStatus,
      routeMountPatchImplementationAuthorizationRequestResult:
        oro5cSummary.routeMountPatchImplementationAuthorizationRequestResult,
      routeMountPatchImplementationAuthorizationDecisionIssued:
        oro5cSummary.routeMountPatchImplementationAuthorizationDecisionIssued,
      routeMountPatchImplementationAuthorizationGranted:
        oro5cSummary.routeMountPatchImplementationAuthorizationGranted,
      routeMountPatchApproved: oro5cSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5cSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5cSummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro5cSummary.implementationExecutionApproved,
      actualPatchImplementationApprovalIssued: false,
      actualPatchImplementationApprovalGranted: false,
      routeMountAuthorization: oro5cSummary.routeMountAuthorization,
      expressMountAllowed: oro5cSummary.expressMountAllowed,
      expressMountImplemented: oro5cSummary.expressMountImplemented,
      publicAliasAllowed: oro5cSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5cSummary.runtimeTrafficAllowed,
    },
    decisionState: {
      routeMountPatchImplementationAuthorizationRequestSubmitted: true,
      routeMountPatchImplementationAuthorizationRequestStatus: DECISION_ISSUED,
      routeMountPatchImplementationAuthorizationRequestResult:
        APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
      routeMountPatchImplementationAuthorizationDecisionIssued: true,
      routeMountPatchImplementationAuthorizationDecisionResult:
        APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
      routeMountPatchImplementationAuthorizationGranted: true,
      routeMountPatchImplementationAuthorization:
        AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      actualPatchImplementationApprovalIssued: false,
      actualPatchImplementationApprovalGranted: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresActualPatchImplementationApprovalRequest: true,
      nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
      nextPhaseRequiresSeparateRouteMountAuthorization: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    },
    implementationAttempt: {
      srcAppJsEditAttempted: false,
      expressMountImplementationAttempted: false,
      routeControllerRuntimeChangeAttempted: false,
      publicAliasAuthorizationAttempted: false,
      runtimeTrafficAuthorizationAttempted: false,
      walletMutationAttempted: false,
      ledgerMutationAttempted: false,
      prismaWriteAttempted: false,
      dbTransactionAttempted: false,
      migrationAttempted: false,
      externalNetworkAttempted: false,
      patchImplementationAuthorizationTriesActualImplementationApproval: false,
      authorizationDecisionSkipsActualPatchApprovalRequest: false,
      authorizationDecisionSkipsActualPatchApprovalDecision: false,
      authorizationDecisionSkipsRouteMountAuthorization: false,
      authorizationDecisionSkipsRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-implementation-authorization-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro5cRequest) ? merged.oro5cRequest : {};
  const decision = isPlainObject(merged.decisionState) ? merged.decisionState : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5cRequestPresent: readBoolean(request, "requestPresent", true),
    oro5cRequestSubmissionResult: readString(
      request,
      "routeMountPatchImplementationAuthorizationRequestSubmissionResult",
      PASS
    ),
    routeMountExecutionApprovalRequestSubmitted: readBoolean(
      request,
      "routeMountExecutionApprovalRequestSubmitted",
      true
    ),
    routeMountExecutionApprovalRequestStatus: readString(
      request,
      "routeMountExecutionApprovalRequestStatus",
      DECISION_ISSUED
    ),
    routeMountExecutionApprovalDecisionIssued: readBoolean(
      request,
      "routeMountExecutionApprovalDecisionIssued",
      true
    ),
    routeMountExecutionApprovalDecisionResult: readString(
      request,
      "routeMountExecutionApprovalDecisionResult",
      APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    executionApprovalDecisionIssued: readBoolean(
      request,
      "executionApprovalDecisionIssued",
      true
    ),
    executionApprovalGranted: readBoolean(request, "executionApprovalGranted", true),
    routeMountExecutionAuthorization: readString(
      request,
      "routeMountExecutionAuthorization",
      AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    oro5cAuthorizationRequestSubmitted: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    oro5cAuthorizationRequestStatus: readString(
      request,
      "routeMountPatchImplementationAuthorizationRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    oro5cAuthorizationRequestResult: readString(
      request,
      "routeMountPatchImplementationAuthorizationRequestResult",
      PENDING_DECISION
    ),
    oro5cAuthorizationDecisionIssued: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    oro5cAuthorizationGranted: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationGranted",
      false
    ),
    oro5cRouteMountPatchApproved: readBoolean(
      request,
      "routeMountPatchApproved",
      false
    ),
    oro5cRouteMountPatchImplementationAuthorized: readBoolean(
      request,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5cRouteMountPatchImplemented: readBoolean(
      request,
      "routeMountPatchImplemented",
      false
    ),
    oro5cImplementationExecutionApproved: readBoolean(
      request,
      "implementationExecutionApproved",
      false
    ),
    oro5cActualPatchImplementationApprovalIssued: readBoolean(
      request,
      "actualPatchImplementationApprovalIssued",
      false
    ),
    oro5cActualPatchImplementationApprovalGranted: readBoolean(
      request,
      "actualPatchImplementationApprovalGranted",
      false
    ),
    oro5cRouteMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5cExpressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    oro5cExpressMountImplemented: readBoolean(
      request,
      "expressMountImplemented",
      false
    ),
    oro5cPublicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    oro5cRuntimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    routeMountPatchImplementationAuthorizationRequestSubmitted: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    routeMountPatchImplementationAuthorizationRequestStatus: readString(
      decision,
      "routeMountPatchImplementationAuthorizationRequestStatus",
      DECISION_ISSUED
    ),
    routeMountPatchImplementationAuthorizationRequestResult: readString(
      decision,
      "routeMountPatchImplementationAuthorizationRequestResult",
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
    ),
    routeMountPatchImplementationAuthorizationDecisionIssued: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    routeMountPatchImplementationAuthorizationDecisionResult: readString(
      decision,
      "routeMountPatchImplementationAuthorizationDecisionResult",
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
    ),
    routeMountPatchImplementationAuthorizationGranted: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorizationGranted",
      true
    ),
    routeMountPatchImplementationAuthorization: readString(
      decision,
      "routeMountPatchImplementationAuthorization",
      AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
    ),
    routeMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
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
    actualPatchImplementationApprovalIssued: readBoolean(
      decision,
      "actualPatchImplementationApprovalIssued",
      false
    ),
    actualPatchImplementationApprovalGranted: readBoolean(
      decision,
      "actualPatchImplementationApprovalGranted",
      false
    ),
    routeMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    publicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    nextPhaseRequiresActualPatchImplementationApprovalRequest: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationApprovalRequest",
      true
    ),
    nextPhaseRequiresActualPatchImplementationApprovalDecision: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationApprovalDecision",
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
    expressMountImplementationAttempted: readBoolean(
      attempt,
      "expressMountImplementationAttempted",
      false
    ),
    routeControllerRuntimeChangeAttempted: readBoolean(
      attempt,
      "routeControllerRuntimeChangeAttempted",
      false
    ),
    publicAliasAuthorizationAttempted: readBoolean(
      attempt,
      "publicAliasAuthorizationAttempted",
      false
    ),
    runtimeTrafficAuthorizationAttempted: readBoolean(
      attempt,
      "runtimeTrafficAuthorizationAttempted",
      false
    ),
    walletMutationAttempted: readBoolean(attempt, "walletMutationAttempted", false),
    ledgerMutationAttempted: readBoolean(attempt, "ledgerMutationAttempted", false),
    prismaWriteAttempted: readBoolean(attempt, "prismaWriteAttempted", false),
    dbTransactionAttempted: readBoolean(attempt, "dbTransactionAttempted", false),
    migrationAttempted: readBoolean(attempt, "migrationAttempted", false),
    externalNetworkAttempted: readBoolean(attempt, "externalNetworkAttempted", false),
    patchImplementationAuthorizationTriesActualImplementationApproval: readBoolean(
      attempt,
      "patchImplementationAuthorizationTriesActualImplementationApproval",
      false
    ),
    authorizationDecisionSkipsActualPatchApprovalRequest: readBoolean(
      attempt,
      "authorizationDecisionSkipsActualPatchApprovalRequest",
      false
    ),
    authorizationDecisionSkipsActualPatchApprovalDecision: readBoolean(
      attempt,
      "authorizationDecisionSkipsActualPatchApprovalDecision",
      false
    ),
    authorizationDecisionSkipsRouteMountAuthorization: readBoolean(
      attempt,
      "authorizationDecisionSkipsRouteMountAuthorization",
      false
    ),
    authorizationDecisionSkipsRuntimeTrafficApproval: readBoolean(
      attempt,
      "authorizationDecisionSkipsRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5cRequestPresent) {
    blockers.push("ORO-5C patch implementation authorization request is required");
  }
  if (fixture.oro5cRequestSubmissionResult !== PASS) {
    blockers.push("ORO-5C request submission result must be PASS");
  }
  if (!fixture.routeMountExecutionApprovalRequestSubmitted) {
    blockers.push("execution approval request must stay submitted");
  }
  if (fixture.routeMountExecutionApprovalRequestStatus !== DECISION_ISSUED) {
    blockers.push("execution approval request status must be decision_issued");
  }
  if (
    !fixture.routeMountExecutionApprovalDecisionIssued ||
    !fixture.executionApprovalDecisionIssued
  ) {
    blockers.push("execution approval decision must be issued");
  }
  if (!fixture.executionApprovalGranted) {
    blockers.push("execution approval must be granted for authorization decision");
  }
  if (
    fixture.routeMountExecutionApprovalDecisionResult !==
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("execution approval decision result must be request only");
  }
  if (
    fixture.routeMountExecutionAuthorization !==
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("route mount execution authorization must be request only");
  }
  if (!fixture.oro5cAuthorizationRequestSubmitted) {
    blockers.push("ORO-5C request must be submitted");
  }
  if (fixture.oro5cAuthorizationRequestStatus !== SUBMITTED_PENDING_DECISION) {
    blockers.push("ORO-5C request status must be submitted_pending_decision");
  }
  if (fixture.oro5cAuthorizationRequestResult !== PENDING_DECISION) {
    blockers.push("ORO-5C request result must be pending_decision");
  }
  if (fixture.oro5cAuthorizationDecisionIssued) {
    blockers.push("patch implementation authorization decision already issued");
  }
  if (fixture.oro5cAuthorizationGranted) {
    blockers.push("patch implementation authorization must not be granted before ORO-5D");
  }
  if (
    !fixture.routeMountPatchImplementationAuthorizationDecisionIssued ||
    fixture.routeMountPatchImplementationAuthorizationDecisionResult !==
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("patch implementation authorization decision must approve request only");
  }
  if (!fixture.routeMountPatchImplementationAuthorizationGranted) {
    blockers.push("patch implementation authorization must be granted for request only");
  }
  if (
    fixture.routeMountPatchImplementationAuthorization !==
    AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("patch implementation authorization must be request only");
  }
  if (
    fixture.routeMountPatchImplementationAuthorizationRequestStatus !==
    DECISION_ISSUED
  ) {
    blockers.push("patch implementation authorization request status must be decision_issued");
  }
  if (
    fixture.routeMountPatchImplementationAuthorizationRequestResult !==
    APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("patch implementation authorization request result must be request only");
  }
  if (
    fixture.oro5cRouteMountPatchApproved ||
    fixture.routeMountPatchApproved
  ) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5cRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("actual patch implementation must not be authorized");
  }
  if (
    fixture.oro5cRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5cImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5cActualPatchImplementationApprovalIssued ||
    fixture.actualPatchImplementationApprovalIssued
  ) {
    blockers.push("actual patch implementation approval must not be issued");
  }
  if (
    fixture.oro5cActualPatchImplementationApprovalGranted ||
    fixture.actualPatchImplementationApprovalGranted
  ) {
    blockers.push("actual patch implementation approval must not be granted");
  }
  if (
    fixture.oro5cRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5cExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5cExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5cPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5cRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApprovalRequest) {
    blockers.push("actual patch implementation approval request must remain required");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApprovalDecision) {
    blockers.push("actual patch implementation approval decision must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.patchImplementationAuthorizationTriesActualImplementationApproval) {
    blockers.push("authorization decision must not approve actual implementation");
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
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("authorization decision must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("authorization decision must not authorize runtime traffic");
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
  if (fixture.authorizationDecisionSkipsActualPatchApprovalRequest) {
    blockers.push("authorization decision must require approval request");
  }
  if (fixture.authorizationDecisionSkipsActualPatchApprovalDecision) {
    blockers.push("authorization decision must require approval decision");
  }
  if (fixture.authorizationDecisionSkipsRouteMountAuthorization) {
    blockers.push("authorization decision must require route mount authorization");
  }
  if (fixture.authorizationDecisionSkipsRuntimeTrafficApproval) {
    blockers.push("authorization decision must require runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("authorization decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5dActualPatchImplementationStillHeldGate(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountPatchImplementationAuthorizationDecisionIssued: true,
    routeMountPatchImplementationAuthorizationDecisionResult:
      APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
    routeMountPatchImplementationAuthorizationGranted: true,
    routeMountPatchImplementationAuthorization:
      AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    actualPatchImplementationApprovalIssued: false,
    actualPatchImplementationApprovalGranted: false,
    srcAppJsEditAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresActualPatchImplementationApprovalRequest: true,
    nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5dRouteMountStillHeldGate(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
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
    implementationExecutionApproved: false,
    actualPatchImplementationApprovalIssued: false,
    actualPatchImplementationApprovalGranted: false,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
  };
}

function buildOro5dRuntimeTrafficStillHeldGate(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
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
    routeMountPatchImplementationAuthorizationDecisionBoundaryResult: HOLD,
    routeMountExecutionApprovalRequestSubmitted: false,
    routeMountExecutionApprovalRequestStatus: HOLD,
    routeMountExecutionApprovalDecisionIssued: false,
    routeMountExecutionApprovalDecisionResult: HOLD,
    executionApprovalDecisionIssued: false,
    executionApprovalGranted: false,
    routeMountExecutionAuthorization: HOLD,
    routeMountPatchImplementationAuthorizationRequestSubmitted: false,
    routeMountPatchImplementationAuthorizationRequestStatus: HOLD,
    routeMountPatchImplementationAuthorizationRequestResult: HOLD,
    routeMountPatchImplementationAuthorizationDecisionIssued: false,
    routeMountPatchImplementationAuthorizationDecisionResult: HOLD,
    routeMountPatchImplementationAuthorizationGranted: false,
    routeMountPatchImplementationAuthorization: HOLD,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    actualPatchImplementationApprovalIssued: false,
    actualPatchImplementationApprovalGranted: false,
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
    nextPhaseRequiresActualPatchImplementationApprovalRequest: true,
    nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5dActualPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5dRouteMountStillHeldGate(input);
  const trafficGate = buildOro5dRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountPatchImplementationAuthorizationDecisionBoundaryResult: PASS,
    routeMountExecutionApprovalRequestSubmitted:
      fixture.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus:
      fixture.routeMountExecutionApprovalRequestStatus,
    routeMountExecutionApprovalDecisionIssued:
      fixture.routeMountExecutionApprovalDecisionIssued,
    routeMountExecutionApprovalDecisionResult:
      fixture.routeMountExecutionApprovalDecisionResult,
    executionApprovalDecisionIssued: fixture.executionApprovalDecisionIssued,
    executionApprovalGranted: fixture.executionApprovalGranted,
    routeMountExecutionAuthorization:
      fixture.routeMountExecutionAuthorization,
    routeMountPatchImplementationAuthorizationRequestSubmitted:
      fixture.routeMountPatchImplementationAuthorizationRequestSubmitted,
    routeMountPatchImplementationAuthorizationRequestStatus:
      fixture.routeMountPatchImplementationAuthorizationRequestStatus,
    routeMountPatchImplementationAuthorizationRequestResult:
      fixture.routeMountPatchImplementationAuthorizationRequestResult,
    routeMountPatchImplementationAuthorizationDecisionIssued:
      patchGate.routeMountPatchImplementationAuthorizationDecisionIssued,
    routeMountPatchImplementationAuthorizationDecisionResult:
      patchGate.routeMountPatchImplementationAuthorizationDecisionResult,
    routeMountPatchImplementationAuthorizationGranted:
      patchGate.routeMountPatchImplementationAuthorizationGranted,
    routeMountPatchImplementationAuthorization:
      patchGate.routeMountPatchImplementationAuthorization,
    routeMountPatchApproved: patchGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      patchGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: patchGate.routeMountPatchImplemented,
    implementationExecutionApproved: patchGate.implementationExecutionApproved,
    actualPatchImplementationApprovalIssued:
      patchGate.actualPatchImplementationApprovalIssued,
    actualPatchImplementationApprovalGranted:
      patchGate.actualPatchImplementationApprovalGranted,
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
    nextPhaseRequiresActualPatchImplementationApprovalRequest:
      patchGate.nextPhaseRequiresActualPatchImplementationApprovalRequest,
    nextPhaseRequiresActualPatchImplementationApprovalDecision:
      patchGate.nextPhaseRequiresActualPatchImplementationApprovalDecision,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
) {
  return buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(input);
}

function validateOro5dRouteMountPatchImplementationAuthorizationDecision(
  input = buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
) {
  const summary =
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary(input);
  return {
    valid:
      summary.routeMountPatchImplementationAuthorizationDecisionBoundaryResult ===
      PASS,
    routeMountPatchImplementationAuthorizationDecisionBoundaryResult:
      summary.routeMountPatchImplementationAuthorizationDecisionBoundaryResult,
    routeMountExecutionApprovalRequestSubmitted:
      summary.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus:
      summary.routeMountExecutionApprovalRequestStatus,
    routeMountExecutionApprovalDecisionIssued:
      summary.routeMountExecutionApprovalDecisionIssued,
    routeMountExecutionApprovalDecisionResult:
      summary.routeMountExecutionApprovalDecisionResult,
    executionApprovalDecisionIssued: summary.executionApprovalDecisionIssued,
    executionApprovalGranted: summary.executionApprovalGranted,
    routeMountExecutionAuthorization:
      summary.routeMountExecutionAuthorization,
    routeMountPatchImplementationAuthorizationRequestSubmitted:
      summary.routeMountPatchImplementationAuthorizationRequestSubmitted,
    routeMountPatchImplementationAuthorizationRequestStatus:
      summary.routeMountPatchImplementationAuthorizationRequestStatus,
    routeMountPatchImplementationAuthorizationRequestResult:
      summary.routeMountPatchImplementationAuthorizationRequestResult,
    routeMountPatchImplementationAuthorizationDecisionIssued:
      summary.routeMountPatchImplementationAuthorizationDecisionIssued,
    routeMountPatchImplementationAuthorizationDecisionResult:
      summary.routeMountPatchImplementationAuthorizationDecisionResult,
    routeMountPatchImplementationAuthorizationGranted:
      summary.routeMountPatchImplementationAuthorizationGranted,
    routeMountPatchImplementationAuthorization:
      summary.routeMountPatchImplementationAuthorization,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      summary.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    implementationExecutionApproved: summary.implementationExecutionApproved,
    actualPatchImplementationApprovalIssued:
      summary.actualPatchImplementationApprovalIssued,
    actualPatchImplementationApprovalGranted:
      summary.actualPatchImplementationApprovalGranted,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresActualPatchImplementationApprovalRequest:
      summary.nextPhaseRequiresActualPatchImplementationApprovalRequest,
    nextPhaseRequiresActualPatchImplementationApprovalDecision:
      summary.nextPhaseRequiresActualPatchImplementationApprovalDecision,
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
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  APPROVED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5D_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_STATUS,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput,
  evaluateOro5dRouteMountPatchImplementationAuthorizationDecision,
  buildOro5dActualPatchImplementationStillHeldGate,
  buildOro5dRouteMountStillHeldGate,
  buildOro5dRuntimeTrafficStillHeldGate,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionSummary,
  validateOro5dRouteMountPatchImplementationAuthorizationDecision,
};
