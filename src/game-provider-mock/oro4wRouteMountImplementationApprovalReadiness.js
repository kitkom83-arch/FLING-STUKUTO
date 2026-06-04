"use strict";

const {
  PASS,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
  NOT_AUTHORIZED_FOR_MOUNT,
  buildOro4vRouteMountApprovalInput,
  evaluateOro4vRouteMountApprovalBoundary,
} = require("./oro4vRouteMountApprovalBoundary");

const PHASE = "ORO-4W";
const FAIL = "FAIL";
const IMPLEMENTATION_READINESS_RECORDED =
  "implementation_approval_readiness_recorded_mount_still_not_implemented";

const ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
  IMPLEMENTATION_READINESS_RECORDED,
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

function buildOro4wRouteMountImplementationApprovalInput(overrides = {}) {
  const oro4vInput = buildOro4vRouteMountApprovalInput();
  const oro4vSummary = evaluateOro4vRouteMountApprovalBoundary(oro4vInput);
  const baseline = {
    id: "happyPathReadinessRecordedMountNotImplemented",
    phase: PHASE,
    oro4vApprovalBoundary: {
      boundaryRecorded: true,
      routeMountApprovalBoundaryResult: oro4vSummary.routeMountApprovalBoundaryResult,
      routeMountApprovalStatus: oro4vSummary.routeMountApprovalStatus,
      routeMountAuthorization: oro4vSummary.routeMountAuthorization,
      expressMountAllowed: oro4vSummary.expressMountAllowed,
      expressMountImplemented: oro4vSummary.expressMountImplemented,
      publicAliasAllowed: oro4vSummary.publicAliasAllowed,
      runtimeTrafficAllowed: oro4vSummary.runtimeTrafficAllowed,
      separateImplementationPhaseRequired:
        oro4vSummary.separateImplementationPhaseRequired,
      nextPhaseRequiresSeparateImplementationApproval:
        oro4vSummary.nextPhaseRequiresSeparateImplementationApproval,
    },
    implementationApprovalReadiness: {
      readinessRecorded: true,
      readinessMode: STATIC_INTERNAL_METADATA_ONLY,
      implementationApprovalStatus: IMPLEMENTATION_READINESS_RECORDED,
      implementationApprovalGranted: false,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      nextPhaseRequiresExplicitImplementationApproval: true,
      nextPhaseRequiresSeparateExecutionApproval: true,
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
      readinessTreatedAsRuntimeMountAuthorization: false,
    },
    trace: {
      mode: "static-mock-implementation-approval-readiness",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro4wRouteMountImplementationApprovalInput();
  const merged = deepMerge(baseline, source);
  const oro4v = isPlainObject(merged.oro4vApprovalBoundary)
    ? merged.oro4vApprovalBoundary
    : {};
  const readiness = isPlainObject(merged.implementationApprovalReadiness)
    ? merged.implementationApprovalReadiness
    : {};
  const attempt = isPlainObject(merged.implementationAttempt)
    ? merged.implementationAttempt
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    oro4vBoundaryRecorded: readBoolean(oro4v, "boundaryRecorded", true),
    routeMountApprovalBoundaryResult: readString(
      oro4v,
      "routeMountApprovalBoundaryResult",
      PASS
    ),
    routeMountApprovalStatus: readString(
      oro4v,
      "routeMountApprovalStatus",
      APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED
    ),
    oro4vRouteMountAuthorization: readString(
      oro4v,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4vExpressMountAllowed: readBoolean(oro4v, "expressMountAllowed", false),
    oro4vExpressMountImplemented: readBoolean(oro4v, "expressMountImplemented", false),
    oro4vPublicAliasAllowed: readBoolean(oro4v, "publicAliasAllowed", false),
    oro4vRuntimeTrafficAllowed: readBoolean(oro4v, "runtimeTrafficAllowed", false),
    oro4vSeparateImplementationPhaseRequired: readBoolean(
      oro4v,
      "separateImplementationPhaseRequired",
      true
    ),
    oro4vNextPhaseRequiresSeparateImplementationApproval: readBoolean(
      oro4v,
      "nextPhaseRequiresSeparateImplementationApproval",
      true
    ),
    readinessRecorded: readBoolean(readiness, "readinessRecorded", true),
    readinessMode: readString(readiness, "readinessMode", STATIC_INTERNAL_METADATA_ONLY),
    implementationApprovalStatus: readString(
      readiness,
      "implementationApprovalStatus",
      IMPLEMENTATION_READINESS_RECORDED
    ),
    implementationApprovalGranted: readBoolean(
      readiness,
      "implementationApprovalGranted",
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
    nextPhaseRequiresExplicitImplementationApproval: readBoolean(
      readiness,
      "nextPhaseRequiresExplicitImplementationApproval",
      true
    ),
    nextPhaseRequiresSeparateExecutionApproval: readBoolean(
      readiness,
      "nextPhaseRequiresSeparateExecutionApproval",
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
    readinessTreatedAsRuntimeMountAuthorization: readBoolean(
      attempt,
      "readinessTreatedAsRuntimeMountAuthorization",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.oro4vBoundaryRecorded) {
    blockers.push("ORO-4V approval boundary is required");
  }
  if (fixture.routeMountApprovalBoundaryResult !== PASS) {
    blockers.push("ORO-4V route mount approval boundary result must be PASS");
  }
  if (fixture.routeMountApprovalStatus !== APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED) {
    blockers.push("ORO-4V approval boundary must record mount still not implemented");
  }
  if (fixture.oro4vRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("ORO-4V route mount authorization must remain not authorized");
  }
  if (fixture.oro4vExpressMountAllowed || fixture.expressMountAllowed) {
    blockers.push("Express mount must remain not allowed");
  }
  if (fixture.oro4vExpressMountImplemented || fixture.expressMountImplemented) {
    blockers.push("Express mount must remain not implemented");
  }
  if (fixture.oro4vPublicAliasAllowed || fixture.publicAliasAllowed) {
    blockers.push("public alias must remain not allowed");
  }
  if (fixture.oro4vRuntimeTrafficAllowed || fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic must remain not allowed");
  }
  if (!fixture.oro4vSeparateImplementationPhaseRequired) {
    blockers.push("ORO-4V must require separate implementation phase");
  }
  if (!fixture.oro4vNextPhaseRequiresSeparateImplementationApproval) {
    blockers.push("ORO-4V must require separate implementation approval");
  }
  if (!fixture.readinessRecorded) {
    blockers.push("implementation approval readiness must be recorded");
  }
  if (fixture.readinessMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("implementation approval readiness must stay static/internal metadata only");
  }
  if (fixture.implementationApprovalStatus !== IMPLEMENTATION_READINESS_RECORDED) {
    blockers.push("implementation approval readiness must record mount still not implemented");
  }
  if (fixture.implementationApprovalGranted) {
    blockers.push("implementation approval must not be granted");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (!fixture.nextPhaseRequiresExplicitImplementationApproval) {
    blockers.push("next phase must require explicit implementation approval");
  }
  if (!fixture.nextPhaseRequiresSeparateExecutionApproval) {
    blockers.push("next phase must require separate execution approval");
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
  if (fixture.approvalTriesToGrantImplementationExecution) {
    blockers.push("readiness must not grant implementation execution directly");
  }
  if (fixture.readinessTreatedAsRuntimeMountAuthorization) {
    blockers.push("readiness must not be treated as runtime mount authorization");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("readiness output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4wSeparateImplementationApprovalGate(
  input = buildOro4wRouteMountImplementationApprovalInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    oro4vApprovalBoundaryRecorded: fixture.oro4vBoundaryRecorded,
    routeMountApprovalBoundaryResult: fixture.routeMountApprovalBoundaryResult,
    implementationApprovalReadinessRecorded: true,
    implementationApprovalGranted: false,
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
    nextPhaseRequiresExplicitImplementationApproval: true,
    nextPhaseRequiresSeparateExecutionApproval: true,
  };
}

function buildOro4wRouteMountImplementationApprovalSummary(
  input = buildOro4wRouteMountImplementationApprovalInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro4wSeparateImplementationApprovalGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    implementationApprovalReadinessResult: blockers.length === 0 ? PASS : HOLD,
    implementationApprovalReadinessRecorded:
      blockers.length === 0 && fixture.readinessRecorded,
    implementationApprovalStatus: IMPLEMENTATION_READINESS_RECORDED,
    implementationApprovalGranted: gate.implementationApprovalGranted,
    implementationApprovalReadinessMode: STATIC_INTERNAL_METADATA_ONLY,
    oro4vApprovalBoundaryRecorded: fixture.oro4vBoundaryRecorded,
    routeMountApprovalBoundaryResult: fixture.routeMountApprovalBoundaryResult,
    routeMountApprovalStatus: fixture.routeMountApprovalStatus,
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
    nextPhaseRequiresExplicitImplementationApproval:
      gate.nextPhaseRequiresExplicitImplementationApproval,
    nextPhaseRequiresSeparateExecutionApproval:
      gate.nextPhaseRequiresSeparateExecutionApproval,
    blockers,
  };
}

function evaluateOro4wRouteMountImplementationApprovalReadiness(
  input = buildOro4wRouteMountImplementationApprovalInput()
) {
  return buildOro4wRouteMountImplementationApprovalSummary(input);
}

function validateOro4wRouteMountImplementationApprovalReadiness(
  input = buildOro4wRouteMountImplementationApprovalInput()
) {
  const summary = buildOro4wRouteMountImplementationApprovalSummary(input);
  return {
    valid: summary.implementationApprovalReadinessResult === PASS,
    implementationApprovalReadinessResult:
      summary.implementationApprovalReadinessResult,
    implementationApprovalReadinessRecorded:
      summary.implementationApprovalReadinessRecorded,
    implementationApprovalGranted: summary.implementationApprovalGranted,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    nextPhaseRequiresExplicitImplementationApproval:
      summary.nextPhaseRequiresExplicitImplementationApproval,
    nextPhaseRequiresSeparateExecutionApproval:
      summary.nextPhaseRequiresSeparateExecutionApproval,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
  IMPLEMENTATION_READINESS_RECORDED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS,
  buildOro4wRouteMountImplementationApprovalInput,
  evaluateOro4wRouteMountImplementationApprovalReadiness,
  buildOro4wSeparateImplementationApprovalGate,
  buildOro4wRouteMountImplementationApprovalSummary,
  validateOro4wRouteMountImplementationApprovalReadiness,
};
