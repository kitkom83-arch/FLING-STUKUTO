"use strict";

const {
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary,
} = require("./oro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture"
  );

const failOro8wDependencyMissingFixture = fixture(
  "failOro8wDependencyMissingFixture",
  {
    oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
      {
        dependsOnOro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
          false,
        oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPreparedFromOro8w:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssuedFromOro8w:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassedFromOro8w:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecordedFromOro8w:
          false,
      },
  }
);

const failOro8wCompletionRecordReviewApprovalRecordBoundaryNotPassedFixture =
  fixture(
    "failOro8wCompletionRecordReviewApprovalRecordBoundaryNotPassedFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryPassed:
            false,
        },
    }
  );

const failOro8wCompletionRecordReviewApprovalRecordStatusMismatchFixture =
  fixture(
    "failOro8wCompletionRecordReviewApprovalRecordStatusMismatchFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatusFromOro8w:
            "completion_record_review_approval_record_applied_to_runtime",
        },
    }
  );

const failOro8wCompletionRecordReviewApprovalRecordScopeMismatchFixture =
  fixture(
    "failOro8wCompletionRecordReviewApprovalRecordScopeMismatchFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScopeFromOro8w:
            "actual_live_execution_final_execution_completion_record_review_approval_record_runtime_scope",
        },
    }
  );

const failOro8wNotCompletionRecordReviewApprovalRecordBoundaryOnlyFixture =
  fixture(
    "failOro8wNotCompletionRecordReviewApprovalRecordBoundaryOnlyFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          verifiedOro8wWasCompletionRecordReviewApprovalRecordBoundaryOnly:
            false,
        },
    }
  );

const failOro8wCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture =
  fixture(
    "failOro8wCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          verifiedOro8wConfirmedOro8vWasCompletionRecordReviewApprovalBoundaryOnly:
            false,
        },
    }
  );

const failOro8wCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture =
  fixture(
    "failOro8wCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          verifiedOro8wConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
            false,
        },
    }
  );

const failOro8wCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture =
  fixture(
    "failOro8wCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture",
    {
      oro8wActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryEvidence:
        {
          verifiedOro8wConfirmedOro8tWasCompletionRecordBoundaryOnly: false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationNotPreparedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationNotPreparedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPrepared:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationNotIssuedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationNotIssuedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationIssued:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationNotPassedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationNotPassedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationPassed:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationNotRecordedFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationNotRecordedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRecorded:
            false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationStatusMismatchFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationStatusMismatchFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationStatus:
            "completion_record_review_approval_record_finalized_for_runtime_application",
        },
    }
  );

const failCompletionRecordReviewApprovalRecordFinalizationScopeMismatchFixture =
  fixture(
    "failCompletionRecordReviewApprovalRecordFinalizationScopeMismatchFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationScope:
            "actual_live_execution_final_execution_completion_record_review_approval_record_finalization_runtime_scope",
        },
    }
  );

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
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

const failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture = fixture(
  "failApprovalRecordFinalizationRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRuntimeFinalized:
          true,
      },
  }
);

const failApprovalRecordFinalizationAcceptedForLiveExecutionFixture = fixture(
  "failApprovalRecordFinalizationAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationAcceptedForLiveExecution:
          true,
      },
  }
);

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
    {
      verifiedNoRuntimeActivationOccurred: false,
    },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
      },
  }
);

const failFinalizationReviewBoundaryMissingFixture = fixture(
  "failFinalizationReviewBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewBoundary:
          false,
      },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
    {
      humanApprovalRequiredForActualExecution: false,
    },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
      {
        separateActualExecutionApprovalRequired: false,
      },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
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
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
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
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired:
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

function buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture,
    failOro8wDependencyMissingFixture,
    failOro8wCompletionRecordReviewApprovalRecordBoundaryNotPassedFixture,
    failOro8wCompletionRecordReviewApprovalRecordStatusMismatchFixture,
    failOro8wCompletionRecordReviewApprovalRecordScopeMismatchFixture,
    failOro8wNotCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
    failOro8wCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
    failOro8wCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
    failOro8wCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
    failCompletionRecordReviewApprovalRecordFinalizationNotPreparedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationNotIssuedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationNotPassedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationNotRecordedFixture,
    failCompletionRecordReviewApprovalRecordFinalizationStatusMismatchFixture,
    failCompletionRecordReviewApprovalRecordFinalizationScopeMismatchFixture,
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
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failFinalizationReviewBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
    failSecretShapedValueLeakedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixture,
  failOro8wDependencyMissingFixture,
  failOro8wCompletionRecordReviewApprovalRecordBoundaryNotPassedFixture,
  failOro8wCompletionRecordReviewApprovalRecordStatusMismatchFixture,
  failOro8wCompletionRecordReviewApprovalRecordScopeMismatchFixture,
  failOro8wNotCompletionRecordReviewApprovalRecordBoundaryOnlyFixture,
  failOro8wCannotProveOro8vWasCompletionRecordReviewApprovalBoundaryOnlyFixture,
  failOro8wCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
  failOro8wCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
  failCompletionRecordReviewApprovalRecordFinalizationNotPreparedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationNotIssuedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationNotPassedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationNotRecordedFixture,
  failCompletionRecordReviewApprovalRecordFinalizationStatusMismatchFixture,
  failCompletionRecordReviewApprovalRecordFinalizationScopeMismatchFixture,
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
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failFinalizationReviewBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationMissingFixture,
  failSecretShapedValueLeakedFixture,
  cloneFixture,
  buildOro8xLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundaryFixtures,
};
