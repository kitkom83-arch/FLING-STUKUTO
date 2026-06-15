"use strict";

const {
  buildOro10oReviewFinalizationApprovalRequestBoundary,
} = require("./oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10oReviewFinalizationApprovalRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const validStaticMockApprovalRequestBoundaryFromOro10nFixture = fixture(
  "validStaticMockApprovalRequestBoundaryFromOro10nFixture"
);
const missingOro10aPredecessorFailFixture = fixture("missingOro10aPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10aApprovalChainRolloverBoundary: false },
  safetyEvidence: { oro10aPredecessorPresent: false },
});
const missingOro10nPredecessorFailFixture = fixture("missingOro10nPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary: false,
    oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPassed: false,
    verifiedOro10nWasSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryOnly: false,
    oro10nClosed: false,
  },
  safetyEvidence: { oro10nPredecessorPresent: false },
});
const missingOro10nReviewFinalizationBoundaryFailFixture = fixture(
  "missingOro10nReviewFinalizationBoundaryFailFixture",
  {
    predecessorEvidence: {
      oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent: false,
      staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent: false,
    },
    safetyEvidence: {
      oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent: false,
      staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent: false,
    },
  }
);
const missingStaticApprovalRequestRecordFailFixture = fixture("missingStaticApprovalRequestRecordFailFixture", {
  safetyEvidence: {
    approvalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPresent: false,
    staticApprovalRequestRecordPresent: false,
  },
});
const approvalRequestSubmittedBlockedFixture = fixture("approvalRequestSubmittedBlockedFixture", {
  safetyEvidence: {
    verifiedNoApprovalRequestSubmitted: false,
    approvalRequestSubmissionNotPerformed: false,
    approvalRequestSubmitted: true,
  },
});
const finalApprovalIssuedBlockedFixture = fixture("finalApprovalIssuedBlockedFixture", {
  safetyEvidence: { verifiedNoFinalApprovalIssued: false, finalApprovalNotIssued: false, finalApprovalIssued: true },
});
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
const approvalRequestAuthorizesRuntimeBlockedFixture = fixture("approvalRequestAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoApprovalRequestAuthorizesRuntimeOccurred: false,
    approvalRequestAuthorizesRuntime: true,
  },
});
const runtimeReviewDecisionBlockedFixture = fixture("runtimeReviewDecisionBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeReviewDecisionOccurred: false, runtimeReviewDecision: true },
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
    verifiedShortOro10oFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  approvalRequestEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryFixtures() {
  return [
    validStaticMockApprovalRequestBoundaryFromOro10nFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10nPredecessorFailFixture,
    missingOro10nReviewFinalizationBoundaryFailFixture,
    missingStaticApprovalRequestRecordFailFixture,
    approvalRequestSubmittedBlockedFixture,
    finalApprovalIssuedBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
    signedApprovalArtifactAcceptedBlockedFixture,
    signedApprovalArtifactVerifiedBlockedFixture,
    actualSignedApprovalVerificationBlockedFixture,
    approvalRequestAuthorizesRuntimeBlockedFixture,
    runtimeReviewDecisionBlockedFixture,
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
  validStaticMockApprovalRequestBoundaryFromOro10nFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10nPredecessorFailFixture,
  missingOro10nReviewFinalizationBoundaryFailFixture,
  missingStaticApprovalRequestRecordFailFixture,
  approvalRequestSubmittedBlockedFixture,
  finalApprovalIssuedBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
  signedApprovalArtifactAcceptedBlockedFixture,
  signedApprovalArtifactVerifiedBlockedFixture,
  actualSignedApprovalVerificationBlockedFixture,
  approvalRequestAuthorizesRuntimeBlockedFixture,
  runtimeReviewDecisionBlockedFixture,
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
  buildOro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryFixtures,
};
