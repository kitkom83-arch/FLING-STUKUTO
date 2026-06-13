"use strict";

const {
  CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9M_BOUNDARY_RESULT_KEY,
  ORO9M_NO_RUNTIME_PROOF_KEYS,
  ORO_9M_BOUNDARY_STATUS,
  ORO_9M_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
  validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO_9N_PHASE = "ORO-9N";
const ORO9N_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO_9N_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9N_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const DEPENDS_ON_ORO9M_KEY =
  "dependsOnOro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9M_PASSED_KEY =
  "oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9M_ONLY_KEY =
  "verifiedOro9mWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";

const ORO9M_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9m",
  "IssuedFromOro9m",
  "PassedFromOro9m",
  "RecordedFromOro9m",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationLiveExecutionFinalized",
]);
const ORO9N_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9M_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9M_SUMMARY = validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
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

function buildOro9nSafetyFlags() {
  return {
    ...trueFlags(ORO9N_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9nDependencyChainFromOro9m(summary = BASELINE_ORO9M_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9M_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9M_KEY]: true,
    [ORO9M_PASSED_KEY]: boundaryPassed,
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus,
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope,
    [VERIFIED_ORO9M_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus === ORO_9M_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope === ORO_9M_SCOPE &&
      ORO9M_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS.every((key) => summary[key] === false),
    PreparedFromOro9m: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared === true,
    IssuedFromOro9m: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued === true,
    PassedFromOro9m: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed === true,
    RecordedFromOro9m: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded === true,
    ...trueFlags(ORO9M_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(overrides = {}) {
  const finalizationReviewApprovalRecordEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: ORO_9N_BOUNDARY_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: ORO_9N_SCOPE,
    ...buildOro9nSafetyFlags(),
    ...trueFlags(ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS),
    ...closedFlags(ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalRecordEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture",
    oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      buildOro9nDependencyChainFromOro9m(BASELINE_ORO9M_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      finalizationReviewApprovalRecordEvidence,
    safetyEvidence: buildOro9nSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary();
  const merged = deepMerge(baseline, source);
  const oro9m = isPlainObject(
    merged.oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
    : {};
  const finalizationReviewApprovalRecord = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9m];
  const recordSources = [merged, finalizationReviewApprovalRecord];
  const safetySources = [merged, safety, finalizationReviewApprovalRecord, oro9m];
  const proofSources = [merged, safety, finalizationReviewApprovalRecord, oro9m];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9M_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9M_KEY, true),
    [ORO9M_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9M_PASSED_KEY, true),
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m: readStringFrom(
      dependencySources,
      "oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m",
      ORO_9M_BOUNDARY_STATUS
    ),
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m: readStringFrom(
      dependencySources,
      "oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m",
      ORO_9M_SCOPE
    ),
    [VERIFIED_ORO9M_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9M_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: readStringFrom(
      recordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
      ORO_9N_BOUNDARY_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: readStringFrom(
      recordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
      ORO_9N_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const key of ORO9M_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(recordSources, key, true);
  }
  for (const key of ORO9N_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9m], key, false);
  }
  for (const key of CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9m], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(recordSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9M_KEY]) {
    blockers.push("missing_oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_dependency");
  }
  if (!fixture[ORO9M_PASSED_KEY]) {
    blockers.push("oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_pass_required");
  }
  for (const key of ORO9M_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m !== ORO_9M_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_status");
  }
  if (fixture.oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m !== ORO_9M_SCOPE) {
    blockers.push("invalid_oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9M_ONLY_KEY]) {
    blockers.push("oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_only_proof_required");
  }
  for (const key of ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus !== ORO_9N_BOUNDARY_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope !== ORO_9N_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_scope");
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
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_acceptance_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_approval_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_approval_record_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_approval_record_finalization_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9n`);
  }
  for (const key of CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9n`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_finalization_review_approval_record_finalization_boundary_required_after_oro9n"
    );
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9n");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9N_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9N_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9M_KEY]: fixture[DEPENDS_ON_ORO9M_KEY],
    [ORO9M_PASSED_KEY]: pass && fixture[ORO9M_PASSED_KEY],
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m: pass
      ? fixture.oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m
      : HOLD,
    oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m: pass
      ? fixture.oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m
      : HOLD,
    [VERIFIED_ORO9M_ONLY_KEY]: pass && fixture[VERIFIED_ORO9M_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope
      : HOLD,
  };

  for (const key of ORO9M_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9N_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input = buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input = {}) {
  return evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input);
}

function buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult(overrides = {}) {
  return validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(overrides)
  );
}

function runOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input = {}) {
  return validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input);
}

function buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(input = {}) {
  return validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input);
}

module.exports = {
  ORO_9N_PHASE,
  ORO_9N_SCOPE,
  ORO_9N_BOUNDARY_STATUS,
  ORO9N_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS,
  ORO9N_NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9nSafetyFlags,
  buildOro9nDependencyChainFromOro9m,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult,
  evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
};

