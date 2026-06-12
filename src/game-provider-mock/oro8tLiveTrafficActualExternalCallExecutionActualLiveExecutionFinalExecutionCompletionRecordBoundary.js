"use strict";

const {
  CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
  PASS: ORO8S_PASS,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
} = require("./oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary");

const ORO8T_PHASE = "ORO-8T";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE =
  "actual_live_execution_final_execution_completion_record_boundary_only";
const ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS =
  "completion_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_boundary_only";

const CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecorded",
]);

const ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD = Object.freeze({
  PHASE: ORO8T_PHASE,
  PASS,
  HOLD,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
});

const BASELINE_ORO8S_SUMMARY =
  validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary()
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
  return CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8sEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8S_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryResult ===
      ORO8S_PASS;

  return {
    dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary: true,
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionAuditPreparedFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditPrepared === true,
    actualLiveExecutionFinalExecutionAuditIssuedFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditIssued === true,
    actualLiveExecutionFinalExecutionAuditPassedFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditPassed === true,
    actualLiveExecutionFinalExecutionAuditRecordedFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditRecorded === true,
    actualLiveExecutionFinalExecutionAuditStatusFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditStatus,
    actualLiveExecutionFinalExecutionAuditScopeFromOro8s:
      summary.actualLiveExecutionFinalExecutionAuditScope,
    verifiedOro8sWasAuditBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionAuditStatus ===
        ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS &&
      summary.actualLiveExecutionFinalExecutionAuditScope ===
        ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
    verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly:
      summary.verifiedOro8rWasArchiveBoundaryOnly === true,
    verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly:
      summary.verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly === true,
    verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      summary.verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly === true,
    verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly:
      summary.verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
      summary.actualLiveExecutionFinalExecutionArchived === false &&
      summary.actualLiveExecutionFinalExecutionAudited === false &&
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

function buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture",
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence:
      buildOro8sEvidenceFromSummary(BASELINE_ORO8S_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordPrepared: true,
      actualLiveExecutionFinalExecutionCompletionRecordIssued: true,
      actualLiveExecutionFinalExecutionCompletionRecordPassed: true,
      actualLiveExecutionFinalExecutionCompletionRecordRecorded: true,
      actualLiveExecutionFinalExecutionCompletionRecordStatus:
        ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
      actualLiveExecutionFinalExecutionCompletionRecordScope:
        ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionCompletionRecordReviewRequired: true,
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
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro8s = isPlainObject(
    merged.oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence
  )
    ? merged.oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence
    : {};
  const record = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary: readBoolean(
      oro8s,
      "dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary",
      true
    ),
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed: readBoolean(
      oro8s,
      "oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionAuditPreparedFromOro8s: readBoolean(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditPreparedFromOro8s",
      true
    ),
    actualLiveExecutionFinalExecutionAuditIssuedFromOro8s: readBoolean(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditIssuedFromOro8s",
      true
    ),
    actualLiveExecutionFinalExecutionAuditPassedFromOro8s: readBoolean(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditPassedFromOro8s",
      true
    ),
    actualLiveExecutionFinalExecutionAuditRecordedFromOro8s: readBoolean(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditRecordedFromOro8s",
      true
    ),
    actualLiveExecutionFinalExecutionAuditStatusFromOro8s: readString(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditStatusFromOro8s",
      ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
    ),
    actualLiveExecutionFinalExecutionAuditScopeFromOro8s: readString(
      oro8s,
      "actualLiveExecutionFinalExecutionAuditScopeFromOro8s",
      ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
    ),
    actualLiveExecutionFinalExecutionCompletionRecordPrepared: readBoolean(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordIssued: readBoolean(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordIssued",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordPassed: readBoolean(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordPassed",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordRecorded: readBoolean(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionCompletionRecordStatus: readString(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordStatus",
      ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
    ),
    actualLiveExecutionFinalExecutionCompletionRecordScope: readString(
      record,
      "actualLiveExecutionFinalExecutionCompletionRecordScope",
      ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
    ),
    verifiedOro8sWasAuditBoundaryOnly: readBoolean(
      oro8s,
      "verifiedOro8sWasAuditBoundaryOnly",
      true
    ),
    verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly: readBoolean(
      oro8s,
      "verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly",
      true
    ),
    verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly: readBoolean(
      oro8s,
      "verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly",
      true
    ),
    verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      readBoolean(
        oro8s,
        "verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
        true
      ),
    verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly: readBoolean(
      oro8s,
      "verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      record,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8s, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      record,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8s, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      record,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8s, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      record,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8s, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      record,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8s, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      record,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8s, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      record,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8s, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      record,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8s, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      record,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8s, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      record,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8s, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      record,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8s, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      record,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8s, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      record,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8s, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
      readBoolean(
        record,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      record,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      record,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewRequired: readBoolean(
      record,
      "separateActualExecutionFinalExecutionCompletionRecordReviewRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(record, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(record, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary) {
    blockers.push(
      "missing_oro8s_actual_live_execution_final_execution_audit_boundary_dependency"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditPreparedFromOro8s) {
    blockers.push("oro8s_actual_live_execution_final_execution_audit_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditIssuedFromOro8s) {
    blockers.push("oro8s_actual_live_execution_final_execution_audit_issuance_required");
  }
  if (!fixture.oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed) {
    blockers.push("oro8s_actual_live_execution_final_execution_audit_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditRecordedFromOro8s) {
    blockers.push("oro8s_actual_live_execution_final_execution_audit_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionAuditStatusFromOro8s !==
    ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
  ) {
    blockers.push("invalid_oro8s_actual_live_execution_final_execution_audit_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionAuditScopeFromOro8s !==
    ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
  ) {
    blockers.push("invalid_oro8s_actual_live_execution_final_execution_audit_scope");
  }
  if (!fixture.verifiedOro8sWasAuditBoundaryOnly) {
    blockers.push("oro8s_audit_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly) {
    blockers.push("oro8s_must_confirm_oro8r_archive_boundary_only");
  }
  if (!fixture.verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly) {
    blockers.push("oro8s_must_confirm_oro8q_closeout_boundary_only");
  }
  if (!fixture.verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly) {
    blockers.push("oro8s_must_confirm_oro8p_post_execution_verification_boundary_only");
  }
  if (!fixture.verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly) {
    blockers.push("oro8s_must_confirm_oro8o_mock_execution_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordPrepared) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordIssued) {
    blockers.push("actual_live_execution_final_execution_completion_record_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordPassed) {
    blockers.push("actual_live_execution_final_execution_completion_record_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCompletionRecordRecorded) {
    blockers.push("actual_live_execution_final_execution_completion_record_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordStatus !==
    ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_completion_record_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordScope !==
    ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_completion_record_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("completion_record_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("completion_record_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("completion_record_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8t`);
  }
  for (const key of CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8t`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_boundary_required_after_oro8t"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8t");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8T_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryResult:
      result,
    dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary:
      fixture.dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary,
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed:
      pass && fixture.oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed,
    actualLiveExecutionFinalExecutionAuditPreparedFromOro8s:
      pass && fixture.actualLiveExecutionFinalExecutionAuditPreparedFromOro8s,
    actualLiveExecutionFinalExecutionAuditIssuedFromOro8s:
      pass && fixture.actualLiveExecutionFinalExecutionAuditIssuedFromOro8s,
    actualLiveExecutionFinalExecutionAuditPassedFromOro8s:
      pass && fixture.actualLiveExecutionFinalExecutionAuditPassedFromOro8s,
    actualLiveExecutionFinalExecutionAuditRecordedFromOro8s:
      pass && fixture.actualLiveExecutionFinalExecutionAuditRecordedFromOro8s,
    actualLiveExecutionFinalExecutionAuditStatusFromOro8s: pass
      ? fixture.actualLiveExecutionFinalExecutionAuditStatusFromOro8s
      : HOLD,
    actualLiveExecutionFinalExecutionAuditScopeFromOro8s: pass
      ? fixture.actualLiveExecutionFinalExecutionAuditScopeFromOro8s
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordIssued:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordIssued,
    actualLiveExecutionFinalExecutionCompletionRecordPassed:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordPassed,
    actualLiveExecutionFinalExecutionCompletionRecordRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionCompletionRecordRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordStatus
      : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordScope: pass
      ? fixture.actualLiveExecutionFinalExecutionCompletionRecordScope
      : HOLD,
    verifiedOro8sWasAuditBoundaryOnly:
      pass && fixture.verifiedOro8sWasAuditBoundaryOnly,
    verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly:
      pass && fixture.verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly,
    verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly:
      pass && fixture.verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly,
    verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      pass && fixture.verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly:
      pass && fixture.verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly,
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
  for (const key of CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewRequired =
    pass && fixture.separateActualExecutionFinalExecutionCompletionRecordReviewRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
  input =
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
  input = {}
) {
  return evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
    input
  );
}

function runOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
  input = {}
) {
  return validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
    input
  );
}

function buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySummary(
  input = {}
) {
  return evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
    input
  );
}

module.exports = {
  ORO8T_PHASE,
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_SCOPE,
  ORO_8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_STATUS,
  ORO8T_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8T_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  evaluateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  validateOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  runOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundarySummary,
};
