"use strict";

const {
  buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
  );

const failOro8zDependencyMissingFixture = fixture(
  "failOro8zDependencyMissingFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        dependsOnOro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary:
          false,
        oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPreparedFromOro8z:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssuedFromOro8z:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassedFromOro8z:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordedFromOro8z:
          false,
      },
  }
);

const failOro8zFinalizationReviewApprovalBoundaryNotPassedFixture = fixture(
  "failOro8zFinalizationReviewApprovalBoundaryNotPassedFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
          false,
      },
  }
);

const failOro8zFinalizationReviewStatusMismatchFixture = fixture(
  "failOro8zFinalizationReviewStatusMismatchFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatusFromOro8z:
          "completion_record_review_approval_record_finalization_review_applied_to_runtime",
      },
  }
);

const failOro8zFinalizationReviewScopeMismatchFixture = fixture(
  "failOro8zFinalizationReviewScopeMismatchFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScopeFromOro8z:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_runtime_scope",
      },
  }
);

const failOro8zNotFinalizationReviewApprovalBoundaryOnlyFixture = fixture(
  "failOro8zNotFinalizationReviewApprovalBoundaryOnlyFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        verifiedOro8zWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPreparedFixture = fixture(
  "failFinalizationReviewApprovalNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPrepared:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotIssuedFixture = fixture(
  "failFinalizationReviewApprovalNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssued:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPassedFixture = fixture(
  "failFinalizationReviewApprovalNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassed:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotRecordedFixture = fixture(
  "failFinalizationReviewApprovalNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecorded:
          false,
      },
  }
);

const failFinalizationReviewApprovalStatusMismatchFixture = fixture(
  "failFinalizationReviewApprovalStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatus:
          "completion_record_review_approval_record_finalization_review_approval_applied_to_runtime",
      },
  }
);

const failFinalizationReviewApprovalScopeMismatchFixture = fixture(
  "failFinalizationReviewApprovalScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScope:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_runtime_scope",
      },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        verifiedNoActualLiveExecutionOccurred: false,
        actualExternalCallExecutionLiveExecuted: true,
        actualLiveExecutionExecuted: true,
      },
  }
);

const failExternalNetworkAttemptedFixture = fixture(
  "failExternalNetworkAttemptedFixture",
  {
    safetyEvidence: {
      externalNetworkAllowed: true,
      externalNetworkCalled: true,
    },
  }
);

const failLiveOroPlayApiCallAttemptedFixture = fixture(
  "failLiveOroPlayApiCallAttemptedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
      liveOroPlayApiCalled: true,
    },
  }
);

const failWalletMutationAttemptedFixture = fixture(
  "failWalletMutationAttemptedFixture",
  {
    safetyEvidence: {
      walletMutationAllowed: true,
      walletMutationPerformed: true,
    },
  }
);

const failLedgerMutationAttemptedFixture = fixture(
  "failLedgerMutationAttemptedFixture",
  {
    safetyEvidence: {
      ledgerMutationAllowed: true,
      ledgerMutationPerformed: true,
    },
  }
);

const failPrismaWriteAttemptedFixture = fixture(
  "failPrismaWriteAttemptedFixture",
  {
    safetyEvidence: {
      prismaWriteAllowed: true,
      prismaWritePerformed: true,
    },
  }
);

const failDbTransactionAttemptedFixture = fixture(
  "failDbTransactionAttemptedFixture",
  {
    safetyEvidence: {
      dbTransactionAllowed: true,
      dbTransactionPerformed: true,
    },
  }
);

const failRouteEnablementAttemptedFixture = fixture(
  "failRouteEnablementAttemptedFixture",
  {
    safetyEvidence: {
      routeEnablementAllowed: true,
    },
  }
);

const failPublicAliasAttemptedFixture = fixture(
  "failPublicAliasAttemptedFixture",
  {
    safetyEvidence: {
      publicAliasAllowed: true,
      apiBalanceAliasAllowed: true,
      apiTransactionAliasAllowed: true,
      apiOroplayBalanceRouteAllowed: true,
      apiOroplayTransactionRouteAllowed: true,
    },
  }
);

const failFinalizationReviewApprovalRuntimeApplicationAttemptedFixture = fixture(
  "failFinalizationReviewApprovalRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApproved:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApplied:
          true,
      },
  }
);

const failFinalizationReviewApprovalAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution:
          true,
      },
  }
);

const failActualExecutionAuthorizationAttemptedFixture = fixture(
  "failActualExecutionAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        actualExternalCallExecutionAuthorized: true,
        actualLiveExecutionApproved: true,
        actualLiveExecutionDecisionApproved: true,
      },
  }
);

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    oro8zActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failNextApprovalRecordBoundaryMissingFixture = fixture(
  "failNextApprovalRecordBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
          false,
      },
  }
);

const failSeparateFinalizationReviewApprovalRequiredMissingFixture = fixture(
  "failSeparateFinalizationReviewApprovalRequiredMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired:
          false,
      },
  }
);

const failSecretShapedValueLeakedFixture = fixture(
  "failSecretShapedValueLeakedFixture",
  {
    safetyEvidence: {
      secretsLeaked: true,
    },
  }
);

function buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
    failOro8zDependencyMissingFixture,
    failOro8zFinalizationReviewApprovalBoundaryNotPassedFixture,
    failOro8zFinalizationReviewStatusMismatchFixture,
    failOro8zFinalizationReviewScopeMismatchFixture,
    failOro8zNotFinalizationReviewApprovalBoundaryOnlyFixture,
    failFinalizationReviewApprovalNotPreparedFixture,
    failFinalizationReviewApprovalNotIssuedFixture,
    failFinalizationReviewApprovalNotPassedFixture,
    failFinalizationReviewApprovalNotRecordedFixture,
    failFinalizationReviewApprovalStatusMismatchFixture,
    failFinalizationReviewApprovalScopeMismatchFixture,
    failActualLiveExecutionAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaWriteAttemptedFixture,
    failDbTransactionAttemptedFixture,
    failRouteEnablementAttemptedFixture,
    failPublicAliasAttemptedFixture,
    failFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
    failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
    failActualExecutionAuthorizationAttemptedFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failNextApprovalRecordBoundaryMissingFixture,
    failSeparateFinalizationReviewApprovalRequiredMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
  failOro8zDependencyMissingFixture,
  failOro8zFinalizationReviewApprovalBoundaryNotPassedFixture,
  failOro8zFinalizationReviewStatusMismatchFixture,
  failOro8zFinalizationReviewScopeMismatchFixture,
  failOro8zNotFinalizationReviewApprovalBoundaryOnlyFixture,
  failFinalizationReviewApprovalNotPreparedFixture,
  failFinalizationReviewApprovalNotIssuedFixture,
  failFinalizationReviewApprovalNotPassedFixture,
  failFinalizationReviewApprovalNotRecordedFixture,
  failFinalizationReviewApprovalStatusMismatchFixture,
  failFinalizationReviewApprovalScopeMismatchFixture,
  failActualLiveExecutionAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaWriteAttemptedFixture,
  failDbTransactionAttemptedFixture,
  failRouteEnablementAttemptedFixture,
  failPublicAliasAttemptedFixture,
  failFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
  failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
  failActualExecutionAuthorizationAttemptedFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failNextApprovalRecordBoundaryMissingFixture,
  failSeparateFinalizationReviewApprovalRequiredMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro9aLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures,
};
