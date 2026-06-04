"use strict";

const {
  PASS,
  HOLD,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  buildOro4xRouteMountImplementationApprovalDecisionInput,
  evaluateOro4xRouteMountImplementationApprovalDecisionBoundary,
} = require("./oro4xRouteMountImplementationApprovalDecisionBoundary");

const PHASE = "ORO-4Y";
const FAIL = "FAIL";
const EXECUTION_APPROVAL_READINESS_RECORDED =
  "execution_approval_readiness_recorded_execution_not_authorized";
const ROUTE_MOUNT_PATCH_REVIEW_PREPARED =
  "route_mount_patch_review_prepared_patch_not_implemented";

const ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  EXECUTION_APPROVAL_READINESS_RECORDED,
  ROUTE_MOUNT_PATCH_REVIEW_PREPARED,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
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
    value.forEach((entry, index) => collectSecretShapedFindings(entry, path.concat(String(index)), output));
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

function buildOro4yRouteMountExecutionApprovalInput(overrides = {}) {
  const oro4xInput = buildOro4xRouteMountImplementationApprovalDecisionInput();
  const oro4xSummary = evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
    oro4xInput
  );
  const baseline = {
    id: "happyPathExecutionReadinessRecordedExecutionNotAuthorized",
    phase: PHASE,
    oro4xDecision: {
      decisionPresent: true,
      implementationApprovalDecisionResult:
        oro4xSummary.implementationApprovalDecisionResult,
      implementationApprovalDecisionIssued:
        oro4xSummary.implementationApprovalDecisionIssued,
      implementationApprovalGranted: oro4xSummary.implementationApprovalGranted,
      implementationApprovalScope: oro4xSummary.implementationApprovalScope,
      implementationExecutionApproved: oro4xSummary.implementationExecutionApproved,
      routeMountExecutionAuthorization:
        oro4xSummary.routeMountExecutionAuthorization,
      routeMountAuthorization: oro4xSummary.routeMountAuthorization,
      expressMountAllowed: oro4xSummary.expressMountAllowed,
      expressMountImplemented: oro4xSummary.expressMountImplemented,
      publicAliasAllowed: oro4xSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro4xSummary.runtimeTrafficAllowed,
      nextPhaseRequiresSeparateExecutionApproval:
        oro4xSummary.nextPhaseRequiresSeparateExecutionApproval,
      nextPhaseRequiresRouteMountPatchReview:
        oro4xSummary.nextPhaseRequiresRouteMountPatchReview,
      nextPhaseRequiresExplicitRuntimeTrafficApproval:
        oro4xSummary.nextPhaseRequiresExplicitRuntimeTrafficApproval,
    },
    executionApprovalReadiness: {
      executionApprovalReadinessRecorded: true,
      executionApprovalGranted: false,
      routeMountPatchReviewPrepared: true,
      routeMountPatchReviewed: false,
      routeMountPatchApproved: false,
      routeMountPatchImplemented: false,
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
      readinessTreatedAsRouteExecutionAuthorization: false,
      approvalTriesToSkipExplicitExecutionApproval: false,
      approvalTriesToSkipSeparateRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-execution-approval-readiness",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro4yRouteMountExecutionApprovalInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro4xDecision) ? merged.oro4xDecision : {};
  const readiness = isPlainObject(merged.executionApprovalReadiness)
    ? merged.executionApprovalReadiness
    : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro4xDecisionPresent: readBoolean(decision, "decisionPresent", true),
    implementationApprovalDecisionResult: readString(
      decision,
      "implementationApprovalDecisionResult",
      PASS
    ),
    implementationApprovalDecisionIssued: readBoolean(
      decision,
      "implementationApprovalDecisionIssued",
      true
    ),
    oro4xImplementationApprovalGranted: readBoolean(
      decision,
      "implementationApprovalGranted",
      true
    ),
    implementationApprovalScope: readString(
      decision,
      "implementationApprovalScope",
      STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
    ),
    oro4xImplementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    oro4xRouteMountExecutionAuthorization: readString(
      decision,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
    ),
    oro4xRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4xExpressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    oro4xExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro4xPublicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    oro4xRuntimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    oro4xNextPhaseRequiresSeparateExecutionApproval: readBoolean(
      decision,
      "nextPhaseRequiresSeparateExecutionApproval",
      true
    ),
    oro4xNextPhaseRequiresRouteMountPatchReview: readBoolean(
      decision,
      "nextPhaseRequiresRouteMountPatchReview",
      true
    ),
    oro4xNextPhaseRequiresExplicitRuntimeTrafficApproval: readBoolean(
      decision,
      "nextPhaseRequiresExplicitRuntimeTrafficApproval",
      true
    ),
    executionApprovalReadinessRecorded: readBoolean(
      readiness,
      "executionApprovalReadinessRecorded",
      true
    ),
    executionApprovalGranted: readBoolean(
      readiness,
      "executionApprovalGranted",
      false
    ),
    routeMountPatchReviewPrepared: readBoolean(
      readiness,
      "routeMountPatchReviewPrepared",
      true
    ),
    routeMountPatchReviewed: readBoolean(
      readiness,
      "routeMountPatchReviewed",
      false
    ),
    routeMountPatchApproved: readBoolean(
      readiness,
      "routeMountPatchApproved",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      readiness,
      "routeMountPatchImplemented",
      false
    ),
    implementationExecutionApproved: readBoolean(
      readiness,
      "implementationExecutionApproved",
      false
    ),
    routeMountExecutionAuthorization: readString(
      readiness,
      "routeMountExecutionAuthorization",
      NOT_AUTHORIZED_FOR_EXECUTION
    ),
    routeMountAuthorization: readString(
      readiness,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(readiness, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(
      readiness,
      "expressMountImplemented",
      false
    ),
    publicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    nextPhaseRequiresExplicitExecutionApproval: readBoolean(
      readiness,
      "nextPhaseRequiresExplicitExecutionApproval",
      true
    ),
    nextPhaseRequiresActualPatchImplementationApproval: readBoolean(
      readiness,
      "nextPhaseRequiresActualPatchImplementationApproval",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      readiness,
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
    readinessTreatedAsRouteExecutionAuthorization: readBoolean(
      attempt,
      "readinessTreatedAsRouteExecutionAuthorization",
      false
    ),
    approvalTriesToSkipExplicitExecutionApproval: readBoolean(
      attempt,
      "approvalTriesToSkipExplicitExecutionApproval",
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

  if (!fixture.oro4xDecisionPresent) {
    blockers.push("ORO-4X implementation approval decision is required");
  }
  if (fixture.implementationApprovalDecisionResult !== PASS) {
    blockers.push("ORO-4X decision result must be PASS");
  }
  if (!fixture.implementationApprovalDecisionIssued) {
    blockers.push("implementation approval decision must be issued");
  }
  if (!fixture.oro4xImplementationApprovalGranted) {
    blockers.push("ORO-4X implementation approval must be granted");
  }
  if (
    fixture.implementationApprovalScope !==
    STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
  ) {
    blockers.push("implementation approval scope must be static planning only");
  }
  if (
    fixture.oro4xImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro4xRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (
    fixture.oro4xRouteMountExecutionAuthorization !== NOT_AUTHORIZED_FOR_EXECUTION ||
    fixture.routeMountExecutionAuthorization !== NOT_AUTHORIZED_FOR_EXECUTION
  ) {
    blockers.push("route mount execution authorization must remain not authorized");
  }
  if (fixture.executionApprovalGranted) {
    blockers.push("execution approval must not be granted by readiness");
  }
  if (!fixture.executionApprovalReadinessRecorded) {
    blockers.push("execution approval readiness must be recorded");
  }
  if (!fixture.routeMountPatchReviewPrepared) {
    blockers.push("route mount patch review preparation must be recorded");
  }
  if (fixture.routeMountPatchReviewed) {
    blockers.push("route mount patch must not be reviewed in readiness");
  }
  if (fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved in readiness");
  }
  if (
    fixture.routeMountPatchImplemented ||
    fixture.routeMountPatchImplementationAttempted
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (fixture.oro4xExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro4xExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro4xPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro4xRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.oro4xNextPhaseRequiresSeparateExecutionApproval) {
    blockers.push("ORO-4X must require separate execution approval");
  }
  if (!fixture.oro4xNextPhaseRequiresRouteMountPatchReview) {
    blockers.push("ORO-4X must require route mount patch review");
  }
  if (!fixture.oro4xNextPhaseRequiresExplicitRuntimeTrafficApproval) {
    blockers.push("ORO-4X must require explicit runtime traffic approval");
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
    blockers.push("readiness must not edit src/app.js");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("readiness must not implement Express mount");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("readiness must not change runtime route or controller");
  }
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("readiness must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("readiness must not authorize runtime traffic");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("readiness must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("readiness must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("readiness must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("readiness must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("readiness must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("readiness must not try external network");
  }
  if (fixture.readinessTreatedAsRouteExecutionAuthorization) {
    blockers.push("readiness must not be route execution authorization");
  }
  if (fixture.approvalTriesToSkipExplicitExecutionApproval) {
    blockers.push("readiness must not skip explicit execution approval");
  }
  if (fixture.approvalTriesToSkipSeparateRuntimeTrafficApproval) {
    blockers.push("readiness must not skip separate runtime traffic approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("readiness output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4yRouteMountPatchReviewGate(
  input = buildOro4yRouteMountExecutionApprovalInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    oro4xDecisionPresent: fixture.oro4xDecisionPresent,
    implementationApprovalDecisionResult:
      fixture.implementationApprovalDecisionResult,
    implementationApprovalDecisionIssued:
      fixture.implementationApprovalDecisionIssued,
    implementationApprovalScope: STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
    executionApprovalReadinessRecorded: true,
    executionApprovalGranted: false,
    routeMountPatchReviewPrepared: true,
    routeMountPatchReviewed: false,
    routeMountPatchApproved: false,
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
    nextPhaseRequiresExplicitExecutionApproval: true,
    nextPhaseRequiresActualPatchImplementationApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro4yRouteMountExecutionApprovalSummary(
  input = buildOro4yRouteMountExecutionApprovalInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro4yRouteMountPatchReviewGate(input);
  const passed = blockers.length === 0;

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    executionApprovalReadinessResult: passed ? PASS : HOLD,
    executionApprovalReadinessStatus: EXECUTION_APPROVAL_READINESS_RECORDED,
    routeMountPatchReviewStatus: ROUTE_MOUNT_PATCH_REVIEW_PREPARED,
    oro4xDecisionPresent: fixture.oro4xDecisionPresent,
    implementationApprovalDecisionResult:
      fixture.implementationApprovalDecisionResult,
    implementationApprovalDecisionIssued:
      fixture.implementationApprovalDecisionIssued,
    oro4xImplementationApprovalGranted:
      fixture.oro4xImplementationApprovalGranted,
    implementationApprovalScope: fixture.implementationApprovalScope,
    executionApprovalReadinessRecorded:
      passed && gate.executionApprovalReadinessRecorded,
    executionApprovalGranted: gate.executionApprovalGranted,
    routeMountPatchReviewPrepared: passed && gate.routeMountPatchReviewPrepared,
    routeMountPatchReviewed: gate.routeMountPatchReviewed,
    routeMountPatchApproved: gate.routeMountPatchApproved,
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
    nextPhaseRequiresExplicitExecutionApproval:
      gate.nextPhaseRequiresExplicitExecutionApproval,
    nextPhaseRequiresActualPatchImplementationApproval:
      gate.nextPhaseRequiresActualPatchImplementationApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      gate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro4yRouteMountExecutionApprovalReadiness(
  input = buildOro4yRouteMountExecutionApprovalInput()
) {
  return buildOro4yRouteMountExecutionApprovalSummary(input);
}

function validateOro4yRouteMountExecutionApprovalReadiness(
  input = buildOro4yRouteMountExecutionApprovalInput()
) {
  const summary = buildOro4yRouteMountExecutionApprovalSummary(input);
  return {
    valid: summary.executionApprovalReadinessResult === PASS,
    executionApprovalReadinessResult: summary.executionApprovalReadinessResult,
    executionApprovalReadinessRecorded:
      summary.executionApprovalReadinessRecorded,
    executionApprovalGranted: summary.executionApprovalGranted,
    routeMountPatchReviewPrepared: summary.routeMountPatchReviewPrepared,
    routeMountPatchReviewed: summary.routeMountPatchReviewed,
    routeMountPatchApproved: summary.routeMountPatchApproved,
    routeMountPatchImplemented: summary.routeMountPatchImplemented,
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
  EXECUTION_APPROVAL_READINESS_RECORDED,
  ROUTE_MOUNT_PATCH_REVIEW_PREPARED,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  ORO_4Y_ROUTE_MOUNT_EXECUTION_APPROVAL_STATUS,
  buildOro4yRouteMountExecutionApprovalInput,
  evaluateOro4yRouteMountExecutionApprovalReadiness,
  buildOro4yRouteMountPatchReviewGate,
  buildOro4yRouteMountExecutionApprovalSummary,
  validateOro4yRouteMountExecutionApprovalReadiness,
};
