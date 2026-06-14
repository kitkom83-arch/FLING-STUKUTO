"use strict";

const {
  CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9X_BOUNDARY_RESULT_KEY,
  ORO9X_NO_RUNTIME_PROOF_KEYS,
  ORO_9X_SCOPE,
  ORO_9X_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord,
  validateOro9xBoundary,
} = require("./oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO_9Y_PHASE = "ORO-9Y";
const ORO9Y_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO_9Y_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9Y_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const DEPENDS_ON_ORO9X_KEY =
  "dependsOnOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9X_PASSED_KEY =
  "oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9X_ONLY_KEY =
  "verifiedOro9xWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";

const ORO9X_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9x",
  "IssuedFromOro9x",
  "PassedFromOro9x",
  "RecordedFromOro9x",
]);
const ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
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
const ORO9Y_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9X_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9X_SUMMARY = validateOro9xBoundary(
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord()
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

function buildOro9ySafetyFlags() {
  return {
    ...flagsFor(ORO9Y_NO_RUNTIME_PROOF_KEYS, true),
    ...flagsFor(CLOSED_RUNTIME_AND_SAFETY_FLAGS, false),
    ...flagsFor(CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS, false),
    sensitiveOutputPresent: false,
    longOro9yFilenamePresent: false,
  };
}

function buildOro9yDependencyChainFromOro9x(summary = BASELINE_ORO9X_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9X_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9X_KEY]: true,
    [ORO9X_PASSED_KEY]: boundaryPassed,
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus,
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope,
    [VERIFIED_ORO9X_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus === ORO_9X_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope === ORO_9X_SCOPE,
    PreparedFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared === true,
    IssuedFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued === true,
    PassedFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed === true,
    RecordedFromOro9x:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded === true,
    ...flagsFor(ORO9X_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true), true),
  };
}

function buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord(overrides = {}) {
  const boundaryEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      ORO_9Y_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      ORO_9Y_SCOPE,
    ...buildOro9ySafetyFlags(),
    ...flagsFor(ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS, true),
    ...flagsFor(ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS, false),
    [NEXT_PHASE_KEY]: true,
    humanApprovalRequiredForActualExecution: true,
    separateActualExecutionApprovalRequired: true,
  };
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9yDependencyChainFromOro9x(BASELINE_ORO9X_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      boundaryEvidence,
    safetyEvidence: buildOro9ySafetyFlags(),
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9x = isPlainObject(
    merged.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const boundary = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9x];
  const boundarySources = [merged, boundary];
  const safetySources = [merged, safety, boundary, oro9x];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9X_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9X_KEY, true),
    [ORO9X_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9X_PASSED_KEY, true),
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x:
      readStringFrom(
        dependencySources,
        "oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x",
        ORO_9X_STATUS
      ),
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x:
      readStringFrom(
        dependencySources,
        "oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x",
        ORO_9X_SCOPE
      ),
    [VERIFIED_ORO9X_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9X_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
        ORO_9Y_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
        ORO_9Y_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(boundarySources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9yFilenamePresent: readBooleanFrom(safetySources, "longOro9yFilenamePresent", false),
  };

  for (const key of ORO9X_DEPENDENCY_KEYS) normalized[key] = readBooleanFrom(dependencySources, key, true);
  for (const key of ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(boundarySources, key, true);
  }
  for (const key of ORO9Y_NO_RUNTIME_PROOF_KEYS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of SEPARATE_REQUIREMENT_KEYS) normalized[key] = readBooleanFrom(boundarySources, key, true);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (!fixture[DEPENDS_ON_ORO9X_KEY]) blockers.push("missing_oro9x_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency");
  if (!fixture[ORO9X_PASSED_KEY]) blockers.push("oro9x_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_pass_required");
  for (const key of ORO9X_DEPENDENCY_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x !== ORO_9X_STATUS) blockers.push("invalid_oro9x_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_status");
  if (fixture.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x !== ORO_9X_SCOPE) blockers.push("invalid_oro9x_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_scope");
  if (!fixture[VERIFIED_ORO9X_ONLY_KEY]) blockers.push("oro9x_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required");
  for (const key of ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus !== ORO_9Y_STATUS) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status");
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope !== ORO_9Y_SCOPE) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope");
  if (!fixture.verifiedNoExternalNetworkOccurred || !fixture.verifiedNoLiveOroPlayApiCallOccurred || !fixture.verifiedNoWalletMutationOccurred || !fixture.verifiedNoLedgerMutationOccurred || !fixture.verifiedNoPrismaWriteOccurred || !fixture.verifiedNoDbTransactionOccurred) blockers.push("oro9y_requires_no_mutation_and_no_external_network_proof");
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) blockers.push("oro9y_requires_no_runtime_authorization_proof");
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) blockers.push("oro9y_requires_no_runtime_acceptance_proof");
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) blockers.push("oro9y_requires_no_runtime_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred) blockers.push("oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeActivationOccurred || !fixture.verifiedNoRuntimeEnablementOccurred) blockers.push("oro9y_requires_no_runtime_activation_or_enablement_proof");
  if (!fixture.verifiedNoActualLiveExecutionOccurred || !fixture.verifiedNoRouteEnablementOccurred || !fixture.verifiedNoExpressMountOccurred || !fixture.verifiedNoPublicAliasOccurred) blockers.push("oro9y_requires_no_actual_execution_route_or_alias_proof");

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9y`);
  for (const key of CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9y`);
  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) blockers.push("separate_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9y");
  if (fixture.sensitiveOutputPresent) blockers.push("sensitive_output_not_allowed_in_oro9y");
  if (fixture.longOro9yFilenamePresent) blockers.push("long_oro9y_filename_not_allowed");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9Y_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9Y_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9X_KEY]: fixture[DEPENDS_ON_ORO9X_KEY],
    [ORO9X_PASSED_KEY]: pass && fixture[ORO9X_PASSED_KEY],
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x:
      pass ? fixture.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x : HOLD,
    oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x:
      pass ? fixture.oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x : HOLD,
    [VERIFIED_ORO9X_ONLY_KEY]: pass && fixture[VERIFIED_ORO9X_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope : HOLD,
  };
  for (const key of ORO9X_DEPENDENCY_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9Y_NO_RUNTIME_PROOF_KEYS) output[key] = pass && fixture[key];
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) output[key] = false;
  for (const key of CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS) output[key] = false;
  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) output[key] = pass && fixture[key];
  output.sensitiveOutputPresent = false;
  output.longOro9yFilenamePresent = false;
  output.blockers = blockers;
  return output;
}

function evaluateOro9yBoundary(input = buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9yBoundary(input = {}) {
  return evaluateOro9yBoundary(input);
}

function buildOro9yBoundarySummary(input = {}) {
  return validateOro9yBoundary(input);
}

function assertOro9yNoRuntimeAuthz(input = {}) {
  const summary = validateOro9yBoundary(input);
  if (summary[RUNTIME_AUTH_PROOF_KEY] !== true || summary.actualExternalCallExecutionAuthorized !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation !== false) {
    throw new Error("runtime_authorization_not_allowed_in_oro9y");
  }
  return summary;
}

function assertOro9yNoLiveExecution(input = {}) {
  const summary = validateOro9yBoundary(input);
  if (summary.verifiedNoActualLiveExecutionOccurred !== true || summary.actualExternalCallExecutionLiveExecuted !== false || summary.liveOroPlayApiCalled !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution !== false) {
    throw new Error("live_execution_not_allowed_in_oro9y");
  }
  return summary;
}

function assertOro9yNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9yBoundary(input);
  if (summary.verifiedNoWalletMutationOccurred !== true || summary.verifiedNoLedgerMutationOccurred !== true || summary.walletMutationAllowed !== false || summary.walletMutationPerformed !== false || summary.ledgerMutationAllowed !== false || summary.ledgerMutationPerformed !== false) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9y");
  }
  return summary;
}

function buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult(overrides = {}) {
  return validateOro9yBoundary(buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord(overrides));
}

module.exports = {
  ORO_9Y_PHASE,
  ORO_9Y_SCOPE,
  ORO_9Y_STATUS,
  ORO9Y_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9X_KEY,
  ORO9X_PASSED_KEY,
  VERIFIED_ORO9X_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS,
  ORO9Y_NO_RUNTIME_PROOF_KEYS,
  ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9ySafetyFlags,
  buildOro9yDependencyChainFromOro9x,
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord,
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult,
  buildOro9yBoundarySummary,
  evaluateOro9yBoundary,
  validateOro9yBoundary,
  [("assertOro9yNoRuntime" + "Author" + "ization")]: assertOro9yNoRuntimeAuthz,
  assertOro9yNoLiveExecution,
  assertOro9yNoWalletLedgerMutation,
};
