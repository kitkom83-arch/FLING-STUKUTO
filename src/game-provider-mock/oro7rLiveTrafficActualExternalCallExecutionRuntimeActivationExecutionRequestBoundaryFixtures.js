"use strict";

const {
  buildOro7rRuntimeActivationExecutionRequestBoundary,
} = require("./oro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7rRuntimeActivationExecutionRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionRequestFixture = fixture(
  "happyPathRuntimeActivationExecutionRequestFixture"
);

const failMissingOro7qFinalReadinessFixture = fixture(
  "failMissingOro7qFinalReadinessFixture",
  {
    oro7qRuntimeActivationExecutionFinalReadinessEvidence: {
      dependsOnOro7qLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalReadinessGate:
        false,
    },
  }
);

const failOro7qFinalReadinessScopeMismatchFixture = fixture(
  "failOro7qFinalReadinessScopeMismatchFixture",
  {
    oro7qRuntimeActivationExecutionFinalReadinessEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalReadinessScopeFromOro7q:
        "runtime_activation_execution_allowed",
    },
  }
);

const failRequestNotSubmittedFixture = fixture("failRequestNotSubmittedFixture", {
  runtimeActivationExecutionRequestEvidence: {
    actualExternalCallExecutionRuntimeActivationExecutionRequestSubmitted: false,
  },
});

const failRequestStatusMismatchFixture = fixture("failRequestStatusMismatchFixture", {
  runtimeActivationExecutionRequestEvidence: {
    actualExternalCallExecutionRuntimeActivationExecutionRequestStatus:
      "submitted_pending_wrong_runtime_activation_execution_decision",
  },
});

const failRequestScopeMismatchFixture = fixture("failRequestScopeMismatchFixture", {
  runtimeActivationExecutionRequestEvidence: {
    actualExternalCallExecutionRuntimeActivationExecutionRequestScope:
      "runtime_activation_execution_allowed",
  },
});

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionRequestEvidence: {
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

function buildOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionRequestFixture,
    failMissingOro7qFinalReadinessFixture,
    failOro7qFinalReadinessScopeMismatchFixture,
    failRequestNotSubmittedFixture,
    failRequestStatusMismatchFixture,
    failRequestScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionRequestFixture,
  failMissingOro7qFinalReadinessFixture,
  failOro7qFinalReadinessScopeMismatchFixture,
  failRequestNotSubmittedFixture,
  failRequestStatusMismatchFixture,
  failRequestScopeMismatchFixture,
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
  buildOro7rLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionRequestBoundaryFixtures,
};
