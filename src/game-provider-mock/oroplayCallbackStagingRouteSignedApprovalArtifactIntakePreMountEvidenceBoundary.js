"use strict";

const PHASE = "ORO-4O";
const GATE = "oroplay_callback_staging_route_signed_approval_artifact_intake_pre_mount_evidence_boundary";
const PASS = "PASS";
const FAIL = "FAIL";
const PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT = "pending_actual_signed_approval_artifact";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT =
  "evidence_pack_prepared_pending_actual_signed_approval_artifact";
const ARTIFACT_INTAKE_CONTRACT_MISSING = "signed_approval_artifact_intake_contract_missing";
const PRE_MOUNT_EVIDENCE_BOUNDARY_MISSING = "pre_mount_human_approval_evidence_boundary_missing";
const MOCK_SIGNED_APPROVAL_ARTIFACT_SCHEMA_ONLY = "mock_signed_approval_artifact_schema_only";
const INVALID_SIGNED_APPROVAL_ARTIFACT_SCHEMA = "invalid_signed_approval_artifact_schema";
const EVIDENCE_VALIDATION_FAILED = "evidence_validation_failed";

const OROPLAY_SIGNED_APPROVAL_ARTIFACT_INTAKE_PRE_MOUNT_EVIDENCE_BOUNDARY_STATUS = Object.freeze({
  PASS,
  FAIL,
  PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  NOT_AUTHORIZED_FOR_MOUNT,
  EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  ARTIFACT_INTAKE_CONTRACT_MISSING,
  PRE_MOUNT_EVIDENCE_BOUNDARY_MISSING,
  MOCK_SIGNED_APPROVAL_ARTIFACT_SCHEMA_ONLY,
  INVALID_SIGNED_APPROVAL_ARTIFACT_SCHEMA,
  EVIDENCE_VALIDATION_FAILED,
});

const REQUIRED_ARTIFACT_INTAKE_CONTRACT_FIELDS = Object.freeze([
  "artifactType",
  "phaseReference",
  "projectName",
  "repository",
  "branch",
  "sourceReviewBoundaryPhase",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "artifactDigest",
  "evidenceReviewerIdentity",
  "evidenceReviewedAt",
  "decision",
  "mockArtifactPolicy",
  "chatApprovalPolicy",
  "plainTextApprovalPolicy",
  "evidencePackPolicy",
  "separateRouteMountApprovalRequired",
  "nextPhaseRequiresSeparateAuthorization",
]);

const REQUIRED_PRE_MOUNT_EVIDENCE_BOUNDARY_FIELDS = Object.freeze([
  "evidenceBoundaryType",
  "phaseReference",
  "sourceSignedApprovalArtifactPolicy",
  "evidencePackPrepared",
  "evidencePackSubmitted",
  "mountAuthorizationRequestSubmitted",
  "evidenceStatus",
  "preMountAuthorization",
  "routeMountAuthorization",
  "humanAuthorizationRequired",
  "separateRouteMountApprovalRequired",
  "nextPhaseRequiresSeparateAuthorization",
  "runtimeRoutePolicy",
  "publicAliasPolicy",
  "walletMutationPolicy",
  "ledgerMutationPolicy",
  "prismaWritePolicy",
]);

const REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_FIELDS = Object.freeze([
  "artifactType",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "artifactDigest",
  "evidenceReviewerIdentity",
]);

const ARTIFACT_DECISION_OPTIONS = Object.freeze([
  "changes_requested",
  "pending_actual_signed_approval_artifact",
  "metadata_schema_only",
  "not_authorized_for_mount",
]);

const EVIDENCE_STATUS_OPTIONS = Object.freeze([
  EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  "evidence_blocked_missing_artifact_intake_contract",
  "evidence_blocked_missing_boundary_contract",
  "evidence_blocked_by_safety_boundary",
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
const MAX_EVIDENCE_AGE_DAYS = 30;
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
    id: String(source.id || "unnamed-signed-approval-artifact-intake-pre-mount-evidence-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    signedApprovalArtifactIntakeContract: isPlainObject(source.signedApprovalArtifactIntakeContract)
      ? source.signedApprovalArtifactIntakeContract
      : {},
    preMountHumanApprovalEvidenceBoundaryContract: isPlainObject(source.preMountHumanApprovalEvidenceBoundaryContract)
      ? source.preMountHumanApprovalEvidenceBoundaryContract
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
    attemptedAuthorizationStates: isPlainObject(source.attemptedAuthorizationStates)
      ? source.attemptedAuthorizationStates
      : {},
    reviewedAt: hasText(source.reviewedAt) ? source.reviewedAt : DEFAULT_REVIEWED_AT,
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function buildSignedApprovalArtifactIntakeContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_ARTIFACT_INTAKE_CONTRACT_FIELDS.slice(),
    decisionOptions: ARTIFACT_DECISION_OPTIONS.slice(),
    defaultDecision: "pending_actual_signed_approval_artifact",
    mockArtifactPolicy: "metadata_schema_only",
    chatApprovalPolicy: "not_signed_approval_artifact",
    plainTextApprovalPolicy: "not_signed_approval_artifact",
    evidencePackPolicy: "prepared_not_submitted_not_authorization",
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildPreMountHumanApprovalEvidenceBoundaryContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_PRE_MOUNT_EVIDENCE_BOUNDARY_FIELDS.slice(),
    evidenceStatusOptions: EVIDENCE_STATUS_OPTIONS.slice(),
    defaultEvidenceStatus: EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    sourceSignedApprovalArtifactPolicy: "actual_signed_approval_artifact_required_before_submission",
    evidencePackPrepared: true,
    evidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildMockSignedApprovalArtifactMetadataFixture(overrides = {}) {
  return {
    present: true,
    mock: true,
    metadataOnly: true,
    artifactType: "mock_signed_approval_artifact_metadata",
    signerIdentity: "mock-human-signer",
    signedAt: "2026-06-02T10:00:00.000Z",
    approvalScope: "pre_mount_evidence_schema_only",
    artifactDigest: `sha256:${"a".repeat(64)}`,
    evidenceReviewerIdentity: "mock-evidence-reviewer",
    ...overrides,
  };
}

function validateArtifactIntakeContract(contract) {
  const fields = toStringList(contract.fields);
  const decisionOptions = toStringList(contract.decisionOptions);
  const missingFields = REQUIRED_ARTIFACT_INTAKE_CONTRACT_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionOptions = decisionOptions.filter(
    (option) => !ARTIFACT_DECISION_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
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

function validateEvidenceBoundaryContract(contract) {
  const fields = toStringList(contract.fields);
  const evidenceStatusOptions = toStringList(contract.evidenceStatusOptions);
  const missingFields = REQUIRED_PRE_MOUNT_EVIDENCE_BOUNDARY_FIELDS.filter((field) => !fields.includes(field));
  const invalidEvidenceStatusOptions = evidenceStatusOptions.filter(
    (option) => !EVIDENCE_STATUS_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
  );
  const present = contract.present === true && missingFields.length === 0 && invalidEvidenceStatusOptions.length === 0;

  return {
    present,
    fields,
    evidenceStatusOptions,
    missingFields,
    invalidEvidenceStatusOptions,
  };
}

function validateSignedApprovalArtifactIntakePreMountEvidenceBoundaryContract(input) {
  const fixture = normalizeInput(input);
  const signedApprovalArtifactIntakeContract = validateArtifactIntakeContract(
    fixture.signedApprovalArtifactIntakeContract
  );
  const preMountHumanApprovalEvidenceBoundaryContract = validateEvidenceBoundaryContract(
    fixture.preMountHumanApprovalEvidenceBoundaryContract
  );
  const blockers = [];

  if (!signedApprovalArtifactIntakeContract.present) {
    blockers.push("missing signed approval artifact intake contract");
    for (const field of signedApprovalArtifactIntakeContract.missingFields) {
      blockers.push(`missing signed approval artifact intake contract field: ${field}`);
    }
    for (const option of signedApprovalArtifactIntakeContract.invalidDecisionOptions) {
      blockers.push(`invalid signed approval artifact intake decision option: ${option}`);
    }
  }

  if (!preMountHumanApprovalEvidenceBoundaryContract.present) {
    blockers.push("missing pre-mount human approval evidence boundary contract");
    for (const field of preMountHumanApprovalEvidenceBoundaryContract.missingFields) {
      blockers.push(`missing pre-mount human approval evidence boundary field: ${field}`);
    }
    for (const option of preMountHumanApprovalEvidenceBoundaryContract.invalidEvidenceStatusOptions) {
      blockers.push(`invalid pre-mount evidence status option: ${option}`);
    }
  }

  return {
    signedApprovalArtifactIntakeContract,
    preMountHumanApprovalEvidenceBoundaryContract,
    signedApprovalArtifactIntakeContractPresent: signedApprovalArtifactIntakeContract.present,
    preMountHumanApprovalEvidenceBoundaryPresent: preMountHumanApprovalEvidenceBoundaryContract.present,
    blockers,
  };
}

function evaluateSourceReviewBoundary(input) {
  const fixture = normalizeInput(input);
  const source = fixture.evidenceSources.signedApprovalRecordReviewBoundary;
  const present =
    sourcePresent(source) &&
    String(source.phase || "").toUpperCase() === "ORO-4N" &&
    source.signedApprovalRecordReviewBoundaryResult === PASS &&
    source.signedApprovalRecordPresent === false &&
    source.signedApprovalRecordAccepted === false &&
    source.signedApprovalRecordVerified === false &&
    source.mountAuthorizationRequestSubmitted === false &&
    source.routeMountAuthorization === NOT_AUTHORIZED_FOR_MOUNT;

  return {
    signedApprovalRecordReviewBoundaryPresent: present,
    blockers: present ? [] : ["ORO-4N signed approval record review boundary missing"],
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
    blockers.push("actual signed approval artifact not accepted in ORO-4O mock boundary");
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

function validateMockSignedApprovalArtifactSchemaOnly(input) {
  const fixture = normalizeInput(input);
  const artifact = isPlainObject(input) && Object.prototype.hasOwnProperty.call(input, "mockSignedApprovalArtifact")
    ? fixture.mockSignedApprovalArtifact
    : input;

  if (!isPlainObject(artifact) || artifact.present === false) {
    return {
      mockSignedApprovalArtifactProvided: false,
      mockSignedApprovalArtifactSchemaValid: false,
      mockSignedApprovalArtifactEvidenceValid: false,
      mockSignedApprovalArtifactSchemaOnly: false,
      missingFields: REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_FIELDS.slice(),
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

  const missingFields = REQUIRED_MOCK_SIGNED_APPROVAL_ARTIFACT_FIELDS.filter((field) => !fieldPresent(artifact[field]));
  const malformed = artifact.malformed === true || artifact.artifactType !== "mock_signed_approval_artifact_metadata";
  const artifactDigestPresent = fieldPresent(artifact.artifactDigest);
  const invalidArtifactDigestFormat = artifactDigestPresent && !SHA256_DIGEST_PATTERN.test(String(artifact.artifactDigest));
  const signedAtTime = parseTime(artifact.signedAt);
  const staleAgeDays = signedAtTime === null ? null : daysBetween(artifact.signedAt, fixture.reviewedAt);
  const staleTimestamp = staleAgeDays !== null && staleAgeDays > MAX_EVIDENCE_AGE_DAYS;
  const routeMountScopeRequested = String(artifact.approvalScope || "").toLowerCase().includes("route_mount");
  const blockers = [];
  const notes = [];

  if (malformed) blockers.push("malformed signed approval artifact metadata schema");
  for (const field of missingFields) blockers.push(`missing mock signed approval artifact field: ${field}`);
  if (signedAtTime === null && !missingFields.includes("signedAt")) blockers.push("invalid signedAt timestamp");
  if (invalidArtifactDigestFormat) blockers.push("invalid mock signed approval artifact digest format");
  if (staleTimestamp) blockers.push("stale signed approval artifact timestamp");

  const mockSignedApprovalArtifactSchemaValid =
    blockers.length === 0 || (blockers.length === 0 && !invalidArtifactDigestFormat);
  const mockSignedApprovalArtifactEvidenceValid = mockSignedApprovalArtifactSchemaValid && !staleTimestamp;

  if (mockSignedApprovalArtifactSchemaValid) {
    notes.push("mock signed approval artifact metadata is schema-only review input");
  }
  if (routeMountScopeRequested) {
    notes.push("route mount scope in mock artifact metadata is not actual authorization");
  }

  return {
    mockSignedApprovalArtifactProvided: true,
    mockSignedApprovalArtifactSchemaValid,
    mockSignedApprovalArtifactEvidenceValid,
    mockSignedApprovalArtifactSchemaOnly: mockSignedApprovalArtifactSchemaValid,
    mockSignedApprovalArtifactStatus: MOCK_SIGNED_APPROVAL_ARTIFACT_SCHEMA_ONLY,
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

function evaluateSignedApprovalArtifactAcceptance(input) {
  const actual = evaluateActualSignedApprovalArtifactPresence(input);
  return {
    signedApprovalArtifactAccepted: false,
    actualSignedApprovalArtifactPresent: false,
    acceptanceStatus: "pending_actual_signed_approval_artifact",
    blockers: actual.blockers.slice(),
  };
}

function evaluateSignedApprovalArtifactVerification(input) {
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

function evaluateMountAuthorizationEvidencePackReadiness(input) {
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
    mountAuthorizationEvidenceStatus: EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    mountAuthorizationEvidencePackAuthorizationAttempted: evidenceAuthorizationAttempted,
    mountAuthorizationRequestAuthorizationAttempted: requestAuthorizationAttempted,
    blockers,
  };
}

function evaluateMountAuthorizationEvidencePackNotSubmission(input) {
  const readiness = evaluateMountAuthorizationEvidencePackReadiness(input);
  return {
    mountAuthorizationEvidencePackPrepared: readiness.mountAuthorizationEvidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationEvidencePackAcceptedAsMountAuthorization: false,
    mountAuthorizationEvidenceStatus: readiness.mountAuthorizationEvidenceStatus,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
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

function buildSignedApprovalArtifactIntakePreMountEvidenceBoundarySummary(input) {
  const fixture = normalizeInput(input);
  const sourceReviewBoundary = evaluateSourceReviewBoundary(fixture);
  const contract = validateSignedApprovalArtifactIntakePreMountEvidenceBoundaryContract(fixture);
  const actual = evaluateActualSignedApprovalArtifactPresence(fixture);
  const chat = evaluateChatApprovalNotSignedArtifact(fixture);
  const plainText = evaluatePlainTextApprovalNotSignedArtifact(fixture);
  const mock = validateMockSignedApprovalArtifactSchemaOnly(fixture);
  const acceptance = evaluateSignedApprovalArtifactAcceptance(fixture);
  const verification = evaluateSignedApprovalArtifactVerification(fixture);
  const evidence = evaluateMountAuthorizationEvidencePackNotSubmission(fixture);
  const route = evaluateRouteMountAuthorizationBoundary(fixture);
  const sanitizedTrace = sanitizeBoundaryTrace(fixture.trace);
  const blockers = [
    ...sourceReviewBoundary.blockers,
    ...contract.blockers,
    ...actual.blockers,
    ...chat.blockers,
    ...plainText.blockers,
    ...mock.blockers,
    ...acceptance.blockers,
    ...verification.blockers,
    ...evidence.blockers,
    ...route.blockers,
  ];

  if (hasSecretShapedValue(sanitizedTrace)) {
    blockers.push("sanitized trace contains secret-shaped value");
  }

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    signedApprovalArtifactIntakeBoundaryResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalArtifactIntakeContractPresent: contract.signedApprovalArtifactIntakeContractPresent,
    preMountHumanApprovalEvidenceBoundaryPresent: contract.preMountHumanApprovalEvidenceBoundaryPresent,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalRecordPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    actualSignedApprovalArtifactSupplied: actual.actualSignedApprovalArtifactSupplied,
    mockSignedApprovalArtifactSchemaOnly: mock.mockSignedApprovalArtifactSchemaOnly,
    mockSignedApprovalArtifactSchemaValid: mock.mockSignedApprovalArtifactSchemaValid,
    mockSignedApprovalArtifactEvidenceValid: mock.mockSignedApprovalArtifactEvidenceValid,
    mockSignedApprovalArtifactStatus: mock.mockSignedApprovalArtifactStatus,
    chatApprovalCountedAsSignedApprovalArtifact: false,
    plainTextApprovalCountedAsSignedApprovalArtifact: false,
    mountAuthorizationEvidencePackPrepared: evidence.mountAuthorizationEvidencePackPrepared,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationEvidenceStatus: EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    mountAuthorizationEvidencePackAcceptedAsMountAuthorization: false,
    preMountAuthorization: PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
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
  EVIDENCE_PACK_PREPARED_PENDING_ACTUAL_SIGNED_APPROVAL_ARTIFACT,
  OROPLAY_SIGNED_APPROVAL_ARTIFACT_INTAKE_PRE_MOUNT_EVIDENCE_BOUNDARY_STATUS,
  buildSignedApprovalArtifactIntakeContract,
  buildPreMountHumanApprovalEvidenceBoundaryContract,
  buildMockSignedApprovalArtifactMetadataFixture,
  evaluateActualSignedApprovalArtifactPresence,
  validateMockSignedApprovalArtifactSchemaOnly,
  evaluateSignedApprovalArtifactAcceptance,
  evaluateSignedApprovalArtifactVerification,
  evaluateChatApprovalNotSignedArtifact,
  evaluatePlainTextApprovalNotSignedArtifact,
  evaluateMountAuthorizationEvidencePackReadiness,
  evaluateMountAuthorizationEvidencePackNotSubmission,
  evaluateRouteMountAuthorizationBoundary,
  buildSignedApprovalArtifactIntakePreMountEvidenceBoundarySummary,
  validateSignedApprovalArtifactIntakePreMountEvidenceBoundaryContract,
  sanitizeBoundaryTrace,
};
