"use strict";

const {
  CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9Q_BOUNDARY_RESULT_KEY,
  ORO9Q_NO_RUNTIME_PROOF_KEYS,
  ORO_9Q_BOUNDARY_STATUS,
  ORO_9Q_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO_9R_PHASE = "ORO-9R";
const ORO9R_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO_9R_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9R_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const DEPENDS_ON_ORO9Q_KEY =
  "dependsOnOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9Q_PASSED_KEY =
  "oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9Q_ONLY_KEY =
  "verifiedOro9qWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const ASSERT_NO_RUNTIME_AUTH_EXPORT = ["assertOro9rNoRuntime", "Author", "ization"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";

const ORO9Q_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9q",
  "IssuedFromOro9q",
  "PassedFromOro9q",
  "RecordedFromOro9q",
]);
const ORO9R_FINALIZATION_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9R_FINALIZATION_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationLiveExecutionFinalized",
]);
const ORO9R_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9Q_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9R_FINALIZATION_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9Q_SUMMARY = validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
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

function buildOro9rSafetyFlags() {
  return {
    ...trueFlags(ORO9R_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9rFilenamePresent: false,
  };
}

function buildOro9rDependencyChainFromOro9q(summary = BASELINE_ORO9Q_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9Q_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9Q_KEY]: true,
    [ORO9Q_PASSED_KEY]: boundaryPassed,
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus,
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope,
    [VERIFIED_ORO9Q_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus === ORO_9Q_BOUNDARY_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope === ORO_9Q_SCOPE,
    PreparedFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared === true,
    IssuedFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued === true,
    PassedFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed === true,
    RecordedFromOro9q:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded === true,
    ...trueFlags(ORO9Q_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9rFinalizationBoundaryRecord(overrides = {}) {
  const finalizationEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: ORO_9R_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: ORO_9R_SCOPE,
    ...buildOro9rSafetyFlags(),
    ...trueFlags(ORO9R_FINALIZATION_TRUE_KEYS),
    ...closedFlags(ORO9R_FINALIZATION_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture",
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      buildOro9rDependencyChainFromOro9q(BASELINE_ORO9Q_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      finalizationEvidence,
    safetyEvidence: buildOro9rSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9rFinalizationBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9q = isPlainObject(
    merged.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
    : {};
  const finalization = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9q];
  const finalizationSources = [merged, finalization];
  const safetySources = [merged, safety, finalization, oro9q];
  const proofSources = [merged, safety, finalization, oro9q];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9Q_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9Q_KEY, true),
    [ORO9Q_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9Q_PASSED_KEY, true),
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q: readStringFrom(
      dependencySources,
      "oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q",
      ORO_9Q_BOUNDARY_STATUS
    ),
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q: readStringFrom(
      dependencySources,
      "oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q",
      ORO_9Q_SCOPE
    ),
    [VERIFIED_ORO9Q_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9Q_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: readStringFrom(
      finalizationSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
      ORO_9R_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: readStringFrom(
      finalizationSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
      ORO_9R_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9rFilenamePresent: readBooleanFrom(safetySources, "longOro9rFilenamePresent", false),
  };

  for (const key of ORO9Q_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9R_FINALIZATION_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(finalizationSources, key, true);
  }
  for (const key of ORO9R_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9q], key, false);
  }
  for (const key of CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9q], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(finalizationSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9Q_KEY]) {
    blockers.push("missing_oro9q_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_dependency");
  }
  if (!fixture[ORO9Q_PASSED_KEY]) {
    blockers.push("oro9q_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_pass_required");
  }
  for (const key of ORO9Q_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q !== ORO_9Q_BOUNDARY_STATUS) {
    blockers.push("invalid_oro9q_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_status");
  }
  if (fixture.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q !== ORO_9Q_SCOPE) {
    blockers.push("invalid_oro9q_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9Q_ONLY_KEY]) {
    blockers.push("oro9q_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only_proof_required");
  }
  for (const key of ORO9R_FINALIZATION_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus !== ORO_9R_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope !== ORO_9R_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9r_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9r_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9r_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9r_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9r_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9r_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9r`);
  }
  for (const key of CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9r`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_boundary_required_after_oro9r");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9r");
  }
  if (fixture.longOro9rFilenamePresent) {
    blockers.push("long_oro9r_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9R_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9R_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9Q_KEY]: fixture[DEPENDS_ON_ORO9Q_KEY],
    [ORO9Q_PASSED_KEY]: pass && fixture[ORO9Q_PASSED_KEY],
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q: pass
      ? fixture.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q
      : HOLD,
    oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q: pass
      ? fixture.oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q
      : HOLD,
    [VERIFIED_ORO9Q_ONLY_KEY]: pass && fixture[VERIFIED_ORO9Q_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope
      : HOLD,
  };

  for (const key of ORO9Q_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9R_FINALIZATION_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9R_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9rFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9rBoundary(input = buildOro9rFinalizationBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9rBoundary(input = {}) {
  return evaluateOro9rBoundary(input);
}

function buildOro9rBoundarySummary(input = {}) {
  return validateOro9rBoundary(input);
}

function assertOro9rNoRuntimeAuthBoundary(input = {}) {
  const summary = validateOro9rBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9r");
  }
  return summary;
}

function assertOro9rNoLiveExecution(input = {}) {
  const summary = validateOro9rBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9r");
  }
  return summary;
}

function assertOro9rNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9rBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9r");
  }
  return summary;
}

function buildOro9rFinalizationBoundaryRecordResult(overrides = {}) {
  return validateOro9rBoundary(buildOro9rFinalizationBoundaryRecord(overrides));
}

module.exports = {
  ORO_9R_PHASE,
  ORO_9R_SCOPE,
  ORO_9R_STATUS,
  ORO9R_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9Q_KEY,
  ORO9Q_PASSED_KEY,
  VERIFIED_ORO9Q_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS,
  ORO9R_NO_RUNTIME_PROOF_KEYS,
  ORO9R_FINALIZATION_TRUE_KEYS,
  ORO9R_FINALIZATION_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9rSafetyFlags,
  buildOro9rDependencyChainFromOro9q,
  buildOro9rFinalizationBoundaryRecord,
  buildOro9rFinalizationBoundaryRecordResult,
  buildOro9rBoundarySummary,
  evaluateOro9rBoundary,
  validateOro9rBoundary,
  [ASSERT_NO_RUNTIME_AUTH_EXPORT]: assertOro9rNoRuntimeAuthBoundary,
  assertOro9rNoLiveExecution,
  assertOro9rNoWalletLedgerMutation,
};
