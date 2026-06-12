"use strict";

const {
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary,
} = require("./oro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture"
  );

const failOro8vDependencyMissingFixture = fixture(
  "failOro8vDependencyMissingFixture",
  {
    oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
      {
        dependsOnOro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
          false,
        oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPreparedFromOro8v:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssuedFromOro8v:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassedFromOro8v:
          false,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordedFromOro8v:
          false,
      },
  }
);

const failOro8vCompletionRecordReviewApprovalBoundaryNotPassedFixture =
  fixture(
    "failOro8vCompletionRecordReviewApprovalBoundaryNotPassedFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryPassed:
            false,
        },
    }
  );

const failOro8vCompletionRecordReviewApprovalStatusMismatchFixture =
  fixture(
    "failOro8vCompletionRecordReviewApprovalStatusMismatchFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatusFromOro8v:
            "completion_record_review_approval_recorded_for_actual_live_review_approval_record_now",
        },
    }
  );

const failOro8vCompletionRecordReviewApprovalScopeMismatchFixture =
  fixture(
    "failOro8vCompletionRecordReviewApprovalScopeMismatchFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScopeFromOro8v:
            "actual_live_execution_final_execution_completion_record_review_approval_scope_mismatch",
        },
    }
  );

const failOro8vNotCompletionRecordReviewApprovalBoundaryOnlyFixture =
  fixture(
    "failOro8vNotCompletionRecordReviewApprovalBoundaryOnlyFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          verifiedOro8vWasCompletionRecordReviewApprovalBoundaryOnly: false,
        },
    }
  );

const failOro8vCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture =
  fixture(
    "failOro8vCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          verifiedOro8vConfirmedOro8uWasCompletionRecordReviewBoundaryOnly:
            false,
        },
    }
  );

const failOro8vCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture =
  fixture(
    "failOro8vCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture",
    {
      oro8vActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryEvidence:
        {
          verifiedOro8vConfirmedOro8tWasCompletionRecordBoundaryOnly: false,
        },
    }
  );

const failCompletionRecordReviewApprovalRecordNotPreparedFixture = fixture(
  "failCompletionRecordReviewApprovalRecordNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPrepared:
          false,
      },
  }
);

const failCompletionRecordReviewApprovalRecordNotIssuedFixture = fixture(
  "failCompletionRecordReviewApprovalRecordNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordIssued:
          false,
      },
  }
);

const failCompletionRecordReviewApprovalRecordNotPassedFixture = fixture(
  "failCompletionRecordReviewApprovalRecordNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordPassed:
          false,
      },
  }
);

const failCompletionRecordReviewApprovalRecordNotRecordedFixture = fixture(
  "failCompletionRecordReviewApprovalRecordNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordRecorded:
          false,
      },
  }
);

const failCompletionRecordReviewApprovalRecordStatusMismatchFixture = fixture(
  "failCompletionRecordReviewApprovalRecordStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordStatus:
          "completion_record_review_approval_record_applied_to_actual_live_runtime",
      },
  }
);

const failCompletionRecordReviewApprovalRecordScopeMismatchFixture = fixture(
  "failCompletionRecordReviewApprovalRecordScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordScope:
          "actual_live_execution_final_execution_completion_record_review_approval_record_runtime_scope",
      },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoActualLiveExecutionOccurred: false,
        actualExternalCallExecutionLiveExecuted: true,
        actualLiveExecutionExecuted: true,
      },
  }
);

const failRuntimeActivationAttemptedFixture = fixture(
  "failRuntimeActivationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoRuntimeActivationOccurred: false,
        actualExternalCallExecutionActivated: true,
      },
  }
);

const failRuntimeEnablementAttemptedFixture = fixture(
  "failRuntimeEnablementAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoRuntimeEnablementOccurred: false,
        actualExternalCallExecutionRuntimeEnabled: true,
        actualExternalCallExecutionEnabled: true,
      },
  }
);

const failRuntimeAuthorizationAttemptedFixture = fixture(
  "failRuntimeAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoRuntimeAuthorizationOccurred: false,
        actualExternalCallExecutionAuthorized: true,
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

const failExpressMountAttemptedFixture = fixture(
  "failExpressMountAttemptedFixture",
  {
    safetyEvidence: {
      expressMountAllowed: true,
    },
  }
);

const failPublicAliasAttemptedFixture = fixture(
  "failPublicAliasAttemptedFixture",
  {
    safetyEvidence: {
      publicAliasAllowed: true,
    },
  }
);

const failApiBalanceAliasAttemptedFixture = fixture(
  "failApiBalanceAliasAttemptedFixture",
  {
    safetyEvidence: {
      apiBalanceAliasAllowed: true,
    },
  }
);

const failApiTransactionAliasAttemptedFixture = fixture(
  "failApiTransactionAliasAttemptedFixture",
  {
    safetyEvidence: {
      apiTransactionAliasAllowed: true,
    },
  }
);

const failApiOroplayBalanceRouteAttemptedFixture = fixture(
  "failApiOroplayBalanceRouteAttemptedFixture",
  {
    safetyEvidence: {
      apiOroplayBalanceRouteAllowed: true,
    },
  }
);

const failApiOroplayTransactionRouteAttemptedFixture = fixture(
  "failApiOroplayTransactionRouteAttemptedFixture",
  {
    safetyEvidence: {
      apiOroplayTransactionRouteAllowed: true,
    },
  }
);

const failApprovalRecordRuntimeApplicationAttemptedFixture = fixture(
  "failApprovalRecordRuntimeApplicationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordApplied:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForRuntime:
          true,
        actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordAcceptedForLiveExecution:
          true,
      },
  }
);

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoExternalNetworkOccurred: false,
        verifiedNoWalletMutationOccurred: false,
      },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence: {
    verifiedNoRuntimeActivationOccurred: false,
  },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        verifiedNoRouteEnablementOccurred: false,
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

const failApprovalRecordFinalizationBoundaryMissingFixture = fixture(
  "failApprovalRecordFinalizationBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationBoundary:
          false,
      },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
      {
        separateActualExecutionApprovalRequired: false,
      },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
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
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordEvidence:
        {
          separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired:
            false,
        },
    }
  );

function buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture,
    failOro8vDependencyMissingFixture,
    failOro8vCompletionRecordReviewApprovalBoundaryNotPassedFixture,
    failOro8vCompletionRecordReviewApprovalStatusMismatchFixture,
    failOro8vCompletionRecordReviewApprovalScopeMismatchFixture,
    failOro8vNotCompletionRecordReviewApprovalBoundaryOnlyFixture,
    failOro8vCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
    failOro8vCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
    failCompletionRecordReviewApprovalRecordNotPreparedFixture,
    failCompletionRecordReviewApprovalRecordNotIssuedFixture,
    failCompletionRecordReviewApprovalRecordNotPassedFixture,
    failCompletionRecordReviewApprovalRecordNotRecordedFixture,
    failCompletionRecordReviewApprovalRecordStatusMismatchFixture,
    failCompletionRecordReviewApprovalRecordScopeMismatchFixture,
    failActualLiveExecutionAttemptedFixture,
    failRuntimeActivationAttemptedFixture,
    failRuntimeEnablementAttemptedFixture,
    failRuntimeAuthorizationAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaWriteAttemptedFixture,
    failDbTransactionAttemptedFixture,
    failRouteEnablementAttemptedFixture,
    failExpressMountAttemptedFixture,
    failPublicAliasAttemptedFixture,
    failApiBalanceAliasAttemptedFixture,
    failApiTransactionAliasAttemptedFixture,
    failApiOroplayBalanceRouteAttemptedFixture,
    failApiOroplayTransactionRouteAttemptedFixture,
    failApprovalRecordRuntimeApplicationAttemptedFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failSecretShapedValueLeakedFixture,
    failApprovalRecordFinalizationBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixture,
  failOro8vDependencyMissingFixture,
  failOro8vCompletionRecordReviewApprovalBoundaryNotPassedFixture,
  failOro8vCompletionRecordReviewApprovalStatusMismatchFixture,
  failOro8vCompletionRecordReviewApprovalScopeMismatchFixture,
  failOro8vNotCompletionRecordReviewApprovalBoundaryOnlyFixture,
  failOro8vCannotProveOro8uWasCompletionRecordReviewBoundaryOnlyFixture,
  failOro8vCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
  failCompletionRecordReviewApprovalRecordNotPreparedFixture,
  failCompletionRecordReviewApprovalRecordNotIssuedFixture,
  failCompletionRecordReviewApprovalRecordNotPassedFixture,
  failCompletionRecordReviewApprovalRecordNotRecordedFixture,
  failCompletionRecordReviewApprovalRecordStatusMismatchFixture,
  failCompletionRecordReviewApprovalRecordScopeMismatchFixture,
  failActualLiveExecutionAttemptedFixture,
  failRuntimeActivationAttemptedFixture,
  failRuntimeEnablementAttemptedFixture,
  failRuntimeAuthorizationAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaWriteAttemptedFixture,
  failDbTransactionAttemptedFixture,
  failRouteEnablementAttemptedFixture,
  failExpressMountAttemptedFixture,
  failPublicAliasAttemptedFixture,
  failApiBalanceAliasAttemptedFixture,
  failApiTransactionAliasAttemptedFixture,
  failApiOroplayBalanceRouteAttemptedFixture,
  failApiOroplayTransactionRouteAttemptedFixture,
  failApprovalRecordRuntimeApplicationAttemptedFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failSecretShapedValueLeakedFixture,
  failApprovalRecordFinalizationBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordMissingFixture,
  cloneFixture,
  buildOro8wLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundaryFixtures,
};
