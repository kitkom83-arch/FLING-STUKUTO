"use strict";

const PHASE = "ORO-4U";
const PASS = "PASS";
const FAIL = "FAIL";
const HOLD = "HOLD";
const STATIC_INTERNAL_METADATA_ONLY = "static_internal_metadata_only";
const DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED =
  "decision_recorded_mount_still_not_authorized";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const FINAL_DECISION_ISSUED_SEPARATE_ROUTE_APPROVAL_REQUIRED =
  "final_decision_issued_separate_route_approval_required";

const ORO_4U_FINAL_PRE_MOUNT_DECISION_STATUS = Object.freeze({
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED,
  NOT_AUTHORIZED_FOR_MOUNT,
  FINAL_DECISION_ISSUED_SEPARATE_ROUTE_APPROVAL_REQUIRED,
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

const FORBIDDEN_ALLOW_PATTERNS = Object.freeze([
  /expressMountAllowed/i,
  /expressMountAuthorizationRequested/i,
  /publicAliasAllowed/i,
  /runtimeTrafficAllowed/i,
  /walletMutationAllowed/i,
  /ledgerMutationAllowed/i,
  /prismaWriteAllowed/i,
  /dbTransactionAllowed/i,
  /externalNetworkAllowed/i,
  /externalNetworkAttempted/i,
  /liveRouteAllowed/i,
  /routeMounted/i,
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

function buildOro4uFinalPreMountDecisionInput(overrides = {}) {
  const baseline = {
    id: "happyPathDecisionRecordedMountNotAuthorized",
    phase: PHASE,
    artifactRegistryMetadata: {
      ownerSignedApprovalArtifactPrivateHashRegistered: true,
      artifactStorage: "private_off_repo",
      artifactCommittedToRepo: false,
      signatureCommittedToRepo: false,
      sha256Chunks: BASELINE_SHA256_CHUNKS.slice(),
    },
    signedApprovalRecord: {
      present: true,
      verifiedForIntake: true,
      acceptedForMountRequestPreparation: true,
      acceptedAsRouteMountAuthorization: false,
    },
    mountAuthorizationRequestSubmission: {
      submitted: true,
      submittedAt: "2026-06-04T03:40:00.000Z",
      submissionMode: STATIC_INTERNAL_METADATA_ONLY,
      externalSubmitted: false,
    },
    finalPreMountAuthorizationDecision: {
      prepared: true,
      issued: true,
      issuedMode: STATIC_INTERNAL_METADATA_ONLY,
      reviewer: "internal-authorization-reviewer",
      decisionTimestamp: "2026-06-04T04:10:00.000Z",
      decisionOutcome: DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED,
      outputScope: STATIC_INTERNAL_METADATA_ONLY,
      expressMountAuthorizationRequested: false,
    },
    authorizationState: {
      finalPreMountAuthorizationDecisionPrepared: true,
      finalPreMountAuthorizationDecisionIssued: true,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      separateRouteMountApprovalPresent: false,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
    },
    attemptedAuthorizationStates: {
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      externalNetworkAttempted: false,
    },
    trace: {
      mode: "static-mock-final-pre-mount-decision",
      safeValue: "mock-no-sensitive-output",
    },
  };

  return deepMerge(baseline, overrides);
}

function collectForbiddenAllowedMarkers(value, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenAllowedMarkers(entry, path.concat(String(index)), output));
    return output;
  }
  if (!isPlainObject(value)) return output;

  for (const [key, entry] of Object.entries(value)) {
    const markerKey = path.concat(key).join(".");
    const keyMatched = FORBIDDEN_ALLOW_PATTERNS.some((pattern) => pattern.test(key));
    const valueAllows =
      entry === true ||
      String(entry || "").toLowerCase() === "true" ||
      String(entry || "").toLowerCase() === "allowed" ||
      String(entry || "").toLowerCase() === "enabled" ||
      String(entry || "").toLowerCase() === "authorized";

    if (keyMatched && valueAllows) output.push(markerKey);
    collectForbiddenAllowedMarkers(entry, path.concat(key), output);
  }

  return output;
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
  const baseline = buildOro4uFinalPreMountDecisionInput();
  const merged = deepMerge(baseline, source);
  const artifact = isPlainObject(merged.artifactRegistryMetadata)
    ? merged.artifactRegistryMetadata
    : {};
  const signedRecord = isPlainObject(merged.signedApprovalRecord)
    ? merged.signedApprovalRecord
    : {};
  const submission = isPlainObject(merged.mountAuthorizationRequestSubmission)
    ? merged.mountAuthorizationRequestSubmission
    : {};
  const decision = isPlainObject(merged.finalPreMountAuthorizationDecision)
    ? merged.finalPreMountAuthorizationDecision
    : {};
  const state = isPlainObject(merged.authorizationState) ? merged.authorizationState : {};
  const attempted = isPlainObject(merged.attemptedAuthorizationStates)
    ? merged.attemptedAuthorizationStates
    : {};

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    ownerSignedApprovalArtifactPrivateHashRegistered: readBoolean(
      merged,
      "ownerSignedApprovalArtifactPrivateHashRegistered",
      readBoolean(artifact, "ownerSignedApprovalArtifactPrivateHashRegistered", true)
    ),
    artifactStorage: readString(artifact, "artifactStorage", "private_off_repo"),
    artifactCommittedToRepo: readBoolean(artifact, "artifactCommittedToRepo", false),
    signatureCommittedToRepo: readBoolean(artifact, "signatureCommittedToRepo", false),
    sha256Chunks: readArray(artifact, "sha256Chunks", BASELINE_SHA256_CHUNKS),
    signedApprovalRecordPresent: readBoolean(
      merged,
      "signedApprovalRecordPresent",
      readBoolean(signedRecord, "present", true)
    ),
    signedApprovalRecordVerifiedForIntake: readBoolean(
      merged,
      "signedApprovalRecordVerifiedForIntake",
      readBoolean(signedRecord, "verifiedForIntake", true)
    ),
    signedApprovalRecordAcceptedForMountRequestPreparation: readBoolean(
      merged,
      "signedApprovalRecordAcceptedForMountRequestPreparation",
      readBoolean(signedRecord, "acceptedForMountRequestPreparation", true)
    ),
    signedApprovalRecordAcceptedAsRouteMountAuthorization: readBoolean(
      merged,
      "signedApprovalRecordAcceptedAsRouteMountAuthorization",
      readBoolean(signedRecord, "acceptedAsRouteMountAuthorization", false)
    ),
    mountAuthorizationRequestSubmitted: readBoolean(
      merged,
      "mountAuthorizationRequestSubmitted",
      readBoolean(submission, "submitted", true)
    ),
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
    finalPreMountAuthorizationDecisionPrepared: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionPrepared",
      readBoolean(
        state,
        "finalPreMountAuthorizationDecisionPrepared",
        readBoolean(decision, "prepared", true)
      )
    ),
    finalPreMountAuthorizationDecisionIssued: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionIssued",
      readBoolean(state, "finalPreMountAuthorizationDecisionIssued", readBoolean(decision, "issued", true))
    ),
    finalPreMountAuthorizationDecisionIssuedMode: readString(
      decision,
      "issuedMode",
      STATIC_INTERNAL_METADATA_ONLY
    ),
    finalDecisionReviewer: readString(decision, "reviewer", ""),
    finalDecisionTimestamp: readString(decision, "decisionTimestamp", ""),
    finalDecisionOutcome: readString(
      decision,
      "decisionOutcome",
      DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED
    ),
    finalDecisionOutputScope: readString(decision, "outputScope", STATIC_INTERNAL_METADATA_ONLY),
    routeMountAuthorization: readString(
      state,
      "routeMountAuthorization",
      NOT_AUTHORIZED_FOR_MOUNT
    ),
    expressMountAllowed: readBoolean(state, "expressMountAllowed", false),
    publicAliasAllowed: readBoolean(state, "publicAliasAllowed", false),
    runtimeTrafficAllowed: readBoolean(state, "runtimeTrafficAllowed", false),
    separateRouteMountApprovalPresent: readBoolean(
      state,
      "separateRouteMountApprovalPresent",
      false
    ),
    separateRouteMountApprovalRequired: readBoolean(
      state,
      "separateRouteMountApprovalRequired",
      true
    ),
    nextPhaseRequiresSeparateAuthorization: readBoolean(
      state,
      "nextPhaseRequiresSeparateAuthorization",
      true
    ),
    attempted,
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  const submittedAt = normalizeTimestamp(fixture.mountAuthorizationRequestSubmittedAt);
  const decisionAt = normalizeTimestamp(fixture.finalDecisionTimestamp);

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
  if (!fixture.signedApprovalRecordPresent || !fixture.signedApprovalRecordVerifiedForIntake) {
    blockers.push("signed approval record is required");
  }
  if (!fixture.signedApprovalRecordAcceptedForMountRequestPreparation) {
    blockers.push("signed approval record must support request preparation");
  }
  if (fixture.signedApprovalRecordAcceptedAsRouteMountAuthorization) {
    blockers.push("signed approval record is not route mount approval");
  }
  if (!fixture.mountAuthorizationRequestSubmitted) {
    blockers.push("mount authorization request submission is required");
  }
  if (fixture.mountAuthorizationRequestSubmissionMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("mount request submission must stay static/internal metadata only");
  }
  if (fixture.externalMountAuthorizationRequestSubmitted) {
    blockers.push("external mount request submission is not allowed");
  }
  if (!fixture.finalPreMountAuthorizationDecisionPrepared) {
    blockers.push("final pre-mount decision must be prepared");
  }
  if (!fixture.finalPreMountAuthorizationDecisionIssued) {
    blockers.push("final pre-mount decision must be issued as static metadata");
  }
  if (fixture.finalPreMountAuthorizationDecisionIssuedMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("final pre-mount decision issuance must be static/internal metadata only");
  }
  if (!fixture.finalDecisionReviewer) {
    blockers.push("final decision reviewer is required");
  }
  if (!fixture.finalDecisionTimestamp || decisionAt === null) {
    blockers.push("final decision timestamp is required");
  }
  if (submittedAt !== null && decisionAt !== null && decisionAt < submittedAt) {
    blockers.push("final decision timestamp must be after request submission");
  }
  if (fixture.finalDecisionOutcome !== DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED) {
    blockers.push("final decision must record mount still not authorized");
  }
  if (fixture.finalDecisionOutputScope !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("final decision output must be static/internal metadata only");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("decision must not authorize Express mount directly");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("decision must not enable public alias");
  }
  if (fixture.runtimeTrafficAllowed) {
    blockers.push("decision must not enable runtime traffic");
  }
  if (!fixture.separateRouteMountApprovalRequired) {
    blockers.push("separate route mount approval remains required");
  }
  if (!fixture.nextPhaseRequiresSeparateAuthorization) {
    blockers.push("next phase must require separate authorization");
  }

  for (const marker of collectForbiddenAllowedMarkers(fixture.rawInput)) {
    blockers.push(`forbidden runtime authorization marker present: ${marker}`);
  }

  if (collectSecretShapedFindings(fixture.rawInput).length > 0) {
    blockers.push("decision output contains secret-shaped marker");
  }

  return blockers;
}

function buildOro4uRouteMountAuthorizationDecision(
  input = buildOro4uFinalPreMountDecisionInput()
) {
  const fixture = normalizeInput(input);
  return {
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    separateRouteMountApprovalPresent: fixture.separateRouteMountApprovalPresent,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
  };
}

function buildOro4uDecisionSummary(input = buildOro4uFinalPreMountDecisionInput()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const routeDecision = buildOro4uRouteMountAuthorizationDecision(input);

  return {
    phase: PHASE,
    fixtureId: fixture.id,
    finalPreMountAuthorizationDecisionBoundaryResult: blockers.length === 0 ? PASS : HOLD,
    finalPreMountAuthorizationDecisionPrepared: fixture.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: fixture.finalPreMountAuthorizationDecisionIssued,
    finalPreMountAuthorizationDecisionIssuedMode: fixture.finalPreMountAuthorizationDecisionIssuedMode,
    finalDecisionStaticInternalMetadataOnly:
      fixture.finalPreMountAuthorizationDecisionIssuedMode === STATIC_INTERNAL_METADATA_ONLY &&
      fixture.finalDecisionOutputScope === STATIC_INTERNAL_METADATA_ONLY,
    finalDecisionReviewerPresent: Boolean(fixture.finalDecisionReviewer),
    finalDecisionTimestamp: fixture.finalDecisionTimestamp,
    finalDecisionOutcome: fixture.finalDecisionOutcome,
    mountAuthorizationRequestSubmitted: fixture.mountAuthorizationRequestSubmitted,
    mountAuthorizationRequestSubmissionMode: fixture.mountAuthorizationRequestSubmissionMode,
    externalMountAuthorizationRequestSubmitted: false,
    ownerSignedApprovalArtifactPrivateHashRegistered:
      fixture.ownerSignedApprovalArtifactPrivateHashRegistered,
    signedApprovalRecordPresent: fixture.signedApprovalRecordPresent,
    routeMountAuthorization: routeDecision.routeMountAuthorization,
    expressMountAllowed: routeDecision.expressMountAllowed,
    publicAliasAllowed: routeDecision.publicAliasAllowed,
    runtimeTrafficAllowed: routeDecision.runtimeTrafficAllowed,
    separateRouteMountApprovalRequired: routeDecision.separateRouteMountApprovalRequired,
    nextPhaseRequiresSeparateAuthorization:
      routeDecision.nextPhaseRequiresSeparateAuthorization,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    decisionStatus: FINAL_DECISION_ISSUED_SEPARATE_ROUTE_APPROVAL_REQUIRED,
    blockers,
  };
}

function evaluateOro4uFinalPreMountAuthorizationDecision(
  input = buildOro4uFinalPreMountDecisionInput()
) {
  return buildOro4uDecisionSummary(input);
}

function validateOro4uFinalPreMountDecisionBoundary(
  input = buildOro4uFinalPreMountDecisionInput()
) {
  const summary = buildOro4uDecisionSummary(input);
  return {
    valid: summary.finalPreMountAuthorizationDecisionBoundaryResult === PASS,
    finalPreMountAuthorizationDecisionBoundaryResult:
      summary.finalPreMountAuthorizationDecisionBoundaryResult,
    routeMountAuthorization: summary.routeMountAuthorization,
    expressMountAllowed: summary.expressMountAllowed,
    publicAliasAllowed: summary.publicAliasAllowed,
    runtimeTrafficAllowed: summary.runtimeTrafficAllowed,
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  PASS,
  FAIL,
  HOLD,
  STATIC_INTERNAL_METADATA_ONLY,
  DECISION_RECORDED_MOUNT_STILL_NOT_AUTHORIZED,
  NOT_AUTHORIZED_FOR_MOUNT,
  FINAL_DECISION_ISSUED_SEPARATE_ROUTE_APPROVAL_REQUIRED,
  ORO_4U_FINAL_PRE_MOUNT_DECISION_STATUS,
  buildOro4uFinalPreMountDecisionInput,
  evaluateOro4uFinalPreMountAuthorizationDecision,
  buildOro4uRouteMountAuthorizationDecision,
  buildOro4uDecisionSummary,
  validateOro4uFinalPreMountDecisionBoundary,
};
