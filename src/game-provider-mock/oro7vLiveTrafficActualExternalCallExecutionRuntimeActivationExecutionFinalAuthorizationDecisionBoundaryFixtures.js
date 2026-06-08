"use strict";

const {
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
} = require("./oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture = fixture(
  "happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture"
);

const failMissingOro7uFinalAuthorizationRequestFixture = fixture(
  "failMissingOro7uFinalAuthorizationRequestFixture",
  {
    oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence: {
      dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary:
        false,
    },
  }
);

const failOro7uFinalAuthorizationRequestStatusMismatchFixture = fixture(
  "failOro7uFinalAuthorizationRequestStatusMismatchFixture",
  {
    oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u:
        "submitted_pending_actual_external_call_execution_runtime_activation_execution_final_authorization_decision_mismatch",
    },
  }
);

const failOro7uFinalAuthorizationRequestScopeMismatchFixture = fixture(
  "failOro7uFinalAuthorizationRequestScopeMismatchFixture",
  {
    oro7uRuntimeActivationExecutionFinalAuthorizationRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u:
        "runtime_activation_execution_final_authorization_request_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionFinalAuthorizationDecisionEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionFinalAuthorizationDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionFinalAuthorizationDecisionEvidence: {
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

function buildOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture,
    failMissingOro7uFinalAuthorizationRequestFixture,
    failOro7uFinalAuthorizationRequestStatusMismatchFixture,
    failOro7uFinalAuthorizationRequestScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture,
  failMissingOro7uFinalAuthorizationRequestFixture,
  failOro7uFinalAuthorizationRequestStatusMismatchFixture,
  failOro7uFinalAuthorizationRequestScopeMismatchFixture,
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
  buildOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures,
};
