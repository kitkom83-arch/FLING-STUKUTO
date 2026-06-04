"use strict";

const {
  buildOro4wRouteMountImplementationApprovalInput,
} = require("./oro4wRouteMountImplementationApprovalReadiness");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(buildOro4wRouteMountImplementationApprovalInput({ id, ...overrides }));
}

const happyPathReadinessRecordedMountNotImplementedFixture = fixture(
  "happyPathReadinessRecordedMountNotImplementedFixture"
);

const missingOro4vApprovalBoundaryFixture = fixture(
  "missingOro4vApprovalBoundaryFixture",
  {
    oro4vApprovalBoundary: {
      boundaryRecorded: false,
    },
  }
);

const oro4vApprovalBoundaryFailedFixture = fixture(
  "oro4vApprovalBoundaryFailedFixture",
  {
    oro4vApprovalBoundary: {
      routeMountApprovalBoundaryResult: "HOLD",
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    implementationApprovalReadiness: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  implementationApprovalReadiness: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    implementationApprovalReadiness: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  implementationApprovalReadiness: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  implementationApprovalReadiness: {
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
  implementationApprovalReadiness: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const readinessIncorrectlyTreatedAsImplementationApprovalFixture = fixture(
  "readinessIncorrectlyTreatedAsImplementationApprovalFixture",
  {
    implementationApprovalReadiness: {
      implementationApprovalGranted: true,
    },
    implementationAttempt: {
      approvalTriesToGrantImplementationExecution: true,
      readinessTreatedAsRuntimeMountAuthorization: true,
    },
  }
);

const readinessCorrectlyRequiresNextExplicitApprovalFixture = fixture(
  "readinessCorrectlyRequiresNextExplicitApprovalFixture",
  {
    implementationApprovalReadiness: {
      nextPhaseRequiresExplicitImplementationApproval: true,
      nextPhaseRequiresSeparateExecutionApproval: true,
    },
  }
);

function buildOro4wRouteMountImplementationApprovalFixtures() {
  return [
    happyPathReadinessRecordedMountNotImplementedFixture,
    missingOro4vApprovalBoundaryFixture,
    oro4vApprovalBoundaryFailedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
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
    readinessIncorrectlyTreatedAsImplementationApprovalFixture,
    readinessCorrectlyRequiresNextExplicitApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathReadinessRecordedMountNotImplementedFixture,
  missingOro4vApprovalBoundaryFixture,
  oro4vApprovalBoundaryFailedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
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
  readinessIncorrectlyTreatedAsImplementationApprovalFixture,
  readinessCorrectlyRequiresNextExplicitApprovalFixture,
  cloneFixture,
  buildOro4wRouteMountImplementationApprovalFixtures,
};
