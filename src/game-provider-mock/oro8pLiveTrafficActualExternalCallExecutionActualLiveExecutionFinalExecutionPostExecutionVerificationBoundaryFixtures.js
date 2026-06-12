"use strict";

const {
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary,
} = require("./oro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture =
  fixture("happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture");

const failOro8oDependencyMissingFixture = fixture("failOro8oDependencyMissingFixture", {
  oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
    dependsOnOro8oActualLiveExecutionFinalExecutionExecutionBoundary: false,
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryPassed: false,
    actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o: false,
    actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o: false,
    actualLiveExecutionFinalExecutionExecutionPassedFromOro8o: false,
    actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o: false,
  },
});

const failOro8oFinalExecutionExecutionNotPreparedFixture = fixture(
  "failOro8oFinalExecutionExecutionNotPreparedFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionExecutionPreparedFromOro8o: false,
    },
  }
);

const failOro8oFinalExecutionExecutionNotIssuedFixture = fixture(
  "failOro8oFinalExecutionExecutionNotIssuedFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionExecutionIssuedFromOro8o: false,
    },
  }
);

const failOro8oFinalExecutionExecutionBoundaryNotPassedFixture = fixture(
  "failOro8oFinalExecutionExecutionBoundaryNotPassedFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      oro8oActualLiveExecutionFinalExecutionExecutionBoundaryPassed: false,
    },
  }
);

const failOro8oFinalExecutionExecutionNotRecordedFixture = fixture(
  "failOro8oFinalExecutionExecutionNotRecordedFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionExecutionRecordedFromOro8o: false,
    },
  }
);

const failOro8oFinalExecutionExecutionStatusMismatchFixture = fixture(
  "failOro8oFinalExecutionExecutionStatusMismatchFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionExecutionStatusFromOro8o:
        "executed_as_actual_live_final_execution",
    },
  }
);

const failOro8oFinalExecutionExecutionScopeMismatchFixture = fixture(
  "failOro8oFinalExecutionExecutionScopeMismatchFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionExecutionScopeFromOro8o:
        "actual_live_execution_final_execution_execution_scope_mismatch",
    },
  }
);

const failOro8oIndicatesActualLiveExecutionOccurredFixture = fixture(
  "failOro8oIndicatesActualLiveExecutionOccurredFixture",
  {
    oro8oActualLiveExecutionFinalExecutionExecutionBoundaryEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  }
);

const failPostExecutionVerificationApprovesRuntimeExecutionFixture = fixture(
  "failPostExecutionVerificationApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failPostExecutionVerificationActivatesRuntimeFixture = fixture(
  "failPostExecutionVerificationActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failPostExecutionVerificationEnablesRuntimeFixture = fixture(
  "failPostExecutionVerificationEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture =
  fixture("failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture", {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  });

const failPostExecutionVerificationExecutesLiveCallFixture = fixture(
  "failPostExecutionVerificationExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
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

const failCannotProveNoMutationOrExternalNetworkFixture = fixture(
  "failCannotProveNoMutationOrExternalNetworkFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      verifiedNoExternalNetworkOccurred: false,
      verifiedNoWalletMutationOccurred: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

const failCloseoutBoundaryMissingFixture = fixture("failCloseoutBoundaryMissingFixture", {
  actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCloseoutBoundary: false,
  },
});

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionPostExecutionVerificationEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

function buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture,
    failOro8oDependencyMissingFixture,
    failOro8oFinalExecutionExecutionNotPreparedFixture,
    failOro8oFinalExecutionExecutionNotIssuedFixture,
    failOro8oFinalExecutionExecutionBoundaryNotPassedFixture,
    failOro8oFinalExecutionExecutionNotRecordedFixture,
    failOro8oFinalExecutionExecutionStatusMismatchFixture,
    failOro8oFinalExecutionExecutionScopeMismatchFixture,
    failOro8oIndicatesActualLiveExecutionOccurredFixture,
    failPostExecutionVerificationApprovesRuntimeExecutionFixture,
    failPostExecutionVerificationActivatesRuntimeFixture,
    failPostExecutionVerificationEnablesRuntimeFixture,
    failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture,
    failPostExecutionVerificationExecutesLiveCallFixture,
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
    failCannotProveNoMutationOrExternalNetworkFixture,
    failSensitiveOutputFixture,
    failCloseoutBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixture,
  failOro8oDependencyMissingFixture,
  failOro8oFinalExecutionExecutionNotPreparedFixture,
  failOro8oFinalExecutionExecutionNotIssuedFixture,
  failOro8oFinalExecutionExecutionBoundaryNotPassedFixture,
  failOro8oFinalExecutionExecutionNotRecordedFixture,
  failOro8oFinalExecutionExecutionStatusMismatchFixture,
  failOro8oFinalExecutionExecutionScopeMismatchFixture,
  failOro8oIndicatesActualLiveExecutionOccurredFixture,
  failPostExecutionVerificationApprovesRuntimeExecutionFixture,
  failPostExecutionVerificationActivatesRuntimeFixture,
  failPostExecutionVerificationEnablesRuntimeFixture,
  failPostExecutionVerificationAuthorizesRuntimeExternalExecutionFixture,
  failPostExecutionVerificationExecutesLiveCallFixture,
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
  failCannotProveNoMutationOrExternalNetworkFixture,
  failSensitiveOutputFixture,
  failCloseoutBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  cloneFixture,
  buildOro8pLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryFixtures,
};
