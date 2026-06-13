"use strict";

const {
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
);

const failOro9lDependencyMissingFixture = fixture("failOro9lDependencyMissingFixture", {
  oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
    {
      dependsOnOro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary:
        false,
      oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
        false,
      PreparedFromOro9l: false,
      IssuedFromOro9l: false,
      PassedFromOro9l: false,
      RecordedFromOro9l: false,
    },
});

const failFinalizationReviewApprovalPresentButRecordMissingFixture = fixture(
  "failFinalizationReviewApprovalPresentButRecordMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded: false,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAppliedToRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAppliedToRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime: true,
        verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false,
      },
  }
);

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
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
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized: true,
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

function buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
    failOro9lDependencyMissingFixture,
    failFinalizationReviewApprovalPresentButRecordMissingFixture,
    failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
    failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
    failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalAttemptedFixture,
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
  happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
  failOro9lDependencyMissingFixture,
  failFinalizationReviewApprovalPresentButRecordMissingFixture,
  failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
  failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
  failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures,
};
