"use strict";

const {
  HOLD,
  ORO10E_SCOPE,
  ORO10E_STATUS,
  PASS,
  buildOro10eReviewRequestSubmissionGateRecord,
  validateOro10eReviewRequestSubmissionGate,
} = require("./oro10eApprovalChainRolloverReviewRequestSubmissionGate");

const ORO10F_PHASE = "ORO-10F";
const ORO10F_SCOPE = "approval_chain_rollover_review_decision_intake_gate_only";
const ORO10F_STATUS =
  "approval_chain_rollover_review_decision_intake_recorded_pending_separate_approval_for_static_contract_only";
const ORO10F_RESULT_KEY = "approvalChainRolloverReviewDecisionIntakeGateResult";
const DEPENDS_ON_ORO10E_KEY = "dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate";
const ORO10E_PASSED_KEY = "oro10eApprovalChainRolloverReviewRequestSubmissionGatePassed";
const VERIFIED_ORO10E_ONLY_KEY = "verifiedOro10eWasReviewRequestSubmissionGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "oro10ePredecessorPresent",
  "continuationFromOro10eConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "approvalChainRolloverReviewDecisionIntakeGatePresent",
  "staticReviewDecisionIntakeRecordPresent",
  "reviewDecisionIntakeStaticMockOnly",
  "reviewDecisionIntakeRecorded",
  "reviewDecisionIntakeSanitized",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10fShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockReviewDecisionIntakeOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
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
  "verifiedShortOro10fFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "runtimeAuthorization",
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

function buildOro10fSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10fPredecessorEvidence() {
  const oro10eSummary = validateOro10eReviewRequestSubmissionGate(buildOro10eReviewRequestSubmissionGateRecord());
  const passed = oro10eSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10E_KEY]: true,
    [ORO10E_PASSED_KEY]: passed,
    [VERIFIED_ORO10E_ONLY_KEY]: passed && oro10eSummary.reviewRequestSubmissionGateScope === ORO10E_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10eSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10eSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10eSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10eSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    oro10cEvidenceGatePresent: passed && oro10eSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10eSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eStatus: passed ? ORO10E_STATUS : HOLD,
    oro10eScope: passed ? ORO10E_SCOPE : HOLD,
    oro10eClosed: passed,
  };
}

function buildOro10fReviewDecisionIntakeGateRecord(overrides = {}) {
  const safetyEvidence = buildOro10fSafetySummary();
  const reviewDecisionIntakeEvidence = {
    phase: ORO10F_PHASE,
    reviewDecisionIntakeGateStatus: ORO10F_STATUS,
    reviewDecisionIntakeGateScope: ORO10F_SCOPE,
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateApproval: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const runtimeDecisionEvidence = {
    runtimeReviewDecision: false,
    decisionAuthorizesRuntime: false,
    "runtimeAuthorization": false,
  };
  const baseline = {
    id: "validOro10fReviewDecisionIntakeGateFromOro10eFixture",
    predecessorEvidence: buildOro10fPredecessorEvidence(),
    reviewDecisionIntakeEvidence,
    runtimeDecisionEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10fReviewDecisionIntakeGateRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const intake = isPlainObject(merged.reviewDecisionIntakeEvidence) ? merged.reviewDecisionIntakeEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const intakeSources = [merged, intake];
  const safetySources = [merged, safety, intake, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(intakeSources, "phase", ORO10F_PHASE),
    reviewDecisionIntakeGateStatus: readStringFrom(
      intakeSources,
      "reviewDecisionIntakeGateStatus",
      ORO10F_STATUS
    ),
    reviewDecisionIntakeGateScope: readStringFrom(
      intakeSources,
      "reviewDecisionIntakeGateScope",
      ORO10F_SCOPE
    ),
    [DEPENDS_ON_ORO10E_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10E_KEY, true),
    [ORO10E_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10E_PASSED_KEY, true),
    [VERIFIED_ORO10E_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10E_ONLY_KEY, true),
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
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10dApprovalChainRolloverReviewRequestBoundary",
      true
    ),
    oro10cEvidenceGatePresent: readBooleanFrom(predecessorSources, "oro10cEvidenceGatePresent", true),
    oro10dReviewRequestBoundaryPresent: readBooleanFrom(
      predecessorSources,
      "oro10dReviewRequestBoundaryPresent",
      true
    ),
    oro10eStatus: readStringFrom(predecessorSources, "oro10eStatus", ORO10E_STATUS),
    oro10eScope: readStringFrom(predecessorSources, "oro10eScope", ORO10E_SCOPE),
    oro10eClosed: readBooleanFrom(predecessorSources, "oro10eClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(intakeSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(
      intakeSources,
      "nextStepRequiresSeparateApproval",
      true
    ),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      intakeSources,
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
  if (fixture.phase !== ORO10F_PHASE) blockers.push("invalid_oro10f_phase");
  if (!fixture.dependsOnOro10aApprovalChainRolloverBoundary || !fixture.oro10aPredecessorPresent) {
    blockers.push("missing_oro10a_predecessor");
  }
  if (!fixture.dependsOnOro10bApprovalChainRolloverContinuityGate || !fixture.oro10bPredecessorPresent) {
    blockers.push("missing_oro10b_predecessor");
  }
  if (!fixture.dependsOnOro10cApprovalChainRolloverEvidenceGate || !fixture.oro10cPredecessorPresent) {
    blockers.push("missing_oro10c_predecessor");
  }
  if (!fixture.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary || !fixture.oro10dPredecessorPresent) {
    blockers.push("missing_oro10d_predecessor");
  }
  if (
    !fixture[DEPENDS_ON_ORO10E_KEY] ||
    !fixture[ORO10E_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10E_ONLY_KEY] ||
    !fixture.oro10eClosed ||
    !fixture.oro10ePredecessorPresent
  ) {
    blockers.push("missing_oro10e_predecessor");
  }
  if (!fixture.oro10cEvidenceGatePresent) blockers.push("missing_oro10c_evidence_gate");
  if (!fixture.oro10dReviewRequestBoundaryPresent) blockers.push("missing_oro10d_review_request_boundary");
  if (!fixture.oro10eReviewRequestSubmissionGatePresent) {
    blockers.push("missing_oro10e_review_request_submission_gate");
  }
  if (!fixture.staticReviewDecisionIntakeRecordPresent) blockers.push("missing_static_review_decision_intake_record");
  if (fixture.oro10eStatus !== ORO10E_STATUS) blockers.push("invalid_oro10e_status");
  if (fixture.oro10eScope !== ORO10E_SCOPE) blockers.push("invalid_oro10e_scope");
  if (fixture.reviewDecisionIntakeGateStatus !== ORO10F_STATUS) {
    blockers.push("invalid_oro10f_review_decision_intake_status");
  }
  if (fixture.reviewDecisionIntakeGateScope !== ORO10F_SCOPE) {
    blockers.push("invalid_oro10f_review_decision_intake_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10f`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10F_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10F_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10E_KEY]: pass && fixture[DEPENDS_ON_ORO10E_KEY],
    [ORO10E_PASSED_KEY]: pass && fixture[ORO10E_PASSED_KEY],
    [VERIFIED_ORO10E_ONLY_KEY]: pass && fixture[VERIFIED_ORO10E_ONLY_KEY],
    dependsOnOro10aApprovalChainRolloverBoundary:
      pass && fixture.dependsOnOro10aApprovalChainRolloverBoundary,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      pass && fixture.dependsOnOro10bApprovalChainRolloverContinuityGate,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      pass && fixture.dependsOnOro10cApprovalChainRolloverEvidenceGate,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      pass && fixture.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary,
    oro10cEvidenceGatePresent: pass && fixture.oro10cEvidenceGatePresent,
    oro10dReviewRequestBoundaryPresent: pass && fixture.oro10dReviewRequestBoundaryPresent,
    oro10eStatus: pass ? fixture.oro10eStatus : HOLD,
    oro10eScope: pass ? fixture.oro10eScope : HOLD,
    oro10eClosed: pass && fixture.oro10eClosed,
    reviewDecisionIntakeGateStatus: pass ? fixture.reviewDecisionIntakeGateStatus : HOLD,
    reviewDecisionIntakeGateScope: pass ? fixture.reviewDecisionIntakeGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10fReviewDecisionIntakeGate(input = buildOro10fReviewDecisionIntakeGateRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10fReviewDecisionIntakeGate(input = {}) {
  return evaluateOro10fReviewDecisionIntakeGate(input);
}

function buildOro10fReviewDecisionIntakeGateRecordResult(overrides = {}) {
  return validateOro10fReviewDecisionIntakeGate(buildOro10fReviewDecisionIntakeGateRecord(overrides));
}

module.exports = {
  ORO10F_PHASE,
  ORO10F_SCOPE,
  ORO10F_STATUS,
  ORO10F_RESULT_KEY,
  DEPENDS_ON_ORO10E_KEY,
  ORO10E_PASSED_KEY,
  VERIFIED_ORO10E_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10fSafetySummary,
  buildOro10fPredecessorEvidence,
  buildOro10fReviewDecisionIntakeGateRecord,
  buildOro10fReviewDecisionIntakeGateRecordResult,
  evaluateOro10fReviewDecisionIntakeGate,
  validateOro10fReviewDecisionIntakeGate,
};
