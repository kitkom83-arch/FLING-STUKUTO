"use strict";

const {
  CLOSED_ORO8Z_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
  ORO_8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
  PASS: ORO8Z_PASS,
  buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary");

const ORO9A_PHASE = "ORO-9A";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO9A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_recorded_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_only";
const ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS =
  ORO9A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS;

const CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO8Z_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApproved",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApplied",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApplied",
]);

const ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD =
  Object.freeze({
    PHASE: ORO9A_PHASE,
    PASS,
    HOLD,
    ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE,
    ORO_8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS,
    ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
  });

const BASELINE_ORO8Z_SUMMARY =
  validateOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
    buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary()
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
  return closedFlags(CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS);
}

function buildOro8zEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO8Z_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryResult ===
      ORO8Z_PASS;

  return {
    dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary:
      true,
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope,
    verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus ===
        ORO_8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope ===
        ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalApplied ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied ===
        false,
    verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      summary.verifiedOro8yConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly ===
      true,
    verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      summary.verifiedOro8yConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly ===
      true,
    verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      summary.verifiedOro8yConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly ===
      true,
    verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      summary.verifiedOro8yConfirmedOro8uWasCompletionRecordReviewBoundaryOnly === true,
    verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly:
      summary.verifiedOro8yConfirmedOro8tWasCompletionRecordBoundaryOnly === true,
    verifiedNoActualLiveExecutionOccurred:
      summary.verifiedNoActualLiveExecutionOccurred === true &&
      summary.actualExternalCallExecutionLiveExecuted === false &&
      summary.actualLiveExecutionExecuted === false &&
      summary.actualLiveExecutionFinalExecutionExecuted === false,
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
      summary.verifiedNoExpressMountOccurred === true && summary.expressMountAllowed === false,
    verifiedNoPublicAliasOccurred:
      summary.verifiedNoPublicAliasOccurred === true &&
      summary.publicAliasAllowed === false &&
      summary.apiBalanceAliasAllowed === false &&
      summary.apiTransactionAliasAllowed === false &&
      summary.apiOroplayBalanceRouteAllowed === false &&
      summary.apiOroplayTransactionRouteAllowed === false,
  };
}

function buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture",
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      buildOro8zEvidenceFromSummary(BASELINE_ORO8Z_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
          ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope:
          ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
        ...closedRuntimeFlags(),
        ...closedActualExecutionFlags(),
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
          true,
        humanApprovalRequiredForActualExecution: true,
        separateActualExecutionApprovalRequired: true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired:
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
    buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary();
  const merged = deepMerge(baseline, source);
  const oro8z = isPlainObject(
    merged.oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
  )
    ? merged.oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence
    : {};
  const approval = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro8z];
  const approvalSources = [merged, approval];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary:
      readBooleanFrom(
        dependencySources,
        "dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary",
        true
      ),
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
      readBooleanFrom(
        dependencySources,
        "oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z:
      readStringFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z",
        ORO_8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z:
      readStringFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z",
        ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
      ),
    verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
        true
      ),
    verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
        true
      ),
    verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
        true
      ),
    verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
        true
      ),
    verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
        true
      ),
    verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared:
      readBooleanFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued:
      readBooleanFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed:
      readBooleanFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded:
      readBooleanFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      readStringFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
        ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      readStringFrom(
        approvalSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope",
        ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
      ),
    verifiedNoActualLiveExecutionOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoActualLiveExecutionOccurred",
      true
    ),
    verifiedNoRuntimeActivationOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoRuntimeActivationOccurred",
      true
    ),
    verifiedNoRuntimeEnablementOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoRuntimeEnablementOccurred",
      true
    ),
    verifiedNoRuntimeAuthorizationOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoRuntimeAuthorizationOccurred",
      true
    ),
    verifiedNoExternalNetworkOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoExternalNetworkOccurred",
      true
    ),
    verifiedNoLiveOroPlayApiCallOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoLiveOroPlayApiCallOccurred",
      true
    ),
    verifiedNoWalletMutationOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoWalletMutationOccurred",
      true
    ),
    verifiedNoLedgerMutationOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoLedgerMutationOccurred",
      true
    ),
    verifiedNoPrismaWriteOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoPrismaWriteOccurred",
      true
    ),
    verifiedNoDbTransactionOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoDbTransactionOccurred",
      true
    ),
    verifiedNoRouteEnablementOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoRouteEnablementOccurred",
      true
    ),
    verifiedNoExpressMountOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoExpressMountOccurred",
      true
    ),
    verifiedNoPublicAliasOccurred: readBooleanFrom(
      dependencySources,
      "verifiedNoPublicAliasOccurred",
      true
    ),
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
      readBooleanFrom(
        approvalSources,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBooleanFrom(
      approvalSources,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBooleanFrom(
      approvalSources,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBooleanFrom(
        approvalSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
      readBooleanFrom(
        approvalSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
      readBooleanFrom(
        approvalSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired:
      readBooleanFrom(
        approvalSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired:
      readBooleanFrom(
        approvalSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
        true
      ),
    secretsLeaked: readBooleanFrom([merged, safety], "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([approval], key, false);
  }
  for (const key of CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([approval], key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary
  ) {
    blockers.push(
      "missing_oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_dependency"
    );
  }
  if (
    !fixture.oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed
  ) {
    blockers.push(
      "oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_boundary_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z
  ) {
    blockers.push(
      "oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z
  ) {
    blockers.push(
      "oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z
  ) {
    blockers.push(
      "oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z
  ) {
    blockers.push(
      "oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z !==
    ORO_8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_STATUS
  ) {
    blockers.push(
      "invalid_oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z !==
    ORO8Z_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_SCOPE
  ) {
    blockers.push(
      "invalid_oro8z_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_scope"
    );
  }
  if (!fixture.verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro8z_completion_record_review_approval_record_finalization_review_approval_boundary_only_proof_required"
    );
  }
  if (!fixture.verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly) {
    blockers.push(
      "oro8z_must_confirm_oro8x_completion_record_review_approval_record_finalization_boundary_only"
    );
  }
  if (!fixture.verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly) {
    blockers.push(
      "oro8z_must_confirm_oro8w_completion_record_review_approval_record_boundary_only"
    );
  }
  if (!fixture.verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro8z_must_confirm_oro8v_completion_record_review_approval_boundary_only"
    );
  }
  if (!fixture.verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly) {
    blockers.push("oro8z_must_confirm_oro8u_completion_record_review_boundary_only");
  }
  if (!fixture.verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro8z_must_confirm_oro8t_completion_record_boundary_only");
  }

  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus !==
    ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope !==
    ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_scope"
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
      "finalization_review_approval_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9a`);
  }
  for (const key of CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9a`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_required_after_oro9a"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9a");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9A_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult:
      result,
    dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary:
      fixture.dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
      pass &&
      fixture.oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope
        : HOLD,
    verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      pass &&
      fixture.verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly,
    verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      pass &&
      fixture.verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly,
    verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      pass &&
      fixture.verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      pass && fixture.verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      pass && fixture.verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
  for (const key of CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary;
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
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input =
    buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return evaluateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

function runOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
  input = {}
) {
  return validateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

function buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(
  input = {}
) {
  return evaluateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    input
  );
}

module.exports = {
  ORO9A_PHASE,
  ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO9A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY_STATUS,
  ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
  ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  evaluateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  runOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
};
