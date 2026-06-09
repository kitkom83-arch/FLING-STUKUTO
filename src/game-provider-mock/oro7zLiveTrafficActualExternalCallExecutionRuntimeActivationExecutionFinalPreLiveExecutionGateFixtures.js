"use strict";

const {
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate,
} = require("./oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture = fixture(
  "happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture"
);

const failMissingOro7yLiveReadinessDecisionFixture = fixture(
  "failMissingOro7yLiveReadinessDecisionFixture",
  {
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence: {
      dependsOnOro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundary:
        false,
    },
  }
);

const failOro7yLiveReadinessDecisionNotPassedFixture = fixture(
  "failOro7yLiveReadinessDecisionNotPassedFixture",
  {
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence: {
      oro7yLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionBoundaryPassed:
        false,
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionPassedFromOro7y:
        false,
    },
  }
);

const failOro7yLiveReadinessDecisionNotIssuedFixture = fixture(
  "failOro7yLiveReadinessDecisionNotIssuedFixture",
  {
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionIssuedFromOro7y:
        false,
    },
  }
);

const failOro7yLiveReadinessDecisionStatusMismatchFixture = fixture(
  "failOro7yLiveReadinessDecisionStatusMismatchFixture",
  {
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionStatusFromOro7y:
        "approved_to_execute_now",
    },
  }
);

const failOro7yLiveReadinessDecisionScopeMismatchFixture = fixture(
  "failOro7yLiveReadinessDecisionScopeMismatchFixture",
  {
    oro7yRuntimeActivationExecutionLiveReadinessDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionLiveReadinessDecisionScopeFromOro7y:
        "runtime_activation_execution_live_readiness_decision_scope_mismatch",
    },
  }
);

const failFinalPreLiveExecutionGateNotPreparedFixture = fixture(
  "failFinalPreLiveExecutionGateNotPreparedFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePrepared:
        false,
    },
  }
);

const failFinalPreLiveExecutionGateNotPassedFixture = fixture(
  "failFinalPreLiveExecutionGateNotPassedFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
        false,
    },
  }
);

const failFinalPreLiveExecutionGateStatusMismatchFixture = fixture(
  "failFinalPreLiveExecutionGateStatusMismatchFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatus:
        "approved_to_execute_now",
    },
  }
);

const failFinalPreLiveExecutionGateScopeMismatchFixture = fixture(
  "failFinalPreLiveExecutionGateScopeMismatchFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScope:
        "runtime_activation_execution_final_pre_live_execution_gate_scope_mismatch",
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
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
      liveOroPlayApiCallAllowed: true,
      liveOroPlayApiCalled: true,
    },
  }
);

const failWalletMutationFixture = fixture("failWalletMutationFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
    walletMutationPerformed: true,
  },
});

const failLedgerMutationFixture = fixture("failLedgerMutationFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
    ledgerMutationPerformed: true,
  },
});

const failPrismaWriteFixture = fixture("failPrismaWriteFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
  },
});

const failDbTransactionFixture = fixture("failDbTransactionFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
    dbTransactionPerformed: true,
  },
});

const failMigrationFixture = fixture("failMigrationFixture", {
  safetyEvidence: {
    migrationAllowed: true,
    migrationPerformed: true,
  },
});

const failDeployFixture = fixture("failDeployFixture", {
  safetyEvidence: {
    deployAllowed: true,
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

const failNextPhaseAuthorizationRequestMissingFixture = fixture(
  "failNextPhaseAuthorizationRequestMissingFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionAuthorizationRequest: false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    runtimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures() {
  return [
    happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture,
    failMissingOro7yLiveReadinessDecisionFixture,
    failOro7yLiveReadinessDecisionNotPassedFixture,
    failOro7yLiveReadinessDecisionNotIssuedFixture,
    failOro7yLiveReadinessDecisionStatusMismatchFixture,
    failOro7yLiveReadinessDecisionScopeMismatchFixture,
    failFinalPreLiveExecutionGateNotPreparedFixture,
    failFinalPreLiveExecutionGateNotPassedFixture,
    failFinalPreLiveExecutionGateStatusMismatchFixture,
    failFinalPreLiveExecutionGateScopeMismatchFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
    failActualExecutionAuthorizedFixture,
    failLiveExecutionApprovedFixture,
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
    failNextPhaseAuthorizationRequestMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathRuntimeActivationExecutionFinalPreLiveExecutionGateFixture,
  failMissingOro7yLiveReadinessDecisionFixture,
  failOro7yLiveReadinessDecisionNotPassedFixture,
  failOro7yLiveReadinessDecisionNotIssuedFixture,
  failOro7yLiveReadinessDecisionStatusMismatchFixture,
  failOro7yLiveReadinessDecisionScopeMismatchFixture,
  failFinalPreLiveExecutionGateNotPreparedFixture,
  failFinalPreLiveExecutionGateNotPassedFixture,
  failFinalPreLiveExecutionGateStatusMismatchFixture,
  failFinalPreLiveExecutionGateScopeMismatchFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failActualExecutionAuthorizedFixture,
  failLiveExecutionApprovedFixture,
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
  failNextPhaseAuthorizationRequestMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateFixtures,
};
