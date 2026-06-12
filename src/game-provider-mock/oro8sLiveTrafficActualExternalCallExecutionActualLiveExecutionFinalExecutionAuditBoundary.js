"use strict";

const {
  CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
  PASS: ORO8R_PASS,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
} = require("./oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary");

const ORO8S_PHASE = "ORO-8S";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE =
  "actual_live_execution_final_execution_audit_boundary_only";
const ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS =
  "audited_for_separate_actual_live_execution_final_execution_completion_record_boundary_only";

const CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionAudited",
]);

const ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_RECORD = Object.freeze({
  PHASE: ORO8S_PHASE,
  PASS,
  HOLD,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
});

const BASELINE_ORO8R_SUMMARY =
  validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary()
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
  return CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8rEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8R_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryResult ===
      ORO8R_PASS;

  return {
    dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary: true,
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionArchivePreparedFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchivePrepared === true,
    actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchiveIssued === true,
    actualLiveExecutionFinalExecutionArchivePassedFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchivePassed === true,
    actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchiveRecorded === true,
    actualLiveExecutionFinalExecutionArchiveStatusFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchiveStatus,
    actualLiveExecutionFinalExecutionArchiveScopeFromOro8r:
      summary.actualLiveExecutionFinalExecutionArchiveScope,
    verifiedOro8rWasArchiveBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionArchiveStatus ===
        ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS &&
      summary.actualLiveExecutionFinalExecutionArchiveScope ===
        ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
    verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly:
      summary.verifiedOro8qWasCloseoutBoundaryOnly === true,
    verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      summary.verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly === true,
    verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly:
      summary.verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
      summary.actualLiveExecutionFinalExecutionArchived === false &&
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

function buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture",
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence:
      buildOro8rEvidenceFromSummary(BASELINE_ORO8R_SUMMARY),
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualLiveExecutionFinalExecutionAuditPrepared: true,
      actualLiveExecutionFinalExecutionAuditIssued: true,
      actualLiveExecutionFinalExecutionAuditPassed: true,
      actualLiveExecutionFinalExecutionAuditRecorded: true,
      actualLiveExecutionFinalExecutionAuditStatus:
        ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
      actualLiveExecutionFinalExecutionAuditScope:
        ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary:
        true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionCompletionRecordRequired: true,
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
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary();
  const merged = deepMerge(baseline, source);
  const oro8r = isPlainObject(
    merged.oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence
  )
    ? merged.oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence
    : {};
  const audit = isPlainObject(merged.actualLiveExecutionFinalExecutionAuditEvidence)
    ? merged.actualLiveExecutionFinalExecutionAuditEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary: readBoolean(
      oro8r,
      "dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary",
      true
    ),
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed: readBoolean(
      oro8r,
      "oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionArchivePreparedFromOro8r: readBoolean(
      oro8r,
      "actualLiveExecutionFinalExecutionArchivePreparedFromOro8r",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r: readBoolean(
      oro8r,
      "actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r",
      true
    ),
    actualLiveExecutionFinalExecutionArchivePassedFromOro8r: readBoolean(
      oro8r,
      "actualLiveExecutionFinalExecutionArchivePassedFromOro8r",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r: readBoolean(
      oro8r,
      "actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveStatusFromOro8r: readString(
      oro8r,
      "actualLiveExecutionFinalExecutionArchiveStatusFromOro8r",
      ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
    ),
    actualLiveExecutionFinalExecutionArchiveScopeFromOro8r: readString(
      oro8r,
      "actualLiveExecutionFinalExecutionArchiveScopeFromOro8r",
      ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
    ),
    actualLiveExecutionFinalExecutionAuditPrepared: readBoolean(
      audit,
      "actualLiveExecutionFinalExecutionAuditPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionAuditIssued: readBoolean(
      audit,
      "actualLiveExecutionFinalExecutionAuditIssued",
      true
    ),
    actualLiveExecutionFinalExecutionAuditPassed: readBoolean(
      audit,
      "actualLiveExecutionFinalExecutionAuditPassed",
      true
    ),
    actualLiveExecutionFinalExecutionAuditRecorded: readBoolean(
      audit,
      "actualLiveExecutionFinalExecutionAuditRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionAuditStatus: readString(
      audit,
      "actualLiveExecutionFinalExecutionAuditStatus",
      ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
    ),
    actualLiveExecutionFinalExecutionAuditScope: readString(
      audit,
      "actualLiveExecutionFinalExecutionAuditScope",
      ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
    ),
    verifiedOro8rWasArchiveBoundaryOnly: readBoolean(
      oro8r,
      "verifiedOro8rWasArchiveBoundaryOnly",
      true
    ),
    verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly: readBoolean(
      oro8r,
      "verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly",
      true
    ),
    verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      readBoolean(
        oro8r,
        "verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
        true
      ),
    verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly: readBoolean(
      oro8r,
      "verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      audit,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8r, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      audit,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8r, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      audit,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8r, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      audit,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8r, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      audit,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8r, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      audit,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8r, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      audit,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8r, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      audit,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8r, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      audit,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8r, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      audit,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8r, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      audit,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8r, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      audit,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8r, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      audit,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8r, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary:
      readBoolean(
        audit,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      audit,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      audit,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordRequired: readBoolean(
      audit,
      "separateActualExecutionFinalExecutionCompletionRecordRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(audit, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(audit, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary) {
    blockers.push(
      "missing_oro8r_actual_live_execution_final_execution_archive_boundary_dependency"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchivePreparedFromOro8r) {
    blockers.push("oro8r_actual_live_execution_final_execution_archive_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r) {
    blockers.push("oro8r_actual_live_execution_final_execution_archive_issuance_required");
  }
  if (!fixture.oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed) {
    blockers.push("oro8r_actual_live_execution_final_execution_archive_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r) {
    blockers.push("oro8r_actual_live_execution_final_execution_archive_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionArchiveStatusFromOro8r !==
    ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
  ) {
    blockers.push("invalid_oro8r_actual_live_execution_final_execution_archive_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionArchiveScopeFromOro8r !==
    ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
  ) {
    blockers.push("invalid_oro8r_actual_live_execution_final_execution_archive_scope");
  }
  if (!fixture.verifiedOro8rWasArchiveBoundaryOnly) {
    blockers.push("oro8r_archive_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly) {
    blockers.push("oro8r_must_confirm_oro8q_closeout_boundary_only");
  }
  if (!fixture.verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly) {
    blockers.push("oro8r_must_confirm_oro8p_post_execution_verification_boundary_only");
  }
  if (!fixture.verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly) {
    blockers.push("oro8r_must_confirm_oro8o_mock_execution_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionAuditPrepared) {
    blockers.push("actual_live_execution_final_execution_audit_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditIssued) {
    blockers.push("actual_live_execution_final_execution_audit_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditPassed) {
    blockers.push("actual_live_execution_final_execution_audit_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionAuditRecorded) {
    blockers.push("actual_live_execution_final_execution_audit_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionAuditStatus !==
    ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_audit_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionAuditScope !==
    ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_audit_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("audit_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("audit_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("audit_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8s`);
  }
  for (const key of CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8s`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_boundary_required_after_oro8s"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8s");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8S_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryResult:
      result,
    dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary:
      fixture.dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary,
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed:
      pass && fixture.oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed,
    actualLiveExecutionFinalExecutionArchivePreparedFromOro8r:
      pass && fixture.actualLiveExecutionFinalExecutionArchivePreparedFromOro8r,
    actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r:
      pass && fixture.actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r,
    actualLiveExecutionFinalExecutionArchivePassedFromOro8r:
      pass && fixture.actualLiveExecutionFinalExecutionArchivePassedFromOro8r,
    actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r:
      pass && fixture.actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r,
    actualLiveExecutionFinalExecutionArchiveStatusFromOro8r: pass
      ? fixture.actualLiveExecutionFinalExecutionArchiveStatusFromOro8r
      : HOLD,
    actualLiveExecutionFinalExecutionArchiveScopeFromOro8r: pass
      ? fixture.actualLiveExecutionFinalExecutionArchiveScopeFromOro8r
      : HOLD,
    actualLiveExecutionFinalExecutionAuditPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionAuditPrepared,
    actualLiveExecutionFinalExecutionAuditIssued:
      pass && fixture.actualLiveExecutionFinalExecutionAuditIssued,
    actualLiveExecutionFinalExecutionAuditPassed:
      pass && fixture.actualLiveExecutionFinalExecutionAuditPassed,
    actualLiveExecutionFinalExecutionAuditRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionAuditRecorded,
    actualLiveExecutionFinalExecutionAuditStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionAuditStatus
      : HOLD,
    actualLiveExecutionFinalExecutionAuditScope: pass
      ? fixture.actualLiveExecutionFinalExecutionAuditScope
      : HOLD,
    verifiedOro8rWasArchiveBoundaryOnly:
      pass && fixture.verifiedOro8rWasArchiveBoundaryOnly,
    verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly:
      pass && fixture.verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly,
    verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      pass && fixture.verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly:
      pass && fixture.verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly,
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
  for (const key of CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordRequired =
    pass && fixture.separateActualExecutionFinalExecutionCompletionRecordRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
  input =
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
  input = {}
) {
  return evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
    input
  );
}

function runOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
  input = {}
) {
  return validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
    input
  );
}

function buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySummary(
  input = {}
) {
  return evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
    input
  );
}

module.exports = {
  ORO8S_PHASE,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_SCOPE,
  ORO_8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_STATUS,
  ORO8S_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_AUDIT_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8S_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  evaluateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  validateOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  runOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundarySummary,
};
