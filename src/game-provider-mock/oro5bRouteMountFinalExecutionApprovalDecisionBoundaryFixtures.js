"use strict";

const {
  buildOro5bRouteMountFinalExecutionApprovalDecisionInput,
} = require("./oro5bRouteMountFinalExecutionApprovalDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5bRouteMountFinalExecutionApprovalDecisionInput({ id, ...overrides })
  );
}

const happyPathFinalExecutionApprovalDecisionIssuedFixture = fixture(
  "happyPathFinalExecutionApprovalDecisionIssuedFixture"
);

const missingOro5aRequestFixture = fixture("missingOro5aRequestFixture", {
  oro5aRequest: {
    requestPresent: false,
  },
});

const oro5aRequestNotSubmittedFixture = fixture("oro5aRequestNotSubmittedFixture", {
  oro5aRequest: {
    routeMountExecutionApprovalRequestSubmitted: false,
  },
});

const oro5aStatusNotPendingFixture = fixture("oro5aStatusNotPendingFixture", {
  oro5aRequest: {
    routeMountExecutionApprovalRequestStatus: "request_not_pending",
  },
});

const executionDecisionAlreadyIssuedFixture = fixture(
  "executionDecisionAlreadyIssuedFixture",
  {
    oro5aRequest: {
      executionApprovalDecisionIssued: true,
    },
  }
);

const executionDecisionTriesPatchImplementationApprovalFixture = fixture(
  "executionDecisionTriesPatchImplementationApprovalFixture",
  {
    implementationAttempt: {
      executionDecisionTriesPatchImplementationApproval: true,
    },
  }
);

const patchApprovedIncorrectlyFixture = fixture("patchApprovedIncorrectlyFixture", {
  finalDecision: {
    routeMountPatchApproved: true,
  },
});

const patchImplementationAuthorizedIncorrectlyFixture = fixture(
  "patchImplementationAuthorizedIncorrectlyFixture",
  {
    finalDecision: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const patchImplementedIncorrectlyFixture = fixture(
  "patchImplementedIncorrectlyFixture",
  {
    finalDecision: {
      routeMountPatchImplemented: true,
    },
  }
);

const implementationExecutionIncorrectlyApprovedFixture = fixture(
  "implementationExecutionIncorrectlyApprovedFixture",
  {
    finalDecision: {
      implementationExecutionApproved: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    finalDecision: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const routeMountExecutionAuthorizationWrongFixture = fixture(
  "routeMountExecutionAuthorizationWrongFixture",
  {
    finalDecision: {
      routeMountExecutionAuthorization: "authorized_for_execution",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  finalDecision: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    finalDecision: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  finalDecision: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  finalDecision: {
    runtimeTrafficAllowed: true,
  },
});

const attemptedSrcAppJsEditFixture = fixture("attemptedSrcAppJsEditFixture", {
  implementationAttempt: {
    srcAppJsEditAttempted: true,
  },
});

const attemptedRouteControllerRuntimeChangeFixture = fixture(
  "attemptedRouteControllerRuntimeChangeFixture",
  {
    implementationAttempt: {
      routeControllerRuntimeChangeAttempted: true,
    },
  }
);

const attemptedWalletMutationFixture = fixture("attemptedWalletMutationFixture", {
  implementationAttempt: {
    walletMutationAttempted: true,
  },
});

const attemptedLedgerMutationFixture = fixture("attemptedLedgerMutationFixture", {
  implementationAttempt: {
    ledgerMutationAttempted: true,
  },
});

const attemptedPrismaWriteFixture = fixture("attemptedPrismaWriteFixture", {
  implementationAttempt: {
    prismaWriteAttempted: true,
  },
});

const attemptedDbTransactionFixture = fixture("attemptedDbTransactionFixture", {
  implementationAttempt: {
    dbTransactionAttempted: true,
  },
});

const attemptedMigrationFixture = fixture("attemptedMigrationFixture", {
  implementationAttempt: {
    migrationAttempted: true,
  },
});

const attemptedExternalNetworkFixture = fixture("attemptedExternalNetworkFixture", {
  implementationAttempt: {
    externalNetworkAttempted: true,
  },
});

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  finalDecision: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const decisionRequiresPatchImplementationAuthorizationRequestFixture = fixture(
  "decisionRequiresPatchImplementationAuthorizationRequestFixture",
  {
    finalDecision: {
      nextPhaseRequiresPatchImplementationAuthorizationRequest: true,
    },
  }
);

const decisionSkipsPatchImplementationAuthorizationRequestFixture = fixture(
  "decisionSkipsPatchImplementationAuthorizationRequestFixture",
  {
    implementationAttempt: {
      executionDecisionSkipsPatchImplementationAuthorizationRequest: true,
    },
  }
);

const runtimeTrafficRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficRequiresSeparateApprovalFixture",
  {
    finalDecision: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro5bRouteMountFinalExecutionApprovalDecisionFixtures() {
  return [
    happyPathFinalExecutionApprovalDecisionIssuedFixture,
    missingOro5aRequestFixture,
    oro5aRequestNotSubmittedFixture,
    oro5aStatusNotPendingFixture,
    executionDecisionAlreadyIssuedFixture,
    executionDecisionTriesPatchImplementationApprovalFixture,
    patchApprovedIncorrectlyFixture,
    patchImplementationAuthorizedIncorrectlyFixture,
    patchImplementedIncorrectlyFixture,
    implementationExecutionIncorrectlyApprovedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    routeMountExecutionAuthorizationWrongFixture,
    expressMountAllowedTrueFixture,
    expressMountImplementedTrueFixture,
    publicAliasAllowedTrueFixture,
    runtimeTrafficAllowedTrueFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRouteControllerRuntimeChangeFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    attemptedDbTransactionFixture,
    attemptedMigrationFixture,
    attemptedExternalNetworkFixture,
    secretShapedOutputFixture,
    decisionRequiresPatchImplementationAuthorizationRequestFixture,
    decisionSkipsPatchImplementationAuthorizationRequestFixture,
    runtimeTrafficRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathFinalExecutionApprovalDecisionIssuedFixture,
  missingOro5aRequestFixture,
  oro5aRequestNotSubmittedFixture,
  oro5aStatusNotPendingFixture,
  executionDecisionAlreadyIssuedFixture,
  executionDecisionTriesPatchImplementationApprovalFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationWrongFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  publicAliasAllowedTrueFixture,
  runtimeTrafficAllowedTrueFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedDbTransactionFixture,
  attemptedMigrationFixture,
  attemptedExternalNetworkFixture,
  secretShapedOutputFixture,
  decisionRequiresPatchImplementationAuthorizationRequestFixture,
  decisionSkipsPatchImplementationAuthorizationRequestFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro5bRouteMountFinalExecutionApprovalDecisionFixtures,
};
