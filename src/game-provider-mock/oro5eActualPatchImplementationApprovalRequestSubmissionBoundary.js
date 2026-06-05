"use strict";

const {
  PASS,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  SUBMITTED_PENDING_DECISION,
  PENDING_DECISION,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput,
  evaluateOro5dRouteMountPatchImplementationAuthorizationDecision,
} = require("./oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary");

const PHASE = "ORO-5E";
const FAIL = "FAIL";
const DECISION_ISSUED = "decision_issued";
const SUBMITTED_PENDING_DECISION_VALUE = SUBMITTED_PENDING_DECISION;
const PENDING_DECISION_VALUE = PENDING_DECISION;

const ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  DECISION_ISSUED,
  SUBMITTED_PENDING_DECISION: SUBMITTED_PENDING_DECISION_VALUE,
  PENDING_DECISION: PENDING_DECISION_VALUE,
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

const BASELINE_ORO5D_SUMMARY =
  evaluateOro5dRouteMountPatchImplementationAuthorizationDecision(
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput()
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

function buildOro5eActualPatchImplementationApprovalRequestInput(overrides = {}) {
  const oro5dSummary = BASELINE_ORO5D_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationApprovalRequestSubmitted",
    phase: PHASE,
    oro5dDecision: {
      decisionPresent: true,
      routeMountPatchImplementationAuthorizationDecisionIssued:
        oro5dSummary.routeMountPatchImplementationAuthorizationDecisionIssued,
      routeMountPatchImplementationAuthorizationGranted:
        oro5dSummary.routeMountPatchImplementationAuthorizationGranted,
      routeMountPatchImplementationAuthorization:
        oro5dSummary.routeMountPatchImplementationAuthorization,
      routeMountPatchApproved: oro5dSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5dSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5dSummary.routeMountPatchImplemented,
      implementationExecutionApproved:
        oro5dSummary.implementationExecutionApproved,
      actualPatchImplementationApprovalIssued:
        oro5dSummary.actualPatchImplementationApprovalIssued,
      actualPatchImplementationApprovalGranted:
        oro5dSummary.actualPatchImplementationApprovalGranted,
      routeMountAuthorization: oro5dSummary.routeMountAuthorization,
      expressMountAllowed: oro5dSummary.expressMountAllowed,
      expressMountImplemented: oro5dSummary.expressMountImplemented,
      publicAliasAllowed: oro5dSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5dSummary.runtimeTrafficAllowed,
    },
    requestState: {
      actualPatchImplementationApprovalRequestAlreadySubmittedBeforeOro5e: false,
      actualPatchImplementationApprovalRequestSubmitted: true,
      actualPatchImplementationApprovalRequestStatus:
        SUBMITTED_PENDING_DECISION_VALUE,
      actualPatchImplementationApprovalRequestResult: PENDING_DECISION_VALUE,
      actualPatchImplementationApprovalDecisionIssued: false,
      actualPatchImplementationApprovalGranted: false,
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
      nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
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
      approvalRequestTriesActualImplementationApproval: false,
      approvalRequestTriesRouteMountAuthorization: false,
      approvalRequestTriesRuntimeTrafficApproval: false,
    },
    trace: {
      mode: "static-mock-actual-patch-implementation-approval-request",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5eActualPatchImplementationApprovalRequestInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro5dDecision) ? merged.oro5dDecision : {};
  const request = isPlainObject(merged.requestState) ? merged.requestState : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5dDecisionPresent: readBoolean(decision, "decisionPresent", true),
    oro5dDecisionIssued: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    oro5dAuthorizationGranted: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorizationGranted",
      true
    ),
    oro5dAuthorization: readString(
      decision,
      "routeMountPatchImplementationAuthorization",
      AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
    ),
    oro5dRouteMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    oro5dRouteMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5dRouteMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    oro5dImplementationExecutionApproved: readBoolean(
      decision,
      "implementationExecutionApproved",
      false
    ),
    oro5dActualPatchImplementationApprovalIssued: readBoolean(
      decision,
      "actualPatchImplementationApprovalIssued",
      false
    ),
    oro5dActualPatchImplementationApprovalGranted: readBoolean(
      decision,
      "actualPatchImplementationApprovalGranted",
      false
    ),
    oro5dRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5dExpressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    oro5dExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro5dPublicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    oro5dRuntimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    actualPatchImplementationApprovalRequestSubmitted: readBoolean(
      request,
      "actualPatchImplementationApprovalRequestSubmitted",
      true
    ),
    actualPatchImplementationApprovalRequestAlreadySubmittedBeforeOro5e: readBoolean(
      request,
      "actualPatchImplementationApprovalRequestAlreadySubmittedBeforeOro5e",
      false
    ),
    actualPatchImplementationApprovalRequestStatus: readString(
      request,
      "actualPatchImplementationApprovalRequestStatus",
      SUBMITTED_PENDING_DECISION_VALUE
    ),
    actualPatchImplementationApprovalRequestResult: readString(
      request,
      "actualPatchImplementationApprovalRequestResult",
      PENDING_DECISION_VALUE
    ),
    actualPatchImplementationApprovalDecisionIssued: readBoolean(
      request,
      "actualPatchImplementationApprovalDecisionIssued",
      false
    ),
    actualPatchImplementationApprovalGranted: readBoolean(
      request,
      "actualPatchImplementationApprovalGranted",
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
    actualPatchImplementationApprovalIssued: readBoolean(
      request,
      "actualPatchImplementationApprovalIssued",
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
    nextPhaseRequiresActualPatchImplementationApprovalDecision: readBoolean(
      request,
      "nextPhaseRequiresActualPatchImplementationApprovalDecision",
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
    approvalRequestTriesActualImplementationApproval: readBoolean(
      attempt,
      "approvalRequestTriesActualImplementationApproval",
      false
    ),
    approvalRequestTriesRouteMountAuthorization: readBoolean(
      attempt,
      "approvalRequestTriesRouteMountAuthorization",
      false
    ),
    approvalRequestTriesRuntimeTrafficApproval: readBoolean(
      attempt,
      "approvalRequestTriesRuntimeTrafficApproval",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5dDecisionPresent) {
    blockers.push("ORO-5D decision is required");
  }
  if (!fixture.oro5dDecisionIssued) {
    blockers.push("ORO-5D decision must be issued");
  }
  if (!fixture.oro5dAuthorizationGranted) {
    blockers.push("ORO-5D authorization must be granted");
  }
  if (
    fixture.oro5dAuthorization !==
    AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY
  ) {
    blockers.push("ORO-5D authorization scope must be request only");
  }
  if (!fixture.actualPatchImplementationApprovalRequestSubmitted) {
    blockers.push("actual patch implementation approval request must be submitted");
  }
  if (fixture.actualPatchImplementationApprovalRequestAlreadySubmittedBeforeOro5e) {
    blockers.push("actual patch approval request already submitted");
  }
  if (
    fixture.actualPatchImplementationApprovalRequestStatus !==
    SUBMITTED_PENDING_DECISION_VALUE
  ) {
    blockers.push("actual patch implementation approval request status must be submitted_pending_decision");
  }
  if (
    fixture.actualPatchImplementationApprovalRequestResult !==
    PENDING_DECISION_VALUE
  ) {
    blockers.push("actual patch implementation approval request result must be pending_decision");
  }
  if (fixture.actualPatchImplementationApprovalDecisionIssued) {
    blockers.push("actual patch approval decision already issued");
  }
  if (fixture.actualPatchImplementationApprovalGranted) {
    blockers.push("actual patch approval already granted");
  }
  if (
    fixture.oro5dRouteMountPatchApproved ||
    fixture.routeMountPatchApproved
  ) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5dRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("actual patch implementation must not be authorized");
  }
  if (
    fixture.oro5dRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5dImplementationExecutionApproved ||
    fixture.implementationExecutionApproved
  ) {
    blockers.push("implementation execution must remain not approved");
  }
  if (
    fixture.oro5dActualPatchImplementationApprovalIssued ||
    fixture.actualPatchImplementationApprovalIssued
  ) {
    blockers.push("actual patch implementation approval must not be issued");
  }
  if (fixture.oro5dActualPatchImplementationApprovalGranted) {
    blockers.push("actual patch implementation approval must not be granted");
  }
  if (
    fixture.oro5dRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5dExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5dExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5dPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5dRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
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
  if (fixture.approvalRequestTriesActualImplementationApproval) {
    blockers.push("approval request must not approve actual implementation");
  }
  if (fixture.approvalRequestTriesRouteMountAuthorization) {
    blockers.push("approval request must not authorize route mount");
  }
  if (fixture.approvalRequestTriesRuntimeTrafficApproval) {
    blockers.push("approval request must not approve runtime traffic");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("approval request must not edit src/app.js");
  }
  if (fixture.routeControllerRuntimeChangeAttempted) {
    blockers.push("approval request must not change runtime route or controller");
  }
  if (fixture.expressMountImplementationAttempted) {
    blockers.push("approval request must not implement Express mount");
  }
  if (fixture.walletMutationAttempted) {
    blockers.push("approval request must not try wallet mutation");
  }
  if (fixture.ledgerMutationAttempted) {
    blockers.push("approval request must not try ledger mutation");
  }
  if (fixture.prismaWriteAttempted) {
    blockers.push("approval request must not try Prisma write");
  }
  if (fixture.dbTransactionAttempted) {
    blockers.push("approval request must not try DB transaction");
  }
  if (fixture.migrationAttempted) {
    blockers.push("approval request must not try migration");
  }
  if (fixture.externalNetworkAttempted) {
    blockers.push("approval request must not try external network");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("approval request output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5eActualPatchImplementationStillHeldGate(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    actualPatchImplementationApprovalRequestSubmitted: true,
    actualPatchImplementationApprovalRequestStatus:
      SUBMITTED_PENDING_DECISION_VALUE,
    actualPatchImplementationApprovalRequestResult: PENDING_DECISION_VALUE,
    actualPatchImplementationApprovalDecisionIssued: false,
    actualPatchImplementationApprovalGranted: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    actualPatchImplementationApprovalIssued: false,
    srcAppJsEditAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildOro5eRouteMountStillHeldGate(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
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

function buildOro5eRuntimeTrafficStillHeldGate(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
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
    actualPatchImplementationApprovalRequestSubmissionBoundaryResult: HOLD,
    actualPatchImplementationApprovalRequestSubmitted: false,
    actualPatchImplementationApprovalRequestStatus: HOLD,
    actualPatchImplementationApprovalRequestResult: HOLD,
    actualPatchImplementationApprovalDecisionIssued: false,
    actualPatchImplementationApprovalGranted: false,
    routeMountPatchImplementationAuthorizationDecisionIssued: false,
    routeMountPatchImplementationAuthorizationGranted: false,
    routeMountPatchImplementationAuthorization: HOLD,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    implementationExecutionApproved: false,
    actualPatchImplementationApprovalIssued: false,
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
    nextPhaseRequiresActualPatchImplementationApprovalDecision: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    blockers,
  };
}

function buildOro5eActualPatchImplementationApprovalRequestSummary(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const patchGate = buildOro5eActualPatchImplementationStillHeldGate(input);
  const mountGate = buildOro5eRouteMountStillHeldGate(input);
  const trafficGate = buildOro5eRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationApprovalRequestSubmissionBoundaryResult: PASS,
    actualPatchImplementationApprovalRequestSubmitted:
      patchGate.actualPatchImplementationApprovalRequestSubmitted,
    actualPatchImplementationApprovalRequestStatus:
      patchGate.actualPatchImplementationApprovalRequestStatus,
    actualPatchImplementationApprovalRequestResult:
      patchGate.actualPatchImplementationApprovalRequestResult,
    actualPatchImplementationApprovalDecisionIssued:
      patchGate.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalGranted:
      patchGate.actualPatchImplementationApprovalGranted,
    routeMountPatchImplementationAuthorizationDecisionIssued:
      fixture.oro5dDecisionIssued,
    routeMountPatchImplementationAuthorizationGranted:
      fixture.oro5dAuthorizationGranted,
    routeMountPatchImplementationAuthorization: fixture.oro5dAuthorization,
    routeMountPatchApproved: patchGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      patchGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: patchGate.routeMountPatchImplemented,
    implementationExecutionApproved: patchGate.implementationExecutionApproved,
    actualPatchImplementationApprovalIssued:
      patchGate.actualPatchImplementationApprovalIssued,
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
    nextPhaseRequiresActualPatchImplementationApprovalDecision:
      patchGate.nextPhaseRequiresActualPatchImplementationApprovalDecision,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      patchGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      patchGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    blockers,
  };
}

function evaluateOro5eActualPatchImplementationApprovalRequest(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
) {
  return buildOro5eActualPatchImplementationApprovalRequestSummary(input);
}

function validateOro5eActualPatchImplementationApprovalRequest(
  input = buildOro5eActualPatchImplementationApprovalRequestInput()
) {
  const summary = buildOro5eActualPatchImplementationApprovalRequestSummary(input);
  return {
    valid:
      summary.actualPatchImplementationApprovalRequestSubmissionBoundaryResult ===
      PASS,
    actualPatchImplementationApprovalRequestSubmissionBoundaryResult:
      summary.actualPatchImplementationApprovalRequestSubmissionBoundaryResult,
    actualPatchImplementationApprovalRequestSubmitted:
      summary.actualPatchImplementationApprovalRequestSubmitted,
    actualPatchImplementationApprovalRequestStatus:
      summary.actualPatchImplementationApprovalRequestStatus,
    actualPatchImplementationApprovalRequestResult:
      summary.actualPatchImplementationApprovalRequestResult,
    actualPatchImplementationApprovalDecisionIssued:
      summary.actualPatchImplementationApprovalDecisionIssued,
    actualPatchImplementationApprovalGranted:
      summary.actualPatchImplementationApprovalGranted,
    routeMountPatchImplementationAuthorizationDecisionIssued:
      summary.routeMountPatchImplementationAuthorizationDecisionIssued,
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
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
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
  SUBMITTED_PENDING_DECISION: SUBMITTED_PENDING_DECISION_VALUE,
  PENDING_DECISION: PENDING_DECISION_VALUE,
  AUTHORIZED_FOR_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5E_ACTUAL_PATCH_IMPLEMENTATION_APPROVAL_REQUEST_STATUS,
  buildOro5eActualPatchImplementationApprovalRequestInput,
  evaluateOro5eActualPatchImplementationApprovalRequest,
  buildOro5eActualPatchImplementationStillHeldGate,
  buildOro5eRouteMountStillHeldGate,
  buildOro5eRuntimeTrafficStillHeldGate,
  buildOro5eActualPatchImplementationApprovalRequestSummary,
  validateOro5eActualPatchImplementationApprovalRequest,
};
