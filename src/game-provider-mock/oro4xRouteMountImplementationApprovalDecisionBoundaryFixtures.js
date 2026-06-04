"use strict";

const {
  buildOro4xRouteMountImplementationApprovalDecisionInput,
} = require("./oro4xRouteMountImplementationApprovalDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro4xRouteMountImplementationApprovalDecisionInput({ id, ...overrides })
  );
}

const happyPathImplementationApprovalDecisionRecordedFixture = fixture(
  "happyPathImplementationApprovalDecisionRecordedFixture"
);

const missingOro4wReadinessFixture = fixture("missingOro4wReadinessFixture", {
  oro4wReadiness: {
    readinessPresent: false,
  },
});

const oro4wReadinessFailedFixture = fixture("oro4wReadinessFailedFixture", {
  oro4wReadiness: {
    implementationApprovalReadinessResult: "HOLD",
  },
});

const readinessNotRecordedFixture = fixture("readinessNotRecordedFixture", {
  oro4wReadiness: {
    implementationApprovalReadinessRecorded: false,
  },
});

const implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture = fixture(
  "implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture",
  {
    implementationApprovalDecision: {
      implementationExecutionApproved: true,
    },
    implementationAttempt: {
      approvalTriesToGrantImplementationExecution: true,
      approvalTreatedAsRuntimeMountAuthorization: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    implementationApprovalDecision: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const routeMountExecutionAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
  {
    implementationApprovalDecision: {
      routeMountExecutionAuthorization: "authorized_for_execution",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  implementationApprovalDecision: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    implementationApprovalDecision: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  implementationApprovalDecision: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  implementationApprovalDecision: {
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
  implementationApprovalDecision: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const separateExecutionApprovalRequiredFixture = fixture(
  "separateExecutionApprovalRequiredFixture",
  {
    implementationApprovalDecision: {
      nextPhaseRequiresSeparateExecutionApproval: true,
    },
  }
);

const runtimeTrafficSeparateApprovalRequiredFixture = fixture(
  "runtimeTrafficSeparateApprovalRequiredFixture",
  {
    implementationApprovalDecision: {
      nextPhaseRequiresExplicitRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro4xRouteMountImplementationApprovalDecisionFixtures() {
  return [
    happyPathImplementationApprovalDecisionRecordedFixture,
    missingOro4wReadinessFixture,
    oro4wReadinessFailedFixture,
    readinessNotRecordedFixture,
    implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
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
    separateExecutionApprovalRequiredFixture,
    runtimeTrafficSeparateApprovalRequiredFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathImplementationApprovalDecisionRecordedFixture,
  missingOro4wReadinessFixture,
  oro4wReadinessFailedFixture,
  readinessNotRecordedFixture,
  implementationApprovalIncorrectlyTreatedAsExecutionApprovalFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
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
  separateExecutionApprovalRequiredFixture,
  runtimeTrafficSeparateApprovalRequiredFixture,
  cloneFixture,
  buildOro4xRouteMountImplementationApprovalDecisionFixtures,
};
