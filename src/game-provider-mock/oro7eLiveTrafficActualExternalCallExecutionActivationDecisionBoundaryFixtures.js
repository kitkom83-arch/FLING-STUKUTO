"use strict";

const {
  buildOro7eActivationDecisionInput,
} = require("./oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7eActivationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture");

const failMissingOro7dActivationRequestFixture = fixture(
  "failMissingOro7dActivationRequestFixture",
  {
    oro7dActivationRequestEvidence: {
      dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
        false,
    },
  }
);

const failOro7dActivationRequestNotSubmittedFixture = fixture(
  "failOro7dActivationRequestNotSubmittedFixture",
  {
    oro7dActivationRequestEvidence: {
      actualExternalCallExecutionActivationRequestSubmittedFromOro7d: false,
    },
  }
);

const failOro7dActivationRequestStatusNotPendingDecisionFixture = fixture(
  "failOro7dActivationRequestStatusNotPendingDecisionFixture",
  {
    oro7dActivationRequestEvidence: {
      actualExternalCallExecutionActivationRequestStatusFromOro7d:
        "held_for_activation_decision_review",
    },
  }
);

const failActivationDecisionNotIssuedFixture = fixture(
  "failActivationDecisionNotIssuedFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionIssued: false,
    },
  }
);

const failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture =
  fixture(
    "failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture",
    {
      activationDecisionEvidence: {
        actualExternalCallExecutionActivationDecisionStatus:
          "approved_for_activation_review_only",
      },
    }
  );

const failActivationDecisionApprovesActualExecutionFixture = fixture(
  "failActivationDecisionApprovesActualExecutionFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionStatus:
        "approved_for_actual_external_call_execution",
    },
  }
);

const failRuntimeEnablementRequestSubmittedInSamePhaseFixture = fixture(
  "failRuntimeEnablementRequestSubmittedInSamePhaseFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failActualExecutionActivatedFixture = fixture(
  "failActualExecutionActivatedFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  activationDecisionEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failExternalNetworkAllowedFixture = fixture(
  "failExternalNetworkAllowedFixture",
  {
    safetyEvidence: {
      externalNetworkAllowed: true,
    },
  }
);

const failLiveOroPlayApiCallAllowedFixture = fixture(
  "failLiveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const failWalletMutationAllowedFixture = fixture(
  "failWalletMutationAllowedFixture",
  {
    safetyEvidence: {
      [["wallet", "MutationAllowed"].join("")]: true,
    },
  }
);

const failLedgerMutationAllowedFixture = fixture(
  "failLedgerMutationAllowedFixture",
  {
    safetyEvidence: {
      [["ledger", "MutationAllowed"].join("")]: true,
    },
  }
);

const failPrismaWriteAllowedFixture = fixture("failPrismaWriteAllowedFixture", {
  safetyEvidence: {
    prismaWriteAllowed: true,
  },
});

const failDbTransactionAllowedFixture = fixture("failDbTransactionAllowedFixture", {
  safetyEvidence: {
    dbTransactionAllowed: true,
  },
});

const failMigrationAllowedFixture = fixture("failMigrationAllowedFixture", {
  safetyEvidence: {
    migrationAllowed: true,
  },
});

const failDeployAllowedFixture = fixture("failDeployAllowedFixture", {
  safetyEvidence: {
    deployAllowed: true,
  },
});

function buildOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture,
    failMissingOro7dActivationRequestFixture,
    failOro7dActivationRequestNotSubmittedFixture,
    failOro7dActivationRequestStatusNotPendingDecisionFixture,
    failActivationDecisionNotIssuedFixture,
    failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture,
    failActivationDecisionApprovesActualExecutionFixture,
    failRuntimeEnablementRequestSubmittedInSamePhaseFixture,
    failActualExecutionApprovedFixture,
    failActualExecutionActivatedFixture,
    failRuntimeEnabledFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failMigrationAllowedFixture,
    failDeployAllowedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture,
  failMissingOro7dActivationRequestFixture,
  failOro7dActivationRequestNotSubmittedFixture,
  failOro7dActivationRequestStatusNotPendingDecisionFixture,
  failActivationDecisionNotIssuedFixture,
  failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture,
  failActivationDecisionApprovesActualExecutionFixture,
  failRuntimeEnablementRequestSubmittedInSamePhaseFixture,
  failActualExecutionApprovedFixture,
  failActualExecutionActivatedFixture,
  failRuntimeEnabledFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failMigrationAllowedFixture,
  failDeployAllowedFixture,
  cloneFixture,
  buildOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures,
};
