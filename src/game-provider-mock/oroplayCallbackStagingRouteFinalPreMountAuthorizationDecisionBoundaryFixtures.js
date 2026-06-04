"use strict";

const {
  buildOro4uFinalPreMountDecisionInput,
} = require("./oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(buildOro4uFinalPreMountDecisionInput({ id, ...overrides }));
}

const happyPathDecisionRecordedMountNotAuthorizedFixture = fixture(
  "happyPathDecisionRecordedMountNotAuthorizedFixture"
);

const missingOro4tRequestSubmissionFixture = fixture("missingOro4tRequestSubmissionFixture", {
  mountAuthorizationRequestSubmission: {
    submitted: false,
  },
});

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

const missingReviewerFixture = fixture("missingReviewerFixture", {
  finalPreMountAuthorizationDecision: {
    reviewer: "",
  },
});

const missingDecisionTimestampFixture = fixture("missingDecisionTimestampFixture", {
  finalPreMountAuthorizationDecision: {
    decisionTimestamp: "",
  },
});

const attemptedExpressMountAuthorizationFixture = fixture(
  "attemptedExpressMountAuthorizationFixture",
  {
    finalPreMountAuthorizationDecision: {
      expressMountAuthorizationRequested: true,
    },
    authorizationState: {
      expressMountAllowed: true,
    },
  }
);

const attemptedPublicAliasAuthorizationFixture = fixture(
  "attemptedPublicAliasAuthorizationFixture",
  {
    authorizationState: {
      publicAliasAllowed: true,
    },
  }
);

const attemptedRuntimeTrafficAuthorizationFixture = fixture(
  "attemptedRuntimeTrafficAuthorizationFixture",
  {
    authorizationState: {
      runtimeTrafficAllowed: true,
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

const externalNetworkAttemptFixture = fixture("externalNetworkAttemptFixture", {
  attemptedAuthorizationStates: {
    externalNetworkAttempted: true,
  },
});

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  finalPreMountAuthorizationDecision: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

const staleDecisionTimestampFixture = fixture("staleDecisionTimestampFixture", {
  finalPreMountAuthorizationDecision: {
    decisionTimestamp: "2026-06-03T01:00:00.000Z",
  },
});

const finalDecisionIssuedSeparateRouteApprovalRequiredFixture = fixture(
  "finalDecisionIssuedSeparateRouteApprovalRequiredFixture",
  {
    authorizationState: {
      separateRouteMountApprovalPresent: false,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
    },
  }
);

function buildOro4uFinalPreMountDecisionFixtures() {
  return [
    happyPathDecisionRecordedMountNotAuthorizedFixture,
    missingOro4tRequestSubmissionFixture,
    missingSignedApprovalRecordFixture,
    missingPrivateArtifactHashRegistryFixture,
    missingReviewerFixture,
    missingDecisionTimestampFixture,
    attemptedExpressMountAuthorizationFixture,
    attemptedPublicAliasAuthorizationFixture,
    attemptedRuntimeTrafficAuthorizationFixture,
    attemptedWalletMutationFixture,
    attemptedLedgerMutationFixture,
    attemptedPrismaWriteFixture,
    externalNetworkAttemptFixture,
    secretShapedOutputFixture,
    staleDecisionTimestampFixture,
    finalDecisionIssuedSeparateRouteApprovalRequiredFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathDecisionRecordedMountNotAuthorizedFixture,
  missingOro4tRequestSubmissionFixture,
  missingSignedApprovalRecordFixture,
  missingPrivateArtifactHashRegistryFixture,
  missingReviewerFixture,
  missingDecisionTimestampFixture,
  attemptedExpressMountAuthorizationFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedWalletMutationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  externalNetworkAttemptFixture,
  secretShapedOutputFixture,
  staleDecisionTimestampFixture,
  finalDecisionIssuedSeparateRouteApprovalRequiredFixture,
  cloneFixture,
  buildOro4uFinalPreMountDecisionFixtures,
};
