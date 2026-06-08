"use strict";

const {
  buildOro7dActivationRequestInput,
} = require("./oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7dActivationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture");

const failMissingOro7cAuthorizationDecisionFixture = fixture(
  "failMissingOro7cAuthorizationDecisionFixture",
  {
    oro7cAuthorizationDecisionEvidence: {
      dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
        false,
    },
  }
);

const failOro7cAuthorizationDecisionNotIssuedFixture = fixture(
  "failOro7cAuthorizationDecisionNotIssuedFixture",
  {
    oro7cAuthorizationDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c: false,
    },
  }
);

const failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture =
  fixture(
    "failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture",
    {
      oro7cAuthorizationDecisionEvidence: {
        actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c:
          "held_for_activation_request_review",
      },
    }
  );

const failActivationRequestNotSubmittedFixture = fixture(
  "failActivationRequestNotSubmittedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionActivationRequestSubmitted: false,
    },
  }
);

const failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture =
  fixture(
    "failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture",
    {
      activationRequestEvidence: {
        humanApprovalRequiredForActualExecution: false,
      },
    }
  );

const failActivationDecisionIssuedInSamePhaseFixture = fixture(
  "failActivationDecisionIssuedInSamePhaseFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionActivationDecisionIssued: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failActualExecutionActivatedFixture = fixture(
  "failActualExecutionActivatedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  activationRequestEvidence: {
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

function buildOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture,
    failMissingOro7cAuthorizationDecisionFixture,
    failOro7cAuthorizationDecisionNotIssuedFixture,
    failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture,
    failActivationRequestNotSubmittedFixture,
    failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture,
    failActivationDecisionIssuedInSamePhaseFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture,
  failMissingOro7cAuthorizationDecisionFixture,
  failOro7cAuthorizationDecisionNotIssuedFixture,
  failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture,
  failActivationRequestNotSubmittedFixture,
  failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failActivationDecisionIssuedInSamePhaseFixture,
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
  buildOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures,
};
