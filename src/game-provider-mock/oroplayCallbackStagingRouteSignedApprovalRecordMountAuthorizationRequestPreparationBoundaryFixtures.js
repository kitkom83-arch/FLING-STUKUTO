"use strict";

const {
  buildSignedApprovalRecordMountAuthorizationRequestPreparationInput,
} = require("./oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundary");

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
    buildSignedApprovalRecordMountAuthorizationRequestPreparationInput({ id, ...overrides })
  );
}

const baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture = fixture(
  "baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture"
);

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
    sha256Chunks: ["E5831182", "83A4A30C", "B3E506D5", "F880B4E1", "FCB1CCF1", "2DB4AB46", "84E12D6D", "NOTHEX!!"],
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

const signedApprovalRecordMissingFixture = fixture("signedApprovalRecordMissingFixture", {
  signedApprovalRecord: {
    created: false,
    present: false,
    verifiedForIntake: false,
    acceptedForMountRequestPreparation: false,
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

const mountAuthorizationRequestNotPreparedFixture = fixture("mountAuthorizationRequestNotPreparedFixture", {
  mountAuthorizationRequestDraft: {
    prepared: false,
  },
});

const mountAuthorizationRequestSubmittedPrematureFixture = fixture(
  "mountAuthorizationRequestSubmittedPrematureFixture",
  {
    mountAuthorizationRequestDraft: {
      submitted: true,
    },
  }
);

const mountAuthorizationRequestSubmissionAllowedFixture = fixture(
  "mountAuthorizationRequestSubmissionAllowedFixture",
  {
    mountAuthorizationRequestDraft: {
      submissionAllowed: true,
    },
  }
);

const finalDecisionIssuedPrematureFixture = fixture("finalDecisionIssuedPrematureFixture", {
  finalPreMountAuthorizationDecision: {
    issued: true,
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

function buildSignedApprovalRecordMountAuthorizationRequestPreparationFixtures() {
  return [
    baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture,
    missingArtifactHashRegistryFixture,
    missingHashChunksFixture,
    invalidHashChunkFixture,
    fullHashLiteralFixture,
    localAbsolutePathFixture,
    artifactCommittedToRepoFixture,
    signatureCommittedToRepoFixture,
    signedApprovalRecordMissingFixture,
    signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture,
    mountAuthorizationRequestNotPreparedFixture,
    mountAuthorizationRequestSubmittedPrematureFixture,
    mountAuthorizationRequestSubmissionAllowedFixture,
    finalDecisionIssuedPrematureFixture,
    attemptedExpressMountFixture,
    attemptedPublicAliasFixture,
    attemptedRuntimeTrafficFixture,
    walletMutationAllowedFixture,
    ledgerMutationAllowedFixture,
  ].map(cloneFixture);
}

module.exports = {
  baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture,
  missingArtifactHashRegistryFixture,
  missingHashChunksFixture,
  invalidHashChunkFixture,
  fullHashLiteralFixture,
  localAbsolutePathFixture,
  artifactCommittedToRepoFixture,
  signatureCommittedToRepoFixture,
  signedApprovalRecordMissingFixture,
  signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture,
  mountAuthorizationRequestNotPreparedFixture,
  mountAuthorizationRequestSubmittedPrematureFixture,
  mountAuthorizationRequestSubmissionAllowedFixture,
  finalDecisionIssuedPrematureFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  walletMutationAllowedFixture,
  ledgerMutationAllowedFixture,
  cloneFixture,
  buildSignedApprovalRecordMountAuthorizationRequestPreparationFixtures,
};
