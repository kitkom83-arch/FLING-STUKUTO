"use strict";

const {
  CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
  ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
  PASS: ORO8V_PASS,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
} = require("./oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary");

const ORO8W_PHASE = "ORO-8W";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only";
const ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS =
  "completion_record_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_only";
const ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS =
  ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS;

const CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForRuntime",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForLiveExecution",
]);

const ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD =
  Object.freeze({
    PHASE: ORO8W_PHASE,
    PASS,
    HOLD,
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
    ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
  });

const BASELINE_ORO8V_SUMMARY =
  validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
    buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary()
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
  return CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8vEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8V_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryResult ===
      ORO8V_PASS;

  return {
    dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
      true,
    oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope,
    verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus ===
        ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope ===
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApproved === false,
    verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      summary.verifiedOro8uWasCompletionRecordReviewBoundaryOnly === true,
    verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly:
      summary.verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly === true,
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

function buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture",
    oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
      buildOro8vEvidenceFromSummary(BASELINE_ORO8V_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared:
        true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued:
        true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed:
        true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded:
        true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus:
        ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope:
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
        true,
      separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
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
    buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro8v = isPlainObject(
    merged.oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence
  )
    ? merged.oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence
    : {};
  const approvalRecord = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
      readBoolean(
        oro8v,
        "dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary",
        true
      ),
    oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed:
      readBoolean(
        oro8v,
        "oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v:
      readBoolean(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v:
      readBoolean(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v:
      readBoolean(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v:
      readBoolean(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v:
      readString(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v",
        ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v:
      readString(
        oro8v,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v",
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared:
      readBoolean(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued:
      readBoolean(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed:
      readBoolean(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded:
      readBoolean(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus:
      readString(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus",
        ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope:
      readString(
        approvalRecord,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope",
        ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
      ),
    verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly: readBoolean(
      oro8v,
      "verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
      true
    ),
    verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      readBoolean(
        oro8v,
        "verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
        true
      ),
    verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly: readBoolean(
      oro8v,
      "verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      approvalRecord,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8v, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      approvalRecord,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8v, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      approvalRecord,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8v, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      approvalRecord,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8v, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      approvalRecord,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8v, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      approvalRecord,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8v, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      approvalRecord,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8v, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      approvalRecord,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8v, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      approvalRecord,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8v, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      approvalRecord,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8v, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      approvalRecord,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8v, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      approvalRecord,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8v, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      approvalRecord,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8v, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary:
      readBoolean(
        approvalRecord,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      approvalRecord,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      approvalRecord,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBoolean(
        approvalRecord,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
      readBoolean(
        approvalRecord,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
        true
      ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(approvalRecord, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(approvalRecord, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary
  ) {
    blockers.push(
      "missing_oro8v_actual_live_execution_final_execution_completion_record_review_approval_boundary_dependency"
    );
  }
  if (
    !fixture.oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed
  ) {
    blockers.push(
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_boundary_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v
  ) {
    blockers.push(
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v
  ) {
    blockers.push(
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v
  ) {
    blockers.push(
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v
  ) {
    blockers.push(
      "oro8v_actual_live_execution_final_execution_completion_record_review_approval_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v !==
    ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS
  ) {
    blockers.push(
      "invalid_oro8v_actual_live_execution_final_execution_completion_record_review_approval_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v !==
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
  ) {
    blockers.push(
      "invalid_oro8v_actual_live_execution_final_execution_completion_record_review_approval_scope"
    );
  }
  if (!fixture.verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro8v_completion_record_review_approval_boundary_only_proof_required"
    );
  }
  if (!fixture.verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly) {
    blockers.push("oro8v_must_confirm_oro8u_completion_record_review_boundary_only");
  }
  if (!fixture.verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro8v_must_confirm_oro8t_completion_record_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_issuance_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus !==
    ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope !==
    ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_scope"
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
      "completion_record_review_approval_record_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("completion_record_review_approval_record_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "completion_record_review_approval_record_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8w`);
  }
  for (const key of CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8w`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_boundary_required_after_oro8w"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8w");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8W_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryResult:
      result,
    dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
      fixture.dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
    oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed:
      pass &&
      fixture.oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope
        : HOLD,
    verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      pass && fixture.verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      pass && fixture.verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
  for (const key of CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary;
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
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
  input =
    buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
  input = {}
) {
  return evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
    input
  );
}

function runOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
  input = {}
) {
  return validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
    input
  );
}

function buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySummary(
  input = {}
) {
  return evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
    input
  );
}

module.exports = {
  ORO8W_PHASE,
  ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO8W_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
  ORO_8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_STATUS,
  ORO8W_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8W_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  evaluateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  validateOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  runOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundarySummary,
};
