"use strict";

const {
  HOLD,
  ORO10G_SCOPE,
  ORO10G_STATUS,
  PASS,
  buildOro10gReviewDecisionValidationGateRecord,
  validateOro10gReviewDecisionValidationGate,
} = require("./oro10gApprovalChainRolloverReviewDecisionValidationGate");

const ORO10H_PHASE = "ORO-10H";
const ORO10H_SCOPE = "approval_chain_rollover_review_decision_finalization_boundary_only";
const ORO10H_STATUS =
  "approval_chain_rollover_review_decision_finalization_recorded_pending_separate_approval_for_static_contract_only";
const ORO10H_RESULT_KEY = "approvalChainRolloverReviewDecisionFinalizationBoundaryResult";
const DEPENDS_ON_ORO10G_KEY = "dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate";
const ORO10G_PASSED_KEY = "oro10gApprovalChainRolloverReviewDecisionValidationGatePassed";
const VERIFIED_ORO10G_ONLY_KEY = "verifiedOro10gWasReviewDecisionValidationGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10hReviewDecisionFinalizationBoundaryFromOro10gFixture";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "oro10ePredecessorPresent",
  "oro10fPredecessorPresent",
  "oro10gPredecessorPresent",
  "continuationFromOro10gConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "oro10gReviewDecisionValidationGatePresent",
  "approvalChainRolloverReviewDecisionFinalizationBoundaryPresent",
  "staticReviewDecisionFinalizationRecordPresent",
  "reviewDecisionFinalizationStaticMockOnly",
  "reviewDecisionFinalizationRecorded",
  "reviewDecisionFinalizationSanitized",
  "reviewDecisionFinalizationNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10hShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockReviewDecisionFinalizationOnly",
  "nonAuthorizingFinalizationOnly",
  "verifiedNoRuntimeReviewDecisionOccurred",
  "verifiedNoDecisionAuthorizesRuntimeOccurred",
  "verifiedNoFinalizationAuthorizesRuntimeOccurred",
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
  "verifiedShortOro10hFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeReviewDecision",
  "decisionAuthorizesRuntime",
  "finalizationAuthorizesRuntime",
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

function buildOro10hSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10hPredecessorEvidence() {
  const oro10gSummary = validateOro10gReviewDecisionValidationGate(buildOro10gReviewDecisionValidationGateRecord());
  const passed = oro10gSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10G_KEY]: true,
    [ORO10G_PASSED_KEY]: passed,
    [VERIFIED_ORO10G_ONLY_KEY]: passed && oro10gSummary.reviewDecisionValidationGateScope === ORO10G_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10gSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10gSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10gSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10gSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10gSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate:
      passed && oro10gSummary.dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate === true,
    oro10cEvidenceGatePresent: passed && oro10gSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10gSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10gSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10gSummary.oro10fReviewDecisionIntakeGatePresent === true,
    oro10gReviewDecisionValidationGatePresent:
      passed && oro10gSummary.approvalChainRolloverReviewDecisionValidationGatePresent === true,
    oro10gStatus: passed ? ORO10G_STATUS : HOLD,
    oro10gScope: passed ? ORO10G_SCOPE : HOLD,
    oro10gClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10hPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10hPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10hDefaultRecordShell() {
  const safetyEvidence = buildOro10hSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10hPredecessorEvidence(),
    reviewDecisionFinalizationEvidence: {
      phase: ORO10H_PHASE,
      reviewDecisionFinalizationBoundaryStatus: ORO10H_STATUS,
      reviewDecisionFinalizationBoundaryScope: ORO10H_SCOPE,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      runtimeReviewDecision: false,
      decisionAuthorizesRuntime: false,
      finalizationAuthorizesRuntime: false,
      "runtimeAuthorization": false,
      signedRuntimeApproval: false,
      runtimeApprovalChainRollover: false,
      gameLaunchCall: false,
    },
    safetyEvidence,
  };
}

function buildOro10hReviewDecisionFinalizationBoundaryRecord(overrides = {}) {
  return deepMerge(buildOro10hDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10hDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const finalization = isPlainObject(merged.reviewDecisionFinalizationEvidence)
    ? merged.reviewDecisionFinalizationEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const finalizationSources = [merged, finalization];
  const safetySources = [merged, safety, finalization, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(finalizationSources, "phase", ORO10H_PHASE),
    reviewDecisionFinalizationBoundaryStatus: readStringFrom(
      finalizationSources,
      "reviewDecisionFinalizationBoundaryStatus",
      ORO10H_STATUS
    ),
    reviewDecisionFinalizationBoundaryScope: readStringFrom(
      finalizationSources,
      "reviewDecisionFinalizationBoundaryScope",
      ORO10H_SCOPE
    ),
    [DEPENDS_ON_ORO10G_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10G_KEY, true),
    [ORO10G_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10G_PASSED_KEY, true),
    [VERIFIED_ORO10G_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10G_ONLY_KEY, true),
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
    oro10gStatus: readStringFrom(predecessorSources, "oro10gStatus", ORO10G_STATUS),
    oro10gScope: readStringFrom(predecessorSources, "oro10gScope", ORO10G_SCOPE),
    oro10gClosed: readBooleanFrom(predecessorSources, "oro10gClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(
      finalizationSources,
      "nextStepRequiresSeparateApproval",
      true
    ),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      finalizationSources,
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
  if (fixture.phase !== ORO10H_PHASE) blockers.push("invalid_oro10h_phase");
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
    !fixture[DEPENDS_ON_ORO10G_KEY] ||
    !fixture[ORO10G_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10G_ONLY_KEY] ||
    !fixture.oro10gClosed ||
    !fixture.oro10gPredecessorPresent
  ) {
    blockers.push("missing_oro10g_predecessor");
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
  if (
    !fixture.approvalChainRolloverReviewDecisionFinalizationBoundaryPresent ||
    !fixture.staticReviewDecisionFinalizationRecordPresent
  ) {
    blockers.push("missing_static_review_decision_finalization_record");
  }
  if (fixture.oro10gStatus !== ORO10G_STATUS) blockers.push("invalid_oro10g_status");
  if (fixture.oro10gScope !== ORO10G_SCOPE) blockers.push("invalid_oro10g_scope");
  if (fixture.reviewDecisionFinalizationBoundaryStatus !== ORO10H_STATUS) {
    blockers.push("invalid_oro10h_review_decision_finalization_status");
  }
  if (fixture.reviewDecisionFinalizationBoundaryScope !== ORO10H_SCOPE) {
    blockers.push("invalid_oro10h_review_decision_finalization_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10h`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10H_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10H_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10G_KEY]: pass && fixture[DEPENDS_ON_ORO10G_KEY],
    [ORO10G_PASSED_KEY]: pass && fixture[ORO10G_PASSED_KEY],
    [VERIFIED_ORO10G_ONLY_KEY]: pass && fixture[VERIFIED_ORO10G_ONLY_KEY],
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
    oro10cEvidenceGatePresent: pass && fixture.oro10cEvidenceGatePresent,
    oro10dReviewRequestBoundaryPresent: pass && fixture.oro10dReviewRequestBoundaryPresent,
    oro10eReviewRequestSubmissionGatePresent: pass && fixture.oro10eReviewRequestSubmissionGatePresent,
    oro10fReviewDecisionIntakeGatePresent: pass && fixture.oro10fReviewDecisionIntakeGatePresent,
    oro10gReviewDecisionValidationGatePresent: pass && fixture.oro10gReviewDecisionValidationGatePresent,
    oro10gStatus: pass ? fixture.oro10gStatus : HOLD,
    oro10gScope: pass ? fixture.oro10gScope : HOLD,
    oro10gClosed: pass && fixture.oro10gClosed,
    reviewDecisionFinalizationBoundaryStatus: pass ? fixture.reviewDecisionFinalizationBoundaryStatus : HOLD,
    reviewDecisionFinalizationBoundaryScope: pass ? fixture.reviewDecisionFinalizationBoundaryScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10hReviewDecisionFinalizationBoundary(
  input = buildOro10hReviewDecisionFinalizationBoundaryRecord()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10hReviewDecisionFinalizationBoundary(input = {}) {
  return evaluateOro10hReviewDecisionFinalizationBoundary(input);
}

function buildOro10hReviewDecisionFinalizationBoundaryRecordResult(overrides = {}) {
  return validateOro10hReviewDecisionFinalizationBoundary(
    buildOro10hReviewDecisionFinalizationBoundaryRecord(overrides)
  );
}

module.exports = {
  ORO10H_PHASE,
  ORO10H_SCOPE,
  ORO10H_STATUS,
  ORO10H_RESULT_KEY,
  DEPENDS_ON_ORO10G_KEY,
  ORO10G_PASSED_KEY,
  VERIFIED_ORO10G_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10hSafetySummary,
  buildOro10hPredecessorEvidence,
  buildOro10hReviewDecisionFinalizationBoundaryRecord,
  buildOro10hReviewDecisionFinalizationBoundaryRecordResult,
  evaluateOro10hReviewDecisionFinalizationBoundary,
  validateOro10hReviewDecisionFinalizationBoundary,
};
