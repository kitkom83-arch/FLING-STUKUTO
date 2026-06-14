"use strict";

const {
  buildOro10hReviewDecisionFinalizationBoundaryRecord,
} = require("./oro10hApprovalChainRolloverReviewDecisionFinalizationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10hReviewDecisionFinalizationBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validStaticReviewDecisionFinalizationBoundaryFromOro10gFixture = fixture(
  "validStaticReviewDecisionFinalizationBoundaryFromOro10gFixture"
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
  predecessorEvidence: {
    dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate: false,
    oro10gApprovalChainRolloverReviewDecisionValidationGatePassed: false,
    verifiedOro10gWasReviewDecisionValidationGateOnly: false,
    oro10gClosed: false,
  },
  safetyEvidence: { oro10gPredecessorPresent: false },
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
const missingStaticReviewDecisionFinalizationRecordFailFixture = fixture(
  "missingStaticReviewDecisionFinalizationRecordFailFixture",
  {
    safetyEvidence: {
      approvalChainRolloverReviewDecisionFinalizationBoundaryPresent: false,
      staticReviewDecisionFinalizationRecordPresent: false,
    },
  }
);
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
const runtimeAuthorizationBlockedFixture = fixture("runtimeAuthorizationBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeAuthorizationOccurred: false, "runtimeAuthorization": true },
});
const signedRuntimeApprovalBlockedFixture = fixture("signedRuntimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedRuntimeApprovalOccurred: false, signedRuntimeApproval: true },
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
    verifiedShortOro10hFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  reviewDecisionFinalizationEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10hApprovalChainRolloverReviewDecisionFinalizationBoundaryFixtures() {
  return [
    validStaticReviewDecisionFinalizationBoundaryFromOro10gFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10bPredecessorFailFixture,
    missingOro10cPredecessorFailFixture,
    missingOro10dPredecessorFailFixture,
    missingOro10ePredecessorFailFixture,
    missingOro10fPredecessorFailFixture,
    missingOro10gPredecessorFailFixture,
    missingOro10cEvidenceGateFailFixture,
    missingOro10dReviewRequestBoundaryFailFixture,
    missingOro10eReviewRequestSubmissionGateFailFixture,
    missingOro10fReviewDecisionIntakeGateFailFixture,
    missingOro10gReviewDecisionValidationGateFailFixture,
    missingStaticReviewDecisionFinalizationRecordFailFixture,
    runtimeReviewDecisionBlockedFixture,
    decisionAuthorizesRuntimeBlockedFixture,
    finalizationAuthorizesRuntimeBlockedFixture,
    runtimeAuthorizationBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
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
  validStaticReviewDecisionFinalizationBoundaryFromOro10gFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10bPredecessorFailFixture,
  missingOro10cPredecessorFailFixture,
  missingOro10dPredecessorFailFixture,
  missingOro10ePredecessorFailFixture,
  missingOro10fPredecessorFailFixture,
  missingOro10gPredecessorFailFixture,
  missingOro10cEvidenceGateFailFixture,
  missingOro10dReviewRequestBoundaryFailFixture,
  missingOro10eReviewRequestSubmissionGateFailFixture,
  missingOro10fReviewDecisionIntakeGateFailFixture,
  missingOro10gReviewDecisionValidationGateFailFixture,
  missingStaticReviewDecisionFinalizationRecordFailFixture,
  runtimeReviewDecisionBlockedFixture,
  decisionAuthorizesRuntimeBlockedFixture,
  finalizationAuthorizesRuntimeBlockedFixture,
  runtimeAuthorizationBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
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
  buildOro10hApprovalChainRolloverReviewDecisionFinalizationBoundaryFixtures,
};
