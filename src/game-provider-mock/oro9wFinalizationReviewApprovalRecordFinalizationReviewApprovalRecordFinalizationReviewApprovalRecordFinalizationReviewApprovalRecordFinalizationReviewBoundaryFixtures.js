"use strict";

const {
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord,
} = require("./oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture = fixture(
  "validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
);

const continuationFromOro9vConfirmedFixture = fixture(
  "continuationFromOro9vConfirmedFixture"
);

const finalizationReviewApprovalRecordFinalizationReviewBoundaryPresentFixture = fixture(
  "finalizationReviewApprovalRecordFinalizationReviewBoundaryPresentFixture"
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
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeApproved: true,
      },
  }
);

const runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred: false,
    },
  }
);

const runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred: false,
    },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime: true,
      },
  }
);

const runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture = fixture(
  "runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture",
  {
    safetyEvidence: {
      verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred: false,
    },
    finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewEvidence:
      {
        finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime: true,
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
    longOro9wFilenamePresent: false,
  },
});

const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: {
    longOro9wFilenamePresent: true,
  },
});

function buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures() {
  return [
    validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
    continuationFromOro9vConfirmedFixture,
    finalizationReviewApprovalRecordFinalizationReviewBoundaryPresentFixture,
    runtimeFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
    runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
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
  validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture,
  continuationFromOro9vConfirmedFixture,
  finalizationReviewApprovalRecordFinalizationReviewBoundaryPresentFixture,
  runtimeFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture,
  runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture,
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
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures,
};
