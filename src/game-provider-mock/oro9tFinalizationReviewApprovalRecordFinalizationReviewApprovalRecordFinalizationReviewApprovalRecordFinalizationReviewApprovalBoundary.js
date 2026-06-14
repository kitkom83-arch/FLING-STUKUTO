"use strict";

const {
  CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9S_BOUNDARY_RESULT_KEY,
  ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
  ORO9S_NO_RUNTIME_PROOF_KEYS,
  ORO_9S_SCOPE,
  ORO_9S_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9sFinalizationReviewBoundaryRecord,
  validateOro9sBoundary,
} = require("./oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const ORO_9T_PHASE = "ORO-9T";
const ORO9T_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult";
const ORO_9T_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const ORO_9T_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const DEPENDS_ON_ORO9S_KEY =
  "dependsOnOro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9S_PASSED_KEY =
  "oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9S_ONLY_KEY =
  "verifiedOro9sWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";

const ORO9S_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9s",
  "IssuedFromOro9s",
  "PassedFromOro9s",
  "RecordedFromOro9s",
]);
const ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeApproved",
]);
const ORO9T_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9S_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
      ...ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9S_SUMMARY = validateOro9sBoundary(buildOro9sFinalizationReviewBoundaryRecord());

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

function buildOro9tSafetyFlags() {
  return {
    ...trueFlags(ORO9T_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9tFilenamePresent: false,
  };
}

function buildOro9tDependencyChainFromOro9s(summary = BASELINE_ORO9S_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9S_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9S_KEY]: true,
    [ORO9S_PASSED_KEY]: boundaryPassed,
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus,
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope,
    [VERIFIED_ORO9S_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus === ORO_9S_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope === ORO_9S_SCOPE,
    PreparedFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared === true,
    IssuedFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued === true,
    PassedFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed === true,
    RecordedFromOro9s:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded === true,
    ...trueFlags(ORO9S_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9tFinalizationReviewApprovalBoundaryRecord(overrides = {}) {
  const finalizationReviewApprovalEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      ORO_9T_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      ORO_9T_SCOPE,
    ...buildOro9tSafetyFlags(),
    ...trueFlags(ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS),
    ...closedFlags(ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture",
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      buildOro9tDependencyChainFromOro9s(BASELINE_ORO9S_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      finalizationReviewApprovalEvidence,
    safetyEvidence: buildOro9tSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9tFinalizationReviewApprovalBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9s = isPlainObject(
    merged.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
  )
    ? merged.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
    : {};
  const finalizationReviewApproval = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9s];
  const finalizationReviewApprovalSources = [merged, finalizationReviewApproval];
  const safetySources = [merged, safety, finalizationReviewApproval, oro9s];
  const proofSources = [merged, safety, finalizationReviewApproval, oro9s];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9S_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9S_KEY, true),
    [ORO9S_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9S_PASSED_KEY, true),
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s:
      readStringFrom(
        dependencySources,
        "oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s",
        ORO_9S_STATUS
      ),
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s:
      readStringFrom(
        dependencySources,
        "oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s",
        ORO_9S_SCOPE
      ),
    [VERIFIED_ORO9S_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9S_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      readStringFrom(
        finalizationReviewApprovalSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
        ORO_9T_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      readStringFrom(
        finalizationReviewApprovalSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
        ORO_9T_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationReviewApprovalSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9tFilenamePresent: readBooleanFrom(safetySources, "longOro9tFilenamePresent", false),
  };

  for (const key of ORO9S_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(finalizationReviewApprovalSources, key, true);
  }
  for (const key of ORO9T_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApproval], key, false) ||
      readBooleanFrom([oro9s], key, false);
  }
  for (const key of CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApproval], key, false) ||
      readBooleanFrom([oro9s], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(finalizationReviewApprovalSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9S_KEY]) {
    blockers.push("missing_oro9s_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency");
  }
  if (!fixture[ORO9S_PASSED_KEY]) {
    blockers.push("oro9s_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_pass_required");
  }
  for (const key of ORO9S_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s !== ORO_9S_STATUS) {
    blockers.push("invalid_oro9s_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_status");
  }
  if (fixture.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s !== ORO_9S_SCOPE) {
    blockers.push("invalid_oro9s_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9S_ONLY_KEY]) {
    blockers.push("oro9s_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only_proof_required");
  }
  for (const key of ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus !== ORO_9T_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope !== ORO_9T_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9t_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9t_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9t_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9t_requires_no_runtime_finalization_review_approval_extension_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9t_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9t_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9t`);
  }
  for (const key of CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9t`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_approval_record_boundary_required_after_oro9t");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9t");
  }
  if (fixture.longOro9tFilenamePresent) {
    blockers.push("long_oro9t_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9T_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9T_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9S_KEY]: fixture[DEPENDS_ON_ORO9S_KEY],
    [ORO9S_PASSED_KEY]: pass && fixture[ORO9S_PASSED_KEY],
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s:
      pass
        ? fixture.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s
        : HOLD,
    oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s:
      pass
        ? fixture.oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s
        : HOLD,
    [VERIFIED_ORO9S_ONLY_KEY]: pass && fixture[VERIFIED_ORO9S_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope : HOLD,
  };

  for (const key of ORO9S_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9T_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9tFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9tBoundary(input = buildOro9tFinalizationReviewApprovalBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9tBoundary(input = {}) {
  return evaluateOro9tBoundary(input);
}

function buildOro9tBoundarySummary(input = {}) {
  return validateOro9tBoundary(input);
}

function assertOro9tNoRuntimeAuthorization(input = {}) {
  const summary = validateOro9tBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9t");
  }
  return summary;
}

function assertOro9tNoLiveExecution(input = {}) {
  const summary = validateOro9tBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9t");
  }
  return summary;
}

function assertOro9tNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9tBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9t");
  }
  return summary;
}

function buildOro9tFinalizationReviewApprovalBoundaryRecordResult(overrides = {}) {
  return validateOro9tBoundary(buildOro9tFinalizationReviewApprovalBoundaryRecord(overrides));
}

module.exports = {
  ORO_9T_PHASE,
  ORO_9T_SCOPE,
  ORO_9T_STATUS,
  ORO9T_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9S_KEY,
  ORO9S_PASSED_KEY,
  VERIFIED_ORO9S_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS,
  ORO9T_NO_RUNTIME_PROOF_KEYS,
  ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
  ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9tSafetyFlags,
  buildOro9tDependencyChainFromOro9s,
  buildOro9tFinalizationReviewApprovalBoundaryRecord,
  buildOro9tFinalizationReviewApprovalBoundaryRecordResult,
  buildOro9tBoundarySummary,
  evaluateOro9tBoundary,
  validateOro9tBoundary,
  assertOro9tNoRuntimeAuthorization,
  assertOro9tNoLiveExecution,
  assertOro9tNoWalletLedgerMutation,
};
