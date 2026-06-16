"use strict";

const {
  HOLD,
  PASS,
  ORO10V_SCOPE,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS,
  evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate,
} = require("./oro10vFinalApprovalDecisionEvidencePackVerificationGate");

const ORO10W_PHASE = "ORO-10W";
const ORO10W_SCOPE = "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_gate_only";
const ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS = Object.freeze({
  PREPARED: "mock_verification_record_prepared",
  RECORDED_FOR_REVIEW_ONLY: "mock_verification_record_recorded_for_review_only",
  REJECTED: "mock_verification_record_rejected",
  CHANGES_REQUIRED: "mock_verification_record_changes_required",
  DIGEST_MISMATCH: "mock_verification_record_digest_mismatch",
  MISSING_PRIOR_GATE: "mock_verification_record_missing_prior_gate",
  MISSING_EVIDENCE: "mock_verification_record_missing_evidence",
  INCOMPLETE: "mock_verification_record_incomplete",
  EXPIRED: "mock_verification_record_expired",
  CONFLICT: "mock_verification_record_conflict",
  INVALID: "mock_verification_record_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10W_RESULT_KEY = "evidencePackVerificationRecordGateResult";
const DEPENDS_ON_ORO10V_KEY = "dependsOnOro10vFinalApprovalDecisionEvidencePackVerificationGate";
const ORO10V_PASSED_KEY = "oro10vFinalApprovalDecisionEvidencePackVerificationGatePassed";
const VERIFIED_ORO10V_ONLY_KEY = "verifiedOro10vWasFinalApprovalDecisionEvidencePackVerificationGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10wEvidencePackVerificationRecordGateFromOro10vFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";

const RECORD_PASS_STATUSES = Object.freeze([
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const RECORD_BLOCKED_STATUSES = Object.freeze([
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_GATE,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INVALID,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
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
  "oro10tPredecessorPresent",
  "oro10uPredecessorPresent",
  "oro10vPredecessorPresent",
  "continuationFromOro10vConfirmed",
  "oro10vFinalApprovalDecisionEvidencePackVerificationGatePresent",
  "staticFinalApprovalDecisionEvidencePackVerificationPresent",
  "finalApprovalDecisionEvidencePackVerificationStaticMockOnly",
  "finalApprovalDecisionEvidencePackVerificationNonAuthorizing",
  "evidencePackVerificationRecordGatePresent",
  "recordGateOnly",
  "staticEvidencePackVerificationRecordPresent",
  "evidencePackVerificationRecordStaticMockOnly",
  "evidencePackVerificationRecordOnly",
  "evidencePackVerificationRecordSourceModelPresent",
  "evidencePackVerificationRecordSourceStaticMockOnly",
  "evidencePackVerificationRecordSourceSanitized",
  "evidencePackVerificationRecordSourceFromOro10vOnly",
  "oro10vVerificationOutputAsSource",
  "verificationRecordBuilt",
  "verificationRecordCompletenessRulesApplied",
  "verificationRecordIntegrityRulesApplied",
  "staticVerificationRecordDigestBuilt",
  "staticVerificationRecordMetadataBuilt",
  "staticVerificationRecordDigestCompared",
  "staticVerificationRecordMetadataCompared",
  "evidencePackVerificationRecordNonAuthorizing",
  "verificationRecordIsNotFinalApprovalIssued",
  "verificationRecordIsNotReviewApproval",
  "verificationRecordIsNotFinalization",
  "verificationRecordIsNotSignedRuntimeApproval",
  "verificationRecordIsNotSignedApprovalArtifactAcceptance",
  "verificationRecordIsNotActualSignedArtifactVerification",
  "verificationRecordDoesNotAuthorizeRuntime",
  "verificationRecordDoesNotAuthorizeRouteMount",
  "verificationRecordDoesNotAuthorizeExternalCall",
  "verificationRecordDoesNotAuthorizeGameLaunch",
  "verificationRecordDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "finalApprovalReviewDecisionAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10wShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordOnly",
  "nonAuthorizingEvidencePackVerificationRecordOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoReviewAuthorityOccurred",
  "verifiedNoFinalizationOccurred",
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
  "verifiedShortOro10wFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "finalApprovalIssued",
  "finalApprovalReviewDecisionAuthority",
  "finalApprovalFinalization",
  "reviewAuthority",
  "finalization",
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

const RECORD_FIELD_ALIASES = Object.freeze([
  "evidencePackVerificationRecordStatus",
  "finalApprovalDecisionEvidencePackVerificationRecordStatus",
  "verificationRecordStatus",
  "recordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  record_prepared: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  recorded: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  recorded_for_review_only: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  review_only_recorded: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  rejected: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
  changes_required: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_gate: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_GATE,
  evidence_missing: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  missing_evidence: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  incomplete: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
  expired: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
  conflict: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  conflicting: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  invalid: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INVALID,
  fail_closed: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
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
  ["database", "connection"],
  ["credential"],
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
    if (isGuardedKey(key)) {
      safe[REDACTED_GUARDED_FIELD_KEY] = "[REDACTED]";
      return safe;
    }
    safe[key] = redactGuardedValues(nested);
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

function buildOro10wStaticVerificationRecordDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10w-static-verification-record-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10wSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10wPredecessorEvidence() {
  const oro10vSummary = evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate();
  const passed = oro10vSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10V_KEY]: true,
    [ORO10V_PASSED_KEY]: passed,
    [VERIFIED_ORO10V_ONLY_KEY]:
      passed && oro10vSummary.finalApprovalDecisionEvidencePackVerificationGateScope === ORO10V_SCOPE,
    oro10vStatus: passed
      ? oro10vSummary.finalApprovalDecisionEvidencePackVerificationStatus
      : ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
    oro10vScope: passed ? ORO10V_SCOPE : HOLD,
    oro10vClosed: passed,
    oro10aPredecessorPresent: passed && oro10vSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10vSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10vSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10vSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10vSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10vSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10vSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10vSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10vSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10vSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10vSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10vSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10vSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10vSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10vSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10vSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10vSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed && oro10vSummary.oro10rPredecessorPresent === true,
    oro10sPredecessorPresent: passed && oro10vSummary.oro10sPredecessorPresent === true,
    oro10tPredecessorPresent: passed && oro10vSummary.oro10tPredecessorPresent === true,
    oro10uPredecessorPresent: passed && oro10vSummary.oro10uPredecessorPresent === true,
    oro10vPredecessorPresent: passed,
    oro10vFinalApprovalDecisionEvidencePackVerificationGatePresent:
      passed && oro10vSummary.finalApprovalDecisionEvidencePackVerificationGateScope === ORO10V_SCOPE,
    staticFinalApprovalDecisionEvidencePackVerificationPresent:
      passed && oro10vSummary.staticFinalApprovalDecisionEvidencePackVerificationPresent === true,
    finalApprovalDecisionEvidencePackVerificationStaticMockOnly:
      passed && oro10vSummary.finalApprovalDecisionEvidencePackVerificationStaticMockOnly === true,
    finalApprovalDecisionEvidencePackVerificationNonAuthorizing:
      passed && oro10vSummary.evidencePackVerificationNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10wPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10wPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10wDefaultRecordShell() {
  const safetyEvidence = buildOro10wSafetySummary();
  const baseRecord = {
    phase: ORO10W_PHASE,
    evidencePackVerificationRecordGateScope: ORO10W_SCOPE,
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
    sourceEvidencePackVerificationId: "oro10v-static-evidence-pack-verification",
    verificationRecordId: "oro10w-static-evidence-pack-verification-record",
    evidencePackVerificationRecordSourceModel:
      "oro10v_static_mock_final_approval_decision_evidence_pack_verification",
    oro10vVerificationOutputPresent: true,
    priorGateEvidencePresent: true,
    verificationEvidencePresent: true,
    verificationStatusPresent: true,
    verificationRecordMetadataPresent: true,
    verificationRecordComplete: true,
    verificationRecordIntegrityChecked: true,
    verificationRecordExpired: false,
    verificationRecordConflict: false,
    verificationRecordDisposition: "prepared_for_review_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10wStaticVerificationRecordDigest({
    phase: ORO10W_PHASE,
    scope: ORO10W_SCOPE,
    sourceEvidencePackVerificationId: baseRecord.sourceEvidencePackVerificationId,
    verificationRecordId: baseRecord.verificationRecordId,
    status: baseRecord.evidencePackVerificationRecordStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10wPredecessorEvidence(),
    verificationRecordEvidence: {
      ...baseRecord,
      expectedStaticVerificationRecordDigest: digest,
      providedStaticVerificationRecordDigest: digest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      finalApprovalReviewDecisionAuthority: false,
      finalApprovalFinalization: false,
      reviewAuthority: false,
      finalization: false,
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
  if (!value) return ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED;
  if (Object.values(ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of RECORD_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED;
}

function buildOro10wEvidencePackVerificationRecord(input = {}) {
  const baseline = buildOro10wDefaultRecordShell();
  const sourceRecord = isPlainObject(input.verificationRecordEvidence) ? input.verificationRecordEvidence : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const safeRecord = redactGuardedValues(record);
  const status = normalizeStatus(statusFrom([merged, record]));
  const sourceEvidencePackVerificationId = readStringFrom(
    [record, merged],
    "sourceEvidencePackVerificationId",
    baseline.verificationRecordEvidence.sourceEvidencePackVerificationId
  );
  const verificationRecordId = readStringFrom(
    [record, merged],
    "verificationRecordId",
    baseline.verificationRecordEvidence.verificationRecordId
  );
  const digest = buildOro10wStaticVerificationRecordDigest({
    phase: ORO10W_PHASE,
    scope: ORO10W_SCOPE,
    sourceEvidencePackVerificationId,
    verificationRecordId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(sourceRecord, "expectedStaticVerificationRecordDigest")
    ? readStringFrom([sourceRecord], "expectedStaticVerificationRecordDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(sourceRecord, "providedStaticVerificationRecordDigest")
    ? readStringFrom([sourceRecord], "providedStaticVerificationRecordDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10W_PHASE,
    evidencePackVerificationRecordGateScope: ORO10W_SCOPE,
    evidencePackVerificationRecordStatus: status,
    sourceEvidencePackVerificationId,
    verificationRecordId,
    evidencePackVerificationRecordSourceModel: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordSourceModel",
      "oro10v_static_mock_final_approval_decision_evidence_pack_verification"
    ),
    oro10vVerificationOutputPresent: readBooleanFrom([record, merged], "oro10vVerificationOutputPresent", true),
    priorGateEvidencePresent: readBooleanFrom([record, merged], "priorGateEvidencePresent", true),
    verificationEvidencePresent: readBooleanFrom([record, merged], "verificationEvidencePresent", true),
    verificationStatusPresent: readBooleanFrom([record, merged], "verificationStatusPresent", true),
    verificationRecordMetadataPresent: readBooleanFrom([record, merged], "verificationRecordMetadataPresent", true),
    verificationRecordComplete: readBooleanFrom([record, merged], "verificationRecordComplete", true),
    verificationRecordIntegrityChecked: readBooleanFrom([record, merged], "verificationRecordIntegrityChecked", true),
    verificationRecordExpired: readBooleanFrom([record, merged], "verificationRecordExpired", false),
    verificationRecordConflict: readBooleanFrom([record, merged], "verificationRecordConflict", false),
    verificationRecordDisposition: readStringFrom(
      [record, merged],
      "verificationRecordDisposition",
      "prepared_for_review_only"
    ),
    staticVerificationRecordDigest: digest,
    expectedStaticVerificationRecordDigest: expectedDigest,
    providedStaticVerificationRecordDigest: providedDigest,
    verificationRecordDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecord: safeRecord,
    verificationRecordBuilt: true,
    evidencePackVerificationRecordSourceSanitized: true,
    staticVerificationRecordDigestBuilt: true,
    staticVerificationRecordMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10wEvidencePackVerificationRecordInput(input = {}) {
  const baseline = buildOro10wDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const record = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecord = buildOro10wEvidencePackVerificationRecord(input);
  const predecessorSources = [merged, predecessor];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO10W_PHASE),
    evidencePackVerificationRecordGateScope: readStringFrom(
      recordSources,
      "evidencePackVerificationRecordGateScope",
      ORO10W_SCOPE
    ),
    evidencePackVerificationRecordStatus: verificationRecord.evidencePackVerificationRecordStatus,
    sourceEvidencePackVerificationId: verificationRecord.sourceEvidencePackVerificationId,
    verificationRecordId: verificationRecord.verificationRecordId,
    evidencePackVerificationRecordSourceModel: verificationRecord.evidencePackVerificationRecordSourceModel,
    oro10vVerificationOutputPresent: verificationRecord.oro10vVerificationOutputPresent,
    priorGateEvidencePresent: verificationRecord.priorGateEvidencePresent,
    verificationEvidencePresent: verificationRecord.verificationEvidencePresent,
    verificationStatusPresent: verificationRecord.verificationStatusPresent,
    verificationRecordMetadataPresent: verificationRecord.verificationRecordMetadataPresent,
    verificationRecordComplete: verificationRecord.verificationRecordComplete,
    verificationRecordIntegrityChecked: verificationRecord.verificationRecordIntegrityChecked,
    verificationRecordExpired: verificationRecord.verificationRecordExpired,
    verificationRecordConflict: verificationRecord.verificationRecordConflict,
    verificationRecordDisposition: verificationRecord.verificationRecordDisposition,
    verificationRecordDigestMatches: verificationRecord.verificationRecordDigestMatches,
    verificationRecord,
    [DEPENDS_ON_ORO10V_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10V_KEY, true),
    [ORO10V_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10V_PASSED_KEY, true),
    [VERIFIED_ORO10V_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10V_ONLY_KEY, true),
    oro10vStatus: readStringFrom(
      predecessorSources,
      "oro10vStatus",
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED
    ),
    oro10vScope: readStringFrom(predecessorSources, "oro10vScope", ORO10V_SCOPE),
    oro10vClosed: readBooleanFrom(predecessorSources, "oro10vClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(recordSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(recordSources, "nextStepRequiresSeparateRuntimeApproval", true),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10wNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10wEvidencePackVerificationRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10w`);
  }
  for (const key of [
    "verifiedNoFinalApprovalIssued",
    "verifiedNoReviewAuthorityOccurred",
    "verifiedNoFinalizationOccurred",
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
  const fixture = normalizeOro10wEvidencePackVerificationRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10W_PHASE) blockers.push("invalid_oro10w_phase");
  if (fixture.evidencePackVerificationRecordGateScope !== ORO10W_SCOPE) {
    blockers.push("invalid_oro10w_evidence_pack_verification_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10V_KEY] || !fixture[ORO10V_PASSED_KEY] || !fixture[VERIFIED_ORO10V_ONLY_KEY]) {
    blockers.push("missing_oro10v_final_approval_decision_evidence_pack_verification_gate");
  }
  if (fixture.oro10vScope !== ORO10V_SCOPE || !fixture.oro10vClosed) {
    blockers.push("invalid_oro10v_final_approval_decision_evidence_pack_verification_gate");
  }
  if (!fixture.sourceEvidencePackVerificationId || fixture.sourceEvidencePackVerificationId.length < 8) {
    blockers.push("invalid_evidence_pack_verification_id");
  }
  if (!fixture.verificationRecordId || fixture.verificationRecordId.length < 8) {
    blockers.push("invalid_verification_record_id");
  }
  if (!fixture.oro10vVerificationOutputPresent) blockers.push("missing_oro10v_verification_output");
  if (!fixture.priorGateEvidencePresent) blockers.push("missing_prior_gate_evidence");
  if (!fixture.verificationEvidencePresent) blockers.push("missing_verification_evidence");
  if (!fixture.verificationStatusPresent) blockers.push("missing_verification_status");
  if (!fixture.verificationRecordMetadataPresent) blockers.push("missing_verification_record_metadata");
  if (!fixture.verificationRecordComplete) blockers.push("incomplete_verification_record");
  if (!fixture.verificationRecordIntegrityChecked) blockers.push("verification_record_integrity_missing");
  if (fixture.verificationRecordExpired) blockers.push("verification_record_expired");
  if (fixture.verificationRecordConflict) blockers.push("verification_record_conflict");
  if (!fixture.verificationRecordDigestMatches) blockers.push("verification_record_digest_mismatch");
  if (
    fixture.evidencePackVerificationRecordStatus ===
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_digest_mismatch");
  }
  if (
    fixture.evidencePackVerificationRecordStatus ===
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_GATE
  ) {
    blockers.push("missing_oro10v_final_approval_decision_evidence_pack_verification_gate");
  }
  if (
    fixture.evidencePackVerificationRecordStatus ===
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_verification_evidence");
  }
  if (fixture.evidencePackVerificationRecordStatus === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE) {
    blockers.push("incomplete_verification_record");
  }
  if (fixture.evidencePackVerificationRecordStatus === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.EXPIRED) {
    blockers.push("verification_record_expired");
  }
  if (fixture.evidencePackVerificationRecordStatus === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CONFLICT) {
    blockers.push("verification_record_conflict");
  }
  if (fixture.evidencePackVerificationRecordStatus === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INVALID) {
    blockers.push("verification_record_invalid");
  }
  if (
    fixture.evidencePackVerificationRecordStatus === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10wNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordOutcomeFor(status, blockers) {
  if (status === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (RECORD_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (status === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY) {
    return "recorded_for_review_only_non_runtime";
  }
  if (status === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.REJECTED) return "rejected_non_runtime";
  if (status === ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED) {
    return "changes_required_non_runtime";
  }
  return "verification_record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10W_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10W_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10V_KEY]: pass && fixture[DEPENDS_ON_ORO10V_KEY],
    [ORO10V_PASSED_KEY]: pass && fixture[ORO10V_PASSED_KEY],
    [VERIFIED_ORO10V_ONLY_KEY]: pass && fixture[VERIFIED_ORO10V_ONLY_KEY],
    oro10vStatus: pass ? fixture.oro10vStatus : HOLD,
    oro10vScope: pass ? fixture.oro10vScope : HOLD,
    oro10vClosed: pass && fixture.oro10vClosed,
    evidencePackVerificationRecordGateScope: pass ? fixture.evidencePackVerificationRecordGateScope : HOLD,
    evidencePackVerificationRecordStatus: pass
      ? fixture.evidencePackVerificationRecordStatus
      : ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
    verificationRecordOutcome: verificationRecordOutcomeFor(fixture.evidencePackVerificationRecordStatus, blockers),
    verificationRecord: fixture.verificationRecord,
    staticVerificationRecordDigest: fixture.verificationRecord.staticVerificationRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10wEvidencePackVerificationRecordGate(input = buildOro10wDefaultRecordShell()) {
  const fixture = normalizeOro10wEvidencePackVerificationRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!RECORD_PASS_STATUSES.includes(fixture.evidencePackVerificationRecordStatus)) {
    return buildOutput(HOLD, ["verification_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10wEvidencePackVerificationRecordGate(input = {}) {
  return evaluateOro10wEvidencePackVerificationRecordGate(input);
}

module.exports = {
  ORO10W_PHASE,
  ORO10W_SCOPE,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS,
  ORO10W_RESULT_KEY,
  DEPENDS_ON_ORO10V_KEY,
  ORO10V_PASSED_KEY,
  VERIFIED_ORO10V_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10wSafetySummary,
  buildOro10wPredecessorEvidence,
  buildOro10wEvidencePackVerificationRecord,
  buildOro10wStaticVerificationRecordDigest,
  normalizeOro10wEvidencePackVerificationRecordInput,
  assertOro10wNoRuntimeAuthorization,
  evaluateOro10wEvidencePackVerificationRecordGate,
  validateOro10wEvidencePackVerificationRecordGate,
};
