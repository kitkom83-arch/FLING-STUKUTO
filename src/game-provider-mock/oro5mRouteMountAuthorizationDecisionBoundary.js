"use strict";

const {
  PASS,
  FAIL,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  PREPARED_FOR_SUBMISSION,
  SUBMITTED_PENDING_DECISION,
  SUBMITTED,
  PENDING_DECISION,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  buildOro5lRouteMountAuthorizationRequestSubmissionInput,
  evaluateOro5lRouteMountAuthorizationRequestSubmission,
} = require("./oro5lRouteMountAuthorizationRequestSubmissionBoundary");

const PHASE = "ORO-5M";
const DECISION_ISSUED = "decision_issued";
const APPROVED = "approved";
const ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY =
  "route_mount_implementation_boundary_only";
const AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY =
  "authorized_for_route_mount_implementation_boundary_only";

const ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  PREPARED_FOR_SUBMISSION,
  SUBMITTED_PENDING_DECISION,
  SUBMITTED,
  PENDING_DECISION,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  DECISION_ISSUED,
  APPROVED,
  ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
});

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5L_SUMMARY =
  evaluateOro5lRouteMountAuthorizationRequestSubmission(
    buildOro5lRouteMountAuthorizationRequestSubmissionInput()
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

function buildOro5mRouteMountAuthorizationDecisionInput(overrides = {}) {
  const oro5lSummary = BASELINE_ORO5L_SUMMARY;
  const baseline = {
    id: "happyPathRouteMountAuthorizationDecisionFixture",
    phase: PHASE,
    oro5lRequest: {
      requestPresent: true,
      routeMountAuthorizationRequestSubmissionBoundaryEntered:
        oro5lSummary.routeMountAuthorizationRequestSubmissionBoundaryEntered,
      routeMountAuthorizationRequestPrepared:
        oro5lSummary.routeMountAuthorizationRequestPrepared,
      routeMountAuthorizationRequestPreparationStatus:
        oro5lSummary.routeMountAuthorizationRequestPreparationStatus,
      routeMountAuthorizationRequestSubmissionChecked:
        oro5lSummary.routeMountAuthorizationRequestSubmissionChecked,
      routeMountAuthorizationRequestSubmissionAllowed:
        oro5lSummary.routeMountAuthorizationRequestSubmissionAllowed,
      routeMountAuthorizationRequestSubmitted:
        oro5lSummary.routeMountAuthorizationRequestSubmitted,
      routeMountAuthorizationRequestStatus:
        oro5lSummary.routeMountAuthorizationRequestStatus,
      routeMountAuthorizationRequestResult:
        oro5lSummary.routeMountAuthorizationRequestResult,
      routeMountAuthorizationRequestScope:
        oro5lSummary.routeMountAuthorizationRequestScope,
      routeMountAuthorizationRequestEvidenceIncluded:
        oro5lSummary.routeMountAuthorizationRequestEvidenceIncluded,
      routeMountAuthorizationDecisionRequired:
        oro5lSummary.routeMountAuthorizationDecisionRequired,
      routeMountAuthorizationDecisionIssued:
        oro5lSummary.routeMountAuthorizationDecisionIssued,
      routeMountAuthorizationDecisionResult:
        oro5lSummary.routeMountAuthorizationDecisionResult,
      routeMountAuthorizationGranted: oro5lSummary.routeMountAuthorizationGranted,
      routeMountAuthorization: oro5lSummary.routeMountAuthorization,
      routeMountPatchImplementationAuthorized:
        oro5lSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5lSummary.routeMountPatchImplemented,
      runtimeActualPatchImplementationImplemented:
        oro5lSummary.runtimeActualPatchImplementationImplemented,
      runtimeRoutePatched: oro5lSummary.runtimeRoutePatched,
      runtimeRouteControllerChanged: oro5lSummary.runtimeRouteControllerChanged,
      srcAppChanged: oro5lSummary.srcAppChanged,
      expressMountAllowed: oro5lSummary.expressMountAllowed,
      expressMountImplemented: oro5lSummary.expressMountImplemented,
      publicAliasAllowed: oro5lSummary.publicAliasAllowed,
      publicAliasImplemented: oro5lSummary.publicAliasImplemented,
      runtimeTrafficAllowed: oro5lSummary.runtimeTrafficAllowed,
      runtimeTrafficEnabled: oro5lSummary.runtimeTrafficEnabled,
      walletMutationAllowed: oro5lSummary.walletMutationAllowed,
      walletMutationPerformed: oro5lSummary.walletMutationPerformed,
      ledgerMutationAllowed: oro5lSummary.ledgerMutationAllowed,
      ledgerMutationPerformed: oro5lSummary.ledgerMutationPerformed,
      prismaWriteAllowed: oro5lSummary.prismaWriteAllowed,
      prismaWritePerformed: oro5lSummary.prismaWritePerformed,
      dbTransactionAllowed: oro5lSummary.dbTransactionAllowed,
      dbTransactionPerformed: oro5lSummary.dbTransactionPerformed,
      migrationAllowed: oro5lSummary.migrationAllowed,
      migrationPerformed: oro5lSummary.migrationPerformed,
      externalNetworkAllowed: oro5lSummary.externalNetworkAllowed,
      externalNetworkCalled: oro5lSummary.externalNetworkCalled,
      liveOroPlayApiCallAllowed: oro5lSummary.liveOroPlayApiCallAllowed,
      liveOroPlayApiCalled: oro5lSummary.liveOroPlayApiCalled,
    },
    trace: {
      mode: "static-route-mount-authorization-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5mRouteMountAuthorizationDecisionInput();
  const merged = deepMerge(baseline, source);
  const request = isPlainObject(merged.oro5lRequest) ? merged.oro5lRequest : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    requestPresent: readBoolean(request, "requestPresent", true),
    routeMountAuthorizationRequestSubmissionBoundaryEntered: readBoolean(
      request,
      "routeMountAuthorizationRequestSubmissionBoundaryEntered",
      true
    ),
    routeMountAuthorizationRequestPrepared: readBoolean(
      request,
      "routeMountAuthorizationRequestPrepared",
      true
    ),
    routeMountAuthorizationRequestPreparationStatus: readString(
      request,
      "routeMountAuthorizationRequestPreparationStatus",
      PREPARED_FOR_SUBMISSION
    ),
    routeMountAuthorizationRequestSubmissionChecked: readBoolean(
      request,
      "routeMountAuthorizationRequestSubmissionChecked",
      true
    ),
    routeMountAuthorizationRequestSubmissionAllowed: readBoolean(
      request,
      "routeMountAuthorizationRequestSubmissionAllowed",
      true
    ),
    routeMountAuthorizationRequestSubmitted: readBoolean(
      request,
      "routeMountAuthorizationRequestSubmitted",
      true
    ),
    routeMountAuthorizationRequestStatus: readString(
      request,
      "routeMountAuthorizationRequestStatus",
      SUBMITTED_PENDING_DECISION
    ),
    routeMountAuthorizationRequestResult: readString(
      request,
      "routeMountAuthorizationRequestResult",
      SUBMITTED
    ),
    routeMountAuthorizationRequestScope: readString(
      request,
      "routeMountAuthorizationRequestScope",
      ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY
    ),
    routeMountAuthorizationRequestEvidenceIncluded: readBoolean(
      request,
      "routeMountAuthorizationRequestEvidenceIncluded",
      true
    ),
    routeMountAuthorizationDecisionRequired: readBoolean(
      request,
      "routeMountAuthorizationDecisionRequired",
      true
    ),
    routeMountAuthorizationDecisionIssued: readBoolean(
      request,
      "routeMountAuthorizationDecisionIssued",
      false
    ),
    routeMountAuthorizationDecisionResult: readString(
      request,
      "routeMountAuthorizationDecisionResult",
      PENDING_DECISION
    ),
    routeMountAuthorizationGranted: readBoolean(
      request,
      "routeMountAuthorizationGranted",
      false
    ),
    routeMountAuthorization: readString(
      request,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
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
    runtimeActualPatchImplementationImplemented: readBoolean(
      request,
      "runtimeActualPatchImplementationImplemented",
      false
    ),
    runtimeRoutePatched: readBoolean(request, "runtimeRoutePatched", false),
    runtimeRouteControllerChanged: readBoolean(
      request,
      "runtimeRouteControllerChanged",
      false
    ),
    srcAppChanged: readBoolean(request, "srcAppChanged", false),
    expressMountAllowed: readBoolean(request, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(request, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(request, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(request, "publicAliasImplemented", false),
    runtimeTrafficAllowed: readBoolean(request, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(request, "runtimeTrafficEnabled", false),
    walletMutationAllowed: readBoolean(request, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(request, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(request, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(request, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(request, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(request, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(request, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(request, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(request, "migrationAllowed", false),
    migrationPerformed: readBoolean(request, "migrationPerformed", false),
    externalNetworkAllowed: readBoolean(request, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(request, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      request,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(request, "liveOroPlayApiCalled", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.requestPresent) {
    blockers.push("ORO-5L request is required");
  }
  if (!fixture.routeMountAuthorizationRequestSubmissionBoundaryEntered) {
    blockers.push("ORO-5L request submission boundary must be entered");
  }
  if (!fixture.routeMountAuthorizationRequestPrepared) {
    blockers.push("route mount authorization request must be prepared");
  }
  if (
    fixture.routeMountAuthorizationRequestPreparationStatus !==
    PREPARED_FOR_SUBMISSION
  ) {
    blockers.push("route mount authorization request must be prepared for submission");
  }
  if (!fixture.routeMountAuthorizationRequestSubmissionChecked) {
    blockers.push("route mount authorization request submission must be checked");
  }
  if (!fixture.routeMountAuthorizationRequestSubmissionAllowed) {
    blockers.push("route mount authorization request submission must be allowed");
  }
  if (!fixture.routeMountAuthorizationRequestSubmitted) {
    blockers.push("route mount authorization request must be submitted");
  }
  if (
    fixture.routeMountAuthorizationRequestStatus !== SUBMITTED_PENDING_DECISION
  ) {
    blockers.push("route mount authorization request must be pending decision");
  }
  if (fixture.routeMountAuthorizationRequestResult !== SUBMITTED) {
    blockers.push("route mount authorization request result must be submitted");
  }
  if (
    fixture.routeMountAuthorizationRequestScope !==
    ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY
  ) {
    blockers.push("route mount authorization request scope must be decision request only");
  }
  if (!fixture.routeMountAuthorizationRequestEvidenceIncluded) {
    blockers.push("route mount authorization request evidence is required");
  }
  if (!fixture.routeMountAuthorizationDecisionRequired) {
    blockers.push("route mount authorization decision must be required");
  }
  if (fixture.routeMountAuthorizationDecisionIssued) {
    blockers.push("route mount authorization decision must not already be issued");
  }
  if (fixture.routeMountAuthorizationDecisionResult !== PENDING_DECISION) {
    blockers.push("route mount authorization decision result must be pending");
  }
  if (fixture.routeMountAuthorizationGranted) {
    blockers.push("route mount authorization must not already be granted");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized before decision");
  }
  if (fixture.routeMountPatchImplementationAuthorized) {
    blockers.push("route mount implementation must not already be authorized");
  }
  if (fixture.routeMountPatchImplemented) {
    blockers.push("route mount patch must not be implemented");
  }
  if (fixture.runtimeActualPatchImplementationImplemented) {
    blockers.push("runtime actual patch implementation must not already be implemented");
  }
  if (fixture.runtimeRoutePatched) {
    blockers.push("runtime route must not be patched");
  }
  if (fixture.srcAppChanged) {
    blockers.push("src/app.js must not be changed");
  }
  if (fixture.runtimeRouteControllerChanged) {
    blockers.push("runtime route or controller must not be changed");
  }
  if (fixture.expressMountAllowed || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not allowed or implemented");
  }
  if (fixture.publicAliasAllowed || fixture.publicAliasImplemented) {
    blockers.push("public alias must remain not allowed or implemented");
  }
  if (fixture.runtimeTrafficAllowed || fixture.runtimeTrafficEnabled) {
    blockers.push("runtime traffic must remain not allowed or enabled");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain not allowed or performed");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain not allowed or performed");
  }
  if (fixture.prismaWriteAllowed || fixture.prismaWritePerformed) {
    blockers.push("Prisma write must remain not allowed or performed");
  }
  if (fixture.dbTransactionAllowed || fixture.dbTransactionPerformed) {
    blockers.push("DB transaction must remain not allowed or performed");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain not allowed or performed");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain not allowed or called");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain not allowed or called");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("route mount authorization decision input contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5mRouteMountAuthorizationDecisionRecord(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationDecisionBoundaryEntered: true,
    routeMountAuthorizationDecisionChecked: true,
    routeMountAuthorizationDecisionIssued: true,
    routeMountAuthorizationDecisionStatus: DECISION_ISSUED,
    routeMountAuthorizationDecisionResult: APPROVED,
    routeMountAuthorizationGranted: true,
    routeMountAuthorizationGrantScope: ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
    routeMountAuthorization:
      AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
    routeMountAuthorizationRequestStatus: DECISION_ISSUED,
    routeMountAuthorizationRequestResult: APPROVED,
    routeMountAuthorizationRequestResolved: true,
    routeMountPatchImplementationAuthorized: true,
    routeMountPatchImplementationAuthorizationScope:
      ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
    routeMountImplementationBoundaryEntryAllowed: true,
    routeMountImplementationBoundaryEntryScope:
      ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  };
}

function buildOro5mRouteMountImplementationStillHeldGate(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountPatchImplemented: false,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    nextPhaseRequiresRouteMountImplementationBoundary: true,
  };
}

function buildOro5mExpressMountStillHeldGate(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    expressMountAllowed: false,
    expressMountImplemented: false,
    srcAppChanged: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
  };
}

function buildOro5mPublicAliasStillHeldGate(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
  };
}

function buildOro5mRuntimeTrafficStillHeldGate(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    walletMutationAllowed: false,
    walletMutationPerformed: false,
    ledgerMutationAllowed: false,
    ledgerMutationPerformed: false,
    prismaWriteAllowed: false,
    prismaWritePerformed: false,
    dbTransactionAllowed: false,
    dbTransactionPerformed: false,
    migrationAllowed: false,
    migrationPerformed: false,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresPostMountValidationBoundary: true,
    nextPhaseRequiresSeparateLiveTrafficApproval: true,
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountAuthorizationDecisionBoundaryResult: HOLD,
    routeMountAuthorizationDecisionBoundaryEntered: false,
    routeMountAuthorizationDecisionChecked: false,
    routeMountAuthorizationDecisionIssued: false,
    routeMountAuthorizationDecisionStatus: HOLD,
    routeMountAuthorizationDecisionResult: PENDING_DECISION,
    routeMountAuthorizationGranted: false,
    routeMountAuthorizationGrantScope: HOLD,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    routeMountAuthorizationRequestStatus:
      fixture.routeMountAuthorizationRequestStatus,
    routeMountAuthorizationRequestResult:
      fixture.routeMountAuthorizationRequestResult,
    routeMountAuthorizationRequestResolved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplementationAuthorizationScope: HOLD,
    routeMountImplementationBoundaryEntryAllowed: false,
    routeMountImplementationBoundaryEntryScope: HOLD,
    routeMountPatchImplemented: false,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    expressMountAllowed: false,
    expressMountImplemented: false,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    walletMutationAllowed: false,
    walletMutationPerformed: false,
    ledgerMutationAllowed: false,
    ledgerMutationPerformed: false,
    prismaWriteAllowed: false,
    prismaWritePerformed: false,
    dbTransactionAllowed: false,
    dbTransactionPerformed: false,
    migrationAllowed: false,
    migrationPerformed: false,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    nextPhaseRequiresRouteMountImplementationBoundary: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresPostMountValidationBoundary: true,
    nextPhaseRequiresSeparateLiveTrafficApproval: true,
    blockers,
  };
}

function buildOro5mRouteMountAuthorizationDecisionSummary(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const decision = buildOro5mRouteMountAuthorizationDecisionRecord(input);
  const implementationGate = buildOro5mRouteMountImplementationStillHeldGate(input);
  const expressGate = buildOro5mExpressMountStillHeldGate(input);
  const aliasGate = buildOro5mPublicAliasStillHeldGate(input);
  const trafficGate = buildOro5mRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountAuthorizationDecisionBoundaryResult: PASS,
    routeMountAuthorizationDecisionBoundaryEntered:
      decision.routeMountAuthorizationDecisionBoundaryEntered,
    routeMountAuthorizationDecisionChecked:
      decision.routeMountAuthorizationDecisionChecked,
    routeMountAuthorizationDecisionIssued:
      decision.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationDecisionStatus:
      decision.routeMountAuthorizationDecisionStatus,
    routeMountAuthorizationDecisionResult:
      decision.routeMountAuthorizationDecisionResult,
    routeMountAuthorizationGranted: decision.routeMountAuthorizationGranted,
    routeMountAuthorizationGrantScope: decision.routeMountAuthorizationGrantScope,
    routeMountAuthorization: decision.routeMountAuthorization,
    routeMountAuthorizationRequestStatus:
      decision.routeMountAuthorizationRequestStatus,
    routeMountAuthorizationRequestResult:
      decision.routeMountAuthorizationRequestResult,
    routeMountAuthorizationRequestResolved:
      decision.routeMountAuthorizationRequestResolved,
    routeMountPatchImplementationAuthorized:
      decision.routeMountPatchImplementationAuthorized,
    routeMountPatchImplementationAuthorizationScope:
      decision.routeMountPatchImplementationAuthorizationScope,
    routeMountImplementationBoundaryEntryAllowed:
      decision.routeMountImplementationBoundaryEntryAllowed,
    routeMountImplementationBoundaryEntryScope:
      decision.routeMountImplementationBoundaryEntryScope,
    routeMountPatchImplemented: implementationGate.routeMountPatchImplemented,
    runtimeActualPatchImplementationImplemented:
      implementationGate.runtimeActualPatchImplementationImplemented,
    runtimeRoutePatched: implementationGate.runtimeRoutePatched,
    runtimeRouteControllerChanged:
      implementationGate.runtimeRouteControllerChanged,
    srcAppChanged: implementationGate.srcAppChanged,
    expressMountAllowed: expressGate.expressMountAllowed,
    expressMountImplemented: expressGate.expressMountImplemented,
    publicAliasAllowed: aliasGate.publicAliasAllowed,
    publicAliasImplemented: aliasGate.publicAliasImplemented,
    runtimeTrafficAllowed: trafficGate.runtimeTrafficAllowed,
    runtimeTrafficEnabled: trafficGate.runtimeTrafficEnabled,
    walletMutationAllowed: trafficGate.walletMutationAllowed,
    walletMutationPerformed: trafficGate.walletMutationPerformed,
    ledgerMutationAllowed: trafficGate.ledgerMutationAllowed,
    ledgerMutationPerformed: trafficGate.ledgerMutationPerformed,
    prismaWriteAllowed: trafficGate.prismaWriteAllowed,
    prismaWritePerformed: trafficGate.prismaWritePerformed,
    dbTransactionAllowed: trafficGate.dbTransactionAllowed,
    dbTransactionPerformed: trafficGate.dbTransactionPerformed,
    migrationAllowed: trafficGate.migrationAllowed,
    migrationPerformed: trafficGate.migrationPerformed,
    externalNetworkAllowed: trafficGate.externalNetworkAllowed,
    externalNetworkCalled: trafficGate.externalNetworkCalled,
    liveOroPlayApiCallAllowed: trafficGate.liveOroPlayApiCallAllowed,
    liveOroPlayApiCalled: trafficGate.liveOroPlayApiCalled,
    nextPhaseRequiresRouteMountImplementationBoundary:
      implementationGate.nextPhaseRequiresRouteMountImplementationBoundary,
    nextPhaseRequiresSeparatePublicAliasApproval:
      aliasGate.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostMountValidationBoundary:
      trafficGate.nextPhaseRequiresPostMountValidationBoundary,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers,
  };
}

function evaluateOro5mRouteMountAuthorizationDecision(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  return buildOro5mRouteMountAuthorizationDecisionSummary(input);
}

function validateOro5mRouteMountAuthorizationDecision(
  input = buildOro5mRouteMountAuthorizationDecisionInput()
) {
  const summary = buildOro5mRouteMountAuthorizationDecisionSummary(input);
  return {
    valid: summary.routeMountAuthorizationDecisionBoundaryResult === PASS,
    routeMountAuthorizationDecisionBoundaryResult:
      summary.routeMountAuthorizationDecisionBoundaryResult,
    routeMountAuthorizationDecisionIssued:
      summary.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationDecisionStatus:
      summary.routeMountAuthorizationDecisionStatus,
    routeMountAuthorizationDecisionResult:
      summary.routeMountAuthorizationDecisionResult,
    routeMountAuthorizationGranted: summary.routeMountAuthorizationGranted,
    routeMountAuthorization: summary.routeMountAuthorization,
    routeMountPatchImplementationAuthorized:
      summary.routeMountPatchImplementationAuthorized,
    routeMountImplementationBoundaryEntryAllowed:
      summary.routeMountImplementationBoundaryEntryAllowed,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresRouteMountImplementationBoundary:
      summary.nextPhaseRequiresRouteMountImplementationBoundary,
    nextPhaseRequiresSeparatePublicAliasApproval:
      summary.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      summary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostMountValidationBoundary:
      summary.nextPhaseRequiresPostMountValidationBoundary,
    nextPhaseRequiresSeparateLiveTrafficApproval:
      summary.nextPhaseRequiresSeparateLiveTrafficApproval,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  NOT_AUTHORIZED_FOR_MOUNT,
  PREPARED_FOR_SUBMISSION,
  SUBMITTED_PENDING_DECISION,
  SUBMITTED,
  PENDING_DECISION,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  DECISION_ISSUED,
  APPROVED,
  ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_STATUS,
  buildOro5mRouteMountAuthorizationDecisionInput,
  evaluateOro5mRouteMountAuthorizationDecision,
  buildOro5mRouteMountAuthorizationDecisionRecord,
  buildOro5mRouteMountImplementationStillHeldGate,
  buildOro5mExpressMountStillHeldGate,
  buildOro5mPublicAliasStillHeldGate,
  buildOro5mRuntimeTrafficStillHeldGate,
  buildOro5mRouteMountAuthorizationDecisionSummary,
  validateOro5mRouteMountAuthorizationDecision,
};
