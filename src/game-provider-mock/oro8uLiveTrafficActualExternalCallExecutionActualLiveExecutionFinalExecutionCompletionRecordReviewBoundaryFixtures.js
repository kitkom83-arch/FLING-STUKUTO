"use strict";

const {
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary,
} = require("./oro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture =
  fixture("happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture");

const failOro8tDependencyMissingFixture = fixture("failOro8tDependencyMissingFixture", {
  oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
    dependsOnOro8tActualLiveExecutionFinalExecutionCompletionRecordBoundary: false,
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed: false,
    actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t: false,
    actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t: false,
    actualLiveExecutionFinalExecutionCompletionRecordPassedFromOro8t: false,
    actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t: false,
  },
});

const failOro8tCompletionRecordNotPreparedFixture = fixture(
  "failOro8tCompletionRecordNotPreparedFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordPreparedFromOro8t: false,
    },
  }
);

const failOro8tCompletionRecordNotIssuedFixture = fixture(
  "failOro8tCompletionRecordNotIssuedFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordIssuedFromOro8t: false,
    },
  }
);

const failOro8tCompletionRecordBoundaryNotPassedFixture = fixture(
  "failOro8tCompletionRecordBoundaryNotPassedFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryPassed: false,
    },
  }
);

const failOro8tCompletionRecordNotRecordedFixture = fixture(
  "failOro8tCompletionRecordNotRecordedFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordRecordedFromOro8t: false,
    },
  }
);

const failOro8tCompletionRecordStatusMismatchFixture = fixture(
  "failOro8tCompletionRecordStatusMismatchFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordStatusFromOro8t:
        "completion_recorded_for_actual_live_review_now",
    },
  }
);

const failOro8tCompletionRecordScopeMismatchFixture = fixture(
  "failOro8tCompletionRecordScopeMismatchFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordScopeFromOro8t:
        "actual_live_execution_final_execution_completion_record_scope_mismatch",
    },
  }
);

const failOro8tCannotProveNoActualLiveExecutionOccurredFixture = fixture(
  "failOro8tCannotProveNoActualLiveExecutionOccurredFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedNoActualLiveExecutionOccurred: false,
    },
  }
);

const failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture = fixture(
  "failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedOro8tConfirmedOro8oWasMockExecutionBoundaryOnly: false,
    },
  }
);

const failOro8tNotCompletionRecordBoundaryOnlyFixture = fixture(
  "failOro8tNotCompletionRecordBoundaryOnlyFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedOro8tWasCompletionRecordBoundaryOnly: false,
    },
  }
);

const failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture = fixture(
  "failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedOro8tConfirmedOro8sWasAuditBoundaryOnly: false,
    },
  }
);

const failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture = fixture(
  "failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedOro8tConfirmedOro8rWasArchiveBoundaryOnly: false,
    },
  }
);

const failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture = fixture(
  "failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture",
  {
    oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
      verifiedOro8tConfirmedOro8qWasCloseoutBoundaryOnly: false,
    },
  }
);

const failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture =
  fixture(
    "failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture",
    {
      oro8tActualLiveExecutionFinalExecutionCompletionRecordBoundaryEvidence: {
        verifiedOro8tConfirmedOro8pWasPostExecutionVerificationBoundaryOnly: false,
      },
    }
  );

const failCompletionRecordReviewNotPreparedFixture = fixture(
  "failCompletionRecordReviewNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewPrepared: false,
    },
  }
);

const failCompletionRecordReviewNotIssuedFixture = fixture(
  "failCompletionRecordReviewNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewIssued: false,
    },
  }
);

const failCompletionRecordReviewNotPassedFixture = fixture(
  "failCompletionRecordReviewNotPassedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewPassed: false,
    },
  }
);

const failCompletionRecordReviewNotRecordedFixture = fixture(
  "failCompletionRecordReviewNotRecordedFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewRecorded: false,
    },
  }
);

const failCompletionRecordReviewStatusMismatchFixture = fixture(
  "failCompletionRecordReviewStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewStatus:
        "completion_record_reviewed_for_actual_live_review_approval_now",
    },
  }
);

const failCompletionRecordReviewScopeMismatchFixture = fixture(
  "failCompletionRecordReviewScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionCompletionRecordReviewScope:
        "actual_live_execution_final_execution_completion_record_review_scope_mismatch",
    },
  }
);

const failCompletionRecordReviewApprovesRuntimeExecutionFixture = fixture(
  "failCompletionRecordReviewApprovesRuntimeExecutionFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failCompletionRecordReviewActivatesRuntimeFixture = fixture(
  "failCompletionRecordReviewActivatesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failCompletionRecordReviewEnablesRuntimeFixture = fixture(
  "failCompletionRecordReviewEnablesRuntimeFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture =
  fixture("failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualExternalCallExecutionAuthorized: true,
    },
  });

const failCompletionRecordReviewExecutesLiveCallFixture = fixture(
  "failCompletionRecordReviewExecutesLiveCallFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualExternalCallExecutionLiveExecuted: true,
      actualLiveExecutionExecuted: true,
    },
  }
);

const failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture =
  fixture("failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionExecuted: true,
    },
  });

const failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture =
  fixture("failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionClosed: true,
    },
  });

const failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture =
  fixture("failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionArchived: true,
    },
  });

const failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture =
  fixture("failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture", {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      actualLiveExecutionFinalExecutionAudited: true,
    },
  });

const failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture =
  fixture(
    "failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
        actualLiveExecutionFinalExecutionCompletionRecorded: true,
      },
    }
  );

const failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture =
  fixture(
    "failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
        actualLiveExecutionFinalExecutionCompletionRecordReviewed: true,
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
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      verifiedNoExternalNetworkOccurred: false,
      verifiedNoWalletMutationOccurred: false,
    },
  }
);

const failCannotProveNoRuntimeFixture = fixture("failCannotProveNoRuntimeFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
    verifiedNoRuntimeActivationOccurred: false,
  },
});

const failCannotProveNoRouteOrAliasFixture = fixture(
  "failCannotProveNoRouteOrAliasFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      verifiedNoRouteEnablementOccurred: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

const failCompletionRecordReviewApprovalBoundaryMissingFixture = fixture(
  "failCompletionRecordReviewApprovalBoundaryMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalBoundary:
        false,
    },
  }
);

const failHumanApprovalMissingFixture = fixture("failHumanApprovalMissingFixture", {
  actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
    humanApprovalRequiredForActualExecution: false,
  },
});

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture =
  fixture(
    "failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture",
    {
      actualLiveExecutionFinalExecutionCompletionRecordReviewEvidence: {
        separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired:
          false,
      },
    }
  );

function buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture,
    failOro8tDependencyMissingFixture,
    failOro8tCompletionRecordNotPreparedFixture,
    failOro8tCompletionRecordNotIssuedFixture,
    failOro8tCompletionRecordBoundaryNotPassedFixture,
    failOro8tCompletionRecordNotRecordedFixture,
    failOro8tCompletionRecordStatusMismatchFixture,
    failOro8tCompletionRecordScopeMismatchFixture,
    failOro8tCannotProveNoActualLiveExecutionOccurredFixture,
    failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
    failOro8tNotCompletionRecordBoundaryOnlyFixture,
    failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture,
    failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture,
    failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
    failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
    failCompletionRecordReviewNotPreparedFixture,
    failCompletionRecordReviewNotIssuedFixture,
    failCompletionRecordReviewNotPassedFixture,
    failCompletionRecordReviewNotRecordedFixture,
    failCompletionRecordReviewStatusMismatchFixture,
    failCompletionRecordReviewScopeMismatchFixture,
    failCompletionRecordReviewApprovesRuntimeExecutionFixture,
    failCompletionRecordReviewActivatesRuntimeFixture,
    failCompletionRecordReviewEnablesRuntimeFixture,
    failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture,
    failCompletionRecordReviewExecutesLiveCallFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture,
    failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture,
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
    failCompletionRecordReviewApprovalBoundaryMissingFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixture,
  failOro8tDependencyMissingFixture,
  failOro8tCompletionRecordNotPreparedFixture,
  failOro8tCompletionRecordNotIssuedFixture,
  failOro8tCompletionRecordBoundaryNotPassedFixture,
  failOro8tCompletionRecordNotRecordedFixture,
  failOro8tCompletionRecordStatusMismatchFixture,
  failOro8tCompletionRecordScopeMismatchFixture,
  failOro8tCannotProveNoActualLiveExecutionOccurredFixture,
  failOro8tCannotProveOro8oWasMockExecutionBoundaryOnlyFixture,
  failOro8tNotCompletionRecordBoundaryOnlyFixture,
  failOro8tCannotProveOro8sWasAuditBoundaryOnlyFixture,
  failOro8tCannotProveOro8rWasArchiveBoundaryOnlyFixture,
  failOro8tCannotProveOro8qWasCloseoutBoundaryOnlyFixture,
  failOro8tCannotProveOro8pWasPostExecutionVerificationBoundaryOnlyFixture,
  failCompletionRecordReviewNotPreparedFixture,
  failCompletionRecordReviewNotIssuedFixture,
  failCompletionRecordReviewNotPassedFixture,
  failCompletionRecordReviewNotRecordedFixture,
  failCompletionRecordReviewStatusMismatchFixture,
  failCompletionRecordReviewScopeMismatchFixture,
  failCompletionRecordReviewApprovesRuntimeExecutionFixture,
  failCompletionRecordReviewActivatesRuntimeFixture,
  failCompletionRecordReviewEnablesRuntimeFixture,
  failCompletionRecordReviewAuthorizesRuntimeExternalExecutionFixture,
  failCompletionRecordReviewExecutesLiveCallFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionExecutedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionClosedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionArchivedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionAuditedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordedFixture,
  failCompletionRecordReviewMarksActualLiveFinalExecutionCompletionRecordReviewedFixture,
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
  failCompletionRecordReviewApprovalBoundaryMissingFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSeparateActualExecutionFinalExecutionCompletionRecordReviewApprovalMissingFixture,
  cloneFixture,
  buildOro8uLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewBoundaryFixtures,
};
