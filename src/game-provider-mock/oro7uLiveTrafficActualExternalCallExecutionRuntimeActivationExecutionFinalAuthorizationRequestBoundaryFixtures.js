"use strict";

const {
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
} = require("./oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture = fixture(
  "happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture"
);

const failMissingOro7tPostDecisionReadinessFixture = fixture(
  "failMissingOro7tPostDecisionReadinessFixture",
  {
    oro7tRuntimeActivationExecutionPostDecisionReadinessEvidence: {
      dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate:
        false,
    },
  }
);

const failOro7tPostDecisionReadinessScopeMismatchFixture = fixture(
  "failOro7tPostDecisionReadinessScopeMismatchFixture",
  {
    oro7tRuntimeActivationExecutionPostDecisionReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t:
        "runtime_activation_execution_post_decision_readiness_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionFinalAuthorizationRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionFinalAuthorizationRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionFinalAuthorizationRequestEvidence: {
    actualExternalCallExecutionLiveExecuted: true,
  },
});

const failExternalNetworkAllowedCalledFixture = fixture(
  "failExternalNetworkAllowedCalledFixture",
  {
    safetyEvidence: {
      externalNetworkAllowed: true,
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

function buildOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture,
    failMissingOro7tPostDecisionReadinessFixture,
    failOro7tPostDecisionReadinessScopeMismatchFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
    failLiveExecutedFixture,
    failExternalNetworkAllowedCalledFixture,
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
  happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture,
  failMissingOro7tPostDecisionReadinessFixture,
  failOro7tPostDecisionReadinessScopeMismatchFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failLiveExecutedFixture,
  failExternalNetworkAllowedCalledFixture,
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
  buildOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures,
};
