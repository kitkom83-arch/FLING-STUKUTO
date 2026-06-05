"use strict";

const {
  buildOro5hActualPatchImplementationAuthorizationDecisionInput,
} = require("./oro5hActualPatchImplementationAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5hActualPatchImplementationAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture = fixture(
  "happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture"
);

const missingOro5gRequestFixture = fixture("missingOro5gRequestFixture", {
  oro5gRequest: {
    requestPresent: false,
  },
});

const oro5gRequestNotSubmittedFixture = fixture("oro5gRequestNotSubmittedFixture", {
  oro5gRequest: {
    actualPatchImplementationAuthorizationRequestSubmitted: false,
  },
});

const oro5gRequestWrongStatusFixture = fixture("oro5gRequestWrongStatusFixture", {
  oro5gRequest: {
    actualPatchImplementationAuthorizationRequestStatus: "draft",
  },
});

const authorizationDecisionAlreadyIssuedFixture = fixture(
  "authorizationDecisionAlreadyIssuedFixture",
  {
    oro5gRequest: {
      actualPatchImplementationAuthorizationDecisionIssued: true,
    },
  }
);

const authorizationAlreadyGrantedFixture = fixture(
  "authorizationAlreadyGrantedFixture",
  {
    oro5gRequest: {
      actualPatchImplementationAuthorizationGranted: true,
    },
  }
);

const actualPatchImplementationAlreadyImplementedFixture = fixture(
  "actualPatchImplementationAlreadyImplementedFixture",
  {
    oro5gRequest: {
      actualPatchImplementationImplemented: true,
    },
  }
);

const actualPatchExecutionAlreadyStartedFixture = fixture(
  "actualPatchExecutionAlreadyStartedFixture",
  {
    oro5gRequest: {
      actualPatchImplementationExecutionStarted: true,
    },
  }
);

const actualPatchAlreadyAppliedFixture = fixture("actualPatchAlreadyAppliedFixture", {
  oro5gRequest: {
    actualPatchImplementationPatchApplied: true,
  },
});

const routeMountPatchApprovedUnexpectedlyFixture = fixture(
  "routeMountPatchApprovedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountPatchApproved: true,
    },
  }
);

const routeMountImplementationAuthorizedUnexpectedlyFixture = fixture(
  "routeMountImplementationAuthorizedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  {
    decisionState: {
      expressMountAllowed: true,
    },
  }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  {
    decisionState: {
      publicAliasAllowed: true,
    },
  }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  {
    decisionState: {
      runtimeTrafficAllowed: true,
    },
  }
);

const attemptedSrcAppJsEditFixture = fixture("attemptedSrcAppJsEditFixture", {
  implementationAttempt: {
    srcAppJsEditAttempted: true,
  },
});

const attemptedRuntimeRouteControllerEditFixture = fixture(
  "attemptedRuntimeRouteControllerEditFixture",
  {
    implementationAttempt: {
      routeControllerRuntimeChangeAttempted: true,
    },
  }
);

const attemptedExpressMountFixture = fixture("attemptedExpressMountFixture", {
  implementationAttempt: {
    expressMountImplementationAttempted: true,
  },
});

const attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture = fixture(
  "attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture",
  {
    implementationAttempt: {
      walletMutationAttempted: true,
      ledgerMutationAttempted: true,
      prismaWriteAttempted: true,
      dbTransactionAttempted: true,
      migrationAttempted: true,
      externalNetworkAttempted: true,
    },
  }
);

const authorizationDecisionTriesActualPatchExecutionFixture = fixture(
  "authorizationDecisionTriesActualPatchExecutionFixture",
  {
    implementationAttempt: {
      authorizationDecisionTriesActualPatchImplementationExecution: true,
    },
  }
);

const authorizationDecisionTriesRouteMountAuthorizationFixture = fixture(
  "authorizationDecisionTriesRouteMountAuthorizationFixture",
  {
    implementationAttempt: {
      authorizationDecisionTriesRouteMountAuthorization: true,
    },
  }
);

const authorizationDecisionTriesRuntimeTrafficApprovalFixture = fixture(
  "authorizationDecisionTriesRuntimeTrafficApprovalFixture",
  {
    implementationAttempt: {
      authorizationDecisionTriesRuntimeTrafficApproval: true,
    },
  }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  decisionState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5hActualPatchImplementationAuthorizationDecisionFixtures() {
  return [
    happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture,
    missingOro5gRequestFixture,
    oro5gRequestNotSubmittedFixture,
    oro5gRequestWrongStatusFixture,
    authorizationDecisionAlreadyIssuedFixture,
    authorizationAlreadyGrantedFixture,
    actualPatchImplementationAlreadyImplementedFixture,
    actualPatchExecutionAlreadyStartedFixture,
    actualPatchAlreadyAppliedFixture,
    routeMountPatchApprovedUnexpectedlyFixture,
    routeMountImplementationAuthorizedUnexpectedlyFixture,
    routeMountAuthorizedUnexpectedlyFixture,
    expressMountAllowedUnexpectedlyFixture,
    publicAliasAllowedUnexpectedlyFixture,
    runtimeTrafficAllowedUnexpectedlyFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRuntimeRouteControllerEditFixture,
    attemptedExpressMountFixture,
    attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
    authorizationDecisionTriesActualPatchExecutionFixture,
    authorizationDecisionTriesRouteMountAuthorizationFixture,
    authorizationDecisionTriesRuntimeTrafficApprovalFixture,
    secretShapedOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualPatchImplementationAuthorizationDecisionIssuedFixture,
  missingOro5gRequestFixture,
  oro5gRequestNotSubmittedFixture,
  oro5gRequestWrongStatusFixture,
  authorizationDecisionAlreadyIssuedFixture,
  authorizationAlreadyGrantedFixture,
  actualPatchImplementationAlreadyImplementedFixture,
  actualPatchExecutionAlreadyStartedFixture,
  actualPatchAlreadyAppliedFixture,
  routeMountPatchApprovedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  expressMountAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedExpressMountFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  authorizationDecisionTriesActualPatchExecutionFixture,
  authorizationDecisionTriesRouteMountAuthorizationFixture,
  authorizationDecisionTriesRuntimeTrafficApprovalFixture,
  secretShapedOutputFixture,
  cloneFixture,
  buildOro5hActualPatchImplementationAuthorizationDecisionFixtures,
};
