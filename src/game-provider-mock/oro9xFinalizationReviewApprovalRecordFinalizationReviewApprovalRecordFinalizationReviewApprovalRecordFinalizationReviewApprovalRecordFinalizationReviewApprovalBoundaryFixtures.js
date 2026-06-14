"use strict";

const {
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord,
} = require("./oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture = fixture(
  "validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
);
const continuationFromOro9wConfirmedFixture = fixture("continuationFromOro9wConfirmedFixture");
const finalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPresentFixture = fixture(
  "finalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPresentFixture"
);
const runtimeFinalizationNotAuthorizedFixture = fixture("runtimeFinalizationNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoRuntimeFinalizationOccurred: false },
});
const runtimeFinalizationReviewNotAuthorizedFixture = fixture("runtimeFinalizationReviewNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoRuntimeFinalizationReviewOccurred: false },
});
const runtimeFinalizationReviewApprovalNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeApproved: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution: true,
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
const liveOroPlayApiCallNotAuthorizedFixture = fixture("liveOroPlayApiCallNotAuthorizedFixture", {
  safetyEvidence: { liveOroPlayApiCallAllowed: true, liveOroPlayApiCalled: true },
});
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
  safetyEvidence: { walletMutationAllowed: true, walletMutationPerformed: true },
});
const ledgerMutationNotAuthorizedFixture = fixture("ledgerMutationNotAuthorizedFixture", {
  safetyEvidence: { ledgerMutationAllowed: true, ledgerMutationPerformed: true },
});
const prismaWriteNotAuthorizedFixture = fixture("prismaWriteNotAuthorizedFixture", {
  safetyEvidence: { prismaWriteAllowed: true, prismaWritePerformed: true },
});
const dbTransactionNotAuthorizedFixture = fixture("dbTransactionNotAuthorizedFixture", {
  safetyEvidence: { dbTransactionAllowed: true, dbTransactionPerformed: true },
});
const migrationNotAuthorizedFixture = fixture("migrationNotAuthorizedFixture", {
  safetyEvidence: { migrationAllowed: true, migrationPerformed: true },
});
const deployNotAuthorizedFixture = fixture("deployNotAuthorizedFixture", {
  safetyEvidence: { deployAllowed: true, deployPerformed: true },
});
const secretShapedValuesAbsentFixture = fixture("secretShapedValuesAbsentFixture", {
  safetyEvidence: { sensitiveOutputPresent: false },
});
const secretShapedValuesPresentFixture = fixture("secretShapedValuesPresentFixture", {
  safetyEvidence: { sensitiveOutputPresent: true },
});
const longFilenameAbsentFixture = fixture("longFilenameAbsentFixture", {
  safetyEvidence: { longOro9xFilenamePresent: false },
});
const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: { longOro9xFilenamePresent: true },
});

function buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures() {
  return [
    validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
    continuationFromOro9wConfirmedFixture,
    finalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
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
  validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture,
  continuationFromOro9wConfirmedFixture,
  finalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
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
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures,
};
