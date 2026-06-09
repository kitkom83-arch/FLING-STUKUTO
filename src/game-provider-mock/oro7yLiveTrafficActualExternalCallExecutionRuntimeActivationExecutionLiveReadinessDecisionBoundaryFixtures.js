"use strict";

const {
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary,
} = require("./oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture = fixture(
  "happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture"
);

const failMissingOro7xLiveReadinessRequestFixture = fixture(
  "failMissingOro7xLiveReadinessRequestFixture",
  {
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence: {
      dependsOnOro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundary:
        false,
    },
  }
);

const failOro7xLiveReadinessRequestNotPassedFixture = fixture(
  "failOro7xLiveReadinessRequestNotPassedFixture",
  {
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence: {
      oro7xLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestBoundaryPassed:
        false,
    },
  }
);

const failOro7xLiveReadinessRequestNotSubmittedFixture = fixture(
  "failOro7xLiveReadinessRequestNotSubmittedFixture",
  {
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestSubmittedFromOro7x:
        false,
    },
  }
);

const failOro7xLiveReadinessRequestStatusMismatchFixture = fixture(
  "failOro7xLiveReadinessRequestStatusMismatchFixture",
  {
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestStatusFromOro7x:
        "not_submitted",
    },
  }
);

const failOro7xLiveReadinessRequestScopeMismatchFixture = fixture(
  "failOro7xLiveReadinessRequestScopeMismatchFixture",
  {
    oro7xRuntimeActivationExecutionLiveReadinessRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessRequestScopeFromOro7x:
        "runtime_activation_execution_live_readiness_request_scope_mismatch",
    },
  }
);

const failLiveReadinessDecisionNotIssuedFixture = fixture(
  "failLiveReadinessDecisionNotIssuedFixture",
  {
    runtimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssued:
        false,
    },
  }
);

const failLiveReadinessDecisionStatusMismatchFixture = fixture(
  "failLiveReadinessDecisionStatusMismatchFixture",
  {
    runtimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatus:
        "approved_to_call_now",
    },
  }
);

const failLiveReadinessDecisionScopeMismatchFixture = fixture(
  "failLiveReadinessDecisionScopeMismatchFixture",
  {
    runtimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScope:
        "runtime_activation_execution_live_readiness_decision_scope_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionLiveReadinessDecisionEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionLiveReadinessDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionLiveReadinessDecisionEvidence: {
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

function buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures() {
  return [
    happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture,
    failMissingOro7xLiveReadinessRequestFixture,
    failOro7xLiveReadinessRequestNotPassedFixture,
    failOro7xLiveReadinessRequestNotSubmittedFixture,
    failOro7xLiveReadinessRequestStatusMismatchFixture,
    failOro7xLiveReadinessRequestScopeMismatchFixture,
    failLiveReadinessDecisionNotIssuedFixture,
    failLiveReadinessDecisionStatusMismatchFixture,
    failLiveReadinessDecisionScopeMismatchFixture,
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
  happyPathRuntimeActivationExecutionLiveReadinessDecisionFixture,
  failMissingOro7xLiveReadinessRequestFixture,
  failOro7xLiveReadinessRequestNotPassedFixture,
  failOro7xLiveReadinessRequestNotSubmittedFixture,
  failOro7xLiveReadinessRequestStatusMismatchFixture,
  failOro7xLiveReadinessRequestScopeMismatchFixture,
  failLiveReadinessDecisionNotIssuedFixture,
  failLiveReadinessDecisionStatusMismatchFixture,
  failLiveReadinessDecisionScopeMismatchFixture,
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
  buildOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryFixtures,
};
