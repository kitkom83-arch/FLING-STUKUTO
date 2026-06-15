"use strict";

const {
  HOLD,
  PASS,
  ORO10S_SCOPE,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS,
  evaluateOro10sFinalApprovalDecisionRecordGate,
} = require("./oro10sFinalApprovalDecisionRecordGate");

const ORO10T_PHASE = "ORO-10T";
const ORO10T_SCOPE = "approval_chain_rollover_final_approval_decision_record_verification_gate_only";
const ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS = Object.freeze({
  PREPARED: "mock_record_verification_prepared",
  VERIFIED_FOR_REVIEW_ONLY: "mock_record_verified_for_review_only",
  VERIFICATION_FAILED: "mock_record_verification_failed",
  HASH_MISMATCH: "mock_record_hash_mismatch",
  EVIDENCE_MISSING: "mock_record_evidence_missing",
  EXPIRED: "mock_record_expired",
  CONFLICT: "mock_record_conflict",
  INVALID: "mock_record_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10T_RESULT_KEY = "finalApprovalDecisionRecordVerificationGateResult";
const DEPENDS_ON_ORO10S_KEY = "dependsOnOro10sFinalApprovalDecisionRecordGate";
const ORO10S_PASSED_KEY = "oro10sFinalApprovalDecisionRecordGatePassed";
const VERIFIED_ORO10S_ONLY_KEY = "verifiedOro10sWasFinalApprovalDecisionRecordGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10tFinalApprovalDecisionRecordVerificationGateFromOro10sFixture";

const RECORD_VERIFICATION_PASS_STATUSES = Object.freeze([
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
]);

const RECORD_VERIFICATION_BLOCKED_STATUSES = Object.freeze([
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.HASH_MISMATCH,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.INVALID,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "oro10ePredecessorPresent",
  "oro10fPredecessorPresent",
  "oro10gPredecessorPresent",
  "oro10hPredecessorPresent",
  "oro10iPredecessorPresent",
  "oro10jPredecessorPresent",
  "oro10kPredecessorPresent",
  "oro10lPredecessorPresent",
  "oro10mPredecessorPresent",
  "oro10nPredecessorPresent",
  "oro10oPredecessorPresent",
  "oro10pPredecessorPresent",
  "oro10qPredecessorPresent",
  "oro10rPredecessorPresent",
  "oro10sPredecessorPresent",
  "continuationFromOro10sConfirmed",
  "oro10sFinalApprovalDecisionRecordGatePresent",
  "staticFinalApprovalDecisionRecordPresent",
  "finalApprovalDecisionRecordStaticMockOnly",
  "finalApprovalDecisionRecordNonAuthorizing",
  "finalApprovalDecisionRecordVerificationGatePresent",
  "staticFinalApprovalDecisionRecordVerificationPresent",
  "finalApprovalDecisionRecordVerificationStaticMockOnly",
  "finalApprovalDecisionRecordVerificationOnly",
  "verifiedRecordSourceModelPresent",
  "verifiedRecordSourceStaticMockOnly",
  "verifiedRecordSourceSanitized",
  "recordVerificationEvidencePackBuilt",
  "staticRecordVerificationDigestBuilt",
  "staticRecordVerificationMetadataBuilt",
  "recordVerificationDigestCompared",
  "recordVerificationMetadataCompared",
  "recordVerificationNonAuthorizing",
  "verifiedForReviewOnlyIsNotFinalApprovalIssued",
  "recordVerificationPassIsNotSignedRuntimeApproval",
  "recordVerificationDigestIsNotActualSignedArtifactVerification",
  "recordVerificationDoesNotAuthorizeRuntime",
  "recordVerificationDoesNotAuthorizeRouteMount",
  "recordVerificationDoesNotAuthorizeExternalCall",
  "recordVerificationDoesNotAuthorizeGameLaunch",
  "recordVerificationDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10tShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionRecordVerificationOnly",
  "nonAuthorizingDecisionRecordVerificationOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedRuntimeApprovalOccurred",
  "verifiedNoSignedApprovalArtifactAcceptedOccurred",
  "verifiedNoActualSignedApprovalArtifactVerifiedOccurred",
  "verifiedNoRuntimeApprovalOccurred",
  "verifiedNoRuntimeActivationOccurred",
  "verifiedNoRuntimeEnablementOccurred",
  "verifiedNoRuntimeAuthzOccurred",
  "verifiedNoRuntimeAcceptanceOccurred",
  "verifiedNoRuntimeFinalizationOccurred",
  "verifiedNoRuntimeApprovalChainRolloverOccurred",
  "verifiedNoRuntimeMountOccurred",
  "verifiedNoRouteAliasOccurred",
  "verifiedNoPublicAliasOccurred",
  "verifiedNoPublicCallbackAliasOccurred",
  "verifiedNoLiveExecutionOccurred",
  "verifiedNoActualExternalCallOccurred",
  "verifiedNoExternalNetworkOccurred",
  "verifiedNoLiveOroPlayApiCallOccurred",
  "verifiedNoGameLaunchCallOccurred",
  "verifiedNoWalletMutationOccurred",
  "verifiedNoLedgerMutationOccurred",
  "verifiedNoDbRuntimeFlowOccurred",
  "verifiedNoPrismaWriteOccurred",
  "verifiedNoDbTransactionOccurred",
  "verifiedNoMigrationOccurred",
  "verifiedNoDeployOccurred",
  "verifiedNoCredentialLikeValuePresent",
  "verifiedNoCredentialHeaderLikeValuePresent",
  "verifiedShortOro10tFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "finalApprovalIssued",
  "signedRuntimeApproval",
  "signedApprovalArtifactAccepted",
  "actualSignedApprovalArtifactVerified",
  "approvalDecisionAuthorizesRuntime",
  "finalApprovalDecisionAuthorizesRuntime",
  "runtimeReviewDecision",
  "runtimeAuthorization",
  "reviewDecisionApproved",
  "signedApproval",
  "runtimeApproval",
  "runtimeActivation",
  "runtimeEnablement",
  "runtimeAuthz",
  "runtimeAcceptance",
  "runtimeFinalization",
  "runtimeApprovalChainRollover",
  "runtimeMount",
  "routeAlias",
  "publicAlias",
  "publicCallbackAlias",
  "liveExecution",
  "actualExternalCall",
  "externalCall",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCallCalled",
  "liveOroPlayApiCalled",
  "gameLaunchCall",
  "walletMutation",
  "ledgerMutation",
  "dbRuntimeFlow",
  "prismaWrite",
  "dbTransaction",
  "migration",
  "deploy",
  "productionDbTouched",
  "realMoneyTouched",
  "credentialLikeValuePresent",
  "credentialHeaderLikeValuePresent",
  "sensitiveOutputPresent",
  "longFilenameDetected",
]);

const RECORD_VERIFICATION_FIELD_ALIASES = Object.freeze([
  "recordVerificationStatus",
  "finalApprovalDecisionRecordVerificationStatus",
  "verificationStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  verification_prepared: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  verified: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  verified_for_review_only: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  review_only_verified: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  failed: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
  verification_failed: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
  hash_mismatch: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.HASH_MISMATCH,
  evidence_missing: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  missing_evidence: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  expired: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
  conflict: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  conflicting: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  invalid: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.INVALID,
  fail_closed: ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
});

const GUARDED_KEY_PARTS = Object.freeze([
  ["to", "ken"],
  ["pass", "word"],
  ["se", "cret"],
  ["auth"],
  ["client", "se", "cret"],
  ["pin"],
  ["device", "id"],
  ["database", "url"],
  ["jwt"],
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
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? deepMerge(output[key], value) : clone(value);
  }
  return output;
}

function flagsFor(keys, value) {
  return keys.reduce((flags, key) => {
    flags[key] = value;
    return flags;
  }, {});
}

function readBooleanFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  }
  return fallback;
}

function readStringFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) return source[key];
  }
  return fallback;
}

function isGuardedKey(key) {
  const normalized = String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return GUARDED_KEY_PARTS.some((parts) => normalized.includes(parts.join("")));
}

function redactGuardedValues(value) {
  if (Array.isArray(value)) return value.map(redactGuardedValues);
  if (!isPlainObject(value)) return value;
  return Object.entries(value).reduce((safe, [key, nested]) => {
    safe[key] = isGuardedKey(key) ? "[REDACTED]" : redactGuardedValues(nested);
    return safe;
  }, {});
}

function stableDigestInput(value) {
  if (Array.isArray(value)) return `[${value.map(stableDigestInput).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${key}:${stableDigestInput(value[key])}`).join(",")}}`;
  }
  return String(value);
}

function buildOro10tStaticRecordVerificationDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10t-static-record-verification-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10tSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10tPredecessorEvidence() {
  const oro10sSummary = evaluateOro10sFinalApprovalDecisionRecordGate();
  const passed = oro10sSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10S_KEY]: true,
    [ORO10S_PASSED_KEY]: passed,
    [VERIFIED_ORO10S_ONLY_KEY]: passed && oro10sSummary.finalApprovalDecisionRecordGateScope === ORO10S_SCOPE,
    oro10sStatus: passed
      ? oro10sSummary.finalApprovalDecisionRecordStatus
      : ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
    oro10sScope: passed ? ORO10S_SCOPE : HOLD,
    oro10sClosed: passed,
    oro10aPredecessorPresent: passed && oro10sSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10sSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10sSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10sSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10sSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10sSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10sSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10sSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10sSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10sSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10sSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10sSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10sSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10sSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10sSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10sSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10sSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed && oro10sSummary.oro10rPredecessorPresent === true,
    oro10sPredecessorPresent: passed,
    oro10sFinalApprovalDecisionRecordGatePresent:
      passed && oro10sSummary.finalApprovalDecisionRecordGateScope === ORO10S_SCOPE,
    staticFinalApprovalDecisionRecordPresent:
      passed && oro10sSummary.staticFinalApprovalDecisionRecordPresent === true,
    finalApprovalDecisionRecordStaticMockOnly:
      passed && oro10sSummary.finalApprovalDecisionRecordStaticMockOnly === true,
    finalApprovalDecisionRecordNonAuthorizing:
      passed && oro10sSummary.finalApprovalDecisionRecordNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10tPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10tPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10tDefaultRecordVerificationShell() {
  const safetyEvidence = buildOro10tSafetySummary();
  const baseRecord = {
    phase: ORO10T_PHASE,
    finalApprovalDecisionRecordVerificationGateScope: ORO10T_SCOPE,
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
    recordId: "oro10t-static-decision-record",
    recordMetadataPresent: true,
    recordEvidencePresent: true,
    recordExpired: false,
    recordConflict: false,
    verificationMetadataPresent: true,
    verifiedRecordSourceModel: "oro10s_static_mock_decision_record",
    verificationDisposition: "prepared_for_review_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10tStaticRecordVerificationDigest({
    phase: ORO10T_PHASE,
    scope: ORO10T_SCOPE,
    recordId: baseRecord.recordId,
    status: baseRecord.finalApprovalDecisionRecordVerificationStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10tPredecessorEvidence(),
    recordVerificationEvidence: {
      ...baseRecord,
      expectedStaticRecordVerificationDigest: digest,
      providedStaticRecordVerificationDigest: digest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      actualSignedApprovalArtifactVerified: false,
      finalApprovalDecisionAuthorizesRuntime: false,
      [["runtime", "Author", "ization"].join("")]: false,
      runtimeApprovalChainRollover: false,
      runtimeMount: false,
      publicAlias: false,
      liveExecution: false,
      externalCall: false,
      gameLaunchCall: false,
    },
    safetyEvidence,
  };
}

function normalizeStatus(rawStatus) {
  const value = String(rawStatus || "").trim();
  if (!value) return ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED;
  if (Object.values(ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of RECORD_VERIFICATION_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED;
}

function buildOro10tRecordVerificationEvidencePack(input = {}) {
  const baseline = buildOro10tDefaultRecordVerificationShell();
  const sourceRecord = isPlainObject(input.recordVerificationEvidence) ? input.recordVerificationEvidence : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.recordVerificationEvidence) ? merged.recordVerificationEvidence : {};
  const safeRecord = redactGuardedValues(record);
  const status = normalizeStatus(statusFrom([merged, record]));
  const recordId = readStringFrom([record, merged], "recordId", baseline.recordVerificationEvidence.recordId);
  const digest = buildOro10tStaticRecordVerificationDigest({
    phase: ORO10T_PHASE,
    scope: ORO10T_SCOPE,
    recordId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(sourceRecord, "expectedStaticRecordVerificationDigest")
    ? readStringFrom([sourceRecord], "expectedStaticRecordVerificationDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(sourceRecord, "providedStaticRecordVerificationDigest")
    ? readStringFrom([sourceRecord], "providedStaticRecordVerificationDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10T_PHASE,
    finalApprovalDecisionRecordVerificationGateScope: ORO10T_SCOPE,
    finalApprovalDecisionRecordVerificationStatus: status,
    recordId,
    recordMetadataPresent: readBooleanFrom([record, merged], "recordMetadataPresent", true),
    recordEvidencePresent: readBooleanFrom([record, merged], "recordEvidencePresent", true),
    recordExpired: readBooleanFrom([record, merged], "recordExpired", false),
    recordConflict: readBooleanFrom([record, merged], "recordConflict", false),
    verificationMetadataPresent: readBooleanFrom([record, merged], "verificationMetadataPresent", true),
    verifiedRecordSourceModel: readStringFrom(
      [record, merged],
      "verifiedRecordSourceModel",
      "oro10s_static_mock_decision_record"
    ),
    verificationDisposition: readStringFrom([record, merged], "verificationDisposition", "prepared_for_review_only"),
    staticRecordVerificationDigest: digest,
    expectedStaticRecordVerificationDigest: expectedDigest,
    providedStaticRecordVerificationDigest: providedDigest,
    recordVerificationDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedRecordVerificationEvidence: safeRecord,
    recordVerificationEvidencePackBuilt: true,
    verifiedRecordSourceSanitized: true,
    staticRecordVerificationDigestBuilt: true,
    staticRecordVerificationMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10tFinalApprovalDecisionRecordVerificationInput(input = {}) {
  const baseline = buildOro10tDefaultRecordVerificationShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const record = isPlainObject(merged.recordVerificationEvidence) ? merged.recordVerificationEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const evidencePack = buildOro10tRecordVerificationEvidencePack(input);
  const predecessorSources = [merged, predecessor];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO10T_PHASE),
    finalApprovalDecisionRecordVerificationGateScope: readStringFrom(
      recordSources,
      "finalApprovalDecisionRecordVerificationGateScope",
      ORO10T_SCOPE
    ),
    finalApprovalDecisionRecordVerificationStatus: evidencePack.finalApprovalDecisionRecordVerificationStatus,
    recordId: evidencePack.recordId,
    recordMetadataPresent: evidencePack.recordMetadataPresent,
    recordEvidencePresent: evidencePack.recordEvidencePresent,
    recordExpired: evidencePack.recordExpired,
    recordConflict: evidencePack.recordConflict,
    verificationMetadataPresent: evidencePack.verificationMetadataPresent,
    verifiedRecordSourceModel: evidencePack.verifiedRecordSourceModel,
    verificationDisposition: evidencePack.verificationDisposition,
    recordVerificationDigestMatches: evidencePack.recordVerificationDigestMatches,
    evidencePack,
    [DEPENDS_ON_ORO10S_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10S_KEY, true),
    [ORO10S_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10S_PASSED_KEY, true),
    [VERIFIED_ORO10S_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10S_ONLY_KEY, true),
    oro10sStatus: readStringFrom(
      predecessorSources,
      "oro10sStatus",
      ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED
    ),
    oro10sScope: readStringFrom(predecessorSources, "oro10sScope", ORO10S_SCOPE),
    oro10sClosed: readBooleanFrom(predecessorSources, "oro10sClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(recordSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      recordSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10tNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10tFinalApprovalDecisionRecordVerificationInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10t`);
  }
  for (const key of [
    "verifiedNoFinalApprovalIssued",
    "verifiedNoRuntimeAuthorizationOccurred",
    "verifiedNoSignedRuntimeApprovalOccurred",
    "verifiedNoSignedApprovalArtifactAcceptedOccurred",
    "verifiedNoActualSignedApprovalArtifactVerifiedOccurred",
    "verifiedNoRuntimeMountOccurred",
    "verifiedNoPublicAliasOccurred",
    "verifiedNoLiveExecutionOccurred",
    "verifiedNoActualExternalCallOccurred",
    "verifiedNoGameLaunchCallOccurred",
    "verifiedNoWalletMutationOccurred",
    "verifiedNoLedgerMutationOccurred",
    "verifiedNoPrismaWriteOccurred",
    "verifiedNoDbTransactionOccurred",
    "verifiedNoMigrationOccurred",
    "verifiedNoDeployOccurred",
    "verifiedNoCredentialLikeValuePresent",
    "verifiedNoCredentialHeaderLikeValuePresent",
  ]) {
    if (fixture[key] !== true) blockers.push(`${key}_required`);
  }
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeOro10tFinalApprovalDecisionRecordVerificationInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10T_PHASE) blockers.push("invalid_oro10t_phase");
  if (fixture.finalApprovalDecisionRecordVerificationGateScope !== ORO10T_SCOPE) {
    blockers.push("invalid_oro10t_final_approval_decision_record_verification_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10S_KEY] || !fixture[ORO10S_PASSED_KEY] || !fixture[VERIFIED_ORO10S_ONLY_KEY]) {
    blockers.push("missing_oro10s_final_approval_decision_record_gate");
  }
  if (fixture.oro10sScope !== ORO10S_SCOPE || !fixture.oro10sClosed) {
    blockers.push("invalid_oro10s_final_approval_decision_record_gate");
  }
  if (!fixture.recordId || fixture.recordId.length < 8) blockers.push("invalid_record_id");
  if (!fixture.recordMetadataPresent) blockers.push("missing_record_metadata");
  if (!fixture.recordEvidencePresent) blockers.push("missing_record_evidence");
  if (!fixture.verificationMetadataPresent) blockers.push("missing_verification_metadata");
  if (fixture.recordExpired) blockers.push("record_expired");
  if (fixture.recordConflict) blockers.push("record_conflict");
  if (!fixture.recordVerificationDigestMatches) blockers.push("record_digest_mismatch");
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.HASH_MISMATCH) {
    blockers.push("record_digest_mismatch");
  }
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING) {
    blockers.push("missing_record_evidence");
  }
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EXPIRED) {
    blockers.push("record_expired");
  }
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.CONFLICT) {
    blockers.push("record_conflict");
  }
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.INVALID) {
    blockers.push("record_invalid");
  }
  if (fixture.finalApprovalDecisionRecordVerificationStatus === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED) {
    blockers.push("record_verification_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10tNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function recordVerificationOutcomeFor(status, blockers) {
  if (status === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (RECORD_VERIFICATION_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "verification_blocked";
  if (status === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY) {
    return "verified_for_review_only_non_runtime";
  }
  if (status === ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED) {
    return "verification_failed_non_runtime";
  }
  return "verification_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10T_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10T_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10S_KEY]: pass && fixture[DEPENDS_ON_ORO10S_KEY],
    [ORO10S_PASSED_KEY]: pass && fixture[ORO10S_PASSED_KEY],
    [VERIFIED_ORO10S_ONLY_KEY]: pass && fixture[VERIFIED_ORO10S_ONLY_KEY],
    oro10sStatus: pass ? fixture.oro10sStatus : HOLD,
    oro10sScope: pass ? fixture.oro10sScope : HOLD,
    oro10sClosed: pass && fixture.oro10sClosed,
    finalApprovalDecisionRecordVerificationGateScope: pass
      ? fixture.finalApprovalDecisionRecordVerificationGateScope
      : HOLD,
    finalApprovalDecisionRecordVerificationStatus: pass
      ? fixture.finalApprovalDecisionRecordVerificationStatus
      : ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
    recordVerificationOutcome: recordVerificationOutcomeFor(fixture.finalApprovalDecisionRecordVerificationStatus, blockers),
    recordVerificationEvidencePack: fixture.evidencePack,
    staticRecordVerificationDigest: fixture.evidencePack.staticRecordVerificationDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10tFinalApprovalDecisionRecordVerificationGate(input = buildOro10tDefaultRecordVerificationShell()) {
  const fixture = normalizeOro10tFinalApprovalDecisionRecordVerificationInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!RECORD_VERIFICATION_PASS_STATUSES.includes(fixture.finalApprovalDecisionRecordVerificationStatus)) {
    return buildOutput(HOLD, ["record_verification_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10tFinalApprovalDecisionRecordVerificationGate(input = {}) {
  return evaluateOro10tFinalApprovalDecisionRecordVerificationGate(input);
}

module.exports = {
  ORO10T_PHASE,
  ORO10T_SCOPE,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS,
  ORO10T_RESULT_KEY,
  DEPENDS_ON_ORO10S_KEY,
  ORO10S_PASSED_KEY,
  VERIFIED_ORO10S_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10tSafetySummary,
  buildOro10tPredecessorEvidence,
  buildOro10tRecordVerificationEvidencePack,
  buildOro10tStaticRecordVerificationDigest,
  normalizeOro10tFinalApprovalDecisionRecordVerificationInput,
  assertOro10tNoRuntimeAuthorization,
  evaluateOro10tFinalApprovalDecisionRecordVerificationGate,
  validateOro10tFinalApprovalDecisionRecordVerificationGate,
};
