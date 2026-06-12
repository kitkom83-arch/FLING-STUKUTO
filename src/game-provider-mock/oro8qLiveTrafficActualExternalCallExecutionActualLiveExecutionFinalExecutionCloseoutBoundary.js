"use strict";

const {
  CLOSED_ORO8P_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
  ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
  PASS: ORO8P_PASS,
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
  validateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
} = require("./oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary");

const ORO8Q_PHASE = "ORO-8Q";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE =
  "actual_live_execution_final_execution_closeout_boundary_only";
const ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS =
  "closed_for_separate_actual_live_execution_final_execution_archive_boundary_only";

const CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8P_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionClosed",
]);

const ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_RECORD = Object.freeze({
  PHASE: ORO8Q_PHASE,
  PASS,
  HOLD,
  ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
  ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
});

const BASELINE_ORO8P_SUMMARY =
  validateOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
    buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary()
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
  return CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS.reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {});
}

function buildOro8pEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8P_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryResult ===
      ORO8P_PASS;

  return {
    dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary: true,
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPrepared === true,
    actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationIssued === true,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationPassed === true,
    actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationRecorded === true,
    actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationStatus,
    actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p:
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationScope,
    verifiedOro8pWasPostExecutionVerificationBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationStatus ===
        ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS &&
      summary.actualLiveExecutionFinalExecutionPostExecutionVerificationScope ===
        ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE,
    verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly:
      summary.verifiedOro8oWasMockExecutionBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false &&
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

function buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture",
    phase: ORO8Q_PHASE,
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence:
      buildOro8pEvidenceFromSummary(BASELINE_ORO8P_SUMMARY),
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualLiveExecutionFinalExecutionCloseoutPrepared: true,
      actualLiveExecutionFinalExecutionCloseoutIssued: true,
      actualLiveExecutionFinalExecutionCloseoutPassed: true,
      actualLiveExecutionFinalExecutionCloseoutRecorded: true,
      actualLiveExecutionFinalExecutionCloseoutStatus:
        ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
      actualLiveExecutionFinalExecutionCloseoutScope:
        ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
      ...closedRuntimeFlags(),
      ...closedActualExecutionFlags(),
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary: true,
      humanApprovalRequiredForActualExecution: true,
      separateActualExecutionApprovalRequired: true,
      separateActualExecutionFinalExecutionArchiveRequired: true,
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
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary();
  const merged = deepMerge(baseline, source);
  const oro8p = isPlainObject(
    merged.oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence
  )
    ? merged.oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence
    : {};
  const closeout = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCloseoutEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCloseoutEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};

  const normalized = {
    id: readString(merged, "id", baseline.id),
    dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary:
      readBoolean(
        oro8p,
        "dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary",
        true
      ),
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed:
      readBoolean(
        oro8p,
        "oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p:
      readBoolean(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p",
        true
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p:
      readBoolean(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p",
        true
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p:
      readBoolean(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p",
        true
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p:
      readBoolean(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p",
        true
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p:
      readString(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p",
        ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS
      ),
    actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p:
      readString(
        oro8p,
        "actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p",
        ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE
      ),
    actualLiveExecutionFinalExecutionCloseoutPrepared: readBoolean(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutPrepared",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutIssued: readBoolean(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutIssued",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutPassed: readBoolean(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutPassed",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutRecorded: readBoolean(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutRecorded",
      true
    ),
    actualLiveExecutionFinalExecutionCloseoutStatus: readString(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutStatus",
      ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
    ),
    actualLiveExecutionFinalExecutionCloseoutScope: readString(
      closeout,
      "actualLiveExecutionFinalExecutionCloseoutScope",
      ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
    ),
    verifiedOro8pWasPostExecutionVerificationBoundaryOnly: readBoolean(
      oro8p,
      "verifiedOro8pWasPostExecutionVerificationBoundaryOnly",
      true
    ),
    verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly: readBoolean(
      oro8p,
      "verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly",
      true
    ),
    verifiedNoActualLiveExecutionOccurred: readBoolean(
      closeout,
      "verifiedNoActualLiveExecutionOccurred",
      readBoolean(oro8p, "verifiedNoActualLiveExecutionOccurred", true)
    ),
    verifiedNoRuntimeActivationOccurred: readBoolean(
      closeout,
      "verifiedNoRuntimeActivationOccurred",
      readBoolean(oro8p, "verifiedNoRuntimeActivationOccurred", true)
    ),
    verifiedNoRuntimeEnablementOccurred: readBoolean(
      closeout,
      "verifiedNoRuntimeEnablementOccurred",
      readBoolean(oro8p, "verifiedNoRuntimeEnablementOccurred", true)
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBoolean(
      closeout,
      "verifiedNoRuntimeAuthorizationOccurred",
      readBoolean(oro8p, "verifiedNoRuntimeAuthorizationOccurred", true)
    ),
    verifiedNoExternalNetworkOccurred: readBoolean(
      closeout,
      "verifiedNoExternalNetworkOccurred",
      readBoolean(oro8p, "verifiedNoExternalNetworkOccurred", true)
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBoolean(
      closeout,
      "verifiedNoLiveOroPlayApiCallOccurred",
      readBoolean(oro8p, "verifiedNoLiveOroPlayApiCallOccurred", true)
    ),
    verifiedNoWalletMutationOccurred: readBoolean(
      closeout,
      "verifiedNoWalletMutationOccurred",
      readBoolean(oro8p, "verifiedNoWalletMutationOccurred", true)
    ),
    verifiedNoLedgerMutationOccurred: readBoolean(
      closeout,
      "verifiedNoLedgerMutationOccurred",
      readBoolean(oro8p, "verifiedNoLedgerMutationOccurred", true)
    ),
    verifiedNoPrismaWriteOccurred: readBoolean(
      closeout,
      "verifiedNoPrismaWriteOccurred",
      readBoolean(oro8p, "verifiedNoPrismaWriteOccurred", true)
    ),
    verifiedNoDbTransactionOccurred: readBoolean(
      closeout,
      "verifiedNoDbTransactionOccurred",
      readBoolean(oro8p, "verifiedNoDbTransactionOccurred", true)
    ),
    verifiedNoRouteEnablementOccurred: readBoolean(
      closeout,
      "verifiedNoRouteEnablementOccurred",
      readBoolean(oro8p, "verifiedNoRouteEnablementOccurred", true)
    ),
    verifiedNoExpressMountOccurred: readBoolean(
      closeout,
      "verifiedNoExpressMountOccurred",
      readBoolean(oro8p, "verifiedNoExpressMountOccurred", true)
    ),
    verifiedNoPublicAliasOccurred: readBoolean(
      closeout,
      "verifiedNoPublicAliasOccurred",
      readBoolean(oro8p, "verifiedNoPublicAliasOccurred", true)
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary:
      readBoolean(
        closeout,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBoolean(
      closeout,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBoolean(
      closeout,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionArchiveRequired: readBoolean(
      closeout,
      "separateActualExecutionFinalExecutionArchiveRequired",
      true
    ),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBoolean(closeout, key, false) || readBoolean(safety, key, false);
  }
  for (const key of CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBoolean(closeout, key, false) || readBoolean(safety, key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (!fixture.dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary) {
    blockers.push(
      "missing_oro8p_actual_live_execution_final_execution_post_execution_verification_boundary_dependency"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p) {
    blockers.push(
      "oro8p_actual_live_execution_final_execution_post_execution_verification_preparation_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p) {
    blockers.push(
      "oro8p_actual_live_execution_final_execution_post_execution_verification_issuance_required"
    );
  }
  if (!fixture.oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed) {
    blockers.push(
      "oro8p_actual_live_execution_final_execution_post_execution_verification_boundary_pass_required"
    );
  }
  if (!fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p) {
    blockers.push(
      "oro8p_actual_live_execution_final_execution_post_execution_verification_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p !==
    ORO_8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_STATUS
  ) {
    blockers.push(
      "invalid_oro8p_actual_live_execution_final_execution_post_execution_verification_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p !==
    ORO8P_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_POST_EXECUTION_VERIFICATION_SCOPE
  ) {
    blockers.push(
      "invalid_oro8p_actual_live_execution_final_execution_post_execution_verification_scope"
    );
  }
  if (!fixture.verifiedOro8pWasPostExecutionVerificationBoundaryOnly) {
    blockers.push("oro8p_post_execution_verification_boundary_only_proof_required");
  }
  if (!fixture.verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly) {
    blockers.push("oro8p_must_confirm_oro8o_mock_execution_boundary_only");
  }

  if (!fixture.actualLiveExecutionFinalExecutionCloseoutPrepared) {
    blockers.push("actual_live_execution_final_execution_closeout_preparation_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutIssued) {
    blockers.push("actual_live_execution_final_execution_closeout_issuance_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutPassed) {
    blockers.push("actual_live_execution_final_execution_closeout_pass_required");
  }
  if (!fixture.actualLiveExecutionFinalExecutionCloseoutRecorded) {
    blockers.push("actual_live_execution_final_execution_closeout_record_required");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCloseoutStatus !==
    ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_closeout_status");
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCloseoutScope !==
    ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE
  ) {
    blockers.push("invalid_actual_live_execution_final_execution_closeout_scope");
  }

  if (
    !fixture.verifiedNoExternalNetworkOccurred ||
    !fixture.verifiedNoLiveOroPlayApiCallOccurred ||
    !fixture.verifiedNoWalletMutationOccurred ||
    !fixture.verifiedNoLedgerMutationOccurred ||
    !fixture.verifiedNoPrismaWriteOccurred ||
    !fixture.verifiedNoDbTransactionOccurred
  ) {
    blockers.push("closeout_requires_no_mutation_and_no_external_network_proof");
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("closeout_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push("closeout_requires_no_actual_execution_route_or_alias_proof");
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8q`);
  }
  for (const key of CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro8q`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionArchiveRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_archive_boundary_required_after_oro8q"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro8q");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO8Q_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryResult:
      result,
    dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary:
      fixture.dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed:
      pass &&
      fixture.oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p:
      pass &&
      fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p,
    actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p:
      pass &&
      fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p:
      pass &&
      fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p,
    actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p:
      pass &&
      fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p,
    actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p:
      pass
        ? fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p
        : HOLD,
    actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p:
      pass
        ? fixture.actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p
        : HOLD,
    actualLiveExecutionFinalExecutionCloseoutPrepared:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutPrepared,
    actualLiveExecutionFinalExecutionCloseoutIssued:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutIssued,
    actualLiveExecutionFinalExecutionCloseoutPassed:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutPassed,
    actualLiveExecutionFinalExecutionCloseoutRecorded:
      pass && fixture.actualLiveExecutionFinalExecutionCloseoutRecorded,
    actualLiveExecutionFinalExecutionCloseoutStatus: pass
      ? fixture.actualLiveExecutionFinalExecutionCloseoutStatus
      : HOLD,
    actualLiveExecutionFinalExecutionCloseoutScope: pass
      ? fixture.actualLiveExecutionFinalExecutionCloseoutScope
      : HOLD,
    verifiedOro8pWasPostExecutionVerificationBoundaryOnly:
      pass && fixture.verifiedOro8pWasPostExecutionVerificationBoundaryOnly,
    verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly:
      pass && fixture.verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly,
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
  for (const key of CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary;
  output.humanApprovalRequiredForActualExecution =
    pass && fixture.humanApprovalRequiredForActualExecution;
  output.separateActualExecutionApprovalRequired =
    pass && fixture.separateActualExecutionApprovalRequired;
  output.separateActualExecutionFinalExecutionArchiveRequired =
    pass && fixture.separateActualExecutionFinalExecutionArchiveRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
  input =
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
  input = {}
) {
  return evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
    input
  );
}

function runOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
  input = {}
) {
  return validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
    input
  );
}

function buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySummary(
  input = {}
) {
  return evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
    input
  );
}

module.exports = {
  ORO8Q_PHASE,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_SCOPE,
  ORO_8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_STATUS,
  ORO8Q_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_CLOSEOUT_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO8Q_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  evaluateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  validateOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  runOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundarySummary,
};
