"use strict";

const {
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
} = require("./oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture");

const failMissingOro7lRuntimeActivationRequestFixture = fixture(
  "failMissingOro7lRuntimeActivationRequestFixture",
  {
    oro7lRuntimeActivationRequestBoundaryEvidence: {
      dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary:
        false,
    },
  }
);

const failInvalidOro7lRuntimeActivationRequestStatusFixture = fixture(
  "failInvalidOro7lRuntimeActivationRequestStatusFixture",
  {
    oro7lRuntimeActivationRequestBoundaryEvidence: {
      actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l:
        "submitted_without_runtime_activation_decision_boundary",
    },
  }
);

const failRuntimeActivationDecisionMissingFixture = fixture(
  "failRuntimeActivationDecisionMissingFixture",
  {
    runtimeActivationDecisionEvidence: {
      actualExternalCallExecutionRuntimeActivationDecisionIssued: false,
    },
  }
);

const failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture = fixture(
  "failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture",
  {
    runtimeActivationDecisionEvidence: {
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness:
        false,
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationDecisionEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeActivationDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeActivationDecisionEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationDecisionEvidence: {
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

function buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture,
    failMissingOro7lRuntimeActivationRequestFixture,
    failInvalidOro7lRuntimeActivationRequestStatusFixture,
    failRuntimeActivationDecisionMissingFixture,
    failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture,
    failRuntimeActivatedFixture,
    failRuntimeEnabledFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture,
  failMissingOro7lRuntimeActivationRequestFixture,
  failInvalidOro7lRuntimeActivationRequestStatusFixture,
  failRuntimeActivationDecisionMissingFixture,
  failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
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
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures,
};
