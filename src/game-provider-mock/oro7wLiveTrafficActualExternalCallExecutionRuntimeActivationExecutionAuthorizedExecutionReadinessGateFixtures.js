"use strict";

const {
  buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate,
} = require("./oro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7wRuntimeActivationExecutionAuthorizedExecutionReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture = fixture(
  "happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture"
);

const failMissingOro7vFinalAuthorizationDecisionFixture = fixture(
  "failMissingOro7vFinalAuthorizationDecisionFixture",
  {
    oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence: {
      dependsOnOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary:
        false,
    },
  }
);

const failOro7vFinalAuthorizationDecisionStatusMismatchFixture = fixture(
  "failOro7vFinalAuthorizationDecisionStatusMismatchFixture",
  {
    oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatusFromOro7v:
        "approved_for_unexpected_runtime_activation_execution_authorized_execution_readiness_mismatch",
    },
  }
);

const failOro7vFinalAuthorizationDecisionScopeMismatchFixture = fixture(
  "failOro7vFinalAuthorizationDecisionScopeMismatchFixture",
  {
    oro7vRuntimeActivationExecutionFinalAuthorizationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScopeFromOro7v:
        "runtime_activation_execution_final_authorization_decision_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
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

function buildOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures() {
  return [
    happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture,
    failMissingOro7vFinalAuthorizationDecisionFixture,
    failOro7vFinalAuthorizationDecisionStatusMismatchFixture,
    failOro7vFinalAuthorizationDecisionScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionAuthorizedExecutionReadinessFixture,
  failMissingOro7vFinalAuthorizationDecisionFixture,
  failOro7vFinalAuthorizationDecisionStatusMismatchFixture,
  failOro7vFinalAuthorizationDecisionScopeMismatchFixture,
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
  buildOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGateFixtures,
};
