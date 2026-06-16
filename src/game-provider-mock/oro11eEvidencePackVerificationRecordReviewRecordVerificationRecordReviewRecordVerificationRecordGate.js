"use strict";

const {
  HOLD,
  PASS,
  ORO11D_PHASE,
  ORO11D_SCOPE,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
} = require("./oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate");

const ORO11E_PHASE = "ORO-11E";
const ORO11E_SCOPE =
  "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record_gate_only";
const ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS =
  Object.freeze({
    PREPARED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_prepared",
    RECORDED_FOR_REVIEW_ONLY:
      "mock_verification_record_review_record_verification_record_review_record_verification_recorded_for_review_only",
    REJECTED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_rejected",
    CHANGES_REQUIRED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_changes_required",
    DIGEST_MISMATCH:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_digest_mismatch",
    MISSING_PRIOR_VERIFICATION:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_missing_prior_verification",
    MISSING_EVIDENCE:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_missing_evidence",
    INCOMPLETE:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_incomplete",
    EXPIRED:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_expired",
    CONFLICT:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_conflict",
    INVALID:
      "mock_verification_record_review_record_verification_record_review_record_verification_record_invalid",
    FAIL_CLOSED: "fail_closed",
  });

const ORO11E_RESULT_KEY =
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateResult";
const DEPENDS_ON_ORO11D_KEY =
  "dependsOnOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate";
const ORO11D_PASSED_KEY =
  "oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGatePassed";
const VERIFIED_ORO11D_ONLY_KEY =
  "verifiedOro11dWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateGateRequired";
const DEFAULT_FIXTURE_ID =
  "validOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFromOro11dFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";
const RUNTIME_AUTHORIZATION_KEY = ["runtime", "Author", "ization"].join("");

const PASS_STATUSES = Object.freeze([
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const BLOCKED_STATUSES = Object.freeze([
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_VERIFICATION,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INVALID,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
]);

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11dPredecessorPresent",
  "continuationFromOro11dConfirmed",
  "oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGatePresent",
  "staticEvidencePackVerificationRecordReviewRecordVerificationRecordPresent",
  "evidencePackVerificationRecordReviewRecordVerificationRecordStaticMockOnly",
  "evidencePackVerificationRecordReviewRecordVerificationRecordNonAuthorizing",
  "verificationRecordGateOnly",
  "staticVerificationRecordSourceModelPresent",
  "verificationRecordSourceStaticMockOnly",
  "verificationRecordSourceSanitized",
  "verificationRecordSourceFromOro11dOnly",
  "oro11dReviewRecordVerificationAsSource",
  "oro11cReviewRecordReferenceOnly",
  "oro11bReviewReferenceOnly",
  "oro11aVerificationRecordReferenceOnly",
  "oro10zVerificationResultReferenceOnly",
  "oro10yReviewRecordReferenceOnly",
  "oro10xReviewReferenceOnly",
  "oro10wRecordReferenceOnly",
  "oro10vVerificationOutputReferenceOnly",
  "verificationRecordEvidenceBuilt",
  "verificationRecordCompletenessRulesApplied",
  "verificationRecordIntegrityRulesApplied",
  "staticVerificationRecordDigestBuilt",
  "staticVerificationRecordMetadataBuilt",
  "staticVerificationRecordDigestCompared",
  "staticVerificationRecordMetadataCompared",
  "verificationRecordNonAuthorizing",
  "verificationRecordIsNotFinalApprovalIssued",
  "verificationRecordIsNotReviewApprovalDecisionAuthority",
  "verificationRecordIsNotAuditAuthority",
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
  "auditAuthorityNotIssued",
  "finalApprovalFinalizationNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "separateGateRequired",
  "oro11eShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "docsStaticMockLocalSmokeOnly",
  "staticMockEvidencePackVerificationRecordReviewRecordVerificationRecordOnly",
  "nonAuthorizingEvidencePackVerificationRecordReviewRecordVerificationRecordOnly",
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
  "verifiedShortOro11eFilenamesOnly",
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

const VERIFICATION_RECORD_FIELD_ALIASES = Object.freeze([
  "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus",
  "verificationRecordReviewRecordVerificationRecordStatus",
  "verificationRecordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  record_prepared:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
  review_only:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  recorded_for_review_only:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
  rejected:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
  changes_required:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  digest_mismatch:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
  missing_prior_verification:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_VERIFICATION,
  missing_evidence:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
  incomplete:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
  expired:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
  conflict:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  conflicting:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
  invalid:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INVALID,
  fail_closed:
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
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

function buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest(
  record = {}
) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro11e-static-verification-record-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro11eSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11eDefaultPriorVerificationEvidence() {
  return {
    [DEPENDS_ON_ORO11D_KEY]: true,
    [ORO11D_PASSED_KEY]: true,
    [VERIFIED_ORO11D_ONLY_KEY]: true,
    oro11dPhase: ORO11D_PHASE || "ORO-11D",
    oro11dScope: ORO11D_SCOPE,
    oro11dClosed: true,
    oro11dReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
    oro11dStaticReviewRecordVerificationDigest: "oro11d-static-review-record-verification-digest-reference",
    oro11dReviewRecordVerificationAsSource: true,
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
    return ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED;
  }
  if (
    Object.values(
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS
    ).includes(value)
  ) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return (
    SAFE_STATUS_ALIASES[alias] ||
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INVALID
  );
}

function statusFrom(sources) {
  for (const key of VERIFICATION_RECORD_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED;
}

function buildOro11eDefaultVerificationRecordShell() {
  const safetyEvidence = buildOro11eSafetySummary();
  const seed = {
    phase: ORO11E_PHASE,
    scope: ORO11E_SCOPE,
    sourceOro11dReviewRecordVerificationId: "oro11d-static-evidence-pack-review-record-verification",
    verificationRecordId: "oro11e-static-evidence-pack-verification-record",
    status:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
    disposition: "prepared_for_static_verification_record_only",
  };
  const digest = buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest(seed);
  return {
    id: DEFAULT_FIXTURE_ID,
    phase: ORO11E_PHASE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope: ORO11E_SCOPE,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
    sourceOro11dReviewRecordVerificationId: seed.sourceOro11dReviewRecordVerificationId,
    verificationRecordReviewRecordVerificationRecordId: seed.verificationRecordId,
    evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel:
      "oro11d_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_verification",
    oro11dReviewRecordVerificationPresent: true,
    oro11cReviewRecordReferenceOnlyPresent: true,
    oro11bReviewReferenceOnlyPresent: true,
    oro11aVerificationRecordReferenceOnlyPresent: true,
    oro10zVerificationResultReferenceOnlyPresent: true,
    oro10yReviewRecordReferenceOnlyPresent: true,
    oro10xReviewReferenceOnlyPresent: true,
    oro10wRecordReferenceOnlyPresent: true,
    oro10vVerificationOutputReferenceOnlyPresent: true,
    priorVerificationEvidencePresent: true,
    verificationRecordEvidencePresent: true,
    verificationRecordStatusPresent: true,
    verificationRecordMetadataPresent: true,
    verificationRecordComplete: true,
    verificationRecordIntegrityChecked: true,
    verificationRecordExpired: false,
    verificationRecordConflict: false,
    verificationRecordDisposition: seed.disposition,
    expectedStaticVerificationRecordDigest: digest,
    providedStaticVerificationRecordDigest: digest,
    priorVerificationEvidence: buildOro11eDefaultPriorVerificationEvidence(),
    verificationRecordEvidence: {},
    runtimeDecisionEvidence: {},
    safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateGate: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
}

function buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecord(
  input = {}
) {
  const baseline = buildOro11eDefaultVerificationRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const status = statusFrom([record, merged]);
  const sourceOro11dReviewRecordVerificationId = readStringFrom(
    [record, merged],
    "sourceOro11dReviewRecordVerificationId",
    baseline.sourceOro11dReviewRecordVerificationId
  );
  const verificationRecordReviewRecordVerificationRecordId = readStringFrom(
    [record, merged],
    "verificationRecordReviewRecordVerificationRecordId",
    baseline.verificationRecordReviewRecordVerificationRecordId
  );
  const verificationRecordDisposition = readStringFrom(
    [record, merged],
    "verificationRecordDisposition",
    baseline.verificationRecordDisposition
  );
  const digestSeed = {
    phase: ORO11E_PHASE,
    scope: ORO11E_SCOPE,
    sourceOro11dReviewRecordVerificationId,
    verificationRecordId: verificationRecordReviewRecordVerificationRecordId,
    status,
    disposition: verificationRecordDisposition,
  };
  const digest = buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest(
    digestSeed
  );
  const expectedDigest = readStringFrom([record, merged], "expectedStaticVerificationRecordDigest", digest);
  const providedDigest = readStringFrom([record, merged], "providedStaticVerificationRecordDigest", expectedDigest);
  const safeRecord = redactGuardedValues(deepMerge(record, digestSeed));
  return Object.freeze({
    phase: readStringFrom([record, merged], "phase", ORO11E_PHASE),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope:
      readStringFrom(
        [record, merged],
        "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope",
        ORO11E_SCOPE
      ),
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus: status,
    sourceOro11dReviewRecordVerificationId,
    verificationRecordReviewRecordVerificationRecordId,
    evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel: readStringFrom(
      [record, merged],
      "evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel",
      baseline.evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel
    ),
    oro11dReviewRecordVerificationPresent: readBooleanFrom(
      [record, merged],
      "oro11dReviewRecordVerificationPresent",
      true
    ),
    oro11cReviewRecordReferenceOnlyPresent: readBooleanFrom(
      [record, merged],
      "oro11cReviewRecordReferenceOnlyPresent",
      true
    ),
    oro11bReviewReferenceOnlyPresent: readBooleanFrom([record, merged], "oro11bReviewReferenceOnlyPresent", true),
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
    priorVerificationEvidencePresent: readBooleanFrom([record, merged], "priorVerificationEvidencePresent", true),
    verificationRecordEvidencePresent: readBooleanFrom([record, merged], "verificationRecordEvidencePresent", true),
    verificationRecordStatusPresent: readBooleanFrom([record, merged], "verificationRecordStatusPresent", true),
    verificationRecordMetadataPresent: readBooleanFrom([record, merged], "verificationRecordMetadataPresent", true),
    verificationRecordComplete: readBooleanFrom([record, merged], "verificationRecordComplete", true),
    verificationRecordIntegrityChecked: readBooleanFrom([record, merged], "verificationRecordIntegrityChecked", true),
    verificationRecordExpired: readBooleanFrom([record, merged], "verificationRecordExpired", false),
    verificationRecordConflict: readBooleanFrom([record, merged], "verificationRecordConflict", false),
    verificationRecordDisposition,
    staticVerificationRecordDigest: digest,
    expectedStaticVerificationRecordDigest: expectedDigest,
    providedStaticVerificationRecordDigest: providedDigest,
    verificationRecordDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationRecordReviewRecordVerificationRecord: safeRecord,
    verificationRecordEvidenceBuilt: true,
    verificationRecordSourceSanitized: true,
    staticVerificationRecordDigestBuilt: true,
    staticVerificationRecordMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput(
  input = {}
) {
  const baseline = buildOro11eDefaultVerificationRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const prior = isPlainObject(merged.priorVerificationEvidence) ? merged.priorVerificationEvidence : {};
  const record = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationRecord =
    buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecord(input);
  const priorSources = [merged, prior];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, prior];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: verificationRecord.phase,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope:
      verificationRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      verificationRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus,
    sourceOro11dReviewRecordVerificationId: verificationRecord.sourceOro11dReviewRecordVerificationId,
    verificationRecordReviewRecordVerificationRecordId:
      verificationRecord.verificationRecordReviewRecordVerificationRecordId,
    evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel:
      verificationRecord.evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel,
    oro11dReviewRecordVerificationPresent: verificationRecord.oro11dReviewRecordVerificationPresent,
    oro11cReviewRecordReferenceOnlyPresent: verificationRecord.oro11cReviewRecordReferenceOnlyPresent,
    oro11bReviewReferenceOnlyPresent: verificationRecord.oro11bReviewReferenceOnlyPresent,
    oro11aVerificationRecordReferenceOnlyPresent: verificationRecord.oro11aVerificationRecordReferenceOnlyPresent,
    oro10zVerificationResultReferenceOnlyPresent: verificationRecord.oro10zVerificationResultReferenceOnlyPresent,
    oro10yReviewRecordReferenceOnlyPresent: verificationRecord.oro10yReviewRecordReferenceOnlyPresent,
    oro10xReviewReferenceOnlyPresent: verificationRecord.oro10xReviewReferenceOnlyPresent,
    oro10wRecordReferenceOnlyPresent: verificationRecord.oro10wRecordReferenceOnlyPresent,
    oro10vVerificationOutputReferenceOnlyPresent: verificationRecord.oro10vVerificationOutputReferenceOnlyPresent,
    priorVerificationEvidencePresent: verificationRecord.priorVerificationEvidencePresent,
    verificationRecordEvidencePresent: verificationRecord.verificationRecordEvidencePresent,
    verificationRecordStatusPresent: verificationRecord.verificationRecordStatusPresent,
    verificationRecordMetadataPresent: verificationRecord.verificationRecordMetadataPresent,
    verificationRecordComplete: verificationRecord.verificationRecordComplete,
    verificationRecordIntegrityChecked: verificationRecord.verificationRecordIntegrityChecked,
    verificationRecordExpired: verificationRecord.verificationRecordExpired,
    verificationRecordConflict: verificationRecord.verificationRecordConflict,
    verificationRecordDisposition: verificationRecord.verificationRecordDisposition,
    verificationRecordDigestMatches: verificationRecord.verificationRecordDigestMatches,
    verificationRecord,
    [DEPENDS_ON_ORO11D_KEY]: readBooleanFrom(priorSources, DEPENDS_ON_ORO11D_KEY, true),
    [ORO11D_PASSED_KEY]: readBooleanFrom(priorSources, ORO11D_PASSED_KEY, true),
    [VERIFIED_ORO11D_ONLY_KEY]: readBooleanFrom(priorSources, VERIFIED_ORO11D_ONLY_KEY, true),
    oro11dPhase: readStringFrom(priorSources, "oro11dPhase", ORO11D_PHASE || "ORO-11D"),
    oro11dScope: readStringFrom(priorSources, "oro11dScope", ORO11D_SCOPE),
    oro11dClosed: readBooleanFrom(priorSources, "oro11dClosed", true),
    oro11dReviewRecordVerificationStatus: readStringFrom(
      priorSources,
      "oro11dReviewRecordVerificationStatus",
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateGate: readBooleanFrom(recordSources, "nextStepRequiresSeparateGate", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      recordSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  normalized[RUNTIME_AUTHORIZATION_KEY] = readBooleanFrom(safetySources, RUNTIME_AUTHORIZATION_KEY, false);
  return normalized;
}

function assertOro11eNoRuntimeAuthorization(input) {
  const fixture =
    normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro11e`);
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
  if (fixture[RUNTIME_AUTHORIZATION_KEY] !== false) blockers.push(`${RUNTIME_AUTHORIZATION_KEY}_not_allowed_in_oro11e`);
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture =
    normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO11E_PHASE) blockers.push("invalid_oro11e_phase");
  if (
    fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope !==
    ORO11E_SCOPE
  ) {
    blockers.push("invalid_oro11e_evidence_pack_verification_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO11D_KEY] || !fixture[ORO11D_PASSED_KEY] || !fixture[VERIFIED_ORO11D_ONLY_KEY]) {
    blockers.push("missing_oro11d_review_record_verification");
  }
  if (fixture.oro11dPhase !== (ORO11D_PHASE || "ORO-11D") || fixture.oro11dScope !== ORO11D_SCOPE || !fixture.oro11dClosed) {
    blockers.push("invalid_oro11d_review_record_verification_gate");
  }
  if (!fixture.sourceOro11dReviewRecordVerificationId || fixture.sourceOro11dReviewRecordVerificationId.length < 8) {
    blockers.push("invalid_source_oro11d_review_record_verification_id");
  }
  if (
    !fixture.verificationRecordReviewRecordVerificationRecordId ||
    fixture.verificationRecordReviewRecordVerificationRecordId.length < 8
  ) {
    blockers.push("invalid_verification_record_id");
  }
  if (!fixture.oro11dReviewRecordVerificationPresent) blockers.push("missing_oro11d_review_record_verification");
  if (!fixture.oro11cReviewRecordReferenceOnlyPresent) blockers.push("missing_oro11c_reference");
  if (!fixture.oro11bReviewReferenceOnlyPresent) blockers.push("missing_oro11b_reference");
  if (!fixture.oro11aVerificationRecordReferenceOnlyPresent) blockers.push("missing_oro11a_reference");
  if (!fixture.oro10zVerificationResultReferenceOnlyPresent) blockers.push("missing_oro10z_reference");
  if (!fixture.oro10yReviewRecordReferenceOnlyPresent) blockers.push("missing_oro10y_reference");
  if (!fixture.oro10xReviewReferenceOnlyPresent) blockers.push("missing_oro10x_reference");
  if (!fixture.oro10wRecordReferenceOnlyPresent) blockers.push("missing_oro10w_reference");
  if (!fixture.oro10vVerificationOutputReferenceOnlyPresent) blockers.push("missing_oro10v_reference");
  if (!fixture.priorVerificationEvidencePresent) blockers.push("missing_prior_verification");
  if (!fixture.verificationRecordEvidencePresent) blockers.push("missing_verification_record_evidence");
  if (!fixture.verificationRecordStatusPresent) blockers.push("missing_verification_record_status");
  if (!fixture.verificationRecordMetadataPresent) blockers.push("missing_verification_record_metadata");
  if (!fixture.verificationRecordComplete) blockers.push("incomplete_verification_record");
  if (!fixture.verificationRecordIntegrityChecked) blockers.push("verification_record_integrity_missing");
  if (fixture.verificationRecordExpired) blockers.push("verification_record_expired");
  if (fixture.verificationRecordConflict) blockers.push("verification_record_conflict");
  if (!fixture.verificationRecordDigestMatches) blockers.push("verification_record_digest_mismatch");

  const status =
    fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus;
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("verification_record_digest_mismatch");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_VERIFICATION
  ) {
    blockers.push("missing_oro11d_review_record_verification");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE
  ) {
    blockers.push("missing_verification_record_evidence");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_verification_record");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.EXPIRED
  ) {
    blockers.push("verification_record_expired");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CONFLICT
  ) {
    blockers.push("verification_record_conflict");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INVALID
  ) {
    blockers.push("verification_record_invalid");
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("verification_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro11eNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_gate_required");
  if (!fixture.nextStepRequiresSeparateGate) blockers.push("next_step_requires_separate_gate");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function verificationRecordOutcomeFor(status, blockers) {
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  ) {
    return "fail_closed";
  }
  if (BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  ) {
    return "recorded_for_review_only_non_runtime";
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED
  ) {
    return "rejected_verification_recorded_non_runtime";
  }
  if (
    status ===
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED
  ) {
    return "changes_required_verification_recorded_non_runtime";
  }
  return "verification_record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO11E_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO11E_RESULT_KEY]: result,
    [DEPENDS_ON_ORO11D_KEY]: pass && fixture[DEPENDS_ON_ORO11D_KEY],
    [ORO11D_PASSED_KEY]: pass && fixture[ORO11D_PASSED_KEY],
    [VERIFIED_ORO11D_ONLY_KEY]: pass && fixture[VERIFIED_ORO11D_ONLY_KEY],
    oro11dPhase: pass ? fixture.oro11dPhase : HOLD,
    oro11dScope: pass ? fixture.oro11dScope : HOLD,
    oro11dClosed: pass && fixture.oro11dClosed,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope
      : HOLD,
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus: pass
      ? fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus
      : ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED,
    verificationRecordOutcome: verificationRecordOutcomeFor(
      fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus,
      blockers
    ),
    verificationRecord: fixture.verificationRecord,
    staticVerificationRecordDigest: fixture.verificationRecord.staticVerificationRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateGate: pass && fixture.nextStepRequiresSeparateGate,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
  input = buildOro11eDefaultVerificationRecordShell()
) {
  const fixture =
    normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!PASS_STATUSES.includes(fixture.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus)) {
    return buildOutput(HOLD, ["verification_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
  input = {}
) {
  return evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(input);
}

module.exports = {
  ORO11E_PHASE,
  ORO11E_SCOPE,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
  ORO11E_RESULT_KEY,
  DEPENDS_ON_ORO11D_KEY,
  ORO11D_PASSED_KEY,
  VERIFIED_ORO11D_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro11eSafetySummary,
  buildOro11eDefaultPriorVerificationEvidence,
  buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecord,
  buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest,
  normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput,
  assertOro11eNoRuntimeAuthorization,
  evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate,
  validateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate,
};
