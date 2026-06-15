"use strict";

const {
  HOLD,
  ORO10J_SCOPE,
  ORO10J_STATUS,
  PASS,
  buildOro10jSignedApprovalArtifactIntakeGateRecord,
  validateOro10jSignedApprovalArtifactIntakeGate,
} = require("./oro10jApprovalChainRolloverSignedApprovalArtifactIntakeGate");

const ORO10K_PHASE = "ORO-10K";
const ORO10K_SCOPE = "approval_chain_rollover_signed_approval_artifact_verification_gate_only";
const ORO10K_STATUS =
  "approval_chain_rollover_signed_approval_artifact_verification_recorded_pending_separate_approval_for_static_contract_only";
const ORO10K_RESULT_KEY = "approvalChainRolloverSignedApprovalArtifactVerificationGateResult";
const DEPENDS_ON_ORO10J_KEY = "dependsOnOro10jApprovalChainRolloverSignedApprovalArtifactIntakeGate";
const ORO10J_PASSED_KEY = "oro10jApprovalChainRolloverSignedApprovalArtifactIntakeGatePassed";
const VERIFIED_ORO10J_ONLY_KEY = "verifiedOro10jWasSignedApprovalArtifactIntakeGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10kSignedApprovalArtifactVerificationGateFromOro10jFixture";

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
  "continuationFromOro10jConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "oro10gReviewDecisionValidationGatePresent",
  "oro10hReviewDecisionFinalizationBoundaryPresent",
  "oro10iSignedApprovalRequestBoundaryPresent",
  "oro10jSignedApprovalArtifactIntakeGatePresent",
  "approvalChainRolloverSignedApprovalArtifactVerificationGatePresent",
  "staticSignedApprovalArtifactVerificationRecordPresent",
  "signedApprovalArtifactVerificationStaticMockOnly",
  "signedApprovalArtifactVerificationRecorded",
  "signedApprovalArtifactVerificationSanitized",
  "signedApprovalArtifactVerificationNonAuthorizing",
  "artifactVerificationNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10kShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockSignedApprovalArtifactVerificationOnly",
  "nonAuthorizingArtifactVerificationOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalizationAuthorizesRuntimeOccurred",
  "verifiedNoRequestAuthorizesRuntimeOccurred",
  "verifiedNoArtifactIntakeAuthorizesRuntimeOccurred",
  "verifiedNoArtifactVerificationAuthorizesRuntimeOccurred",
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
  "verifiedShortOro10kFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "finalizationAuthorizesRuntime",
  "requestAuthorizesRuntime",
  "artifactIntakeAuthorizesRuntime",
  "artifactVerificationAuthorizesRuntime",
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

function buildOro10kSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10kPredecessorEvidence() {
  const oro10jSummary = validateOro10jSignedApprovalArtifactIntakeGate(
    buildOro10jSignedApprovalArtifactIntakeGateRecord()
  );
  const passed = oro10jSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10J_KEY]: true,
    [ORO10J_PASSED_KEY]: passed,
    [VERIFIED_ORO10J_ONLY_KEY]: passed && oro10jSummary.signedApprovalArtifactIntakeGateScope === ORO10J_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10jSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10jSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10jSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10jSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10jSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10jSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10jSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10jSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10jSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10jSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10jSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10jSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10jSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent: passed && oro10jSummary.oro10iSignedApprovalRequestBoundaryPresent === true,
    oro10jSignedApprovalArtifactIntakeGatePresent:
      passed && oro10jSummary.approvalChainRolloverSignedApprovalArtifactIntakeGatePresent === true,
    oro10jStatus: passed ? ORO10J_STATUS : HOLD,
    oro10jScope: passed ? ORO10J_SCOPE : HOLD,
    oro10jClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10kPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10kPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10kDefaultRecordShell() {
  const safetyEvidence = buildOro10kSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10kPredecessorEvidence(),
    signedApprovalArtifactVerificationEvidence: {
      phase: ORO10K_PHASE,
      signedApprovalArtifactVerificationGateStatus: ORO10K_STATUS,
      signedApprovalArtifactVerificationGateScope: ORO10K_SCOPE,
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

function buildOro10kSignedApprovalArtifactVerificationGateRecord(overrides = {}) {
  return deepMerge(buildOro10kDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10kDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const intake = isPlainObject(merged.signedApprovalArtifactVerificationEvidence)
    ? merged.signedApprovalArtifactVerificationEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const intakeSources = [merged, intake];
  const safetySources = [merged, safety, intake, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(intakeSources, "phase", ORO10K_PHASE),
    signedApprovalArtifactVerificationGateStatus: readStringFrom(
      intakeSources,
      "signedApprovalArtifactVerificationGateStatus",
      ORO10K_STATUS
    ),
    signedApprovalArtifactVerificationGateScope: readStringFrom(
      intakeSources,
      "signedApprovalArtifactVerificationGateScope",
      ORO10K_SCOPE
    ),
    [DEPENDS_ON_ORO10J_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10J_KEY, true),
    [ORO10J_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10J_PASSED_KEY, true),
    [VERIFIED_ORO10J_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10J_ONLY_KEY, true),
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
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate",
      true
    ),
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate",
      true
    ),
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate: readBooleanFrom(
      predecessorSources,
      "dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate",
      true
    ),
    oro10cEvidenceGatePresent: readBooleanFrom(predecessorSources, "oro10cEvidenceGatePresent", true),
    oro10dReviewRequestBoundaryPresent: readBooleanFrom(
      predecessorSources,
      "oro10dReviewRequestBoundaryPresent",
      true
    ),
    oro10eReviewRequestSubmissionGatePresent: readBooleanFrom(
      predecessorSources,
      "oro10eReviewRequestSubmissionGatePresent",
      true
    ),
    oro10fReviewDecisionIntakeGatePresent: readBooleanFrom(
      predecessorSources,
      "oro10fReviewDecisionIntakeGatePresent",
      true
    ),
    oro10gReviewDecisionValidationGatePresent: readBooleanFrom(
      predecessorSources,
      "oro10gReviewDecisionValidationGatePresent",
      true
    ),
    oro10hReviewDecisionFinalizationBoundaryPresent: readBooleanFrom(
      predecessorSources,
      "oro10hReviewDecisionFinalizationBoundaryPresent",
      true
    ),
    oro10iSignedApprovalRequestBoundaryPresent: readBooleanFrom(
      predecessorSources,
      "oro10iSignedApprovalRequestBoundaryPresent",
      true
    ),
    oro10jSignedApprovalArtifactIntakeGatePresent: readBooleanFrom(
      predecessorSources,
      "oro10jSignedApprovalArtifactIntakeGatePresent",
      true
    ),
    oro10jStatus: readStringFrom(predecessorSources, "oro10jStatus", ORO10J_STATUS),
    oro10jScope: readStringFrom(predecessorSources, "oro10jScope", ORO10J_SCOPE),
    oro10jClosed: readBooleanFrom(predecessorSources, "oro10jClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(intakeSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(intakeSources, "nextStepRequiresSeparateApproval", true),
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
  if (fixture.phase !== ORO10K_PHASE) blockers.push("invalid_oro10k_phase");
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
    !fixture.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate ||
    !fixture.oro10ePredecessorPresent
  ) {
    blockers.push("missing_oro10e_predecessor");
  }
  if (
    !fixture.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate ||
    !fixture.oro10fPredecessorPresent
  ) {
    blockers.push("missing_oro10f_predecessor");
  }
  if (
    !fixture.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate ||
    !fixture.oro10gPredecessorPresent
  ) {
    blockers.push("missing_oro10g_predecessor");
  }
  if (!fixture.oro10hPredecessorPresent) blockers.push("missing_oro10h_predecessor");
  if (
    !fixture.oro10iPredecessorPresent
  ) {
    blockers.push("missing_oro10i_predecessor");
  }
  if (
    !fixture[DEPENDS_ON_ORO10J_KEY] ||
    !fixture[ORO10J_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10J_ONLY_KEY] ||
    !fixture.oro10jClosed ||
    !fixture.oro10jPredecessorPresent
  ) {
    blockers.push("missing_oro10j_predecessor");
  }
  if (!fixture.oro10cEvidenceGatePresent) blockers.push("missing_oro10c_evidence_gate");
  if (!fixture.oro10dReviewRequestBoundaryPresent) blockers.push("missing_oro10d_review_request_boundary");
  if (!fixture.oro10eReviewRequestSubmissionGatePresent) {
    blockers.push("missing_oro10e_review_request_submission_gate");
  }
  if (!fixture.oro10fReviewDecisionIntakeGatePresent) {
    blockers.push("missing_oro10f_review_decision_intake_gate");
  }
  if (!fixture.oro10gReviewDecisionValidationGatePresent) {
    blockers.push("missing_oro10g_review_decision_validation_gate");
  }
  if (!fixture.oro10hReviewDecisionFinalizationBoundaryPresent) {
    blockers.push("missing_oro10h_review_decision_finalization_boundary");
  }
  if (!fixture.oro10iSignedApprovalRequestBoundaryPresent) {
    blockers.push("missing_oro10i_signed_approval_request_boundary");
  }
  if (!fixture.oro10jSignedApprovalArtifactIntakeGatePresent) {
    blockers.push("missing_oro10j_signed_approval_artifact_intake_gate");
  }
  if (
    !fixture.approvalChainRolloverSignedApprovalArtifactVerificationGatePresent ||
    !fixture.staticSignedApprovalArtifactVerificationRecordPresent
  ) {
    blockers.push("missing_static_signed_approval_artifact_verification_record");
  }
  if (fixture.oro10jStatus !== ORO10J_STATUS) blockers.push("invalid_oro10j_status");
  if (fixture.oro10jScope !== ORO10J_SCOPE) blockers.push("invalid_oro10j_scope");
  if (fixture.signedApprovalArtifactVerificationGateStatus !== ORO10K_STATUS) {
    blockers.push("invalid_oro10k_signed_approval_artifact_verification_status");
  }
  if (fixture.signedApprovalArtifactVerificationGateScope !== ORO10K_SCOPE) {
    blockers.push("invalid_oro10k_signed_approval_artifact_verification_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10k`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10K_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10K_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10J_KEY]: pass && fixture[DEPENDS_ON_ORO10J_KEY],
    [ORO10J_PASSED_KEY]: pass && fixture[ORO10J_PASSED_KEY],
    [VERIFIED_ORO10J_ONLY_KEY]: pass && fixture[VERIFIED_ORO10J_ONLY_KEY],
    dependsOnOro10aApprovalChainRolloverBoundary:
      pass && fixture.dependsOnOro10aApprovalChainRolloverBoundary,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      pass && fixture.dependsOnOro10bApprovalChainRolloverContinuityGate,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      pass && fixture.dependsOnOro10cApprovalChainRolloverEvidenceGate,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      pass && fixture.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      pass && fixture.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      pass && fixture.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      pass && fixture.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate,
    oro10cEvidenceGatePresent: pass && fixture.oro10cEvidenceGatePresent,
    oro10dReviewRequestBoundaryPresent: pass && fixture.oro10dReviewRequestBoundaryPresent,
    oro10eReviewRequestSubmissionGatePresent: pass && fixture.oro10eReviewRequestSubmissionGatePresent,
    oro10fReviewDecisionIntakeGatePresent: pass && fixture.oro10fReviewDecisionIntakeGatePresent,
    oro10gReviewDecisionValidationGatePresent: pass && fixture.oro10gReviewDecisionValidationGatePresent,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      pass && fixture.oro10hReviewDecisionFinalizationBoundaryPresent,
    oro10iSignedApprovalRequestBoundaryPresent: pass && fixture.oro10iSignedApprovalRequestBoundaryPresent,
    oro10jSignedApprovalArtifactIntakeGatePresent: pass && fixture.oro10jSignedApprovalArtifactIntakeGatePresent,
    oro10jStatus: pass ? fixture.oro10jStatus : HOLD,
    oro10jScope: pass ? fixture.oro10jScope : HOLD,
    oro10jClosed: pass && fixture.oro10jClosed,
    signedApprovalArtifactVerificationGateStatus: pass ? fixture.signedApprovalArtifactVerificationGateStatus : HOLD,
    signedApprovalArtifactVerificationGateScope: pass ? fixture.signedApprovalArtifactVerificationGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10kSignedApprovalArtifactVerificationGate(
  input = buildOro10kSignedApprovalArtifactVerificationGateRecord()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10kSignedApprovalArtifactVerificationGate(input = {}) {
  return evaluateOro10kSignedApprovalArtifactVerificationGate(input);
}

function buildOro10kSignedApprovalArtifactVerificationGateRecordResult(overrides = {}) {
  return validateOro10kSignedApprovalArtifactVerificationGate(
    buildOro10kSignedApprovalArtifactVerificationGateRecord(overrides)
  );
}

module.exports = {
  ORO10K_PHASE,
  ORO10K_SCOPE,
  ORO10K_STATUS,
  ORO10K_RESULT_KEY,
  DEPENDS_ON_ORO10J_KEY,
  ORO10J_PASSED_KEY,
  VERIFIED_ORO10J_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10kSafetySummary,
  buildOro10kPredecessorEvidence,
  buildOro10kSignedApprovalArtifactVerificationGateRecord,
  buildOro10kSignedApprovalArtifactVerificationGateRecordResult,
  evaluateOro10kSignedApprovalArtifactVerificationGate,
  validateOro10kSignedApprovalArtifactVerificationGate,
};
