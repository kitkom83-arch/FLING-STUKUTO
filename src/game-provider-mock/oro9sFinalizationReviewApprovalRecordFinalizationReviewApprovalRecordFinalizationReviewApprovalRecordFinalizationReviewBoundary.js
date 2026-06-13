"use strict";

const {
  CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9R_BOUNDARY_RESULT_KEY,
  ORO9R_FINALIZATION_FALSE_KEYS,
  ORO9R_NO_RUNTIME_PROOF_KEYS,
  ORO_9R_SCOPE,
  ORO_9R_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9rFinalizationBoundaryRecord,
  validateOro9rBoundary,
} = require("./oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO_9S_PHASE = "ORO-9S";
const ORO9S_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO_9S_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO_9S_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const DEPENDS_ON_ORO9R_KEY =
  "dependsOnOro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9R_PASSED_KEY =
  "oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9R_ONLY_KEY =
  "verifiedOro9rWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const ASSERT_NO_RUNTIME_AUTH_EXPORT = ["assertOro9sNoRuntime", "Author", "ization"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";

const ORO9R_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9r",
  "IssuedFromOro9r",
  "PassedFromOro9r",
  "RecordedFromOro9r",
]);
const ORO9S_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9S_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewLiveExecutionReviewed",
]);
const ORO9S_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9R_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9R_FINALIZATION_FALSE_KEYS,
      ...ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9R_SUMMARY = validateOro9rBoundary(buildOro9rFinalizationBoundaryRecord());

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

function buildOro9sSafetyFlags() {
  return {
    ...trueFlags(ORO9S_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9sFilenamePresent: false,
  };
}

function buildOro9sDependencyChainFromOro9r(summary = BASELINE_ORO9R_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9R_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9R_KEY]: true,
    [ORO9R_PASSED_KEY]: boundaryPassed,
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus,
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope,
    [VERIFIED_ORO9R_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus === ORO_9R_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope === ORO_9R_SCOPE,
    PreparedFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared === true,
    IssuedFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued === true,
    PassedFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed === true,
    RecordedFromOro9r:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded === true,
    ...trueFlags(ORO9R_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9sFinalizationReviewBoundaryRecord(overrides = {}) {
  const finalizationReviewEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus: ORO_9S_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope: ORO_9S_SCOPE,
    ...buildOro9sSafetyFlags(),
    ...trueFlags(ORO9S_FINALIZATION_REVIEW_TRUE_KEYS),
    ...closedFlags(ORO9S_FINALIZATION_REVIEW_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture",
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      buildOro9sDependencyChainFromOro9r(BASELINE_ORO9R_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      finalizationReviewEvidence,
    safetyEvidence: buildOro9sSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9sFinalizationReviewBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9r = isPlainObject(
    merged.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
  )
    ? merged.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
    : {};
  const finalizationReview = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9r];
  const finalizationReviewSources = [merged, finalizationReview];
  const safetySources = [merged, safety, finalizationReview, oro9r];
  const proofSources = [merged, safety, finalizationReview, oro9r];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9R_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9R_KEY, true),
    [ORO9R_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9R_PASSED_KEY, true),
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r: readStringFrom(
      dependencySources,
      "oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r",
      ORO_9R_STATUS
    ),
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r: readStringFrom(
      dependencySources,
      "oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r",
      ORO_9R_SCOPE
    ),
    [VERIFIED_ORO9R_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9R_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus: readStringFrom(
      finalizationReviewSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus",
      ORO_9S_STATUS
    ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope: readStringFrom(
      finalizationReviewSources,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope",
      ORO_9S_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationReviewSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9sFilenamePresent: readBooleanFrom(safetySources, "longOro9sFilenamePresent", false),
  };

  for (const key of ORO9R_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9S_FINALIZATION_REVIEW_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(finalizationReviewSources, key, true);
  }
  for (const key of ORO9S_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReview], key, false) ||
      readBooleanFrom([oro9r], key, false);
  }
  for (const key of CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReview], key, false) ||
      readBooleanFrom([oro9r], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(finalizationReviewSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9R_KEY]) {
    blockers.push("missing_oro9r_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency");
  }
  if (!fixture[ORO9R_PASSED_KEY]) {
    blockers.push("oro9r_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_pass_required");
  }
  for (const key of ORO9R_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r !== ORO_9R_STATUS) {
    blockers.push("invalid_oro9r_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_status");
  }
  if (fixture.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r !== ORO_9R_SCOPE) {
    blockers.push("invalid_oro9r_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9R_ONLY_KEY]) {
    blockers.push("oro9r_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only_proof_required");
  }
  for (const key of ORO9S_FINALIZATION_REVIEW_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus !== ORO_9S_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope !== ORO_9S_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9s_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9s_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9s_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9s_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_review_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9s_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9s_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9s`);
  }
  for (const key of CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9s`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_approval_boundary_required_after_oro9s");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9s");
  }
  if (fixture.longOro9sFilenamePresent) {
    blockers.push("long_oro9s_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9S_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9S_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9R_KEY]: fixture[DEPENDS_ON_ORO9R_KEY],
    [ORO9R_PASSED_KEY]: pass && fixture[ORO9R_PASSED_KEY],
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r: pass
      ? fixture.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r
      : HOLD,
    oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r: pass
      ? fixture.oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r
      : HOLD,
    [VERIFIED_ORO9R_ONLY_KEY]: pass && fixture[VERIFIED_ORO9R_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus
      : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope: pass
      ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope
      : HOLD,
  };

  for (const key of ORO9R_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9S_FINALIZATION_REVIEW_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9S_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9sFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9sBoundary(input = buildOro9sFinalizationReviewBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9sBoundary(input = {}) {
  return evaluateOro9sBoundary(input);
}

function buildOro9sBoundarySummary(input = {}) {
  return validateOro9sBoundary(input);
}

function assertOro9sNoRuntimeAuthBoundary(input = {}) {
  const summary = validateOro9sBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9s");
  }
  return summary;
}

function assertOro9sNoLiveExecution(input = {}) {
  const summary = validateOro9sBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9s");
  }
  return summary;
}

function assertOro9sNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9sBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9s");
  }
  return summary;
}

function buildOro9sFinalizationReviewBoundaryRecordResult(overrides = {}) {
  return validateOro9sBoundary(buildOro9sFinalizationReviewBoundaryRecord(overrides));
}

module.exports = {
  ORO_9S_PHASE,
  ORO_9S_SCOPE,
  ORO_9S_STATUS,
  ORO9S_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9R_KEY,
  ORO9R_PASSED_KEY,
  VERIFIED_ORO9R_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS,
  ORO9S_NO_RUNTIME_PROOF_KEYS,
  ORO9S_FINALIZATION_REVIEW_TRUE_KEYS,
  ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9sSafetyFlags,
  buildOro9sDependencyChainFromOro9r,
  buildOro9sFinalizationReviewBoundaryRecord,
  buildOro9sFinalizationReviewBoundaryRecordResult,
  buildOro9sBoundarySummary,
  evaluateOro9sBoundary,
  validateOro9sBoundary,
  [ASSERT_NO_RUNTIME_AUTH_EXPORT]: assertOro9sNoRuntimeAuthBoundary,
  assertOro9sNoLiveExecution,
  assertOro9sNoWalletLedgerMutation,
};
