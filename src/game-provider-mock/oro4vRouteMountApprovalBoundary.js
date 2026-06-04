"use strict";

const PHASE = "ORO-4V";
const PASS = "PASS";
const FAIL = "FAIL";
const HOLD = "HOLD";
const STATIC_INTERNAL_METADATA_ONLY = "static_internal_metadata_only";
const APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED =
  "approval_boundary_recorded_mount_still_not_implemented";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const SEPARATE_IMPLEMENTATION_REQUIRED = "separate_implementation_required";

const ORO_4V_ROUTE_MOUNT_APPROVAL_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
  NOT_AUTHORIZED_FOR_MOUNT,
  SEPARATE_IMPLEMENTATION_REQUIRED,
});

const BASELINE_SHA256_CHUNKS = Object.freeze([
  "E5831182",
  "83A4A30C",
  "B3E506D5",
  "F880B4E1",
  "FCB1CCF1",
  "2DB4AB46",
  "84E12D6D",
  "7F6E62EE",
]);

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

function readArray(source, key, fallback) {
  if (isPlainObject(source) && Array.isArray(source[key])) return source[key].slice();
  return fallback.slice();
}

function normalizeTimestamp(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function buildOro4vRouteMountApprovalInput(overrides = {}) {
  const baseline = {
    id: "happyPathApprovalBoundaryRecordedMountNotImplemented",
    phase: PHASE,
    oro4uFinalDecision: {
      finalPreMountAuthorizationDecisionIssued: true,
      finalPreMountAuthorizationDecisionIssuedMode: STATIC_INTERNAL_METADATA_ONLY,
      finalDecisionTimestamp: "2026-06-04T04:10:00.000Z",
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      separateRouteMountApprovalRequired: true,
    },
    mountAuthorizationRequestSubmission: {
      submitted: true,
      submittedAt: "2026-06-04T03:40:00.000Z",
      submissionMode: STATIC_INTERNAL_METADATA_ONLY,
      externalSubmitted: false,
    },
    signedApprovalRecord: {
      present: true,
      verifiedForIntake: true,
      acceptedForMountRequestPreparation: true,
      acceptedAsRouteMountAuthorization: false,
    },
    artifactRegistryMetadata: {
      ownerSignedApprovalArtifactPrivateHashRegistered: true,
      artifactStorage: "private_off_repo",
      artifactCommittedToRepo: false,
      signatureCommittedToRepo: false,
      sha256Chunks: BASELINE_SHA256_CHUNKS.slice(),
    },
    routeMountApproval: {
      boundaryPresent: true,
      approvalTimestamp: "2026-06-04T04:25:00.000Z",
      reviewer: "route-mount-reviewer",
      approvalOutputScope: STATIC_INTERNAL_METADATA_ONLY,
      approvalStatus: APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
      approvalBoundaryStaticInternalMetadataOnly: true,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      expressMountImplemented: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      separateImplementationPhaseRequired: true,
      nextPhaseRequiresSeparateImplementationApproval: true,
    },
    implementationPlan: {
      implementationPhaseApproved: false,
      srcAppJsEditAttempted: false,
      expressMountAttempted: false,
      publicAliasAttempted: false,
      runtimeTrafficAttempted: false,
    },
    attemptedAuthorizationStates: {
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      externalNetworkAttempted: false,
      externalNetworkAllowed: false,
    },
    trace: {
      mode: "static-mock-route-mount-approval-boundary",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
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

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro4vRouteMountApprovalInput();
  const merged = deepMerge(baseline, source);
  const finalDecision = isPlainObject(merged.oro4uFinalDecision)
    ? merged.oro4uFinalDecision
    : {};
  const submission = isPlainObject(merged.mountAuthorizationRequestSubmission)
    ? merged.mountAuthorizationRequestSubmission
    : {};
  const signedRecord = isPlainObject(merged.signedApprovalRecord)
    ? merged.signedApprovalRecord
    : {};
  const artifact = isPlainObject(merged.artifactRegistryMetadata)
    ? merged.artifactRegistryMetadata
    : {};
  const approval = isPlainObject(merged.routeMountApproval) ? merged.routeMountApproval : {};
  const plan = isPlainObject(merged.implementationPlan) ? merged.implementationPlan : {};
  const attempted = isPlainObject(merged.attemptedAuthorizationStates)
    ? merged.attemptedAuthorizationStates
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    finalPreMountAuthorizationDecisionIssued: readBoolean(
      finalDecision,
      "finalPreMountAuthorizationDecisionIssued",
      true
    ),
    finalPreMountAuthorizationDecisionIssuedMode: readString(
      finalDecision,
      "finalPreMountAuthorizationDecisionIssuedMode",
      STATIC_INTERNAL_METADATA_ONLY
    ),
    finalDecisionTimestamp: readString(
      finalDecision,
      "finalDecisionTimestamp",
      baseline.oro4uFinalDecision.finalDecisionTimestamp
    ),
    oro4uRouteMountAuthorization: readString(
      finalDecision,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    oro4uExpressMountAllowed: readBoolean(finalDecision, "expressMountAllowed", false),
    oro4uPublicAliasAllowed: readBoolean(finalDecision, "publicAliasAllowed", false),
    oro4uRuntimeTrafficAllowed: readBoolean(finalDecision, "runtimeTrafficAllowed", false),
    mountAuthorizationRequestSubmitted: readBoolean(submission, "submitted", true),
    mountAuthorizationRequestSubmittedAt: readString(
      submission,
      "submittedAt",
      baseline.mountAuthorizationRequestSubmission.submittedAt
    ),
    mountAuthorizationRequestSubmissionMode: readString(
      submission,
      "submissionMode",
      STATIC_INTERNAL_METADATA_ONLY
    ),
    externalMountAuthorizationRequestSubmitted: readBoolean(
      submission,
      "externalSubmitted",
      false
    ),
    signedApprovalRecordPresent: readBoolean(signedRecord, "present", true),
    signedApprovalRecordVerifiedForIntake: readBoolean(signedRecord, "verifiedForIntake", true),
    signedApprovalRecordAcceptedForMountRequestPreparation: readBoolean(
      signedRecord,
      "acceptedForMountRequestPreparation",
      true
    ),
    signedApprovalRecordAcceptedAsRouteMountAuthorization: readBoolean(
      signedRecord,
      "acceptedAsRouteMountAuthorization",
      false
    ),
    ownerSignedApprovalArtifactPrivateHashRegistered: readBoolean(
      artifact,
      "ownerSignedApprovalArtifactPrivateHashRegistered",
      true
    ),
    artifactStorage: readString(artifact, "artifactStorage", "private_off_repo"),
    artifactCommittedToRepo: readBoolean(artifact, "artifactCommittedToRepo", false),
    signatureCommittedToRepo: readBoolean(artifact, "signatureCommittedToRepo", false),
    sha256Chunks: readArray(artifact, "sha256Chunks", BASELINE_SHA256_CHUNKS),
    routeMountApprovalBoundaryPresent: readBoolean(approval, "boundaryPresent", true),
    routeMountReviewer: readString(approval, "reviewer", ""),
    approvalTimestamp: readString(approval, "approvalTimestamp", ""),
    approvalOutputScope: readString(approval, "approvalOutputScope", STATIC_INTERNAL_METADATA_ONLY),
    approvalStatus: readString(
      approval,
      "approvalStatus",
      APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED
    ),
    approvalBoundaryStaticInternalMetadataOnly: readBoolean(
      approval,
      "approvalBoundaryStaticInternalMetadataOnly",
      true
    ),
    routeMountAuthorization: readString(
      approval,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(approval, "expressMountAllowed", false),
    expressMountImplemented: readBoolean(approval, "expressMountImplemented", false),
    publicAliasAllowed: readBoolean(approval, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(approval, "runtimeTrafficAllowed", false),
    separateImplementationPhaseRequired: readBoolean(
      approval,
      "separateImplementationPhaseRequired",
      true
    ),
    nextPhaseRequiresSeparateImplementationApproval: readBoolean(
      approval,
      "nextPhaseRequiresSeparateImplementationApproval",
      true
    ),
    implementationPhaseApproved: readBoolean(plan, "implementationPhaseApproved", false),
    srcAppJsEditAttempted: readBoolean(plan, "srcAppJsEditAttempted", false),
    expressMountAttempted: readBoolean(plan, "expressMountAttempted", false),
    publicAliasAttempted: readBoolean(plan, "publicAliasAttempted", false),
    runtimeTrafficAttempted: readBoolean(plan, "runtimeTrafficAttempted", false),
    walletMutationAllowed: readBoolean(attempted, "walletMutationAllowed", false),
    ledgerMutationAllowed: readBoolean(attempted, "ledgerMutationAllowed", false),
    prismaWriteAllowed: readBoolean(attempted, "prismaWriteAllowed", false),
    externalNetworkAttempted: readBoolean(attempted, "externalNetworkAttempted", false),
    externalNetworkAllowed: readBoolean(attempted, "externalNetworkAllowed", false),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  const submittedAt = normalizeTimestamp(fixture.mountAuthorizationRequestSubmittedAt);
  const finalDecisionAt = normalizeTimestamp(fixture.finalDecisionTimestamp);
  const approvalAt = normalizeTimestamp(fixture.approvalTimestamp);

  if (!fixture.finalPreMountAuthorizationDecisionIssued) {
    blockers.push("ORO-4U final decision is required");
  }
  if (fixture.finalPreMountAuthorizationDecisionIssuedMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("ORO-4U final decision must stay static/internal metadata only");
  }
  if (!fixture.mountAuthorizationRequestSubmitted) {
    blockers.push("ORO-4T mount request submission is required");
  }
  if (fixture.mountAuthorizationRequestSubmissionMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("mount request submission must stay static/internal metadata only");
  }
  if (fixture.externalMountAuthorizationRequestSubmitted) {
    blockers.push("external mount request submission is not allowed");
  }
  if (!fixture.signedApprovalRecordPresent || !fixture.signedApprovalRecordVerifiedForIntake) {
    blockers.push("signed approval record is required");
  }
  if (!fixture.signedApprovalRecordAcceptedForMountRequestPreparation) {
    blockers.push("signed approval record must support mount request preparation");
  }
  if (fixture.signedApprovalRecordAcceptedAsRouteMountAuthorization) {
    blockers.push("signed approval record is not route mount approval");
  }
  if (!fixture.ownerSignedApprovalArtifactPrivateHashRegistered) {
    blockers.push("private artifact hash registry is required");
  }
  if (fixture.artifactStorage !== "private_off_repo") {
    blockers.push("approval artifact storage must stay private off repo");
  }
  if (fixture.artifactCommittedToRepo || fixture.signatureCommittedToRepo) {
    blockers.push("approval artifact and signature must not be committed");
  }
  if (!Array.isArray(fixture.sha256Chunks) || fixture.sha256Chunks.length !== 8) {
    blockers.push("private artifact hash registry chunks are required");
  }
  if (fixture.sha256Chunks.some((chunk) => !/^[0-9A-F]{8}$/i.test(String(chunk || "")))) {
    blockers.push("private artifact hash chunks must be safe SHA256 chunks");
  }
  if (!fixture.routeMountApprovalBoundaryPresent) {
    blockers.push("route mount approval boundary is required");
  }
  if (!fixture.routeMountReviewer) {
    blockers.push("route mount reviewer is required");
  }
  if (!fixture.approvalTimestamp || approvalAt === null) {
    blockers.push("approval timestamp is required");
  }
  if (submittedAt !== null && approvalAt !== null && approvalAt < submittedAt) {
    blockers.push("approval timestamp must be after ORO-4T request submission");
  }
  if (finalDecisionAt !== null && approvalAt !== null && approvalAt < finalDecisionAt) {
    blockers.push("approval timestamp must be after ORO-4U final decision");
  }
  if (fixture.approvalOutputScope !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("approval boundary must stay static/internal metadata only");
  }
  if (!fixture.approvalBoundaryStaticInternalMetadataOnly) {
    blockers.push("approval boundary must be static/internal metadata only");
  }
  if (fixture.approvalStatus !== APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED) {
    blockers.push("approval boundary must record mount still not implemented");
  }
  if (fixture.oro4uRouteMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("ORO-4U route mount authorization must remain not authorized");
  }
  if (fixture.oro4uExpressMountAllowed) {
    blockers.push("ORO-4U must not authorize Express mount");
  }
  if (fixture.oro4uPublicAliasAllowed) {
    blockers.push("ORO-4U must not enable public alias");
  }
  if (fixture.oro4uRuntimeTrafficAllowed) {
    blockers.push("ORO-4U must not enable runtime traffic");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("approval must not authorize Express mount directly");
  }
  if (fixture.expressMountImplemented || fixture.expressMountAttempted) {
    blockers.push("approval must not implement Express mount");
  }
  if (fixture.srcAppJsEditAttempted) {
    blockers.push("approval must not edit src/app.js");
  }
  if (fixture.publicAliasAllowed || fixture.publicAliasAttempted) {
    blockers.push("approval must not enable public alias");
  }
  if (fixture.runtimeTrafficAllowed || fixture.runtimeTrafficAttempted) {
    blockers.push("approval must not enable runtime traffic");
  }
  if (fixture.walletMutationAllowed) {
    blockers.push("approval must not try wallet mutation");
  }
  if (fixture.ledgerMutationAllowed) {
    blockers.push("approval must not try ledger mutation");
  }
  if (fixture.prismaWriteAllowed) {
    blockers.push("approval must not try Prisma write");
  }
  if (fixture.externalNetworkAttempted || fixture.externalNetworkAllowed) {
    blockers.push("approval must not try external network");
  }
  if (fixture.implementationPhaseApproved) {
    blockers.push("implementation phase approval is outside ORO-4V");
  }
  if (!fixture.separateImplementationPhaseRequired) {
    blockers.push("separate implementation phase remains required");
  }
  if (!fixture.nextPhaseRequiresSeparateImplementationApproval) {
    blockers.push("next phase must require separate implementation approval");
  }
  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("approval output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4vExpressMountAuthorizationGate(
  input = buildOro4vRouteMountApprovalInput()
) {
  const fixture = normalizeInput(input);
  return {
    phase: PHASE,
    finalPreMountAuthorizationDecisionIssued:
      fixture.finalPreMountAuthorizationDecisionIssued,
    routeMountApprovalBoundaryPresent: fixture.routeMountApprovalBoundaryPresent,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    expressMountImplemented: false,
    srcAppJsEditAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    separateImplementationPhaseRequired: true,
    nextPhaseRequiresSeparateImplementationApproval: true,
  };
}

function buildOro4vRouteMountApprovalSummary(
  input = buildOro4vRouteMountApprovalInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const gate = buildOro4vExpressMountAuthorizationGate(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    routeMountApprovalBoundaryResult: blockers.length === 0 ? PASS : HOLD,
    routeMountApprovalBoundaryPresent: fixture.routeMountApprovalBoundaryPresent,
    approvalBoundaryStaticInternalMetadataOnly:
      fixture.approvalBoundaryStaticInternalMetadataOnly &&
      fixture.approvalOutputScope === STATIC_INTERNAL_METADATA_ONLY,
    routeMountApprovalStatus: APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
    finalPreMountAuthorizationDecisionIssued:
      fixture.finalPreMountAuthorizationDecisionIssued,
    mountAuthorizationRequestSubmitted: fixture.mountAuthorizationRequestSubmitted,
    signedApprovalRecordPresent: fixture.signedApprovalRecordPresent,
    ownerSignedApprovalArtifactPrivateHashRegistered:
      fixture.ownerSignedApprovalArtifactPrivateHashRegistered,
    routeMountReviewerPresent: Boolean(fixture.routeMountReviewer),
    approvalTimestamp: fixture.approvalTimestamp,
    routeMountAuthorization: gate.routeMountAuthorization,
    expressMountAllowed: gate.expressMountAllowed,
    expressMountImplemented: gate.expressMountImplemented,
    srcAppJsEditAllowed: gate.srcAppJsEditAllowed,
    publicAliasAllowed: gate.publicAliasAllowed,
    runtimeTrafficAllowed: gate.runtimeTrafficAllowed,
    separateImplementationPhaseRequired: gate.separateImplementationPhaseRequired,
    nextPhaseRequiresSeparateImplementationApproval:
      gate.nextPhaseRequiresSeparateImplementationApproval,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    blockers,
  };
}

function evaluateOro4vRouteMountApprovalBoundary(
  input = buildOro4vRouteMountApprovalInput()
) {
  return buildOro4vRouteMountApprovalSummary(input);
}

function validateOro4vRouteMountApprovalBoundary(
  input = buildOro4vRouteMountApprovalInput()
) {
  const summary = buildOro4vRouteMountApprovalSummary(input);
  return {
    valid: summary.routeMountApprovalBoundaryResult === PASS,
    routeMountApprovalBoundaryResult: summary.routeMountApprovalBoundaryResult,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    expressMountImplemented: summary.expressMountImplemented,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    separateImplementationPhaseRequired: summary.separateImplementationPhaseRequired,
    nextPhaseRequiresSeparateImplementationApproval:
      summary.nextPhaseRequiresSeparateImplementationApproval,
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
  NOT_AUTHORIZED_FOR_MOUNT,
  SEPARATE_IMPLEMENTATION_REQUIRED,
  ORO_4V_ROUTE_MOUNT_APPROVAL_STATUS,
  buildOro4vRouteMountApprovalInput,
  evaluateOro4vRouteMountApprovalBoundary,
  buildOro4vExpressMountAuthorizationGate,
  buildOro4vRouteMountApprovalSummary,
  validateOro4vRouteMountApprovalBoundary,
};
