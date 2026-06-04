"use strict";

const PHASE = "ORO-4T";
const GATE =
  "oroplay_callback_staging_route_mount_authorization_request_submission_final_decision_review_boundary";
const PASS = "PASS";
const FAIL = "FAIL";
const PRIVATE_OFF_REPO = "private_off_repo";
const STATIC_INTERNAL_METADATA_ONLY = "static_internal_metadata_only";
const SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION =
  "submitted_pending_final_pre_mount_decision";
const PENDING_FINAL_PRE_MOUNT_DECISION = "pending_final_pre_mount_decision";
const MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION =
  "mount_authorization_request_submitted_pending_final_pre_mount_decision";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";

const OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_FINAL_DECISION_REVIEW_BOUNDARY_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    PRIVATE_OFF_REPO,
    STATIC_INTERNAL_METADATA_ONLY,
    SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
    PENDING_FINAL_PRE_MOUNT_DECISION,
    MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
    NOT_AUTHORIZED_FOR_MOUNT,
    REPO_METADATA_ONLY: "repo_metadata_only",
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

const REMOVED_MOUNT_BLOCKERS = Object.freeze([
  "missing_actual_signed_approval_artifact",
  "missing_signed_approval_record",
  "mount_authorization_request_not_submitted",
]);

const REMAINING_MOUNT_BLOCKERS = Object.freeze([
  "final_pre_mount_authorization_decision_not_issued",
  "route_mount_authorization_not_granted",
]);

const FORBIDDEN_ALLOWED_MARKERS = Object.freeze([
  /liveRouteAllowed/i,
  /liveRouteMounted/i,
  /routeMountAllowed/i,
  /routeMounted/i,
  /runtimeTrafficAllowed/i,
  /walletMutationAllowed/i,
  /ledgerMutationAllowed/i,
  /walletWriteAllowed/i,
  /ledgerWriteAllowed/i,
  /prismaWriteAllowed/i,
  /dbTransactionAllowed/i,
  /expressMountAllowed/i,
  /publicAliasAllowed/i,
  /externalNetworkAllowed/i,
  /externalSubmissionAllowed/i,
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

function buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput(overrides = {}) {
  const baseline = {
    id: "baselineMountAuthorizationRequestSubmissionFinalDecisionReviewFixture",
    phase: PHASE,
    artifactRegistryMetadata: {
      documentId: "PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001",
      artifactFileName: "PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
      artifactStorage: PRIVATE_OFF_REPO,
      sanitizedPrivateStorageRef:
        "private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
      artifactCommittedToRepo: false,
      signatureCommittedToRepo: false,
      baselineCommit: "f97bdb7b109b55aa28960c0c1e544a95279f1386",
      baselineSafeCiRunId: 26891982447,
      artifactRegistryCommit: "957b4d2941af642a51f001d0b74c51cf76db28cb",
      artifactRegistrySafeCiRunId: 26904110250,
      signedApprovalRecordCommit: "7beb142dce561a53c9d833b73c0662a59d03ad47",
      signedApprovalRecordSafeCiRunId: 26907826949,
      sha256Chunks: BASELINE_SHA256_CHUNKS.slice(),
    },
    privateArtifactEvidence: {
      ownerSignedApprovalArtifactPrivateHashRegistered: true,
      actualSignedApprovalArtifactPresent: true,
      actualSignedApprovalArtifactStorage: PRIVATE_OFF_REPO,
      signedApprovalArtifactIntakeRecordPresent: true,
      signedApprovalArtifactAcceptedForIntake: true,
      signedApprovalArtifactAcceptedAsMountAuthorization: false,
    },
    signedApprovalRecord: {
      signedApprovalRecordId: "PG77-ORO-4S-SIGNED-APPROVAL-RECORD-2026-06-03-001",
      signedApprovalRecordType: "owner_signed_approval_artifact_hash_record",
      signedApprovalRecordSource: "private_artifact_hash_registry",
      signedApprovalRecordStorage: "repo_metadata_only",
      created: true,
      present: true,
      verifiedForIntake: true,
      acceptedForMountRequestPreparation: true,
      acceptedAsRouteMountAuthorization: false,
    },
    mountAuthorizationRequestSubmission: {
      mountAuthorizationRequestId: "PG77-ORO-4S-MOUNT-AUTHORIZATION-REQUEST-DRAFT-2026-06-03-001",
      mountAuthorizationSubmissionRecordId:
        "PG77-ORO-4T-MOUNT-AUTHORIZATION-REQUEST-SUBMISSION-2026-06-03-001",
      prepared: true,
      submitted: true,
      submissionAllowed: true,
      submissionMode: STATIC_INTERNAL_METADATA_ONLY,
      externalSubmitted: false,
      status: SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
    },
    finalPreMountAuthorizationDecisionReview: {
      finalPreMountAuthorizationDecisionReviewId:
        "PG77-ORO-4T-FINAL-PRE-MOUNT-DECISION-REVIEW-2026-06-03-001",
      prepared: true,
      status: PENDING_FINAL_PRE_MOUNT_DECISION,
      finalDecisionPrepared: true,
      finalDecisionIssued: false,
    },
    authorizationState: {
      preMountAuthorization:
        MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
    },
    attemptedAuthorizationStates: {
      submissionScope: "static_internal_repo_metadata_record_only",
      externalMountAuthorizationRequestSubmitted: false,
      liveRouteAllowed: false,
      runtimeTrafficAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
    },
    trace: {
      mode: "static-mock-mount-authorization-request-submission-final-decision-review",
      safeValue: "mock-no-secret",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeMountAuthorizationRequestArtifactSha256Chunks(chunks) {
  if (!Array.isArray(chunks)) return "";
  return chunks.map((chunk) => String(chunk || "").trim().toUpperCase()).join("");
}

function collectStringFindings(value, matcher, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectStringFindings(entry, matcher, path.concat(String(index)), output));
    return output;
  }
  if (isPlainObject(value)) {
    for (const [key, entry] of Object.entries(value)) {
      collectStringFindings(entry, matcher, path.concat(key), output);
    }
    return output;
  }
  if (typeof value === "string" && matcher(value)) {
    output.push(path.join(".") || "(root)");
  }
  return output;
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

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput();
  const merged = deepMerge(baseline, source);
  const metadata = isPlainObject(merged.artifactRegistryMetadata) ? merged.artifactRegistryMetadata : {};
  const evidence = isPlainObject(merged.privateArtifactEvidence) ? merged.privateArtifactEvidence : {};
  const record = isPlainObject(merged.signedApprovalRecord) ? merged.signedApprovalRecord : {};
  const submission = isPlainObject(merged.mountAuthorizationRequestSubmission)
    ? merged.mountAuthorizationRequestSubmission
    : {};
  const review = isPlainObject(merged.finalPreMountAuthorizationDecisionReview)
    ? merged.finalPreMountAuthorizationDecisionReview
    : {};
  const state = isPlainObject(merged.authorizationState) ? merged.authorizationState : {};
  const sha256Chunks = readArray(metadata, "sha256Chunks", BASELINE_SHA256_CHUNKS);
  const normalizedHash = normalizeMountAuthorizationRequestArtifactSha256Chunks(sha256Chunks);

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    documentId: readString(
      merged,
      "documentId",
      readString(metadata, "documentId", baseline.artifactRegistryMetadata.documentId)
    ),
    artifactFileName: readString(
      merged,
      "artifactFileName",
      readString(metadata, "artifactFileName", baseline.artifactRegistryMetadata.artifactFileName)
    ),
    artifactStorage: readString(
      merged,
      "artifactStorage",
      readString(metadata, "artifactStorage", PRIVATE_OFF_REPO)
    ),
    sanitizedPrivateStorageRef: readString(
      merged,
      "sanitizedPrivateStorageRef",
      readString(metadata, "sanitizedPrivateStorageRef", baseline.artifactRegistryMetadata.sanitizedPrivateStorageRef)
    ),
    signedApprovalArtifactCommittedToRepo: readBoolean(
      merged,
      "signedApprovalArtifactCommittedToRepo",
      readBoolean(metadata, "artifactCommittedToRepo", false)
    ),
    signatureCommittedToRepo: readBoolean(
      merged,
      "signatureCommittedToRepo",
      readBoolean(metadata, "signatureCommittedToRepo", false)
    ),
    baselineCommit: readString(metadata, "baselineCommit", baseline.artifactRegistryMetadata.baselineCommit),
    baselineSafeCiRunId: metadata.baselineSafeCiRunId || baseline.artifactRegistryMetadata.baselineSafeCiRunId,
    artifactRegistryCommit: readString(
      metadata,
      "artifactRegistryCommit",
      baseline.artifactRegistryMetadata.artifactRegistryCommit
    ),
    artifactRegistrySafeCiRunId:
      metadata.artifactRegistrySafeCiRunId || baseline.artifactRegistryMetadata.artifactRegistrySafeCiRunId,
    signedApprovalRecordCommit: readString(
      metadata,
      "signedApprovalRecordCommit",
      baseline.artifactRegistryMetadata.signedApprovalRecordCommit
    ),
    signedApprovalRecordSafeCiRunId:
      metadata.signedApprovalRecordSafeCiRunId ||
      baseline.artifactRegistryMetadata.signedApprovalRecordSafeCiRunId,
    sha256Chunks,
    normalizedHash,
    ownerSignedApprovalArtifactPrivateHashRegistered: readBoolean(
      merged,
      "ownerSignedApprovalArtifactPrivateHashRegistered",
      readBoolean(evidence, "ownerSignedApprovalArtifactPrivateHashRegistered", true)
    ),
    actualSignedApprovalArtifactPresent: readBoolean(
      merged,
      "actualSignedApprovalArtifactPresent",
      readBoolean(evidence, "actualSignedApprovalArtifactPresent", true)
    ),
    actualSignedApprovalArtifactStorage: readString(
      merged,
      "actualSignedApprovalArtifactStorage",
      readString(evidence, "actualSignedApprovalArtifactStorage", PRIVATE_OFF_REPO)
    ),
    signedApprovalArtifactIntakeRecordPresent: readBoolean(
      merged,
      "signedApprovalArtifactIntakeRecordPresent",
      readBoolean(evidence, "signedApprovalArtifactIntakeRecordPresent", true)
    ),
    signedApprovalArtifactAcceptedForIntake: readBoolean(
      merged,
      "signedApprovalArtifactAcceptedForIntake",
      readBoolean(evidence, "signedApprovalArtifactAcceptedForIntake", true)
    ),
    signedApprovalArtifactAcceptedAsMountAuthorization: readBoolean(
      merged,
      "signedApprovalArtifactAcceptedAsMountAuthorization",
      readBoolean(evidence, "signedApprovalArtifactAcceptedAsMountAuthorization", false)
    ),
    signedApprovalRecordId: readString(
      merged,
      "signedApprovalRecordId",
      readString(record, "signedApprovalRecordId", baseline.signedApprovalRecord.signedApprovalRecordId)
    ),
    signedApprovalRecordType: readString(
      merged,
      "signedApprovalRecordType",
      readString(record, "signedApprovalRecordType", baseline.signedApprovalRecord.signedApprovalRecordType)
    ),
    signedApprovalRecordSource: readString(
      merged,
      "signedApprovalRecordSource",
      readString(record, "signedApprovalRecordSource", baseline.signedApprovalRecord.signedApprovalRecordSource)
    ),
    signedApprovalRecordStorage: readString(
      merged,
      "signedApprovalRecordStorage",
      readString(record, "signedApprovalRecordStorage", baseline.signedApprovalRecord.signedApprovalRecordStorage)
    ),
    signedApprovalRecordCreated: readBoolean(
      merged,
      "signedApprovalRecordCreated",
      readBoolean(record, "created", true)
    ),
    signedApprovalRecordPresent: readBoolean(
      merged,
      "signedApprovalRecordPresent",
      readBoolean(record, "present", true)
    ),
    signedApprovalRecordVerifiedForIntake: readBoolean(
      merged,
      "signedApprovalRecordVerifiedForIntake",
      readBoolean(record, "verifiedForIntake", true)
    ),
    signedApprovalRecordAcceptedForMountRequestPreparation: readBoolean(
      merged,
      "signedApprovalRecordAcceptedForMountRequestPreparation",
      readBoolean(record, "acceptedForMountRequestPreparation", true)
    ),
    signedApprovalRecordAcceptedAsRouteMountAuthorization: readBoolean(
      merged,
      "signedApprovalRecordAcceptedAsRouteMountAuthorization",
      readBoolean(record, "acceptedAsRouteMountAuthorization", false)
    ),
    mountAuthorizationRequestId: readString(
      merged,
      "mountAuthorizationRequestId",
      readString(
        submission,
        "mountAuthorizationRequestId",
        baseline.mountAuthorizationRequestSubmission.mountAuthorizationRequestId
      )
    ),
    mountAuthorizationSubmissionRecordId: readString(
      merged,
      "mountAuthorizationSubmissionRecordId",
      readString(
        submission,
        "mountAuthorizationSubmissionRecordId",
        baseline.mountAuthorizationRequestSubmission.mountAuthorizationSubmissionRecordId
      )
    ),
    mountAuthorizationRequestPrepared: readBoolean(
      merged,
      "mountAuthorizationRequestPrepared",
      readBoolean(submission, "prepared", true)
    ),
    mountAuthorizationRequestSubmitted: readBoolean(
      merged,
      "mountAuthorizationRequestSubmitted",
      readBoolean(submission, "submitted", true)
    ),
    mountAuthorizationRequestSubmissionAllowed: readBoolean(
      merged,
      "mountAuthorizationRequestSubmissionAllowed",
      readBoolean(submission, "submissionAllowed", true)
    ),
    mountAuthorizationRequestSubmissionMode: readString(
      merged,
      "mountAuthorizationRequestSubmissionMode",
      readString(submission, "submissionMode", STATIC_INTERNAL_METADATA_ONLY)
    ),
    externalMountAuthorizationRequestSubmitted: readBoolean(
      merged,
      "externalMountAuthorizationRequestSubmitted",
      readBoolean(submission, "externalSubmitted", false)
    ),
    mountAuthorizationRequestStatus: readString(
      merged,
      "mountAuthorizationRequestStatus",
      readString(submission, "status", SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION)
    ),
    finalPreMountAuthorizationDecisionReviewId: readString(
      merged,
      "finalPreMountAuthorizationDecisionReviewId",
      readString(
        review,
        "finalPreMountAuthorizationDecisionReviewId",
        baseline.finalPreMountAuthorizationDecisionReview.finalPreMountAuthorizationDecisionReviewId
      )
    ),
    finalPreMountAuthorizationDecisionReviewPrepared: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionReviewPrepared",
      readBoolean(review, "prepared", true)
    ),
    finalPreMountAuthorizationDecisionReviewStatus: readString(
      merged,
      "finalPreMountAuthorizationDecisionReviewStatus",
      readString(review, "status", PENDING_FINAL_PRE_MOUNT_DECISION)
    ),
    finalPreMountAuthorizationDecisionPrepared: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionPrepared",
      readBoolean(review, "finalDecisionPrepared", true)
    ),
    finalPreMountAuthorizationDecisionIssued: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionIssued",
      readBoolean(review, "finalDecisionIssued", false)
    ),
    preMountAuthorization: readString(
      merged,
      "preMountAuthorization",
      readString(
        state,
        "preMountAuthorization",
        MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION
      )
    ),
    routeMountAuthorization: readString(
      merged,
      "routeMountAuthorization",
      readString(state, "routeMountAuthorization", NOT_AUTHORIZED_FOR_MOUNT)
    ),
    expressMountAllowed: readBoolean(
      merged,
      "expressMountAllowed",
      readBoolean(state, "expressMountAllowed", false)
    ),
    publicAliasAllowed: readBoolean(
      merged,
      "publicAliasAllowed",
      readBoolean(state, "publicAliasAllowed", false)
    ),
    runtimeTrafficAllowed: readBoolean(
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

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  const normalizedHash = fixture.normalizedHash;
  const hashChunksPresent = Array.isArray(fixture.sha256Chunks) && fixture.sha256Chunks.length > 0;
  const fullHashFindings = collectStringFindings(fixture.rawInput, (value) => /\b[0-9a-fA-F]{64}\b/.test(value));
  const localPathFindings = collectStringFindings(fixture.rawInput, (value) =>
    /(?:^|[^A-Za-z])[A-Za-z]:[\\/]/.test(value)
  );

  if (fixture.artifactStorage !== PRIVATE_OFF_REPO) {
    blockers.push("artifact storage must be private_off_repo");
  }
  if (fixture.actualSignedApprovalArtifactStorage !== PRIVATE_OFF_REPO) {
    blockers.push("actual signed approval artifact storage must be private_off_repo");
  }
  if (!fixture.sanitizedPrivateStorageRef.startsWith("private://")) {
    blockers.push("sanitized private storage reference must use private scheme");
  }
  if (fixture.signedApprovalArtifactCommittedToRepo) {
    blockers.push("signed approval artifact must not be committed to repo");
  }
  if (fixture.signatureCommittedToRepo) {
    blockers.push("signature must not be committed to repo");
  }
  if (localPathFindings.length > 0) {
    blockers.push("local absolute private artifact path must not be recorded");
  }
  if (!hashChunksPresent) {
    blockers.push("signed approval artifact hash chunks missing");
  }
  if (fixture.sha256Chunks.length !== 8) {
    blockers.push("signed approval artifact hash must have 8 chunks");
  }
  if (fixture.sha256Chunks.some((chunk) => !/^[0-9a-fA-F]{8}$/.test(String(chunk || "")))) {
    blockers.push("signed approval artifact hash chunk format invalid");
  }
  if (normalizedHash.length !== 64) {
    blockers.push("signed approval artifact normalized hash length must be 64");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(normalizedHash)) {
    blockers.push("signed approval artifact normalized hash must be hex SHA256");
  }
  if (fullHashFindings.length > 0) {
    blockers.push("full SHA256 literal must not be stored in registry metadata output");
  }
  if (!fixture.ownerSignedApprovalArtifactPrivateHashRegistered) {
    blockers.push("owner signed approval artifact private hash registry missing");
  }
  if (!fixture.actualSignedApprovalArtifactPresent) {
    blockers.push("actual signed approval artifact must be present as private off-repo evidence");
  }
  if (!fixture.signedApprovalArtifactIntakeRecordPresent) {
    blockers.push("signed approval artifact intake record must be present");
  }
  if (!fixture.signedApprovalArtifactAcceptedForIntake) {
    blockers.push("signed approval artifact must be accepted for intake only");
  }
  if (fixture.signedApprovalArtifactAcceptedAsMountAuthorization) {
    blockers.push("signed approval artifact cannot be accepted as mount authorization");
  }
  if (!fixture.signedApprovalRecordCreated) {
    blockers.push("signed approval record must be created");
  }
  if (!fixture.signedApprovalRecordPresent) {
    blockers.push("signed approval record must be present");
  }
  if (!fixture.signedApprovalRecordVerifiedForIntake) {
    blockers.push("signed approval record must be verified for intake");
  }
  if (!fixture.signedApprovalRecordAcceptedForMountRequestPreparation) {
    blockers.push("signed approval record must be accepted for mount request preparation only");
  }
  if (fixture.signedApprovalRecordAcceptedAsRouteMountAuthorization) {
    blockers.push("signed approval record cannot be accepted as route mount authorization");
  }
  if (!fixture.mountAuthorizationRequestPrepared) {
    blockers.push("mount authorization request must be prepared before submission record");
  }
  if (!fixture.mountAuthorizationRequestSubmitted) {
    blockers.push("mount authorization request submission record must be present");
  }
  if (!fixture.mountAuthorizationRequestSubmissionAllowed) {
    blockers.push("mount authorization request submission must be allowed for static internal metadata only");
  }
  if (fixture.mountAuthorizationRequestSubmissionMode !== STATIC_INTERNAL_METADATA_ONLY) {
    blockers.push("mount authorization request submission mode must be static_internal_metadata_only");
  }
  if (fixture.externalMountAuthorizationRequestSubmitted) {
    blockers.push("external mount authorization request submission must remain false");
  }
  if (fixture.mountAuthorizationRequestStatus !== SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION) {
    blockers.push("mount authorization request status must be submitted_pending_final_pre_mount_decision");
  }
  if (!fixture.finalPreMountAuthorizationDecisionReviewPrepared) {
    blockers.push("final pre-mount authorization decision review must be prepared");
  }
  if (fixture.finalPreMountAuthorizationDecisionReviewStatus !== PENDING_FINAL_PRE_MOUNT_DECISION) {
    blockers.push("final pre-mount authorization decision review status must remain pending");
  }
  if (!fixture.finalPreMountAuthorizationDecisionPrepared) {
    blockers.push("final pre-mount authorization decision metadata must be prepared");
  }
  if (fixture.finalPreMountAuthorizationDecisionIssued) {
    blockers.push("final pre-mount authorization decision must not be issued in ORO-4T");
  }
  if (
    fixture.preMountAuthorization !==
    MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION
  ) {
    blockers.push("pre-mount authorization must remain submitted pending final pre-mount decision");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized for mount");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("Express mount is not allowed in ORO-4T");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public alias is not allowed in ORO-4T");
  }
  if (fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic is not allowed in ORO-4T");
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

  for (const marker of collectForbiddenAllowedMarkers(fixture.rawInput)) {
    blockers.push(`forbidden runtime authorization marker present: ${marker}`);
  }

  return blockers;
}

function buildMountAuthorizationRequestSubmissionFinalDecisionReviewSummary(
  input = buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const normalizedHash = fixture.normalizedHash;

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    mountAuthorizationRequestSubmissionFinalDecisionReviewResult: blockers.length === 0 ? PASS : FAIL,
    documentId: fixture.documentId,
    artifactFileName: fixture.artifactFileName,
    artifactStorage: fixture.artifactStorage,
    sanitizedPrivateStorageRef: fixture.sanitizedPrivateStorageRef,
    baselineCommit: fixture.baselineCommit,
    baselineSafeCiRunId: fixture.baselineSafeCiRunId,
    artifactRegistryCommit: fixture.artifactRegistryCommit,
    artifactRegistrySafeCiRunId: fixture.artifactRegistrySafeCiRunId,
    signedApprovalRecordCommit: fixture.signedApprovalRecordCommit,
    signedApprovalRecordSafeCiRunId: fixture.signedApprovalRecordSafeCiRunId,
    signedApprovalRecordId: fixture.signedApprovalRecordId,
    signedApprovalRecordType: fixture.signedApprovalRecordType,
    signedApprovalRecordSource: fixture.signedApprovalRecordSource,
    signedApprovalRecordStorage: fixture.signedApprovalRecordStorage,
    mountAuthorizationRequestId: fixture.mountAuthorizationRequestId,
    mountAuthorizationSubmissionRecordId: fixture.mountAuthorizationSubmissionRecordId,
    finalPreMountAuthorizationDecisionReviewId: fixture.finalPreMountAuthorizationDecisionReviewId,
    ownerSignedApprovalArtifactPrivateHashRegistered:
      fixture.ownerSignedApprovalArtifactPrivateHashRegistered,
    actualSignedApprovalArtifactPresent: fixture.actualSignedApprovalArtifactPresent,
    actualSignedApprovalArtifactStorage: fixture.actualSignedApprovalArtifactStorage,
    signedApprovalArtifactCommittedToRepo: fixture.signedApprovalArtifactCommittedToRepo,
    signatureCommittedToRepo: fixture.signatureCommittedToRepo,
    signedApprovalArtifactHashChunksPresent: fixture.sha256Chunks.length > 0,
    signedApprovalArtifactHashFormatValid: /^[0-9a-fA-F]{64}$/.test(normalizedHash),
    signedApprovalArtifactNormalizedHashLength: normalizedHash.length,
    signedApprovalArtifactIntakeRecordPresent: fixture.signedApprovalArtifactIntakeRecordPresent,
    signedApprovalArtifactAcceptedForIntake: fixture.signedApprovalArtifactAcceptedForIntake,
    signedApprovalArtifactAcceptedAsMountAuthorization: false,
    signedApprovalRecordCreated: fixture.signedApprovalRecordCreated,
    signedApprovalRecordPresent: fixture.signedApprovalRecordPresent,
    signedApprovalRecordVerifiedForIntake: fixture.signedApprovalRecordVerifiedForIntake,
    signedApprovalRecordAcceptedForMountRequestPreparation:
      fixture.signedApprovalRecordAcceptedForMountRequestPreparation,
    signedApprovalRecordAcceptedAsRouteMountAuthorization: false,
    mountAuthorizationRequestPrepared: fixture.mountAuthorizationRequestPrepared,
    mountAuthorizationRequestSubmitted: fixture.mountAuthorizationRequestSubmitted,
    mountAuthorizationRequestSubmissionAllowed: fixture.mountAuthorizationRequestSubmissionAllowed,
    mountAuthorizationRequestSubmissionMode: fixture.mountAuthorizationRequestSubmissionMode,
    externalMountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestStatus: fixture.mountAuthorizationRequestStatus,
    finalPreMountAuthorizationDecisionReviewPrepared:
      fixture.finalPreMountAuthorizationDecisionReviewPrepared,
    finalPreMountAuthorizationDecisionReviewStatus:
      fixture.finalPreMountAuthorizationDecisionReviewStatus,
    finalPreMountAuthorizationDecisionPrepared: fixture.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    preMountAuthorization:
      MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    humanAuthorizationRequired: fixture.humanAuthorizationRequired,
    separateRouteMountApprovalRequired: fixture.separateRouteMountApprovalRequired,
    nextPhaseRequiresSeparateAuthorization: fixture.nextPhaseRequiresSeparateAuthorization,
    removedMountBlockers: REMOVED_MOUNT_BLOCKERS.slice(),
    remainingMountBlockers: REMAINING_MOUNT_BLOCKERS.slice(),
    blockers,
  };
}

function evaluateMountAuthorizationRequestSubmissionFinalDecisionReview(
  input = buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput()
) {
  return buildMountAuthorizationRequestSubmissionFinalDecisionReviewSummary(input);
}

function validateMountAuthorizationRequestSubmissionFinalDecisionReview(
  input = buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput()
) {
  const summary = buildMountAuthorizationRequestSubmissionFinalDecisionReviewSummary(input);
  return {
    mountAuthorizationRequestSubmissionFinalDecisionReviewValidationResult:
      summary.mountAuthorizationRequestSubmissionFinalDecisionReviewResult,
    valid: summary.mountAuthorizationRequestSubmissionFinalDecisionReviewResult === PASS,
    removedMountBlockers: summary.removedMountBlockers.slice(),
    remainingMountBlockers: summary.remainingMountBlockers.slice(),
    blockers: summary.blockers.slice(),
  };
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  PRIVATE_OFF_REPO,
  STATIC_INTERNAL_METADATA_ONLY,
  SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
  PENDING_FINAL_PRE_MOUNT_DECISION,
  MOUNT_AUTHORIZATION_REQUEST_SUBMITTED_PENDING_FINAL_PRE_MOUNT_DECISION,
  NOT_AUTHORIZED_FOR_MOUNT,
  OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_FINAL_DECISION_REVIEW_BOUNDARY_STATUS,
  buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput,
  evaluateMountAuthorizationRequestSubmissionFinalDecisionReview,
  validateMountAuthorizationRequestSubmissionFinalDecisionReview,
  buildMountAuthorizationRequestSubmissionFinalDecisionReviewSummary,
  normalizeMountAuthorizationRequestArtifactSha256Chunks,
};
