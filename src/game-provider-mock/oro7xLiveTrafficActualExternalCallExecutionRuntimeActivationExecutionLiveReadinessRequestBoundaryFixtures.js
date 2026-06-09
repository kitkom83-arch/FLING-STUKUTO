"use strict";

const {
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary,
} = require("./oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathRuntimeActivationExecutionLiveReadinessRequestFixture = fixture(
  "happyPathRuntimeActivationExecutionLiveReadinessRequestFixture"
);

const failMissingOro7wAuthorizedExecutionReadinessFixture = fixture(
  "failMissingOro7wAuthorizedExecutionReadinessFixture",
  {
    oro7wRuntimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
      dependsOnOro7wLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessGate:
        false,
    },
  }
);

const failOro7wAuthorizedExecutionReadinessScopeMismatchFixture = fixture(
  "failOro7wAuthorizedExecutionReadinessScopeMismatchFixture",
  {
    oro7wRuntimeActivationExecutionAuthorizedExecutionReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadinessScopeFromOro7w:
        "runtime_activation_execution_authorized_execution_readiness_mismatch",
    },
  }
);

const failLiveReadinessRequestNotSubmittedFixture = fixture(
  "failLiveReadinessRequestNotSubmittedFixture",
  {
    runtimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmitted:
        false,
    },
  }
);

const failLiveReadinessRequestScopeMismatchFixture = fixture(
  "failLiveReadinessRequestScopeMismatchFixture",
  {
    runtimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScope:
        "runtime_activation_execution_live_readiness_request_scope_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionLiveReadinessRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionLiveReadinessRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionLiveReadinessRequestEvidence: {
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

function buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionLiveReadinessRequestFixture,
    failMissingOro7wAuthorizedExecutionReadinessFixture,
    failOro7wAuthorizedExecutionReadinessScopeMismatchFixture,
    failLiveReadinessRequestNotSubmittedFixture,
    failLiveReadinessRequestScopeMismatchFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
    failActualExecutionAuthorizedFixture,
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
  happyPathRuntimeActivationExecutionLiveReadinessRequestFixture,
  failMissingOro7wAuthorizedExecutionReadinessFixture,
  failOro7wAuthorizedExecutionReadinessScopeMismatchFixture,
  failLiveReadinessRequestNotSubmittedFixture,
  failLiveReadinessRequestScopeMismatchFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failActualExecutionAuthorizedFixture,
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
  buildOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryFixtures,
};
