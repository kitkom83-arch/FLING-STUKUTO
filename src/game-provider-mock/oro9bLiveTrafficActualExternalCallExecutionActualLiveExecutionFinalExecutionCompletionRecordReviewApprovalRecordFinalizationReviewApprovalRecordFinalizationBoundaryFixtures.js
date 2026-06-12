"use strict";

const {
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = require("./oro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
  );

const failOro9aDependencyMissingFixture = fixture("failOro9aDependencyMissingFixture", {
  oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
    {
      dependsOnOro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
        false,
      oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPreparedFromOro9a:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordIssuedFromOro9a:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordPassedFromOro9a:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRecordedFromOro9a:
        false,
    },
});

const failOro9aFinalizationReviewApprovalRecordBoundaryNotPassedFixture = fixture(
  "failOro9aFinalizationReviewApprovalRecordBoundaryNotPassedFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
          false,
      },
  }
);

const failOro9aFinalizationReviewApprovalRecordStatusMismatchFixture = fixture(
  "failOro9aFinalizationReviewApprovalRecordStatusMismatchFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9a:
          "completion_record_review_approval_record_finalization_review_approval_record_applied_to_runtime",
      },
  }
);

const failOro9aFinalizationReviewApprovalRecordScopeMismatchFixture = fixture(
  "failOro9aFinalizationReviewApprovalRecordScopeMismatchFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9a:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_runtime_scope",
      },
  }
);

const failOro9aNotFinalizationReviewApprovalRecordBoundaryOnlyFixture = fixture(
  "failOro9aNotFinalizationReviewApprovalRecordBoundaryOnlyFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        verifiedOro9aWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly:
          false,
      },
  }
);

const failFinalizationNotPreparedFixture = fixture("failFinalizationNotPreparedFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared:
        false,
    },
});

const failFinalizationNotIssuedFixture = fixture("failFinalizationNotIssuedFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued:
        false,
    },
});

const failFinalizationNotPassedFixture = fixture("failFinalizationNotPassedFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed:
        false,
    },
});

const failFinalizationNotRecordedFixture = fixture("failFinalizationNotRecordedFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded:
        false,
    },
});

const failFinalizationStatusMismatchFixture = fixture(
  "failFinalizationStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus:
          "completion_record_review_approval_record_finalization_review_approval_record_finalized_for_runtime",
      },
  }
);

const failFinalizationScopeMismatchFixture = fixture("failFinalizationScopeMismatchFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope:
        "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_runtime_scope",
    },
});

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        verifiedNoActualLiveExecutionOccurred: false,
      },
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
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

const failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture = fixture(
  "failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeApplied:
          true,
      },
  }
);

const failApprovalRecordFinalizationAcceptedForLiveExecutionFixture = fixture(
  "failApprovalRecordFinalizationAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution:
          true,
      },
  }
);

const failActualExecutionAuthorizationAttemptedFixture = fixture(
  "failActualExecutionAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
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
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    oro9aActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failNextFinalizationReviewBoundaryMissingFixture = fixture(
  "failNextFinalizationReviewBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary:
          false,
      },
  }
);

const failSeparateFinalizationRequirementMissingFixture = fixture(
  "failSeparateFinalizationRequirementMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired:
          false,
      },
  }
);

const failSecretShapedValueLeakedFixture = fixture("failSecretShapedValueLeakedFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
    failOro9aDependencyMissingFixture,
    failOro9aFinalizationReviewApprovalRecordBoundaryNotPassedFixture,
    failOro9aFinalizationReviewApprovalRecordStatusMismatchFixture,
    failOro9aFinalizationReviewApprovalRecordScopeMismatchFixture,
    failOro9aNotFinalizationReviewApprovalRecordBoundaryOnlyFixture,
    failFinalizationNotPreparedFixture,
    failFinalizationNotIssuedFixture,
    failFinalizationNotPassedFixture,
    failFinalizationNotRecordedFixture,
    failFinalizationStatusMismatchFixture,
    failFinalizationScopeMismatchFixture,
    failActualLiveExecutionAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaWriteAttemptedFixture,
    failDbTransactionAttemptedFixture,
    failRouteEnablementAttemptedFixture,
    failPublicAliasAttemptedFixture,
    failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture,
    failApprovalRecordFinalizationAcceptedForLiveExecutionFixture,
    failActualExecutionAuthorizationAttemptedFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failNextFinalizationReviewBoundaryMissingFixture,
    failSeparateFinalizationRequirementMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
  failOro9aDependencyMissingFixture,
  failOro9aFinalizationReviewApprovalRecordBoundaryNotPassedFixture,
  failOro9aFinalizationReviewApprovalRecordStatusMismatchFixture,
  failOro9aFinalizationReviewApprovalRecordScopeMismatchFixture,
  failOro9aNotFinalizationReviewApprovalRecordBoundaryOnlyFixture,
  failFinalizationNotPreparedFixture,
  failFinalizationNotIssuedFixture,
  failFinalizationNotPassedFixture,
  failFinalizationNotRecordedFixture,
  failFinalizationStatusMismatchFixture,
  failFinalizationScopeMismatchFixture,
  failActualLiveExecutionAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaWriteAttemptedFixture,
  failDbTransactionAttemptedFixture,
  failRouteEnablementAttemptedFixture,
  failPublicAliasAttemptedFixture,
  failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture,
  failApprovalRecordFinalizationAcceptedForLiveExecutionFixture,
  failActualExecutionAuthorizationAttemptedFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failNextFinalizationReviewBoundaryMissingFixture,
  failSeparateFinalizationRequirementMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro9bLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures,
};
