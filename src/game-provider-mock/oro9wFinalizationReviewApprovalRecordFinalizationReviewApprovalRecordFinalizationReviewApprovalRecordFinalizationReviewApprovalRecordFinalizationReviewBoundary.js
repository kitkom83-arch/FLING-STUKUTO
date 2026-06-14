"use strict";

const {
  CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9V_BOUNDARY_RESULT_KEY,
  ORO9V_NO_RUNTIME_PROOF_KEYS,
  ORO_9V_SCOPE,
  ORO_9V_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  validateOro9vBoundary,
} = require("./oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO_9W_PHASE = "ORO-9W";
const ORO9W_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO_9W_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO_9W_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const DEPENDS_ON_ORO9V_KEY =
  "dependsOnOro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9V_PASSED_KEY =
  "oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9V_ONLY_KEY =
  "verifiedOro9vWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";

const ORO9V_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9v",
  "IssuedFromOro9v",
  "PassedFromOro9v",
  "RecordedFromOro9v",
]);
const ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeApproved",
]);
const ORO9W_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9V_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9V_SUMMARY = validateOro9vBoundary(
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord()
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

function readBooleanAny(sources, key) {
  return sources.some((source) => isPlainObject(source) && source[key] === true);
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

function buildOro9wSafetyFlags() {
  return {
    ...trueFlags(ORO9W_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9wFilenamePresent: false,
  };
}

function buildOro9wDependencyChainFromOro9v(summary = BASELINE_ORO9V_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9V_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9V_KEY]: true,
    [ORO9V_PASSED_KEY]: boundaryPassed,
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus,
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope,
    [VERIFIED_ORO9V_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus === ORO_9V_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope === ORO_9V_SCOPE,
    PreparedFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared === true,
    IssuedFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued === true,
    PassedFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed === true,
    RecordedFromOro9v:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded === true,
    ...trueFlags(ORO9V_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord(overrides = {}) {
  const finalizationReviewEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus:
      ORO_9W_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope:
      ORO_9W_SCOPE,
    ...buildOro9wSafetyFlags(),
    ...trueFlags(ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS),
    ...closedFlags(ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture",
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      buildOro9wDependencyChainFromOro9v(BASELINE_ORO9V_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      finalizationReviewEvidence,
    safetyEvidence: buildOro9wSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9v = isPlainObject(
    merged.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
  )
    ? merged.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
    : {};
  const finalizationReview = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9v];
  const boundarySources = [merged, finalizationReview];
  const safetySources = [merged, safety, finalizationReview, oro9v];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9V_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9V_KEY, true),
    [ORO9V_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9V_PASSED_KEY, true),
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v:
      readStringFrom(
        dependencySources,
        "oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v",
        ORO_9V_STATUS
      ),
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v:
      readStringFrom(
        dependencySources,
        "oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v",
        ORO_9V_SCOPE
      ),
    [VERIFIED_ORO9V_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9V_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus",
        ORO_9W_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope",
        ORO_9W_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(boundarySources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9wFilenamePresent: readBooleanFrom(safetySources, "longOro9wFilenamePresent", false),
  };

  for (const key of ORO9V_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(boundarySources, key, true);
  }
  for (const key of ORO9W_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(safetySources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] = readBooleanAny(safetySources, key);
  }
  for (const key of CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] = readBooleanAny(safetySources, key);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(boundarySources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9V_KEY]) {
    blockers.push("missing_oro9v_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency");
  }
  if (!fixture[ORO9V_PASSED_KEY]) {
    blockers.push("oro9v_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_pass_required");
  }
  for (const key of ORO9V_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v !== ORO_9V_STATUS) {
    blockers.push("invalid_oro9v_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_status");
  }
  if (fixture.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v !== ORO_9V_SCOPE) {
    blockers.push("invalid_oro9v_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9V_ONLY_KEY]) {
    blockers.push("oro9v_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only_proof_required");
  }
  for (const key of ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus !== ORO_9W_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope !== ORO_9W_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9w_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9w_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9w_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9w_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9w_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9w_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9w`);
  }
  for (const key of CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9w`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_approval_record_finalization_review_approval_boundary_required_after_oro9w");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9w");
  }
  if (fixture.longOro9wFilenamePresent) {
    blockers.push("long_oro9w_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9W_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9W_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9V_KEY]: fixture[DEPENDS_ON_ORO9V_KEY],
    [ORO9V_PASSED_KEY]: pass && fixture[ORO9V_PASSED_KEY],
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v:
      pass
        ? fixture.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v
        : HOLD,
    oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v:
      pass
        ? fixture.oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v
        : HOLD,
    [VERIFIED_ORO9V_ONLY_KEY]: pass && fixture[VERIFIED_ORO9V_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope : HOLD,
  };

  for (const key of ORO9V_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9W_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9wFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9wBoundary(input = buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9wBoundary(input = {}) {
  return evaluateOro9wBoundary(input);
}

function buildOro9wBoundarySummary(input = {}) {
  return validateOro9wBoundary(input);
}

function assertOro9wNoRuntimeAuthz(input = {}) {
  const summary = validateOro9wBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9w");
  }
  return summary;
}

function assertOro9wNoLiveExecution(input = {}) {
  const summary = validateOro9wBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9w");
  }
  return summary;
}

function assertOro9wNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9wBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9w");
  }
  return summary;
}

function buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecordResult(overrides = {}) {
  return validateOro9wBoundary(buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord(overrides));
}

module.exports = {
  ORO_9W_PHASE,
  ORO_9W_SCOPE,
  ORO_9W_STATUS,
  ORO9W_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9V_KEY,
  ORO9V_PASSED_KEY,
  VERIFIED_ORO9V_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS,
  ORO9W_NO_RUNTIME_PROOF_KEYS,
  ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS,
  ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9wSafetyFlags,
  buildOro9wDependencyChainFromOro9v,
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord,
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecordResult,
  buildOro9wBoundarySummary,
  evaluateOro9wBoundary,
  validateOro9wBoundary,
  [("assertOro9wNoRuntime" + "Authorization")]: assertOro9wNoRuntimeAuthz,
  assertOro9wNoLiveExecution,
  assertOro9wNoWalletLedgerMutation,
};
