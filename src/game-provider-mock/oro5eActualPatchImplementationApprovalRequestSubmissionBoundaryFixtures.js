"use strict";

const {
  buildOro5eActualPatchImplementationApprovalRequestInput,
} = require("./oro5eActualPatchImplementationApprovalRequestSubmissionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5eActualPatchImplementationApprovalRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationApprovalRequestSubmittedFixture = fixture(
  "happyPathActualPatchImplementationApprovalRequestSubmittedFixture"
);

const missingOro5dDecisionFixture = fixture("missingOro5dDecisionFixture", {
  oro5dDecision: {
    decisionPresent: false,
  },
});

const oro5dDecisionNotIssuedFixture = fixture("oro5dDecisionNotIssuedFixture", {
  oro5dDecision: {
    routeMountPatchImplementationAuthorizationDecisionIssued: false,
  },
});

const oro5dAuthorizationMissingFixture = fixture("oro5dAuthorizationMissingFixture", {
  oro5dDecision: {
    routeMountPatchImplementationAuthorizationGranted: false,
  },
});

const oro5dAuthorizationWrongScopeFixture = fixture(
  "oro5dAuthorizationWrongScopeFixture",
  {
    oro5dDecision: {
      routeMountPatchImplementationAuthorization: "authorized_for_mount",
    },
  }
);

const actualPatchApprovalRequestAlreadySubmittedFixture = fixture(
  "actualPatchApprovalRequestAlreadySubmittedFixture",
  {
    requestState: {
      actualPatchImplementationApprovalRequestAlreadySubmittedBeforeOro5e: true,
    },
  }
);

const actualPatchApprovalDecisionAlreadyIssuedFixture = fixture(
  "actualPatchApprovalDecisionAlreadyIssuedFixture",
  {
    requestState: {
      actualPatchImplementationApprovalDecisionIssued: true,
    },
  }
);

const actualPatchApprovalGrantedFixture = fixture(
  "actualPatchApprovalGrantedFixture",
  {
    requestState: {
      actualPatchImplementationApprovalGranted: true,
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

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  requestState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const approvalRequestTriesActualImplementationApprovalFixture = fixture(
  "approvalRequestTriesActualImplementationApprovalFixture",
  {
    implementationAttempt: {
      approvalRequestTriesActualImplementationApproval: true,
    },
  }
);

const approvalRequestTriesRouteMountAuthorizationFixture = fixture(
  "approvalRequestTriesRouteMountAuthorizationFixture",
  {
    implementationAttempt: {
      approvalRequestTriesRouteMountAuthorization: true,
    },
  }
);

const approvalRequestTriesRuntimeTrafficApprovalFixture = fixture(
  "approvalRequestTriesRuntimeTrafficApprovalFixture",
  {
    implementationAttempt: {
      approvalRequestTriesRuntimeTrafficApproval: true,
    },
  }
);

function buildOro5eActualPatchImplementationApprovalRequestFixtures() {
  return [
    happyPathActualPatchImplementationApprovalRequestSubmittedFixture,
    missingOro5dDecisionFixture,
    oro5dDecisionNotIssuedFixture,
    oro5dAuthorizationMissingFixture,
    oro5dAuthorizationWrongScopeFixture,
    actualPatchApprovalRequestAlreadySubmittedFixture,
    actualPatchApprovalDecisionAlreadyIssuedFixture,
    actualPatchApprovalGrantedFixture,
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
    secretShapedOutputFixture,
    approvalRequestTriesActualImplementationApprovalFixture,
    approvalRequestTriesRouteMountAuthorizationFixture,
    approvalRequestTriesRuntimeTrafficApprovalFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualPatchImplementationApprovalRequestSubmittedFixture,
  missingOro5dDecisionFixture,
  oro5dDecisionNotIssuedFixture,
  oro5dAuthorizationMissingFixture,
  oro5dAuthorizationWrongScopeFixture,
  actualPatchApprovalRequestAlreadySubmittedFixture,
  actualPatchApprovalDecisionAlreadyIssuedFixture,
  actualPatchApprovalGrantedFixture,
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
  secretShapedOutputFixture,
  approvalRequestTriesActualImplementationApprovalFixture,
  approvalRequestTriesRouteMountAuthorizationFixture,
  approvalRequestTriesRuntimeTrafficApprovalFixture,
  cloneFixture,
  buildOro5eActualPatchImplementationApprovalRequestFixtures,
};
