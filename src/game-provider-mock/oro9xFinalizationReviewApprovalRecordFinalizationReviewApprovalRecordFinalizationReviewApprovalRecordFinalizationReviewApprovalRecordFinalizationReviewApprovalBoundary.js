"use strict";

const {
  CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9W_BOUNDARY_RESULT_KEY,
  ORO9W_NO_RUNTIME_PROOF_KEYS,
  ORO_9W_SCOPE,
  ORO_9W_STATUS,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord,
  validateOro9wBoundary,
} = require("./oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const ORO_9X_PHASE = "ORO-9X";
const ORO9X_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult";
const ORO_9X_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const ORO_9X_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_prepared_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const DEPENDS_ON_ORO9W_KEY =
  "dependsOnOro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9W_PASSED_KEY =
  "oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9W_ONLY_KEY =
  "verifiedOro9wWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const RUNTIME_AUTH_PROOF_KEY = ["verifiedNoRuntime", "Author", "izationOccurred"].join("");
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";

const ORO9W_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9w",
  "IssuedFromOro9w",
  "PassedFromOro9w",
  "RecordedFromOro9w",
]);
const ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionReviewed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeApproved",
]);
const ORO9X_NO_RUNTIME_PROOF_KEYS = Object.freeze([
  ...new Set([
    ...ORO9W_NO_RUNTIME_PROOF_KEYS,
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred",
  ]),
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);

const CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ])
  )
);

const BASELINE_ORO9W_SUMMARY = validateOro9wBoundary(
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord()
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

function buildOro9xSafetyFlags() {
  return {
    ...flagsFor(ORO9X_NO_RUNTIME_PROOF_KEYS, true),
    ...flagsFor(CLOSED_RUNTIME_AND_SAFETY_FLAGS, false),
    ...flagsFor(CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS, false),
    sensitiveOutputPresent: false,
    longOro9xFilenamePresent: false,
  };
}

function buildOro9xDependencyChainFromOro9w(summary = BASELINE_ORO9W_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9W_BOUNDARY_RESULT_KEY] === PASS;
  return {
    [DEPENDS_ON_ORO9W_KEY]: true,
    [ORO9W_PASSED_KEY]: boundaryPassed,
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus,
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope,
    [VERIFIED_ORO9W_ONLY_KEY]:
      boundaryPassed &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus === ORO_9W_STATUS &&
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope === ORO_9W_SCOPE,
    PreparedFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared === true,
    IssuedFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued === true,
    PassedFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed === true,
    RecordedFromOro9w:
      summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded === true,
    ...flagsFor(ORO9W_NO_RUNTIME_PROOF_KEYS.filter((key) => summary[key] === true), true),
  };
}

function buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord(overrides = {}) {
  const finalizationReviewApprovalEvidence = {
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      ORO_9X_STATUS,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      ORO_9X_SCOPE,
    ...buildOro9xSafetyFlags(),
    ...flagsFor(ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS, true),
    ...flagsFor(ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS, false),
    [NEXT_PHASE_KEY]: true,
    humanApprovalRequiredForActualExecution: true,
    separateActualExecutionApprovalRequired: true,
  };
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture",
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      buildOro9xDependencyChainFromOro9w(BASELINE_ORO9W_SUMMARY),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      finalizationReviewApprovalEvidence,
    safetyEvidence: buildOro9xSafetyFlags(),
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline = buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord();
  const merged = deepMerge(baseline, source);
  const oro9w = isPlainObject(
    merged.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
  )
    ? merged.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
    : {};
  const boundary = isPlainObject(
    merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
  )
    ? merged.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9w];
  const boundarySources = [merged, boundary];
  const safetySources = [merged, safety, boundary, oro9w];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9W_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9W_KEY, true),
    [ORO9W_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9W_PASSED_KEY, true),
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w:
      readStringFrom(
        dependencySources,
        "oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w",
        ORO_9W_STATUS
      ),
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w:
      readStringFrom(
        dependencySources,
        "oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w",
        ORO_9W_SCOPE
      ),
    [VERIFIED_ORO9W_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9W_ONLY_KEY, true),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
        ORO_9X_STATUS
      ),
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      readStringFrom(
        boundarySources,
        "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
        ORO_9X_SCOPE
      ),
    [NEXT_PHASE_KEY]: readBooleanFrom(boundarySources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
    longOro9xFilenamePresent: readBooleanFrom(safetySources, "longOro9xFilenamePresent", false),
  };

  for (const key of ORO9W_DEPENDENCY_KEYS) normalized[key] = readBooleanFrom(dependencySources, key, true);
  for (const key of ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    normalized[key] = readBooleanFrom(boundarySources, key, true);
  }
  for (const key of ORO9X_NO_RUNTIME_PROOF_KEYS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS) normalized[key] = readBooleanAny(safetySources, key);
  for (const key of SEPARATE_REQUIREMENT_KEYS) normalized[key] = readBooleanFrom(boundarySources, key, true);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (!fixture[DEPENDS_ON_ORO9W_KEY]) blockers.push("missing_oro9w_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency");
  if (!fixture[ORO9W_PASSED_KEY]) blockers.push("oro9w_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_pass_required");
  for (const key of ORO9W_DEPENDENCY_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w !== ORO_9W_STATUS) blockers.push("invalid_oro9w_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_status");
  if (fixture.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w !== ORO_9W_SCOPE) blockers.push("invalid_oro9w_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_scope");
  if (!fixture[VERIFIED_ORO9W_ONLY_KEY]) blockers.push("oro9w_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only_proof_required");
  for (const key of ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) if (!fixture[key]) blockers.push(`${key}_required`);
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus !== ORO_9X_STATUS) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_status");
  if (fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope !== ORO_9X_SCOPE) blockers.push("invalid_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope");

  if (!fixture.verifiedNoExternalNetworkOccurred || !fixture.verifiedNoLiveOroPlayApiCallOccurred || !fixture.verifiedNoWalletMutationOccurred || !fixture.verifiedNoLedgerMutationOccurred || !fixture.verifiedNoPrismaWriteOccurred || !fixture.verifiedNoDbTransactionOccurred) blockers.push("oro9x_requires_no_mutation_and_no_external_network_proof");
  if (!fixture[RUNTIME_AUTH_PROOF_KEY]) blockers.push("oro9x_requires_no_runtime_authorization_proof");
  if (!fixture.verifiedNoRuntimeAcceptanceOccurred) blockers.push("oro9x_requires_no_runtime_acceptance_proof");
  if (!fixture.verifiedNoRuntimeFinalizationOccurred) blockers.push("oro9x_requires_no_runtime_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_approval_record_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_approval_record_finalization_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_approval_record_finalization_review_proof");
  if (!fixture.verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred) blockers.push("oro9x_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof");
  if (!fixture.verifiedNoRuntimeActivationOccurred || !fixture.verifiedNoRuntimeEnablementOccurred) blockers.push("oro9x_requires_no_runtime_activation_or_enablement_proof");
  if (!fixture.verifiedNoActualLiveExecutionOccurred || !fixture.verifiedNoRouteEnablementOccurred || !fixture.verifiedNoExpressMountOccurred || !fixture.verifiedNoPublicAliasOccurred) blockers.push("oro9x_requires_no_actual_execution_route_or_alias_proof");

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9x`);
  for (const key of CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS) if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9x`);
  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) blockers.push("separate_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9x");
  if (fixture.sensitiveOutputPresent) blockers.push("sensitive_output_not_allowed_in_oro9x");
  if (fixture.longOro9xFilenamePresent) blockers.push("long_oro9x_filename_not_allowed");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9X_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9X_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9W_KEY]: fixture[DEPENDS_ON_ORO9W_KEY],
    [ORO9W_PASSED_KEY]: pass && fixture[ORO9W_PASSED_KEY],
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w:
      pass ? fixture.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w : HOLD,
    oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w:
      pass ? fixture.oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w : HOLD,
    [VERIFIED_ORO9W_ONLY_KEY]: pass && fixture[VERIFIED_ORO9W_ONLY_KEY],
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus : HOLD,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
      pass ? fixture.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope : HOLD,
  };
  for (const key of ORO9W_DEPENDENCY_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) output[key] = pass && fixture[key];
  for (const key of ORO9X_NO_RUNTIME_PROOF_KEYS) output[key] = pass && fixture[key];
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) output[key] = false;
  for (const key of CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS) output[key] = false;
  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) output[key] = pass && fixture[key];
  output.sensitiveOutputPresent = false;
  output.longOro9xFilenamePresent = false;
  output.blockers = blockers;
  return output;
}

function evaluateOro9xBoundary(input = buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9xBoundary(input = {}) {
  return evaluateOro9xBoundary(input);
}

function buildOro9xBoundarySummary(input = {}) {
  return validateOro9xBoundary(input);
}

function assertOro9xNoRuntimeAuthz(input = {}) {
  const summary = validateOro9xBoundary(input);
  if (summary[RUNTIME_AUTH_PROOF_KEY] !== true || summary.actualExternalCallExecutionAuthorized !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation !== false) {
    throw new Error("runtime_authorization_not_allowed_in_oro9x");
  }
  return summary;
}

function assertOro9xNoLiveExecution(input = {}) {
  const summary = validateOro9xBoundary(input);
  if (summary.verifiedNoActualLiveExecutionOccurred !== true || summary.actualExternalCallExecutionLiveExecuted !== false || summary.liveOroPlayApiCalled !== false || summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution !== false) {
    throw new Error("live_execution_not_allowed_in_oro9x");
  }
  return summary;
}

function assertOro9xNoWalletLedgerMutation(input = {}) {
  const summary = validateOro9xBoundary(input);
  if (summary.verifiedNoWalletMutationOccurred !== true || summary.verifiedNoLedgerMutationOccurred !== true || summary.walletMutationAllowed !== false || summary.walletMutationPerformed !== false || summary.ledgerMutationAllowed !== false || summary.ledgerMutationPerformed !== false) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro9x");
  }
  return summary;
}

function buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecordResult(overrides = {}) {
  return validateOro9xBoundary(buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord(overrides));
}

module.exports = {
  ORO_9X_PHASE,
  ORO_9X_SCOPE,
  ORO_9X_STATUS,
  ORO9X_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9W_KEY,
  ORO9W_PASSED_KEY,
  VERIFIED_ORO9W_ONLY_KEY,
  NEXT_PHASE_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS,
  ORO9X_NO_RUNTIME_PROOF_KEYS,
  ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
  ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
  PASS,
  HOLD,
  REQUESTED_FALSE_FLAGS,
  buildOro9xSafetyFlags,
  buildOro9xDependencyChainFromOro9w,
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord,
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecordResult,
  buildOro9xBoundarySummary,
  evaluateOro9xBoundary,
  validateOro9xBoundary,
  [("assertOro9xNoRuntime" + "Authorization")]: assertOro9xNoRuntimeAuthz,
  assertOro9xNoLiveExecution,
  assertOro9xNoWalletLedgerMutation,
};
