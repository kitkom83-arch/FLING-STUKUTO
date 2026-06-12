"use strict";

const {
  CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
  ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
  PASS: ORO9A_PASS,
  buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

const ORO9B_PHASE = "ORO-9B";
const PASS = "PASS";
const HOLD = "HOLD";
const ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE =
  "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS =
  "completion_record_review_approval_record_finalization_review_approval_record_finalized_for_separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_boundary_only";
const ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS =
  ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS;

const CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS = Object.freeze([
  ...CLOSED_ORO9A_ACTUAL_EXECUTION_FLAGS,
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationApplied",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeApplied",
]);

const ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION =
  Object.freeze({
    PHASE: ORO9B_PHASE,
    PASS,
    HOLD,
    ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE,
    ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS,
    ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
    ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  });

const BASELINE_ORO9A_SUMMARY =
  validateOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary()
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
  return closedFlags(CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS);
}

function buildOro9aEvidenceFromSummary(summary) {
  const boundaryPassed =
    summary.result === ORO9A_PASS &&
    summary.liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult ===
      ORO9A_PASS;

  return {
    dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
      true,
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
      boundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded ===
      true,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a:
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope,
    verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly:
      boundaryPassed &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus ===
        ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope ===
        ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApproved ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApplied ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution ===
        false &&
      summary.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApplied ===
        false,
    verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      summary.verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly ===
      true,
    verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      summary.verifiedOro8zConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly ===
      true,
    verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      summary.verifiedOro8zConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly ===
      true,
    verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      summary.verifiedOro8zConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly === true,
    verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      summary.verifiedOro8zConfirmedOro8uWasCompletionRecordReviewBoundaryOnly === true,
    verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly:
      summary.verifiedOro8zConfirmedOro8tWasCompletionRecordBoundaryOnly === true,
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
      summary.verifiedNoRouteEnablementOccurred === true && summary.routeEnablementAllowed === false,
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

function buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  overrides = {}
) {
  const baseline = {
    id: "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture",
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      buildOro9aEvidenceFromSummary(BASELINE_ORO9A_SUMMARY),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
          ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
          ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
        ...closedRuntimeFlags(),
        ...closedActualExecutionFlags(),
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary:
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
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired:
          true,
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired:
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
    buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary();
  const merged = deepMerge(baseline, source);
  const oro9a = isPlainObject(
    merged.oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
  )
    ? merged.oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence
    : {};
  const finalization = isPlainObject(
    merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
  )
    ? merged.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, oro9a];
  const finalizationSources = [merged, finalization];

  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
      readBooleanFrom(
        dependencySources,
        "dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary",
        true
      ),
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
      readBooleanFrom(
        dependencySources,
        "oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a:
      readBooleanFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a:
      readStringFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a",
        ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a:
      readStringFrom(
        dependencySources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a",
        ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
      ),
    verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly",
        true
      ),
    verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly:
      readBooleanFrom(
        dependencySources,
        "verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared:
      readBooleanFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued:
      readBooleanFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed:
      readBooleanFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded:
      readBooleanFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
        true
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
      readStringFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
        ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
      ),
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
      readStringFrom(
        finalizationSources,
        "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
        ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
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
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary:
      readBooleanFrom(
        finalizationSources,
        "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary",
        true
      ),
    humanApprovalRequiredForActualExecution: readBooleanFrom(
      finalizationSources,
      "humanApprovalRequiredForActualExecution",
      true
    ),
    separateActualExecutionApprovalRequired: readBooleanFrom(
      finalizationSources,
      "separateActualExecutionApprovalRequired",
      true
    ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
        true
      ),
    separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired:
      readBooleanFrom(
        finalizationSources,
        "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
        true
      ),
    secretsLeaked: readBooleanFrom([merged, safety], "secretsLeaked", false),
  };

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9a], key, false);
  }
  for (const key of CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS) {
    normalized[key] =
      readBooleanFrom([merged], key, false) ||
      readBooleanFrom([safety], key, false) ||
      readBooleanFrom([finalization], key, false) ||
      readBooleanFrom([oro9a], key, false);
  }

  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary
  ) {
    blockers.push(
      "missing_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_dependency"
    );
  }
  if (
    !fixture.oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed
  ) {
    blockers.push(
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_boundary_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a
  ) {
    blockers.push(
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a
  ) {
    blockers.push(
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a
  ) {
    blockers.push(
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a
  ) {
    blockers.push(
      "oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a !==
    ORO_9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_STATUS
  ) {
    blockers.push(
      "invalid_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a !==
    ORO9A_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_SCOPE
  ) {
    blockers.push(
      "invalid_oro9a_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_scope"
    );
  }
  if (!fixture.verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly) {
    blockers.push(
      "oro9a_completion_record_review_approval_record_finalization_review_approval_record_boundary_only_proof_required"
    );
  }
  if (!fixture.verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro9a_must_confirm_oro8z_completion_record_review_approval_record_finalization_review_approval_boundary_only"
    );
  }
  if (!fixture.verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly) {
    blockers.push(
      "oro9a_must_confirm_oro8x_completion_record_review_approval_record_finalization_boundary_only"
    );
  }
  if (!fixture.verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly) {
    blockers.push(
      "oro9a_must_confirm_oro8w_completion_record_review_approval_record_boundary_only"
    );
  }
  if (!fixture.verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly) {
    blockers.push(
      "oro9a_must_confirm_oro8v_completion_record_review_approval_boundary_only"
    );
  }
  if (!fixture.verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly) {
    blockers.push("oro9a_must_confirm_oro8u_completion_record_review_boundary_only");
  }
  if (!fixture.verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly) {
    blockers.push("oro9a_must_confirm_oro8t_completion_record_boundary_only");
  }

  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_preparation_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_issuance_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_pass_required"
    );
  }
  if (
    !fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded
  ) {
    blockers.push(
      "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_record_required"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus !==
    ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_status"
    );
  }
  if (
    fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope !==
    ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE
  ) {
    blockers.push(
      "invalid_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_scope"
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
      "finalization_review_approval_record_finalization_requires_no_mutation_and_no_external_network_proof"
    );
  }
  if (
    !fixture.verifiedNoRuntimeActivationOccurred ||
    !fixture.verifiedNoRuntimeEnablementOccurred ||
    !fixture.verifiedNoRuntimeAuthorizationOccurred
  ) {
    blockers.push("finalization_review_approval_record_finalization_requires_no_runtime_proof");
  }
  if (
    !fixture.verifiedNoActualLiveExecutionOccurred ||
    !fixture.verifiedNoRouteEnablementOccurred ||
    !fixture.verifiedNoExpressMountOccurred ||
    !fixture.verifiedNoPublicAliasOccurred
  ) {
    blockers.push(
      "finalization_review_approval_record_finalization_requires_no_actual_execution_route_or_alias_proof"
    );
  }

  for (const key of CLOSED_RUNTIME_AND_SAFETY_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9b`);
  }
  for (const key of CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS) {
    if (fixture[key]) blockers.push(`${key}_not_allowed_in_oro9b`);
  }

  if (
    !fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary ||
    !fixture.humanApprovalRequiredForActualExecution ||
    !fixture.separateActualExecutionApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired ||
    !fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired
  ) {
    blockers.push(
      "separate_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_boundary_required_after_oro9b"
    );
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive_output_not_allowed_in_oro9b");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO9B_PHASE,
    result,
    fixtureId: fixture.id,
    liveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult:
      result,
    dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
      fixture.dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
      pass &&
      fixture.oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded:
      pass &&
      fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus
        : HOLD,
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
      pass
        ? fixture.actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope
        : HOLD,
    verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly:
      pass &&
      fixture.verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly,
    verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
      pass &&
      fixture.verifiedOro9aConfirmedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly,
    verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
      pass &&
      fixture.verifiedOro9aConfirmedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly,
    verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
      pass &&
      fixture.verifiedOro9aConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly,
    verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
      pass && fixture.verifiedOro9aConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly,
    verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
      pass && fixture.verifiedOro9aConfirmedOro8uWasCompletionRecordReviewBoundaryOnly,
    verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly:
      pass && fixture.verifiedOro9aConfirmedOro8tWasCompletionRecordBoundaryOnly,
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
  for (const key of CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS) {
    output[key] = false;
  }

  output.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary =
    pass &&
    fixture.nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary;
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
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired;
  output.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired =
    pass &&
    fixture.separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired;
  output.secretsLeaked = false;
  output.blockers = blockers;

  return output;
}

function evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input =
    buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function runOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
  input = {}
) {
  return validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

function buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(
  input = {}
) {
  return evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    input
  );
}

module.exports = {
  ORO9B_PHASE,
  ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_SCOPE,
  ORO9B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY_STATUS,
  ORO_9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_STATUS,
  ORO9B_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  CLOSED_ORO9B_ACTUAL_EXECUTION_FLAGS,
  PASS,
  HOLD,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  evaluateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
};
