"use strict";

const {
  CLOSED_ORO9L_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9L_BOUNDARY_RESULT_KEY,
  ORO9L_NO_RUNTIME_PROOF_KEYS,
  ORO_9L_BOUNDARY_STATUS,
  ORO_9L_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
  validateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO_9M_PHASE = "ORO-9M";
const ORO9M_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO_9M_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9M_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const DEPENDS_ON_ORO9L_KEY =
  "dependsOnOro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9L_PASSED_KEY =
  "oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9L_ONLY_KEY =
  "verifiedOro9lWasFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";

const ORO9L_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9l",
  "IssuedFromOro9l",
  "PassedFromOro9l",
  "RecordedFromOro9l",
]);
const ORO9L_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9L_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const ORO9M_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([...ORO9L_NO_RUNTIME_PROOF_KEYS, "verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred"]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9L_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9L_SUMMARY = validateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary()
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

function buildOro9mSafetyFlags() {
  return {
    ...trueFlags(ORO9M_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9mDependencyChainFromOro9l(summary = BASELINE_ORO9L_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9L_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9L_KEY]: true,
    [ORO9L_PASSED_KEY]: boundaryPassed,
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalStatus,
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalScope,
    [VERIFIED_ORO9L_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalStatus === ORO_9L_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalScope === ORO_9L_SCOPE &&
      ORO9L_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS.every((key) => summary[key] === false),
    PreparedFromOro9l: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalPrepared === true,
    IssuedFromOro9l: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalIssued === true,
    PassedFromOro9l: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalPassed === true,
    RecordedFromOro9l: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecorded === true,
    ...trueFlags(ORO9L_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(overrides = {}) {
  const finalizationReviewApprovalRecordEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: ORO_9M_BOUNDARY_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: ORO_9M_SCOPE,
    ...buildOro9mSafetyFlags(),
    ...trueFlags(ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS),
    ...closedFlags(ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalRecordEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9mDependencyChainFromOro9l(BASELINE_ORO9L_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      finalizationReviewApprovalRecordEvidence,
    safetyEvidence: buildOro9mSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro9l = isPlainObject(
    merged.oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const finalizationReviewApprovalRecord = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9l];
  const recordSources = [merged, finalizationReviewApprovalRecord];
  const safetySources = [merged, safety, finalizationReviewApprovalRecord, oro9l];
  const proofSources = [merged, safety, finalizationReviewApprovalRecord, oro9l];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9L_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9L_KEY, true),
    [ORO9L_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9L_PASSED_KEY, true),
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l: readStringFrom(
      dependencySources,
      "oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l",
      ORO_9L_BOUNDARY_STATUS
    ),
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l: readStringFrom(
      dependencySources,
      "oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l",
      ORO_9L_SCOPE
    ),
    [VERIFIED_ORO9L_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9L_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: readStringFrom(
      recordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
      ORO_9M_BOUNDARY_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: readStringFrom(
      recordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
      ORO_9M_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const key of ORO9L_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(recordSources, key, true);
  }
  for (const key of ORO9M_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9l], key, false);
  }
  for (const key of CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9l], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(recordSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9L_KEY]) {
    blockers.push("missing_oro9l_finalization_review_approval_record_finalization_review_approval_boundary_dependency");
  }
  if (!fixture[ORO9L_PASSED_KEY]) {
    blockers.push("oro9l_finalization_review_approval_record_finalization_review_approval_boundary_pass_required");
  }
  for (const key of ORO9L_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l !== ORO_9L_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9l_finalization_review_approval_record_finalization_review_approval_boundary_status");
  }
  if (fixture.oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l !== ORO_9L_SCOPE) {
    blockers.push("invalid_oro9l_finalization_review_approval_record_finalization_review_approval_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9L_ONLY_KEY]) {
    blockers.push("oro9l_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required");
  }
  for (const key of ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus !== ORO_9M_BOUNDARY_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope !== ORO_9M_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_scope");
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
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_acceptance_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9m`);
  }
  for (const key of CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9m`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_finalization_review_approval_record_finalization_boundary_required_after_oro9m"
    );
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9m");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9M_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9M_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9L_KEY]: fixture[DEPENDS_ON_ORO9L_KEY],
    [ORO9L_PASSED_KEY]: pass && fixture[ORO9L_PASSED_KEY],
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l: pass
      ? fixture.oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l
      : HOLD,
    oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l: pass
      ? fixture.oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l
      : HOLD,
    [VERIFIED_ORO9L_ONLY_KEY]: pass && fixture[VERIFIED_ORO9L_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope
      : HOLD,
  };

  for (const key of ORO9L_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9M_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input = {}) {
  return evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

function buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult(overrides = {}) {
  return validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(overrides)
  );
}

function runOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input = {}) {
  return validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

function buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(input = {}) {
  return validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

module.exports = {
  ORO_9M_PHASE,
  ORO_9M_SCOPE,
  ORO_9M_BOUNDARY_STATUS,
  ORO9M_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS,
  ORO9M_NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9mSafetyFlags,
  buildOro9mDependencyChainFromOro9l,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
  evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  runOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
};
