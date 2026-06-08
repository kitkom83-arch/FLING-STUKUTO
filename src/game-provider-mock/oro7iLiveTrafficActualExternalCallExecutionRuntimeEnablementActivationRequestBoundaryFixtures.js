"use strict";

const {
  buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
} = require("./oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture"
  );

const failMissingOro7hRuntimeEnablementFinalReadinessFixture = fixture(
  "failMissingOro7hRuntimeEnablementFinalReadinessFixture",
  {
    oro7hRuntimeEnablementFinalReadinessGateEvidence: {
      dependsOnOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate:
        false,
    },
  }
);

const failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture = fixture(
  "failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture",
  {
    oro7hRuntimeEnablementFinalReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnablementFinalReadinessStatusFromOro7h:
        "ready_for_runtime_enablement_activation_without_request_boundary",
    },
  }
);

const failRuntimeEnablementActivationRequestNotSubmittedFixture = fixture(
  "failRuntimeEnablementActivationRequestNotSubmittedFixture",
  {
    runtimeEnablementActivationRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementActivationRequestSubmitted: false,
    },
  }
);

const failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture =
  fixture(
    "failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture",
    {
      runtimeEnablementActivationRequestEvidence: {
        nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationDecision:
          false,
      },
    }
  );

const failActivationDecisionIssuedFixture = fixture(
  "failActivationDecisionIssuedFixture",
  {
    runtimeEnablementActivationRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued: true,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeEnablementActivationRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeEnablementActivationRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeEnablementActivationRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeEnablementActivationRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeEnablementActivationRequestEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeEnablementActivationRequestEvidence: {
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

const failLiveOroPlayApiCallAllowedFixture = fixture(
  "failLiveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const failWalletMutationAllowedFixture = fixture(
  "failWalletMutationAllowedFixture",
  {
    safetyEvidence: {
      walletMutationAllowed: true,
    },
  }
);

const failLedgerMutationAllowedFixture = fixture(
  "failLedgerMutationAllowedFixture",
  {
    safetyEvidence: {
      ledgerMutationAllowed: true,
    },
  }
);

const failPrismaWriteAllowedFixture = fixture("failPrismaWriteAllowedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
  },
});

const failDbTransactionAllowedFixture = fixture("failDbTransactionAllowedFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
  },
});

const failMigrationAllowedFixture = fixture("failMigrationAllowedFixture", {
  safetyEvidence: {
    migrationAllowed: true,
  },
});

const failDeployAllowedFixture = fixture("failDeployAllowedFixture", {
  safetyEvidence: {
    deployAllowed: true,
  },
});

const failRouteEnablementAllowedFixture = fixture(
  "failRouteEnablementAllowedFixture",
  {
    safetyEvidence: {
      routeEnablementAllowed: true,
    },
  }
);

const failExpressMountAllowedFixture = fixture("failExpressMountAllowedFixture", {
  safetyEvidence: {
    expressMountAllowed: true,
  },
});

const failPublicAliasAllowedFixture = fixture("failPublicAliasAllowedFixture", {
  safetyEvidence: {
    publicAliasAllowed: true,
  },
});

const failApiBalanceAliasAllowedFixture = fixture(
  "failApiBalanceAliasAllowedFixture",
  {
    safetyEvidence: {
      apiBalanceAliasAllowed: true,
    },
  }
);

const failApiTransactionAliasAllowedFixture = fixture(
  "failApiTransactionAliasAllowedFixture",
  {
    safetyEvidence: {
      apiTransactionAliasAllowed: true,
    },
  }
);

const failApiOroplayBalanceRouteAllowedFixture = fixture(
  "failApiOroplayBalanceRouteAllowedFixture",
  {
    safetyEvidence: {
      apiOroplayBalanceRouteAllowed: true,
    },
  }
);

const failApiOroplayTransactionRouteAllowedFixture = fixture(
  "failApiOroplayTransactionRouteAllowedFixture",
  {
    safetyEvidence: {
      apiOroplayTransactionRouteAllowed: true,
    },
  }
);

function buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture,
    failMissingOro7hRuntimeEnablementFinalReadinessFixture,
    failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture,
    failRuntimeEnablementActivationRequestNotSubmittedFixture,
    failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture,
    failActivationDecisionIssuedFixture,
    failRuntimeEnabledFixture,
    failRuntimeActivatedFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
    failLiveExecutionApprovedFixture,
    failLiveExecutedFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failMigrationAllowedFixture,
    failDeployAllowedFixture,
    failRouteEnablementAllowedFixture,
    failExpressMountAllowedFixture,
    failPublicAliasAllowedFixture,
    failApiBalanceAliasAllowedFixture,
    failApiTransactionAliasAllowedFixture,
    failApiOroplayBalanceRouteAllowedFixture,
    failApiOroplayTransactionRouteAllowedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture,
  failMissingOro7hRuntimeEnablementFinalReadinessFixture,
  failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture,
  failRuntimeEnablementActivationRequestNotSubmittedFixture,
  failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture,
  failActivationDecisionIssuedFixture,
  failRuntimeEnabledFixture,
  failRuntimeActivatedFixture,
  failActualExecutionEnabledFixture,
  failActualExecutionAuthorizedFixture,
  failLiveExecutionApprovedFixture,
  failLiveExecutedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failMigrationAllowedFixture,
  failDeployAllowedFixture,
  failRouteEnablementAllowedFixture,
  failExpressMountAllowedFixture,
  failPublicAliasAllowedFixture,
  failApiBalanceAliasAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  cloneFixture,
  buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures,
};
