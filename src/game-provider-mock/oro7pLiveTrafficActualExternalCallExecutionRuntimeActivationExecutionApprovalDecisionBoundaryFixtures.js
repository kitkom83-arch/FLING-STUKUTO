"use strict";

const {
  buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary,
} = require("./oro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7pRuntimeActivationExecutionApprovalDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionApprovalDecisionFixture = fixture(
  "happyPathRuntimeActivationExecutionApprovalDecisionFixture"
);

const failMissingOro7oApprovalRequestFixture = fixture(
  "failMissingOro7oApprovalRequestFixture",
  {
    oro7oRuntimeActivationExecutionApprovalRequestEvidence: {
      dependsOnOro7oLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalRequestBoundary:
        false,
    },
  }
);

const failOro7oRequestStatusMismatchFixture = fixture(
  "failOro7oRequestStatusMismatchFixture",
  {
    oro7oRuntimeActivationExecutionApprovalRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestStatusFromOro7o:
        "submitted_pending_wrong_runtime_activation_decision",
    },
  }
);

const failOro7oRequestScopeMismatchFixture = fixture(
  "failOro7oRequestScopeMismatchFixture",
  {
    oro7oRuntimeActivationExecutionApprovalRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionApprovalRequestScopeFromOro7o:
        "runtime_activation_execution_allowed",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionApprovalDecisionEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionApprovalDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionApprovalDecisionEvidence: {
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

function buildOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionApprovalDecisionFixture,
    failMissingOro7oApprovalRequestFixture,
    failOro7oRequestStatusMismatchFixture,
    failOro7oRequestScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionApprovalDecisionFixture,
  failMissingOro7oApprovalRequestFixture,
  failOro7oRequestStatusMismatchFixture,
  failOro7oRequestScopeMismatchFixture,
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
  buildOro7pLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionApprovalDecisionBoundaryFixtures,
};
