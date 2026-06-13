"use strict";

const {
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
);

const failOro9nDependencyMissingFixture = fixture("failOro9nDependencyMissingFixture", {
  oro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
    {
      dependsOnOro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
        false,
      oro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed:
        false,
      PreparedFromOro9n: false,
      IssuedFromOro9n: false,
      PassedFromOro9n: false,
      RecordedFromOro9n: false,
    },
});

const failFinalizationPresentButFinalizationReviewMissingFixture = fixture(
  "failFinalizationPresentButFinalizationReviewMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded: false,
      },
  }
);

const failFinalizationReviewAcceptedForRuntimeFixture = fixture("failFinalizationReviewAcceptedForRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime: true,
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation: true,
    },
});

const failFinalizationReviewAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewAppliedToRuntimeFixture = fixture("failFinalizationReviewAppliedToRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime: true,
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false,
    },
});

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
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
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized: true,
    },
});

const failRuntimeFinalizationReviewAttemptedFixture = fixture("failRuntimeFinalizationReviewAttemptedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeFinalizationReviewOccurred: false,
  },
});

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
    },
  }
);

const failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred: false,
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false,
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

function buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
    failOro9nDependencyMissingFixture,
    failFinalizationPresentButFinalizationReviewMissingFixture,
    failFinalizationReviewAcceptedForRuntimeFixture,
    failFinalizationReviewAcceptedForLiveExecutionFixture,
    failFinalizationReviewAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
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
  happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
  failOro9nDependencyMissingFixture,
  failFinalizationPresentButFinalizationReviewMissingFixture,
  failFinalizationReviewAcceptedForRuntimeFixture,
  failFinalizationReviewAcceptedForLiveExecutionFixture,
  failFinalizationReviewAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
