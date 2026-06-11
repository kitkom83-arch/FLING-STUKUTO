"use strict";

const {
  buildOro8iActualLiveExecutionExecutionRequestBoundary,
} = require("./oro8iLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8iActualLiveExecutionExecutionRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionExecutionRequestBoundaryFixture = fixture(
  "happyPathActualLiveExecutionExecutionRequestBoundaryFixture"
);

const failOro8hDependencyMissingFixture = fixture(
  "failOro8hDependencyMissingFixture",
  {
    oro8hActualLiveExecutionExecutionGateEvidence: {
      dependsOnOro8hActualLiveExecutionExecutionGate: false,
      oro8hActualLiveExecutionExecutionGatePassed: false,
      actualLiveExecutionExecutionGateIssuedFromOro8h: false,
    },
  }
);

const failOro8hExecutionGateNotPassedFixture = fixture(
  "failOro8hExecutionGateNotPassedFixture",
  {
    oro8hActualLiveExecutionExecutionGateEvidence: {
      oro8hActualLiveExecutionExecutionGatePassed: false,
    },
  }
);

const failExecutionRequestApprovesExecutionFixture = fixture(
  "failExecutionRequestApprovesExecutionFixture",
  {
    actualLiveExecutionExecutionRequestEvidence: {
      actualLiveExecutionExecutionApproved: true,
    },
  }
);

const failExecutionRequestExecutesLiveCallFixture = fixture(
  "failExecutionRequestExecutesLiveCallFixture",
  {
    actualLiveExecutionExecutionRequestEvidence: {
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

function buildOro8iActualLiveExecutionExecutionRequestBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionExecutionRequestBoundaryFixture,
    failOro8hDependencyMissingFixture,
    failOro8hExecutionGateNotPassedFixture,
    failExecutionRequestApprovesExecutionFixture,
    failExecutionRequestExecutesLiveCallFixture,
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
  happyPathActualLiveExecutionExecutionRequestBoundaryFixture,
  failOro8hDependencyMissingFixture,
  failOro8hExecutionGateNotPassedFixture,
  failExecutionRequestApprovesExecutionFixture,
  failExecutionRequestExecutesLiveCallFixture,
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
  buildOro8iActualLiveExecutionExecutionRequestBoundaryFixtures,
};
