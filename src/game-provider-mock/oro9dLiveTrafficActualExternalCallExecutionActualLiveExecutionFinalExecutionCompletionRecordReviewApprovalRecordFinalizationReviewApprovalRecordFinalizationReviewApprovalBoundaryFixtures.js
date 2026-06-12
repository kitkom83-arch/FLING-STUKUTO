"use strict";

const {
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );

const failOro9cDependencyMissingFixture = fixture("failOro9cDependencyMissingFixture", {
  oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
    {
      dependsOnOro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary:
        false,
      oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPreparedFromOro9c:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssuedFromOro9c:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassedFromOro9c:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecordedFromOro9c:
        false,
    },
});

const failOro9cFinalizationBoundaryNotPassedFixture = fixture(
  "failOro9cFinalizationBoundaryNotPassedFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed:
          false,
      },
  }
);

const failOro9cFinalizationStatusMismatchFixture = fixture(
  "failOro9cFinalizationStatusMismatchFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9c:
          "completion_record_review_approval_record_finalization_review_approval_record_finalized_for_runtime",
      },
  }
);

const failOro9cFinalizationScopeMismatchFixture = fixture(
  "failOro9cFinalizationScopeMismatchFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9c:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_runtime_scope",
      },
  }
);

const failOro9cNotFinalizationBoundaryOnlyFixture = fixture(
  "failOro9cNotFinalizationBoundaryOnlyFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedOro9cWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPreparedFixture = fixture(
  "failFinalizationReviewApprovalNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotIssuedFixture = fixture(
  "failFinalizationReviewApprovalNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotPassedFixture = fixture(
  "failFinalizationReviewApprovalNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed:
          false,
      },
  }
);

const failFinalizationReviewApprovalNotRecordedFixture = fixture(
  "failFinalizationReviewApprovalNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded:
          false,
      },
  }
);

const failFinalizationReviewApprovalStatusMismatchFixture = fixture(
  "failFinalizationReviewApprovalStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus:
          "completion_record_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_runtime",
      },
  }
);

const failFinalizationReviewApprovalScopeMismatchFixture = fixture(
  "failFinalizationReviewApprovalScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_runtime_scope",
      },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedNoActualLiveExecutionOccurred: false,
      },
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
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

const failWalletMutationAttemptedFixture = fixture("failWalletMutationAttemptedFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
    walletMutationPerformed: true,
  },
});

const failLedgerMutationAttemptedFixture = fixture("failLedgerMutationAttemptedFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
    ledgerMutationPerformed: true,
  },
});

const failPrismaWriteAttemptedFixture = fixture("failPrismaWriteAttemptedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
  },
});

const failDbTransactionAttemptedFixture = fixture("failDbTransactionAttemptedFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
    dbTransactionPerformed: true,
  },
});

const failRouteEnablementAttemptedFixture = fixture(
  "failRouteEnablementAttemptedFixture",
  {
    safetyEvidence: {
      routeEnablementAllowed: true,
    },
  }
);

const failPublicAliasAttemptedFixture = fixture("failPublicAliasAttemptedFixture", {
  safetyEvidence: {
    publicAliasAllowed: true,
    apiBalanceAliasAllowed: true,
    apiTransactionAliasAllowed: true,
    apiOroplayBalanceRouteAllowed: true,
    apiOroplayTransactionRouteAllowed: true,
  },
});

const failApprovalRecordFinalizationReviewApprovalRuntimeApplicationAttemptedFixture = fixture(
  "failApprovalRecordFinalizationReviewApprovalRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeApplied:
          true,
      },
  }
);

const failApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecutionFixture = fixture(
  "failApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution:
          true,
      },
  }
);

const failActualExecutionAuthorizationAttemptedFixture = fixture(
  "failActualExecutionAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
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
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    oro9cActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failNextFinalizationReviewApprovalRecordBoundaryMissingFixture = fixture(
  "failNextFinalizationReviewApprovalRecordBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
          false,
      },
  }
);

const failSeparateFinalizationReviewApprovalRequirementMissingFixture = fixture(
  "failSeparateFinalizationReviewApprovalRequirementMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired:
          false,
      },
  }
);

const failSecretShapedValueLeakedFixture = fixture("failSecretShapedValueLeakedFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
    failOro9cDependencyMissingFixture,
    failOro9cFinalizationBoundaryNotPassedFixture,
    failOro9cFinalizationStatusMismatchFixture,
    failOro9cFinalizationScopeMismatchFixture,
    failOro9cNotFinalizationBoundaryOnlyFixture,
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
    failApprovalRecordFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
    failApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
    failActualExecutionAuthorizationAttemptedFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failNextFinalizationReviewApprovalRecordBoundaryMissingFixture,
    failSeparateFinalizationReviewApprovalRequirementMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
  failOro9cDependencyMissingFixture,
  failOro9cFinalizationBoundaryNotPassedFixture,
  failOro9cFinalizationStatusMismatchFixture,
  failOro9cFinalizationScopeMismatchFixture,
  failOro9cNotFinalizationBoundaryOnlyFixture,
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
  failApprovalRecordFinalizationReviewApprovalRuntimeApplicationAttemptedFixture,
  failApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
  failActualExecutionAuthorizationAttemptedFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failNextFinalizationReviewApprovalRecordBoundaryMissingFixture,
  failSeparateFinalizationReviewApprovalRequirementMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro9dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures,
};
