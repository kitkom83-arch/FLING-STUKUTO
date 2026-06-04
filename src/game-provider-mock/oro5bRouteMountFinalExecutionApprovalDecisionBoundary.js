"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  SUBMITTED_PENDING_DECISION,
  buildOro5aRouteMountExecutionApprovalRequestInput,
  evaluateOro5aRouteMountExecutionApprovalRequestSubmission,
} = require("./oro5aRouteMountExecutionApprovalRequestSubmission");

const PHASE = "ORO-5B";
const FAIL = "FAIL";
const DECISION_ISSUED = "decision_issued";
const APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY =
  "approved_for_patch_implementation_authorization_request_only";
const AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY =
  "authorized_for_patch_implementation_authorization_request_only";

const ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
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

function buildOro5bRouteMountFinalExecutionApprovalDecisionInput(overrides = {}) {
  const oro5aInput = buildOro5aRouteMountExecutionApprovalRequestInput();
  const oro5aSummary =
    evaluateOro5aRouteMountExecutionApprovalRequestSubmission(oro5aInput);
  const baseline = {
    id: "happyPathFinalExecutionApprovalDecisionIssued",
    phase: PHASE,
    oro5aRequest: {
      requestPresent: true,
      routeMountExecutionApprovalRequestSubmissionResult:
        oro5aSummary.routeMountExecutionApprovalRequestSubmissionResult,
      routeMountExecutionApprovalRequestSubmitted:
        oro5aSummary.routeMountExecutionApprovalRequestSubmitted,
      routeMountExecutionApprovalRequestStatus:
        oro5aSummary.routeMountExecutionApprovalRequestStatus,
      routeMountPatchReviewDecisionAcknowledged:
        oro5aSummary.routeMountPatchReviewDecisionAcknowledged,
      routeMountPatchReviewResult: oro5aSummary.routeMountPatchReviewResult,
      executionApprovalDecisionIssued:
        oro5aSummary.executionApprovalDecisionIssued,
      executionApprovalGranted: oro5aSummary.executionApprovalGranted,
      routeMountPatchApproved: oro5aSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5aSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5aSummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro5aSummary.implementationExecutionApproved,
      routeMountExecutionAuthorization:
        oro5aSummary.routeMountExecutionAuthorization,
      routeMountAuthorization: oro5aSummary.routeMountAuthorization,
      expressMountAllowed: oro5aSummary.expressMountAllowed,
      expressMountImplemented: oro5aSummary.expressMountImplemented,
      publicAliasAllowed: oro5aSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5aSummary.runtimeTrafficAllowed,
    },
    finalDecision: {
      routeMountExecutionApprovalRequestSubmitted: true,
      routeMountExecutionApprovalRequestStatus: DECISION_ISSUED,
      routeMountExecutionApprovalDecisionIssued: true,
      routeMountExecutionApprovalDecisionResult:
        APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
      routeMountPatchReviewDecisionAcknowledged: true,
      routeMountPatchReviewResult:
        REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
      executionApprovalDecisionIssued: true,
      executionApprovalGranted: true,
      routeMountExecutionAuthorization:
        AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresPatchImplementationAuthorizationRequest: true,
      nextPhaseRequiresActualPatchImplementationApproval: true,
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
      executionDecisionTriesPatchImplementationApproval: false,
      executionDecisionSkipsPatchImplementationAuthorizationRequest: false,
      executionDecisionSkipsPatchImplementationApproval: false,
      executionDecisionSkipsRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-final-execution-approval-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5bRouteMountFinalExecutionApprovalDecisionInput();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro5aRequest) ? merged.oro5aRequest : {};
  const decision = isPlainObject(merged.finalDecision) ? merged.finalDecision : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5aRequestPresent: readBoolean(request, "requestPresent", true),
    oro5aRequestResult: readString(
      request,
      "routeMountExecutionApprovalRequestSubmissionResult",
      PASS
    ),
    oro5aRouteMountExecutionApprovalRequestSubmitted: readBoolean(
      request,
      "routeMountExecutionApprovalRequestSubmitted",
      true
    ),
    oro5aRouteMountExecutionApprovalRequestStatus: readString(
      request,
      "routeMountExecutionApprovalRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    oro5aRouteMountPatchReviewDecisionAcknowledged: readBoolean(
      request,
      "routeMountPatchReviewDecisionAcknowledged",
      true
    ),
    oro5aRouteMountPatchReviewResult: readString(
      request,
      "routeMountPatchReviewResult",
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
    ),
    oro5aExecutionApprovalDecisionIssued: readBoolean(
      request,
      "executionApprovalDecisionIssued",
      false
    ),
    oro5aExecutionApprovalGranted: readBoolean(
      request,
      "executionApprovalGranted",
      false
    ),
    oro5aRouteMountPatchApproved: readBoolean(
      request,
      "routeMountPatchApproved",
      false
    ),
    oro5aRouteMountPatchImplementationAuthorized: readBoolean(
      request,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5aRouteMountPatchImplemented: readBoolean(
      request,
      "routeMountPatchImplemented",
      false
    ),
    oro5aImplementationExecutionApproved: readBoolean(
      request,
      "implementationExecutionApproved",
      false
    ),
    oro5aRouteMountExecutionAuthorization: readString(
      request,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
    ),
    oro5aRouteMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5aExpressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    oro5aExpressMountImplemented: readBoolean(
      request,
      "expressMountImplemented",
      false
    ),
    oro5aPublicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    oro5aRuntimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
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
    nextPhaseRequiresPatchImplementationAuthorizationRequest: readBoolean(
      decision,
      "nextPhaseRequiresPatchImplementationAuthorizationRequest",
      true
    ),
    nextPhaseRequiresActualPatchImplementationApproval: readBoolean(
      decision,
      "nextPhaseRequiresActualPatchImplementationApproval",
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
    executionDecisionTriesPatchImplementationApproval: readBoolean(
      attempt,
      "executionDecisionTriesPatchImplementationApproval",
      false
    ),
    executionDecisionSkipsPatchImplementationAuthorizationRequest: readBoolean(
      attempt,
      "executionDecisionSkipsPatchImplementationAuthorizationRequest",
      false
    ),
    executionDecisionSkipsPatchImplementationApproval: readBoolean(
      attempt,
      "executionDecisionSkipsPatchImplementationApproval",
      false
    ),
    executionDecisionSkipsRuntimeTrafficApproval: readBoolean(
      attempt,
      "executionDecisionSkipsRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5aRequestPresent) {
    blockers.push("ORO-5A request submission is required");
  }
  if (fixture.oro5aRequestResult !== PASS) {
    blockers.push("ORO-5A request submission result must be PASS");
  }
  if (!fixture.oro5aRouteMountExecutionApprovalRequestSubmitted) {
    blockers.push("ORO-5A request must be submitted");
  }
  if (
    fixture.oro5aRouteMountExecutionApprovalRequestStatus !==
    SUBMITTED_PENDING_DECISION
  ) {
    blockers.push("ORO-5A request status must be submitted_pending_decision");
  }
  if (!fixture.oro5aRouteMountPatchReviewDecisionAcknowledged) {
    blockers.push("ORO-5A patch review decision must be acknowledged");
  }
  if (
    fixture.oro5aRouteMountPatchReviewResult !==
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("ORO-5A patch review result must be request only");
  }
  if (fixture.oro5aExecutionApprovalDecisionIssued) {
    blockers.push("execution approval decision must not be previously issued");
  }
  if (fixture.oro5aExecutionApprovalGranted) {
    blockers.push("ORO-5A must not have granted execution approval");
  }
  if (
    fixture.oro5aRouteMountPatchApproved ||
    fixture.routeMountPatchApproved
  ) {
    blockers.push("route mount patch must not be approved by final decision");
  }
  if (
    fixture.oro5aRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("patch implementation must not be authorized by final decision");
  }
  if (
    fixture.oro5aRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5aImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5aRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (
    fixture.oro5aRouteMountExecutionAuthorization !==
    NOT_AUTHORIZED_FOR_EXECUTION
  ) {
    blockers.push("ORO-5A route mount execution authorization must be blocked");
  }
  if (
    fixture.routeMountExecutionAuthorization !==
    AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("route mount execution authorization must be next request only");
  }
  if (fixture.oro5aExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5aExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5aPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5aRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.routeMountExecutionApprovalRequestSubmitted) {
    blockers.push("final decision must preserve request submitted");
  }
  if (fixture.routeMountExecutionApprovalRequestStatus !== DECISION_ISSUED) {
    blockers.push("final decision status must be decision_issued");
  }
  if (!fixture.routeMountExecutionApprovalDecisionIssued) {
    blockers.push("route mount execution approval decision must be issued");
  }
  if (
    fixture.routeMountExecutionApprovalDecisionResult !==
    APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY
  ) {
    blockers.push("route mount execution approval decision must be next request only");
  }
  if (!fixture.routeMountPatchReviewDecisionAcknowledged) {
    blockers.push("patch review decision must stay acknowledged");
  }
  if (
    fixture.routeMountPatchReviewResult !==
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("patch review result must remain request only");
  }
  if (!fixture.executionApprovalDecisionIssued) {
    blockers.push("execution approval decision must be issued");
  }
  if (!fixture.executionApprovalGranted) {
    blockers.push("execution approval must be granted for next request only");
  }
  if (!fixture.nextPhaseRequiresPatchImplementationAuthorizationRequest) {
    blockers.push("next phase must require patch implementation authorization request");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApproval) {
    blockers.push("actual patch implementation approval must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("final decision must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("final decision must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("final decision must not implement Express mount");
  }
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("final decision must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("final decision must not authorize runtime traffic");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("final decision must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("final decision must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("final decision must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("final decision must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("final decision must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("final decision must not try external network");
  }
  if (fixture.executionDecisionTriesPatchImplementationApproval) {
    blockers.push("execution decision must not approve patch implementation");
  }
  if (fixture.executionDecisionSkipsPatchImplementationAuthorizationRequest) {
    blockers.push("final decision must require patch implementation authorization request");
  }
  if (fixture.executionDecisionSkipsPatchImplementationApproval) {
    blockers.push("final decision must not skip actual patch implementation approval");
  }
  if (fixture.executionDecisionSkipsRuntimeTrafficApproval) {
    blockers.push("final decision must not skip separate runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("final decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5bPatchImplementationStillHeldGate(
  input = buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountExecutionApprovalRequestSubmitted: true,
    routeMountExecutionApprovalRequestStatus: DECISION_ISSUED,
    routeMountExecutionApprovalDecisionIssued: true,
    routeMountExecutionApprovalDecisionResult:
      APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    routeMountPatchReviewDecisionAcknowledged: true,
    routeMountPatchReviewResult:
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
    executionApprovalDecisionIssued: true,
    executionApprovalGranted: true,
    routeMountExecutionAuthorization:
      AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    patchImplementationAuthorizationRequestAllowed: true,
    patchImplementationAuthorizationRequestRequired: true,
    patchImplementationAuthorized: false,
    actualPatchImplementationApprovalRequired: true,
    srcAppJsEditAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresPatchImplementationAuthorizationRequest: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5bRouteMountStillHeldGate(
  input = buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    expressMountImplemented: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    routeControllerRuntimeChangeAllowed: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountFinalExecutionApprovalDecisionBoundaryResult: HOLD,
    routeMountExecutionApprovalRequestSubmitted: false,
    routeMountExecutionApprovalRequestStatus: HOLD,
    routeMountExecutionApprovalDecisionIssued: false,
    routeMountExecutionApprovalDecisionResult: HOLD,
    routeMountPatchReviewDecisionAcknowledged: false,
    routeMountPatchReviewResult: HOLD,
    executionApprovalDecisionIssued: false,
    executionApprovalGranted: false,
    routeMountExecutionAuthorization: NOT_AUTHORIZED_FOR_EXECUTION,
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
    nextPhaseRequiresPatchImplementationAuthorizationRequest: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5bRouteMountFinalExecutionApprovalDecisionSummary(
  input = buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5bPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5bRouteMountStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountFinalExecutionApprovalDecisionBoundaryResult: PASS,
    routeMountExecutionApprovalRequestSubmitted:
      patchGate.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus:
      patchGate.routeMountExecutionApprovalRequestStatus,
    routeMountExecutionApprovalDecisionIssued:
      patchGate.routeMountExecutionApprovalDecisionIssued,
    routeMountExecutionApprovalDecisionResult:
      patchGate.routeMountExecutionApprovalDecisionResult,
    routeMountPatchReviewDecisionAcknowledged:
      patchGate.routeMountPatchReviewDecisionAcknowledged,
    routeMountPatchReviewResult: patchGate.routeMountPatchReviewResult,
    executionApprovalDecisionIssued: patchGate.executionApprovalDecisionIssued,
    executionApprovalGranted: patchGate.executionApprovalGranted,
    routeMountExecutionAuthorization:
      patchGate.routeMountExecutionAuthorization,
    routeMountPatchApproved: patchGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      patchGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: patchGate.routeMountPatchImplemented,
    implementationExecutionApproved: patchGate.implementationExecutionApproved,
    routeMountAuthorization: mountGate.routeMountAuthorization,
    expressMountAllowed: mountGate.expressMountAllowed,
    expressMountImplemented: mountGate.expressMountImplemented,
    srcAppJsEditAllowed: patchGate.srcAppJsEditAllowed,
    publicAliasAllowed: mountGate.publicAliasAllowed,
    runtimeTrafficAllowed: mountGate.runtimeTrafficAllowed,
    walletMutationAllowed: patchGate.walletMutationAllowed,
    ledgerMutationAllowed: patchGate.ledgerMutationAllowed,
    prismaWriteAllowed: patchGate.prismaWriteAllowed,
    dbTransactionAllowed: patchGate.dbTransactionAllowed,
    migrationAllowed: patchGate.migrationAllowed,
    externalNetworkAllowed: patchGate.externalNetworkAllowed,
    nextPhaseRequiresPatchImplementationAuthorizationRequest:
      patchGate.nextPhaseRequiresPatchImplementationAuthorizationRequest,
    nextPhaseRequiresActualPatchImplementationApproval:
      patchGate.nextPhaseRequiresActualPatchImplementationApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5bRouteMountFinalExecutionApprovalDecision(
  input = buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
) {
  return buildOro5bRouteMountFinalExecutionApprovalDecisionSummary(input);
}

function validateOro5bRouteMountFinalExecutionApprovalDecision(
  input = buildOro5bRouteMountFinalExecutionApprovalDecisionInput()
) {
  const summary =
    buildOro5bRouteMountFinalExecutionApprovalDecisionSummary(input);
  return {
    valid: summary.routeMountFinalExecutionApprovalDecisionBoundaryResult === PASS,
    routeMountFinalExecutionApprovalDecisionBoundaryResult:
      summary.routeMountFinalExecutionApprovalDecisionBoundaryResult,
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
    nextPhaseRequiresPatchImplementationAuthorizationRequest:
      summary.nextPhaseRequiresPatchImplementationAuthorizationRequest,
    nextPhaseRequiresActualPatchImplementationApproval:
      summary.nextPhaseRequiresActualPatchImplementationApproval,
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
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  APPROVED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  AUTHORIZED_FOR_PATCH_IMPLEMENTATION_AUTHORIZATION_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  ORO_5B_ROUTE_MOUNT_FINAL_EXECUTION_APPROVAL_DECISION_STATUS,
  buildOro5bRouteMountFinalExecutionApprovalDecisionInput,
  evaluateOro5bRouteMountFinalExecutionApprovalDecision,
  buildOro5bPatchImplementationStillHeldGate,
  buildOro5bRouteMountStillHeldGate,
  buildOro5bRouteMountFinalExecutionApprovalDecisionSummary,
  validateOro5bRouteMountFinalExecutionApprovalDecision,
};
