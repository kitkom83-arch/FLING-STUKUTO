"use strict";

const {
  CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9U_BOUNDARY_RESULT_KEY,
  ORO9U_NO_RUNTIME_PROOF_KEYS,
  ORO_9U_SCOPE,
  ORO_9U_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecord,
  validateOro9uBoundary,
} = require("./oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO_9V_PHASE = "ORO-9V";
const ORO9V_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO_9V_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9V_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const DEPENDS_ON_ORO9U_KEY =
  "dependsOnOro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9U_PASSED_KEY =
  "oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9U_ONLY_KEY =
  "verifiedOro9uWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";

const ORO9U_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9u",
  "IssuedFromOro9u",
  "PassedFromOro9u",
  "RecordedFromOro9u",
]);
const ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeApproved",
]);
const ORO9V_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9U_NO_RUNTIME_PROOF_KEYS,
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

const CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9U_SUMMARY = validateOro9uBoundary(buildOro9uFinalizationReviewApprovalRecordBoundaryRecord());

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

function buildOro9vSafetyFlags() {
  return {
    ...trueFlags(ORO9V_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9vFilenamePresent: false,
  };
}

function buildOro9vDependencyChainFromOro9u(summary = BASELINE_ORO9U_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9U_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9U_KEY]: true,
    [ORO9U_PASSED_KEY]: boundaryPassed,
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus,
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope,
    [VERIFIED_ORO9U_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus === ORO_9U_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope === ORO_9U_SCOPE,
    PreparedFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared === true,
    IssuedFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued === true,
    PassedFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed === true,
    RecordedFromOro9u:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded === true,
    ...trueFlags(ORO9U_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord(overrides = {}) {
  const finalizationReviewApprovalRecordFinalizationEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
      ORO_9V_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
      ORO_9V_SCOPE,
    ...buildOro9vSafetyFlags(),
    ...trueFlags(ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS),
    ...closedFlags(ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalRecordFinalizationEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture",
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      buildOro9vDependencyChainFromOro9u(BASELINE_ORO9U_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      finalizationReviewApprovalRecordFinalizationEvidence,
    safetyEvidence: buildOro9vSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9u = isPlainObject(
    merged.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
    : {};
  const finalization = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9u];
  const finalizationSources = [merged, finalization];
  const safetySources = [merged, safety, finalization, oro9u];
  const proofSources = [merged, safety, finalization, oro9u];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9U_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9U_KEY, true),
    [ORO9U_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9U_PASSED_KEY, true),
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u:
      readStringFrom(
        dependencySources,
        "oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u",
        ORO_9U_STATUS
      ),
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u:
      readStringFrom(
        dependencySources,
        "oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u",
        ORO_9U_SCOPE
      ),
    [VERIFIED_ORO9U_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9U_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
      readStringFrom(
        finalizationSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
        ORO_9V_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
      readStringFrom(
        finalizationSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
        ORO_9V_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9vFilenamePresent: readBooleanFrom(safetySources, "longOro9vFilenamePresent", false),
  };

  for (const key of ORO9U_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(finalizationSources, key, true);
  }
  for (const key of ORO9V_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9u], key, false);
  }
  for (const key of CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9u], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(finalizationSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9U_KEY]) {
    blockers.push("missing_oro9u_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_dependency");
  }
  if (!fixture[ORO9U_PASSED_KEY]) {
    blockers.push("oro9u_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_pass_required");
  }
  for (const key of ORO9U_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u !== ORO_9U_STATUS) {
    blockers.push("invalid_oro9u_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_status");
  }
  if (fixture.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u !== ORO_9U_SCOPE) {
    blockers.push("invalid_oro9u_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9U_ONLY_KEY]) {
    blockers.push("oro9u_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only_proof_required");
  }
  for (const key of ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus !== ORO_9V_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope !== ORO_9V_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9v_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9v_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9v_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9v_requires_no_runtime_finalization_review_approval_record_finalization_extension_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9v_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9v_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9v`);
  }
  for (const key of CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9v`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_approval_record_finalization_review_boundary_required_after_oro9v");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9v");
  }
  if (fixture.longOro9vFilenamePresent) {
    blockers.push("long_oro9v_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9V_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9V_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9U_KEY]: fixture[DEPENDS_ON_ORO9U_KEY],
    [ORO9U_PASSED_KEY]: pass && fixture[ORO9U_PASSED_KEY],
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u:
      pass
        ? fixture.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u
        : HOLD,
    oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u:
      pass
        ? fixture.oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u
        : HOLD,
    [VERIFIED_ORO9U_ONLY_KEY]: pass && fixture[VERIFIED_ORO9U_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope : HOLD,
  };

  for (const key of ORO9U_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9V_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9vFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9vBoundary(input = buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9vBoundary(input = {}) {
  return evaluateOro9vBoundary(input);
}

function buildOro9vBoundarySummary(input = {}) {
  return validateOro9vBoundary(input);
}

function assertOro9vNoRuntimeAuthorization(input = {}) {
  const summary = validateOro9vBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9v");
  }
  return summary;
}

function assertOro9vNoLiveExecution(input = {}) {
  const summary = validateOro9vBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9v");
  }
  return summary;
}

function assertOro9vNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9vBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9v");
  }
  return summary;
}

function buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult(overrides = {}) {
  return validateOro9vBoundary(buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord(overrides));
}

module.exports = {
  ORO_9V_PHASE,
  ORO_9V_SCOPE,
  ORO_9V_STATUS,
  ORO9V_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9U_KEY,
  ORO9U_PASSED_KEY,
  VERIFIED_ORO9U_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS,
  ORO9V_NO_RUNTIME_PROOF_KEYS,
  ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS,
  ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9vSafetyFlags,
  buildOro9vDependencyChainFromOro9u,
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult,
  buildOro9vBoundarySummary,
  evaluateOro9vBoundary,
  validateOro9vBoundary,
  assertOro9vNoRuntimeAuthorization,
  assertOro9vNoLiveExecution,
  assertOro9vNoWalletLedgerMutation,
};
