"use strict";

const {
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary,
} = require("./oro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture"
);

const failOro8rDependencyMissingFixture = fixture("failOro8rDependencyMissingFixture", {
  oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
    dependsOnOro8rActualLiveExecutionFinalExecutionArchiveBoundary: false,
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed: false,
    actualLiveExecutionFinalExecutionArchivePreparedFromOro8r: false,
    actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r: false,
    actualLiveExecutionFinalExecutionArchivePassedFromOro8r: false,
    actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r: false,
  },
});

const failOro8rArchiveNotPreparedFixture = fixture(
  "failOro8rArchiveNotPreparedFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      actualLiveExecutionFinalExecutionArchivePreparedFromOro8r: false,
    },
  }
);

const failOro8rArchiveNotIssuedFixture = fixture(
  "failOro8rArchiveNotIssuedFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      actualLiveExecutionFinalExecutionArchiveIssuedFromOro8r: false,
    },
  }
);

const failOro8rArchiveBoundaryNotPassedFixture = fixture(
  "failOro8rArchiveBoundaryNotPassedFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      oro8rActualLiveExecutionFinalExecutionArchiveBoundaryPassed: false,
    },
  }
);

const failOro8rArchiveNotRecordedFixture = fixture(
  "failOro8rArchiveNotRecordedFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      actualLiveExecutionFinalExecutionArchiveRecordedFromOro8r: false,
    },
  }
);

const failOro8rArchiveStatusMismatchFixture = fixture(
  "failOro8rArchiveStatusMismatchFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      actualLiveExecutionFinalExecutionArchiveStatusFromOro8r:
        "archived_for_actual_live_execution_audit_now",
    },
  }
);

const failOro8rArchiveScopeMismatchFixture = fixture(
  "failOro8rArchiveScopeMismatchFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      actualLiveExecutionFinalExecutionArchiveScopeFromOro8r:
        "actual_live_execution_final_execution_archive_scope_mismatch",
    },
  }
);

const failOro8rCannotProveNoActualLiveExecutionOccurredFixture = fixture(
  "failOro8rCannotProveNoActualLiveExecutionOccurredFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  }
);

const failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture = fixture(
  "failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      verifiedOro8rConfirmedOro8oWasMockExecutionBoundaryOnly: false,
    },
  }
);

const failOro8rNotArchiveBoundaryOnlyFixture = fixture(
  "failOro8rNotArchiveBoundaryOnlyFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      verifiedOro8rWasArchiveBoundaryOnly: false,
    },
  }
);

const failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture = fixture(
  "failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture",
  {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      verifiedOro8rConfirmedOro8qWasCloseoutBoundaryOnly: false,
    },
  }
);

const failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture =
  fixture("failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture", {
    oro8rActualLiveExecutionFinalExecutionArchiveBoundaryEvidence: {
      verifiedOro8rConfirmedOro8pWasPostExecutionVerificationBoundaryOnly: false,
    },
  });

const failAuditNotPreparedFixture = fixture("failAuditNotPreparedFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditPrepared: false,
  },
});

const failAuditNotIssuedFixture = fixture("failAuditNotIssuedFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditIssued: false,
  },
});

const failAuditNotPassedFixture = fixture("failAuditNotPassedFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditPassed: false,
  },
});

const failAuditNotRecordedFixture = fixture("failAuditNotRecordedFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditRecorded: false,
  },
});

const failAuditStatusMismatchFixture = fixture("failAuditStatusMismatchFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditStatus:
      "audited_for_actual_live_execution_completion_now",
  },
});

const failAuditScopeMismatchFixture = fixture("failAuditScopeMismatchFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualLiveExecutionFinalExecutionAuditScope:
      "actual_live_execution_final_execution_audit_scope_mismatch",
  },
});

const failAuditApprovesRuntimeExecutionFixture = fixture(
  "failAuditApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failAuditActivatesRuntimeFixture = fixture("failAuditActivatesRuntimeFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualExternalCallExecutionActivated: true,
  },
});

const failAuditEnablesRuntimeFixture = fixture("failAuditEnablesRuntimeFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
    actualExternalCallExecutionEnabled: true,
  },
});

const failAuditAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failAuditAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failAuditExecutesLiveCallFixture = fixture("failAuditExecutesLiveCallFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    actualExternalCallExecutionLiveExecuted: true,
    actualLiveExecutionExecuted: true,
  },
});

const failAuditMarksActualLiveFinalExecutionExecutedFixture = fixture(
  "failAuditMarksActualLiveFinalExecutionExecutedFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualLiveExecutionFinalExecutionExecuted: true,
    },
  }
);

const failAuditMarksActualLiveFinalExecutionClosedFixture = fixture(
  "failAuditMarksActualLiveFinalExecutionClosedFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualLiveExecutionFinalExecutionClosed: true,
    },
  }
);

const failAuditMarksActualLiveFinalExecutionArchivedFixture = fixture(
  "failAuditMarksActualLiveFinalExecutionArchivedFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualLiveExecutionFinalExecutionArchived: true,
    },
  }
);

const failAuditMarksActualLiveFinalExecutionAuditedFixture = fixture(
  "failAuditMarksActualLiveFinalExecutionAuditedFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      actualLiveExecutionFinalExecutionAudited: true,
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
    actualLiveExecutionFinalExecutionAuditEvidence: {
      verifiedNoExternalNetworkOccurred: false,
      verifiedNoWalletMutationOccurred: false,
    },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    verifiedNoRuntimeActivationOccurred: false,
  },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      verifiedNoRouteEnablementOccurred: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

const failCompletionRecordBoundaryMissingFixture = fixture(
  "failCompletionRecordBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordBoundary:
        false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionAuditEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture =
  fixture("failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture", {
    actualLiveExecutionFinalExecutionAuditEvidence: {
      separateActualExecutionFinalExecutionCompletionRecordRequired: false,
    },
  });

function buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture,
    failOro8rDependencyMissingFixture,
    failOro8rArchiveNotPreparedFixture,
    failOro8rArchiveNotIssuedFixture,
    failOro8rArchiveBoundaryNotPassedFixture,
    failOro8rArchiveNotRecordedFixture,
    failOro8rArchiveStatusMismatchFixture,
    failOro8rArchiveScopeMismatchFixture,
    failOro8rCannotProveNoActualLiveExecutionOccurredFixture,
    failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
    failOro8rNotArchiveBoundaryOnlyFixture,
    failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
    failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
    failAuditNotPreparedFixture,
    failAuditNotIssuedFixture,
    failAuditNotPassedFixture,
    failAuditNotRecordedFixture,
    failAuditStatusMismatchFixture,
    failAuditScopeMismatchFixture,
    failAuditApprovesRuntimeExecutionFixture,
    failAuditActivatesRuntimeFixture,
    failAuditEnablesRuntimeFixture,
    failAuditAuthorizesRuntimeExternalExecutionFixture,
    failAuditExecutesLiveCallFixture,
    failAuditMarksActualLiveFinalExecutionExecutedFixture,
    failAuditMarksActualLiveFinalExecutionClosedFixture,
    failAuditMarksActualLiveFinalExecutionArchivedFixture,
    failAuditMarksActualLiveFinalExecutionAuditedFixture,
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
    failCannotProveNoRuntimeFixture,
    failCannotProveNoRouteOrAliasFixture,
    failSensitiveOutputFixture,
    failCompletionRecordBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionAuditBoundaryFixture,
  failOro8rDependencyMissingFixture,
  failOro8rArchiveNotPreparedFixture,
  failOro8rArchiveNotIssuedFixture,
  failOro8rArchiveBoundaryNotPassedFixture,
  failOro8rArchiveNotRecordedFixture,
  failOro8rArchiveStatusMismatchFixture,
  failOro8rArchiveScopeMismatchFixture,
  failOro8rCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8rCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8rNotArchiveBoundaryOnlyFixture,
  failOro8rCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8rCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failAuditNotPreparedFixture,
  failAuditNotIssuedFixture,
  failAuditNotPassedFixture,
  failAuditNotRecordedFixture,
  failAuditStatusMismatchFixture,
  failAuditScopeMismatchFixture,
  failAuditApprovesRuntimeExecutionFixture,
  failAuditActivatesRuntimeFixture,
  failAuditEnablesRuntimeFixture,
  failAuditAuthorizesRuntimeExternalExecutionFixture,
  failAuditExecutesLiveCallFixture,
  failAuditMarksActualLiveFinalExecutionExecutedFixture,
  failAuditMarksActualLiveFinalExecutionClosedFixture,
  failAuditMarksActualLiveFinalExecutionArchivedFixture,
  failAuditMarksActualLiveFinalExecutionAuditedFixture,
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
  failCannotProveNoRuntimeFixture,
  failCannotProveNoRouteOrAliasFixture,
  failSensitiveOutputFixture,
  failCompletionRecordBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordMissingFixture,
  cloneFixture,
  buildOro8sLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionAuditBoundaryFixtures,
};
