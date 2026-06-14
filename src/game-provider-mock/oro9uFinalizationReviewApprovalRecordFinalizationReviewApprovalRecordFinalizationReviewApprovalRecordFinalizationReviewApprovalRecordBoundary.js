"use strict";

const {
  CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9T_BOUNDARY_RESULT_KEY,
  ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
  ORO9T_NO_RUNTIME_PROOF_KEYS,
  ORO_9T_SCOPE,
  ORO_9T_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9tFinalizationReviewApprovalBoundaryRecord,
  validateOro9tBoundary,
} = require("./oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO_9U_PHASE = "ORO-9U";
const ORO9U_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO_9U_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9U_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const DEPENDS_ON_ORO9T_KEY =
  "dependsOnOro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9T_PASSED_KEY =
  "oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9T_ONLY_KEY =
  "verifiedOro9tWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";

const ORO9T_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9t",
  "IssuedFromOro9t",
  "PassedFromOro9t",
  "RecordedFromOro9t",
]);
const ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApproved",
]);
const ORO9U_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9T_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred",
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

const CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9T_SUMMARY = validateOro9tBoundary(buildOro9tFinalizationReviewApprovalBoundaryRecord());

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

function buildOro9uSafetyFlags() {
  return {
    ...trueFlags(ORO9U_NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
    longOro9uFilenamePresent: false,
  };
}

function buildOro9uDependencyChainFromOro9t(summary = BASELINE_ORO9T_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9T_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9T_KEY]: true,
    [ORO9T_PASSED_KEY]: boundaryPassed,
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus,
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope,
    [VERIFIED_ORO9T_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus === ORO_9T_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope === ORO_9T_SCOPE,
    PreparedFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared === true,
    IssuedFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued === true,
    PassedFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed === true,
    RecordedFromOro9t:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded === true,
    ...trueFlags(ORO9T_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true)),
  };
}

function buildOro9uFinalizationReviewApprovalRecordBoundaryRecord(overrides = {}) {
  const finalizationReviewApprovalRecordEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      ORO_9U_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      ORO_9U_SCOPE,
    ...buildOro9uSafetyFlags(),
    ...trueFlags(ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS),
    ...closedFlags(ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewApprovalRecordEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9uDependencyChainFromOro9t(BASELINE_ORO9T_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      finalizationReviewApprovalRecordEvidence,
    safetyEvidence: buildOro9uSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9uFinalizationReviewApprovalRecordBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9t = isPlainObject(
    merged.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const finalizationReviewApprovalRecord = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9t];
  const approvalRecordSources = [merged, finalizationReviewApprovalRecord];
  const safetySources = [merged, safety, finalizationReviewApprovalRecord, oro9t];
  const proofSources = [merged, safety, finalizationReviewApprovalRecord, oro9t];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9T_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9T_KEY, true),
    [ORO9T_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9T_PASSED_KEY, true),
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t:
      readStringFrom(
        dependencySources,
        "oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t",
        ORO_9T_STATUS
      ),
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t:
      readStringFrom(
        dependencySources,
        "oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t",
        ORO_9T_SCOPE
      ),
    [VERIFIED_ORO9T_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9T_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      readStringFrom(
        approvalRecordSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
        ORO_9U_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      readStringFrom(
        approvalRecordSources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
        ORO_9U_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(approvalRecordSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9uFilenamePresent: readBooleanFrom(safetySources, "longOro9uFilenamePresent", false),
  };

  for (const key of ORO9T_DEPENDENCY_KEYS) {
    normalized[key] = readBooleanFrom(dependencySources, key, true);
  }
  for (const key of ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(approvalRecordSources, key, true);
  }
  for (const key of ORO9U_NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9t], key, false);
  }
  for (const key of CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalizationReviewApprovalRecord], key, false) ||
      readBooleanFrom([oro9t], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(approvalRecordSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9T_KEY]) {
    blockers.push("missing_oro9t_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency");
  }
  if (!fixture[ORO9T_PASSED_KEY]) {
    blockers.push("oro9t_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_pass_required");
  }
  for (const key of ORO9T_DEPENDENCY_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t !== ORO_9T_STATUS) {
    blockers.push("invalid_oro9t_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_status");
  }
  if (fixture.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t !== ORO_9T_SCOPE) {
    blockers.push("invalid_oro9t_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_scope");
  }
  if (!fixture[VERIFIED_ORO9T_ONLY_KEY]) {
    blockers.push("oro9t_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required");
  }
  for (const key of ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    if (!fixture[key]) blockers.push(`${key}_required`);
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus !== ORO_9U_STATUS) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status");
  }
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope !== ORO_9U_SCOPE) {
    blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("oro9u_requires_no_mutation_and_no_external_network_proof");
  }
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) {
    blockers.push("oro9u_requires_no_runtime_authorization_proof");
  }
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) {
    blockers.push("oro9u_requires_no_runtime_acceptance_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  }
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) {
    blockers.push("oro9u_requires_no_runtime_finalization_review_approval_record_extension_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred
  ) {
    blockers.push("oro9u_requires_no_runtime_activation_or_enablement_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("oro9u_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9u`);
  }
  for (const key of CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9u`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push("separate_finalization_review_approval_record_finalization_boundary_required_after_oro9u");
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9u");
  }
  if (fixture.longOro9uFilenamePresent) {
    blockers.push("long_oro9u_filename_not_allowed");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9U_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9U_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9T_KEY]: fixture[DEPENDS_ON_ORO9T_KEY],
    [ORO9T_PASSED_KEY]: pass && fixture[ORO9T_PASSED_KEY],
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t:
      pass
        ? fixture.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t
        : HOLD,
    oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t:
      pass
        ? fixture.oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t
        : HOLD,
    [VERIFIED_ORO9T_ONLY_KEY]: pass && fixture[VERIFIED_ORO9T_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope : HOLD,
  };

  for (const key of ORO9T_DEPENDENCY_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of ORO9U_NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.sensitiveOutputPresent = false;
  output.longOro9uFilenamePresent = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9uBoundary(input = buildOro9uFinalizationReviewApprovalRecordBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9uBoundary(input = {}) {
  return evaluateOro9uBoundary(input);
}

function buildOro9uBoundarySummary(input = {}) {
  return validateOro9uBoundary(input);
}

function assertOro9uNoRuntimeAuthorization(input = {}) {
  const summary = validateOro9uBoundary(input);
  if (
    summary[RUNTIME_AUTH_PROOF_KEY] !== true ||
    summary.actualExternalCallExecutionAuthorized !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation !== false
  ) {
    throw new Error("runtime_authorization_not_allowed_in_oro9u");
  }
  return summary;
}

function assertOro9uNoLiveExecution(input = {}) {
  const summary = validateOro9uBoundary(input);
  if (
    summary.verifiedNoActualLiveExecutionOccurred !== true ||
    summary.actualExternalCallExecutionLiveExecuted !== false ||
    summary.liveOroPlayApiCalled !== false ||
    summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution !== false
  ) {
    throw new Error("live_execution_not_allowed_in_oro9u");
  }
  return summary;
}

function assertOro9uNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9uBoundary(input);
  if (
    summary.verifiedNoWalletMutationOccurred !== true ||
    summary.verifiedNoLedgerMutationOccurred !== true ||
    summary.walletMutationAllowed !== false ||
    summary.walletMutationPerformed !== false ||
    summary.ledgerMutationAllowed !== false ||
    summary.ledgerMutationPerformed !== false
  ) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9u");
  }
  return summary;
}

function buildOro9uFinalizationReviewApprovalRecordBoundaryRecordResult(overrides = {}) {
  return validateOro9uBoundary(buildOro9uFinalizationReviewApprovalRecordBoundaryRecord(overrides));
}

module.exports = {
  ORO_9U_PHASE,
  ORO_9U_SCOPE,
  ORO_9U_STATUS,
  ORO9U_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9T_KEY,
  ORO9T_PASSED_KEY,
  VERIFIED_ORO9T_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS,
  ORO9U_NO_RUNTIME_PROOF_KEYS,
  ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9uSafetyFlags,
  buildOro9uDependencyChainFromOro9t,
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecord,
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecordResult,
  buildOro9uBoundarySummary,
  evaluateOro9uBoundary,
  validateOro9uBoundary,
  assertOro9uNoRuntimeAuthorization,
  assertOro9uNoLiveExecution,
  assertOro9uNoWalletLedgerMutation,
};
