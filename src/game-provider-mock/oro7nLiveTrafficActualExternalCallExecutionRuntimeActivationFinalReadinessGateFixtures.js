"use strict";

const {
  buildOro7nRuntimeActivationFinalReadinessGate,
} = require("./oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7nRuntimeActivationFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture"
  );

const failMissingOro7mRuntimeActivationDecisionFixture = fixture(
  "failMissingOro7mRuntimeActivationDecisionFixture",
  {
    oro7mRuntimeActivationDecisionEvidence: {
      dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary:
        false,
    },
  }
);

const failInvalidOro7mRuntimeActivationDecisionStatusFixture = fixture(
  "failInvalidOro7mRuntimeActivationDecisionStatusFixture",
  {
    oro7mRuntimeActivationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m:
        "approved_for_runtime_activation_without_final_readiness_gate",
    },
  }
);

const failRuntimeActivationFinalReadinessMissingFixture = fixture(
  "failRuntimeActivationFinalReadinessMissingFixture",
  {
    runtimeActivationFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared: false,
    },
  }
);

const failRuntimeActivationFinalReadinessScopeMismatchFixture = fixture(
  "failRuntimeActivationFinalReadinessScopeMismatchFixture",
  {
    runtimeActivationFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationFinalReadinessScope:
        "runtime_activation_execution_allowed",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationFinalReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationFinalReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeActivationFinalReadinessEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationFinalReadinessEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeActivationFinalReadinessEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationFinalReadinessEvidence: {
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

const failExternalNetworkCalledFixture = fixture(
  "failExternalNetworkCalledFixture",
  {
    safetyEvidence: {
      externalNetworkCalled: true,
    },
  }
);

const failLiveOroPlayApiCalledFixture = fixture(
  "failLiveOroPlayApiCalledFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCalled: true,
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

const failWalletMutationPerformedFixture = fixture(
  "failWalletMutationPerformedFixture",
  {
    safetyEvidence: {
      walletMutationPerformed: true,
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

const failLedgerMutationPerformedFixture = fixture(
  "failLedgerMutationPerformedFixture",
  {
    safetyEvidence: {
      ledgerMutationPerformed: true,
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

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture,
    failMissingOro7mRuntimeActivationDecisionFixture,
    failInvalidOro7mRuntimeActivationDecisionStatusFixture,
    failRuntimeActivationFinalReadinessMissingFixture,
    failRuntimeActivationFinalReadinessScopeMismatchFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
    failLiveExecutionApprovedFixture,
    failLiveExecutedFixture,
    failExternalNetworkAllowedFixture,
    failExternalNetworkCalledFixture,
    failLiveOroPlayApiCalledFixture,
    failWalletMutationAllowedFixture,
    failWalletMutationPerformedFixture,
    failLedgerMutationAllowedFixture,
    failLedgerMutationPerformedFixture,
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
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture,
  failMissingOro7mRuntimeActivationDecisionFixture,
  failInvalidOro7mRuntimeActivationDecisionStatusFixture,
  failRuntimeActivationFinalReadinessMissingFixture,
  failRuntimeActivationFinalReadinessScopeMismatchFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failActualExecutionEnabledFixture,
  failActualExecutionAuthorizedFixture,
  failLiveExecutionApprovedFixture,
  failLiveExecutedFixture,
  failExternalNetworkAllowedFixture,
  failExternalNetworkCalledFixture,
  failLiveOroPlayApiCalledFixture,
  failWalletMutationAllowedFixture,
  failWalletMutationPerformedFixture,
  failLedgerMutationAllowedFixture,
  failLedgerMutationPerformedFixture,
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
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures,
};
