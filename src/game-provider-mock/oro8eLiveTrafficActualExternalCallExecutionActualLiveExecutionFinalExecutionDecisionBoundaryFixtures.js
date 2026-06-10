"use strict";

const {
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary,
} = require("./oro8eLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8eActualLiveExecutionFinalExecutionDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture"
);

const failMissingOro8dRequestFixture = fixture("failMissingOro8dRequestFixture", {
  oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
    dependsOnOro8dActualLiveExecutionFinalExecutionRequestBoundary: false,
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryPassed: false,
  },
});

const failOro8dRequestStatusMismatchFixture = fixture(
  "failOro8dRequestStatusMismatchFixture",
  {
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestStatusFromOro8d: "submitted_to_execute_now",
    },
  }
);

const failOro8dRequestScopeMismatchFixture = fixture(
  "failOro8dRequestScopeMismatchFixture",
  {
    oro8dActualLiveExecutionFinalExecutionRequestBoundaryEvidence: {
      actualLiveExecutionFinalExecutionRequestScopeFromOro8d:
        "actual_live_execution_final_execution_request_scope_mismatch",
    },
  }
);

const failActualLiveExecutionRequestAlreadySubmittedFixture = fixture(
  "failActualLiveExecutionRequestAlreadySubmittedFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualLiveExecutionRequestSubmitted: true,
    },
  }
);

const failActualLiveExecutionAlreadyApprovedFixture = fixture(
  "failActualLiveExecutionAlreadyApprovedFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualLiveExecutionRequestApproved: true,
    },
  }
);

const failActualLiveExecutionAlreadyExecutedFixture = fixture(
  "failActualLiveExecutionAlreadyExecutedFixture",
  {
    actualLiveExecutionFinalExecutionDecisionEvidence: {
      actualLiveExecutionExecuted: true,
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

function buildOro8eActualLiveExecutionFinalExecutionDecisionBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
    failMissingOro8dRequestFixture,
    failOro8dRequestStatusMismatchFixture,
    failOro8dRequestScopeMismatchFixture,
    failActualLiveExecutionRequestAlreadySubmittedFixture,
    failActualLiveExecutionAlreadyApprovedFixture,
    failActualLiveExecutionAlreadyExecutedFixture,
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
  happyPathActualLiveExecutionFinalExecutionDecisionBoundaryFixture,
  failMissingOro8dRequestFixture,
  failOro8dRequestStatusMismatchFixture,
  failOro8dRequestScopeMismatchFixture,
  failActualLiveExecutionRequestAlreadySubmittedFixture,
  failActualLiveExecutionAlreadyApprovedFixture,
  failActualLiveExecutionAlreadyExecutedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failRouteEnablementExpressMountPublicAliasFixture,
  failSecretLeakFixture,
  cloneFixture,
  buildOro8eActualLiveExecutionFinalExecutionDecisionBoundaryFixtures,
};
