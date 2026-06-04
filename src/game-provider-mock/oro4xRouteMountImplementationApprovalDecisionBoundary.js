"use strict";

const {
  PASS,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  IMPLEMENTATION_READINESS_RECORDED,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro4wRouteMountImplementationApprovalInput,
  evaluateOro4wRouteMountImplementationApprovalReadiness,
} = require("./oro4wRouteMountImplementationApprovalReadiness");

const PHASE = "ORO-4X";
const FAIL = "FAIL";
const IMPLEMENTATION_APPROVAL_DECISION_ISSUED =
  "implementation_approval_decision_issued_execution_not_authorized";
const STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY =
  "static_route_mount_implementation_planning_only";
const NOT_AUTHORIZED_FOR_EXECUTION = "not_authorized_for_execution";

const ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  IMPLEMENTATION_READINESS_RECORDED,
  IMPLEMENTATION_APPROVAL_DECISION_ISSUED,
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

function buildOro4xRouteMountImplementationApprovalDecisionInput(overrides = {}) {
  const oro4wInput = buildOro4wRouteMountImplementationApprovalInput();
  const oro4wSummary = evaluateOro4wRouteMountImplementationApprovalReadiness(oro4wInput);
  const baseline = {
    id: "happyPathDecisionRecordedExecutionNotAuthorized",
    phase: PHASE,
    oro4wReadiness: {
      readinessPresent: true,
      implementationApprovalReadinessResult:
        oro4wSummary.implementationApprovalReadinessResult,
      implementationApprovalReadinessRecorded:
        oro4wSummary.implementationApprovalReadinessRecorded,
      implementationApprovalStatus: oro4wSummary.implementationApprovalStatus,
      implementationApprovalGranted: oro4wSummary.implementationApprovalGranted,
      routeMountAuthorization: oro4wSummary.routeMountAuthorization,
      expressMountAllowed: oro4wSummary.expressMountAllowed,
      expressMountImplemented: oro4wSummary.expressMountImplemented,
      publicAliasAllowed: oro4wSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro4wSummary.runtimeTrafficAllowed,
      nextPhaseRequiresExplicitImplementationApproval:
        oro4wSummary.nextPhaseRequiresExplicitImplementationApproval,
      nextPhaseRequiresSeparateExecutionApproval:
        oro4wSummary.nextPhaseRequiresSeparateExecutionApproval,
    },
    implementationApprovalDecision: {
      decisionIssued: true,
      decisionStatus: IMPLEMENTATION_APPROVAL_DECISION_ISSUED,
      implementationApprovalGranted: true,
      implementationApprovalScope: STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
      implementationExecutionApproved: false,
      routeMountExecutionAuthorization: NOT_AUTHORIZED_FOR_EXECUTION,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresSeparateExecutionApproval: true,
      nextPhaseRequiresRouteMountPatchReview: true,
      nextPhaseRequiresExplicitRuntimeTrafficApproval: true,
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
      approvalTriesToGrantImplementationExecution: false,
      approvalTreatedAsRuntimeMountAuthorization: false,
      approvalTriesToSkipSeparateExecutionApproval: false,
    },
    trace: {
      mode: "static-mock-implementation-approval-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro4xRouteMountImplementationApprovalDecisionInput();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro4wReadiness) ? merged.oro4wReadiness : {};
  const decision = isPlainObject(merged.implementationApprovalDecision)
    ? merged.implementationApprovalDecision
    : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro4wReadinessPresent: readBoolean(readiness, "readinessPresent", true),
    implementationApprovalReadinessResult: readString(
      readiness,
      "implementationApprovalReadinessResult",
      PASS
    ),
    implementationApprovalReadinessRecorded: readBoolean(
      readiness,
      "implementationApprovalReadinessRecorded",
      true
    ),
    implementationApprovalStatus: readString(
      readiness,
      "implementationApprovalStatus",
      IMPLEMENTATION_READINESS_RECORDED
    ),
    oro4wImplementationApprovalGranted: readBoolean(
      readiness,
      "implementationApprovalGranted",
      false
    ),
    oro4wRouteMountAuthorization: readString(
      readiness,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4wExpressMountAllowed: readBoolean(readiness, "expressMountAllowed", false),
    oro4wExpressMountImplemented: readBoolean(
      readiness,
      "expressMountImplemented",
      false
    ),
    oro4wPublicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    oro4wRuntimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    oro4wNextPhaseRequiresExplicitImplementationApproval: readBoolean(
      readiness,
      "nextPhaseRequiresExplicitImplementationApproval",
      true
    ),
    oro4wNextPhaseRequiresSeparateExecutionApproval: readBoolean(
      readiness,
      "nextPhaseRequiresSeparateExecutionApproval",
      true
    ),
    decisionIssued: readBoolean(decision, "decisionIssued", true),
    decisionStatus: readString(
      decision,
      "decisionStatus",
      IMPLEMENTATION_APPROVAL_DECISION_ISSUED
    ),
    implementationApprovalGranted: readBoolean(
      decision,
      "implementationApprovalGranted",
      true
    ),
    implementationApprovalScope: readString(
      decision,
      "implementationApprovalScope",
      STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
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
    expressMountImplemented: readBoolean(decision, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    nextPhaseRequiresSeparateExecutionApproval: readBoolean(
      decision,
      "nextPhaseRequiresSeparateExecutionApproval",
      true
    ),
    nextPhaseRequiresRouteMountPatchReview: readBoolean(
      decision,
      "nextPhaseRequiresRouteMountPatchReview",
      true
    ),
    nextPhaseRequiresExplicitRuntimeTrafficApproval: readBoolean(
      decision,
      "nextPhaseRequiresExplicitRuntimeTrafficApproval",
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
    approvalTriesToGrantImplementationExecution: readBoolean(
      attempt,
      "approvalTriesToGrantImplementationExecution",
      false
    ),
    approvalTreatedAsRuntimeMountAuthorization: readBoolean(
      attempt,
      "approvalTreatedAsRuntimeMountAuthorization",
      false
    ),
    approvalTriesToSkipSeparateExecutionApproval: readBoolean(
      attempt,
      "approvalTriesToSkipSeparateExecutionApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro4wReadinessPresent) {
    blockers.push("ORO-4W implementation approval readiness is required");
  }
  if (fixture.implementationApprovalReadinessResult !== PASS) {
    blockers.push("ORO-4W readiness result must be PASS");
  }
  if (!fixture.implementationApprovalReadinessRecorded) {
    blockers.push("ORO-4W implementation approval readiness must be recorded");
  }
  if (fixture.implementationApprovalStatus !== IMPLEMENTATION_READINESS_RECORDED) {
    blockers.push("ORO-4W readiness status must record readiness");
  }
  if (fixture.oro4wImplementationApprovalGranted) {
    blockers.push("ORO-4W readiness must not grant implementation approval");
  }
  if (fixture.oro4wRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro4wExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro4wExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro4wPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro4wRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.oro4wNextPhaseRequiresExplicitImplementationApproval) {
    blockers.push("ORO-4W must require explicit implementation approval");
  }
  if (!fixture.oro4wNextPhaseRequiresSeparateExecutionApproval) {
    blockers.push("ORO-4W must require separate execution approval");
  }
  if (!fixture.decisionIssued) {
    blockers.push("implementation approval decision must be issued");
  }
  if (fixture.decisionStatus !== IMPLEMENTATION_APPROVAL_DECISION_ISSUED) {
    blockers.push("implementation approval decision status must be recorded");
  }
  if (!fixture.implementationApprovalGranted) {
    blockers.push("implementation approval decision must grant static planning only");
  }
  if (
    fixture.implementationApprovalScope !==
    STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY
  ) {
    blockers.push("implementation approval scope must be static planning only");
  }
  if (
    fixture.implementationExecutionApproved ||
    fixture.approvalTriesToGrantImplementationExecution
  ) {
    blockers.push("implementation approval must not approve execution");
  }
  if (fixture.routeMountExecutionAuthorization !== NOT_AUTHORIZED_FOR_EXECUTION) {
    blockers.push("route mount execution authorization must remain not authorized");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (!fixture.nextPhaseRequiresSeparateExecutionApproval) {
    blockers.push("separate execution approval must remain required");
  }
  if (!fixture.nextPhaseRequiresRouteMountPatchReview) {
    blockers.push("route mount patch review must remain required");
  }
  if (!fixture.nextPhaseRequiresExplicitRuntimeTrafficApproval) {
    blockers.push("runtime traffic approval must remain required");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("decision must not edit src/app.js");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("decision must not implement Express mount");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("decision must not change runtime route or controller");
  }
  if (fixture.publicAliasAuthorizationAttempted) {
    blockers.push("decision must not authorize public alias");
  }
  if (fixture.runtimeTrafficAuthorizationAttempted) {
    blockers.push("decision must not authorize runtime traffic");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("decision must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("decision must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("decision must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("decision must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("decision must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("decision must not try external network");
  }
  if (fixture.approvalTreatedAsRuntimeMountAuthorization) {
    blockers.push("implementation approval must not be runtime mount authorization");
  }
  if (fixture.approvalTriesToSkipSeparateExecutionApproval) {
    blockers.push("implementation approval must not skip separate execution approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4xExecutionStillNotAuthorizedGate(
  input = buildOro4xRouteMountImplementationApprovalDecisionInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    oro4wReadinessPresent: fixture.oro4wReadinessPresent,
    implementationApprovalReadinessResult:
      fixture.implementationApprovalReadinessResult,
    implementationApprovalReadinessRecorded:
      fixture.implementationApprovalReadinessRecorded,
    implementationApprovalDecisionIssued: fixture.decisionIssued,
    implementationApprovalGranted: true,
    implementationApprovalScope: STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
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
    nextPhaseRequiresSeparateExecutionApproval: true,
    nextPhaseRequiresRouteMountPatchReview: true,
    nextPhaseRequiresExplicitRuntimeTrafficApproval: true,
  };
}

function buildOro4xRouteMountImplementationApprovalSummary(
  input = buildOro4xRouteMountImplementationApprovalDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro4xExecutionStillNotAuthorizedGate(input);
  const passed = blockers.length === 0;

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    implementationApprovalDecisionResult: passed ? PASS : HOLD,
    implementationApprovalDecisionIssued: passed && gate.implementationApprovalDecisionIssued,
    implementationApprovalDecisionStatus: IMPLEMENTATION_APPROVAL_DECISION_ISSUED,
    implementationApprovalGranted: passed && gate.implementationApprovalGranted,
    implementationApprovalScope: gate.implementationApprovalScope,
    implementationExecutionApproved: gate.implementationExecutionApproved,
    routeMountExecutionAuthorization: gate.routeMountExecutionAuthorization,
    oro4wReadinessPresent: fixture.oro4wReadinessPresent,
    implementationApprovalReadinessResult:
      fixture.implementationApprovalReadinessResult,
    implementationApprovalReadinessRecorded:
      fixture.implementationApprovalReadinessRecorded,
    implementationApprovalReadinessStatus: fixture.implementationApprovalStatus,
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
    nextPhaseRequiresSeparateExecutionApproval:
      gate.nextPhaseRequiresSeparateExecutionApproval,
    nextPhaseRequiresRouteMountPatchReview:
      gate.nextPhaseRequiresRouteMountPatchReview,
    nextPhaseRequiresExplicitRuntimeTrafficApproval:
      gate.nextPhaseRequiresExplicitRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro4xRouteMountImplementationApprovalDecisionBoundary(
  input = buildOro4xRouteMountImplementationApprovalDecisionInput()
) {
  return buildOro4xRouteMountImplementationApprovalSummary(input);
}

function validateOro4xRouteMountImplementationApprovalDecisionBoundary(
  input = buildOro4xRouteMountImplementationApprovalDecisionInput()
) {
  const summary = buildOro4xRouteMountImplementationApprovalSummary(input);
  return {
    valid: summary.implementationApprovalDecisionResult === PASS,
    implementationApprovalDecisionResult:
      summary.implementationApprovalDecisionResult,
    implementationApprovalDecisionIssued:
      summary.implementationApprovalDecisionIssued,
    implementationApprovalGranted: summary.implementationApprovalGranted,
    implementationApprovalScope: summary.implementationApprovalScope,
    implementationExecutionApproved: summary.implementationExecutionApproved,
    routeMountExecutionAuthorization: summary.routeMountExecutionAuthorization,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresSeparateExecutionApproval:
      summary.nextPhaseRequiresSeparateExecutionApproval,
    nextPhaseRequiresRouteMountPatchReview:
      summary.nextPhaseRequiresRouteMountPatchReview,
    nextPhaseRequiresExplicitRuntimeTrafficApproval:
      summary.nextPhaseRequiresExplicitRuntimeTrafficApproval,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  IMPLEMENTATION_READINESS_RECORDED,
  IMPLEMENTATION_APPROVAL_DECISION_ISSUED,
  STATIC_ROUTE_MOUNT_IMPLEMENTATION_PLANNING_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  NOT_AUTHORIZED_FOR_EXECUTION,
  ORO_4X_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS,
  buildOro4xRouteMountImplementationApprovalDecisionInput,
  evaluateOro4xRouteMountImplementationApprovalDecisionBoundary,
  buildOro4xExecutionStillNotAuthorizedGate,
  buildOro4xRouteMountImplementationApprovalSummary,
  validateOro4xRouteMountImplementationApprovalDecisionBoundary,
};
