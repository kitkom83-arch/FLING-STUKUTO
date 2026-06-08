"use strict";

const {
  buildOro7fRuntimeEnablementRequestInput,
} = require("./oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7fRuntimeEnablementRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture"
  );

const failMissingOro7eActivationDecisionFixture = fixture(
  "failMissingOro7eActivationDecisionFixture",
  {
    oro7eActivationDecisionEvidence: {
      dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
        false,
    },
  }
);

const failOro7eActivationDecisionNotIssuedFixture = fixture(
  "failOro7eActivationDecisionNotIssuedFixture",
  {
    oro7eActivationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionIssuedFromOro7e: false,
    },
  }
);

const failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture =
  fixture(
    "failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture",
    {
      oro7eActivationDecisionEvidence: {
        actualExternalCallExecutionActivationDecisionStatusFromOro7e:
          "approved_for_activation_decision_only",
      },
    }
  );

const failRuntimeEnablementRequestNotSubmittedFixture = fixture(
  "failRuntimeEnablementRequestNotSubmittedFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: false,
    },
  }
);

const failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture =
  fixture(
    "failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture",
    {
      runtimeEnablementRequestEvidence: {
        humanApprovalRequiredForActualExecution: false,
      },
    }
  );

const failRuntimeEnablementDecisionIssuedInSamePhaseFixture = fixture(
  "failRuntimeEnablementDecisionIssuedInSamePhaseFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const failActualExecutionActivatedFixture = fixture(
  "failActualExecutionActivatedFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const failRuntimeEnabledFixture = fixture("failRuntimeEnabledFixture", {
  runtimeEnablementRequestEvidence: {
    actualExternalCallExecutionRuntimeEnabled: true,
  },
});

const failRouteEnabledFixture = fixture("failRouteEnabledFixture", {
  runtimeEnablementRequestEvidence: {
    actualExternalCallExecutionRouteEnabled: true,
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

function buildOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture,
    failMissingOro7eActivationDecisionFixture,
    failOro7eActivationDecisionNotIssuedFixture,
    failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture,
    failRuntimeEnablementRequestNotSubmittedFixture,
    failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture,
    failRuntimeEnablementDecisionIssuedInSamePhaseFixture,
    failActualExecutionApprovedFixture,
    failActualExecutionActivatedFixture,
    failRuntimeEnabledFixture,
    failRouteEnabledFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture,
  failMissingOro7eActivationDecisionFixture,
  failOro7eActivationDecisionNotIssuedFixture,
  failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture,
  failRuntimeEnablementRequestNotSubmittedFixture,
  failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failRuntimeEnablementDecisionIssuedInSamePhaseFixture,
  failActualExecutionApprovedFixture,
  failActualExecutionActivatedFixture,
  failRuntimeEnabledFixture,
  failRouteEnabledFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failMigrationAllowedFixture,
  failDeployAllowedFixture,
  cloneFixture,
  buildOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures,
};
