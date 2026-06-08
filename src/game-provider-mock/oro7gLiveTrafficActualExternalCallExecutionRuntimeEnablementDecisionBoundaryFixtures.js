"use strict";

const {
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
} = require("./oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture"
  );

const failMissingOro7fRuntimeEnablementRequestFixture = fixture(
  "failMissingOro7fRuntimeEnablementRequestFixture",
  {
    oro7fRuntimeEnablementRequestEvidence: {
      dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
        false,
    },
  }
);

const failOro7fRuntimeEnablementRequestNotSubmittedFixture = fixture(
  "failOro7fRuntimeEnablementRequestNotSubmittedFixture",
  {
    oro7fRuntimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f: false,
    },
  }
);

const failRuntimeEnablementDecisionNotIssuedFixture = fixture(
  "failRuntimeEnablementDecisionNotIssuedFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: false,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeEnablementDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionActivatedFixture = fixture(
  "failActualExecutionActivatedFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeEnablementDecisionEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeEnablementDecisionEvidence: {
    actualExternalCallExecutionLiveExecuted: true,
  },
});

const failExternalNetworkAllowedFixture = fixture(
  "failExternalNetworkAllowedFixture",
  {
    safetyEvidence: {
      externalNetworkAllowed: true,
    },
  }
);

const failLiveOroPlayApiCallAllowedFixture = fixture(
  "failLiveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const failWalletMutationAllowedFixture = fixture(
  "failWalletMutationAllowedFixture",
  {
    safetyEvidence: {
      walletMutationAllowed: true,
    },
  }
);

const failLedgerMutationAllowedFixture = fixture(
  "failLedgerMutationAllowedFixture",
  {
    safetyEvidence: {
      ledgerMutationAllowed: true,
    },
  }
);

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

const failMigrationAllowedFixture = fixture("failMigrationAllowedFixture", {
  safetyEvidence: {
    migrationAllowed: true,
  },
});

const failDeployAllowedFixture = fixture("failDeployAllowedFixture", {
  safetyEvidence: {
    deployAllowed: true,
  },
});

const failRouteEnablementAllowedFixture = fixture(
  "failRouteEnablementAllowedFixture",
  {
    safetyEvidence: {
      routeEnablementAllowed: true,
    },
  }
);

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

const failApiBalanceAliasAllowedFixture = fixture(
  "failApiBalanceAliasAllowedFixture",
  {
    safetyEvidence: {
      apiBalanceAliasAllowed: true,
    },
  }
);

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

function buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture,
    failMissingOro7fRuntimeEnablementRequestFixture,
    failOro7fRuntimeEnablementRequestNotSubmittedFixture,
    failRuntimeEnablementDecisionNotIssuedFixture,
    failRuntimeEnabledFixture,
    failActualExecutionActivatedFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
    failLiveExecutionApprovedFixture,
    failLiveExecutedFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failMigrationAllowedFixture,
    failDeployAllowedFixture,
    failRouteEnablementAllowedFixture,
    failExpressMountAllowedFixture,
    failPublicAliasAllowedFixture,
    failApiBalanceAliasAllowedFixture,
    failApiTransactionAliasAllowedFixture,
    failApiOroplayBalanceRouteAllowedFixture,
    failApiOroplayTransactionRouteAllowedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture,
  failMissingOro7fRuntimeEnablementRequestFixture,
  failOro7fRuntimeEnablementRequestNotSubmittedFixture,
  failRuntimeEnablementDecisionNotIssuedFixture,
  failRuntimeEnabledFixture,
  failActualExecutionActivatedFixture,
  failActualExecutionEnabledFixture,
  failActualExecutionAuthorizedFixture,
  failLiveExecutionApprovedFixture,
  failLiveExecutedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failMigrationAllowedFixture,
  failDeployAllowedFixture,
  failRouteEnablementAllowedFixture,
  failExpressMountAllowedFixture,
  failPublicAliasAllowedFixture,
  failApiBalanceAliasAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  cloneFixture,
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures,
};
