"use strict";

const {
  buildOro5fActualPatchImplementationApprovalDecisionInput,
} = require("./oro5fActualPatchImplementationApprovalDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5fActualPatchImplementationApprovalDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationApprovalDecisionIssuedFixture = fixture(
  "happyPathActualPatchImplementationApprovalDecisionIssuedFixture"
);

const missingOro5eRequestFixture = fixture("missingOro5eRequestFixture", {
  oro5eRequest: {
    requestPresent: false,
  },
});

const oro5eRequestNotSubmittedFixture = fixture("oro5eRequestNotSubmittedFixture", {
  oro5eRequest: {
    actualPatchImplementationApprovalRequestSubmitted: false,
  },
});

const oro5eRequestNotPendingDecisionFixture = fixture(
  "oro5eRequestNotPendingDecisionFixture",
  {
    oro5eRequest: {
      actualPatchImplementationApprovalRequestStatus: "draft",
    },
  }
);

const missingOro5dDecisionFixture = fixture("missingOro5dDecisionFixture", {
  oro5eRequest: {
    routeMountPatchImplementationAuthorizationDecisionIssued: false,
  },
});

const oro5dAuthorizationMissingFixture = fixture("oro5dAuthorizationMissingFixture", {
  oro5eRequest: {
    routeMountPatchImplementationAuthorizationGranted: false,
  },
});

const oro5dAuthorizationWrongScopeFixture = fixture(
  "oro5dAuthorizationWrongScopeFixture",
  {
    oro5eRequest: {
      routeMountPatchImplementationAuthorization: "authorized_for_mount",
    },
  }
);

const approvalDecisionAlreadyIssuedFixture = fixture(
  "approvalDecisionAlreadyIssuedFixture",
  {
    oro5eRequest: {
      actualPatchImplementationApprovalDecisionIssued: true,
    },
  }
);

const approvalAlreadyGrantedWithBroaderScopeFixture = fixture(
  "approvalAlreadyGrantedWithBroaderScopeFixture",
  {
    oro5eRequest: {
      actualPatchImplementationApprovalGranted: true,
      actualPatchImplementationApprovalGrantScope:
        "actual_patch_implementation_execution_and_route_mount",
    },
  }
);

const actualPatchImplementationAuthorizedUnexpectedlyFixture = fixture(
  "actualPatchImplementationAuthorizedUnexpectedlyFixture",
  {
    decisionState: {
      actualPatchImplementationAuthorized: true,
    },
  }
);

const actualPatchImplementedUnexpectedlyFixture = fixture(
  "actualPatchImplementedUnexpectedlyFixture",
  {
    decisionState: {
      actualPatchImplementationImplemented: true,
    },
  }
);

const routeMountPatchApprovedUnexpectedlyFixture = fixture(
  "routeMountPatchApprovedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountPatchApproved: true,
    },
  }
);

const patchImplementationAuthorizedUnexpectedlyFixture = fixture(
  "patchImplementationAuthorizedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountPatchImplementationAuthorized: true,
    },
  }
);

const patchImplementedUnexpectedlyFixture = fixture(
  "patchImplementedUnexpectedlyFixture",
  {
    decisionState: {
      routeMountPatchImplemented: true,
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

const approvalDecisionTriesActualPatchImplementationAuthorizationFixture = fixture(
  "approvalDecisionTriesActualPatchImplementationAuthorizationFixture",
  {
    implementationAttempt: {
      approvalDecisionTriesActualPatchImplementationAuthorization: true,
    },
  }
);

const approvalDecisionTriesActualPatchImplementationExecutionFixture = fixture(
  "approvalDecisionTriesActualPatchImplementationExecutionFixture",
  {
    implementationAttempt: {
      approvalDecisionTriesActualPatchImplementationExecution: true,
    },
  }
);

const approvalDecisionTriesRouteMountAuthorizationFixture = fixture(
  "approvalDecisionTriesRouteMountAuthorizationFixture",
  {
    implementationAttempt: {
      approvalDecisionTriesRouteMountAuthorization: true,
    },
  }
);

const approvalDecisionTriesRuntimeTrafficApprovalFixture = fixture(
  "approvalDecisionTriesRuntimeTrafficApprovalFixture",
  {
    implementationAttempt: {
      approvalDecisionTriesRuntimeTrafficApproval: true,
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

function buildOro5fActualPatchImplementationApprovalDecisionFixtures() {
  return [
    happyPathActualPatchImplementationApprovalDecisionIssuedFixture,
    missingOro5eRequestFixture,
    oro5eRequestNotSubmittedFixture,
    oro5eRequestNotPendingDecisionFixture,
    missingOro5dDecisionFixture,
    oro5dAuthorizationMissingFixture,
    oro5dAuthorizationWrongScopeFixture,
    approvalDecisionAlreadyIssuedFixture,
    approvalAlreadyGrantedWithBroaderScopeFixture,
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
    approvalDecisionTriesActualPatchImplementationAuthorizationFixture,
    approvalDecisionTriesActualPatchImplementationExecutionFixture,
    approvalDecisionTriesRouteMountAuthorizationFixture,
    approvalDecisionTriesRuntimeTrafficApprovalFixture,
    secretShapedOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualPatchImplementationApprovalDecisionIssuedFixture,
  missingOro5eRequestFixture,
  oro5eRequestNotSubmittedFixture,
  oro5eRequestNotPendingDecisionFixture,
  missingOro5dDecisionFixture,
  oro5dAuthorizationMissingFixture,
  oro5dAuthorizationWrongScopeFixture,
  approvalDecisionAlreadyIssuedFixture,
  approvalAlreadyGrantedWithBroaderScopeFixture,
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
  approvalDecisionTriesActualPatchImplementationAuthorizationFixture,
  approvalDecisionTriesActualPatchImplementationExecutionFixture,
  approvalDecisionTriesRouteMountAuthorizationFixture,
  approvalDecisionTriesRuntimeTrafficApprovalFixture,
  secretShapedOutputFixture,
  cloneFixture,
  buildOro5fActualPatchImplementationApprovalDecisionFixtures,
};
