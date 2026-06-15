"use strict";

const {
  buildOro10iSignedApprovalRequestBoundaryRecord,
} = require("./oro10iApprovalChainRolloverSignedApprovalRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10iSignedApprovalRequestBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validStaticMockSignedApprovalRequestBoundaryFromOro10hFixture = fixture(
  "validStaticMockSignedApprovalRequestBoundaryFromOro10hFixture"
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
  predecessorEvidence: {
    dependsOnOro10hApprovalChainRolloverReviewDecisionFinalizationBoundary: false,
    oro10hApprovalChainRolloverReviewDecisionFinalizationBoundaryPassed: false,
    verifiedOro10hWasReviewDecisionFinalizationBoundaryOnly: false,
    oro10hClosed: false,
  },
  safetyEvidence: { oro10hPredecessorPresent: false },
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
const missingStaticSignedApprovalRequestRecordFailFixture = fixture(
  "missingStaticSignedApprovalRequestRecordFailFixture",
  {
    safetyEvidence: {
      approvalChainRolloverSignedApprovalRequestBoundaryPresent: false,
      staticSignedApprovalRequestRecordPresent: false,
    },
  }
);
const signedRuntimeApprovalBlockedFixture = fixture("signedRuntimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedRuntimeApprovalOccurred: false, signedRuntimeApproval: true },
});
const signedApprovalArtifactIntakeBlockedFixture = fixture("signedApprovalArtifactIntakeBlockedFixture", {
  safetyEvidence: {
    verifiedNoSignedApprovalArtifactPresent: false,
    signedApprovalArtifactPresent: true,
  },
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
    verifiedShortOro10iFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  signedApprovalRequestEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10iApprovalChainRolloverSignedApprovalRequestBoundaryFixtures() {
  return [
    validStaticMockSignedApprovalRequestBoundaryFromOro10hFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10bPredecessorFailFixture,
    missingOro10cPredecessorFailFixture,
    missingOro10dPredecessorFailFixture,
    missingOro10ePredecessorFailFixture,
    missingOro10fPredecessorFailFixture,
    missingOro10gPredecessorFailFixture,
    missingOro10hPredecessorFailFixture,
    missingOro10cEvidenceGateFailFixture,
    missingOro10dReviewRequestBoundaryFailFixture,
    missingOro10eReviewRequestSubmissionGateFailFixture,
    missingOro10fReviewDecisionIntakeGateFailFixture,
    missingOro10gReviewDecisionValidationGateFailFixture,
    missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
    missingStaticSignedApprovalRequestRecordFailFixture,
    signedRuntimeApprovalBlockedFixture,
    signedApprovalArtifactIntakeBlockedFixture,
    signedApprovalArtifactAcceptedBlockedFixture,
    signedApprovalArtifactVerifiedBlockedFixture,
    runtimeReviewDecisionBlockedFixture,
    decisionAuthorizesRuntimeBlockedFixture,
    finalizationAuthorizesRuntimeBlockedFixture,
    requestAuthorizesRuntimeBlockedFixture,
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
  validStaticMockSignedApprovalRequestBoundaryFromOro10hFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10bPredecessorFailFixture,
  missingOro10cPredecessorFailFixture,
  missingOro10dPredecessorFailFixture,
  missingOro10ePredecessorFailFixture,
  missingOro10fPredecessorFailFixture,
  missingOro10gPredecessorFailFixture,
  missingOro10hPredecessorFailFixture,
  missingOro10cEvidenceGateFailFixture,
  missingOro10dReviewRequestBoundaryFailFixture,
  missingOro10eReviewRequestSubmissionGateFailFixture,
  missingOro10fReviewDecisionIntakeGateFailFixture,
  missingOro10gReviewDecisionValidationGateFailFixture,
  missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
  missingStaticSignedApprovalRequestRecordFailFixture,
  signedRuntimeApprovalBlockedFixture,
  signedApprovalArtifactIntakeBlockedFixture,
  signedApprovalArtifactAcceptedBlockedFixture,
  signedApprovalArtifactVerifiedBlockedFixture,
  runtimeReviewDecisionBlockedFixture,
  decisionAuthorizesRuntimeBlockedFixture,
  finalizationAuthorizesRuntimeBlockedFixture,
  requestAuthorizesRuntimeBlockedFixture,
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
  buildOro10iApprovalChainRolloverSignedApprovalRequestBoundaryFixtures,
};
