"use strict";

const {
  buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput,
} = require("./oroplayCallbackStagingRouteMountAuthorizationRequestSubmissionFinalDecisionReviewBoundary");

const BASELINE_SHA256_CHUNKS = Object.freeze([
  "E5831182",
  "83A4A30C",
  "B3E506D5",
  "F880B4E1",
  "FCB1CCF1",
  "2DB4AB46",
  "84E12D6D",
  "7F6E62EE",
]);

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildMountAuthorizationRequestSubmissionFinalDecisionReviewInput({ id, ...overrides })
  );
}

const baselineMountAuthorizationRequestSubmissionFinalDecisionReviewFixture = fixture(
  "baselineMountAuthorizationRequestSubmissionFinalDecisionReviewFixture"
);

const missingSignedApprovalRecordFixture = fixture("missingSignedApprovalRecordFixture", {
  signedApprovalRecord: {
    created: false,
    present: false,
    verifiedForIntake: false,
    acceptedForMountRequestPreparation: false,
  },
});

const missingArtifactHashRegistryFixture = fixture("missingArtifactHashRegistryFixture", {
  privateArtifactEvidence: {
    ownerSignedApprovalArtifactPrivateHashRegistered: false,
  },
});

const missingHashChunksFixture = fixture("missingHashChunksFixture", {
  artifactRegistryMetadata: {
    sha256Chunks: [],
  },
});

const invalidHashChunkFixture = fixture("invalidHashChunkFixture", {
  artifactRegistryMetadata: {
    sha256Chunks: [
      "E5831182",
      "83A4A30C",
      "B3E506D5",
      "F880B4E1",
      "FCB1CCF1",
      "2DB4AB46",
      "84E12D6D",
      "NOTHEX!!",
    ],
  },
});

const fullHashLiteralFixture = fixture("fullHashLiteralFixture", {
  artifactRegistryMetadata: {
    hashForStaticDisplay: BASELINE_SHA256_CHUNKS.join(""),
  },
});

const localAbsolutePathFixture = fixture("localAbsolutePathFixture", {
  artifactRegistryMetadata: {
    sanitizedPrivateStorageRef: ["C:", "Users", "mock-user", "PG77-approvals", "ORO-4Q"].join("\\"),
  },
});

const artifactCommittedToRepoFixture = fixture("artifactCommittedToRepoFixture", {
  artifactRegistryMetadata: {
    artifactCommittedToRepo: true,
  },
});

const signatureCommittedToRepoFixture = fixture("signatureCommittedToRepoFixture", {
  artifactRegistryMetadata: {
    signatureCommittedToRepo: true,
  },
});

const signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture = fixture(
  "signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture",
  {
    signedApprovalRecord: {
      acceptedAsRouteMountAuthorization: true,
    },
  }
);

const mountAuthorizationRequestNotPreparedFixture = fixture(
  "mountAuthorizationRequestNotPreparedFixture",
  {
    mountAuthorizationRequestSubmission: {
      prepared: false,
    },
  }
);

const mountAuthorizationRequestNotSubmittedFixture = fixture(
  "mountAuthorizationRequestNotSubmittedFixture",
  {
    mountAuthorizationRequestSubmission: {
      submitted: false,
      status: "prepared_not_submitted",
    },
  }
);

const externalMountAuthorizationRequestSubmittedFixture = fixture(
  "externalMountAuthorizationRequestSubmittedFixture",
  {
    mountAuthorizationRequestSubmission: {
      externalSubmitted: true,
    },
    attemptedAuthorizationStates: {
      externalMountAuthorizationRequestSubmitted: true,
    },
  }
);

const finalDecisionReviewMissingFixture = fixture("finalDecisionReviewMissingFixture", {
  finalPreMountAuthorizationDecisionReview: {
    prepared: false,
    status: "review_missing",
  },
});

const finalDecisionIssuedPrematureFixture = fixture("finalDecisionIssuedPrematureFixture", {
  finalPreMountAuthorizationDecisionReview: {
    finalDecisionIssued: true,
  },
});

const attemptedExpressMountFixture = fixture("attemptedExpressMountFixture", {
  authorizationState: {
    expressMountAllowed: true,
  },
  attemptedAuthorizationStates: {
    liveRouteAllowed: true,
  },
});

const attemptedPublicAliasFixture = fixture("attemptedPublicAliasFixture", {
  authorizationState: {
    publicAliasAllowed: true,
  },
});

const attemptedRuntimeTrafficFixture = fixture("attemptedRuntimeTrafficFixture", {
  authorizationState: {
    runtimeTrafficAllowed: true,
  },
  attemptedAuthorizationStates: {
    runtimeTrafficAllowed: true,
  },
});

const walletMutationAllowedFixture = fixture("walletMutationAllowedFixture", {
  attemptedAuthorizationStates: {
    walletMutationAllowed: true,
  },
});

const ledgerMutationAllowedFixture = fixture("ledgerMutationAllowedFixture", {
  attemptedAuthorizationStates: {
    ledgerMutationAllowed: true,
  },
});

function buildMountAuthorizationRequestSubmissionFinalDecisionReviewFixtures() {
  return [
    baselineMountAuthorizationRequestSubmissionFinalDecisionReviewFixture,
    missingSignedApprovalRecordFixture,
    missingArtifactHashRegistryFixture,
    missingHashChunksFixture,
    invalidHashChunkFixture,
    fullHashLiteralFixture,
    localAbsolutePathFixture,
    artifactCommittedToRepoFixture,
    signatureCommittedToRepoFixture,
    signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture,
    mountAuthorizationRequestNotPreparedFixture,
    mountAuthorizationRequestNotSubmittedFixture,
    externalMountAuthorizationRequestSubmittedFixture,
    finalDecisionReviewMissingFixture,
    finalDecisionIssuedPrematureFixture,
    attemptedExpressMountFixture,
    attemptedPublicAliasFixture,
    attemptedRuntimeTrafficFixture,
    walletMutationAllowedFixture,
    ledgerMutationAllowedFixture,
  ].map(cloneFixture);
}

module.exports = {
  baselineMountAuthorizationRequestSubmissionFinalDecisionReviewFixture,
  missingSignedApprovalRecordFixture,
  missingArtifactHashRegistryFixture,
  missingHashChunksFixture,
  invalidHashChunkFixture,
  fullHashLiteralFixture,
  localAbsolutePathFixture,
  artifactCommittedToRepoFixture,
  signatureCommittedToRepoFixture,
  signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture,
  mountAuthorizationRequestNotPreparedFixture,
  mountAuthorizationRequestNotSubmittedFixture,
  externalMountAuthorizationRequestSubmittedFixture,
  finalDecisionReviewMissingFixture,
  finalDecisionIssuedPrematureFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  walletMutationAllowedFixture,
  ledgerMutationAllowedFixture,
  cloneFixture,
  buildMountAuthorizationRequestSubmissionFinalDecisionReviewFixtures,
};
