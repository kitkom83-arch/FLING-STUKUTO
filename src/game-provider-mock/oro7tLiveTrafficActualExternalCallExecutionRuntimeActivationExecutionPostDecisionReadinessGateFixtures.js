"use strict";

const {
  buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate,
} = require("./oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7tRuntimeActivationExecutionPostDecisionReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionPostDecisionReadinessFixture = fixture(
  "happyPathRuntimeActivationExecutionPostDecisionReadinessFixture"
);

const failMissingOro7sDecisionFixture = fixture("failMissingOro7sDecisionFixture", {
  oro7sRuntimeActivationExecutionDecisionEvidence: {
    dependsOnOro7sLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionDecisionBoundary:
      false,
  },
});

const failDecisionStatusMismatchFixture = fixture("failDecisionStatusMismatchFixture", {
  oro7sRuntimeActivationExecutionDecisionEvidence: {
    actualExternalCallExecutionRuntimeActivationExecutionDecisionStatusFromOro7s:
      "approved_for_wrong_runtime_activation_execution_post_decision_readiness",
  },
});

const failDecisionScopeMismatchFixture = fixture("failDecisionScopeMismatchFixture", {
  oro7sRuntimeActivationExecutionDecisionEvidence: {
    actualExternalCallExecutionRuntimeActivationExecutionDecisionScopeFromOro7s:
      "runtime_activation_execution_allowed",
  },
});

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionPostDecisionReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionPostDecisionReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionPostDecisionReadinessEvidence: {
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

function buildOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures() {
  return [
    happyPathRuntimeActivationExecutionPostDecisionReadinessFixture,
    failMissingOro7sDecisionFixture,
    failDecisionStatusMismatchFixture,
    failDecisionScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionPostDecisionReadinessFixture,
  failMissingOro7sDecisionFixture,
  failDecisionStatusMismatchFixture,
  failDecisionScopeMismatchFixture,
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
  buildOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGateFixtures,
};
