"use strict";

const {
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary,
} = require("./oro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture =
  fixture("happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture");

const failOro8sDependencyMissingFixture = fixture("failOro8sDependencyMissingFixture", {
  oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
    dependsOnOro8sActualLiveExecutionFinalExecutionAuditBoundary: false,
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed: false,
    actualLiveExecutionFinalExecutionAuditPreparedFromOro8s: false,
    actualLiveExecutionFinalExecutionAuditIssuedFromOro8s: false,
    actualLiveExecutionFinalExecutionAuditPassedFromOro8s: false,
    actualLiveExecutionFinalExecutionAuditRecordedFromOro8s: false,
  },
});

const failOro8sAuditNotPreparedFixture = fixture(
  "failOro8sAuditNotPreparedFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      actualLiveExecutionFinalExecutionAuditPreparedFromOro8s: false,
    },
  }
);

const failOro8sAuditNotIssuedFixture = fixture("failOro8sAuditNotIssuedFixture", {
  oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
    actualLiveExecutionFinalExecutionAuditIssuedFromOro8s: false,
  },
});

const failOro8sAuditBoundaryNotPassedFixture = fixture(
  "failOro8sAuditBoundaryNotPassedFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      oro8sActualLiveExecutionFinalExecutionAuditBoundaryPassed: false,
    },
  }
);

const failOro8sAuditNotRecordedFixture = fixture(
  "failOro8sAuditNotRecordedFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      actualLiveExecutionFinalExecutionAuditRecordedFromOro8s: false,
    },
  }
);

const failOro8sAuditStatusMismatchFixture = fixture(
  "failOro8sAuditStatusMismatchFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      actualLiveExecutionFinalExecutionAuditStatusFromOro8s:
        "audited_for_actual_live_completion_record_now",
    },
  }
);

const failOro8sAuditScopeMismatchFixture = fixture(
  "failOro8sAuditScopeMismatchFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      actualLiveExecutionFinalExecutionAuditScopeFromOro8s:
        "actual_live_execution_final_execution_audit_scope_mismatch",
    },
  }
);

const failOro8sCannotProveNoActualLiveExecutionOccurredFixture = fixture(
  "failOro8sCannotProveNoActualLiveExecutionOccurredFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  }
);

const failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture = fixture(
  "failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedOro8sConfirmedOro8oWasMockExecutionBoundaryOnly: false,
    },
  }
);

const failOro8sNotAuditBoundaryOnlyFixture = fixture(
  "failOro8sNotAuditBoundaryOnlyFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedOro8sWasAuditBoundaryOnly: false,
    },
  }
);

const failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture = fixture(
  "failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedOro8sConfirmedOro8rWasArchiveBoundaryOnly: false,
    },
  }
);

const failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture = fixture(
  "failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture",
  {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedOro8sConfirmedOro8qWasCloseoutBoundaryOnly: false,
    },
  }
);

const failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture =
  fixture("failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture", {
    oro8sActualLiveExecutionFinalExecutionAuditBoundaryEvidence: {
      verifiedOro8sConfirmedOro8pWasPostExecutionVerificationBoundaryOnly: false,
    },
  });

const failCompletionRecordNotPreparedFixture = fixture(
  "failCompletionRecordNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordPrepared: false,
    },
  }
);

const failCompletionRecordNotIssuedFixture = fixture(
  "failCompletionRecordNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordIssued: false,
    },
  }
);

const failCompletionRecordNotPassedFixture = fixture(
  "failCompletionRecordNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordPassed: false,
    },
  }
);

const failCompletionRecordNotRecordedFixture = fixture(
  "failCompletionRecordNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordRecorded: false,
    },
  }
);

const failCompletionRecordStatusMismatchFixture = fixture(
  "failCompletionRecordStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordStatus:
        "completion_recorded_for_actual_live_review_now",
    },
  }
);

const failCompletionRecordScopeMismatchFixture = fixture(
  "failCompletionRecordScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordScope:
        "actual_live_execution_final_execution_completion_record_scope_mismatch",
    },
  }
);

const failCompletionRecordApprovesRuntimeExecutionFixture = fixture(
  "failCompletionRecordApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failCompletionRecordActivatesRuntimeFixture = fixture(
  "failCompletionRecordActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failCompletionRecordEnablesRuntimeFixture = fixture(
  "failCompletionRecordEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failCompletionRecordAuthorizesRuntimeExternalExecutionFixture = fixture(
  "failCompletionRecordAuthorizesRuntimeExternalExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  }
);

const failCompletionRecordExecutesLiveCallFixture = fixture(
  "failCompletionRecordExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture = fixture(
  "failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionExecuted: true,
    },
  }
);

const failCompletionRecordMarksActualLiveFinalExecutionClosedFixture = fixture(
  "failCompletionRecordMarksActualLiveFinalExecutionClosedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionClosed: true,
    },
  }
);

const failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture = fixture(
  "failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionArchived: true,
    },
  }
);

const failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture = fixture(
  "failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionAudited: true,
    },
  }
);

const failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture =
  fixture("failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecorded: true,
    },
  });

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
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      verifiedNoExternalNetworkOccurred: false,
      verifiedNoWalletMutationOccurred: false,
    },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
    verifiedNoRuntimeActivationOccurred: false,
  },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      verifiedNoRouteEnablementOccurred: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

const failCompletionRecordReviewBoundaryMissingFixture = fixture(
  "failCompletionRecordReviewBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary:
        false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture =
  fixture("failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordEvidence: {
      separateActualExecutionFinalExecutionCompletionRecordReviewRequired: false,
    },
  });

function buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture,
    failOro8sDependencyMissingFixture,
    failOro8sAuditNotPreparedFixture,
    failOro8sAuditNotIssuedFixture,
    failOro8sAuditBoundaryNotPassedFixture,
    failOro8sAuditNotRecordedFixture,
    failOro8sAuditStatusMismatchFixture,
    failOro8sAuditScopeMismatchFixture,
    failOro8sCannotProveNoActualLiveExecutionOccurredFixture,
    failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
    failOro8sNotAuditBoundaryOnlyFixture,
    failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture,
    failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
    failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
    failCompletionRecordNotPreparedFixture,
    failCompletionRecordNotIssuedFixture,
    failCompletionRecordNotPassedFixture,
    failCompletionRecordNotRecordedFixture,
    failCompletionRecordStatusMismatchFixture,
    failCompletionRecordScopeMismatchFixture,
    failCompletionRecordApprovesRuntimeExecutionFixture,
    failCompletionRecordActivatesRuntimeFixture,
    failCompletionRecordEnablesRuntimeFixture,
    failCompletionRecordAuthorizesRuntimeExternalExecutionFixture,
    failCompletionRecordExecutesLiveCallFixture,
    failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture,
    failCompletionRecordMarksActualLiveFinalExecutionClosedFixture,
    failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture,
    failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture,
    failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture,
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
    failCompletionRecordReviewBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixture,
  failOro8sDependencyMissingFixture,
  failOro8sAuditNotPreparedFixture,
  failOro8sAuditNotIssuedFixture,
  failOro8sAuditBoundaryNotPassedFixture,
  failOro8sAuditNotRecordedFixture,
  failOro8sAuditStatusMismatchFixture,
  failOro8sAuditScopeMismatchFixture,
  failOro8sCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8sCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8sNotAuditBoundaryOnlyFixture,
  failOro8sCannotProveOro8rWasArchiveBoundaryOnlyFixture,
  failOro8sCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8sCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failCompletionRecordNotPreparedFixture,
  failCompletionRecordNotIssuedFixture,
  failCompletionRecordNotPassedFixture,
  failCompletionRecordNotRecordedFixture,
  failCompletionRecordStatusMismatchFixture,
  failCompletionRecordScopeMismatchFixture,
  failCompletionRecordApprovesRuntimeExecutionFixture,
  failCompletionRecordActivatesRuntimeFixture,
  failCompletionRecordEnablesRuntimeFixture,
  failCompletionRecordAuthorizesRuntimeExternalExecutionFixture,
  failCompletionRecordExecutesLiveCallFixture,
  failCompletionRecordMarksActualLiveFinalExecutionExecutedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionClosedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionArchivedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionAuditedFixture,
  failCompletionRecordMarksActualLiveFinalExecutionCompletionRecordedFixture,
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
  failCompletionRecordReviewBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewMissingFixture,
  cloneFixture,
  buildOro8tLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordBoundaryFixtures,
};
