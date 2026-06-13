"use strict";

const {
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = require("./oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

const ORO9F_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalization";
const ORO9G_PREFIX = `${ORO9F_PREFIX}Review`;

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture =
  fixture(
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );

const failOro9fDependencyMissingFixture = fixture("failOro9fDependencyMissingFixture", {
  oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
    {
      dependsOnOro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary:
        false,
      oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed:
        false,
      [`${ORO9F_PREFIX}PreparedFromOro9f`]: false,
      [`${ORO9F_PREFIX}IssuedFromOro9f`]: false,
      [`${ORO9F_PREFIX}PassedFromOro9f`]: false,
      [`${ORO9F_PREFIX}RecordedFromOro9f`]: false,
    },
});

const failActualExecutionAttemptedFixture = fixture("failActualExecutionAttemptedFixture", {
  oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryEvidence:
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
  actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
    {
      [`${ORO9G_PREFIX}AcceptedForRuntime`]: true,
      [`${ORO9G_PREFIX}RuntimeApplied`]: true,
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
});

const failLiveOroPlayApiCallAttemptedFixture = fixture(
  "failLiveOroPlayApiCallAttemptedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
      liveOroPlayApiCalled: true,
    },
  }
);

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

const failPrismaWriteAttemptedFixture = fixture("failPrismaWriteAttemptedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
  },
});

const failDbTransactionAttemptedFixture = fixture("failDbTransactionAttemptedFixture", {
  safetyEvidence: {
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

const failSecretShapedFixture = fixture("failSecretShapedFixture", {
  safetyEvidence: {
    sensitiveOutputPresent: true,
  },
});

function buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
    failOro9fDependencyMissingFixture,
    failActualExecutionAttemptedFixture,
    failRuntimeAcceptanceAttemptedFixture,
    failLiveOroPlayApiCallAttemptedFixture,
    failExternalNetworkAttemptedFixture,
    failWalletMutationAttemptedFixture,
    failLedgerMutationAttemptedFixture,
    failPrismaWriteAttemptedFixture,
    failDbTransactionAttemptedFixture,
    failRouteAliasAttemptedFixture,
    failDeployMigrationAttemptedFixture,
    failSecretShapedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
  failOro9fDependencyMissingFixture,
  failActualExecutionAttemptedFixture,
  failRuntimeAcceptanceAttemptedFixture,
  failLiveOroPlayApiCallAttemptedFixture,
  failExternalNetworkAttemptedFixture,
  failWalletMutationAttemptedFixture,
  failLedgerMutationAttemptedFixture,
  failPrismaWriteAttemptedFixture,
  failDbTransactionAttemptedFixture,
  failRouteAliasAttemptedFixture,
  failDeployMigrationAttemptedFixture,
  failSecretShapedFixture,
  cloneFixture,
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
