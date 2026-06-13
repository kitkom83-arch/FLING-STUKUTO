"use strict";

const {
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = require("./oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
  );

const failOro9pDependencyMissingFixture = fixture("failOro9pDependencyMissingFixture", {
  oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
    {
      dependsOnOro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary:
        false,
      oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed:
        false,
      PreparedFromOro9p: false,
      IssuedFromOro9p: false,
      PassedFromOro9p: false,
      RecordedFromOro9p: false,
    },
});

const failFinalizationReviewApprovalPresentButApprovalRecordMissingFixture = fixture(
  "failFinalizationReviewApprovalPresentButApprovalRecordMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed: false,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded: false,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture = fixture(
  "failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution: true,
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution: true,
      },
  }
);

const failFinalizationReviewApprovalRecordAppliedToRuntimeFixture = fixture(
  "failFinalizationReviewApprovalRecordAppliedToRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime: true,
        verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred: false,
      },
  }
);

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryEvidence:
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
      finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized: true,
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

const failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAttemptedFixture = fixture(
  "failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAttemptedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred: false,
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

function buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
    failOro9pDependencyMissingFixture,
    failFinalizationReviewApprovalPresentButApprovalRecordMissingFixture,
    failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
    failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
    failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failRuntimeFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
    failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAttemptedFixture,
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
  happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
  failOro9pDependencyMissingFixture,
  failFinalizationReviewApprovalPresentButApprovalRecordMissingFixture,
  failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
  failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
  failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failRuntimeFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
  failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaOrDbMutationAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSensitiveShapedFixture,
  cloneFixture,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures,
};
