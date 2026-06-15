"use strict";

const {
  HOLD,
  ORO10H_SCOPE,
  ORO10H_STATUS,
  PASS,
  buildOro10hReviewDecisionFinalizationBoundaryRecord,
  validateOro10hReviewDecisionFinalizationBoundary,
} = require("./oro10hApprovalChainRolloverReviewDecisionFinalizationBoundary");

const ORO10I_PHASE = "ORO-10I";
const ORO10I_SCOPE = "approval_chain_rollover_signed_approval_request_boundary_only";
const ORO10I_STATUS =
  "approval_chain_rollover_signed_approval_request_recorded_pending_separate_approval_for_static_contract_only";
const ORO10I_RESULT_KEY = "approvalChainRolloverSignedApprovalRequestBoundaryResult";
const DEPENDS_ON_ORO10H_KEY = "dependsOnOro10hApprovalChainRolloverReviewDecisionFinalizationBoundary";
const ORO10H_PASSED_KEY = "oro10hApprovalChainRolloverReviewDecisionFinalizationBoundaryPassed";
const VERIFIED_ORO10H_ONLY_KEY = "verifiedOro10hWasReviewDecisionFinalizationBoundaryOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10iSignedApprovalRequestBoundaryFromOro10hFixture";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "oro10ePredecessorPresent",
  "oro10fPredecessorPresent",
  "oro10gPredecessorPresent",
  "oro10hPredecessorPresent",
  "continuationFromOro10hConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "oro10gReviewDecisionValidationGatePresent",
  "oro10hReviewDecisionFinalizationBoundaryPresent",
  "approvalChainRolloverSignedApprovalRequestBoundaryPresent",
  "staticSignedApprovalRequestRecordPresent",
  "signedApprovalRequestStaticMockOnly",
  "signedApprovalRequestRecorded",
  "signedApprovalRequestSanitized",
  "signedApprovalRequestNonAuthorizing",
  "requestNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10iShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockSignedApprovalRequestOnly",
  "nonAuthorizingRequestOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalizationAuthorizesRuntimeOccurred",
  "verifiedNoRequestAuthorizesRuntimeOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoSignedApprovalArtifactPresent",
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
  "verifiedShortOro10iFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "finalizationAuthorizesRuntime",
  "requestAuthorizesRuntime",
  "runtimeAuthorization",
  "reviewDecisionApproved",
  "signedApproval",
  "signedRuntimeApproval",
  "signedApprovalArtifactPresent",
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

function buildOro10iSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10iPredecessorEvidence() {
  const oro10hSummary = validateOro10hReviewDecisionFinalizationBoundary(
    buildOro10hReviewDecisionFinalizationBoundaryRecord()
  );
  const passed = oro10hSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10H_KEY]: true,
    [ORO10H_PASSED_KEY]: passed,
    [VERIFIED_ORO10H_ONLY_KEY]: passed && oro10hSummary.reviewDecisionFinalizationBoundaryScope === ORO10H_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10hSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10hSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10hSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10hSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10hSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10hSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate:
      passed && oro10hSummary.dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate === true,
    oro10cEvidenceGatePresent: passed && oro10hSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10hSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10hSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10hSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10hSummary.oro10gReviewDecisionValidationGatePresent === true,
    oro10hReviewDecisionFinalizationBoundaryPresent:
      passed && oro10hSummary.approvalChainRolloverReviewDecisionFinalizationBoundaryPresent === true,
    oro10hStatus: passed ? ORO10H_STATUS : HOLD,
    oro10hScope: passed ? ORO10H_SCOPE : HOLD,
    oro10hClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10iPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10iPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10iDefaultRecordShell() {
  const safetyEvidence = buildOro10iSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10iPredecessorEvidence(),
    signedApprovalRequestEvidence: {
      phase: ORO10I_PHASE,
      signedApprovalRequestBoundaryStatus: ORO10I_STATUS,
      signedApprovalRequestBoundaryScope: ORO10I_SCOPE,
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
      "runtimeAuthorization": false,
      signedRuntimeApproval: false,
      signedApprovalArtifactPresent: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      runtimeApprovalChainRollover: false,
      gameLaunchCall: false,
    },
    safetyEvidence,
  };
}

function buildOro10iSignedApprovalRequestBoundaryRecord(overrides = {}) {
  return deepMerge(buildOro10iDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10iDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const request = isPlainObject(merged.signedApprovalRequestEvidence) ? merged.signedApprovalRequestEvidence : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const requestSources = [merged, request];
  const safetySources = [merged, safety, request, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(requestSources, "phase", ORO10I_PHASE),
    signedApprovalRequestBoundaryStatus: readStringFrom(
      requestSources,
      "signedApprovalRequestBoundaryStatus",
      ORO10I_STATUS
    ),
    signedApprovalRequestBoundaryScope: readStringFrom(
      requestSources,
      "signedApprovalRequestBoundaryScope",
      ORO10I_SCOPE
    ),
    [DEPENDS_ON_ORO10H_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10H_KEY, true),
    [ORO10H_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10H_PASSED_KEY, true),
    [VERIFIED_ORO10H_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10H_ONLY_KEY, true),
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
    oro10hStatus: readStringFrom(predecessorSources, "oro10hStatus", ORO10H_STATUS),
    oro10hScope: readStringFrom(predecessorSources, "oro10hScope", ORO10H_SCOPE),
    oro10hClosed: readBooleanFrom(predecessorSources, "oro10hClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(requestSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(requestSources, "nextStepRequiresSeparateApproval", true),
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
  if (fixture.phase !== ORO10I_PHASE) blockers.push("invalid_oro10i_phase");
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
  if (
    !fixture[DEPENDS_ON_ORO10H_KEY] ||
    !fixture[ORO10H_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10H_ONLY_KEY] ||
    !fixture.oro10hClosed ||
    !fixture.oro10hPredecessorPresent
  ) {
    blockers.push("missing_oro10h_predecessor");
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
  if (
    !fixture.approvalChainRolloverSignedApprovalRequestBoundaryPresent ||
    !fixture.staticSignedApprovalRequestRecordPresent
  ) {
    blockers.push("missing_static_signed_approval_request_record");
  }
  if (fixture.oro10hStatus !== ORO10H_STATUS) blockers.push("invalid_oro10h_status");
  if (fixture.oro10hScope !== ORO10H_SCOPE) blockers.push("invalid_oro10h_scope");
  if (fixture.signedApprovalRequestBoundaryStatus !== ORO10I_STATUS) {
    blockers.push("invalid_oro10i_signed_approval_request_status");
  }
  if (fixture.signedApprovalRequestBoundaryScope !== ORO10I_SCOPE) {
    blockers.push("invalid_oro10i_signed_approval_request_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10i`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10I_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10I_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10H_KEY]: pass && fixture[DEPENDS_ON_ORO10H_KEY],
    [ORO10H_PASSED_KEY]: pass && fixture[ORO10H_PASSED_KEY],
    [VERIFIED_ORO10H_ONLY_KEY]: pass && fixture[VERIFIED_ORO10H_ONLY_KEY],
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
    oro10hStatus: pass ? fixture.oro10hStatus : HOLD,
    oro10hScope: pass ? fixture.oro10hScope : HOLD,
    oro10hClosed: pass && fixture.oro10hClosed,
    signedApprovalRequestBoundaryStatus: pass ? fixture.signedApprovalRequestBoundaryStatus : HOLD,
    signedApprovalRequestBoundaryScope: pass ? fixture.signedApprovalRequestBoundaryScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10iSignedApprovalRequestBoundary(
  input = buildOro10iSignedApprovalRequestBoundaryRecord()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10iSignedApprovalRequestBoundary(input = {}) {
  return evaluateOro10iSignedApprovalRequestBoundary(input);
}

function buildOro10iSignedApprovalRequestBoundaryRecordResult(overrides = {}) {
  return validateOro10iSignedApprovalRequestBoundary(
    buildOro10iSignedApprovalRequestBoundaryRecord(overrides)
  );
}

module.exports = {
  ORO10I_PHASE,
  ORO10I_SCOPE,
  ORO10I_STATUS,
  ORO10I_RESULT_KEY,
  DEPENDS_ON_ORO10H_KEY,
  ORO10H_PASSED_KEY,
  VERIFIED_ORO10H_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10iSafetySummary,
  buildOro10iPredecessorEvidence,
  buildOro10iSignedApprovalRequestBoundaryRecord,
  buildOro10iSignedApprovalRequestBoundaryRecordResult,
  evaluateOro10iSignedApprovalRequestBoundary,
  validateOro10iSignedApprovalRequestBoundary,
};
