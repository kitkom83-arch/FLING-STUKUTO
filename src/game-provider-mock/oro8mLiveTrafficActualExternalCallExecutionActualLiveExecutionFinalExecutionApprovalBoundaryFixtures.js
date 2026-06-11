"use strict";

const {
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary,
} = require("./oro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture"
);

const failOro8lDependencyMissingFixture = fixture("failOro8lDependencyMissingFixture", {
  oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
    dependsOnOro8lActualLiveExecutionFinalExecutionRequestBoundary: false,
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed: false,
    actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l: false,
    actualLiveExecutionFinalExecutionRequestRecordedFromOro8l: false,
  },
});

const failOro8lFinalExecutionRequestNotSubmittedFixture = fixture(
  "failOro8lFinalExecutionRequestNotSubmittedFixture",
  {
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestSubmittedFromOro8l: false,
    },
  }
);

const failOro8lFinalExecutionRequestBoundaryNotPassedFixture = fixture(
  "failOro8lFinalExecutionRequestBoundaryNotPassedFixture",
  {
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      oro8lActualLiveExecutionFinalExecutionRequestBoundaryPassed: false,
    },
  }
);

const failOro8lFinalExecutionRequestNotRecordedFixture = fixture(
  "failOro8lFinalExecutionRequestNotRecordedFixture",
  {
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestRecordedFromOro8l: false,
    },
  }
);

const failOro8lFinalExecutionRequestStatusMismatchFixture = fixture(
  "failOro8lFinalExecutionRequestStatusMismatchFixture",
  {
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestStatusFromOro8l:
        "submitted_for_actual_final_execution_approval_now",
    },
  }
);

const failOro8lFinalExecutionRequestScopeMismatchFixture = fixture(
  "failOro8lFinalExecutionRequestScopeMismatchFixture",
  {
    oro8lActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestScopeFromOro8l:
        "actual_live_execution_final_execution_request_scope_mismatch",
    },
  }
);

const failFinalExecutionApprovalNotPreparedFixture = fixture(
  "failFinalExecutionApprovalNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalPrepared: false,
    },
  }
);

const failFinalExecutionApprovalNotIssuedFixture = fixture(
  "failFinalExecutionApprovalNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalIssued: false,
    },
  }
);

const failFinalExecutionApprovalNotPassedFixture = fixture(
  "failFinalExecutionApprovalNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalPassed: false,
    },
  }
);

const failFinalExecutionApprovalNotRecordedFixture = fixture(
  "failFinalExecutionApprovalNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalRecorded: false,
    },
  }
);

const failFinalExecutionApprovalStatusMismatchFixture = fixture(
  "failFinalExecutionApprovalStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalStatus: "approved_for_actual_final_execution_now",
    },
  }
);

const failFinalExecutionApprovalScopeMismatchFixture = fixture(
  "failFinalExecutionApprovalScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualLiveExecutionFinalExecutionApprovalScope:
        "actual_live_execution_final_execution_approval_scope_mismatch",
    },
  }
);

const failFinalExecutionApprovalApprovesRuntimeExecutionFixture = fixture(
  "failFinalExecutionApprovalApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failFinalExecutionApprovalActivatesRuntimeFixture = fixture(
  "failFinalExecutionApprovalActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failFinalExecutionApprovalEnablesRuntimeFixture = fixture(
  "failFinalExecutionApprovalEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failFinalExecutionApprovalExecutesLiveCallFixture = fixture(
  "failFinalExecutionApprovalExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
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
  actualLiveExecutionFinalExecutionApprovalEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalDecisionMissingFixture = fixture(
  "failSeparateActualExecutionFinalDecisionMissingFixture",
  {
    actualLiveExecutionFinalExecutionApprovalEvidence: {
      separateActualExecutionFinalDecisionRequired: false,
    },
  }
);

function buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture,
    failOro8lDependencyMissingFixture,
    failOro8lFinalExecutionRequestNotSubmittedFixture,
    failOro8lFinalExecutionRequestBoundaryNotPassedFixture,
    failOro8lFinalExecutionRequestNotRecordedFixture,
    failOro8lFinalExecutionRequestStatusMismatchFixture,
    failOro8lFinalExecutionRequestScopeMismatchFixture,
    failFinalExecutionApprovalNotPreparedFixture,
    failFinalExecutionApprovalNotIssuedFixture,
    failFinalExecutionApprovalNotPassedFixture,
    failFinalExecutionApprovalNotRecordedFixture,
    failFinalExecutionApprovalStatusMismatchFixture,
    failFinalExecutionApprovalScopeMismatchFixture,
    failFinalExecutionApprovalApprovesRuntimeExecutionFixture,
    failFinalExecutionApprovalActivatesRuntimeFixture,
    failFinalExecutionApprovalEnablesRuntimeFixture,
    failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture,
    failFinalExecutionApprovalExecutesLiveCallFixture,
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
    failSeparateActualExecutionFinalDecisionMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionApprovalBoundaryFixture,
  failOro8lDependencyMissingFixture,
  failOro8lFinalExecutionRequestNotSubmittedFixture,
  failOro8lFinalExecutionRequestBoundaryNotPassedFixture,
  failOro8lFinalExecutionRequestNotRecordedFixture,
  failOro8lFinalExecutionRequestStatusMismatchFixture,
  failOro8lFinalExecutionRequestScopeMismatchFixture,
  failFinalExecutionApprovalNotPreparedFixture,
  failFinalExecutionApprovalNotIssuedFixture,
  failFinalExecutionApprovalNotPassedFixture,
  failFinalExecutionApprovalNotRecordedFixture,
  failFinalExecutionApprovalStatusMismatchFixture,
  failFinalExecutionApprovalScopeMismatchFixture,
  failFinalExecutionApprovalApprovesRuntimeExecutionFixture,
  failFinalExecutionApprovalActivatesRuntimeFixture,
  failFinalExecutionApprovalEnablesRuntimeFixture,
  failFinalExecutionApprovalAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionApprovalExecutesLiveCallFixture,
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
  failSeparateActualExecutionFinalDecisionMissingFixture,
  cloneFixture,
  buildOro8mLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionApprovalBoundaryFixtures,
};
