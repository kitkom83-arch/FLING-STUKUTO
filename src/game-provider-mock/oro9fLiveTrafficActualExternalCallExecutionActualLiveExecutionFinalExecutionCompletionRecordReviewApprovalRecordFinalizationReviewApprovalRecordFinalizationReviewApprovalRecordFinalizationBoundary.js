"use strict";

const {
  CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
  PASS: ORO9E_PASS,
  buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO9F_PHASE = "ORO-9F";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9E_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecord";
const ORO9F_PREFIX = `${ORO9E_PREFIX}Finalization`;
const ORO9E_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO9F_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult";
const ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS =
  ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS;
const DEPENDS_ON_ORO9E_KEY =
  "dependsOnOro9eActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9E_PASSED_KEY =
  "oro9eActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9E_ONLY_KEY =
  "verifiedOro9eWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const NEW_SEPARATE_FINALIZATION_REQUIREMENT_KEY =
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired";

const ORO9E_FROM_KEYS = Object.freeze([
  ["PreparedFromOro9e", "Prepared"],
  ["IssuedFromOro9e", "Issued"],
  ["PassedFromOro9e", "Passed"],
  ["RecordedFromOro9e", "Recorded"],
]);

const ORO9F_FINALIZATION_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);

const CHAIN_PROOF_KEYS = Object.freeze([
  [
    "verifiedOro9eConfirmedOro9dWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9dWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
    "verifiedOro9dConfirmedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9dConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9dConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9dConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9dConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9dConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9dConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9dConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
  ],
  [
    "verifiedOro9eConfirmedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro9dConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
  NEW_SEPARATE_FINALIZATION_REQUIREMENT_KEY,
]);

const CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS,
  `${ORO9F_PREFIX}Applied`,
  `${ORO9F_PREFIX}AcceptedForRuntime`,
  `${ORO9F_PREFIX}AcceptedForLiveExecution`,
  `${ORO9F_PREFIX}RuntimeApplied`,
]);

const ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION =
  Object.freeze({
    PHASE: ORO9F_PHASE,
    PASS,
    HOLD,
    ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
    ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
    ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  });

const BASELINE_ORO9E_SUMMARY =
  validateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
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
  return closedFlags(CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS);
}

function buildOro9eEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO9E_PASS && summary[ORO9E_BOUNDARY_RESULT_KEY] === ORO9E_PASS;

  const evidence = {
    [DEPENDS_ON_ORO9E_KEY]: true,
    [ORO9E_PASSED_KEY]: boundaryPassed,
    [`${ORO9E_PREFIX}StatusFromOro9e`]: summary[`${ORO9E_PREFIX}Status`],
    [`${ORO9E_PREFIX}ScopeFromOro9e`]: summary[`${ORO9E_PREFIX}Scope`],
    [VERIFIED_ORO9E_ONLY_KEY]:
      boundaryPassed &&
      summary[`${ORO9E_PREFIX}Status`] ===
        ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS &&
      summary[`${ORO9E_PREFIX}Scope`] ===
        ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE &&
      summary[`${ORO9E_PREFIX}Applied`] === false &&
      summary[`${ORO9E_PREFIX}AcceptedForRuntime`] === false &&
      summary[`${ORO9E_PREFIX}AcceptedForLiveExecution`] === false &&
      summary[`${ORO9E_PREFIX}RuntimeApplied`] === false,
  };

  for (const [fromKey, sourceKey] of ORO9E_FROM_KEYS) {
    evidence[`${ORO9E_PREFIX}${fromKey}`] = summary[`${ORO9E_PREFIX}${sourceKey}`] === true;
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

function buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  overrides = {}
) {
  const finalizationEvidence = {
    [`${ORO9F_PREFIX}Status`]:
      ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
    [`${ORO9F_PREFIX}Scope`]:
      ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
    ...closedRuntimeFlags(),
    ...closedActualExecutionFlags(),
    [NEXT_PHASE_KEY]: true,
  };
  for (const key of ORO9F_FINALIZATION_KEYS) {
    finalizationEvidence[`${ORO9F_PREFIX}${key}`] = true;
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    finalizationEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture",
    oro9eActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      buildOro9eEvidenceFromSummary(BASELINE_ORO9E_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      finalizationEvidence,
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
    buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary();
  const merged = deepMerge(baseline, source);
  const oro9e = isPlainObject(
    merged.oro9eActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro9eActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
    : {};
  const finalization = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9e];
  const finalizationSources = [merged, finalization];
  const safetySources = [merged, safety, finalization];
  const proofSources = [merged, oro9e, finalization, safety];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9E_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9E_KEY, true),
    [ORO9E_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9E_PASSED_KEY, true),
    [`${ORO9E_PREFIX}StatusFromOro9e`]: readStringFrom(
      dependencySources,
      `${ORO9E_PREFIX}StatusFromOro9e`,
      ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS
    ),
    [`${ORO9E_PREFIX}ScopeFromOro9e`]: readStringFrom(
      dependencySources,
      `${ORO9E_PREFIX}ScopeFromOro9e`,
      ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
    ),
    [VERIFIED_ORO9E_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9E_ONLY_KEY, true),
    [`${ORO9F_PREFIX}Status`]: readStringFrom(
      finalizationSources,
      `${ORO9F_PREFIX}Status`,
      ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
    ),
    [`${ORO9F_PREFIX}Scope`]: readStringFrom(
      finalizationSources,
      `${ORO9F_PREFIX}Scope`,
      ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(finalizationSources, NEXT_PHASE_KEY, true),
    secretsLeaked: readBooleanFrom(safetySources, "secretsLeaked", false),
  };

  for (const [fromKey] of ORO9E_FROM_KEYS) {
    normalized[`${ORO9E_PREFIX}${fromKey}`] = readBooleanFrom(
      dependencySources,
      `${ORO9E_PREFIX}${fromKey}`,
      true
    );
  }
  for (const key of ORO9F_FINALIZATION_KEYS) {
    normalized[`${ORO9F_PREFIX}${key}`] = readBooleanFrom(
      finalizationSources,
      `${ORO9F_PREFIX}${key}`,
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
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9e], key, false);
  }
  for (const key of CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9e], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(finalizationSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9E_KEY]) {
    blockers.push(
      "missing_oro9e_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_dependency"
    );
  }
  if (!fixture[ORO9E_PASSED_KEY]) {
    blockers.push(
      "oro9e_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_pass_required"
    );
  }
  for (const [fromKey] of ORO9E_FROM_KEYS) {
    if (!fixture[`${ORO9E_PREFIX}${fromKey}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_${fromKey
          .replace("FromOro9e", "")
          .toLowerCase()}_from_oro9e_required`
      );
    }
  }
  if (
    fixture[`${ORO9E_PREFIX}StatusFromOro9e`] !==
    ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS
  ) {
    blockers.push(
      "invalid_oro9e_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status"
    );
  }
  if (
    fixture[`${ORO9E_PREFIX}ScopeFromOro9e`] !==
    ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_oro9e_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope"
    );
  }
  if (!fixture[VERIFIED_ORO9E_ONLY_KEY]) {
    blockers.push(
      "oro9e_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only_proof_required"
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    if (!fixture[targetKey]) {
      blockers.push(`${targetKey}_required`);
    }
  }

  for (const key of ORO9F_FINALIZATION_KEYS) {
    if (!fixture[`${ORO9F_PREFIX}${key}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_${key.toLowerCase()}_required`
      );
    }
  }
  if (
    fixture[`${ORO9F_PREFIX}Status`] !==
    ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_status"
    );
  }
  if (
    fixture[`${ORO9F_PREFIX}Scope`] !==
    ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_scope"
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
    blockers.push("finalization_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("finalization_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9f`);
  }
  for (const key of CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9f`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_required_after_oro9f"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9f");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9F_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9F_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9E_KEY]: fixture[DEPENDS_ON_ORO9E_KEY],
    [ORO9E_PASSED_KEY]: pass && fixture[ORO9E_PASSED_KEY],
  };

  for (const [fromKey] of ORO9E_FROM_KEYS) {
    output[`${ORO9E_PREFIX}${fromKey}`] = pass && fixture[`${ORO9E_PREFIX}${fromKey}`];
  }
  output[`${ORO9E_PREFIX}StatusFromOro9e`] = pass
    ? fixture[`${ORO9E_PREFIX}StatusFromOro9e`]
    : HOLD;
  output[`${ORO9E_PREFIX}ScopeFromOro9e`] = pass
    ? fixture[`${ORO9E_PREFIX}ScopeFromOro9e`]
    : HOLD;

  for (const key of ORO9F_FINALIZATION_KEYS) {
    output[`${ORO9F_PREFIX}${key}`] = pass && fixture[`${ORO9F_PREFIX}${key}`];
  }
  output[`${ORO9F_PREFIX}Status`] = pass ? fixture[`${ORO9F_PREFIX}Status`] : HOLD;
  output[`${ORO9F_PREFIX}Scope`] = pass ? fixture[`${ORO9F_PREFIX}Scope`] : HOLD;

  output[VERIFIED_ORO9E_ONLY_KEY] = pass && fixture[VERIFIED_ORO9E_ONLY_KEY];
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    output[targetKey] = pass && fixture[targetKey];
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input =
    buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return evaluateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function runOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return validateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(
  input = {}
) {
  return evaluateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

module.exports = {
  ORO9F_PHASE,
  ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  ORO_9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  ORO9F_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9F_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  evaluateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9fLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
};
