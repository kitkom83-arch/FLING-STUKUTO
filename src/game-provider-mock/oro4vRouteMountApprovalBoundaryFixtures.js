"use strict";

const {
  buildOro4vRouteMountApprovalInput,
} = require("./oro4vRouteMountApprovalBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(buildOro4vRouteMountApprovalInput({ id, ...overrides }));
}

const happyPathApprovalBoundaryRecordedMountNotImplementedFixture = fixture(
  "happyPathApprovalBoundaryRecordedMountNotImplementedFixture"
);

const missingOro4uFinalDecisionFixture = fixture("missingOro4uFinalDecisionFixture", {
  oro4uFinalDecision: {
    finalPreMountAuthorizationDecisionIssued: false,
  },
});

const missingOro4tRequestSubmissionFixture = fixture(
  "missingOro4tRequestSubmissionFixture",
  {
    mountAuthorizationRequestSubmission: {
      submitted: false,
    },
  }
);

const missingSignedApprovalRecordFixture = fixture("missingSignedApprovalRecordFixture", {
  signedApprovalRecord: {
    present: false,
    verifiedForIntake: false,
    acceptedForMountRequestPreparation: false,
  },
});

const missingPrivateArtifactHashRegistryFixture = fixture(
  "missingPrivateArtifactHashRegistryFixture",
  {
    artifactRegistryMetadata: {
      ownerSignedApprovalArtifactPrivateHashRegistered: false,
    },
  }
);

const missingRouteMountReviewerFixture = fixture("missingRouteMountReviewerFixture", {
  routeMountApproval: {
    reviewer: "",
  },
});

const missingApprovalTimestampFixture = fixture("missingApprovalTimestampFixture", {
  routeMountApproval: {
    approvalTimestamp: "",
  },
});

const attemptedSrcAppJsEditFixture = fixture("attemptedSrcAppJsEditFixture", {
  implementationPlan: {
    srcAppJsEditAttempted: true,
  },
});

const attemptedExpressMountAuthorizationFixture = fixture(
  "attemptedExpressMountAuthorizationFixture",
  {
    routeMountApproval: {
      expressMountAllowed: true,
    },
  }
);

const attemptedExpressMountImplementationFixture = fixture(
  "attemptedExpressMountImplementationFixture",
  {
    routeMountApproval: {
      expressMountAllowed: true,
      expressMountImplemented: true,
    },
    implementationPlan: {
      expressMountAttempted: true,
    },
  }
);

const attemptedPublicAliasAuthorizationFixture = fixture(
  "attemptedPublicAliasAuthorizationFixture",
  {
    routeMountApproval: {
      publicAliasAllowed: true,
    },
    implementationPlan: {
      publicAliasAttempted: true,
    },
  }
);

const attemptedRuntimeTrafficAuthorizationFixture = fixture(
  "attemptedRuntimeTrafficAuthorizationFixture",
  {
    routeMountApproval: {
      runtimeTrafficAllowed: true,
    },
    implementationPlan: {
      runtimeTrafficAttempted: true,
    },
  }
);

const attemptedWalletMutationFixture = fixture("attemptedWalletMutationFixture", {
  attemptedAuthorizationStates: {
    walletMutationAllowed: true,
  },
});

const attemptedLedgerMutationFixture = fixture("attemptedLedgerMutationFixture", {
  attemptedAuthorizationStates: {
    ledgerMutationAllowed: true,
  },
});

const attemptedPrismaWriteFixture = fixture("attemptedPrismaWriteFixture", {
  attemptedAuthorizationStates: {
    prismaWriteAllowed: true,
  },
});

const attemptedExternalNetworkFixture = fixture("attemptedExternalNetworkFixture", {
  attemptedAuthorizationStates: {
    externalNetworkAttempted: true,
    externalNetworkAllowed: true,
  },
});

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  routeMountApproval: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const staleApprovalTimestampFixture = fixture("staleApprovalTimestampFixture", {
  routeMountApproval: {
    approvalTimestamp: "2026-06-04T04:00:00.000Z",
  },
});

const approvalBoundaryRecordedSeparateImplementationRequiredFixture = fixture(
  "approvalBoundaryRecordedSeparateImplementationRequiredFixture",
  {
    routeMountApproval: {
      boundaryPresent: true,
      separateImplementationPhaseRequired: true,
      nextPhaseRequiresSeparateImplementationApproval: true,
    },
  }
);

function buildOro4vRouteMountApprovalFixtures() {
  return [
    happyPathApprovalBoundaryRecordedMountNotImplementedFixture,
    missingOro4uFinalDecisionFixture,
    missingOro4tRequestSubmissionFixture,
    missingSignedApprovalRecordFixture,
    missingPrivateArtifactHashRegistryFixture,
    missingRouteMountReviewerFixture,
    missingApprovalTimestampFixture,
    attemptedSrcAppJsEditFixture,
    attemptedExpressMountAuthorizationFixture,
    attemptedExpressMountImplementationFixture,
    attemptedPublicAliasAuthorizationFixture,
    attemptedRuntimeTrafficAuthorizationFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    attemptedExternalNetworkFixture,
    secretShapedOutputFixture,
    staleApprovalTimestampFixture,
    approvalBoundaryRecordedSeparateImplementationRequiredFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathApprovalBoundaryRecordedMountNotImplementedFixture,
  missingOro4uFinalDecisionFixture,
  missingOro4tRequestSubmissionFixture,
  missingSignedApprovalRecordFixture,
  missingPrivateArtifactHashRegistryFixture,
  missingRouteMountReviewerFixture,
  missingApprovalTimestampFixture,
  attemptedSrcAppJsEditFixture,
  attemptedExpressMountAuthorizationFixture,
  attemptedExpressMountImplementationFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedExternalNetworkFixture,
  secretShapedOutputFixture,
  staleApprovalTimestampFixture,
  approvalBoundaryRecordedSeparateImplementationRequiredFixture,
  cloneFixture,
  buildOro4vRouteMountApprovalFixtures,
};
