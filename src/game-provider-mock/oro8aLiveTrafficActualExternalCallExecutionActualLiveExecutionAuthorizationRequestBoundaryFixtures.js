"use strict";

const {
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary,
} = require("./oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture = fixture(
  "happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture"
);

const failMissingOro7zFinalPreLiveExecutionGateFixture = fixture(
  "failMissingOro7zFinalPreLiveExecutionGateFixture",
  {
    oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      dependsOnOro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGate:
        false,
    },
  }
);

const failOro7zFinalPreLiveExecutionGateNotPassedFixture = fixture(
  "failOro7zFinalPreLiveExecutionGateNotPassedFixture",
  {
    oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      oro7zLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassed:
        false,
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGatePassedFromOro7z:
        false,
    },
  }
);

const failOro7zFinalPreLiveExecutionGateStatusMismatchFixture = fixture(
  "failOro7zFinalPreLiveExecutionGateStatusMismatchFixture",
  {
    oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateStatusFromOro7z:
        "approved_to_execute_now",
    },
  }
);

const failOro7zFinalPreLiveExecutionGateScopeMismatchFixture = fixture(
  "failOro7zFinalPreLiveExecutionGateScopeMismatchFixture",
  {
    oro7zRuntimeActivationExecutionFinalPreLiveExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeActivationExecutionFinalPreLiveExecutionGateScopeFromOro7z:
        "runtime_activation_execution_final_pre_live_execution_gate_scope_mismatch",
    },
  }
);

const failAuthorizationRequestNotPreparedFixture = fixture(
  "failAuthorizationRequestNotPreparedFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestPrepared: false,
    },
  }
);

const failAuthorizationRequestNotSubmittedFixture = fixture(
  "failAuthorizationRequestNotSubmittedFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestSubmitted: false,
    },
  }
);

const failAuthorizationRequestStatusMismatchFixture = fixture(
  "failAuthorizationRequestStatusMismatchFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestStatus: "approved_to_execute_now",
    },
  }
);

const failAuthorizationRequestScopeMismatchFixture = fixture(
  "failAuthorizationRequestScopeMismatchFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestScope:
        "actual_live_execution_authorization_request_scope_mismatch",
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  actualLiveExecutionAuthorizationRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  actualLiveExecutionAuthorizationRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  actualLiveExecutionAuthorizationRequestEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  actualLiveExecutionAuthorizationRequestEvidence: {
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

const failNextPhaseAuthorizationDecisionMissingFixture = fixture(
  "failNextPhaseAuthorizationDecisionMissingFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionAuthorizationDecision: false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionAuthorizationRequestEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionAuthorizationRequestEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture,
    failMissingOro7zFinalPreLiveExecutionGateFixture,
    failOro7zFinalPreLiveExecutionGateNotPassedFixture,
    failOro7zFinalPreLiveExecutionGateStatusMismatchFixture,
    failOro7zFinalPreLiveExecutionGateScopeMismatchFixture,
    failAuthorizationRequestNotPreparedFixture,
    failAuthorizationRequestNotSubmittedFixture,
    failAuthorizationRequestStatusMismatchFixture,
    failAuthorizationRequestScopeMismatchFixture,
    failRuntimeEnabledFixture,
    failRuntimeActivatedFixture,
    failActualExecutionEnabledFixture,
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
    failNextPhaseAuthorizationDecisionMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionAuthorizationRequestBoundaryFixture,
  failMissingOro7zFinalPreLiveExecutionGateFixture,
  failOro7zFinalPreLiveExecutionGateNotPassedFixture,
  failOro7zFinalPreLiveExecutionGateStatusMismatchFixture,
  failOro7zFinalPreLiveExecutionGateScopeMismatchFixture,
  failAuthorizationRequestNotPreparedFixture,
  failAuthorizationRequestNotSubmittedFixture,
  failAuthorizationRequestStatusMismatchFixture,
  failAuthorizationRequestScopeMismatchFixture,
  failRuntimeEnabledFixture,
  failRuntimeActivatedFixture,
  failActualExecutionEnabledFixture,
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
  failNextPhaseAuthorizationDecisionMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryFixtures,
};
