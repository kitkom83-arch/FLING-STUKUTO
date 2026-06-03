"use strict";

const PHASE = "ORO-4P";
const GATE =
  "oroplay_callback_staging_route_signed_approval_artifact_acceptance_review_final_pre_mount_authorization_decision_boundary";
const PASS = "PASS";
const FAIL = "FAIL";
const PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT = "pending_actual_signed_approval_artifact";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT =
  "review_boundary_passed_pending_actual_signed_approval_artifact";
const DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT =
  "decision_pack_prepared_pending_actual_signed_approval_artifact";
const ACCEPTANCE_REVIEW_CONTRACT_MISSING = "signed_approval_artifact_acceptance_review_contract_missing";
const FINAL_DECISION_BOUNDARY_MISSING = "final_pre_mount_authorization_decision_boundary_missing";
const MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_ONLY = "mock_signed_approval_artifact_review_only";
const INVALID_SIGNED_APPROVAL_ARTIFACT_REVIEW_SCHEMA = "invalid_signed_approval_artifact_review_schema";
const DECISION_VALIDATION_FAILED = "decision_validation_failed";

const OROPLAY_SIGNED_APPROVAL_ARTIFACT_ACCEPTANCE_REVIEW_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY_STATUS =
  Object.freeze({
    PASS,
    FAIL,
    PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    NOT_AUTHORIZED_FOR_MOUNT,
    REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    ACCEPTANCE_REVIEW_CONTRACT_MISSING,
    FINAL_DECISION_BOUNDARY_MISSING,
    MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_ONLY,
    INVALID_SIGNED_APPROVAL_ARTIFACT_REVIEW_SCHEMA,
    DECISION_VALIDATION_FAILED,
  });

const REQUIRED_ACCEPTANCE_REVIEW_CONTRACT_FIELDS = Object.freeze([
  "artifactType",
  "phaseReference",
  "projectName",
  "repository",
  "branch",
  "sourceArtifactIntakeBoundaryPhase",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "artifactDigest",
  "acceptanceReviewerIdentity",
  "reviewedAt",
  "decision",
  "mockArtifactPolicy",
  "chatApprovalPolicy",
  "plainTextApprovalPolicy",
  "evidencePackPolicy",
  "finalDecisionPolicy",
  "separateRouteMountApprovalRequired",
  "nextPhaseRequiresSeparateAuthorization",
]);

const REQUIRED_FINAL_DECISION_BOUNDARY_FIELDS = Object.freeze([
  "decisionBoundaryType",
  "phaseReference",
  "sourceAcceptanceReviewPolicy",
  "decisionPackPrepared",
  "decisionIssued",
  "decisionStatus",
  "mountAuthorizationEvidencePackPrepared",
  "mountAuthorizationEvidencePackSubmitted",
  "mountAuthorizationRequestSubmitted",
  "preMountAuthorization",
  "routeMountAuthorization",
  "expressMountAllowed",
  "publicAliasAllowed",
  "runtimeTrafficAllowed",
  "humanAuthorizationRequired",
  "separateRouteMountApprovalRequired",
  "nextPhaseRequiresSeparateAuthorization",
  "runtimeRoutePolicy",
  "publicAliasPolicy",
  "walletMutationPolicy",
  "ledgerMutationPolicy",
  "prismaWritePolicy",
]);

const REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_FIELDS = Object.freeze([
  "artifactType",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "artifactDigest",
  "acceptanceReviewerIdentity",
  "finalDecisionReviewerIdentity",
]);

const ACCEPTANCE_REVIEW_DECISION_OPTIONS = Object.freeze([
  "changes_requested",
  "pending_actual_signed_approval_artifact",
  "review_boundary_only",
  "not_authorized_for_mount",
]);

const FINAL_DECISION_STATUS_OPTIONS = Object.freeze([
  DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  "decision_blocked_missing_acceptance_review_contract",
  "decision_blocked_missing_boundary_contract",
  "decision_blocked_by_safety_boundary",
]);

const FORBIDDEN_AUTHORIZATION_VALUES = Object.freeze([
  ["ap", "proved"].join(""),
  ["mount", "ap", "proved"].join("_"),
  ["ready", "for", "live", "traffic"].join("_"),
  ["production", "ready"].join("_"),
  ["live", "ready"].join("_"),
  ["auto", "ap", "proved"].join("_"),
  ["route", "mount", "authorized"].join("_"),
  ["express", "mount", "authorized"].join("_"),
  "authorized",
  "submitted",
  "issued",
]);

const SAFETY_EXPECTATIONS = Object.freeze([
  ["srcAppJsChangeAbsent", "src/app.js change present"],
  ["expressMountAbsent", "express mount present"],
  ["publicAliasAbsent", "public alias present"],
  ["activeRouteAbsent", "active route present"],
  ["httpListenerAbsent", "http listener present"],
  ["runtimeTrafficAbsent", "runtime traffic present"],
  ["walletMutationAbsent", "walletMutation present"],
  ["ledgerMutationAbsent", "ledgerMutation present"],
  ["prismaWriteAbsent", "prismaWrite present"],
  ["dbTransactionAbsent", "db transaction present"],
  ["externalNetworkAbsent", "externalNetwork present"],
  ["liveOroPlayApiCallAbsent", "live OroPlay API call present"],
  ["migrationAbsent", "migration present"],
  ["realMoneyAbsent", "real money present"],
]);

const DEFAULT_REVIEWED_AT = "2026-06-03T00:00:00.000Z";
const MAX_ACCEPTANCE_REVIEW_AGE_DAYS = 30;
const SHA256_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/i;

const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|privatekey|apikey|api-key|cookie|set-cookie|x-api-key|signature|signedapproval|approvalsignature|signedrecordreference|signedartifactreference|artifactdigest|artifacthash/i;

const SENSITIVE_TEXT_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|database_url|databaseurl|private\s*key|privatekey|api\s*key|apikey|api-key|cookie|set-cookie|x-api-key|signature|signed\s*approval|signedapproval|approval\s*signature|approvalsignature|signed\s*record|signedrecordreference|signed\s*artifact|signedartifactreference|artifact\s*digest|artifactdigest/i;

const SECRET_SHAPED_PATTERNS = Object.freeze([
  new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
  new RegExp(`${["Ba", "sic"].join("")}\\s+\\S+`, "i"),
  /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
  /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  /DATABASE_URL\s*[:=]/i,
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toStringList(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function fieldPresent(value) {
  if (hasText(value)) return true;
  if (isPlainObject(value)) return value.present !== false && Object.keys(value).length > 0;
  return value === true;
}

function parseTime(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function daysBetween(startIso, endIso) {
  const start = parseTime(startIso);
  const end = parseTime(endIso);
  if (start === null || end === null) return null;
  return Math.abs(end - start) / (1000 * 60 * 60 * 24);
}

function collectStringValues(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStringValues(entry, output);
    return output;
  }
  if (isPlainObject(value)) {
    for (const entry of Object.values(value)) collectStringValues(entry, output);
  }
  return output;
}

function sanitizeScalar(value) {
  if (typeof value !== "string") return value;
  if (SENSITIVE_TEXT_PATTERN.test(value)) return "[MASKED]";

  let output = value;
  for (const pattern of SECRET_SHAPED_PATTERNS) {
    output = output.replace(pattern, "[MASKED]");
  }
  return output;
}

function sanitizeBoundaryTrace(value) {
  if (Array.isArray(value)) return value.map((entry) => sanitizeBoundaryTrace(entry));
  if (!isPlainObject(value)) return sanitizeScalar(value);

  const output = {};
  let maskedFieldCount = 0;
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      maskedFieldCount += 1;
      continue;
    }
    output[key] = sanitizeBoundaryTrace(entry);
  }
  if (maskedFieldCount > 0) output.maskedFieldCount = maskedFieldCount;
  return output;
}

function hasSecretShapedValue(value) {
  return collectStringValues(value).some(
    (entry) => SENSITIVE_TEXT_PATTERN.test(entry) || SECRET_SHAPED_PATTERNS.some((pattern) => pattern.test(entry))
  );
}

function sourcePresent(source) {
  if (source === true) return true;
  if (!isPlainObject(source)) return false;
  if (source.present === false) return false;
  return source.present === true || source.status === "present" || source.result === PASS;
}

function safetyFlag(fixture, key) {
  return fixture.staticSafetyChecks[key] === true;
}

function buildSafetySummary(fixture) {
  return {
    srcAppJsChange: safetyFlag(fixture, "srcAppJsChangeAbsent") ? "absent" : "present",
    expressMount: safetyFlag(fixture, "expressMountAbsent") ? "absent" : "present",
    publicAlias: safetyFlag(fixture, "publicAliasAbsent") ? "absent" : "present",
    activeRoute: safetyFlag(fixture, "activeRouteAbsent") ? "absent" : "present",
    httpListener: safetyFlag(fixture, "httpListenerAbsent") ? "absent" : "present",
    runtimeTraffic: safetyFlag(fixture, "runtimeTrafficAbsent") ? "absent" : "present",
    walletMutation: safetyFlag(fixture, "walletMutationAbsent") ? "absent" : "present",
    ledgerMutation: safetyFlag(fixture, "ledgerMutationAbsent") ? "absent" : "present",
    prismaWrite: safetyFlag(fixture, "prismaWriteAbsent") ? "absent" : "present",
    dbTransaction: safetyFlag(fixture, "dbTransactionAbsent") ? "absent" : "present",
    externalNetwork: safetyFlag(fixture, "externalNetworkAbsent") ? "absent" : "present",
    liveOroPlayApiCall: safetyFlag(fixture, "liveOroPlayApiCallAbsent") ? "absent" : "present",
    migration: safetyFlag(fixture, "migrationAbsent") ? "absent" : "present",
    realMoney: safetyFlag(fixture, "realMoneyAbsent") ? "absent" : "present",
  };
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  return {
    id: String(source.id || "unnamed-signed-approval-artifact-acceptance-review-decision-boundary-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    signedApprovalArtifactAcceptanceReviewContract: isPlainObject(
      source.signedApprovalArtifactAcceptanceReviewContract
    )
      ? source.signedApprovalArtifactAcceptanceReviewContract
      : {},
    finalPreMountAuthorizationDecisionBoundaryContract: isPlainObject(
      source.finalPreMountAuthorizationDecisionBoundaryContract
    )
      ? source.finalPreMountAuthorizationDecisionBoundaryContract
      : {},
    signedApprovalRecord: source.signedApprovalRecord,
    actualSignedApprovalArtifact: source.actualSignedApprovalArtifact,
    signedApprovalArtifact: source.signedApprovalArtifact,
    mockSignedApprovalArtifact: source.mockSignedApprovalArtifact,
    chatApprovalCandidate: source.chatApprovalCandidate,
    plainTextApprovalCandidate: source.plainTextApprovalCandidate,
    mountAuthorizationEvidencePack: isPlainObject(source.mountAuthorizationEvidencePack)
      ? source.mountAuthorizationEvidencePack
      : {},
    mountAuthorizationRequest: isPlainObject(source.mountAuthorizationRequest) ? source.mountAuthorizationRequest : {},
    finalPreMountAuthorizationDecisionPack: isPlainObject(source.finalPreMountAuthorizationDecisionPack)
      ? source.finalPreMountAuthorizationDecisionPack
      : {},
    attemptedAuthorizationStates: isPlainObject(source.attemptedAuthorizationStates)
      ? source.attemptedAuthorizationStates
      : {},
    reviewedAt: hasText(source.reviewedAt) ? source.reviewedAt : DEFAULT_REVIEWED_AT,
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function buildSignedApprovalArtifactAcceptanceReviewContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_ACCEPTANCE_REVIEW_CONTRACT_FIELDS.slice(),
    decisionOptions: ACCEPTANCE_REVIEW_DECISION_OPTIONS.slice(),
    defaultDecision: "pending_actual_signed_approval_artifact",
    mockArtifactPolicy: "review_only_schema_only_metadata_only",
    chatApprovalPolicy: "not_signed_approval_artifact",
    plainTextApprovalPolicy: "not_signed_approval_artifact",
    evidencePackPolicy: "prepared_not_submitted_not_authorization",
    finalDecisionPolicy: "prepared_not_issued_without_actual_signed_approval_artifact",
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildFinalPreMountAuthorizationDecisionBoundaryContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_FINAL_DECISION_BOUNDARY_FIELDS.slice(),
    decisionStatusOptions: FINAL_DECISION_STATUS_OPTIONS.slice(),
    defaultDecisionStatus: DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    sourceAcceptanceReviewPolicy: "actual_signed_approval_artifact_required_before_issued_decision",
    decisionPackPrepared: true,
    decisionIssued: false,
    mountAuthorizationEvidencePackPrepared: true,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildMockSignedApprovalArtifactAcceptanceReviewFixture(overrides = {}) {
  return {
    present: true,
    mock: true,
    reviewOnly: true,
    schemaOnly: true,
    metadataOnly: true,
    artifactType: "mock_signed_approval_artifact_acceptance_review_metadata",
    signerIdentity: "mock-human-signer",
    signedAt: "2026-06-02T10:00:00.000Z",
    approvalScope: "pre_mount_acceptance_review_only",
    artifactDigest: `sha256:${"b".repeat(64)}`,
    acceptanceReviewerIdentity: "mock-acceptance-reviewer",
    finalDecisionReviewerIdentity: "mock-final-decision-reviewer",
    ...overrides,
  };
}

function validateAcceptanceReviewContract(contract) {
  const fields = toStringList(contract.fields);
  const decisionOptions = toStringList(contract.decisionOptions);
  const missingFields = REQUIRED_ACCEPTANCE_REVIEW_CONTRACT_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionOptions = decisionOptions.filter(
    (option) => !ACCEPTANCE_REVIEW_DECISION_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
  );
  const present = contract.present === true && missingFields.length === 0 && invalidDecisionOptions.length === 0;

  return {
    present,
    fields,
    decisionOptions,
    missingFields,
    invalidDecisionOptions,
  };
}

function validateFinalDecisionBoundaryContract(contract) {
  const fields = toStringList(contract.fields);
  const decisionStatusOptions = toStringList(contract.decisionStatusOptions);
  const missingFields = REQUIRED_FINAL_DECISION_BOUNDARY_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionStatusOptions = decisionStatusOptions.filter(
    (option) => !FINAL_DECISION_STATUS_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
  );
  const present = contract.present === true && missingFields.length === 0 && invalidDecisionStatusOptions.length === 0;

  return {
    present,
    fields,
    decisionStatusOptions,
    missingFields,
    invalidDecisionStatusOptions,
  };
}

function validateSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryContract(input) {
  const fixture = normalizeInput(input);
  const signedApprovalArtifactAcceptanceReviewContract = validateAcceptanceReviewContract(
    fixture.signedApprovalArtifactAcceptanceReviewContract
  );
  const finalPreMountAuthorizationDecisionBoundaryContract = validateFinalDecisionBoundaryContract(
    fixture.finalPreMountAuthorizationDecisionBoundaryContract
  );
  const blockers = [];

  if (!signedApprovalArtifactAcceptanceReviewContract.present) {
    blockers.push("missing signed approval artifact acceptance review contract");
    for (const field of signedApprovalArtifactAcceptanceReviewContract.missingFields) {
      blockers.push(`missing signed approval artifact acceptance review contract field: ${field}`);
    }
    for (const option of signedApprovalArtifactAcceptanceReviewContract.invalidDecisionOptions) {
      blockers.push(`invalid signed approval artifact acceptance review decision option: ${option}`);
    }
  }

  if (!finalPreMountAuthorizationDecisionBoundaryContract.present) {
    blockers.push("missing final pre-mount authorization decision boundary contract");
    for (const field of finalPreMountAuthorizationDecisionBoundaryContract.missingFields) {
      blockers.push(`missing final pre-mount authorization decision boundary field: ${field}`);
    }
    for (const option of finalPreMountAuthorizationDecisionBoundaryContract.invalidDecisionStatusOptions) {
      blockers.push(`invalid final pre-mount authorization decision status option: ${option}`);
    }
  }

  return {
    signedApprovalArtifactAcceptanceReviewContract,
    finalPreMountAuthorizationDecisionBoundaryContract,
    signedApprovalArtifactAcceptanceReviewContractPresent: signedApprovalArtifactAcceptanceReviewContract.present,
    finalPreMountAuthorizationDecisionBoundaryPresent: finalPreMountAuthorizationDecisionBoundaryContract.present,
    blockers,
  };
}

function evaluateSourceArtifactIntakeBoundary(input) {
  const fixture = normalizeInput(input);
  const source = fixture.evidenceSources.signedApprovalArtifactIntakeBoundary;
  const present =
    sourcePresent(source) &&
    String(source.phase || "").toUpperCase() === "ORO-4O" &&
    source.signedApprovalArtifactIntakeBoundaryResult === PASS &&
    source.signedApprovalArtifactIntakeContractPresent === true &&
    source.preMountHumanApprovalEvidenceBoundaryPresent === true &&
    source.actualSignedApprovalArtifactPresent === false &&
    source.signedApprovalRecordPresent === false &&
    source.signedApprovalArtifactAccepted === false &&
    source.signedApprovalArtifactVerified === false &&
    source.mountAuthorizationEvidencePackSubmitted === false &&
    source.mountAuthorizationRequestSubmitted === false &&
    source.routeMountAuthorization === NOT_AUTHORIZED_FOR_MOUNT;

  return {
    signedApprovalArtifactIntakeBoundaryPresent: present,
    blockers: present ? [] : ["ORO-4O signed approval artifact intake boundary missing"],
  };
}

function evaluateActualSignedApprovalArtifactPresence(input) {
  const fixture = normalizeInput(input);
  const artifact = isPlainObject(fixture.actualSignedApprovalArtifact)
    ? fixture.actualSignedApprovalArtifact
    : fixture.signedApprovalArtifact;
  const actualSignedApprovalArtifactSupplied =
    isPlainObject(artifact) &&
    artifact.present === true &&
    (artifact.actual === true || String(artifact.kind || "").toLowerCase() === "actual");
  const blockers = [];

  if (actualSignedApprovalArtifactSupplied) {
    blockers.push("actual signed approval artifact not accepted in ORO-4P acceptance review boundary");
  }

  return {
    actualSignedApprovalArtifactSupplied,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    actualSignedApprovalArtifactPresenceStatus: actualSignedApprovalArtifactSupplied
      ? "actual_signed_approval_artifact_supplied_but_not_accepted"
      : "absent",
    blockers,
  };
}

function approvalCandidatePresent(candidate) {
  if (candidate === true) return true;
  if (!isPlainObject(candidate)) return false;
  return candidate.present === true || hasText(candidate.text) || hasText(candidate.message) || hasText(candidate.value);
}

function evaluateChatApprovalNotSignedArtifact(input) {
  const fixture = normalizeInput(input);
  const chatPresent = approvalCandidatePresent(fixture.chatApprovalCandidate);
  const blockers = [];

  if (chatPresent) blockers.push("chat approval is not signed approval artifact");

  return {
    chatApprovalPresent: chatPresent,
    chatApprovalCountedAsSignedApprovalArtifact: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blockers,
  };
}

function evaluatePlainTextApprovalNotSignedArtifact(input) {
  const fixture = normalizeInput(input);
  const plainTextPresent = approvalCandidatePresent(fixture.plainTextApprovalCandidate);
  const blockers = [];

  if (plainTextPresent) blockers.push("plain text approval is not signed approval artifact");

  return {
    plainTextApprovalPresent: plainTextPresent,
    plainTextApprovalCountedAsSignedApprovalArtifact: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blockers,
  };
}

function validateMockSignedApprovalArtifactReviewOnly(input) {
  const fixture = normalizeInput(input);
  const artifact = isPlainObject(input) && Object.prototype.hasOwnProperty.call(input, "mockSignedApprovalArtifact")
    ? fixture.mockSignedApprovalArtifact
    : input;

  if (!isPlainObject(artifact) || artifact.present === false) {
    return {
      mockSignedApprovalArtifactProvided: false,
      mockSignedApprovalArtifactReviewOnly: false,
      mockSignedApprovalArtifactSchemaOnly: false,
      mockSignedApprovalArtifactMetadataOnly: false,
      mockSignedApprovalArtifactReviewValid: false,
      missingFields: REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_FIELDS.slice(),
      invalidArtifactDigestFormat: false,
      routeMountScopeRequested: false,
      staleTimestamp: false,
      malformed: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      blockers: [],
      notes: [],
    };
  }

  const missingFields = REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_FIELDS.filter(
    (field) => !fieldPresent(artifact[field])
  );
  const malformed =
    artifact.malformed === true ||
    artifact.artifactType !== "mock_signed_approval_artifact_acceptance_review_metadata";
  const artifactDigestPresent = fieldPresent(artifact.artifactDigest);
  const invalidArtifactDigestFormat =
    artifactDigestPresent && !SHA256_DIGEST_PATTERN.test(String(artifact.artifactDigest));
  const signedAtTime = parseTime(artifact.signedAt);
  const staleAgeDays = signedAtTime === null ? null : daysBetween(artifact.signedAt, fixture.reviewedAt);
  const staleTimestamp = staleAgeDays !== null && staleAgeDays > MAX_ACCEPTANCE_REVIEW_AGE_DAYS;
  const routeMountScopeRequested = String(artifact.approvalScope || "").toLowerCase().includes("route_mount");
  const blockers = [];
  const notes = [];

  if (malformed) blockers.push("malformed signed approval artifact review metadata schema");
  for (const field of missingFields) blockers.push(`missing mock signed approval artifact review field: ${field}`);
  if (signedAtTime === null && !missingFields.includes("signedAt")) blockers.push("invalid signedAt timestamp");
  if (invalidArtifactDigestFormat) blockers.push("invalid mock signed approval artifact digest format");
  if (staleTimestamp) blockers.push("stale signed approval artifact timestamp");

  const mockSignedApprovalArtifactReviewValid = blockers.length === 0;

  if (mockSignedApprovalArtifactReviewValid) {
    notes.push("mock signed approval artifact metadata is review-only schema-only metadata-only input");
  }
  if (routeMountScopeRequested) {
    notes.push("route mount scope in mock artifact metadata is not actual authorization");
  }

  return {
    mockSignedApprovalArtifactProvided: true,
    mockSignedApprovalArtifactReviewOnly: mockSignedApprovalArtifactReviewValid,
    mockSignedApprovalArtifactSchemaOnly: mockSignedApprovalArtifactReviewValid,
    mockSignedApprovalArtifactMetadataOnly: mockSignedApprovalArtifactReviewValid,
    mockSignedApprovalArtifactReviewValid,
    mockSignedApprovalArtifactStatus: MOCK_SIGNED_APPROVAL_ARTIFACT_REVIEW_ONLY,
    missingFields,
    invalidArtifactDigestFormat,
    routeMountScopeRequested,
    staleTimestamp,
    malformed,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blockers,
    notes,
  };
}

function evaluateSignedApprovalArtifactAcceptanceReview(input) {
  const contract = validateSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryContract(input);
  const actual = evaluateActualSignedApprovalArtifactPresence(input);
  const chat = evaluateChatApprovalNotSignedArtifact(input);
  const plainText = evaluatePlainTextApprovalNotSignedArtifact(input);
  const mock = validateMockSignedApprovalArtifactReviewOnly(input);
  const blockers = [
    ...contract.blockers,
    ...actual.blockers,
    ...chat.blockers,
    ...plainText.blockers,
    ...mock.blockers,
  ];

  return {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalArtifactAcceptanceReviewContractPresent:
      contract.signedApprovalArtifactAcceptanceReviewContractPresent,
    finalPreMountAuthorizationDecisionBoundaryPresent:
      contract.finalPreMountAuthorizationDecisionBoundaryPresent,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    mockSignedApprovalArtifactReviewOnly: mock.mockSignedApprovalArtifactReviewOnly,
    mockSignedApprovalArtifactSchemaOnly: mock.mockSignedApprovalArtifactSchemaOnly,
    mockSignedApprovalArtifactMetadataOnly: mock.mockSignedApprovalArtifactMetadataOnly,
    acceptanceReviewStatus: REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    blockers,
    notes: mock.notes,
  };
}

function evaluateSignedApprovalArtifactVerificationOutcome(input) {
  const actual = evaluateActualSignedApprovalArtifactPresence(input);
  return {
    signedApprovalArtifactVerified: false,
    actualSignedApprovalArtifactPresent: false,
    verificationStatus: "pending_actual_signed_approval_artifact",
    blockers: actual.blockers.slice(),
  };
}

function hasForbiddenAuthorizationState(value) {
  if (typeof value === "boolean") return value === true;
  if (!hasText(String(value || ""))) return false;
  return FORBIDDEN_AUTHORIZATION_VALUES.includes(String(value).toLowerCase());
}

function evaluateEvidencePackReadinessForDecision(input) {
  const fixture = normalizeInput(input);
  const pack = fixture.mountAuthorizationEvidencePack;
  const request = fixture.mountAuthorizationRequest;
  const evidencePackPrepared = pack.prepared !== false;
  const evidencePackSubmitted = pack.submitted === true || String(pack.status || "").toLowerCase() === "submitted";
  const mountAuthorizationRequestSubmitted =
    request.submitted === true || String(request.status || "").toLowerCase() === "submitted";
  const evidenceAuthorizationAttempted =
    pack.authorized === true ||
    pack.approval === true ||
    hasForbiddenAuthorizationState(pack.authorizationStatus) ||
    hasForbiddenAuthorizationState(pack.status);
  const requestAuthorizationAttempted =
    request.authorized === true ||
    request.approval === true ||
    hasForbiddenAuthorizationState(request.authorizationStatus) ||
    hasForbiddenAuthorizationState(request.status);
  const blockers = [];

  if (!evidencePackPrepared) blockers.push("mount authorization evidence pack not prepared");
  if (evidencePackSubmitted) blockers.push("mount authorization evidence pack submission is blocked");
  if (mountAuthorizationRequestSubmitted) blockers.push("mount authorization request submission is blocked");
  if (evidenceAuthorizationAttempted) blockers.push("mount authorization evidence pack is not mount authorization");
  if (requestAuthorizationAttempted) blockers.push("mount authorization request is not authorization");

  return {
    mountAuthorizationEvidencePackPrepared: evidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationEvidencePackAcceptedAsMountAuthorization: false,
    mountAuthorizationEvidencePackAuthorizationAttempted: evidenceAuthorizationAttempted,
    mountAuthorizationRequestAuthorizationAttempted: requestAuthorizationAttempted,
    blockers,
  };
}

function evaluateFinalPreMountAuthorizationDecisionReadiness(input) {
  const fixture = normalizeInput(input);
  const decisionPack = fixture.finalPreMountAuthorizationDecisionPack;
  const decisionPrepared = decisionPack.prepared !== false;
  const decisionIssued = decisionPack.issued === true || String(decisionPack.status || "").toLowerCase() === "issued";
  const decisionAuthorizationAttempted =
    decisionPack.authorized === true ||
    decisionPack.approval === true ||
    hasForbiddenAuthorizationState(decisionPack.authorizationStatus) ||
    hasForbiddenAuthorizationState(decisionPack.status);
  const blockers = [];

  if (!decisionPrepared) blockers.push("final pre-mount authorization decision pack not prepared");
  if (decisionIssued || decisionAuthorizationAttempted) {
    blockers.push("final pre-mount authorization decision cannot be issued without actual signed approval artifact");
  }

  return {
    finalPreMountAuthorizationDecisionPrepared: decisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    finalPreMountAuthorizationDecisionStatus: DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    finalPreMountAuthorizationDecisionAcceptedAsAuthorization: false,
    finalPreMountAuthorizationDecisionAuthorizationAttempted: decisionAuthorizationAttempted || decisionIssued,
    blockers,
  };
}

function evaluateFinalPreMountAuthorizationDecisionNotIssued(input) {
  const readiness = evaluateFinalPreMountAuthorizationDecisionReadiness(input);
  return {
    finalPreMountAuthorizationDecisionPrepared: readiness.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    finalPreMountAuthorizationDecisionStatus: readiness.finalPreMountAuthorizationDecisionStatus,
    finalPreMountAuthorizationDecisionAcceptedAsAuthorization: false,
    blockers: readiness.blockers.slice(),
  };
}

function evaluateRouteMountAuthorizationBoundary(input) {
  const fixture = normalizeInput(input);
  const safetySummary = buildSafetySummary(fixture);
  const blockers = [];

  for (const [key, blocker] of SAFETY_EXPECTATIONS) {
    if (!safetyFlag(fixture, key)) blockers.push(blocker);
  }

  for (const [key, value] of Object.entries(fixture.attemptedAuthorizationStates)) {
    if (hasForbiddenAuthorizationState(value)) blockers.push(`forbidden authorization state: ${key}`);
  }

  return {
    safetySummary,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    expressMount: safetySummary.expressMount,
    publicAlias: safetySummary.publicAlias,
    activeRoute: safetySummary.activeRoute,
    httpListener: safetySummary.httpListener,
    runtimeTraffic: safetySummary.runtimeTraffic,
    walletMutation: safetySummary.walletMutation,
    ledgerMutation: safetySummary.ledgerMutation,
    prismaWrite: safetySummary.prismaWrite,
    dbTransaction: safetySummary.dbTransaction,
    externalNetwork: safetySummary.externalNetwork,
    liveOroPlayApiCall: safetySummary.liveOroPlayApiCall,
    realMoney: safetySummary.realMoney,
    blockers,
  };
}

function buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundarySummary(input) {
  const fixture = normalizeInput(input);
  const source = evaluateSourceArtifactIntakeBoundary(fixture);
  const contract = validateSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryContract(
    fixture
  );
  const actual = evaluateActualSignedApprovalArtifactPresence(fixture);
  const chat = evaluateChatApprovalNotSignedArtifact(fixture);
  const plainText = evaluatePlainTextApprovalNotSignedArtifact(fixture);
  const mock = validateMockSignedApprovalArtifactReviewOnly(fixture);
  const verification = evaluateSignedApprovalArtifactVerificationOutcome(fixture);
  const evidence = evaluateEvidencePackReadinessForDecision(fixture);
  const decision = evaluateFinalPreMountAuthorizationDecisionNotIssued(fixture);
  const route = evaluateRouteMountAuthorizationBoundary(fixture);
  const sanitizedTrace = sanitizeBoundaryTrace(fixture.trace);
  const blockers = [
    ...source.blockers,
    ...contract.blockers,
    ...actual.blockers,
    ...chat.blockers,
    ...plainText.blockers,
    ...mock.blockers,
    ...verification.blockers,
    ...evidence.blockers,
    ...decision.blockers,
    ...route.blockers,
  ];

  if (hasSecretShapedValue(sanitizedTrace)) {
    blockers.push("sanitized trace contains secret-shaped value");
  }

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    signedApprovalArtifactAcceptanceReviewBoundaryResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalArtifactAcceptanceReviewContractPresent:
      contract.signedApprovalArtifactAcceptanceReviewContractPresent,
    finalPreMountAuthorizationDecisionBoundaryPresent:
      contract.finalPreMountAuthorizationDecisionBoundaryPresent,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    actualSignedApprovalArtifactSupplied: actual.actualSignedApprovalArtifactSupplied,
    mockSignedApprovalArtifactReviewOnly: mock.mockSignedApprovalArtifactReviewOnly,
    mockSignedApprovalArtifactSchemaOnly: mock.mockSignedApprovalArtifactSchemaOnly,
    mockSignedApprovalArtifactMetadataOnly: mock.mockSignedApprovalArtifactMetadataOnly,
    mockSignedApprovalArtifactReviewValid: mock.mockSignedApprovalArtifactReviewValid,
    mockSignedApprovalArtifactStatus: mock.mockSignedApprovalArtifactStatus,
    acceptanceReviewStatus: REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    chatApprovalCountedAsSignedApprovalArtifact: false,
    plainTextApprovalCountedAsSignedApprovalArtifact: false,
    finalPreMountAuthorizationDecisionPrepared: decision.finalPreMountAuthorizationDecisionPrepared,
    finalPreMountAuthorizationDecisionIssued: false,
    finalPreMountAuthorizationDecisionStatus: DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    finalPreMountAuthorizationDecisionAcceptedAsAuthorization: false,
    mountAuthorizationEvidencePackPrepared: evidence.mountAuthorizationEvidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationEvidencePackAcceptedAsMountAuthorization: false,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    expressMount: route.expressMount,
    publicAlias: route.publicAlias,
    activeRoute: route.activeRoute,
    httpListener: route.httpListener,
    runtimeTraffic: route.runtimeTraffic,
    walletMutation: route.walletMutation,
    ledgerMutation: route.ledgerMutation,
    prismaWrite: route.prismaWrite,
    dbTransaction: route.dbTransaction,
    externalNetwork: route.externalNetwork,
    liveOroPlayApiCall: route.liveOroPlayApiCall,
    realMoney: route.realMoney,
    notes: mock.notes,
    blockers,
    sanitizedTrace,
  };
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  NOT_AUTHORIZED_FOR_MOUNT,
  REVIEW_BOUNDARY_PASSED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  DECISION_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  OROPLAY_SIGNED_APPROVAL_ARTIFACT_ACCEPTANCE_REVIEW_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  buildSignedApprovalArtifactAcceptanceReviewContract,
  buildFinalPreMountAuthorizationDecisionBoundaryContract,
  buildMockSignedApprovalArtifactAcceptanceReviewFixture,
  evaluateActualSignedApprovalArtifactPresence,
  validateMockSignedApprovalArtifactReviewOnly,
  evaluateSignedApprovalArtifactAcceptanceReview,
  evaluateSignedApprovalArtifactVerificationOutcome,
  evaluateChatApprovalNotSignedArtifact,
  evaluatePlainTextApprovalNotSignedArtifact,
  evaluateEvidencePackReadinessForDecision,
  evaluateFinalPreMountAuthorizationDecisionReadiness,
  evaluateFinalPreMountAuthorizationDecisionNotIssued,
  evaluateRouteMountAuthorizationBoundary,
  buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundarySummary,
  validateSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryContract,
  sanitizeBoundaryTrace,
};
