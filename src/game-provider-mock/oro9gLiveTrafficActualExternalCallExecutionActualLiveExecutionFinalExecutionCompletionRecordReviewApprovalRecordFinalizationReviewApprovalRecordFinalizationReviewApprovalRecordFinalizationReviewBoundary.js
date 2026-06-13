"use strict";

const {
  CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  PASS,
  buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = require("./oro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO_9G_PHASE = "ORO-9G";
const ORO9F_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalization";
const ORO9G_PREFIX = `${ORO9F_PREFIX}Review`;
const ORO9F_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO9G_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO_9G_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO_9G_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const DEPENDS_ON_ORO9F_KEY =
  "dependsOnOro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9F_PASSED_KEY =
  "oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9F_ONLY_KEY =
  "verifiedOro9fWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";

const ORO9F_FROM_KEYS = Object.freeze([
  ["PreparedFromOro9f", "Prepared"],
  ["IssuedFromOro9f", "Issued"],
  ["PassedFromOro9f", "Passed"],
  ["RecordedFromOro9f", "Recorded"],
]);
const ORO9G_REVIEW_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);

const CHAIN_PROOF_KEYS = Object.freeze([
  [
    "verifiedOro9fConfirmedOro9eWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9eWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro9dWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9eConfirmedOro9dWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
    "verifiedOro9eConfirmedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9eConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9eConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9eConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9eConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9eConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9eConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9eConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
  ],
  [
    "verifiedOro9fConfirmedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro9eConfirmedOro8tWasCompletionRecordBoundaryOnly",
  ],
]);

const NO_RUNTIME_PROOF_KEYS = Object.freeze([
  "verifiedNoActualLiveExecutionOccurred",
  "verifiedNoRuntimeActivationOccurred",
  "verifiedNoRuntimeEnablementOccurred",
  "verifiedNoRuntimeAuthorizationOccurred",
  "verifiedNoExternalNetworkOccurred",
  "verifiedNoLiveOroPlayApiCallOccurred",
  "verifiedNoWalletMutationOccurred",
  "verifiedNoLedgerMutationOccurred",
  "verifiedNoPrismaWriteOccurred",
  "verifiedNoDbTransactionOccurred",
  "verifiedNoRouteEnablementOccurred",
  "verifiedNoExpressMountOccurred",
  "verifiedNoPublicAliasOccurred",
]);

const REQUESTED_FALSE_FLAGS = Object.freeze([
  "actualExternalCallExecutionRuntimeEnabled",
  "actualExternalCallExecutionActivated",
  "actualExternalCallExecutionEnabled",
  "actualExternalCallExecutionAuthorized",
  "actualExternalCallExecutionLiveExecutionApproved",
  "actualExternalCallExecutionLiveExecuted",
  "externalNetworkAllowed",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCalled",
  "walletMutationAllowed",
  "walletMutationPerformed",
  "ledgerMutationAllowed",
  "ledgerMutationPerformed",
  "prismaWriteAllowed",
  "prismaWritePerformed",
  "dbTransactionAllowed",
  "dbTransactionPerformed",
  "migrationAllowed",
  "migrationPerformed",
  "deployAllowed",
  "deployPerformed",
  "routeEnablementAllowed",
  "expressMountAllowed",
  "publicAliasAllowed",
  "apiBalanceAliasAllowed",
  "apiTransactionAliasAllowed",
  "apiOroplayBalanceRouteAllowed",
  "apiOroplayTransactionRouteAllowed",
]);

const ORO9G_REVIEW_CLOSED_FLAGS = Object.freeze([
  `${ORO9G_PREFIX}Applied`,
  `${ORO9G_PREFIX}AcceptedForRuntime`,
  `${ORO9G_PREFIX}AcceptedForLiveExecution`,
  `${ORO9G_PREFIX}RuntimeApplied`,
  `${ORO9G_PREFIX}RuntimeAccepted`,
  `${ORO9G_PREFIX}LiveExecutionAccepted`,
  `${ORO9G_PREFIX}ActualExecutionApproved`,
]);

const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired",
]);

const CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS = Object.freeze(
  Array.from(
    new Set([
      ...CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS,
      ...REQUESTED_FALSE_FLAGS,
      ...ORO9G_REVIEW_CLOSED_FLAGS,
    ])
  )
);

const BASELINE_ORO9F_SUMMARY =
  validateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
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

function buildOro9gSafetyFlags() {
  return {
    ...trueFlags(NO_RUNTIME_PROOF_KEYS),
    ...closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS),
    ...closedFlags(CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS),
    sensitiveOutputPresent: false,
  };
}

function buildOro9gDependencyChainFromOro9f(summary = BASELINE_ORO9F_SUMMARY) {
  const boundaryPassed = summary.result === PASS && summary[ORO9F_BOUNDARY_RESULT_KEY] === PASS;
  const evidence = {
    [DEPENDS_ON_ORO9F_KEY]: true,
    [ORO9F_PASSED_KEY]: boundaryPassed,
    [`${ORO9F_PREFIX}StatusFromOro9f`]: summary[`${ORO9F_PREFIX}Status`],
    [`${ORO9F_PREFIX}ScopeFromOro9f`]: summary[`${ORO9F_PREFIX}Scope`],
    [VERIFIED_ORO9F_ONLY_KEY]:
      boundaryPassed &&
      summary[`${ORO9F_PREFIX}Status`] ===
        ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS &&
      summary[`${ORO9F_PREFIX}Scope`] ===
        ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE &&
      summary[`${ORO9F_PREFIX}Applied`] === false &&
      summary[`${ORO9F_PREFIX}AcceptedForRuntime`] === false &&
      summary[`${ORO9F_PREFIX}AcceptedForLiveExecution`] === false &&
      summary[`${ORO9F_PREFIX}RuntimeApplied`] === false,
  };

  for (const [fromKey, sourceKey] of ORO9F_FROM_KEYS) {
    evidence[`${ORO9F_PREFIX}${fromKey}`] = summary[`${ORO9F_PREFIX}${sourceKey}`] === true;
  }
  for (const [targetKey, sourceKey] of CHAIN_PROOF_KEYS) {
    evidence[targetKey] = summary[sourceKey] === true;
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    evidence[key] = summary[key] === true;
  }

  return evidence;
}

function buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  overrides = {}
) {
  const finalizationReviewEvidence = {
    [`${ORO9G_PREFIX}Status`]: ORO_9G_BOUNDARY_STATUS,
    [`${ORO9G_PREFIX}Scope`]: ORO_9G_SCOPE,
    ...buildOro9gSafetyFlags(),
    [NEXT_PHASE_KEY]: true,
  };

  for (const key of ORO9G_REVIEW_KEYS) {
    finalizationReviewEvidence[`${ORO9G_PREFIX}${key}`] = true;
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationReviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture",
    oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      buildOro9gDependencyChainFromOro9f(BASELINE_ORO9F_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      finalizationReviewEvidence,
    safetyEvidence: buildOro9gSafetyFlags(),
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary();
  const merged = deepMerge(baseline, source);
  const oro9f = isPlainObject(
    merged.oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
  )
    ? merged.oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
    : {};
  const review = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9f];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review, oro9f];
  const proofSources = [merged, oro9f, review, safety];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9F_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9F_KEY, true),
    [ORO9F_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9F_PASSED_KEY, true),
    [`${ORO9F_PREFIX}StatusFromOro9f`]: readStringFrom(
      dependencySources,
      `${ORO9F_PREFIX}StatusFromOro9f`,
      ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS
    ),
    [`${ORO9F_PREFIX}ScopeFromOro9f`]: readStringFrom(
      dependencySources,
      `${ORO9F_PREFIX}ScopeFromOro9f`,
      ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
    ),
    [VERIFIED_ORO9F_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9F_ONLY_KEY, true),
    [`${ORO9G_PREFIX}Status`]: readStringFrom(
      reviewSources,
      `${ORO9G_PREFIX}Status`,
      ORO_9G_BOUNDARY_STATUS
    ),
    [`${ORO9G_PREFIX}Scope`]: readStringFrom(reviewSources, `${ORO9G_PREFIX}Scope`, ORO_9G_SCOPE),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    sensitiveOutputPresent: readBooleanFrom(safetySources, "sensitiveOutputPresent", false),
  };

  for (const [fromKey] of ORO9F_FROM_KEYS) {
    normalized[`${ORO9F_PREFIX}${fromKey}`] = readBooleanFrom(
      dependencySources,
      `${ORO9F_PREFIX}${fromKey}`,
      true
    );
  }
  for (const key of ORO9G_REVIEW_KEYS) {
    normalized[`${ORO9G_PREFIX}${key}`] = readBooleanFrom(
      reviewSources,
      `${ORO9G_PREFIX}${key}`,
      true
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    normalized[targetKey] = readBooleanFrom(dependencySources, targetKey, true);
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    normalized[key] = readBooleanFrom(proofSources, key, true);
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([review], key, false) ||
      readBooleanFrom([oro9f], key, false);
  }
  for (const key of CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([review], key, false) ||
      readBooleanFrom([oro9f], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(reviewSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9F_KEY]) {
    blockers.push(
      "missing_oro9f_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency"
    );
  }
  if (!fixture[ORO9F_PASSED_KEY]) {
    blockers.push(
      "oro9f_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_pass_required"
    );
  }
  for (const [fromKey] of ORO9F_FROM_KEYS) {
    if (!fixture[`${ORO9F_PREFIX}${fromKey}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_${fromKey
          .replace("FromOro9f", "")
          .toLowerCase()}_from_oro9f_required`
      );
    }
  }
  if (
    fixture[`${ORO9F_PREFIX}StatusFromOro9f`] !==
    ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS
  ) {
    blockers.push(
      "invalid_oro9f_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_status"
    );
  }
  if (
    fixture[`${ORO9F_PREFIX}ScopeFromOro9f`] !==
    ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  ) {
    blockers.push(
      "invalid_oro9f_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_scope"
    );
  }
  if (!fixture[VERIFIED_ORO9F_ONLY_KEY]) {
    blockers.push(
      "oro9f_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only_proof_required"
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    if (!fixture[targetKey]) blockers.push(`${targetKey}_required`);
  }

  for (const key of ORO9G_REVIEW_KEYS) {
    if (!fixture[`${ORO9G_PREFIX}${key}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_${key.toLowerCase()}_required`
      );
    }
  }
  if (fixture[`${ORO9G_PREFIX}Status`] !== ORO_9G_BOUNDARY_STATUS) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_status"
    );
  }
  if (fixture[`${ORO9G_PREFIX}Scope`] !== ORO_9G_SCOPE) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_scope"
    );
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("finalization_review_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("finalization_review_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9g`);
  }
  for (const key of CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9g`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_required_after_oro9g"
    );
  }
  if (fixture.sensitiveOutputPresent) {
    blockers.push("sensitive_output_not_allowed_in_oro9g");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_9G_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9G_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9F_KEY]: fixture[DEPENDS_ON_ORO9F_KEY],
    [ORO9F_PASSED_KEY]: pass && fixture[ORO9F_PASSED_KEY],
  };

  for (const [fromKey] of ORO9F_FROM_KEYS) {
    output[`${ORO9F_PREFIX}${fromKey}`] = pass && fixture[`${ORO9F_PREFIX}${fromKey}`];
  }
  output[`${ORO9F_PREFIX}StatusFromOro9f`] = pass
    ? fixture[`${ORO9F_PREFIX}StatusFromOro9f`]
    : HOLD;
  output[`${ORO9F_PREFIX}ScopeFromOro9f`] = pass
    ? fixture[`${ORO9F_PREFIX}ScopeFromOro9f`]
    : HOLD;

  for (const key of ORO9G_REVIEW_KEYS) {
    output[`${ORO9G_PREFIX}${key}`] = pass && fixture[`${ORO9G_PREFIX}${key}`];
  }
  output[`${ORO9G_PREFIX}Status`] = pass ? fixture[`${ORO9G_PREFIX}Status`] : HOLD;
  output[`${ORO9G_PREFIX}Scope`] = pass ? fixture[`${ORO9G_PREFIX}Scope`] : HOLD;

  output[VERIFIED_ORO9F_ONLY_KEY] = pass && fixture[VERIFIED_ORO9F_ONLY_KEY];
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    output[targetKey] = pass && fixture[targetKey];
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input =
    buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9gFinalizationReviewBoundary(input = {}) {
  return evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    input
  );
}

function buildOro9gFinalizationReviewBoundaryResult(overrides = {}) {
  return validateOro9gFinalizationReviewBoundary(
    buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
      overrides
    )
  );
}

function runOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input = {}
) {
  return validateOro9gFinalizationReviewBoundary(input);
}

function buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(
  input = {}
) {
  return validateOro9gFinalizationReviewBoundary(input);
}

module.exports = {
  ORO_9G_PHASE,
  ORO_9G_SCOPE,
  ORO_9G_BOUNDARY_STATUS,
  ORO9G_BOUNDARY_RESULT_KEY,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS,
  NO_RUNTIME_PROOF_KEYS,
  REQUESTED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro9gSafetyFlags,
  buildOro9gDependencyChainFromOro9f,
  buildOro9gFinalizationReviewBoundaryResult,
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9gFinalizationReviewBoundary,
  runOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
};
