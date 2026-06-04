"use strict";

const {
  buildOro5aRouteMountExecutionApprovalRequestInput,
} = require("./oro5aRouteMountExecutionApprovalRequestSubmission");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5aRouteMountExecutionApprovalRequestInput({ id, ...overrides })
  );
}

const happyPathExecutionApprovalRequestSubmittedFixture = fixture(
  "happyPathExecutionApprovalRequestSubmittedFixture"
);

const missingOro4zPatchReviewDecisionFixture = fixture(
  "missingOro4zPatchReviewDecisionFixture",
  {
    oro4zDecision: {
      decisionPresent: false,
    },
  }
);

const oro4zDecisionFailedFixture = fixture("oro4zDecisionFailedFixture", {
  oro4zDecision: {
    routeMountPatchReviewDecisionBoundaryResult: "HOLD",
  },
});

const patchReviewDecisionNotIssuedFixture = fixture(
  "patchReviewDecisionNotIssuedFixture",
  {
    oro4zDecision: {
      routeMountPatchReviewDecisionIssued: false,
    },
  }
);

const patchReviewResultWrongFixture = fixture("patchReviewResultWrongFixture", {
  oro4zDecision: {
    routeMountPatchReviewResult: "review_failed_not_ready",
  },
});

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

const executionApprovalIncorrectlyGrantedFixture = fixture(
  "executionApprovalIncorrectlyGrantedFixture",
  {
    requestSubmission: {
      executionApprovalGranted: true,
    },
  }
);

const executionApprovalDecisionIncorrectlyIssuedFixture = fixture(
  "executionApprovalDecisionIncorrectlyIssuedFixture",
  {
    requestSubmission: {
      executionApprovalDecisionIssued: true,
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

const routeMountExecutionAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
  {
    requestSubmission: {
      routeMountExecutionAuthorization: "authorized_for_execution",
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

const requestRequiresFinalExecutionApprovalDecisionFixture = fixture(
  "requestRequiresFinalExecutionApprovalDecisionFixture",
  {
    requestSubmission: {
      nextPhaseRequiresFinalExecutionApprovalDecision: true,
      executionApprovalDecisionIssued: false,
    },
  }
);

const requestCannotBeFinalExecutionApprovalFixture = fixture(
  "requestCannotBeFinalExecutionApprovalFixture",
  {
    implementationAttempt: {
      requestSubmissionTreatedAsFinalExecutionApproval: true,
    },
  }
);

const requestRequiresPatchImplementationApprovalFixture = fixture(
  "requestRequiresPatchImplementationApprovalFixture",
  {
    implementationAttempt: {
      requestSubmissionSkipsPatchImplementationApproval: true,
    },
  }
);

const runtimeTrafficRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficRequiresSeparateApprovalFixture",
  {
    requestSubmission: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro5aRouteMountExecutionApprovalRequestSubmissionFixtures() {
  return [
    happyPathExecutionApprovalRequestSubmittedFixture,
    missingOro4zPatchReviewDecisionFixture,
    oro4zDecisionFailedFixture,
    patchReviewDecisionNotIssuedFixture,
    patchReviewResultWrongFixture,
    patchApprovedIncorrectlyFixture,
    patchImplementationAuthorizedIncorrectlyFixture,
    patchImplementedIncorrectlyFixture,
    executionApprovalIncorrectlyGrantedFixture,
    executionApprovalDecisionIncorrectlyIssuedFixture,
    implementationExecutionIncorrectlyApprovedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
    expressMountAllowedTrueFixture,
    expressMountImplementedTrueFixture,
    publicAliasAllowedTrueFixture,
    runtimeTrafficAllowedTrueFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRouteControllerRuntimeChangeFixture,
    attemptedExpressMountImplementationFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    attemptedDbTransactionFixture,
    attemptedMigrationFixture,
    attemptedExternalNetworkFixture,
    secretShapedOutputFixture,
    requestRequiresFinalExecutionApprovalDecisionFixture,
    requestCannotBeFinalExecutionApprovalFixture,
    requestRequiresPatchImplementationApprovalFixture,
    runtimeTrafficRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathExecutionApprovalRequestSubmittedFixture,
  missingOro4zPatchReviewDecisionFixture,
  oro4zDecisionFailedFixture,
  patchReviewDecisionNotIssuedFixture,
  patchReviewResultWrongFixture,
  patchApprovedIncorrectlyFixture,
  patchImplementationAuthorizedIncorrectlyFixture,
  patchImplementedIncorrectlyFixture,
  executionApprovalIncorrectlyGrantedFixture,
  executionApprovalDecisionIncorrectlyIssuedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  publicAliasAllowedTrueFixture,
  runtimeTrafficAllowedTrueFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedExpressMountImplementationFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedDbTransactionFixture,
  attemptedMigrationFixture,
  attemptedExternalNetworkFixture,
  secretShapedOutputFixture,
  requestRequiresFinalExecutionApprovalDecisionFixture,
  requestCannotBeFinalExecutionApprovalFixture,
  requestRequiresPatchImplementationApprovalFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro5aRouteMountExecutionApprovalRequestSubmissionFixtures,
};
