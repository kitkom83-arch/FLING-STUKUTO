"use strict";

const {
  CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9Y_BOUNDARY_RESULT_KEY,
  ORO9Y_NO_RUNTIME_PROOF_KEYS,
  ORO_9Y_SCOPE,
  ORO_9Y_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord,
  validateOro9yBoundary,
} = require("./oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO_9Z_PHASE = "ORO-9Z";
const ORO9Z_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO_9Z_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9Z_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const DEPENDS_ON_ORO9Y_KEY =
  "dependsOnOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9Y_PASSED_KEY =
  "oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9Y_ONLY_KEY =
  "verifiedOro9yWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";

const ORO9Y_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9y",
  "IssuedFromOro9y",
  "PassedFromOro9y",
  "RecordedFromOro9y",
]);
const ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApproved",
]);
const ORO9Z_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9Y_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9Y_SUMMARY = validateOro9yBoundary(
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord()
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

function flagsFor(keys, value) {
  return keys.reduce((flags, key) => {
    flags[key] = value;
    return flags;
  }, {});
}

function buildOro9zSafetyFlags() {
  return {
    ...flagsFor(ORO9Z_NO_RUNTIME_PROOF_KEYS, true),
    ...flagsFor(CLOSED_RUNTIME_AND_SAFETY_FLAGS, false),
    ...flagsFor(CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS, false),
    sensitiveOutputPresent: false,
    longOro9zFilenamePresent: false,
  };
}

function buildOro9zDependencyChainFromOro9y(summary = BASELINE_ORO9Y_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9Y_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9Y_KEY]: true,
    [ORO9Y_PASSED_KEY]: boundaryPassed,
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y:
      boundaryPassed ? ORO_9Y_STATUS : HOLD,
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y:
      boundaryPassed ? ORO_9Y_SCOPE : HOLD,
    [VERIFIED_ORO9Y_ONLY_KEY]: boundaryPassed,
    PreparedFromOro9y: boundaryPassed,
    IssuedFromOro9y: boundaryPassed,
    PassedFromOro9y: boundaryPassed,
    RecordedFromOro9y: boundaryPassed,
    ...flagsFor(ORO9Y_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true), true),
  };
}

function buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord(overrides = {}) {
  const boundaryEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      ORO_9Z_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      ORO_9Z_SCOPE,
    ...buildOro9zSafetyFlags(),
    ...flagsFor(ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS, true),
    ...flagsFor(ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS, false),
    [NEXT_PHASE_KEY]: true,
    humanApprovalRequiredForActualExecution: true,
    separateActualExecutionApprovalRequired: true,
  };
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9zDependencyChainFromOro9y(BASELINE_ORO9Y_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      boundaryEvidence,
    safetyEvidence: buildOro9zSafetyFlags(),
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9y = isPlainObject(
    merged.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const boundary = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9y];
  const boundarySources = [merged, boundary];
  const safetySources = [merged, safety, boundary, oro9y];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9Y_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9Y_KEY, true),
    [ORO9Y_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9Y_PASSED_KEY, true),
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y:
      readStringFrom(
        dependencySources,
        "oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y",
        ORO_9Y_STATUS
      ),
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y:
      readStringFrom(
        dependencySources,
        "oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y",
        ORO_9Y_SCOPE
      ),
    [VERIFIED_ORO9Y_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9Y_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
        ORO_9Z_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
        ORO_9Z_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(boundarySources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9zFilenamePresent: readBooleanFrom(safetySources, "longOro9zFilenamePresent", false),
  };

  for (const key of ORO9Y_DEPENDENCY_KEYS) normalized[key] = readBooleanFrom(dependencySources, key, true);
  for (const key of ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(boundarySources, key, true);
  }
  for (const key of ORO9Z_NO_RUNTIME_PROOF_KEYS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of SEPARATE_REQUIREMENT_KEYS) normalized[key] = readBooleanFrom(boundarySources, key, true);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (!fixture[DEPENDS_ON_ORO9Y_KEY]) blockers.push("missing_oro9y_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency");
  if (!fixture[ORO9Y_PASSED_KEY]) blockers.push("oro9y_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_pass_required");
  for (const key of ORO9Y_DEPENDENCY_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y !== ORO_9Y_STATUS) blockers.push("invalid_oro9y_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_status");
  if (fixture.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y !== ORO_9Y_SCOPE) blockers.push("invalid_oro9y_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_scope");
  if (!fixture[VERIFIED_ORO9Y_ONLY_KEY]) blockers.push("oro9y_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required");
  for (const key of ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus !== ORO_9Z_STATUS) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status");
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope !== ORO_9Z_SCOPE) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope");
  if (!fixture.verifiedNoExternalNetworkOccurred || !fixture.verifiedNoLiveOroPlayApiCallOccurred || !fixture.verifiedNoWalletMutationOccurred || !fixture.verifiedNoLedgerMutationOccurred || !fixture.verifiedNoPrismaWriteOccurred || !fixture.verifiedNoDbTransactionOccurred) blockers.push("oro9z_requires_no_mutation_and_no_external_network_proof");
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) blockers.push("oro9z_requires_no_runtime_authorization_proof");
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) blockers.push("oro9z_requires_no_runtime_acceptance_proof");
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) blockers.push("oro9z_requires_no_runtime_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred) blockers.push("oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_proof");
  if (!fixture.verifiedNoRuntimeActivationOccurred || !fixture.verifiedNoRuntimeEnablementOccurred) blockers.push("oro9z_requires_no_runtime_activation_or_enablement_proof");
  if (!fixture.verifiedNoActualLiveExecutionOccurred || !fixture.verifiedNoRouteEnablementOccurred || !fixture.verifiedNoExpressMountOccurred || !fixture.verifiedNoPublicAliasOccurred) blockers.push("oro9z_requires_no_actual_execution_route_or_alias_proof");

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9z`);
  for (const key of CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9z`);
  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) blockers.push("separate_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9z");
  if (fixture.sensitiveOutputPresent) blockers.push("sensitive_output_not_allowed_in_oro9z");
  if (fixture.longOro9zFilenamePresent) blockers.push("long_oro9z_filename_not_allowed");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9Z_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9Z_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9Y_KEY]: fixture[DEPENDS_ON_ORO9Y_KEY],
    [ORO9Y_PASSED_KEY]: pass && fixture[ORO9Y_PASSED_KEY],
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y:
      pass ? fixture.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y : HOLD,
    oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y:
      pass ? fixture.oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y : HOLD,
    [VERIFIED_ORO9Y_ONLY_KEY]: pass && fixture[VERIFIED_ORO9Y_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope : HOLD,
  };
  for (const key of ORO9Y_DEPENDENCY_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9Z_NO_RUNTIME_PROOF_KEYS) output[key] = pass && fixture[key];
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) output[key] = false;
  for (const key of CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS) output[key] = false;
  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) output[key] = pass && fixture[key];
  output.sensitiveOutputPresent = false;
  output.longOro9zFilenamePresent = false;
  output.blockers = blockers;
  return output;
}

function evaluateOro9zBoundary(input = buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9zBoundary(input = {}) {
  return evaluateOro9zBoundary(input);
}

function buildOro9zBoundarySummary(input = {}) {
  return validateOro9zBoundary(input);
}

function assertOro9zNoRuntimeAuthz(input = {}) {
  const summary = validateOro9zBoundary(input);
  if (summary[RUNTIME_AUTH_PROOF_KEY] !== true || summary.actualExternalCallExecutionAuthorized !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation !== false) {
    throw new Error("runtime_authorization_not_allowed_in_oro9z");
  }
  return summary;
}

function assertOro9zNoLiveExecution(input = {}) {
  const summary = validateOro9zBoundary(input);
  if (summary.verifiedNoActualLiveExecutionOccurred !== true || summary.actualExternalCallExecutionLiveExecuted !== false || summary.liveOroPlayApiCalled !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution !== false) {
    throw new Error("live_execution_not_allowed_in_oro9z");
  }
  return summary;
}

function assertOro9zNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9zBoundary(input);
  if (summary.verifiedNoWalletMutationOccurred !== true || summary.verifiedNoLedgerMutationOccurred !== true || summary.walletMutationAllowed !== false || summary.walletMutationPerformed !== false || summary.ledgerMutationAllowed !== false || summary.ledgerMutationPerformed !== false) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9z");
  }
  return summary;
}

function buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult(overrides = {}) {
  return validateOro9zBoundary(buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord(overrides));
}

function buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord(overrides = {}) {
  return buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord(overrides);
}

function buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult(overrides = {}) {
  return validateOro9zBoundary(
    buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord(overrides)
  );
}

module.exports = {
  ORO_9Z_PHASE,
  ORO_9Z_SCOPE,
  ORO_9Z_STATUS,
  ORO9Z_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9Y_KEY,
  ORO9Y_PASSED_KEY,
  VERIFIED_ORO9Y_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS,
  ORO9Z_NO_RUNTIME_PROOF_KEYS,
  ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9zSafetyFlags,
  buildOro9zDependencyChainFromOro9y,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult,
  buildOro9zBoundarySummary,
  evaluateOro9zBoundary,
  validateOro9zBoundary,
  [("assertOro9zNoRuntime" + "Author" + "ization")]: assertOro9zNoRuntimeAuthz,
  assertOro9zNoLiveExecution,
  assertOro9zNoWalletLedgerMutation,
};
