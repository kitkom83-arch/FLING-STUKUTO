"use strict";

const {
  buildOro8gActualLiveExecutionDecisionBoundary,
} = require("./oro8gLiveTrafficActualExternalCallExecutionActualLiveExecutionDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8gActualLiveExecutionDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionDecisionBoundaryFixture = fixture(
  "happyPathActualLiveExecutionDecisionBoundaryFixture"
);

const failMissingOro8fRequestFixture = fixture("failMissingOro8fRequestFixture", {
  oro8fActualLiveExecutionRequestBoundaryEvidence: {
    dependsOnOro8fActualLiveExecutionRequestBoundary: false,
    oro8fActualLiveExecutionRequestBoundaryPassed: false,
    actualLiveExecutionRequestSubmittedFromOro8f: false,
  },
});

const failOro8fRequestStatusMismatchFixture = fixture(
  "failOro8fRequestStatusMismatchFixture",
  {
    oro8fActualLiveExecutionRequestBoundaryEvidence: {
      actualLiveExecutionRequestStatusFromOro8f: "submitted_to_execute_now",
    },
  }
);

const failOro8fRequestScopeMismatchFixture = fixture(
  "failOro8fRequestScopeMismatchFixture",
  {
    oro8fActualLiveExecutionRequestBoundaryEvidence: {
      actualLiveExecutionRequestScopeFromOro8f:
        "actual_live_execution_request_scope_mismatch",
    },
  }
);

const failActualLiveExecutionAlreadyExecutedFixture = fixture(
  "failActualLiveExecutionAlreadyExecutedFixture",
  {
    actualLiveExecutionDecisionEvidence: {
      actualLiveExecutionExecuted: true,
    },
  }
);

const failActualLiveExecutionExecutionGateAlreadyIssuedFixture = fixture(
  "failActualLiveExecutionExecutionGateAlreadyIssuedFixture",
  {
    actualLiveExecutionDecisionEvidence: {
      actualLiveExecutionExecutionGateIssued: true,
    },
  }
);

const failActualLiveExecutionExecutionGateAlreadyPassedFixture = fixture(
  "failActualLiveExecutionExecutionGateAlreadyPassedFixture",
  {
    actualLiveExecutionDecisionEvidence: {
      actualLiveExecutionExecutionGatePassed: true,
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

function buildOro8gActualLiveExecutionDecisionBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionDecisionBoundaryFixture,
    failMissingOro8fRequestFixture,
    failOro8fRequestStatusMismatchFixture,
    failOro8fRequestScopeMismatchFixture,
    failActualLiveExecutionAlreadyExecutedFixture,
    failActualLiveExecutionExecutionGateAlreadyIssuedFixture,
    failActualLiveExecutionExecutionGateAlreadyPassedFixture,
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
  happyPathActualLiveExecutionDecisionBoundaryFixture,
  failMissingOro8fRequestFixture,
  failOro8fRequestStatusMismatchFixture,
  failOro8fRequestScopeMismatchFixture,
  failActualLiveExecutionAlreadyExecutedFixture,
  failActualLiveExecutionExecutionGateAlreadyIssuedFixture,
  failActualLiveExecutionExecutionGateAlreadyPassedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  cloneFixture,
  buildOro8gActualLiveExecutionDecisionBoundaryFixtures,
};
