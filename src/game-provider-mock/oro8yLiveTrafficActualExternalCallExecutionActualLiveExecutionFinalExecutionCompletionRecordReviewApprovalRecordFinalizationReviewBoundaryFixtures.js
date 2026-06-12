"use strict";

const {
  buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );

const failOro8xDependencyMissingFixture = fixture(
  "failOro8xDependencyMissingFixture",
  {
    oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        dependsOnOro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary:
          false,
        oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryPassed:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPreparedFromOro8x:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssuedFromOro8x:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassedFromOro8x:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecordedFromOro8x:
          false,
      },
  }
);

const failOro8xFinalizationBoundaryNotPassedFixture = fixture(
  "failOro8xFinalizationBoundaryNotPassedFixture",
  {
    oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryPassed:
          false,
      },
  }
);

const failOro8xFinalizationStatusMismatchFixture = fixture(
  "failOro8xFinalizationStatusMismatchFixture",
  {
    oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatusFromOro8x:
          "completion_record_review_approval_record_finalization_applied_to_runtime",
      },
  }
);

const failOro8xFinalizationScopeMismatchFixture = fixture(
  "failOro8xFinalizationScopeMismatchFixture",
  {
    oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScopeFromOro8x:
          "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_runtime_scope",
      },
  }
);

const failOro8xNotFinalizationBoundaryOnlyFixture = fixture(
  "failOro8xNotFinalizationBoundaryOnlyFixture",
  {
    oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
      {
        verifiedOro8xWasCompletionRecordReviewApprovalRecordFinalizationBoundaryOnly:
          false,
      },
  }
);

const failOro8xCannotProveOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnlyFixture =
  fixture(
    "failOro8xCannotProveOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnlyFixture",
    {
      oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
        {
          verifiedOro8xConfirmedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
            false,
        },
    }
  );

const failOro8xCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture =
  fixture(
    "failOro8xCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture",
    {
      oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
        {
          verifiedOro8xConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
            false,
        },
    }
  );

const failOro8xCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture =
  fixture(
    "failOro8xCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture",
    {
      oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
        {
          verifiedOro8xConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
            false,
        },
    }
  );

const failOro8xCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture =
  fixture(
    "failOro8xCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture",
    {
      oro8xActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryEvidence:
        {
          verifiedOro8xConfirmedOro8tWasCompletionRecordBoundaryOnly: false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewNotPreparedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewNotPreparedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPrepared:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewNotIssuedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewNotIssuedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewIssued:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewNotPassedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewNotPassedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewPassed:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewNotRecordedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewNotRecordedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRecorded:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewStatusMismatchFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewStatusMismatchFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewStatus:
            "completion_record_review_approval_record_finalization_review_applied_to_runtime",
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationReviewScopeMismatchFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationReviewScopeMismatchFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewScope:
            "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_runtime_scope",
        },
    }
  );

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
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

const failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture =
  fixture(
    "failApprovalRecordFinalizationReviewRuntimeApplicationAttemptedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewed:
            true,
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApplied:
            true,
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForRuntime:
            true,
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRuntimeApplied:
            true,
        },
    }
  );

const failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture =
  fixture(
    "failApprovalRecordFinalizationReviewAcceptedForLiveExecutionFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution:
            true,
        },
    }
  );

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failFinalizationReviewApprovalBoundaryMissingFixture = fixture(
  "failFinalizationReviewApprovalBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalBoundary:
          false,
      },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
    {
      humanApprovalRequiredForActualExecution: false,
    },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
      {
        separateActualExecutionApprovalRequired: false,
      },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
            false,
        },
    }
  );

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
            false,
        },
    }
  );

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
            false,
        },
    }
  );

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired:
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

function buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture,
    failOro8xDependencyMissingFixture,
    failOro8xFinalizationBoundaryNotPassedFixture,
    failOro8xFinalizationStatusMismatchFixture,
    failOro8xFinalizationScopeMismatchFixture,
    failOro8xNotFinalizationBoundaryOnlyFixture,
    failOro8xCannotProveOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
    failOro8xCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
    failOro8xCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
    failOro8xCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewNotPreparedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewNotIssuedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewNotPassedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewNotRecordedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewStatusMismatchFixture,
    failCompletionRecordReviewApprovalRecordFinalizationReviewScopeMismatchFixture,
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
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failFinalizationReviewApprovalBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixture,
  failOro8xDependencyMissingFixture,
  failOro8xFinalizationBoundaryNotPassedFixture,
  failOro8xFinalizationStatusMismatchFixture,
  failOro8xFinalizationScopeMismatchFixture,
  failOro8xNotFinalizationBoundaryOnlyFixture,
  failOro8xCannotProveOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
  failOro8xCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
  failOro8xCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
  failOro8xCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewNotPreparedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewNotIssuedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewNotPassedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewNotRecordedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewStatusMismatchFixture,
  failCompletionRecordReviewApprovalRecordFinalizationReviewScopeMismatchFixture,
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
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failFinalizationReviewApprovalBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro8yLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
