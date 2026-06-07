"use strict";

const {
  buildOro6zFinalExecutionRequestInput,
} = require("./oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6zFinalExecutionRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture");

const failMissingOro6yFinalReadinessGateFixture = fixture(
  "failMissingOro6yFinalReadinessGateFixture",
  {
    oro6yFinalReadinessGateEvidence: {
      dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate:
        false,
    },
  }
);

const failOro6yFinalReadinessGateNotPassedFixture = fixture(
  "failOro6yFinalReadinessGateNotPassedFixture",
  {
    oro6yFinalReadinessGateEvidence: {
      oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed:
        false,
      actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y:
        false,
    },
  }
);

const failOro6yFinalReadinessGateStatusNotReadyFixture = fixture(
  "failOro6yFinalReadinessGateStatusNotReadyFixture",
  {
    oro6yFinalReadinessGateEvidence: {
      actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y:
        "hold_for_final_execution_request",
    },
  }
);

const failFinalExecutionRequestWithoutHumanApprovalRequirementFixture = fixture(
  "failFinalExecutionRequestWithoutHumanApprovalRequirementFixture",
  {
    finalExecutionRequestEvidence: {
      humanApprovalRequiredForActualExecution: false,
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failFinalExecutionDecisionAlreadyIssuedFixture = fixture(
  "failFinalExecutionDecisionAlreadyIssuedFixture",
  {
    finalExecutionRequestEvidence: {
      actualExternalCallExecutionFinalExecutionDecisionIssued: true,
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    finalExecutionRequestEvidence: {
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

function buildOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture,
    failMissingOro6yFinalReadinessGateFixture,
    failOro6yFinalReadinessGateNotPassedFixture,
    failOro6yFinalReadinessGateStatusNotReadyFixture,
    failFinalExecutionRequestWithoutHumanApprovalRequirementFixture,
    failFinalExecutionDecisionAlreadyIssuedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture,
  failMissingOro6yFinalReadinessGateFixture,
  failOro6yFinalReadinessGateNotPassedFixture,
  failOro6yFinalReadinessGateStatusNotReadyFixture,
  failFinalExecutionRequestWithoutHumanApprovalRequirementFixture,
  failFinalExecutionDecisionAlreadyIssuedFixture,
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
  buildOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixtures,
};
