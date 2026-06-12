"use strict";

const {
  CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
  PASS: ORO8W_PASS,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
} = require("./oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary");

const ORO8X_PHASE = "ORO-8X";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only";
const ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_only";
const ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS =
  ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS;

const CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationApplied",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForRuntime",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRuntimeFinalized",
]);

const ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION =
  Object.freeze({
    PHASE: ORO8X_PHASE,
    PASS,
    HOLD,
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
    ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
    ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  });

const BASELINE_ORO8W_SUMMARY =
  validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
    buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary()
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

function readBoolean(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  return fallback;
}

function readString(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) {
    return source[key];
  }
  return fallback;
}

function closedRuntimeFlags() {
  return CLOSED_RUNTIME_AND_SAFETY_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function closedActualExecutionFlags() {
  return CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8wEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8W_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryResult ===
      ORO8W_PASS;

  return {
    dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
      true,
    oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope,
    verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus ===
        ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope ===
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied ===
        false,
    verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      summary.verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly === true,
    verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      summary.verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly === true,
    verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly:
      summary.verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
      summary.actualLiveExecutionFinalExecutionArchived === false &&
      summary.actualLiveExecutionFinalExecutionAudited === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecorded === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewed === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApproved === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied ===
        false &&
      summary.actualLiveExecutionExecuted === false,
    verifiedNoRuntimeActivationOccurred:
      summary.verifiedNoRuntimeActivationOccurred === true &&
      summary.actualExternalCallExecutionActivated === false,
    verifiedNoRuntimeEnablementOccurred:
      summary.verifiedNoRuntimeEnablementOccurred === true &&
      summary.actualExternalCallExecutionRuntimeEnabled === false &&
      summary.actualExternalCallExecutionEnabled === false,
    verifiedNoRuntimeAuthorizationOccurred:
      summary.verifiedNoRuntimeAuthorizationOccurred === true &&
      summary.actualExternalCallExecutionAuthorized === false,
    verifiedNoExternalNetworkOccurred:
      summary.verifiedNoExternalNetworkOccurred === true &&
      summary.externalNetworkAllowed === false &&
      summary.externalNetworkCalled === false,
    verifiedNoLiveOroPlayApiCallOccurred:
      summary.verifiedNoLiveOroPlayApiCallOccurred === true &&
      summary.liveOroPlayApiCallAllowed === false &&
      summary.liveOroPlayApiCalled === false,
    verifiedNoWalletMutationOccurred:
      summary.verifiedNoWalletMutationOccurred === true &&
      summary.walletMutationAllowed === false &&
      summary.walletMutationPerformed === false,
    verifiedNoLedgerMutationOccurred:
      summary.verifiedNoLedgerMutationOccurred === true &&
      summary.ledgerMutationAllowed === false &&
      summary.ledgerMutationPerformed === false,
    verifiedNoPrismaWriteOccurred:
      summary.verifiedNoPrismaWriteOccurred === true &&
      summary.prismaWriteAllowed === false &&
      summary.prismaWritePerformed === false,
    verifiedNoDbTransactionOccurred:
      summary.verifiedNoDbTransactionOccurred === true &&
      summary.dbTransactionAllowed === false &&
      summary.dbTransactionPerformed === false,
    verifiedNoRouteEnablementOccurred:
      summary.verifiedNoRouteEnablementOccurred === true &&
      summary.routeEnablementAllowed === false,
    verifiedNoExpressMountOccurred:
      summary.verifiedNoExpressMountOccurred === true &&
      summary.expressMountAllowed === false,
    verifiedNoPublicAliasOccurred:
      summary.verifiedNoPublicAliasOccurred === true &&
      summary.publicAliasAllowed === false &&
      summary.apiBalanceAliasAllowed === false &&
      summary.apiTransactionAliasAllowed === false &&
      summary.apiOroplayBalanceRouteAllowed === false &&
      summary.apiOroplayTransactionRouteAllowed === false,
  };
}

function buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture",
    oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
      buildOro8wEvidenceFromSummary(BASELINE_ORO8W_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus:
          ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope:
          ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
        ...closedRuntimeFlags(),
        ...closedActualExecutionFlags(),
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary:
          true,
        humanApprovalRequiredForActualExecution: true,
        separateActualExecutionApprovalRequired: true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
          true,
      },
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
    buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary();
  const merged = deepMerge(baseline, source);
  const oro8w = isPlainObject(
    merged.oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence
    : {};
  const finalization = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
      readBoolean(
        oro8w,
        "dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary",
        true
      ),
    oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed:
      readBoolean(
        oro8w,
        "oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w:
      readBoolean(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w:
      readBoolean(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w:
      readBoolean(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w:
      readBoolean(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w:
      readString(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w",
        ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w:
      readString(
        oro8w,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w",
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared:
      readBoolean(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued:
      readBoolean(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed:
      readBoolean(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded:
      readBoolean(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus:
      readString(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus",
        ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope:
      readString(
        finalization,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope",
        ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
      ),
    verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly: readBoolean(
      oro8w,
      "verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
      true
    ),
    verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      readBoolean(
        oro8w,
        "verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
        true
      ),
    verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      readBoolean(
        oro8w,
        "verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
        true
      ),
    verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly: readBoolean(
      oro8w,
      "verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      finalization,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8w, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      finalization,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8w, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      finalization,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8w, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      finalization,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8w, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      finalization,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8w, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      finalization,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8w, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      finalization,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8w, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      finalization,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8w, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      finalization,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8w, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      finalization,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8w, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      finalization,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8w, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      finalization,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8w, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      finalization,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8w, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary:
      readBoolean(
        finalization,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      finalization,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      finalization,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBoolean(
        finalization,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
      readBoolean(
        finalization,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
      readBoolean(
        finalization,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
        true
      ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(finalization, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(finalization, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary
  ) {
    blockers.push(
      "missing_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_dependency"
    );
  }
  if (
    !fixture.oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed
  ) {
    blockers.push(
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w
  ) {
    blockers.push(
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w
  ) {
    blockers.push(
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w
  ) {
    blockers.push(
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w
  ) {
    blockers.push(
      "oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w !==
    ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w !==
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_oro8w_actual_live_execution_final_execution_completion_record_review_approval_record_scope"
    );
  }
  if (!fixture.verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly) {
    blockers.push(
      "oro8w_completion_record_review_approval_record_boundary_only_proof_required"
    );
  }
  if (!fixture.verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro8w_must_confirm_oro8v_completion_record_review_approval_boundary_only"
    );
  }
  if (!fixture.verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly) {
    blockers.push("oro8w_must_confirm_oro8u_completion_record_review_boundary_only");
  }
  if (!fixture.verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro8w_must_confirm_oro8t_completion_record_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_issuance_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus !==
    ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope !==
    ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_scope"
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
      "approval_record_finalization_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("approval_record_finalization_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "approval_record_finalization_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8x`);
  }
  for (const key of CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8x`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_boundary_required_after_oro8x"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8x");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8X_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryResult:
      result,
    dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
      fixture.dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
    oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed:
      pass &&
      fixture.oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope
        : HOLD,
    verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      pass && fixture.verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      pass &&
      fixture.verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      pass && fixture.verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly,
    verifiedNoActualLiveExecutionOccurred:
      pass && fixture.verifiedNoActualLiveExecutionOccurred,
    verifiedNoRuntimeActivationOccurred:
      pass && fixture.verifiedNoRuntimeActivationOccurred,
    verifiedNoRuntimeEnablementOccurred:
      pass && fixture.verifiedNoRuntimeEnablementOccurred,
    verifiedNoRuntimeAuthorizationOccurred:
      pass && fixture.verifiedNoRuntimeAuthorizationOccurred,
    verifiedNoExternalNetworkOccurred: pass && fixture.verifiedNoExternalNetworkOccurred,
    verifiedNoLiveOroPlayApiCallOccurred:
      pass && fixture.verifiedNoLiveOroPlayApiCallOccurred,
    verifiedNoWalletMutationOccurred: pass && fixture.verifiedNoWalletMutationOccurred,
    verifiedNoLedgerMutationOccurred: pass && fixture.verifiedNoLedgerMutationOccurred,
    verifiedNoPrismaWriteOccurred: pass && fixture.verifiedNoPrismaWriteOccurred,
    verifiedNoDbTransactionOccurred: pass && fixture.verifiedNoDbTransactionOccurred,
    verifiedNoRouteEnablementOccurred:
      pass && fixture.verifiedNoRouteEnablementOccurred,
    verifiedNoExpressMountOccurred: pass && fixture.verifiedNoExpressMountOccurred,
    verifiedNoPublicAliasOccurred: pass && fixture.verifiedNoPublicAliasOccurred,
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    output[key] = false;
  }
  for (const key of CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
  input =
    buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function runOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySummary(
  input = {}
) {
  return evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
    input
  );
}

module.exports = {
  ORO8X_PHASE,
  ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO8X_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  ORO_8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  ORO8X_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8X_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  evaluateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  validateOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  runOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundarySummary,
};
