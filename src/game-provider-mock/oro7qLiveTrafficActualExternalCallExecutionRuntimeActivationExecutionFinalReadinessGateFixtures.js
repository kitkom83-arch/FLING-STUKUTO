"use strict";

const {
  buildOro7qRuntimeActivationExecutionFinalReadinessGate,
} = require("./oro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7qRuntimeActivationExecutionFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionFinalReadinessFixture = fixture(
  "happyPathRuntimeActivationExecutionFinalReadinessFixture"
);

const failMissingOro7pApprovalDecisionFixture = fixture(
  "failMissingOro7pApprovalDecisionFixture",
  {
    oro7pRuntimeActivationExecutionApprovalDecisionEvidence: {
      dependsOnOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary:
        false,
    },
  }
);

const failOro7pDecisionStatusMismatchFixture = fixture(
  "failOro7pDecisionStatusMismatchFixture",
  {
    oro7pRuntimeActivationExecutionApprovalDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionStatusFromOro7p:
        "approved_for_wrong_runtime_activation_execution_path",
    },
  }
);

const failOro7pDecisionScopeMismatchFixture = fixture(
  "failOro7pDecisionScopeMismatchFixture",
  {
    oro7pRuntimeActivationExecutionApprovalDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionScopeFromOro7p:
        "runtime_activation_execution_allowed",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionFinalReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionFinalReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionFinalReadinessEvidence: {
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

const failWalletMutationFixture = fixture("failWalletMutationFixture", {
  safetyEvidence: {
    walletMutationPerformed: true,
  },
});

const failLedgerMutationFixture = fixture("failLedgerMutationFixture", {
  safetyEvidence: {
    ledgerMutationPerformed: true,
  },
});

const failPrismaWriteFixture = fixture("failPrismaWriteFixture", {
  safetyEvidence: {
    prismaWritePerformed: true,
  },
});

const failDbTransactionFixture = fixture("failDbTransactionFixture", {
  safetyEvidence: {
    dbTransactionPerformed: true,
  },
});

const failMigrationFixture = fixture("failMigrationFixture", {
  safetyEvidence: {
    migrationPerformed: true,
  },
});

const failDeployFixture = fixture("failDeployFixture", {
  safetyEvidence: {
    deployPerformed: true,
  },
});

const failRouteEnablementFixture = fixture("failRouteEnablementFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
  },
});

const failExpressMountFixture = fixture("failExpressMountFixture", {
  safetyEvidence: {
    expressMountAllowed: true,
  },
});

const failPublicAliasFixture = fixture("failPublicAliasFixture", {
  safetyEvidence: {
    publicAliasAllowed: true,
  },
});

const failApiBalanceAliasFixture = fixture("failApiBalanceAliasFixture", {
  safetyEvidence: {
    apiBalanceAliasAllowed: true,
  },
});

const failApiTransactionAliasFixture = fixture("failApiTransactionAliasFixture", {
  safetyEvidence: {
    apiTransactionAliasAllowed: true,
  },
});

const failApiOroplayBalanceRouteFixture = fixture(
  "failApiOroplayBalanceRouteFixture",
  {
    safetyEvidence: {
      apiOroplayBalanceRouteAllowed: true,
    },
  }
);

const failApiOroplayTransactionRouteFixture = fixture(
  "failApiOroplayTransactionRouteFixture",
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

function buildOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures() {
  return [
    happyPathRuntimeActivationExecutionFinalReadinessFixture,
    failMissingOro7pApprovalDecisionFixture,
    failOro7pDecisionStatusMismatchFixture,
    failOro7pDecisionScopeMismatchFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
    failLiveExecutedFixture,
    failExternalNetworkAllowedFixture,
    failExternalNetworkCalledFixture,
    failLiveOroPlayApiCalledFixture,
    failWalletMutationFixture,
    failLedgerMutationFixture,
    failPrismaWriteFixture,
    failDbTransactionFixture,
    failMigrationFixture,
    failDeployFixture,
    failRouteEnablementFixture,
    failExpressMountFixture,
    failPublicAliasFixture,
    failApiBalanceAliasFixture,
    failApiTransactionAliasFixture,
    failApiOroplayBalanceRouteFixture,
    failApiOroplayTransactionRouteFixture,
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathRuntimeActivationExecutionFinalReadinessFixture,
  failMissingOro7pApprovalDecisionFixture,
  failOro7pDecisionStatusMismatchFixture,
  failOro7pDecisionScopeMismatchFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failLiveExecutedFixture,
  failExternalNetworkAllowedFixture,
  failExternalNetworkCalledFixture,
  failLiveOroPlayApiCalledFixture,
  failWalletMutationFixture,
  failLedgerMutationFixture,
  failPrismaWriteFixture,
  failDbTransactionFixture,
  failMigrationFixture,
  failDeployFixture,
  failRouteEnablementFixture,
  failExpressMountFixture,
  failPublicAliasFixture,
  failApiBalanceAliasFixture,
  failApiTransactionAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGateFixtures,
};
