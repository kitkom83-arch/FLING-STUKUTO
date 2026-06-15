"use strict";

const {
  HOLD,
  ORO10P_SCOPE,
  ORO10P_STATUS,
  PASS,
  buildOro10pFinalApprovalRequestSubmissionGate,
  validateOro10pFinalApprovalRequestSubmissionGate,
} = require("./oro10pFinalApprovalRequestSubmissionGate");

const ORO10Q_PHASE = "ORO-10Q";
const ORO10Q_SCOPE = "approval_chain_rollover_final_approval_decision_intake_gate_only";
const ORO10Q_STATUS =
  "approval_chain_rollover_final_approval_decision_intake_gate_intaken_pending_separate_final_approval_validation_for_static_contract_only";
const ORO10Q_RESULT_KEY = "finalApprovalDecisionIntakeGateResult";
const DEPENDS_ON_ORO10P_KEY = "dependsOnOro10pFinalApprovalRequestSubmissionGate";
const ORO10P_PASSED_KEY = "oro10pFinalApprovalRequestSubmissionGatePassed";
const VERIFIED_ORO10P_ONLY_KEY = "verifiedOro10pWasFinalApprovalRequestSubmissionGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10qFinalApprovalDecisionIntakeGateFromOro10pFixture";

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
  "continuationFromOro10pConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "oro10gReviewDecisionValidationGatePresent",
  "oro10hReviewDecisionFinalizationBoundaryPresent",
  "oro10iSignedApprovalRequestBoundaryPresent",
  "oro10jSignedApprovalArtifactIntakeGatePresent",
  "oro10kSignedApprovalArtifactVerificationGatePresent",
  "oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent",
  "oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent",
  "oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent",
  "oro10oApprovalRequestBoundaryPresent",
  "oro10pFinalApprovalRequestSubmissionGatePresent",
  "staticApprovalRequestRecordPresent",
  "staticFinalApprovalRequestSubmissionRecordPresent",
  "approvalChainRolloverFinalApprovalDecisionIntakeGatePresent",
  "staticFinalApprovalDecisionIntakeRecordPresent",
  "finalApprovalDecisionIntakeStaticMockOnly",
  "finalApprovalDecisionIntakeRecorded",
  "finalApprovalDecisionIntakeSanitized",
  "finalApprovalDecisionIntakeNonAuthorizing",
  "finalApprovalDecisionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10qShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalDecisionIntakeOnly",
  "nonAuthorizingDecisionIntakeOnly",
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
  "verifiedShortOro10qFilenamesOnly",
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

const PREDECESSOR_BLOCKERS = Object.freeze([
  ["dependsOnOro10aApprovalChainRolloverBoundary", "oro10aPredecessorPresent", "missing_oro10a_predecessor"],
  ["dependsOnOro10bApprovalChainRolloverContinuityGate", "oro10bPredecessorPresent", "missing_oro10b_predecessor"],
  ["dependsOnOro10cApprovalChainRolloverEvidenceGate", "oro10cPredecessorPresent", "missing_oro10c_predecessor"],
  ["dependsOnOro10dApprovalChainRolloverReviewRequestBoundary", "oro10dPredecessorPresent", "missing_oro10d_predecessor"],
  ["dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate", "oro10ePredecessorPresent", "missing_oro10e_predecessor"],
  ["dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate", "oro10fPredecessorPresent", "missing_oro10f_predecessor"],
  ["dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate", "oro10gPredecessorPresent", "missing_oro10g_predecessor"],
  [null, "oro10hPredecessorPresent", "missing_oro10h_predecessor"],
  [null, "oro10iPredecessorPresent", "missing_oro10i_predecessor"],
  [null, "oro10jPredecessorPresent", "missing_oro10j_predecessor"],
  [null, "oro10kPredecessorPresent", "missing_oro10k_predecessor"],
  [null, "oro10lPredecessorPresent", "missing_oro10l_predecessor"],
  [null, "oro10mPredecessorPresent", "missing_oro10m_predecessor"],
  [null, "oro10nPredecessorPresent", "missing_oro10n_predecessor"],
  [null, "oro10oPredecessorPresent", "missing_oro10o_predecessor"],
  [DEPENDS_ON_ORO10P_KEY, "oro10pPredecessorPresent", "missing_oro10p_predecessor"],
]);

const GATE_BLOCKERS = Object.freeze([
  ["oro10cEvidenceGatePresent", "missing_oro10c_evidence_gate"],
  ["oro10dReviewRequestBoundaryPresent", "missing_oro10d_review_request_boundary"],
  ["oro10eReviewRequestSubmissionGatePresent", "missing_oro10e_review_request_submission_gate"],
  ["oro10fReviewDecisionIntakeGatePresent", "missing_oro10f_review_decision_intake_gate"],
  ["oro10gReviewDecisionValidationGatePresent", "missing_oro10g_review_decision_validation_gate"],
  ["oro10hReviewDecisionFinalizationBoundaryPresent", "missing_oro10h_review_decision_finalization_boundary"],
  ["oro10iSignedApprovalRequestBoundaryPresent", "missing_oro10i_signed_approval_request_boundary"],
  ["oro10jSignedApprovalArtifactIntakeGatePresent", "missing_oro10j_signed_approval_artifact_intake_gate"],
  ["oro10kSignedApprovalArtifactVerificationGatePresent", "missing_oro10k_signed_approval_artifact_verification_gate"],
  [
    "oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent",
    "missing_oro10l_signed_approval_artifact_verification_record_boundary",
  ],
  [
    "oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent",
    "missing_oro10m_signed_approval_artifact_verification_record_review_gate",
  ],
  [
    "oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent",
    "missing_oro10n_review_finalization_boundary",
  ],
  ["oro10oApprovalRequestBoundaryPresent", "missing_oro10o_approval_request_boundary"],
  ["oro10pFinalApprovalRequestSubmissionGatePresent", "missing_oro10p_final_approval_request_submission_gate"],
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

function buildOro10qSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10qPredecessorEvidence() {
  const oro10pSummary = validateOro10pFinalApprovalRequestSubmissionGate(buildOro10pFinalApprovalRequestSubmissionGate());
  const passed = oro10pSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10P_KEY]: true,
    [ORO10P_PASSED_KEY]: passed,
    [VERIFIED_ORO10P_ONLY_KEY]: passed && oro10pSummary.finalApprovalRequestSubmissionGateScope === ORO10P_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10pSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10pSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10pSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10pSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10pSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10pSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10pSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10pSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10pSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10pSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10pSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10pSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10pSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent:
      passed && oro10pSummary.oro10iSignedApprovalRequestBoundaryPresent === true,
    oro10jSignedApprovalArtifactIntakeGatePresent:
      passed && oro10pSummary.oro10jSignedApprovalArtifactIntakeGatePresent === true,
    oro10kSignedApprovalArtifactVerificationGatePresent:
      passed && oro10pSummary.oro10kSignedApprovalArtifactVerificationGatePresent === true,
    oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent:
      passed && oro10pSummary.oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent === true,
    oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent:
      passed && oro10pSummary.oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent === true,
    oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent:
      passed && oro10pSummary.oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent === true,
    oro10oApprovalRequestBoundaryPresent: passed && oro10pSummary.oro10oApprovalRequestBoundaryPresent === true,
    oro10pFinalApprovalRequestSubmissionGatePresent:
      passed && oro10pSummary.approvalChainRolloverFinalApprovalRequestSubmissionGatePresent === true,
    staticApprovalRequestRecordPresent: passed && oro10pSummary.staticApprovalRequestRecordPresent === true,
    staticFinalApprovalRequestSubmissionRecordPresent:
      passed && oro10pSummary.staticFinalApprovalRequestSubmissionRecordPresent === true,
    oro10pStatus: passed ? ORO10P_STATUS : HOLD,
    oro10pScope: passed ? ORO10P_SCOPE : HOLD,
    oro10pClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10qPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10qPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10qDefaultRecordShell() {
  const safetyEvidence = buildOro10qSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10qPredecessorEvidence(),
    finalApprovalDecisionIntakeEvidence: {
      phase: ORO10Q_PHASE,
      finalApprovalDecisionIntakeGateStatus: ORO10Q_STATUS,
      finalApprovalDecisionIntakeGateScope: ORO10Q_SCOPE,
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

function buildOro10qFinalApprovalDecisionIntakeGate(overrides = {}) {
  return deepMerge(buildOro10qDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10qDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const intake = isPlainObject(merged.finalApprovalDecisionIntakeEvidence)
    ? merged.finalApprovalDecisionIntakeEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const intakeSources = [merged, intake];
  const safetySources = [merged, safety, intake, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(intakeSources, "phase", ORO10Q_PHASE),
    finalApprovalDecisionIntakeGateStatus: readStringFrom(
      intakeSources,
      "finalApprovalDecisionIntakeGateStatus",
      ORO10Q_STATUS
    ),
    finalApprovalDecisionIntakeGateScope: readStringFrom(
      intakeSources,
      "finalApprovalDecisionIntakeGateScope",
      ORO10Q_SCOPE
    ),
    [DEPENDS_ON_ORO10P_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10P_KEY, true),
    [ORO10P_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10P_PASSED_KEY, true),
    [VERIFIED_ORO10P_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10P_ONLY_KEY, true),
    oro10pStatus: readStringFrom(predecessorSources, "oro10pStatus", ORO10P_STATUS),
    oro10pScope: readStringFrom(predecessorSources, "oro10pScope", ORO10P_SCOPE),
    oro10pClosed: readBooleanFrom(predecessorSources, "oro10pClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(intakeSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(intakeSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      intakeSources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const [dependencyKey] of PREDECESSOR_BLOCKERS) {
    if (dependencyKey) normalized[dependencyKey] = readBooleanFrom(predecessorSources, dependencyKey, true);
  }
  for (const [key] of GATE_BLOCKERS) normalized[key] = readBooleanFrom(predecessorSources, key, true);
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10Q_PHASE) blockers.push("invalid_oro10q_phase");
  for (const [dependencyKey, presentKey, blocker] of PREDECESSOR_BLOCKERS) {
    if ((dependencyKey && !fixture[dependencyKey]) || !fixture[presentKey]) blockers.push(blocker);
  }
  if (
    !fixture[DEPENDS_ON_ORO10P_KEY] ||
    !fixture[ORO10P_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10P_ONLY_KEY] ||
    !fixture.oro10pClosed ||
    !fixture.oro10pPredecessorPresent
  ) {
    blockers.push("missing_oro10p_predecessor");
  }
  for (const [key, blocker] of GATE_BLOCKERS) if (!fixture[key]) blockers.push(blocker);
  if (!fixture.oro10oApprovalRequestBoundaryPresent || !fixture.staticApprovalRequestRecordPresent) {
    blockers.push("missing_oro10o_approval_request_boundary");
  }
  if (
    !fixture.oro10pFinalApprovalRequestSubmissionGatePresent ||
    !fixture.staticFinalApprovalRequestSubmissionRecordPresent
  ) {
    blockers.push("missing_oro10p_final_approval_request_submission_gate");
  }
  if (
    !fixture.approvalChainRolloverFinalApprovalDecisionIntakeGatePresent ||
    !fixture.staticFinalApprovalDecisionIntakeRecordPresent
  ) {
    blockers.push("missing_static_final_approval_decision_intake_record");
  }
  if (fixture.oro10pStatus !== ORO10P_STATUS) blockers.push("invalid_oro10p_status");
  if (fixture.oro10pScope !== ORO10P_SCOPE) blockers.push("invalid_oro10p_scope");
  if (fixture.finalApprovalDecisionIntakeGateStatus !== ORO10Q_STATUS) {
    blockers.push("invalid_oro10q_final_approval_decision_intake_status");
  }
  if (fixture.finalApprovalDecisionIntakeGateScope !== ORO10Q_SCOPE) {
    blockers.push("invalid_oro10q_final_approval_decision_intake_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10q`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10Q_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10Q_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10P_KEY]: pass && fixture[DEPENDS_ON_ORO10P_KEY],
    [ORO10P_PASSED_KEY]: pass && fixture[ORO10P_PASSED_KEY],
    [VERIFIED_ORO10P_ONLY_KEY]: pass && fixture[VERIFIED_ORO10P_ONLY_KEY],
    oro10pStatus: pass ? fixture.oro10pStatus : HOLD,
    oro10pScope: pass ? fixture.oro10pScope : HOLD,
    oro10pClosed: pass && fixture.oro10pClosed,
    finalApprovalDecisionIntakeGateStatus: pass ? fixture.finalApprovalDecisionIntakeGateStatus : HOLD,
    finalApprovalDecisionIntakeGateScope: pass ? fixture.finalApprovalDecisionIntakeGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const [dependencyKey] of PREDECESSOR_BLOCKERS) {
    if (dependencyKey) output[dependencyKey] = pass && fixture[dependencyKey];
  }
  for (const [key] of GATE_BLOCKERS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10qFinalApprovalDecisionIntakeGate(input = buildOro10qFinalApprovalDecisionIntakeGate()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10qFinalApprovalDecisionIntakeGate(input = {}) {
  return evaluateOro10qFinalApprovalDecisionIntakeGate(input);
}

function buildOro10qFinalApprovalDecisionIntakeGateResult(overrides = {}) {
  return validateOro10qFinalApprovalDecisionIntakeGate(buildOro10qFinalApprovalDecisionIntakeGate(overrides));
}

module.exports = {
  ORO10Q_PHASE,
  ORO10Q_SCOPE,
  ORO10Q_STATUS,
  ORO10Q_RESULT_KEY,
  DEPENDS_ON_ORO10P_KEY,
  ORO10P_PASSED_KEY,
  VERIFIED_ORO10P_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10qSafetySummary,
  buildOro10qPredecessorEvidence,
  buildOro10qFinalApprovalDecisionIntakeGate,
  buildOro10qFinalApprovalDecisionIntakeGateResult,
  evaluateOro10qFinalApprovalDecisionIntakeGate,
  validateOro10qFinalApprovalDecisionIntakeGate,
};
