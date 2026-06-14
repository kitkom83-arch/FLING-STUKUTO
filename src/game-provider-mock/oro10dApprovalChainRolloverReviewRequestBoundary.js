"use strict";

const {
  HOLD,
  ORO10C_SCOPE,
  ORO10C_STATUS,
  PASS,
  buildOro10cEvidenceGateRecord,
  validateOro10cEvidenceGate,
} = require("./oro10cApprovalChainRolloverEvidenceGate");

const ORO10D_PHASE = "ORO-10D";
const ORO10D_SCOPE = "approval_chain_rollover_review_request_boundary_only";
const ORO10D_STATUS =
  "approval_chain_rollover_review_request_submitted_pending_review_decision_for_static_contract_only";
const ORO10D_REVIEW_DECISION_STATUS = "pending_separate_review_decision";
const ORO10D_RESULT_KEY = "approvalChainRolloverReviewRequestBoundaryResult";
const DEPENDS_ON_ORO10C_KEY = "dependsOnOro10cApprovalChainRolloverEvidenceGate";
const ORO10C_PASSED_KEY = "oro10cApprovalChainRolloverEvidenceGatePassed";
const VERIFIED_ORO10C_ONLY_KEY = "verifiedOro10cWasEvidenceGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateReviewDecisionRequired";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "continuationFromOro10cConfirmed",
  "approvalChainRolloverReviewRequestBoundaryPresent",
  "reviewRequestPrepared",
  "reviewRequestSubmitted",
  "reviewRequestRecorded",
  "reviewRequestSanitized",
  "humanReviewRequired",
  "separateReviewDecisionRequired",
  "oro10dShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "verifiedNoReviewDecisionOccurred",
  "verifiedNoSignedApprovalOccurred",
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
  "verifiedNoPublicCallbackAliasOccurred",
  "verifiedNoLiveExecutionOccurred",
  "verifiedNoActualExternalCallOccurred",
  "verifiedNoExternalNetworkOccurred",
  "verifiedNoLiveOroPlayApiCallOccurred",
  "verifiedNoWalletMutationOccurred",
  "verifiedNoLedgerMutationOccurred",
  "verifiedNoDbRuntimeFlowOccurred",
  "verifiedNoPrismaWriteOccurred",
  "verifiedNoDbTransactionOccurred",
  "verifiedNoMigrationOccurred",
  "verifiedNoDeployOccurred",
  "verifiedNoSecretLikeValuePresent",
  "verifiedShortOro10dFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "reviewDecision",
  "reviewDecisionIssued",
  "reviewDecisionApproved",
  "signedApproval",
  "signedRuntimeApproval",
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
  "liveOroPlayApiCalled",
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

function buildOro10dSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10dPredecessorEvidence() {
  const oro10cSummary = validateOro10cEvidenceGate(buildOro10cEvidenceGateRecord());
  const passed = oro10cSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10C_KEY]: true,
    [ORO10C_PASSED_KEY]: passed,
    [VERIFIED_ORO10C_ONLY_KEY]: passed && oro10cSummary.evidenceGateScope === ORO10C_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10cSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10cSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    oro10cStatus: passed ? ORO10C_STATUS : HOLD,
    oro10cScope: passed ? ORO10C_SCOPE : HOLD,
    oro10cClosed: passed,
  };
}

function buildOro10dReviewRequestBoundaryRecord(overrides = {}) {
  const safetyEvidence = buildOro10dSafetySummary();
  const reviewRequestEvidence = {
    phase: ORO10D_PHASE,
    reviewRequestStatus: ORO10D_STATUS,
    reviewRequestScope: ORO10D_SCOPE,
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateReviewDecision: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const reviewDecisionEvidence = {
    reviewDecisionStatus: ORO10D_REVIEW_DECISION_STATUS,
    reviewDecisionIssued: false,
  };
  const baseline = {
    id: "validOro10dReviewRequestBoundaryFromOro10cFixture",
    predecessorEvidence: buildOro10dPredecessorEvidence(),
    reviewRequestEvidence,
    reviewDecisionEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10dReviewRequestBoundaryRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const request = isPlainObject(merged.reviewRequestEvidence) ? merged.reviewRequestEvidence : {};
  const decision = isPlainObject(merged.reviewDecisionEvidence) ? merged.reviewDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const requestSources = [merged, request];
  const decisionSources = [merged, decision, request, safety];
  const safetySources = [merged, safety, request, decision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(requestSources, "phase", ORO10D_PHASE),
    reviewRequestStatus: readStringFrom(requestSources, "reviewRequestStatus", ORO10D_STATUS),
    reviewRequestScope: readStringFrom(requestSources, "reviewRequestScope", ORO10D_SCOPE),
    reviewDecisionStatus: readStringFrom(decisionSources, "reviewDecisionStatus", ORO10D_REVIEW_DECISION_STATUS),
    [DEPENDS_ON_ORO10C_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10C_KEY, true),
    [ORO10C_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10C_PASSED_KEY, true),
    [VERIFIED_ORO10C_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10C_ONLY_KEY, true),
    dependsOnOro10aApprovalChainRolloverBoundary: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10aApprovalChainRolloverBoundary",
      true
    ),
    dependsOnOro10bApprovalChainRolloverContinuityGate: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10bApprovalChainRolloverContinuityGate",
      true
    ),
    oro10cStatus: readStringFrom(predecessorSources, "oro10cStatus", ORO10C_STATUS),
    oro10cScope: readStringFrom(predecessorSources, "oro10cScope", ORO10C_SCOPE),
    oro10cClosed: readBooleanFrom(predecessorSources, "oro10cClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(requestSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateReviewDecision: readBooleanFrom(
      requestSources,
      "nextStepRequiresSeparateReviewDecision",
      true
    ),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      requestSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10D_PHASE) blockers.push("invalid_oro10d_phase");
  if (
    !fixture[DEPENDS_ON_ORO10C_KEY] ||
    !fixture[ORO10C_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10C_ONLY_KEY] ||
    !fixture.oro10cClosed ||
    !fixture.oro10cPredecessorPresent
  ) {
    blockers.push("missing_oro10c_predecessor");
  }
  if (!fixture.dependsOnOro10aApprovalChainRolloverBoundary || !fixture.oro10aPredecessorPresent) {
    blockers.push("missing_oro10a_predecessor");
  }
  if (!fixture.dependsOnOro10bApprovalChainRolloverContinuityGate || !fixture.oro10bPredecessorPresent) {
    blockers.push("missing_oro10b_predecessor");
  }
  if (fixture.oro10cStatus !== ORO10C_STATUS) blockers.push("invalid_oro10c_status");
  if (fixture.oro10cScope !== ORO10C_SCOPE) blockers.push("invalid_oro10c_scope");
  if (fixture.reviewRequestStatus !== ORO10D_STATUS) blockers.push("invalid_oro10d_review_request_status");
  if (fixture.reviewRequestScope !== ORO10D_SCOPE) blockers.push("invalid_oro10d_review_request_scope");
  if (fixture.reviewDecisionStatus !== ORO10D_REVIEW_DECISION_STATUS) {
    blockers.push("review_decision_status_must_remain_pending");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10d`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_review_decision_required");
  if (!fixture.nextStepRequiresSeparateReviewDecision) blockers.push("next_step_requires_separate_review_decision");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10D_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10D_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10C_KEY]: pass && fixture[DEPENDS_ON_ORO10C_KEY],
    [ORO10C_PASSED_KEY]: pass && fixture[ORO10C_PASSED_KEY],
    [VERIFIED_ORO10C_ONLY_KEY]: pass && fixture[VERIFIED_ORO10C_ONLY_KEY],
    dependsOnOro10aApprovalChainRolloverBoundary:
      pass && fixture.dependsOnOro10aApprovalChainRolloverBoundary,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      pass && fixture.dependsOnOro10bApprovalChainRolloverContinuityGate,
    oro10cStatus: pass ? fixture.oro10cStatus : HOLD,
    oro10cScope: pass ? fixture.oro10cScope : HOLD,
    oro10cClosed: pass && fixture.oro10cClosed,
    reviewRequestStatus: pass ? fixture.reviewRequestStatus : HOLD,
    reviewRequestScope: pass ? fixture.reviewRequestScope : HOLD,
    reviewDecisionStatus: ORO10D_REVIEW_DECISION_STATUS,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateReviewDecision: pass && fixture.nextStepRequiresSeparateReviewDecision,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10dReviewRequestBoundary(input = buildOro10dReviewRequestBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10dReviewRequestBoundary(input = {}) {
  return evaluateOro10dReviewRequestBoundary(input);
}

function buildOro10dReviewRequestBoundaryRecordResult(overrides = {}) {
  return validateOro10dReviewRequestBoundary(buildOro10dReviewRequestBoundaryRecord(overrides));
}

module.exports = {
  ORO10D_PHASE,
  ORO10D_SCOPE,
  ORO10D_STATUS,
  ORO10D_REVIEW_DECISION_STATUS,
  ORO10D_RESULT_KEY,
  DEPENDS_ON_ORO10C_KEY,
  ORO10C_PASSED_KEY,
  VERIFIED_ORO10C_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10dSafetySummary,
  buildOro10dPredecessorEvidence,
  buildOro10dReviewRequestBoundaryRecord,
  buildOro10dReviewRequestBoundaryRecordResult,
  evaluateOro10dReviewRequestBoundary,
  validateOro10dReviewRequestBoundary,
};
