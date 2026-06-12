"use strict";

const {
  buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );

const failOro9bDependencyMissingFixture = fixture("failOro9bDependencyMissingFixture", {
  oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
    {
      dependsOnOro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
        false,
      oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPreparedFromOro9b:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssuedFromOro9b:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassedFromOro9b:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecordedFromOro9b:
        false,
    },
});

const failOro9bFinalizationBoundaryNotPassedFixture = fixture(
  "failOro9bFinalizationBoundaryNotPassedFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed:
          false,
      },
  }
);

const failOro9bFinalizationStatusMismatchFixture = fixture(
  "failOro9bFinalizationStatusMismatchFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9b:
          "completion_record_review_approval_record_finalization_review_approval_record_finalized_for_runtime",
      },
  }
);

const failOro9bFinalizationScopeMismatchFixture = fixture(
  "failOro9bFinalizationScopeMismatchFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9b:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_runtime_scope",
      },
  }
);

const failOro9bNotFinalizationBoundaryOnlyFixture = fixture(
  "failOro9bNotFinalizationBoundaryOnlyFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        verifiedOro9bWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly:
          false,
      },
  }
);

const failFinalizationReviewNotPreparedFixture = fixture(
  "failFinalizationReviewNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared:
          false,
      },
  }
);

const failFinalizationReviewNotIssuedFixture = fixture(
  "failFinalizationReviewNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued:
          false,
      },
  }
);

const failFinalizationReviewNotPassedFixture = fixture(
  "failFinalizationReviewNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed:
          false,
      },
  }
);

const failFinalizationReviewNotRecordedFixture = fixture(
  "failFinalizationReviewNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded:
          false,
      },
  }
);

const failFinalizationReviewStatusMismatchFixture = fixture(
  "failFinalizationReviewStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus:
          "completion_record_review_approval_record_finalization_review_approval_record_finalization_reviewed_for_runtime",
      },
  }
);

const failFinalizationReviewScopeMismatchFixture = fixture(
  "failFinalizationReviewScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_runtime_scope",
      },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        verifiedNoActualLiveExecutionOccurred: false,
      },
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
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

const failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture = fixture(
  "failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeApplied:
          true,
      },
  }
);

const failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture = fixture(
  "failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution:
          true,
      },
  }
);

const failActualExecutionAuthorizationAttemptedFixture = fixture(
  "failActualExecutionAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
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
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    oro9bActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failNextFinalizationReviewApprovalBoundaryMissingFixture = fixture(
  "failNextFinalizationReviewApprovalBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary:
          false,
      },
  }
);

const failSeparateFinalizationReviewRequirementMissingFixture = fixture(
  "failSeparateFinalizationReviewRequirementMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
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

function buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
    failOro9bDependencyMissingFixture,
    failOro9bFinalizationBoundaryNotPassedFixture,
    failOro9bFinalizationStatusMismatchFixture,
    failOro9bFinalizationScopeMismatchFixture,
    failOro9bNotFinalizationBoundaryOnlyFixture,
    failFinalizationReviewNotPreparedFixture,
    failFinalizationReviewNotIssuedFixture,
    failFinalizationReviewNotPassedFixture,
    failFinalizationReviewNotRecordedFixture,
    failFinalizationReviewStatusMismatchFixture,
    failFinalizationReviewScopeMismatchFixture,
    failActualLiveExecutionAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaWriteAttemptedFixture,
    failDbTransactionAttemptedFixture,
    failRouteEnablementAttemptedFixture,
    failPublicAliasAttemptedFixture,
    failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture,
    failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture,
    failActualExecutionAuthorizationAttemptedFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failNextFinalizationReviewApprovalBoundaryMissingFixture,
    failSeparateFinalizationReviewRequirementMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
  failOro9bDependencyMissingFixture,
  failOro9bFinalizationBoundaryNotPassedFixture,
  failOro9bFinalizationStatusMismatchFixture,
  failOro9bFinalizationScopeMismatchFixture,
  failOro9bNotFinalizationBoundaryOnlyFixture,
  failFinalizationReviewNotPreparedFixture,
  failFinalizationReviewNotIssuedFixture,
  failFinalizationReviewNotPassedFixture,
  failFinalizationReviewNotRecordedFixture,
  failFinalizationReviewStatusMismatchFixture,
  failFinalizationReviewScopeMismatchFixture,
  failActualLiveExecutionAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaWriteAttemptedFixture,
  failDbTransactionAttemptedFixture,
  failRouteEnablementAttemptedFixture,
  failPublicAliasAttemptedFixture,
  failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture,
  failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture,
  failActualExecutionAuthorizationAttemptedFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failNextFinalizationReviewApprovalBoundaryMissingFixture,
  failSeparateFinalizationReviewRequirementMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro9cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
