"use strict";

const {
  buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
} = require("./oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture");

const failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture = fixture(
  "failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture",
  {
    oro7kRuntimeEnablementFinalActivationReadinessGateEvidence: {
      dependsOnOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate:
        false,
    },
  }
);

const failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture = fixture(
  "failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture",
  {
    oro7kRuntimeEnablementFinalActivationReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatusFromOro7k:
        "ready_for_runtime_activation_without_request_boundary",
    },
  }
);

const failRuntimeActivationRequestNotSubmittedFixture = fixture(
  "failRuntimeActivationRequestNotSubmittedFixture",
  {
    runtimeActivationRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationRequestSubmitted: false,
    },
  }
);

const failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture = fixture(
  "failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture",
  {
    runtimeActivationRequestEvidence: {
      nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationDecision:
        false,
    },
  }
);

const failRuntimeActivationDecisionIssuedFixture = fixture(
  "failRuntimeActivationDecisionIssuedFixture",
  {
    runtimeActivationRequestEvidence: {
      actualExternalCallExecutionRuntimeActivationDecisionIssued: true,
    },
  }
);

const failRuntimeActivatedFixture = fixture("failRuntimeActivatedFixture", {
  runtimeActivationRequestEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeActivationRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failActualExecutionEnabledFixture = fixture(
  "failActualExecutionEnabledFixture",
  {
    runtimeActivationRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failActualExecutionAuthorizedFixture = fixture(
  "failActualExecutionAuthorizedFixture",
  {
    runtimeActivationRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  runtimeActivationRequestEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  runtimeActivationRequestEvidence: {
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

function buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture,
    failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture,
    failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture,
    failRuntimeActivationRequestNotSubmittedFixture,
    failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture,
    failRuntimeActivationDecisionIssuedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture,
  failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture,
  failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture,
  failRuntimeActivationRequestNotSubmittedFixture,
  failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture,
  failRuntimeActivationDecisionIssuedFixture,
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
  buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures,
};
