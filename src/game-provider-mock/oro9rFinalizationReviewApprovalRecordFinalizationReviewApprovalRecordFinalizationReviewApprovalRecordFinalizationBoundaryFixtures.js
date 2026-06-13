"use strict";

const {
  buildOro9rFinalizationBoundaryRecord,
} = require("./oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9rFinalizationBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9rFinalizationBoundaryFixture = fixture(
  "validOro9rFinalizationBoundaryFixture"
);

const continuationFromOro9qConfirmedFixture = fixture(
  "continuationFromOro9qConfirmedFixture"
);

const finalizationBoundaryPresentFixture = fixture(
  "finalizationBoundaryPresentFixture"
);

const runtimeFinalizationNotAuthorizedFixture = fixture(
  "runtimeFinalizationNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationOccurred: false,
    },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized: true,
      },
  }
);

const liveExecutionNotAuthorizedFixture = fixture("liveExecutionNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoActualLiveExecutionOccurred: false,
    actualExternalCallExecutionLiveExecutionApproved: true,
    actualExternalCallExecutionLiveExecuted: true,
    actualLiveExecutionExecuted: true,
  },
});

const liveOroPlayApiCallNotAuthorizedFixture = fixture(
  "liveOroPlayApiCallNotAuthorizedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
      liveOroPlayApiCalled: true,
    },
  }
);

const routeAliasNotAuthorizedFixture = fixture("routeAliasNotAuthorizedFixture", {
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

const walletMutationNotAuthorizedFixture = fixture("walletMutationNotAuthorizedFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
    walletMutationPerformed: true,
  },
});

const ledgerMutationNotAuthorizedFixture = fixture("ledgerMutationNotAuthorizedFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
    ledgerMutationPerformed: true,
  },
});

const prismaWriteNotAuthorizedFixture = fixture("prismaWriteNotAuthorizedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
  },
});

const dbTransactionNotAuthorizedFixture = fixture("dbTransactionNotAuthorizedFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
    dbTransactionPerformed: true,
  },
});

const migrationNotAuthorizedFixture = fixture("migrationNotAuthorizedFixture", {
  safetyEvidence: {
    migrationAllowed: true,
    migrationPerformed: true,
  },
});

const deployNotAuthorizedFixture = fixture("deployNotAuthorizedFixture", {
  safetyEvidence: {
    deployAllowed: true,
    deployPerformed: true,
  },
});

const secretShapedValuesAbsentFixture = fixture("secretShapedValuesAbsentFixture", {
  safetyEvidence: {
    sensitiveOutputPresent: false,
  },
});

const secretShapedValuesPresentFixture = fixture("secretShapedValuesPresentFixture", {
  safetyEvidence: {
    sensitiveOutputPresent: true,
  },
});

const longFilenameAbsentFixture = fixture("longFilenameAbsentFixture", {
  safetyEvidence: {
    longOro9rFilenamePresent: false,
  },
});

const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: {
    longOro9rFilenamePresent: true,
  },
});

function buildOro9rFinalizationBoundaryFixtures() {
  return [
    validOro9rFinalizationBoundaryFixture,
    continuationFromOro9qConfirmedFixture,
    finalizationBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    liveExecutionNotAuthorizedFixture,
    liveOroPlayApiCallNotAuthorizedFixture,
    routeAliasNotAuthorizedFixture,
    walletMutationNotAuthorizedFixture,
    ledgerMutationNotAuthorizedFixture,
    prismaWriteNotAuthorizedFixture,
    dbTransactionNotAuthorizedFixture,
    migrationNotAuthorizedFixture,
    deployNotAuthorizedFixture,
    secretShapedValuesAbsentFixture,
    secretShapedValuesPresentFixture,
    longFilenameAbsentFixture,
    longFilenamePresentFixture,
  ].map(cloneFixture);
}

module.exports = {
  validOro9rFinalizationBoundaryFixture,
  continuationFromOro9qConfirmedFixture,
  finalizationBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  liveExecutionNotAuthorizedFixture,
  liveOroPlayApiCallNotAuthorizedFixture,
  routeAliasNotAuthorizedFixture,
  walletMutationNotAuthorizedFixture,
  ledgerMutationNotAuthorizedFixture,
  prismaWriteNotAuthorizedFixture,
  dbTransactionNotAuthorizedFixture,
  migrationNotAuthorizedFixture,
  deployNotAuthorizedFixture,
  secretShapedValuesAbsentFixture,
  secretShapedValuesPresentFixture,
  longFilenameAbsentFixture,
  longFilenamePresentFixture,
  cloneFixture,
  buildOro9rFinalizationBoundaryFixtures,
};
