"use strict";

const {
  buildOro8jActualLiveExecutionExecutionApprovalBoundary,
} = require("./oro8jLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8jActualLiveExecutionExecutionApprovalBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionExecutionApprovalBoundaryFixture = fixture(
  "happyPathActualLiveExecutionExecutionApprovalBoundaryFixture"
);

const failOro8iDependencyMissingFixture = fixture(
  "failOro8iDependencyMissingFixture",
  {
    oro8iActualLiveExecutionExecutionRequestBoundaryEvidence: {
      dependsOnOro8iActualLiveExecutionExecutionRequestBoundary: false,
      oro8iActualLiveExecutionExecutionRequestBoundaryPassed: false,
      actualLiveExecutionExecutionRequestSubmittedFromOro8i: false,
    },
  }
);

const failOro8iRequestNotSubmittedFixture = fixture(
  "failOro8iRequestNotSubmittedFixture",
  {
    oro8iActualLiveExecutionExecutionRequestBoundaryEvidence: {
      actualLiveExecutionExecutionRequestSubmittedFromOro8i: false,
    },
  }
);

const failOro8iRequestBoundaryNotPassedFixture = fixture(
  "failOro8iRequestBoundaryNotPassedFixture",
  {
    oro8iActualLiveExecutionExecutionRequestBoundaryEvidence: {
      oro8iActualLiveExecutionExecutionRequestBoundaryPassed: false,
    },
  }
);

const failApprovalBoundaryActivatesRuntimeFixture = fixture(
  "failApprovalBoundaryActivatesRuntimeFixture",
  {
    actualLiveExecutionExecutionApprovalEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failApprovalBoundaryEnablesRuntimeFixture = fixture(
  "failApprovalBoundaryEnablesRuntimeFixture",
  {
    actualLiveExecutionExecutionApprovalEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionExecutionApprovalEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failApprovalBoundaryExecutesLiveCallFixture = fixture(
  "failApprovalBoundaryExecutesLiveCallFixture",
  {
    actualLiveExecutionExecutionApprovalEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failExternalNetworkAllowedFixture = fixture("failExternalNetworkAllowedFixture", {
  safetyEvidence: {
    externalNetworkAllowed: true,
  },
});

const failLiveOroPlayApiCallAllowedFixture = fixture(
  "failLiveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const failWalletMutationAllowedFixture = fixture("failWalletMutationAllowedFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
  },
});

const failLedgerMutationAllowedFixture = fixture("failLedgerMutationAllowedFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
  },
});

const failPrismaWriteAllowedFixture = fixture("failPrismaWriteAllowedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
  },
});

const failDbTransactionAllowedFixture = fixture("failDbTransactionAllowedFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
  },
});

const failRouteEnablementAllowedFixture = fixture("failRouteEnablementAllowedFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
  },
});

const failExpressMountAllowedFixture = fixture("failExpressMountAllowedFixture", {
  safetyEvidence: {
    expressMountAllowed: true,
  },
});

const failPublicAliasAllowedFixture = fixture("failPublicAliasAllowedFixture", {
  safetyEvidence: {
    publicAliasAllowed: true,
  },
});

const failApiBalanceAliasAllowedFixture = fixture("failApiBalanceAliasAllowedFixture", {
  safetyEvidence: {
    apiBalanceAliasAllowed: true,
  },
});

const failApiTransactionAliasAllowedFixture = fixture(
  "failApiTransactionAliasAllowedFixture",
  {
    safetyEvidence: {
      apiTransactionAliasAllowed: true,
    },
  }
);

const failApiOroplayBalanceRouteAllowedFixture = fixture(
  "failApiOroplayBalanceRouteAllowedFixture",
  {
    safetyEvidence: {
      apiOroplayBalanceRouteAllowed: true,
    },
  }
);

const failApiOroplayTransactionRouteAllowedFixture = fixture(
  "failApiOroplayTransactionRouteAllowedFixture",
  {
    safetyEvidence: {
      apiOroplayTransactionRouteAllowed: true,
    },
  }
);

const failSecretLeakFixture = fixture("failSecretLeakFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro8jActualLiveExecutionExecutionApprovalBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionExecutionApprovalBoundaryFixture,
    failOro8iDependencyMissingFixture,
    failOro8iRequestNotSubmittedFixture,
    failOro8iRequestBoundaryNotPassedFixture,
    failApprovalBoundaryActivatesRuntimeFixture,
    failApprovalBoundaryEnablesRuntimeFixture,
    failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture,
    failApprovalBoundaryExecutesLiveCallFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failRouteEnablementAllowedFixture,
    failExpressMountAllowedFixture,
    failPublicAliasAllowedFixture,
    failApiBalanceAliasAllowedFixture,
    failApiTransactionAliasAllowedFixture,
    failApiOroplayBalanceRouteAllowedFixture,
    failApiOroplayTransactionRouteAllowedFixture,
    failSecretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionExecutionApprovalBoundaryFixture,
  failOro8iDependencyMissingFixture,
  failOro8iRequestNotSubmittedFixture,
  failOro8iRequestBoundaryNotPassedFixture,
  failApprovalBoundaryActivatesRuntimeFixture,
  failApprovalBoundaryEnablesRuntimeFixture,
  failApprovalBoundaryAuthorizesRuntimeExternalExecutionFixture,
  failApprovalBoundaryExecutesLiveCallFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failRouteEnablementAllowedFixture,
  failExpressMountAllowedFixture,
  failPublicAliasAllowedFixture,
  failApiBalanceAliasAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  failSecretLeakFixture,
  cloneFixture,
  buildOro8jActualLiveExecutionExecutionApprovalBoundaryFixtures,
};
