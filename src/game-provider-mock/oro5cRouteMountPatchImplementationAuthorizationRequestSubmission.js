"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  DECISION_ISSUED,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  buildOro5bRouteMountFinalExecutionApprovalDecisionInput,
  evaluateOro5bRouteMountFinalExecutionApprovalDecision,
} = require("./oro5bRouteMountFinalExecutionApprovalDecisionBoundary");

const PHASE = "ORO-5C";
const FAIL = "FAIL";
const SUBMITTED_PENDING_DECISION = "submitted_pending_decision";
const PENDING_DECISION = "pending_decision";
const NOT_SUBMITTED = "not_submitted";
const BASELINE_ORO5B_SUMMARY =
  evaluateOro5bRouteMountFinalExecutionApprovalDecision(
    buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
  );

const ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    DECISION_ISSUED,
    SUBMITTED_PENDING_DECISION,
    PENDING_DECISION,
    NOT_SUBMITTED,
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
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

function buildOro5cRouteMountPatchImplementationAuthorizationRequestInput(
  overrides = {}
) {
  const oro5bSummary = BASELINE_ORO5B_SUMMARY;
  const baseline = {
    id: "happyPathPatchImplementationAuthorizationRequestSubmitted",
    phase: PHASE,
    oro5bDecision: {
      decisionPresent: true,
      routeMountFinalExecutionApprovalDecisionBoundaryResult:
        oro5bSummary.routeMountFinalExecutionApprovalDecisionBoundaryResult,
      routeMountExecutionApprovalRequestSubmitted:
        oro5bSummary.routeMountExecutionApprovalRequestSubmitted,
      routeMountExecutionApprovalRequestStatus:
        oro5bSummary.routeMountExecutionApprovalRequestStatus,
      routeMountExecutionApprovalDecisionIssued:
        oro5bSummary.routeMountExecutionApprovalDecisionIssued,
      routeMountExecutionApprovalDecisionResult:
        oro5bSummary.routeMountExecutionApprovalDecisionResult,
      routeMountPatchReviewDecisionAcknowledged:
        oro5bSummary.routeMountPatchReviewDecisionAcknowledged,
      routeMountPatchReviewResult: oro5bSummary.routeMountPatchReviewResult,
      executionApprovalDecisionIssued:
        oro5bSummary.executionApprovalDecisionIssued,
      executionApprovalGranted: oro5bSummary.executionApprovalGranted,
      routeMountExecutionAuthorization:
        oro5bSummary.routeMountExecutionAuthorization,
      routeMountPatchApproved: oro5bSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5bSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5bSummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro5bSummary.implementationExecutionApproved,
      routeMountAuthorization: oro5bSummary.routeMountAuthorization,
      expressMountAllowed: oro5bSummary.expressMountAllowed,
      expressMountImplemented: oro5bSummary.expressMountImplemented,
      publicAliasAllowed: oro5bSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5bSummary.runtimeTrafficAllowed,
      nextPhaseRequiresPatchImplementationAuthorizationRequest:
        oro5bSummary.nextPhaseRequiresPatchImplementationAuthorizationRequest,
      nextPhaseRequiresActualPatchImplementationApproval:
        oro5bSummary.nextPhaseRequiresActualPatchImplementationApproval,
      nextPhaseRequiresSeparateRuntimeTrafficApproval:
        oro5bSummary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    },
    priorRequest: {
      routeMountPatchImplementationAuthorizationRequestSubmitted: false,
      routeMountPatchImplementationAuthorizationRequestStatus: NOT_SUBMITTED,
      routeMountPatchImplementationAuthorizationRequestResult: NOT_SUBMITTED,
      routeMountPatchImplementationAuthorizationDecisionIssued: false,
      routeMountPatchImplementationAuthorizationGranted: false,
    },
    requestSubmission: {
      routeMountPatchImplementationAuthorizationRequestSubmitted: true,
      routeMountPatchImplementationAuthorizationRequestStatus:
        SUBMITTED_PENDING_DECISION,
      routeMountPatchImplementationAuthorizationRequestResult: PENDING_DECISION,
      routeMountPatchImplementationAuthorizationDecisionIssued: false,
      routeMountPatchImplementationAuthorizationGranted: false,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresPatchImplementationAuthorizationDecision: true,
      nextPhaseRequiresActualPatchImplementationApproval: true,
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
      requestSubmissionSkipsAuthorizationDecision: false,
      requestSubmissionSkipsPatchImplementationApproval: false,
      requestSubmissionSkipsRouteMountAuthorization: false,
      requestSubmissionSkipsRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-patch-implementation-authorization-request",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro5bDecision) ? merged.oro5bDecision : {};
  const prior = isPlainObject(merged.priorRequest) ? merged.priorRequest : {};
  const request = isPlainObject(merged.requestSubmission)
    ? merged.requestSubmission
    : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5bDecisionPresent: readBoolean(decision, "decisionPresent", true),
    oro5bDecisionResult: readString(
      decision,
      "routeMountFinalExecutionApprovalDecisionBoundaryResult",
      PASS
    ),
    routeMountExecutionApprovalRequestSubmitted: readBoolean(
      decision,
      "routeMountExecutionApprovalRequestSubmitted",
      true
    ),
    routeMountExecutionApprovalRequestStatus: readString(
      decision,
      "routeMountExecutionApprovalRequestStatus",
      DECISION_ISSUED
    ),
    routeMountExecutionApprovalDecisionIssued: readBoolean(
      decision,
      "routeMountExecutionApprovalDecisionIssued",
      true
    ),
    routeMountExecutionApprovalDecisionResult: readString(
      decision,
      "routeMountExecutionApprovalDecisionResult",
      APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    routeMountPatchReviewDecisionAcknowledged: readBoolean(
      decision,
      "routeMountPatchReviewDecisionAcknowledged",
      true
    ),
    routeMountPatchReviewResult: readString(
      decision,
      "routeMountPatchReviewResult",
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
    ),
    executionApprovalDecisionIssued: readBoolean(
      decision,
      "executionApprovalDecisionIssued",
      true
    ),
    executionApprovalGranted: readBoolean(decision, "executionApprovalGranted", true),
    routeMountExecutionAuthorization: readString(
      decision,
      "routeMountExecutionAuthorization",
      AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
    ),
    oro5bRouteMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    oro5bRouteMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5bRouteMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    oro5bImplementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    oro5bRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5bExpressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    oro5bExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro5bPublicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    oro5bRuntimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    priorRequestSubmitted: readBoolean(
      prior,
      "routeMountPatchImplementationAuthorizationRequestSubmitted",
      false
    ),
    priorRequestStatus: readString(
      prior,
      "routeMountPatchImplementationAuthorizationRequestStatus",
      NOT_SUBMITTED
    ),
    priorRequestResult: readString(
      prior,
      "routeMountPatchImplementationAuthorizationRequestResult",
      NOT_SUBMITTED
    ),
    priorAuthorizationDecisionIssued: readBoolean(
      prior,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    priorAuthorizationGranted: readBoolean(
      prior,
      "routeMountPatchImplementationAuthorizationGranted",
      false
    ),
    routeMountPatchImplementationAuthorizationRequestSubmitted: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationRequestSubmitted",
      true
    ),
    routeMountPatchImplementationAuthorizationRequestStatus: readString(
      request,
      "routeMountPatchImplementationAuthorizationRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    routeMountPatchImplementationAuthorizationRequestResult: readString(
      request,
      "routeMountPatchImplementationAuthorizationRequestResult",
      PENDING_DECISION
    ),
    routeMountPatchImplementationAuthorizationDecisionIssued: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      false
    ),
    routeMountPatchImplementationAuthorizationGranted: readBoolean(
      request,
      "routeMountPatchImplementationAuthorizationGranted",
      false
    ),
    routeMountPatchApproved: readBoolean(
      request,
      "routeMountPatchApproved",
      false
    ),
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
    expressMountImplemented: readBoolean(
      request,
      "expressMountImplemented",
      false
    ),
    publicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    nextPhaseRequiresPatchImplementationAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresPatchImplementationAuthorizationDecision",
      true
    ),
    nextPhaseRequiresActualPatchImplementationApproval: readBoolean(
      request,
      "nextPhaseRequiresActualPatchImplementationApproval",
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
    requestSubmissionSkipsAuthorizationDecision: readBoolean(
      attempt,
      "requestSubmissionSkipsAuthorizationDecision",
      false
    ),
    requestSubmissionSkipsPatchImplementationApproval: readBoolean(
      attempt,
      "requestSubmissionSkipsPatchImplementationApproval",
      false
    ),
    requestSubmissionSkipsRouteMountAuthorization: readBoolean(
      attempt,
      "requestSubmissionSkipsRouteMountAuthorization",
      false
    ),
    requestSubmissionSkipsRuntimeTrafficApproval: readBoolean(
      attempt,
      "requestSubmissionSkipsRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5bDecisionPresent) {
    blockers.push("ORO-5B final execution decision is required");
  }
  if (fixture.oro5bDecisionResult !== PASS) {
    blockers.push("ORO-5B final execution decision result must be PASS");
  }
  if (!fixture.routeMountExecutionApprovalRequestSubmitted) {
    blockers.push("ORO-5B execution approval request must stay submitted");
  }
  if (fixture.routeMountExecutionApprovalRequestStatus !== DECISION_ISSUED) {
    blockers.push("ORO-5B execution approval request status must be decision_issued");
  }
  if (
    !fixture.routeMountExecutionApprovalDecisionIssued ||
    !fixture.executionApprovalDecisionIssued
  ) {
    blockers.push("execution approval decision must be issued");
  }
  if (!fixture.executionApprovalGranted) {
    blockers.push("execution approval must be granted for request submission");
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
  if (fixture.priorRequestSubmitted) {
    blockers.push("patch implementation authorization request already submitted with conflicting state");
  }
  if (
    fixture.priorAuthorizationDecisionIssued ||
    fixture.routeMountPatchImplementationAuthorizationDecisionIssued
  ) {
    blockers.push("patch implementation authorization decision must not be issued");
  }
  if (
    fixture.priorAuthorizationGranted ||
    fixture.routeMountPatchImplementationAuthorizationGranted
  ) {
    blockers.push("patch implementation authorization must not be granted");
  }
  if (!fixture.routeMountPatchImplementationAuthorizationRequestSubmitted) {
    blockers.push("patch implementation authorization request must be submitted");
  }
  if (
    fixture.routeMountPatchImplementationAuthorizationRequestStatus !==
    SUBMITTED_PENDING_DECISION
  ) {
    blockers.push("patch implementation authorization request status must stay pending");
  }
  if (
    fixture.routeMountPatchImplementationAuthorizationRequestResult !==
    PENDING_DECISION
  ) {
    blockers.push("patch implementation authorization request result must stay pending");
  }
  if (
    fixture.oro5bRouteMountPatchApproved ||
    fixture.routeMountPatchApproved
  ) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5bRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("patch implementation must not be authorized");
  }
  if (
    fixture.oro5bRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5bImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5bRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5bExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5bExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5bPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5bRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.nextPhaseRequiresPatchImplementationAuthorizationDecision) {
    blockers.push("patch implementation authorization decision must remain required");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApproval) {
    blockers.push("actual patch implementation approval must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("request submission must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("request submission must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("request submission must not implement Express mount");
  }
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("request submission must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("request submission must not authorize runtime traffic");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("request submission must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("request submission must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("request submission must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("request submission must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("request submission must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("request submission must not try external network");
  }
  if (fixture.requestSubmissionSkipsAuthorizationDecision) {
    blockers.push("request submission must not skip authorization decision");
  }
  if (fixture.requestSubmissionSkipsPatchImplementationApproval) {
    blockers.push("request submission must not skip patch implementation approval");
  }
  if (fixture.requestSubmissionSkipsRouteMountAuthorization) {
    blockers.push("request submission must not skip route mount authorization");
  }
  if (fixture.requestSubmissionSkipsRuntimeTrafficApproval) {
    blockers.push("request submission must not skip runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("request submission output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5cPatchImplementationStillHeldGate(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountPatchImplementationAuthorizationRequestSubmitted: true,
    routeMountPatchImplementationAuthorizationRequestStatus:
      SUBMITTED_PENDING_DECISION,
    routeMountPatchImplementationAuthorizationRequestResult: PENDING_DECISION,
    routeMountPatchImplementationAuthorizationDecisionIssued: false,
    routeMountPatchImplementationAuthorizationGranted: false,
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
    nextPhaseRequiresPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5cRouteMountStillHeldGate(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
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
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
  };
}

function buildOro5cRuntimeTrafficStillHeldGate(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
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
    routeMountPatchImplementationAuthorizationRequestSubmissionResult: HOLD,
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
    routeMountPatchImplementationAuthorizationGranted: false,
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
    nextPhaseRequiresPatchImplementationAuthorizationDecision: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5cPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5cRouteMountStillHeldGate(input);
  const trafficGate = buildOro5cRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountPatchImplementationAuthorizationRequestSubmissionResult: PASS,
    routeMountExecutionApprovalRequestSubmitted:
      fixture.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus:
      fixture.routeMountExecutionApprovalRequestStatus,
    routeMountExecutionApprovalDecisionIssued:
      fixture.routeMountExecutionApprovalDecisionIssued,
    routeMountExecutionApprovalDecisionResult:
      fixture.routeMountExecutionApprovalDecisionResult,
    routeMountPatchReviewDecisionAcknowledged:
      fixture.routeMountPatchReviewDecisionAcknowledged,
    routeMountPatchReviewResult: fixture.routeMountPatchReviewResult,
    executionApprovalDecisionIssued: fixture.executionApprovalDecisionIssued,
    executionApprovalGranted: fixture.executionApprovalGranted,
    routeMountExecutionAuthorization:
      fixture.routeMountExecutionAuthorization,
    routeMountPatchImplementationAuthorizationRequestSubmitted:
      patchGate.routeMountPatchImplementationAuthorizationRequestSubmitted,
    routeMountPatchImplementationAuthorizationRequestStatus:
      patchGate.routeMountPatchImplementationAuthorizationRequestStatus,
    routeMountPatchImplementationAuthorizationRequestResult:
      patchGate.routeMountPatchImplementationAuthorizationRequestResult,
    routeMountPatchImplementationAuthorizationDecisionIssued:
      patchGate.routeMountPatchImplementationAuthorizationDecisionIssued,
    routeMountPatchImplementationAuthorizationGranted:
      patchGate.routeMountPatchImplementationAuthorizationGranted,
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
    nextPhaseRequiresPatchImplementationAuthorizationDecision:
      patchGate.nextPhaseRequiresPatchImplementationAuthorizationDecision,
    nextPhaseRequiresActualPatchImplementationApproval:
      patchGate.nextPhaseRequiresActualPatchImplementationApproval,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
) {
  return buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary(input);
}

function validateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission(
  input = buildOro5cRouteMountPatchImplementationAuthorizationRequestInput()
) {
  const summary =
    buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary(input);
  return {
    valid:
      summary.routeMountPatchImplementationAuthorizationRequestSubmissionResult ===
      PASS,
    routeMountPatchImplementationAuthorizationRequestSubmissionResult:
      summary.routeMountPatchImplementationAuthorizationRequestSubmissionResult,
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
    routeMountPatchImplementationAuthorizationGranted:
      summary.routeMountPatchImplementationAuthorizationGranted,
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
    nextPhaseRequiresPatchImplementationAuthorizationDecision:
      summary.nextPhaseRequiresPatchImplementationAuthorizationDecision,
    nextPhaseRequiresActualPatchImplementationApproval:
      summary.nextPhaseRequiresActualPatchImplementationApproval,
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
  NOT_SUBMITTED,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5C_ROUTE_MOUNT_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestInput,
  evaluateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
  buildOro5cPatchImplementationStillHeldGate,
  buildOro5cRouteMountStillHeldGate,
  buildOro5cRuntimeTrafficStillHeldGate,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestSummary,
  validateOro5cRouteMountPatchImplementationAuthorizationRequestSubmission,
};
