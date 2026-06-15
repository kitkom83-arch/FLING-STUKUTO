"use strict";

const {
  HOLD,
  ORO10M_SCOPE,
  ORO10M_STATUS,
  PASS,
  buildOro10mSignedApprovalArtifactVerificationRecordReviewGate,
  validateOro10mSignedApprovalArtifactVerificationRecordReviewGate,
} = require("./oro10mApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewGate");

const ORO10N_PHASE = "ORO-10N";
const ORO10N_SCOPE =
  "approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_boundary_only";
const ORO10N_STATUS =
  "approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_boundary_finalized_pending_separate_approval_for_static_contract_only";
const ORO10N_RESULT_KEY =
  "approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryResult";
const DEPENDS_ON_ORO10M_KEY =
  "dependsOnOro10mApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewGate";
const ORO10M_PASSED_KEY =
  "oro10mApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewGatePassed";
const VERIFIED_ORO10M_ONLY_KEY =
  "verifiedOro10mWasSignedApprovalArtifactVerificationRecordReviewGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID =
  "validOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryFromOro10mFixture";

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
  "continuationFromOro10mConfirmed",
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
  "staticSignedApprovalArtifactVerificationRecordPresent",
  "staticSignedApprovalArtifactVerificationRecordReviewPresent",
  "approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent",
  "staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent",
  "signedApprovalArtifactVerificationRecordReviewFinalizationStaticMockOnly",
  "signedApprovalArtifactVerificationRecordReviewFinalizationRecorded",
  "signedApprovalArtifactVerificationRecordReviewFinalizationSanitized",
  "signedApprovalArtifactVerificationRecordReviewFinalizationNonAuthorizing",
  "reviewFinalizationNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10nShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockSignedApprovalArtifactVerificationRecordReviewFinalizationOnly",
  "nonAuthorizingReviewFinalizationOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalizationAuthorizesRuntimeOccurred",
  "verifiedNoRequestAuthorizesRuntimeOccurred",
  "verifiedNoArtifactIntakeAuthorizesRuntimeOccurred",
  "verifiedNoArtifactVerificationAuthorizesRuntimeOccurred",
  "verifiedNoVerificationRecordAuthorizesRuntimeOccurred",
  "verifiedNoVerificationRecordReviewAuthorizesRuntimeOccurred",
  "verifiedNoReviewFinalizationAuthorizesRuntimeOccurred",
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
  "verifiedShortOro10nFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "finalizationAuthorizesRuntime",
  "requestAuthorizesRuntime",
  "artifactIntakeAuthorizesRuntime",
  "artifactVerificationAuthorizesRuntime",
  "verificationRecordAuthorizesRuntime",
  "verificationRecordReviewAuthorizesRuntime",
  "reviewFinalizationAuthorizesRuntime",
  "runtimeAuthorization",
  "reviewDecisionApproved",
  "signedApproval",
  "signedRuntimeApproval",
  "signedApprovalArtifactAccepted",
  "signedApprovalArtifactVerified",
  "actualSignedApprovalVerification",
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

function buildOro10nSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10nPredecessorEvidence() {
  const oro10mSummary = validateOro10mSignedApprovalArtifactVerificationRecordReviewGate(
    buildOro10mSignedApprovalArtifactVerificationRecordReviewGate()
  );
  const passed = oro10mSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10M_KEY]: true,
    [ORO10M_PASSED_KEY]: passed,
    [VERIFIED_ORO10M_ONLY_KEY]:
      passed && oro10mSummary.signedApprovalArtifactVerificationRecordReviewGateScope === ORO10M_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10mSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10mSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10mSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10mSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10mSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10mSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10mSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10mSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10mSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10mSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10mSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10mSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10mSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent:
      passed && oro10mSummary.oro10iSignedApprovalRequestBoundaryPresent === true,
    oro10jSignedApprovalArtifactIntakeGatePresent:
      passed && oro10mSummary.oro10jSignedApprovalArtifactIntakeGatePresent === true,
    oro10kSignedApprovalArtifactVerificationGatePresent:
      passed && oro10mSummary.oro10kSignedApprovalArtifactVerificationGatePresent === true,
    oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent:
      passed && oro10mSummary.oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent === true,
    staticSignedApprovalArtifactVerificationRecordPresent:
      passed && oro10mSummary.staticSignedApprovalArtifactVerificationRecordPresent === true,
    oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent:
      passed && oro10mSummary.approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewGatePresent === true,
    staticSignedApprovalArtifactVerificationRecordReviewPresent:
      passed && oro10mSummary.staticSignedApprovalArtifactVerificationRecordReviewPresent === true,
    oro10mStatus: passed ? ORO10M_STATUS : HOLD,
    oro10mScope: passed ? ORO10M_SCOPE : HOLD,
    oro10mClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10nPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10nPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10nDefaultRecordShell() {
  const safetyEvidence = buildOro10nSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10nPredecessorEvidence(),
    signedApprovalArtifactVerificationRecordReviewFinalizationEvidence: {
      phase: ORO10N_PHASE,
      signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus: ORO10N_STATUS,
      signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope: ORO10N_SCOPE,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      runtimeReviewDecision: false,
      decisionAuthorizesRuntime: false,
      finalizationAuthorizesRuntime: false,
      requestAuthorizesRuntime: false,
      artifactIntakeAuthorizesRuntime: false,
      artifactVerificationAuthorizesRuntime: false,
      verificationRecordAuthorizesRuntime: false,
      verificationRecordReviewAuthorizesRuntime: false,
      reviewFinalizationAuthorizesRuntime: false,
      "runtimeAuthorization": false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      actualSignedApprovalVerification: false,
      runtimeApprovalChainRollover: false,
      gameLaunchCall: false,
    },
    safetyEvidence,
  };
}

function buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(overrides = {}) {
  return deepMerge(buildOro10nDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10nDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const finalization = isPlainObject(merged.signedApprovalArtifactVerificationRecordReviewFinalizationEvidence)
    ? merged.signedApprovalArtifactVerificationRecordReviewFinalizationEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const finalizationSources = [merged, finalization];
  const safetySources = [merged, safety, finalization, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(finalizationSources, "phase", ORO10N_PHASE),
    signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus: readStringFrom(
      finalizationSources,
      "signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus",
      ORO10N_STATUS
    ),
    signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope: readStringFrom(
      finalizationSources,
      "signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope",
      ORO10N_SCOPE
    ),
    [DEPENDS_ON_ORO10M_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10M_KEY, true),
    [ORO10M_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10M_PASSED_KEY, true),
    [VERIFIED_ORO10M_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10M_ONLY_KEY, true),
    oro10mStatus: readStringFrom(predecessorSources, "oro10mStatus", ORO10M_STATUS),
    oro10mScope: readStringFrom(predecessorSources, "oro10mScope", ORO10M_SCOPE),
    oro10mClosed: readBooleanFrom(predecessorSources, "oro10mClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(finalizationSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      finalizationSources,
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
  if (fixture.phase !== ORO10N_PHASE) blockers.push("invalid_oro10n_phase");
  for (const [dependencyKey, presentKey, blocker] of PREDECESSOR_BLOCKERS) {
    if ((dependencyKey && !fixture[dependencyKey]) || !fixture[presentKey]) blockers.push(blocker);
  }
  if (
    !fixture[DEPENDS_ON_ORO10M_KEY] ||
    !fixture[ORO10M_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10M_ONLY_KEY] ||
    !fixture.oro10mClosed ||
    !fixture.oro10mPredecessorPresent
  ) {
    blockers.push("missing_oro10m_predecessor");
  }
  for (const [key, blocker] of GATE_BLOCKERS) if (!fixture[key]) blockers.push(blocker);
  if (!fixture.oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent) {
    blockers.push("missing_oro10m_signed_approval_artifact_verification_record_review_gate");
  }
  if (
    !fixture.approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent ||
    !fixture.staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent
  ) {
    blockers.push("missing_static_signed_approval_artifact_verification_record_review_finalization");
  }
  if (fixture.oro10mStatus !== ORO10M_STATUS) blockers.push("invalid_oro10m_status");
  if (fixture.oro10mScope !== ORO10M_SCOPE) blockers.push("invalid_oro10m_scope");
  if (fixture.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus !== ORO10N_STATUS) {
    blockers.push("invalid_oro10n_signed_approval_artifact_verification_record_review_finalization_status");
  }
  if (fixture.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope !== ORO10N_SCOPE) {
    blockers.push("invalid_oro10n_signed_approval_artifact_verification_record_review_finalization_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10n`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10N_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10N_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10M_KEY]: pass && fixture[DEPENDS_ON_ORO10M_KEY],
    [ORO10M_PASSED_KEY]: pass && fixture[ORO10M_PASSED_KEY],
    [VERIFIED_ORO10M_ONLY_KEY]: pass && fixture[VERIFIED_ORO10M_ONLY_KEY],
    oro10mStatus: pass ? fixture.oro10mStatus : HOLD,
    oro10mScope: pass ? fixture.oro10mScope : HOLD,
    oro10mClosed: pass && fixture.oro10mClosed,
    signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus:
      pass ? fixture.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus : HOLD,
    signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope:
      pass ? fixture.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope : HOLD,
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

function evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(
  input = buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(input = {}) {
  return evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(input);
}

function buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryResult(overrides = {}) {
  return validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(
    buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(overrides)
  );
}

module.exports = {
  ORO10N_PHASE,
  ORO10N_SCOPE,
  ORO10N_STATUS,
  ORO10N_RESULT_KEY,
  DEPENDS_ON_ORO10M_KEY,
  ORO10M_PASSED_KEY,
  VERIFIED_ORO10M_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10nSafetySummary,
  buildOro10nPredecessorEvidence,
  buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
  buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryResult,
  evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
  validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
};
