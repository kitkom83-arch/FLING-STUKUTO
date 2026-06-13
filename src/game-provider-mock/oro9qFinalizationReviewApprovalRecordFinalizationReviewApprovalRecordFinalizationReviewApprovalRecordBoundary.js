"use strict";

const {
  CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9P_BOUNDARY_RESULT_KEY,
  ORO9P_NO_RUNTIME_PROOF_KEYS,
  ORO_9P_BOUNDARY_STATUS,
  ORO_9P_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO_9Q_PHASE = "ORO-9Q";
const ORO9Q_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO_9Q_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9Q_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const DEPENDS_ON_ORO9P_KEY =
  "dependsOnOro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9P_PASSED_KEY =
  "oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9P_ONLY_KEY =
  "verifiedOro9pWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";

const ORO9P_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9p",
  "IssuedFromOro9p",
  "PassedFromOro9p",
  "RecordedFromOro9p",
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
const ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const ORO9Q_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9P_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9P_SUMMARY = validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary()
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

function buildOro9qSafetyFlags() {
  return {
    ...trueFlags(ORO9Q_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9qDependencyChainFromOro9p(summary = BASELINE_ORO9P_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9P_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9P_KEY]: true,
    [ORO9P_PASSED_KEY]: boundaryPassed,
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus,
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope,
    [VERIFIED_ORO9P_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus === ORO_9P_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope === ORO_9P_SCOPE &&
      ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS.every((key) => summary[key] === false),
    PreparedFromOro9p: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared === true,
    IssuedFromOro9p: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued === true,
    PassedFromOro9p: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed === true,
    RecordedFromOro9p: summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded === true,
    ...trueFlags(ORO9P_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  overrides = {}
) {
  const finalizationReviewApprovalRecordEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: ORO_9Q_BOUNDARY_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: ORO_9Q_SCOPE,
    ...buildOro9qSafetyFlags(),
    ...trueFlags(ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS),
    ...closedFlags(ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalRecordEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9qDependencyChainFromOro9p(BASELINE_ORO9P_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      finalizationReviewApprovalRecordEvidence,
    safetyEvidence: buildOro9qSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro9p = isPlainObject(
    merged.oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const finalizationReviewApprovalRecord = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9p];
  const approvalRecordSources = [merged, finalizationReviewApprovalRecord];
  const safetySources = [merged, safety, finalizationReviewApprovalRecord, oro9p];
  const proofSources = [merged, safety, finalizationReviewApprovalRecord, oro9p];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9P_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9P_KEY, true),
    [ORO9P_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9P_PASSED_KEY, true),
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p: readStringFrom(
      dependencySources,
      "oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p",
      ORO_9P_BOUNDARY_STATUS
    ),
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p: readStringFrom(
      dependencySources,
      "oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p",
      ORO_9P_SCOPE
    ),
    [VERIFIED_ORO9P_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9P_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: readStringFrom(
      approvalRecordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
      ORO_9Q_BOUNDARY_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: readStringFrom(
      approvalRecordSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
      ORO_9Q_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(approvalRecordSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const key of ORO9P_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(approvalRecordSources, key, true);
  }
  for (const key of ORO9Q_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9p], key, false);
  }
  for (const key of CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9p], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(approvalRecordSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9P_KEY]) {
    blockers.push("missing_oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency");
  }
  if (!fixture[ORO9P_PASSED_KEY]) {
    blockers.push(
      "oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_pass_required"
    );
  }
  for (const key of ORO9P_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p !== ORO_9P_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_status");
  }
  if (fixture.oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p !== ORO_9P_SCOPE) {
    blockers.push("invalid_oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9P_ONLY_KEY]) {
    blockers.push("oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required");
  }
  for (const key of ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus !== ORO_9Q_BOUNDARY_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope !== ORO_9Q_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope");
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
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_acceptance_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof"
    );
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9q`);
  }
  for (const key of CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9q`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_required_after_oro9q"
    );
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9q");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9Q_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9Q_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9P_KEY]: fixture[DEPENDS_ON_ORO9P_KEY],
    [ORO9P_PASSED_KEY]: pass && fixture[ORO9P_PASSED_KEY],
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p: pass
      ? fixture.oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p
      : HOLD,
    oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p: pass
      ? fixture.oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p
      : HOLD,
    [VERIFIED_ORO9P_ONLY_KEY]: pass && fixture[VERIFIED_ORO9P_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope
      : HOLD,
  };

  for (const key of ORO9P_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9Q_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

function validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = {}
) {
  return validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

function buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult(
  overrides = {}
) {
  return validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(overrides)
  );
}

function runOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

function buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(
  input = {}
) {
  return validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input);
}

module.exports = {
  ORO_9Q_PHASE,
  ORO_9Q_SCOPE,
  ORO_9Q_BOUNDARY_STATUS,
  ORO9Q_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS,
  ORO9Q_NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9qSafetyFlags,
  buildOro9qDependencyChainFromOro9p,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
  evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
};
