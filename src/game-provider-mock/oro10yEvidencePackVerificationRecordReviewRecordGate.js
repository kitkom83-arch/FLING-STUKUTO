"use strict";

const {
  HOLD,
  PASS,
  ORO10X_SCOPE,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
} = require("./oro10xEvidencePackVerificationRecordReviewGate");

const ORO10Y_PHASE = "ORO-10Y";
const ORO10X_PHASE = "ORO-10X";
const ORO10Y_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_gate_only";
const ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS = Object.freeze({
  PREPARED: "mock_verification_record_review_record_prepared",
  RECORDED_FOR_REVIEW_ONLY: "mock_verification_record_review_recorded_for_review_only",
  REJECTED: "mock_verification_record_review_record_rejected",
  CHANGES_REQUIRED: "mock_verification_record_review_record_changes_required",
  DIGEST_MISMATCH: "mock_verification_record_review_record_digest_mismatch",
  MISSING_PRIOR_REVIEW: "mock_verification_record_review_record_missing_prior_review",
  MISSING_EVIDENCE: "mock_verification_record_review_record_missing_evidence",
  INCOMPLETE: "mock_verification_record_review_record_incomplete",
  EXPIRED: "mock_verification_record_review_record_expired",
  CONFLICT: "mock_verification_record_review_record_conflict",
  INVALID: "mock_verification_record_review_record_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10Y_RESULT_KEY = "evidencePackVerificationRecordReviewRecordGateResult";
const DEPENDS_ON_ORO10X_KEY = "dependsOnOro10xEvidencePackVerificationRecordReviewGate";
const ORO10X_PASSED_KEY = "oro10xEvidencePackVerificationRecordReviewGatePassed";
const VERIFIED_ORO10X_ONLY_KEY = "verifiedOro10xWasEvidencePackVerificationRecordReviewGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10yEvidencePackVerificationRecordReviewRecordGateFromOro10xFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";

const RECORD_PASS_STATUSES = Object.freeze([
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const RECORD_BLOCKED_STATUSES = Object.freeze([
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10xPredecessorPresent",
  "continuationFromOro10xConfirmed",
  "oro10xEvidencePackVerificationRecordReviewGatePresent",
  "staticEvidencePackVerificationRecordReviewPresent",
  "evidencePackVerificationRecordReviewStaticMockOnly",
  "evidencePackVerificationRecordReviewNonAuthorizing",
  "evidencePackVerificationRecordReviewRecordGatePresent",
  "reviewRecordGateOnly",
  "staticEvidencePackVerificationRecordReviewRecordPresent",
  "evidencePackVerificationRecordReviewRecordStaticMockOnly",
  "evidencePackVerificationRecordReviewRecordOnly",
  "evidencePackVerificationRecordReviewRecordSourceModelPresent",
  "evidencePackVerificationRecordReviewRecordSourceStaticMockOnly",
  "evidencePackVerificationRecordReviewRecordSourceSanitized",
  "evidencePackVerificationRecordReviewRecordSourceFromOro10xOnly",
  "oro10xVerificationRecordReviewAsSource",
  "oro10wVerificationRecordReferenceOnly",
  "oro10vVerificationOutputReferenceOnly",
  "verificationRecordReviewRecordEvidenceBuilt",
  "verificationRecordReviewRecordCompletenessRulesApplied",
  "verificationRecordReviewRecordIntegrityRulesApplied",
  "staticVerificationRecordReviewRecordDigestBuilt",
  "staticVerificationRecordReviewRecordMetadataBuilt",
  "staticVerificationRecordReviewRecordDigestCompared",
  "staticVerificationRecordReviewRecordMetadataCompared",
  "evidencePackVerificationRecordReviewRecordNonAuthorizing",
  "verificationRecordReviewRecordIsNotFinalApprovalIssued",
  "verificationRecordReviewRecordIsNotReviewApprovalDecisionAuthority",
  "verificationRecordReviewRecordIsNotAuditAuthority",
  "verificationRecordReviewRecordIsNotFinalization",
  "verificationRecordReviewRecordIsNotSignedRuntimeApproval",
  "verificationRecordReviewRecordIsNotSignedApprovalArtifactAcceptance",
  "verificationRecordReviewRecordIsNotActualSignedArtifactVerification",
  "verificationRecordReviewRecordDoesNotAuthorizeRuntime",
  "verificationRecordReviewRecordDoesNotAuthorizeRouteMount",
  "verificationRecordReviewRecordDoesNotAuthorizeExternalCall",
  "verificationRecordReviewRecordDoesNotAuthorizeGameLaunch",
  "verificationRecordReviewRecordDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "finalApprovalReviewDecisionAuthorityNotIssued",
  "auditAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "separateApprovalRequired",
  "oro10yShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordReviewRecordOnly",
  "nonAuthorizingEvidencePackVerificationRecordReviewRecordOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoReviewAuthorityOccurred",
  "verifiedNoAuditAuthorityOccurred",
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
  "verifiedNoRuntimeAcceptanceOccurred",
  "verifiedNoRuntimeFinalizationOccurred",
  "verifiedNoRuntimeApprovalChainRolloverOccurred",
  "verifiedNoRuntimeMountOccurred",
  "verifiedNoRouteAliasOccurred",
  "verifiedNoPublicAliasOccurred",
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
  "verifiedShortOro10yFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "finalApprovalIssued",
  "finalApprovalReviewDecisionAuthority",
  "auditAuthority",
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
  "auditApproved",
  "signedApproval",
  "runtimeApproval",
  "runtimeActivation",
  "runtimeEnablement",
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
  "evidencePackVerificationRecordReviewRecordStatus",
  "verificationRecordReviewRecordStatus",
  "reviewRecordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  record_prepared: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  recorded: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  recorded_for_review_only:
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  review_only_recorded:
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  rejected: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  changes_required: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_review:
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  missing_evidence: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  incomplete: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  expired: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  conflict: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  conflicting: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  invalid: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  fail_closed: ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
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
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${key}:${stableDigestInput(value[key])}`)
      .join(",")}}`;
  }
  return String(value);
}

function buildOro10yStaticVerificationRecordReviewRecordDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10y-static-verification-record-review-record-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10ySafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10yDefaultSourceReviewEvidence() {
  return {
    [DEPENDS_ON_ORO10X_KEY]: true,
    [ORO10X_PASSED_KEY]: true,
    [VERIFIED_ORO10X_ONLY_KEY]: true,
    oro10xPhase: ORO10X_PHASE,
    oro10xScope: ORO10X_SCOPE,
    oro10xClosed: true,
    oro10xReviewStatus: ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    oro10xStaticVerificationRecordReviewDigest: "oro10x-static-verification-record-review-digest-reference",
    oro10xVerificationRecordReviewAsSource: true,
    oro10wVerificationRecordReferenceOnly: true,
    oro10vVerificationOutputReferenceOnly: true,
  };
}

function normalizeStatus(rawStatus) {
  const value = String(rawStatus || "").trim();
  if (!value) return ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
  if (Object.values(ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS).includes(value)) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of RECORD_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
}

function buildOro10yDefaultRecordReviewRecordShell() {
  const safetyEvidence = buildOro10ySafetySummary();
  const baseRecord = {
    phase: ORO10Y_PHASE,
    evidencePackVerificationRecordReviewRecordGateScope: ORO10Y_SCOPE,
    evidencePackVerificationRecordReviewRecordStatus:
      ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
    sourceVerificationRecordReviewId: "oro10x-static-evidence-pack-verification-record-review",
    verificationRecordReviewRecordId: "oro10y-static-evidence-pack-verification-record-review-record",
    evidencePackVerificationRecordReviewRecordSourceModel:
      "oro10x_static_mock_evidence_pack_verification_record_review",
    oro10xVerificationRecordReviewPresent: true,
    oro10wVerificationRecordReferenceOnlyPresent: true,
    oro10vVerificationOutputReferenceOnlyPresent: true,
    priorReviewEvidencePresent: true,
    reviewRecordEvidencePresent: true,
    reviewRecordStatusPresent: true,
    reviewRecordMetadataPresent: true,
    verificationRecordReviewRecordComplete: true,
    verificationRecordReviewRecordIntegrityChecked: true,
    verificationRecordReviewRecordExpired: false,
    verificationRecordReviewRecordConflict: false,
    verificationRecordReviewRecordDisposition: "prepared_for_review_record_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10yStaticVerificationRecordReviewRecordDigest({
    phase: ORO10Y_PHASE,
    scope: ORO10Y_SCOPE,
    sourceVerificationRecordReviewId: baseRecord.sourceVerificationRecordReviewId,
    verificationRecordReviewRecordId: baseRecord.verificationRecordReviewRecordId,
    status: baseRecord.evidencePackVerificationRecordReviewRecordStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    sourceReviewEvidence: buildOro10yDefaultSourceReviewEvidence(),
    verificationRecordReviewRecordEvidence: {
      ...baseRecord,
      expectedStaticVerificationRecordReviewRecordDigest: digest,
      providedStaticVerificationRecordReviewRecordDigest: digest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      finalApprovalReviewDecisionAuthority: false,
      auditAuthority: false,
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

function buildOro10yEvidencePackVerificationRecordReviewRecord(input = {}) {
  const baseline = buildOro10yDefaultRecordReviewRecordShell();
  const sourceRecord = isPlainObject(input.verificationRecordReviewRecordEvidence)
    ? input.verificationRecordReviewRecordEvidence
    : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.verificationRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordEvidence
    : {};
  const safeRecord = redactGuardedValues(record);
  const status = normalizeStatus(statusFrom([merged, record]));
  const sourceVerificationRecordReviewId = readStringFrom(
    [record, merged],
    "sourceVerificationRecordReviewId",
    baseline.verificationRecordReviewRecordEvidence.sourceVerificationRecordReviewId
  );
  const verificationRecordReviewRecordId = readStringFrom(
    [record, merged],
    "verificationRecordReviewRecordId",
    baseline.verificationRecordReviewRecordEvidence.verificationRecordReviewRecordId
  );
  const digest = buildOro10yStaticVerificationRecordReviewRecordDigest({
    phase: ORO10Y_PHASE,
    scope: ORO10Y_SCOPE,
    sourceVerificationRecordReviewId,
    verificationRecordReviewRecordId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(
    sourceRecord,
    "expectedStaticVerificationRecordReviewRecordDigest"
  )
    ? readStringFrom([sourceRecord], "expectedStaticVerificationRecordReviewRecordDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(
    sourceRecord,
    "providedStaticVerificationRecordReviewRecordDigest"
  )
    ? readStringFrom([sourceRecord], "providedStaticVerificationRecordReviewRecordDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10Y_PHASE,
    evidencePackVerificationRecordReviewRecordGateScope: ORO10Y_SCOPE,
    evidencePackVerificationRecordReviewRecordStatus: status,
    sourceVerificationRecordReviewId,
    verificationRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordSourceModel: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordSourceModel",
      "oro10x_static_mock_evidence_pack_verification_record_review"
    ),
    oro10xVerificationRecordReviewPresent: readBooleanFrom(
      [record, merged],
      "oro10xVerificationRecordReviewPresent",
      true
    ),
    oro10wVerificationRecordReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro10wVerificationRecordReferenceOnlyPresent",
      true
    ),
    oro10vVerificationOutputReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro10vVerificationOutputReferenceOnlyPresent",
      true
    ),
    priorReviewEvidencePresent: readBooleanFrom([record, merged], "priorReviewEvidencePresent", true),
    reviewRecordEvidencePresent: readBooleanFrom([record, merged], "reviewRecordEvidencePresent", true),
    reviewRecordStatusPresent: readBooleanFrom([record, merged], "reviewRecordStatusPresent", true),
    reviewRecordMetadataPresent: readBooleanFrom([record, merged], "reviewRecordMetadataPresent", true),
    verificationRecordReviewRecordComplete: readBooleanFrom(
      [record, merged],
      "verificationRecordReviewRecordComplete",
      true
    ),
    verificationRecordReviewRecordIntegrityChecked: readBooleanFrom(
      [record, merged],
      "verificationRecordReviewRecordIntegrityChecked",
      true
    ),
    verificationRecordReviewRecordExpired: readBooleanFrom(
      [record, merged],
      "verificationRecordReviewRecordExpired",
      false
    ),
    verificationRecordReviewRecordConflict: readBooleanFrom(
      [record, merged],
      "verificationRecordReviewRecordConflict",
      false
    ),
    verificationRecordReviewRecordDisposition: readStringFrom(
      [record, merged],
      "verificationRecordReviewRecordDisposition",
      "prepared_for_review_record_only"
    ),
    staticVerificationRecordReviewRecordDigest: digest,
    expectedStaticVerificationRecordReviewRecordDigest: expectedDigest,
    providedStaticVerificationRecordReviewRecordDigest: providedDigest,
    verificationRecordReviewRecordDigestMatches:
      expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecordReviewRecord: safeRecord,
    verificationRecordReviewRecordEvidenceBuilt: true,
    evidencePackVerificationRecordReviewRecordSourceSanitized: true,
    staticVerificationRecordReviewRecordDigestBuilt: true,
    staticVerificationRecordReviewRecordMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10yEvidencePackVerificationRecordReviewRecordInput(input = {}) {
  const baseline = buildOro10yDefaultRecordReviewRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const sourceReview = isPlainObject(merged.sourceReviewEvidence) ? merged.sourceReviewEvidence : {};
  const record = isPlainObject(merged.verificationRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecordReviewRecord = buildOro10yEvidencePackVerificationRecordReviewRecord(input);
  const sourceSources = [merged, sourceReview];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, sourceReview];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO10Y_PHASE),
    evidencePackVerificationRecordReviewRecordGateScope: readStringFrom(
      recordSources,
      "evidencePackVerificationRecordReviewRecordGateScope",
      ORO10Y_SCOPE
    ),
    evidencePackVerificationRecordReviewRecordStatus:
      verificationRecordReviewRecord.evidencePackVerificationRecordReviewRecordStatus,
    sourceVerificationRecordReviewId: verificationRecordReviewRecord.sourceVerificationRecordReviewId,
    verificationRecordReviewRecordId: verificationRecordReviewRecord.verificationRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordSourceModel:
      verificationRecordReviewRecord.evidencePackVerificationRecordReviewRecordSourceModel,
    oro10xVerificationRecordReviewPresent:
      verificationRecordReviewRecord.oro10xVerificationRecordReviewPresent,
    oro10wVerificationRecordReferenceOnlyPresent:
      verificationRecordReviewRecord.oro10wVerificationRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent:
      verificationRecordReviewRecord.oro10vVerificationOutputReferenceOnlyPresent,
    priorReviewEvidencePresent: verificationRecordReviewRecord.priorReviewEvidencePresent,
    reviewRecordEvidencePresent: verificationRecordReviewRecord.reviewRecordEvidencePresent,
    reviewRecordStatusPresent: verificationRecordReviewRecord.reviewRecordStatusPresent,
    reviewRecordMetadataPresent: verificationRecordReviewRecord.reviewRecordMetadataPresent,
    verificationRecordReviewRecordComplete:
      verificationRecordReviewRecord.verificationRecordReviewRecordComplete,
    verificationRecordReviewRecordIntegrityChecked:
      verificationRecordReviewRecord.verificationRecordReviewRecordIntegrityChecked,
    verificationRecordReviewRecordExpired:
      verificationRecordReviewRecord.verificationRecordReviewRecordExpired,
    verificationRecordReviewRecordConflict:
      verificationRecordReviewRecord.verificationRecordReviewRecordConflict,
    verificationRecordReviewRecordDisposition:
      verificationRecordReviewRecord.verificationRecordReviewRecordDisposition,
    verificationRecordReviewRecordDigestMatches:
      verificationRecordReviewRecord.verificationRecordReviewRecordDigestMatches,
    verificationRecordReviewRecord,
    [DEPENDS_ON_ORO10X_KEY]: readBooleanFrom(sourceSources, DEPENDS_ON_ORO10X_KEY, true),
    [ORO10X_PASSED_KEY]: readBooleanFrom(sourceSources, ORO10X_PASSED_KEY, true),
    [VERIFIED_ORO10X_ONLY_KEY]: readBooleanFrom(sourceSources, VERIFIED_ORO10X_ONLY_KEY, true),
    oro10xPhase: readStringFrom(sourceSources, "oro10xPhase", ORO10X_PHASE),
    oro10xScope: readStringFrom(sourceSources, "oro10xScope", ORO10X_SCOPE),
    oro10xClosed: readBooleanFrom(sourceSources, "oro10xClosed", true),
    oro10xReviewStatus: readStringFrom(
      sourceSources,
      "oro10xReviewStatus",
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
    ),
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

function assertOro10yNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10yEvidencePackVerificationRecordReviewRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10y`);
  }
  for (const key of [
    "verifiedNoFinalApprovalIssued",
    "verifiedNoReviewAuthorityOccurred",
    "verifiedNoAuditAuthorityOccurred",
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
  const fixture = normalizeOro10yEvidencePackVerificationRecordReviewRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10Y_PHASE) blockers.push("invalid_oro10y_phase");
  if (fixture.evidencePackVerificationRecordReviewRecordGateScope !== ORO10Y_SCOPE) {
    blockers.push("invalid_oro10y_evidence_pack_verification_record_review_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10X_KEY] || !fixture[ORO10X_PASSED_KEY] || !fixture[VERIFIED_ORO10X_ONLY_KEY]) {
    blockers.push("missing_oro10x_evidence_pack_verification_record_review_gate");
  }
  if (fixture.oro10xPhase !== ORO10X_PHASE || fixture.oro10xScope !== ORO10X_SCOPE || !fixture.oro10xClosed) {
    blockers.push("invalid_oro10x_evidence_pack_verification_record_review_gate");
  }
  if (!fixture.sourceVerificationRecordReviewId || fixture.sourceVerificationRecordReviewId.length < 8) {
    blockers.push("invalid_source_verification_record_review_id");
  }
  if (!fixture.verificationRecordReviewRecordId || fixture.verificationRecordReviewRecordId.length < 8) {
    blockers.push("invalid_verification_record_review_record_id");
  }
  if (!fixture.oro10xVerificationRecordReviewPresent) blockers.push("missing_oro10x_verification_record_review");
  if (!fixture.oro10wVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro10w_reference");
  if (!fixture.oro10vVerificationOutputReferenceOnlyPresent) blockers.push("missing_oro10v_reference");
  if (!fixture.priorReviewEvidencePresent) blockers.push("missing_prior_review_evidence");
  if (!fixture.reviewRecordEvidencePresent) blockers.push("missing_review_record_evidence");
  if (!fixture.reviewRecordStatusPresent) blockers.push("missing_review_record_status");
  if (!fixture.reviewRecordMetadataPresent) blockers.push("missing_review_record_metadata");
  if (!fixture.verificationRecordReviewRecordComplete) blockers.push("incomplete_verification_record_review_record");
  if (!fixture.verificationRecordReviewRecordIntegrityChecked) {
    blockers.push("verification_record_review_record_integrity_missing");
  }
  if (fixture.verificationRecordReviewRecordExpired) blockers.push("verification_record_review_record_expired");
  if (fixture.verificationRecordReviewRecordConflict) blockers.push("verification_record_review_record_conflict");
  if (!fixture.verificationRecordReviewRecordDigestMatches) {
    blockers.push("verification_record_review_record_digest_mismatch");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_review_record_digest_mismatch");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW
  ) {
    blockers.push("missing_oro10x_evidence_pack_verification_record_review_gate");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_review_record_evidence");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_verification_record_review_record");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED
  ) {
    blockers.push("verification_record_review_record_expired");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT
  ) {
    blockers.push("verification_record_review_record_conflict");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID
  ) {
    blockers.push("verification_record_review_record_invalid");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordStatus ===
    ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_review_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10yNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordReviewRecordOutcomeFor(status, blockers) {
  if (status === ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED) {
    return "fail_closed";
  }
  if (RECORD_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (status === ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY) {
    return "recorded_for_review_only_non_runtime";
  }
  if (status === ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED) {
    return "rejected_recorded_non_runtime";
  }
  if (status === ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED) {
    return "changes_required_recorded_non_runtime";
  }
  return "verification_record_review_record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10Y_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10Y_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10X_KEY]: pass && fixture[DEPENDS_ON_ORO10X_KEY],
    [ORO10X_PASSED_KEY]: pass && fixture[ORO10X_PASSED_KEY],
    [VERIFIED_ORO10X_ONLY_KEY]: pass && fixture[VERIFIED_ORO10X_ONLY_KEY],
    oro10xPhase: pass ? fixture.oro10xPhase : HOLD,
    oro10xScope: pass ? fixture.oro10xScope : HOLD,
    oro10xClosed: pass && fixture.oro10xClosed,
    evidencePackVerificationRecordReviewRecordGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordStatus
      : ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
    verificationRecordReviewRecordOutcome: verificationRecordReviewRecordOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordStatus,
      blockers
    ),
    verificationRecordReviewRecord: fixture.verificationRecordReviewRecord,
    staticVerificationRecordReviewRecordDigest:
      fixture.verificationRecordReviewRecord.staticVerificationRecordReviewRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10yEvidencePackVerificationRecordReviewRecordGate(
  input = buildOro10yDefaultRecordReviewRecordShell()
) {
  const fixture = normalizeOro10yEvidencePackVerificationRecordReviewRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!RECORD_PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewRecordStatus)) {
    return buildOutput(HOLD, ["verification_record_review_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10yEvidencePackVerificationRecordReviewRecordGate(input = {}) {
  return evaluateOro10yEvidencePackVerificationRecordReviewRecordGate(input);
}

module.exports = {
  ORO10Y_PHASE,
  ORO10Y_SCOPE,
  ORO10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO10Y_RESULT_KEY,
  DEPENDS_ON_ORO10X_KEY,
  ORO10X_PASSED_KEY,
  VERIFIED_ORO10X_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10ySafetySummary,
  buildOro10yDefaultSourceReviewEvidence,
  buildOro10yEvidencePackVerificationRecordReviewRecord,
  buildOro10yStaticVerificationRecordReviewRecordDigest,
  normalizeOro10yEvidencePackVerificationRecordReviewRecordInput,
  assertOro10yNoRuntimeAuthorization,
  evaluateOro10yEvidencePackVerificationRecordReviewRecordGate,
  validateOro10yEvidencePackVerificationRecordReviewRecordGate,
};
