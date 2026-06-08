"use strict";

const {
  buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
} = require("./oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture"
  );

const failMissingOro7gRuntimeEnablementDecisionFixture = fixture(
  "failMissingOro7gRuntimeEnablementDecisionFixture",
  {
    oro7gRuntimeEnablementDecisionEvidence: {
      dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
        false,
    },
  }
);

const failOro7gRuntimeEnablementDecisionNotIssuedFixture = fixture(
  "failOro7gRuntimeEnablementDecisionNotIssuedFixture",
  {
    oro7gRuntimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g: false,
    },
  }
);

const failInvalidOro7gRuntimeEnablementDecisionStatusFixture = fixture(
  "failInvalidOro7gRuntimeEnablementDecisionStatusFixture",
  {
    oro7gRuntimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g:
        "approved_for_runtime_enablement_only",
    },
  }
);

const failFinalReadinessNotPassedFixture = fixture(
  "failFinalReadinessNotPassedFixture",
  {
    runtimeEnablementFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed: false,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeEnablementFinalReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeEnablementFinalReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeEnablementFinalReadinessEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeEnablementFinalReadinessEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeEnablementFinalReadinessEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeEnablementFinalReadinessEvidence: {
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

function buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture,
    failMissingOro7gRuntimeEnablementDecisionFixture,
    failOro7gRuntimeEnablementDecisionNotIssuedFixture,
    failInvalidOro7gRuntimeEnablementDecisionStatusFixture,
    failFinalReadinessNotPassedFixture,
    failRuntimeEnabledFixture,
    failRuntimeActivatedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture,
  failMissingOro7gRuntimeEnablementDecisionFixture,
  failOro7gRuntimeEnablementDecisionNotIssuedFixture,
  failInvalidOro7gRuntimeEnablementDecisionStatusFixture,
  failFinalReadinessNotPassedFixture,
  failRuntimeEnabledFixture,
  failRuntimeActivatedFixture,
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
  buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures,
};
