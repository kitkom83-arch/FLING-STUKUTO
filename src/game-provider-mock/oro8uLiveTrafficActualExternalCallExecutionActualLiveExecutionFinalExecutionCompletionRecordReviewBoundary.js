"use strict";

const {
  CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
  PASS: ORO8T_PASS,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
} = require("./oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary");

const ORO8U_PHASE = "ORO-8U";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_boundary_only";
const ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS =
  "completion_record_reviewed_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only";

const CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewed",
]);

const ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW =
  Object.freeze({
    PHASE: ORO8U_PHASE,
    PASS,
    HOLD,
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
  });

const BASELINE_ORO8T_SUMMARY =
  validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary()
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
  return CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8tEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8T_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryResult ===
      ORO8T_PASS;

  return {
    dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary: true,
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordPrepared === true,
    actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordIssued === true,
    actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordPassed === true,
    actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordRecorded === true,
    actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordStatus,
    actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t:
      summary.actualLiveExecutionFinalExecutionCompletionRecordScope,
    verifiedOro8tWasCompletionRecordBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordStatus ===
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordScope ===
        ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecorded === false,
    verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly:
      summary.verifiedOro8sWasAuditBoundaryOnly === true,
    verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly:
      summary.verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly === true,
    verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly:
      summary.verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly === true,
    verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      summary.verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly === true,
    verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly:
      summary.verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
      summary.actualLiveExecutionFinalExecutionArchived === false &&
      summary.actualLiveExecutionFinalExecutionAudited === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecorded === false &&
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

function buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture",
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence:
      buildOro8tEvidenceFromSummary(BASELINE_ORO8T_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewIssued: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewPassed: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewStatus:
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
      actualLiveExecutionFinalExecutionCompletionRecordReviewScope:
        ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
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
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary();
  const merged = deepMerge(baseline, source);
  const oro8t = isPlainObject(
    merged.oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence
  )
    ? merged.oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence
    : {};
  const review = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary:
      readBoolean(
        oro8t,
        "dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary",
        true
      ),
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed:
      readBoolean(
        oro8t,
        "oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t:
      readBoolean(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t:
      readBoolean(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t:
      readBoolean(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t:
      readBoolean(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t:
      readString(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t",
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t:
      readString(
        oro8t,
        "actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t",
        ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared:
      readBoolean(
        review,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewIssued: readBoolean(
      review,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewIssued",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewPassed: readBoolean(
      review,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewPassed",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded:
      readBoolean(
        review,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewStatus: readString(
      review,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewStatus",
      ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
    ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewScope: readString(
      review,
      "actualLiveExecutionFinalExecutionCompletionRecordReviewScope",
      ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
    ),
    verifiedOro8tWasCompletionRecordBoundaryOnly: readBoolean(
      oro8t,
      "verifiedOro8tWasCompletionRecordBoundaryOnly",
      true
    ),
    verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly: readBoolean(
      oro8t,
      "verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly",
      true
    ),
    verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly: readBoolean(
      oro8t,
      "verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly",
      true
    ),
    verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly: readBoolean(
      oro8t,
      "verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly",
      true
    ),
    verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      readBoolean(
        oro8t,
        "verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
        true
      ),
    verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly: readBoolean(
      oro8t,
      "verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      review,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8t, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      review,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8t, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      review,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8t, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      review,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8t, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      review,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8t, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      review,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8t, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      review,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8t, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      review,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8t, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      review,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8t, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      review,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8t, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      review,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8t, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      review,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8t, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      review,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8t, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
      readBoolean(
        review,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      review,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      review,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBoolean(
        review,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(review, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(review, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary) {
    blockers.push(
      "missing_oro8t_actual_live_execution_final_execution_completion_record_boundary_dependency"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t) {
    blockers.push(
      "oro8t_actual_live_execution_final_execution_completion_record_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t) {
    blockers.push(
      "oro8t_actual_live_execution_final_execution_completion_record_issuance_required"
    );
  }
  if (!fixture.oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed) {
    blockers.push(
      "oro8t_actual_live_execution_final_execution_completion_record_boundary_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t) {
    blockers.push(
      "oro8t_actual_live_execution_final_execution_completion_record_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t !==
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_oro8t_actual_live_execution_final_execution_completion_record_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t !==
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_oro8t_actual_live_execution_final_execution_completion_record_scope"
    );
  }
  if (!fixture.verifiedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro8t_completion_record_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly) {
    blockers.push("oro8t_must_confirm_oro8s_audit_boundary_only");
  }
  if (!fixture.verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly) {
    blockers.push("oro8t_must_confirm_oro8r_archive_boundary_only");
  }
  if (!fixture.verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly) {
    blockers.push("oro8t_must_confirm_oro8q_closeout_boundary_only");
  }
  if (!fixture.verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly) {
    blockers.push("oro8t_must_confirm_oro8p_post_execution_verification_boundary_only");
  }
  if (!fixture.verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly) {
    blockers.push("oro8t_must_confirm_oro8o_mock_execution_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewIssued) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_issuance_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPassed) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewStatus !==
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewScope !==
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_scope"
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
      "completion_record_review_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("completion_record_review_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "completion_record_review_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8u`);
  }
  for (const key of CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8u`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_required_after_oro8u"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8u");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8U_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryResult:
      result,
    dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary:
      fixture.dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary,
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed:
      pass &&
      fixture.oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t,
    actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t,
    actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t,
    actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t,
    actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewIssued:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPassed:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewStatus
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewScope: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewScope
      : HOLD,
    verifiedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro8tWasCompletionRecordBoundaryOnly,
    verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly:
      pass && fixture.verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly,
    verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly:
      pass && fixture.verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly,
    verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly:
      pass && fixture.verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly,
    verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      pass && fixture.verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly:
      pass && fixture.verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly,
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
  for (const key of CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
  input =
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
  input = {}
) {
  return evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
    input
  );
}

function runOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
  input = {}
) {
  return validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
    input
  );
}

function buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySummary(
  input = {}
) {
  return evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
    input
  );
}

module.exports = {
  ORO8U_PHASE,
  ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
  ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
  ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  evaluateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  runOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundarySummary,
};
