"use strict";

const {
  CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  PASS: ORO9B_PASS,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = require("./oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO9C_PHASE = "ORO-9C";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9B_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalization";
const ORO9C_PREFIX = `${ORO9B_PREFIX}Review`;
const ORO9B_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO9C_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO9C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only";
const ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS =
  ORO9C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS;
const DEPENDS_ON_ORO9B_KEY =
  "dependsOnOro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9B_PASSED_KEY =
  "oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9B_ONLY_KEY =
  "verifiedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const NEW_SEPARATE_REVIEW_REQUIREMENT_KEY =
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired";

const ORO9B_FROM_KEYS = Object.freeze([
  ["PreparedFromOro9b", "Prepared"],
  ["IssuedFromOro9b", "Issued"],
  ["PassedFromOro9b", "Passed"],
  ["RecordedFromOro9b", "Recorded"],
]);

const ORO9C_REVIEW_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);

const CHAIN_PROOF_KEYS = Object.freeze([
  [
    "verifiedOro9bConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
  ],
  [
    "verifiedOro9bConfirmedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
  NEW_SEPARATE_REVIEW_REQUIREMENT_KEY,
]);

const CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
  `${ORO9B_PREFIX}Reviewed`,
  `${ORO9C_PREFIX}Applied`,
  `${ORO9C_PREFIX}AcceptedForRuntime`,
  `${ORO9C_PREFIX}AcceptedForLiveExecution`,
  `${ORO9C_PREFIX}RuntimeApplied`,
]);

const ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW =
  Object.freeze({
    PHASE: ORO9C_PHASE,
    PASS,
    HOLD,
    ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
    ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
    ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
    ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
  });

const BASELINE_ORO9B_SUMMARY =
  validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
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

function closedRuntimeFlags() {
  return closedFlags(CLOSED_RUNTIME_AND_SAFETY_FLAGS);
}

function closedActualExecutionFlags() {
  return closedFlags(CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS);
}

function buildOro9bEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO9B_PASS && summary[ORO9B_BOUNDARY_RESULT_KEY] === ORO9B_PASS;

  const evidence = {
    [DEPENDS_ON_ORO9B_KEY]: true,
    [ORO9B_PASSED_KEY]: boundaryPassed,
    [`${ORO9B_PREFIX}StatusFromOro9b`]: summary[`${ORO9B_PREFIX}Status`],
    [`${ORO9B_PREFIX}ScopeFromOro9b`]: summary[`${ORO9B_PREFIX}Scope`],
    [VERIFIED_ORO9B_ONLY_KEY]:
      boundaryPassed &&
      summary[`${ORO9B_PREFIX}Status`] ===
        ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS &&
      summary[`${ORO9B_PREFIX}Scope`] ===
        ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE &&
      summary[`${ORO9B_PREFIX}Applied`] === false &&
      summary[`${ORO9B_PREFIX}AcceptedForRuntime`] === false &&
      summary[`${ORO9B_PREFIX}AcceptedForLiveExecution`] === false &&
      summary[`${ORO9B_PREFIX}RuntimeApplied`] === false,
  };

  for (const [fromKey, sourceKey] of ORO9B_FROM_KEYS) {
    evidence[`${ORO9B_PREFIX}${fromKey}`] = summary[`${ORO9B_PREFIX}${sourceKey}`] === true;
  }
  for (const [targetKey, sourceKey] of CHAIN_PROOF_KEYS) {
    evidence[targetKey] = summary[sourceKey] === true;
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    evidence[key] =
      summary[key] === true &&
      (key !== "verifiedNoActualLiveExecutionOccurred" ||
        (summary.actualExternalCallExecutionLiveExecuted === false &&
          summary.actualLiveExecutionExecuted === false &&
          summary.actualLiveExecutionFinalExecutionExecuted === false)) &&
      (key !== "verifiedNoRuntimeActivationOccurred" ||
        summary.actualExternalCallExecutionActivated === false) &&
      (key !== "verifiedNoRuntimeEnablementOccurred" ||
        (summary.actualExternalCallExecutionRuntimeEnabled === false &&
          summary.actualExternalCallExecutionEnabled === false)) &&
      (key !== "verifiedNoRuntimeAuthorizationOccurred" ||
        summary.actualExternalCallExecutionAuthorized === false) &&
      (key !== "verifiedNoExternalNetworkOccurred" ||
        (summary.externalNetworkAllowed === false && summary.externalNetworkCalled === false)) &&
      (key !== "verifiedNoLiveOroPlayApiCallOccurred" ||
        (summary.liveOroPlayApiCallAllowed === false &&
          summary.liveOroPlayApiCalled === false)) &&
      (key !== "verifiedNoWalletMutationOccurred" ||
        (summary.walletMutationAllowed === false && summary.walletMutationPerformed === false)) &&
      (key !== "verifiedNoLedgerMutationOccurred" ||
        (summary.ledgerMutationAllowed === false && summary.ledgerMutationPerformed === false)) &&
      (key !== "verifiedNoPrismaWriteOccurred" ||
        (summary.prismaWriteAllowed === false && summary.prismaWritePerformed === false)) &&
      (key !== "verifiedNoDbTransactionOccurred" ||
        (summary.dbTransactionAllowed === false && summary.dbTransactionPerformed === false)) &&
      (key !== "verifiedNoRouteEnablementOccurred" ||
        summary.routeEnablementAllowed === false) &&
      (key !== "verifiedNoExpressMountOccurred" || summary.expressMountAllowed === false) &&
      (key !== "verifiedNoPublicAliasOccurred" ||
        (summary.publicAliasAllowed === false &&
          summary.apiBalanceAliasAllowed === false &&
          summary.apiTransactionAliasAllowed === false &&
          summary.apiOroplayBalanceRouteAllowed === false &&
          summary.apiOroplayTransactionRouteAllowed === false));
  }

  return evidence;
}

function buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  overrides = {}
) {
  const reviewEvidence = {
    [`${ORO9C_PREFIX}Status`]:
      ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
    [`${ORO9C_PREFIX}Scope`]:
      ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
    ...closedRuntimeFlags(),
    ...closedActualExecutionFlags(),
    [NEXT_PHASE_KEY]: true,
  };
  for (const key of ORO9C_REVIEW_KEYS) {
    reviewEvidence[`${ORO9C_PREFIX}${key}`] = true;
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    reviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture",
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      buildOro9bEvidenceFromSummary(BASELINE_ORO9B_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      reviewEvidence,
    safetyEvidence: {
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      secretsLeaked: false,
    },
  };

  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary();
  const merged = deepMerge(baseline, source);
  const oro9b = isPlainObject(
    merged.oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
  )
    ? merged.oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence
    : {};
  const review = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9b];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review];
  const proofSources = [merged, oro9b, review, safety];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9B_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9B_KEY, true),
    [ORO9B_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9B_PASSED_KEY, true),
    [`${ORO9B_PREFIX}StatusFromOro9b`]: readStringFrom(
      dependencySources,
      `${ORO9B_PREFIX}StatusFromOro9b`,
      ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
    ),
    [`${ORO9B_PREFIX}ScopeFromOro9b`]: readStringFrom(
      dependencySources,
      `${ORO9B_PREFIX}ScopeFromOro9b`,
      ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
    ),
    [VERIFIED_ORO9B_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9B_ONLY_KEY, true),
    [`${ORO9C_PREFIX}Status`]: readStringFrom(
      reviewSources,
      `${ORO9C_PREFIX}Status`,
      ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
    ),
    [`${ORO9C_PREFIX}Scope`]: readStringFrom(
      reviewSources,
      `${ORO9C_PREFIX}Scope`,
      ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    secretsLeaked: readBooleanFrom(safetySources, "secretsLeaked", false),
  };

  for (const [fromKey] of ORO9B_FROM_KEYS) {
    normalized[`${ORO9B_PREFIX}${fromKey}`] = readBooleanFrom(
      dependencySources,
      `${ORO9B_PREFIX}${fromKey}`,
      true
    );
  }
  for (const key of ORO9C_REVIEW_KEYS) {
    normalized[`${ORO9C_PREFIX}${key}`] = readBooleanFrom(
      reviewSources,
      `${ORO9C_PREFIX}${key}`,
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
      readBooleanFrom([oro9b], key, false);
  }
  for (const key of CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([review], key, false) ||
      readBooleanFrom([oro9b], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(reviewSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9B_KEY]) {
    blockers.push(
      "missing_oro9b_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency"
    );
  }
  if (!fixture[ORO9B_PASSED_KEY]) {
    blockers.push(
      "oro9b_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_pass_required"
    );
  }
  for (const [fromKey] of ORO9B_FROM_KEYS) {
    if (!fixture[`${ORO9B_PREFIX}${fromKey}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_${fromKey
          .replace("FromOro9b", "")
          .toLowerCase()}_from_oro9b_required`
      );
    }
  }
  if (
    fixture[`${ORO9B_PREFIX}StatusFromOro9b`] !==
    ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
  ) {
    blockers.push(
      "invalid_oro9b_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_status"
    );
  }
  if (
    fixture[`${ORO9B_PREFIX}ScopeFromOro9b`] !==
    ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  ) {
    blockers.push(
      "invalid_oro9b_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_scope"
    );
  }
  if (!fixture[VERIFIED_ORO9B_ONLY_KEY]) {
    blockers.push(
      "oro9b_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only_proof_required"
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    if (!fixture[targetKey]) {
      blockers.push(`${targetKey}_required`);
    }
  }

  for (const key of ORO9C_REVIEW_KEYS) {
    if (!fixture[`${ORO9C_PREFIX}${key}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_${key.toLowerCase()}_required`
      );
    }
  }
  if (
    fixture[`${ORO9C_PREFIX}Status`] !==
    ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_status"
    );
  }
  if (
    fixture[`${ORO9C_PREFIX}Scope`] !==
    ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_scope"
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
    blockers.push(
      "finalization_review_requires_no_mutation_and_no_external_network_proof"
    );
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
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9c`);
  }
  for (const key of CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9c`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_required_after_oro9c"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9c");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9C_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9C_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9B_KEY]: fixture[DEPENDS_ON_ORO9B_KEY],
    [ORO9B_PASSED_KEY]: pass && fixture[ORO9B_PASSED_KEY],
  };

  for (const [fromKey] of ORO9B_FROM_KEYS) {
    output[`${ORO9B_PREFIX}${fromKey}`] = pass && fixture[`${ORO9B_PREFIX}${fromKey}`];
  }
  output[`${ORO9B_PREFIX}StatusFromOro9b`] = pass
    ? fixture[`${ORO9B_PREFIX}StatusFromOro9b`]
    : HOLD;
  output[`${ORO9B_PREFIX}ScopeFromOro9b`] = pass
    ? fixture[`${ORO9B_PREFIX}ScopeFromOro9b`]
    : HOLD;

  for (const key of ORO9C_REVIEW_KEYS) {
    output[`${ORO9C_PREFIX}${key}`] = pass && fixture[`${ORO9C_PREFIX}${key}`];
  }
  output[`${ORO9C_PREFIX}Status`] = pass ? fixture[`${ORO9C_PREFIX}Status`] : HOLD;
  output[`${ORO9C_PREFIX}Scope`] = pass ? fixture[`${ORO9C_PREFIX}Scope`] : HOLD;

  output[VERIFIED_ORO9B_ONLY_KEY] = pass && fixture[VERIFIED_ORO9B_ONLY_KEY];
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    output[targetKey] = pass && fixture[targetKey];
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output[NEXT_PHASE_KEY] = pass && fixture[NEXT_PHASE_KEY];
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    output[key] = pass && fixture[key];
  }
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input =
    buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input = {}
) {
  return evaluateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    input
  );
}

function runOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
  input = {}
) {
  return validateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    input
  );
}

function buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(
  input = {}
) {
  return evaluateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    input
  );
}

module.exports = {
  ORO9C_PHASE,
  ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
  ORO9C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY_STATUS,
  ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
  ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  evaluateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  runOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
};
