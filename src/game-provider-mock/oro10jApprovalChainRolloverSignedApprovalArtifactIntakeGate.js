"use strict";

const {
  HOLD,
  ORO10I_SCOPE,
  ORO10I_STATUS,
  PASS,
  buildOro10iSignedApprovalRequestBoundaryRecord,
  validateOro10iSignedApprovalRequestBoundary,
} = require("./oro10iApprovalChainRolloverSignedApprovalRequestBoundary");

const ORO10J_PHASE = "ORO-10J";
const ORO10J_SCOPE = "approval_chain_rollover_signed_approval_artifact_intake_gate_only";
const ORO10J_STATUS =
  "approval_chain_rollover_signed_approval_artifact_intake_recorded_pending_separate_approval_for_static_contract_only";
const ORO10J_RESULT_KEY = "approvalChainRolloverSignedApprovalArtifactIntakeGateResult";
const DEPENDS_ON_ORO10I_KEY = "dependsOnOro10iApprovalChainRolloverSignedApprovalRequestBoundary";
const ORO10I_PASSED_KEY = "oro10iApprovalChainRolloverSignedApprovalRequestBoundaryPassed";
const VERIFIED_ORO10I_ONLY_KEY = "verifiedOro10iWasSignedApprovalRequestBoundaryOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10jSignedApprovalArtifactIntakeGateFromOro10iFixture";

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
  "continuationFromOro10iConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "oro10gReviewDecisionValidationGatePresent",
  "oro10hReviewDecisionFinalizationBoundaryPresent",
  "oro10iSignedApprovalRequestBoundaryPresent",
  "approvalChainRolloverSignedApprovalArtifactIntakeGatePresent",
  "staticSignedApprovalArtifactIntakeRecordPresent",
  "signedApprovalArtifactIntakeStaticMockOnly",
  "signedApprovalArtifactIntakeRecorded",
  "signedApprovalArtifactIntakeSanitized",
  "signedApprovalArtifactIntakeNonAuthorizing",
  "artifactIntakeNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10jShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockSignedApprovalArtifactIntakeOnly",
  "nonAuthorizingArtifactIntakeOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalizationAuthorizesRuntimeOccurred",
  "verifiedNoRequestAuthorizesRuntimeOccurred",
  "verifiedNoArtifactIntakeAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedApprovalArtifactAccepted",
  "verifiedNoSignedApprovalArtifactVerified",
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
  "verifiedShortOro10jFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "finalizationAuthorizesRuntime",
  "requestAuthorizesRuntime",
  "artifactIntakeAuthorizesRuntime",
  "runtimeAuthorization",
  "reviewDecisionApproved",
  "signedApproval",
  "signedRuntimeApproval",
  "signedApprovalArtifactAccepted",
  "signedApprovalArtifactVerified",
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

function buildOro10jSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10jPredecessorEvidence() {
  const oro10iSummary = validateOro10iSignedApprovalRequestBoundary(
    buildOro10iSignedApprovalRequestBoundaryRecord()
  );
  const passed = oro10iSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10I_KEY]: true,
    [ORO10I_PASSED_KEY]: passed,
    [VERIFIED_ORO10I_ONLY_KEY]: passed && oro10iSummary.signedApprovalRequestBoundaryScope === ORO10I_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10iSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10iSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10iSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10iSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10iSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10iSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10iSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10iSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10iSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10iSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10iSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10iSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10iSummary.oro10hReviewDecisionFinalizationBoundaryPresent === true,
    oro10iSignedApprovalRequestBoundaryPresent:
      passed && oro10iSummary.approvalChainRolloverSignedApprovalRequestBoundaryPresent === true,
    oro10iStatus: passed ? ORO10I_STATUS : HOLD,
    oro10iScope: passed ? ORO10I_SCOPE : HOLD,
    oro10iClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10jPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10jPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10jDefaultRecordShell() {
  const safetyEvidence = buildOro10jSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10jPredecessorEvidence(),
    signedApprovalArtifactIntakeEvidence: {
      phase: ORO10J_PHASE,
      signedApprovalArtifactIntakeGateStatus: ORO10J_STATUS,
      signedApprovalArtifactIntakeGateScope: ORO10J_SCOPE,
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
      "runtimeAuthorization": false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      runtimeApprovalChainRollover: false,
      gameLaunchCall: false,
    },
    safetyEvidence,
  };
}

function buildOro10jSignedApprovalArtifactIntakeGateRecord(overrides = {}) {
  return deepMerge(buildOro10jDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10jDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const intake = isPlainObject(merged.signedApprovalArtifactIntakeEvidence)
    ? merged.signedApprovalArtifactIntakeEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const intakeSources = [merged, intake];
  const safetySources = [merged, safety, intake, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(intakeSources, "phase", ORO10J_PHASE),
    signedApprovalArtifactIntakeGateStatus: readStringFrom(
      intakeSources,
      "signedApprovalArtifactIntakeGateStatus",
      ORO10J_STATUS
    ),
    signedApprovalArtifactIntakeGateScope: readStringFrom(
      intakeSources,
      "signedApprovalArtifactIntakeGateScope",
      ORO10J_SCOPE
    ),
    [DEPENDS_ON_ORO10I_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10I_KEY, true),
    [ORO10I_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10I_PASSED_KEY, true),
    [VERIFIED_ORO10I_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10I_ONLY_KEY, true),
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
    oro10iStatus: readStringFrom(predecessorSources, "oro10iStatus", ORO10I_STATUS),
    oro10iScope: readStringFrom(predecessorSources, "oro10iScope", ORO10I_SCOPE),
    oro10iClosed: readBooleanFrom(predecessorSources, "oro10iClosed", true),
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
  if (fixture.phase !== ORO10J_PHASE) blockers.push("invalid_oro10j_phase");
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
    !fixture[DEPENDS_ON_ORO10I_KEY] ||
    !fixture[ORO10I_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10I_ONLY_KEY] ||
    !fixture.oro10iClosed ||
    !fixture.oro10iPredecessorPresent
  ) {
    blockers.push("missing_oro10i_predecessor");
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
  if (
    !fixture.approvalChainRolloverSignedApprovalArtifactIntakeGatePresent ||
    !fixture.staticSignedApprovalArtifactIntakeRecordPresent
  ) {
    blockers.push("missing_static_signed_approval_artifact_intake_record");
  }
  if (fixture.oro10iStatus !== ORO10I_STATUS) blockers.push("invalid_oro10i_status");
  if (fixture.oro10iScope !== ORO10I_SCOPE) blockers.push("invalid_oro10i_scope");
  if (fixture.signedApprovalArtifactIntakeGateStatus !== ORO10J_STATUS) {
    blockers.push("invalid_oro10j_signed_approval_artifact_intake_status");
  }
  if (fixture.signedApprovalArtifactIntakeGateScope !== ORO10J_SCOPE) {
    blockers.push("invalid_oro10j_signed_approval_artifact_intake_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10j`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10J_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10J_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10I_KEY]: pass && fixture[DEPENDS_ON_ORO10I_KEY],
    [ORO10I_PASSED_KEY]: pass && fixture[ORO10I_PASSED_KEY],
    [VERIFIED_ORO10I_ONLY_KEY]: pass && fixture[VERIFIED_ORO10I_ONLY_KEY],
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
    oro10iStatus: pass ? fixture.oro10iStatus : HOLD,
    oro10iScope: pass ? fixture.oro10iScope : HOLD,
    oro10iClosed: pass && fixture.oro10iClosed,
    signedApprovalArtifactIntakeGateStatus: pass ? fixture.signedApprovalArtifactIntakeGateStatus : HOLD,
    signedApprovalArtifactIntakeGateScope: pass ? fixture.signedApprovalArtifactIntakeGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10jSignedApprovalArtifactIntakeGate(
  input = buildOro10jSignedApprovalArtifactIntakeGateRecord()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10jSignedApprovalArtifactIntakeGate(input = {}) {
  return evaluateOro10jSignedApprovalArtifactIntakeGate(input);
}

function buildOro10jSignedApprovalArtifactIntakeGateRecordResult(overrides = {}) {
  return validateOro10jSignedApprovalArtifactIntakeGate(
    buildOro10jSignedApprovalArtifactIntakeGateRecord(overrides)
  );
}

module.exports = {
  ORO10J_PHASE,
  ORO10J_SCOPE,
  ORO10J_STATUS,
  ORO10J_RESULT_KEY,
  DEPENDS_ON_ORO10I_KEY,
  ORO10I_PASSED_KEY,
  VERIFIED_ORO10I_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10jSafetySummary,
  buildOro10jPredecessorEvidence,
  buildOro10jSignedApprovalArtifactIntakeGateRecord,
  buildOro10jSignedApprovalArtifactIntakeGateRecordResult,
  evaluateOro10jSignedApprovalArtifactIntakeGate,
  validateOro10jSignedApprovalArtifactIntakeGate,
};
