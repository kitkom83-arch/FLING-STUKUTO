"use strict";

const { buildMountAuthorizationHoldGateInput } = require("./oroplayCallbackStagingRouteMountAuthorizationHoldGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(buildMountAuthorizationHoldGateInput({ id, ...overrides }));
}

const baselinePendingActualSignedApprovalArtifactFixture = fixture(
  "baselinePendingActualSignedApprovalArtifactFixture"
);

const chatApprovalOnlyFixture = fixture("chatApprovalOnlyFixture", {
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

const mockSignedArtifactReviewOnlyFixture = fixture("mockSignedArtifactReviewOnlyFixture", {
  approvalCandidates: {
    mockSignedApprovalArtifact: {
      present: true,
      artifactId: "mock-review-only-artifact-id",
      reviewOnly: true,
      acceptedAsActualAuthorization: false,
    },
  },
});

const missingSignedApprovalRecordFixture = fixture("missingSignedApprovalRecordFixture", {
  signedApprovalRecord: {
    present: false,
    recordType: null,
  },
});

const decisionPackPreparedButNotIssuedFixture = fixture("decisionPackPreparedButNotIssuedFixture", {
  sourceAcceptanceReviewBoundary: {
    finalPreMountAuthorizationDecisionPrepared: true,
    finalPreMountAuthorizationDecisionIssued: false,
  },
});

const evidencePackPreparedButNotSubmittedFixture = fixture("evidencePackPreparedButNotSubmittedFixture", {
  mountAuthorizationEvidencePack: {
    prepared: true,
    submitted: false,
  },
});

const mountAuthorizationRequestNotSubmittedFixture = fixture("mountAuthorizationRequestNotSubmittedFixture", {
  mountAuthorizationRequest: {
    submitted: false,
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
    walletMutationAllowed: true,
    ledgerMutationAllowed: true,
  },
});

const attemptedFinalDecisionWithoutActualArtifactFixture = fixture(
  "attemptedFinalDecisionWithoutActualArtifactFixture",
  {
    sourceAcceptanceReviewBoundary: {
      finalPreMountAuthorizationDecisionIssued: true,
    },
  }
);

function buildMountAuthorizationHoldGateFixtures() {
  return [
    baselinePendingActualSignedApprovalArtifactFixture,
    chatApprovalOnlyFixture,
    plainTextApprovalOnlyFixture,
    mockSignedArtifactReviewOnlyFixture,
    missingSignedApprovalRecordFixture,
    decisionPackPreparedButNotIssuedFixture,
    evidencePackPreparedButNotSubmittedFixture,
    mountAuthorizationRequestNotSubmittedFixture,
    attemptedExpressMountFixture,
    attemptedPublicAliasFixture,
    attemptedRuntimeTrafficFixture,
    attemptedFinalDecisionWithoutActualArtifactFixture,
  ].map(cloneFixture);
}

module.exports = {
  baselinePendingActualSignedApprovalArtifactFixture,
  chatApprovalOnlyFixture,
  plainTextApprovalOnlyFixture,
  mockSignedArtifactReviewOnlyFixture,
  missingSignedApprovalRecordFixture,
  decisionPackPreparedButNotIssuedFixture,
  evidencePackPreparedButNotSubmittedFixture,
  mountAuthorizationRequestNotSubmittedFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  attemptedFinalDecisionWithoutActualArtifactFixture,
  cloneFixture,
  buildMountAuthorizationHoldGateFixtures,
};
