"use strict";

const {
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = require("./oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
);

const failOro9mDependencyMissingFixture = fixture("failOro9mDependencyMissingFixture", {
  oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
    {
      dependsOnOro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary:
        false,
      oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed:
        false,
      PreparedFromOro9m: false,
      IssuedFromOro9m: false,
      PassedFromOro9m: false,
      RecordedFromOro9m: false,
    },
});

const failFinalizationReviewApprovalPresentButRecordMissingFixture = fixture(
  "failFinalizationReviewApprovalPresentButRecordMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded: false,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAppliedToRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAppliedToRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime: true,
        verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false,
      },
  }
);

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryEvidence:
    {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  safetyEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
    actualExternalCallExecutionLiveExecuted: true,
    actualLiveExecutionExecuted: true,
  },
});

const failRuntimeAcceptanceAttemptedFixture = fixture("failRuntimeAcceptanceAttemptedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeAcceptanceOccurred: false,
  },
});

const failRuntimeFinalizationAttemptedFixture = fixture("failRuntimeFinalizationAttemptedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeFinalizationOccurred: false,
  },
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized: true,
    },
});

const failRuntimeFinalizationReviewAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewOccurred: false,
    },
  }
);

const failRuntimeFinalizationReviewApprovalAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalOccurred: false,
    },
  }
);

const failRuntimeFinalizationReviewApprovalRecordAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalRecordAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false,
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred: false,
    },
  }
);

const failLiveOroPlayApiCallAttemptedFixture = fixture("failLiveOroPlayApiCallAttemptedFixture", {
  safetyEvidence: {
    liveOroPlayApiCallAllowed: true,
    liveOroPlayApiCalled: true,
  },
});

const failExternalNetworkAttemptedFixture = fixture("failExternalNetworkAttemptedFixture", {
  safetyEvidence: {
    externalNetworkAllowed: true,
    externalNetworkCalled: true,
  },
});

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

const failPrismaOrDbMutationAttemptedFixture = fixture("failPrismaOrDbMutationAttemptedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
    dbTransactionAllowed: true,
    dbTransactionPerformed: true,
  },
});

const failRouteAliasAttemptedFixture = fixture("failRouteAliasAttemptedFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
    expressMountAllowed: true,
    publicAliasAllowed: true,
    apiBalanceAliasAllowed: true,
    apiTransactionAliasAllowed: true,
    apiOroplayBalanceRouteAllowed: true,
    apiOroplayTransactionRouteAllowed: true,
  },
});

const failDeployMigrationAttemptedFixture = fixture("failDeployMigrationAttemptedFixture", {
  safetyEvidence: {
    deployAllowed: true,
    deployPerformed: true,
    migrationAllowed: true,
    migrationPerformed: true,
  },
});

const failSensitiveShapedFixture = fixture("failSensitiveShapedFixture", {
  safetyEvidence: {
    sensitiveOutputPresent: true,
  },
});

function buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
    failOro9mDependencyMissingFixture,
    failFinalizationReviewApprovalPresentButRecordMissingFixture,
    failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
    failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
    failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaOrDbMutationAttemptedFixture,
    failRouteAliasAttemptedFixture,
    failDeployMigrationAttemptedFixture,
    failSensitiveShapedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
  failOro9mDependencyMissingFixture,
  failFinalizationReviewApprovalPresentButRecordMissingFixture,
  failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
  failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
  failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures,
};

