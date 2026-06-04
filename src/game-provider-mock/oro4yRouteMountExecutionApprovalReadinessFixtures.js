"use strict";

const {
  buildOro4yRouteMountExecutionApprovalInput,
} = require("./oro4yRouteMountExecutionApprovalReadiness");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro4yRouteMountExecutionApprovalInput({ id, ...overrides })
  );
}

const happyPathExecutionReadinessRecordedFixture = fixture(
  "happyPathExecutionReadinessRecordedFixture"
);

const missingOro4xDecisionFixture = fixture("missingOro4xDecisionFixture", {
  oro4xDecision: {
    decisionPresent: false,
    implementationApprovalDecisionIssued: false,
  },
});

const oro4xDecisionFailedFixture = fixture("oro4xDecisionFailedFixture", {
  oro4xDecision: {
    implementationApprovalDecisionResult: "HOLD",
  },
});

const implementationApprovalNotGrantedFixture = fixture(
  "implementationApprovalNotGrantedFixture",
  {
    oro4xDecision: {
      implementationApprovalGranted: false,
    },
  }
);

const implementationApprovalScopeWrongFixture = fixture(
  "implementationApprovalScopeWrongFixture",
  {
    oro4xDecision: {
      implementationApprovalScope: "runtime_route_mount_execution",
    },
  }
);

const implementationExecutionIncorrectlyApprovedFixture = fixture(
  "implementationExecutionIncorrectlyApprovedFixture",
  {
    oro4xDecision: {
      implementationExecutionApproved: true,
    },
    executionApprovalReadiness: {
      implementationExecutionApproved: true,
    },
  }
);

const routeMountAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountAuthorizationAccidentallyAuthorizedFixture",
  {
    executionApprovalReadiness: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const routeMountExecutionAuthorizationAccidentallyAuthorizedFixture = fixture(
  "routeMountExecutionAuthorizationAccidentallyAuthorizedFixture",
  {
    executionApprovalReadiness: {
      routeMountExecutionAuthorization: "authorized_for_execution",
    },
  }
);

const routeMountPatchIncorrectlyImplementedFixture = fixture(
  "routeMountPatchIncorrectlyImplementedFixture",
  {
    executionApprovalReadiness: {
      routeMountPatchImplemented: true,
    },
    implementationAttempt: {
      routeMountPatchImplementationAttempted: true,
    },
  }
);

const expressMountAllowedTrueFixture = fixture("expressMountAllowedTrueFixture", {
  executionApprovalReadiness: {
    expressMountAllowed: true,
  },
});

const expressMountImplementedTrueFixture = fixture(
  "expressMountImplementedTrueFixture",
  {
    executionApprovalReadiness: {
      expressMountImplemented: true,
    },
    implementationAttempt: {
      expressMountImplementationAttempted: true,
    },
  }
);

const publicAliasAllowedTrueFixture = fixture("publicAliasAllowedTrueFixture", {
  executionApprovalReadiness: {
    publicAliasAllowed: true,
  },
});

const runtimeTrafficAllowedTrueFixture = fixture("runtimeTrafficAllowedTrueFixture", {
  executionApprovalReadiness: {
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
  executionApprovalReadiness: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const readinessRequiresExplicitExecutionApprovalFixture = fixture(
  "readinessRequiresExplicitExecutionApprovalFixture",
  {
    executionApprovalReadiness: {
      nextPhaseRequiresExplicitExecutionApproval: true,
      executionApprovalGranted: false,
    },
  }
);

const runtimeTrafficRequiresSeparateApprovalFixture = fixture(
  "runtimeTrafficRequiresSeparateApprovalFixture",
  {
    executionApprovalReadiness: {
      nextPhaseRequiresSeparateRuntimeTrafficApproval: true,
      runtimeTrafficAllowed: false,
    },
  }
);

function buildOro4yRouteMountExecutionApprovalReadinessFixtures() {
  return [
    happyPathExecutionReadinessRecordedFixture,
    missingOro4xDecisionFixture,
    oro4xDecisionFailedFixture,
    implementationApprovalNotGrantedFixture,
    implementationApprovalScopeWrongFixture,
    implementationExecutionIncorrectlyApprovedFixture,
    routeMountAuthorizationAccidentallyAuthorizedFixture,
    routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
    routeMountPatchIncorrectlyImplementedFixture,
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
    readinessRequiresExplicitExecutionApprovalFixture,
    runtimeTrafficRequiresSeparateApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathExecutionReadinessRecordedFixture,
  missingOro4xDecisionFixture,
  oro4xDecisionFailedFixture,
  implementationApprovalNotGrantedFixture,
  implementationApprovalScopeWrongFixture,
  implementationExecutionIncorrectlyApprovedFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  routeMountExecutionAuthorizationAccidentallyAuthorizedFixture,
  routeMountPatchIncorrectlyImplementedFixture,
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
  readinessRequiresExplicitExecutionApprovalFixture,
  runtimeTrafficRequiresSeparateApprovalFixture,
  cloneFixture,
  buildOro4yRouteMountExecutionApprovalReadinessFixtures,
};
