"use strict";

const {
  buildOro5gActualPatchImplementationAuthorizationRequestInput,
} = require("./oro5gActualPatchImplementationAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5gActualPatchImplementationAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture = fixture(
  "happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture"
);

const missingOro5fDecisionFixture = fixture("missingOro5fDecisionFixture", {
  oro5fDecision: {
    decisionPresent: false,
  },
});

const oro5fDecisionNotIssuedFixture = fixture("oro5fDecisionNotIssuedFixture", {
  oro5fDecision: {
    actualPatchImplementationApprovalDecisionIssued: false,
  },
});

const oro5fApprovalNotGrantedFixture = fixture("oro5fApprovalNotGrantedFixture", {
  oro5fDecision: {
    actualPatchImplementationApprovalGranted: false,
  },
});

const oro5fApprovalWrongScopeFixture = fixture("oro5fApprovalWrongScopeFixture", {
  oro5fDecision: {
    actualPatchImplementationApprovalGrantScope:
      "actual_patch_implementation_execution",
  },
});

const authorizationRequestAlreadySubmittedFixture = fixture(
  "authorizationRequestAlreadySubmittedFixture",
  {
    requestState: {
      actualPatchImplementationAuthorizationRequestAlreadySubmittedBeforeOro5g: true,
    },
  }
);

const authorizationDecisionAlreadyIssuedFixture = fixture(
  "authorizationDecisionAlreadyIssuedFixture",
  {
    requestState: {
      actualPatchImplementationAuthorizationDecisionIssued: true,
    },
  }
);

const authorizationAlreadyGrantedFixture = fixture(
  "authorizationAlreadyGrantedFixture",
  {
    requestState: {
      actualPatchImplementationAuthorizationGranted: true,
    },
  }
);

const actualPatchImplementationAuthorizedUnexpectedlyFixture = fixture(
  "actualPatchImplementationAuthorizedUnexpectedlyFixture",
  {
    requestState: {
      actualPatchImplementationAuthorized: true,
    },
  }
);

const actualPatchImplementedUnexpectedlyFixture = fixture(
  "actualPatchImplementedUnexpectedlyFixture",
  {
    requestState: {
      actualPatchImplementationImplemented: true,
    },
  }
);

const routeMountPatchApprovedUnexpectedlyFixture = fixture(
  "routeMountPatchApprovedUnexpectedlyFixture",
  {
    requestState: {
      routeMountPatchApproved: true,
    },
  }
);

const patchImplementationAuthorizedUnexpectedlyFixture = fixture(
  "patchImplementationAuthorizedUnexpectedlyFixture",
  {
    requestState: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const patchImplementedUnexpectedlyFixture = fixture(
  "patchImplementedUnexpectedlyFixture",
  {
    requestState: {
      routeMountPatchImplemented: true,
    },
  }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  {
    requestState: {
      routeMountAuthorization: "authorized_for_mount",
    },
  }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  {
    requestState: {
      expressMountAllowed: true,
    },
  }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  {
    requestState: {
      publicAliasAllowed: true,
    },
  }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  {
    requestState: {
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

const authorizationRequestTriesAuthorizationDecisionFixture = fixture(
  "authorizationRequestTriesAuthorizationDecisionFixture",
  {
    implementationAttempt: {
      authorizationRequestTriesAuthorizationDecision: true,
    },
  }
);

const authorizationRequestTriesImplementationAuthorizationFixture = fixture(
  "authorizationRequestTriesImplementationAuthorizationFixture",
  {
    implementationAttempt: {
      authorizationRequestTriesImplementationAuthorization: true,
    },
  }
);

const authorizationRequestTriesActualPatchImplementationFixture = fixture(
  "authorizationRequestTriesActualPatchImplementationFixture",
  {
    implementationAttempt: {
      authorizationRequestTriesActualPatchImplementation: true,
    },
  }
);

const authorizationRequestTriesRouteMountAuthorizationFixture = fixture(
  "authorizationRequestTriesRouteMountAuthorizationFixture",
  {
    implementationAttempt: {
      authorizationRequestTriesRouteMountAuthorization: true,
    },
  }
);

const authorizationRequestTriesRuntimeTrafficApprovalFixture = fixture(
  "authorizationRequestTriesRuntimeTrafficApprovalFixture",
  {
    implementationAttempt: {
      authorizationRequestTriesRuntimeTrafficApproval: true,
    },
  }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  requestState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5gActualPatchImplementationAuthorizationRequestFixtures() {
  return [
    happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture,
    missingOro5fDecisionFixture,
    oro5fDecisionNotIssuedFixture,
    oro5fApprovalNotGrantedFixture,
    oro5fApprovalWrongScopeFixture,
    authorizationRequestAlreadySubmittedFixture,
    authorizationDecisionAlreadyIssuedFixture,
    authorizationAlreadyGrantedFixture,
    actualPatchImplementationAuthorizedUnexpectedlyFixture,
    actualPatchImplementedUnexpectedlyFixture,
    routeMountPatchApprovedUnexpectedlyFixture,
    patchImplementationAuthorizedUnexpectedlyFixture,
    patchImplementedUnexpectedlyFixture,
    routeMountAuthorizedUnexpectedlyFixture,
    expressMountAllowedUnexpectedlyFixture,
    publicAliasAllowedUnexpectedlyFixture,
    runtimeTrafficAllowedUnexpectedlyFixture,
    attemptedSrcAppJsEditFixture,
    attemptedRuntimeRouteControllerEditFixture,
    attemptedExpressMountFixture,
    attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
    authorizationRequestTriesAuthorizationDecisionFixture,
    authorizationRequestTriesImplementationAuthorizationFixture,
    authorizationRequestTriesActualPatchImplementationFixture,
    authorizationRequestTriesRouteMountAuthorizationFixture,
    authorizationRequestTriesRuntimeTrafficApprovalFixture,
    secretShapedOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualPatchImplementationAuthorizationRequestSubmittedFixture,
  missingOro5fDecisionFixture,
  oro5fDecisionNotIssuedFixture,
  oro5fApprovalNotGrantedFixture,
  oro5fApprovalWrongScopeFixture,
  authorizationRequestAlreadySubmittedFixture,
  authorizationDecisionAlreadyIssuedFixture,
  authorizationAlreadyGrantedFixture,
  actualPatchImplementationAuthorizedUnexpectedlyFixture,
  actualPatchImplementedUnexpectedlyFixture,
  routeMountPatchApprovedUnexpectedlyFixture,
  patchImplementationAuthorizedUnexpectedlyFixture,
  patchImplementedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  expressMountAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  attemptedSrcAppJsEditFixture,
  attemptedRuntimeRouteControllerEditFixture,
  attemptedExpressMountFixture,
  attemptedWalletLedgerPrismaDbMigrationExternalNetworkFixture,
  authorizationRequestTriesAuthorizationDecisionFixture,
  authorizationRequestTriesImplementationAuthorizationFixture,
  authorizationRequestTriesActualPatchImplementationFixture,
  authorizationRequestTriesRouteMountAuthorizationFixture,
  authorizationRequestTriesRuntimeTrafficApprovalFixture,
  secretShapedOutputFixture,
  cloneFixture,
  buildOro5gActualPatchImplementationAuthorizationRequestFixtures,
};
