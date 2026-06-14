"use strict";

const {
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord,
} = require("./oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture = fixture(
  "validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
);
const continuationFromOro9xConfirmedFixture = fixture("continuationFromOro9xConfirmedFixture");
const finalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPresentFixture = fixture(
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPresentFixture"
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
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApproved: true,
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
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred: false },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution: true,
      },
  }
);
const runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture",
  {
    safetyEvidence: { verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred: false },
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
  safetyEvidence: { longOro9yFilenamePresent: false },
});
const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: { longOro9yFilenamePresent: true },
});

function buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
    continuationFromOro9xConfirmedFixture,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture,
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
  validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture,
  continuationFromOro9xConfirmedFixture,
  finalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture,
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
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures,
};
