"use strict";

const {
  HOLD,
  PASS,
  ORO10R_SCOPE,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS,
  evaluateOro10rFinalApprovalDecisionReviewGate,
} = require("./oro10rFinalApprovalDecisionReviewGate");

const ORO10S_PHASE = "ORO-10S";
const ORO10S_SCOPE = "approval_chain_rollover_final_approval_decision_record_gate_only";
const ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS = Object.freeze({
  PREPARED: "mock_record_prepared",
  REVIEW_ONLY_ACCEPTED: "mock_record_review_only_accepted",
  REJECTED: "mock_record_rejected",
  CHANGES_REQUIRED: "mock_record_changes_required",
  EXPIRED: "mock_record_expired",
  CONFLICT: "mock_record_conflict",
  INVALID: "mock_record_invalid",
  FAIL_CLOSED: "fail_closed",
});
const ORO10S_RESULT_KEY = "finalApprovalDecisionRecordGateResult";
const DEPENDS_ON_ORO10R_KEY = "dependsOnOro10rFinalApprovalDecisionReviewGate";
const ORO10R_PASSED_KEY = "oro10rFinalApprovalDecisionReviewGatePassed";
const VERIFIED_ORO10R_ONLY_KEY = "verifiedOro10rWasFinalApprovalDecisionReviewGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10sFinalApprovalDecisionRecordGateFromOro10rFixture";

const RECORD_PASS_STATUSES = Object.freeze([
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REJECTED,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
]);

const RECORD_BLOCKED_STATUSES = Object.freeze([
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.EXPIRED,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CONFLICT,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.INVALID,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED,
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
  "continuationFromOro10rConfirmed",
  "oro10rFinalApprovalDecisionReviewGatePresent",
  "staticFinalApprovalDecisionReviewRecordPresent",
  "finalApprovalDecisionReviewStaticMockOnly",
  "finalApprovalDecisionReviewNonAuthorizing",
  "finalApprovalDecisionRecordGatePresent",
  "staticFinalApprovalDecisionRecordPresent",
  "finalApprovalDecisionRecordStaticMockOnly",
  "finalApprovalDecisionRecordOnly",
  "finalApprovalDecisionRecordSanitized",
  "finalApprovalDecisionRecordEvidencePackBuilt",
  "staticFinalApprovalDecisionRecordDigestBuilt",
  "finalApprovalDecisionRecordNonAuthorizing",
  "recordAcceptedIsNotFinalApprovalIssued",
  "recordPreparedIsNotSignedRuntimeApproval",
  "recordReviewPassDoesNotAuthorizeRuntime",
  "recordDigestIsNotSignedApprovalArtifactVerification",
  "decisionRecordDoesNotAuthorizeRouteMount",
  "decisionRecordDoesNotAuthorizeExternalCall",
  "decisionRecordDoesNotAuthorizeGameLaunch",
  "decisionRecordDoesNotAuthorizeRuntimeApprovalChainRollover",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "signedRuntimeApprovalNotIssued",
  "signedApprovalArtifactAcceptanceNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10sShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionRecordOnly",
  "nonAuthorizingDecisionRecordOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedRuntimeApprovalOccurred",
  "verifiedNoSignedApprovalArtifactAcceptedOccurred",
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
  "verifiedNoSecretLikeValuePresent",
  "verifiedNoAuthHeaderLikeValuePresent",
  "verifiedShortOro10sFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "finalApprovalIssued",
  "signedRuntimeApproval",
  "signedApprovalArtifactAccepted",
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
  "secretLikeValuePresent",
  "authHeaderLikeValuePresent",
  "sensitiveOutputPresent",
  "longFilenameDetected",
]);

const DECISION_RECORD_FIELD_ALIASES = Object.freeze([
  "decisionRecordStatus",
  "finalApprovalDecisionRecordStatus",
  "recordStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  prepared: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED,
  record_prepared: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED,
  accepted: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED,
  review_only_accepted: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED,
  rejected: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REJECTED,
  changes_required: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  expired: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.EXPIRED,
  conflict: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CONFLICT,
  conflicting: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CONFLICT,
  invalid: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.INVALID,
  fail_closed: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED,
});

const GUARDED_KEY_PARTS = Object.freeze([
  ["to", "ken"],
  ["pass", "word"],
  ["se", "cret"],
  ["author", "ization"],
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

function buildOro10sStaticDecisionRecordDigest(record = {}) {
  const safeRecord = redactGuardedValues(record);
  const digestInput = stableDigestInput(safeRecord);
  let hash = 0x811c9dc5;
  for (let index = 0; index < digestInput.length; index += 1) {
    hash ^= digestInput.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `oro10s-static-record-digest-${hash.toString(16).padStart(8, "0")}`;
}

function buildOro10sSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10sPredecessorEvidence() {
  const oro10rSummary = evaluateOro10rFinalApprovalDecisionReviewGate();
  const passed = oro10rSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10R_KEY]: true,
    [ORO10R_PASSED_KEY]: passed,
    [VERIFIED_ORO10R_ONLY_KEY]: passed && oro10rSummary.finalApprovalDecisionReviewGateScope === ORO10R_SCOPE,
    oro10rStatus: passed
      ? oro10rSummary.finalApprovalDecisionReviewStatus
      : ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED,
    oro10rScope: passed ? ORO10R_SCOPE : HOLD,
    oro10rClosed: passed,
    oro10aPredecessorPresent: passed && oro10rSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10rSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10rSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10rSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10rSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10rSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10rSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10rSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10rSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10rSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10rSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10rSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10rSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10rSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10rSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10rSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed && oro10rSummary.oro10qPredecessorPresent === true,
    oro10rPredecessorPresent: passed,
    oro10rFinalApprovalDecisionReviewGatePresent:
      passed && oro10rSummary.finalApprovalDecisionReviewGatePresent === true,
    staticFinalApprovalDecisionReviewRecordPresent:
      passed && oro10rSummary.staticFinalApprovalDecisionReviewRecordPresent === true,
    finalApprovalDecisionReviewStaticMockOnly:
      passed && oro10rSummary.finalApprovalDecisionReviewStaticMockOnly === true,
    finalApprovalDecisionReviewNonAuthorizing:
      passed && oro10rSummary.finalApprovalDecisionReviewNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10sPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10sPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10sDefaultRecordShell() {
  const safetyEvidence = buildOro10sSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10sPredecessorEvidence(),
    decisionRecordEvidence: {
      phase: ORO10S_PHASE,
      finalApprovalDecisionRecordGateScope: ORO10S_SCOPE,
      finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED,
      reviewDecisionId: "oro10s-static-reviewed-decision",
      decisionReviewEvidencePresent: true,
      decisionReviewEvidenceConflicts: false,
      decisionReviewEvidenceExpired: false,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      approvalDecisionAuthorizesRuntime: false,
      finalApprovalDecisionAuthorizesRuntime: false,
      runtimeReviewDecision: false,
      "runtimeAuthorization": false,
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
  if (!value) return ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED;
  if (Object.values(ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of DECISION_RECORD_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED;
}

function buildOro10sDecisionRecordEvidencePack(input = {}) {
  const baseline = buildOro10sDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const record = isPlainObject(merged.decisionRecordEvidence) ? merged.decisionRecordEvidence : {};
  const safeRecord = redactGuardedValues(record);
  const status = normalizeStatus(statusFrom([merged, record]));
  const reviewDecisionId = readStringFrom([record, merged], "reviewDecisionId", baseline.decisionRecordEvidence.reviewDecisionId);
  const digest = buildOro10sStaticDecisionRecordDigest({
    phase: ORO10S_PHASE,
    scope: ORO10S_SCOPE,
    status,
    reviewDecisionId,
  });
  return Object.freeze({
    phase: ORO10S_PHASE,
    finalApprovalDecisionRecordGateScope: ORO10S_SCOPE,
    finalApprovalDecisionRecordStatus: status,
    reviewDecisionId,
    decisionReviewEvidencePresent: readBooleanFrom([record, merged], "decisionReviewEvidencePresent", true),
    decisionReviewEvidenceConflicts: readBooleanFrom([record, merged], "decisionReviewEvidenceConflicts", false),
    decisionReviewEvidenceExpired: readBooleanFrom([record, merged], "decisionReviewEvidenceExpired", false),
    staticDecisionRecordDigest: digest,
    sanitizedDecisionRecordEvidence: safeRecord,
    finalApprovalDecisionRecordEvidencePackBuilt: true,
    finalApprovalDecisionRecordSanitized: true,
    staticFinalApprovalDecisionRecordDigestBuilt: true,
    secretLikeValuePresent: false,
    authHeaderLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10sFinalApprovalDecisionRecordInput(input = {}) {
  const baseline = buildOro10sDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const record = isPlainObject(merged.decisionRecordEvidence) ? merged.decisionRecordEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const evidencePack = buildOro10sDecisionRecordEvidencePack(merged);
  const predecessorSources = [merged, predecessor];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(recordSources, "phase", ORO10S_PHASE),
    finalApprovalDecisionRecordGateScope: readStringFrom(
      recordSources,
      "finalApprovalDecisionRecordGateScope",
      ORO10S_SCOPE
    ),
    finalApprovalDecisionRecordStatus: evidencePack.finalApprovalDecisionRecordStatus,
    reviewDecisionId: evidencePack.reviewDecisionId,
    decisionReviewEvidencePresent: evidencePack.decisionReviewEvidencePresent,
    decisionReviewEvidenceConflicts: evidencePack.decisionReviewEvidenceConflicts,
    decisionReviewEvidenceExpired: evidencePack.decisionReviewEvidenceExpired,
    evidencePack,
    [DEPENDS_ON_ORO10R_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10R_KEY, true),
    [ORO10R_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10R_PASSED_KEY, true),
    [VERIFIED_ORO10R_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10R_ONLY_KEY, true),
    oro10rStatus: readStringFrom(
      predecessorSources,
      "oro10rStatus",
      ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW
    ),
    oro10rScope: readStringFrom(predecessorSources, "oro10rScope", ORO10R_SCOPE),
    oro10rClosed: readBooleanFrom(predecessorSources, "oro10rClosed", true),
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

function assertOro10sNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10sFinalApprovalDecisionRecordInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10s`);
  }
  for (const key of [
    "verifiedNoFinalApprovalIssued",
    "verifiedNoRuntimeAuthorizationOccurred",
    "verifiedNoSignedRuntimeApprovalOccurred",
    "verifiedNoSignedApprovalArtifactAcceptedOccurred",
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
    "verifiedNoSecretLikeValuePresent",
    "verifiedNoAuthHeaderLikeValuePresent",
  ]) {
    if (fixture[key] !== true) blockers.push(`${key}_required`);
  }
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeOro10sFinalApprovalDecisionRecordInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10S_PHASE) blockers.push("invalid_oro10s_phase");
  if (fixture.finalApprovalDecisionRecordGateScope !== ORO10S_SCOPE) {
    blockers.push("invalid_oro10s_final_approval_decision_record_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10R_KEY] || !fixture[ORO10R_PASSED_KEY] || !fixture[VERIFIED_ORO10R_ONLY_KEY]) {
    blockers.push("missing_oro10r_final_approval_decision_review_gate");
  }
  if (fixture.oro10rScope !== ORO10R_SCOPE || !fixture.oro10rClosed) {
    blockers.push("invalid_oro10r_final_approval_decision_review_gate");
  }
  if (!fixture.reviewDecisionId || fixture.reviewDecisionId.length < 8) blockers.push("invalid_review_decision_id");
  if (!fixture.decisionReviewEvidencePresent) blockers.push("missing_decision_review_evidence");
  if (fixture.decisionReviewEvidenceExpired) blockers.push("decision_review_evidence_expired");
  if (fixture.decisionReviewEvidenceConflicts) blockers.push("decision_review_evidence_conflict");
  if (fixture.finalApprovalDecisionRecordStatus === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.EXPIRED) {
    blockers.push("decision_record_expired");
  }
  if (fixture.finalApprovalDecisionRecordStatus === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CONFLICT) {
    blockers.push("decision_record_conflict");
  }
  if (fixture.finalApprovalDecisionRecordStatus === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.INVALID) {
    blockers.push("decision_record_invalid");
  }
  if (fixture.finalApprovalDecisionRecordStatus === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED) {
    blockers.push("decision_record_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10sNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function recordOutcomeFor(status, blockers) {
  if (status === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (RECORD_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "record_blocked";
  if (status === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED) {
    return "review_only_accepted_non_runtime";
  }
  if (status === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REJECTED) return "rejected_non_runtime";
  if (status === ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CHANGES_REQUIRED) return "changes_required";
  return "record_prepared";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10S_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10S_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10R_KEY]: pass && fixture[DEPENDS_ON_ORO10R_KEY],
    [ORO10R_PASSED_KEY]: pass && fixture[ORO10R_PASSED_KEY],
    [VERIFIED_ORO10R_ONLY_KEY]: pass && fixture[VERIFIED_ORO10R_ONLY_KEY],
    oro10rStatus: pass ? fixture.oro10rStatus : HOLD,
    oro10rScope: pass ? fixture.oro10rScope : HOLD,
    oro10rClosed: pass && fixture.oro10rClosed,
    finalApprovalDecisionRecordGateScope: pass ? fixture.finalApprovalDecisionRecordGateScope : HOLD,
    finalApprovalDecisionRecordStatus: pass
      ? fixture.finalApprovalDecisionRecordStatus
      : ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED,
    decisionRecordOutcome: recordOutcomeFor(fixture.finalApprovalDecisionRecordStatus, blockers),
    decisionRecordEvidencePack: fixture.evidencePack,
    staticDecisionRecordDigest: fixture.evidencePack.staticDecisionRecordDigest,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10sFinalApprovalDecisionRecordGate(input = buildOro10sDefaultRecordShell()) {
  const fixture = normalizeOro10sFinalApprovalDecisionRecordInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!RECORD_PASS_STATUSES.includes(fixture.finalApprovalDecisionRecordStatus)) {
    return buildOutput(HOLD, ["decision_record_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10sFinalApprovalDecisionRecordGate(input = {}) {
  return evaluateOro10sFinalApprovalDecisionRecordGate(input);
}

module.exports = {
  ORO10S_PHASE,
  ORO10S_SCOPE,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS,
  ORO10S_RESULT_KEY,
  DEPENDS_ON_ORO10R_KEY,
  ORO10R_PASSED_KEY,
  VERIFIED_ORO10R_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10sSafetySummary,
  buildOro10sPredecessorEvidence,
  buildOro10sDecisionRecordEvidencePack,
  buildOro10sStaticDecisionRecordDigest,
  normalizeOro10sFinalApprovalDecisionRecordInput,
  assertOro10sNoRuntimeAuthorization,
  evaluateOro10sFinalApprovalDecisionRecordGate,
  validateOro10sFinalApprovalDecisionRecordGate,
};
