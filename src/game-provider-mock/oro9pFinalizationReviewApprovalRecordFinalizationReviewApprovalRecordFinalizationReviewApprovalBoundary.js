"use strict";

const {
  CLOSED_ORO9O_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9O_BOUNDARY_RESULT_KEY,
  ORO9O_NO_RUNTIME_PROOF_KEYS,
  ORO_9O_BOUNDARY_STATUS,
  ORO_9O_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const ORO_9P_PHASE = "ORO-9P";
const ORO9P_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult";
const ORO_9P_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const ORO_9P_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const DEPENDS_ON_ORO9O_KEY =
  "dependsOnOro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9O_PASSED_KEY =
  "oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9O_ONLY_KEY =
  "verifiedOro9oWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";

const ORO9O_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9o",
  "IssuedFromOro9o",
  "PassedFromOro9o",
  "RecordedFromOro9o",
]);
const ORO9O_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9O_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized",
]);
const ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized",
]);
const ORO9P_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9O_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9O_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9O_SUMMARY = validateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary()
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

function buildOro9pSafetyFlags() {
  return {
    ...trueFlags(ORO9P_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9pDependencyChainFromOro9o(summary = BASELINE_ORO9O_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9O_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9O_KEY]: true,
    [ORO9O_PASSED_KEY]: boundaryPassed,
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus,
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope,
    [VERIFIED_ORO9O_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus === ORO_9O_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope === ORO_9O_SCOPE &&
      ORO9O_FINALIZATION_REVIEW_FALSE_KEYS.every((key) => summary[key] === false),
    PreparedFromOro9o: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared === true,
    IssuedFromOro9o: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued === true,
    PassedFromOro9o: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed === true,
    RecordedFromOro9o: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded === true,
    ...trueFlags(ORO9O_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  overrides = {}
) {
  const finalizationReviewApprovalEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus: ORO_9P_BOUNDARY_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope: ORO_9P_SCOPE,
    ...buildOro9pSafetyFlags(),
    ...trueFlags(ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS),
    ...closedFlags(ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture",
    oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      buildOro9pDependencyChainFromOro9o(BASELINE_ORO9O_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      finalizationReviewApprovalEvidence,
    safetyEvidence: buildOro9pSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary();
  const merged = deepMerge(baseline, source);
  const oro9o = isPlainObject(
    merged.oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
  )
    ? merged.oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
    : {};
  const finalizationReviewApproval = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9o];
  const approvalSources = [merged, finalizationReviewApproval];
  const safetySources = [merged, safety, finalizationReviewApproval, oro9o];
  const proofSources = [merged, safety, finalizationReviewApproval, oro9o];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9O_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9O_KEY, true),
    [ORO9O_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9O_PASSED_KEY, true),
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o: readStringFrom(
      dependencySources,
      "oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o",
      ORO_9O_BOUNDARY_STATUS
    ),
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o: readStringFrom(
      dependencySources,
      "oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o",
      ORO_9O_SCOPE
    ),
    [VERIFIED_ORO9O_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9O_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus: readStringFrom(
      approvalSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
      ORO_9P_BOUNDARY_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope: readStringFrom(
      approvalSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
      ORO_9P_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(approvalSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const key of ORO9O_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(approvalSources, key, true);
  }
  for (const key of ORO9P_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApproval], key, false) ||
      readBooleanFrom([oro9o], key, false);
  }
  for (const key of CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApproval], key, false) ||
      readBooleanFrom([oro9o], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(approvalSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9O_KEY]) {
    blockers.push("missing_oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency");
  }
  if (!fixture[ORO9O_PASSED_KEY]) {
    blockers.push(
      "oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_pass_required"
    );
  }
  for (const key of ORO9O_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o !== ORO_9O_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_status");
  }
  if (fixture.oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o !== ORO_9O_SCOPE) {
    blockers.push("invalid_oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9O_ONLY_KEY]) {
    blockers.push("oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only_proof_required");
  }
  for (const key of ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus !== ORO_9P_BOUNDARY_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope !== ORO_9P_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope");
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
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_acceptance_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9p`);
  }
  for (const key of CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9p`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9p"
    );
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9p");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9P_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9P_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9O_KEY]: fixture[DEPENDS_ON_ORO9O_KEY],
    [ORO9O_PASSED_KEY]: pass && fixture[ORO9O_PASSED_KEY],
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o: pass
      ? fixture.oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o
      : HOLD,
    oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o: pass
      ? fixture.oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o
      : HOLD,
    [VERIFIED_ORO9O_ONLY_KEY]: pass && fixture[VERIFIED_ORO9O_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope
      : HOLD,
  };

  for (const key of ORO9O_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9P_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = {}
) {
  return evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input);
}

function validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input = {}) {
  return validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input);
}

function buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult(
  overrides = {}
) {
  return validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(overrides)
  );
}

function runOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = {}
) {
  return validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input);
}

function buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(
  input = {}
) {
  return validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input);
}

module.exports = {
  ORO_9P_PHASE,
  ORO_9P_SCOPE,
  ORO_9P_BOUNDARY_STATUS,
  ORO9P_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS,
  ORO9P_NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9pSafetyFlags,
  buildOro9pDependencyChainFromOro9o,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
  evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
};
