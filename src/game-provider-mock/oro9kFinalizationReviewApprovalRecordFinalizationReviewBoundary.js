"use strict";

const {
  CLOSED_ORO9J_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9J_BOUNDARY_RESULT_KEY,
  ORO9J_NO_RUNTIME_PROOF_KEYS,
  ORO_9J_BOUNDARY_STATUS,
  ORO_9J_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9jFinalizationReviewApprovalRecordFinalizationBoundaryResult,
  buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9jFinalizationReviewApprovalRecordFinalizationBoundary,
} = require("./oro9jFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO_9K_PHASE = "ORO-9K";
const ORO9K_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO_9K_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO_9K_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const DEPENDS_ON_ORO9J_KEY =
  "dependsOnOro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9J_PASSED_KEY =
  "oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9J_ONLY_KEY =
  "verifiedOro9jWasFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";

const ORO9J_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9j",
  "IssuedFromOro9j",
  "PassedFromOro9j",
  "RecordedFromOro9j",
]);
const ORO9J_FINALIZATION_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9J_FINALIZATION_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const ORO9K_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9K_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized",
]);
const ORO9K_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([...ORO9J_NO_RUNTIME_PROOF_KEYS, "verifiedNoRuntimeFinalizationReviewOccurred"]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9J_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9K_FINALIZATION_REVIEW_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9J_SUMMARY = validateOro9jFinalizationReviewApprovalRecordFinalizationBoundary(
  buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
);

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
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = clone(value);
    }
  }
  return output;
}

function readBooleanFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  }
  return fallback;
}

function readStringFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) {
      return source[key];
    }
  }
  return fallback;
}

function closedFlags(keys) {
  return keys.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function trueFlags(keys) {
  return keys.reduce((flags, key) => {
    flags[key] = true;
    return flags;
  }, {});
}

function buildOro9kSafetyFlags() {
  return {
    ...trueFlags(ORO9K_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9kDependencyChainFromOro9j(summary = BASELINE_ORO9J_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9J_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9J_KEY]: true,
    [ORO9J_PASSED_KEY]: boundaryPassed,
    oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j:
      summary.finalizationReviewApprovalRecordFinalizationStatus,
    oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j:
      summary.finalizationReviewApprovalRecordFinalizationScope,
    [VERIFIED_ORO9J_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationStatus === ORO_9J_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationScope === ORO_9J_SCOPE &&
      ORO9J_FINALIZATION_FALSE_KEYS.every((key) => summary[key] === false),
    PreparedFromOro9j: summary.finalizationReviewApprovalRecordFinalizationPrepared === true,
    IssuedFromOro9j: summary.finalizationReviewApprovalRecordFinalizationIssued === true,
    PassedFromOro9j: summary.finalizationReviewApprovalRecordFinalizationPassed === true,
    RecordedFromOro9j: summary.finalizationReviewApprovalRecordFinalizationRecorded === true,
    ...trueFlags(ORO9J_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(overrides = {}) {
  const finalizationReviewEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewStatus: ORO_9K_BOUNDARY_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewScope: ORO_9K_SCOPE,
    ...buildOro9kSafetyFlags(),
    ...trueFlags(ORO9K_FINALIZATION_REVIEW_TRUE_KEYS),
    ...closedFlags(ORO9K_FINALIZATION_REVIEW_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture",
    oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      buildOro9kDependencyChainFromOro9j(BASELINE_ORO9J_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      finalizationReviewEvidence,
    safetyEvidence: buildOro9kSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary();
  const merged = deepMerge(baseline, source);
  const oro9j = isPlainObject(
    merged.oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
  )
    ? merged.oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
    : {};
  const finalizationReview = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9j];
  const reviewSources = [merged, finalizationReview];
  const safetySources = [merged, safety, finalizationReview, oro9j];
  const proofSources = [merged, safety, finalizationReview, oro9j];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9J_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9J_KEY, true),
    [ORO9J_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9J_PASSED_KEY, true),
    oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j: readStringFrom(
      dependencySources,
      "oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j",
      ORO_9J_BOUNDARY_STATUS
    ),
    oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j: readStringFrom(
      dependencySources,
      "oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j",
      ORO_9J_SCOPE
    ),
    [VERIFIED_ORO9J_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9J_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewStatus: readStringFrom(
      reviewSources,
      "finalizationReviewApprovalRecordFinalizationReviewStatus",
      ORO_9K_BOUNDARY_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewScope: readStringFrom(
      reviewSources,
      "finalizationReviewApprovalRecordFinalizationReviewScope",
      ORO_9K_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const key of ORO9J_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9K_FINALIZATION_REVIEW_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(reviewSources, key, true);
  }
  for (const key of ORO9K_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReview], key, false) ||
      readBooleanFrom([oro9j], key, false);
  }
  for (const key of CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReview], key, false) ||
      readBooleanFrom([oro9j], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(reviewSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9J_KEY]) {
    blockers.push("missing_oro9j_finalization_review_approval_record_finalization_boundary_dependency");
  }
  if (!fixture[ORO9J_PASSED_KEY]) {
    blockers.push("oro9j_finalization_review_approval_record_finalization_boundary_pass_required");
  }
  for (const key of ORO9J_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j !== ORO_9J_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9j_finalization_review_approval_record_finalization_boundary_status");
  }
  if (fixture.oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j !== ORO_9J_SCOPE) {
    blockers.push("invalid_oro9j_finalization_review_approval_record_finalization_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9J_ONLY_KEY]) {
    blockers.push("oro9j_finalization_review_approval_record_finalization_boundary_only_proof_required");
  }
  for (const key of ORO9K_FINALIZATION_REVIEW_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewStatus !== ORO_9K_BOUNDARY_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewScope !== ORO_9K_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("finalization_review_approval_record_finalization_review_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_review_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_review_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9k`);
  }
  for (const key of CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9k`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_actual_live_execution_finalization_review_approval_boundary_required_after_oro9k");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9k");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9K_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9K_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9J_KEY]: fixture[DEPENDS_ON_ORO9J_KEY],
    [ORO9J_PASSED_KEY]: pass && fixture[ORO9J_PASSED_KEY],
    oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j: pass
      ? fixture.oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j
      : HOLD,
    oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j: pass
      ? fixture.oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j
      : HOLD,
    [VERIFIED_ORO9J_ONLY_KEY]: pass && fixture[VERIFIED_ORO9J_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewScope
      : HOLD,
  };

  for (const key of ORO9J_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9K_FINALIZATION_REVIEW_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9K_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input = buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input = {}) {
  return evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input);
}

function buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult(overrides = {}) {
  return validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(overrides)
  );
}

function runOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input = {}) {
  return validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input);
}

function buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(input = {}) {
  return validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input);
}

module.exports = {
  ORO_9K_PHASE,
  ORO_9K_SCOPE,
  ORO_9K_BOUNDARY_STATUS,
  ORO9K_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS,
  ORO9K_NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9kSafetyFlags,
  buildOro9kDependencyChainFromOro9j,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult,
  evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  runOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
  buildOro9jFinalizationReviewApprovalRecordFinalizationBoundaryResult,
};
