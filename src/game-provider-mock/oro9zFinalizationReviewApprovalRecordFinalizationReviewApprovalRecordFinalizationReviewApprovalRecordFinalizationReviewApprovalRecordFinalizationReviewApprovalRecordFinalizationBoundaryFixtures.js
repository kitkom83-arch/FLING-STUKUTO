"use strict";

const {
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
} = require("./oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture = fixture(
  "validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
);
const continuationFromOro9yConfirmedFixture = fixture("continuationFromOro9yConfirmedFixture");
const finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPresentFixture = fixture(
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPresentFixture"
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
const runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationOccurred: false,
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
  safetyEvidence: { longOro9zFilenamePresent: false },
});
const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: { longOro9zFilenamePresent: true },
});

function buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
    continuationFromOro9yConfirmedFixture,
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
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
  validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture,
  continuationFromOro9yConfirmedFixture,
  finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
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
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures,
};
