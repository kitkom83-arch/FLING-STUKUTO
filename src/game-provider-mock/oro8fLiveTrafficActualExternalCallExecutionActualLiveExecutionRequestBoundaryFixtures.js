"use strict";

const {
  buildOro8fActualLiveExecutionRequestBoundary,
} = require("./oro8fLiveTrafficActualExternalCallExecutionActualLiveExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8fActualLiveExecutionRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionRequestBoundaryFixture = fixture(
  "happyPathActualLiveExecutionRequestBoundaryFixture"
);

const failMissingOro8eDecisionFixture = fixture("failMissingOro8eDecisionFixture", {
  oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
    dependsOnOro8eActualLiveExecutionFinalExecutionDecisionBoundary: true,
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryPassed: false,
    actualLiveExecutionFinalExecutionDecisionIssuedFromOro8e: false,
  },
});

const failOro8eDecisionStatusMismatchFixture = fixture(
  "failOro8eDecisionStatusMismatchFixture",
  {
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionStatusFromOro8e:
        "approved_for_separate_actual_live_execution_request_now",
    },
  }
);

const failOro8eDecisionScopeMismatchFixture = fixture(
  "failOro8eDecisionScopeMismatchFixture",
  {
    oro8eActualLiveExecutionFinalExecutionDecisionBoundaryEvidence: {
      actualLiveExecutionFinalExecutionDecisionScopeFromOro8e:
        "actual_live_execution_final_execution_decision_scope_mismatch",
    },
  }
);

const failActualLiveExecutionDecisionAlreadyIssuedFixture = fixture(
  "failActualLiveExecutionDecisionAlreadyIssuedFixture",
  {
    actualLiveExecutionRequestEvidence: {
      actualLiveExecutionDecisionIssued: true,
    },
  }
);

const failActualLiveExecutionDecisionAlreadyApprovedFixture = fixture(
  "failActualLiveExecutionDecisionAlreadyApprovedFixture",
  {
    actualLiveExecutionRequestEvidence: {
      actualLiveExecutionDecisionApproved: true,
    },
  }
);

const failActualLiveExecutionAlreadyExecutedFixture = fixture(
  "failActualLiveExecutionAlreadyExecutedFixture",
  {
    actualLiveExecutionRequestEvidence: {
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

function buildOro8fActualLiveExecutionRequestBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionRequestBoundaryFixture,
    failMissingOro8eDecisionFixture,
    failOro8eDecisionStatusMismatchFixture,
    failOro8eDecisionScopeMismatchFixture,
    failActualLiveExecutionDecisionAlreadyIssuedFixture,
    failActualLiveExecutionDecisionAlreadyApprovedFixture,
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
  happyPathActualLiveExecutionRequestBoundaryFixture,
  failMissingOro8eDecisionFixture,
  failOro8eDecisionStatusMismatchFixture,
  failOro8eDecisionScopeMismatchFixture,
  failActualLiveExecutionDecisionAlreadyIssuedFixture,
  failActualLiveExecutionDecisionAlreadyApprovedFixture,
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
  buildOro8fActualLiveExecutionRequestBoundaryFixtures,
};
