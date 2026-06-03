"use strict";

const {
  buildSignedApprovalArtifactPrivateHashRegistryInput,
} = require("./oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry");

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
  return Object.freeze(buildSignedApprovalArtifactPrivateHashRegistryInput({ id, ...overrides }));
}

const baselineOwnerSignedApprovalArtifactPrivateHashFixture = fixture(
  "baselineOwnerSignedApprovalArtifactPrivateHashFixture"
);

const missingHashChunksFixture = fixture("missingHashChunksFixture", {
  documentMetadata: {
    sha256Chunks: [],
  },
});

const invalidHashChunkFixture = fixture("invalidHashChunkFixture", {
  documentMetadata: {
    sha256Chunks: ["E5831182", "83A4A30C", "B3E506D5", "F880B4E1", "FCB1CCF1", "2DB4AB46", "84E12D6D", "NOTHEX!!"],
  },
});

const fullHashLiteralFixture = fixture("fullHashLiteralFixture", {
  documentMetadata: {
    hashForStaticDisplay: BASELINE_SHA256_CHUNKS.join(""),
  },
});

const localAbsolutePathFixture = fixture("localAbsolutePathFixture", {
  documentMetadata: {
    sanitizedPrivateStorageRef: ["C:", "Users", "mock-user", "PG77-approvals", "ORO-4Q"].join("\\"),
  },
});

const artifactCommittedToRepoFixture = fixture("artifactCommittedToRepoFixture", {
  documentMetadata: {
    artifactCommittedToRepo: true,
  },
});

const signatureCommittedToRepoFixture = fixture("signatureCommittedToRepoFixture", {
  documentMetadata: {
    signatureCommittedToRepo: true,
  },
});

const acceptedAsMountAuthorizationFixture = fixture("acceptedAsMountAuthorizationFixture", {
  privateArtifactEvidence: {
    signedApprovalArtifactAcceptedAsMountAuthorization: true,
  },
});

const signedApprovalRecordPrematureFixture = fixture("signedApprovalRecordPrematureFixture", {
  signedApprovalRecord: {
    present: true,
    separateSignedApprovalRecordPhaseCompleted: false,
  },
});

const finalDecisionIssuedPrematureFixture = fixture("finalDecisionIssuedPrematureFixture", {
  finalPreMountAuthorizationDecision: {
    issued: true,
  },
});

const mountAuthorizationRequestSubmittedPrematureFixture = fixture(
  "mountAuthorizationRequestSubmittedPrematureFixture",
  {
    mountAuthorizationRequest: {
      submitted: true,
    },
  }
);

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
    walletMutationAllowed: true,
    ledgerMutationAllowed: true,
  },
});

const chatApprovalOnlyFixture = fixture("chatApprovalOnlyFixture", {
  privateArtifactEvidence: {
    ownerSignedApprovalArtifactPrivateHashRegistered: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAcceptedForIntake: false,
  },
  approvalCandidates: {
    chatApproval: {
      present: true,
      countedAsSignedApprovalArtifact: true,
      value: "mock-approval-placeholder",
    },
  },
  attemptedAuthorizationStates: {
    actualSignedApprovalArtifactSource: "chat_approval",
  },
});

const plainTextApprovalOnlyFixture = fixture("plainTextApprovalOnlyFixture", {
  privateArtifactEvidence: {
    ownerSignedApprovalArtifactPrivateHashRegistered: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAcceptedForIntake: false,
  },
  approvalCandidates: {
    plainTextApproval: {
      present: true,
      countedAsSignedApprovalArtifact: true,
      value: "mock-approval-placeholder",
    },
  },
  attemptedAuthorizationStates: {
    actualSignedApprovalArtifactSource: "plain_text_approval",
  },
});

const mockArtifactOnlyFixture = fixture("mockArtifactOnlyFixture", {
  privateArtifactEvidence: {
    ownerSignedApprovalArtifactPrivateHashRegistered: false,
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAcceptedForIntake: false,
    signedApprovalArtifactAcceptedAsMountAuthorization: true,
  },
  approvalCandidates: {
    mockSignedApprovalArtifact: {
      present: true,
      artifactId: "mock-review-only-artifact-id",
      reviewOnly: false,
      acceptedAsActualAuthorization: true,
    },
  },
  attemptedAuthorizationStates: {
    actualSignedApprovalArtifactSource: "mock_signed_artifact",
  },
});

function buildSignedApprovalArtifactPrivateHashRegistryFixtures() {
  return [
    baselineOwnerSignedApprovalArtifactPrivateHashFixture,
    missingHashChunksFixture,
    invalidHashChunkFixture,
    fullHashLiteralFixture,
    localAbsolutePathFixture,
    artifactCommittedToRepoFixture,
    signatureCommittedToRepoFixture,
    acceptedAsMountAuthorizationFixture,
    signedApprovalRecordPrematureFixture,
    finalDecisionIssuedPrematureFixture,
    mountAuthorizationRequestSubmittedPrematureFixture,
    attemptedExpressMountFixture,
    attemptedPublicAliasFixture,
    attemptedRuntimeTrafficFixture,
    chatApprovalOnlyFixture,
    plainTextApprovalOnlyFixture,
    mockArtifactOnlyFixture,
  ].map(cloneFixture);
}

module.exports = {
  baselineOwnerSignedApprovalArtifactPrivateHashFixture,
  missingHashChunksFixture,
  invalidHashChunkFixture,
  fullHashLiteralFixture,
  localAbsolutePathFixture,
  artifactCommittedToRepoFixture,
  signatureCommittedToRepoFixture,
  acceptedAsMountAuthorizationFixture,
  signedApprovalRecordPrematureFixture,
  finalDecisionIssuedPrematureFixture,
  mountAuthorizationRequestSubmittedPrematureFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  chatApprovalOnlyFixture,
  plainTextApprovalOnlyFixture,
  mockArtifactOnlyFixture,
  cloneFixture,
  buildSignedApprovalArtifactPrivateHashRegistryFixtures,
};
