"use strict";

const {
  buildOro4zRouteMountPatchReviewInput,
} = require("./oro4zRouteMountPatchReviewDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro4zRouteMountPatchReviewInput({ id, ...overrides })
  );
}

const happyPathPatchReviewDecisionRecordedFixture = fixture(
  "happyPathPatchReviewDecisionRecordedFixture"
);

const missingOro4yReadinessFixture = fixture("missingOro4yReadinessFixture", {
  oro4yReadiness: {
    readinessPresent: false,
  },
});

const oro4yReadinessFailedFixture = fixture("oro4yReadinessFailedFixture", {
  oro4yReadiness: {
    executionApprovalReadinessResult: "HOLD",
  },
});

const executionReadinessNotRecordedFixture = fixture(
  "executionReadinessNotRecordedFixture",
  {
    oro4yReadiness: {
      executionApprovalReadinessRecorded: false,
    },
  }
);

const patchReviewNotPreparedFixture = fixture("patchReviewNotPreparedFixture", {
  oro4yReadiness: {
    routeMountPatchReviewPrepared: false,
  },
});

const executionApprovalIncorrectlyGrantedFixture = fixture(
  "executionApprovalIncorrectlyGrantedFixture",
  {
    patchReviewDecision: {
      executionApprovalGranted: true,
    },
  }
);

const implementationExecutionIncorrectlyApprovedFixture = fixture(
  "implementationExecutionIncorrectlyApprovedFixture",
  {
    patchReviewDecision: {
      implementationExecutionApproved: true,
    },
  }
);

const routeMountPatchIncorrectlyApprovedFixture = fixture(
  "routeMountPatchIncorrectlyApprovedFixture",
  {
    patchReviewDecision: {
      routeMountPatchApproved: true,
    },
  }
);

const routeMountPatchIncorrectlyImplementedFixture = fixture(
  "routeMountPatchIncorrectlyImplementedFixture",
  {
    patchReviewDecision: {
      routeMountPatchImplemented: true,
    },
    implementationAttempt: {
      routeMountPatchImplementationAttempted: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    patchReviewDecision: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const routeMountExecutionAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
  {
    patchReviewDecision: {
      routeMountExecutionAuthorization: "authorized_for_execution",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  patchReviewDecision: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    patchReviewDecision: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  patchReviewDecision: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  patchReviewDecision: {
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
  patchReviewDecision: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const patchReviewRequiresExplicitExecutionApprovalFixture = fixture(
  "patchReviewRequiresExplicitExecutionApprovalFixture",
  {
    patchReviewDecision: {
      nextPhaseRequiresExplicitExecutionApproval: true,
      executionApprovalGranted: false,
    },
  }
);

const patchReviewCannotBeExecutionAuthorizationFixture = fixture(
  "patchReviewCannotBeExecutionAuthorizationFixture",
  {
    implementationAttempt: {
      reviewTreatedAsExecutionAuthorization: true,
    },
  }
);

const patchReviewRequiresPatchImplementationApprovalFixture = fixture(
  "patchReviewRequiresPatchImplementationApprovalFixture",
  {
    implementationAttempt: {
      approvalTriesToSkipActualPatchImplementationApproval: true,
    },
  }
);

const runtimeTrafficRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficRequiresSeparateApprovalFixture",
  {
    patchReviewDecision: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro4zRouteMountPatchReviewDecisionBoundaryFixtures() {
  return [
    happyPathPatchReviewDecisionRecordedFixture,
    missingOro4yReadinessFixture,
    oro4yReadinessFailedFixture,
    executionReadinessNotRecordedFixture,
    patchReviewNotPreparedFixture,
    executionApprovalIncorrectlyGrantedFixture,
    implementationExecutionIncorrectlyApprovedFixture,
    routeMountPatchIncorrectlyApprovedFixture,
    routeMountPatchIncorrectlyImplementedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
    expressMountAllowedTrueFixture,
    expressMountImplementedTrueFixture,
    publicAliasAllowedTrueFixture,
    runtimeTrafficAllowedTrueFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRouteControllerRuntimeChangeFixture,
    attemptedPublicAliasAuthorizationFixture,
    attemptedRuntimeTrafficAuthorizationFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    attemptedDbTransactionFixture,
    attemptedMigrationFixture,
    attemptedExternalNetworkFixture,
    secretShapedOutputFixture,
    patchReviewRequiresExplicitExecutionApprovalFixture,
    patchReviewCannotBeExecutionAuthorizationFixture,
    patchReviewRequiresPatchImplementationApprovalFixture,
    runtimeTrafficRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPatchReviewDecisionRecordedFixture,
  missingOro4yReadinessFixture,
  oro4yReadinessFailedFixture,
  executionReadinessNotRecordedFixture,
  patchReviewNotPreparedFixture,
  executionApprovalIncorrectlyGrantedFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  routeMountPatchIncorrectlyApprovedFixture,
  routeMountPatchIncorrectlyImplementedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  publicAliasAllowedTrueFixture,
  runtimeTrafficAllowedTrueFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedDbTransactionFixture,
  attemptedMigrationFixture,
  attemptedExternalNetworkFixture,
  secretShapedOutputFixture,
  patchReviewRequiresExplicitExecutionApprovalFixture,
  patchReviewCannotBeExecutionAuthorizationFixture,
  patchReviewRequiresPatchImplementationApprovalFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro4zRouteMountPatchReviewDecisionBoundaryFixtures,
};
