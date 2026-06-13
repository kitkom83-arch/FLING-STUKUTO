"use strict";

const {
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = require("./oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
);

const failOro9oDependencyMissingFixture = fixture("failOro9oDependencyMissingFixture", {
  oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
    {
      dependsOnOro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary:
        false,
      oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed:
        false,
      PreparedFromOro9o: false,
      IssuedFromOro9o: false,
      PassedFromOro9o: false,
      RecordedFromOro9o: false,
    },
});

const failFinalizationReviewPresentButApprovalMissingFixture = fixture(
  "failFinalizationReviewPresentButApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded: false,
      },
  }
);

const failFinalizationReviewApprovalAcceptedForRuntimeFixture = fixture(
  "failFinalizationReviewApprovalAcceptedForRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation: true,
      },
  }
);

const failFinalizationReviewApprovalAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewApprovalAppliedToRuntimeFixture = fixture(
  "failFinalizationReviewApprovalAppliedToRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime: true,
        verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred: false,
      },
  }
);

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryEvidence:
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
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
    {
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized: true,
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
    },
  }
);

const failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false,
    },
  }
);

const failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred: false,
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

function buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
    failOro9oDependencyMissingFixture,
    failFinalizationReviewPresentButApprovalMissingFixture,
    failFinalizationReviewApprovalAcceptedForRuntimeFixture,
    failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
    failFinalizationReviewApprovalAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
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
  happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
  failOro9oDependencyMissingFixture,
  failFinalizationReviewPresentButApprovalMissingFixture,
  failFinalizationReviewApprovalAcceptedForRuntimeFixture,
  failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
  failFinalizationReviewApprovalAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures,
};
