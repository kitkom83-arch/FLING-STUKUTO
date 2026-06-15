"use strict";

const {
  buildOro10qFinalApprovalDecisionIntakeGate,
} = require("./oro10qFinalApprovalDecisionIntakeGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10qFinalApprovalDecisionIntakeGate({
      id,
      ...overrides,
    })
  );
}

const validStaticMockFinalApprovalDecisionIntakeGateFromOro10pFixture = fixture(
  "validStaticMockFinalApprovalDecisionIntakeGateFromOro10pFixture"
);
const missingOro10aPredecessorFailFixture = fixture("missingOro10aPredecessorFailFixture", {
  predecessorEvidence: { dependsOnOro10aApprovalChainRolloverBoundary: false },
  safetyEvidence: { oro10aPredecessorPresent: false },
});
const missingOro10pPredecessorFailFixture = fixture("missingOro10pPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10pFinalApprovalRequestSubmissionGate: false,
    oro10pFinalApprovalRequestSubmissionGatePassed: false,
    verifiedOro10pWasFinalApprovalRequestSubmissionGateOnly: false,
    oro10pClosed: false,
  },
  safetyEvidence: { oro10pPredecessorPresent: false },
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
const missingOro10pFinalApprovalRequestSubmissionGateFailFixture = fixture(
  "missingOro10pFinalApprovalRequestSubmissionGateFailFixture",
  {
    predecessorEvidence: {
      oro10pFinalApprovalRequestSubmissionGatePresent: false,
      staticFinalApprovalRequestSubmissionRecordPresent: false,
    },
    safetyEvidence: {
      oro10pFinalApprovalRequestSubmissionGatePresent: false,
      staticFinalApprovalRequestSubmissionRecordPresent: false,
    },
  }
);
const missingStaticFinalApprovalDecisionIntakeRecordFailFixture = fixture(
  "missingStaticFinalApprovalDecisionIntakeRecordFailFixture",
  {
    safetyEvidence: {
      approvalChainRolloverFinalApprovalDecisionIntakeGatePresent: false,
      staticFinalApprovalDecisionIntakeRecordPresent: false,
    },
  }
);
const finalApprovalIssuedBlockedFixture = fixture("finalApprovalIssuedBlockedFixture", {
  safetyEvidence: { verifiedNoFinalApprovalIssued: false, finalApprovalNotIssued: false, finalApprovalIssued: true },
});
const signedRuntimeApprovalBlockedFixture = fixture("signedRuntimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedRuntimeApprovalOccurred: false, signedRuntimeApproval: true },
});
const approvalDecisionAuthorizesRuntimeBlockedFixture = fixture("approvalDecisionAuthorizesRuntimeBlockedFixture", {
  safetyEvidence: {
    verifiedNoApprovalDecisionAuthorizesRuntimeOccurred: false,
    finalApprovalDecisionRuntimeAuthorizationNotIssued: false,
    approvalDecisionAuthorizesRuntime: true,
  },
});
const finalApprovalDecisionAuthorizesRuntimeBlockedFixture = fixture(
  "finalApprovalDecisionAuthorizesRuntimeBlockedFixture",
  {
    safetyEvidence: {
      verifiedNoFinalApprovalDecisionAuthorizesRuntimeOccurred: false,
      finalApprovalDecisionRuntimeAuthorizationNotIssued: false,
      finalApprovalDecisionAuthorizesRuntime: true,
    },
  }
);
const runtimeReviewDecisionBlockedFixture = fixture("runtimeReviewDecisionBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeReviewDecisionOccurred: false, runtimeReviewDecision: true },
});
const runtimeAuthorizationBlockedFixture = fixture("runtimeAuthorizationBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeAuthorizationOccurred: false, "runtimeAuthorization": true },
});
const runtimeApprovalBlockedFixture = fixture("runtimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeApprovalOccurred: false, runtimeApproval: true },
});
const runtimeActivationBlockedFixture = fixture("runtimeActivationBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeActivationOccurred: false, runtimeActivation: true },
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
const liveOroPlayApiCallBlockedFixture = fixture("liveOroPlayApiCallBlockedFixture", {
  safetyEvidence: {
    verifiedNoLiveOroPlayApiCallOccurred: false,
    liveOroPlayApiCallAllowed: true,
    liveOroPlayApiCallCalled: true,
    liveOroPlayApiCalled: true,
  },
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
const dbRuntimeFlowBlockedFixture = fixture("dbRuntimeFlowBlockedFixture", {
  safetyEvidence: { verifiedNoDbRuntimeFlowOccurred: false, dbRuntimeFlow: true },
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
    verifiedShortOro10qFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  finalApprovalDecisionIntakeEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10qFinalApprovalDecisionIntakeGateFixtures() {
  return [
    validStaticMockFinalApprovalDecisionIntakeGateFromOro10pFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10pPredecessorFailFixture,
    missingOro10oApprovalRequestBoundaryFailFixture,
    missingOro10pFinalApprovalRequestSubmissionGateFailFixture,
    missingStaticFinalApprovalDecisionIntakeRecordFailFixture,
    finalApprovalIssuedBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
    approvalDecisionAuthorizesRuntimeBlockedFixture,
    finalApprovalDecisionAuthorizesRuntimeBlockedFixture,
    runtimeReviewDecisionBlockedFixture,
    runtimeAuthorizationBlockedFixture,
    runtimeApprovalBlockedFixture,
    runtimeActivationBlockedFixture,
    runtimeApprovalChainRolloverBlockedFixture,
    runtimeMountBlockedFixture,
    publicAliasBlockedFixture,
    liveExecutionBlockedFixture,
    liveOroPlayApiCallBlockedFixture,
    externalCallBlockedFixture,
    gameLaunchCallBlockedFixture,
    walletMutationBlockedFixture,
    ledgerMutationBlockedFixture,
    dbRuntimeFlowBlockedFixture,
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
  validStaticMockFinalApprovalDecisionIntakeGateFromOro10pFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10pPredecessorFailFixture,
  missingOro10oApprovalRequestBoundaryFailFixture,
  missingOro10pFinalApprovalRequestSubmissionGateFailFixture,
  missingStaticFinalApprovalDecisionIntakeRecordFailFixture,
  finalApprovalIssuedBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
  approvalDecisionAuthorizesRuntimeBlockedFixture,
  finalApprovalDecisionAuthorizesRuntimeBlockedFixture,
  runtimeReviewDecisionBlockedFixture,
  runtimeAuthorizationBlockedFixture,
  runtimeApprovalBlockedFixture,
  runtimeActivationBlockedFixture,
  runtimeApprovalChainRolloverBlockedFixture,
  runtimeMountBlockedFixture,
  publicAliasBlockedFixture,
  liveExecutionBlockedFixture,
  liveOroPlayApiCallBlockedFixture,
  externalCallBlockedFixture,
  gameLaunchCallBlockedFixture,
  walletMutationBlockedFixture,
  ledgerMutationBlockedFixture,
  dbRuntimeFlowBlockedFixture,
  prismaWriteBlockedFixture,
  dbTransactionBlockedFixture,
  migrationBlockedFixture,
  deployBlockedFixture,
  secretLikeValueBlockedFixture,
  longFilenameBlockedFixture,
  missingSeparateNextApprovalBlockedFixture,
  cloneFixture,
  buildOro10qFinalApprovalDecisionIntakeGateFixtures,
};
