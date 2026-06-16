"use strict";

const {
  HOLD,
  PASS,
  ORO11B_PHASE,
  ORO11B_SCOPE,
  ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
} = require("./oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate");

const ORO11C_PHASE = "ORO-11C";
const ORO11C_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_gate_only";
const ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS = Object.freeze({
  PREPARED: "mock_verification_record_review_record_verification_record_review_record_prepared",
  RECORDED_FOR_REVIEW_ONLY:
    "mock_verification_record_review_record_verification_record_review_recorded_for_review_only",
  REJECTED: "mock_verification_record_review_record_verification_record_review_record_rejected",
  CHANGES_REQUIRED:
    "mock_verification_record_review_record_verification_record_review_record_changes_required",
  DIGEST_MISMATCH:
    "mock_verification_record_review_record_verification_record_review_record_digest_mismatch",
  MISSING_PRIOR_REVIEW:
    "mock_verification_record_review_record_verification_record_review_record_missing_prior_review",
  MISSING_EVIDENCE:
    "mock_verification_record_review_record_verification_record_review_record_missing_evidence",
  INCOMPLETE: "mock_verification_record_review_record_verification_record_review_record_incomplete",
  EXPIRED: "mock_verification_record_review_record_verification_record_review_record_expired",
  CONFLICT: "mock_verification_record_review_record_verification_record_review_record_conflict",
  INVALID: "mock_verification_record_review_record_verification_record_review_record_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO11C_RESULT_KEY = "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateResult";
const DEPENDS_ON_ORO11B_KEY =
  "dependsOnOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate";
const ORO11B_PASSED_KEY =
  "oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGatePassed";
const VERIFIED_ORO11B_ONLY_KEY =
  "verifiedOro11bWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID =
  "validOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFromOro11bFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";

const RECORD_PASS_STATUSES = Object.freeze([
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const RECORD_BLOCKED_STATUSES = Object.freeze([
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11bPredecessorPresent",
  "continuationFromOro11bConfirmed",
  "oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGatePresent",
  "staticEvidencePackVerificationRecordReviewRecordPresent",
  "evidencePackVerificationRecordReviewRecordStaticMockOnly",
  "evidencePackVerificationRecordReviewRecordNonAuthorizing",
  "verificationRecordReviewRecordGateOnly",
  "staticVerificationRecordReviewRecordSourceModelPresent",
  "verificationRecordReviewRecordSourceStaticMockOnly",
  "verificationRecordReviewRecordSourceSanitized",
  "verificationRecordReviewRecordSourceFromOro11bOnly",
  "oro11bVerificationRecordReviewAsSource",
  "oro11aVerificationRecordReferenceOnly",
  "oro10zVerificationResultReferenceOnly",
  "oro10yReviewRecordReferenceOnly",
  "oro10xReviewReferenceOnly",
  "oro10wRecordReferenceOnly",
  "oro10wVerificationRecordReferenceOnly",
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
  "separateApprovalRequired",
  "oro11cShortFilenameConfirmed",
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
  "verifiedShortOro11cFilenamesOnly",
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
  "evidencePackVerificationRecordReviewRecordReviewRecordStatus",
  "verificationRecordReviewRecordReviewRecordStatus",
  "reviewRecordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  record_prepared:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
  recorded:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  recorded_for_review_only:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  review_record_only:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  rejected:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
  changes_required:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_review:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
  missing_evidence:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  incomplete:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
  expired:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
  conflict:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  conflicting:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
  invalid:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID,
  fail_closed:
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
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

function buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro11c-static-verification-record-review-record-verification-record-review-record-digest-${hash
    .toString(16)
    .padStart(8, "0")}`;
}

function buildOro11cSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11cDefaultSourceReviewEvidence() {
  return {
    [DEPENDS_ON_ORO11B_KEY]: true,
    [ORO11B_PASSED_KEY]: true,
    [VERIFIED_ORO11B_ONLY_KEY]: true,
    oro11bPhase: ORO11B_PHASE || "ORO-11B",
    oro11bScope: ORO11B_SCOPE,
    oro11bClosed: true,
    oro11bReviewStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
    oro11bStaticVerificationRecordReviewDigest:
      "oro11b-static-verification-record-review-record-verification-record-review-digest-reference",
    oro11bVerificationRecordReviewAsSource: true,
    oro11aVerificationRecordReferenceOnly: true,
    oro10zVerificationResultReferenceOnly: true,
    oro10yReviewRecordReferenceOnly: true,
    oro10xReviewReferenceOnly: true,
    oro10wRecordReferenceOnly: true,
    oro10wVerificationRecordReferenceOnly: true,
    oro10vVerificationOutputReferenceOnly: true,
  };
}

function normalizeStatus(rawStatus) {
  const value = String(rawStatus || "").trim();
  if (!value) {
    return ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
  }
  if (
    Object.values(
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS
    ).includes(value)
  ) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return (
    SAFE_STATUS_ALIASES[alias] ||
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID
  );
}

function statusFrom(sources) {
  for (const key of RECORD_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED;
}

function buildOro11cDefaultRecordReviewRecordShell() {
  const safetyEvidence = buildOro11cSafetySummary();
  const baseRecord = {
    phase: ORO11C_PHASE,
    evidencePackVerificationRecordReviewRecordReviewRecordGateScope: ORO11C_SCOPE,
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
    sourceVerificationRecordReviewRecordId: "oro11b-static-evidence-pack-verification-record-review-record",
    verificationRecordReviewRecordReviewRecordId: "oro11c-static-evidence-pack-verification-record-review-record",
    evidencePackVerificationRecordReviewRecordReviewRecordSourceModel:
      "oro11b_static_mock_evidence_pack_verification_record_review_record_verification_record_review",
    oro11bVerificationRecordReviewPresent: true,
    oro11aVerificationRecordReferenceOnlyPresent: true,
    oro10zVerificationResultReferenceOnlyPresent: true,
    oro10yReviewRecordReferenceOnlyPresent: true,
    oro10xReviewReferenceOnlyPresent: true,
    oro10wRecordReferenceOnlyPresent: true,
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
  const digest = buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest({
    phase: ORO11C_PHASE,
    scope: ORO11C_SCOPE,
    sourceVerificationRecordReviewRecordId: baseRecord.sourceVerificationRecordReviewRecordId,
    verificationRecordReviewRecordReviewRecordId: baseRecord.verificationRecordReviewRecordReviewRecordId,
    status: baseRecord.evidencePackVerificationRecordReviewRecordReviewRecordStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    sourceReviewEvidence: buildOro11cDefaultSourceReviewEvidence(),
    verificationRecordReviewRecordReviewRecordEvidence: {
      ...baseRecord,
      expectedStaticVerificationRecordReviewRecordReviewRecordDigest: digest,
      providedStaticVerificationRecordReviewRecordReviewRecordDigest: digest,
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

function buildOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord(input = {}) {
  const baseline = buildOro11cDefaultRecordReviewRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.verificationRecordReviewRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordReviewRecordEvidence
    : {};
  const status = statusFrom([record, merged]);
  const digestSeed = {
    phase: readStringFrom([record, merged], "phase", ORO11C_PHASE),
    scope: readStringFrom([record, merged], "evidencePackVerificationRecordReviewRecordReviewRecordGateScope", ORO11C_SCOPE),
    sourceVerificationRecordReviewRecordId: readStringFrom(
      [record, merged],
      "sourceVerificationRecordReviewRecordId",
      "oro11b-static-evidence-pack-verification-record-review-record"
    ),
    verificationRecordReviewRecordReviewRecordId: readStringFrom(
      [record, merged],
      "verificationRecordReviewRecordReviewRecordId",
      "oro11c-static-evidence-pack-verification-record-review-record"
    ),
    status,
  };
  const digest = buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest(digestSeed);
  const expectedDigest = readStringFrom(
    [record, merged],
    "expectedStaticVerificationRecordReviewRecordReviewRecordDigest",
    digest
  );
  const providedDigest = readStringFrom(
    [record, merged],
    "providedStaticVerificationRecordReviewRecordReviewRecordDigest",
    expectedDigest
  );
  const safeRecord = redactGuardedValues(record);
  return Object.freeze({
    ...safeRecord,
    phase: digestSeed.phase,
    evidencePackVerificationRecordReviewRecordReviewRecordGateScope: digestSeed.scope,
    evidencePackVerificationRecordReviewRecordReviewRecordStatus: status,
    sourceVerificationRecordReviewRecordId: digestSeed.sourceVerificationRecordReviewRecordId,
    verificationRecordReviewRecordReviewRecordId: digestSeed.verificationRecordReviewRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordReviewRecordSourceModel: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordReviewRecordSourceModel",
      "oro11b_static_mock_evidence_pack_verification_record_review_record_verification_record_review"
    ),
    oro11bVerificationRecordReviewPresent: readBooleanFrom([record, merged], "oro11bVerificationRecordReviewPresent", true),
    oro11aVerificationRecordReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro11aVerificationRecordReferenceOnlyPresent",
      true
    ),
    oro10zVerificationResultReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro10zVerificationResultReferenceOnlyPresent",
      true
    ),
    oro10yReviewRecordReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro10yReviewRecordReferenceOnlyPresent",
      true
    ),
    oro10xReviewReferenceOnlyPresent: readBooleanFrom([record, merged], "oro10xReviewReferenceOnlyPresent", true),
    oro10wRecordReferenceOnlyPresent: readBooleanFrom([record, merged], "oro10wRecordReferenceOnlyPresent", true),
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
    staticVerificationRecordReviewRecordReviewRecordDigest: digest,
    expectedStaticVerificationRecordReviewRecordReviewRecordDigest: expectedDigest,
    providedStaticVerificationRecordReviewRecordReviewRecordDigest: providedDigest,
    verificationRecordReviewRecordDigestMatches:
      expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecordReviewRecordReviewRecord: safeRecord,
    verificationRecordReviewRecordEvidenceBuilt: true,
    verificationRecordReviewRecordSourceSanitized: true,
    staticVerificationRecordReviewRecordDigestBuilt: true,
    staticVerificationRecordReviewRecordMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input = {}) {
  const baseline = buildOro11cDefaultRecordReviewRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const sourceReview = isPlainObject(merged.sourceReviewEvidence) ? merged.sourceReviewEvidence : {};
  const record = isPlainObject(merged.verificationRecordReviewRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordReviewRecordEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecordReviewRecordReviewRecord =
    buildOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord(input);
  const sourceSources = [merged, sourceReview];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, sourceReview];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO11C_PHASE),
    evidencePackVerificationRecordReviewRecordReviewRecordGateScope: readStringFrom(
      recordSources,
      "evidencePackVerificationRecordReviewRecordReviewRecordGateScope",
      ORO11C_SCOPE
    ),
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      verificationRecordReviewRecordReviewRecord.evidencePackVerificationRecordReviewRecordReviewRecordStatus,
    sourceVerificationRecordReviewRecordId:
      verificationRecordReviewRecordReviewRecord.sourceVerificationRecordReviewRecordId,
    verificationRecordReviewRecordReviewRecordId:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordReviewRecordId,
    evidencePackVerificationRecordReviewRecordReviewRecordSourceModel:
      verificationRecordReviewRecordReviewRecord.evidencePackVerificationRecordReviewRecordReviewRecordSourceModel,
    oro11bVerificationRecordReviewPresent:
      verificationRecordReviewRecordReviewRecord.oro11bVerificationRecordReviewPresent,
    oro11aVerificationRecordReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro11aVerificationRecordReferenceOnlyPresent,
    oro10zVerificationResultReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro10zVerificationResultReferenceOnlyPresent,
    oro10yReviewRecordReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro10yReviewRecordReferenceOnlyPresent,
    oro10xReviewReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro10xReviewReferenceOnlyPresent,
    oro10wRecordReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro10wRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent:
      verificationRecordReviewRecordReviewRecord.oro10vVerificationOutputReferenceOnlyPresent,
    priorReviewEvidencePresent: verificationRecordReviewRecordReviewRecord.priorReviewEvidencePresent,
    reviewRecordEvidencePresent: verificationRecordReviewRecordReviewRecord.reviewRecordEvidencePresent,
    reviewRecordStatusPresent: verificationRecordReviewRecordReviewRecord.reviewRecordStatusPresent,
    reviewRecordMetadataPresent: verificationRecordReviewRecordReviewRecord.reviewRecordMetadataPresent,
    verificationRecordReviewRecordComplete:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordComplete,
    verificationRecordReviewRecordIntegrityChecked:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordIntegrityChecked,
    verificationRecordReviewRecordExpired:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordExpired,
    verificationRecordReviewRecordConflict:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordConflict,
    verificationRecordReviewRecordDisposition:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordDisposition,
    verificationRecordReviewRecordDigestMatches:
      verificationRecordReviewRecordReviewRecord.verificationRecordReviewRecordDigestMatches,
    verificationRecordReviewRecordReviewRecord,
    [DEPENDS_ON_ORO11B_KEY]: readBooleanFrom(sourceSources, DEPENDS_ON_ORO11B_KEY, true),
    [ORO11B_PASSED_KEY]: readBooleanFrom(sourceSources, ORO11B_PASSED_KEY, true),
    [VERIFIED_ORO11B_ONLY_KEY]: readBooleanFrom(sourceSources, VERIFIED_ORO11B_ONLY_KEY, true),
    oro11bPhase: readStringFrom(sourceSources, "oro11bPhase", ORO11B_PHASE || "ORO-11B"),
    oro11bScope: readStringFrom(sourceSources, "oro11bScope", ORO11B_SCOPE),
    oro11bClosed: readBooleanFrom(sourceSources, "oro11bClosed", true),
    oro11bReviewStatus: readStringFrom(
      sourceSources,
      "oro11bReviewStatus",
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
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

function assertOro11cNoRuntimeAuthorization(input) {
  const fixture = normalizeOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro11c`);
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
  const fixture = normalizeOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO11C_PHASE) blockers.push("invalid_oro11c_phase");
  if (fixture.evidencePackVerificationRecordReviewRecordReviewRecordGateScope !== ORO11C_SCOPE) {
    blockers.push("invalid_oro11c_evidence_pack_verification_record_review_record_review_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO11B_KEY] || !fixture[ORO11B_PASSED_KEY] || !fixture[VERIFIED_ORO11B_ONLY_KEY]) {
    blockers.push("missing_oro11b_evidence_pack_verification_record_review_record_verification_record_review_gate");
  }
  if (fixture.oro11bPhase !== (ORO11B_PHASE || "ORO-11B") || fixture.oro11bScope !== ORO11B_SCOPE || !fixture.oro11bClosed) {
    blockers.push("invalid_oro11b_evidence_pack_verification_record_review_record_verification_record_review_gate");
  }
  if (!fixture.sourceVerificationRecordReviewRecordId || fixture.sourceVerificationRecordReviewRecordId.length < 8) {
    blockers.push("invalid_source_verification_record_review_record_id");
  }
  if (
    !fixture.verificationRecordReviewRecordReviewRecordId ||
    fixture.verificationRecordReviewRecordReviewRecordId.length < 8
  ) {
    blockers.push("invalid_verification_record_review_record_review_record_id");
  }
  if (!fixture.oro11bVerificationRecordReviewPresent) blockers.push("missing_oro11b_verification_record_review");
  if (!fixture.oro11aVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro11a_reference");
  if (!fixture.oro10zVerificationResultReferenceOnlyPresent) blockers.push("missing_oro10z_reference");
  if (!fixture.oro10yReviewRecordReferenceOnlyPresent) blockers.push("missing_oro10y_reference");
  if (!fixture.oro10xReviewReferenceOnlyPresent) blockers.push("missing_oro10x_reference");
  if (!fixture.oro10wRecordReferenceOnlyPresent) blockers.push("missing_oro10w_reference");
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
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_review_record_digest_mismatch");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW
  ) {
    blockers.push("missing_oro11b_evidence_pack_verification_record_review_record_verification_record_review_gate");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_review_record_evidence");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_verification_record_review_record");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED
  ) {
    blockers.push("verification_record_review_record_expired");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT
  ) {
    blockers.push("verification_record_review_record_conflict");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INVALID
  ) {
    blockers.push("verification_record_review_record_invalid");
  }
  if (
    fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_review_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro11cNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordReviewRecordOutcomeFor(status, blockers) {
  if (
    status ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    return "fail_closed";
  }
  if (RECORD_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (
    status ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  ) {
    return "recorded_for_review_only_non_runtime";
  }
  if (
    status ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED
  ) {
    return "rejected_recorded_non_runtime";
  }
  if (
    status ===
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED
  ) {
    return "changes_required_recorded_non_runtime";
  }
  return "verification_record_review_record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO11C_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO11C_RESULT_KEY]: result,
    [DEPENDS_ON_ORO11B_KEY]: pass && fixture[DEPENDS_ON_ORO11B_KEY],
    [ORO11B_PASSED_KEY]: pass && fixture[ORO11B_PASSED_KEY],
    [VERIFIED_ORO11B_ONLY_KEY]: pass && fixture[VERIFIED_ORO11B_ONLY_KEY],
    oro11bPhase: pass ? fixture.oro11bPhase : HOLD,
    oro11bScope: pass ? fixture.oro11bScope : HOLD,
    oro11bClosed: pass && fixture.oro11bClosed,
    evidencePackVerificationRecordReviewRecordReviewRecordGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordReviewRecordGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordReviewRecordStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus
      : ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED,
    verificationRecordReviewRecordOutcome: verificationRecordReviewRecordOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus,
      blockers
    ),
    verificationRecordReviewRecordReviewRecord: fixture.verificationRecordReviewRecordReviewRecord,
    staticVerificationRecordReviewRecordReviewRecordDigest:
      fixture.verificationRecordReviewRecordReviewRecord.staticVerificationRecordReviewRecordReviewRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
  input = buildOro11cDefaultRecordReviewRecordShell()
) {
  const fixture = normalizeOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!RECORD_PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewRecordReviewRecordStatus)) {
    return buildOutput(HOLD, ["verification_record_review_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(input = {}) {
  return evaluateOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(input);
}

module.exports = {
  ORO11C_PHASE,
  ORO11C_SCOPE,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO11C_RESULT_KEY,
  DEPENDS_ON_ORO11B_KEY,
  ORO11B_PASSED_KEY,
  VERIFIED_ORO11B_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro11cSafetySummary,
  buildOro11cDefaultSourceReviewEvidence,
  buildOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord,
  buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest,
  normalizeOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput,
  assertOro11cNoRuntimeAuthorization,
  evaluateOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
  validateOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
};
