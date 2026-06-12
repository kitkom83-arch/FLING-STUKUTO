"use strict";

const {
  buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );

const failOro8yDependencyMissingFixture = fixture(
  "failOro8yDependencyMissingFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        dependsOnOro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary:
          false,
        oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryPassed:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPreparedFromOro8y:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssuedFromOro8y:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassedFromOro8y:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecordedFromOro8y:
          false,
      },
  }
);

const failOro8yFinalizationReviewBoundaryNotPassedFixture = fixture(
  "failOro8yFinalizationReviewBoundaryNotPassedFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryPassed:
          false,
      },
  }
);

const failOro8yFinalizationReviewStatusMismatchFixture = fixture(
  "failOro8yFinalizationReviewStatusMismatchFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatusFromOro8y:
          "completion_record_review_approval_record_finalization_review_applied_to_runtime",
      },
  }
);

const failOro8yFinalizationReviewScopeMismatchFixture = fixture(
  "failOro8yFinalizationReviewScopeMismatchFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScopeFromOro8y:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_runtime_scope",
      },
  }
);

const failOro8yNotFinalizationReviewBoundaryOnlyFixture = fixture(
  "failOro8yNotFinalizationReviewBoundaryOnlyFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedOro8yWasCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryOnly:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPreparedFixture = fixture(
  "failFinalizationReviewApprovalNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPrepared:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotIssuedFixture = fixture(
  "failFinalizationReviewApprovalNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalIssued:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPassedFixture = fixture(
  "failFinalizationReviewApprovalNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalPassed:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotRecordedFixture = fixture(
  "failFinalizationReviewApprovalNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecorded:
          false,
      },
  }
);

const failFinalizationReviewApprovalStatusMismatchFixture = fixture(
  "failFinalizationReviewApprovalStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalStatus:
          "completion_record_review_approval_record_finalization_review_approval_applied_to_runtime",
      },
  }
);

const failFinalizationReviewApprovalScopeMismatchFixture = fixture(
  "failFinalizationReviewApprovalScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalScope:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_runtime_scope",
      },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
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
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApproved:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied:
          true,
      },
  }
);

const failFinalizationReviewApprovalAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution:
          true,
      },
  }
);

const failActualExecutionAuthorizationAttemptedFixture = fixture(
  "failActualExecutionAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
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
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    oro8yActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failNextApprovalRecordBoundaryMissingFixture = fixture(
  "failNextApprovalRecordBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
          false,
      },
  }
);

const failSeparateFinalizationReviewApprovalRequiredMissingFixture = fixture(
  "failSeparateFinalizationReviewApprovalRequiredMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired:
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

function buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
    failOro8yDependencyMissingFixture,
    failOro8yFinalizationReviewBoundaryNotPassedFixture,
    failOro8yFinalizationReviewStatusMismatchFixture,
    failOro8yFinalizationReviewScopeMismatchFixture,
    failOro8yNotFinalizationReviewBoundaryOnlyFixture,
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
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
  failOro8yDependencyMissingFixture,
  failOro8yFinalizationReviewBoundaryNotPassedFixture,
  failOro8yFinalizationReviewStatusMismatchFixture,
  failOro8yFinalizationReviewScopeMismatchFixture,
  failOro8yNotFinalizationReviewBoundaryOnlyFixture,
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
  buildOro8zLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures,
};
