"use strict";

const {
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary,
} = require("./oro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture"
);

const failOro8pDependencyMissingFixture = fixture("failOro8pDependencyMissingFixture", {
  oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
    dependsOnOro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundary:
      false,
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed:
      false,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p:
      false,
    actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p:
      false,
    actualLiveExecutionFinalExecutionPostExecutionVerificationPassedFromOro8p:
      false,
    actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p:
      false,
  },
});

const failOro8pPostExecutionVerificationNotPreparedFixture = fixture(
  "failOro8pPostExecutionVerificationNotPreparedFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      actualLiveExecutionFinalExecutionPostExecutionVerificationPreparedFromOro8p:
        false,
    },
  }
);

const failOro8pPostExecutionVerificationNotIssuedFixture = fixture(
  "failOro8pPostExecutionVerificationNotIssuedFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      actualLiveExecutionFinalExecutionPostExecutionVerificationIssuedFromOro8p:
        false,
    },
  }
);

const failOro8pPostExecutionVerificationBoundaryNotPassedFixture = fixture(
  "failOro8pPostExecutionVerificationBoundaryNotPassedFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryPassed:
        false,
    },
  }
);

const failOro8pPostExecutionVerificationNotRecordedFixture = fixture(
  "failOro8pPostExecutionVerificationNotRecordedFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      actualLiveExecutionFinalExecutionPostExecutionVerificationRecordedFromOro8p:
        false,
    },
  }
);

const failOro8pPostExecutionVerificationStatusMismatchFixture = fixture(
  "failOro8pPostExecutionVerificationStatusMismatchFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      actualLiveExecutionFinalExecutionPostExecutionVerificationStatusFromOro8p:
        "verified_as_actual_live_execution_final_execution_closeout_now",
    },
  }
);

const failOro8pPostExecutionVerificationScopeMismatchFixture = fixture(
  "failOro8pPostExecutionVerificationScopeMismatchFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      actualLiveExecutionFinalExecutionPostExecutionVerificationScopeFromOro8p:
        "actual_live_execution_final_execution_post_execution_verification_scope_mismatch",
    },
  }
);

const failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture = fixture(
  "failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      verifiedOro8pConfirmedOro8oWasMockExecutionBoundaryOnly: false,
    },
  }
);

const failOro8pNotPostExecutionVerificationBoundaryOnlyFixture = fixture(
  "failOro8pNotPostExecutionVerificationBoundaryOnlyFixture",
  {
    oro8pActualLiveExecutionFinalExecutionPostExecutionVerificationBoundaryEvidence: {
      verifiedOro8pWasPostExecutionVerificationBoundaryOnly: false,
    },
  }
);

const failCloseoutApprovesRuntimeExecutionFixture = fixture(
  "failCloseoutApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failCloseoutActivatesRuntimeFixture = fixture(
  "failCloseoutActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failCloseoutEnablesRuntimeFixture = fixture("failCloseoutEnablesRuntimeFixture", {
  actualLiveExecutionFinalExecutionCloseoutEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
    actualExternalCallExecutionEnabled: true,
  },
});

const failCloseoutAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failCloseoutAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failCloseoutExecutesLiveCallFixture = fixture(
  "failCloseoutExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failCloseoutMarksActualLiveFinalExecutionExecutedFixture = fixture(
  "failCloseoutMarksActualLiveFinalExecutionExecutedFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualLiveExecutionFinalExecutionExecuted: true,
    },
  }
);

const failCloseoutMarksActualLiveFinalExecutionClosedFixture = fixture(
  "failCloseoutMarksActualLiveFinalExecutionClosedFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      actualLiveExecutionFinalExecutionClosed: true,
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
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
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

const failArchiveBoundaryMissingFixture = fixture("failArchiveBoundaryMissingFixture", {
  actualLiveExecutionFinalExecutionCloseoutEvidence: {
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionArchiveBoundary:
      false,
  },
});

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCloseoutEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionArchiveMissingFixture = fixture(
  "failSeparateActualExecutionFinalExecutionArchiveMissingFixture",
  {
    actualLiveExecutionFinalExecutionCloseoutEvidence: {
      separateActualExecutionFinalExecutionArchiveRequired: false,
    },
  }
);

function buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture,
    failOro8pDependencyMissingFixture,
    failOro8pPostExecutionVerificationNotPreparedFixture,
    failOro8pPostExecutionVerificationNotIssuedFixture,
    failOro8pPostExecutionVerificationBoundaryNotPassedFixture,
    failOro8pPostExecutionVerificationNotRecordedFixture,
    failOro8pPostExecutionVerificationStatusMismatchFixture,
    failOro8pPostExecutionVerificationScopeMismatchFixture,
    failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
    failOro8pNotPostExecutionVerificationBoundaryOnlyFixture,
    failCloseoutApprovesRuntimeExecutionFixture,
    failCloseoutActivatesRuntimeFixture,
    failCloseoutEnablesRuntimeFixture,
    failCloseoutAuthorizesRuntimeExternalExecutionFixture,
    failCloseoutExecutesLiveCallFixture,
    failCloseoutMarksActualLiveFinalExecutionExecutedFixture,
    failCloseoutMarksActualLiveFinalExecutionClosedFixture,
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
    failArchiveBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionArchiveMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCloseoutBoundaryFixture,
  failOro8pDependencyMissingFixture,
  failOro8pPostExecutionVerificationNotPreparedFixture,
  failOro8pPostExecutionVerificationNotIssuedFixture,
  failOro8pPostExecutionVerificationBoundaryNotPassedFixture,
  failOro8pPostExecutionVerificationNotRecordedFixture,
  failOro8pPostExecutionVerificationStatusMismatchFixture,
  failOro8pPostExecutionVerificationScopeMismatchFixture,
  failOro8pCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8pNotPostExecutionVerificationBoundaryOnlyFixture,
  failCloseoutApprovesRuntimeExecutionFixture,
  failCloseoutActivatesRuntimeFixture,
  failCloseoutEnablesRuntimeFixture,
  failCloseoutAuthorizesRuntimeExternalExecutionFixture,
  failCloseoutExecutesLiveCallFixture,
  failCloseoutMarksActualLiveFinalExecutionExecutedFixture,
  failCloseoutMarksActualLiveFinalExecutionClosedFixture,
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
  failArchiveBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionArchiveMissingFixture,
  cloneFixture,
  buildOro8qLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCloseoutBoundaryFixtures,
};
