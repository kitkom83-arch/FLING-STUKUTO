"use strict";

const {
  PASS,
  FAIL,
  HOLD,
  APPROVED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY,
  PREPARED,
  READY_FOR_REVIEW,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro5iActualPatchImplementationExecutionReadinessInput,
  evaluateOro5iActualPatchImplementationExecutionReadiness,
} = require("./oro5iActualPatchImplementationExecutionReadinessBoundary");

const PHASE = "ORO-5J";
const EXECUTED_ISOLATED_NON_MOUNTED_PATCH =
  "executed_isolated_non_mounted_patch";
const EXECUTED = "executed";
const ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY =
  "isolated_non_mounted_callback_patch_artifact_only";
const APPLIED_TO_MOCK_ARTIFACT_ONLY = "applied_to_mock_artifact_only";
const PREPARED_FOR_POST_EXECUTION_REVIEW =
  "prepared_for_post_execution_review";
const AUTHORIZED_FOR_MOUNT = "authorized_for_mount";

const ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  APPROVED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY,
  PREPARED,
  READY_FOR_REVIEW,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  EXECUTED,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
});

const SECRET_KEY_MARKERS = Object.freeze([
  ["to", "ken"].join(""),
  ["pass", "word"].join(""),
  ["client", "Secret"].join(""),
  ["DATABASE", "_URL"].join(""),
  "PIN",
  ["device", "Id"].join(""),
]);

const BASELINE_ORO5I_SUMMARY =
  evaluateOro5iActualPatchImplementationExecutionReadiness(
    buildOro5iActualPatchImplementationExecutionReadinessInput()
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

function buildOro5jActualPatchImplementationExecutionInput(overrides = {}) {
  const oro5iSummary = BASELINE_ORO5I_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationExecutionFixture",
    phase: PHASE,
    oro5iReadiness: {
      readinessPresent: true,
      actualPatchImplementationAuthorizationDecisionIssued:
        oro5iSummary.actualPatchImplementationAuthorizationDecisionIssued,
      actualPatchImplementationAuthorizationDecisionResult:
        oro5iSummary.actualPatchImplementationAuthorizationDecisionResult,
      actualPatchImplementationAuthorizationGranted:
        oro5iSummary.actualPatchImplementationAuthorizationGranted,
      actualPatchImplementationAuthorizationGrantScope:
        oro5iSummary.actualPatchImplementationAuthorizationGrantScope,
      actualPatchImplementationAuthorized:
        oro5iSummary.actualPatchImplementationAuthorized,
      actualPatchImplementationExecutionReadinessChecked:
        oro5iSummary.actualPatchImplementationExecutionReadinessChecked,
      actualPatchImplementationExecutionReadinessStatus:
        oro5iSummary.actualPatchImplementationExecutionReadinessStatus,
      actualPatchImplementationExecutionReadinessResult:
        oro5iSummary.actualPatchImplementationExecutionReadinessResult,
      isolatedMockExecutionPlanPrepared:
        oro5iSummary.isolatedMockExecutionPlanPrepared,
      isolatedMockExecutionPlanStatus: oro5iSummary.isolatedMockExecutionPlanStatus,
      isolatedMockExecutionPlanResult: oro5iSummary.isolatedMockExecutionPlanResult,
      executionBoundaryEntryAllowed: oro5iSummary.executionBoundaryEntryAllowed,
      executionBoundaryEntryScope: oro5iSummary.executionBoundaryEntryScope,
      actualPatchImplementationExecutionStarted:
        oro5iSummary.actualPatchImplementationExecutionStarted,
      actualPatchImplementationPatchApplied:
        oro5iSummary.actualPatchImplementationPatchApplied,
      actualPatchImplementationImplemented:
        oro5iSummary.actualPatchImplementationImplemented,
      runtimeActualPatchImplementationImplemented:
        oro5iSummary.runtimeActualPatchImplementationImplemented,
      runtimeRoutePatched: oro5iSummary.runtimeRoutePatched,
      runtimeRouteControllerChanged: oro5iSummary.runtimeRouteControllerChanged,
      srcAppChanged: oro5iSummary.srcAppChanged,
      routeMountPatchApproved: oro5iSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5iSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5iSummary.routeMountPatchImplemented,
      routeMountAuthorization: oro5iSummary.routeMountAuthorization,
      expressMountAllowed: oro5iSummary.expressMountAllowed,
      expressMountImplemented: oro5iSummary.expressMountImplemented,
      publicAliasAllowed: oro5iSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5iSummary.runtimeTrafficAllowed,
      walletMutationAllowed: oro5iSummary.walletMutationAllowed,
      ledgerMutationAllowed: oro5iSummary.ledgerMutationAllowed,
      prismaWriteAllowed: oro5iSummary.prismaWriteAllowed,
      dbTransactionAllowed: oro5iSummary.dbTransactionAllowed,
      migrationAllowed: oro5iSummary.migrationAllowed,
      externalNetworkAllowed: oro5iSummary.externalNetworkAllowed,
      liveOroPlayApiCallAllowed: oro5iSummary.liveOroPlayApiCallAllowed,
    },
    executionState: {
      actualPatchImplementationExecutionBoundaryEntered: true,
      actualPatchImplementationExecutionStarted: true,
      actualPatchImplementationExecutionCompleted: true,
      actualPatchImplementationExecutionStatus:
        EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
      actualPatchImplementationExecutionResult: EXECUTED,
      actualPatchImplementationExecutionScope:
        ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
      isolatedActualPatchImplementationExecuted: true,
      isolatedActualPatchImplementationPatchApplied: true,
      isolatedActualPatchImplementationPatchResult: APPLIED_TO_MOCK_ARTIFACT_ONLY,
      actualPatchImplementationPatchArtifactPrepared: true,
      actualPatchImplementationPatchArtifactStatus:
        PREPARED_FOR_POST_EXECUTION_REVIEW,
      actualPatchImplementationPatchArtifactResult: READY_FOR_REVIEW,
      actualPatchImplementationImplemented: true,
      actualPatchImplementationImplementationScope:
        ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
      postExecutionEvidencePrepared: true,
      postExecutionEvidenceStatus: PREPARED,
      postExecutionEvidenceResult: READY_FOR_REVIEW,
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
      nextPhaseRequiresPostExecutionValidationBoundary: true,
      nextPhaseRequiresSeparateRouteMountAuthorization: true,
      nextPhaseRequiresSeparatePublicAliasApproval: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresRouteMountImplementationBoundary: true,
    },
    trace: {
      mode: "static-mock-isolated-non-mounted-actual-patch-execution",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5jActualPatchImplementationExecutionInput();
  const merged = deepMerge(baseline, source);
  const readiness = isPlainObject(merged.oro5iReadiness)
    ? merged.oro5iReadiness
    : {};
  const execution = isPlainObject(merged.executionState)
    ? merged.executionState
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    readinessPresent: readBoolean(readiness, "readinessPresent", true),
    actualPatchImplementationAuthorizationDecisionIssued: readBoolean(
      readiness,
      "actualPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    actualPatchImplementationAuthorizationDecisionResult: readString(
      readiness,
      "actualPatchImplementationAuthorizationDecisionResult",
      APPROVED
    ),
    actualPatchImplementationAuthorizationGranted: readBoolean(
      readiness,
      "actualPatchImplementationAuthorizationGranted",
      true
    ),
    actualPatchImplementationAuthorizationGrantScope: readString(
      readiness,
      "actualPatchImplementationAuthorizationGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
    ),
    actualPatchImplementationAuthorized: readBoolean(
      readiness,
      "actualPatchImplementationAuthorized",
      true
    ),
    actualPatchImplementationExecutionReadinessChecked: readBoolean(
      readiness,
      "actualPatchImplementationExecutionReadinessChecked",
      true
    ),
    actualPatchImplementationExecutionReadinessStatus: readString(
      readiness,
      "actualPatchImplementationExecutionReadinessStatus",
      READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY
    ),
    actualPatchImplementationExecutionReadinessResult: readString(
      readiness,
      "actualPatchImplementationExecutionReadinessResult",
      READY
    ),
    isolatedMockExecutionPlanPrepared: readBoolean(
      readiness,
      "isolatedMockExecutionPlanPrepared",
      true
    ),
    isolatedMockExecutionPlanStatus: readString(
      readiness,
      "isolatedMockExecutionPlanStatus",
      PREPARED
    ),
    isolatedMockExecutionPlanResult: readString(
      readiness,
      "isolatedMockExecutionPlanResult",
      READY_FOR_REVIEW
    ),
    executionBoundaryEntryAllowed: readBoolean(
      readiness,
      "executionBoundaryEntryAllowed",
      true
    ),
    executionBoundaryEntryScope: readString(
      readiness,
      "executionBoundaryEntryScope",
      ISOLATED_MOCK_EXECUTION_PLAN_ONLY
    ),
    inputActualPatchImplementationExecutionStarted: readBoolean(
      readiness,
      "actualPatchImplementationExecutionStarted",
      false
    ),
    inputActualPatchImplementationPatchApplied: readBoolean(
      readiness,
      "actualPatchImplementationPatchApplied",
      false
    ),
    inputActualPatchImplementationImplemented: readBoolean(
      readiness,
      "actualPatchImplementationImplemented",
      false
    ),
    inputRuntimeActualPatchImplementationImplemented: readBoolean(
      readiness,
      "runtimeActualPatchImplementationImplemented",
      false
    ),
    inputRuntimeRoutePatched: readBoolean(readiness, "runtimeRoutePatched", false),
    inputRuntimeRouteControllerChanged: readBoolean(
      readiness,
      "runtimeRouteControllerChanged",
      false
    ),
    inputSrcAppChanged: readBoolean(readiness, "srcAppChanged", false),
    inputRouteMountPatchApproved: readBoolean(
      readiness,
      "routeMountPatchApproved",
      false
    ),
    inputRouteMountPatchImplementationAuthorized: readBoolean(
      readiness,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    inputRouteMountPatchImplemented: readBoolean(
      readiness,
      "routeMountPatchImplemented",
      false
    ),
    inputRouteMountAuthorization: readString(
      readiness,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    inputExpressMountAllowed: readBoolean(readiness, "expressMountAllowed", false),
    inputExpressMountImplemented: readBoolean(
      readiness,
      "expressMountImplemented",
      false
    ),
    inputPublicAliasAllowed: readBoolean(readiness, "publicAliasAllowed", false),
    inputRuntimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    inputWalletMutationAllowed: readBoolean(readiness, "walletMutationAllowed", false),
    inputLedgerMutationAllowed: readBoolean(readiness, "ledgerMutationAllowed", false),
    inputPrismaWriteAllowed: readBoolean(readiness, "prismaWriteAllowed", false),
    inputDbTransactionAllowed: readBoolean(readiness, "dbTransactionAllowed", false),
    inputMigrationAllowed: readBoolean(readiness, "migrationAllowed", false),
    inputExternalNetworkAllowed: readBoolean(readiness, "externalNetworkAllowed", false),
    inputLiveOroPlayApiCallAllowed: readBoolean(
      readiness,
      "liveOroPlayApiCallAllowed",
      false
    ),
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
    routeMountPatchApproved: readBoolean(execution, "routeMountPatchApproved", false),
    routeMountPatchImplementationAuthorized: readBoolean(
      execution,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    routeMountPatchImplemented: readBoolean(
      execution,
      "routeMountPatchImplemented",
      false
    ),
    routeMountAuthorization: readString(
      execution,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(execution, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(execution, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(execution, "publicAliasAllowed", false),
    publicAliasImplemented: readBoolean(execution, "publicAliasImplemented", false),
    runtimeTrafficAllowed: readBoolean(execution, "runtimeTrafficAllowed", false),
    runtimeTrafficEnabled: readBoolean(execution, "runtimeTrafficEnabled", false),
    walletMutationAllowed: readBoolean(execution, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(execution, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(execution, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(execution, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(execution, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(execution, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(execution, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(execution, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(execution, "migrationAllowed", false),
    migrationPerformed: readBoolean(execution, "migrationPerformed", false),
    externalNetworkAllowed: readBoolean(execution, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(execution, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      execution,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(execution, "liveOroPlayApiCalled", false),
    nextPhaseRequiresPostExecutionValidationBoundary: readBoolean(
      execution,
      "nextPhaseRequiresPostExecutionValidationBoundary",
      true
    ),
    nextPhaseRequiresSeparateRouteMountAuthorization: readBoolean(
      execution,
      "nextPhaseRequiresSeparateRouteMountAuthorization",
      true
    ),
    nextPhaseRequiresSeparatePublicAliasApproval: readBoolean(
      execution,
      "nextPhaseRequiresSeparatePublicAliasApproval",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      execution,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
      true
    ),
    nextPhaseRequiresRouteMountImplementationBoundary: readBoolean(
      execution,
      "nextPhaseRequiresRouteMountImplementationBoundary",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.readinessPresent) {
    blockers.push("ORO-5I execution readiness is required");
  }
  if (!fixture.actualPatchImplementationExecutionReadinessChecked) {
    blockers.push("ORO-5I execution readiness must be checked");
  }
  if (
    fixture.actualPatchImplementationExecutionReadinessStatus !==
      READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY ||
    fixture.actualPatchImplementationExecutionReadinessResult !== READY
  ) {
    blockers.push("ORO-5I readiness must be ready for isolated mock execution boundary");
  }
  if (
    !fixture.isolatedMockExecutionPlanPrepared ||
    fixture.isolatedMockExecutionPlanStatus !== PREPARED
  ) {
    blockers.push("isolated mock execution plan must be prepared");
  }
  if (!fixture.executionBoundaryEntryAllowed) {
    blockers.push("execution boundary entry must be allowed");
  }
  if (fixture.executionBoundaryEntryScope !== ISOLATED_MOCK_EXECUTION_PLAN_ONLY) {
    blockers.push("execution boundary entry scope must be isolated mock execution plan only");
  }
  if (!fixture.actualPatchImplementationAuthorizationDecisionIssued) {
    blockers.push("actual patch implementation authorization decision is required");
  }
  if (!fixture.actualPatchImplementationAuthorizationGranted) {
    blockers.push("actual patch implementation authorization must be granted");
  }
  if (
    fixture.actualPatchImplementationAuthorizationGrantScope !==
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
  ) {
    blockers.push("actual patch implementation authorization grant scope must be execution boundary only");
  }
  if (
    fixture.inputActualPatchImplementationExecutionStarted ||
    fixture.inputActualPatchImplementationPatchApplied ||
    fixture.inputActualPatchImplementationImplemented
  ) {
    blockers.push("actual patch implementation must not be previously executed");
  }
  if (fixture.inputRuntimeActualPatchImplementationImplemented) {
    blockers.push("runtime actual patch implementation must not already be implemented");
  }
  if (fixture.inputRuntimeRoutePatched || fixture.runtimeRoutePatched) {
    blockers.push("runtime route must not be patched");
  }
  if (fixture.inputSrcAppChanged || fixture.srcAppChanged) {
    blockers.push("src/app.js must not be changed");
  }
  if (
    fixture.inputRuntimeRouteControllerChanged ||
    fixture.runtimeRouteControllerChanged
  ) {
    blockers.push("runtime route or controller must not be changed");
  }
  if (fixture.inputRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.inputRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (fixture.inputRouteMountPatchImplemented || fixture.routeMountPatchImplemented) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.inputRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization === AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.inputExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.inputExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.inputPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.publicAliasImplemented) {
    blockers.push("public alias must remain not implemented");
  }
  if (fixture.inputRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (fixture.runtimeTrafficEnabled) {
    blockers.push("runtime traffic must remain not enabled");
  }
  if (
    fixture.inputWalletMutationAllowed ||
    fixture.walletMutationAllowed ||
    fixture.walletMutationPerformed
  ) {
    blockers.push("wallet mutation must remain not allowed or performed");
  }
  if (
    fixture.inputLedgerMutationAllowed ||
    fixture.ledgerMutationAllowed ||
    fixture.ledgerMutationPerformed
  ) {
    blockers.push("ledger mutation must remain not allowed or performed");
  }
  if (
    fixture.inputPrismaWriteAllowed ||
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed
  ) {
    blockers.push("Prisma write must remain not allowed or performed");
  }
  if (
    fixture.inputDbTransactionAllowed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("DB transaction must remain not allowed or performed");
  }
  if (
    fixture.inputMigrationAllowed ||
    fixture.migrationAllowed ||
    fixture.migrationPerformed
  ) {
    blockers.push("migration must remain not allowed or performed");
  }
  if (
    fixture.inputExternalNetworkAllowed ||
    fixture.externalNetworkAllowed ||
    fixture.externalNetworkCalled
  ) {
    blockers.push("external network must remain not allowed or called");
  }
  if (
    fixture.inputLiveOroPlayApiCallAllowed ||
    fixture.liveOroPlayApiCallAllowed ||
    fixture.liveOroPlayApiCalled
  ) {
    blockers.push("live OroPlay API call must remain not allowed or called");
  }
  if (
    fixture.actualPatchImplementationExecutionScope !==
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY ||
    fixture.actualPatchImplementationImplementationScope !==
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY
  ) {
    blockers.push("actual patch implementation scope must be isolated non-mounted artifact only");
  }
  if (!fixture.nextPhaseRequiresPostExecutionValidationBoundary) {
    blockers.push("post-execution validation boundary must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparatePublicAliasApproval) {
    blockers.push("separate public alias approval must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (!fixture.nextPhaseRequiresRouteMountImplementationBoundary) {
    blockers.push("route mount implementation boundary must remain required");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("actual patch implementation execution output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5jIsolatedNonMountedPatchArtifact(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    isolatedActualPatchImplementationExecuted: true,
    isolatedActualPatchImplementationPatchApplied: true,
    isolatedActualPatchImplementationPatchResult: APPLIED_TO_MOCK_ARTIFACT_ONLY,
    actualPatchImplementationPatchArtifactPrepared: true,
    actualPatchImplementationPatchArtifactStatus:
      PREPARED_FOR_POST_EXECUTION_REVIEW,
    actualPatchImplementationPatchArtifactResult: READY_FOR_REVIEW,
    actualPatchImplementationImplemented: true,
    actualPatchImplementationImplementationScope:
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
    postExecutionEvidencePrepared: true,
    postExecutionEvidenceStatus: PREPARED,
    postExecutionEvidenceResult: READY_FOR_REVIEW,
  };
}

function buildOro5jActualRuntimeImplementationStillHeldGate(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
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
  };
}

function buildOro5jRouteMountStillHeldGate(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    routeMountPatchApproved: false,
    routeMountPatchImplementationAuthorized: false,
    routeMountPatchImplemented: false,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    expressMountImplemented: false,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresRouteMountImplementationBoundary: true,
  };
}

function buildOro5jPublicAliasStillHeldGate(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    publicAliasImplemented: false,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
  };
}

function buildOro5jRuntimeTrafficStillHeldGate(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationExecutionBoundaryResult: HOLD,
    actualPatchImplementationExecutionBoundaryEntered: false,
    actualPatchImplementationExecutionStarted: false,
    actualPatchImplementationExecutionCompleted: false,
    actualPatchImplementationExecutionStatus: HOLD,
    actualPatchImplementationExecutionResult: HOLD,
    actualPatchImplementationExecutionScope: HOLD,
    isolatedActualPatchImplementationExecuted: false,
    isolatedActualPatchImplementationPatchApplied: false,
    isolatedActualPatchImplementationPatchResult: HOLD,
    actualPatchImplementationPatchArtifactPrepared: false,
    actualPatchImplementationPatchArtifactStatus: HOLD,
    actualPatchImplementationPatchArtifactResult: HOLD,
    actualPatchImplementationImplemented: false,
    actualPatchImplementationImplementationScope: HOLD,
    postExecutionEvidencePrepared: false,
    postExecutionEvidenceStatus: HOLD,
    postExecutionEvidenceResult: HOLD,
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
    nextPhaseRequiresPostExecutionValidationBoundary: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparatePublicAliasApproval: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresRouteMountImplementationBoundary: true,
    blockers,
  };
}

function buildOro5jActualPatchImplementationExecutionSummary(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const artifact = buildOro5jIsolatedNonMountedPatchArtifact(input);
  const runtimeGate = buildOro5jActualRuntimeImplementationStillHeldGate(input);
  const mountGate = buildOro5jRouteMountStillHeldGate(input);
  const aliasGate = buildOro5jPublicAliasStillHeldGate(input);
  const trafficGate = buildOro5jRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationExecutionBoundaryResult: PASS,
    actualPatchImplementationAuthorizationDecisionIssued: true,
    actualPatchImplementationAuthorizationDecisionResult: APPROVED,
    actualPatchImplementationAuthorizationGranted: true,
    actualPatchImplementationAuthorizationGrantScope:
      ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
    actualPatchImplementationAuthorized: true,
    actualPatchImplementationExecutionReadinessChecked: true,
    actualPatchImplementationExecutionReadinessStatus:
      READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
    actualPatchImplementationExecutionReadinessResult: READY,
    isolatedMockExecutionPlanPrepared: true,
    isolatedMockExecutionPlanStatus: PREPARED,
    isolatedMockExecutionPlanResult: READY_FOR_REVIEW,
    executionBoundaryEntryAllowed: true,
    executionBoundaryEntryScope: ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
    actualPatchImplementationExecutionBoundaryEntered: true,
    actualPatchImplementationExecutionStarted: true,
    actualPatchImplementationExecutionCompleted: true,
    actualPatchImplementationExecutionStatus:
      EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
    actualPatchImplementationExecutionResult: EXECUTED,
    actualPatchImplementationExecutionScope:
      ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
    isolatedActualPatchImplementationExecuted:
      artifact.isolatedActualPatchImplementationExecuted,
    isolatedActualPatchImplementationPatchApplied:
      artifact.isolatedActualPatchImplementationPatchApplied,
    isolatedActualPatchImplementationPatchResult:
      artifact.isolatedActualPatchImplementationPatchResult,
    actualPatchImplementationPatchArtifactPrepared:
      artifact.actualPatchImplementationPatchArtifactPrepared,
    actualPatchImplementationPatchArtifactStatus:
      artifact.actualPatchImplementationPatchArtifactStatus,
    actualPatchImplementationPatchArtifactResult:
      artifact.actualPatchImplementationPatchArtifactResult,
    actualPatchImplementationImplemented:
      artifact.actualPatchImplementationImplemented,
    actualPatchImplementationImplementationScope:
      artifact.actualPatchImplementationImplementationScope,
    postExecutionEvidencePrepared: artifact.postExecutionEvidencePrepared,
    postExecutionEvidenceStatus: artifact.postExecutionEvidenceStatus,
    postExecutionEvidenceResult: artifact.postExecutionEvidenceResult,
    runtimeActualPatchImplementationImplemented:
      runtimeGate.runtimeActualPatchImplementationImplemented,
    runtimeRoutePatched: runtimeGate.runtimeRoutePatched,
    runtimeRouteControllerChanged: runtimeGate.runtimeRouteControllerChanged,
    srcAppChanged: runtimeGate.srcAppChanged,
    routeMountPatchApproved: mountGate.routeMountPatchApproved,
    routeMountPatchImplementationAuthorized:
      mountGate.routeMountPatchImplementationAuthorized,
    routeMountPatchImplemented: mountGate.routeMountPatchImplemented,
    routeMountAuthorization: mountGate.routeMountAuthorization,
    expressMountAllowed: mountGate.expressMountAllowed,
    expressMountImplemented: mountGate.expressMountImplemented,
    publicAliasAllowed: aliasGate.publicAliasAllowed,
    publicAliasImplemented: aliasGate.publicAliasImplemented,
    runtimeTrafficAllowed: trafficGate.runtimeTrafficAllowed,
    runtimeTrafficEnabled: trafficGate.runtimeTrafficEnabled,
    walletMutationAllowed: runtimeGate.walletMutationAllowed,
    walletMutationPerformed: runtimeGate.walletMutationPerformed,
    ledgerMutationAllowed: runtimeGate.ledgerMutationAllowed,
    ledgerMutationPerformed: runtimeGate.ledgerMutationPerformed,
    prismaWriteAllowed: runtimeGate.prismaWriteAllowed,
    prismaWritePerformed: runtimeGate.prismaWritePerformed,
    dbTransactionAllowed: runtimeGate.dbTransactionAllowed,
    dbTransactionPerformed: runtimeGate.dbTransactionPerformed,
    migrationAllowed: runtimeGate.migrationAllowed,
    migrationPerformed: runtimeGate.migrationPerformed,
    externalNetworkAllowed: trafficGate.externalNetworkAllowed,
    externalNetworkCalled: trafficGate.externalNetworkCalled,
    liveOroPlayApiCallAllowed: trafficGate.liveOroPlayApiCallAllowed,
    liveOroPlayApiCalled: trafficGate.liveOroPlayApiCalled,
    nextPhaseRequiresPostExecutionValidationBoundary:
      fixture.nextPhaseRequiresPostExecutionValidationBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      mountGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparatePublicAliasApproval:
      aliasGate.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresRouteMountImplementationBoundary:
      mountGate.nextPhaseRequiresRouteMountImplementationBoundary,
    blockers,
  };
}

function evaluateOro5jActualPatchImplementationExecution(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  return buildOro5jActualPatchImplementationExecutionSummary(input);
}

function validateOro5jActualPatchImplementationExecution(
  input = buildOro5jActualPatchImplementationExecutionInput()
) {
  const summary = buildOro5jActualPatchImplementationExecutionSummary(input);
  return {
    valid: summary.actualPatchImplementationExecutionBoundaryResult === PASS,
    actualPatchImplementationExecutionBoundaryResult:
      summary.actualPatchImplementationExecutionBoundaryResult,
    actualPatchImplementationExecutionStarted:
      summary.actualPatchImplementationExecutionStarted,
    actualPatchImplementationExecutionCompleted:
      summary.actualPatchImplementationExecutionCompleted,
    actualPatchImplementationExecutionStatus:
      summary.actualPatchImplementationExecutionStatus,
    actualPatchImplementationExecutionScope:
      summary.actualPatchImplementationExecutionScope,
    actualPatchImplementationImplemented:
      summary.actualPatchImplementationImplemented,
    actualPatchImplementationImplementationScope:
      summary.actualPatchImplementationImplementationScope,
    runtimeActualPatchImplementationImplemented:
      summary.runtimeActualPatchImplementationImplemented,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresPostExecutionValidationBoundary:
      summary.nextPhaseRequiresPostExecutionValidationBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      summary.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparatePublicAliasApproval:
      summary.nextPhaseRequiresSeparatePublicAliasApproval,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      summary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresRouteMountImplementationBoundary:
      summary.nextPhaseRequiresRouteMountImplementationBoundary,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  APPROVED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY,
  PREPARED,
  READY_FOR_REVIEW,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  EXECUTED_ISOLATED_NON_MOUNTED_PATCH,
  EXECUTED,
  ISOLATED_NON_MOUNTED_CALLBACK_PATCH_ARTIFACT_ONLY,
  APPLIED_TO_MOCK_ARTIFACT_ONLY,
  PREPARED_FOR_POST_EXECUTION_REVIEW,
  ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_STATUS,
  buildOro5jActualPatchImplementationExecutionInput,
  evaluateOro5jActualPatchImplementationExecution,
  buildOro5jIsolatedNonMountedPatchArtifact,
  buildOro5jActualRuntimeImplementationStillHeldGate,
  buildOro5jRouteMountStillHeldGate,
  buildOro5jPublicAliasStillHeldGate,
  buildOro5jRuntimeTrafficStillHeldGate,
  buildOro5jActualPatchImplementationExecutionSummary,
  validateOro5jActualPatchImplementationExecution,
};
