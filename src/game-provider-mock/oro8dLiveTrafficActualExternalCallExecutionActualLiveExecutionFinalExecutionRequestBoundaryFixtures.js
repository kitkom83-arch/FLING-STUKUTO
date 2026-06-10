"use strict";

const {
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundary,
} = require("./oro8dLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8dActualLiveExecutionFinalExecutionRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture"
);

const failMissingOro8cGateFixture = fixture("failMissingOro8cGateFixture", {
  oro8cActualLiveExecutionFinalExecutionGateEvidence: {
    dependsOnOro8cActualLiveExecutionFinalExecutionGate: false,
    oro8cActualLiveExecutionFinalExecutionGatePassed: false,
  },
});

const failOro8cGateStatusMismatchFixture = fixture(
  "failOro8cGateStatusMismatchFixture",
  {
    oro8cActualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateStatusFromOro8c: "approved_to_execute_now",
    },
  }
);

const failOro8cGateScopeMismatchFixture = fixture(
  "failOro8cGateScopeMismatchFixture",
  {
    oro8cActualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateScopeFromOro8c:
        "actual_live_execution_final_execution_gate_scope_mismatch",
    },
  }
);

const failFinalExecutionDecisionAlreadyIssuedFixture = fixture(
  "failFinalExecutionDecisionAlreadyIssuedFixture",
  {
    actualLiveExecutionFinalExecutionRequestEvidence: {
      actualLiveExecutionFinalExecutionDecisionIssued: true,
    },
  }
);

const failLiveExecutionApprovedFixture = fixture("failLiveExecutionApprovedFixture", {
  actualLiveExecutionFinalExecutionRequestEvidence: {
    actualExternalCallExecutionLiveExecutionApproved: true,
  },
});

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

const failRouteEnablementAllowedFixture = fixture("failRouteEnablementAllowedFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
  },
});

const failExpressMountOrPublicAliasAllowedFixture = fixture(
  "failExpressMountOrPublicAliasAllowedFixture",
  {
    safetyEvidence: {
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

function buildOro8dActualLiveExecutionFinalExecutionRequestBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
    failMissingOro8cGateFixture,
    failOro8cGateStatusMismatchFixture,
    failOro8cGateScopeMismatchFixture,
    failFinalExecutionDecisionAlreadyIssuedFixture,
    failLiveExecutionApprovedFixture,
    failExternalNetworkAllowedFixture,
    failLiveOroPlayApiCallAllowedFixture,
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
    failRouteEnablementAllowedFixture,
    failExpressMountOrPublicAliasAllowedFixture,
    failSecretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionRequestBoundaryFixture,
  failMissingOro8cGateFixture,
  failOro8cGateStatusMismatchFixture,
  failOro8cGateScopeMismatchFixture,
  failFinalExecutionDecisionAlreadyIssuedFixture,
  failLiveExecutionApprovedFixture,
  failExternalNetworkAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failWalletMutationAllowedFixture,
  failLedgerMutationAllowedFixture,
  failPrismaWriteAllowedFixture,
  failDbTransactionAllowedFixture,
  failRouteEnablementAllowedFixture,
  failExpressMountOrPublicAliasAllowedFixture,
  failSecretLeakFixture,
  cloneFixture,
  buildOro8dActualLiveExecutionFinalExecutionRequestBoundaryFixtures,
};
