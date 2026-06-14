"use strict";

const {
  HOLD,
  ORO10F_SCOPE,
  ORO10F_STATUS,
  PASS,
  buildOro10fReviewDecisionIntakeGateRecord,
  validateOro10fReviewDecisionIntakeGate,
} = require("./oro10fApprovalChainRolloverReviewDecisionIntakeGate");

const ORO10G_PHASE = "ORO-10G";
const ORO10G_SCOPE = "approval_chain_rollover_review_decision_validation_gate_only";
const ORO10G_STATUS =
  "approval_chain_rollover_review_decision_validation_recorded_pending_separate_approval_for_static_contract_only";
const ORO10G_RESULT_KEY = "approvalChainRolloverReviewDecisionValidationGateResult";
const DEPENDS_ON_ORO10F_KEY = "dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate";
const ORO10F_PASSED_KEY = "oro10fApprovalChainRolloverReviewDecisionIntakeGatePassed";
const VERIFIED_ORO10F_ONLY_KEY = "verifiedOro10fWasReviewDecisionIntakeGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";
const DEFAULT_FIXTURE_ID = "validOro10gReviewDecisionValidationGateFromOro10fFixture";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "oro10cPredecessorPresent",
  "oro10dPredecessorPresent",
  "oro10ePredecessorPresent",
  "oro10fPredecessorPresent",
  "continuationFromOro10fConfirmed",
  "oro10cEvidenceGatePresent",
  "oro10dReviewRequestBoundaryPresent",
  "oro10eReviewRequestSubmissionGatePresent",
  "oro10fReviewDecisionIntakeGatePresent",
  "approvalChainRolloverReviewDecisionValidationGatePresent",
  "staticReviewDecisionValidationRecordPresent",
  "reviewDecisionValidationStaticMockOnly",
  "reviewDecisionValidationRecorded",
  "reviewDecisionValidationSanitized",
  "reviewDecisionValidationNonAuthorizing",
  "humanReviewRequired",
  "separateApprovalRequired",
  "oro10gShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "staticMockReviewDecisionValidationOnly",
  "nonAuthorizingValidationOnly",
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
  "verifiedNoPublicAliasOccurred",
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
  "verifiedShortOro10gFilenamesOnly",
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

function buildOro10gSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10gPredecessorEvidence() {
  const oro10fSummary = validateOro10fReviewDecisionIntakeGate(buildOro10fReviewDecisionIntakeGateRecord());
  const passed = oro10fSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10F_KEY]: true,
    [ORO10F_PASSED_KEY]: passed,
    [VERIFIED_ORO10F_ONLY_KEY]: passed && oro10fSummary.reviewDecisionIntakeGateScope === ORO10F_SCOPE,
    dependsOnOro10aApprovalChainRolloverBoundary:
      passed && oro10fSummary.dependsOnOro10aApprovalChainRolloverBoundary === true,
    dependsOnOro10bApprovalChainRolloverContinuityGate:
      passed && oro10fSummary.dependsOnOro10bApprovalChainRolloverContinuityGate === true,
    dependsOnOro10cApprovalChainRolloverEvidenceGate:
      passed && oro10fSummary.dependsOnOro10cApprovalChainRolloverEvidenceGate === true,
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary:
      passed && oro10fSummary.dependsOnOro10dApprovalChainRolloverReviewRequestBoundary === true,
    dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate:
      passed && oro10fSummary.dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate === true,
    oro10cEvidenceGatePresent: passed && oro10fSummary.oro10cEvidenceGatePresent === true,
    oro10dReviewRequestBoundaryPresent: passed && oro10fSummary.oro10dReviewRequestBoundaryPresent === true,
    oro10eReviewRequestSubmissionGatePresent:
      passed && oro10fSummary.oro10eReviewRequestSubmissionGatePresent === true,
    oro10fReviewDecisionIntakeGatePresent:
      passed && oro10fSummary.approvalChainRolloverReviewDecisionIntakeGatePresent === true,
    oro10fStatus: passed ? ORO10F_STATUS : HOLD,
    oro10fScope: passed ? ORO10F_SCOPE : HOLD,
    oro10fClosed: passed,
  };
}

let cachedPredecessorEvidence;

function getOro10gPredecessorEvidence() {
  if (!cachedPredecessorEvidence) cachedPredecessorEvidence = buildOro10gPredecessorEvidence();
  return clone(cachedPredecessorEvidence);
}

function buildOro10gDefaultRecordShell() {
  const safetyEvidence = buildOro10gSafetySummary();
  return {
    id: DEFAULT_FIXTURE_ID,
    predecessorEvidence: getOro10gPredecessorEvidence(),
    reviewDecisionValidationEvidence: {
      phase: ORO10G_PHASE,
      reviewDecisionValidationGateStatus: ORO10G_STATUS,
      reviewDecisionValidationGateScope: ORO10G_SCOPE,
      ...safetyEvidence,
      [NEXT_PHASE_KEY]: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    runtimeDecisionEvidence: {
      runtimeReviewDecision: false,
      decisionAuthorizesRuntime: false,
      "runtimeAuthorization": false,
      signedRuntimeApproval: false,
      runtimeApprovalChainRollover: false,
    },
    safetyEvidence,
  };
}

function buildOro10gReviewDecisionValidationGateRecord(overrides = {}) {
  return deepMerge(buildOro10gDefaultRecordShell(), overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10gDefaultRecordShell();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const validation = isPlainObject(merged.reviewDecisionValidationEvidence)
    ? merged.reviewDecisionValidationEvidence
    : {};
  const runtimeDecision = isPlainObject(merged.runtimeDecisionEvidence) ? merged.runtimeDecisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const validationSources = [merged, validation];
  const safetySources = [merged, safety, validation, runtimeDecision, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(validationSources, "phase", ORO10G_PHASE),
    reviewDecisionValidationGateStatus: readStringFrom(
      validationSources,
      "reviewDecisionValidationGateStatus",
      ORO10G_STATUS
    ),
    reviewDecisionValidationGateScope: readStringFrom(
      validationSources,
      "reviewDecisionValidationGateScope",
      ORO10G_SCOPE
    ),
    [DEPENDS_ON_ORO10F_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10F_KEY, true),
    [ORO10F_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10F_PASSED_KEY, true),
    [VERIFIED_ORO10F_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10F_ONLY_KEY, true),
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
    oro10fStatus: readStringFrom(predecessorSources, "oro10fStatus", ORO10F_STATUS),
    oro10fScope: readStringFrom(predecessorSources, "oro10fScope", ORO10F_SCOPE),
    oro10fClosed: readBooleanFrom(predecessorSources, "oro10fClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(validationSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateApproval: readBooleanFrom(
      validationSources,
      "nextStepRequiresSeparateApproval",
      true
    ),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      validationSources,
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
  if (fixture.phase !== ORO10G_PHASE) blockers.push("invalid_oro10g_phase");
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
    !fixture[DEPENDS_ON_ORO10F_KEY] ||
    !fixture[ORO10F_PASSED_KEY] ||
    !fixture[VERIFIED_ORO10F_ONLY_KEY] ||
    !fixture.oro10fClosed ||
    !fixture.oro10fPredecessorPresent
  ) {
    blockers.push("missing_oro10f_predecessor");
  }
  if (!fixture.oro10cEvidenceGatePresent) blockers.push("missing_oro10c_evidence_gate");
  if (!fixture.oro10dReviewRequestBoundaryPresent) blockers.push("missing_oro10d_review_request_boundary");
  if (!fixture.oro10eReviewRequestSubmissionGatePresent) {
    blockers.push("missing_oro10e_review_request_submission_gate");
  }
  if (!fixture.oro10fReviewDecisionIntakeGatePresent) {
    blockers.push("missing_oro10f_review_decision_intake_gate");
  }
  if (!fixture.staticReviewDecisionValidationRecordPresent) {
    blockers.push("missing_static_review_decision_validation_record");
  }
  if (fixture.oro10fStatus !== ORO10F_STATUS) blockers.push("invalid_oro10f_status");
  if (fixture.oro10fScope !== ORO10F_SCOPE) blockers.push("invalid_oro10f_scope");
  if (fixture.reviewDecisionValidationGateStatus !== ORO10G_STATUS) {
    blockers.push("invalid_oro10g_review_decision_validation_status");
  }
  if (fixture.reviewDecisionValidationGateScope !== ORO10G_SCOPE) {
    blockers.push("invalid_oro10g_review_decision_validation_scope");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10g`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateApproval) blockers.push("next_step_requires_separate_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10G_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10G_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10F_KEY]: pass && fixture[DEPENDS_ON_ORO10F_KEY],
    [ORO10F_PASSED_KEY]: pass && fixture[ORO10F_PASSED_KEY],
    [VERIFIED_ORO10F_ONLY_KEY]: pass && fixture[VERIFIED_ORO10F_ONLY_KEY],
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
    oro10cEvidenceGatePresent: pass && fixture.oro10cEvidenceGatePresent,
    oro10dReviewRequestBoundaryPresent: pass && fixture.oro10dReviewRequestBoundaryPresent,
    oro10eReviewRequestSubmissionGatePresent: pass && fixture.oro10eReviewRequestSubmissionGatePresent,
    oro10fReviewDecisionIntakeGatePresent: pass && fixture.oro10fReviewDecisionIntakeGatePresent,
    oro10fStatus: pass ? fixture.oro10fStatus : HOLD,
    oro10fScope: pass ? fixture.oro10fScope : HOLD,
    oro10fClosed: pass && fixture.oro10fClosed,
    reviewDecisionValidationGateStatus: pass ? fixture.reviewDecisionValidationGateStatus : HOLD,
    reviewDecisionValidationGateScope: pass ? fixture.reviewDecisionValidationGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateApproval: pass && fixture.nextStepRequiresSeparateApproval,
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10gReviewDecisionValidationGate(input = buildOro10gReviewDecisionValidationGateRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10gReviewDecisionValidationGate(input = {}) {
  return evaluateOro10gReviewDecisionValidationGate(input);
}

function buildOro10gReviewDecisionValidationGateRecordResult(overrides = {}) {
  return validateOro10gReviewDecisionValidationGate(buildOro10gReviewDecisionValidationGateRecord(overrides));
}

module.exports = {
  ORO10G_PHASE,
  ORO10G_SCOPE,
  ORO10G_STATUS,
  ORO10G_RESULT_KEY,
  DEPENDS_ON_ORO10F_KEY,
  ORO10F_PASSED_KEY,
  VERIFIED_ORO10F_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10gSafetySummary,
  buildOro10gPredecessorEvidence,
  buildOro10gReviewDecisionValidationGateRecord,
  buildOro10gReviewDecisionValidationGateRecordResult,
  evaluateOro10gReviewDecisionValidationGate,
  validateOro10gReviewDecisionValidationGate,
};
