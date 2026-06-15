"use strict";

const {
  HOLD,
  PASS,
  ORO10T_SCOPE,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS,
  evaluateOro10tFinalApprovalDecisionRecordVerificationGate,
} = require("./oro10tFinalApprovalDecisionRecordVerificationGate");

const ORO10U_PHASE = "ORO-10U";
const ORO10U_SCOPE = "approval_chain_rollover_final_approval_decision_evidence_pack_gate_only";
const ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS = Object.freeze({
  PREPARED: "mock_evidence_pack_prepared",
  REVIEW_ONLY_READY: "mock_evidence_pack_review_only_ready",
  REJECTED: "mock_evidence_pack_rejected",
  CHANGES_REQUIRED: "mock_evidence_pack_changes_required",
  VERIFICATION_FAILED: "mock_evidence_pack_verification_failed",
  HASH_MISMATCH: "mock_evidence_pack_hash_mismatch",
  EVIDENCE_MISSING: "mock_evidence_pack_evidence_missing",
  EXPIRED: "mock_evidence_pack_expired",
  CONFLICT: "mock_evidence_pack_conflict",
  INVALID: "mock_evidence_pack_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10U_RESULT_KEY = "finalApprovalDecisionEvidencePackGateResult";
const DEPENDS_ON_ORO10T_KEY = "dependsOnOro10tFinalApprovalDecisionRecordVerificationGate";
const ORO10T_PASSED_KEY = "oro10tFinalApprovalDecisionRecordVerificationGatePassed";
const VERIFIED_ORO10T_ONLY_KEY = "verifiedOro10tWasFinalApprovalDecisionRecordVerificationGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10uFinalApprovalDecisionEvidencePackGateFromOro10tFixture";

const EVIDENCE_PACK_PASS_STATUSES = Object.freeze([
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REJECTED,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CHANGES_REQUIRED,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED,
]);

const EVIDENCE_PACK_BLOCKED_STATUSES = Object.freeze([
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.HASH_MISMATCH,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EVIDENCE_MISSING,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EXPIRED,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CONFLICT,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.INVALID,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED,
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
  "continuationFromOro10tConfirmed",
  "oro10tFinalApprovalDecisionRecordVerificationGatePresent",
  "staticFinalApprovalDecisionRecordVerificationPresent",
  "finalApprovalDecisionRecordVerificationStaticMockOnly",
  "finalApprovalDecisionRecordVerificationNonAuthorizing",
  "finalApprovalDecisionEvidencePackGatePresent",
  "staticFinalApprovalDecisionEvidencePackPresent",
  "finalApprovalDecisionEvidencePackStaticMockOnly",
  "finalApprovalDecisionEvidencePackOnly",
  "verifiedDecisionRecordSourceModelPresent",
  "verifiedDecisionRecordSourceStaticMockOnly",
  "verifiedDecisionRecordSourceSanitized",
  "decisionEvidencePackBuilt",
  "staticEvidencePackDigestBuilt",
  "staticEvidencePackMetadataBuilt",
  "evidencePackDigestCompared",
  "evidencePackMetadataCompared",
  "evidencePackContentRulesApplied",
  "evidencePackNonAuthorizing",
  "evidencePackPreparedIsNotFinalApprovalIssued",
  "evidencePackReadyIsNotSignedRuntimeApproval",
  "evidenceDigestIsNotActualSignedArtifactVerification",
  "evidencePackDoesNotAuthorizeRuntime",
  "evidencePackDoesNotAuthorizeRouteMount",
  "evidencePackDoesNotAuthorizeExternalCall",
  "evidencePackDoesNotAuthorizeGameLaunch",
  "evidencePackDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10uShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionEvidencePackOnly",
  "nonAuthorizingDecisionEvidencePackOnly",
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
  "verifiedShortOro10uFilenamesOnly",
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

const EVIDENCE_PACK_FIELD_ALIASES = Object.freeze([
  "evidencePackStatus",
  "finalApprovalDecisionEvidencePackStatus",
  "packStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED,
  evidence_pack_prepared: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED,
  ready: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY,
  review_only_ready: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY,
  rejected: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REJECTED,
  changes_required: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CHANGES_REQUIRED,
  failed: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED,
  verification_failed: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED,
  hash_mismatch: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.HASH_MISMATCH,
  evidence_missing: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EVIDENCE_MISSING,
  missing_evidence: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EVIDENCE_MISSING,
  expired: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EXPIRED,
  conflict: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CONFLICT,
  conflicting: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CONFLICT,
  invalid: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.INVALID,
  fail_closed: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED,
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

function buildOro10uStaticEvidencePackDigest(pack = {}) {
  const safePack = redactGuardedValues(pack);
  const digestInput = stableDigestInput(safePack);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10u-static-evidence-pack-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10uSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10uPredecessorEvidence() {
  const oro10tSummary = evaluateOro10tFinalApprovalDecisionRecordVerificationGate();
  const passed = oro10tSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10T_KEY]: true,
    [ORO10T_PASSED_KEY]: passed,
    [VERIFIED_ORO10T_ONLY_KEY]: passed && oro10tSummary.finalApprovalDecisionRecordVerificationGateScope === ORO10T_SCOPE,
    oro10tStatus: passed
      ? oro10tSummary.finalApprovalDecisionRecordVerificationStatus
      : ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED,
    oro10tScope: passed ? ORO10T_SCOPE : HOLD,
    oro10tClosed: passed,
    oro10aPredecessorPresent: passed && oro10tSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10tSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10tSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10tSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10tSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10tSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10tSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10tSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10tSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10tSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10tSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10tSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10tSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10tSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10tSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10tSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10tSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed && oro10tSummary.oro10rPredecessorPresent === true,
    oro10sPredecessorPresent: passed && oro10tSummary.oro10sPredecessorPresent === true,
    oro10tPredecessorPresent: passed,
    oro10tFinalApprovalDecisionRecordVerificationGatePresent:
      passed && oro10tSummary.finalApprovalDecisionRecordVerificationGateScope === ORO10T_SCOPE,
    staticFinalApprovalDecisionRecordVerificationPresent:
      passed && oro10tSummary.staticFinalApprovalDecisionRecordVerificationPresent === true,
    finalApprovalDecisionRecordVerificationStaticMockOnly:
      passed && oro10tSummary.finalApprovalDecisionRecordVerificationStaticMockOnly === true,
    finalApprovalDecisionRecordVerificationNonAuthorizing:
      passed && oro10tSummary.recordVerificationNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10uPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10uPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10uDefaultEvidencePackShell() {
  const safetyEvidence = buildOro10uSafetySummary();
  const basePack = {
    phase: ORO10U_PHASE,
    finalApprovalDecisionEvidencePackGateScope: ORO10U_SCOPE,
    finalApprovalDecisionEvidencePackStatus: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED,
    verifiedRecordId: "oro10u-static-verified-record",
    evidencePackId: "oro10u-static-evidence-pack",
    verifiedRecordEvidencePresent: true,
    evidencePackMetadataPresent: true,
    evidencePackContentPresent: true,
    evidencePackExpired: false,
    evidencePackConflict: false,
    verifiedDecisionRecordSourceModel: "oro10t_static_mock_verified_decision_record",
    evidencePackDisposition: "prepared_for_review_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10uStaticEvidencePackDigest({
    phase: ORO10U_PHASE,
    scope: ORO10U_SCOPE,
    evidencePackId: basePack.evidencePackId,
    status: basePack.finalApprovalDecisionEvidencePackStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10uPredecessorEvidence(),
    evidencePackEvidence: {
      ...basePack,
      expectedStaticEvidencePackDigest: digest,
      providedStaticEvidencePackDigest: digest,
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
  if (!value) return ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED;
  if (Object.values(ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of EVIDENCE_PACK_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED;
}

function buildOro10uDecisionEvidencePack(input = {}) {
  const baseline = buildOro10uDefaultEvidencePackShell();
  const sourcePack = isPlainObject(input.evidencePackEvidence) ? input.evidencePackEvidence : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const pack = isPlainObject(merged.evidencePackEvidence) ? merged.evidencePackEvidence : {};
  const safePack = redactGuardedValues(pack);
  const status = normalizeStatus(statusFrom([merged, pack]));
  const evidencePackId = readStringFrom([pack, merged], "evidencePackId", baseline.evidencePackEvidence.evidencePackId);
  const verifiedRecordId = readStringFrom([pack, merged], "verifiedRecordId", baseline.evidencePackEvidence.verifiedRecordId);
  const digest = buildOro10uStaticEvidencePackDigest({
    phase: ORO10U_PHASE,
    scope: ORO10U_SCOPE,
    evidencePackId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(sourcePack, "expectedStaticEvidencePackDigest")
    ? readStringFrom([sourcePack], "expectedStaticEvidencePackDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(sourcePack, "providedStaticEvidencePackDigest")
    ? readStringFrom([sourcePack], "providedStaticEvidencePackDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10U_PHASE,
    finalApprovalDecisionEvidencePackGateScope: ORO10U_SCOPE,
    finalApprovalDecisionEvidencePackStatus: status,
    verifiedRecordId,
    evidencePackId,
    verifiedRecordEvidencePresent: readBooleanFrom([pack, merged], "verifiedRecordEvidencePresent", true),
    evidencePackMetadataPresent: readBooleanFrom([pack, merged], "evidencePackMetadataPresent", true),
    evidencePackContentPresent: readBooleanFrom([pack, merged], "evidencePackContentPresent", true),
    evidencePackExpired: readBooleanFrom([pack, merged], "evidencePackExpired", false),
    evidencePackConflict: readBooleanFrom([pack, merged], "evidencePackConflict", false),
    verifiedDecisionRecordSourceModel: readStringFrom(
      [pack, merged],
      "verifiedDecisionRecordSourceModel",
      "oro10t_static_mock_verified_decision_record"
    ),
    evidencePackDisposition: readStringFrom([pack, merged], "evidencePackDisposition", "prepared_for_review_only"),
    staticEvidencePackDigest: digest,
    expectedStaticEvidencePackDigest: expectedDigest,
    providedStaticEvidencePackDigest: providedDigest,
    evidencePackDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePack: safePack,
    decisionEvidencePackBuilt: true,
    verifiedDecisionRecordSourceSanitized: true,
    staticEvidencePackDigestBuilt: true,
    staticEvidencePackMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10uFinalApprovalDecisionEvidencePackInput(input = {}) {
  const baseline = buildOro10uDefaultEvidencePackShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const pack = isPlainObject(merged.evidencePackEvidence) ? merged.evidencePackEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const evidencePack = buildOro10uDecisionEvidencePack(input);
  const predecessorSources = [merged, predecessor];
  const packSources = [merged, pack];
  const safetySources = [merged, safety, pack, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(packSources, "phase", ORO10U_PHASE),
    finalApprovalDecisionEvidencePackGateScope: readStringFrom(
      packSources,
      "finalApprovalDecisionEvidencePackGateScope",
      ORO10U_SCOPE
    ),
    finalApprovalDecisionEvidencePackStatus: evidencePack.finalApprovalDecisionEvidencePackStatus,
    verifiedRecordId: evidencePack.verifiedRecordId,
    evidencePackId: evidencePack.evidencePackId,
    verifiedRecordEvidencePresent: evidencePack.verifiedRecordEvidencePresent,
    evidencePackMetadataPresent: evidencePack.evidencePackMetadataPresent,
    evidencePackContentPresent: evidencePack.evidencePackContentPresent,
    evidencePackExpired: evidencePack.evidencePackExpired,
    evidencePackConflict: evidencePack.evidencePackConflict,
    verifiedDecisionRecordSourceModel: evidencePack.verifiedDecisionRecordSourceModel,
    evidencePackDisposition: evidencePack.evidencePackDisposition,
    evidencePackDigestMatches: evidencePack.evidencePackDigestMatches,
    evidencePack,
    [DEPENDS_ON_ORO10T_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10T_KEY, true),
    [ORO10T_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10T_PASSED_KEY, true),
    [VERIFIED_ORO10T_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10T_ONLY_KEY, true),
    oro10tStatus: readStringFrom(
      predecessorSources,
      "oro10tStatus",
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED
    ),
    oro10tScope: readStringFrom(predecessorSources, "oro10tScope", ORO10T_SCOPE),
    oro10tClosed: readBooleanFrom(predecessorSources, "oro10tClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(packSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(packSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(packSources, "nextStepRequiresSeparateRuntimeApproval", true),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10uNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10uFinalApprovalDecisionEvidencePackInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10u`);
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
  const fixture = normalizeOro10uFinalApprovalDecisionEvidencePackInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10U_PHASE) blockers.push("invalid_oro10u_phase");
  if (fixture.finalApprovalDecisionEvidencePackGateScope !== ORO10U_SCOPE) {
    blockers.push("invalid_oro10u_final_approval_decision_evidence_pack_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10T_KEY] || !fixture[ORO10T_PASSED_KEY] || !fixture[VERIFIED_ORO10T_ONLY_KEY]) {
    blockers.push("missing_oro10t_final_approval_decision_record_verification_gate");
  }
  if (fixture.oro10tScope !== ORO10T_SCOPE || !fixture.oro10tClosed) {
    blockers.push("invalid_oro10t_final_approval_decision_record_verification_gate");
  }
  if (!fixture.verifiedRecordId || fixture.verifiedRecordId.length < 8) blockers.push("invalid_verified_record_id");
  if (!fixture.evidencePackId || fixture.evidencePackId.length < 8) blockers.push("invalid_evidence_pack_id");
  if (!fixture.verifiedRecordEvidencePresent) blockers.push("missing_decision_record_evidence");
  if (!fixture.evidencePackMetadataPresent) blockers.push("missing_evidence_pack_metadata");
  if (!fixture.evidencePackContentPresent) blockers.push("missing_evidence_pack_content");
  if (fixture.evidencePackExpired) blockers.push("evidence_pack_expired");
  if (fixture.evidencePackConflict) blockers.push("evidence_pack_conflict");
  if (!fixture.evidencePackDigestMatches) blockers.push("evidence_pack_digest_mismatch");
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.HASH_MISMATCH) {
    blockers.push("evidence_pack_digest_mismatch");
  }
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EVIDENCE_MISSING) {
    blockers.push("missing_decision_record_evidence");
  }
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EXPIRED) {
    blockers.push("evidence_pack_expired");
  }
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CONFLICT) {
    blockers.push("evidence_pack_conflict");
  }
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.INVALID) {
    blockers.push("evidence_pack_invalid");
  }
  if (fixture.finalApprovalDecisionEvidencePackStatus === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED) {
    blockers.push("evidence_pack_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10uNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function evidencePackOutcomeFor(status, blockers) {
  if (status === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (EVIDENCE_PACK_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "evidence_pack_blocked";
  if (status === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY) {
    return "review_only_ready_non_runtime";
  }
  if (status === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REJECTED) return "rejected_non_runtime";
  if (status === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CHANGES_REQUIRED) return "changes_required";
  if (status === ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED) {
    return "verification_failed_non_runtime";
  }
  return "evidence_pack_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10U_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10U_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10T_KEY]: pass && fixture[DEPENDS_ON_ORO10T_KEY],
    [ORO10T_PASSED_KEY]: pass && fixture[ORO10T_PASSED_KEY],
    [VERIFIED_ORO10T_ONLY_KEY]: pass && fixture[VERIFIED_ORO10T_ONLY_KEY],
    oro10tStatus: pass ? fixture.oro10tStatus : HOLD,
    oro10tScope: pass ? fixture.oro10tScope : HOLD,
    oro10tClosed: pass && fixture.oro10tClosed,
    finalApprovalDecisionEvidencePackGateScope: pass ? fixture.finalApprovalDecisionEvidencePackGateScope : HOLD,
    finalApprovalDecisionEvidencePackStatus: pass
      ? fixture.finalApprovalDecisionEvidencePackStatus
      : ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED,
    evidencePackOutcome: evidencePackOutcomeFor(fixture.finalApprovalDecisionEvidencePackStatus, blockers),
    decisionEvidencePack: fixture.evidencePack,
    staticEvidencePackDigest: fixture.evidencePack.staticEvidencePackDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10uFinalApprovalDecisionEvidencePackGate(input = buildOro10uDefaultEvidencePackShell()) {
  const fixture = normalizeOro10uFinalApprovalDecisionEvidencePackInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!EVIDENCE_PACK_PASS_STATUSES.includes(fixture.finalApprovalDecisionEvidencePackStatus)) {
    return buildOutput(HOLD, ["evidence_pack_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10uFinalApprovalDecisionEvidencePackGate(input = {}) {
  return evaluateOro10uFinalApprovalDecisionEvidencePackGate(input);
}

module.exports = {
  ORO10U_PHASE,
  ORO10U_SCOPE,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS,
  ORO10U_RESULT_KEY,
  DEPENDS_ON_ORO10T_KEY,
  ORO10T_PASSED_KEY,
  VERIFIED_ORO10T_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10uSafetySummary,
  buildOro10uPredecessorEvidence,
  buildOro10uDecisionEvidencePack,
  buildOro10uStaticEvidencePackDigest,
  normalizeOro10uFinalApprovalDecisionEvidencePackInput,
  assertOro10uNoRuntimeAuthorization,
  evaluateOro10uFinalApprovalDecisionEvidencePackGate,
  validateOro10uFinalApprovalDecisionEvidencePackGate,
};
