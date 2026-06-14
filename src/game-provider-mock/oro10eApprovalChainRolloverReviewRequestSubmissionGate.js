"use strict";

const {
  HOLD,
  ORO10D_REVIEW_DECISION_STATUS,
  ORO10D_SCOPE,
  ORO10D_STATUS,
  PASS,
  buildOro10dReviewRequestBoundaryRecord,
  validateOro10dReviewRequestBoundary,
} = require("./oro10dApprovalChainRolloverReviewRequestBoundary");

const ORO10E_PHASE = "ORO-10E";
const ORO10E_SCOPE = "approval_chain_rollover_review_request_submission_gate_only";
const ORO10E_STATUS =
  "approval_chain_rollover_review_request_submission_recorded_pending_separate_approval_for_static_contract_only";
const ORO10E_RESULT_KEY = "approvalChainRolloverReviewRequestSubmissionGateResult";
const DEPENDS_ON_ORO10D_KEY = "dependsOnOro10dApprovalChainRolloverReviewRequestBoundary";
const ORO10D_PASSED_KEY = "oro10dApprovalChainRolloverReviewRequestBoundaryPassed";
const VERIFIED_ORO10D_ONLY_KEY = "verifiedOro10dWasReviewRequestBoundaryOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "continuationFromOro10dConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "approvalChainRolloverReviewRequestSubmissionGatePresent",
  "reviewRequestPreparedOnlyInOro10d",
  "reviewRequestSubmittedAsStaticMockRecordOnlyInOro10e",
  "reviewRequestSubmissionRecorded",
  "reviewRequestSubmissionSanitized",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10eShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockReviewRequestSubmissionOnly",
  "verifiedNoRuntimeReviewSubmissionOccurred",
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
  "verifiedShortOro10eFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewRequestSubmission",
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

function buildOro10eSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10ePredecessorEvidence() {
  const oro10dSummary = validateOro10dReviewRequestBoundary(buildOro10dReviewRequestBoundaryRecord());
  const passed = oro10dSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10D_KEY]: true,
    [ORO10D_PASSED_KEY]: passed,
    [VERIFIED_ORO10D_ONLY_KEY]: passed && oro10dSummary.reviewRequestScope === ORO10D_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10dSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10dSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10dSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    oro10cEvidenceGatePresent: passed && oro10dSummary.oro10cPredecessorPresent === true,
    oro10dStatus: passed ? ORO10D_STATUS : HOLD,
    oro10dScope: passed ? ORO10D_SCOPE : HOLD,
    oro10dClosed: passed,
  };
}

function buildOro10eReviewRequestSubmissionGateRecord(overrides = {}) {
  const safetyEvidence = buildOro10eSafetySummary();
  const reviewSubmissionEvidence = {
    phase: ORO10E_PHASE,
    reviewRequestSubmissionGateStatus: ORO10E_STATUS,
    reviewRequestSubmissionGateScope: ORO10E_SCOPE,
    reviewDecisionStatus: ORO10D_REVIEW_DECISION_STATUS,
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateReviewDecision: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const reviewDecisionEvidence = {
    reviewDecisionStatus: ORO10D_REVIEW_DECISION_STATUS,
    reviewDecisionIssued: false,
  };
  const baseline = {
    id: "validOro10eReviewRequestSubmissionGateFromOro10dFixture",
    predecessorEvidence: buildOro10ePredecessorEvidence(),
    reviewSubmissionEvidence,
    reviewDecisionEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10eReviewRequestSubmissionGateRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const submission = isPlainObject(merged.reviewSubmissionEvidence) ? merged.reviewSubmissionEvidence : {};
  const decision = isPlainObject(merged.reviewDecisionEvidence) ? merged.reviewDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const submissionSources = [merged, submission];
  const decisionSources = [merged, decision, submission, safety];
  const safetySources = [merged, safety, submission, decision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(submissionSources, "phase", ORO10E_PHASE),
    reviewRequestSubmissionGateStatus: readStringFrom(
      submissionSources,
      "reviewRequestSubmissionGateStatus",
      ORO10E_STATUS
    ),
    reviewRequestSubmissionGateScope: readStringFrom(
      submissionSources,
      "reviewRequestSubmissionGateScope",
      ORO10E_SCOPE
    ),
    reviewDecisionStatus: readStringFrom(decisionSources, "reviewDecisionStatus", ORO10D_REVIEW_DECISION_STATUS),
    [DEPENDS_ON_ORO10D_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10D_KEY, true),
    [ORO10D_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10D_PASSED_KEY, true),
    [VERIFIED_ORO10D_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10D_ONLY_KEY, true),
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
    dependsOnOro10cApprovalChainRolloverEvidenceGate: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10cApprovalChainRolloverEvidenceGate",
      true
    ),
    oro10cEvidenceGatePresent: readBooleanFrom(predecessorSources, "oro10cEvidenceGatePresent", true),
    oro10dStatus: readStringFrom(predecessorSources, "oro10dStatus", ORO10D_STATUS),
    oro10dScope: readStringFrom(predecessorSources, "oro10dScope", ORO10D_SCOPE),
    oro10dClosed: readBooleanFrom(predecessorSources, "oro10dClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(submissionSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(
      submissionSources,
      "nextStepRequiresSeparateApproval",
      true
    ),
    nextStepRequiresSeparateReviewDecision: readBooleanFrom(
      submissionSources,
      "nextStepRequiresSeparateReviewDecision",
      true
    ),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      submissionSources,
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
  if (fixture.phase !== ORO10E_PHASE) blockers.push("invalid_oro10e_phase");
  if (!fixture.dependsOnOro10aApprovalChainRolloverBoundary || !fixture.oro10aPredecessorPresent) {
    blockers.push("missing_oro10a_predecessor");
  }
  if (!fixture.dependsOnOro10bApprovalChainRolloverContinuityGate || !fixture.oro10bPredecessorPresent) {
    blockers.push("missing_oro10b_predecessor");
  }
  if (!fixture.dependsOnOro10cApprovalChainRolloverEvidenceGate || !fixture.oro10cPredecessorPresent) {
    blockers.push("missing_oro10c_predecessor");
  }
  if (
    !fixture[DEPENDS_ON_ORO10D_KEY] ||
    !fixture[ORO10D_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10D_ONLY_KEY] ||
    !fixture.oro10dClosed ||
    !fixture.oro10dPredecessorPresent
  ) {
    blockers.push("missing_oro10d_predecessor");
  }
  if (!fixture.oro10cEvidenceGatePresent) blockers.push("missing_oro10c_evidence_gate");
  if (!fixture.oro10dReviewRequestBoundaryPresent) blockers.push("missing_oro10d_review_request_boundary");
  if (fixture.oro10dStatus !== ORO10D_STATUS) blockers.push("invalid_oro10d_status");
  if (fixture.oro10dScope !== ORO10D_SCOPE) blockers.push("invalid_oro10d_scope");
  if (fixture.reviewRequestSubmissionGateStatus !== ORO10E_STATUS) {
    blockers.push("invalid_oro10e_review_request_submission_status");
  }
  if (fixture.reviewRequestSubmissionGateScope !== ORO10E_SCOPE) {
    blockers.push("invalid_oro10e_review_request_submission_scope");
  }
  if (fixture.reviewDecisionStatus !== ORO10D_REVIEW_DECISION_STATUS) {
    blockers.push("review_decision_status_must_remain_pending");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10e`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateReviewDecision) blockers.push("next_step_requires_separate_review_decision");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10E_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10E_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10D_KEY]: pass && fixture[DEPENDS_ON_ORO10D_KEY],
    [ORO10D_PASSED_KEY]: pass && fixture[ORO10D_PASSED_KEY],
    [VERIFIED_ORO10D_ONLY_KEY]: pass && fixture[VERIFIED_ORO10D_ONLY_KEY],
    dependsOnOro10aApprovalChainRolloverBoundary:
      pass && fixture.dependsOnOro10aApprovalChainRolloverBoundary,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      pass && fixture.dependsOnOro10bApprovalChainRolloverContinuityGate,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      pass && fixture.dependsOnOro10cApprovalChainRolloverEvidenceGate,
    oro10cEvidenceGatePresent: pass && fixture.oro10cEvidenceGatePresent,
    oro10dStatus: pass ? fixture.oro10dStatus : HOLD,
    oro10dScope: pass ? fixture.oro10dScope : HOLD,
    oro10dClosed: pass && fixture.oro10dClosed,
    reviewRequestSubmissionGateStatus: pass ? fixture.reviewRequestSubmissionGateStatus : HOLD,
    reviewRequestSubmissionGateScope: pass ? fixture.reviewRequestSubmissionGateScope : HOLD,
    reviewDecisionStatus: ORO10D_REVIEW_DECISION_STATUS,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateReviewDecision: pass && fixture.nextStepRequiresSeparateReviewDecision,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10eReviewRequestSubmissionGate(input = buildOro10eReviewRequestSubmissionGateRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10eReviewRequestSubmissionGate(input = {}) {
  return evaluateOro10eReviewRequestSubmissionGate(input);
}

function buildOro10eReviewRequestSubmissionGateRecordResult(overrides = {}) {
  return validateOro10eReviewRequestSubmissionGate(buildOro10eReviewRequestSubmissionGateRecord(overrides));
}

module.exports = {
  ORO10E_PHASE,
  ORO10E_SCOPE,
  ORO10E_STATUS,
  ORO10E_RESULT_KEY,
  DEPENDS_ON_ORO10D_KEY,
  ORO10D_PASSED_KEY,
  VERIFIED_ORO10D_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10eSafetySummary,
  buildOro10ePredecessorEvidence,
  buildOro10eReviewRequestSubmissionGateRecord,
  buildOro10eReviewRequestSubmissionGateRecordResult,
  evaluateOro10eReviewRequestSubmissionGate,
  validateOro10eReviewRequestSubmissionGate,
};
