"use strict";

const {
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary,
} = require("./oro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture"
);

const failOro8nDependencyMissingFixture = fixture("failOro8nDependencyMissingFixture", {
  oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
    dependsOnOro8nActualLiveExecutionFinalExecutionDecisionBoundary: false,
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed: false,
    actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n: false,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n: false,
    actualLiveExecutionFinalExecutionDecisionPassedFromOro8n: false,
    actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n: false,
  },
});

const failOro8nFinalExecutionDecisionNotPreparedFixture = fixture(
  "failOro8nFinalExecutionDecisionNotPreparedFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionPreparedFromOro8n: false,
    },
  }
);

const failOro8nFinalExecutionDecisionNotIssuedFixture = fixture(
  "failOro8nFinalExecutionDecisionNotIssuedFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionIssuedFromOro8n: false,
    },
  }
);

const failOro8nFinalExecutionDecisionBoundaryNotPassedFixture = fixture(
  "failOro8nFinalExecutionDecisionBoundaryNotPassedFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      oro8nActualLiveExecutionFinalExecutionDecisionBoundaryPassed: false,
    },
  }
);

const failOro8nFinalExecutionDecisionNotRecordedFixture = fixture(
  "failOro8nFinalExecutionDecisionNotRecordedFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionRecordedFromOro8n: false,
    },
  }
);

const failOro8nFinalExecutionDecisionStatusMismatchFixture = fixture(
  "failOro8nFinalExecutionDecisionStatusMismatchFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionStatusFromOro8n:
        "decided_for_actual_final_execution_now",
    },
  }
);

const failOro8nFinalExecutionDecisionScopeMismatchFixture = fixture(
  "failOro8nFinalExecutionDecisionScopeMismatchFixture",
  {
    oro8nActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionScopeFromOro8n:
        "actual_live_execution_final_execution_decision_scope_mismatch",
    },
  }
);

const failFinalExecutionExecutionApprovesRuntimeExecutionFixture = fixture(
  "failFinalExecutionExecutionApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failFinalExecutionExecutionActivatesRuntimeFixture = fixture(
  "failFinalExecutionExecutionActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failFinalExecutionExecutionEnablesRuntimeFixture = fixture(
  "failFinalExecutionExecutionEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failFinalExecutionExecutionExecutesLiveCallFixture = fixture(
  "failFinalExecutionExecutionExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionFinalExecutionExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failExternalNetworkFlagFixture = fixture("failExternalNetworkFlagFixture", {
  safetyEvidence: {
    externalNetworkAllowed: true,
    externalNetworkCalled: true,
  },
});

const failLiveOroPlayApiFlagFixture = fixture("failLiveOroPlayApiFlagFixture", {
  safetyEvidence: {
    liveOroPlayApiCallAllowed: true,
    liveOroPlayApiCalled: true,
  },
});

const failWalletMutationFlagFixture = fixture("failWalletMutationFlagFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
    walletMutationPerformed: true,
  },
});

const failLedgerMutationFlagFixture = fixture("failLedgerMutationFlagFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
    ledgerMutationPerformed: true,
  },
});

const failPrismaWriteFlagFixture = fixture("failPrismaWriteFlagFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
    prismaWritePerformed: true,
  },
});

const failDbTransactionFlagFixture = fixture("failDbTransactionFlagFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
    dbTransactionPerformed: true,
  },
});

const failRouteEnablementFlagFixture = fixture("failRouteEnablementFlagFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
  },
});

const failExpressMountFlagFixture = fixture("failExpressMountFlagFixture", {
  safetyEvidence: {
    expressMountAllowed: true,
  },
});

const failPublicAliasFlagFixture = fixture("failPublicAliasFlagFixture", {
  safetyEvidence: {
    publicAliasAllowed: true,
  },
});

const failApiBalanceAliasFlagFixture = fixture("failApiBalanceAliasFlagFixture", {
  safetyEvidence: {
    apiBalanceAliasAllowed: true,
  },
});

const failApiTransactionAliasFlagFixture = fixture(
  "failApiTransactionAliasFlagFixture",
  {
    safetyEvidence: {
      apiTransactionAliasAllowed: true,
    },
  }
);

const failApiOroplayBalanceRouteFlagFixture = fixture(
  "failApiOroplayBalanceRouteFlagFixture",
  {
    safetyEvidence: {
      apiOroplayBalanceRouteAllowed: true,
    },
  }
);

const failApiOroplayTransactionRouteFlagFixture = fixture(
  "failApiOroplayTransactionRouteFlagFixture",
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

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionExecutionEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionVerificationMissingFixture = fixture(
  "failSeparateActualExecutionFinalExecutionVerificationMissingFixture",
  {
    actualLiveExecutionFinalExecutionExecutionEvidence: {
      separateActualExecutionFinalExecutionVerificationRequired: false,
    },
  }
);

function buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture,
    failOro8nDependencyMissingFixture,
    failOro8nFinalExecutionDecisionNotPreparedFixture,
    failOro8nFinalExecutionDecisionNotIssuedFixture,
    failOro8nFinalExecutionDecisionBoundaryNotPassedFixture,
    failOro8nFinalExecutionDecisionNotRecordedFixture,
    failOro8nFinalExecutionDecisionStatusMismatchFixture,
    failOro8nFinalExecutionDecisionScopeMismatchFixture,
    failFinalExecutionExecutionApprovesRuntimeExecutionFixture,
    failFinalExecutionExecutionActivatesRuntimeFixture,
    failFinalExecutionExecutionEnablesRuntimeFixture,
    failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture,
    failFinalExecutionExecutionExecutesLiveCallFixture,
    failExternalNetworkFlagFixture,
    failLiveOroPlayApiFlagFixture,
    failWalletMutationFlagFixture,
    failLedgerMutationFlagFixture,
    failPrismaWriteFlagFixture,
    failDbTransactionFlagFixture,
    failRouteEnablementFlagFixture,
    failExpressMountFlagFixture,
    failPublicAliasFlagFixture,
    failApiBalanceAliasFlagFixture,
    failApiTransactionAliasFlagFixture,
    failApiOroplayBalanceRouteFlagFixture,
    failApiOroplayTransactionRouteFlagFixture,
    failSensitiveOutputFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionVerificationMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionExecutionBoundaryFixture,
  failOro8nDependencyMissingFixture,
  failOro8nFinalExecutionDecisionNotPreparedFixture,
  failOro8nFinalExecutionDecisionNotIssuedFixture,
  failOro8nFinalExecutionDecisionBoundaryNotPassedFixture,
  failOro8nFinalExecutionDecisionNotRecordedFixture,
  failOro8nFinalExecutionDecisionStatusMismatchFixture,
  failOro8nFinalExecutionDecisionScopeMismatchFixture,
  failFinalExecutionExecutionApprovesRuntimeExecutionFixture,
  failFinalExecutionExecutionActivatesRuntimeFixture,
  failFinalExecutionExecutionEnablesRuntimeFixture,
  failFinalExecutionExecutionAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionExecutionExecutesLiveCallFixture,
  failExternalNetworkFlagFixture,
  failLiveOroPlayApiFlagFixture,
  failWalletMutationFlagFixture,
  failLedgerMutationFlagFixture,
  failPrismaWriteFlagFixture,
  failDbTransactionFlagFixture,
  failRouteEnablementFlagFixture,
  failExpressMountFlagFixture,
  failPublicAliasFlagFixture,
  failApiBalanceAliasFlagFixture,
  failApiTransactionAliasFlagFixture,
  failApiOroplayBalanceRouteFlagFixture,
  failApiOroplayTransactionRouteFlagFixture,
  failSensitiveOutputFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionVerificationMissingFixture,
  cloneFixture,
  buildOro8oLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionExecutionBoundaryFixtures,
};
