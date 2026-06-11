"use strict";

const {
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary,
} = require("./oro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture"
);

const failOro8kDependencyMissingFixture = fixture("failOro8kDependencyMissingFixture", {
  oro8kActualLiveExecutionFinalExecutionGateEvidence: {
    dependsOnOro8kActualLiveExecutionFinalExecutionGate: false,
    oro8kActualLiveExecutionFinalExecutionGatePassed: false,
    actualLiveExecutionFinalExecutionGateIssuedFromOro8k: false,
    actualLiveExecutionFinalExecutionGateRecordedFromOro8k: false,
  },
});

const failOro8kFinalExecutionGateNotPassedFixture = fixture(
  "failOro8kFinalExecutionGateNotPassedFixture",
  {
    oro8kActualLiveExecutionFinalExecutionGateEvidence: {
      oro8kActualLiveExecutionFinalExecutionGatePassed: false,
    },
  }
);

const failOro8kFinalExecutionGateNotRecordedFixture = fixture(
  "failOro8kFinalExecutionGateNotRecordedFixture",
  {
    oro8kActualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateRecordedFromOro8k: false,
    },
  }
);

const failOro8kFinalExecutionGateStatusMismatchFixture = fixture(
  "failOro8kFinalExecutionGateStatusMismatchFixture",
  {
    oro8kActualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateStatusFromOro8k:
        "passed_for_actual_live_execution_now",
    },
  }
);

const failOro8kFinalExecutionGateScopeMismatchFixture = fixture(
  "failOro8kFinalExecutionGateScopeMismatchFixture",
  {
    oro8kActualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateScopeFromOro8k:
        "actual_live_execution_final_execution_gate_scope_mismatch",
    },
  }
);

const failFinalExecutionRequestNotPreparedFixture = fixture(
  "failFinalExecutionRequestNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestPrepared: false,
    },
  }
);

const failFinalExecutionRequestNotIssuedFixture = fixture(
  "failFinalExecutionRequestNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestIssued: false,
    },
  }
);

const failFinalExecutionRequestNotSubmittedFixture = fixture(
  "failFinalExecutionRequestNotSubmittedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestSubmitted: false,
    },
  }
);

const failFinalExecutionRequestNotPassedFixture = fixture(
  "failFinalExecutionRequestNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestPassed: false,
    },
  }
);

const failFinalExecutionRequestNotRecordedFixture = fixture(
  "failFinalExecutionRequestNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestRecorded: false,
    },
  }
);

const failFinalExecutionRequestStatusMismatchFixture = fixture(
  "failFinalExecutionRequestStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestStatus:
        "submitted_for_actual_final_execution_now",
    },
  }
);

const failFinalExecutionRequestScopeMismatchFixture = fixture(
  "failFinalExecutionRequestScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestScope:
        "actual_live_execution_final_execution_request_scope_mismatch",
    },
  }
);

const failFinalExecutionRequestApprovesFinalExecutionFixture = fixture(
  "failFinalExecutionRequestApprovesFinalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionApproved: true,
    },
  }
);

const failFinalExecutionRequestApprovesActualExecutionFixture = fixture(
  "failFinalExecutionRequestApprovesActualExecutionFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionApproved: true,
    },
  }
);

const failFinalExecutionRequestApprovesFinalExecutionRequestFixture = fixture(
  "failFinalExecutionRequestApprovesFinalExecutionRequestFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionRequestApproved: true,
    },
  }
);

const failFinalExecutionRequestActivatesRuntimeFixture = fixture(
  "failFinalExecutionRequestActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failFinalExecutionRequestEnablesRuntimeFixture = fixture(
  "failFinalExecutionRequestEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failFinalExecutionRequestExecutesLiveCallFixture = fixture(
  "failFinalExecutionRequestExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
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
  actualLiveExecutionFinalExecutionRequestEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalApprovalMissingFixture = fixture(
  "failSeparateActualExecutionFinalApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      separateActualExecutionFinalApprovalRequired: false,
    },
  }
);

function buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
    failOro8kDependencyMissingFixture,
    failOro8kFinalExecutionGateNotPassedFixture,
    failOro8kFinalExecutionGateNotRecordedFixture,
    failOro8kFinalExecutionGateStatusMismatchFixture,
    failOro8kFinalExecutionGateScopeMismatchFixture,
    failFinalExecutionRequestNotPreparedFixture,
    failFinalExecutionRequestNotIssuedFixture,
    failFinalExecutionRequestNotSubmittedFixture,
    failFinalExecutionRequestNotPassedFixture,
    failFinalExecutionRequestNotRecordedFixture,
    failFinalExecutionRequestStatusMismatchFixture,
    failFinalExecutionRequestScopeMismatchFixture,
    failFinalExecutionRequestApprovesFinalExecutionFixture,
    failFinalExecutionRequestApprovesActualExecutionFixture,
    failFinalExecutionRequestApprovesFinalExecutionRequestFixture,
    failFinalExecutionRequestActivatesRuntimeFixture,
    failFinalExecutionRequestEnablesRuntimeFixture,
    failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture,
    failFinalExecutionRequestExecutesLiveCallFixture,
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
    failSeparateActualExecutionFinalApprovalMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
  failOro8kDependencyMissingFixture,
  failOro8kFinalExecutionGateNotPassedFixture,
  failOro8kFinalExecutionGateNotRecordedFixture,
  failOro8kFinalExecutionGateStatusMismatchFixture,
  failOro8kFinalExecutionGateScopeMismatchFixture,
  failFinalExecutionRequestNotPreparedFixture,
  failFinalExecutionRequestNotIssuedFixture,
  failFinalExecutionRequestNotSubmittedFixture,
  failFinalExecutionRequestNotPassedFixture,
  failFinalExecutionRequestNotRecordedFixture,
  failFinalExecutionRequestStatusMismatchFixture,
  failFinalExecutionRequestScopeMismatchFixture,
  failFinalExecutionRequestApprovesFinalExecutionFixture,
  failFinalExecutionRequestApprovesActualExecutionFixture,
  failFinalExecutionRequestApprovesFinalExecutionRequestFixture,
  failFinalExecutionRequestActivatesRuntimeFixture,
  failFinalExecutionRequestEnablesRuntimeFixture,
  failFinalExecutionRequestAuthorizesRuntimeExternalExecutionFixture,
  failFinalExecutionRequestExecutesLiveCallFixture,
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
  failSeparateActualExecutionFinalApprovalMissingFixture,
  cloneFixture,
  buildOro8lLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundaryFixtures,
};
