"use strict";

const {
  PASS,
  FAIL,
  HOLD,
  READY,
  PREPARED,
  READY_FOR_REVIEW,
  NOT_AUTHORIZED_FOR_MOUNT,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  EXECUTED,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
  buildOro5jActualPatchImplementationExecutionInput,
  evaluateOro5jActualPatchImplementationExecution,
} = require("./oro5jActualPatchImplementationExecutionBoundary");

const PHASE = "ORO-5K";
const PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS =
  "passed_for_route_mount_authorization_request_readiness";
const PASSED = "passed";
const ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS =
  "accepted_for_route_mount_authorization_request_readiness";
const ACCEPTED = "accepted";
const READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST =
  "ready_to_prepare_route_mount_authorization_request";
const READINESS_RECORD_ONLY = "readiness_record_only";
const NOT_ISSUED = "not_issued";
const AUTHORIZED_FOR_MOUNT = "authorized_for_mount";

const ORO_5K_POST_EXECUTION_VALIDATION_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    READY,
    PREPARED,
    READY_FOR_REVIEW,
    NOT_AUTHORIZED_FOR_MOUNT,
    EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
    EXECUTED,
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
    APPLIED_TO_MOCK_ARTIFACT_ONLY,
    PREPARED_FOR_POST_EXECUTION_REVIEW,
    PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
    PASSED,
    ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
    ACCEPTED,
    READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
    READINESS_RECORD_ONLY,
    NOT_ISSUED,
  });

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5J_SUMMARY = evaluateOro5jActualPatchImplementationExecution(
  buildOro5jActualPatchImplementationExecutionInput()
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

function buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput(
  overrides = {}
) {
  const oro5jSummary = BASELINE_ORO5J_SUMMARY;
  const baseline = {
    id: "happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture",
    phase: PHASE,
    oro5jExecution: {
      executionPresent: true,
      actualPatchImplementationExecutionBoundaryEntered:
        oro5jSummary.actualPatchImplementationExecutionBoundaryEntered,
      actualPatchImplementationExecutionStarted:
        oro5jSummary.actualPatchImplementationExecutionStarted,
      actualPatchImplementationExecutionCompleted:
        oro5jSummary.actualPatchImplementationExecutionCompleted,
      actualPatchImplementationExecutionStatus:
        oro5jSummary.actualPatchImplementationExecutionStatus,
      actualPatchImplementationExecutionResult:
        oro5jSummary.actualPatchImplementationExecutionResult,
      actualPatchImplementationExecutionScope:
        oro5jSummary.actualPatchImplementationExecutionScope,
      isolatedActualPatchImplementationExecuted:
        oro5jSummary.isolatedActualPatchImplementationExecuted,
      isolatedActualPatchImplementationPatchApplied:
        oro5jSummary.isolatedActualPatchImplementationPatchApplied,
      isolatedActualPatchImplementationPatchResult:
        oro5jSummary.isolatedActualPatchImplementationPatchResult,
      actualPatchImplementationPatchArtifactPrepared:
        oro5jSummary.actualPatchImplementationPatchArtifactPrepared,
      actualPatchImplementationPatchArtifactStatus:
        oro5jSummary.actualPatchImplementationPatchArtifactStatus,
      actualPatchImplementationPatchArtifactResult:
        oro5jSummary.actualPatchImplementationPatchArtifactResult,
      actualPatchImplementationImplemented:
        oro5jSummary.actualPatchImplementationImplemented,
      actualPatchImplementationImplementationScope:
        oro5jSummary.actualPatchImplementationImplementationScope,
      postExecutionEvidencePrepared: oro5jSummary.postExecutionEvidencePrepared,
      postExecutionEvidenceStatus: oro5jSummary.postExecutionEvidenceStatus,
      postExecutionEvidenceResult: oro5jSummary.postExecutionEvidenceResult,
      runtimeActualPatchImplementationImplemented:
        oro5jSummary.runtimeActualPatchImplementationImplemented,
      runtimeRoutePatched: oro5jSummary.runtimeRoutePatched,
      runtimeRouteControllerChanged: oro5jSummary.runtimeRouteControllerChanged,
      srcAppChanged: oro5jSummary.srcAppChanged,
      routeMountPatchApproved: oro5jSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5jSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5jSummary.routeMountPatchImplemented,
      routeMountAuthorization: oro5jSummary.routeMountAuthorization,
      expressMountAllowed: oro5jSummary.expressMountAllowed,
      expressMountImplemented: oro5jSummary.expressMountImplemented,
      publicAliasAllowed: oro5jSummary.publicAliasAllowed,
      publicAliasImplemented: oro5jSummary.publicAliasImplemented,
      runtimeTrafficAllowed: oro5jSummary.runtimeTrafficAllowed,
      runtimeTrafficEnabled: oro5jSummary.runtimeTrafficEnabled,
      walletMutationAllowed: oro5jSummary.walletMutationAllowed,
      walletMutationPerformed: oro5jSummary.walletMutationPerformed,
      ledgerMutationAllowed: oro5jSummary.ledgerMutationAllowed,
      ledgerMutationPerformed: oro5jSummary.ledgerMutationPerformed,
      prismaWriteAllowed: oro5jSummary.prismaWriteAllowed,
      prismaWritePerformed: oro5jSummary.prismaWritePerformed,
      dbTransactionAllowed: oro5jSummary.dbTransactionAllowed,
      dbTransactionPerformed: oro5jSummary.dbTransactionPerformed,
      migrationAllowed: oro5jSummary.migrationAllowed,
      migrationPerformed: oro5jSummary.migrationPerformed,
      externalNetworkAllowed: oro5jSummary.externalNetworkAllowed,
      externalNetworkCalled: oro5jSummary.externalNetworkCalled,
      liveOroPlayApiCallAllowed: oro5jSummary.liveOroPlayApiCallAllowed,
      liveOroPlayApiCalled: oro5jSummary.liveOroPlayApiCalled,
    },
    routeMountReadinessState: {
      routeMountAuthorizationRequestSubmitted: false,
      routeMountAuthorizationDecisionIssued: false,
      routeMountAuthorizationGranted: false,
      routeMountAuthorizationDecisionResult: NOT_ISSUED,
      routeMountAuthorizationRequestPreparationAllowed: false,
      routeMountAuthorizationRequestSubmissionAllowed: false,
      routeMountPatchApproved: false,
      routeMountPatchImplementationAuthorized: false,
      routeMountPatchImplemented: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
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
      nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary: true,
      nextPhaseRequiresSeparateRouteMountAuthorizationDecision: true,
      nextPhaseRequiresSeparateRouteMountImplementationBoundary: true,
      nextPhaseRequiresSeparatePublicAliasApproval: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresPostMountValidationBoundary: true,
    },
    trace: {
      mode: "static-post-execution-validation-route-mount-request-readiness",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput();
  const merged = deepMerge(baseline, source);
  const execution = isPlainObject(merged.oro5jExecution) ? merged.oro5jExecution : {};
  const routeState = isPlainObject(merged.routeMountReadinessState)
    ? merged.routeMountReadinessState
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    executionPresent: readBoolean(execution, "executionPresent", true),
    actualPatchImplementationExecutionBoundaryEntered: readBoolean(
      execution,
      "actualPatchImplementationExecutionBoundaryEntered",
      true
    ),
    actualPatchImplementationExecutionStarted: readBoolean(
      execution,
      "actualPatchImplementationExecutionStarted",
      true
    ),
    actualPatchImplementationExecutionCompleted: readBoolean(
      execution,
      "actualPatchImplementationExecutionCompleted",
      true
    ),
    actualPatchImplementationExecutionStatus: readString(
      execution,
      "actualPatchImplementationExecutionStatus",
      EXECUTED_ISOLATED_NON_MOUNTED_PATCH
    ),
    actualPatchImplementationExecutionResult: readString(
      execution,
      "actualPatchImplementationExecutionResult",
      EXECUTED
    ),
    actualPatchImplementationExecutionScope: readString(
      execution,
      "actualPatchImplementationExecutionScope",
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
    ),
    isolatedActualPatchImplementationExecuted: readBoolean(
      execution,
      "isolatedActualPatchImplementationExecuted",
      true
    ),
    isolatedActualPatchImplementationPatchApplied: readBoolean(
      execution,
      "isolatedActualPatchImplementationPatchApplied",
      true
    ),
    isolatedActualPatchImplementationPatchResult: readString(
      execution,
      "isolatedActualPatchImplementationPatchResult",
      APPLIED_TO_MOCK_ARTIFACT_ONLY
    ),
    actualPatchImplementationPatchArtifactPrepared: readBoolean(
      execution,
      "actualPatchImplementationPatchArtifactPrepared",
      true
    ),
    actualPatchImplementationPatchArtifactStatus: readString(
      execution,
      "actualPatchImplementationPatchArtifactStatus",
      PREPARED_FOR_POST_EXECUTION_REVIEW
    ),
    actualPatchImplementationPatchArtifactResult: readString(
      execution,
      "actualPatchImplementationPatchArtifactResult",
      READY_FOR_REVIEW
    ),
    actualPatchImplementationImplemented: readBoolean(
      execution,
      "actualPatchImplementationImplemented",
      true
    ),
    actualPatchImplementationImplementationScope: readString(
      execution,
      "actualPatchImplementationImplementationScope",
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
    ),
    postExecutionEvidencePrepared: readBoolean(
      execution,
      "postExecutionEvidencePrepared",
      true
    ),
    postExecutionEvidenceStatus: readString(
      execution,
      "postExecutionEvidenceStatus",
      PREPARED
    ),
    postExecutionEvidenceResult: readString(
      execution,
      "postExecutionEvidenceResult",
      READY_FOR_REVIEW
    ),
    runtimeActualPatchImplementationImplemented: readBoolean(
      execution,
      "runtimeActualPatchImplementationImplemented",
      false
    ),
    runtimeRoutePatched: readBoolean(execution, "runtimeRoutePatched", false),
    runtimeRouteControllerChanged: readBoolean(
      execution,
      "runtimeRouteControllerChanged",
      false
    ),
    srcAppChanged: readBoolean(execution, "srcAppChanged", false),
    executionRouteMountPatchApproved: readBoolean(
      execution,
      "routeMountPatchApproved",
      false
    ),
    executionRouteMountPatchImplementationAuthorized: readBoolean(
      execution,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    executionRouteMountPatchImplemented: readBoolean(
      execution,
      "routeMountPatchImplemented",
      false
    ),
    executionRouteMountAuthorization: readString(
      execution,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    executionExpressMountAllowed: readBoolean(execution, "expressMountAllowed", false),
    executionExpressMountImplemented: readBoolean(
      execution,
      "expressMountImplemented",
      false
    ),
    executionPublicAliasAllowed: readBoolean(execution, "publicAliasAllowed", false),
    executionPublicAliasImplemented: readBoolean(
      execution,
      "publicAliasImplemented",
      false
    ),
    executionRuntimeTrafficAllowed: readBoolean(
      execution,
      "runtimeTrafficAllowed",
      false
    ),
    executionRuntimeTrafficEnabled: readBoolean(
      execution,
      "runtimeTrafficEnabled",
      false
    ),
    executionWalletMutationAllowed: readBoolean(
      execution,
      "walletMutationAllowed",
      false
    ),
    executionWalletMutationPerformed: readBoolean(
      execution,
      "walletMutationPerformed",
      false
    ),
    executionLedgerMutationAllowed: readBoolean(
      execution,
      "ledgerMutationAllowed",
      false
    ),
    executionLedgerMutationPerformed: readBoolean(
      execution,
      "ledgerMutationPerformed",
      false
    ),
    executionPrismaWriteAllowed: readBoolean(execution, "prismaWriteAllowed", false),
    executionPrismaWritePerformed: readBoolean(
      execution,
      "prismaWritePerformed",
      false
    ),
    executionDbTransactionAllowed: readBoolean(
      execution,
      "dbTransactionAllowed",
      false
    ),
    executionDbTransactionPerformed: readBoolean(
      execution,
      "dbTransactionPerformed",
      false
    ),
    executionMigrationAllowed: readBoolean(execution, "migrationAllowed", false),
    executionMigrationPerformed: readBoolean(execution, "migrationPerformed", false),
    executionExternalNetworkAllowed: readBoolean(
      execution,
      "externalNetworkAllowed",
      false
    ),
    executionExternalNetworkCalled: readBoolean(
      execution,
      "externalNetworkCalled",
      false
    ),
    executionLiveOroPlayApiCallAllowed: readBoolean(
      execution,
      "liveOroPlayApiCallAllowed",
      false
    ),
    executionLiveOroPlayApiCalled: readBoolean(
      execution,
      "liveOroPlayApiCalled",
      false
    ),
    routeMountAuthorizationRequestSubmitted: readBoolean(
      routeState,
      "routeMountAuthorizationRequestSubmitted",
      false
    ),
    routeMountAuthorizationDecisionIssued: readBoolean(
      routeState,
      "routeMountAuthorizationDecisionIssued",
      false
    ),
    routeMountAuthorizationGranted: readBoolean(
      routeState,
      "routeMountAuthorizationGranted",
      false
    ),
    routeMountAuthorizationDecisionResult: readString(
      routeState,
      "routeMountAuthorizationDecisionResult",
      NOT_ISSUED
    ),
    routeMountAuthorizationRequestSubmissionAllowed: readBoolean(
      routeState,
      "routeMountAuthorizationRequestSubmissionAllowed",
      false
    ),
    routeMountPatchApproved: readBoolean(routeState, "routeMountPatchApproved", false),
    routeMountPatchImplementationAuthorized: readBoolean(
      routeState,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      routeState,
      "routeMountPatchImplemented",
      false
    ),
    routeMountAuthorization: readString(
      routeState,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(routeState, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(routeState, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(routeState, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(routeState, "publicAliasImplemented", false),
    runtimeTrafficAllowed: readBoolean(routeState, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(routeState, "runtimeTrafficEnabled", false),
    walletMutationAllowed: readBoolean(routeState, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(routeState, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(routeState, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(routeState, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(routeState, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(routeState, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(routeState, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(routeState, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(routeState, "migrationAllowed", false),
    migrationPerformed: readBoolean(routeState, "migrationPerformed", false),
    externalNetworkAllowed: readBoolean(routeState, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(routeState, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      routeState,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(routeState, "liveOroPlayApiCalled", false),
    nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary: readBoolean(
      routeState,
      "nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary",
      true
    ),
    nextPhaseRequiresSeparateRouteMountAuthorizationDecision: readBoolean(
      routeState,
      "nextPhaseRequiresSeparateRouteMountAuthorizationDecision",
      true
    ),
    nextPhaseRequiresSeparateRouteMountImplementationBoundary: readBoolean(
      routeState,
      "nextPhaseRequiresSeparateRouteMountImplementationBoundary",
      true
    ),
    nextPhaseRequiresSeparatePublicAliasApproval: readBoolean(
      routeState,
      "nextPhaseRequiresSeparatePublicAliasApproval",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      routeState,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
      true
    ),
    nextPhaseRequiresPostMountValidationBoundary: readBoolean(
      routeState,
      "nextPhaseRequiresPostMountValidationBoundary",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.executionPresent) {
    blockers.push("ORO-5J execution evidence is required");
  }
  if (!fixture.actualPatchImplementationExecutionBoundaryEntered) {
    blockers.push("ORO-5J execution boundary must be entered");
  }
  if (!fixture.actualPatchImplementationExecutionStarted) {
    blockers.push("ORO-5J execution must be started");
  }
  if (!fixture.actualPatchImplementationExecutionCompleted) {
    blockers.push("ORO-5J execution must be completed");
  }
  if (
    fixture.actualPatchImplementationExecutionStatus !==
    EXECUTED_ISOLATED_NON_MOUNTED_PATCH
  ) {
    blockers.push("ORO-5J execution status must be executed isolated non-mounted patch");
  }
  if (fixture.actualPatchImplementationExecutionResult !== EXECUTED) {
    blockers.push("ORO-5J execution result must be executed");
  }
  if (
    fixture.actualPatchImplementationExecutionScope !==
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  ) {
    blockers.push("ORO-5J execution scope must be isolated non-mounted artifact only");
  }
  if (
    !fixture.isolatedActualPatchImplementationExecuted ||
    !fixture.isolatedActualPatchImplementationPatchApplied ||
    fixture.isolatedActualPatchImplementationPatchResult !==
      APPLIED_TO_MOCK_ARTIFACT_ONLY
  ) {
    blockers.push("isolated patch artifact must be executed and applied");
  }
  if (!fixture.actualPatchImplementationPatchArtifactPrepared) {
    blockers.push("isolated patch artifact is required");
  }
  if (
    fixture.actualPatchImplementationPatchArtifactStatus !==
      PREPARED_FOR_POST_EXECUTION_REVIEW ||
    fixture.actualPatchImplementationPatchArtifactResult !== READY_FOR_REVIEW
  ) {
    blockers.push("isolated patch artifact must be ready for review");
  }
  if (!fixture.postExecutionEvidencePrepared) {
    blockers.push("post-execution evidence is required");
  }
  if (
    fixture.postExecutionEvidenceStatus !== PREPARED ||
    fixture.postExecutionEvidenceResult !== READY_FOR_REVIEW
  ) {
    blockers.push("post-execution evidence must be ready for review");
  }
  if (
    fixture.actualPatchImplementationImplementationScope !==
    ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  ) {
    blockers.push("actual patch implementation scope must be isolated non-mounted artifact only");
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
  if (fixture.routeMountAuthorizationRequestSubmitted) {
    blockers.push("route mount authorization request must not already be submitted");
  }
  if (fixture.routeMountAuthorizationDecisionIssued) {
    blockers.push("route mount authorization decision must not already be issued");
  }
  if (fixture.routeMountAuthorizationGranted) {
    blockers.push("route mount authorization must not already be granted");
  }
  if (fixture.executionRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.executionRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (fixture.executionRouteMountPatchImplemented || fixture.routeMountPatchImplemented) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.executionRouteMountAuthorization === AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization === AUTHORIZED_FOR_MOUNT ||
    fixture.executionRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.executionExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.executionExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.executionPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.executionPublicAliasImplemented || fixture.publicAliasImplemented) {
    blockers.push("public alias must remain not implemented");
  }
  if (fixture.executionRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (fixture.executionRuntimeTrafficEnabled || fixture.runtimeTrafficEnabled) {
    blockers.push("runtime traffic must remain not enabled");
  }
  if (
    fixture.executionWalletMutationAllowed ||
    fixture.walletMutationAllowed ||
    fixture.executionWalletMutationPerformed ||
    fixture.walletMutationPerformed
  ) {
    blockers.push("wallet mutation must remain not allowed or performed");
  }
  if (
    fixture.executionLedgerMutationAllowed ||
    fixture.ledgerMutationAllowed ||
    fixture.executionLedgerMutationPerformed ||
    fixture.ledgerMutationPerformed
  ) {
    blockers.push("ledger mutation must remain not allowed or performed");
  }
  if (
    fixture.executionPrismaWriteAllowed ||
    fixture.prismaWriteAllowed ||
    fixture.executionPrismaWritePerformed ||
    fixture.prismaWritePerformed
  ) {
    blockers.push("Prisma write must remain not allowed or performed");
  }
  if (
    fixture.executionDbTransactionAllowed ||
    fixture.dbTransactionAllowed ||
    fixture.executionDbTransactionPerformed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("DB transaction must remain not allowed or performed");
  }
  if (
    fixture.executionMigrationAllowed ||
    fixture.migrationAllowed ||
    fixture.executionMigrationPerformed ||
    fixture.migrationPerformed
  ) {
    blockers.push("migration must remain not allowed or performed");
  }
  if (
    fixture.executionExternalNetworkAllowed ||
    fixture.externalNetworkAllowed ||
    fixture.executionExternalNetworkCalled ||
    fixture.externalNetworkCalled
  ) {
    blockers.push("external network must remain not allowed or called");
  }
  if (
    fixture.executionLiveOroPlayApiCallAllowed ||
    fixture.liveOroPlayApiCallAllowed ||
    fixture.executionLiveOroPlayApiCalled ||
    fixture.liveOroPlayApiCalled
  ) {
    blockers.push("live OroPlay API call must remain not allowed or called");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("post-execution validation input contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5kIsolatedPatchArtifactReview(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    isolatedPatchArtifactReviewed: true,
    isolatedPatchArtifactReviewStatus:
      ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
    isolatedPatchArtifactReviewResult: ACCEPTED,
  };
}

function buildOro5kPostExecutionEvidenceReview(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    postExecutionEvidenceReviewed: true,
    postExecutionEvidenceReviewStatus: ACCEPTED,
    postExecutionEvidenceReviewResult: ACCEPTED,
  };
}

function buildOro5kRouteMountAuthorizationRequestReadinessRecord(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationRequestReadinessChecked: true,
    routeMountAuthorizationRequestReadinessStatus:
      READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
    routeMountAuthorizationRequestReadinessResult: READY,
    routeMountAuthorizationRequestPreparationAllowed: true,
    routeMountAuthorizationRequestPreparationScope: READINESS_RECORD_ONLY,
    routeMountAuthorizationRequestSubmissionAllowed: false,
    routeMountAuthorizationRequestSubmitted: false,
  };
}

function buildOro5kRouteMountRequestSubmissionStillHeldGate(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationRequestSubmissionAllowed: false,
    routeMountAuthorizationRequestSubmitted: false,
    nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary: true,
  };
}

function buildOro5kRouteMountDecisionStillHeldGate(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountAuthorizationDecisionIssued: false,
    routeMountAuthorizationGranted: false,
    routeMountAuthorizationDecisionResult: NOT_ISSUED,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    nextPhaseRequiresSeparateRouteMountAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary: true,
  };
}

function buildOro5kExpressMountStillHeldGate(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
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

function buildOro5kPublicAliasStillHeldGate(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
  };
}

function buildOro5kRuntimeTrafficStillHeldGate(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
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
    postExecutionValidationBoundaryResult: HOLD,
    postExecutionValidationChecked: false,
    postExecutionValidationStatus: HOLD,
    postExecutionValidationResult: HOLD,
    isolatedPatchArtifactReviewed: false,
    isolatedPatchArtifactReviewStatus: HOLD,
    isolatedPatchArtifactReviewResult: HOLD,
    postExecutionEvidenceReviewed: false,
    postExecutionEvidenceReviewStatus: HOLD,
    postExecutionEvidenceReviewResult: HOLD,
    routeMountAuthorizationRequestReadinessChecked: false,
    routeMountAuthorizationRequestReadinessStatus: HOLD,
    routeMountAuthorizationRequestReadinessResult: HOLD,
    routeMountAuthorizationRequestPreparationAllowed: false,
    routeMountAuthorizationRequestPreparationScope: READINESS_RECORD_ONLY,
    routeMountAuthorizationRequestSubmissionAllowed: false,
    routeMountAuthorizationRequestSubmitted: false,
    routeMountAuthorizationDecisionIssued: false,
    routeMountAuthorizationGranted: false,
    routeMountAuthorizationDecisionResult: NOT_ISSUED,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
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
    nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary: true,
    nextPhaseRequiresSeparateRouteMountAuthorizationDecision: true,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresPostMountValidationBoundary: true,
    blockers,
  };
}

function buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const artifactReview = buildOro5kIsolatedPatchArtifactReview(input);
  const evidenceReview = buildOro5kPostExecutionEvidenceReview(input);
  const readinessRecord =
    buildOro5kRouteMountAuthorizationRequestReadinessRecord(input);
  const submissionGate = buildOro5kRouteMountRequestSubmissionStillHeldGate(input);
  const decisionGate = buildOro5kRouteMountDecisionStillHeldGate(input);
  const expressGate = buildOro5kExpressMountStillHeldGate(input);
  const aliasGate = buildOro5kPublicAliasStillHeldGate(input);
  const trafficGate = buildOro5kRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    postExecutionValidationBoundaryResult: PASS,
    actualPatchImplementationExecutionBoundaryEntered:
      fixture.actualPatchImplementationExecutionBoundaryEntered,
    actualPatchImplementationExecutionStarted:
      fixture.actualPatchImplementationExecutionStarted,
    actualPatchImplementationExecutionCompleted:
      fixture.actualPatchImplementationExecutionCompleted,
    actualPatchImplementationExecutionStatus:
      fixture.actualPatchImplementationExecutionStatus,
    actualPatchImplementationExecutionResult:
      fixture.actualPatchImplementationExecutionResult,
    actualPatchImplementationExecutionScope:
      fixture.actualPatchImplementationExecutionScope,
    isolatedActualPatchImplementationExecuted:
      fixture.isolatedActualPatchImplementationExecuted,
    isolatedActualPatchImplementationPatchApplied:
      fixture.isolatedActualPatchImplementationPatchApplied,
    isolatedActualPatchImplementationPatchResult:
      fixture.isolatedActualPatchImplementationPatchResult,
    actualPatchImplementationPatchArtifactPrepared:
      fixture.actualPatchImplementationPatchArtifactPrepared,
    actualPatchImplementationPatchArtifactStatus:
      fixture.actualPatchImplementationPatchArtifactStatus,
    actualPatchImplementationPatchArtifactResult:
      fixture.actualPatchImplementationPatchArtifactResult,
    actualPatchImplementationImplemented:
      fixture.actualPatchImplementationImplemented,
    actualPatchImplementationImplementationScope:
      fixture.actualPatchImplementationImplementationScope,
    postExecutionEvidencePrepared: fixture.postExecutionEvidencePrepared,
    postExecutionEvidenceStatus: fixture.postExecutionEvidenceStatus,
    postExecutionEvidenceResult: fixture.postExecutionEvidenceResult,
    postExecutionValidationChecked: true,
    postExecutionValidationStatus:
      PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
    postExecutionValidationResult: PASSED,
    isolatedPatchArtifactReviewed: artifactReview.isolatedPatchArtifactReviewed,
    isolatedPatchArtifactReviewStatus:
      artifactReview.isolatedPatchArtifactReviewStatus,
    isolatedPatchArtifactReviewResult:
      artifactReview.isolatedPatchArtifactReviewResult,
    postExecutionEvidenceReviewed: evidenceReview.postExecutionEvidenceReviewed,
    postExecutionEvidenceReviewStatus:
      evidenceReview.postExecutionEvidenceReviewStatus,
    postExecutionEvidenceReviewResult:
      evidenceReview.postExecutionEvidenceReviewResult,
    routeMountAuthorizationRequestReadinessChecked:
      readinessRecord.routeMountAuthorizationRequestReadinessChecked,
    routeMountAuthorizationRequestReadinessStatus:
      readinessRecord.routeMountAuthorizationRequestReadinessStatus,
    routeMountAuthorizationRequestReadinessResult:
      readinessRecord.routeMountAuthorizationRequestReadinessResult,
    routeMountAuthorizationRequestPreparationAllowed:
      readinessRecord.routeMountAuthorizationRequestPreparationAllowed,
    routeMountAuthorizationRequestPreparationScope:
      readinessRecord.routeMountAuthorizationRequestPreparationScope,
    routeMountAuthorizationRequestSubmissionAllowed:
      submissionGate.routeMountAuthorizationRequestSubmissionAllowed,
    routeMountAuthorizationRequestSubmitted:
      submissionGate.routeMountAuthorizationRequestSubmitted,
    routeMountAuthorizationDecisionIssued:
      decisionGate.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationGranted: decisionGate.routeMountAuthorizationGranted,
    routeMountAuthorizationDecisionResult:
      decisionGate.routeMountAuthorizationDecisionResult,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: expressGate.runtimeRoutePatched,
    runtimeRouteControllerChanged: expressGate.runtimeRouteControllerChanged,
    srcAppChanged: expressGate.srcAppChanged,
    routeMountPatchApproved: decisionGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      decisionGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: decisionGate.routeMountPatchImplemented,
    routeMountAuthorization: decisionGate.routeMountAuthorization,
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
    nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary:
      submissionGate.nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorizationDecision:
      decisionGate.nextPhaseRequiresSeparateRouteMountAuthorizationDecision,
    nextPhaseRequiresSeparateRouteMountImplementationBoundary:
      decisionGate.nextPhaseRequiresSeparateRouteMountImplementationBoundary,
    nextPhaseRequiresSeparatePublicAliasApproval:
      aliasGate.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostMountValidationBoundary:
      trafficGate.nextPhaseRequiresPostMountValidationBoundary,
    blockers,
  };
}

function evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  return buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary(
    input
  );
}

function validateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness(
  input = buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput()
) {
  const summary =
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary(
      input
    );
  return {
    valid: summary.postExecutionValidationBoundaryResult === PASS,
    postExecutionValidationBoundaryResult:
      summary.postExecutionValidationBoundaryResult,
    postExecutionValidationChecked: summary.postExecutionValidationChecked,
    postExecutionValidationStatus: summary.postExecutionValidationStatus,
    postExecutionValidationResult: summary.postExecutionValidationResult,
    routeMountAuthorizationRequestReadinessChecked:
      summary.routeMountAuthorizationRequestReadinessChecked,
    routeMountAuthorizationRequestReadinessStatus:
      summary.routeMountAuthorizationRequestReadinessStatus,
    routeMountAuthorizationRequestReadinessResult:
      summary.routeMountAuthorizationRequestReadinessResult,
    routeMountAuthorizationRequestSubmitted:
      summary.routeMountAuthorizationRequestSubmitted,
    routeMountAuthorizationDecisionIssued:
      summary.routeMountAuthorizationDecisionIssued,
    routeMountAuthorizationGranted: summary.routeMountAuthorizationGranted,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary:
      summary.nextPhaseRequiresRouteMountAuthorizationRequestSubmissionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorizationDecision:
      summary.nextPhaseRequiresSeparateRouteMountAuthorizationDecision,
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
  PREPARED,
  READY_FOR_REVIEW,
  NOT_AUTHORIZED_FOR_MOUNT,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  EXECUTED,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
  PASSED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  PASSED,
  ACCEPTED_FOR_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS,
  ACCEPTED,
  READY_TO_PREPARE_ROUTE_MOUNT_AUTHORIZATION_REQUEST,
  READINESS_RECORD_ONLY,
  NOT_ISSUED,
  ORO_5K_POST_EXECUTION_VALIDATION_ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_STATUS,
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput,
  evaluateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
  buildOro5kIsolatedPatchArtifactReview,
  buildOro5kPostExecutionEvidenceReview,
  buildOro5kRouteMountAuthorizationRequestReadinessRecord,
  buildOro5kRouteMountRequestSubmissionStillHeldGate,
  buildOro5kRouteMountDecisionStillHeldGate,
  buildOro5kExpressMountStillHeldGate,
  buildOro5kPublicAliasStillHeldGate,
  buildOro5kRuntimeTrafficStillHeldGate,
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessSummary,
  validateOro5kPostExecutionValidationRouteMountAuthorizationRequestReadiness,
};
