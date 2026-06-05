"use strict";

const {
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput,
} = require("./oro5dRouteMountPatchImplementationAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5dRouteMountPatchImplementationAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPatchImplementationAuthorizationDecisionIssuedFixture = fixture(
  "happyPathPatchImplementationAuthorizationDecisionIssuedFixture"
);

const missingOro5cRequestFixture = fixture("missingOro5cRequestFixture", {
  oro5cRequest: {
    requestPresent: false,
  },
});

const oro5cRequestNotSubmittedFixture = fixture("oro5cRequestNotSubmittedFixture", {
  oro5cRequest: {
    routeMountPatchImplementationAuthorizationRequestSubmitted: false,
  },
});

const oro5cStatusNotPendingFixture = fixture("oro5cStatusNotPendingFixture", {
  oro5cRequest: {
    routeMountPatchImplementationAuthorizationRequestStatus: "decision_issued",
  },
});

const wrongOro5cRequestResultFixture = fixture(
  "wrongOro5cRequestResultFixture",
  {
    oro5cRequest: {
      routeMountPatchImplementationAuthorizationRequestResult: "approved",
    },
  }
);

const executionApprovalDecisionMissingFixture = fixture(
  "executionApprovalDecisionMissingFixture",
  {
    oro5cRequest: {
      routeMountExecutionApprovalDecisionIssued: false,
      executionApprovalDecisionIssued: false,
    },
  }
);

const executionApprovalNotGrantedFixture = fixture(
  "executionApprovalNotGrantedFixture",
  {
    oro5cRequest: {
      executionApprovalGranted: false,
    },
  }
);

const wrongRouteMountExecutionAuthorizationFixture = fixture(
  "wrongRouteMountExecutionAuthorizationFixture",
  {
    oro5cRequest: {
      routeMountExecutionAuthorization: "authorized_for_mount",
    },
  }
);

const patchImplementationAuthorizationDecisionAlreadyIssuedFixture = fixture(
  "patchImplementationAuthorizationDecisionAlreadyIssuedFixture",
  {
    oro5cRequest: {
      routeMountPatchImplementationAuthorizationDecisionIssued: true,
    },
  }
);

const patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture =
  fixture(
    "patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture",
    {
      implementationAttempt: {
        patchImplementationAuthorizationTriesActualImplementationApproval: true,
      },
    }
  );

const patchApprovedIncorrectlyFixture = fixture("patchApprovedIncorrectlyFixture", {
  decisionState: {
    routeMountPatchApproved: true,
  },
});

const patchImplementationAuthorizedIncorrectlyFixture = fixture(
  "patchImplementationAuthorizedIncorrectlyFixture",
  {
    decisionState: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const patchImplementedIncorrectlyFixture = fixture(
  "patchImplementedIncorrectlyFixture",
  {
    decisionState: {
      routeMountPatchImplemented: true,
    },
  }
);

const actualPatchImplementationApprovalAlreadyIssuedFixture = fixture(
  "actualPatchImplementationApprovalAlreadyIssuedFixture",
  {
    decisionState: {
      actualPatchImplementationApprovalIssued: true,
    },
  }
);

const actualPatchImplementationApprovalAlreadyGrantedFixture = fixture(
  "actualPatchImplementationApprovalAlreadyGrantedFixture",
  {
    decisionState: {
      actualPatchImplementationApprovalGranted: true,
    },
  }
);

const implementationExecutionIncorrectlyApprovedFixture = fixture(
  "implementationExecutionIncorrectlyApprovedFixture",
  {
    decisionState: {
      implementationExecutionApproved: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    decisionState: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  decisionState: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    decisionState: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  decisionState: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  decisionState: {
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

const attemptedExpressMountImplementationFixture = fixture(
  "attemptedExpressMountImplementationFixture",
  {
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const attemptedPublicAliasAuthorizationFixture = fixture(
  "attemptedPublicAliasAuthorizationFixture",
  {
    implementationAttempt: {
      publicAliasAuthorizationAttempted: true,
    },
  }
);

const attemptedRuntimeTrafficAuthorizationFixture = fixture(
  "attemptedRuntimeTrafficAuthorizationFixture",
  {
    implementationAttempt: {
      runtimeTrafficAuthorizationAttempted: true,
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
  decisionState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture =
  fixture(
    "decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture",
    {
      decisionState: {
        nextPhaseRequiresActualPatchImplementationApprovalRequest: true,
      },
    }
  );

const routeMountCorrectlyRequiresSeparateAuthorizationFixture = fixture(
  "routeMountCorrectlyRequiresSeparateAuthorizationFixture",
  {
    decisionState: {
      nextPhaseRequiresSeparateRouteMountAuthorization: true,
    },
  }
);

const runtimeTrafficCorrectlyRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficCorrectlyRequiresSeparateApprovalFixture",
  {
    decisionState: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
    },
  }
);

function buildOro5dRouteMountPatchImplementationAuthorizationDecisionFixtures() {
  return [
    happyPathPatchImplementationAuthorizationDecisionIssuedFixture,
    missingOro5cRequestFixture,
    oro5cRequestNotSubmittedFixture,
    oro5cStatusNotPendingFixture,
    wrongOro5cRequestResultFixture,
    executionApprovalDecisionMissingFixture,
    executionApprovalNotGrantedFixture,
    wrongRouteMountExecutionAuthorizationFixture,
    patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
    patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture,
    patchApprovedIncorrectlyFixture,
    patchImplementationAuthorizedIncorrectlyFixture,
    patchImplementedIncorrectlyFixture,
    actualPatchImplementationApprovalAlreadyIssuedFixture,
    actualPatchImplementationApprovalAlreadyGrantedFixture,
    implementationExecutionIncorrectlyApprovedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    expressMountAllowedTrueFixture,
    expressMountImplementedTrueFixture,
    publicAliasAllowedTrueFixture,
    runtimeTrafficAllowedTrueFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRouteControllerRuntimeChangeFixture,
    attemptedExpressMountImplementationFixture,
    attemptedPublicAliasAuthorizationFixture,
    attemptedRuntimeTrafficAuthorizationFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    attemptedDbTransactionFixture,
    attemptedMigrationFixture,
    attemptedExternalNetworkFixture,
    secretShapedOutputFixture,
    decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture,
    routeMountCorrectlyRequiresSeparateAuthorizationFixture,
    runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPatchImplementationAuthorizationDecisionIssuedFixture,
  missingOro5cRequestFixture,
  oro5cRequestNotSubmittedFixture,
  oro5cStatusNotPendingFixture,
  wrongOro5cRequestResultFixture,
  executionApprovalDecisionMissingFixture,
  executionApprovalNotGrantedFixture,
  wrongRouteMountExecutionAuthorizationFixture,
  patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
  patchImplementationAuthorizationIncorrectlyApprovesActualImplementationFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
  actualPatchImplementationApprovalAlreadyIssuedFixture,
  actualPatchImplementationApprovalAlreadyGrantedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  publicAliasAllowedTrueFixture,
  runtimeTrafficAllowedTrueFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedExpressMountImplementationFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedDbTransactionFixture,
  attemptedMigrationFixture,
  attemptedExternalNetworkFixture,
  secretShapedOutputFixture,
  decisionCorrectlyRequiresActualPatchImplementationApprovalRequestFixture,
  routeMountCorrectlyRequiresSeparateAuthorizationFixture,
  runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro5dRouteMountPatchImplementationAuthorizationDecisionFixtures,
};
