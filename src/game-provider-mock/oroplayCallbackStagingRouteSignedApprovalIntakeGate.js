"use strict";

const PHASE = "ORO-4M";
const GATE = "oroplay_callback_staging_route_signed_approval_intake_gate";
const PASS = "PASS";
const FAIL = "FAIL";
const INTAKE_CONTRACT_MISSING = "intake_contract_missing";
const PENDING_SIGNED_APPROVAL_RECORD = "pending_signed_approval_record";
const CANDIDATE_RECORD_RECEIVED_FOR_REVIEW = "candidate_record_received_for_review";
const INVALID_SIGNED_RECORD_CANDIDATE = "invalid_signed_record_candidate";
const SIGNED_RECORD_REJECTED = "signed_record_rejected";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const VERIFICATION_PACK_PASSED_PENDING_HUMAN_RECORD = "verification_pack_passed_pending_human_record";

const REQUIRED_EVIDENCE = Object.freeze([
  ["routeWiringDesign", "missing ORO-4F route wiring design"],
  ["routePreflight", "missing ORO-4G route preflight"],
  ["dryRunGate", "missing ORO-4H dry-run gate"],
  ["internalShadowHarness", "missing ORO-4I internal shadow harness"],
  ["mountDecisionGate", "missing ORO-4J mount decision gate"],
  ["humanMountReviewEvidencePack", "missing ORO-4K evidence pack"],
  ["authorizationBoundary", "missing ORO-4L authorization boundary"],
  ["staticSafetyChecks", "missing static safety checks"],
]);

const REQUIRED_CONTRACT_FIELDS = Object.freeze([
  "recordType",
  "phaseReference",
  "projectName",
  "repository",
  "branch",
  "reviewerName",
  "reviewerRole",
  "reviewDate",
  "evidencePackCommit",
  "evidencePackSafeCiRunId",
  "preMountBoundaryCommit",
  "preMountBoundarySafeCiRunId",
  "reviewedPhases",
  "decision",
  "requiredConditionsBeforeMount",
  "rollbackOwner",
  "abortCriteriaAcknowledged",
  "noRealMoneyAcknowledged",
  "noLiveProviderAcknowledged",
  "noRuntimeWalletMutationAcknowledged",
  "noRuntimeLedgerMutationAcknowledged",
  "separatePhaseRequiredAcknowledged",
  "separateExplicitAuthorizationRequiredAcknowledged",
  "signatureMethod",
  "signatureTimestamp",
  "signedRecordReference",
]);

const DECISION_OPTIONS = Object.freeze([
  "changes_requested",
  "not_authorized_for_mount",
  "pending_signed_approval_record_review",
]);

const FORBIDDEN_AUTHORIZATION_VALUES = Object.freeze([
  "approved",
  "mount_approved",
  "ready_for_live_traffic",
  "production_ready",
  "live_ready",
  "auto_approved",
  "route_mount_authorized",
  "express_mount_authorized",
]);

const REQUIRED_ACKNOWLEDGEMENTS = Object.freeze([
  "I understand this phase does not mount any Express route.",
  "I understand this phase does not authorize live traffic.",
  "I understand this phase does not authorize wallet mutation.",
  "I understand this phase does not authorize ledger mutation.",
  "I understand this phase does not authorize real money.",
  "I understand a chat message is not a signed approval record.",
  "I understand a mock signed record is not actual authorization.",
  "I understand any future route mount requires a separate phase.",
  "I understand any future route mount requires a separate explicit authorization.",
]);

const REJECTION_RULES = Object.freeze([
  "chat message as signed approval",
  "vague approval phrase",
  "missing reviewer identity",
  "missing review date",
  "missing evidence pack commit",
  "missing Safe CI run id",
  "missing ORO-4L boundary reference",
  "missing acknowledgements",
  "mock placeholder signature as actual record",
  "secret-like signature value in trace",
  "any final route mount authorization state",
  "any Express mount/public alias/runtime mutation present",
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

const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|database_url|privatekey|apikey|api-key|cookie|set-cookie|x-api-key|signature|signedapproval|approvalsignature|signedrecordreference|signaturemethod/i;

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

function sanitizeScalar(value) {
  if (typeof value !== "string") return value;
  if (SENSITIVE_TEXT_PATTERN.test(value)) return "[MASKED]";

  let output = value;
  for (const pattern of SECRET_SHAPED_PATTERNS) {
    output = output.replace(pattern, "[MASKED]");
  }
  return output;
}

function sanitizeSignedApprovalIntakeTrace(value) {
  if (Array.isArray(value)) return value.map((entry) => sanitizeSignedApprovalIntakeTrace(entry));
  if (!isPlainObject(value)) return sanitizeScalar(value);

  const output = {};
  let maskedFieldCount = 0;
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      maskedFieldCount += 1;
      continue;
    }
    output[key] = sanitizeSignedApprovalIntakeTrace(entry);
  }
  if (maskedFieldCount > 0) output.maskedFieldCount = maskedFieldCount;
  return output;
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

function hasSecretShapedValue(value) {
  return collectStringValues(value).some(
    (entry) => SENSITIVE_TEXT_PATTERN.test(entry) || SECRET_SHAPED_PATTERNS.some((pattern) => pattern.test(entry))
  );
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  return {
    id: String(source.id || "unnamed-signed-approval-intake-gate-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    signedApprovalIntakeContract: isPlainObject(source.signedApprovalIntakeContract)
      ? source.signedApprovalIntakeContract
      : {},
    signedApprovalRecordCandidate: isPlainObject(source.signedApprovalRecordCandidate)
      ? source.signedApprovalRecordCandidate
      : {},
    chatApprovalPhraseCandidate: isPlainObject(source.chatApprovalPhraseCandidate)
      ? source.chatApprovalPhraseCandidate
      : {},
    attemptedAuthorizationStates: isPlainObject(source.attemptedAuthorizationStates)
      ? source.attemptedAuthorizationStates
      : {},
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function sourcePresent(source) {
  if (source === true) return true;
  if (!isPlainObject(source)) return false;
  if (source.present === false) return false;
  return source.present === true || source.status === "present" || source.result === PASS || source.result === "AVAILABLE";
}

function evidencePresent(fixture, key) {
  if (key === "staticSafetyChecks" && Object.keys(fixture.staticSafetyChecks).length > 0) return true;
  return sourcePresent(fixture.evidenceSources[key]);
}

function buildEvidenceItems(fixture) {
  return REQUIRED_EVIDENCE.map(([key, missingMessage]) => {
    const present = evidencePresent(fixture, key);
    return {
      key,
      label: missingMessage.replace(/^missing\s+/, ""),
      present,
      status: present ? "present" : "missing",
    };
  });
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

function normalizeContract(contract) {
  const fields = Array.isArray(contract.fields) ? contract.fields.map(String) : [];
  const decisionOptions = Array.isArray(contract.decisionOptions) ? contract.decisionOptions.map(String) : [];
  const missingFields = REQUIRED_CONTRACT_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionOptions = decisionOptions.filter(
    (option) => !DECISION_OPTIONS.includes(option) || FORBIDDEN_AUTHORIZATION_VALUES.includes(option)
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

function candidatePresent(candidate) {
  if (candidate === true) return true;
  if (!isPlainObject(candidate)) return false;
  return candidate.present === true || candidate.status === "present" || candidate.status === "received";
}

function candidateKind(candidate) {
  return String(candidate.kind || candidate.type || candidate.status || "").toLowerCase();
}

function hasChatApprovalPhrase(fixture) {
  return candidatePresent(fixture.chatApprovalPhraseCandidate) || candidateKind(fixture.signedApprovalRecordCandidate) === "chat_phrase";
}

function hasVagueApprovalPhrase(fixture) {
  return (
    fixture.chatApprovalPhraseCandidate.vague === true ||
    fixture.signedApprovalRecordCandidate.vague === true ||
    candidateKind(fixture.signedApprovalRecordCandidate) === "vague_phrase"
  );
}

function hasMockSignedCandidate(fixture) {
  const candidate = fixture.signedApprovalRecordCandidate;
  const kind = candidateKind(candidate);
  return candidatePresent(candidate) && (candidate.mock === true || kind === "mock" || kind === "mock_candidate");
}

function hasActualSignedApprovalAttempt(fixture) {
  const candidate = fixture.signedApprovalRecordCandidate;
  const kind = candidateKind(candidate);
  return candidatePresent(candidate) && (candidate.actual === true || kind === "actual" || kind === "signed");
}

function hasForbiddenAuthorizationState(fixture) {
  return Object.values(fixture.attemptedAuthorizationStates).some((value) =>
    FORBIDDEN_AUTHORIZATION_VALUES.includes(String(value || ""))
  );
}

function buildSignedApprovalIntakeGateReport(input) {
  const fixture = normalizeInput(input);
  const evidenceItems = buildEvidenceItems(fixture);
  const signedApprovalIntakeContract = normalizeContract(fixture.signedApprovalIntakeContract);
  const safetySummary = buildSafetySummary(fixture);
  const sanitizedTrace = sanitizeSignedApprovalIntakeTrace(fixture.trace);
  const blockers = [];
  const notes = [];

  for (const item of evidenceItems) {
    if (!item.present) blockers.push(REQUIRED_EVIDENCE.find(([key]) => key === item.key)[1]);
  }

  if (!signedApprovalIntakeContract.present) {
    blockers.push("missing signed approval intake contract");
    for (const field of signedApprovalIntakeContract.missingFields) {
      blockers.push(`missing signed approval intake contract field: ${field}`);
    }
    for (const option of signedApprovalIntakeContract.invalidDecisionOptions) {
      blockers.push(`invalid signed approval intake decision option: ${option}`);
    }
  }

  for (const [key, blocker] of SAFETY_EXPECTATIONS) {
    if (!safetyFlag(fixture, key)) blockers.push(blocker);
  }

  if (hasChatApprovalPhrase(fixture)) {
    blockers.push("chat approval is not accepted as signed record");
  }

  if (hasVagueApprovalPhrase(fixture)) {
    blockers.push("vague approval phrase rejected");
  }

  const mockSignedApprovalCandidatePresent = hasMockSignedCandidate(fixture);
  if (mockSignedApprovalCandidatePresent) {
    notes.push("mock candidate is not actual authorization");
  }

  if (hasActualSignedApprovalAttempt(fixture)) {
    blockers.push("actual signed approval record not accepted in ORO-4M static/mock gate");
  }

  if (hasForbiddenAuthorizationState(fixture)) {
    blockers.push("forbidden route mount authorization state");
  }

  if (hasSecretShapedValue(sanitizedTrace)) {
    blockers.push("sanitized trace contains secret-shaped value");
  }

  const signedApprovalRecordPresent =
    mockSignedApprovalCandidatePresent || hasActualSignedApprovalAttempt(fixture) || candidatePresent(fixture.signedApprovalRecordCandidate);
  let signedApprovalIntakeStatus = VERIFICATION_PACK_PASSED_PENDING_HUMAN_RECORD;
  if (!signedApprovalIntakeContract.present) {
    signedApprovalIntakeStatus = INTAKE_CONTRACT_MISSING;
  } else if (mockSignedApprovalCandidatePresent) {
    signedApprovalIntakeStatus = CANDIDATE_RECORD_RECEIVED_FOR_REVIEW;
  } else if (hasActualSignedApprovalAttempt(fixture) || hasChatApprovalPhrase(fixture) || hasVagueApprovalPhrase(fixture)) {
    signedApprovalIntakeStatus = INVALID_SIGNED_RECORD_CANDIDATE;
  } else if (blockers.length > 0) {
    signedApprovalIntakeStatus = NOT_AUTHORIZED_FOR_MOUNT;
  }

  if (hasActualSignedApprovalAttempt(fixture) && blockers.length > 0) {
    signedApprovalIntakeStatus = SIGNED_RECORD_REJECTED;
  }

  const signedApprovalIntakeGateResult = blockers.length === 0 ? PASS : FAIL;
  const preMountAuthorization =
    signedApprovalIntakeGateResult === PASS ? PENDING_SIGNED_APPROVAL_RECORD : NOT_AUTHORIZED_FOR_MOUNT;

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    evidenceItems,
    signedApprovalIntakeContract,
    requiredAcknowledgements: REQUIRED_ACKNOWLEDGEMENTS.slice(),
    rejectionRules: REJECTION_RULES.slice(),
    safetySummary,
    signedApprovalIntakeGateResult,
    signedApprovalIntakeContractPresent: signedApprovalIntakeContract.present,
    signedApprovalRecordPresent,
    signedApprovalRecordVerified: false,
    signedApprovalIntakeStatus,
    preMountAuthorization,
    routeMountAuthorization: NOT_AUTHORIZED_FOR_MOUNT,
    humanAuthorizationRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
    expressMount: safetySummary.expressMount,
    publicAlias: safetySummary.publicAlias,
    activeRoute: safetySummary.activeRoute,
    runtimeTraffic: safetySummary.runtimeTraffic,
    walletMutation: safetySummary.walletMutation,
    ledgerMutation: safetySummary.ledgerMutation,
    prismaWrite: safetySummary.prismaWrite,
    dbTransaction: safetySummary.dbTransaction,
    externalNetwork: safetySummary.externalNetwork,
    liveOroPlayApiCall: safetySummary.liveOroPlayApiCall,
    realMoney: safetySummary.realMoney,
    notes,
    blockers,
    sanitizedTrace,
  };
}

function runSignedApprovalIntakeGate(fixtures) {
  const source = Array.isArray(fixtures) ? fixtures : [fixtures];
  return source.map((fixture) => buildSignedApprovalIntakeGateReport(fixture));
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  INTAKE_CONTRACT_MISSING,
  PENDING_SIGNED_APPROVAL_RECORD,
  CANDIDATE_RECORD_RECEIVED_FOR_REVIEW,
  INVALID_SIGNED_RECORD_CANDIDATE,
  SIGNED_RECORD_REJECTED,
  NOT_AUTHORIZED_FOR_MOUNT,
  VERIFICATION_PACK_PASSED_PENDING_HUMAN_RECORD,
  REQUIRED_EVIDENCE,
  REQUIRED_CONTRACT_FIELDS,
  DECISION_OPTIONS,
  FORBIDDEN_AUTHORIZATION_VALUES,
  REQUIRED_ACKNOWLEDGEMENTS,
  REJECTION_RULES,
  buildSignedApprovalIntakeGateReport,
  runSignedApprovalIntakeGate,
  sanitizeSignedApprovalIntakeTrace,
};
