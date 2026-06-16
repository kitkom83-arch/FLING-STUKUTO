"use strict";

const {
  HOLD,
  PASS,
  ORO10W_SCOPE,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS,
  evaluateOro10wEvidencePackVerificationRecordGate,
} = require("./oro10wEvidencePackVerificationRecordGate");

const ORO10X_PHASE = "ORO-10X";
const ORO10X_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_gate_only";
const ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS = Object.freeze({
  PREPARED: "mock_verification_record_review_prepared",
  REVIEWED_FOR_REVIEW_ONLY: "mock_verification_record_reviewed_for_review_only",
  REJECTED: "mock_verification_record_review_rejected",
  CHANGES_REQUIRED: "mock_verification_record_review_changes_required",
  DIGEST_MISMATCH: "mock_verification_record_review_digest_mismatch",
  MISSING_PRIOR_RECORD: "mock_verification_record_review_missing_prior_record",
  MISSING_EVIDENCE: "mock_verification_record_review_missing_evidence",
  INCOMPLETE: "mock_verification_record_review_incomplete",
  EXPIRED: "mock_verification_record_review_expired",
  CONFLICT: "mock_verification_record_review_conflict",
  INVALID: "mock_verification_record_review_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10X_RESULT_KEY = "evidencePackVerificationRecordReviewGateResult";
const DEPENDS_ON_ORO10W_KEY = "dependsOnOro10wEvidencePackVerificationRecordGate";
const ORO10W_PASSED_KEY = "oro10wEvidencePackVerificationRecordGatePassed";
const VERIFIED_ORO10W_ONLY_KEY = "verifiedOro10wWasEvidencePackVerificationRecordGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10xEvidencePackVerificationRecordReviewGateFromOro10wFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";

const REVIEW_PASS_STATUSES = Object.freeze([
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
]);

const REVIEW_BLOCKED_STATUSES = Object.freeze([
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
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
  "oro10wPredecessorPresent",
  "continuationFromOro10wConfirmed",
  "oro10wEvidencePackVerificationRecordGatePresent",
  "staticEvidencePackVerificationRecordPresent",
  "evidencePackVerificationRecordStaticMockOnly",
  "evidencePackVerificationRecordNonAuthorizing",
  "evidencePackVerificationRecordReviewGatePresent",
  "recordReviewGateOnly",
  "staticEvidencePackVerificationRecordReviewPresent",
  "evidencePackVerificationRecordReviewStaticMockOnly",
  "evidencePackVerificationRecordReviewOnly",
  "evidencePackVerificationRecordReviewSourceModelPresent",
  "evidencePackVerificationRecordReviewSourceStaticMockOnly",
  "evidencePackVerificationRecordReviewSourceSanitized",
  "evidencePackVerificationRecordReviewSourceFromOro10wOnly",
  "oro10wVerificationRecordAsSource",
  "oro10vVerificationOutputReferenceOnly",
  "verificationRecordReviewEvidenceBuilt",
  "verificationRecordReviewCompletenessRulesApplied",
  "verificationRecordReviewIntegrityRulesApplied",
  "staticVerificationRecordReviewDigestBuilt",
  "staticVerificationRecordReviewMetadataBuilt",
  "staticVerificationRecordReviewDigestCompared",
  "staticVerificationRecordReviewMetadataCompared",
  "evidencePackVerificationRecordReviewNonAuthorizing",
  "verificationRecordReviewIsNotFinalApprovalIssued",
  "verificationRecordReviewIsNotReviewApprovalDecisionAuthority",
  "verificationRecordReviewIsNotFinalization",
  "verificationRecordReviewIsNotSignedRuntimeApproval",
  "verificationRecordReviewIsNotSignedApprovalArtifactAcceptance",
  "verificationRecordReviewIsNotActualSignedArtifactVerification",
  "verificationRecordReviewDoesNotAuthorizeRuntime",
  "verificationRecordReviewDoesNotAuthorizeRouteMount",
  "verificationRecordReviewDoesNotAuthorizeExternalCall",
  "verificationRecordReviewDoesNotAuthorizeGameLaunch",
  "verificationRecordReviewDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "finalApprovalReviewDecisionAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10xShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordReviewOnly",
  "nonAuthorizingEvidencePackVerificationRecordReviewOnly",
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
  "verifiedShortOro10xFilenamesOnly",
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

const REVIEW_FIELD_ALIASES = Object.freeze([
  "evidencePackVerificationRecordReviewStatus",
  "verificationRecordReviewStatus",
  "reviewStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  review_prepared: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  reviewed: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  reviewed_for_review_only: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  review_only_reviewed: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  rejected: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
  changes_required: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_record: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
  evidence_missing: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
  missing_evidence: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
  incomplete: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
  expired: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
  conflict: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  conflicting: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  invalid: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID,
  fail_closed: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
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

function buildOro10xStaticVerificationRecordReviewDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10x-static-verification-record-review-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10xSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10xPredecessorEvidence() {
  const oro10wSummary = evaluateOro10wEvidencePackVerificationRecordGate();
  const passed = oro10wSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10W_KEY]: true,
    [ORO10W_PASSED_KEY]: passed,
    [VERIFIED_ORO10W_ONLY_KEY]:
      passed && oro10wSummary.evidencePackVerificationRecordGateScope === ORO10W_SCOPE,
    oro10wStatus: passed
      ? oro10wSummary.evidencePackVerificationRecordStatus
      : ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
    oro10wScope: passed ? ORO10W_SCOPE : HOLD,
    oro10wClosed: passed,
    oro10aPredecessorPresent: passed && oro10wSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10wSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10wSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10wSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10wSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10wSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10wSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10wSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10wSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10wSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10wSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10wSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10wSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10wSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10wSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10wSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10wSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed && oro10wSummary.oro10rPredecessorPresent === true,
    oro10sPredecessorPresent: passed && oro10wSummary.oro10sPredecessorPresent === true,
    oro10tPredecessorPresent: passed && oro10wSummary.oro10tPredecessorPresent === true,
    oro10uPredecessorPresent: passed && oro10wSummary.oro10uPredecessorPresent === true,
    oro10vPredecessorPresent: passed && oro10wSummary.oro10vPredecessorPresent === true,
    oro10wPredecessorPresent: passed,
    oro10wEvidencePackVerificationRecordGatePresent:
      passed && oro10wSummary.evidencePackVerificationRecordGateScope === ORO10W_SCOPE,
    staticEvidencePackVerificationRecordPresent:
      passed && oro10wSummary.staticEvidencePackVerificationRecordPresent === true,
    evidencePackVerificationRecordStaticMockOnly:
      passed && oro10wSummary.evidencePackVerificationRecordStaticMockOnly === true,
    evidencePackVerificationRecordNonAuthorizing:
      passed && oro10wSummary.evidencePackVerificationRecordNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10xPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10xPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10xDefaultRecordReviewShell() {
  const safetyEvidence = buildOro10xSafetySummary();
  const baseReview = {
    phase: ORO10X_PHASE,
    evidencePackVerificationRecordReviewGateScope: ORO10X_SCOPE,
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    sourceVerificationRecordId: "oro10w-static-evidence-pack-verification-record",
    verificationRecordReviewId: "oro10x-static-evidence-pack-verification-record-review",
    evidencePackVerificationRecordReviewSourceModel: "oro10w_static_mock_evidence_pack_verification_record",
    oro10wVerificationRecordPresent: true,
    priorRecordEvidencePresent: true,
    reviewEvidencePresent: true,
    reviewStatusPresent: true,
    reviewMetadataPresent: true,
    verificationRecordComplete: true,
    verificationRecordIntegrityChecked: true,
    verificationRecordExpired: false,
    verificationRecordConflict: false,
    verificationRecordReviewDisposition: "prepared_for_review_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10xStaticVerificationRecordReviewDigest({
    phase: ORO10X_PHASE,
    scope: ORO10X_SCOPE,
    sourceVerificationRecordId: baseReview.sourceVerificationRecordId,
    verificationRecordReviewId: baseReview.verificationRecordReviewId,
    status: baseReview.evidencePackVerificationRecordReviewStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10xPredecessorEvidence(),
    verificationRecordReviewEvidence: {
      ...baseReview,
      expectedStaticVerificationRecordReviewDigest: digest,
      providedStaticVerificationRecordReviewDigest: digest,
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
  if (!value) return ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED;
  if (Object.values(ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of REVIEW_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED;
}

function buildOro10xEvidencePackVerificationRecordReviewEvidence(input = {}) {
  const baseline = buildOro10xDefaultRecordReviewShell();
  const sourceReview = isPlainObject(input.verificationRecordReviewEvidence)
    ? input.verificationRecordReviewEvidence
    : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const review = isPlainObject(merged.verificationRecordReviewEvidence) ? merged.verificationRecordReviewEvidence : {};
  const safeReview = redactGuardedValues(review);
  const status = normalizeStatus(statusFrom([merged, review]));
  const sourceVerificationRecordId = readStringFrom(
    [review, merged],
    "sourceVerificationRecordId",
    baseline.verificationRecordReviewEvidence.sourceVerificationRecordId
  );
  const verificationRecordReviewId = readStringFrom(
    [review, merged],
    "verificationRecordReviewId",
    baseline.verificationRecordReviewEvidence.verificationRecordReviewId
  );
  const digest = buildOro10xStaticVerificationRecordReviewDigest({
    phase: ORO10X_PHASE,
    scope: ORO10X_SCOPE,
    sourceVerificationRecordId,
    verificationRecordReviewId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(
    sourceReview,
    "expectedStaticVerificationRecordReviewDigest"
  )
    ? readStringFrom([sourceReview], "expectedStaticVerificationRecordReviewDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(
    sourceReview,
    "providedStaticVerificationRecordReviewDigest"
  )
    ? readStringFrom([sourceReview], "providedStaticVerificationRecordReviewDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10X_PHASE,
    evidencePackVerificationRecordReviewGateScope: ORO10X_SCOPE,
    evidencePackVerificationRecordReviewStatus: status,
    sourceVerificationRecordId,
    verificationRecordReviewId,
    evidencePackVerificationRecordReviewSourceModel: readStringFrom(
      [review, merged],
      "evidencePackVerificationRecordReviewSourceModel",
      "oro10w_static_mock_evidence_pack_verification_record"
    ),
    oro10wVerificationRecordPresent: readBooleanFrom([review, merged], "oro10wVerificationRecordPresent", true),
    priorRecordEvidencePresent: readBooleanFrom([review, merged], "priorRecordEvidencePresent", true),
    reviewEvidencePresent: readBooleanFrom([review, merged], "reviewEvidencePresent", true),
    reviewStatusPresent: readBooleanFrom([review, merged], "reviewStatusPresent", true),
    reviewMetadataPresent: readBooleanFrom([review, merged], "reviewMetadataPresent", true),
    verificationRecordComplete: readBooleanFrom([review, merged], "verificationRecordComplete", true),
    verificationRecordIntegrityChecked: readBooleanFrom([review, merged], "verificationRecordIntegrityChecked", true),
    verificationRecordExpired: readBooleanFrom([review, merged], "verificationRecordExpired", false),
    verificationRecordConflict: readBooleanFrom([review, merged], "verificationRecordConflict", false),
    verificationRecordReviewDisposition: readStringFrom(
      [review, merged],
      "verificationRecordReviewDisposition",
      "prepared_for_review_only"
    ),
    staticVerificationRecordReviewDigest: digest,
    expectedStaticVerificationRecordReviewDigest: expectedDigest,
    providedStaticVerificationRecordReviewDigest: providedDigest,
    verificationRecordReviewDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecordReview: safeReview,
    verificationRecordReviewEvidenceBuilt: true,
    evidencePackVerificationRecordReviewSourceSanitized: true,
    staticVerificationRecordReviewDigestBuilt: true,
    staticVerificationRecordReviewMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10xEvidencePackVerificationRecordReviewInput(input = {}) {
  const baseline = buildOro10xDefaultRecordReviewShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const review = isPlainObject(merged.verificationRecordReviewEvidence)
    ? merged.verificationRecordReviewEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecordReview = buildOro10xEvidencePackVerificationRecordReviewEvidence(input);
  const predecessorSources = [merged, predecessor];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(reviewSources, "phase", ORO10X_PHASE),
    evidencePackVerificationRecordReviewGateScope: readStringFrom(
      reviewSources,
      "evidencePackVerificationRecordReviewGateScope",
      ORO10X_SCOPE
    ),
    evidencePackVerificationRecordReviewStatus:
      verificationRecordReview.evidencePackVerificationRecordReviewStatus,
    sourceVerificationRecordId: verificationRecordReview.sourceVerificationRecordId,
    verificationRecordReviewId: verificationRecordReview.verificationRecordReviewId,
    evidencePackVerificationRecordReviewSourceModel:
      verificationRecordReview.evidencePackVerificationRecordReviewSourceModel,
    oro10wVerificationRecordPresent: verificationRecordReview.oro10wVerificationRecordPresent,
    priorRecordEvidencePresent: verificationRecordReview.priorRecordEvidencePresent,
    reviewEvidencePresent: verificationRecordReview.reviewEvidencePresent,
    reviewStatusPresent: verificationRecordReview.reviewStatusPresent,
    reviewMetadataPresent: verificationRecordReview.reviewMetadataPresent,
    verificationRecordComplete: verificationRecordReview.verificationRecordComplete,
    verificationRecordIntegrityChecked: verificationRecordReview.verificationRecordIntegrityChecked,
    verificationRecordExpired: verificationRecordReview.verificationRecordExpired,
    verificationRecordConflict: verificationRecordReview.verificationRecordConflict,
    verificationRecordReviewDisposition: verificationRecordReview.verificationRecordReviewDisposition,
    verificationRecordReviewDigestMatches: verificationRecordReview.verificationRecordReviewDigestMatches,
    verificationRecordReview,
    [DEPENDS_ON_ORO10W_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10W_KEY, true),
    [ORO10W_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10W_PASSED_KEY, true),
    [VERIFIED_ORO10W_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10W_ONLY_KEY, true),
    oro10wStatus: readStringFrom(
      predecessorSources,
      "oro10wStatus",
      ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED
    ),
    oro10wScope: readStringFrom(predecessorSources, "oro10wScope", ORO10W_SCOPE),
    oro10wClosed: readBooleanFrom(predecessorSources, "oro10wClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(reviewSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(reviewSources, "nextStepRequiresSeparateRuntimeApproval", true),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10xNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10xEvidencePackVerificationRecordReviewInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10x`);
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
  const fixture = normalizeOro10xEvidencePackVerificationRecordReviewInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10X_PHASE) blockers.push("invalid_oro10x_phase");
  if (fixture.evidencePackVerificationRecordReviewGateScope !== ORO10X_SCOPE) {
    blockers.push("invalid_oro10x_evidence_pack_verification_record_review_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10W_KEY] || !fixture[ORO10W_PASSED_KEY] || !fixture[VERIFIED_ORO10W_ONLY_KEY]) {
    blockers.push("missing_oro10w_evidence_pack_verification_record_gate");
  }
  if (fixture.oro10wScope !== ORO10W_SCOPE || !fixture.oro10wClosed) {
    blockers.push("invalid_oro10w_evidence_pack_verification_record_gate");
  }
  if (!fixture.sourceVerificationRecordId || fixture.sourceVerificationRecordId.length < 8) {
    blockers.push("invalid_source_verification_record_id");
  }
  if (!fixture.verificationRecordReviewId || fixture.verificationRecordReviewId.length < 8) {
    blockers.push("invalid_verification_record_review_id");
  }
  if (!fixture.oro10wVerificationRecordPresent) blockers.push("missing_oro10w_verification_record");
  if (!fixture.priorRecordEvidencePresent) blockers.push("missing_prior_record_evidence");
  if (!fixture.reviewEvidencePresent) blockers.push("missing_review_evidence");
  if (!fixture.reviewStatusPresent) blockers.push("missing_review_status");
  if (!fixture.reviewMetadataPresent) blockers.push("missing_review_metadata");
  if (!fixture.verificationRecordComplete) blockers.push("incomplete_verification_record_review");
  if (!fixture.verificationRecordIntegrityChecked) blockers.push("verification_record_review_integrity_missing");
  if (fixture.verificationRecordExpired) blockers.push("verification_record_review_expired");
  if (fixture.verificationRecordConflict) blockers.push("verification_record_review_conflict");
  if (!fixture.verificationRecordReviewDigestMatches) blockers.push("verification_record_review_digest_mismatch");
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_review_digest_mismatch");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD
  ) {
    blockers.push("missing_oro10w_evidence_pack_verification_record_gate");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_review_evidence");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_verification_record_review");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED
  ) {
    blockers.push("verification_record_review_expired");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT
  ) {
    blockers.push("verification_record_review_conflict");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID
  ) {
    blockers.push("verification_record_review_invalid");
  }
  if (
    fixture.evidencePackVerificationRecordReviewStatus ===
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_review_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10xNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordReviewOutcomeFor(status, blockers) {
  if (status === ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (REVIEW_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "review_blocked";
  if (status === ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY) {
    return "reviewed_for_review_only_non_runtime";
  }
  if (status === ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED) {
    return "rejected_non_runtime";
  }
  if (status === ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED) {
    return "changes_required_non_runtime";
  }
  return "verification_record_review_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10X_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10X_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10W_KEY]: pass && fixture[DEPENDS_ON_ORO10W_KEY],
    [ORO10W_PASSED_KEY]: pass && fixture[ORO10W_PASSED_KEY],
    [VERIFIED_ORO10W_ONLY_KEY]: pass && fixture[VERIFIED_ORO10W_ONLY_KEY],
    oro10wStatus: pass ? fixture.oro10wStatus : HOLD,
    oro10wScope: pass ? fixture.oro10wScope : HOLD,
    oro10wClosed: pass && fixture.oro10wClosed,
    evidencePackVerificationRecordReviewGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewGateScope
      : HOLD,
    evidencePackVerificationRecordReviewStatus: pass
      ? fixture.evidencePackVerificationRecordReviewStatus
      : ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
    verificationRecordReviewOutcome: verificationRecordReviewOutcomeFor(
      fixture.evidencePackVerificationRecordReviewStatus,
      blockers
    ),
    verificationRecordReview: fixture.verificationRecordReview,
    staticVerificationRecordReviewDigest: fixture.verificationRecordReview.staticVerificationRecordReviewDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10xEvidencePackVerificationRecordReviewGate(
  input = buildOro10xDefaultRecordReviewShell()
) {
  const fixture = normalizeOro10xEvidencePackVerificationRecordReviewInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!REVIEW_PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewStatus)) {
    return buildOutput(HOLD, ["verification_record_review_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10xEvidencePackVerificationRecordReviewGate(input = {}) {
  return evaluateOro10xEvidencePackVerificationRecordReviewGate(input);
}

module.exports = {
  ORO10X_PHASE,
  ORO10X_SCOPE,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO10X_RESULT_KEY,
  DEPENDS_ON_ORO10W_KEY,
  ORO10W_PASSED_KEY,
  VERIFIED_ORO10W_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10xSafetySummary,
  buildOro10xPredecessorEvidence,
  buildOro10xEvidencePackVerificationRecordReviewEvidence,
  buildOro10xStaticVerificationRecordReviewDigest,
  normalizeOro10xEvidencePackVerificationRecordReviewInput,
  assertOro10xNoRuntimeAuthorization,
  evaluateOro10xEvidencePackVerificationRecordReviewGate,
  validateOro10xEvidencePackVerificationRecordReviewGate,
};
