"use strict";

const {
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary,
} = require("./oro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture"
);

const failOro8qDependencyMissingFixture = fixture("failOro8qDependencyMissingFixture", {
  oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
    dependsOnOro8qActualLiveExecutionFinalExecutionCloseoutBoundary: false,
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed: false,
    actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q: false,
    actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q: false,
    actualLiveExecutionFinalExecutionCloseoutPassedFromOro8q: false,
    actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q: false,
  },
});

const failOro8qCloseoutNotPreparedFixture = fixture(
  "failOro8qCloseoutNotPreparedFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCloseoutPreparedFromOro8q: false,
    },
  }
);

const failOro8qCloseoutNotIssuedFixture = fixture(
  "failOro8qCloseoutNotIssuedFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCloseoutIssuedFromOro8q: false,
    },
  }
);

const failOro8qCloseoutBoundaryNotPassedFixture = fixture(
  "failOro8qCloseoutBoundaryNotPassedFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryPassed: false,
    },
  }
);

const failOro8qCloseoutNotRecordedFixture = fixture(
  "failOro8qCloseoutNotRecordedFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCloseoutRecordedFromOro8q: false,
    },
  }
);

const failOro8qCloseoutStatusMismatchFixture = fixture(
  "failOro8qCloseoutStatusMismatchFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCloseoutStatusFromOro8q:
        "closed_for_actual_live_execution_archive_now",
    },
  }
);

const failOro8qCloseoutScopeMismatchFixture = fixture(
  "failOro8qCloseoutScopeMismatchFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCloseoutScopeFromOro8q:
        "actual_live_execution_final_execution_closeout_scope_mismatch",
    },
  }
);

const failOro8qCannotProveNoActualLiveExecutionOccurredFixture = fixture(
  "failOro8qCannotProveNoActualLiveExecutionOccurredFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  }
);

const failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture = fixture(
  "failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      verifiedOro8qConfirmedOro8oWasMockExecutionBoundaryOnly: false,
    },
  }
);

const failOro8qNotCloseoutBoundaryOnlyFixture = fixture(
  "failOro8qNotCloseoutBoundaryOnlyFixture",
  {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      verifiedOro8qWasCloseoutBoundaryOnly: false,
    },
  }
);

const failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture =
  fixture("failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture", {
    oro8qActualLiveExecutionFinalExecutionCloseoutBoundaryEvidence: {
      verifiedOro8qConfirmedOro8pWasPostExecutionVerificationBoundaryOnly: false,
    },
  });

const failArchiveApprovesRuntimeExecutionFixture = fixture(
  "failArchiveApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failArchiveActivatesRuntimeFixture = fixture(
  "failArchiveActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failArchiveEnablesRuntimeFixture = fixture("failArchiveEnablesRuntimeFixture", {
  actualLiveExecutionFinalExecutionArchiveEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
    actualExternalCallExecutionEnabled: true,
  },
});

const failArchiveAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failArchiveAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failArchiveExecutesLiveCallFixture = fixture(
  "failArchiveExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failArchiveMarksActualLiveFinalExecutionExecutedFixture = fixture(
  "failArchiveMarksActualLiveFinalExecutionExecutedFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualLiveExecutionFinalExecutionExecuted: true,
    },
  }
);

const failArchiveMarksActualLiveFinalExecutionClosedFixture = fixture(
  "failArchiveMarksActualLiveFinalExecutionClosedFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualLiveExecutionFinalExecutionClosed: true,
    },
  }
);

const failArchiveMarksActualLiveFinalExecutionArchivedFixture = fixture(
  "failArchiveMarksActualLiveFinalExecutionArchivedFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      actualLiveExecutionFinalExecutionArchived: true,
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
    actualLiveExecutionFinalExecutionArchiveEvidence: {
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

const failAuditBoundaryMissingFixture = fixture("failAuditBoundaryMissingFixture", {
  actualLiveExecutionFinalExecutionArchiveEvidence: {
    nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionAuditBoundary: false,
  },
});

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionArchiveEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionAuditMissingFixture = fixture(
  "failSeparateActualExecutionFinalExecutionAuditMissingFixture",
  {
    actualLiveExecutionFinalExecutionArchiveEvidence: {
      separateActualExecutionFinalExecutionAuditRequired: false,
    },
  }
);

function buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture,
    failOro8qDependencyMissingFixture,
    failOro8qCloseoutNotPreparedFixture,
    failOro8qCloseoutNotIssuedFixture,
    failOro8qCloseoutBoundaryNotPassedFixture,
    failOro8qCloseoutNotRecordedFixture,
    failOro8qCloseoutStatusMismatchFixture,
    failOro8qCloseoutScopeMismatchFixture,
    failOro8qCannotProveNoActualLiveExecutionOccurredFixture,
    failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
    failOro8qNotCloseoutBoundaryOnlyFixture,
    failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
    failArchiveApprovesRuntimeExecutionFixture,
    failArchiveActivatesRuntimeFixture,
    failArchiveEnablesRuntimeFixture,
    failArchiveAuthorizesRuntimeExternalExecutionFixture,
    failArchiveExecutesLiveCallFixture,
    failArchiveMarksActualLiveFinalExecutionExecutedFixture,
    failArchiveMarksActualLiveFinalExecutionClosedFixture,
    failArchiveMarksActualLiveFinalExecutionArchivedFixture,
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
    failAuditBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionAuditMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionArchiveBoundaryFixture,
  failOro8qDependencyMissingFixture,
  failOro8qCloseoutNotPreparedFixture,
  failOro8qCloseoutNotIssuedFixture,
  failOro8qCloseoutBoundaryNotPassedFixture,
  failOro8qCloseoutNotRecordedFixture,
  failOro8qCloseoutStatusMismatchFixture,
  failOro8qCloseoutScopeMismatchFixture,
  failOro8qCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8qCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8qNotCloseoutBoundaryOnlyFixture,
  failOro8qCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failArchiveApprovesRuntimeExecutionFixture,
  failArchiveActivatesRuntimeFixture,
  failArchiveEnablesRuntimeFixture,
  failArchiveAuthorizesRuntimeExternalExecutionFixture,
  failArchiveExecutesLiveCallFixture,
  failArchiveMarksActualLiveFinalExecutionExecutedFixture,
  failArchiveMarksActualLiveFinalExecutionClosedFixture,
  failArchiveMarksActualLiveFinalExecutionArchivedFixture,
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
  failAuditBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionAuditMissingFixture,
  cloneFixture,
  buildOro8rLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionArchiveBoundaryFixtures,
};
