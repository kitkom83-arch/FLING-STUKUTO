"use strict";

const {
  buildOro7bAuthorizationRequestInput,
} = require("./oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7bAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture");

const failMissingOro7aFinalExecutionDecisionFixture = fixture(
  "failMissingOro7aFinalExecutionDecisionFixture",
  {
    oro7aFinalExecutionDecisionEvidence: {
      dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary:
        false,
    },
  }
);

const failOro7aFinalExecutionDecisionNotIssuedFixture = fixture(
  "failOro7aFinalExecutionDecisionNotIssuedFixture",
  {
    oro7aFinalExecutionDecisionEvidence: {
      actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a: false,
    },
  }
);

const failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture =
  fixture(
    "failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture",
    {
      oro7aFinalExecutionDecisionEvidence: {
        actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a:
          "approved_for_actual_external_call_execution",
      },
    }
  );

const failAuthorizationRequestNotSubmittedFixture = fixture(
  "failAuthorizationRequestNotSubmittedFixture",
  {
    authorizationRequestEvidence: {
      actualExternalCallExecutionAuthorizationRequestSubmitted: false,
    },
  }
);

const failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture =
  fixture(
    "failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture",
    {
      authorizationRequestEvidence: {
        humanApprovalRequiredForActualExecution: false,
      },
    }
  );

const failAuthorizationDecisionIssuedInSamePhaseFixture = fixture(
  "failAuthorizationDecisionIssuedInSamePhaseFixture",
  {
    authorizationRequestEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssued: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    authorizationRequestEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

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

function buildOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture,
    failMissingOro7aFinalExecutionDecisionFixture,
    failOro7aFinalExecutionDecisionNotIssuedFixture,
    failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture,
    failAuthorizationRequestNotSubmittedFixture,
    failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture,
    failAuthorizationDecisionIssuedInSamePhaseFixture,
    failActualExecutionApprovedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture,
  failMissingOro7aFinalExecutionDecisionFixture,
  failOro7aFinalExecutionDecisionNotIssuedFixture,
  failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture,
  failAuthorizationRequestNotSubmittedFixture,
  failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failAuthorizationDecisionIssuedInSamePhaseFixture,
  failActualExecutionApprovedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failMigrationAllowedFixture,
  failDeployAllowedFixture,
  cloneFixture,
  buildOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures,
};
