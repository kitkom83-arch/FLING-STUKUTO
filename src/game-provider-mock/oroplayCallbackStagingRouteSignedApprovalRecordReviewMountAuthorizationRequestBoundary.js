"use strict";

const PHASE = "ORO-4N";
const GATE = "oroplay_callback_staging_route_signed_approval_record_review_mount_authorization_request_boundary";
const PASS = "PASS";
const FAIL = "FAIL";
const PENDING_SIGNED_APPROVAL_RECORD = "pending_signed_approval_record";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD =
  "request_pack_prepared_pending_actual_signed_record";
const REVIEW_CONTRACT_MISSING = "signed_approval_record_review_contract_missing";
const REQUEST_BOUNDARY_MISSING = "mount_authorization_request_boundary_missing";
const MOCK_SIGNED_RECORD_SCHEMA_ONLY = "mock_signed_record_schema_only";
const INVALID_SIGNED_RECORD_SCHEMA = "invalid_signed_record_schema";
const REVIEW_VALIDATION_FAILED = "review_validation_failed";

const OROPLAY_SIGNED_APPROVAL_RECORD_REVIEW_MOUNT_AUTHORIZATION_REQUEST_BOUNDARY_STATUS = Object.freeze({
  PASS,
  FAIL,
  PENDING_SIGNED_APPROVAL_RECORD,
  NOT_AUTHORIZED_FOR_MOUNT,
  REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
  REVIEW_CONTRACT_MISSING,
  REQUEST_BOUNDARY_MISSING,
  MOCK_SIGNED_RECORD_SCHEMA_ONLY,
  INVALID_SIGNED_RECORD_SCHEMA,
  REVIEW_VALIDATION_FAILED,
});

const REQUIRED_REVIEW_CONTRACT_FIELDS = Object.freeze([
  "recordType",
  "phaseReference",
  "projectName",
  "repository",
  "branch",
  "sourceIntakeGatePhase",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "approvalArtifactHash",
  "reviewerIdentity",
  "reviewedAt",
  "decision",
  "mockRecordPolicy",
  "chatApprovalPolicy",
  "plainTextApprovalPolicy",
  "mountAuthorizationRequestPolicy",
  "separateRouteMountApprovalRequired",
  "nextPhaseRequiresSeparateAuthorization",
]);

const REQUIRED_REQUEST_BOUNDARY_FIELDS = Object.freeze([
  "requestType",
  "phaseReference",
  "sourceSignedRecordPolicy",
  "requestPackPrepared",
  "requestPackSubmitted",
  "requestStatus",
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

const REQUIRED_MOCK_SIGNED_RECORD_FIELDS = Object.freeze([
  "recordType",
  "signerIdentity",
  "signedAt",
  "approvalScope",
  "approvalArtifactHash",
  "reviewerIdentity",
]);

const REVIEW_DECISION_OPTIONS = Object.freeze([
  "changes_requested",
  "pending_actual_signed_record",
  "schema_only_review",
  "not_authorized_for_mount",
]);

const REQUEST_STATUS_OPTIONS = Object.freeze([
  REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
  "request_blocked_missing_review_contract",
  "request_blocked_missing_boundary_contract",
  "request_blocked_by_safety_boundary",
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
const MAX_REVIEW_AGE_DAYS = 30;

const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|privatekey|apikey|api-key|cookie|set-cookie|x-api-key|signature|signedapproval|approvalsignature|signedrecordreference|artifacthash/i;

const SENSITIVE_TEXT_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|database_url|databaseurl|private\s*key|privatekey|api\s*key|apikey|api-key|cookie|set-cookie|x-api-key|signature|signed\s*approval|signedapproval|approval\s*signature|approvalsignature|signed\s*record|signedrecordreference/i;

const SECRET_SHAPED_PATTERNS = Object.freeze([
  new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
  new RegExp(`${["Ba", "sic"].join("")}\\s+\\S+`, "i"),
  /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
  /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  /DATABASE_URL\s*[:=]/i,
  /\b[A-Za-z0-9_-]{32,}\b/,
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
    id: String(source.id || "unnamed-signed-approval-record-review-boundary-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    signedApprovalRecordReviewContract: isPlainObject(source.signedApprovalRecordReviewContract)
      ? source.signedApprovalRecordReviewContract
      : {},
    mountAuthorizationRequestBoundaryContract: isPlainObject(source.mountAuthorizationRequestBoundaryContract)
      ? source.mountAuthorizationRequestBoundaryContract
      : {},
    signedApprovalRecord: source.signedApprovalRecord,
    actualSignedApprovalRecord: source.actualSignedApprovalRecord,
    mockSignedRecord: source.mockSignedRecord,
    chatApprovalCandidate: source.chatApprovalCandidate,
    plainTextApprovalCandidate: source.plainTextApprovalCandidate,
    mountAuthorizationRequest: isPlainObject(source.mountAuthorizationRequest) ? source.mountAuthorizationRequest : {},
    attemptedAuthorizationStates: isPlainObject(source.attemptedAuthorizationStates)
      ? source.attemptedAuthorizationStates
      : {},
    reviewedAt: hasText(source.reviewedAt) ? source.reviewedAt : DEFAULT_REVIEWED_AT,
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function buildSignedApprovalRecordReviewContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_REVIEW_CONTRACT_FIELDS.slice(),
    decisionOptions: REVIEW_DECISION_OPTIONS.slice(),
    defaultDecision: "pending_actual_signed_record",
    mockRecordPolicy: "schema_only_review",
    chatApprovalPolicy: "not_signed_record",
    plainTextApprovalPolicy: "not_signed_record",
    mountAuthorizationRequestPolicy: "request_boundary_only",
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildMountAuthorizationRequestBoundaryContract(overrides = {}) {
  return {
    present: true,
    phase: PHASE,
    fields: REQUIRED_REQUEST_BOUNDARY_FIELDS.slice(),
    requestStatusOptions: REQUEST_STATUS_OPTIONS.slice(),
    defaultRequestStatus: REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
    sourceSignedRecordPolicy: "actual_signed_record_required_before_submission",
    requestPackPrepared: true,
    requestPackSubmitted: false,
    preMountAuthorization: PENDING_SIGNED_APPROVAL_RECORD,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    ...overrides,
  };
}

function buildMockSignedApprovalRecordReviewFixture(overrides = {}) {
  return {
    present: true,
    mock: true,
    recordType: "mock_signed_approval_record",
    signerIdentity: "mock-human-reviewer",
    signedAt: "2026-06-02T10:00:00.000Z",
    approvalScope: "signed_record_schema_review_only",
    approvalArtifactHash: "mock-artifact-hash",
    reviewerIdentity: "mock-boundary-reviewer",
    ...overrides,
  };
}

function validateReviewContract(contract) {
  const fields = toStringList(contract.fields);
  const decisionOptions = toStringList(contract.decisionOptions);
  const missingFields = REQUIRED_REVIEW_CONTRACT_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionOptions = decisionOptions.filter(
    (option) => !REVIEW_DECISION_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
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

function validateRequestBoundaryContract(contract) {
  const fields = toStringList(contract.fields);
  const requestStatusOptions = toStringList(contract.requestStatusOptions);
  const missingFields = REQUIRED_REQUEST_BOUNDARY_FIELDS.filter((field) => !fields.includes(field));
  const invalidRequestStatusOptions = requestStatusOptions.filter(
    (option) => !REQUEST_STATUS_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
  );
  const present = contract.present === true && missingFields.length === 0 && invalidRequestStatusOptions.length === 0;

  return {
    present,
    fields,
    requestStatusOptions,
    missingFields,
    invalidRequestStatusOptions,
  };
}

function validateSignedApprovalRecordReviewMountAuthorizationRequestBoundaryContract(input) {
  const fixture = normalizeInput(input);
  const signedApprovalRecordReviewContract = validateReviewContract(fixture.signedApprovalRecordReviewContract);
  const mountAuthorizationRequestBoundaryContract = validateRequestBoundaryContract(
    fixture.mountAuthorizationRequestBoundaryContract
  );
  const blockers = [];

  if (!signedApprovalRecordReviewContract.present) {
    blockers.push("missing signed approval record review contract");
    for (const field of signedApprovalRecordReviewContract.missingFields) {
      blockers.push(`missing signed approval record review contract field: ${field}`);
    }
    for (const option of signedApprovalRecordReviewContract.invalidDecisionOptions) {
      blockers.push(`invalid signed approval record review decision option: ${option}`);
    }
  }

  if (!mountAuthorizationRequestBoundaryContract.present) {
    blockers.push("missing mount authorization request boundary contract");
    for (const field of mountAuthorizationRequestBoundaryContract.missingFields) {
      blockers.push(`missing mount authorization request boundary field: ${field}`);
    }
    for (const option of mountAuthorizationRequestBoundaryContract.invalidRequestStatusOptions) {
      blockers.push(`invalid mount authorization request status option: ${option}`);
    }
  }

  return {
    signedApprovalRecordReviewContract,
    mountAuthorizationRequestBoundaryContract,
    signedApprovalRecordReviewContractPresent: signedApprovalRecordReviewContract.present,
    mountAuthorizationRequestBoundaryPresent: mountAuthorizationRequestBoundaryContract.present,
    blockers,
  };
}

function evaluateActualSignedApprovalRecordPresence(input) {
  const fixture = normalizeInput(input);
  const record = isPlainObject(fixture.actualSignedApprovalRecord)
    ? fixture.actualSignedApprovalRecord
    : fixture.signedApprovalRecord;
  const actualSignedApprovalRecordSupplied =
    isPlainObject(record) &&
    record.present === true &&
    (record.actual === true || String(record.kind || "").toLowerCase() === "actual");
  const blockers = [];

  if (actualSignedApprovalRecordSupplied) {
    blockers.push("actual signed approval record not accepted in ORO-4N mock boundary");
  }

  return {
    actualSignedApprovalRecordSupplied,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    actualSignedApprovalRecordPresenceStatus: actualSignedApprovalRecordSupplied
      ? "actual_signed_record_supplied_but_not_accepted"
      : "absent",
    blockers,
  };
}

function approvalCandidatePresent(candidate) {
  if (candidate === true) return true;
  if (!isPlainObject(candidate)) return false;
  return candidate.present === true || hasText(candidate.text) || hasText(candidate.message) || hasText(candidate.value);
}

function evaluateChatApprovalNotSignedRecord(input) {
  const fixture = normalizeInput(input);
  const chatPresent = approvalCandidatePresent(fixture.chatApprovalCandidate);
  const plainTextPresent = approvalCandidatePresent(fixture.plainTextApprovalCandidate);
  const blockers = [];

  if (chatPresent) blockers.push("chat approval is not signed approval record");
  if (plainTextPresent) blockers.push("plain text approval is not signed approval record");

  return {
    chatApprovalPresent: chatPresent,
    plainTextApprovalPresent: plainTextPresent,
    chatApprovalCountedAsSignedRecord: false,
    plainTextApprovalCountedAsSignedRecord: false,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    blockers,
  };
}

function validateMockSignedRecordSchema(record, reviewedAt) {
  if (!isPlainObject(record) || record.present === false) {
    return {
      mockSignedRecordProvided: false,
      mockSignedRecordSchemaValid: false,
      mockSignedRecordReviewValid: false,
      missingFields: REQUIRED_MOCK_SIGNED_RECORD_FIELDS.slice(),
      routeMountScopeRequested: false,
      staleTimestamp: false,
      malformed: false,
      blockers: [],
    };
  }

  const missingFields = REQUIRED_MOCK_SIGNED_RECORD_FIELDS.filter((field) => !fieldPresent(record[field]));
  const malformed = record.malformed === true || record.recordType !== "mock_signed_approval_record";
  const signedAtTime = parseTime(record.signedAt);
  const staleAgeDays = signedAtTime === null ? null : daysBetween(record.signedAt, reviewedAt);
  const staleTimestamp = staleAgeDays !== null && staleAgeDays > MAX_REVIEW_AGE_DAYS;
  const routeMountScopeRequested = String(record.approvalScope || "").toLowerCase().includes("route_mount");
  const blockers = [];

  if (malformed) blockers.push("malformed signed record schema");
  for (const field of missingFields) blockers.push(`missing mock signed record field: ${field}`);
  if (signedAtTime === null && !missingFields.includes("signedAt")) blockers.push("invalid signedAt timestamp");
  if (staleTimestamp) blockers.push("stale signed record timestamp");

  const mockSignedRecordSchemaValid = blockers.length === 0;
  const mockSignedRecordReviewValid = mockSignedRecordSchemaValid && !staleTimestamp;

  return {
    mockSignedRecordProvided: true,
    mockSignedRecordSchemaValid,
    mockSignedRecordReviewValid,
    missingFields,
    routeMountScopeRequested,
    staleTimestamp,
    malformed,
    blockers,
  };
}

function evaluateMockSignedRecordSchemaOnly(input) {
  const fixture = normalizeInput(input);
  const record = isPlainObject(input) && Object.prototype.hasOwnProperty.call(input, "mockSignedRecord")
    ? fixture.mockSignedRecord
    : input;
  const schema = validateMockSignedRecordSchema(record, fixture.reviewedAt);
  const notes = [];

  if (schema.mockSignedRecordProvided && schema.mockSignedRecordSchemaValid) {
    notes.push("mock signed record is schema-only review input");
  }
  if (schema.routeMountScopeRequested) {
    notes.push("route mount scope in mock record is not actual authorization");
  }

  return {
    ...schema,
    mockSignedRecordStatus: schema.mockSignedRecordProvided ? MOCK_SIGNED_RECORD_SCHEMA_ONLY : "absent",
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    notes,
  };
}

function hasForbiddenAuthorizationState(value) {
  if (typeof value === "boolean") return value === true;
  if (!hasText(String(value || ""))) return false;
  return FORBIDDEN_AUTHORIZATION_VALUES.includes(String(value).toLowerCase());
}

function evaluateMountAuthorizationRequestReadiness(input) {
  const fixture = normalizeInput(input);
  const request = fixture.mountAuthorizationRequest;
  const requestPrepared = request.prepared !== false;
  const requestSubmitted = request.submitted === true || String(request.status || "").toLowerCase() === "submitted";
  const authorizationAttempted =
    request.authorized === true ||
    request.approval === true ||
    hasForbiddenAuthorizationState(request.authorizationStatus) ||
    hasForbiddenAuthorizationState(request.status);
  const blockers = [];

  if (!requestPrepared) blockers.push("mount authorization request pack not prepared");
  if (requestSubmitted) blockers.push("mount authorization request submission is blocked");
  if (authorizationAttempted) blockers.push("mount authorization request is not authorization");

  return {
    mountAuthorizationRequestPrepared: requestPrepared,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestStatus: REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
    mountAuthorizationRequestAuthorizationAttempted: authorizationAttempted,
    blockers,
  };
}

function evaluateMountAuthorizationRequestNotAuthorization(input) {
  const readiness = evaluateMountAuthorizationRequestReadiness(input);
  return {
    mountAuthorizationRequestPrepared: readiness.mountAuthorizationRequestPrepared,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestAcceptedAsAuthorization: false,
    mountAuthorizationRequestStatus: readiness.mountAuthorizationRequestStatus,
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
    preMountAuthorization: PENDING_SIGNED_APPROVAL_RECORD,
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

function evaluateSignedApprovalRecordReviewOutcome(input) {
  const fixture = normalizeInput(input);
  const contract = validateSignedApprovalRecordReviewMountAuthorizationRequestBoundaryContract(fixture);
  const actual = evaluateActualSignedApprovalRecordPresence(fixture);
  const chat = evaluateChatApprovalNotSignedRecord(fixture);
  const mock = evaluateMockSignedRecordSchemaOnly(fixture);
  const blockers = [
    ...contract.blockers,
    ...actual.blockers,
    ...chat.blockers,
    ...mock.blockers,
  ];

  return {
    signedApprovalRecordReviewBoundaryResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalRecordReviewContractPresent: contract.signedApprovalRecordReviewContractPresent,
    mountAuthorizationRequestBoundaryPresent: contract.mountAuthorizationRequestBoundaryPresent,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    actualSignedApprovalRecordSupplied: actual.actualSignedApprovalRecordSupplied,
    chatApprovalCountedAsSignedRecord: false,
    plainTextApprovalCountedAsSignedRecord: false,
    mockSignedRecordSchemaValid: mock.mockSignedRecordSchemaValid,
    mockSignedRecordReviewValid: mock.mockSignedRecordReviewValid,
    mockSignedRecordStatus: mock.mockSignedRecordStatus,
    blockers,
    notes: mock.notes,
  };
}

function buildSignedApprovalRecordReviewMountAuthorizationRequestBoundarySummary(input) {
  const fixture = normalizeInput(input);
  const review = evaluateSignedApprovalRecordReviewOutcome(fixture);
  const request = evaluateMountAuthorizationRequestNotAuthorization(fixture);
  const route = evaluateRouteMountAuthorizationBoundary(fixture);
  const sanitizedTrace = sanitizeBoundaryTrace(fixture.trace);
  const blockers = [
    ...review.blockers,
    ...request.blockers,
    ...route.blockers,
  ];

  if (hasSecretShapedValue(sanitizedTrace)) {
    blockers.push("sanitized trace contains secret-shaped value");
  }

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    signedApprovalRecordReviewBoundaryResult: blockers.length === 0 ? PASS : FAIL,
    signedApprovalRecordReviewContractPresent: review.signedApprovalRecordReviewContractPresent,
    mountAuthorizationRequestBoundaryPresent: review.mountAuthorizationRequestBoundaryPresent,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    mountAuthorizationRequestPrepared: request.mountAuthorizationRequestPrepared,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestStatus: REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
    preMountAuthorization: PENDING_SIGNED_APPROVAL_RECORD,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    humanAuthorizationRequired: true,
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    chatApprovalCountedAsSignedRecord: false,
    plainTextApprovalCountedAsSignedRecord: false,
    mockSignedRecordStatus: review.mockSignedRecordStatus,
    mockSignedRecordSchemaValid: review.mockSignedRecordSchemaValid,
    mockSignedRecordReviewValid: review.mockSignedRecordReviewValid,
    mountAuthorizationRequestAcceptedAsAuthorization: false,
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
    notes: review.notes,
    blockers,
    sanitizedTrace,
  };
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  PENDING_SIGNED_APPROVAL_RECORD,
  NOT_AUTHORIZED_FOR_MOUNT,
  REQUEST_PACK_PREPARED_PENDING_ACTUAL_SIGNED_RECORD,
  OROPLAY_SIGNED_APPROVAL_RECORD_REVIEW_MOUNT_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  buildSignedApprovalRecordReviewContract,
  buildMountAuthorizationRequestBoundaryContract,
  buildMockSignedApprovalRecordReviewFixture,
  evaluateActualSignedApprovalRecordPresence,
  evaluateSignedApprovalRecordReviewOutcome,
  evaluateChatApprovalNotSignedRecord,
  evaluateMockSignedRecordSchemaOnly,
  evaluateMountAuthorizationRequestReadiness,
  evaluateMountAuthorizationRequestNotAuthorization,
  evaluateRouteMountAuthorizationBoundary,
  buildSignedApprovalRecordReviewMountAuthorizationRequestBoundarySummary,
  validateSignedApprovalRecordReviewMountAuthorizationRequestBoundaryContract,
  sanitizeBoundaryTrace,
};
