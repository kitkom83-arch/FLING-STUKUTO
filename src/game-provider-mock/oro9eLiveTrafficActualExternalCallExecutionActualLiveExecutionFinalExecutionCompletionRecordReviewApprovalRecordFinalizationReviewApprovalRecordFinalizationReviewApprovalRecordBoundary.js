"use strict";

const {
  CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
  ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
  PASS: ORO9D_PASS,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO9E_PHASE = "ORO-9E";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9D_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApproval";
const ORO9E_PREFIX = `${ORO9D_PREFIX}Record`;
const ORO9D_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult";
const ORO9E_BOUNDARY_RESULT_KEY =
  "liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult";
const ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS =
  ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS;
const DEPENDS_ON_ORO9D_KEY =
  "dependsOnOro9dActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9D_PASSED_KEY =
  "oro9dActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9D_ONLY_KEY =
  "verifiedOro9dWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const NEW_SEPARATE_APPROVAL_RECORD_REQUIREMENT_KEY =
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRequired";

const ORO9D_FROM_KEYS = Object.freeze([
  ["PreparedFromOro9d", "Prepared"],
  ["IssuedFromOro9d", "Issued"],
  ["PassedFromOro9d", "Passed"],
  ["RecordedFromOro9d", "Recorded"],
]);

const ORO9E_RECORD_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);

const CHAIN_PROOF_KEYS = Object.freeze([
  [
    "verifiedOro9dConfirmedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
    "verifiedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9cConfirmedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
    "verifiedOro9cConfirmedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
    "verifiedOro9cConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
    "verifiedOro9cConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
    "verifiedOro9cConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
    "verifiedOro9cConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
    "verifiedOro9cConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
  ],
  [
    "verifiedOro9dConfirmedOro8tWasCompletionRecordBoundaryOnly",
    "verifiedOro9cConfirmedOro8tWasCompletionRecordBoundaryOnly",
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
  NEW_SEPARATE_APPROVAL_RECORD_REQUIREMENT_KEY,
]);

const CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO9D_ACTUAL_EXECUTION_FLAGS,
  `${ORO9E_PREFIX}Applied`,
  `${ORO9E_PREFIX}AcceptedForRuntime`,
  `${ORO9E_PREFIX}AcceptedForLiveExecution`,
  `${ORO9E_PREFIX}RuntimeApplied`,
]);

const ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD =
  Object.freeze({
    PHASE: ORO9E_PHASE,
    PASS,
    HOLD,
    ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
    ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
    ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
  });

const BASELINE_ORO9D_SUMMARY =
  validateOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary()
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
  return closedFlags(CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS);
}

function buildOro9dEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO9D_PASS && summary[ORO9D_BOUNDARY_RESULT_KEY] === ORO9D_PASS;

  const evidence = {
    [DEPENDS_ON_ORO9D_KEY]: true,
    [ORO9D_PASSED_KEY]: boundaryPassed,
    [`${ORO9D_PREFIX}StatusFromOro9d`]: summary[`${ORO9D_PREFIX}Status`],
    [`${ORO9D_PREFIX}ScopeFromOro9d`]: summary[`${ORO9D_PREFIX}Scope`],
    [VERIFIED_ORO9D_ONLY_KEY]:
      boundaryPassed &&
      summary[`${ORO9D_PREFIX}Status`] ===
        ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS &&
      summary[`${ORO9D_PREFIX}Scope`] ===
        ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE &&
      summary[`${ORO9D_PREFIX}Applied`] === false &&
      summary[`${ORO9D_PREFIX}AcceptedForRuntime`] === false &&
      summary[`${ORO9D_PREFIX}AcceptedForLiveExecution`] === false &&
      summary[`${ORO9D_PREFIX}RuntimeApplied`] === false,
  };

  for (const [fromKey, sourceKey] of ORO9D_FROM_KEYS) {
    evidence[`${ORO9D_PREFIX}${fromKey}`] = summary[`${ORO9D_PREFIX}${sourceKey}`] === true;
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

function buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  overrides = {}
) {
  const recordEvidence = {
    [`${ORO9E_PREFIX}Status`]:
      ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
    [`${ORO9E_PREFIX}Scope`]:
      ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
    ...closedRuntimeFlags(),
    ...closedActualExecutionFlags(),
    [NEXT_PHASE_KEY]: true,
  };
  for (const key of ORO9E_RECORD_KEYS) {
    recordEvidence[`${ORO9E_PREFIX}${key}`] = true;
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    recordEvidence[key] = true;
  }

  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro9dActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro9dEvidenceFromSummary(BASELINE_ORO9D_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      recordEvidence,
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
    buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro9d = isPlainObject(
    merged.oro9dActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro9dActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const record = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9d];
  const recordSources = [merged, record];
  const safetySources = [merged, safety, record];
  const proofSources = [merged, oro9d, record, safety];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    [DEPENDS_ON_ORO9D_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9D_KEY, true),
    [ORO9D_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9D_PASSED_KEY, true),
    [`${ORO9D_PREFIX}StatusFromOro9d`]: readStringFrom(
      dependencySources,
      `${ORO9D_PREFIX}StatusFromOro9d`,
      ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
    ),
    [`${ORO9D_PREFIX}ScopeFromOro9d`]: readStringFrom(
      dependencySources,
      `${ORO9D_PREFIX}ScopeFromOro9d`,
      ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
    ),
    [VERIFIED_ORO9D_ONLY_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9D_ONLY_KEY, true),
    [`${ORO9E_PREFIX}Status`]: readStringFrom(
      recordSources,
      `${ORO9E_PREFIX}Status`,
      ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
    ),
    [`${ORO9E_PREFIX}Scope`]: readStringFrom(
      recordSources,
      `${ORO9E_PREFIX}Scope`,
      ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
    ),
    [NEXT_PHASE_KEY]: readBooleanFrom(recordSources, NEXT_PHASE_KEY, true),
    secretsLeaked: readBooleanFrom(safetySources, "secretsLeaked", false),
  };

  for (const [fromKey] of ORO9D_FROM_KEYS) {
    normalized[`${ORO9D_PREFIX}${fromKey}`] = readBooleanFrom(
      dependencySources,
      `${ORO9D_PREFIX}${fromKey}`,
      true
    );
  }
  for (const key of ORO9E_RECORD_KEYS) {
    normalized[`${ORO9E_PREFIX}${key}`] = readBooleanFrom(
      recordSources,
      `${ORO9E_PREFIX}${key}`,
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
      readBooleanFrom([record], key, false) ||
      readBooleanFrom([oro9d], key, false);
  }
  for (const key of CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([record], key, false) ||
      readBooleanFrom([oro9d], key, false);
  }
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    normalized[key] = readBooleanFrom(recordSources, key, true);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture[DEPENDS_ON_ORO9D_KEY]) {
    blockers.push(
      "missing_oro9d_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency"
    );
  }
  if (!fixture[ORO9D_PASSED_KEY]) {
    blockers.push(
      "oro9d_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_pass_required"
    );
  }
  for (const [fromKey] of ORO9D_FROM_KEYS) {
    if (!fixture[`${ORO9D_PREFIX}${fromKey}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_${fromKey
          .replace("FromOro9d", "")
          .toLowerCase()}_from_oro9d_required`
      );
    }
  }
  if (
    fixture[`${ORO9D_PREFIX}StatusFromOro9d`] !==
    ORO_9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
  ) {
    blockers.push(
      "invalid_oro9d_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_status"
    );
  }
  if (
    fixture[`${ORO9D_PREFIX}ScopeFromOro9d`] !==
    ORO9D_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
  ) {
    blockers.push(
      "invalid_oro9d_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_scope"
    );
  }
  if (!fixture[VERIFIED_ORO9D_ONLY_KEY]) {
    blockers.push(
      "oro9d_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_only_proof_required"
    );
  }
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    if (!fixture[targetKey]) {
      blockers.push(`${targetKey}_required`);
    }
  }

  for (const key of ORO9E_RECORD_KEYS) {
    if (!fixture[`${ORO9E_PREFIX}${key}`]) {
      blockers.push(
        `actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_${key.toLowerCase()}_required`
      );
    }
  }
  if (
    fixture[`${ORO9E_PREFIX}Status`] !==
    ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_status"
    );
  }
  if (
    fixture[`${ORO9E_PREFIX}Scope`] !==
    ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_scope"
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
      "finalization_review_approval_record_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("finalization_review_approval_record_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9e`);
  }
  for (const key of CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9e`);
  }

  if (!fixture[NEXT_PHASE_KEY] || SEPARATE_REQUIREMENT_KEYS.some((key) => !fixture[key])) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_required_after_oro9e"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9e");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9E_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO9E_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9D_KEY]: fixture[DEPENDS_ON_ORO9D_KEY],
    [ORO9D_PASSED_KEY]: pass && fixture[ORO9D_PASSED_KEY],
  };

  for (const [fromKey] of ORO9D_FROM_KEYS) {
    output[`${ORO9D_PREFIX}${fromKey}`] = pass && fixture[`${ORO9D_PREFIX}${fromKey}`];
  }
  output[`${ORO9D_PREFIX}StatusFromOro9d`] = pass
    ? fixture[`${ORO9D_PREFIX}StatusFromOro9d`]
    : HOLD;
  output[`${ORO9D_PREFIX}ScopeFromOro9d`] = pass
    ? fixture[`${ORO9D_PREFIX}ScopeFromOro9d`]
    : HOLD;

  for (const key of ORO9E_RECORD_KEYS) {
    output[`${ORO9E_PREFIX}${key}`] = pass && fixture[`${ORO9E_PREFIX}${key}`];
  }
  output[`${ORO9E_PREFIX}Status`] = pass ? fixture[`${ORO9E_PREFIX}Status`] : HOLD;
  output[`${ORO9E_PREFIX}Scope`] = pass ? fixture[`${ORO9E_PREFIX}Scope`] : HOLD;

  output[VERIFIED_ORO9D_ONLY_KEY] = pass && fixture[VERIFIED_ORO9D_ONLY_KEY];
  for (const [targetKey] of CHAIN_PROOF_KEYS) {
    output[targetKey] = pass && fixture[targetKey];
  }
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    output[key] = pass && fixture[key];
  }
  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS) {
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

function evaluateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input =
    buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return evaluateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

function runOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return validateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

function buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(
  input = {}
) {
  return evaluateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

module.exports = {
  ORO9E_PHASE,
  ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO9E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
  ORO_9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
  ORO9E_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9E_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  evaluateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  runOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
};
