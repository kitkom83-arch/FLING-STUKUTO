"use strict";

const {
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
);

const failOro9jDependencyMissingFixture = fixture("failOro9jDependencyMissingFixture", {
  oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
    {
      dependsOnOro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
        false,
      oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed:
        false,
      PreparedFromOro9j: false,
      IssuedFromOro9j: false,
      PassedFromOro9j: false,
      RecordedFromOro9j: false,
    },
});

const failFinalizationReviewApprovalRecordFinalizationPresentButFinalizationReviewMissingFixture = fixture(
  "failFinalizationReviewApprovalRecordFinalizationPresentButFinalizationReviewMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewRecorded: false,
      },
  }
);

const failFinalizationReviewAcceptedForRuntimeFixture = fixture(
  "failFinalizationReviewAcceptedForRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime: true,
        finalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation: true,
      },
  }
);

const failFinalizationReviewAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewAppliedToRuntimeFixture = fixture(
  "failFinalizationReviewAppliedToRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime: true,
        verifiedNoRuntimeFinalizationReviewOccurred: false,
      },
  }
);

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
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
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized: true,
    },
});

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

function buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
    failOro9jDependencyMissingFixture,
    failFinalizationReviewApprovalRecordFinalizationPresentButFinalizationReviewMissingFixture,
    failFinalizationReviewAcceptedForRuntimeFixture,
    failFinalizationReviewAcceptedForLiveExecutionFixture,
    failFinalizationReviewAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
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
  happyPathFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
  failOro9jDependencyMissingFixture,
  failFinalizationReviewApprovalRecordFinalizationPresentButFinalizationReviewMissingFixture,
  failFinalizationReviewAcceptedForRuntimeFixture,
  failFinalizationReviewAcceptedForLiveExecutionFixture,
  failFinalizationReviewAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
