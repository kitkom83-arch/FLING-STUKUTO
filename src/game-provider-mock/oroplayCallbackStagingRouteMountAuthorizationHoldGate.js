"use strict";

const PHASE = "ORO-4Q";
const GATE = "oroplay_callback_staging_route_mount_authorization_hold_gate";
const PASS = "PASS";
const FAIL = "FAIL";
const PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT = "pending_actual_signed_approval_artifact";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";

const OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE_STATUS = Object.freeze({
  PASS,
  FAIL,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  NOT_AUTHORIZED_FOR_MOUNT,
  MOUNT_AUTHORIZATION_HOLD_ACTIVE: "mount_authorization_hold_active",
  FINAL_PRE_MOUNT_DECISION_NOT_ISSUED: "final_pre_mount_authorization_decision_not_issued",
  ACTUAL_SIGNED_APPROVAL_ARTIFACT_WAITING: "actual_signed_approval_artifact_waiting",
});

const BASE_MOUNT_BLOCKERS = Object.freeze([
  "missing_actual_signed_approval_artifact",
  "missing_actual_signed_approval_record",
  "final_pre_mount_authorization_decision_not_issued",
  "mount_authorization_request_not_submitted",
]);

const ACTUAL_ARTIFACT_PROOF_TYPES = Object.freeze([
  "actual_signed_approval_artifact",
  "actual_signed_approval_pdf",
  "actual_signed_approval_record_artifact",
]);

const ACTUAL_SIGNED_RECORD_TYPES = Object.freeze([
  "actual_signed_approval_record",
  "actual_pre_mount_authorization_record",
]);

const FORBIDDEN_ALLOWED_MARKERS = Object.freeze([
  /liveRouteAllowed/i,
  /liveRouteMounted/i,
  /runtimeTrafficAllowed/i,
  /walletMutationAllowed/i,
  /ledgerMutationAllowed/i,
  /walletWriteAllowed/i,
  /ledgerWriteAllowed/i,
  /prismaWriteAllowed/i,
  /dbTransactionAllowed/i,
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
  if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) return source[key];
  return fallback;
}

function buildMountAuthorizationHoldGateInput(overrides = {}) {
  const baseline = {
    id: "baselinePendingActualSignedApprovalArtifactFixture",
    phase: PHASE,
    sourceAcceptanceReviewBoundary: {
      phase: "ORO-4P",
      present: true,
      result: PASS,
      signedApprovalArtifactAcceptanceReviewBoundaryPassed: true,
      signedApprovalArtifactAcceptanceReviewContractPresent: true,
      finalPreMountAuthorizationDecisionBoundaryPresent: true,
      finalPreMountAuthorizationDecisionPrepared: true,
      finalPreMountAuthorizationDecisionIssued: false,
    },
    actualSignedApprovalArtifact: {
      present: false,
      proofType: null,
      sourceType: "absent",
    },
    signedApprovalRecord: {
      present: false,
      recordType: null,
    },
    signedApprovalArtifactReview: {
      accepted: false,
      verified: false,
    },
    approvalCandidates: {
      chatApproval: {
        present: false,
        countedAsSignedApprovalArtifact: false,
        value: "mock-approval-placeholder",
      },
      plainTextApproval: {
        present: false,
        countedAsSignedApprovalArtifact: false,
        value: "mock-approval-placeholder",
      },
      mockSignedApprovalArtifact: {
        present: true,
        artifactId: "mock-review-only-artifact-id",
        reviewOnly: true,
        acceptedAsActualAuthorization: false,
      },
    },
    mountAuthorizationEvidencePack: {
      prepared: true,
      submitted: false,
    },
    mountAuthorizationRequest: {
      submitted: false,
    },
    authorizationState: {
      preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      mountAuthorizationHoldActive: true,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
    },
    attemptedAuthorizationStates: {
      actualSignedApprovalArtifactSource: "none",
      liveRouteAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
    },
    trace: {
      mode: "static-mock-hold-gate",
      safeValue: "mock-no-secret",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildMountAuthorizationHoldGateInput();
  const merged = deepMerge(baseline, source);
  const boundary = isPlainObject(merged.sourceAcceptanceReviewBoundary)
    ? merged.sourceAcceptanceReviewBoundary
    : {};
  const artifact = isPlainObject(merged.actualSignedApprovalArtifact) ? merged.actualSignedApprovalArtifact : {};
  const record = isPlainObject(merged.signedApprovalRecord) ? merged.signedApprovalRecord : {};
  const review = isPlainObject(merged.signedApprovalArtifactReview) ? merged.signedApprovalArtifactReview : {};
  const candidates = isPlainObject(merged.approvalCandidates) ? merged.approvalCandidates : {};
  const chat = isPlainObject(candidates.chatApproval) ? candidates.chatApproval : {};
  const plainText = isPlainObject(candidates.plainTextApproval) ? candidates.plainTextApproval : {};
  const mock = isPlainObject(candidates.mockSignedApprovalArtifact) ? candidates.mockSignedApprovalArtifact : {};
  const evidencePack = isPlainObject(merged.mountAuthorizationEvidencePack)
    ? merged.mountAuthorizationEvidencePack
    : {};
  const request = isPlainObject(merged.mountAuthorizationRequest) ? merged.mountAuthorizationRequest : {};
  const state = isPlainObject(merged.authorizationState) ? merged.authorizationState : {};

  return {
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    signedApprovalArtifactAcceptanceReviewBoundaryPassed: readBoolean(
      merged,
      "signedApprovalArtifactAcceptanceReviewBoundaryPassed",
      readBoolean(boundary, "signedApprovalArtifactAcceptanceReviewBoundaryPassed", boundary.result === PASS)
    ),
    signedApprovalArtifactAcceptanceReviewContractPresent: readBoolean(
      merged,
      "signedApprovalArtifactAcceptanceReviewContractPresent",
      readBoolean(boundary, "signedApprovalArtifactAcceptanceReviewContractPresent", true)
    ),
    finalPreMountAuthorizationDecisionBoundaryPresent: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionBoundaryPresent",
      readBoolean(boundary, "finalPreMountAuthorizationDecisionBoundaryPresent", true)
    ),
    finalPreMountAuthorizationDecisionPrepared: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionPrepared",
      readBoolean(boundary, "finalPreMountAuthorizationDecisionPrepared", true)
    ),
    attemptedFinalPreMountAuthorizationDecisionIssued: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionIssued",
      readBoolean(boundary, "finalPreMountAuthorizationDecisionIssued", false)
    ),
    actualSignedApprovalArtifactAttemptedPresent: readBoolean(
      merged,
      "actualSignedApprovalArtifactPresent",
      readBoolean(artifact, "present", false)
    ),
    actualSignedApprovalArtifactProofType: readString(artifact, "proofType", ""),
    signedApprovalRecordAttemptedPresent: readBoolean(
      merged,
      "signedApprovalRecordPresent",
      readBoolean(record, "present", false)
    ),
    signedApprovalRecordType: readString(record, "recordType", ""),
    signedApprovalArtifactAcceptedAttempted: readBoolean(
      merged,
      "signedApprovalArtifactAccepted",
      readBoolean(review, "accepted", false)
    ),
    signedApprovalArtifactVerifiedAttempted: readBoolean(
      merged,
      "signedApprovalArtifactVerified",
      readBoolean(review, "verified", false)
    ),
    chatApprovalCountedAsSignedApprovalArtifact: readBoolean(chat, "countedAsSignedApprovalArtifact", false),
    plainTextApprovalCountedAsSignedApprovalArtifact: readBoolean(
      plainText,
      "countedAsSignedApprovalArtifact",
      false
    ),
    mockSignedApprovalArtifactAcceptedAsActualAuthorization: readBoolean(
      mock,
      "acceptedAsActualAuthorization",
      false
    ),
    mockSignedApprovalArtifactReviewOnly: readBoolean(mock, "reviewOnly", true),
    mountAuthorizationEvidencePackPrepared: readBoolean(
      merged,
      "mountAuthorizationEvidencePackPrepared",
      readBoolean(evidencePack, "prepared", true)
    ),
    mountAuthorizationEvidencePackSubmittedAttempted: readBoolean(
      merged,
      "mountAuthorizationEvidencePackSubmitted",
      readBoolean(evidencePack, "submitted", false)
    ),
    mountAuthorizationRequestSubmittedAttempted: readBoolean(
      merged,
      "mountAuthorizationRequestSubmitted",
      readBoolean(request, "submitted", false)
    ),
    preMountAuthorization: readString(
      merged,
      "preMountAuthorization",
      readString(state, "preMountAuthorization", PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT)
    ),
    routeMountAuthorization: readString(
      merged,
      "routeMountAuthorization",
      readString(state, "routeMountAuthorization", NOT_AUTHORIZED_FOR_MOUNT)
    ),
    mountAuthorizationHoldActive: readBoolean(
      merged,
      "mountAuthorizationHoldActive",
      readBoolean(state, "mountAuthorizationHoldActive", true)
    ),
    expressMountAllowedAttempted: readBoolean(
      merged,
      "expressMountAllowed",
      readBoolean(state, "expressMountAllowed", false)
    ),
    publicAliasAllowedAttempted: readBoolean(
      merged,
      "publicAliasAllowed",
      readBoolean(state, "publicAliasAllowed", false)
    ),
    runtimeTrafficAllowedAttempted: readBoolean(
      merged,
      "runtimeTrafficAllowed",
      readBoolean(state, "runtimeTrafficAllowed", false)
    ),
    humanAuthorizationRequired: readBoolean(
      merged,
      "humanAuthorizationRequired",
      readBoolean(state, "humanAuthorizationRequired", true)
    ),
    separateRouteMountApprovalRequired: readBoolean(
      merged,
      "separateRouteMountApprovalRequired",
      readBoolean(state, "separateRouteMountApprovalRequired", true)
    ),
    nextPhaseRequiresSeparateAuthorization: readBoolean(
      merged,
      "nextPhaseRequiresSeparateAuthorization",
      readBoolean(state, "nextPhaseRequiresSeparateAuthorization", true)
    ),
    attemptedAuthorizationStates: isPlainObject(merged.attemptedAuthorizationStates)
      ? merged.attemptedAuthorizationStates
      : {},
  };
}

function hasActualProofType(value) {
  return ACTUAL_ARTIFACT_PROOF_TYPES.includes(String(value || ""));
}

function hasActualSignedRecordType(value) {
  return ACTUAL_SIGNED_RECORD_TYPES.includes(String(value || ""));
}

function collectForbiddenAllowedMarkers(value, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenAllowedMarkers(entry, path.concat(String(index)), output));
    return output;
  }
  if (!isPlainObject(value)) return output;

  for (const [key, entry] of Object.entries(value)) {
    const markerKey = path.concat(key).join(".");
    const markerMatched = FORBIDDEN_ALLOWED_MARKERS.some((pattern) => pattern.test(key));
    const valueAllows =
      entry === true ||
      String(entry || "").toLowerCase() === "true" ||
      String(entry || "").toLowerCase() === "allowed" ||
      String(entry || "").toLowerCase() === "enabled" ||
      String(entry || "").toLowerCase() === "authorized";

    if (markerMatched && valueAllows) output.push(markerKey);
    collectForbiddenAllowedMarkers(entry, path.concat(key), output);
  }

  return output;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const attemptedSource = String(fixture.attemptedAuthorizationStates.actualSignedApprovalArtifactSource || "");
  const blockers = [];

  if (!fixture.signedApprovalArtifactAcceptanceReviewBoundaryPassed) {
    blockers.push("ORO-4P signed approval artifact acceptance review boundary has not passed");
  }
  if (!fixture.signedApprovalArtifactAcceptanceReviewContractPresent) {
    blockers.push("signed approval artifact acceptance review contract missing");
  }
  if (!fixture.finalPreMountAuthorizationDecisionBoundaryPresent) {
    blockers.push("final pre-mount authorization decision boundary missing");
  }
  if (!fixture.finalPreMountAuthorizationDecisionPrepared) {
    blockers.push("final pre-mount authorization decision pack not prepared");
  }
  if (fixture.attemptedFinalPreMountAuthorizationDecisionIssued) {
    blockers.push("final pre-mount authorization decision cannot be issued before actual signed approval artifact");
  }
  if (fixture.actualSignedApprovalArtifactAttemptedPresent && !hasActualProofType(fixture.actualSignedApprovalArtifactProofType)) {
    blockers.push("actual signed approval artifact present without actual proof type");
  }
  if (fixture.actualSignedApprovalArtifactAttemptedPresent) {
    blockers.push("actual signed approval artifact cannot be ingested in ORO-4Q hold gate");
  }
  if (fixture.signedApprovalRecordAttemptedPresent && !hasActualSignedRecordType(fixture.signedApprovalRecordType)) {
    blockers.push("signed approval record present without actual signed record type");
  }
  if (fixture.signedApprovalRecordAttemptedPresent) {
    blockers.push("actual signed approval record cannot be created in ORO-4Q hold gate");
  }
  if (fixture.signedApprovalArtifactAcceptedAttempted) {
    blockers.push("signed approval artifact cannot be accepted in ORO-4Q hold gate");
  }
  if (fixture.signedApprovalArtifactVerifiedAttempted) {
    blockers.push("signed approval artifact cannot be verified in ORO-4Q hold gate");
  }
  if (fixture.chatApprovalCountedAsSignedApprovalArtifact || attemptedSource === "chat_approval") {
    blockers.push("chat approval cannot be counted as signed approval artifact");
  }
  if (fixture.plainTextApprovalCountedAsSignedApprovalArtifact || attemptedSource === "plain_text_approval") {
    blockers.push("plain text approval cannot be counted as signed approval artifact");
  }
  if (fixture.mockSignedApprovalArtifactAcceptedAsActualAuthorization || attemptedSource === "mock_signed_artifact") {
    blockers.push("mock signed approval artifact cannot be accepted as actual authorization");
  }
  if (!fixture.mockSignedApprovalArtifactReviewOnly) {
    blockers.push("mock signed approval artifact must remain review-only");
  }
  if (!fixture.mountAuthorizationEvidencePackPrepared) {
    blockers.push("mount authorization evidence pack must be prepared for ORO-4Q hold gate");
  }
  if (fixture.mountAuthorizationEvidencePackSubmittedAttempted) {
    blockers.push("mount authorization evidence pack must not be submitted in ORO-4Q");
  }
  if (fixture.mountAuthorizationRequestSubmittedAttempted) {
    blockers.push("mount authorization request must not be submitted in ORO-4Q");
  }
  if (fixture.preMountAuthorization !== PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT) {
    blockers.push("pre-mount authorization must remain pending actual signed approval artifact");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized for mount");
  }
  if (!fixture.mountAuthorizationHoldActive) {
    blockers.push("mount authorization hold must remain active");
  }
  if (fixture.expressMountAllowedAttempted) {
    blockers.push("Express mount is not allowed in ORO-4Q");
  }
  if (fixture.publicAliasAllowedAttempted) {
    blockers.push("public alias is not allowed in ORO-4Q");
  }
  if (fixture.runtimeTrafficAllowedAttempted) {
    blockers.push("runtime traffic is not allowed in ORO-4Q");
  }
  if (!fixture.humanAuthorizationRequired) {
    blockers.push("human authorization remains required");
  }
  if (!fixture.separateRouteMountApprovalRequired) {
    blockers.push("separate route mount approval remains required");
  }
  if (!fixture.nextPhaseRequiresSeparateAuthorization) {
    blockers.push("next phase requires separate authorization");
  }

  for (const marker of collectForbiddenAllowedMarkers(fixture.attemptedAuthorizationStates)) {
    blockers.push(`forbidden runtime authorization marker present: ${marker}`);
  }

  return blockers;
}

function buildMountAuthorizationHoldGateSummary(input = buildMountAuthorizationHoldGateInput()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const attemptedSource = String(fixture.attemptedAuthorizationStates.actualSignedApprovalArtifactSource || "");

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    mountAuthorizationHoldGateResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalArtifactAcceptanceReviewBoundaryPassed:
      fixture.signedApprovalArtifactAcceptanceReviewBoundaryPassed,
    signedApprovalArtifactAcceptanceReviewContractPresent:
      fixture.signedApprovalArtifactAcceptanceReviewContractPresent,
    finalPreMountAuthorizationDecisionBoundaryPresent:
      fixture.finalPreMountAuthorizationDecisionBoundaryPresent,
    finalPreMountAuthorizationDecisionPrepared: fixture.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    chatApprovalRejectedAsSignedApprovalArtifact:
      !fixture.chatApprovalCountedAsSignedApprovalArtifact && attemptedSource !== "chat_approval",
    plainTextApprovalRejectedAsSignedApprovalArtifact:
      !fixture.plainTextApprovalCountedAsSignedApprovalArtifact && attemptedSource !== "plain_text_approval",
    mockSignedApprovalArtifactRejectedAsActualAuthorization:
      !fixture.mockSignedApprovalArtifactAcceptedAsActualAuthorization && attemptedSource !== "mock_signed_artifact",
    mockSignedApprovalArtifactReviewOnly: fixture.mockSignedApprovalArtifactReviewOnly,
    mountAuthorizationEvidencePackPrepared: fixture.mountAuthorizationEvidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    mountAuthorizationHoldActive: true,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    humanAuthorizationRequired: fixture.humanAuthorizationRequired,
    separateRouteMountApprovalRequired: fixture.separateRouteMountApprovalRequired,
    nextPhaseRequiresSeparateAuthorization: fixture.nextPhaseRequiresSeparateAuthorization,
    mountBlockers: BASE_MOUNT_BLOCKERS.slice(),
    blockers,
  };
}

function evaluateMountAuthorizationHoldGate(input = buildMountAuthorizationHoldGateInput()) {
  return buildMountAuthorizationHoldGateSummary(input);
}

function validateMountAuthorizationHoldGate(input = buildMountAuthorizationHoldGateInput()) {
  const summary = buildMountAuthorizationHoldGateSummary(input);
  return {
    mountAuthorizationHoldGateValidationResult: summary.mountAuthorizationHoldGateResult,
    valid: summary.mountAuthorizationHoldGateResult === PASS,
    mountBlockers: summary.mountBlockers.slice(),
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  NOT_AUTHORIZED_FOR_MOUNT,
  OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE_STATUS,
  buildMountAuthorizationHoldGateInput,
  evaluateMountAuthorizationHoldGate,
  validateMountAuthorizationHoldGate,
  buildMountAuthorizationHoldGateSummary,
};
