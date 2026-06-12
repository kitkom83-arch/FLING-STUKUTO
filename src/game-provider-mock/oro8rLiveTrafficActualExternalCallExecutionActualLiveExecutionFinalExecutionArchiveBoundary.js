"use strict";

const {
  CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
  PASS: ORO8Q_PASS,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
} = require("./oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary");

const ORO8R_PHASE = "ORO-8R";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE =
  "actual_live_execution_final_execution_archive_boundary_only";
const ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS =
  "archived_for_separate_actual_live_execution_final_execution_audit_boundary_only";

const CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionArchived",
]);

const ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_RECORD = Object.freeze({
  PHASE: ORO8R_PHASE,
  PASS,
  HOLD,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
});

const BASELINE_ORO8Q_SUMMARY =
  validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary()
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
  return CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8qEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8Q_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryResult ===
      ORO8Q_PASS;

  return {
    dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary: true,
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed: boundaryPassed,
    actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutPrepared === true,
    actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutIssued === true,
    actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutPassed === true,
    actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutRecorded === true,
    actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutStatus,
    actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q:
      summary.actualLiveExecutionFinalExecutionCloseoutScope,
    verifiedOro8qWasCloseoutBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCloseoutStatus ===
        ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS &&
      summary.actualLiveExecutionFinalExecutionCloseoutScope ===
        ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
    verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      summary.verifiedOro8pWasPostExecutionVerificationBoundaryOnly === true,
    verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly:
      summary.verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionClosed === false &&
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

function buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture",
    phase: ORO8R_PHASE,
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence:
      buildOro8qEvidenceFromSummary(BASELINE_ORO8Q_SUMMARY),
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualLiveExecutionFinalExecutionArchivePrepared: true,
      actualLiveExecutionFinalExecutionArchiveIssued: true,
      actualLiveExecutionFinalExecutionArchivePassed: true,
      actualLiveExecutionFinalExecutionArchiveRecorded: true,
      actualLiveExecutionFinalExecutionArchiveStatus:
        ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
      actualLiveExecutionFinalExecutionArchiveScope:
        ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionAuditRequired: true,
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
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary();
  const merged = deepMerge(baseline, source);
  const oro8q = isPlainObject(
    merged.oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence
  )
    ? merged.oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence
    : {};
  const archive = isPlainObject(merged.actualLiveExecutionFinalExecutionArchiveEvidence)
    ? merged.actualLiveExecutionFinalExecutionArchiveEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary: readBoolean(
      oro8q,
      "dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary",
      true
    ),
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed: readBoolean(
      oro8q,
      "oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q: readBoolean(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q: readBoolean(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q: readBoolean(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q: readBoolean(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q: readString(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q",
      ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
    ),
    actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q: readString(
      oro8q,
      "actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q",
      ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
    ),
    actualLiveExecutionFinalExecutionArchivePrepared: readBoolean(
      archive,
      "actualLiveExecutionFinalExecutionArchivePrepared",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveIssued: readBoolean(
      archive,
      "actualLiveExecutionFinalExecutionArchiveIssued",
      true
    ),
    actualLiveExecutionFinalExecutionArchivePassed: readBoolean(
      archive,
      "actualLiveExecutionFinalExecutionArchivePassed",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveRecorded: readBoolean(
      archive,
      "actualLiveExecutionFinalExecutionArchiveRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionArchiveStatus: readString(
      archive,
      "actualLiveExecutionFinalExecutionArchiveStatus",
      ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
    ),
    actualLiveExecutionFinalExecutionArchiveScope: readString(
      archive,
      "actualLiveExecutionFinalExecutionArchiveScope",
      ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
    ),
    verifiedOro8qWasCloseoutBoundaryOnly: readBoolean(
      oro8q,
      "verifiedOro8qWasCloseoutBoundaryOnly",
      true
    ),
    verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      readBoolean(
        oro8q,
        "verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly",
        true
      ),
    verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly: readBoolean(
      oro8q,
      "verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      archive,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8q, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      archive,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8q, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      archive,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8q, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      archive,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8q, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      archive,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8q, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      archive,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8q, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      archive,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8q, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      archive,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8q, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      archive,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8q, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      archive,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8q, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      archive,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8q, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      archive,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8q, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      archive,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8q, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary:
      readBoolean(
        archive,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      archive,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      archive,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionAuditRequired: readBoolean(
      archive,
      "separateActualExecutionFinalExecutionAuditRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(archive, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(archive, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary) {
    blockers.push(
      "missing_oro8q_actual_live_execution_final_execution_closeout_boundary_dependency"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q) {
    blockers.push("oro8q_actual_live_execution_final_execution_closeout_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q) {
    blockers.push("oro8q_actual_live_execution_final_execution_closeout_issuance_required");
  }
  if (!fixture.oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed) {
    blockers.push("oro8q_actual_live_execution_final_execution_closeout_boundary_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q) {
    blockers.push("oro8q_actual_live_execution_final_execution_closeout_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q !==
    ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
  ) {
    blockers.push("invalid_oro8q_actual_live_execution_final_execution_closeout_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q !==
    ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
  ) {
    blockers.push("invalid_oro8q_actual_live_execution_final_execution_closeout_scope");
  }
  if (!fixture.verifiedOro8qWasCloseoutBoundaryOnly) {
    blockers.push("oro8q_closeout_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly) {
    blockers.push("oro8q_must_confirm_oro8p_post_execution_verification_boundary_only");
  }
  if (!fixture.verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly) {
    blockers.push("oro8q_must_confirm_oro8o_mock_execution_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionArchivePrepared) {
    blockers.push("actual_live_execution_final_execution_archive_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchiveIssued) {
    blockers.push("actual_live_execution_final_execution_archive_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchivePassed) {
    blockers.push("actual_live_execution_final_execution_archive_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionArchiveRecorded) {
    blockers.push("actual_live_execution_final_execution_archive_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionArchiveStatus !==
    ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_archive_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionArchiveScope !==
    ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_archive_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("archive_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("archive_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("archive_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8r`);
  }
  for (const key of CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8r`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionAuditRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_audit_boundary_required_after_oro8r"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8r");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8R_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryResult:
      result,
    dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary:
      fixture.dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary,
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed:
      pass && fixture.oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed,
    actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q,
    actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q,
    actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q,
    actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q,
    actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q: pass
      ? fixture.actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q
      : HOLD,
    actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q: pass
      ? fixture.actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q
      : HOLD,
    actualLiveExecutionFinalExecutionArchivePrepared:
      pass && fixture.actualLiveExecutionFinalExecutionArchivePrepared,
    actualLiveExecutionFinalExecutionArchiveIssued:
      pass && fixture.actualLiveExecutionFinalExecutionArchiveIssued,
    actualLiveExecutionFinalExecutionArchivePassed:
      pass && fixture.actualLiveExecutionFinalExecutionArchivePassed,
    actualLiveExecutionFinalExecutionArchiveRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionArchiveRecorded,
    actualLiveExecutionFinalExecutionArchiveStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionArchiveStatus
      : HOLD,
    actualLiveExecutionFinalExecutionArchiveScope: pass
      ? fixture.actualLiveExecutionFinalExecutionArchiveScope
      : HOLD,
    verifiedOro8qWasCloseoutBoundaryOnly:
      pass && fixture.verifiedOro8qWasCloseoutBoundaryOnly,
    verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly:
      pass && fixture.verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly,
    verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly:
      pass && fixture.verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly,
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
  for (const key of CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary =
    pass && fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionAuditRequired =
    pass && fixture.separateActualExecutionFinalExecutionAuditRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
  input =
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
  input = {}
) {
  return evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
    input
  );
}

function runOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
  input = {}
) {
  return validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
    input
  );
}

function buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySummary(
  input = {}
) {
  return evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
    input
  );
}

module.exports = {
  ORO8R_PHASE,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_SCOPE,
  ORO_8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_STATUS,
  ORO8R_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_ARCHIVE_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8R_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  evaluateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  validateOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  runOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundarySummary,
};
