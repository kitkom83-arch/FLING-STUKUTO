"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  buildOro4yRouteMountExecutionApprovalInput,
  evaluateOro4yRouteMountExecutionApprovalReadiness,
} = require("./oro4yRouteMountExecutionApprovalReadiness");

const PHASE = "ORO-4Z";
const FAIL = "FAIL";
const REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY =
  "reviewed_ready_for_execution_approval_request_only";
const PATCH_REVIEW_DECISION_ISSUED =
  "route_mount_patch_review_decision_issued_execution_not_authorized";

const ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  PATCH_REVIEW_DECISION_ISSUED,
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

function buildOro4zRouteMountPatchReviewInput(overrides = {}) {
  const oro4yInput = buildOro4yRouteMountExecutionApprovalInput();
  const oro4ySummary = evaluateOro4yRouteMountExecutionApprovalReadiness(
    oro4yInput
  );
  const baseline = {
    id: "happyPathPatchReviewDecisionRecordedExecutionNotAuthorized",
    phase: PHASE,
    oro4yReadiness: {
      readinessPresent: true,
      executionApprovalReadinessResult:
        oro4ySummary.executionApprovalReadinessResult,
      executionApprovalReadinessRecorded:
        oro4ySummary.executionApprovalReadinessRecorded,
      executionApprovalGranted: oro4ySummary.executionApprovalGranted,
      routeMountPatchReviewPrepared:
        oro4ySummary.routeMountPatchReviewPrepared,
      routeMountPatchReviewed: oro4ySummary.routeMountPatchReviewed,
      routeMountPatchApproved: oro4ySummary.routeMountPatchApproved,
      routeMountPatchImplemented: oro4ySummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro4ySummary.implementationExecutionApproved,
      routeMountExecutionAuthorization:
        oro4ySummary.routeMountExecutionAuthorization,
      routeMountAuthorization: oro4ySummary.routeMountAuthorization,
      expressMountAllowed: oro4ySummary.expressMountAllowed,
      expressMountImplemented: oro4ySummary.expressMountImplemented,
      publicAliasAllowed: oro4ySummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro4ySummary.runtimeTrafficAllowed,
      nextPhaseRequiresExplicitExecutionApproval:
        oro4ySummary.nextPhaseRequiresExplicitExecutionApproval,
      nextPhaseRequiresActualPatchImplementationApproval:
        oro4ySummary.nextPhaseRequiresActualPatchImplementationApproval,
      nextPhaseRequiresSeparateRuntimeTrafficApproval:
        oro4ySummary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    },
    patchReviewDecision: {
      routeMountPatchReviewDecisionIssued: true,
      routeMountPatchReviewed: true,
      routeMountPatchReviewResult:
        REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
      routeMountPatchApproved: false,
      routeMountPatchImplemented: false,
      executionApprovalGranted: false,
      implementationExecutionApproved: false,
      routeMountExecutionAuthorization: NOT_AUTHORIZED_FOR_EXECUTION,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresExplicitExecutionApproval: true,
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
      routeMountPatchImplementationAttempted: false,
      reviewTreatedAsExecutionAuthorization: false,
      approvalTriesToSkipActualPatchImplementationApproval: false,
      approvalTriesToSkipSeparateRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-patch-review-decision-boundary",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro4zRouteMountPatchReviewInput();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro4yReadiness)
    ? merged.oro4yReadiness
    : {};
  const decision = isPlainObject(merged.patchReviewDecision)
    ? merged.patchReviewDecision
    : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro4yReadinessPresent: readBoolean(readiness, "readinessPresent", true),
    executionApprovalReadinessResult: readString(
      readiness,
      "executionApprovalReadinessResult",
      PASS
    ),
    executionApprovalReadinessRecorded: readBoolean(
      readiness,
      "executionApprovalReadinessRecorded",
      true
    ),
    oro4yExecutionApprovalGranted: readBoolean(
      readiness,
      "executionApprovalGranted",
      false
    ),
    oro4yRouteMountPatchReviewPrepared: readBoolean(
      readiness,
      "routeMountPatchReviewPrepared",
      true
    ),
    oro4yRouteMountPatchReviewed: readBoolean(
      readiness,
      "routeMountPatchReviewed",
      false
    ),
    oro4yRouteMountPatchApproved: readBoolean(
      readiness,
      "routeMountPatchApproved",
      false
    ),
    oro4yRouteMountPatchImplemented: readBoolean(
      readiness,
      "routeMountPatchImplemented",
      false
    ),
    oro4yImplementationExecutionApproved: readBoolean(
      readiness,
      "implementationExecutionApproved",
      false
    ),
    oro4yRouteMountExecutionAuthorization: readString(
      readiness,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
    ),
    oro4yRouteMountAuthorization: readString(
      readiness,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4yExpressMountAllowed: readBoolean(readiness, "expressMountAllowed", false),
    oro4yExpressMountImplemented: readBoolean(
      readiness,
      "expressMountImplemented",
      false
    ),
    oro4yPublicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    oro4yRuntimeTrafficAllowed: readBoolean(
      readiness,
      "runtimeTrafficAllowed",
      false
    ),
    oro4yNextPhaseRequiresExplicitExecutionApproval: readBoolean(
      readiness,
      "nextPhaseRequiresExplicitExecutionApproval",
      true
    ),
    oro4yNextPhaseRequiresActualPatchImplementationApproval: readBoolean(
      readiness,
      "nextPhaseRequiresActualPatchImplementationApproval",
      true
    ),
    oro4yNextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      readiness,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
      true
    ),
    routeMountPatchReviewDecisionIssued: readBoolean(
      decision,
      "routeMountPatchReviewDecisionIssued",
      true
    ),
    routeMountPatchReviewed: readBoolean(decision, "routeMountPatchReviewed", true),
    routeMountPatchReviewResult: readString(
      decision,
      "routeMountPatchReviewResult",
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
    ),
    routeMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    executionApprovalGranted: readBoolean(
      decision,
      "executionApprovalGranted",
      false
    ),
    implementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    routeMountExecutionAuthorization: readString(
      decision,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
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
    nextPhaseRequiresExplicitExecutionApproval: readBoolean(
      decision,
      "nextPhaseRequiresExplicitExecutionApproval",
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
    routeMountPatchImplementationAttempted: readBoolean(
      attempt,
      "routeMountPatchImplementationAttempted",
      false
    ),
    reviewTreatedAsExecutionAuthorization: readBoolean(
      attempt,
      "reviewTreatedAsExecutionAuthorization",
      false
    ),
    approvalTriesToSkipActualPatchImplementationApproval: readBoolean(
      attempt,
      "approvalTriesToSkipActualPatchImplementationApproval",
      false
    ),
    approvalTriesToSkipSeparateRuntimeTrafficApproval: readBoolean(
      attempt,
      "approvalTriesToSkipSeparateRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro4yReadinessPresent) {
    blockers.push("ORO-4Y execution approval readiness is required");
  }
  if (fixture.executionApprovalReadinessResult !== PASS) {
    blockers.push("ORO-4Y readiness result must be PASS");
  }
  if (!fixture.executionApprovalReadinessRecorded) {
    blockers.push("execution approval readiness must be recorded");
  }
  if (!fixture.oro4yRouteMountPatchReviewPrepared) {
    blockers.push("route mount patch review preparation must be recorded");
  }
  if (fixture.oro4yRouteMountPatchReviewed) {
    blockers.push("ORO-4Y input must not already review patch");
  }
  if (fixture.oro4yExecutionApprovalGranted || fixture.executionApprovalGranted) {
    blockers.push("execution approval must not be granted by patch review");
  }
  if (
    fixture.oro4yImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (fixture.oro4yRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved by review decision");
  }
  if (
    fixture.oro4yRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented ||
    fixture.routeMountPatchImplementationAttempted
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro4yRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (
    fixture.oro4yRouteMountExecutionAuthorization !==
      NOT_AUTHORIZED_FOR_EXECUTION ||
    fixture.routeMountExecutionAuthorization !== NOT_AUTHORIZED_FOR_EXECUTION
  ) {
    blockers.push("route mount execution authorization must remain not authorized");
  }
  if (fixture.oro4yExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro4yExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro4yPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro4yRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.oro4yNextPhaseRequiresExplicitExecutionApproval) {
    blockers.push("ORO-4Y must require explicit execution approval");
  }
  if (!fixture.oro4yNextPhaseRequiresActualPatchImplementationApproval) {
    blockers.push("ORO-4Y must require actual patch implementation approval");
  }
  if (!fixture.oro4yNextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("ORO-4Y must require separate runtime traffic approval");
  }
  if (!fixture.routeMountPatchReviewDecisionIssued) {
    blockers.push("route mount patch review decision must be issued");
  }
  if (!fixture.routeMountPatchReviewed) {
    blockers.push("route mount patch review decision must mark patch reviewed");
  }
  if (
    fixture.routeMountPatchReviewResult !==
    REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("route mount patch review result must remain request only");
  }
  if (!fixture.nextPhaseRequiresExplicitExecutionApproval) {
    blockers.push("explicit execution approval must remain required");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationApproval) {
    blockers.push("actual patch implementation approval must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("patch review decision must not edit src/app.js");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("patch review decision must not implement Express mount");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("patch review decision must not change runtime route or controller");
  }
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("patch review decision must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("patch review decision must not authorize runtime traffic");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("patch review decision must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("patch review decision must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("patch review decision must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("patch review decision must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("patch review decision must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("patch review decision must not try external network");
  }
  if (fixture.reviewTreatedAsExecutionAuthorization) {
    blockers.push("patch review decision must not be execution authorization");
  }
  if (fixture.approvalTriesToSkipActualPatchImplementationApproval) {
    blockers.push("patch review decision must not skip patch implementation approval");
  }
  if (fixture.approvalTriesToSkipSeparateRuntimeTrafficApproval) {
    blockers.push("patch review decision must not skip runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("patch review decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4zExecutionAuthorizationHoldGate(
  input = buildOro4zRouteMountPatchReviewInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    oro4yReadinessPresent: fixture.oro4yReadinessPresent,
    executionApprovalReadinessResult: fixture.executionApprovalReadinessResult,
    executionApprovalReadinessRecorded:
      fixture.executionApprovalReadinessRecorded,
    routeMountPatchReviewPrepared: fixture.oro4yRouteMountPatchReviewPrepared,
    routeMountPatchReviewDecisionIssued: true,
    routeMountPatchReviewed: true,
    routeMountPatchReviewResult:
      REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
    routeMountPatchApproved: false,
    routeMountPatchImplemented: false,
    executionApprovalGranted: false,
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
    nextPhaseRequiresExplicitExecutionApproval: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro4zRouteMountPatchReviewSummary(
  input = buildOro4zRouteMountPatchReviewInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro4zExecutionAuthorizationHoldGate(input);
  const passed = blockers.length === 0;

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountPatchReviewDecisionBoundaryResult: passed ? PASS : HOLD,
    routeMountPatchReviewDecisionStatus: PATCH_REVIEW_DECISION_ISSUED,
    routeMountPatchReviewDecisionIssued:
      passed && gate.routeMountPatchReviewDecisionIssued,
    routeMountPatchReviewPrepared:
      passed && gate.routeMountPatchReviewPrepared,
    routeMountPatchReviewed: passed && gate.routeMountPatchReviewed,
    routeMountPatchReviewResult: passed
      ? gate.routeMountPatchReviewResult
      : HOLD,
    routeMountPatchApproved: gate.routeMountPatchApproved,
    routeMountPatchImplemented: gate.routeMountPatchImplemented,
    executionApprovalReadinessRecorded:
      passed && gate.executionApprovalReadinessRecorded,
    executionApprovalGranted: gate.executionApprovalGranted,
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
    nextPhaseRequiresExplicitExecutionApproval:
      gate.nextPhaseRequiresExplicitExecutionApproval,
    nextPhaseRequiresActualPatchImplementationApproval:
      gate.nextPhaseRequiresActualPatchImplementationApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      gate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro4zRouteMountPatchReviewDecisionBoundary(
  input = buildOro4zRouteMountPatchReviewInput()
) {
  return buildOro4zRouteMountPatchReviewSummary(input);
}

function validateOro4zRouteMountPatchReviewDecisionBoundary(
  input = buildOro4zRouteMountPatchReviewInput()
) {
  const summary = buildOro4zRouteMountPatchReviewSummary(input);
  return {
    valid: summary.routeMountPatchReviewDecisionBoundaryResult === PASS,
    routeMountPatchReviewDecisionBoundaryResult:
      summary.routeMountPatchReviewDecisionBoundaryResult,
    routeMountPatchReviewDecisionIssued:
      summary.routeMountPatchReviewDecisionIssued,
    routeMountPatchReviewPrepared: summary.routeMountPatchReviewPrepared,
    routeMountPatchReviewed: summary.routeMountPatchReviewed,
    routeMountPatchReviewResult: summary.routeMountPatchReviewResult,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
    executionApprovalGranted: summary.executionApprovalGranted,
    implementationExecutionApproved: summary.implementationExecutionApproved,
    routeMountExecutionAuthorization:
      summary.routeMountExecutionAuthorization,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresExplicitExecutionApproval:
      summary.nextPhaseRequiresExplicitExecutionApproval,
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
  PATCH_REVIEW_DECISION_ISSUED,
  REVIEWED_READY_FOR_EXECUTION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  ORO_4Z_ROUTE_MOUNT_PATCH_REVIEW_STATUS,
  buildOro4zRouteMountPatchReviewInput,
  evaluateOro4zRouteMountPatchReviewDecisionBoundary,
  buildOro4zExecutionAuthorizationHoldGate,
  buildOro4zRouteMountPatchReviewSummary,
  validateOro4zRouteMountPatchReviewDecisionBoundary,
};
