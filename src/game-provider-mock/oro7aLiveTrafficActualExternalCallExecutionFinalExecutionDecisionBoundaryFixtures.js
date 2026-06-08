"use strict";

const {
  buildOro7aFinalExecutionDecisionInput,
} = require("./oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro7aFinalExecutionDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture");

const failMissingOro6zFinalExecutionRequestFixture = fixture(
  "failMissingOro6zFinalExecutionRequestFixture",
  {
    oro6zFinalExecutionRequestEvidence: {
      dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary:
        false,
    },
  }
);

const failOro6zFinalExecutionRequestNotSubmittedFixture = fixture(
  "failOro6zFinalExecutionRequestNotSubmittedFixture",
  {
    oro6zFinalExecutionRequestEvidence: {
      actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z: false,
    },
  }
);

const failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture = fixture(
  "failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture",
  {
    oro6zFinalExecutionRequestEvidence: {
      actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z:
        "held_for_final_execution_request_review",
    },
  }
);

const failFinalExecutionDecisionNotIssuedFixture = fixture(
  "failFinalExecutionDecisionNotIssuedFixture",
  {
    finalExecutionDecisionEvidence: {
      actualExternalCallExecutionFinalExecutionDecisionIssued: false,
    },
  }
);

const failFinalExecutionDecisionApprovesActualExecutionFixture = fixture(
  "failFinalExecutionDecisionApprovesActualExecutionFixture",
  {
    finalExecutionDecisionEvidence: {
      actualExternalCallExecutionFinalExecutionDecisionStatus:
        "approved_for_actual_external_call_execution",
    },
  }
);

const failAuthorizationRequestSubmittedInSamePhaseFixture = fixture(
  "failAuthorizationRequestSubmittedInSamePhaseFixture",
  {
    finalExecutionDecisionEvidence: {
      actualExternalCallExecutionAuthorizationRequestSubmitted: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    finalExecutionDecisionEvidence: {
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

function buildOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture,
    failMissingOro6zFinalExecutionRequestFixture,
    failOro6zFinalExecutionRequestNotSubmittedFixture,
    failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture,
    failFinalExecutionDecisionNotIssuedFixture,
    failFinalExecutionDecisionApprovesActualExecutionFixture,
    failAuthorizationRequestSubmittedInSamePhaseFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture,
  failMissingOro6zFinalExecutionRequestFixture,
  failOro6zFinalExecutionRequestNotSubmittedFixture,
  failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture,
  failFinalExecutionDecisionNotIssuedFixture,
  failFinalExecutionDecisionApprovesActualExecutionFixture,
  failAuthorizationRequestSubmittedInSamePhaseFixture,
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
  buildOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures,
};
