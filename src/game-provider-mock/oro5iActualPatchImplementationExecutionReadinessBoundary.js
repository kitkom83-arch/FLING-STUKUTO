"use strict";

const {
  PASS,
  FAIL,
  HOLD,
  APPROVED,
  DECISION_ISSUED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro5hActualPatchImplementationAuthorizationDecisionInput,
  evaluateOro5hActualPatchImplementationAuthorizationDecision,
} = require("./oro5hActualPatchImplementationAuthorizationDecisionBoundary");

const PHASE = "ORO-5I";
const READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY =
  "ready_for_isolated_mock_execution_boundary";
const READY = "ready";
const PREPARED = "prepared";
const READY_FOR_REVIEW = "ready_for_review";
const ISOLATED_MOCK_EXECUTION_PLAN_ONLY = "isolated_mock_execution_plan_only";
const AUTHORIZED_FOR_MOUNT = "authorized_for_mount";

const ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    HOLD,
    APPROVED,
    DECISION_ISSUED,
    ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
    READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
    READY,
    PREPARED,
    READY_FOR_REVIEW,
    ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
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

const BASELINE_ORO5H_SUMMARY =
  evaluateOro5hActualPatchImplementationAuthorizationDecision(
    buildOro5hActualPatchImplementationAuthorizationDecisionInput()
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

function buildOro5iActualPatchImplementationExecutionReadinessInput(
  overrides = {}
) {
  const oro5hSummary = BASELINE_ORO5H_SUMMARY;
  const baseline = {
    id: "happyPathActualPatchImplementationExecutionReadinessFixture",
    phase: PHASE,
    oro5hDecision: {
      decisionPresent: true,
      actualPatchImplementationAuthorizationDecisionIssued:
        oro5hSummary.actualPatchImplementationAuthorizationDecisionIssued,
      actualPatchImplementationAuthorizationDecisionResult:
        oro5hSummary.actualPatchImplementationAuthorizationDecisionResult,
      actualPatchImplementationAuthorizationGranted:
        oro5hSummary.actualPatchImplementationAuthorizationGranted,
      actualPatchImplementationAuthorizationGrantScope:
        oro5hSummary.actualPatchImplementationAuthorizationGrantScope,
      actualPatchImplementationAuthorized:
        oro5hSummary.actualPatchImplementationAuthorized,
      actualPatchImplementationImplemented:
        oro5hSummary.actualPatchImplementationImplemented,
      actualPatchImplementationExecutionStarted:
        oro5hSummary.actualPatchImplementationExecutionStarted,
      actualPatchImplementationPatchApplied:
        oro5hSummary.actualPatchImplementationPatchApplied,
      routeMountPatchApproved: oro5hSummary.routeMountPatchApproved,
      routeMountPatchImplementationAuthorized:
        oro5hSummary.routeMountPatchImplementationAuthorized,
      routeMountPatchImplemented: oro5hSummary.routeMountPatchImplemented,
      routeMountAuthorization: oro5hSummary.routeMountAuthorization,
      expressMountAllowed: oro5hSummary.expressMountAllowed,
      expressMountImplemented: oro5hSummary.expressMountImplemented,
      publicAliasAllowed: oro5hSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro5hSummary.runtimeTrafficAllowed,
      walletMutationAllowed: oro5hSummary.walletMutationAllowed,
      ledgerMutationAllowed: oro5hSummary.ledgerMutationAllowed,
      prismaWriteAllowed: oro5hSummary.prismaWriteAllowed,
      dbTransactionAllowed: oro5hSummary.dbTransactionAllowed,
      migrationAllowed: oro5hSummary.migrationAllowed,
      externalNetworkAllowed: oro5hSummary.externalNetworkAllowed,
    },
    readinessState: {
      actualPatchImplementationExecutionReadinessChecked: true,
      actualPatchImplementationExecutionReadinessStatus:
        READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
      actualPatchImplementationExecutionReadinessResult: READY,
      isolatedMockExecutionPlanPrepared: true,
      isolatedMockExecutionPlanStatus: PREPARED,
      isolatedMockExecutionPlanResult: READY_FOR_REVIEW,
      executionBoundaryEntryAllowed: true,
      executionBoundaryEntryScope: ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
      actualPatchImplementationExecutionStarted: false,
      actualPatchImplementationPatchApplied: false,
      actualPatchImplementationImplemented: false,
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
      runtimeTrafficAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      dbTransactionAllowed: false,
      migrationAllowed: false,
      externalNetworkAllowed: false,
      liveOroPlayApiCallAllowed: false,
      nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
      nextPhaseRequiresSeparateRouteMountAuthorization: true,
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      nextPhaseRequiresPostExecutionValidation: true,
    },
    trace: {
      mode: "static-mock-actual-patch-implementation-execution-readiness",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro5iActualPatchImplementationExecutionReadinessInput();
  const merged = deepMerge(baseline, source);
  const decision = isPlainObject(merged.oro5hDecision) ? merged.oro5hDecision : {};
  const readiness = isPlainObject(merged.readinessState) ? merged.readinessState : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro5hDecisionPresent: readBoolean(decision, "decisionPresent", true),
    actualPatchImplementationAuthorizationDecisionIssued: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationDecisionIssued",
      true
    ),
    actualPatchImplementationAuthorizationDecisionResult: readString(
      decision,
      "actualPatchImplementationAuthorizationDecisionResult",
      APPROVED
    ),
    actualPatchImplementationAuthorizationGranted: readBoolean(
      decision,
      "actualPatchImplementationAuthorizationGranted",
      true
    ),
    actualPatchImplementationAuthorizationGrantScope: readString(
      decision,
      "actualPatchImplementationAuthorizationGrantScope",
      ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY
    ),
    actualPatchImplementationAuthorized: readBoolean(
      decision,
      "actualPatchImplementationAuthorized",
      true
    ),
    oro5hActualPatchImplementationImplemented: readBoolean(
      decision,
      "actualPatchImplementationImplemented",
      false
    ),
    oro5hActualPatchImplementationExecutionStarted: readBoolean(
      decision,
      "actualPatchImplementationExecutionStarted",
      false
    ),
    oro5hActualPatchImplementationPatchApplied: readBoolean(
      decision,
      "actualPatchImplementationPatchApplied",
      false
    ),
    oro5hRouteMountPatchApproved: readBoolean(
      decision,
      "routeMountPatchApproved",
      false
    ),
    oro5hRouteMountPatchImplementationAuthorized: readBoolean(
      decision,
      "routeMountPatchImplementationAuthorized",
      false
    ),
    oro5hRouteMountPatchImplemented: readBoolean(
      decision,
      "routeMountPatchImplemented",
      false
    ),
    oro5hRouteMountAuthorization: readString(
      decision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro5hExpressMountAllowed: readBoolean(decision, "expressMountAllowed", false),
    oro5hExpressMountImplemented: readBoolean(
      decision,
      "expressMountImplemented",
      false
    ),
    oro5hPublicAliasAllowed: readBoolean(decision, "publicAliasAllowed", false),
    oro5hRuntimeTrafficAllowed: readBoolean(decision, "runtimeTrafficAllowed", false),
    oro5hWalletMutationAllowed: readBoolean(decision, "walletMutationAllowed", false),
    oro5hLedgerMutationAllowed: readBoolean(decision, "ledgerMutationAllowed", false),
    oro5hPrismaWriteAllowed: readBoolean(decision, "prismaWriteAllowed", false),
    oro5hDbTransactionAllowed: readBoolean(decision, "dbTransactionAllowed", false),
    oro5hMigrationAllowed: readBoolean(decision, "migrationAllowed", false),
    oro5hExternalNetworkAllowed: readBoolean(decision, "externalNetworkAllowed", false),
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
    actualPatchImplementationExecutionStarted: readBoolean(
      readiness,
      "actualPatchImplementationExecutionStarted",
      false
    ),
    actualPatchImplementationPatchApplied: readBoolean(
      readiness,
      "actualPatchImplementationPatchApplied",
      false
    ),
    actualPatchImplementationImplemented: readBoolean(
      readiness,
      "actualPatchImplementationImplemented",
      false
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
    runtimeTrafficAllowed: readBoolean(readiness, "runtimeTrafficAllowed", false),
    walletMutationAllowed: readBoolean(readiness, "walletMutationAllowed", false),
    ledgerMutationAllowed: readBoolean(readiness, "ledgerMutationAllowed", false),
    prismaWriteAllowed: readBoolean(readiness, "prismaWriteAllowed", false),
    dbTransactionAllowed: readBoolean(readiness, "dbTransactionAllowed", false),
    migrationAllowed: readBoolean(readiness, "migrationAllowed", false),
    externalNetworkAllowed: readBoolean(readiness, "externalNetworkAllowed", false),
    liveOroPlayApiCallAllowed: readBoolean(
      readiness,
      "liveOroPlayApiCallAllowed",
      false
    ),
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: readBoolean(
      readiness,
      "nextPhaseRequiresActualPatchImplementationExecutionBoundary",
      true
    ),
    nextPhaseRequiresSeparateRouteMountAuthorization: readBoolean(
      readiness,
      "nextPhaseRequiresSeparateRouteMountAuthorization",
      true
    ),
    nextPhaseRequiresSeparateRuntimeTrafficApproval: readBoolean(
      readiness,
      "nextPhaseRequiresSeparateRuntimeTrafficApproval",
      true
    ),
    nextPhaseRequiresPostExecutionValidation: readBoolean(
      readiness,
      "nextPhaseRequiresPostExecutionValidation",
      true
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro5hDecisionPresent) {
    blockers.push("ORO-5H authorization decision is required");
  }
  if (!fixture.actualPatchImplementationAuthorizationDecisionIssued) {
    blockers.push("ORO-5H authorization decision must be issued");
  }
  if (fixture.actualPatchImplementationAuthorizationDecisionResult !== APPROVED) {
    blockers.push("ORO-5H authorization decision must be approved");
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
  if (!fixture.actualPatchImplementationAuthorized) {
    blockers.push("actual patch implementation must be authorized for execution boundary only");
  }
  if (
    fixture.oro5hActualPatchImplementationExecutionStarted ||
    fixture.actualPatchImplementationExecutionStarted
  ) {
    blockers.push("actual patch implementation execution must not be started");
  }
  if (
    fixture.oro5hActualPatchImplementationPatchApplied ||
    fixture.actualPatchImplementationPatchApplied
  ) {
    blockers.push("actual patch implementation patch must not be applied");
  }
  if (
    fixture.oro5hActualPatchImplementationImplemented ||
    fixture.actualPatchImplementationImplemented ||
    fixture.runtimeActualPatchImplementationImplemented
  ) {
    blockers.push("actual patch implementation must not be implemented");
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
  if (fixture.oro5hRouteMountPatchApproved || fixture.routeMountPatchApproved) {
    blockers.push("route mount patch must not be approved");
  }
  if (
    fixture.oro5hRouteMountPatchImplementationAuthorized ||
    fixture.routeMountPatchImplementationAuthorized
  ) {
    blockers.push("route mount patch implementation must not be authorized");
  }
  if (
    fixture.oro5hRouteMountPatchImplemented ||
    fixture.routeMountPatchImplemented
  ) {
    blockers.push("route mount patch must not be implemented");
  }
  if (
    fixture.oro5hRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization === AUTHORIZED_FOR_MOUNT ||
    fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT
  ) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.oro5hExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro5hExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro5hPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro5hRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (fixture.oro5hWalletMutationAllowed || fixture.walletMutationAllowed) {
    blockers.push("wallet mutation must remain not allowed");
  }
  if (fixture.oro5hLedgerMutationAllowed || fixture.ledgerMutationAllowed) {
    blockers.push("ledger mutation must remain not allowed");
  }
  if (fixture.oro5hPrismaWriteAllowed || fixture.prismaWriteAllowed) {
    blockers.push("Prisma write must remain not allowed");
  }
  if (fixture.oro5hDbTransactionAllowed || fixture.dbTransactionAllowed) {
    blockers.push("DB transaction must remain not allowed");
  }
  if (fixture.oro5hMigrationAllowed || fixture.migrationAllowed) {
    blockers.push("migration must remain not allowed");
  }
  if (fixture.oro5hExternalNetworkAllowed || fixture.externalNetworkAllowed) {
    blockers.push("external network must remain not allowed");
  }
  if (fixture.liveOroPlayApiCallAllowed) {
    blockers.push("live OroPlay API call must remain not allowed");
  }
  if (fixture.executionBoundaryEntryScope !== ISOLATED_MOCK_EXECUTION_PLAN_ONLY) {
    blockers.push("execution boundary entry scope must be isolated mock execution plan only");
  }
  if (!fixture.nextPhaseRequiresActualPatchImplementationExecutionBoundary) {
    blockers.push("actual patch implementation execution boundary must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRouteMountAuthorization) {
    blockers.push("separate route mount authorization must remain required");
  }
  if (!fixture.nextPhaseRequiresSeparateRuntimeTrafficApproval) {
    blockers.push("separate runtime traffic approval must remain required");
  }
  if (!fixture.nextPhaseRequiresPostExecutionValidation) {
    blockers.push("post execution validation must remain required");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("execution readiness output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro5iIsolatedMockExecutionPlan(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    isolatedMockExecutionPlanPrepared: true,
    isolatedMockExecutionPlanStatus: PREPARED,
    isolatedMockExecutionPlanResult: READY_FOR_REVIEW,
    executionBoundaryEntryAllowed: true,
    executionBoundaryEntryScope: ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
  };
}

function buildOro5iActualRuntimeImplementationStillHeldGate(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    actualPatchImplementationExecutionStarted: false,
    actualPatchImplementationPatchApplied: false,
    actualPatchImplementationImplemented: false,
    runtimeActualPatchImplementationImplemented: false,
    runtimeRoutePatched: false,
    runtimeRouteControllerChanged: false,
    srcAppChanged: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    liveOroPlayApiCallAllowed: false,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
    nextPhaseRequiresPostExecutionValidation: true,
  };
}

function buildOro5iRouteMountStillHeldGate(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
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
    publicAliasAllowed: false,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
  };
}

function buildOro5iRuntimeTrafficStillHeldGate(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  normalizeInput(input);
  return {
    phase: PHASE,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    externalNetworkAllowed: false,
    liveOroPlayApiCallAllowed: false,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
  };
}

function buildHoldOutput(blockers, fixture) {
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationExecutionReadinessBoundaryResult: HOLD,
    actualPatchImplementationAuthorizationDecisionIssued: false,
    actualPatchImplementationAuthorizationDecisionResult: HOLD,
    actualPatchImplementationAuthorizationGranted: false,
    actualPatchImplementationAuthorizationGrantScope: HOLD,
    actualPatchImplementationAuthorized: false,
    actualPatchImplementationExecutionReadinessChecked: false,
    actualPatchImplementationExecutionReadinessStatus: HOLD,
    actualPatchImplementationExecutionReadinessResult: HOLD,
    isolatedMockExecutionPlanPrepared: false,
    isolatedMockExecutionPlanStatus: HOLD,
    isolatedMockExecutionPlanResult: HOLD,
    executionBoundaryEntryAllowed: false,
    executionBoundaryEntryScope: HOLD,
    actualPatchImplementationExecutionStarted: false,
    actualPatchImplementationPatchApplied: false,
    actualPatchImplementationImplemented: false,
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
    runtimeTrafficAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    dbTransactionAllowed: false,
    migrationAllowed: false,
    externalNetworkAllowed: false,
    liveOroPlayApiCallAllowed: false,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary: true,
    nextPhaseRequiresSeparateRouteMountAuthorization: true,
    nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    nextPhaseRequiresPostExecutionValidation: true,
    blockers,
  };
}

function buildOro5iActualPatchImplementationExecutionReadinessSummary(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildHoldOutput(blockers, fixture);

  const plan = buildOro5iIsolatedMockExecutionPlan(input);
  const runtimeGate = buildOro5iActualRuntimeImplementationStillHeldGate(input);
  const mountGate = buildOro5iRouteMountStillHeldGate(input);
  const trafficGate = buildOro5iRuntimeTrafficStillHeldGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    actualPatchImplementationExecutionReadinessBoundaryResult: PASS,
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
    isolatedMockExecutionPlanPrepared: plan.isolatedMockExecutionPlanPrepared,
    isolatedMockExecutionPlanStatus: plan.isolatedMockExecutionPlanStatus,
    isolatedMockExecutionPlanResult: plan.isolatedMockExecutionPlanResult,
    executionBoundaryEntryAllowed: plan.executionBoundaryEntryAllowed,
    executionBoundaryEntryScope: plan.executionBoundaryEntryScope,
    actualPatchImplementationExecutionStarted:
      runtimeGate.actualPatchImplementationExecutionStarted,
    actualPatchImplementationPatchApplied:
      runtimeGate.actualPatchImplementationPatchApplied,
    actualPatchImplementationImplemented:
      runtimeGate.actualPatchImplementationImplemented,
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
    publicAliasAllowed: trafficGate.publicAliasAllowed,
    runtimeTrafficAllowed: trafficGate.runtimeTrafficAllowed,
    walletMutationAllowed: runtimeGate.walletMutationAllowed,
    ledgerMutationAllowed: runtimeGate.ledgerMutationAllowed,
    prismaWriteAllowed: runtimeGate.prismaWriteAllowed,
    dbTransactionAllowed: runtimeGate.dbTransactionAllowed,
    migrationAllowed: runtimeGate.migrationAllowed,
    externalNetworkAllowed: trafficGate.externalNetworkAllowed,
    liveOroPlayApiCallAllowed: trafficGate.liveOroPlayApiCallAllowed,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary:
      runtimeGate.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      mountGate.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      trafficGate.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostExecutionValidation:
      runtimeGate.nextPhaseRequiresPostExecutionValidation,
    blockers,
  };
}

function evaluateOro5iActualPatchImplementationExecutionReadiness(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  return buildOro5iActualPatchImplementationExecutionReadinessSummary(input);
}

function validateOro5iActualPatchImplementationExecutionReadiness(
  input = buildOro5iActualPatchImplementationExecutionReadinessInput()
) {
  const summary =
    buildOro5iActualPatchImplementationExecutionReadinessSummary(input);
  return {
    valid:
      summary.actualPatchImplementationExecutionReadinessBoundaryResult === PASS,
    actualPatchImplementationExecutionReadinessBoundaryResult:
      summary.actualPatchImplementationExecutionReadinessBoundaryResult,
    actualPatchImplementationExecutionReadinessStatus:
      summary.actualPatchImplementationExecutionReadinessStatus,
    isolatedMockExecutionPlanPrepared: summary.isolatedMockExecutionPlanPrepared,
    executionBoundaryEntryAllowed: summary.executionBoundaryEntryAllowed,
    executionBoundaryEntryScope: summary.executionBoundaryEntryScope,
    actualPatchImplementationExecutionStarted:
      summary.actualPatchImplementationExecutionStarted,
    actualPatchImplementationPatchApplied:
      summary.actualPatchImplementationPatchApplied,
    actualPatchImplementationImplemented:
      summary.actualPatchImplementationImplemented,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresActualPatchImplementationExecutionBoundary:
      summary.nextPhaseRequiresActualPatchImplementationExecutionBoundary,
    nextPhaseRequiresSeparateRouteMountAuthorization:
      summary.nextPhaseRequiresSeparateRouteMountAuthorization,
    nextPhaseRequiresSeparateRuntimeTrafficApproval:
      summary.nextPhaseRequiresSeparateRuntimeTrafficApproval,
    nextPhaseRequiresPostExecutionValidation:
      summary.nextPhaseRequiresPostExecutionValidation,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  APPROVED,
  DECISION_ISSUED,
  ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY_ONLY,
  READY_FOR_ISOLATED_MOCK_EXECUTION_BOUNDARY,
  READY,
  PREPARED,
  READY_FOR_REVIEW,
  ISOLATED_MOCK_EXECUTION_PLAN_ONLY,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_STATUS,
  buildOro5iActualPatchImplementationExecutionReadinessInput,
  evaluateOro5iActualPatchImplementationExecutionReadiness,
  buildOro5iIsolatedMockExecutionPlan,
  buildOro5iActualRuntimeImplementationStillHeldGate,
  buildOro5iRouteMountStillHeldGate,
  buildOro5iRuntimeTrafficStillHeldGate,
  buildOro5iActualPatchImplementationExecutionReadinessSummary,
  validateOro5iActualPatchImplementationExecutionReadiness,
};
