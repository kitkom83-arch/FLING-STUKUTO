"use strict";

const {
  buildOro5cRouteMountPatchImplementationAuthorizationRequestInput,
} = require("./oro5cRouteMountPatchImplementationAuthorizationRequestSubmission");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5cRouteMountPatchImplementationAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPatchImplementationAuthorizationRequestSubmittedFixture = fixture(
  "happyPathPatchImplementationAuthorizationRequestSubmittedFixture"
);

const missingOro5bFinalExecutionDecisionFixture = fixture(
  "missingOro5bFinalExecutionDecisionFixture",
  {
    oro5bDecision: {
      decisionPresent: false,
    },
  }
);

const executionApprovalDecisionNotIssuedFixture = fixture(
  "executionApprovalDecisionNotIssuedFixture",
  {
    oro5bDecision: {
      routeMountExecutionApprovalDecisionIssued: false,
      executionApprovalDecisionIssued: false,
    },
  }
);

const executionApprovalNotGrantedFixture = fixture(
  "executionApprovalNotGrantedFixture",
  {
    oro5bDecision: {
      executionApprovalGranted: false,
    },
  }
);

const wrongExecutionDecisionResultFixture = fixture(
  "wrongExecutionDecisionResultFixture",
  {
    oro5bDecision: {
      routeMountExecutionApprovalDecisionResult: "approved_for_mount",
    },
  }
);

const wrongRouteMountExecutionAuthorizationFixture = fixture(
  "wrongRouteMountExecutionAuthorizationFixture",
  {
    oro5bDecision: {
      routeMountExecutionAuthorization: "authorized_for_mount",
    },
  }
);

const patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture =
  fixture(
    "patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture",
    {
      priorRequest: {
        routeMountPatchImplementationAuthorizationRequestSubmitted: true,
        routeMountPatchImplementationAuthorizationRequestStatus: "approved",
        routeMountPatchImplementationAuthorizationRequestResult: "conflict",
      },
    }
  );

const patchImplementationAuthorizationDecisionAlreadyIssuedFixture = fixture(
  "patchImplementationAuthorizationDecisionAlreadyIssuedFixture",
  {
    requestSubmission: {
      routeMountPatchImplementationAuthorizationDecisionIssued: true,
    },
  }
);

const patchApprovedIncorrectlyFixture = fixture("patchApprovedIncorrectlyFixture", {
  requestSubmission: {
    routeMountPatchApproved: true,
  },
});

const patchImplementationAuthorizedIncorrectlyFixture = fixture(
  "patchImplementationAuthorizedIncorrectlyFixture",
  {
    requestSubmission: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const patchImplementedIncorrectlyFixture = fixture(
  "patchImplementedIncorrectlyFixture",
  {
    requestSubmission: {
      routeMountPatchImplemented: true,
    },
  }
);

const implementationExecutionIncorrectlyApprovedFixture = fixture(
  "implementationExecutionIncorrectlyApprovedFixture",
  {
    requestSubmission: {
      implementationExecutionApproved: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    requestSubmission: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  requestSubmission: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    requestSubmission: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  requestSubmission: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  requestSubmission: {
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
  requestSubmission: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture =
  fixture(
    "decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture",
    {
      requestSubmission: {
        nextPhaseRequiresPatchImplementationAuthorizationDecision: true,
      },
    }
  );

const requestSkipsPatchImplementationAuthorizationDecisionFixture = fixture(
  "requestSkipsPatchImplementationAuthorizationDecisionFixture",
  {
    implementationAttempt: {
      requestSubmissionSkipsAuthorizationDecision: true,
    },
  }
);

const runtimeTrafficCorrectlyRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficCorrectlyRequiresSeparateApprovalFixture",
  {
    requestSubmission: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures() {
  return [
    happyPathPatchImplementationAuthorizationRequestSubmittedFixture,
    missingOro5bFinalExecutionDecisionFixture,
    executionApprovalDecisionNotIssuedFixture,
    executionApprovalNotGrantedFixture,
    wrongExecutionDecisionResultFixture,
    wrongRouteMountExecutionAuthorizationFixture,
    patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture,
    patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
    patchApprovedIncorrectlyFixture,
    patchImplementationAuthorizedIncorrectlyFixture,
    patchImplementedIncorrectlyFixture,
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
    decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture,
    requestSkipsPatchImplementationAuthorizationDecisionFixture,
    runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPatchImplementationAuthorizationRequestSubmittedFixture,
  missingOro5bFinalExecutionDecisionFixture,
  executionApprovalDecisionNotIssuedFixture,
  executionApprovalNotGrantedFixture,
  wrongExecutionDecisionResultFixture,
  wrongRouteMountExecutionAuthorizationFixture,
  patchImplementationAuthorizationRequestAlreadySubmittedConflictingStateFixture,
  patchImplementationAuthorizationDecisionAlreadyIssuedFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
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
  decisionCorrectlyRequiresPatchImplementationAuthorizationDecisionFixture,
  requestSkipsPatchImplementationAuthorizationDecisionFixture,
  runtimeTrafficCorrectlyRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro5cRouteMountPatchImplementationAuthorizationRequestSubmissionFixtures,
};
