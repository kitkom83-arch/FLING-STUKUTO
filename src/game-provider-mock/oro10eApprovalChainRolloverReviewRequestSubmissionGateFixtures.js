"use strict";

const {
  buildOro10eReviewRequestSubmissionGateRecord,
} = require("./oro10eApprovalChainRolloverReviewRequestSubmissionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10eReviewRequestSubmissionGateRecord({
      id,
      ...overrides,
    })
  );
}

const validReviewRequestSubmissionGateFromOro10dFixture = fixture("validReviewRequestSubmissionGateFromOro10dFixture");
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
  predecessorEvidence: {
    dependsOnOro10dApprovalChainRolloverReviewRequestBoundary: false,
    oro10dApprovalChainRolloverReviewRequestBoundaryPassed: false,
    verifiedOro10dWasReviewRequestBoundaryOnly: false,
    oro10dClosed: false,
  },
  safetyEvidence: { oro10dPredecessorPresent: false },
});
const missingOro10cEvidenceGateFailFixture = fixture("missingOro10cEvidenceGateFailFixture", {
  predecessorEvidence: { oro10cEvidenceGatePresent: false },
  safetyEvidence: { oro10cEvidenceGatePresent: false },
});
const missingOro10dReviewRequestBoundaryFailFixture = fixture("missingOro10dReviewRequestBoundaryFailFixture", {
  safetyEvidence: { oro10dReviewRequestBoundaryPresent: false },
});
const runtimeReviewRequestSubmissionBlockedFixture = fixture("runtimeReviewRequestSubmissionBlockedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeReviewSubmissionOccurred: false,
    runtimeReviewRequestSubmission: true,
  },
});
const reviewDecisionIssuedBlockedFixture = fixture("reviewDecisionIssuedBlockedFixture", {
  reviewDecisionEvidence: {
    reviewDecisionIssued: true,
    reviewDecisionStatus: "issued_not_allowed",
  },
  safetyEvidence: {
    verifiedNoReviewDecisionOccurred: false,
    reviewDecision: true,
    reviewDecisionIssued: true,
    reviewDecisionApproved: true,
  },
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
    verifiedShortOro10eFilenamesOnly: false,
    noLongFilenameConfirmed: false,
    longFilenameDetected: true,
  },
});
const missingSeparateNextApprovalBlockedFixture = fixture("missingSeparateNextApprovalBlockedFixture", {
  reviewSubmissionEvidence: {
    nextPhaseSeparateApprovalRequired: false,
    nextStepRequiresSeparateApproval: false,
    nextStepRequiresSeparateReviewDecision: false,
    nextStepRequiresSeparateRuntimeApproval: false,
  },
});

function buildOro10eApprovalChainRolloverReviewRequestSubmissionGateFixtures() {
  return [
    validReviewRequestSubmissionGateFromOro10dFixture,
    missingOro10aPredecessorFailFixture,
    missingOro10bPredecessorFailFixture,
    missingOro10cPredecessorFailFixture,
    missingOro10dPredecessorFailFixture,
    missingOro10cEvidenceGateFailFixture,
    missingOro10dReviewRequestBoundaryFailFixture,
    runtimeReviewRequestSubmissionBlockedFixture,
    reviewDecisionIssuedBlockedFixture,
    signedRuntimeApprovalBlockedFixture,
    runtimeApprovalChainRolloverBlockedFixture,
    runtimeMountBlockedFixture,
    publicAliasBlockedFixture,
    liveExecutionBlockedFixture,
    externalCallBlockedFixture,
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
  validReviewRequestSubmissionGateFromOro10dFixture,
  missingOro10aPredecessorFailFixture,
  missingOro10bPredecessorFailFixture,
  missingOro10cPredecessorFailFixture,
  missingOro10dPredecessorFailFixture,
  missingOro10cEvidenceGateFailFixture,
  missingOro10dReviewRequestBoundaryFailFixture,
  runtimeReviewRequestSubmissionBlockedFixture,
  reviewDecisionIssuedBlockedFixture,
  signedRuntimeApprovalBlockedFixture,
  runtimeApprovalChainRolloverBlockedFixture,
  runtimeMountBlockedFixture,
  publicAliasBlockedFixture,
  liveExecutionBlockedFixture,
  externalCallBlockedFixture,
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
  buildOro10eApprovalChainRolloverReviewRequestSubmissionGateFixtures,
};
