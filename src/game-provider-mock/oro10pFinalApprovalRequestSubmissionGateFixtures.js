"use strict";

const {
  buildOro10pFinalApprovalRequestSubmissionGate,
} = require("./oro10pFinalApprovalRequestSubmissionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10pFinalApprovalRequestSubmissionGate({
      id,
      ...overrides,
    })
  );
}

const validStaticMockFinalApprovalRequestSubmissionGateFromOro10oFixture = fixture(
  "validStaticMockFinalApprovalRequestSubmissionGateFromOro10oFixture"
);
const missingOro10aPredecessorFailFixture = fixture("missingOro10aPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10aApprovalChainRolloverBoundary: false },
  safetyEvidence: { oro10aPredecessorPresent: false },
});
const missingOro10oPredecessorFailFixture = fixture("missingOro10oPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary: false,
    oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryPassed: false,
    verifiedOro10oWasApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryOnly:
      false,
    oro10oClosed: false,
  },
  safetyEvidence: { oro10oPredecessorPresent: false },
});
const missingOro10oApprovalRequestBoundaryFailFixture = fixture("missingOro10oApprovalRequestBoundaryFailFixture", {
  predecessorEvidence: {
    oro10oApprovalRequestBoundaryPresent: false,
    staticApprovalRequestRecordPresent: false,
  },
  safetyEvidence: {
    oro10oApprovalRequestBoundaryPresent: false,
    staticApprovalRequestRecordPresent: false,
  },
});
const missingStaticFinalApprovalRequestSubmissionRecordFailFixture = fixture(
  "missingStaticFinalApprovalRequestSubmissionRecordFailFixture",
  {
    safetyEvidence: {
      approvalChainRolloverFinalApprovalRequestSubmissionGatePresent: false,
      staticFinalApprovalRequestSubmissionRecordPresent: false,
    },
  }
);
const runtimeApprovalRequestSubmissionBlockedFixture = fixture("runtimeApprovalRequestSubmissionBlockedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeApprovalRequestSubmissionOccurred: false,
    runtimeApprovalRequestSubmission: true,
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
const approvalRequestSubmissionAuthorizesRuntimeBlockedFixture = fixture(
  "approvalRequestSubmissionAuthorizesRuntimeBlockedFixture",
  {
    safetyEvidence: {
      verifiedNoApprovalRequestSubmissionAuthorizesRuntimeOccurred: false,
      approvalRequestSubmissionRuntimeAuthorizationNotIssued: false,
      approvalRequestSubmissionAuthorizesRuntime: true,
    },
  }
);
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
    verifiedShortOro10pFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  finalApprovalRequestSubmissionEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10pFinalApprovalRequestSubmissionGateFixtures() {
  return [
    validStaticMockFinalApprovalRequestSubmissionGateFromOro10oFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10oPredecessorFailFixture,
    missingOro10oApprovalRequestBoundaryFailFixture,
    missingStaticFinalApprovalRequestSubmissionRecordFailFixture,
    runtimeApprovalRequestSubmissionBlockedFixture,
    finalApprovalIssuedBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
    signedApprovalArtifactAcceptedBlockedFixture,
    signedApprovalArtifactVerifiedBlockedFixture,
    actualSignedApprovalVerificationBlockedFixture,
    approvalRequestSubmissionAuthorizesRuntimeBlockedFixture,
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
  validStaticMockFinalApprovalRequestSubmissionGateFromOro10oFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10oPredecessorFailFixture,
  missingOro10oApprovalRequestBoundaryFailFixture,
  missingStaticFinalApprovalRequestSubmissionRecordFailFixture,
  runtimeApprovalRequestSubmissionBlockedFixture,
  finalApprovalIssuedBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
  signedApprovalArtifactAcceptedBlockedFixture,
  signedApprovalArtifactVerifiedBlockedFixture,
  actualSignedApprovalVerificationBlockedFixture,
  approvalRequestSubmissionAuthorizesRuntimeBlockedFixture,
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
  buildOro10pFinalApprovalRequestSubmissionGateFixtures,
};
