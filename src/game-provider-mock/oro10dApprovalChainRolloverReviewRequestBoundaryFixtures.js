"use strict";

const {
  buildOro10dReviewRequestBoundaryRecord,
} = require("./oro10dApprovalChainRolloverReviewRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10dReviewRequestBoundaryRecord({
      id,
      ...overrides,
    })
  );
}

const validReviewRequestBoundaryFromOro10cFixture = fixture("validReviewRequestBoundaryFromOro10cFixture");
const missingOro10cPredecessorFailFixture = fixture("missingOro10cPredecessorFailFixture", {
  predecessorEvidence: {
    dependsOnOro10cApprovalChainRolloverEvidenceGate: false,
    oro10cApprovalChainRolloverEvidenceGatePassed: false,
    verifiedOro10cWasEvidenceGateOnly: false,
    oro10cClosed: false,
  },
  safetyEvidence: { oro10cPredecessorPresent: false },
});
const missingReviewRequestFailFixture = fixture("missingReviewRequestFailFixture", {
  reviewRequestEvidence: {
    reviewRequestPrepared: false,
    reviewRequestSubmitted: false,
    reviewRequestRecorded: false,
  },
  safetyEvidence: { approvalChainRolloverReviewRequestBoundaryPresent: false },
});
const reviewDecisionBlockedFixture = fixture("reviewDecisionBlockedFixture", {
  reviewDecisionEvidence: {
    reviewDecisionIssued: true,
    reviewDecisionStatus: "issued_not_allowed",
  },
  safetyEvidence: {
    verifiedNoReviewDecisionOccurred: false,
    reviewDecision: true,
    reviewDecisionApproved: true,
  },
});
const signedApprovalBlockedFixture = fixture("signedApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedApprovalOccurred: false, signedApproval: true },
});
const signedRuntimeApprovalBlockedFixture = fixture("signedRuntimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoSignedRuntimeApprovalOccurred: false, signedRuntimeApproval: true },
});
const runtimeApprovalBlockedFixture = fixture("runtimeApprovalBlockedFixture", {
  safetyEvidence: { verifiedNoRuntimeApprovalOccurred: false, runtimeApproval: true },
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
    verifiedShortOro10dFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateReviewDecisionBlockedFixture = fixture("missingSeparateReviewDecisionBlockedFixture", {
  reviewRequestEvidence: {
    nextPhaseSeparateReviewDecisionRequired: false,
    nextStepRequiresSeparateReviewDecision: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10dApprovalChainRolloverReviewRequestBoundaryFixtures() {
  return [
    validReviewRequestBoundaryFromOro10cFixture,
    missingOro10cPredecessorFailFixture,
    missingReviewRequestFailFixture,
    reviewDecisionBlockedFixture,
    signedApprovalBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
    runtimeApprovalBlockedFixture,
    runtimeApprovalChainRolloverBlockedFixture,
    runtimeMountBlockedFixture,
    publicAliasBlockedFixture,
    liveExecutionBlockedFixture,
    externalCallBlockedFixture,
    walletMutationBlockedFixture,
    ledgerMutationBlockedFixture,
    dbRuntimeFlowBlockedFixture,
    prismaWriteBlockedFixture,
    dbTransactionBlockedFixture,
    migrationBlockedFixture,
    deployBlockedFixture,
    secretLikeValueBlockedFixture,
    longFilenameBlockedFixture,
    missingSeparateReviewDecisionBlockedFixture,
  ].map(cloneFixture);
}

module.exports = {
  validReviewRequestBoundaryFromOro10cFixture,
  missingOro10cPredecessorFailFixture,
  missingReviewRequestFailFixture,
  reviewDecisionBlockedFixture,
  signedApprovalBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
  runtimeApprovalBlockedFixture,
  runtimeApprovalChainRolloverBlockedFixture,
  runtimeMountBlockedFixture,
  publicAliasBlockedFixture,
  liveExecutionBlockedFixture,
  externalCallBlockedFixture,
  walletMutationBlockedFixture,
  ledgerMutationBlockedFixture,
  dbRuntimeFlowBlockedFixture,
  prismaWriteBlockedFixture,
  dbTransactionBlockedFixture,
  migrationBlockedFixture,
  deployBlockedFixture,
  secretLikeValueBlockedFixture,
  longFilenameBlockedFixture,
  missingSeparateReviewDecisionBlockedFixture,
  cloneFixture,
  buildOro10dApprovalChainRolloverReviewRequestBoundaryFixtures,
};
