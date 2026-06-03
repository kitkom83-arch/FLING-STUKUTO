"use strict";

const PHASE = "ORO-4R";
const GATE = "oroplay_callback_staging_route_signed_approval_artifact_private_hash_registry";
const PASS = "PASS";
const FAIL = "FAIL";
const PRIVATE_OFF_REPO = "private_off_repo";
const SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD =
  "signed_artifact_hash_registered_pending_approval_record";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";

const OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY_STATUS = Object.freeze({
  PASS,
  FAIL,
  PRIVATE_OFF_REPO,
  SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD,
  NOT_AUTHORIZED_FOR_MOUNT,
  HASH_REGISTERED_PENDING_APPROVAL_RECORD: "hash_registered_pending_approval_record",
  PRIVATE_ARTIFACT_ONLY: "private_artifact_only",
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

const REMOVED_MOUNT_BLOCKERS = Object.freeze(["missing_actual_signed_approval_artifact"]);

const REMAINING_MOUNT_BLOCKERS = Object.freeze([
  "missing_signed_approval_record",
  "final_pre_mount_authorization_decision_not_issued",
  "mount_authorization_request_not_submitted",
  "route_mount_authorization_not_granted",
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

function readArray(source, key, fallback) {
  if (isPlainObject(source) && Array.isArray(source[key])) return source[key].slice();
  return fallback.slice();
}

function buildSignedApprovalArtifactPrivateHashRegistryInput(overrides = {}) {
  const baseline = {
    id: "baselineOwnerSignedApprovalArtifactPrivateHashFixture",
    phase: PHASE,
    documentMetadata: {
      documentId: "PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001",
      artifactFileName: "PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
      artifactStorage: PRIVATE_OFF_REPO,
      sanitizedPrivateStorageRef:
        "private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
      artifactCommittedToRepo: false,
      signatureCommittedToRepo: false,
      ownerIdentity: "stored_in_private_artifact_only",
      approvalOwnerRole: "Project Owner / Sole Owner",
      approvalDate: "2026-06-03",
      baselineCommit: "f97bdb7b109b55aa28960c0c1e544a95279f1386",
      baselineSafeCiRunId: 26891982447,
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
      present: false,
      separateSignedApprovalRecordPhaseCompleted: false,
    },
    finalPreMountAuthorizationDecision: {
      prepared: true,
      issued: false,
    },
    mountAuthorizationEvidencePack: {
      prepared: true,
      submitted: false,
    },
    mountAuthorizationRequest: {
      submitted: false,
    },
    authorizationState: {
      preMountAuthorization: SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD,
      routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
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
    attemptedAuthorizationStates: {
      actualSignedApprovalArtifactSource: "private_off_repo_owner_provided_metadata",
      liveRouteAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
    },
    trace: {
      mode: "static-mock-private-hash-registry",
      safeValue: "mock-no-secret",
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeSignedApprovalArtifactSha256Chunks(chunks) {
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
  const baseline = buildSignedApprovalArtifactPrivateHashRegistryInput();
  const merged = deepMerge(baseline, source);
  const metadata = isPlainObject(merged.documentMetadata) ? merged.documentMetadata : {};
  const evidence = isPlainObject(merged.privateArtifactEvidence) ? merged.privateArtifactEvidence : {};
  const record = isPlainObject(merged.signedApprovalRecord) ? merged.signedApprovalRecord : {};
  const decision = isPlainObject(merged.finalPreMountAuthorizationDecision)
    ? merged.finalPreMountAuthorizationDecision
    : {};
  const evidencePack = isPlainObject(merged.mountAuthorizationEvidencePack)
    ? merged.mountAuthorizationEvidencePack
    : {};
  const request = isPlainObject(merged.mountAuthorizationRequest) ? merged.mountAuthorizationRequest : {};
  const state = isPlainObject(merged.authorizationState) ? merged.authorizationState : {};
  const candidates = isPlainObject(merged.approvalCandidates) ? merged.approvalCandidates : {};
  const chat = isPlainObject(candidates.chatApproval) ? candidates.chatApproval : {};
  const plainText = isPlainObject(candidates.plainTextApproval) ? candidates.plainTextApproval : {};
  const mock = isPlainObject(candidates.mockSignedApprovalArtifact) ? candidates.mockSignedApprovalArtifact : {};

  const sha256Chunks = readArray(metadata, "sha256Chunks", BASELINE_SHA256_CHUNKS);
  const normalizedHash = normalizeSignedApprovalArtifactSha256Chunks(sha256Chunks);

  return {
    rawInput: merged,
    id: readString(merged, "id", baseline.id),
    phase: readString(merged, "phase", PHASE),
    documentId: readString(merged, "documentId", readString(metadata, "documentId", baseline.documentMetadata.documentId)),
    artifactFileName: readString(
      merged,
      "artifactFileName",
      readString(metadata, "artifactFileName", baseline.documentMetadata.artifactFileName)
    ),
    artifactStorage: readString(
      merged,
      "artifactStorage",
      readString(metadata, "artifactStorage", PRIVATE_OFF_REPO)
    ),
    sanitizedPrivateStorageRef: readString(
      merged,
      "sanitizedPrivateStorageRef",
      readString(metadata, "sanitizedPrivateStorageRef", baseline.documentMetadata.sanitizedPrivateStorageRef)
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
    ownerIdentity: readString(metadata, "ownerIdentity", baseline.documentMetadata.ownerIdentity),
    approvalOwnerRole: readString(metadata, "approvalOwnerRole", baseline.documentMetadata.approvalOwnerRole),
    approvalDate: readString(metadata, "approvalDate", baseline.documentMetadata.approvalDate),
    baselineCommit: readString(metadata, "baselineCommit", baseline.documentMetadata.baselineCommit),
    baselineSafeCiRunId: metadata.baselineSafeCiRunId || baseline.documentMetadata.baselineSafeCiRunId,
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
    signedApprovalRecordPresent: readBoolean(
      merged,
      "signedApprovalRecordPresent",
      readBoolean(record, "present", false)
    ),
    separateSignedApprovalRecordPhaseCompleted: readBoolean(
      record,
      "separateSignedApprovalRecordPhaseCompleted",
      false
    ),
    finalPreMountAuthorizationDecisionPrepared: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionPrepared",
      readBoolean(decision, "prepared", true)
    ),
    finalPreMountAuthorizationDecisionIssued: readBoolean(
      merged,
      "finalPreMountAuthorizationDecisionIssued",
      readBoolean(decision, "issued", false)
    ),
    mountAuthorizationEvidencePackPrepared: readBoolean(
      merged,
      "mountAuthorizationEvidencePackPrepared",
      readBoolean(evidencePack, "prepared", true)
    ),
    mountAuthorizationEvidencePackSubmitted: readBoolean(
      merged,
      "mountAuthorizationEvidencePackSubmitted",
      readBoolean(evidencePack, "submitted", false)
    ),
    mountAuthorizationRequestSubmitted: readBoolean(
      merged,
      "mountAuthorizationRequestSubmitted",
      readBoolean(request, "submitted", false)
    ),
    preMountAuthorization: readString(
      merged,
      "preMountAuthorization",
      readString(state, "preMountAuthorization", SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD)
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
    attemptedAuthorizationStates: isPlainObject(merged.attemptedAuthorizationStates)
      ? merged.attemptedAuthorizationStates
      : {},
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  const attemptedSource = String(fixture.attemptedAuthorizationStates.actualSignedApprovalArtifactSource || "");
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
    blockers.push("owner signed approval artifact private hash must be registered");
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
  if (fixture.signedApprovalRecordPresent && !fixture.separateSignedApprovalRecordPhaseCompleted) {
    blockers.push("signed approval record cannot be present before separate signed approval record phase");
  }
  if (fixture.finalPreMountAuthorizationDecisionIssued) {
    blockers.push("final pre-mount authorization decision must not be issued in ORO-4R");
  }
  if (!fixture.finalPreMountAuthorizationDecisionPrepared) {
    blockers.push("final pre-mount authorization decision pack must remain prepared");
  }
  if (!fixture.mountAuthorizationEvidencePackPrepared) {
    blockers.push("mount authorization evidence pack must remain prepared");
  }
  if (fixture.mountAuthorizationEvidencePackSubmitted) {
    blockers.push("mount authorization evidence pack must not be submitted in ORO-4R");
  }
  if (fixture.mountAuthorizationRequestSubmitted) {
    blockers.push("mount authorization request must not be submitted in ORO-4R");
  }
  if (fixture.preMountAuthorization !== SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD) {
    blockers.push("pre-mount authorization must remain hash registered pending approval record");
  }
  if (fixture.routeMountAuthorization !== NOT_AUTHORIZED_FOR_MOUNT) {
    blockers.push("route mount authorization must remain not authorized for mount");
  }
  if (fixture.expressMountAllowed) {
    blockers.push("Express mount is not allowed in ORO-4R");
  }
  if (fixture.publicAliasAllowed) {
    blockers.push("public alias is not allowed in ORO-4R");
  }
  if (fixture.runtimeTrafficAllowed) {
    blockers.push("runtime traffic is not allowed in ORO-4R");
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
  if (fixture.chatApprovalCountedAsSignedApprovalArtifact || attemptedSource === "chat_approval") {
    blockers.push("chat approval cannot be counted as signed approval artifact");
  }
  if (fixture.plainTextApprovalCountedAsSignedApprovalArtifact || attemptedSource === "plain_text_approval") {
    blockers.push("plain text approval cannot be counted as signed approval artifact");
  }
  if (fixture.mockSignedApprovalArtifactAcceptedAsActualAuthorization || attemptedSource === "mock_signed_artifact") {
    blockers.push("mock artifact cannot be accepted as actual signed approval artifact");
  }
  if (!fixture.mockSignedApprovalArtifactReviewOnly) {
    blockers.push("mock artifact must remain review-only");
  }

  for (const marker of collectForbiddenAllowedMarkers(fixture.attemptedAuthorizationStates)) {
    blockers.push(`forbidden runtime authorization marker present: ${marker}`);
  }

  return blockers;
}

function buildSignedApprovalArtifactPrivateHashRegistrySummary(
  input = buildSignedApprovalArtifactPrivateHashRegistryInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  const normalizedHash = fixture.normalizedHash;

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    signedApprovalArtifactPrivateHashRegistryResult: blockers.length === 0 ? PASS : FAIL,
    documentId: fixture.documentId,
    artifactFileName: fixture.artifactFileName,
    artifactStorage: fixture.artifactStorage,
    sanitizedPrivateStorageRef: fixture.sanitizedPrivateStorageRef,
    ownerIdentity: fixture.ownerIdentity,
    approvalOwnerRole: fixture.approvalOwnerRole,
    approvalDate: fixture.approvalDate,
    baselineCommit: fixture.baselineCommit,
    baselineSafeCiRunId: fixture.baselineSafeCiRunId,
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
    signedApprovalRecordPresent: false,
    finalPreMountAuthorizationDecisionPrepared: fixture.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    mountAuthorizationEvidencePackPrepared: fixture.mountAuthorizationEvidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    preMountAuthorization: SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD,
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

function evaluateSignedApprovalArtifactPrivateHashRegistry(
  input = buildSignedApprovalArtifactPrivateHashRegistryInput()
) {
  return buildSignedApprovalArtifactPrivateHashRegistrySummary(input);
}

function validateSignedApprovalArtifactPrivateHashRegistry(
  input = buildSignedApprovalArtifactPrivateHashRegistryInput()
) {
  const summary = buildSignedApprovalArtifactPrivateHashRegistrySummary(input);
  return {
    signedApprovalArtifactPrivateHashRegistryValidationResult:
      summary.signedApprovalArtifactPrivateHashRegistryResult,
    valid: summary.signedApprovalArtifactPrivateHashRegistryResult === PASS,
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
  SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD,
  NOT_AUTHORIZED_FOR_MOUNT,
  OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY_STATUS,
  buildSignedApprovalArtifactPrivateHashRegistryInput,
  evaluateSignedApprovalArtifactPrivateHashRegistry,
  validateSignedApprovalArtifactPrivateHashRegistry,
  buildSignedApprovalArtifactPrivateHashRegistrySummary,
  normalizeSignedApprovalArtifactSha256Chunks,
};
