"use strict";

const {
  buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
} = require("./oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture"
  );

const failMissingOro7jRuntimeEnablementActivationDecisionFixture = fixture(
  "failMissingOro7jRuntimeEnablementActivationDecisionFixture",
  {
    oro7jRuntimeEnablementActivationDecisionEvidence: {
      dependsOnOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary:
        false,
    },
  }
);

const failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture = fixture(
  "failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture",
  {
    oro7jRuntimeEnablementActivationDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementActivationDecisionStatusFromOro7j:
        "approved_for_runtime_activation_without_final_readiness_boundary",
    },
  }
);

const failRuntimeActivationRequestSubmittedFixture = fixture(
  "failRuntimeActivationRequestSubmittedFixture",
  {
    runtimeEnablementFinalActivationReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationRequestSubmitted: true,
    },
  }
);

const failRuntimeActivationDecisionIssuedFixture = fixture(
  "failRuntimeActivationDecisionIssuedFixture",
  {
    runtimeEnablementFinalActivationReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationDecisionIssued: true,
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeEnablementFinalActivationReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeEnablementFinalActivationReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeEnablementFinalActivationReadinessEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeEnablementFinalActivationReadinessEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeEnablementFinalActivationReadinessEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeEnablementFinalActivationReadinessEvidence: {
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

function buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture,
    failMissingOro7jRuntimeEnablementActivationDecisionFixture,
    failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture,
    failRuntimeActivationRequestSubmittedFixture,
    failRuntimeActivationDecisionIssuedFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture,
  failMissingOro7jRuntimeEnablementActivationDecisionFixture,
  failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture,
  failRuntimeActivationRequestSubmittedFixture,
  failRuntimeActivationDecisionIssuedFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
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
  buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures,
};
