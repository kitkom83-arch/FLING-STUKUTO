"use strict";

const {
  PASS,
  FAIL,
  HOLD,
  READY,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PASSED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  ACCEPTED,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  READINESS_RECORD_ONLY,
  NOT_ISSUED,
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput,
  evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
} = require("./oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundary");

const PHASE = "ORO-5L";
const PREPARED_FOR_SUBMISSION = "prepared_for_submission";
const SUBMITTED_PENDING_DECISION = "submitted_pending_decision";
const SUBMITTED = "submitted";
const PENDING_DECISION = "pending_decision";
const ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY =
  "route_mount_authorization_decision_request_only";
const POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY =
  "post_execution_validation_and_isolated_patch_artifact_review_only";
const AUTHORIZED_FOR_MOUNT = "authorized_for_mount";

const ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  READY,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PASSED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  ACCEPTED,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  READINESS_RECORD_ONLY,
  NOT_ISSUED,
  PREPARED_FOR_SUBMISSION,
  SUBMITTED_PENDING_DECISION,
  SUBMITTED,
  PENDING_DECISION,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY,
});

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5K_SUMMARY =
  evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
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

function buildOro5lRouteMountAuthorizationRequestSubmissionInput(overrides = {}) {
  const oro5kSummary = BASELINE_ORO5K_SUMMARY;
  const baseline = {
    id: "happyPathRouteMountAuthorizationRequestSubmissionFixture",
    phase: PHASE,
    oro5kReadiness: {
      readinessPresent: true,
      postExecutionValidationChecked:
        oro5kSummary.postExecutionValidationChecked,
      postExecutionValidationStatus: oro5kSummary.postExecutionValidationStatus,
      postExecutionValidationResult: oro5kSummary.postExecutionValidationResult,
      isolatedPatchArtifactReviewed: oro5kSummary.isolatedPatchArtifactReviewed,
      isolatedPatchArtifactReviewStatus:
        oro5kSummary.isolatedPatchArtifactReviewStatus,
      isolatedPatchArtifactReviewResult:
        oro5kSummary.isolatedPatchArtifactReviewResult,
      postExecutionEvidenceReviewed: oro5kSummary.postExecutionEvidenceReviewed,
      postExecutionEvidenceReviewStatus:
        oro5kSummary.postExecutionEvidenceReviewStatus,
      postExecutionEvidenceReviewResult:
        oro5kSummary.postExecutionEvidenceReviewResult,
      routeMountAuthorizationRequestReadinessChecked:
        oro5kSummary.routeMountAuthorizationRequestReadinessChecked,
      routeMountAuthorizationRequestReadinessStatus:
        oro5kSummary.routeMountAuthorizationRequestReadinessStatus,
      routeMountAuthorizationRequestReadinessResult:
        oro5kSummary.routeMountAuthorizationRequestReadinessResult,
      routeMountAuthorizationRequestPreparationAllowed:
        oro5kSummary.routeMountAuthorizationRequestPreparationAllowed,
      routeMountAuthorizationRequestPreparationScope:
        oro5kSummary.routeMountAuthorizationRequestPreparationScope,
      routeMountAuthorizationRequestSubmitted:
        oro5kSummary.routeMountAuthorizationRequestSubmitted,
      routeMountAuthorizationDecisionIssued:
        oro5kSummary.routeMountAuthorizationDecisionIssued,
      routeMountAuthorizationGranted: oro5kSummary.routeMountAuthorizationGranted,
      routeMountAuthorizationDecisionResult:
        oro5kSummary.routeMountAuthorizationDecisionResult,
      runtimeActualPatchImplementationImplemented:
        oro5kSummary.runtimeActualPatchImplementationImplemented,
      runtimeRoutePatched: oro5kSummary.runtimeRoutePatched,
      runtimeRouteControllerChanged: oro5kSummary.runtimeRouteControllerChanged,
      srcAppChanged: oro5kSummary.srcAppChanged,
      routeMountPatchApproved: oro5kSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5kSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5kSummary.routeMountPatchImplemented,
      routeMountAuthorization: oro5kSummary.routeMountAuthorization,
      expressMountAllowed: oro5kSummary.expressMountAllowed,
      expressMountImplemented: oro5kSummary.expressMountImplemented,
      publicAliasAllowed: oro5kSummary.publicAliasAllowed,
      publicAliasImplemented: oro5kSummary.publicAliasImplemented,
      runtimeTrafficAllowed: oro5kSummary.runtimeTrafficAllowed,
      runtimeTrafficEnabled: oro5kSummary.runtimeTrafficEnabled,
      walletMutationAllowed: oro5kSummary.walletMutationAllowed,
      walletMutationPerformed: oro5kSummary.walletMutationPerformed,
      ledgerMutationAllowed: oro5kSummary.ledgerMutationAllowed,
      ledgerMutationPerformed: oro5kSummary.ledgerMutationPerformed,
      prismaWriteAllowed: oro5kSummary.prismaWriteAllowed,
      prismaWritePerformed: oro5kSummary.prismaWritePerformed,
      dbTransactionAllowed: oro5kSummary.dbTransactionAllowed,
      dbTransactionPerformed: oro5kSummary.dbTransactionPerformed,
      migrationAllowed: oro5kSummary.migrationAllowed,
      migrationPerformed: oro5kSummary.migrationPerformed,
      externalNetworkAllowed: oro5kSummary.externalNetworkAllowed,
      externalNetworkCalled: oro5kSummary.externalNetworkCalled,
      liveOroPlayApiCallAllowed: oro5kSummary.liveOroPlayApiCallAllowed,
      liveOroPlayApiCalled: oro5kSummary.liveOroPlayApiCalled,
    },
    trace: {
      mode: "static-route-mount-authorization-request-submission",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5lRouteMountAuthorizationRequestSubmissionInput();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro5kReadiness)
    ? merged.oro5kReadiness
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    readinessPresent: readBoolean(readiness, "readinessPresent", true),
    postExecutionValidationChecked: readBoolean(
      readiness,
      "postExecutionValidationChecked",
      true
    ),
    postExecutionValidationStatus: readString(
      readiness,
      "postExecutionValidationStatus",
      PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS
    ),
    postExecutionValidationResult: readString(
      readiness,
      "postExecutionValidationResult",
      PASSED
    ),
    isolatedPatchArtifactReviewed: readBoolean(
      readiness,
      "isolatedPatchArtifactReviewed",
      true
    ),
    isolatedPatchArtifactReviewStatus: readString(
      readiness,
      "isolatedPatchArtifactReviewStatus",
      ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS
    ),
    isolatedPatchArtifactReviewResult: readString(
      readiness,
      "isolatedPatchArtifactReviewResult",
      ACCEPTED
    ),
    postExecutionEvidenceReviewed: readBoolean(
      readiness,
      "postExecutionEvidenceReviewed",
      true
    ),
    postExecutionEvidenceReviewStatus: readString(
      readiness,
      "postExecutionEvidenceReviewStatus",
      ACCEPTED
    ),
    postExecutionEvidenceReviewResult: readString(
      readiness,
      "postExecutionEvidenceReviewResult",
      ACCEPTED
    ),
    routeMountAuthorizationRequestReadinessChecked: readBoolean(
      readiness,
      "routeMountAuthorizationRequestReadinessChecked",
      true
    ),
    routeMountAuthorizationRequestReadinessStatus: readString(
      readiness,
      "routeMountAuthorizationRequestReadinessStatus",
      READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST
    ),
    routeMountAuthorizationRequestReadinessResult: readString(
      readiness,
      "routeMountAuthorizationRequestReadinessResult",
      READY
    ),
    routeMountAuthorizationRequestPreparationAllowed: readBoolean(
      readiness,
      "routeMountAuthorizationRequestPreparationAllowed",
      true
    ),
    routeMountAuthorizationRequestPreparationScope: readString(
      readiness,
      "routeMountAuthorizationRequestPreparationScope",
      READINESS_RECORD_ONLY
    ),
    inputRouteMountAuthorizationRequestSubmitted: readBoolean(
      readiness,
      "routeMountAuthorizationRequestSubmitted",
      false
    ),
    routeMountAuthorizationDecisionIssued: readBoolean(
      readiness,
      "routeMountAuthorizationDecisionIssued",
      false
    ),
    routeMountAuthorizationGranted: readBoolean(
      readiness,
      "routeMountAuthorizationGranted",
      false
    ),
    routeMountAuthorizationDecisionResult: readString(
      readiness,
      "routeMountAuthorizationDecisionResult",
      NOT_ISSUED
    ),
    runtimeActualPatchImplementationImplemented: readBoolean(
      readiness,
      "runtimeActualPatchImplementationImplemented",
      false
    ),
    runtimeRoutePatched: readBoolean(readiness, "runtimeRoutePatched", false),
    runtimeRouteControllerChanged: readBoolean(
      readiness,
      "runtimeRouteControllerChanged",
      false
    ),
    srcAppChanged: readBoolean(readiness, "srcAppChanged", false),
    routeMountPatchApproved: readBoolean(readiness, "routeMountPatchApproved", false),
    routeMountPatchImplementationAuthorized: readBoolean(
      readiness,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      readiness,
      "routeMountPatchImplemented",
      false
    ),
    routeMountAuthorization: readString(
      readiness,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(readiness, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(readiness, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(readiness, "publicAliasImplemented", false),
    runtimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(readiness, "runtimeTrafficEnabled", false),
    walletMutationAllowed: readBoolean(readiness, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(readiness, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(readiness, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(readiness, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(readiness, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(readiness, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(readiness, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(readiness, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(readiness, "migrationAllowed", false),
    migrationPerformed: readBoolean(readiness, "migrationPerformed", false),
    externalNetworkAllowed: readBoolean(readiness, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(readiness, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      readiness,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(readiness, "liveOroPlayApiCalled", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.readinessPresent) {
    blockers.push("ORO-5K readiness is required");
  }
  if (!fixture.postExecutionValidationChecked) {
    blockers.push("post-execution validation must be checked");
  }
  if (
    fixture.postExecutionValidationStatus !==
      PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS ||
    fixture.postExecutionValidationResult !== PASSED
  ) {
    blockers.push("post-execution validation must be passed");
  }
  if (!fixture.isolatedPatchArtifactReviewed) {
    blockers.push("isolated patch artifact must be reviewed");
  }
  if (
    fixture.isolatedPatchArtifactReviewStatus !==
      ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS ||
    fixture.isolatedPatchArtifactReviewResult !== ACCEPTED
  ) {
    blockers.push("isolated patch artifact must be accepted");
  }
  if (!fixture.postExecutionEvidenceReviewed) {
    blockers.push("post-execution evidence must be reviewed");
  }
  if (
    fixture.postExecutionEvidenceReviewStatus !== ACCEPTED ||
    fixture.postExecutionEvidenceReviewResult !== ACCEPTED
  ) {
    blockers.push("post-execution evidence must be accepted");
  }
  if (!fixture.routeMountAuthorizationRequestReadinessChecked) {
    blockers.push("route mount readiness must be checked");
  }
  if (
    fixture.routeMountAuthorizationRequestReadinessStatus !==
      READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST ||
    fixture.routeMountAuthorizationRequestReadinessResult !== READY
  ) {
    blockers.push("route mount readiness must be ready");
  }
  if (!fixture.routeMountAuthorizationRequestPreparationAllowed) {
    blockers.push("route mount authorization request preparation must be allowed");
  }
  if (
    fixture.routeMountAuthorizationRequestPreparationScope !==
    READINESS_RECORD_ONLY
  ) {
    blockers.push("route mount authorization request preparation scope must be readiness record only");
  }
  if (fixture.inputRouteMountAuthorizationRequestSubmitted) {
    blockers.push("route mount authorization request must not already be submitted");
  }
  if (fixture.routeMountAuthorizationDecisionIssued) {
    blockers.push("route mount authorization decision must not already be issued");
  }
  if (fixture.routeMountAuthorizationGranted) {
    blockers.push("route mount authorization must not already be granted");
  }
  if (fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (fixture.routeMountPatchImplementationAuthorized) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (fixture.routeMountPatchImplemented) {
    blockers.push("route mount patch must not be implemented");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.routeMountAuthorization === AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must not be authorized for mount");
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
    blockers.push("route mount authorization request submission input contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5lRouteMountAuthorizationRequestRecord(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationRequestSubmissionBoundaryEntered: true,
    routeMountAuthorizationRequestPrepared: true,
    routeMountAuthorizationRequestPreparationStatus: PREPARED_FOR_SUBMISSION,
    routeMountAuthorizationRequestSubmissionChecked: true,
    routeMountAuthorizationRequestSubmissionAllowed: true,
    routeMountAuthorizationRequestSubmitted: true,
    routeMountAuthorizationRequestStatus: SUBMITTED_PENDING_DECISION,
    routeMountAuthorizationRequestResult: SUBMITTED,
    routeMountAuthorizationRequestScope:
      ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
    routeMountAuthorizationRequestEvidenceIncluded: true,
    routeMountAuthorizationRequestEvidenceScope:
      POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY,
  };
}

function buildOro5lRouteMountAuthorizationDecisionStillHeldGate(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationDecisionRequired: true,
    routeMountAuthorizationDecisionIssued: false,
    routeMountAuthorizationDecisionResult: PENDING_DECISION,
    routeMountAuthorizationGranted: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    nextPhaseRequiresRouteMountAuthorizationDecisionBoundary: true,
  };
}

function buildOro5lRouteMountImplementationStillHeldGate(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary: true,
  };
}

function buildOro5lExpressMountStillHeldGate(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
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

function buildOro5lPublicAliasStillHeldGate(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
  };
}

function buildOro5lRuntimeTrafficStillHeldGate(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
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
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountAuthorizationRequestSubmissionBoundaryResult: HOLD,
    routeMountAuthorizationRequestSubmissionBoundaryEntered: false,
    routeMountAuthorizationRequestPrepared: false,
    routeMountAuthorizationRequestPreparationStatus: HOLD,
    routeMountAuthorizationRequestSubmissionChecked: false,
    routeMountAuthorizationRequestSubmissionAllowed: false,
    routeMountAuthorizationRequestSubmitted: false,
    routeMountAuthorizationRequestStatus: HOLD,
    routeMountAuthorizationRequestResult: HOLD,
    routeMountAuthorizationRequestScope: HOLD,
    routeMountAuthorizationRequestEvidenceIncluded: false,
    routeMountAuthorizationRequestEvidenceScope: HOLD,
    routeMountAuthorizationDecisionRequired: true,
    routeMountAuthorizationDecisionIssued: false,
    routeMountAuthorizationDecisionResult: PENDING_DECISION,
    routeMountAuthorizationGranted: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
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
    nextPhaseRequiresRouteMountAuthorizationDecisionBoundary: true,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresPostMountValidationBoundary: true,
    blockers,
  };
}

function buildOro5lRouteMountAuthorizationRequestSubmissionSummary(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const requestRecord = buildOro5lRouteMountAuthorizationRequestRecord(input);
  const decisionGate = buildOro5lRouteMountAuthorizationDecisionStillHeldGate(input);
  const implementationGate = buildOro5lRouteMountImplementationStillHeldGate(input);
  const expressGate = buildOro5lExpressMountStillHeldGate(input);
  const aliasGate = buildOro5lPublicAliasStillHeldGate(input);
  const trafficGate = buildOro5lRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountAuthorizationRequestSubmissionBoundaryResult: PASS,
    routeMountAuthorizationRequestSubmissionBoundaryEntered:
      requestRecord.routeMountAuthorizationRequestSubmissionBoundaryEntered,
    routeMountAuthorizationRequestPrepared:
      requestRecord.routeMountAuthorizationRequestPrepared,
    routeMountAuthorizationRequestPreparationStatus:
      requestRecord.routeMountAuthorizationRequestPreparationStatus,
    routeMountAuthorizationRequestSubmissionChecked:
      requestRecord.routeMountAuthorizationRequestSubmissionChecked,
    routeMountAuthorizationRequestSubmissionAllowed:
      requestRecord.routeMountAuthorizationRequestSubmissionAllowed,
    routeMountAuthorizationRequestSubmitted:
      requestRecord.routeMountAuthorizationRequestSubmitted,
    routeMountAuthorizationRequestStatus:
      requestRecord.routeMountAuthorizationRequestStatus,
    routeMountAuthorizationRequestResult:
      requestRecord.routeMountAuthorizationRequestResult,
    routeMountAuthorizationRequestScope:
      requestRecord.routeMountAuthorizationRequestScope,
    routeMountAuthorizationRequestEvidenceIncluded:
      requestRecord.routeMountAuthorizationRequestEvidenceIncluded,
    routeMountAuthorizationRequestEvidenceScope:
      requestRecord.routeMountAuthorizationRequestEvidenceScope,
    routeMountAuthorizationDecisionRequired:
      decisionGate.routeMountAuthorizationDecisionRequired,
    routeMountAuthorizationDecisionIssued:
      decisionGate.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationDecisionResult:
      decisionGate.routeMountAuthorizationDecisionResult,
    routeMountAuthorizationGranted: decisionGate.routeMountAuthorizationGranted,
    routeMountAuthorization: decisionGate.routeMountAuthorization,
    runtimeActualPatchImplementationImplemented:
      implementationGate.runtimeActualPatchImplementationImplemented,
    runtimeRoutePatched: implementationGate.runtimeRoutePatched,
    runtimeRouteControllerChanged:
      implementationGate.runtimeRouteControllerChanged,
    srcAppChanged: implementationGate.srcAppChanged,
    routeMountPatchApproved: implementationGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      implementationGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: implementationGate.routeMountPatchImplemented,
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
    nextPhaseRequiresRouteMountAuthorizationDecisionBoundary:
      decisionGate.nextPhaseRequiresRouteMountAuthorizationDecisionBoundary,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary:
      implementationGate.nextPhaseRequiresSeparateRouteMountImplementationBoundary,
    nextPhaseRequiresSeparatePublicAliasApproval:
      aliasGate.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostMountValidationBoundary:
      trafficGate.nextPhaseRequiresPostMountValidationBoundary,
    blockers,
  };
}

function evaluateOro5lRouteMountAuthorizationRequestSubmission(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  return buildOro5lRouteMountAuthorizationRequestSubmissionSummary(input);
}

function validateOro5lRouteMountAuthorizationRequestSubmission(
  input = buildOro5lRouteMountAuthorizationRequestSubmissionInput()
) {
  const summary = buildOro5lRouteMountAuthorizationRequestSubmissionSummary(input);
  return {
    valid: summary.routeMountAuthorizationRequestSubmissionBoundaryResult === PASS,
    routeMountAuthorizationRequestSubmissionBoundaryResult:
      summary.routeMountAuthorizationRequestSubmissionBoundaryResult,
    routeMountAuthorizationRequestSubmitted:
      summary.routeMountAuthorizationRequestSubmitted,
    routeMountAuthorizationRequestStatus:
      summary.routeMountAuthorizationRequestStatus,
    routeMountAuthorizationRequestResult:
      summary.routeMountAuthorizationRequestResult,
    routeMountAuthorizationDecisionRequired:
      summary.routeMountAuthorizationDecisionRequired,
    routeMountAuthorizationDecisionIssued:
      summary.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationDecisionResult:
      summary.routeMountAuthorizationDecisionResult,
    routeMountAuthorizationGranted: summary.routeMountAuthorizationGranted,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresRouteMountAuthorizationDecisionBoundary:
      summary.nextPhaseRequiresRouteMountAuthorizationDecisionBoundary,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary:
      summary.nextPhaseRequiresSeparateRouteMountImplementationBoundary,
    nextPhaseRequiresSeparatePublicAliasApproval:
      summary.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      summary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostMountValidationBoundary:
      summary.nextPhaseRequiresPostMountValidationBoundary,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  READY,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PASSED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  ACCEPTED,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  READINESS_RECORD_ONLY,
  NOT_ISSUED,
  PREPARED_FOR_SUBMISSION,
  SUBMITTED_PENDING_DECISION,
  SUBMITTED,
  PENDING_DECISION,
  ROUTE_MOUNT_AUTHORIZATION_DECISION_REQUEST_ONLY,
  POST_EXECUTION_VALIDATION_AND_ISOLATED_PATCH_ARTIFACT_REVIEW_ONLY,
  ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_STATUS,
  buildOro5lRouteMountAuthorizationRequestSubmissionInput,
  evaluateOro5lRouteMountAuthorizationRequestSubmission,
  buildOro5lRouteMountAuthorizationRequestRecord,
  buildOro5lRouteMountAuthorizationDecisionStillHeldGate,
  buildOro5lRouteMountImplementationStillHeldGate,
  buildOro5lExpressMountStillHeldGate,
  buildOro5lPublicAliasStillHeldGate,
  buildOro5lRuntimeTrafficStillHeldGate,
  buildOro5lRouteMountAuthorizationRequestSubmissionSummary,
  validateOro5lRouteMountAuthorizationRequestSubmission,
};
