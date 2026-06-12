"use strict";

const {
  CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
  ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
  PASS: ORO9C_PASS,
  buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const ORO9D_PHASE = "ORO-9D";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9C_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReview";
const ORO9D_PREFIX = `${ORO9C_PREFIX}Approval`;
const ORO9C_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult";
const ORO9D_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult";
const ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only";
const ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS =
  ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS;
const DEPENDS_ON_ORO9C_KEY =
  "dependsOnOro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9C_PASSED_KEY =
  "oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9C_ONLY_KEY =
  "verifiedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const NEW_SEPARATE_REVIEW_APPROVAL_REQUIREMENT_KEY =
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired";

const ORO9C_FROM_KEYS = Object.freeze([
  ["PreparedFromOro9c", "Prepared"],
  ["IssuedFromOro9c", "Issued"],
  ["PassedFromOro9c", "Passed"],
  ["RecordedFromOro9c", "Recorded"],
]);

const ORO9D_APPROVAL_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);

const CHAIN_PROOF_KEYS = Object.freeze([
  [
    "verifiedOro9cConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9bConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9bConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9bConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9bConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9bConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9bConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
  ],
  [
    "verifiedOro9cConfirmedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro9bConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired",
  NEW_SEPARATE_REVIEW_APPROVAL_REQUIREMENT_KEY,
]);

const CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO9C_ACTUAL_EXECUTION_FLAGS,
  `${ORO9C_PREFIX}Approved`,
  `${ORO9D_PREFIX}Applied`,
  `${ORO9D_PREFIX}AcceptedForRuntime`,
  `${ORO9D_PREFIX}AcceptedForLiveExecution`,
  `${ORO9D_PREFIX}RuntimeApplied`,
]);

const ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL =
  Object.freeze({
    PHASE: ORO9D_PHASE,
    PASS,
    HOLD,
    ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE,
    ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS,
    ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
    ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
  });

const BASELINE_ORO9C_SUMMARY =
  validateOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary()
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
  return closedFlags(CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS);
}

function buildOro9cEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO9C_PASS && summary[ORO9C_BOUNDARY_RESULT_KEY] === ORO9C_PASS;

  const evidence = {
    [DEPENDS_ON_ORO9C_KEY]: true,
    [ORO9C_PASSED_KEY]: boundaryPassed,
    [`${ORO9C_PREFIX}StatusFromOro9c`]: summary[`${ORO9C_PREFIX}Status`],
    [`${ORO9C_PREFIX}ScopeFromOro9c`]: summary[`${ORO9C_PREFIX}Scope`],
    [VERIFIED_ORO9C_ONLY_KEY]:
      boundaryPassed &&
      summary[`${ORO9C_PREFIX}Status`] ===
        ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS &&
      summary[`${ORO9C_PREFIX}Scope`] ===
        ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE &&
      summary[`${ORO9C_PREFIX}Applied`] === false &&
      summary[`${ORO9C_PREFIX}AcceptedForRuntime`] === false &&
      summary[`${ORO9C_PREFIX}AcceptedForLiveExecution`] === false &&
      summary[`${ORO9C_PREFIX}RuntimeApplied`] === false,
  };

  for (const [fromKey, sourceKey] of ORO9C_FROM_KEYS) {
    evidence[`${ORO9C_PREFIX}${fromKey}`] = summary[`${ORO9C_PREFIX}${sourceKey}`] === true;
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

function buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  overrides = {}
) {
  const reviewEvidence = {
    [`${ORO9D_PREFIX}Status`]:
      ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
    [`${ORO9D_PREFIX}Scope`]:
      ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
    ...closedRuntimeFlags(),
    ...closedActualExecutionFlags(),
    [NEXT_PHASE_KEY]: true,
  };
  for (const key of ORO9D_APPROVAL_KEYS) {
    reviewEvidence[`${ORO9D_PREFIX}${key}`] = true;
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    reviewEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture",
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      buildOro9cEvidenceFromSummary(BASELINE_ORO9C_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
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
    buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary();
  const merged = deepMerge(baseline, source);
  const oro9c = isPlainObject(
    merged.oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
  )
    ? merged.oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence
    : {};
  const review = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9c];
  const reviewSources = [merged, review];
  const safetySources = [merged, safety, review];
  const proofSources = [merged, oro9c, review, safety];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9C_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9C_KEY, true),
    [ORO9C_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9C_PASSED_KEY, true),
    [`${ORO9C_PREFIX}StatusFromOro9c`]: readStringFrom(
      dependencySources,
      `${ORO9C_PREFIX}StatusFromOro9c`,
      ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
    ),
    [`${ORO9C_PREFIX}ScopeFromOro9c`]: readStringFrom(
      dependencySources,
      `${ORO9C_PREFIX}ScopeFromOro9c`,
      ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
    ),
    [VERIFIED_ORO9C_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9C_ONLY_KEY, true),
    [`${ORO9D_PREFIX}Status`]: readStringFrom(
      reviewSources,
      `${ORO9D_PREFIX}Status`,
      ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
    ),
    [`${ORO9D_PREFIX}Scope`]: readStringFrom(
      reviewSources,
      `${ORO9D_PREFIX}Scope`,
      ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(reviewSources, NEXT_PHASE_KEY, true),
    secretsLeaked: readBooleanFrom(safetySources, "secretsLeaked", false),
  };

  for (const [fromKey] of ORO9C_FROM_KEYS) {
    normalized[`${ORO9C_PREFIX}${fromKey}`] = readBooleanFrom(
      dependencySources,
      `${ORO9C_PREFIX}${fromKey}`,
      true
    );
  }
  for (const key of ORO9D_APPROVAL_KEYS) {
    normalized[`${ORO9D_PREFIX}${key}`] = readBooleanFrom(
      reviewSources,
      `${ORO9D_PREFIX}${key}`,
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
      readBooleanFrom([oro9c], key, false);
  }
  for (const key of CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([review], key, false) ||
      readBooleanFrom([oro9c], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(reviewSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9C_KEY]) {
    blockers.push(
      "missing_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency"
    );
  }
  if (!fixture[ORO9C_PASSED_KEY]) {
    blockers.push(
      "oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_pass_required"
    );
  }
  for (const [fromKey] of ORO9C_FROM_KEYS) {
    if (!fixture[`${ORO9C_PREFIX}${fromKey}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_${fromKey
          .replace("FromOro9c", "")
          .toLowerCase()}_from_oro9c_required`
      );
    }
  }
  if (
    fixture[`${ORO9C_PREFIX}StatusFromOro9c`] !==
    ORO_9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_STATUS
  ) {
    blockers.push(
      "invalid_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_status"
    );
  }
  if (
    fixture[`${ORO9C_PREFIX}ScopeFromOro9c`] !==
    ORO9C_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_SCOPE
  ) {
    blockers.push(
      "invalid_oro9c_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_scope"
    );
  }
  if (!fixture[VERIFIED_ORO9C_ONLY_KEY]) {
    blockers.push(
      "oro9c_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_only_proof_required"
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    if (!fixture[targetKey]) {
      blockers.push(`${targetKey}_required`);
    }
  }

  for (const key of ORO9D_APPROVAL_KEYS) {
    if (!fixture[`${ORO9D_PREFIX}${key}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_${key.toLowerCase()}_required`
      );
    }
  }
  if (
    fixture[`${ORO9D_PREFIX}Status`] !==
    ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_status"
    );
  }
  if (
    fixture[`${ORO9D_PREFIX}Scope`] !==
    ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope"
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
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9d`);
  }
  for (const key of CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9d`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_required_after_oro9d"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9d");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9D_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9D_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9C_KEY]: fixture[DEPENDS_ON_ORO9C_KEY],
    [ORO9C_PASSED_KEY]: pass && fixture[ORO9C_PASSED_KEY],
  };

  for (const [fromKey] of ORO9C_FROM_KEYS) {
    output[`${ORO9C_PREFIX}${fromKey}`] = pass && fixture[`${ORO9C_PREFIX}${fromKey}`];
  }
  output[`${ORO9C_PREFIX}StatusFromOro9c`] = pass
    ? fixture[`${ORO9C_PREFIX}StatusFromOro9c`]
    : HOLD;
  output[`${ORO9C_PREFIX}ScopeFromOro9c`] = pass
    ? fixture[`${ORO9C_PREFIX}ScopeFromOro9c`]
    : HOLD;

  for (const key of ORO9D_APPROVAL_KEYS) {
    output[`${ORO9D_PREFIX}${key}`] = pass && fixture[`${ORO9D_PREFIX}${key}`];
  }
  output[`${ORO9D_PREFIX}Status`] = pass ? fixture[`${ORO9D_PREFIX}Status`] : HOLD;
  output[`${ORO9D_PREFIX}Scope`] = pass ? fixture[`${ORO9D_PREFIX}Scope`] : HOLD;

  output[VERIFIED_ORO9C_ONLY_KEY] = pass && fixture[VERIFIED_ORO9C_ONLY_KEY];
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    output[targetKey] = pass && fixture[targetKey];
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input =
    buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = {}
) {
  return evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    input
  );
}

function runOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
  input = {}
) {
  return validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    input
  );
}

function buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(
  input = {}
) {
  return evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    input
  );
}

module.exports = {
  ORO9D_PHASE,
  ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
  ORO9D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY_STATUS,
  ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
  ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  evaluateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
};
