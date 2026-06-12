"use strict";

const {
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary,
} = require("./oro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture"
  );

const failOro8uDependencyMissingFixture = fixture(
  "failOro8uDependencyMissingFixture",
  {
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
      dependsOnOro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
        false,
      oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewPreparedFromOro8u:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewIssuedFromOro8u:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewPassedFromOro8u:
        false,
      actualLiveExecutionFinalExecutionCompletionRecordReviewRecordedFromOro8u:
        false,
    },
  }
);

const failOro8uCompletionRecordReviewBoundaryNotPassedFixture = fixture(
  "failOro8uCompletionRecordReviewBoundaryNotPassedFixture",
  {
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
      oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryPassed:
        false,
    },
  }
);

const failOro8uCompletionRecordReviewStatusMismatchFixture = fixture(
  "failOro8uCompletionRecordReviewStatusMismatchFixture",
  {
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewStatusFromOro8u:
        "completion_record_reviewed_for_actual_live_review_approval_now",
    },
  }
);

const failOro8uCompletionRecordReviewScopeMismatchFixture = fixture(
  "failOro8uCompletionRecordReviewScopeMismatchFixture",
  {
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewScopeFromOro8u:
        "actual_live_execution_final_execution_completion_record_review_scope_mismatch",
    },
  }
);

const failOro8uNotCompletionRecordReviewBoundaryOnlyFixture = fixture(
  "failOro8uNotCompletionRecordReviewBoundaryOnlyFixture",
  {
    oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
      verifiedOro8uWasCompletionRecordReviewBoundaryOnly: false,
    },
  }
);

const failOro8uCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture =
  fixture(
    "failOro8uCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture",
    {
      oro8uActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryEvidence: {
        verifiedOro8uConfirmedOro8tWasCompletionRecordBoundaryOnly: false,
      },
    }
  );

const failCompletionRecordReviewApprovalNotPreparedFixture = fixture(
  "failCompletionRecordReviewApprovalNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPrepared:
        false,
    },
  }
);

const failCompletionRecordReviewApprovalNotIssuedFixture = fixture(
  "failCompletionRecordReviewApprovalNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalIssued: false,
    },
  }
);

const failCompletionRecordReviewApprovalNotPassedFixture = fixture(
  "failCompletionRecordReviewApprovalNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalPassed: false,
    },
  }
);

const failCompletionRecordReviewApprovalNotRecordedFixture = fixture(
  "failCompletionRecordReviewApprovalNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecorded:
        false,
    },
  }
);

const failCompletionRecordReviewApprovalStatusMismatchFixture = fixture(
  "failCompletionRecordReviewApprovalStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalStatus:
        "completion_record_review_approval_recorded_for_actual_live_review_approval_now",
    },
  }
);

const failCompletionRecordReviewApprovalScopeMismatchFixture = fixture(
  "failCompletionRecordReviewApprovalScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalScope:
        "actual_live_execution_final_execution_completion_record_review_approval_scope_mismatch",
    },
  }
);

const failActualLiveExecutionAttemptedFixture = fixture(
  "failActualLiveExecutionAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failRuntimeActivationAttemptedFixture = fixture(
  "failRuntimeActivationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      verifiedNoRuntimeActivationOccurred: false,
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failRuntimeEnablementAttemptedFixture = fixture(
  "failRuntimeEnablementAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      verifiedNoRuntimeEnablementOccurred: false,
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failRuntimeAuthorizationAttemptedFixture = fixture(
  "failRuntimeAuthorizationAttemptedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
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

const failCompletionRecordReviewApprovalMarksActualApprovalFixture = fixture(
  "failCompletionRecordReviewApprovalMarksActualApprovalFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApproved: true,
    },
  }
);

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      verifiedNoExternalNetworkOccurred: false,
      verifiedNoWalletMutationOccurred: false,
    },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
    verifiedNoRuntimeActivationOccurred: false,
  },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
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

const failApprovalRecordBoundaryMissingFixture = fixture(
  "failApprovalRecordBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordBoundary:
        false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalEvidence: {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
          false,
      },
    }
  );

function buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture,
    failOro8uDependencyMissingFixture,
    failOro8uCompletionRecordReviewBoundaryNotPassedFixture,
    failOro8uCompletionRecordReviewStatusMismatchFixture,
    failOro8uCompletionRecordReviewScopeMismatchFixture,
    failOro8uNotCompletionRecordReviewBoundaryOnlyFixture,
    failOro8uCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
    failCompletionRecordReviewApprovalNotPreparedFixture,
    failCompletionRecordReviewApprovalNotIssuedFixture,
    failCompletionRecordReviewApprovalNotPassedFixture,
    failCompletionRecordReviewApprovalNotRecordedFixture,
    failCompletionRecordReviewApprovalStatusMismatchFixture,
    failCompletionRecordReviewApprovalScopeMismatchFixture,
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
    failCompletionRecordReviewApprovalMarksActualApprovalFixture,
    failCannotProveNoMutationOrExternalNetworkFixture,
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failSecretShapedValueLeakedFixture,
    failApprovalRecordBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixture,
  failOro8uDependencyMissingFixture,
  failOro8uCompletionRecordReviewBoundaryNotPassedFixture,
  failOro8uCompletionRecordReviewStatusMismatchFixture,
  failOro8uCompletionRecordReviewScopeMismatchFixture,
  failOro8uNotCompletionRecordReviewBoundaryOnlyFixture,
  failOro8uCannotProveOro8tWasCompletionRecordBoundaryOnlyFixture,
  failCompletionRecordReviewApprovalNotPreparedFixture,
  failCompletionRecordReviewApprovalNotIssuedFixture,
  failCompletionRecordReviewApprovalNotPassedFixture,
  failCompletionRecordReviewApprovalNotRecordedFixture,
  failCompletionRecordReviewApprovalStatusMismatchFixture,
  failCompletionRecordReviewApprovalScopeMismatchFixture,
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
  failCompletionRecordReviewApprovalMarksActualApprovalFixture,
  failCannotProveNoMutationOrExternalNetworkFixture,
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failSecretShapedValueLeakedFixture,
  failApprovalRecordBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  cloneFixture,
  buildOro8vLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundaryFixtures,
};
