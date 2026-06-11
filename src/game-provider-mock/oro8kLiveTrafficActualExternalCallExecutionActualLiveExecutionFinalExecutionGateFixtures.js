"use strict";

const {
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate,
} = require("./oro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionFinalExecutionGateFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionGateFixture"
);

const failOro8jDependencyMissingFixture = fixture("failOro8jDependencyMissingFixture", {
  oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence: {
    dependsOnOro8jActualLiveExecutionExecutionApprovalBoundary: false,
    oro8jActualLiveExecutionExecutionApprovalBoundaryPassed: false,
    actualLiveExecutionExecutionApprovalIssuedFromOro8j: false,
    actualLiveExecutionExecutionApprovalRecordedFromOro8j: false,
  },
});

const failOro8jApprovalBoundaryNotPassedFixture = fixture(
  "failOro8jApprovalBoundaryNotPassedFixture",
  {
    oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence: {
      oro8jActualLiveExecutionExecutionApprovalBoundaryPassed: false,
    },
  }
);

const failOro8jApprovalNotRecordedFixture = fixture(
  "failOro8jApprovalNotRecordedFixture",
  {
    oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionExecutionApprovalRecordedFromOro8j: false,
    },
  }
);

const failOro8jApprovalStatusMismatchFixture = fixture(
  "failOro8jApprovalStatusMismatchFixture",
  {
    oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionExecutionApprovalStatusFromOro8j:
        "approved_for_actual_live_execution_now",
    },
  }
);

const failOro8jApprovalScopeMismatchFixture = fixture(
  "failOro8jApprovalScopeMismatchFixture",
  {
    oro8jActualLiveExecutionExecutionApprovalBoundaryEvidence: {
      actualLiveExecutionExecutionApprovalScopeFromOro8j:
        "actual_live_execution_execution_approval_scope_mismatch",
    },
  }
);

const failFinalExecutionGateNotPreparedFixture = fixture(
  "failFinalExecutionGateNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGatePrepared: false,
    },
  }
);

const failFinalExecutionGateNotIssuedFixture = fixture(
  "failFinalExecutionGateNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateIssued: false,
    },
  }
);

const failFinalExecutionGateNotPassedFixture = fixture(
  "failFinalExecutionGateNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGatePassed: false,
    },
  }
);

const failFinalExecutionGateNotRecordedFixture = fixture(
  "failFinalExecutionGateNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateRecorded: false,
    },
  }
);

const failFinalExecutionGateStatusMismatchFixture = fixture(
  "failFinalExecutionGateStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateStatus:
        "passed_for_actual_live_execution_now",
    },
  }
);

const failFinalExecutionGateScopeMismatchFixture = fixture(
  "failFinalExecutionGateScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateScope:
        "actual_live_execution_final_execution_gate_scope_mismatch",
    },
  }
);

const failFinalExecutionGateSubmitsFinalExecutionRequestFixture = fixture(
  "failFinalExecutionGateSubmitsFinalExecutionRequestFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionRequestSubmitted: true,
    },
  }
);

const failFinalExecutionGateApprovesActualExecutionFixture = fixture(
  "failFinalExecutionGateApprovesActualExecutionFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionApproved: true,
    },
  }
);

const failFinalExecutionGateActivatesRuntimeFixture = fixture(
  "failFinalExecutionGateActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failFinalExecutionGateEnablesRuntimeFixture = fixture(
  "failFinalExecutionGateEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failFinalExecutionGateExecutesLiveCallFixture = fixture(
  "failFinalExecutionGateExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
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
  actualLiveExecutionFinalExecutionGateEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalRequestMissingFixture = fixture(
  "failSeparateActualExecutionFinalRequestMissingFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      separateActualExecutionFinalRequestRequired: false,
    },
  }
);

function buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionGateFixture,
    failOro8jDependencyMissingFixture,
    failOro8jApprovalBoundaryNotPassedFixture,
    failOro8jApprovalNotRecordedFixture,
    failOro8jApprovalStatusMismatchFixture,
    failOro8jApprovalScopeMismatchFixture,
    failFinalExecutionGateNotPreparedFixture,
    failFinalExecutionGateNotIssuedFixture,
    failFinalExecutionGateNotPassedFixture,
    failFinalExecutionGateNotRecordedFixture,
    failFinalExecutionGateStatusMismatchFixture,
    failFinalExecutionGateScopeMismatchFixture,
    failFinalExecutionGateSubmitsFinalExecutionRequestFixture,
    failFinalExecutionGateApprovesActualExecutionFixture,
    failFinalExecutionGateActivatesRuntimeFixture,
    failFinalExecutionGateEnablesRuntimeFixture,
    failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture,
    failFinalExecutionGateExecutesLiveCallFixture,
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
    failSeparateActualExecutionFinalRequestMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionGateFixture,
  failOro8jDependencyMissingFixture,
  failOro8jApprovalBoundaryNotPassedFixture,
  failOro8jApprovalNotRecordedFixture,
  failOro8jApprovalStatusMismatchFixture,
  failOro8jApprovalScopeMismatchFixture,
  failFinalExecutionGateNotPreparedFixture,
  failFinalExecutionGateNotIssuedFixture,
  failFinalExecutionGateNotPassedFixture,
  failFinalExecutionGateNotRecordedFixture,
  failFinalExecutionGateStatusMismatchFixture,
  failFinalExecutionGateScopeMismatchFixture,
  failFinalExecutionGateSubmitsFinalExecutionRequestFixture,
  failFinalExecutionGateApprovesActualExecutionFixture,
  failFinalExecutionGateActivatesRuntimeFixture,
  failFinalExecutionGateEnablesRuntimeFixture,
  failFinalExecutionGateAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionGateExecutesLiveCallFixture,
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
  failSeparateActualExecutionFinalRequestMissingFixture,
  cloneFixture,
  buildOro8kLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateFixtures,
};
