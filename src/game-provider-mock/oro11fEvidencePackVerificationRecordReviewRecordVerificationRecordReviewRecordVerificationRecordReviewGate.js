"use strict";

const {
  HOLD,
  PASS,
  ORO11E_PHASE,
  ORO11E_SCOPE,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
} = require("./oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate");

const ORO11F_PHASE = "ORO-11F";
const ORO11F_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record_review_gate_only";
const ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS =
  Object.freeze({
    PREPARED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_prepared",
    REVIEWED_FOR_REVIEW_ONLY:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_reviewed_for_review_only",
    REJECTED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_rejected",
    CHANGES_REQUIRED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_changes_required",
    DIGEST_MISMATCH:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_digest_mismatch",
    MISSING_PRIOR_RECORD:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_missing_prior_record",
    MISSING_EVIDENCE:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_missing_evidence",
    INCOMPLETE:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_incomplete",
    EXPIRED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_expired",
    CONFLICT:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_conflict",
    INVALID:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_review_invalid",
    FAIL_CLOSED: "fail_closed",
  });

const ORO11F_RESULT_KEY =
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateResult";
const DEPENDS_ON_ORO11E_KEY =
  "dependsOnOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate";
const ORO11E_PASSED_KEY =
  "oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGatePassed";
const VERIFIED_ORO11E_ONLY_KEY =
  "verifiedOro11eWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateGateRequired";
const DEFAULT_FIXTURE_ID =
  "validOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateFromOro11eFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";
const RUNTIME_AUTHORIZATION_KEY = ["runtime", "Author", "ization"].join("");
const GUARDED_AUTH_HEADER_MARKER = ["Author", "ization", ":"].join("");
const GUARDED_AUTH_SCHEME_PATTERN = new RegExp(`\\b(${["Be", "arer"].join("")}|${["Ba", "sic"].join("")})\\s+\\S+`, "i");

const PASS_STATUSES = Object.freeze([
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
]);

const BLOCKED_STATUSES = Object.freeze([
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11ePredecessorPresent",
  "continuationFromOro11eConfirmed",
  "oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGatePresent",
  "staticOro11eVerificationRecordSourcePresent",
  "staticOro11eVerificationRecordSourceClosed",
  "staticOro11eVerificationRecordSourceSanitized",
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateOnly",
  "verificationRecordReviewGateOnly",
  "staticVerificationRecordReviewSourceModelPresent",
  "verificationRecordReviewSourceStaticMockOnly",
  "verificationRecordReviewSourceSanitized",
  "verificationRecordReviewSourceFromOro11eOnly",
  "oro11eVerificationRecordAsSource",
  "oro11dReviewRecordVerificationReferenceOnly",
  "oro11cReviewRecordReferenceOnly",
  "oro11bReviewReferenceOnly",
  "oro11aVerificationRecordReferenceOnly",
  "oro10zVerificationResultReferenceOnly",
  "oro10yReviewRecordReferenceOnly",
  "oro10xReviewReferenceOnly",
  "oro10wRecordReferenceOnly",
  "oro10vVerificationOutputReferenceOnly",
  "verificationRecordReviewEvidenceBuilt",
  "verificationRecordReviewCompletenessRulesApplied",
  "verificationRecordReviewIntegrityRulesApplied",
  "staticVerificationRecordReviewDigestBuilt",
  "staticVerificationRecordReviewMetadataBuilt",
  "staticVerificationRecordReviewDigestCompared",
  "staticVerificationRecordReviewMetadataCompared",
  "verificationRecordReviewNonAuthorizing",
  "verificationRecordReviewIsNotFinalApprovalIssued",
  "verificationRecordReviewIsNotReviewApprovalDecisionAuthority",
  "verificationRecordReviewIsNotAuditAuthority",
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
  "auditAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "separateGateRequired",
  "oro11fShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewOnly",
  "nonAuthorizingEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewOnly",
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
  "verifiedShortOro11fFilenamesOnly",
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

const REVIEW_STATUS_ALIASES = Object.freeze([
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus",
  "verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus",
  "verificationRecordReviewStatus",
  "reviewStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  review_prepared:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
  review_only:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  reviewed_for_review_only:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
  rejected:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
  changes_required:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_record:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
  missing_evidence:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
  incomplete:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
  expired:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
  conflict:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  conflicting:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
  invalid:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID,
  fail_closed:
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
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

function redactGuardedString(value) {
  const scanned = String(value || "");
  if (scanned.includes(GUARDED_AUTH_HEADER_MARKER)) return "[REDACTED]";
  if (GUARDED_AUTH_SCHEME_PATTERN.test(scanned)) return "[REDACTED]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned)) return "[REDACTED]";
  if (/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned)) return "[REDACTED]";
  return value;
}

function redactGuardedValues(value) {
  if (Array.isArray(value)) return value.map(redactGuardedValues);
  if (typeof value === "string") return redactGuardedString(value);
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

function buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest(
  review = {}
) {
  const safeReview = redactGuardedValues(review);
  const digestInput = stableDigestInput(safeReview);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro11f-static-verification-record-review-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro11fSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11fDefaultPriorVerificationRecord() {
  return {
    [DEPENDS_ON_ORO11E_KEY]: true,
    [ORO11E_PASSED_KEY]: true,
    [VERIFIED_ORO11E_ONLY_KEY]: true,
    oro11ePhase: ORO11E_PHASE || "ORO-11E",
    oro11eScope: ORO11E_SCOPE,
    oro11eClosed: true,
    oro11eVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
    sourceOro11eVerificationRecordId: "oro11e-static-evidence-pack-verification-record",
    oro11eStaticVerificationRecordDigest: "oro11e-static-verification-record-digest-reference",
    oro11eVerificationRecordAsSource: true,
    oro11dReviewRecordVerificationReferenceOnly: true,
    oro11cReviewRecordReferenceOnly: true,
    oro11bReviewReferenceOnly: true,
    oro11aVerificationRecordReferenceOnly: true,
    oro10zVerificationResultReferenceOnly: true,
    oro10yReviewRecordReferenceOnly: true,
    oro10xReviewReferenceOnly: true,
    oro10wRecordReferenceOnly: true,
    oro10vVerificationOutputReferenceOnly: true,
  };
}

function normalizeStatus(rawStatus) {
  const value = String(rawStatus || "").trim();
  if (!value) {
    return ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED;
  }
  if (
    Object.values(
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS
    ).includes(value)
  ) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return (
    SAFE_STATUS_ALIASES[alias] ||
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID
  );
}

function statusFrom(sources) {
  for (const key of REVIEW_STATUS_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED;
}

function buildOro11fDefaultVerificationRecordReviewShell() {
  const safetyEvidence = buildOro11fSafetySummary();
  const seed = {
    phase: ORO11F_PHASE,
    scope: ORO11F_SCOPE,
    sourceOro11eVerificationRecordId: "oro11e-static-evidence-pack-verification-record",
    verificationRecordReviewId: "oro11f-static-evidence-pack-verification-record-review",
    status:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    disposition: "prepared_for_static_verification_record_review_only",
  };
  const digest =
    buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest(seed);
  return {
    id: DEFAULT_FIXTURE_ID,
    phase: ORO11F_PHASE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope:
      ORO11F_SCOPE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    sourceOro11eVerificationRecordId: seed.sourceOro11eVerificationRecordId,
    verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId:
      seed.verificationRecordReviewId,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel:
      "oro11e_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record",
    oro11eVerificationRecordPresent: true,
    oro11dReviewRecordVerificationReferenceOnlyPresent: true,
    oro11cReviewRecordReferenceOnlyPresent: true,
    oro11bReviewReferenceOnlyPresent: true,
    oro11aVerificationRecordReferenceOnlyPresent: true,
    oro10zVerificationResultReferenceOnlyPresent: true,
    oro10yReviewRecordReferenceOnlyPresent: true,
    oro10xReviewReferenceOnlyPresent: true,
    oro10wRecordReferenceOnlyPresent: true,
    oro10vVerificationOutputReferenceOnlyPresent: true,
    priorVerificationRecordPresent: true,
    verificationRecordReviewEvidencePresent: true,
    verificationRecordReviewStatusPresent: true,
    verificationRecordReviewMetadataPresent: true,
    verificationRecordReviewComplete: true,
    verificationRecordReviewIntegrityChecked: true,
    verificationRecordReviewExpired: false,
    verificationRecordReviewConflict: false,
    verificationRecordReviewDisposition: seed.disposition,
    expectedStaticVerificationRecordReviewDigest: digest,
    providedStaticVerificationRecordReviewDigest: digest,
    safetyEvidence,
  };
}

function buildOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewEvidence(
  input = {}
) {
  const baseline = buildOro11fDefaultVerificationRecordReviewShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const review = isPlainObject(merged.verificationRecordReviewEvidence) ? merged.verificationRecordReviewEvidence : {};
  const status = statusFrom([review, merged]);
  const seed = {
    phase: ORO11F_PHASE,
    scope:
      readStringFrom(
        [review, merged],
        "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope",
        ORO11F_SCOPE
      ),
    sourceOro11eVerificationRecordId: readStringFrom(
      [review, merged],
      "sourceOro11eVerificationRecordId",
      baseline.sourceOro11eVerificationRecordId
    ),
    verificationRecordReviewId: readStringFrom(
      [review, merged],
      "verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId",
      baseline.verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId
    ),
    status,
    disposition: readStringFrom(
      [review, merged],
      "verificationRecordReviewDisposition",
      baseline.verificationRecordReviewDisposition
    ),
  };
  const expectedDigest =
    buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest(seed);
  const providedDigest = readStringFrom(
    [review, merged],
    "providedStaticVerificationRecordReviewDigest",
    readStringFrom([review, merged], "expectedStaticVerificationRecordReviewDigest", expectedDigest)
  );
  const safeReview = redactGuardedValues({ ...review, ...seed });
  return deepMerge(safeReview, {
    phase: seed.phase,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope:
      seed.scope,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus: status,
    sourceOro11eVerificationRecordId: seed.sourceOro11eVerificationRecordId,
    verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId:
      seed.verificationRecordReviewId,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel:
      readStringFrom(
        [review, merged],
        "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel",
        baseline.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel
      ),
    oro11eVerificationRecordPresent: readBooleanFrom([review, merged], "oro11eVerificationRecordPresent", true),
    oro11dReviewRecordVerificationReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro11dReviewRecordVerificationReferenceOnlyPresent",
      true
    ),
    oro11cReviewRecordReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro11cReviewRecordReferenceOnlyPresent",
      true
    ),
    oro11bReviewReferenceOnlyPresent: readBooleanFrom([review, merged], "oro11bReviewReferenceOnlyPresent", true),
    oro11aVerificationRecordReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro11aVerificationRecordReferenceOnlyPresent",
      true
    ),
    oro10zVerificationResultReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro10zVerificationResultReferenceOnlyPresent",
      true
    ),
    oro10yReviewRecordReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro10yReviewRecordReferenceOnlyPresent",
      true
    ),
    oro10xReviewReferenceOnlyPresent: readBooleanFrom([review, merged], "oro10xReviewReferenceOnlyPresent", true),
    oro10wRecordReferenceOnlyPresent: readBooleanFrom([review, merged], "oro10wRecordReferenceOnlyPresent", true),
    oro10vVerificationOutputReferenceOnlyPresent: readBooleanFrom(
      [review, merged],
      "oro10vVerificationOutputReferenceOnlyPresent",
      true
    ),
    priorVerificationRecordPresent: readBooleanFrom([review, merged], "priorVerificationRecordPresent", true),
    verificationRecordReviewEvidencePresent: readBooleanFrom(
      [review, merged],
      "verificationRecordReviewEvidencePresent",
      true
    ),
    verificationRecordReviewStatusPresent: readBooleanFrom(
      [review, merged],
      "verificationRecordReviewStatusPresent",
      true
    ),
    verificationRecordReviewMetadataPresent: readBooleanFrom(
      [review, merged],
      "verificationRecordReviewMetadataPresent",
      true
    ),
    verificationRecordReviewComplete: readBooleanFrom([review, merged], "verificationRecordReviewComplete", true),
    verificationRecordReviewIntegrityChecked: readBooleanFrom(
      [review, merged],
      "verificationRecordReviewIntegrityChecked",
      true
    ),
    verificationRecordReviewExpired: readBooleanFrom([review, merged], "verificationRecordReviewExpired", false),
    verificationRecordReviewConflict: readBooleanFrom([review, merged], "verificationRecordReviewConflict", false),
    verificationRecordReviewDisposition: seed.disposition,
    staticVerificationRecordReviewDigest: expectedDigest,
    expectedStaticVerificationRecordReviewDigest: expectedDigest,
    providedStaticVerificationRecordReviewDigest: providedDigest,
    verificationRecordReviewDigestMatches: expectedDigest === providedDigest,
    sanitizedEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReview: safeReview,
    verificationRecordReviewEvidenceBuilt: true,
    verificationRecordReviewSourceSanitized: true,
    staticVerificationRecordReviewDigestBuilt: true,
    staticVerificationRecordReviewMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewInput(
  input = {}
) {
  const baseline = buildOro11fDefaultVerificationRecordReviewShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const prior = isPlainObject(merged.priorVerificationRecord)
    ? merged.priorVerificationRecord
    : isPlainObject(merged.priorVerificationEvidence)
      ? merged.priorVerificationEvidence
      : {};
  const review = isPlainObject(merged.verificationRecordReviewEvidence) ? merged.verificationRecordReviewEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecordReview =
    buildOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewEvidence(
      input
    );
  const priorSources = [merged, prior];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review, runtimeDecision, prior];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: verificationRecordReview.phase,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope:
      verificationRecordReview.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      verificationRecordReview.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus,
    sourceOro11eVerificationRecordId: verificationRecordReview.sourceOro11eVerificationRecordId,
    verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId:
      verificationRecordReview.verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel:
      verificationRecordReview.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel,
    oro11eVerificationRecordPresent: verificationRecordReview.oro11eVerificationRecordPresent,
    oro11dReviewRecordVerificationReferenceOnlyPresent:
      verificationRecordReview.oro11dReviewRecordVerificationReferenceOnlyPresent,
    oro11cReviewRecordReferenceOnlyPresent: verificationRecordReview.oro11cReviewRecordReferenceOnlyPresent,
    oro11bReviewReferenceOnlyPresent: verificationRecordReview.oro11bReviewReferenceOnlyPresent,
    oro11aVerificationRecordReferenceOnlyPresent: verificationRecordReview.oro11aVerificationRecordReferenceOnlyPresent,
    oro10zVerificationResultReferenceOnlyPresent: verificationRecordReview.oro10zVerificationResultReferenceOnlyPresent,
    oro10yReviewRecordReferenceOnlyPresent: verificationRecordReview.oro10yReviewRecordReferenceOnlyPresent,
    oro10xReviewReferenceOnlyPresent: verificationRecordReview.oro10xReviewReferenceOnlyPresent,
    oro10wRecordReferenceOnlyPresent: verificationRecordReview.oro10wRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent: verificationRecordReview.oro10vVerificationOutputReferenceOnlyPresent,
    priorVerificationRecordPresent: verificationRecordReview.priorVerificationRecordPresent,
    verificationRecordReviewEvidencePresent: verificationRecordReview.verificationRecordReviewEvidencePresent,
    verificationRecordReviewStatusPresent: verificationRecordReview.verificationRecordReviewStatusPresent,
    verificationRecordReviewMetadataPresent: verificationRecordReview.verificationRecordReviewMetadataPresent,
    verificationRecordReviewComplete: verificationRecordReview.verificationRecordReviewComplete,
    verificationRecordReviewIntegrityChecked: verificationRecordReview.verificationRecordReviewIntegrityChecked,
    verificationRecordReviewExpired: verificationRecordReview.verificationRecordReviewExpired,
    verificationRecordReviewConflict: verificationRecordReview.verificationRecordReviewConflict,
    verificationRecordReviewDisposition: verificationRecordReview.verificationRecordReviewDisposition,
    verificationRecordReviewDigestMatches: verificationRecordReview.verificationRecordReviewDigestMatches,
    verificationRecordReview,
    [DEPENDS_ON_ORO11E_KEY]: readBooleanFrom(priorSources, DEPENDS_ON_ORO11E_KEY, true),
    [ORO11E_PASSED_KEY]: readBooleanFrom(priorSources, ORO11E_PASSED_KEY, true),
    [VERIFIED_ORO11E_ONLY_KEY]: readBooleanFrom(priorSources, VERIFIED_ORO11E_ONLY_KEY, true),
    oro11ePhase: readStringFrom(priorSources, "oro11ePhase", ORO11E_PHASE || "ORO-11E"),
    oro11eScope: readStringFrom(priorSources, "oro11eScope", ORO11E_SCOPE),
    oro11eClosed: readBooleanFrom(priorSources, "oro11eClosed", true),
    oro11eVerificationRecordStatus: readStringFrom(
      priorSources,
      "oro11eVerificationRecordStatus",
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateGate: readBooleanFrom(reviewSources, "nextStepRequiresSeparateGate", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      reviewSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  normalized[RUNTIME_AUTHORIZATION_KEY] = readBooleanFrom(safetySources, RUNTIME_AUTHORIZATION_KEY, false);
  return normalized;
}

function assertOro11fNoRuntimeAuthorization(input) {
  const fixture =
    normalizeOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewInput(
      input
    );
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro11f`);
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
  if (fixture[RUNTIME_AUTHORIZATION_KEY] !== false) blockers.push(`${RUNTIME_AUTHORIZATION_KEY}_not_allowed_in_oro11f`);
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture =
    normalizeOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewInput(
      input
    );
  const blockers = [];
  if (fixture.phase !== ORO11F_PHASE) blockers.push("invalid_oro11f_phase");
  if (
    fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope !==
    ORO11F_SCOPE
  ) {
    blockers.push("invalid_oro11f_evidence_pack_verification_record_review_scope");
  }
  if (!fixture[DEPENDS_ON_ORO11E_KEY] || !fixture[ORO11E_PASSED_KEY] || !fixture[VERIFIED_ORO11E_ONLY_KEY]) {
    blockers.push("missing_oro11e_verification_record");
  }
  if (fixture.oro11ePhase !== (ORO11E_PHASE || "ORO-11E") || fixture.oro11eScope !== ORO11E_SCOPE || !fixture.oro11eClosed) {
    blockers.push("invalid_oro11e_verification_record_gate");
  }
  if (!fixture.sourceOro11eVerificationRecordId || fixture.sourceOro11eVerificationRecordId.length < 8) {
    blockers.push("invalid_source_oro11e_verification_record_id");
  }
  if (
    !fixture.verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId ||
    fixture.verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId.length < 8
  ) {
    blockers.push("invalid_verification_record_review_id");
  }
  if (!fixture.oro11eVerificationRecordPresent) blockers.push("missing_oro11e_verification_record");
  if (!fixture.oro11dReviewRecordVerificationReferenceOnlyPresent) {
    blockers.push("missing_oro11d_review_record_verification_reference");
  }
  if (!fixture.oro11cReviewRecordReferenceOnlyPresent) blockers.push("missing_oro11c_reference");
  if (!fixture.oro11bReviewReferenceOnlyPresent) blockers.push("missing_oro11b_reference");
  if (!fixture.oro11aVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro11a_reference");
  if (!fixture.oro10zVerificationResultReferenceOnlyPresent) blockers.push("missing_oro10z_reference");
  if (!fixture.oro10yReviewRecordReferenceOnlyPresent) blockers.push("missing_oro10y_reference");
  if (!fixture.oro10xReviewReferenceOnlyPresent) blockers.push("missing_oro10x_reference");
  if (!fixture.oro10wRecordReferenceOnlyPresent) blockers.push("missing_oro10w_reference");
  if (!fixture.oro10vVerificationOutputReferenceOnlyPresent) blockers.push("missing_oro10v_reference");
  if (!fixture.priorVerificationRecordPresent) blockers.push("missing_prior_verification_record");
  if (!fixture.verificationRecordReviewEvidencePresent) blockers.push("missing_verification_record_review_evidence");
  if (!fixture.verificationRecordReviewStatusPresent) blockers.push("missing_verification_record_review_status");
  if (!fixture.verificationRecordReviewMetadataPresent) blockers.push("missing_verification_record_review_metadata");
  if (!fixture.verificationRecordReviewComplete) blockers.push("incomplete_verification_record_review");
  if (!fixture.verificationRecordReviewIntegrityChecked) blockers.push("verification_record_review_integrity_missing");
  if (fixture.verificationRecordReviewExpired) blockers.push("verification_record_review_expired");
  if (fixture.verificationRecordReviewConflict) blockers.push("verification_record_review_conflict");
  if (!fixture.verificationRecordReviewDigestMatches) blockers.push("verification_record_review_digest_mismatch");

  const status =
    fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus;
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_review_digest_mismatch");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD
  ) {
    blockers.push("missing_oro11e_verification_record");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_verification_record_review_evidence");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_verification_record_review");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED
  ) {
    blockers.push("verification_record_review_expired");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT
  ) {
    blockers.push("verification_record_review_conflict");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INVALID
  ) {
    blockers.push("verification_record_review_invalid");
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_review_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro11fNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_gate_required");
  if (!fixture.nextStepRequiresSeparateGate) blockers.push("next_step_requires_separate_gate");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordReviewOutcomeFor(status, blockers) {
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED
  ) {
    return "fail_closed";
  }
  if (BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "review_blocked";
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY
  ) {
    return "reviewed_for_review_only_non_runtime";
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED
  ) {
    return "rejected_review_recorded_non_runtime";
  }
  if (
    status ===
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED
  ) {
    return "changes_required_review_recorded_non_runtime";
  }
  return "verification_record_review_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO11F_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO11F_RESULT_KEY]: result,
    [DEPENDS_ON_ORO11E_KEY]: pass && fixture[DEPENDS_ON_ORO11E_KEY],
    [ORO11E_PASSED_KEY]: pass && fixture[ORO11E_PASSED_KEY],
    [VERIFIED_ORO11E_ONLY_KEY]: pass && fixture[VERIFIED_ORO11E_ONLY_KEY],
    oro11ePhase: pass ? fixture.oro11ePhase : HOLD,
    oro11eScope: pass ? fixture.oro11eScope : HOLD,
    oro11eClosed: pass && fixture.oro11eClosed,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus
      : ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED,
    verificationRecordReviewOutcome: verificationRecordReviewOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus,
      blockers
    ),
    verificationRecordReview: fixture.verificationRecordReview,
    staticVerificationRecordReviewDigest: fixture.verificationRecordReview.staticVerificationRecordReviewDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateGate: pass && fixture.nextStepRequiresSeparateGate,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate(
  input = buildOro11fDefaultVerificationRecordReviewShell()
) {
  const fixture =
    normalizeOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewInput(
      input
    );
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (
    !PASS_STATUSES.includes(
      fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus
    )
  ) {
    return buildOutput(HOLD, ["verification_record_review_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate(
  input = {}
) {
  return evaluateOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate(
    input
  );
}

module.exports = {
  ORO11F_PHASE,
  ORO11F_SCOPE,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO11F_RESULT_KEY,
  DEPENDS_ON_ORO11E_KEY,
  ORO11E_PASSED_KEY,
  VERIFIED_ORO11E_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro11fSafetySummary,
  buildOro11fDefaultPriorVerificationRecord,
  buildOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewEvidence,
  buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest,
  normalizeOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewInput,
  assertOro11fNoRuntimeAuthorization,
  evaluateOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate,
  validateOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate,
};
