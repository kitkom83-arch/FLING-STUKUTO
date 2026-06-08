"use strict";

const {
  buildOro7cAuthorizationDecisionInput,
} = require("./oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7cAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture");

const failMissingOro7bAuthorizationRequestFixture = fixture(
  "failMissingOro7bAuthorizationRequestFixture",
  {
    oro7bAuthorizationRequestEvidence: {
      dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
        false,
    },
  }
);

const failOro7bAuthorizationRequestNotSubmittedFixture = fixture(
  "failOro7bAuthorizationRequestNotSubmittedFixture",
  {
    oro7bAuthorizationRequestEvidence: {
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b: false,
    },
  }
);

const failOro7bAuthorizationRequestStatusNotPendingDecisionFixture = fixture(
  "failOro7bAuthorizationRequestStatusNotPendingDecisionFixture",
  {
    oro7bAuthorizationRequestEvidence: {
      actualExternalCallExecutionAuthorizationRequestStatusFromOro7b:
        "held_for_authorization_request_review",
    },
  }
);

const failAuthorizationDecisionNotIssuedFixture = fixture(
  "failAuthorizationDecisionNotIssuedFixture",
  {
    authorizationDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssued: false,
    },
  }
);

const failAuthorizationDecisionNotApprovedForActivationRequestFixture = fixture(
  "failAuthorizationDecisionNotApprovedForActivationRequestFixture",
  {
    authorizationDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionStatus:
        "approved_for_authorization_review_only",
    },
  }
);

const failAuthorizationDecisionApprovesActualExecutionFixture = fixture(
  "failAuthorizationDecisionApprovesActualExecutionFixture",
  {
    authorizationDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionStatus:
        "approved_for_actual_external_call_execution",
    },
  }
);

const failActivationRequestSubmittedInSamePhaseFixture = fixture(
  "failActivationRequestSubmittedInSamePhaseFixture",
  {
    authorizationDecisionEvidence: {
      actualExternalCallExecutionActivationRequestSubmitted: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    authorizationDecisionEvidence: {
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

function buildOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture,
    failMissingOro7bAuthorizationRequestFixture,
    failOro7bAuthorizationRequestNotSubmittedFixture,
    failOro7bAuthorizationRequestStatusNotPendingDecisionFixture,
    failAuthorizationDecisionNotIssuedFixture,
    failAuthorizationDecisionNotApprovedForActivationRequestFixture,
    failAuthorizationDecisionApprovesActualExecutionFixture,
    failActivationRequestSubmittedInSamePhaseFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture,
  failMissingOro7bAuthorizationRequestFixture,
  failOro7bAuthorizationRequestNotSubmittedFixture,
  failOro7bAuthorizationRequestStatusNotPendingDecisionFixture,
  failAuthorizationDecisionNotIssuedFixture,
  failAuthorizationDecisionNotApprovedForActivationRequestFixture,
  failAuthorizationDecisionApprovesActualExecutionFixture,
  failActivationRequestSubmittedInSamePhaseFixture,
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
  buildOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures,
};
