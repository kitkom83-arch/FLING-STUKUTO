"use strict";

const {
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary,
} = require("./oro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture"
);

const failOro8mDependencyMissingFixture = fixture("failOro8mDependencyMissingFixture", {
  oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
    dependsOnOro8mActualLiveExecutionFinalExecutionApprovalBoundary: false,
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed: false,
    actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m: false,
    actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m: false,
    actualLiveExecutionFinalExecutionApprovalPassedFromOro8m: false,
    actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m: false,
  },
});

const failOro8mFinalExecutionApprovalNotPreparedFixture = fixture(
  "failOro8mFinalExecutionApprovalNotPreparedFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionFinalExecutionApprovalPreparedFromOro8m: false,
    },
  }
);

const failOro8mFinalExecutionApprovalNotIssuedFixture = fixture(
  "failOro8mFinalExecutionApprovalNotIssuedFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionFinalExecutionApprovalIssuedFromOro8m: false,
    },
  }
);

const failOro8mFinalExecutionApprovalBoundaryNotPassedFixture = fixture(
  "failOro8mFinalExecutionApprovalBoundaryNotPassedFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      oro8mActualLiveExecutionFinalExecutionApprovalBoundaryPassed: false,
    },
  }
);

const failOro8mFinalExecutionApprovalNotRecordedFixture = fixture(
  "failOro8mFinalExecutionApprovalNotRecordedFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionFinalExecutionApprovalRecordedFromOro8m: false,
    },
  }
);

const failOro8mFinalExecutionApprovalStatusMismatchFixture = fixture(
  "failOro8mFinalExecutionApprovalStatusMismatchFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionFinalExecutionApprovalStatusFromOro8m:
        "approved_for_actual_final_execution_now",
    },
  }
);

const failOro8mFinalExecutionApprovalScopeMismatchFixture = fixture(
  "failOro8mFinalExecutionApprovalScopeMismatchFixture",
  {
    oro8mActualLiveExecutionFinalExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionFinalExecutionApprovalScopeFromOro8m:
        "actual_live_execution_final_execution_approval_scope_mismatch",
    },
  }
);

const failFinalExecutionDecisionApprovesRuntimeExecutionFixture = fixture(
  "failFinalExecutionDecisionApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failFinalExecutionDecisionActivatesRuntimeFixture = fixture(
  "failFinalExecutionDecisionActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failFinalExecutionDecisionEnablesRuntimeFixture = fixture(
  "failFinalExecutionDecisionEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failFinalExecutionDecisionExecutesLiveCallFixture = fixture(
  "failFinalExecutionDecisionExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionFinalExecutionExecuted: true,
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
  actualLiveExecutionFinalExecutionDecisionEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionMissingFixture = fixture(
  "failSeparateActualExecutionFinalExecutionMissingFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      separateActualExecutionFinalExecutionRequired: false,
    },
  }
);

function buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
    failOro8mDependencyMissingFixture,
    failOro8mFinalExecutionApprovalNotPreparedFixture,
    failOro8mFinalExecutionApprovalNotIssuedFixture,
    failOro8mFinalExecutionApprovalBoundaryNotPassedFixture,
    failOro8mFinalExecutionApprovalNotRecordedFixture,
    failOro8mFinalExecutionApprovalStatusMismatchFixture,
    failOro8mFinalExecutionApprovalScopeMismatchFixture,
    failFinalExecutionDecisionApprovesRuntimeExecutionFixture,
    failFinalExecutionDecisionActivatesRuntimeFixture,
    failFinalExecutionDecisionEnablesRuntimeFixture,
    failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture,
    failFinalExecutionDecisionExecutesLiveCallFixture,
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
    failSeparateActualExecutionFinalExecutionMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
  failOro8mDependencyMissingFixture,
  failOro8mFinalExecutionApprovalNotPreparedFixture,
  failOro8mFinalExecutionApprovalNotIssuedFixture,
  failOro8mFinalExecutionApprovalBoundaryNotPassedFixture,
  failOro8mFinalExecutionApprovalNotRecordedFixture,
  failOro8mFinalExecutionApprovalStatusMismatchFixture,
  failOro8mFinalExecutionApprovalScopeMismatchFixture,
  failFinalExecutionDecisionApprovesRuntimeExecutionFixture,
  failFinalExecutionDecisionActivatesRuntimeFixture,
  failFinalExecutionDecisionEnablesRuntimeFixture,
  failFinalExecutionDecisionAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionDecisionExecutesLiveCallFixture,
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
  failSeparateActualExecutionFinalExecutionMissingFixture,
  cloneFixture,
  buildOro8nLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundaryFixtures,
};
