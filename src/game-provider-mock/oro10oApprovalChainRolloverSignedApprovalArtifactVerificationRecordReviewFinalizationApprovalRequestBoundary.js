"use strict";

const {
  HOLD,
  ORO10N_SCOPE,
  ORO10N_STATUS,
  PASS,
  buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
  validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
} = require("./oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary");

const ORO10O_PHASE = "ORO-10O";
const ORO10O_SCOPE =
  "approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_approval_request_boundary_only";
const ORO10O_STATUS =
  "approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_approval_request_boundary_requested_pending_separate_approval_for_static_contract_only";
const ORO10O_RESULT_KEY =
  "approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryResult";
const DEPENDS_ON_ORO10N_KEY =
  "dependsOnOro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary";
const ORO10N_PASSED_KEY =
  "oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPassed";
const VERIFIED_ORO10N_ONLY_KEY =
  "verifiedOro10nWasSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID =
  "validOro10oReviewFinalizationApprovalRequestBoundaryFromOro10nFixture";

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
  "continuationFromOro10nConfirmed",
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
  "staticSignedApprovalArtifactVerificationRecordPresent",
  "staticSignedApprovalArtifactVerificationRecordReviewPresent",
  "staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent",
  "approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPresent",
  "staticApprovalRequestRecordPresent",
  "approvalRequestStaticMockOnly",
  "approvalRequestRecorded",
  "approvalRequestSanitized",
  "approvalRequestNonAuthorizing",
  "approvalRequestSubmissionNotPerformed",
  "finalApprovalNotIssued",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10oShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockApprovalRequestOnly",
  "nonAuthorizingApprovalRequestOnly",
  "verifiedNoApprovalRequestSubmitted",
  "verifiedNoFinalApprovalIssued",
  "verifiedNoApprovalRequestAuthorizesRuntimeOccurred",
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
  "verifiedShortOro10oFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "approvalRequestSubmitted",
  "finalApprovalIssued",
  "approvalRequestAuthorizesRuntime",
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
  [null, "oro10mPredecessorPresent", "missing_oro10m_predecessor"],
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

function buildOro10oSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10oPredecessorEvidence() {
  const oro10nSummary = validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(
    buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary()
  );
  const passed = oro10nSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10N_KEY]: true,
    [ORO10N_PASSED_KEY]: passed,
    [VERIFIED_ORO10N_ONLY_KEY]:
      passed && oro10nSummary.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope === ORO10N_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10nSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10nSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10nSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10nSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10nSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10nSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10nSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10nSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10nSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10nSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10nSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10nSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10nSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent:
      passed && oro10nSummary.oro10iSignedApprovalRequestBoundaryPresent === true,
    oro10jSignedApprovalArtifactIntakeGatePresent:
      passed && oro10nSummary.oro10jSignedApprovalArtifactIntakeGatePresent === true,
    oro10kSignedApprovalArtifactVerificationGatePresent:
      passed && oro10nSummary.oro10kSignedApprovalArtifactVerificationGatePresent === true,
    oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent:
      passed && oro10nSummary.oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent === true,
    oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent:
      passed && oro10nSummary.oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent === true,
    oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent:
      passed &&
      oro10nSummary.approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent ===
        true,
    staticSignedApprovalArtifactVerificationRecordPresent:
      passed && oro10nSummary.staticSignedApprovalArtifactVerificationRecordPresent === true,
    staticSignedApprovalArtifactVerificationRecordReviewPresent:
      passed && oro10nSummary.staticSignedApprovalArtifactVerificationRecordReviewPresent === true,
    staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent:
      passed && oro10nSummary.staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent === true,
    oro10nStatus: passed ? ORO10N_STATUS : HOLD,
    oro10nScope: passed ? ORO10N_SCOPE : HOLD,
    oro10nClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10oPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10oPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10oDefaultRecordShell() {
  const safetyEvidence = buildOro10oSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10oPredecessorEvidence(),
    approvalRequestEvidence: {
      phase: ORO10O_PHASE,
      approvalRequestBoundaryStatus: ORO10O_STATUS,
      approvalRequestBoundaryScope: ORO10O_SCOPE,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      approvalRequestSubmitted: false,
      finalApprovalIssued: false,
      approvalRequestAuthorizesRuntime: false,
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

function buildOro10oReviewFinalizationApprovalRequestBoundary(overrides = {}) {
  return deepMerge(buildOro10oDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10oDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const request = isPlainObject(merged.approvalRequestEvidence) ? merged.approvalRequestEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const requestSources = [merged, request];
  const safetySources = [merged, safety, request, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(requestSources, "phase", ORO10O_PHASE),
    approvalRequestBoundaryStatus: readStringFrom(requestSources, "approvalRequestBoundaryStatus", ORO10O_STATUS),
    approvalRequestBoundaryScope: readStringFrom(requestSources, "approvalRequestBoundaryScope", ORO10O_SCOPE),
    [DEPENDS_ON_ORO10N_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10N_KEY, true),
    [ORO10N_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10N_PASSED_KEY, true),
    [VERIFIED_ORO10N_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10N_ONLY_KEY, true),
    oro10nStatus: readStringFrom(predecessorSources, "oro10nStatus", ORO10N_STATUS),
    oro10nScope: readStringFrom(predecessorSources, "oro10nScope", ORO10N_SCOPE),
    oro10nClosed: readBooleanFrom(predecessorSources, "oro10nClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(requestSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(requestSources, "nextStepRequiresSeparateApproval", true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      requestSources,
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
  if (fixture.phase !== ORO10O_PHASE) blockers.push("invalid_oro10o_phase");
  for (const [dependencyKey, presentKey, blocker] of PREDECESSOR_BLOCKERS) {
    if ((dependencyKey && !fixture[dependencyKey]) || !fixture[presentKey]) blockers.push(blocker);
  }
  if (
    !fixture[DEPENDS_ON_ORO10N_KEY] ||
    !fixture[ORO10N_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10N_ONLY_KEY] ||
    !fixture.oro10nClosed ||
    !fixture.oro10nPredecessorPresent
  ) {
    blockers.push("missing_oro10n_predecessor");
  }
  for (const [key, blocker] of GATE_BLOCKERS) if (!fixture[key]) blockers.push(blocker);
  if (
    !fixture.oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent ||
    !fixture.staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent
  ) {
    blockers.push("missing_oro10n_review_finalization_boundary");
  }
  if (
    !fixture.approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPresent ||
    !fixture.staticApprovalRequestRecordPresent
  ) {
    blockers.push("missing_static_approval_request_record");
  }
  if (fixture.oro10nStatus !== ORO10N_STATUS) blockers.push("invalid_oro10n_status");
  if (fixture.oro10nScope !== ORO10N_SCOPE) blockers.push("invalid_oro10n_scope");
  if (fixture.approvalRequestBoundaryStatus !== ORO10O_STATUS) blockers.push("invalid_oro10o_approval_request_status");
  if (fixture.approvalRequestBoundaryScope !== ORO10O_SCOPE) blockers.push("invalid_oro10o_approval_request_scope");
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10o`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10O_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10O_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10N_KEY]: pass && fixture[DEPENDS_ON_ORO10N_KEY],
    [ORO10N_PASSED_KEY]: pass && fixture[ORO10N_PASSED_KEY],
    [VERIFIED_ORO10N_ONLY_KEY]: pass && fixture[VERIFIED_ORO10N_ONLY_KEY],
    oro10nStatus: pass ? fixture.oro10nStatus : HOLD,
    oro10nScope: pass ? fixture.oro10nScope : HOLD,
    oro10nClosed: pass && fixture.oro10nClosed,
    approvalRequestBoundaryStatus: pass ? fixture.approvalRequestBoundaryStatus : HOLD,
    approvalRequestBoundaryScope: pass ? fixture.approvalRequestBoundaryScope : HOLD,
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

function evaluateOro10oReviewFinalizationApprovalRequestBoundary(
  input = buildOro10oReviewFinalizationApprovalRequestBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10oReviewFinalizationApprovalRequestBoundary(input = {}) {
  return evaluateOro10oReviewFinalizationApprovalRequestBoundary(input);
}

function buildOro10oReviewFinalizationApprovalRequestBoundaryResult(overrides = {}) {
  return validateOro10oReviewFinalizationApprovalRequestBoundary(
    buildOro10oReviewFinalizationApprovalRequestBoundary(overrides)
  );
}

module.exports = {
  ORO10O_PHASE,
  ORO10O_SCOPE,
  ORO10O_STATUS,
  ORO10O_RESULT_KEY,
  DEPENDS_ON_ORO10N_KEY,
  ORO10N_PASSED_KEY,
  VERIFIED_ORO10N_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10oSafetySummary,
  buildOro10oPredecessorEvidence,
  buildOro10oReviewFinalizationApprovalRequestBoundary,
  buildOro10oReviewFinalizationApprovalRequestBoundaryResult,
  evaluateOro10oReviewFinalizationApprovalRequestBoundary,
  validateOro10oReviewFinalizationApprovalRequestBoundary,
};
