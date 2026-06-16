"use strict";

const {
  HOLD,
  PASS,
  ORO11C_PHASE,
  ORO11C_SCOPE,
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
} = require("./oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate");

const ORO11D_PHASE = "ORO-11D";
const ORO11D_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_gate_only";
const ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS =
  Object.freeze({
    PREPARED: "mock_verification_record_review_record_verification_record_review_record_verification_prepared",
    VERIFIED_FOR_REVIEW_ONLY:
      "mock_verification_record_review_record_verification_record_review_record_verified_for_review_only",
    REJECTED: "mock_verification_record_review_record_verification_record_review_record_verification_rejected",
    CHANGES_REQUIRED:
      "mock_verification_record_review_record_verification_record_review_record_verification_changes_required",
    DIGEST_MISMATCH:
      "mock_verification_record_review_record_verification_record_review_record_verification_digest_mismatch",
    MISSING_PRIOR_RECORD:
      "mock_verification_record_review_record_verification_record_review_record_verification_missing_prior_record",
    MISSING_EVIDENCE:
      "mock_verification_record_review_record_verification_record_review_record_verification_missing_evidence",
    INCOMPLETE: "mock_verification_record_review_record_verification_record_review_record_verification_incomplete",
    EXPIRED: "mock_verification_record_review_record_verification_record_review_record_verification_expired",
    CONFLICT: "mock_verification_record_review_record_verification_record_review_record_verification_conflict",
    INVALID: "mock_verification_record_review_record_verification_record_review_record_verification_invalid",
    FAIL_CLOSED: "fail_closed",
  });

const ORO11D_RESULT_KEY =
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateResult";
const DEPENDS_ON_ORO11C_KEY =
  "dependsOnOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate";
const ORO11C_PASSED_KEY =
  "oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGatePassed";
const VERIFIED_ORO11C_ONLY_KEY =
  "verifiedOro11cWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID =
  "validOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFromOro11cFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";
const RUNTIME_AUTHORIZATION_KEY = ["runtime", "Author", "ization"].join("");

const VERIFICATION_PASS_STATUSES = Object.freeze([
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
]);

const VERIFICATION_BLOCKED_STATUSES = Object.freeze([
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_PRIOR_RECORD,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_EVIDENCE,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INCOMPLETE,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INVALID,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11cPredecessorPresent",
  "continuationFromOro11cConfirmed",
  "oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGatePresent",
  "staticEvidencePackVerificationRecordReviewRecordVerificationPresent",
  "evidencePackVerificationRecordReviewRecordVerificationStaticMockOnly",
  "evidencePackVerificationRecordReviewRecordVerificationNonAuthorizing",
  "reviewRecordVerificationGateOnly",
  "staticReviewRecordVerificationSourceModelPresent",
  "reviewRecordVerificationSourceStaticMockOnly",
  "reviewRecordVerificationSourceSanitized",
  "reviewRecordVerificationSourceFromOro11cOnly",
  "oro11cVerificationRecordReviewRecordAsSource",
  "oro11bVerificationRecordReviewReferenceOnly",
  "oro11aVerificationRecordReferenceOnly",
  "oro10zVerificationResultReferenceOnly",
  "oro10yReviewRecordReferenceOnly",
  "oro10xReviewReferenceOnly",
  "oro10wRecordReferenceOnly",
  "oro10wVerificationRecordReferenceOnly",
  "oro10vVerificationOutputReferenceOnly",
  "reviewRecordVerificationEvidenceBuilt",
  "reviewRecordVerificationCompletenessRulesApplied",
  "reviewRecordVerificationIntegrityRulesApplied",
  "staticReviewRecordVerificationDigestBuilt",
  "staticReviewRecordVerificationMetadataBuilt",
  "staticReviewRecordVerificationDigestCompared",
  "staticReviewRecordVerificationMetadataCompared",
  "verificationRecordReviewRecordVerificationNonAuthorizing",
  "verificationRecordReviewRecordVerificationIsNotFinalApprovalIssued",
  "verificationRecordReviewRecordVerificationIsNotReviewApprovalDecisionAuthority",
  "verificationRecordReviewRecordVerificationIsNotAuditAuthority",
  "verificationRecordReviewRecordVerificationIsNotFinalization",
  "verificationRecordReviewRecordVerificationIsNotSignedRuntimeApproval",
  "verificationRecordReviewRecordVerificationIsNotSignedApprovalArtifactAcceptance",
  "verificationRecordReviewRecordVerificationIsNotActualSignedArtifactVerification",
  "verificationRecordReviewRecordVerificationDoesNotAuthorizeRuntime",
  "verificationRecordReviewRecordVerificationDoesNotAuthorizeRouteMount",
  "verificationRecordReviewRecordVerificationDoesNotAuthorizeExternalCall",
  "verificationRecordReviewRecordVerificationDoesNotAuthorizeGameLaunch",
  "verificationRecordReviewRecordVerificationDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "finalApprovalReviewDecisionAuthorityNotIssued",
  "auditAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "separateApprovalRequired",
  "oro11dShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordReviewRecordVerificationOnly",
  "nonAuthorizingEvidencePackVerificationRecordReviewRecordVerificationOnly",
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
  "verifiedShortOro11dFilenamesOnly",
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

const VERIFICATION_FIELD_ALIASES = Object.freeze([
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus",
  "verificationRecordReviewRecordVerificationStatus",
  "reviewRecordVerificationStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  verification_prepared:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
  verified:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  verified_for_review_only:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  review_only:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  rejected:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED,
  changes_required:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_record:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_PRIOR_RECORD,
  missing_evidence:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_EVIDENCE,
  incomplete:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INCOMPLETE,
  expired:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
  conflict:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  conflicting:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
  invalid:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INVALID,
  fail_closed:
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
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

function buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro11d-static-review-record-verification-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro11dSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11dDefaultSourceReviewRecordEvidence() {
  return {
    [DEPENDS_ON_ORO11C_KEY]: true,
    [ORO11C_PASSED_KEY]: true,
    [VERIFIED_ORO11C_ONLY_KEY]: true,
    oro11cPhase: ORO11C_PHASE || "ORO-11C",
    oro11cScope: ORO11C_SCOPE,
    oro11cClosed: true,
    oro11cReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
    oro11cStaticVerificationRecordReviewRecordDigest:
      "oro11c-static-verification-record-review-record-verification-record-review-record-digest-reference",
    oro11cVerificationRecordReviewRecordAsSource: true,
    oro11bVerificationRecordReviewReferenceOnly: true,
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
    return ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED;
  }
  if (
    Object.values(
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS
    ).includes(value)
  ) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return (
    SAFE_STATUS_ALIASES[alias] ||
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INVALID
  );
}

function statusFrom(sources) {
  for (const key of VERIFICATION_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED;
}

function buildOro11dDefaultReviewRecordVerificationShell() {
  const safetyEvidence = buildOro11dSafetySummary();
  const baseRecord = {
    phase: ORO11D_PHASE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope: ORO11D_SCOPE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
    sourceVerificationRecordReviewRecordId: "oro11c-static-evidence-pack-verification-record-review-record",
    verificationRecordReviewRecordVerificationId:
      "oro11d-static-evidence-pack-verification-record-review-record-verification",
    evidencePackVerificationRecordReviewRecordVerificationSourceModel:
      "oro11c_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record",
    oro11cVerificationRecordReviewRecordPresent: true,
    oro11bVerificationRecordReviewReferenceOnlyPresent: true,
    oro11aVerificationRecordReferenceOnlyPresent: true,
    oro10zVerificationResultReferenceOnlyPresent: true,
    oro10yReviewRecordReferenceOnlyPresent: true,
    oro10xReviewReferenceOnlyPresent: true,
    oro10wRecordReferenceOnlyPresent: true,
    oro10vVerificationOutputReferenceOnlyPresent: true,
    priorReviewRecordEvidencePresent: true,
    reviewRecordVerificationEvidencePresent: true,
    reviewRecordVerificationStatusPresent: true,
    reviewRecordVerificationMetadataPresent: true,
    reviewRecordVerificationComplete: true,
    reviewRecordVerificationIntegrityChecked: true,
    reviewRecordVerificationExpired: false,
    reviewRecordVerificationConflict: false,
    reviewRecordVerificationDisposition: "prepared_for_review_record_verification_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest({
    phase: ORO11D_PHASE,
    scope: ORO11D_SCOPE,
    sourceVerificationRecordReviewRecordId: baseRecord.sourceVerificationRecordReviewRecordId,
    verificationRecordReviewRecordVerificationId: baseRecord.verificationRecordReviewRecordVerificationId,
    status: baseRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    sourceReviewRecordEvidence: buildOro11dDefaultSourceReviewRecordEvidence(),
    reviewRecordVerificationEvidence: {
      ...baseRecord,
      expectedStaticReviewRecordVerificationDigest: digest,
      providedStaticReviewRecordVerificationDigest: digest,
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
      approvalDecisionAuthorizesRuntime: false,
      finalApprovalDecisionAuthorizesRuntime: false,
      runtimeReviewDecision: false,
      [RUNTIME_AUTHORIZATION_KEY]: false,
      runtimeApprovalChainRollover: false,
      runtimeMount: false,
      publicAlias: false,
      liveExecution: false,
      actualExternalCall: false,
      externalCall: false,
      gameLaunchCall: false,
      walletMutation: false,
      ledgerMutation: false,
      dbRuntimeFlow: false,
      prismaWrite: false,
      dbTransaction: false,
      migration: false,
      deploy: false,
    },
    safetyEvidence,
  };
}

function buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationEvidence(
  input = {}
) {
  const baseline = buildOro11dDefaultReviewRecordVerificationShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.reviewRecordVerificationEvidence) ? merged.reviewRecordVerificationEvidence : {};
  const status = statusFrom([record, merged]);
  const safeRecord = redactGuardedValues(record);
  const digest = buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest({
    phase: readStringFrom([record, merged], "phase", ORO11D_PHASE),
    scope: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope",
      ORO11D_SCOPE
    ),
    sourceVerificationRecordReviewRecordId: readStringFrom(
      [record, merged],
      "sourceVerificationRecordReviewRecordId",
      baseline.reviewRecordVerificationEvidence.sourceVerificationRecordReviewRecordId
    ),
    verificationRecordReviewRecordVerificationId: readStringFrom(
      [record, merged],
      "verificationRecordReviewRecordVerificationId",
      baseline.reviewRecordVerificationEvidence.verificationRecordReviewRecordVerificationId
    ),
    status,
  });
  const expectedDigest = readStringFrom([record, merged], "expectedStaticReviewRecordVerificationDigest", digest);
  const providedDigest = readStringFrom([record, merged], "providedStaticReviewRecordVerificationDigest", digest);
  return Object.freeze({
    phase: readStringFrom([record, merged], "phase", ORO11D_PHASE),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope",
      ORO11D_SCOPE
    ),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus: status,
    sourceVerificationRecordReviewRecordId: readStringFrom(
      [record, merged],
      "sourceVerificationRecordReviewRecordId",
      baseline.reviewRecordVerificationEvidence.sourceVerificationRecordReviewRecordId
    ),
    verificationRecordReviewRecordVerificationId: readStringFrom(
      [record, merged],
      "verificationRecordReviewRecordVerificationId",
      baseline.reviewRecordVerificationEvidence.verificationRecordReviewRecordVerificationId
    ),
    evidencePackVerificationRecordReviewRecordVerificationSourceModel: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordVerificationSourceModel",
      "oro11c_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record"
    ),
    oro11cVerificationRecordReviewRecordPresent: readBooleanFrom(
      [record, merged],
      "oro11cVerificationRecordReviewRecordPresent",
      true
    ),
    oro11bVerificationRecordReviewReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro11bVerificationRecordReviewReferenceOnlyPresent",
      true
    ),
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
    priorReviewRecordEvidencePresent: readBooleanFrom([record, merged], "priorReviewRecordEvidencePresent", true),
    reviewRecordVerificationEvidencePresent: readBooleanFrom(
      [record, merged],
      "reviewRecordVerificationEvidencePresent",
      true
    ),
    reviewRecordVerificationStatusPresent: readBooleanFrom(
      [record, merged],
      "reviewRecordVerificationStatusPresent",
      true
    ),
    reviewRecordVerificationMetadataPresent: readBooleanFrom(
      [record, merged],
      "reviewRecordVerificationMetadataPresent",
      true
    ),
    reviewRecordVerificationComplete: readBooleanFrom([record, merged], "reviewRecordVerificationComplete", true),
    reviewRecordVerificationIntegrityChecked: readBooleanFrom(
      [record, merged],
      "reviewRecordVerificationIntegrityChecked",
      true
    ),
    reviewRecordVerificationExpired: readBooleanFrom([record, merged], "reviewRecordVerificationExpired", false),
    reviewRecordVerificationConflict: readBooleanFrom([record, merged], "reviewRecordVerificationConflict", false),
    reviewRecordVerificationDisposition: readStringFrom(
      [record, merged],
      "reviewRecordVerificationDisposition",
      "prepared_for_review_record_verification_only"
    ),
    staticReviewRecordVerificationDigest: digest,
    expectedStaticReviewRecordVerificationDigest: expectedDigest,
    providedStaticReviewRecordVerificationDigest: providedDigest,
    reviewRecordVerificationDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecordReviewRecordVerification: safeRecord,
    reviewRecordVerificationEvidenceBuilt: true,
    reviewRecordVerificationSourceSanitized: true,
    staticReviewRecordVerificationDigestBuilt: true,
    staticReviewRecordVerificationMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput(
  input = {}
) {
  const baseline = buildOro11dDefaultReviewRecordVerificationShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const sourceReview = isPlainObject(merged.sourceReviewRecordEvidence) ? merged.sourceReviewRecordEvidence : {};
  const record = isPlainObject(merged.reviewRecordVerificationEvidence) ? merged.reviewRecordVerificationEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const reviewRecordVerification =
    buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationEvidence(input);
  const sourceSources = [merged, sourceReview];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, sourceReview];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO11D_PHASE),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope: readStringFrom(
      recordSources,
      "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope",
      ORO11D_SCOPE
    ),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      reviewRecordVerification.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus,
    sourceVerificationRecordReviewRecordId: reviewRecordVerification.sourceVerificationRecordReviewRecordId,
    verificationRecordReviewRecordVerificationId:
      reviewRecordVerification.verificationRecordReviewRecordVerificationId,
    evidencePackVerificationRecordReviewRecordVerificationSourceModel:
      reviewRecordVerification.evidencePackVerificationRecordReviewRecordVerificationSourceModel,
    oro11cVerificationRecordReviewRecordPresent: reviewRecordVerification.oro11cVerificationRecordReviewRecordPresent,
    oro11bVerificationRecordReviewReferenceOnlyPresent:
      reviewRecordVerification.oro11bVerificationRecordReviewReferenceOnlyPresent,
    oro11aVerificationRecordReferenceOnlyPresent:
      reviewRecordVerification.oro11aVerificationRecordReferenceOnlyPresent,
    oro10zVerificationResultReferenceOnlyPresent:
      reviewRecordVerification.oro10zVerificationResultReferenceOnlyPresent,
    oro10yReviewRecordReferenceOnlyPresent: reviewRecordVerification.oro10yReviewRecordReferenceOnlyPresent,
    oro10xReviewReferenceOnlyPresent: reviewRecordVerification.oro10xReviewReferenceOnlyPresent,
    oro10wRecordReferenceOnlyPresent: reviewRecordVerification.oro10wRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent: reviewRecordVerification.oro10vVerificationOutputReferenceOnlyPresent,
    priorReviewRecordEvidencePresent: reviewRecordVerification.priorReviewRecordEvidencePresent,
    reviewRecordVerificationEvidencePresent: reviewRecordVerification.reviewRecordVerificationEvidencePresent,
    reviewRecordVerificationStatusPresent: reviewRecordVerification.reviewRecordVerificationStatusPresent,
    reviewRecordVerificationMetadataPresent: reviewRecordVerification.reviewRecordVerificationMetadataPresent,
    reviewRecordVerificationComplete: reviewRecordVerification.reviewRecordVerificationComplete,
    reviewRecordVerificationIntegrityChecked: reviewRecordVerification.reviewRecordVerificationIntegrityChecked,
    reviewRecordVerificationExpired: reviewRecordVerification.reviewRecordVerificationExpired,
    reviewRecordVerificationConflict: reviewRecordVerification.reviewRecordVerificationConflict,
    reviewRecordVerificationDisposition: reviewRecordVerification.reviewRecordVerificationDisposition,
    reviewRecordVerificationDigestMatches: reviewRecordVerification.reviewRecordVerificationDigestMatches,
    reviewRecordVerification,
    [DEPENDS_ON_ORO11C_KEY]: readBooleanFrom(sourceSources, DEPENDS_ON_ORO11C_KEY, true),
    [ORO11C_PASSED_KEY]: readBooleanFrom(sourceSources, ORO11C_PASSED_KEY, true),
    [VERIFIED_ORO11C_ONLY_KEY]: readBooleanFrom(sourceSources, VERIFIED_ORO11C_ONLY_KEY, true),
    oro11cPhase: readStringFrom(sourceSources, "oro11cPhase", ORO11C_PHASE || "ORO-11C"),
    oro11cScope: readStringFrom(sourceSources, "oro11cScope", ORO11C_SCOPE),
    oro11cClosed: readBooleanFrom(sourceSources, "oro11cClosed", true),
    oro11cReviewRecordStatus: readStringFrom(
      sourceSources,
      "oro11cReviewRecordStatus",
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED
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

function assertOro11dNoRuntimeAuthorization(input) {
  const fixture =
    normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro11d`);
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
  const fixture =
    normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput(input);
  const blockers = [];
  if (fixture.phase !== ORO11D_PHASE) blockers.push("invalid_oro11d_phase");
  if (fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope !== ORO11D_SCOPE) {
    blockers.push("invalid_oro11d_evidence_pack_verification_record_review_record_verification_scope");
  }
  if (!fixture[DEPENDS_ON_ORO11C_KEY] || !fixture[ORO11C_PASSED_KEY] || !fixture[VERIFIED_ORO11C_ONLY_KEY]) {
    blockers.push("missing_oro11c_evidence_pack_verification_record_review_record_verification_record_review_record_gate");
  }
  if (fixture.oro11cPhase !== (ORO11C_PHASE || "ORO-11C") || fixture.oro11cScope !== ORO11C_SCOPE || !fixture.oro11cClosed) {
    blockers.push("invalid_oro11c_evidence_pack_verification_record_review_record_verification_record_review_record_gate");
  }
  if (!fixture.sourceVerificationRecordReviewRecordId || fixture.sourceVerificationRecordReviewRecordId.length < 8) {
    blockers.push("invalid_source_verification_record_review_record_id");
  }
  if (!fixture.verificationRecordReviewRecordVerificationId || fixture.verificationRecordReviewRecordVerificationId.length < 8) {
    blockers.push("invalid_verification_record_review_record_verification_id");
  }
  if (!fixture.oro11cVerificationRecordReviewRecordPresent) blockers.push("missing_oro11c_verification_record_review_record");
  if (!fixture.oro11bVerificationRecordReviewReferenceOnlyPresent) blockers.push("missing_oro11b_reference");
  if (!fixture.oro11aVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro11a_reference");
  if (!fixture.oro10zVerificationResultReferenceOnlyPresent) blockers.push("missing_oro10z_reference");
  if (!fixture.oro10yReviewRecordReferenceOnlyPresent) blockers.push("missing_oro10y_reference");
  if (!fixture.oro10xReviewReferenceOnlyPresent) blockers.push("missing_oro10x_reference");
  if (!fixture.oro10wRecordReferenceOnlyPresent) blockers.push("missing_oro10w_reference");
  if (!fixture.oro10vVerificationOutputReferenceOnlyPresent) blockers.push("missing_oro10v_reference");
  if (!fixture.priorReviewRecordEvidencePresent) blockers.push("missing_prior_review_record");
  if (!fixture.reviewRecordVerificationEvidencePresent) blockers.push("missing_review_record_verification_evidence");
  if (!fixture.reviewRecordVerificationStatusPresent) blockers.push("missing_review_record_verification_status");
  if (!fixture.reviewRecordVerificationMetadataPresent) blockers.push("missing_review_record_verification_metadata");
  if (!fixture.reviewRecordVerificationComplete) blockers.push("incomplete_review_record_verification");
  if (!fixture.reviewRecordVerificationIntegrityChecked) blockers.push("review_record_verification_integrity_missing");
  if (fixture.reviewRecordVerificationExpired) blockers.push("review_record_verification_expired");
  if (fixture.reviewRecordVerificationConflict) blockers.push("review_record_verification_conflict");
  if (!fixture.reviewRecordVerificationDigestMatches) blockers.push("review_record_verification_digest_mismatch");

  const status = fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus;
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("review_record_verification_digest_mismatch");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_PRIOR_RECORD
  ) {
    blockers.push("missing_oro11c_evidence_pack_verification_record_review_record_verification_record_review_record_gate");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_review_record_verification_evidence");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_review_record_verification");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.EXPIRED
  ) {
    blockers.push("review_record_verification_expired");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CONFLICT
  ) {
    blockers.push("review_record_verification_conflict");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INVALID
  ) {
    blockers.push("review_record_verification_invalid");
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("review_record_verification_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro11dNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationOutcomeFor(status, blockers) {
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  ) {
    return "fail_closed";
  }
  if (VERIFICATION_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "verification_blocked";
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY
  ) {
    return "verified_for_review_only_non_runtime";
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED
  ) {
    return "rejected_verification_recorded_non_runtime";
  }
  if (
    status ===
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED
  ) {
    return "changes_required_verification_recorded_non_runtime";
  }
  return "review_record_verification_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO11D_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO11D_RESULT_KEY]: result,
    [DEPENDS_ON_ORO11C_KEY]: pass && fixture[DEPENDS_ON_ORO11C_KEY],
    [ORO11C_PASSED_KEY]: pass && fixture[ORO11C_PASSED_KEY],
    [VERIFIED_ORO11C_ONLY_KEY]: pass && fixture[VERIFIED_ORO11C_ONLY_KEY],
    oro11cPhase: pass ? fixture.oro11cPhase : HOLD,
    oro11cScope: pass ? fixture.oro11cScope : HOLD,
    oro11cClosed: pass && fixture.oro11cClosed,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus
      : ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
    reviewRecordVerificationOutcome: verificationOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus,
      blockers
    ),
    reviewRecordVerification: fixture.reviewRecordVerification,
    staticReviewRecordVerificationDigest: fixture.reviewRecordVerification.staticReviewRecordVerificationDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
  input = buildOro11dDefaultReviewRecordVerificationShell()
) {
  const fixture =
    normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!VERIFICATION_PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus)) {
    return buildOutput(HOLD, ["review_record_verification_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(input = {}) {
  return evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(input);
}

module.exports = {
  ORO11D_PHASE,
  ORO11D_SCOPE,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
  ORO11D_RESULT_KEY,
  DEPENDS_ON_ORO11C_KEY,
  ORO11C_PASSED_KEY,
  VERIFIED_ORO11C_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro11dSafetySummary,
  buildOro11dDefaultSourceReviewRecordEvidence,
  buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationEvidence,
  buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest,
  normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput,
  assertOro11dNoRuntimeAuthorization,
  evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate,
  validateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate,
};
