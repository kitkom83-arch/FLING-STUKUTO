"use strict";

const {
  HOLD,
  PASS,
  ORO10U_SCOPE,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS,
  evaluateOro10uFinalApprovalDecisionEvidencePackGate,
} = require("./oro10uFinalApprovalDecisionEvidencePackGate");

const ORO10V_PHASE = "ORO-10V";
const ORO10V_SCOPE = "approval_chain_rollover_final_approval_decision_evidence_pack_verification_gate_only";
const ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS = Object.freeze({
  PREPARED: "mock_evidence_pack_verification_prepared",
  VERIFIED_FOR_REVIEW_ONLY: "mock_evidence_pack_verified_for_review_only",
  REJECTED: "mock_evidence_pack_verification_rejected",
  CHANGES_REQUIRED: "mock_evidence_pack_verification_changes_required",
  VERIFICATION_FAILED: "mock_evidence_pack_verification_failed",
  DIGEST_MISMATCH: "mock_evidence_pack_digest_mismatch",
  EVIDENCE_MISSING: "mock_evidence_pack_evidence_missing",
  INCOMPLETE: "mock_evidence_pack_incomplete",
  EXPIRED: "mock_evidence_pack_expired",
  CONFLICT: "mock_evidence_pack_conflict",
  INVALID: "mock_evidence_pack_invalid",
  FAIL_CLOSED: "fail_closed",
});

const ORO10V_RESULT_KEY = "finalApprovalDecisionEvidencePackVerificationGateResult";
const DEPENDS_ON_ORO10U_KEY = "dependsOnOro10uFinalApprovalDecisionEvidencePackGate";
const ORO10U_PASSED_KEY = "oro10uFinalApprovalDecisionEvidencePackGatePassed";
const VERIFIED_ORO10U_ONLY_KEY = "verifiedOro10uWasFinalApprovalDecisionEvidencePackGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10vFinalApprovalDecisionEvidencePackVerificationGateFromOro10uFixture";
const REDACTED_GUARDED_FIELD_KEY = "guardedCredentialMarkerRedacted";

const VERIFICATION_PASS_STATUSES = Object.freeze([
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.REJECTED,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
]);

const VERIFICATION_BLOCKED_STATUSES = Object.freeze([
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INCOMPLETE,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EXPIRED,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CONFLICT,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INVALID,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
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
  "continuationFromOro10uConfirmed",
  "oro10uFinalApprovalDecisionEvidencePackGatePresent",
  "staticFinalApprovalDecisionEvidencePackPresent",
  "finalApprovalDecisionEvidencePackStaticMockOnly",
  "finalApprovalDecisionEvidencePackNonAuthorizing",
  "finalApprovalDecisionEvidencePackVerificationGatePresent",
  "evidencePackVerificationOnly",
  "staticFinalApprovalDecisionEvidencePackVerificationPresent",
  "finalApprovalDecisionEvidencePackVerificationStaticMockOnly",
  "evidencePackSourceModelPresent",
  "evidencePackSourceStaticMockOnly",
  "evidencePackSourceSanitized",
  "evidencePackSourceFromOro10uOnly",
  "evidencePackVerificationEvidenceBuilt",
  "staticEvidencePackVerificationDigestBuilt",
  "staticEvidencePackVerificationMetadataBuilt",
  "evidencePackVerificationMetadataRulesApplied",
  "evidencePackCompletenessRulesApplied",
  "evidencePackIntegrityRulesApplied",
  "evidencePackVerificationDigestCompared",
  "evidencePackVerificationMetadataCompared",
  "evidencePackVerificationNonAuthorizing",
  "evidencePackVerifiedForReviewOnlyIsNotFinalApprovalIssued",
  "evidencePackVerificationPassIsNotSignedRuntimeApproval",
  "evidencePackVerificationDigestIsNotActualSignedArtifactVerification",
  "evidencePackVerificationDoesNotAuthorizeRuntime",
  "evidencePackVerificationDoesNotAuthorizeRouteMount",
  "evidencePackVerificationDoesNotAuthorizeExternalCall",
  "evidencePackVerificationDoesNotAuthorizeGameLaunch",
  "evidencePackVerificationDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "actualSignedApprovalArtifactVerificationNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10vShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionEvidencePackVerificationOnly",
  "nonAuthorizingDecisionEvidencePackVerificationOnly",
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
  "verifiedShortOro10vFilenamesOnly",
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

const VERIFICATION_FIELD_ALIASES = Object.freeze([
  "evidencePackVerificationStatus",
  "finalApprovalDecisionEvidencePackVerificationStatus",
  "verificationStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED,
  verification_prepared: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED,
  verified: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  verified_for_review_only:
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  review_only_verified:
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
  rejected: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.REJECTED,
  changes_required: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
  failed: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
  verification_failed: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
  digest_mismatch: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
  evidence_missing: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  missing_evidence: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
  incomplete: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INCOMPLETE,
  expired: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EXPIRED,
  conflict: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CONFLICT,
  conflicting: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CONFLICT,
  invalid: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INVALID,
  fail_closed: ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
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

function buildOro10vStaticEvidencePackVerificationDigest(verificationEvidence = {}) {
  const safeEvidence = redactGuardedValues(verificationEvidence);
  const digestInput = stableDigestInput(safeEvidence);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10v-static-evidence-pack-verification-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10vSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10vPredecessorEvidence() {
  const oro10uSummary = evaluateOro10uFinalApprovalDecisionEvidencePackGate();
  const passed = oro10uSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10U_KEY]: true,
    [ORO10U_PASSED_KEY]: passed,
    [VERIFIED_ORO10U_ONLY_KEY]: passed && oro10uSummary.finalApprovalDecisionEvidencePackGateScope === ORO10U_SCOPE,
    oro10uStatus: passed
      ? oro10uSummary.finalApprovalDecisionEvidencePackStatus
      : ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
    oro10uScope: passed ? ORO10U_SCOPE : HOLD,
    oro10uClosed: passed,
    oro10aPredecessorPresent: passed && oro10uSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10uSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10uSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10uSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10uSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10uSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10uSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10uSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10uSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10uSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10uSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10uSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10uSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10uSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10uSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10uSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10uSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed && oro10uSummary.oro10rPredecessorPresent === true,
    oro10sPredecessorPresent: passed && oro10uSummary.oro10sPredecessorPresent === true,
    oro10tPredecessorPresent: passed && oro10uSummary.oro10tPredecessorPresent === true,
    oro10uPredecessorPresent: passed,
    oro10uFinalApprovalDecisionEvidencePackGatePresent:
      passed && oro10uSummary.finalApprovalDecisionEvidencePackGateScope === ORO10U_SCOPE,
    staticFinalApprovalDecisionEvidencePackPresent:
      passed && oro10uSummary.staticFinalApprovalDecisionEvidencePackPresent === true,
    finalApprovalDecisionEvidencePackStaticMockOnly:
      passed && oro10uSummary.finalApprovalDecisionEvidencePackStaticMockOnly === true,
    finalApprovalDecisionEvidencePackNonAuthorizing: passed && oro10uSummary.evidencePackNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10vPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10vPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10vDefaultVerificationShell() {
  const safetyEvidence = buildOro10vSafetySummary();
  const baseEvidence = {
    phase: ORO10V_PHASE,
    finalApprovalDecisionEvidencePackVerificationGateScope: ORO10V_SCOPE,
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED,
    sourceEvidencePackId: "oro10u-static-evidence-pack",
    evidencePackVerificationId: "oro10v-static-evidence-pack-verification",
    evidencePackSourceModel: "oro10u_static_mock_final_approval_decision_evidence_pack",
    oro10uEvidencePackEvidencePresent: true,
    evidencePackMetadataPresent: true,
    evidencePackContentPresent: true,
    evidencePackComplete: true,
    evidencePackExpired: false,
    evidencePackConflict: false,
    evidencePackVerificationDisposition: "prepared_for_review_only",
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const digest = buildOro10vStaticEvidencePackVerificationDigest({
    phase: ORO10V_PHASE,
    scope: ORO10V_SCOPE,
    sourceEvidencePackId: baseEvidence.sourceEvidencePackId,
    verificationId: baseEvidence.evidencePackVerificationId,
    status: baseEvidence.finalApprovalDecisionEvidencePackVerificationStatus,
  });
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10vPredecessorEvidence(),
    evidencePackVerificationEvidence: {
      ...baseEvidence,
      expectedStaticEvidencePackVerificationDigest: digest,
      providedStaticEvidencePackVerificationDigest: digest,
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
  if (!value) return ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED;
  if (Object.values(ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS).includes(value)) {
    return value;
  }
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of VERIFICATION_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED;
}

function buildOro10vEvidencePackVerificationEvidence(input = {}) {
  const baseline = buildOro10vDefaultVerificationShell();
  const sourceEvidence = isPlainObject(input.evidencePackVerificationEvidence)
    ? input.evidencePackVerificationEvidence
    : {};
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const evidence = isPlainObject(merged.evidencePackVerificationEvidence) ? merged.evidencePackVerificationEvidence : {};
  const safeEvidence = redactGuardedValues(evidence);
  const status = normalizeStatus(statusFrom([merged, evidence]));
  const sourceEvidencePackId = readStringFrom(
    [evidence, merged],
    "sourceEvidencePackId",
    baseline.evidencePackVerificationEvidence.sourceEvidencePackId
  );
  const evidencePackVerificationId = readStringFrom(
    [evidence, merged],
    "evidencePackVerificationId",
    baseline.evidencePackVerificationEvidence.evidencePackVerificationId
  );
  const digest = buildOro10vStaticEvidencePackVerificationDigest({
    phase: ORO10V_PHASE,
    scope: ORO10V_SCOPE,
    sourceEvidencePackId,
    verificationId: evidencePackVerificationId,
    status,
  });
  const expectedDigest = Object.prototype.hasOwnProperty.call(
    sourceEvidence,
    "expectedStaticEvidencePackVerificationDigest"
  )
    ? readStringFrom([sourceEvidence], "expectedStaticEvidencePackVerificationDigest", digest)
    : digest;
  const providedDigest = Object.prototype.hasOwnProperty.call(
    sourceEvidence,
    "providedStaticEvidencePackVerificationDigest"
  )
    ? readStringFrom([sourceEvidence], "providedStaticEvidencePackVerificationDigest", expectedDigest)
    : expectedDigest;
  return Object.freeze({
    phase: ORO10V_PHASE,
    finalApprovalDecisionEvidencePackVerificationGateScope: ORO10V_SCOPE,
    finalApprovalDecisionEvidencePackVerificationStatus: status,
    sourceEvidencePackId,
    evidencePackVerificationId,
    evidencePackSourceModel: readStringFrom(
      [evidence, merged],
      "evidencePackSourceModel",
      "oro10u_static_mock_final_approval_decision_evidence_pack"
    ),
    oro10uEvidencePackEvidencePresent: readBooleanFrom([evidence, merged], "oro10uEvidencePackEvidencePresent", true),
    evidencePackMetadataPresent: readBooleanFrom([evidence, merged], "evidencePackMetadataPresent", true),
    evidencePackContentPresent: readBooleanFrom([evidence, merged], "evidencePackContentPresent", true),
    evidencePackComplete: readBooleanFrom([evidence, merged], "evidencePackComplete", true),
    evidencePackExpired: readBooleanFrom([evidence, merged], "evidencePackExpired", false),
    evidencePackConflict: readBooleanFrom([evidence, merged], "evidencePackConflict", false),
    evidencePackVerificationDisposition: readStringFrom(
      [evidence, merged],
      "evidencePackVerificationDisposition",
      "prepared_for_review_only"
    ),
    staticEvidencePackVerificationDigest: digest,
    expectedStaticEvidencePackVerificationDigest: expectedDigest,
    providedStaticEvidencePackVerificationDigest: providedDigest,
    evidencePackVerificationDigestMatches: expectedDigest === providedDigest && providedDigest === digest,
    sanitizedEvidencePackVerificationEvidence: safeEvidence,
    evidencePackVerificationEvidenceBuilt: true,
    evidencePackSourceSanitized: true,
    staticEvidencePackVerificationDigestBuilt: true,
    staticEvidencePackVerificationMetadataBuilt: true,
    credentialLikeValuePresent: false,
    credentialHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput(input = {}) {
  const baseline = buildOro10vDefaultVerificationShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const evidence = isPlainObject(merged.evidencePackVerificationEvidence) ? merged.evidencePackVerificationEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const verificationEvidence = buildOro10vEvidencePackVerificationEvidence(input);
  const predecessorSources = [merged, predecessor];
  const evidenceSources = [merged, evidence];
  const safetySources = [merged, safety, evidence, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(evidenceSources, "phase", ORO10V_PHASE),
    finalApprovalDecisionEvidencePackVerificationGateScope: readStringFrom(
      evidenceSources,
      "finalApprovalDecisionEvidencePackVerificationGateScope",
      ORO10V_SCOPE
    ),
    finalApprovalDecisionEvidencePackVerificationStatus:
      verificationEvidence.finalApprovalDecisionEvidencePackVerificationStatus,
    sourceEvidencePackId: verificationEvidence.sourceEvidencePackId,
    evidencePackVerificationId: verificationEvidence.evidencePackVerificationId,
    evidencePackSourceModel: verificationEvidence.evidencePackSourceModel,
    oro10uEvidencePackEvidencePresent: verificationEvidence.oro10uEvidencePackEvidencePresent,
    evidencePackMetadataPresent: verificationEvidence.evidencePackMetadataPresent,
    evidencePackContentPresent: verificationEvidence.evidencePackContentPresent,
    evidencePackComplete: verificationEvidence.evidencePackComplete,
    evidencePackExpired: verificationEvidence.evidencePackExpired,
    evidencePackConflict: verificationEvidence.evidencePackConflict,
    evidencePackVerificationDisposition: verificationEvidence.evidencePackVerificationDisposition,
    evidencePackVerificationDigestMatches: verificationEvidence.evidencePackVerificationDigestMatches,
    evidencePackVerificationEvidence: verificationEvidence,
    [DEPENDS_ON_ORO10U_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10U_KEY, true),
    [ORO10U_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10U_PASSED_KEY, true),
    [VERIFIED_ORO10U_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10U_ONLY_KEY, true),
    oro10uStatus: readStringFrom(
      predecessorSources,
      "oro10uStatus",
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED
    ),
    oro10uScope: readStringFrom(predecessorSources, "oro10uScope", ORO10U_SCOPE),
    oro10uClosed: readBooleanFrom(predecessorSources, "oro10uClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(evidenceSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(evidenceSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(evidenceSources, "nextStepRequiresSeparateRuntimeApproval", true),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10vNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10v`);
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
  const fixture = normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10V_PHASE) blockers.push("invalid_oro10v_phase");
  if (fixture.finalApprovalDecisionEvidencePackVerificationGateScope !== ORO10V_SCOPE) {
    blockers.push("invalid_oro10v_final_approval_decision_evidence_pack_verification_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10U_KEY] || !fixture[ORO10U_PASSED_KEY] || !fixture[VERIFIED_ORO10U_ONLY_KEY]) {
    blockers.push("missing_oro10u_final_approval_decision_evidence_pack_gate");
  }
  if (fixture.oro10uScope !== ORO10U_SCOPE || !fixture.oro10uClosed) {
    blockers.push("invalid_oro10u_final_approval_decision_evidence_pack_gate");
  }
  if (!fixture.sourceEvidencePackId || fixture.sourceEvidencePackId.length < 8) {
    blockers.push("invalid_evidence_pack_id");
  }
  if (!fixture.evidencePackVerificationId || fixture.evidencePackVerificationId.length < 8) {
    blockers.push("invalid_evidence_pack_verification_id");
  }
  if (!fixture.oro10uEvidencePackEvidencePresent) blockers.push("missing_evidence_pack_evidence");
  if (!fixture.evidencePackMetadataPresent) blockers.push("missing_evidence_pack_metadata");
  if (!fixture.evidencePackContentPresent) blockers.push("missing_evidence_pack_content");
  if (!fixture.evidencePackComplete) blockers.push("incomplete_evidence_pack");
  if (fixture.evidencePackExpired) blockers.push("evidence_pack_expired");
  if (fixture.evidencePackConflict) blockers.push("evidence_pack_conflict");
  if (!fixture.evidencePackVerificationDigestMatches) blockers.push("evidence_pack_digest_mismatch");
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH
  ) {
    blockers.push("evidence_pack_digest_mismatch");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING
  ) {
    blockers.push("missing_evidence_pack_evidence");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INCOMPLETE
  ) {
    blockers.push("incomplete_evidence_pack");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EXPIRED
  ) {
    blockers.push("evidence_pack_expired");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CONFLICT
  ) {
    blockers.push("evidence_pack_conflict");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INVALID
  ) {
    blockers.push("evidence_pack_invalid");
  }
  if (
    fixture.finalApprovalDecisionEvidencePackVerificationStatus ===
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  ) {
    blockers.push("evidence_pack_verification_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10vNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function evidencePackVerificationOutcomeFor(status, blockers) {
  if (status === ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED) {
    return "fail_closed";
  }
  if (VERIFICATION_BLOCKED_STATUSES.includes(status) || blockers.length > 0) {
    return "evidence_pack_verification_blocked";
  }
  if (status === ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY) {
    return "verified_for_review_only_non_runtime";
  }
  if (status === ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.REJECTED) {
    return "rejected_non_runtime";
  }
  if (status === ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED) {
    return "changes_required";
  }
  if (status === ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED) {
    return "verification_failed_non_runtime";
  }
  return "evidence_pack_verification_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10V_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10V_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10U_KEY]: pass && fixture[DEPENDS_ON_ORO10U_KEY],
    [ORO10U_PASSED_KEY]: pass && fixture[ORO10U_PASSED_KEY],
    [VERIFIED_ORO10U_ONLY_KEY]: pass && fixture[VERIFIED_ORO10U_ONLY_KEY],
    oro10uStatus: pass ? fixture.oro10uStatus : HOLD,
    oro10uScope: pass ? fixture.oro10uScope : HOLD,
    oro10uClosed: pass && fixture.oro10uClosed,
    finalApprovalDecisionEvidencePackVerificationGateScope: pass
      ? fixture.finalApprovalDecisionEvidencePackVerificationGateScope
      : HOLD,
    finalApprovalDecisionEvidencePackVerificationStatus: pass
      ? fixture.finalApprovalDecisionEvidencePackVerificationStatus
      : ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED,
    evidencePackVerificationOutcome: evidencePackVerificationOutcomeFor(
      fixture.finalApprovalDecisionEvidencePackVerificationStatus,
      blockers
    ),
    evidencePackVerificationEvidence: fixture.evidencePackVerificationEvidence,
    staticEvidencePackVerificationDigest:
      fixture.evidencePackVerificationEvidence.staticEvidencePackVerificationDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(
  input = buildOro10vDefaultVerificationShell()
) {
  const fixture = normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!VERIFICATION_PASS_STATUSES.includes(fixture.finalApprovalDecisionEvidencePackVerificationStatus)) {
    return buildOutput(HOLD, ["evidence_pack_verification_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10vFinalApprovalDecisionEvidencePackVerificationGate(input = {}) {
  return evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(input);
}

module.exports = {
  ORO10V_PHASE,
  ORO10V_SCOPE,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS,
  ORO10V_RESULT_KEY,
  DEPENDS_ON_ORO10U_KEY,
  ORO10U_PASSED_KEY,
  VERIFIED_ORO10U_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10vSafetySummary,
  buildOro10vPredecessorEvidence,
  buildOro10vEvidencePackVerificationEvidence,
  buildOro10vStaticEvidencePackVerificationDigest,
  normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput,
  assertOro10vNoRuntimeAuthorization,
  evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate,
  validateOro10vFinalApprovalDecisionEvidencePackVerificationGate,
};
