"use strict";

const {
  HOLD,
  ORO10O_SCOPE,
  ORO10O_STATUS,
  PASS,
  buildOro10oReviewFinalizationApprovalRequestBoundary,
  validateOro10oReviewFinalizationApprovalRequestBoundary,
} = require("./oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary");

const ORO10P_PHASE = "ORO-10P";
const ORO10P_SCOPE = "approval_chain_rollover_final_approval_request_submission_gate_only";
const ORO10P_STATUS =
  "approval_chain_rollover_final_approval_request_submission_gate_submitted_pending_separate_final_approval_for_static_contract_only";
const ORO10P_RESULT_KEY = "finalApprovalRequestSubmissionGateResult";
const DEPENDS_ON_ORO10O_KEY =
  "dependsOnOro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary";
const ORO10O_PASSED_KEY =
  "oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPassed";
const VERIFIED_ORO10O_ONLY_KEY =
  "verifiedOro10oWasApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10pFinalApprovalRequestSubmissionGateFromOro10oFixture";

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
  "continuationFromOro10oConfirmed",
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
  "staticApprovalRequestRecordPresent",
  "approvalChainRolloverFinalApprovalRequestSubmissionGatePresent",
  "staticFinalApprovalRequestSubmissionRecordPresent",
  "finalApprovalRequestSubmissionStaticMockOnly",
  "finalApprovalRequestSubmissionRecorded",
  "finalApprovalRequestSubmissionSanitized",
  "finalApprovalRequestSubmissionNonAuthorizing",
  "approvalRequestSubmissionRuntimeAuthorizationNotIssued",
  "finalApprovalNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10pShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockFinalApprovalRequestSubmissionOnly",
  "nonAuthorizingSubmissionOnly",
  "verifiedNoRuntimeApprovalRequestSubmissionOccurred",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoApprovalRequestSubmissionAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedApprovalArtifactAccepted",
  "verifiedNoSignedApprovalArtifactVerified",
  "verifiedNoActualSignedApprovalArtifactVerificationOccurred",
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
  "verifiedShortOro10pFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeApprovalRequestSubmission",
  "finalApprovalIssued",
  "signedRuntimeApproval",
  "signedApprovalArtifactAccepted",
  "signedApprovalArtifactVerified",
  "actualSignedApprovalVerification",
  "approvalRequestSubmissionAuthorizesRuntime",
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

function buildOro10pSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10pPredecessorEvidence() {
  const oro10oSummary = validateOro10oReviewFinalizationApprovalRequestBoundary(
    buildOro10oReviewFinalizationApprovalRequestBoundary()
  );
  const passed = oro10oSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10O_KEY]: true,
    [ORO10O_PASSED_KEY]: passed,
    [VERIFIED_ORO10O_ONLY_KEY]: passed && oro10oSummary.approvalRequestBoundaryScope === ORO10O_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10oSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10oSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10oSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10oSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10oSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10oSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10oSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10oSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10oSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10oSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10oSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10oSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10oSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent:
      passed && oro10oSummary.oro10iSignedApprovalRequestBoundaryPresent === true,
    oro10jSignedApprovalArtifactIntakeGatePresent:
      passed && oro10oSummary.oro10jSignedApprovalArtifactIntakeGatePresent === true,
    oro10kSignedApprovalArtifactVerificationGatePresent:
      passed && oro10oSummary.oro10kSignedApprovalArtifactVerificationGatePresent === true,
    oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent:
      passed && oro10oSummary.oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent === true,
    oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent:
      passed && oro10oSummary.oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent === true,
    oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent:
      passed && oro10oSummary.oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent === true,
    oro10oApprovalRequestBoundaryPresent:
      passed &&
      oro10oSummary.approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPresent ===
        true,
    staticApprovalRequestRecordPresent: passed && oro10oSummary.staticApprovalRequestRecordPresent === true,
    oro10oStatus: passed ? ORO10O_STATUS : HOLD,
    oro10oScope: passed ? ORO10O_SCOPE : HOLD,
    oro10oClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10pPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10pPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10pDefaultRecordShell() {
  const safetyEvidence = buildOro10pSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10pPredecessorEvidence(),
    finalApprovalRequestSubmissionEvidence: {
      phase: ORO10P_PHASE,
      finalApprovalRequestSubmissionGateStatus: ORO10P_STATUS,
      finalApprovalRequestSubmissionGateScope: ORO10P_SCOPE,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      runtimeApprovalRequestSubmission: false,
      finalApprovalIssued: false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      actualSignedApprovalVerification: false,
      approvalRequestSubmissionAuthorizesRuntime: false,
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

function buildOro10pFinalApprovalRequestSubmissionGate(overrides = {}) {
  return deepMerge(buildOro10pDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10pDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const submission = isPlainObject(merged.finalApprovalRequestSubmissionEvidence)
    ? merged.finalApprovalRequestSubmissionEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const submissionSources = [merged, submission];
  const safetySources = [merged, safety, submission, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(submissionSources, "phase", ORO10P_PHASE),
    finalApprovalRequestSubmissionGateStatus: readStringFrom(
      submissionSources,
      "finalApprovalRequestSubmissionGateStatus",
      ORO10P_STATUS
    ),
    finalApprovalRequestSubmissionGateScope: readStringFrom(
      submissionSources,
      "finalApprovalRequestSubmissionGateScope",
      ORO10P_SCOPE
    ),
    [DEPENDS_ON_ORO10O_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10O_KEY, true),
    [ORO10O_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10O_PASSED_KEY, true),
    [VERIFIED_ORO10O_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10O_ONLY_KEY, true),
    oro10oStatus: readStringFrom(predecessorSources, "oro10oStatus", ORO10O_STATUS),
    oro10oScope: readStringFrom(predecessorSources, "oro10oScope", ORO10O_SCOPE),
    oro10oClosed: readBooleanFrom(predecessorSources, "oro10oClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(submissionSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(submissionSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      submissionSources,
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
  if (fixture.phase !== ORO10P_PHASE) blockers.push("invalid_oro10p_phase");
  for (const [dependencyKey, presentKey, blocker] of PREDECESSOR_BLOCKERS) {
    if ((dependencyKey && !fixture[dependencyKey]) || !fixture[presentKey]) blockers.push(blocker);
  }
  if (
    !fixture[DEPENDS_ON_ORO10O_KEY] ||
    !fixture[ORO10O_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10O_ONLY_KEY] ||
    !fixture.oro10oClosed ||
    !fixture.oro10oPredecessorPresent
  ) {
    blockers.push("missing_oro10o_predecessor");
  }
  for (const [key, blocker] of GATE_BLOCKERS) if (!fixture[key]) blockers.push(blocker);
  if (!fixture.oro10oApprovalRequestBoundaryPresent || !fixture.staticApprovalRequestRecordPresent) {
    blockers.push("missing_oro10o_approval_request_boundary");
  }
  if (
    !fixture.approvalChainRolloverFinalApprovalRequestSubmissionGatePresent ||
    !fixture.staticFinalApprovalRequestSubmissionRecordPresent
  ) {
    blockers.push("missing_static_final_approval_request_submission_record");
  }
  if (fixture.oro10oStatus !== ORO10O_STATUS) blockers.push("invalid_oro10o_status");
  if (fixture.oro10oScope !== ORO10O_SCOPE) blockers.push("invalid_oro10o_scope");
  if (fixture.finalApprovalRequestSubmissionGateStatus !== ORO10P_STATUS) {
    blockers.push("invalid_oro10p_final_approval_request_submission_status");
  }
  if (fixture.finalApprovalRequestSubmissionGateScope !== ORO10P_SCOPE) {
    blockers.push("invalid_oro10p_final_approval_request_submission_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10p`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10P_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10P_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10O_KEY]: pass && fixture[DEPENDS_ON_ORO10O_KEY],
    [ORO10O_PASSED_KEY]: pass && fixture[ORO10O_PASSED_KEY],
    [VERIFIED_ORO10O_ONLY_KEY]: pass && fixture[VERIFIED_ORO10O_ONLY_KEY],
    oro10oStatus: pass ? fixture.oro10oStatus : HOLD,
    oro10oScope: pass ? fixture.oro10oScope : HOLD,
    oro10oClosed: pass && fixture.oro10oClosed,
    finalApprovalRequestSubmissionGateStatus: pass ? fixture.finalApprovalRequestSubmissionGateStatus : HOLD,
    finalApprovalRequestSubmissionGateScope: pass ? fixture.finalApprovalRequestSubmissionGateScope : HOLD,
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

function evaluateOro10pFinalApprovalRequestSubmissionGate(input = buildOro10pFinalApprovalRequestSubmissionGate()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10pFinalApprovalRequestSubmissionGate(input = {}) {
  return evaluateOro10pFinalApprovalRequestSubmissionGate(input);
}

function buildOro10pFinalApprovalRequestSubmissionGateResult(overrides = {}) {
  return validateOro10pFinalApprovalRequestSubmissionGate(buildOro10pFinalApprovalRequestSubmissionGate(overrides));
}

module.exports = {
  ORO10P_PHASE,
  ORO10P_SCOPE,
  ORO10P_STATUS,
  ORO10P_RESULT_KEY,
  DEPENDS_ON_ORO10O_KEY,
  ORO10O_PASSED_KEY,
  VERIFIED_ORO10O_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10pSafetySummary,
  buildOro10pPredecessorEvidence,
  buildOro10pFinalApprovalRequestSubmissionGate,
  buildOro10pFinalApprovalRequestSubmissionGateResult,
  evaluateOro10pFinalApprovalRequestSubmissionGate,
  validateOro10pFinalApprovalRequestSubmissionGate,
};
