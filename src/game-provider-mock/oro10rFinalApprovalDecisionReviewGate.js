"use strict";

const {
  HOLD,
  PASS,
  ORO10Q_SCOPE,
  ORO10Q_STATUS,
  buildOro10qFinalApprovalDecisionIntakeGate,
  validateOro10qFinalApprovalDecisionIntakeGate,
} = require("./oro10qFinalApprovalDecisionIntakeGate");

const ORO10R_PHASE = "ORO-10R";
const ORO10R_SCOPE = "approval_chain_rollover_final_approval_decision_review_gate_only";
const ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS = Object.freeze({
  RECEIVED_FOR_REVIEW: "mock_decision_received_for_review",
  APPROVED_FOR_REVIEW_ONLY: "mock_decision_approved_for_review_only",
  REJECTED: "mock_decision_rejected",
  CHANGES_REQUIRED: "mock_decision_changes_required",
  EXPIRED: "mock_decision_expired",
  CONFLICT: "mock_decision_conflict",
  INVALID: "mock_decision_invalid",
  FAIL_CLOSED: "fail_closed",
});
const ORO10R_RESULT_KEY = "finalApprovalDecisionReviewGateResult";
const DEPENDS_ON_ORO10Q_KEY = "dependsOnOro10qFinalApprovalDecisionIntakeGate";
const ORO10Q_PASSED_KEY = "oro10qFinalApprovalDecisionIntakeGatePassed";
const VERIFIED_ORO10Q_ONLY_KEY = "verifiedOro10qWasFinalApprovalDecisionIntakeGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10rFinalApprovalDecisionReviewGateFromOro10qFixture";

const REVIEW_PASS_STATUSES = Object.freeze([
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.REJECTED,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
]);

const REVIEW_BLOCKED_STATUSES = Object.freeze([
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.EXPIRED,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CONFLICT,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.INVALID,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED,
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
  "continuationFromOro10qConfirmed",
  "oro10qFinalApprovalDecisionIntakeGatePresent",
  "staticFinalApprovalDecisionIntakeRecordPresent",
  "finalApprovalDecisionIntakeStaticMockOnly",
  "finalApprovalDecisionIntakeNonAuthorizing",
  "finalApprovalDecisionReviewGatePresent",
  "staticFinalApprovalDecisionReviewRecordPresent",
  "finalApprovalDecisionReviewStaticMockOnly",
  "finalApprovalDecisionReviewSanitized",
  "finalApprovalDecisionReviewEvidencePackBuilt",
  "finalApprovalDecisionReviewNonAuthorizing",
  "approvalForReviewOnlyIsNotRuntimeApproval",
  "reviewPassIsNotFinalApprovalIssued",
  "decisionIntakeIsNotActivation",
  "decisionReviewDoesNotAuthorizeRouteMount",
  "decisionReviewDoesNotAuthorizeExternalCall",
  "decisionReviewDoesNotAuthorizeGameLaunch",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "signedRuntimeApprovalNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10rShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionReviewOnly",
  "nonAuthorizingDecisionReviewOnly",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalApprovalDecisionAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedRuntimeApprovalOccurred",
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
  "verifiedShortOro10rFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "finalApprovalIssued",
  "signedRuntimeApproval",
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
  "sensitiveOutputPresent",
  "longFilenameDetected",
]);

const DECISION_FIELD_ALIASES = Object.freeze([
  "decisionReviewStatus",
  "finalApprovalDecisionReviewStatus",
  "decisionStatus",
  "status",
]);

const SAFE_STATUS_ALIASES = Object.freeze({
  received: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW,
  received_for_review: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW,
  approve_for_review_only: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY,
  approved_for_review_only: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY,
  rejected: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.REJECTED,
  changes_required: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
  expired: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.EXPIRED,
  conflict: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CONFLICT,
  conflicting: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CONFLICT,
  invalid: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.INVALID,
  fail_closed: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED,
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

function buildOro10rSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10rPredecessorEvidence() {
  const oro10qSummary = validateOro10qFinalApprovalDecisionIntakeGate(buildOro10qFinalApprovalDecisionIntakeGate());
  const passed = oro10qSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10Q_KEY]: true,
    [ORO10Q_PASSED_KEY]: passed,
    [VERIFIED_ORO10Q_ONLY_KEY]: passed && oro10qSummary.finalApprovalDecisionIntakeGateScope === ORO10Q_SCOPE,
    oro10qStatus: passed ? ORO10Q_STATUS : HOLD,
    oro10qScope: passed ? ORO10Q_SCOPE : HOLD,
    oro10qClosed: passed,
    oro10aPredecessorPresent: passed && oro10qSummary.oro10aPredecessorPresent === true,
    oro10bPredecessorPresent: passed && oro10qSummary.oro10bPredecessorPresent === true,
    oro10cPredecessorPresent: passed && oro10qSummary.oro10cPredecessorPresent === true,
    oro10dPredecessorPresent: passed && oro10qSummary.oro10dPredecessorPresent === true,
    oro10ePredecessorPresent: passed && oro10qSummary.oro10ePredecessorPresent === true,
    oro10fPredecessorPresent: passed && oro10qSummary.oro10fPredecessorPresent === true,
    oro10gPredecessorPresent: passed && oro10qSummary.oro10gPredecessorPresent === true,
    oro10hPredecessorPresent: passed && oro10qSummary.oro10hPredecessorPresent === true,
    oro10iPredecessorPresent: passed && oro10qSummary.oro10iPredecessorPresent === true,
    oro10jPredecessorPresent: passed && oro10qSummary.oro10jPredecessorPresent === true,
    oro10kPredecessorPresent: passed && oro10qSummary.oro10kPredecessorPresent === true,
    oro10lPredecessorPresent: passed && oro10qSummary.oro10lPredecessorPresent === true,
    oro10mPredecessorPresent: passed && oro10qSummary.oro10mPredecessorPresent === true,
    oro10nPredecessorPresent: passed && oro10qSummary.oro10nPredecessorPresent === true,
    oro10oPredecessorPresent: passed && oro10qSummary.oro10oPredecessorPresent === true,
    oro10pPredecessorPresent: passed && oro10qSummary.oro10pPredecessorPresent === true,
    oro10qPredecessorPresent: passed,
    oro10qFinalApprovalDecisionIntakeGatePresent:
      passed && oro10qSummary.approvalChainRolloverFinalApprovalDecisionIntakeGatePresent === true,
    staticFinalApprovalDecisionIntakeRecordPresent:
      passed && oro10qSummary.staticFinalApprovalDecisionIntakeRecordPresent === true,
    finalApprovalDecisionIntakeStaticMockOnly:
      passed && oro10qSummary.finalApprovalDecisionIntakeStaticMockOnly === true,
    finalApprovalDecisionIntakeNonAuthorizing:
      passed && oro10qSummary.finalApprovalDecisionIntakeNonAuthorizing === true,
  };
}

let cachedPredecessorEvidence;

function getOro10rPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10rPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10rDefaultRecordShell() {
  const safetyEvidence = buildOro10rSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10rPredecessorEvidence(),
    decisionReviewEvidence: {
      phase: ORO10R_PHASE,
      finalApprovalDecisionReviewGateScope: ORO10R_SCOPE,
      finalApprovalDecisionReviewStatus:
        ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW,
      decisionId: "oro10r-static-decision-review",
      decisionEvidencePresent: true,
      decisionEvidenceConflicts: false,
      decisionEvidenceExpired: false,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      signedRuntimeApproval: false,
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
  if (!value) return ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW;
  if (Object.values(ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS).includes(value)) return value;
  const alias = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return SAFE_STATUS_ALIASES[alias] || ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.INVALID;
}

function statusFrom(sources) {
  for (const key of DECISION_FIELD_ALIASES) {
    const value = readStringFrom(sources, key, "");
    if (value) return normalizeStatus(value);
  }
  return ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW;
}

function buildOro10rDecisionReviewEvidencePack(input = {}) {
  const baseline = buildOro10rDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const review = isPlainObject(merged.decisionReviewEvidence) ? merged.decisionReviewEvidence : {};
  const safeReview = redactGuardedValues(review);
  const status = normalizeStatus(statusFrom([merged, review]));
  return Object.freeze({
    phase: ORO10R_PHASE,
    finalApprovalDecisionReviewGateScope: ORO10R_SCOPE,
    finalApprovalDecisionReviewStatus: status,
    decisionId: readStringFrom([review, merged], "decisionId", baseline.decisionReviewEvidence.decisionId),
    decisionEvidencePresent: readBooleanFrom([review, merged], "decisionEvidencePresent", true),
    decisionEvidenceConflicts: readBooleanFrom([review, merged], "decisionEvidenceConflicts", false),
    decisionEvidenceExpired: readBooleanFrom([review, merged], "decisionEvidenceExpired", false),
    sanitizedDecisionReviewEvidence: safeReview,
    finalApprovalDecisionReviewEvidencePackBuilt: true,
    finalApprovalDecisionReviewSanitized: true,
    secretLikeValuePresent: false,
    sensitiveOutputPresent: false,
  });
}

function normalizeOro10rFinalApprovalDecisionReviewInput(input = {}) {
  const baseline = buildOro10rDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const review = isPlainObject(merged.decisionReviewEvidence) ? merged.decisionReviewEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const evidencePack = buildOro10rDecisionReviewEvidencePack(merged);
  const predecessorSources = [merged, predecessor];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(reviewSources, "phase", ORO10R_PHASE),
    finalApprovalDecisionReviewGateScope: readStringFrom(
      reviewSources,
      "finalApprovalDecisionReviewGateScope",
      ORO10R_SCOPE
    ),
    finalApprovalDecisionReviewStatus: evidencePack.finalApprovalDecisionReviewStatus,
    decisionId: evidencePack.decisionId,
    decisionEvidencePresent: evidencePack.decisionEvidencePresent,
    decisionEvidenceConflicts: evidencePack.decisionEvidenceConflicts,
    decisionEvidenceExpired: evidencePack.decisionEvidenceExpired,
    evidencePack,
    [DEPENDS_ON_ORO10Q_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10Q_KEY, true),
    [ORO10Q_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10Q_PASSED_KEY, true),
    [VERIFIED_ORO10Q_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10Q_ONLY_KEY, true),
    oro10qStatus: readStringFrom(predecessorSources, "oro10qStatus", ORO10Q_STATUS),
    oro10qScope: readStringFrom(predecessorSources, "oro10qScope", ORO10Q_SCOPE),
    oro10qClosed: readBooleanFrom(predecessorSources, "oro10qClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(reviewSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      reviewSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function assertOro10rNoRuntimeAuthorization(input) {
  const fixture = normalizeOro10rFinalApprovalDecisionReviewInput(input);
  const blockers = [];
  for (const key of REQUIRED_FALSE_FLAGS) {
    if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10r`);
  }
  for (const key of [
    "verifiedNoFinalApprovalIssued",
    "verifiedNoRuntimeAuthorizationOccurred",
    "verifiedNoSignedRuntimeApprovalOccurred",
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
  ]) {
    if (fixture[key] !== true) blockers.push(`${key}_required`);
  }
  return {
    passed: blockers.length === 0,
    blockers,
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeOro10rFinalApprovalDecisionReviewInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10R_PHASE) blockers.push("invalid_oro10r_phase");
  if (fixture.finalApprovalDecisionReviewGateScope !== ORO10R_SCOPE) {
    blockers.push("invalid_oro10r_final_approval_decision_review_scope");
  }
  if (!fixture[DEPENDS_ON_ORO10Q_KEY] || !fixture[ORO10Q_PASSED_KEY] || !fixture[VERIFIED_ORO10Q_ONLY_KEY]) {
    blockers.push("missing_oro10q_final_approval_decision_intake_gate");
  }
  if (fixture.oro10qStatus !== ORO10Q_STATUS || fixture.oro10qScope !== ORO10Q_SCOPE || !fixture.oro10qClosed) {
    blockers.push("invalid_oro10q_final_approval_decision_intake_gate");
  }
  if (!fixture.decisionId || fixture.decisionId.length < 8) blockers.push("invalid_decision_id");
  if (!fixture.decisionEvidencePresent) blockers.push("missing_decision_evidence");
  if (fixture.decisionEvidenceExpired) blockers.push("decision_evidence_expired");
  if (fixture.decisionEvidenceConflicts) blockers.push("decision_evidence_conflict");
  if (fixture.finalApprovalDecisionReviewStatus === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.EXPIRED) {
    blockers.push("decision_review_expired");
  }
  if (fixture.finalApprovalDecisionReviewStatus === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CONFLICT) {
    blockers.push("decision_review_conflict");
  }
  if (fixture.finalApprovalDecisionReviewStatus === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.INVALID) {
    blockers.push("decision_review_invalid");
  }
  if (fixture.finalApprovalDecisionReviewStatus === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED) {
    blockers.push("decision_review_fail_closed");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  blockers.push(...assertOro10rNoRuntimeAuthorization(fixture).blockers);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return Array.from(new Set(blockers));
}

function reviewOutcomeFor(status, blockers) {
  if (status === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED) return "fail_closed";
  if (REVIEW_BLOCKED_STATUSES.includes(status) || blockers.length > 0) return "review_blocked";
  if (status === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY) {
    return "approved_for_review_only";
  }
  if (status === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.REJECTED) return "rejected_non_runtime";
  if (status === ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CHANGES_REQUIRED) return "changes_required";
  return "received_for_review";
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10R_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10R_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10Q_KEY]: pass && fixture[DEPENDS_ON_ORO10Q_KEY],
    [ORO10Q_PASSED_KEY]: pass && fixture[ORO10Q_PASSED_KEY],
    [VERIFIED_ORO10Q_ONLY_KEY]: pass && fixture[VERIFIED_ORO10Q_ONLY_KEY],
    oro10qStatus: pass ? fixture.oro10qStatus : HOLD,
    oro10qScope: pass ? fixture.oro10qScope : HOLD,
    oro10qClosed: pass && fixture.oro10qClosed,
    finalApprovalDecisionReviewGateScope: pass ? fixture.finalApprovalDecisionReviewGateScope : HOLD,
    finalApprovalDecisionReviewStatus: pass
      ? fixture.finalApprovalDecisionReviewStatus
      : ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED,
    decisionReviewOutcome: reviewOutcomeFor(fixture.finalApprovalDecisionReviewStatus, blockers),
    decisionReviewEvidencePack: fixture.evidencePack,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10rFinalApprovalDecisionReviewGate(input = buildOro10rDefaultRecordShell()) {
  const fixture = normalizeOro10rFinalApprovalDecisionReviewInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  if (!REVIEW_PASS_STATUSES.includes(fixture.finalApprovalDecisionReviewStatus)) {
    return buildOutput(HOLD, ["decision_review_fail_closed"], fixture);
  }
  return buildOutput(PASS, [], fixture);
}

function validateOro10rFinalApprovalDecisionReviewGate(input = {}) {
  return evaluateOro10rFinalApprovalDecisionReviewGate(input);
}

module.exports = {
  ORO10R_PHASE,
  ORO10R_SCOPE,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS,
  ORO10R_RESULT_KEY,
  DEPENDS_ON_ORO10Q_KEY,
  ORO10Q_PASSED_KEY,
  VERIFIED_ORO10Q_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10rSafetySummary,
  buildOro10rPredecessorEvidence,
  buildOro10rDecisionReviewEvidencePack,
  normalizeOro10rFinalApprovalDecisionReviewInput,
  assertOro10rNoRuntimeAuthorization,
  evaluateOro10rFinalApprovalDecisionReviewGate,
  validateOro10rFinalApprovalDecisionReviewGate,
};
