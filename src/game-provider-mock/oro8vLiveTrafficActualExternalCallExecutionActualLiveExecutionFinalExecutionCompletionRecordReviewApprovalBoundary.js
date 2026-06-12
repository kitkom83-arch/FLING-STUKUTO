"use strict";

const {
  CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
  ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
  PASS: ORO8U_PASS,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
  validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
} = require("./oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary");

const ORO8V_PHASE = "ORO-8V";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_boundary_only";
const ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS =
  "completion_record_review_approval_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_boundary_only";
const ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS =
  ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS;

const CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8U_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApproved",
]);

const ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL =
  Object.freeze({
    PHASE: ORO8V_PHASE,
    PASS,
    HOLD,
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE,
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS,
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
    ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
  });

const BASELINE_ORO8U_SUMMARY =
  validateOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary()
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
  return CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8uEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8U_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryResult ===
      ORO8U_PASS;

  return {
    dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary: true,
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared === true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewIssued === true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewPassed === true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded === true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewStatus,
    actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewScope,
    verifiedOro8uWasCompletionRecordReviewBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewStatus ===
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewScope ===
        ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewed === false,
    verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly:
      summary.verifiedOro8tWasCompletionRecordBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
      summary.actualLiveExecutionFinalExecutionArchived === false &&
      summary.actualLiveExecutionFinalExecutionAudited === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecorded === false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewed === false &&
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

function buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture",
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence:
      buildOro8uEvidenceFromSummary(BASELINE_ORO8U_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded: true,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus:
        ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope:
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
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
    buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary();
  const merged = deepMerge(baseline, source);
  const oro8u = isPlainObject(
    merged.oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence
  )
    ? merged.oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence
    : {};
  const approval = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
      readBoolean(
        oro8u,
        "dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary",
        true
      ),
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed:
      readBoolean(
        oro8u,
        "oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u:
      readBoolean(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u:
      readBoolean(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u:
      readBoolean(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u:
      readBoolean(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u:
      readString(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u",
        ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u:
      readString(
        oro8u,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u",
        ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared:
      readBoolean(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued:
      readBoolean(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed:
      readBoolean(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded:
      readBoolean(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus:
      readString(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus",
        ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope:
      readString(
        approval,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope",
        ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
      ),
    verifiedOro8uWasCompletionRecordReviewBoundaryOnly: readBoolean(
      oro8u,
      "verifiedOro8uWasCompletionRecordReviewBoundaryOnly",
      true
    ),
    verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly: readBoolean(
      oro8u,
      "verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      approval,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8u, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      approval,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8u, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      approval,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8u, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      approval,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8u, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      approval,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8u, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      approval,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8u, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      approval,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8u, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      approval,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8u, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      approval,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8u, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      approval,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8u, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      approval,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8u, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      approval,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8u, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      approval,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8u, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
      readBoolean(
        approval,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      approval,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      approval,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBoolean(
        approval,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(approval, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary) {
    blockers.push(
      "missing_oro8u_actual_live_execution_final_execution_completion_record_review_boundary_dependency"
    );
  }
  if (!fixture.oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed) {
    blockers.push(
      "oro8u_actual_live_execution_final_execution_completion_record_review_boundary_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u) {
    blockers.push(
      "oro8u_actual_live_execution_final_execution_completion_record_review_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u) {
    blockers.push(
      "oro8u_actual_live_execution_final_execution_completion_record_review_issuance_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u) {
    blockers.push(
      "oro8u_actual_live_execution_final_execution_completion_record_review_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u) {
    blockers.push(
      "oro8u_actual_live_execution_final_execution_completion_record_review_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u !==
    ORO_8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_STATUS
  ) {
    blockers.push(
      "invalid_oro8u_actual_live_execution_final_execution_completion_record_review_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u !==
    ORO8U_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_SCOPE
  ) {
    blockers.push(
      "invalid_oro8u_actual_live_execution_final_execution_completion_record_review_scope"
    );
  }
  if (!fixture.verifiedOro8uWasCompletionRecordReviewBoundaryOnly) {
    blockers.push("oro8u_completion_record_review_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro8u_must_confirm_oro8t_completion_record_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_issuance_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus !==
    ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope !==
    ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_scope"
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
      "completion_record_review_approval_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("completion_record_review_approval_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "completion_record_review_approval_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8v`);
  }
  for (const key of CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8v`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_boundary_required_after_oro8v"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8v");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8V_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryResult:
      result,
    dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
      fixture.dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed:
      pass &&
      fixture.oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u,
    actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u,
    actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u,
    actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u,
    actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope
      : HOLD,
    verifiedOro8uWasCompletionRecordReviewBoundaryOnly:
      pass && fixture.verifiedOro8uWasCompletionRecordReviewBoundaryOnly,
    verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
  for (const key of CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary;
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

function evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
  input =
    buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
  input = {}
) {
  return evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
    input
  );
}

function runOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
  input = {}
) {
  return validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
    input
  );
}

function buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySummary(
  input = {}
) {
  return evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
    input
  );
}

module.exports = {
  ORO8V_PHASE,
  ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_SCOPE,
  ORO8V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_BOUNDARY_STATUS,
  ORO_8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_STATUS,
  ORO8V_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8V_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  evaluateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  validateOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  runOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundarySummary,
};
