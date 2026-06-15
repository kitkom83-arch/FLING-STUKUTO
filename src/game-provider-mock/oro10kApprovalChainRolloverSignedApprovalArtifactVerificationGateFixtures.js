"use strict";

const {
  buildOro10kSignedApprovalArtifactVerificationGateRecord,
} = require("./oro10kApprovalChainRolloverSignedApprovalArtifactVerificationGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10kSignedApprovalArtifactVerificationGateRecord({
      id,
      ...overrides,
    })
  );
}

const validStaticMockSignedApprovalArtifactVerificationGateFromOro10jFixture = fixture(
  "validStaticMockSignedApprovalArtifactVerificationGateFromOro10jFixture"
);
const missingOro10aPredecessorFailFixture = fixture("missingOro10aPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10aApprovalChainRolloverBoundary: false },
  safetyEvidence: { oro10aPredecessorPresent: false },
});
const missingOro10bPredecessorFailFixture = fixture("missingOro10bPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10bApprovalChainRolloverContinuityGate: false },
  safetyEvidence: { oro10bPredecessorPresent: false },
});
const missingOro10cPredecessorFailFixture = fixture("missingOro10cPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10cApprovalChainRolloverEvidenceGate: false },
  safetyEvidence: { oro10cPredecessorPresent: false },
});
const missingOro10dPredecessorFailFixture = fixture("missingOro10dPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10dApprovalChainRolloverReviewRequestBoundary: false },
  safetyEvidence: { oro10dPredecessorPresent: false },
});
const missingOro10ePredecessorFailFixture = fixture("missingOro10ePredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate: false },
  safetyEvidence: { oro10ePredecessorPresent: false },
});
const missingOro10fPredecessorFailFixture = fixture("missingOro10fPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate: false },
  safetyEvidence: { oro10fPredecessorPresent: false },
});
const missingOro10gPredecessorFailFixture = fixture("missingOro10gPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate: false },
  safetyEvidence: { oro10gPredecessorPresent: false },
});
const missingOro10hPredecessorFailFixture = fixture("missingOro10hPredecessorFailFixture", {
  safetyEvidence: { oro10hPredecessorPresent: false },
});
const missingOro10iPredecessorFailFixture = fixture("missingOro10iPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10iApprovalChainRolloverSignedApprovalRequestBoundary: false,
    oro10iApprovalChainRolloverSignedApprovalRequestBoundaryPassed: false,
    verifiedOro10iWasSignedApprovalRequestBoundaryOnly: false,
    oro10iClosed: false,
  },
  safetyEvidence: { oro10iPredecessorPresent: false },
});
const missingOro10jPredecessorFailFixture = fixture("missingOro10jPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10jApprovalChainRolloverSignedApprovalArtifactIntakeGate: false,
    oro10jApprovalChainRolloverSignedApprovalArtifactIntakeGatePassed: false,
    verifiedOro10jWasSignedApprovalArtifactIntakeGateOnly: false,
    oro10jClosed: false,
  },
  safetyEvidence: { oro10jPredecessorPresent: false },
});
const missingOro10cEvidenceGateFailFixture = fixture("missingOro10cEvidenceGateFailFixture", {
  predecessorEvidence: { oro10cEvidenceGatePresent: false },
  safetyEvidence: { oro10cEvidenceGatePresent: false },
});
const missingOro10dReviewRequestBoundaryFailFixture = fixture("missingOro10dReviewRequestBoundaryFailFixture", {
  predecessorEvidence: { oro10dReviewRequestBoundaryPresent: false },
  safetyEvidence: { oro10dReviewRequestBoundaryPresent: false },
});
const missingOro10eReviewRequestSubmissionGateFailFixture = fixture(
  "missingOro10eReviewRequestSubmissionGateFailFixture",
  {
    predecessorEvidence: { oro10eReviewRequestSubmissionGatePresent: false },
    safetyEvidence: { oro10eReviewRequestSubmissionGatePresent: false },
  }
);
const missingOro10fReviewDecisionIntakeGateFailFixture = fixture(
  "missingOro10fReviewDecisionIntakeGateFailFixture",
  {
    predecessorEvidence: { oro10fReviewDecisionIntakeGatePresent: false },
    safetyEvidence: { oro10fReviewDecisionIntakeGatePresent: false },
  }
);
const missingOro10gReviewDecisionValidationGateFailFixture = fixture(
  "missingOro10gReviewDecisionValidationGateFailFixture",
  {
    predecessorEvidence: { oro10gReviewDecisionValidationGatePresent: false },
    safetyEvidence: { oro10gReviewDecisionValidationGatePresent: false },
  }
);
const missingOro10hReviewDecisionFinalizationBoundaryFailFixture = fixture(
  "missingOro10hReviewDecisionFinalizationBoundaryFailFixture",
  {
    predecessorEvidence: { oro10hReviewDecisionFinalizationBoundaryPresent: false },
    safetyEvidence: { oro10hReviewDecisionFinalizationBoundaryPresent: false },
  }
);
const missingOro10iSignedApprovalRequestBoundaryFailFixture = fixture(
  "missingOro10iSignedApprovalRequestBoundaryFailFixture",
  {
    predecessorEvidence: { oro10iSignedApprovalRequestBoundaryPresent: false },
    safetyEvidence: { oro10iSignedApprovalRequestBoundaryPresent: false },
  }
);
const missingOro10jSignedApprovalArtifactIntakeGateFailFixture = fixture(
  "missingOro10jSignedApprovalArtifactIntakeGateFailFixture",
  {
    predecessorEvidence: { oro10jSignedApprovalArtifactIntakeGatePresent: false },
    safetyEvidence: { oro10jSignedApprovalArtifactIntakeGatePresent: false },
  }
);
const missingStaticSignedApprovalArtifactVerificationRecordFailFixture = fixture(
  "missingStaticSignedApprovalArtifactVerificationRecordFailFixture",
  {
    safetyEvidence: {
      approvalChainRolloverSignedApprovalArtifactVerificationGatePresent: false,
      staticSignedApprovalArtifactVerificationRecordPresent: false,
    },
  }
);
const signedRuntimeApprovalBlockedFixture = fixture("signedRuntimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedRuntimeApprovalOccurred: false, signedRuntimeApproval: true },
});
const signedApprovalArtifactAcceptedBlockedFixture = fixture("signedApprovalArtifactAcceptedBlockedFixture", {
  safetyEvidence: {
    verifiedNoSignedApprovalArtifactAccepted: false,
    signedApprovalArtifactAccepted: true,
  },
});
const signedApprovalArtifactVerifiedBlockedFixture = fixture("signedApprovalArtifactVerifiedBlockedFixture", {
  safetyEvidence: {
    verifiedNoSignedApprovalArtifactVerified: false,
    signedApprovalArtifactVerified: true,
  },
});
const actualSignedApprovalVerificationBlockedFixture = fixture("actualSignedApprovalVerificationBlockedFixture", {
  safetyEvidence: {
    verifiedNoActualSignedApprovalArtifactVerificationOccurred: false,
    actualSignedApprovalVerification: true,
  },
});
const runtimeReviewDecisionBlockedFixture = fixture("runtimeReviewDecisionBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeReviewDecisionOccurred: false, runtimeReviewDecision: true },
});
const decisionAuthorizesRuntimeBlockedFixture = fixture("decisionAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoDecisionAuthorizesRuntimeOccurred: false,
    decisionAuthorizesRuntime: true,
  },
});
const finalizationAuthorizesRuntimeBlockedFixture = fixture("finalizationAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoFinalizationAuthorizesRuntimeOccurred: false,
    finalizationAuthorizesRuntime: true,
  },
});
const requestAuthorizesRuntimeBlockedFixture = fixture("requestAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: { verifiedNoRequestAuthorizesRuntimeOccurred: false, requestAuthorizesRuntime: true },
});
const artifactIntakeAuthorizesRuntimeBlockedFixture = fixture("artifactIntakeAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoArtifactIntakeAuthorizesRuntimeOccurred: false,
    artifactIntakeAuthorizesRuntime: true,
  },
});
const artifactVerificationAuthorizesRuntimeBlockedFixture = fixture("artifactVerificationAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoArtifactVerificationAuthorizesRuntimeOccurred: false,
    artifactVerificationAuthorizesRuntime: true,
  },
});
const runtimeAuthorizationBlockedFixture = fixture("runtimeAuthorizationBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeAuthorizationOccurred: false, "runtimeAuthorization": true },
});
const runtimeApprovalChainRolloverBlockedFixture = fixture("runtimeApprovalChainRolloverBlockedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeApprovalChainRolloverOccurred: false,
    runtimeApprovalChainRollover: true,
  },
});
const runtimeMountBlockedFixture = fixture("runtimeMountBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeMountOccurred: false, runtimeMount: true },
});
const publicAliasBlockedFixture = fixture("publicAliasBlockedFixture", {
  safetyEvidence: {
    verifiedNoPublicAliasOccurred: false,
    verifiedNoPublicCallbackAliasOccurred: false,
    verifiedNoRouteAliasOccurred: false,
    publicAlias: true,
    publicCallbackAlias: true,
    routeAlias: true,
  },
});
const liveExecutionBlockedFixture = fixture("liveExecutionBlockedFixture", {
  safetyEvidence: { verifiedNoLiveExecutionOccurred: false, liveExecution: true },
});
const externalCallBlockedFixture = fixture("externalCallBlockedFixture", {
  safetyEvidence: {
    verifiedNoActualExternalCallOccurred: false,
    verifiedNoExternalNetworkOccurred: false,
    actualExternalCall: true,
    externalCall: true,
    externalNetworkCalled: true,
  },
});
const gameLaunchCallBlockedFixture = fixture("gameLaunchCallBlockedFixture", {
  safetyEvidence: { verifiedNoGameLaunchCallOccurred: false, gameLaunchCall: true },
});
const walletMutationBlockedFixture = fixture("walletMutationBlockedFixture", {
  safetyEvidence: { verifiedNoWalletMutationOccurred: false, walletMutation: true },
});
const ledgerMutationBlockedFixture = fixture("ledgerMutationBlockedFixture", {
  safetyEvidence: { verifiedNoLedgerMutationOccurred: false, ledgerMutation: true },
});
const prismaWriteBlockedFixture = fixture("prismaWriteBlockedFixture", {
  safetyEvidence: { verifiedNoPrismaWriteOccurred: false, prismaWrite: true },
});
const dbTransactionBlockedFixture = fixture("dbTransactionBlockedFixture", {
  safetyEvidence: { verifiedNoDbTransactionOccurred: false, dbTransaction: true },
});
const migrationBlockedFixture = fixture("migrationBlockedFixture", {
  safetyEvidence: { verifiedNoMigrationOccurred: false, migration: true },
});
const deployBlockedFixture = fixture("deployBlockedFixture", {
  safetyEvidence: { verifiedNoDeployOccurred: false, deploy: true },
});
const secretLikeValueBlockedFixture = fixture("secretLikeValueBlockedFixture", {
  safetyEvidence: {
    verifiedNoSecretLikeValuePresent: false,
    secretLikeValuePresent: true,
    sensitiveOutputPresent: true,
  },
});
const longFilenameBlockedFixture = fixture("longFilenameBlockedFixture", {
  safetyEvidence: {
    verifiedShortOro10kFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  signedApprovalArtifactVerificationEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10kApprovalChainRolloverSignedApprovalArtifactVerificationGateFixtures() {
  return [
    validStaticMockSignedApprovalArtifactVerificationGateFromOro10jFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10bPredecessorFailFixture,
    missingOro10cPredecessorFailFixture,
    missingOro10dPredecessorFailFixture,
    missingOro10ePredecessorFailFixture,
    missingOro10fPredecessorFailFixture,
    missingOro10gPredecessorFailFixture,
    missingOro10hPredecessorFailFixture,
    missingOro10iPredecessorFailFixture,
    missingOro10jPredecessorFailFixture,
    missingOro10cEvidenceGateFailFixture,
    missingOro10dReviewRequestBoundaryFailFixture,
    missingOro10eReviewRequestSubmissionGateFailFixture,
    missingOro10fReviewDecisionIntakeGateFailFixture,
    missingOro10gReviewDecisionValidationGateFailFixture,
    missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
    missingOro10iSignedApprovalRequestBoundaryFailFixture,
    missingOro10jSignedApprovalArtifactIntakeGateFailFixture,
    missingStaticSignedApprovalArtifactVerificationRecordFailFixture,
    signedRuntimeApprovalBlockedFixture,
    signedApprovalArtifactAcceptedBlockedFixture,
    signedApprovalArtifactVerifiedBlockedFixture,
    actualSignedApprovalVerificationBlockedFixture,
    runtimeReviewDecisionBlockedFixture,
    decisionAuthorizesRuntimeBlockedFixture,
    finalizationAuthorizesRuntimeBlockedFixture,
    requestAuthorizesRuntimeBlockedFixture,
    artifactIntakeAuthorizesRuntimeBlockedFixture,
    artifactVerificationAuthorizesRuntimeBlockedFixture,
    runtimeAuthorizationBlockedFixture,
    runtimeApprovalChainRolloverBlockedFixture,
    runtimeMountBlockedFixture,
    publicAliasBlockedFixture,
    liveExecutionBlockedFixture,
    externalCallBlockedFixture,
    gameLaunchCallBlockedFixture,
    walletMutationBlockedFixture,
    ledgerMutationBlockedFixture,
    prismaWriteBlockedFixture,
    dbTransactionBlockedFixture,
    migrationBlockedFixture,
    deployBlockedFixture,
    secretLikeValueBlockedFixture,
    longFilenameBlockedFixture,
    missingSeparateNextApprovalBlockedFixture,
  ].map(cloneFixture);
}

module.exports = {
  validStaticMockSignedApprovalArtifactVerificationGateFromOro10jFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10bPredecessorFailFixture,
  missingOro10cPredecessorFailFixture,
  missingOro10dPredecessorFailFixture,
  missingOro10ePredecessorFailFixture,
  missingOro10fPredecessorFailFixture,
  missingOro10gPredecessorFailFixture,
  missingOro10hPredecessorFailFixture,
  missingOro10iPredecessorFailFixture,
  missingOro10jPredecessorFailFixture,
  missingOro10cEvidenceGateFailFixture,
  missingOro10dReviewRequestBoundaryFailFixture,
  missingOro10eReviewRequestSubmissionGateFailFixture,
  missingOro10fReviewDecisionIntakeGateFailFixture,
  missingOro10gReviewDecisionValidationGateFailFixture,
  missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
  missingOro10iSignedApprovalRequestBoundaryFailFixture,
  missingOro10jSignedApprovalArtifactIntakeGateFailFixture,
  missingStaticSignedApprovalArtifactVerificationRecordFailFixture,
  signedRuntimeApprovalBlockedFixture,
  signedApprovalArtifactAcceptedBlockedFixture,
  signedApprovalArtifactVerifiedBlockedFixture,
  actualSignedApprovalVerificationBlockedFixture,
  runtimeReviewDecisionBlockedFixture,
  decisionAuthorizesRuntimeBlockedFixture,
  finalizationAuthorizesRuntimeBlockedFixture,
  requestAuthorizesRuntimeBlockedFixture,
  artifactIntakeAuthorizesRuntimeBlockedFixture,
  artifactVerificationAuthorizesRuntimeBlockedFixture,
  runtimeAuthorizationBlockedFixture,
  runtimeApprovalChainRolloverBlockedFixture,
  runtimeMountBlockedFixture,
  publicAliasBlockedFixture,
  liveExecutionBlockedFixture,
  externalCallBlockedFixture,
  gameLaunchCallBlockedFixture,
  walletMutationBlockedFixture,
  ledgerMutationBlockedFixture,
  prismaWriteBlockedFixture,
  dbTransactionBlockedFixture,
  migrationBlockedFixture,
  deployBlockedFixture,
  secretLikeValueBlockedFixture,
  longFilenameBlockedFixture,
  missingSeparateNextApprovalBlockedFixture,
  cloneFixture,
  buildOro10kApprovalChainRolloverSignedApprovalArtifactVerificationGateFixtures,
};
