"use strict";

const {
  buildOro6yLiveExecutionFinalReadinessInput,
} = require("./oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6yLiveExecutionFinalReadinessInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture");

const failMissingOro6xDecisionFixture = fixture("failMissingOro6xDecisionFixture", {
  oro6xLiveExecutionDecisionEvidence: {
    dependsOnOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary:
      false,
    oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryPassed:
      false,
  },
});

const failOro6xDecisionNotReadinessOnlyFixture = fixture(
  "failOro6xDecisionNotReadinessOnlyFixture",
  {
    oro6xLiveExecutionDecisionEvidence: {
      actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6x: "approved",
    },
  }
);

const failActualExecutionApprovedFixture = fixture(
  "failActualExecutionApprovedFixture",
  {
    finalReadinessGateEvidence: {
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

function buildOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture,
    failMissingOro6xDecisionFixture,
    failOro6xDecisionNotReadinessOnlyFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixture,
  failMissingOro6xDecisionFixture,
  failOro6xDecisionNotReadinessOnlyFixture,
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
  buildOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGateFixtures,
};
