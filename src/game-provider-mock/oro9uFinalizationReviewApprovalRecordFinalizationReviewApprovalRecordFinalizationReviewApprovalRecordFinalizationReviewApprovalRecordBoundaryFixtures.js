"use strict";

const {
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecord,
} = require("./oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9uFinalizationReviewApprovalRecordBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9uFinalizationReviewApprovalRecordBoundaryFixture = fixture(
  "validOro9uFinalizationReviewApprovalRecordBoundaryFixture"
);

const continuationFromOro9tConfirmedFixture = fixture(
  "continuationFromOro9tConfirmedFixture"
);

const finalizationReviewApprovalRecordBoundaryPresentFixture = fixture(
  "finalizationReviewApprovalRecordBoundaryPresentFixture"
);

const runtimeFinalizationNotAuthorizedFixture = fixture(
  "runtimeFinalizationNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationOccurred: false,
    },
  }
);

const runtimeFinalizationReviewNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewOccurred: false,
    },
  }
);

const runtimeFinalizationReviewApprovalNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalOccurred: false,
    },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeApproved: true,
      },
  }
);

const runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false,
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred: false,
    },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime: true,
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
    longOro9uFilenamePresent: false,
  },
});

const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: {
    longOro9uFilenamePresent: true,
  },
});

function buildOro9uFinalizationReviewApprovalRecordBoundaryFixtures() {
  return [
    validOro9uFinalizationReviewApprovalRecordBoundaryFixture,
    continuationFromOro9tConfirmedFixture,
    finalizationReviewApprovalRecordBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
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
  validOro9uFinalizationReviewApprovalRecordBoundaryFixture,
  continuationFromOro9tConfirmedFixture,
  finalizationReviewApprovalRecordBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
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
  buildOro9uFinalizationReviewApprovalRecordBoundaryFixtures,
};
