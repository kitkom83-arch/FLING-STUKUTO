"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  buildOro4zRouteMountPatchReviewInput,
  evaluateOro4zRouteMountPatchReviewDecisionBoundary,
} = require("./oro4zRouteMountPatchReviewDecisionBoundary");

const PHASE = "ORO-5A";
const FAIL = "FAIL";
const SUBMITTED_PENDING_DECISION = "submitted_pending_decision";
const REQUEST_SUBMITTED = "route_mount_execution_approval_request_submitted";

const ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  REQUEST_SUBMITTED,
  SUBMITTED_PENDING_DECISION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
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

function buildOro5aRouteMountExecutionApprovalRequestInput(overrides = {}) {
  const oro4zInput = buildOro4zRouteMountPatchReviewInput();
  const oro4zSummary =
    evaluateOro4zRouteMountPatchReviewDecisionBoundary(oro4zInput);
  const baseline = {
    id: "happyPathExecutionApprovalRequestSubmittedDecisionPending",
    phase: PHASE,
    oro4zDecision: {
      decisionPresent: true,
      routeMountPatchReviewDecisionBoundaryResult:
        oro4zSummary.routeMountPatchReviewDecisionBoundaryResult,
      routeMountPatchReviewDecisionIssued:
        oro4zSummary.routeMountPatchReviewDecisionIssued,
      routeMountPatchReviewed: oro4zSummary.routeMountPatchReviewed,
      routeMountPatchReviewResult: oro4zSummary.routeMountPatchReviewResult,
      routeMountPatchApproved: oro4zSummary.routeMountPatchApproved,
      routeMountPatchImplemented: oro4zSummary.routeMountPatchImplemented,
      executionApprovalGranted: oro4zSummary.executionApprovalGranted,
      implementationExecutionApproved:
        oro4zSummary.implementationExecutionApproved,
      routeMountExecutionAuthorization:
        oro4zSummary.routeMountExecutionAuthorization,
      routeMountAuthorization: oro4zSummary.routeMountAuthorization,
      expressMountAllowed: oro4zSummary.expressMountAllowed,
      expressMountImplemented: oro4zSummary.expressMountImplemented,
      publicAliasAllowed: oro4zSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro4zSummary.runtimeTrafficAllowed,
    },
    requestSubmission: {
      routeMountExecutionApprovalRequestSubmitted: true,
      routeMountExecutionApprovalRequestStatus: SUBMITTED_PENDING_DECISION,
      routeMountPatchReviewDecisionAcknowledged: true,
      routeMountPatchReviewResult:
        REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
      executionApprovalDecisionIssued: false,
      executionApprovalGranted: false,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      implementationExecutionApproved: false,
      routeMountExecutionAuthorization: NOT_AUTHORIZED_FOR_EXECUTION,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresFinalExecutionApprovalDecision: true,
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
      requestSubmissionTreatedAsFinalExecutionApproval: false,
      requestSubmissionSkipsPatchImplementationApproval: false,
      requestSubmissionSkipsRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-execution-approval-request-submission",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5aRouteMountExecutionApprovalRequestInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro4zDecision) ? merged.oro4zDecision : {};
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
    oro4zPatchReviewDecisionPresent: readBoolean(
      decision,
      "decisionPresent",
      true
    ),
    oro4zRouteMountPatchReviewDecisionBoundaryResult: readString(
      decision,
      "routeMountPatchReviewDecisionBoundaryResult",
      PASS
    ),
    routeMountPatchReviewDecisionIssued: readBoolean(
      decision,
      "routeMountPatchReviewDecisionIssued",
      true
    ),
    routeMountPatchReviewed: readBoolean(
      decision,
      "routeMountPatchReviewed",
      true
    ),
    routeMountPatchReviewResult: readString(
      decision,
      "routeMountPatchReviewResult",
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
    ),
    oro4zRouteMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    oro4zRouteMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    oro4zExecutionApprovalGranted: readBoolean(
      decision,
      "executionApprovalGranted",
      false
    ),
    oro4zImplementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    oro4zRouteMountExecutionAuthorization: readString(
      decision,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
    ),
    oro4zRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4zExpressMountAllowed: readBoolean(
      decision,
      "expressMountAllowed",
      false
    ),
    oro4zExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro4zPublicAliasAllowed: readBoolean(
      decision,
      "publicAliasAllowed",
      false
    ),
    oro4zRuntimeTrafficAllowed: readBoolean(
      decision,
      "runtimeTrafficAllowed",
      false
    ),
    routeMountExecutionApprovalRequestSubmitted: readBoolean(
      request,
      "routeMountExecutionApprovalRequestSubmitted",
      true
    ),
    routeMountExecutionApprovalRequestStatus: readString(
      request,
      "routeMountExecutionApprovalRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    routeMountPatchReviewDecisionAcknowledged: readBoolean(
      request,
      "routeMountPatchReviewDecisionAcknowledged",
      true
    ),
    requestRouteMountPatchReviewResult: readString(
      request,
      "routeMountPatchReviewResult",
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
    ),
    executionApprovalDecisionIssued: readBoolean(
      request,
      "executionApprovalDecisionIssued",
      false
    ),
    executionApprovalGranted: readBoolean(
      request,
      "executionApprovalGranted",
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
    routeMountExecutionAuthorization: readString(
      request,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
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
    nextPhaseRequiresFinalExecutionApprovalDecision: readBoolean(
      request,
      "nextPhaseRequiresFinalExecutionApprovalDecision",
      true
    ),
    nextPhaseRequiresActualPatchImplementationApproval: readBoolean(
      request,
      "nextPhaseRequiresActualPatchImplementationApproval",
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
    requestSubmissionTreatedAsFinalExecutionApproval: readBoolean(
      attempt,
      "requestSubmissionTreatedAsFinalExecutionApproval",
      false
    ),
    requestSubmissionSkipsPatchImplementationApproval: readBoolean(
      attempt,
      "requestSubmissionSkipsPatchImplementationApproval",
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

  if (!fixture.oro4zPatchReviewDecisionPresent) {
    blockers.push("ORO-4Z patch review decision is required");
  }
  if (fixture.oro4zRouteMountPatchReviewDecisionBoundaryResult !== PASS) {
    blockers.push("ORO-4Z patch review decision result must be PASS");
  }
  if (!fixture.routeMountPatchReviewDecisionIssued) {
    blockers.push("route mount patch review decision must be issued");
  }
  if (!fixture.routeMountPatchReviewed) {
    blockers.push("route mount patch must be reviewed before request submission");
  }
  if (
    fixture.routeMountPatchReviewResult !==
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY ||
    fixture.requestRouteMountPatchReviewResult !==
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("route mount patch review result must be request only");
  }
  if (fixture.oro4zRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved by request submission");
  }
  if (fixture.routeMountPatchImplementationAuthorized) {
    blockers.push("patch implementation must not be authorized by request submission");
  }
  if (
    fixture.oro4zRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (fixture.oro4zExecutionApprovalGranted || fixture.executionApprovalGranted) {
    blockers.push("execution approval must not be granted by request submission");
  }
  if (fixture.executionApprovalDecisionIssued) {
    blockers.push("execution approval decision must remain pending");
  }
  if (
    fixture.oro4zImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro4zRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (
    fixture.oro4zRouteMountExecutionAuthorization !==
      NOT_AUTHORIZED_FOR_EXECUTION ||
    fixture.routeMountExecutionAuthorization !== NOT_AUTHORIZED_FOR_EXECUTION
  ) {
    blockers.push("route mount execution authorization must remain not authorized");
  }
  if (fixture.oro4zExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro4zExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro4zPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro4zRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.routeMountExecutionApprovalRequestSubmitted) {
    blockers.push("execution approval request must be submitted");
  }
  if (fixture.routeMountExecutionApprovalRequestStatus !== SUBMITTED_PENDING_DECISION) {
    blockers.push("execution approval request status must stay pending decision");
  }
  if (!fixture.routeMountPatchReviewDecisionAcknowledged) {
    blockers.push("patch review decision must be acknowledged");
  }
  if (!fixture.nextPhaseRequiresFinalExecutionApprovalDecision) {
    blockers.push("final execution approval decision must remain required");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApproval) {
    blockers.push("actual patch implementation approval must remain required");
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
  if (fixture.requestSubmissionTreatedAsFinalExecutionApproval) {
    blockers.push("request submission must not be final execution approval");
  }
  if (fixture.requestSubmissionSkipsPatchImplementationApproval) {
    blockers.push("request submission must not skip patch implementation approval");
  }
  if (fixture.requestSubmissionSkipsRuntimeTrafficApproval) {
    blockers.push("request submission must not skip runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("request submission output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5aPatchImplementationHoldGate(
  input = buildOro5aRouteMountExecutionApprovalRequestInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    oro4zPatchReviewDecisionPresent: fixture.oro4zPatchReviewDecisionPresent,
    routeMountPatchReviewDecisionIssued: true,
    routeMountPatchReviewed: true,
    routeMountPatchReviewResult:
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
    routeMountExecutionApprovalRequestSubmitted: true,
    routeMountExecutionApprovalRequestStatus: SUBMITTED_PENDING_DECISION,
    routeMountPatchReviewDecisionAcknowledged: true,
    executionApprovalDecisionIssued: false,
    executionApprovalGranted: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    routeMountExecutionAuthorization: NOT_AUTHORIZED_FOR_EXECUTION,
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
    nextPhaseRequiresFinalExecutionApprovalDecision: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5aRouteMountExecutionApprovalRequestSummary(
  input = buildOro5aRouteMountExecutionApprovalRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro5aPatchImplementationHoldGate(input);
  const passed = blockers.length === 0;

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountExecutionApprovalRequestSubmissionResult: passed ? PASS : HOLD,
    routeMountExecutionApprovalRequestSubmitted:
      passed && gate.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus: passed
      ? gate.routeMountExecutionApprovalRequestStatus
      : HOLD,
    routeMountPatchReviewDecisionAcknowledged:
      passed && gate.routeMountPatchReviewDecisionAcknowledged,
    routeMountPatchReviewDecisionIssued:
      passed && gate.routeMountPatchReviewDecisionIssued,
    routeMountPatchReviewed: passed && gate.routeMountPatchReviewed,
    routeMountPatchReviewResult: passed
      ? gate.routeMountPatchReviewResult
      : HOLD,
    executionApprovalDecisionIssued: gate.executionApprovalDecisionIssued,
    executionApprovalGranted: gate.executionApprovalGranted,
    routeMountPatchApproved: gate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      gate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: gate.routeMountPatchImplemented,
    implementationExecutionApproved: gate.implementationExecutionApproved,
    routeMountExecutionAuthorization: gate.routeMountExecutionAuthorization,
    routeMountAuthorization: gate.routeMountAuthorization,
    expressMountAllowed: gate.expressMountAllowed,
    expressMountImplemented: gate.expressMountImplemented,
    srcAppJsEditAllowed: gate.srcAppJsEditAllowed,
    publicAliasAllowed: gate.publicAliasAllowed,
    runtimeTrafficAllowed: gate.runtimeTrafficAllowed,
    walletMutationAllowed: gate.walletMutationAllowed,
    ledgerMutationAllowed: gate.ledgerMutationAllowed,
    prismaWriteAllowed: gate.prismaWriteAllowed,
    dbTransactionAllowed: gate.dbTransactionAllowed,
    migrationAllowed: gate.migrationAllowed,
    externalNetworkAllowed: gate.externalNetworkAllowed,
    nextPhaseRequiresFinalExecutionApprovalDecision:
      gate.nextPhaseRequiresFinalExecutionApprovalDecision,
    nextPhaseRequiresActualPatchImplementationApproval:
      gate.nextPhaseRequiresActualPatchImplementationApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      gate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5aRouteMountExecutionApprovalRequestSubmission(
  input = buildOro5aRouteMountExecutionApprovalRequestInput()
) {
  return buildOro5aRouteMountExecutionApprovalRequestSummary(input);
}

function validateOro5aRouteMountExecutionApprovalRequestSubmission(
  input = buildOro5aRouteMountExecutionApprovalRequestInput()
) {
  const summary = buildOro5aRouteMountExecutionApprovalRequestSummary(input);
  return {
    valid: summary.routeMountExecutionApprovalRequestSubmissionResult === PASS,
    routeMountExecutionApprovalRequestSubmissionResult:
      summary.routeMountExecutionApprovalRequestSubmissionResult,
    routeMountExecutionApprovalRequestSubmitted:
      summary.routeMountExecutionApprovalRequestSubmitted,
    routeMountExecutionApprovalRequestStatus:
      summary.routeMountExecutionApprovalRequestStatus,
    routeMountPatchReviewDecisionAcknowledged:
      summary.routeMountPatchReviewDecisionAcknowledged,
    routeMountPatchReviewResult: summary.routeMountPatchReviewResult,
    executionApprovalDecisionIssued: summary.executionApprovalDecisionIssued,
    executionApprovalGranted: summary.executionApprovalGranted,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      summary.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    implementationExecutionApproved: summary.implementationExecutionApproved,
    routeMountExecutionAuthorization:
      summary.routeMountExecutionAuthorization,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresFinalExecutionApprovalDecision:
      summary.nextPhaseRequiresFinalExecutionApprovalDecision,
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
  REQUEST_SUBMITTED,
  SUBMITTED_PENDING_DECISION,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  ORO_5A_ROUTE_MOUNT_EXECUTION_APPROVAL_REQUEST_STATUS,
  buildOro5aRouteMountExecutionApprovalRequestInput,
  evaluateOro5aRouteMountExecutionApprovalRequestSubmission,
  buildOro5aPatchImplementationHoldGate,
  buildOro5aRouteMountExecutionApprovalRequestSummary,
  validateOro5aRouteMountExecutionApprovalRequestSubmission,
};
