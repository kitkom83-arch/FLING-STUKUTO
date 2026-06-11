"use strict";

const {
  buildOro8hActualLiveExecutionExecutionGate,
} = require("./oro8hLiveTrafficActualExternalCallExecutionActualLiveExecutionExecutionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8hActualLiveExecutionExecutionGate({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionExecutionGateFixture = fixture(
  "happyPathActualLiveExecutionExecutionGateFixture"
);

const failMissingOro8gDecisionFixture = fixture("failMissingOro8gDecisionFixture", {
  oro8gActualLiveExecutionDecisionBoundaryEvidence: {
    dependsOnOro8gActualLiveExecutionDecisionBoundary: false,
    oro8gActualLiveExecutionDecisionBoundaryPassed: false,
    actualLiveExecutionDecisionIssuedFromOro8g: false,
  },
});

const failOro8gDecisionStatusMismatchFixture = fixture(
  "failOro8gDecisionStatusMismatchFixture",
  {
    oro8gActualLiveExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionDecisionStatusFromOro8g: "approved_to_execute_now",
    },
  }
);

const failOro8gDecisionScopeMismatchFixture = fixture(
  "failOro8gDecisionScopeMismatchFixture",
  {
    oro8gActualLiveExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionDecisionScopeFromOro8g:
        "actual_live_execution_decision_scope_mismatch",
    },
  }
);

const failActualLiveExecutionAlreadyExecutedFixture = fixture(
  "failActualLiveExecutionAlreadyExecutedFixture",
  {
    actualLiveExecutionExecutionGateEvidence: {
      actualLiveExecutionExecuted: true,
    },
  }
);

const failExecutionRequestAlreadySubmittedFixture = fixture(
  "failExecutionRequestAlreadySubmittedFixture",
  {
    actualLiveExecutionExecutionGateEvidence: {
      actualLiveExecutionExecutionRequestSubmitted: true,
    },
  }
);

const failExecutionRequestAlreadyApprovedFixture = fixture(
  "failExecutionRequestAlreadyApprovedFixture",
  {
    actualLiveExecutionExecutionGateEvidence: {
      actualLiveExecutionExecutionRequestApproved: true,
    },
  }
);

const failExternalNetworkAllowedFixture = fixture("failExternalNetworkAllowedFixture", {
  safetyEvidence: {
    externalNetworkAllowed: true,
  },
});

const failLiveOroPlayApiCallAllowedFixture = fixture(
  "failLiveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const failWalletMutationAllowedFixture = fixture("failWalletMutationAllowedFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
  },
});

const failLedgerMutationAllowedFixture = fixture("failLedgerMutationAllowedFixture", {
  safetyEvidence: {
    ledgerMutationAllowed: true,
  },
});

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

const failRouteEnablementExpressMountPublicAliasFixture = fixture(
  "failRouteEnablementExpressMountPublicAliasFixture",
  {
    safetyEvidence: {
      routeEnablementAllowed: true,
      expressMountAllowed: true,
      publicAliasAllowed: true,
    },
  }
);

const failSecretLeakFixture = fixture("failSecretLeakFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro8hActualLiveExecutionExecutionGateFixtures() {
  return [
    happyPathActualLiveExecutionExecutionGateFixture,
    failMissingOro8gDecisionFixture,
    failOro8gDecisionStatusMismatchFixture,
    failOro8gDecisionScopeMismatchFixture,
    failActualLiveExecutionAlreadyExecutedFixture,
    failExecutionRequestAlreadySubmittedFixture,
    failExecutionRequestAlreadyApprovedFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failRouteEnablementExpressMountPublicAliasFixture,
    failSecretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionExecutionGateFixture,
  failMissingOro8gDecisionFixture,
  failOro8gDecisionStatusMismatchFixture,
  failOro8gDecisionScopeMismatchFixture,
  failActualLiveExecutionAlreadyExecutedFixture,
  failExecutionRequestAlreadySubmittedFixture,
  failExecutionRequestAlreadyApprovedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  cloneFixture,
  buildOro8hActualLiveExecutionExecutionGateFixtures,
};
