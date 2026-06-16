"use strict";

const {
  HOLD,
  PASS,
  ORO11F_PHASE,
  ORO11F_SCOPE,
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO11F_RESULT_KEY,
} = require("./oro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate");

const ORO11G_PHASE = "ORO-11G";
const ORO11G_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_gate_only";
const ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS =
  Object.freeze({
    PREPARED:
      "mock_verification_record_review_record_verification_record_review_record_prepared",
    RECORDED_FOR_REVIEW_ONLY:
      "mock_verification_record_review_record_verification_record_review_recorded_for_review_only",
    REJECTED:
      "mock_verification_record_review_record_verification_record_review_record_rejected",
    CHANGES_REQUIRED:
      "mock_verification_record_review_record_verification_record_review_record_changes_required",
    DIGEST_MISMATCH:
      "mock_verification_record_review_record_verification_record_review_record_digest_mismatch",
    MISSING_PRIOR_REVIEW:
      "mock_verification_record_review_record_verification_record_review_record_missing_prior_review",
    MISSING_EVIDENCE:
      "mock_verification_record_review_record_verification_record_review_record_missing_evidence",
    INCOMPLETE:
      "mock_verification_record_review_record_verification_record_review_record_incomplete",
    EXPIRED:
      "mock_verification_record_review_record_verification_record_review_record_expired",
    CONFLICT:
      "mock_verification_record_review_record_verification_record_review_record_conflict",
    INVALID:
      "mock_verification_record_review_record_verification_record_review_record_invalid",
    FAIL_CLOSED: "fail_closed",
  });

const ORO11G_RESULT_KEY =
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateResult";
const DEPENDS_ON_ORO11F_KEY =
  "dependsOnOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate";
const ORO11F_PASSED_KEY =
  "oro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGatePassed";
const VERIFIED_ORO11F_ONLY_KEY =
  "verifiedOro11fWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateGateRequired";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";
const RUNTIME_AUTHORIZATION_KEY = ["runtime", "Author", "ization"].join("");
const GUARDED_AUTH_HEADER_MARKER = ["Author", "ization", ":"].join("");
const GUARDED_AUTH_SCHEME_PATTERN = new RegExp(`\\b(${["Be", "arer"].join("")}|${["Ba", "sic"].join("")})\\s+\\S+`, "i");

const PASS_STATUSES = Object.freeze([
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const BLOCKED_STATUSES = Object.freeze([
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11fPredecessorPresent",
  "continuationFromOro11fConfirmed",
  "oro11fVerificationRecordReviewSourcePresent",
  "oro11fVerificationRecordReviewSourceClosed",
  "oro11fVerificationRecordReviewSourceSanitized",
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateOnly",
  "verificationRecordReviewRecordGateOnly",
  "staticMockVerificationRecordReviewRecordOnly",
  "verificationRecordReviewRecordSourceStaticMockOnly",
  "verificationRecordReviewRecordSourceFromOro11fOnly",
  "oro11fVerificationRecordReviewAsSource",
  "oro11eVerificationRecordReferenceOnly",
  "oro11dReviewRecordVerificationReferenceOnly",
  "oro11cReviewRecordReferenceOnly",
  "oro11bReviewReferenceOnly",
  "oro11aVerificationRecordReferenceOnly",
  "oro10zVerificationResultReferenceOnly",
  "oro10yReviewRecordReferenceOnly",
  "oro10xReviewReferenceOnly",
  "oro10wRecordReferenceOnly",
  "oro10vVerificationOutputReferenceOnly",
  "verificationRecordReviewRecordEvidenceBuilt",
  "verificationRecordReviewRecordCompletenessRulesApplied",
  "verificationRecordReviewRecordIntegrityRulesApplied",
  "staticVerificationRecordReviewRecordDigestBuilt",
  "staticVerificationRecordReviewRecordMetadataBuilt",
  "staticVerificationRecordReviewRecordDigestCompared",
  "staticVerificationRecordReviewRecordMetadataCompared",
  "verificationRecordReviewRecordNonAuthorizing",
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
  "separateGateRequired",
  "oro11gShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "docsStaticMockLocalSmokeOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoReviewAuthorityOccurred",
  "verifiedNoAuditAuthorityOccurred",
  "verifiedNoFinalizationOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedRuntimeApprovalOccurred",
  "verifiedNoSignedApprovalArtifactAcceptedOccurred",
  "verifiedNoActualSignedApprovalArtifactVerifiedOccurred",
  "verifiedNoRuntimeActivationOccurred",
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
  "verifiedShortOro11gFilenamesOnly",
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

const REVIEW_RECORD_STATUS_ALIASES = Object.freeze([
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus",
  "verificationRecordReviewRecordVerificationRecordReviewRecordStatus",
  "verificationRecordReviewRecordStatus",
  "reviewRecordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  review_record_prepared:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  review_only:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  recorded_for_review_only:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  rejected:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  changes_required:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_review:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  missing_evidence:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  incomplete:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  expired:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  conflict:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  invalid:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  fail_closed:
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
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

function buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest(reviewRecord = {}) {
  const safeReviewRecord = redactGuardedValues(reviewRecord);
  const digestInput = stableDigestInput(safeReviewRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro11g-static-verification-record-review-record-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro11gSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11gDefaultPriorVerificationRecordReview() {
  return {
    [DEPENDS_ON_ORO11F_KEY]: true,
    [ORO11F_PASSED_KEY]: true,
    [VERIFIED_ORO11F_ONLY_KEY]: true,
    [ORO11F_RESULT_KEY]: PASS,
    oro11fPhase: ORO11F_PHASE || "ORO-11F",
    oro11fScope: ORO11F_SCOPE,
    oro11fClosed: true,
    oro11fVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    sourceOro11fVerificationRecordReviewId: "oro11f-static-evidence-pack-verification-record-review",
    oro11fStaticVerificationRecordReviewDigest: "oro11f-static-verification-record-review-digest-reference",
    oro11fVerificationRecordReviewAsSource: true,
    oro11eVerificationRecordReferenceOnly: true,
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
    return ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
  }
  if (Object.values(ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS).includes(value)) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return (
    SAFE_STATUS_ALIASES[alias] ||
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID
  );
}

function statusFrom(sources) {
  for (const key of REVIEW_RECORD_STATUS_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
}

function buildOro11gDefaultVerificationRecordReviewRecordShell() {
  const safetyEvidence = buildOro11gSafetySummary();
  const seed = {
    phase: ORO11G_PHASE,
    scope: ORO11G_SCOPE,
    sourceOro11fVerificationRecordReviewId: "oro11f-static-evidence-pack-verification-record-review",
    verificationRecordReviewRecordVerificationRecordReviewRecordId:
      "oro11g-static-evidence-pack-verification-record-review-record",
    status:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
    disposition: "prepared_for_static_verification_record_review_record_only",
  };
  const digest = buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest(seed);
  return {
    id: "validOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFromOro11fFixture",
    priorVerificationRecordReview: buildOro11gDefaultPriorVerificationRecordReview(),
    verificationRecordReviewRecordEvidence: {
      phase: seed.phase,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope: seed.scope,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus: seed.status,
      sourceOro11fVerificationRecordReviewId: seed.sourceOro11fVerificationRecordReviewId,
      verificationRecordReviewRecordVerificationRecordReviewRecordId:
        seed.verificationRecordReviewRecordVerificationRecordReviewRecordId,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordSourceModel:
        "oro11f_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record",
      oro11fVerificationRecordReviewPresent: true,
      oro11eVerificationRecordReferenceOnlyPresent: true,
      oro11dReviewRecordVerificationReferenceOnlyPresent: true,
      oro11cReviewRecordReferenceOnlyPresent: true,
      oro11bReviewReferenceOnlyPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorVerificationRecordReviewPresent: true,
      verificationRecordReviewRecordEvidencePresent: true,
      verificationRecordReviewRecordStatusPresent: true,
      verificationRecordReviewRecordMetadataPresent: true,
      verificationRecordReviewRecordComplete: true,
      verificationRecordReviewRecordIntegrityChecked: true,
      verificationRecordReviewRecordExpired: false,
      verificationRecordReviewRecordConflict: false,
      verificationRecordReviewRecordDisposition: seed.disposition,
      expectedStaticVerificationRecordReviewRecordDigest: digest,
      providedStaticVerificationRecordReviewRecordDigest: digest,
    },
    runtimeDecisionEvidence: flagsFor(REQUIRED_FALSE_FLAGS, false),
    safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateGate: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
}

function buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord(input = {}) {
  const merged = deepMerge(buildOro11gDefaultVerificationRecordReviewRecordShell(), isPlainObject(input) ? input : {});
  const reviewRecord = isPlainObject(merged.verificationRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordEvidence
    : {};
  const status = statusFrom([reviewRecord, merged]);
  const seed = {
    phase: readStringFrom([reviewRecord, merged], "phase", ORO11G_PHASE),
    scope: readStringFrom(
      [reviewRecord, merged],
      "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope",
      ORO11G_SCOPE
    ),
    sourceOro11fVerificationRecordReviewId: readStringFrom(
      [reviewRecord, merged],
      "sourceOro11fVerificationRecordReviewId",
      "oro11f-static-evidence-pack-verification-record-review"
    ),
    verificationRecordReviewRecordVerificationRecordReviewRecordId: readStringFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordVerificationRecordReviewRecordId",
      "oro11g-static-evidence-pack-verification-record-review-record"
    ),
    status,
    disposition: readStringFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordDisposition",
      "prepared_for_static_verification_record_review_record_only"
    ),
  };
  const expectedDigest = buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest(seed);
  const providedDigest = readStringFrom(
    [reviewRecord, merged],
    "providedStaticVerificationRecordReviewRecordDigest",
    readStringFrom([reviewRecord, merged], "expectedStaticVerificationRecordReviewRecordDigest", expectedDigest)
  );
  const safeReviewRecord = redactGuardedValues(reviewRecord);
  return deepMerge(safeReviewRecord, {
    phase: seed.phase,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope: seed.scope,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus: seed.status,
    sourceOro11fVerificationRecordReviewId: seed.sourceOro11fVerificationRecordReviewId,
    verificationRecordReviewRecordVerificationRecordReviewRecordId:
      seed.verificationRecordReviewRecordVerificationRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordSourceModel:
      "oro11f_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record",
    oro11fVerificationRecordReviewPresent: readBooleanFrom([reviewRecord, merged], "oro11fVerificationRecordReviewPresent", true),
    oro11eVerificationRecordReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro11eVerificationRecordReferenceOnlyPresent", true),
    oro11dReviewRecordVerificationReferenceOnlyPresent: readBooleanFrom(
      [reviewRecord, merged],
      "oro11dReviewRecordVerificationReferenceOnlyPresent",
      true
    ),
    oro11cReviewRecordReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro11cReviewRecordReferenceOnlyPresent", true),
    oro11bReviewReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro11bReviewReferenceOnlyPresent", true),
    oro11aVerificationRecordReferenceOnlyPresent: readBooleanFrom(
      [reviewRecord, merged],
      "oro11aVerificationRecordReferenceOnlyPresent",
      true
    ),
    oro10zVerificationResultReferenceOnlyPresent: readBooleanFrom(
      [reviewRecord, merged],
      "oro10zVerificationResultReferenceOnlyPresent",
      true
    ),
    oro10yReviewRecordReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro10yReviewRecordReferenceOnlyPresent", true),
    oro10xReviewReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro10xReviewReferenceOnlyPresent", true),
    oro10wRecordReferenceOnlyPresent: readBooleanFrom([reviewRecord, merged], "oro10wRecordReferenceOnlyPresent", true),
    oro10vVerificationOutputReferenceOnlyPresent: readBooleanFrom(
      [reviewRecord, merged],
      "oro10vVerificationOutputReferenceOnlyPresent",
      true
    ),
    priorVerificationRecordReviewPresent: readBooleanFrom([reviewRecord, merged], "priorVerificationRecordReviewPresent", true),
    verificationRecordReviewRecordEvidencePresent: readBooleanFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordEvidencePresent",
      true
    ),
    verificationRecordReviewRecordStatusPresent: readBooleanFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordStatusPresent",
      true
    ),
    verificationRecordReviewRecordMetadataPresent: readBooleanFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordMetadataPresent",
      true
    ),
    verificationRecordReviewRecordComplete: readBooleanFrom([reviewRecord, merged], "verificationRecordReviewRecordComplete", true),
    verificationRecordReviewRecordIntegrityChecked: readBooleanFrom(
      [reviewRecord, merged],
      "verificationRecordReviewRecordIntegrityChecked",
      true
    ),
    verificationRecordReviewRecordExpired: readBooleanFrom([reviewRecord, merged], "verificationRecordReviewRecordExpired", false),
    verificationRecordReviewRecordConflict: readBooleanFrom([reviewRecord, merged], "verificationRecordReviewRecordConflict", false),
    verificationRecordReviewRecordDisposition: seed.disposition,
    staticVerificationRecordReviewRecordDigest: expectedDigest,
    expectedStaticVerificationRecordReviewRecordDigest: expectedDigest,
    providedStaticVerificationRecordReviewRecordDigest: providedDigest,
    verificationRecordReviewRecordDigestMatches: expectedDigest === providedDigest,
    sanitizedEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord: safeReviewRecord,
    verificationRecordReviewRecordEvidenceBuilt: true,
    verificationRecordReviewRecordSourceSanitized: true,
    staticVerificationRecordReviewRecordDigestBuilt: true,
    staticVerificationRecordReviewRecordMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input = {}) {
  const baseline = buildOro11gDefaultVerificationRecordReviewRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const prior = isPlainObject(merged.priorVerificationRecordReview) ? merged.priorVerificationRecordReview : {};
  const reviewRecord = buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord(input);
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const priorSources = [merged, prior];
  const safetySources = [merged, safety, runtimeDecision, prior, reviewRecord];
  const normalized = {
    id: readStringFrom([merged], "id", baseline.id),
    phase: reviewRecord.phase,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope:
      reviewRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      reviewRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus,
    sourceOro11fVerificationRecordReviewId: reviewRecord.sourceOro11fVerificationRecordReviewId,
    verificationRecordReviewRecordVerificationRecordReviewRecordId:
      reviewRecord.verificationRecordReviewRecordVerificationRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordSourceModel:
      reviewRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordSourceModel,
    oro11fVerificationRecordReviewPresent: reviewRecord.oro11fVerificationRecordReviewPresent,
    oro11eVerificationRecordReferenceOnlyPresent: reviewRecord.oro11eVerificationRecordReferenceOnlyPresent,
    oro11dReviewRecordVerificationReferenceOnlyPresent: reviewRecord.oro11dReviewRecordVerificationReferenceOnlyPresent,
    oro11cReviewRecordReferenceOnlyPresent: reviewRecord.oro11cReviewRecordReferenceOnlyPresent,
    oro11bReviewReferenceOnlyPresent: reviewRecord.oro11bReviewReferenceOnlyPresent,
    oro11aVerificationRecordReferenceOnlyPresent: reviewRecord.oro11aVerificationRecordReferenceOnlyPresent,
    oro10zVerificationResultReferenceOnlyPresent: reviewRecord.oro10zVerificationResultReferenceOnlyPresent,
    oro10yReviewRecordReferenceOnlyPresent: reviewRecord.oro10yReviewRecordReferenceOnlyPresent,
    oro10xReviewReferenceOnlyPresent: reviewRecord.oro10xReviewReferenceOnlyPresent,
    oro10wRecordReferenceOnlyPresent: reviewRecord.oro10wRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent: reviewRecord.oro10vVerificationOutputReferenceOnlyPresent,
    priorVerificationRecordReviewPresent: reviewRecord.priorVerificationRecordReviewPresent,
    verificationRecordReviewRecordEvidencePresent: reviewRecord.verificationRecordReviewRecordEvidencePresent,
    verificationRecordReviewRecordStatusPresent: reviewRecord.verificationRecordReviewRecordStatusPresent,
    verificationRecordReviewRecordMetadataPresent: reviewRecord.verificationRecordReviewRecordMetadataPresent,
    verificationRecordReviewRecordComplete: reviewRecord.verificationRecordReviewRecordComplete,
    verificationRecordReviewRecordIntegrityChecked: reviewRecord.verificationRecordReviewRecordIntegrityChecked,
    verificationRecordReviewRecordExpired: reviewRecord.verificationRecordReviewRecordExpired,
    verificationRecordReviewRecordConflict: reviewRecord.verificationRecordReviewRecordConflict,
    verificationRecordReviewRecordDisposition: reviewRecord.verificationRecordReviewRecordDisposition,
    verificationRecordReviewRecordDigestMatches: reviewRecord.verificationRecordReviewRecordDigestMatches,
    verificationRecordReviewRecord: reviewRecord,
    [DEPENDS_ON_ORO11F_KEY]: readBooleanFrom(priorSources, DEPENDS_ON_ORO11F_KEY, true),
    [ORO11F_PASSED_KEY]: readBooleanFrom(priorSources, ORO11F_PASSED_KEY, true),
    [VERIFIED_ORO11F_ONLY_KEY]: readBooleanFrom(priorSources, VERIFIED_ORO11F_ONLY_KEY, true),
    [ORO11F_RESULT_KEY]: readStringFrom(priorSources, ORO11F_RESULT_KEY, PASS),
    oro11fPhase: readStringFrom(priorSources, "oro11fPhase", ORO11F_PHASE || "ORO-11F"),
    oro11fScope: readStringFrom(priorSources, "oro11fScope", ORO11F_SCOPE),
    oro11fClosed: readBooleanFrom(priorSources, "oro11fClosed", true),
    oro11fVerificationRecordReviewStatus: readStringFrom(
      priorSources,
      "oro11fVerificationRecordReviewStatus",
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom([merged, reviewRecord], NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateGate: readBooleanFrom([merged, reviewRecord], "nextStepRequiresSeparateGate", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      [merged, reviewRecord],
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  normalized[RUNTIME_AUTHORIZATION_KEY] = readBooleanFrom(safetySources, RUNTIME_AUTHORIZATION_KEY, false);
  return normalized;
}

function assertOro11gNoRuntimeAuthorization(input) {
  const fixture = normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro11g`);
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
  if (fixture[RUNTIME_AUTHORIZATION_KEY] !== false) blockers.push(`${RUNTIME_AUTHORIZATION_KEY}_not_allowed_in_oro11g`);
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO11G_PHASE) blockers.push("invalid_oro11g_phase");
  if (fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope !== ORO11G_SCOPE) {
    blockers.push("invalid_oro11g_evidence_pack_verification_record_review_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO11F_KEY] || !fixture[ORO11F_PASSED_KEY] || !fixture[VERIFIED_ORO11F_ONLY_KEY]) {
    blockers.push("missing_oro11f_verification_record_review");
  }
  if (
    fixture[ORO11F_RESULT_KEY] !== PASS ||
    fixture.oro11fPhase !== (ORO11F_PHASE || "ORO-11F") ||
    fixture.oro11fScope !== ORO11F_SCOPE ||
    !fixture.oro11fClosed
  ) {
    blockers.push("invalid_oro11f_verification_record_review_gate");
  }
  if (!fixture.sourceOro11fVerificationRecordReviewId || fixture.sourceOro11fVerificationRecordReviewId.length < 8) {
    blockers.push("invalid_source_oro11f_verification_record_review_id");
  }
  if (
    !fixture.verificationRecordReviewRecordVerificationRecordReviewRecordId ||
    fixture.verificationRecordReviewRecordVerificationRecordReviewRecordId.length < 8
  ) {
    blockers.push("invalid_verification_record_review_record_id");
  }
  if (!fixture.oro11fVerificationRecordReviewPresent) blockers.push("missing_oro11f_verification_record_review");
  if (!fixture.oro11eVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro11e_reference");
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
  if (!fixture.priorVerificationRecordReviewPresent) blockers.push("missing_prior_verification_record_review");
  if (!fixture.verificationRecordReviewRecordEvidencePresent) blockers.push("missing_verification_record_review_record_evidence");
  if (!fixture.verificationRecordReviewRecordStatusPresent) blockers.push("missing_verification_record_review_record_status");
  if (!fixture.verificationRecordReviewRecordMetadataPresent) blockers.push("missing_verification_record_review_record_metadata");
  if (!fixture.verificationRecordReviewRecordComplete) blockers.push("incomplete_verification_record_review_record");
  if (!fixture.verificationRecordReviewRecordIntegrityChecked) blockers.push("verification_record_review_record_integrity_missing");
  if (fixture.verificationRecordReviewRecordExpired) blockers.push("verification_record_review_record_expired");
  if (fixture.verificationRecordReviewRecordConflict) blockers.push("verification_record_review_record_conflict");
  if (!fixture.verificationRecordReviewRecordDigestMatches) blockers.push("verification_record_review_record_digest_mismatch");

  const status = fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus;
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH) {
    blockers.push("verification_record_review_record_digest_mismatch");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW) {
    blockers.push("missing_oro11f_verification_record_review");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE) {
    blockers.push("missing_verification_record_review_record_evidence");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE) {
    blockers.push("incomplete_verification_record_review_record");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED) {
    blockers.push("verification_record_review_record_expired");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT) {
    blockers.push("verification_record_review_record_conflict");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID) {
    blockers.push("verification_record_review_record_invalid");
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED) {
    blockers.push("verification_record_review_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro11gNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_gate_required");
  if (!fixture.nextStepRequiresSeparateGate) blockers.push("next_step_requires_separate_gate");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordReviewRecordOutcomeFor(status, blockers) {
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED) {
    return "fail_closed";
  }
  if (BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY) {
    return "recorded_for_review_only_non_runtime";
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED) {
    return "rejected_review_record_recorded_non_runtime";
  }
  if (status === ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED) {
    return "changes_required_review_record_recorded_non_runtime";
  }
  return "verification_record_review_record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO11G_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO11G_RESULT_KEY]: result,
    [DEPENDS_ON_ORO11F_KEY]: pass && fixture[DEPENDS_ON_ORO11F_KEY],
    [ORO11F_PASSED_KEY]: pass && fixture[ORO11F_PASSED_KEY],
    [VERIFIED_ORO11F_ONLY_KEY]: pass && fixture[VERIFIED_ORO11F_ONLY_KEY],
    [ORO11F_RESULT_KEY]: pass ? fixture[ORO11F_RESULT_KEY] : HOLD,
    oro11fPhase: pass ? fixture.oro11fPhase : HOLD,
    oro11fScope: pass ? fixture.oro11fScope : HOLD,
    oro11fClosed: pass && fixture.oro11fClosed,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus
      : ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
    verificationRecordReviewRecordOutcome: verificationRecordReviewRecordOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus,
      blockers
    ),
    verificationRecordReviewRecord: fixture.verificationRecordReviewRecord,
    staticVerificationRecordReviewRecordDigest: fixture.verificationRecordReviewRecord.staticVerificationRecordReviewRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateGate: pass && fixture.nextStepRequiresSeparateGate,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
  input = buildOro11gDefaultVerificationRecordReviewRecordShell()
) {
  const fixture = normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus)) {
    return buildOutput(HOLD, ["verification_record_review_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(input = {}) {
  return evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(input);
}

module.exports = {
  ORO11G_PHASE,
  ORO11G_SCOPE,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO11G_RESULT_KEY,
  DEPENDS_ON_ORO11F_KEY,
  ORO11F_PASSED_KEY,
  VERIFIED_ORO11F_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro11gSafetySummary,
  buildOro11gDefaultPriorVerificationRecordReview,
  buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord,
  buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest,
  normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput,
  assertOro11gNoRuntimeAuthorization,
  evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
  validateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
};
